# MEMORY — O&M Cane Training App
# Continuity file. Download + re-upload to Project knowledge after each "wrap up".
# Reflects: LOGIN HARDENING + REAL-SCHOOL SEED done (static-verified; emulator + commit PENDING).

## LATEST SESSION — LOGIN HARDENING + REAL PILOT-SCHOOL SEED

This session productionised the pilot login from the teacher's POV and seeded the
3 real schools. Code-complete and STATIC-VERIFIED (flag/seed grep + full <script>
`new Function()` parse + line-count). NOT yet emulator-verified, NOT yet committed —
those are the first two carry-forward tasks.

### What changed in index.html
- **`PILOT_ALLOW_SELF_PROVISION = false`** (new constant ~line 696). Gates BOTH
  teacher-facing creation paths behind one flag:
  - "+ Add a new school" (login screen) → renders only if flag true.
  - "+ Add a new teacher" (teacher picker) → renders only if flag true.
  - `addSchool()/addTeacher()/showAddSchool()/showAddTeacher()` LEFT INTACT as admin
    primitives — nothing deleted; flip flag to restore them for field provisioning.
  - Empty-roster copy → "...Please contact your coordinator."
- **seedSchools() replaced** with the 3 real pilot schools, STABLE string ids:
  - `sch_saksham_noida` → Saksham School, Noida
  - `sch_rnks_jaipur`   → Rajasthan Netraheen Kalyan Sangam (RNKS), Jaipur
  - `sch_nab_kullu`     → National Association of Blind, Kullu
  - One placeholder teacher each ("Teacher 1", ids `tch_*_1`) so no school is a
    dead-end while self-provision is off.
  - Stable ids (NOT newId()) chosen deliberately: a school resolves to the SAME id on
    every device — the correct pattern for cross-device attribution, and a preview of
    the server-assigned-id fix still owed for children.

### Why this shape (the teacher-POV reasoning)
A teacher's correct mental model is "I work here, let me in" — pick school, pick name,
two taps. Self-service "add a school / add yourself" reads as an error to a teacher,
invites junk/duplicate data (one fat-fingered "Sakshm" pollutes every roster + CSV),
and breaks the trust signal of an app that was "set up for me." So self-provisioning
is an ADMIN concern, not a login concern. Hiding it is correct UX, not just cleanup.

### Decision: "no random users" = DISTRIBUTION, not auth-code
Aditya's real concern was strangers + chaos in the app. Key clarification:
- Hiding add-buttons fixes in-app chaos but does NOT stop strangers — pick-a-name is
  the whole "login"; anyone could be anyone. There is NO client-side fix for that
  (client lives on a stranger's phone).
- The real gate during a closed pilot is the **Play Store track**. Aditya has NOT set
  up a Play Console release yet → ship to **INTERNAL TESTING**: invite-only by Gmail,
  app invisible to all others, instant, zero code. That is a hard gate.
- Authentication-as-gate (Supabase Auth + RLS) is the PRODUCTION replacement, gated on
  the R&D/legal emails. Do NOT pull it forward; do NOT ship to open/production track
  until it exists.
- Sequence: closed track (now) → hide self-provision (done) → Auth+RLS (later, gated).

### Carry-forward (do first next session)
1. Emulator-verify this session's edits. CRITICAL: clear old emulator data first —
   ensureSchoolsSeeded() skips if any schools exist, so the cached Devnar seed will
   mask the new schools. Uninstall/clear storage → cp index.html www/index.html →
   cap sync → run. Confirm: 3 real schools only; "Teacher 1"; no "+ Add" links;
   tap → Home; flip flag true → add links return.
2. Commit + push on a dedicated branch (suggested `login-hardening-seed`).
3. Swap placeholder teacher names when the coordinator sends real ones — KEEP the ids.

## STILL TRUE FROM BEFORE (carry-forward)

### Bug (backlogged, not a blocker)
Child form binds to getActiveProfile(); NO UI path to add a SECOND child while one is
active (label flips only when none active, ~line 1310). Teachers assess many children
→ needs "switch/add child" affordance.

### KEY ID MAP
A session record carries five identities:
  id              — which record
  teacherId (op_) — which DEVICE wrote it (per-install)
  teacherRosterId — which logged-in TEACHER (session)
  schoolId        — which SCHOOL (session)  ← now a STABLE seeded id
  profileId (c…)  — which CHILD ← device-local; cross-device fix REQUIRED pre-prod

### Batch 1 — DONE, verified, committed `c2ffdb0`, pushed
Identity/schema/delete-by-id/ISO-time/migration shim/centralised saveRecord/35 tests.

### Shell — verified + committed `8761845` (branch shell-login-home)
LOGIN (school dropdown → teacher → sign in, no password; logIn() = prod auth seam),
record attribution (schoolId + teacherRosterId at saveRecord; CSV School+Teacher
resolved id→name at export), HOME (3 tiles), STORED DATA → showChildDetail (grouped
results, by-id per-result + per-child delete). Schools model = production table shape
(schools + teachers joined by school_id) → prod is a backend swap, not a rewrite.

### DPDP / compliance (unchanged)
DPDP Rules 2025 notified 13 Nov 2025; children's-data obligations enforceable
13 May 2027. Child = under 18. Kids also Rule 11 (disability + lawful guardian).
Verifiable parental consent is architectural; consent audit trail must be
central/immutable (Supabase), not a local flag. Behavioural profiling of children
prohibited → frame R&D as technique/fidelity research. Possible Fourth Schedule
(education/research) exemption — classes unpublished → assume none till legal confirms;
Section 8 binds regardless.

### Supabase RLS pattern (for when cloud sync activates)
school_id on every table; tenant claim in JWT at login; per-table policies match
column→claim. Gotchas: RLS-off = open to all authed users; service-role key BYPASSES
RLS (never client-side); each joined table enforces its own RLS.

### THE www/ RULE
Root index.html = source of truth. www/index.html = BUILD COPY the app loads.
www/ is GITIGNORED. After ANY edit: cp → grep-verify → cap sync → cap run.
Branch switches do NOT update www/ — re-cp after every checkout.
Post-sync check: grep -c "schemaVersion" android/app/src/main/assets/public/index.html

### File-split NOT done yet
single-file → styles.css / store.js / app.js. Clean verified baseline exists
(8761845) — safest moment for a pure refactor.

## STACK
Plain HTML/CSS/JS, no bundler. Capacitor 8, Android Studio (Pixel 10 Pro XL emulator,
API 37 arm64). Supabase (India region; DB side NOT yet activated). Sarvam AI Bulbul v3
for audio. Private GitHub repo Adistor777/om-cane-training. App id org.omcane.trainer.
Key files: index.html, activities.js (content-team owned), MEMORY.md, TRACKER.md,
DESIGN_NOTES.md, test-batch1.js, generate-audio.js.
