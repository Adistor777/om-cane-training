#!/usr/bin/env node
/* =============================================================================
   generate-command-audio.js — Command-board cue generator (Sarvam Bulbul v3)
   =============================================================================

   Sibling of generate-audio.js (read that header for full setup). This one
   reads the `commands` lists from activities.js (activities that have
   commandBoard:true) and writes ONE short ENGLISH mp3 per command into
   ./audio/commands/. Commands are English-only BY DESIGN — multilingual
   Sarvam audio is for SOP narration (sopTranslations + generate-audio.js),
   not for cues. The app derives the path from the command id:

       audio/commands/left_en.mp3        <- { id:"left", label:"Left" }

   That derived-path convention is the contract with app.js (CB.play()) —
   change it in BOTH places or neither.

   What is spoken: the command's `label`, unless the command has an optional
   speak: "..." override (for pronunciation fixes, e.g. speak:"Turn a-round").

   Same rules as the SOP generator:
   - runs ON YOUR MAC, never bundled into the app
   - SARVAM_API_KEY comes from the shell or the repo's gitignored .env
   - commands sharing an id across activities are generated ONCE (they should
     have identical text — you get a warning if they don't)

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
const os = require('os');
const { spawnSync } = require('child_process');

/* ---- FORMAT GUARD (added 2026-08-24 after every cue in the app was silent) --
   Sarvam returned RIFF/WAVE bytes even though the request asked for
   audio_format:'mp3'. Both generators wrote those bytes straight into a
   `.mp3` filename, so 43 files shipped whose contents disagreed with their
   name. Capacitor serves local assets with a MIME type derived from the
   EXTENSION, so Android's WebView was handed `audio/mpeg` with WAV inside,
   refused to decode, and fired onerror — the app's "audio isn't generated
   yet" toast. Nothing ever played.

   So: never trust the request, check the bytes we actually got. If it's WAV,
   re-encode to real MP3 before writing. If ffmpeg isn't available we FAIL
   rather than write a file that lies about its own format.
   ------------------------------------------------------------------------- */
function isWav(buf){
  return buf.length > 12
    && buf.toString('ascii', 0, 4) === 'RIFF'
    && buf.toString('ascii', 8, 12) === 'WAVE';
}
function ensureMp3(buf, label){
  if (!isWav(buf)) return buf;
  const tag = `om-tts-${process.pid}-${Date.now()}`;
  const inPath  = path.join(os.tmpdir(), `${tag}.wav`);
  const outPath = path.join(os.tmpdir(), `${tag}.mp3`);
  const clean = () => { for (const p of [inPath, outPath]) { try { fs.unlinkSync(p); } catch(e){} } };
  fs.writeFileSync(inPath, buf);
  const r = spawnSync('ffmpeg', ['-y','-loglevel','error','-i',inPath,
                                 '-codec:a','libmp3lame','-b:a','96k','-ar','44100',outPath]);
  if (r.error || r.status !== 0 || !fs.existsSync(outPath)){
    clean();
    fail(`Sarvam returned WAV for "${label}" and ffmpeg could not convert it.\n` +
         `  Install ffmpeg (brew install ffmpeg), then run this again.\n` +
         `  Writing WAV bytes into a .mp3 file is what silenced every cue in\n` +
         `  the app once already — refusing to do it again.`);
  }
  const out = fs.readFileSync(outPath);
  clean();
  console.log(`    (Sarvam sent WAV — re-encoded to real MP3)`);
  return out;
}

