/**
 * The specific six-fold determinations behind each Variable arrow. The COLOR
 * (1–6) of an activation selects the type; the TONE (via the left/right arrow)
 * selects the sub-variant.
 *
 * Colour→activation: Digestion = Design Sun · Environment = Design Node ·
 * Motivation = Personality Sun · Perspective = Personality Node.
 * Cross-checked against Jovian Archive / Genetic Matrix. Environment ordering
 * (Shores = colour 6, the near-water environment) is confirmed across sources.
 */

export interface VariantType {
  name: string;
  left: string; // sub-variant for tones 1–3 (Left arrow)
  right: string; // sub-variant for tones 4–6 (Right arrow)
  description: string;
}

export const DIGESTION: Record<number, VariantType> = {
  1: {
    name: "Appetite",
    left: "Consecutive",
    right: "Alternating",
    description:
      "Your body digests best according to hunger and timing — eating one food at a time in sequence, or rotating and varying what and when you eat.",
  },
  2: {
    name: "Taste",
    left: "Open",
    right: "Closed",
    description:
      "Digestion led by flavour — you thrive on new, varied tastes, or you do best returning to familiar, repeated foods.",
  },
  3: {
    name: "Thirst",
    left: "Hot",
    right: "Cold",
    description:
      "Digestion regulated by the temperature of what you take in — warm foods and drinks, or cool and cold ones.",
  },
  4: {
    name: "Touch",
    left: "Nervous",
    right: "Calm",
    description:
      "How contact affects your intake — you eat best with stimulation and company, or with quiet and space around you.",
  },
  5: {
    name: "Sound",
    left: "Noisy",
    right: "Quiet",
    description:
      "The sound around meals matters — conversation and background sound support your digestion, or silence does.",
  },
  6: {
    name: "Light",
    left: "Direct",
    right: "Indirect",
    description:
      "The light you eat and metabolise best in — bright, direct light, or soft, indirect, ambient light.",
  },
};

export const ENVIRONMENT: Record<number, VariantType> = {
  1: {
    name: "Caves",
    left: "Selective",
    right: "Blending",
    description:
      "You settle in enclosed, sheltering spaces — small rooms, nooks, defined boundaries; the burrow where you feel contained.",
  },
  2: {
    name: "Markets",
    left: "Internal",
    right: "External",
    description:
      "You come alive in busy hubs of exchange — town centres, cafés, crossroads, places where people and activity flow through.",
  },
  3: {
    name: "Kitchens",
    left: "Wet",
    right: "Dry",
    description:
      "You thrive in places of transformation and warmth — studios, workshops, the hearth, where raw things become finished.",
  },
  4: {
    name: "Mountains",
    left: "Active",
    right: "Passive",
    description:
      "You do best with elevation and vantage — high ground, overlooks, upper floors, anywhere with perspective and a view.",
  },
  5: {
    name: "Valleys",
    left: "Narrow",
    right: "Wide",
    description:
      "You settle in low passages between higher ground — corridors, basins, sheltered channels; a held-between feeling.",
  },
  6: {
    name: "Shores",
    left: "Natural",
    right: "Artificial",
    description:
      "You belong at edges where two elements meet — coastlines, lakesides, riverbanks. Near water, at the threshold, is where you feel right.",
  },
};

export const MOTIVATION: Record<number, VariantType> = {
  1: {
    name: "Fear",
    left: "Strategic",
    right: "Receptive",
    description:
      "A mind driven to investigate the unknown and reach the truth; it settles by getting to the root of things.",
  },
  2: {
    name: "Hope",
    left: "Strategic",
    right: "Receptive",
    description:
      "A mind that trusts things will be provided; its strength is patience, surrender, and not forcing outcomes.",
  },
  3: {
    name: "Desire",
    left: "Strategic",
    right: "Receptive",
    description:
      "A mind driven to change and impact the material world; drawn to lead and share hard-won experience.",
  },
  4: {
    name: "Need",
    left: "Strategic",
    right: "Receptive",
    description:
      "A mind focused on what is essential and must be addressed; it distils complexity to the necessary next step.",
  },
  5: {
    name: "Guilt",
    left: "Strategic",
    right: "Receptive",
    description: "A mind that spots what's flawed and offers solutions and alternatives for the collective.",
  },
  6: {
    name: "Innocence",
    left: "Strategic",
    right: "Receptive",
    description:
      "A mind with no agenda; it leads by example and natural influence rather than by force or detail.",
  },
};

export const PERSPECTIVE: Record<number, VariantType> = {
  1: {
    name: "Survival",
    left: "Focused",
    right: "Peripheral",
    description:
      "You see through the lens of safety and practical necessity — alert to stability, risk, and what keeps you secure.",
  },
  2: {
    name: "Possibility",
    left: "Focused",
    right: "Peripheral",
    description: "You see potential and options — what could be. Imaginative, optimistic, and forward-looking.",
  },
  3: {
    name: "Power",
    left: "Focused",
    right: "Peripheral",
    description: "You see status, influence, and advantage — attuned to who holds power and how it moves.",
  },
  4: {
    name: "Wanting",
    left: "Focused",
    right: "Peripheral",
    description: "You see what's missing — the gaps and desires that want filling. Goal-oriented by nature.",
  },
  5: {
    name: "Probability",
    left: "Focused",
    right: "Peripheral",
    description: "You see the most likely outcome — logical, weighing the odds from what is known.",
  },
  6: {
    name: "Personal",
    left: "Focused",
    right: "Peripheral",
    description: "You see through personal experience and reflection — interpreting the world by your own inner sense.",
  },
};

export const VARIABLE_TABLE: Record<string, Record<number, VariantType>> = {
  determination: DIGESTION,
  environment: ENVIRONMENT,
  motivation: MOTIVATION,
  perspective: PERSPECTIVE,
};
