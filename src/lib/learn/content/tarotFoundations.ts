import type { Course } from "../types";

/**
 * FLAGSHIP COURSE #3 — Tarot, taught as a reflective tool with accurate history.
 * Pairs with the 78-card quick reference (src/lib/learn/reference/tarot.ts).
 */
export const tarotFoundations: Course = {
  id: "tarot-foundations",
  domain: "tarot",
  title: "Tarot Foundations",
  subtitle: "The 78 cards and how to read them",
  level: "foundations",
  icon: "🔮",
  summary:
    "Learn the real history of tarot, the structure of the deck, what the cards mean, and how to read spreads as a tool for reflection — not fortune-telling.",
  estMinutes: 70,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "What Tarot Is", lessons: ["A reflective tool, not fortune-telling", "The real history of tarot", "Structure: Major & Minor Arcana"] },
    { module: "The Cards", lessons: ["The Major Arcana & the Fool's Journey", "The four suits & the elements", "The Minor Arcana, Ace to Ten", "The numerology of the pips", "The court cards in depth", "Reversals"] },
    { module: "Reading", lessons: ["Spreads: three-card & the Celtic Cross", "Reading as narrative", "Reading ethically"] },
  ],

  modules: [
    {
      id: "m1",
      title: "What Tarot Is",
      lessons: [
        {
          id: "l1-reflective-tool",
          title: "A reflective tool, not fortune-telling",
          objective: "Explain what tarot is and how to hold it honestly.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Tarot is a deck of 78 symbolic images used as a tool for reflection and storytelling. A reading lays out cards whose pictures act as prompts — mirrors that help you think through a situation from new angles." },
            { kind: "text", text: "Nothing about the cards is random in the sense that matters. The deck is a fixed, shared vocabulary of recurring human situations: beginnings, choices, grief, ambition, rest, rivalry, hope. When you draw a card, you're handed one of those situations to hold up against your own life and ask, 'where does this fit?'" },
            { kind: "callout", tone: "evidence", title: "What the evidence says", text: "Tarot has no demonstrated power to predict the future. It works as a 'projective' tool: the open-ended images invite you to project your own thoughts and feelings onto them, which is genuinely useful for reflection. The 'Forer effect' — vague statements feeling personally true — explains much of why readings can feel uncannily accurate." },
            { kind: "callout", tone: "evidence", title: "Why ambiguous images work", text: "Psychologists call open-ended prompts that invite you to read meaning into them 'projective' (the inkblot test is the famous example). Ambiguity isn't a bug here — it's the mechanism. A vivid, slightly puzzling picture gives your mind room to surface the thought it was already circling." },
            { kind: "callout", tone: "tradition", title: "Why it still has value", text: "Used as structured self-inquiry, tarot can surface what you already half-know, spark insight, and help you sit with a question. That's the honest, powerful version — no claim of fortune-telling required." },
            { kind: "callout", tone: "tip", title: "The single most useful reframe", text: "Treat every card as a question, not a verdict. 'The Tower' isn't 'disaster is coming' — it's 'where in your life is something built on shaky ground?' The card that lands hardest is usually the one worth journaling about." },
            { kind: "keyfacts", items: [
              "78 cards = a shared visual vocabulary of human situations.",
              "Projective tool: you supply the meaning the image only hints at.",
              "Best framed as reflection and self-inquiry, never prediction.",
              "The Forer effect explains much of the 'uncanny accuracy.'",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Tarot is best understood as…", options: [
              { id: "a", text: "A projective tool for reflection and storytelling", correct: true, explanation: "Yes — the images prompt your own reflection." },
              { id: "b", text: "A proven method of predicting the future", correct: false, explanation: "Tarot has no demonstrated predictive power." },
              { id: "c", text: "A medical diagnostic system", correct: false, explanation: "Tarot makes no medical claims." },
            ] },
            { id: "q2", type: "mcq", prompt: "The 'Forer effect' helps explain…", options: [
              { id: "a", text: "Why vague statements feel personally accurate", correct: true, explanation: "Correct — it's why readings can feel uncannily 'true.'" },
              { id: "b", text: "How cards are printed", correct: false, explanation: "It's a psychological effect, not a printing process." },
              { id: "c", text: "The price of a deck", correct: false, explanation: "Unrelated." },
            ] },
            { id: "q3", type: "mcq", prompt: "Calling tarot a 'projective' tool means…", options: [
              { id: "a", text: "Its ambiguous images invite you to read your own meaning into them", correct: true, explanation: "Right — like an inkblot, the openness is the mechanism." },
              { id: "b", text: "It projects images onto a wall", correct: false, explanation: "Projective is a psychological term, not an optical one." },
              { id: "c", text: "It predicts projected sales figures", correct: false, explanation: "Nothing to do with forecasting numbers." },
            ] },
            { id: "q4", type: "true-false", prompt: "A tarot deck contains 78 cards.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — 22 Major + 56 Minor Arcana." },
              { id: "f", text: "False", correct: false, explanation: "It is 78 cards total." },
            ] },
            { id: "q5", type: "true-false", prompt: "Tarot has a scientifically demonstrated ability to foresee future events.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — there's no demonstrated predictive power." },
              { id: "f", text: "False", correct: true, explanation: "Correct — its value is reflective, not predictive." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the word for a tool whose open-ended images invite you to read your own meaning into them.", options: [], answer: "projective", accept: ["projective tool", "projection"], explanation: "Projective tools (like the inkblot test) work because ambiguity lets you surface your own thoughts." },
          ],
        },
        {
          id: "l2-history",
          title: "The real history of tarot",
          objective: "Place tarot's origins correctly and debunk the 'ancient Egypt' myth.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "history", title: "Where it actually began", text: "Tarot began as a card GAME in mid-15th-century northern Italy (called 'tarocchi'). For centuries it was played like any other card game, not used for divination." },
            { kind: "text", text: "The earliest known decks were hand-painted luxuries commissioned by noble families — the surviving Visconti-Sforza cards from Milan, around the 1450s, are the most famous. The trick-taking game spread across Italy and France under names like tarocchi and 'tarot,' and the special trump cards (today's Major Arcana) simply outranked the four ordinary suits in play." },
            { kind: "text", text: "Divinatory use only appears in the late 1700s, popularized by figures like Antoine Court de Gébelin and the cartomancer 'Etteilla.' The famous deck most people picture — the Rider–Waite–Smith — was published in 1909, illustrated by Pamela Colman Smith and conceived by A. E. Waite." },
            { kind: "callout", tone: "history", title: "Busting the Egyptian myth", text: "The popular claim that tarot is an ancient Egyptian 'Book of Thoth' is a myth, invented in the 18th century. There's no evidence linking tarot to ancient Egypt." },
            { kind: "callout", tone: "tradition", title: "Why the RWS deck took over", text: "Before 1909, most decks drew only abstract pips for the Minor Arcana — just ten cups, ten coins, and so on, like a poker deck. Smith's innovation was a unique illustrated scene on every one of the 56 Minors. Those little pictures made the deck learnable from the images alone, which is why the Rider–Waite–Smith pattern became the worldwide standard." },
            { kind: "callout", tone: "culture", title: "Credit where it's due", text: "For decades the deck was called simply 'Rider–Waite' after its publisher and author, leaving out the artist who drew every card. Pamela Colman Smith — a working illustrator of Afro-Caribbean and English heritage — was paid a flat fee and largely forgotten. Many readers now say 'Rider–Waite–Smith' (or 'Waite–Smith') to restore her name." },
            { kind: "table", headers: ["Era", "What tarot was"], rows: [
              ["~1440s Italy", "Hand-painted decks; a noble trick-taking game (tarocchi)"],
              ["1500s–1700s", "A popular card game across Italy and France"],
              ["Late 1700s", "First divinatory use (de Gébelin, Etteilla)"],
              ["1909", "Rider–Waite–Smith deck published, fully illustrated"],
            ] },
            { kind: "keyfacts", items: [
              "Origin: a 15th-century Italian card game, not an occult relic.",
              "Divination grafted on only in the late 1700s.",
              "The 'ancient Egyptian Book of Thoth' story is an 18th-century invention.",
              "RWS (1909): first deck with a scene on every Minor card.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Tarot originally began as…", options: [
              { id: "a", text: "A card game in 15th-century Italy", correct: true, explanation: "Correct — 'tarocchi,' a playing-card game." },
              { id: "b", text: "An ancient Egyptian sacred text", correct: false, explanation: "That's a debunked 18th-century myth." },
              { id: "c", text: "A medieval medical chart", correct: false, explanation: "No — it was a card game." },
            ] },
            { id: "q2", type: "mcq", prompt: "The Rider–Waite–Smith deck was published in…", options: [
              { id: "a", text: "1909", correct: true, explanation: "Yes — illustrated by Pamela Colman Smith." },
              { id: "b", text: "1450", correct: false, explanation: "That's roughly when the game began, not the RWS deck." },
              { id: "c", text: "2001", correct: false, explanation: "Much earlier — 1909." },
            ] },
            { id: "q3", type: "mcq", prompt: "What was Pamela Colman Smith's key innovation in 1909?", options: [
              { id: "a", text: "A unique illustrated scene on every Minor Arcana card", correct: true, explanation: "Right — that made the deck learnable from the images." },
              { id: "b", text: "Adding a fifth suit", correct: false, explanation: "The deck kept four suits." },
              { id: "c", text: "Inventing reversals", correct: false, explanation: "Reversals long predate her work." },
            ] },
            { id: "q4", type: "true-false", prompt: "Tarot was used for divination from its very beginning.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — divination use only began in the late 1700s." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it was a card game first for centuries." },
            ] },
            { id: "q5", type: "true-false", prompt: "There is solid evidence that tarot originated in ancient Egypt.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the Egyptian origin is a debunked myth." },
              { id: "f", text: "False", correct: true, explanation: "Correct — the cards trace to 15th-century Italy." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the artist's surname now restored to the deck's name 'Rider–Waite–___'.", options: [], answer: "Smith", accept: ["colman smith", "pamela colman smith"], explanation: "Pamela Colman Smith illustrated all 78 cards and is increasingly credited by name." },
          ],
        },
        {
          id: "l3-structure",
          title: "Structure: Major & Minor Arcana",
          objective: "Describe how the 78 cards are divided.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The deck splits into two parts, called 'arcana' (from the Latin 'arcanum,' meaning 'secret' or 'mystery')." },
            { kind: "table", headers: ["Part", "Cards", "Covers"], rows: [
              ["Major Arcana", "22", "Big life themes & archetypes (The Fool → The World)"],
              ["Minor Arcana", "56", "Everyday matters, in four suits"],
            ] },
            { kind: "text", text: "The 56 Minor Arcana break into four suits of 14 cards each: Ace through Ten (the 'pips'), plus four court cards (Page, Knight, Queen, King). The Major Arcana are the 'headline' cards — when several appear, the reading is about something significant and longer-term rather than a passing daily matter." },
            { kind: "text", text: "A handy way to feel the difference: the Minors are the weather (changeable, specific, day-to-day), and the Majors are the climate (the deeper currents and turning points a life moves through). Most readings mix both." },
            { kind: "callout", tone: "tip", title: "Majors vs. Minors at a glance", text: "Lots of Majors in a spread? The question is touching something big — identity, a turning point, a long arc. Mostly Minors? It's probably a concrete, near-term situation you have real handles on." },
            { kind: "callout", tone: "history", title: "Why '22' and '56'?", text: "The numbers are a relic of the original game, not numerology. A standard 15th-century pack had four suits of fourteen cards (56), plus a fifth group of twenty-one special trumps and an unnumbered 'Fool' — twenty-two in all. Divination later layered meaning onto a structure that gameplay had already fixed." },
            { kind: "keyfacts", items: [
              "78 cards total = 22 Major + 56 Minor.",
              "Minor Arcana = 4 suits × 14 cards (10 pips + 4 courts).",
              "Major Arcana = 22 archetypal life themes (The Fool 0 → The World 21).",
              "'Arcana' means secrets or mysteries.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "How many Major Arcana cards are there?", options: [
              { id: "a", text: "22", correct: true, explanation: "Correct — The Fool (0) through The World (21)." },
              { id: "b", text: "56", correct: false, explanation: "That's the Minor Arcana count." },
              { id: "c", text: "78", correct: false, explanation: "That's the whole deck." },
            ] },
            { id: "q2", type: "mcq", prompt: "The Minor Arcana are organized into…", options: [
              { id: "a", text: "Four suits of 14 cards each", correct: true, explanation: "Yes — Ace–Ten plus four courts, four times." },
              { id: "b", text: "Two suits of 28", correct: false, explanation: "There are four suits, not two." },
              { id: "c", text: "No suits at all", correct: false, explanation: "The Minors are defined by their suits." },
            ] },
            { id: "q3", type: "mcq", prompt: "When several Major Arcana appear in a reading, it usually signals…", options: [
              { id: "a", text: "Significant, big-picture themes", correct: true, explanation: "Right — the Majors are the 'headline' cards." },
              { id: "b", text: "That the deck is broken", correct: false, explanation: "It's a meaningful pattern, not a defect." },
              { id: "c", text: "Only trivial daily matters", correct: false, explanation: "That's more the Minors' territory." },
            ] },
            { id: "q4", type: "mcq", prompt: "Within one suit, the 14 cards are made up of…", options: [
              { id: "a", text: "Ten pips (Ace–Ten) plus four court cards", correct: true, explanation: "Correct — 10 + 4 = 14 per suit." },
              { id: "b", text: "Fourteen pips, no courts", correct: false, explanation: "Each suit has four courts." },
              { id: "c", text: "Twelve pips plus two courts", correct: false, explanation: "It's ten pips and four courts." },
            ] },
            { id: "q5", type: "true-false", prompt: "'Arcana' roughly means 'secrets' or 'mysteries.'", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — from the Latin 'arcanum.'" },
              { id: "f", text: "False", correct: false, explanation: "It does mean secrets/mysteries." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the total number of cards in a full tarot deck.", options: [], answer: "78", accept: ["seventy-eight", "seventy eight"], explanation: "78 = 22 Major Arcana + 56 Minor Arcana." },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "The Cards",
      lessons: [
        {
          id: "l4-major-arcana",
          title: "The Major Arcana & the Fool's Journey",
          objective: "Explain the Fool's Journey as a way to remember the Major Arcana.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "A classic way to learn the 22 Major Arcana is the 'Fool's Journey': read them in order as the story of The Fool (card 0) traveling through life's lessons to The World (card 21)." },
            { kind: "text", text: "The Fool is numbered zero, which is the whole point — he is the open, unwritten traveler, and every other Major is a teacher or trial he meets along the way. Read in sequence, the 22 cards trace a complete arc of growth: setting out, learning the rules, meeting love and loss, surrendering, being remade, and finally arriving whole." },
            { kind: "list", ordered: true, items: [
              "**The start (0–7):** The Fool sets out and meets foundational figures — the Magician, High Priestess, Empress, Emperor, Hierophant, Lovers, Chariot.",
              "**The middle (8–14):** inner lessons — Strength, the Hermit, the Wheel, Justice, the Hanged Man, Death, Temperance.",
              "**The climb (15–21):** big forces and resolution — the Devil, the Tower, the Star, the Moon, the Sun, Judgement, the World.",
            ] },
            { kind: "match", prompt: "Match each card to its meaning", instructions: "Tap a card, then tap its meaning", pairs: [
              { cue: "The Fool", img: "/images/tarot/major-0.webp", match: "New beginnings, a leap of faith, innocence" },
              { cue: "The Magician", img: "/images/tarot/major-1.webp", match: "Will, skill, manifestation" },
              { cue: "The High Priestess", img: "/images/tarot/major-2.webp", match: "Intuition, mystery, the unconscious" },
              { cue: "The Lovers", img: "/images/tarot/major-6.webp", match: "Union, choice, alignment of values" },
              { cue: "The Star", img: "/images/tarot/major-17.webp", match: "Hope, renewal, serene faith" },
              { cue: "Death", img: "/images/tarot/major-13.webp", match: "Transformation — an ending that makes room" },
            ] },
            { kind: "callout", tone: "tip", title: "Death rarely means death", text: "The Death card almost always means transformation — an ending that makes room for something new — not literal death. The Tower means sudden upheaval. Dramatic images, symbolic meanings." },
            { kind: "callout", tone: "tradition", title: "Three of the most-misread Majors", text: "The Devil isn't evil arriving — it's bondage you can choose to step out of (addiction, a toxic dynamic, a story you tell yourself). The Hanged Man isn't punishment — it's a deliberate pause and a change of perspective. The Moon isn't doom — it's uncertainty, illusion, and the murk you have to feel your way through." },
            { kind: "callout", tone: "history", title: "The numbering wasn't always fixed", text: "Early decks didn't number the trumps consistently, and Justice and Strength swapped positions (8 and 11) between older patterns and the Rider–Waite–Smith. So the exact order of the 'journey' is a useful teaching story laid over the modern numbering, not an ancient fixed scripture." },
            { kind: "keyfacts", items: [
              "22 Majors run from The Fool (0) to The World (21).",
              "The Fool is the traveler; the rest are lessons he meets.",
              "Death = transformation; the Tower = sudden upheaval.",
              "The 'journey' is a memory aid, not an ancient doctrine.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The 'Fool's Journey' is…", options: [
              { id: "a", text: "Reading the Major Arcana in order as a story of growth", correct: true, explanation: "Yes — 0 (Fool) to 21 (World)." },
              { id: "b", text: "A type of card game", correct: false, explanation: "It's a learning device, not a game." },
              { id: "c", text: "A spread for money questions", correct: false, explanation: "It's a way to understand the Majors, not a spread." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which card sits at the END of the Fool's Journey?", options: [
              { id: "a", text: "The World (21)", correct: true, explanation: "Correct — completion and fulfillment." },
              { id: "b", text: "The Fool (0)", correct: false, explanation: "The Fool begins the journey." },
              { id: "c", text: "The Tower (16)", correct: false, explanation: "The Tower is near the climb, not the end." },
            ] },
            { id: "q3", type: "mcq", prompt: "The Devil card is most fairly read as…", options: [
              { id: "a", text: "Bondage or a trap you can choose to step out of", correct: true, explanation: "Right — it points to chosen chains, not arriving evil." },
              { id: "b", text: "A literal demon", correct: false, explanation: "It's symbolic, about attachment and bondage." },
              { id: "c", text: "Guaranteed good luck", correct: false, explanation: "That's far from its meaning." },
            ] },
            { id: "q4", type: "true-false", prompt: "The Death card usually signals transformation rather than literal death.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it means an ending that enables renewal." },
              { id: "f", text: "False", correct: false, explanation: "It's symbolic — transformation, not literal death." },
            ] },
            { id: "q5", type: "true-false", prompt: "The Fool is numbered zero.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — zero, the open traveler who begins the arc." },
              { id: "f", text: "False", correct: false, explanation: "The Fool is card 0." },
            ] },
          ],
        },
        {
          id: "l5-suits-elements",
          title: "The four suits & the elements",
          objective: "Match each Minor Arcana suit to its element and theme.",
          estMinutes: 5,
          blocks: [
            { kind: "sort", prompt: "Match each theme to its suit", instructions: "Tap a theme, then tap the suit that carries it", groups: [
              { name: "Wands (Fire)", accent: "#c9881f", items: ["Passion", "Creativity", "Drive"] },
              { name: "Cups (Water)", accent: "#5b6bb5", items: ["Love", "Emotion", "Intuition"] },
              { name: "Swords (Air)", accent: "#B8A0D2", items: ["Intellect", "Conflict", "Truth"] },
              { name: "Pentacles (Earth)", accent: "#6a9a4a", items: ["Money", "Work", "Body"] },
            ] },
            { kind: "text", text: "Each of the four Minor suits maps to an element and a broad theme. This is the backbone of reading the Minors — learn these four pairings and you can make a reasonable read of any Minor card on sight." },
            { kind: "table", headers: ["Suit", "Element", "Theme"], rows: [
              ["Wands", "Fire", "Energy, passion, action, will"],
              ["Cups", "Water", "Emotion, relationships, intuition"],
              ["Swords", "Air", "Thought, truth, conflict, communication"],
              ["Pentacles", "Earth", "Money, work, body, the material world"],
            ] },
            { kind: "callout", tone: "tip", title: "A quick gut-read", text: "See a lot of Cups? It's an emotional matter. Lots of Pentacles? Think work or money. Swords? Mental conflict or decisions. Wands? Drive and creativity." },
            { kind: "callout", tone: "history", title: "Where the suits come from", text: "Tarot's four suits descend from early Italian playing cards: Wands began as Batons or staves, Cups as chalices, Swords as blades, and Pentacles as Coins. Today's French-suited deck (hearts, diamonds, clubs, spades) split off from the same family — which is why a tarot deck feels like a richer cousin of an ordinary playing-card pack." },
            { kind: "callout", tone: "evidence", title: "The elements aren't physics", text: "The fire/water/air/earth scheme is a symbolic system inherited from classical and medieval thought, not a description of matter. Its usefulness is purely as a memory and association framework — a tidy way to sort 'feeling' from 'thinking' from 'doing' from 'having.'" },
            { kind: "keyfacts", items: [
              "Wands = Fire = drive, passion, creativity, action.",
              "Cups = Water = emotion, love, relationships, intuition.",
              "Swords = Air = thought, truth, conflict, communication.",
              "Pentacles = Earth = money, work, body, the material world.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Cups correspond to which element and theme?", options: [
              { id: "a", text: "Water — emotion and relationships", correct: true, explanation: "Correct — Cups are the feeling suit." },
              { id: "b", text: "Fire — action and passion", correct: false, explanation: "That's Wands." },
              { id: "c", text: "Earth — money and work", correct: false, explanation: "That's Pentacles." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which suit deals with thought, truth, and conflict?", options: [
              { id: "a", text: "Swords (Air)", correct: true, explanation: "Yes — Swords are the mental/conflict suit." },
              { id: "b", text: "Pentacles (Earth)", correct: false, explanation: "Pentacles are material/work." },
              { id: "c", text: "Cups (Water)", correct: false, explanation: "Cups are emotional." },
            ] },
            { id: "q3", type: "mcq", prompt: "A spread full of Pentacles most likely concerns…", options: [
              { id: "a", text: "Work, money, or the material world", correct: true, explanation: "Correct — Pentacles = Earth/material." },
              { id: "b", text: "Romantic feelings", correct: false, explanation: "That's more Cups." },
              { id: "c", text: "Mental conflict", correct: false, explanation: "That's more Swords." },
            ] },
            { id: "q4", type: "mcq", prompt: "Wands are associated with which element?", options: [
              { id: "a", text: "Fire", correct: true, explanation: "Yes — Wands carry drive, passion, and action." },
              { id: "b", text: "Water", correct: false, explanation: "Water is Cups." },
              { id: "c", text: "Earth", correct: false, explanation: "Earth is Pentacles." },
            ] },
            { id: "q5", type: "true-false", prompt: "The four elements behind the suits are a literal scientific account of matter.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they're a symbolic association framework, not physics." },
              { id: "f", text: "False", correct: true, explanation: "Correct — the elements are a memory and meaning system." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the suit (and modern element) of the material/money suit: 'Pentacles, the suit of ___.'", options: [], answer: "earth", accept: ["earth element"], explanation: "Pentacles = Earth = money, work, the body, the material world." },
          ],
        },
        {
          id: "l6-minor-pips",
          title: "The Minor Arcana, Ace to Ten",
          objective: "Read the number cards as a progression from beginning to completion.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Within each suit, the numbered cards (the 'pips', Ace through Ten) tell a small progression — combine the number's stage with the suit's theme." },
            { kind: "table", headers: ["Number", "Stage"], rows: [
              ["Ace", "Seed / pure potential"],
              ["Two", "Choice or balance"],
              ["Three", "Growth, first results"],
              ["Four", "Stability, a pause"],
              ["Five", "Conflict, loss, challenge"],
              ["Six", "Recovery, harmony"],
              ["Seven", "Assessment, perseverance"],
              ["Eight", "Movement, mastery in progress"],
              ["Nine", "Near-completion, intensity"],
              ["Ten", "Completion, the full cycle (its highs or burdens)"],
            ] },
            { kind: "callout", tone: "tip", title: "Mix and match", text: "Example: the Ten of Cups = completion (10) + emotion (Cups) = emotional fulfillment and harmony. The Five of Swords = conflict (5) + mind (Swords) = a fight, often won at a cost." },
            { kind: "text", text: "Because the number supplies the 'stage' and the suit supplies the 'subject,' you can reconstruct any of the 40 pip cards from two facts you already know. Practice with a few: Three of Pentacles = early results (3) + work (Pentacles) = collaboration and skilled progress on a job. Nine of Swords = near-completion intensity (9) + mind (Swords) = anxiety, the 3 a.m. spiral." },
            { kind: "callout", tone: "tradition", title: "The fives are the low point — on purpose", text: "Across all four suits the Five is the friction card: the Five of Cups grieves, the Five of Swords fights dirty, the Five of Pentacles is left out in the cold, the Five of Wands squabbles. It's the midpoint stumble of the suit's story — and, helpfully, the place the cards most often point to something worth examining." },
            { kind: "keyfacts", items: [
              "Pip meaning = number's stage + suit's theme.",
              "Aces = beginnings; Tens = completion of the cycle.",
              "Fives are the friction/loss point in every suit.",
              "40 pip cards (Ace–Ten × four suits) are all reconstructable this way.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "An Ace generally represents…", options: [
              { id: "a", text: "A seed — pure potential and a beginning", correct: true, explanation: "Yes — Aces are the start of the suit's theme." },
              { id: "b", text: "Completion of a cycle", correct: false, explanation: "That's the Ten." },
              { id: "c", text: "Conflict and loss", correct: false, explanation: "That's more the Five." },
            ] },
            { id: "q2", type: "mcq", prompt: "How would you read the Ten of Cups?", options: [
              { id: "a", text: "Completion (10) + emotion (Cups) = emotional fulfillment", correct: true, explanation: "Exactly — combine number and suit." },
              { id: "b", text: "Conflict in money matters", correct: false, explanation: "That mixes the wrong number and suit." },
              { id: "c", text: "A new mental idea", correct: false, explanation: "That's closer to the Ace of Swords." },
            ] },
            { id: "q3", type: "mcq", prompt: "Fives across the suits tend to bring…", options: [
              { id: "a", text: "Conflict, loss, or challenge", correct: true, explanation: "Correct — Fives are the friction point." },
              { id: "b", text: "Pure harmony", correct: false, explanation: "That's more the Six or Ten." },
              { id: "c", text: "Nothing of note", correct: false, explanation: "Fives are notably challenging cards." },
            ] },
            { id: "q4", type: "mcq", prompt: "Reading the Three of Pentacles by 'number + suit' gives roughly…", options: [
              { id: "a", text: "Early results (3) in work/material matters (Pentacles)", correct: true, explanation: "Right — collaboration and skilled progress on a job." },
              { id: "b", text: "Emotional endings", correct: false, explanation: "That mixes in the wrong suit." },
              { id: "c", text: "A pure new beginning", correct: false, explanation: "That's the Ace, not the Three." },
            ] },
            { id: "q5", type: "true-false", prompt: "A pip card's meaning can be reconstructed by combining its number's stage with its suit's theme.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — that's the core technique for the 40 pips." },
              { id: "f", text: "False", correct: false, explanation: "Number + suit is exactly how to read the pips." },
            ] },
          ],
        },
        {
          id: "l7-pip-numerology",
          title: "The numerology of the pips",
          objective: "Use number patterns across the suits to read any pip card with more nuance.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "If the last lesson gave you 'number + suit,' this one sharpens the 'number' half. Each number carries a feeling that holds true no matter which suit it lands in — a rhythm running underneath all four suits at once." },
            { kind: "callout", tone: "tradition", title: "The shape of a suit's story", text: "Read down a single suit, Ace to Ten, and you get a tidy narrative: a spark (Ace), a choice (Two), first growth (Three), a stable plateau (Four), a crisis (Five), a recovery (Six), a test of faith (Seven), acceleration (Eight), the final push (Nine), and the full result (Ten). Every suit tells that same story in its own voice." },
            { kind: "table", headers: ["Number", "Core feeling", "Across the suits"], rows: [
              ["Ace", "Pure potential", "The gift or spark of the element"],
              ["Two", "Duality, choice", "Partnership, balance, a decision point"],
              ["Three", "First fruits", "Growth, creativity, early results"],
              ["Four", "Structure", "Stability, rest, sometimes stagnation"],
              ["Five", "Disruption", "Conflict, loss, the necessary stumble"],
              ["Six", "Equilibrium", "Recovery, harmony, giving and receiving"],
              ["Seven", "Reassessment", "Patience, illusion, lone effort"],
              ["Eight", "Momentum", "Movement, repetition, mastery building"],
              ["Nine", "Culmination", "Intensity, near-completion, the last stretch"],
              ["Ten", "Completion", "The full cycle, for better or for heavier"],
            ] },
            { kind: "callout", tone: "tip", title: "Read a row, not just a card", text: "If three of your cards are 'Fours' across different suits, the reading is whispering about structure and stasis everywhere at once — a stronger signal than any single Four. Repeated numbers in a spread are one of the easiest patterns to spot and one of the most telling." },
            { kind: "callout", tone: "evidence", title: "An aid, not arithmetic", text: "This numerology is a mnemonic scaffold — a consistent way to organize meanings so you're not memorizing 40 unrelated cards. It isn't a claim that numbers carry inherent cosmic force. Treat it as a reading aid that happens to be elegant, and you'll keep your framing honest." },
            { kind: "keyfacts", items: [
              "Each number has a 'core feeling' that holds across all four suits.",
              "Ace→Ten reads as one repeating story: spark to result.",
              "Repeated numbers in a spread amplify that number's theme.",
              "It's a memory scaffold, not a claim of mystical number-power.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Across every suit, the Two tends to carry the theme of…", options: [
              { id: "a", text: "Duality, partnership, or a choice", correct: true, explanation: "Yes — Twos are the decision/balance point." },
              { id: "b", text: "Final completion", correct: false, explanation: "That's the Ten." },
              { id: "c", text: "A pure beginning", correct: false, explanation: "That's the Ace." },
            ] },
            { id: "q2", type: "mcq", prompt: "What does the 'numerology' of the pips actually provide?", options: [
              { id: "a", text: "A consistent memory scaffold for reading the number cards", correct: true, explanation: "Right — it organizes meaning, honestly framed." },
              { id: "b", text: "Proof that numbers exert cosmic force", correct: false, explanation: "It makes no such claim." },
              { id: "c", text: "A way to predict lottery numbers", correct: false, explanation: "Nothing of the sort." },
            ] },
            { id: "q3", type: "mcq", prompt: "Seeing several 'Fives' across different suits in one spread suggests…", options: [
              { id: "a", text: "A repeated theme of disruption or challenge", correct: true, explanation: "Correct — repeated numbers amplify their shared theme." },
              { id: "b", text: "That the spread is invalid", correct: false, explanation: "Repeats are meaningful, not errors." },
              { id: "c", text: "Guaranteed good fortune", correct: false, explanation: "Fives lean toward friction, not luck." },
            ] },
            { id: "q4", type: "true-false", prompt: "Reading a single suit from Ace to Ten gives a 'spark to full result' story.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — each suit tells that arc in its own voice." },
              { id: "f", text: "False", correct: false, explanation: "The Ace→Ten arc is exactly that progression." },
            ] },
            { id: "q5", type: "true-false", prompt: "Pip numerology proves that numbers carry inherent magical power.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's a memory aid, not a claim of number-magic." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep it framed as an honest reading scaffold." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the number whose 'core feeling' across the suits is disruption, conflict, or the necessary stumble.", options: [], answer: "five", accept: ["5", "the five", "fives"], explanation: "Fives are the friction point in every suit — grief, fighting, exclusion, squabbling." },
          ],
        },
        {
          id: "l8-court-cards",
          title: "The court cards in depth",
          objective: "Recall the four court ranks and read them as people, energies, or stages.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Each suit has four court cards — Page, Knight, Queen, King — for sixteen in all. They're the cards beginners find hardest, because they can mean three different things at once: a person, an energy you're being asked to embody, or a stage of maturity in that suit's theme." },
            { kind: "table", headers: ["Court", "Maturity / role", "Often represents"], rows: [
              ["Page", "The student", "A beginner, a message, curiosity, potential"],
              ["Knight", "The doer", "Action, pursuit, energy taken to an extreme"],
              ["Queen", "Inner mastery", "Nurturing, embodying the suit from within"],
              ["King", "Outer mastery", "Authority, leadership, the suit expressed outward"],
            ] },
            { kind: "callout", tone: "tip", title: "Person or energy?", text: "A court card might be a literal person in your life, or it might be an energy you're being invited to embody. Let the surrounding cards and your question guide which." },
            { kind: "callout", tone: "tradition", title: "Court + suit = personality", text: "Blend the rank with the suit and a character appears. The Queen of Cups is emotionally wise and deeply caring; the Knight of Swords charges in with sharp ideas and zero patience; the King of Pentacles is the steady, prosperous provider; the Page of Wands is the eager spark of a new creative idea. Sixteen little personalities, all built from two facts." },
            { kind: "callout", tone: "history", title: "Why 'Page' and 'Knight'?", text: "The court ranks echo a medieval household: the page (a young attendant in training), the knight (the mounted man of action), and the king and queen at the head. Some decks rename them — Princess/Prince, or Daughter/Son/Mother/Father — but the four-step ladder of maturity is the same." },
            { kind: "callout", tone: "evidence", title: "Not literal fortune-telling about people", text: "A court card 'being' someone in your life is an interpretive choice, not a fact the card delivers. Held honestly, it's a prompt — 'who in my life is acting like this? am I?' — rather than a claim to identify a stranger or predict their behavior." },
            { kind: "keyfacts", items: [
              "16 court cards = 4 ranks × 4 suits.",
              "Pages = students/messages; Knights = action; Queens = inner mastery; Kings = outer mastery.",
              "A court can be a person, an energy to embody, or a stage of growth.",
              "Court + suit = a recognizable little personality.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A Page most often represents…", options: [
              { id: "a", text: "A beginner, a message, or budding potential", correct: true, explanation: "Yes — Pages are youthful and message-bearing." },
              { id: "b", text: "Established outward authority", correct: false, explanation: "That's the King." },
              { id: "c", text: "Completion of a cycle", correct: false, explanation: "Courts aren't about cycle completion; that's the Ten." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which court rank typically signals outward authority and leadership?", options: [
              { id: "a", text: "The King", correct: true, explanation: "Correct — mastery expressed outward." },
              { id: "b", text: "The Page", correct: false, explanation: "The Page is the beginner." },
              { id: "c", text: "The Knight", correct: false, explanation: "The Knight is action/pursuit." },
            ] },
            { id: "q3", type: "mcq", prompt: "The Knight is best summarized as…", options: [
              { id: "a", text: "The doer — action, pursuit, energy at full tilt", correct: true, explanation: "Right — Knights charge after the suit's theme." },
              { id: "b", text: "The quiet student", correct: false, explanation: "That's the Page." },
              { id: "c", text: "Inner, nurturing mastery", correct: false, explanation: "That's the Queen." },
            ] },
            { id: "q4", type: "mcq", prompt: "How would you read the Queen of Cups?", options: [
              { id: "a", text: "Inner mastery (Queen) + emotion (Cups) = emotionally wise and caring", correct: true, explanation: "Exactly — rank plus suit makes a personality." },
              { id: "b", text: "Aggressive money-making", correct: false, explanation: "That mixes the wrong rank and suit." },
              { id: "c", text: "A brand-new mental idea", correct: false, explanation: "That's closer to the Page of Swords." },
            ] },
            { id: "q5", type: "true-false", prompt: "A court card can represent an energy within you rather than another person.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it may be a person or a facet of yourself." },
              { id: "f", text: "False", correct: false, explanation: "It can absolutely represent your own energy." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the court rank that represents a beginner, a student, or an incoming message.", options: [], answer: "page", accept: ["the page", "pages", "princess"], explanation: "Pages are the youthful students of their suit — curiosity, potential, and news." },
          ],
        },
        {
          id: "l9-reversals",
          title: "Reversals",
          objective: "Explain what a reversed card means and that using reversals is optional.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "When a card comes out upside-down, that's a 'reversal.' Reversed cards are usually read as a blocked, weakened, internalized, or shadow version of the upright meaning." },
            { kind: "text", text: "There's no single rule everyone follows. Common ways to read a reversal include: the upright energy is blocked or delayed; it's turned inward rather than expressed outward; it's present but in excess or deficiency; or it's an invitation to look at the card's shadow side. Pick one approach and stay consistent, at least within a reading." },
            { kind: "table", headers: ["Reversal style", "How you'd read it"], rows: [
              ["Blocked / delayed", "The upright meaning is stuck or not yet flowing"],
              ["Internalized", "The energy is private, inward, not yet acted on"],
              ["Excess / deficiency", "Too much or too little of the upright quality"],
              ["Shadow side", "The card's harder or hidden face is showing"],
            ] },
            { kind: "callout", tone: "tradition", title: "Optional, not mandatory", text: "Plenty of skilled readers don't use reversals at all — they read every card upright and let nuance come from position and surrounding cards. It's a personal choice; pick the approach that helps you reflect." },
            { kind: "callout", tone: "tip", title: "A gentler default for beginners", text: "If reversals overwhelm you, read all cards upright at first and treat an upside-down card simply as a nudge toward the 'quieter' or 'less resolved' end of that card's meaning. You can add fuller reversal systems later, once the 78 uprights feel familiar." },
            { kind: "keyfacts", items: [
              "A reversal = a card drawn upside-down.",
              "Common readings: blocked, internalized, excessive/deficient, or shadow.",
              "Using reversals at all is entirely optional.",
              "Consistency within a reading matters more than which system you pick.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A reversed card is usually read as…", options: [
              { id: "a", text: "A blocked, internalized, or shadow form of the upright meaning", correct: true, explanation: "Yes — that's the common approach." },
              { id: "b", text: "A printing error", correct: false, explanation: "It's an intentional reading nuance." },
              { id: "c", text: "Always the literal opposite, with no nuance", correct: false, explanation: "It's more nuanced than a strict opposite." },
            ] },
            { id: "q2", type: "mcq", prompt: "Besides reversals, nuance in a reading also comes from…", options: [
              { id: "a", text: "A card's position and the surrounding cards", correct: true, explanation: "Right — context shapes meaning." },
              { id: "b", text: "The card's price", correct: false, explanation: "Irrelevant to meaning." },
              { id: "c", text: "The time of day only", correct: false, explanation: "Position and context matter, not the clock." },
            ] },
            { id: "q3", type: "mcq", prompt: "A reasonable beginner-friendly approach to reversals is to…", options: [
              { id: "a", text: "Read every card upright at first, adding reversals later", correct: true, explanation: "Yes — master the 78 uprights, then layer nuance in." },
              { id: "b", text: "Reshuffle until nothing is reversed", correct: false, explanation: "Unnecessary — reversals are optional, not a problem to fix." },
              { id: "c", text: "Discard any reversed card", correct: false, explanation: "You never discard drawn cards." },
            ] },
            { id: "q4", type: "true-false", prompt: "Every reader must use reversals.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — using reversals is optional." },
              { id: "f", text: "False", correct: true, explanation: "Correct — many readers read all cards upright." },
            ] },
            { id: "q5", type: "true-false", prompt: "There is exactly one correct, universal way to interpret a reversed card.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — blocked, internalized, excess, and shadow are all valid styles." },
              { id: "f", text: "False", correct: true, explanation: "Correct — pick a style and stay consistent." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Reading",
      lessons: [
        {
          id: "l10-spreads",
          title: "Spreads: three-card & the Celtic Cross",
          objective: "Name common spreads and what each position contributes.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "A 'spread' is a layout where each position has a fixed meaning before any card lands in it. The spread is the grammar of a reading; the cards are the words. Start simple and add positions only as you grow comfortable." },
            { kind: "list", items: [
              "**One card** — a focus, a theme for the day, or a direct prompt to reflect on.",
              "**Three cards** — a flexible classic: past / present / future, or situation / action / outcome, or mind / body / spirit.",
              "**Celtic Cross** — a ten-card spread covering the heart of the matter, challenges, past, future, hopes, and outcome. Powerful, but best once you know the cards.",
            ] },
            { kind: "callout", tone: "tip", title: "Position gives meaning", text: "The same card reads differently by position. The Tower in a 'challenge' spot reads differently than in an 'outcome' spot. Always read the card through the lens of the slot it landed in." },
            { kind: "text", text: "The classic ten-position Celtic Cross is the most-taught large spread. You don't need to memorize it today — just recognize that each slot frames the next card you turn over." },
            { kind: "table", headers: ["#", "Position", "What it frames"], rows: [
              ["1", "The heart of the matter", "The core of the situation"],
              ["2", "The crossing", "The immediate challenge or tension"],
              ["3", "The foundation", "Roots / the recent past beneath it"],
              ["4", "The crown", "Goals, ideals, what's consciously hoped for"],
              ["5", "The past", "What's passing out of the situation"],
              ["6", "The near future", "What's approaching next"],
              ["7–10", "Self, environment, hopes/fears, outcome", "The reader, outside forces, inner pulls, and where it tends"],
            ] },
            { kind: "callout", tone: "tradition", title: "Design your own", text: "Spreads aren't sacred templates — readers invent them all the time. A 'decision' spread might be option A / option B / what you're not seeing. The only rule is to name each position's meaning before you deal, so the cards have a frame to speak through." },
            { kind: "keyfacts", items: [
              "A spread assigns a fixed meaning to each position before dealing.",
              "Three-card spreads are the flexible workhorse (past/present/future, etc.).",
              "The Celtic Cross is a 10-card spread for deeper questions.",
              "You can design your own spread — just define the positions first.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A common three-card spread is…", options: [
              { id: "a", text: "Past / present / future", correct: true, explanation: "Yes — one of the classic three-card layouts." },
              { id: "b", text: "A 78-card layout", correct: false, explanation: "That's the whole deck, not a three-card spread." },
              { id: "c", text: "A single position only", correct: false, explanation: "That's a one-card draw." },
            ] },
            { id: "q2", type: "mcq", prompt: "The Celtic Cross uses how many cards?", options: [
              { id: "a", text: "Ten", correct: true, explanation: "Correct — it's a ten-card spread." },
              { id: "b", text: "Three", correct: false, explanation: "Three is the small classic spread." },
              { id: "c", text: "Twenty-two", correct: false, explanation: "That's the count of the Major Arcana, not the spread." },
            ] },
            { id: "q3", type: "mcq", prompt: "What must you do when designing your own spread?", options: [
              { id: "a", text: "Define each position's meaning before dealing", correct: true, explanation: "Right — the frame must exist before the cards land." },
              { id: "b", text: "Use only Major Arcana", correct: false, explanation: "No such requirement." },
              { id: "c", text: "Always use exactly ten cards", correct: false, explanation: "Any number works if positions are defined." },
            ] },
            { id: "q4", type: "true-false", prompt: "A card's meaning can shift depending on its position in the spread.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — position is part of the meaning." },
              { id: "f", text: "False", correct: false, explanation: "Position genuinely changes the reading." },
            ] },
            { id: "q5", type: "true-false", prompt: "Spreads are fixed, sacred templates that readers may never modify.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — readers design custom spreads all the time." },
              { id: "f", text: "False", correct: true, explanation: "Correct — just name each position's meaning first." },
            ] },
          ],
        },
        {
          id: "l11-narrative",
          title: "Reading as narrative",
          objective: "Weave several cards into a single coherent story rather than reading them in isolation.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "A beginner reads each card as a separate fortune-cookie line. A skilled reader reads the cards as a story — letting them talk to each other so a single narrative emerges. This is where tarot's reflective power really lives." },
            { kind: "callout", tone: "tradition", title: "The cards are sentences, not headlines", text: "Imagine three cards as the beginning, middle, and end of a paragraph. The first sets the scene, the second introduces a turn, the third resolves it. Your job isn't to decode three separate omens — it's to tell the one story that connects them." },
            { kind: "list", ordered: true, items: [
              "**Take in the whole spread first.** Before naming any single card, notice the overall mood, the dominant suit, and any repeated numbers or recurring images.",
              "**Find the through-line.** Ask what question or tension links the cards. Often one card is clearly the 'subject' and the others comment on it.",
              "**Read in sequence.** Let each card pick up where the last left off, like clauses in a sentence: 'because of this… which leads to… and so…'.",
              "**Connect it back to you.** Translate the finished story into a reflective question about your actual situation.",
            ] },
            { kind: "callout", tone: "tip", title: "Let images literally point", text: "Notice where the figures look and which way they face. A character gazing back toward an earlier card is dwelling on the past; one turned toward the next card is moving forward. Smith's illustrations are full of these little directional cues you can read like body language." },
            { kind: "callout", tone: "evidence", title: "Why narrative helps you, honestly", text: "Building a story out of the cards is an act of meaning-making by you, the reader — that's the feature, not a flaw. Coherent narratives are how humans understand their own lives, so weaving the cards into one can genuinely clarify thinking, even with no claim that the cards 'know' anything." },
            { kind: "keyfacts", items: [
              "Read the whole spread as one story, not separate omens.",
              "Find the through-line that links the cards before decoding details.",
              "Directional cues (where figures face) connect card to card.",
              "The meaning-making is yours — that's exactly why it clarifies thinking.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Reading 'as narrative' means…", options: [
              { id: "a", text: "Weaving the cards into one connected story", correct: true, explanation: "Yes — the cards comment on each other like sentences." },
              { id: "b", text: "Reading each card as an isolated, separate fortune", correct: false, explanation: "That's the beginner habit narrative reading moves past." },
              { id: "c", text: "Reading only the Major Arcana", correct: false, explanation: "Narrative reading uses the whole spread." },
            ] },
            { id: "q2", type: "mcq", prompt: "A good first step before decoding individual cards is to…", options: [
              { id: "a", text: "Take in the whole spread's mood, dominant suit, and repeats", correct: true, explanation: "Right — the overall pattern frames the details." },
              { id: "b", text: "Immediately announce a prediction", correct: false, explanation: "That skips the reflective work entirely." },
              { id: "c", text: "Remove the cards you dislike", correct: false, explanation: "You never cherry-pick the drawn cards." },
            ] },
            { id: "q3", type: "mcq", prompt: "Why does building the cards into a story genuinely help, honestly framed?", options: [
              { id: "a", text: "Humans understand their lives through narrative, so it clarifies your own thinking", correct: true, explanation: "Correct — the meaning-making is yours and useful." },
              { id: "b", text: "Because the cards secretly know the future", correct: false, explanation: "No such claim — the value is reflective." },
              { id: "c", text: "Because stories are required by the rules of the game", correct: false, explanation: "There's no such rule; it's a reading skill." },
            ] },
            { id: "q4", type: "true-false", prompt: "The direction a figure faces can be used to connect one card to another in a spread.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — directional cues read like body language." },
              { id: "f", text: "False", correct: false, explanation: "Where figures look is a real, useful cue." },
            ] },
            { id: "q5", type: "true-false", prompt: "Narrative reading claims the cards themselves possess knowledge of events.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the story is the reader's meaning-making." },
              { id: "f", text: "False", correct: true, explanation: "Correct — the clarity comes from you, not the cards." },
            ] },
          ],
        },
        {
          id: "l12-ethics",
          title: "Reading ethically",
          objective: "Apply an ethical, reflective stance to a reading.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "How you frame a reading matters, and it matters even more when you read for someone else. The healthiest stance treats the cards as a prompt for reflection and keeps the querent's agency front and center at all times." },
            { kind: "callout", tone: "safety", title: "Lines a responsible reader doesn't cross", text: "Don't diagnose illness, predict death, or give legal or financial directives. If someone is in crisis, point them to real support, not a card. Tarot is for reflection — never a substitute for medical, legal, mental-health, or financial advice." },
            { kind: "callout", tone: "tip", title: "Frame for agency", text: "Instead of 'will X happen to me,' try 'what can I bring to X?' Open questions turn the cards into a mirror for choices you can actually make." },
            { kind: "callout", tone: "safety", title: "Reading for other people", text: "When you read for someone, you hold real influence over how they feel. Don't read for a third party who isn't present ('what is my ex really thinking?'), don't deliver doom, and get consent before reading on sensitive topics. Offer interpretations as 'one way to see this,' not as verdicts about their life." },
            { kind: "callout", tone: "culture", title: "Respect, not appropriation", text: "Tarot draws on many traditions and is read in many cultures. Be honest about what you do and don't know, avoid dressing reflection up as ancient secret wisdom you can't source, and don't claim authority or lineage you haven't actually earned." },
            { kind: "list", items: [
              "**Consent first** — ask before reading for or about someone.",
              "**Agency always** — frame outcomes as choices, never as fixed fate.",
              "**Stay in your lane** — refer out for medical, legal, financial, or mental-health concerns.",
              "**No fear-selling** — never use a scary card to create dependence or upsell more readings.",
            ] },
            { kind: "keyfacts", items: [
              "Center the querent's agency; frame outcomes as choices.",
              "Never diagnose illness, predict death, or give legal/financial directives.",
              "Get consent; don't read on absent third parties or deliver doom.",
              "Refer people in crisis to real, professional support.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A responsible reader avoids…", options: [
              { id: "a", text: "Diagnosing illness or predicting death", correct: true, explanation: "Correct — those cross ethical lines." },
              { id: "b", text: "Asking open, reflective questions", correct: false, explanation: "Open questions are encouraged." },
              { id: "c", text: "Considering card positions", correct: false, explanation: "That's normal, healthy practice." },
            ] },
            { id: "q2", type: "mcq", prompt: "A healthier way to frame a question is…", options: [
              { id: "a", text: "'What can I bring to this?' rather than 'what will happen to me?'", correct: true, explanation: "Yes — it centers your agency." },
              { id: "b", text: "'Tell me my exact future'", correct: false, explanation: "That treats tarot as prediction, which it isn't." },
              { id: "c", text: "'Which medication should I take?'", correct: false, explanation: "Never — that's medical advice tarot can't give." },
            ] },
            { id: "q3", type: "mcq", prompt: "When reading for another person, an ethical reader…", options: [
              { id: "a", text: "Gets consent and offers interpretations as 'one way to see this'", correct: true, explanation: "Right — consent and humility, not verdicts." },
              { id: "b", text: "Reads secretly on absent third parties", correct: false, explanation: "Avoid reading on people who aren't present." },
              { id: "c", text: "Uses scary cards to sell more readings", correct: false, explanation: "Fear-selling is exactly what to avoid." },
            ] },
            { id: "q4", type: "true-false", prompt: "Tarot is an appropriate substitute for professional medical or legal advice.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's for reflection, never a substitute for professional advice." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep tarot to reflection." },
            ] },
            { id: "q5", type: "true-false", prompt: "It's fine to read about an absent third party and tell the querent what that person 'really' thinks.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — avoid reading on absent people; respect their privacy and your limits." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep readings consenting and agency-centered." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the one word for the permission you should get before reading for or about someone.", options: [], answer: "consent", accept: ["permission"], explanation: "Get consent first — never read for or about someone without it." },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "Tarot is best understood as…", options: [
      { id: "a", text: "A projective tool for reflection", correct: true },
      { id: "b", text: "A proven way to predict the future", correct: false },
      { id: "c", text: "A medical system", correct: false },
      { id: "d", text: "A branch of astronomy", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "A full tarot deck has how many cards?", options: [
      { id: "a", text: "78", correct: true },
      { id: "b", text: "52", correct: false },
      { id: "c", text: "22", correct: false },
      { id: "d", text: "100", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "Tarot originally began as…", options: [
      { id: "a", text: "A 15th-century Italian card game", correct: true },
      { id: "b", text: "An ancient Egyptian text", correct: false },
      { id: "c", text: "A medieval medical tool", correct: false },
      { id: "d", text: "A 20th-century invention", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "How many Major Arcana are there?", options: [
      { id: "a", text: "22", correct: true },
      { id: "b", text: "56", correct: false },
      { id: "c", text: "14", correct: false },
      { id: "d", text: "4", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "The Minor Arcana consist of…", options: [
      { id: "a", text: "Four suits of 14 cards each", correct: true },
      { id: "b", text: "Two suits of 28", correct: false },
      { id: "c", text: "One suit of 56", correct: false },
      { id: "d", text: "Twenty-two archetypes", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Cups correspond to…", options: [
      { id: "a", text: "Water — emotion and relationships", correct: true },
      { id: "b", text: "Fire — action", correct: false },
      { id: "c", text: "Earth — money", correct: false },
      { id: "d", text: "Air — thought", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "Swords correspond to…", options: [
      { id: "a", text: "Air — thought, truth, conflict", correct: true },
      { id: "b", text: "Water — emotion", correct: false },
      { id: "c", text: "Earth — the body", correct: false },
      { id: "d", text: "Fire — passion", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "Wands correspond to…", options: [
      { id: "a", text: "Fire — drive, passion, action", correct: true },
      { id: "b", text: "Water — emotion", correct: false },
      { id: "c", text: "Earth — money", correct: false },
      { id: "d", text: "Air — conflict", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "The Death card most often means…", options: [
      { id: "a", text: "Transformation and endings, not literal death", correct: true },
      { id: "b", text: "Someone will die", correct: false },
      { id: "c", text: "Nothing at all", correct: false },
      { id: "d", text: "Financial gain", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "The Devil card is best read as…", options: [
      { id: "a", text: "Bondage or a trap you can choose to step out of", correct: true },
      { id: "b", text: "A literal demon arriving", correct: false },
      { id: "c", text: "Guaranteed wealth", correct: false },
      { id: "d", text: "A printing error", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "An Ace in a suit represents…", options: [
      { id: "a", text: "A seed / pure potential", correct: true },
      { id: "b", text: "Completion", correct: false },
      { id: "c", text: "Conflict", correct: false },
      { id: "d", text: "Authority", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "Across the suits, the Fives tend to bring…", options: [
      { id: "a", text: "Conflict, loss, or challenge", correct: true },
      { id: "b", text: "Pure harmony", correct: false },
      { id: "c", text: "A fresh beginning", correct: false },
      { id: "d", text: "Final completion", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "How do you read a pip card like the Ten of Cups?", options: [
      { id: "a", text: "Combine the number's stage (completion) with the suit's theme (emotion)", correct: true },
      { id: "b", text: "Look up an unrelated random meaning", correct: false },
      { id: "c", text: "Treat every Ten as identical regardless of suit", correct: false },
      { id: "d", text: "Ignore the number entirely", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "Pip numerology (number themes across suits) is best described as…", options: [
      { id: "a", text: "A memory scaffold for reading the number cards", correct: true },
      { id: "b", text: "Proof that numbers carry cosmic power", correct: false },
      { id: "c", text: "A way to predict lottery results", correct: false },
      { id: "d", text: "An ancient Egyptian invention", correct: false },
    ] },
    { id: "f15", type: "mcq", prompt: "How many court cards are in a full deck?", options: [
      { id: "a", text: "16", correct: true },
      { id: "b", text: "4", correct: false },
      { id: "c", text: "22", correct: false },
      { id: "d", text: "40", correct: false },
    ] },
    { id: "f16", type: "mcq", prompt: "A Page most often represents…", options: [
      { id: "a", text: "A beginner, a message, or budding potential", correct: true },
      { id: "b", text: "Outward authority", correct: false },
      { id: "c", text: "Completion of a cycle", correct: false },
      { id: "d", text: "A reversed card", correct: false },
    ] },
    { id: "f17", type: "mcq", prompt: "Which court card signals outward authority?", options: [
      { id: "a", text: "The King", correct: true },
      { id: "b", text: "The Page", correct: false },
      { id: "c", text: "The Knight", correct: false },
      { id: "d", text: "The Ace", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "A reversed card usually reads as…", options: [
      { id: "a", text: "A blocked or internalized form of the upright meaning", correct: true },
      { id: "b", text: "A printing defect", correct: false },
      { id: "c", text: "Always the exact opposite", correct: false },
      { id: "d", text: "Meaningless", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "The Celtic Cross spread uses…", options: [
      { id: "a", text: "Ten cards", correct: true },
      { id: "b", text: "Three cards", correct: false },
      { id: "c", text: "One card", correct: false },
      { id: "d", text: "Seventy-eight cards", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "Reading 'as narrative' means…", options: [
      { id: "a", text: "Weaving the cards into one connected story", correct: true },
      { id: "b", text: "Reading each card as an isolated fortune", correct: false },
      { id: "c", text: "Using only the Major Arcana", correct: false },
      { id: "d", text: "Predicting exact dates", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "The Rider–Waite–Smith deck dates from…", options: [
      { id: "a", text: "1909", correct: true },
      { id: "b", text: "Ancient Egypt", correct: false },
      { id: "c", text: "1450", correct: false },
      { id: "d", text: "1990", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "Pamela Colman Smith's key contribution to the 1909 deck was…", options: [
      { id: "a", text: "A unique illustrated scene on every Minor Arcana card", correct: true },
      { id: "b", text: "Adding a fifth suit", correct: false },
      { id: "c", text: "Inventing the card game", correct: false },
      { id: "d", text: "Linking tarot to Egypt", correct: false },
    ] },
    { id: "f23", type: "mcq", prompt: "A responsible reader will NOT…", options: [
      { id: "a", text: "Diagnose illness or predict death", correct: true },
      { id: "b", text: "Ask open, reflective questions", correct: false },
      { id: "c", text: "Consider card positions", correct: false },
      { id: "d", text: "Encourage the querent's agency", correct: false },
    ] },
    { id: "f24", type: "mcq", prompt: "Before reading for or about another person, you should…", options: [
      { id: "a", text: "Get their consent", correct: true },
      { id: "b", text: "Deliver the scariest interpretation", correct: false },
      { id: "c", text: "Read secretly without telling them", correct: false },
      { id: "d", text: "Promise an exact prediction", correct: false },
    ] },
    { id: "f25", type: "true-false", prompt: "Using reversals is mandatory for all readers.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f26", type: "true-false", prompt: "A card's position in a spread can change its meaning.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f27", type: "true-false", prompt: "Tarot has a scientifically demonstrated ability to predict future events.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f28", type: "true-false", prompt: "The Fool is numbered zero in the Major Arcana.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
