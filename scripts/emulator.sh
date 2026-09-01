#!/usr/bin/env bash
# scripts/emulator.sh — boot the Android emulator and wait until it is usable.
#
# WHY THIS EXISTS (2026-08-24): the usual "run -list-avds, then type the name
# into the next command" dance hands over a command containing a placeholder,
# and a placeholder gets pasted literally — zsh answers with `parse error near
# '&'` and the person is no further forward. MEMORY.md already carries the
# rule: never write <something> in a command; if it needs a value it cannot
# know, make it a script. This is that script.
#
#   bash scripts/emulator.sh                    boot the first AVD, wait for it
#   bash scripts/emulator.sh --list             just list the AVDs
#   bash scripts/emulator.sh Pixel_10_Pro_XL    boot one by name
#
# It waits for sys.boot_completed rather than just launching and exiting,
# because `gradlew installDebug` only sees a device that has finished booting —
# that is the whole reason for "No connected devices!" after a launch.

set -u

SDK="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Library/Android/sdk}}"
EMU="$SDK/emulator/emulator"
ADB="$SDK/platform-tools/adb"

if [ ! -x "$EMU" ]; then
  echo "No emulator binary at: $EMU"
  echo "Either set ANDROID_SDK_ROOT, or install it:"
  echo "  Android Studio > Settings > Languages & Frameworks > Android SDK > SDK Tools > Android Emulator"
  exit 1
fi
if [ ! -x "$ADB" ]; then
  echo "No adb at: $ADB  (SDK Tools > Android SDK Platform-Tools)"
  exit 1
fi

AVDS=$("$EMU" -list-avds | sed '/^$/d')
if [ -z "$AVDS" ]; then
  echo "No AVDs exist on this machine yet."
  echo "  Android Studio > Device Manager > Create Virtual Device"
  exit 1
fi

if [ "${1:-}" = "--list" ]; then echo "$AVDS"; exit 0; fi

echo "AVDs on this machine:"
echo "$AVDS" | sed 's/^/  /'
echo

AVD="${1:-$(echo "$AVDS" | head -1)}"

# BUG FIXED 2026-08-25: this used to trust `adb devices`, and a just-killed
# emulator LINGERS in that listing for several seconds. Running
# `adb emu kill; bash scripts/emulator.sh` therefore saw a "running" emulator,
# skipped the boot, and then sat in wait-for-device forever waiting for a
# machine that no longer existed. The listing is not proof of life — ask the
# device a question instead.
RUNNING=""
if "$ADB" devices | grep -q "emulator-.*device"; then
  if "$ADB" -e shell getprop sys.boot_completed >/dev/null 2>&1; then
    RUNNING=1
  else
    echo "A dead emulator is still listed; waiting for adb to let go..."
    for _ in 1 2 3 4 5 6 7 8 9 10; do
      "$ADB" devices | grep -q "emulator-" || break
      sleep 1
    done
  fi
fi

if [ -n "$RUNNING" ]; then
  echo "An emulator is already running and responding — not starting another."
else
  echo "Booting: $AVD"
  nohup "$EMU" -avd "$AVD" >/dev/null 2>&1 &
  sleep 2
fi

echo "Waiting for boot to complete (a cold start takes a minute or two)..."
# Bounded, because an unbounded wait is indistinguishable from a hang and this
# script has already hung once.
BOOTED=""
for _ in $(seq 1 180); do
  if [ "$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; then
    BOOTED=1; break
  fi
  sleep 2
done
if [ -z "$BOOTED" ]; then
  echo
  echo "Gave up after 6 minutes — the emulator never reported sys.boot_completed."
  echo "Try:  pkill -f qemu-system   then run this script again."
  exit 1
fi

echo
echo "Ready:"
"$ADB" devices
echo
echo "The emulator window may be docked inside Android Studio rather than"
echo "floating on its own — look under View > Tool Windows > Running Devices."
echo
echo "Next:  cd android && ./gradlew installDebug"
