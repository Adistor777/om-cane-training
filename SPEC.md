# SPEC.md — what the app has to do

_Aditya's description, 31 July 2026. Status verified against the working tree on
`feat/a11y-blind-teacher` the same day — not against project knowledge, which is
17 days stale._

This file is the **definition of done for accounts, children, and data custody**.
It is a spec, not a log. TRACKER.md holds history; this holds the target.
If a requirement isn't a numbered line here, it isn't in the app.

Not covered here on purpose: activities, SOPs, soundboard, accessibility,
visual design. Those are done or live in TRACKER.md.

---

## The eight requirements

| # | Requirement | Status | Evidence in code |
|---|---|---|---|
| 1 | A school reaches out; **we** add the school | PARTIAL | 3 schools hardcoded in `seedSchools()` `app.js:571`; `ensureSchoolsSeeded()` `app.js:585` skips if present. `PILOT_ALLOW_SELF_PROVISION = false` `app.js:557` |
| 2 | We ask how many teachers, **create their login IDs + passwords**, hand them over | MISSING | `verifyCredentials()` `app.js:651` — stub verdict at `:664`, *any non-empty password passes*. `CLOUD_SYNC = false` `store.js:134`; `PILOT_LOCAL_AUTH = true` `app.js:650` |
| 3 | A teacher can **change the password** later | MISSING | No `changePassword` / `updateUser` anywhere in the tree |
| 4 | The **teacher adds children** | DONE | `upsertProfile()` `app.js:729`; enrolment form on the hub. Plus bulk intake added 2026-07-31: paste a list, or Sync from a published sheet — both route through `Cloud.enrolChild()` and inherit whatever #2 and #5 do |
| 5 | An **existing student is never overwritten** | PARTIAL | `upsertProfile` matches on `profile.id` only (`app.js:731`) — edits are safe. No name/DOB duplicate check on add. `researchId` minted locally (`newResearchId()` `app.js:504`); server-minted `enrol_child()` path exists but is behind the OFF flag |
| 6 | The **school never keeps the videos** — they come to us | MISSING (inverted) | Capture is in-app, not a gallery pick (`app.js:3634`, `accept="video/*" capture="environment"`) — good. But **there is no client cloud path at all**: the `Cloud` seam is only `enabled`/`online`/`_init`/`_emailFor`/`signIn`/`enrolChild` (`store.js`). No `.upload(`, no `storage.from`, no `syncRecords`. Records don't sync either. Today the school's device holds everything and we hold nothing but auth and enrolment |
| 7 | Saved results **exportable as CSV / Excel** | DONE | `exportCSV()` `app.js:1093`, `buildCSV()` `app.js:1064`; pseudonymous by default, names behind `includePII` |
| 8 | A teacher exports **only the children they work with** | PARTIAL | `teacherId` is stamped on every record inside `saveRecord` (`app.js:697`) and exported as a column (`app.js:1087`) — but it is a **per-install device id** (`app.js:480-487`), not a person, and `exportCSV` calls `gatherAllRecords()` (`app.js:1094`) with no filter. Server side already exists and is dead: `records.teacher_id uuid references teachers(id)` (`supabase/schema.sql:106`), unused because records never reach the server |

---

## What each gap actually needs

**1 — school list.** Adding a fourth school currently means editing `app.js` and
shipping a new APK. Fix: fetch the school list from the server at login when
online, fall back to the bundled seed. Provisioning itself stays manual
(`supabase/pilot-dashboard-setup.sql`) — an admin UI for six teachers is not
worth building.

**2 — real auth.** The code is written and merged; the flag is off and has never
been verified on a real device. This is a testing job, not a building job.

**3 — password change.** `supabase.auth.updateUser` is small. Decide the
**recovery channel first**: admin resets from the dashboard. Do not wire
email-based reset — the teachers won't reliably have email, and email-only reset
becomes a permanent lockout.

**5 — duplicate children.** Two things: a name + DOB check at enrolment before a
new profile is created, and server-minted research IDs so the same child on two
devices is one child. Both are data-shape changes — cheapest before the pilot
accumulates records.

**6 — video custody.** This is not an uploader, it's the **whole sync layer**.
Nothing but auth and child enrolment has a client path to the server today, so
"we hold the videos" means building `Cloud.syncRecords()`, `Cloud.uploadVideo()`,
an offline queue, and delete-everywhere — the backend P0 work deferred on
2026-07-22. Two schema gaps block it: group records (`records.research_id` is
NOT NULL, `schema.sql:104`) and the unresolved `teacher_id` FK.

*Already decided, don't reopen:* video ships in the pilot (R&D decisions locked
2026-07-03). *Still open:* retention — is the clip **research data** (kept and
analysed for years) or **fidelity QA** (watched once, scored, deleted)? And the
2026-07-29 question: a blind teacher cannot frame a shot, confirm the child is
in it, or check the clip afterwards.

**8 — export scoping.** Two changes: bind `teacherId` to the **login session**
instead of the install, and filter export rows by it. Be honest that until
records actually sync, this is a **UI convenience, not a security boundary** —
anyone with the device and a file browser is outside it. The real boundary is
the RLS policy on `records` (school AND teacher), which needs #6's sync layer
before it can do anything.

---

## Order of work

```
2  →  5  →  6 (sync layer)  →  8  →  3  →  1
```

- **2 first.** A teacher id on a record proves nothing while any password passes.
  Code is written and merged; the flag is off and untested on a device.
- **5 next.** Server-minted child IDs and a duplicate check are data-shape changes
  — cheapest before the pilot accumulates records, and offline-enrolled children
  are un-syncable by FK, so every one created now is a migration later.
- **6 is not last, and it is not small.** It's the sync layer everything else
  needs. Its schema gaps (group records, `teacher_id` FK) get resolved here.
- **8 finishes on top of 6.** The client-side filter can ship earlier as a
  convenience, but the enforceable version is an RLS policy, which needs 6.
- **3 and 1 are small** and slot in anywhere after 2.

---

## Rule for this file

Update the status column when a line changes. Don't add history — that's
TRACKER.md. A new requirement gets a new numbered line, or it isn't in the app.
