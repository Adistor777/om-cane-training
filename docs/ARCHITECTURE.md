# Architecture

One page on how O&M Cane Training is put together and why. For the roadmap see
[`../TRACKER.md`](../TRACKER.md); for compliance controls see
[`compliance/DPDP-COMPLIANCE-MAP.md`](compliance/DPDP-COMPLIANCE-MAP.md).

## The shape of the thing

```
┌────────────────────────────── Android device ──────────────────────────────┐
│  Capacitor 8 WebView                                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ index.html — markup shell   styles.css — the look                    │ │
│  │ store.js — storage seam     app.js — UI + logic    (no bundler)       │ │
│  │ activities.js — activity content (content-team owned, no build step)  │ │
│  │                                                                       │ │
│  │   UI screens ──► Store seam ──► Capacitor Preferences (key-value)     │ │
│  │   video      ──► commitPendingVideo ──► Filesystem DATA/videos/       │ │
│  │   export     ──► buildCSV ──► Filesystem + OS share sheet             │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
          │ (cloud phase, in progress)
          ▼
   Supabase (India region): auth · children (server child IDs) · records · videos bucket
   Row-Level Security: school_id claim in JWT — one school never reads another's data
```

## Load-bearing decisions

**Plain files, no bundler.** The content team edits `activities.js` with no
toolchain. The app itself is four plain files loaded in order — `index.html`
(markup shell), `styles.css`, `store.js`, `app.js` (split 2026-07-06; was one
file). `www/` holds build-time copies made by `./scripts/build.sh` (which also
runs the school-ID consistency guard, a JS parse check, `npx cap sync android`,
and verifies the built assets) — root files are always the source of truth.

**The Store seam.** Every read/write goes through `Store`
(`_get/_set/_remove/_keys` over Capacitor Preferences). The future cloud swap
touches only this seam, never render code. The same seam pattern will be
mirrored by an `Uploader` for video/records sync.

**Chokepoint stamping.** `saveRecord()` is the single write path for records:
it stamps id, schemaVersion, teacherId, school/teacher attribution and
canonical ISO timestamp. Nothing unattributable can enter storage.

**Pseudonymisation.** Every child gets a `researchId` (`OM-XXXX-XXXX`) at
enrolment. Records, video filenames and exports key off it. Names/DOB never
leave the device by default; the PII "key sheet" is a separate, explicit
export. In the cloud phase the research ID is minted **server-side** at
enrolment (Architecture A, locked with R&D 2026-07-03) so the same child on
two devices joins to one identity. Enrolment is the only online step;
assessment stays fully offline.

**Consent as enforcement, not policy.** Per-child guardian video consent
(who/relation/method/when, DPDP Rule 10) gates video at three layers — UI
lock, save-flow drop, and a fail-closed check inside `commitPendingVideo()`,
the only function that writes video bytes. Withdrawal stamps an audit trail
and offers erasure; every delete path removes video *files*, not just
pointers.

**Memory-safe video.** Clips are copied in 3 MB chunks
(writeFile + appendFile), so peak memory is one chunk regardless of clip
length; failed writes delete the partial file.

**Migration shim.** `migrateLegacyData()` runs at every boot, idempotent,
backfilling ids/versions/pseudonyms so schema changes never strand old
device data. `SCHEMA_VERSION` currently 2; additive fields don't bump it.

## Verification workflow

Static first: `node scripts/test-batch1.js` (35 assertions: migration,
envelope stamping, delete-by-id, attribution) + integrity greps. Then
`./scripts/build.sh` (guard + parse + www copy + sync + built-asset verify)
and emulator-verify on Pixel 10 Pro XL. Stale-APK fix:
`./gradlew clean installDebug`.

## Trust boundaries (today → cloud phase)

Today the device is the boundary: app-private storage, no network. Cloud phase
adds Supabase with school-scoped RLS (JWT `school_id` claim), server-assigned
child IDs, consent re-checked before any upload, and delete-everywhere
semantics. India region (ap-south-1); privacy policy + Data Safety answers in
[`compliance/`](compliance/).
