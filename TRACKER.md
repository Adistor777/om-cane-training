# PROJECT TRACKER — O&M Cane Training App

A living checklist. Say "wrap up" at the end of a session to refresh this + MEMORY.md.
Last updated: end of a short BUILD session. Demo-video plumbing PROVEN end-to-end on the
Pixel 10 emulator: a real `.mp4` (throwaway internet download) was compressed with ffmpeg
(191 MB → 2.4 MB, 640×360 H.264/AAC), wired into the `sound-which` activity's `videoFile`
slot via a one-line `activities.js` edit, bundled through `www/`, and confirmed playing in
the native `<video>` player. The slot itself needed NO code — it was already built; this
session verified it works with a real file. `activities.js` edit committed + pushed (the
clip itself is gitignored via `www/` — correct, it's a throwaway test artifact).

## DONE (v0 → UI redesign → mobile-prep → profiles → 3-page → entry mgmt → planning → native wrap BUILT & VERIFIED → GitHub → grouped list + icons → demo-video slot PROVEN)
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
- [x] Consent blocker cleared (legal/compliance team owns consent); manager decision PDF delivered
- [x] Two-video architecture settled; session video → Supabase (Option A admin); pooling opened
- [x] Compliance research doc (PDF + .docx): DPDP risks; Rule 10 + Rule 11; India-region Supabase
- [x] Decided: Android first, NO bundler (protects no-coder activities.js workflow)
- [x] Store seam → cache-backed async hybrid (write-verify honest); all callers awaited
- [x] CSV export made backend-aware (native Filesystem+Share / web anchor)
- [x] capacitor.config.json + package.json (Cap 8 + 4 plugins); BUILD-ANDROID.md guide
- [x] Android build finished + verified on emulator: Java fix, cold-restart PASSED,
      CSV export → share sheet OPENS, build-log PDF produced
- [x] GitHub: private repo live at `github.com/Adistor777/om-cane-training`
- [x] Grouped activities list + 7 per-category monoline icons + cane-tag hierarchy fix
- [x] **Demographics storage clarified: on-device key-value JSON via Store seam, NO database.
      A real DB only enters IF pooling goes central — and then as an additive sync layer.**
- [x] **DEMO-VIDEO SLOT PROVEN on-device with a real file (this session).**

## THIS SESSION (build)
- [x] **Clarified the demographics storage scene** (no DB today; on-device Preferences/
      localStorage JSON under `profiles`; Supabase/Postgres only if pooling goes central,
      and even then additive — capture code is no-regret either way).
- [x] **Installed ffmpeg** (`brew install ffmpeg`).
- [x] **Compressed a test clip:** 191 MB → 2.4 MB, scaled 640×360, H.264/AAC, via
      `ffmpeg -i demo.mp4 -vf "scale=640:-2" -c:v libx264 -crf 28 -c:a aac -b:a 96k -t 60 demo-sound.mp4`.
- [x] **Wired it in:** one-line `activities.js` edit — `sound-which` `videoFile` →
      `"demo-sound.mp4"`. Verified exactly one slot changed.
- [x] **Ran the build loop with the stale-`www/` guard:** added the clip to the `cp`
      (`cp index.html activities.js demo-sound.mp4 www/`), grep + `ls -lh` confirmed both
      the edit AND the 2.4 MB file landed in `www/` BEFORE sync, then `npx cap sync android`
      → `npx cap run android`.
- [x] **On-device PASS:** player renders + plays in the SOP "How to run this" disclosure on
      the Sound group's "Which Sound?" activity.
- [x] **Committed + pushed** the `activities.js` edit (clip not committed — `www/` gitignored).

## CARRY-FORWARD — DEMO VIDEO (slot done; real content pending)
- [ ] Real demo clips must be **footage the team owns** (today's was a throwaway download)
- [ ] Keep real clips **compressed to a few MB each** (ffmpeg recipe above)
- [ ] Wiring real clips = drop file in root + `www/`, set `videoFile`, run the build loop.
      No architecture change; the slot is DONE.

## QUEUED FOR NEXT CHAT
- [ ] Rest of design path (a): serif `.lede` typographic confidence + more generous
      whitespace/rhythm (lower priority)
- [ ] Test harness (strong unblocked engineering pick — see below)

## WAITING ON INPUT (needed to proceed on features)
- [ ] USER: detailed POOLING answer — central corpus vs per-teacher backup
- [ ] DECIDE: offline-classroom upload behaviour — immediate vs queue-and-upload-later
- [ ] CONFIRM: filename fields (child + activity + date + time) — or add teacher/school?
- [ ] Real demo video CLIPS the team owns (slot is now proven; only content is missing)
- [ ] Formal SOPs + final scoring rubric (content team)
- [ ] Full / final activity list; final target-language list
- [ ] O&M LEAD: (1) "Unable" distinct from "Independent"? (2) "with cane" tag colour?

## TO BUILD — CAPACITOR WRAP (finishing)
- [x] Build + run on emulator + storage test (verified; demo-video re-verified this session)
- [ ] Run on a real Android phone (deferred — user has no Android phone; do at pilot time)
- [ ] App icon + splash (`@capacitor/assets`) — cosmetic
- [ ] Play Store signed AAB — only for public distribution, not pilot
- [ ] iOS (`npx cap add ios`) — needs Xcode + Apple Developer acct $99/yr (user has an iPhone)

## TO BUILD — TESTS (deliberate add, when chosen — strong unblocked pick)
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
- [x] 1. DEMO VIDEO — slot PROVEN on-device. Blocked only on real owned clips.
- [ ] 2. CONSENT FIELD — per-child flag (obtained / by / date), BEFORE any video flows.
        Records the legal team's consent; no-regret; buildable now without pooling decision.
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
- [ ] Real demo videos in videoFile slots (slot proven; need owned, compressed clips)
- [ ] Per-student progress over time
- [x] Exportable progress (CSV) — DONE + verified on native.
- [x] Real per-category icons in the card blob — DONE
- [x] Demo video plays in the videoFile slot — DONE (proven on-device this session)

## HOUSEKEEPING (low priority)
- [ ] Update the storage guardrail comment in index.html if needed (now cache-backed async)
- [x] Habit reinforced: grep/ls `www/` after the cp, BEFORE sync, to catch stale www
- [x] Habit reinforced: bundled media must be ADDED to the `cp` line, not just HTML/JS
- [ ] Habit: run the 3-line git save loop at the end of any session that changed code

## QUICK NEXT ACTION
- [ ] Next chat: serif/type/whitespace polish (path a remainder), OR the test harness
      (Store seam + CSV builder), OR await pooling + offline-upload decisions for session video
- [ ] After any code change: `cp index.html activities.js [media] www/` → grep/ls-verify www →
      `npx cap sync android` → `npx cap run android`; then git add/commit/push
- [ ] STILL OWED by user: pooling + offline-upload decisions; the practice edit of
      activities.js (add one activity)
