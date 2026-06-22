# TRACKER — O&M Cane Training App
# Regenerated at wrap-up. Companion to MEMORY.md.

## ✅ DONE THIS SESSION (emulator-verified + committed + pushed)
- APP SHELL (login → home → stored-data) VERIFIED on emulator and committed.
  Commit `8761845` on branch `shell-login-home`, pushed to origin.
  PR link: https://github.com/Adistor777/om-cane-training/pull/new/shell-login-home
- Emulator verification pass — ALL GATES GREEN:
  - [x] cp index.html www/index.html (110KB, fresh) + grep-verified (14 matches)
  - [x] cap sync + run — app launched to login
  - [x] login (school → teacher → sign in) → Home (3 tiles)
  - [x] individual-result delete: confirmed, deleted, PERSISTED across hard reset
  - [x] whole-child delete (Adi): deleted, PERSISTED across hard reset
  - [x] add child ("Add child" label flipped correctly w/ no active child),
        ran activity, saved result, PERSISTED across hard reset
  - [x] CSV export: native share sheet appeared (Quick Share / Mail / Drive) =
        write+share path verified. Column wiring code-verified (School, Teacher,
        Teacher ID in header line 996, populated line 999). Did NOT open file on
        device (declined emulator Google sign-in — reasonable hygiene call).

## 🟠 BUG / GAP FOUND THIS SESSION (log, fix later — NOT a blocker)
- **Cannot add a SECOND child while one is active.** Child form binds to
  getActiveProfile(); label only flips to "Add child" when NO child is active
  (index.html ~line 1310). A teacher with one child set up has no UI path to add
  another without first removing/deactivating the first. Real teachers assess
  MANY children → needs an explicit "switch/add child" affordance. BACKLOG.

## 🟡 DECISIONS RESOLVED THIS SESSION
- **BYOD CONFIRMED**: teachers install from Play Store on their OWN phones; no
  device provided. → Local Jaipur/Delhi isolation worry DISSOLVED (each phone only
  holds its own data). Real isolation = server-side Supabase RLS, later.
- **Children DO move across devices** (Aditya confirmed). → cross-device stable
  child id is now a hard PRE-PRODUCTION BLOCKER, not a someday item. Un-backfillable.
- **Roster model (manager, Mansi)**: schools SELF-REGISTER → appoint 2–3 teachers
  each; teacher logs in, school in dropdown, no manual school typing. Self-register
  = the future Supabase AUTH SWAP, NOT built locally now (would be built twice;
  local self-register only writes to one phone's sandbox = meaningless).
- **3 real pilot schools provided** (saved): Saksham School Noida; RNKS Jaipur;
  National Association of Blind Kullu. Seeding into dropdown DEFERRED by Aditya.

## 🟡 INPUTS PENDING (others)
- [ ] Real TEACHER NAMES for the 3 schools (placeholders for now).
- [ ] R&D EMAIL (four confirmations): Option A vs B; identified-video requirement;
      cross-device child assessment (now CONFIRMED yes → blocker); child analysis
      longitudinal-per-child vs cross-child-statistical vs both.
- [ ] LEGAL: does deployment qualify for DPDP Fourth Schedule exemption
      (educational-institution / research purpose)? Scales the whole consent burden.
      NB: Schedule classes/purposes unpublished — assume NO exemption till confirmed.
- [ ] About screen content — confirm with design at next review.

## 🔴 IMMEDIATE NEXT (next session)
- [ ] Seed the 3 real schools into seedSchools() (replace placeholders). NOTE:
      ensureSchoolsSeeded() skips if schools already exist → must clear old seed on
      the emulator first for new ones to appear.
- [ ] Send R&D + legal emails (longest latency — start the clock early).
- [ ] Decide infra-file-split timing (clean baseline now exists post-commit).

## 🟢 PRODUCTION WORK (tracked, with OWNERS — not automatic)
- [ ] Real credential check: stub → Supabase Auth .................... you, later
- [ ] School self-register flow (= the auth swap) .................... you, later
- [ ] Local pilot data → Supabase migration ......................... you, later
- [ ] Admin/self-register boundary for school+teacher creation ....... you/manager
- [ ] Stable cross-device child id (server-assigned) ....... gated on R&D email
- [ ] Supabase RLS multi-tenant isolation (school_id JWT claim) ...... you, later
- [ ] Cloud-storage consent / DPDP sign-off .................... legal/compliance
- [ ] "Add second child while one active" affordance ................. you, soon

## ⚠️ THE www/ RULE (do not forget)
Root index.html = source of truth. www/index.html = build copy the app loads.
www/ is gitignored. cp → grep-verify → cap sync → cap run after EVERY edit.
Branch switches do NOT update www/ — re-cp after every checkout.

## 🔜 STILL QUEUED
- [ ] infra-file-split (single-file → styles.css / store.js / app.js). NOT done.
      Clean verified baseline now exists (commit 8761845) — safest moment to split.
- [ ] Shell alias `omsync` for the cp+sync+run loop.
- [ ] Batch 2 (correctness), Batch 3 (pre-identified-video), Batch 4 (pre-Uploader).
- [ ] Offline-classroom upload behaviour (immediate vs queue-and-upload-later).
- [ ] Real-phone test (emulator only so far).
- [ ] Real SOP translations for remaining activities (blocked on content team).

## KEY PRINCIPLES (unchanged)
- "Decided" ≠ "in code" ≠ "verified on device". Track all three states.
- Build order driven by trigger points: un-backfillable items before any
  production session; correctness before identified video; video before Uploader.
- Store seam is the single chokepoint. Delete-by-id, never by-index.
- ISO 8601 for storage; locale strings only at render time.
- No-bundler constraint is load-bearing (content team's no-coder activities.js edit).
- One job per surface.
- Branch discipline: task work on dedicated branches, never on main.