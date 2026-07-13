# TRACKER.md — O&M Cane Training

_Last updated: 2026-07-13_

## Done this session (2026-07-13 — Direction command board, `feat/sop-content`, UNMERGED)
NOTE: this branch is cut from `main`; the cloud-sync wrap lives on
`feat/cloud-sync` (its TRACKER block will collide here on merge — keep both).
- [x] **Direction category restructured** (SOP video #1 received): `Basic
      Commands` (left/right/forward/backward/jump/clap/stop/turn-around) +
      `Advanced Commands` (N/S/E/W; intercardinals as commented adds).
      Ordering grounded in O&M progression (egocentric → cardinal; TAPS/APH).
      Old ids dir-leftright/dir-frontback retired — pre-pilot, orphaned test
      records accepted knowingly.
- [x] **Command board shipped** (commit `b30372f`): tappable pads that SPEAK
      the cue from bundled Sarvam mp3s (`audio/commands/{id}_{lang}.mp3` —
      derived-path contract with CB.play()); spoken text under English label;
      `Surprise me` anti-prediction random; language follows `audioLang`;
      hi-fallback + toast when a file is missing; CB.reset() on nav.
      Commands are content-team editable in activities.js.
- [x] **`scripts/generate-command-audio.js`** — sibling of generate-audio.js,
      same voice (shubh), pace 0.9, dedupes shared ids, skips empty langs.
- [x] **build.sh step 3b** — `audio/`, `sounds/`, `demo-*.mp4` now copied to
      `www/` by the build (was manual).
- [x] **SOPs rewritten from demo video #1** + facilitator notes; video wired
      as `demo-direction-basic.mp4` (root, gitignored like all media).
      Tests 35/35.

## NEXT (sop-content track)
- [ ] **Aditya, Mac:** `node scripts/generate-command-audio.js` (needs
      SARVAM_API_KEY; Sarvam API unreachable from cloud sandbox), listen to
      ./audio/commands/, then `./scripts/build.sh` + emulator check of the
      Direction screens.
- [ ] **Videos #2 and #3** (next chats): same per-activity workflow — deduce
      SOP from video, wire demo file, adjust dataFields.
- [ ] Push `feat/sop-content`; merge once the Direction screens are verified.
- [ ] (Parallel track, unchanged) `feat/cloud-sync` device test + merge.

## Done earlier (2026-07-06 — workflow hardening + file split)
- [x] **`scripts/build.sh` — the ONE build command.** Replaces the remembered
      `cp … && npx cap sync` ritual. Steps: school-ID consistency guard
      (app.js seedSchools vs supabase/schema.sql — fails the build on drift),
      JS parse check (store.js + app.js in load order), copy all web assets to
      `www/`, `npx cap sync android`, byte-compare built assets vs `www/`.
      First real run on the Mac: all green.
- [x] **File split shipped** (`refactor/file-split`, merged + pushed).
      `index.html` (3,024 lines) → `index.html` markup shell (87 lines) +
      `styles.css` (look + design guardrails moved to its header) +
      `store.js` (storage seam ONLY — the cloud swap point) + `app.js`
      (rendering/nav/behaviour). Load order: activities.js → store.js → app.js.
      Zero behavior change: every original line accounted for; tests 35/35;
      emulator-verified after `gradlew clean installDebug`.
      test-batch1.js now inlines all three scripts; README / CONTRIBUTING /
      ARCHITECTURE / generate-audio.js advice all updated.
- [x] **`supabase/schema.sql` seed fixed** to canonical `sch_*` school IDs
      (the RLS-mismatch bug caught 2026-07-03). Committed.
- [x] **Manager status report** → `docs/handoffs/OM-Status-Report-2026-07-06.pdf`
      (3 pp: status by area, last-session fixes, next steps, risks; no names).
- [x] Leftover MEMORY/TRACKER wrap-up from 07-03 committed; all work pushed
      (`main` = `ef4eae1` + wrap-up).

## NEXT SESSION — FIRST tasks (cloud wiring; file refs updated post-split)
- [ ] **Dashboard (Aditya, ~10 min, SQL already drafted in chat):**
      (1) Table Editor: schools/teachers/children/records present, 3 school rows;
      (2) re-seed `schools` to `sch_*` IDs (delete+insert);
      (3) Storage: create PRIVATE bucket `videos`;
      (4) Auth: add `saksham01@test.local` (auto-confirm) + SQL to set
      `raw_app_meta_data.school_id = 'sch_saksham_noida'` and insert the linked
      `teachers` row. Without this, enrol_child + RLS can't be tested.
- [ ] **Code wiring (branch `feat/cloud-sync`, behind `CLOUD_SYNC` flag,
      default OFF so the offline pilot is untouched):**
      vendor `supabase-js` locally (NO CDN — must boot offline;
      `<script src="supabase.js">` BEFORE store.js in index.html; add to
      build.sh copy list); init client with URL + publishable key;
      wire `enrol_child()` RPC into Save-child (`upsertProfile`, app.js ~L351 —
      online-only, block NEW enrolment offline with a clear message,
      `newResearchId()` stays as legacy/migration path only);
      swap `verifyCredentials()` (app.js ~L280) to `signInWithPassword`,
      keep the stub as `PILOT_LOCAL_AUTH` fallback.
- [ ] **Verify on a real Android device** (emulator video-picker test parked —
      picker hands a `content://` URI; watch `commitPendingVideo` resolution).

## R&D DECISIONS — locked 2026-07-03
1. **Architecture A** — server-assigned child ID at enrolment (online-only
   enrolment, one moment of connectivity per child; assessments stay offline).
2. **Video IS required** — consent gate + uploader ship in the pilot.
3. **Multi-device-per-child: YES** — same child joins on one server ID.
4. **Analysis: BOTH** longitudinal and cross-child (research_id is the join
   key; both indexes in schema).

## Production roadmap (ordered by rework risk)
- [x] **1. R&D email** — sent + answered (decisions above).
- [ ] **2. Cross-device child ID** — design done (`enrol_child()` RPC in
      `supabase/schema.sql`, deployed). Remaining: dashboard steps + app wiring
      (next session, above).
- [x] **3. Video consent gate** — DONE 2026-07-03 (verifiable envelope,
      audit-honest withdrawal, erasure prompt, F9 file-level deletion,
      consent-evidence photo + serial).
- [ ] **4. Supabase auth swap** — next session (see wiring task).
- [ ] **5. Uploader + cloud storage** — bucket `videos` (private), path
      `{school_id}/{research_id}_{ts}.{ext}`. Must re-check `videoConsent`
      before upload; erasure honoured server-side (delete-everywhere);
      re-review `DPDP-COMPLIANCE-MAP.md` before shipping.
- [ ] **6. Row-Level Security** — policies deployed with schema; VERIFY with the
      test teacher once wired (cross-school read must fail). DECISION flagged
      for legal: child name/DOB server-side behind RLS (multi-device picker);
      research extracts stay research_id-only.
- [x] **7. Video memory fix** — DONE 2026-07-03 (3 MB chunked copy).
- [ ] **8. Play Store release** — Data Safety drafted
      (`compliance/PLAY-DATA-SAFETY.md`); needs privacy policy at a public URL;
      target audience 18+ (teachers).

## Waiting on humans
- [ ] **Legal:** fiduciary entity of record, grievance officer, effective date,
      Rule 10 due-diligence sign-off, educational-institution exemption answer.
      All flagged in `compliance/DPDP-COMPLIANCE-MAP.md`.
- [ ] **Content team:** verify + typeset Hindi consent form; translated SOP
      text (audio pipeline still blocked on this).
- [ ] **Pilot manager:** real teacher names for the seed.
- [ ] Print consent forms WITH serial numbers once legal placeholders filled.

## Backlog
- [x] ~~File split~~ — DONE 2026-07-06.
- [ ] Consent envelope for BROADER assessment data (Part A of paper form) —
      mirror in-app only if legal asks.
- [ ] Offline-enrolment queue — only if the online-only enrolment rule proves
      painful in the field (watch Kullu). Flagged 2026-07-06, not committed to.

## Standing reminders
- **Every code session ends with `./scripts/build.sh`** (it does the copy,
  sync, ID guard, parse check, and built-asset verify). Stale emulator →
  `cd android && ./gradlew clean installDebug`.
- Source of truth = root `index.html` + `styles.css` + `store.js` + `app.js`.
  `www/` is build output (gitignored) — never edit.
- Media (`audio/`, `sounds/`, `*.mp4`) stays gitignored.
- Feature commits stay focused — MEMORY/TRACKER committed separately.
- `.env` holds `SARVAM_API_KEY` (gitignored).
