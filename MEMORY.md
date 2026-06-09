# MEMORY.md — Project Context Handoff

**Purpose:** paste this into a new chat (or keep it in Project knowledge) so the
assistant has full context without re-explaining.

**Last updated:** End of an EXECUTION session. Two of the three queued items got
DONE; the third (design) is picked and mid-flight. Key outcomes: (1) the project
is now on GitHub — the single-copy risk is gone; (2) native storage re-verified
on the Pixel 10 emulator; (3) design direction decided — **path (a), sharpen the
field-notebook** — and the 7 per-category monoline icons are designed + previewed;
user wants them wired into `index.html` NEXT chat.

**What changed this session:**

1. **GitHub — DONE. The single-copy risk is closed.** The whole repo is now
   pushed to a PRIVATE GitHub repo. Specifics that matter for next time:
   - Repo URL: `https://github.com/Adistor777/om-cane-training.git`
   - `.gitignore` excludes `node_modules/`, `android/`, `www/`, plus `.DS_Store`,
     `.idea/`, `*.iml`, `*.log`. Verified via `git status` that the three generated
     folders were NOT staged before the first commit.
   - First commit = 15 files (source + docs + the 2 PDFs + the manager SVG +
     `three_pages_warm_palette.html` + `package-lock.json`). Author was first
     auto-guessed (Mac hostname), then fixed with
     `git config --global user.name/email` + `git commit --amend --reset-author
     --no-edit` → now `Aditya Shetty <adityaprakash.shetty@gmail.com>`.
   - Pushed over HTTPS; auth via Personal Access Token (cached now, won't
     re-prompt unless machine changes / token expires).
   - **Day-to-day save loop from now on:** `git add .` → `git commit -m "..."` →
     `git push`. Do it at the end of any session that changed something.
   - Deliverable produced: `GITHUB-SETUP.md` (click-by-click, step+Check style),
     downloaded by the user. Keep next to BUILD-ANDROID.md.

2. **Real-device test — DONE on emulator (again), good enough for now.** User
   has a Mac + an iPhone, NO Android phone. The app is an ANDROID Capacitor wrap;
   the iPhone can't run it natively (no iOS target added yet). Rather than add iOS
   (Xcode + Apple Dev acct — deferred, "wrap last"), re-ran the existing Android
   emulator:
   - `npx cap run android` built clean, all 4 plugins found, deployed to
     **Pixel_10_Pro_XL** emulator (note: the device is a Pixel 10 Pro XL now, not
     the Pixel 7 in BUILD-ANDROID.md; still API 37 arm64).
   - **Cold-restart storage test PASSED again:** added a child, fully killed the
     app (swiped from recents), relaunched from the drawer — the child persisted.
     Native Capacitor Preferences confirmed durable; no localStorage fallback; no
     shim needed.
   - The emulator is the same engine a physical Android phone runs, so the only
     thing a real phone would add is hardware-specific quirks — defer to when a
     pilot phone is in hand. Nothing is blocked by deferring it.

3. **Design — PICKED (a) and IN FLIGHT.** User chose **(a) sharpen the
   field-notebook**, not the Nike-ish redirection (good, on-brand, accessibility-
   preserving). Started on the single highest-leverage move: **per-category
   monoline icons** to replace the single-letter `.blob` on screen 1.
   - Designed + previewed all 7, each in its category hue:
     1 Direction → **compass** (the one already in ICON)
     2 Sound → **ear**
     3 Sound + Direction → **ear + radiating waves** (busiest; simplify to ear +
       one wave if it reads muddy at 34px on-device)
     4 Straight Line Travel → **footprints**
     5 Push Toy → **cart on wheels** (least literal; hand-pushing-block is the
       fallback)
     6 Terrain Game → **layered waves / terrain lines** (cleanest)
     7 Other Activities → **concentric target** (cleanest)
   - All strictly monoline, `viewBox 0 0 24 24`, `stroke="currentColor"`,
     `stroke-width="2"`, no fill — drop straight into the `ICON` object, inherit
     white from `.blob`. NO layout/contrast/guardrail change. This is addition of
     MEANING, not decoration, so it's compatible with the "subtract, don't add"
     rule.
   - **Icons are POSITIONAL** — keyed by category index, same as `CATEGORY_PALETTE`.
     If the content team reorders categories in `activities.js`, the icon follows
     the slot, not the name. Consistent with how the palette already behaves.
   - **NEXT-CHAT ACTION the user asked for:** wire all 7 into `index.html` (swap
     the letter in `.blob` for the per-category icon). User wants to do this in a
     fresh chat. They have NOT yet seen the icons rendered at the true 34px in the
     real app — verify on-device after wiring; the two flagged icons (Sound+Dir,
     Push Toy) are the ones to check.
   - After icons: the rest of path (a) is serif `.lede` typographic confidence +
     more generous whitespace/rhythm. Lower priority than the icons.

