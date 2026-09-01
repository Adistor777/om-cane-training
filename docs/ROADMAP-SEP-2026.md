# Roadmap — 25 August → early October 2026

Re-baselined from today's real state, replacing `ROADMAP-AUG-2026.md`. That
plan is kept as history; its banner explains why it slipped.

**Shape chosen (Adi, 25 Aug): run an offline pilot first, cloud follows.**
The app already signs in, enrols, runs every activity, records results,
captures video and exports CSV. What it cannot do is get any of that off the
device. Rather than hold the schools for six more weeks of backend built
against zero field use, the first school runs on what exists — and the sync
layer lands while real feedback is arriving.

---

## Ethics — CLOSED (Adi, 2026-08-25)

Ethics approval is handled. This was the only open item that could have
*invalidated work already done* rather than merely delayed it, so closing it
changes the plan's shape: **collection is no longer gated on an unknown**, and
Phase 1 now waits only on legal filling the consent-form placeholders.

Three things should still be pulled out of the protocol document, because each
one currently sits open elsewhere in this project and the protocol probably
already decides it:

1. **Video retention — research data or fidelity QA?** Kept and analysed for
   years, or watched once, scored, deleted? This blocks the uploader design in
   Phase 2 and is the input to R20/R21's retention clocks. If the protocol
   specifies a retention period, that number wins over any engineering choice.
2. **Do researchers get children's names (R17)?** The protocol's data-handling
   section either covers this or it does not, and the guardian consent form has
   to say so *before* collection, not after.
3. **The approval date.** Anything collected before it is in the usual grey
   area. Pre-pilot test records are not a concern; this matters only if any
   real child data has already been recorded anywhere.

## Video — DECIDED (Adi, 2026-08-25), and it contradicts R20/R21

**Video is research data. Researchers must be able to access it whenever they
want.** That closes the research-vs-fidelity-QA question that has blocked the
uploader design since July: the server copy is a long-lived archive, not a
scratch buffer.

### The contradiction, stated for whoever owns the requirements sheet
`R20/R21` specify retention clocks — **30 days post-download and a 90-day hard
ceiling**, with a scheduled deletion job. "Researchers can access it whenever
they want" and "the server copy is deleted at 90 days" cannot both be true.

This is not an engineering call and it should not be resolved by whoever writes
the uploader. The most likely reading — worth confirming, not assuming — is
that the clocks were meant for **downloaded copies on somebody's laptop**, not
the archive itself. That reading is coherent: a 30-day clock on a copy that has
left the system, an archive that persists. If instead the 90-day ceiling really
does apply to the server copy, then R17 and this decision both need revisiting.

**Until it is confirmed, build the archive with no auto-delete and keep the
deletion machinery.** Adding a clock later is a config change; recovering video
a job has already deleted is not.

### What this changes in Phase 2
- **No retention job on the server copy.** R20/R21 becomes a clock on
  downloads, pending confirmation. The scheduled-deletion work drops out of the
  critical path.
- **C4 / R25 download logging gets MORE important, not less.** Indefinite
  retention of identifiable face video of disabled minors means access control
  and an access trail are the whole safeguard — there is no longer a deletion
  date doing that work. Downloads go through a function that issues a
  short-lived signed URL and writes a log row. This moves up in Phase 2.
- **Guardian erasure still has to be real.** Indefinite retention is not the
  absence of deletion. A guardian's request to erase a child's data remains a
  permanent delete-everywhere, and is now the *only* path by which video leaves
  the archive.
- **A researcher role and a view path are new scope.** "Access whenever they
  want" implies people who are not teachers signing in and browsing clips —
  which does not exist today. It shares plumbing with R35 (the head watching
  clips from their school), so build them together.
- **Compression choice compounds forever.** C2 was already required; with an
  archive that only grows, the codec and bitrate picked once are paid for every
  month thereafter.

### Storage: not the constraint, at this scale
Supabase Pro is **$25/month with 100 GB of file storage and 250 GB egress
included**, egress beyond that at **$0.09/GB**.

At the adopted 60-second cap and on-device compression to roughly 8–12 MB per
clip:

| Scenario | Clips | Storage |
|---|---|---|
| 60 children × 17 activities, one pass | ~1,000 | **~10 GB** |
| Same, four passes a year (longitudinal) | ~4,000 | **~40 GB/yr** |
| Video on every weekly session, one term | ~1,800 | **~18 GB/term** |

