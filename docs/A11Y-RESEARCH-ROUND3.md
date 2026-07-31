# Designing for a blind teacher — what the evidence says

_2026-07-30. Written after round-3 feedback: "too accessible", "the student name
is only said after selection", "we are doing it wrong — look at how existing
apps do this."_

This is a research note, not a change list. Nothing here is implemented yet.

---

## 1. The reframe that matters most

I have been treating "accessible" as **more speech**. That is the wrong axis,
and it is why the reviewer said *too accessible*.

There are two completely different sources of speech, and only one of them is
ours:

| Source | Who controls it | Examples |
|---|---|---|
| **TalkBack's own reading** of role, state, hints, container info | **The user.** TalkBack has verbosity presets (High / Custom / Low) and individual switches for usage hints, roles, container info and punctuation. Power users routinely turn hints off. | "button", "not selected", "double tap to activate", "list, 12 items" |
| **Our `aria-live` announcements** | **Nobody but us.** The user cannot turn these off from TalkBack at all. | "Vaishu selected. 3 of 12 selected.", "Saved", "Stopped dog" |

The guidance is explicit that live-region messages should be concise because
**"screen-reader users have no control over it"** ([MDN][mdn-live],
[UXPin][uxpin]).

So:

- **Anything TalkBack already says, we must not say again.** Duplicating it is
  pure noise and the user cannot mute it.
- **Our announcements are the entire "too accessible" surface.** Every one is a
  sentence the teacher is forced to hear, forever.
- A Brief/Full setting is legitimate — but it must govern **only our
  announcements**, never try to re-implement what TalkBack's own verbosity
  settings already do. Building a second verbosity system on top of the user's
  own is how apps get worse, not better.

**Recommended default: Brief.** Full stays available for a first-week or less
confident user.

---

## 2. Why "the name is only said after selection" — solved

The name is not missing. `posLabel()` already produces
`"Vaishu, student 3 of 12"` as the tile's accessible name.

The problem is **ordering, and it is not ours to control**: VoiceOver announces
"selected" *before* the accessible name, and TalkBack behaves the same way for
state ([A11Y Collective][a11y-selected], [MDN aria-selected][mdn-selected]).

So on every swipe he hears:

> "Not selected. Vaishu, student three of twelve. Button."

The name is the **third thing**, behind a state word and in front of a position
count and a role. By the time it arrives he has already started moving. When he
double-taps, our live region says "Vaishu selected" cleanly, with nothing in
front of it — so the name *feels* like it only exists at selection.

**This makes the fix obvious and it is a subtraction, not an addition:**
strip `, student 3 of 12` from the per-tile label. The position is genuinely
useful **once**, and it is noise on all twelve swipes. Then the name is the
first content word after the unavoidable state.

That single change serves *both* complaints at once — it is the "too accessible"
fix and the "name comes too late" fix.

---

## 3. The grid of faces is the real design problem

Research on how blind people actually navigate mobile apps
([NN/g][nng], [TetraLogical][tetra], [GDS user research][gds]):

- They move **linearly**, swiping element to element.
- Or they **sweep a finger across the screen "like a metal detector"** to
  discover what is where.
- They **jump by heading** to skip whole sections.

A 4×3 grid of faces is a *grid* only to someone who can see it. To the reviewer
it is a **flat list of twelve items**, and the spatial arrangement carries no
information at all. Worse: to answer *"who have I picked so far?"* he must swipe
through all twelve again and remember the states as they go past.

### Options

| # | Option | What it gives a blind teacher | Cost |
|---|---|---|---|
| **A** | **Selection summary line** — a focusable "Selected: 3 — Vaishu, Rahul, Aditya" directly above the grid, updated live | Answers "who have I picked?" in **one swipe** instead of twelve. Also the natural place for the count we are removing from tiles. | Small. One element. Sighted teachers get a useful summary too. |
| **B** | **Group into headings** — "Selected (3)" and "Not selected (9)" as real `<h2>`s, children move between them | Heading-jump navigation; the two questions ("who is in?", "who could I add?") become two destinations | Medium. Tiles reorder as you select, which is disorienting for *sighted* users — likely a net loss. |
| **C** | **Search/filter field** | Fast for a large roster; typing a name beats 12 swipes | Medium. Only pays off above ~15 children; pilot schools are smaller. |
| **D** | **Leave the grid, fix the labels only** | Cheapest | Does not solve "who have I picked?" at all |

**Recommendation: A + D.** A summary line plus name-first labels. B trades a
blind-user gain for a sighted-user regression, which violates the standing
constraint that the sighted design must not move. C is premature at pilot size.

---

## 4. What to cut and what to keep (the Brief/Full split)

Proposed, for review — not implemented.

