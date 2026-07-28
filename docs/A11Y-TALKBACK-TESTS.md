# TalkBack test script — O&M Cane Training

_Written 2026-07-28, alongside the accessibility pass on `feat/a11y-blind-teacher`._

Two scripts (`scripts/a11y-audit.js`, `scripts/a11y-contrast.js`) run on every
build and catch the things a machine can check. **They cannot tell you whether
the app is usable.** Only a run with the screen off can do that.

This is that run. It takes about 20 minutes.

---

## Why this document exists

The app is for teachers, and teachers at Saksham, RNKS and NAB Kullu include
people who are blind or have low vision. "Accessible" for this app does not mean
"passes an audit" — it means a teacher who has never seen the screen can sign in,
find a student, run a drill, and record the result, at the same speed as a
sighted colleague. Everything below is written as that teacher's task, not as a
checklist of attributes.

---

## Setup

1. Build and install: `./scripts/build.sh` then `cd android && ./gradlew installDebug`.
   (After a native change: `./gradlew clean installDebug`.)
2. Turn TalkBack on: **Settings → Accessibility → TalkBack → On**, or hold both
   volume keys for three seconds if the shortcut is enabled.
3. Learn the three gestures you need:
   - **swipe right / left** — next / previous item
   - **double-tap** — activate the item you are on
   - **two-finger swipe** — scroll
4. **Turn the screen off.** Settings → Accessibility → TalkBack → Settings →
   Advanced → **Screen curtain**, or just do not look. This is the whole point.
   A test done while glancing at the screen tests nothing.

If you can, do the second half of this with a blind colleague at one of the pilot
schools driving and you listening. You will learn more in ten minutes than from
any audit output.

---

## The runs

Mark each ✅ / ❌. A ❌ is a bug, not a note.

### Run 1 — Sign in

| # | Do this | Should happen |
|---|---------|---------------|
| 1.1 | Open the app | You hear "Sign in", then the instruction line — not silence, not "webview" |
| 1.2 | Swipe right through the form | School dropdown, login ID, password, Sign in button — each announced with its own label |
| 1.3 | Double-tap the school dropdown | The list opens and the options are readable |
| 1.4 | Enter a wrong password, activate Sign in | The error is **spoken without you going looking for it**, and focus lands where you can fix it |
| 1.5 | Sign in correctly | You hear the new screen's name. You are not left in silence |

### Run 2 — Getting to a drill

| # | Do this | Should happen |
|---|---------|---------------|
| 2.1 | From Home, activate Activities | You hear "Activities" and the instruction, immediately — **this is the fix from 2026-07-28; before it, screen changes were silent** |
| 2.2 | Swipe through the category tiles | Each says its category name; the count reads as a count; the illustration is **not** announced as "image" |
| 2.3 | Open a category, then an activity | You reach the child picker and hear what it wants from you |
| 2.4 | Select a child, then Start | You reach the record screen and hear the activity name |
| 2.5 | Press system back at each step | You retrace one step per press — you never fall out of the app |

### Run 3 — The `?` reference sheet _(the modal test)_

| # | Do this | Should happen |
|---|---------|---------------|
| 3.1 | Activate the `?` button | Focus moves **into** the sheet; you hear its title |
| 3.2 | Swipe right repeatedly, past the last control | **You stay inside the sheet.** You must not land on the page behind it — that page is covered by a scrim you cannot see |
| 3.3 | Swipe left repeatedly, past the first control | Same — you stay inside |
| 3.4 | Read the SOP steps | Each step is a separate item, in order |
| 3.5 | Find the narration language buttons | English / **Hindi** / Tamil / Bengali. Hindi announces as "Hindi", not silence or garbage. Unavailable ones say why |
| 3.6 | Close the sheet | Focus returns to the `?` button you came from — not the top of the page |

> 3.2 and 3.3 are the `inert` fix. If you escape the sheet, `setBackgroundInert`
> is not firing — check that `<main>` gets the attribute.

### Run 4 — The sound library _(the hardest screen)_

Open a soundboard activity (Which Sound?, or Counting Steps).

| # | Do this | Should happen |
|---|---------|---------------|
| 4.1 | Swipe to the category tabs | Each tab says its name and whether it is selected |
| 4.2 | Swipe to a sound pad | It says "Play dog" (or similar), not just "button" |
| 4.3 | Double-tap to play | **The sound plays clearly.** TalkBack must not talk over it — announcements are polite and wait their turn |
| 4.4 | Find the seek slider | It reads as a time — "0:02 of 0:04" — **not** "50 percent" |
| 4.5 | Swipe **up** and **down** on the slider | The position moves. (TalkBack sends up/down for sliders, not left/right — fixed 2026-07-28) |
| 4.6 | Use play / pause / next / shuffle / repeat | Each says what it is AND what state it is in now |
| 4.7 | Leave the screen mid-playback | Audio stops. Nothing keeps talking |

> 4.3 is the one to be strict about. The child is listening for that sound; it is
> the entire drill. If the screen reader steps on it, the activity does not work.

### Run 5 — Recording a result

| # | Do this | Should happen |
|---|---------|---------------|
| 5.1 | Swipe to the result buttons | "Got it" / "With help" / "Not yet", each announcing selected or not |
| 5.2 | Select one | You hear the change. You can tell which is chosen without looking |
| 5.3 | Open Teacher's notes, type something | The field is labelled; the keyboard behaves |
| 5.4 | Enter a count in a number field | Announced with its label and unit |
| 5.5 | Activate Save | **You hear the confirmation** and know it saved |
| 5.6 | Swipe to the saved result | It reads back as date + values, in a sensible order |
| 5.7 | Delete a result | The confirm dialog traps you inside; Cancel is where focus starts; after either choice focus returns to the row you were on |

