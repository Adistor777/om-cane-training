# TRACKER.md — O&M Cane Training
_Last updated: 2026-08-25 pm (two SOP docs, fonts, press + selection, regroup, Hindi)_

## STATE (2026-08-21) — the requirements sheet is now the outer target
**Read `OM-Requirements.md` (Adi, 21 Aug) first.** It is the source of truth for
accounts, access, video custody and rollover: **R1–R36** requirements, **four**
still-open decisions (D1, D4a, D5, D9) and **C1–C5** fixed constraints. Numbers
are stable identifiers — never reused, never renumbered — so quote them by number. `SPEC.md`'s eight requirements still hold and
still carry the file:line evidence trail; the sheet sits **above** SPEC and
extends it (classes, a head role, an activity log, retention clocks). Where they
disagree, the sheet wins. Three earlier design docs — `OM-Architecture-Spec.md`,
`OM-Engineering-Review-Response.md`, `OM-What-We-Actually-Want.md` — are
**superseded**; read them as history, not instruction.

**Repo, verified on the Mac 2026-08-21:** `main` @ `598ab2d`. The 31 Jul work
(SPEC, branding, student intake) merged 7 Aug as `d633963`. README rewritten for
reviewers 19 Aug. Three files uncommitted: MEMORY.md and TRACKER.md (the Play
Store research block, written 31 Jul, never committed) and `store.js` — whose
entire diff is a stray trailing space and a lost final newline. **Revert
store.js, commit the docs.**

**Branches:** `feat/section-color-zones` (1 commit, unmerged) ·
`shell-login-home` (predates the file split — merging it would REVERT the split;
delete it) · `origin/feat/a11y-blind-teacher` (merged via `d633963`; remote
branch still present, safe to delete).

### What the requirements sheet CHANGES about the current build
- **R13/R14 — the sharing boundary is the CLASS, not the school.** Everything so
  far assumes school-wide sharing: `seedSchools()`, the RLS policies in
  `supabase/schema.sql`, SPEC #8's teacher-scoped export. **Classes do not exist
  in the schema at all.** This lands *inside* the backend P0 work, not after it.
  Because assignments change mid-term, access has to be looked up from an
  assignments table per row — a claim baked into the login token goes stale and a
  revoked assignment keeps working.
- **R17 — researchers get children's NAMES**, not only research codes. R29 still
  holds for ordinary exports; R17 is a privileged path, not the default. Must
  reach the guardian consent form **before** any collection.
- **R33 vs the sheet-sync feature already shipped.** Student intake reads a
  **published-to-web CSV**. R33 forbids exactly that for rollover — "sent to us,
  not published", because the URL *is* the credential. The same objection applies
  to the intake path already on device. Reconcile the two, or intake keeps the
  hole R33 was written to close. (The "re-mint the URL" item below is the
  stopgap, not the fix.)
- **R31/R32 — group records have no class and are visible school-wide.** Confirms
  the existing `group:true` seam; `records.research_id NOT NULL` is still what
  blocks it server-side.
- **C2 — video must be compressed on-device before upload.** Not done today:
  capture is `accept="video/*" capture="environment"` and `commitPendingVideo`
  copies without transcoding, so a clip is 30–60 MB per 30 s and will not move
  over Kullu's connection. New line item on the uploader — and add a **clip
  duration cap** while there; it bounds upload, storage and retention exposure at
  once. (The old ~2 MB figure came from hand-encoded demo assets, not captures.)
- **C4 — download logging has to be built.** R25 depends on it; bucket access
  logs nothing by default. Downloads must go through a function that issues a
  short-lived signed URL and writes the log entry.
- **R20/R21 — retention clocks** (30 days post-download, 90-day hard ceiling)
  need a scheduled deletion job **with an alert**. Neither exists.
- **R34 — the class list is EDITABLE per school.** Nursery/LKG/UKG/1–12 is a
  starting default, not a fixed ladder: vocational streams, open schooling and
  ungraded groups all exist. Classes are per-school rows, not an enum.
- **R35 — the head can WATCH clips from their school.** Watch only: no download,
  no delete, no share. Needs a view path that issues a stream without handing
  over the file, and it is a **consent-form change** — see the legal item below.
- **R36 — teachers use their OWN PERSONAL PHONES.** Removes the shared-device
  cache churn, and makes D1 more important, not less: a leaver walks away with
  children's data on a device we cannot wipe. D1 is the only bound on it.
- **Four decisions remain open — D1, D4a, D5, D9.** D2, D3, D6, D7 and D8 have
  closed into R36, R35, R31, R17 and R34. Listed under "Decisions needed from
  humans" below.

## STATE (2026-07-31 pm) — branding + student intake. MERGED 7 Aug (`d633963`).
_History. The "NOT committed" below was true on 31 Jul; it landed on 7 Aug._
Everything below was in the working tree on `feat/a11y-blind-teacher` and NOT
committed at the time of writing. Gates all green: **40/40 · 93/93 flows · 22/22 · 7/7 · 32/32 axe ·
contrast pass · 546 controls**.

**1. SPEC.md is new and is now the definition of done** for accounts, children
and data custody — Aditya's own eight-line description of the app, with a
verified status column and file:line evidence. TRACKER is history; SPEC is the
target. Committed earlier as `3dff39f`.

**2. Brand moment moved to the WEB LAYER.** The native splash never appeared
because `AppTheme.NoActionBarLaunch` inherits `Theme.SplashScreen`, so from
Android 12 the system draws the launch screen and IGNORES
`android:background="@drawable/splash"`. It also circle-masks its icon, so the
~5:1 BIF wordmark can never render natively at any size. Now `#brandGate` in
index.html: full-bleed black, mark centred, held 1000ms, faded, removed from
the DOM. `launchAutoHide:false` + an explicit `SplashScreen.hide()` in a
`finally` — the hold starts only AFTER the native splash lifts, which is what
fixed "I see black but no logo" (both timers were previously racing and the
mark got a few dozen frames, most mid-fade). `values-v31/styles.xml` makes the
system's own moment black so there is no cream→black→cream flash.

**3. Funder credit** pinned to the foot of the landing (a `.home-screen` flex
column, `margin-top:auto`) and repeated in About. The cane-child illustration
Aditya asked for was added, then REMOVED at his request — markup, CSS and file
all gone.

**4. Bulk import** ("Add several students from a list") — paste rows, live
preview, four verdicts. Then **sheet sync** replaced it as the primary path
after Aditya said the paste step was the very thing he wanted to avoid: a
coordinator sets a published-CSV link once in Settings, teachers tap **Sync
from the sheet** on Students. Paste survives as the offline fallback, one line
below Sync — DELETE IT if he confirms he does not want it.

## Done 2026-08-24 (compass face · activity regrouping · the silent-audio bug)
All on `feat/compass-and-layout`, four commits, merged to `main`.
Gates green throughout: 40/40 unit · 93/93 flows · 55 contrast · 22 no-change ·
32 axe · 551 controls activated with nothing throwing (was 553 — the two tiles
of the deleted Sound category).

- [x] **AUDIO WAS BROKEN SINCE 13 JULY AND NOTHING CAUGHT IT** (`cc6d260`). All
      43 Sarvam files were WAV bytes in a `.mp3` filename; Capacitor serves MIME
      from the extension, so Android refused every cue and every narration. All
      re-encoded to real MP3; both generators now sniff the returned bytes and
      fail loudly without ffmpeg. WAV originals in
      `~/om-media-backup/audio-wav-originals/`. Full story in MEMORY.
- [x] **`play()` rejections no longer swallowed** (`8e89746`). `p.catch(()=>{})`
      in `CB.play` and `SB.play` hid every policy refusal — a blocked cue and a
      muted device were indistinguishable. Both now toast `err.name`; `onerror`
      names the media error code.
- [x] **Direction → Advanced is an 8-point compass face** (`5514d4d`, `8e89746`)
      — round pads on a true ring, dashed dial, needle that turns to the last
      point spoken. `compass:true` + `at:` in activities.js; content-team
      editable; falls back to the old grid if the flag is removed.
- [x] **Activities regrouped** (`8c7be0f`). `Sound` deleted, its two activities
      now lead `Sound + Direction`; both Counting Steps drills moved to
      `Straight Line Travel` at positions 2 and 3. Category copy and the GROUP
      NOTE comment moved with them. Records were never at risk — they key on
      `rec_<activityId>` and no category index is persisted.

## Done 2026-08-25 pm (second SOP doc · regroup · Hindi)
- [x] **`SOP.docx` filled in** — Near-Far w/o Cane, Near-Far with Cane, Count
      Steps, Count Steps (Group). Names, resources, age and time from the doc.
- [x] **New `rating` field type (1–5)** — the doc asks for it four times and
      nothing did it. Five buttons that stay a row on a phone.
- [x] **A rating never becomes a verdict** — no `Achieved` column is derived
      from a 1–5 scale, or from a `choice` with no `achievedWhen`.
- [x] **Sound split back out of Sound + Direction**; both Counting Steps moved
      back in. Six categories. Ids unchanged, records followed.
- [x] **Palette fixed for six categories** — slot 5 was a near-duplicate of
      Direction and would have landed on Other Activities. Swapped with plum.
