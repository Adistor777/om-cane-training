# DEVICE-MATRIX.md — the cloud + media verification, on a real phone

The last engineering gate before the first school. `ROADMAP-SEP-2026.md` Phase 0:
*"done when the matrix is written into `docs/` with results, and the flag can be
turned on for the pilot without anybody guessing."* **Fill the Result column in
and commit this file** — that is what closes it.

Everything here is a **testing** job, not a building one. The code has been merged
since 6 July (`feat/cloud-sync`) and has never once run on a device.

**Do it in one sitting, on a real phone.** The emulator cannot answer a single
question on this page: it has no audio (confirmed 24 Aug — the same clips play on
a handset and are silent on `Pixel_10_Pro_XL(AVD)`), no real content picker, and
no real network conditions.

---

## Before you start

### 1. A second auth user has to exist, or assertion A5 cannot run

Only `saksham01@test.local` was ever provisioned (3 July). Cross-school isolation
cannot be tested with one account — there is no other school to be refused as.

In the Supabase dashboard, mirror what was done for Saksham:

- **Authentication → Users → Add user**: `rnks01@test.local`, auto-confirm, note
  the password somewhere you will still have it in twenty minutes.
- Set its `app_metadata.school_id` to `sch_rnks_jaipur`.
- Insert a matching **active** row in `teachers` with `auth_user_id` linked —
  `enrol_child()` is security-definer and refuses anyone who is not an active
  roster teacher.

`supabase/pilot-dashboard-setup.sql` has the shape of all three steps; it was
written for Saksham, so change the school and the email.

### 2. Turn the flag on

`store.js` line 134:

```
const CLOUD_SYNC = true;
```

Then the usual, and **it stays on** — Phase 1 runs with cloud enrolment, and that
is the whole point of doing this now rather than after a school starts.

```
./scripts/build.sh
bash scripts/install.sh
```

### 3. Know the trap in A1 before you hit it

`PILOT_LOCAL_AUTH` is `true` (app.js:841). It is scoped narrowly and correctly —
a server that *rejects* a password is final, and the stub only fires when the
server is **unreachable**. But that means a flaky connection turns A1 into a
false pass: the app falls back to the stub, any non-empty password works, and it
looks exactly like the flag not being on.

**Run A1 on known-good wifi.** If a wrong password gets in, check signal before
you check code.

---

## Part A — the cloud matrix

| # | Assertion | How | Expected | Result |
|---|-----------|-----|----------|--------|
| A1 | A wrong password fails **online** | Saksham School → `saksham01` → a deliberately wrong password, on good wifi | Refused. `Cloud.signIn` returns `offline:false`, so `verifyCredentials` returns null with no fallback | |
| A2 | The **server** mints the child ID | Sign in properly → add a NEW child | A research ID shaped `OM-XXXX-XXXX`, and a row in `children` | |
| A3 | Offline enrolment is blocked, clearly | Airplane mode → add a NEW child | Refused with: *"No internet — a new child can only be enrolled online (their ID comes from the server). Connect and try again. Existing children keep working offline."* No local child created | |
| A4 | Offline work still works | Still in airplane mode → edit an existing child, then run a full activity and save a record | Both succeed. Edits stay local by design and the existing `researchId` is **preserved**, never re-minted | |
| A5 | One school cannot read another's children | See below | Zero Saksham rows | |

### Verifying A2 properly

Supabase → SQL editor:

```
select research_id, name, school_id, created_at
from children
order by created_at desc
limit 5;
```

`school_id` must read `sch_saksham_noida`. The significant part is *why*: the
device never sends it. `enrol_child()` stamps it from the signed-in teacher's JWT,
which is what makes a compromised or modified client unable to write into another
school.

### A5 needs the dashboard, not the app

Be aware of what you are actually testing. The app has **no cloud read path yet** —
`Cloud` is `signIn` + `enrolChild` and nothing else, so the child picker shows
local profiles whether or not the server would allow it. Seeing a Saksham child on
an RNKS phone would prove nothing, and *not* seeing one would prove nothing either.

Test the server directly. Attach Chrome DevTools to the WebView
(`chrome://inspect`), sign in on the phone as `rnks01`, and in the console:

```
await Cloud._init().from('children').select('research_id, school_id')
```

It must come back empty, or with RNKS rows only — never the Saksham child from A2.
Then repeat signed in as `saksham01` and confirm that same call *does* return the
child, so you know the query works and the emptiness was the policy, not a typo.

