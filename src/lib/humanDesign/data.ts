/**
 * Human Design structural constants — the fixed data of the BodyGraph:
 * the Rave Mandala gate wheel, the 64 gates → 9 centers map, the 36 channels,
 * and the per-type strategy/authority/profile tables.
 *
 * Sources cross-checked against Jovian Archive, Genetic Matrix, aHumanDesign,
 * and the open-source hdkit (gate wheel order + 58° offset). See the research
 * notes in the engine for citations.
 */

export type CenterId =
  | "head"
  | "ajna"
  | "throat"
  | "g"
  | "heart"
  | "sacral"
  | "solarPlexus"
  | "spleen"
  | "root";

export const CENTER_ORDER: CenterId[] = [
  "head",
  "ajna",
  "throat",
  "g",
  "heart",
  "sacral",
  "solarPlexus",
  "spleen",
  "root",
];

export const CENTER_NAMES: Record<CenterId, string> = {
  head: "Head",
  ajna: "Ajna",
  throat: "Throat",
  g: "G / Identity",
  heart: "Heart / Will",
  sacral: "Sacral",
  solarPlexus: "Solar Plexus",
  spleen: "Spleen",
  root: "Root",
};

/** The four motor centers (used for Type + Authority logic). */
export const MOTOR_CENTERS: CenterId[] = ["sacral", "solarPlexus", "heart", "root"];

/** Each center's gates (all 64 gates assigned to exactly one center). */
export const CENTER_GATES: Record<CenterId, number[]> = {
  head: [61, 63, 64],
  ajna: [4, 11, 17, 24, 43, 47],
  throat: [8, 12, 16, 20, 23, 31, 33, 35, 45, 56, 62],
  g: [1, 2, 7, 10, 13, 15, 25, 46],
  heart: [21, 26, 40, 51],
  sacral: [3, 5, 9, 14, 27, 29, 34, 42, 59],
  solarPlexus: [6, 22, 30, 36, 37, 49, 55],
  spleen: [18, 28, 32, 44, 48, 50, 57],
  root: [19, 38, 39, 41, 52, 53, 54, 58, 60],
};

/** Reverse lookup: gate number → center id. Built once. */
export const GATE_TO_CENTER: Record<number, CenterId> = (() => {
  const map: Record<number, CenterId> = {};
  for (const center of CENTER_ORDER) {
    for (const gate of CENTER_GATES[center]) map[gate] = center;
  }
  return map;
})();

export interface ChannelDef {
  gates: [number, number];
  centers: [CenterId, CenterId];
}

/** The 36 channels: each connects two gates across two centers. */
export const CHANNELS: ChannelDef[] = [
  { gates: [1, 8], centers: ["g", "throat"] },
  { gates: [2, 14], centers: ["g", "sacral"] },
  { gates: [3, 60], centers: ["sacral", "root"] },
  { gates: [4, 63], centers: ["ajna", "head"] },
  { gates: [5, 15], centers: ["sacral", "g"] },
  { gates: [6, 59], centers: ["solarPlexus", "sacral"] },
  { gates: [7, 31], centers: ["g", "throat"] },
  { gates: [9, 52], centers: ["sacral", "root"] },
  { gates: [10, 20], centers: ["g", "throat"] },
  { gates: [10, 34], centers: ["g", "sacral"] },
  { gates: [10, 57], centers: ["g", "spleen"] },
  { gates: [11, 56], centers: ["ajna", "throat"] },
  { gates: [12, 22], centers: ["throat", "solarPlexus"] },
  { gates: [13, 33], centers: ["g", "throat"] },
  { gates: [16, 48], centers: ["throat", "spleen"] },
  { gates: [17, 62], centers: ["ajna", "throat"] },
  { gates: [18, 58], centers: ["spleen", "root"] },
  { gates: [19, 49], centers: ["root", "solarPlexus"] },
  { gates: [20, 34], centers: ["throat", "sacral"] },
  { gates: [20, 57], centers: ["throat", "spleen"] },
  { gates: [21, 45], centers: ["heart", "throat"] },
  { gates: [23, 43], centers: ["throat", "ajna"] },
  { gates: [24, 61], centers: ["ajna", "head"] },
  { gates: [25, 51], centers: ["g", "heart"] },
  { gates: [26, 44], centers: ["heart", "spleen"] },
  { gates: [27, 50], centers: ["sacral", "spleen"] },
  { gates: [28, 38], centers: ["spleen", "root"] },
  { gates: [29, 46], centers: ["sacral", "g"] },
  { gates: [30, 41], centers: ["solarPlexus", "root"] },
  { gates: [32, 54], centers: ["spleen", "root"] },
  { gates: [34, 57], centers: ["sacral", "spleen"] },
  { gates: [35, 36], centers: ["throat", "solarPlexus"] },
  { gates: [37, 40], centers: ["solarPlexus", "heart"] },
  { gates: [39, 55], centers: ["root", "solarPlexus"] },
  { gates: [42, 53], centers: ["sacral", "root"] },
  { gates: [47, 64], centers: ["ajna", "head"] },
];

