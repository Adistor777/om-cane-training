#!/usr/bin/env bash
# generate-thumbs.sh — extract a poster frame for every demo video.
# Run from repo root: ./scripts/generate-thumbs.sh   (needs ffmpeg)
#
# For each demo-*.mp4 it writes demo-*.jpg next to it (skips ones that already
# have a poster; --force redoes all). The app derives the poster name from
# videoFile (<name>.mp4 -> <name>.jpg), and build.sh copies demo-*.jpg to www/,
# so a new video only needs this script re-run — no app changes.
#
# Frame choice: ffmpeg's `thumbnail` filter scans the first ~10s and picks the
# most representative frame (avoids black lead-ins and mid-motion blur).
set -euo pipefail
cd "$(dirname "$0")/.."

command -v ffmpeg >/dev/null || { echo "ffmpeg not found — brew install ffmpeg"; exit 1; }

FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

made=0; skipped=0
for v in demo-*.mp4; do
  [ -f "$v" ] || continue
  jpg="${v%.mp4}.jpg"
  if [ -f "$jpg" ] && [ "$FORCE" = "0" ]; then
    echo "skip (exists)  $jpg"; skipped=$((skipped+1)); continue
  fi
  ffmpeg -y -loglevel error -i "$v" \
    -vf "thumbnail=250,scale=640:-2" -frames:v 1 -q:v 4 "$jpg"
  echo "OK  $jpg"
  made=$((made+1))
done
echo
echo "Done: $made written, $skipped skipped. Re-run with --force after re-filming a demo."
