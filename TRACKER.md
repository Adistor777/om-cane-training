# TRACKER.md — O&M Cane Training

_Last updated: 2026-07-06_

## Done this session (2026-07-06 pm — cloud wiring, `feat/cloud-sync`, UNMERGED)
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

## NEXT — manual steps (Aditya), then device verify
- [x] Mac: `./scripts/build.sh` all green (supabase.js in www + built assets);
      branch + main pushed.
- [x] Dashboard prep DONE 2026-07-06 (driven via browser, each step verified):
      schools re-seeded to the 3 `sch_*` rows; `videos` bucket private
      (`public=f`); `saksham01@test.local` created (Aditya holds the password),
      `app_metadata.school_id=sch_saksham_noida`, linked ACTIVE teachers row.
      Verify query returned the expected single row. Cloud path is testable.
- [ ] Real device: flip `CLOUD_SYNC=true`, build, install. Matrix: wrong
      password online FAILS; new child online → `OM-XXXX-XXXX` appears in
      `children`; airplane mode → new child blocked, edit works; cross-school
      RLS (second user, different school_id → sees none of these rows);
      parked video-picker test (`content://` URI → `commitPendingVideo`).
- [ ] All green → merge `feat/cloud-sync` → `main`, push, flag back to false
      for pilot builds.

## Done earlier same day (2026-07-06 — workflow hardening + file split)
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