| Announcement | Brief | Full | Reasoning |
|---|---|---|---|
| "Vaishu selected" on tap | **keep** | keep | The one thing TalkBack will not say. Non-negotiable. |
| ", 3 of 12 selected" appended to every tap | cut | keep | Available on demand from the summary line |
| ", student 3 of 12" in every tile label | **cut entirely** | cut entirely | Position on every swipe is the core verbosity complaint |
| "Saved" | keep | keep | Confirms a write happened; nothing else does |
| "Stopped dog" / "Playing dog" | keep | keep | The pad's own name already flips; this confirms the action landed |
| "Repeat one — this sound will loop until you stop it" | shorten to "Repeat one" | keep full | The warning matters the first time, not the fiftieth |
| School-pick: "Saksham School selected. Enter your login ID and password." | shorten to "Enter your login ID and password" | keep | The school name is already on the control he just used |
| Screen-change announcements | keep | keep | This is orientation, not chatter |

---

## 5. Two confirmed defects, independent of all the above

Both verified in code today. Neither needs a design decision.

### 5a. High contrast mode makes text invisible — measured

`[data-contrast="high"] [aria-pressed="true"]` sets `background:var(--ink)`
(black) and `color:#fff`. But child elements that declare **their own** colour
do not inherit that white:

| Element | Colour | On black | WCAG AA needs |
|---|---|---|---|
| `.who small`, `.action-text small` | `--ink-faint` `#262626` | **1.39 : 1** | 4.5 : 1 |
| `.pick-tile.is-active .pick-name` | `--cat-deep` `#002417` | **1.26 : 1** | 4.5 : 1 |

1.26:1 is invisible. This is exactly the reported "the colour of the text is not
visible" — and it is a **low-vision** bug, hitting the users high-contrast mode
exists to serve.

Fix: when a container inverts, its descendants must inherit
(`[data-contrast="high"] [aria-pressed="true"] *{ color:inherit; }`).

**My contrast gate missed this** because it tests token *pairs*, not "a child's
own colour inside an inverted parent". The gate needs that case added.

### 5b. "Don't show again" destroys focus

`dismissHelpTip()` calls `t.remove()` on the element **containing the button the
teacher just pressed**. Focus dies, falls to `<body>`, TalkBack loses its cursor
and reads the window from the top — the identical failure mode as the
`disabled` bug from round 2. `dismissHint()` has the same shape.

Fix: move focus to a sensible neighbour *before* removing, and announce the
dismissal.

---

## 6. Research handles

**Search terms:** `screen reader verbosity preferences blind users`,
`aria-live overuse`, `mobile screen reader navigation patterns`,
`TalkBack verbosity presets`, `accessible multi-select pattern`,
`touch exploration blind spatial layout`.

**Worth reading properly next:** WebAIM's screen-reader user surveys (recurring,
self-reported navigation behaviour); NN/g's mobile screen-reader studies; the
GDS accessibility blog's observational research with blind users — that last one
is the source of the "metal detector" finding and is the closest in method to
what Mansi ma'am is doing now.

**Still unresearched and relevant to this app:** how blind *teachers* (as
professionals, not consumers) use assessment tools; whether any O&M assessment
instrument has a documented non-visual administration protocol. I have not found
one, and that gap may be more interesting than the app.

---

## Sources

- [MDN — ARIA live regions][mdn-live]
- [MDN — aria-selected][mdn-selected]
- [UXPin — ARIA Live Regions for Dynamic Content][uxpin]
- [Sara Soueidan — Accessible notifications with ARIA live regions][sara]
- [TetraLogical — Browsing with a mobile screen reader][tetra]
- [NN/g — Challenges for Screen-Reader Users on Mobile][nng]
- [GOV.UK — Research with blind users on mobile devices][gds]
- [The A11Y Collective — aria-selected practical examples][a11y-selected]
- [Android Accessibility Help — Learn about TalkBack settings][talkback]
- [Accessible Android — Overview of TalkBack screen reader settings][acc-android]

[mdn-live]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
[mdn-selected]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-selected
[uxpin]: https://www.uxpin.com/studio/blog/aria-live-regions-for-dynamic-content/
[sara]: https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-2/
[tetra]: https://tetralogical.com/blog/2021/10/05/browsing-with-a-mobile-screen-reader/
[nng]: https://www.nngroup.com/articles/screen-reader-users-on-mobile/
[gds]: https://accessibility.blog.gov.uk/2016/06/09/research-with-blind-users-on-mobile-devices/
[a11y-selected]: https://www.a11y-collective.com/blog/aria-selected/
[talkback]: https://support.google.com/accessibility/android/answer/6006589?hl=en
[acc-android]: https://accessibleandroid.com/an-overview-of-talkback-screen-reader-settings/
