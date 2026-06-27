/**
 * Platonic text guard.
 *
 * For family/friend connections, relationship copy must never read as romantic
 * or sexual. Most copy is already written context-aware at the source, but this
 * is the centralized backstop: a single function that rewrites any romantic-
 * coded language into warm, platonic equivalents. Apply it to ALL relationship
 * text rendered for a non-partner connection (summaries, theme titles, fated
 * contacts, strengths, growth areas, aspect descriptions, composite copy).
 *
 * Phrase-level rewrites run first (so multi-word romantic constructions become
 * clean sentences), then word-level swaps catch anything remaining.
 */

// Specific multi-word phrases → clean platonic rewrites. Ordered, run first.
const PHRASE_REWRITES: [RegExp, string][] = [
  [/intense romantic and sexual chemistry/gi, "intense, magnetic closeness"],
  [/romantic and sexual chemistry/gi, "intense closeness"],
  [/sexual chemistry/gi, "intense energy"],
  [/physical chemistry/gi, "shared energy"],
  [/magnetic attraction/gi, "strong pull"],
  [/forbidden-feeling attraction/gi, "boundary-pushing intensity"],
  [/obsessive,?\s*magnetic attraction/gi, "intense, all-consuming closeness"],
  [/desire and affection/gi, "energy and warmth"],
  [/the classic attraction signature/gi, "a powerful, magnetic bond"],
  [/classic chemistry/gi, "natural, easy rapport"],
  [/raw,? primal heat/gi, "raw, untamed energy"],
  [/primal heat/gi, "raw energy"],
  [/you feel it in your body/gi, "you feel it instinctively"],
  [/beyond friendship/gi, "beyond the ordinary"],
  [/loving them pushes you to grow\.?\s*the attraction feels purposeful\.?/gi, "this bond pushes you to grow, and it feels purposeful."],
  [/the attraction feels purposeful/gi, "the connection feels purposeful"],
  [/fated attraction/gi, "a fated pull"],
  [/love that consumes and possesses/gi, "a bond that consumes and absorbs"],
  [/transforms how you both understand desire/gi, "transforms you both at a deep level"],
  [/turns attraction into something almost compulsive/gi, "turns the pull into something hard to ignore"],
  [/in love\b/gi, "deeply bonded"],
  [/make love/gi, "connect"],
];

// Single romantic-coded words → platonic equivalents. `\b` keeps them whole.
const WORD_SWAPS: [RegExp, string][] = [
  [/\bromantically\b/gi, "deeply"],
  [/\bromantic\b/gi, "deep"],
  [/\bromance\b/gi, "closeness"],
  [/\bsexual\b/gi, "intense"],
  [/\bsensual\b/gi, "vivid"],
  [/\berotic\b/gi, "intense"],
  [/\bseductive\b/gi, "compelling"],
  [/\bseduction\b/gi, "magnetism"],
  [/\bflirtatious\b/gi, "playful"],
  [/\bflirty\b/gi, "playful"],
  [/\bchemistry\b/gi, "connection"],
  [/\battraction\b/gi, "pull"],
  [/\battracted\b/gi, "drawn"],
  [/\bdesire\b/gi, "drive"],
  [/\bintimacy\b/gi, "closeness"],
  [/\bintimate\b/gi, "close"],
  [/\bpassionate\b/gi, "intense"],
  [/\bpassion\b(?! for)/gi, "intensity"],
  [/\bsoulmate[s]?\b/gi, "kindred spirit"],
  [/\blovers?\b/gi, "kindred spirits"],
  [/\bcourtship\b/gi, "getting to know each other"],
  // "magnetic" reads romantic in these contexts; "powerful" keeps the force.
  [/\bmagnetic\b/gi, "powerful"],
];

export function toPlatonic(text: string): string {
  if (!text) return text;
  let out = text;
  for (const [re, rep] of PHRASE_REWRITES) out = out.replace(re, rep);
  for (const [re, rep] of WORD_SWAPS) out = out.replace(re, rep);
  return out;
}

/** Convenience: apply only when the relationship is platonic. */
export function platonic(text: string, isPlatonic: boolean): string {
  return isPlatonic ? toPlatonic(text) : text;
}
