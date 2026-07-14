// Precomputed "depth" text block for the Dolly astrology chatbot.
//
// Pure, dependency-free. Given a user's natal chart, it derives the heavier
// traditional-astrology math (aspects, dignities, chart shape, profections,
// Part of Fortune) up front so the chatbot can read it as plain text instead
// of computing it live. Everything is guarded: a missing field means the
// affected section is skipped, never thrown.

export interface DepthChart {
  bigThree?: { sun: string; moon: string; rising: string };
  planets?: {
    name: string;
    sign: string;
    position: number;
    house: string | null;
    retrograde: boolean;
  }[];
  houses?: { number: number; sign: string; position: number }[];
  birthDate?: string; // e.g. "1994-11-07"
}

// ---------------------------------------------------------------------------
// Local tables
// ---------------------------------------------------------------------------

// 3-letter sign abbreviations in zodiacal order (index 0..11).
const SIGN_ABBR = [
  "Ari",
  "Tau",
  "Gem",
  "Can",
  "Leo",
  "Vir",
  "Lib",
  "Sco",
  "Sag",
  "Cap",
  "Aqu",
  "Pis",
] as const;

const SIGN_FULL = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

// Traditional domicile ruler for each sign index (0..11).
const DOMICILE_RULER = [
  "Mars", // Ari
  "Venus", // Tau
  "Mercury", // Gem
  "Moon", // Can
  "Sun", // Leo
  "Mercury", // Vir
  "Venus", // Lib
  "Mars", // Sco
  "Jupiter", // Sag
  "Saturn", // Cap
  "Saturn", // Aqu
  "Jupiter", // Pis
] as const;

// Exaltation sign (as sign index) for the seven classical planets.
const EXALTATION: Record<string, number> = {
  Sun: 0, // Aries
  Moon: 1, // Taurus
  Mercury: 5, // Virgo
  Venus: 11, // Pisces
  Mars: 9, // Capricorn
  Jupiter: 3, // Cancer
  Saturn: 6, // Libra
};

// Sign(s) a planet rules by domicile (as sign indices), derived from DOMICILE_RULER.
function domicileSignsOf(planet: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < 12; i++) {
    if (DOMICILE_RULER[i] === planet) out.push(i);
  }
  return out;
}

const CLASSICAL_7 = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
] as const;

const ASPECT_BODIES = [
  "Sun",
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

const ASPECTS = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "sextile", angle: 60, orb: 4 },
  { name: "square", angle: 90, orb: 7 },
  { name: "trine", angle: 120, orb: 8 },
  { name: "opposition", angle: 180, orb: 8 },
] as const;

