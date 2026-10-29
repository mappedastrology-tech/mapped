/**
 * Birth chart calculator — TypeScript port of calculate_chart.py.
 *
 * Uses astronomy-engine (see ephemeris.ts) to calculate:
 * - All 10 main planets + Chiron, North Node, South Node, Lilith
 * - 12 house cusps — Placidus or whole-sign (see vedic/houses.ts)
 * - Ascendant, Midheaven, Vertex
 * - Aspects between all planets
 * - Tropical or Sidereal (Vedic) zodiac. Sidereal positions subtract the
 *   ayanamsa for the BIRTH INSTANT (vedic/ayanamsa.ts), and sidereal charts
 *   also carry a `vedic` block: nakshatras, padas, navamsa, dasha inputs.
 *
 * Defaults (the conventions Mapped states in the UI):
 * - tropical → Placidus houses; sidereal → whole-sign houses
 * - mean lunar node unless nodeType "true" is asked for
 * - sidereal ayanamsa: Lahiri unless told otherwise
 */

import {
  SIGN_NAMES, ASPECTS,
  posToSign, findAspect,
} from "./constants";
import {
  julday, getAllPlanetPositions, getSpecialPoints, getHouses,
} from "./ephemeris";
import { resolveBirthOffset, type BirthOffset } from "./birthTimezone";
import { ayanamsaDegrees, normalizeAyanamsa, type AyanamsaName } from "./vedic/ayanamsa";
import { normalizeHouseSystem, wholeSignCusps, wholeSignHouse, type HouseSystem } from "./vedic/houses";
import { normalizeNodeType, trueNodeLongitude, type NodeType } from "./vedic/nodes";
import { buildVedicDetails } from "./vedic/vedicChart";

interface ChartInput {
  name: string;
  birthDate: string;   // "YYYY-MM-DD"
  birthTime: string;   // "HH:MM"
  latitude: number;
  longitude: number;
  cityName?: string;
  unknownTime?: boolean;
  zodiacSystem?: "tropical" | "sidereal";
  ayanamsa?: AyanamsaName | string | null;
  /** null/omitted → default for the zodiac (whole sign for sidereal, Placidus for tropical). */
  houseSystem?: HouseSystem | string | null;
  /** null/omitted → mean node. */
  nodeType?: NodeType | string | null;
  /**
   * The birthplace's stored zone (IANA id, "UTC±HH:MM" or "LMT"). Null, or the
   * legacy "UTC" placeholder, means unresolved: the zone is then ESTIMATED from
   * a coarse box table and the result says so (timezoneInfo.source). See
   * lib/astro/birthTimezone for every rule applied.
   */
  timezone?: string | null;
}

/**
 * UTC offset (hours, east-positive) for a LOCAL birth date and time at a place.
 *
 * `timezone` is the chart's stored zone; without one the zone is estimated
 * from the coordinates (see lib/astro/birthTimezone, which also handles local
 * mean time, pre-1970 history and clock-change days). `localHour` is decimal
 * (2.5 = 02:30) and defaults to noon for callers that predate it.
 */
export function getUtcOffsetHours(
  lat: number, lon: number, year: number, month: number, day: number, localHour = 12,
  timezone?: string | null,
): number {
  return resolveBirthOffset(timezone, lat, lon, year, month, day, localHour).offsetHours;
}

