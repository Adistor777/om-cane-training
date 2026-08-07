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

  /* ---- FLOW 6: stopping a sound ----------------------------------------
     Reported 2026-07-29: "difficulty pausing the sounds". The pad is the only
     control the teacher is already on when a sound starts; everything else is
     a long swipe away. */
  console.log('\nFLOW 6 — a playing sound must be stoppable from the pad');
  const snd = flat.find(x => x.a.soundboard);
  if(snd){
    await w.eval(`batchRoster = ${JSON.stringify([profs[0].id])}`);
    w.showActivity(snd.ci, snd.ai); await sleep(300);
    const pads = [...D.querySelectorAll('.sb-pad')];
    ok(pads.length > 0, `sound library rendered ${pads.length} pads`);

    // Play/Pause must be the FIRST transport control in reading order.
    const transport = [...D.querySelectorAll('.sb-transport .sb-tbtn')];
    ok(transport.length && transport[0].id === 'sbPlay',
       'Play/Pause is the first transport control in DOM order (was third)');

    // Tap a pad: it plays, and its own label flips to Stop.
    w.eval('SB.playIdx(0)'); await sleep(200);
    ok(w.eval('SB.playing') === true, 'tapping a pad starts the sound');
    ok(/^Stop /.test(pads[0].getAttribute('aria-label') || ''),
       `the playing pad renames itself to Stop ("${pads[0].getAttribute('aria-label')}")`);

    // Tap the SAME pad: it stops. It used to restart from zero.
    w.eval('SB.playIdx(0)'); await sleep(200);
    ok(w.eval('SB.playing') === false,
       'tapping the SAME pad again STOPS it (it used to restart from zero)');
    ok(/^Play /.test(pads[0].getAttribute('aria-label') || ''),
       'and the pad goes back to saying Play');
    ok(/stopped/i.test(w.document.getElementById('sbLive').textContent || ''),
       'stopping is announced by name');

    // A different pad while one plays still switches, rather than stopping.
    if(pads.length > 1){
      w.eval('SB.playIdx(0)'); await sleep(150);
      w.eval('SB.playIdx(1)'); await sleep(150);
      ok(w.eval('SB.playing') === true && w.eval('SB.idx') === 1,
         'tapping a DIFFERENT pad switches to it — only the same pad toggles');
    }

    /* THE SIGHTED WORKFLOW — confirmed with Aditya 2026-07-29: teachers play
       Dog, let it FINISH, then tap Dog again to replay. They never tap a pad
       mid-playback (they use the transport button for that). So the toggle
       must not touch this path: once a sound has ended, a tap plays it again,
       exactly as it always did. This is the assertion that says the pad-toggle
       costs sighted users nothing. */
    w.eval('SB.repeat = "off"');
    w.eval('SB.playIdx(0)'); await sleep(150);
    ok(w.eval('SB.playing') === true, 'sighted flow: tap plays');
    w.eval('SB._onEnded()'); await sleep(120);
    ok(w.eval('SB.playing') === false, 'sound finishes on its own');
    ok(/^Play /.test(pads[0].getAttribute('aria-label') || ''),
       'the finished pad says Play again, not Stop');
    w.eval('SB.playIdx(0)'); await sleep(150);
    ok(w.eval('SB.playing') === true,
       'tapping the SAME pad AFTER it finished replays it — the sighted workflow is untouched');

    // Repeat-one is the mode with no natural end; it must say so.
    // 300ms, not 120: SB._announce now goes through srSpeak, which clears the
    // region and writes 150ms later so the change always registers as a change.
    w.eval("SB.repeat='all'; SB.cycleRepeat()"); await sleep(300);
    ok(/loop/i.test(w.document.getElementById('sbLive').textContent || ''),
       'repeat-one warns that the sound will loop until stopped');
  } else {
    console.log('  SKIP  sound library (no soundboard activity found)');
  }

  /* ---- FLOW 7: destructive confirm returns focus ------------------------ */
  console.log('\nFLOW 7 — dialogs must not strand you');
  w.showHome('none'); await sleep(150);
  w.setMenuVisible(true); w.openMenu(); await sleep(200);
  ok(D.querySelector('body > main').hasAttribute('inert'),
     'the page behind the drawer is inert');
  const inDrawer = active();
  ok(inDrawer && inDrawer.closest('.drawer'), 'focus is inside the drawer');
  w.closeMenu(true); await sleep(150);
  ok(!D.querySelector('body > main').hasAttribute('inert'), 'inert is released on close');

  /* ---- FLOW 8: a submit must not steal the screen reader cursor ----------
     Reported 2026-07-30, blind reviewer round 2: "after moving from the login
     page the talkback still says the details about the sign in page."

     Cause: the double-tap guard was `btn.disabled = true` on the button the
     teacher had just activated. Disabling a focused element blurs it, focus
     falls to <body>, the screen reader loses its cursor, and TalkBack's
     recovery is to read the window from the top — which at that instant is
     still the sign-in screen. handleLogin held that state across two awaits
     before showHub painted, so there was ample time to hear it.

     These assertions pin the MECHANISM, not the symptom: if anyone reaches for
     .disabled in a handler again, this fails. */
  console.log('\nFLOW 8 — a submit must not drop focus to <body>');
  w.showLogin('none'); await sleep(140);
  const sel8 = D.getElementById('lg_school');
  sel8.value = schoolId; w.onSchoolPick(schoolId); await sleep(220);
  D.getElementById('lg_id').value = 'saksham01';
  D.getElementById('lg_pw').value = 'pilot';

  /* IMPORTANT — READ BEFORE ADDING A "focus is still on the button" CHECK.
     jsdom does NOT implement the blur-on-disable behaviour that Chrome and
     Android WebView have: setting .disabled on a focused element leaves
     document.activeElement untouched here, but moves it to <body> on a real
     device. Verified 2026-07-30.
     So a behavioural assertion CANNOT fail in this harness — it would pass on
     the broken code and give false confidence. That is exactly how this bug
     reached a blind tester in the first place.
     The two guards below are therefore STRUCTURAL, and they do fail on the old
     code: the attribute contract, and a source scan for the banned pattern. */
  const submit = D.querySelector('#lg_teacherArea .save');
  ok(!!submit, 'the sign-in button is there to press');
  submit.focus();

  w.lockBtn(submit);
  ok(submit.getAttribute('aria-disabled') === 'true',
     'the guard marks the button aria-disabled, so it still reads as unavailable');
  ok(submit.disabled === false,
     'the guard does NOT touch .disabled — that property is what blurs it on a real device');
  w.unlockBtn(submit);
  ok(!submit.hasAttribute('aria-disabled'), 'and unlocking clears it');

  // Re-entrancy: the busy flag, not the browser, is what stops a double tap.
  w.lockBtn(submit);
  ok(w.btnBusy(submit) === true, 'a locked button reports busy, so handlers can reject a second tap');
  w.unlockBtn(submit);
  ok(w.btnBusy(submit) === false, 'and is accepted again once unlocked');

  // THE REAL GUARD: nothing in app.js may disable a control imperatively.
  // `x.disabled = !cond` (state-driven, on a control the user is not on) is
  // fine; `x.disabled = true/false` inside a handler is the banned pattern.
  // Strip comments FIRST — the block comment above handleLogin names the
  // banned pattern in prose, and a naive line filter flags its own warning.
  const src = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8')
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/^\s*\/\/.*$/gm, '')
                .split('\n');
  const banned = src.filter(l => /\.disabled\s*=\s*(true|false)\b/.test(l));
  ok(banned.length === 0,
     banned.length === 0
       ? 'no handler sets .disabled — the focus-stealing pattern is gone from app.js'
       : `${banned.length} line(s) still set .disabled directly: ${banned[0].trim()}`);

  await w.handleLogin(schoolId); await sleep(400);
  const a8 = active();
  ok(a8 && D.getElementById('screen').contains(a8),
     'and sign-in still lands focus inside the new screen');
  w.localStorage.setItem('welcomeSeen','1');

  /* ---- FLOW 9: an announcement must not outlive its screen ---------------
     Reported 2026-07-30 from Mansi's phone: on the Today screen, exploring by
     touch read out "Saksham School, Noida selected. Enter your login ID and
     password." — the sign-in announcement, still sitting in #srStatus.

     A live region KEEPS its last text, and .visually-hidden is clipped rather
     than display:none, so that text stays real, readable content in the
     accessibility tree right next to the new screen.

     It looked device-specific and was not: the phone that seemed fine had a
     saved session, skipped the sign-in screen entirely, and so never populated
     the region. Reinstalling wiped the session, which is why reinstalling
     appeared to cause it. */
  console.log('\nFLOW 9 — an announcement must not outlive its screen');
  w.showLogin('none'); await sleep(140);
  const sel9 = D.getElementById('lg_school');
  sel9.value = schoolId; w.onSchoolPick(schoolId); await sleep(300);
  ok(/login id/i.test(spoken()), 'picking a school announces what to do next');

  D.getElementById('lg_id').value = 'saksham01';
  D.getElementById('lg_pw').value = 'pilot';
  await w.handleLogin(schoolId); await sleep(400);
  ok(spoken() === '',
     'once on the next screen that sentence is GONE from the live region');
  ok(!/saksham|login id|password/i.test(D.getElementById('main').textContent + spoken()),
     'and no sign-in text is reachable anywhere on the new screen');

  /* The self-clear must ALSO work without a navigation — a teacher can sit on
     one screen and explore. This waits out the real SR_CLEAR_MS rather than
     asserting a constant exists: a check that cannot fail is worse than none,
     which is the lesson from FLOW 8's first draft. SR_CLEAR_MS is a top-level
     const so it is NOT on window — reach it with eval. */
  const CLEAR_MS = w.eval('SR_CLEAR_MS');
  ok(typeof CLEAR_MS === 'number' && CLEAR_MS > 0, `SR_CLEAR_MS is set (${CLEAR_MS}ms)`);
  w.announce('Standalone message'); await sleep(300);
  ok(spoken() === 'Standalone message', 'a standalone announcement is written');
  await sleep(CLEAR_MS + 400);
  ok(spoken() === '',
     `and it clears itself after ${CLEAR_MS}ms with no navigation at all`);

  /* ---- FLOW 10: dismissing a tip must not strand the cursor --------------
     Reported 2026-07-30: "the elements in the do not show again thing are kinda
     not working properly with TalkBack." The tap worked; what failed was after
     it. dismissHelpTip() removed the element CONTAINING the button just
     pressed, so focus fell to <body> and TalkBack restarted from the top.

     Unlike the .disabled case in FLOW 8, jsdom DOES blur on element removal
     (verified 2026-07-30), so this one can be asserted behaviourally. */
  console.log('\nFLOW 10 — dismissing a tip must not destroy focus');
  // The callout only renders while the teacher has never dismissed it, and
  // earlier flows set that flag. Clear it, then open a screen that has a ?.
  await w.eval(`Store._remove(_obKey(HELP_USED_KEY))`);
  w.showActivity(solo.ci, solo.ai); await sleep(300);
  const tipBtn = D.querySelector('.help-tip-ok');
  ok(!!tipBtn, 'the "Don\'t show again" button is on screen to test');
  if(tipBtn){
    tipBtn.focus();
    ok(active() === tipBtn, 'focus starts on the dismiss button, as after a double-tap');
    await w.dismissHelpTip(tipBtn);
    /* Wait PAST the removal timeout before judging focus. The old code removed
       the element on a 240ms timer, so checking at 150ms saw focus still on the
       doomed button and passed on broken code — the same can't-fail assertion
       trap as FLOW 8's first draft. Judge focus only after the DOM has settled. */
    await sleep(450);
    ok(!D.body.contains(tipBtn), 'the tip is removed');
    const a10 = active();
    ok(a10 && a10 !== D.body && a10 !== D.documentElement,
       'and focus is NOT left on <body> once it is gone');
    ok(a10 && D.body.contains(a10), 'it is on something still in the page');
    ok(/dismissed/i.test(spoken()), 'and the dismissal is announced');
  }

  /* ---- FLOW 11: bulk import ----------------------------------------------
     The screen's whole safety property is that what it SAYS it will do and
     what it ACTUALLY does come from one classifier. If the preview and the
     import ever drift apart, a teacher gets silent duplicates of real children
     — the exact failure the duplicate check exists to prevent. So this asserts
     the classifier directly, on the nastiest paste we can write: a duplicate
     of an already-enrolled child, a duplicate within the paste itself, a
     British-format date, and a date that cannot be read at all. */
  console.log('\nFLOW 11 — bulk import must not silently create duplicates');
  // Seed a child WITH a date of birth: the seeded flow children have none, and
  // the exact-match roster check needs both halves of the key to be real.
  await w.eval(`upsertProfile({ id:'flow-dup', name:'Roster Child', dob:'2015-03-11', researchId:'OM-FLOW-DUP' })`);
  const known = 'Roster Child', knownDob = '2015-03-11';
  ok(!!(await w.eval(`loadProfiles().some(p=>p.name==='Roster Child')`)),
     'there is an existing child with a date of birth to test the roster check against');
  const rosterBefore = (await w.eval(`loadProfiles().length`));

  const paste = [
    'Ananya Bose\t14/08/2015',
    'Ananya Bose\t14/08/2015',
    `${known}\t${knownDob}`,
    'Kabir\t2017-01-09',
    'Roster Child\t01/01/2011',
    'No Date Here',
    'Bad Date\t31/31/2015'
  ].join('\n');
  const rows = await w.eval(`parseBulkRows(${JSON.stringify(paste)})`);
  const by = s => rows.filter(r => r.status === s).length;

  ok(rows.length === 7, 'every non-empty line is classified, none dropped');
  ok(by('new') === 2, 'only the two genuinely new children are marked as plain adds');
  ok(rows[1].status === 'dup', 'a line repeated inside the paste is caught');
  ok(rows[2].status === 'dup', 'a child already on the roster is caught');
  ok(rows[4].status === 'warn',
     'a NAME that already exists with a different date is flagged, not silently added');
  ok(rows[5].status === 'bad', 'a missing date of birth is refused, not defaulted');
  ok(rows[6].status === 'bad', 'an impossible date is refused rather than guessed at');
  ok(by('dup') === 2 && by('bad') === 2 && by('warn') === 1,
     'the tally the teacher reads matches the rows');
  // DD/MM must never be silently read as MM/DD — that would corrupt a child's age.
  ok(rows[0].dob === '2015-08-14', 'DD/MM/YYYY is normalised, not transposed');
  // Nothing may be written by parsing alone; the import is the only writer.
  ok((await w.eval(`loadProfiles().length`)) === rosterBefore,
     'previewing a paste writes nothing to storage');
  // Consent cannot be pasted — imported children must arrive locked.
  await w.eval(`importOneChild({name:'Import Test Child', dob:'2016-06-06'})`);
  const made = await w.eval(`loadProfiles().find(p=>p.name==='Import Test Child')||{}`);
  ok(!!made.researchId, 'an imported child still gets a research ID');
  ok(made.videoConsent === false, 'and arrives with video consent OFF — consent is not pasteable');

  /* ---- FLOW 12: the sheet sync ------------------------------------------
     Sync and paste must agree. They share classifyRows(), and this asserts
     that a CSV straight out of a spreadsheet — header row, quoted field with a
     comma in it, CRLF endings — reaches the same verdicts the pasted version
     would. A sheet the teacher never published answers with an HTML sign-in
     page and a 200, so that has to be caught too or the app would try to
     enrol children called "<!doctype html>". */
  console.log('\nFLOW 12 — a synced sheet is judged exactly like a pasted list');
  const csv = 'Name,Date of birth\r\n"Nair, Meera",14/08/2015\r\nKabir Sen,2017-01-09\r\nKabir Sen,2017-01-09\r\nNo Date,\r\n';
  const parsed = await w.eval(`parseCSV(${JSON.stringify(csv)})`);
  ok(parsed.length === 5, 'every CSV line is read, header included');
  ok(parsed[1][0] === 'Nair, Meera', 'a quoted field keeps its comma instead of splitting');

  const stripped = await w.eval(`stripSheetHeader(parseCSV(${JSON.stringify(csv)}))`);
  ok(stripped.length === 4, 'a header row is detected and dropped');
  ok(stripped[0][0] === 'Nair, Meera', 'and the first real child survives it');

  const sheetRows = await w.eval(
    `classifyRows(stripSheetHeader(parseCSV(${JSON.stringify(csv)})).map(r=>({name:r[0], dobRaw:r[1]})))`);
  const st = s => sheetRows.filter(r=>r.status === s).length;
  ok(sheetRows.length === 4, 'the sheet classifies every data row');
  ok(st('new') === 2, 'the two distinct children are marked for adding');
  ok(sheetRows[2].status === 'dup', 'a row repeated in the SHEET is caught, same as in a paste');
  ok(sheetRows[3].status === 'bad', 'a blank date of birth from a sheet cell is refused');

  // A sheet with no header must not lose its first child.
  const noHead = await w.eval(`stripSheetHeader(parseCSV('Asha,01/02/2016\\nBimal,03/04/2015'))`);
  ok(noHead.length === 2 && noHead[0][0] === 'Asha',
     'a sheet WITHOUT a header keeps its first row — the header is detected, not assumed');

  /* Any of the three links Google hands out for the same sheet must work.
     Requiring a coordinator to tell them apart is a support call waiting to
     happen, and pasting the /edit address is the single most likely mistake. */
  const SID = '1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789';
  const fromEdit = await w.eval(`normalizeSheetUrl('https://docs.google.com/spreadsheets/d/${SID}/edit#gid=0')`);
  ok(/output=csv|format=csv/.test(fromEdit), 'an /edit link is rewritten to a CSV export');
  ok(fromEdit.includes(SID), 'and keeps the spreadsheet id');
  ok(/gid=0/.test(fromEdit), 'and keeps the tab it was pointing at');
  const alreadyCsv = 'https://docs.google.com/spreadsheets/d/e/2PACX-xyz/pub?gid=0&single=true&output=csv';
  ok((await w.eval(`normalizeSheetUrl(${JSON.stringify(alreadyCsv)})`)) === alreadyCsv,
     'a published CSV link is left untouched');

  // An unpublished sheet returns a Google page, sometimes with a 200.
  await w.eval(`window.fetch = () => Promise.resolve({ ok:true, status:200, text:()=>Promise.resolve('<!doctype html><html>Sign in</html>') })`);
  const html = await w.eval(`fetchSheetCSV('https://example.com/pub?output=csv')`);
  ok(html.ok === false, 'an HTML page is rejected rather than parsed as students');
  ok(/Publish to web/i.test(html.error || ''), 'and the message says exactly which menu to use');

  /* The bug behind "the sheet link returned 101": the transport reported an
     odd status while handing over a perfectly good body. Judge the body. */
  await w.eval(`window.fetch = () => Promise.resolve({ ok:false, status:101, text:()=>Promise.resolve('Name,Date of birth\\nAsha,01/02/2016') })`);
  const odd = await w.eval(`fetchSheetCSV('https://example.com/pub?output=csv')`);
  ok(odd.ok === true, 'a real CSV body is accepted even when the status code is strange');

  // A dead network must read as offline, not as a mysterious failure.
  await w.eval(`window.fetch = () => Promise.reject(new Error('offline'))`);
  const down = await w.eval(`fetchSheetCSV('https://example.com/pub?output=csv')`);
  ok(down.ok === false && down.offline === true, 'an unreachable sheet is reported as offline');

  console.log(`\n  ========== ${pass} passed, ${fail} failed ==========`);
  dom.window.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FLOW ERROR:', e); process.exit(2); });
