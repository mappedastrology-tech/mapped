import type { Course } from "../types";

/** FLAGSHIP #10 — Dreamwork: the sleep science plus the symbolism. */
export const dreamsFoundations: Course = {
  id: "dreams-foundations",
  domain: "dreams",
  title: "Dreamwork & Dream Journaling",
  subtitle: "The science and symbolism of dreams",
  level: "foundations",
  icon: "💤",
  summary:
    "Learn why we dream (the real sleep science) and how to keep a dream journal and work with dream symbolism for reflection.",
  estMinutes: 55,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,
  safetyNote:
    "If nightmares are frequent, distressing, or tied to trauma, treat that as a reason to reach out to a doctor or therapist — effective treatments exist. Dreamwork here is for reflection, not diagnosis.",

  outline: [
    { module: "The Science", lessons: ["Sleep cycles & REM", "Sleep stages: where dreaming lives", "What dreams are (and aren't)", "Why we dream: the leading theories"] },
    { module: "Working With Dreams", lessons: ["Keeping a dream journal", "Symbols & personal meaning", "Common dream themes", "Recurring dreams & nightmares", "Lucid dreaming basics"] },
    { module: "Dreams Across Cultures", lessons: ["Dreams in history & culture"] },
  ],

  modules: [
    {
      id: "m1",
      title: "The Science",
      lessons: [
        {
          id: "l1-sleep-cycles",
          title: "Sleep cycles & REM",
          objective: "Explain when dreaming happens during sleep.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Sleep isn't uniform — it moves through stages in cycles of about 90 minutes, several times a night. Each cycle passes through lighter and deeper non-REM sleep and then into REM (rapid eye movement) sleep." },
            { kind: "text", text: "A typical night runs through four to five of these cycles. The mix shifts as the night goes on: deep non-REM dominates the early cycles, while REM periods grow longer toward morning. That tilt is why the dream you remember is usually the one you woke up from just before the alarm." },
            { kind: "callout", tone: "history", title: "REM is prime dreaming time", text: "The most vivid, story-like dreams happen in REM sleep, when the brain is highly active but the body is temporarily paralyzed (so you don't act dreams out). REM periods get longer toward morning — which is why you often wake from a vivid dream. You can dream in other stages too, but REM dreams are the memorable ones." },
            { kind: "callout", tone: "history", title: "How REM was discovered", text: "In 1953, researchers Eugene Aserinsky and Nathaniel Kleitman noticed sleepers' eyes darting beneath closed lids at certain times of night. Waking people during those bursts produced vivid dream reports far more often than waking them at other times — the first hard link between an observable brain state and dreaming." },
            { kind: "keyfacts", items: [
              "Sleep cycles last about 90 minutes and repeat four to five times a night.",
              "Vivid dreams happen mostly in REM (rapid eye movement) sleep.",
              "REM periods lengthen toward morning, so morning dreams feel longest.",
              "Everyone dreams multiple times a night, even if they don't remember it.",
              "In REM, the body is briefly paralyzed (atonia) so you don't physically act out dreams.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The most vivid, story-like dreams happen during…", options: [
              { id: "a", text: "REM (rapid eye movement) sleep", correct: true, explanation: "Correct — the brain is very active in REM." },
              { id: "b", text: "The deepest non-REM sleep only", correct: false, explanation: "Vivid dreams are mainly a REM phenomenon." },
              { id: "c", text: "Only when you're awake", correct: false, explanation: "Dreams happen during sleep." },
            ] },
            { id: "q2", type: "mcq", prompt: "A full sleep cycle lasts roughly…", options: [
              { id: "a", text: "90 minutes, repeating through the night", correct: true, explanation: "Yes — four to five cycles per night." },
              { id: "b", text: "8 hours, just once", correct: false, explanation: "Cycles are ~90 minutes and repeat." },
              { id: "c", text: "10 seconds", correct: false, explanation: "Far too short for a cycle." },
            ] },
            { id: "q3", type: "mcq", prompt: "Why do you tend to remember a dream from just before waking?", options: [
              { id: "a", text: "REM periods grow longer toward morning", correct: true, explanation: "Right — the longest, most vivid REM comes late in the night." },
              { id: "b", text: "Deep sleep increases toward morning", correct: false, explanation: "Deep non-REM is heaviest early in the night." },
              { id: "c", text: "You only dream once per night", correct: false, explanation: "You dream several times nightly." },
            ] },
            { id: "q4", type: "true-false", prompt: "People who 'never dream' actually don't dream at all.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — nearly everyone dreams nightly; they just don't recall it." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's a recall difference, not an absence of dreaming." },
            ] },
            { id: "q5", type: "true-false", prompt: "During REM sleep the body is briefly paralyzed.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — REM atonia keeps you from acting out dreams." },
              { id: "f", text: "False", correct: false, explanation: "The muscles are temporarily inhibited during REM." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the three-letter abbreviation for the sleep stage where the most vivid dreams occur.", options: [], answer: "REM", accept: ["rem", "r.e.m.", "rapid eye movement"], explanation: "REM = rapid eye movement sleep, the stage of vivid, story-like dreams." },
          ],
        },
        {
          id: "l2-sleep-stages",
          title: "Sleep stages: where dreaming lives",
          objective: "Identify the NREM and REM stages and where dreaming concentrates.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Modern sleep labs split a night into four stages: three non-REM (NREM) stages plus REM. The NREM stages are graded N1, N2, and N3 — roughly light, intermediate, and deep — and a full cycle climbs down into them and back up into REM." },
            { kind: "table", headers: ["Stage", "What it is", "Share of night", "Dreaming?"], rows: [
              ["N1", "Lightest sleep; the drift-off", "~5%", "Brief, fragmentary"],
              ["N2", "Light sleep; sleep spindles", "~45–55%", "Some, simpler"],
              ["N3", "Deep slow-wave sleep", "~15–20%", "Less common, vaguer"],
              ["REM", "Rapid eye movement", "~20–25%", "Most vivid & story-like"],
            ] },
            { kind: "text", text: "The numbers are approximate and shift with age — newborns spend close to half their sleep in REM, while older adults get less deep N3. The order matters too: you generally pass N1 → N2 → N3 → back up to N2 → REM, then repeat." },
            { kind: "callout", tone: "evidence", title: "Dreaming isn't ONLY REM", text: "REM gives the most vivid, narrative dreams, but careful lab studies show people report dream-like experiences from NREM too — they're usually shorter, more thought-like, and less bizarre. So 'dreaming = REM' is a useful rule of thumb, not an absolute." },
            { kind: "callout", tone: "evidence", title: "What the brain is doing", text: "In REM the brain's emotional and visual areas light up while regions handling logic and self-monitoring quiet down. That pattern helps explain why dreams feel intensely real and emotional yet accept impossible events without question." },
            { kind: "keyfacts", items: [
              "Four stages: N1, N2, N3 (all NREM) and REM.",
              "N2 is the single largest share of a normal night.",
              "N3 (deep, slow-wave sleep) is heaviest early in the night.",
              "REM share is highest in infancy and declines with age.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which stages are the NREM (non-REM) stages?", options: [
              { id: "a", text: "N1, N2, and N3", correct: true, explanation: "Correct — the three NREM stages, plus REM, make four total." },
              { id: "b", text: "Only REM", correct: false, explanation: "REM is the non-NREM stage." },
              { id: "c", text: "N1 and REM only", correct: false, explanation: "There are three NREM stages: N1, N2, N3." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which stage takes up the largest share of a typical night?", options: [
              { id: "a", text: "N2", correct: true, explanation: "Right — N2 is roughly 45–55% of sleep." },
              { id: "b", text: "REM", correct: false, explanation: "REM is about 20–25%." },
              { id: "c", text: "N1", correct: false, explanation: "N1 is only about 5%." },
            ] },
            { id: "q3", type: "mcq", prompt: "Compared with REM dreams, NREM dream reports are usually…", options: [
              { id: "a", text: "Shorter and more thought-like", correct: true, explanation: "Yes — less vivid and less bizarre than REM dreams." },
              { id: "b", text: "Always longer and more vivid", correct: false, explanation: "That describes REM dreams." },
              { id: "c", text: "Completely impossible", correct: false, explanation: "NREM dreaming does occur, just more subtly." },
            ] },
            { id: "q4", type: "true-false", prompt: "Deep slow-wave sleep (N3) is heaviest early in the night.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — N3 dominates early cycles; REM dominates later ones." },
              { id: "f", text: "False", correct: false, explanation: "N3 is front-loaded; REM grows toward morning." },
            ] },
            { id: "q5", type: "true-false", prompt: "Dreaming happens exclusively in REM sleep and never in NREM.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — NREM produces dream reports too, just less vivid." },
              { id: "f", text: "False", correct: true, explanation: "Correct — REM dreams are most vivid, but NREM dreaming exists." },
            ] },
          ],
        },
        {
          id: "l3-what-dreams-are",
          title: "What dreams are (and aren't)",
          objective: "Understand what dreams are and how to work with them as a personal language.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "A dream is a sequence of images, feelings, and sensations the mind generates during sleep — mostly involuntary, often strange, and usually forgotten. It's a normal product of a sleeping brain, not a signal beamed in from outside." },
            { kind: "text", text: "Dreams draw on the raw material of your own life: people you know, places you've been, things that worried or excited you. That's why they feel personal — they are stitched together from your memories and concerns, not from a universal script." },
            { kind: "callout", tone: "tradition", title: "A personal language, not a fixed code", text: "The most rewarding way to work with dreams is as a deeply personal language. A one-size-fits-all 'dream dictionary' will rarely fit you, because dream images are stitched from your own life and concerns. That's exactly what makes reflecting on them so useful — your associations are the key, and the meaning is yours to draw out." },
            { kind: "callout", tone: "tip", title: "Working with your own associations", text: "When a dream stays with you, the richest move is to ask what its images mean to you — where they touch your real life, your worries, your hopes. That personal inquiry is where dream work does its real work, far more than any generic symbol lookup." },
            { kind: "list", items: [
              "Dreams are **generated by your own brain** from the material of your life.",
              "They are **mostly forgotten** — recall is the exception, not the rule.",
              "They speak a **deeply personal language** — your associations are the key.",
              "A generic 'dream dictionary' rarely fits; **the meaning is yours to draw out**.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A dream is best described as…", options: [
              { id: "a", text: "Imagery and feeling the brain generates during sleep", correct: true, explanation: "Correct — it's an internal product of a sleeping brain." },
              { id: "b", text: "A message sent from outside the mind", correct: false, explanation: "No evidence supports external 'messages.'" },
              { id: "c", text: "A literal preview of tomorrow", correct: false, explanation: "A dream is an inner experience to reflect on, not a preview of events." },
            ] },
            { id: "q2", type: "mcq", prompt: "When a dream seems to 'come true,' the likeliest reason is…", options: [
              { id: "a", text: "Selective memory and confirmation bias", correct: true, explanation: "Right — we remember rare hits and forget the misses." },
              { id: "b", text: "A glitch in time", correct: false, explanation: "Memory effects, not time travel, are the simpler explanation." },
              { id: "c", text: "Your phone listening to you", correct: false, explanation: "It's how memory works, not surveillance." },
            ] },
            { id: "q3", type: "mcq", prompt: "Dreams feel personal because they are built from…", options: [
              { id: "a", text: "Your own memories, people, and concerns", correct: true, explanation: "Yes — that's why your associations matter when reflecting." },
              { id: "b", text: "A universal symbol script everyone shares", correct: false, explanation: "There's no fixed universal script." },
              { id: "c", text: "Random static unrelated to your life", correct: false, explanation: "Dreams draw heavily on your real life." },
            ] },
            { id: "q4", type: "true-false", prompt: "Dreams speak a personal language, so your own associations matter more than a generic 'dream dictionary.'", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — dream images are stitched from your own life, so your associations are the key." },
              { id: "f", text: "False", correct: false, explanation: "A one-size-fits-all dictionary rarely fits; the meaning is personal to you." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the two-word term (memory bias) for remembering dreams that seemed to 'come true' while forgetting the ones that didn't.", options: [], answer: "confirmation bias", accept: ["confirmation-bias", "selective memory"], explanation: "Confirmation bias: we notice and remember the hits and quietly drop the misses." },
          ],
        },
        {
          id: "l4-why-we-dream",
          title: "Why we dream: the leading theories",
          objective: "Summarize the main scientific theories of why we dream.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Science doesn't have one final answer for why we dream, but several well-supported ideas overlap. They aren't rivals so much as different angles on the same puzzle." },
            { kind: "table", headers: ["Theory", "Core idea", "What supports it"], rows: [
              ["Memory consolidation", "Sleep sorts, stores, and links memories", "Sleep measurably improves learning & recall"],
              ["Emotional processing", "Dreams help digest feelings and stress", "Emotional memories soften over a night of REM"],
              ["Threat / social simulation", "Dreams rehearse situations safely", "Dream content is rich in threats & social scenes"],
              ["Activation–synthesis", "Brain weaves a story over random REM signals", "Explains dream bizarreness and discontinuity"],
            ] },
            { kind: "callout", tone: "evidence", title: "Likely several at once", text: "Most researchers think dreaming probably serves more than one function — and that some dream content may simply be a by-product of the sleeping brain doing other jobs. 'We don't fully know yet' is the honest, current answer." },
            { kind: "callout", tone: "history", title: "From Freud to the lab", text: "Sigmund Freud's 1899 idea that dreams disguise hidden wishes was hugely influential but isn't supported as a testable mechanism. The shift to measuring sleep in labs (after REM's discovery in 1953) moved dream science from interpretation toward evidence." },
            { kind: "keyfacts", items: [
              "Memory consolidation: sleep helps store and connect what you learn.",
              "Emotional processing: REM seems to take the edge off emotional memories.",
              "Simulation: dreams may rehearse threats and social situations.",
              "Activation–synthesis: the brain narrates random REM activity.",
              "These theories likely work together; none is the single 'answer.'",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which is a leading scientific theory of why we dream?", options: [
              { id: "a", text: "Memory consolidation and emotional processing", correct: true, explanation: "Correct — well-supported, overlapping theories." },
              { id: "b", text: "Receiving messages from the future", correct: false, explanation: "No evidence supports prediction." },
              { id: "c", text: "Nothing happens in the brain during dreams", correct: false, explanation: "The brain is highly active, especially in REM." },
            ] },
            { id: "q2", type: "mcq", prompt: "The 'activation–synthesis' idea proposes that dreams are…", options: [
              { id: "a", text: "A story the brain weaves over random REM signals", correct: true, explanation: "Right — it explains dream bizarreness." },
              { id: "b", text: "Precise predictions of the future", correct: false, explanation: "It's about narration of internal signals, not prophecy." },
              { id: "c", text: "Messages from a universal code", correct: false, explanation: "No fixed code is involved." },
            ] },
            { id: "q3", type: "mcq", prompt: "The most honest summary of why we dream is…", options: [
              { id: "a", text: "Probably several overlapping functions; not fully settled", correct: true, explanation: "Yes — multiple theories, no single final answer yet." },
              { id: "b", text: "One proven, single purpose", correct: false, explanation: "There's no single proven purpose." },
              { id: "c", text: "Dreams have no connection to the brain", correct: false, explanation: "Dreaming is clearly a brain process." },
            ] },
            { id: "q4", type: "true-false", prompt: "Freud's theory that dreams disguise hidden wishes is a well-tested scientific mechanism.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it was influential but isn't supported as a testable mechanism." },
              { id: "f", text: "False", correct: true, explanation: "Correct — modern dream science rests on lab evidence, not Freud's model." },
            ] },
            { id: "q5", type: "true-false", prompt: "Sleep and dreaming appear to help consolidate memories.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — sleep measurably improves learning and recall." },
              { id: "f", text: "False", correct: false, explanation: "Memory consolidation is one of the best-supported functions of sleep." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Working With Dreams",
      lessons: [
        {
          id: "l5-dream-journal",
          title: "Keeping a dream journal",
          objective: "Set up a dream-journaling habit that improves recall.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Dreams fade within minutes of waking, so the key is to capture them immediately. A dream journal both preserves dreams and, over time, noticeably improves how much you remember." },
            { kind: "list", ordered: true, items: [
              "Keep a notebook or your phone within reach of the bed.",
              "Before sleep, set an intention to remember your dreams.",
              "On waking, stay still for a moment and let the dream come back before you move or check your phone.",
              "Write down whatever you can — images, feelings, fragments — even just a few words.",
              "Note the emotion of the dream, not only the events.",
              "Add the date and a short title so themes are easy to spot later.",
            ] },
            { kind: "callout", tone: "tip", title: "Recall grows with practice", text: "Don't worry if early entries are sparse. Simply trying to recall dreams trains your brain to hold onto them, and recall usually improves within a week or two." },
            { kind: "callout", tone: "tip", title: "Why it improves with use", text: "Setting an intention to remember is a form of 'prospective memory' — a note-to-self that primes you to notice and hold the dream on waking. Reviewing past entries also teaches you your own recurring images, which makes new dreams easier to catch." },
            { kind: "callout", tone: "evidence", title: "What a journal can and can't do", text: "A journal is a reflection tool: it surfaces patterns, moods, and preoccupations worth thinking about. It is not a diagnostic instrument and won't reveal fixed 'meanings.' Treat entries as prompts for self-reflection, not verdicts." },
            { kind: "keyfacts", items: [
              "Capture dreams in the first minute or two after waking.",
              "Stillness and no screens protect the fragile memory.",
              "Record feelings, not just events.",
              "Recall typically improves within one to two weeks of practice.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Why record dreams immediately on waking?", options: [
              { id: "a", text: "Dreams fade within minutes of waking", correct: true, explanation: "Correct — capture them fast before they vanish." },
              { id: "b", text: "Dreams only exist if written down", correct: false, explanation: "They happen regardless; writing preserves recall." },
              { id: "c", text: "It's required by law", correct: false, explanation: "It's just practical for memory." },
            ] },
            { id: "q2", type: "mcq", prompt: "A good first step on waking is to…", options: [
              { id: "a", text: "Stay still and let the dream return before moving", correct: true, explanation: "Yes — movement and screens scatter the memory." },
              { id: "b", text: "Immediately check social media", correct: false, explanation: "That erases the fragile dream memory." },
              { id: "c", text: "Jump out of bed quickly", correct: false, explanation: "Sudden movement makes recall harder." },
            ] },
            { id: "q3", type: "mcq", prompt: "Setting an intention to remember your dreams works because it uses…", options: [
              { id: "a", text: "Prospective memory — a primed note-to-self", correct: true, explanation: "Right — it primes you to notice and hold the dream." },
              { id: "b", text: "A guarantee of lucid dreaming", correct: false, explanation: "It helps recall, not guaranteed lucidity." },
              { id: "c", text: "Nothing — intention has no effect", correct: false, explanation: "Intention measurably aids recall." },
            ] },
            { id: "q4", type: "true-false", prompt: "Simply trying to recall dreams tends to improve dream recall over time.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it trains the habit; recall grows." },
              { id: "f", text: "False", correct: false, explanation: "Recall genuinely improves with practice." },
            ] },
            { id: "q5", type: "true-false", prompt: "A dream journal is a diagnostic tool that reveals fixed meanings.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's a reflection tool, not a diagnostic instrument." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it surfaces patterns to reflect on, not verdicts." },
            ] },
          ],
        },
        {
          id: "l6-symbols",
          title: "Symbols & personal meaning",
          objective: "Interpret a dream symbol through personal association.",
          estMinutes: 4,
          blocks: [
            { kind: "sort", prompt: "Common dream symbols", instructions: "Tap a symbol, then tap the feeling it often reflects — though yours may differ", groups: [
              { name: "Anxiety", accent: "#c0392b", items: ["Teeth falling out", "Being chased", "Falling"] },
              { name: "Freedom", accent: "#2e86c1", items: ["Flying", "Open sky"] },
              { name: "Transition", accent: "#6a9a4a", items: ["New rooms in a house", "Packing to move"] },
            ] },
            { kind: "text", text: "Dream symbols are best read through your own associations, not a one-size-fits-all dictionary. A dog might mean loyalty to one person and fear to another, depending on their life." },
            { kind: "callout", tone: "tip", title: "How to question a symbol", text: "When a striking image appears, ask yourself: What does this remind me of in my waking life? What was I feeling toward it in the dream? What's going on right now that this could mirror? The answers — not a generic meaning — are where the insight lives." },
            { kind: "callout", tone: "tradition", title: "Themes can rhyme", text: "Some broad themes do recur across people (falling, being chased, losing teeth, being unprepared for a test). These often connect to common feelings — loss of control, anxiety, pressure — but the specific meaning is still personal to you." },
            { kind: "callout", tone: "evidence", title: "Why dream dictionaries fail", text: "Mass-market 'dream dictionaries' assign one fixed meaning to each symbol (water = emotion, snake = betrayal). But studies of dream content show meaning depends on the dreamer's own life and culture, so a single universal key can't be right. Use your associations as the dictionary." },
            { kind: "list", items: [
              "Start from **your feeling** in the dream, not the object alone.",
              "Ask what the image **reminds you of** right now.",
              "Treat any 'meaning' as a **hypothesis**, not a fact.",
              "Notice **patterns across entries** rather than decoding one image.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The best way to interpret a dream symbol is…", options: [
              { id: "a", text: "Through your own associations and current life", correct: true, explanation: "Correct — personal meaning beats a fixed dictionary." },
              { id: "b", text: "By looking up its one 'true' meaning online", correct: false, explanation: "Symbols aren't universal codes." },
              { id: "c", text: "By ignoring it entirely", correct: false, explanation: "Striking images are worth reflecting on." },
            ] },
            { id: "q2", type: "mcq", prompt: "Common themes like being chased or unprepared often connect to…", options: [
              { id: "a", text: "Feelings like anxiety, pressure, or loss of control", correct: true, explanation: "Yes — though the specifics stay personal." },
              { id: "b", text: "A guaranteed future event", correct: false, explanation: "Dreams aren't predictive." },
              { id: "c", text: "Nothing at all", correct: false, explanation: "They usually mirror real feelings." },
            ] },
            { id: "q3", type: "mcq", prompt: "Mass-market 'dream dictionaries' are unreliable mainly because…", options: [
              { id: "a", text: "Meaning depends on the dreamer's own life and culture", correct: true, explanation: "Right — no single universal key fits everyone." },
              { id: "b", text: "They are too expensive", correct: false, explanation: "The problem is accuracy, not price." },
              { id: "c", text: "They list too few symbols", correct: false, explanation: "More entries wouldn't fix a wrong premise." },
            ] },
            { id: "q4", type: "true-false", prompt: "The same dream symbol means exactly the same thing for everyone.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — meaning depends on your associations." },
              { id: "f", text: "False", correct: true, explanation: "Correct — symbols are personal." },
            ] },
            { id: "q5", type: "true-false", prompt: "An interpretation of a dream symbol is best treated as a hypothesis, not a fact.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — hold it lightly and check it against your life." },
              { id: "f", text: "False", correct: false, explanation: "Fixed certainty about a symbol's meaning isn't warranted." },
            ] },
          ],
        },
        {
          id: "l7-common-themes",
          title: "Common dream themes",
          objective: "Recognize widely shared dream themes and explore what they mean for you.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Surveys across many countries find a surprisingly consistent menu of common dreams: falling, being chased, flying, teeth falling out, being unprepared for a test or exam, arriving somewhere undressed, and being late. The themes recur — but what they mean still belongs to the dreamer." },
            { kind: "table", headers: ["Common theme", "Often linked feeling", "Reflection prompt"], rows: [
              ["Falling", "Loss of control, insecurity", "Where do I feel I'm slipping?"],
              ["Being chased", "Avoidance, pressure", "What am I running from right now?"],
              ["Flying", "Freedom, release, ambition", "Where do I want more freedom?"],
              ["Teeth falling out", "Anxiety, self-image, change", "What change feels out of my hands?"],
              ["Unprepared for a test", "Performance pressure, self-doubt", "Where do I feel judged or tested?"],
              ["Being undressed in public", "Exposure, vulnerability", "Where do I feel seen or exposed?"],
            ] },
            { kind: "callout", tone: "culture", title: "Shared themes, personal meanings", text: "That falling shows up worldwide doesn't mean falling has one universal message. Shared themes likely reflect shared human experiences (we all know pressure and exposure), while the specific trigger is your own. The table's 'linked feeling' is a starting question, not a verdict." },
            { kind: "callout", tone: "evidence", title: "Don't over-read a single dream", text: "One striking dream is weak evidence about your life. Patterns across many entries — the same theme returning during a stressful month — say far more than any one night. Look for trends, not omens." },
            { kind: "keyfacts", items: [
              "Common themes (falling, chasing, flying, teeth) recur across cultures.",
              "They tend to echo shared feelings: control, pressure, exposure, freedom.",
              "The specific meaning is still personal to the dreamer.",
              "Patterns across entries matter more than any single dream.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Dreams of being chased most commonly connect to…", options: [
              { id: "a", text: "Avoidance or pressure in waking life", correct: true, explanation: "Correct — a useful reflection prompt, not a fixed meaning." },
              { id: "b", text: "A literal pursuer arriving tomorrow", correct: false, explanation: "Dreams aren't predictive." },
              { id: "c", text: "Nothing worth reflecting on", correct: false, explanation: "The feeling behind it can be informative." },
            ] },
            { id: "q2", type: "mcq", prompt: "That falling dreams appear worldwide tells us that…", options: [
              { id: "a", text: "Shared themes reflect shared human feelings, not one fixed message", correct: true, explanation: "Right — common feeling, personal trigger." },
              { id: "b", text: "Falling has one universal meaning for all people", correct: false, explanation: "The specific meaning stays personal." },
              { id: "c", text: "Everyone is predicting the same future", correct: false, explanation: "Dreams aren't omens." },
            ] },
            { id: "q3", type: "mcq", prompt: "To learn the most from your dreams, you should weigh…", options: [
              { id: "a", text: "Patterns across many entries over time", correct: true, explanation: "Yes — trends say more than any single night." },
              { id: "b", text: "Only your single most dramatic dream", correct: false, explanation: "One dream is weak evidence." },
              { id: "c", text: "A fixed dictionary meaning", correct: false, explanation: "Universal codes aren't supported." },
            ] },
            { id: "q4", type: "true-false", prompt: "Because a theme is common worldwide, it must mean the same thing for everyone.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the trigger and meaning remain personal." },
              { id: "f", text: "False", correct: true, explanation: "Correct — shared feeling, individual meaning." },
            ] },
            { id: "q5", type: "recall", prompt: "Name one of the most commonly reported dream themes worldwide (single word or short phrase).", options: [], answer: "falling", accept: ["being chased", "chased", "flying", "teeth falling out", "losing teeth", "unprepared for a test", "being late", "naked in public", "being undressed in public"], explanation: "Falling, being chased, flying, and losing teeth top cross-cultural surveys of common dreams." },
          ],
        },
        {
          id: "l8-nightmares",
          title: "Recurring dreams & nightmares",
          objective: "Understand recurring dreams and when nightmares warrant support.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Recurring dreams — the same scenario returning — often track an unresolved stress or theme in waking life; they tend to fade once the underlying issue is addressed or acknowledged." },
            { kind: "text", text: "A nightmare is a frightening dream, usually in REM, that often wakes you with the story intact. That makes nightmares different from night terrors, which strike out of deep NREM sleep, mostly in children — the sleeper may sit up or scream but typically remembers nothing in the morning." },
            { kind: "table", headers: ["Feature", "Nightmare", "Night terror"], rows: [
              ["Sleep stage", "REM (often late night)", "Deep NREM (early night)"],
              ["Recall on waking", "Usually remembered", "Usually no memory"],
              ["Who", "Any age", "Mostly young children"],
              ["The person wakes", "Often fully awake & alert", "Hard to rouse; not truly awake"],
            ] },
            { kind: "callout", tone: "safety", title: "When to seek help", text: "Occasional nightmares are normal. But if nightmares are frequent, intensely distressing, disrupting your sleep, or connected to a trauma, that's a sign to talk to a doctor or therapist — not to push through alone. Effective treatments exist (for example, a technique called imagery rehearsal therapy). Dreamwork journaling is for reflection, not a treatment for these." },
            { kind: "callout", tone: "tip", title: "Things that can stir nightmares", text: "Stress, fever and illness, irregular sleep, alcohol, and some medications can all increase nightmares. If they spiked recently, it's worth looking at what changed — but persistent or trauma-linked nightmares still deserve professional support." },
            { kind: "keyfacts", items: [
              "Recurring dreams often mirror an unresolved waking-life theme.",
              "Nightmares are REM dreams you usually remember.",
              "Night terrors come from deep NREM and are usually not recalled.",
              "Frequent, distressing, or trauma-linked nightmares warrant professional care.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Recurring dreams often reflect…", options: [
              { id: "a", text: "An unresolved stress or theme in waking life", correct: true, explanation: "Correct — they tend to ease once it's addressed." },
              { id: "b", text: "A prophecy of the future", correct: false, explanation: "Dreams aren't predictive." },
              { id: "c", text: "A glitch with no meaning ever", correct: false, explanation: "They usually mirror something real." },
            ] },
            { id: "q2", type: "mcq", prompt: "A key difference between a nightmare and a night terror is that…", options: [
              { id: "a", text: "Nightmares are usually remembered; night terrors usually aren't", correct: true, explanation: "Right — and they arise from different sleep stages." },
              { id: "b", text: "Night terrors happen only in REM", correct: false, explanation: "Night terrors come from deep NREM." },
              { id: "c", text: "They are exactly the same thing", correct: false, explanation: "They differ in stage, recall, and who they affect." },
            ] },
            { id: "q3", type: "mcq", prompt: "Frequent, distressing, or trauma-related nightmares are a sign to…", options: [
              { id: "a", text: "Talk to a doctor or therapist", correct: true, explanation: "Yes — effective treatments exist; don't tough it out alone." },
              { id: "b", text: "Ignore them indefinitely", correct: false, explanation: "Persistent distressing nightmares deserve support." },
              { id: "c", text: "Stop sleeping", correct: false, explanation: "That's harmful; seek help instead." },
            ] },
            { id: "q4", type: "true-false", prompt: "Night terrors usually arise from deep NREM sleep and are not remembered.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — that's what distinguishes them from REM nightmares." },
              { id: "f", text: "False", correct: false, explanation: "Night terrors come from deep NREM and are typically not recalled." },
            ] },
            { id: "q5", type: "true-false", prompt: "Dream journaling is an appropriate treatment for trauma-related nightmares.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — those warrant professional care, not just journaling." },
              { id: "f", text: "False", correct: true, explanation: "Correct — journaling is for reflection, not treatment." },
            ] },
          ],
        },
        {
          id: "l9-lucid",
          title: "Lucid dreaming basics",
          objective: "Explain lucid dreaming, the evidence for it, and a common technique.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "A lucid dream is one in which you realize, while dreaming, that you're dreaming. Some people can then influence the dream. It's a real, studied phenomenon — though it takes practice and doesn't come easily to everyone." },
            { kind: "callout", tone: "evidence", title: "How we KNOW it's real", text: "Lucid dreaming isn't just self-report. Because the eyes still move in REM, trained lucid dreamers have signaled to researchers from inside a dream using prearranged eye movements. In a 2021 study, scientists even asked simple questions and got correct answers back via eye signals — verified evidence that a person can be aware and responsive while asleep." },
            { kind: "list", items: [
              "**Reality checks** — through the day, ask 'Am I dreaming?' and test (e.g., try to push a finger through your palm). The habit can carry into dreams.",
              "**Dream journaling** — better recall and noticing recurring 'dream signs' makes lucidity more likely.",
              "**Wake-and-return (MILD)** — wake briefly after about five hours, then fall back asleep repeating an intention like 'next time I'm dreaming, I'll realize I'm dreaming.' This 'mnemonic induction' is one of the better-supported methods.",
            ] },
            { kind: "callout", tone: "history", title: "Old idea, modern name", text: "Awareness within dreams was noted as far back as Aristotle in the 4th century BCE. The term 'lucid dream' itself was coined by Dutch psychiatrist Frederik van Eeden in 1913 — long before the lab evidence arrived." },
            { kind: "callout", tone: "tip", title: "Keep it light", text: "Lucid dreaming is a fun skill to explore, not a goal to stress over. If chasing it ever disrupts your sleep, ease off — good rest matters more. Techniques that wake you repeatedly can fragment sleep if overdone." },
            { kind: "keyfacts", items: [
              "Lucid = realizing you're dreaming while still in the dream.",
              "Verified in the lab via prearranged eye-movement signals.",
              "MILD (intention on a brief waking) is a well-supported technique.",
              "Protect your sleep; don't let practice cost you rest.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A lucid dream is one where…", options: [
              { id: "a", text: "You realize you're dreaming while still in the dream", correct: true, explanation: "Correct — awareness within the dream." },
              { id: "b", text: "You sleep more deeply than usual", correct: false, explanation: "It's about awareness, not depth." },
              { id: "c", text: "You don't dream at all", correct: false, explanation: "The opposite — you're aware you're dreaming." },
            ] },
            { id: "q2", type: "mcq", prompt: "How have researchers verified that lucid dreaming is real?", options: [
              { id: "a", text: "Lucid dreamers signaled out with prearranged eye movements", correct: true, explanation: "Right — eye signals during REM provided objective evidence." },
              { id: "b", text: "They asked people the next morning to describe it", correct: false, explanation: "Self-report alone wouldn't verify in-dream awareness." },
              { id: "c", text: "It hasn't been studied at all", correct: false, explanation: "It's a documented research phenomenon." },
            ] },
            { id: "q3", type: "mcq", prompt: "The MILD technique works by…", options: [
              { id: "a", text: "Waking briefly, then returning to sleep with an intention to recognize the dream", correct: true, explanation: "Yes — a prospective-memory ('mnemonic') approach." },
              { id: "b", text: "Drinking caffeine before bed", correct: false, explanation: "That harms sleep, not helps lucidity." },
              { id: "c", text: "Never sleeping", correct: false, explanation: "You need sleep to dream." },
            ] },
            { id: "q4", type: "true-false", prompt: "If pursuing lucid dreaming disrupts your sleep, it's wise to ease off.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — good rest matters more than lucidity." },
              { id: "f", text: "False", correct: false, explanation: "Protect your sleep first." },
            ] },
            { id: "q5", type: "true-false", prompt: "Lucid dreaming is only an anecdote and has never been demonstrated in a lab.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — eye-signal studies provide objective evidence." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's been verified experimentally." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Dreams Across Cultures",
      lessons: [
        {
          id: "l10-history-culture",
          title: "Dreams in history & culture",
          objective: "Describe how different cultures have understood and used dreams.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Long before sleep labs, every culture had a relationship with dreams. Studying that history is fascinating in its own right — and it shows how the meaning people give dreams is shaped by their time and place, not fixed by nature." },
            { kind: "table", headers: ["Culture / era", "How dreams were seen"], rows: [
              ["Ancient Mesopotamia", "Among the earliest recorded dream interpretation; dreams read as omens"],
              ["Ancient Egypt", "Dream 'manuals' listed images and meanings; temple sleep for guidance"],
              ["Ancient Greece", "Temples of Asclepius practiced 'incubation' — sleeping for healing dreams"],
              ["Many Indigenous traditions", "Dreams as meaningful experience, guidance, or connection to ancestors"],
              ["Modern psychology (1899+)", "Freud and Jung treated dreams as windows on the mind"],
              ["Sleep science (1953+)", "REM discovered; dreams studied as measurable brain activity"],
            ] },
            { kind: "callout", tone: "history", title: "The first dream books", text: "The 2nd-century 'Oneirocritica' by Artemidorus is one of the most complete surviving ancient dream-interpretation guides. Tellingly, even Artemidorus insisted meaning depended on the dreamer's life and circumstances — an early version of 'symbols are personal.'" },
            { kind: "callout", tone: "culture", title: "Respect, don't appropriate", text: "Many living traditions hold dreams as sacred. Appreciating that history is wonderful; lifting practices out of context, or claiming a tradition's symbols as universal truths, is not. Learn the history with respect, and keep your own dreamwork personal." },
            { kind: "callout", tone: "evidence", title: "History is not proof", text: "That a belief about dreams is ancient and widespread doesn't make it scientifically true. Dream omens were common worldwide — and still aren't predictive. Honor the tradition as culture and meaning-making, while keeping the science straight." },
            { kind: "keyfacts", items: [
              "Dream interpretation is among humanity's oldest recorded practices.",
              "Greek 'incubation' sought healing or guidance through dreams.",
              "Even ancient guides often tied meaning to the individual dreamer.",
              "Antiquity and popularity don't make a dream claim scientifically true.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Ancient Greek 'incubation' at temples of Asclepius involved…", options: [
              { id: "a", text: "Sleeping at a temple hoping for a healing or guiding dream", correct: true, explanation: "Correct — a documented dream-healing practice." },
              { id: "b", text: "Banning dreams entirely", correct: false, explanation: "The opposite — dreams were actively sought." },
              { id: "c", text: "Predicting lottery numbers", correct: false, explanation: "That's not what incubation was." },
            ] },
            { id: "q2", type: "mcq", prompt: "Even the ancient dream guide 'Oneirocritica' argued that meaning…", options: [
              { id: "a", text: "Depended on the dreamer's own life and circumstances", correct: true, explanation: "Right — an early 'symbols are personal' view." },
              { id: "b", text: "Was identical for every person", correct: false, explanation: "It stressed individual context." },
              { id: "c", text: "Could be ignored completely", correct: false, explanation: "It took dreams seriously, but contextually." },
            ] },
            { id: "q3", type: "mcq", prompt: "That a belief about dreams is ancient and widespread means it is…", options: [
              { id: "a", text: "Culturally important, but not therefore scientifically true", correct: true, explanation: "Yes — honor the culture; keep the science straight." },
              { id: "b", text: "Automatically proven correct", correct: false, explanation: "Age and popularity aren't evidence." },
              { id: "c", text: "Meaningless and worthless", correct: false, explanation: "It can be meaningful as culture even if not literally true." },
            ] },
            { id: "q4", type: "true-false", prompt: "Dream interpretation is among the oldest recorded human practices.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it dates back to ancient Mesopotamia and Egypt." },
              { id: "f", text: "False", correct: false, explanation: "It's documented across the earliest civilizations." },
            ] },
            { id: "q5", type: "true-false", prompt: "Because dream omens are an ancient, worldwide belief, dreams must be predictive.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — widespread tradition isn't scientific evidence." },
              { id: "f", text: "False", correct: true, explanation: "Correct — honor the history without treating it as proof." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "Vivid, story-like dreams happen mostly during…", options: [
      { id: "a", text: "REM sleep", correct: true },
      { id: "b", text: "Deep non-REM only", correct: false },
      { id: "c", text: "Wakefulness", correct: false },
      { id: "d", text: "Naps only", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "A sleep cycle lasts about…", options: [
      { id: "a", text: "90 minutes, repeating", correct: true },
      { id: "b", text: "8 hours, once", correct: false },
      { id: "c", text: "5 seconds", correct: false },
      { id: "d", text: "A whole day", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "People who think they 'never dream' usually…", options: [
      { id: "a", text: "Dream but don't recall it", correct: true },
      { id: "b", text: "Truly never dream", correct: false },
      { id: "c", text: "Are always awake", correct: false },
      { id: "d", text: "Have no REM sleep", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "Which are the three NREM sleep stages?", options: [
      { id: "a", text: "N1, N2, and N3", correct: true },
      { id: "b", text: "REM, N1, and N2", correct: false },
      { id: "c", text: "Light, medium, and lucid", correct: false },
      { id: "d", text: "Alpha, beta, and theta", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "Which stage makes up the largest share of a typical night?", options: [
      { id: "a", text: "N2", correct: true },
      { id: "b", text: "REM", correct: false },
      { id: "c", text: "N1", correct: false },
      { id: "d", text: "N3", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Deep slow-wave sleep (N3) is heaviest…", options: [
      { id: "a", text: "Early in the night", correct: true },
      { id: "b", text: "Right before you wake", correct: false },
      { id: "c", text: "Only during naps", correct: false },
      { id: "d", text: "Never — N3 doesn't exist", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "A leading theory of dreaming is…", options: [
      { id: "a", text: "Memory consolidation and emotional processing", correct: true },
      { id: "b", text: "Messages from the future", correct: false },
      { id: "c", text: "Nothing happens in the brain", correct: false },
      { id: "d", text: "A universal symbol code", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "The 'activation–synthesis' theory says dreams are…", options: [
      { id: "a", text: "A narrative the brain weaves over random REM activity", correct: true },
      { id: "b", text: "Literal future predictions", correct: false },
      { id: "c", text: "Decoded from a fixed dictionary", correct: false },
      { id: "d", text: "Sent from outside the mind", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "A universal 'dream dictionary' is…", options: [
      { id: "a", text: "Not supported — symbols are personal", correct: true },
      { id: "b", text: "Scientifically proven", correct: false },
      { id: "c", text: "The only valid method", correct: false },
      { id: "d", text: "Required for journaling", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "When a dream seems to 'come true,' the best explanation is…", options: [
      { id: "a", text: "Selective memory and confirmation bias", correct: true },
      { id: "b", text: "Genuine prophecy", correct: false },
      { id: "c", text: "A glitch in time", correct: false },
      { id: "d", text: "A universal code", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "Why record dreams right on waking?", options: [
      { id: "a", text: "They fade within minutes", correct: true },
      { id: "b", text: "They don't exist otherwise", correct: false },
      { id: "c", text: "It's legally required", correct: false },
      { id: "d", text: "To avoid sleeping", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "On waking, you should first…", options: [
      { id: "a", text: "Stay still and let the dream return", correct: true },
      { id: "b", text: "Check social media", correct: false },
      { id: "c", text: "Leap out of bed", correct: false },
      { id: "d", text: "Turn on bright lights", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "Dream symbols are best read through…", options: [
      { id: "a", text: "Your own associations and current life", correct: true },
      { id: "b", text: "A single fixed online meaning", correct: false },
      { id: "c", text: "Ignoring them", correct: false },
      { id: "d", text: "A random guess", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "Common themes like falling appear worldwide, which suggests…", options: [
      { id: "a", text: "They reflect shared feelings, while specific meaning stays personal", correct: true },
      { id: "b", text: "Falling has one fixed universal meaning", correct: false },
      { id: "c", text: "Everyone predicts the same future", correct: false },
      { id: "d", text: "The themes are meaningless", correct: false },
    ] },
    { id: "f15", type: "mcq", prompt: "Recurring dreams often reflect…", options: [
      { id: "a", text: "An unresolved waking-life stress or theme", correct: true },
      { id: "b", text: "A guaranteed prophecy", correct: false },
      { id: "c", text: "Nothing meaningful", correct: false },
      { id: "d", text: "A brain defect", correct: false },
    ] },
    { id: "f16", type: "mcq", prompt: "A night terror differs from a nightmare in that it…", options: [
      { id: "a", text: "Arises from deep NREM and is usually not remembered", correct: true },
      { id: "b", text: "Always happens in REM and is vividly recalled", correct: false },
      { id: "c", text: "Only occurs in adults", correct: false },
      { id: "d", text: "Is identical to a nightmare", correct: false },
    ] },
    { id: "f17", type: "mcq", prompt: "Frequent, distressing, trauma-related nightmares are a sign to…", options: [
      { id: "a", text: "Talk to a doctor or therapist", correct: true },
      { id: "b", text: "Ignore them", correct: false },
      { id: "c", text: "Stop sleeping", correct: false },
      { id: "d", text: "Just journal harder", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "A lucid dream is…", options: [
      { id: "a", text: "Realizing you're dreaming while in the dream", correct: true },
      { id: "b", text: "Sleeping more deeply", correct: false },
      { id: "c", text: "Not dreaming at all", correct: false },
      { id: "d", text: "A nightmare", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "How was lucid dreaming objectively verified in the lab?", options: [
      { id: "a", text: "Lucid dreamers signaled out using prearranged eye movements", correct: true },
      { id: "b", text: "By morning interviews alone", correct: false },
      { id: "c", text: "It never was", correct: false },
      { id: "d", text: "By measuring body temperature", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "The MILD lucid-dreaming technique relies on…", options: [
      { id: "a", text: "A brief waking plus an intention to recognize the dream", correct: true },
      { id: "b", text: "Caffeine before bed", correct: false },
      { id: "c", text: "Never sleeping", correct: false },
      { id: "d", text: "Staring at a wall", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "Ancient Greek 'incubation' was the practice of…", options: [
      { id: "a", text: "Sleeping at a temple seeking a healing or guiding dream", correct: true },
      { id: "b", text: "Banning all dreaming", correct: false },
      { id: "c", text: "Decoding lottery numbers", correct: false },
      { id: "d", text: "Avoiding sleep entirely", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "That a dream belief is ancient and widespread means it is…", options: [
      { id: "a", text: "Culturally significant, but not therefore scientifically true", correct: true },
      { id: "b", text: "Automatically proven", correct: false },
      { id: "c", text: "Completely worthless", correct: false },
      { id: "d", text: "A medical diagnosis", correct: false },
    ] },
    { id: "f23", type: "true-false", prompt: "Nearly everyone dreams multiple times a night.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f24", type: "true-false", prompt: "There is good evidence dreams predict the future.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f25", type: "true-false", prompt: "Dream recall tends to improve with practice.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f26", type: "true-false", prompt: "Dreaming happens only in REM and never in NREM sleep.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f27", type: "true-false", prompt: "REM periods get longer toward morning.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f28", type: "true-false", prompt: "If chasing lucid dreams disrupts your sleep, you should ease off.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
