import type { Course } from "../types";

/** FLAGSHIP #9 — Meditation & breathwork: the most evidence-backed practice here. */
export const meditationFoundations: Course = {
  id: "meditation-foundations",
  domain: "meditation",
  title: "Meditation & Breathwork",
  subtitle: "The most evidence-backed practice here",
  level: "foundations",
  icon: "🧘",
  summary:
    "Build a real meditation and breathwork practice — the one wellness practice with strong scientific support for stress, focus, and mood.",
  estMinutes: 40,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,
  safetyNote:
    "Intense or rapid breathwork can cause dizziness or fainting — never do it in or near water, and take care with pregnancy, cardiovascular conditions, epilepsy, or a history of panic or dissociation. Not a substitute for mental-health care.",

  outline: [
    { module: "Foundations", lessons: ["What meditation is (and the evidence)", "The wandering mind", "Your first sit"] },
    { module: "Techniques", lessons: ["Breath-focused meditation", "The body scan", "Loving-kindness & open awareness"] },
    { module: "Breathwork", lessons: ["Slow breathing & the nervous system", "Box breathing & 4-7-8", "Safety & building the habit"] },
  ],

  modules: [
    {
      id: "m1",
      title: "Foundations",
      lessons: [
        {
          id: "l1-what-meditation-is",
          title: "What meditation is (and the evidence)",
          objective: "Define meditation and state what the evidence supports.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Meditation is the practice of training attention — usually by resting it on a chosen anchor (like the breath) and gently returning whenever it wanders. It is not about emptying the mind or forcing it blank." },
            { kind: "callout", tone: "evidence", title: "This one has real support", text: "Unlike most topics in this library, meditation has solid scientific backing. Reviews of mindfulness programs show modest but real benefits for stress, anxiety, depression, pain, and attention. The effects aren't magic or instant — but they're genuine, and they grow with consistent practice." },
            { kind: "callout", tone: "tip", title: "Honest expectations", text: "Meditation is a skill, not a quick fix, and it isn't a replacement for therapy or medication when those are needed. Think of it as training that gradually changes your relationship to your own thoughts and stress." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Meditation is best described as…", options: [
              { id: "a", text: "Training attention — resting it on an anchor and returning when it wanders", correct: true, explanation: "Correct — it's attention training, not blanking the mind." },
              { id: "b", text: "Forcing your mind to go completely blank", correct: false, explanation: "That's a common myth; the mind naturally wanders." },
              { id: "c", text: "Falling asleep on purpose", correct: false, explanation: "Meditation is alert, not sleep." },
            ] },
            { id: "q2", type: "mcq", prompt: "What does the evidence say about meditation?", options: [
              { id: "a", text: "Modest but real benefits for stress, anxiety, mood, and attention", correct: true, explanation: "Yes — genuine, evidence-backed effects that grow with practice." },
              { id: "b", text: "It instantly cures all mental illness", correct: false, explanation: "No — it's helpful but not a cure-all or instant fix." },
              { id: "c", text: "There's no evidence at all", correct: false, explanation: "It's actually the best-evidenced practice in this library." },
            ] },
            { id: "q3", type: "true-false", prompt: "Meditation can replace therapy or medication when those are needed.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it supports wellbeing but isn't a substitute for care." },
              { id: "f", text: "False", correct: true, explanation: "Correct — use it alongside, not instead of, needed care." },
            ] },
          ],
        },
        {
          id: "l2-wandering-mind",
          title: "The wandering mind",
          objective: "Reframe mind-wandering as part of the practice, not failure.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Beginners often think 'I can't meditate — my mind won't stop.' But a wandering mind is completely normal; minds wander constantly. Noticing that it wandered and gently bringing it back is not a failure — it is the entire exercise." },
            { kind: "callout", tone: "tip", title: "Every return is a rep", text: "Think of attention like a muscle. Each time you notice you've drifted and return to the anchor, that's one repetition. A session where you wander and return fifty times is fifty good reps — not a failed meditation." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "When your mind wanders during meditation, it means…", options: [
              { id: "a", text: "Nothing is wrong — noticing and returning IS the practice", correct: true, explanation: "Correct — wandering is normal and expected." },
              { id: "b", text: "You're failing at meditation", correct: false, explanation: "Not at all — returning is the whole exercise." },
              { id: "c", text: "You should give up", correct: false, explanation: "Wandering is part of the process, not a reason to stop." },
            ] },
            { id: "q2", type: "mcq", prompt: "The 'rep' in meditation is…", options: [
              { id: "a", text: "Noticing you've drifted and returning to the anchor", correct: true, explanation: "Yes — each return strengthens attention." },
              { id: "b", text: "Keeping the mind perfectly blank the whole time", correct: false, explanation: "That's not realistic or the goal." },
              { id: "c", text: "Counting how long you can avoid thinking", correct: false, explanation: "It's about returning, not avoiding thought." },
            ] },
            { id: "q3", type: "true-false", prompt: "A session where you wandered and returned many times was a wasted meditation.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — those returns are exactly the training." },
              { id: "f", text: "False", correct: true, explanation: "Correct — many returns means many good reps." },
            ] },
          ],
        },
        {
          id: "l3-first-sit",
          title: "Your first sit",
          objective: "Run a simple first meditation from start to finish.",
          estMinutes: 4,
          blocks: [
            { kind: "list", ordered: true, items: [
              "Sit comfortably — chair or cushion — with a tall, relaxed spine. Eyes closed or softly lowered.",
              "Take a few natural breaths and let your body settle.",
              "Rest your attention on the feeling of breathing — wherever it's clearest (nose, chest, or belly).",
              "When you notice your mind has wandered, gently return to the breath. No judgment.",
              "Continue for a few minutes. To finish, take a breath, notice how you feel, and open your eyes.",
            ] },
            { kind: "callout", tone: "tip", title: "Start small", text: "Three to five minutes is plenty to begin. Consistency matters far more than length — a short daily sit beats a long occasional one." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A good anchor for a first meditation is…", options: [
              { id: "a", text: "The feeling of your breath", correct: true, explanation: "Correct — always available and easy to return to." },
              { id: "b", text: "An empty, thoughtless void", correct: false, explanation: "That's not a realistic anchor." },
              { id: "c", text: "Your phone screen", correct: false, explanation: "Anchors are internal sensations, like the breath." },
            ] },
            { id: "q2", type: "mcq", prompt: "For a beginner, a good session length is…", options: [
              { id: "a", text: "About 3–5 minutes, done consistently", correct: true, explanation: "Yes — short and regular beats long and rare." },
              { id: "b", text: "At least one hour or it doesn't count", correct: false, explanation: "Length isn't the point; consistency is." },
              { id: "c", text: "Only when you feel like it", correct: false, explanation: "Regularity builds the skill." },
            ] },
            { id: "q3", type: "true-false", prompt: "Consistency matters more than the length of each session.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — a short daily sit is ideal to start." },
              { id: "f", text: "False", correct: false, explanation: "Consistency is the key driver of progress." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Techniques",
      lessons: [
        {
          id: "l4-breath-meditation",
          title: "Breath-focused meditation",
          objective: "Practice anchoring attention on the breath.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The most fundamental technique: rest your attention on the natural breath. You're not controlling it — just feeling it. Notice the sensations of each in-breath and out-breath." },
            { kind: "callout", tone: "tip", title: "A counting option", text: "If the mind is busy, silently count breaths: 'one' on the first exhale, up to ten, then start over. If you lose count, just begin again at one. The counting gives attention something to hold." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In breath-focused meditation, you…", options: [
              { id: "a", text: "Feel the natural breath without controlling it", correct: true, explanation: "Correct — observe, don't force." },
              { id: "b", text: "Breathe as hard and fast as possible", correct: false, explanation: "That's not this practice (and can cause dizziness)." },
              { id: "c", text: "Hold your breath the whole time", correct: false, explanation: "No breath-holding — just natural breathing." },
            ] },
            { id: "q2", type: "mcq", prompt: "If your mind is busy, a helpful aid is…", options: [
              { id: "a", text: "Silently counting breaths up to ten, then restarting", correct: true, explanation: "Yes — counting gives attention an anchor." },
              { id: "b", text: "Giving up immediately", correct: false, explanation: "A busy mind is normal; counting helps." },
              { id: "c", text: "Turning on the TV", correct: false, explanation: "That defeats the purpose." },
            ] },
            { id: "q3", type: "true-false", prompt: "Breath-focused meditation means deliberately controlling and forcing the breath.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — you observe the natural breath here." },
              { id: "f", text: "False", correct: true, explanation: "Correct — this is observation, not control." },
            ] },
          ],
        },
        {
          id: "l5-body-scan",
          title: "The body scan",
          objective: "Describe the body-scan technique and its purpose.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "In a body scan, you move your attention slowly through the body — often from the feet up to the head — noticing whatever sensations are present (warmth, tension, tingling, or nothing) without trying to change them." },
            { kind: "callout", tone: "tip", title: "Great for relaxation and sleep", text: "The body scan builds body awareness and is especially good for releasing physical tension and winding down before sleep. There's no 'right' thing to feel — you're just noticing what's already there." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A body scan involves…", options: [
              { id: "a", text: "Moving attention slowly through the body, noticing sensations", correct: true, explanation: "Correct — observe without changing." },
              { id: "b", text: "Tensing every muscle as hard as you can", correct: false, explanation: "That's a different technique; the scan is about noticing." },
              { id: "c", text: "Scanning a barcode", correct: false, explanation: "It's an internal attention practice." },
            ] },
            { id: "q2", type: "mcq", prompt: "The body scan is especially useful for…", options: [
              { id: "a", text: "Releasing tension and winding down for sleep", correct: true, explanation: "Yes — a calming, grounding practice." },
              { id: "b", text: "Maximizing adrenaline", correct: false, explanation: "It's calming, not activating." },
              { id: "c", text: "Building muscle", correct: false, explanation: "It's awareness, not exercise." },
            ] },
            { id: "q3", type: "true-false", prompt: "During a body scan, you should force pleasant sensations and get rid of unpleasant ones.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — you simply notice what's there without changing it." },
              { id: "f", text: "False", correct: true, explanation: "Correct — observe, don't manipulate." },
            ] },
          ],
        },
        {
          id: "l6-lovingkindness",
          title: "Loving-kindness & open awareness",
          objective: "Distinguish loving-kindness and open-awareness practices.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Beyond focusing on the breath, two other families of practice are worth knowing:" },
            { kind: "list", items: [
              "**Loving-kindness (metta)** — silently repeating warm wishes ('May you be well, may you be happy, may you be at ease'), first for yourself, then widening to others. It cultivates warmth and reduces self-criticism.",
              "**Open awareness (open monitoring)** — instead of one anchor, you rest in awareness itself and simply notice whatever arises — sounds, thoughts, feelings — letting them come and go.",
            ] },
            { kind: "callout", tone: "evidence", title: "Real effects", text: "Loving-kindness practice has evidence for increasing positive emotion and feelings of social connection. Like all meditation, the benefits build gradually with practice." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Loving-kindness (metta) meditation involves…", options: [
              { id: "a", text: "Silently repeating warm wishes for yourself and others", correct: true, explanation: "Correct — cultivating warmth and goodwill." },
              { id: "b", text: "Criticizing yourself to improve", correct: false, explanation: "The opposite — it reduces self-criticism." },
              { id: "c", text: "Holding your breath", correct: false, explanation: "It's about phrases and warmth, not breath-holding." },
            ] },
            { id: "q2", type: "mcq", prompt: "Open awareness (open monitoring) means…", options: [
              { id: "a", text: "Resting in awareness and noticing whatever arises", correct: true, explanation: "Yes — no single anchor; observe it all." },
              { id: "b", text: "Forcing your attention onto one point forever", correct: false, explanation: "That's focused attention, the other style." },
              { id: "c", text: "Keeping your eyes wide open and staring", correct: false, explanation: "It's about inner awareness, not staring." },
            ] },
            { id: "q3", type: "true-false", prompt: "Loving-kindness practice has evidence for increasing positive emotion and connection.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — a well-studied benefit." },
              { id: "f", text: "False", correct: false, explanation: "There is supporting evidence for it." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Breathwork",
      lessons: [
        {
          id: "l7-slow-breathing",
          title: "Slow breathing & the nervous system",
          objective: "Explain how slow breathing calms the body.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Breathwork uses the breath deliberately to shift how you feel. The most reliable, best-evidenced form is simple: slow breathing." },
            { kind: "callout", tone: "evidence", title: "Why slow breathing works", text: "Breathing slowly — around five to six breaths per minute, with the exhale as long as or longer than the inhale — activates the parasympathetic ('rest and digest') branch of the nervous system via the vagus nerve. This measurably lowers heart rate and the stress response. It's the calmest, safest breathwork there is." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Slow breathing calms the body by…", options: [
              { id: "a", text: "Activating the parasympathetic ('rest and digest') response", correct: true, explanation: "Correct — via the vagus nerve." },
              { id: "b", text: "Triggering the fight-or-flight response", correct: false, explanation: "That's the opposite of what slow breathing does." },
              { id: "c", text: "Stopping the heart", correct: false, explanation: "It gently lowers heart rate, not stops it." },
            ] },
            { id: "q2", type: "mcq", prompt: "A calming slow-breathing pace is roughly…", options: [
              { id: "a", text: "5–6 breaths per minute, with a long exhale", correct: true, explanation: "Yes — the well-studied 'resonance' range." },
              { id: "b", text: "40 fast breaths per minute", correct: false, explanation: "That's hyperventilation, which is activating, not calming." },
              { id: "c", text: "Holding your breath for minutes", correct: false, explanation: "Not slow breathing — and risky." },
            ] },
            { id: "q3", type: "mcq", prompt: "Making the exhale longer than the inhale tends to…", options: [
              { id: "a", text: "Increase the calming effect", correct: true, explanation: "Correct — longer exhales deepen the parasympathetic response." },
              { id: "b", text: "Make you more anxious", correct: false, explanation: "It's calming, not activating." },
              { id: "c", text: "Have no effect", correct: false, explanation: "Exhale length matters for the calming response." },
            ] },
          ],
        },
        {
          id: "l8-box-478",
          title: "Box breathing & 4-7-8",
          objective: "Perform two simple structured breathing patterns.",
          estMinutes: 4,
          blocks: [
            { kind: "table", headers: ["Pattern", "How"], rows: [
              ["Box breathing", "Inhale 4 · hold 4 · exhale 4 · hold 4 — repeat. Steady and grounding."],
              ["4-7-8", "Inhale 4 · hold 7 · exhale 8 — repeat a few rounds. Strong calming / pre-sleep effect."],
            ] },
            { kind: "callout", tone: "tip", title: "Keep it gentle", text: "Use comfortable counts — if a hold feels strained, shorten it. These are meant to relax you, not to be a feat of endurance. A few rounds is enough; stop if you feel lightheaded." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Box breathing is…", options: [
              { id: "a", text: "Inhale 4, hold 4, exhale 4, hold 4", correct: true, explanation: "Correct — equal four-count sides, like a box." },
              { id: "b", text: "Breathing as fast as possible", correct: false, explanation: "No — it's slow and even." },
              { id: "c", text: "Holding your breath for 60 seconds", correct: false, explanation: "The holds are short (about 4 counts)." },
            ] },
            { id: "q2", type: "mcq", prompt: "The 4-7-8 pattern is…", options: [
              { id: "a", text: "Inhale 4, hold 7, exhale 8", correct: true, explanation: "Yes — with the long exhale for calm." },
              { id: "b", text: "Inhale 8, hold 4, exhale 7", correct: false, explanation: "The order is 4-7-8." },
              { id: "c", text: "Eight fast breaths", correct: false, explanation: "It's a slow, counted pattern." },
            ] },
            { id: "q3", type: "true-false", prompt: "If a breath-hold feels strained, you should push through it as long as possible.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — shorten the count; these should feel comfortable." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep it gentle; stop if lightheaded." },
            ] },
          ],
        },
        {
          id: "l9-safety-habit",
          title: "Safety & building the habit",
          objective: "Apply breathwork safety and a habit-building approach.",
          estMinutes: 4,
          blocks: [
            { kind: "callout", tone: "safety", title: "Breathwork safety", text: "Slow breathing is very safe. But INTENSE or rapid breathwork (fast, forceful 'hyperventilation' styles) can cause dizziness, tingling, or fainting. Never do intense breathwork in or near water or while driving, and take extra care — or check with a doctor — if you are pregnant or have a cardiovascular condition, epilepsy, or a history of panic or dissociation. If you feel lightheaded, stop and breathe normally." },
            { kind: "callout", tone: "tip", title: "Build the habit", text: "Anchor practice to something you already do daily — right after waking, before a meal, or as you get into bed. Start tiny (even one minute), keep it consistent, and let it grow naturally. A small daily habit beats an ambitious plan you abandon." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which breathwork carries the most caution?", options: [
              { id: "a", text: "Intense, rapid 'hyperventilation' styles", correct: true, explanation: "Correct — these can cause dizziness or fainting." },
              { id: "b", text: "Gentle slow breathing", correct: false, explanation: "Slow breathing is very safe." },
              { id: "c", text: "Normal breathing", correct: false, explanation: "Normal breathing carries no special risk." },
            ] },
            { id: "q2", type: "mcq", prompt: "You should never do intense breathwork…", options: [
              { id: "a", text: "In or near water, or while driving", correct: true, explanation: "Right — fainting there could be dangerous." },
              { id: "b", text: "While sitting safely at home", correct: false, explanation: "A safe seated spot is the appropriate place." },
              { id: "c", text: "Ever, under any circumstances", correct: false, explanation: "It can be done safely seated; the caution is about water/driving and certain conditions." },
            ] },
            { id: "q3", type: "mcq", prompt: "The best way to build a meditation habit is to…", options: [
              { id: "a", text: "Anchor a tiny daily practice to an existing routine", correct: true, explanation: "Yes — small, consistent, and attached to a cue." },
              { id: "b", text: "Commit to an hour a day immediately", correct: false, explanation: "That's hard to sustain and often abandoned." },
              { id: "c", text: "Only practice when stressed", correct: false, explanation: "Regularity, not crisis-only, builds the skill." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "Meditation is…", options: [
      { id: "a", text: "Training attention by returning to an anchor", correct: true },
      { id: "b", text: "Forcing the mind blank", correct: false },
      { id: "c", text: "Falling asleep", correct: false },
      { id: "d", text: "Stopping all thoughts forever", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "The evidence for meditation shows…", options: [
      { id: "a", text: "Modest but real benefits for stress, mood, and attention", correct: true },
      { id: "b", text: "It instantly cures everything", correct: false },
      { id: "c", text: "No effect at all", correct: false },
      { id: "d", text: "Only harm", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "When your mind wanders, you should…", options: [
      { id: "a", text: "Gently return to the anchor — that IS the practice", correct: true },
      { id: "b", text: "Quit, since you failed", correct: false },
      { id: "c", text: "Get angry at yourself", correct: false },
      { id: "d", text: "Try never to think again", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "For a beginner, a good session is…", options: [
      { id: "a", text: "3–5 minutes, done consistently", correct: true },
      { id: "b", text: "One hour minimum", correct: false },
      { id: "c", text: "Only when stressed", correct: false },
      { id: "d", text: "Never — it can't be learned", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "In breath-focused meditation, you…", options: [
      { id: "a", text: "Observe the natural breath without controlling it", correct: true },
      { id: "b", text: "Breathe as fast as possible", correct: false },
      { id: "c", text: "Hold your breath throughout", correct: false },
      { id: "d", text: "Ignore the breath entirely", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "A body scan is…", options: [
      { id: "a", text: "Moving attention through the body, noticing sensations", correct: true },
      { id: "b", text: "Tensing every muscle hard", correct: false },
      { id: "c", text: "A medical imaging test", correct: false },
      { id: "d", text: "Counting your steps", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "Loving-kindness (metta) meditation cultivates…", options: [
      { id: "a", text: "Warmth and goodwill for self and others", correct: true },
      { id: "b", text: "Self-criticism", correct: false },
      { id: "c", text: "Maximum heart rate", correct: false },
      { id: "d", text: "Sleepiness", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "Open awareness meditation means…", options: [
      { id: "a", text: "Noticing whatever arises, without a single fixed anchor", correct: true },
      { id: "b", text: "Staring at one point forever", correct: false },
      { id: "c", text: "Keeping eyes wide open", correct: false },
      { id: "d", text: "Holding the breath", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "Slow breathing calms the body via…", options: [
      { id: "a", text: "The parasympathetic ('rest and digest') response", correct: true },
      { id: "b", text: "The fight-or-flight response", correct: false },
      { id: "c", text: "Stopping circulation", correct: false },
      { id: "d", text: "Nothing physical", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "A calming slow-breathing pace is about…", options: [
      { id: "a", text: "5–6 breaths per minute with a long exhale", correct: true },
      { id: "b", text: "40 fast breaths per minute", correct: false },
      { id: "c", text: "One breath per minute", correct: false },
      { id: "d", text: "As fast as possible", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "Box breathing is…", options: [
      { id: "a", text: "Inhale 4, hold 4, exhale 4, hold 4", correct: true },
      { id: "b", text: "Inhale 4, hold 7, exhale 8", correct: false },
      { id: "c", text: "Rapid forced breaths", correct: false },
      { id: "d", text: "A 60-second breath hold", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "The 4-7-8 pattern is…", options: [
      { id: "a", text: "Inhale 4, hold 7, exhale 8", correct: true },
      { id: "b", text: "Inhale 8, hold 7, exhale 4", correct: false },
      { id: "c", text: "Four fast breaths", correct: false },
      { id: "d", text: "Hold for 7 minutes", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "Which breathwork carries the most caution?", options: [
      { id: "a", text: "Intense, rapid hyperventilation styles", correct: true },
      { id: "b", text: "Gentle slow breathing", correct: false },
      { id: "c", text: "Normal breathing", correct: false },
      { id: "d", text: "Counting breaths", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "You should never do intense breathwork…", options: [
      { id: "a", text: "In or near water, or while driving", correct: true },
      { id: "b", text: "Seated safely at home", correct: false },
      { id: "c", text: "With your eyes closed", correct: false },
      { id: "d", text: "In the morning", correct: false },
    ] },
    { id: "f15", type: "true-false", prompt: "A small, consistent daily practice beats an ambitious plan you abandon.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f16", type: "true-false", prompt: "Meditation is a substitute for therapy or medication when those are needed.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
  ],
};
