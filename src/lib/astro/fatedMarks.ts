/**
 * Fated Synastry Marks — the database of "fated" cross-chart contacts.
 *
 * A "fated mark" is a synastry contact involving one of the points astrology
 * traditionally reads as destiny/karma rather than ordinary compatibility:
 *
 *   - North Node / South Node — soul direction & past-life karma
 *   - Vertex                  — fated, "out of the blue" meetings
 *   - Saturn                  — binding duty, commitment, time-tested karma
 *   - Pluto                   — soul-deep, transformational, magnetic bonds
 *   - Chiron                  — the wound that the other person heals or opens
 *   - Lilith (Black Moon)     — the taboo, untamed, shadow attraction
 *
 * Each detected mark carries structured metadata — category, weight, keywords —
 * plus direction-aware interpretation copy. `calculateSynastry` calls
 * `evaluateFatedMark` for every cross-aspect and keeps the ones that qualify.
 *
 * Sources informing the categorisation (researched June 2026):
 *   advanced-astrology.com/past-life-indicators-in-synastry-karmic/
 *   tameera.com/fated-love-and-soulmates-revealed-through-your-vertex-in-astrology/
 *   cafeastrology.com/articles/relationshipastrologytips.html
 *   teaandrosemary.com/black-moon-lilith-aspects-in-synastry/
 *   plutonicdesire.net/soulmates/
 */

// ───────────────────────── Aspect helpers ─────────────────────────

const SOFT_ASPECTS = new Set(["trine", "sextile"]);
const HARD_ASPECTS = new Set(["square", "opposition"]);
const HARD_VERB: Record<string, string> = { square: "squares", opposition: "opposes" };

const NODE_POINTS = new Set(["North Node", "South Node"]);

export type FatedContext = "family" | "partner" | "friend" | "city";

export type FatedCategory =
  | "destiny"   // North Node, Vertex — where you're headed / fated meetings
  | "karmic"    // South Node — past-life familiarity, unfinished business
  | "binding"   // Saturn — duty, commitment, time
  | "soulmate"  // Pluto — soul-deep transformation, magnetism
  | "healing"   // Chiron — the wound and its mending
  | "shadow";   // Lilith — the taboo, untamed pull

// ───────────────────────── Body registry ─────────────────────────

/**
 * The bodies that make a contact "fated". Outer-planet *pairs* are excluded as
 * generational by the caller; this set just says "this point counts".
 */
export const FATED_BODIES = new Set<string>([
  "North Node",
  "South Node",
  "Vertex",
  "Saturn",
  "Pluto",
  "Chiron",
  "Lilith",
]);

/**
 * When a contact involves two fated bodies, the higher-priority one governs the
 * mark's category and copy. Order matters: nodes and the Vertex (pure destiny
 * points) outrank the planets; Pluto's soulmate pull outranks Lilith's shadow.
 */
const FATED_PRIORITY = [
  "North Node",
  "South Node",
  "Vertex",
  "Chiron",
  "Saturn",
  "Pluto",
  "Lilith",
];

const CATEGORY_OF: Record<string, FatedCategory> = {
  "North Node": "destiny",
  "South Node": "karmic",
  Vertex: "destiny",
  Saturn: "binding",
  Pluto: "soulmate",
  Chiron: "healing",
  Lilith: "shadow",
};

export const CATEGORY_LABEL: Record<FatedCategory, string> = {
  destiny: "Destiny",
  karmic: "Karmic",
  binding: "Binding",
  soulmate: "Soul-deep",
  healing: "Healing",
  shadow: "Shadow",
};

export const CATEGORY_KEYWORDS: Record<FatedCategory, string[]> = {
  destiny: ["fated meeting", "growth direction", "pulled forward"],
  karmic: ["past-life familiarity", "old patterns", "unfinished business"],
  binding: ["duty", "commitment", "time-tested"],
  soulmate: ["soul-deep", "transformation", "intense"],
  healing: ["old wound", "seen", "mending"],
  shadow: ["untamed", "boundary-pushing", "provocative"],
};

/** Base importance of each governing body, before aspect/orb weighting. */
const BODY_WEIGHT: Record<string, number> = {
  "North Node": 92,
  Vertex: 88,
  Pluto: 82,
  Saturn: 78,
  "South Node": 72,
  Chiron: 68,
  Lilith: 62,
};

