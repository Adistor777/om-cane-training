# MEMORY.md — Project Context Handoff

**Purpose:** paste this into a new chat (or keep it in Project knowledge) so the
assistant has full context without re-explaining.

**Last updated:** End of a DESIGN/EXECUTION session. The screen-3 redesign is
DONE and verified on-device: the activities list is now **grouped by category**
(was a flat 7-hue stack), each category header carries its **per-category
monoline icon** in the category hue, and the **cane tags were fixed** to stop
re-introducing the colour jumble. All changes are wired into `index.html`,
verified on the Pixel 10 emulator, and pushed to GitHub.

**What changed this session:**

1. **GROUPED ACTIVITIES LIST (screen 3) — DONE + on-device verified.** The flat
   list (every activity in one stack, each card wearing its category hue as a
   left spine) looked scattered — "like an AI-generated website" — because seven
   unrelated hues alternated down the page and the colour never did real
   wayfinding. Root cause was correctly diagnosed: NOT a bad palette, but the
   flat list interleaving all categories so colour stippled instead of grouped.
   - `showActivityList()` rewritten: activities now cluster under a `<section
     class="cat-group">` per category. Each group has a **header** (`.cat-head`)
     = an icon chip (`.cat-ic`, filled with the category hue) + the category name
     (`.cat-name`, in the category's deep hue). Cards below are NEUTRAL — the
     colour spine (`::before`) is removed on `.card.activity.grouped`.
   - Empty categories are HIDDEN (guard: skip if `!cat.activities.length`).
   - New CSS: `.cat-group`, `.cat-head`, `.cat-ic`, `.cat-name`, `.cat-cards`
     (a `repeat(auto-fill,minmax(240px,1fr))` grid), `.card.activity.grouped`.
   - Stagger animation + reduced-motion extended to animate `.cat-group`
     sections (the old `:nth-child` stagger keyed on `.card` directly under
     `#screen`, which no longer matches now that cards are nested).
   - The old flat-card path (`.card.activity.flat`, `.flat-cat`) is LEFT in the
     CSS but no longer used — harmless, not worth deleting.

2. **PER-CATEGORY MONOLINE ICONS — DONE, wired, on-device verified.** All 7
   designed one-at-a-time with user sign-off at true 34px, then wired in:
     0 Direction → **compass** (the existing ICON.compass)
     1 Sound → **ear** (ICON.catEar)
     2 Sound + Direction → **source dot + bilateral radiating waves** (ICON.catSoundDir)
     3 Straight Line Travel → **two staggered footprints** (ICON.catFootprints)
     4 Push Toy → **angled handle w/ grip + wheeled axle bar** (ICON.catPushToy; the
       "D3" constructed version — grid-snapped, NOT freestyled; the grip gives the
       stick a deliberate terminus)
     5 Terrain Game → **3 stacked wavy terrain layers** (ICON.catTerrain)
     6 Other Activities → **3×3 dot grid** (ICON.catDots)
   - All monoline, `viewBox 0 0 24 24`, `stroke="currentColor"`, `stroke-width
     2`, no fill, rounded caps/joins — a coherent family, inherit white from the
     chip.
   - **POSITIONAL**, keyed by category index via `const CATEGORY_ICONS = [...]`
     + helper `catIcon(i)` (falls back to ICON.catDots past the end). Same
     behaviour as `CATEGORY_PALETTE` — if the content team reorders categories
     in `activities.js`, the icon follows the SLOT, not the name.
   - Icons appear in TWO places: the grouped-list category headers, AND the
     run-screen header `home-dot` (was a single category LETTER; now
     `homeDot.innerHTML = catIcon(catIndex)`).
   - On-device check done; the two flagged "finest linework" icons (Push Toy,
     Sound+Direction) hold up at true 34px.

3. **CANE TAG HIERARCHY FIX — DONE.** First pass at the grouped list made the
   "Without cane" tag pick up each category's soft/deep hue — which just MOVED
   the rainbow jumble from the card spine to the tags. User flagged it. Fixed by
   giving colour ONE job: category identity lives on the header; the per-card tag
   carries only cane status, a binary:
   - **With cane** = fixed rust (`.tag.cane`, #f3e2d6 bg / #8a3c12 text) — the
     locked semantic marker from DESIGN_NOTES, the ONLY coloured tag (eye goes
     straight to it).
   - **Without cane** = NEUTRAL pill (`.tag.neutral`: transparent bg, 1px
     `--line` border, `--ink-soft` #6b6458 text). Quiet, WCAG-safe at micro size
     on warm paper. (Used `--ink-soft`, not `--ink-faint`, because a tag is a
     real label that should read clearly, not a faint hint.)
   - Net: three signals each doing one job — header hue = which group, rust =
     cane involved, neutral = it isn't. No more stippling.

4. **The no-bundler sync gotcha bit once (resolved).** After updating top-level
   `index.html`, the EMULATOR still showed the old screen because `www/` had the
   stale copy — the web app reads `index.html` directly, the native app bundles
   `www/`. Fix was just re-running `cp index.html activities.js www/`. **LESSON
   baked into the loop:** after the `cp`, run `grep -n "..." www/index.html` to
   confirm the change actually landed in `www/` BEFORE `npx cap sync`. Skipping
   that verify is what caused the confusion.

5. **GitHub — pushed.** The session's changes committed + pushed to the existing
   private repo. Save loop unchanged: `git add .` → `git commit -m "..."` →
   `git push`.

**Files in `om-app`:**
`index.html`, `activities.js`, `capacitor.config.json` (appId `org.omcane.trainer`),
`package.json` (Cap 8 + 4 plugins), `package-lock.json`, `BUILD-ANDROID.md`,
`README.md`, `DESIGN_NOTES.md`, `MEMORY.md`, `TRACKER.md`, `GITHUB-SETUP.md`,
two PDFs (`Compliance-Risks-and-How-We-Tackle-Them.pdf`,
`OM-Cane-Training-Native-Build-Log.pdf`), `session_video_flow_for_manager_v2.svg`,
`three_pages_warm_palette.html`, plus generated `android/` + `www/` + `node_modules/`.
Only `www/` gets bundled into the app. Generated folders are gitignored.

**WHERE THINGS STAND (exact resume point):**
- **GitHub: LIVE + private**, this session's work pushed. Save loop = add/commit/push.
- **Screen-3 redesign COMPLETE + on-device verified** (grouped list, 7 icons,
  cane-tag hierarchy fixed). Pixel 10 Pro XL emulator, API 37 arm64.
- Environment unchanged: M5 MacBook Air; emulator API 37 arm64-v8a (chosen over
  recommended 35/36 — works; rule out the 37-vs-36 gap first if anything
  misbehaves). Node v26, Homebrew, JAVA_HOME → Android Studio's bundled jbr-21 in
  `~/.zshrc` (persists; don't redo; don't install Java separately).
- **DESIGN path (a) "sharpen field-notebook" is now substantially DONE** for the
  icon move. Remaining within path (a): serif `.lede` typographic confidence +
  more generous whitespace/rhythm. Lower priority.
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
  once given clear trade-offs + the assistant's stated reasoning. Has a sharp design eye —
  caught the cane-tag rainbow regression immediately; cares about hierarchy + contrast.
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
- **Four screens:** Welcome (every launch) → Hub → **grouped** Activities list → run
  screen, PLUS Manage-data (off the Hub).
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
  **NEW THIS SESSION — colour does ONE job per surface.** On the grouped list: category
  hue lives ONLY on the group header; activity cards are neutral; the cane tag is a binary
  (rust = with cane, neutral pill = without). Re-tinting per-card tags by category =
  rainbow regression; don't.

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
  (currently outcome-neutral). (2) "with cane" tag — fixed rust (current) or category
  colour? (NOTE: the grouped-list work reinforces fixed rust — it's now the only coloured
  tag and reads as the meaningful state. Revisiting this should weigh that.)

## 4. THE ACTIVITIES (from the Figma workshop board)

7 categories, 13 activities. Each generally runs **without cane → with cane**; several use
**counting steps** as the measure. Category order matters — palette AND icons are keyed by
index, so reordering in activities.js moves both.
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
- **Screens:** Welcome (every launch) → Hub → **grouped** Activities list → run-activity
  screen, PLUS Manage-data. Run screen: child chip, form FIRST, collapsible SOP, Past
  results last. Run-screen header `home-dot` now shows the per-category icon.
- **Screen 3 (Activities) — NEW SHAPE:** grouped by category. Per-category header (hue icon
  chip + deep-hue name); neutral cards beneath (no spine); cane tag = rust (with) / neutral
  pill (without); saved-count pill if records exist; empty categories hidden.
- **Child profiles:** name, DOB (age derived), height, weight, dominant hand, optional
  low-res photo. Every record links by `profileId`.
- **Data fields (per activity):** count / result (Independent-Prompted-Unable) / checkbox /
  notes.
- **Storage:** cache-backed async `Store` seam. Native = Capacitor Preferences (CONFIRMED
  live on device); web = localStorage; chosen at boot. Keys: `profiles`, `activeProfile`,
  `welcomeSeen`, `studentName` (legacy), `rec_<activityId>`. Writes read-back-verified; CSV
  export includes DOB + derived Age + demographics, native share sheet (CONFIRMED) or web
  download.
- **Icons:** `ICON` object holds all monoline SVGs incl. the 7 category icons
  (`catEar`/`catSoundDir`/`catFootprints`/`catPushToy`/`catTerrain`/`catDots` + reused
  `compass`). `CATEGORY_ICONS[]` + `catIcon(i)` map them positionally by category index.
- **Tech:** plain HTML/CSS/JS, **no build step** (deliberate), Capacitor wrap for native.
- **Status:** Native Android wrap BUILT, RUNNING, storage-verified; screen-3 redesign
  verified on the emulator this session. Web version still works by double-clicking
  index.html or local server.

## 7. SETTLED ENGINEERING (do not regress)

- **Storage seam (cache-backed async):** Do NOT re-inline storage; do NOT bolt the future
  video uploader onto `Store` — it'll be a SEPARATE seam mirroring this pattern.
- **Java/JDK on the build Mac:** JAVA_HOME → Android Studio's bundled jbr-21, set in
  `~/.zshrc`. Don't install Java separately.
- **No-bundler sync discipline:** native app bundles `www/`, NOT top-level `index.html`.
  Build loop is `cp index.html activities.js www/` → `npx cap sync android` → `npx cap run
  android`. ALWAYS `grep` the change in `www/index.html` after the `cp` to confirm it
  landed before syncing — a stale `www/` looks exactly like "my change didn't work."
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
- **Activities list = GROUPED (NEW):** `showActivityList()` builds per-category sections,
  hue+icon on the header, neutral cards. Stagger animates `.cat-group`. Empty categories
  hidden. Don't revert to the flat 7-hue stack; don't re-tint cards or tags by category.
- **Category icons positional:** keyed by index via `CATEGORY_ICONS`/`catIcon()`. Monoline,
  24-grid, stroke-2, no fill. If adding an 8th category, add an 8th icon (and note palette
  wraps at index 7 back to green — a known collision, fine at 7 categories).
- **Post-save flow / SOP disclosure / result-pill priority / segmented control (no
  checkmark) / reduced-motion / accessibility plumbing / contrast:** all as before, intact.

## 8. HOW TO RUN / BUILD IT

- **Web (still works):** double-click index.html, or `python3 -m http.server 8000` in om-app,
  or PyCharm + browser icon. Edit activities.js, refresh.
- **Native (Capacitor 8, Android) — BUILT:** the three-line loop to push a change and
  rebuild: `cp index.html activities.js www/` → `npx cap sync android` → `npx cap run
  android`. ALWAYS grep `www/index.html` after the cp to confirm the change landed.
  JAVA_HOME is already set in `~/.zshrc`. Emulator = Pixel 10 Pro XL, API 37 arm64.
- **Save to GitHub:** `git add .` → `git commit -m "..."` → `git push`. Repo:
  `github.com/Adistor777/om-cane-training` (private).
- Mobile look in a browser: device/responsive mode, iPhone preset.

## 9. NEXT STEPS

- **Within design (path a), remaining + lower priority:** serif `.lede` typographic
  confidence + more generous whitespace/rhythm. The big screen-3 moves (grouping + icons)
  are DONE.
- **Optional polish flagged but deliberately skipped:** grouped-list card HOVER border
  currently falls back to the first category's hue (because `resetTheme()` runs and grouped
  cards don't set `--c`). Subtle, desktop-hover-only, irrelevant on touch. Could give each
  card its group hue on hover — but that edges toward re-adding per-card colour, so left
  neutral on purpose.
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
