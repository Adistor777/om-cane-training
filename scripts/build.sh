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

# ---- 3. Copy web assets to www/ ------------------------------------------------
# index.html always; the split files (styles.css, store.js, app.js) and
# activities.js whenever they exist at root.
for f in index.html styles.css store.js app.js activities.js; do
  [ -f "$f" ] && cp "$f" "www/$f" && echo "OK  copied $f -> www/"
done

# ---- 4. Capacitor sync ----------------------------------------------------------
npx cap sync android

# ---- 5. Verify built Android assets actually got the new code ------------------
pub="android/app/src/main/assets/public"
[ -d "$pub" ] || fail "built assets not found at $pub"
for f in index.html styles.css store.js app.js activities.js; do
  [ -f "www/$f" ] || continue
  cmp -s "www/$f" "$pub/$f" || fail "built $f differs from www/ copy — sync did not land"
done
echo "OK  built assets match www/"

echo
echo "BUILD OK. If the emulator shows stale code anyway: cd android && ./gradlew clean installDebug"