const ASPECT_WEIGHT: Record<string, number> = {
  conjunction: 1.0,
  opposition: 0.85,
  trine: 0.8,
  square: 0.78,
  sextile: 0.65,
};

/** Max orb per aspect, used to scale the orb-tightness factor. */
const ASPECT_MAX_ORB: Record<string, number> = {
  conjunction: 8,
  opposition: 8,
  trine: 7,
  square: 7,
  sextile: 5,
};

// ───────────────────────── Planet themes ─────────────────────────

const PLANET_THEME: Record<string, string> = {
  Sun: "core identity",
  Moon: "emotional world",
  Mercury: "way of thinking",
  Venus: "sense of love and worth",
  Mars: "drive",
  Jupiter: "optimism",
  Saturn: "discipline",
  Uranus: "wildcard streak",
  Neptune: "imagination",
  Pluto: "intensity",
  Chiron: "healing journey",
  Lilith: "untamed side",
  Vertex: "fated axis",
};

function themeOf(name: string): string {
  return PLANET_THEME[name] ?? "energy";
}

/**
 * Per-body South Node dynamic — what that body resurfacing feels like. Written
 * mutually (no "you/them" pronoun) and as a complete thought with its own
 * ending, so both directions and both aspect classes read distinctly without a
 * shared trailing sentence.
 */
const SN_DYNAMIC: Record<string, string> = {
  Sun: "an old sense of recognition, like the two of you have shared a spotlight before — comfortable, but easy to get stuck facing backward.",
  Moon: "old emotional familiarity, the feeling of having kept each other company in an earlier chapter — soothing, unless it locks in old habits.",
  Mercury: "an instant conversational shorthand, as if the talks already happened — uncanny, though the growth is finding new things to say.",
  Venus: "an affection that feels ancient and immediately easy — lovely, as long as you love forward instead of on repeat.",
  Mars: "old drives and dynamics firing back up — a familiar heat that reignites real passion, or the same old fights.",
  Jupiter: "a familiar, easy generosity, like you've buoyed each other before — buoyant, with a tendency to overpromise on old faith.",
  Saturn: "an old weight and sense of duty — a bond that feels owed, steadying but heavy if it becomes all obligation.",
  Uranus: "a familiar jolt of freedom, like you've broken loose together before — exciting, but hard to make stable.",
  Neptune: "a dreamlike déjà vu — enchanting, though it's easy to mistake nostalgia for truth here.",
  Pluto: "an old, deep entanglement resurfacing — powerful and unfinished, pulling toward repeating rather than releasing.",
  Chiron: "an old shared ache, a wound that feels older than this meeting — tender, and ripe for healing if you don't pick the scab.",
  Lilith: "a wild, familiar pull toward old, untamed versions of yourselves — magnetic, and worth examining before you follow it.",
  Vertex: "the distinct sense of resuming something already begun — fated and familiar, not to be mistaken for finished.",
};

function snDynamic(other: string): string {
  return SN_DYNAMIC[other] ?? "a deep, unplaceable familiarity, like picking up an old thread you can't quite name.";
}

// ───────────────────────── Public types ─────────────────────────

export interface FatedMark {
  fated: true;
  /** Governing body that defines the mark, e.g. "Vertex". */
  governor: string;
  category: FatedCategory;
  categoryLabel: string;
  keywords: string[];
  /** 0–100 sortable importance. */
  weight: number;
  /** Direction-aware interpretation copy. */
  reason: string;
}

// ───────────────────────── Main entry point ─────────────────────────

/**
 * Evaluate a single cross-aspect. Returns a structured FatedMark when the
 * contact qualifies as fated, or null otherwise.
 *
 * p1Name belongs to chart1 (the user — "your"); p2Name belongs to chart2
 * (the other person — "their" — or the city). Direction is preserved.
 */
export function evaluateFatedMark(
  p1Name: string,
  p2Name: string,
  aspect: string,
  orb: number,
  context: FatedContext,
): FatedMark | null {
  if (!FATED_BODIES.has(p1Name) && !FATED_BODIES.has(p2Name)) return null;

  const governor = pickGovernor(p1Name, p2Name);
  const category = CATEGORY_OF[governor];

  const reason = getFatedReason(p1Name, p2Name, aspect, context);
  const weight = scoreMark(governor, aspect, orb);

  return {
    fated: true,
    governor,
    category,
    categoryLabel: CATEGORY_LABEL[category],
    keywords: CATEGORY_KEYWORDS[category],
    weight,
    reason,
  };
}

