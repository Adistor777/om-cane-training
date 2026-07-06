# MEMORY.md — O&M Cane Training

_Last updated: 2026-07-03_

## What this is
Offline-first Android app (`org.omcane.trainer`) for teachers running structured
orientation & mobility assessments with visually impaired children. Plain
HTML/CSS/JS, **no bundler** (deliberate — `activities.js` is content-team owned
and must stay editable without a build step). Wrapped via Capacitor 8.
Lives in `~/Desktop/om-app` on an M5 MacBook Air.

Closed research pilot: IIT Delhi + NCAHT, 3 schools, ~6 teachers.
Manager: Mansi (IIT Delhi). Collaborators: Flipkart UI/UX designer (peer
review), content team (SOP text + translations), legal team (compliance),
external developer friend (code audits).

Success = a verifiable, privacy-sound app ready for closed pilot sessions, with
clean seams for a future Supabase backend swap.

## Pilot schools (seeded with stable string IDs)
1. Saksham School, Noida
2. Rajasthan Netraheen Kalyan Sangam (RNKS), Jaipur
3. National Association of Blind, Kullu

Real teacher names still pending from Mansi — placeholder teachers for now.

## Supabase project — LIVE (2026-07-03), cloud phase unblocked
- **Project created, India region.** ID `nrnmxgggmqddhbsjtuob`; URL
  `https://nrnmxgggmqddhbsjtuob.supabase.co`; publishable key
  `sb_publishable_jrpvaGwr9d53AysVlTpLJg_qZepOmQh` (new-format anon key,
  RLS-protected, safe in client).
- **`supabase/schema.sql` ran successfully:** tables `schools`, `teachers`,
  `children`, `records`; RPCs `mint_research_id()` + `enrol_child()` (security
  definer, mints server-side `research_id`, requires an active roster teacher via
  `auth.uid()`); `jwt_school_id()`; RLS policies (school isolation via
  `app_metadata.school_id`); storage policy for a private `videos` bucket; seeded
  3 schools.
- **BUG — school-ID mismatch (must fix before any cloud read/write).** App seeds
  `sch_saksham_noida` / `sch_rnks_jaipur` / `sch_nab_kullu` (index.html ~L1014)
  and stamps every record's `schoolId` with those; `schema.sql` seeded
  `saksham-noida` etc. RLS matches JWT school_id against row school_id → mismatch
  = all inserts/reads denied. **DECISION: the app's `sch_*` IDs are canonical**
  (app is tested + stamps records). Fix = update schema seed + re-seed the live
  `schools` table (delete+insert; nothing references them yet).
- **Cloud path is not testable until ONE teacher auth user exists** with
  `app_metadata.school_id` set + a matching `teachers` row (`auth_user_id`
  linked). Mansi's real names can wait; provision one throwaway teacher
  (`saksham01@test.local`) to test enrol + RLS.
- **Build state going in:** `cap sync` clean (SCHEMA_VERSION=6), tests 35/35,
  consent code confirmed on `main`, debug APK installs on emulator. Emulator
  video-picker test parked for a real device (picker returns a `content://` URI —
  watch `commitPendingVideo` resolution).
- **NEXT (code, behind a `CLOUD_SYNC` flag, default OFF so offline pilot is
  untouched):** vendor `supabase-js` LOCALLY (no CDN — must boot offline; add
  `<script src="supabase.js">` before the inline script, copy to `www/`, add to
  the cap-sync step); init client; wire `enrol_child()` at Save-child
  (`upsertProfile` ~L2312, online-only, block NEW enrolment offline, keep
  `newResearchId()` as legacy/migration only); swap `verifyCredentials()` (~L1079)
  to `signInWithPassword`, keep stub as `PILOT_LOCAL_AUTH` fallback.

