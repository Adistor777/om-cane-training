# Runbook — build and run the app

_2026-07-28. Written for the handover to a blind tester._

Everything below runs on your Mac, from `~/Desktop/om-app`. One command per step,
each with a check. If a check fails, stop there — do not continue.

---

## 0. Before you start (30 seconds)

> **Note on the snippets below.** You are on zsh, and **interactive zsh does not
> treat `#` as a comment** — a trailing `# expect: 0` gets passed to the command
> as arguments. So no snippet here has an inline comment; expected values are
> written underneath instead. (If you want inline comments to work in your
> shell: `setopt interactive_comments`, or add it to `~/.zshrc`.)

```bash
cd ~/Desktop/om-app
git branch --show-current
node -v
ls audio sounds faces | wc -l
```

Expect: `feat/a11y-blind-teacher` · `v22` or later · a non-zero count.

Media (`audio/`, `sounds/`, `faces/`, `demo-*.mp4`) is gitignored, so it only
exists on this Mac. It is all present right now — 28 narration files, 22 sounds,
2 demo faces, 8 demo videos. If any of those are empty the build still succeeds
but the app ships without audio, which for a blind tester is most of the app.

If `JAVA_HOME` is not set in this shell:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
java -version
```

Expect: `21.x`.

---

## 1. Commit the accessibility work

The sandbox could not write git lock files, so this is still uncommitted.

```bash
rm -f .git/index.lock .git/HEAD.lock

git add app.js index.html styles.css scripts/ \
        docs/A11Y-TALKBACK-TESTS.md docs/RUNBOOK.md docs/a11y-commit-msg.txt \
        package.json package-lock.json .gitignore

