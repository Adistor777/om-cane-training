/* ===========================================================================
   SMOKE TEST — click everything, catch anything that throws.

   Why this matters more for a blind user than a sighted one: a JS exception in
   this app is silent. No crash dialog, no error message — the screen simply
   stops responding to a control. A sighted teacher sees nothing happen and taps
   again or navigates away. A teacher using a screen reader has no way to tell
   the difference between "that button did nothing" and "I misheard which
   button I was on", and can lose several minutes to it.

   So: walk every screen, activate every button that is safe to activate, and
   fail loudly on any thrown error or unhandled rejection.

   Destructive controls (delete, clear all data, sign out, export) are listed
   and skipped by handler name — the point is to find crashes, not to wipe the
   fixture mid-run.

   Run: node scripts/a11y-smoke.js
   =========================================================================== */
const { JSDOM, VirtualConsole } = require('jsdom');
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const inline = f => '<script>\n' + fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n</script>';
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .replace('<script src="activities.js"></script>', inline('activities.js'))
  .replace('<script src="supabase.js"></script>', '<script>window.supabase=undefined;</script>')
  .replace('<script src="store.js"></script>', inline('store.js'))
  .replace('<script src="app.js"></script>', inline('app.js'));

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Anything that deletes, exports, signs out, or opens a native picker.
const SKIP = /confirmDelete|clearAllData|handleLogout|exportCSV|deleteRecord|deleteProfile|handleVideoPick|viewConsentPhoto|resetTips|removeChild|withdrawConsent/i;

const errors = [];

