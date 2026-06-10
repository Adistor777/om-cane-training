# MEMORY.md — Project Context Handoff

**Purpose:** paste this into a new chat (or keep it in Project knowledge) so the
assistant has full context without re-explaining.

**Last updated:** End of a short BUILD session. The demo-video plumbing is now
PROVEN end-to-end on-device: a real `.mp4` was compressed, wired into one
activity's `videoFile` slot, bundled through `www/`, and confirmed playing in
the native `<video>` player on the emulator. The `videoFile` slot needs no
further code — it was already built; this session verified it works with a real
file.

**What changed this session:**

1. **DEMO VIDEO SLOT — PROVEN with a real file (plumbing test, DONE).** The
   `videoFile` slot was already wired in `index.html` (renders a `<video>` when
   the slot has a filename, dashed placeholder when empty). This session
   confirmed it end-to-end with an actual clip:
   - Test clip was a **throwaway internet download** (191 MB, silent, H.264,
     2562×1440). Used ONLY to prove plumbing — NOT real content, NOT committed.
   - **Compressed with ffmpeg** (installed via `brew install ffmpeg`): 191 MB →
     **2.4 MB**, scaled 640×360, H.264/AAC. Recipe:
     `ffmpeg -i demo.mp4 -vf "scale=640:-2" -c:v libx264 -crf 28 -c:a aac -b:a 96k -t 60 demo-sound.mp4`
     (the `b:a` warning was harmless — source had no audio track).
   - **One-line `activities.js` edit:** `sound-which` activity (line ~104,
     "Which Sound? (Identification)") `videoFile: ""` → `videoFile: "demo-sound.mp4"`.
     Every other slot stays `""`. Verified exactly one change via grep.
   - **Build loop run with the stale-`www/` guard:**
     `cp index.html activities.js demo-sound.mp4 www/` (note the clip is in the
     cp — it must land in `www/` to be bundled) → grep + `ls -lh` to confirm
     BOTH the edit and the 2.4 MB file landed in `www/` BEFORE sync →
     `npx cap sync android` → `npx cap run android`.
   - **On-device: PASS.** Player renders and plays below the SOP steps +
     facilitator note in the "How to run this" disclosure, on the Sound group's
     "Which Sound?" activity.
   - **WebView-friendly profile confirmed:** H.264 video / AAC audio in `.mp4`
     is what the Android WebView `<video>` plays reliably. Avoid mkv/webm-exotic/
     mov when wiring real clips.

2. **No other code changed.** Storage seam, grouped list, icons, profiles,
   export — all untouched and intact.

**CARRY-FORWARD on demo video (not done, deliberately):**
- Today's clip is a STAND-IN. Real demo videos must be **footage the team owns**
  (not internet downloads), given the children's-data context.
- Keep real clips **compressed to a few MB each** (the ffmpeg recipe above works).
- Demo videos are the ONE video type that gets BUNDLED as content (vs session
  video → cloud). They live in `www/`, so they're gitignored — the meaningful
  committed change is just the `activities.js` filename edit.
- The slot itself is DONE. Wiring real clips = drop file in root + `www/`, set
  `videoFile`, run the build loop. No architecture change.

**Files in `om-app`:**
`index.html`, `activities.js`, `capacitor.config.json` (appId `org.omcane.trainer`),
`package.json` (Cap 8 + 4 plugins), `package-lock.json`, `BUILD-ANDROID.md`,
`README.md`, `DESIGN_NOTES.md`, `MEMORY.md`, `TRACKER.md`, `GITHUB-SETUP.md`,
two PDFs (`Compliance-Risks-and-How-We-Tackle-Them.pdf`,
`OM-Cane-Training-Native-Build-Log.pdf`), `session_video_flow_for_manager_v2.svg`,
`three_pages_warm_palette.html`, plus generated `android/` + `www/` + `node_modules/`,
plus the test artifacts `demo.mp4` (191 MB source) + `demo-sound.mp4` (2.4 MB,
in root and www/ — both gitignored / throwaway).

