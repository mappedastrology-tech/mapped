/**
 * Shared types for the numerology meanings database.
 *
 * VOICE: warm, literate, mystical-but-grounded, speaking to a smart adult. Sincere
 * about the symbolic tradition — never skeptical, never debunking, no "this is just
 * for fun" hedging. Confident and specific. Second person ("you") for the
 * personal positions. Each entry should feel written by a thoughtful numerologist,
 * not a horoscope generator.
 */

/** A core number's archetype — the heart of its symbolism. */
export interface Archetype {
  number: number;
  /** e.g. "The Leader" */
  title: string;
  /** A few comma-separated keywords. */
  keyword: string;
  /** 1–2 sentences capturing the number's essence. */
  essence: string;
  /** The number's gifts, as a short phrase or sentence. */
  strengths: string;
  /** The number's shadow side, as a short phrase or sentence. */
  shadow: string;
}

/** A number → interpretive paragraph map for a given chart position. */
export type PositionMeanings = Record<number, string>;

export interface KarmicDebtMeaning {
  title: string;
  text: string;
}
