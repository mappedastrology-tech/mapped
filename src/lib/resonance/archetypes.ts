/**
 * The 96 archetypes — a 12 (domain) × 8 (mode) grid (spec §5.1, names per
 * "Archetype Names v2"). Vectors derive from the grid: each domain contributes a
 * base trait profile, each mode a modifier; composed and clamped to 0–100.
 * IDs are positional (`arch.flame.breaker`), never name-derived, so renaming is free.
 * Domain/mode labels are INTERNAL only — users see the name and the radar.
 */

import { TraitDeltas, TraitVec, TRAIT_ORDER } from "./traits";

export type DomainId =
  | "flame" | "tide" | "stone" | "wind" | "root" | "star"
  | "thread" | "crown" | "forge" | "path" | "bell" | "wheel";

export type ModeId =
  | "kindler" | "builder" | "warden" | "breaker"
  | "seer" | "mender" | "trickster" | "sovereign";

export const DOMAIN_ORDER: DomainId[] = [
  "flame", "tide", "stone", "wind", "root", "star",
  "thread", "crown", "forge", "path", "bell", "wheel",
];
export const MODE_ORDER: ModeId[] = [
  "kindler", "builder", "warden", "breaker", "seer", "mender", "trickster", "sovereign",
];

/** Each domain's characteristic emphasis (deltas around the 50 baseline). */
const DOMAIN_BASE: Record<DomainId, TraitDeltas> = {
  flame: { initiative: 25, intensity: 22, disruption: 10, display: 8, stillness: -15, concealment: -8 },
  tide: { intuition: 22, care: 18, adaptability: 15, embodiment: 10, order: -12, analysis: -10 },
  stone: { endurance: 25, order: 20, embodiment: 15, craft: 10, stillness: 12, disruption: -15, adaptability: -12 },
  wind: { analysis: 22, vision: 18, expression: 15, adaptability: 12, embodiment: -12, intensity: -8 },
  root: { shadow: 28, concealment: 20, transformation: 18, intuition: 10, display: -18 },
  star: { transcendence: 26, vision: 22, display: 12, magnetism: 12, embodiment: -15, shadow: -8 },
  thread: { loyalty: 24, care: 20, magnetism: 12, autonomy: -18, sovereignty: -8 },
  crown: { sovereignty: 26, order: 16, autonomy: 14, display: 10, care: -8, stillness: -6 },
  forge: { craft: 28, order: 14, endurance: 14, analysis: 10, display: -8 },
  path: { adaptability: 22, initiative: 14, vision: 14, autonomy: 12, endurance: 8, stillness: -10, order: -8 },
  bell: { expression: 26, display: 16, magnetism: 12, memory: 10, concealment: -16 },
  wheel: { transformation: 22, memory: 16, endurance: 12, transcendence: 12, stillness: 10, intensity: -8 },
};

/** Each mode's modifier. */
const MODE_MOD: Record<ModeId, TraitDeltas> = {
  kindler: { initiative: 18, intensity: 10, disruption: 6, stillness: -10 },
  builder: { endurance: 16, order: 16, craft: 12, disruption: -12 },
  warden: { order: 14, stillness: 12, loyalty: 10, memory: 10, disruption: -14, adaptability: -8 },
  breaker: { disruption: 24, initiative: 10, sovereignty: 8, order: -18, stillness: -10 },
  seer: { intuition: 18, vision: 16, analysis: 10, concealment: 8, display: -12 },
  mender: { care: 22, embodiment: 10, stillness: 8, transformation: 8, disruption: -12, intensity: -8 },
  trickster: { adaptability: 22, disruption: 12, concealment: 12, expression: 8, order: -14, loyalty: -8 },
  sovereign: { sovereignty: 24, order: 12, display: 10, magnetism: 10, autonomy: 8, care: -6 },
};

