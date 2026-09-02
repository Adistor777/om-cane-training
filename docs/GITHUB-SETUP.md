# GITHUB-SETUP.md — history, not instructions

> **Do not run anything that used to be in this file.**
> This was the one-time walkthrough that first put the project on GitHub, written
> 3 July 2026. Every step in it has been done: the private repo
> `Adistor777/om-cane-training` exists, `origin` is wired up, `main` is pushed.
> The steps were removed on 1 September 2026 because they had stopped being true,
> and one of them had become actively dangerous.

## Why it was cut rather than left as history

The old step 2 pasted a complete `.gitignore` over whatever was there. That list
was correct in July, when it excluded three generated folders. It is now a small
fraction of the real one — and running it today would start tracking
**`faces/` (photographs of real children)** and **`.env` (the Sarvam API key)**
on the very next `git add .`.

Superseded plans are safe to keep as history. A superseded document containing a
command that silently commits children's photographs to a repository is not, so
it is gone rather than banner-flagged.

Two other things had also drifted: the file listed the repo's contents as
`index.html` + `activities.js`, which predates the four-file split of 6 July
(`index.html` · `styles.css` · `store.js` · `app.js`), and its day-to-day advice
was `git add .`, which contradicts this project's own rule that feature commits
stay focused and the notes commit separately.

## What is true now

**`.gitignore` at the repo root is the only source of truth** for what is
excluded. Do not reconstruct it from memory or from any document. Broadly it
keeps out generated output (`node_modules/`, `android/`, `www/`), all bundled
media (`audio/`, `sounds/`, `faces/`, `*.mp4`, `help-*.jpg`), secrets (`.env`),
and per-meeting working material (`docs/handoffs/`).

A consequence worth stating plainly, because it surprises everyone: **a fresh
clone does not build a working app.** The recordings, the sound library, the demo
videos and the demo children's photos exist only on Aditya's Mac and in
`~/om-media-backup/`. Any installed APK is a third copy of the audio — see
`scripts/recover-faces.sh`.

**Committing.** Keep each commit to one concern, and keep `MEMORY.md` /
`TRACKER.md` out of feature commits — regenerate them at the end of a session and
commit them on their own. Before writing "done" or "pushed" anywhere, confirm it
with `git log --oneline` and `git status`; this project has twice recorded work as
pushed when it was not.

**CI.** Since 1 September, every push runs `scripts/gates.sh` through
`.github/workflows/gates.yml` — the school-ID guard, the JS parse check, six
accessibility gates and the 40-test unit suite. A red tick means a real
regression. A green tick is a floor, not a ceiling: it cannot hear audio, cannot
measure rendered contrast or touch-target size, cannot drive TalkBack, and says
nothing about whether the APK got the code.

**Someone new joining on their own machine.** They need a collaborator invite
first — the repo is private, and until the invite is accepted Git reports it as
`repository not found` rather than as a permissions problem. After that it is
`git clone https://github.com/Adistor777/om-cane-training.git`, and `git pull`
to stay current. A step-by-step for a first-time Windows user is kept outside the
repo; ask Aditya for it.

## Related

- `docs/RUNBOOK.md` — build and ship, written to be pasted.
- `CONTRIBUTING.md` — how to work in this codebase.
- `docs/ARCHITECTURE.md` — what the four source files each own.
