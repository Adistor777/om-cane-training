#!/usr/bin/env node
/* =============================================================================
   generate-command-audio.js — Command-board cue generator (Sarvam Bulbul v3)
   =============================================================================

   Sibling of generate-audio.js (read that header for full setup). This one
   reads the `commands` lists from activities.js (activities that have
   commandBoard:true) and writes ONE short mp3 per (command x language) into
   ./audio/commands/. The app derives the path from the command id + selected
   language:

       audio/commands/left_hi.mp3        <- { id:"left", speak:{ hi:"बाएँ" } }

   That derived-path convention is the contract with app.js (CB.play()) —
   change it in BOTH places or neither.

   Same rules as the SOP generator:
   - runs ON YOUR MAC, never bundled into the app
   - SARVAM_API_KEY comes from the shell, never from code
   - a language with empty speak text is skipped cleanly (the content team
     fills translations at their own pace)
   - commands sharing an id across activities are generated ONCE (they should
     have identical speak text — you get a warning if they don't)

   USAGE
     node scripts/generate-command-audio.js --dry-run     # preview, no calls
     node scripts/generate-command-audio.js               # make what's missing
     node scripts/generate-command-audio.js --force       # remake everything
     node scripts/generate-command-audio.js --only left   # one command id

   AFTER GENERATING
     Listen to the files in ./audio/commands/, then ./scripts/build.sh
     (media folders are copied to www/ by the build).
   ============================================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

/* ---- CONFIG — matches generate-audio.js where it matters ------------------ */
const LANGUAGES = {
  hi: 'hi-IN',   // Hindi
  ta: 'ta-IN',   // Tamil
  bn: 'bn-IN',   // Bengali
};
const MODEL    = 'bulbul:v3';
const SPEAKER  = 'shubh';        // keep the SAME voice as SOP narration — one familiar voice everywhere
const PACE     = 0.9;            // slightly slower than narration: these are action cues for children
const FORMAT   = 'mp3';
const SAMPLE_RATE = 24000;

const API_URL  = 'https://api.sarvam.ai/text-to-speech';
const ROOT     = path.join(__dirname, '..');
const OUT_DIR  = path.join(ROOT, 'audio', 'commands');
const ACTIVITIES_FILE = path.join(ROOT, 'activities.js');

/* ---- ARGS ------------------------------------------------------------------ */
const args = process.argv.slice(2);
const FORCE   = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');
const onlyIdx = args.indexOf('--only');
const ONLY    = onlyIdx !== -1 ? args[onlyIdx + 1] : null;

function fail(msg){ console.error(`\nFAILED: ${msg}\n`); process.exit(1); }

/* ---- LOAD activities.js (execute, don't scrape — same as the SOP script) --- */
function loadActivityData(){
  let src;
  try { src = fs.readFileSync(ACTIVITIES_FILE, 'utf8'); }
  catch (e) { fail(`Could not read ${ACTIVITIES_FILE}\n  ${e.message}`); }
  try {
    const fn = new Function(`${src}\n; return ACTIVITY_DATA;`);
    const data = fn();
    if (!Array.isArray(data)) throw new Error('ACTIVITY_DATA is not an array');
    return data;
  } catch (e) { fail(`Could not parse ACTIVITY_DATA from activities.js\n  ${e.message}`); }
}

/* ---- COLLECT commands, deduped by id --------------------------------------- */
function collectCommands(data){
  const byId = new Map();
  data.forEach(cat => (cat.activities || []).forEach(act => {
    if (!act.commandBoard || !Array.isArray(act.commands)) return;
    act.commands.forEach(c => {
      if (!c || !c.id) return;
      const prev = byId.get(c.id);
      if (prev){
        // Same id must mean same cue. Warn on drift; first definition wins.
        Object.keys(LANGUAGES).forEach(l => {
          const a = (prev.speak && prev.speak[l]) || '';
          const b = (c.speak && c.speak[l]) || '';
          if (a && b && a !== b) console.warn(`  ! command "${c.id}" has different ${l} text in two activities — using "${a}"`);
        });
        return;
      }
      byId.set(c.id, { id: c.id, label: c.label || c.id, speak: c.speak || {} });
    });
  }));
  return [...byId.values()];
}

/* ---- SARVAM CALL (same wire format as generate-audio.js) ------------------- */
async function synthesize(text, sarvamLangCode){
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'api-subscription-key': process.env.SARVAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      target_language_code: sarvamLangCode,
      model: MODEL,
      speaker: SPEAKER,
      pace: PACE,
      audio_format: FORMAT,
      speech_sample_rate: SAMPLE_RATE,
    }),
  });
  if (!res.ok){
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch (e) { detail = await res.text().catch(() => ''); }
    throw new Error(`HTTP ${res.status} — ${detail || res.statusText}`);
  }
  const json = await res.json();
  if (!json.audios || !json.audios.length) throw new Error(`No audio in response (request_id ${json.request_id || 'unknown'})`);
  return Buffer.from(json.audios.join(''), 'base64');
}

/* ---- MAIN ------------------------------------------------------------------ */
async function main(){
  if (!DRY_RUN && !process.env.SARVAM_API_KEY){
    fail('SARVAM_API_KEY is not set.\n  Run:  export SARVAM_API_KEY="your_key_here"\n  (Use --dry-run to preview without a key.)');
  }

  let commands = collectCommands(loadActivityData());
  if (!commands.length) fail('No commands found — does any activity have commandBoard:true with a commands list?');

  if (ONLY){
    commands = commands.filter(c => c.id === ONLY);
    if (!commands.length) fail(`--only "${ONLY}" matched no command id.`);
  }

  if (!DRY_RUN) fs.mkdirSync(OUT_DIR, { recursive: true });

  const langEntries = Object.entries(LANGUAGES);
  let made = 0, skipped = 0, failed = 0;

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Generating command audio`);
  console.log(`  model=${MODEL}  speaker=${SPEAKER}  pace=${PACE}  format=${FORMAT}`);
  console.log(`  commands=${commands.length}${ONLY ? ` (--only ${ONLY})` : ''}\n`);

  for (const cmd of commands){
    for (const [appCode, sarvamCode] of langEntries){
      const text = (cmd.speak[appCode] || '').trim();
      const outPath = path.join(OUT_DIR, `${cmd.id}_${appCode}.mp3`);
      const rel = path.relative(ROOT, outPath);

      if (!text){ console.log(`  · skip   ${rel}  (no ${appCode} text yet)`); skipped++; continue; }
      if (!FORCE && fs.existsSync(outPath)){ console.log(`  · skip   ${rel}  (exists; --force to redo)`); skipped++; continue; }
      if (DRY_RUN){ console.log(`  → would  ${rel}  "${text}"`); made++; continue; }

      try {
        const buf = await synthesize(text, sarvamCode);
        fs.writeFileSync(outPath, buf);
        console.log(`  ✓ wrote  ${rel}  "${text}"  (${(buf.length/1024).toFixed(0)} KB)`);
        made++;
      } catch (e) {
        console.error(`  ✗ FAIL   ${rel}  ${e.message}`);
        failed++;
      }
    }
  }

  console.log(`\nDone. ${made} ${DRY_RUN ? 'planned' : 'written'}, ${skipped} skipped, ${failed} failed.`);
  if (!DRY_RUN && made) console.log(`Listen to ./audio/commands/, then run ./scripts/build.sh\n`);
  if (failed) process.exit(1);
}

main();
