/**
 * Astrocartography calculator — TypeScript port of calculate_astrocartography.py.
 *
 * Calculates where each planet in a birth chart falls on the four angles
 * (Ascendant, Descendant, Midheaven, IC) at every longitude on Earth.
 * Returns lines that can be plotted on a world map.
 *
 * Uses astronomy-engine (pure JS) for astronomical calculations.
 */

import { julday, getPlanetLongitude, getHouses } from "./ephemeris";

// ---------- Constants ----------

/** Planet names for astrocartography (includes North Node) */
const PLANET_NAMES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "North Node",
];

/** Colors for each planet (for frontend rendering) */
export const PLANET_COLORS: Record<string, string> = {
  Sun: "#f0c040",
  Moon: "#c0c0d0",
  Mercury: "#80b0d0",
  Venus: "#e08080",
  Mars: "#d05040",
  Jupiter: "#8060c0",
  Saturn: "#707060",
  Uranus: "#40b0b0",
  Neptune: "#6080d0",
  Pluto: "#905050",
  "North Node": "#b08040",
};

/** Line style per angle type */
export const ANGLE_STYLES: Record<string, string> = {
  ASC: "solid",
  DSC: "dashed",
  MC: "solid",
  IC: "dashed",
};

/** What each angle means for you in that location */
const ANGLE_MEANINGS: Record<string, string> = {
  ASC: "Rising — shapes your identity and how people see you in this area",
  DSC: "Setting — affects your relationships and partnerships in this area",
  MC: "Midheaven — influences your career and public reputation in this area",
  IC: "Nadir — affects your home life, roots, and inner security in this area",
};

/** What each planet activates */
export const PLANET_MEANINGS: Record<string, Record<string, string>> = {
  Sun: {
    keyword: "Vitality & Purpose",
    ASC: "You shine here. Your confidence and sense of self are amplified. People notice you and you feel most like yourself.",
    DSC: "You attract powerful partnerships here. Relationships in this area feel significant and identity-defining.",
    MC: "Career success and recognition come naturally here. This is where you build your legacy.",
    IC: "Deep sense of belonging. This place feels like home in a soul-level way. Good for putting down roots.",
  },
  Moon: {
    keyword: "Emotional Life",
    ASC: "Your emotions are right on the surface here. You feel everything more intensely. Great for emotional healing.",
    DSC: "Emotionally deep relationships form here. You attract nurturing partners.",
    MC: "Your public image is warm and approachable here. Good for careers involving care, food, or family.",
    IC: "Maximum emotional comfort. This is the place that feels most like home. Family connections are strong.",
  },
  Venus: {
    keyword: "Love & Beauty",
    ASC: "You feel beautiful and magnetic here. Social life thrives and romance comes easily.",
    DSC: "Love relationships flourish here. This is one of the best lines for finding a partner.",
    MC: "Success in creative fields, art, fashion, or anything aesthetic. People find you charming.",
    IC: "Your home here is beautiful and harmonious. Domestic life is peaceful and pleasurable.",
  },
  Mars: {
    keyword: "Drive & Conflict",
    ASC: "High energy and ambition here, but also conflicts and arguments. You feel driven but combative.",
    DSC: "Passionate but contentious relationships. Attraction is intense but fights are frequent.",
    MC: "Career drive is intense. Good for competitive fields, sports, military. Watch for workplace conflicts.",
    IC: "Restless home life. Renovations, arguments at home, or a drive to constantly change your living situation.",
  },
  Jupiter: {
    keyword: "Luck & Expansion",
    ASC: "Everything expands here — your optimism, opportunities, and sometimes your waistline. Lucky place.",
    DSC: "Generous, expansive relationships. You meet people who open doors and broaden your worldview.",
    MC: "Career growth and abundance. Promotions, recognition, and financial success come more easily.",
    IC: "Big, comfortable home. Abundance in domestic life. Good for family growth and real estate.",
  },
  Saturn: {
    keyword: "Discipline & Lessons",
    ASC: "Life feels harder here but the growth is real. You mature, take on responsibility, and build character.",
    DSC: "Serious, committed relationships but also heavy ones. Partnerships teach hard lessons.",
    MC: "Slow, earned career success. You build authority over time. Not easy, but lasting.",
    IC: "Heavy feeling at home. Family responsibilities weigh on you. Good for discipline, hard for comfort.",
  },
  Uranus: {
    keyword: "Freedom & Disruption",
    ASC: "You reinvent yourself here. Unexpected events shake up your identity. Exciting but unstable.",
    DSC: "Unconventional relationships. You attract unusual partners or your relationships take unexpected turns.",
    MC: "Sudden career changes — breakthroughs or breakdowns. Great for innovation and tech careers.",
    IC: "Unstable home life. Frequent moves or radical changes to your living situation. Freedom from roots.",
  },
  Neptune: {
    keyword: "Creativity & Illusion",
    ASC: "Dreamy, creative, spiritual energy. But also confusion about identity. Art flows easily here.",
    DSC: "Idealized relationships that may not be what they seem. Spiritual connections but also deception.",
    MC: "Creative career success — music, film, art, healing. But career direction may feel foggy.",
    IC: "Spiritual home. The place feels magical but boundaries dissolve. Watch for escapism.",
  },
  Pluto: {
    keyword: "Transformation & Power",
    ASC: "Intense personal transformation. You become a more powerful version of yourself here, but it is not comfortable.",
    DSC: "Intense, transformative relationships. Power dynamics are strong. Nothing stays surface-level.",
    MC: "Power and influence in career. You can rise to the top here, but watch for power struggles.",
    IC: "Deep psychological transformation at home. Family secrets surface. Profound but heavy.",
  },
  Mercury: {
    keyword: "Communication & Learning",
    ASC: "Your mind is sharp here. Communication flows, learning accelerates, and you connect easily with people.",
    DSC: "Intellectual partnerships. You attract people you can talk to for hours.",
    MC: "Great for writing, teaching, business, media careers. Your ideas get heard.",
    IC: "Your home is a hub of activity and conversation. Good for working from home and learning.",
  },
  "North Node": {
    keyword: "Destiny & Soul Growth",
    ASC: "You step into your purpose here. Life feels aligned, like you are finally moving in the right direction.",
    DSC: "Fated partnerships. The people you meet here push you toward who you are becoming.",
    MC: "Your career here feels like a calling, not just a job. Public recognition for being authentically yourself.",
    IC: "Soul-level roots. This place connects you to something ancestral or deeply purposeful.",
  },
};