## Current state (committed on `feat/soundboard`, pushed, NOT yet merged to main)
- **Sound Library media player (this session) — built, verified, emulator-tested,
  committed + pushed on `feat/soundboard` (`0ae5844`).** Renders on activities
  with `soundboard: true` (the 5 sound-playing activities: `sound-which`,
  `sound-source`, `snddir-cane-count`, `slt-nocane`, `slt-withcane`), between the
  child bar and the record form.
  - Transport like Apple Music: play/pause, prev/next, shuffle, repeat
    off→all→one. Repeat-one loops a single sound (localization drills); shuffle
    randomizes the next sound so the child can't predict it during identification
    tests. Tap/arrow-key seek bar with elapsed/total time; animated equaliser on
    the playing pad. Player is always visible (quiet idle state before a sound is
    picked).
  - **Category tabs** (Animals / Household / Traffic & Outdoors / Instruments)
    show one group's pads at a time, so panel height stays fixed no matter how
    many sounds get added (this was a deliberate fix — the full grid made the
    panel too tall and pushed the record form down).
  - `buildSoundboard(act)` + `SB` controller (one `<audio>`, the library is the
    queue) live in `index.html`. `SB.reset()` on navigation so audio never bleeds
    across screens. Offline: plays bundled mp3s from `./sounds` inside the
    Capacitor WebView, no server.
  - **Content-team owned, no-coder editable**: the sound list (`SOUND_LIBRARY`,
    `{file,label,group}`) AND which activities show it (`soundboard: true`) both
    live in `activities.js`. Add a sound = drop an mp3 in `sounds/` + one line.
    20 sounds, 4 groups.
  - Design: warm-paper, monoline icons (no emoji), category accent. **Flag for the
    Flipkart designer** — the player is a deliberately richer-accent surface
    (accent on play button + progress fill + lit toggles + current pad), beyond
    the "accent in two spots" guardrail. Flagged, not yet reviewed.
  - Committed via a reconstructed record-only `index.html` so the record-screen
    work and the soundboard are two isolated commits, never mixed.
- **Record-screen redesign + teacher video evidence (prior session) — now
  COMMITTED on `feat/soundboard` (`167afc0`).** No longer uncommitted.
  - Unified `?` reference sheet across record + child-picker screens via shared
    `buildRefSheet(act, domId)` + `toggleRefSheet(btn, domId)`. Both open the
    same full sheet: demo video → SOP step sequence → facilitator note → Sarvam
    narration switcher. Headless `<details class="sop-headless">` — invisible when
    closed.
  - Record screen leaned out: removed the always-open "How to run this" SOP panel
    at the bottom; everything now folds behind the `?`.
  - **Teacher video-evidence capture** on the record form (`videoUploadMarkup`,
    `handleVideoPick`, `clearPendingVideo`, `commitPendingVideo`). Architecture:
    pick stages metadata only (`pendingVideo`); on Save, `commitPendingVideo`
    writes the file to app DATA dir at `videos/{researchId}_{timestamp}.{ext}`
    (pseudonym, never the name); the record stores only `rec.video = filename`
    (a pointer, NOT base64 into Store). Same seam a future Supabase swap uses.
    On web preview, returns `stored:false` — no bytes copied, record still notes a
    clip was taken.
  - CSV export gained a `Video file` column (safe in default no-PII export —
    filename is pseudonymous).
  - Hub: active-child chip removed (selection happens later at the picker).
  - Picker: duplicate "Add student" tile removed; disclosure form is the single
    add path.
  - Visual audit: `--ring-active` token at 3px; focus-ring offsets unified (2px
    standalone controls / inset full-width rows / 3px large cards). Dead code
    removed: `openPickerAddForm`, `togglePickerSop`, `toggleActRefSheet`,
    `.pick-add`, `.chip-swap`.
- **Child picker between activity tap and run screen** (committed to main):
  `showChildPicker` Netflix-style face grid; tap a child → active + run.
- **Activities navigation = two-level drill-in**: category grid
  (`showActivityList`) → single-category list (`showCategory`) → activity.
- **Pseudonymisation refactor** (F1/F8/F9) live: `researchId` (`OM-XXXX-XXXX`)
  minted + preserved; records store `researchId` + `profileId`, not child name;
  CSV pseudonymised by default (PII behind `includePII`); cache file deleted
  post-share; migration shim rewrites profiles before records; `SCHEMA_VERSION = 2`.
  (`video` field is additive/backward-compatible — no migration needed; schema
  stays at 2.)
- **`PILOT_ALLOW_SELF_PROVISION = false`** — hides teacher-facing school/teacher
  creation; underlying functions kept as admin primitives.
