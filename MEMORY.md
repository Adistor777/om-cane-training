# MEMORY.md — O&M Cane Training
_Last updated: 2026-07-28 (accessibility pass — blind-teacher operable)_
## Session 2026-07-28 — full accessibility pass, `feat/a11y-blind-teacher`
**Scope decision (Aditya, this session):** the app's users are still sighted
teachers — but the TEAM requires it to be fully operable by a blind person.
So: TalkBack-native (semantic HTML + ARIA + focus management, using the user's
OWN screen reader), NOT self-voicing via Sarvam. Children still never operate
the app → the Play Store 18+ target-audience declaration is UNCHANGED, and
Designed-for-Families still should not trigger.
- **Audit first (axe-core 4.12 over all 21 screens in jsdom).** Baseline was
  genuinely good — ZERO div-onclick (all 63 handlers on real `<button>`),
  `paint()` already focused `.lede`, help sheet already had a focus trap +
  Escape + focus restore, fieldset/legend, role=tablist/tab/tabpanel/slider,
  7 reduced-motion blocks. Total axe damage: ONE minor violation. The real
  defects were the ones axe cannot see.
- **P0 fixes**
  1. **Language buttons were unreadable.** `हिन्दी / தமிழ் / বাংলা` rendered with
     NO `lang` attribute inside `<html lang="en">` → an English TalkBack voice
     reads noise or nothing, so a blind teacher can't find the narration
     switcher at all. AUDIO_LANGS now carries `lang` (BCP-47) + `name` (Latin);
     `langBtnAttrs()` is shared by the ? sheet and Settings so they can't drift.
     aria-label uses the Latin name → works even with no Devanagari voice pack,
     which is the normal state of a school tablet. Disabled langs say WHY.
     (Note: on-screen SOP text is English-only; sopTranslations feed the audio
     generator, so the Devanagari never reaches the DOM except these buttons.)
  2. **`showChildDetail` had no `.lede`** → paint()'s focus move found nothing,
     focus fell to `<body>`, screen announced nothing. Fixed with a
     `visually-hidden` h1 (look unchanged) + `moveScreenFocus()`, which now
     falls back h1 → first heading → `#screen` labelled from the crumb.
  3. **Modals didn't hide the background.** `aria-modal` is a hint Android
     WebView ignores — swiping past the last control walked out into the page
     behind the scrim. Added `setBackgroundInert()` (depth-COUNTED, because the
     confirm dialog can open on top of the help sheet) on drawer + help sheet +
     confirm. Confirm also now restores focus to its opener.
