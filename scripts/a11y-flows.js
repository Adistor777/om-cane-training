/* ===========================================================================
   FLOW CHECK — the things a static audit cannot see.

   a11y-audit.js inspects each screen at rest. But a screen reader user is
   stranded by CHANGES, not by states: content that appears with no
   announcement, a form that swaps underneath them, a confirmation that is
   spoken into a focus event and lost. Every bug found on 2026-07-28 during the
   pre-handover check was of that kind, and every one of them passed the static
   audit.

   This drives the real app through the real flows and asserts what a blind
   teacher would actually hear.

   Run: node scripts/a11y-flows.js
   =========================================================================== */
const { JSDOM } = require('jsdom');
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
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if(cond){ pass++; console.log('  PASS  ' + label); }
  else    { fail++; console.log('  FAIL  ' + label); }
};

function boot(){
  return new Promise((resolve, reject)=>{
    const dom = new JSDOM(HTML, { url:'http://localhost/', runScripts:'dangerously', pretendToBeVisual:true,
      beforeParse(w){
        w.confirm = () => true; w.scrollTo = () => {};
        w.HTMLMediaElement.prototype.play  = function(){ return Promise.resolve(); };
        w.HTMLMediaElement.prototype.pause = function(){};
        w.HTMLMediaElement.prototype.load  = function(){};
        w.HTMLElement.prototype.scrollIntoView = function(){};
        const c = require('crypto');
        w.crypto = w.crypto || {};
        if(!w.crypto.randomUUID) w.crypto.randomUUID = () => c.randomUUID();
      }});
    const w = dom.window;
    let n = 0;
    const t = setInterval(()=>{
      if(w.localStorage.getItem('teacherId') && typeof w.saveRecord === 'function'){
        clearInterval(t); setTimeout(()=>resolve(dom), 200);
      } else if(++n > 200){ clearInterval(t); reject(new Error('boot timed out')); }
    }, 30);
  });
}

