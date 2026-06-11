/**
 * Synastry calculator — TypeScript port of calculate_synastry.py.
 *
 * Compares two birth charts and calculates:
 * 1. Cross-aspects (how one person's planets aspect the other's)
 * 2. Fated indicators (North Node, Vertex, Saturn, Chiron contacts)
 * 3. Overall compatibility themes — context-aware (family vs romantic vs friendship vs city)
 *
 * Pure math — no ephemeris needed. Imports from ./constants.
 */

import {
  ASPECTS,
  SIGN_ELEMENT,
  angleDiff,
  findAspect,
} from "./constants";

// Which contacts count as "fated"
const FATED_BODIES = new Set(["North Node", "South Node", "Chiron", "Saturn", "Pluto"]);

const NODE_POINTS = new Set(["North Node", "South Node"]);

// Outer-planet pairs are generational — nearly everyone born within a few years
// shares them, so they don't qualify as personal "fated" contacts.
const OUTER_PLANETS = new Set(["Uranus", "Neptune", "Pluto"]);

const SOFT_ASPECTS = new Set(["trine", "sextile"]);
const HARD_ASPECTS = new Set(["square", "opposition"]);
const HARD_VERB: Record<string, string> = { square: "squares", opposition: "opposes" };

const CORE_PLANETS = new Set([
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
]);

// ---------- Types ----------

interface ChartPoint {
  name: string;
  sign: string;
  absPosition: number;
  [key: string]: unknown;
}

interface ChartData {
  planets: ChartPoint[];
  specialPoints?: ChartPoint[];
  bigThree?: Record<string, string>;
}

interface CrossAspect {
  p1Name: string;
  p1Sign: string;
  p2Name: string;
  p2Sign: string;
  aspect: string;
  orb: number;
  fated?: boolean;
  fatedReason?: string;
}

interface Theme {
  title: string;
  score: number;
  summary: string;
}

type Context = "family" | "partner" | "friend" | "city";

// ---------- Element counting ----------

function countElements(planets: ChartPoint[]): Record<string, number> {
  const counts: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const p of planets) {
    if (!CORE_PLANETS.has(p.name)) continue;
    const elem = SIGN_ELEMENT[p.sign];
    if (elem) counts[elem]++;
  }
  return counts;
}

// ---------- Fated reason generator ----------

// Noun themes used in direction-aware node/Chiron copy.
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
};

function themeOf(name: string): string {
  return PLANET_THEME[name] ?? "energy";
}

/**
 * p1Name always belongs to chart1 (the user — "your"); p2Name belongs to
 * chart2 (the other person — "their" — or the city). The copy must respect
 * that direction: "Their Venus on your North Node" vs "Your Venus on their North Node".
 */
