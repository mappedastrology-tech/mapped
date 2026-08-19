/**
 * Birth chart calculator — TypeScript port of calculate_chart.py.
 *
 * Uses Swiss Ephemeris (via swisseph npm) to calculate:
 * - All 10 main planets + Chiron, North Node, South Node
 * - 12 house cusps (Placidus system)
 * - Midheaven
 * - Aspects between all planets
 * - Supports Tropical and Sidereal (Vedic) zodiac
 */

import {
  SIGN_NAMES, AYANAMSA_VALUES, ASPECTS,
  posToSign, applySidereal, findAspect,
} from "./constants";
import {
  julday, getAllPlanetPositions, getSpecialPoints, getHouses,
} from "./ephemeris";
import { getTimezoneForCoords } from "./timezone";

interface ChartInput {
  name: string;
  birthDate: string;   // "YYYY-MM-DD"
  birthTime: string;   // "HH:MM"
  latitude: number;
  longitude: number;
  cityName?: string;
  unknownTime?: boolean;
  zodiacSystem?: "tropical" | "sidereal";
  ayanamsa?: "lahiri" | "krishnamurti" | "raman";
}

/** Offset (hours, east-positive) of `tzName` at a specific UTC instant. */
function offsetAtInstant(tzName: string, utcMs: number): number {
  const ref = new Date(utcMs);
  const fmt = (tz: string) =>
    ref.toLocaleString("en-US", { timeZone: tz, hour: "numeric", hour12: false, minute: "numeric" });
  const [utcH, utcM] = fmt("UTC").split(":").map(Number);
  const [locH, locM] = fmt(tzName).split(":").map(Number);
  let offset = (locH - utcH) + (locM - utcM) / 60;
  if (offset > 12) offset -= 24;
  if (offset < -12) offset += 24;
  return offset;
}

/**
 * Get the UTC offset (in hours, east-positive) for a given location at a given
 * LOCAL date and time. Uses a pure-JS timezone lookup (no filesystem
 * dependencies) and Intl to resolve DST at the actual birth instant.
 *
 * `localHour` (decimal, e.g. 2.5 for 02:30) is optional for backward
 * compatibility; without it we fall back to noon local, which was the old
 * behaviour. Sampling at noon was wrong for births on a DST-transition day
 * that fall on the other side of the switch from noon (an hour off → the
 * Ascendant off ~15°). We resolve the local time to a UTC instant iteratively:
 * guess the offset at noon, compute the UTC instant for the requested local
 * time under that guess, re-read the offset at that instant, and repeat once —
 * two passes converge for every real-world DST rule.
 */
export function getUtcOffsetHours(
  lat: number, lon: number, year: number, month: number, day: number, localHour = 12,
): number {
  const tzName = getTimezoneForCoords(lat, lon);
  if (!tzName) return 0;

  const localMs = Date.UTC(year, month - 1, day, 0, 0) + localHour * 3600_000; // local wall clock, as if UTC
  let offset = offsetAtInstant(tzName, Date.UTC(year, month - 1, day, 12, 0));  // seed at noon
  for (let i = 0; i < 2; i++) {
    const utcGuess = localMs - offset * 3600_000;
    offset = offsetAtInstant(tzName, utcGuess);
  }
  return offset;
}

