/* =============================================================================
   ACTIVITIES.JS  —  THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE CONTENT
   =============================================================================

   Everything the teacher sees — the 5 categories, the activities inside them,
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
                 NEVER change an id — saved results are keyed to it. Renaming
                 an activity is safe; changing its id orphans its records.
   name          The title the teacher sees.
   purpose       ONE OR TWO SENTENCES saying what the activity is for. Unlike
                 everything else here it is NOT hidden behind the ? — it prints
                 on screen, under the activity name, on BOTH the student-picking
                 screen and the recording screen, every time. Keep it to what a
                 teacher needs to remember mid-session. Leave it out entirely
                 and nothing renders; nothing breaks.
   withCane      true or false  — is this the "with cane" version of the skill?
                 (Your board shows most skills run without-cane then with-cane.)
   sop           The step-by-step instructions (the SOP). Each line in the list
                 is one step. Add or remove lines freely.
   facilitatorNotes  The Facilitator Notes, ONE LINE PER BULLET, in the order
                 the document gives them. They are not re-ordered or grouped by
                 the app — what you write is what a teacher reads.
                 (The older single-paragraph `facilitatorNote: "..."` still
                 renders for the few activities that have not been rewritten.)
   audioFile     Optional. Filename of a pre-made audio narration of the SOP
                 (e.g. "sound_id_hindi.mp3"). Leave "" for now — we add audio
                 in v1 using Sarvam. The slot is already here, ready.
   videoFile     Optional. Filename of a demo video. Leave "" if none yet.
   meta          Optional. The header block of the SOP sheet, shown to the
                 teacher ABOVE the steps under "Before you start". Any of
                 resources / type / age / time; leave a key out and that line
                 simply does not appear. Nothing breaks if an activity has no
                 meta at all.
   dataFields    What the teacher records after running the activity. These are
                 the document's own "Record a Result" lines — the label is the
                 wording the teacher sees AND the column heading in the exported
                 CSV, so changing a label changes the research data's headings.
                 Each field has a "type":
                    "count"        → a number box (e.g. number of steps)
                    "fraction"     → two number boxes, "correct / total", for a
                                     line written as ___ / ___ (e.g. "Terrain
                                     changes identified correctly")
                    "rating"       → 1 2 3 4 5 buttons, for "Rate 1–5"
                    "result"       → Independent / Prompted / Unable buttons
                    "mastery"      → Got it / With help / Not yet buttons
                    "choice"       → buttons YOU name, e.g.
                                     options: ["Confident", "Required hints"]
                                     Add achievedWhen: "Confident" to say which
                                     option counts as the child managing it.
                    "checkbox"     → a yes/no tick
                    "teacherNotes" → a folded, optional text box
                    "notes"        → a plain free text box
                 Copy/remove these to change what's collected.
                 ORDER MATTERS for the scored types (result / mastery / choice):
                 when an activity has more than one, the LAST one is the score
                 the summary and the Achieved column read.
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
        purpose: "To introduce and strengthen understanding of basic directions left, right, forward and backwards using simple, consistent commands. This activity also works as an icebreaker.",
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
        // SOP as delivered by the content team (SOP_CC_App.docx, 24 Aug 2026).
        // Steps are THEIR section 'Steps', verbatim in meaning; Facilitator
        // Notes are their section of that name. Do not silently re-edit either
        // — send changes back to the content team.
        meta: {
          resources: "None",
          type: "Group",
          age: "08-12",
          time: "15 minutes (Group)"
        },
        sop: [
          "Ask the children to stand in a line, facing the facilitator, with about an arm’s length of space between them.",
          "Give simple commands from the application, such as Left, Right, Jump, Clap, Forward, Backwards, Stop, and Turn Around.",
          "Ask children to perform the action corresponding to each command.",
          "Start with 1–2 warm-up rounds so children understand the activity.",
          "After the warm-up, conduct at least 5 rounds using different commands and changing their order.",
          "Once children are comfortable, use “Surprise Me!” twice to give commands in a random order.",
          "If a child is unable to identify left and right, reinforce the concept by repeatedly asking them to raise their left and right hands. Then check understanding by asking them to identify their left ear, right ear, left knee, right shoulder, etc."
        ],
        facilitatorNotes: [
          "During warm-up, use a fixed sequence: “Turn Left → Turn Right → Jump-Jump → Clap-Clap.”",
          "Give one command at a time and wait for children to complete the action before giving the next command.",
          "Adapt the activity if a child has an additional disability. For example, skip Jump if the child has difficulty moving their legs.",
          "Use the regional language if the child does not understand the command in English.",
          "For children who need additional support, demonstrate the action or provide physical guidance before asking them to respond independently."
        ],
        /* HINDI IS A MACHINE DRAFT (2026-08-25) — the content team must verify it
           BEFORE any pilot audio is generated and before it reaches a school.
           This was asked for explicitly, which suspends the standing rule in
           MEMORY.md that teacher-facing text is never machine translated. The
           rule is suspended for the DRAFT, not for what ships.
           Lines are 1:1 with `sop` above — generate-audio.js speaks them in
           that order, so adding or removing a line here without changing `sop`
           narrates the wrong step against the right text on screen. App button
           names (Surprise me) stay in English on purpose: that is what the
           teacher is looking at. */
        audioFile: "",
        videoFile: "demo-direction-basic.mp4",
        dataFields: [
          { id: "dirbefore", label: "Rate direction sense before the activity", type: "rating" },
          { id: "dirafter", label: "Rate direction sense after the activity", type: "rating" },
          { id: "notes", label: "Additional observations/ comments", type: "teacherNotes" }
        ]
      },
      {
        id: "dir-advanced-commands",
        name: "Advanced",
        purpose: "To introduce and develop children’s understanding of cardinal directions (North, South, East, West) and intercardinal directions (Northeast, Northwest, Southeast, Southwest) to support spatial orientation.",
        withCane: false,
        commandBoard: true,
        // compass: true lays the commands out as a COMPASS ROSE instead of a
        // plain grid. Each command needs an `at` telling the board where it
        // sits: n, ne, e, se, s, sw, w, nw. A command with no `at` (say
        // "Stop") still works — it appears in a normal row under the rose.
        // Remove this line and it falls back to the old grid, nothing breaks.
        compass: true,
        // `speak` is an optional pronunciation override for the audio
        // generator — the hyphen in "North-East" makes Sarvam clip the word.
        commands: [
          { id: "north",     label: "North",       at: "n"  },
          { id: "northeast", label: "North-East",  at: "ne", speak: "North East" },
          { id: "east",      label: "East",        at: "e"  },
          { id: "southeast", label: "South-East",  at: "se", speak: "South East" },
          { id: "south",     label: "South",       at: "s"  },
          { id: "southwest", label: "South-West",  at: "sw", speak: "South West" },
          { id: "west",      label: "West",        at: "w"  },
          { id: "northwest", label: "North-West",  at: "nw", speak: "North West" }
        ],
        // SOP as delivered by the content team (SOP_CC_App.docx, 24 Aug 2026).
        // Their sheet gives no Time for this one — the key is simply omitted
        // rather than guessed; the ? sheet skips any meta line that is absent.
        meta: {
          resources: "None",
          type: "Group / Individual",
          age: "8–12 years"
        },
        sop: [
          "Ask the child to stand facing the facilitator in a clear space.",
          "Introduce the four basic directions: North, South, East, and West.",
          "Use the instructions from the app and ask the child to identify or point towards the given direction.",
          "Once the child is comfortable, introduce Northeast, Northwest, Southeast, and Southwest.",
          "Conduct 1–2 practice rounds before recording responses.",
          "Conduct at least 5 trials with each child, using different directions in a mixed order.",
          "Use “Surprise Me!” to assess the child’s ability to identify directions in a random order."
        ],
        facilitatorNotes: [
          "Ensure children understand North, South, East, and West before introducing the diagonal directions.",
          "Relate the directions to familiar surroundings when helpful, e.g., “The main gate is towards the North.”",
          "Use a consistent reference point throughout the activity.",
          "Use the regional language if the child does not understand the direction names in English.",
          "If a child is unable to identify a direction, provide a hint or use a familiar landmark to reinforce the concept."
        ],
        /* HINDI IS A MACHINE DRAFT (2026-08-25) — the content team must verify it
           BEFORE any pilot audio is generated and before it reaches a school.
           This was asked for explicitly, which suspends the standing rule in
           MEMORY.md that teacher-facing text is never machine translated. The
           rule is suspended for the DRAFT, not for what ships.
           Lines are 1:1 with `sop` above — generate-audio.js speaks them in
           that order, so adding or removing a line here without changing `sop`
           narrates the wrong step against the right text on screen. App button
           names (Surprise me) stay in English on purpose: that is what the
           teacher is looking at. */
        audioFile: "",
        // Same drill format as Basic — reusing its demo until a cardinal-
        // specific video arrives; just swap the filename then.
        videoFile: "demo-direction-basic.mp4",
        dataFields: [
          { id: "trials", label: "Number of trials conducted", type: "count" },
          { id: "correct", label: "Number of correct responses", type: "count" },
          { id: "notes", label: "Additional observations/comments", type: "teacherNotes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 3 ============================================ */
  /* ===== SOUND ===================================================
     Split back out of Sound + Direction on 2026-08-25 (Adi). This reverses
     the 24 Aug merge: identification and localisation are their own skill
     ladder and read better as their own category, and Sound + Direction is
     left holding the activities that genuinely combine the two.
     Activity ids are UNCHANGED, so every saved record follows its activity —
     records key on `rec_<activityId>` and no category index is ever
     persisted. Category membership is presentation, not identity.
     (The CATEGORY n numbers in the other comments are historical and no
     longer match the order; go by the category name.) */
  {
    category: "Sound",
    description: "Naming a sound, then pointing to where it came from.",
    help: [
      "Start with Which Sound? — the child names each sound you play from the app's sound library.",
      "Then Source of Sound? — the child points to where the sound is coming from.",
      "Stand about 3 steps from the child when playing sounds."
    ],
    activities: [
      {
        id: "sound-which",
        name: "Identification",
        purpose: "To help children identify and differentiate between common and unfamiliar sounds in their surroundings.",
        withCane: false,
        soundboard: true,
        // SOP as delivered by the content team (SOP_CC_App.docx, 24 Aug 2026).
        meta: {
          resources: "Speaker and Mobile",
          type: "Individual (Seating can be in a group)",
          age: "08-12",
          time: "3 minutes (Individual)"
        },
        sop: [
          "Ask the children to sit beside each other, facing the facilitator.",
          "Play one sound at a time from the app, bringing the speaker close to each child individually.",
          "Ask the child to identify the sound.",
          "Confirm the child’s response before moving to the next sound.",
          "Play 2 different sounds for each child."
        ],
        facilitatorNotes: [
          "Adjust the speaker distance and sound volume according to the surrounding environment.",
          "Tell children to wait for their turn and not interrupt another child’s response.",
          "If a child is unable to identify a sound, give a simple hint rather than revealing the answer directly."
        ],
        /* HINDI IS A MACHINE DRAFT (2026-08-25) — the content team must verify it
           BEFORE any pilot audio is generated and before it reaches a school.
           This was asked for explicitly, which suspends the standing rule in
           MEMORY.md that teacher-facing text is never machine translated. The
           rule is suspended for the DRAFT, not for what ships.
           Lines are 1:1 with `sop` above — generate-audio.js speaks them in
           that order, so adding or removing a line here without changing `sop`
           narrates the wrong step against the right text on screen. App button
           names (Surprise me) stay in English on purpose: that is what the
           teacher is looking at. */
        sopTranslations: {
          hi: [
            "बच्चों को एक-दूसरे के बगल में, फ़ैसिलिटेटर की ओर मुँह करके बैठाएँ।",
            "ऐप से एक बार में एक ध्वनि चलाएँ और स्पीकर को हर बच्चे के पास अलग-अलग ले जाएँ।",
            "बच्चे से ध्वनि पहचानने को कहें।",
            "अगली ध्वनि पर जाने से पहले बच्चे के उत्तर की पुष्टि करें।",
            "हर बच्चे के लिए दो अलग-अलग ध्वनियाँ चलाएँ।"
          ]
        },
        audioFile: "",
        videoFile: "demo-sound.mp4",
        dataFields: [
          { id: "trials", label: "Number of trials conducted", type: "count" },
          { id: "correct", label: "Number of correct responses", type: "count" },
          { id: "overall", label: "Overall", type: "choice", options: ["Confident", "Required Hints"] },
          { id: "notes", label: "Additional observations/comments", type: "teacherNotes" }
        ]
      },
      {
        id: "sound-source",
        name: "Localisation",
        purpose: "To help children identify the direction and approximate location of a sound source using directional terms such as left, right, front, and back.",
        withCane: false,
        soundboard: true,
        // SOP as delivered by the content team (SOP_CC_App.docx, 24 Aug 2026).
        // Note this one needs TWO adults — it is the only activity on the board
        // that does, and a teacher running the app alone cannot do it.
        meta: {
          resources: "Speaker, Mobile and 2 People",
          type: "Individual (Seating can be in a group)",
          age: "08-12",
          time: "5 minutes (each child)"
        },
        sop: [
          "Ask the child to stand facing Person A (facilitator). Person B stands at a suitable distance from the child in one of the four directions: front, back, left, or right, with the speaker.",
          "Person B plays a sound from the app while Person A asks the child to: Identify the sound. Identify the direction from which the sound is coming.",
          "Repeat the activity with a different child, changing the sound and direction.",
          "Conduct at least 3 trials with each child to assess their ability to localise sounds."
        ],
        facilitatorNotes: [
          "Adjust the speaker distance and volume according to the environment and the child’s ability to hear the sound clearly.",
          "Ask children to wait for their turn and not interrupt another child’s response.",
          "If a child is unable to identify the sound or direction, give a simple hint rather than revealing the answer.",
          "Person B should remain as quiet as possible while moving with the speaker.",
          "Avoid footsteps or other movement cues. If appropriate and safe, Person B may remove footwear to minimise sound while moving."
        ],
        /* HINDI IS A MACHINE DRAFT (2026-08-25) — the content team must verify it
           BEFORE any pilot audio is generated and before it reaches a school.
           This was asked for explicitly, which suspends the standing rule in
           MEMORY.md that teacher-facing text is never machine translated. The
           rule is suspended for the DRAFT, not for what ships.
           Lines are 1:1 with `sop` above — generate-audio.js speaks them in
           that order, so adding or removing a line here without changing `sop`
           narrates the wrong step against the right text on screen. App button
           names (Surprise me) stay in English on purpose: that is what the
           teacher is looking at. */
        sopTranslations: {
          hi: [
            "बच्चे को व्यक्ति A, यानी फ़ैसिलिटेटर, की ओर मुँह करके खड़ा करें। व्यक्ति B स्पीकर लेकर बच्चे से उचित दूरी पर चार दिशाओं में से किसी एक में खड़ा हो — आगे, पीछे, बाएँ या दाएँ।",
            "व्यक्ति B ऐप से ध्वनि चलाए, और व्यक्ति A बच्चे से पहले ध्वनि पहचानने को कहे, फिर यह कि ध्वनि किस दिशा से आ रही है।",
            "दूसरे बच्चे के साथ गतिविधि दोहराएँ, ध्वनि और दिशा बदलते हुए।",
            "हर बच्चे के साथ कम से कम तीन प्रयास कराएँ ताकि ध्वनि की दिशा पहचानने की क्षमता का आकलन हो सके।"
          ]
        },
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "trials", label: "Number of trials conducted", type: "count" },
          { id: "correct", label: "Number of correct responses", type: "count" },
          { id: "overall", label: "Overall", type: "choice", options: ["Confident", "Required Hints"] },
          { id: "notes", label: "Additional observations/comments", type: "teacherNotes" }
        ]
      }
    ]
  },
  {
    category: "Sound + Direction",
    description: "Judging how far away a sound is — by ear, then with the cane — and counting the steps to reach it.",
    /* Restructured 2026-07-13 from the four SOP demo videos (#2). Old ids
       snddir-clap / snddir-cane-count retired — pre-pilot, orphaned test
       records accepted knowingly (same call as the Direction restructure).
       REGROUPED 2026-08-24: the two Sound activities (Which Sound? / Source of
       Sound?) moved IN from their own category, which is now gone; the two
       Counting Steps drills moved OUT to Straight Line Travel. Activity ids
       are unchanged, so saved records follow their activity — records key on
       the activity id, never on the category. */
    /* NOTE 2026-08-25: category `help` / `helpVideo` / `helpImage` are no
       longer RENDERED — the ? was removed from the category screen at Adi's
       request. The data is kept because it is content-team work and costs
       nothing; restoring the button is one block in showCategory. */
    help: [
      "Start with Near-Far — the child judges sound distance by ear alone, then repeats it with the cane.",
      "Then Counting Steps — the child estimates the distance in steps, then walks it counting to check.",
      "Stand about 3 steps from the child when playing sounds. Open an activity for the full steps and the demo."
    ],
    helpVideo: "demo-snddir-nearfar.mp4",
    activities: [
      {
        id: "snddir-nearfar",
        name: "Near-Far w/o Cane",
        purpose: "To develop children’s ability to judge the approximate distance of a sound source from their body using auditory cues.",
        withCane: false,
        soundboard: true,
        // SOP as delivered by the content team (SOP.docx, 25 Aug 2026).
        // Steps and Facilitator Notes are their sections; the Record a Result
        // fields below are their list. Do not silently re-edit either — send
        // changes back to the content team.
        meta: {
          resources: "Speaker, Mobile and 2 people",
          type: "Individual",
          age: "08-12",
          time: "5 minutes (Individual)"
        },
        sop: [
          "Ask the child and Person A to stand in an open space. Person B stands in one of the four directions, at least 5 m away, and plays a sound using the speaker.",
          "Ask the child to identify the direction of the sound and orient their whole body towards it.",
          "Ask: “Is the sound close enough for you to touch?” The child should answer without moving.",
          "Ask the child to try reaching towards the sound source without moving their feet.",
          "Person B moves 2-3 steps closer while remaining outside the child’s reach. Repeat the question and ask the child to reach towards the sound source.",
          "Person B then moves to a position just within the child’s reach. Ask the same question, then allow the child to try to reach the sound source.",
          "Repeat the activity if the child needs more practice to understand the difference between near and far."
        ],
        facilitatorNotes: [
          "Adjust the speaker distance and sound volume according to the surrounding environment.",
          "Use familiar sounds from the app to create a simple context. For example, play a dog sound and ask, “Is the dog near enough for you to touch?”",
          "Person B should remain as quiet as possible while moving with the speaker.",
          "Avoid footsteps and other movement cues. If safe and appropriate, Person B may remove footwear to minimise sound.",
          "Ensure the child remains in a safe, clear space while reaching."
        ],
        /* HINDI IS A MACHINE DRAFT (2026-08-25) — content team must verify before
           any pilot audio is generated. Lines are 1:1 with `sop` above; see the
           fuller note on Direction -> Basic. */
        sopTranslations: {
          hi: [
            "बच्चे और व्यक्ति A को खुली जगह में खड़ा करें। व्यक्ति B चार दिशाओं में से किसी एक में, कम से कम 5 मीटर दूर खड़ा होकर स्पीकर से ध्वनि चलाए।",
            "बच्चे से ध्वनि की दिशा पहचानने और अपना पूरा शरीर उस ओर मोड़ने को कहें।",
            "पूछें: \"क्या ध्वनि इतनी पास है कि आप उसे छू सकें?\" बच्चा बिना हिले उत्तर दे।",
            "बच्चे से कहें कि पैर हिलाए बिना ध्वनि के स्रोत की ओर हाथ बढ़ाकर देखे।",
            "व्यक्ति B 2–3 कदम पास आए, लेकिन बच्चे की पहुँच से बाहर रहे। वही प्रश्न दोहराएँ और बच्चे से ध्वनि के स्रोत की ओर हाथ बढ़ाने को कहें।",
            "फिर व्यक्ति B ऐसी जगह आए जो बच्चे की पहुँच के भीतर हो। वही प्रश्न पूछें, और बच्चे को ध्वनि का स्रोत छूने का प्रयास करने दें।",
            "यदि बच्चे को पास और दूर का अंतर समझने के लिए और अभ्यास चाहिए, तो गतिविधि दोहराएँ।"
          ]
        },
        audioFile: "",
        videoFile: "demo-snddir-nearfar.mp4",
        dataFields: [
          { id: "oriented", label: "Correctly oriented towards the sound", type: "choice", options: ["Yes", "No"] },
          { id: "nearfar", label: "Understanding of near and far", type: "rating" },
          { id: "notes", label: "Additional observations/comments", type: "teacherNotes" }
        ]
      },
      {
        id: "snddir-nearfar-cane",
        name: "Near-Far with Cane",
        purpose: "To help children understand how the cane extends their reach and develop the ability to judge the distance of a sound source from the cane tip using auditory cues and steps.",
        withCane: true,
        soundboard: true,
        // SOP as delivered by the content team (SOP.docx, 25 Aug 2026).
        // Steps and Facilitator Notes are their sections; the Record a Result
        // fields below are their list. Do not silently re-edit either — send
        // changes back to the content team.
        meta: {
          resources: "Speaker, Mobile, Cane (as per children’s height) and 2 people",
          type: "Individual",
          age: "08-12",
          time: "10 minutes"
        },
        sop: [
          "Ask the child and Person A to stand in an open, clear space. Person B stands facing the child, at least 5 m away, and plays a sound using the speaker.",
          "Give the child a cane appropriate to their height. Ask: “Is the sound close enough for you to touch with the cane?” The child should answer without moving.",
          "Ask the child to reach towards the sound source using the cane, without moving their feet. Provide guidance on holding the cane if needed.",
          "Person B moves 2–3 steps closer, while remaining outside the child’s cane reach. Repeat the question and ask the child to reach towards the sound with the cane.",
          "Person B moves to a position just within the child’s cane reach. Ask the same question and allow the child to touch the sound source with the cane.",
          "Once the child is able to reach the source, explain that the cane extends their reach beyond their hand.",
          "To demonstrate this difference, keep the cane tip at the sound source. Ask the child to estimate how many steps they would need to take to reach the source without the cane. Discuss how the cane helped them reach the source from a greater distance.",
          "Repeat the activity if the child needs more practice to understand the difference between near and far and how the cane extends their reach."
        ],
        facilitatorNotes: [
          "Adjust the speaker distance and sound volume according to the surrounding environment.",
          "Ensure the cane length is appropriate for the child’s height. (Heightx0.75)",
          "Use familiar sounds from the app to create a simple context. For example, play a dog sound and ask, “Is the dog near enough for you to touch with the cane?”",
          "Person B should remain as quiet as possible while moving with the speaker.",
          "Avoid footsteps and other movement cues. If safe and appropriate, Person B may remove footwear to minimise sound.",
          "Ensure the child has sufficient clear space and is supervised while using the cane.",
          "Do not ask the child to walk towards the sound source until the facilitator confirms that the path is clear and safe."
        ],
        /* HINDI IS A MACHINE DRAFT (2026-08-25) — content team must verify before
           any pilot audio is generated. Lines are 1:1 with `sop` above; see the
           fuller note on Direction -> Basic. */
        sopTranslations: {
          hi: [
            "बच्चे और व्यक्ति A को खुली, साफ़ जगह में खड़ा करें। व्यक्ति B बच्चे की ओर मुँह करके, कम से कम 5 मीटर दूर खड़ा होकर स्पीकर से ध्वनि चलाए।",
            "बच्चे को उसकी लंबाई के अनुसार छड़ी दें। पूछें: \"क्या ध्वनि इतनी पास है कि आप उसे छड़ी से छू सकें?\" बच्चा बिना हिले उत्तर दे।",
            "बच्चे से कहें कि पैर हिलाए बिना छड़ी से ध्वनि के स्रोत तक पहुँचने का प्रयास करे। ज़रूरत हो तो छड़ी पकड़ने का तरीका बताएँ।",
            "व्यक्ति B 2–3 कदम पास आए, लेकिन बच्चे की छड़ी की पहुँच से बाहर रहे। वही प्रश्न दोहराएँ और बच्चे से छड़ी से ध्वनि की ओर पहुँचने को कहें।",
            "व्यक्ति B ऐसी जगह आए जो बच्चे की छड़ी की पहुँच के भीतर हो। वही प्रश्न पूछें और बच्चे को छड़ी से ध्वनि का स्रोत छूने दें।",
            "जब बच्चा स्रोत तक पहुँच जाए, तो समझाएँ कि छड़ी उसके हाथ से आगे तक उसकी पहुँच बढ़ाती है।",
            "यह अंतर दिखाने के लिए छड़ी की नोक ध्वनि के स्रोत पर टिकाए रखें। बच्चे से पूछें कि छड़ी के बिना स्रोत तक पहुँचने में उसे कितने कदम लगेंगे। चर्चा करें कि छड़ी ने उसे अधिक दूरी से स्रोत तक पहुँचने में कैसे मदद की।",
            "यदि बच्चे को पास और दूर का अंतर तथा छड़ी से पहुँच बढ़ने की बात समझने के लिए और अभ्यास चाहिए, तो गतिविधि दोहराएँ।"
          ]
        },
        audioFile: "",
        videoFile: "demo-snddir-nearfar-cane.mp4",
        dataFields: [
          { id: "nearfar", label: "Understanding of near and far", type: "rating" },
          { id: "canereach", label: "Understanding of cane-extended reach", type: "rating" },
          { id: "notes", label: "Additional observations/comments", type: "teacherNotes" }
        ]
      },
      {
        id: "snddir-steps-solo",
        name: "Count Steps",
        purpose: "To develop children’s ability to estimate distance by counting steps and understand the relationship between the number of steps and the distance to a sound source or object.",
        withCane: false,
        soundboard: true,
        // SOP as delivered by the content team (SOP.docx, 25 Aug 2026).
        // Steps and Facilitator Notes are their sections; the Record a Result
        // fields below are their list. Do not silently re-edit either — send
        // changes back to the content team.
        meta: {
          resources: "Phone and Speaker",
          type: "Individual",
          age: "08-12",
          time: "15 minutes"
        },
        sop: [
          "Ask the child to stand in an open, clear space. Place the speaker approximately 5 m away.",
          "Play a sound and ask the child to estimate how many steps away the sound source is.",
          "Ask the child to walk naturally towards the sound source while counting their steps.",
          "If the child does not reach the source within the estimated number of steps, ask them to stop and estimate the remaining distance in steps. Continue until they reach the source.",
          "If the child reaches the sound source in fewer than the estimated steps, then make them compare the estimated number of steps with the actual number of steps taken.",
          "Repeat the activity at least 3 times using different distances."
        ],
        facilitatorNotes: [
          "Adjust the speaker distance and sound volume according to the surrounding environment.",
          "Encourage the child to walk at their natural pace and take comfortable, consistent steps.",
          "Ask the child to maintain a similar step length throughout the activity rather than deliberately taking shorter or longer steps to match the estimate.",
          "Encourage the child to compare their estimated and actual number of steps after each round.",
          "Ensure the walking path is clear and safe."
        ],
        /* HINDI IS A MACHINE DRAFT (2026-08-25) — content team must verify before
           any pilot audio is generated. Lines are 1:1 with `sop` above; see the
           fuller note on Direction -> Basic. */
        sopTranslations: {
          hi: [
            "बच्चे को खुली, साफ़ जगह में खड़ा करें। स्पीकर लगभग 5 मीटर दूर रखें।",
            "ध्वनि चलाएँ और बच्चे से अनुमान लगाने को कहें कि ध्वनि का स्रोत कितने कदम दूर है।",
            "बच्चे से कहें कि अपने कदम गिनते हुए स्वाभाविक गति से ध्वनि के स्रोत की ओर चले।",
            "यदि बच्चा अनुमानित कदमों में स्रोत तक न पहुँचे, तो उसे रुकने और बची हुई दूरी का अनुमान कदमों में लगाने को कहें। स्रोत तक पहुँचने तक यही दोहराएँ।",
            "यदि बच्चा अनुमान से कम कदमों में स्रोत तक पहुँच जाए, तो उससे अनुमानित और वास्तविक कदमों की तुलना कराएँ।",
            "अलग-अलग दूरियों के साथ गतिविधि कम से कम 3 बार दोहराएँ।"
          ]
        },
        audioFile: "",
        videoFile: "demo-snddir-steps-solo.mp4",
        dataFields: [
          { id: "rounds", label: "No. of Rounds conducted", type: "count" },
          { id: "dist", label: "Understanding of distance estimation", type: "rating" },
          { id: "notes", label: "Additional Observations/Comments", type: "teacherNotes" }
        ]
      },
      {
        id: "snddir-steps-group",
        name: "Count Steps (Group)",
        purpose: "To develop children’s ability to estimate distance by counting steps and understand the relationship between the number of steps and the distance to a sound source or object.",
        withCane: false,
        soundboard: true,
        group: true,
        // SOP as delivered by the content team (SOP.docx, 25 Aug 2026).
        // Steps and Facilitator Notes are their sections; the Record a Result
        // fields below are their list. Do not silently re-edit either — send
        // changes back to the content team.
        meta: {
          resources: "Phone, Speaker and 2 people.",
          type: "Group",
          age: "08-12",
          time: "30 minutes"
        },
        sop: [
          "Ask 4 children to stand at different positions in an open, clear space.",
          "Ask one child to choose any one of their friends. The selected child becomes the sound source and makes a sound from their position.",
          "Ask the first child to identify their friend and estimate how many steps away the sound source is.",
          "Ask the child to walk naturally towards their friend while counting their steps.",
          "If the child does not reach their friend within the estimated number of steps, ask them to stop and estimate the remaining distance in steps. Continue until they reach their friend.",
          "Once they reach their friend, make them compare the estimated number of steps with the actual number of steps taken.",
          "Repeat the activity by allowing each child to take a turn as the sound source and the person estimating the distance.",
          "Conduct at least 3 rounds, changing the positions and distances between children."
        ],
        facilitatorNotes: [
          "Ensure all children are standing in a clear and safe space.",
          "Ask the child to keep the sound source in the same position until their friend reaches them.",
          "Encourage the child to walk naturally and maintain a similar step length throughout.",
          "After each round, discuss the difference between the estimated and actual number of steps.",
          "Adjust the distance between children according to the available space and the children’s abilities."
        ],
        /* HINDI IS A MACHINE DRAFT (2026-08-25) — content team must verify before
           any pilot audio is generated. Lines are 1:1 with `sop` above; see the
           fuller note on Direction -> Basic. */
        sopTranslations: {
          hi: [
            "4 बच्चों को खुली, साफ़ जगह में अलग-अलग स्थानों पर खड़ा करें।",
            "एक बच्चे से कहें कि वह अपने किसी एक साथी को चुने। चुना गया बच्चा ध्वनि का स्रोत बनेगा और अपनी जगह से आवाज़ करेगा।",
            "पहले बच्चे से कहें कि वह अपने साथी को पहचाने और अनुमान लगाए कि ध्वनि का स्रोत कितने कदम दूर है।",
            "बच्चे से कहें कि अपने कदम गिनते हुए स्वाभाविक गति से अपने साथी की ओर चले।",
            "यदि बच्चा अनुमानित कदमों में अपने साथी तक न पहुँचे, तो उसे रुकने और बची हुई दूरी का अनुमान कदमों में लगाने को कहें। साथी तक पहुँचने तक यही दोहराएँ।",
            "साथी तक पहुँचने पर उससे अनुमानित और वास्तविक कदमों की तुलना कराएँ।",
            "हर बच्चे को ध्वनि का स्रोत बनने और दूरी का अनुमान लगाने की बारी दें।",
            "कम से कम 3 राउंड कराएँ, हर बार बच्चों की जगह और आपस की दूरी बदलते हुए।"
          ]
        },
        audioFile: "",
        videoFile: "demo-snddir-steps-group.mp4",
        dataFields: [
          { id: "rounds", label: "No. of Rounds conducted", type: "count" },
          { id: "dist", label: "Understanding of distance estimation", type: "rating" },
          { id: "notes", label: "Additional Observations/Comments", type: "teacherNotes" }
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
    description: "Travel in a straight line toward a sound played on the app — estimating and counting the steps, then with the cane and a push toy for a positive start, then with the cane alone.",
    /* GROUP NOTE: `group: true` on Counting Steps — Group marks a whole-group
       activity — the app skips the child picker and saves ONE result for the
       group. Copy that line onto any activity that is scored as a group,
       delete it for per-child scoring. (Both Counting Steps drills moved here
       from Sound + Direction on 2026-08-24; their ids are unchanged, so saved
       records follow them.) */
    /* ADI, 2026-09-02: "Straight Line Travel - Without Cane" was DELETED. The
       final SOP document delivers two straight-line stages, With Push Toy and
       With Cane, and never described a without-cane baseline; that activity had
       been deduced from a July video and carried no purpose, no document SOP
       and July's record fields. Its id `slt-nocane` is retired and never
       reused. Any pre-pilot records under it are orphaned, knowingly.
       `demo-slt-nocane.mp4` is now unreferenced - safe to delete from the Mac. */
    help: [
      "Counting Steps: run the Group drill first (one shared result - no child is selected), then score each child in Individual.",
      "Add the cane With Push Toy - the toy and its story make the cane fun and familiar; the child pushes it straight to the sound.",
      "Finish With Cane once the toy comes off - the same straight-line travel, now independent."
    ],
    activities: [
      {
        id: "slt-withcane-toy",
        name: "With Push Toy",
        purpose: "To encourage independent straight-line movement towards a sound source while building a positive, playful association with mobility and distance judgement.",
        withCane: true,
        soundboard: true,
        // SOP as delivered by the content team (SOP_CC_App.docx, FINAL, 1 Sep 2026).
        // 'Steps' and 'Facilitator Notes' are their sections, transcribed.
        // Do not silently re-edit either - send changes back to the content team.
        meta: {
          resources: "Push Toy, Cane (as per height), Speaker,1 Facilitator",
          type: "Individual",
          age: "08-12 yrs",
          time: "15 minutes"
        },
        sop: [
          "Give the child a push toy without the cane and allow them to explore it freely. Observe their initial response and interest.",
          "Build curiosity through a simple story. Remove the cane tip, attach the push toy to the cane, and allow the child to explore it again.",
          "Ask the child to stand in an open, clear space. Place the speaker approximately 5 m away and continue the story.",
          "Example: Play a dog sound and use a frog push toy: “Can you take the frog to meet the dog?”",
          "Ask the child to move towards the sound source using the cane with the push toy. Observe how they naturally hold and move the cane.",
          "Once the child reaches the sound source, observe how accurately they locate it with the push toy. Provide directional guidance only if needed."
        ],
        facilitatorNotes: [
          "Allow enough time for the child to freely explore the push toy, both with and without the cane.",
          "Use simple stories and familiar sounds to make the activity playful and purposeful.",
          "The Concept of Push toys might not be interesting enough for some mature kids, in which case this activity can be skipped only for them.",
          "Adjust the speaker distance and volume according to the environment.",
          "Keep the travel path clear and safe.",
          "Avoid correcting the child’s cane hold immediately; first observe their natural grip, posture, and movement."
        ],
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1.
        /* HINDI REMOVED 2026-09-01. The previous hi[] was 1:1 with the OLD
           video-deduced steps; the final SOP replaced them, so those lines now
           describe a different activity. Machine translation is not used for
           teacher-facing text, so this waits on the content team. Any stale
           audio/<id>_hi.mp3 on disk must be DELETED - build.sh mirrors audio/
           and the app would happily narrate the old steps over the new ones. */
        audioFile: "",
        videoFile: "demo-slt-withcane-toy.mp4",
        dataFields: [
          { id: "toyresp", label: "Response to Push Toy", type: "choice", options: ["Excited", "Neutral", "Not Interested"] },
          { id: "confid", label: "Confidence while walking", type: "rating" },
          { id: "notes", label: "Additional Observations/Comments", type: "teacherNotes" }
        ]
      },
      {
        id: "slt-withcane",
        name: "With Cane",
        purpose: "To develop independent straight-line walking towards a sound source while building distance judgement, confidence, and familiarity with cane use.",
        withCane: true,
        soundboard: true,
        // SOP as delivered by the content team (SOP_CC_App.docx, FINAL, 1 Sep 2026).
        // 'Steps' and 'Facilitator Notes' are their sections, transcribed.
        // Do not silently re-edit either - send changes back to the content team.
        meta: {
          resources: "Cane, Roller Tip, Speaker",
          type: "Individual",
          age: "08-12 yrs",
          time: "15 minutes"
        },
        sop: [
          "Give the child a cane appropriate to their height and allow them to hold and explore it comfortably.",
          "Demonstrate the features of the Cane (How it folds, reopens, grips, and tips)",
          "Introduce the cane tip through a simple narrative: “Imagine the cane tip has a tyre like a car. When you move it from left to right, it rolls smoothly and helps you find what is in your path.”",
          "Demonstrate a gentle left-to-right movement of the cane and ask the child to try it slightly angled in front of the body, holding it in a way that feels comfortable.",
          "Place a speaker approximately 5 m away and ask the child to move towards the sound while continuing the left-to-right cane movement.",
          "Allow the child to walk at their natural pace. Observe their cane hold, posture, movement, and confidence without immediately correcting them.",
          "Once the child reaches the sound source, appreciate the attempt and discuss how the cane helped them explore the path ahead."
        ],
        facilitatorNotes: [
          "Keep the introduction simple; the aim is to build familiarity with cane movement, not teach perfect cane technique at this stage.",
          "Allow the child to choose a comfortable way of holding the cane.",
          "Encourage a smooth and relaxed left-to-right movement rather than forceful movement.",
          "Give physical guidance only if the child is unable to understand the movement through verbal instructions or demonstration.",
          "Adjust the speaker distance and volume according to the environment.",
          "Ensure the walking path is clear and safe.",
          "Observe the child’s natural grip, cane angle, posture, movement pattern, and confidence."
        ],
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1.
        // No toy-faded demo filmed yet — wire the filename once it exists.
        /* HINDI REMOVED 2026-09-01. The previous hi[] was 1:1 with the OLD
           video-deduced steps; the final SOP replaced them, so those lines now
           describe a different activity. Machine translation is not used for
           teacher-facing text, so this waits on the content team. Any stale
           audio/<id>_hi.mp3 on disk must be DELETED - build.sh mirrors audio/
           and the app would happily narrate the old steps over the new ones. */
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "ltr", label: "Able to perform left-to-right cane movement", type: "choice", options: ["Yes", "With Support", "No"] },
          { id: "confid", label: "Confidence while walking with the cane", type: "rating" },
          { id: "notes", label: "Additional observations/comments", type: "teacherNotes" }
        ]
      }
    ]
  },

  /* ===== CATEGORY 5 ============================================
     (Push Toy category removed 2026-07-14 — the push toy is now a
     stage inside Straight Line Travel, Category 4: slt-withcane-toy.
     Old id `push-race` retired; pre-pilot orphan records accepted.)
     ============================================================== */
  /* ===== TERRAIN PATH — three stages ============================
     Renamed from "Terrain Game" 2026-09-02 to the document's own
     heading. The three activity names are the document's too:

       1. Terrain Identification with Feet  (id terrain-intro)
       2. Terrain Identification With Cane  (id terrain-walk)
       3. Find the Obstacles                (id terrain-obstacle)

     Ids are unchanged, so every saved record followed the rename —
     records key on the id, never on the name.

     `setup` below is the document's own "Introduction (Set up)"
     section, transcribed. It is CATEGORY-level, not an activity: it
     describes how to build the path, and it renders in the Prepare
     tab of the ? sheet on all three terrain activities, which is
     where a teacher reads it. The invented July setup lines it
     replaced were written from a course photo before the content
     team had delivered this section. */
  {
    category: "Terrain Path",
    description: "A path of contrasting floor textures — the child learns each surface by foot, then by cane, then hunts obstacles along it.",
    setup: [
      "How Many Terrain Surfaces Are Recommended? Use at least 4 contrasting terrain surfaces so children can experience and differentiate a variety of tactile and auditory feedback.",
      "Recommended Terrain Size: Each terrain section can be approximately 2 ft × 6 ft, providing enough space for the child to walk and explore the surface using their feet and cane.",
      "Arrangement of the Terrain Path: The terrain sections can be arranged in different layouts depending on the available space. A U-shaped path is recommended as it introduces turns, allowing children to practise re-orientation and maintaining their position on the path while changing direction.",
      "Suggested Terrain Surfaces — choose surfaces that provide clearly different tactile and auditory feedback, for example: Yoga Mat (soft and smooth); Yoga Mat + Anti-slip Tape (rough/textured, representing a road-like surface); Artificial Grass (soft and textured); Anti-slip Bathroom Mat (soft and bumpy); Tactile Tile (hard and textured; can also be used around turns).",
      "Order of Terrains: Begin with familiar and easily distinguishable surfaces, then gradually introduce less familiar or more challenging textures. This helps children build confidence before making finer surface distinctions.",
      "Securing the Terrain Path: Secure all mats firmly to prevent slipping or movement during the activity. Velcro-based strips can be attached underneath the mats to connect and hold the terrain sections in place.",
      "Before every session, check that the mats, edges, Velcro strips, and surrounding walking area are stable and free from tripping hazards."
    ],
    helpVideo: "demo-terrain-setup.mp4",
    helpImage: "help-terrain-setup.jpg",
    activities: [
      {
        id: "terrain-intro",
        name: "Terrain Identification with Feet",
        purpose: "Develop awareness of different ground surfaces through foot feedback, build vocabulary to describe how surfaces feel and sound, and use these cues to support mental mapping and orientation.",
        withCane: false,
        // SOP as delivered by the content team (SOP_CC_App.docx, FINAL, 1 Sep 2026).
        // 'Steps' and 'Facilitator Notes' are their sections, transcribed.
        // Do not silently re-edit either - send changes back to the content team.
        meta: {
          resources: "Terrain Mats, 1 Facilitator",
          type: "Individual",
          age: "08-12",
          time: "10 minutes (Individual)"
        },
        sop: [
          "Take the child to the starting point of the terrain path. Explain that there are different surfaces along the path and ask them to say “Change” whenever they feel the surface change under their feet.",
          "On each surface, ask: “Does it feel smooth or textured?” If needed, encourage the child to gently rub one foot over the surface to explore it.",
          "Ask the child to describe how the surface feels in their own words. If needed, offer words such as soft, hard, rough, bumpy, or smooth.",
          "Ask the child to gently tap or move their foot on the surface and listen to the sound. Encourage them to describe how it sounds. For comparison, ask them to do it on the floor also.",
          "Ask whether the surface feels or sounds familiar and if it reminds them of any place or surface they have experienced before.",
          "Continue walking and repeat the same exploration for each new terrain."
        ],
        facilitatorNotes: [
          "Allow the child to describe the surface in their own words first before suggesting vocabulary.",
          "There is no single correct way to describe how a surface feels or sounds; focus on whether the child can notice and differentiate changes.",
          "If a child is getting confused, use the floor feedback to create a comparison understanding.",
          "If the child’s cognitive level allows, relate surfaces to familiar environments, when possible, such as grass, tiles, concrete, carpet, mud, or gravel.",
          "Ensure the terrain path is clear of unintended obstacles and safe for exploration."
        ],
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated. Steps line up 1:1
        // with `sop` above, as required by generate-audio.js.
        /* HINDI REMOVED 2026-09-01. The previous hi[] was 1:1 with the OLD
           video-deduced steps; the final SOP replaced them, so those lines now
           describe a different activity. Machine translation is not used for
           teacher-facing text, so this waits on the content team. Any stale
           audio/<id>_hi.mp3 on disk must be DELETED - build.sh mirrors audio/
           and the app would happily narrate the old steps over the new ones. */
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "changes", label: "Terrain changes identified correctly", type: "fraction" },
          { id: "describe", label: "Terrains correctly described/differentiated", type: "fraction" },
          { id: "vocab", label: "Ability to describe terrain using sound/feel vocabulary", type: "rating" },
          { id: "notes", label: "Additional observations/comments", type: "teacherNotes" }
        ]
      },
      {
        id: "terrain-walk",
        name: "Terrain Identification With Cane",
        purpose: "To help children identify and differentiate ground surfaces through cane feedback while developing controlled cane movement and orientation to surface boundaries.",
        withCane: true,
        // SOP as delivered by the content team (SOP_CC_App.docx, FINAL, 1 Sep 2026).
        // 'Steps' and 'Facilitator Notes' are their sections, transcribed.
        // Do not silently re-edit either - send changes back to the content team.
        meta: {
          resources: "Terrain Mats, Cane with Roller Tip (as per height), 1 small training cone, 1 candy, 1 Facilitator",
          type: "Individual",
          age: "08-12",
          time: "10 minutes (Individual)"
        },
        sop: [
          "Place a training cone with a reward/object inside it on the last terrain mat.",
          "Take the child to the starting point and provide a cane appropriate to their height.",
          "Introduce the index-finger grip and demonstrate a gentle left-to-right touch-and-drag movement of the cane.",
          "Use the left and right edges of the mat as reference points. Ask the child to move the cane from slightly outside one edge of the mat to slightly outside the other edge.",
          "Help the child notice the change in tactile and/or sound feedback as the cane moves between the floor and mat. Explain that these changes can help them recognise the mat boundaries.",
          "Ask the child to move forward while maintaining a consistent left-to-right arc. Encourage them to use the mat boundaries to stay oriented towards the centre of the path.",
          "As the child approaches the final mat, ask them to stop immediately when the cane contacts an obstacle.",
          "Ask the child to keep the cane in contact with or directed towards the obstacle and carefully approach it until they are close enough to locate it.",
          "Once close, ask the child to squat or bend safely, keeping the cane as a reference. Guide their free hand along the cane towards the tip to locate the obstacle.",
          "Ask the child to identify and retrieve the object from the training cone.",
          "Help the child return to a standing position, re-establish their cane position and left-to-right arc, and continue moving."
        ],
        facilitatorNotes: [
          "Introduce the grip and cane movement before starting the terrain path.",
          "Initially provide verbal or physical guidance as required, then gradually reduce assistance.",
          "Encourage the child to notice differences in sound and tactile feedback from each terrain.",
          "Use the mat boundaries as learning references but encourage the child to gradually rely on cane feedback rather than continuous facilitator instructions.",
          "Avoid forcing an exact arc width. The aim is a controlled and consistent arc that provides useful coverage.",
          "When an obstacle is detected, encourage the child to stop first and gather information before approaching it.",
          "Ensure the terrain path and surrounding area are clear of unintended hazards.",
          "Adapt squatting, bending, grip, or retrieval methods according to the child’s physical abilities."
        ],
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated.
        /* HINDI REMOVED 2026-09-01. The previous hi[] was 1:1 with the OLD
           video-deduced steps; the final SOP replaced them, so those lines now
           describe a different activity. Machine translation is not used for
           teacher-facing text, so this waits on the content team. Any stale
           audio/<id>_hi.mp3 on disk must be DELETED - build.sh mirrors audio/
           and the app would happily narrate the old steps over the new ones. */
        audioFile: "",
        videoFile: "demo-terrain-walk.mp4",
        dataFields: [
          { id: "changes", label: "Terrain changes identified correctly", type: "fraction" },
          { id: "bounds", label: "Ability to use mat boundaries for orientation", type: "rating" },
          { id: "arc", label: "Ability to maintain left-to-right cane movement", type: "rating" },
          { id: "assist", label: "Level of overall assistance required", type: "choice", options: ["None", "Verbal Hint", "Physical Assistance"] },
          { id: "notes", label: "Additional observations/comments", type: "teacherNotes" }
        ]
      },
      {
        id: "terrain-obstacle",
        name: "Find the Obstacles",
        purpose: "To help children independently apply their terrain identification, cane movement, orientation, and obstacle detection skills to locate and retrieve objects along a terrain path.",
        withCane: true,
        // SOP as delivered by the content team (SOP_CC_App.docx, FINAL, 1 Sep 2026).
        // 'Steps' and 'Facilitator Notes' are their sections, transcribed.
        // Do not silently re-edit either - send changes back to the content team.
        meta: {
          resources: "Terrain Mats, Cane with Roller Tip (as per height), small training cones, reward (candy), 1 Facilitator",
          type: "Individual",
          age: "08-12",
          time: "10 minutes"
        },
        sop: [
          "Pre-requisite: The child should have completed Terrain Identification with Cane and practised detecting, approaching, and locating an obstacle before attempting this activity.",
          "Place one obstacle with a small reward on each terrain along the path.",
          "Take the child to the starting point and provide a cane appropriate to their height.",
          "Explain that rewards are placed, one on each mat, along the path, and they need to find them using their cane.",
          "Ask the child to move independently using the previously practised left-to-right cane movement. Remind or guide them only if they are unable to maintain the movement.",
          "Encourage the child to notice terrain changes and boundaries and use this feedback to stay oriented on the path.",
          "When the cane contacts an obstacle, allow the child to stop, locate, approach, and retrieve the reward independently, using the techniques practised earlier.",
          "If the child misses an obstacle, bring them back to the beginning of that mat and allow them to try again. Give a verbal hint or guidance only if required.",
          "If the terrain path includes turns, first allow the child to identify and negotiate the turn. Provide directional guidance if needed.",
          "After retrieving each reward, ask the child to re-orient to the path before continuing.",
          "Continue until the child has explored the complete terrain path and found all the rewards."
        ],
        facilitatorNotes: [
          "Conduct this activity only after the child has practised the terrain path with a cane.",
          "Give the child enough time to problem-solve independently before providing assistance.",
          "Avoid immediately correcting cane movement, direction, or orientation. Step in only when the child is stuck or there is a safety concern.",
          "Use verbal hints before providing physical assistance.",
          "Observe whether the child independently uses previously learnt skills such as terrain feedback, mat boundaries, cane arc, obstacle detection, and re-orientation.",
          "Do not guide the child towards the rewards through unintended cues.",
          "Keep the complete path clear of unintended hazards."
        ],
        // DRAFT translation (machine-drafted 2026-07-14) — content team must
        // verify wording BEFORE pilot audio is generated.
        /* HINDI REMOVED 2026-09-01. The previous hi[] was 1:1 with the OLD
           video-deduced steps; the final SOP replaced them, so those lines now
           describe a different activity. Machine translation is not used for
           teacher-facing text, so this waits on the content team. Any stale
           audio/<id>_hi.mp3 on disk must be DELETED - build.sh mirrors audio/
           and the app would happily narrate the old steps over the new ones. */
        audioFile: "",
        videoFile: "",
        dataFields: [
          { id: "found", label: "Obstacles/rewards found independently", type: "fraction" },
          { id: "bounds", label: "Ability to use mat boundaries for orientation", type: "rating" },
          { id: "arc", label: "Ability to maintain left-to-right cane movement", type: "rating" },
          { id: "assist", label: "Level of overall assistance required", type: "choice", options: ["None", "Verbal Hint", "Physical Assistance"] },
          { id: "reorient", label: "Ability to re-orient after collecting the reward", type: "choice", options: ["Independent", "With Support", "Unable"] },
          { id: "notes", label: "Additional observations/comments", type: "teacherNotes" }
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