/**
 * Resonance engine (spec §4). Deterministic: same input → same output. Projects
 * a chart into the 24-trait space, then matches it against the 96 archetypes by
 * decorrelated cosine similarity. Pure — no I/O, no randomness, no AI.
 *
 * v1 scope: the archetype library, tiers 1–3 features. Distinctiveness weighting
 * (§4.4) and Mahalanobis (§4.3 full) are deferred; the ship-faster opposite-pair
 * down-weight is used instead.
 */

import {
  TraitId, TraitVec, TraitDeltas, TRAIT_ORDER, OPPOSITE_PAIRS,
  FacetId, FACET_ORDER, facetScores, zeroVec, TRAIT_PHRASE,
} from "./traits";
import { ARCHETYPES, Archetype } from "./archetypes";
import { getArchetypeContent, composeShading, type ArchetypeContent } from "./content";
import { archOffset, TRAIT_BASELINE, TRAIT_SPREAD } from "./calibration";
import {
  TIER_WEIGHT, SIGN_TRAITS, NUMBER_TRAITS, HD_TYPE_TRAITS,
  HD_AUTHORITY_TRAITS, HD_LINE_TRAITS, MASTER_TRAITS, KARMIC_TRAITS,
  HOUSE_TRAITS, ELEMENT_TRAITS, SIGN_ELEMENT, PLANET_SIGN_TIER, PLANET_HOUSE_TIER,
} from "./weights";

/** A single body from the full chart — a planet or special point by sign/house. */
export interface Placement {
  name: string;                     // "Sun", "Mercury", "North Node", "Chiron", …
  sign?: string | null;
  house?: number | null;            // 1–12
}

export interface ResonanceInput {
  sun?: string | null;
  moon?: string | null;
  rising?: string | null;
  lifePath?: number | null;
  expression?: number | null;
  soulUrge?: number | null;
  hdType?: string | null;
  hdAuthority?: string | null;      // AuthorityId
  hdLines?: [number, number] | null;
  hdDefinition?: string | null;     // e.g. "Single", "Split"
  masters?: number[];               // master numbers present (11/22/33)
  karmics?: number[];               // karmic debts present (13/14/16/19)
  placements?: Placement[];         // full chart: planets + special points by sign/house
}

/** Bodies counted toward the dominant-element tally (the ten traditional planets). */
const ELEMENT_BODIES = new Set([
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
]);

interface ExtractedFeature {
  id: string;
  label: string;
  tier: 1 | 2 | 3 | 4;
  deltas: TraitDeltas;
}

// Contrast knob (spec §4.2). After per-trait whitening the squash input is
// unit-variance, so TEMP is a single dimensionless width tuned for output sd ~16.
const TEMP = 1.4;
// Fallback per-trait spread used before calibration writes real values.
const SPREAD_FALLBACK = 24;

const TRAIT_WEIGHT: Record<TraitId, number> = (() => {
  const w = {} as Record<TraitId, number>;
  for (const t of TRAIT_ORDER) w[t] = 1;
  for (const [a, b] of OPPOSITE_PAIRS) { w[a] = 0.7; w[b] = 0.7; }
  return w;
})();

function feat(id: string, label: string, tier: 1 | 2 | 3 | 4, deltas?: TraitDeltas): ExtractedFeature | null {
  return deltas ? { id, label, tier, deltas } : null;
}