export function calculateChart(data: ChartInput) {
  const [year, month, day] = data.birthDate.split("-").map(Number);
  const [hour, minute] = data.birthTime.split(":").map(Number);
  const decimalHour = hour + minute / 60;

  const zodiacSystem = data.zodiacSystem === "sidereal" ? "sidereal" : "tropical";
  const isSidereal = zodiacSystem === "sidereal";
  const ayanamsaName = normalizeAyanamsa(data.ayanamsa);
  const houseSystem = normalizeHouseSystem(data.houseSystem, zodiacSystem);
  const nodeType = normalizeNodeType(data.nodeType);

  // Local birth time → UTC with the offset in force at that place on that date.
  const tz: BirthOffset = resolveBirthOffset(data.timezone, data.latitude, data.longitude, year, month, day, decimalHour);
  const utcHour = decimalHour - tz.offsetHours;
  const jd = julday(year, month, day, utcHour);

  // The ayanamsa AT THE BIRTH INSTANT (it grows ~50" a year — never a constant).
  const ayanamsaOffset = isSidereal ? ayanamsaDegrees(jd, ayanamsaName) : 0;
  /** Tropical longitude → the chart's zodiac, unrounded. */
  const toZodiac = (tropicalLon: number) =>
    isSidereal ? (((tropicalLon - ayanamsaOffset) % 360) + 360) % 360 : tropicalLon;

  // --- Planets --- (precise longitudes; rounded only when shaped for output)
  const rawPlanets = getAllPlanetPositions(jd, true);
  const planetLons = rawPlanets.map((p) => toZodiac(p.longitude));
  const planets = rawPlanets.map((p, i) => {
    const info = posToSign(planetLons[i]);
    return {
      name: p.name,
      sign: info.sign,
      signNum: info.signNum,
      position: info.position,
      absPosition: info.absPosition,
      house: null as number | null,
      retrograde: p.retrograde,
      // Within hours of a station (ephemeris.ts); optional until that lands everywhere.
      stationary: (p as { stationary?: boolean }).stationary ?? false,
    };
  });

  // --- Special points ---
  const rawSpecial = getSpecialPoints(jd);
  if (nodeType === "true") {
    // Swap the mean nodes for the true (osculating) node pair.
    const tn = trueNodeLongitude(jd);
    for (const p of rawSpecial) {
      if (p.name === "North Node") p.longitude = tn;
      if (p.name === "South Node") p.longitude = (tn + 180) % 360;
    }
  }
  const specialLons = rawSpecial.map((p) => toZodiac(p.longitude));
  const specialPoints = rawSpecial.map((p, i) => {
    const info = posToSign(specialLons[i]);
    return {
      name: p.name,
      sign: info.sign,
      signNum: info.signNum,
      position: info.position,
      absPosition: info.absPosition,
      house: null as number | null,
      retrograde: p.retrograde,
      // Within hours of a station (ephemeris.ts); optional until that lands everywhere.
      stationary: (p as { stationary?: boolean }).stationary ?? false,
    };
  });

  // --- Angles & houses ---
  const houseData = getHouses(jd, data.latitude, data.longitude);
  const ascLon = toZodiac(houseData.ascendant);
  const cusps = houseSystem === "whole_sign"
    ? wholeSignCusps(ascLon)
    : houseData.cusps.map(toZodiac);
  const houses = cusps.map((c, i) => {
    const info = posToSign(c);
    return { number: i + 1, sign: info.sign, signNum: info.signNum, position: info.position, absPosition: info.absPosition };
  });

  // Assign house numbers to planets. Houses, the Ascendant, and the Midheaven all
  // depend on the exact birth time (the Ascendant moves ~1° every 4 minutes), so
  // with an UNKNOWN time they must not be fabricated from the assumed noon —
  // downstream consumers (Dolly depth, interpretations, exports) would present
  // them as fact. Planet signs/degrees are kept (noon is the standard convention).
  if (!data.unknownTime) {
    for (const p of [...planets, ...specialPoints]) {
      p.house = houseSystem === "whole_sign"
        ? wholeSignHouse(p.absPosition, ascLon)
        : assignHouseFromCusps(p.absPosition, houses);
    }
  }

  // --- Ascendant --- Its own field, because with whole-sign houses the
  // house-1 cusp is 0° of the rising sign, not the Ascendant degree.
  let ascendant: { sign: string; signNum: number; position: number; absPosition: number } | null = null;
  if (!data.unknownTime) {
    const info = posToSign(ascLon);
    ascendant = { sign: info.sign, signNum: info.signNum, position: info.position, absPosition: info.absPosition };
  }

  // --- Midheaven --- (time-dependent; omitted for unknown-time charts)
  let midheaven: { sign: string; signNum: number; position: number; absPosition: number } | null = null;
  if (!data.unknownTime) {
    const info = posToSign(toZodiac(houseData.mc));
    midheaven = { sign: info.sign, signNum: info.signNum, position: info.position, absPosition: info.absPosition };
  }

  // --- Vertex (fated point) ---
  // Kept as a top-level field rather than a specialPoint so it powers synastry's
  // fated marks without leaking into the natal placement list / chart analysis.
  // Requires an accurate birth time, so it's omitted for unknown-time charts.
  let vertex: { sign: string; signNum: number; position: number; absPosition: number } | null = null;
  if (!data.unknownTime) {
    const vInfo = posToSign(toZodiac(houseData.vertex));
    vertex = { sign: vInfo.sign, signNum: vInfo.signNum, position: vInfo.position, absPosition: vInfo.absPosition };
  }

  // --- Aspects ---
  // The South Node is always exactly opposite the North Node: its aspects are
  // the North Node's restated, plus a meaningless "opposition, orb 0".
  const allBodies = [...planets, ...specialPoints].filter((b) => b.name !== "South Node");
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
    rising: ascendant?.sign || "",
  };

  // --- Rising sign cusp check --- (meaningless without a real Ascendant)
  let risingCusp = null;
  if (ascendant && ascendant.position < 1.0) {
    const prevSign = SIGN_NAMES[(ascendant.signNum - 1 + 12) % 12];
    risingCusp = {
      current: ascendant.sign,
      alternate: prevSign,
      position: Math.round(ascendant.position * 100) / 100,
      message: `Your rising sign is right on the ${prevSign}/${ascendant.sign} cusp. A difference of just a few minutes in birth time could change it. If you know your rising sign from another source, trust that.`,
    };
  } else if (ascendant && ascendant.position > 29.0) {
    const nextSign = SIGN_NAMES[(ascendant.signNum + 1) % 12];
    risingCusp = {
      current: ascendant.sign,
      alternate: nextSign,
      position: Math.round(ascendant.position * 100) / 100,
      message: `Your rising sign is right on the ${ascendant.sign}/${nextSign} cusp. A difference of just a few minutes in birth time could change it. If you know your rising sign from another source, trust that.`,
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
    // The zone as stored — null when it was only estimated, so a save never
    // records a guess as the birthplace's zone. timezoneInfo is for display.
    timezone: tz.zone,
    timezoneInfo: tz,
    zodiacSystem,
    houseSystem,
    houseSystemUsed: houseSystem === "whole_sign" ? "whole_sign" : (houseData as { houseSystemUsed?: string }).houseSystemUsed ?? "placidus",
    polarFallback: houseSystem !== "whole_sign" && ((houseData as { polarFallback?: boolean }).polarFallback ?? false),
    nodeType,
    bigThree,
    planets,
    specialPoints,
    ascendant,
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
    result.ayanamsaDegrees = Math.round(ayanamsaOffset * 10000) / 10000;
    result.vedic = buildVedicDetails({
      bodies: [
        ...rawPlanets.map((p, i) => ({ name: p.name, longitude: planetLons[i], retrograde: p.retrograde, house: planets[i].house })),
        ...rawSpecial.map((p, i) => ({ name: p.name, longitude: specialLons[i], retrograde: p.retrograde, house: specialPoints[i].house })),
      ],
      ascendantLongitude: data.unknownTime ? null : ascLon,
      ayanamsa: ayanamsaName,
      ayanamsaDegrees: ayanamsaOffset,
      houseSystem,
      nodeType,
      birthUtc: new Date((jd - 2440587.5) * 86400000),
      unknownTime: !!data.unknownTime,
    });
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
