import type { Course } from "../types";

/** FLAGSHIP #4 — Numerology, taught as a symbolic system with both major schools. */
export const numerologyFoundations: Course = {
  id: "numerology-foundations",
  domain: "numerology",
  title: "Numerology Foundations",
  subtitle: "Your numbers and the two systems",
  level: "foundations",
  icon: "9",
  summary:
    "Calculate your core numbers, learn what 1–9 and the master numbers mean, and understand the difference between the Pythagorean and Chaldean systems.",
  estMinutes: 35,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "The Basics", lessons: ["What numerology is", "The numbers 1–9 and master numbers"] },
    { module: "Your Core Numbers", lessons: ["The Life Path number", "Name numbers: Expression, Soul Urge, Personality"] },
    { module: "The Two Systems", lessons: ["Pythagorean numerology", "Chaldean numerology", "Why Life Path matches but names differ", "Personal cycles & honest practice"] },
  ],

  modules: [
    {
      id: "m1",
      title: "The Basics",
      lessons: [
        {
          id: "l1-what-numerology-is",
          title: "What numerology is",
          objective: "Explain what numerology is and how to hold it honestly.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Numerology is the symbolic study of numbers — the idea that numbers derived from your birth date and name carry meaning about your character and life. It's a system of correspondences, not a branch of mathematics." },
            { kind: "callout", tone: "history", title: "Where it comes from", text: "Number symbolism is ancient. The Western system is named after Pythagoras (who taught that numbers underlie reality), and the 'Chaldean' system is named for ancient Babylon. Modern numerology, though, is largely a 19th–20th century synthesis." },
            { kind: "callout", tone: "evidence", title: "What the evidence says", text: "There's no scientific evidence that numbers derived from a name or date predict personality or destiny. Like astrology, much of its felt accuracy is the Forer effect — vague statements feeling personally true. Use it as a reflective lens, not a forecast." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Numerology is best described as…", options: [
              { id: "a", text: "A symbolic system of meaning assigned to numbers", correct: true, explanation: "Yes — it's correspondences, not mathematics." },
              { id: "b", text: "A branch of mathematics", correct: false, explanation: "It borrows numbers but isn't math." },
              { id: "c", text: "A proven predictive science", correct: false, explanation: "There's no scientific support for prediction." },
            ] },
            { id: "q2", type: "mcq", prompt: "The Western numerology system is named after…", options: [
              { id: "a", text: "Pythagoras", correct: true, explanation: "Correct — hence 'Pythagorean' numerology." },
              { id: "b", text: "Einstein", correct: false, explanation: "No — it's named for Pythagoras." },
              { id: "c", text: "Newton", correct: false, explanation: "Not Newton." },
            ] },
            { id: "q3", type: "true-false", prompt: "Numerology has been scientifically proven to predict personality.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — there's no scientific support." },
              { id: "f", text: "False", correct: true, explanation: "Correct — treat it as a reflective tool." },
            ] },
          ],
        },
        {
          id: "l2-numbers-meanings",
          title: "The numbers 1–9 and master numbers",
          objective: "Recall the core meaning of each number 1–9 and the master numbers.",
          estMinutes: 5,
          blocks: [
            { kind: "explore", prompt: "The numbers 1–9", instructions: "Tap a number to meet its archetype", items: [
              { glyph: "1", name: "The Leader", meta: "Independent · pioneering", accent: "#c0392b", blurb: "Initiative, drive and originality. The number of beginnings and the self." },
              { glyph: "2", name: "The Peacemaker", meta: "Diplomatic · sensitive", accent: "#2e86c1", blurb: "Partnership, balance and intuition. Works best in harmony with others." },
              { glyph: "3", name: "The Communicator", meta: "Expressive · creative", accent: "#c9a227", blurb: "Joy, self-expression and imagination — a social, artistic vibration." },
              { glyph: "4", name: "The Builder", meta: "Practical · disciplined", accent: "#6a9a4a", blurb: "Structure, order and hard work. Lays solid, dependable foundations." },
              { glyph: "5", name: "The Adventurer", meta: "Free · curious", accent: "#d35400", blurb: "Change, freedom and the senses. Restless, versatile and bold." },
              { glyph: "6", name: "The Nurturer", meta: "Caring · responsible", accent: "#c0398a", blurb: "Home, love and service. Devoted to family and community." },
              { glyph: "7", name: "The Seeker", meta: "Analytical · spiritual", accent: "#6c5ce7", blurb: "Introspection, study and wisdom. Drawn to mystery and truth." },
              { glyph: "8", name: "The Powerhouse", meta: "Ambitious · capable", accent: "#a8842c", blurb: "Authority, money and achievement — the number of material mastery." },
              { glyph: "9", name: "The Humanitarian", meta: "Compassionate · wise", accent: "#b8a0d2", blurb: "Completion, idealism and giving. Holds a broad, selfless view." },
            ] },
            { kind: "sort", prompt: "Active vs receptive numbers", instructions: "In numerology, odd numbers are active (yang); even are receptive (yin). Sort them", groups: [
              { name: "Active (odd)", accent: "#c9881f", items: ["1", "3", "5", "7", "9"] },
              { name: "Receptive (even)", accent: "#5b6bb5", items: ["2", "4", "6", "8"] },
            ] },
            { kind: "text", text: "Almost everything in numerology reduces to a single digit, 1–9, each with a core theme. Three 'master numbers' (11, 22, 33) are kept un-reduced because they're considered especially potent." },
            { kind: "table", headers: ["Number", "Core theme"], rows: [
              ["1", "Independence, leadership, initiative"],
              ["2", "Partnership, harmony, sensitivity"],
              ["3", "Creativity, expression, joy"],
              ["4", "Stability, structure, hard work"],
              ["5", "Freedom, change, adventure"],
              ["6", "Nurturing, responsibility, home"],
              ["7", "Introspection, analysis, spirituality"],
              ["8", "Power, ambition, material success"],
              ["9", "Compassion, completion, idealism"],
            ] },
            { kind: "keyfacts", items: [
              "11 — the 'intuitive' master number (heightened 2).",
              "22 — the 'master builder' (heightened 4).",
              "33 — the 'master teacher' (heightened 6).",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which number's core theme is independence and leadership?", options: [
              { id: "a", text: "1", correct: true, explanation: "Correct — 1 is the initiator." },
              { id: "b", text: "6", correct: false, explanation: "6 is nurturing/responsibility." },
              { id: "c", text: "9", correct: false, explanation: "9 is compassion/completion." },
            ] },
            { id: "q2", type: "mcq", prompt: "The 'master numbers' are…", options: [
              { id: "a", text: "11, 22, and 33", correct: true, explanation: "Yes — kept un-reduced." },
              { id: "b", text: "10, 20, and 30", correct: false, explanation: "Those aren't master numbers." },
              { id: "c", text: "1, 2, and 3", correct: false, explanation: "Those are single digits." },
            ] },
            { id: "q3", type: "true-false", prompt: "Master numbers are usually reduced to a single digit like all others.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they're kept un-reduced." },
              { id: "f", text: "False", correct: true, explanation: "Correct — 11/22/33 stay as they are." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Your Core Numbers",
      lessons: [
        {
          id: "l3-life-path",
          title: "The Life Path number",
          objective: "Calculate a Life Path number from a birth date.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The Life Path is the headline number, taken from your full birth date. The method: reduce the month, the day, and the year each to a single digit (or master number), add those three results, then reduce again." },
            { kind: "callout", tone: "tip", title: "Worked example — 23 July 1990", text: "Month: 7. Day: 23 → 2+3 = 5. Year: 1990 → 1+9+9+0 = 19 → 1+9 = 10 → 1. Now add: 7 + 5 + 1 = 13 → 1+3 = 4. Life Path = 4." },
            { kind: "callout", tone: "tip", title: "Keep master numbers", text: "If any step lands on 11, 22, or 33, don't reduce it further — keep it. The same goes for the final total." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "To find a Life Path, you first…", options: [
              { id: "a", text: "Reduce month, day, and year each to a single digit, then add and reduce", correct: true, explanation: "Correct — that's the standard method." },
              { id: "b", text: "Add all the digits of your name", correct: false, explanation: "That's a name number, not the Life Path." },
              { id: "c", text: "Use only the year", correct: false, explanation: "You use the whole date." },
            ] },
            { id: "q2", type: "mcq", prompt: "Reduce the day '23' to a single digit:", options: [
              { id: "a", text: "5", correct: true, explanation: "2 + 3 = 5." },
              { id: "b", text: "6", correct: false, explanation: "2 + 3 = 5, not 6." },
              { id: "c", text: "23", correct: false, explanation: "You reduce it: 2 + 3 = 5." },
            ] },
            { id: "q3", type: "true-false", prompt: "If a step totals 22, you should reduce it to 4.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — 22 is a master number; keep it." },
              { id: "f", text: "False", correct: true, explanation: "Correct — master numbers aren't reduced." },
            ] },
          ],
        },
        {
          id: "l4-name-numbers",
          title: "Name numbers: Expression, Soul Urge, Personality",
          objective: "Distinguish the three name-derived numbers.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Your name converts to numbers too (each letter has a value). The three main name numbers differ only by which letters you use." },
            { kind: "table", headers: ["Number", "From which letters", "Describes"], rows: [
              ["Expression / Destiny", "ALL letters of your full name", "Your talents and life direction"],
              ["Soul Urge / Heart's Desire", "The VOWELS only", "Your inner motivations and longings"],
              ["Personality", "The CONSONANTS only", "The 'you' others first perceive"],
            ] },
            { kind: "text", text: "You calculate each by converting the relevant letters to numbers, summing, and reducing — just like the Life Path." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The Soul Urge number is calculated from…", options: [
              { id: "a", text: "The vowels in your name", correct: true, explanation: "Yes — vowels reveal inner motivation." },
              { id: "b", text: "The consonants", correct: false, explanation: "Those give the Personality number." },
              { id: "c", text: "Your birth date", correct: false, explanation: "That's the Life Path." },
            ] },
            { id: "q2", type: "mcq", prompt: "The Expression (Destiny) number uses…", options: [
              { id: "a", text: "All the letters of your full name", correct: true, explanation: "Correct — the whole name." },
              { id: "b", text: "Only the first letter", correct: false, explanation: "That's the 'cornerstone,' not Expression." },
              { id: "c", text: "Only vowels", correct: false, explanation: "Vowels give the Soul Urge." },
            ] },
            { id: "q3", type: "mcq", prompt: "The Personality number comes from the…", options: [
              { id: "a", text: "Consonants", correct: true, explanation: "Right — the outward-facing letters." },
              { id: "b", text: "Vowels", correct: false, explanation: "Vowels are the Soul Urge." },
              { id: "c", text: "Birth year", correct: false, explanation: "That's part of the Life Path." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "The Two Systems",
      lessons: [
        {
          id: "l5-pythagorean",
          title: "Pythagorean numerology",
          objective: "Convert letters to numbers in the Pythagorean system.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The Pythagorean system — the most common in the West — assigns numbers 1–9 to letters in simple sequence, then repeats." },
            { kind: "table", headers: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], rows: [
              ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
              ["J", "K", "L", "M", "N", "O", "P", "Q", "R"],
              ["S", "T", "U", "V", "W", "X", "Y", "Z", ""],
            ] },
            { kind: "text", text: "So A=1, B=2 … I=9, then J=1, K=2, and so on. It's easy to do by hand, which is part of why it's so widely used." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In the Pythagorean system, what number is the letter 'A'?", options: [
              { id: "a", text: "1", correct: true, explanation: "Correct — the sequence starts A=1." },
              { id: "b", text: "9", correct: false, explanation: "That's the letter I." },
              { id: "c", text: "26", correct: false, explanation: "Values only run 1–9." },
            ] },
            { id: "q2", type: "mcq", prompt: "How are letters numbered in the Pythagorean system?", options: [
              { id: "a", text: "1–9 in sequence, repeating", correct: true, explanation: "Yes — A=1 … I=9, then J=1 again." },
              { id: "b", text: "By their sound", correct: false, explanation: "That's the Chaldean approach." },
              { id: "c", text: "Randomly", correct: false, explanation: "It's a fixed sequence." },
            ] },
            { id: "q3", type: "mcq", prompt: "The letter 'J' has which Pythagorean value?", options: [
              { id: "a", text: "1", correct: true, explanation: "After I=9, the sequence restarts: J=1." },
              { id: "b", text: "10", correct: false, explanation: "Values only go 1–9." },
              { id: "c", text: "0", correct: false, explanation: "0 isn't used; J=1." },
            ] },
          ],
        },
        {
          id: "l6-chaldean",
          title: "Chaldean numerology",
          objective: "Describe how the Chaldean system differs from Pythagorean.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The older Chaldean system assigns numbers based on a letter's vibration/sound rather than alphabetical order — so the mapping isn't sequential and has to be looked up (for example F=8, G=3, H=5)." },
            { kind: "callout", tone: "tradition", title: "The big difference: no 9", text: "Chaldean numerology uses only 1–8 for letters. The number 9 is held as 'sacred' and isn't assigned to any letter, because adding 9 to a number and reducing returns the original number." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Chaldean letter values are based on…", options: [
              { id: "a", text: "A letter's sound / vibration (not alphabetical order)", correct: true, explanation: "Correct — that's why they must be looked up." },
              { id: "b", text: "Alphabetical sequence", correct: false, explanation: "That's the Pythagorean approach." },
              { id: "c", text: "The birth date", correct: false, explanation: "Letter values come from the name, by sound." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which number is NOT assigned to any letter in the Chaldean system?", options: [
              { id: "a", text: "9", correct: true, explanation: "Right — 9 is held sacred and unassigned." },
              { id: "b", text: "1", correct: false, explanation: "1 is used." },
              { id: "c", text: "5", correct: false, explanation: "5 is used." },
            ] },
            { id: "q3", type: "true-false", prompt: "You can derive Chaldean letter values just from alphabetical position.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the mapping is non-sequential and must be looked up." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's based on sound, not position." },
            ] },
          ],
        },
        {
          id: "l7-systems-compared",
          title: "Why Life Path matches but names differ",
          objective: "Explain which numbers agree between the two systems and which don't.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "People often ask which system is 'right.' A useful fact resolves a lot of confusion:" },
            { kind: "keyfacts", items: [
              "Date-derived numbers (Life Path, Personal Year/Month/Day) are IDENTICAL in both systems — they don't use letters at all.",
              "Name-derived numbers (Expression, Soul Urge, Personality) DIFFER, because the two systems assign letters differently.",
            ] },
            { kind: "callout", tone: "tip", title: "Common practice", text: "Many practitioners use Pythagorean for the Life Path (it's date-based anyway) and Chaldean for name analysis. There's no objective 'correct' answer — pick what's meaningful to you." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which number is the SAME in both Pythagorean and Chaldean numerology?", options: [
              { id: "a", text: "The Life Path (it's date-based)", correct: true, explanation: "Correct — no letters involved, so the systems agree." },
              { id: "b", text: "The Expression number", correct: false, explanation: "That's name-based, so it differs." },
              { id: "c", text: "The Soul Urge", correct: false, explanation: "Also name-based — it differs." },
            ] },
            { id: "q2", type: "mcq", prompt: "Name-derived numbers differ between the systems because…", options: [
              { id: "a", text: "The systems assign letters to numbers differently", correct: true, explanation: "Exactly — different letter values, different results." },
              { id: "b", text: "Names change over time", correct: false, explanation: "It's the letter mapping, not name changes." },
              { id: "c", text: "Of rounding errors", correct: false, explanation: "No rounding is involved." },
            ] },
            { id: "q3", type: "true-false", prompt: "There is one objectively correct numerology system.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's a matter of preference, not fact." },
              { id: "f", text: "False", correct: true, explanation: "Correct — neither is objectively 'right.'" },
            ] },
          ],
        },
        {
          id: "l8-cycles",
          title: "Personal cycles & honest practice",
          objective: "Describe the personal-year cycle and keep an honest perspective.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Numerology also describes cycles. Your Personal Year (reduce your birth month + birth day + the current year) is said to set the theme for that year, moving through a repeating 1–9 cycle: 1 for new beginnings up to 9 for completion and release." },
            { kind: "callout", tone: "evidence", title: "Hold it lightly", text: "These cycles can be a fun framework for reflection and intention-setting — but they're symbolic, not predictive. Numerology is for self-reflection, not a substitute for medical, legal, or financial advice." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A Personal Year of '1' traditionally signals…", options: [
              { id: "a", text: "New beginnings", correct: true, explanation: "Yes — 1 starts the cycle." },
              { id: "b", text: "Completion and release", correct: false, explanation: "That's a 9 year." },
              { id: "c", text: "Nothing in particular", correct: false, explanation: "Each number carries a theme; 1 is beginnings." },
            ] },
            { id: "q2", type: "mcq", prompt: "The Personal Year cycle runs…", options: [
              { id: "a", text: "1 through 9, then repeats", correct: true, explanation: "Correct — a nine-year cycle." },
              { id: "b", text: "1 through 12", correct: false, explanation: "That's months/zodiac, not the numerology cycle." },
              { id: "c", text: "Only odd numbers", correct: false, explanation: "It runs the full 1–9." },
            ] },
            { id: "q3", type: "true-false", prompt: "Numerology cycles are an appropriate substitute for financial or medical advice.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's a reflective tool only." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep it to reflection." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "Numerology is…", options: [
      { id: "a", text: "A symbolic system, not mathematics", correct: true },
      { id: "b", text: "A branch of mathematics", correct: false },
      { id: "c", text: "A proven science", correct: false },
      { id: "d", text: "A type of astronomy", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "The master numbers are…", options: [
      { id: "a", text: "11, 22, 33", correct: true },
      { id: "b", text: "10, 20, 30", correct: false },
      { id: "c", text: "3, 6, 9", correct: false },
      { id: "d", text: "1, 11, 111", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "The number 1 represents…", options: [
      { id: "a", text: "Independence and leadership", correct: true },
      { id: "b", text: "Nurturing and home", correct: false },
      { id: "c", text: "Completion", correct: false },
      { id: "d", text: "Partnership", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "The Life Path number is calculated from…", options: [
      { id: "a", text: "Your full birth date", correct: true },
      { id: "b", text: "Your name's vowels", correct: false },
      { id: "c", text: "Your name's consonants", correct: false },
      { id: "d", text: "Your favorite number", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "Reduce '23' (a birth day) to a single digit:", options: [
      { id: "a", text: "5", correct: true },
      { id: "b", text: "6", correct: false },
      { id: "c", text: "4", correct: false },
      { id: "d", text: "23", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "The Soul Urge number uses the…", options: [
      { id: "a", text: "Vowels of your name", correct: true },
      { id: "b", text: "Consonants of your name", correct: false },
      { id: "c", text: "Birth year", correct: false },
      { id: "d", text: "First letter only", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "The Expression number uses…", options: [
      { id: "a", text: "All letters of your full name", correct: true },
      { id: "b", text: "Only vowels", correct: false },
      { id: "c", text: "Only the birth date", correct: false },
      { id: "d", text: "Only consonants", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "In Pythagorean numerology, A equals…", options: [
      { id: "a", text: "1", correct: true },
      { id: "b", text: "9", correct: false },
      { id: "c", text: "26", correct: false },
      { id: "d", text: "0", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "Chaldean letter values are based on…", options: [
      { id: "a", text: "A letter's sound / vibration", correct: true },
      { id: "b", text: "Alphabetical order", correct: false },
      { id: "c", text: "The birth date", correct: false },
      { id: "d", text: "Random assignment", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Which number is NOT assigned to letters in the Chaldean system?", options: [
      { id: "a", text: "9", correct: true },
      { id: "b", text: "1", correct: false },
      { id: "c", text: "4", correct: false },
      { id: "d", text: "8", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "Which number is identical in both systems?", options: [
      { id: "a", text: "The Life Path (date-based)", correct: true },
      { id: "b", text: "The Expression number", correct: false },
      { id: "c", text: "The Soul Urge", correct: false },
      { id: "d", text: "The Personality number", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "A Personal Year of 9 signals…", options: [
      { id: "a", text: "Completion and release", correct: true },
      { id: "b", text: "New beginnings", correct: false },
      { id: "c", text: "Stagnation", correct: false },
      { id: "d", text: "Nothing", correct: false },
    ] },
    { id: "f13", type: "true-false", prompt: "Master numbers (11, 22, 33) are kept un-reduced.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f14", type: "true-false", prompt: "There is one objectively correct numerology system.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f15", type: "true-false", prompt: "Numerology can substitute for medical or financial advice.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f16", type: "mcq", prompt: "The Personality number is derived from the…", options: [
      { id: "a", text: "Consonants of your name", correct: true },
      { id: "b", text: "Vowels of your name", correct: false },
      { id: "c", text: "Birth month", correct: false },
      { id: "d", text: "Master numbers", correct: false },
    ] },
  ],
};
