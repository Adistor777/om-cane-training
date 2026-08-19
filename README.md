# O&M Cane Training

An offline-first Android app for teachers at schools for the blind, used to run structured **orientation & mobility (white-cane) assessments** with visually impaired children. It's part of a closed research pilot with IIT Delhi / NCAHT, currently running at three partner schools (Noida, Jaipur, Kullu).

Built as plain HTML/CSS/JS — deliberately **no bundler, no framework** — wrapped as a native Android app with **Capacitor 8**. That "no bundler" choice matters for this README: it means the content (all the activity text and instructions) can be edited and previewed without installing anything Android-related at all, while the *native app itself* (video capture, on-device storage, the real look on a phone) needs the fuller setup below.

This document assumes no prior Android/dev background. Every step has a "Check" line telling you what success looks like before you move to the next one.

## Contents
- [Handling children's data — please read this first](#handling-childrens-data--please-read-this-first)
- [Three ways to see the app](#three-ways-to-see-the-app)
- [Getting the code](#getting-the-code)
- [Prerequisites for the full setup](#prerequisites-for-the-full-setup)
- [Full Android setup, step by step](#full-android-setup-step-by-step)
- [Running on your own physical phone](#running-on-your-own-physical-phone)
- [Signing in](#signing-in)
- [Everyday workflow, if you're editing code](#everyday-workflow-if-youre-editing-code)
- [If you're here to review or edit content, not code](#if-youre-here-to-review-or-edit-content-not-code)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Project structure](#project-structure)
- [Further reading](#further-reading)
- [Command reference, once you've done this once](#command-reference-once-youve-done-this-once)

---

## Handling children's data — please read this first

This app handles **children's disability data**, which is protected under India's Digital Personal Data Protection (DPDP) Act, 2023 and DPDP Rules, 2025 (the full breakdown is in `docs/compliance/DPDP-COMPLIANCE-MAP.md`). A few things that matter for *anyone* setting this up, not just developers:

- **Never enter a real child's name, date of birth, photo, or video into the app** while you're exploring, testing, or reviewing it. Use obviously fake test data — "Test Child," any date, a placeholder photo, whatever's clearly not a real record.
- The app pseudonymises everything by design (every child gets a random `OM-XXXX-XXXX` research ID at enrolment, and the default CSV export carries no name or date of birth), but that protection only means something if real identifying data never goes in during a casual review session.
- The repository is **private** and the project isn't licensed for redistribution, for exactly this reason.

---

## Three ways to see the app

Pick based on what you actually need — the first two need no Android tooling at all.

### 1. Fastest: install a pre-built APK on your own Android phone

This is how the pilot's own manager reviews new builds today — no Node, no Android Studio, no code, just an Android phone. There's no public download link (the repo and its builds are private), so:

- Ask the project maintainer for the latest debug **APK** (the installable Android app file — extension `.apk`), usually shared as a WhatsApp document or a Drive link.
- On the phone, opening that file will prompt you to allow installs from that source once. If Google Play Protect then warns you, tap **"Install anyway."** This warning is expected and normal for an unsigned debug build (as opposed to something installed from the Play Store) — it doesn't mean anything is wrong.
- Open the app and sign in (see [Signing in](#signing-in) below).
- This is the *real* native app — video capture, on-device storage, the share sheet, all of it, exactly as a teacher would experience it.

### 2. Fast, browser-only: preview the UI on your laptop

Good for a quick look at layout, typography, and screen flows, with zero Android tooling. Two honest caveats before you start:

- Some native-only behaviour won't work in a plain browser. Data storage silently falls back to your browser's `localStorage` instead of the phone's native storage (this is built into `store.js` on purpose, as a web-preview fallback); video files won't actually persist to disk; CSV export becomes a normal browser file download instead of the Android share sheet.
- Bundled media — the demo videos, the SOP narration audio, and the sound-library clips (folders `audio/`, `sounds/`, and any `*.mp4` files) — are all excluded from the repository on purpose (see `.gitignore`). A fresh clone will **not** include them, so you'll see the app's placeholder text ("Demo video slot…", "Audio narration slot…") instead of real media, unless someone hands you those folders separately.

Steps:
1. Get the code — see [Getting the code](#getting-the-code) below.
2. From the project's root folder, start a tiny local web server (this matters once anything tries to fetch a file, like audio — just double-clicking `index.html` can hit browser security restrictions):
   ```bash
   python3 -m http.server 8000
   ```
   (No Python? If you've already installed Node for the full setup below, `npx serve .` does the same job.)
3. Open `http://localhost:8000` in Chrome or Firefox.
4. You'll land on the Sign in screen — use the login details in [Signing in](#signing-in).

### 3. Full setup: run the real native app in an Android emulator or your own phone

The complete developer environment. You need this if you want to edit code, produce your own installable build, or test camera/storage exactly as it behaves on a real device. It's meaningfully more setup than options 1–2 — follow [Full Android setup](#full-android-setup-step-by-step) below.

---

## Getting the code

The repository is **private** (`Adistor777/om-cane-training` on GitHub) — this is children's-disability-data research software for a closed pilot, so it isn't public.

- **You need to be added as a collaborator by the repo owner before `git clone` will work for you.** Ask for an invite to the email address tied to your GitHub account.
- Once you have access:
  ```bash
  git clone https://github.com/Adistor777/om-cane-training.git
  cd om-cane-training
  ```
  The first clone will ask you to authenticate with GitHub — the modern way is a browser sign-in popup, or (if it asks for a username/password in the terminal) a **Personal Access Token pasted in place of the password.** GitHub retired plain password authentication for git in 2021, so if it complains about that specifically, that's why. `docs/GITHUB-SETUP.md` in the repo covers this same authentication flow in more detail if you get stuck.
- If you don't have (and can't easily get) GitHub access, ask the maintainer for a zip export instead, or just use **option 1 above (the pre-built APK)** — you don't need the source code at all to review the running app.

What you'll see right after cloning: `index.html`, `styles.css`, `store.js`, `app.js`, `activities.js`, `capacitor.config.json`, `package.json`, plus the `docs/`, `scripts/`, `supabase/`, and `prototypes/` folders. You will **not** see `node_modules/`, `android/`, or `www/` (all generated by the steps below, all excluded from the repo) or `audio/`/`sounds/`/any `*.mp4` (bundled media, also excluded — see the caveat in option 2 above).

---

## Prerequisites for the full setup

This process is documented for **macOS on Apple Silicon** (the project's own dev machine is an M-series MacBook) — that's the only environment it's been verified on. If you're on Windows or Linux, the Node/npm and Capacitor steps carry over conceptually, but the exact commands for installing Node and Android Studio will differ from what's below. Treat the Android Studio / emulator portion as the part most likely to need adapting.

| Tool | Why you need it | Version |
|---|---|---|
| GitHub access to the private repo | to pull the code | — |
| Homebrew (Mac) | the standard, clean way to install Node on a Mac | latest |
| Node.js | runs the Capacitor command-line tool and this project's build scripts | **22 (LTS) or newer** — Capacitor 8 requires it |
| Android Studio | gives you the Android SDK, an emulator, and a bundled JDK all in one install | **Otter (2025.2.1) or newer** |
| An Android phone (optional) | to test on real hardware instead of, or alongside, the emulator | any recent Android device + a USB cable |

You do **not** need to install Java separately. Android Studio bundles JDK 21, which is exactly what Capacitor 8 expects — trying to use a different Java install is a common source of errors (see [Troubleshooting](#troubleshooting)).

---

## Full Android setup, step by step

### 1. Install Homebrew (skip if you already have it)
Open **Terminal** and paste:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
When it finishes, it prints two `echo …` lines telling you to add Homebrew to your PATH — run exactly what it shows you (on Apple Silicon these reference `/opt/homebrew`).

**Check:** `brew --version` prints a version number.

### 2. Install Node 22 or newer
```bash
brew install node
```
**Check:** `node --version` reads `v22` or higher. If it's lower: `brew upgrade node`.

### 3. Install Android Studio
```bash
brew install --cask android-studio
```
Open Android Studio and complete the first-run **Setup Wizard**, choosing the **Standard** install option. Let it fully finish downloading the SDK, an emulator, and the JDK before continuing — this can take a while on a slow connection.

**Set up one virtual device (emulator) to run the app on:**
1. On the welcome screen: **More Actions → Virtual Device Manager**.
2. **Create Device** → pick a recent Pixel phone profile → **Next**.
3. Choose a system image with a reasonably current Android API level, and — **important on Apple Silicon** — make sure it's the **arm64-v8a** ABI, not x86_64. If the default/recommended tab only shows x86 images, check the **"Other Images"** tab for an arm64 build, and download that one instead. (The project's own dev machine currently runs API 37 arm64 as a reference point, but any recent arm64 image will work.)
4. **Next → Finish.**

**Check:** the new device now appears in the Device Manager list with a ▶ play button next to it.

**Point your terminal at the Android SDK**, so command-line builds can find it. Add these lines to your shell config:
```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```
**Check:** `adb --version` prints a version number. (`adb`, Android Debug Bridge, is the tool that talks to a connected device or emulator — you'll see it again below.)

### 4. Install the project's dependencies
From the project's root folder (the one with `package.json` in it):
```bash
npm install
```
This pulls in Capacitor 8's core library and command-line tool, the four native plugins the app uses (Preferences for storage, Filesystem, Share, SplashScreen), and `jsdom` (used only by the automated test suite — it's never shipped inside the app itself).

**Check:** `npx cap --version` prints an `8.x` version number.

### 5. Add the native Android project, then build
A freshly cloned repo has no `android/` folder yet (it's excluded from git — see [Project structure](#project-structure)), so you need to create it once:
```bash
npx cap add android
```
**Check:** an `android/` folder now exists in the project (`ls` will show it).

Now run the project's one real build command, which copies the web files into a `www/` folder Capacitor actually serves, runs a couple of safety checks, and syncs everything into the native `android/` project:
```bash
./scripts/build.sh
```
This does five things, in order, and stops loudly at the first thing that fails:
1. Checks that the school IDs defined in `app.js` match the ones seeded in `supabase/schema.sql` — this catches a specific copy-paste drift bug that's bitten the project before.
2. Parses `store.js` and `app.js` as JavaScript, to catch a syntax typo before it ever reaches a device.
3. Copies `index.html`, `styles.css`, `store.js`, `app.js`, and `activities.js` into `www/` — the folder Capacitor actually serves. (The root copies of these files are always the real, editable source of truth; `www/` is disposable, regenerated output.)
4. Runs `npx cap sync android`.
5. Byte-compares what actually landed inside the native Android project against the `www/` copies, to catch a sync that silently didn't take effect.

**Check:** the last line printed is `BUILD OK.`

### 6. Run the app
```bash
npx cap run android
```
It'll list available targets (your emulator, and any connected phone) — pick your emulator with the arrow keys and Enter. The very first build is slow (Gradle, Android's build tool, is downloading and compiling everything); it's much faster after that.

**Check:** the emulator boots and you land on the app's **Sign in** screen.

If you'd rather work directly from inside Android Studio instead of the terminal: `npx cap open android` opens the project there, then press the green **▶ Run** button.

---

## Running on your own physical phone

Instead of, or alongside, the emulator:

1. On the phone: **Settings → About phone → tap "Build number" 7 times** to unlock Developer Options.
2. **Settings → Developer options → enable "USB debugging."**
3. Plug the phone into your computer with a USB cable, and tap **Allow** on the phone's "trust this computer" prompt.
4. ```bash
   adb devices
   ```
   **Check:** your phone's serial number appears in the list (**not** the word "unauthorized" — if it says that, re-tap Allow on the phone and run the command again).
5. ```bash
   npx cap run android
   ```
   Pick the physical device this time instead of the emulator.

**Check:** the app installs and launches on the real phone.

---

## Signing in

The pilot currently has three seeded schools, each with one placeholder teacher account (real teacher names haven't been provided by the pilot coordinator yet, so these are stand-ins):

| School | Login ID |
|---|---|
| Saksham School, Noida | `saksham01` |
| Rajasthan Netraheen Kalyan Sangam (RNKS), Jaipur | `rnks01` |
| National Association of Blind, Kullu | `nab01` |

**Password: literally anything non-empty works.** This is a deliberate, clearly-labelled stub in the code (`verifyCredentials()` in `app.js`) — a real password check can't safely live inside a file that ships to everyone's phone, so real authentication is a planned server-side swap for later. Don't read anything more into "any password works" than "this build hasn't gotten to real authentication yet."

---

## Everyday workflow, if you're editing code

1. `git checkout -b feat/whatever-youre-doing` — one branch per change (see `CONTRIBUTING.md` for the naming convention).
2. Edit `app.js`, `store.js`, `styles.css`, or `index.html` as needed. **Never edit anything inside `www/` or `android/` directly** — both are regenerated output, and any change you make there is silently thrown away the next time someone runs `build.sh`.
3. ```bash
   node scripts/test-batch1.js
   ```
   Run the headless test suite (covers legacy-data migration, record stamping, safe deletion, attribution). It should print all green before you go anywhere near a device — see [Testing](#testing).
4. ```bash
   ./scripts/build.sh
   ```
5. Optional spot-check that your specific change actually landed in the built output:
   ```bash
   grep -c "yourFunctionName" android/app/src/main/assets/public/app.js
   ```
6. If the emulator or phone still shows the *old* behaviour even after a clean sync, it's almost always a **stale install**, not stale code:
   ```bash
   cd android && ./gradlew clean installDebug
   ```
7. Commit the app's source files only — `www/`, `android/`, and `node_modules/` are already excluded by `.gitignore`, so a plain `git add .` won't pick them up.

---

## If you're here to review or edit content, not code

All of the activity text — the categories, the step-by-step instructions ("SOPs"), facilitator notes, and what gets recorded for each activity — lives in a single file: **`activities.js`**. It's deliberately written so a non-coder can edit it directly: quoted text, comma-separated list items, and copy-paste-and-edit patterns, with plain-English instructions in the comments at the very top of the file. As of this snapshot it defines seven categories — Direction, Sound, Sound + Direction, Straight Line Travel, Push Toy, Terrain Game, and Other Activities — but this content changes often, so treat `activities.js` itself, not this README, as the source of truth for exactly what's in there today.

Editing it needs **no build step** if you're using the browser-preview path (option 2 above): save the file, refresh the page, and your change is live.

The visual design — colours, spacing, type, the whole system — lives in **`styles.css`**, and the reasoning and hard rules behind it (don't add a second shadow tier, don't reuse the category accent colour a third time, and so on) are written up in **`docs/DESIGN_NOTES.md`**. Read that before touching the CSS — the guardrails exist because earlier, more heavily decorated versions of this app tested *worse*, not better, and it documents exactly why.

---

## Testing

```bash
node scripts/test-batch1.js
```

A headless test suite (built on `jsdom`) that boots the real `index.html` + `store.js` + `app.js` with seeded fake data and checks the data-integrity guarantees the app depends on: legacy-data migration, correct stamping of every saved record (ids, timestamps, who saved it), safe delete-by-id behaviour, and the shape of the CSV export. It should finish with a line like `NN passed, 0 failed`. This is a pure static check — it needs no emulator or phone at all. `./scripts/build.sh` also runs a lighter JavaScript syntax check automatically as one of its own steps.

---

## Troubleshooting

Straight from the project's own experience hitting these:

- **`invalid source release: 21` / a Java version error.** Android Studio isn't using its own bundled JDK. In Android Studio: **Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK →** select the bundled **jbr-21**, then try again.
- **A Gradle/AGP version complaint.** Open the project in Android Studio (`npx cap open android`) and let it run the **AGP Upgrade Assistant** if it offers to. Capacitor 8 targets AGP 8.13.
- **`adb: command not found`.** The `~/.zshrc` PATH lines from setup step 3 haven't loaded in your current terminal session. Run `source ~/.zshrc`, or just open a new terminal window.
- **The emulator won't boot, or is obviously running very slowly.** You most likely picked an x86 system image on Apple Silicon. Create (or edit) the virtual device using the **arm64-v8a** image instead.
- **The app looks stale even though you know you changed something.** This is almost always a stale *install*, not stale code:
  ```bash
  cd android && ./gradlew clean installDebug
  ```
- **`./scripts/build.sh` fails at the school-ID consistency check.** The school IDs in `app.js`'s `seedSchools()` function and the ones seeded in `supabase/schema.sql` have drifted apart. Don't work around this check — figure out which one is correct and fix the other; this exact mismatch has silently broken things before.
- **A file you edited doesn't seem to show up anywhere.** Double-check you edited the *root* copy of the file, not the one inside `www/` or `android/` — those are regenerated by `build.sh` and any direct edit there is lost on the next build.

---

## Project structure

| Path | What it is |
|---|---|
| `index.html` | Markup shell + script/style tags. Source of truth, along with the three files below. |
| `styles.css` | The visual design. Guardrails documented at the top of the file. |
| `store.js` | The storage seam — the *only* code that talks to the storage backend (native Capacitor Preferences on-device, or `localStorage` as a browser-preview fallback). Isolated on purpose so a future cloud backend only has to change this one file. |
| `app.js` | Everything else: screens, navigation, data logic, behaviour. |
| `activities.js` | Activity content — categories, SOP text, data fields, the sound library. Owned by the content team, not developers (see above). |
| `capacitor.config.json` | Capacitor's app ID (`org.omcane.trainer`), display name ("O&M Cane Training"), and the `webDir` (`www`) it serves the app from. |
| `www/` *(not in git)* | Build output Capacitor actually serves, regenerated by `build.sh`. Never edit this directly. |
| `android/` *(not in git)* | The generated native Android project, created by `npx cap add android` and kept in sync by `build.sh`. |
| `audio/`, `sounds/` *(not in git)* | Bundled narration and sound-library audio, synced into the build. Not present on a fresh clone — see the caveat under option 2 above. |
| `scripts/build.sh` | The one build command — see [Full Android setup, step 5](#full-android-setup-step-by-step). |
| `scripts/test-batch1.js` | The headless automated test suite. |
| `scripts/generate-audio.js` | A separate one-off tool that generates SOP narration audio via the Sarvam text-to-speech API. Not part of the shipped app — only relevant if you're regenerating audio, and needs a `SARVAM_API_KEY` in a local `.env` file to run (see the comments at the top of that script for details). |
| `supabase/schema.sql` | A draft backend schema (tables, row-level security policies) for a planned cloud-sync phase. As of the files in this snapshot, the app runs fully offline by default — check `TRACKER.md` for the current, live status of that work, since it's evolving separately from this README. |
| `docs/` | Deeper documentation — see below. |
| `MEMORY.md`, `TRACKER.md` | Rolling session notes and the live roadmap/task list. These are the most up-to-date record of what's actually shipped versus in progress — if anything in this README ever seems to disagree with them, trust `TRACKER.md`. |

---

## Further reading

| Doc | What's in it |
|---|---|
| `docs/ARCHITECTURE.md` | How the pieces fit together and *why* — the storage seam, pseudonymisation, the consent gate, the data-migration mechanism. Start here for the "why," not just the "how." |
| `docs/BUILD-ANDROID.md` | The original, even more granular Android/Capacitor install walkthrough this README's setup section is based on. |
| `docs/DESIGN_NOTES.md` | The visual design system and its hard rules — read before touching `styles.css`. |
| `docs/GITHUB-SETUP.md` | Background on how the private GitHub repo was originally set up, including the same git authentication flow you'll go through. |
| `CONTRIBUTING.md` | Branch and commit conventions, and the data-safety rules that apply to any code change. |
| `docs/compliance/` | The privacy policy, the DPDP compliance map, Play Store data-safety answers, and the guardian consent form (English and a Hindi draft). |
| `TRACKER.md` | The live roadmap — what's done, what's next, what's blocked and on whom. |
| `MEMORY.md` | Longer-form running project history and context. |

---

## Command reference, once you've done this once

For after your first full setup, when you just need the actual commands:

```bash
# get the code
git clone https://github.com/Adistor777/om-cane-training.git
cd om-cane-training

# one-time setup
npm install
npx cap add android

# every time you change app.js / store.js / styles.css / index.html
node scripts/test-batch1.js
./scripts/build.sh
npx cap run android

# if the emulator/phone shows stale behaviour
cd android && ./gradlew clean installDebug

# browser-only preview, no Android tooling
python3 -m http.server 8000    # then open http://localhost:8000

# maintainer producing a shareable APK for someone doing option 1
./scripts/build.sh && cd android && ./gradlew assembleDebug
# the resulting file typically ends up at:
# android/app/build/outputs/apk/debug/app-debug.apk
```