### Run 6 — Low vision (screen ON, TalkBack off)

This half is for teachers with usable but limited sight — a different group with
different needs.

| # | Do this | Should happen |
|---|---------|---------------|
| 6.1 | Settings → Display → Text size → **Largest** | Everything grows: text **and** the spacing around it. Nothing is cut off, no label is clipped mid-word |
| 6.2 | At Largest, walk a record screen | Buttons still fit their labels; you can still reach Save |
| 6.3 | Turn on **High contrast** | Near-black on white, heavier outlines, shadows gone. Category colours survive as darker versions |
| 6.4 | Turn on **Dark background** | Light on dark. Card edges are still findable — the hairlines are deliberately brighter here |
| 6.5 | Both on together | Pure black and white, maximum separation |
| 6.6 | Force-quit and reopen | All three settings survived, and applied **before** the first screen drew |
| 6.7 | Raise Android's own font size too | It multiplies with the app's. The layout still holds |
| 6.8 | Triple-tap magnification, pan around a record screen | Nothing important is stranded off-screen |

---

---

## Watch these six especially — they were broken until 2026-07-28

Found in the pre-handover bug hunt. All six passed the static audit, because
all six are about things CHANGING rather than how a screen looks at rest. If
any of them misbehaves, it is a regression, not a new discovery.

| # | Where | What must happen |
|---|-------|------------------|
| 1 | Run 1.3 — pick a school | Focus lands in the login ID field and it is announced. Silence here means you are stuck on screen one. |
| 2 | Run 5.5 — Save | You HEAR "Saved". The repaint used to swallow it. Save twice: both must speak. |
| 3 | Run 5.6 — a saved result | You hear name, date **and the scores**. If the scores are missing, the summary regressed to an aria-label. |
| 4 | Multi-child scoring | On "Skip for now" or after scoring, you hear **"Now scoring <name>, student N of M"**. If the child changes without saying so, STOP — you may be scoring into the wrong child's form. |
| 5 | Review screen | Focus moves to "Review — what will be saved", and each Edit button names its child. |
| 6 | Any result button | Tap fast, repeatedly, while the screen is settling. Nothing should go dead. |

Item 4 is the one to be strictest about. Every other failure wastes time; that
one produces wrong data that looks right.

## What automation already covers — don't retest by hand

- axe-core across all 21 screens, plus 31 app-specific assertions (`node scripts/a11y-audit.js`)
- Every control on every screen activated — 546 of them — with nothing thrown (`node scripts/a11y-smoke.js`)
- The flows above driven end to end (`node scripts/a11y-flows.js`)
- Focus moves to the screen heading on every navigation
- All 32 icons are hidden from the screen reader
- Language buttons carry `lang` and an English name
- `inert` goes on and comes off with the drawer
- Live regions are polite; the slider speaks a time
- WCAG ratios for all four colour modes (`node scripts/a11y-contrast.js`)

---

## What a totally blind teacher still cannot do

Being honest about this is more useful than a clean report. Three things in the
app are irreducibly visual. Two have a usable non-visual equivalent; one does
not, and should be a decision rather than a surprise in the field.

**1. Watch the demo video.** The clips are silent recordings of a drill — no
narration track. A blind teacher gets nothing from them. There *is* an
equivalent: the SOP steps and the facilitator note say the same thing, and the
Sarvam narration speaks them aloud. The sheet now states plainly that the video
is silent and points at the steps, so it reads as "skip this" rather than as a
dead end. **If the content team ever records narrated demos, delete that note.**

**2. Check the consent-form photo.** `viewConsentPhoto` shows a photograph of a
signed paper form. Unreadable without sight. The partial equivalent is the form
**serial number**, which is text and is announced — enough to confirm *which*
form is on file, not enough to verify it was signed. Acceptable for now because
consent is a paper process anyway and the serial is the audit key.

**3. Film video evidence.** This one has no equivalent. A blind teacher cannot
frame a shot, cannot tell whether the child is in it, and cannot check
afterwards whether the clip is usable. Filming a child you cannot see, for a
research record, is also a consent question and not only a usability one.

> **Open decision for Aditya + Mansi + legal.** Options, roughly:
> (a) leave it — a blind teacher simply doesn't use the video control, and
>     video is optional per-child anyway;
> (b) pair up — video is captured by a sighted colleague when needed;
> (c) hide the control when a screen reader is detected, which is
>     unreliable to detect and paternalistic if wrong.
> My read is (a) or (b); (c) decides for the teacher, which is the wrong
> instinct. This is flagged in TRACKER, not silently resolved.

What a blind teacher **can** do, end to end: sign in, find and enrol a student,
read or hear the full SOP, play sounds from the library, run the command board,
score every field, save, and read back saved results. The core workflow was
never visual — that is worth knowing.

## What nothing covers yet

- **Braille display.** Nobody has tried one. If any pilot teacher uses one, test
  before assuming.
- **Switch Access.** Same.
- **Voice Access.** Needs every control to have a spoken-matchable name; likely
  close, unverified.
- **Real Hindi TalkBack.** The `lang="hi-IN"` tags are correct, but a device with
  a Hindi voice pack installed should confirm the Devanagari labels actually
  speak. Worth doing at RNKS or NAB Kullu, where it matters most.

---

## Reporting

Log a ❌ with: the run number, what you heard (or heard nothing), what you
expected, the device, and the Android/TalkBack version. Add it to TRACKER.md
under NEXT. Do not batch them up — one clear failure fixed beats five vague ones
filed.
