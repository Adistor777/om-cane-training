# TRACKER — O&M Cane Training App
# Regenerated at wrap-up. Companion to MEMORY.md.

## ✅ DONE THIS SESSION (code-complete + verified by static checks)
- **Login self-provisioning GATED.** New constant `PILOT_ALLOW_SELF_PROVISION = false`
  (index.html ~line 696). Both teacher-facing creation paths now render only when
  the flag is true:
  - "+ Add a new school" button (login screen) — gated.
  - "+ Add a new teacher" button (teacher picker) — gated.
  - `addSchool()`/`addTeacher()`/`showAddSchool()`/`showAddTeacher()` all LEFT INTACT
    as admin primitives. Flip the flag → they return. Nothing deleted.
  - Empty-roster copy softened to "...Please contact your coordinator."
- **3 real pilot schools SEEDED** (replaced placeholder seed). seedSchools() now:
  - `sch_saksham_noida`  → Saksham School, Noida
  - `sch_rnks_jaipur`    → Rajasthan Netraheen Kalyan Sangam (RNKS), Jaipur
  - `sch_nab_kullu`      → National Association of Blind, Kullu
  - Each carries ONE placeholder teacher ("Teacher 1") so no school is a dead-end
    under self-provision=false.
  - IDs are STABLE human-readable strings (NOT newId()), so a school resolves to the
    same id on every device — the right pattern for cross-device attribution.
- **Static verification passed:** flag/seed grep-confirmed; full <script> body parses
  clean via `new Function()`; line count integrity checked (1818 lines).

## ⏳ NOT YET DONE (carry into next session — required to call this verified)
- [ ] **Emulator verification of this session's edits.** Static checks only so far.
      MUST: clear old emulator data first (ensureSchoolsSeeded() skips if any schools
      exist → old Devnar seed still cached → new schools WON'T appear otherwise).
      Uninstall app / clear storage → cp → cap sync → run → confirm:
        - dropdown shows exactly the 3 real schools (no Devnar)
        - each school shows "Teacher 1", NO "+ Add" links anywhere
        - tap teacher → Home
        - flip flag true → reload → add links reappear (proves gate both ways)
- [ ] **Commit + push** on a dedicated branch (suggested: `login-hardening-seed`).
      NOT yet committed.
- [ ] **www/ re-cp** after edits (cp index.html www/index.html before cap sync).

## 🟠 BUG / GAP (backlog — NOT a blocker)
- **Cannot add a SECOND child while one is active.** Child form binds to
  getActiveProfile(); "Add child" label only flips when NO child active
  (index.html ~line 1310). Teacher with one child has no path to add another without
  removing the first. Real teachers assess MANY children → needs explicit
  "switch/add child" affordance. BACKLOG.

## 🟡 DECISIONS RESOLVED THIS SESSION
- **Play Store track: NO release set up yet → ship to INTERNAL TESTING.**
  This is the real gate against random users during a closed pilot — invite-only by
  Gmail, app invisible to everyone else, no code required. Distribution-as-gate now;
  authentication-as-gate (Supabase Auth) replaces it at production. Do NOT ship to
  open/production track until Auth + RLS exist.
- **"No random users" is a DISTRIBUTION problem, not an auth-code problem** during the
  pilot. Hiding add-buttons cleans up in-app chaos; the closed track stops outsiders.
- **Self-provisioning belongs to ADMIN, not the teacher POV.** A teacher's correct
  mental model is "I work here, let me in" — two taps, no create-anything path.

## 🟡 INPUTS PENDING (others)
- [ ] Real TEACHER NAMES for the 3 schools. Swap the `name` strings ONLY; KEEP the ids
      (changing an id after sessions exist orphans those records).
- [ ] R&D EMAIL (four confirmations): Option A vs B; identified-video requirement;
      cross-device child id (CONFIRMED yes → blocker); child analysis
      longitudinal-per-child vs cross-child-statistical vs both.
- [ ] LEGAL: DPDP Fourth Schedule exemption (educational-institution / research)?
      Scales the whole consent burden. Assume NO exemption till confirmed.
- [ ] About screen content — confirm with design at next review.

## 🔴 IMMEDIATE NEXT (next session)
- [ ] Emulator-verify + commit this session's login-hardening + seed (above).
- [ ] Send R&D + legal emails (longest latency — start the clock early).
- [ ] Decide infra-file-split timing (clean baseline exists post-commit 8761845).

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
Definitive post-sync check:
  grep -c "schemaVersion" android/app/src/main/assets/public/index.html

## 🔜 STILL QUEUED
- [ ] infra-file-split (single-file → styles.css / store.js / app.js). NOT done.
      Clean verified baseline exists (commit 8761845) — safest moment to split.
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
