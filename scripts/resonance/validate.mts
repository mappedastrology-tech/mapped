/**
 * Resonance validation harness (spec §7).
 * Generates a synthetic cohort, runs it through the engine, and checks the gates:
 *   - No orphans:      every archetype wins primary for >= 0.4% of the cohort
 *   - No black holes:  no archetype exceeds 2.5%
 *   - Facet spread:    population std-dev per trait lands in 14..18
 *
 * Run:  npx tsx scripts/resonance/validate.mts [N]
 *
 * NOTE: v1 samples the FEATURE space directly (signs, numbers, HD) rather than
 * real birth timestamps. That's enough to surface orphans / black holes / spread;
 * upgrade to timestamp-sampling (spec §7.1) for the natural joint distribution.
 */

import { computeResonance, type ResonanceInput } from "../../src/lib/resonance/engine.ts";
import { ARCHETYPES } from "../../src/lib/resonance/archetypes.ts";
import { TRAIT_ORDER } from "../../src/lib/resonance/traits.ts";

const N = Number(process.argv[2] ?? 30000);

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
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

// Realistic-ish placement sampling. Random independent signs+houses for every
// body flattens distinctiveness (pure noise averages everyone to the centroid),
// which real charts don't do: houses derive from the rising sign, and the inner
// planets never stray far from the Sun. Model that so the cohort reflects real
// birth data rather than white noise.
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

function sampleInput(): ResonanceInput {
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

const counts = new Map<string, number>();
for (const a of ARCHETYPES) counts.set(a.id, 0);
const traitSums = Object.fromEntries(TRAIT_ORDER.map((t) => [t, 0])) as Record<string, number>;
const traitSq = Object.fromEntries(TRAIT_ORDER.map((t) => [t, 0])) as Record<string, number>;

for (let i = 0; i < N; i++) {
  const r = computeResonance(sampleInput());
  if (!r) continue;
  counts.set(r.primary.id, (counts.get(r.primary.id) ?? 0) + 1);
  for (const t of TRAIT_ORDER) { traitSums[t] += r.traits[t]; traitSq[t] += r.traits[t] * r.traits[t]; }
}

const shares = [...counts.entries()].map(([id, c]) => ({ id, name: ARCHETYPES.find((a) => a.id === id)!.name, pct: (100 * c) / N }));
shares.sort((a, b) => b.pct - a.pct);

const orphans = shares.filter((s) => s.pct < 0.4);
const blackHoles = shares.filter((s) => s.pct > 2.5);

const sigmas = TRAIT_ORDER.map((t) => {
  const mean = traitSums[t] / N;
  const varr = traitSq[t] / N - mean * mean;
  return { t, sd: Math.sqrt(Math.max(0, varr)) };
});
const avgSd = sigmas.reduce((s, x) => s + x.sd, 0) / sigmas.length;
const spreadOk = sigmas.filter((x) => x.sd >= 14 && x.sd <= 18).length;

console.log(`\nResonance validation — N=${N}, ${ARCHETYPES.length} archetypes\n`);
console.log(`Top 5:    ${shares.slice(0, 5).map((s) => `${s.name} ${s.pct.toFixed(2)}%`).join(" · ")}`);
console.log(`Bottom 5: ${shares.slice(-5).map((s) => `${s.name} ${s.pct.toFixed(2)}%`).join(" · ")}\n`);
console.log(`GATE no-black-holes (<=2.5%):  ${blackHoles.length === 0 ? "PASS" : "FAIL — " + blackHoles.map((s) => `${s.name} ${s.pct.toFixed(2)}%`).join(", ")}`);
console.log(`GATE no-orphans (>=0.4%):      ${orphans.length === 0 ? "PASS" : `FAIL — ${orphans.length} orphan(s): ` + orphans.slice(0, 12).map((s) => `${s.name} ${s.pct.toFixed(2)}%`).join(", ")}`);
console.log(`GATE facet-spread (sd 14..18): avg trait sd ${avgSd.toFixed(1)}; ${spreadOk}/24 traits in band ${spreadOk >= 18 ? "PASS" : "WARN"}`);
console.log("");

const failed = blackHoles.length > 0 || orphans.length > 0;
process.exit(failed ? 1 : 0);