(async ()=>{
  // Without this, an exception thrown inside a click handler propagates out of
  // jsdom and kills the whole process — so the FIRST error hides every one
  // after it. Capture them instead and keep walking.
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.message || e)));
  vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

  const dom = await new Promise((resolve, reject)=>{
    const d = new JSDOM(HTML, { url:'http://localhost/', runScripts:'dangerously', pretendToBeVisual:true, virtualConsole: vc,
      beforeParse(w){
        w.confirm = () => true; w.scrollTo = () => {};
        w.HTMLElement.prototype.scrollIntoView = function(){};
        w.HTMLMediaElement.prototype.play  = function(){ return Promise.resolve(); };
        w.HTMLMediaElement.prototype.pause = function(){};
        w.HTMLMediaElement.prototype.load  = function(){};
        const c = require('crypto');
        w.crypto = w.crypto || {};
        if(!w.crypto.randomUUID) w.crypto.randomUUID = () => c.randomUUID();
      }});
    const w = d.window;
    // Everything that could go wrong, captured rather than swallowed.
    w.addEventListener('error', e => errors.push('window.error: ' + (e.message || e.error)));
    w.addEventListener('unhandledrejection', e =>
      errors.push('unhandled rejection: ' + (e.reason && (e.reason.stack || e.reason.message || e.reason))));
    let n = 0;
    const t = setInterval(()=>{
      if(w.localStorage.getItem('teacherId') && typeof w.saveRecord === 'function'){
        clearInterval(t); setTimeout(()=>resolve(d), 200);
      } else if(++n > 200){ clearInterval(t); reject(new Error('boot timed out')); }
    }, 30);
  });

  const w = dom.window, D = w.document;
  console.log(`\nboot: ${errors.length ? errors.length + ' ERROR(S)' : 'clean'}`);

  // Sign in.
  w.showLogin('none'); await sleep(100);
  const sel = D.getElementById('lg_school');
  const schoolId = [...sel.options].map(o=>o.value).find(v=>v && v!=='__other__');
  sel.value = schoolId; w.onSchoolPick(schoolId); await sleep(150);
  D.getElementById('lg_id').value = 'saksham01';
  D.getElementById('lg_pw').value = 'pilot';
  await w.handleLogin(schoolId); await sleep(300);
  w.localStorage.setItem('welcomeSeen','1');

  // Fixture: three children so the batch flow is real.
  let profs = w.eval('loadProfiles()');
  for(const n of ['Smoke A','Smoke B','Smoke C']){
    if(!profs.some(p=>p.name === n)){
      await w.eval(`upsertProfile({ id:'smoke-${n.replace(/\W/g,'')}', name:'${n}', researchId:'OM-SMOKE-${n.slice(-1)}' })`);
    }
  }
  profs = w.eval('loadProfiles()');
  await w.eval(`setActiveProfileId(${JSON.stringify(profs[0].id)})`);

  const DATA = w.eval('ACTIVITY_DATA');
  const flat = [];
  DATA.forEach((c,ci)=>(c.activities||[]).forEach((a,ai)=>flat.push({ci,ai,a,cat:c.category})));

  /* ---- every screen, every safe button ---------------------------------- */
  const screens = [
    ['Home',        ()=>w.showHome('none')],
    ['Activities',  ()=>w.showActivityList('none')],
    ['Students',    ()=>w.showStudents('none')],
    ['Settings',    ()=>w.showSettings('none')],
    ['FAQs',        ()=>w.showFAQs('none')],
    ['About',       ()=>w.showAbout('none')],
    ['Manage data', ()=>w.showManageData('none')],
    ...DATA.map((c,ci)=>[`Category: ${c.category}`, ()=>w.showCategory(ci,'none')]),
    ...flat.map(x=>[`Record: ${x.a.name}`, ()=>{
      w.eval(`batchRoster = ${JSON.stringify([profs[0].id])}`);
      w.showActivity(x.ci, x.ai);
    }]),
    ...flat.filter(x=>!x.a.group).slice(0,3).map(x=>[`Picker: ${x.a.name}`, ()=>w.showChildPicker(x.ci,x.ai,'none')]),
    ['Child detail', ()=>w.showChildDetail(profs[0].id, {})],
  ];

  let clicked = 0, skipped = 0;
  for(const [label, go] of screens){
    const before = errors.length;
    try { go(); } catch(e){ errors.push(`nav ${label}: ${e.message}`); continue; }
    await sleep(140);

    // Re-query by INDEX each time: a click can re-render the screen, and every
    // reference captured beforehand is then detached. Clicking a detached node
    // produces errors that belong to the harness, not the app.
    const count = D.querySelectorAll('#screen button, #screen summary, #screen [role="tab"]').length;
    for(let i = 0; i < count; i++){
      const list = D.querySelectorAll('#screen button, #screen summary, #screen [role="tab"]');
      const b = list[i];
      if(!b || !D.contains(b)) continue;
      const handler = (b.getAttribute('onclick') || '') + (b.getAttribute('onchange') || '');
      if(SKIP.test(handler)){ skipped++; continue; }
      try { b.click(); clicked++; } catch(e){ errors.push(`${label} -> ${handler.slice(0,60)}: ${e.message}`); }
      await sleep(12);
      // If that click navigated away, go back before continuing the list.
      if(!D.contains(b)){ try { go(); } catch(_){} await sleep(90); }
    }
    // Re-render, in case a click navigated away mid-list.
    try { go(); } catch(_){}
    await sleep(60);
    const added = errors.length - before;
    console.log(`  ${added ? '!!' : 'OK'}  ${label.padEnd(34)} ${added ? added + ' error(s)' : ''}`);
  }

  /* ---- the batch flow, driven properly ---------------------------------- */
  console.log('\nbatch flow');
  const solo = flat.find(x=>!x.a.group);
  w.eval(`batchRoster = ${JSON.stringify(profs.slice(0,3).map(p=>p.id))}`);
  w.showActivity(solo.ci, solo.ai); await sleep(250);
  const before = errors.length;
  try {
    w.batchShow(0); await sleep(80);
    w.batchAdvance(); await sleep(80);
    w.batchAdvance(); await sleep(80);
    w.batchReview(); await sleep(120);
    w.batchShow(1); await sleep(80);   // "Edit" from the review
    w.batchReview(); await sleep(120);
  } catch(e){ errors.push('batch flow: ' + e.message); }
  console.log(`  ${errors.length > before ? '!!' : 'OK'}  advance / review / edit round trip`);

  /* ---- display modes, toggled repeatedly -------------------------------- */
  console.log('\ndisplay modes');
  const b2 = errors.length;
  try {
    for(const s of ['1','1.25','1.5','2','1']) await w.setTextScale(s);
    await w.toggleContrast(true); await w.toggleTheme(true);
    await w.toggleContrast(false); await w.toggleTheme(false);
  } catch(e){ errors.push('display prefs: ' + e.message); }
  console.log(`  ${errors.length > b2 ? '!!' : 'OK'}  every text scale + both modes on and off`);

  await sleep(400); // let any late rejection surface

  console.log(`\n${'-'.repeat(64)}`);
  console.log(`activated ${clicked} controls · skipped ${skipped} destructive/native ones`);
  if(errors.length){
    console.log(`\n${errors.length} ERROR(S) — a blind user would experience each of these as`);
    console.log('a control that silently does nothing:\n');
    [...new Set(errors)].forEach(e => console.log('  · ' + e));
  } else {
    console.log('NO ERRORS. Nothing throws on any screen or in any flow.');
  }
  dom.window.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('SMOKE ERROR:', e); process.exit(2); });