- **P1 fixes**: all 32 ICON glyphs get `aria-hidden`+`focusable=false` via a
  ONE-PASS loop over the map (not 32 hand-edits — future icons are hardened
  automatically; STILL_W already had it). `#sbLive`/`#cmdLive` assertive →
  **polite** (assertive interrupted TalkBack *while the drill sound played* —
  that sound IS the activity). Seek slider gained `aria-valuetext` ("0:02 of
  0:04" not "37 percent") and **ArrowUp/Down handling — TalkBack's slider
  gesture sends up/down, so the slider was unusable by touch gesture**, the
  only way a blind teacher reaches it. Crumb is now `aria-hidden` (the focused
  heading already says the same words — it was stuttering every screen name).
- **LOW VISION (the other half).** Type + spacing tokens px → **rem**
  (`--s1..--s5`, `--t-display..--t-micro`; 1x renders identically), and
  `html{font-size:calc(100% * var(--text-scale,1))}`. New **Settings →
  Display**: text size (Standard/Large/Larger/Largest), **High contrast**
  (~19:1, black-on-white, borders replace shadows, category hues survive as
  darkened versions), **Dark background** (photophobia — common with albinism/
  aniridia/achromatopsia). Persisted through the Store, applied in `boot()`
  BEFORE first paint. All in ONE appended block at the END of styles.css —
  revert = delete from the banner to EOF (same escape hatch as section colours).
  `android:forceDarkAllowed=false` in styles.xml (BOTH themes — NoActionBar has
  an explicit parent so it does NOT inherit AppTheme): force-dark would
  algorithmically invert the warm-paper palette into sludge. **android/ is
  gitignored — re-apply if regenerated, like allowBackup=false.**
- **TOTAL BLINDNESS pass (third round, after Aditya pushed on it).** The first
  two rounds were mechanical a11y — every control labelled, focus managed. That
  passes an audit and still leaves a blind teacher lost, because EVERY
  collection in this app is a `<div>` of `<button>`s: categories, activities,
  the child picker, the sound pads, saved records. A sighted teacher reads the
  SHAPE of a grid; a blind one gets nothing. "How many students are in this
  picker?" meant swiping to the end and counting, every single time.
  - Fix: containers get `role="group"` + `aria-label="12 students"`; items get
    their position in the accessible NAME ("Vaishu, student 3 of 12") via
    `posLabel()`/`groupAttrs()`. **Chose this over role=list/listitem
    deliberately** — `role="listitem"` on a `<button>` destroys the button
    role, a wrapper div breaks the CSS grid (the wrapper becomes the grid
    item), and `display:contents` is still unreliable in an Android WebView's
    a11y tree. Accessible-name approach = zero DOM change, zero CSS change.
  - Composed labels where the screen was speaking fragments: the count pill
    ("2") now reads "2 activities"; cane/group tags ride with the title; a
    saved record is ONE sentence ("Vaishu. 2 July. Steps: 8, Result: Got it.")
    with `.vals` aria-hidden so nothing is said twice. Delete buttons name
    their own row — a column of identical "Delete this result" is unusable.
  - **Child photos keep `alt=""` on purpose** and there is an assertion so
    nobody "fixes" it: a described face is useless AND a privacy leak in spoken
    output. The name below the photo is the real label.
  - Silent demo clips now SAY they are silent and point at the written steps,
    instead of being the first thing a blind teacher swipes into.
  - **Documented, not solved: filming video evidence has no non-visual
    equivalent.** A blind teacher can't frame it, can't verify it, and filming
    a child you can't see is a consent question too. Options + a recommendation
    are in TRACKER; deliberately NOT decided unilaterally.
  - Verdict worth remembering: the CORE WORKFLOW was never visual (sign in →
    pick child → hear SOP → play sounds → score → save → read back), so this
    app is far more amenable to blind use than most. 29/29 assertions.
- **DEFAULT LOOK IS UNCHANGED — and proven.** First draft of the a11y CSS block
  applied its large-text repairs at EVERY scale and silently changed three
  things at 1x: `.action-row/.rowbtn/.drawer-item` alignment (center →
  flex-start), `.linklike` forced to a 44px inline-flex block (it sits
  mid-sentence), and a blanket `button{min-height:44px}` that raised `.sb-tab`
  off its deliberate 40px. NONE were needed — every control already clears the
  WCAG 2.2 AA 24×24 target minimum (smallest is that 40px tab). Now gated
  behind `data-text-scale="up"`, set only above 1x. `scripts/a11y-nochange.js`
  enforces it: rem tokens must still compute to their old px, and no rule in
  the block may escape a mode gate / focus state / media query. **Aditya asked
  "have you changed the entire UI?" — that question is why this guard exists.**
- **PRE-HANDOVER BUG HUNT (fourth pass — Aditya: "I'm giving this to a blind
  person, I don't want fuckups"). Six real defects, ALL of which had passed the
  static audit**, because all six are about CHANGE rather than resting state:
  1. **My own third-pass fix had made record values UNREADABLE.** The composed
     summary went into an `aria-label` on a roleless `<span>`. ARIA 1.2
     PROHIBITS aria-label on `role=generic` — it is dropped — and the visible
     chips were already aria-hidden. On a device: name + date read, **scores
     silently gone**. axe's `aria-prohibited-attr` did NOT catch it because
     that rule only fires when the element has no text content at all.
     **STANDING RULE: if a screen reader must hear it, it goes in the DOM as
     real text (`.visually-hidden`), never as aria-label on a div/span.**
  2. **Login stranded you on screen one** — `onSchoolPick` injects the ID and
     password fields with zero announcement. Focus now moves into `#lg_id`.
  3. **"Saved" was never spoken.** Every toast is followed by a repaint; the
     repaint's focus move pre-empts the pending polite announcement on Android.
     Fixed CENTRALLY in `toast()`: visible half sync, spoken half on a later
     frame via a separate `#srStatus` region, cleared first so two identical
     messages both announce. Not patched at the 5 call sites — a 6th would
     have regressed it.
  4. **The batch flow swapped children SILENTLY** (only a `hidden` toggle, no
     nav event). A blind teacher would keep scoring into the NEXT child's form
     — data that looks valid and is not, which in a research pilot is worse
     than no data. `.bcard-head` is now an `<h2>` and `batchShow()` focuses it;
     same on `batchReview()`.
  5. **Two layout regressions I introduced** (caught by reading the CSS, not by
     any test): `.sumrow` is `display:flex` with `.sumres{flex:1}` and my
     aria-hiding wrapper collapsed three flex children into one; `.bcard-head`
     became an h2 without resetting the browser default 1.5em/bold/.83em
     margin. **LESSON: aria-hide flex/grid children INDIVIDUALLY, never with a
     wrapper. Retagging an element means resetting its new UA defaults.**
  6. **`pickSeg`/`handleSave` had no null guard** — a tap racing a re-render
     threw, and a thrown handler here is SILENT (the control just stops
     working). That race is MORE likely with a screen reader: double-tap to
     activate is laggier than a direct tap.
  Two new gates: `a11y-flows.js` (23/23, drives sign-in / save / batch / dialogs)
  and `a11y-smoke.js` (**546 controls activated, 0 exceptions**; needs a jsdom
  `VirtualConsole` or the first thrown handler kills the process and hides the
  rest). **Handover state: 40/40 · 22/22 · 55/55 · 23/23 · 31/31 · 21 screens
  axe-clean · 0 exceptions.**
- **CONSENT-CLEAN BUILD — two silent failures found while writing the recipe.**
  The obvious version ("empty `faces/`, rebuild") shipped the photos anyway:
  1. **`build.sh` step 3b used `cp -R`, which only ADDS.** Deleting a file from
     `faces/`/`audio/`/`sounds/` left it in `www/`, and `cap sync` carried it
     into the APK. Now mirrors with `rsync --delete` (plain-`cp` fallback).
     **Any future "remove an asset" task must go through the mirror, not a cp.**
  2. **`profile.photo` is a PATH (`faces/aditya.jpg`), NOT image data.** A
     missing file rendered a broken-image icon on every screen showing that
     child — `avatarFor` only checked `if(p.photo)`, which is a truthy string
     even when the file is gone. Now `onerror="avatarFallback(this)"` swaps in
     the initial. Also fixes a FRESH CLONE, where `faces/` is gitignored.
  Runbook verifies with `unzip -l app-debug.apk | grep -c faces/` → expect 0.
  LESSON: "emptied the folder" is not evidence; check the artefact.
  **VERIFIED ON THE MAC 2026-07-28:** build printed
  `mirrored faces/ -> www/faces/ (0 files)`, BUILD SUCCESSFUL.
- **zsh does NOT honour `#` comments interactively.** Aditya's shell is zsh, and
  a pasted `... | grep -c faces/   # expect 0` passed `#`, `expect`, `0` to grep
  as filenames. `interactive_comments` is off by default in interactive zsh
  (it IS on in scripts, which is why build.sh is unaffected). **Never put an
  inline `#` comment on a command line meant to be pasted** — put expected
  values on the line below. All RUNBOOK snippets were rewritten this way.
- **Seven new scripts, and the build now ENFORCES them** (build.sh step 2b):
  - `scripts/a11y-audit.js` — boots every screen in jsdom, axe sweep + 18
    app-specific regression assertions. **21 screens CLEAN, 29/29 assertions.**
  - `scripts/a11y-contrast.js` — parses the palettes out of styles.css and
    computes real WCAG ratios for all four modes. **55 pass / 0 fail / 1
    advisory.** It caught a real bug in the dark palette I had just written
    (`--line` at 1.54:1) → raised to #6a6458.
  - `scripts/a11y-preview.js` → `docs/a11y-preview.html` — renders REAL app
    markup in 5 screens × 6 modes for eyeballing / sending to the designer.
  - `scripts/a11y-nochange.js` — defends the DESIGN, not the accessibility:
    rem token parity + no unscoped rule in the a11y block. 18/18.
  - `docs/A11Y-TALKBACK-TESTS.md` — the 20-minute manual script (screen
    curtain ON), plus an honest "what a blind teacher still cannot do"
    section. Automation cannot tell you if the app is USABLE.
- **Gotcha for future test harnesses:** `showActivity()` bounces to the child
  picker unless **`batchRoster`** is populated (not just an active profile) —
  seed `batchRoster` to reach a real record screen. Also `ACTIVITY_DATA`/`Store`
  are classic-script consts and never land on `window` — reach them via
  `w.eval(...)`, which shares the global lexical scope.
- **Backticks inside a template literal terminate it** — cost one parse error
  writing an HTML comment inside a `${}` block. Don't quote identifiers with
  backticks inside template strings.
- Tests 40/40 still green. `cap sync` still fails in the sandbox (EPERM on the
  mount) — the a11y gates, parse check and www copy all ran; **Aditya runs
  `./scripts/build.sh` on the Mac.**
## Session 2026-07-22 — repo audit + "block filling" color redesign
- **Section color zones (Draft 2), `feat/section-color-zones` `b705487`, PENDING
  emulator verify.** Manager wanted complete BLOCK FILLING (no white gutters):
  each record-screen region is a full-colour band. Reused the accessible
  `--code-*` palette but REMAPPED it from field-types → SECTIONS: amber = who
  (`.activechild`), blue = listen (`#soundboardPanel`/`#commandBoardPanel`),
  green = score (`#formPanel`, still the elevated hero), plum = history (past
  results). Clever bit: the sound panels turn blue by OVERRIDING `--cat` inside
  the panel, so the player's category accents (active pad, play button, progress,
  tabs) go blue too — no green-on-blue clash. Draft-1 field code kept INSIDE the
  green form as a 4px colour left-edge on inset near-white cards (not full tint —
  tint-on-tint hurts contrast). All in a 55-line scoped block at the END of
  styles.css (revert = delete it); one-word `.results` class hook added to the
  past-results panel in app.js so the About panel's `.panel.quiet` stays flat.
  `activities.js` untouched. Tests 40/40, parse OK, CSS balanced. Not built/merged.
- **Draft 1 (shipped) = per-FIELD tints** (amber count/green judge/blue notes/
  plum video via buildField); Draft 2 keeps that meaning but subordinates it to
  the section bands. If drafts ever need re-showing: they were rendered live from
  the `styles.css` `--code-*` values (the source of truth) — the old chat's
  inline visuals did NOT carry into the workspace, only notes + code did.
- **Backend P0 audit (deferred to a later chat by Aditya).** Read the real repo
  (not the stale cached docs). Key findings, code-confirmed:
  1. **No records/video cloud path.** `Cloud` seam (store.js) = `signIn` +
     `enrolChild` ONLY. No `.upload(`/`storage.from` anywhere. But `schema.sql`
     already has the `records` table (client-UUID `id`, both analysis indexes,
     `video_path`) + `videos` bucket policy. Backend ready, client half missing.
     Fix = `Cloud.syncRecords()` (idempotent `.upsert` on `id`) + `Cloud.uploadVideo()`
     (re-check consent, fail closed) + a `syncPending()` orchestrator + delete-everywhere.
  2. **Offline-enrolled children are un-syncable by FK** — `newResearchId()` mints
     locally when flag OFF (app.js ~1960); `records.research_id` FK → `children`,
     so a local-minted child has no cloud parent and their records can never sync.
     Fix = go cloud-first for enrolment + a `backfill_child(p_research_id,...)`
     security-definer RPC (inserts with the CLIENT's id, `on conflict do nothing`).
     Un-backfillable → decide before more real enrolment. Caveat: backfill can't
     MERGE a child enrolled offline on two devices (two ids = two rows).
  3. **Two schema gaps** surfaced: group records can't enter `records`
     (`research_id NOT NULL` + FK; group saves have none — make nullable or keep
     CSV-only); `teacher_id` FK ≠ local `teacherRosterId` (resolve server-side
     from `auth.uid()`, don't send it).
  4. **`shell-login-home` branch is a footgun** — pre-dates the file split
     (deletes store.js/styles.css/schema.sql/build.sh, +1803 to index.html).
     Merging it reverts the whole architecture. Delete after confirming its
     BYOD/child-id research is captured here.
  5. `.git` is 199 MB (many revisions of the old monolithic index.html/app.js —
     no giant media blob tracked; media is properly gitignored). Optional cleanup.
  6. Reproducibility/bus-factor: `audio/`(28) `sounds/`(22) `faces/`(2) + all
     `*.mp4` + `help-*.jpg` gitignored → a fresh clone builds a broken app; only
     Aditya's Mac has assets + debug key. Fix = LFS or a committed restore script.
- **Env note:** sandbox STILL can't rm `.git/*.lock` on the mount (`Operation not
  permitted`) — the feature commit `b705487` landed, but the follow-up
  `checkout main` failed mid-way, leaving stale locks + a `MM` index state. The
  MEMORY/TRACKER edits are on disk; the recovery + push sequence is TRACKER NEXT #1.
## Sidebar + back-fix session (2026-07-21 pm) — drawer, color code, Android back
Follow-on to the design overhaul. Sound `?` help committed alone (`ab59713`);
the drawer + color code + back fix are still in the working tree, one commit
PENDING on Aditya's Mac (sandbox can't rm git lock files).
- **App drawer (the ☰).** The ⋮ overflow popover became a LEFT slide-in drawer:
  teacher identity head (avatar initial + name + school, rebuilt each open for
  shared tablets), nav = About · FAQs · Settings, foot = Sign out + version line
  (`v${APP_VERSION} (${APP_BUILD})` = 0.9.0 / 21 Jul 2026 — BUMP per APK). Trigger
  renders ONLY on the signed-in landing (setMenuVisible), moved to the LEADING
  header edge (before the brand) with a hamburger icon. Motion reuses the popup
  grammar (.34s in / .22s out; double-rAF so the slide-in actually runs); scrim
  tap / × / Escape close; body scroll locked while open. Funcs: ensureDrawer /
  buildDrawer / toggleMenu / openMenu / closeMenu(instant) in app.js.
- **New Settings screen** (`showSettings`) — real preferences only: narration
  language (AUDIO_LANGS seg; `setAudioLangDefault` writes AUDIO_LANG_KEY, applies
  everywhere the ? sheet narrates; langs without a verified translation render
  DISABLED via `langHasContent`), "Show tips again" (`resetTips` clears the
  per-teacher onboarding flags), Manage data, Export records. showManageData's
  back now returns to Settings (its only entry point now), not Home.
- **New FAQs screen** (`showFAQs`, `FAQ_ITEMS`) — 6 teacher-facing Q&A in
  disclosure rows (sign-in, offline, ?/demo location, multi-student, video
  consent, export/backup). COPY IS DRAFT — content-team owned, like SOP text.
- **About** gained a "Who is behind this" panel (IIT Delhi + NCAHT research
  pilot, partner schools) + a version line that survives a screenshot.
- **Record-form semantic COLOR CODE (Draft 1 — tinted blocks).** Every record
  block wears its meaning's hue: `fc-count` amber (measurement), `fc-judge`
  green (result + mastery), `fc-notes` blue (teacherNotes + legacy notes),
  `fc-video` plum (evidence, locked + unlocked). Applied in buildField +
  videoUploadMarkup so batch focus-flow + group screens inherit it. Checkboxes,
  child bar, past results, Save, and all profile/login/consent forms LEFT
  uncoded on purpose — the code belongs to the record surface only. Selected
  judgment button pinned to a fixed green (not the category hue). Contrast
  6.2–9.7:1, 8/8 assertions. Draft 3 (header-band) is a CSS-only swap if the
  tints feel loud — the classes won't move.
- **ANDROID SYSTEM-BACK FIX (the real one).** Symptom: hardware/gesture back
  closed the app from any screen (indistinguishable from Home). Root-cause
  chain: app swaps screens with innerHTML → webview has NO history; Capacitor
  8's predictive back does NOT walk webview history; and `@capacitor/app` was
  NEVER installed → back just finishes the activity. Fix: installed
  `@capacitor/app` 8.1.1 (package.json + lock) and registered its `backButton`
  listener → Capacitor hands every back press to `systemBack()`, which routes in
  visual priority: confirm dialog → help popup → drawer → header back chevron;
  on Home/login, first press toasts, second `exitApp()`. A popstate history
  SENTINEL (armSystemBack, re-armed on every paint) was the FIRST attempt — it
  works on web but Capacitor 8 ignores it on device, so it's kept only as the
  web-preview fallback. LESSON: the sentinel-only fix "passed tests" yet failed
  on the emulator — native back needs the plugin, not webview history.
- **Sound category `help[]`** — added DRAFT help[] + `helpVideo:
  'demo-sound.mp4'` to the Sound category (a pilot category that shipped with no
  ? because it had no help[]). Content team verifies wording. "Other Activities"
  still has none. Committed alone as `ab59713`.
- **Verification:** 40/40 suite, parse OK ×2, 8/8 color assertions, contrast
  checks — but www/ sync + the git commits happen on Aditya's Mac (the sandbox
  blocks file deletion anywhere under `.git`, so it can't clear git lock files;
  only ONE commit lands per sandbox run — the second aborts on an orphan lock).
## Design overhaul session (2026-07-21) — big UX pass, all landed in working tree
- **BATCH FLOW replaced the single-child flow entirely.** Activity → roster
  multi-select face grid (`rosterSel`/`batchRoster`, Select all, "Start with N
  students" CTA; child added mid-flow joins PRE-selected with a NEW badge) →
  **FOCUS FLOW** for 2+ kids: chip strip w/ ticks, ONE scorecard at a time,
  score pick auto-advances (350ms), "Skip for now" = NO record (absence ≠
  failure), Review & save screen, `Achieved` column DERIVES from the score
  (Got it/Independent → Yes) and flows into the CSV value columns. Solo batch
  = old handleSave path (keeps video evidence, active profile set in
  startBatch). Group activities unchanged. Engine: `batchFlowInit/batchShow/
  batchAdvance/batchReview/handleBatchSave` in app.js. The interim "tick
  sheet + achieved checkbox" design was built then replaced same session
  (redundant with mastery scale — checkbox killed on principle).
- **Popup system:** the ? reference sheet is a shared MODAL (centred "cuboid"
  card — hard offset shadow 8px 10px + ambient pool; entrance .34s
  cubic-bezier(.32,.72,0,1), exit .22s accelerating; content MOVED not cloned,
  paint() reclaims it). `askConfirm()` replaced every window.confirm (counts,
  Cancel focused, rust danger button, "I understand" tick arms the full wipe,
  Export-CSV shortcut inside the dialog). Bottom-sheet variant was built then
  replaced by the centred cuboid on Aditya's call.
- **Activity cards = A3 "media-forward"** (won on-device bake-off vs A2 stage
  ladder). Thumbnails: OBJECT STILL-LIFE inline SVGs (`STILL`/`activityStill`
  in app.js) — real equipment only, NO people, auto-tint via --cat vars, rust
  = cane semantic. 17 scenes + category fallbacks. History: video first-frames
  and a ▶-plays-demo overlay were built then REMOVED (videos not final; demo
  stays behind the ?). `scripts/generate-thumbs.sh` + demo-*.jpg copying in
  build.sh remain for when videos finalise.
- **Onboarding (contextual, no tour):** `hintOnce()` one-line dismissible
  hints (roster + focusflow screens only), teaching empty states, ? gets a
  pulse + a labelled CALLOUT bubble that persists on EVERY screen until the
  explicit "Don't show again" (key `helpTipDismissed` — renamed from helpUsed
  when semantics changed; opening the ? does NOT dismiss). All flags are
  PER-TEACHER (`_obKey()` suffixes teacher id) so shared tablets re-onboard
  each new sign-in.
- **Header:** home-dot REMOVED (read as a second back button; back chevron is
  the one nav control). Earlier same session it had been unified to always
  show ICON.home — then cut entirely. homeDot is a null-safe stub in app.js.
- **Other UI calls:** new students append LAST (upsertProfile push, was
  unshift); "Save child" → "Save info"; green primary-action border + active
  child ring removed (uniformity); font **Inter → Arimo** everywhere (Arial
  metric twin; Instrument Serif still ledes-only).
- **Login reminder:** seeded logins saksham01/rnks01/nab01, any non-empty
  password while CLOUD_SYNC=false; "incorrect" almost always = school/id
  mismatch or stale seeded roster (clear storage to reseed).
- **Prototypes added:** design-drafts-activity-cards-batch-flow.html,
  compare-a2-vs-a3.html, result-sheet-focus-flow.html, thumb-directions.html,
  thumbnails-preview.html (all in prototypes/ — safe to prune).
- **Verification habit:** every change parse-checked + jsdom smoke-tested in
  sandbox (roster, focus flow, confirm dialog, popup lifecycle, per-teacher
  flags) before sync; www/ synced by hand each time (sandbox can't run cap
  sync or delete files — git lock files must be rm'd on Aditya's machine).
- **OPEN:** narrated welcome ("listen to how this app works", Sarvam script +
  audio — content task); demo-slt-*.mp4 exist only on Aditya's machine;
  Hindi SOP drafts still awaiting content-team verify; focus-flow 350ms
  auto-advance timing unvalidated with real teachers.
## Straight Line Travel — three-stage rebuild (2026-07-14, committed + pushed to main)
- **Category 4 rebuilt from 3 demo videos into THREE stages** (was 2):
  `slt-nocane` (travel to the sound by ear — baseline) → `slt-withcane-toy`
  (push toy attached to the cane) → `slt-withcane` (toy faded, plain cane —
  the goal state). Commit `9ee6e2c`, pushed to main.
- **Why the toy → why 3 stages.** The push toy on the cane is a deliberate
  STIGMA-BREAKER: a storyline that turns the cane into something the child
  WANTS to hold, building a positive association before it is "a cane"
  (Aditya's design point). It's a scaffold meant to be FADED — hence the
  progression motivate → skill → independence, one assessed record each.
- **Sound source = the app** (soundboard, like the Sound activities) — all
  three keep `soundboard: true`. The floor beacon in the videos is a
  stand-in; canonical SOP reads "play a sound from the app".
- **Record fields (all three identical):** `steps` (count) + `veer`
  ("Times drifted off line", count — the straightness datum) + `result`
  (mastery) + `notes` (teacherNotes). Steps AND drifts shrinking stage to
  stage is the progress signal.
- **Demo videos:** `demo-slt-nocane.mp4` (07-06 clip) + `demo-slt-withcane-toy.mp4`
  (07-14 clip); compressed ~640px CRF30, gitignored, build-copied.
  `slt-withcane` (toy-faded) has NO demo filmed yet → `videoFile: ""`;
  film + wire later.
- **Hindi SOP drafts machine-drafted, flagged** for content-team verify
  (same rule as Direction/Sound+Direction — no MT for teacher-facing text).
- `slt-withcane` MEANING shifted (was "With Cane (Push Toy)", now plain
  cane); pre-pilot, orphaned test records accepted knowingly.
- **Open question left with Aditya:** if the toy stays on for the whole
  pilot (never faded), collapse back to 2 stages. 3 stands unless he says so.
- **Emulator verify was PENDING at push** — Aditya pushed before the clean
  install. Still to confirm on device: three cards (Without Cane / With Cane
  + Push Toy / With Cane), each → picker → record with sound player + the
  four fields, `?` plays the demo (3rd has none), test save lands.
## STATUS CORRECTION — git vs docs drift (found 2026-07-14) — READ THIS
- **The soundboard two-tab was NOT actually on main**, despite the docs
  below saying "pushed to main". At session start `git log` main HEAD was
  `4810a2c` (Sound+Direction tail) with the OLD 4-group `SOUND_LIBRARY`; the
  two-tab lived ONLY in the uncommitted working `activities.js`. Landed today
  as commit `936e05e` ("soundboard: land two-tab SOUND_LIBRARY").
- **The soundboard PLAYER CODE (`buildSoundboard`/`SB` in index.html/app.js)
  is also absent from main's recent git log** → likely still on an UNMERGED
  `feat/soundboard` branch (which didn't appear in `git log --oneline -8`).
  UNRESOLVED: confirm where soundboard code actually lives and merge it to
  main. Aditya's working tree HAS it (he's been running it), so nothing is
  lost — but a clean checkout of main may not build the soundboard. Sort
  this before any build that must be reproducible from origin/main.
- **LESSON: trust `git log` / `git status`, NOT the docs' own "committed /
  pushed" claims.** Several wrap-ups handed over commit+push commands that
  were apparently never run, so the docs ran ahead of the repo. Verify commit
  AND push state at every wrap-up before writing "done". (Same family as the
  activities.js overwrite lesson — reality lives in git, not in the notes.)
- **Housekeeping:** the block-only patch flow used a `.sltbak` backup file in
  the repo root — delete throwaway backups (`rm activities.js.sltbak`) so
  they don't masquerade as a second source file. Better: keep backups out of
  the working tree entirely.
## Direction category + audio model (settled 2026-07-13, `feat/sop-content`)
- **Direction = Basic / Advanced** (egocentric commands → cardinal compass;
  TAPS/APH progression). Both show the **command board**: pads that speak the
  cue in ENGLISH (`audio/commands/{id}_en.mp3`, Sarvam bulbul:v3 voice
  **priya**, pace 0.9, generate-command-audio.js). `Surprise me` = anti-
  prediction random. Commands live on the activity in activities.js.
- **Audio model, one sentence:** cues are English-only; SOP narration is
  multilingual — **en is default and narrates sop[] itself**; hi/ta/bn need
  sopTranslations text (content-team owned, NO machine translation for pilot;
  Direction hi drafts are machine-drafted, verification pending; ta/bn empty —
  fine, pilot schools are Hindi-belt).
- **Record form for simple drills:** field types `mastery` (Got it / With
  help / Not yet — plain-language independent/prompted/unable) +
  `teacherNotes` (collapsed details section). Generic — any activity can use.
- **Demo children Aditya + Vaishu** seed on zero-profile installs; photos in
  gitignored `faces/` (build-copied to www). Boot repair pass re-attaches
  photos to photo-less same-name profiles. Bundled real-child photos =
  guardian-consent question before builds leave the team.
- **`android:allowBackup=false`** (2026-07-13) — was silently cloud-copying
  child data and resurrecting profiles across reinstalls. android/ is
  gitignored → this lives ONLY on the Mac; re-apply if regenerated.
- Media copy (audio/, sounds/, faces/, demo-*.mp4 → www/) is now build.sh's
  job, step 3b. Both generators read SARVAM_API_KEY from .env.
- **Per-activity content workflow** (proven again on SLT): Aditya uploads a
  demo video → deduce SOP from frames → simplify (≤4 steps, craft into
  facilitatorNote) → wire videoFile → mastery+teacherNotes fields.
## Sound + Direction + GROUP seam (2026-07-13 pm, `feat/sound-direction`, UNMERGED)
- **Category 3 rebuilt from video batch #2** (4 videos): Near-Far → Near-Far
  with Cane → Counting Steps — Group → Counting Steps — Individual. Old
  snddir-clap / snddir-cane-count retired (orphaned pre-pilot records, same
  call as Direction). Video mapping confirmed by Aditya. Commit `f406c55`;
  emulator verify + merge is the first NEXT item.
- **`group: true` on an activity = whole-group scoring** (content-team
  editable flag): card shows a Group pill and routes STRAIGHT to the record
  screen — child picker skipped (guarded inside showChildPicker too);
  "Whole group" bar replaces the child bar; record saved as
  `{group:true, values}` with NO researchId/profileId; renders as "Group";
  CSV Research ID column says `GROUP`.
- **No video evidence on group saves — fails closed.** Video consent is
  per-child; a group clip can't be verified against unidentified children.
  Control not rendered AND commit skipped. Flagged to legal in TRACKER if
  researchers ever want group footage.
- **Sandbox has no ASR path**: HuggingFace (whisper) and api.sarvam.ai both
  403 behind the workspace proxy — SOP-from-video runs on frame montages
  (ffmpeg fps=1/N + tile). LESSON: frames show the SETUP, not the RULES —
  the Counting Steps drills looked like step-listening but were actually
  voice localization + step ESTIMATE (child calls a name / teacher calls,
  called child points + estimates distance in steps, individual then walks
  counting to verify — estimate-vs-actual gap is the datum). Corrected by
  Aditya, commit `ac83dd9`. ALWAYS have Aditya confirm deduced mechanics,
  not just video mapping.
- **Manager review loop**: debug APK → WhatsApp (as document) → Mansi's own
  phone. Not an emulator, not Play Store (that's roadmap item 8). Stub login
  for reviewers: any seeded loginId + any non-empty password while offline.
  faces/ photos ship in every APK — consent caveat until guardian consent
  or an emptied faces/ build.
- **Sandbox-written files can lose the write bit on the Mac** (www/ media
  hit this: `cp: Permission denied`) — fix is `chmod -R u+w www`, worth
  running before builds after a sandbox session touched media.
- **Demo video compression is part of the wiring step**: WhatsApp-sized
  uploads still ballooned the bundle (87 MB one!) — re-encode 640p CRF~30
  before dropping into the repo root (mount can't overwrite: rm-then-cp,
  deletion needs the permission prompt once per session).
## What this is
Offline-first Android app (`org.omcane.trainer`) for teachers running structured
orientation & mobility assessments with visually impaired children. Plain
HTML/CSS/JS, **no bundler** (deliberate — `activities.js` is content-team owned
and must stay editable without a build step). Wrapped via Capacitor 8.
Lives in `~/Desktop/om-app` on an M5 MacBook Air.
**Four-file structure since 2026-07-06** (split from the single index.html,
zero behavior change, merged + emulator-verified): `index.html` (markup shell,
87 lines) · `styles.css` (look; design guardrails at top of file) · `store.js`
(storage seam ONLY — the cloud swap point) · `app.js` (rendering/nav/
behaviour). Load order: activities.js → supabase.js (vendored UMD) →
store.js → app.js.
Build with **`./scripts/build.sh`** — ID guard + JS parse + www copy +
cap sync + built-asset verify in one command.
Closed research pilot: IIT Delhi + NCAHT, 3 schools, ~6 teachers.
Manager: Mansi (IIT Delhi). Collaborators: Flipkart UI/UX designer (peer
review), content team (SOP text + translations), legal team (compliance),
external developer friend (code audits).
Success = a verifiable, privacy-sound app ready for closed pilot sessions, with
clean seams for a future Supabase backend swap.
## Pilot schools (seeded with stable string IDs)
1. Saksham School, Noida
2. Rajasthan Netraheen Kalyan Sangam (RNKS), Jaipur
3. National Association of Blind, Kullu
Real teacher names still pending from Mansi — placeholder teachers for now.
## Supabase project — LIVE (2026-07-03), cloud phase unblocked
- **Project created, India region.** ID `nrnmxgggmqddhbsjtuob`; URL
  `https://nrnmxgggmqddhbsjtuob.supabase.co`; publishable key
  `sb_publishable_jrpvaGwr9d53AysVlTpLJg_qZepOmQh` (new-format anon key,
  RLS-protected, safe in client).
- **`supabase/schema.sql` ran successfully:** tables `schools`, `teachers`,
  `children`, `records`; RPCs `mint_research_id()` + `enrol_child()` (security
  definer, mints server-side `research_id`, requires an active roster teacher via
  `auth.uid()`); `jwt_school_id()`; RLS policies (school isolation via
  `app_metadata.school_id`); storage policy for a private `videos` bucket; seeded
  3 schools.
- **BUG — school-ID mismatch. Half fixed (2026-07-06).** App seeds
  `sch_saksham_noida` / `sch_rnks_jaipur` / `sch_nab_kullu` (app.js
  `seedSchools` ~L213) and stamps every record's `schoolId` with those;
  `schema.sql` had seeded `saksham-noida` etc. RLS matches JWT school_id
  against row school_id → mismatch = all inserts/reads denied.
  **DECISION: the app's `sch_*` IDs are canonical.** `schema.sql` seed FIXED
  and committed; `build.sh` now guards against future drift. REMAINING: re-seed
  the LIVE `schools` table in the dashboard (delete+insert; SQL drafted in chat).
- **Cloud path is not testable until ONE teacher auth user exists** with
  `app_metadata.school_id` set + a matching `teachers` row (`auth_user_id`
  linked). Mansi's real names can wait; provision one throwaway teacher
  (`saksham01@test.local`) to test enrol + RLS.
- **Build state going in:** `cap sync` clean (SCHEMA_VERSION=6), tests 35/35,
  consent code confirmed on `main`, debug APK installs on emulator. Emulator
  video-picker test parked for a real device (picker returns a `content://` URI —
  watch `commitPendingVideo` resolution).
- **CODE WIRING DONE 2026-07-06 pm (commits `9b0a7a0` + `d68f429`, MERGED to
  main 2026-07-13, flag OFF → offline pilot byte-identical, tests 35/35):**
  vendored `@supabase/supabase-js` 2.110.0 UMD as root `supabase.js` (no CDN;
  loaded before store.js; in build.sh copy + verify). `Cloud` seam at the end
  of store.js — LAZY init (flag-OFF builds never touch supabase), `signIn()`
  maps loginId → `<id>@test.local` via `CLOUD_AUTH_DOMAIN` (full typed emails
  pass through, so real accounts need no code change), `enrolChild()` wraps the
  RPC (numeric/date null-coercion; returns `{ok, researchId|error, offline}` —
  never throws). Save-child: NEW child + flag ON → server mints research_id;
  offline → blocked with teacher message; edits stay local; `newResearchId()`
  = legacy/migration only. `verifyCredentials()` → `signInWithPassword`;
  `PILOT_LOCAL_AUTH=true` fallback fires ONLY on unreachable-server (never on
  a rejected password — cloud auth is authoritative when it answers); a
  fallback login has no cloud session so enrolment still refuses.
- **REMAINING before merge (TRACKER "NEXT"):** Mac `./scripts/build.sh` (cloud
  sandbox couldn't run `cap sync` over the mount) + push; run
  `supabase/pilot-dashboard-setup.sql` in the dashboard (Step 3a = create
  `saksham01@test.local` in Auth UI, auto-confirm); real-device verify with
  `CLOUD_SYNC=true` (wrong-password-fails, server-minted ID lands in
  `children`, offline-block, cross-school RLS, parked video-picker test);
  merge → main; flag back to false for pilot builds.
## Soundboard media player — STATUS CONTESTED (see "STATUS CORRECTION" above)
_The section below is the historical record as written last session. Its
"committed + pushed on feat/soundboard" claims are UNVERIFIED against git —
the two-tab was only landed on main today (`936e05e`) and the player code's
branch state is still to be confirmed. Treat commit hashes here with caution._
- **Sound Library media player — built, emulator-tested.** Renders on activities
  with `soundboard: true` (currently: `sound-which`, `sound-source`,
  `snddir-nearfar`, `snddir-nearfar-cane`, `slt-nocane`, `slt-withcane-toy`,
  `slt-withcane`), between the child bar and the record form. Claimed commit
  `0ae5844` on `feat/soundboard` — VERIFY.
  - Transport like Apple Music: play/pause, prev/next, shuffle, repeat
    off→all→one. Repeat-one loops a single sound (localization drills); shuffle
    randomizes the next sound so the child can't predict it during identification
    tests. Tap/arrow-key seek bar with elapsed/total time; animated equaliser on
    the playing pad. Player is always visible (quiet idle state before a sound is
    picked).
  - **Category tabs** show one group's pads at a time, so panel height stays
    fixed no matter how many sounds get added (deliberate fix — the full grid
    made the panel too tall and pushed the record form down). **Updated
    2026-07-14:** the four groups (Animals / Household / Traffic & Outdoors /
    Instruments) were collapsed to TWO tabs — **Recommended sounds** (Clap,
    Cuckoo, Whistle, Dog, Cat; listed first, so it's the default open tab) and
    **Sounds** (the rest). Tabs come purely from the `group` field; no code
    change to re-tab. **Landed on main as `936e05e` (2026-07-14), NOT last
    session.**
  - `buildSoundboard(act)` + `SB` controller (one `<audio>`, the library is the
    queue) live in `index.html`. `SB.reset()` on navigation so audio never bleeds
    across screens. Offline: plays bundled mp3s from `./sounds` inside the
    Capacitor WebView, no server.
  - **Content-team owned, no-coder editable**: the sound list (`SOUND_LIBRARY`,
    `{file,label,group}`) AND which activities show it (`soundboard: true`) both
    live in `activities.js`. Add a sound = drop an mp3 in `sounds/` + one line.
    22 sounds (added clap + whistle 2026-07-14), 2 groups
    (Recommended sounds + Sounds).
  - Design: warm-paper, monoline icons (no emoji), category accent. **Flag for the
    Flipkart designer** — the player is a deliberately richer-accent surface
    (accent on play button + progress fill + lit toggles + current pad), beyond
    the "accent in two spots" guardrail. Flagged, not yet reviewed.
  - Committed via a reconstructed record-only `index.html` so the record-screen
    work and the soundboard are two isolated commits, never mixed.
- **Record-screen redesign + teacher video evidence (prior session) — claimed
  COMMITTED on `feat/soundboard` (`167afc0`) — VERIFY against git.**
  - Unified `?` reference sheet across record + child-picker screens via shared
    `buildRefSheet(act, domId)` + `toggleRefSheet(btn, domId)`. Both open the
    same full sheet: demo video → SOP step sequence → facilitator note → Sarvam
    narration switcher. Headless `<details class="sop-headless">` — invisible when
    closed.
  - Record screen leaned out: removed the always-open "How to run this" SOP panel
    at the bottom; everything now folds behind the `?`.
  - **Teacher video-evidence capture** on the record form (`videoUploadMarkup`,
    `handleVideoPick`, `clearPendingVideo`, `commitPendingVideo`). Architecture:
    pick stages metadata only (`pendingVideo`); on Save, `commitPendingVideo`
    writes the file to app DATA dir at `videos/{researchId}_{timestamp}.{ext}`
    (pseudonym, never the name); the record stores only `rec.video = filename`
    (a pointer, NOT base64 into Store). Same seam a future Supabase swap uses.
    On web preview, returns `stored:false` — no bytes copied, record still notes a
    clip was taken.
  - CSV export gained a `Video file` column (safe in default no-PII export —
    filename is pseudonymous).
  - Hub: active-child chip removed (selection happens later at the picker).
  - Picker: duplicate "Add student" tile removed; disclosure form is the single
    add path.
  - Visual audit: `--ring-active` token at 3px; focus-ring offsets unified (2px
    standalone controls / inset full-width rows / 3px large cards). Dead code
    removed: `openPickerAddForm`, `togglePickerSop`, `toggleActRefSheet`,
    `.pick-add`, `.chip-swap`.
- **Child picker between activity tap and run screen** (committed to main):
  `showChildPicker` Netflix-style face grid; tap a child → active + run.
- **Activities navigation = two-level drill-in**: category grid
  (`showActivityList`) → single-category list (`showCategory`) → activity.
- **Pseudonymisation refactor** (F1/F8/F9) live: `researchId` (`OM-XXXX-XXXX`)
  minted + preserved; records store `researchId` + `profileId`, not child name;
  CSV pseudonymised by default (PII behind `includePII`); cache file deleted
  post-share; migration shim rewrites profiles before records; `SCHEMA_VERSION = 2`.
  (`video` field is additive/backward-compatible — no migration needed; schema
  stays at 2.)
- **`PILOT_ALLOW_SELF_PROVISION = false`** — hides teacher-facing school/teacher
  creation; underlying functions kept as admin primitives.
- **Login**: school dropdown → login ID → password → `verifyCredentials()` stub
  (accepts any non-empty password — correct pilot stub; real check is Supabase
  swap only). Login IDs: `saksham01`, `rnks01`, `nab01`.
## Production roadmap — agreed to solve one by one (ordered by rework risk)
Aditya's call at end of last session: tackle each production issue in turn, plus
a few more features to add. The build is a CORRECT PILOT BUILD — none of this is
wrong for a closed pilot; these are the production gaps.
1. **Cross-device child ID** — HIGHEST rework risk; gets more expensive every day
   real records accumulate under the local scheme. `profileId` is device-local;
   `researchId` is minted on-device, so the same child on two tablets = two IDs
   that never join. Fix = server-assigned ID on enrolment (ODK Central "Entities"
   pattern). **Gated on R&D email** (multi-device-per-child confirmation). Draft
   the R&D email FIRST — unblocks this without writing throwaway code.
2. **Video consent gate — DONE (2026-07-03).** Verifiable per-child consent
   envelope (DPDP Rule 10): `videoConsent`, `videoConsentBy` (required),
   `videoConsentRelation` (required), `videoConsentMethod`, `videoConsentOn`,
   `videoConsentWithdrawnOn`. UI lock in `videoUploadMarkup`, fail-closed
   enforcement in `commitPendingVideo`. Withdrawal preserves the grant record
   (audit trail) and offers clip erasure. We defined the consent fields from the
   Rules directly rather than waiting on legal — legal now REVIEWS a finished
   implementation (`compliance/DPDP-COMPLIANCE-MAP.md`). Still tied to the R&D
   email's identified-video question for whether video ships in the pilot.
3. **Supabase auth swap** — `verifyCredentials()` is a stub, not authentication;
   anyone with the app + a login ID is in. Production = `supabase.auth
   .signInWithPassword()` (seam already designed; only the function body changes).
4. **Uploader + cloud storage** — video currently never leaves the device (no
   uploader). Production needs: Uploader seam (mirror Store, do NOT bolt onto it),
   Supabase storage bucket, offline queue + retry, delete-everywhere (deleting a
   record/child also deletes the cloud file), returned URL saved on the record.
5. **Row-Level Security / multi-tenant isolation** — the moment Supabase lands,
   need `school_id` on every table + RLS policies + JWT school claim at login, or
   one school reads another's children.
6. **Video memory fix — DONE (2026-07-03).** `commitPendingVideo` copies clips
   in 3 MB slices (writeFile + appendFile), so peak memory is one chunk for any
   clip length; failed writes delete the partial file; `handleSave` toasts
   honestly on a failed clip store (no silent loss). Chunk size is a multiple
   of 3 bytes so per-chunk base64 decodes cleanly.
7. **Play Store production release** — closed pilot = internal testing track
   (invite-only by Gmail). Data Safety answers drafted
   (`compliance/PLAY-DATA-SAFETY.md`); privacy policy drafted, needs a public
   hosting URL. KEY FINDING (2026-07-03): target audience is teachers (18+),
   children never operate the app → declare 18+ and the Families/
   Designed-for-Families review should NOT trigger. Children's data is still
   fully disclosed on the form.
Plus: **a few more features to add** — Aditya to name them next chat.
## Other on the horizon
- **Reconcile soundboard branch state** (2026-07-14) — confirm whether the
  soundboard player code is on main or an unmerged branch; merge if needed so
  origin/main builds the soundboard from a clean checkout. See STATUS CORRECTION.
- **Consent/withdraw/erasure envelope (F9) — video side DONE (2026-07-03):**
  withdrawal flow, clip erasure on withdrawal, and file-level deletion in
  `deleteRecord`/`deleteProfile`/`clearAllData` (no orphaned clips on disk).
  Remaining F9 scope: assessment-data consent is paper-only (Part A of
  `compliance/GUARDIAN-CONSENT-FORM.pdf`); mirror in-app only if legal asks.
- **File split — DONE 2026-07-06** (see "What this is"). Cloud wiring now
  lands in clean files.
- **Offline-enrolment queue** — only if online-only enrolment proves painful in
  the field (watch Kullu, weakest connectivity). Flagged, not committed to.
- **Audio pipeline** — blocked on real translated SOP text from content team
  (Hindi, Tamil, Bengali via Sarvam Bulbul v3).
- **Architecture one-pager** — offered, not yet produced.
## Open design notes
- Child picker: selecting a child sets the *global* active child (persists after
  leaving the activity). Run-scoped selection would be a separate seam — flagged,
  not built.
- Category grid: keep the count pill on tiles, or is the description subtitle
  enough? Pending Flipkart designer review.
## Key principles
- **Un-backfillable decisions first**: child ID scheme, consent envelope, schema
  version. Pseudonymisation was sequenced before any upload code for this reason.
- **`www/` was the recurring gotcha — now automated**: root files
  (`index.html`, `styles.css`, `store.js`, `app.js`) are source of truth;
  `www/` is the gitignored build copy the app loads. Every code session ends
  with **`./scripts/build.sh`** (copies, syncs, byte-verifies built assets,
  plus school-ID guard and JS parse check). Branch switches don't touch `www/`.
- **Verify git state, not the notes** (2026-07-14): before writing "committed /
  pushed" in these docs, confirm with `git log --oneline` + `git status`.
  Handed-over commands don't always get run — the soundboard "pushed to main"
  claim was false for a week. Reality lives in git.
- **Stale APK**: if the emulator shows old behavior after a clean sync, it's a
  stale install, not stale assets — `./gradlew clean installDebug` (full reinstall,
  not Apply Changes / hot reload). Diagnosed exactly this on 2026-06-30: root +
  `www/` + built assets all had the code; the install was old.
- **Real password auth cannot live on-device** — APK ships check + comparison
  value together. `verifyCredentials()` stub is the correct pilot approach.
- **Color does one job per surface**: category hue on group/tile header only.
- **TTS does not translate**: Sarvam speaks text as given.
- **Never overwrite the whole `activities.js` from the synced/GitHub copy** —
  Aditya's local file can be AHEAD of `main` (unpushed work). A whole-file `cp`
  on 2026-07-14 reverted the Direction command boards + Sound + Direction
  restructure; recovered via undo. Edit ONLY the targeted block, with a backup
  and a diff proving nothing outside it moved (the SLT + soundboard changes were
  applied this safe way; delete the `.bak` afterward — don't leave it in the tree).
- **`ensureSchoolsSeeded()` skips if schools already exist** — clear old seed on
  emulator before new names appear.
## Working approach
- **Extreme build mode is default**: expert engineer/UX designer, working code,
  pragmatic calls stated, skip research framing unless asked.
- One command at a time with an explicit success check before proceeding.
- Decision-first, then code. One clear recommendation over a menu.
- Static verification before emulator: JS parse via `new Function()`; integrity greps.
- Dedicated branches: checkout → work → emulator-verify → push → merge → delete.
- Feature commits stay focused — keep MEMORY.md / TRACKER.md out of feature
  commits; regenerate them at wrap-up, commit separately.
- Complete files over diff instructions.
- PDF for stakeholder handoffs; visuals over code for design audiences.
## Stack & environment
- Plain HTML/CSS/JS, no bundler; Capacitor 8 (Preferences 8.0.1, Filesystem
  8.1.2, Share 8.0.1, SplashScreen 8.0.1).
- Repo: `Adistor777/om-cane-training` (private).
- M5 MacBook Air, PyCharm, Pixel 10 Pro XL emulator (API 37 arm64); `JAVA_HOME`
  → Android Studio's bundled JDK 21.
- Audio: Sarvam Bulbul v3 REST; `.env` (gitignored), `.env.example` committed.
- Compliance: India DPDP Act 2023 + Rules 2025; penalties up to ₹200 crore for
  children's data; consent burden on app as data fiduciary.
## Key files
- `index.html` — markup shell; `styles.css` — look; `store.js` — storage seam;
  `app.js` — behaviour (incl. `buildSoundboard` + `SB`, `seedSchools` ~L213,
  `verifyCredentials` ~L280, `upsertProfile` ~L351, `SCHEMA_VERSION` ~L128)
- `activities.js` — content-team owned; holds `ACTIVITY_DATA`, the `soundboard:true`
  flags, and `SOUND_LIBRARY` (soundboard sound list). Do not modify without content team.
- `scripts/build.sh` — the one build command (guard + parse + copy + sync + verify)
- `sounds/` — bundled soundboard mp3s (gitignored, like `audio/`); synced to `www/`
- `MEMORY.md`, `TRACKER.md`, `DESIGN_NOTES.md`, `REVIEW_PACKET.md`
## Useful commands
Build + verify (replaces the old cp/sync/grep ritual AND the JS parse one-liner):
```
./scripts/build.sh
```
Post-sync spot-check (any function you just added — note: app.js, not index.html):
```
grep -c "myNewFunction" ~/Desktop/om-app/android/app/src/main/assets/public/app.js
```
Soundboard sounds bundled:
```
ls ~/Desktop/om-app/android/app/src/main/assets/public/sounds | wc -l   # expect 22
```
Clean reinstall (stale APK fix):
```
cd ~/Desktop/om-app/android && ./gradlew clean installDebug
```
DevTools storage dump (chrome://inspect):
```
Store._keys().filter(k=>k.startsWith('rec_')).forEach(k=>console.log(k, JSON.stringify(Store.getJSON(k,[]),null,2)))
```