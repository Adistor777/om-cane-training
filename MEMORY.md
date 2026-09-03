# MEMORY.md — O&M Cane Training

## ADI'S PASS OVER THE BUILT VERSION (2026-09-02 pm)
Nine changes, eight of them subtraction. Worth keeping because the pattern
repeats: **almost every complaint was the same thing said twice.**

- **The category was on the screen twice.** Tap Direction, land on a screen
  headed "Basic" with "Direction" under it. The header crumb now carries the
  category on BOTH activity screens and the lede carries only the name — and on
  the picking screen the crumb had been repeating the activity name sitting an
  inch below it, so that screen was saying its own title twice.
- **The roster line said the count three times** — an instruction paragraph, a
  bare "3 of 12 selected", and a Start button naming the number. One row now,
  which teaches while empty and counts once used.
- **Purpose was on the screen and repeated in the sheet.** Removed from the
  sheet.

### Tabs: pills do not read as a control
"Run it / Prepare" as pills "didn't feel like a button" — and he was right about
why, even without naming it: an unselected pill had no fill and no tray, so
nothing said *these two belong together and one of them is on*. They are a
SEGMENTED CONTROL now — recessed tray, two equal halves, chosen = filled and
pressed in. That is the app's existing selection grammar and the same shape as
the result picker a teacher taps on every record.
**Renamed and reordered on his call: Demo first, then Instructions**, and Demo
opens by default. That is the opposite of the "steps are wanted at nearly every
open" reasoning that produced the original order — his model is that a teacher
meets an activity by watching it before reading it. Flipping it back is one word.

### The narration block was a third of the sheet
A label, four language buttons two of which were permanently disabled, a
full-width native `<audio controls>`, and a dashed placeholder — for a control
most teachers touch once. **Native audio controls cannot be restyled in the
Android WebView**, which is most of why it read as bolted on; anything better
has to be a custom control. Now one row: language left, a Listen pill with a
clock right, `SOPA` driving a hidden `<audio>`. Play rejections are toasted, per
the standing rule from the August silence.

### Translations are WRITTEN now, and that raised the stakes
The same buttons switch the steps ON THE PAGE and the narration together — they
were never two different questions, and a teacher who reads Hindi more easily
than she hears English had been getting nothing. Only languages THIS activity
has text for are offered, so no permanently disabled Tamil and Bengali on every
screen.
- **A translation renders only when it is line-for-line with the English**;
  otherwise it falls back to English. A mismatch would number a step differently
  from the step the narration speaks, and nothing would flag it.
- **Every translation carries a visible draft line** until the content team signs
  it off. Narrating an unverified machine draft was already a stretch; printing
  it as the instructions a teacher follows while running a physical activity with
  a blind child is a bigger claim. `verifiedTranslations: ["hi"]` on the activity
  clears it — a content edit, no code change.
- One app-wide setting now governs both, so Settings reads "Activity steps
  language", not "Narration language".

### Two content casualties
`slt-nocane` DELETED — the final document delivers two straight-line stages and
never described a without-cane baseline. Id retired, never reused;
`demo-slt-nocane.mp4` is unreferenced. And "Sequence of procedure" became
**"Steps"**, which is the document's own heading, so the screen and the paper
match there too.

## WE KEPT REWRITING THE CONTENT TEAM INTO HOUSE STYLE (found 2026-09-02)
Adi re-sent `SOP_CC_App.docx` asking for everything in it with **the terms
exactly as written**. Diffing the document against the app showed that both
earlier transcriptions - 25 Aug and 1 Sep, both of which believed they were
transcribing - had quietly edited it:

| the document | what shipped |
|---|---|
| Conduct at least 5 trials | Run at least five trials |
| Speaker and Mobile | Speaker and mobile |
| Individual (Seating can be in a group) | Individual (children can be seated as a group) |
| "Surprise Me!" | Surprise me |
| Demonstrate the features of the Cane (How it folds, reopens, grips, and tips) | Demonstrate the features of the cane - how it folds, reopens, grips, and its tips |

Every one is defensible on its own and the set is not. **A teacher runs the
activity with the printed SOP beside the phone; if the two disagree in wording
she has to work out whether they disagree in meaning.** The app's own meta
labels had drifted the same way - "What you need" for the document's
"Resources", "How it is run" for "Type of Activity" - so the screen and the
paper named the same four facts differently. All of it is now the document's.

**RULE: content from the content team is transcribed, not edited.** House style
applies to text WE write. If their wording is wrong it goes back to them; it
does not get improved in passing. The one liberty taken, and it is recorded in
the file: the document nests two sub-bullets under one Localisation step and
the app has no sub-steps, so those three lines became one step with their words
unchanged and only the punctuation flattened.

## PURPOSE IS ON THE SCREEN, NOT BEHIND THE ? (2026-09-02)
`purpose` is a new content field and the only part of an SOP that does not live
in the reference sheet: it prints under the activity name on BOTH the
student-picking screen and the record screen, every visit, under a "Why this
activity" label above a hairline.

- **The label is doing the work.** Without it the purpose is a third line of
  grey text under a serif heading and reads as more subtitle - the exact fate
  it was being rescued from. With it, a teacher learns the position once and
  finds it without reading. It is also the only reason the picking screen can
  carry both the purpose and "Who is doing this activity?" without either being
  mistaken for the other.
