# Contributing

Small project, strict habits. These rules exist because the app handles
children's disability data and runs offline in the field — a sloppy commit can
cost real data.

## Ground rules

1. **`index.html` at the root is the source of truth.** Never edit
   `www/index.html` or anything under `android/` — both are build output.
2. **`activities.js` belongs to the content team.** Don't touch it without
   their sign-off; treat the local copy as authoritative content.
3. **No bundler, no framework, no file split** without an explicit decision.
   The no-toolchain workflow is a feature.
4. **One feature per branch, one concern per commit.** Branch names:
   `feat/…`, `fix/…`, `chore/…`, `docs/…`. MEMORY.md / TRACKER.md are
   committed separately from feature work.

## The edit loop

```bash
git checkout -b feat/my-feature
# … edit index.html …

# 1. static checks (before any device work)
node -e "const fs=require('fs');const html=fs.readFileSync('index.html','utf8');const m=html.match(/<script[^>]*>([\s\S]*?)<\/script>/g)||[];let b=m.map(s=>s.replace(/<\/?script[^>]*>/g,'')).join('\n');try{new Function(b);console.log('JS parse: OK')}catch(e){console.log('ERROR:',e.message)}"
node scripts/test-batch1.js          # must be all-green

# 2. sync the build copy (every time, no exceptions)
cp index.html www/index.html && npx cap sync android

# 3. verify the built assets actually changed
grep -c "myNewFunction" android/app/src/main/assets/public/index.html

# 4. emulator-verify (Pixel emulator; stale APK → ./gradlew clean installDebug)

# 5. commit index.html only, merge, delete branch
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