function getFatedReason(p1Name: string, p2Name: string, aspect: string, context: Context): string {
  const isFamily = context === "family";
  const isCity = context === "city";
  const p1IsNode = NODE_POINTS.has(p1Name);
  const p2IsNode = NODE_POINTS.has(p2Name);

  // --- Nodal axis meets nodal axis: one relationship, one piece of copy ---
  if (p1IsNode && p2IsNode) {
    if (aspect === "square") {
      if (isCity) return "Your nodal axis squares this city's — your growth direction and this place's story pull crossways. Living here asks you to grow on purpose rather than by default.";
      return "Your nodal axes are crossed — your growth directions run at right angles. That's not a flaw: your purposes intersect rather than run parallel, and respecting the difference sharpens you both.";
    }
    if (aspect === "conjunction" || aspect === "opposition") {
      if (isCity) return "Your nodal axis aligns with this city's — the direction you're growing and the story of this place run along the same line. Being here feels like part of the plot.";
      return "Your nodal axes are aligned — your growth directions and your pasts are intertwined. You recognize something of your own journey in each other.";
    }
    // trine / sextile
    if (isCity) return "Your nodal axis flows with this city's — the way this place evolves supports the direction you're growing.";
    return "Your nodal axes support each other — your growth directions run in harmony. You make each other's next chapter feel more reachable.";
  }

  if (p1IsNode && p1Name === "North Node") {
    // Their planet (or the city's) contacts YOUR North Node.
    const other = p2Name;

    if (SOFT_ASPECTS.has(aspect)) {
      if (isCity) return `The city's ${other} flows with your North Node — this place quietly supports the direction you're growing. Progress here feels natural rather than forced.`;
      return `Their ${other} flows with your North Node — their ${themeOf(other)} supports the direction you're growing. Around them, your next chapter feels easier to reach.`;
    }
    if (HARD_ASPECTS.has(aspect)) {
      if (isCity) return `The city's ${other} ${HARD_VERB[aspect]} your North Node — this place tests the direction you're growing. The friction is real, and it's also formative.`;
      return `Their ${other} ${HARD_VERB[aspect]} your North Node — their ${themeOf(other)} challenges the direction you're growing. Growth through tension: this bond moves you forward by testing you.`;
    }

    // Conjunction — rich per-planet copy.
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
    };
    return nnVariants[other] ?? `Their ${other} connects to your North Node — this person is linked to your soul's growth direction in this lifetime.`;
  }

  if (p2IsNode && p2Name === "North Node") {
    // YOUR planet contacts THEIR (or the city's) North Node.
    const other = p1Name;

    if (isCity) {
      if (HARD_ASPECTS.has(aspect)) return `Your ${other} ${HARD_VERB[aspect]} the city's North Node — your ${themeOf(other)} cuts against the grain of where this place is headed. Growth here comes through friction.`;
      return `Your ${other} connects to the city's North Node — what you bring resonates with where this place is headed. You're part of this city's becoming, not just a visitor.`;
    }
    if (SOFT_ASPECTS.has(aspect)) {
      return `Your ${other} flows with their North Node — your ${themeOf(other)} supports the direction they're growing. You make their evolution feel more possible just by being yourself.`;
    }
    if (HARD_ASPECTS.has(aspect)) {
      return `Your ${other} ${HARD_VERB[aspect]} their North Node — your ${themeOf(other)} challenges the direction they're growing; you push each other's evolution. The tension is part of the point.`;
    }
    if (isFamily) return `Your ${other} sits on their North Node — your ${themeOf(other)} models something this family member's soul is trying to learn. You're part of their growth direction.`;
    return `Your ${other} sits on their North Node — your ${themeOf(other)} points exactly where they're trying to grow. To them, you feel like part of the plan.`;
  }

  if (p1IsNode) {
    // Their planet (or the city's) contacts YOUR South Node.
    const other = p2Name;
    if (isCity) return `The city's ${other} touches your South Node — this place carries deep familiarity, like you've lived here before in another life. The comfort is real, but the lesson is not to get stuck in old patterns.`;
    if (isFamily) return `Their ${other} touches your South Node — this family connection carries deep familiarity, possibly from past lives. The lesson is growing beyond old family patterns together.`;
    if (HARD_ASPECTS.has(aspect)) return `Their ${other} pulls against your South Node — they stir up old patterns and old versions of you. Uncomfortable, but it helps you release what you've outgrown.`;

    const snVariants: Record<string, string> = {
      Sun: "Their Sun sits on your South Node — they feel like home in a way you can't explain. The comfort is real; just don't let this bond only look backward.",
      Moon: "Their Moon touches your South Node — instant emotional familiarity, like you've kept each other company before. Lovely, as long as it doesn't keep you both in old habits.",
      Mercury: "Their Mercury touches your South Node — you talk in shorthand from day one. The ease is uncanny; the growth is in finding new things to say.",
      Venus: "Their Venus touches your South Node — the affection feels ancient, instantly comfortable. The work is loving each other forward, not just backward.",
      Mars: "Their Mars touches your South Node — they reactivate old drives and old dynamics. Familiar fire, but watch for replaying old fights.",
      Pluto: "Their Pluto touches your South Node — an old, deep entanglement resurfacing. The pull is powerful; the lesson is releasing, not repeating.",
      Lilith: "Their Lilith touches your South Node — a wild, familiar pull toward old versions of yourselves. Magnetic, and worth examining before you follow it.",
    };
    return snVariants[other] ?? `Their ${other} touches your South Node — you may have known each other in a past life. There's instant familiarity, but the lesson is not to stay stuck in old patterns.`;
  }

  if (p2IsNode) {
    // YOUR planet contacts THEIR (or the city's) South Node.
    const other = p1Name;
    if (isCity) return `Your ${other} touches the city's South Node — you connect to this place's past more than its future. The nostalgia is real; just don't let it keep you from moving forward.`;
    if (HARD_ASPECTS.has(aspect)) return `Your ${other} pulls against their South Node — you stir up their old patterns, and it's not always comfortable. You're part of how they grow past what they've outgrown.`;
    if (isFamily) return `Your ${other} touches their South Node — to them, you feel woven into the family's past. The familiarity runs deep; the work is growing forward together, not just looking back.`;
    return `Your ${other} touches their South Node — to them you feel instantly familiar, like someone they've known before. The comfort is real; the work is helping each other look forward, not just back.`;
  }

  if (p1Name === "Chiron") {
    // Their planet (or the city's) contacts YOUR Chiron.
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
    };
    return chironVariants[other] ?? `Their ${other} aspects your Chiron — this person can help you heal something you've been carrying for a long time, if you let them.`;
  }

  if (p2Name === "Chiron") {
    // YOUR planet contacts THEIR (or the city's) Chiron.
    const other = p1Name;
    if (isCity) return `Your ${other} touches the city's Chiron — this place shows you its wounded side, and you have something that helps. Your relationship with this city runs deeper than convenience.`;
    if (aspect === "conjunction" || aspect === "opposition")
      return `Your ${other} activates their Chiron — you touch their deepest wound, often without meaning to. Handle it gently: you're also part of how it heals.`;
    return `Your ${other} aspects their Chiron — your ${themeOf(other)} reaches an old hurt of theirs and quietly helps it mend. You're good medicine for them.`;
  }

  if (p1Name === "Saturn" || p2Name === "Saturn") {
    const saturnIsYours = p1Name === "Saturn";
    const other = saturnIsYours ? p2Name : p1Name;
    const sat = saturnIsYours ? "Your Saturn" : "Their Saturn";
    const oth = saturnIsYours ? `their ${other}` : `your ${other}`;
    if (isCity) {
      const citySat = saturnIsYours ? "Your Saturn" : "The city's Saturn";
      const cityOth = saturnIsYours ? `the city's ${other}` : `your ${other}`;
      if (aspect === "conjunction")
        return `${citySat} conjunct ${cityOth} — this place carries weight for you. There's a sense of duty or destiny tied to being here. It's not the easiest city for you, but it builds something lasting.`;
      if (HARD_ASPECTS.has(aspect))
        return `${citySat} ${HARD_VERB[aspect]} ${cityOth} — this city tests you. The structures, rules, or pace of this place create friction with your ambitions. Growth here requires patience and persistence.`;
      return `${citySat} aspects ${cityOth} — there's a stabilizing, grounding quality to your relationship with this place. It endures.`;
    }
    if (isFamily) {
      if (aspect === "conjunction")
        return `${sat} conjunct ${oth} — this family bond carries weight and responsibility. There's a sense of duty that defines this relationship.`;
      if (HARD_ASPECTS.has(aspect))
        return `${sat} ${HARD_VERB[aspect]} ${oth} — this family relationship tests both of you around authority, expectations, and generational patterns.`;
      return `${sat} aspects ${oth} — there's a stabilizing, foundational quality to this family bond. It endures.`;
    }
    if (aspect === "conjunction")
      return `${sat} conjunct ${oth} — this is a serious bond. There's a sense of duty, responsibility, and long-term commitment here. It might not be easy, but it's real.`;
    if (HARD_ASPECTS.has(aspect))
      return `${sat} ${HARD_VERB[aspect]} ${oth} — this relationship tests both of you. There's friction around responsibility, authority, and expectations. Growth requires patience.`;
    return `${sat} aspects ${oth} — there's a stabilizing, grounding quality to this connection. It has staying power.`;
  }

  if (p1Name === "Pluto" || p2Name === "Pluto") {
    const plutoIsYours = p1Name === "Pluto";
    const other = plutoIsYours ? p2Name : p1Name;
    const plu = plutoIsYours ? "Your Pluto" : "Their Pluto";
    const oth = plutoIsYours ? `their ${other}` : `your ${other}`;
    if (isCity) {
      const cityPlu = plutoIsYours ? "Your Pluto" : "The city's Pluto";
      const cityOth = plutoIsYours ? `the city's ${other}` : `your ${other}`;
      return `${cityPlu} aspects ${cityOth} — your relationship with this place is intense and transformative. Power dynamics with the city itself may be a theme. Living here changes you at a deep level.`;
    }
    if (isFamily)
      return `${plu} aspects ${oth} — this family bond is intense and transformative. Power dynamics may be a theme. This relationship changes both of you at a deep level.`;
    if (aspect === "conjunction")
      return `${plu} conjunct ${oth} — an all-or-nothing bond. Intensity, obsession, and real transformation live close together here. Neither of you will leave unchanged.`;
    if (HARD_ASPECTS.has(aspect))
      return `${plu} ${HARD_VERB[aspect]} ${oth} — power struggles are part of this story. The friction transforms you both, if you let it teach instead of win.`;
    return `${plu} aspects ${oth} — quietly transformative. This connection works on you below the surface; you mostly notice the change afterward.`;
  }

  if (isCity) return "This contact carries a fated quality — your connection to this place has a purposeful, karmic dimension.";
  return "This contact carries a fated quality — it may not be comfortable, but it's purposeful.";
}