- **A hairline, not a tint.** On the record screen the category colour is spent
  in exactly two places (Save, and the active result selection) - guardrail #1 -
  and a tinted card would have been a third, permanently, for a line nobody
  needs after the first read. It also avoids a second shadow tier (#2).
- **Both screen heads now read name / category / purpose.** Before this they
  disagreed: the record screen's subtitle was the category, the picking
  screen's was an instruction. "Persistent across both pages" only reads as
  persistent if the two are identical; otherwise it reads as coincidence.
- `.purpose-strip` claws back the lede's `margin-bottom:var(--s4)` with
  `calc(var(--s2) - var(--s4))` **in the same tokens**, so it tracks the
  text-size setting instead of drifting apart at 1.5x.

## THE ? SHEET IS TWO TABS NOW - RUN IT / PREPARE (2026-09-02)
Adi: "'?' has too much to process". Measured before touching it: mean 204 words
across 17 activities, worst 383 (Terrain Identification With Cane, 11 steps),
five sheets over 250. But length was the symptom. **One flat scroll was serving
three different moments at equal weight, in an order nobody's day matches** -
demo video first (wanted least, and a dashed "add a filename in activities.js"
developer placeholder on the four activities that have no clip), then setup
facts, and only then the steps, which is what a teacher opens the ? for at
nearly every open.

- **Run it** = steps, facilitator notes, narration. **Prepare** = purpose,
  Resources / Type of Activity / Recommended Age group / Time, the terrain
  set-up, the demo clip. The sheet also stops growing as content lands.
- **Reuses `.sb-tab`** - the sound library's tab strip, already `role="tablist"`
  and already category-accented. No new interaction vocabulary.
- **The tabs and both panels live INSIDE the `.ref-src` node.** `toggleRefSheet`
  MOVES those children into the popup rather than cloning them (so a playing
  narration keeps its handlers), which means anything parked outside would be
  left behind. Switching a tab flips `hidden` only - no DOM moves - so a tab
  switch cannot interrupt playback either.
- The strip is `position:sticky` with a negative top margin equal to the sheet
  body's own top padding; without that, steps scroll visibly through the gutter
  above the tabs.
- An activity with nothing to prepare renders **no tab strip at all** rather
  than an empty second tab.

### The facilitator note was the real bulk, and it is NOT re-ordered
The notes always arrived from the content team as a bulleted list and were being
joined into one paragraph - which is how Near-Far with Cane ended up with its
two safety sentences at word 165 of 172, below eight steps, inside a modal.
`facilitatorNotes: []` renders one line per bullet.
**They are deliberately left in the document's order.** Pulling the safety
sentences to the top was drafted and not shipped: deciding which sentence is a
safety instruction for a blind child with a cane is the content team's call, and
Adi's instruction was the document as written. The proposal stands; it needs
their signature, not ours.

## `fraction`, AND WHY NOT TWO COUNT FIELDS (2026-09-02)
Three "Record a Result" lines are written `___ / ___` - terrain changes
identified correctly, terrains correctly described, obstacles found
independently. Two `count` fields would have worked and would have been **our
paraphrase**: "4 out of 6 changes" only means anything as a pair, and splitting
it invents two labels the content team never wrote. `fraction` renders two
narrow boxes with a "/" and saves one value, "4 / 6", so the CSV keeps one
column per document line.
- Each box carries its own `aria-label` ("...how many correct" / "...out of how
  many"): a screen reader announcing two unlabelled number fields under one
  heading gives no way to tell them apart, and the visible "/" is decoration it
  never reads.
- `fracValue()` is the single reader used by the record screen, the batch flow
  and the review summary, so they cannot disagree about what empty means. An
  untouched field saves **nothing**, never "0 / 0" - which would look like an
  observed score of none correct.
- The document is itself inconsistent here: Direction -> Advanced asks for
  "Number of trials conducted" and "Number of correct responses" as two lines,
  which is the same information as a fraction. Both shapes are transcribed as
  written rather than harmonised.

## THE BRIDGE MAKES gates.sh REPORT A STALE FAILURE (found 2026-09-02)
`bash scripts/gates.sh` over the mount printed `/tmp/a11y-smoke.log: Permission
denied` and then **`GATE FAILED: a control throws`** - listing screens with the
OLD activity names. Nothing was broken. The redirect to `/tmp/a11y-smoke.log`
fails (the file belongs to a real-terminal run), so node never ran, and the
failure branch `cat`s that stale log from a previous day.
**A gate that cannot write its log reports the last run's result as if it were
this one.** Run the gates individually with a writable log path when working
through the bridge:
```
L=$HOME/gatelogs; mkdir -p $L
for g in a11y-contrast a11y-nochange a11y-flows a11y-smoke a11y-runtime-theme; do
  node scripts/$g.js > $L/$g.log 2>&1 && echo "PASS $g" || { echo "FAIL $g"; tail -20 $L/$g.log; }
done
```
**FIXED the same day.** `gates.sh` now writes into a private
`mktemp -d` with a `trap` cleanup, so a gate that cannot write its own log
cannot report someone else's result. All eight gates pass over the bridge now.

## `cap sync` DOES WORK OVER THE BRIDGE — IT NEEDED DELETE PERMISSION (2026-09-02)
MEMORY has said since July that the sandbox cannot run `./scripts/build.sh`
because `cap sync` needs to unlink files and the mount forbids it. That is only
true *by default*. With file deletion granted on the connected folder, the whole
build runs end to end over the bridge — gates, the `rsync --delete` mirror of
`audio/`, `npx cap sync android`, and the built-asset byte-compare — and prints
`BUILD OK`. First time this project has built without Aditya's own terminal.

**Two traps around that grant:**
1. **It does not survive a bridge reconnect.** The device dropped mid-session;
   after it came back, `rm` in the same folder returned `Operation not
   permitted` again with no warning, and `rsync --delete` failed four files into
   the audio mirror. Re-request it; do not assume a grant from earlier in the
   session still holds.
2. **A failed `rm` still leaves what you were probing with.** Two `_probe.tmp`
   files sat in `audio/` and `www/` until the grant came back, because the tool
   that could have removed them was the one being tested.

What still cannot be done from here: `./gradlew assembleDebug` / `installDebug`
(Android SDK + a device), and anything reaching `api.sarvam.ai`.


## A SECOND SOP DOCUMENT, AND THE `rating` TYPE (2026-08-25 pm)
`SOP.docx` covered the four Sound + Direction activities — Near-Far w/o Cane,
Near-Far with Cane, Count Steps, Count Steps (Group). Steps and Facilitator
Notes transcribed from their sections; names, resources, age and time taken
from their headers. **Their section boundaries were respected rather than
tidied** — a step that reads like a facilitator note stays a step if that is
where the content team filed it.

- **New field type `rating` (1–5).** The document asks for "Rate 1–5" four
  times and nothing in the app could do that. Rendered as five buttons in a
  CSS grid rather than the generic `.seg`, because `.seg` goes vertical under
  640px — right for word labels, and fatal for a numeric scale, where five
  stacked full-width buttons stop reading as a scale at all. Each button
  carries its own `aria-label` ("Understanding of near and far: 3 out of 5"):
  "3" alone tells a screen-reader user nothing, and a toggle announces STATE,
  never the button's name.
- **A RATING NEVER BECOMES A VERDICT.** The batch flow derives an `Achieved`
  column from the scored field. There is no non-arbitrary line between 3 and 4,
  so a `rating` — and a `choice` that declines to name an `achievedWhen` —
  writes **no Achieved column at all**. Same family as the bug fixed that
  morning, where activities asking for no judgement were stamped
  `Achieved: No`: both put a judgement nobody made into research data.

## THE CATEGORY REGROUP, REVERSED (2026-08-25 pm)
Adi split **Sound back out** of Sound + Direction and moved both Counting Steps
drills back IN — reversing the 24 Aug merge in both directions. Six categories
now. Activity ids unchanged, so every saved record followed its activity;
category membership is presentation, not identity.

**The consequence nobody would have predicted: a sixth category re-colours the
sixth.** A category takes `CATEGORY_PALETTE[its own index]`, so adding one
silently shifts everything below it. Slot 5 was `#3a7d5d` — a near-duplicate of
Direction's `#2f6f4e` — so "Other Activities" would have looked like Direction.
Plum and that green were swapped; the duplicate now sits at the LAST index where
nothing reaches it. **Adding a category is never just an insert.**

## THE ? IS GONE FROM THE CATEGORY SCREEN (2026-08-25)
Only from `showCategory` — the list you land on when you tap a category. The
picker and the record screen keep theirs, because that is the one carrying the
activity's actual SOP. Two ? buttons a tap apart showing different things taught
teachers that ? means "some help, unclear which". The category `help` /
`helpVideo` / `helpImage` data is deliberately NOT deleted from activities.js —
it is content-team work and costs nothing at rest; restoring the button is one
block in showCategory.

## forEach SKIPS HOLES — MY OWN VERIFICATION LIED (2026-08-25)
A stray comma during the regroup left a **sparse array** in one category. The
check that was supposed to catch it walked the activities with `forEach`, which
**silently skips holes**, so it printed a perfect list of 17 activities while
`activityNameById` — which uses `for...of`, and does not skip — crashed on
`undefined`. The 40-test suite caught what the purpose-built check could not.

**Rule: verify array integrity with `length` plus an explicit index scan, never
with forEach/map/flatMap.** All four skip holes. The fix is three lines:
```
for(let j=0;j<c.activities.length;j++) if(c.activities[j]===undefined) holes++;
```

## HINDI: THE NO-MACHINE-TRANSLATION RULE, SUSPENDED FOR THE DRAFT (2026-08-25)
Adi asked for Hindi on all eight activities whose English came from the two
documents, explicitly overriding the standing rule that teacher-facing text is
never machine-translated. **The rule is suspended for the DRAFT, not for what
ships**, and every one of the eight sites says so in a comment.

- Lines are **1:1 with `sop`** and that is checked, not assumed:
  generate-audio.js speaks the array in order, so one extra line narrates step 4
  against step 3 on screen — a defect no gate can see, because no gate can hear.
- App button names (**Surprise me**) stay in English on purpose: that is what
  the teacher is looking at while the app speaks.
- Terms chosen and worth a native speaker's eye first: **छड़ी** for the cane,
  **व्यक्ति A / व्यक्ति B** for the two adults.
- This produced the first Hindi audio the project has ever had — sixteen new
  files, eight English and eight Hindi, none of which any automated check can
  evaluate.

## STUDENT INTAKE: THE SHEET IS ALREADY BUILT, AND R33 STILL OPEN (2026-08-25)
Asked whether teachers could keep a spreadsheet the app reads. **That shipped
31 July**: coordinator sets a published-CSV link in Settings, teachers tap Sync
on Students; `classifyRows` marks every row new / warn / dup / bad and refuses
an ambiguous date rather than guessing.

The unresolved part is unchanged and now sharper: **a published link is
unauthenticated — the URL IS the credential**, and R33 says rollover sheets are
"sent to us, not published" for exactly that reason. A per-TEACHER sheet, which
is what was proposed, multiplies those URLs by the number of teachers, each
holding children's names and dates of birth, on personal phones (R36).

**Recommendation on the table, not yet built: import the FILE, don't publish a
link.** A teacher exports CSV from whatever they keep, sends it, taps Import.
No world-readable URL, works offline, reuses the classifier that already exists.
The paste path already does this and was about to be deleted — that is the
argument for keeping it. Longer term the server is authoritative and the sheet
drops to seeding only (ODK Central Entities pattern), so more sheet-dependence
now is Phase 2 rework.

## SOUND LIBRARY: NO STREAMING PLAYER (settled 2026-08-25)
Asked about a "mini Spotify player" for sounds outside the bundled 22. Ruled
out on three independent grounds, any one of which is fatal: the Web Playback
SDK **requires Premium per user**; Spotify's developer policy forbids
non-commercial-only use, synchronising and broadcasting its content, which is
what playing audio to a class and capturing it in a consent-gated research video
would be; and it is a **music catalogue, not a sound-effects library**. Above
all it would trade the app's one hard-won property — works with no connection —
for convenience.

Direction agreed instead: grow the bundled library from CC0 sources
(Freesound CC0 pool, Pixabay, BBC Sound Effects), and — the better answer for
field-discovered sounds — **let the teacher record one**. A Kullu child
identifying the auto-rickshaw that actually passes their school is a more valid
trial than a stock siren. Rule if built: **environmental sounds only, never a
person** — a child's voice is personal data with a different consent envelope,
and Count Steps (Group) has a child BEING the sound source, so that boundary
gets tested immediately.
**Prerequisite before any sound is added:** a compression policy. `rain.mp3` is
27.6 MB — 14 min 22 s at 256 kbps — for a drill cue. Target ≤10 s, 96 kbps
mono, ~150 KB.

## FONTS WERE NEVER REACHING THE FIELD (found 2026-08-25)
`index.html` loaded Instrument Serif and Arimo from **fonts.googleapis.com**.
This is an offline-first app for schools including Kullu, so on a disconnected
phone every heading silently fell back to Georgia and every label to Arial —
the typeface was a design decision that had never reached a single teacher.
Nothing could see it: jsdom has no font stack and the emulator has wifi. Same
family as the WAV-as-mp3 bug — **a defect that only exists on a real device in
real conditions is invisible to all seven gates, forever.**

- Both faces now live in `fonts/` (**committed**, like `img/` — a typeface is
  artwork, not personal data) and are declared with `@font-face`. `build.sh`
  step 3b mirrors the directory. 160 KB total, both OFL, licences ship beside
  them.
- Second win, worth stating to legal: the app now makes **no third-party
  request at boot**. A Google Fonts fetch hands the device IP to a third party
  from an app holding children's data. Removing it is a DPDP posture
  improvement, not only a speed one.
- **Instrument Serif → Fraunces**, and one of the two reasons is a defect
  rather than taste: Instrument Serif ships a SINGLE weight (400) at high
  stroke contrast, so in **high-contrast mode — the mode a low-vision teacher
  actually turns on — the largest text on the screen got no sturdier.** Fraunces
  is variable 100–900, so `[data-contrast="high"] .lede` can now ask for real
  weight. The other reason is SOFT, which rounds the terminals and is what makes
  it sit on warm paper rather than reading as a masthead.
- Retune from `.lede`'s `font-variation-settings` (opsz 48, SOFT 40, WONK 0).
  WONK 1 swaps in the single-storey g and the swash leg — charming, slightly
  loud, off by default.

## PRESS: one physics, and WEIGHT IS MEASURED NOT LISTED (2026-08-25)
The app had press feedback already — as **nine unrelated scale values invented
per component** (.92 on a transport button, .97 on a segment, .98 on a pad, .99
on Surprise me, three different translateYs). Two pushed the WRONG WAY:
`.card:active` and `.action-row:active` were **hover rules reused for touch**,
so on a phone — where nothing hovers — pressing a card made it RISE, and the
home row's `translateY(0)` meant the Activities/Students screen had no press
feedback at all. Nothing read as a physical object because there was no shared
model to read. That, not the absence of animation, is what "feels cheap" means.

**The model: ink pressed into paper.** Everything goes DOWN, nothing rises, and
elevation is LOST on press, never gained — which keeps guardrail #2 intact,
since no second shadow tier is introduced. Every weight also carries an INSET,
because scale alone is nearly invisible on a large surface: .985 across a 340px
row is a 5px move, and dropping such a row to `--shadow-rest` changes nothing
when it had no resting shadow to lose.

- **Timing is asymmetric and that is the ingredient that reads as expensive.**
  Down 80ms near-linear (the surface must meet the finger); up 340ms on a long
  decelerating curve (it has mass). Equal in/out is what cheap UI does. No
  overshoot — a bounce reads as playful, and this is a tool used over a child's
  assessment.
- **A 90ms floor on the press state**, so a fast tap is still SEEN. Most of why
  a good button feels answered rather than merely obeyed.
- **Driven by `pointerdown`, not `:active`.** Android's WebView delays or drops
  `:active` inside a scrolling container — exactly where the biggest controls
  live — and the app rebuilds screens with innerHTML, so per-element listeners
  would not survive a repaint. One delegated listener on document.

### The mistake worth remembering: a class-name list cannot stay correct
The first cut assigned weight by matching CLASS NAMES, assembled by grepping
`styles.css`. It was wrong within the hour: **`.card-media` — the activity
cards, one of the most-tapped surfaces in the app — fell through to the generic
`button` catch-all and shrank 3.5% like a 40px icon.** Aditya spotted it as
"this didn't happen throughout the app". Every component added later would have
defaulted to wrong until somebody remembered the constant existed.

Weight is now **measured** (`pressWeightFor`, app.js) from the element's own
box: `<=56x56` micro, `>=60 tall and >=190 wide` slab, else ctrl. A component
built next month gets the right weight the first time it is touched.

`PRESS_OVERRIDE` is the short exception list geometry LEFT — not a second copy
of the inventory. Three kinds, all found by measuring:
1. **Meaning beats size.** `.save` measures 355x56 = slab, but a slab press is
   soft and the commit tap should feel decisive → pinned ctrl.
2. **Drawn as text, not a surface.** `.help-tip-ok` measures 99x17; scaling a
   line of type looks like a rendering fault → dims instead.
3. **One component must not span a threshold.** `summary` is 355x74 where its
   label wraps and 355x59 where it doesn't; `.cmd-pad` is 149x68 in the grid and
   56x56 on the compass face; `.sb-tbtn` is 64x64 for play and 46x46 for its
   neighbours. Each would have pressed two different ways on different screens.

### `scripts/measure-press.mjs` — the tool that found all four
Press weight cannot be reviewed by reading code, because the assignment depends
on layout. **jsdom returns zeros from getBoundingClientRect, so all seven gates
see every control as identical and none of them can ever catch this.** The
script runs the real app in Chromium at 393x873, walks 20 screens, and prints
every component's assigned weight; it exits non-zero if any component appears
under two weights. Needs `npx playwright install chromium`; **deliberately NOT
wired into build.sh** — the seven real gates must stay dependency-light enough
that nobody is tempted to skip them.

### Haptics without a plugin
`navigator.vibrate` is already in the WebView; `@capacitor/haptics` would buy a
gradle change and nothing else. 7ms ordinary, 14ms on a commit (score / Save /
Review). **Slabs tick on RELEASE, not press** — a card is the thing a finger
lands on to start a scroll, a vibration cannot be un-fired, and a grid that
buzzed every time you scrolled past it would be intolerable. Settings → Display
→ Touch feedback, default on, because R36 means these are teachers' own phones.

## SELECTION: one fill meant two opposite things (2026-08-25)
Five separate selection grammars existed — solid fill, the pinned judgment
green, soft tint, badge+tint, ring — invented per component, no two agreeing.
Two were already RIGHT and were left alone: the **pinned judgment green**
(a score must mean the same thing in every category, so it correctly refuses the
category hue) and the **roster tick** (tick + tint + border, three redundant
carriers on the one screen where a mistake scores a session onto the wrong
child).

**The defect that mattered: solid category fill meant BOTH "you chose this" and
"this is making noise right now".** Opposite kinds of state — one durable and
bound for the research CSV, one gone in three seconds — and pixel-identical,
separated only by an 11px equaliser that high contrast and a bright classroom
both erase. It sharpened on 24 Aug when both Sound activities gained a scoring
segment that sits on the same screen as a sound pad.

- **CHOSEN = filled + pressed in** (inset, never elevation — which is also why
  it is not the coloured glow first suggested: a glow adds a second shadow tier
  and softens the very edge high contrast exists to sharpen). The fill arrives
  on the **release curve (340ms)** instead of snapping at 150ms linear; that one
  line does most of the perceived work.
- **LIVE = never filled.** Outlined, ringed, breathing. This forced a dependency
  that was nearly missed: the sound pad's glyph was `rgba(255,255,255,.2)` on
  white text, which only worked because the pad behind it was filled — unfilled,
  it would have been white on white.
- **High contrast needed its own rule.** `[data-contrast="high"] [aria-pressed]`
  fills everything with ink and would have put the two states straight back on
  top of each other.
- The picker tile's ring was retired. The stylesheet already recorded a 15 Jul
  call that "rings read as buttons", after which the active-child row got a text
  tag and the picker kept its ring anyway.

### The category hue now reaches the shadow
`--cat-shadow` per category feeds the EXISTING `--shadow-lift` — same tier, same
depth, same opacity, only the hue moves. Not a glow, not a second elevation
level. **It is set on `<html>`, not `<body>` like its four siblings**: a `var()`
inside a declaration on `:root` resolves against `:root`, so a value parked on
`<body>` would have silently done nothing. Both mode blocks replace
`--shadow-lift` outright, so the tint does not participate in dark or high
contrast at all.

Also visible once the palette was laid out as swatches: **entry 5 (`#3a7d5d`) is
a near-duplicate of entry 0**, and entries 5–6 are unused since the regroup left
five categories against seven. Add a sixth category and it will read as
Direction.

## REAL SOPs LANDED, and they changed the record forms (2026-08-25)
`SOP_CC_App.docx` from the content team covers four activities: Direction Basic,
Direction Advanced, Sound Identification (`sound-which`) and Sound Localisation
(`sound-source`). Steps → `sop[]`, Facilitator Notes → `facilitatorNote`,
verbatim in meaning. **Their section boundaries were respected rather than
re-edited** — e.g. Direction Basic's step 7 reads like a facilitator note but
they filed it under Steps, so it stayed a step.

- **New `meta` block** (resources / type / age / time) renders as "Before you
  start" above the steps in the `?` sheet. Every key optional; an activity
  without `meta` renders nothing, so the eleven activities still awaiting SOPs
  are unaffected. Direction Advanced has no Time in the document — the key is
  omitted rather than guessed.
- **New `choice` field type.** `result` and `mastery` hard-code their scales;
  the SOPs asked for "Confident / Required hints" and the next one will ask for
  something else. `choice` reads `options: [...]` from activities.js plus
  `achievedWhen`, so a new scale is a CONTENT edit. Option text travels in
  `data-v`, not inside the onclick string — an apostrophe in content would
  otherwise break the handler silently.
- **A real data bug fell out of it.** The batch flow wrote `Achieved: No` on
  every record with no scored field. Direction Advanced records trials and
  correct answers and asks for no judgment at all, so every one of its rows
  would have entered the research CSV stamped as a failure nobody observed.
  `Achieved` is now written **only when a score exists**.
- **Both Direction activities lost their Hindi, on purpose.** The drafts were
  four machine-written lines matched to the four-step SOP these replace; against
  seven English steps `generate-audio.js` would have narrated the OLD procedure
  in Hindi under the NEW text on screen. The language button now renders
  disabled (`langHasContent`) — the honest state until verified translations
  arrive. Same standing rule: no machine translation for teacher-facing content.
- **`--force` is not optional when regenerating narration.** `generate-audio.js`
  SKIPS any file that already exists, so a re-run after a text change silently
  changes nothing and leaves the audio disagreeing with the screen. The bridge
  shell cannot reach api.sarvam.ai (`fetch failed`), so this one has to be run
  from Aditya's own terminal. The generator failed cleanly and truncated
  nothing, which is the 24 Aug guard working.
- Counting Steps — **Individual now sits above — Group** in Straight Line Travel
  (Adi's call, 25 Aug). Moved by brace-matching the whole block and asserting it
  came out byte-identical with the file length unchanged.

## Two helper scripts, because a placeholder cost a round trip (2026-08-25)
`scripts/emulator.sh` boots the first AVD and **waits for `sys.boot_completed`**
before returning — that wait is the actual fix for `installDebug`'s "No
connected devices!", which is what a freshly launched emulator looks like for
the first minute. `scripts/install.sh` refuses to start without a booted device,
installs, then **compares the APK on disk with the one actually on the device**
and force-stops the app so the WebView reloads from the new assets.

Both exist because a handover of "run `-list-avds`, then type the name into the
next command" was pasted literally, `<the name it prints>` and all, and zsh
answered `parse error near '&'`. **MEMORY already carried that rule and it was
still broken** — so the rule is now enforced by there being a script.

## AUDIO: Sarvam sends WAV when you ask for MP3 (found 2026-08-24)
**Every cue and every SOP narration in the app had been silent since 13 July**
and nobody knew. All 43 Sarvam-generated files were RIFF/WAVE bytes written into
a `.mp3` filename: both generators request `audio_format:'mp3'`, Sarvam returns
WAV regardless, and the scripts wrote whatever came back without looking.

Why that is fatal on Android specifically: **Capacitor serves local assets with
a MIME type derived from the file EXTENSION**
(`WebViewLocalServer.getMimeType()`). So the WebView was handed
`Content-Type: audio/mpeg` wrapping WAV, refused to decode, and fired `onerror`.
The `sounds/` library was never affected — those 22 files come from elsewhere
and are genuine MP3s.

- **Fixed:** all 43 re-encoded in place (LAME 96 kbps 44.1 kHz mono). `audio/`
  dropped to 6.3 MB — WAV was several times the size, so the APK shrank too.
  WAV originals kept in `~/om-media-backup/audio-wav-originals/`.
- **Cannot recur:** both generators now sniff the returned bytes (`RIFF`/`WAVE`
  magic), re-encode through ffmpeg, and **fail loudly** if ffmpeg is absent
  rather than writing a file that lies about its own format.
- **`speak:` overrides matter** — Sarvam clips the hyphen in "North-East", so
  the four intercardinals carry `speak: "North East"`.

### Three lessons from that hunt, all of them expensive
1. **No verification gate can catch an audio defect.** jsdom has no media
   decoder, so this passed 40 unit tests, 93 flows, 32 axe assertions, 553
   activated controls and the contrast gate — for six weeks. Audio is
   device-only, forever.
2. **The emulator cannot verify audio.** Confirmed working on a real phone while
   still silent on `Pixel_10_Pro_XL(AVD)`. The emulator is fine for UI and
   useless for sound. It now sits beside the parked video-picker test on the
   real-device list.
3. **`p.catch(()=>{})` hid the answer.** `HTMLMediaElement.play()` rejects for
   POLICY reasons (autoplay, codec, interrupted) and fires **no** `error` event,
   so both `CB.play` and `SB.play` swallowed the whole class silently — a
   refused cue and a muted device looked identical. Both now toast the real
   `err.name`, and `onerror` names the media error code. Never swallow a play
   rejection: a teacher mid-assessment has to be told why a cue was silent.

## The `www/` trap bit twice in one session (2026-08-24)
Both failures presented as "I see no changes", and neither was a code problem.
- **`gradlew` without `./scripts/build.sh` first.** Gradle packages whatever is
  already in `www/`; it does not copy source and does not run `cap sync`. The
  APK looked freshly built and contained eight-minute-old code.
- **`assembleDebug` without `installDebug`.** Building writes a file; it does
  not put it on the device.
**Diagnostic that settles it in one command** — compare source, `www/`, assets
and the APK before debugging anything else:
```
for f in app.js styles.css activities.js; do printf "%-14s src=%s www=%s assets=%s\n" "$f" \
  "$(date -r $f '+%H:%M')" "$(date -r www/$f '+%H:%M')" \
  "$(date -r android/app/src/main/assets/public/$f '+%H:%M')"; done
```

## Direction → Advanced is a compass FACE (2026-08-24)
Eight points on a true ring — positions are 50% ± 38%, and ± 26.87% on the
diagonals (38 × cos 45°), so North-East geometrically sits halfway between North
and East. A dashed dial in the band between the rose and the pads is what makes
eight buttons read as one instrument. Cardinals 66px, intercardinals 56px — the
O&M progression (cardinals first) made visible rather than only written in a
facilitator note. The needle turns to the last point spoken and **accumulates**,
so North after North-West sweeps 45° forward instead of unwinding 315° back.

- **Content-team owned, like everything else in activities.js:** `compass: true`
  on the activity plus `at: "n"|"ne"|…` on each command. Delete `compass:true`
  and it falls back to the old grid; a command with no `at` (say "Stop") still
  renders, in a normal row beneath the face. Sixteen points would be one line in
  `CB.BEARING` plus one grid rule.
- **The face shows N / NE / …** because a circle cannot hold "North-East"
  legibly. Nothing is lost: the full name is the `aria-label`, it is what the
  app speaks, and it prints under the face on tap (`#cmdSaid`, `aria-hidden`
  because `#cmdLive` already announces it). `short:` overrides the default.
- **DOM order stays clockwise from North** regardless of where CSS paints each
  pad, so TalkBack and Tab walk the rose the way a person would describe it.

## Activities regrouped (2026-08-24) — and why records survived it
Six categories became five. `Sound` was emptied and deleted; its two activities
lead `Sound + Direction`. Both Counting Steps drills moved to `Straight Line
Travel` as items 2 and 3.

**The durable fact:** records key on `rec_<activityId>` (`REC_PREFIX`, app.js)
and **no category index is ever persisted** — `state.category` is runtime only.
So activities can be moved between categories freely and saved results follow
them. Category membership is presentation, not identity.

Method used, and the one to reuse: cut and reinsert whole activity blocks by
brace-matching, then assert each moved block is **byte-identical** to its
original and that the full id set is unchanged. Nothing was retyped, so SOPs,
Hindi translations, facilitator notes, `videoFile`, `group:true` and
`soundboard:true` all carried across untouched. `demo-sound.mp4` was NOT
orphaned by deleting the Sound category — it was already `sound-which`'s own
`videoFile`.

## Working through the cloud bridge — two traps (2026-08-24)
- **Every `git status` run over the mount leaves a `.git/index.lock` it cannot
  delete** (the mount forbids unlinking), which then breaks the next real `git
  add` with "File exists". Use **`git --no-optional-locks status`** for
  read-only inspection.
- **The mount cannot overwrite a file in place via `mv`** ("unable to remove
  target"). `cat tmp > file` truncates in place and works.
- No inline `#` comments in pasteable snippets — interactive zsh does not honour
  them (already commit `a1cf0aa`; repeated anyway).

## OM-Requirements.md sits ABOVE SPEC.md (new 2026-08-21)
Adi's numbered requirements sheet — **R1–R33** requirements, **D1–D9** open
decisions, **C1–C5** fixed constraints. Numbers are stable identifiers, never
reused, never renumbered, so a reference stays valid across versions. Quote them
by number in every discussion.

`SPEC.md` is still the definition of done for accounts/children/data custody and
still carries the file:line evidence. The sheet sits above it and extends it —
**classes, a head role, an activity log, retention clocks**. Where they disagree,
the sheet wins. Three design documents dated 21 Aug
(`OM-Architecture-Spec.md`, `OM-Engineering-Review-Response.md`,
`OM-What-We-Actually-Want.md`) are **superseded by the sheet** — history, not
instruction.

**The deltas that change existing code** are itemised at the top of TRACKER.md.
The four that cost the most:
1. **Sharing boundary moves school → class (R13/R14).** Classes don't exist in
   the schema. Access must be *looked up from an assignments table per row*, not
   read from a token claim — assignments change mid-term and a stale claim keeps
   a revoked assignment working. This lands inside backend P0, not after it.
2. **Records sync BOTH ways.** R11 + R13 mean two teachers sharing a class must
   see each other's sessions. Upload-only was never going to satisfy it.
3. **R17 reverses the pseudonymisation posture for researchers** — they get
   names. R29 still governs ordinary exports. Consent form must say so first.
4. **R33 contradicts the intake feature already shipped.** Rollover sheets are
   "sent to us, not published"; student intake currently reads a published-to-web
   CSV, where the URL *is* the credential. Same hole, still open on device.
5. **R34 — classes are per-school EDITABLE rows, not an enum.** Nursery/LKG/UKG/
   1–12 is a starting default. Vocational streams, open schooling and ungraded
   groups all exist in schools for the blind.
6. **R35 — the head can WATCH clips** from their school. Watch only: no download,
   delete or share. Needs a stream path that never hands over the file — and it
   widens consent (below).
7. **R36 — teachers use their OWN PERSONAL PHONES.** Kills the shared-device
   cache churn, and makes D1 the *only* bound on children's data leaving with a
   departing teacher, because we cannot wipe a device we don't own.

**Four decisions still open: D1, D4a, D5, D9.** Closed 21 Aug: D2→R36, D3→R35,
D6→R31, D7→R17, D8→R34. On **D5** the recommendation is *switch off, don't
delete* — R12 and R25 both point at the departing teacher's name, and a hard
delete orphans them while looking identical to the school. A guardian's erasure
request is the opposite case: a real, permanent delete.

**The consent form is now narrower than the requirements.** It was written for
research use. R17 (researchers see names) and R35 (head watches clips) are both
wider than what a guardian agreed to. One line each, free today, awkward once
families need re-consenting. Goes to legal as one question.

**Two things nobody had written down.** There was no mention anywhere of an
**institutional ethics approval (IEC/IRB)** for a study collecting face video and
assessment data from disabled minors — separate from DPDP, normally required
before collection, and the protocol may be what dictates video retention. Going
to Mansi this week. And a **clip duration cap** — now **adopted at 60 seconds**:
the cheapest single lever there is, bounding upload time, storage and retention
exposure at once, and limiting how much of a child's face and voice is captured
at all, which reads as a consent-form positive rather than only an engineering
one.

## Users are SIGHTED TEACHERS — and the project prompt says otherwise
Settled in the 2026-07-30 scope revision and restated as **R30**: accessible and
TalkBack-native, *not* blind-first. The children assessed are blind; the people
operating the app are not. The blind reviewer is a reviewer, not the target user.

**The project's own standing instructions still say _"Treat audio-first/voice-first
interaction as likely core, since end users are visually impaired."_** That
sentence is wrong for this product and every fresh session re-derives the error
from it. Amend it to: *end users are sighted teachers; the children assessed are
blind or low-vision; accessibility is compliance, not the primary persona.*
Still genuinely open: whether a blind teacher is in scope at all — see the
video-framing decision in TRACKER.

## SPEC.md is the definition of done (new 2026-07-31)
Aditya's own eight-line description of the app — schools added by us, teacher
logins issued by us, changeable passwords, teacher-added children that are
never overwritten, videos that come to US and not the school, CSV export, and
export scoped to the children a teacher works with. Status column is verified
against the tree with file:line evidence. **TRACKER is history; SPEC is the
target.** Order of work: `2 → 5 → 6 → 8 → 3 → 1`.
Headline finding behind it: the `Cloud` seam has ONLY `signIn` + `enrolChild`.
No `.upload(`, no `storage.from`, no `syncRecords` — **records never leave the
device either**, so "we hold the videos" is not an uploader, it is the whole
sync layer. `records.teacher_id` already exists in `schema.sql:106` and is dead
because nothing ever reaches the server.

## Android 12+ kills the native splash (settled 2026-07-31)
`AppTheme.NoActionBarLaunch` inherits `Theme.SplashScreen`, so from API 31 the
SYSTEM draws the launch screen and **ignores `android:background`** — the
legacy `drawable/splash.png` never appears. It also **circle-masks** its icon,
so a ~5:1 wordmark cannot render there at any size. The BIF mark therefore
lives in the WEB layer (`#brandGate`), which also means it is in git, unlike
anything under the gitignored `android/`.
- `launchAutoHide:false` + an explicit `SplashScreen.hide()` inside a
  **`finally`** (not `catch` — with auto-hide off, a render throw on any boot
  path would strand the app on a black screen forever).
- The hold starts AFTER that hide, never at parse time. The first attempt
  counted down while the web gate was still behind the native splash, so both
  expired together and the mark got a few dozen frames, most of them mid-fade.
  That is the whole reason "I see black but no logo" happened twice.
- `values-v31/styles.xml` sets `windowSplashScreenBackground` to black so there
  is no cream→black→cream flash. **LOCAL ONLY** — `android/` is gitignored, so
  this joins `allowBackup="false"` and `forceDarkAllowed="false"` on the
  re-apply-if-android-is-regenerated list.

## Brand assets (2026-07-31)
- `img/` is a NEW committed directory and the odd one out: `audio/`, `sounds/`
  and `faces/` are gitignored, `img/` is not, because it is artwork rather than
  personal data. It rides the same mirror loop in `build.sh` step 3b.
- **Never reference `img/bif-logo.png`.** The supplied master is 6000×3375 —
  about 81 MB decoded — and Android's WebView silently declines to paint it.
  That, not placement, is why the mark was invisible. Ship the 1000px
  derivatives; the master stays only as the source to regenerate from.
- The artwork is TRANSPARENT with a **white** wordmark, so it is invisible on
  the warm paper. `bif-mark-white.png` is used on the black launch gate and in
  dark mode; `bif-mark-ink.png` is **our recolour** (white ink → `--ink`, purple
  untouched) for light surfaces, swapped by `[data-theme="dark"]`.
  ⚠ **The ink variant is not Bosch's artwork.** Ask BIF for an official
  light-background lockup before anything goes to them, and flag it if the APK
  leaves the team.
- Rejected: a black plate behind the white mark. A black slab in a design whose
  first guardrail is "the page stays flat" reads as a sticker.

## Student intake — paste AND sheet sync (2026-07-31)
**One classifier, two front doors.** `classifyRows()` owns the duplicate rule,
the date rule and the wording a teacher reads. `parseBulkRows()` (paste) and
the sheet sync both feed it `{name, dobRaw}`. Two classifiers that drifted is
the failure this is designed against — the preview must never promise something
the import does not do.
- Four verdicts: **new** · **warn** (name matches, date does not — ADDED and
  flagged, because two children really can share a name and refusing the second
  is worse than the duplicate) · **dup** (skipped) · **bad** (refused).
- The `warn` state exists because writing the test found a real bug: the check
  keyed on name+DOB, but the demo children have no DOB, so a re-run sailed
  through as new and would have duplicated them.
- `DD/MM/YYYY` normalises; anything ambiguous or out of range is **refused, not
  guessed** — misreading 04/02 as April 2nd corrupts a child's age and nothing
  downstream would flag it.
- **Consent is not pasteable.** Imported children arrive `videoConsent:false`
  with the video control locked (DPDP Rule 10 wants it verifiable). Fail-closed.
- Import routes through `Cloud.enrolChild()`, the same seam as the single-child
  form. Skipping it in bulk would mass-produce device-local IDs — the most
  expensive bug in the backlog, thirty at a time. Sequential, not `Promise.all`.
- **Why not a live Google Sheet as backend:** identified minors' data in a
  consumer cloud with link-based access, no row-level isolation, no audit
  trail. It undoes the pseudonymisation seam and moves children's data offshore
  when Supabase was put in the India region precisely to avoid that. Prior art
  is ODK Central Entities — the spreadsheet SEEDS the list, the server stays
  authoritative. Aditya chose sheet-sync anyway (his call, stated once); the
  app therefore only ever READS, and never writes a child back to the sheet.
- **A published link is unauthenticated — the URL IS the credential.** Set once
  by a coordinator in Settings, kept off group chats, re-minted before real
  children go in.

## Play Store — researched 2026-07-31, nothing done yet
**The pilot does not need a production release.** The INTERNAL TESTING track
takes up to 100 testers, releases go live in MINUTES with no review, and it is
exempt from the testing gates that hold up production. That is what replaces
the WhatsApp APK loop for 6 teachers.
- **12 testers × 14 continuous days** applies ONLY to *personal* accounts
  created after 13 Nov 2023, and only to reach PRODUCTION. **Organization
  accounts are exempt.**
- An organization account (IIT Delhi / NCAHT) needs a **D-U-N-S number, ~28
  days to issue**, unless the body counts as a known government organisation —
  IIT Delhi plausibly does. **ASK MANSI BEFORE ANYONE REGISTERS**: picking the
  wrong account type costs about a month either way.
- Google's new developer verification rules land **September 2026** — identity
  details + D-U-N-S for organisations regardless of distribution channel.
- First-submission production review runs 7–14 days. No paid fast track exists.
- Already settled and still correct: target audience **18+** (teachers operate
  the app, children never do), so Families policy review should not trigger.
  Data Safety drafted in `compliance/PLAY-DATA-SAFETY.md`.

**What is technically missing (checked 2026-07-31):** there is NO signing
config and NO keystore — `android/app/build.gradle` is debug-signed only, and
`versionCode` is still **1** (must increase on every upload). Play takes an
**AAB** (`./gradlew bundleRelease`), not the APK we have been sending.
- Upload keystore belongs OUTSIDE the repo; credentials in
  `~/.gradle/gradle.properties`, never in the tree.
- The `signingConfigs` block joins `allowBackup=false`,
  `forceDarkAllowed=false` and `values-v31/styles.xml` on the **local-only,
  re-apply-if-android-is-regenerated** list.
- **VERSION DRIFT:** `build.gradle` says `versionName "1.0"`, `app.js` says
  `APP_VERSION '0.9.0'`. The drawer and the Play listing would disagree. Align.
- **Store listings are PUBLIC.** Demo children Aditya and Vaishu are real
  children with real photos — empty `faces/` before building any release AAB,
  and never let them appear in a screenshot.

**Real blocker is legal, not code:** the privacy policy needs the fiduciary
entity of record and a named grievance officer before it can be published at a
public URL, and that URL gates EVERY track including internal.

## Fetching from Google (2026-07-31)
- `CapacitorHttp` is enabled in `capacitor.config.json`. Without it the fetch
  dies on CORS, because Google redirects a published CSV to another host.
- **Do not trust `res.ok` from Capacitor's patched `fetch`** — it does not
  follow the fetch spec, and a good CSV body arriving with an odd status was
  being thrown away (this produced Aditya's "returned 101"). `fetchSheetCSV()`
  calls `CapacitorHttp.get()` directly and **judges the body first**: if it is
  CSV, it worked, whatever the status says.
- `normalizeSheetUrl()` accepts any of the three links Google hands out for one
  sheet and rewrites anything carrying a spreadsheet id to a CSV export,
  preserving `gid`. A `/pub?…output=csv` link passes through untouched.
- **401 means the sheet is private** — a Google setting, not an app bug.
  Publish to web → the tab → CSV. The `/d/e/2PACX-…` shape is the tell it was
  done right; the `/edit` address alone can never work.
- An unpublished sheet answers with a Google sign-in PAGE and a 200, so a
  status check alone is not enough — `/^\s*</` on the body catches it.

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

## SHELL QUOTING HAS NOW COST THIS PROJECT THREE TIMES
Three separate incidents, same family — text that looks inert to a human and is
executable to a shell:

1. **`#` comments in a pasted snippet.** Interactive zsh does not honour them,
   so `... | grep -c faces/   # expect 0` passes `#`, `expect`, `0` to grep as
   filenames. (It IS honoured in scripts, which is why build.sh was unaffected.)
2. **`<placeholder>` in a handed-over command.** It gets pasted literally;
   `emulator -avd <the name it prints> &` answers `parse error near '&'`. The
   rule written down after that one — *if a command needs a value it cannot
   know, make it a SCRIPT* — is why `scripts/emulator.sh` exists.
3. **BACKTICKS INSIDE A DOUBLE-QUOTED COMMIT MESSAGE (2026-08-25).**
   `git commit -m "... \`choice\` takes its options ..."` runs `choice` as a
   command. The words vanish from the message and the commit still succeeds, so
   nothing fails loudly. **Commit `4099659` is missing two words for this
   reason: they were `choice` and `rating`, both in the FIELD TYPES paragraph.**
   History was left alone — it was three commits deep and already pushed, and a
   force-push over two blanks is a worse trade than this note.

**RULE: in any generated shell — a pasted line, a heredoc'd script, a commit
message — assume `#`, `<`, `>`, `&`, `` ` ``, `$` and `!` are live.** Prefer
single quotes for commit messages, or drop the backticks. A quoted heredoc
(`<<'EOF'`) protects the script's own text at WRITE time; it does nothing for
what the script does at RUN time, which is exactly where this one got through.

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
  `seedSchools`, `verifyCredentials`, `upsertProfile`, `newResearchId`,
  `buildCSV`, `SCHEMA_VERSION`, and the a11y seams table in the ACCESSIBILITY
  section above).
  **Grep for the name, don't trust a line number.** The old `~L213 / ~L280 /
  ~L351 / ~L128` references here were wrong by ~380 lines — `seedSchools` is near
  600, `upsertProfile` 758, `SCHEMA_VERSION` 515, `buildCSV` 1093 as of
  2026-08-21, and they move every session. A wrong reference is worse than none.
  `SPEC.md` is the one place that carries file:line evidence, and it is verified
  against a stated commit.
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
- `MEMORY.md`, `TRACKER.md`, `SPEC.md` (root) · `docs/DESIGN_NOTES.md` ·
  `docs/ROADMAP-AUG-2026.md` · `docs/ARCHITECTURE.md` · `docs/RUNBOOK.md`
- `docs/compliance/` — `DPDP-COMPLIANCE-MAP.md`, `PLAY-DATA-SAFETY.md`,
  `PRIVACY-POLICY.md`, `GUARDIAN-CONSENT-FORM.pdf`,
  `GUARDIAN-CONSENT-FORM-HINDI.md`, `Compliance_updates.pdf`.
  **Path checked 2026-08-21** — it is `docs/compliance/`, never bare
  `compliance/`. `REVIEW_PACKET.md` does not exist anywhere in the tree; earlier
  references to it were wrong.
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
