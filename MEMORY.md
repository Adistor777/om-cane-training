# MEMORY.md — Project Context Handoff

**Purpose:** paste this into a new chat (or keep it in Project knowledge) so the
assistant has full context without re-explaining.

**Last updated:** End of a short PLANNING session. No code changed. The session
clarified the next three workstreams — (1) real-phone test, (2) tests + GitHub,
(3) a "looks more sophisticated / like Nike" design question — and set up the
next chat to act on them. Key outcome: the GitHub push and the design direction
were both pinned down enough to execute next time.

**What changed this session (planning only, no code):**

1. **Mapped the real "now what."** Per the tracker, the honest next action is
   still: **run on a real Android phone over USB** (BUILD-ANDROID.md step 10) +
   repeat the cold-restart storage test there. Emulator is done; the phone is the
   environment that matters for the pilot. After that, the gating items are
   DECISIONS not code: pooling shape + offline-upload behaviour (both block
   session video). Nothing else is meaningfully unblocked.

2. **Tests — clarified honestly.** There are currently NO automated tests and no
   harness; "testing" so far = manual on-device verification (cold-restart, export
   share sheet, etc.). If we want real tests, the highest-value first targets are
   the `Store` seam (write → read-back → verify) and the CSV builder — the places
   where silent failure actually hurts children's data. UI tests are NOT the
   priority. This is a deliberate add for a future session, not something that
   exists yet.

3. **GitHub — pinned down, ready to execute next chat.** Push is overdue (single
   copy of a months-long project = real risk). The assistant CANNOT do the push
   (auth/credentials/repo creation are the user's to do). Two things settled:
   - **.gitignore must exclude** `node_modules/`, `android/`, `www/` — all
     generated, regenerate from `npm install` + `npx cap sync`. Repo = SOURCE
     only: `index.html`, `activities.js`, `capacitor.config.json`, `package.json`,
     the `.md` docs.
   - **Private repo** — children's-disability-data context; default private.
   - NEXT-CHAT DELIVERABLE the user wants: click-by-click GitHub setup (create
     repo → `.gitignore` → first commit → push) in the same step + "Check" style
     as BUILD-ANDROID.md.

4. **"Make it look more sophisticated, like the Nike app" — framed, not yet done.**
   Flagged the tension: DESIGN_NOTES.md is built on RESTRAINT ("field notebook,
   not dashboard"); the Nike app is the opposite philosophy (bold condensed type,
   full-bleed imagery, high-contrast spectacle, motion). They're both
   "sophisticated" but in incompatible directions, and Nike's spectacle leans on
   visual moves that do nothing for — or actively hurt — a low-vision / screen-
   reader user. Accessibility is the brand here, not polish. Offered two paths and
   the user needs to pick in the next chat:
   - **(a) RECOMMENDED — sharpen the existing field-notebook direction to its most
     polished form:** real per-category monoline icons (compass, ear, footprints,
     mat — already a TRACKER follow-up; screen 1 currently uses a single letter in
     the `.blob`), bolder typographic confidence on the serif `.lede`, more
     generous whitespace/rhythm. Safe, on-brand, accessibility-preserving,
     subtraction-compatible. The per-category icons are the single highest-leverage
     move.
   - **(b) A bolder Nike-ish redirection as a SEPARATE comparison mockup** —
     legitimate only if the user has decided field-notebook isn't landing; means
     consciously rewriting DESIGN_NOTES.md and re-checking accessibility (contrast,
     type sizes, motion, reduced-motion).
   - **USER STILL OWES THE PICK: (a) or (b).** Assistant recommended (a).

**Files in `om-app` (unchanged this session):**
`index.html`, `activities.js`, `capacitor.config.json` (appId `org.omcane.trainer`),
`package.json` (Cap 8 + 4 plugins), `BUILD-ANDROID.md`, `README.md`, `DESIGN_NOTES.md`,
`MEMORY.md`, `TRACKER.md`, plus generated `android/` + `www/` + `node_modules/`. Only
`www/` gets bundled into the app.

**WHERE THINGS STAND (exact resume point):**
- **Emulator phase COMPLETE** (prior session): app builds, runs, persists data across
  cold restart, CSV export opens the share sheet. Native Capacitor Preferences confirmed
  live (no localStorage fallback; the registration shim is NOT needed).
- Environment: fresh M5 MacBook Air; emulator API 37, arm64-v8a (chosen over the
  recommended 35/36 — compileSdk 36, runs on anything ≥24, works fine, but RULE OUT the
  37-vs-36 gap first if anything misbehaves). Node v26, Homebrew 5.1.14, JAVA_HOME set to
  Android Studio's bundled jbr-21 in `~/.zshrc` (persists; don't redo; don't install Java
  separately).
- **THREE THINGS QUEUED FOR THE NEXT CHAT** (in rough priority):
  1. GitHub setup — click-by-click guide, private repo, the `.gitignore` above. Highest
     value; the project being a single copy is the live risk.
  2. Real-phone test over USB (BUILD-ANDROID.md step 10) + cold-restart test on the phone.
  3. Design: the user picks (a) sharpen field-notebook (recommended; per-category icons
     first) or (b) a Nike-ish comparison mockup.
