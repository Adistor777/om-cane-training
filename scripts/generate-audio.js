#!/usr/bin/env node
/* =============================================================================
   generate-audio.js  —  SOP narration generator (Sarvam Bulbul v3)
   =============================================================================

   WHAT THIS IS
   ------------
   A one-off generator you run ON YOUR MAC, from the terminal. It reads the SOP
   steps out of activities.js, sends each one to Sarvam's Bulbul v3 text-to-
   speech API, and writes a narrated MP3 per (activity x language) into ./audio/.

   It is NOT part of the app. It is never bundled, never shipped, never touches
   the no-build edit-refresh workflow. The app only ever sees the finished MP3s
   in ./audio/ (which then get copied into www/ at build time, like the demo
   video). The Sarvam API key lives in your shell environment, never in code and
   never in the app.

   FILE NAMING (the "derived path" convention the app relies on)
   -------------------------------------------------------------
   For an activity whose id is "sound-which", in Hindi, this writes:
       audio/sound-which_hi.mp3
   The app computes that exact path from the activity id + the selected
   language, so activities.js stays clean — no filenames stored in it.
   IF YOU RENAME THIS CONVENTION HERE, you must change it in index.html too
   (function audioPathFor()). They are two halves of one contract.

   ---------------------------------------------------------------------------
   SETUP (once)
   ---------------------------------------------------------------------------
   1. Node 22+ (you already have it for Capacitor).
   2. Put your Sarvam key in your shell — do NOT paste it into this file:
        export SARVAM_API_KEY="your_key_here"
      (add that line to ~/.zshrc to make it stick, or just run it each session)
   3. No npm install needed — this uses Node's built-in fetch (Node 18+).

   ---------------------------------------------------------------------------
   USAGE
   ---------------------------------------------------------------------------
   Generate ONE activity first (recommended before the full batch):
        node generate-audio.js --only sound-which

   Preview what WOULD be generated, spend nothing:
        node generate-audio.js --dry-run

   Generate everything that doesn't already exist:
        node generate-audio.js

   Re-generate even files that exist (e.g. after editing an SOP or changing voice):
        node generate-audio.js --force
        node generate-audio.js --only sound-which --force

   After generating, listen to the files in ./audio/. When happy, build:
        cp -r index.html activities.js audio www/
        # verify www/audio has the files BEFORE syncing:
        ls -lh www/audio
        npx cap sync android
        npx cap run android
   ============================================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

/* ---------------------------------------------------------------------------
   CONFIG — the few things you might tune.
   --------------------------------------------------------------------------- */
const LANGUAGES = {
  // app-code (used in filenames + the app's switcher)  ->  Sarvam BCP-47 code
  hi: 'hi-IN',   // Hindi
  ta: 'ta-IN',   // Tamil
  bn: 'bn-IN',   // Bengali
};

const MODEL    = 'bulbul:v3';
const SPEAKER  = 'shubh';        // Bulbul v3 default. Audition others (anushka was v2; v3 has shubh, aditya, ritu, priya, neha, ...). Speaker is per-request, not per-language.
const PACE     = 1.0;            // 0.5–2.0 for v3. <1 slows down; useful if narration feels rushed for children.
const FORMAT   = 'mp3';          // WebView-friendly (your demo-video work confirmed H.264/MP3-family plays reliably).
const SAMPLE_RATE = 24000;       // v3 default.

const API_URL  = 'https://api.sarvam.ai/text-to-speech';
const OUT_DIR  = path.join(__dirname, 'audio');
const ACTIVITIES_FILE = path.join(__dirname, 'activities.js');

const CHAR_LIMIT = 2400;         // v3 allows ~2500; stay safely under.

/* ---------------------------------------------------------------------------
   ARGS
   --------------------------------------------------------------------------- */
const args = process.argv.slice(2);
const FORCE   = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');
const onlyIdx = args.indexOf('--only');
const ONLY    = onlyIdx !== -1 ? args[onlyIdx + 1] : null;

