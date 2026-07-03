# BUILD-ANDROID.md — Turning the app into an Android app

This is the step-by-step for wrapping the existing web app as a native Android
app with Capacitor 8, on an **Apple Silicon Mac (M-series, incl. M5)**. Follow
it top to bottom the first time. Each block is a thing you run or click; the
**Check** lines tell you it worked before you move on.

> You do NOT touch `activities.js` or the app's behaviour here. This is purely
> packaging. The no-build edit workflow (edit `activities.js`, see the change)
> stays exactly as it was — see "Day-to-day after this" at the end.

**Rough time:** ~1.5–2 hrs, most of it downloads (Android Studio is ~9 GB).
Do it once.

---

## 0. What you're installing and why

| Tool | Why | Version |
|------|-----|---------|
| Homebrew | Mac package manager — installs Node cleanly | latest |
| Node.js | Runs the Capacitor command-line tool | **22 LTS or newer** (Cap 8 needs 22+) |
| Android Studio | The Android build toolchain + emulator + JDK 21 | **Otter (2025.2.1) or newer** |
| Capacitor | Wraps the web app as native | **8.x** |

JDK 21 ships *inside* Android Studio — you do not install Java separately.

---

## 1. Install Homebrew

Open **Terminal** (Cmd-Space, type "Terminal"). Paste:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

When it finishes it prints two `echo ...` lines to "add Homebrew to your PATH."
On Apple Silicon they reference `/opt/homebrew`. Run exactly the two lines it
shows you (they'll look like):

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Check:**
```bash
brew --version
```
Prints a version number → good. "command not found" → the PATH lines didn't
run; close and reopen Terminal and try again.

---

## 2. Install Node 22+

```bash
brew install node
```

**Check:**
```bash
node --version
```
Must be **v22.x or higher**. If it's lower, run `brew upgrade node`.

---

## 3. Install Android Studio

```bash
brew install --cask android-studio
```

(Or download the Apple-Silicon build from developer.android.com/studio and drag
to Applications — either way is fine.)

Then **open Android Studio** and let the first-run **Setup Wizard** complete. Pick
**Standard** install when asked. It downloads the Android SDK, an emulator, and
the JDK. Let it finish completely.

**Inside Android Studio, install one system image for the emulator:**
1. On the welcome screen: **More Actions → Virtual Device Manager** (or
   **Device Manager**).
2. **Create Device** → pick **Pixel 7** (or any recent Pixel) → **Next**.
3. Choose a system image: **API 34 or 35**, and — **important on M5** — the
   **arm64-v8a** ABI, not x86_64. If the recommended tab only shows x86, open
   the **"Other Images"** tab and find the `arm64-v8a` one. Download it.
4. **Next → Finish.**

**Check:** the new virtual device appears in Device Manager with a ▶ play button.

**Point the terminal at the Android SDK** (so command-line builds find it). Add
these to your `~/.zshrc`:

```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc
```

**Check:**
```bash
adb --version
```
Prints a version → good.

---

## 4. Put the app folder in place

You should have the `om-app` folder (the one containing `index.html`,
`activities.js`, etc. — the modified versions from this session). Put it
somewhere stable, e.g. your home folder or Desktop. In Terminal, go into it:

```bash
cd ~/Desktop/om-app      # adjust path to wherever you put it
ls
```

**Check:** you see `index.html`, `activities.js`, `capacitor.config.json`,
`package.json`, `README.md`.

> Note the config uses **`"webDir": "www"`** — Capacitor serves the app from a
> `www` folder. The next step creates it and copies your files in.

---

## 5. Create the web-assets folder Capacitor serves

Capacitor bundles whatever is in `www/`. Your source files stay where they are;
we copy them into `www/`:

```bash
mkdir -p www
cp index.html activities.js www/
```

**Check:**
```bash
ls www
```
Shows `index.html` and `activities.js`.

> You'll re-run this one `cp` line + a sync command whenever you change the app
> — captured in "Day-to-day" at the end. It's the only build step, and it does
> NOT change how the content team edits `activities.js`.

---

## 6. Install Capacitor + the plugins

```bash
npm install
```

This reads `package.json` and pulls Capacitor 8 core, the CLI, and the four
plugins (Preferences, Filesystem, Share, SplashScreen) plus the Android
platform package.

**Check:**
```bash
npx cap --version
```
Prints **8.x**.

---

## 7. Initialise and add Android

If `npx cap --version` worked, the config is already in place
(`capacitor.config.json`). Add the native Android project:

```bash
npx cap add android
```

This creates an `android/` folder — the actual native project.

**Check:** an `android/` folder now exists (`ls` shows it).

Now sync your web assets + plugins into it:

```bash
npx cap sync android
```

**Check:** the command ends with "Sync finished" and lists the plugins it found
(you should see Preferences, Filesystem, Share, SplashScreen).

---

## 8. First run on the emulator

```bash
npx cap run android
```

It lists targets; pick the emulator you made in step 3 (arrow keys + Enter), or
add `--target` later. Android Studio's Gradle will build (slow the first time,
fast after). The emulator boots and the app launches.

