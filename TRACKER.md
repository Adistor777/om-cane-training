# TRACKER.md — O&M Cane Training
_Last updated: 2026-07-21 (design-overhaul session wrapped)_
## STATE (2026-07-21) — full UX overhaul landed; batch flow replaces single-child
Big design session, all committed on main (through `0efdedb`), working tree
clean, ~6 commits ahead of origin at wrap-up (push may already be done).
Details in MEMORY.md's 2026-07-21 section. Headlines: BATCH FLOW is now THE
flow (roster multi-select → focus-flow scoring one student at a time →
review → one record per scored child; `Achieved` derives from the score;
skipped = no record). ? sheet is a centred cuboid MODAL; window.confirm
replaced by styled askConfirm dialogs; activity cards = media-forward with
object still-life SVG thumbnails (no video frames — clips not final);
contextual onboarding (hints + persistent ? callout, per-teacher flags);
home-dot removed from header; font Inter → Arimo. NOTE for older docs: any
instruction that says "card → child picker → record screen" now reads
"card → roster select → focus flow".
## NEXT — one list, in order (2026-07-21 refresh)
- [ ] **Aditya:** `git push origin main` if not yet pushed (check `git status`).
- [ ] **Aditya:** fresh `assembleDebug` APK → Mansi via the documented loop
      below (batch flow + new design is a big review drop; login unchanged).
- [ ] **Aditya, Mac:** run `./scripts/generate-thumbs.sh` — the two SLT demo
      clips exist only on the Mac (posters unused on cards now, but the script
      + build copying stay ready for when videos finalise).
- [ ] **Content:** narrated welcome — "listen to how this app works" on the
      welcome screen (Sarvam script EN/HI + generate-audio run). Script is the
      blocker; no code slot built yet.
- [ ] **Content:** Hindi SOP drafts still machine-drafted — verify before pilot.
- [ ] **Pilot watch-item:** focus-flow auto-advance beat is 350ms — validate
      with real teachers; dial lives in batchFlowInit's setTimeout.
- [ ] Optional housekeeping: prototypes/ has 5 draft HTML files (safe to prune).
## STATE (2026-07-14 pm) — reconcile resolved; repo clean
Soundboard player code confirmed ON main (`git grep buildSoundboard HEAD -- app.js`
= 2 hits — it landed via an earlier merge, outside the recent-log window).
All feature branches (feat/cloud-sync, feat/password-login, feat/sop-content,
feat/soundboard) fully merged into main and pruned local + remote;
`shell-login-home` kept (2 unmerged prototype commits). Stale sound-direction
merge instruction removed from NEXT (that work was already on main,
`f406c55`/`21d1c7d`). Remaining work is Mac-side: SLT emulator verify,
SLT narration, toy-faded demo.
## STATE (2026-07-14 am) — Straight Line Travel done; soundboard finally committed
Straight Line Travel (Category 4) rebuilt from 3 demo videos into THREE
stages — Without Cane → With Cane + Push Toy → With Cane (toy faded). The
push toy on the cane is a stigma-breaking storyline (positive association),
a scaffold meant to fade → hence 3 stages. All app-sound (`soundboard:true`);
record fields = steps + times-drifted + mastery + notes. Commit `9ee6e2c`,
pushed. Demo videos wired (`demo-slt-nocane.mp4`, `demo-slt-withcane-toy.mp4`);
toy-faded `slt-withcane` has no demo yet.
DRIFT FOUND: the soundboard two-tab was NEVER actually on main — it was
uncommitted in the working tree despite last session's notes saying "pushed".
Landed today as `936e05e`. The soundboard PLAYER CODE also isn't in main's
recent log → likely on an unmerged branch; RECONCILE (NEXT). Emulator verify
of SLT still PENDING (Aditya pushed before the clean install).
## Manager review loop (decided 2026-07-13)
Mansi reviews on HER PHONE via the debug APK — no emulator, no Play Store
yet. Per update: `./scripts/build.sh` → `cd android && ./gradlew
assembleDebug` → rename `app-debug.apk` with the date → WhatsApp as a
DOCUMENT (or Drive). Her first install: allow-from-source once + Play
Protect "Install anyway". Login for review: Saksham / `saksham01` / any
non-empty password (offline stub — password not verified until the cloud
flag flips; told to Mansi). CONSENT CAVEAT: bundled faces/ photos ride
along in every APK — strict option is to empty faces/ for her builds.
Debug key = only Aditya's Mac can build over-installing updates.
## NEXT — one list, in order
- [ ] **Aditya, Mac:** emulator-verify Straight Line Travel — three cards
      (Without Cane / With Cane + Push Toy / With Cane), each → child picker →
      record screen with the sound player + four fields (steps, times drifted,
      Got it/With help/Not yet, notes), `?` plays the demo (3rd card has none),
      test save lands. Stale APK → `cd android && ./gradlew clean installDebug`.
