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

  /* ===== CATEGORY 1 ============================================
     Direction — two levels, matching how O&M actually teaches this:
     children master directions on their OWN BODY first (left/right/
     forward/backward — "egocentric" concepts), and only then fixed
     COMPASS directions that don't move when the body turns (cardinal
     concepts — the advanced stage in curricula like TAPS).

     Both activities show a COMMAND BOARD: big buttons that SPEAK the
     command aloud in clear Indian English (Sarvam-generated audio), so
     every child hears the exact same cue every time. To change the
     commands, edit the `commands` list below — same no-code rules as
     everything else:
       id     short unique code, no spaces (also the audio filename:
              audio/commands/{id}_en.mp3 — regenerate audio after
              adding one: node scripts/generate-command-audio.js)
       label  the button text AND what the app says. To make the app
              say something different from the label, add
              speak: "..." on that line.
     (SOP narration is the multilingual part — see sopTranslations
      below each activity, spoken by generate-audio.js.)
     ============================================================== */
  {
    category: "Direction",
    description: "Following spoken direction commands — body directions first, compass directions after.",
    // Category-level ? sheet (shown on the Basic/Advanced list screen).
    // `help` = short guidance lines; `helpVideo` = optional demo filename.
    // Any category can have these — copy the pattern.
    help: [
      "Start with Basic — body directions (left, right, forward…) the child hears and moves to.",
      "Move to Advanced — compass directions — once Basic is solid.",
      "Both levels speak the commands aloud. Open an activity for the full steps and the demo."
    ],
    helpVideo: "demo-direction-basic.mp4",
    activities: [
      {
        id: "dir-basic-commands",
        name: "Basic",
        withCane: false,
        commandBoard: true,
        commands: [
          { id: "left",       label: "Left" },
          { id: "right",      label: "Right" },
          { id: "forward",    label: "Forward" },
          { id: "backward",   label: "Backward" },
          { id: "jump",       label: "Jump" },
          { id: "clap",       label: "Clap" },
          { id: "stop",       label: "Stop" },
          { id: "turnaround", label: "Turn around" }
        ],
        sop: [
          "Stand the children in a line facing you, an arm's length apart.",
          "Warm up with the direction rhyme.",
          "Tap a command — one at a time. Wait for everyone to finish the move.",
          "Once they're settled, mix the order — use Surprise me."
        ],
        facilitatorNote: "Group drill (see the demo video), but score ONE child per session. Start in a fixed order — left, right, forward, backward — before mixing. Keep cues crisp with a clear pause after each: a child following the rhythm is not yet following the direction. Watch for first-cue responses; that's what 'Got it' means.",
        // DRAFT translation (machine-drafted 2026-07-13) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1
        // with `sop` above, as required by generate-audio.js.
        sopTranslations: {
          hi: [
            "बच्चों को एक हाथ की दूरी पर, आपकी ओर मुँह करके एक पंक्ति में खड़ा करें।",
            "दिशा वाली कविता से वार्म-अप करें।",
            "एक कमांड दबाएँ — एक बार में एक। सबके मूवमेंट पूरा करने की प्रतीक्षा करें।",
            "जब बच्चे सहज हो जाएँ तो क्रम बदलें — Surprise me का उपयोग करें।"
          ]
        },
        audioFile: "",
        videoFile: "demo-direction-basic.mp4",
        dataFields: [
          { id: "result", label: "Did the child get it?", type: "mastery" },
          { id: "notes",  label: "Teacher's notes",       type: "teacherNotes" }
        ]
      },
      {
        id: "dir-advanced-commands",
        name: "Advanced",
        withCane: false,
        commandBoard: true,
        commands: [
          { id: "north", label: "North" },
          { id: "south", label: "South" },
          { id: "east",  label: "East" },
          { id: "west",  label: "West" }
          // Intercardinals when the child is ready — copy a line, e.g.:
          // { id: "northeast", label: "North-East" },
        ],
        sop: [
          "Agree with the child where North is — pick a landmark they can touch or hear.",
          "The child starts facing North.",
          "Tap a compass command — the child turns to face it.",
          "Turn the child to a new position and repeat."
        ],
        facilitatorNote: "The concept under test: compass directions stay with the ROOM, not the body. A child answering by rote from the start position hasn't got it yet. Re-anchor with the landmark (the door, the window with traffic sounds, the warmth of the sun) whenever they're lost — and note whether they re-anchor by themselves after being turned.",
        // DRAFT translation (machine-drafted 2026-07-13) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1.
        sopTranslations: {
          hi: [
            "बच्चे के साथ तय करें कि उत्तर किधर है — कोई ऐसा लैंडमार्क चुनें जिसे वह छू या सुन सके।",
            "बच्चा उत्तर की ओर मुँह करके शुरू करे।",
            "कोई कंपास कमांड दबाएँ — बच्चा उस दिशा की ओर मुड़े।",
            "बच्चे को नई स्थिति में घुमाएँ और दोहराएँ।"
          ]
        },
        audioFile: "",
        // Same drill format as Basic — reusing its demo until a cardinal-
        // specific video arrives; just swap the filename then.
        videoFile: "demo-direction-basic.mp4",
        dataFields: [
          { id: "result", label: "Did the child get it?", type: "mastery" },
          { id: "notes",  label: "Teacher's notes",       type: "teacherNotes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 2 ============================================ */
  {
    category: "Sound",
    description: "Sound identification and localization (Left-Right, Front-Back, Top, Bottom).",
    /* DRAFT help — content team to verify wording (added 2026-07-21: this was
       a pilot category without `help`, so its screen had no ?). */
    help: [
      "Start with Which Sound? — the child names each sound you play from the app's sound library.",
      "Move to Source of Sound? — the child points to where the sound comes from: left-right, front-back, top and bottom.",
      "Stand about 3 steps from the child when playing sounds. Open an activity for the full steps and the demo."
    ],
    helpVideo: "demo-sound.mp4",
    activities: [
      {
        id: "sound-which",
        name: "Which Sound? (Identification)",
        withCane: false,
        soundboard: true,
        sop: [
          "Play a sound from the speaker.",
          "Ask the child: \"Which sound is this?\"",
          "Confirm identification before moving on."
        ],
        facilitatorNote: "Keep 3 steps away from the child when playing sounds on the speaker. When recording video, angle it to focus on both the child and the facilitators.",
        audioFile: "",
        videoFile: "demo-sound.mp4",
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
        soundboard: true,
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
    description: "Judging sound distance — near or far — by ear, then with the cane, then counting steps as a group and one child at a time.",
    /* Restructured 2026-07-13 from the four SOP demo videos (#2). Old ids
       snddir-clap / snddir-cane-count retired — pre-pilot, orphaned test
       records accepted knowingly (same call as the Direction restructure).
       GROUP NOTE: `group: true` below marks a whole-group activity — the app
       skips the child picker and saves ONE result for the group. Copy that
       line onto any activity that is scored as a group, delete it for
       per-child scoring. */
    help: [
      "Start with Near-Far — the child judges sound distance by ear alone.",
      "Repeat with the cane — the child points to the sound and touches it.",
      "Counting Steps: run the Group drill first (one shared result — no child is selected), then score each child in Individual."
    ],
    helpVideo: "demo-snddir-nearfar.mp4",
    activities: [
      {
        id: "snddir-nearfar",
        name: "Near-Far",
        withCane: false,
        soundboard: true,
        sop: [
          "Stand the child in open space, facing you.",
          "Play a sound close to the child and ask — near or far?",
          "Move a few steps away and play the same sound again.",
          "Mix near and far in a random order."
        ],
        facilitatorNote: "Keep the SAME sound all round — the child is judging distance, not identity. Leave a clear silence between plays. A child who turns toward the sound before answering is using their ears, not guessing. Score first answers.",
        // DRAFT translation (machine-drafted 2026-07-13) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1.
        sopTranslations: {
          hi: [
            "बच्चे को खुली जगह में, अपनी ओर मुँह करके खड़ा करें।",
            "बच्चे के पास आवाज़ बजाएँ और पूछें — पास या दूर?",
            "कुछ कदम दूर जाकर वही आवाज़ फिर बजाएँ।",
            "पास और दूर को बिना क्रम के मिलाकर दोहराएँ।"
          ]
        },
        audioFile: "",
        videoFile: "demo-snddir-nearfar.mp4",
        dataFields: [
          { id: "result", label: "Did the child get it?", type: "mastery" },
          { id: "notes",  label: "Teacher's notes",       type: "teacherNotes" }
        ]
      },
      {
        id: "snddir-nearfar-cane",
        name: "Near-Far with Cane",
        withCane: true,
        soundboard: true,
        sop: [
          "Give the child their cane and stand them in open space.",
          "Play a sound — the child says near or far.",
          "The child points to the sound with the cane.",
          "If it is within reach, the child touches the source with the cane tip."
        ],
        facilitatorNote: "The cane is the pointer. Watch whether the child orients the tip BEFORE answering or only after — that order tells you if the ears are leading. A right answer with a wrong touch is 'With help', not 'Got it'.",
        // DRAFT translation (machine-drafted 2026-07-13) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1.
        sopTranslations: {
          hi: [
            "बच्चे को उसकी छड़ी दें और खुली जगह में खड़ा करें।",
            "आवाज़ बजाएँ — बच्चा बताए, पास या दूर।",
            "बच्चा छड़ी से आवाज़ की ओर इशारा करे।",
            "अगर आवाज़ पहुँच में हो, तो बच्चा छड़ी की नोक से स्रोत को छुए।"
          ]
        },
        audioFile: "",
        videoFile: "demo-snddir-nearfar-cane.mp4",
        dataFields: [
          { id: "result", label: "Did the child get it?", type: "mastery" },
          { id: "notes",  label: "Teacher's notes",       type: "teacherNotes" }
        ]
      },
      {
        id: "snddir-steps-group",
        name: "Counting Steps — Group",
        withCane: false,
        group: true,
        sop: [
          "Stand the children scattered around the room and settle it to quiet.",
          "One child calls another child's name.",
          "The called child points to the voice and estimates how many steps away it is.",
          "Keep going until every child's name has been called."
        ],
        facilitatorNote: "Whole-group drill — the app saves ONE result for the group; no child is selected. The voice IS the sound source, so keep the room silent between calls. Watch the order: pointing first, estimate second means the ears are leading. Note who estimates confidently and who guesses — those are the children to follow up in the Individual drill.",
        // DRAFT translation (machine-drafted 2026-07-13) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1.
        sopTranslations: {
          hi: [
            "बच्चों को कमरे में अलग-अलग जगह खड़ा करें और शांति करवाएँ।",
            "एक बच्चा दूसरे बच्चे का नाम पुकारे।",
            "जिसका नाम पुकारा गया, वह आवाज़ की ओर इशारा करे और बताए कि वह कितने कदम दूर है।",
            "तब तक जारी रखें जब तक हर बच्चे का नाम न पुकारा जाए।"
          ]
        },
        audioFile: "",
        videoFile: "demo-snddir-steps-group.mp4",
        dataFields: [
          { id: "result", label: "Did the group get it?", type: "mastery" },
          { id: "notes",  label: "Teacher's notes",       type: "teacherNotes" }
        ]
      },
      {
        id: "snddir-steps-solo",
        name: "Counting Steps — Individual",
        withCane: false,
        sop: [
          "Stand the child in open space; you stand some steps away.",
          "Call the child's name once.",
          "The child points to your voice and estimates how many steps away you are.",
          "The child walks to you counting aloud — compare the count with the estimate."
        ],
        facilitatorNote: "The gap between estimate and actual count IS the data — record both numbers every round. Move to a new spot each time and mix near with far. Even steps, no rushing; a shrinking gap across sessions is the progress you're looking for.",
        // DRAFT translation (machine-drafted 2026-07-13) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1.
        sopTranslations: {
          hi: [
            "बच्चे को खुली जगह में खड़ा करें; आप कुछ कदम दूर खड़े हों।",
            "बच्चे का नाम एक बार पुकारें।",
            "बच्चा आपकी आवाज़ की ओर इशारा करे और बताए कि आप कितने कदम दूर हैं।",
            "बच्चा ज़ोर से गिनते हुए आप तक चले — गिनती की तुलना अनुमान से करें।"
          ]
        },
        audioFile: "",
        videoFile: "demo-snddir-steps-solo.mp4",
        dataFields: [
          { id: "estimate", label: "Estimated steps",       type: "count" },
          { id: "steps",    label: "Actual steps counted",  type: "count" },
          { id: "result",   label: "Did the child get it?", type: "mastery" },
          { id: "notes",    label: "Teacher's notes",       type: "teacherNotes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 4 ============================================
     Straight Line Travel — three stages, matching how the skill is
     actually built up. The child travels toward a sound played on the
     APP (soundboard, same as the Sound activities), holding a straight
     line the whole way:

       1. Without Cane         — by ear alone (baseline).
       2. With Cane + Push Toy — a toy is attached to the cane, with a
                                 little story, so the child WANTS to hold
                                 it. This is deliberate: it breaks the
                                 stigma around the cane and builds a
                                 positive association before it is "a cane".
       3. With Cane            — the toy comes off; the same travel, now
                                 independent. The scaffold is faded.

     The data to watch across the three stages: STEPS (efficiency) and
     TIMES DRIFTED OFF LINE (straightness) should both shrink stage to
     stage as the association carries over into real cane use. */
  {
    category: "Straight Line Travel",
    description: "Travel in a straight line toward a sound played on the app — first by ear, then with the cane and a push toy for a positive start, then with the cane alone.",
    help: [
      "Start Without Cane — the child walks to the sound by ear. This is the baseline.",
      "Add the cane With Push Toy — the toy and its story make the cane fun and familiar; the child pushes it straight to the sound.",
      "Finish With Cane once the toy comes off — the same straight-line travel, now independent. Steps and drifts should shrink stage to stage."
    ],
    helpVideo: "demo-slt-nocane.mp4",
    activities: [
      {
        id: "slt-nocane",
        name: "Straight Line Travel — Without Cane",
        withCane: false,
        soundboard: true,
        sop: [
          "Place the device straight ahead and play a sound from the app.",
          "Stand the child at the start line, facing the sound — no cane.",
          "The child walks to the sound in a straight line; count the steps.",
          "The child stops on reaching the sound."
        ],
        facilitatorNote: "Straightness is the skill, not just arrival — a child who reaches the sound but wanders there hasn't got it yet. Keep the SAME sound playing so the ears have a steady target, and keep the path clear. Steer drifts with a light touch — don't turn the child — and log every correction. Fewer drifts and fewer steps across sessions is the progress.",
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1
        // with `sop` above, as required by generate-audio.js.
        sopTranslations: {
          hi: [
            "डिवाइस को सीधे सामने रखें और ऐप से एक आवाज़ बजाएँ।",
            "बच्चे को शुरुआती रेखा पर, आवाज़ की ओर मुँह करके खड़ा करें — बिना छड़ी।",
            "बच्चा सीधी रेखा में आवाज़ तक चले; कदम गिनें।",
            "आवाज़ तक पहुँचने पर बच्चा रुक जाए।"
          ]
        },
        audioFile: "",
        videoFile: "demo-slt-nocane.mp4",
        dataFields: [
          { id: "steps",  label: "Number of steps",        type: "count" },
          { id: "veer",   label: "Times drifted off line", type: "count" },
          { id: "result", label: "Did the child get it?",  type: "mastery" },
          { id: "notes",  label: "Teacher's notes",        type: "teacherNotes" }
        ]
      },
      {
        id: "slt-withcane-toy",
        name: "Straight Line Travel — With Cane + Push Toy",
        withCane: true,
        soundboard: true,
        sop: [
          "Attach the push toy to the cane and introduce it — give it a name and a little story.",
          "Place the device straight ahead and play a sound from the app.",
          "The child pushes the toy along the floor, straight toward the sound; count the steps.",
          "The child stops when the toy reaches the sound."
        ],
        facilitatorNote: "The toy is the whole point — it turns the cane into something the child wants to hold, so lean into the story ('roll the puppy to the sound'). Keep the toy on the floor and tracking a straight line, with the same sound playing throughout. Following the story but wandering off line is 'With help', not 'Got it'. This stage builds the bond with the cane; the next stage tests it without the toy.",
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1.
        sopTranslations: {
          hi: [
            "छड़ी में पुश-टॉय लगाएँ और उसका परिचय दें — उसे एक नाम और छोटी सी कहानी दें।",
            "डिवाइस को सीधे सामने रखें और ऐप से एक आवाज़ बजाएँ।",
            "बच्चा टॉय को फर्श पर धकेलते हुए सीधे आवाज़ की ओर ले जाए; कदम गिनें।",
            "टॉय के आवाज़ तक पहुँचने पर बच्चा रुक जाए।"
          ]
        },
        audioFile: "",
        videoFile: "demo-slt-withcane-toy.mp4",
        dataFields: [
          { id: "steps",  label: "Number of steps",        type: "count" },
          { id: "veer",   label: "Times drifted off line", type: "count" },
          { id: "result", label: "Did the child get it?",  type: "mastery" },
          { id: "notes",  label: "Teacher's notes",        type: "teacherNotes" }
        ]
      },
      {
        id: "slt-withcane",
        name: "Straight Line Travel — With Cane",
        withCane: true,
        soundboard: true,
        sop: [
          "Take the toy off — the child travels with the cane alone now.",
          "Place the device straight ahead and play a sound from the app.",
          "The child walks to the sound in a straight line, cane tip in steady floor contact; count the steps.",
          "The child stops on reaching the sound; compare with the push-toy run."
        ],
        facilitatorNote: "The goal state — the same straight-line travel, toy gone. A little slip-back is normal when the scaffold first comes off. Keep the cane in steady floor contact; a lifted or waving cane is a drift waiting to happen. Same sound playing throughout. Fewer drifts than the push-toy run means the positive association has carried over into real cane use.",
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1.
        // No toy-faded demo filmed yet — wire the filename once it exists.
        sopTranslations: {
          hi: [
            "टॉय हटा दें — अब बच्चा सिर्फ़ छड़ी के साथ चले।",
            "डिवाइस को सीधे सामने रखें और ऐप से एक आवाज़ बजाएँ।",
            "बच्चा सीधी रेखा में आवाज़ तक चले, छड़ी की नोक फर्श पर टिकी रहे; कदम गिनें।",
            "आवाज़ तक पहुँचने पर बच्चा रुके; पुश-टॉय वाली बारी से तुलना करें।"
          ]
        },
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "steps",  label: "Number of steps",        type: "count" },
          { id: "veer",   label: "Times drifted off line", type: "count" },
          { id: "result", label: "Did the child get it?",  type: "mastery" },
          { id: "notes",  label: "Teacher's notes",        type: "teacherNotes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 5 ============================================
     (Push Toy category removed 2026-07-14 — the push toy is now a
     stage inside Straight Line Travel, Category 4: slt-withcane-toy.
     Old id `push-race` retired; pre-pilot orphan records accepted.)
     ============================================================== */
  /* ===== Terrain Game — three stages ============================
     Rebuilt 2026-07-14 from field videos + the course photo. The
     course is a LANE of contrasting floor textures laid end to end
     (e.g. yoga mat → grass mat → tactile paving → doormat), with
     small red discs as pick-up obstacles for stage 3:

       1. Introduction      — the child learns each surface: feet
                              first (with footwear), then the cane.
       2. Walk the Course   — the child travels the whole lane with
                              the cane, naming each surface change.
       3. Find the Obstacle — a red disc on every mat but one; the
                              child sweeps, finds, and picks each up.

     The category-level ? sheet teaches the TEACHER how to build the
     course (help lines + setup video + room photo). The data to
     watch across stages: SURFACES NAMED (recognition) rising, and
     TIMES HESITATED (confidence at transitions) falling. */
  {
    category: "Terrain Game",
    description: "A lane of changing floor textures — the child learns each surface, walks the course with the cane, then hunts obstacles across it.",
    help: [
      "Build a straight lane of 4–5 contrasting textures laid end to end — e.g. yoga mat → grass mat → tactile paving → doormat. Any mats you have work; what matters is that each one feels and sounds different underfoot.",
      "Leave no gaps between mats — every step should land on a texture, and each border is a 'surface change' the child learns to catch.",
      "Keep small red discs (or toffees) handy — they become the obstacles in stage 3.",
      "Run the stages in order: Introduction → Walk the Course → Find the Obstacle. Two lanes side by side let two children run without waiting."
    ],
    helpVideo: "demo-terrain-setup.mp4",
    helpImage: "help-terrain-setup.jpg",
    activities: [
      {
        id: "terrain-intro",
        name: "Terrain — Introduction",
        withCane: false,
        sop: [
          "Walk the child over the lane with footwear on, one mat at a time.",
          "On each mat, let the child stop and feel it — underfoot and by its sound — and say its name.",
          "Repeat the lane with the cane: the tip touches each new surface first.",
          "Ask the child to name each surface as they reach it."
        ],
        facilitatorNote: "Feet first, cane second — the order is deliberate: the child's own soles learn the textures, then the cane becomes an extension of them. Give each surface a short, consistent name ('grass', 'bumpy', 'lines') and keep the same names in every session — the names are what the later stages score. No hurry here; this stage is exploration, not travel.",
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1
        // with `sop` above, as required by generate-audio.js.
        sopTranslations: {
          hi: [
            "बच्चे को जूते पहनाकर लेन पर चलाएँ — एक बार में एक मैट।",
            "हर मैट पर बच्चे को रुकने दें और उसे महसूस करने दें — पैरों से और उसकी आवाज़ से — और उसका नाम बोलने दें।",
            "अब छड़ी के साथ लेन दोहराएँ: छड़ी की नोक हर नई सतह को पहले छुए।",
            "हर सतह पर पहुँचने पर बच्चे से उसका नाम पूछें।"
          ]
        },
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "surfaces", label: "Surfaces named correctly", type: "count" },
          { id: "result",   label: "Did the child get it?",    type: "mastery" },
          { id: "notes",    label: "Teacher's notes",          type: "teacherNotes" }
        ]
      },
      {
        id: "terrain-walk",
        name: "Terrain — Walk the Course",
        withCane: true,
        sop: [
          "Stand the child at the start of the lane, cane tip on the first mat.",
          "The child walks the full lane, keeping the cane in contact with the floor.",
          "At every surface change the child stops and names the new surface.",
          "Count the surfaces named correctly, and every hesitation or stall."
        ],
        facilitatorNote: "The skill is the cane announcing the change BEFORE the feet arrive — watch for the tip catching a border and the child reading it. Walk alongside with a light touch; steer, don't turn. A hesitation at a transition is information, not failure — log it and let the child work it out. Fewer hesitations across sessions is the progress line.",
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated.
        sopTranslations: {
          hi: [
            "बच्चे को लेन की शुरुआत पर खड़ा करें, छड़ी की नोक पहले मैट पर।",
            "बच्चा पूरी लेन चले, छड़ी फ़र्श से लगी रहे।",
            "हर सतह बदलने पर बच्चा रुककर नई सतह का नाम बोले।",
            "सही नाम बताई गई सतहें गिनें, और हर झिझक या रुकावट भी।"
          ]
        },
        audioFile: "",
        videoFile: "demo-terrain-walk.mp4",
        dataFields: [
          { id: "surfaces", label: "Surfaces named correctly",  type: "count" },
          { id: "hesit",    label: "Times hesitated / stopped", type: "count" },
          { id: "result",   label: "Did the child get it?",     type: "mastery" },
          { id: "notes",    label: "Teacher's notes",           type: "teacherNotes" }
        ]
      },
      {
        id: "terrain-obstacle",
        name: "Terrain — Find the Obstacle",
        withCane: true,
        sop: [
          "Place a red disc on every mat except one — don't say which one is empty.",
          "The child walks the lane, sweeping the cane in an arc from border to border.",
          "On finding a disc, the child picks it up and carries on.",
          "Count the discs found; check the child searches the empty mat fully too."
        ],
        facilitatorNote: "Border reference and the arc sweep are what this stage trains — the disc is just the reason to sweep well. The empty mat is the honest test: a child who searches it end to end and moves on has the technique; one who declares it empty after one poke doesn't. A toffee under (or instead of) a disc keeps the hunt worth winning.",
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated.
        sopTranslations: {
          hi: [
            "एक को छोड़कर हर मैट पर एक लाल डिस्क रखें — यह न बताएँ कि कौन-सा खाली है।",
            "बच्चा लेन पर चले, छड़ी को किनारे से किनारे तक अर्ध-गोले में घुमाते हुए।",
            "डिस्क मिलने पर बच्चा उसे उठाए और आगे बढ़े।",
            "मिली डिस्कें गिनें; देखें कि बच्चा खाली मैट को भी पूरा टटोलता है।"
          ]
        },
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "found",  label: "Obstacles found",          type: "count" },
          { id: "result", label: "Did the child get it?",    type: "mastery" },
          { id: "notes",  label: "Teacher's notes",          type: "teacherNotes" }
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
      },

      /* -----------------------------------------------------------------------
         SOP TRANSLATIONS — how multi-language SOP audio works.

         The `sop` array below is the ENGLISH text shown on screen (unchanged
         from every other activity). To give an activity spoken audio in another
         language, add an OPTIONAL `sopTranslations` object. Inside it, each
         language code holds an array that MUST line up step-for-step with `sop`:
         hi[0] is the translation of sop[0], hi[1] of sop[1], and so on — same
         number of lines, same order.

         Language codes used here: hi = Hindi, ta = Tamil, bn = Bengali.

         The audio generator (generate-audio.js) reads sopTranslations[lang] and
         speaks THAT text. If a language is missing for an activity, that
         language simply has no audio yet — nothing breaks. The on-screen English
         is never affected by any of this.

         This entry is a placeholder test using a sample assessment SOP. When the
         content team delivers real per-activity translations, they attach a
         `sopTranslations` block to the real activities above the same way.
         --------------------------------------------------------------------- */
      {
        id: "assess-procedure",
        name: "Conduct an O&M Assessment (procedure)",
        withCane: false,
        sop: [
          "Ensure the child is comfortable and the assessment space is free of hazards.",
          "Confirm the child's profile and consent details are recorded in the app.",
          "Check that the device is charged and audio output is working.",
          "Open the child's profile and select \"Start New Assessment.\"",
          "Read each instruction aloud clearly and allow the child enough time to respond.",
          "Observe the child's movement, orientation, and use of mobility aids.",
          "Record each response in the app immediately; do not rely on memory.",
          "Pause the assessment if the child shows distress or fatigue.",
          "Review all recorded responses for completeness.",
          "Save and submit the assessment in the app.",
          "Share the summary with the caregiver and discuss next steps."
        ],
        sopTranslations: {
          hi: [
            "सुनिश्चित करें कि बच्चा सहज है और मूल्यांकन स्थान खतरों से मुक्त है।",
            "पुष्टि करें कि बच्चे की प्रोफ़ाइल और सहमति विवरण ऐप में दर्ज हैं।",
            "जाँच लें कि डिवाइस चार्ज है और ऑडियो आउटपुट काम कर रहा है।",
            "बच्चे की प्रोफ़ाइल खोलें और \"नया मूल्यांकन शुरू करें\" चुनें।",
            "प्रत्येक निर्देश स्पष्ट रूप से ज़ोर से पढ़ें और बच्चे को जवाब देने के लिए पर्याप्त समय दें।",
            "बच्चे की गतिविधि, दिशा-बोध और मोबिलिटी सहायक उपकरणों के उपयोग का अवलोकन करें।",
            "प्रत्येक प्रतिक्रिया तुरंत ऐप में दर्ज करें; स्मृति पर निर्भर न रहें।",
            "यदि बच्चा परेशानी या थकान दिखाए तो मूल्यांकन रोक दें।",
            "पूर्णता के लिए सभी दर्ज प्रतिक्रियाओं की समीक्षा करें।",
            "ऐप में मूल्यांकन सहेजें और जमा करें।",
            "सारांश देखभालकर्ता के साथ साझा करें और अगले चरणों पर चर्चा करें।"
          ],
          ta: [
            "குழந்தை வசதியாக இருப்பதையும், மதிப்பீட்டு இடம் ஆபத்துகள் இல்லாமல் இருப்பதையும் உறுதிசெய்யவும்.",
            "குழந்தையின் சுயவிவரம் மற்றும் ஒப்புதல் விவரங்கள் பயன்பாட்டில் பதிவு செய்யப்பட்டுள்ளதை உறுதிப்படுத்தவும்.",
            "சாதனம் சார்ஜ் செய்யப்பட்டுள்ளதையும், ஒலி வெளியீடு வேலை செய்வதையும் சரிபார்க்கவும்.",
            "குழந்தையின் சுயவிவரத்தைத் திறந்து \"புதிய மதிப்பீட்டைத் தொடங்கு\" என்பதைத் தேர்ந்தெடுக்கவும்.",
            "ஒவ்வொரு வழிமுறையையும் தெளிவாக சத்தமாக வாசித்து, குழந்தைக்குப் பதிலளிக்கப் போதிய நேரம் கொடுக்கவும்.",
            "குழந்தையின் அசைவு, திசையறிதல் மற்றும் இயக்க உதவிக் கருவிகளின் பயன்பாட்டைக் கவனிக்கவும்.",
            "ஒவ்வொரு பதிலையும் உடனடியாக பயன்பாட்டில் பதிவு செய்யவும்; நினைவாற்றலை நம்பி இருக்க வேண்டாம்.",
            "குழந்தை வருத்தம் அல்லது சோர்வைக் காட்டினால் மதிப்பீட்டை இடைநிறுத்தவும்.",
            "முழுமைக்காக பதிவு செய்யப்பட்ட அனைத்து பதில்களையும் மறுபரிசீலனை செய்யவும்.",
            "பயன்பாட்டில் மதிப்பீட்டைச் சேமித்து சமர்ப்பிக்கவும்.",
            "சுருக்கத்தைப் பராமரிப்பாளருடன் பகிர்ந்து, அடுத்த படிகளைப் பற்றி விவாதிக்கவும்."
          ],
          bn: [
            "নিশ্চিত করুন যে শিশুটি স্বাচ্ছন্দ্যে আছে এবং মূল্যায়নের স্থানটি বিপদমুক্ত।",
            "নিশ্চিত করুন যে শিশুর প্রোফাইল ও সম্মতির বিবরণ অ্যাপে নথিভুক্ত আছে।",
            "পরীক্ষা করুন যে ডিভাইসটি চার্জ করা আছে এবং অডিও আউটপুট কাজ করছে।",
            "শিশুর প্রোফাইল খুলুন এবং \"নতুন মূল্যায়ন শুরু করুন\" নির্বাচন করুন।",
            "প্রতিটি নির্দেশনা স্পষ্টভাবে জোরে পড়ুন এবং শিশুকে উত্তর দেওয়ার জন্য যথেষ্ট সময় দিন।",
            "শিশুর চলাচল, দিকনির্ণয় এবং চলাচল সহায়ক যন্ত্রের ব্যবহার পর্যবেক্ষণ করুন।",
            "প্রতিটি প্রতিক্রিয়া সঙ্গে সঙ্গে অ্যাপে নথিভুক্ত করুন; স্মৃতির উপর নির্ভর করবেন না।",
            "শিশু কষ্ট বা ক্লান্তি প্রকাশ করলে মূল্যায়ন থামান।",
            "সম্পূর্ণতার জন্য সমস্ত নথিভুক্ত প্রতিক্রিয়া পর্যালোচনা করুন।",
            "অ্যাপে মূল্যায়নটি সংরক্ষণ ও জমা দিন।",
            "সারসংক্ষেপ পরিচর্যাকারীর সাথে ভাগ করুন এবং পরবর্তী পদক্ষেপ নিয়ে আলোচনা করুন।"
          ]
        },
        facilitatorNote: "Placeholder test activity for multi-language SOP audio. Real activity translations follow this same sopTranslations pattern.",
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "result", label: "Overall", type: "result" },
          { id: "notes", label: "Notes", type: "notes" }
        ]
      }
    ]
  }

  /* ===== TO ADD A NEW CATEGORY =================================
     Copy one whole block above (from { category: ... } to its closing } ),
     paste it here, put a comma before it, and change the words inside to make a new category with new activities.
     ============================================================ */

];


/* =============================================================================
   SOUND_LIBRARY  —  the sounds shown on the Sound Library board.
   =============================================================================

   These are the sounds a teacher can play from the device speaker during any
   activity that has  soundboard: true  (see the activities above).

   TO ADD A SOUND (no coding):
     1. Put the audio file (an .mp3) into the  sounds/  folder next to this file.
     2. Copy a line below, change the three values:
          file   the filename, written as  "sounds/yourfile.mp3"
          label  the name the teacher sees on the button
          group  which heading it sits under (e.g. "Animals"). Reuse an existing
                 group name to add to it, or type a new one to start a new group.
     3. Keep the quotes "  " and the comma , at the end of the line.
     4. Save, then rebuild/refresh. Done.

   The groups appear in the order they first show up in this list.
   ============================================================================= */
const SOUND_LIBRARY = [
  /* ----- Recommended sounds -----
     The short, go-to set for the sound activities. Listed FIRST, so it is
     the tab the teacher sees when the Sound Library opens. To feature another
     sound, move its line up here; to un-feature one, move it down to "Sounds". */
  { file: "sounds/clap.mp3",           label: "Clap",         group: "Recommended sounds" },
  { file: "sounds/cuckoo.mp3",         label: "Cuckoo",       group: "Recommended sounds" },
  { file: "sounds/whistle.mp3",        label: "Whistle",      group: "Recommended sounds" },
  { file: "sounds/dog.mp3",            label: "Dog",          group: "Recommended sounds" },
  { file: "sounds/cat.mp3",            label: "Cat",          group: "Recommended sounds" },

  /* ----- Sounds ----- */
  { file: "sounds/cow.mp3",            label: "Cow",          group: "Sounds" },
  { file: "sounds/chicken.mp3",        label: "Chicken",      group: "Sounds" },
  { file: "sounds/doorbell.mp3",       label: "Doorbell",     group: "Sounds" },
  { file: "sounds/door.mp3",           label: "Door",         group: "Sounds" },
  { file: "sounds/clock.mp3",          label: "Clock",        group: "Sounds" },
  { file: "sounds/keys.mp3",           label: "Keys",         group: "Sounds" },
  { file: "sounds/flush.mp3",          label: "Toilet flush", group: "Sounds" },
  { file: "sounds/glass-breaking.mp3", label: "Glass break",  group: "Sounds" },
  { file: "sounds/chewing.mp3",        label: "Chewing",      group: "Sounds" },
  { file: "sounds/burp.mp3",           label: "Burp",         group: "Sounds" },
  { file: "sounds/horn.mp3",           label: "Horn",         group: "Sounds" },
  { file: "sounds/police-siren.mp3",   label: "Police siren", group: "Sounds" },
  { file: "sounds/bike-driving.mp3",   label: "Bike",         group: "Sounds" },
  { file: "sounds/bicycle-bell.mp3",   label: "Bicycle bell", group: "Sounds" },
  { file: "sounds/rain.mp3",           label: "Rain",         group: "Sounds" },
  { file: "sounds/fireworks.mp3",      label: "Fireworks",    group: "Sounds" },
  { file: "sounds/tabla.mp3",          label: "Tabla",        group: "Sounds" },
];