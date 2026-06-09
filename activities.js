/* =============================================================================
   ACTIVITIES.JS  —  THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE CONTENT
   =============================================================================

   Everything the teacher sees — the 7 categories, the activities inside them,
   the instructions (SOP), and what data gets collected — lives in THIS file.

   You do NOT need to know how to code to edit this. Just follow the patterns
   below. The rules:

     • Keep the quotes "  " around text.
     • Keep the commas , at the end of each line (they separate items).
     • To ADD an activity, copy an existing { ... } block and change the words.
     • To ADD a category, copy an existing category block at the bottom.
     • Save the file, refresh the app in your browser, done.

   ---------------------------------------------------------------------------
   WHAT EACH FIELD MEANS (read once, then you'll just copy patterns):
   ---------------------------------------------------------------------------
   id            A short unique code. No spaces. Used internally. Make it unique.
   name          The title the teacher sees.
   withCane      true or false  — is this the "with cane" version of the skill?
                 (Your board shows most skills run without-cane then with-cane.)
   sop           The step-by-step instructions (the SOP). Each line in the list
                 is one step. Add or remove lines freely.
   facilitatorNote  Optional grey-box reminder (e.g. "stand 3 steps away").
                 Leave as "" (empty) if there isn't one.
   audioFile     Optional. Filename of a pre-made audio narration of the SOP
                 (e.g. "sound_id_hindi.mp3"). Leave "" for now — we add audio
                 in v1 using Sarvam. The slot is already here, ready.
   videoFile     Optional. Filename of a demo video. Leave "" if none yet.
   dataFields    What the teacher records after running the activity. Each field
                 has a "type":
                    "count"     → a number box (e.g. number of steps)
                    "result"    → Independent / Prompted / Unable buttons
                    "checkbox"  → a yes/no tick
                    "notes"     → a free text box
                 Copy/remove these to change what's collected.
   ============================================================================= */

