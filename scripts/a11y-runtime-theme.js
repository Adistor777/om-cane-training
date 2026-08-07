/* ===========================================================================
   RUNTIME THEME CHECK — do the display modes actually take effect?

   WHY THIS EXISTS (2026-07-30). a11y-contrast.js reads the VALUES declared in
   styles.css and checks the pairs. It passed 55/55 while dark mode was showing
   light-on-light at 1.02:1, because the value it tested was never the value
   that rendered: themeFor() wrote the light paper palette as an INLINE style on
   <body>, and inline beats an attribute selector on <html>.

   Lesson worth keeping: a contrast test that reads the stylesheet proves what
   the stylesheet SAYS, not what the user SEES. This one drives the real app.

   Run: node scripts/a11y-runtime-theme.js
   =========================================================================== */
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const inline = f => '<script>\n' + fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n</script>';
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .replace('<script src="activities.js"></script>', inline('activities.js'))
  .replace('<script src="supabase.js"></script>', '<script>window.supabase=undefined;</script>')
  .replace('<script src="store.js"></script>', inline('store.js'))
  .replace('<script src="app.js"></script>', inline('app.js'));

const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, l) => { if(c){ pass++; console.log('  PASS  ' + l); } else { fail++; console.log('  FAIL  ' + l); } };

(async ()=>{
  const dom = new JSDOM(HTML, { url:'http://localhost/', runScripts:'dangerously', pretendToBeVisual:true,
    beforeParse(w){ w.confirm=()=>true; w.scrollTo=()=>{};
      w.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};
      w.HTMLMediaElement.prototype.pause=function(){}; w.HTMLMediaElement.prototype.load=function(){};
      w.HTMLElement.prototype.scrollIntoView=function(){};
      const c=require('crypto'); w.crypto=w.crypto||{};
      if(!w.crypto.randomUUID) w.crypto.randomUUID=()=>c.randomUUID(); }});
  const w = dom.window, D = w.document;
  await sleep(900);
  const root = D.documentElement, body = D.body;
  const inlineCat = () => ['--cat','--cat-deep','--cat-soft','--cat-line']
    .filter(k => body.style.getPropertyValue(k).trim() !== '');

  console.log('\nDEFAULT (no mode) — category hue is wayfinding and must still apply');
  w.themeFor(2);
  ok(inlineCat().length === 4, 'all four --cat* values are set inline for the category');

  console.log('\nDARK — the stylesheet owns the palette, inline must get out of the way');
  root.setAttribute('data-theme','dark');
  w.themeFor(2);
  ok(inlineCat().length === 0,
     'no inline --cat* survives, so [data-theme="dark"] wins the cascade');

  console.log('\nHIGH CONTRAST — same contract');
  root.removeAttribute('data-theme');
  root.setAttribute('data-contrast','high');
  w.themeFor(4);
  ok(inlineCat().length === 0, 'no inline --cat* survives in high contrast');

  console.log('\nTOGGLING A MODE AT RUNTIME must not strand the old values');
  root.removeAttribute('data-contrast');
  w.themeFor(1);
  ok(inlineCat().length === 4, 'back to default: inline values return');
  // Simulate the Settings toggle: applyDisplayPrefs re-reads the stored prefs.
  await w.eval("Store.setString('a11yTheme','dark')");
  w.applyDisplayPrefs();
  ok(root.getAttribute('data-theme') === 'dark', 'dark mode attribute is applied');
  ok(inlineCat().length === 0,
     'and the stale inline values from the previous mode are cleared');

  await w.eval("Store.setString('a11yTheme','light')");
  w.applyDisplayPrefs();
  ok(inlineCat().length === 4, 'switching back restores the category hue');

  console.log(`\n  ========== ${pass} passed, ${fail} failed ==========`);
  dom.window.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERROR:', e); process.exit(2); });
