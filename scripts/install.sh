#!/usr/bin/env bash
# scripts/install.sh — install the debug APK and PROVE what landed on the device.
#
# WHY THIS EXISTS (2026-08-24): "I changed the code but the app shows the old
# thing" has now had three different causes in this project, and they look
# identical from the outside:
#   1. gradlew run without ./scripts/build.sh first  -> www/ was stale
#   2. assembleDebug without installDebug            -> built, never pushed
#   3. installDebug with no booted device            -> failed, and the old
#                                                       install stayed put
# MEMORY.md has a diagnostic for (1). This covers (2) and (3) by comparing the
# APK on disk with the one actually installed on the device afterwards, so the
# answer is a fact rather than a guess.
#
#   bash scripts/install.sh          install, then verify
#   bash scripts/install.sh --clean  clean first (for a genuinely stuck install)

set -u
PKG="org.omcane.trainer"
SDK="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Library/Android/sdk}}"
ADB="$SDK/platform-tools/adb"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"

[ -x "$ADB" ] || { echo "No adb at: $ADB"; exit 1; }

if ! "$ADB" devices | grep -q "	device$"; then
  echo "No booted device. Start one first:"
  echo "  bash scripts/emulator.sh"
  echo "…or plug in a phone with USB debugging on."
  "$ADB" devices
  exit 1
fi
echo "Device:"; "$ADB" devices | grep "	device$" | sed 's/^/  /'; echo

cd "$ROOT/android" || exit 1
if [ "${1:-}" = "--clean" ]; then
  echo "Clean build (slow, but defeats every up-to-date check)..."
  ./gradlew clean installDebug || exit 1
else
  ./gradlew installDebug || exit 1
fi
echo

[ -f "$APK" ] || { echo "No APK at $APK — did the build actually run?"; exit 1; }

LOCAL_SIZE=$(stat -f%z "$APK" 2>/dev/null || stat -c%s "$APK")
REMOTE_PATH=$("$ADB" shell pm path "$PKG" 2>/dev/null | tr -d '\r' | head -1 | sed 's/^package://')
if [ -z "$REMOTE_PATH" ]; then
  echo "VERIFY FAILED: $PKG is not installed on the device at all."
  exit 1
fi
REMOTE_SIZE=$("$ADB" shell stat -c%s "$REMOTE_PATH" 2>/dev/null | tr -d '\r')

echo "  built  : $APK  ($LOCAL_SIZE bytes)"
echo "  on dev : $REMOTE_PATH  ($REMOTE_SIZE bytes)"
echo
if [ "$LOCAL_SIZE" = "$REMOTE_SIZE" ]; then
  echo "MATCH — the device is running the APK you just built."
  echo
  echo "Force-stop it so the WebView reloads from the new assets:"
  echo "  $ADB shell am force-stop $PKG"
  "$ADB" shell am force-stop "$PKG" 2>/dev/null && echo "  (done)"
else
  echo "MISMATCH — the device is running a DIFFERENT build."
  echo "Run:  bash scripts/install.sh --clean"
  exit 1
fi