**Files in `om-app`:**
`index.html`, `activities.js`, `capacitor.config.json` (appId `org.omcane.trainer`),
`package.json` (Cap 8 + 4 plugins), `package-lock.json`, `BUILD-ANDROID.md`,
`README.md`, `DESIGN_NOTES.md`, `MEMORY.md`, `TRACKER.md`, `GITHUB-SETUP.md` (NEW),
two PDFs (`Compliance-Risks-and-How-We-Tackle-Them.pdf`,
`OM-Cane-Training-Native-Build-Log.pdf`), `session_video_flow_for_manager_v2.svg`,
`three_pages_warm_palette.html`, plus generated `android/` + `www/` + `node_modules/`.
Only `www/` gets bundled into the app. Generated folders are gitignored.

**WHERE THINGS STAND (exact resume point):**
- **GitHub: LIVE + private.** Single-copy risk closed. Save loop = add/commit/push.
- **Emulator phase COMPLETE**, storage re-verified on Pixel 10 Pro XL emulator
  (API 37 arm64). CSV export → share sheet confirmed in prior sessions.
- Environment: M5 MacBook Air; emulator API 37 arm64-v8a (chosen over recommended
  35/36 — works; RULE OUT the 37-vs-36 gap first if anything misbehaves). Node v26,
  Homebrew, JAVA_HOME → Android Studio's bundled jbr-21 in `~/.zshrc` (persists;
  don't redo; don't install Java separately).
- **DESIGN: path (a) chosen.** 7 monoline category icons designed; NEXT step is
  wiring them into `index.html`'s `.blob`. Then serif/type/whitespace polish.
- **The true blockers for the next FEATURE (session video) are still DECISIONS,
  not code:** pooling shape + offline-upload behaviour. Both still owed by the user.

**Still NOT done in the wrap (deliberately later):** app icon + splash art
(`@capacitor/assets`, cosmetic), Play Store signed-AAB release, iOS
(`npx cap add ios` — needs Xcode + Apple Developer acct; deferred, the iPhone is
why this came up but it's not worth a session yet), and session video (adds camera
permissions to the Android manifest — the one thing that re-touches the native
shell; blocked on pooling + offline-upload decisions anyway).

---

## 1. WHO + WHAT

- **User role:** app developer & designer. NOT responsible for O&M content, activities,
  SOPs, or scoring rubric — a content team hands those over. User builds *how the app
  holds and captures* that content.
- **User skill level:** can design/build, but newer to terminal/servers and backend
  concepts. On a **Mac (M5 MacBook Air, Apple Silicon)**, uses **PyCharm**. Has an
  **iPhone**, NO Android phone. No Word (no Office subscription) — deliver manager-facing
  docs as **PDF**. Explain plainly, click-by-click, with exact commands + a "Check" per
  step. Works through terminal steps one at a time, asks before moving on. Decides quickly
  once given clear trade-offs + the assistant's stated reasoning.
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
  flag stay on-device. Only session VIDEO goes to the cloud (too big for local).
- **Consent: HANDLED by compliance team.** They obtain parental/guardian consent. Photo +
  video access restricted to admin. From the compliance research: the population is hit
  by BOTH Rule 10 (child) AND Rule 11 (person with disability w/ lawful guardian); burden
  of PROVING valid consent falls on the app as data fiduciary → the per-child consent
  FIELD still matters even though building it is parked.
- **Session video → Supabase cloud storage.** File in cloud; local record holds a link.
  Admin downloads via Supabase's own dashboard = **Option A** (config, not code).
  **Option B** (in-app admin view) deferred. Recommend an **India-region** Supabase
  project (DPDP permissive negative-list model → India region is a free risk-kill).
- **Demo video = content.** Existing `videoFile` slot; bundle clips. No architecture
  change. CURRENTLY BLOCKED only by the user not having clips yet.
- **No standalone MySQL/Postgres server.** Supabase (which IS Postgres) covers it when a
  DB is actually needed (Option B / pooling). Don't add a DB ahead of need.
- **Pooling is coming but NOT now.** Ship local + video-to-Supabase first; enable the DB
  side + record sync when pooling is greenlit and consent is in place.
- **Four screens:** Welcome (every launch) → Hub → flat Activities list → run screen,
  PLUS Manage-data (off the Hub).
- **Demographics = exactly 6 fields (locked):** name, DOB, height, weight, dominant hand,
  optional low-res photo. Age derived from DOB, never stored.
- **Activities are editable DATA, not hardcoded** (activities.js). The no-coder
  edit-refresh workflow is SACRED — it's why the no-bundler path was chosen.
- **SOPs** = text + audio + optional demo video, in Indian languages. Audio via Sarvam
  TTS (Bulbul v3), pre-generated, played offline.
