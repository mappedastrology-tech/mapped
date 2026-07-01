/**
 * Concept definitions — plain-language explanations of WHAT each numerology
 * number is and where it comes from. Used for the info tooltips on the
 * Numerology page (one per concept, independent of the user's actual value).
 */

export const CONCEPT_INFO: Record<string, string> = {
  lifePath:
    "Your Life Path comes from your full birth date — the single most important number in your chart. It describes the overarching theme, lessons, and direction of this lifetime.",
  expression:
    "Also called the Destiny number, your Expression is built from every letter of your full birth name. It names your natural talents and what you are here to build and become.",
  soulUrge:
    "Your Soul Urge — the Heart's Desire — comes from the vowels in your name. It reveals what truly motivates you underneath everything: what your heart quietly longs for.",
  personality:
    "Your Personality number comes from the consonants in your name. It is the first impression you give — the version of you others meet before they know you well.",
  birthday:
    "Your Birthday number is simply the day of the month you were born. It adds one specific, ready-made gift on top of your Life Path.",
  maturity:
    "Your Maturity number blends your Life Path and Expression. It points to who you are growing into — a theme that ripens and takes the lead in the second half of life.",
  personalYear:
    "Your Personal Year is the theme of your current year within a repeating nine-year cycle. It resets each January and colors what this whole year is for.",
  personalMonth:
    "Your Personal Month narrows the year's theme down to the current month — the particular flavor of these few weeks.",
  personalDay:
    "Your Personal Day is today's number — the most immediate rhythm of the cycle, useful for deciding how to spend a single day.",
  pinnacle:
    "Pinnacles are four long chapters of life, each governed by one number. They mark the opportunities and lessons that define each era, from your early years onward.",
  challenge:
    "Challenge numbers name the recurring growth-edges you are here to work through. They are not punishments — they are the specific friction that shapes you.",
  karmicDebt:
    "Karmic Debt numbers (13, 14, 16, 19) appear when a core number carries an old imbalance to set right this lifetime. They are invitations to grow, never verdicts.",
  karmicLesson:
    "Karmic Lessons are the numbers missing from your name — capacities that didn't come pre-installed, which life keeps nudging you to develop.",
  hiddenPassion:
    "Your Hidden Passion is the number that repeats most in your name — a concentrated talent or drive that wants to be expressed.",
  balance:
    "Your Balance number, drawn from your initials, shows how you best steady yourself when you are stressed or emotionally thrown.",
  subconsciousSelf:
    "Your Subconscious Self reflects how confidently you respond to the unexpected — surprises, emergencies, and sudden change.",
  bridge:
    "Bridge numbers measure the gap between two of your core numbers and name what closes the distance, so the different parts of you work together more smoothly.",
};

export function getConceptInfo(key: string): string {
  return CONCEPT_INFO[key] ?? "";
}
