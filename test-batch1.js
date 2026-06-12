/* Batch 1 headless verification — boots the REAL index.html in jsdom with
   seeded legacy data, then asserts every Batch 1 guarantee. */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Inline activities.js so jsdom needs no resource loading at all.
const ACTIVITIES = fs.readFileSync(path.join(__dirname,'activities.js'),'utf8');

const HTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
  .replace('<script src="activities.js"></script>', '<script>\n' + ACTIVITIES + '\n</script>');
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let pass = 0, fail = 0;
function ok(cond, label){
  if(cond){ pass++; console.log('  PASS  ' + label); }
  else    { fail++; console.log('  FAIL  ' + label); }
}

// Boot the app in jsdom. `seed` = key->string map written into localStorage
// BEFORE any script runs (simulates pre-existing on-device data).
function bootApp(seed){
  return new Promise((resolve, reject)=>{
    const dom = new JSDOM(HTML, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      beforeParse(window){
        for(const [k,v] of Object.entries(seed || {})) window.localStorage.setItem(k, v);
        window.confirm = () => true;           // auto-confirm dialogs
        window.scrollTo = () => {};
        if(!window.crypto || !window.crypto.randomUUID){
          // jsdom may lack randomUUID; expose node's so the primary path is tested
          const nodeCrypto = require('crypto');
          window.crypto = window.crypto || {};
          window.crypto.randomUUID = () => nodeCrypto.randomUUID();
          window.crypto.getRandomValues = window.crypto.getRandomValues || (a => nodeCrypto.randomFillSync(a));
        }
      }
    });
    const w = dom.window;
    w.addEventListener('error', e => console.log('  [page error]', e.message));
    // boot() is an async IIFE kicked off at parse. `const Store` never lands on
    // window (const/let in classic scripts don't), so probe for the LAST boot
    // side-effect instead: teacherId minted + migration writes settled.
    let tries = 0;
    const wait = setInterval(()=>{
      tries++;
      if(w.localStorage.getItem('teacherId') && typeof w.saveRecord === 'function'){
        clearInterval(wait); setTimeout(()=>resolve(dom), 100); // let migration writes settle
      } else if(tries > 100){ clearInterval(wait); reject(new Error('boot timed out')); }
    }, 30);
  });
}

