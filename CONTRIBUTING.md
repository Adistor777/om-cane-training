# Contributing

Small project, strict habits. These rules exist because the app handles
children's disability data and runs offline in the field — a sloppy commit can
cost real data.

## Ground rules

1. **Root files are the source of truth** — `index.html` (markup shell),
   `styles.css`, `store.js`, `app.js`. Never edit anything under `www/` or
   `android/` — both are build output.
2. **`activities.js` belongs to the content team.** Don't touch it without
   their sign-off; treat the local copy as authoritative content.
3. **No bundler, no framework.** Plain files with script tags is the whole
   toolchain, and that's a feature. The four-file split (2026-07-06) is the
   agreed structure — don't re-merge it and don't split further without an
   explicit decision.
4. **One feature per branch, one concern per commit.** Branch names:
   `feat/…`, `fix/…`, `chore/…`, `docs/…`. MEMORY.md / TRACKER.md are
   committed separately from feature work.

## The edit loop

```bash
git checkout -b feat/my-feature
# … edit app.js / store.js / styles.css / index.html …

# 1. tests (before any device work; build.sh runs the parse check itself)
node scripts/test-batch1.js          # must be all-green

# 2. build: ID guard + JS parse + www copy + cap sync + built-asset verify
./scripts/build.sh

# 3. spot-check your change landed in the built assets
grep -c "myNewFunction" android/app/src/main/assets/public/app.js

# 4. emulator-verify (Pixel emulator; stale APK → ./gradlew clean installDebug)

# 5. commit app files only, merge, delete branch
```

## Data-safety rules for any new code

- New record fields go through `saveRecord()` (the stamping chokepoint) —
  never write records directly.
- Anything identifying (names, DOB, guardian identity) stays out of default
  exports and out of filenames; key off `researchId`.
- Any code path that deletes a record/child must also delete linked video
  **files** (see `deleteVideoFile` / `videoFilenamesForProfile`).
- Video writes go only through `commitPendingVideo()` — it enforces the
  consent gate. Don't add a second write path.
- Schema changes: additive fields need a backfill in `migrateLegacyData()`;
  semantic changes bump `SCHEMA_VERSION` and need a migration + test.

## Media & secrets

`audio/`, `sounds/`, `*.mp4` are gitignored — bundled locally, synced into
`www/`, never committed. API keys live in `.env` (gitignored; see
`.env.example` pattern). Never commit a key; the Sarvam key in
`scripts/generate-audio.js` is read from the environment.

## Docs

User-visible behaviour changes → update `README.md`. Structural decisions →
`docs/ARCHITECTURE.md`. Anything touching children's data → check
`docs/compliance/DPDP-COMPLIANCE-MAP.md` still tells the truth.