/** Flatten the chart into weighted features. */
export function extractFeatures(input: ResonanceInput): ExtractedFeature[] {
  const out: (ExtractedFeature | null)[] = [];

  if (input.sun) out.push(feat(`astro.sun.${input.sun}`, `${input.sun} Sun`, 1, SIGN_TRAITS[input.sun]));
  if (input.moon) out.push(feat(`astro.moon.${input.moon}`, `${input.moon} Moon`, 2, SIGN_TRAITS[input.moon]));
  if (input.rising) out.push(feat(`astro.rising.${input.rising}`, `${input.rising} Rising`, 2, SIGN_TRAITS[input.rising]));

  if (input.lifePath != null) out.push(feat(`num.lifepath.${input.lifePath}`, `Life Path ${input.lifePath}`, 1, NUMBER_TRAITS[input.lifePath]));
  if (input.expression != null) out.push(feat(`num.expression.${input.expression}`, `Expression ${input.expression}`, 2, NUMBER_TRAITS[input.expression]));
  if (input.soulUrge != null) out.push(feat(`num.soulurge.${input.soulUrge}`, `Soul Urge ${input.soulUrge}`, 3, NUMBER_TRAITS[input.soulUrge]));

  if (input.hdType) out.push(feat(`hd.type.${input.hdType}`, `${input.hdType}`, 1, HD_TYPE_TRAITS[input.hdType]));
  if (input.hdAuthority) {
    const key = input.hdAuthority.toLowerCase();
    out.push(feat(`hd.authority.${key}`, `${input.hdAuthority} Authority`, 2, HD_AUTHORITY_TRAITS[key]));
  }
  if (input.hdLines) {
    const [l1, l2] = input.hdLines;
    out.push(feat(`hd.line.${l1}`, `Profile line ${l1}`, 2, HD_LINE_TRAITS[l1]));
    if (l2 !== l1) out.push(feat(`hd.line.${l2}`, `Profile line ${l2}`, 2, HD_LINE_TRAITS[l2]));
  }
  if (input.hdDefinition) {
    const d = input.hdDefinition.toLowerCase();
    if (d.includes("single")) out.push(feat("hd.def.single", "Single definition", 3, { autonomy: 10 }));
    else if (d.includes("split")) out.push(feat("hd.def.split", "Split definition", 3, { adaptability: 12 }));
  }
  if (input.masters?.length) out.push(feat("num.master", `Master number ${input.masters.join("/")}`, 3, MASTER_TRAITS));
  if (input.karmics?.length) out.push(feat("num.karmic", `Karmic debt ${input.karmics.join("/")}`, 4, KARMIC_TRAITS));

  // Full chart — planet-by-sign, planet-by-house, and dominant-element balance.
  // These populate trait regions the Big-3 alone can't reach (houses are the
  // individual life-area layer; outer planets by house, nodes, Chiron).
  if (input.placements?.length) {
    const elementCount: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };

    for (const p of input.placements) {
      const sign = p.sign ?? undefined;
      const house = toHouse(p.house);

      // Planet-by-sign (personal planets + Jupiter/Saturn; Sun/Moon/Rising already
      // come from the Big 3, outer-planet signs are generational and skipped).
      const signTier = PLANET_SIGN_TIER[p.name];
      if (signTier && sign && SIGN_TRAITS[sign]) {
        out.push(feat(`astro.${p.name}.sign.${sign}`, `${sign} ${p.name}`, signTier, SIGN_TRAITS[sign]));
      }

      // North Node by sign — the karmic direction (tier 3), even though it isn't
      // in PLANET_SIGN_TIER's personal set.
      if (p.name === "North Node" && sign && SIGN_TRAITS[sign]) {
        out.push(feat(`astro.northnode.sign.${sign}`, `North Node in ${sign}`, 3, SIGN_TRAITS[sign]));
      }

      // Planet-by-house — the life area a body emphasises.
      const houseTier = PLANET_HOUSE_TIER[p.name];
      if (houseTier && house && HOUSE_TRAITS[house]) {
        out.push(feat(`astro.${p.name}.house.${house}`, `${p.name} in the ${ordinal(house)} house`, houseTier, HOUSE_TRAITS[house]));
      }

      // Element tally from the ten traditional planets.
      if (ELEMENT_BODIES.has(p.name) && sign) {
        const el = SIGN_ELEMENT[sign];
        if (el) elementCount[el] += 1;
      }
    }

    // Dominant element (needs a clear lead: ≥4 bodies and strictly ahead).
    let domEl = ""; let domN = 0; let tie = false;
    for (const el of Object.keys(elementCount)) {
      if (elementCount[el] > domN) { domEl = el; domN = elementCount[el]; tie = false; }
      else if (elementCount[el] === domN) { tie = true; }
    }
    if (domEl && domN >= 4 && !tie && ELEMENT_TRAITS[domEl]) {
      out.push(feat(`astro.element.${domEl}`, `${cap(domEl)}-dominant chart`, 3, ELEMENT_TRAITS[domEl]));
    }
  }

  return out.filter((f): f is ExtractedFeature => f != null);
}

function toHouse(h: number | null | undefined): number | null {
  const n = Number(h);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : null;
}

