# PROJECT TRACKER — O&M Cane Training App

A living checklist. Say "wrap up" at the end of a session to refresh this + MEMORY.md.
Last updated: end of a short PLANNING session (no code changed). Clarified the next three
workstreams — GitHub, real-phone test, and a "look more sophisticated / Nike" design question —
and pinned down GitHub + the design options enough to execute in the next chat.

## DONE (v0 → UI redesign → mobile-prep → profiles → 3-page → entry mgmt → planning → native wrap WRITTEN → native wrap BUILT & VERIFIED on emulator)
- [x] Decided: app is the TEACHER's tool; does NOT pair with the cane
- [x] Web app first; Capacitor → built, running, storage-verified on emulator
- [x] Activities live as editable DATA (activities.js), not hardcoded
- [x] 7 categories + 13 activities from the Figma workshop board
- [x] Data capture: count / result / checkbox / notes
- [x] Child profiles (name, DOB, height, weight, dominant hand, optional photo); age derived
- [x] Records link to a child via `profileId`
- [x] 3-page restructure: Welcome → Hub → flat Activities list → run screen + Manage-data
- [x] 3-tier deletion behind the Store seam
- [x] Storage seam (`Store`) + write-verify; CSV export (UTF-8 BOM, RFC-4180, demographics)
- [x] Design system locked + documented (DESIGN_NOTES.md)
- [x] Mobile-prep: safe-area insets, touch correctness, bigger targets
- [x] Consent blocker cleared (compliance team owns consent); manager decision PDF delivered
- [x] Two-video architecture settled; session video → Supabase (Option A admin); pooling opened
- [x] Compliance research doc (PDF + .docx): DPDP risks; Rule 10 + Rule 11; India-region Supabase
- [x] Decided: Android first, NO bundler (protects no-coder activities.js workflow)
- [x] Store seam → cache-backed async hybrid (write-verify honest); all callers awaited
- [x] CSV export made backend-aware (native Filesystem+Share / web anchor)
- [x] capacitor.config.json + package.json (Cap 8 + 4 plugins); BUILD-ANDROID.md guide
- [x] Android build finished + verified on emulator: Java fix (JAVA_HOME → bundled jbr-21),
      cold-restart storage test PASSED, CSV export → share sheet OPENS, build-log PDF produced

## THIS SESSION (planning only — no code)
- [x] Confirmed the real "now what": real-phone test is the next on-device action; the true
      blockers after that are DECISIONS (pooling shape + offline upload), not code
- [x] Clarified tests honestly: NONE exist; manual on-device verification only so far.
      Highest-value first tests = `Store` seam + CSV builder. Not UI. Deliberate future add.
- [x] GitHub pinned down for next chat: PRIVATE repo; `.gitignore` excludes
      `node_modules/`, `android/`, `www/`; repo = source + docs only; assistant supplies the
      click-by-click, user does the auth/push
- [x] Design question framed: "sophisticated / like Nike" is in TENSION with the restraint
      design system. Two paths offered; USER MUST PICK next chat:
      (a) sharpen field-notebook [recommended — per-category icons first] or
      (b) a bolder Nike-ish comparison mockup (means rewriting DESIGN_NOTES.md + re-checking a11y)

## QUEUED FOR NEXT CHAT (rough priority)
- [ ] 1. GITHUB — click-by-click setup guide: create PRIVATE repo → `.gitignore`
        (`node_modules/`, `android/`, `www/`) → first commit → push. Step + "Check" style.
        HIGHEST VALUE: project is currently a single copy = live data-loss risk.
- [ ] 2. REAL PHONE — enable USB debugging; `adb devices`; `npx cap run android`; pick the
        physical device (BUILD-ANDROID.md step 10). Repeat the cold-restart storage test there.
- [ ] 3. DESIGN PICK — user chooses (a) sharpen field-notebook (per-category monoline icons →
        serif/type confidence → whitespace) or (b) Nike-ish comparison mockup.

