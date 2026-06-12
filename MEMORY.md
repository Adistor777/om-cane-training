# MEMORY — O&M Cane Training App
# Continuity file. Download + re-upload to Project knowledge after each "wrap up".
# This addendum reflects the latest BUILD session (Batch 1 written + headless-verified
# in chat; NOT yet installed locally or emulator-verified — that is next session).

## LATEST SESSION — BATCH 1 IMPLEMENTED + R&D SCOPE CHANGED

### Batch 1 + migration shim: CODE COMPLETE, 35/35 headless tests green
All edits in index.html (the updated file + test-batch1.js were delivered as downloads
in this session's chat — Aditya has NOT yet installed them locally or run the emulator):
1. **Identity layer**: `SCHEMA_VERSION = 1`; `newId()` (crypto.randomUUID + RFC-4122
   fallback for old WebViews); `ensureDeviceTeacherId()` mints `op_` + UUID once at
   boot via the Store seam, warning toast if the verified write fails.
2. **Envelope chokepoint**: `saveRecord()` itself stamps `id` / `schemaVersion` /
   `teacherId` / `whenISO` on every record. `handleSave` passes content only. Design
   call: stamping at the seam-adjacent chokepoint, NOT at call sites, so no future
   caller can write an unattributable record.
3. **Delete-by-id**: `deleteRecord(activityId, recordId)` filters by UUID. Stale/unknown
   ids no-op to false. Index-based delete (the High-sev re-render race) is gone.
   `renderRecord` emits the record id into the delete button; records without an id
   render NO delete button.
4. **Canonical time**: `whenISO` (ISO 8601) stored; `fmtWhen(r)` derives the display
   string at render (falls back to legacy `when` for unconverted records). New records
   carry NO locale string at all.
5. **Migration shim** `migrateLegacyData()`: runs every boot, idempotent, writes only
   changed buckets. Backfills UUID `id`, `schemaVersion:1`, `teacherId:'legacy'`.
   **Day/month-swap guard** (important design call): legacy `when` → `whenISO` ONLY
   when `new Date(Date.parse(when)).toLocaleString() === when` (exact round-trip).
   en-IN "11/6/2026" parses American-style as Nov 6 — blind conversion silently swaps
   day/month. Ambiguous strings stay display-only with no whenISO. Safe loss > silent
   corruption.
6. **CSV**: "When" column now carries whenISO (sortable in Excel; legacy fallback),
   new "Teacher ID" column added to header + rows.
7. **Profiles**: `schemaVersion` stamped in `handleProfileSave` + backfilled by shim.
8. **Boot order**: `Store.init()` → `ensureDeviceTeacherId()` → `migrateLegacyData()`
   → first paint.

### Test harness (keep in repo — first real automated tests, per tracker goal)
`test-batch1.js` — jsdom harness that boots the REAL index.html (activities.js inlined
into the HTML string; this jsdom version has no ResourceLoader export). Readiness probe:
poll `localStorage.teacherId` + `typeof w.saveRecord === 'function'` (top-level `const
Store` never lands on window; `function` declarations do). 7 suites / 35 assertions:
legacy migration, idempotence + teacherId stability across restart, envelope stamping,
delete-by-id (incl. stale-id no-op + neighbour-intact), rendered delete button carries
id, CSV columns, fresh-install path. Run: `npm install jsdom` then `node test-batch1.js`.

### R&D PURPOSE SCOPE CHANGED (two updates this session)
1. First clarification: archive purpose = **teacher drill fidelity** (are teachers
   carrying out the drill correctly), not child research. Strengthened Option B logic.
2. Then UPDATED again: **child analysis is ALSO needed.** This partially reopens A-vs-B
   and validates the Batch 1 hedge (B→A is now a sync job, not a migration). BUT it
   surfaces a possible NEW un-backfillable item: **stable cross-device childId.**
   Current profileId is device-local random. Decision tree, pending R&D answer:
   - One child = one device, always → profileId already suffices; log assumption, no code.
   - Child may appear on >1 device → stable childId joins Batch-1-class work BEFORE
     production sessions. Preferred scheme: short human-assignable child code issued by
     the program, entered once into the profile (NOT name-matching identity resolution).
   - Full statistical corpus (true Option A) → Batch 4 RLS keyed on child + institution,
     Postgres side activates earlier.
   **THE open question for R&D** (send before any further build): "Will any child ever
   be assessed on more than one device? Is the analysis longitudinal per-child,
   cross-child statistical, or both?"
3. Compliance note (parked at Aditya's request, but load-bearing): teacher-fidelity
   review and child analysis are TWO DIFFERENT PURPOSES under DPDP — consent scope must
   name both. Teachers are now also subjects of evaluation and should know. Forward to
   whoever drafts consent.

### NEXT SESSION — agreed plan
Aditya installs the new index.html + test-batch1.js locally, then we verify on the
emulator STEP BY STEP (he is new to coding — one command at a time, explicit Check
after each). Verification script for next session:
1. Replace ~/Desktop/om-app/index.html with the delivered file.
   Check: `grep -c "teacherId" index.html` ≥ 10.
2. (Optional, fast) `npm install jsdom && node test-batch1.js` locally → 35/35.
3. `npx cap run android`; on emulator: save a session → cold-restart → record shows
   with readable timestamp → delete it → restart again → stays deleted.
4. Inspect a stored record (we'll add a quick way to dump storage if needed) to confirm
   id/teacherId/whenISO/schemaVersion present; legacy demo records tagged 'legacy'.
5. Commit: git add . && git commit -m "Batch 1: teacherId, record UUIDs, delete-by-id,
   whenISO, schemaVersion + migration shim" && git push.
6. Flip the five rev-2 "in code?" rows to Yes ONLY after emulator verification passes.
7. Update rev-2 + consent framing with the new dual purpose (fidelity + child analysis).

## PRIOR SESSION CONTEXT (unchanged, still true)

### Architecture decision
- **Pooling shape = Option B: reviewable session archive** (working assumption; written
  confirmation from R&D STILL pending — now bundled with the childId question above).
- **Identified video (faces) confirmed required.** Sets handling duties regardless of
  shape: access control, encryption, delete-on-withdrawal.
- Archive = bucket of sessions (video + activity + result + notes). No merge/dedup/
  cross-teacher join — though "child analysis also needed" may pull this toward B-plus/A.

### What the external review confirmed as strong (don't disturb)
- **Store seam** (sync-cache over async backend, write-through + read-back verify) —
  the standout; template for the planned Uploader seam (mirror it, don't bolt on).
- 3-tier deletion (local) is real. CSV export robust (RFC-4180, UTF-8 BOM, native
  Filesystem→Share). esc() XSS discipline consistent.

### Build order by trigger point (Batch 1 now code-complete, pending verification)
- **Batch 1** — DONE in code (this session), pending emulator verification + commit.
- **Batch 2 — correctness:** verify all window.confirm() route through confirmModal();
  harden boot-failure (Store._failed, hard-block writes, blocking "storage unavailable"
  state — current boot can silently succeed against an empty cache); rename photo
  comment "limits identifiability" → "limits storage size".
- **Batch 3 — before identified video:** operator device lock (PIN); local photo-at-rest
  decision (encrypt or drop pre-upload) — decide TOGETHER with queued-video at-rest rule.
- **Batch 4 — before Uploader:** private Supabase bucket + short-TTL signed URLs (never
  public); Postgres RLS keyed on teacherId/institution (possibly + childId now); cascade
  delete proven by test; India region pinned; queue-and-retry; queued-video at-rest
  retention/eviction rule.

### Parallel tracks with external dependencies
- **Consent text + data-sharing agreement = real critical path.** Names IIT Delhi /
  NCAHT + identified-video purpose — NOW must cover BOTH purposes (teacher fidelity +
  child analysis). Needs qualified DPDP 2023 + Rules 2025 review (slow, external).
- **R&D written confirmation**: A-vs-B + identified-video + the new childId/device
  question + analysis shape. One email covers all four.
- Full R&D ask list (access roster, view-only vs download, retention, deletion
  compliance, purpose phrasing, metadata needs, their IRB/ethics process, who signs)
  was compiled earlier this session — in chat history if needed.

## OPERATING CONTEXT (unchanged)
- Plain HTML/CSS/JS, NO bundler (load-bearing: content team's activities.js
  edit-refresh workflow). activities.js never touched in build sessions.
- Capacitor 8 native wrap, Android first; ~/Desktop/om-app on M5 MacBook Air;
  org.omcane.trainer; private GitHub repo (Adistor777/om-cane-training).
- Pixel 10 Pro XL API 37 arm64 emulator; no physical Android phone.
- Store seam = only storage touchpoint; write/read-back/verify discipline.
- Design: field-notebook restraint (path a); --ink-faint #736b5e do not lighten.
- DPDP deadline 13 May 2027; India-region Supabase planned.
- Conventions: one command at a time with explicit Check; "wrap up" regenerates
  MEMORY.md + TRACKER.md; PDFs over Word; decision-first.
- NOTE FOR NEXT SESSIONS: Aditya asked for beginner-level explanations ("like I am new
  to coding") — keep explanations plain-language with analogies alongside the commands.