/** Names — "Archetype Names v2", positional grid. */
const NAMES: Record<DomainId, Record<ModeId, string>> = {
  flame: { kindler: "The Spark", builder: "The Hearth", warden: "The Ember", breaker: "The Wildfire", seer: "The Beacon", mender: "The Lamplighter", trickster: "The Smoke", sovereign: "The Furnace" },
  tide: { kindler: "The Spring", builder: "The Harbour", warden: "The Vessel", breaker: "The Flood", seer: "The Mirror", mender: "The Rain", trickster: "The Undertow", sovereign: "The Tide" },
  stone: { kindler: "The Quarry", builder: "The Wall", warden: "The Bedrock", breaker: "The Fault", seer: "The Cartographer", mender: "The Mason", trickster: "The Drifter", sovereign: "The Keystone" },
  wind: { kindler: "The Muse", builder: "The Joiner", warden: "The Librarian", breaker: "The Gale", seer: "The Lens", mender: "The Clearing", trickster: "The Riddle", sovereign: "The Compass" },
  root: { kindler: "The Miner", builder: "The Crypt", warden: "The Gate", breaker: "The Pit", seer: "The Marrow", mender: "The Alchemist", trickster: "The Mask", sovereign: "The Vault" },
  star: { kindler: "The Dawn", builder: "The Temple", warden: "The Altar", breaker: "The Comet", seer: "The Constellation", mender: "The Healer", trickster: "The Mirage", sovereign: "The Zenith" },
  thread: { kindler: "The Spinner", builder: "The Weaver", warden: "The Nest", breaker: "The Shears", seer: "The Web", mender: "The Mother", trickster: "The Changeling", sovereign: "The Knot" },
  crown: { kindler: "The Banner", builder: "The Fortress", warden: "The Sentinel", breaker: "The Breach", seer: "The Watchtower", mender: "The Treaty", trickster: "The Cuckoo", sovereign: "The Throne" },
  forge: { kindler: "The Prospector", builder: "The Anvil", warden: "The Journeyman", breaker: "The Sculptor", seer: "The Architect", mender: "The Tinker", trickster: "The Forger", sovereign: "The Hammer" },
  path: { kindler: "The Threshold", builder: "The Bridge", warden: "The Ferryman", breaker: "The Frontier", seer: "The Lodestar", mender: "The Waystone", trickster: "The Crossroads", sovereign: "The Road" },
  bell: { kindler: "The Chime", builder: "The Chronicler", warden: "The Archivist", breaker: "The Alarm", seer: "The Echo", mender: "The Hymn", trickster: "The Rumor", sovereign: "The Toll" },
  wheel: { kindler: "The Seed", builder: "The Clockmaker", warden: "The Almanac", breaker: "The Eclipse", seer: "The Hourglass", mender: "The Thaw", trickster: "The Spiral", sovereign: "The Crucible" },
};

const DOMAIN_ESSENCE: Record<DomainId, string> = {
  flame: "will and ignition", tide: "feeling and flow", stone: "form and endurance",
  wind: "idea and thought", root: "depth and shadow", star: "spirit and vision",
  thread: "bond and kinship", crown: "power and boundary", forge: "craft and mastery",
  path: "journey and threshold", bell: "voice and word", wheel: "cycle and time",
};
const MODE_VERB: Record<ModeId, string> = {
  kindler: "that ignites", builder: "that builds", warden: "that guards", breaker: "that overturns",
  seer: "that perceives", mender: "that heals", trickster: "that improvises", sovereign: "that rules",
};

export interface Archetype {
  id: string;          // arch.flame.breaker
  name: string;        // The Wildfire
  domain: DomainId;
  mode: ModeId;
  tagline: string;
  traits: TraitVec;
}

const clamp = (n: number) => Math.max(2, Math.min(98, Math.round(n)));

function compose(domain: DomainId, mode: ModeId): TraitVec {
  const base = DOMAIN_BASE[domain];
  const mod = MODE_MOD[mode];
  const v = {} as TraitVec;
  for (const t of TRAIT_ORDER) {
    v[t] = clamp(50 + (base[t] ?? 0) + (mod[t] ?? 0));
  }
  return v;
}

export const ARCHETYPES: Archetype[] = DOMAIN_ORDER.flatMap((domain) =>
  MODE_ORDER.map((mode) => ({
    id: `arch.${domain}.${mode}`,
    name: NAMES[domain][mode],
    domain,
    mode,
    tagline: `${DOMAIN_ESSENCE[domain].replace(/^(.)/, (c) => c.toUpperCase())} ${MODE_VERB[mode]}.`,
    traits: compose(domain, mode),
  }))
);

export const ARCHETYPE_BY_ID: Record<string, Archetype> = Object.fromEntries(
  ARCHETYPES.map((a) => [a.id, a])
);