## WAITING ON INPUT (needed to proceed on features)
- [ ] USER: detailed POOLING answer — central corpus vs per-teacher backup
- [ ] DECIDE: offline-classroom upload behaviour — immediate vs queue-and-upload-later
- [ ] CONFIRM: filename fields (child + activity + date + time) — or add teacher/school?
- [ ] Demo video CLIPS (the only blocker on the demo-video quick win)
- [ ] Formal SOPs + final scoring rubric (content team)
- [ ] Full / final activity list; final target-language list
- [ ] O&M LEAD: (1) "Unable" distinct from "Independent"? (2) "with cane" tag colour?

## TO BUILD — CAPACITOR WRAP (finishing)
- [x] Build + run on emulator + storage test
- [ ] Run on a real phone (queued, item 2 above)
- [ ] App icon + splash (`@capacitor/assets`) — cosmetic
- [ ] Play Store signed AAB — only for public distribution, not pilot
- [ ] iOS (`npx cap add ios`) — needs Xcode + Apple Developer acct $99/yr

## TO BUILD — TESTS (deliberate add, when chosen)
- [ ] Smoke tests on the `Store` seam: write → read-back → verify
- [ ] CSV builder tests (escaping, BOM, demographics join, column union)
- [ ] (NOT UI tests — low value for now)

## TO BUILD — DESIGN (after the pick above)
- [ ] If (a): per-category monoline icons in the card `.blob` (compass, ear, footprints, mat…)
        — extend the existing SVG ICON set; then serif `.lede` type confidence + whitespace
- [ ] If (b): separate Nike-ish comparison mockup + rewrite DESIGN_NOTES.md + re-check
        contrast / type sizes / motion / reduced-motion

## TO BUILD — FEATURES (after the wrap is verified on a phone, in order)
- [ ] 1. DEMO VIDEO — wire bundled clips into the existing `videoFile` slot (blocked on clips)
- [ ] 2. CONSENT FIELD — per-child flag (obtained / by / date), BEFORE any video flows
- [ ] 3. SESSION VIDEO capture + upload:
        - [ ] capture control on run screen (reuse photo file-input, no downscale)
        - [ ] NEW `Uploader` seam mirroring `Store` (do NOT bolt onto Store)
        - [ ] India-region Supabase bucket + admin login (Option A)
        - [ ] structured filename; save returned link into the session record
        - [ ] offline decision + upload-failure path
        - [ ] delete-everywhere (deleteRecord/deleteProfile also delete the cloud file)
- [ ] 4. ADMIN ACCESS — Supabase dashboard (config only for v1)

## TO BUILD — POOLING / BACKEND (only when greenlit + consent in place)
- [ ] Turn on Supabase Postgres; sync records up against the Store seam
- [ ] Per-child consent recorded/verifiable before pooling
- [ ] Delete-everywhere across device + cloud (DPDP right-to-erasure)
- [ ] Central-corpus vs per-teacher-backup decision (raises consent bar if central)
- [ ] Possibly Option B: in-app admin dashboard

## TO ADD — v1 (real content + usability)
- [ ] Real activities & SOP text; Sarvam TTS audio per language (Bulbul v3) → audioFile slots
- [ ] Demo videos in videoFile slots
- [ ] Per-student progress over time
- [x] Exportable progress (CSV) — DONE (and verified on native). Printable view + JSON
      re-import still open.
- [ ] Real per-category icons in the card blob (now also tracked under DESIGN above)

## HOUSEKEEPING (low priority)
- [ ] Update the storage guardrail comment in index.html if needed (now cache-backed async)

## QUICK NEXT ACTION
- [ ] Next chat: do the GitHub setup first (biggest risk reducer), then the design pick
- [ ] When you have a phone + cable: run on a real device + repeat the cold-restart test
- [ ] STILL OWED: practice edit of activities.js (add one activity); the pooling + offline calls