/* ---------------------------------------------------------------------------
   LOAD activities.js ROBUSTLY
   We EXECUTE the file (it declares `const ACTIVITY_DATA = [...]`) rather than
   regex-scrape it — scraping also catches dataField ids and misses nothing
   cleanly. We wrap it so the const becomes a value we can read.
   --------------------------------------------------------------------------- */
function loadActivityData() {
  let src;
  try {
    src = fs.readFileSync(ACTIVITIES_FILE, 'utf8');
  } catch (e) {
    fail(`Could not read ${ACTIVITIES_FILE}\n  ${e.message}\n  Run this script from inside the om-app folder.`);
  }
  try {
    // The file is just a const declaration. Evaluate it and hand back the array.
    const fn = new Function(`${src}\n; return ACTIVITY_DATA;`);
    const data = fn();
    if (!Array.isArray(data)) throw new Error('ACTIVITY_DATA is not an array');
    return data;
  } catch (e) {
    fail(`Could not parse ACTIVITY_DATA from activities.js\n  ${e.message}`);
  }
}

/* ---------------------------------------------------------------------------
   TEXT PREP — turn an SOP step array into one spoken paragraph.
   - Joins steps with a sentence break so the voice pauses between them.
   - Expands "O&M" so it isn't read as "oh-ampersand-em".
   - Strips the escaped quotes used in the SOP text (e.g. \"Which sound?\")
     so they're spoken naturally, not announced.
   Keep this conservative — the content team owns the wording; we only smooth
   what TTS would otherwise mangle.
   --------------------------------------------------------------------------- */