**WHERE THINGS STAND (exact resume point):**
- **GitHub: LIVE + private** (`github.com/Adistor777/om-cane-training`). This
  session's `activities.js` edit committed/pushed; the test clip is NOT in the
  repo (www/ gitignored — correct).
- **Demo-video slot PROVEN on-device.** Blocked now only on real owned clips.
- Environment unchanged: M5 MacBook Air; emulator Pixel 10 Pro XL, API 37
  arm64-v8a (chosen over recommended 35/36 — works; rule out the 37-vs-36 gap
  first if anything misbehaves). Node v26, Homebrew, ffmpeg now installed,
  JAVA_HOME → Android Studio's bundled jbr-21 in `~/.zshrc` (persists; don't
  redo; don't install Java separately).
- **DESIGN path (a) "sharpen field-notebook" substantially DONE** (grouped list
  + 7 icons + cane-tag hierarchy from prior session). Remaining: serif `.lede`
  typographic confidence + more generous whitespace/rhythm. Lower priority.
- **The true blockers for session video are still DECISIONS, not code:**
  pooling shape + offline-upload behaviour. Both still owed by the user.

**Still NOT done in the wrap (deliberately later):** app icon + splash art
(`@capacitor/assets`, cosmetic), Play Store signed-AAB release, iOS
(`npx cap add ios` — needs Xcode + Apple Developer acct; deferred), and session
video (adds camera permissions to the Android manifest; blocked on pooling +
offline-upload decisions).

---

## 1. WHO + WHAT

- **User role:** app developer & designer. NOT responsible for O&M content, activities,
  SOPs, scoring rubric — a content team hands those over. NOT the lawyer — **consent and
  legal/compliance are owned by a legal team**, not the user. User builds *how the app
  holds and captures* that content.
- **User skill level:** can design/build, but newer to terminal/servers and backend
  concepts. On a **Mac (M5 MacBook Air, Apple Silicon)**, uses **PyCharm**. Has an
  **iPhone**, NO Android phone. No Word (no Office subscription) — deliver manager-facing
  docs as **PDF**. Explain plainly, click-by-click, with exact commands + a "Check" per
  step. Works through terminal steps one at a time, asks before moving on. Decides quickly
  once given clear trade-offs + the assistant's stated reasoning. Sharp design eye.
- **The product:** a web app (wrapped native via Capacitor 8, Android) for TEACHERS who
  train blind / visually-impaired children to use a **smart cane**. Teachers set up a
  child, run structured activities per child, follow an SOP per activity, and **collect
  data** on performance.
- **Why it matters:** a key problem is the **stigma** around cane use; activities aim to
  teach cane skills and build confidence. Data collection is a stated key goal.
- **Project framing:** research-first partner (O&M assessment landscape, ResearchRabbit
  workflow, Sarvam/ElevenLabs as buildable inputs). Default mode RESEARCH; switch to
  BUILD only when the user explicitly says so.

## 2. KEY DECISIONS (locked)

- App is the **teacher's tool**. It does **NOT** pair with the cane.
- **Native via Capacitor 8, Android first, NO bundler.** Wrap is BUILT + RUNNING +
  storage-verified on the emulator. iOS additive later.
- **On GitHub now** — private repo, source + docs only, generated folders gitignored.
- **Local-first for everything EXCEPT session video.** Profiles, records, photo, consent
  flag stay on-device. Only session VIDEO goes to the cloud (too big for local). Demo
  videos are the exception — small, bundled as content into `www/`.
- **Demographics storage TODAY = on-device, NO database.** Six profile fields go through
  the `Store` seam into Capacitor Preferences (native) / localStorage (web), as JSON under
  the `profiles` key. A real DB (Supabase/Postgres) only enters IF pooling goes central
  (Branch B) — and even then it's an ADDITIVE sync layer on top of the Store seam, NOT a
  rewrite of capture. Capture code is no-regret under both branches.
