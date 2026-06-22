# MEMORY — O&M Cane Training App
# Continuity file. Download + re-upload to Project knowledge after each "wrap up".
# Reflects: APP SHELL now EMULATOR-VERIFIED + COMMITTED (8761845, branch shell-login-home).

## LATEST SESSION — APP SHELL VERIFIED + COMMITTED

The login → home → stored-data shell built last session is now EMULATOR-VERIFIED,
committed (`8761845`), and pushed on branch `shell-login-home`. The risky
"built-but-uncommitted" state is closed. This session was verification + decisions,
not new feature code.

### Emulator verification — all gates passed
- Save flow: add child → run activity → save → PERSISTED across hard reset.
- Delete: individual result AND whole-child (Adi) — both deleted and PERSISTED
  across hard reset (proves delete writes through to store by-id, not cosmetic).
- "Add child" label correctly flips when no child is active.
- CSV export: native share sheet fired (write+share path verified). Column wiring
  (School / Teacher / Teacher ID) code-verified. File not opened on device — Aditya
  declined Google sign-in on the emulator (sound hygiene; not needed for the check).

### Bug found (backlogged, not a blocker)
Child form binds to getActiveProfile(); there is NO UI path to add a SECOND child
while one is already active (label only flips to "Add child" when none is active,
~line 1310). Real teachers assess many children → needs a "switch/add child"
affordance. Logged in TRACKER.

### Decisions resolved this session
- **BYOD confirmed**: Play Store install on teachers' own phones; no device given.
  → "Jaipur shouldn't see Delhi" is structurally dissolved at the LOCAL layer (each
  phone holds only its own data). True isolation = Supabase RLS, server-side, later.
  Any LOCAL per-school filter would be cosmetic, NOT a security boundary — don't build.
- **Children move across devices** (confirmed): device-local child id
  (`c`+timestamp+random) makes the same child two unrelated ids across phones.
  Now a HARD pre-production blocker. Fix = server-assigned childId on enrolment
  (ODK Central "Entities" pattern) — same architectural move as central roster.
- **Roster model (manager)**: schools self-register → appoint 2–3 teachers each.
  Self-register = the Supabase AUTH SWAP, future, not built locally (local
  self-register writes only to one phone's sandbox = meaningless; would be built twice).
- **3 real pilot schools** (saved, seeding deferred): Saksham School Noida; Rajasthan
  Netraheen Kalyan Sangam (RNKS) Jaipur; National Association of Blind Kullu.

### Research done this session (BYOD + RLS + DPDP, one landscape)
- Field-data-collection reference systems (ODK, KoboToolbox, CommCare) all use a
  thin-client + server split: device app collects, SERVER owns accounts/roster/forms,
  fetched at config time. → Production roster comes from Supabase at login, NOT a
  local seed. Provisioning can be admin/self-register; that's an ops choice.
- Supabase RLS multi-tenant pattern: add `school_id` to every table, set the tenant
  claim in the JWT at login, write per-table policies matching column to claim.
  Gotchas: RLS-OFF = open to all authed users (forgetting to enable is the danger);
  service-role key BYPASSES RLS (never client-side); joined tables each enforce
  their own RLS; test users see everything → test isolation via Studio impersonation.
- DPDP Rules 2025 NOTIFIED 13 Nov 2025; children's-data obligations enforceable
  13 May 2027. Child = under 18 (broader than COPPA/GDPR); your kids also Rule 11
  (disability + guardian). "Verifiable" parental consent is now ARCHITECTURAL
  (DigiLocker etc., Rule 10); must store auditable parent-linked consent records;
  behavioural profiling of children PROHIBITED → frame R&D as technique/fidelity
  research, not child profiling. POSSIBLE Fourth Schedule exemption (education /
  research) — but classes/purposes unpublished → assume none till legal confirms;
  Section 8 (notice/purpose/retention/security) binds regardless. Consent audit
  trail must be central/immutable (Supabase), not a local-only flag.

### KEY ID MAP (unchanged this session)
A session record carries five identities:
  id              — which record
  teacherId (op_) — which DEVICE wrote it (per-install)
  teacherRosterId — which logged-in TEACHER (session)
  schoolId        — which SCHOOL (session)
  profileId (c…)  — which CHILD  ← device-local; cross-device fix REQUIRED pre-prod

## STILL TRUE FROM BEFORE (carry-forward)

### Batch 1 — DONE, verified, committed `c2ffdb0`, pushed
Identity/schema/delete-by-id/ISO-time/migration shim/centralised saveRecord/35 tests.

### Shell — built last session, NOW verified + committed `8761845` (branch shell-login-home)
LOGIN (school dropdown → teacher → sign in, no password; logIn() = prod auth seam),
record attribution (schoolId + teacherRosterId stamped at saveRecord; CSV School +
Teacher columns resolved id→name at export), HOME tier (3 tiles, distinct icons,
tappable home-dot), STORED DATA → showChildDetail (results grouped by activity,
by-id per-result + per-child delete). Schools model = production table shape
(schools + teachers joined by school_id) → prod is a backend swap, not a rewrite.

### THE www/ RULE (do not forget)
Root index.html = source of truth. www/index.html = BUILD COPY the app loads.
www/ is GITIGNORED. After ANY edit: cp → grep-verify → cap sync → cap run.
Branch switches do NOT update www/ — re-cp after every checkout.

### File-split NOT done yet
infra-file-split (single-file → styles.css / store.js / app.js) not started.
A CLEAN VERIFIED BASELINE now exists (8761845) — the safest moment to do a pure
refactor (known-good before/after; any regression is obviously the split).

## STACK (unchanged)
Plain HTML/CSS/JS, no bundler. Capacitor 8, Android Studio (Pixel 10 Pro XL emulator,
API 37 arm64). Supabase (India region; DB side NOT yet activated). Sarvam AI Bulbul v3
for audio. Private GitHub repo Adistor777/om-cane-training. App id org.omcane.trainer.
Key files: index.html, activities.js (content-team owned), MEMORY.md, TRACKER.md,
DESIGN_NOTES.md, test-batch1.js, generate-audio.js.