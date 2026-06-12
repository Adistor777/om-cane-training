# PROJECT TRACKER — O&M Cane Training App

A living checklist. Say "wrap up" at the end of a session to refresh this + MEMORY.md.
Last updated: end of a BUILD session. Batch 1 + migration shim were WRITTEN and verified
headlessly (35/35 jsdom tests against the real index.html). The updated index.html and
test-batch1.js were delivered as downloads — NOT yet installed locally, NOT yet
emulator-verified, NOT yet committed. Also this session: R&D purpose scope changed twice
(teacher drill fidelity, then child analysis ALSO needed), surfacing a possible new
un-backfillable item (stable cross-device childId).

## ============ NEXT SESSION — INSTALL + VERIFY BATCH 1 (step by step) ============
Aditya is new to coding: one command at a time, explicit Check after each, plain-language
explanations. Files needed: the index.html + test-batch1.js delivered last session.

- [ ] 1. Replace ~/Desktop/om-app/index.html with the new file
        Check: `grep -c "teacherId" ~/Desktop/om-app/index.html` returns ≥ 10
- [ ] 2. Copy test-batch1.js into ~/Desktop/om-app
- [ ] 3. (Fast local proof) `npm install jsdom` then `node test-batch1.js`
        Check: "35 passed, 0 failed"
- [ ] 4. `npx cap run android` — app boots on emulator, no blank screen
- [ ] 5. On emulator: save a session for a child
        Check: record appears with a readable date/time
- [ ] 6. Cold-restart the app (swipe away, relaunch)
        Check: record still there, timestamp still readable
- [ ] 7. Delete that record; restart again
        Check: exactly that record gone, stays gone
- [ ] 8. Verify stored shape (dump storage if needed): new record has id (UUID),
        teacherId (op_...), whenISO, schemaVersion:1; pre-existing demo records
        tagged teacherId:'legacy' with backfilled ids
- [ ] 9. Export CSV
        Check: "When" column is ISO format; "Teacher ID" column present
- [ ] 10. Commit + push:
        git add . && git commit -m "Batch 1: teacherId, record UUIDs, delete-by-id,
        whenISO, schemaVersion + migration shim" && git push
- [ ] 11. Flip the five rev-2 "in code?" rows to Yes (only after 4–9 all pass)
- [ ] 12. Add test-batch1.js to the repo permanently (first automated tests — the
        Store-seam test goal from this tracker is now partially met)

## ============ BATCH 1 — CODE COMPLETE (pending verification above) ============
- [x] teacherId minted at boot (`ensureDeviceTeacherId()` → op_ + crypto.randomUUID,
      via Store seam, warning toast on failed verified write)
- [x] Stable UUID `id` on every record; delete-by-ID replaces index delete (High-sev
      race fixed; stale id = safe no-op; no-id records render no delete button)
- [x] `whenISO` canonical timestamp; `fmtWhen()` derives display at render; new records
      store NO locale string
- [x] `schemaVersion` on records + profiles
- [x] MIGRATION SHIM: idempotent, every boot, writes only changed buckets; backfills
      id / schemaVersion:1 / teacherId:'legacy'; when→whenISO ONLY on exact
      round-trip (day/month-swap guard — en-IN "11/6" parses as Nov 6 otherwise)
- [x] Envelope stamping centralized INSIDE saveRecord (chokepoint guarantee)
- [x] CSV: When = whenISO (legacy fallback); new Teacher ID column
- [x] Headless suite: test-batch1.js, 7 suites / 35 assertions, all green

## ============ SCOPE CHANGE — CHILD ANALYSIS (new this session) ============
R&D purpose is now BOTH: (1) teacher drill fidelity AND (2) child analysis.
- [ ] **SEND R&D THE BLOCKING QUESTION** (before further build): "Will any child ever
      be assessed on more than one device? Is child analysis longitudinal per-child,
      cross-child statistical, or both?" Bundle with the still-pending written A-vs-B +
      identified-video confirmation. One email, four confirmations.
      - One child = one device → profileId suffices; log assumption in writing; no code
      - Child on >1 device → **stable childId becomes un-backfillable, Batch-1-class,
        before ANY production session.** Preferred: short program-issued child code
        entered once into the profile (never name-matching resolution)
      - True statistical corpus → Batch 4 RLS keyed on child + institution; Postgres
        activates earlier
