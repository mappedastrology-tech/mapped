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
  estMinutes: 40,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "What Tarot Is", lessons: ["A reflective tool, not fortune-telling", "The real history of tarot", "Structure: Major & Minor Arcana"] },
    { module: "The Cards", lessons: ["The Major Arcana & the Fool's Journey", "The four suits & the elements", "The Minor Arcana, Ace to Ten", "The court cards", "Reversals"] },
    { module: "Reading", lessons: ["Spreads, from one card to the Celtic Cross", "Reading ethically"] },
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
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Tarot is a deck of 78 symbolic images used as a tool for reflection and storytelling. A reading lays out cards whose pictures act as prompts — mirrors that help you think through a situation from new angles." },
            { kind: "callout", tone: "evidence", title: "What the evidence says", text: "Tarot has no demonstrated power to predict the future. It works as a 'projective' tool: the open-ended images invite you to project your own thoughts and feelings onto them, which is genuinely useful for reflection. The 'Forer effect' — vague statements feeling personally true — explains much of why readings can feel uncannily accurate." },
            { kind: "callout", tone: "tradition", title: "Why it still has value", text: "Used as structured self-inquiry, tarot can surface what you already half-know, spark insight, and help you sit with a question. That's the honest, powerful version — no claim of fortune-telling required." },
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
            { id: "q3", type: "true-false", prompt: "A tarot deck contains 78 cards.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — 22 Major + 56 Minor Arcana." },
              { id: "f", text: "False", correct: false, explanation: "It is 78 cards total." },
            ] },
          ],
        },
        {
          id: "l2-history",
          title: "The real history of tarot",
          objective: "Place tarot's origins correctly and debunk the 'ancient Egypt' myth.",
          estMinutes: 4,
          blocks: [
            { kind: "callout", tone: "history", title: "Where it actually began", text: "Tarot began as a card GAME in mid-15th-century northern Italy (called 'tarocchi'). For centuries it was played like any other card game, not used for divination." },
            { kind: "text", text: "Divinatory use only appears in the late 1700s, popularized by figures like Antoine Court de Gébelin and the cartomancer 'Etteilla.' The famous deck most people picture — the Rider–Waite–Smith — was published in 1909, illustrated by Pamela Colman Smith and conceived by A. E. Waite." },
            { kind: "callout", tone: "history", title: "Busting the Egyptian myth", text: "The popular claim that tarot is an ancient Egyptian 'Book of Thoth' is a myth, invented in the 18th century. There's no evidence linking tarot to ancient Egypt." },
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
            { id: "q3", type: "true-false", prompt: "Tarot was used for divination from its very beginning.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — divination use only began in the late 1700s." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it was a card game first for centuries." },
            ] },
          ],
        },
        {
          id: "l3-structure",
          title: "Structure: Major & Minor Arcana",
          objective: "Describe how the 78 cards are divided.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The deck splits into two parts, called 'arcana' (meaning 'secrets')." },
            { kind: "table", headers: ["Part", "Cards", "Covers"], rows: [
              ["Major Arcana", "22", "Big life themes & archetypes (The Fool → The World)"],
              ["Minor Arcana", "56", "Everyday matters, in four suits"],
            ] },
            { kind: "text", text: "The 56 Minor Arcana break into four suits of 14 cards each (Ace through Ten, plus four court cards). The Major Arcana are the 'headline' cards — when several appear, the reading is about something significant." },
            { kind: "keyfacts", items: [
              "78 cards total = 22 Major + 56 Minor.",
              "Minor Arcana = 4 suits × 14 cards.",
              "Major Arcana = archetypal life themes.",
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
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "A classic way to learn the 22 Major Arcana is the 'Fool's Journey': read them in order as the story of The Fool (card 0) traveling through life's lessons to The World (card 21)." },
            { kind: "list", ordered: true, items: [
              "**The start (0–7):** The Fool sets out and meets foundational figures — the Magician, High Priestess, Empress, Emperor, Hierophant, Lovers, Chariot.",
              "**The middle (8–14):** inner lessons — Strength, the Hermit, the Wheel, Justice, the Hanged Man, Death, Temperance.",
              "**The climb (15–21):** big forces and resolution — the Devil, the Tower, the Star, the Moon, the Sun, Judgement, the World.",
            ] },
            { kind: "flip", prompt: "Turn each card to meet it", instructions: "Tap each card to turn it face-up", cards: [
              { img: "/images/tarot/major-0.webp", name: "0 · The Fool", caption: "New beginnings, a leap of faith, innocence" },
              { img: "/images/tarot/major-1.webp", name: "I · The Magician", caption: "Will, skill, manifestation" },
              { img: "/images/tarot/major-2.webp", name: "II · The High Priestess", caption: "Intuition, mystery, the unconscious" },
              { img: "/images/tarot/major-6.webp", name: "VI · The Lovers", caption: "Union, choice, alignment of values" },
              { img: "/images/tarot/major-17.webp", name: "XVII · The Star", caption: "Hope, renewal, serene faith" },
              { img: "/images/tarot/major-13.webp", name: "XIII · Death", caption: "Transformation — an ending that makes room" },
            ] },
            { kind: "callout", tone: "tip", title: "Death rarely means death", text: "The Death card almost always means transformation — an ending that makes room for something new — not literal death. The Tower means sudden upheaval. Dramatic images, symbolic meanings." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The 'Fool's Journey' is…", options: [
              { id: "a", text: "Reading the Major Arcana in order as a story of growth", correct: true, explanation: "Yes — 0 (Fool) to 21 (World)." },
              { id: "b", text: "A type of card game", correct: false, explanation: "It's a learning device, not a game." },
              { id: "c", text: "A spread for money questions", correct: false, explanation: "It's a way to understand the Majors, not a spread." },
            ] },
            { id: "q2", type: "true-false", prompt: "The Death card usually signals transformation rather than literal death.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it means an ending that enables renewal." },
              { id: "f", text: "False", correct: false, explanation: "It's symbolic — transformation, not literal death." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which card sits at the END of the Fool's Journey?", options: [
              { id: "a", text: "The World (21)", correct: true, explanation: "Correct — completion and fulfillment." },
              { id: "b", text: "The Fool (0)", correct: false, explanation: "The Fool begins the journey." },
              { id: "c", text: "The Tower (16)", correct: false, explanation: "The Tower is near the climb, not the end." },
            ] },
          ],
        },
        {
          id: "l5-suits-elements",
          title: "The four suits & the elements",
          objective: "Match each Minor Arcana suit to its element and theme.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Each of the four Minor suits maps to an element and a broad theme. This is the backbone of reading the Minors." },
            { kind: "table", headers: ["Suit", "Element", "Theme"], rows: [
              ["Wands", "Fire", "Energy, passion, action, will"],
              ["Cups", "Water", "Emotion, relationships, intuition"],
              ["Swords", "Air", "Thought, truth, conflict, communication"],
              ["Pentacles", "Earth", "Money, work, body, the material world"],
            ] },
            { kind: "callout", tone: "tip", title: "A quick gut-read", text: "See a lot of Cups? It's an emotional matter. Lots of Pentacles? Think work or money. Swords? Mental conflict or decisions. Wands? Drive and creativity." },
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
          ],
        },
        {
          id: "l6-minor-pips",
          title: "The Minor Arcana, Ace to Ten",
          objective: "Read the number cards as a progression from beginning to completion.",
          estMinutes: 4,
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
          ],
        },
        {
          id: "l7-court-cards",
          title: "The court cards",
          objective: "Recall the four court ranks and what they typically represent.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Each suit has four court cards. They often represent people, or facets of yourself, at different levels of maturity in that suit's theme." },
            { kind: "table", headers: ["Court", "Often represents"], rows: [
              ["Page", "A beginner, a message, curiosity, potential"],
              ["Knight", "Action, pursuit, energy taken to an extreme"],
              ["Queen", "Mastery from within — nurturing, embodying the suit"],
              ["King", "Mastery expressed outward — authority, leadership"],
            ] },
            { kind: "callout", tone: "tip", title: "Person or energy?", text: "A court card might be a literal person in your life, or it might be an energy you're being invited to embody. Let the surrounding cards and your question guide which." },
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
            { id: "q3", type: "true-false", prompt: "A court card can represent an energy within you rather than another person.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it may be a person or a facet of yourself." },
              { id: "f", text: "False", correct: false, explanation: "It can absolutely represent your own energy." },
            ] },
          ],
        },
        {
          id: "l8-reversals",
          title: "Reversals",
          objective: "Explain what a reversed card means and that using reversals is optional.",
          estMinutes: 3,
          blocks: [
            { kind: "text", text: "When a card comes out upside-down, that's a 'reversal.' Reversed cards are usually read as a blocked, weakened, internalized, or shadow version of the upright meaning." },
            { kind: "callout", tone: "tradition", title: "Optional, not mandatory", text: "Plenty of skilled readers don't use reversals at all — they read every card upright and let nuance come from position and surrounding cards. It's a personal choice; pick the approach that helps you reflect." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A reversed card is usually read as…", options: [
              { id: "a", text: "A blocked, internalized, or shadow form of the upright meaning", correct: true, explanation: "Yes — that's the common approach." },
              { id: "b", text: "A printing error", correct: false, explanation: "It's an intentional reading nuance." },
              { id: "c", text: "Always the literal opposite, with no nuance", correct: false, explanation: "It's more nuanced than a strict opposite." },
            ] },
            { id: "q2", type: "true-false", prompt: "Every reader must use reversals.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — using reversals is optional." },
              { id: "f", text: "False", correct: true, explanation: "Correct — many readers read all cards upright." },
            ] },
            { id: "q3", type: "mcq", prompt: "Besides reversals, nuance in a reading also comes from…", options: [
              { id: "a", text: "A card's position and the surrounding cards", correct: true, explanation: "Right — context shapes meaning." },
              { id: "b", text: "The card's price", correct: false, explanation: "Irrelevant to meaning." },
              { id: "c", text: "The time of day only", correct: false, explanation: "Position and context matter, not the clock." },
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
          id: "l9-spreads",
          title: "Spreads, from one card to the Celtic Cross",
          objective: "Name common spreads and what each position contributes.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "A 'spread' is a layout where each position has a meaning. Start simple:" },
            { kind: "list", items: [
              "**One card** — a focus, a theme for the day, or a direct answer to reflect on.",
              "**Three cards** — a flexible classic: past / present / future, or situation / action / outcome, or mind / body / spirit.",
              "**Celtic Cross** — a ten-card spread covering the heart of the matter, challenges, past, future, hopes, and outcome. Powerful but best once you know the cards.",
            ] },
            { kind: "callout", tone: "tip", title: "Position gives meaning", text: "The same card reads differently by position. The Tower in a 'challenge' spot reads differently than in an 'outcome' spot. The spread is the grammar; the cards are the words." },
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
            { id: "q3", type: "true-false", prompt: "A card's meaning can shift depending on its position in the spread.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — position is part of the meaning." },
              { id: "f", text: "False", correct: false, explanation: "Position genuinely changes the reading." },
            ] },
          ],
        },
        {
          id: "l10-ethics",
          title: "Reading ethically",
          objective: "Apply an ethical, reflective stance to a reading.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "How you frame a reading matters. The healthiest stance treats the cards as a prompt for reflection and keeps the querent's agency front and center." },
            { kind: "callout", tone: "safety", title: "Lines a responsible reader doesn't cross", text: "Don't diagnose illness, predict death, or give legal or financial directives. If someone is in crisis, point them to real support, not a card. Tarot is for reflection — never a substitute for medical, legal, mental-health, or financial advice." },
            { kind: "callout", tone: "tip", title: "Frame for agency", text: "Instead of 'will X happen to me,' try 'what can I bring to X?' Open questions turn the cards into a mirror for choices you can actually make." },
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
            { id: "q3", type: "true-false", prompt: "Tarot is an appropriate substitute for professional medical or legal advice.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's for reflection, never a substitute for professional advice." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep tarot to reflection." },
            ] },
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
    { id: "f8", type: "mcq", prompt: "The Death card most often means…", options: [
      { id: "a", text: "Transformation and endings, not literal death", correct: true },
      { id: "b", text: "Someone will die", correct: false },
      { id: "c", text: "Nothing at all", correct: false },
      { id: "d", text: "Financial gain", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "An Ace in a suit represents…", options: [
      { id: "a", text: "A seed / pure potential", correct: true },
      { id: "b", text: "Completion", correct: false },
      { id: "c", text: "Conflict", correct: false },
      { id: "d", text: "Authority", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Which court card signals outward authority?", options: [
      { id: "a", text: "The King", correct: true },
      { id: "b", text: "The Page", correct: false },
      { id: "c", text: "The Knight", correct: false },
      { id: "d", text: "The Ace", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "A reversed card usually reads as…", options: [
      { id: "a", text: "A blocked or internalized form of the upright meaning", correct: true },
      { id: "b", text: "A printing defect", correct: false },
      { id: "c", text: "Always the exact opposite", correct: false },
      { id: "d", text: "Meaningless", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "The Celtic Cross spread uses…", options: [
      { id: "a", text: "Ten cards", correct: true },
      { id: "b", text: "Three cards", correct: false },
      { id: "c", text: "One card", correct: false },
      { id: "d", text: "Seventy-eight cards", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "The Rider–Waite–Smith deck dates from…", options: [
      { id: "a", text: "1909", correct: true },
      { id: "b", text: "Ancient Egypt", correct: false },
      { id: "c", text: "1450", correct: false },
      { id: "d", text: "1990", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "A responsible reader will NOT…", options: [
      { id: "a", text: "Diagnose illness or predict death", correct: true },
      { id: "b", text: "Ask open, reflective questions", correct: false },
      { id: "c", text: "Consider card positions", correct: false },
      { id: "d", text: "Encourage the querent's agency", correct: false },
    ] },
    { id: "f15", type: "true-false", prompt: "Using reversals is mandatory for all readers.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f16", type: "true-false", prompt: "A card's position in a spread can change its meaning.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
