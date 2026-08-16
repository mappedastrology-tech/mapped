/**
 * Shared synthetic-cohort sampler for the resonance harness. Both the validator
 * and the calibrator draw from this so they measure and tune the same
 * distribution. Realistic-ish: houses derive from the rising sign (whole-sign),
 * and the inner planets never stray far from the Sun — real charts aren't white
 * noise, and white noise flattens everyone to the population centroid.
 */

import type { ResonanceInput } from "../../src/lib/resonance/engine.ts";

export const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const AUTHORITIES = ["emotional", "sacral", "splenic", "ego", "self-projected", "mental", "lunar"];
// HD type population skew (spec §3.2).
const HD_TYPES: [string, number][] = [["Generator", 0.37], ["Manifesting Generator", 0.33], ["Projector", 0.20], ["Manifestor", 0.09], ["Reflector", 0.01]];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
function weighted(pairs: [string, number][]): string {
  let r = Math.random();
  for (const [v, w] of pairs) { if ((r -= w) <= 0) return v; }
  return pairs[pairs.length - 1][0];
}
function sampleNumber(): number {
  const r = Math.random();
  if (r < 0.04) return pick([11, 22, 33]);       // masters, rare
  return 1 + Math.floor(Math.random() * 9);       // 1..9
}

const SIGN_IDX = (s: string) => SIGNS.indexOf(s);
const IDX_SIGN = (i: number) => SIGNS[((i % 12) + 12) % 12];
const near = (base: string, span: number) => IDX_SIGN(SIGN_IDX(base) + (Math.floor(Math.random() * (2 * span + 1)) - span));
// Whole-sign houses: the rising sign is the 1st house, each following sign the next.
const wholeSignHouse = (sign: string, rising: string) => (((SIGN_IDX(sign) - SIGN_IDX(rising) + 12) % 12) + 1);

function samplePlacements(sun: string, moon: string, rising: string): { name: string; sign: string; house: number }[] {
  const signs: Record<string, string> = {
    Sun: sun,
    Moon: moon,
    Mercury: near(sun, 1),   // Mercury: within one sign of the Sun
    Venus: near(sun, 2),     // Venus: within two signs
    Mars: pick(SIGNS),
    Jupiter: pick(SIGNS),
    Saturn: pick(SIGNS),
    Uranus: pick(SIGNS),
    Neptune: pick(SIGNS),
    Pluto: pick(SIGNS),
    "North Node": pick(SIGNS),
    Chiron: pick(SIGNS),
  };
  return Object.entries(signs).map(([name, sign]) => ({ name, sign, house: wholeSignHouse(sign, rising) }));
}

export function sampleInput(): ResonanceInput {
  const sun = pick(SIGNS), moon = pick(SIGNS), rising = pick(SIGNS);
  return {
    sun, moon, rising,
    lifePath: sampleNumber(), expression: sampleNumber(), soulUrge: sampleNumber(),
    hdType: weighted(HD_TYPES),
    hdAuthority: pick(AUTHORITIES),
    hdLines: [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)] as [number, number],
    placements: samplePlacements(sun, moon, rising),
  };
}