- [ ] Consent scope note (parked, but record it): TWO purposes must be named under DPDP
      (teacher fidelity + child analysis); teachers are now evaluation subjects and
      should be told. Forward to whoever drafts consent.
- [ ] Update plan-of-work rev 2 with the dual purpose + childId branch

## ============ BATCH 2 — correctness (after Batch 1 verified) ============
- [ ] Verify ALL window.confirm() calls route through confirmModal() (reviewer flagged
      stragglers — confirmDeleteRecord/confirmDeleteChild/confirmClearAll still use
      window.confirm in current source)
- [ ] Harden boot failure: Store._failed, hard-block writes, blocking "storage
      unavailable — restart" state (current boot can silently succeed into empty cache)
- [ ] Rename photo comment "limits identifiability" → "limits storage size"

## ============ BATCH 3 — before identified VIDEO flows ============
- [ ] Operator device lock (PIN on launch + re-gate before danger zone / identified
      export) — still-open P0
- [ ] Local photo-at-rest decision (encrypt OR drop pre-upload) — decide TOGETHER with
      queued-video at-rest rule (Batch 4)

## ============ BATCH 4 — before the Uploader (cloud architecture, LOCKED) ============
- [ ] Private Supabase bucket; short-TTL signed URLs minted server-side — never public
- [ ] Postgres RLS keyed on teacherId / institution (REVISIT: + childId, pending R&D
      answer above); video in Storage, joined by key
- [ ] Cascade delete (row + object + thumbnails) implemented AND proven by a test
- [ ] India region pinned; no cross-region replication
- [ ] Queue-and-retry upload with Store-seam-style write-verify
- [ ] Queued-video at-rest retention/eviction rule (with Batch 3 photo decision)

## ============ PARALLEL TRACKS (external dependencies — start EARLY) ============
- [ ] **CONSENT TEXT + DATA-SHARING AGREEMENT — the real critical path.** Now must name
      BOTH purposes. Needs qualified DPDP 2023 + Rules 2025 review (slow, external).
      Full R&D ask list (access roster, view-only vs download, retention, deletion
      compliance, purpose phrasing, metadata needs, their IRB, who signs) compiled in
      this session's chat.
- [ ] R&D written confirmations (one email): A-vs-B, identified video, childId/device
      question, analysis shape

## ---- CARRY-FORWARD (still open) ----

### VERIFY (on emulator/device)
- [ ] Confirm last GitHub push landed; .env / audio/ NOT in repo
- [ ] On-device re-test #9 (Data-dir export attaches to share sheet)
- [ ] On-device re-test #6 (accent-color renders on API 37)

### AUDIO (pipeline done, content pending)
- [ ] Real sopTranslations for the other 12 activities (content team, native speakers)
- [ ] Content-team instruction PDF ("how to add SOP translations")

### WAITING ON INPUT
- [ ] O&M LEAD: (1) "Unable" distinct from "Independent"? (2) "with cane" tag colour?
- [ ] O&M LEAD: assessment model — prompt hierarchy, trial counts, environmental
      conditions, longitudinal progress
- [ ] CONTENT/O&M: full activity list; final target-language list; scoring rubric

### TESTS
- [x] First automated suite exists (test-batch1.js — covers Store-adjacent
      write/read-back via saveRecord + migration + delete-by-id)
- [ ] CSV builder tests (escaping, BOM, demographics join, column union) — partially
      covered by Suite 6; dedicated tests still worthwhile

### CAPACITOR WRAP (later)
- [ ] Real Android phone test (no Android phone; emulator covers daily)
- [ ] App icon + splash; Play Store signed AAB; iOS target (all deferred)

### DESIGN (path (a) — substantially done)
- [ ] Serif .lede type confidence + whitespace (low priority)

### STILL OWED BY USER (carried across sessions)
- [ ] Practice edit of activities.js (add one activity)

## QUICK NEXT ACTION (start of next session)
- [ ] Run the INSTALL + VERIFY checklist at the top, step by step, one command at a
      time. Have the delivered index.html + test-batch1.js ready.
- [ ] Send the R&D email (childId/device question + written confirmations) — no code
      depends on it today, but Batch 4 and possibly a new Batch-1-class item do.