- **Consent: HANDLED by the legal/compliance team.** They obtain parental/guardian
  consent. NOT the user's job. From compliance research: population hit by BOTH Rule 10
  (child) AND Rule 11 (person with disability w/ lawful guardian); burden of PROVING valid
  consent falls on the app as data fiduciary → a per-child consent FIELD still matters
  even though building it is parked.
- **Session video → Supabase cloud storage.** File in cloud; local record holds a link.
  Admin downloads via Supabase's own dashboard = **Option A** (config, not code).
  **Option B** (in-app admin view) deferred. India-region Supabase recommended.
- **Demo video = content.** Existing `videoFile` slot, PROVEN this session. Bundle clips.
  No architecture change. Blocked only on real owned clips.
- **No standalone MySQL/Postgres server.** Supabase (which IS Postgres) covers it when a
  DB is actually needed (Option B / pooling). Don't add a DB ahead of need.
- **Pooling is coming but NOT now.** Ship local + video-to-Supabase first.
- **Four screens:** Welcome → Hub → **grouped** Activities list → run screen, PLUS
  Manage-data (off the Hub).
- **Demographics = exactly 6 fields (locked):** name, DOB, height, weight, dominant hand,
  optional low-res photo. Age derived from DOB, never stored.
- **Activities are editable DATA, not hardcoded** (activities.js). The no-coder
  edit-refresh workflow is SACRED — it's why the no-bundler path was chosen.
- **SOPs** = text + audio + optional demo video, in Indian languages. Audio via Sarvam
  TTS (Bulbul v3), pre-generated, played offline.
