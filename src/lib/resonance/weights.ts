/**
 * FEATURE_WEIGHTS — hand-authored map from a chart feature to trait deltas
 * (spec §4.2). Tier weights scale how much each feature contributes. v1 covers
 * the features we can extract from stored astrology + the existing Human Design
 * and numerology engines (spec tiers 1–3, plus master/karmic modifiers).
 */

import { TraitDeltas } from "./traits";

export const TIER_WEIGHT: Record<1 | 2 | 3 | 4, number> = { 1: 1.0, 2: 0.65, 3: 0.4, 4: 0.18 };

/** Per-sign trait profile — applied to Sun (tier 1), Moon & Rising (tier 2). */
export const SIGN_TRAITS: Record<string, TraitDeltas> = {
  Aries: { initiative: 26, intensity: 16, disruption: 10, display: 8, stillness: -14 },
  Taurus: { endurance: 22, embodiment: 20, order: 12, stillness: 12, craft: 10, disruption: -12 },
  Gemini: { expression: 20, adaptability: 18, analysis: 12, vision: 10, endurance: -8 },
  Cancer: { care: 22, intuition: 16, memory: 14, loyalty: 12, concealment: 8, display: -8 },
  Leo: { display: 24, magnetism: 18, initiative: 12, sovereignty: 12, expression: 10, concealment: -14 },
  Virgo: { order: 22, analysis: 18, craft: 16, care: 8, display: -10, disruption: -8 },
  Libra: { magnetism: 16, order: 12, expression: 12, adaptability: 10, care: 10, autonomy: -8, disruption: -8 },
  Scorpio: { shadow: 24, intensity: 20, transformation: 20, concealment: 18, display: -12 },
  Sagittarius: { vision: 20, transcendence: 16, adaptability: 14, initiative: 12, autonomy: 10, order: -10 },
  Capricorn: { order: 22, endurance: 20, sovereignty: 18, craft: 10, display: -8, disruption: -10 },
  Aquarius: { disruption: 18, autonomy: 18, vision: 16, analysis: 12, sovereignty: 8, care: -6 },
  Pisces: { transcendence: 22, intuition: 18, care: 16, concealment: 8, order: -12, embodiment: -8 },
};

/** Per-number trait profile — Life Path (tier 1), Expression (tier 2), Soul Urge (tier 3). */
export const NUMBER_TRAITS: Record<number, TraitDeltas> = {
  1: { initiative: 24, autonomy: 18, sovereignty: 14, stillness: -12 },
  2: { care: 20, stillness: 16, loyalty: 16, intuition: 12, disruption: -12, initiative: -10 },
  3: { expression: 24, display: 18, magnetism: 14, vision: 10, order: -8 },
  4: { order: 24, endurance: 20, craft: 14, disruption: -14, adaptability: -10 },
  5: { adaptability: 24, disruption: 14, initiative: 12, embodiment: 10, order: -12, endurance: -8 },
  6: { care: 24, loyalty: 16, order: 10, magnetism: 8, autonomy: -12 },
  7: { analysis: 24, transcendence: 20, autonomy: 18, concealment: 12, display: -14 },
  8: { sovereignty: 22, order: 16, endurance: 14, initiative: 12, care: -8 },
  9: { transcendence: 18, care: 16, vision: 14, magnetism: 12, autonomy: 8 },
  11: { transcendence: 24, vision: 20, intuition: 16, display: -8 },
  22: { order: 20, craft: 18, vision: 16, endurance: 14, sovereignty: 10 },
  33: { care: 24, transcendence: 18, expression: 12, magnetism: 10 },
};

/** Human Design type (tier 1). */
export const HD_TYPE_TRAITS: Record<string, TraitDeltas> = {
  Manifestor: { initiative: 26, autonomy: 20, disruption: 16, sovereignty: 14, endurance: -12, stillness: -10 },
  Generator: { endurance: 24, embodiment: 14, loyalty: 10, craft: 10, stillness: 6 },
  "Manifesting Generator": { endurance: 18, adaptability: 18, initiative: 14, intensity: 10, stillness: -8 },
  Projector: { intuition: 18, analysis: 14, stillness: 12, magnetism: 12, endurance: -14, display: 6 },
  Reflector: { adaptability: 22, stillness: 18, intuition: 14, autonomy: 10, endurance: -10, order: -8 },
};

/** Human Design authority (tier 2). Keyed by lowercased AuthorityId. */
export const HD_AUTHORITY_TRAITS: Record<string, TraitDeltas> = {
  emotional: { intensity: 12, stillness: 10, care: 8 },
  sacral: { embodiment: 14, endurance: 12, intuition: 8 },
  splenic: { intuition: 20, stillness: 8, analysis: 6 },
  ego: { sovereignty: 14, magnetism: 10, initiative: 8 },
  "self-projected": { expression: 14, display: 8, autonomy: 8 },
  self: { expression: 14, display: 8, autonomy: 8 },
  mental: { analysis: 14, vision: 10, concealment: 6 },
  lunar: { adaptability: 14, stillness: 12, intuition: 8 },
};

/** Human Design profile lines 1–6 (tier 2, each line scored). */
export const HD_LINE_TRAITS: Record<number, TraitDeltas> = {
  1: { analysis: 16, order: 10, concealment: 8 },
  2: { stillness: 14, autonomy: 12, concealment: 8 },
  3: { adaptability: 16, disruption: 10, embodiment: 8 },
  4: { loyalty: 14, magnetism: 12, care: 8 },
  5: { magnetism: 14, disruption: 10, display: 8, expression: 8 },
  6: { sovereignty: 12, vision: 12, stillness: 8 },
};

/** Master-number modifier (tier 3) and karmic-debt modifier (tier 4). */
export const MASTER_TRAITS: TraitDeltas = { transcendence: 12, vision: 10, intuition: 6 };
export const KARMIC_TRAITS: TraitDeltas = { shadow: 12, transformation: 10, intensity: 6 };
