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
   meta          Optional. The header block of the SOP sheet, shown to the
                 teacher ABOVE the steps under "Before you start". Any of
                 resources / type / age / time; leave a key out and that line
                 simply does not appear. Nothing breaks if an activity has no
                 meta at all.
   dataFields    What the teacher records after running the activity. Each field
                 has a "type":
                    "count"        → a number box (e.g. number of steps)
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
          age: "8–12 years",
          time: "15 minutes"
        },
        sop: [
          "Ask the children to stand in a line facing the facilitator, about an arm's length apart.",
          "Give simple commands from the app — Left, Right, Jump, Clap, Forward, Backwards, Stop, Turn Around.",
          "Ask the children to perform the action for each command.",
          "Start with one or two warm-up rounds so the children understand the activity.",
          "After the warm-up, run at least five rounds, using different commands and changing their order.",
          "Once the children are comfortable, use Surprise me twice to give commands in a random order.",
          "If a child cannot tell left from right, go back to raising the left and right hand, then check with the left ear, right ear, left knee, right shoulder."
        ],
        facilitatorNote: "During the warm-up use a fixed sequence: Turn Left, Turn Right, Jump-Jump, Clap-Clap. Give one command at a time and wait for the children to finish the action before the next one. Adapt the activity for a child with an additional disability — skip Jump if the child has difficulty moving their legs. Use the regional language if a child does not understand the command in English. For a child who needs more support, demonstrate the action or give physical guidance before asking them to respond independently.",
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
            "बच्चों को एक पंक्ति में, फ़ैसिलिटेटर की ओर मुँह करके, लगभग एक हाथ की दूरी पर खड़ा करें।",
            "ऐप से सरल कमांड दें — बाएँ, दाएँ, कूदो, ताली, आगे, पीछे, रुको और पीछे मुड़ो।",
            "हर कमांड के अनुसार बच्चों से वही क्रिया करने को कहें।",
            "पहले एक या दो वार्म-अप राउंड कराएँ ताकि बच्चे गतिविधि समझ सकें।",
            "वार्म-अप के बाद कम से कम पाँच राउंड कराएँ, हर बार अलग कमांड और अलग क्रम का उपयोग करते हुए।",
            "जब बच्चे सहज हो जाएँ, तो Surprise me का दो बार उपयोग करके कमांड यादृच्छिक क्रम में दें।",
            "यदि कोई बच्चा बाएँ और दाएँ में अंतर न कर पाए, तो पहले उससे बायाँ और दायाँ हाथ उठवाएँ, फिर बायाँ कान, दायाँ कान, बायाँ घुटना और दायाँ कंधा पहचानने को कहें।"
          ]
        },
        audioFile: "",
        videoFile: "demo-direction-basic.mp4",
        dataFields: [
          // The SOP's "Record a Result": a rating before and a rating after.
          // Both use the standing mastery scale so this activity is read the
          // same way as every other. DECLARATION ORDER MATTERS — the last
          // scored field is the one the derived Achieved column reads, so
          // 'after' must stay below 'before'.
          { id: "sense_before", label: "Direction sense before", type: "mastery" },
          { id: "sense_after",  label: "Direction sense after",  type: "mastery" },
          { id: "notes",        label: "Additional observations", type: "teacherNotes" }
        ]
      },
      {
        id: "dir-advanced-commands",
        name: "Advanced",
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
          "Introduce the four basic directions — North, South, East and West.",
          "Use the instructions from the app and ask the child to identify or point towards the given direction.",
          "Once the child is comfortable, introduce North-East, North-West, South-East and South-West.",
          "Run one or two practice rounds before recording responses.",
          "Run at least five trials with each child, using different directions in a mixed order.",
          "Use Surprise me to check whether the child can identify directions in a random order."
        ],
        facilitatorNote: "Make sure the children understand North, South, East and West before introducing the diagonal directions. Relate the directions to familiar surroundings where it helps — for example, \"the main gate is towards the North\". Use a consistent reference point throughout the activity. Use the regional language if the child does not understand the direction names in English. If a child cannot identify a direction, give a hint or use a familiar landmark to reinforce the concept.",
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
            "बच्चे को खुली जगह में फ़ैसिलिटेटर की ओर मुँह करके खड़ा करें।",
            "चार मुख्य दिशाएँ बताएँ — उत्तर, दक्षिण, पूर्व और पश्चिम।",
            "ऐप के निर्देशों का उपयोग करें और बच्चे से दी गई दिशा पहचानने या उस ओर इशारा करने को कहें।",
            "जब बच्चा सहज हो जाए, तो उत्तर-पूर्व, उत्तर-पश्चिम, दक्षिण-पूर्व और दक्षिण-पश्चिम बताएँ।",
            "प्रतिक्रियाएँ दर्ज करने से पहले एक या दो अभ्यास राउंड कराएँ।",
            "हर बच्चे के साथ कम से कम पाँच प्रयास कराएँ, हर बार अलग दिशाएँ मिश्रित क्रम में दें।",
            "यह जाँचने के लिए कि बच्चा यादृच्छिक क्रम में दिशाएँ पहचान पाता है या नहीं, Surprise me का उपयोग करें।"
          ]
        },
        audioFile: "",
        // Same drill format as Basic — reusing its demo until a cardinal-
        // specific video arrives; just swap the filename then.
        videoFile: "demo-direction-basic.mp4",
        dataFields: [
          // The SOP asks for trials and correct responses and makes NO
          // judgment call, so there is deliberately no mastery field here.
          // Records from this activity carry no Achieved column at all, rather
          // than a "No" nobody observed.
          { id: "trials",  label: "Trials conducted",        type: "count" },
          { id: "correct", label: "Correct responses",       type: "count" },
          { id: "notes",   label: "Additional observations", type: "teacherNotes" }
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
        name: "Which Sound? (Identification)",
        withCane: false,
        soundboard: true,
        // SOP as delivered by the content team (SOP_CC_App.docx, 24 Aug 2026).
        meta: {
          resources: "Speaker and mobile",
          type: "Individual (children can be seated as a group)",
          age: "8–12 years",
          time: "10 minutes"
        },
        sop: [
          "Ask the children to sit beside each other, facing the facilitator.",
          "Play one sound at a time from the app, bringing the speaker close to each child individually.",
          "Ask the child to identify the sound.",
          "Confirm the child's response before moving to the next sound.",
          "Play two different sounds for each child."
        ],
        facilitatorNote: "Adjust the speaker distance and the volume according to the surrounding environment. Tell the children to wait for their turn and not interrupt another child's response. If a child cannot identify a sound, give a simple hint rather than revealing the answer directly.",
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
          // "Overall: Confident / Required Hints" is the content team's own
          // wording. It is a `choice` field — the options live here, so the
          // scale can be reworded without a coder. achievedWhen names the
          // option that means the child managed it unaided, which is what the
          // derived Achieved column reads.
          { id: "trials",  label: "Trials conducted",  type: "count" },
          { id: "correct", label: "Correct responses", type: "count" },
          { id: "overall", label: "Overall", type: "choice",
            options: ["Confident", "Required hints"], achievedWhen: "Confident" },
          { id: "notes",   label: "Additional observations", type: "teacherNotes" }
        ]
      },
      {
        id: "sound-source",
        name: "Source of Sound? (Localization)",
        withCane: false,
        soundboard: true,
        // SOP as delivered by the content team (SOP_CC_App.docx, 24 Aug 2026).
        // Note this one needs TWO adults — it is the only activity on the board
        // that does, and a teacher running the app alone cannot do it.
        meta: {
          resources: "Speaker, mobile and two people",
          type: "Individual (children can be seated as a group)",
          age: "8–12 years",
          time: "10 minutes"
        },
        sop: [
          "Ask the child to stand facing Person A, the facilitator. Person B stands with the speaker at a suitable distance from the child, in one of four directions — front, back, left or right.",
          "Person B plays a sound from the app while Person A asks the child to identify the sound, and then the direction it is coming from.",
          "Repeat the activity with a different child, changing the sound and the direction.",
          "Run at least three trials with each child to assess their ability to localise sounds."
        ],
        facilitatorNote: "Adjust the speaker distance and volume according to the environment and to how clearly the child can hear the sound. Ask the children to wait for their turn and not interrupt another child's response. If a child cannot identify the sound or the direction, give a simple hint rather than revealing the answer. Person B should remain as quiet as possible while moving with the speaker — avoid footsteps and other movement cues, and if it is appropriate and safe, Person B may remove their footwear to move more quietly.",
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
          { id: "trials",  label: "Trials conducted",  type: "count" },
          { id: "correct", label: "Correct responses", type: "count" },
          { id: "overall", label: "Overall", type: "choice",
            options: ["Confident", "Required hints"], achievedWhen: "Confident" },
          { id: "notes",   label: "Additional observations", type: "teacherNotes" }
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
        withCane: false,
        soundboard: true,
        // SOP as delivered by the content team (SOP.docx, 25 Aug 2026).
        // Steps and Facilitator Notes are their sections; the Record a Result
        // fields below are their list. Do not silently re-edit either — send
        // changes back to the content team.
        meta: {
          resources: "Speaker, mobile and 2 people",
          type: "Individual",
          age: "8–12 years",
          time: "5 minutes"
        },
        sop: [
          "Ask the child and Person A to stand in an open space. Person B stands in one of the four directions, at least 5 m away, and plays a sound using the speaker.",
          "Ask the child to identify the direction of the sound and orient their whole body towards it.",
          "Ask: \"Is the sound close enough for you to touch?\" The child should answer without moving.",
          "Ask the child to try reaching towards the sound source without moving their feet.",
          "Person B moves 2–3 steps closer while remaining outside the child's reach. Repeat the question and ask the child to reach towards the sound source.",
          "Person B then moves to a position just within the child's reach. Ask the same question, then allow the child to try to reach the sound source.",
          "Repeat the activity if the child needs more practice to understand the difference between near and far."
        ],
        facilitatorNote: "Adjust the speaker distance and sound volume according to the surrounding environment. Use familiar sounds from the app to create a simple context. For example, play a dog sound and ask, \"Is the dog near enough for you to touch?\" Person B should remain as quiet as possible while moving with the speaker. Avoid footsteps and other movement cues. If safe and appropriate, Person B may remove footwear to minimise sound. Ensure the child remains in a safe, clear space while reaching.",
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
          { id: "oriented", label: "Correctly oriented towards the sound", type: "choice",
            options: ["Yes", "No"], achievedWhen: "Yes" },
          { id: "nearfar",  label: "Understanding of near and far", type: "rating" },
          { id: "notes",    label: "Additional observations", type: "teacherNotes" }
        ]
      },
      {
        id: "snddir-nearfar-cane",
        name: "Near-Far with Cane",
        withCane: true,
        soundboard: true,
        // SOP as delivered by the content team (SOP.docx, 25 Aug 2026).
        // Steps and Facilitator Notes are their sections; the Record a Result
        // fields below are their list. Do not silently re-edit either — send
        // changes back to the content team.
        meta: {
          resources: "Speaker, mobile, cane (as per the child's height) and 2 people",
          type: "Individual",
          age: "8–12 years",
          time: "10 minutes"
        },
        sop: [
          "Ask the child and Person A to stand in an open, clear space. Person B stands facing the child, at least 5 m away, and plays a sound using the speaker.",
          "Give the child a cane appropriate to their height. Ask: \"Is the sound close enough for you to touch with the cane?\" The child should answer without moving.",
          "Ask the child to reach towards the sound source using the cane, without moving their feet. Provide guidance on holding the cane if needed.",
          "Person B moves 2–3 steps closer, while remaining outside the child's cane reach. Repeat the question and ask the child to reach towards the sound with the cane.",
          "Person B moves to a position just within the child's cane reach. Ask the same question and allow the child to touch the sound source with the cane.",
          "Once the child is able to reach the source, explain that the cane extends their reach beyond their hand.",
          "To demonstrate this difference, keep the cane tip at the sound source. Ask the child to estimate how many steps they would need to take to reach the source without the cane. Discuss how the cane helped them reach the source from a greater distance.",
          "Repeat the activity if the child needs more practice to understand the difference between near and far and how the cane extends their reach."
        ],
        facilitatorNote: "Adjust the speaker distance and sound volume according to the surrounding environment. Ensure the cane length is appropriate for the child's height (height × 0.75). Use familiar sounds from the app to create a simple context. For example, play a dog sound and ask, \"Is the dog near enough for you to touch with the cane?\" Person B should remain as quiet as possible while moving with the speaker. Avoid footsteps and other movement cues. If safe and appropriate, Person B may remove footwear to minimise sound. Ensure the child has sufficient clear space and is supervised while using the cane. Do not ask the child to walk towards the sound source until the facilitator confirms that the path is clear and safe.",
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
          { id: "nearfar",   label: "Understanding of near and far", type: "rating" },
          { id: "canereach", label: "Understanding of cane-extended reach", type: "rating" },
          { id: "notes",     label: "Additional observations", type: "teacherNotes" }
        ]
      },
      {
        id: "snddir-steps-solo",
        name: "Count Steps",
        withCane: false,
        soundboard: true,
        // SOP as delivered by the content team (SOP.docx, 25 Aug 2026).
        // Steps and Facilitator Notes are their sections; the Record a Result
        // fields below are their list. Do not silently re-edit either — send
        // changes back to the content team.
        meta: {
          resources: "Phone and speaker",
          type: "Individual",
          age: "8–12 years",
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
        facilitatorNote: "Adjust the speaker distance and sound volume according to the surrounding environment. Encourage the child to walk at their natural pace and take comfortable, consistent steps. Ask the child to maintain a similar step length throughout the activity rather than deliberately taking shorter or longer steps to match the estimate. Encourage the child to compare their estimated and actual number of steps after each round. Ensure the walking path is clear and safe.",
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
          { id: "rounds",   label: "Rounds conducted", type: "count" },
          { id: "estimate", label: "Understanding of distance estimation", type: "rating" },
          { id: "notes",    label: "Additional observations", type: "teacherNotes" }
        ]
      },
      {
        id: "snddir-steps-group",
        name: "Count Steps (Group)",
        withCane: false,
        soundboard: true,
        group: true,
        // SOP as delivered by the content team (SOP.docx, 25 Aug 2026).
        // Steps and Facilitator Notes are their sections; the Record a Result
        // fields below are their list. Do not silently re-edit either — send
        // changes back to the content team.
        meta: {
          resources: "Phone, speaker and 2 people",
          type: "Group",
          age: "8–12 years",
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
        facilitatorNote: "Ensure all children are standing in a clear and safe space. Ask the child to keep the sound source in the same position until their friend reaches them. Encourage the child to walk naturally and maintain a similar step length throughout. After each round, discuss the difference between the estimated and actual number of steps. Adjust the distance between children according to the available space and the children's abilities.",
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
          { id: "rounds",   label: "Rounds conducted", type: "count" },
          { id: "estimate", label: "Understanding of distance estimation", type: "rating" },
          { id: "notes",    label: "Additional observations", type: "teacherNotes" }
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
    description: "Travel in a straight line toward a sound played on the app — first by ear, then estimating and counting the steps, then with the cane and a push toy for a positive start, then with the cane alone.",
    /* GROUP NOTE: `group: true` on Counting Steps — Group marks a whole-group
       activity — the app skips the child picker and saves ONE result for the
       group. Copy that line onto any activity that is scored as a group,
       delete it for per-child scoring. (Both Counting Steps drills moved here
       from Sound + Direction on 2026-08-24; their ids are unchanged, so saved
       records follow them.) */
    help: [
      "Start Without Cane — the child walks to the sound by ear. This is the baseline.",
      "Counting Steps: run the Group drill first (one shared result — no child is selected), then score each child in Individual.",
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