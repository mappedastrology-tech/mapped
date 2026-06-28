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
    { module: "Origins", lessons: ["What runes are", "The Elder Futhark & the aettir", "An alphabet in stone: the inscriptions"] },
    { module: "The Runes", lessons: ["First aett (Fehu–Wunjo)", "Second aett (Hagalaz–Sowilo)", "Third aett (Tiwaz–Othala)"] },
    { module: "Practice", lessons: ["Single & three-rune draws", "Bind runes & combining symbols", "Reading for reflection & respect"] },
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
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Runes are the letters of old Germanic and Norse alphabets — first and foremost a writing system, carved into wood, bone, metal, and stone. Each rune is also a word and an idea, which is why they came to be used for reflection and divination as well as writing." },
            { kind: "text", text: "The word 'rune' itself carries that double life. In Old Norse and Old English it could mean a letter, but also a 'secret,' a 'whisper,' or a piece of hidden lore. A single carved mark was simultaneously a sound, a name, and a small bundle of meaning — practical and poetic at once." },
            { kind: "callout", tone: "history", title: "Real history", text: "The runes were genuinely used across Northern Europe (roughly the 2nd to the 12th centuries CE) to write, mark ownership, and inscribe memorials. Their use as a divination set of drawn stones or tiles is largely a modern revival, built on that ancient symbolism." },
            { kind: "callout", tone: "history", title: "Angular by design", text: "Runes are built almost entirely from straight lines and diagonals, with no horizontal strokes. That isn't decoration — it made them easy to cut across the grain of wood and into stone, where a horizontal line would vanish into the grain. The shapes are a record of the tools and materials that made them." },
            { kind: "callout", tone: "evidence", title: "How to hold them", text: "Like tarot, runes have no demonstrated power to predict events. They work as a reflective tool — a finite set of meaningful symbols you draw and interpret to think through a question. Take what's useful; they're a mirror, not a forecast." },
            { kind: "keyfacts", items: [
              "Runes are a real ancient alphabet, not a modern invention.",
              "The word 'rune' meant both 'letter' and 'secret / mystery.'",
              "Their angular shapes suited carving into wood and stone.",
              "Drawing runes for divination is mostly a 20th-century revival.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "Why are runes built from straight lines and diagonals with no horizontal strokes?", options: [
              { id: "a", text: "So they could be cut cleanly across the grain of wood and into stone", correct: true, explanation: "Correct — horizontals would disappear into wood grain." },
              { id: "b", text: "To imitate Egyptian hieroglyphs", correct: false, explanation: "The angular form is about carving, not Egypt." },
              { id: "c", text: "Purely for decoration", correct: false, explanation: "It was practical, driven by tools and materials." },
            ] },
            { id: "q4", type: "true-false", prompt: "Runes were originally a writing system used across Northern Europe.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they were a real alphabet." },
              { id: "f", text: "False", correct: false, explanation: "They genuinely were a writing system." },
            ] },
            { id: "q5", type: "true-false", prompt: "The everyday use of runes as drawn divination tiles is well documented from antiquity.", options: [
              { id: "t", text: "True", correct: false, explanation: "Drawing runes as a divination set is largely a modern revival." },
              { id: "f", text: "False", correct: true, explanation: "Correct — that practice is mostly 20th-century, built on ancient symbolism." },
            ] },
            { id: "q6", type: "recall", prompt: "Besides 'letter,' the word 'rune' also meant what (a single word for hidden knowledge)?", options: [], answer: "secret", accept: ["mystery", "a secret", "secret/mystery", "whisper"], explanation: "'Rune' meant a secret, mystery, or whisper as well as a written letter." },
          ],
        },
        {
          id: "l2-futhark-aettir",
          title: "The Elder Futhark & the aettir",
          objective: "Describe the structure of the Elder Futhark.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The oldest and most-used rune set for study is the Elder Futhark — 24 runes. Its name comes from the sounds of its first six runes: F, U, Th, A, R, K → 'Futhark' (just as 'alphabet' comes from alpha-beta)." },
            { kind: "text", text: "The Elder Futhark was in use roughly from the 2nd to the 8th centuries CE. Around the start of the Viking Age it was gradually simplified into the 16-rune Younger Futhark, while in England it grew instead into the expanded Anglo-Saxon futhorc. The Elder Futhark is the ancestor of them all, which is why it's the standard set for learning." },
            { kind: "callout", tone: "tradition", title: "Three groups of eight", text: "The 24 runes are divided into three groups of eight, called 'aettir' (singular 'aett'). The word 'aett' means a clan, family, or group. Each aett is traditionally linked to a deity or theme, and they're a helpful way to learn the runes in manageable sets." },
            { kind: "callout", tone: "history", title: "Why 24, then 16?", text: "The drop from 24 Elder runes to 16 Younger runes is the opposite of what you'd expect — the language was gaining sounds, not losing them. Scholars think writers simply let single runes do double duty, trusting context to sort out the ambiguity. It's a reminder that these were working tools, shaped by convenience." },
            { kind: "table", headers: ["Aett", "Runes", "Traditional theme"], rows: [
              ["First (Freyr's)", "Fehu → Wunjo", "The material world, creation, daily life"],
              ["Second (Heimdall's)", "Hagalaz → Sowilo", "Disruption, trial, and the forces we endure"],
              ["Third (Tyr's)", "Tiwaz → Othala", "The self, society, and what we leave behind"],
            ] },
            { kind: "keyfacts", items: [
              "The Elder Futhark has 24 runes.",
              "'Futhark' = the first six runes' sounds (F-U-Th-A-R-K).",
              "The 24 split into three aettir (groups) of eight.",
              "'Aett' means clan / family / group.",
              "It was used c. 2nd–8th centuries CE, before the 16-rune Younger Futhark.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "How many runes are in the Elder Futhark?", options: [
              { id: "a", text: "24", correct: true, explanation: "Correct — three groups of eight." },
              { id: "b", text: "26", correct: false, explanation: "That's the modern English alphabet, not the Futhark." },
              { id: "c", text: "16", correct: false, explanation: "16 is the later Younger Futhark; the Elder has 24." },
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
            { id: "q4", type: "mcq", prompt: "The later Younger Futhark had how many runes?", options: [
              { id: "a", text: "16", correct: true, explanation: "Correct — the Viking-Age set simplified to 16." },
              { id: "b", text: "24", correct: false, explanation: "That's the Elder Futhark." },
              { id: "c", text: "33", correct: false, explanation: "That's closer to the expanded Anglo-Saxon futhorc." },
            ] },
            { id: "q5", type: "true-false", prompt: "The Elder Futhark is the ancestor of the later Younger Futhark and the Anglo-Saxon futhorc.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — both descended from the 24-rune Elder set." },
              { id: "f", text: "False", correct: false, explanation: "It genuinely is their common ancestor." },
            ] },
            { id: "q6", type: "recall", prompt: "How many runes are in the Elder Futhark?", options: [], answer: "24", accept: ["twenty-four", "twenty four"], explanation: "24 runes — three aettir of eight." },
          ],
        },
        {
          id: "l3-inscriptions",
          title: "An alphabet in stone: the inscriptions",
          objective: "Describe how runes survive in the archaeological record as writing.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Most of what we actually know about the runes comes not from spell-books but from things people wrote. Thousands of runic inscriptions survive — on memorial stones, weapons, jewelry, combs, coins, and slips of wood — and they read like ordinary life: names, ownership marks, memorials, prayers, and the occasional joke or grumble." },
            { kind: "callout", tone: "history", title: "The Kylver Stone (~400 CE)", text: "A limestone slab found in a grave on Gotland, Sweden, carries the earliest known full row of the Elder Futhark — all 24 runes carved in order. It's our best evidence that the futhark was treated as a fixed, ordered alphabet, much as we'd recite our ABCs." },
            { kind: "callout", tone: "evidence", title: "What the record shows — and doesn't", text: "The inscriptions overwhelmingly show runes used as writing. A handful mention casting lots or invoke protection, but there is no surviving ancient 'how to read the runes' manual. The detailed divinatory meanings taught today are a modern reconstruction inspired by that fragmentary evidence, not a copied tradition." },
            { kind: "callout", tone: "history", title: "Bryggen's wooden letters", text: "Excavations at Bryggen in Bergen, Norway, turned up hundreds of medieval rune-sticks: business notes, name tags, love messages, and idle scribbles carved on wood. They shattered the romantic idea that runes were only for magic — for many people, they were simply how you wrote things down." },
            { kind: "table", headers: ["Source", "What it tells us"], rows: [
              ["Memorial stones", "Names, lineage, and who raised the stone for whom"],
              ["Weapons & tools", "Ownership ('X owns me') and maker's marks"],
              ["Jewelry & amulets", "Short charms, blessings, and protective words"],
              ["Wooden sticks (Bryggen)", "Everyday letters, trade notes, and graffiti"],
            ] },
            { kind: "list", items: [
              "Roman historian **Tacitus** (c. 98 CE) described Germanic peoples casting marked strips of wood to draw lots — possibly an early relative of rune-casting, though he doesn't say the marks were runes.",
              "Many memorial stones end with a carver naming themselves — the runic equivalent of a signature.",
              "Some inscriptions are spells or curses, but they are the exception, not the rule.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "What does the Kylver Stone (~400 CE) famously preserve?", options: [
              { id: "a", text: "The earliest known full row of the 24 Elder Futhark runes in order", correct: true, explanation: "Correct — evidence the futhark was a fixed, ordered alphabet." },
              { id: "b", text: "A complete guide to rune divination", correct: false, explanation: "No such ancient manual survives." },
              { id: "c", text: "A map of Scandinavia", correct: false, explanation: "It's a runic row, not a map." },
            ] },
            { id: "q2", type: "mcq", prompt: "The Bryggen rune-sticks from Bergen mostly contain…", options: [
              { id: "a", text: "Everyday notes — trade, names, messages, and graffiti", correct: true, explanation: "Yes — they show runes used for ordinary writing." },
              { id: "b", text: "Only magical curses", correct: false, explanation: "Magic was the exception; most were mundane." },
              { id: "c", text: "Astrological charts", correct: false, explanation: "That's a different tradition entirely." },
            ] },
            { id: "q3", type: "mcq", prompt: "What does the archaeological record mainly show runes being used for?", options: [
              { id: "a", text: "Writing — names, memorials, ownership, and messages", correct: true, explanation: "Correct — overwhelmingly a writing system." },
              { id: "b", text: "A board game", correct: false, explanation: "There's no evidence of that." },
              { id: "c", text: "Drawing tiles from a divination bag", correct: false, explanation: "That practice is a modern reconstruction." },
            ] },
            { id: "q4", type: "true-false", prompt: "A complete ancient manual explaining how to read runes for divination has survived.", options: [
              { id: "t", text: "True", correct: false, explanation: "No such manual exists; modern meanings are reconstructed." },
              { id: "f", text: "False", correct: true, explanation: "Correct — the detailed divinatory system is modern." },
            ] },
            { id: "q5", type: "true-false", prompt: "The Roman writer Tacitus described Germanic peoples casting marked strips of wood as lots.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — around 98 CE, though he doesn't confirm the marks were runes." },
              { id: "f", text: "False", correct: false, explanation: "He genuinely described this practice." },
            ] },
            { id: "q6", type: "recall", prompt: "Name the Gotland limestone slab with the earliest full Elder Futhark row.", options: [], answer: "Kylver Stone", accept: ["Kylver", "the Kylver Stone", "Kylver stone"], explanation: "The Kylver Stone (~400 CE) carries all 24 runes in order." },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "The Runes",
      lessons: [
        {
          id: "l4-first-aett",
          title: "First aett (Fehu–Wunjo)",
          objective: "Recall the meanings of the first eight runes.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "The first aett — Freyr's aett, named for the Vanir god of fertility and prosperity — gathers the runes of the everyday material world: wealth, strength, craft, and community. They're the foundations of a life, which makes them a fitting place to begin." },
            { kind: "explore", prompt: "The first aett", instructions: "Tap a rune to learn it", items: [
              { glyph: "ᚠ", name: "Fehu", meta: "Wealth · cattle", accent: "#c9881f", blurb: "Movable wealth and abundance — earned prosperity and its responsible flow." },
              { glyph: "ᚢ", name: "Uruz", meta: "Strength · the aurochs", accent: "#6a9a4a", blurb: "Raw vitality, health and untamed power. Endurance and formative force." },
              { glyph: "ᚦ", name: "Thurisaz", meta: "Thorn · giant", accent: "#c0392b", blurb: "A reactive force — defence, conflict and catharsis. Use with care." },
              { glyph: "ᚨ", name: "Ansuz", meta: "Odin · the mouth", accent: "#6c5ce7", blurb: "Words, wisdom and divine inspiration — communication and insight." },
              { glyph: "ᚱ", name: "Raidho", meta: "Journey · the ride", accent: "#2e86c1", blurb: "Travel, rhythm and right action — the journey and its lessons." },
              { glyph: "ᚲ", name: "Kenaz", meta: "Torch · the beacon", accent: "#d35400", blurb: "Illumination, craft and knowledge — the controlled fire of creation." },
              { glyph: "ᚷ", name: "Gebo", meta: "Gift · exchange", accent: "#c0398a", blurb: "Generosity, partnership and the balance of giving and receiving." },
              { glyph: "ᚹ", name: "Wunjo", meta: "Joy · harmony", accent: "#c9a227", blurb: "Joy, belonging and fulfilment — harmony among kindred spirits." },
            ] },
            { kind: "table", headers: ["Rune", "Sound", "Keyword"], rows: [
              ["Fehu (ᚠ)", "F", "Wealth, abundance, cattle"],
              ["Uruz (ᚢ)", "U", "Strength, vitality, the wild ox"],
              ["Thurisaz (ᚦ)", "Th", "A thorn or giant — conflict, defense, a catalyst"],
              ["Ansuz (ᚨ)", "A", "Communication, wisdom, a message (linked to Odin)"],
              ["Raidho (ᚱ)", "R", "A journey, movement, rhythm"],
              ["Kenaz (ᚲ)", "K", "Torch — knowledge, creativity, insight"],
              ["Gebo (ᚷ)", "G", "A gift, generosity, partnership"],
              ["Wunjo (ᚹ)", "W", "Joy, harmony, contentment"],
            ] },
            { kind: "callout", tone: "tradition", title: "Cattle as currency", text: "Fehu literally means 'cattle' — and in an early Germanic economy, livestock was wealth. Notice it sits first in the futhark, just as 'aleph/alpha' (also an ox) sits first in the alphabets that influenced it. The echo is probably not a coincidence." },
            { kind: "callout", tone: "tip", title: "A note on 'merkstave'", text: "Many modern readers give runes a reversed or 'merkstave' (shadow) meaning when they fall upside-down. It's a useful reflective device, but it's a modern convention — and some runes (like Gebo or Isa) are symmetrical and can't reverse at all. Treat reversals as optional, not a fixed rule." },
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
            { id: "q4", type: "mcq", prompt: "Kenaz (ᚲ), the torch, is the rune of…", options: [
              { id: "a", text: "Knowledge, craft, and creative insight", correct: true, explanation: "Correct — the controlled fire of making." },
              { id: "b", text: "A harvest", correct: false, explanation: "That's Jera, in the second aett." },
              { id: "c", text: "Heritage", correct: false, explanation: "That's Othala, in the third aett." },
            ] },
            { id: "q5", type: "true-false", prompt: "The first aett is traditionally named for the god Freyr.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — Freyr's aett, the runes of the material world." },
              { id: "f", text: "False", correct: false, explanation: "It genuinely is Freyr's aett." },
            ] },
            { id: "q6", type: "recall", prompt: "What animal does the name 'Fehu' literally mean, reflecting early wealth?", options: [], answer: "cattle", accept: ["cattle", "cow", "cows", "livestock", "ox"], explanation: "Fehu means 'cattle' — livestock was movable wealth." },
          ],
        },
        {
          id: "l5-second-aett",
          title: "Second aett (Hagalaz–Sowilo)",
          objective: "Recall the meanings of the second eight runes.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "The second aett — Heimdall's aett, named for the ever-watchful guardian of the gods — turns to the forces that test us: hail, need, ice, and fate, balanced by harvest, protection, and the sun. If the first aett built a life, the second is about weathering it." },
            { kind: "table", headers: ["Rune", "Sound", "Keyword"], rows: [
              ["Hagalaz (ᚺ)", "H", "Hail — disruption, sudden change, a clearing storm"],
              ["Nauthiz (ᚾ)", "N", "Need — constraint, resistance, hard lessons"],
              ["Isa (ᛁ)", "I", "Ice — stillness, stasis, a pause"],
              ["Jera (ᛃ)", "J/Y", "Harvest — cycles, reward for effort, right timing"],
              ["Eihwaz (ᛇ)", "Ï/EI", "Yew — endurance, transformation, the axis"],
              ["Perthro (ᛈ)", "P", "The dice-cup — fate, mystery, the unknown"],
              ["Algiz (ᛉ)", "Z", "Protection — a shield, defense, higher connection"],
              ["Sowilo (ᛊ)", "S", "The sun — success, vitality, wholeness, guidance"],
            ] },
            { kind: "callout", tone: "tradition", title: "Hail that becomes water", text: "Hagalaz is hail — a destructive storm, but one made of frozen water that melts and nourishes the ground. It captures a recurring runic idea: disruption isn't only loss. The hardest seasons can clear what was stuck and feed what grows next." },
            { kind: "callout", tone: "history", title: "Perthro and casting lots", text: "Perthro's name is uncertain, but many read it as a dice-cup or lot-box — the very tool of chance. If any rune nods to the practice of casting lots that ancient writers mention, it's this one. Modern readers treat it as the rune of fate, mystery, and 'the hidden.'" },
            { kind: "callout", tone: "evidence", title: "Meanings are reconstructed", text: "These keywords come largely from the Old English, Norwegian, and Icelandic rune poems — medieval verses that give each rune a memorable line — plus modern interpretation. They're a thoughtful reconstruction, not a single unbroken tradition, so different books will vary." },
            { kind: "list", items: [
              "**Algiz** is often drawn as an upward 'elk' or splayed hand — a rune of warding and reaching upward.",
              "**Sowilo**, the sun, is one of the runes later misused as a hate symbol; the course rejects that misuse.",
              "**Jera** has no single up/down orientation — its meaning is the turning of the year itself.",
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
            { id: "q4", type: "mcq", prompt: "Jera (ᛃ) is the rune of…", options: [
              { id: "a", text: "Harvest, cycles, and reward for patient effort", correct: true, explanation: "Correct — the turning of the year." },
              { id: "b", text: "Ice and stillness", correct: false, explanation: "That's Isa." },
              { id: "c", text: "A gift", correct: false, explanation: "That's Gebo." },
            ] },
            { id: "q5", type: "true-false", prompt: "Many runic meanings draw on the medieval rune poems and modern interpretation rather than a single unbroken tradition.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they're a thoughtful reconstruction." },
              { id: "f", text: "False", correct: false, explanation: "It's genuinely a reconstruction; books vary." },
            ] },
            { id: "q6", type: "recall", prompt: "Which weather event is the rune Hagalaz named for?", options: [], answer: "hail", accept: ["hail", "hailstorm", "a hailstorm"], explanation: "Hagalaz means 'hail' — a clearing, disruptive storm." },
          ],
        },
        {
          id: "l6-third-aett",
          title: "Third aett (Tiwaz–Othala)",
          objective: "Recall the meanings of the third eight runes.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "The third aett — Tyr's aett, named for the god of justice and sacrifice — turns to the self in society: honor, partnership, humanity, and the heritage we hand on. It closes the futhark on questions of meaning and belonging." },
            { kind: "sort", prompt: "Sort runes into their aett", instructions: "Tap a rune, then tap the aett it belongs to", groups: [
              { name: "Freyr's aett", accent: "#c9881f", items: ["ᚠ Fehu", "ᚢ Uruz", "ᚦ Thurisaz"] },
              { name: "Heimdall's aett", accent: "#2e86c1", items: ["ᚺ Hagalaz", "ᚾ Nauthiz", "ᛁ Isa"] },
              { name: "Tyr's aett", accent: "#c0392b", items: ["ᛏ Tiwaz", "ᛒ Berkana", "ᛗ Mannaz"] },
            ] },
            { kind: "table", headers: ["Rune", "Sound", "Keyword"], rows: [
              ["Tiwaz (ᛏ)", "T", "Justice, honor, courage (the god Tyr)"],
              ["Berkano (ᛒ)", "B", "Birch — growth, birth, nurturing, new beginnings"],
              ["Ehwaz (ᛖ)", "E", "Horse — partnership, trust, movement together"],
              ["Mannaz (ᛗ)", "M", "Humankind — the self, community, shared humanity"],
              ["Laguz (ᛚ)", "L", "Water — intuition, flow, the unconscious"],
              ["Ingwaz (ᛜ)", "Ng", "Fertility, gestation, potential coming to fruition"],
              ["Dagaz (ᛞ)", "D", "Day — breakthrough, awakening, a turning point"],
              ["Othala (ᛟ)", "O", "Heritage, ancestry, home, what is truly yours"],
            ] },
            { kind: "callout", tone: "tradition", title: "Tyr's sacrifice", text: "Tiwaz points like an arrow upward, and is named for Tyr, who placed his hand in the wolf Fenrir's jaws so the gods could bind him — and lost it. He's the rune of justice that costs something: standing by your word even when it hurts." },
            { kind: "callout", tone: "tradition", title: "A pair of horses", text: "Ehwaz (horse) and Mannaz (humankind) sit side by side for a reason. One is partnership and trust between two beings moving as one; the other is the self within a community. Read together, they're the runes of relationship at every scale." },
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
            { id: "q3", type: "mcq", prompt: "Tiwaz (ᛏ) is named for which god?", options: [
              { id: "a", text: "Tyr, the god of justice and sacrifice", correct: true, explanation: "Correct — the rune of honor that costs something." },
              { id: "b", text: "Odin", correct: false, explanation: "Odin is linked to Ansuz." },
              { id: "c", text: "Freyr", correct: false, explanation: "Freyr names the first aett, not Tiwaz." },
            ] },
            { id: "q4", type: "mcq", prompt: "Mannaz (ᛗ) is the rune of…", options: [
              { id: "a", text: "Humankind — the self within community", correct: true, explanation: "Correct — shared humanity." },
              { id: "b", text: "A horse", correct: false, explanation: "That's Ehwaz, its neighbor." },
              { id: "c", text: "Hail", correct: false, explanation: "That's Hagalaz, in the second aett." },
            ] },
            { id: "q5", type: "true-false", prompt: "Some runes have been misappropriated by hate groups, and this course rejects that misuse.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — study the runes with respect for their origins." },
              { id: "f", text: "False", correct: false, explanation: "This is true — the course explicitly rejects that misuse." },
            ] },
            { id: "q6", type: "recall", prompt: "Which god, who sacrificed his hand to bind the wolf Fenrir, gives Tiwaz its name?", options: [], answer: "Tyr", accept: ["Tyr", "Tiw", "Tiwaz"], explanation: "Tiwaz is named for Tyr, god of justice and sacrifice." },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Practice",
      lessons: [
        {
          id: "l7-draws",
          title: "Single & three-rune draws",
          objective: "Perform a single-rune and a three-rune draw.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "You don't need an elaborate ritual to start. With a set of runes in a bag or face-down, hold your question in mind and draw. The structure does the work — a clear question and a fixed set of positions give your reflection somewhere to land." },
            { kind: "list", items: [
              "**Single rune** — draw one for a daily focus or a direct prompt to reflect on.",
              "**Three runes** — draw three and read them as a small story: a common layout is situation / action / outcome, or past / present / future.",
              "**Five-rune cross** — a slightly larger spread: past, present, hidden influences, advice, and likely direction. Useful once the three-rune draw feels natural.",
            ] },
            { kind: "callout", tone: "tip", title: "Position shapes meaning", text: "As with tarot, the same rune reads differently by position. A rune in the 'action' spot suggests something to do; in the 'outcome' spot it hints where things may lead. Let the question and the positions guide you." },
            { kind: "callout", tone: "tip", title: "Frame it as one drawing", text: "When you pull several runes, lay them left to right and read them as a single sentence, not three unrelated fortunes. The art is in the connection between them — how 'need' (Nauthiz) flowing into 'harvest' (Jera) tells a different story than the reverse." },
            { kind: "table", headers: ["Spread", "Positions", "Good for"], rows: [
              ["One rune", "A single focus", "A daily prompt or a quick check-in"],
              ["Three runes", "Situation / action / outcome", "Thinking through a specific question"],
              ["Three runes", "Past / present / future", "Seeing a situation as a story over time"],
              ["Five-rune cross", "Past · present · hidden · advice · direction", "A fuller reflection once you're comfortable"],
            ] },
            { kind: "callout", tone: "evidence", title: "Why structure helps", text: "Fixed positions aren't magic — they're a thinking aid. By forcing 'what's the situation' and 'what could I do' into separate slots, the spread nudges you to consider angles you might have skipped. That's the honest source of a reading's usefulness." },
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
            { id: "q3", type: "mcq", prompt: "Why do fixed spread positions help a reading?", options: [
              { id: "a", text: "They're a thinking aid that nudges you to consider separate angles", correct: true, explanation: "Correct — the structure prompts fuller reflection." },
              { id: "b", text: "They give the runes supernatural accuracy", correct: false, explanation: "The strength is in the reflection the structure invites." },
              { id: "c", text: "They guarantee a correct prediction", correct: false, explanation: "Runes open questions to reflect on rather than fixing outcomes." },
            ] },
            { id: "q4", type: "mcq", prompt: "When you draw three runes, the best approach is to…", options: [
              { id: "a", text: "Read them together as one connected story", correct: true, explanation: "Correct — the meaning lives in the connection." },
              { id: "b", text: "Treat each as three separate, unrelated fortunes", correct: false, explanation: "The art is in reading them as a whole." },
              { id: "c", text: "Ignore their positions entirely", correct: false, explanation: "Position shapes meaning." },
            ] },
            { id: "q5", type: "true-false", prompt: "A rune's position in a spread can change how you read it.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — position shapes meaning, as in tarot." },
              { id: "f", text: "False", correct: false, explanation: "Position genuinely matters." },
            ] },
            { id: "q6", type: "true-false", prompt: "Fixed spread positions give runes a proven power to predict the future.", options: [
              { id: "t", text: "True", correct: false, explanation: "They're a reflective aid, not a predictive one." },
              { id: "f", text: "False", correct: true, explanation: "Correct — structure aids thinking; it doesn't predict." },
            ] },
          ],
        },
        {
          id: "l8-bind-runes",
          title: "Bind runes & combining symbols",
          objective: "Explain what a bind rune is and how it differs from a single rune.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "A bind rune is two or more runes merged into a single glyph, usually by sharing a common vertical stem. Instead of reading runes in sequence, you stack their meanings into one combined symbol — a kind of monogram of intentions." },
            { kind: "callout", tone: "history", title: "Genuinely old", text: "Bind runes are not a modern invention. They appear on real artifacts — coins, memorial stones, and personal items — where carvers combined runes to save space or to weave a name or word into a tidy mark. The famous 'gibu auja' ('I give good luck') bracteates are an early example of runes worked into a charm." },
            { kind: "callout", tone: "tradition", title: "Monograms & maker's marks", text: "Many historical bind runes were practical: a craftsperson's initials, or the runes of a name overlapped into a signature. The decorative monogram on a modern envelope is the same idea. Beauty and brevity, not necessarily magic, drove most of them." },
            { kind: "list", items: [
              "**Pick your intent** — choose two or three runes whose meanings together describe what you want to reflect on (e.g., Fehu + Wunjo for 'prosperous joy').",
              "**Find a shared stem** — overlap the runes on a common vertical line so they read as one glyph.",
              "**Keep it legible** — fewer runes make a cleaner, more meaningful bind; piling on a dozen muddies it.",
              "**Treat it as a focus, not a spell** — a bind rune is a personal emblem to think with, not a guaranteed effect.",
            ] },
            { kind: "callout", tone: "evidence", title: "Honest framing", text: "A bind rune has no demonstrated power to change events. Its value is the same as any chosen symbol: it concentrates attention and intention. Designing one is a reflective, creative act — useful for that reason, not as a cause-and-effect charm." },
            { kind: "callout", tone: "culture", title: "Design with care", text: "Because a few individual runes have been co-opted by hate groups, be thoughtful about combinations and context, especially if you wear or share a bind rune. Knowing each component and its history is part of using the runes respectfully." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A bind rune is…", options: [
              { id: "a", text: "Two or more runes merged into a single glyph, often on a shared stem", correct: true, explanation: "Correct — a combined symbol stacking meanings." },
              { id: "b", text: "A spread of runes laid in a circle", correct: false, explanation: "That's a layout, not a bind rune." },
              { id: "c", text: "A single rune drawn upside-down", correct: false, explanation: "That's a reversed or 'merkstave' rune." },
            ] },
            { id: "q2", type: "mcq", prompt: "Bind runes in history were often used as…", options: [
              { id: "a", text: "Monograms, maker's marks, or charms — a tidy combined symbol", correct: true, explanation: "Yes — practical and decorative as well as protective." },
              { id: "b", text: "A purely 20th-century invention", correct: false, explanation: "They appear on genuine ancient artifacts." },
              { id: "c", text: "A replacement for the whole futhark", correct: false, explanation: "They combine a few runes, not the whole set." },
            ] },
            { id: "q3", type: "mcq", prompt: "How is a bind rune best framed honestly?", options: [
              { id: "a", text: "As a personal emblem that concentrates attention and intent", correct: true, explanation: "Correct — a reflective focus, not a cause-and-effect charm." },
              { id: "b", text: "As a guaranteed way to change events", correct: false, explanation: "It has no demonstrated power over outcomes." },
              { id: "c", text: "As a medical remedy", correct: false, explanation: "Never — it makes no health claims." },
            ] },
            { id: "q4", type: "mcq", prompt: "A good design tip for a bind rune is to…", options: [
              { id: "a", text: "Keep it to a few legible runes so the meaning stays clear", correct: true, explanation: "Correct — fewer runes make a cleaner bind." },
              { id: "b", text: "Combine as many runes as possible", correct: false, explanation: "Piling on runes muddies it." },
              { id: "c", text: "Use runes you don't recognize", correct: false, explanation: "Know each component and its history." },
            ] },
            { id: "q5", type: "true-false", prompt: "Bind runes appear on genuine historical artifacts, not just modern designs.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — coins, stones, and personal items show them." },
              { id: "f", text: "False", correct: false, explanation: "They are genuinely attested in antiquity." },
            ] },
            { id: "q6", type: "recall", prompt: "What word describes two or more runes merged into one combined glyph?", options: [], answer: "bind rune", accept: ["bindrune", "bind-rune", "a bind rune"], explanation: "A bind rune merges runes into a single symbol, usually on a shared stem." },
          ],
        },
        {
          id: "l9-reflection-respect",
          title: "Reading for reflection & respect",
          objective: "Apply a reflective, respectful stance to rune reading.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The healthiest way to read runes is as a structured prompt for reflection: the symbol gives you an angle, and you do the thinking. Frame open questions ('What can I bring to this?') rather than yes/no fortune-telling." },
            { kind: "callout", tone: "history", title: "The modern revival, named", text: "Much of today's popular rune divination traces to Ralph Blum's 1982 'The Book of Runes,' sold with a bag of tiles. It was hugely popular but freely reinterpreted the runes — even adding a 'blank rune' unknown in antiquity. Knowing this helps you treat modern meanings as a thoughtful reconstruction rather than ancient gospel." },
            { kind: "callout", tone: "culture", title: "Honor the source", text: "The runes carry a living Norse/Germanic heritage. Engage with curiosity and respect, credit where they come from, and firmly reject the hate-group misuse of certain runes. Approached this way, they're a meaningful, finite system for reflection." },
            { kind: "callout", tone: "tip", title: "Keep a rune journal", text: "Write down the question, what you drew, and what you made of it. Over time you'll see your own readings honestly — which interpretations helped, which were just hopeful — and your relationship with the symbols deepens without slipping into magical thinking." },
            { kind: "callout", tone: "evidence", title: "Keep it grounded", text: "Runes are a reflective tool — not a predictor of events, and not a substitute for medical, legal, financial, or mental-health advice." },
            { kind: "keyfacts", items: [
              "Ask open, agency-centered questions, not yes/no fortunes.",
              "Modern meanings are a reconstruction — hold them lightly.",
              "Credit the Norse/Germanic source and reject hate-group misuse.",
              "Runes never replace medical, legal, financial, or mental-health advice.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "Whose 1982 book drove much of the modern rune-divination revival?", options: [
              { id: "a", text: "Ralph Blum, 'The Book of Runes'", correct: true, explanation: "Correct — it popularized rune tiles and even a 'blank rune.'" },
              { id: "b", text: "The Roman historian Tacitus", correct: false, explanation: "Tacitus wrote c. 98 CE, not in 1982." },
              { id: "c", text: "The carver of the Kylver Stone", correct: false, explanation: "That's an ancient inscription, not a modern book." },
            ] },
            { id: "q5", type: "true-false", prompt: "The 'blank rune' found in many modern sets was part of the ancient Elder Futhark.", options: [
              { id: "t", text: "True", correct: false, explanation: "The blank rune is a modern addition, unknown in antiquity." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it was introduced in the 20th-century revival." },
            ] },
            { id: "q6", type: "true-false", prompt: "Runes are a substitute for professional medical or mental-health advice.", options: [
              { id: "t", text: "True", correct: false, explanation: "They are never a substitute for professional advice." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep them grounded as a reflective tool." },
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
      { id: "c", text: "16 runes", correct: false },
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
    { id: "f15", type: "mcq", prompt: "The Kylver Stone (~400 CE) is important because it preserves…", options: [
      { id: "a", text: "The earliest known full row of the 24 Elder Futhark runes", correct: true },
      { id: "b", text: "An ancient guide to rune divination", correct: false },
      { id: "c", text: "A list of Norse kings", correct: false },
      { id: "d", text: "The blank rune", correct: false },
    ] },
    { id: "f16", type: "mcq", prompt: "The later Younger Futhark, used in the Viking Age, had…", options: [
      { id: "a", text: "16 runes", correct: true },
      { id: "b", text: "24 runes", correct: false },
      { id: "c", text: "8 runes", correct: false },
      { id: "d", text: "30 runes", correct: false },
    ] },
    { id: "f17", type: "mcq", prompt: "A bind rune is…", options: [
      { id: "a", text: "Two or more runes merged into one glyph", correct: true },
      { id: "b", text: "A rune drawn reversed", correct: false },
      { id: "c", text: "A spread of nine runes", correct: false },
      { id: "d", text: "The blank rune", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "The Bryggen rune-sticks from Bergen mostly show runes used for…", options: [
      { id: "a", text: "Everyday writing — notes, trade, and messages", correct: true },
      { id: "b", text: "Only secret curses", correct: false },
      { id: "c", text: "Astrology", correct: false },
      { id: "d", text: "Music notation", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "The first aett is traditionally named for…", options: [
      { id: "a", text: "Freyr", correct: true },
      { id: "b", text: "Tyr", correct: false },
      { id: "c", text: "Loki", correct: false },
      { id: "d", text: "Thor", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "Tiwaz (ᛏ) is named for Tyr, the god of…", options: [
      { id: "a", text: "Justice and sacrifice", correct: true },
      { id: "b", text: "The sea", correct: false },
      { id: "c", text: "Thunder", correct: false },
      { id: "d", text: "Trickery", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "Whose 1982 book drove much of the modern rune-divination revival?", options: [
      { id: "a", text: "Ralph Blum, 'The Book of Runes'", correct: true },
      { id: "b", text: "Tacitus", correct: false },
      { id: "c", text: "Snorri Sturluson", correct: false },
      { id: "d", text: "Carl Jung", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "The modern 'blank rune' is best described as…", options: [
      { id: "a", text: "A 20th-century addition, not part of the ancient futhark", correct: true },
      { id: "b", text: "The oldest rune of all", correct: false },
      { id: "c", text: "A rune from the Kylver Stone", correct: false },
      { id: "d", text: "The first rune of the second aett", correct: false },
    ] },
    { id: "f23", type: "mcq", prompt: "Hagalaz (ᚺ) is named for…", options: [
      { id: "a", text: "Hail — a disruptive but clearing storm", correct: true },
      { id: "b", text: "The sun", correct: false },
      { id: "c", text: "A gift", correct: false },
      { id: "d", text: "A horse", correct: false },
    ] },
    { id: "f24", type: "true-false", prompt: "A rune's position in a spread can change how it's read.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f25", type: "true-false", prompt: "Runes are a substitute for medical or legal advice.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f26", type: "true-false", prompt: "A complete ancient manual for rune divination has survived to today.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f27", type: "true-false", prompt: "The Elder Futhark's 24 runes are divided into three aettir of eight.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