- [x] **? removed from the category screen** (showCategory only; picker and
      record screens keep theirs). Category help data kept, not deleted.
- [x] **Hindi on all eight** activities whose English came from the two docs,
      1:1 with `sop`, verified. MACHINE DRAFT — see MEMORY.
- [x] **Sound player on both Count Steps** (`soundboard: true`, shared library).
- [x] **`docs/ROADMAP-SEP-2026.md`** written; the August roadmap superseded.
- [!] **LESSON: `forEach` skips sparse-array holes**, so the check written to
      verify the regroup passed on a broken file. The 40-test suite caught it.
      Verify arrays with `length` + an index scan.

## Done 2026-09-01 (foundation pass: CI, the verify gate, double-submit, rain)
Working tree was clean at `69d407a` when this started. All seven gates green
before and after: contrast · no-change · flows · smoke · runtime-theme · axe ·
40/40 unit. **Not committed and not synced** — `cap sync` cannot run through the
cloud bridge (it needs to unlink files and the mount forbids that), so
`./scripts/build.sh` has to run in your own terminal before any of this reaches
a phone.

- [x] **`scripts/gates.sh` is new** — the node-only half of build.sh, extracted
      verbatim so CI and the build cannot drift apart. build.sh calls it. It also
      now runs `test-batch1.js`, which was never wired into the build and so ran
      only when somebody remembered.
- [x] **`.github/workflows/gates.yml`** — node 22, `npm ci`, `bash
      scripts/gates.sh`, on push to every branch and on PRs. First CI this repo
      has ever had.
- [x] **build.sh's verify step fails properly.** All three branches tested.
- [x] **Double-submit guards are completion-driven, not timer-driven.**
- [x] **`jsdom` → devDependencies**, lockfile regenerated.
- [x] **`sounds/rain.mp3` 27.6 MB → 120 KB.** 10 s from 30 s in, 96 kbps mono
      44.1 kHz, 0.25 s fades. Original verified byte-identical in
      `~/om-media-backup/sounds/` BEFORE the replacement, and the new file was
      checked to be a real MP3 (the 24 Aug WAV-as-mp3 lesson). `sounds/` is now
      **8.9 MB, down from 36 MB** — the APK should drop by about 27 MB.

**Also 1 Sep — `docs/GITHUB-SETUP.md` gutted back to a page of history.** It was
the July walkthrough that first put the project on GitHub; every step was done
long ago. It was not merely stale — **its step 2 pasted a whole `.gitignore` over
the real one**, and that July list excluded three folders where today's excludes
sixteen entries. Anyone following it would have started tracking `faces/`
(photographs of real children) and `.env` (the Sarvam key) on the next
`git add .`. A superseded plan is safe to keep; a superseded document carrying a
runnable command that commits children's photographs is not. It now states what is
true — `.gitignore` is the only source of truth, a fresh clone cannot build,
commits stay focused, CI runs on every push and what its green tick does not mean.
Two smaller drifts fixed with it: the file still described the repo as
`index.html` + `activities.js` (predating the 6 July four-file split) and advised
`git add .`, which contradicts this project's own commit rule.

**FINAL SOPs landed 1 Sep** (`SOP_CC_App.docx`, final). The document carries 13
activity SOPs. Eight were already in — Direction x2, Sound x2, Sound+Direction x4
were built from the 25 Aug version of the same file and match it. **Five had never
had it** and were still running on July's video-deduced text: `slt-withcane-toy`,
`slt-withcane`, `terrain-intro`, `terrain-walk`, `terrain-obstacle`. All five now
carry the delivered `meta`, `sop` and `facilitatorNote`, transcribed, nothing
invented. Gates green after: 621 controls, 40/40 unit. Method: targeted block
replacement with a backup, asserting the id set is unchanged and that the count of
`dataFields` / `videoFile` / `soundboard` / `group` / `compass` / `commandBoard` /
`commands` is identical — the 2026-07-14 whole-file-overwrite lesson.

- [ ] **TEN STALE AUDIO FILES, all dated 24 Aug — regenerate five, delete five.**
      The `_en` narration for those five activities speaks the OLD deduced steps.
      This is the `dir-basic-commands_en` bug from this morning, five times over,
      and `build.sh` will mirror them straight into the APK.
      ```
      node scripts/generate-audio.js --only slt-withcane-toy slt-withcane terrain-intro terrain-walk terrain-obstacle --force
      rm audio/slt-withcane-toy_hi.mp3 audio/slt-withcane_hi.mp3 audio/terrain-intro_hi.mp3 audio/terrain-walk_hi.mp3 audio/terrain-obstacle_hi.mp3
      ```
      The Hindi is DELETED, not regenerated: the old hi[] was 1:1 with the old
      steps and has been removed from activities.js. No machine translation for
      teacher-facing text — this waits on the content team.
- [ ] **`dataFields` for those five still disagree with the document's "Record a
      Result".** Not changed: that is instrument design, not transcription, and it
      moves CSV columns. Deltas — push toy wants *Response to toy* (Excited /
      Neutral / Not interested) + *confidence 1-5*; with-cane wants *left-to-right
      movement* (Yes / With support / No) + *confidence 1-5*; terrain-intro wants
      *changes identified*, *terrains described*, *vocabulary 1-5*;
      terrain-walk adds *boundaries 1-5*, *arc 1-5*, *assistance level*;
      terrain-obstacle adds *re-orientation* (Independent / With support / Unable).
      Pre-pilot, so it is cheap now and expensive after records exist.
- [ ] **`slt-nocane` has NO SOP in the final document.** SLT ships three stages;
      the content team delivered two (With Push Toy, With Cane). This looks like
      the answer to the July question of whether to collapse to two stages —
      confirm before the pilot, don't assume.
- [ ] **The document's Terrain "Introduction (Set up)" has no home in the app.**
      Four contrasting surfaces, 2 ft x 6 ft each, U-shaped path recommended,
      Velcro fixing, per-session safety check. It is category-level setup, not an
      activity SOP, and there is no field for it. Probably category `help[]`.
- [ ] **The three terrain activity NAMES are now wrong.** They are really
      *Terrain Identification with Feet* / *with Cane* / *Find the Obstacles*.
      `terrain-intro` reading "Introduction" now collides with the document's own
      separate Introduction section. Renaming is safe (records key on id).

**Found on the way, not fixed:**
- **`audio/dir-basic-commands_en.mp3` is stale** — see the BLOCKING section.
- **Next-biggest sounds:** `tabla` 1.9 MB · `flush` 1.7 MB ·
      `bike-driving` 1.4 MB · `clock` 644 KB · `cuckoo` 600 KB ·
      `police-siren` 580 KB. Same ≤10 s / 96 kbps / mono policy would take the
      library to about 2 MB. Not done: trimming a cue changes what a child hears,
      and that is a content call, not a build one.
- **`faces/` holds only `.DS_Store`** — the demo children have no photos, so
      Aditya and Vaishu render as initials. Correct for a build leaving the team;
      restore from `~/om-media-backup/` if you want them back internally.
- **`scripts/.gates-tail-tmp.sh`** — my scratch file. The mount cannot delete
      files, so it is still there: `rm ~/Desktop/om-app/scripts/.gates-tail-tmp.sh`
- **build.sh's own comment (step 2b) still says the app is used "BY teachers who
      are themselves blind or low vision".** MEMORY settled the opposite (R30:
      accessible, not blind-first). Left alone — it is your call whether to
      correct the comment or the scope.

## OPEN — carried into the next session
- [x] ~~NOTHING FROM 25 AUG IS COMMITTED.~~ `commit-today.sh` ran; seven commits
      through `69d407a`, pushed. Verified on the Mac 2026-09-01.
- [ ] **Hindi must be verified by a native speaker before any school sees it.**
      Check छड़ी (cane) and व्यक्ति A / व्यक्ति B (the two adults) first.
- [ ] **Sixteen new audio files nobody has heard** — 8 English, 8 Hindi. No gate
      can evaluate audio. Real phone, both languages, every one of the eight.
- [ ] **Student intake: import the FILE, don't publish a link.** Closes R33 for
      intake and reuses `classifyRows`. Recommended, not built. Keep the paste
      path — it is the R33-compliant one and was about to be deleted.
- [ ] **Sound library: compression policy first** (≤10 s, 96 kbps mono,
      ~150 KB), then curate from CC0 sources. Streaming is ruled out — see
      MEMORY. Teacher-records-a-sound is the better answer for field cases;
      environmental only, never a person.
- [ ] **Press feel is a judgement call and it is yours** — three tokens and two
      durations. Bench with a slow-motion A/B:
      https://claude.ai/code/artifact/3b6b298b-4be2-4e13-8535-b946ff5800b2
- [ ] **Video retention contradicts R20/R21.** "Researchers access whenever they
      want" and a 90-day hard ceiling cannot both hold. Building with no
      auto-delete until confirmed; a clock is config, un-deleting is not.
- [ ] `OM-Requirements.md` is STILL not in the repo.