So year one fits inside the included 100 GB and the pilot costs about $25/month.
Year two or three is where an archive that never deletes starts to matter, and
that is a budget conversation rather than an engineering one. **The 60-second
cap is doing most of the work here** — without it, uncompressed 30–60 MB
captures would put the first scenario alone near the plan limit.

**Put the protocol in `docs/compliance/` and commit it.** It is now a governing
document for this build, and it should not live only in somebody's inbox — the
same mistake `OM-Requirements.md` is currently making.

---

## The decision that saves the most rework

**The offline pilot should still use cloud enrolment.**

This is Architecture A exactly as locked on 2026-07-03: online-only enrolment,
one moment of connectivity per child, assessments offline forever after. It
costs a teacher one connected minute per child.

What it avoids is the single most expensive item in the backlog. With
`CLOUD_SYNC=false`, `newResearchId()` mints IDs on the device; `records.research_id`
is a foreign key into `children`, so a locally-minted child **has no cloud
parent and their records can never sync**. Every child enrolled during an
offline pilot would be a migration later, and `backfill_child` cannot merge a
child enrolled offline on two devices — that is two rows, permanently.

The code for this is already written and merged (`feat/cloud-sync`, 6 July). It
has never been verified on a device. That verification is Phase 1's first item
and it is a **testing job, not a building job**.

---

## Phase 0 — this week (Aug 25–31): unblock, and verify what exists

Nothing here is new code. Two of the three items are emails.

### Chase — send today, all three
1. **Mansi — the protocol document itself.** Ethics is approved (25 Aug). Ask
   for the document so its retention period, its position on researchers seeing
   names (R17), and its approval date can be read off rather than assumed —
   then commit it to `docs/compliance/`. *Framing: "three open engineering
   decisions are probably already answered in it."*
2. **Legal — the consent form blocks the pilot, not just the Play Store.**
   Fiduciary entity of record, grievance officer, effective date, Rule 10
   sign-off, educational-institution exemption. The form cannot be printed with
   placeholders in it. Send the R17 and R35 widenings in the same message —
   researchers seeing children's names, and the head being able to watch clips,
   are both wider than what the current form asks a guardian to agree to.
   *Framing: "printing consent forms is blocked; a first school cannot start."*
3. **Mansi — real teacher names + Play Store account type.** Accounts take five
   minutes once names arrive. The account-type call must happen **before anyone
   registers**: an organisation account needs a D-U-N-S number (~28 days) unless
   IIT Delhi counts as a known government body, and picking wrong costs about a
   month either way.

### Build — the M2 device matrix, finally
- [ ] Real device, `CLOUD_SYNC=true`: a wrong password fails **online**; a
      server-minted `OM-XXXX-XXXX` lands in `children`; airplane-mode enrolment
      is blocked with a clear message; edits still work offline; a cross-school
      read returns nothing.
- [ ] The parked video-picker test (`content://` URI through `commitPendingVideo`).
- [ ] The parked audio pass — every command cue, the soundboard, and SOP
      narration in each language that has files. Device-only, forever.

**Done when:** the matrix is written into `docs/` with results, and the flag can
be turned on for the pilot without anybody guessing.

### Foundation — hours, not days, and none of it waits on a decision
- [ ] **CI.** There is no `.github/` at all; the seven suites run when someone
      remembers. A workflow running `build.sh`'s gates on push is the single
      highest-leverage item on this list.
- [ ] **`build.sh` cannot fail at the verify step** (`scripts/build.sh:151` —
      a missing built asset is skipped, not failed). The gate is currently
      decorative.
- [ ] **Double-submit on three save paths** — `lockBtn` released on a timer, not
      on completion. A second tap after the timer saves again, and duplicate
      records corrupt research data.
- [ ] `jsdom` moved to `devDependencies`; three dependency advisories.
- [ ] **WebView floor stated and detected.** Below it a teacher is locked out
      behind a *wrong-password* message, which is a lie.
- [ ] `sounds/rain.mp3` — 27.6 MB, 14 min 22 s at 256 kbps, for a drill cue.
      A quarter of the APK.

---

## Phase 1 — one school, running (Sep 1–14)

Saksham, Noida: best connectivity, and the test teacher already exists there.

- [ ] **Turn `CLOUD_SYNC` on** once Phase 0's matrix passes. Real passwords,
      server-minted child IDs. Assessments stay entirely offline.
- [ ] **SPEC #3 — password change.** `supabase.auth.updateUser` is small. Decide
      the recovery channel first: **admin resets from the dashboard**. Do not
      wire email-based reset — the teachers will not reliably have email, and
      email-only reset becomes a permanent lockout.
