/**
 * Archetype engine — reduces a user's cross-system signature to one of 20
 * archetypes. Deterministic and total: any combination of inputs resolves to a
 * single archetype (element × stance). Missing systems degrade gracefully.
 */

import { ARCHETYPES } from "./data";
import type { ArchetypeContent, Element, Stance } from "./types";

const FIRE = ["Aries", "Leo", "Sagittarius"];
const EARTH = ["Taurus", "Virgo", "Capricorn"];
const AIR = ["Gemini", "Libra", "Aquarius"];
const WATER = ["Cancer", "Scorpio", "Pisces"];
const CARDINAL = ["Aries", "Cancer", "Libra", "Capricorn"];
const FIXED = ["Taurus", "Leo", "Scorpio", "Aquarius"];
const MUTABLE = ["Gemini", "Virgo", "Sagittarius", "Pisces"];

export function signElement(sign?: string | null): Element | null {
  if (!sign) return null;
  if (FIRE.includes(sign)) return "fire";
  if (EARTH.includes(sign)) return "earth";
  if (AIR.includes(sign)) return "air";
  if (WATER.includes(sign)) return "water";
  return null;
}

export function signModality(sign?: string | null): "cardinal" | "fixed" | "mutable" | null {
  if (!sign) return null;
  if (CARDINAL.includes(sign)) return "cardinal";
  if (FIXED.includes(sign)) return "fixed";
  if (MUTABLE.includes(sign)) return "mutable";
  return null;
}

/** Numerology life-path → elemental leaning. */
const LIFE_PATH_ELEMENT: Record<number, Element> = {
  1: "fire",
  2: "water",
  3: "air",
  4: "earth",
  5: "air",
  6: "water",
  7: "water",
  8: "earth",
  9: "fire",
  11: "air",
  22: "earth",
  33: "fire",
};

/** Numerology life-path → stance (used when Human Design type is unavailable). */
const LIFE_PATH_STANCE: Record<number, Stance> = {
  1: "initiator",
  8: "initiator",
  4: "cultivator",
  6: "cultivator",
  22: "cultivator",
  3: "catalyst",
  5: "catalyst",
  7: "guide",
  9: "guide",
  11: "guide",
  33: "guide",
  2: "mirror",
};

const HD_STANCE: Record<string, Stance> = {
  Manifestor: "initiator",
  Generator: "cultivator",
  "Manifesting Generator": "catalyst",
  Projector: "guide",
  Reflector: "mirror",
};

export interface ArchetypeInput {
  sunSign?: string | null;
  moonSign?: string | null;
  risingSign?: string | null;
  lifePath?: number | null;
  hdType?: string | null;
  palmElement?: Element | null;
}

export interface ArchetypeResult {
  id: string;
  element: Element;
  stance: Stance;
  elementScores: Record<Element, number>;
  stanceSource: "humanDesign" | "numerology" | "astrology";
  archetype: ArchetypeContent;
}

function dominantElement(input: ArchetypeInput): { element: Element; scores: Record<Element, number> } {
  const scores: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const add = (el: Element | null, weight: number) => {
    if (el) scores[el] += weight;
  };
  add(signElement(input.sunSign), 3);
  add(signElement(input.moonSign), 2);
  add(signElement(input.risingSign), 2);
  if (input.lifePath != null && LIFE_PATH_ELEMENT[input.lifePath]) add(LIFE_PATH_ELEMENT[input.lifePath], 2);
  add(input.palmElement ?? null, 2);

  // Pick the highest; tie-break prefers the Sun's element, then a fixed order.
  const order: Element[] = ["fire", "earth", "air", "water"];
  const sunEl = signElement(input.sunSign);
  let best: Element = sunEl ?? "fire";
  let bestScore = -1;
  for (const el of order) {
    const s = scores[el];
    if (s > bestScore || (s === bestScore && el === sunEl)) {
      best = el;
      bestScore = s;
    }
  }
  // If nothing scored at all, default fire.
  if (bestScore <= 0 && sunEl) best = sunEl;
  return { element: best, scores };
}

function resolveStance(input: ArchetypeInput): { stance: Stance; source: ArchetypeResult["stanceSource"] } {
  if (input.hdType && HD_STANCE[input.hdType]) {
    return { stance: HD_STANCE[input.hdType], source: "humanDesign" };
  }
  if (input.lifePath != null && LIFE_PATH_STANCE[input.lifePath]) {
    return { stance: LIFE_PATH_STANCE[input.lifePath], source: "numerology" };
  }
  // Astrology modality fallback.
  const mods = [input.sunSign, input.moonSign, input.risingSign]
    .map(signModality)
    .filter(Boolean) as ("cardinal" | "fixed" | "mutable")[];
  const counts = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const m of mods) counts[m] += 1;
  const top = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "cardinal") as
    | "cardinal"
    | "fixed"
    | "mutable";
  const map: Record<string, Stance> = { cardinal: "initiator", fixed: "cultivator", mutable: "catalyst" };
  return { stance: map[top], source: "astrology" };
}

export function computeArchetype(input: ArchetypeInput): ArchetypeResult {
  const { element, scores } = dominantElement(input);
  const { stance, source } = resolveStance(input);
  const id = `${element}-${stance}`;
  return {
    id,
    element,
    stance,
    elementScores: scores,
    stanceSource: source,
    archetype: ARCHETYPES[id],
  };
}

export function getArchetype(id: string): ArchetypeContent | null {
  return ARCHETYPES[id] ?? null;
}