// ---------- Fated contact dedupe ----------

/**
 * The lunar nodes are antipodal, so any planet aspecting one node aspects the
 * other with a near-identical orb — without dedupe every node contact shows up
 * twice (and node-axis-to-node-axis shows up four times). Keep one entry per
 * underlying relationship, preferring the North Node representation.
 */
function dedupeNodalContacts(list: CrossAspect[]): CrossAspect[] {
  // Prefer entries that mention the North Node, then tighter orbs.
  const prioritized = [...list].sort((a, b) => {
    const aNN = (a.p1Name === "North Node" ? 1 : 0) + (a.p2Name === "North Node" ? 1 : 0);
    const bNN = (b.p1Name === "North Node" ? 1 : 0) + (b.p2Name === "North Node" ? 1 : 0);
    if (aNN !== bNN) return bNN - aNN;
    return a.orb - b.orb;
  });

  const out: CrossAspect[] = [];
  const seen = new Set<string>();
  let hasAxisEntry = false;

  for (const e of prioritized) {
    const p1Node = NODE_POINTS.has(e.p1Name);
    const p2Node = NODE_POINTS.has(e.p2Name);

    if (p1Node && p2Node) {
      // Node axis on node axis: one relationship, one entry.
      if (hasAxisEntry) continue;
      hasAxisEntry = true;
    } else if (p1Node || p2Node) {
      // Same planet hitting both ends of the same chart's nodal axis.
      const key = p1Node ? `your-node|${e.p2Name}` : `their-node|${e.p1Name}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }

    out.push(e);
  }
  return out;
}

// ---------- Theme scoring ----------

function scoreTheme(aspectList: CrossAspect[], baseWeight = 50): number {
  if (aspectList.length === 0) return baseWeight;

  const ASPECT_WEIGHT: Record<string, number> = {
    conjunction: 1.0, opposition: 0.85, square: 0.8, trine: 0.75, sextile: 0.65,
  };

  const best = aspectList[0]; // already sorted by orb
  const orb = best.orb ?? 3.0;
  const aspect = best.aspect ?? "conjunction";

  const orbFactor = Math.max(0.3, 1.0 - orb / 10.0);
  const aspectFactor = ASPECT_WEIGHT[aspect] ?? 0.7;
  const countBonus = Math.min(aspectList.length * 0.08, 0.2);

  const raw = baseWeight * orbFactor * aspectFactor + countBonus * 100;
  return Math.max(10, Math.min(100, Math.round(raw)));
}

// ---------- Theme generation ----------

function generateThemes(
  aspects: CrossAspect[],
  chart1: ChartData,
  chart2: ChartData,
  context: Context,
): Theme[] {
  const themes: Theme[] = [];
  const isFamily = context === "family";
  const isPartner = context === "partner";
  const isCity = context === "city";

  // Collect aspect subsets
  const sunMoon = aspects.filter(
    (a) =>
      (a.p1Name === "Sun" && a.p2Name === "Moon") ||
      (a.p1Name === "Moon" && a.p2Name === "Sun"),
  );
  const venusMars = aspects.filter(
    (a) =>
      (a.p1Name === "Venus" && a.p2Name === "Mars") ||
      (a.p1Name === "Mars" && a.p2Name === "Venus"),
  );
  const moonMoon = aspects.filter((a) => a.p1Name === "Moon" && a.p2Name === "Moon");
  const sunSun = aspects.filter((a) => a.p1Name === "Sun" && a.p2Name === "Sun");
  const venusVenus = aspects.filter((a) => a.p1Name === "Venus" && a.p2Name === "Venus");
  const mercuryMercury = aspects.filter((a) => a.p1Name === "Mercury" && a.p2Name === "Mercury");
  const saturnSun = aspects.filter(
    (a) =>
      (a.p1Name === "Saturn" && a.p2Name === "Sun") ||
      (a.p1Name === "Sun" && a.p2Name === "Saturn"),
  );

  // Sun-Moon
  if (sunMoon.length > 0) {
    const best = sunMoon[0];
    const smScore = scoreTheme(sunMoon, 90);
    if (["conjunction", "trine", "sextile"].includes(best.aspect)) {
      if (isCity) {
        themes.push({
          title: "The City Gets You",
          score: smScore,
          summary: smScore >= 50
            ? "Your Sun and the city's Moon (or vice versa) are in harmony. Who you are at your core resonates with the emotional rhythm of this place. You feel understood here without having to explain yourself."
            : "There's a Sun-Moon connection between you and this city, but it's loose. You might catch glimpses of feeling understood here, but it's not the city's defining effect on you.",
        });
      } else if (isFamily) {
        themes.push({
          title: "Natural Understanding",
          score: smScore,
          summary: smScore >= 50
            ? "Your Sun and their Moon (or vice versa) are in harmony. One of you naturally understands what the other needs. This creates an intuitive family bond where you 'get' each other without trying."
            : "There's a Sun-Moon link between you, but it's subtle. You understand each other on some level, though it may take more effort than it would in a tighter connection.",
        });
      } else {
        themes.push({
          title: "Natural Understanding",
          score: smScore,
          summary: smScore >= 50
            ? "Your Sun and their Moon (or vice versa) are in harmony. One of you shines in a way the other instinctively nurtures. You 'get' each other without trying."
            : "There's a Sun-Moon link in your charts — a thread of understanding between your identity and their emotions. It's present but not dominant, more of an undercurrent than a defining feature.",
        });
      }
    } else if (["square", "opposition"].includes(best.aspect)) {
      if (isCity) {
        themes.push({
          title: "The City Challenges Your Identity",
          score: scoreTheme(sunMoon, 85),
          summary: "Your Sun and the city's Moon create friction. Who you are at your core rubs against the emotional undercurrent of this place. You may feel like you're constantly adjusting or defending who you are here.",
        });
      } else if (isFamily) {
        themes.push({
          title: "Push and Pull Dynamic",
          score: scoreTheme(sunMoon, 85),
          summary: "Your Sun and their Moon create friction. Your core identity rubs against their emotional needs. This family dynamic requires conscious effort to avoid triggering each other.",
        });
      } else {
        themes.push({
          title: "Push and Pull Dynamic",
          score: scoreTheme(sunMoon, 85),
          summary: "Your Sun and their Moon create friction. Your core identity rubs against their emotional needs. It's magnetic but requires conscious effort to not trigger each other.",
        });
      }
    }
  }

  // Venus-Mars: only show for partner/friend, not family or city
  if (venusMars.length > 0 && !isFamily && !isCity) {
    const best = venusMars[0];
    if (["conjunction", "trine", "sextile", "opposition"].includes(best.aspect)) {
      themes.push({
        title: "Physical Chemistry",
        score: scoreTheme(venusMars, 75),
        summary: "Venus-Mars contact is the classic attraction indicator. There's a pull between desire and affection here that goes beyond friendship. You feel it in your body.",
      });
    } else if (best.aspect === "square") {
      themes.push({
        title: "Frustrated Desire",
        score: scoreTheme(venusMars, 75),
        summary: "Venus square Mars creates intense attraction with a catch — what one person wants, the other gives differently. The chemistry is real but the timing can feel off.",
      });
    }
  }

  // Venus-Venus
  if (venusVenus.length > 0) {
    const best = venusVenus[0];
    const vvScore = scoreTheme(venusVenus, 65);
    if (["conjunction", "trine", "sextile"].includes(best.aspect)) {
      if (isCity) {
        themes.push({
          title: "You Love What This City Loves",
          score: vvScore,
          summary: vvScore >= 50
            ? "Your Venus signs are in harmony. Your taste, values, and sense of beauty align with what this city celebrates. The restaurants, art, culture, and social scene here feel like they were made for you."
            : "There's some overlap between your taste and what this city offers, but it's not a perfect match. You'll find pockets of it rather than a city-wide resonance.",
        });
      } else if (isFamily) {
        themes.push({
          title: "Shared Values",
          score: vvScore,
          summary: vvScore >= 50
            ? "Your Venus signs are in harmony. You share similar values, tastes, and ideas about what makes life beautiful. Family gatherings feel natural and enjoyable."
            : "Your values overlap in places but diverge in others. You appreciate different things, which can actually broaden each other's perspective over time.",
        });
      } else {
        themes.push({
          title: vvScore >= 50 ? "Shared Love Language" : "Different Love Languages",
          score: vvScore,
          summary: vvScore >= 50
            ? "Your Venus signs are in harmony. You share similar values, aesthetics, and ways of showing affection. Love flows naturally between you."
            : "Your Venus signs are connected but loosely. You show care in different ways, which means what feels loving to one person might not register for the other. It takes learning each other's language.",
        });
      }
    }
  }

  // Moon-Moon
  if (moonMoon.length > 0) {
    const best = moonMoon[0];
    const mmScore = scoreTheme(moonMoon, 80);
    if (["conjunction", "trine", "sextile"].includes(best.aspect)) {
      if (isCity) {
        themes.push({
          title: "Emotionally at Home",
          score: mmScore,
          summary: mmScore >= 50
            ? "Your Moons are in sync. The emotional rhythm of this city matches yours — you feel safe, comfortable, and nourished here without having to try. This is a place that feels like home in your bones."
            : "There's a Moon connection between you and this city, but it's faint. You might feel emotionally comfortable here sometimes, but it's inconsistent — more like visiting a friend's house than coming home.",
        });
      } else if (isFamily) {
        themes.push({
          title: mmScore >= 50 ? "Emotional Safety" : "Emotional Awareness",
          score: mmScore,
          summary: mmScore >= 50
            ? "Your Moons are in sync. You feel emotionally safe with each other. This family bond has a nurturing quality where both people feel understood and held."
            : "Your Moons are connected but not closely. You care about each other's emotional wellbeing, but reading each other's moods doesn't come automatically — it's something you build over time.",
        });
      } else {
        themes.push({
          title: mmScore >= 50 ? "Emotional Resonance" : "Emotional Awareness",
          score: mmScore,
          summary: mmScore >= 50
            ? "Your Moons are in sync. You feel safe with each other. Emotional rhythms match — you know when to push and when to hold space without being told."
            : "Your Moons are connected but it's a loose link. You're aware of each other's emotional states, but the instinctive 'I know exactly what you need right now' isn't always there. The care is real, the timing just takes work.",
        });
      }
    } else if (["square", "opposition"].includes(best.aspect)) {
      if (isCity) {
        themes.push({
          title: "Emotional Mismatch",
          score: scoreTheme(moonMoon, 75),
          summary: "Your Moons clash with this city's. What you need emotionally — the pace, the energy, the way people connect — doesn't come naturally here. You may feel homesick even while you're home.",
        });
      } else if (isFamily) {
        themes.push({
          title: "Emotional Friction",
          score: scoreTheme(moonMoon, 75),
          summary: "Your Moons clash. What comforts one person unsettles the other. You care about each other but express it in fundamentally different ways. Understanding each other's emotional language is the family work.",
        });
      } else {
        themes.push({
          title: "Emotional Tension",
          score: scoreTheme(moonMoon, 75),
          summary: "Your Moons clash. What soothes one person agitates the other. You love each other but you comfort differently. Learning each other's emotional language is the work.",
        });
      }
    }
  }

  // Sun-Sun
  if (sunSun.length > 0) {
    const best = sunSun[0];
    if (best.aspect === "conjunction") {
      if (isCity) {
        themes.push({
          title: "Same Frequency",
          score: scoreTheme(sunSun, 70),
          summary: "Your Sun and this city's Sun are in the same sign. You share a core identity — the city's values, pace, and purpose mirror your own. This can feel incredibly validating, but watch for blind spots you share.",
        });
      } else {
        themes.push({
          title: "Mirror Energy",
          score: scoreTheme(sunSun, 70),
          summary: "Your Suns are in the same sign. You understand each other's core identity because it's the same frequency. The danger is that you amplify each other's worst traits too.",
        });
      }
    }
  }

  // Mercury-Mercury
  if (mercuryMercury.length > 0) {
    const best = mercuryMercury[0];
    const mercScore = scoreTheme(mercuryMercury, 55);
    if (["conjunction", "trine", "sextile"].includes(best.aspect)) {
      if (isCity) {
        themes.push({
          title: "The City Speaks Your Language",
          score: mercScore,
          summary: mercScore >= 50
            ? "Your Mercury signs flow together. The way information moves in this city — conversations, media, daily rhythms — matches how you think. You feel mentally sharp and connected here."
            : "There's a loose Mercury connection between you and this city. The way people think and communicate here has some overlap with your style, but it's not the defining feature of the relationship.",
        });
      } else {
        let mercSummary: string;
        if (mercScore >= 60) {
          mercSummary = "Your Mercury signs flow together. You think and communicate in compatible ways. Conversations come naturally and misunderstandings are rare.";
        } else if (mercScore >= 45) {
          mercSummary = "Your Mercury signs are loosely connected. You can communicate, but it takes a little more effort to land on the same page. The connection is there — it's just not effortless.";
        } else {
          mercSummary = "There's a Mercury link between your charts, but it's faint. Communication isn't your strongest suit together — you may occasionally talk past each other or need to repeat yourselves. It works, it just takes more intention.";
        }
        themes.push({
          title: mercScore >= 50 ? "Easy Communication" : "Communication Style",
          score: mercScore,
          summary: mercSummary,
        });
      }
    } else if (["square", "opposition"].includes(best.aspect)) {
      const mercClashScore = scoreTheme(mercuryMercury, 50);
      if (isCity) {
        themes.push({
          title: "Mental Friction with the City",
          score: mercClashScore,
          summary: "Your Mercury clashes with this city's. The pace of information, the way people communicate, the daily rhythm — it doesn't match how you think. You may feel mentally foggy or frustrated by miscommunications here.",
        });
      } else {
        themes.push({
          title: "Communication Gaps",
          score: mercClashScore,
          summary: "Your Mercury signs clash. You process and express information differently, which can lead to misunderstandings. Extra patience in conversations goes a long way.",
        });
      }
    }
  }

  // Saturn-Sun
  if (saturnSun.length > 0) {
    const best = saturnSun[0];
    if (["conjunction", "square", "opposition"].includes(best.aspect)) {
      if (isCity) {
        themes.push({
          title: "The City Disciplines You",
          score: scoreTheme(saturnSun, 60),
          summary: "Saturn touches the Sun between you and this city. The structures here — cost of living, career demands, social expectations — push you to grow up, work harder, and earn your place. It's not easy, but it builds character.",
        });
      } else if (isFamily) {
        themes.push({
          title: "Authority Dynamic",
          score: scoreTheme(saturnSun, 60),
          summary: "Saturn touches the Sun between you — there's a strong authority/child dynamic here. One person may feel judged or constrained by the other. This is common in parent-child relationships and requires conscious effort to evolve beyond the original power structure.",
        });
      }
    }
  }

  // Element compatibility
  const e1 = countElements(chart1.planets || []);
  const e2 = countElements(chart2.planets || []);
  let sharedDominant: string | null = null;
  for (const elem of ["fire", "earth", "air", "water"]) {
    if (e1[elem] >= 3 && e2[elem] >= 3) {
      sharedDominant = elem;
    }
  }

  if (sharedDominant) {
    const elemNames: Record<string, string> = { fire: "Fire", earth: "Earth", air: "Air", water: "Water" };
    const elemDynamic: Record<string, { strong: string; moderate: string }> = {
      fire: {
        strong: "You push each other to act. When you're together, things move — decisions get made, energy stays high, and neither of you lets the other sit still for too long. The risk is burning each other out or turning everything into a competition.",
        moderate: "You bring out each other's boldness. There's a charge when you're together that makes you both more willing to take risks and say what you mean. It keeps the relationship from ever feeling stale.",
      },
      earth: {
        strong: "You ground each other. This relationship has a built-in steadiness — you both value showing up, following through, and building something real. The downside is you can get stuck in routines and resist change together.",
        moderate: "There's a practical reliability between you. When things get chaotic, you tend to stabilize each other. You both appreciate loyalty and consistency, which gives this connection a quiet dependability.",
      },
      air: {
        strong: "You live in conversation. This is a relationship built on ideas, humor, and mental stimulation — you keep each other thinking. The risk is staying in your heads and avoiding the emotional depth underneath.",
        moderate: "You click mentally. There's an ease to how you communicate — inside jokes land, ideas bounce, and you rarely have to over-explain yourselves. That mental shorthand is a real asset in this relationship.",
      },
      water: {
        strong: "You feel everything together. This relationship runs on emotional intuition — you read each other without words and absorb each other's moods. The challenge is learning where your feelings end and theirs begin.",
        moderate: "There's an emotional undercurrent between you. You pick up on each other's moods easily and there's an unspoken understanding that doesn't need to be explained. It makes the hard conversations easier to navigate.",
      },
    };

    const e1Dom = (Object.keys(e1) as string[]).reduce((a, b) => (e1[a] >= e1[b] ? a : b));
    const e2Dom = (Object.keys(e2) as string[]).reduce((a, b) => (e2[a] >= e2[b] ? a : b));
    const bothDom = e1Dom === sharedDominant && e2Dom === sharedDominant;
    const strength = bothDom ? "strong" : "moderate";

    themes.push({
      title: isCity ? `Shared ${elemNames[sharedDominant]} DNA` : `Shared ${elemNames[sharedDominant]} Energy`,
      score: bothDom ? 50 : 40,
      summary: elemDynamic[sharedDominant][strength],
    });
  }

  // Fallback theme
  if (themes.length === 0) {
    if (isCity) {
      themes.push({
        title: "A Nuanced Relationship",
        score: 30,
        summary: "Your chart and this city's chart don't have the obvious compatibility markers — which means the relationship is more nuanced. Look at the individual aspects below to understand the specific ways this place affects you.",
      });
    } else {
      themes.push({
        title: "Complex Connection",
        score: 30,
        summary: "Your charts don't have the obvious 'textbook' compatibility markers — which means the connection is more nuanced. Look at the individual aspects below to understand the specific ways you connect.",
      });
    }
  }

  return themes;
}

// ---------- Main export ----------

/**
 * Bump this whenever the synastry copy/structure changes. Stored synastry
 * JSON carries the version; the Maps page auto-recalculates any connection
 * whose stored version is older, so users never see stale copy.
 */
export const SYNASTRY_VERSION = 2;

export function calculateSynastry(
  chart1: ChartData,
  chart2: ChartData,
  context: Context | string = "friend",
) {
  const ctx = (context || "friend") as Context;

  const allPoints1 = [...(chart1.planets || []), ...(chart1.specialPoints || [])];
  const allPoints2 = [...(chart2.planets || []), ...(chart2.specialPoints || [])];

  const core1 = chart1.planets || [];
  const core2 = chart2.planets || [];

  const crossAspects: CrossAspect[] = [];
  const fatedContacts: CrossAspect[] = [];

  for (const p1 of allPoints1) {
    for (const p2 of allPoints2) {
      const result = findAspect(p1.absPosition, p2.absPosition, ASPECTS);
      if (result) {
        const [aspectName, orb] = result;
        const entry: CrossAspect = {
          p1Name: p1.name,
          p1Sign: p1.sign,
          p2Name: p2.name,
          p2Sign: p2.sign,
          aspect: aspectName,
          orb,
        };

        // Outer-planet pairs are generational, not personal — never "fated".
        const isGenerational = OUTER_PLANETS.has(p1.name) && OUTER_PLANETS.has(p2.name);
        const isFated = !isGenerational && (FATED_BODIES.has(p1.name) || FATED_BODIES.has(p2.name));
        if (isFated) {
          entry.fated = true;
          entry.fatedReason = getFatedReason(p1.name, p2.name, aspectName, ctx);
          fatedContacts.push(entry);
        }

        crossAspects.push(entry);
      }
    }
  }

  crossAspects.sort((a, b) => a.orb - b.orb);
  const dedupedFated = dedupeNodalContacts(fatedContacts);
  dedupedFated.sort((a, b) => a.orb - b.orb);

  const elem1 = countElements(core1);
  const elem2 = countElements(core2);

  const themes = generateThemes(crossAspects, chart1, chart2, ctx);

  const harmony = crossAspects.filter(
    (a) => ["trine", "sextile", "conjunction"].includes(a.aspect) && a.orb < 5,
  ).length;
  const tension = crossAspects.filter(
    (a) => ["square", "opposition"].includes(a.aspect) && a.orb < 5,
  ).length;

  return {
    version: SYNASTRY_VERSION,
    crossAspects: crossAspects.slice(0, 30),
    fatedContacts: dedupedFated,
    elementBalance: { person1: elem1, person2: elem2 },
    themes,
    harmony,
    tension,
    totalAspects: crossAspects.length,
  };
}
