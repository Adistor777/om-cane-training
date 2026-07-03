# TRACKER.md — O&M Cane Training

_Last updated: 2026-07-03_

## Done this session (Compliance — roadmap #3 + F9 + docs)
- [x] **Video consent gate finished** (was a bare-checkbox skeleton, uncommitted).
      Now a VERIFIABLE consent record per DPDP Rule 10: `videoConsentBy`
      (guardian name, required), `videoConsentRelation` (Mother/Father/Legal
      guardian, required), `videoConsentMethod`, `videoConsentOn`,
      `videoConsentWithdrawnOn`. Sub-fields revealed by the tick
      (`toggleConsentFields`); save refuses a tick without name+relation.
- [x] **Audit-honest withdrawal:** unticking stamps `videoConsentWithdrawnOn`
      and PRESERVES the original grant fields (history never wiped). Re-grant
      after withdrawal = fresh consent (new `videoConsentOn`, withdrawn cleared).
- [x] **Withdrawal erasure prompt:** if stored clips exist at withdrawal, the
      teacher chooses: delete clips now (erasure request) or keep (pre-withdrawal
      processing stays lawful). `eraseVideosForProfile()` deletes files AND
      strips `r.video` pointers; assessment records stay.
- [x] **Erasure completeness (F9):** `deleteRecord`, `deleteProfile`, and
      `clearAllData` now delete video FILES, not just pointers — new helpers
      `deleteVideoFile` / `videoFilenamesForProfile`; `clearAllData` rmdirs the
      whole `videos/` tree. No orphaned children's data on disk.
- [x] **CSV consent columns:** every export row carries Video consent
      (Yes/No/Withdrawn) + granted/withdrawn dates; guardian identity
      (by/relation/method) exports ONLY on the PII keysheet, same rule as name/DOB.
- [x] **Child-detail consent line:** on-file since / withdrawn on / none —
      visible without opening the edit form.
- [x] **Migration backfill:** pre-consent profiles get explicit
      `videoConsent:false` + empty envelope fields. `SCHEMA_VERSION` stays 2
      (additive). JS parse OK; helper def/ref greps OK; `www/index.html` synced.
- [x] **Compliance docs** in new `compliance/`: `PRIVACY-POLICY.md` (hostable,
      placeholders for entity/officer), `GUARDIAN-CONSENT-FORM.pdf` (paper form,
      Part A assessment / Part B video with separate signatures + school
      ID-verification block), `GUARDIAN-CONSENT-FORM-HINDI.md` (translation for
      content team to verify/typeset), `PLAY-DATA-SAFETY.md` (Data Safety
      answers; target audience 18+ teachers — avoids Families review),
      `DPDP-COMPLIANCE-MAP.md` (requirement → control map for legal sign-off).

## Next session — FIRST tasks (on the Mac)
- [ ] `npx cap sync android` — the sandbox attempt failed with EPERM mid-run;
      built assets still hold the OLD index.html. `www/` is correct and verified.
- [ ] Emulator-verify the consent flow: add child without consent → record
      screen shows locked slot; grant consent (name+relation required) →
      capture works; withdraw with a stored clip → erasure prompt; child
      delete → clip file gone from `DATA/videos/`.
- [ ] Commit on `feat/consent-gate`: the whole consent + erasure envelope is
      ONE feature commit (`index.html` only), `compliance/` docs a second
      commit, MEMORY/TRACKER third.
- [x] **Repo reorg** — DONE (2026-07-03, merged). docs/ (+handoffs/,
      +compliance/), scripts/, prototypes/; generate-audio.js + test-batch1.js
      paths fixed; test suite de-staled (schemaVersion read from app, 35/35
      green); new README, docs/ARCHITECTURE.md, CONTRIBUTING.md.

## R&D DECISIONS — locked 2026-07-03 (answers to the four questions)
1. **Architecture A** — server-assigned child ID at enrolment. Enrolment is
   ONLINE-ONLY (one moment of connectivity per child, once); assessments stay
   fully offline.