git commit -F docs/a11y-commit-msg.txt
git log --oneline -1
```

**Check:** the log line mentions "make the app fully operable by a blind teacher".

`docs/a11y-preview.html` is generated output and is gitignored — regenerate it
with `node scripts/a11y-preview.js` rather than committing it.

Commit `MEMORY.md` and `TRACKER.md` separately, as always:

```bash
git add MEMORY.md TRACKER.md
git commit -m "MEMORY/TRACKER: 2026-07-28 accessibility pass"
```

---

## 2. Build

```bash
./scripts/build.sh
```

This is the only build command. It now runs six accessibility gates before it
copies anything, and **fails the build** if any of them fails:

| Gate | What it protects |
|------|------------------|
| school-ID guard | app.js and schema.sql agree |
| JS parse | store.js + app.js actually parse |
| contrast | real WCAG ratios, all four colour modes |
| default look | rem tokens still equal their old px; no a11y rule leaks into the 1× design |
| flows | sign in, save, batch scoring, dialogs — driven end to end |
| smoke | 546 controls activated across every screen, nothing throws |
| axe | 21 screens, plus 31 app-specific assertions |

**Check:** the last line reads `BUILD OK`.

If a gate fails it prints the failing assertions. Do not work around it — a
failure there is the thing your tester would have hit.

---

## 3. Install

### On a real Android phone — **do this one**

TalkBack on the emulator is not a fair test: the gestures do not map cleanly and
the speech timing is wrong. A blind tester needs a real device.

**First time on a given phone**, get it talking to the Mac:

1. Settings → About phone → tap **Build number** seven times.
2. Settings → System → Developer options → **USB debugging** on.
3. Plug into the Mac. Tap **Allow** on the phone's prompt.
4. `adb devices` — the phone must show as `device`. `unauthorized` means you
   missed the prompt; unplug, replug, and accept it.

Then:

```bash
cd android
./gradlew clean installDebug
```

> `No connected devices!` means exactly that — no phone plugged in and no
> emulator running. The build itself already succeeded; only the install step
> had nowhere to go. Either connect a device, or use `assembleDebug` below and
> sideload.

`clean` matters — a native config changed (`forceDarkAllowed`), and a stale
install is the classic way to spend an hour debugging code that is already
correct.

**Check:** "O&M Cane Training" launches and shows the Sign in screen.

### Sending an APK instead (for Mansi, or a tester you can't plug in)

This needs no device attached at all, and is the simplest path when you are
handing the phone to someone rather than debugging on it.

```bash
cd android
./gradlew assembleDebug
open app/build/outputs/apk/debug/
```

**Check the file's timestamp.** An older `app-debug.apk` may already be sitting
at that path from a previous session, and it is easy to send the wrong one.

Rename it with the date (`om-cane-2026-07-28.apk`) and send it over WhatsApp
**as a document**, or via Drive. First install on their phone needs
"allow from this source" once, plus Play Protect → "Install anyway".

---

## 4. Sign in

Cloud sync is off (`CLOUD_SYNC = false` in `store.js`), so login is the offline
pilot stub: a seeded login ID and **any non-empty password**.

| School | Login ID |
|--------|----------|
| Saksham School, Noida | `saksham01` |
| RNKS, Jaipur | `rnks01` |
| NAB, Kullu | `nab01` |

Tell your tester the password is anything — otherwise they will assume a typo
and retry a password that was never being checked.

---

## 5. Set the phone up for the tester

Do this **before** handing the phone over, so their first minute is spent on the
app rather than on Android settings.

1. **TalkBack on** — Settings → Accessibility → TalkBack → On. Note whether the
   two-volume-key shortcut is enabled; they will want it.
2. **Check the voice** — Settings → Accessibility → TalkBack → Settings →
   Text-to-speech. If a Hindi voice pack is installed, say so: it is the one
   thing about the narration-language buttons that has never been tested on a
   real device.
3. **Speech rate** — leave it wherever they like it. Do not "fix" it.
4. Leave display settings alone. Text size, high contrast and dark mode live
   inside the app now (Settings → Display) and are the thing you want feedback
   on.

---

## 6. What to hand them

- The phone, signed in and on the Home screen.
- `docs/A11Y-TALKBACK-TESTS.md` — six runs, about 20 minutes. The table near
  the end lists the six behaviours that were broken and fixed today; if any of
  those misbehaves it is a regression, and worth reporting as such.
- Ask them to narrate what they hear rather than whether it "works". "It said
  nothing" and "it said the wrong thing" are different bugs with different fixes.

**Be strict about one thing.** In multi-child scoring, moving to the next child
must announce **"Now scoring <name>, student N of M"**. If the child changes
without saying so, stop the session — every other failure wastes time, that one
produces wrong data that looks right.

---

## Before it leaves the building — the consent-clean build

`faces/` ships inside every APK: two bundled demo-child photos (`aditya.jpg`,
`vaishu.jpg`). MEMORY has flagged since 2026-07-13 that bundled real-child
photos need guardian consent on file before a build leaves the team.

**If the tester is outside the team**, either confirm that consent or build them
a copy with `faces/` emptied:

The photos are gitignored, so moving them out of the way loses nothing.

```bash
cd ~/Desktop/om-app
mv faces/*.jpg /tmp/
./scripts/build.sh
cd android && ./gradlew clean assembleDebug
```

Watch for `mirrored faces/ -> www/faces/ (0 files)` in the build output — that
is the mirror doing its job.

**Verify before sending. This is the check that matters:**

```bash
unzip -l app/build/outputs/apk/debug/app-debug.apk | grep -c faces/
```

Expect `0`. (`grep -c` exits non-zero when the count is zero — that is normal;
the printed number is the answer.) If it prints anything above 0, do not send
the file.

Then put them back:

```bash
cd ~/Desktop/om-app
mv /tmp/aditya.jpg /tmp/vaishu.jpg faces/
./scripts/build.sh
```

Expect `mirrored faces/ -> www/faces/ (2 files)`.

### Two things had to be fixed for that to actually work (2026-07-28)

Worth knowing, because the obvious version of this recipe silently failed:

1. **`build.sh` used `cp -R`, which only ADDS.** Emptying `faces/` left the
   photos sitting in `www/faces/`, and `cap sync` carried them into the APK
   anyway — a consent-clean build that still shipped the photos. Step 3b now
   mirrors with `rsync --delete` (with a plain-`cp` fallback), so a file
   deleted from `audio/`, `sounds/` or `faces/` really does leave the build.
2. **A profile's `photo` is a PATH (`faces/aditya.jpg`), not image data.** With
   the file absent, the app rendered a broken-image icon on every screen
   showing that child. `avatarFor` now attaches an `onerror` that swaps in the
   child's initial — the same thing a photo-less profile already shows. This
   also covers a fresh clone, where `faces/` is gitignored and simply absent.

The `unzip -l` check above exists because assumption (1) is exactly the kind of
thing that looks done and isn't.

---

## If something goes wrong

| Symptom | Cause | Fix |
|---------|-------|-----|
| Emulator/phone shows old behaviour after a clean sync | stale install, not stale assets | `cd android && ./gradlew clean installDebug` |
| `cp: Permission denied` copying to `www/` | a sandbox session touched the media | `chmod -R u+w www` then rebuild |
| `git` says another process is running | leftover lock file | `rm -f .git/index.lock .git/HEAD.lock` |
| Build fails on an a11y gate | a real regression | read the failing assertion; do not skip the gate |
| No audio in the app | media missing from `www/` | check `ls www/audio www/sounds`, then rebuild |
| `grep: #: No such file or directory` | interactive zsh does not honour `#` comments | Drop the inline comment, or `setopt interactive_comments` |
| `JAVA_HOME` errors from gradle | wrong JDK | `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"` |
| `No connected devices!` on `installDebug` | nothing plugged in, no emulator running | Connect a phone (see step 3), or use `./gradlew assembleDebug` and sideload the APK. The build already passed — only the install had nowhere to go. |
| `adb devices` shows `unauthorized` | the phone's USB-debugging prompt was missed | Unplug, replug, tap **Allow** on the phone |
| Want a quick look without a phone | emulator is fine for eyeballing, NOT for TalkBack | `~/Library/Android/sdk/emulator/emulator -list-avds` then `emulator -avd <name> &`, wait for boot, re-run `installDebug` |

---

## The whole thing, if you just want to paste it

```bash
cd ~/Desktop/om-app
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./scripts/build.sh
cd android && ./gradlew assembleDebug
open app/build/outputs/apk/debug/
```

No device needed for `assembleDebug`. Check the APK's timestamp before sending.

Swap the last two lines for `./gradlew clean installDebug` if a phone or
emulator is connected.

Then sign in as `saksham01` with any password.
