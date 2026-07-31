# MEMORY.md — O&M Cane Training
_Last updated: 2026-07-30 (rounds 2-4 — focus guard, stale live region, defeated display modes)_

## ACCESSIBILITY (2026-07-28 → 30, `feat/a11y-blind-teacher`, NOT merged to main)
_Don't pin a commit SHA in these files — committing the file invalidates it. Use `git log --oneline main..HEAD`._

### The scope decision — REVISED 2026-07-30, read this before designing anything
Users are SIGHTED teachers. Aditya's words: **"this app is not for the blind at
all, I just want it to be accessible."**
So the aim is **accessible, NOT blind-first**. Meet the standard, fix real
defects, keep the sighted design primary. Do NOT redesign flows around
non-visual navigation. Dropped on this basis: the grid-of-faces redesign
(summary line / heading groups / search) and a Brief-vs-Full verbosity setting —
a verbosity setting only earns its keep with two audiences, and there is one.
Mechanism stays **TalkBack-native** (semantic HTML, ARIA, focus management
driving the user's own screen reader) — NOT self-voicing via Sarvam.
Children never operate the app, so the **Play Store 18+ target-audience
declaration is UNCHANGED** and Designed-for-Families should still not trigger.
_Earlier drafts of this file said "fully operable by a blind person". That
overshot. A blind reviewer is still the best defect-finder we have — his three
rounds found real bugs — but he is a TESTER, not the target user._

### The baseline was already good
axe-core over all 21 screens found ONE minor violation. Zero `div onclick` —
all 63 handlers on real `<button>`s. `paint()` already focused `.lede`. The help
sheet already had a focus trap, Escape and focus-restore. **That is why this was
a two-day job and not a rewrite.** Every real defect was invisible to axe.

### The a11y seams now in app.js — know these before touching anything
| Function | Job |
|----------|-----|
| `moveScreenFocus(opts)` | after every screen swap: focus `.lede` → first heading → labelled `#screen`. Nothing may leave focus destroyed. |
| `setBackgroundInert(on)` | depth-COUNTED `inert` on header+main while any modal is open (a confirm can open on top of the help sheet). |
| `srSpeak(el,msg,state)` | the ONE way to write any live region. Clears, writes 150ms later, then SELF-CLEARS after `SR_CLEAR_MS`. Used by `announce`, `SB._announce`, `CB._flash`. |
| `announce(msg)` | speak without a visible toast (wraps `srSpeak` on `#srStatus`). |
| `toast(msg)` | visible half sync + `announce()`. |
| `posLabel` / `groupAttrs` | position + collection size. NOT on child tiles any more — see RULE 13. |
| `removeAfterFocus(el,pref,msg)` | remove an element containing the focused control WITHOUT destroying focus. |
| `avatarFor` / `avatarFallback` | photo with `onerror` → the child's initial. |
| `langBtnAttrs` | BCP-47 `lang` + Latin `aria-label` on narration language buttons. |
| `SB.stopPad` / `SB._padLabels` | sound pad is a toggle; its NAME tracks play state. |
| the `for(const k of Object.keys(ICON))` loop | hardens every icon `aria-hidden` at source, so future icons are covered automatically. |

### RULES — these are the transferable ones
1. **If a screen reader must hear it, put it in the DOM as real text**
   (`.visually-hidden`), never `aria-label` on a div/span. ARIA 1.2 PROHIBITS
   aria-label on `role=generic`; it is silently DROPPED. axe's
   `aria-prohibited-attr` does NOT catch it when the element has text content.
   This nearly shipped record scores as unreadable.
2. **Never flush pending announcements on navigation.** It looks obviously
   right and it is wrong: almost every announcement describes the action that
   CAUSED the navigation (`toast('Saved'); showActivity(...)`). Flushing kills
   exactly the confirmations that matter. Comment lives in `paint()`.
3. **aria-hide flex/grid children INDIVIDUALLY, never with a wrapper.** A
   wrapper makes them one flex child and the row collapses (`.sumrow` had
   `.sumres{flex:1}`).
4. **Retagging an element means resetting its new UA defaults.** `.bcard-head`
   became an `<h2>` and brought 1.5em/bold/0.83em margin with it.
5. **A thrown handler in this app is SILENT** — the control just stops working,
   with nothing announced. Null-guard anything a re-render can race. That race
   is MORE likely with a screen reader: double-tap is laggier than a direct tap.
6. **Announcements must lead with the thing you cannot get otherwise.** A
   toggle's activation announces STATE only, never the name — so a bare count
   ("3 of 12 selected") told the teacher a number and never which child.
7. **Never set `.disabled` on a control inside its own handler.** Disabling the
   focused element BLURS it; focus falls to `<body>`; the screen reader loses
   its cursor and TalkBack reads the window from the top. Use `lockBtn` /
   `unlockBtn` / `btnBusy` (aria-disabled + a busy flag). `a11y-flows.js` FLOW 8
   scans app.js for the banned pattern and fails the build.
   **Same class: never REMOVE an element containing the focused control.** That
   is what "Don't show again" did. Use `removeAfterFocus()` — move focus first,
   announce, then remove. FLOW 10 covers it. jsdom DOES blur on removal (unlike
   on disable), so that one can be asserted behaviourally — but assert AFTER the
   removal timer fires, or it passes on broken code.
8. **Speech rate masks bugs — always test one pass at a SLOW rate.** Rate does
   not change WHETHER a defect fires, only how long it stays audible: seconds at
   30, a clipped blip at 100. Fast speech hides lost focus, doubled
   announcements and interrupted utterances. And it is the LEAST fluent users
   who run slow rates — they get the worst version of every bug and are the
   least likely to call it a bug.
   **CORRECTION (2026-07-30):** an earlier draft of this rule blamed the 30-vs-100
   rate difference for the sign-in bug appearing on one phone and not the other.
   That was wrong. The real difference was STATE: the quiet phone had a saved
   session and never ran the sign-in screen at all. See Round 3 below. Rate
   affects audibility, not occurrence — do not use it to explain away a defect
   that reproduces on one device only.
9. **A live region KEEPS its last text, and that text stays readable.**
   `.visually-hidden` is CLIPPED, not `display:none`, so a spoken sentence
   remains real content in the accessibility tree, sitting beside the new
   screen where touch exploration finds it. Announcements must SELF-CLEAR
   (`srSpeak` + `SR_CLEAR_MS`) and be dropped on navigation once written.
   Distinguish from RULE 2: a PENDING announcement describes the action that
   caused the navigation and must survive; an ALREADY-WRITTEN one belongs to the
   screen being left and must go.
10. **An inline style on `<body>` beats an attribute selector on `<html>`.**
   `themeFor()` wrote `--cat*` inline, silently defeating BOTH
   `[data-theme="dark"]` and `[data-contrast="high"]`, which define their own
   mode-correct set. In dark mode that put the light `--cat-soft` (#e2efe5)
   under light `--ink` (#f2ede3) — **1.02:1, invisible**, on every surface with
   `background:var(--cat-soft)` and no colour of its own. Fixed by having
   themeFor stand down when a mode owns the palette, and re-running it from
   `applyDisplayPrefs()` so a runtime toggle cannot strand old values.
11. **A contrast test that READS the stylesheet proves what the CSS says, not
   what the teacher sees.** `a11y-contrast.js` passed 55/55 throughout the
   above, because the value it checked was never the value that rendered.
   `a11y-runtime-theme.js` now drives the real app and is a build gate.
12. **Do not put a position count in a per-item label.** It is useful once and
   noise on every swipe, and it pushes the item's NAME behind a state word,
   since screen readers announce state first. Collection size belongs on the
   container (`groupAttrs`), not on each child.
13. **jsdom cannot see focus bugs.** It does NOT implement blur-on-disable, so a
   behavioural assertion passes on broken code. Verified 2026-07-30. Where the
   harness cannot reproduce a browser behaviour, assert the STRUCTURE (attribute
   contracts, source scans) and say so in the test — a green check that cannot
   fail is worse than no check.

### Android WebView / TalkBack gotchas
- **`aria-modal` is a hint WebView ignores.** Swiping past the last control
  walks out behind the scrim. `inert` is the real fix.
- **TalkBack's slider gesture sends ArrowUp/Down**, not Left/Right. Handling
  only Left/Right made the seek bar unreachable by the only input a blind
  teacher has.
- **`aria-live="assertive"` interrupts speech** — and the soundboard fires at
  the exact moment the drill sound plays. That sound IS the activity. Polite.
- **A focus event pre-empts a pending polite announcement.** Hence deferred
  speech in `toast()`.
- **`forceDarkAllowed=false` on BOTH Android themes** (`AppTheme` and
  `AppTheme.NoActionBar` — the latter has an explicit parent so it does NOT
  inherit). Force-dark inverts the warm-paper palette into sludge.
  **android/ is gitignored — re-apply if regenerated, like allowBackup=false.**

### Low vision
Type + spacing tokens px → **rem**; `html{font-size:calc(100% * var(--text-scale,1))}`.
**Settings → Display**: text size (4 steps), high contrast (~19:1), dark
background (photophobia — common with albinism/aniridia/achromatopsia).
Persisted through the Store, applied in `boot()` BEFORE first paint.
All in ONE appended block at the END of styles.css; revert = delete to EOF.
**The 1x default look is UNCHANGED and proven** — large-text repairs are gated
behind `data-text-scale="up"`, and `a11y-nochange.js` fails the build if any
rule in that block escapes a mode gate. (First draft did not gate them and
silently changed three things; Aditya asking "have you changed the entire UI?"
is why that guard exists.)

### The sound pad is a toggle — and it costs sighted teachers nothing
Reported: "difficulty pausing the sounds". When a sound starts the cursor is ON
the pad, but Pause sat THIRD in the transport behind ~20 pads and the seek bar
— and tapping the same pad RESTARTED from zero, punishing the correct instinct.
Now tapping a playing pad stops it. **Aditya confirmed sighted teachers play,
let it FINISH, then tap to replay — they never tap mid-playback** (they use the
transport button). A tap after the sound ends still replays; there is a flow
assertion pinning that. Play/Pause moved first in DOM order with CSS `order`
restoring the visual row.

### Verification — seven scripts, all wired into `./scripts/build.sh`
`a11y-contrast` (55/55, all four colour modes) · `a11y-nochange` (22/22, rem
parity + rule scoping) · `a11y-flows` (63/63, real flows) · `a11y-smoke` (546
controls, nothing throws) · `a11y-audit` (axe 21 screens + 31 assertions) ·
`a11y-preview` (5 screens x 6 modes for the designer) · `recover-faces.sh`.
Plus `test-batch1` 40/40.
**a11y-flows has now caught two regressions I was about to ship, and FLOW 8
fails on the round-2 bug.** When someone later calls the gates slow, that is
the answer.

### Still NOT solved — documented, not hidden
- **Filming video evidence has no non-visual equivalent.** A blind teacher
  cannot frame it, verify it, or check it after; and filming a child you cannot
  see is a consent question too. Options + recommendation in TRACKER,
  deliberately NOT decided unilaterally.
- **Demo clips are silent.** SOP + narration carry the same content and the `?`
  sheet now says so, but a narrated demo would remove the caveat.
- **Untested:** braille display, Switch Access, Voice Access.
- Verdict worth keeping: the CORE WORKFLOW was never visual (sign in → pick
  child → hear SOP → play sounds → score → save → read back). This app is far
  more amenable to blind use than most.

### Round 1 with the actual blind reviewer (2026-07-29) — two defects
1. **Selecting a student never spoke the name** — see RULE 6.
2. **"Reads everything from the start"** — `paint()` honoured `skipLedeFocus` by
   moving focus NOWHERE; innerHTML had destroyed the focused node, TalkBack lost
   its cursor, and its recovery is to read the window from the top. Now the
   picker focuses the newly-added child's tile, and `paint()` has a next-frame
   safety net.
**Both were found by a human in minutes and had passed every automated check.**

### Round 3 (2026-07-30) — the STALE LIVE REGION. Read this one carefully.
Symptom, from Mansi's phone: on the Today screen, exploring by touch read out
**"Saksham School, Noida selected. Enter your login ID and password."**
Cause: `onSchoolPick` announces that sentence and **`#srStatus` never cleared
it**. It sat in the accessibility tree immediately after `<main>`, so touch
exploration found it on every later screen.
**Why it looked device-specific, and was not.** The quiet phone had a SAVED
SESSION — `boot()` saw `isLoggedIn()`, went straight to the hub, the sign-in
screen never ran, so the region was never populated. **Reinstalling wiped that
session**, forced a real sign-in, and "caused" the bug. Aditya pushed back on my
speed theory and was right; the reinstall detail was the tell, and speech rate
was a red herring.
`#sbLive` and `#cmdLive` had the identical flaw. All three go through `srSpeak()`
now. `a11y-flows.js` FLOW 9 fails the build on any of it.
**LESSON: "it works on my device" for a screen reader usually means that device
has different STATE, not different speed. Ask what storage differs first — and
ask what the tester did just before it started.**

### Round 2 (2026-07-30) — "it still reads the sign-in page"
Names and the sound pad were confirmed FIXED by the reviewer. One left:
after signing in, TalkBack recited the sign-in screen.
**Cause: `btn.disabled = true` as a double-tap guard in `handleLogin`.** It
blurred the button the teacher had just pressed, parking focus on `<body>`,
and the disable straddled TWO awaits (verifyCredentials, then four Store
writes) before `showHub` painted — a long window with no cursor. Same pattern
existed at three more sites (saveProfile, saveRecord, batch save); all four now
use `lockBtn`/`unlockBtn`. CSS matches `[aria-disabled="true"]` alongside
`:disabled` so nothing changes for sighted users.
**Round 1's fix was necessary but not sufficient** — `moveScreenFocus` repairs
focus AFTER a paint, and this bug destroyed focus BEFORE one. Worth remembering:
"focus is restored on navigation" does not cover the gap before navigation.

---

## MEDIA IS GITIGNORED — and it bit (2026-07-29)
`faces/*.jpg` was stashed in `/tmp` for a consent-clean build; macOS cleared it;
gitignored so no second copy existed. Gone from the repo, from `www/` (the new
`rsync --delete` mirror removed them), from the built assets, and from the APK
(`clean` wiped it).
- **RECOVERED from the emulator's installed APK. ANY INSTALLED BUILD IS A MEDIA
  BACKUP** — every APK carries it at `assets/public/faces/`.
  `scripts/recover-faces.sh` automates the search.
- `~/om-media-backup/` now holds audio (28), sounds (22), 8 demo videos, 2
  faces. **Still on the same Mac — getting it onto Drive is open in TRACKER.**
- **Never stash media in `/tmp`. `cp` then `rm`, never `mv`.**
- `build.sh` step 3b now MIRRORS with `rsync --delete` (was `cp -R`, which only
  ADDS — a consent-clean build would have shipped the photos anyway).

## WRITING INSTRUCTIONS FOR ADITYA — two failures in one day
- **zsh does NOT honour `#` comments interactively.** A pasted
  `... | grep -c faces/   # expect 0` passes `#`, `expect`, `0` to grep as
  filenames. (It IS on in scripts, which is why build.sh was unaffected.)
  Put expected values on the line BELOW.
- **Never write `<placeholder>` in a command.** It gets pasted literally.
  If a command needs a value it cannot know, make it a SCRIPT.
- Git housekeeping runs from the REPO ROOT, never `android/`.

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
- **Accessibility is a build gate, not a review step** (2026-07-28/29). Six
  scripts fail the build. They have already caught two regressions I was about
  to ship, and they still missed both defects the blind reviewer found in
  minutes — automation catches what you thought of, a human catches the rest.
  Neither replaces the other.
- **If a screen reader must hear it, it is real text in the DOM**
  (`.visually-hidden`), never `aria-label` on a div/span — ARIA 1.2 drops it.
- **Any change to the a11y block in styles.css must stay behind a mode gate**
  (`[data-text-scale="up"]` etc). The 1x sighted design is not allowed to move;
  `a11y-nochange.js` enforces it.
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
- `index.html` — markup shell (also `#srStatus`, the polite live region);
  `styles.css` — look (a11y block is appended at EOF; revert = delete to EOF);
  `store.js` — storage seam; `app.js` — behaviour (incl. `buildSoundboard` + `SB`,
  `seedSchools` ~L213, `verifyCredentials` ~L280, `upsertProfile` ~L351,
  `SCHEMA_VERSION` ~L128, and the a11y seams table in the ACCESSIBILITY section above)
- `activities.js` — content-team owned; holds `ACTIVITY_DATA`, the `soundboard:true`
  flags, and `SOUND_LIBRARY` (soundboard sound list). Do not modify without content team.
- `scripts/build.sh` — the one build command (guards + parse + 6 a11y gates + mirror + sync + verify)
- `scripts/a11y-*.js` — the six verification gates; `scripts/recover-faces.sh` — media recovery
- `docs/RUNBOOK.md` — build and ship, written for Aditya to paste
- `docs/A11Y-TALKBACK-TESTS.md` — the 6 manual runs to hand a blind tester
- `sounds/`, `audio/`, `faces/` — bundled media (gitignored); mirrored to `www/`
- `~/om-media-backup/` — second copy, VERIFIED COMPLETE 2026-07-30 (39 audio,
  22 sounds, 2 faces, 8 videos). Still on the same Mac = still one disk. An APK
  is a third copy of audio+sounds but NOT of `faces/` in consent-clean builds.
- `MEMORY.md`, `TRACKER.md`, `DESIGN_NOTES.md`, `REVIEW_PACKET.md`
## Useful commands
**Never put an inline `#` comment on a line meant to be pasted** — interactive
zsh passes it to the command as arguments. Expected values go BELOW the block.

Build + verify (guards, parse, all six a11y gates, mirror, sync, byte-verify):
```
./scripts/build.sh
```
Last line must read `BUILD OK`. A failing gate is a real regression — read the
assertion, do not skip it.

Post-sync spot-check (any function you just added — note: app.js, not index.html):
```
grep -c "myNewFunction" ~/Desktop/om-app/android/app/src/main/assets/public/app.js
```
Soundboard sounds bundled:
```
ls ~/Desktop/om-app/android/app/src/main/assets/public/sounds | wc -l
```
Expect 22.

Consent check before any APK leaves the team:
```
unzip -l android/app/build/outputs/apk/debug/app-debug.apk | grep -c faces/
```
Expect 0 for an outside tester. (`grep -c` exits non-zero at zero — normal.)

Clean reinstall (stale APK fix):
```
cd ~/Desktop/om-app/android && ./gradlew clean installDebug
```
Recover gitignored media from any installed build:
```
bash scripts/recover-faces.sh
```
DevTools storage dump (chrome://inspect):
```
Store._keys().filter(k=>k.startsWith('rec_')).forEach(k=>console.log(k, JSON.stringify(Store.getJSON(k,[]),null,2)))
```
TalkBack debugging on the emulator: chrome://inspect → inspect the WebView →
Elements → **Accessibility** pane shows the computed name/role for any node.
That is how you prove an `aria-label` was dropped rather than guessing.
