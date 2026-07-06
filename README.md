# O&M Cane Training

An offline-first Android app for teachers at schools for the blind, used to run
structured **orientation & mobility (white-cane) assessments** with visually
impaired children. Built for a closed research pilot with IIT Delhi / NCAHT,
deployed at three partner schools (Noida, Jaipur, Kullu).

Teachers record activity results, optional consent-gated video evidence, and
export pseudonymised CSVs for the research team. All child data is protected
per India's DPDP Act, 2023 + DPDP Rules, 2025 — see
[`docs/compliance/`](docs/compliance/).

## How it's built

Plain HTML/CSS/JS — no bundler, no framework — wrapped with **Capacitor 8**
for Android. This is a deliberate, load-bearing choice: the content team edits
`activities.js` (all activity text, SOPs and scoring fields) directly, with no
build step. Do not introduce a bundler. The app is four plain files, loaded in
order:

| Path | What it is |
|------|------------|
| `index.html` | Markup shell + script/style tags. **Source of truth** (with the three files below) |
| `styles.css` | The look — design guardrails at the top of the file |
| `store.js` | Storage seam — the ONLY code touching the storage backend |
| `app.js` | Rendering, navigation, behaviour |
| `activities.js` | Activity content — **owned by the content team** |
| `www/` | Build copy Capacitor serves (gitignored — never edit) |
| `android/` | Generated Capacitor project (gitignored) |
| `audio/`, `sounds/` | Bundled media (gitignored, synced into the build) |
| `scripts/` | Tooling: TTS audio generator, headless test suite |
| `supabase/` | Backend schema + RLS policies (cloud phase) |
| `docs/` | Guides, architecture, stakeholder handoffs, compliance pack |
| `prototypes/` | Design explorations |
| `MEMORY.md`, `TRACKER.md` | Session context + roadmap (regenerated each session) |

## Quick start (development)

```bash
npm install
./scripts/build.sh                          # guard + parse check + www copy + cap sync + verify
cd android && ./gradlew installDebug        # or open in Android Studio
```

Web preview: open `index.html` directly, or `python3 -m http.server` in the
project root (needed once media is involved).

**After every edit to app files:** `./scripts/build.sh` — it copies web assets
to `www/` (what the device runs), syncs, and verifies the built assets landed.
If the emulator still shows stale code: `cd android && ./gradlew clean installDebug`.

## Testing

```bash
node scripts/test-batch1.js     # headless jsdom suite: migration, envelope,
                                # deletion, attribution — must be all-green
```

Static check before any device work — see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the app is put together and why
- [`docs/BUILD-ANDROID.md`](docs/BUILD-ANDROID.md) — full Android build guide
- [`docs/GITHUB-SETUP.md`](docs/GITHUB-SETUP.md) — repo setup from scratch
- [`docs/DESIGN_NOTES.md`](docs/DESIGN_NOTES.md) — design system and guardrails
- [`docs/compliance/`](docs/compliance/) — DPDP compliance pack: privacy policy,
  guardian consent forms (EN/HI), Play Store data-safety answers, control map
- [`docs/handoffs/`](docs/handoffs/) — stakeholder PDFs (plans, flowcharts, reports)

## Status

Pilot build: feature-complete for offline assessment capture, consent-gated
video evidence, and pseudonymised export. In progress: cloud sync (Supabase,
India region), server-assigned child IDs, Play Store closed-testing release.
Current roadmap lives in [`TRACKER.md`](TRACKER.md).

Private research project — not licensed for redistribution.
