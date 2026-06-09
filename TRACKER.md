# PROJECT TRACKER — O&M Cane Training App

A living checklist. Say "wrap up" at the end of a session to refresh this + MEMORY.md.
Last updated: end of an EXECUTION session. GitHub DONE (private repo live, single-copy risk
closed); storage re-verified on the Pixel 10 emulator; design direction PICKED — path (a),
sharpen field-notebook — and the 7 per-category monoline icons designed + previewed, pending
wire-in next chat.

## DONE (v0 → UI redesign → mobile-prep → profiles → 3-page → entry mgmt → planning → native wrap BUILT & VERIFIED → GitHub + design pick)
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
- [x] Android build finished + verified on emulator: Java fix, cold-restart PASSED,
      CSV export → share sheet OPENS, build-log PDF produced

## THIS SESSION (execution)
- [x] **GITHUB — DONE.** Private repo live at `github.com/Adistor777/om-cane-training`.
      `.gitignore` excludes `node_modules/`, `android/`, `www/` (+ .DS_Store, .idea/, etc.);
      verified via `git status` before commit. 15 files committed (source + docs + PDFs +
      SVG + lockfile). Author fixed to real email via `--amend --reset-author`. Pushed over
      HTTPS w/ Personal Access Token. `GITHUB-SETUP.md` deliverable produced + downloaded.
      Single-copy data-loss risk is CLOSED.
- [x] **STORAGE re-verified** on the Pixel 10 Pro XL emulator (API 37 arm64): added a child,
      cold-killed the app, relaunched — child persisted. Native Preferences durable; no shim.
- [x] Clarified: user has Mac + iPhone, NO Android phone. App is an Android wrap; iPhone can't
      run it natively (no iOS target). Decided NOT to add iOS this session ("wrap last") —
      emulator is the same engine, real-phone test deferred to when a pilot phone is in hand.
- [x] **DESIGN — PICKED path (a):** sharpen field-notebook (NOT Nike spectacle).
- [x] Designed + previewed all 7 per-category monoline icons in their hues. All monoline,
      viewBox 0 0 24 24, stroke=currentColor, drop-in for the ICON set. Positional (by index).

## QUEUED FOR NEXT CHAT
- [ ] 1. WIRE THE ICONS — swap the single letter in `.blob` for the per-category monoline
        icon in `index.html`. Keyed by category index. Then verify on-device at true 34px;
        check Sound+Direction (busiest) and Push Toy (least literal) especially — simplify
        if muddy.
- [ ] 2. Rest of path (a): serif `.lede` typographic confidence + more generous whitespace.

## WAITING ON INPUT (needed to proceed on features)
- [ ] USER: detailed POOLING answer — central corpus vs per-teacher backup
- [ ] DECIDE: offline-classroom upload behaviour — immediate vs queue-and-upload-later
- [ ] CONFIRM: filename fields (child + activity + date + time) — or add teacher/school?
- [ ] Demo video CLIPS (the only blocker on the demo-video quick win)
- [ ] Formal SOPs + final scoring rubric (content team)
- [ ] Full / final activity list; final target-language list
- [ ] O&M LEAD: (1) "Unable" distinct from "Independent"? (2) "with cane" tag colour?

## TO BUILD — CAPACITOR WRAP (finishing)
- [x] Build + run on emulator + storage test (re-verified on Pixel 10 this session)
- [ ] Run on a real Android phone (deferred — user has no Android phone; do at pilot time)
- [ ] App icon + splash (`@capacitor/assets`) — cosmetic
- [ ] Play Store signed AAB — only for public distribution, not pilot
- [ ] iOS (`npx cap add ios`) — needs Xcode + Apple Developer acct $99/yr (user has an iPhone)

## TO BUILD — TESTS (deliberate add, when chosen)
- [ ] Smoke tests on the `Store` seam: write → read-back → verify
- [ ] CSV builder tests (escaping, BOM, demographics join, column union)
- [ ] (NOT UI tests — low value for now)

## TO BUILD — DESIGN (path (a) chosen; in progress)
- [x] Design pick made: (a) sharpen field-notebook
- [x] 7 per-category monoline icons designed + previewed
- [ ] Wire icons into the `.blob` (NEXT CHAT, item 1) + on-device verify at 34px
- [ ] Serif `.lede` type confidence + whitespace (after icons)

## TO BUILD — FEATURES (after design polish, in order)
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
- [ ] Real per-category icons in the card blob — DESIGNED this session; wire-in queued

## HOUSEKEEPING (low priority)
- [ ] Update the storage guardrail comment in index.html if needed (now cache-backed async)
- [ ] Habit: run the 3-line git save loop at the end of any session that changed code

## QUICK NEXT ACTION
- [ ] Next chat: wire the 7 icons into `.blob`, then verify on-device at 34px
- [ ] After any code change: `git add .` → `git commit -m "..."` → `git push`
- [ ] STILL OWED by user: practice edit of activities.js (add one activity); pooling +
      offline-upload decisions
