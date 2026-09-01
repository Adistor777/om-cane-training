#!/usr/bin/env bash
# build.sh — the ONE build command. Run from repo root: ./scripts/build.sh
#
# Kills two recurring bug classes:
#   1. Stale www/ copy (root index.html is source of truth; Capacitor loads www/).
#   2. School-ID drift between index.html (seedSchools) and supabase/schema.sql.
#
# Steps: consistency guard -> JS parse check -> copy web assets -> cap sync ->
#        grep-verify built Android assets. Fails loudly at the first problem.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "BUILD FAILED: $*" >&2; exit 1; }

# ---- 1-2. Every node-only gate, shared with CI --------------------------------
# School-ID guard, JS parse check, the six accessibility gates and the unit
# suite all live in scripts/gates.sh so .github/workflows/ci.yml runs exactly
# what the build runs. Everything below here needs Capacitor and the Android
# SDK, which CI does not have.
bash scripts/gates.sh

# ---- 3. Copy web assets to www/ ------------------------------------------------
# index.html always; the split files (styles.css, store.js, app.js),
# activities.js, and vendored supabase.js whenever they exist at root.
for f in index.html styles.css store.js app.js activities.js supabase.js; do
  [ -f "$f" ] && cp "$f" "www/$f" && echo "OK  copied $f -> www/"
done

# ---- 3b. Bundled media: SOP narration + command cues (audio/), Sound Library
#          mp3s (sounds/), demo-profile photos (faces/), demo videos
#          (demo-*.mp4 at root), and category setup photos (help-*.jpg at
#          root). All gitignored; previously copied by hand (the step everyone
#          forgets) — now the build owns it. cp -R dir/. preserves subfolders
#          (audio/commands/).
#          MIRROR, don't merge. `cp -R` alone only ADDS: a file deleted from
#          audio/ or faces/ would linger in www/ and keep shipping in the APK.
#          That is not hypothetical — a consent-clean build for an outside
#          tester works by emptying faces/, and with a merge-only copy the
#          child photos would still have gone out. rsync --delete makes www/
#          a true mirror; the fallback keeps this working without rsync.
#          img/ and fonts/ are the ODD ONES OUT: they hold artwork (the BIF
#          mark, the bundled OFL typefaces) rather than personal data, so they
#          are COMMITTED. They still mirror here because www/ is what ships.
#          img/ note kept verbatim below: it holds artwork (the BIF mark, the home
#          illustration), not personal data, so unlike the other three it IS
#          committed to git. It rides this loop because the copy problem is
#          identical — a file removed from img/ must stop shipping too.
for d in audio sounds faces img fonts; do
  if [ -d "$d" ]; then
    mkdir -p "www/$d"
    if command -v rsync >/dev/null 2>&1; then
      rsync -a --delete --exclude '.DS_Store' "$d/" "www/$d/"
    else
      rm -rf "www/$d" && mkdir -p "www/$d" && cp -R "$d/." "www/$d/"
      find "www/$d" -name '.DS_Store' -delete 2>/dev/null || true
    fi
    echo "OK  mirrored $d/ -> www/$d/ ($(ls -1 "$d" | grep -v '^\.DS_Store$' | wc -l | tr -d ' ') files)"
  fi
done
for v in demo-*.mp4 demo-*.jpg help-*.jpg; do
  if [ -f "$v" ]; then
    cp "$v" "www/$v" && echo "OK  copied $v -> www/"
  fi
done

# ---- 4. Capacitor sync ----------------------------------------------------------
npx cap sync android

# ---- 5. Verify built Android assets actually got the new code ------------------
pub="android/app/src/main/assets/public"
[ -d "$pub" ] || fail "built assets not found at $pub"
# A file present at ROOT must have reached www/ AND the built assets. The old
# form was `[ -f "www/$f" ] || continue`, which SKIPPED a missing built asset
# instead of failing — the one thing this gate exists to catch. Only a file
# that is legitimately absent from the repo is skipped now.
for f in index.html styles.css store.js app.js activities.js supabase.js; do
  [ -f "$f" ] || continue
  [ -f "www/$f" ] || fail "$f exists at root but never reached www/ — the copy step did not run"
  [ -f "$pub/$f" ] || fail "$f is in www/ but not in $pub — cap sync did not land"
  cmp -s "www/$f" "$pub/$f" || fail "built $f differs from www/ copy — sync did not land"
done
echo "OK  built assets match www/"

echo
echo "BUILD OK. If the emulator shows stale code anyway: cd android && ./gradlew clean installDebug"