- [ ] **Signing keystore + `signingConfigs`.** Needed for Play later, but needed
      *now* for a different reason: the pilot APK is debug-signed, so only
      Aditya's Mac can ship an update. If that laptop dies mid-pilot, six
      teachers are frozen on whatever build they have. Keystore lives outside
      the repo; credentials in `~/.gradle/gradle.properties`.
- [ ] **Align the version drift** — `build.gradle` says 1.0, `app.js` says 0.9.0.
- [ ] Teacher accounts provisioned from the real roster.
- [ ] Consent forms printed **with serial numbers**, once legal fills the
      placeholders.
- [ ] A one-page teacher quick-start in `docs/handoffs/`.
- [ ] **Consent-clean the APK** before it leaves the team: empty `faces/`, then
      `unzip -l … | grep -c faces/` must be 0.
- [ ] Full dry run on a clean phone: install → login → enrol online → assess
      offline → video → export CSV → open it.

**Done when:** a real teacher with a real account completes a real assessment on
their own phone, and the CSV opens correctly.
**Gate:** legal only. Ethics closed 25 Aug; the consent form still cannot be
printed with placeholders in it, and that is now the single blocker on the
first school.

### What Phase 1 deliberately does NOT do — say this out loud to Mansi
- **SPEC #6 is unmet.** The school's device holds every record and every clip;
  we hold nothing but auth and enrolment. "Videos come to us" is the whole sync
  layer, not an uploader, and it is Phase 2.
- **Custody is manual.** CSV export by the teacher, handed over deliberately.
  Acceptable for one school for a few weeks. **Not acceptable at three.**
- Retention clocks (R20/R21) do not exist, so the 30-day and 90-day ceilings
  cannot be honoured yet. Video on a personal phone (R36) is bounded only by
  the 60-second clip cap and by asking teachers to hand clips over promptly.
- No class model, no head role, no download logging, no activity log.

---

## Phase 2 — cloud custody (Sep 15 → Oct 5)

The critical path, ordered by **rework risk** — un-backfillable first. This is
SPEC's `2 → 5 → 6 → 8 → 3 → 1`, with the requirements sheet's class model
folded into 6 where it belongs.

- [ ] **Schema gaps first.** `records.research_id` is `NOT NULL`, which blocks
      group records entirely; `records.teacher_id` must be resolved server-side
      from `auth.uid()`, not sent by the client.
- [ ] **Classes and assignments (R13/R14).** Classes do not exist in the schema
      at all. Access must be **looked up from an assignments table per row** —
      a claim baked into the login token goes stale mid-term and a revoked
      assignment keeps working. R34: classes are per-school editable rows, not
      an enum. **This lands inside the sync work, not after it** — retrofitting
      a sharing boundary onto a shipped sync layer is the expensive version.
- [ ] **`Cloud.syncRecords()`** — idempotent upsert on the client UUID. R11+R13
      mean records sync **both ways**: two teachers sharing a class must see
      each other's sessions. Upload-only was never going to satisfy it.
- [ ] **`Cloud.uploadVideo()`** — re-check `videoConsent` before every upload,
      fail closed. Path `{school_id}/{research_id}_{ts}.{ext}`, private bucket.
- [ ] **C2 — compress on device before upload**, plus the adopted 60-second cap.
      Capture is currently `accept="video/*" capture="environment"` with no
      transcode: 30–60 MB per 30 s, which will not move over Kullu's connection.
- [ ] **Delete-everywhere.** A guardian's erasure request is a real, permanent
      delete — the opposite of D5's departing teacher.
- [ ] **C4 — download logging. Moved UP.** Bucket access logs nothing by
      default. With the archive now permanent, access control and an access
      trail are the entire safeguard — there is no deletion date doing that work
      any more. Downloads go through a function issuing a short-lived signed URL
      and writing a log row. R25 depends on it.
- [ ] **A researcher view path + the head's watch-only path (R35).** New scope
      from the 25 Aug video decision: people who are not teachers signing in and
      browsing clips. Shares plumbing with R35 — build them together. Watch-only
      means a stream that never hands over the file.
- [ ] ~~R20/R21 retention job on the server copy~~ — **dropped from the critical
      path** by the 25 Aug decision that video is a research archive. Re-confirm
      that the clocks were meant for downloaded copies. Keep the deletion
      machinery: adding a clock later is config, un-deleting is not.
