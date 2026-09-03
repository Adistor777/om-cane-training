#!/usr/bin/env bash
# gates.sh — every check that needs nothing but node. Run from anywhere:
#   bash scripts/gates.sh
#
# Split out of build.sh on 2026-09-01 so CI can run the SAME checks the build
# runs. build.sh calls this file; there is no second copy to drift.
# Everything after this in build.sh needs Capacitor and an Android SDK, which
# is why the split lands here and not further down.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "GATE FAILED: $*" >&2; exit 1; }

# Gate logs go in a private temp DIRECTORY, not fixed /tmp/<name>.log paths.
# Found 2026-09-02: run over the desktop bridge, the redirect to
# $GATE_LOGS/a11y-smoke.log failed with "Permission denied" (the file belonged to an
# earlier real-terminal run), so node never ran — and the failure branch then
# cat'd that stale log and reported a PREVIOUS DAY'S failure, complete with the
# previous day's activity names, as if it were this run. A gate that cannot
# write its own log must not be able to report someone else's result.
GATE_LOGS="$(mktemp -d "${TMPDIR:-/tmp}/om-gates.XXXXXX")"
trap 'rm -rf "$GATE_LOGS"' EXIT

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
node scripts/a11y-contrast.js > $GATE_LOGS/a11y-contrast.log 2>&1 \
  || { cat $GATE_LOGS/a11y-contrast.log; fail "contrast check failed — see the pairs above"; }
echo "OK  contrast (all four colour modes)"

# a11y-nochange.js defends the DESIGN, not the accessibility: it asserts the
# rem tokens still compute to their old px values, and that no rule in the
# appended a11y block escapes its mode gate into the default look. The first
# draft of that block changed three things at 1x; this is why.
node scripts/a11y-nochange.js > $GATE_LOGS/a11y-nochange.log 2>&1 \
  || { cat $GATE_LOGS/a11y-nochange.log; fail "the a11y block is leaking into the default design"; }
echo "OK  default look unchanged (token parity + rule scoping)"

# a11y-flows.js drives the real FLOWS, not the resting states: picking a school
# injects the login fields, saving repaints and eats the confirmation, the batch
# flow swaps which child you are scoring. Every bug found in the pre-handover
# check on 2026-07-28 was of that kind, and every one passed the static audit.
node scripts/a11y-flows.js > $GATE_LOGS/a11y-flows.log 2>&1 \
  || { cat $GATE_LOGS/a11y-flows.log; fail "an accessibility FLOW is broken — see above"; }
echo "OK  screen-reader flows (sign in, save, batch scoring, dialogs)"

# a11y-smoke.js activates every non-destructive control on every screen. A
# thrown handler in this app is SILENT — the control just stops working, with
# nothing announced. A sighted teacher sees nothing happen and works around it;
# someone using a screen reader cannot tell that apart from having misheard
# which button they were on.
node scripts/a11y-smoke.js > $GATE_LOGS/a11y-smoke.log 2>&1 \
  || { cat $GATE_LOGS/a11y-smoke.log; fail "a control throws — see above"; }
echo "OK  smoke (every control on every screen, nothing throws)"

# a11y-runtime-theme.js checks the display modes actually TAKE EFFECT at
# runtime. a11y-contrast.js reads the values declared in styles.css; it passed
# 55/55 while dark mode rendered light-on-light at 1.02:1, because themeFor()
# was writing the light palette inline on <body> and inline beats an attribute
# selector on <html>. A stylesheet-reading test proves what the CSS says, not
# what the teacher sees.
node scripts/a11y-runtime-theme.js > $GATE_LOGS/a11y-theme.log 2>&1 \
  || { cat $GATE_LOGS/a11y-theme.log; fail "a display mode is not taking effect — see above"; }
echo "OK  display modes take effect at runtime (dark / high contrast)"

if node -e "require.resolve('axe-core')" >/dev/null 2>&1; then
  node scripts/a11y-audit.js > $GATE_LOGS/a11y-audit.log 2>&1 \
    || { cat $GATE_LOGS/a11y-audit.log; fail "accessibility audit failed — see above"; }
  echo "OK  accessibility audit (axe sweep + regression assertions)"
else
  echo "WARN  axe-core not installed — skipping the axe sweep."
  echo "      npm install --save-dev axe-core   to enable it."
fi

# ---- 2c. Unit suite ------------------------------------------------------------
# 40 assertions over the storage seam, CSV export, the group seam and the record
# envelope. It was never wired into the build and so ran only when somebody
# remembered — the same failure mode the a11y gates were created to end.
node scripts/test-batch1.js > $GATE_LOGS/test-batch1.log 2>&1 \
  || { cat $GATE_LOGS/test-batch1.log; fail "unit suite failed — see above"; }
echo "OK  unit suite (scripts/test-batch1.js)"

echo
echo "GATES OK"
