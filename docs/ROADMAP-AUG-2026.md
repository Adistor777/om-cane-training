> **SUPERSEDED 2026-08-25 by `docs/ROADMAP-SEP-2026.md`.**
> Kept as history. It planned M2 for 19 July and M3 for 2 August; on 25 August
> M3 had not started. The slip was not execution — weeks 3–8 went to
> accessibility (three blind-reviewer rounds, seven build gates), the R1–R36
> requirements sheet, the real SOPs, branding and design. **This plan modelled
> backend as the only workstream**, which is the mistake worth carrying
> forward, not the dates.

# Roadmap — 6 July → 31 August 2026

Practical plan to a **cloud-connected, multi-device, Play-Store-distributed,
pilot-ready app by 31 August**. Written deliberately conservative: every
milestone has a definition of done, a confidence level, and a cut line.

## Assumptions (the plan breaks if these do)

- **Pace:** ~2 working sessions/week, one feature block per session. This has
  held for 3 straight sessions; the plan needs ~13 of the ~16 available, so
  3 sessions of slack are built in.
- **Hardware:** Mac + emulator always; at least one real Android phone by
  mid-July (needed for the video-picker test and multi-device proof —
  emulator alone cannot close M2 or M4).
- **Supabase** stays on the free/pro tier limits comfortably (pilot scale is
  tiny — 3 schools, ~6 teachers).
- **Dependencies** (legal, roster, translations) are chased THIS WEEK, not
  when they block. See "Chase list".

---

## Milestones

### M1 — Cloud foundation *(target: Sun 12 Jul · confidence: HIGH)*
Dashboard config (4 steps: verify tables, re-seed `sch_*`, private `videos`
bucket, test teacher) + code wiring on `feat/cloud-sync` behind `CLOUD_SYNC`
flag (default OFF): vendored supabase-js, `signInWithPassword` with
`PILOT_LOCAL_AUTH` fallback, `enrol_child()` RPC at Save-child (online-only
enrolment, clear offline message).

**Done when:** emulator logs in via Supabase; new child gets a server-minted
research ID; with the flag OFF the app is byte-for-byte the offline pilot.

### M2 — RLS proven + real-device pass *(target: Sun 19 Jul · confidence: HIGH)*
Test matrix executed and written down: saksham teacher reads own school's rows;
cross-school read returns empty; anon key without login reads nothing; storage
policy blocks cross-school paths. Full app pass on a physical phone, including
the parked video-picker test (`content://` URI through `commitPendingVideo`).

**Done when:** the matrix is committed to `docs/` with results, and a
multi-minute clip stores and plays back on real hardware.

### M3 — Video uploader + records sync *(target: Sun 2 Aug · confidence: MEDIUM — 2 sessions + buffer)*
Uploader seam (mirror of Store, NOT bolted onto it): records push + video
upload to the private bucket at `{school_id}/{research_id}_{ts}.{ext}`.
Consent re-checked before every upload; erasure = delete-everywhere.
**v1 is a visible "Sync now" button + auto-attempt on app open when online —
NOT a background retry queue.** Queue-and-retry is where estimates die; the
button version is testable, honest, and fine for a pilot.

**Done when:** clip + record uploaded from the phone, visible in dashboard;
consent withdrawal wipes the server copy; airplane-mode save syncs later.

### M4 — Multi-device proof *(target: Sun 9 Aug · confidence: MEDIUM)*
Children/records pull-down so a second device renders the same school's child
picker. This closes Architecture A end-to-end and is THE research demo.

**Done when:** child enrolled on device A is picked and assessed on device B,
and both assessments join under one research_id in the dashboard.