**Check:** the **Welcome screen** appears ("O&M Cane Training / Get started").

If instead you'd rather drive it from the IDE: `npx cap open android` opens the
project in Android Studio, then press the green ▶ Run button there.

---

## 9. THE CRITICAL TEST — does native storage work?

This is the one thing we deliberately deferred to on-device, because the app
uses the no-bundler plugin path. We need to confirm the Capacitor Preferences
plugin actually loads. Do this in the running app:

1. Tap **Get started** → on the Hub, **Add child** → type a name → **Save child**.
2. You should see the green "Child saved" toast.
3. **Fully close the app** in the emulator (swipe it away from recents), then
   relaunch it from the app drawer.
4. Go to **Manage data** (or add a result, then check Past results).

**Pass:** the child you saved is **still there** after the cold restart.
→ Native Preferences is working. You're done with the risky part.

**Fail:** the child is gone after restart.
→ The app fell back to WebView localStorage (which Android can clear). Tell me,
   and I'll add a small explicit plugin-registration shim — it's a known,
   contained fix, not a redesign. The fallback means the app still *runs*; it
   just isn't using durable native storage yet.

Also test, while you're here (your "verify on real device" list):
- **Export records** → should open the Android **share sheet** (not a silent
  browser download). Save the CSV to Files/Drive to confirm.
- **Add child → Date of birth** → the native date picker should open and not get
  clipped by the sliding form.
- **Delete a result** → the confirm dialog should appear and work.

---

## 10. Run on a real phone (optional, recommended for the pilot)

1. On the Android phone: **Settings → About phone → tap "Build number" 7 times**
   to unlock Developer Options.
2. **Settings → Developer options → enable "USB debugging."**
3. Plug the phone into the Mac with a cable. Tap **Allow** on the phone's "trust
   this computer" prompt.
4. ```bash
   adb devices
   ```
   **Check:** your phone's serial appears (not "unauthorized" — if it says that,
   re-tap Allow on the phone).
5. ```bash
   npx cap run android
   ```
   Pick the physical device this time.

**Check:** the app installs and launches on the real phone. Re-do the step-9
storage test here too — this is the environment that actually matters for the
pilot.

---

## Day-to-day after this (the workflow you keep)

You changed the app once to wrap it. From now on:

**Content team editing activities** (unchanged from before, for the *web*
version): open `activities.js`, edit text between quotes, save, refresh the
browser. The web app still works exactly as it always did by double-clicking
`index.html` or running the local server. The native wrap doesn't take that
away.

**Pushing a change into the Android app** (only you, only when you want a new
APK): three lines —
```bash
cp index.html activities.js www/    # copy latest source into web-assets
npx cap sync android                # push into the native project
npx cap run android                 # rebuild + run
```

That `cp` + `sync` is the entire "build step" the bundler decision was about —
two commands, only when shipping a native build, and it never sits between the
content team and their edit-refresh loop.

---

## When you hit an error (you will, once)

- **`invalid source release: 21` / Java version errors** — Android Studio's
  bundled JDK isn't being used. In Android Studio: **Settings → Build, Execution,
  Deployment → Build Tools → Gradle → Gradle JDK →** pick the bundled
  **jbr-21**. Re-run.
- **Gradle/AGP version complaint** — open the project in Android Studio
  (`npx cap open android`), let it run **AGP Upgrade Assistant** if it offers,
  accept. Capacitor 8 targets AGP 8.13.
- **`adb: command not found`** — step 3's `~/.zshrc` lines didn't load. Run
  `source ~/.zshrc` or reopen Terminal.
- **Emulator is x86 / won't boot on M5** — you grabbed the wrong system image.
  Make a new virtual device with the **arm64-v8a** image (step 3).
- **Anything else** — copy the exact error text to me and I'll work it with you.

---

## What this does NOT cover yet (deliberately, later)

- **App icon & splash art** — currently the Capacitor default. Replaceable any
  time with `@capacitor/assets`; cosmetic, not blocking a pilot.
- **Play Store release build** (signed AAB) — a separate process for public
  distribution. Not needed to put it on pilot phones via USB.
- **iOS** — `npx cap add ios` later; needs Xcode + an Apple Developer account
  ($99/yr). The web + Store seam already support it; it's additive.
- **Session video** — the camera/upload feature is still blocked on the pooling
  + offline-upload decisions; when it's built it'll add camera permissions to
  the Android manifest. That's the one piece that'll re-touch this native shell.
