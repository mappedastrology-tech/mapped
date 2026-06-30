/**
 * Numerology meanings database — aggregator + typed accessors.
 *
 * The content lives in four sibling files (core, inner, cycles, karmic). This
 * module re-exports them and offers small helpers the UI can call without
 * worrying about missing keys.
 */

import type { Archetype } from "./numerologyMeanings.types";
import { CORE_ARCHETYPES, LIFE_PATH, EXPRESSION } from "./numerologyMeanings.core";
import { SOUL_URGE, PERSONALITY, BIRTHDAY, MATURITY } from "./numerologyMeanings.inner";
import { PERSONAL_YEAR, PINNACLE, CHALLENGE } from "./numerologyMeanings.cycles";
import {
  KARMIC_DEBT,
  KARMIC_LESSON,
  HIDDEN_PASSION,
  BALANCE,
  SUBCONSCIOUS_SELF,
  BRIDGE,
  SYSTEM_NOTES,
} from "./numerologyMeanings.karmic";

export {
  CORE_ARCHETYPES,
  LIFE_PATH,
  EXPRESSION,
  SOUL_URGE,
  PERSONALITY,
  BIRTHDAY,
  MATURITY,
  PERSONAL_YEAR,
  PINNACLE,
  CHALLENGE,
  KARMIC_DEBT,
  KARMIC_LESSON,
  HIDDEN_PASSION,
  BALANCE,
  SUBCONSCIOUS_SELF,
  BRIDGE,
  SYSTEM_NOTES,
};

export type { Archetype } from "./numerologyMeanings.types";

/** The archetype (title, keyword, essence, strengths, shadow) for any core number. */
export function getArchetype(n: number): Archetype | null {
  return CORE_ARCHETYPES[n] ?? null;
}

/** Human-readable label for a value, e.g. 11 → "11/2", 7 → "7". */
export function masterLabel(n: number): string {
  if (n === 11) return "11/2";
  if (n === 22) return "22/4";
  if (n === 33) return "33/6";
  return String(n);
}

const POSITION_MAP = {
  lifePath: LIFE_PATH,
  expression: EXPRESSION,
  soulUrge: SOUL_URGE,
  personality: PERSONALITY,
  birthday: BIRTHDAY,
  maturity: MATURITY,
  personalYear: PERSONAL_YEAR,
  pinnacle: PINNACLE,
  challenge: CHALLENGE,
  karmicLesson: KARMIC_LESSON,
  hiddenPassion: HIDDEN_PASSION,
  balance: BALANCE,
  subconsciousSelf: SUBCONSCIOUS_SELF,
  bridge: BRIDGE,
} as const;

export type PositionKey = keyof typeof POSITION_MAP;

/** Interpretation text for a number in a given position; empty string if absent. */
export function getMeaning(position: PositionKey, n: number): string {
  return POSITION_MAP[position][n] ?? "";
}