### M5 — Play Store internal track *(target: Sun 16 Aug · confidence: MEDIUM — gated on legal)*
Privacy policy hosted at a public URL (needs legal's entity + officer names),
Data Safety form from `compliance/PLAY-DATA-SAFETY.md`, target audience 18+,
signed AAB, internal-testing track, testers invited by Gmail.

**Done when:** a tester installs from the Play Store link on a clean phone.
**If legal slips:** don't stall — pilot devices can sideload the signed APK
(distribution track is access control, not a launch requirement). Store
listing catches up when legal does.

### M6 — Pilot readiness *(target: Sun 30 Aug · confidence: MEDIUM, dependency-bound)*
Real teacher accounts (5-min job per teacher once roster arrives), consent
forms printed WITH serials (needs legal placeholders filled + Hindi form
verified), a 1-page teacher quick-start in `docs/handoffs/`, and a full dry
run: fresh phone → store install → login → enrol → assess → video → sync →
visible in dashboard.

**Done when:** the dry run passes with a real teacher account, and forms are
physically printable.

---

## Weekly cadence (2 sessions/wk, S = session)

| Week | Dates | S1 | S2 |
|------|-------|----|----|
| 1 | Jul 6–12 | Dashboard + wiring start | Wiring finish, M1 gate |
| 2 | Jul 13–19 | RLS matrix | Real-device pass, M2 gate |
| 3 | Jul 20–26 | Uploader: records push | Uploader: video + consent check |
| 4 | Jul 27–Aug 2 | Uploader: erasure + sync button, M3 gate | **Buffer / spillover** |
| 5 | Aug 3–9 | Pull-down sync | Multi-device proof, M4 gate |
| 6 | Aug 10–16 | Play listing + AAB | **Buffer** (or M5 gate if legal delivered) |
| 7 | Aug 17–23 | Teacher provisioning + quick-start doc | Dry run #1 |
| 8 | Aug 24–31 | Fixes from dry run | Dry run #2, M6 gate + wrap |

Three buffers total (W4, W6, and W8's second slot degrades gracefully).
If a milestone slips one full week, cut from the stretch list — never from
verification.

## Chase list — SEND THIS WEEK (your August depends on it)

1. **Legal:** entity of record, grievance officer, effective date, Rule 10
   sign-off, exemption answer. Deadline framing: *"Play Store listing is
   blocked from ~Aug 10 without this."*
2. **Pilot manager:** teacher roster (names + emails per school). Framing:
   *"accounts take 5 minutes once I have names; pilot onboarding is blocked
   without logins."*
3. **Content team:** Hindi consent form verification (blocks printing) +
   translated SOP text (blocks audio — cuttable, but say the date anyway).

## Stretch (only if ahead — cut without guilt)

- Audio narration pipeline for translated SOPs (blocked on content team anyway)
- Offline-enrolment queue (only if online-only enrolment hurts in the field)
- In-app mirror of Part A assessment consent (only if legal asks)
- Designer review pass on the soundboard accent surface

## Risk register (practical, not paranoid)

| Risk | Odds | Impact | Mitigation |
|------|------|--------|------------|
| Legal never answers | Med | M5/M6 slip | Sideload APK for pilot; escalate via manager week 3 |
| Uploader eats 3+ sessions | Med | M4 slips a week | v1 is the sync button, not a queue; scope is pre-cut |
| No real device by mid-July | Low | M2/M4 blocked | Any borrowed Android works; flag it NOW if uncertain |
| Roster arrives late Aug | Med | Dry run uses test accounts | Dry run validity doesn't need real names, only real flow |
| RLS gap found in testing | Low | 1 session fix | Matrix in M2 exists exactly to find this early, not in the field |
| Supabase schema needs a change post-M3 | Low | Migration work | Nothing irreversible ships before M2 verification |

## What 31 August looks like if this holds

A teacher installs the app from the Play Store, logs in with a real account,
enrols a child once online, assesses fully offline for months, attaches
consent-gated video, taps sync, and the research team sees pseudonymous,
school-isolated, strictly joinable records in the dashboard. Compliance pack
signed or the specific unsigned items named. That is a defensible pilot — and
everything on the engineering side of it is in your control.