- [ ] **SPEC #8 — export scoping.** Bind `teacherId` to the login session rather
      than the install, and filter. Be honest that until records sync this is a
      UI convenience, not a security boundary — the real boundary is the RLS
      policy, which needs this phase.

**Done when:** a clip and a record made offline on a phone appear in the
dashboard after a sync; withdrawing consent wipes the server copy; a
cross-school read returns nothing; and a class-scoped read returns only that
class.

---

## Phase 3 — three schools + Play internal (October)

- [ ] **Multi-device proof (old M4).** A child enrolled on device A is assessed
      on device B and both join under one `research_id`. This is the research
      demo.
- [ ] **Play internal testing track.** Up to 100 testers, live in minutes, no
      review, exempt from the 12-testers-for-14-days gate. Needs an AAB, not the
      APK we have been sending, and `versionCode` must increase every upload.
- [ ] **The privacy policy hosted at a public URL** — this gates *every* track
      including internal, and it needs legal's entity and grievance officer.
- [ ] RNKS Jaipur and NAB Kullu onboarded. **Kullu is the connectivity test** —
      if the offline-enrolment queue is ever going to be needed, it is there.
- [ ] Google's developer verification rules land **September 2026**: identity
      details plus D-U-N-S for organisations, regardless of distribution
      channel.

---

## Decisions still open — these block Phase 2, not Phase 1

**Adi alone.** Everything in the class model waits on these.
- **D1 — offline window** before identifying data goes dark. 14 days proposed.
  R36 (personal phones) sharpens it: a departing teacher takes the device and we
  cannot wipe it, so D1 is the *only* bound. Degrade, don't lock — and degrade
  to **first name only**, never research codes: `OM-XXXX-XXXX` is opaque by
  design, so a teacher facing ten children would pick wrong and write a session
  silently onto the wrong child.
- **D4a** — do teachers keep last year's records after rollover?
- **D5** — departing teacher deleted or switched off? *Recommendation: switch
  off.* R12 and R25 both point at their name; a hard delete orphans both.
- **D9** — group records school-wide (R32), or only the teacher who ran them?

**And a documentation gap that keeps costing.** `OM-Requirements.md` — the sheet
this project calls its source of truth for R1–R36 — **is not in the repo and
never has been**, nor are the three superseded design docs. Every reference to
those numbers is currently second-hand. Get it into `docs/` and commit it.

---

## Risk register

| Risk | Odds | Impact | Mitigation |
|---|---|---|---|
| ~~No ethics protocol~~ | — | — | **CLOSED 25 Aug.** Pull retention + R17 from the document |
| Legal never answers | Med | Consent forms unprintable → **no pilot at all** | Now the ONLY blocker on Phase 1. Escalate via Mansi this week |
| Protocol specifies a retention period we ignored | Low | Rework in Phase 2 | Read it before designing the uploader, not after |
| R20/R21 really did mean the server copy | Low | Archive design wrong | Build with no auto-delete; a clock is config, un-deleting is not |
| Archive outgrows 100 GB in year 2–3 | Med | Budget, not engineering | 60s cap + C2 compression already bound it; flag at 70 GB |
| Sync layer eats 4+ sessions | High | Phase 2 slips into late Oct | Scope is pre-cut: sync button, not a retry queue |
| Class model retrofitted after sync ships | Med | Expensive rework | It is sequenced *inside* Phase 2 for exactly this reason |
| Children enrolled offline during Phase 1 | Low | Permanent migration | **Avoided** by turning CLOUD_SYNC on for enrolment |
| Aditya's Mac is the only signer | Med | Pilot frozen on a stale build | Keystore in Phase 1, outside the repo |
| Kullu connectivity defeats enrolment | Med | Third school stalls | Offline-enrolment queue exists as a designed fallback |
| Press/UI polish absorbs backend weeks again | High | Phase 2 slips | Named here so it is a choice, not a drift |

---

## What honesty about the date costs

The old plan promised a Play-Store-distributed, cloud-connected, multi-device
pilot by **31 August**. On the engineering side that needed six weeks of backend
that did not happen, because six weeks went to accessibility, requirements and
content instead — work that was worth doing and is not on any plan.

This one says: **one school running on real sessions by mid-September, full
cloud custody by early October, three schools and Play in October.** That is
roughly the same six-week slip, stated once rather than re-discovered weekly.

The last plan's mistake is worth naming so it is not repeated: it modelled
backend as the only workstream. This one assumes accessibility, content and
design keep consuming real time — because they have, every single week.