function sopToNarration(sopSteps) {
  const cleaned = sopSteps.map(step => {
    let s = String(step).trim();
    s = s.replace(/O&M/g, 'orientation and mobility');
    s = s.replace(/&/g, ' and ');
    s = s.replace(/["“”]/g, '');           // drop double quote marks; the question still reads naturally
    s = s.replace(/['‘’](\w[\w\s-]*?)['‘’]/g, '$1'); // strip PAIRED single quotes around a word ('front' -> front) but keep possessives (arm's stays arm's)
    if (!/[.?!।॥]$/.test(s)) s += '.';      // ensure each step ends with a stop for prosody. Includes Indic danda (।) and double danda (॥) so Hindi/Bengali lines aren't given a redundant '.'
    return s;
  });
  return cleaned.join(' ');
}

/* ---------------------------------------------------------------------------
   SARVAM CALL
   POST JSON { text, target_language_code, model, speaker, pace,
               audio_format, speech_sample_rate }
   -> { request_id, audios: [base64, ...] }
   Audios may arrive in multiple chunks; concatenate before decoding.
   --------------------------------------------------------------------------- */
async function synthesize(text, sarvamLangCode) {
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

  if (!res.ok) {
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch (e) { detail = await res.text().catch(() => ''); }
    throw new Error(`HTTP ${res.status} — ${detail || res.statusText}`);
  }

  const json = await res.json();
  if (!json.audios || !json.audios.length) {
    throw new Error(`No audio in response (request_id ${json.request_id || 'unknown'})`);
  }
  const b64 = json.audios.join('');
  return Buffer.from(b64, 'base64');
}

/* ---------------------------------------------------------------------------
   MAIN
   --------------------------------------------------------------------------- */
async function main() {
  // Key check up front (skip if dry-run, which makes no calls).
  if (!DRY_RUN && !process.env.SARVAM_API_KEY) {
    fail('SARVAM_API_KEY is not set.\n  Run:  export SARVAM_API_KEY="your_key_here"\n  (Use --dry-run to preview without a key.)');
  }

  const data = loadActivityData();

  // Flatten to a work list of activities, preserving category for logging.
  // sopTranslations (optional) holds the per-language SOP text the content team
  // provides; we speak THAT, never a machine translation of the English.
  const activities = [];
  data.forEach(cat => {
    (cat.activities || []).forEach(act => {
      if (!act.id || !Array.isArray(act.sop)) return;
      activities.push({
        id: act.id, name: act.name, category: cat.category,
        sop: act.sop,
        sopTranslations: act.sopTranslations || null
      });
    });
  });

  let work = activities;
  if (ONLY) {
    work = activities.filter(a => a.id === ONLY);
    if (!work.length) {
      fail(`--only "${ONLY}" matched no activity.\n  Known ids: ${activities.map(a => a.id).join(', ')}`);
    }
  }

  if (!DRY_RUN) fs.mkdirSync(OUT_DIR, { recursive: true });

  const langEntries = Object.entries(LANGUAGES); // [[appCode, sarvamCode], ...]
  let made = 0, skipped = 0, failed = 0, planned = 0;

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Generating SOP audio`);
  console.log(`  model=${MODEL}  speaker=${SPEAKER}  pace=${PACE}  format=${FORMAT}`);
  console.log(`  languages=${langEntries.map(([a]) => a).join(', ')}`);
  console.log(`  activities=${work.length}${ONLY ? ` (--only ${ONLY})` : ''}\n`);

  for (const act of work) {
    if (!act.sopTranslations) {
      console.log(`  · skip   ${act.id}  (no sopTranslations yet — add translated SOP text in activities.js to generate audio)`);
      skipped += langEntries.length;
      continue;
    }

    for (const [appCode, sarvamCode] of langEntries) {
      const outPath = path.join(OUT_DIR, `${act.id}_${appCode}.mp3`);
      const rel = path.relative(__dirname, outPath);

      // Use the content team's translated text for THIS language. No machine
      // translation — if a language is missing, skip it cleanly.
      const steps = act.sopTranslations[appCode];
      if (!Array.isArray(steps) || !steps.length) {
        console.log(`  · skip   ${rel}  (no ${appCode} translation for ${act.id})`);
        skipped++;
        continue;
      }
      if (steps.length !== act.sop.length) {
        console.warn(`  ! ${act.id} [${appCode}]: ${steps.length} translated steps vs ${act.sop.length} English steps — they should line up. Generating anyway from the translation.`);
      }

      const narration = sopToNarration(steps);
      if (narration.length > CHAR_LIMIT) {
        console.warn(`  ! ${act.id} [${appCode}]: narration ${narration.length} chars exceeds ${CHAR_LIMIT}; too long for one request. Skipping — shorten the SOP or add chunking.`);
        failed++;
        continue;
      }

      if (!FORCE && fs.existsSync(outPath)) {
        console.log(`  · skip   ${rel}  (exists; use --force to redo)`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`  + plan   ${rel}`);
        console.log(`           "${narration.slice(0, 70)}${narration.length > 70 ? '…' : ''}"`);
        planned++;
        continue;
      }

      try {
        process.stdout.write(`  … gen    ${rel}  `);
        const buf = await synthesize(narration, sarvamCode);
        fs.writeFileSync(outPath, buf);
        console.log(`done (${(buf.length / 1024).toFixed(0)} KB)`);
        made++;
      } catch (e) {
        console.log(`FAILED`);
        console.error(`           ${e.message}`);
        failed++;
      }
    }
  }

  console.log(`\nSummary: ${DRY_RUN ? `${planned} would be generated` : `${made} generated`}, ${skipped} skipped${failed ? `, ${failed} failed` : ''}.`);
  if (!DRY_RUN && made > 0) {
    console.log(`\nFiles are in ./audio/ — listen, then build:`);
    console.log(`  cp -r index.html activities.js audio www/`);
    console.log(`  ls -lh www/audio   # confirm they landed BEFORE syncing`);
    console.log(`  npx cap sync android && npx cap run android\n`);
  }
  if (failed) process.exitCode = 1;
}

function fail(msg) {
  console.error(`\nERROR: ${msg}\n`);
  process.exit(1);
}

main().catch(e => fail(e.stack || e.message));
