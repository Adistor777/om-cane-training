# TRACKER.md — O&M Cane Training

_Last updated: 2026-06-30_

## Done this session (Sound Library)
- [x] Built an in-app **Sound Library media player** on the Sound-category
      activities (any activity with `soundboard: true`): play/pause, prev/next,
      shuffle, repeat off/all/one, tap/arrow-key seek bar, category tabs,
      animated equaliser. Warm-paper design system, monoline icons, single
      accent, full a11y + reduced-motion.
- [x] `SOUND_LIBRARY` (20 sounds, 4 groups) + `soundboard: true` flags added to
      `activities.js` — no-coder editable, same authoring pattern as activities.
- [x] 20 mp3s bundled in `sounds/` (root + `www/`), gitignored exactly like
      `audio/` (media stays out of git, synced into the build).
- [x] Static-verified (JS parse + integrity greps + isolated `buildSoundboard`
      test); `cp index.html www/index.html && npx cap sync android`;
      emulator-verified on Pixel 10 Pro XL.
- [x] Committed as TWO clean, isolated commits on branch `feat/soundboard`,
      pushed to origin:
      - `167afc0` feat(record): record-screen redesign + video evidence (prior work)
      - `0ae5844` feat(sound): Sound Library media player
      Split was done by reconstructing a record-only `index.html` so each commit
      is isolated — record-screen and soundboard never mixed in one commit.

## Next session — FIRST tasks
- [ ] **Merge `feat/soundboard` → `main`** (PR or local) and delete the branch.
      PR: https://github.com/Adistor777/om-cane-training/pull/new/feat/soundboard
- [ ] **Commit `MEMORY.md` / `TRACKER.md`** separately (still modified).
- [ ] **Repo reorg** on its own branch `chore/repo-structure` (scope agreed):
      move docs → `docs/`, scripts → `scripts/`, prototype → `prototypes/`; fix
      `generate-audio.js` two `__dirname` paths; repair `GITHUB-SETUP.md` links;
      write new `README.md`, `docs/ARCHITECTURE.md`, `CONTRIBUTING.md`. Pure
      `git mv` (history preserved). Defer the `index.html` → `styles.css`/`app.js`
      split (its own later branch). NB: git writes must run on the Mac, not in
      the assistant sandbox.

## Production roadmap — solving one by one (ordered by rework risk)
- [ ] **1. R&D email first** — draft + send. 4 confirmations: architecture A/B,
      identified-video requirement, multi-device-per-child, analysis approach
      (longitudinal / cross-child / both). Unblocks the child-ID work below
      without writing throwaway code. **Most rework-prone item; do first.**
- [ ] **2. Cross-device child ID** — server-assigned ID on enrolment (Entities
      pattern). Gated on R&D email. Un-backfillable; costs grow with every record.
- [ ] **3. Video consent gate** — per-child `videoConsent` flag (obtained / by /
      date) at enrolment; hide/disable Add-video and refuse `commitPendingVideo`
      when absent. **Get consent-field spec from legal first**, then one-pass impl.
- [ ] **4. Supabase auth swap** — `verifyCredentials()` → `signInWithPassword()`.
- [ ] **5. Uploader + cloud storage** — Uploader seam (mirror Store), bucket,
      offline queue + retry, delete-everywhere, save returned URL on record.
- [ ] **6. Row-Level Security** — `school_id` on every table + RLS + JWT claim.
- [ ] **7. Video memory fix** — stream to disk via native FS instead of base64
      round-trip (prevents OOM on long clips).
- [ ] **8. Play Store production release** — Data Safety form, privacy policy URL,
      Families/Designed-for-Families review.

## More features to add
- [x] Sound Library / soundboard for sound activities — DONE this session.
- [ ] Aditya to name further features at start of a future chat.

## Active / near-term
- [ ] Designer (Flipkart) review: Sound Library accent usage — it is a deliberately
      richer-accent surface (player), beyond the "accent in two spots" guardrail.
- [ ] Designer review: category-tile count pill vs description; child-picker grid.
- [ ] Substitute real teacher names into seed once Mansi provides them.
- [ ] Consent/withdraw/erasure envelope (F9, broader than video) — legal input.

## Blockers / gated
- [ ] Cross-device child ID — gated on R&D email.
- [ ] Audio pipeline (SOP narration) — blocked on real translated SOP text from
      content team. (Independent of the Sound Library, which is shipped.)
- [ ] Play Store closed testing track — not set up yet.

## Backlog
- [ ] File split: `index.html` → `styles.css` + `store.js` + `app.js` (own branch).
- [ ] Architecture one-pager for stakeholders (now part of repo-reorg as
      `docs/ARCHITECTURE.md`).

## Standing reminders
- Every code session ends: `cp index.html www/index.html && npx cap sync android`,
  grep built assets to confirm, then `./gradlew clean installDebug` if a stale
  APK is suspected (not hot reload).
- Media (`audio/`, `sounds/`, `*.mp4`) is gitignored — bundled locally + synced
  to `www/`, never committed. Keep `sounds/` and `index.html` together.
- Feature commits stay focused — MEMORY.md / TRACKER.md regenerated at wrap-up,
  committed separately.
