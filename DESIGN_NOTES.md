# O&M Cane Training — Design Notes

Keep this file next to the project. It is the "why" behind the look. The app is
built so **non-coders edit `activities.js`**, but anyone editing `index.html`'s
appearance should read this first. The CSS has short inline reminders; this is
the full version.

## Direction: "field notebook, not dashboard"

Quiet, editorial, confident. Personality lives in exactly two places per screen:
one large display-serif title (the lede), and one accent-colour placement.
Everything else gets out of the way so a teacher can glance and log a result in
seconds. The point of view is **restraint**.

History: earlier versions weren't too plain, they were too evenly busy — a
colour stripe on every surface, shadows everywhere, two clashing fonts. Almost
every design move since has been *subtraction*.

## The guardrails (don't undo these)

1. **One accent, not five.** The colour spine (the 5px stripe) appears ONLY on
   category cards on screen 1, where it does real wayfinding. Panels, the SOP
   box, records, and the form have no stripe. On the run screen the category
   colour shows in exactly two spots: the **Save button** and the **active
   result selection**. Repeating an accent on five surfaces turns it into
   wallpaper; using it twice makes it mean something. **Do not add a third.**

2. **One shadow tier.** The page is flat. The single shadow (`--shadow-lift`)
   is reserved for the **primary form panel** and **hover-lifted cards**, so
   "elevated" reads as "interactive / important." Records and Past-results are
   border-only — a list, not floating objects. Don't add a second shadow level.

3. **The serif is sacred and singular.** Instrument Serif appears once per
   screen, large, on the `.lede` only — never on labels, buttons, or panel
   titles. Inter does all UI/body/title work. If you need a second heading
   level, use Inter 600, not the serif. (Inter for functional UI in an
   accessibility-critical tool is the correct call; the serif lede carries the
   character.)

4. **Differentiated radii.** Containers 20px, records 14px, inner controls
   11px. The inner/outer contrast is what makes it feel designed; all-one-radius
   is a template tell.

5. **Colour is contrast-checked — keep it that way.** Every one of the 7
   category hues, and every text/background pair, meets WCAG AA (4.5:1). This is
   a tool for the blindness community; accessibility is the brand, not polish.
   - `--ink-faint` is `#736b5e` on purpose: lighter warm-grays (e.g. `#9a9286`,
     `#857c6d`) fail 4.5:1 at the 12–13px sizes used for count text, record
     timestamps, and the empty state on the warm paper. **Re-check any colour
     change at 12px before shipping.**
   - The "with cane" tag is fixed rust on every category (a semantic marker,
     not a category accent). This is a deliberate decision, not an oversight.

**Rule of thumb:** when something "looks too plain" or "looks AI," *subtract*
(a stripe, a shadow, a gradient, a font) before you add. Adding decoration to
fix the look is what made earlier versions worse.

## Settled engineering (do not regress)

These came out of four audit passes and are correct; don't undo them while
restyling:

- **Post-save flow:** after Save, the screen re-renders with `dir:'none'` (no
  entrance slide), the SOP collapses, and focus + smooth-scroll land on the
  form — one focus target per paint (no double screen-reader announcement).
- **SOP disclosure** animates open/close via the `grid-template-rows: 0fr→1fr`
  technique (both directions), ~260ms.
- **Result pill priority:** in saved records, the Independent/Prompted/Unable
  result sorts first and gets the one bit of colour; counts/notes stay neutral.
- **Segmented control** uses fill-only selection (no checkmark — a checkmark
  implied "success," which is wrong on "Unable"). Outcome-neutral by design;
  confirm any change with the O&M lead.
- **Reduced-motion** is respected comprehensively (slides, card stagger, hover
  lift, `:active` scales, chevron rotation, SOP animation).
- **Accessibility plumbing:** real `<h1>` per screen (the lede), focus moved to
  it on navigation, `fieldset`/`legend` on the form, monoline SVG icons (no
  emoji), 42–44px tap targets, high-contrast crumb.
- **Storage** is `localStorage` on the one laptop. Nothing is uploaded.

## Open decisions (for the O&M lead, not the developer)

- Whether "Unable" should look visually distinct from "Independent" at all
  (currently all three selected states look identical — outcome-neutral).
- Whether the "with cane" tag should pick up the category hue instead of fixed
  rust (currently fixed, on purpose).

## Known follow-ups (designer's call)

- Category cards still use a single letter in the `.blob`. Real per-category
  icons (compass, ear, footprints, mat…) would lift screen 1 — extend the
  existing SVG `ICON` set.
- `backdrop-filter` on the header degrades gracefully; verify on the target
  classroom laptop/browser. The solid `rgba(255,253,248,.82)` fallback is fine.
