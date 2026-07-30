/* ===========================================================================
   A11Y AUDIT — boots the REAL app in jsdom, walks every screen, runs axe-core
   on each, and prints a consolidated report.

   Why jsdom and not a real browser: same reason test-batch1.js uses it — no
   network, no Android Studio, runs in CI or a sandbox in two seconds. The
   trade-off is that jsdom has no layout engine, so axe's colour-contrast and
   target-size rules cannot run here; those are checked separately by
   scripts/a11y-contrast.js and by the manual TalkBack script.

   Run:  node scripts/a11y-audit.js
   Exit: 0 if no violations at or above the threshold, 1 otherwise.
   =========================================================================== */
const { JSDOM } = require('jsdom');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AXE  = require.resolve('axe-core', { paths: [process.env.AXE_PATH || '/tmp/a11y/node_modules', ROOT] });

// Fail the run on these impact levels. 'minor' is reported but not fatal.
const FATAL = new Set(['critical', 'serious', 'moderate']);

const inline = f => '<script>\n' + fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n</script>';
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .replace('<script src="activities.js"></script>', inline('activities.js'))
  .replace('<script src="supabase.js"></script>', '<script>window.supabase=undefined;</script>')
  .replace('<script src="store.js"></script>', inline('store.js'))
  .replace('<script src="app.js"></script>', inline('app.js'));

