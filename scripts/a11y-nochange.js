/* ===========================================================================
   NO-VISUAL-CHANGE PROOF — 2026-07-28.

   The accessibility pass had to touch styles.css. The design guardrails at the
   top of that file are emphatic that the default look is deliberate and easy to
   wreck, so "it should look the same" is not good enough. This checks it.

   Two things are verified:

   1. TOKEN PARITY. Every type and spacing token was converted px -> rem. This
      re-computes each one against a 16px root and asserts it lands on exactly
      the pixel value it had before. A typo of one 32nd would be invisible in
      review and obvious on a device.

   2. RULE SCOPE. Every selector in the appended accessibility block must be
      scoped — to a mode ([data-contrast], [data-theme], [data-text-scale]), to
      a focus state, or to a media query. An UNSCOPED selector in that block
      would apply at 1x in the default palette, which is exactly how the first
      version of the block quietly changed three things.

   Run: node scripts/a11y-nochange.js
   =========================================================================== */
const fs   = require('fs');
const path = require('path');
const CSS  = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');

let pass = 0, fail = 0;
const ok = (cond, label) => {
  if(cond){ pass++; console.log('  PASS  ' + label); }
  else    { fail++; console.log('  FAIL  ' + label); }
};

/* ---- 1. Token parity ------------------------------------------------------
   The px values these replaced, straight from the pre-conversion file. */
const EXPECTED_PX = {
  '--s1':8, '--s2':16, '--s3':24, '--s4':32, '--s5':48,
  '--t-display':38, '--t-title':18, '--t-body':17,
  '--t-bodysm':15, '--t-caption':13, '--t-micro':12,
};
console.log('\n1. TOKEN PARITY — rem values must equal the old px at a 16px root');
const root = (CSS.match(/:root\{([\s\S]*?)\n  \}/) || [,''])[1];
for(const [token, px] of Object.entries(EXPECTED_PX)){
  const m = root.match(new RegExp(token.replace('--','--') + '\\s*:\\s*([0-9.]+)rem'));
  if(!m){ ok(false, `${token} is declared in rem`); continue; }
  const computed = parseFloat(m[1]) * 16;
  ok(Math.abs(computed - px) < 0.001,
     `${token}  ${m[1]}rem = ${computed}px  (was ${px}px)`);
}
// The mobile override too.
const mob = CSS.match(/--t-display\s*:\s*([0-9.]+)rem;\s*\}?\s*\/\*\s*was 30px/);
ok(mob && Math.abs(parseFloat(mob[1])*16 - 30) < 0.001,
   `--t-display mobile override  ${mob ? mob[1] : '?'}rem = 30px`);

/* ---- 2. Rule scope -------------------------------------------------------- */
console.log('\n2. RULE SCOPE — nothing in the a11y block may apply at 1x default');
const marker = CSS.indexOf('ACCESSIBILITY BLOCK — added 2026-07-28');
ok(marker > -1, 'the accessibility block is present and findable');
// Start at the `/*` that OPENS the banner, not at the banner text — slicing
// mid-comment leaves an unterminated opener, so the comment stripper below
// misses it and its prose gets parsed as a selector.
const start = CSS.lastIndexOf('/*', marker);
const block = CSS.slice(start);

// Strip comments, then read every selector (text before each `{` that is not
// an at-rule or a declaration).
const clean = block.replace(/\/\*[\s\S]*?\*\//g, '');
const selectors = [];
for(const m of clean.matchAll(/(^|[};])\s*([^{};@]+?)\s*\{/g)){
  const sel = m[2].trim().replace(/\s+/g, ' ');
  if(sel && !sel.startsWith('@') && !/^[a-z-]+\s*:/.test(sel)) selectors.push(sel);
}

// A selector is safe if it is gated by a mode, a focus state, or lives inside
// a media query (the reduced-motion backstop).
const SAFE = /\[data-contrast|\[data-theme|\[data-text-scale|:focus/;
const mediaBodies = [...clean.matchAll(/@media[^{]*\{([\s\S]*?)\n  \}/g)].map(m=>m[1]).join('\n');
const unscoped = selectors.filter(s => !SAFE.test(s) && !mediaBodies.includes(s));

ok(selectors.length > 0, `parsed ${selectors.length} selectors out of the block`);
ok(unscoped.length === 0,
   unscoped.length === 0
     ? 'every rule is gated by a mode, a focus state, or a media query'
     : `${unscoped.length} UNSCOPED rule(s) would change the default look`);
for(const s of unscoped) console.log(`          -> ${s}`);

/* ---- 3. The specific regressions from the first pass ---------------------- */
console.log('\n3. THE THREE RULES THAT CHANGED THE 1x DESIGN — must stay gated');
const REGRESSIONS = [
  [/(^|[};])\s*\.linklike\s*\{[^}]*min-height/m, '.linklike is not force-sized inline (broke mid-sentence links)'],
  [/(^|[};])\s*button\s*,[^{]*\{[^}]*min-height:\s*44px/m, 'no blanket button{min-height:44px} (would raise .sb-tab from 40px)'],
  [/(^|[};])\s*\.rowbtn\s*,\s*\.action-row/m, '.action-row alignment is not changed globally'],
];
for(const [re, label] of REGRESSIONS) ok(!re.test(clean), label);

/* ---- 4. Insertions must be layout-neutral --------------------------------
   The a11y work adds screen-reader-only text INSIDE existing components
   (records, review rows, batch card heads). That is only safe because
   .visually-hidden is position:absolute and therefore out of flow — in a flex
   row like .sumrow, an in-flow extra child would break the layout. It already
   did once: wrapping the avatar/name/result to aria-hide them together made
   them a single flex child and collapsed the row. */
console.log('\n4. LAYOUT-NEUTRAL INSERTIONS');
const vh = CSS.match(/\.visually-hidden\{([^}]*)\}/);
ok(!!vh && /position:\s*absolute/.test(vh[1]),
   '.visually-hidden is position:absolute, so inserting it never moves anything');
ok(!!vh && /(width:\s*1px|clip)/.test(vh[1]),
   '.visually-hidden is clipped rather than display:none (display:none is unreadable)');

/* ---- 5. Elements retagged for a11y must reset their new defaults --------- */
console.log('\n5. RETAGGED ELEMENTS RESET BROWSER DEFAULTS');
// .bcard-head became an <h2> so batchShow() can focus and announce it. A bare
// h2 brings 1.5em / bold / 0.83em margins with it.
const bh = CSS.match(/\.bcard-head\{([^}]*)\}/);
ok(!!bh && /margin:\s*0/.test(bh[1]),
   '.bcard-head (now an h2) resets the browser default margin');
ok(!!bh && /font-size:\s*inherit/.test(bh[1]),
   '.bcard-head resets the browser default h2 font-size');

console.log(`\n  ========== ${pass} passed, ${fail} failed ==========`);
if(!fail) console.log('  At --text-scale:1 with no mode attributes, the default look is unchanged.');
process.exit(fail ? 1 : 0);