export function calculateChart(data: ChartInput) {
  const [year, month, day] = data.birthDate.split("-").map(Number);
  const [hour, minute] = data.birthTime.split(":").map(Number);
  const decimalHour = hour + minute / 60;

  const zodiacSystem = data.zodiacSystem || "tropical";
  const ayanamsaName = data.ayanamsa || "lahiri";
  const isSidereal = zodiacSystem === "sidereal";
  const ayanamsaOffset = isSidereal ? (AYANAMSA_VALUES[ayanamsaName] ?? 24.17) : 0;

  // Convert local birth time to UTC using the real timezone for this location.
  // Pure-JS timezone lookup determines the IANA timezone from coordinates,
  // then Intl gives the UTC offset at the specific birth date (handling DST).
  const tzOffset = getUtcOffsetHours(data.latitude, data.longitude, year, month, day, decimalHour);
  const utcHour = decimalHour - tzOffset;
  const jd = julday(year, month, day, utcHour);

  // --- Planets ---
  const rawPlanets = getAllPlanetPositions(jd);
  const planets = rawPlanets.map((p) => {
    const tropicalAbs = p.longitude;
    if (isSidereal) {
      const sid = applySidereal(tropicalAbs, ayanamsaOffset);
      return {
        name: p.name,
        sign: sid.sign,
        signNum: sid.signNum,
        position: sid.position,
        absPosition: sid.absPosition,
        house: null as number | null,
        retrograde: p.retrograde,
      };
    }
    const info = posToSign(tropicalAbs);
    return {
      name: p.name,
      sign: info.sign,
      signNum: info.signNum,
      position: info.position,
      absPosition: info.absPosition,
      house: null as number | null,
      retrograde: p.retrograde,
    };
  });

  // --- Special points ---
  const rawSpecial = getSpecialPoints(jd);
  const specialPoints = rawSpecial.map((p) => {
    const tropicalAbs = p.longitude;
    if (isSidereal) {
      const sid = applySidereal(tropicalAbs, ayanamsaOffset);
      return {
        name: p.name,
        sign: sid.sign,
        signNum: sid.signNum,
        position: sid.position,
        absPosition: sid.absPosition,
        house: null as number | null,
        retrograde: p.retrograde,
      };
    }
    const info = posToSign(tropicalAbs);
    return {
      name: p.name,
      sign: info.sign,
      signNum: info.signNum,
      position: info.position,
      absPosition: info.absPosition,
      house: null as number | null,
      retrograde: p.retrograde,
    };
  });

  // --- Houses ---
  const houseData = getHouses(jd, data.latitude, data.longitude);
  const houses = houseData.cusps.map((cusp, i) => {
    const tropicalAbs = cusp;
    if (isSidereal) {
      const sid = applySidereal(tropicalAbs, ayanamsaOffset);
      return { number: i + 1, sign: sid.sign, signNum: sid.signNum, position: sid.position, absPosition: sid.absPosition };
    }
    const info = posToSign(tropicalAbs);
    return { number: i + 1, sign: info.sign, signNum: info.signNum, position: info.position, absPosition: info.absPosition };
  });

  // Assign house numbers to planets. Houses, the Ascendant, and the Midheaven all
  // depend on the exact birth time (the Ascendant moves ~1° every 4 minutes), so
  // with an UNKNOWN time they must not be fabricated from the assumed noon —
  // downstream consumers (Dolly depth, interpretations, exports) would present
  // them as fact. Planet signs/degrees are kept (noon is the standard convention).
  if (!data.unknownTime) {
    for (const p of [...planets, ...specialPoints]) {
      // Use the tropical positions for house assignment (houses are tropical internally)
      p.house = assignHouseFromCusps(p.absPosition, houses);
    }
  }

  // --- Midheaven --- (time-dependent; omitted for unknown-time charts)
  let midheaven: { sign: string; signNum: number; position: number; absPosition: number } | null = null;
  if (!data.unknownTime) {
    const mcLon = houseData.mc;
    if (isSidereal) {
      const sid = applySidereal(mcLon, ayanamsaOffset);
      midheaven = { sign: sid.sign, signNum: sid.signNum, position: sid.position, absPosition: sid.absPosition };
    } else {
      const info = posToSign(mcLon);
      midheaven = { sign: info.sign, signNum: info.signNum, position: info.position, absPosition: info.absPosition };
    }
  }

  // --- Vertex (fated point) ---
  // Kept as a top-level field rather than a specialPoint so it powers synastry's
  // fated marks without leaking into the natal placement list / chart analysis.
  // Requires an accurate birth time, so it's omitted for unknown-time charts.
  let vertex: { sign: string; signNum: number; position: number; absPosition: number } | null = null;
  if (!data.unknownTime) {
    const vLon = houseData.vertex;
    const vInfo = isSidereal ? applySidereal(vLon, ayanamsaOffset) : posToSign(vLon);
    vertex = { sign: vInfo.sign, signNum: vInfo.signNum, position: vInfo.position, absPosition: vInfo.absPosition };
  }

  // --- Aspects ---
  const allBodies = [...planets, ...specialPoints];
  const aspects: { p1Name: string; p2Name: string; aspect: string; orbit: number; aspectDegrees: number }[] = [];
  for (let i = 0; i < allBodies.length; i++) {
    for (let j = i + 1; j < allBodies.length; j++) {
      const result = findAspect(allBodies[i].absPosition, allBodies[j].absPosition, ASPECTS);
      if (result) {
        const [aspectName, orb] = result;
        const exactDeg = ASPECTS.find(a => a[0] === aspectName)?.[1] ?? 0;
        aspects.push({
          p1Name: allBodies[i].name,
          p2Name: allBodies[j].name,
          aspect: aspectName,
          orbit: orb,
          aspectDegrees: exactDeg,
        });
      }
    }
  }
  aspects.sort((a, b) => a.orbit - b.orbit);

  // --- Big Three --- (Rising requires an exact birth time; empty when unknown)
  const bigThree = {
    sun: planets[0]?.sign || "",
    moon: planets[1]?.sign || "",
    rising: data.unknownTime ? "" : (houses[0]?.sign || ""),
  };

  // --- Rising sign cusp check --- (meaningless without a real Ascendant)
  let risingCusp = null;
  const risingPosition = data.unknownTime ? 15 : (houses[0]?.position ?? 15);
  if (risingPosition < 1.0) {
    const prevSign = SIGN_NAMES[(houses[0].signNum - 1 + 12) % 12];
    risingCusp = {
      current: houses[0].sign,
      alternate: prevSign,
      position: Math.round(risingPosition * 100) / 100,
      message: `Your rising sign is right on the ${prevSign}/${houses[0].sign} cusp. A difference of just a few minutes in birth time could change it. If you know your rising sign from another source, trust that.`,
    };
  } else if (risingPosition > 29.0) {
    const nextSign = SIGN_NAMES[(houses[0].signNum + 1) % 12];
    risingCusp = {
      current: houses[0].sign,
      alternate: nextSign,
      position: Math.round(risingPosition * 100) / 100,
      message: `Your rising sign is right on the ${houses[0].sign}/${nextSign} cusp. A difference of just a few minutes in birth time could change it. If you know your rising sign from another source, trust that.`,
    };
  }

  // --- Build result ---
  const result: Record<string, unknown> = {
    name: data.name,
    birthDate: data.birthDate,
    birthTime: data.birthTime,
    unknownTime: data.unknownTime || false,
    cityName: data.cityName || "Unknown",
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: "UTC", // Simplified — full timezone detection would need a lookup table
    zodiacSystem,
    bigThree,
    planets,
    specialPoints,
    midheaven,
    vertex,
    // House cusps are time-dependent — emit none for unknown-time charts so no
    // consumer can render/interpret an assumed-noon house wheel as real.
    houses: data.unknownTime ? [] : houses,
    aspects,
    risingCusp,
  };

  if (isSidereal) {
    result.ayanamsa = ayanamsaName;
    result.ayanamsaDegrees = ayanamsaOffset;
  }

  return result;
}

function assignHouseFromCusps(
  planetPos: number,
  houses: { number: number; absPosition: number }[]
): number {
  for (let i = 0; i < houses.length; i++) {
    const cuspStart = houses[i].absPosition;
    const cuspEnd = houses[(i + 1) % houses.length].absPosition;

    if (cuspEnd < cuspStart) {
      if (planetPos >= cuspStart || planetPos < cuspEnd) {
        return houses[i].number;
      }
    } else {
      if (planetPos >= cuspStart && planetPos < cuspEnd) {
        return houses[i].number;
      }
    }
  }
  return 1;
}
