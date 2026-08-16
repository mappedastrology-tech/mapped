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
import { getArchetypeContent, type ArchetypeContent } from "./content";
import {
  TIER_WEIGHT, SIGN_TRAITS, NUMBER_TRAITS, HD_TYPE_TRAITS,
  HD_AUTHORITY_TRAITS, HD_LINE_TRAITS, MASTER_TRAITS, KARMIC_TRAITS,
} from "./weights";

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
}

interface ExtractedFeature {
  id: string;
  label: string;
  tier: 1 | 2 | 3 | 4;
  deltas: TraitDeltas;
}

const SIGMA = 45; // contrast knob (spec §4.2)

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

  return out.filter((f): f is ExtractedFeature => f != null);
}

/** Build the 0–100 trait vector from features. */
function buildTraits(features: ExtractedFeature[]): TraitVec {
  const raw = zeroVec();
  for (const f of features) {
    const w = TIER_WEIGHT[f.tier];
    for (const t of TRAIT_ORDER) raw[t] += (f.deltas[t] ?? 0) * w;
  }
  const traits = {} as TraitVec;
  for (const t of TRAIT_ORDER) traits[t] = Math.round(100 / (1 + Math.exp(-raw[t] / SIGMA)));
  return traits;
}

/** Decorrelated cosine over the centred (deviation-from-50) vectors. */
function similarity(user: TraitVec, entry: TraitVec): number {
  let dot = 0, nu = 0, ne = 0;
  for (const t of TRAIT_ORDER) {
    const w = TRAIT_WEIGHT[t];
    const u = user[t] - 50, e = entry[t] - 50;
    dot += w * u * e; nu += w * u * u; ne += w * e * e;
  }
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
  secondary: { id: string; name: string; tagline: string; score: number } | null;
  traits: TraitVec;
  facets: Record<FacetId, number>;
  signature: string;
  evidence: EvidenceLine[];
  engineVersion: string;
}

const ENGINE_VERSION = "1.0.0";

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

export function computeResonance(input: ResonanceInput): ResonanceResult | null {
  const features = extractFeatures(input);
  if (features.length === 0) return null;

  const traits = buildTraits(features);
  const facets = facetScores(traits);

  const ranked = ARCHETYPES
    .map((a: Archetype) => ({ a, s: similarity(traits, a.traits) }))
    .sort((x, y) => y.s - x.s);

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
    secondary: secondary ? { id: secondary.a.id, name: secondary.a.name, tagline: secondary.a.tagline, score: Math.round(secondary.s * 100) } : null,
    traits,
    facets,
    signature,
    evidence,
    engineVersion: ENGINE_VERSION,
  };
}
