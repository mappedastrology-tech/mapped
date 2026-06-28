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
    { module: "Your Core Numbers", lessons: ["The Life Path number", "Name numbers: Expression, Soul Urge, Personality", "The Pythagorean letter chart", "Master numbers 11, 22, 33"] },
    { module: "The Two Systems", lessons: ["Pythagorean numerology", "Chaldean numerology", "Why Life Path matches but names differ", "Personal year cycles", "Compatibility basics", "Personal cycles & honest practice"] },
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
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Numerology is the symbolic study of numbers — the idea that numbers derived from your birth date and name carry meaning about your character and life. It's a system of correspondences, not a branch of mathematics. The arithmetic is just the doorway; the interpretation is where the system lives." },
            { kind: "text", text: "At its heart, numerology makes one move over and over: take something (a date, a name, a year) and reduce it to a single digit between 1 and 9. Each of those nine digits is treated as an archetype with a personality. The reductions are real arithmetic; the meanings attached to each digit are tradition, not measurement." },
            { kind: "callout", tone: "history", title: "Where it comes from", text: "Number symbolism is ancient. The Western system is named after Pythagoras (who taught that numbers underlie reality), and the 'Chaldean' system is named for ancient Babylon. Modern numerology, though, is largely a 19th–20th century synthesis — popularized in the early 1900s by writers such as L. Dow Balliett and Juno Jordan." },
            { kind: "callout", tone: "history", title: "Gematria, a cousin", text: "Numerology overlaps with gematria — the Hebrew practice of assigning number values to letters and finding meaning in the totals — and with similar traditions in Greek (isopsephy) and Arabic. The instinct to read numbers in words is very old and very widespread." },
            { kind: "callout", tone: "tradition", title: "How to hold it", text: "Numerology is a symbolic language: a long tradition that treats each number as an archetype with a character of its own. It's a reflective lens — a way to look at a name, a date, or a year and ask what qualities it carries. Use it the way you'd use any rich symbolic system: as a prompt for self-understanding, not a forecast." },
            { kind: "keyfacts", items: [
              "Numerology = symbolic meaning assigned to numbers, a tradition of correspondences.",
              "The core operation is reduction: collapse any number to a single digit 1–9.",
              "Two main schools: Pythagorean (Western) and Chaldean (older, Babylonian).",
              "It's a reflective lens for self-understanding, held lightly.",
            ] },
            { kind: "callout", tone: "safety", title: "Hold it lightly", text: "Numerology is a tool for reflection and self-understanding — never a substitute for medical, legal, or financial advice, and never a reason to make a high-stakes decision. If a reading ever pressures you toward something risky, that's a red flag, not a revelation." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Numerology is best described as…", options: [
              { id: "a", text: "A symbolic system of meaning assigned to numbers", correct: true, explanation: "Yes — it's correspondences, not mathematics." },
              { id: "b", text: "A branch of mathematics", correct: false, explanation: "It borrows numbers but isn't math." },
              { id: "c", text: "A medical diagnostic system", correct: false, explanation: "Numerology is a symbolic tradition, not a health tool." },
            ] },
            { id: "q2", type: "mcq", prompt: "The Western numerology system is named after…", options: [
              { id: "a", text: "Pythagoras", correct: true, explanation: "Correct — hence 'Pythagorean' numerology." },
              { id: "b", text: "Einstein", correct: false, explanation: "No — it's named for Pythagoras." },
              { id: "c", text: "Newton", correct: false, explanation: "Not Newton." },
            ] },
            { id: "q3", type: "mcq", prompt: "The core operation repeated throughout numerology is…", options: [
              { id: "a", text: "Reducing a number to a single digit 1–9", correct: true, explanation: "Right — reduction is the doorway to every reading." },
              { id: "b", text: "Multiplying digits together", correct: false, explanation: "Numerology adds and reduces; it doesn't multiply." },
              { id: "c", text: "Finding square roots", correct: false, explanation: "No roots are involved." },
            ] },
            { id: "q4", type: "true-false", prompt: "Numerology is a symbolic tradition that treats each number as an archetype with its own character.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it's a language of correspondences, each digit carrying its own qualities." },
              { id: "f", text: "False", correct: false, explanation: "That archetypal symbolism is exactly what numerology is built on." },
            ] },
            { id: "q5", type: "true-false", prompt: "Numerology is best used as a reflective lens for self-understanding, held lightly.", options: [
              { id: "t", text: "True", correct: true, explanation: "Yes — it's a prompt for reflection, not a high-stakes forecast." },
              { id: "f", text: "False", correct: false, explanation: "A reflective lens is precisely how the tradition is meant to be held." },
            ] },
          ],
        },
        {
          id: "l2-numbers-meanings",
          title: "The numbers 1–9 and master numbers",
          objective: "Recall the core meaning of each number 1–9 and the master numbers.",
          estMinutes: 6,
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
            { kind: "text", text: "Almost everything in numerology reduces to a single digit, 1–9, each with a core theme. Three 'master numbers' (11, 22, 33) are kept un-reduced because they're considered especially potent — a topic that gets its own lesson later." },
            { kind: "text", text: "A useful way to feel the sequence: the numbers tell a story. 1 begins alone, 2 finds a partner, 3 creates, 4 builds the structure, 5 breaks free of it, 6 returns to care for others, 7 turns inward to seek meaning, 8 masters the material world, and 9 lets go and gives back. Then the cycle resets." },
            { kind: "table", headers: ["Number", "Core theme", "Shadow side"], rows: [
              ["1", "Independence, leadership, initiative", "Domineering, isolated"],
              ["2", "Partnership, harmony, sensitivity", "Over-dependent, indecisive"],
              ["3", "Creativity, expression, joy", "Scattered, superficial"],
              ["4", "Stability, structure, hard work", "Rigid, stubborn"],
              ["5", "Freedom, change, adventure", "Restless, reckless"],
              ["6", "Nurturing, responsibility, home", "Meddling, self-sacrificing"],
              ["7", "Introspection, analysis, spirituality", "Aloof, distrustful"],
              ["8", "Power, ambition, material success", "Controlling, workaholic"],
              ["9", "Compassion, completion, idealism", "Aloof, martyr-like"],
            ] },
            { kind: "callout", tone: "tradition", title: "Why every shadow side?", text: "Traditional numerology insists each number has a 'high' and 'low' expression — its gifts and its excesses are two ends of the same trait. The 1's leadership tips into domination; the 6's devotion tips into martyrdom. The shadow side is what keeps the archetypes from being purely flattering, and it's part of why readings can feel even-handed." },
            { kind: "keyfacts", items: [
              "1–9 are the working alphabet of numerology; everything reduces into them.",
              "Odd = active/yang; even = receptive/yin.",
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
            { id: "q3", type: "mcq", prompt: "Which number is traditionally tied to home, family, and responsibility?", options: [
              { id: "a", text: "6", correct: true, explanation: "Correct — 6 is the Nurturer." },
              { id: "b", text: "5", correct: false, explanation: "5 is freedom and change." },
              { id: "c", text: "8", correct: false, explanation: "8 is material power and ambition." },
            ] },
            { id: "q4", type: "true-false", prompt: "Master numbers are usually reduced to a single digit like all others.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they're kept un-reduced." },
              { id: "f", text: "False", correct: true, explanation: "Correct — 11/22/33 stay as they are." },
            ] },
            { id: "q5", type: "true-false", prompt: "In numerology, odd numbers are considered 'active' (yang).", options: [
              { id: "t", text: "True", correct: true, explanation: "Yes — odd numbers are active/yang, even are receptive/yin." },
              { id: "f", text: "False", correct: false, explanation: "Odd numbers are the active ones." },
            ] },
            { id: "q6", type: "recall", prompt: "Reduce the number 1990 to a single digit. (Add the digits, then reduce.)", options: [], answer: "1", accept: ["one"], explanation: "1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1." },
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
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "The Life Path is the headline number, taken from your full birth date. It's considered the single most important number in a chart — the broad theme of the journey you're walking. Because it comes purely from a date, it's the same number whichever system you use." },
            { kind: "text", text: "The method: reduce the month, the day, and the year each to a single digit (or master number), add those three results, then reduce again. Reducing each component first — rather than just adding every digit in a long string — is the standard approach and the one that correctly preserves master numbers." },
            { kind: "callout", tone: "tip", title: "Worked example — 23 July 1990", text: "Month: 7. Day: 23 → 2+3 = 5. Year: 1990 → 1+9+9+0 = 19 → 1+9 = 10 → 1. Now add: 7 + 5 + 1 = 13 → 1+3 = 4. Life Path = 4." },
            { kind: "callout", tone: "tip", title: "Second example — 4 November 1988", text: "Month: 11 (a master number — keep it). Day: 4. Year: 1988 → 1+9+8+8 = 26 → 2+6 = 8. Add: 11 + 4 + 8 = 23 → 2+3 = 5. Life Path = 5." },
            { kind: "callout", tone: "tradition", title: "Keep master numbers", text: "If any step lands on 11, 22, or 33, don't reduce it further — keep it. The same goes for the final total: a sum of 29 → 11 would stay 11, not collapse to 2." },
            { kind: "table", headers: ["Step", "What you do", "Example (23 Jul 1990)"], rows: [
              ["1", "Reduce the month", "07 → 7"],
              ["2", "Reduce the day", "23 → 5"],
              ["3", "Reduce the year", "1990 → 1"],
              ["4", "Add the three results", "7 + 5 + 1 = 13"],
              ["5", "Reduce the total", "13 → 4"],
            ] },
            { kind: "keyfacts", items: [
              "Reduce month, day, and year separately, then add and reduce.",
              "Stop at 11, 22, or 33 at any stage — they're master numbers.",
              "The Life Path is identical in Pythagorean and Chaldean systems.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "Why is the Life Path the same in both numerology systems?", options: [
              { id: "a", text: "It's built from a date, not from letters", correct: true, explanation: "Right — the systems only differ in how they value letters." },
              { id: "b", text: "Both systems were invented together", correct: false, explanation: "They have different origins; the agreement is about dates, not history." },
              { id: "c", text: "It uses an average of the two systems", correct: false, explanation: "No averaging is involved — dates use no letters at all." },
            ] },
            { id: "q4", type: "true-false", prompt: "If a step totals 22, you should reduce it to 4.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — 22 is a master number; keep it." },
              { id: "f", text: "False", correct: true, explanation: "Correct — master numbers aren't reduced." },
            ] },
            { id: "q5", type: "recall", prompt: "A birth date reduces to month 3, day 7, and year 1. Add and reduce to get the Life Path number.", options: [], answer: "2", accept: ["two"], explanation: "3 + 7 + 1 = 11 — a master number — but the question asks you to add and reduce: 11 → 1+1 = 2. (In a real chart you'd keep the 11.)" },
          ],
        },
        {
          id: "l4-name-numbers",
          title: "Name numbers: Expression, Soul Urge, Personality",
          objective: "Distinguish the three name-derived numbers.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Your name converts to numbers too (each letter has a value). The three main name numbers differ only by which letters you use — so they're three readings of the same name, not three separate calculations." },
            { kind: "table", headers: ["Number", "From which letters", "Describes"], rows: [
              ["Expression / Destiny", "ALL letters of your full name", "Your talents and life direction"],
              ["Soul Urge / Heart's Desire", "The VOWELS only", "Your inner motivations and longings"],
              ["Personality", "The CONSONANTS only", "The 'you' others first perceive"],
            ] },
            { kind: "text", text: "You calculate each by converting the relevant letters to numbers, summing, and reducing — just like the Life Path. (The next lesson gives you the letter chart you'll need.)" },
            { kind: "callout", tone: "tradition", title: "Which name?", text: "Most practitioners use the full name exactly as written on your birth certificate for the 'blueprint' numbers, then read a current or chosen name separately to show who you've grown into. A nickname, a married name, or a name you chose for yourself is treated as a layer on top, not a replacement." },
            { kind: "callout", tone: "tip", title: "Is Y a vowel?", text: "Y is the famous edge case. The common rule: count Y as a vowel when it makes a vowel sound and there's no other vowel in the syllable (as in 'Lynn' or 'Bryan'), and as a consonant when it glides (as in 'Yara'). Whichever rule you pick, apply it consistently so your Soul Urge and Personality numbers don't overlap or leave a letter out." },
            { kind: "keyfacts", items: [
              "Expression (Destiny) = all letters → talents and direction.",
              "Soul Urge (Heart's Desire) = vowels → inner motivation.",
              "Personality = consonants → the first impression you give.",
              "Together they're sometimes called the 'core' name numbers.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "Which name is traditionally used for the 'blueprint' name numbers?", options: [
              { id: "a", text: "The full name on your birth certificate", correct: true, explanation: "Right — chosen or married names are read as additional layers." },
              { id: "b", text: "Your most recent nickname", correct: false, explanation: "Nicknames are a layer on top, not the blueprint." },
              { id: "c", text: "Your initials only", correct: false, explanation: "All the letters are used, not just initials." },
            ] },
            { id: "q5", type: "true-false", prompt: "The Expression, Soul Urge, and Personality numbers all read the same name using different sets of letters.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — all letters, vowels only, and consonants only." },
              { id: "f", text: "False", correct: false, explanation: "They do use the same name, differing only by which letters." },
            ] },
          ],
        },
        {
          id: "l5-letter-chart",
          title: "The Pythagorean letter chart",
          objective: "Convert any name to numbers using the 1–9 Pythagorean letter chart.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "To work out any name number you need the letter chart: the table that turns each letter into a digit. The Pythagorean chart is the one most Western numerologists use, and it's simple enough to memorize a row at a time." },
            { kind: "table", headers: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], rows: [
              ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
              ["J", "K", "L", "M", "N", "O", "P", "Q", "R"],
              ["S", "T", "U", "V", "W", "X", "Y", "Z", ""],
            ] },
            { kind: "text", text: "Read it in columns: A, J, and S all equal 1; B, K, and T equal 2; and so on. Every letter from A to Z lands in one of the nine columns. There's no 0 — the chart only uses 1 through 9." },
            { kind: "callout", tone: "tip", title: "Worked example — the name ANN", text: "A = 1, N = 5, N = 5. Sum: 1 + 5 + 5 = 11. As an Expression number you'd keep 11 (a master number); reduced for practice it's 1+1 = 2. So ANN carries the energy of partnership and intuition." },
            { kind: "callout", tone: "tip", title: "Worked example — vowels of ANNA", text: "The vowels in ANNA are the two A's: 1 + 1 = 2. So ANNA's Soul Urge number is 2 — an inner pull toward harmony and connection." },
            { kind: "callout", tone: "tip", title: "The Cornerstone and Capstone", text: "Two quick mini-readings: the first letter of your name (the 'Cornerstone') shows how you approach things; the last letter (the 'Capstone') shows how you finish them. For a name starting with S (= 1), that's a self-starting, leading approach." },
            { kind: "keyfacts", items: [
              "Column 1: A, J, S. Column 2: B, K, T. Column 3: C, L, U.",
              "Column 4: D, M, V. Column 5: E, N, W. Column 6: F, O, X.",
              "Column 7: G, P, Y. Column 8: H, Q, Z. Column 9: I, R.",
              "Only 1–9 are used — there is no letter worth 0.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In the Pythagorean chart, which three letters all equal 1?", options: [
              { id: "a", text: "A, J, and S", correct: true, explanation: "Correct — they sit in the first column." },
              { id: "b", text: "A, B, and C", correct: false, explanation: "Those are 1, 2, and 3 respectively." },
              { id: "c", text: "I, R, and Z", correct: false, explanation: "I and R are 9; Z is 8." },
            ] },
            { id: "q2", type: "mcq", prompt: "What is the Pythagorean value of the letter N?", options: [
              { id: "a", text: "5", correct: true, explanation: "Right — N is in column 5 (E, N, W)." },
              { id: "b", text: "4", correct: false, explanation: "Column 4 is D, M, V." },
              { id: "c", text: "14", correct: false, explanation: "Values only run 1–9; N reduces to 5." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which letter is the highest value (9) in the chart?", options: [
              { id: "a", text: "R", correct: true, explanation: "Correct — I and R are the only letters worth 9." },
              { id: "b", text: "Z", correct: false, explanation: "Z is 8." },
              { id: "c", text: "Y", correct: false, explanation: "Y is 7." },
            ] },
            { id: "q4", type: "true-false", prompt: "The Pythagorean letter chart includes a letter worth 0.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the chart only uses 1 through 9." },
              { id: "f", text: "False", correct: true, explanation: "Correct — there is no 0 value." },
            ] },
            { id: "q5", type: "recall", prompt: "Using the Pythagorean chart (A=1, N=5), add the letters of the name ANN and reduce to a single digit.", options: [], answer: "2", accept: ["two"], explanation: "A=1, N=5, N=5 → 1+5+5 = 11 → 1+1 = 2. (As an Expression number you'd keep the master 11.)" },
            { id: "q6", type: "recall", prompt: "What single digit do the letters A, J, and S all share in the Pythagorean chart?", options: [], answer: "1", accept: ["one"], explanation: "They form the first column, so all three equal 1." },
          ],
        },
        {
          id: "l6-master-numbers",
          title: "Master numbers 11, 22, 33",
          objective: "Explain what the master numbers are and when to keep them un-reduced.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Three double-digit numbers — 11, 22, and 33 — are treated as special. They're the 'master numbers': when a calculation lands on one of them, you stop and keep it rather than reducing to a single digit. Each is read as an intensified, more demanding version of the digit it reduces to." },
            { kind: "table", headers: ["Master number", "Reduces to", "Traditional name", "Theme"], rows: [
              ["11", "2", "The Intuitive / Messenger", "Heightened intuition, inspiration, sensitivity"],
              ["22", "4", "The Master Builder", "Turning big visions into real structures"],
              ["33", "6", "The Master Teacher", "Selfless service, healing, compassion at scale"],
            ] },
            { kind: "text", text: "Notice the pattern: 11 is a heightened 2, 22 a heightened 4, 33 a heightened 6 — always the even, receptive numbers doubled. Tradition frames master numbers as carrying both the everyday meaning of the reduced digit and a higher 'calling' that's harder to live up to." },
            { kind: "callout", tone: "tradition", title: "High potential, high pressure", text: "Numerologists often describe master numbers as 'high-voltage': more potential, but also more tension. An 11 is said to feel the pull of a 2 (partnership, sensitivity) amplified to the point of nervous intensity until it's channeled. The doubled digit and its single-digit root are both 'on' at once." },
            { kind: "callout", tone: "tip", title: "When NOT to keep them", text: "Only keep 11, 22, or 33 when they appear as a stage's result or a final total in a real chart. If a quiz or exercise asks you to 'reduce fully to one digit,' then 11 → 2, 22 → 4, 33 → 6. Context decides." },
            { kind: "callout", tone: "evidence", title: "Some go further — be skeptical", text: "A few modern numerologists add 44, 55, and beyond as 'master numbers' too. There's no agreed-on tradition for this, and it's a good reminder that numerology is an evolving set of conventions, not a fixed law. Stick to 11/22/33 unless you have a reason not to." },
            { kind: "keyfacts", items: [
              "Master numbers are 11, 22, and 33 — kept un-reduced in a chart.",
              "11 → 2, 22 → 4, 33 → 6 when you do reduce them.",
              "They're framed as 'higher potential, higher pressure' versions of the root.",
              "44+ as master numbers is a modern, non-standard addition.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which set lists the three standard master numbers?", options: [
              { id: "a", text: "11, 22, 33", correct: true, explanation: "Correct — the three classic master numbers." },
              { id: "b", text: "11, 13, 17", correct: false, explanation: "Those are just primes, not master numbers." },
              { id: "c", text: "2, 4, 6", correct: false, explanation: "Those are the single digits the masters reduce to." },
            ] },
            { id: "q2", type: "mcq", prompt: "The master number 22 is known as…", options: [
              { id: "a", text: "The Master Builder", correct: true, explanation: "Right — it's the visionary made practical." },
              { id: "b", text: "The Intuitive", correct: false, explanation: "That's 11." },
              { id: "c", text: "The Master Teacher", correct: false, explanation: "That's 33." },
            ] },
            { id: "q3", type: "mcq", prompt: "If you fully reduced the master number 33, you would get…", options: [
              { id: "a", text: "6", correct: true, explanation: "3 + 3 = 6 — the Nurturer root." },
              { id: "b", text: "9", correct: false, explanation: "3 + 3 = 6, not 9." },
              { id: "c", text: "3", correct: false, explanation: "You add the digits: 3 + 3 = 6." },
            ] },
            { id: "q4", type: "true-false", prompt: "In a real chart, a total of 11 should be kept rather than reduced to 2.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — 11 is a master number." },
              { id: "f", text: "False", correct: false, explanation: "It is kept un-reduced as 11." },
            ] },
            { id: "q5", type: "true-false", prompt: "44 and 55 are universally agreed-upon master numbers in traditional numerology.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — those are a modern, non-standard addition." },
              { id: "f", text: "False", correct: true, explanation: "Correct — the standard set is 11, 22, 33." },
            ] },
            { id: "q6", type: "recall", prompt: "The master number 22 reduces to which single digit?", options: [], answer: "4", accept: ["four"], explanation: "2 + 2 = 4 — the Builder, which 22 intensifies." },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "The Two Systems",
      lessons: [
        {
          id: "l7-pythagorean",
          title: "Pythagorean numerology",
          objective: "Convert letters to numbers in the Pythagorean system.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The Pythagorean system — the most common in the West — assigns numbers 1–9 to letters in simple sequence, then repeats. You met its letter chart earlier; this lesson is about what makes the system distinctive." },
            { kind: "table", headers: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], rows: [
              ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
              ["J", "K", "L", "M", "N", "O", "P", "Q", "R"],
              ["S", "T", "U", "V", "W", "X", "Y", "Z", ""],
            ] },
            { kind: "text", text: "So A=1, B=2 … I=9, then J=1, K=2, and so on. It's easy to do by hand, which is part of why it's so widely used — you can reconstruct the whole chart from memory just by counting." },
            { kind: "callout", tone: "history", title: "Named for Pythagoras, built much later", text: "Despite the name, there's no evidence Pythagoras himself created this letter-to-number table. It's a modern Western convention attached to his name because of his teaching that 'all is number.' The system is real and consistent; the attribution is honorary." },
            { kind: "callout", tone: "tip", title: "Counts as you go", text: "Because the chart is sequential, you never have to look it up: A starts at 1, the tenth letter J wraps back to 1, the nineteenth letter S wraps again. If you know a letter's position in the alphabet, its value is that position reduced to a single digit." },
            { kind: "keyfacts", items: [
              "Letters map to 1–9 in alphabetical sequence, repeating every nine.",
              "A=1 … I=9, then J=1, K=2 … R=9, then S=1 … Z=8.",
              "Reconstructable from memory — no lookup table needed.",
              "It's the default system for most Western name numerology.",
            ] },
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
            { id: "q4", type: "true-false", prompt: "Pythagoras personally devised the letter-to-number chart used today.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the attribution is honorary; the chart is a modern convention." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's named for him, not made by him." },
            ] },
            { id: "q5", type: "recall", prompt: "In the Pythagorean system, the letter R has which single-digit value?", options: [], answer: "9", accept: ["nine"], explanation: "R is the 18th letter; 1+8 = 9. It sits in the ninth column with I." },
          ],
        },
        {
          id: "l8-chaldean",
          title: "Chaldean numerology",
          objective: "Describe how the Chaldean system differs from Pythagorean.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The older Chaldean system assigns numbers based on a letter's vibration/sound rather than alphabetical order — so the mapping isn't sequential and has to be looked up (for example F=8, G=3, H=5)." },
            { kind: "table", headers: ["Feature", "Pythagorean", "Chaldean"], rows: [
              ["Age", "Modern Western synthesis", "Ancient (Babylonian roots)"],
              ["Letter values", "1–9, alphabetical sequence", "1–8, by sound/vibration"],
              ["Number 9", "Used for letters", "Held sacred — never assigned"],
              ["Ease of use", "Memorizable; do it by hand", "Must be looked up"],
              ["Name used", "Usually the birth name", "Often the name you go by"],
            ] },
            { kind: "callout", tone: "tradition", title: "The big difference: no 9", text: "Chaldean numerology uses only 1–8 for letters. The number 9 is held as 'sacred' and isn't assigned to any letter, because adding 9 to a number and reducing returns the original number — a property that made it feel set apart." },
            { kind: "callout", tone: "history", title: "Older roots, harder to use", text: "The Chaldean system traces its lineage to ancient Mesopotamia and is considered the older of the two. Its champions argue it's more 'accurate' because it follows sound; its critics note that the non-sequential chart varies between sources, so two practitioners can get different values for the same letter." },
            { kind: "callout", tone: "culture", title: "Which name it reads", text: "Chaldean practice often favors the name a person is actually known by — the working signature of a life — over the full birth-certificate name, on the logic that a name's vibration is what's spoken aloud day to day." },
            { kind: "keyfacts", items: [
              "Chaldean assigns values by sound, not alphabetical order.",
              "Only 1–8 are used for letters; 9 is reserved as sacred.",
              "The chart is non-sequential and must be looked up.",
              "It's the older system; Pythagorean is the more common today.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "Which system is considered the older of the two?", options: [
              { id: "a", text: "Chaldean", correct: true, explanation: "Correct — it traces to ancient Mesopotamia." },
              { id: "b", text: "Pythagorean", correct: false, explanation: "Pythagorean is the more modern Western synthesis." },
              { id: "c", text: "They were invented at the same time", correct: false, explanation: "Chaldean is markedly older." },
            ] },
            { id: "q4", type: "true-false", prompt: "You can derive Chaldean letter values just from alphabetical position.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the mapping is non-sequential and must be looked up." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's based on sound, not position." },
            ] },
            { id: "q5", type: "true-false", prompt: "The Chaldean system assigns values 1 through 9 to letters, just like Pythagorean.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — Chaldean only uses 1–8; 9 is reserved." },
              { id: "f", text: "False", correct: true, explanation: "Correct — letters get 1–8 only." },
            ] },
          ],
        },
        {
          id: "l9-systems-compared",
          title: "Why Life Path matches but names differ",
          objective: "Explain which numbers agree between the two systems and which don't.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "People often ask which system is 'right.' A useful fact resolves a lot of confusion:" },
            { kind: "keyfacts", items: [
              "Date-derived numbers (Life Path, Personal Year/Month/Day) are IDENTICAL in both systems — they don't use letters at all.",
              "Name-derived numbers (Expression, Soul Urge, Personality) DIFFER, because the two systems assign letters differently.",
            ] },
            { kind: "table", headers: ["Number", "Source", "Same in both systems?"], rows: [
              ["Life Path", "Birth date", "Yes — identical"],
              ["Personal Year", "Birth date + current year", "Yes — identical"],
              ["Expression", "All letters of name", "No — differs"],
              ["Soul Urge", "Vowels of name", "No — differs"],
              ["Personality", "Consonants of name", "No — differs"],
            ] },
            { kind: "callout", tone: "tip", title: "Common practice", text: "Many practitioners use Pythagorean for the Life Path (it's date-based anyway) and Chaldean for name analysis. There's no objective 'correct' answer — pick what's meaningful to you and, crucially, stay consistent within a single reading." },
            { kind: "callout", tone: "evidence", title: "Why neither can be 'proven'", text: "Because the two systems disagree on name numbers and there's no external fact for either to match, no experiment can crown a winner. That's not a flaw to fix — it's a sign you're working with a symbolic language, where coherence and meaning matter more than correctness." },
            { kind: "keyfacts", items: [
              "Anything from a date is system-independent.",
              "Anything from letters depends on the chart you choose.",
              "Mixing systems is fine — just don't mix them mid-calculation.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "Why can't an experiment prove one system 'correct'?", options: [
              { id: "a", text: "There's no external fact for either to match — it's a symbolic language", correct: true, explanation: "Right — meaning, not measurement, is the point." },
              { id: "b", text: "Nobody has tried", correct: false, explanation: "The issue is structural, not effort." },
              { id: "c", text: "The math is too hard", correct: false, explanation: "The arithmetic is trivial; that's not the obstacle." },
            ] },
            { id: "q4", type: "true-false", prompt: "There is one objectively correct numerology system.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's a matter of preference, not fact." },
              { id: "f", text: "False", correct: true, explanation: "Correct — neither is objectively 'right.'" },
            ] },
            { id: "q5", type: "true-false", prompt: "The Personal Year number is identical whichever system you use.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it's built from dates, which use no letters." },
              { id: "f", text: "False", correct: false, explanation: "It is the same; only name numbers differ between systems." },
            ] },
          ],
        },
        {
          id: "l10-personal-year",
          title: "Personal year cycles",
          objective: "Calculate a Personal Year number and describe the 1–9 cycle.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Beyond the fixed numbers of your chart, numerology tracks moving cycles. The Personal Year is the most popular: a number from 1 to 9 said to set the theme of each calendar year for you, advancing one step every year and resetting after 9." },
            { kind: "text", text: "To calculate it, reduce your birth month, your birth day, and the current calendar year, then add and reduce. (Note you use the current year, not your birth year — that's what makes it move.)" },
            { kind: "callout", tone: "tip", title: "Worked example — born 15 March, year 2026", text: "Month: 3. Day: 15 → 1+5 = 6. Year: 2026 → 2+0+2+6 = 10 → 1. Add: 3 + 6 + 1 = 10 → 1+0 = 1. Personal Year = 1 — a year of fresh starts." },
            { kind: "callout", tone: "tip", title: "The same person, one year later — 2027", text: "Month 3, day 6 (from 15), year 2027 → 2+0+2+7 = 11 → 2. Add: 3 + 6 + 2 = 11 → 2. Personal Year = 2 — the cycle has advanced one step toward partnership and patience." },
            { kind: "table", headers: ["Personal Year", "Traditional theme"], rows: [
              ["1", "New beginnings, initiative, planting seeds"],
              ["2", "Patience, partnership, slow growth"],
              ["3", "Creativity, expression, social life"],
              ["4", "Work, structure, building foundations"],
              ["5", "Change, freedom, the unexpected"],
              ["6", "Home, responsibility, relationships"],
              ["7", "Reflection, study, inner work"],
              ["8", "Ambition, achievement, material focus"],
              ["9", "Completion, release, letting go"],
            ] },
            { kind: "callout", tone: "tradition", title: "A story arc, not a forecast", text: "The nine-year cycle is meant to read like a narrative: you begin (1), build through the middle years, and clear the decks at 9 so a fresh 1 can start. Practitioners use it to choose where to put energy — bold moves in a 1 year, consolidation in a 4, rest and review in a 7." },
            { kind: "callout", tone: "evidence", title: "Useful framing, not prophecy", text: "There's nothing in a calendar year that makes a '5 year' chaotic or a '7 year' contemplative. The value, if any, is as a prompt for reflection and intention — a structure you place on the year, not one the year imposes on you." },
            { kind: "keyfacts", items: [
              "Personal Year = birth month + birth day + current year, reduced.",
              "It runs 1 through 9, then resets — a nine-year cycle.",
              "Use the current year, which is why it changes annually.",
              "1 = beginnings; 9 = completion and release.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The Personal Year is calculated from…", options: [
              { id: "a", text: "Birth month + birth day + the current year, reduced", correct: true, explanation: "Correct — that's the standard formula." },
              { id: "b", text: "Just your Life Path number", correct: false, explanation: "The Life Path is fixed; the Personal Year moves with the calendar." },
              { id: "c", text: "Your full name", correct: false, explanation: "It's date-based, not name-based." },
            ] },
            { id: "q2", type: "mcq", prompt: "A Personal Year of '1' traditionally signals…", options: [
              { id: "a", text: "New beginnings", correct: true, explanation: "Yes — 1 starts the cycle." },
              { id: "b", text: "Completion and release", correct: false, explanation: "That's a 9 year." },
              { id: "c", text: "Nothing in particular", correct: false, explanation: "Each number carries a theme; 1 is beginnings." },
            ] },
            { id: "q3", type: "mcq", prompt: "Why does the Personal Year change every year?", options: [
              { id: "a", text: "It uses the current calendar year in the calculation", correct: true, explanation: "Right — swapping in the new year advances the cycle." },
              { id: "b", text: "Because your birthday changes", correct: false, explanation: "Your birth month and day stay the same." },
              { id: "c", text: "It doesn't — it's fixed for life", correct: false, explanation: "That's the Life Path; the Personal Year moves." },
            ] },
            { id: "q4", type: "true-false", prompt: "The Personal Year cycle runs from 1 to 9 and then repeats.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — a nine-year cycle." },
              { id: "f", text: "False", correct: false, explanation: "It does run 1–9 and reset." },
            ] },
            { id: "q5", type: "recall", prompt: "Born 15 March. For the year 2026, the components reduce to month 3, day 6, year 1. Add and reduce for the Personal Year.", options: [], answer: "1", accept: ["one"], explanation: "3 + 6 + 1 = 10 → 1+0 = 1 — a Personal Year of 1." },
          ],
        },
        {
          id: "l11-compatibility",
          title: "Compatibility basics",
          objective: "Describe how numerology compares two people's numbers — and its limits.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "A common use of numerology is 'compatibility' — comparing two people's core numbers (most often their Life Paths) to describe how their energies might mesh. It's one of the system's most popular and most over-claimed applications." },
            { kind: "text", text: "The usual approach: look at each person's Life Path archetype and ask how those temperaments interact. Numbers that share a quality (two creative 3s, a structured 4 and a structured 8) are read as easy; numbers that pull in opposite directions (a freedom-loving 5 and a home-bound 6) are read as challenging — but 'challenging' is framed as growth, not doom." },
            { kind: "table", headers: ["Pairing pattern", "Traditional read"], rows: [
              ["Same number (e.g. 1 & 1)", "Deep understanding, but can amplify each other's excess"],
              ["Both active/odd (e.g. 1 & 5)", "High energy, independence; risk of friction"],
              ["Both receptive/even (e.g. 2 & 6)", "Cooperative, nurturing, stable"],
              ["Active + receptive (e.g. 3 & 4)", "Complementary — one initiates, one steadies"],
              ["5 with a 4 or 6", "Freedom vs. structure — classic 'opposites' tension"],
            ] },
            { kind: "callout", tone: "tradition", title: "It's a conversation starter", text: "Used well, a compatibility reading is a prompt to talk: 'You're a freedom-seeking 5, I'm a home-loving 6 — how do we honor both?' The numbers don't decide the relationship; they give you vocabulary for differences you already feel." },
            { kind: "callout", tone: "evidence", title: "No predictive power — be careful here", text: "There is no evidence that birth-date or name numbers predict relationship success. Do not use a numerology reading to start, stay in, or end a relationship. Real compatibility comes from communication, values, and respect — things no number can measure." },
            { kind: "callout", tone: "safety", title: "A clear line", text: "If anyone tells you two people are 'numerologically incompatible' and must separate — or 'destined' and must commit — treat that as a misuse of the tool. Numerology describes archetypes; it does not have authority over real people's choices." },
            { kind: "keyfacts", items: [
              "Compatibility usually compares Life Path archetypes.",
              "Similar numbers read as easy; opposite ones as growth-oriented.",
              "'Challenging' pairings are framed as potential, not verdicts.",
              "It has no predictive validity — never use it to make relationship decisions.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Numerology compatibility most often compares two people's…", options: [
              { id: "a", text: "Life Path numbers", correct: true, explanation: "Correct — the Life Path is the usual starting point." },
              { id: "b", text: "Shoe sizes", correct: false, explanation: "Compatibility uses core numbers, not unrelated facts." },
              { id: "c", text: "Favorite colors", correct: false, explanation: "It compares numerology numbers, not preferences." },
            ] },
            { id: "q2", type: "mcq", prompt: "In a compatibility reading, a 'challenging' pairing is traditionally framed as…", options: [
              { id: "a", text: "An opportunity for growth, not a verdict", correct: true, explanation: "Right — tension is read as potential, not doom." },
              { id: "b", text: "A guarantee the relationship will fail", correct: false, explanation: "Numerology makes no such guarantee." },
              { id: "c", text: "A reason to separate immediately", correct: false, explanation: "That's a misuse of the tool." },
            ] },
            { id: "q3", type: "mcq", prompt: "What actually drives real-world compatibility?", options: [
              { id: "a", text: "Communication, values, and respect", correct: true, explanation: "Correct — things no number can measure." },
              { id: "b", text: "Matching Life Path numbers", correct: false, explanation: "Numbers don't determine relationship outcomes." },
              { id: "c", text: "Having the same master number", correct: false, explanation: "Master numbers don't predict compatibility." },
            ] },
            { id: "q4", type: "true-false", prompt: "Numerology compatibility readings reliably predict whether a relationship will succeed.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — there's no predictive validity here." },
              { id: "f", text: "False", correct: true, explanation: "Correct — use it for conversation, not decisions." },
            ] },
            { id: "q5", type: "true-false", prompt: "It's appropriate to end a relationship because two people are 'numerologically incompatible.'", options: [
              { id: "t", text: "True", correct: false, explanation: "No — that's a misuse of a symbolic tool." },
              { id: "f", text: "False", correct: true, explanation: "Correct — numerology has no authority over real choices." },
            ] },
          ],
        },
        {
          id: "l12-cycles",
          title: "Personal cycles & honest practice",
          objective: "Summarize numerology's cycles and keep an honest, healthy perspective.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "You've now met the Personal Year; numerology nests smaller cycles inside it too — a Personal Month (add the calendar month to your Personal Year and reduce) and even a Personal Day. Together they're meant to give a 'weather forecast' of themes at different zoom levels." },
            { kind: "table", headers: ["Cycle", "How it's built", "What it's said to color"], rows: [
              ["Personal Year", "Birth month + day + current year", "The year's overall theme"],
              ["Personal Month", "Personal Year + calendar month", "That month's flavor"],
              ["Personal Day", "Personal Month + calendar day", "The texture of a single day"],
            ] },
            { kind: "callout", tone: "tip", title: "How people actually use it", text: "The honest, healthy use is as a reflective ritual: a 1 year invites you to ask what you want to begin; a 9 month invites you to ask what you're ready to release. The questions are the value — the number is just the prompt that triggers them." },
            { kind: "callout", tone: "tip", title: "Hold it lightly", text: "These cycles make a rich framework for reflection and intention-setting — a way to give a year or a month a theme to work with. Keep it to that: numerology is for self-reflection, not a substitute for medical, legal, or financial advice." },
            { kind: "callout", tone: "safety", title: "Watch for these red flags", text: "Be wary of any reading that creates fear, demands money to 'fix' a number, discourages medical care, or pressures a major life decision. A trustworthy reading expands your options and self-understanding; it never narrows them or hands its authority to a stranger." },
            { kind: "keyfacts", items: [
              "Cycles nest: Year → Month → Day, each a finer-grained theme.",
              "The healthy use is reflection and intention-setting.",
              "Numerology never replaces medical, legal, or financial advice.",
              "Fear, urgency, or pressure to pay are red flags, not insight.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A Personal Year of '1' traditionally signals…", options: [
              { id: "a", text: "New beginnings", correct: true, explanation: "Yes — 1 starts the cycle." },
              { id: "b", text: "Completion and release", correct: false, explanation: "That's a 9 year." },
              { id: "c", text: "Nothing in particular", correct: false, explanation: "Each number carries a theme; 1 is beginnings." },
            ] },
            { id: "q2", type: "mcq", prompt: "The Personal cycles nest in which order, broadest to finest?", options: [
              { id: "a", text: "Year → Month → Day", correct: true, explanation: "Correct — each is a finer-grained theme inside the larger one." },
              { id: "b", text: "Day → Month → Year", correct: false, explanation: "That's reversed — the Year is the broadest." },
              { id: "c", text: "Month → Year → Day", correct: false, explanation: "The Year is the largest container." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which is a red flag in a numerology reading?", options: [
              { id: "a", text: "Pressure to pay money to 'fix' a number", correct: true, explanation: "Right — that's manipulation, not insight." },
              { id: "b", text: "An invitation to reflect on your goals", correct: false, explanation: "That's a healthy use." },
              { id: "c", text: "An invitation to set an intention for the month", correct: false, explanation: "That's a healthy, reflective use — not a red flag." },
            ] },
            { id: "q4", type: "true-false", prompt: "Numerology cycles are an appropriate substitute for financial or medical advice.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's a reflective tool only." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep it to reflection." },
            ] },
            { id: "q5", type: "true-false", prompt: "A trustworthy reading expands your options rather than narrowing them with fear.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — healthy practice broadens self-understanding." },
              { id: "f", text: "False", correct: false, explanation: "Fear-based, narrowing readings are a misuse." },
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
    { id: "f13", type: "mcq", prompt: "In the Pythagorean chart, which letters all equal 1?", options: [
      { id: "a", text: "A, J, and S", correct: true },
      { id: "b", text: "A, B, and C", correct: false },
      { id: "c", text: "I, R, and Z", correct: false },
      { id: "d", text: "X, Y, and Z", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "The master number 22 reduces to…", options: [
      { id: "a", text: "4", correct: true },
      { id: "b", text: "2", correct: false },
      { id: "c", text: "6", correct: false },
      { id: "d", text: "8", correct: false },
    ] },
    { id: "f15", type: "mcq", prompt: "The Personal Year is calculated from…", options: [
      { id: "a", text: "Birth month + birth day + the current year", correct: true },
      { id: "b", text: "Your name's vowels", correct: false },
      { id: "c", text: "Your birth year alone", correct: false },
      { id: "d", text: "Your Life Path times two", correct: false },
    ] },
    { id: "f16", type: "mcq", prompt: "The master number 11 is traditionally called…", options: [
      { id: "a", text: "The Intuitive / Messenger", correct: true },
      { id: "b", text: "The Master Builder", correct: false },
      { id: "c", text: "The Master Teacher", correct: false },
      { id: "d", text: "The Humanitarian", correct: false },
    ] },
    { id: "f17", type: "mcq", prompt: "In the Pythagorean system, the letter R has the value…", options: [
      { id: "a", text: "9", correct: true },
      { id: "b", text: "1", correct: false },
      { id: "c", text: "5", correct: false },
      { id: "d", text: "18", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "Numerology compatibility readings…", options: [
      { id: "a", text: "Have no predictive validity and shouldn't drive relationship decisions", correct: true },
      { id: "b", text: "Reliably predict relationship success", correct: false },
      { id: "c", text: "Can determine who you must marry", correct: false },
      { id: "d", text: "Replace communication and shared values", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "The Personality number is derived from the…", options: [
      { id: "a", text: "Consonants of your name", correct: true },
      { id: "b", text: "Vowels of your name", correct: false },
      { id: "c", text: "Birth month", correct: false },
      { id: "d", text: "Master numbers", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "The Chaldean system is best described as…", options: [
      { id: "a", text: "The older system, using values 1–8 by sound", correct: true },
      { id: "b", text: "A modern, sequential 1–9 chart", correct: false },
      { id: "c", text: "Identical to the Pythagorean system", correct: false },
      { id: "d", text: "Based purely on birth dates", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "Which is a red flag in a numerology reading?", options: [
      { id: "a", text: "Pressure to pay to 'fix' a number or a major decision urged by fear", correct: true },
      { id: "b", text: "An invitation to reflect on your goals", correct: false },
      { id: "c", text: "An invitation to set an intention for the year", correct: false },
      { id: "d", text: "A reading that expands your options rather than narrowing them", correct: false },
    ] },
    { id: "f22", type: "true-false", prompt: "Master numbers (11, 22, 33) are kept un-reduced.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f23", type: "true-false", prompt: "There is one objectively correct numerology system.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f24", type: "true-false", prompt: "Numerology can substitute for medical or financial advice.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f25", type: "true-false", prompt: "The Life Path number is the same whichever system you use, because it's built from a date.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f26", type: "true-false", prompt: "The Pythagorean letter chart includes a letter worth 0.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
  ],
};
