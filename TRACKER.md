# PROJECT TRACKER — O&M Cane Training App

A living checklist. Say "wrap up" at the end of a session to refresh this + MEMORY.md.
Last updated: end of a DESIGN/EXECUTION session. Screen-3 redesign DONE + verified on the
Pixel 10 emulator + pushed to GitHub: activities list now GROUPED by category (was a flat
7-hue stack), 7 per-category monoline icons wired in (positional, by index), and the cane
tag hierarchy fixed (rust = with cane, neutral pill = without) after a first-pass rainbow
regression was caught and corrected.

## DONE (v0 → UI redesign → mobile-prep → profiles → 3-page → entry mgmt → planning → native wrap BUILT & VERIFIED → GitHub → grouped list + icons)
- [x] Decided: app is the TEACHER's tool; does NOT pair with the cane
- [x] Web app first; Capacitor → built, running, storage-verified on emulator
- [x] Activities live as editable DATA (activities.js), not hardcoded
- [x] 7 categories + 13 activities from the Figma workshop board
- [x] Data capture: count / result / checkbox / notes
- [x] Child profiles (name, DOB, height, weight, dominant hand, optional photo); age derived
- [x] Records link to a child via `profileId`
- [x] 3-page restructure: Welcome → Hub → Activities list → run screen + Manage-data
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
- [x] GitHub: private repo live at `github.com/Adistor777/om-cane-training`; gitignore
      excludes node_modules/android/www; GITHUB-SETUP.md deliverable

## THIS SESSION (design + execution)
- [x] **GROUPED ACTIVITIES LIST (screen 3).** Diagnosed the "looks like an AI website"
      problem as the flat 7-hue stack interleaving categories (colour stippling, not
      wayfinding) — NOT a bad palette. Rewrote `showActivityList()` to cluster activities
      under per-category headers (hue icon chip + deep-hue name); neutral cards (no spine);
      empty categories hidden. New CSS (`.cat-group/.cat-head/.cat-ic/.cat-name/.cat-cards/
      .card.activity.grouped`); stagger + reduced-motion extended to `.cat-group`.
- [x] **7 PER-CATEGORY MONOLINE ICONS — designed one-at-a-time w/ sign-off, then wired in.**
      compass / ear / source+bilateral-waves / footprints / push-toy(handle+grip+wheels, the
      grid-snapped "D3") / stacked-terrain-layers / 3×3 dots. Added to `ICON`, mapped via
      `CATEGORY_ICONS[]` + `catIcon(i)` (positional, by category index, fallback dots).
      Also replaced the run-screen `home-dot` LETTER with the category icon.
- [x] **CANE TAG HIERARCHY FIX.** First grouped pass tinted the "Without cane" tag by
      category → moved the rainbow to the tags. Caught by user. Fixed: with-cane = fixed
      rust (only coloured tag), without-cane = neutral `.tag.neutral` pill (transparent,
      `--line` border, `--ink-soft` text). Colour now does ONE job per surface.
- [x] **On-device verified** on the Pixel 10 Pro XL emulator (API 37 arm64). Hit the
      no-bundler stale-`www/` gotcha once (emulator showed old screen because `cp` to `www/`
      hadn't landed); resolved by re-running the cp + grep-verifying `www/index.html` before
      sync. Lesson baked into the build loop.
- [x] **Pushed to GitHub** (add/commit/push).

## QUEUED FOR NEXT CHAT
- [ ] Rest of design path (a): serif `.lede` typographic confidence + more generous
      whitespace/rhythm (lower priority — the big screen-3 moves are done)
- [ ] (Optional) per-card hover border in its group hue on the grouped list — deliberately
      skipped (edges toward re-adding per-card colour); only revisit if wanted

## WAITING ON INPUT (needed to proceed on features)
- [ ] USER: detailed POOLING answer — central corpus vs per-teacher backup
- [ ] DECIDE: offline-classroom upload behaviour — immediate vs queue-and-upload-later
- [ ] CONFIRM: filename fields (child + activity + date + time) — or add teacher/school?
- [ ] Demo video CLIPS (the only blocker on the demo-video quick win)
- [ ] Formal SOPs + final scoring rubric (content team)
- [ ] Full / final activity list; final target-language list
- [ ] O&M LEAD: (1) "Unable" distinct from "Independent"? (2) "with cane" tag colour?
      (grouped-list work reinforces fixed rust — now the only coloured tag)

## TO BUILD — CAPACITOR WRAP (finishing)
- [x] Build + run on emulator + storage test (verified; screen-3 re-verified this session)
- [ ] Run on a real Android phone (deferred — user has no Android phone; do at pilot time)
- [ ] App icon + splash (`@capacitor/assets`) — cosmetic
- [ ] Play Store signed AAB — only for public distribution, not pilot
- [ ] iOS (`npx cap add ios`) — needs Xcode + Apple Developer acct $99/yr (user has an iPhone)

## TO BUILD — TESTS (deliberate add, when chosen)
- [ ] Smoke tests on the `Store` seam: write → read-back → verify
- [ ] CSV builder tests (escaping, BOM, demographics join, column union)
- [ ] (NOT UI tests — low value for now)

## TO BUILD — DESIGN (path (a) — substantially done)
- [x] Design pick made: (a) sharpen field-notebook
- [x] 7 per-category monoline icons designed + wired + on-device verified
- [x] Grouped activities list (replaces flat 7-hue stack)
- [x] Cane tag hierarchy fixed (rust / neutral)
- [ ] Serif `.lede` type confidence + whitespace (remaining, lower priority)

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
- [x] Exportable progress (CSV) — DONE + verified on native. Printable view + JSON re-import open.
- [x] Real per-category icons in the card blob — DONE (designed + wired + verified this session)

## HOUSEKEEPING (low priority)
- [ ] Update the storage guardrail comment in index.html if needed (now cache-backed async)
- [x] Habit reinforced: grep `www/index.html` after the cp, BEFORE sync, to catch stale www
- [ ] Habit: run the 3-line git save loop at the end of any session that changed code

## QUICK NEXT ACTION
- [ ] Next chat: serif/type/whitespace polish (path a remainder), OR await pooling +
      offline-upload decisions to unblock session video
- [ ] After any code change: `cp index.html activities.js www/` → grep-verify www →
      `npx cap sync android` → `npx cap run android`; then git add/commit/push
- [ ] STILL OWED by user: practice edit of activities.js (add one activity); pooling +
      offline-upload decisions
