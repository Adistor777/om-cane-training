/* ===========================================================================
   CONTRAST CHECK — reads the palettes straight out of styles.css and computes
   real WCAG 2.x contrast ratios for every text/background pair the app can
   actually render.

   Why a script and not a spreadsheet: guardrail #5 in styles.css says "every
   category pair and every text/bg pair meets WCAG AA — re-check any colour
   change at 12px before shipping". That instruction was only as good as
   whoever remembered it. This makes it a command.

   jsdom has no layout engine, so axe-core cannot run its colour-contrast rule
   (scripts/a11y-audit.js disables it). This covers that gap.

   Run:  node scripts/a11y-contrast.js
   Exit: 0 if every pair clears its threshold, 1 otherwise.
   =========================================================================== */
const fs   = require('fs');
const path = require('path');
const CSS  = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');

/* ---- colour maths (WCAG 2.x relative luminance) --------------------------- */
function hex(c){
  c = c.trim().replace('#','');
  if(c.length === 3) c = c.split('').map(x=>x+x).join('');
  return [0,2,4].map(i => parseInt(c.slice(i,i+2), 16));
}
function lum([r,g,b]){
  const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
  return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
}
function ratio(a, b){
  const [l1, l2] = [lum(hex(a)), lum(hex(b))].sort((x,y)=>y-x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/* ---- pull a --token:#value map out of one CSS block ----------------------- */
function palette(selector){
  // Match the block, then harvest every custom property inside it.
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\s*\\{([\\s\\S]*?)\\n\\s*\\}');
  const m  = CSS.match(re);
  if(!m) return null;
  const out = {};
  for(const [, k, v] of m[1].matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/g)) out[k] = v;
  return out;
}

/* Pairs that must hold in EVERY mode. `min` follows WCAG 2.2:
     4.5  normal text (AA)
     3.0  large text (>=24px, or >=18.66px bold) and UI component boundaries
   --ink-faint is listed at 4.5 deliberately — guardrail #5 notes it is used
   down at 12px, where the large-text allowance does not apply. */
const PAIRS = [
  ['--ink',       '--paper', 4.5, 'body text on the page'],
  ['--ink',       '--card',  4.5, 'body text on a card'],
  ['--ink-soft',  '--paper', 4.5, 'secondary text on the page'],
  ['--ink-soft',  '--card',  4.5, 'secondary text on a card'],
  ['--ink-faint', '--paper', 4.5, 'faint text on the page (used at 12px)'],
  ['--ink-faint', '--card',  4.5, 'faint text on a card (used at 12px)'],
  ['--cat',       '--paper', 3.0, 'category accent on the page (UI boundary)'],
  ['--cat',       '--card',  3.0, 'category accent on a card (UI boundary)'],
  ['--cat-deep',  '--cat-soft', 4.5, 'deep category text on its own tint'],
  // ADVISORY in the default palette: these hairlines separate a card from the
  // page that ALREADY differs in tone, so WCAG 1.4.11 does not require 3:1 of
  // them. Reported anyway because for reduced contrast sensitivity they are
  // effectively invisible — which is exactly what high-contrast mode fixes,
  // and there the same pair is required to pass.
  ['--line',      '--paper', 3.0, 'hairline against the page', 'advisory-in-default'],
  // The record-form colour code: each "deep" ink on its own tint.
  ['--code-count-deep', '--code-count-bg', 4.5, 'count field (amber)'],
  ['--code-judge-deep', '--code-judge-bg', 4.5, 'judgement field (green)'],
  ['--code-notes-deep', '--code-notes-bg', 4.5, 'notes field (blue)'],
  ['--code-video-deep', '--code-video-bg', 4.5, 'video field (plum)'],
];

// Raw CSS selectors — palette() escapes them for the regex itself.
const MODES = [
  ['DEFAULT (warm paper)', ':root',                                   true ],
  ['HIGH CONTRAST',        '[data-contrast="high"]',                  false],
  ['DARK',                 '[data-theme="dark"]',                     false],
  ['DARK + HIGH CONTRAST', '[data-theme="dark"][data-contrast="high"]', false],
];

let pass = 0, fail = 0, skipped = 0;
// Later modes only override some tokens; unset ones fall back to the base.
const base = palette(':root') || {};
const dark = palette('[data-theme="dark"]') || {};
let advisories = 0;

for(const [name, sel, isDefault] of MODES){
  const own = palette(sel);
  if(!own){ console.log(`\n${name}: block not found — SKIPPED`); skipped++; continue; }
  // Cascade: base -> (dark, if this is a dark variant) -> this block.
  const p = Object.assign({}, base, sel.includes('data-theme') ? dark : {}, own);
  console.log(`\n${'='.repeat(66)}\n${name}\n${'='.repeat(66)}`);
  for(const [fg, bg, min, label, flag] of PAIRS){
    if(!p[fg] || !p[bg]){ console.log(`  SKIP  ${label} (token missing)`); skipped++; continue; }
    const r = ratio(p[fg], p[bg]);
    const good = r >= min;
    const soft = !good && flag === 'advisory-in-default' && isDefault;
    if(good) pass++; else if(soft) advisories++; else fail++;
    const mark = good ? 'PASS' : soft ? 'NOTE' : 'FAIL';
    console.log(`  ${mark}  ${r.toFixed(2).padStart(6)}:1  (min ${min.toFixed(1)})  ${label}`
              + `  ${p[fg]} on ${p[bg]}`);
  }
}

console.log(`\n${'-'.repeat(66)}`);
console.log(`${pass} passed · ${fail} failed · ${advisories} advisory · ${skipped} skipped`);
if(advisories) console.log('Advisory = below the bar but not a WCAG failure in that mode.\nHigh-contrast mode is the remedy; see the note beside the pair.');
if(fail) console.log('\nA failing pair means someone lightened a colour without re-checking.\nFix the token in styles.css — do not lower the threshold.');
process.exit(fail ? 1 : 0);