- **Design system locked & documented** (DESIGN_NOTES.md — "field notebook": warm paper,
  restrained, editorial). 7-hue CATEGORY_PALETTE; do NOT set per-category colours in
  activities.js. Guardrails: one accent, one shadow tier, serif only on `.lede`,
  differentiated radii (20/14/11), all hues WCAG AA, `--ink-faint #736b5e` (don't lighten).
  **DESIGN DIRECTION RESOLVED:** the "Nike / more sophisticated" question → picked
  **(a) sharpen restraint** (icons → type → whitespace), NOT spectacle. Per-category
  monoline icons are the first move, designed and pending wire-in.

## 3. OPEN QUESTIONS (need answers)

- **POOLING SHAPE (BIGGEST):** central corpus (org analyses program-wide) vs per-teacher
  backup. Sets the consent/compliance bar + whether to turn on the Supabase DB. User said
  they'd return with a detailed answer; STILL OWED.
- **Offline classrooms:** upload-immediately vs queue-and-upload-later. Decide BEFORE
  writing session-video upload code. Biggest fork in the upload logic.
- **Filename scheme for uploaded video:** proposed child + activity + date + time. Confirm,
  or add teacher/school.
- **Consent recorded IN-APP:** add a per-child consent flag (obtained/by/date) to the
  profile BEFORE video flows. The "no-regret" field.
- **Delete-everywhere:** once video is in the cloud, deleting a local record must also
  delete the cloud file (DPDP right-to-erasure). Not yet built.
- Final scoring rubric + formal SOP text (content team owns).
- Final activity list; final target-language list (vs Sarvam's 11).
- Is the teacher-user sighted, or a blind/low-vision TVI? If blind, interface must be
  screen-reader fluent (built toward this).
- Two O&M-lead design decisions: (1) should "Unable" look distinct from "Independent"?
  (currently outcome-neutral). (2) "with cane" tag — fixed rust or category colour?

## 4. THE ACTIVITIES (from the Figma workshop board)

7 categories, 13 activities. Each generally runs **without cane → with cane**; several use
**counting steps** as the measure.
1. **Direction** — Left-Right (rhyme), Front-Back.
2. **Sound** — Identification, Localization. Stand 3 steps away; angle recording at child +
   facilitators.
3. **Sound + Direction** — near/far, simple→narrative, same concept with cane, comparative
   step count.
4. **Straight Line Travel** — toward a sound, without cane → with cane (push toy).
5. **Push Toy** — race on a path with push toy on a mat.
6. **Terrain Game** — terrain intro, border reference, arc movement, find & pick obstacles.
7. **Other Activities** — come to a central sound; follow directions for gifts.

(Workshop ANALYSIS = concepts + field notes, not final SOPs. Structure solid; formal SOPs
pending from content team.)

## 5. COMPETITOR (the wedge)

**ObjectiveEd "BLV Steps"** — B2B, per-student. Weaknesses we exploit: assessment is
game-telemetry only (no rubric, no real observation); O&M proxied by a fantasy game; teacher
web portal FAILED accessibility; no offline PWA; no GDPR-K/HIPAA. **Our differentiation:**
real cane activities with real children, teacher rubric + step-count observation,
stigma/confidence as a design goal, offline-first, accessible teacher interface.

## 6. THE APP AS BUILT

- **Files in `om-app`:** `index.html` (app — UI + behaviour + cache-backed async storage seam
  + profiles + deletion + native-aware CSV export), `activities.js` (ALL content — the only
  file the content team edits), `capacitor.config.json`, `package.json`, `package-lock.json`,
  `BUILD-ANDROID.md`, `GITHUB-SETUP.md`, `DESIGN_NOTES.md`, `README.md`, `MEMORY.md`,
  `TRACKER.md`, 2 PDFs, manager SVG, `three_pages_warm_palette.html`, plus generated
  `android/` + `www/` + `node_modules/`.
- **Screens:** Welcome (every launch) → Hub → flat Activities list → run-activity screen,
  PLUS Manage-data. Run screen: child chip, form FIRST, collapsible SOP, Past results last.
- **Child profiles:** name, DOB (age derived), height, weight, dominant hand, optional
  low-res photo. Every record links by `profileId`.
- **Data fields (per activity):** count / result (Independent-Prompted-Unable) / checkbox /
  notes.
- **Storage:** cache-backed async `Store` seam. Native = Capacitor Preferences (CONFIRMED
  live on device, re-verified on Pixel 10 emulator); web = localStorage; chosen at boot.
  Keys: `profiles`, `activeProfile`, `welcomeSeen`, `studentName` (legacy),
  `rec_<activityId>`. Writes read-back-verified; CSV export includes DOB + derived Age +
  demographics, native share sheet (CONFIRMED) or web download.
- **Tech:** plain HTML/CSS/JS, **no build step** (deliberate), Capacitor wrap for native.
- **Status:** Native Android wrap BUILT, RUNNING, storage-VERIFIED on the emulator. Web
  version still works by double-clicking index.html or local server.

## 7. SETTLED ENGINEERING (do not regress)

- **Storage seam (cache-backed async):** Do NOT re-inline storage; do NOT bolt the future
  video uploader onto `Store` — it'll be a SEPARATE seam mirroring this pattern.
- **Java/JDK on the build Mac:** JAVA_HOME → Android Studio's bundled jbr-21, set in
  `~/.zshrc`. Don't install Java separately.
- **Deletion helpers:** `deleteRecord`, `deleteProfile` (sweeps linked records), `clearAllData`
  (keeps welcomeSeen), `recordCountForProfile`. All async, awaited, confirmed-write. Once
  video is in the cloud these must ALSO delete the cloud file — not yet built.
- **Manage-data nav:** own screen off the Hub; export-first nudge on destructive paths;
  double-confirm clear-all.
- **Slide-down disclosure:** `details.disclosure` reuses the SOP grid-rows animation.
- **Welcome boot:** lands on Welcome every launch (`showWelcome('fwd')` inside the async boot).
- **Profiles + DOB:** `ageFromDOB()` derives age; never persisted. `profileId` links
  session→child. CSV joins demographics.
- **Photo:** `downscaleImage()` → ~160px JPEG; optional/removable.
- **CSV export:** DOB, Age, Height, Weight, Dominant hand prepended; RFC-4180; UTF-8 BOM.
  Native = Filesystem + Share (CONFIRMED opens share sheet); web = anchor download. Only
  backup of local data. NOTE: shows "No saved results to export yet" until a session RECORD
  exists — a saved child is not a saved result.
- **Post-save flow / SOP disclosure / result-pill priority / segmented control (no
  checkmark) / reduced-motion / accessibility plumbing / contrast:** all as before, intact.
- **`.blob` currently shows a single LETTER** — about to be replaced by per-category
  monoline icons (path (a) design work). Icons are positional (by category index).

## 8. HOW TO RUN / BUILD IT

- **Web (still works):** double-click index.html, or `python3 -m http.server 8000` in om-app,
  or PyCharm + browser icon. Edit activities.js, refresh.
- **Native (Capacitor 8, Android) — BUILT:** the three-line loop to push a change and
  rebuild: `cp index.html activities.js www/` → `npx cap sync android` → `npx cap run
  android`. JAVA_HOME is already set in `~/.zshrc`. Emulator = Pixel 10 Pro XL, API 37 arm64.
- **Save to GitHub:** `git add .` → `git commit -m "..."` → `git push`. Repo:
  `github.com/Adistor777/om-cane-training` (private).
- Mobile look in a browser: device/responsive mode, iPhone preset.

## 9. NEXT STEPS

- **NEXT CHAT — primary action:** wire the 7 per-category monoline icons into
  `index.html`'s `.blob` (swap the single letter). Icons keyed by category index. Then
  verify on-device at true 34px (check Sound+Direction and Push Toy especially). After
  that, the rest of path (a): serif `.lede` type confidence + whitespace.
- **Then (lower priority within design):** serif/type/whitespace polish.
- **Tests (deliberate future add):** first targets = `Store` seam (write/read-back/verify)
  and the CSV builder. NOT UI. None exist yet.
- **AWAIT the user's pooling answer** + the offline-upload decision (both gate session video).
- **When ready to build features, natural order:** (1) demo video into `videoFile` slot —
  blocked only on clips; (2) per-child consent field; (3) session video capture + upload (NEW
  `Uploader` seam mirroring `Store`, India-region Supabase bucket, structured filenames, save
  link into record, offline handling, delete-everywhere); (4) admin access (Supabase dashboard,
  config only).
- **Then:** app icon/splash, eventually Play Store + iOS (iOS needs Xcode + Apple Dev acct;
  the user has an iPhone, so iOS testing is possible later but not worth a session yet).
- **Pooling (when greenlit):** enable Supabase Postgres + sync; delete-everywhere; maybe
  Option B admin dashboard.
- v1 content still needs: real SOP text, Sarvam audio per language, per-student progress.
- **Still owed by the user:** the practice edit of activities.js (add one activity) — offered
  across sessions, still not done.

## 10. THE "WRAP UP" CONVENTION

At session end the user says **"wrap up"**. The assistant then:
1. REGENERATES MEMORY.md fresh (rewrite, don't append — keep it tight).
2. Updates TRACKER.md.
3. Adds "Last updated" + "What changed this session" at the top of MEMORY.md.
4. Reminds the user to download the updated docs and RE-UPLOAD MEMORY.md (and keep
   DESIGN_NOTES.md) in Project knowledge. A fresh chat does NOT read your files automatically.