function bootApp(){
  return new Promise((resolve, reject)=>{
    const dom = new JSDOM(HTML, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      beforeParse(window){
        window.confirm  = () => true;
        window.scrollTo = () => {};
        window.HTMLMediaElement.prototype.play  = function(){ return Promise.resolve(); };
        window.HTMLMediaElement.prototype.pause = function(){};
        window.HTMLMediaElement.prototype.load  = function(){};
        const nodeCrypto = require('crypto');
        window.crypto = window.crypto || {};
        if(!window.crypto.randomUUID)     window.crypto.randomUUID = () => nodeCrypto.randomUUID();
        if(!window.crypto.getRandomValues) window.crypto.getRandomValues = a => nodeCrypto.randomFillSync(a);
      }
    });
    const w = dom.window;
    w.addEventListener('error', e => console.log('  [page error]', e.message));
    let tries = 0;
    const wait = setInterval(()=>{
      if(w.localStorage.getItem('teacherId') && typeof w.saveRecord === 'function'){
        clearInterval(wait); setTimeout(()=>resolve(dom), 150);
      } else if(++tries > 200){ clearInterval(wait); reject(new Error('boot timed out')); }
    }, 30);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Sign in with the pilot stub so the post-login screens are reachable. */
async function signIn(w){
  w.showLogin('none'); await sleep(60);
  const sel = w.document.getElementById('lg_school');
  const schoolId = sel && sel.options.length > 1
    ? [...sel.options].map(o=>o.value).find(v=>v && v !== '__other__')
    : 'sch_saksham_noida';
  if(sel){ sel.value = schoolId; if(typeof w.onSchoolPick === 'function') w.onSchoolPick(); }
  await sleep(60);
  const id = w.document.getElementById('lg_id'), pw = w.document.getElementById('lg_pw');
  if(id) id.value = 'saksham01';
  if(pw) pw.value = 'pilot';
  await w.handleLogin(schoolId);
  await sleep(200);
  // `Store` is a classic-script const — it never lands on window. Write the
  // welcome flag straight to localStorage instead (same backing store).
  w.localStorage.setItem('welcomeSeen', '1');
}

/* showActivity() bounces straight back to the child picker unless batchRoster
   is populated — that roster is what the record sheet is FOR, so a record
   screen genuinely cannot exist without it. Seed it the way the picker's Start
   button does, so the audit sees the real record screen and not the picker. */
async function ensureActiveChild(w){
  let profiles = w.eval('loadProfiles()');
  if(!profiles.length){
    await w.eval("upsertProfile({ id:'a11y-test-child', name:'Test Child', researchId:'OM-TEST-0001' })");
    profiles = w.eval('loadProfiles()');
  }
  if(!profiles.length) throw new Error('could not seed a child');
  await w.eval(`setActiveProfileId(${JSON.stringify(profiles[0].id)})`);
  w.eval(`batchRoster = [${JSON.stringify(profiles[0].id)}]`);
}

/* Every screen worth auditing, as [label, navigate-fn].
   ACTIVITY_DATA is a classic-script const, so it is NOT on window — reach it
   through w.eval, which runs in the same global lexical scope. */
function screens(w){
  const DATA = w.eval('ACTIVITY_DATA');
  const flat = [];
  DATA.forEach((cat, ci) => (cat.activities || []).forEach((a, ai) =>
    flat.push({ ci, ai, cat: cat.category, a })));

  const pick  = fn => flat.find(fn);
  const sound = pick(x => x.a.soundboard);
  const cmd   = pick(x => Array.isArray(x.a.commands) && x.a.commands.length);
  const group = pick(x => x.a.group);
  const plain = pick(x => !x.a.soundboard && !x.a.commands && !x.a.group);

  const list = [
    ['Login',               async ()=>w.showLogin('none')],
    ['Welcome',             async ()=>w.showWelcome('none')],
    ['Home',                async ()=>w.showHome('none')],
    ['Home + drawer',       async ()=>{ w.showHome('none'); await sleep(80); w.setMenuVisible(true); w.openMenu(); }],
    ['Activity categories', async ()=>w.showActivityList('none')],
    ['Students',            async ()=>w.showStudents('none')],
    ['Settings',            async ()=>w.showSettings('none')],
    ['FAQs',                async ()=>w.showFAQs('none')],
    ['About',               async ()=>w.showAbout('none')],
    ['Manage data',         async ()=>w.showManageData('none')],
  ];
  DATA.forEach((cat, ci) => list.push([`Category: ${cat.category}`, async ()=>w.showCategory(ci, 'none')]));
  if(plain){
    list.push(['Child picker',   async ()=>w.showChildPicker(plain.ci, plain.ai, 'none')]);
    list.push(['Record (plain)', async ()=>{ await ensureActiveChild(w); w.showActivity(plain.ci, plain.ai); }]);
  }
  if(sound) list.push(['Record + soundboard',    async ()=>{ await ensureActiveChild(w); w.showActivity(sound.ci, sound.ai); }]);
  if(cmd)   list.push(['Record + command board', async ()=>{ await ensureActiveChild(w); w.showActivity(cmd.ci, cmd.ai); }]);
  if(group) list.push(['Record (whole group)',   async ()=>w.showActivity(group.ci, group.ai)]);

  // Child detail — needs a seeded profile.
  list.push(['Child detail', async ()=>{
    const profiles = w.eval('loadProfiles()');
    if(profiles && profiles.length) w.showChildDetail(profiles[0].id, {});
    else throw new Error('no seeded profile');
  }]);
  return list;
}

(async ()=>{
  const dom = await bootApp();
  const w = dom.window;
  const axeSrc = fs.readFileSync(AXE, 'utf8');
  w.eval(axeSrc);

  await signIn(w);

  // Rules that cannot produce a meaningful result without a layout engine.
  const DISABLED = ['color-contrast', 'target-size', 'scrollable-region-focusable'];

  const all = [];
  for(const [label, go] of screens(w)){
    try { await go(); } catch(e){ console.log(`  [nav fail] ${label}: ${e.message}`); continue; }
    await sleep(120);
    let res;
    try {
      res = await w.axe.run(w.document, {
        resultTypes: ['violations'],
        rules: Object.fromEntries(DISABLED.map(r => [r, { enabled:false }])),
        runOnly: { type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'] }
      });
    } catch(e){ console.log(`  [axe fail] ${label}: ${e.message}`); continue; }
    res.violations.forEach(v => all.push({ screen: label, ...v }));
    const worst = res.violations.reduce((m,v)=>Math.max(m, ['minor','moderate','serious','critical'].indexOf(v.impact)), -1);
    const mark = res.violations.length === 0 ? 'CLEAN' : `${res.violations.length} issue(s)`;
    console.log(`${res.violations.length === 0 ? '  OK  ' : '  !!  '} ${label.padEnd(26)} ${mark}`);
  }

  console.log('\n' + '='.repeat(72));
  console.log('AXE VIOLATIONS BY RULE');
  console.log('='.repeat(72));
  const byRule = new Map();
  for(const v of all){
    if(!byRule.has(v.id)) byRule.set(v.id, { impact:v.impact, help:v.help, screens:new Set(), nodes:0, sample:null });
    const e = byRule.get(v.id);
    e.screens.add(v.screen); e.nodes += v.nodes.length;
    if(!e.sample && v.nodes[0]) e.sample = v.nodes[0].html.slice(0,140);
  }
  const order = ['critical','serious','moderate','minor'];
  const sorted = [...byRule.entries()].sort((a,b)=>order.indexOf(a[1].impact)-order.indexOf(b[1].impact));
  if(!sorted.length) console.log('  none');
  for(const [id, e] of sorted){
    console.log(`\n[${(e.impact||'n/a').toUpperCase()}] ${id} — ${e.nodes} node(s) across ${e.screens.size} screen(s)`);
    console.log(`   ${e.help}`);
    console.log(`   screens: ${[...e.screens].join(', ')}`);
    if(e.sample) console.log(`   e.g. ${e.sample}`);
  }

  const fatal = sorted.filter(([,e]) => FATAL.has(e.impact));
  console.log('\n' + '-'.repeat(72));
  console.log(`TOTAL: ${sorted.length} distinct rule(s) violated; ${fatal.length} at moderate+ impact.`);

  /* =========================================================================
     APP-SPECIFIC ASSERTIONS
     axe checks generic WCAG rules. These check the things that actually break
     THIS app for a blind teacher — the ones the 2026-07-28 pass fixed. They
     exist so a future session cannot quietly undo them.
     ========================================================================= */
  console.log('\n' + '='.repeat(72));
  console.log('A11Y REGRESSION ASSERTIONS');
  console.log('='.repeat(72));
  let pass = 0, fail = 0;
  const ok = (cond, label) => {
    if(cond){ pass++; console.log('  PASS  ' + label); }
    else    { fail++; console.log('  FAIL  ' + label); }
  };
  const D = w.document;

  // --- Screen-change announcement -----------------------------------------
  w.showStudents('none'); await sleep(120);
  ok(D.activeElement && D.activeElement.classList.contains('lede'),
     'navigation moves focus to the screen heading (Students)');
  const profiles = w.eval('loadProfiles()');
  if(profiles.length){
    w.showChildDetail(profiles[0].id, {}); await sleep(120);
    ok(D.activeElement && D.activeElement.classList.contains('lede'),
       'child detail has a focusable heading (was the one screen with none)');
    ok(/visually-hidden/.test(D.querySelector('.lede').className),
       'child-detail heading is screen-reader-only — the look is unchanged');
  } else {
    console.log('  SKIP  child-detail focus (no seeded profile in this run)');
  }

  // --- Decorative icons ----------------------------------------------------
  const ICONS = w.eval('ICON');
  const bareIcon = Object.entries(ICONS).filter(([,v]) => /<svg(?![^>]*aria-hidden)/.test(v));
  ok(bareIcon.length === 0,
     `every ICON glyph is aria-hidden (${Object.keys(ICONS).length} icons, ${bareIcon.length} bare)`);

  // --- Language tagging ----------------------------------------------------
  const LANGS = w.eval('AUDIO_LANGS');
  ok(LANGS.every(l => l.lang && l.name),
     'every narration language carries a BCP-47 tag and a Latin name');
  w.showSettings('none'); await sleep(120);
  const hi = D.querySelector('[lang^="hi"]');
  ok(!!hi, 'the Hindi button is tagged lang="hi-IN" (else a screen reader reads noise)');
  ok(hi && /hindi/i.test(hi.getAttribute('aria-label') || ''),
     'the Hindi button announces "Hindi" even with no Devanagari voice installed');

  // --- Display preferences -------------------------------------------------
  ok(!!D.getElementById('a11yContrast'), 'Settings exposes a High contrast control');
  ok(!!D.getElementById('a11yDark'),     'Settings exposes a Dark background control');
  ok(D.querySelectorAll('.seg[role="group"]').length >= 2,
     'Settings has both the text-size and narration-language groups');
  await w.setTextScale('1.5');
  ok(D.documentElement.style.getPropertyValue('--text-scale') === '1.5',
     'text scale writes --text-scale onto the root');
  await w.toggleContrast(true);
  ok(D.documentElement.getAttribute('data-contrast') === 'high',
     'high contrast sets data-contrast on the root');
  await w.toggleTheme(true);
  ok(D.documentElement.getAttribute('data-theme') === 'dark',
     'dark background sets data-theme on the root');
  await w.toggleContrast(false); await w.toggleTheme(false); await w.setTextScale('1');
  ok(!D.documentElement.hasAttribute('data-contrast') && !D.documentElement.hasAttribute('data-theme'),
     'both modes turn cleanly back off');

  // --- Modal background ----------------------------------------------------
  w.showHome('none'); await sleep(120);
  w.setMenuVisible(true); w.openMenu(); await sleep(120);
  ok(D.querySelector('body > main').hasAttribute('inert'),
     'opening the drawer makes the page behind inert (aria-modal alone is not enough)');
  w.closeMenu(true); await sleep(60);
  ok(!D.querySelector('body > main').hasAttribute('inert'),
     'closing the drawer releases inert');

  // --- Live regions must never interrupt drill audio ----------------------
  const cmd = (function(){
    const DATA = w.eval('ACTIVITY_DATA'); const out = [];
    DATA.forEach((c,ci)=>(c.activities||[]).forEach((a,ai)=>out.push({ci,ai,a})));
    return out.find(x => x.a.soundboard);
  })();
  if(cmd){
    await ensureActiveChild(w);
    w.showActivity(cmd.ci, cmd.ai); await sleep(200);
    const live = D.getElementById('sbLive');
    ok(live && live.getAttribute('aria-live') === 'polite',
       'soundboard announcements are polite — they must not talk over the sound being played');
    const seek = D.getElementById('sbProgress');
    ok(seek && seek.hasAttribute('aria-valuetext'),
       'the seek slider speaks a time, not a percentage');
  }

  // --- aria-label on roleless elements (SILENT KILLER) ---------------------
  // ARIA 1.2 prohibits aria-label on role=generic (a bare span/div). The label
  // is DROPPED. axe's aria-prohibited-attr only fires when the element has no
  // text content, so a span that still holds visible-but-aria-hidden children
  // sneaks through — and if we also hid the real content, the information is
  // gone entirely. This bit us on the record rows; sweep for it everywhere.
  const ROLELESS = new Set(['SPAN','DIV','P','SECTION','ARTICLE','LI','TD','EM','STRONG','SMALL']);
  const NAMEABLE_VIA_ROLE = el => el.hasAttribute('role');
  const sweepProhibited = (label) => {
    const bad = [...D.querySelectorAll('[aria-label]')].filter(el =>
      ROLELESS.has(el.tagName) && !NAMEABLE_VIA_ROLE(el) && !el.hasAttribute('aria-hidden'));
    if(bad.length) bad.forEach(el =>
      console.log(`          -> ${label}: <${el.tagName.toLowerCase()} class="${el.className}">`));
    return bad.length;
  };
  let prohibited = 0;
  for(const [label, go] of screens(w)){
    try { await go(); } catch(e){ continue; }
    await sleep(80);
    prohibited += sweepProhibited(label);
  }
  ok(prohibited === 0,
     'no aria-label sits on a roleless element (ARIA 1.2 drops it silently)');

  // --- Total blindness: position, size, and no visual-only dead ends -------
  // screens() keeps its picks local, so resolve our own here.
  const ALL = (function(){
    const DATA = w.eval('ACTIVITY_DATA'); const out = [];
    DATA.forEach((c,ci)=>(c.activities||[]).forEach((a,ai)=>out.push({ci,ai,a})));
    return out;
  })();
  const plain = ALL.find(x => !x.a.soundboard && !x.a.commands && !x.a.group);
  await ensureActiveChild(w);

  // These are the checks that separate "every control has a label" from "a
  // teacher who cannot see knows where they are". A sighted user reads the
  // SHAPE of a grid; a blind user only gets what we say out loud.
  w.showActivityList('none'); await sleep(150);
  const catGrid = D.querySelector('.cat-grid');
  ok(catGrid && catGrid.getAttribute('role') === 'group' && /categor/i.test(catGrid.getAttribute('aria-label')||''),
     'the category grid announces how many categories it holds');
  const firstCat = catGrid && catGrid.querySelector('button');
  ok(firstCat && /\b1 of \d+/.test(firstCat.getAttribute('aria-label')||''),
     'each category tile says its position ("category 1 of 6")');
  ok(firstCat && /activit/i.test(firstCat.getAttribute('aria-label')||''),
     'the count pill (a bare number on screen) is spoken as "N activities"');

  if(plain){
    w.showChildPicker(plain.ci, plain.ai, 'none'); await sleep(180);
    const grid = D.querySelector('.picker-grid');
    ok(grid && /student/i.test(grid.getAttribute('aria-label')||''),
       'the child picker announces how many students are in it');
    const tile = grid && grid.querySelector('.pick-tile');
    ok(tile && /\b1 of \d+/.test(tile.getAttribute('aria-label')||''),
       'each child tile says "name, student N of M"');
    ok(tile && tile.hasAttribute('aria-pressed'),
       'child tiles still report selected / not selected');
    const img = grid && grid.querySelector('img.face');
    ok(!img || img.getAttribute('alt') === '',
       'child photos stay alt="" — a described face is useless and a privacy leak');
  }

  // Saved records must read as one sentence, not five fragments. Seed one so
  // this is genuinely exercised rather than skipped on a clean install.
  const anyAct = ALL.find(x => x.a.soundboard) || plain;
  const seedProfile = w.eval('loadProfiles()')[0];
  await w.eval(`saveRecord(${JSON.stringify(anyAct.a.id)}, {
    profileId: ${JSON.stringify(seedProfile.id)},
    researchId: ${JSON.stringify(seedProfile.researchId || 'OM-TEST-0001')},
    values: { 'Steps': '8', 'Result': 'Got it' }
  })`);
  w.showActivity(anyAct.ci, anyAct.ai); await sleep(200);
  const summary = D.querySelector('.record > .visually-hidden');
  if(summary){
    ok(summary.textContent.includes('.') && /:/.test(summary.textContent),
       'a saved record reads as one composed sentence (REAL text, not aria-label)');
    ok(!D.querySelector('.record [aria-label]:not(button)'),
       'that sentence is not an aria-label on a roleless span (ARIA 1.2 would drop it)');
    ok(D.querySelector('.record .vals').getAttribute('aria-hidden') === 'true',
       'the value chips are not also read individually (no double-speaking)');
    const recDel = D.querySelector('.record .rec-del');
    ok(recDel && !/^Delete this result$/.test(recDel.getAttribute('aria-label')||''),
       'delete buttons name their own row (a column of identical labels is unusable)');
  } else {
    console.log('  SKIP  record read-back (no saved records in this run)');
  }

  // Silent demo video must be declared as such, not left as a dead end.
  const actWithVideo = ALL.find(x => x.a.videoFile && !x.a.group);
  if(actWithVideo){
    w.showActivity(actWithVideo.ci, actWithVideo.ai); await sleep(180);
    const sheet = D.querySelector('.ref-src');
    ok(sheet && /silent video/i.test(sheet.textContent),
       'the silent demo clip says it is silent and points at the written steps');
  }

  console.log(`\n  ========== ${pass} passed, ${fail} failed ==========`);
  console.log('\nNOTE: colour contrast and touch-target size cannot be measured');
  console.log('without a layout engine. Verify those, plus real TalkBack');
  console.log('behaviour, with docs/A11Y-TALKBACK-TESTS.md on a device.');

  dom.window.close();
  process.exit((fatal.length || fail) ? 1 : 0);
})().catch(e => { console.error('AUDIT ERROR:', e); process.exit(2); });
