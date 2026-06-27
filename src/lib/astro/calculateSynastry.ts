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
import {
  FATED_BODIES,
  evaluateFatedMark,
  type FatedCategory,
} from "./fatedMarks";

const NODE_POINTS = new Set(["North Node", "South Node"]);

// Outer-planet pairs are generational — nearly everyone born within a few years
// shares them, so they don't qualify as personal "fated" contacts.
const OUTER_PLANETS = new Set(["Uranus", "Neptune", "Pluto"]);

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
  /** Top-level fated point; present only for known-birth-time charts. */
  vertex?: { sign: string; absPosition: number; [key: string]: unknown } | null;
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
  // Fated-mark metadata (present when fated === true)
  fatedCategory?: FatedCategory;
  fatedCategoryLabel?: string;
  fatedKeywords?: string[];
  fatedWeight?: number;
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
export const SYNASTRY_VERSION = 7;

export function calculateSynastry(
  chart1: ChartData,
  chart2: ChartData,
  context: Context | string = "friend",
) {
  const ctx = (context || "friend") as Context;

  const allPoints1 = [...(chart1.planets || []), ...(chart1.specialPoints || [])];
  const allPoints2 = [...(chart2.planets || []), ...(chart2.specialPoints || [])];

  // The Vertex lives as a top-level chart field (known-time charts only); fold
  // it into the point lists so it participates in fated-mark detection.
  if (chart1.vertex?.absPosition != null) {
    allPoints1.push({ name: "Vertex", sign: chart1.vertex.sign, absPosition: chart1.vertex.absPosition });
  }
  if (chart2.vertex?.absPosition != null) {
    allPoints2.push({ name: "Vertex", sign: chart2.vertex.sign, absPosition: chart2.vertex.absPosition });
  }

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
          const mark = evaluateFatedMark(p1.name, p2.name, aspectName, orb, ctx);
          if (mark) {
            entry.fated = true;
            entry.fatedReason = mark.reason;
            entry.fatedCategory = mark.category;
            entry.fatedCategoryLabel = mark.categoryLabel;
            entry.fatedKeywords = mark.keywords;
            entry.fatedWeight = mark.weight;
            fatedContacts.push(entry);
          }
        }

        crossAspects.push(entry);
      }
    }
  }

  crossAspects.sort((a, b) => a.orb - b.orb);
  const dedupedFated = dedupeNodalContacts(fatedContacts);
  // Order fated marks by importance (weight), tightest orb breaks ties.
  dedupedFated.sort((a, b) => (b.fatedWeight ?? 0) - (a.fatedWeight ?? 0) || a.orb - b.orb);

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
