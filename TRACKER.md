# TRACKER.md — O&M Cane Training
_Last updated: 2026-07-29 (blind-reviewer round 1: two defects fixed, sound stop)_

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

## NEXT (2026-07-29) — in order
- [ ] **Send the new build to the reviewer** (consent-clean: see the runbook
      section on emptying `faces/`, and verify with
      `unzip -l app-debug.apk | grep -c faces/` → 0).
- [ ] **Ask him three things specifically:**
      1. Selecting a student — does it say the NAME now?
      2. Tapping the pad again to stop — did he FIND that himself, or only
         because he was told? If the latter, the label change is not carrying
         its weight and a spoken hint is needed.
      3. Does it still read from the top anywhere? If yes, WHICH SCREEN — that
         one detail pins it immediately.
- [ ] **Then merge:** `git checkout main && git merge feat/a11y-blind-teacher`,
      delete the branch, push. Hold until his round-2 feedback is in.
- [ ] **Get `~/om-media-backup` OFF the Mac** — Drive or an external disk. It
      holds audio (28), sounds (22), 8 demo videos, 2 faces. Survived `/tmp`
      today; would not survive the laptop.
- [ ] **DECISION NEEDED — video evidence + a blind teacher.** The one thing with
      NO non-visual equivalent: he cannot frame a shot, cannot tell whether the
      child is in it, cannot check the clip after. Filming a child you cannot
      see, for a research record, is a consent question too. Options: (a) leave
      it — video is optional per-child and he simply does not use it; (b) a
      sighted colleague captures video when needed; (c) hide the control when a
      screen reader is detected — unreliable to detect, paternalistic when
      wrong. Recommend (a) or (b). Needs Aditya + Mansi, legal if (b).
- [ ] **Designer:** send `docs/a11y-preview.html` (regenerate with
      `node scripts/a11y-preview.js`) to the Flipkart reviewer. High-contrast
      mode deliberately overrides the "one accent, one shadow tier" guardrails
      — a considered exception for low vision, worth a second opinion.
- [ ] **Untested, flagged honestly:** braille display, Switch Access, Voice
      Access. If any pilot teacher uses one, test before assuming.
- [ ] **Content team:** three new FAQ entries (text size, easier to see, screen
      reader) are DRAFT copy. Also: the demo clips are SILENT — the `?` sheet
      now says so, but a narrated demo would remove the caveat.
- [ ] **Then resume the roadmap** — backend P0 (deferred 2026-07-22) and the
      `feat/section-color-zones` emulator verify below. A dedicated UI session
      is also queued (Aditya, 2026-07-29).

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
      (see `git log` for the tooling commit). `~/om-media-backup/` now exists.
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
## NEXT (2026-07-22) — in order
- [ ] **Aditya, Mac — finish this session's git (sandbox hit the lock wall):**
      `cd ~/Desktop/om-app && rm -f .git/index.lock .git/HEAD.lock` then
      `git checkout -- app.js styles.css` (discard the messy working copies —
      they're safe in commit `b705487`), `git reset`, then `git checkout main`
      (carries the MEMORY/TRACKER edits onto main), `git add MEMORY.md TRACKER.md
      && git commit -m "MEMORY/TRACKER: 2026-07-22 wrap"` and
      `git push origin main feat/section-color-zones`. `git log --oneline -3` to confirm.
- [ ] **Aditya, Mac — verify the color zones:** `git checkout feat/section-color-zones`,
      `./scripts/build.sh`, `cd android && ./gradlew installDebug`. Open a
      SOUNDBOARD activity (Counting Steps) to see all four bands at once. Check
      the blue player accents, the green form with edge-accent fields, plum past
      results. If it reads well → `git checkout main && git merge feat/section-color-zones`,
      delete the branch. Tweak hues first if the manager wants.
- [ ] **Later (deferred): backend P0** — solve order 3→2→1: cloud-first enrolment
      + `backfill_child` RPC for existing local kids; device-test matrix (esp.
      cross-school RLS); then `Cloud.syncRecords()` + `Cloud.uploadVideo()` +
      `syncPending` + delete-everywhere. Two schema gaps to fix: group records
      (research_id NOT NULL blocks them) and teacher_id FK (resolve server-side).
- [ ] **Also delete** the stale `shell-login-home` branch (local + origin) once
      its BYOD/child-id research is confirmed captured in MEMORY — merging it
      would revert the file split.
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
## NEXT (2026-07-21 pm refresh) — in order
- [ ] **Aditya, Mac:** finish the app-shell commit from the REPO ROOT (`cd
      ~/Desktop/om-app`, NOT android/): `rm -f .git/index.lock .git/HEAD.lock`
      then `git add app.js styles.css index.html package.json package-lock.json
      && git commit -m "app shell (2026-07-21): drawer, record color code,
      android back fix"`. Confirm with `git log --oneline -3`.
- [ ] **Aditya, Mac:** `./scripts/build.sh` then `cd android && ./gradlew clean
      installDebug` (CLEAN — new native plugin). Walk a deep record screen →
      system back retraces each step → Home → toast → second press exits; back
      also cancels an open confirm dialog.
- [ ] **Aditya:** `git push origin main` (refreshes the project-knowledge sync).
- [ ] **Aditya:** fresh `assembleDebug` APK → Mansi (drawer + Settings/FAQs +
      color code + back fix; batch flow already in her last drop).
- [ ] **Content:** verify FAQ copy + the Sound `help[]` wording (both drafts);
      "Other Activities" still has no help[] — add if wanted.
- [ ] Still open from prior sessions: narrated welcome (Sarvam script), run
      `generate-thumbs.sh` on the Mac, Hindi SOP verify, focus-flow 350ms timing
      check with real teachers (details in the design-overhaul NEXT below).
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
## NEXT — one list, in order (2026-07-21 refresh)
- [ ] **Aditya:** `git push origin main` if not yet pushed (check `git status`).
- [ ] **Aditya:** fresh `assembleDebug` APK → Mansi via the documented loop
      below (batch flow + new design is a big review drop; login unchanged).
- [ ] **Aditya, Mac:** run `./scripts/generate-thumbs.sh` — the two SLT demo
      clips exist only on the Mac (posters unused on cards now, but the script
      + build copying stay ready for when videos finalise).
- [ ] **Content:** narrated welcome — "listen to how this app works" on the
      welcome screen (Sarvam script EN/HI + generate-audio run). Script is the
      blocker; no code slot built yet.
- [ ] **Content:** Hindi SOP drafts still machine-drafted — verify before pilot.
- [ ] **Pilot watch-item:** focus-flow auto-advance beat is 350ms — validate
      with real teachers; dial lives in batchFlowInit's setTimeout.
- [ ] Optional housekeeping: prototypes/ has 5 draft HTML files (safe to prune).
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
## NEXT — one list, in order
- [ ] **Aditya, Mac:** emulator-verify Straight Line Travel — three cards
      (Without Cane / With Cane + Push Toy / With Cane), each → child picker →
      record screen with the sound player + four fields (steps, times drifted,
      Got it/With help/Not yet, notes), `?` plays the demo (3rd card has none),
      test save lands. Stale APK → `cd android && ./gradlew clean installDebug`.
- [ ] **Aditya, Mac:** SLT English narration —
      `node scripts/generate-audio.js --only slt-nocane slt-withcane-toy slt-withcane`,
      then `./scripts/build.sh`, `cd android && ./gradlew installDebug`.
- [x] **RECONCILE the soundboard branch state — RESOLVED 2026-07-14:**
      `buildSoundboard`/`SB` IS in main's `app.js` (landed via an earlier
      merge — just outside the recent-log window checked last session).
      `origin/feat/soundboard` has 0 commits not in main; a fresh clone
      builds the player fine. Fully merged branches (feat/cloud-sync,
      feat/password-login, feat/sop-content, feat/soundboard) pruned local
      + remote; `shell-login-home` kept (2 unmerged prototype commits).