2. **Video IS required** for the research — consent gate + uploader ship in
   the pilot; not cuttable.
3. **Multi-device-per-child: YES** — confirms A; same child on two phones must
   join on the same server ID.
4. **Analysis: BOTH** longitudinal and cross-child — records must be strictly
   joinable per child across months (research_id is the join key; indexes for
   both patterns are in the schema draft).

## Production roadmap (ordered by rework risk)
- [x] **1. R&D email** — SENT + ANSWERED (see decisions above).
- [ ] **2. Cross-device child ID** — UNBLOCKED. Design: server mints
      `research_id` via `enrol_child()` RPC (drafted in
      `supabase/schema.sql`); app's Save-child calls it when online, blocks
      new enrolment offline with a clear message; local `newResearchId()`
      remains only as the legacy/migration path. NEEDS: Supabase project
      (India region) created first — Aditya, ~10 min in dashboard, then share
      Project URL + anon key.
- [x] **3. Video consent gate** — DONE this session (see above).
- [ ] **4. Supabase auth swap** — `verifyCredentials()` → `signInWithPassword()`.
      Schema + RLS + enrol RPC pre-drafted in `supabase/schema.sql`; once the
      project exists, #2 + #4 + #6 land in one build session.
- [ ] **5. Uploader + cloud storage** — bucket 'videos' (private), path
      `{school_id}/{research_id}_{ts}.{ext}` (policy-ready). Uploader must
      re-check `videoConsent` before upload and honour erasure server-side
      (delete-everywhere); re-review `DPDP-COMPLIANCE-MAP.md` before shipping.
- [ ] **6. Row-Level Security** — policies DRAFTED in `supabase/schema.sql`
      (school_id JWT claim via app_metadata, per-table + storage policies).
      DECISION FLAGGED THERE for legal: child name/DOB stored server-side
      behind RLS (needed for multi-device child picker); research extracts
      stay research_id-only.
- [x] **7. Video memory fix** — DONE (2026-07-03, same session as consent).
      `commitPendingVideo` now copies the clip in 3 MB slices
      (`writeFile` first chunk, `appendFile` rest) — peak JS memory is one
      chunk regardless of clip length. Failed mid-write → partial file deleted
      (no corrupt/orphaned bytes). `handleSave` now toasts honestly when a clip
      fails to store instead of a silent 'Saved'. Emulator test: attach a
      multi-minute 1080p clip, confirm Save survives and the file plays back
      from DATA/videos/.
- [ ] **8. Play Store release** — Data Safety answers DRAFTED
      (`compliance/PLAY-DATA-SAFETY.md`); needs privacy policy hosted at a
      public URL; declare target audience 18+ (teachers) — children are data
      subjects, not users, so Families programme shouldn't trigger.

## Waiting on humans
- [ ] **Legal:** fiduciary entity of record, grievance officer, effective date,
      Rule 10 due-diligence sign-off (school sights guardian ID at signing),
      educational-institution exemption question. All flagged in
      `compliance/DPDP-COMPLIANCE-MAP.md`.
- [ ] **Content team:** verify + typeset Hindi consent form; translated SOP
      text (audio pipeline still blocked).
- [ ] **Mansi:** real teacher names for the seed.

## Backlog
- [ ] File split: `index.html` → `styles.css` + `store.js` + `app.js`.
- [ ] Consent envelope for the BROADER assessment data (Part A of the paper
      form) — currently paper-only; consider mirroring in-app like video consent
      if legal asks.

## Standing reminders
- Every code session ends: `cp index.html www/index.html && npx cap sync android`,
  grep built assets to confirm, `./gradlew clean installDebug` if stale.
- Media (`audio/`, `sounds/`, `*.mp4`) stays gitignored.
- Feature commits stay focused — MEMORY/TRACKER committed separately.
