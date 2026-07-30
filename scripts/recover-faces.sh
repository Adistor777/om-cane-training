#!/usr/bin/env bash
# recover-faces.sh — try to get faces/aditya.jpg and faces/vaishu.jpg back.
#
# WHY THIS EXISTS (2026-07-29): faces/ is gitignored, so the Mac was the only
# copy. A consent-clean build stashed them in /tmp, macOS cleared it, and they
# were gone. The app still runs (avatarFallback shows initials), but the demo
# children lose their photos.
#
# Any APK built before that point still contains them at
# assets/public/faces/. This script looks in every place such an APK might be
# and extracts the first one it finds.
#
# Run from anywhere:  bash scripts/recover-faces.sh
set -uo pipefail

ADB="$HOME/Library/Android/sdk/platform-tools/adb"
EMU="$HOME/Library/Android/sdk/emulator/emulator"
BACKUP="$HOME/om-media-backup"
REPO="$HOME/Desktop/om-app"
PKG="org.omcane.trainer"

mkdir -p "$BACKUP"
found=0

say(){ printf '\n%s\n' "$*"; }
try_apk(){
  local apk="$1" src="$2"
  [ -f "$apk" ] || return 1
  local n
  n=$(unzip -l "$apk" 2>/dev/null | grep -c 'faces/.*\.jpg' || true)
  [ "${n:-0}" -gt 0 ] || { echo "    no photos in this one"; return 1; }
  echo "    FOUND $n photo(s) — extracting"
  unzip -o -j "$apk" 'assets/public/faces/*.jpg' -d "$BACKUP" >/dev/null 2>&1 || return 1
  echo "    recovered from: $src"
  found=1
  return 0
}

# ---- 1. Any APK lying around on the Mac ------------------------------------
say "1. Searching the Mac for APKs that still contain the photos..."
while IFS= read -r apk; do
  echo "  checking: $apk"
  try_apk "$apk" "$apk" && break
done < <(find "$HOME/Desktop" "$HOME/Downloads" "$HOME/Documents" \
              -name "*.apk" -size +1M 2>/dev/null | head -40)

# ---- 2. A device or emulator with an older build installed ------------------
if [ "$found" -eq 0 ]; then
  say "2. Looking for a phone or emulator with an older build installed..."
  [ -x "$ADB" ] || ADB="adb"

  if ! "$ADB" devices 2>/dev/null | grep -qE '\sdevice$'; then
    echo "  nothing connected. Trying to start an emulator..."
    if [ -x "$EMU" ]; then
      avd=$("$EMU" -list-avds 2>/dev/null | head -1)
      if [ -n "$avd" ]; then
        echo "  booting AVD: $avd  (this takes a minute)"
        "$EMU" -avd "$avd" >/dev/null 2>&1 &
        "$ADB" wait-for-device >/dev/null 2>&1
        for _ in $(seq 1 60); do
          [ "$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ] && break
          sleep 2
        done
      else
        echo "  no AVDs configured."
      fi
    fi
  fi

  if "$ADB" devices 2>/dev/null | grep -qE '\sdevice$'; then
    path=$("$ADB" shell pm path "$PKG" 2>/dev/null | tr -d '\r' | sed 's/^package://' | head -1)
    if [ -n "$path" ]; then
      echo "  app is installed at: $path"
      "$ADB" pull "$path" /tmp/om-old.apk >/dev/null 2>&1 && try_apk /tmp/om-old.apk "device install ($path)"
    else
      echo "  the app is not installed on this device."
    fi
  else
    echo "  no device available."
  fi
fi

# ---- verdict ----------------------------------------------------------------
say "----------------------------------------------------------------"
if [ "$found" -eq 1 ]; then
  ls -la "$BACKUP"/*.jpg
  echo ""
  echo "RECOVERED. Put them back and rebuild:"
  echo "  cp $BACKUP/*.jpg $REPO/faces/"
  echo "  cd $REPO && ./scripts/build.sh"
  echo ""
  echo "Keep $BACKUP — it is the second copy this media has never had."
else
  echo "NOT FOUND on this machine."
  echo ""
  echo "Still worth trying, in order:"
  echo "  · the APK you sent over WhatsApp or Drive earlier today (the 13:32"
  echo "    build contained them) — download it and re-run this script"
  echo "  · Mansi's phone, if she still has an older debug build installed"
  echo "  · Time Machine, if it is enabled"
  echo "  · wherever the photos originally came from (Photos, your phone)"
  echo ""
  echo "The app works without them: avatarFallback shows the child's initial"
  echo "instead of a broken image. Nothing is blocked."
fi
