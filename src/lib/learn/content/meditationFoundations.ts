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
  estMinutes: 70,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,
  safetyNote:
    "Intense or rapid breathwork can cause dizziness or fainting — never do it in or near water, and take care with pregnancy, cardiovascular conditions, epilepsy, or a history of panic or dissociation. Meditation can also occasionally surface difficult emotions or memories; it is not a substitute for mental-health care, and you should seek professional support if your distress grows.",

  outline: [
    { module: "Foundations", lessons: ["What meditation is (and the evidence)", "A map of the major styles", "The wandering mind", "Your first sit"] },
    { module: "Techniques", lessons: ["Breath-focused meditation", "The body scan", "Loving-kindness & open awareness", "Posture & breath mechanics"] },
    { module: "Breathwork", lessons: ["Slow breathing & the nervous system", "Box breathing & 4-7-8", "Safety & building the habit"] },
    { module: "Practice & Reality", lessons: ["Obstacles & the wandering mind, deepened", "Building a daily habit that lasts", "What the evidence does and doesn't show", "When meditation gets hard — and seeking support"] },
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
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Meditation is the practice of training attention — usually by resting it on a chosen anchor (like the breath) and gently returning whenever it wanders. It is not about emptying the mind or forcing it blank." },
            { kind: "text", text: "The word covers a whole family of techniques, not a single act. What they share is deliberate, sustained attention paired with a particular attitude — curiosity and non-judgment rather than striving. The anchor can be the breath, a sound, a phrase, the body, or awareness itself; the move that makes it 'meditation' is noticing when you've drifted and choosing where to place attention next." },
            { kind: "callout", tone: "history", title: "Old practice, new science", text: "Contemplative practices appear in Hindu and Buddhist traditions dating back thousands of years, and in Christian, Jewish, Sufi, and Daoist lineages too. The modern, secular form most studied in the West grew from Jon Kabat-Zinn's Mindfulness-Based Stress Reduction (MBSR), developed at the University of Massachusetts Medical School in 1979 — which deliberately stripped the religious framing to make the practice testable in clinics." },
            { kind: "callout", tone: "evidence", title: "This one has real support", text: "Unlike most topics in this library, meditation has genuine scientific backing. A landmark 2014 review in JAMA Internal Medicine (Goyal et al., 47 trials, ~3,500 people) found moderate evidence that mindfulness programs improve anxiety, depression, and pain — with modest effect sizes around 0.3. The effects aren't magic or instant, but they're real and grow with consistent practice." },
            { kind: "callout", tone: "evidence", title: "What it did NOT find", text: "That same review found low or insufficient evidence for many other claimed benefits (mood, attention, sleep, weight, substance use), and found NO evidence that meditation worked better than active treatments such as exercise, medication, or therapy. Honest science means reporting the gaps, not just the wins." },
            { kind: "callout", tone: "tip", title: "Honest expectations", text: "Meditation is a skill, not a quick fix, and it isn't a replacement for therapy or medication when those are needed. Think of it as training that gradually changes your relationship to your own thoughts and stress — a relationship, not a switch you flip." },
            { kind: "keyfacts", items: [
              "Meditation = training attention, not blanking the mind.",
              "It is a family of techniques sharing sustained attention + a non-judgmental attitude.",
              "Modern secular practice traces to MBSR (Kabat-Zinn, 1979).",
              "Evidence: moderate support for anxiety, depression, pain; mixed or low for much else.",
              "Not better than active treatments, and not a substitute for care.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Meditation is best described as…", options: [
              { id: "a", text: "Training attention — resting it on an anchor and returning when it wanders", correct: true, explanation: "Correct — it's attention training, not blanking the mind." },
              { id: "b", text: "Forcing your mind to go completely blank", correct: false, explanation: "That's a common myth; the mind naturally wanders." },
              { id: "c", text: "Falling asleep on purpose", correct: false, explanation: "Meditation is alert, not sleep." },
            ] },
            { id: "q2", type: "mcq", prompt: "What does the strongest evidence say about meditation?", options: [
              { id: "a", text: "Moderate benefits for anxiety, depression, and pain", correct: true, explanation: "Yes — the Goyal 2014 JAMA review found moderate evidence for those three." },
              { id: "b", text: "It instantly cures all mental illness", correct: false, explanation: "No — it's helpful but not a cure-all or instant fix." },
              { id: "c", text: "There's no evidence at all", correct: false, explanation: "It's actually the best-evidenced practice in this library." },
            ] },
            { id: "q3", type: "mcq", prompt: "The modern secular practice most studied in the West grew from…", options: [
              { id: "a", text: "Mindfulness-Based Stress Reduction (MBSR), developed in 1979", correct: true, explanation: "Correct — Jon Kabat-Zinn's clinic-friendly program." },
              { id: "b", text: "A 21st-century smartphone app", correct: false, explanation: "Apps came much later; MBSR predates them by decades." },
              { id: "c", text: "A pharmaceutical trial", correct: false, explanation: "MBSR was a behavioral program, not a drug study." },
            ] },
            { id: "q4", type: "true-false", prompt: "Research shows meditation works better than active treatments like exercise, therapy, or medication.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the major review found no evidence it outperforms active treatments." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it can help, but not demonstrably more than those." },
            ] },
            { id: "q5", type: "true-false", prompt: "Meditation can replace therapy or medication when those are needed.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it supports wellbeing but isn't a substitute for care." },
              { id: "f", text: "False", correct: true, explanation: "Correct — use it alongside, not instead of, needed care." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the word for the chosen object you rest attention on (e.g., the breath) and return to when the mind wanders.", options: [], answer: "anchor", accept: ["an anchor", "the anchor"], explanation: "The anchor is whatever you keep returning attention to — breath, sound, phrase, or body." },
          ],
        },
        {
          id: "l2-styles-map",
          title: "A map of the major styles",
          objective: "Identify the main families of meditation and what distinguishes them.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Researchers usually sort meditation into a few broad families. Knowing the map helps you choose a practice on purpose rather than guessing — and it makes sense of why instructions vary so much from app to app." },
            { kind: "table", headers: ["Family", "What you do", "Good for"], rows: [
              ["Focused attention", "Rest on one anchor (breath, mantra, sound); return when you drift.", "Building concentration; settling a busy mind."],
              ["Open monitoring", "Drop the single anchor; watch whatever arises without grabbing it.", "Insight, equanimity, noticing patterns of thought."],
              ["Loving-kindness / compassion", "Silently extend warm wishes to self and others.", "Warmth, connection, easing self-criticism."],
              ["Body-based (e.g. body scan)", "Move attention systematically through the body.", "Relaxation, grounding, sleep, body awareness."],
            ] },
            { kind: "text", text: "Two extra distinctions are worth knowing. Some practices are guided (a voice leads you) versus silent (you self-direct). And meditation can be formal — a dedicated sit — or informal, woven into daily life, like attending fully to washing the dishes." },
            { kind: "callout", tone: "tradition", title: "Concentration and insight", text: "In Buddhist tradition these families map roughly onto samatha (calm-abiding, a focused-attention practice) and vipassanā (insight, closer to open monitoring). Many lineages train concentration first because a steadier mind makes open awareness possible." },
            { kind: "callout", tone: "evidence", title: "Different styles, different effects", text: "Brain-imaging and behavioral studies suggest focused-attention and open-monitoring practices engage somewhat different processes, and loving-kindness has its own signature (more positive emotion, social connection). No single style is 'best' — the right one depends on your goal and what you'll actually keep doing." },
            { kind: "keyfacts", items: [
              "Focused attention = one anchor; open monitoring = no single anchor.",
              "Loving-kindness cultivates warmth; body-based practices ground and relax.",
              "Guided vs. silent, and formal vs. informal, are independent of family.",
              "Concentration (samatha) is often trained before insight (vipassanā).",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which family keeps attention on a single anchor and returns when it drifts?", options: [
              { id: "a", text: "Focused attention", correct: true, explanation: "Correct — one anchor, repeated returns." },
              { id: "b", text: "Open monitoring", correct: false, explanation: "Open monitoring drops the single anchor." },
              { id: "c", text: "Loving-kindness", correct: false, explanation: "That cultivates warm wishes, not single-point focus." },
            ] },
            { id: "q2", type: "mcq", prompt: "Open monitoring is characterized by…", options: [
              { id: "a", text: "Watching whatever arises without latching onto one anchor", correct: true, explanation: "Yes — spacious awareness rather than single focus." },
              { id: "b", text: "Staring at a candle to build concentration", correct: false, explanation: "That's focused attention." },
              { id: "c", text: "Repeating warm phrases for others", correct: false, explanation: "That's loving-kindness." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which practice is especially associated with grounding, relaxation, and sleep?", options: [
              { id: "a", text: "Body-based practices like the body scan", correct: true, explanation: "Correct — body awareness is calming and good before sleep." },
              { id: "b", text: "Rapid breathwork", correct: false, explanation: "That's activating, not calming." },
              { id: "c", text: "Mantra repetition for concentration", correct: false, explanation: "Useful, but the body scan is the classic relaxation/sleep practice." },
            ] },
            { id: "q4", type: "true-false", prompt: "'Informal' meditation means weaving attention into daily activities, like washing dishes mindfully.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — informal practice happens during everyday life." },
              { id: "f", text: "False", correct: false, explanation: "Informal practice does exactly this." },
            ] },
            { id: "q5", type: "true-false", prompt: "There is one objectively 'best' style of meditation that everyone should use.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the best style depends on your goal and what you'll keep doing." },
              { id: "f", text: "False", correct: true, explanation: "Correct — fit and consistency matter more than any single 'best' style." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the two-word name (focused ____) for the family that rests on a single anchor.", options: [], answer: "attention", accept: ["focused attention", "attention practice"], explanation: "Focused attention rests on one anchor and returns when the mind wanders." },
          ],
        },
        {
          id: "l3-wandering-mind",
          title: "The wandering mind",
          objective: "Reframe mind-wandering as part of the practice, not failure.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Beginners often think 'I can't meditate — my mind won't stop.' But a wandering mind is completely normal; minds wander constantly. Noticing that it wandered and gently bringing it back is not a failure — it is the entire exercise." },
            { kind: "callout", tone: "evidence", title: "Minds wander about half the time", text: "A 2010 Harvard study (Killingsworth & Gilbert) sampled thousands of people during daily life and found their minds were wandering roughly 47% of the time — and that mind-wandering was associated with feeling less happy. So when your attention drifts in meditation, you're not broken; you're seeing a normal feature of the human mind up close." },
            { kind: "callout", tone: "tip", title: "Every return is a rep", text: "Think of attention like a muscle. Each time you notice you've drifted and return to the anchor, that's one repetition. A session where you wander and return fifty times is fifty good reps — not a failed meditation." },
            { kind: "callout", tone: "tip", title: "Mind the second arrow", text: "The first 'arrow' is simply that the mind wandered — unavoidable. The second arrow is judging yourself for it ('I'm so bad at this'). You can't stop the first; you can drop the second. Returning with kindness, not frustration, is part of the skill." },
            { kind: "keyfacts", items: [
              "Mind-wandering is the default state of the brain, not a defect.",
              "Noticing + returning is the rep that trains attention.",
              "Self-judgment ('the second arrow') is optional — let it go.",
              "Many returns in one sit = a good session, not a failed one.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "Roughly how often did the Harvard study find people's minds wandering in daily life?", options: [
              { id: "a", text: "About half the time (~47%)", correct: true, explanation: "Correct — mind-wandering is extremely common." },
              { id: "b", text: "Almost never (under 5%)", correct: false, explanation: "Far more often than that." },
              { id: "c", text: "Only during meditation", correct: false, explanation: "It happens throughout ordinary life." },
            ] },
            { id: "q4", type: "true-false", prompt: "A session where you wandered and returned many times was a wasted meditation.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — those returns are exactly the training." },
              { id: "f", text: "False", correct: true, explanation: "Correct — many returns means many good reps." },
            ] },
            { id: "q5", type: "true-false", prompt: "Judging yourself for a wandering mind ('the second arrow') is a necessary part of meditation.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the self-judgment is optional and worth dropping." },
              { id: "f", text: "False", correct: true, explanation: "Correct — return with kindness, not criticism." },
            ] },
          ],
        },
        {
          id: "l4-first-sit",
          title: "Your first sit",
          objective: "Run a simple first meditation from start to finish.",
          estMinutes: 5,
          blocks: [
            { kind: "list", ordered: true, items: [
              "Sit comfortably — chair or cushion — with a tall, relaxed spine. Eyes closed or softly lowered.",
              "Take a few natural breaths and let your body settle.",
              "Rest your attention on the feeling of breathing — wherever it's clearest (nose, chest, or belly).",
              "When you notice your mind has wandered, gently return to the breath. No judgment.",
              "Continue for a few minutes. To finish, take a breath, notice how you feel, and open your eyes.",
            ] },
            { kind: "callout", tone: "tip", title: "Start small", text: "Three to five minutes is plenty to begin. Consistency matters far more than length — a short daily sit beats a long occasional one." },
            { kind: "callout", tone: "tip", title: "Set up for success", text: "Pick a time you're naturally a little alert (mornings work for many) and a quiet-ish spot. A timer with a gentle bell frees you from clock-watching. Phone on Do Not Disturb. None of this is required — but small frictions removed make the habit far easier to keep." },
            { kind: "callout", tone: "safety", title: "If it feels like too much", text: "If sitting still with eyes closed feels overwhelming or stirs up distress, you can soften the practice: open your eyes, keep the sessions very short, or choose a more grounding anchor like the feet on the floor. Difficulty isn't a sign you're doing it wrong — but persistent distress is a cue to ease off and, if needed, talk to a professional." },
            { kind: "keyfacts", items: [
              "Posture: tall, relaxed spine; eyes closed or softly lowered.",
              "Anchor: the clearest place you feel the breath.",
              "The whole skill: notice the wander, return without judgment.",
              "Begin with 3–5 minutes, daily; grow length later.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "If sitting with eyes closed feels overwhelming, a reasonable adjustment is…", options: [
              { id: "a", text: "Open your eyes, shorten the sit, or use a grounding anchor like the feet", correct: true, explanation: "Correct — soften the practice rather than forcing it." },
              { id: "b", text: "Force yourself to sit longer to toughen up", correct: false, explanation: "Pushing through distress is not the goal." },
              { id: "c", text: "Conclude you can never meditate", correct: false, explanation: "Adjusting the practice usually helps." },
            ] },
            { id: "q4", type: "true-false", prompt: "Consistency matters more than the length of each session.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — a short daily sit is ideal to start." },
              { id: "f", text: "False", correct: false, explanation: "Consistency is the key driver of progress." },
            ] },
            { id: "q5", type: "true-false", prompt: "A timer with a gentle bell helps by freeing you from checking the clock.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it removes a common distraction." },
              { id: "f", text: "False", correct: false, explanation: "A timer genuinely helps you settle." },
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
          id: "l5-breath-meditation",
          title: "Breath-focused meditation",
          objective: "Practice anchoring attention on the breath.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The most fundamental technique: rest your attention on the natural breath. You're not controlling it — just feeling it. Notice the sensations of each in-breath and out-breath." },
            { kind: "text", text: "Why the breath? It's always with you, it's free, and it's a uniquely flexible anchor — usually automatic, but able to be observed. That makes it the ideal training ground: a moving, ever-present sensation you can return to anywhere, from a meditation cushion to a tense meeting." },
            { kind: "list", items: [
              "**Find the clearest point** — the cool air at the nostrils, the rise of the chest, or the movement of the belly. Pick one and stay there.",
              "**Feel, don't think** — notice the actual sensations, not the idea of breathing. Texture, length, the small pause between breaths.",
              "**Return gently** — when you notice you've drifted (you will), come back without commentary.",
            ] },
            { kind: "callout", tone: "tip", title: "A counting option", text: "If the mind is busy, silently count breaths: 'one' on the first exhale, up to ten, then start over. If you lose count, just begin again at one. The counting gives attention something to hold." },
            { kind: "callout", tone: "tip", title: "Labeling, lightly", text: "Another aid: a soft mental note of 'in' on the inhale and 'out' on the exhale. Keep it quiet and in the background — the note points attention at the breath, it isn't the point itself." },
            { kind: "keyfacts", items: [
              "Observe the natural breath — don't force or control it.",
              "Anchor at one clear point (nostrils, chest, or belly).",
              "Counting to ten or light 'in/out' labels can steady a busy mind.",
              "The breath is portable: usable anywhere, anytime.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "Why is the breath such a useful anchor?", options: [
              { id: "a", text: "It's always present and portable — usable anywhere", correct: true, explanation: "Correct — that's what makes it so practical." },
              { id: "b", text: "It can be stopped indefinitely without effect", correct: false, explanation: "You never stop breathing; that's not the reason." },
              { id: "c", text: "It requires special equipment", correct: false, explanation: "It needs nothing at all — that's part of the appeal." },
            ] },
            { id: "q4", type: "true-false", prompt: "Breath-focused meditation means deliberately controlling and forcing the breath.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — you observe the natural breath here." },
              { id: "f", text: "False", correct: true, explanation: "Correct — this is observation, not control." },
            ] },
            { id: "q5", type: "true-false", prompt: "A soft mental note of 'in' and 'out' can help keep attention on the breath.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — light labeling points attention at the breath." },
              { id: "f", text: "False", correct: false, explanation: "Gentle labeling is a common, helpful aid." },
            ] },
          ],
        },
        {
          id: "l6-body-scan",
          title: "The body scan",
          objective: "Describe the body-scan technique and its purpose.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "In a body scan, you move your attention slowly through the body — often from the feet up to the head — noticing whatever sensations are present (warmth, tension, tingling, or nothing) without trying to change them." },
            { kind: "text", text: "Practically: rest your attention on one region (say, the soles of your feet), feel it for several breaths, then let attention move on — ankles, calves, knees, and so on. Areas of 'nothing' are fine to notice too. The skill is sustained, gentle interest, not relaxation on demand." },
            { kind: "callout", tone: "history", title: "A core MBSR practice", text: "The body scan is one of the foundational practices in Kabat-Zinn's MBSR program, often taught lying down as a 30–45 minute exercise. It's frequently a newcomer's first taste of formal meditation because it gives attention a clear, moving task." },
            { kind: "callout", tone: "tip", title: "Great for relaxation and sleep", text: "The body scan builds body awareness and is especially good for releasing physical tension and winding down before sleep. There's no 'right' thing to feel — you're just noticing what's already there." },
            { kind: "callout", tone: "safety", title: "If the body feels unsafe", text: "For some people — especially after trauma — turning attention inward to the body can feel uncomfortable or distressing. If that happens, it's fine to keep your eyes open, scan only neutral areas (like the hands or feet), or choose a different anchor. Trauma-sensitive teachers exist for exactly this reason." },
            { kind: "keyfacts", items: [
              "Move attention region by region, head-to-toe or toe-to-head.",
              "Notice sensations — including 'nothing' — without changing them.",
              "A foundational MBSR practice, good for tension and sleep.",
              "Inward body focus can be hard after trauma; adapt or seek a trauma-sensitive guide.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "The body scan is a foundational practice in which program?", options: [
              { id: "a", text: "Mindfulness-Based Stress Reduction (MBSR)", correct: true, explanation: "Correct — Kabat-Zinn's program features it prominently." },
              { id: "b", text: "High-intensity interval training", correct: false, explanation: "That's exercise, not meditation." },
              { id: "c", text: "Competitive breath-holding", correct: false, explanation: "Not related to the body scan." },
            ] },
            { id: "q4", type: "true-false", prompt: "During a body scan, you should force pleasant sensations and get rid of unpleasant ones.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — you simply notice what's there without changing it." },
              { id: "f", text: "False", correct: true, explanation: "Correct — observe, don't manipulate." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the two-word name for the practice of moving attention region by region through the body.", options: [], answer: "body scan", accept: ["bodyscan", "the body scan"], explanation: "The body scan moves attention through the body, noticing sensations without changing them." },
          ],
        },
        {
          id: "l7-lovingkindness",
          title: "Loving-kindness & open awareness",
          objective: "Distinguish loving-kindness and open-awareness practices.",
          estMinutes: 5,
          blocks: [
            { kind: "sort", prompt: "Sort practices by type", instructions: "Tap a practice, then tap its family", groups: [
              { name: "Focused attention", accent: "#c9881f", items: ["Breath focus", "Mantra", "Candle gazing"] },
              { name: "Open monitoring", accent: "#2e86c1", items: ["Body scan", "Noting", "Open awareness"] },
              { name: "Heart-based", accent: "#c0398a", items: ["Loving-kindness", "Compassion"] },
            ] },
            { kind: "text", text: "Beyond focusing on the breath, two other families of practice are worth knowing:" },
            { kind: "list", items: [
              "**Loving-kindness (metta)** — silently repeating warm wishes ('May you be well, may you be happy, may you be at ease'), first for yourself, then widening to others. It cultivates warmth and reduces self-criticism.",
              "**Open awareness (open monitoring)** — instead of one anchor, you rest in awareness itself and simply notice whatever arises — sounds, thoughts, feelings — letting them come and go.",
            ] },
            { kind: "text", text: "Loving-kindness traditionally widens in rings: yourself, then a benefactor or loved one, then a neutral person, then a difficult person, then all beings. The phrases matter less than the sincere intention behind them — and beginners often start with whoever is easiest to wish well." },
            { kind: "callout", tone: "tradition", title: "Metta and the brahmavihārās", text: "Loving-kindness (metta) is the first of the four brahmavihārās — 'divine abodes' — in Buddhist practice, alongside compassion (karuṇā), sympathetic joy (muditā), and equanimity (upekkhā). Together they're a systematic training of the heart, not just a feel-good exercise." },
            { kind: "callout", tone: "evidence", title: "Real effects", text: "Loving-kindness practice has evidence for increasing positive emotion and feelings of social connection, and a well-known study by Barbara Fredrickson linked it to gradual gains in positive emotions over weeks. Like all meditation, the benefits build slowly with practice, not overnight." },
            { kind: "keyfacts", items: [
              "Loving-kindness = repeated warm wishes, widening from self to others.",
              "Open monitoring = no single anchor; notice whatever arises.",
              "Metta is the first of four 'divine abodes' in Buddhist tradition.",
              "Evidence links loving-kindness to more positive emotion and connection.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "In the traditional loving-kindness sequence, you usually begin by extending wishes to…", options: [
              { id: "a", text: "Yourself (or whoever is easiest to wish well)", correct: true, explanation: "Correct — the rings widen outward from there." },
              { id: "b", text: "Your most difficult enemy first", correct: false, explanation: "The hardest person comes later, not first." },
              { id: "c", text: "Strangers only, never yourself", correct: false, explanation: "Self is the usual starting point." },
            ] },
            { id: "q4", type: "true-false", prompt: "Loving-kindness practice has evidence for increasing positive emotion and connection.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — a well-studied benefit." },
              { id: "f", text: "False", correct: false, explanation: "There is supporting evidence for it." },
            ] },
            { id: "q5", type: "true-false", prompt: "Loving-kindness is the first of the four 'divine abodes' (brahmavihārās).", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — metta, then compassion, joy, and equanimity." },
              { id: "f", text: "False", correct: false, explanation: "It is indeed the first of the four." },
            ] },
          ],
        },
        {
          id: "l8-posture-mechanics",
          title: "Posture & breath mechanics",
          objective: "Set up a stable posture and breathe in a way that supports calm.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "You don't need a special pose to meditate, but a few mechanics make it easier to stay both alert and relaxed. The classic guidance: a posture that is 'dignified' — upright but not rigid, settled but not slumped." },
            { kind: "list", ordered: true, items: [
              "**Base** — sit on a chair (feet flat) or a cushion (hips slightly above knees). A stable base lets the spine stack without effort.",
              "**Spine** — tall and naturally curved, as if a string lifts the crown of your head. Upright posture supports alertness; slumping invites drowsiness.",
              "**Shoulders & hands** — shoulders soft and dropped; hands resting on the thighs or in the lap.",
              "**Head & gaze** — chin very slightly tucked; eyes closed or softly lowered to a point on the floor.",
            ] },
            { kind: "callout", tone: "evidence", title: "Belly breathing, gently", text: "Diaphragmatic ('belly') breathing — letting the abdomen expand on the inhale rather than the chest heaving — tends to be slower and more efficient, and is associated with greater relaxation in studies of slow breathing. You're not forcing a big breath; you're letting the diaphragm do its natural job." },
            { kind: "callout", tone: "tip", title: "Nose over mouth, usually", text: "For calm breathing, nasal breathing is generally preferred: it's slower, filters and warms the air, and naturally paces the breath. Mouth breathing tends to be faster and shallower. None of this needs to be strict — just a gentle default." },
            { kind: "callout", tone: "safety", title: "Comfort comes first", text: "If a cross-legged posture hurts your knees or back, sit in a chair — there is no spiritual bonus for pain. Persistent pain pulls attention away and can cause injury. Lying down is fine too, though it makes drowsiness more likely." },
            { kind: "keyfacts", items: [
              "Aim for 'dignified': upright but relaxed, not rigid or slumped.",
              "A stable base lets the spine stack effortlessly.",
              "Diaphragmatic (belly) breathing is slower and more relaxing.",
              "Nasal breathing naturally paces and warms the breath.",
              "Choose comfort — a chair is perfectly valid.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A good meditation posture is best described as…", options: [
              { id: "a", text: "Upright but relaxed — 'dignified,' not rigid or slumped", correct: true, explanation: "Correct — alert and settled at once." },
              { id: "b", text: "As rigid and tense as possible", correct: false, explanation: "Rigidity creates strain and pulls attention away." },
              { id: "c", text: "Fully slumped to maximize relaxation", correct: false, explanation: "Slumping invites drowsiness; upright supports alertness." },
            ] },
            { id: "q2", type: "mcq", prompt: "Diaphragmatic ('belly') breathing is associated with…", options: [
              { id: "a", text: "Slower, more efficient breaths and greater relaxation", correct: true, explanation: "Correct — letting the diaphragm work tends to calm." },
              { id: "b", text: "Faster, shallower, more anxious breathing", correct: false, explanation: "That describes chest-heavy breathing, not belly breathing." },
              { id: "c", text: "Holding the breath for long periods", correct: false, explanation: "It's about natural expansion, not breath-holding." },
            ] },
            { id: "q3", type: "mcq", prompt: "If a cross-legged posture hurts your knees or back, you should…", options: [
              { id: "a", text: "Sit in a chair — comfort comes first", correct: true, explanation: "Correct — there's no benefit to pain." },
              { id: "b", text: "Push through the pain for spiritual credit", correct: false, explanation: "Pain distracts and can injure you." },
              { id: "c", text: "Stop meditating forever", correct: false, explanation: "Just change posture; a chair works fine." },
            ] },
            { id: "q4", type: "true-false", prompt: "For calm breathing, slow nasal breathing is generally preferred over fast mouth breathing.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — nasal breathing paces and warms the air." },
              { id: "f", text: "False", correct: false, explanation: "Nasal breathing is the gentle default for calm." },
            ] },
            { id: "q5", type: "true-false", prompt: "You must sit in a cross-legged 'lotus' position for meditation to count.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — a chair or any stable, comfortable posture is fine." },
              { id: "f", text: "False", correct: true, explanation: "Correct — posture should serve comfort and alertness, not a specific shape." },
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
          id: "l9-slow-breathing",
          title: "Slow breathing & the nervous system",
          objective: "Explain how slow breathing calms the body.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Breathwork uses the breath deliberately to shift how you feel. The most reliable, best-evidenced form is simple: slow breathing." },
            { kind: "callout", tone: "evidence", title: "Why slow breathing works", text: "Breathing slowly — around five to six breaths per minute, with the exhale as long as or longer than the inhale — activates the parasympathetic ('rest and digest') branch of the nervous system via the vagus nerve. This measurably lowers heart rate and the stress response. It's the calmest, safest breathwork there is." },
            { kind: "text", text: "There's a neat mechanism behind the long exhale. Your heart rate naturally speeds up a little on the inhale and slows on the exhale (this is called respiratory sinus arrhythmia). Lengthening the exhale leans into the slowing phase, nudging the whole system toward calm." },
            { kind: "callout", tone: "evidence", title: "The ~6-breath 'resonance' rate", text: "Around six breaths per minute is sometimes called the 'resonance frequency,' where heart-rate variability (a marker of healthy nervous-system flexibility) peaks. Slow-breathing and HRV-biofeedback studies show small but consistent reductions in stress and anxiety at roughly this pace — though it's a tool, not a cure." },
            { kind: "callout", tone: "history", title: "An old idea, measured", text: "Slow, controlled breathing (prāṇāyāma) is central to yoga traditions thousands of years old. What's new is the measurement: modern instruments let researchers watch heart rate and vagal tone shift in real time, putting numbers on what practitioners long described." },
            { kind: "keyfacts", items: [
              "Slow breathing (~5–6/min) activates the parasympathetic 'rest and digest' response.",
              "It works via the vagus nerve, lowering heart rate.",
              "A longer exhale deepens the calming effect (respiratory sinus arrhythmia).",
              "~6 breaths/min is the 'resonance' rate where HRV peaks.",
            ] },
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
            { id: "q4", type: "true-false", prompt: "Heart rate naturally speeds slightly on the inhale and slows on the exhale.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — this is respiratory sinus arrhythmia; the long exhale uses it." },
              { id: "f", text: "False", correct: false, explanation: "It's a real, measurable pattern." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the name of the nerve through which slow breathing activates the 'rest and digest' response.", options: [], answer: "vagus", accept: ["vagus nerve", "the vagus nerve", "vagal nerve"], explanation: "The vagus nerve carries parasympathetic signals that lower heart rate and calm the body." },
          ],
        },
        {
          id: "l10-box-478",
          title: "Box breathing & 4-7-8",
          objective: "Perform two simple structured breathing patterns.",
          estMinutes: 5,
          blocks: [
            { kind: "table", headers: ["Pattern", "How"], rows: [
              ["Box breathing", "Inhale 4 · hold 4 · exhale 4 · hold 4 — repeat. Steady and grounding."],
              ["4-7-8", "Inhale 4 · hold 7 · exhale 8 — repeat a few rounds. Strong calming / pre-sleep effect."],
            ] },
            { kind: "text", text: "Both are forms of paced, slow breathing — structure that makes the pace easy to keep. Box breathing's equal sides are steadying and easy to remember; 4-7-8's long exhale tilts strongly toward calm, which is why it's popular before sleep." },
            { kind: "callout", tone: "history", title: "Where they come from", text: "Box breathing (also called 'square breathing') is widely taught in high-pressure settings — it's associated with U.S. Navy SEAL stress-control training — for steadying nerves under load. The 4-7-8 pattern was popularized by physician Andrew Weil, who drew it from yogic prāṇāyāma. Both are simply structured slow breathing." },
            { kind: "callout", tone: "tip", title: "Keep it gentle", text: "Use comfortable counts — if a hold feels strained, shorten it. These are meant to relax you, not to be a feat of endurance. A few rounds is enough; stop if you feel lightheaded." },
            { kind: "callout", tone: "safety", title: "About the holds", text: "The breath-holds here are short and gentle. They are not the same as intense breath-retention or hyperventilation practices, which carry more risk. If you're pregnant or have a heart or lung condition, keep holds minimal or skip them, and check with a clinician." },
            { kind: "keyfacts", items: [
              "Box breathing: 4-4-4-4, equal and grounding.",
              "4-7-8: long exhale, strongly calming and good before sleep.",
              "Both are structured forms of slow breathing.",
              "Keep counts comfortable; shorten holds if strained.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "Why is 4-7-8 especially popular before sleep?", options: [
              { id: "a", text: "Its long exhale tilts strongly toward the calming response", correct: true, explanation: "Correct — the extended exhale deepens relaxation." },
              { id: "b", text: "It maximizes adrenaline and alertness", correct: false, explanation: "That would keep you awake, not help you sleep." },
              { id: "c", text: "It involves rapid forceful breaths", correct: false, explanation: "It's slow and gentle, not forceful." },
            ] },
            { id: "q4", type: "true-false", prompt: "If a breath-hold feels strained, you should push through it as long as possible.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — shorten the count; these should feel comfortable." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep it gentle; stop if lightheaded." },
            ] },
            { id: "q5", type: "true-false", prompt: "Box breathing and 4-7-8 are both forms of structured slow breathing.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — both pace the breath slowly, just with different counts." },
              { id: "f", text: "False", correct: false, explanation: "Both are paced slow-breathing patterns." },
            ] },
          ],
        },
        {
          id: "l11-safety-habit",
          title: "Safety & building the habit",
          objective: "Apply breathwork safety and a habit-building approach.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "safety", title: "Breathwork safety", text: "Slow breathing is very safe. But INTENSE or rapid breathwork (fast, forceful 'hyperventilation' styles) can cause dizziness, tingling, or fainting. Never do intense breathwork in or near water or while driving, and take extra care — or check with a doctor — if you are pregnant or have a cardiovascular condition, epilepsy, or a history of panic or dissociation. If you feel lightheaded, stop and breathe normally." },
            { kind: "text", text: "Why does fast breathing cause those symptoms? Over-breathing blows off carbon dioxide faster than the body produces it; the resulting drop in blood CO₂ (hypocapnia) narrows blood vessels to the brain and triggers tingling, dizziness, and sometimes fainting. It's not dangerous in a safe seated position, but it explains why water and driving are off-limits." },
            { kind: "table", headers: ["Practice", "Risk level", "Note"], rows: [
              ["Slow breathing (~6/min)", "Very low", "Calming; fine for nearly everyone."],
              ["Box / 4-7-8 (gentle holds)", "Low", "Keep holds comfortable; ease off if pregnant or with heart/lung issues."],
              ["Intense / rapid 'hyperventilation' styles", "Higher", "Never near water or driving; caution with several conditions."],
            ] },
            { kind: "callout", tone: "tip", title: "Build the habit", text: "Anchor practice to something you already do daily — right after waking, before a meal, or as you get into bed. Start tiny (even one minute), keep it consistent, and let it grow naturally. A small daily habit beats an ambitious plan you abandon." },
            { kind: "keyfacts", items: [
              "Slow breathing is very safe; intense/rapid styles carry real cautions.",
              "Fast breathing lowers blood CO₂, causing tingling and dizziness.",
              "Never do intense breathwork in/near water or while driving.",
              "Build habits by attaching a tiny practice to an existing cue.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "Rapid over-breathing makes you dizzy and tingly mainly because…", options: [
              { id: "a", text: "It lowers blood CO₂, narrowing blood vessels to the brain", correct: true, explanation: "Correct — hypocapnia causes those symptoms." },
              { id: "b", text: "It floods the body with too much oxygen permanently", correct: false, explanation: "The key change is the drop in CO₂, not an oxygen surplus." },
              { id: "c", text: "It stops the heart", correct: false, explanation: "It doesn't stop the heart; it shifts CO₂ levels." },
            ] },
            { id: "q4", type: "mcq", prompt: "The best way to build a meditation habit is to…", options: [
              { id: "a", text: "Anchor a tiny daily practice to an existing routine", correct: true, explanation: "Yes — small, consistent, and attached to a cue." },
              { id: "b", text: "Commit to an hour a day immediately", correct: false, explanation: "That's hard to sustain and often abandoned." },
              { id: "c", text: "Only practice when stressed", correct: false, explanation: "Regularity, not crisis-only, builds the skill." },
            ] },
            { id: "q5", type: "true-false", prompt: "Gentle slow breathing is considered very safe for nearly everyone.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — slow breathing is the safest form of breathwork." },
              { id: "f", text: "False", correct: false, explanation: "Slow breathing is very low risk." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m4",
      title: "Practice & Reality",
      lessons: [
        {
          id: "l12-obstacles",
          title: "Obstacles & the wandering mind, deepened",
          objective: "Recognize common meditation obstacles and respond skillfully.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Every meditator meets the same handful of obstacles. They're so consistent that traditions named them centuries ago. Knowing them by name takes away their power — when restlessness shows up, you can think 'ah, restlessness' instead of 'I'm failing.'" },
            { kind: "table", headers: ["Obstacle", "Feels like", "Skillful response"], rows: [
              ["Restlessness", "Can't sit still; mind races; urge to quit.", "Name it; soften; let the exhale settle you. It passes."],
              ["Drowsiness / dullness", "Sleepy, foggy, nodding off.", "Sit taller, open the eyes, take a brighter breath, or shorten the sit."],
              ["Boredom", "'This is pointless; nothing's happening.'", "Get curious about the boredom itself — it's just another sensation."],
              ["Doubt", "'I'm doing it wrong; it isn't working.'", "Expect it; return to the anchor anyway. Doubt is a thought, not a verdict."],
              ["Striving", "Trying hard to relax or 'get somewhere.'", "Drop the goal; let the practice be ordinary. Ease, not effort."],
            ] },
            { kind: "callout", tone: "tradition", title: "The five hindrances", text: "Buddhist psychology lists 'five hindrances' to meditation: sensory desire, ill will, sloth-and-torpor (drowsiness), restlessness-and-worry, and doubt. The framing is old, but the experience is universal — naming the hindrance is itself part of the antidote." },
            { kind: "callout", tone: "tip", title: "Sleepiness vs. calm", text: "It's easy to confuse drowsiness with deep calm. A clue: calm is alert and clear; drowsiness is foggy and heavy. If you keep nodding off, you may simply be tired — meditation isn't a substitute for sleep. Try practicing earlier, sitting upright, or with eyes open." },
            { kind: "callout", tone: "tip", title: "RAIN: a way to meet hard feelings", text: "When strong emotion arises, a common framework is RAIN: Recognize what's here, Allow it to be present, Investigate it with curiosity (where do I feel it?), and Nurture yourself with kindness. It turns 'make this go away' into 'let me see this clearly.'" },
            { kind: "keyfacts", items: [
              "Common obstacles: restlessness, drowsiness, boredom, doubt, striving.",
              "Naming an obstacle ('ah, doubt') reduces its grip.",
              "Calm is alert and clear; drowsiness is foggy and heavy.",
              "RAIN (Recognize, Allow, Investigate, Nurture) helps with hard feelings.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A skillful response to restlessness in meditation is to…", options: [
              { id: "a", text: "Name it, soften, and let it pass — it's just a passing state", correct: true, explanation: "Correct — naming and allowing takes the edge off." },
              { id: "b", text: "Immediately quit, since restlessness means failure", correct: false, explanation: "Restlessness is normal and passes; quitting isn't needed." },
              { id: "c", text: "Force yourself to feel calm right now", correct: false, explanation: "Forcing calm is striving, which tends to backfire." },
            ] },
            { id: "q2", type: "mcq", prompt: "How can you tell calm from drowsiness?", options: [
              { id: "a", text: "Calm is alert and clear; drowsiness is foggy and heavy", correct: true, explanation: "Correct — clarity is the giveaway." },
              { id: "b", text: "They're identical and interchangeable", correct: false, explanation: "They feel quite different — one is bright, one is dull." },
              { id: "c", text: "Calm always means you're falling asleep", correct: false, explanation: "True calm is wakeful, not sleepy." },
            ] },
            { id: "q3", type: "mcq", prompt: "In the RAIN framework, the 'I' stands for…", options: [
              { id: "a", text: "Investigate — explore the feeling with curiosity", correct: true, explanation: "Correct — Recognize, Allow, Investigate, Nurture." },
              { id: "b", text: "Ignore the feeling completely", correct: false, explanation: "RAIN is about meeting feelings, not ignoring them." },
              { id: "c", text: "Intensify the emotion deliberately", correct: false, explanation: "It's curious investigation, not amplification." },
            ] },
            { id: "q4", type: "true-false", prompt: "Doubt ('this isn't working') is a normal, expected obstacle rather than proof you should stop.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — doubt is a thought to notice, not a verdict." },
              { id: "f", text: "False", correct: false, explanation: "Doubt is one of the classic, expected hindrances." },
            ] },
            { id: "q5", type: "true-false", prompt: "Meditation is an effective substitute for getting enough sleep.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — if you keep nodding off, you may simply need rest." },
              { id: "f", text: "False", correct: true, explanation: "Correct — meditation doesn't replace sleep." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the four-letter acronym (R_A_I_N) for the Recognize–Allow–Investigate–Nurture framework.", options: [], answer: "RAIN", accept: ["rain"], explanation: "RAIN = Recognize, Allow, Investigate, Nurture — a way to meet difficult feelings." },
          ],
        },
        {
          id: "l13-daily-habit",
          title: "Building a daily habit that lasts",
          objective: "Use behavior-design principles to sustain a meditation practice.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "The hardest part of meditation isn't the sitting — it's coming back tomorrow. The good news: habit research gives concrete levers, and they all point the same way: make it small, obvious, and easy." },
            { kind: "list", ordered: true, items: [
              "**Anchor to an existing cue** — pair the sit with something you already do daily ('after I pour my morning coffee, I meditate for two minutes'). This is habit-stacking.",
              "**Start absurdly small** — even one minute. A tiny habit you keep beats a big one you drop. You can always do more once you've started.",
              "**Make it obvious** — leave the cushion out, set a daily reminder, keep the app on your home screen. Reduce the friction to begin.",
              "**Track it lightly** — a simple streak or check-mark gives a small reward and a visible record. Don't let a missed day become a missed week.",
              "**Never miss twice** — one skipped day is life; two in a row is the start of a new (non-)habit. Just restart the next day.",
            ] },
            { kind: "callout", tone: "evidence", title: "How long until it sticks?", text: "A widely cited study (Lally et al., 2010) found new habits took a median of about 66 days to feel automatic — and ranged from 18 to 254 days depending on the person and behavior. The popular '21 days' figure is a myth. Translation: expect it to take a couple of months, and don't quit because it still feels effortful in week two." },
            { kind: "callout", tone: "tip", title: "Consistency beats duration", text: "Two minutes every day builds the habit far more reliably than thirty minutes once a week. The daily repetition is what wires the routine; length can grow later, once showing up is automatic." },
            { kind: "keyfacts", items: [
              "Habit-stack: attach the sit to an existing daily cue.",
              "Start tiny (one minute) and make starting frictionless.",
              "'Never miss twice' keeps a slip from becoming a quit.",
              "Habits take a median ~66 days to feel automatic, not 21.",
              "Daily consistency matters more than session length.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "'Habit-stacking' means…", options: [
              { id: "a", text: "Attaching a new habit to an existing daily routine as its cue", correct: true, explanation: "Correct — e.g., 'after coffee, I meditate.'" },
              { id: "b", text: "Doing many different habits in one giant session", correct: false, explanation: "It's about a cue, not piling on tasks." },
              { id: "c", text: "Only meditating when you remember", correct: false, explanation: "The point is a reliable cue, not chance." },
            ] },
            { id: "q2", type: "mcq", prompt: "Roughly how long did research find new habits take to feel automatic, on average?", options: [
              { id: "a", text: "A median of about 66 days (with wide variation)", correct: true, explanation: "Correct — Lally et al., 2010; far longer than the '21 days' myth." },
              { id: "b", text: "Exactly 21 days for everyone", correct: false, explanation: "The 21-day figure is a popular myth." },
              { id: "c", text: "A single day", correct: false, explanation: "Habits take weeks to months to automate." },
            ] },
            { id: "q3", type: "mcq", prompt: "The 'never miss twice' rule means…", options: [
              { id: "a", text: "One skipped day is fine; just don't let it become two in a row", correct: true, explanation: "Correct — restart the next day before a slip becomes a quit." },
              { id: "b", text: "You must never skip a single day, ever", correct: false, explanation: "One miss is normal; the rule guards against the second." },
              { id: "c", text: "You should meditate twice as long after a miss", correct: false, explanation: "It's about not skipping twice, not doubling duration." },
            ] },
            { id: "q4", type: "true-false", prompt: "Two minutes of meditation every day builds the habit more reliably than thirty minutes once a week.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — daily repetition wires the routine." },
              { id: "f", text: "False", correct: false, explanation: "Consistency beats occasional long sessions." },
            ] },
            { id: "q5", type: "true-false", prompt: "It reliably takes exactly 21 days to form any new habit.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — that's a myth; the real range is roughly 18–254 days." },
              { id: "f", text: "False", correct: true, explanation: "Correct — habit-formation time varies widely, median ~66 days." },
            ] },
          ],
        },
        {
          id: "l14-evidence-deep",
          title: "What the evidence does and doesn't show",
          objective: "Summarize the research honestly, including its strengths and limits.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Meditation is the best-evidenced practice in this library — but 'best-evidenced' is not the same as 'proven cure.' Reading the science honestly means holding two things at once: real, replicated benefits, and genuine limitations in the research." },
            { kind: "callout", tone: "evidence", title: "What the strong evidence supports", text: "The 2014 JAMA Internal Medicine review (Goyal et al.) — 47 randomized trials, ~3,500 participants — found moderate evidence that mindfulness programs reduce anxiety, depression, and pain, with modest effect sizes (~0.3, comparable to an antidepressant in some analyses). Later reviews broadly agree these are real, if modest, effects that build with practice." },
            { kind: "callout", tone: "evidence", title: "What the evidence is weaker on", text: "That same review found low or insufficient evidence for many other claimed benefits — including mood beyond anxiety/depression, attention, sleep, eating, and substance use — and found no evidence that meditation beat active treatments like exercise or medication. Effects on attention and cognition exist in some studies but are smaller and less consistent than popular claims suggest." },
            { kind: "table", headers: ["Claim", "Evidence status"], rows: [
              ["Reduces anxiety, depression, pain", "Moderate — best supported"],
              ["Lowers everyday stress / improves wellbeing", "Low to modest"],
              ["Improves attention / cognition", "Mixed; smaller than often claimed"],
              ["Better than therapy or medication", "Not supported"],
              ["Cures illness / replaces medical care", "Not supported — avoid this claim"],
            ] },
            { kind: "callout", tone: "tip", title: "Why the caveats matter", text: "Many meditation studies have been small, short, or compared meditation to doing nothing (rather than to an active control), which can inflate results. Publication bias — positive findings get published more — also nudges the picture rosy. None of this means meditation doesn't work; it means treat grand claims ('rewires your brain,' 'cures anxiety') with healthy skepticism." },
            { kind: "keyfacts", items: [
              "Strongest evidence: modest benefits for anxiety, depression, pain.",
              "Weak or mixed evidence: general mood, attention, sleep, substance use.",
              "No evidence it beats active treatments like exercise or medication.",
              "Study limits (small samples, weak controls, publication bias) inflate some claims.",
              "It's a helpful practice — not a cure or a replacement for medical care.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which outcomes have the STRONGEST evidence from the major review?", options: [
              { id: "a", text: "Anxiety, depression, and pain", correct: true, explanation: "Correct — moderate evidence for these three." },
              { id: "b", text: "Curing physical illness", correct: false, explanation: "No — that claim isn't supported." },
              { id: "c", text: "Replacing medication entirely", correct: false, explanation: "Evidence does not support that." },
            ] },
            { id: "q2", type: "mcq", prompt: "Compared with active treatments like exercise or medication, meditation was found to be…", options: [
              { id: "a", text: "Not clearly better — no evidence it outperforms them", correct: true, explanation: "Correct — it can help, but not demonstrably more." },
              { id: "b", text: "Dramatically superior to all of them", correct: false, explanation: "The evidence doesn't show superiority." },
              { id: "c", text: "Completely useless", correct: false, explanation: "It has real, if modest, benefits." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which factor can make meditation studies LOOK more effective than they are?", options: [
              { id: "a", text: "Comparing meditation to doing nothing, plus publication bias", correct: true, explanation: "Correct — weak controls and selective publishing inflate results." },
              { id: "b", text: "Using very large, long, well-controlled trials", correct: false, explanation: "Those would make results more trustworthy, not inflated." },
              { id: "c", text: "Pre-registering the study", correct: false, explanation: "Pre-registration reduces bias, not increases it." },
            ] },
            { id: "q4", type: "true-false", prompt: "The evidence for meditation improving attention is as strong as the evidence for reducing anxiety.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — attention findings are mixed and smaller than anxiety findings." },
              { id: "f", text: "False", correct: true, explanation: "Correct — anxiety/depression/pain are better supported than attention." },
            ] },
            { id: "q5", type: "true-false", prompt: "It is accurate to claim meditation 'cures' anxiety or replaces medical care.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — that overstates the evidence and should be avoided." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it helps, but it is not a cure or a replacement for care." },
            ] },
          ],
        },
        {
          id: "l15-when-hard",
          title: "When meditation gets hard — and seeking support",
          objective: "Recognize difficult meditation experiences and know when to seek help.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Meditation is usually pleasant or neutral, but it isn't always gentle. Turning attention inward can surface uncomfortable emotions, restlessness, or difficult memories. This is normal and often passes — but it deserves honest acknowledgment, because the wellness world tends to present meditation as risk-free." },
            { kind: "callout", tone: "evidence", title: "Difficult experiences are real and studied", text: "Research on meditation's adverse effects (e.g., Britton et al., 2021; Farias et al., 2020) finds that unpleasant experiences are fairly common, and that a minority of practitioners report effects lasting beyond a session. Estimates vary widely — some studies report a few percent, others much higher — partly because 'adverse effect' is defined differently. The point isn't fear; it's honesty: meditation has effects, and effects can occasionally be hard." },
            { kind: "list", items: [
              "**Common and usually passing** — restlessness, boredom, emotional ups and downs, surfacing of old feelings or memories.",
              "**Less common, worth attention** — increased anxiety or panic, low mood, trouble sleeping, feeling spaced-out or 'unreal' (dissociation), or re-experiencing trauma.",
            ] },
            { kind: "callout", tone: "safety", title: "When to ease off or seek support", text: "If meditation consistently increases your distress, triggers panic or dissociation, or stirs up trauma you can't settle, that's a signal to pause or change approach — not to push harder. Shorten sessions, choose grounding anchors (feet, sounds, eyes open), and reach out to a mental-health professional. People with PTSD, psychosis, severe depression, or significant anxiety especially benefit from working with a trained, trauma-sensitive teacher or clinician rather than going it alone." },
            { kind: "callout", tone: "tip", title: "Hard isn't the same as harmful", text: "A wave of sadness or a restless sit is part of the terrain and often where the growth is — that's different from sustained, worsening distress. The rule of thumb: difficulty that settles and teaches is fine; distress that persists, intensifies, or spills into daily life is your cue to get support." },
            { kind: "keyfacts", items: [
              "Inward attention can surface difficult emotions or memories — this is normal.",
              "A minority of people experience effects that persist beyond a session.",
              "Warning signs: persistent anxiety/panic, dissociation, re-experiencing trauma.",
              "Response: ease off, ground, shorten — don't push harder.",
              "Seek a trauma-sensitive teacher or clinician if distress persists or worsens.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Turning attention inward during meditation can sometimes…", options: [
              { id: "a", text: "Surface uncomfortable emotions or difficult memories", correct: true, explanation: "Correct — this is normal and usually passes, but worth acknowledging." },
              { id: "b", text: "Guarantee you feel blissful every time", correct: false, explanation: "Meditation isn't always pleasant." },
              { id: "c", text: "Make any emotional experience impossible", correct: false, explanation: "The opposite — feelings can become more vivid." },
            ] },
            { id: "q2", type: "mcq", prompt: "If meditation consistently increases your distress or triggers panic, the best response is to…", options: [
              { id: "a", text: "Ease off, ground yourself, and seek professional support", correct: true, explanation: "Correct — pause and get help; don't push harder." },
              { id: "b", text: "Push through it harder and longer to break past it", correct: false, explanation: "Pushing through can worsen things; ease off instead." },
              { id: "c", text: "Ignore it and assume it's always beneficial", correct: false, explanation: "Persistent distress is a signal to change approach." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which is a warning sign worth taking seriously?", options: [
              { id: "a", text: "Persistent panic, dissociation, or re-experiencing trauma", correct: true, explanation: "Correct — these warrant easing off and seeking support." },
              { id: "b", text: "A single restless or boring session", correct: false, explanation: "That's ordinary and usually passes." },
              { id: "c", text: "Feeling slightly calmer afterward", correct: false, explanation: "That's a benefit, not a warning sign." },
            ] },
            { id: "q4", type: "true-false", prompt: "Research confirms that meditation occasionally produces difficult or adverse experiences for some people.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — studies document a range of difficult experiences." },
              { id: "f", text: "False", correct: false, explanation: "Adverse experiences are real and documented." },
            ] },
            { id: "q5", type: "true-false", prompt: "People with PTSD or psychosis should always meditate intensively alone, without any professional guidance.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they especially benefit from a trauma-sensitive teacher or clinician." },
              { id: "f", text: "False", correct: true, explanation: "Correct — guided, supported practice is safer for those conditions." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the word for feeling spaced-out, detached, or 'unreal' — a less-common but notable difficult experience.", options: [], answer: "dissociation", accept: ["dissociating", "dissociative", "depersonalization"], explanation: "Dissociation (feeling detached or unreal) is a warning sign worth easing off and seeking support for." },
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
    { id: "f2", type: "mcq", prompt: "The strongest evidence for meditation supports benefits for…", options: [
      { id: "a", text: "Anxiety, depression, and pain", correct: true },
      { id: "b", text: "Curing every illness instantly", correct: false },
      { id: "c", text: "Nothing at all", correct: false },
      { id: "d", text: "Only physical strength", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "The modern secular practice most studied in the West grew from…", options: [
      { id: "a", text: "Mindfulness-Based Stress Reduction (MBSR), 1979", correct: true },
      { id: "b", text: "A 2010 smartphone app", correct: false },
      { id: "c", text: "A pharmaceutical trial", correct: false },
      { id: "d", text: "A government fitness program", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "When your mind wanders, you should…", options: [
      { id: "a", text: "Gently return to the anchor — that IS the practice", correct: true },
      { id: "b", text: "Quit, since you failed", correct: false },
      { id: "c", text: "Get angry at yourself", correct: false },
      { id: "d", text: "Try never to think again", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "A focused-attention practice is one that…", options: [
      { id: "a", text: "Rests on a single anchor and returns when you drift", correct: true },
      { id: "b", text: "Drops any anchor and watches whatever arises", correct: false },
      { id: "c", text: "Sends warm wishes to others", correct: false },
      { id: "d", text: "Requires lying down", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Open monitoring meditation means…", options: [
      { id: "a", text: "Noticing whatever arises, without a single fixed anchor", correct: true },
      { id: "b", text: "Staring at one point forever", correct: false },
      { id: "c", text: "Keeping eyes wide open", correct: false },
      { id: "d", text: "Holding the breath", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "For a beginner, a good session is…", options: [
      { id: "a", text: "3–5 minutes, done consistently", correct: true },
      { id: "b", text: "One hour minimum", correct: false },
      { id: "c", text: "Only when stressed", correct: false },
      { id: "d", text: "Never — it can't be learned", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "In breath-focused meditation, you…", options: [
      { id: "a", text: "Observe the natural breath without controlling it", correct: true },
      { id: "b", text: "Breathe as fast as possible", correct: false },
      { id: "c", text: "Hold your breath throughout", correct: false },
      { id: "d", text: "Ignore the breath entirely", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "A body scan is…", options: [
      { id: "a", text: "Moving attention through the body, noticing sensations", correct: true },
      { id: "b", text: "Tensing every muscle hard", correct: false },
      { id: "c", text: "A medical imaging test", correct: false },
      { id: "d", text: "Counting your steps", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Loving-kindness (metta) meditation cultivates…", options: [
      { id: "a", text: "Warmth and goodwill for self and others", correct: true },
      { id: "b", text: "Self-criticism", correct: false },
      { id: "c", text: "Maximum heart rate", correct: false },
      { id: "d", text: "Sleepiness", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "A 'dignified' meditation posture is…", options: [
      { id: "a", text: "Upright but relaxed, not rigid or slumped", correct: true },
      { id: "b", text: "As tense and rigid as possible", correct: false },
      { id: "c", text: "Fully slumped over", correct: false },
      { id: "d", text: "Only ever cross-legged on the floor", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "Diaphragmatic ('belly') breathing tends to be…", options: [
      { id: "a", text: "Slower, more efficient, and more relaxing", correct: true },
      { id: "b", text: "Faster, shallower, and more anxious", correct: false },
      { id: "c", text: "The same as breath-holding", correct: false },
      { id: "d", text: "Only possible while standing", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "Slow breathing calms the body via…", options: [
      { id: "a", text: "The parasympathetic ('rest and digest') response", correct: true },
      { id: "b", text: "The fight-or-flight response", correct: false },
      { id: "c", text: "Stopping circulation", correct: false },
      { id: "d", text: "Nothing physical", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "A calming slow-breathing pace is about…", options: [
      { id: "a", text: "5–6 breaths per minute with a long exhale", correct: true },
      { id: "b", text: "40 fast breaths per minute", correct: false },
      { id: "c", text: "One breath per minute", correct: false },
      { id: "d", text: "As fast as possible", correct: false },
    ] },
    { id: "f15", type: "mcq", prompt: "Box breathing is…", options: [
      { id: "a", text: "Inhale 4, hold 4, exhale 4, hold 4", correct: true },
      { id: "b", text: "Inhale 4, hold 7, exhale 8", correct: false },
      { id: "c", text: "Rapid forced breaths", correct: false },
      { id: "d", text: "A 60-second breath hold", correct: false },
    ] },
    { id: "f16", type: "mcq", prompt: "The 4-7-8 pattern is…", options: [
      { id: "a", text: "Inhale 4, hold 7, exhale 8", correct: true },
      { id: "b", text: "Inhale 8, hold 7, exhale 4", correct: false },
      { id: "c", text: "Four fast breaths", correct: false },
      { id: "d", text: "Hold for 7 minutes", correct: false },
    ] },
    { id: "f17", type: "mcq", prompt: "Which breathwork carries the most caution?", options: [
      { id: "a", text: "Intense, rapid hyperventilation styles", correct: true },
      { id: "b", text: "Gentle slow breathing", correct: false },
      { id: "c", text: "Normal breathing", correct: false },
      { id: "d", text: "Counting breaths", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "You should never do intense breathwork…", options: [
      { id: "a", text: "In or near water, or while driving", correct: true },
      { id: "b", text: "Seated safely at home", correct: false },
      { id: "c", text: "With your eyes closed", correct: false },
      { id: "d", text: "In the morning", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "Rapid over-breathing causes dizziness and tingling mainly because it…", options: [
      { id: "a", text: "Lowers blood CO₂, narrowing vessels to the brain", correct: true },
      { id: "b", text: "Permanently floods the body with oxygen", correct: false },
      { id: "c", text: "Stops the heart", correct: false },
      { id: "d", text: "Has no real physical effect", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "The best way to build a meditation habit is to…", options: [
      { id: "a", text: "Anchor a tiny daily practice to an existing cue", correct: true },
      { id: "b", text: "Commit to an hour a day immediately", correct: false },
      { id: "c", text: "Only practice when stressed", correct: false },
      { id: "d", text: "Wait until you feel perfectly ready", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "Research suggests a new habit takes, on average, about…", options: [
      { id: "a", text: "66 days to feel automatic (with wide variation)", correct: true },
      { id: "b", text: "Exactly 21 days for everyone", correct: false },
      { id: "c", text: "A single day", correct: false },
      { id: "d", text: "Ten years", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "Compared with active treatments like exercise or medication, meditation is…", options: [
      { id: "a", text: "Not clearly better — no evidence it outperforms them", correct: true },
      { id: "b", text: "Proven dramatically superior to all of them", correct: false },
      { id: "c", text: "Completely without any benefit", correct: false },
      { id: "d", text: "A guaranteed cure for illness", correct: false },
    ] },
    { id: "f23", type: "mcq", prompt: "If meditation consistently triggers panic or dissociation, you should…", options: [
      { id: "a", text: "Ease off, ground yourself, and seek professional support", correct: true },
      { id: "b", text: "Push through it harder and longer", correct: false },
      { id: "c", text: "Assume it's always harmless and ignore it", correct: false },
      { id: "d", text: "Meditate even more intensely alone", correct: false },
    ] },
    { id: "f24", type: "mcq", prompt: "Which is a classic meditation obstacle ('hindrance')?", options: [
      { id: "a", text: "Restlessness, drowsiness, or doubt", correct: true },
      { id: "b", text: "Having a comfortable chair", correct: false },
      { id: "c", text: "Using a gentle timer", correct: false },
      { id: "d", text: "Breathing through the nose", correct: false },
    ] },
    { id: "f25", type: "true-false", prompt: "A small, consistent daily practice beats an ambitious plan you abandon.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f26", type: "true-false", prompt: "Meditation is a substitute for therapy or medication when those are needed.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f27", type: "true-false", prompt: "It reliably takes exactly 21 days to form any new habit.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f28", type: "true-false", prompt: "Meditation can occasionally surface difficult emotions or memories for some people.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
