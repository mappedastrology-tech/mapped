import type { ReferenceEntry } from "../types";

/**
 * Quick-reference numerology lookup. The core numbers 1–9, the zero, the master
 * numbers (11/22/33), the karmic-debt numbers (13/14/16/19), the main chart
 * positions (Life Path, Expression, Soul Urge, Personality, Birthday, Personal
 * Year), the Pythagorean letter chart, and a few common "angel numbers."
 * Written in numerology's own voice — the meanings the tradition holds.
 */

function num(e: Omit<ReferenceEntry, "domain">): ReferenceEntry {
  return { domain: "numerology", ...e };
}

export const numerologyReference: ReferenceEntry[] = [
  // ── Core numbers 1–9 ──
  num({
    id: "num-1",
    name: "1 — The Leader",
    category: "Core number",
    summary:
      "The pioneer and the spark of initiation. One is independent, driven, and original — the number of beginnings, self-reliance, and the courage to go first.",
    fields: [
      { label: "Keywords", value: "Independence, leadership, ambition, originality, drive." },
      { label: "Strengths", value: "Self-starting, determined, innovative, fearless, a natural pioneer." },
      { label: "Shadow", value: "Domineering, egotistical, stubborn, impatient, or isolated by going it alone." },
      { label: "Life Path theme", value: "To stand on your own feet, lead with confidence, and forge an original path." },
    ],
    tags: ["leader", "beginnings", "independence", "pioneer"],
  }),
  num({
    id: "num-2",
    name: "2 — The Peacemaker",
    category: "Core number",
    summary:
      "The diplomat and partner. Two is sensitive, cooperative, and intuitive — the number of balance, relationship, and quiet harmony behind the scenes.",
    fields: [
      { label: "Keywords", value: "Partnership, harmony, diplomacy, sensitivity, intuition." },
      { label: "Strengths", value: "Cooperative, tactful, patient, supportive, deeply perceptive of others." },
      { label: "Shadow", value: "Over-sensitive, indecisive, dependent, conflict-avoidant, or self-effacing." },
      { label: "Life Path theme", value: "To build bridges, cultivate peace, and lead through cooperation rather than force." },
    ],
    tags: ["peacemaker", "partnership", "harmony", "diplomacy"],
  }),
  num({
    id: "num-3",
    name: "3 — The Communicator",
    category: "Core number",
    summary:
      "The creative and the expressive. Three is joyful, sociable, and imaginative — the number of self-expression, optimism, and the art of language.",
    fields: [
      { label: "Keywords", value: "Creativity, expression, joy, sociability, optimism." },
      { label: "Strengths", value: "Charismatic, artistic, witty, inspiring, gifted with words and imagination." },
      { label: "Shadow", value: "Scattered, superficial, gossipy, moody, or prone to scattering energy too thin." },
      { label: "Life Path theme", value: "To express your gifts openly and uplift others through creativity and joy." },
    ],
    tags: ["communicator", "creativity", "expression", "joy"],
  }),
  num({
    id: "num-4",
    name: "4 — The Builder",
    category: "Core number",
    summary:
      "The worker and the foundation. Four is practical, disciplined, and reliable — the number of order, structure, and patient, steady effort.",
    fields: [
      { label: "Keywords", value: "Stability, discipline, hard work, order, reliability." },
      { label: "Strengths", value: "Dependable, organized, loyal, methodical, the one who gets things built." },
      { label: "Shadow", value: "Rigid, stubborn, overly cautious, workaholic, or resistant to change." },
      { label: "Life Path theme", value: "To create lasting foundations through honest, disciplined work." },
    ],
    tags: ["builder", "stability", "discipline", "structure"],
  }),
  num({
    id: "num-5",
    name: "5 — The Adventurer",
    category: "Core number",
    summary:
      "The free spirit and the seeker of experience. Five is restless, curious, and magnetic — the number of freedom, change, and the five senses fully alive.",
    fields: [
      { label: "Keywords", value: "Freedom, change, adventure, versatility, curiosity." },
      { label: "Strengths", value: "Adaptable, dynamic, persuasive, adventurous, alive to new experience." },
      { label: "Shadow", value: "Restless, impulsive, irresponsible, indulgent, or unable to commit." },
      { label: "Life Path theme", value: "To embrace change and freedom while learning the discipline that makes it sustainable." },
    ],
    tags: ["adventurer", "freedom", "change", "versatility"],
  }),
  num({
    id: "num-6",
    name: "6 — The Nurturer",
    category: "Core number",
    summary:
      "The caretaker and the heart of the home. Six is loving, responsible, and devoted — the number of family, service, and the beauty of harmony tended with care.",
    fields: [
      { label: "Keywords", value: "Love, responsibility, nurturing, service, harmony." },
      { label: "Strengths", value: "Caring, protective, generous, artistic, deeply committed to those it loves." },
      { label: "Shadow", value: "Self-sacrificing, meddling, perfectionist, controlling, or martyr-like." },
      { label: "Life Path theme", value: "To care for family and community while learning to nurture yourself too." },
    ],
    tags: ["nurturer", "love", "responsibility", "family", "service"],
  }),
  num({
    id: "num-7",
    name: "7 — The Seeker",
    category: "Core number",
    summary:
      "The mystic and the analyst. Seven is introspective, wise, and spiritual — the number of inner truth, study, and the search for what lies beneath the surface.",
    fields: [
      { label: "Keywords", value: "Wisdom, introspection, spirituality, analysis, solitude." },
      { label: "Strengths", value: "Insightful, intuitive, scholarly, contemplative, a seeker of deep truth." },
      { label: "Shadow", value: "Aloof, secretive, skeptical, isolated, or lost in the head." },
      { label: "Life Path theme", value: "To seek inner truth and trust the wisdom that comes from going within." },
    ],
    tags: ["seeker", "wisdom", "spirituality", "introspection"],
  }),
  num({
    id: "num-8",
    name: "8 — The Powerhouse",
    category: "Core number",
    summary:
      "The executive and the master of the material world. Eight is ambitious, authoritative, and capable — the number of power, abundance, and karmic balance between effort and reward.",
    fields: [
      { label: "Keywords", value: "Power, ambition, abundance, authority, achievement." },
      { label: "Strengths", value: "Driven, capable, confident, business-minded, a natural manager of money and people." },
      { label: "Shadow", value: "Controlling, materialistic, ruthless, status-obsessed, or domineering." },
      { label: "Life Path theme", value: "To master the material world with integrity and use power to build, not to dominate." },
    ],
    tags: ["powerhouse", "power", "ambition", "abundance", "authority"],
  }),
  num({
    id: "num-9",
    name: "9 — The Humanitarian",
    category: "Core number",
    summary:
      "The old soul and the giver. Nine is compassionate, idealistic, and worldly — the number of completion, universal love, and selfless service to the greater whole.",
    fields: [
      { label: "Keywords", value: "Compassion, idealism, completion, generosity, wisdom." },
      { label: "Strengths", value: "Humanitarian, tolerant, artistic, magnetic, devoted to a cause larger than self." },
      { label: "Shadow", value: "Aloof, self-pitying, scattered, prone to martyrdom, or unable to let go." },
      { label: "Life Path theme", value: "To serve humanity, release the past, and give freely without expecting return." },
    ],
    tags: ["humanitarian", "compassion", "completion", "idealism"],
  }),
  // ── The number 0 ──
  num({
    id: "num-0",
    name: "0 — Potential & Wholeness",
    category: "Core number",
    summary:
      "The circle of pure potential. Zero holds no fixed traits of its own; it is the void from which all numbers arise and the symbol of wholeness, the infinite, and the God-force. Where it appears, it amplifies and deepens the number beside it.",
    fields: [
      { label: "Keywords", value: "Potential, wholeness, the infinite, the void, spiritual amplification." },
      { label: "Meaning", value: "The 'cosmic egg' — everything and nothing at once, a blank slate of possibility." },
      { label: "In a chart", value: "Intensifies and spiritualizes the number it accompanies (e.g. 10, 20, 40)." },
    ],
    tags: ["zero", "potential", "wholeness", "infinite", "void"],
  }),
  // ── Master numbers ──
  num({
    id: "num-11",
    name: "11 — The Visionary (Master Number)",
    category: "Master number",
    summary:
      "The first master number — the intuitive illuminator. Eleven carries the heightened sensitivity of a 'spiritual messenger,' channeling inspiration and insight. It reduces to the base 2 (1+1=2), so it amplifies the diplomat's gifts to a visionary pitch.",
    fields: [
      { label: "Keywords", value: "Intuition, illumination, inspiration, vision, spiritual insight." },
      { label: "Reduced base", value: "2 (1 + 1 = 2) — the peacemaker's sensitivity raised to a master frequency." },
      { label: "Strengths", value: "Highly intuitive, idealistic, inspiring, a natural channel for higher ideas." },
      { label: "Shadow", value: "Anxious, hypersensitive, scattered, or overwhelmed by its own intensity." },
      { label: "Life Path theme", value: "To inspire and uplift others by trusting and grounding your intuition." },
    ],
    tags: ["master number", "visionary", "intuition", "eleven", "11"],
  }),
  num({
    id: "num-22",
    name: "22 — The Master Builder (Master Number)",
    category: "Master number",
    summary:
      "Often called the most powerful number — the master builder who turns grand visions into concrete reality. Twenty-two blends the dreamer's intuition with the builder's discipline. It reduces to the base 4 (2+2=4), so it amplifies the builder's gifts to a world-shaping scale.",
    fields: [
      { label: "Keywords", value: "Mastery, manifestation, large-scale building, practical vision, legacy." },
      { label: "Reduced base", value: "4 (2 + 2 = 4) — the builder's discipline raised to a master frequency." },
      { label: "Strengths", value: "Visionary yet practical, capable of vast achievement, disciplined and far-sighted." },
      { label: "Shadow", value: "Crushed by self-imposed pressure, prone to burnout, or paralyzed by the scale of the dream." },
      { label: "Life Path theme", value: "To build something of lasting benefit for many, grounding big vision in steady work." },
    ],
    tags: ["master number", "master builder", "manifestation", "twenty-two", "22"],
  }),
  num({
    id: "num-33",
    name: "33 — The Master Teacher (Master Number)",
    category: "Master number",
    summary:
      "The rarest master number — the master teacher of selfless love. Thirty-three devotes its great gifts to the upliftment of humanity through compassion and healing. It reduces to the base 6 (3+3=6), so it amplifies the nurturer's love to a universal scale.",
    fields: [
      { label: "Keywords", value: "Selfless love, healing, teaching, compassion, spiritual upliftment." },
      { label: "Reduced base", value: "6 (3 + 3 = 6) — the nurturer's devotion raised to a master frequency." },
      { label: "Strengths", value: "Profoundly compassionate, nurturing, wise, devoted to the good of all." },
      { label: "Shadow", value: "Martyrdom, emotional overload, or carrying burdens that aren't yours to carry." },
      { label: "Life Path theme", value: "To teach and heal through love, giving without losing yourself in the giving." },
    ],
    tags: ["master number", "master teacher", "healing", "thirty-three", "33"],
  }),
  // ── Karmic debt numbers ──
  num({
    id: "num-13",
    name: "13 — Karmic Debt (the lesson of work)",
    category: "Karmic debt number",
    summary:
      "A karmic debt number reducing to 4 (1+3=4). It carries a lesson from past misuse of effort — shortcuts taken or laziness indulged. The remedy is focus, order, and willingness to do the patient work that has no shortcut.",
    fields: [
      { label: "Reduces to", value: "4 (1 + 3 = 4)." },
      { label: "The lesson", value: "To overcome a tendency toward chaos and avoidance through disciplined, honest work." },
      { label: "Remedy", value: "Concentration, organization, and finishing what you start — no shortcuts." },
    ],
    tags: ["karmic debt", "thirteen", "13", "work", "discipline"],
  }),
  num({
    id: "num-14",
    name: "14 — Karmic Debt (the lesson of freedom)",
    category: "Karmic debt number",
    summary:
      "A karmic debt number reducing to 5 (1+4=5). It carries a lesson from past misuse of freedom — over-indulgence in the senses, instability, or escapism. The remedy is moderation, focus, and freedom used responsibly.",
    fields: [
      { label: "Reduces to", value: "5 (1 + 4 = 5)." },
      { label: "The lesson", value: "To master excess — to enjoy freedom and the senses without losing yourself to them." },
      { label: "Remedy", value: "Moderation, adaptability, and commitment amid constant change." },
    ],
    tags: ["karmic debt", "fourteen", "14", "freedom", "moderation"],
  }),
  num({
    id: "num-16",
    name: "16 — Karmic Debt (the lesson of ego)",
    category: "Karmic debt number",
    summary:
      "A karmic debt number reducing to 7 (1+6=7). It carries the most spiritual lesson — the 'fall of the ego,' where old structures collapse so a truer self can rise. The remedy is humility, surrender, and rebuilding life on spiritual rather than egoic foundations.",
    fields: [
      { label: "Reduces to", value: "7 (1 + 6 = 7)." },
      { label: "The lesson", value: "To release ego and pride; sudden upheavals clear the way for spiritual rebirth." },
      { label: "Remedy", value: "Humility, surrender, and faith — letting the old self fall so the true self can rise." },
    ],
    tags: ["karmic debt", "sixteen", "16", "ego", "humility"],
  }),
  num({
    id: "num-19",
    name: "19 — Karmic Debt (the lesson of self-reliance)",
    category: "Karmic debt number",
    summary:
      "A karmic debt number reducing to 1 (1+9=10, 1+0=1). It carries a lesson from past misuse of power and independence — selfishness or refusal to accept help. The remedy is to stand on your own while learning interdependence and the grace of giving and receiving.",
    fields: [
      { label: "Reduces to", value: "1 (1 + 9 = 10, then 1 + 0 = 1)." },
      { label: "The lesson", value: "To become truly self-reliant without becoming isolated, selfish, or domineering." },
      { label: "Remedy", value: "Independence balanced with humility — learning to both give and receive support." },
    ],
    tags: ["karmic debt", "nineteen", "19", "self-reliance", "independence"],
  }),
  // ── Chart positions ──
  num({
    id: "num-life-path",
    name: "Life Path Number",
    category: "Chart position",
    summary:
      "The single most important number in your chart — the path you walk in this lifetime, your core nature, talents, and the central lessons you came here to learn.",
    fields: [
      { label: "What it is", value: "Your overall life direction, core character, and the lessons you're here to master." },
      { label: "How it's derived", value: "Reduce the full birth date (month + day + year) to a single digit or master number." },
      { label: "Note", value: "Master numbers 11, 22, and 33 are not reduced further when they appear here." },
    ],
    tags: ["life path", "chart", "birth date", "core"],
  }),
  num({
    id: "num-expression",
    name: "Expression / Destiny Number",
    category: "Chart position",
    summary:
      "The Expression (or Destiny) number reveals your natural talents, abilities, and the goals you're built to pursue — who you are meant to become.",
    fields: [
      { label: "What it is", value: "Your innate gifts, abilities, and life goals — your potential made manifest." },
      { label: "How it's derived", value: "Convert every letter of your full birth name to a number, sum them, and reduce to a single digit or master number." },
    ],
    tags: ["expression", "destiny", "chart", "full name", "talents"],
  }),
  num({
    id: "num-soul-urge",
    name: "Soul Urge / Heart's Desire Number",
    category: "Chart position",
    summary:
      "The Soul Urge (or Heart's Desire) number reveals your deepest inner motivations — what your soul truly longs for and what drives you from within.",
    fields: [
      { label: "What it is", value: "Your innermost desires, cravings, and what genuinely motivates you beneath the surface." },
      { label: "How it's derived", value: "Sum only the vowels of your full birth name and reduce to a single digit or master number." },
    ],
    tags: ["soul urge", "heart's desire", "chart", "vowels", "motivation"],
  }),
  num({
    id: "num-personality",
    name: "Personality Number",
    category: "Chart position",
    summary:
      "The Personality number is the outer self — the first impression you make, the side of you others see before they know the inner you.",
    fields: [
      { label: "What it is", value: "How you come across to the world; the 'outer shell' others meet first." },
      { label: "How it's derived", value: "Sum only the consonants of your full birth name and reduce to a single digit or master number." },
    ],
    tags: ["personality", "chart", "consonants", "outer self", "first impression"],
  }),
  num({
    id: "num-birthday",
    name: "Birthday Number",
    category: "Chart position",
    summary:
      "The Birthday number is a specific talent or gift you brought into this life — a supporting note within the larger song of your Life Path.",
    fields: [
      { label: "What it is", value: "A particular skill or trait you carry, drawn from the day of the month you were born." },
      { label: "How it's derived", value: "Take the day of the month of birth (1–31); double-digit days may be read whole or reduced." },
    ],
    tags: ["birthday", "chart", "day of birth", "talent"],
  }),
  num({
    id: "num-personal-year",
    name: "Personal Year Number",
    category: "Chart position",
    summary:
      "The Personal Year number describes the theme and energy of your current year within the repeating nine-year cycle — what this particular year is asking of you.",
    fields: [
      { label: "What it is", value: "The dominant theme of your present year within a recurring 1-through-9 cycle." },
      { label: "How it's derived", value: "Add your birth month and birth day to the current calendar year, then reduce to a single digit." },
      { label: "Cycle", value: "1 = fresh starts; 9 = completion and release — then the cycle begins again." },
    ],
    tags: ["personal year", "chart", "cycle", "timing", "forecast"],
  }),
  // ── Pythagorean letter chart ──
  num({
    id: "num-pythagorean-chart",
    name: "Pythagorean Letter Chart",
    category: "System",
    summary:
      "The standard system for converting letters to numbers in Western numerology. Each letter of the alphabet maps to a digit 1–9 by its position, and these values are used to calculate the name-based numbers.",
    fields: [
      { label: "1", value: "A, J, S" },
      { label: "2", value: "B, K, T" },
      { label: "3", value: "C, L, U" },
      { label: "4", value: "D, M, V" },
      { label: "5", value: "E, N, W" },
      { label: "6", value: "F, O, X" },
      { label: "7", value: "G, P, Y" },
      { label: "8", value: "H, Q, Z" },
      { label: "9", value: "I, R" },
      { label: "How to use", value: "Convert each letter of the full birth name to its number, then sum and reduce for Expression, Soul Urge, and Personality." },
    ],
    tags: ["pythagorean", "letter chart", "alphabet", "system", "calculation"],
  }),
  // ── Angel numbers ──
  num({
    id: "num-111",
    name: "111 — Angel Number",
    category: "Angel number",
    summary:
      "A repeating sequence of 1s, seen as a sign of manifestation and new beginnings. Where 111 appears, your thoughts are crystallizing into reality — a nudge to keep your mind on what you truly want.",
    fields: [
      { label: "Meaning", value: "Manifestation, new beginnings, alignment — your thoughts are taking form." },
      { label: "Message", value: "Stay positive and focused; a doorway of opportunity is opening." },
    ],
    tags: ["angel number", "111", "manifestation", "new beginnings"],
  }),
  num({
    id: "num-222",
    name: "222 — Angel Number",
    category: "Angel number",
    summary:
      "A repeating sequence of 2s, seen as a sign of balance, harmony, and trust. Where 222 appears, you are reassured that things are coming into alignment — keep faith and stay patient.",
    fields: [
      { label: "Meaning", value: "Balance, harmony, partnership, faith — things are aligning as they should." },
      { label: "Message", value: "Trust the process and keep cooperating; you're on the right track." },
    ],
    tags: ["angel number", "222", "balance", "harmony", "trust"],
  }),
  num({
    id: "num-333",
    name: "333 — Angel Number",
    category: "Angel number",
    summary:
      "A repeating sequence of 3s, seen as a sign of creativity, support, and encouragement. Where 333 appears, your guides and gifts are with you — a call to express yourself and step into your purpose.",
    fields: [
      { label: "Meaning", value: "Creativity, expression, encouragement, spiritual support — you are guided and uplifted." },
      { label: "Message", value: "Use your talents boldly; help and inspiration surround you." },
    ],
    tags: ["angel number", "333", "creativity", "support", "expression"],
  }),
  num({
    id: "num-444",
    name: "444 — Angel Number",
    category: "Angel number",
    summary:
      "A repeating sequence of 4s, seen as a sign of protection, stability, and reassurance. Where 444 appears, you are supported and on solid ground — a message that your foundations are firm and you are not alone.",
    fields: [
      { label: "Meaning", value: "Protection, stability, foundation, reassurance — you are safe and supported." },
      { label: "Message", value: "Keep building; your efforts are protected and your path is secure." },
    ],
    tags: ["angel number", "444", "protection", "stability", "foundation"],
  }),
];