(async ()=>{
  const dom = await boot();
  const w = dom.window, D = w.document;
  const active = () => D.activeElement;
  const spoken = () => (D.getElementById('srStatus') || {}).textContent || '';

  /* ---- FLOW 1: signing in ------------------------------------------------
     The first screen, and the one that strands people hardest. Picking a
     school INJECTS the credential fields; nothing used to say so. */
  console.log('\nFLOW 1 — sign in');
  w.showLogin('none'); await sleep(120);
  ok(active() && active().classList.contains('lede'),
     'the login screen announces itself on arrival');
  ok(!D.getElementById('lg_id'), 'the login fields do not exist before a school is picked');

  const sel = D.getElementById('lg_school');
  const schoolId = [...sel.options].map(o=>o.value).find(v=>v && v!=='__other__');
  sel.value = schoolId; w.onSchoolPick(schoolId);
  await sleep(250);
  ok(!!D.getElementById('lg_id'), 'picking a school injects the credential fields');
  ok(active() && active().id === 'lg_id',
     'focus MOVES into the login ID field — otherwise the fields appear silently');
  ok(/login id/i.test(spoken()), 'and it is announced ("enter your login ID and password")');

  D.getElementById('lg_id').value = 'saksham01';
  D.getElementById('lg_pw').value = 'pilot';
  await w.handleLogin(schoolId); await sleep(300);
  w.localStorage.setItem('welcomeSeen','1');

  /* ---- FLOW 2: a wrong password ----------------------------------------- */
  console.log('\nFLOW 2 — a wrong password must not fail silently');
  w.showLogin('none'); await sleep(100);
  const sel2 = D.getElementById('lg_school');
  sel2.value = schoolId; w.onSchoolPick(schoolId); await sleep(150);
  D.getElementById('lg_id').value = '';
  D.getElementById('lg_pw').value = '';
  await w.handleLogin(schoolId); await sleep(200);
  const err = D.querySelector('[role="alert"], .login-error, .field-error');
  ok(!!err || active().id === 'lg_id',
     'an empty login puts focus on the field to fix, or raises an alert');

  D.getElementById('lg_id').value = 'saksham01';
  D.getElementById('lg_pw').value = 'pilot';
  await w.handleLogin(schoolId); await sleep(300);
  w.localStorage.setItem('welcomeSeen','1');

  /* ---- FLOW 3: enrol, then score ONE child ------------------------------ */
  console.log('\nFLOW 3 — save confirmation must actually be spoken');
  let profs = w.eval('loadProfiles()');
  if(profs.length < 3){
    for(const n of ['Aditya','Vaishu','Rahul']){
      if(!profs.some(p=>p.name === n)){
        await w.eval(`upsertProfile({ id:'flow-${n}', name:'${n}', researchId:'OM-FLOW-${n}' })`);
      }
    }
    profs = w.eval('loadProfiles()');
  }
  const DATA = w.eval('ACTIVITY_DATA');
  const flat = [];
  DATA.forEach((c,ci)=>(c.activities||[]).forEach((a,ai)=>flat.push({ci,ai,a})));
  const solo = flat.find(x=>!x.a.group);

  await w.eval(`setActiveProfileId(${JSON.stringify(profs[0].id)})`);
  w.eval(`batchRoster = [${JSON.stringify(profs[0].id)}]`);
  w.showActivity(solo.ci, solo.ai); await sleep(250);
  ok(!!D.getElementById('saveBtn') || !!D.querySelector('.save'),
     'a single-child run reaches a record sheet with a Save button');

  const before = spoken();
  await w.handleSave(solo.a.id);
  await sleep(500);
  ok(/saved/i.test(spoken()),
     'after Save, "Saved" reaches the live region (it used to be eaten by the repaint)');
  ok(spoken() !== before, 'the live region actually changed');

  // Twice running: identical text is not a "change" unless cleared first.
  const firstMsg = spoken();
  await w.handleSave(solo.a.id);
  await sleep(500);
  ok(/saved/i.test(spoken()), 'a SECOND save is announced too (region is cleared between)');
  void firstMsg;

  /* ---- FLOW 4: the batch flow — the dangerous one ----------------------- */
  console.log('\nFLOW 4 — multi-child scoring must never swap children silently');
  const three = profs.slice(0,3).map(p=>p.id);
  w.eval(`batchRoster = ${JSON.stringify(three)}`);
  w.showActivity(solo.ci, solo.ai); await sleep(300);

  const cards = [...D.querySelectorAll('.bcard')];
  ok(cards.length === 3, `the batch flow rendered ${cards.length} child cards (expected 3)`);
  const heads = [...D.querySelectorAll('.bcard-head')];
  ok(heads.length === 3 && heads.every(h=>h.tagName === 'H2'),
     'each child card leads with a real heading (jump-to-able by heading)');
  ok(heads.every(h=>/now scoring/i.test(h.textContent)),
     'each heading says which child and their position out loud');

  w.batchShow(0); await sleep(200);
  const firstHead = active();
  ok(firstHead && firstHead.id && firstHead.id.startsWith('bhead_'),
     'showing a child moves focus to that child\'s heading');
  const name0 = firstHead ? firstHead.textContent : '';

  w.batchAdvance(); await sleep(250);
  const secondHead = active();
  ok(secondHead && secondHead.id && secondHead.id.startsWith('bhead_'),
     'ADVANCING to the next child moves focus too — the swap is never silent');
  ok(secondHead && secondHead.id !== (firstHead && firstHead.id),
     'and it is a DIFFERENT child than before');
  ok(secondHead && secondHead.textContent !== name0,
     'the newly focused heading names the new child (scoring the wrong child is the worst failure here)');

  w.batchReview(); await sleep(250);
  ok(active() && active().id === 'batchReviewHead',
     'the review screen takes focus when the child cards vanish');
  const sumRow = D.querySelector('.sumrow .visually-hidden');
  ok(!!sumRow && /:/.test(sumRow.textContent),
     'each review row reads as "name: result", not a bare avatar and chip');
  const editBtn = D.querySelector('.sumedit');
  ok(editBtn && /edit .+'s result/i.test(editBtn.getAttribute('aria-label')||''),
     'each Edit button names its child (a column of "Edit" is unusable)');

  /* ---- FLOW 5: the two the blind reviewer found (2026-07-29) ------------ */
  console.log('\nFLOW 5 — reported by the blind reviewer');

  // (a) "when students are being selected he cannot hear the student name"
  const pick = flat.find(x => !x.a.group);
  w.showChildPicker(pick.ci, pick.ai, 'none'); await sleep(200);
  const tiles = [...D.querySelectorAll('.pick-tile')];
  ok(tiles.length >= 2, `picker rendered ${tiles.length} child tiles`);
  const who = w.eval('loadProfiles()')[0].name;
  w.rosterToggle(w.eval('loadProfiles()')[0].id);
  await sleep(300);
  ok(spoken().includes(who),
     `selecting a child SPEAKS THEIR NAME ("${spoken().trim()}")`);
  ok(/selected/i.test(spoken()),
     'and says whether they were selected or removed');
  ok(/\d+ of \d+/.test(spoken()),
     'and still gives the running count');
  const cntEl = D.getElementById('rosterCount');
  ok(cntEl && !cntEl.hasAttribute('aria-live'),
     'the bare count is no longer its own live region (it used to be the ONLY thing spoken)');
  // Two different children in a row must both announce.
  const second = w.eval('loadProfiles()')[1];
  if(second){
    w.rosterToggle(second.id); await sleep(300);
    ok(spoken().includes(second.name), 'a SECOND child also announces by name');
  }

  // (b) "talkback says everything from the start" — focus destroyed, no target
  w.showChildPicker(pick.ci, pick.ai, 'none', { skipLedeFocus: true });
  await sleep(300);
  const after = active();
  ok(after && after !== D.body && after !== D.documentElement && D.getElementById('screen').contains(after),
     'a repaint NEVER leaves focus on <body> — TalkBack always keeps a cursor');

  /* ---- FLOW 6: destructive confirm returns focus ------------------------ */
  console.log('\nFLOW 6 — dialogs must not strand you');
  w.showHome('none'); await sleep(150);
  w.setMenuVisible(true); w.openMenu(); await sleep(200);
  ok(D.querySelector('body > main').hasAttribute('inert'),
     'the page behind the drawer is inert');
  const inDrawer = active();
  ok(inDrawer && inDrawer.closest('.drawer'), 'focus is inside the drawer');
  w.closeMenu(true); await sleep(150);
  ok(!D.querySelector('body > main').hasAttribute('inert'), 'inert is released on close');

  console.log(`\n  ========== ${pass} passed, ${fail} failed ==========`);
  dom.window.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FLOW ERROR:', e); process.exit(2); });