- **Login**: school dropdown → login ID → password → `verifyCredentials()` stub
  (accepts any non-empty password — correct pilot stub; real check is Supabase
  swap only). Login IDs: `saksham01`, `rnks01`, `nab01`.

## Production roadmap — agreed to solve one by one (ordered by rework risk)
Aditya's call at end of last session: tackle each production issue in turn, plus
a few more features to add. The build is a CORRECT PILOT BUILD — none of this is
wrong for a closed pilot; these are the production gaps.

1. **Cross-device child ID** — HIGHEST rework risk; gets more expensive every day
   real records accumulate under the local scheme. `profileId` is device-local;
   `researchId` is minted on-device, so the same child on two tablets = two IDs
   that never join. Fix = server-assigned ID on enrolment (ODK Central "Entities"
   pattern). **Gated on R&D email** (multi-device-per-child confirmation). Draft
   the R&D email FIRST — unblocks this without writing throwaway code.
2. **Video consent gate — DONE (2026-07-03).** Verifiable per-child consent
   envelope (DPDP Rule 10): `videoConsent`, `videoConsentBy` (required),
   `videoConsentRelation` (required), `videoConsentMethod`, `videoConsentOn`,
   `videoConsentWithdrawnOn`. UI lock in `videoUploadMarkup`, fail-closed
   enforcement in `commitPendingVideo`. Withdrawal preserves the grant record
   (audit trail) and offers clip erasure. We defined the consent fields from the
   Rules directly rather than waiting on legal — legal now REVIEWS a finished
   implementation (`compliance/DPDP-COMPLIANCE-MAP.md`). Still tied to the R&D
   email's identified-video question for whether video ships in the pilot.
3. **Supabase auth swap** — `verifyCredentials()` is a stub, not authentication;
   anyone with the app + a login ID is in. Production = `supabase.auth
   .signInWithPassword()` (seam already designed; only the function body changes).
4. **Uploader + cloud storage** — video currently never leaves the device (no
   uploader). Production needs: Uploader seam (mirror Store, do NOT bolt onto it),
   Supabase storage bucket, offline queue + retry, delete-everywhere (deleting a
   record/child also deletes the cloud file), returned URL saved on the record.
5. **Row-Level Security / multi-tenant isolation** — the moment Supabase lands,
   need `school_id` on every table + RLS policies + JWT school claim at login, or
   one school reads another's children.
6. **Video memory fix — DONE (2026-07-03).** `commitPendingVideo` copies clips
   in 3 MB slices (writeFile + appendFile), so peak memory is one chunk for any
   clip length; failed writes delete the partial file; `handleSave` toasts
   honestly on a failed clip store (no silent loss). Chunk size is a multiple
   of 3 bytes so per-chunk base64 decodes cleanly.
7. **Play Store production release** — closed pilot = internal testing track
   (invite-only by Gmail). Data Safety answers drafted
   (`compliance/PLAY-DATA-SAFETY.md`); privacy policy drafted, needs a public
   hosting URL. KEY FINDING (2026-07-03): target audience is teachers (18+),
   children never operate the app → declare 18+ and the Families/
   Designed-for-Families review should NOT trigger. Children's data is still
   fully disclosed on the form.

Plus: **a few more features to add** — Aditya to name them next chat.

## Other on the horizon
- **Consent/withdraw/erasure envelope (F9) — video side DONE (2026-07-03):**
  withdrawal flow, clip erasure on withdrawal, and file-level deletion in
  `deleteRecord`/`deleteProfile`/`clearAllData` (no orphaned clips on disk).
  Remaining F9 scope: assessment-data consent is paper-only (Part A of
  `compliance/GUARDIAN-CONSENT-FORM.pdf`); mirror in-app only if legal asks.
- **File split** (`index.html` → `styles.css` + `store.js` + `app.js`) — its own
  branch, before feature work.
- **Audio pipeline** — blocked on real translated SOP text from content team
  (Hindi, Tamil, Bengali via Sarvam Bulbul v3).
- **Architecture one-pager** — offered, not yet produced.

## Open design notes
- Child picker: selecting a child sets the *global* active child (persists after
  leaving the activity). Run-scoped selection would be a separate seam — flagged,
  not built.