// ---------- Types ----------

interface AstrocartographyInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHourUtc: number;
  birthLat: number;
  birthLng: number;
  targetLat?: number;
  targetLng?: number;
  radius?: number;
}

interface LinePoint {
  0: number; // latitude
  1: number; // longitude
}

interface AstroLine {
  planet: string;
  angle: string;
  points: [number, number][];
  color: string;
  style: string;
  keyword: string;
  meaning: string;
}

interface NearbyLine {
  planet: string;
  angle: string;
  distance: number;
  keyword: string;
  meaning: string;
  color: string;
}

interface Paran {
  planet1: string;
  angle1: string;
  planet2: string;
  angle2: string;
  lat: number;
  lng: number;
  distance: number;
  color1: string;
  color2: string;
}

// ---------- Helpers ----------

function calcHousesForLocation(jd: number, lat: number, lng: number): { ascendant: number; mc: number } {
  const result = getHouses(jd, lat, lng);
  return {
    ascendant: result.ascendant,
    mc: result.mc,
  };
}

function angularDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

// ---------- Core calculation ----------

function calculateLines(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHourUtc: number,
): { lines: AstroLine[]; planets: Record<string, number> } {
  const jd = julday(birthYear, birthMonth, birthDay, birthHourUtc);

  // Get planetary positions
  const planetPositions: Record<string, number> = {};
  for (const name of PLANET_NAMES) {
    planetPositions[name] = Math.round(getPlanetLongitude(jd, name) * 100) / 100;
  }

  const lines: AstroLine[] = [];

  for (const [planetName, planetLon] of Object.entries(planetPositions)) {
    for (const angleType of ["ASC", "DSC", "MC", "IC"] as const) {
      const points: [number, number][] = [];

      if (angleType === "MC" || angleType === "IC") {
        const targetMc = angleType === "MC" ? planetLon : (planetLon + 180) % 360;

        // MC depends only on longitude, so find the longitude
        let bestLng: number | null = null;
        let bestDiff = 999;

        // Coarse scan
        for (let testLng = -180; testLng <= 180; testLng++) {
          try {
            const { mc } = calcHousesForLocation(jd, 0.0, testLng);
            const diff = angularDiff(mc, targetMc);
            if (diff < bestDiff) {
              bestDiff = diff;
              bestLng = testLng;
            }
          } catch {
            continue;
          }
        }

        // Fine scan
        if (bestLng !== null && bestDiff < 3) {
          for (let fine = (bestLng - 2) * 10; fine <= (bestLng + 2) * 10; fine++) {
            const fl = fine / 10.0;
            try {
              const { mc } = calcHousesForLocation(jd, 0.0, fl);
              const diff = angularDiff(mc, targetMc);
              if (diff < bestDiff) {
                bestDiff = diff;
                bestLng = fl;
              }
            } catch {
              continue;
            }
          }
        }

        if (bestLng !== null && bestDiff < 1) {
          // MC/IC lines are nearly vertical
          for (let lat = -65; lat <= 65; lat += 3) {
            points.push([lat, Math.round(bestLng * 10) / 10]);
          }
        }
      } else {
        // ASC/DSC lines curve — find longitude for each latitude
        const targetOffset = angleType === "ASC" ? 0 : 180;

        for (let lat = -60; lat <= 60; lat += 3) {
          let bestLng: number | null = null;
          let bestDiff = 999;
          const target = (planetLon + targetOffset) % 360;

          // Coarse scan
          for (let testLng = -180; testLng <= 180; testLng += 2) {
            try {
              const { ascendant: asc } = calcHousesForLocation(jd, lat, testLng);
              const diff = angularDiff(asc, target);
              if (diff < bestDiff) {
                bestDiff = diff;
                bestLng = testLng;
              }
            } catch {
              continue;
            }
          }

          // Fine scan
          if (bestLng !== null && bestDiff < 5) {
            for (let fine = (bestLng - 3) * 10; fine <= (bestLng + 3) * 10; fine++) {
              const fl = fine / 10.0;
              if (fl < -180 || fl > 180) continue;
              try {
                const { ascendant: asc } = calcHousesForLocation(jd, lat, fl);
                const diff = angularDiff(asc, target);
                if (diff < bestDiff) {
                  bestDiff = diff;
                  bestLng = fl;
                }
              } catch {
                continue;
              }
            }

            if (bestDiff < 1.5) {
              points.push([lat, Math.round(bestLng! * 10) / 10]);
            }
          }
        }
      }

      if (points.length > 2) {
        const meaning = PLANET_MEANINGS[planetName]?.[angleType] ?? "";
        lines.push({
          planet: planetName,
          angle: angleType,
          points,
          color: PLANET_COLORS[planetName] ?? "#888",
          style: ANGLE_STYLES[angleType] ?? "solid",
          keyword: PLANET_MEANINGS[planetName]?.keyword ?? "",
          meaning,
        });
      }
    }
  }

  return { lines, planets: planetPositions };
}