- [ ] **Aditya, Mac:** SLT English narration —
      `node scripts/generate-audio.js --only slt-nocane slt-withcane-toy slt-withcane`,
      then `./scripts/build.sh`, `cd android && ./gradlew installDebug`.
- [x] **RECONCILE the soundboard branch state — RESOLVED 2026-07-14:**
      `buildSoundboard`/`SB` IS in main's `app.js` (landed via an earlier
      merge — just outside the recent-log window checked last session).
      `origin/feat/soundboard` has 0 commits not in main; a fresh clone
      builds the player fine. Fully merged branches (feat/cloud-sync,
      feat/password-login, feat/sop-content, feat/soundboard) pruned local
      + remote; `shell-login-home` kept (2 unmerged prototype commits).
- [ ] **Film + wire the toy-faded demo** for `slt-withcane` (its `videoFile`
      is empty — no clip of plain-cane travel yet). Compress + drop in root.
- [ ] **Content team:** verify the SLT Hindi SOP drafts (machine-drafted).
- [ ] **Aditya, Mac:** emulator-verify Sound + Direction (ALREADY ON MAIN —
      `f406c55`/`21d1c7d`; the `feat/sound-direction` branch is gone, no merge
      needed; stale merge instruction removed 2026-07-14): card grid
      (4 activities, Group pill on Counting Steps — Group) → group card goes
      STRAIGHT to record screen (no child picker, "Whole group" bar, NO video
      control) → save → record shows "Group" → per-child activity still asks
      for a child and shows video control.
      Stale APK → `cd android && ./gradlew clean installDebug`.
- [ ] **Aditya, Mac (10 min):** English narration —
      `node scripts/generate-audio.js --only dir-basic-commands` (+ advanced;
      after merge add the four snddir-* ids; plain run for ALL activities
      before the next school demo). Then `./scripts/build.sh`,
      `cd android && ./gradlew installDebug`.