/**
 * Rave Mandala wheel order — the 64 gates in order of increasing ecliptic
 * longitude, starting at the wheel's zero point (Gate 41 at 2° Aquarius = 302°).
 * A longitude is rotated by +58° (mod 360) before indexing, so 0° Aries maps
 * into the wheel correctly.
 */
export const GATE_WHEEL: number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];

/** The 13 activation bodies in BodyGraph order. */
export const HD_BODIES = [
  "Sun",
  "Earth",
  "North Node",
  "South Node",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;
export type HdBody = (typeof HD_BODIES)[number];

export type HdType = "Manifestor" | "Generator" | "Manifesting Generator" | "Projector" | "Reflector";

export interface TypeInfo {
  strategy: string;
  signature: string;
  notSelf: string;
  aura: string;
}

export const TYPE_INFO: Record<HdType, TypeInfo> = {
  Manifestor: { strategy: "Inform before you act", signature: "Peace", notSelf: "Anger", aura: "Closed & repelling" },
  Generator: { strategy: "Wait to respond", signature: "Satisfaction", notSelf: "Frustration", aura: "Open & enveloping" },
  "Manifesting Generator": {
    strategy: "Wait to respond, then inform",
    signature: "Satisfaction & peace",
    notSelf: "Frustration & anger",
    aura: "Open & enveloping",
  },
  Projector: { strategy: "Wait for the invitation", signature: "Success", notSelf: "Bitterness", aura: "Focused & absorbing" },
  Reflector: { strategy: "Wait a lunar cycle (~28 days)", signature: "Surprise", notSelf: "Disappointment", aura: "Resistant & sampling" },
};

export type AuthorityId =
  | "emotional"
  | "sacral"
  | "splenic"
  | "ego"
  | "selfProjected"
  | "mental"
  | "lunar";

export const AUTHORITY_NAMES: Record<AuthorityId, string> = {
  emotional: "Emotional — Solar Plexus",
  sacral: "Sacral",
  splenic: "Splenic",
  ego: "Ego / Heart",
  selfProjected: "Self-Projected",
  mental: "Mental / None (Sounding board)",
  lunar: "Lunar (Reflector)",
};

/** The 12 profiles, keyed "personalityLine/designLine". */
export const PROFILE_NAMES: Record<string, string> = {
  "1/3": "Investigator / Martyr",
  "1/4": "Investigator / Opportunist",
  "2/4": "Hermit / Opportunist",
  "2/5": "Hermit / Heretic",
  "3/5": "Martyr / Heretic",
  "3/6": "Martyr / Role Model",
  "4/6": "Opportunist / Role Model",
  "4/1": "Opportunist / Investigator",
  "5/1": "Heretic / Investigator",
  "5/2": "Heretic / Hermit",
  "6/2": "Role Model / Hermit",
  "6/3": "Role Model / Martyr",
};

/** Cross geometry (angle) by profile. */
export const PROFILE_ANGLE: Record<string, "Right Angle" | "Left Angle" | "Juxtaposition"> = {
  "1/3": "Right Angle",
  "1/4": "Right Angle",
  "2/4": "Right Angle",
  "2/5": "Right Angle",
  "3/5": "Right Angle",
  "3/6": "Right Angle",
  "4/6": "Right Angle",
  "4/1": "Juxtaposition",
  "5/1": "Left Angle",
  "5/2": "Left Angle",
  "6/2": "Left Angle",
  "6/3": "Left Angle",
};

export const LINE_NAMES: Record<number, string> = {
  1: "Investigator",
  2: "Hermit",
  3: "Martyr",
  4: "Opportunist",
  5: "Heretic",
  6: "Role Model",
};

export const DEFINITION_NAMES: Record<number, string> = {
  0: "No Definition",
  1: "Single Definition",
  2: "Split Definition",
  3: "Triple Split Definition",
  4: "Quadruple Split Definition",
};