const ORDINALS = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
function ordinal(n: number): string { return ORDINALS[n] ?? `${n}th`; }
function cap(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

/** Sum the weighted feature deltas into a raw (pre-squash) trait vector. */
function rawSums(features: ExtractedFeature[]): TraitVec {
  const raw = zeroVec();
  for (const f of features) {
    const w = TIER_WEIGHT[f.tier];
    for (const t of TRAIT_ORDER) raw[t] += (f.deltas[t] ?? 0) * w;
  }
  return raw;
}

/**
 * Squash raw sums to the 0–100 trait space, standardised per trait. The hand-
 * authored deltas lean net-positive and cover traits unevenly, so without
 * correction (a) the population piles up high on many traits (everyone reads
 * "magnetic"/"caring") and (b) heavily-fed traits (order, endurance) swing far
 * wider than sparsely-fed ones (memory, transformation). Subtracting the baked
 * per-trait baseline (cohort mean) re-centres everyone at 50, and dividing by
 * the baked per-trait spread (cohort σ) equalises the width — so every trait
 * reads on the same scale and the radar is legible. Both maps default to a
 * neutral fallback before calibration runs.
 */
function squash(
  raw: TraitVec,
  baseline: Partial<Record<TraitId, number>>,
  spread: Partial<Record<TraitId, number>>,
): TraitVec {
  const traits = {} as TraitVec;
  for (const t of TRAIT_ORDER) {
    const s = spread[t] || SPREAD_FALLBACK;
    const z = (raw[t] - (baseline[t] ?? 0)) / s;
    traits[t] = Math.round(100 / (1 + Math.exp(-z / TEMP)));
  }
  return traits;
}

/** Raw (pre-squash) trait sums for one input — exposed for the calibrator's baseline pass. */
export function rawTraitSums(input: ResonanceInput): TraitVec {
  return rawSums(extractFeatures(input));
}

/** Full 0–100 trait vector under an explicit baseline+spread — for the calibrator's animal pass. */
export function traitsWithBaseline(
  input: ResonanceInput,
  baseline: Partial<Record<TraitId, number>>,
  spread: Partial<Record<TraitId, number>>,
): TraitVec | null {
  const features = extractFeatures(input);
  if (features.length === 0) return null;
  return squash(rawSums(features), baseline, spread);
}

/**
 * Distinctiveness weighting (spec §4.4). Amplify traits where the user deviates
 * from population-typical (50) and mute traits where they're average — so a
 * match lands on what makes someone unusual, not what everyone shares. v1 uses a
 * fixed spread proxy (12) rather than baked per-trait population σ; capped at 3×.
 */
function salienced(user: TraitVec): number[] {
  return TRAIT_ORDER.map((t) => {
    const dev = user[t] - 50;
    const sal = 1 + 0.9 * Math.min(Math.abs(dev) / 10, 3);
    return sal * dev;
  });
}

/**
 * Archetype-population mean per trait. The 96 archetypes aren't centred on 50 —
 * DOMAIN_BASE / MODE_MOD lean net-positive on common traits, so the archetype
 * cloud has an off-centre centroid. Comparing a user against `entry - 50` lets
 * whichever archetype sits nearest that centroid (path×sovereign, "The Road")
 * absorb everyone in the mushy middle while specialists stay unreachable.
 * Centring each archetype on the *archetype* mean removes that bias so a match
 * lands on the axes where an archetype is genuinely distinctive.
 */
/** Decorrelated cosine over the salience-weighted user vector vs a centred entry. */
function similarity(salUser: number[], entry: TraitVec): number {
  let dot = 0, nu = 0, ne = 0;
  TRAIT_ORDER.forEach((t, i) => {
    const w = TRAIT_WEIGHT[t];
    const u = salUser[i], e = entry[t] - 50;
    dot += w * u * e; nu += w * u * u; ne += w * e * e;
  });
  if (nu === 0 || ne === 0) return 0;
  return dot / (Math.sqrt(nu) * Math.sqrt(ne));
}

function facetDiff(a: TraitVec, b: TraitVec): number {
  const fa = facetScores(a), fb = facetScores(b);
  let n = 0;
  for (const f of FACET_ORDER) if (Math.abs(fa[f] - fb[f]) >= 12) n++;
  return n;
}

export interface EvidenceLine { feature: string; trait: TraitId; copy: string; }

export interface ResonanceResult {
  primary: { id: string; name: string; tagline: string; score: number; content: ArchetypeContent | null };
  secondary: { id: string; name: string; tagline: string; score: number; content: ArchetypeContent | null; shading: string | null } | null;
  traits: TraitVec;
  facets: Record<FacetId, number>;
  signature: string;
  evidence: EvidenceLine[];
  engineVersion: string;
}

export const ENGINE_VERSION = "1.1.0"; // full chart + balanced-assignment calibration
export const DATA_VERSION = "archetypes@1.1.0";

function dominantTrait(deltas: TraitDeltas): TraitId {
  let best: TraitId = TRAIT_ORDER[0], mag = -1;
  for (const t of TRAIT_ORDER) {
    const m = Math.abs(deltas[t] ?? 0);
    if (m > mag) { mag = m; best = t; }
  }
  return best;
}

function sig4(name: string): string {
  return name.replace(/^The\s+/i, "").slice(0, 4).toUpperCase();
}

/**
 * Per-archetype cosine similarity for one input under a given trait baseline.
 * Uncalibrated (no offsets). Exposed for the offline calibrator (spec §4.6),
 * which sweeps baselines and solves the offsets; the app ranks with the baked
 * baseline + offsets in computeResonance below.
 */
export function scoresWithBaseline(
  input: ResonanceInput,
  baseline: Partial<Record<TraitId, number>>,
  spread: Partial<Record<TraitId, number>>,
): { id: string; s: number }[] {
  const features = extractFeatures(input);
  if (features.length === 0) return [];
  const traits = squash(rawSums(features), baseline, spread);
  const salUser = salienced(traits);
  return ARCHETYPES.map((a: Archetype) => ({ id: a.id, s: similarity(salUser, a.traits) }));
}

/**
 * Rank any content library (archetypes, animal guides, …) against a user's
 * trait vector by the same decorrelated-cosine + salience match the archetypes
 * use — the engine is library-agnostic (spec §4). `offset` optionally applies a
 * per-entry balancing price (as computeResonance does for archetypes).
 */
export function rankLibrary(
  userTraits: TraitVec,
  entries: { id: string; traits: TraitVec }[],
  offset?: (id: string) => number,
): { id: string; s: number; cal: number }[] {
  const salUser = salienced(userTraits);
  return entries
    .map((e) => {
      const s = similarity(salUser, e.traits);
      return { id: e.id, s, cal: s - (offset?.(e.id) ?? 0) };
    })
    .sort((a, b) => b.cal - a.cal);
}

export function computeResonance(input: ResonanceInput): ResonanceResult | null {
  const features = extractFeatures(input);
  if (features.length === 0) return null;

  const traits = squash(rawSums(features), TRAIT_BASELINE, TRAIT_SPREAD);
  const facets = facetScores(traits);

  const salUser = salienced(traits);
  // Rank by the calibrated score (raw similarity minus the archetype's balancing
  // offset) so the 96 cells stay evenly reachable; keep the raw similarity `s`
  // for the displayed match strength.
  const ranked = ARCHETYPES
    .map((a: Archetype) => {
      const s = similarity(salUser, a.traits);
      return { a, s, cal: s - archOffset(a.id) };
    })
    .sort((x, y) => y.cal - x.cal);

  const primary = ranked[0];
  // Secondary must differ from primary in ≥2 facets (spec §4.7 diversity rule).
  const secondary = ranked.slice(1).find((r) => facetDiff(primary.a.traits, r.a.traits) >= 2) ?? ranked[1] ?? null;

  // Evidence: strongest contributing features, most impactful first.
  const evidence: EvidenceLine[] = [...features]
    .sort((a, b) => {
      const mag = (f: ExtractedFeature) =>
        TRAIT_ORDER.reduce((s, t) => s + Math.abs(f.deltas[t] ?? 0), 0) * TIER_WEIGHT[f.tier];
      return mag(b) - mag(a);
    })
    .slice(0, 4)
    .map((f) => {
      const trait = dominantTrait(f.deltas);
      return { feature: f.label, trait, copy: `${f.label} — ${TRAIT_PHRASE[trait]}.` };
    });

  const topFacets = [...FACET_ORDER].sort((a, b) => facets[b] - facets[a]);
  const signature = `${sig4(primary.a.name)}-${secondary ? sig4(secondary.a.name) : "SOLO"}-${topFacets[0]}${facets[topFacets[0]]}-${topFacets[1]}${facets[topFacets[1]]}-v1`;

  return {
    primary: { id: primary.a.id, name: primary.a.name, tagline: primary.a.tagline, score: Math.round(primary.s * 100), content: getArchetypeContent(primary.a.id) },
    secondary: secondary ? {
      id: secondary.a.id,
      name: secondary.a.name,
      tagline: secondary.a.tagline,
      score: Math.round(secondary.s * 100),
      content: getArchetypeContent(secondary.a.id),
      shading: composeShading(primary.a.name, secondary.a.id),
    } : null,
    traits,
    facets,
    signature,
    evidence,
    engineVersion: ENGINE_VERSION,
  };
}