- [ ] **Aditya:** push everything — `git push origin main`
      (main's push is what refreshes project-knowledge sync).
- [ ] **Optional trim:** `demo-snddir-steps-solo.mp4` is 23 MB (9½ min,
      already re-encoded from 87 MB). If APK size bites, trim to the best
      ~2 min on the Mac; filename stays, no code change.
- [ ] **Cloud device test** (when the real device is handy): flip
      `CLOUD_SYNC=true`, build, install. Matrix: wrong password online FAILS;
      new child online → `OM-XXXX-XXXX` in `children`; airplane mode → new
      child blocked, edit works; cross-school RLS (second user, different
      school_id, sees none); parked video-picker test (`content://` URI →
      `commitPendingVideo`). Flag back to false after.
- [ ] **Video #4** (next chat): per-activity workflow — deduce SOP from
      video, simplify to ≤4 steps, wire demo file, mastery+teacherNotes.
- [ ] **Content team:** verify Direction + Sound + Direction Hindi SOP drafts;
      deliver ta/bn text (paste into sopTranslations → run generator — no code).
- [ ] **Consent check** before any APK leaves the team: bundled photos of the
      demo children (faces/) need guardian consent on file.
- [ ] **Legal (flagged):** group activities save no video by design (consent
      is per-child; a group clip can't be verified against unidentified
      children). If researchers want group footage, legal must define a
      group-consent envelope first.
## Done 2026-07-14 (Straight Line Travel three-stage + soundboard commit landed)
- [x] **Category 4 rebuilt from 3 demo videos into THREE stages**:
      `slt-nocane` (travel by ear) → `slt-withcane-toy` (push toy on the cane —
      the stigma-breaking storyline) → `slt-withcane` (toy faded, plain cane —
      goal state). App sound source (`soundboard:true` on all three). Fields:
      `steps` (count) + `veer` "Times drifted off line" (count) + `result`
      (mastery) + `notes` (teacherNotes). Commit `9ee6e2c`, pushed to main.
      Mechanics confirmed by Aditya (push toy = positive-association scaffold
      meant to fade — hence motivate → skill → independence). Hindi drafts
      machine-drafted, flagged. `slt-withcane` meaning shifted (was "With Cane
      (Push Toy)") — pre-pilot orphan records accepted knowingly.
- [x] **Demo videos** `demo-slt-nocane.mp4` + `demo-slt-withcane-toy.mp4`
      compressed (~640px CRF30) and wired; gitignored, build-copied.
      `slt-withcane` (toy-faded) has NO demo filmed yet → `videoFile: ""`.
- [x] **Applied block-only** to Category 4 (backup + diff proving scope), then
      committed as its OWN commit, kept separate from the soundboard two-tab.
- [x] **Landed the soundboard two-tab** that had been sitting uncommitted:
      commit `936e05e` (staged the `SOUND_LIBRARY` hunk alone via `git add -p`,
      keeping SLT in a separate commit). Both pushed: `4810a2c..9ee6e2c`.
- [!] **DRIFT LESSON (2026-07-14):** `git log` showed main still on the 4-group
      `SOUND_LIBRARY` — last session's "committed + pushed" note was false; the
      two-tab lived only in the working tree. The soundboard PLAYER CODE is
      likewise missing from main's recent log. **RULE: verify `git log` /
      `git status` before writing "done / pushed"; reality lives in git, not the
      notes.** Also delete throwaway `.bak` files from the tree (removed
      `activities.js.sltbak`) so they don't look like a second source file.
## Done 2026-07-14 (soundboard two-tab)
- [x] **Sound Library → two tabs.** Old groups (Animals / Household /
      Traffic & Outdoors / Instruments) collapsed into **Recommended sounds**
      (Clap, Cuckoo, Whistle, Dog, Cat — listed first, so it is the default
      open tab) and **Sounds** (the other 17). Driven purely by the `group`
      field in `SOUND_LIBRARY`; no code touched. Shared library, so the two
      tabs now show on EVERY `soundboard:true` activity (Sound, Sound +
      Direction, Straight Line Travel), not just Category 3.
- [~] Applied via a **surgical in-place patch** to the `SOUND_LIBRARY` block
      ONLY (abort-unless-exactly-one-block + byte-identical-outside guard +
      `.soundbak` backup + printed diff). Emulator-verified. **CORRECTED
      2026-07-14: this was NOT actually committed/pushed last session — it sat
      uncommitted in the working tree and only landed on main today as
      `936e05e`.** See the drift lesson above.
- [x] Added `sounds/clap.mp3` + `sounds/whistle.mp3` (synthetic placeholders,
      generated locally). `sounds/` is gitignored → NOT in the repo; a fresh
      setup needs them re-copied. Real recordings flagged for content team.
- [!] **Incident + lesson (2026-07-14):** an earlier whole-file `cp` of
      `activities.js` from the stale GitHub-synced copy reverted richer local
      work (Direction command boards, Sound + Direction restructure). Recovered
      via undo. **RULE: never overwrite the whole `activities.js` from a synced
      snapshot — edit only the targeted block, with a backup and a diff that
      proves nothing else moved.**
## Done 2026-07-13 (second wave pm — Sound + Direction, `feat/sound-direction`)
- [x] **Category 3 rebuilt from the four SOP demo videos (#2)**: `Near-Far`
      (ears only) → `Near-Far with Cane` (cane points to / touches source) →
      `Counting Steps — Group` → `Counting Steps — Individual` (steps count +
      mastery). Old ids snddir-clap / snddir-cane-count retired knowingly.
      SOPs ≤4 crisp steps deduced from video frames (sandbox ASR blocked:
      HF + Sarvam both 403 behind proxy — frames-only workflow held up);
      craft lives in facilitatorNote; Hindi drafts machine-drafted, flagged.
- [x] **Group-activity seam** (`group:true` in activities.js, content-team
      editable): category card gets a Group pill and routes STRAIGHT to the
      record screen; child picker guarded; "Whole group" bar replaces child
      bar; handleSave writes `{group:true, values}` — no researchId/profileId;
      display name "Group"; CSV Research ID column = `GROUP`; video evidence
      control not rendered and commit skipped (per-child consent can't cover
      an unidentified group — fails closed, DPDP).
- [x] **Demo videos wired + compressed**: 87→23 MB (solo), 19→2.8, 18→2.0,
      6→1.1 MB (640p CRF 30/31). Filenames demo-snddir-*.mp4, gitignored,
      build-copied by step 3b.
- [x] **Tests: SUITE 8 (group seam), 40/40.** Full `./scripts/build.sh` green
      in sandbox (school-ID guard, parse, copy, cap sync, byte-compare).
## Done 2026-07-13 (Direction command board, `feat/sop-content`)
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
## Done same day, second wave (2026-07-13 pm — Direction polish + record redesign)
- [x] **Command cues → ENGLISH only** (`8ec64d3`): label IS the cue,
      `audio/commands/{id}_en.mp3`, voice **priya** (v3 default shubh tested
      flat for kids; alternates listed in the script). Sarvam multilingual
      belongs to SOP narration, not cues.
- [x] **English SOP narration first-class + DEFAULT** (`1fdf95e`): 'en' speaks
      sop[] itself (no translation needed), added to AUDIO_LANGS first +
      generator; switcher renders even without translations. **ta/bn stay
      disabled by design** until the content team delivers translated text —
      no machine translation for teacher-facing content; not a pilot blocker
      (all 3 pilot schools are Hindi-belt). Direction Hindi drafts are
      machine-drafted and STILL NEED content-team verification.
- [x] **Record form redesign** (`5849750`): one-tap mastery scale (Got it /
      With help / Not yet — plain-language independent/prompted/unable) + new
      collapsed **Teacher's notes** section (progressive disclosure). New
      generic field types `mastery` + `teacherNotes`.
- [x] **SOPs cut to 4 short steps** each; craft moved to facilitatorNote;
      Hindi re-aligned 1:1.
- [x] **Demo children** Aditya + Vaishu: seeded on empty installs, photos from
      gitignored `faces/` (build-copied); boot REPAIR pass attaches photos to
      photo-less same-name profiles (`1ea7cd2`). PRIVACY: bundled real-child
      photos need guardian consent before any build leaves the team.
- [x] **`android:allowBackup=false`** — Google was silently backing up child
      data AND resurrecting old profiles across reinstalls. LOCAL-ONLY change
      (android/ is gitignored) — re-apply if android/ is ever regenerated.
- [x] Names → **Basic / Advanced**; category-level **? sheet** (help[] +
      helpVideo in activities.js — any category can opt in) (`ce01be1`).
- [x] Both audio generators read SARVAM_API_KEY from .env (`82548fd`).
## Done 2026-07-06 pm (cloud wiring, `feat/cloud-sync`)
- [x] **Code wiring complete, behind `CLOUD_SYNC` flag (default OFF).**
      Flag OFF = byte-identical offline pilot; tests 35/35. Commits `9b0a7a0`
      (wiring) + `d68f429` (dashboard SQL), on `feat/cloud-sync`.
      - Vendored `@supabase/supabase-js` 2.110.0 UMD as root `supabase.js`
        (NO CDN); `<script>` before store.js; in build.sh copy + verify lists.
      - `Cloud` seam appended to store.js (lazy init so flag-OFF builds never
        touch it): `signIn()` maps loginId → `<id>@test.local`
        (`CLOUD_AUTH_DOMAIN`; a full typed email passes through), `enrolChild()`
        wraps the `enrol_child()` RPC with numeric/date null-coercion; all
        errors return `{ok:false, offline, error}` — nothing throws.
      - Save-child: NEW child + flag ON → RPC mints `research_id` server-side;
        offline → blocked with a teacher-facing message; EDITS stay local;
        `newResearchId()` demoted to legacy/migration path only.
      - `verifyCredentials()` → `signInWithPassword` behind the flag.
        `PILOT_LOCAL_AUTH=true` fallback fires ONLY when the server is
        UNREACHABLE — a rejected password is always final. A fallback login has
        no cloud session, so enrolment still refuses until a real online
        sign-in.
- [x] **`supabase/pilot-dashboard-setup.sql`** — the ~10-min dashboard prep as
      runnable sections (school re-seed insert-first/FK-safe, private `videos`
      bucket, test-teacher provisioning, verification query). Step 3a (create
      auth user) is dashboard UI, rest is SQL.
- [x] Stale `.git/index.lock` from a sandboxed git run cleared — repo healthy.
- [x] Dashboard prep DONE 2026-07-06 (driven via browser, each step verified):
      schools re-seeded to the 3 `sch_*` rows; `videos` bucket private
      (`public=f`); `saksham01@test.local` created (Aditya holds the password),
      `app_metadata.school_id=sch_saksham_noida`, linked ACTIVE teachers row.
      Verify query returned the expected single row. Cloud path is testable —
      device-test matrix lives in NEXT above.
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
## R&D DECISIONS — locked 2026-07-03
1. **Architecture A** — server-assigned child ID at enrolment (online-only
   enrolment, one moment of connectivity per child; assessments stay offline).
2. **Video IS required** — consent gate + uploader ship in the pilot.
3. **Multi-device-per-child: YES** — same child joins on one server ID.
4. **Analysis: BOTH** longitudinal and cross-child (research_id is the join
   key; both indexes in schema).
## Production roadmap (ordered by rework risk)
- [x] **1. R&D email** — sent + answered (decisions above).
- [ ] **2. Cross-device child ID** — app wiring DONE 2026-07-06
      (`feat/cloud-sync`, flag OFF). Remaining: dashboard steps + device verify
      + merge (NEXT, above).
- [x] **3. Video consent gate** — DONE 2026-07-03 (verifiable envelope,
      audit-honest withdrawal, erasure prompt, F9 file-level deletion,
      consent-evidence photo + serial).
- [ ] **4. Supabase auth swap** — code DONE 2026-07-06 (`feat/cloud-sync`,
      flag OFF; unreachable-only local fallback). Remaining: device verify.
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
- [ ] **Content team:** real recordings for `clap.mp3` + `whistle.mp3` — the
      two Recommended-tab sounds added 2026-07-14 are synthetic placeholders
      (usable, but swap when real audio lands).
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
- **Verify `git log` / `git status` before writing "done / pushed"** — the
  soundboard "pushed" claim was false for a week (2026-07-14 lesson).
- `.env` holds `SARVAM_API_KEY` (gitignored).