## Done 2026-08-25 (real SOPs · bundled fonts · press + selection)
Gates green throughout: 40/40 unit · 93/93 flows · 22/22 no-change · 55 contrast
· 7/7 runtime theme. Detail and rationale in MEMORY.

- [x] **THE FONTS WERE NEVER LOADING IN THE FIELD.** `index.html` fetched both
      faces from fonts.googleapis.com — offline, every heading fell back to
      Georgia and every label to Arial. Both now bundled in `fonts/`
      (committed, like `img/`), mirrored by build.sh step 3b. The app makes no
      third-party request at boot any more, which is also a DPDP point.
- [x] **Instrument Serif → Fraunces.** Variable 100–900, so high-contrast mode
      can finally make the largest text on the screen heavier — Instrument Serif
      had one weight and could not.
- [x] **The four real SOPs are in** (`SOP_CC_App.docx`): Direction Basic,
      Direction Advanced, `sound-which`, `sound-source`. New `meta` block
      ("Before you start") and a new content-team-editable `choice` field type.
- [x] **Fixed a real data bug found on the way:** the batch flow stamped
      `Achieved: No` on records from activities that ask for no judgment.
      Direction Advanced would have shipped observed-looking failures into the
      research CSV. Now written only when a score exists.
- [x] **Counting Steps — Individual moved above — Group** in Straight Line
      Travel (Adi, 25 Aug). Byte-identical block move.
- [x] **Press system**: one physics (ink into paper), weight MEASURED from the
      element rather than a class list, asymmetric 80ms/340ms, 90ms floor,
      pointerdown-driven, haptics via `navigator.vibrate` with a Settings
      toggle. Nine ad-hoc scale values retired; two of them were hover rules
      that made cards RISE on touch.
- [x] **Selection system**: chosen = filled and pressed in; live (a sound
      playing, a command speaking) = outlined and breathing, never filled. Ends
      the collision where one green fill meant both "chosen" and "playing".
- [x] **Category hue now tints the existing shadow** (`--cat-shadow`), same
      tier — not a second one.
- [x] **`scripts/measure-press.mjs`** — runs the app in Chromium and prints
      every control's press weight. Found four defects in an hour-old
      implementation. NOT a build gate (needs a browser); run it after adding a
      component or changing a size.
- [x] **`scripts/emulator.sh` + `scripts/install.sh`** — boot-and-wait, and
      install-then-prove-what-landed.

## BLOCKING — must run in Aditya's own terminal, before any phone session
- [ ] **SOP narration: SEVEN of the eight files regenerated, ONE did not.**
      The 27 Aug run landed `dir-advanced-commands` (en+hi), `sound-which`
      (en+hi), `sound-source` (en+hi) and `dir-basic-commands_hi` — all stamped
      27 Aug 08:35. **`audio/dir-basic-commands_en.mp3` is still dated 24 Aug
      11:13**, which is BEFORE the four real SOPs landed on 25 Aug. So the English
      narration for Direction → Basic still speaks the old four-step text and
      disagrees with the screen. Found 2026-09-01 by file mtime, not by any gate —
      no gate can hear audio. The bridge shell cannot reach api.sarvam.ai, so this
      has to be your terminal:
      ```
      node scripts/generate-audio.js --only dir-basic-commands --force
      ./scripts/build.sh
      bash scripts/install.sh
      ```
      Then LISTEN to it. Check the other seven on the same pass.
      node scripts/generate-audio.js --only dir-basic-commands dir-advanced-commands sound-which sound-source --force
      ./scripts/build.sh
      bash scripts/install.sh
      ```
- [ ] **Press feel is a judgement call and it is yours.** Tuned toward restraint
      (guardrail #1). If it reads too subtle on the real phone, the knobs are
      `--press-slab` / `--press-ctrl` / `--press-micro` and the two durations —
      one line. Comparison bench, with a slow-motion toggle:
      https://claude.ai/code/artifact/3b6b298b-4be2-4e13-8535-b946ff5800b2
- [x] **`sounds/rain.mp3` — DONE 2026-09-01.** Was 27.6 MB — 14 min 22 s at 256 kbps stereo, for a
      drill cue. 76% of the sound library and a quarter of the APK. Ten seconds
      at 96 kbps mono is ~120 KB. Bigger win than trimming
      `demo-snddir-steps-solo.mp4` (23 MB), which is already on the board below.
- [ ] **Hindi for the two Direction activities** — content team. Their drafts
      were dropped because they no longer matched the English; the language
      button renders disabled until real translated text arrives.
- [ ] **`#3a7d5d` (palette entry 5) is a near-duplicate of Direction's
      `#2f6f4e`**, and entries 5–6 are unused since the regroup left five
      categories. Change that hue before a sixth category is ever added.
- [ ] **The `terrain` category has no written history** — `terrain-intro` /
      `terrain-walk` / `terrain-obstacle` and 21 MB of demo video appear nowhere
      in TRACKER or MEMORY. One of five categories is undocumented.
- [ ] **`OM-Requirements.md` IS NOT IN THE REPO.** TRACKER opens by calling it
      the source of truth for R1–R36 and it exists nowhere in the tree or in git
      history, nor do the three superseded design docs. Every reference to those
      numbers is currently second-hand. Get the file into `docs/` and commit it.

## PARKED FOR A REAL DEVICE — do these in one sitting
_The emulator cannot answer any of them. Confirmed 2026-08-24: audio plays on a
real phone and is silent on `Pixel_10_Pro_XL(AVD)`._

> **Written up as `docs/DEVICE-MATRIX.md` (1 Sep) — run from there, record the
> results in it, and commit it. That is what closes Phase 0.** It carries the five
> cloud assertions, the video-picker checks, the audio pass and the touch-target
> pass, plus two things the roadmap did not spell out: **A5 cannot run until a
> SECOND auth user exists** (only `saksham01@test.local` was ever provisioned, and
> cross-school isolation needs a second school to be refused as), and **A1 gives a
> false pass on a weak connection**, because `PILOT_LOCAL_AUTH` correctly falls
> back to the stub when the server is unreachable.
- [ ] **Audio pass.** Every command cue, the soundboard, and SOP narration in
      each language that has files. **No gate can catch an audio defect** —
      jsdom has no decoder, which is exactly how six weeks of silence passed
      every test. This is now a permanent manual step before any build ships.
- [ ] **Video picker** (`content://` URI through `commitPendingVideo`) — parked
      since July for the same reason.
- [ ] **Cloud device matrix** with `CLOUD_SYNC=true` — see the backend P0 block.
- [ ] Touch-target sizes on the compass face: three columns of round pads at
      360px. The axe gate states outright that it cannot measure size or
      contrast without a layout engine.

## NEXT — the one list (2026-07-31)
_Replaces five competing "NEXT" sections dated 14, 21, 21 pm, 22 and 29 July.
History stays in the STATE / Done sections below. New work is added HERE, not in
a new section. Target state for accounts and data custody lives in `SPEC.md`._

### FIRST — clear the working tree (2026-08-21, done 08-24)
- [x] ~~Commit the 31 Jul pm work.~~ Done — merged 7 Aug as `d633963`.
- [x] ~~Revert `store.js`~~ — the stray trailing space is gone.
- [x] ~~Commit MEMORY.md + TRACKER.md~~ — `760228c`, pushed 24 Aug.
- [x] ~~Delete the merged remote branch `origin/feat/a11y-blind-teacher`~~ — gone, verified 25 Aug.
- [ ] **Delete `shell-login-home`** (local + origin) — it predates the file
      split and merging it would REVERT the split. Confirm its BYOD/child-id
      research is captured in MEMORY first.
- [ ] **`feat/section-color-zones`** (`b705487`, 1 commit, 23 Jul) still pending
      emulator verify — checkout, `build.sh`, `installDebug`, open a soundboard
      activity to see all four bands, then merge or drop.
- [x] **Sheet sync WORKS against a real published sheet** — confirmed on device
      2026-07-31 pm. Route to get there: an `/edit` link 401s because the sheet
      is private; File › Share › Publish to web › the tab › CSV gives the
      `/d/e/2PACX-…/pub?…output=csv` link that works. Still worth confirming
      once: tap Sync a SECOND time and check it adds nobody.
- [ ] **Decide the paste screen's fate** — keep as the offline fallback, or
      delete. Aditya disliked it; it is currently one line under Sync.
- [ ] **Before real children go in any sheet:** un-publish and re-publish to
      mint a fresh URL. The current one was pasted into a chat, and a published
      link is unauthenticated — the URL IS the credential.

### BLOCKING EVERYTHING — one build ships rounds 2–4
- [ ] `./scripts/build.sh` → `cd android && ./gradlew assembleDebug` on the Mac.
      Rounds 2, 3, 4 and 4b are all in source + `www/` and in NO APK. Nothing
      below matters until this runs.
- [ ] Consent-clean it before it leaves the team: empty `faces/`, then verify
      `unzip -l app-debug.apk | grep -c faces/` → 0.

### Close the accessibility loop
- [ ] Send the build to the blind reviewer.
- [ ] Ask him exactly three things: (1) does selecting a student say the NAME?
      (2) did he FIND pad-tap-to-stop himself, or only because he was told?
      (3) does it still read from the top anywhere — and on WHICH screen?