- **Design system locked & documented** (DESIGN_NOTES.md — "field notebook"). 7-hue
  CATEGORY_PALETTE; do NOT set per-category colours in activities.js. Guardrails: one
  accent, one shadow tier, serif only on `.lede`, differentiated radii (20/14/11), all
  hues WCAG AA, `--ink-faint #736b5e` (don't lighten). Colour does ONE job per surface:
  on the grouped list, category hue lives ONLY on the group header; cards neutral; cane
  tag binary (rust = with cane, neutral pill = without).

## 3. OPEN QUESTIONS (need answers)

- **POOLING SHAPE (BIGGEST):** central corpus (org analyses program-wide) vs per-teacher
  backup. Sets the consent/compliance bar + whether to turn on the Supabase DB. STILL OWED.
  (Seen from the demographics angle: Branch A = stays local, lowest compliance burden,
  no aggregate analysis; Branch B = syncs to Supabase/Postgres, enables org-wide analysis,
  full compliance weight lands here.)
- **Offline classrooms:** upload-immediately vs queue-and-upload-later. Decide BEFORE
  writing session-video upload code. Biggest fork in the upload logic.
- **Filename scheme for uploaded video:** proposed child + activity + date + time. Confirm.
- **Consent recorded IN-APP:** a per-child consent flag (obtained/by/date) on the profile
  BEFORE video flows. The "no-regret" field. (Legal team owns the consent PROCESS; this is
  just the field that records it.)
- **Delete-everywhere:** deleting a local record must also delete the cloud video file
  (DPDP right-to-erasure). Not yet built.
- Final scoring rubric + formal SOP text (content team owns).
- Final activity list; final target-language list (vs Sarvam's 11).
- Is the teacher-user sighted, or a blind/low-vision TVI? If blind, interface must be
  screen-reader fluent (built toward this).
- Two O&M-lead design decisions: (1) should "Unable" look distinct from "Independent"?
  (2) "with cane" tag — fixed rust (current) or category colour? (grouped-list work
  reinforces fixed rust as the only coloured tag).

## 4. THE ACTIVITIES (from the Figma workshop board)

7 categories, 13 activities. Each generally runs **without cane → with cane**; several use
**counting steps** as the measure. Category order matters — palette AND icons are keyed by
index, so reordering in activities.js moves both.
1. **Direction** — Left-Right (rhyme), Front-Back.
2. **Sound** — Identification, Localization. (Identification now carries the demo-video
   test clip in its `videoFile` slot.) Stand 3 steps away; angle recording at child +
   facilitators.
3. **Sound + Direction** — near/far, simple→narrative, same concept with cane, comparative
   step count.
4. **Straight Line Travel** — toward a sound, without cane → with cane (push toy).
5. **Push Toy** — race on a path with push toy on a mat.
6. **Terrain Game** — terrain intro, border reference, arc movement, find & pick obstacles.
7. **Other Activities** — come to a central sound; follow directions for gifts.

## 5. COMPETITOR (the wedge)

**ObjectiveEd "BLV Steps"** — B2B, per-student. Weaknesses we exploit: assessment is
game-telemetry only (no rubric, no real observation); O&M proxied by a fantasy game; teacher
web portal FAILED accessibility; no offline PWA; no GDPR-K/HIPAA. **Our differentiation:**
real cane activities with real children, teacher rubric + step-count observation,
stigma/confidence as a design goal, offline-first, accessible teacher interface.

## 6. THE APP AS BUILT

- **Files in `om-app`:** `index.html` (app — UI + behaviour + cache-backed async storage
  seam + profiles + deletion + native-aware CSV export), `activities.js` (ALL content — the
  only file the content team edits; `sound-which` now has a demo `videoFile`),
  `capacitor.config.json`, `package.json`, `package-lock.json`, docs, 2 PDFs, manager SVG,
  `three_pages_warm_palette.html`, plus generated `android/` + `www/` + `node_modules/`,
  plus throwaway test clips `demo.mp4` / `demo-sound.mp4`.
- **Screens:** Welcome → Hub → **grouped** Activities list → run-activity screen, PLUS
  Manage-data. Run screen: child chip, form FIRST, collapsible SOP (holds audio + video
  slots), Past results last. Header `home-dot` shows the per-category icon.
- **Screen 3 (Activities) — grouped by category:** per-category header (hue icon chip +
  deep-hue name); neutral cards (no spine); cane tag = rust (with) / neutral pill (without);
  saved-count pill if records exist; empty categories hidden.
- **Child profiles:** name, DOB (age derived), height, weight, dominant hand, optional
  low-res photo (~160px JPEG). Every record links by `profileId`.
- **Data fields (per activity):** count / result (Independent-Prompted-Unable) / checkbox /
  notes.
- **Storage:** cache-backed async `Store` seam. Native = Capacitor Preferences (CONFIRMED
  live); web = localStorage; chosen at boot. Keys: `profiles`, `activeProfile`,
  `welcomeSeen`, `studentName` (legacy), `rec_<activityId>`. Writes read-back-verified; CSV
  export includes DOB + derived Age + demographics, native share sheet or web download.
- **Media slots:** each activity has `audioFile` + `videoFile` (both optional, in
  activities.js). Empty → dashed placeholder; filled → real `<audio>`/`<video>` player.
  `videoFile` PROVEN on-device this session.
- **Icons:** `ICON` object holds all monoline SVGs incl. 7 category icons; `CATEGORY_ICONS[]`
  + `catIcon(i)` map them positionally by category index.
- **Tech:** plain HTML/CSS/JS, **no build step** (deliberate), Capacitor wrap for native.

## 7. SETTLED ENGINEERING (do not regress)

- **Storage seam (cache-backed async):** Do NOT re-inline storage; do NOT bolt the future
  video uploader onto `Store` — it'll be a SEPARATE seam mirroring this pattern.
- **Java/JDK on the build Mac:** JAVA_HOME → Android Studio's bundled jbr-21, in `~/.zshrc`.
  Don't install Java separately.
- **No-bundler sync discipline:** native app bundles `www/`, NOT top-level `index.html`.
  Build loop: `cp index.html activities.js [+ any media] www/` → `npx cap sync android` →
  `npx cap run android`. ALWAYS grep/ls the change in `www/` AFTER the cp to confirm it
  landed BEFORE syncing — a stale `www/` looks exactly like "my change didn't work." (Bit
  us with the demo clip until the cp included `demo-sound.mp4` and was verified.)
- **Media files in the build loop:** any bundled audio/video must be ADDED to the `cp` line
  (e.g. `cp index.html activities.js demo-sound.mp4 www/`) — not just the HTML/JS — or the
  player points at a file that isn't bundled.
- **ffmpeg compress recipe for demo clips:**
  `ffmpeg -i in.mp4 -vf "scale=640:-2" -c:v libx264 -crf 28 -c:a aac -b:a 96k -t 60 out.mp4`
  → WebView-friendly H.264/AAC, a few MB. Bump `-crf` to 30 or scale to 480 if still large.
- **Deletion helpers:** `deleteRecord`, `deleteProfile` (sweeps linked records),
  `clearAllData` (keeps welcomeSeen), `recordCountForProfile`. All async, awaited. Once
  video is in the cloud these must ALSO delete the cloud file — not yet built.
- **Activities list = GROUPED:** `showActivityList()` builds per-category sections, hue+icon
  on the header, neutral cards. Don't revert to the flat 7-hue stack; don't re-tint cards or
  tags by category.
- **Category icons positional:** keyed by index via `CATEGORY_ICONS`/`catIcon()`. Monoline,
  24-grid, stroke-2, no fill.
- **Post-save flow / SOP disclosure / result-pill priority / segmented control (no
  checkmark) / reduced-motion / accessibility plumbing / contrast:** all intact.

## 8. HOW TO RUN / BUILD IT

- **Web (still works):** double-click index.html, or `python3 -m http.server 8000` in om-app.
  Edit activities.js, refresh.
- **Native (Capacitor 8, Android) — BUILT:** `cp index.html activities.js [media] www/` →
  grep/ls-verify `www/` → `npx cap sync android` → `npx cap run android`. JAVA_HOME already
  set. Emulator = Pixel 10 Pro XL, API 37 arm64.
- **Save to GitHub:** `git add .` → `git commit -m "..."` → `git push`. Repo:
  `github.com/Adistor777/om-cane-training` (private). Note `www/` is gitignored, so bundled
  media in `www/` is NOT committed — the committed change is the `activities.js` filename.

## 9. NEXT STEPS

- **Within design (path a), remaining + lower priority:** serif `.lede` typographic
  confidence + more generous whitespace/rhythm.
- **Tests (deliberate future add):** first targets = `Store` seam (write/read-back/verify)
  and the CSV builder. NOT UI. None exist yet. Strong unblocked engineering pick.
- **AWAIT the user's pooling answer** + the offline-upload decision (both gate session video).
- **When ready to build features, natural order:** (1) DEMO VIDEO — slot PROVEN; blocked
  only on real owned clips; (2) per-child consent FIELD (records the legal team's consent;
  no-regret, buildable now without the pooling decision); (3) session video capture + upload
  (NEW `Uploader` seam mirroring `Store`, India-region Supabase bucket, structured filenames,
  save link into record, offline handling, delete-everywhere); (4) admin access (Supabase
  dashboard, config only).
- **Then:** app icon/splash, eventually Play Store + iOS.
- **Pooling (when greenlit):** enable Supabase Postgres + sync; delete-everywhere.

## 10. THE "WRAP UP" CONVENTION

At session end the user says **"wrap up"**. The assistant then:
1. REGENERATES MEMORY.md fresh (rewrite, don't append — keep it tight).
2. Updates TRACKER.md.
3. Adds "Last updated" + "What changed this session" at the top of MEMORY.md.
4. Reminds the user to download the updated docs and RE-UPLOAD MEMORY.md (and keep
   DESIGN_NOTES.md) in Project knowledge. A fresh chat does NOT read your files automatically.