- Category grid: keep the count pill on tiles, or is the description subtitle
  enough? Pending Flipkart designer review.

## Key principles
- **Un-backfillable decisions first**: child ID scheme, consent envelope, schema
  version. Pseudonymisation was sequenced before any upload code for this reason.
- **`www/` is the recurring gotcha**: root `index.html` is source of truth;
  `www/index.html` is the gitignored build copy the app loads. Every code session
  ends with `cp index.html www/index.html && npx cap sync android`, then grep the
  built assets to confirm. Branch switches don't touch `www/`.
- **Stale APK**: if the emulator shows old behavior after a clean sync, it's a
  stale install, not stale assets — `./gradlew clean installDebug` (full reinstall,
  not Apply Changes / hot reload). Diagnosed exactly this on 2026-06-30: root +
  `www/` + built assets all had the code; the install was old.
- **Real password auth cannot live on-device** — APK ships check + comparison
  value together. `verifyCredentials()` stub is the correct pilot approach.
- **Color does one job per surface**: category hue on group/tile header only.
- **TTS does not translate**: Sarvam speaks text as given.
- **`ensureSchoolsSeeded()` skips if schools already exist** — clear old seed on
  emulator before new names appear.

## Working approach
- **Extreme build mode is default**: expert engineer/UX designer, working code,
  pragmatic calls stated, skip research framing unless asked.
- One command at a time with an explicit success check before proceeding.
- Decision-first, then code. One clear recommendation over a menu.
- Static verification before emulator: JS parse via `new Function()`; integrity greps.
- Dedicated branches: checkout → work → emulator-verify → push → merge → delete.
- Feature commits stay focused — keep MEMORY.md / TRACKER.md out of feature
  commits; regenerate them at wrap-up, commit separately.
- Complete files over diff instructions.
- PDF for stakeholder handoffs; visuals over code for design audiences.

## Stack & environment
- Plain HTML/CSS/JS, no bundler; Capacitor 8 (Preferences 8.0.1, Filesystem
  8.1.2, Share 8.0.1, SplashScreen 8.0.1).
- Repo: `Adistor777/om-cane-training` (private).
- M5 MacBook Air, PyCharm, Pixel 10 Pro XL emulator (API 37 arm64); `JAVA_HOME`
  → Android Studio's bundled JDK 21.
- Audio: Sarvam Bulbul v3 REST; `.env` (gitignored), `.env.example` committed.
- Compliance: India DPDP Act 2023 + Rules 2025; penalties up to ₹200 crore for
  children's data; consent burden on app as data fiduciary.

## Key files
- `index.html` — source of truth (incl. `buildSoundboard` + `SB` player controller)
- `activities.js` — content-team owned; holds `ACTIVITY_DATA`, the `soundboard:true`
  flags, and `SOUND_LIBRARY` (soundboard sound list). Do not modify without content team.
- `sounds/` — bundled soundboard mp3s (gitignored, like `audio/`); synced to `www/`
- `MEMORY.md`, `TRACKER.md`, `DESIGN_NOTES.md`, `REVIEW_PACKET.md`

## Useful commands
JS syntax check:
```
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const m=html.match(/<script[^>]*>([\s\S]*?)<\/script>/g)||[]; let body=m.map(s=>s.replace(/<\/?script[^>]*>/g,'')).join('\n'); try{ new Function(body); console.log('JS parse: OK'); }catch(e){ console.log('JS parse ERROR:', e.message); }"
```
Post-sync verify (record-screen work):
```
grep -c "buildRefSheet" ~/Desktop/om-app/android/app/src/main/assets/public/index.html
```
Post-sync verify (soundboard reached the build + sounds bundled):
```
grep -c "buildSoundboard" ~/Desktop/om-app/android/app/src/main/assets/public/index.html
ls ~/Desktop/om-app/android/app/src/main/assets/public/sounds | wc -l   # expect 20
```
Clean reinstall (stale APK fix):
```
cd ~/Desktop/om-app/android && ./gradlew clean installDebug
```
DevTools storage dump (chrome://inspect):
```
Store._keys().filter(k=>k.startsWith('rec_')).forEach(k=>console.log(k, JSON.stringify(Store.getJSON(k,[]),null,2)))
```