const ACTIVITY_DATA = [

  /* ===== CATEGORY 1 ============================================ */
  {
    category: "Direction",
    description: "Left-Right and Front-Back orientation.",
    activities: [
      {
        id: "dir-leftright",
        name: "Left-Right (Rhyme)",
        withCane: false,
        sop: [
          "Sit or stand facing the child.",
          "Use the rhyme to cue left and right.",
          "Ask: \"On which shoulder is my hand?\" — Left or Right?",
          "Repeat, varying which shoulder you touch."
        ],
        facilitatorNote: "",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "correct", label: "Correct responses", type: "count" },
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      },
      {
        id: "dir-frontback",
        name: "Front-Back",
        withCane: true,
        sop: [
          "Stand facing the child.",
          "Cue 'front' and 'back' positions.",
          "Ask the child to identify front vs back."
        ],
        facilitatorNote: "",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "correct", label: "Correct responses", type: "count" },
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 2 ============================================ */
  {
    category: "Sound",
    description: "Sound identification and localization (Left-Right, Front-Back, Top, Bottom).",
    activities: [
      {
        id: "sound-which",
        name: "Which Sound? (Identification)",
        withCane: true,
        sop: [
          "Play a sound from the speaker.",
          "Ask the child: \"Which sound is this?\"",
          "Confirm identification before moving on."
        ],
        facilitatorNote: "Keep 3 steps away from the child when playing sounds on the speaker. When recording video, angle it to focus on both the child and the facilitators.",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "correct", label: "Correct identifications", type: "count" },
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      },
      {
        id: "sound-source",
        name: "Source of Sound? (Localization)",
        withCane: false,
        sop: [
          "Play a sound from a fixed position.",
          "Ask the child to point to the source.",
          "Test Left-Right, Front-Back, Top, and Bottom positions."
        ],
        facilitatorNote: "Keep 3 steps away from the child when playing sounds on the speaker.",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "correct", label: "Correct localizations", type: "count" },
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 3 ============================================ */
  {
    category: "Sound + Direction",
    description: "Near/Far of sound, simple to narrative, and the same concept repeated with the cane (comparative step count).",
    activities: [
      {
        id: "snddir-clap",
        name: "Clapping Activity",
        withCane: true,
        sop: [
          "Facilitator claps from a position.",
          "Child identifies near vs far and direction.",
          "Progress from simple cues to a short narrative."
        ],
        facilitatorNote: "",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      },
      {
        id: "snddir-cane-count",
        name: "Touch Sound with Cane & Count Steps",
        withCane: true,
        sop: [
          "Place a sound source out of arm's reach.",
          "Child uses the cane to travel toward it.",
          "Count the number of steps taken.",
          "Compare with the without-cane version of this task."
        ],
        facilitatorNote: "This is the comparative (with-cane) version. Record step count to compare against the without-cane attempt.",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "steps", label: "Number of steps", type: "count" },
          { id: "reached", label: "Reached the source", type: "checkbox" },
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 4 ============================================ */
  {
    category: "Straight Line Travel",
    description: "Travel toward a sound, without cane then with cane (with push toy). Artificial or human sound (facilitator or friend's bhopu).",
    activities: [
      {
        id: "slt-nocane",
        name: "Straight Line Travel — Without Cane",
        withCane: false,
        sop: [
          "Place a sound source straight ahead.",
          "Child walks toward it in a straight line.",
          "Count the number of steps."
        ],
        facilitatorNote: "",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "steps", label: "Number of steps", type: "count" },
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      },
      {
        id: "slt-withcane",
        name: "Straight Line Travel — With Cane (Push Toy)",
        withCane: true,
        sop: [
          "Child travels the same path using the cane with a push toy.",
          "Maintain a straight line toward the sound source.",
          "Count steps and compare with the without-cane attempt."
        ],
        facilitatorNote: "",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "steps", label: "Number of steps", type: "count" },
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 5 ============================================ */
  {
    category: "Push Toy",
    description: "Race on a path with a push toy, referenced on a mat.",
    activities: [
      {
        id: "push-race",
        name: "Race on a Path with Push Toy",
        withCane: true,
        sop: [
          "Set up a path on the mat.",
          "Ask the child: \"Which pet do you want? Who would you meet?\" to motivate.",
          "Child pushes the toy along the path."
        ],
        facilitatorNote: "",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "completed", label: "Completed the path", type: "checkbox" },
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 6 ============================================ */
  {
    category: "Terrain Game",
    description: "Terrain introduction (without then with cane), border reference, arc movement, trial run, find run, picking obstacles.",
    activities: [
      {
        id: "terrain-intro",
        name: "Terrain Introduction",
        withCane: false,
        sop: [
          "Introduce the different mats/terrains while the child wears footwear.",
          "Let the child feel how the surface changes (tactile and sound).",
          "Then repeat the introduction with the cane."
        ],
        facilitatorNote: "",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      },
      {
        id: "terrain-obstacle",
        name: "Find & Pick Obstacle (Trial Run)",
        withCane: true,
        sop: [
          "Place an obstacle (e.g. toffee) on each mat; one mat has none.",
          "Child uses border reference and arc movement to navigate.",
          "Child finds and picks up the obstacle on each mat."
        ],
        facilitatorNote: "Placing each obstacle on each kind of mat, all of them have toffee except the last one.",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "found", label: "Obstacles found", type: "count" },
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 7 ============================================ */
  {
    category: "Other Activities",
    description: "Central-sound gathering and gift-following games.",
    activities: [
      {
        id: "other-central-sound",
        name: "Come to the Central Sound",
        withCane: false,
        sop: [
          "Facilitator stands at a central point making a sound.",
          "Children come toward the central sound from different directions."
        ],
        facilitatorNote: "",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      },
      {
        id: "other-gift-follow",
        name: "Follow Directions for Gifts",
        withCane: false,
        sop: [
          "Place gifts in different directions.",
          "Child follows directional cues to collect each gift."
        ],
        facilitatorNote: "",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "collected", label: "Gifts collected", type: "count" },
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      }
    ]
  }

  /* ===== TO ADD A NEW CATEGORY =================================
     Copy one whole block above (from { category: ... } to its closing } ),
     paste it here, put a comma before it, and change the words.
     ============================================================ */

];
