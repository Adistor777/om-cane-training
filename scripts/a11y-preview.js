/* ===========================================================================
   A11Y PREVIEW — renders REAL app screens (booted in jsdom, so the markup is
   whatever app.js actually produces today) into one static HTML page showing
   every display mode side by side.

   The point: the accessibility pass added three user-facing modes and moved the
   whole type scale to rem. Both are things you have to LOOK at. This produces a
   page you can open in a browser, or send to the designer, without installing
   an APK or touching the emulator.

   Output: docs/a11y-preview.html   (open it in any browser)
   Run:    node scripts/a11y-preview.js
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

function boot(){
  return new Promise((resolve, reject)=>{
    const dom = new JSDOM(HTML, { url:'http://localhost/', runScripts:'dangerously', pretendToBeVisual:true,
      beforeParse(w){
        w.confirm = () => true; w.scrollTo = () => {};
        w.HTMLMediaElement.prototype.play  = function(){ return Promise.resolve(); };
        w.HTMLMediaElement.prototype.pause = function(){};
        w.HTMLMediaElement.prototype.load  = function(){};
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

  // Sign in with the pilot stub.
  w.showLogin('none'); await sleep(60);
  const sel = D.getElementById('lg_school');
  const schoolId = sel ? [...sel.options].map(o=>o.value).find(v=>v && v!=='__other__') : 'sch_saksham_noida';
  // onSchoolPick(id) is what injects the credential fields — they do not exist
  // until a school is chosen, so it must be called WITH the id.
  if(sel){ sel.value = schoolId; w.onSchoolPick(schoolId); }
  await sleep(80);
  const idEl = D.getElementById('lg_id'), pwEl = D.getElementById('lg_pw');
  if(idEl) idEl.value = 'saksham01';
  if(pwEl) pwEl.value = 'pilot';
  await w.handleLogin(schoolId); await sleep(250);
  w.localStorage.setItem('welcomeSeen','1');

  // Seed a child + roster so the RECORD screen renders (not the picker).
  let profiles = w.eval('loadProfiles()');
  if(!profiles.length){
    await w.eval("upsertProfile({ id:'preview-child', name:'Vaishu', researchId:'OM-PREV-0001', dob:'2016-04-02' })");
    profiles = w.eval('loadProfiles()');
  }
  await w.eval(`setActiveProfileId(${JSON.stringify(profiles[0].id)})`);
  w.eval(`batchRoster = [${JSON.stringify(profiles[0].id)}]`);

  const DATA = w.eval('ACTIVITY_DATA');
  const flat = [];
  DATA.forEach((c,ci)=>(c.activities||[]).forEach((a,ai)=>flat.push({ci,ai,a})));
  const sound = flat.find(x=>x.a.soundboard);
  const plain = flat.find(x=>!x.a.soundboard && !x.a.commands && !x.a.group);

  // Capture the screens we want, plus the header state that goes with each.
  const grab = async (label, go) => {
    await go(); await sleep(200);
    return { label, header: D.querySelector('header').outerHTML, body: D.getElementById('screen').innerHTML };
  };
  const SCREENS = [];
  SCREENS.push(await grab('Home',            async ()=>w.showHome('none')));
  SCREENS.push(await grab('Activities',      async ()=>w.showActivityList('none')));
  if(plain) SCREENS.push(await grab('Record sheet', async ()=>w.showActivity(plain.ci, plain.ai)));
  if(sound) SCREENS.push(await grab('Sound library', async ()=>w.showActivity(sound.ci, sound.ai)));
  SCREENS.push(await grab('Settings — Display', async ()=>w.showSettings('none')));

  // data-text-scale="up" is what applyDisplayPrefs() sets above 1x, and what
  // gates the large-text repairs in styles.css — the preview must set it too,
  // or the 2x columns would show the UNrepaired layout.
  const MODES = [
    { label:'Default (unchanged)',     attrs:'',                                       scale:'1' },
    { label:'High contrast',           attrs:'data-contrast="high"',                   scale:'1' },
    { label:'Dark',                    attrs:'data-theme="dark"',                      scale:'1' },
    { label:'Dark + high contrast',    attrs:'data-theme="dark" data-contrast="high"', scale:'1' },
    { label:'Larger text (1.5x)',      attrs:'data-text-scale="up"',                   scale:'1.5' },
    { label:'Largest text (2x)',       attrs:'data-text-scale="up"',                   scale:'2' },
  ];

  const css = fs.readFileSync(path.join(ROOT,'styles.css'),'utf8');
  const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  // Each cell is an iframe so the app's CSS cannot leak into the preview chrome
  // or between modes. The stylesheet is embedded ONCE in the parent and written
  // into each frame at load time — inlining it per frame produced a 3 MB file.
  // srcdoc/about:blank frames are same-origin with the parent, so this works
  // from a plain file:// open with no server.
  const cells = [];
  SCREENS.forEach((scr, si) => MODES.forEach((m, mi) => cells.push({ si, mi, scr, m })));

  const out = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>O&amp;M Cane Training — accessibility display modes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Arimo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  body{ font:15px/1.55 -apple-system,system-ui,sans-serif; margin:0; padding:32px; background:#111; color:#eee; }
  h1{ font-size:26px; margin:0 0 6px; font-weight:600; }
  .sub{ color:#9a9a9a; margin:0 0 32px; max-width:74ch; }
  h2{ font-size:19px; margin:44px 0 14px; font-weight:600; border-top:1px solid #333; padding-top:22px; }
  .row{ display:flex; gap:18px; overflow-x:auto; padding-bottom:14px; }
  .cell{ flex:0 0 auto; }
  .cap{ font-size:12px; color:#9a9a9a; margin:0 0 6px; text-transform:uppercase; letter-spacing:.06em; }
  .phone{ width:390px; height:780px; border:1px solid #333; border-radius:22px; background:#fff; display:block; }
  code{ background:#222; padding:1px 5px; border-radius:4px; font-size:.9em; }
</style></head>
<body>
<h1>Display modes</h1>
<p class="sub">Generated by <code>scripts/a11y-preview.js</code> from the real app — every panel below is
markup <code>app.js</code> produced just now, styled by the real <code>styles.css</code>. Re-run the
script rather than editing this file.<br><br>
<strong>Column 1 is the untouched default</strong> — compare it against a build of <code>main</code>;
it should be identical. Columns 2&ndash;4 are the opt-in colour modes from
<strong>Settings &rarr; Display</strong>; columns 5&ndash;6 are the type scale, where the thing to
check is that <em>spacing</em> grew with the text and no label is clipped.<br><br>
The large-text layout repairs are gated behind <code>data-text-scale="up"</code>, so none of them
apply in column 1. <code>scripts/a11y-nochange.js</code> enforces that gate on every build.</p>
${SCREENS.map((scr, si) => `
<h2>${esc(scr.label)}</h2>
<div class="row">
  ${MODES.map((m, mi) => `<div class="cell"><p class="cap">${esc(m.label)}</p>`
    + `<iframe class="phone" data-si="${si}" data-mi="${mi}" title="${esc(scr.label)} in ${esc(m.label)}"></iframe></div>`).join('')}
</div>`).join('')}

<script id="appcss" type="text/plain">${css.replace(/<\/script>/gi,'<\\/script>')}</script>
<script>
  const CSS     = document.getElementById('appcss').textContent;
  const FONTS   = '<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Arimo:wght@400;500;600;700&display=swap" rel="stylesheet">';
  const SCREENS = ${JSON.stringify(SCREENS)};
  const MODES   = ${JSON.stringify(MODES)};
  for(const f of document.querySelectorAll('iframe.phone')){
    const scr = SCREENS[+f.dataset.si], m = MODES[+f.dataset.mi];
    const d = f.contentDocument;
    d.open();
    d.write('<!DOCTYPE html><html lang="en" ' + m.attrs + ' style="--text-scale:' + m.scale + '">'
          + '<head><meta charset="utf-8">' + FONTS + '<style>' + CSS + '</style>'
          + '<style>body{min-height:0}</style></head><body>'
          + scr.header + '<main class="wrap"><div id="screen">' + scr.body + '</div></main>'
          + '</body></html>');
    d.close();
  }
</script>
</body></html>`;

  const dest = path.join(ROOT, 'docs', 'a11y-preview.html');
  fs.writeFileSync(dest, out);
  console.log(`wrote ${dest}`);
  console.log(`${SCREENS.length} screens x ${MODES.length} modes`);
  dom.window.close();
})().catch(e => { console.error(e); process.exit(1); });