- [ ] **Film + wire the toy-faded demo** for `slt-withcane` (its `videoFile`
      is empty — no clip of plain-cane travel yet). Compress + drop in root.
- [ ] **Content team:** verify the SLT Hindi SOP drafts (machine-drafted).
- [ ] **Aditya, Mac:** emulator-verify Sound + Direction (ALREADY ON MAIN —
      `f406c55`/`21d1c7d`; the `feat/sound-direction` branch is gone, no merge
      needed; stale merge instruction removed 2026-07-14): card grid
      (4 activities, Group pill on Counting Steps — Group) → group card goes
      STRAIGHT to record screen (no child picker, "Whole group" bar, NO video
      control) → save → record shows "Group" → per-child activity still asks
      for a child and shows video control.
      Stale APK → `cd android && ./gradlew clean installDebug`.
- [ ] **Aditya, Mac (10 min):** English narration —
      `node scripts/generate-audio.js --only dir-basic-commands` (+ advanced;
      after merge add the four snddir-* ids; plain run for ALL activities
      before the next school demo). Then `./scripts/build.sh`,
      `cd android && ./gradlew installDebug`.
- [ ] **Aditya:** push everything — `git push origin main`
      (main's push is what refreshes project-knowledge sync).
- [ ] **Optional trim:** `demo-snddir-steps-solo.mp4` is 23 MB (9½ min,
      already re-encoded from 87 MB). If APK size bites, trim to the best
      ~2 min on the Mac; filename stays, no code change.
- [ ] **Cloud device test** (when the real device is handy): flip
      `CLOUD_SYNC=true`, build, install. Matrix: wrong password online FAILS;
      new child online → `OM-XXXX-XXXX` in `children`; airplane mode → new
      child blocked, edit works; cross-school RLS (second user, different
      school_id, sees none); parked video-picker test (`content://` URI →
      `commitPendingVideo`). Flag back to false after.
- [ ] **Video #4** (next chat): per-activity workflow — deduce SOP from
      video, simplify to ≤4 steps, wire demo file, mastery+teacherNotes.
- [ ] **Content team:** verify Direction + Sound + Direction Hindi SOP drafts;
      deliver ta/bn text (paste into sopTranslations → run generator — no code).
- [ ] **Consent check** before any APK leaves the team: bundled photos of the
      demo children (faces/) need guardian consent on file.
- [ ] **Legal (flagged):** group activities save no video by design (consent
      is per-child; a group clip can't be verified against unidentified
      children). If researchers want group footage, legal must define a
      group-consent envelope first.
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
- [ ] **8. Play Store release** — Data Safety drafted
      (`compliance/PLAY-DATA-SAFETY.md`); needs privacy policy at a public URL;
      target audience 18+ (teachers).
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