- [ ] On his round-2 answers: merge `feat/a11y-blind-teacher` → main, delete the
      branch, push. (15 commits ahead of main as of 31 Jul.)
- [ ] Send `docs/a11y-preview.html` (`node scripts/a11y-preview.js`) to the
      Flipkart designer — high contrast deliberately breaks the accent guardrails.

### Clear the branch backlog
- [ ] `feat/section-color-zones` (1 commit, 23 Jul): checkout → `build.sh` →
      `installDebug` → open a soundboard activity to see all four bands at once
      → merge, or tweak hues first if the manager wants.
- [ ] **Delete `shell-login-home`** (local + origin). It predates the file split;
      merging it would REVERT the split. Confirm its BYOD/child-id research is
      captured in MEMORY first.

### FOUNDATION — cheap, independent of the requirements sheet, do first
_Audit findings, re-verified against the tree 2026-08-21. Most are hours, not
days, and none of them wait on a decision._
- [x] **CI — done 2026-09-01.** `.github/workflows/gates.yml` runs
      `scripts/gates.sh` on every push and PR. The node-only half of build.sh
      (school-ID guard, JS parse, six a11y gates, unit suite) was SPLIT OUT into
      `scripts/gates.sh` so CI and the build run the same file — there is no
      second copy to drift. The workflow header states what a green tick cannot
      mean: no audio, no rendered contrast or touch-target size, no TalkBack, and
      no proof that www/ or the APK got the code.
- [x] **`build.sh` verify step now bites — done 2026-09-01.** Was
      `[ -f "www/$f" ] || continue`. Now: a file present at ROOT must exist in
      `www/` AND in the built assets AND match. Three branches, all three
      exercised against a scratch tree before shipping. It fires correctly today —
      run it after a real `cap sync` and it goes green.
- [x] **Double-submit fixed — done 2026-09-01.** `handleProfileSave`,
      `handleSave` and `handleBatchSave` each wrap their body in
      `try{ … }finally{ unlockBtn(btn); }`. The timers are gone. **Two of the
      three had early `return`s with no unlock at all** — the timer was the only
      reason those buttons ever came back, so removing it without `finally` would
      have locked the Save button permanently on a validation failure.
- [x] **`jsdom` moved to `devDependencies` — done 2026-09-01.** Lockfile
      regenerated (`npm install --package-lock-only`) so `npm ci` in CI stays
      in sync. Three dependency advisories still outstanding — `npm audit`.
- [ ] **WebView floor is unstated and fails closed in the worst way.** `inert`
      needs Chrome 102, `dvh` needs 108, vendored `supabase.js` needs ~85. Below
      the floor a teacher is locked out behind a **wrong-password** message.
      Detect and say something true.
- [ ] **CSV export re-parses the profiles blob per row** (`buildCSV`,
      `app.js:1093`) — ~5,401 parses for 1,800 rows. Hoist the parse.
- [ ] **Eleven more audit findings exist and are not on this board.** Six are
      above. Send the audit document and they get folded in — they are not being
      reconstructed from memory.

### Then: backend P0 — this is the SPEC.md work
- [ ] Deferred 2026-07-22, now the critical path. `SPEC.md` holds the eight
      requirements and the order. Solve 3→2→1: cloud-first enrolment +
      `backfill_child` RPC for children already enrolled locally; device-test
      matrix (`CLOUD_SYNC=true`: wrong password fails online, server-minted
      `OM-XXXX-XXXX` lands in `children`, airplane-mode enrolment blocked, edits
      still work, cross-school RLS returns nothing); then `Cloud.syncRecords()`
      + `Cloud.uploadVideo()` + `syncPending` + delete-everywhere.
- [ ] Two schema gaps to fix first: group records (`records.research_id` is NOT
      NULL, which blocks them) and the `teacher_id` FK (resolve server-side).
- [ ] Un-backfillable, watch it: children enrolled offline are un-syncable by FK.
      Every one created before cloud-first enrolment lands is a migration later.

### Decisions needed from humans

**Adi alone — four still open. Everything in the class model waits on these.**

