import type { Course } from "../types";

/** FLAGSHIP #11 — Runes: the Elder Futhark, taught with respect for its Norse roots. */
export const runesFoundations: Course = {
  id: "runes-foundations",
  domain: "runes",
  title: "Runes: The Elder Futhark",
  subtitle: "A finite symbol & divination system",
  level: "foundations",
  icon: "ᚠ",
  summary:
    "Learn the 24 runes of the Elder Futhark — their history and meanings — and how to use them as a reflective tool.",
  estMinutes: 40,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,
  safetyNote:
    "The runes are part of a real Norse/Germanic heritage. A few have been misappropriated by hate groups — this course rejects that misuse and treats the runes with cultural respect.",

  outline: [
    { module: "Origins", lessons: ["What runes are", "The Elder Futhark & the aettir"] },
    { module: "The Runes", lessons: ["First aett (Fehu–Wunjo)", "Second aett (Hagalaz–Sowilo)", "Third aett (Tiwaz–Othala)"] },
    { module: "Practice", lessons: ["Single & three-rune draws", "Reading for reflection & respect"] },
  ],

  modules: [
    {
      id: "m1",
      title: "Origins",
      lessons: [
        {
          id: "l1-what-runes-are",
          title: "What runes are",
          objective: "Explain what runes are and how to hold them honestly.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Runes are the letters of old Germanic and Norse alphabets — first and foremost a writing system, carved into wood, bone, and stone. Each rune is also a word and an idea, which is why they came to be used for reflection and divination as well as writing." },
            { kind: "callout", tone: "history", title: "Real history", text: "The runes were genuinely used across Northern Europe (roughly the first millennium CE) to write, mark ownership, and inscribe memorials. Their use as a divination set of drawn stones or tiles is largely a modern revival, built on that ancient symbolism." },
            { kind: "callout", tone: "evidence", title: "How to hold them", text: "Like tarot, runes have no demonstrated power to predict events. They work as a reflective tool — a finite set of meaningful symbols you draw and interpret to think through a question. Take what's useful; they're a mirror, not a forecast." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Runes were first and foremost…", options: [
              { id: "a", text: "Letters of an old Germanic/Norse writing system", correct: true, explanation: "Correct — a real alphabet, later also used for divination." },
              { id: "b", text: "Invented in the 20th century for fortune-telling", correct: false, explanation: "The alphabet is ancient; the divination revival is modern." },
              { id: "c", text: "An ancient Egyptian script", correct: false, explanation: "They're Germanic/Norse, not Egyptian." },
            ] },
            { id: "q2", type: "mcq", prompt: "As a divination tool, runes are best understood as…", options: [
              { id: "a", text: "A reflective set of symbols, not a forecast", correct: true, explanation: "Yes — like tarot, a mirror for thinking." },
              { id: "b", text: "A proven way to predict the future", correct: false, explanation: "No demonstrated predictive power." },
              { id: "c", text: "A medical tool", correct: false, explanation: "They make no medical claims." },
            ] },
            { id: "q3", type: "true-false", prompt: "Runes were originally a writing system used across Northern Europe.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they were a real alphabet." },
              { id: "f", text: "False", correct: false, explanation: "They genuinely were a writing system." },
            ] },
          ],
        },
        {
          id: "l2-futhark-aettir",
          title: "The Elder Futhark & the aettir",
          objective: "Describe the structure of the Elder Futhark.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The oldest and most-used rune set for study is the Elder Futhark — 24 runes. Its name comes from the sounds of its first six runes: F, U, Th, A, R, K → 'Futhark' (just as 'alphabet' comes from alpha-beta)." },
            { kind: "callout", tone: "tradition", title: "Three groups of eight", text: "The 24 runes are divided into three groups of eight, called 'aettir' (singular 'aett'). Each aett is traditionally linked to a deity or theme. They're a helpful way to learn the runes in manageable sets." },
            { kind: "keyfacts", items: [
              "The Elder Futhark has 24 runes.",
              "'Futhark' = the first six runes' sounds (F-U-Th-A-R-K).",
              "The 24 split into three aettir (groups) of eight.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "How many runes are in the Elder Futhark?", options: [
              { id: "a", text: "24", correct: true, explanation: "Correct — three groups of eight." },
              { id: "b", text: "26", correct: false, explanation: "That's the modern English alphabet, not the Futhark." },
              { id: "c", text: "12", correct: false, explanation: "There are 24." },
            ] },
            { id: "q2", type: "mcq", prompt: "The name 'Futhark' comes from…", options: [
              { id: "a", text: "The sounds of its first six runes", correct: true, explanation: "F-U-Th-A-R-K, like 'alphabet' from alpha-beta." },
              { id: "b", text: "A Norse king", correct: false, explanation: "It's from the rune sounds, not a person." },
              { id: "c", text: "A random word", correct: false, explanation: "It's an acronym of the first runes." },
            ] },
            { id: "q3", type: "mcq", prompt: "An 'aett' is…", options: [
              { id: "a", text: "A group of eight runes", correct: true, explanation: "Correct — there are three aettir." },
              { id: "b", text: "A single rune", correct: false, explanation: "It's a group of eight, not one." },
              { id: "c", text: "A type of spread", correct: false, explanation: "It's a grouping of runes." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "The Runes",
      lessons: [
        {
          id: "l3-first-aett",
          title: "First aett (Fehu–Wunjo)",
          objective: "Recall the meanings of the first eight runes.",
          estMinutes: 5,
          blocks: [
            { kind: "table", headers: ["Rune", "Keyword"], rows: [
              ["Fehu (ᚠ)", "Wealth, abundance, cattle"],
              ["Uruz (ᚢ)", "Strength, vitality, the wild ox"],
              ["Thurisaz (ᚦ)", "A thorn or giant — conflict, defense, a catalyst"],
              ["Ansuz (ᚨ)", "Communication, wisdom, a message (linked to Odin)"],
              ["Raidho (ᚱ)", "A journey, movement, rhythm"],
              ["Kenaz (ᚲ)", "Torch — knowledge, creativity, insight"],
              ["Gebo (ᚷ)", "A gift, generosity, partnership"],
              ["Wunjo (ᚹ)", "Joy, harmony, contentment"],
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Fehu (ᚠ) is associated with…", options: [
              { id: "a", text: "Wealth and abundance", correct: true, explanation: "Correct — its root means 'cattle,' a sign of wealth." },
              { id: "b", text: "Conflict", correct: false, explanation: "That's closer to Thurisaz." },
              { id: "c", text: "A journey", correct: false, explanation: "That's Raidho." },
            ] },
            { id: "q2", type: "mcq", prompt: "Gebo (ᚷ) means…", options: [
              { id: "a", text: "A gift / partnership", correct: true, explanation: "Yes — generosity and exchange." },
              { id: "b", text: "Joy", correct: false, explanation: "That's Wunjo." },
              { id: "c", text: "Strength", correct: false, explanation: "That's Uruz." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which rune is linked to communication and messages?", options: [
              { id: "a", text: "Ansuz (ᚨ)", correct: true, explanation: "Correct — wisdom and communication, tied to Odin." },
              { id: "b", text: "Fehu (ᚠ)", correct: false, explanation: "Fehu is wealth." },
              { id: "c", text: "Wunjo (ᚹ)", correct: false, explanation: "Wunjo is joy." },
            ] },
          ],
        },
        {
          id: "l4-second-aett",
          title: "Second aett (Hagalaz–Sowilo)",
          objective: "Recall the meanings of the second eight runes.",
          estMinutes: 5,
          blocks: [
            { kind: "table", headers: ["Rune", "Keyword"], rows: [
              ["Hagalaz (ᚺ)", "Hail — disruption, sudden change, a clearing storm"],
              ["Nauthiz (ᚾ)", "Need — constraint, resistance, hard lessons"],
              ["Isa (ᛁ)", "Ice — stillness, stasis, a pause"],
              ["Jera (ᛃ)", "Harvest — cycles, reward for effort, right timing"],
              ["Eihwaz (ᛇ)", "Yew — endurance, transformation, the axis"],
              ["Perthro (ᛈ)", "The dice-cup — fate, mystery, the unknown"],
              ["Algiz (ᛉ)", "Protection — a shield, defense, higher connection"],
              ["Sowilo (ᛊ)", "The sun — success, vitality, wholeness, guidance"],
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Isa (ᛁ) represents…", options: [
              { id: "a", text: "Ice — stillness and a pause", correct: true, explanation: "Correct — stasis, waiting, patience." },
              { id: "b", text: "The sun and success", correct: false, explanation: "That's Sowilo." },
              { id: "c", text: "A gift", correct: false, explanation: "That's Gebo (first aett)." },
            ] },
            { id: "q2", type: "mcq", prompt: "Sowilo (ᛊ) is the rune of…", options: [
              { id: "a", text: "The sun — success and vitality", correct: true, explanation: "Yes — wholeness and guidance." },
              { id: "b", text: "Hail and disruption", correct: false, explanation: "That's Hagalaz." },
              { id: "c", text: "Need and constraint", correct: false, explanation: "That's Nauthiz." },
            ] },
            { id: "q3", type: "mcq", prompt: "Algiz (ᛉ) is most associated with…", options: [
              { id: "a", text: "Protection and defense", correct: true, explanation: "Correct — a shield rune." },
              { id: "b", text: "A harvest", correct: false, explanation: "That's Jera." },
              { id: "c", text: "A journey", correct: false, explanation: "That's Raidho (first aett)." },
            ] },
          ],
        },
        {
          id: "l5-third-aett",
          title: "Third aett (Tiwaz–Othala)",
          objective: "Recall the meanings of the third eight runes.",
          estMinutes: 5,
          blocks: [
            { kind: "table", headers: ["Rune", "Keyword"], rows: [
              ["Tiwaz (ᛏ)", "Justice, honor, courage (the god Tyr)"],
              ["Berkano (ᛒ)", "Birch — growth, birth, nurturing, new beginnings"],
              ["Ehwaz (ᛖ)", "Horse — partnership, trust, movement together"],
              ["Mannaz (ᛗ)", "Humankind — the self, community, shared humanity"],
              ["Laguz (ᛚ)", "Water — intuition, flow, the unconscious"],
              ["Ingwaz (ᛜ)", "Fertility, gestation, potential coming to fruition"],
              ["Dagaz (ᛞ)", "Day — breakthrough, awakening, a turning point"],
              ["Othala (ᛟ)", "Heritage, ancestry, home, what is truly yours"],
            ] },
            { kind: "callout", tone: "culture", title: "A respect note", text: "A few runes — notably Othala, plus Sowilo and Algiz — have been misused as symbols by hate groups. That misuse is a distortion of a heritage that belongs to everyone studying it in good faith. Learn and use the runes with respect for their Norse origins, and reject that appropriation." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Berkano (ᛒ) is associated with…", options: [
              { id: "a", text: "Growth, birth, and new beginnings", correct: true, explanation: "Correct — the nurturing birch." },
              { id: "b", text: "Justice", correct: false, explanation: "That's Tiwaz." },
              { id: "c", text: "Water/intuition", correct: false, explanation: "That's Laguz." },
            ] },
            { id: "q2", type: "mcq", prompt: "Laguz (ᛚ) represents…", options: [
              { id: "a", text: "Water — intuition and flow", correct: true, explanation: "Yes — the unconscious and emotion." },
              { id: "b", text: "Day and breakthrough", correct: false, explanation: "That's Dagaz." },
              { id: "c", text: "Heritage", correct: false, explanation: "That's Othala." },
            ] },
            { id: "q3", type: "true-false", prompt: "Some runes have been misappropriated by hate groups, and this course rejects that misuse.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — study the runes with respect for their origins." },
              { id: "f", text: "False", correct: false, explanation: "This is true — the course explicitly rejects that misuse." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Practice",
      lessons: [
        {
          id: "l6-draws",
          title: "Single & three-rune draws",
          objective: "Perform a single-rune and a three-rune draw.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "You don't need an elaborate ritual to start. With a set of runes in a bag or face-down, hold your question in mind and draw." },
            { kind: "list", items: [
              "**Single rune** — draw one for a daily focus or a direct prompt to reflect on.",
              "**Three runes** — draw three and read them as a small story: a common layout is situation / action / outcome, or past / present / future.",
            ] },
            { kind: "callout", tone: "tip", title: "Position shapes meaning", text: "As with tarot, the same rune reads differently by position. A rune in the 'action' spot suggests something to do; in the 'outcome' spot it hints where things may lead. Let the question and the positions guide you." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A common three-rune layout is…", options: [
              { id: "a", text: "Situation / action / outcome (or past / present / future)", correct: true, explanation: "Correct — read the three as a small story." },
              { id: "b", text: "All 24 runes at once", correct: false, explanation: "That's the whole set, not a three-rune draw." },
              { id: "c", text: "A single rune only", correct: false, explanation: "That's a one-rune draw." },
            ] },
            { id: "q2", type: "mcq", prompt: "A single-rune draw is good for…", options: [
              { id: "a", text: "A daily focus or a direct prompt to reflect on", correct: true, explanation: "Yes — simple and clear." },
              { id: "b", text: "Predicting the exact future", correct: false, explanation: "Runes aren't predictive." },
              { id: "c", text: "Diagnosing illness", correct: false, explanation: "They make no medical claims." },
            ] },
            { id: "q3", type: "true-false", prompt: "A rune's position in a spread can change how you read it.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — position shapes meaning, as in tarot." },
              { id: "f", text: "False", correct: false, explanation: "Position genuinely matters." },
            ] },
          ],
        },
        {
          id: "l7-reflection-respect",
          title: "Reading for reflection & respect",
          objective: "Apply a reflective, respectful stance to rune reading.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The healthiest way to read runes is as a structured prompt for reflection: the symbol gives you an angle, and you do the thinking. Frame open questions ('What can I bring to this?') rather than yes/no fortune-telling." },
            { kind: "callout", tone: "culture", title: "Honor the source", text: "The runes carry a living Norse/Germanic heritage. Engage with curiosity and respect, credit where they come from, and firmly reject the hate-group misuse of certain runes. Approached this way, they're a meaningful, finite system for reflection." },
            { kind: "callout", tone: "evidence", title: "Keep it grounded", text: "Runes are a reflective tool — not a predictor of events, and not a substitute for medical, legal, financial, or mental-health advice." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The healthiest way to read runes is…", options: [
              { id: "a", text: "As a structured prompt for reflection", correct: true, explanation: "Correct — the symbol gives an angle; you do the thinking." },
              { id: "b", text: "As a precise predictor of the future", correct: false, explanation: "Runes aren't predictive." },
              { id: "c", text: "As medical guidance", correct: false, explanation: "Never — they make no medical claims." },
            ] },
            { id: "q2", type: "mcq", prompt: "Engaging with the runes respectfully includes…", options: [
              { id: "a", text: "Crediting their Norse origins and rejecting hate-group misuse", correct: true, explanation: "Yes — honor the heritage, reject appropriation." },
              { id: "b", text: "Treating the symbols as fashion with no context", correct: false, explanation: "That ignores their living heritage." },
              { id: "c", text: "Claiming they cure illness", correct: false, explanation: "They don't, and shouldn't be framed that way." },
            ] },
            { id: "q3", type: "mcq", prompt: "A healthier question to ask the runes is…", options: [
              { id: "a", text: "'What can I bring to this?'", correct: true, explanation: "Open questions center your agency." },
              { id: "b", text: "'Tell me my exact fate.'", correct: false, explanation: "That treats runes as prediction." },
              { id: "c", text: "'Which medicine should I take?'", correct: false, explanation: "Never — that's medical advice runes can't give." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "Runes were first and foremost…", options: [
      { id: "a", text: "An old Germanic/Norse writing system", correct: true },
      { id: "b", text: "A 20th-century invention", correct: false },
      { id: "c", text: "Egyptian hieroglyphs", correct: false },
      { id: "d", text: "A board game", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "As divination, runes are…", options: [
      { id: "a", text: "A reflective tool, not a forecast", correct: true },
      { id: "b", text: "A proven future-predictor", correct: false },
      { id: "c", text: "A medical device", correct: false },
      { id: "d", text: "A branch of astronomy", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "The Elder Futhark has…", options: [
      { id: "a", text: "24 runes", correct: true },
      { id: "b", text: "26 runes", correct: false },
      { id: "c", text: "12 runes", correct: false },
      { id: "d", text: "78 runes", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "'Futhark' comes from…", options: [
      { id: "a", text: "The sounds of its first six runes", correct: true },
      { id: "b", text: "A Norse king's name", correct: false },
      { id: "c", text: "A random word", correct: false },
      { id: "d", text: "The number of runes", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "An 'aett' is…", options: [
      { id: "a", text: "A group of eight runes", correct: true },
      { id: "b", text: "A single rune", correct: false },
      { id: "c", text: "A type of spread", correct: false },
      { id: "d", text: "A Norse god", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Fehu (ᚠ) means…", options: [
      { id: "a", text: "Wealth and abundance", correct: true },
      { id: "b", text: "Conflict", correct: false },
      { id: "c", text: "Ice", correct: false },
      { id: "d", text: "The sun", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "Ansuz (ᚨ) is linked to…", options: [
      { id: "a", text: "Communication and messages", correct: true },
      { id: "b", text: "Wealth", correct: false },
      { id: "c", text: "Protection", correct: false },
      { id: "d", text: "A journey", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "Isa (ᛁ) represents…", options: [
      { id: "a", text: "Ice — stillness and a pause", correct: true },
      { id: "b", text: "Success", correct: false },
      { id: "c", text: "A gift", correct: false },
      { id: "d", text: "Growth", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "Sowilo (ᛊ) is the rune of…", options: [
      { id: "a", text: "The sun — success and vitality", correct: true },
      { id: "b", text: "Hail", correct: false },
      { id: "c", text: "Need", correct: false },
      { id: "d", text: "Water", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Laguz (ᛚ) represents…", options: [
      { id: "a", text: "Water — intuition and flow", correct: true },
      { id: "b", text: "Justice", correct: false },
      { id: "c", text: "Day", correct: false },
      { id: "d", text: "Heritage", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "Othala (ᛟ) is associated with…", options: [
      { id: "a", text: "Heritage and ancestry", correct: true },
      { id: "b", text: "Joy", correct: false },
      { id: "c", text: "Strength", correct: false },
      { id: "d", text: "A torch", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "A common three-rune layout is…", options: [
      { id: "a", text: "Situation / action / outcome", correct: true },
      { id: "b", text: "All 24 at once", correct: false },
      { id: "c", text: "One rune only", correct: false },
      { id: "d", text: "A grid of 78", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "The healthiest way to read runes is…", options: [
      { id: "a", text: "As a structured prompt for reflection", correct: true },
      { id: "b", text: "As precise prediction", correct: false },
      { id: "c", text: "As medical advice", correct: false },
      { id: "d", text: "As legal counsel", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "Respectful rune practice includes…", options: [
      { id: "a", text: "Crediting Norse origins and rejecting hate-group misuse", correct: true },
      { id: "b", text: "Ignoring where they came from", correct: false },
      { id: "c", text: "Claiming they cure disease", correct: false },
      { id: "d", text: "Predicting exact fate", correct: false },
    ] },
    { id: "f15", type: "true-false", prompt: "A rune's position in a spread can change how it's read.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f16", type: "true-false", prompt: "Runes are a substitute for medical or legal advice.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
  ],
};
