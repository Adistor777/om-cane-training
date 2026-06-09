# O&M Cane Training — Teacher App (v0)

This is a small offline web app. A teacher picks an activity category,
reads the SOP (instructions), and records what the student did. All data
stays on this computer — nothing is uploaded.

There are only **3 files**:

| File | What it is | Do you edit it? |
|------|------------|-----------------|
| `index.html` | The app itself | Rarely (only to change look/behaviour) |
| `activities.js` | All the activities & instructions | **YES — this is your file** |
| `README.md` | This guide | No |

---

## How to run it on your laptop

You don't need to install anything. Two options:

### Option A — simplest (double-click)
1. Find the folder `om-app` on your computer.
2. Double-click `index.html`. It opens in your web browser. Done.

> Note: with this method, audio/video files (added later) may not play due
> to browser security. For v0 that's fine — there are no media files yet.

### Option B — recommended (a tiny local server, needed once you add audio/video)
If you have Python installed (most laptops do):

1. Open a terminal / command prompt.
2. Go into the folder:
   - Mac/Linux: `cd path/to/om-app`
   - Windows: `cd path\to\om-app`
3. Run: `python3 -m http.server 8000`  (or `python -m http.server 8000` on Windows)
4. Open your browser to: `http://localhost:8000`
5. To stop it: press `Ctrl + C` in the terminal.

---

## How to change activities (no coding)

Open `activities.js` in any text editor (Notepad, TextEdit, VS Code).
Everything is explained at the top of that file. The short version:

- **Change wording**: edit the text between the `"` quotes.
- **Add an activity**: copy an existing `{ ... }` block inside a category,
  paste it, put a comma after the previous one, change the words. Give it a
  new unique `id`.
- **Add a category**: copy a whole category block, paste it before the final
  `];`, change the words.
- **Save** the file, **refresh** the browser. Changes appear instantly.

Rules that keep it working:
- Keep the `"quotes"` around text.
- Keep the `,` commas between items.
- Give every activity a unique `id` (no spaces).

---

## What's a "slot" (audio / video)?

Each activity has an empty **audio slot** and **video slot**. Right now they
show a placeholder. Later:
- Generate SOP narration with Sarvam TTS, save the file (e.g. `sound_id_hi.mp3`)
  into this folder, and put that filename in the activity's `audioFile`.
- Same for a demo video in `videoFile`.
The app will then show a real player instead of the placeholder.

---

## Where does saved data go?

Into the browser's local storage **on this laptop only**. It is not sent
anywhere. If you clear your browser data, the records are erased. Proper
storage/export comes in a later version.
