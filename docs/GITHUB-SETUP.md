# GITHUB-SETUP.md — Putting the project on GitHub (private)

One-time setup to get the project off a single machine and into a private
GitHub repo. After this, saving a new version is three commands.

> **Why this matters:** right now the whole project is one copy on one Mac.
> A disk failure ends a months-long project. GitHub is the insurance.

**You'll do the auth/push yourself** (passwords/tokens are never something to
hand off). Each block is one thing you run or click; the **Check** line tells
you it worked before you move on.

**Account + git:** already in place (you confirmed both). We skip those.

---

## 0. What goes in the repo, and what doesn't

The repo holds **source only**. These are generated and must be excluded —
they regenerate from `npm install` + `npx cap sync`:

| Folder | Why excluded |
|--------|--------------|
| `node_modules/` | Re-created by `npm install` — huge, never committed |
| `android/` | Re-created by `npx cap add android` + `sync` |
| `www/` | Re-created by your `cp` build step |

**What the repo SHOULD contain:** `index.html`, `activities.js`,
`capacitor.config.json`, `package.json`, and the docs (`BUILD-ANDROID.md`,
`README.md`, `DESIGN_NOTES.md`, `MEMORY.md`, `TRACKER.md`, this file).

> Note `package-lock.json`: if you have one, commit it (it pins exact
> dependency versions — good). If you don't, no problem.

---

## 1. Go into the project folder

In Terminal:

```bash
cd ~/Desktop/om-app      # adjust to wherever om-app actually lives
ls
```

**Check:** you see `index.html`, `activities.js`, `capacitor.config.json`,
`package.json`. If you also see `android/`, `www/`, `node_modules/` — good,
those exist; the `.gitignore` in the next step keeps them out of the repo.

---

## 2. Create the `.gitignore` BEFORE anything else

This must exist before the first commit, or git will try to swallow all the
generated folders. Paste this whole block as one command — it writes the file:

```bash
cat > .gitignore << 'EOF'
# Generated — regenerate from npm install + npx cap sync
node_modules/
android/
www/

# macOS noise
.DS_Store

# Editor
.idea/
*.iml

# Logs / misc
*.log
EOF
```

**Check:**
```bash
cat .gitignore
```
Prints the list above. (`.idea/` is PyCharm's project metadata — no reason to
share it.)

---

## 3. Initialise the repo

```bash
git init
```

**Check:** prints something like `Initialized empty Git repository in
.../om-app/.git/`. (If it says "Reinitialized," that's fine too — a repo
already existed here.)

---

## 4. Stage everything (gitignore filters the junk)

```bash
git add .
```

Then — **the important verification** — see exactly what's about to be saved:

```bash
git status
```

**Check:** the green/"to be committed" list shows your source + docs and does
**NOT** list `node_modules/`, `android/`, or `www/`. If any of those three
DO appear, stop — the `.gitignore` didn't take. Tell me and we'll fix before
committing (committing them is annoying to undo).

---

## 5. Tell git who you are (only if it's never been set globally)

```bash
git config --global user.name "Your Name"
git config --global user.email "the-email-on-your-github@example.com"
```

Use the email tied to your GitHub account.

**Check:**
```bash
git config --global user.email
```
Prints that email back.

---

## 6. First commit

```bash
git commit -m "Initial commit: O&M Cane Training app (source + docs)"
```

**Check:** prints a summary like `XX files changed, NNNN insertions(+)`. You
now have a local snapshot — but it's still only on this Mac. The next steps
get it onto GitHub.

---

## 7. Create the private repo on GitHub (in the browser)

1. Go to **github.com**, log in.
2. Top-right **+** → **New repository**.
3. **Repository name:** `om-cane-training` (or your choice).
4. **Visibility: Private.** ← important — this is children's-disability-data
   context; default to private.
5. **Do NOT** tick "Add a README," ".gitignore," or "license." You already
   have these locally; adding them on GitHub creates a conflict on first push.
6. Click **Create repository.**

**Check:** GitHub shows an empty-repo page with setup instructions and a URL
like `https://github.com/yourname/om-cane-training.git`. Copy that URL.

---

## 8. Connect your local repo to GitHub

Paste the URL from step 7 in place of the placeholder:

```bash
git remote add origin https://github.com/yourname/om-cane-training.git
```

**Check:**
```bash
git remote -v
```
Prints the URL twice (a `fetch` and a `push` line).

---

## 9. Push — this is the auth moment

```bash
git branch -M main
git push -u origin main
```

**What happens on auth:** the first push over HTTPS will ask you to
authenticate. The modern way is a **Personal Access Token**, not your
password:

- If a browser window pops up offering to sign in / authorize — do that, it's
  the easiest path.
- If it asks in the terminal for a username and password: username is your
  GitHub username; for the **password, paste a Personal Access Token** (NOT
  your account password — GitHub disabled password auth for git in 2021).

To make a token: GitHub → your avatar → **Settings → Developer settings →
Personal access tokens → Tokens (classic) → Generate new token (classic)** →
tick the **`repo`** scope → generate → copy it. Paste it as the password.
(Copy it immediately; GitHub won't show it again.)

**Check:** the terminal shows the upload progress and ends with branch
tracking set up. Refresh the GitHub repo page — your files are there, and
`node_modules/`/`android/`/`www/` are NOT. **Done — the project is now backed
up off-machine.**

---

## Day-to-day after this (saving new versions)

Whenever you've made changes you want to snapshot:

```bash
git add .
git commit -m "Short description of what changed"
git push
```

That's it — three lines, and your work is safe on GitHub. Do it at the end of
any session where you changed something.

---

## If something goes wrong

- **`git push` says "support for password authentication was removed"** — you
  typed your account password. Use a Personal Access Token instead (step 9).
- **`node_modules/` etc. got committed anyway** — the `.gitignore` wasn't
  there before `git add`. Fix:
  `git rm -r --cached node_modules android www` then commit again. Tell me if
  you're unsure.
- **"failed to push some refs" / rejected** — you probably ticked
  "Add a README" on GitHub in step 7. Easiest fix:
  `git pull --rebase origin main` then `git push` again.
- **Anything else** — copy the exact error text to me.
