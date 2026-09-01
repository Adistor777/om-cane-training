/* scripts/measure-press.mjs — what press weight does each control ACTUALLY get?
 *
 * NOT a build gate, and deliberately not wired into build.sh: it needs a real
 * browser, and the seven gates that do run must stay dependency-light enough
 * that nobody is tempted to skip them.
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node scripts/measure-press.mjs
 *
 * WHY IT EXISTS. Press weight is assigned by MEASURING the element
 * (pressWeightFor in app.js), which means the assignment cannot be reviewed by
 * reading code — you have to run the app in something that does layout. jsdom
 * does not: getBoundingClientRect() returns zeros there, so all seven existing
 * gates would report every control identically and see nothing.
 *
 * The first run of this found four real defects in an hour-old implementation:
 * `.card-media` — the activity cards — pressing like a 40px icon; and three
 * components straddling a threshold, so ONE component pressed two different
 * ways depending on screen (`summary` on whether its label wrapped, `.cmd-pad`
 * between the grid and the compass face, `.sb-tbtn` between play and its
 * neighbours). All four are invisible to code review and to every gate.
 *
 * RUN IT after adding a component, or after changing a size, padding or
 * breakpoint. What you want to see is EVERY COMPONENT LISTED EXACTLY ONCE. A
 * component appearing under two weights is the bug this is built to catch.
 */
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
                '.woff2':'font/woff2', '.mp3':'audio/mpeg', '.mp4':'video/mp4', '.jpg':'image/jpeg', '.png':'image/png' };

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
  fs.readFile(p, (e, buf) => {
    if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
    res.end(buf);
  });
});
await new Promise(r => server.listen(8931, r));

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newContext({
  viewport: { width: 393, height: 873 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
}).then(c => c.newPage());

page.on('pageerror', e => console.log('  PAGE ERROR:', e.message));
await page.goto('http://localhost:8931/', { waitUntil: 'networkidle' });
await page.waitForFunction(
  () => typeof window.saveRecord === 'function' && localStorage.getItem('teacherId'), null, { timeout: 20000 });
await page.evaluate(() => document.fonts && document.fonts.ready);

await page.evaluate(async () => {
  showLogin('none'); await new Promise(r => setTimeout(r, 120));
  const sel = document.getElementById('lg_school');
  const id = [...sel.options].map(o => o.value).find(v => v && v !== '__other__');
  sel.value = id; onSchoolPick(id); await new Promise(r => setTimeout(r, 150));
  document.getElementById('lg_id').value = 'saksham01';
  document.getElementById('lg_pw').value = 'pilot';
  await handleLogin(id); await new Promise(r => setTimeout(r, 300));
  localStorage.setItem('welcomeSeen', '1');
  for (const n of ['Measure A', 'Measure B'])
    if (!loadProfiles().some(p => p.name === n))
      await upsertProfile({ id: 'm-' + n.slice(-1), name: n, researchId: 'OM-MEAS-' + n.slice(-1) });
  setActiveProfileId(loadProfiles()[0].id);
});

const report = await page.evaluate(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const D = ACTIVITY_DATA, pid = loadProfiles()[0].id, flat = [];
  D.forEach((c, ci) => (c.activities || []).forEach((a, ai) => flat.push({ ci, ai, a })));
  const screens = [
    ['Home (Activities / Students)', () => showHome('none')],
    ['Activities (category list)',   () => showActivityList('none')],
    ['Students',                     () => showStudents('none')],
    ['Settings',                     () => showSettings('none')],
    ['FAQs',                         () => showFAQs('none')],
    ['About',                        () => showAbout('none')],
    ['Manage data',                  () => showManageData('none')],
    ...D.map((c, ci) => ['Category · ' + c.category, () => showCategory(ci, 'none')]),
    ...flat.map(x => ['Record · ' + x.a.name, () => { batchRoster = [pid]; showActivity(x.ci, x.ai); }]),
    ['Child picker', () => showChildPicker(0, 0, 'none')],
    ['Child detail', () => showChildDetail(pid, {})],
  ];
  const out = [];
  for (const [name, go] of screens) {
    try { go(); } catch (e) { out.push({ screen: name, error: String(e.message) }); continue; }
    await sleep(140);
    const rows = [];
    for (const el of document.querySelectorAll('button, [role="button"], summary')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      let weight = null;
      for (const [w, sel] of PRESS_OVERRIDE) if (el.matches(sel)) { weight = w + '*'; break; }
      if (!weight) weight = pressWeightFor(el);
      rows.push({ cls: (el.className && String(el.className).split(' ')[0]) || el.tagName.toLowerCase(),
                  w: Math.round(r.width), h: Math.round(r.height), weight });
    }
    out.push({ screen: name, rows });
  }
  return out;
});

const seen = new Map();
for (const s of report) {
  if (s.error) { console.log(`\n${s.screen}\n  ERROR ${s.error}`); continue; }
  for (const r of s.rows) {
    const k = `${r.cls}|${r.weight}`;
    if (!seen.has(k)) seen.set(k, { ...r, screen: s.screen });
  }
}
console.log('\n' + '='.repeat(70));
console.log('PRESS WEIGHT — measured in Chromium at 393x873   (* = explicit override)');
console.log('='.repeat(70));
const byW = {}, byCls = {};
for (const r of seen.values()) {
  (byW[r.weight] ||= []).push(r);
  (byCls[r.cls] ||= new Set()).add(r.weight);
}
const ORDER = ['slab','slab*','ctrl','ctrl*','micro','micro*','text','text*'];
for (const w of [...ORDER, ...Object.keys(byW).filter(k => !ORDER.includes(k))]) {
  if (!byW[w]) continue;
  console.log(`\n${w.toUpperCase()}  (${byW[w].length})`);
  byW[w].sort((a, b) => b.w * b.h - a.w * a.h)
        .forEach(r => console.log(`   ${String(r.w + '×' + r.h).padStart(9)}  .${r.cls}`));
}
const split = Object.entries(byCls).filter(([, s]) => s.size > 1);
console.log('\n' + '-'.repeat(70));
if (split.length) {
  console.log('FAIL — these components press TWO different ways depending on screen:');
  split.forEach(([c, s]) => console.log(`   .${c}  →  ${[...s].join('  and  ')}`));
  console.log('Pin them in PRESS_OVERRIDE (app.js) so one component means one press.');
} else {
  console.log(`OK — ${seen.size} components, each with exactly one weight.`);
}
await browser.close();
server.close();
process.exit(split.length ? 1 : 0);