> **All four are AUTHORISATION decisions** — see `docs/AUTH-ARCHITECTURE.md`
> (1 Sep). D1 is the offline degradation clock. D4a is whether an ended assignment
> still grants read. D5 is `teachers.active`, which the access helpers already
> filter on — so the recommended answer (switch off, don't delete) is one boolean
> and free. D9 is the `class_id is null` branch in the `children` policy. Three
> of them are literally one line each in that design, and none can be written by
> an engineer.
- [ ] **D1 — offline window** before identifying data goes dark. **14 days
      proposed.** R36 (personal phones) sharpens this rather than settling it: a
      departing teacher takes the phone with them and we cannot wipe a personal
      device, so D1 is the *only* thing bounding how long children's names stay
      readable. Argues for the shorter end. Degrade, don't lock — and degrade to
      **first name only**, not research codes: `OM-XXXX-XXXX` is opaque by
      design, so a teacher facing ten children would pick wrong and write a
      session silently onto the wrong child.
- [ ] **D4a — do teachers keep access to last year's records after rollover?**
      Consequence: every teacher loses last year's records on the same day.
- [ ] **D5 — departing teacher: deleted or switched off?** *Recommendation:
      switch off.* R12 makes every record name who conducted it and R25 logs who
      created what — a hard delete leaves both pointing at a name that no longer
      exists. To the school and the teacher it is indistinguishable: login stops
      working immediately, they vanish from every list and picker. A **guardian's
      request to erase a child's data is the opposite case** and must be a real,
      permanent delete. Awaiting Adi's confirmation.
- [ ] **D9 — group records school-wide (R32), or only the teacher who ran them?**
      R32 stays marked **provisional** until this closes.

*Closed 21 Aug: D2 → R36 (personal phones) · D3 → R35 (head can watch) ·
D6 → R31 (group untied from class) · D7 → R17 (researchers get names) ·
D8 → R34 (class list editable per school).*

**NOT IN ANY DOCUMENT — ask Mansi this week:**
- [ ] **Is there an approved ethics protocol (IEC/IRB)?** This study collects
      assessment data and face video from disabled minors, with IIT Delhi and
      NCAHT, for longitudinal and cross-child analysis. Institutional review is
      normally required *before* collection, and it is a different thing from
      DPDP compliance. Two consequences: data collected before approval is
      typically unusable retrospectively, so a first school could produce
      unpublishable data; and **the protocol, not an engineering choice, may
      dictate video retention** — which is exactly the open research-vs-QA
      question below. It also has to cover R17 (researchers seeing names). If a
      protocol exists, several items here are already decided. If not, it sits
      ahead of legal on the critical path.

- [ ] **Video + a blind teacher** (Aditya + Mansi; legal if (b)). He cannot frame
      a shot, tell whether the child is in it, or check the clip afterwards.
      (a) leave it — video is optional per child and he doesn't use it;
      (b) a sighted colleague captures; (c) hide the control when a screen reader
      is detected — unreliable to detect, paternalistic when wrong.
      Recommend (a) or (b).
- [ ] **Video retention** (Mansi) — research data kept and analysed for years, or
      fidelity QA watched once, scored and deleted? Blocks the uploader design.
      Note the ship decision is already locked (R&D, 2026-07-03): video ships.
- [ ] **Legal:** group activities save no video by design — per-child consent
      can't cover an unidentified group. If researchers want group footage, legal
      must define a group-consent envelope first.
- [ ] **Legal — the consent form is narrower than R17 and R35 now require.** It
      was written for **research use**. Two widenings landed 21 Aug: researchers
      get children's **names** (R17), and the **head can watch clips** from their
      school (R35). A parent who agreed to researchers viewing their child did not
      agree to either. One line on the form is free today and awkward once
      families need re-consenting. Send both questions together.
- [ ] **Legal:** fiduciary entity of record, grievance officer, effective date,
      Rule 10 due-diligence sign-off, educational-institution exemption. All
      flagged in `docs/compliance/DPDP-COMPLIANCE-MAP.md`.
- [ ] **Mansi — Play Store account type, BEFORE anyone registers.** Personal or
      organization under IIT Delhi / NCAHT? Organization is exempt from the
      12-testers-for-14-days gate but needs a D-U-N-S number (~28 days) unless
      the institution counts as a known government body. Wrong choice costs
      about a month. Full research in MEMORY.
- [ ] **Mansi:** real teacher names for the seed.
- [ ] Print consent forms WITH serial numbers once the legal placeholders fill in.

### Content team
- [ ] Hindi SOP drafts are machine-drafted — verify before pilot. Deliver ta/bn
      text (paste into `sopTranslations`, run the generator — no code needed).
- [ ] FAQ copy (6 original + 3 new accessibility entries) and the Sound `help[]`
      wording are drafts. "Other Activities" has no `help[]` — add if wanted.
- [ ] Real recordings for `clap.mp3` + `whistle.mp3` (currently synthetic).
- [ ] Narrated welcome — Sarvam script EN/HI. The script is the blocker; no code
      slot is built yet.
- [ ] Demo clips are SILENT. The `?` sheet now says so; a narrated demo would
      remove the caveat.
- [ ] Film + wire the toy-faded `slt-withcane` demo — its `videoFile` is empty.

### Housekeeping / optional
- [ ] Get `~/om-media-backup` OFF the Mac (Drive or an external disk) — 39 audio,
      22 sounds, 2 faces, 8 videos. It would not survive the laptop.
- [ ] SLT English narration: `node scripts/generate-audio.js --only slt-nocane
      slt-withcane-toy slt-withcane`, then `build.sh` + `installDebug`.
- [ ] `./scripts/generate-thumbs.sh` on the Mac.
- [ ] Trim `demo-snddir-steps-solo.mp4` (23 MB, 9½ min) if APK size bites —
      filename stays, no code change.
- [ ] Prune `prototypes/` — 5 draft HTML files.
- [ ] Validate the focus-flow 350 ms auto-advance beat with real teachers (the
      dial is in `batchFlowInit`'s setTimeout).
- [ ] Untested, flagged honestly: braille display, Switch Access, Voice Access.
      If a pilot teacher uses one, test before assuming.
- [ ] Video #4 content workflow: deduce SOP from the demo video → simplify to ≤4
      steps → wire `videoFile` → mastery + teacherNotes fields.

## ROUND 4b (2026-07-30) — last two round-3 items, DONE. Needs one APK.
1. **"Don't show again" destroyed focus.** It removed the element CONTAINING the
   button just pressed, so focus fell to `<body>` and TalkBack restarted from
   the top. New `removeAfterFocus()` moves focus to the `?` button first and
   announces the dismissal. `dismissHint` had the same shape; both fixed.
2. **Verbosity trim.** Child tiles were labelled "Vaishu, student 3 of 12".
   Screen readers announce STATE BEFORE the name, so every swipe was "Not
   selected. Vaishu, student three of twelve. Button." Tiles now carry the NAME
   ONLY — the grid container already announces "12 students" on entry. This is
   both the "too accessible" fix and the "name comes too late" fix.
**Gates: 63/63 flows · 7/7 runtime theme · 32/32 axe · 22/22 · 55/55 · 40/40.**
**EVERYTHING for rounds 2-4 is now in source + www/ and NOT in any APK.
One build ships all of it.**

## ROUND 4 (2026-07-30) — dark / high-contrast modes were being defeated
"When the contrast changes we cannot see the text." Root cause was NOT a bad
colour pair: `themeFor()` wrote the light category palette as an INLINE style on
`<body>`, which beats the mode blocks on `<html>`. Dark mode therefore rendered
light `--cat-soft` under light `--ink` at **1.02:1 — invisible**. High contrast
was equally defeated, just less visibly. Fixed; `a11y-runtime-theme.js` is a new
build gate (7 assertions) because the existing contrast gate reads the
stylesheet and so passed 55/55 the whole time.
STILL OPEN from round 3 feedback: "Don't show again" destroys focus; the
verbosity trim (drop ", student 3 of 12" from tile labels).
SCOPE NOTE: Aditya clarified the app is NOT for blind users — accessible, not
blind-first. The grid redesign and Brief/Full setting are dropped.

## ROUND 3 (2026-07-30) — stale live region. FIXED, needs a new APK.
"On Today, TalkBack reads out Saksham School / enter your login ID."
`#srStatus` kept the school-pick announcement forever; `.visually-hidden` is
clipped, not hidden, so it stayed readable beside every later screen.
Surfaced only after Mansi REINSTALLED, because the other phone had a saved
session and skipped sign-in entirely — NOT a speed or speech-rate difference.
`#sbLive` and `#cmdLive` had the same flaw. All three self-clear now and are
dropped on navigation once written. FLOW 9 fails the build on a regression.
**Gates: 57/57 flows · 22/22 · 55/55 · 40/40 · axe clean · 546 controls.**
**BLOCKING: needs ./scripts/build.sh + assembleDebug on the Mac — not in any APK.**

## ROUND 2 FEEDBACK (2026-07-30) — one defect, fixed, NOT yet on his phone
Reviewer confirmed FIXED: student names, and stopping a sound from the pad.
Still broken then: after sign-in, TalkBack recited the sign-in page.
CAUSE: `btn.disabled = true` as a double-tap guard blurred the button he had
just pressed → focus to `<body>` → TalkBack reads the window from the top, and
`handleLogin` held that across two awaits before painting. Three more sites had
the same pattern. All four now use `lockBtn`/`unlockBtn` (aria-disabled + busy
flag); CSS matches `[aria-disabled="true"]` so sighted users see no change.
`a11y-flows.js` FLOW 8 now fails the build on the banned pattern.
**Gates: 51/51 flows · 22/22 default look · 55/55 contrast · 40/40 · axe clean.**
**NEXT: Aditya must run ./scripts/build.sh + assembleDebug and send the APK —
the fix is in git and www/, but NOT in any APK yet.**

## STATE (2026-07-29) — accessibility work reviewed by a blind person, round 1
`feat/a11y-blind-teacher`, **pushed**, in sync with origin. Built and verified on the Mac.
NOT merged to main on purpose — the reviewer is mid-loop and fixes should land
here, not on main.

The build went to a blind reviewer. He found **two real defects**, both traced
to specific lines and fixed the same day:

1. **Selecting a student never spoke the name.** Activating a toggle makes
   TalkBack announce the STATE only; it does not re-read the button's name. The
   one thing that did speak was `#rosterCount`, and it carried a bare count
   ("3 of 12 selected"). He tapped a face, heard a number, and could not tell
   WHICH child. Now: "Vaishu selected. 3 of 12 selected." `#rosterCount` is no
   longer a live region; announcements go through the shared `#srStatus` via a
   new `announce()` (speak without showing a visible toast).
2. **"TalkBack reads everything from the start."** `paint()` honoured
   `skipLedeFocus` by moving focus NOWHERE — innerHTML had destroyed the focused
   node and nothing replaced it, so TalkBack lost its cursor and its recovery is
   to read the window from the top. Hit on the child picker, which passes that
   flag when returning from adding a child. Now that path focuses the NEW
   child's tile, and `paint()` has a next-frame safety net: if focus is parked
   on `<body>` or outside the new screen, fall back to the heading.

He also reported **difficulty pausing sounds**. Traced and worse than it
sounded: when a sound starts his cursor is ON the pad, but Pause sat THIRD in
the transport row behind ~20 pads, the track name, group label and seek bar —
and tapping the same pad again RESTARTED it from zero, so the obvious instinct
made it worse.
- The pad is now a **toggle**: tapping a playing pad stops it. Zero navigation.
- **Confirmed with Aditya that this costs sighted teachers nothing** — they play
  a sound, let it FINISH, then tap to replay. They never tap mid-playback (they
  use the transport button). A tap after the sound ends still replays, and
  there is a flow assertion pinning exactly that.
- `stopPad()` stops and rewinds rather than pausing: for a 3-second drill sound
  resuming from the middle is never what anyone wants.
- The pad's NAME tracks state ("Play dog" / "Stop dog"). For a screen-reader
  user discoverability lives entirely in the label.
- Play/Pause moved to FIRST in the transport DOM order; CSS `order` keeps the
  visual row identical (shuffle · prev · play · next · repeat, play centred).
- Starting a sound announces its length ("Playing dog, 3 seconds") once
  metadata loads, so he knows whether to hunt for stop or just wait.
- Repeat-one says what it means: "will loop until you stop it" — the only mode
  with no natural end.

**NEARLY SHIPPED A REGRESSION.** The first cut also flushed pending
announcements in `paint()`, on the reasoning that a message queued on the old
screen should not play on the new one. That kills "Saved" — almost every
announcement here describes the action that CAUSED the navigation.
`a11y-flows.js` caught it. The reasoning is now a comment in `paint()`.

**Green at 2026-07-29 wrap:** 40/40 tests · 22/22 default-look · 55/55 contrast
(1 advisory) · **43/43 flows** · **31/31 a11y assertions** · 21 screens
axe-clean · 546 controls, zero exceptions. The 1x default look is unchanged and
proven on every build.

## Done 2026-07-29 — the whole day
- [x] Reviewer defect 1: student name spoken on selection (`1219e2d`).
- [x] Reviewer defect 2: `paint()` never leaves focus destroyed (`1219e2d`).
- [x] Sound pad is a toggle; Play/Pause first in reading order; duration
      announced; repeat-one warns it loops (`fe8beee`).
- [x] `showActivity` never read `opts.skipLedeFocus` (it keys off `focusForm`)
      — two callers were passing a no-op. Removed.
- [x] **Media loss + recovery.** `faces/*.jpg` stashed in `/tmp` for a
      consent-clean build; macOS cleared it; gitignored so no second copy
      existed. **Recovered from the emulator's installed APK** — every build
      carries the media at `assets/public/faces/`, which makes ANY INSTALLED
      BUILD A BACKUP. `scripts/recover-faces.sh` automates the search
      (see `git log` for the tooling commit). `~/om-media-backup/` now exists and was verified complete on 2026-07-30
      (39 audio, 22 sounds, 2 faces, 8 videos). Getting it OFF the Mac is still open.
- [x] RUNBOOK corrected three times over: never stash media in `/tmp`; `cp`
      then `rm`, not `mv`; no inline `#` comments in pasteable snippets
      (interactive zsh does not honour them); emulator must be BOOTED before
      `installDebug`.
- [x] Consent-clean APK built and verified (`grep -c faces/` → 0).

## STATE (2026-07-28) — the accessibility pass itself
Decision: **TalkBack-native**, not self-voicing. Users remain sighted teachers
→ **Play Store 18+ declaration unchanged**.

axe-core over all 21 screens found the baseline strong (zero div-onclick, focus
already moved to `.lede`, focus trap on the help sheet) — ONE minor violation
total. Every real defect was invisible to axe:

1. **Narration language buttons had no `lang`** — Devanagari/Tamil/Bengali read
   by an English voice = noise. The switcher was unfindable.
2. **Child detail had no heading to focus** — that screen announced nothing.
3. **Modals leaked** — `aria-modal` alone; swiping past the last control walked
   out behind the scrim. Now `inert`, depth-counted.
4. **Live regions were assertive** — they interrupted TalkBack *while the drill
   sound was playing*.
5. **The seek slider ignored ArrowUp/Down** — exactly the gesture TalkBack
   sends, so it was unreachable by touch.
6. **Everything was px** — a low-vision teacher could not enlarge anything.
7. **No collection said how big it was.** Every grid was a `<div>` of labelled
   `<button>`s. Containers are now `role="group"` with their size, items carry
   their position ("Vaishu, student 3 of 12"), records read as one sentence.

Plus **Settings → Display**: text size (4 steps), high contrast, dark
background — persisted, applied before first paint. Type/spacing moved to rem;
large-text repairs gated behind `data-text-scale="up"` so the 1x look is
unchanged. `forceDarkAllowed=false` on both Android themes.

### Pre-handover bug hunt (2026-07-28) — six defects, all of which passed the audit
1. **Record values were about to be UNREADABLE** — the composed summary sat in
   an `aria-label` on a roleless `<span>`; ARIA 1.2 prohibits that on
   `role=generic` so it is DROPPED, and the visible chips were aria-hidden.
   **RULE: if a screen reader must hear it, put it in the DOM as real text.**
2. **Login stranded you** — picking a school injects the credential fields with
   no announcement. Focus now moves into the login-ID field.
3. **"Saved" was never spoken** — the repaint's focus move pre-empted the
   pending polite announcement. Fixed centrally in `toast()`.
4. **The batch flow swapped children silently** — a teacher who cannot see the
   swap keeps scoring into the NEXT child's form. Data that looks valid and is
   not. Card heads are `<h2>` and `batchShow()` focuses them.
5. **Two layout regressions I introduced** — `.sumrow` is flex with
   `.sumres{flex:1}` and an aria-hiding wrapper collapsed three flex children
   into one; `.bcard-head` became an h2 without resetting UA defaults.
6. **`pickSeg`/`handleSave` had no null guard** — a tap racing a re-render
   threw, and a thrown handler here is SILENT.

## Verification gates — all wired into `./scripts/build.sh`
| Script | What it protects |
|--------|------------------|
| `a11y-contrast.js` | real WCAG ratios, all four colour modes (55/55) |
| `a11y-nochange.js` | rem token parity + no a11y rule leaks into the 1x design (22/22) |
| `a11y-flows.js` | sign in, save, batch scoring, sound stop, dialogs (43/43) |
| `a11y-smoke.js` | 546 controls activated, nothing throws |
| `a11y-audit.js` | axe over 21 screens + 31 app-specific assertions |
| `a11y-preview.js` | 5 screens x 6 modes → `docs/a11y-preview.html` (for the designer) |
| `recover-faces.sh` | pull gitignored media back out of any installed APK |

`docs/A11Y-TALKBACK-TESTS.md` is the manual run (screen curtain ON) plus an
honest list of what a blind teacher still cannot do.
`docs/RUNBOOK.md` is build-and-ship.

## STATE (2026-07-22) — repo audit + "block filling" color redesign
Two threads this session, both mostly hand-off-to-Mac.
**(1) Section color zones (Draft 2)** — manager wants COMPLETE BLOCK FILLING,
not white gutters: each record-screen region is now a full-colour band. The
accessible `--code-*` palette is REMAPPED from field-types to SECTIONS: amber =
who (`.activechild`), blue = listen (`#soundboardPanel`/`#commandBoardPanel`,
recoloured by overriding `--cat` so the player accents turn blue too), green =
score (`#formPanel`, stays the elevated hero), plum = history (past results,
scoped via a new `.results` class so the About panel's `.panel.quiet` is
untouched). Draft-1 field code PRESERVED inside the green form as a 4px colour
LEFT-EDGE on inset near-white cards (not a full tint — tint-on-tint muddies
contrast). 55-line scoped CSS block at the END of styles.css (revert = delete
the block) + one-word class hook in app.js. `activities.js` untouched.
Committed on `feat/section-color-zones` as `b705487` — PENDING emulator verify.
Tests 40/40, app.js parses, CSS braces balanced. NOT built/merged/pushed.
**(2) Backend P0 audit** — deferred by Aditya to a later chat, findings captured
in MEMORY. Headline: the `Cloud` seam has ONLY `signIn`+`enrolChild` — records
and video have NO client cloud path (confirmed: no `.upload(`/`storage.from` in
source), while `schema.sql` already has the `records` table + `videos` bucket
ready. Plus two un-backfillables (offline-enrolled children are un-syncable by
FK; stale `shell-login-home` branch pre-dates the file split — delete it).
## STATE (2026-07-21 pm) — sidebar drawer, record color code, Android back fix
Follow-on session after the design overhaul. Sound `?` help COMMITTED
(`ab59713`); the app-shell changes (drawer + color code + back fix) are in the
working tree with ONE commit still PENDING on Aditya's Mac — the sandbox can't
write git lock files (see standing reminders). Headlines: the ⋮ overflow menu
became a left slide-in ☰ DRAWER (teacher identity head · About/FAQs/Settings ·
sign-out + build-number foot; renders only on the signed-in landing, moved to
the leading header edge). NEW SCREENS — FAQs (6 draft Q&A, content-team owned)
and Settings (narration language, sets audioLang app-wide + disables untranslated
langs · Show-tips-again · Manage data · Export). About gained a "who's behind
this" panel (IIT Delhi + NCAHT pilot) + a version line. RECORD-FORM semantic
COLOR CODE (Draft 1, tinted blocks): amber counts · green judgment (result +
mastery) · blue notes · plum video — via buildField so batch/group inherit;
forms, checkboxes, Save left uncoded. ANDROID BACK FIX: `@capacitor/app` 8.1.1
installed + backButton listener routes system back through in-app nav (dialog →
help → drawer → chevron; double-press-exit on Home). Root cause: innerHTML
screen swaps = no webview history + Capacitor 8 predictive-back doesn't walk it +
the plugin was never installed → back exited the app. The popstate history
sentinel (first attempt) failed on device; kept as web-preview fallback only.
Verified: 40/40 suite, parse OK, 8/8 color assertions, contrast 6.2–9.7:1.
APP_VERSION → 0.9.0 (21 Jul 2026).
## STATE (2026-07-21) — full UX overhaul landed; batch flow replaces single-child
Big design session, all committed on main (through `0efdedb`), working tree
clean, ~6 commits ahead of origin at wrap-up (push may already be done).
Details in MEMORY.md's 2026-07-21 section. Headlines: BATCH FLOW is now THE
flow (roster multi-select → focus-flow scoring one student at a time →
review → one record per scored child; `Achieved` derives from the score;
skipped = no record). ? sheet is a centred cuboid MODAL; window.confirm
replaced by styled askConfirm dialogs; activity cards = media-forward with
object still-life SVG thumbnails (no video frames — clips not final);
contextual onboarding (hints + persistent ? callout, per-teacher flags);
home-dot removed from header; font Inter → Arimo. NOTE for older docs: any
instruction that says "card → child picker → record screen" now reads
"card → roster select → focus flow".
## STATE (2026-07-14 pm) — reconcile resolved; repo clean
Soundboard player code confirmed ON main (`git grep buildSoundboard HEAD -- app.js`
= 2 hits — it landed via an earlier merge, outside the recent-log window).
All feature branches (feat/cloud-sync, feat/password-login, feat/sop-content,
feat/soundboard) fully merged into main and pruned local + remote;
`shell-login-home` kept (2 unmerged prototype commits). Stale sound-direction
merge instruction removed from NEXT (that work was already on main,
`f406c55`/`21d1c7d`). Remaining work is Mac-side: SLT emulator verify,
SLT narration, toy-faded demo.
## STATE (2026-07-14 am) — Straight Line Travel done; soundboard finally committed
Straight Line Travel (Category 4) rebuilt from 3 demo videos into THREE
stages — Without Cane → With Cane + Push Toy → With Cane (toy faded). The
push toy on the cane is a stigma-breaking storyline (positive association),
a scaffold meant to fade → hence 3 stages. All app-sound (`soundboard:true`);
record fields = steps + times-drifted + mastery + notes. Commit `9ee6e2c`,
pushed. Demo videos wired (`demo-slt-nocane.mp4`, `demo-slt-withcane-toy.mp4`);
toy-faded `slt-withcane` has no demo yet.
DRIFT FOUND: the soundboard two-tab was NEVER actually on main — it was
uncommitted in the working tree despite last session's notes saying "pushed".
Landed today as `936e05e`. The soundboard PLAYER CODE also isn't in main's
recent log → likely on an unmerged branch; RECONCILE (NEXT). Emulator verify
of SLT still PENDING (Aditya pushed before the clean install).
## Manager review loop (decided 2026-07-13)
Mansi reviews on HER PHONE via the debug APK — no emulator, no Play Store
yet. Per update: `./scripts/build.sh` → `cd android && ./gradlew
assembleDebug` → rename `app-debug.apk` with the date → WhatsApp as a
DOCUMENT (or Drive). Her first install: allow-from-source once + Play
Protect "Install anyway". Login for review: Saksham / `saksham01` / any
non-empty password (offline stub — password not verified until the cloud
flag flips; told to Mansi). CONSENT CAVEAT: bundled faces/ photos ride
along in every APK — strict option is to empty faces/ for her builds.
Debug key = only Aditya's Mac can build over-installing updates.
## Done 2026-07-14 (Straight Line Travel three-stage + soundboard commit landed)
- [x] **Category 4 rebuilt from 3 demo videos into THREE stages**:
      `slt-nocane` (travel by ear) → `slt-withcane-toy` (push toy on the cane —
      the stigma-breaking storyline) → `slt-withcane` (toy faded, plain cane —
      goal state). App sound source (`soundboard:true` on all three). Fields:
      `steps` (count) + `veer` "Times drifted off line" (count) + `result`
      (mastery) + `notes` (teacherNotes). Commit `9ee6e2c`, pushed to main.
      Mechanics confirmed by Aditya (push toy = positive-association scaffold
      meant to fade — hence motivate → skill → independence). Hindi drafts
      machine-drafted, flagged. `slt-withcane` meaning shifted (was "With Cane
      (Push Toy)") — pre-pilot orphan records accepted knowingly.
- [x] **Demo videos** `demo-slt-nocane.mp4` + `demo-slt-withcane-toy.mp4`
      compressed (~640px CRF30) and wired; gitignored, build-copied.
      `slt-withcane` (toy-faded) has NO demo filmed yet → `videoFile: ""`.
- [x] **Applied block-only** to Category 4 (backup + diff proving scope), then
      committed as its OWN commit, kept separate from the soundboard two-tab.
- [x] **Landed the soundboard two-tab** that had been sitting uncommitted:
      commit `936e05e` (staged the `SOUND_LIBRARY` hunk alone via `git add -p`,
      keeping SLT in a separate commit). Both pushed: `4810a2c..9ee6e2c`.
- [!] **DRIFT LESSON (2026-07-14):** `git log` showed main still on the 4-group
      `SOUND_LIBRARY` — last session's "committed + pushed" note was false; the
      two-tab lived only in the working tree. The soundboard PLAYER CODE is
      likewise missing from main's recent log. **RULE: verify `git log` /
      `git status` before writing "done / pushed"; reality lives in git, not the
      notes.** Also delete throwaway `.bak` files from the tree (removed
      `activities.js.sltbak`) so they don't look like a second source file.
## Done 2026-07-14 (soundboard two-tab)
- [x] **Sound Library → two tabs.** Old groups (Animals / Household /
      Traffic & Outdoors / Instruments) collapsed into **Recommended sounds**
      (Clap, Cuckoo, Whistle, Dog, Cat — listed first, so it is the default
      open tab) and **Sounds** (the other 17). Driven purely by the `group`
      field in `SOUND_LIBRARY`; no code touched. Shared library, so the two
      tabs now show on EVERY `soundboard:true` activity (Sound, Sound +
      Direction, Straight Line Travel), not just Category 3.
- [~] Applied via a **surgical in-place patch** to the `SOUND_LIBRARY` block
      ONLY (abort-unless-exactly-one-block + byte-identical-outside guard +
      `.soundbak` backup + printed diff). Emulator-verified. **CORRECTED
      2026-07-14: this was NOT actually committed/pushed last session — it sat
      uncommitted in the working tree and only landed on main today as
      `936e05e`.** See the drift lesson above.
- [x] Added `sounds/clap.mp3` + `sounds/whistle.mp3` (synthetic placeholders,
      generated locally). `sounds/` is gitignored → NOT in the repo; a fresh
      setup needs them re-copied. Real recordings flagged for content team.
- [!] **Incident + lesson (2026-07-14):** an earlier whole-file `cp` of
      `activities.js` from the stale GitHub-synced copy reverted richer local
      work (Direction command boards, Sound + Direction restructure). Recovered
      via undo. **RULE: never overwrite the whole `activities.js` from a synced
      snapshot — edit only the targeted block, with a backup and a diff that
      proves nothing else moved.**
## Done 2026-07-13 (second wave pm — Sound + Direction, `feat/sound-direction`)
- [x] **Category 3 rebuilt from the four SOP demo videos (#2)**: `Near-Far`
      (ears only) → `Near-Far with Cane` (cane points to / touches source) →
      `Counting Steps — Group` → `Counting Steps — Individual` (steps count +
      mastery). Old ids snddir-clap / snddir-cane-count retired knowingly.
      SOPs ≤4 crisp steps deduced from video frames (sandbox ASR blocked:
      HF + Sarvam both 403 behind proxy — frames-only workflow held up);
      craft lives in facilitatorNote; Hindi drafts machine-drafted, flagged.
- [x] **Group-activity seam** (`group:true` in activities.js, content-team
      editable): category card gets a Group pill and routes STRAIGHT to the
      record screen; child picker guarded; "Whole group" bar replaces child
      bar; handleSave writes `{group:true, values}` — no researchId/profileId;
      display name "Group"; CSV Research ID column = `GROUP`; video evidence
      control not rendered and commit skipped (per-child consent can't cover
      an unidentified group — fails closed, DPDP).
- [x] **Demo videos wired + compressed**: 87→23 MB (solo), 19→2.8, 18→2.0,
      6→1.1 MB (640p CRF 30/31). Filenames demo-snddir-*.mp4, gitignored,
      build-copied by step 3b.
- [x] **Tests: SUITE 8 (group seam), 40/40.** Full `./scripts/build.sh` green
      in sandbox (school-ID guard, parse, copy, cap sync, byte-compare).
## Done 2026-07-13 (Direction command board, `feat/sop-content`)
- [x] **Direction category restructured** (SOP video #1 received): `Basic
      Commands` (left/right/forward/backward/jump/clap/stop/turn-around) +
      `Advanced Commands` (N/S/E/W; intercardinals as commented adds).
      Ordering grounded in O&M progression (egocentric → cardinal; TAPS/APH).
      Old ids dir-leftright/dir-frontback retired — pre-pilot, orphaned test
      records accepted knowingly.
- [x] **Command board shipped** (commit `b30372f`): tappable pads that SPEAK
      the cue from bundled Sarvam mp3s (`audio/commands/{id}_{lang}.mp3` —
      derived-path contract with CB.play()); spoken text under English label;
      `Surprise me` anti-prediction random; language follows `audioLang`;
      hi-fallback + toast when a file is missing; CB.reset() on nav.
      Commands are content-team editable in activities.js.
- [x] **`scripts/generate-command-audio.js`** — sibling of generate-audio.js,
      same voice (shubh), pace 0.9, dedupes shared ids, skips empty langs.
- [x] **build.sh step 3b** — `audio/`, `sounds/`, `demo-*.mp4` now copied to
      `www/` by the build (was manual).
- [x] **SOPs rewritten from demo video #1** + facilitator notes; video wired
      as `demo-direction-basic.mp4` (root, gitignored like all media).
      Tests 35/35.
## Done same day, second wave (2026-07-13 pm — Direction polish + record redesign)
- [x] **Command cues → ENGLISH only** (`8ec64d3`): label IS the cue,
      `audio/commands/{id}_en.mp3`, voice **priya** (v3 default shubh tested
      flat for kids; alternates listed in the script). Sarvam multilingual
      belongs to SOP narration, not cues.
- [x] **English SOP narration first-class + DEFAULT** (`1fdf95e`): 'en' speaks
      sop[] itself (no translation needed), added to AUDIO_LANGS first +
      generator; switcher renders even without translations. **ta/bn stay
      disabled by design** until the content team delivers translated text —
      no machine translation for teacher-facing content; not a pilot blocker
      (all 3 pilot schools are Hindi-belt). Direction Hindi drafts are
      machine-drafted and STILL NEED content-team verification.
- [x] **Record form redesign** (`5849750`): one-tap mastery scale (Got it /
      With help / Not yet — plain-language independent/prompted/unable) + new
      collapsed **Teacher's notes** section (progressive disclosure). New
      generic field types `mastery` + `teacherNotes`.
- [x] **SOPs cut to 4 short steps** each; craft moved to facilitatorNote;
      Hindi re-aligned 1:1.
- [x] **Demo children** Aditya + Vaishu: seeded on empty installs, photos from
      gitignored `faces/` (build-copied); boot REPAIR pass attaches photos to
      photo-less same-name profiles (`1ea7cd2`). PRIVACY: bundled real-child
      photos need guardian consent before any build leaves the team.
- [x] **`android:allowBackup=false`** — Google was silently backing up child
      data AND resurrecting old profiles across reinstalls. LOCAL-ONLY change
      (android/ is gitignored) — re-apply if android/ is ever regenerated.
- [x] Names → **Basic / Advanced**; category-level **? sheet** (help[] +
      helpVideo in activities.js — any category can opt in) (`ce01be1`).
- [x] Both audio generators read SARVAM_API_KEY from .env (`82548fd`).
## Done 2026-07-06 pm (cloud wiring, `feat/cloud-sync`)
- [x] **Code wiring complete, behind `CLOUD_SYNC` flag (default OFF).**
      Flag OFF = byte-identical offline pilot; tests 35/35. Commits `9b0a7a0`
      (wiring) + `d68f429` (dashboard SQL), on `feat/cloud-sync`.
      - Vendored `@supabase/supabase-js` 2.110.0 UMD as root `supabase.js`
        (NO CDN); `<script>` before store.js; in build.sh copy + verify lists.
      - `Cloud` seam appended to store.js (lazy init so flag-OFF builds never
        touch it): `signIn()` maps loginId → `<id>@test.local`
        (`CLOUD_AUTH_DOMAIN`; a full typed email passes through), `enrolChild()`
        wraps the `enrol_child()` RPC with numeric/date null-coercion; all
        errors return `{ok:false, offline, error}` — nothing throws.
      - Save-child: NEW child + flag ON → RPC mints `research_id` server-side;
        offline → blocked with a teacher-facing message; EDITS stay local;
        `newResearchId()` demoted to legacy/migration path only.
      - `verifyCredentials()` → `signInWithPassword` behind the flag.
        `PILOT_LOCAL_AUTH=true` fallback fires ONLY when the server is
        UNREACHABLE — a rejected password is always final. A fallback login has
        no cloud session, so enrolment still refuses until a real online
        sign-in.
- [x] **`supabase/pilot-dashboard-setup.sql`** — the ~10-min dashboard prep as
      runnable sections (school re-seed insert-first/FK-safe, private `videos`
      bucket, test-teacher provisioning, verification query). Step 3a (create
      auth user) is dashboard UI, rest is SQL.
- [x] Stale `.git/index.lock` from a sandboxed git run cleared — repo healthy.
- [x] Dashboard prep DONE 2026-07-06 (driven via browser, each step verified):
      schools re-seeded to the 3 `sch_*` rows; `videos` bucket private
      (`public=f`); `saksham01@test.local` created (Aditya holds the password),
      `app_metadata.school_id=sch_saksham_noida`, linked ACTIVE teachers row.
      Verify query returned the expected single row. Cloud path is testable —
      device-test matrix lives in NEXT above.
## Done earlier (2026-07-06 — workflow hardening + file split)
- [x] **`scripts/build.sh` — the ONE build command.** Replaces the remembered
      `cp … && npx cap sync` ritual. Steps: school-ID consistency guard
      (app.js seedSchools vs supabase/schema.sql — fails the build on drift),
      JS parse check (store.js + app.js in load order), copy all web assets to
      `www/`, `npx cap sync android`, byte-compare built assets vs `www/`.
      First real run on the Mac: all green.
- [x] **File split shipped** (`refactor/file-split`, merged + pushed).
      `index.html` (3,024 lines) → `index.html` markup shell (87 lines) +
      `styles.css` (look + design guardrails moved to its header) +
      `store.js` (storage seam ONLY — the cloud swap point) + `app.js`
      (rendering/nav/behaviour). Load order: activities.js → store.js → app.js.
      Zero behavior change: every original line accounted for; tests 35/35;
      emulator-verified after `gradlew clean installDebug`.
      test-batch1.js now inlines all three scripts; README / CONTRIBUTING /
      ARCHITECTURE / generate-audio.js advice all updated.
- [x] **`supabase/schema.sql` seed fixed** to canonical `sch_*` school IDs
      (the RLS-mismatch bug caught 2026-07-03). Committed.
- [x] **Manager status report** → `docs/handoffs/OM-Status-Report-2026-07-06.pdf`
      (3 pp: status by area, last-session fixes, next steps, risks; no names).
- [x] Leftover MEMORY/TRACKER wrap-up from 07-03 committed; all work pushed
      (`main` = `ef4eae1` + wrap-up).
## R&D DECISIONS — locked 2026-07-03
1. **Architecture A** — server-assigned child ID at enrolment (online-only
   enrolment, one moment of connectivity per child; assessments stay offline).
2. **Video IS required** — consent gate + uploader ship in the pilot.
3. **Multi-device-per-child: YES** — same child joins on one server ID.
4. **Analysis: BOTH** longitudinal and cross-child (research_id is the join
   key; both indexes in schema).
## Production roadmap (ordered by rework risk)
- [x] **1. R&D email** — sent + answered (decisions above).
- [ ] **2. Cross-device child ID** — app wiring DONE 2026-07-06
      (`feat/cloud-sync`, flag OFF). Remaining: dashboard steps + device verify
      + merge (NEXT, above).
- [x] **3. Video consent gate** — DONE 2026-07-03 (verifiable envelope,
      audit-honest withdrawal, erasure prompt, F9 file-level deletion,
      consent-evidence photo + serial).
- [ ] **4. Supabase auth swap** — code DONE 2026-07-06 (`feat/cloud-sync`,
      flag OFF; unreachable-only local fallback). Remaining: device verify.
- [ ] **5. Uploader + cloud storage** — bucket `videos` (private), path
      `{school_id}/{research_id}_{ts}.{ext}`. Must re-check `videoConsent`
      before upload; erasure honoured server-side (delete-everywhere);
      re-review `DPDP-COMPLIANCE-MAP.md` before shipping.
- [ ] **6. Row-Level Security** — policies deployed with schema; VERIFY with the
      test teacher once wired (cross-school read must fail). DECISION flagged
      for legal: child name/DOB server-side behind RLS (multi-device picker);
      research extracts stay research_id-only.
- [x] **7. Video memory fix** — DONE 2026-07-03 (3 MB chunked copy).
- [ ] **8. Play Store release** — RESEARCHED 2026-07-31, nothing built yet.
      The pilot only needs the INTERNAL track (100 testers, no review, live in
      minutes) — not production. Blocked on: legal (privacy policy needs the
      fiduciary entity + grievance officer before it can be hosted at a public
      URL, which gates every track), Mansi's account-type call, and the missing
      signing setup. Technically missing: no keystore, no `signingConfigs`,
      `versionCode` still 1, and Play needs an AAB not an APK. Version drift
      between `build.gradle` (1.0) and `APP_VERSION` (0.9.0). Store listings
      are public, so `faces/` must be empty and the demo children must never
      appear in a screenshot. Detail in MEMORY.
## Waiting on humans
- [ ] **Legal:** fiduciary entity of record, grievance officer, effective date,
      Rule 10 due-diligence sign-off, educational-institution exemption answer.
      All flagged in `compliance/DPDP-COMPLIANCE-MAP.md`.
- [ ] **Content team:** verify + typeset Hindi consent form; translated SOP
      text (audio pipeline still blocked on this).
- [ ] **Content team:** real recordings for `clap.mp3` + `whistle.mp3` — the
      two Recommended-tab sounds added 2026-07-14 are synthetic placeholders
      (usable, but swap when real audio lands).
- [ ] **Pilot manager:** real teacher names for the seed.
- [ ] Print consent forms WITH serial numbers once legal placeholders filled.
## Backlog
- [x] ~~File split~~ — DONE 2026-07-06.
- [ ] Consent envelope for BROADER assessment data (Part A of paper form) —
      mirror in-app only if legal asks.
- [ ] Offline-enrolment queue — only if the online-only enrolment rule proves
      painful in the field (watch Kullu). Flagged 2026-07-06, not committed to.
## Standing reminders
- **Every code session ends with `./scripts/build.sh`** (it does the copy,
  sync, ID guard, parse check, and built-asset verify). Stale emulator →
  `cd android && ./gradlew clean installDebug`.
- Source of truth = root `index.html` + `styles.css` + `store.js` + `app.js`.
  `www/` is build output (gitignored) — never edit.
- Media (`audio/`, `sounds/`, `*.mp4`) stays gitignored.
- Feature commits stay focused — MEMORY/TRACKER committed separately.
- **Verify `git log` / `git status` before writing "done / pushed"** — the
  soundboard "pushed" claim was false for a week (2026-07-14 lesson).
- **Git commits happen on Aditya's Mac, not the sandbox.** The mounted repo
  blocks file DELETION anywhere under `.git`, so git can't clear its own lock
  files: one commit per sandbox run at most (the second aborts on an orphan
  `.lock`), and any leftover `.git/index.lock` / `.git/HEAD.lock` must be
  `rm`'d on the Mac — from the REPO ROOT, not `android/`.
- `.env` holds `SARVAM_API_KEY` (gitignored).