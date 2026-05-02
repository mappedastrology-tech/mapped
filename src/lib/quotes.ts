/**
 * Phrase-of-the-Day — 30 Mapped originals.
 *
 * These replace the previous literary quote rotation. All content is
 * Mapped-original — no copyrighted material, no author attribution needed.
 *
 * Voice: editorial, observational, slightly sharp, slightly funny.
 * Never wellness-brand, never motivational, never preachy.
 *
 * Rotation logic (V1): deterministic daily selection, no repeats within 30 days.
 * Future V2: tag-match to day's transit / user's Lord of the Year.
 */

export interface Quote {
  id: string;
  text: string;
  theme: QuoteTheme;
  tags: string[];
}

export type QuoteTheme =
  | "love"
  | "change"
  | "rest"
  | "self-knowledge"
  | "time"
  | "other-people"
  | "closing";

export const QUOTES: Quote[] = [
  // ─── ON LOVE ────────────────────────────────────────────────────────────────
  {
    id: "POD01",
    text: "Love is mostly the willingness to be inconvenient to each other.",
    theme: "love",
    tags: ["love", "relationships", "vulnerability", "commitment"],
  },
  {
    id: "POD02",
    text: "The person who knows you and stays is not a guarantee. They’re a practice.",
    theme: "love",
    tags: ["love", "relationships", "patience", "commitment"],
  },
  {
    id: "POD03",
    text: "Most “almost” relationships are not almost. They are exactly what they are.",
    theme: "love",
    tags: ["love", "truth", "relationships", "clarity"],
  },
  {
    id: "POD04",
    text: "You cannot love someone into being honest with you. You can only love yourself enough to stop trying.",
    theme: "love",
    tags: ["love", "truth", "self-discovery", "release"],
  },
  {
    id: "POD05",
    text: "The right person is not always the easy person. The wrong person is sometimes the easy person. Pay attention.",
    theme: "love",
    tags: ["love", "relationships", "intuition", "truth"],
  },
  {
    id: "POD06",
    text: "You are not too much. You are exactly enough for the right people, and far too much for the wrong ones. That is the test.",
    theme: "love",
    tags: ["love", "identity", "self-discovery", "courage"],
  },

  // ─── ON CHANGE ──────────────────────────────────────────────────────────────
  {
    id: "POD07",
    text: "The version of you who needed that is not the version of you reading this.",
    theme: "change",
    tags: ["change", "growth", "identity", "transformation"],
  },
  {
    id: "POD08",
    text: "Some chapters end without a closing scene. The end was the long, slow walking away.",
    theme: "change",
    tags: ["change", "endings", "release", "grief"],
  },
  {
    id: "POD09",
    text: "Growth is mostly the willingness to be wrong about who you used to be.",
    theme: "change",
    tags: ["change", "growth", "self-discovery", "vulnerability"],
  },
  {
    id: "POD10",
    text: "You cannot edit yourself in real time. You can only act, and then look back, and then act differently.",
    theme: "change",
    tags: ["change", "patience", "self-discovery", "action"],
  },
  {
    id: "POD11",
    text: "The phase you’re in is not a punishment. It is the bridge.",
    theme: "change",
    tags: ["change", "patience", "healing", "transformation"],
  },

  // ─── ON REST ────────────────────────────────────────────────────────────────
  {
    id: "POD12",
    text: "Rest is not the reward for productivity. Rest is the condition for it.",
    theme: "rest",
    tags: ["rest", "discipline", "healing", "grounding"],
  },
  {
    id: "POD13",
    text: "The body keeps a longer memory than the mind. Listen to the body.",
    theme: "rest",
    tags: ["rest", "intuition", "healing", "vulnerability"],
  },
  {
    id: "POD14",
    text: "Tiredness is data. Stop arguing with it.",
    theme: "rest",
    tags: ["rest", "truth", "discipline", "surrender"],
  },
  {
    id: "POD15",
    text: "Doing nothing is doing something. The grief, the integration, the small weather of being a person.",
    theme: "rest",
    tags: ["rest", "grief", "healing", "surrender"],
  },

  // ─── ON SELF-KNOWLEDGE ──────────────────────────────────────────────────────
  {
    id: "POD16",
    text: "Your patterns are not your personality. They are the routes your nervous system has memorized.",
    theme: "self-knowledge",
    tags: ["self-discovery", "transformation", "healing", "truth"],
  },
  {
    id: "POD17",
    text: "The thing you keep almost saying is the thing.",
    theme: "self-knowledge",
    tags: ["truth", "courage", "communication", "self-discovery"],
  },
  {
    id: "POD18",
    text: "You are not a problem to be solved. You are a person to be known. Including by yourself.",
    theme: "self-knowledge",
    tags: ["self-discovery", "identity", "healing", "patience"],
  },
  {
    id: "POD19",
    text: "Half of self-awareness is the willingness to stop performing it.",
    theme: "self-knowledge",
    tags: ["self-discovery", "truth", "identity", "vulnerability"],
  },
  {
    id: "POD20",
    text: "You are allowed to be both the cautionary tale and the hero. Most of us are.",
    theme: "self-knowledge",
    tags: ["identity", "courage", "self-discovery", "growth"],
  },

  // ─── ON TIME ────────────────────────────────────────────────────────────────
  {
    id: "POD21",
    text: "You are not behind. You are exactly where the previous version of you brought you. Forgive her.",
    theme: "time",
    tags: ["patience", "self-discovery", "healing", "surrender"],
  },
  {
    id: "POD22",
    text: "The right time to do the thing was probably last year. The second-best time is today.",
    theme: "time",
    tags: ["action", "courage", "discipline", "new-beginnings"],
  },
  {
    id: "POD23",
    text: "Most regrets are about things you didn’t do. Take that seriously.",
    theme: "time",
    tags: ["action", "courage", "truth", "adventure"],
  },
  {
    id: "POD24",
    text: "Saturn is not a punishment. Saturn is the math of time, made visible in your life.",
    theme: "time",
    tags: ["discipline", "patience", "legacy", "transformation"],
  },

  // ─── ON OTHER PEOPLE ────────────────────────────────────────────────────────
  {
    id: "POD25",
    text: "Some people will only ever know the version of you they need you to be. Let them.",
    theme: "other-people",
    tags: ["relationships", "identity", "release", "truth"],
  },
  {
    id: "POD26",
    text: "Friendship is the willingness to be slightly bored together. The rest is acquaintance.",
    theme: "other-people",
    tags: ["relationships", "love", "patience", "truth"],
  },
  {
    id: "POD27",
    text: "You don’t have to be liked by everyone. You just have to be honest with the people who like you.",
    theme: "other-people",
    tags: ["relationships", "truth", "identity", "courage"],
  },
  {
    id: "POD28",
    text: "People show you who they are. Believe them the first time. The second time, that’s on you.",
    theme: "other-people",
    tags: ["relationships", "truth", "self-discovery", "courage"],
  },

  // ─── CLOSING THE LOOP ──────────────────────────────────────────────────────
  {
    id: "POD29",
    text: "You will know it was the right choice because you stopped asking yourself if it was.",
    theme: "closing",
    tags: ["truth", "intuition", "clarity", "surrender"],
  },
  {
    id: "POD30",
    text: "Most of what you’re afraid of is not coming. The few things that are coming, you’ll handle.",
    theme: "closing",
    tags: ["courage", "surrender", "truth", "healing"],
  },
];