(async ()=>{
  /* ---- SUITE 1: migration shim on legacy data --------------------------- */
  console.log('\nSUITE 1 — migration shim backfills legacy data');
  // Round-trippable legacy `when` (built with THIS runtime's locale) + an
  // ambiguous one that must NOT be converted.
  const safeWhen = new Date('2026-01-15T10:30:00Z').toLocaleString();
  const legacySeed = {
    'rec_act1': JSON.stringify([
      { student:'Asha',  profileId:'cabc1', when: safeWhen,        values:{ Result:'Independent' } },
      { student:'Vikram',profileId:'cabc2', when: '31/02/9999 zz', values:{ Result:'Prompted' } }
    ]),
    'profiles': JSON.stringify([
      { id:'cabc1', name:'Asha',   dob:'2016-04-02', height:'120', weight:'25', dominantHand:'Right', photo:'', capturedOn:'2026-01-01T00:00:00Z' },
      { id:'cabc2', name:'Vikram', dob:'2015-09-10', height:'130', weight:'28', dominantHand:'Left',  photo:'', capturedOn:'2026-01-01T00:00:00Z' }
    ])
  };
  let dom = await bootApp(legacySeed);
  let w = dom.window;

  const tid = w.localStorage.getItem('teacherId');
  ok(!!tid && tid.startsWith('op_') && UUID_RE.test(tid.slice(3)), 'teacherId minted at boot: op_ + v4 UUID  ('+tid+')');

  let recs = JSON.parse(w.localStorage.getItem('rec_act1'));
  ok(recs.length === 2, 'both legacy records survive migration');
  ok(recs.every(r => UUID_RE.test(r.id)), 'every legacy record backfilled with a v4 UUID id');
  ok(new Set(recs.map(r=>r.id)).size === 2, 'backfilled ids are unique');
  ok(recs.every(r => r.schemaVersion === 1), 'every legacy record stamped schemaVersion:1');
  ok(recs.every(r => r.teacherId === 'legacy'), "every legacy record tagged teacherId:'legacy' (not the new op_ id)");
  ok(typeof recs[0].whenISO === 'string' && !isNaN(Date.parse(recs[0].whenISO)), 'round-trippable when converted to whenISO');
  ok(recs[1].whenISO === undefined, 'ambiguous/unparseable when NOT converted (no silent day/month swap)');
  ok(recs[1].when === '31/02/9999 zz', 'ambiguous legacy display string preserved untouched');

  let profs = JSON.parse(w.localStorage.getItem('profiles'));
  ok(profs.every(p => p.schemaVersion === 1), 'legacy profiles stamped schemaVersion:1');
  ok(profs[0].id === 'cabc1' && profs[1].id === 'cabc2', 'profile ids untouched by migration');

  /* ---- SUITE 2: idempotence on second boot ------------------------------ */
  console.log('\nSUITE 2 — second boot is a no-op (idempotent shim, stable teacherId)');
  const snapshot = {};
  for(let i=0;i<w.localStorage.length;i++){ const k=w.localStorage.key(i); snapshot[k]=w.localStorage.getItem(k); }
  dom = await bootApp(snapshot);
  w = dom.window;
  ok(w.localStorage.getItem('teacherId') === tid, 'teacherId stable across cold restart (no re-mint)');
  const recs2 = JSON.parse(w.localStorage.getItem('rec_act1'));
  ok(JSON.stringify(recs2) === JSON.stringify(recs), 'records byte-identical after second boot (ids unchanged)');

  /* ---- SUITE 3: new-record envelope stamping ---------------------------- */
  console.log('\nSUITE 3 — saveRecord stamps the full envelope on new records');
  const saved = await w.saveRecord('act1', { student:'Asha', profileId:'cabc1', values:{ Result:'Unable' } });
  ok(saved === true, 'saveRecord write-verify resolves true');
  recs = JSON.parse(w.localStorage.getItem('rec_act1'));
  const fresh = recs[0]; // unshift puts newest first
  ok(UUID_RE.test(fresh.id), 'new record has UUID id');
  ok(fresh.schemaVersion === 1, 'new record has schemaVersion:1');
  ok(fresh.teacherId === tid, 'new record stamped with THIS device teacherId (not legacy)');
  ok(typeof fresh.whenISO === 'string' && !isNaN(Date.parse(fresh.whenISO)), 'new record has canonical ISO whenISO');
  ok(!('when' in fresh), 'new record carries NO locale display string (derived at render)');
  ok(w.fmtWhen(fresh) === new w.Date(fresh.whenISO).toLocaleString(), 'fmtWhen derives display from whenISO');
  ok(w.fmtWhen({ when:'old style' }) === 'old style', 'fmtWhen falls back to legacy when for unconverted records');

  /* ---- SUITE 4: delete-by-id ------------------------------------------- */
  console.log('\nSUITE 4 — deletion is by id, stale ids no-op safely');
  const before = JSON.parse(w.localStorage.getItem('rec_act1'));   // 3 records
  const middle = before[1];
  ok(await w.deleteRecord('act1', middle.id) === true, 'delete by id of middle record returns true');
  let after = JSON.parse(w.localStorage.getItem('rec_act1'));
  ok(after.length === 2 && !after.some(r=>r.id===middle.id), 'exactly the targeted record removed');
  ok(after.some(r=>r.id===before[0].id) && after.some(r=>r.id===before[2].id), 'neighbouring records intact (no off-by-one)');
  ok(await w.deleteRecord('act1', middle.id) === false, 'repeat delete with stale id returns false (race-safe no-op)');
  ok(await w.deleteRecord('act1', 'nonexistent') === false, 'unknown id returns false, deletes nothing');
  for(const r of [...after]) await w.deleteRecord('act1', r.id);
  ok(w.localStorage.getItem('rec_act1') === null, 'deleting last record removes the storage key entirely');

  /* ---- SUITE 5: rendered delete button carries the id ------------------- */
  console.log('\nSUITE 5 — renderRecord wires the id (not an index) into the UI');
  const html = w.renderRecord({ id:'rid-123', student:'Asha', whenISO:new Date().toISOString(), values:{ Result:'Independent' } }, ['Result'], 'act1');
  ok(html.includes("confirmDeleteRecord('act1','rid-123')"), 'delete button onclick uses the record id');
  const noIdHtml = w.renderRecord({ student:'X', when:'x', values:{} }, [], 'act1');
  ok(!noIdHtml.includes('confirmDeleteRecord'), 'record without id renders NO delete button (cannot mis-delete)');

  /* ---- SUITE 6: CSV carries canonical timestamp + teacherId ------------- */
  console.log('\nSUITE 6 — CSV export uses whenISO and includes Teacher ID');
  await w.saveRecord('act1', { student:'Asha', profileId:'cabc1', values:{ Result:'Independent' } });
  const rows = w.gatherAllRecords();
  ok(rows.length === 1 && !isNaN(Date.parse(rows[0].when)), 'CSV row When = canonical ISO timestamp');
  ok(rows[0].teacherId === tid, 'CSV row carries teacherId');
  const csv = w.buildCSV(rows);
  ok(csv.includes('Teacher ID'), 'CSV header includes Teacher ID column');
  ok(csv.includes(tid), 'CSV body includes the device teacherId value');

  /* ---- SUITE 7: fresh install (no legacy data) -------------------------- */
  console.log('\nSUITE 7 — clean install boots and stamps correctly');
  dom = await bootApp({});
  w = dom.window;
  const tid2 = w.localStorage.getItem('teacherId');
  ok(!!tid2 && tid2.startsWith('op_') && tid2 !== tid, 'fresh install mints its own distinct teacherId');
  await w.saveRecord('actX', { student:'New', profileId:'c1', values:{} });
  const nr = JSON.parse(w.localStorage.getItem('rec_actX'))[0];
  ok(nr.teacherId === tid2 && UUID_RE.test(nr.id) && nr.schemaVersion === 1, 'first record on fresh install fully stamped');

  console.log(`\n========== ${pass} passed, ${fail} failed ==========`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error('HARNESS ERROR:', e); process.exit(2); });