/* ---- CONFIG — matches generate-audio.js where it matters ------------------ */
const LANG_CODE   = 'en';      // filename suffix ({id}_en.mp3) — the app expects exactly this
const SARVAM_LANG = 'en-IN';   // clear Indian English
const MODEL    = 'bulbul:v3';
const SPEAKER  = 'priya';        // warm female v3 voice — child-facing cues need welcoming, not default
                                 // (shubh, the v3 default, tested flat/unwelcoming for kids).
                                 // Other v3 female options to audition: neha, ritu, kavya, shreya.
                                 // SOP narration (generate-audio.js) is teacher-facing and keeps its own voice.
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
// --only takes ONE OR MORE command ids (everything up to the next --flag) —
// same multi-id fix as generate-audio.js (2026-07-14).
const onlyIdx = args.indexOf('--only');
let ONLY = null;
if (onlyIdx !== -1) {
  ONLY = [];
  for (let i = onlyIdx + 1; i < args.length && !args[i].startsWith('--'); i++) ONLY.push(args[i]);
  if (!ONLY.length) { console.error('--only needs at least one command id'); process.exit(1); }
}

function fail(msg){ console.error(`\nFAILED: ${msg}\n`); process.exit(1); }

/* ---- .env fallback: the key lives in the repo's gitignored .env (the app
   never sees it; these scripts run only on the Mac). Shell env still wins. */
if (!process.env.SARVAM_API_KEY) {
  try {
    const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    const m = env.match(/^\s*(?:export\s+)?SARVAM_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m);
    if (m) process.env.SARVAM_API_KEY = m[1].trim();
  } catch (e) { /* no .env — the key check below reports it */ }
}

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
function commandText(c){ return String((c.speak || c.label || c.id)).trim(); }
function collectCommands(data){
  const byId = new Map();
  data.forEach(cat => (cat.activities || []).forEach(act => {
    if (!act.commandBoard || !Array.isArray(act.commands)) return;
    act.commands.forEach(c => {
      if (!c || !c.id) return;
      const prev = byId.get(c.id);
      if (prev){
        // Same id must mean same cue. Warn on drift; first definition wins.
        if (commandText(prev) !== commandText(c)) console.warn(`  ! command "${c.id}" has different text in two activities — using "${commandText(prev)}"`);
        return;
      }
      byId.set(c.id, { id: c.id, label: c.label || c.id, text: commandText(c) });
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
    const unknown = ONLY.filter(id => !commands.some(c => c.id === id));
    commands = commands.filter(c => ONLY.includes(c.id));
    if (unknown.length) fail(`--only id(s) matched no command: ${unknown.join(', ')}`);
  }

  if (!DRY_RUN) fs.mkdirSync(OUT_DIR, { recursive: true });

  let made = 0, skipped = 0, failed = 0;

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Generating command audio (English, ${SARVAM_LANG})`);
  console.log(`  model=${MODEL}  speaker=${SPEAKER}  pace=${PACE}  format=${FORMAT}`);
  console.log(`  commands=${commands.length}${ONLY ? ` (--only ${ONLY.join(' ')})` : ''}\n`);

  for (const cmd of commands){
    const text = cmd.text;
    const outPath = path.join(OUT_DIR, `${cmd.id}_${LANG_CODE}.mp3`);
    const rel = path.relative(ROOT, outPath);

    if (!text){ console.log(`  · skip   ${rel}  (empty text)`); skipped++; continue; }
    if (!FORCE && fs.existsSync(outPath)){ console.log(`  · skip   ${rel}  (exists; --force to redo)`); skipped++; continue; }
    if (DRY_RUN){ console.log(`  → would  ${rel}  "${text}"`); made++; continue; }

    try {
      const buf = ensureMp3(await synthesize(text, SARVAM_LANG), cmd.id);
      fs.writeFileSync(outPath, buf);
      console.log(`  ✓ wrote  ${rel}  "${text}"  (${(buf.length/1024).toFixed(0)} KB)`);
      made++;
    } catch (e) {
      console.error(`  ✗ FAIL   ${rel}  ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${made} ${DRY_RUN ? 'planned' : 'written'}, ${skipped} skipped, ${failed} failed.`);
  if (!DRY_RUN && made) console.log(`Listen to ./audio/commands/, then run ./scripts/build.sh\n`);
  if (failed) process.exit(1);
}

main();
