# Runbook — build and run the app

_2026-07-28. Written for the handover to a blind tester._

Everything below runs on your Mac, from `~/Desktop/om-app`. One command per step,
each with a check. If a check fails, stop there — do not continue.

---

## 0. Before you start (30 seconds)

```bash
cd ~/Desktop/om-app
git branch --show-current      # expect: feat/a11y-blind-teacher
node -v                        # expect: v22 or later
ls audio sounds faces | wc -l  # expect a non-zero count
```

Media (`audio/`, `sounds/`, `faces/`, `demo-*.mp4`) is gitignored, so it only
exists on this Mac. It is all present right now — 28 narration files, 22 sounds,
2 demo faces, 8 demo videos. If any of those are empty the build still succeeds
but the app ships without audio, which for a blind tester is most of the app.

If `JAVA_HOME` is not set in this shell:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
java -version                  # expect: 21.x
```

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

Plug the phone in, enable USB debugging, then:

```bash
cd android
./gradlew clean installDebug
```

`clean` matters — a native config changed (`forceDarkAllowed`), and a stale
install is the classic way to spend an hour debugging code that is already
correct.

**Check:** "O&M Cane Training" launches and shows the Sign in screen.

### Sending an APK instead (for Mansi, or a tester you can't plug in)

```bash
cd android
./gradlew assembleDebug
open app/build/outputs/apk/debug/
```

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

## Before it leaves the building

`faces/` ships inside every APK: two bundled demo-child photos (Aditya, Vaishu).
MEMORY has flagged since 2026-07-13 that bundled real-child photos need guardian
consent on file before a build leaves the team. If this tester is outside the
team, either confirm that consent or build them a copy with `faces/` emptied:

```bash
mv faces /tmp/faces-backup && mkdir faces
./scripts/build.sh && cd android && ./gradlew clean assembleDebug
cd .. && rm -rf faces && mv /tmp/faces-backup faces
```

The app seeds demo children with initials instead of photos when `faces/` is
empty — nothing else changes.

---

## If something goes wrong

| Symptom | Cause | Fix |
|---------|-------|-----|
| Emulator/phone shows old behaviour after a clean sync | stale install, not stale assets | `cd android && ./gradlew clean installDebug` |
| `cp: Permission denied` copying to `www/` | a sandbox session touched the media | `chmod -R u+w www` then rebuild |
| `git` says another process is running | leftover lock file | `rm -f .git/index.lock .git/HEAD.lock` |
| Build fails on an a11y gate | a real regression | read the failing assertion; do not skip the gate |
| No audio in the app | media missing from `www/` | check `ls www/audio www/sounds`, then rebuild |
| `JAVA_HOME` errors from gradle | wrong JDK | `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"` |

---

## The whole thing, if you just want to paste it

```bash
cd ~/Desktop/om-app
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
rm -f .git/index.lock .git/HEAD.lock
git add app.js index.html styles.css scripts/ docs/ package.json package-lock.json .gitignore
git commit -F docs/a11y-commit-msg.txt
./scripts/build.sh
cd android && ./gradlew clean installDebug
```

Then sign in as `saksham01` with any password.
