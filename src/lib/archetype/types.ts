/**
 * Archetype types. An archetype is the fusion of a user's dominant ELEMENT
 * (from astrology + numerology + palmistry) and their core STANCE (from Human
 * Design type, with a numerology fallback). 4 elements × 5 stances = 20
 * archetypes, so every possible combination of systems resolves to exactly one.
 */

export type Element = "fire" | "earth" | "air" | "water";
export type Stance = "initiator" | "cultivator" | "catalyst" | "guide" | "mirror";

export const ELEMENTS: Element[] = ["fire", "earth", "air", "water"];
export const STANCES: Stance[] = ["initiator", "cultivator", "catalyst", "guide", "mirror"];

export interface ArchetypeContent {
  id: string; // `${element}-${stance}`
  name: string; // e.g. "The Trailblazer"
  tagline: string; // short evocative phrase
  element: Element;
  stance: Stance;
  description: string; // ~50–65 words, weaving the element + stance
  traits: string[]; // 5–6 top traits
}

export const ELEMENT_LABEL: Record<Element, string> = {
  fire: "Fire",
  earth: "Earth",
  air: "Air",
  water: "Water",
};

export const STANCE_LABEL: Record<Stance, string> = {
  initiator: "Initiator",
  cultivator: "Cultivator",
  catalyst: "Catalyst",
  guide: "Guide",
  mirror: "Mirror",
};