This assertion gets much wider in Phase 2, when records and video start syncing.
Today it covers `children` and nothing else. Say that in the results rather than
recording a broader pass than you ran.

---

## Part B — the video picker

Parked since July for want of a real device. The picker hands back a `content://`
URI, which the emulator does not reproduce.

| # | Assertion | How | Expected | Result |
|---|-----------|-----|----------|--------|
| B1 | A clip is captured and stored | A child **with** video consent on file → record screen → capture a clip → Save | Record saves; `commitPendingVideo` resolves the URI and copies in 3 MB slices to `videos/{researchId}_{timestamp}.{ext}` | |
| B2 | The record points at the file | Re-open that record | The clip is listed and plays | |
| B3 | No consent, no clip — fail closed | A child **without** consent | The video control is locked and no clip is committed | |
| B4 | Group activities never take video | Any `group:true` activity | The control is not rendered at all | |

B3 and B4 matter more than B1. Per-child consent cannot cover an unidentified
group, and DPDP Rule 10 wants the consent verifiable — the design fails closed on
purpose, so confirm it still does.

---

## Part C — the audio pass

**No gate can catch a defect here, ever.** jsdom has no media decoder, which is
exactly how every cue and narration in this app stayed silent from 13 July to
24 August while 40 unit tests, 93 flows, 32 axe assertions and 621 activated
controls all passed. This is a permanent manual step before any build ships.

| # | What | Count | Result |
|---|------|-------|--------|
| C1 | Direction → Basic command pads | 8 pads, English cues | |
| C2 | Direction → Advanced compass face | 8 points, English cues | |
| C3 | SOP narration, English | the 4 real SOPs | |
| C4 | SOP narration, Hindi | the 4 real SOPs | |
| C5 | Soundboard | 22 sounds | |

**Two files specifically, both changed on 1 September:**

- **`dir-basic-commands` narration in ENGLISH.** It was the one file the 27 August
  regeneration run missed — still speaking the pre-25-August four-step text while
  the screen showed the new one. Regenerated 1 Sep 10:58. Listen to it *against the
  steps on screen* and confirm they now agree.
- **`rain.mp3` in the soundboard.** Was 27.6 MB and 14 minutes 22 seconds; now 10
  seconds, mono, with a quarter-second fade each end. Confirm it plays and still
  works as a cue.

**What a failure sounds like.** Since 24 August a refused cue toasts the real
error name instead of failing silently, so if something does not play you should
see *why*. Silence with no toast is a different and worse bug — write down which
screen and which cue.

---

## Part D — touch targets on the compass

The axe gate states outright that it cannot measure size or contrast without a
layout engine, so this is eyes and thumbs.

| # | Assertion | Result |
|---|-----------|--------|
| D1 | On a 360 px-wide phone, all 8 compass pads are comfortably tappable — cardinals 66 px, intercardinals 56 px | |
| D2 | Nothing on the compass screen overlaps or clips at the largest text size (Settings → Display) | |

---

## Results

_Date:_
_Phone / Android version:_
_Build:_
_Run by:_

_Notes, and anything that failed:_

---

## Afterwards

- Commit this file with the Result column filled in. That closes Phase 0.
- Leave `CLOUD_SYNC = true`. Every child enrolled while it is off is a permanent
  migration later — `records.research_id` is a foreign key into `children`, so a
  device-minted child has no cloud parent and their records can never sync, and
  `backfill_child` cannot merge a child enrolled offline on two devices.
- If A1–A5 pass, Phase 1 is gated on legal alone: the guardian consent form cannot
  be printed with placeholders in it.

## Footnote on APK size, 1 September

The build is **101.5 MB**, down 6.6 MB rather than the ~27 MB the `rain.mp3` cut
should have given. The difference is roughly 21 MB of terrain demo video that is in
this build and was not in the 27 August one. Video is now most of the package:

| File | Size |
|---|---|
| `demo-snddir-steps-solo.mp4` | 22.1 MB |
| `demo-terrain-walk.mp4` | 16.1 MB |
| `demo-terrain-setup.mp4` | 4.1 MB |
| everything else | the remaining ~10 MB of media |

Trimming those changes what a teacher watches, so it is a content decision, not a
build one. Worth raising alongside the note in TRACKER that the whole `terrain`
category — three activities and 21 MB of video — appears nowhere in TRACKER or
MEMORY and is the one category with no written history.