// ---------- Nearby lines ----------

function findNearbyLines(
  lines: AstroLine[],
  targetLat: number,
  targetLng: number,
  radiusDeg: number = 5,
): NearbyLine[] {
  const nearby: NearbyLine[] = [];

  for (const line of lines) {
    for (const pt of line.points) {
      const latDiff = Math.abs(pt[0] - targetLat);
      let lngDiff = Math.abs(pt[1] - targetLng);
      if (lngDiff > 180) lngDiff = 360 - lngDiff;
      const dist = Math.sqrt(latDiff ** 2 + lngDiff ** 2);

      if (dist < radiusDeg) {
        nearby.push({
          planet: line.planet,
          angle: line.angle,
          distance: Math.round(dist * 10) / 10,
          keyword: line.keyword,
          meaning: line.meaning,
          color: line.color,
        });
        break; // one match per line
      }
    }
  }

  nearby.sort((a, b) => a.distance - b.distance);
  return nearby;
}

// ---------- Parans ----------

function findParans(lines: AstroLine[], toleranceDeg: number = 2.0): Paran[] {
  const best: Record<string, Paran> = {};

  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const lineA = lines[i];
      const lineB = lines[j];

      if (lineA.planet === lineB.planet) continue; // same planet, skip

      const key = `${lineA.planet}|${lineA.angle}|${lineB.planet}|${lineB.angle}`;

      let bestDist = toleranceDeg + 1;
      let bestPt: [number, number] | null = null;

      for (const ptA of lineA.points) {
        for (const ptB of lineB.points) {
          const latDiff = Math.abs(ptA[0] - ptB[0]);
          let lngDiff = Math.abs(ptA[1] - ptB[1]);
          if (lngDiff > 180) lngDiff = 360 - lngDiff;
          const dist = Math.sqrt(latDiff ** 2 + lngDiff ** 2);

          if (dist < bestDist) {
            bestDist = dist;
            bestPt = [
              Math.round((ptA[0] + ptB[0]) / 2 * 10) / 10,
              Math.round((ptA[1] + ptB[1]) / 2 * 10) / 10,
            ];
          }
        }
      }

      if (bestDist <= toleranceDeg && bestPt !== null) {
        if (!best[key] || bestDist < best[key].distance) {
          best[key] = {
            planet1: lineA.planet,
            angle1: lineA.angle,
            planet2: lineB.planet,
            angle2: lineB.angle,
            lat: bestPt[0],
            lng: bestPt[1],
            distance: Math.round(bestDist * 100) / 100,
            color1: lineA.color,
            color2: lineB.color,
          };
        }
      }
    }
  }

  const parans = Object.values(best);
  parans.sort((a, b) => a.distance - b.distance);
  return parans;
}

// ---------- Main export ----------

export function calculateAstrocartography(input: AstrocartographyInput) {
  const { birthYear, birthMonth, birthDay, birthHourUtc } = input;

  const result = calculateLines(birthYear, birthMonth, birthDay, birthHourUtc);

  // Find parans (line crossings)
  const parans = findParans(result.lines);

  const output: Record<string, unknown> = {
    lines: result.lines,
    planets: result.planets,
    parans,
  };

  // If a target location is provided, find nearby lines
  if (input.targetLat !== undefined && input.targetLng !== undefined) {
    output.nearbyLines = findNearbyLines(
      result.lines,
      input.targetLat,
      input.targetLng,
      input.radius ?? 5,
    );
  }

  return output;
}