function pickGovernor(p1Name: string, p2Name: string): string {
  const a = FATED_BODIES.has(p1Name) ? p1Name : null;
  const b = FATED_BODIES.has(p2Name) ? p2Name : null;
  if (a && b) {
    const ai = FATED_PRIORITY.indexOf(a);
    const bi = FATED_PRIORITY.indexOf(b);
    return ai <= bi ? a : b;
  }
  return (a ?? b) as string;
}

function scoreMark(governor: string, aspect: string, orb: number): number {
  const base = BODY_WEIGHT[governor] ?? 60;
  const aspectFactor = ASPECT_WEIGHT[aspect] ?? 0.7;
  const maxOrb = ASPECT_MAX_ORB[aspect] ?? 8;
  // Tight orbs keep ~full weight; wide orbs lose up to 45%.
  const orbFactor = Math.max(0.55, 1 - (orb / maxOrb) * 0.45);
  return Math.max(10, Math.min(100, Math.round(base * aspectFactor * orbFactor)));
}

// ───────────────────────── Interpretation copy ─────────────────────────

/**
 * Direction-aware copy generator. Ported from the original inline
 * getFatedReason and extended with the Vertex and Lilith as primary bodies.
 */
function getFatedReason(p1Name: string, p2Name: string, aspect: string, context: FatedContext): string {
  const isFamily = context === "family";
  const isCity = context === "city";
  // Family AND friend are platonic — copy must never read romantic/sexual.
  const isPlatonic = context === "family" || context === "friend";
  const p1IsNode = NODE_POINTS.has(p1Name);
  const p2IsNode = NODE_POINTS.has(p2Name);

  // ── Nodal axis meets nodal axis ──
  if (p1IsNode && p2IsNode) {
    if (aspect === "square") {
      if (isCity) return "Your nodal axis squares this city's — your growth direction and this place's story pull crossways. Living here asks you to grow on purpose rather than by default.";
      return "Your nodal axes are crossed — your growth directions run at right angles. That's not a flaw: your purposes intersect rather than run parallel, and respecting the difference sharpens you both.";
    }
    if (aspect === "conjunction" || aspect === "opposition") {
      if (isCity) return "Your nodal axis aligns with this city's — the direction you're growing and the story of this place run along the same line. Being here feels like part of the plot.";
      return "Your nodal axes are aligned — your growth directions and your pasts are intertwined. You recognize something of your own journey in each other.";
    }
    if (isCity) return "Your nodal axis flows with this city's — the way this place evolves supports the direction you're growing.";
    return "Your nodal axes support each other — your growth directions run in harmony. You make each other's next chapter feel more reachable.";
  }

  // ── Your North Node ──
  if (p1IsNode && p1Name === "North Node") {
    const other = p2Name;
    if (SOFT_ASPECTS.has(aspect)) {
      if (isCity) return `The city's ${other} flows with your North Node — this place quietly supports the direction you're growing. Progress here feels natural rather than forced.`;
      return `Their ${other} flows with your North Node — their ${themeOf(other)} supports the direction you're growing. Around them, your next chapter feels easier to reach.`;
    }
    if (HARD_ASPECTS.has(aspect)) {
      if (isCity) return `The city's ${other} ${HARD_VERB[aspect]} your North Node — this place tests the direction you're growing. The friction is real, and it's also formative.`;
      return `Their ${other} ${HARD_VERB[aspect]} your North Node — their ${themeOf(other)} challenges the direction you're growing. Growth through tension: this bond moves you forward by testing you.`;
    }
    if (other === "Sun") {
      if (isCity) return "This city's identity aligns with your soul's growth direction. Living here pulls you toward who you're meant to become — it's not a coincidence you ended up in this place.";
      if (isFamily) return "Their Sun lights up your growth direction. This family member models something your soul is trying to learn in this lifetime.";
      return "Their Sun lights up your soul's growth direction. This person feels like they're pulling you toward your destiny.";
    }
    if (other === "Moon") {
      if (isCity) return "The emotional rhythm of this city nurtures the direction you're growing toward. The way this place makes you feel is part of your evolution.";
      if (isFamily) return "Their Moon nurtures the direction you're growing toward. This family bond supports who you're becoming.";
      return "Their Moon touches your North Node — this connection nurtures the person you're becoming, not the person you were.";
    }
    if (other === "Venus") {
      if (isCity) return "This city's values and aesthetics connect to your North Node. What this place loves and celebrates teaches you something about your own worthiness and desires.";
      if (isFamily) return "Their Venus on your North Node means this family bond teaches you about love, values, and worthiness.";
      if (isPlatonic) return "Their Venus on your North Node means this bond teaches you about love, values, and what you're worth.";
      return "Their Venus on your North Node means loving them pushes you to grow. The attraction feels purposeful.";
    }
    if (other === "Mars") {
      if (isCity) return "This city's drive and pace activate your North Node. The hustle of this place pushes you to act on your purpose, sometimes through friction that ultimately serves your growth.";
      if (isFamily) return "Their Mars activates your North Node — this family member pushes you to act, sometimes through friction that ultimately serves your growth.";
      return "Their Mars activates your North Node — this person motivates you toward your life's purpose, sometimes through friction.";
    }
    if (other === "Saturn") {
      if (isCity) return "Saturn and the North Node between you and this city — you have karmic lessons to learn in this place. The city's structures and limitations are teaching you something you can't learn anywhere else.";
      return "Saturn and the North Node together — this is a karmic contract. You're here to teach each other something neither of you can learn alone.";
    }
    if (other === "Pluto") {
      if (isCity) return "Pluto on your North Node from this city's chart is a soul-level tie to this place. Living here transforms you in the direction of your destiny, whether comfortable or not.";
      if (isFamily) return "Pluto on the North Node is a soul-level family bond. This person transforms you in the direction of your destiny, whether comfortable or not.";
      return "Pluto on the North Node is a soul-level bond. This person transforms you in the direction of your destiny, whether you want it or not.";
    }
    if (isCity) return `The city's ${other} connects to your North Node — this place is linked to your soul's growth direction. There's a reason you're drawn here.`;
    const nnVariants: Record<string, string> = {
      Mercury: "Their Mercury connects to your North Node — conversations with them keep steering you toward your future. They put language to where you're headed.",
      Jupiter: "Their Jupiter expands your North Node — they open doors in exactly the direction you're meant to grow. Luck seems to follow this connection.",
      Uranus: "Their Uranus electrifies your North Node — they disrupt you in the direction of your destiny. Growth around this person tends to arrive suddenly.",
      Neptune: "Their Neptune touches your North Node — they dissolve the practical excuses between you and your path. They inspire rather than instruct.",
      Chiron: "Their Chiron meets your North Node — their own healing journey shows you something about where you're going. Their scars are a map you can use.",
      Lilith: "Their Lilith provokes your North Node — they awaken an untamed part of you that your growth actually requires. Uncomfortable, and useful.",
      Vertex: "Their Vertex meets your North Node — the meeting itself feels arranged, and it points exactly where you're meant to grow.",
    };
    return nnVariants[other] ?? `Their ${other} connects to your North Node — this person is linked to your soul's growth direction in this lifetime.`;
  }

  // ── Their North Node ──
  if (p2IsNode && p2Name === "North Node") {
    const other = p1Name;
    if (isCity) {
      if (HARD_ASPECTS.has(aspect)) return `Your ${other} ${HARD_VERB[aspect]} the city's North Node — your ${themeOf(other)} cuts against the grain of where this place is headed. Growth here comes through friction.`;
      return `Your ${other} connects to the city's North Node — what you bring resonates with where this place is headed. You're part of this city's becoming, not just a visitor.`;
    }
    if (SOFT_ASPECTS.has(aspect)) return `Your ${other} flows with their North Node — your ${themeOf(other)} supports the direction they're growing. You make their evolution feel more possible just by being yourself.`;
    if (HARD_ASPECTS.has(aspect)) return `Your ${other} ${HARD_VERB[aspect]} their North Node — your ${themeOf(other)} challenges the direction they're growing; you push each other's evolution. The tension is part of the point.`;
    if (isFamily) return `Your ${other} sits on their North Node — your ${themeOf(other)} models something this family member's soul is trying to learn. You're part of their growth direction.`;
    return `Your ${other} sits on their North Node — your ${themeOf(other)} points exactly where they're trying to grow. To them, you feel like part of the plan.`;
  }

  // ── Your South Node ──
  if (p1IsNode) {
    const other = p2Name;
    const frag = snDynamic(other);
    if (isCity) return `The city's ${other} touches your South Node — this place carries ${frag}`;
    if (isFamily) return `Their ${other} touches your South Node, woven into the family's past — ${frag}`;
    if (HARD_ASPECTS.has(aspect)) return `Their ${other} stirs your South Node — ${frag}`;
    return `Their ${other} touches your South Node — ${frag}`;
  }

  // ── Their South Node ──
  if (p2IsNode) {
    const other = p1Name;
    const frag = snDynamic(other);
    if (isCity) return `Your ${other} touches the city's South Node — you connect to this place's past more than its future: ${frag}`;
    if (HARD_ASPECTS.has(aspect)) return `Your ${other} stirs their South Node — ${frag}`;
    if (isFamily) return `Your ${other} touches their South Node, woven into the family's past — ${frag}`;
    return `Your ${other} touches their South Node — ${frag}`;
  }

  // ── Vertex (fated meeting) ──
  if (p1Name === "Vertex" || p2Name === "Vertex") {
    const vertexIsYours = p1Name === "Vertex";
    const other = vertexIsYours ? p2Name : p1Name;
    const vtx = vertexIsYours ? "your Vertex" : "their Vertex";
    const subj = vertexIsYours ? `Their ${other}` : `Your ${other}`;
    const strong = aspect === "conjunction" || aspect === "opposition";

    const VERTEX_PAIR: Record<string, string> = {
      Sun: `${subj} lands on ${vtx} — the kind of meeting that feels arranged in advance. Something shifts on contact; you sense purpose before you have reasons.`,
      Moon: `${subj} meets ${vtx} — instant emotional recognition, like the encounter was always going to happen. Comfort that arrives faster than it should.`,
      Mercury: `${subj} hits ${vtx} — a conversation that reroutes you. From the first exchange it feels significant, as if you were meant to hear exactly this.`,
      Venus: `${subj} touches ${vtx} — fated attraction. The pull is immediate and a little uncanny, the sense that this meeting was always on the map.`,
      Mars: `${subj} activates ${vtx} — a charged, destined spark. It lights a fire that wasn't chosen; the encounter feels propelled by something larger.`,
      Jupiter: `${subj} expands ${vtx} — a lucky, opportune meeting. A door opens at exactly the right moment, and the timing feels arranged.`,
      Saturn: `${subj} anchors ${vtx} — a fated meeting that asks for commitment. Serious, lasting, and weighted with an obligation neither of you quite chose.`,
      Uranus: `${subj} strikes ${vtx} — a sudden, out-of-the-blue meeting that changes your trajectory. Unexpected, electric, and oddly inevitable.`,
      Neptune: `${subj} veils ${vtx} — a dreamlike, fated pull. The encounter feels enchanted, hard to see clearly, and impossible to dismiss.`,
      Pluto: `${subj} seizes ${vtx} — a destined meeting with real gravity. Transformation arrives whether you're ready or not; neither of you leaves unchanged.`,
      Vertex: "Your Vertices meet — your fated axes line up. However you came together, it carries the unmistakable feeling of an appointment kept.",
    };
    // Platonic: keep the Venus contact about values/closeness, not attraction.
    if (isPlatonic) VERTEX_PAIR.Venus = `${subj} touches ${vtx} — a fated pull. The connection is immediate and a little uncanny, the sense that this meeting was always on the map.`;

    if (strong) {
      return VERTEX_PAIR[other] ?? `${subj} contacts ${vtx} — a meeting that carries the signature of fate. It feels purposeful rather than accidental.`;
    }
    // Soft/hard aspects to the Vertex are weaker but still flavored by direction.
    if (HARD_ASPECTS.has(aspect)) return `${subj} ${HARD_VERB[aspect]} ${vtx} — a fated pull with friction. The meeting matters, but it arrives crosswise, asking for adjustment.`;
    return `${subj} aspects ${vtx} — a quieter thread of fate. The connection feels meant, even if it announces itself softly.`;
  }

  // ── Chiron (the wound) ──
  if (p1Name === "Chiron") {
    const other = p2Name;
    if (isCity) {
      if (aspect === "conjunction" || aspect === "opposition")
        return `The city's ${other} activates your Chiron — this place touches your deepest wound. Something about living here brings old pain to the surface, but that's where the healing happens.`;
      return `The city's ${other} aspects your Chiron — this place has a quiet ability to heal something you've been carrying. The healing isn't dramatic, but it's real.`;
    }
    if (isFamily) {
      if (aspect === "conjunction" || aspect === "opposition")
        return `Their ${other} activates your Chiron — this family member touches your deepest wound. The healing happens through this relationship, even when it's painful.`;
      return `Their ${other} aspects your Chiron — this family member can help you heal something inherited through the bloodline.`;
    }
    if (aspect === "conjunction" || aspect === "opposition")
      return `Their ${other} activates your Chiron — this person touches your deepest wound. It hurts, but it's the hurt that heals. They see the part of you that you hide.`;
    const chironVariants: Record<string, string> = {
      Sun: "Their Sun warms your Chiron — they make the wounded part of you feel seen without flinching. Around them, what you usually hide gets easier to carry.",
      Moon: "Their Moon soothes your Chiron — their care reaches an old hurt that logic never could. You feel safer being soft around them.",
      Mercury: "Their Mercury speaks to your Chiron — conversations with them put words to pain you've never managed to explain. Talking it out actually works here.",
      Venus: "Their Venus aspects your Chiron — being loved by them heals quietly. Their affection reaches a place that's used to going without.",
      Mars: "Their Mars aspects your Chiron — they nudge you to act on healing instead of just thinking about it. They press the sore spot, but kindly.",
      Jupiter: "Their Jupiter aspects your Chiron — their optimism makes more room around an old wound. With them, the story you tell about your pain gets bigger and kinder.",
      Saturn: "Their Saturn steadies your Chiron — slow, patient healing. They don't try to fix you; they stay. That's the medicine.",
      Uranus: "Their Uranus aspects your Chiron — they break your patterns around an old wound. Their unconventional take frees something you'd resigned yourself to.",
      Neptune: "Their Neptune aspects your Chiron — their compassion softens the edges of an old hurt. Around them it's easier to forgive, including yourself.",
      Pluto: "Their Pluto aspects your Chiron — deep surgery. This connection goes for the root of an old wound rather than managing symptoms.",
      Lilith: "Their Lilith aspects your Chiron — they press exactly where you were shamed for being too much. It stings, then it frees something.",
    };
    return chironVariants[other] ?? `Their ${other} aspects your Chiron — this person can help you heal something you've been carrying for a long time, if you let them.`;
  }
  if (p2Name === "Chiron") {
    const other = p1Name;
    if (isCity) return `Your ${other} touches the city's Chiron — this place shows you its wounded side, and you have something that helps. Your relationship with this city runs deeper than convenience.`;
    if (aspect === "conjunction" || aspect === "opposition")
      return `Your ${other} activates their Chiron — you touch their deepest wound, often without meaning to. Handle it gently: you're also part of how it heals.`;
    return `Your ${other} aspects their Chiron — your ${themeOf(other)} reaches an old hurt of theirs and quietly helps it mend. You're good medicine for them.`;
  }

  // ── Saturn (binding) ──
  if (p1Name === "Saturn" || p2Name === "Saturn") {
    const saturnIsYours = p1Name === "Saturn";
    const other = saturnIsYours ? p2Name : p1Name;
    const sat = saturnIsYours ? "Your Saturn" : "Their Saturn";
    const oth = saturnIsYours ? `their ${other}` : `your ${other}`;
    const SATURN_PAIR: Record<string, string> = {
      Sun: "Saturn settles onto a sense of self — respect and real weight, with the shadow of feeling measured or judged. It's the contact that makes you both grow up.",
      Moon: "Saturn meets the emotional life — genuine security and steadiness, with an occasional chill or sense of holding back. Comfort here has to be earned.",
      Mercury: "Saturn gives weight to how you think and talk — serious, considered, sometimes critical. You take each other's words seriously, for better and worse.",
      Venus: "the classic commitment contact — Saturn makes the affection durable and proven over time. It can feel like duty, but it's the kind of love that lasts.",
      Mars: "Saturn brakes the drive — discipline and staying power at best, a foot on the other's gas pedal at worst. The work is patience over frustration.",
      Jupiter: "the brake meets the accelerator — one of you expands, the other contains, and together you find a realistic middle. Patience versus optimism, ongoing.",
      Saturn: "you're built on the same timeline — same sense of duty, same fears, same definition of serious. Deep structural alignment, with the risk of reinforcing each other's limits.",
      Uranus: "structure meets the wildcard — Saturn wants the rules, the other wants to break them. This is the long negotiation between safety and freedom.",
      Neptune: "Saturn gives form to the dreamy and formless — at best it makes ideals real, at worst it brings doubt to something that was beautifully vague.",
      Pluto: "Saturn and Pluto together — control, endurance, and slow transformation. This bond doesn't do casual, and it's hard to walk away from.",
      Lilith: "Saturn meets the untamed — friction between control and what refuses to be controlled. It can repress, or it can give wild things lasting shape.",
      Vertex: "Saturn anchors a fated point — the meeting carries duty and longevity, the sense of a commitment written before you arrived.",
    };
    const frag = SATURN_PAIR[other] ?? "Saturn lends weight, structure, and a sense of duty — not the easiest contact, but a steadying, lasting one.";
    if (isCity) {
      const citySat = saturnIsYours ? "Your Saturn" : "The city's Saturn";
      const cityOth = saturnIsYours ? `the city's ${other}` : `your ${other}`;
      if (aspect === "conjunction") return `${citySat} conjunct ${cityOth} — ${frag}`;
      if (HARD_ASPECTS.has(aspect)) return `${citySat} ${HARD_VERB[aspect]} ${cityOth} — ${frag}`;
      return `${citySat} aspects ${cityOth} — ${frag}`;
    }
    if (aspect === "conjunction") return `${sat} conjunct ${oth} — ${frag}`;
    if (HARD_ASPECTS.has(aspect)) return `${sat} ${HARD_VERB[aspect]} ${oth} — ${frag}`;
    return `${sat} aspects ${oth} — ${frag}`;
  }

  // ── Pluto (soul-deep) ──
  if (p1Name === "Pluto" || p2Name === "Pluto") {
    const plutoIsYours = p1Name === "Pluto";
    const other = plutoIsYours ? p2Name : p1Name;
    const plu = plutoIsYours ? "Your Pluto" : "Their Pluto";
    const oth = plutoIsYours ? `their ${other}` : `your ${other}`;
    const PLUTO_PAIR: Record<string, string> = {
      Sun: "power meets identity — magnetic and a little dangerous, empowering and overpowering at once. Used consciously it transforms; used unconsciously it controls.",
      Moon: "an emotional depth charge — intimacy and intensity, with the occasional power struggle over closeness. Nothing here stays surface-level.",
      Mercury: "conversations that go deep or not at all — words carry weight and a probing edge, and you read each other's subtext. Few small-talk moments.",
      Venus: "obsessive, magnetic attraction — love that consumes and possesses in equal measure. It transforms how you both understand desire, and rarely lets go cleanly.",
      Mars: "raw power and drive — tremendous force when you're aligned, open warfare when you're not. Passion and conflict share a wire here.",
      Jupiter: "all-or-nothing growth — together you go big, dig deep, and change on a large scale. The shadow is excess with no off switch.",
      Saturn: "control, endurance, and slow transformation — a heavy, enduring bond that doesn't do casual.",
      Lilith: "the deep and the untamed combined — primal, magnetic, and not entirely safe. Shadow-work territory.",
      Vertex: "a destined meeting with gravity — Pluto pulls a fated point into deep transformation. You don't leave this one as you arrived.",
    };
    // Platonic: keep Pluto's intensity about depth/loyalty/power, not romance.
    if (isPlatonic) {
      PLUTO_PAIR.Venus = "intense, all-consuming closeness — devotion that runs deep and a little possessive. It transforms you both, and rarely lets go cleanly.";
      PLUTO_PAIR.Moon = "an emotional depth charge — deep closeness and intensity, with the occasional power struggle over how close to get. Nothing here stays surface-level.";
      PLUTO_PAIR.Mars = "raw power and drive — tremendous force when you're aligned, open warfare when you're not. Intensity and conflict share a wire here.";
      PLUTO_PAIR.Lilith = "the deep and the untamed combined — powerful, provocative, and not entirely safe. Shadow-work territory.";
    }
    const frag = PLUTO_PAIR[other] ?? "deep, transformative power working below the surface — you mostly notice the change after it's done.";
    if (isCity) {
      const cityPlu = plutoIsYours ? "Your Pluto" : "The city's Pluto";
      const cityOth = plutoIsYours ? `the city's ${other}` : `your ${other}`;
      return `${cityPlu} aspects ${cityOth} — ${frag}`;
    }
    if (aspect === "conjunction") return `${plu} conjunct ${oth} — ${frag}`;
    if (HARD_ASPECTS.has(aspect)) return `${plu} ${HARD_VERB[aspect]} ${oth} — ${frag}`;
    return `${plu} aspects ${oth} — ${frag}`;
  }

  // ── Lilith (shadow) ──
  if (p1Name === "Lilith" || p2Name === "Lilith") {
    const lilithIsYours = p1Name === "Lilith";
    const other = lilithIsYours ? p2Name : p1Name;
    const lil = lilithIsYours ? "your Lilith" : "their Lilith";
    const subj = lilithIsYours ? `Their ${other}` : `Your ${other}`;

    // Platonic (family/friend): Lilith is about the rebellious, rule-breaking,
    // "say the unsayable" side — never framed romantically or sexually.
    if (isPlatonic) {
      const LILITH_PLATONIC: Record<string, string> = {
        Sun: `${subj} provokes ${lil} — drawing out the part of you that refuses to perform or play nice. Bracing, and a little destabilizing.`,
        Moon: `${subj} stirs ${lil} — reaching the feelings you usually keep underground. Intense, and it pulls up what's normally off-limits.`,
        Mercury: `${subj} speaks to ${lil} — you say the things to each other that others won't. Conversations go where polite ones don't.`,
        Venus: `${subj} meets ${lil} — they pull at your values and what you allow yourself to want, in a way that doesn't care about looking proper.`,
        Mars: `${subj} seizes ${lil} — raw, untamed energy that can turn into rivalry or provocation fast. Charged, and not always comfortable.`,
        Jupiter: `${subj} amplifies ${lil} — permission to be more, louder, less filtered. Freeing, with a tendency to overdo it.`,
        Uranus: `${subj} electrifies ${lil} — sudden, rule-breaking energy. It frees your wild side fast, and not always comfortably.`,
        Neptune: `${subj} blurs ${lil} — a hazy, hard-to-name pull toward the parts of you that resist being tamed.`,
        Saturn: `${subj} presses ${lil} — control meets the part of you that won't be controlled. It can repress, or give shape to something wild.`,
        Pluto: `${subj} fuses with ${lil} — deep, shadow-level provocation. Powerful and not entirely comfortable; this is shadow-work territory.`,
      };
      return LILITH_PLATONIC[other] ?? `${subj} contacts ${lil} — awakening the untamed, rule-breaking side of you. Provocative, uncomfortable, and worth examining.`;
    }

    const LILITH_PAIR: Record<string, string> = {
      Sun: `${subj} ignites ${lil} — drawing out the part that refuses to perform. Raw, magnetic, a little dangerous to your composure.`,
      Moon: `${subj} stirs ${lil} — reaching the feelings kept underground. Intimate and intense, with a pull toward the taboo.`,
      Mercury: `${subj} speaks to ${lil} — saying the things others won't, and it's thrilling. Conversations go where polite ones don't.`,
      Venus: `${subj} meets ${lil} — potent, forbidden-feeling attraction. Desire here is uninhibited and not especially interested in respectability.`,
      Mars: `${subj} seizes ${lil} — raw, primal heat. This is the contact that turns attraction into something almost compulsive.`,
      Jupiter: `${subj} amplifies ${lil} — permission to want more, louder. Expansive and a little excessive, it encourages the untamed side.`,
      Uranus: `${subj} electrifies ${lil} — sudden, rule-breaking attraction. It frees the wild part fast, and not always comfortably.`,
      Neptune: `${subj} dissolves into ${lil} — a hazy, bewitching pull. Hard to define and harder to resist, with a fantasy-like charge.`,
    };
    return LILITH_PAIR[other] ?? `${subj} contacts ${lil} — awakening the untamed, taboo side. Magnetic, uncomfortable, and worth examining.`;
  }

  if (isCity) return "This contact carries a fated quality — your connection to this place has a purposeful, karmic dimension.";
  return "This contact carries a fated quality — it may not be comfortable, but it's purposeful.";
}
