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
        withCane: false,
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
    description: "Near/Far of sound, simple to narrative, and the same concept repeated with the cane (comparative step count).",
    activities: [
      {
        id: "snddir-clap",
        name: "Clapping Activity",
        withCane: false,
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
        soundboard: true,
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
        soundboard: true,
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
        soundboard: true,
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
  /* ----- Animals ----- */
  { file: "sounds/dog.mp3",            label: "Dog",          group: "Animals" },
  { file: "sounds/cat.mp3",            label: "Cat",          group: "Animals" },
  { file: "sounds/cow.mp3",            label: "Cow",          group: "Animals" },
  { file: "sounds/chicken.mp3",        label: "Chicken",      group: "Animals" },
  { file: "sounds/cuckoo.mp3",         label: "Cuckoo",       group: "Animals" },

  /* ----- Household ----- */
  { file: "sounds/doorbell.mp3",       label: "Doorbell",     group: "Household" },
  { file: "sounds/door.mp3",           label: "Door",         group: "Household" },
  { file: "sounds/clock.mp3",          label: "Clock",        group: "Household" },
  { file: "sounds/keys.mp3",           label: "Keys",         group: "Household" },
  { file: "sounds/flush.mp3",          label: "Toilet flush", group: "Household" },
  { file: "sounds/glass-breaking.mp3", label: "Glass break",  group: "Household" },
  { file: "sounds/chewing.mp3",        label: "Chewing",      group: "Household" },
  { file: "sounds/burp.mp3",           label: "Burp",         group: "Household" },

  /* ----- Traffic & Outdoors ----- */
  { file: "sounds/horn.mp3",           label: "Horn",         group: "Traffic & Outdoors" },
  { file: "sounds/police-siren.mp3",   label: "Police siren", group: "Traffic & Outdoors" },
  { file: "sounds/bike-driving.mp3",   label: "Bike",         group: "Traffic & Outdoors" },
  { file: "sounds/bicycle-bell.mp3",   label: "Bicycle bell", group: "Traffic & Outdoors" },
  { file: "sounds/rain.mp3",           label: "Rain",         group: "Traffic & Outdoors" },
  { file: "sounds/fireworks.mp3",      label: "Fireworks",    group: "Traffic & Outdoors" },

  /* ----- Instruments ----- */
  { file: "sounds/tabla.mp3",          label: "Tabla",        group: "Instruments" },
];