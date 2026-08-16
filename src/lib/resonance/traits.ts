/**
 * Resonance Engine — the 24-trait / 6-facet trait space.
 * Per the Resonance Engine spec §2. Every chart feature and every archetype is
 * a vector over these 24 traits, grouped into 6 facets (which render as a
 * hexagonal radar). Each trait is 0–100 where 50 is population-typical.
 */

export type FacetId = "drive" | "mind" | "bond" | "voice" | "form" | "depth";

export type TraitId =
  // DRIVE
  | "initiative" | "endurance" | "intensity" | "stillness"
  // MIND
  | "analysis" | "intuition" | "vision" | "memory"
  // BOND
  | "loyalty" | "autonomy" | "magnetism" | "care"
  // VOICE
  | "expression" | "craft" | "display" | "concealment"
  // FORM
  | "order" | "disruption" | "adaptability" | "sovereignty"
  // DEPTH
  | "shadow" | "transcendence" | "embodiment" | "transformation";

export const FACET_ORDER: FacetId[] = ["drive", "mind", "bond", "voice", "form", "depth"];

export const FACET_TRAITS: Record<FacetId, TraitId[]> = {
  drive: ["initiative", "endurance", "intensity", "stillness"],
  mind: ["analysis", "intuition", "vision", "memory"],
  bond: ["loyalty", "autonomy", "magnetism", "care"],
  voice: ["expression", "craft", "display", "concealment"],
  form: ["order", "disruption", "adaptability", "sovereignty"],
  depth: ["shadow", "transcendence", "embodiment", "transformation"],
};

export const FACET_LABEL: Record<FacetId, string> = {
  drive: "Drive",
  mind: "Mind",
  bond: "Bond",
  voice: "Voice",
  form: "Form",
  depth: "Depth",
};

export const TRAIT_ORDER: TraitId[] = FACET_ORDER.flatMap((f) => FACET_TRAITS[f]);

/** Natural opposites — down-weighted in the distance metric so they aren't double-counted (spec §4.3, ship-faster option). */
export const OPPOSITE_PAIRS: [TraitId, TraitId][] = [
  ["initiative", "stillness"],
  ["loyalty", "autonomy"],
  ["display", "concealment"],
  ["order", "disruption"],
];

/** Short human phrase per trait — used to compose evidence lines. */
export const TRAIT_PHRASE: Record<TraitId, string> = {
  initiative: "moves first, doesn't wait",
  endurance: "sustains and finishes",
  intensity: "runs all-or-nothing",
  stillness: "holds power in non-action",
  analysis: "reasons in patterns and proof",
  intuition: "knows in the body, instantly",
  vision: "faces the future and the possible",
  memory: "keeps lineage and precedent",
  loyalty: "defends the pack",
  autonomy: "is self-sufficient, refuses to merge",
  magnetism: "draws people in",
  care: "tends, heals, and protects",
  expression: "speaks, writes, and names",
  craft: "makes with the hands, masters form",
  display: "performs and is seen",
  concealment: "works unseen, withholds",
  order: "systematises and measures",
  disruption: "breaks and overturns",
  adaptability: "shapeshifts and improvises",
  sovereignty: "rules the self, holds the boundary",
  shadow: "metabolises darkness and taboo",
  transcendence: "reaches for spirit and the beyond",
  embodiment: "lives in the senses and the earth",
  transformation: "moves through death and rebirth",
};

export type TraitVec = Record<TraitId, number>;
export type TraitDeltas = Partial<Record<TraitId, number>>;

export function zeroVec(): TraitVec {
  const v = {} as TraitVec;
  for (const t of TRAIT_ORDER) v[t] = 0;
  return v;
}

export function facetScores(traits: TraitVec): Record<FacetId, number> {
  const out = {} as Record<FacetId, number>;
  for (const f of FACET_ORDER) {
    const ts = FACET_TRAITS[f];
    out[f] = Math.round(ts.reduce((s, t) => s + traits[t], 0) / ts.length);
  }
  return out;
}
