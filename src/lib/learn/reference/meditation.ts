import type { ReferenceEntry } from "../types";

/**
 * Quick-reference meditation lookup. Practical, try-it-now techniques plus a few
 * core concepts. Meditation is well-studied, so evidence-forward benefits
 * (stress, attention, wellbeing) are noted without overclaiming.
 */

function med(e: Omit<ReferenceEntry, "domain">): ReferenceEntry {
  return { domain: "meditation", ...e };
}

export const meditationReference: ReferenceEntry[] = [
  // ───────────────────────── Techniques ─────────────────────────
  med({
    id: "med-focused-attention",
    name: "Focused Attention (Breath)",
    aka: ["breath awareness", "anapana", "concentration meditation"],
    category: "Technique",
    summary:
      "The foundational practice: rest your attention on the natural breath, and gently bring it back each time it wanders. Builds concentration and is the entry point to nearly every tradition.",
    fields: [
      { label: "How to", value: "Sit comfortably, close your eyes, and feel the breath where it's clearest — nostrils, chest, or belly. When you notice you've drifted, return to the breath without judgment. That returning is the rep." },
      { label: "Good for", value: "Building concentration, calming a busy mind, a reliable everyday anchor." },
      { label: "Try it for", value: "5–10 minutes to start; 20+ once it's a habit." },
      { label: "Style", value: "Concentrative / single-pointed." },
    ],
    tags: ["breath", "beginner", "concentration", "anchor", "everyday"],
  }),
  med({
    id: "med-body-scan",
    name: "Body Scan",
    category: "Technique",
    summary:
      "Move your attention slowly through the body, part by part, noticing sensation without trying to change it. A cornerstone of mindfulness-based programs and a beautiful way to unwind tension.",
    fields: [
      { label: "How to", value: "Lying down or seated, bring attention to the toes, then travel upward — feet, legs, torso, arms, neck, face. Linger a few breaths at each area, noticing warmth, tingling, pressure, or nothing at all." },
      { label: "Good for", value: "Releasing physical tension, reconnecting with the body, winding down for sleep." },
      { label: "Try it for", value: "10–30 minutes; a short version hits the major regions in 5." },
      { label: "Style", value: "Mindfulness / somatic awareness." },
    ],
    tags: ["body", "relaxation", "sleep", "mbsr", "somatic"],
  }),
  med({
    id: "med-loving-kindness",
    name: "Loving-Kindness (Metta)",
    aka: ["metta", "metta bhavana"],
    category: "Technique",
    summary:
      "Cultivate warmth by silently offering goodwill — to yourself, loved ones, neutral people, difficult people, and all beings. Research links it to more positive emotion and social connection.",
    fields: [
      { label: "How to", value: "Repeat gentle phrases like 'May you be happy, may you be healthy, may you be safe, may you live with ease.' Start with yourself, then widen the circle outward person by person." },
      { label: "Good for", value: "Self-compassion, warmth toward others, softening resentment, lifting mood." },
      { label: "Try it for", value: "10–15 minutes." },
      { label: "Style", value: "Generative / heart practice." },
    ],
    tags: ["compassion", "kindness", "metta", "heart", "self-compassion", "buddhist"],
  }),
  med({
    id: "med-open-monitoring",
    name: "Open Monitoring (Mindfulness)",
    aka: ["choiceless awareness", "open awareness"],
    category: "Technique",
    summary:
      "Instead of fixing on one object, rest in spacious awareness and watch whatever arises — sounds, sensations, thoughts, feelings — letting each come and go without chasing or pushing away.",
    fields: [
      { label: "How to", value: "Settle the attention, then drop the single anchor and simply notice whatever is most prominent moment to moment. Observe it, let it pass, and stay open for the next thing." },
      { label: "Good for", value: "Meta-awareness, less reactivity, seeing thoughts as 'just thoughts.'" },
      { label: "Try it for", value: "10–20 minutes — easier once focused attention is steady." },
      { label: "Style", value: "Mindfulness / receptive awareness." },
    ],
    tags: ["mindfulness", "awareness", "thoughts", "non-reactive", "intermediate"],
  }),
  med({
    id: "med-mantra",
    name: "Mantra Meditation",
    aka: ["japa"],
    category: "Technique",
    summary:
      "Repeat a word, sound, or phrase silently or aloud to occupy and settle the mind. The repetition becomes the anchor, gently crowding out mental chatter.",
    fields: [
      { label: "How to", value: "Choose a mantra ('peace,' 'so-hum,' 'Om,' or any meaningful word). Repeat it at a comfortable pace, in time with the breath if you like. When the mind wanders, return to the sound." },
      { label: "Good for", value: "Quieting mental chatter, a portable focus, devotional practice." },
      { label: "Try it for", value: "10–20 minutes." },
      { label: "Style", value: "Concentrative / sound-based." },
    ],
    tags: ["mantra", "sound", "repetition", "japa", "focus"],
  }),
  med({
    id: "med-transcendental-style",
    name: "Transcendental-Style Meditation",
    aka: ["TM-style", "effortless mantra"],
    category: "Technique",
    summary:
      "A gentle, effortless mantra practice done twice daily. The instruction is to let the mantra come and go lightly — no forcing, no concentrating — allowing the mind to settle on its own.",
    fields: [
      { label: "How to", value: "Sit comfortably with eyes closed and silently repeat a chosen mantra in an easy, relaxed way. If thoughts come, gently favor the mantra again without effort. Don't try to control anything." },
      { label: "Good for", value: "Effortless deep rest, stress reduction, a structured twice-a-day rhythm." },
      { label: "Try it for", value: "15–20 minutes, twice a day (morning and evening)." },
      { label: "Style", value: "Effortless / automatic self-transcending." },
    ],
    tags: ["mantra", "tm", "effortless", "twice daily", "rest"],
  }),
  med({
    id: "med-visualization",
    name: "Visualization",
    aka: ["imagery meditation"],
    category: "Technique",
    summary:
      "Use the mind's eye to hold a calming or meaningful image — a peaceful place, a healing light, a goal already achieved. Engages imagination to shift mood and state.",
    fields: [
      { label: "How to", value: "Close your eyes and build a scene in vivid detail — what you see, hear, smell, and feel. Stay with it, letting the senses fill in. Return to the image whenever the mind drifts." },
      { label: "Good for", value: "Calming, motivation, rehearsing a goal, cultivating a desired feeling." },
      { label: "Try it for", value: "5–15 minutes." },
      { label: "Style", value: "Imaginative / generative." },
    ],
    tags: ["visualization", "imagery", "imagination", "calm", "rehearsal"],
  }),
  med({
    id: "med-walking",
    name: "Walking Meditation",
    aka: ["kinhin"],
    category: "Technique",
    summary:
      "Mindfulness in motion: walk slowly and deliberately, anchoring attention in the sensations of each step. Perfect when sitting feels restless or sleepy.",
    fields: [
      { label: "How to", value: "Walk slowly along a short path. Feel the lift, swing, and placing of each foot, plus the contact with the ground. When the mind wanders, return to the feet. No destination — the walking is the point." },
      { label: "Good for", value: "Restless energy, breaking up long sits, bringing practice into the body and the day." },
      { label: "Try it for", value: "10–20 minutes, or any walk you slow down." },
      { label: "Style", value: "Mindfulness in motion." },
    ],
    tags: ["walking", "movement", "kinhin", "outdoors", "active"],
  }),
  med({
    id: "med-breath-counting",
    name: "Breath Counting",
    category: "Technique",
    summary:
      "A simple, self-checking concentration practice: count breaths up to ten, then start over. Losing count shows you the mind wandered — and starting again is the training.",
    fields: [
      { label: "How to", value: "Breathe naturally. Count 'one' on the first exhale, 'two' on the next, up to ten, then return to one. If you lose track or pass ten, gently begin again at one." },
      { label: "Good for", value: "Beginners, scattered minds, building steady concentration with built-in feedback." },
      { label: "Try it for", value: "5–10 minutes." },
      { label: "Style", value: "Concentrative." },
    ],
    tags: ["breath", "counting", "beginner", "concentration", "zen"],
  }),
  med({
    id: "med-noting",
    name: "Noting / Labeling",
    aka: ["mental noting", "labeling"],
    category: "Technique",
    summary:
      "Apply a soft, one-word label to whatever the mind is doing — 'thinking,' 'hearing,' 'planning,' 'feeling.' Naming experience creates a little space and loosens its grip.",
    fields: [
      { label: "How to", value: "As you sit, quietly note each experience with a single word the moment you notice it, then let it go. Keep the labels light and unhurried — the noticing matters more than precise naming." },
      { label: "Good for", value: "Untangling from thoughts, recognizing patterns, strengthening mindfulness." },
      { label: "Try it for", value: "10–20 minutes." },
      { label: "Style", value: "Mindfulness / insight." },
    ],
    tags: ["noting", "labeling", "mindfulness", "insight", "vipassana"],
  }),
  med({
    id: "med-yoga-nidra",
    name: "Yoga Nidra",
    aka: ["yogic sleep"],
    category: "Technique",
    summary:
      "A guided, lying-down practice often called 'yogic sleep' — a systematic journey through body, breath, and awareness that brings deep relaxation while you stay just barely awake.",
    fields: [
      { label: "How to", value: "Lie down and follow a recording. You'll set an intention, rotate awareness through the body, and rest in spacious stillness. The aim is to stay on the edge of sleep, fully relaxed but aware." },
      { label: "Good for", value: "Deep rest, stress relief, sleep support, recovery on tired days." },
      { label: "Try it for", value: "20–45 minutes — usually guided." },
      { label: "Style", value: "Guided deep relaxation." },
    ],
    tags: ["yoga nidra", "relaxation", "sleep", "rest", "guided", "lying down"],
  }),
  med({
    id: "med-progressive-muscle-relaxation",
    name: "Progressive Muscle Relaxation",
    aka: ["PMR"],
    category: "Technique",
    summary:
      "Tense and then release each muscle group in turn to discharge physical tension and teach the body the felt difference between tight and relaxed. A well-established relaxation tool.",
    fields: [
      { label: "How to", value: "Working from feet to head, tense one muscle group firmly for about 5 seconds, then release and notice the relaxation for 10–15 seconds before moving on. Keep the breath easy throughout." },
      { label: "Good for", value: "Bodily tension, stress, pre-sleep wind-down, noticing where you hold stress." },
      { label: "Try it for", value: "10–20 minutes." },
      { label: "Style", value: "Somatic relaxation." },
    ],
    tags: ["pmr", "relaxation", "tension", "body", "sleep", "stress"],
  }),
  med({
    id: "med-box-breathing",
    name: "Box Breathing",
    aka: ["square breathing", "four-square breathing"],
    category: "Breathwork",
    summary:
      "A steadying four-count pattern — inhale, hold, exhale, hold — that brings the nervous system back to baseline. Simple, discreet, and effective in high-pressure moments.",
    fields: [
      { label: "How to", value: "Inhale for 4 counts, hold for 4, exhale for 4, hold empty for 4. Repeat the 'box.' Picture tracing the four sides of a square as you go." },
      { label: "Good for", value: "Acute stress, steadying nerves, focus before a demanding task." },
      { label: "Try it for", value: "1–5 minutes, or a few rounds anytime." },
      { label: "Style", value: "Breathwork / regulation." },
    ],
    tags: ["breathwork", "box", "square", "stress", "calm", "quick"],
  }),
  med({
    id: "med-4-7-8-breathing",
    name: "4-7-8 Breathing",
    aka: ["relaxing breath"],
    category: "Breathwork",
    summary:
      "A relaxing breath with a long exhale: inhale 4, hold 7, exhale 8. The extended out-breath nudges the body toward rest and is a popular tool for drifting off to sleep.",
    fields: [
      { label: "How to", value: "Exhale fully. Inhale quietly through the nose for 4 counts, hold for 7, then exhale through the mouth for 8 with a soft whoosh. Repeat for about four cycles." },
      { label: "Good for", value: "Falling asleep, calming quickly, easing anxious moments." },
      { label: "Try it for", value: "About 4 cycles; build up gently." },
      { label: "Style", value: "Breathwork / regulation." },
      { label: "Go gently", value: "If you feel lightheaded, return to normal breathing. Keep counts comfortable rather than forced.", tone: "safety" },
    ],
    tags: ["breathwork", "478", "sleep", "calm", "anxiety", "quick"],
  }),
  med({
    id: "med-alternate-nostril",
    name: "Alternate-Nostril Breathing",
    aka: ["nadi shodhana", "anuloma viloma"],
    category: "Breathwork",
    summary:
      "A yogic balancing breath in which you alternate the nostril you breathe through, traditionally said to balance the body's energy channels and bring a settled, even-minded calm.",
    fields: [
      { label: "How to", value: "Close the right nostril with the thumb, inhale left; close left, exhale right; inhale right; close right, exhale left. That's one round. Keep the breath smooth and unhurried." },
      { label: "Good for", value: "Calm focus, a sense of balance, settling before meditation." },
      { label: "Try it for", value: "5–10 rounds, around 5 minutes." },
      { label: "Style", value: "Pranayama / breathwork." },
    ],
    tags: ["breathwork", "nadi shodhana", "pranayama", "yoga", "balance", "calm"],
  }),
  med({
    id: "med-zazen",
    name: "Zazen (Zen Sitting)",
    aka: ["zen meditation", "shikantaza"],
    category: "Tradition",
    summary:
      "The seated heart of Zen Buddhism. In its most open form, 'just sitting' (shikantaza), you sit upright and alert with no goal beyond present, wakeful awareness itself.",
    fields: [
      { label: "How to", value: "Sit upright and stable, eyes half-open and softly lowered, hands forming an oval in the lap. Stay present and awake — either following the breath or 'just sitting,' letting thoughts pass like clouds." },
      { label: "Good for", value: "Stillness, presence, disciplined sitting, a path with deep tradition." },
      { label: "Try it for", value: "15–40 minutes; traditionally in periods of ~25–30." },
      { label: "Style", value: "Zen Buddhist sitting." },
    ],
    tags: ["zen", "zazen", "shikantaza", "buddhist", "sitting", "tradition"],
  }),
  med({
    id: "med-vipassana",
    name: "Vipassana (Insight)",
    aka: ["insight meditation"],
    category: "Tradition",
    summary:
      "A Buddhist practice of clear, investigative seeing — observing sensations, thoughts, and feelings as they arise and pass to directly perceive their changing, impermanent nature.",
    fields: [
      { label: "How to", value: "Steady the mind on the breath, then observe experience with calm, precise attention — often noting sensations as they appear and dissolve. Watch how everything constantly changes, without clinging or aversion." },
      { label: "Good for", value: "Insight into the mind, reduced reactivity, deep self-understanding." },
      { label: "Try it for", value: "30–60 minutes; often taught in 10-day retreats." },
      { label: "Style", value: "Insight / Theravada Buddhist." },
      { label: "Go gently", value: "Intensive insight practice can surface strong emotions and old memories. Pace yourself, and lean on a teacher or support if things feel difficult.", tone: "safety" },
    ],
    tags: ["vipassana", "insight", "buddhist", "impermanence", "retreat", "advanced"],
  }),
  med({
    id: "med-samatha",
    name: "Samatha (Calm Abiding)",
    aka: ["shamatha", "tranquility meditation"],
    category: "Tradition",
    summary:
      "The cultivation of calm, stable concentration — 'calm abiding.' By settling the mind on a single object until it rests there effortlessly, samatha builds the tranquil foundation for insight.",
    fields: [
      { label: "How to", value: "Choose one object (often the breath) and rest attention on it continuously, repeatedly and gently returning whenever it slips. Over time the mind grows quieter, steadier, and more pliable." },
      { label: "Good for", value: "Deep concentration, inner stillness, preparing the mind for insight work." },
      { label: "Try it for", value: "20–45 minutes." },
      { label: "Style", value: "Concentrative / Buddhist." },
    ],
    tags: ["samatha", "shamatha", "calm", "concentration", "buddhist", "tranquility"],
  }),
  med({
    id: "med-tonglen",
    name: "Tonglen",
    aka: ["giving and taking", "sending and receiving"],
    category: "Tradition",
    summary:
      "A Tibetan Buddhist compassion practice that runs counter to instinct: on the in-breath you breathe in suffering, on the out-breath you send out relief and ease. A powerful antidote to fear and self-absorption.",
    fields: [
      { label: "How to", value: "Picture someone in difficulty (or yourself). Breathing in, take in their pain as warm, heavy darkness; breathing out, send them spaciousness, comfort, and relief as cool light. Then widen it to all who suffer similarly." },
      { label: "Good for", value: "Deep compassion, working with fear and resistance, opening the heart to pain." },
      { label: "Try it for", value: "10–20 minutes." },
      { label: "Style", value: "Tibetan Buddhist / compassion." },
      { label: "Go gently", value: "Sitting with suffering can feel heavy. Start small, keep self-compassion in the mix, and step back if it becomes overwhelming.", tone: "safety" },
    ],
    tags: ["tonglen", "compassion", "tibetan", "buddhist", "breath", "heart"],
  }),
  med({
    id: "med-guided-imagery",
    name: "Guided Imagery",
    aka: ["guided meditation"],
    category: "Technique",
    summary:
      "A narrated meditation that leads you, scene by scene, into relaxation or a vivid inner journey. The easiest on-ramp for beginners — a voice carries the structure so you can simply follow.",
    fields: [
      { label: "How to", value: "Press play on a recording or app and follow the narrator's prompts — a peaceful beach, a mountain path, a healing light. Let the imagery unfold; there's nothing to figure out." },
      { label: "Good for", value: "Beginners, relaxation, sleep, when self-directed practice feels hard." },
      { label: "Try it for", value: "5–30 minutes, depending on the recording." },
      { label: "Style", value: "Guided / imaginative." },
    ],
    tags: ["guided", "imagery", "beginner", "app", "relaxation", "narrated"],
  }),
  med({
    id: "med-om-chanting",
    name: "Om Chanting",
    aka: ["aum", "om meditation", "sound meditation"],
    category: "Technique",
    summary:
      "Chant the sacred syllable 'Om' (Aum) and rest in its long, resonant hum. The vibration gives the mind a felt anchor and many find the sustained tone deeply settling.",
    fields: [
      { label: "How to", value: "Inhale, then chant 'Ommm' on a slow exhale, feeling the sound vibrate in the chest, throat, and head. Pause, breathe, and repeat. Notice the silence that follows each chant." },
      { label: "Good for", value: "Calming the mind through sound, group practice, a tangible anchor." },
      { label: "Try it for", value: "5–15 minutes, or several rounds." },
      { label: "Style", value: "Sound / mantra." },
    ],
    tags: ["om", "aum", "sound", "chant", "vibration", "mantra"],
  }),
  med({
    id: "med-trataka",
    name: "Candle Gazing (Trataka)",
    aka: ["trataka", "candle meditation"],
    category: "Technique",
    summary:
      "A yogic concentration practice of steadily gazing at a candle flame, then holding its afterimage with eyes closed. A single-pointed focus that quickly quiets a wandering mind.",
    fields: [
      { label: "How to", value: "Place a candle at eye level an arm's length away in a dim room. Gaze softly at the flame without straining; when the eyes water or tire, close them and watch the afterimage until it fades, then reopen." },
      { label: "Good for", value: "Sharpening concentration, calming a busy mind, a visual anchor." },
      { label: "Try it for", value: "5–10 minutes." },
      { label: "Style", value: "Concentrative / gazing." },
      { label: "Go gently", value: "Don't strain the eyes; blink as needed and stop if they feel sore. Skip flame-gazing if you're prone to migraines or seizures.", tone: "safety" },
    ],
    tags: ["trataka", "candle", "gazing", "concentration", "yoga", "visual"],
  }),
  med({
    id: "med-gratitude",
    name: "Gratitude Meditation",
    category: "Technique",
    summary:
      "Deliberately bring to mind what you're thankful for and let the feeling land. A simple, mood-lifting practice that trains attention toward the good already present.",
    fields: [
      { label: "How to", value: "Settle and breathe, then call up something you appreciate — a person, a small kindness, a comfort. Picture it fully and let gratitude be felt in the body, not just thought. Move gently to the next." },
      { label: "Good for", value: "Lifting mood, perspective, savoring, ending the day well." },
      { label: "Try it for", value: "5–10 minutes." },
      { label: "Style", value: "Generative / positive emotion." },
    ],
    tags: ["gratitude", "thankfulness", "mood", "positive", "wellbeing", "savoring"],
  }),
  med({
    id: "med-rain",
    name: "RAIN",
    aka: ["recognize allow investigate nurture"],
    category: "Technique",
    summary:
      "A four-step mindfulness practice for meeting difficult emotions: Recognize, Allow, Investigate, Nurture. A clear map for staying present with hard feelings instead of being swept away.",
    fields: [
      { label: "How to", value: "Recognize what's happening; Allow it to be there without fixing; Investigate how it feels in the body with kind curiosity; Nurture it with compassion, as you would a hurting friend." },
      { label: "Good for", value: "Strong or stuck emotions, self-compassion, working with difficulty in the moment." },
      { label: "Try it for", value: "5–15 minutes, or in real time when feelings surge." },
      { label: "Style", value: "Mindful self-compassion." },
    ],
    tags: ["rain", "emotions", "self-compassion", "mindfulness", "difficult feelings"],
  }),

  // ───────────────────────── Core concepts ─────────────────────────
  med({
    id: "med-the-anchor",
    name: "The Anchor",
    category: "Concept",
    summary:
      "The single thing you rest attention on — usually the breath, but it can be a sound, a sensation, or a word. The anchor is home base: whenever you notice you've drifted, you return to it.",
    fields: [
      { label: "What it is", value: "A chosen focal point that keeps attention from scattering and gives you a clear place to come back to." },
      { label: "Why it helps", value: "Having one reference point turns 'try to focus' into a concrete, repeatable action." },
      { label: "In practice", value: "Pick one anchor and stick with it for the session. The breath is the classic default because it's always with you." },
    ],
    tags: ["anchor", "breath", "focus", "concept", "foundation"],
  }),
  med({
    id: "med-wandering-mind",
    name: "The Wandering Mind",
    aka: ["mind wandering", "returning"],
    category: "Concept",
    summary:
      "Your mind will wander — constantly, for everyone. This isn't failure; it's the practice. Each time you notice and gently return, you're doing the actual rep that strengthens attention.",
    fields: [
      { label: "What it is", value: "The mind's natural tendency to drift into thoughts, plans, and stories the moment you stop directing it." },
      { label: "The key reframe", value: "Noticing you've wandered and coming back IS meditating. A session with a hundred returns is a hundred reps, not a hundred failures." },
      { label: "In practice", value: "When you catch a drift, skip the self-criticism and simply return to the anchor. Kindness toward yourself is part of the skill." },
    ],
    tags: ["wandering", "returning", "thoughts", "concept", "reframe", "beginner"],
  }),
  med({
    id: "med-posture",
    name: "Posture",
    category: "Concept",
    summary:
      "How you hold the body shapes the mind. The aim is 'relaxed alertness' — upright enough to stay awake, comfortable enough to settle. You can sit on a chair, cushion, or even lie down.",
    fields: [
      { label: "What it is", value: "A stable, dignified position that supports both wakefulness and ease." },
      { label: "The essentials", value: "Spine tall but not rigid, shoulders soft, hands resting, chin slightly tucked. Eyes can close or hold a soft downward gaze." },
      { label: "In practice", value: "Chair (feet flat), cushion (cross-legged), kneeling bench, or lying down all work. Comfort that keeps you alert beats a 'perfect' pose that hurts." },
    ],
    tags: ["posture", "sitting", "body", "concept", "alert", "comfort"],
  }),
  med({
    id: "med-monkey-mind",
    name: "Monkey Mind",
    category: "Concept",
    summary:
      "A traditional image for the restless, jumping, chattering mind — swinging from thought to thought like a monkey through trees. Naming it helps you meet the restlessness with humor instead of frustration.",
    fields: [
      { label: "What it is", value: "The agitated, easily distracted quality of mind that pulls you from one thing to the next." },
      { label: "Why it matters", value: "Recognizing 'monkey mind' as normal — not a sign you're bad at this — keeps you practicing instead of giving up." },
      { label: "In practice", value: "Don't fight it. Acknowledge the busyness with a light touch and keep gently returning to the anchor. It settles with time." },
    ],
    tags: ["monkey mind", "restless", "distraction", "concept", "chatter"],
  }),
  med({
    id: "med-equanimity",
    name: "Equanimity",
    category: "Concept",
    summary:
      "A balanced, steady relationship to whatever arises — neither grasping at the pleasant nor pushing away the unpleasant. Not coldness or indifference, but a spacious, even-keeled presence.",
    fields: [
      { label: "What it is", value: "Mental balance that lets you stay present and centered through pleasant, unpleasant, and neutral experience alike." },
      { label: "Why it matters", value: "Much suffering comes from clinging and resisting; equanimity loosens both, leaving more freedom and calm." },
      { label: "In practice", value: "Notice the pull to chase or reject an experience, and instead let it be as it is. It grows naturally as concentration and mindfulness deepen." },
    ],
    tags: ["equanimity", "balance", "non-reactive", "concept", "acceptance", "calm"],
  }),
];