- Errors NOT hit but still possible on other machines / the phone: `invalid source
  release: 21` (point Gradle JDK at bundled jbr-21 in Android Studio settings) and
  AGP/Gradle version complaints (AGP Upgrade Assistant → 8.13).

**Still NOT done in the wrap (deliberately later):** app icon + splash art
(`@capacitor/assets`, cosmetic), Play Store signed-AAB release, iOS, and session
video (adds camera permissions to the Android manifest — the one thing that will
re-touch the native shell; blocked on pooling + offline-upload decisions anyway).

---

## 1. WHO + WHAT

- **User role:** app developer & designer. NOT responsible for O&M content, activities,
  SOPs, or scoring rubric — a content team hands those over. User builds *how the app
  holds and captures* that content.
- **User skill level:** can design/build, but newer to terminal/servers and backend
  concepts. On a **Mac (fresh M5 MacBook Air, Apple Silicon)**, uses **PyCharm**. No
  Word (no Office subscription) — deliver manager-facing docs as **PDF**. Explain
  plainly, click-by-click, with exact commands + a "Check" per step. Works through
  terminal steps one at a time, asks before moving on. Decides quickly once given clear
  trade-offs + the assistant's stated reasoning.
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
  NOTE: a "make it look like Nike / more sophisticated" question is OPEN — see top of file;
  recommendation is to sharpen restraint (icons/type/space), not pivot to spectacle.

## 3. OPEN QUESTIONS (need answers)

- **DESIGN DIRECTION (NEW, needs the user's pick):** (a) sharpen field-notebook
  [recommended] vs (b) bolder Nike-ish comparison mockup. See top of file.
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
  file the content team edits), `capacitor.config.json`, `package.json`, `BUILD-ANDROID.md`,
  `DESIGN_NOTES.md`, `README.md`, `MEMORY.md`, `TRACKER.md`, plus generated `android/` +
  `www/` + `node_modules/`.
- **Screens:** Welcome (every launch) → Hub → flat Activities list → run-activity screen,
  PLUS Manage-data. Run screen: child chip, form FIRST, collapsible SOP, Past results last.
- **Child profiles:** name, DOB (age derived), height, weight, dominant hand, optional
  low-res photo. Every record links by `profileId`.
- **Data fields (per activity):** count / result (Independent-Prompted-Unable) / checkbox /
  notes.
- **Storage:** cache-backed async `Store` seam. Native = Capacitor Preferences (CONFIRMED
  live on device); web = localStorage; chosen at boot. Keys: `profiles`, `activeProfile`,
  `welcomeSeen`, `studentName` (legacy), `rec_<activityId>`. Writes read-back-verified; CSV
  export includes DOB + derived Age + demographics, native share sheet (CONFIRMED) or web
  download.
- **Tech:** plain HTML/CSS/JS, **no build step** (deliberate), Capacitor wrap for native.
- **Status:** Native Android wrap BUILT, RUNNING, and storage-VERIFIED on the emulator. Web
  version still works by double-clicking index.html or local server.

## 7. SETTLED ENGINEERING (do not regress)

- **Storage seam (cache-backed async):** see "What the Phase-1 code does" history. Do NOT
  re-inline storage; do NOT bolt the future video uploader onto `Store` — it'll be a
  SEPARATE seam mirroring this pattern.
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

## 8. HOW TO RUN / BUILD IT

- **Web (still works):** double-click index.html, or `python3 -m http.server 8000` in om-app,
  or PyCharm + browser icon. Edit activities.js, refresh.
- **Native (Capacitor 8, Android) — BUILT:** the three-line loop to push a change and
  rebuild: `cp index.html activities.js www/` → `npx cap sync android` → `npx cap run
  android`. JAVA_HOME is already set in `~/.zshrc`.
- Mobile look in a browser: device/responsive mode, iPhone preset.

## 9. NEXT STEPS

- **NEXT CHAT — three queued items (rough priority):**
  1. **GitHub** — click-by-click guide (create repo → `.gitignore` excluding
     `node_modules/`, `android/`, `www/` → first commit → push), PRIVATE repo, BUILD-ANDROID
     step+Check style. The push is the user's to do (auth/credentials); assistant supplies the
     exact sequence. Highest value — the project is a single copy = live risk.
  2. **Real-phone test** over USB (BUILD-ANDROID.md step 10) + repeat cold-restart storage
     test on the phone (the environment that matters for the pilot).
  3. **Design pick:** user chooses (a) sharpen field-notebook [recommended — per-category
     monoline icons first, then serif/type confidence + whitespace] or (b) a Nike-ish
     comparison mockup (means rewriting DESIGN_NOTES.md + re-checking accessibility).
- **Tests (deliberate future add):** first targets = `Store` seam (write/read-back/verify)
  and the CSV builder. NOT UI. None exist yet.
- **AWAIT the user's pooling answer** + the offline-upload decision (both gate session video).
- **When ready to build features, natural order:** (1) demo video into `videoFile` slot —
  blocked only on clips; (2) per-child consent field; (3) session video capture + upload (NEW
  `Uploader` seam mirroring `Store`, India-region Supabase bucket, structured filenames, save
  link into record, offline handling, delete-everywhere); (4) admin access (Supabase dashboard,
  config only).
- **Then:** app icon/splash, eventually Play Store + iOS.
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
