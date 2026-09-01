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

# ---- 1. School-ID consistency guard (app.js seedSchools vs supabase/schema.sql)
app_ids=$(grep -o "id:'sch_[a-z_]*'" app.js | grep -o "sch_[a-z_]*" | sort -u)
sql_ids=$(grep -o "('sch_[a-z_]*'" supabase/schema.sql | grep -o "sch_[a-z_]*" | sort -u)
[ -n "$app_ids" ] || fail "no sch_* school IDs found in app.js (seedSchools)"
[ -n "$sql_ids" ] || fail "no sch_* school IDs found in supabase/schema.sql seed"
if [ "$app_ids" != "$sql_ids" ]; then
  echo "--- app.js -------"; echo "$app_ids"
  echo "--- schema.sql ---"; echo "$sql_ids"
  fail "school IDs disagree between app.js and supabase/schema.sql"
fi
echo "OK  school IDs consistent ($(echo "$app_ids" | wc -l | tr -d ' ') schools)"

# ---- 2. JS parse check (split files, in load order, plus any inline remnant) ---
node -e '
const fs = require("fs");
let body = "";
for (const f of ["store.js", "app.js"]) {
  if (!fs.existsSync(f)) { console.error("BUILD FAILED: missing " + f); process.exit(1); }
  body += fs.readFileSync(f, "utf8") + "\n";
}
const html = fs.readFileSync("index.html", "utf8");
const m = html.match(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g) || [];
body += m.map(s => s.replace(/<\/?script[^>]*>/g, "")).join("\n");
try { new Function(body); console.log("OK  JS parse (store.js + app.js)"); }
catch (e) { console.error("BUILD FAILED: JS parse error: " + e.message); process.exit(1); }
'

# ---- 2b. Accessibility gates ---------------------------------------------------
# This app is used BY teachers who are themselves blind or low vision, at
# schools for the blind. Accessibility is not a polish pass here — it is the
# product working at all — so it is enforced by the build, not by memory.
#
#   a11y-contrast.js  computes real WCAG ratios for all four colour modes.
#   a11y-audit.js     boots every screen in jsdom, runs axe-core, then asserts
#                     the app-specific behaviours (screen-change focus, lang
#                     tags, inert modals, polite live regions).
#
# axe-core is a dev-only dependency and may be absent on a fresh clone — the
# contrast check has no dependencies and always runs; the axe sweep skips with
# a warning rather than blocking a build.
node scripts/a11y-contrast.js > /tmp/a11y-contrast.log 2>&1 \
  || { cat /tmp/a11y-contrast.log; fail "contrast check failed — see the pairs above"; }
echo "OK  contrast (all four colour modes)"

# a11y-nochange.js defends the DESIGN, not the accessibility: it asserts the
# rem tokens still compute to their old px values, and that no rule in the
# appended a11y block escapes its mode gate into the default look. The first
# draft of that block changed three things at 1x; this is why.
node scripts/a11y-nochange.js > /tmp/a11y-nochange.log 2>&1 \
  || { cat /tmp/a11y-nochange.log; fail "the a11y block is leaking into the default design"; }
echo "OK  default look unchanged (token parity + rule scoping)"

# a11y-flows.js drives the real FLOWS, not the resting states: picking a school
# injects the login fields, saving repaints and eats the confirmation, the batch
# flow swaps which child you are scoring. Every bug found in the pre-handover
# check on 2026-07-28 was of that kind, and every one passed the static audit.
node scripts/a11y-flows.js > /tmp/a11y-flows.log 2>&1 \
  || { cat /tmp/a11y-flows.log; fail "an accessibility FLOW is broken — see above"; }
echo "OK  screen-reader flows (sign in, save, batch scoring, dialogs)"

# a11y-smoke.js activates every non-destructive control on every screen. A
# thrown handler in this app is SILENT — the control just stops working, with
# nothing announced. A sighted teacher sees nothing happen and works around it;
# someone using a screen reader cannot tell that apart from having misheard
# which button they were on.
node scripts/a11y-smoke.js > /tmp/a11y-smoke.log 2>&1 \
  || { cat /tmp/a11y-smoke.log; fail "a control throws — see above"; }
echo "OK  smoke (every control on every screen, nothing throws)"

# a11y-runtime-theme.js checks the display modes actually TAKE EFFECT at
# runtime. a11y-contrast.js reads the values declared in styles.css; it passed
# 55/55 while dark mode rendered light-on-light at 1.02:1, because themeFor()
# was writing the light palette inline on <body> and inline beats an attribute
# selector on <html>. A stylesheet-reading test proves what the CSS says, not
# what the teacher sees.
node scripts/a11y-runtime-theme.js > /tmp/a11y-theme.log 2>&1 \
  || { cat /tmp/a11y-theme.log; fail "a display mode is not taking effect — see above"; }
echo "OK  display modes take effect at runtime (dark / high contrast)"

if node -e "require.resolve('axe-core')" >/dev/null 2>&1; then
  node scripts/a11y-audit.js > /tmp/a11y-audit.log 2>&1 \
    || { cat /tmp/a11y-audit.log; fail "accessibility audit failed — see above"; }
  echo "OK  accessibility audit (axe sweep + regression assertions)"
else
  echo "WARN  axe-core not installed — skipping the axe sweep."
  echo "      npm install --save-dev axe-core   to enable it."
fi

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
for f in index.html styles.css store.js app.js activities.js supabase.js; do
  [ -f "www/$f" ] || continue
  cmp -s "www/$f" "$pub/$f" || fail "built $f differs from www/ copy — sync did not land"
done
echo "OK  built assets match www/"

echo
echo "BUILD OK. If the emulator shows stale code anyway: cd android && ./gradlew clean installDebug"