const HOUSE_THEMES: Record<number, string> = {
  1: "self/body",
  2: "money",
  3: "siblings/communication",
  4: "home/roots",
  5: "creativity/romance/children",
  6: "work/health",
  7: "partnership",
  8: "shared resources/depth",
  9: "travel/belief",
  10: "career/public",
  11: "friends/hopes",
  12: "solitude/unconscious",
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function signIndex(abbr: string | undefined | null): number {
  if (!abbr) return -1;
  return SIGN_ABBR.indexOf(abbr.slice(0, 3) as (typeof SIGN_ABBR)[number]);
}

function fullSign(idx: number): string {
  return idx >= 0 && idx < 12 ? SIGN_FULL[idx] : "Unknown";
}

function norm360(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

// Angular separation folded to 0..180.
function separation(a: number, b: number): number {
  let diff = Math.abs(norm360(a) - norm360(b)) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

// Absolute ecliptic longitude from a chart body (sign + within-sign position).
function absLongOf(body: {
  sign: string;
  position: number;
} | undefined): number | null {
  if (!body) return null;
  const idx = signIndex(body.sign);
  if (idx < 0) return null;
  if (typeof body.position !== "number" || Number.isNaN(body.position)) return null;
  return idx * 30 + body.position;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Parse the numeric house number out of a house field which may be a string
// like "4", "4th", "House 4", etc.
function houseNumberOf(house: string | null | undefined): number | null {
  if (house == null) return null;
  const m = String(house).match(/\d+/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return n >= 1 && n <= 12 ? n : null;
}

type PlanetMap = Record<string, { absLong: number; house: number | null; sign: string }>;

function buildPlanetMap(chart: DepthChart): PlanetMap {
  const map: PlanetMap = {};
  if (!chart.planets) return map;
  for (const p of chart.planets) {
    const abs = absLongOf(p);
    if (abs == null) continue;
    map[p.name] = {
      absLong: norm360(abs),
      house: houseNumberOf(p.house),
      sign: p.sign,
    };
  }
  return map;
}

// ---------------------------------------------------------------------------
// 1) Major aspects
// ---------------------------------------------------------------------------

function sectionAspects(planets: PlanetMap): string {
  const present = ASPECT_BODIES.filter((b) => planets[b]);
  const hits: { line: string; orb: number }[] = [];

  for (let i = 0; i < present.length; i++) {
    for (let j = i + 1; j < present.length; j++) {
      const a = present[i];
      const b = present[j];
      const sep = separation(planets[a].absLong, planets[b].absLong);
      let best: { name: string; orb: number } | null = null;
      for (const asp of ASPECTS) {
        const orb = Math.abs(sep - asp.angle);
        if (orb <= asp.orb) {
          if (!best || orb < best.orb) best = { name: asp.name, orb };
        }
      }
      if (best) {
        hits.push({
          line: `- ${a} ${best.name} ${b} (orb ${best.orb.toFixed(1)}°)`,
          orb: best.orb,
        });
      }
    }
  }

  if (hits.length === 0) return "";
  hits.sort((x, y) => x.orb - y.orb);
  const lines = hits.slice(0, 12).map((h) => h.line);
  return "MAJOR ASPECTS\n" + lines.join("\n");
}

// ---------------------------------------------------------------------------
// 2) Essential dignities
// ---------------------------------------------------------------------------

function dignityOf(planet: string, idx: number): string | null {
  if (idx < 0) return null;
  const domiciles = domicileSignsOf(planet);
  const exalt = EXALTATION[planet];
  const opposite = (n: number) => (n + 6) % 12;

  if (domiciles.includes(idx)) return "Domicile";
  if (exalt !== undefined && exalt === idx) return "Exaltation";
  if (domiciles.some((d) => opposite(d) === idx)) return "Detriment";
  if (exalt !== undefined && opposite(exalt) === idx) return "Fall";
  return null; // peregrine
}

function sectionDignities(planets: PlanetMap): string {
  const lines: string[] = [];
  for (const planet of CLASSICAL_7) {
    const p = planets[planet];
    if (!p) continue;
    const idx = signIndex(p.sign);
    const dig = dignityOf(planet, idx);
    if (dig) {
      lines.push(`- ${planet} in ${fullSign(idx)}: ${dig}`);
    }
  }
  const body =
    lines.length > 0
      ? lines.join("\n")
      : "No planets in notable dignity or debility.";
  return "ESSENTIAL DIGNITIES\n" + body;
}

// ---------------------------------------------------------------------------
// 3) Chart shape (Jones patterns) — approximation
// ---------------------------------------------------------------------------

function sectionShape(planets: PlanetMap): string {
  const longs = ASPECT_BODIES.filter((b) => planets[b]).map(
    (b) => planets[b].absLong
  );
  if (longs.length < 3) return "";

  const sorted = [...longs].sort((a, b) => a - b);
  const n = sorted.length;

  // Gaps between consecutive planets (wrapping 360).
  const gaps: { size: number; afterIndex: number }[] = [];
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    let gap = sorted[next] - sorted[i];
    if (i === n - 1) gap = 360 - sorted[i] + sorted[0];
    gaps.push({ size: gap, afterIndex: i });
  }
  const largestGap = Math.max(...gaps.map((g) => g.size));
  const occupiedArc = 360 - largestGap;
  const sortedGaps = [...gaps].sort((a, b) => b.size - a.size);

  let name = "Splay";
  let handle: string | null = null;

  // Detect a Bucket: one planet flanked by large (>~60°) gaps on BOTH sides,
  // the other nine forming a bowl.
  const bucket = detectBucket(sorted, planets, n);

  if (occupiedArc <= 120) {
    name = "Bundle";
  } else if (bucket.isBucket) {
    name = "Bucket (Funnel)";
    handle = bucket.handle;
  } else if (occupiedArc <= 186) {
    name = "Bowl";
  } else if (largestGap >= 120) {
    name = "Locomotive";
  } else if (isSeesaw(sorted, n)) {
    name = "Seesaw";
  } else if (largestGap < 60) {
    name = "Splash";
  } else {
    name = "Splay";
  }

  const meaning: Record<string, string> = {
    Bundle:
      "energy is tightly concentrated in one slice of the chart, focused and self-contained",
    "Bucket (Funnel)":
      handle
        ? `most planets form a bowl and drain their energy through ${handle}, the lone handle`
        : "most planets form a bowl and channel their energy through a single handle planet",
    Bowl:
      "planets fill one half of the chart, giving a sense of a self-contained mission or a felt lack of the empty half",
    Locomotive:
      "planets span two-thirds of the chart with one empty trine, driving a self-motivated, problem-solving momentum",
    Seesaw:
      "planets cluster in two opposite groups, weighing competing sides of life against each other",
    Splash:
      "planets are spread widely and evenly, suggesting broad, scattered, versatile interests",
    Splay:
      "planets clump irregularly, giving a strong, individualistic emphasis on a few areas",
  };

  const label = handle ? `${name}, handle ${handle}` : name;
  return `Chart shape: ${label} — ${meaning[name]}. (approximate Jones-pattern heuristic; occupied arc ≈ ${occupiedArc.toFixed(0)}°)`;
}

function detectBucket(
  sorted: number[],
  planets: PlanetMap,
  n: number
): { isBucket: boolean; handle: string | null } {
  if (n < 4) return { isBucket: false, handle: null };
  // For each planet, gap before and after it (wrapping).
  for (let i = 0; i < n; i++) {
    const prev = (i - 1 + n) % n;
    const next = (i + 1) % n;
    let gapBefore = sorted[i] - sorted[prev];
    if (i === 0) gapBefore = 360 - sorted[prev] + sorted[i];
    let gapAfter = sorted[next] - sorted[i];
    if (i === n - 1) gapAfter = 360 - sorted[i] + sorted[0];

    if (gapBefore > 60 && gapAfter > 60) {
      // The remaining planets should form a bowl (span <= ~200°).
      const others = sorted.filter((_, k) => k !== i);
      const span = bowlSpan(others);
      if (span <= 200) {
        const handleLong = sorted[i];
        const handle =
          ASPECT_BODIES.find(
            (b) => planets[b] && Math.abs(planets[b].absLong - handleLong) < 1e-6
          ) ?? null;
        return { isBucket: true, handle };
      }
    }
  }
  return { isBucket: false, handle: null };
}

// Smallest arc spanning a set of longitudes (0..360).
function bowlSpan(longs: number[]): number {
  if (longs.length === 0) return 0;
  const s = [...longs].sort((a, b) => a - b);
  const m = s.length;
  let maxGap = 0;
  for (let i = 0; i < m; i++) {
    const next = (i + 1) % m;
    let gap = s[next] - s[i];
    if (i === m - 1) gap = 360 - s[i] + s[0];
    if (gap > maxGap) maxGap = gap;
  }
  return 360 - maxGap;
}

// Seesaw: planets fall into two groups separated by two roughly-opposite gaps
// (each >= ~60°).
function isSeesaw(sorted: number[], n: number): boolean {
  const gaps: number[] = [];
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    let gap = sorted[next] - sorted[i];
    if (i === n - 1) gap = 360 - sorted[i] + sorted[0];
    gaps.push(gap);
  }
  const big = gaps.filter((g) => g >= 60);
  return big.length >= 2;
}

// ---------------------------------------------------------------------------
// 4) Annual profection
// ---------------------------------------------------------------------------

function ageAt(birthDate: string, ref: Date): number | null {
  const bd = new Date(birthDate + "T00:00:00Z");
  if (Number.isNaN(bd.getTime())) return null;
  let age = ref.getUTCFullYear() - bd.getUTCFullYear();
  const m = ref.getUTCMonth() - bd.getUTCMonth();
  if (m < 0 || (m === 0 && ref.getUTCDate() < bd.getUTCDate())) age--;
  return age < 0 ? null : age;
}

function sectionProfection(chart: DepthChart, ref: Date): string {
  if (!chart.birthDate) return "";
  const age = ageAt(chart.birthDate, ref);
  if (age == null) return "";

  const activatedHouse = (age % 12) + 1;

  // Determine the sign on the activated house cusp.
  let cuspIdx = -1;
  if (chart.houses && chart.houses.length) {
    const h = chart.houses.find((x) => x.number === activatedHouse);
    if (h) cuspIdx = signIndex(h.sign);
  }
  if (cuspIdx < 0) {
    // Fall back: count whole signs from the rising sign.
    const risingIdx = risingSignIndex(chart);
    if (risingIdx >= 0) cuspIdx = (risingIdx + (activatedHouse - 1)) % 12;
  }
  if (cuspIdx < 0) return "";

  const timeLord = DOMICILE_RULER[cuspIdx];
  const theme = HOUSE_THEMES[activatedHouse];

  return (
    `Profection year (age ${age}): ${ordinal(activatedHouse)} house activated (${fullSign(
      cuspIdx
    )}), time-lord ${timeLord}. Read ${timeLord}'s natal condition and any current transits to it as the year's headline. ` +
    `Classic theme of the ${ordinal(activatedHouse)} house: ${theme}.`
  );
}

function risingSignIndex(chart: DepthChart): number {
  // Prefer house 1 cusp, then bigThree.rising.
  if (chart.houses) {
    const h1 = chart.houses.find((x) => x.number === 1);
    if (h1) {
      const idx = signIndex(h1.sign);
      if (idx >= 0) return idx;
    }
  }
  if (chart.bigThree?.rising) {
    // rising may be a full sign name or abbreviation.
    const abbr = chart.bigThree.rising.slice(0, 3);
    const idx = signIndex(abbr);
    if (idx >= 0) return idx;
    const full = SIGN_FULL.indexOf(
      chart.bigThree.rising as (typeof SIGN_FULL)[number]
    );
    if (full >= 0) return full;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// 5) Part of Fortune (Lot of Fortune)
// ---------------------------------------------------------------------------

function sectionFortune(chart: DepthChart, planets: PlanetMap): string {
  const sun = planets["Sun"];
  const moon = planets["Moon"];

  // Ascendant absolute longitude from house-1 cusp.
  let ascLong: number | null = null;
  if (chart.houses) {
    const h1 = chart.houses.find((x) => x.number === 1);
    if (h1) {
      const idx = signIndex(h1.sign);
      if (idx >= 0 && typeof h1.position === "number") {
        ascLong = norm360(idx * 30 + h1.position);
      }
    }
  }

  if (ascLong == null || !sun || !moon) {
    return "Part of Fortune: needs the exact Ascendant degree — not computable from this data.";
  }

  // Day chart if the Sun is above the horizon (houses 7..12).
  const sunHouse = sun.house;
  const isDay = sunHouse != null && sunHouse >= 7 && sunHouse <= 12;

  const fortune = isDay
    ? norm360(ascLong + moon.absLong - sun.absLong)
    : norm360(ascLong + sun.absLong - moon.absLong);

  const idx = Math.floor(fortune / 30) % 12;
  const deg = fortune - idx * 30;

  // Determine house of the Lot, if houses are available.
  const house = houseOfLongitude(fortune, chart);

  const housePart =
    house != null ? `, ${ordinal(house)} house` : "";

  return `Part of Fortune: ${fullSign(idx)} ${deg.toFixed(1)}°${housePart} — where ease, vitality, and good flow gather. (${isDay ? "day" : "night"} chart formula)`;
}

// Which house a given absolute longitude falls in.
function houseOfLongitude(long: number, chart: DepthChart): number | null {
  const L = norm360(long);
  if (chart.houses && chart.houses.length >= 12) {
    // Try cusp-range assignment using each cusp's absolute longitude.
    const cusps: { number: number; abs: number }[] = [];
    for (const h of chart.houses) {
      const idx = signIndex(h.sign);
      if (idx < 0 || typeof h.position !== "number") {
        cusps.length = 0;
        break;
      }
      cusps.push({ number: h.number, abs: norm360(idx * 30 + h.position) });
    }
    if (cusps.length === 12) {
      cusps.sort((a, b) => a.number - b.number);
      for (let i = 0; i < 12; i++) {
        const start = cusps[i].abs;
        const end = cusps[(i + 1) % 12].abs;
        if (inArc(L, start, end)) return cusps[i].number;
      }
    }
  }
  // Whole-sign fallback from the rising sign.
  const risingIdx = risingSignIndex(chart);
  if (risingIdx >= 0) {
    const idx = Math.floor(L / 30) % 12;
    return ((idx - risingIdx + 12) % 12) + 1;
  }
  return null;
}

// Is longitude L within the arc from start (inclusive) to end (exclusive),
// going forward through the zodiac (wrapping)?
function inArc(L: number, start: number, end: number): boolean {
  if (start <= end) return L >= start && L < end;
  return L >= start || L < end;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function buildChartDepth(chart: DepthChart, refDate?: Date): string {
  if (!chart || !chart.planets || chart.planets.length === 0) return "";

  const ref = refDate ?? new Date();
  const planets = buildPlanetMap(chart);

  const blocks: string[] = [];

  try {
    const aspects = sectionAspects(planets);
    if (aspects) blocks.push(aspects);
  } catch {
    /* skip on error */
  }

  try {
    blocks.push(sectionDignities(planets));
  } catch {
    /* skip on error */
  }

  try {
    const shape = sectionShape(planets);
    if (shape) blocks.push("CHART SHAPE\n" + shape);
  } catch {
    /* skip on error */
  }

  try {
    const prof = sectionProfection(chart, ref);
    if (prof) blocks.push("ANNUAL PROFECTION\n" + prof);
  } catch {
    /* skip on error */
  }

  try {
    const fortune = sectionFortune(chart, planets);
    if (fortune) blocks.push("PART OF FORTUNE\n" + fortune);
  } catch {
    /* skip on error */
  }

  return blocks.join("\n\n");
}
