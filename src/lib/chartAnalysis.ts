/**
 * chartAnalysis.ts
 * Comprehensive natal chart analysis computation library.
 * Pure computation — no external dependencies.
 */

// ─── Input Types ───────────────────────────────────────────────────────────────

export interface Planet {
  name: string;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
  house: string | null;
  retrograde: boolean;
}

export interface House {
  number: number;
  sign: string;
  signNum: number;
  position: number;
  absPosition: number;
}

export interface Aspect {
  p1Name: string;
  p2Name: string;
  aspect: string;
  orbit: number;
  aspectDegrees: number;
}

// ─── Output Types ──────────────────────────────────────────────────────────────

export interface ChartPattern {
  type: 'stellium' | 't-square' | 'grand-trine' | 'yod' | 'kite' | 'grand-cross' | 'mystic-rectangle';
  planets: string[];
  details: Record<string, string>;
}

export interface CriticalDegree {
  planet: string;
  type: 'anaretic' | 'zero-degree' | 'critical-cardinal' | 'critical-fixed' | 'critical-mutable';
  position: number;
  sign: string;
}

export interface PlanetDignity {
  planet: string;
  sign: string;
  dignity: 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine';
}

export interface TightAspect {
  p1: string;
  p2: string;
  aspect: string;
  orb: number;
  isExact: boolean;
}

export interface RetrogradeMarker {
  planet: string;
  isPersonal: boolean;
}

export interface Singleton {
  planet: string;
  type: 'element' | 'modality' | 'hemisphere';
  value: string;
}

export interface MutualReception {
  planet1: string;
  planet2: string;
  sign1: string;
  sign2: string;
}

export interface CombustStatus {
  planet: string;
  type: 'cazimi' | 'combust' | 'under-the-beams';
  distanceFromSun: number;
}

export interface ChartAnalysis {
  patterns: ChartPattern[];
  criticalDegrees: CriticalDegree[];
  dignities: PlanetDignity[];
  sect: { isDayChart: boolean; sectLight: string; benefic: string; malefic: string };
  moonPhase: { phase: string; angle: number; description: string };
  hemispheres: { above: number; below: number; east: number; west: number; emphasis: string };
  elementBalance: { fire: number; earth: number; air: number; water: number; dominant: string; lacking: string | null };
  modalityBalance: { cardinal: number; fixed: number; mutable: number; dominant: string; lacking: string | null };
  tightAspects: TightAspect[];
  sunMoonAspect: { aspect: string; orb: number } | null;
  emptyHouses: number[];
  houseEmphasis: { house: number; count: number; planets: string[] }[];
  angularPlanets: string[];
  cadentPlanets: string[];
  retrogradePlanets: RetrogradeMarker[];
  singletons: Singleton[];
  unaspectedPlanets: string[];
  mutualReceptions: MutualReception[];
  finalDispositor: string | null;
  combustPlanets: CombustStatus[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SIGN_ABBREVS = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];

const FIRE_SIGNS = ['Ari', 'Leo', 'Sag'];
const EARTH_SIGNS = ['Tau', 'Vir', 'Cap'];
const AIR_SIGNS = ['Gem', 'Lib', 'Aqu'];
const WATER_SIGNS = ['Can', 'Sco', 'Pis'];

const CARDINAL_SIGNS = ['Ari', 'Can', 'Lib', 'Cap'];
const FIXED_SIGNS = ['Tau', 'Leo', 'Sco', 'Aqu'];
const MUTABLE_SIGNS = ['Gem', 'Vir', 'Sag', 'Pis'];

/** Standard domicile rulerships */
const DOMICILE: Record<string, string[]> = {
  Sun: ['Leo'],
  Moon: ['Can'],
  Mercury: ['Gem', 'Vir'],
  Venus: ['Tau', 'Lib'],
  Mars: ['Ari', 'Sco'],
  Jupiter: ['Sag', 'Pis'],
  Saturn: ['Cap', 'Aqu'],
};

/** Exaltation sign for each planet */
const EXALTATION: Record<string, string> = {
  Sun: 'Ari',
  Moon: 'Tau',
  Mercury: 'Vir',
  Venus: 'Pis',
  Mars: 'Cap',
  Jupiter: 'Can',
  Saturn: 'Lib',
};

/** Detriment signs (opposite domicile) */
const DETRIMENT: Record<string, string[]> = {
  Sun: ['Aqu'],
  Moon: ['Cap'],
  Mercury: ['Sag', 'Pis'],
  Venus: ['Sco', 'Ari'],
  Mars: ['Lib', 'Tau'],
  Jupiter: ['Gem', 'Vir'],
  Saturn: ['Can', 'Leo'],
};

/** Fall signs (opposite exaltation) */
const FALL: Record<string, string> = {
  Sun: 'Lib',
  Moon: 'Sco',
  Mercury: 'Pis',
  Venus: 'Vir',
  Mars: 'Can',
  Jupiter: 'Cap',
  Saturn: 'Ari',
};

/** Sign ruler lookup: given a sign abbreviation, which planet rules it */
const SIGN_RULER: Record<string, string> = {
  Ari: 'Mars',
  Tau: 'Venus',
  Gem: 'Mercury',
  Can: 'Moon',
  Leo: 'Sun',
  Vir: 'Mercury',
  Lib: 'Venus',
  Sco: 'Mars',
  Sag: 'Jupiter',
  Cap: 'Saturn',
  Aqu: 'Saturn',
  Pis: 'Jupiter',
};

const PERSONAL_PLANETS = ['Mercury', 'Venus', 'Mars'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse house value → number. Handles:
 *  - number (5 → 5)
 *  - numeric string ("5" → 5)
 *  - Kerykeion format ("Fifth_House" → 5)
 */
export function houseToNum(house: string | number | null | undefined): number | null {
  if (house == null) return null;
  if (typeof house === 'number') return house >= 1 && house <= 12 ? house : null;
  const asNum = Number(house);
  if (!isNaN(asNum) && asNum >= 1 && asNum <= 12) return asNum;
  const ordinals: Record<string, number> = {
    First: 1, Second: 2, Third: 3, Fourth: 4, Fifth: 5, Sixth: 6,
    Seventh: 7, Eighth: 8, Ninth: 9, Tenth: 10, Eleventh: 11, Twelfth: 12,
  };
  const match = house.match(/^(\w+)_House$/);
  if (!match) return null;
  return ordinals[match[1]] ?? null;
}

function getElement(sign: string): string {
  if (FIRE_SIGNS.includes(sign)) return 'fire';
  if (EARTH_SIGNS.includes(sign)) return 'earth';
  if (AIR_SIGNS.includes(sign)) return 'air';
  if (WATER_SIGNS.includes(sign)) return 'water';
  return 'unknown';
}

function getModality(sign: string): string {
  if (CARDINAL_SIGNS.includes(sign)) return 'cardinal';
  if (FIXED_SIGNS.includes(sign)) return 'fixed';
  if (MUTABLE_SIGNS.includes(sign)) return 'mutable';
  return 'unknown';
}

/** Find aspects between two specific planets */
function findAspect(aspects: Aspect[], p1: string, p2: string, type?: string): Aspect | undefined {
  return aspects.find(a =>
    ((a.p1Name === p1 && a.p2Name === p2) || (a.p1Name === p2 && a.p2Name === p1)) &&
    (type ? a.aspect === type : true)
  );
}

/** Get all aspects involving a given planet */
function aspectsOf(aspects: Aspect[], planet: string): Aspect[] {
  return aspects.filter(a => a.p1Name === planet || a.p2Name === planet);
}

/** Get the other planet in an aspect */
function otherPlanet(aspect: Aspect, planet: string): string {
  return aspect.p1Name === planet ? aspect.p2Name : aspect.p1Name;
}

/** Normalize angle to 0-360 */
function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

// ─── Pattern Detection ─────────────────────────────────────────────────────────

function detectStelliums(planets: Planet[]): ChartPattern[] {
  const patterns: ChartPattern[] = [];

  // By sign
  const bySign: Record<string, string[]> = {};
  for (const p of planets) {
    if (!bySign[p.sign]) bySign[p.sign] = [];
    bySign[p.sign].push(p.name);
  }
  for (const [sign, names] of Object.entries(bySign)) {
    if (names.length >= 3) {
      patterns.push({
        type: 'stellium',
        planets: names,
        details: { location: sign, locationType: 'sign' },
      });
    }
  }

  // By house
  const byHouse: Record<number, string[]> = {};
  for (const p of planets) {
    const h = houseToNum(p.house);
    if (h !== null) {
      if (!byHouse[h]) byHouse[h] = [];
      byHouse[h].push(p.name);
    }
  }
  for (const [house, names] of Object.entries(byHouse)) {
    if (names.length >= 3) {
      patterns.push({
        type: 'stellium',
        planets: names,
        details: { location: `House ${house}`, locationType: 'house' },
      });
    }
  }

  return patterns;
}

function detectTSquares(aspects: Aspect[]): ChartPattern[] {
  const patterns: ChartPattern[] = [];
  const oppositions = aspects.filter(a => a.aspect === 'opposition');
  const squares = aspects.filter(a => a.aspect === 'square');

  for (const opp of oppositions) {
    const { p1Name, p2Name } = opp;
    // Find a planet that squares both ends
    for (const sq1 of squares) {
      const apex1 = sq1.p1Name === p1Name ? sq1.p2Name : sq1.p1Name === p2Name ? sq1.p2Name : null;
      if (!apex1) continue;
      if (sq1.p1Name !== p1Name && sq1.p2Name !== p1Name) continue;
      // apex1 squares p1Name; check if it also squares p2Name
      const apex = otherPlanet(sq1, sq1.p1Name === p1Name ? p1Name : p2Name);
      const sq2 = squares.find(s =>
        ((s.p1Name === apex && s.p2Name === p2Name) || (s.p1Name === p2Name && s.p2Name === apex))
      );
      if (sq2) {
        // Avoid duplicates
        const key = [apex, p1Name, p2Name].sort().join(',');
        if (!patterns.some(p => p.planets.sort().join(',') === key)) {
          patterns.push({
            type: 't-square',
            planets: [apex, p1Name, p2Name],
            details: { apex },
          });
        }
      }
    }
  }

  return patterns;
}

function detectGrandTrines(aspects: Aspect[], planets: Planet[]): ChartPattern[] {
  const patterns: ChartPattern[] = [];
  const trines = aspects.filter(a => a.aspect === 'trine');

  // Find triplets where all three pairs have trines
  const planetNames = planets.map(p => p.name);
  for (let i = 0; i < planetNames.length - 2; i++) {
    for (let j = i + 1; j < planetNames.length - 1; j++) {
      for (let k = j + 1; k < planetNames.length; k++) {
        const a = planetNames[i], b = planetNames[j], c = planetNames[k];
        const ab = findAspect(trines, a, b);
        const bc = findAspect(trines, b, c);
        const ac = findAspect(trines, a, c);
        if (ab && bc && ac) {
          const pa = planets.find(p => p.name === a)!;
          const element = getElement(pa.sign);
          patterns.push({
            type: 'grand-trine',
            planets: [a, b, c],
            details: { element },
          });
        }
      }
    }
  }

  return patterns;
}

function detectYods(aspects: Aspect[]): ChartPattern[] {
  const patterns: ChartPattern[] = [];
  const sextiles = aspects.filter(a => a.aspect === 'sextile');
  const quincunxes = aspects.filter(a => a.aspect === 'quincunx');

  for (const sex of sextiles) {
    const { p1Name, p2Name } = sex;
    // Find a planet quincunx to both
    for (const q1 of quincunxes) {
      if (q1.p1Name !== p1Name && q1.p2Name !== p1Name) continue;
      const focal = otherPlanet(q1, p1Name);
      if (focal === p2Name) continue;
      const q2 = findAspect(quincunxes, focal, p2Name);
      if (q2) {
        const key = [focal, p1Name, p2Name].sort().join(',');
        if (!patterns.some(p => p.type === 'yod' && p.planets.sort().join(',') === key)) {
          patterns.push({
            type: 'yod',
            planets: [focal, p1Name, p2Name],
            details: { focalPlanet: focal },
          });
        }
      }
    }
  }

  return patterns;
}

function detectKites(aspects: Aspect[], grandTrines: ChartPattern[]): ChartPattern[] {
  const patterns: ChartPattern[] = [];
  const oppositions = aspects.filter(a => a.aspect === 'opposition');
  const sextiles = aspects.filter(a => a.aspect === 'sextile');

  for (const gt of grandTrines) {
    const [a, b, c] = gt.planets;
    // Check for a planet opposing one trine planet and sextile the other two
    for (const opp of oppositions) {
      let trineTarget: string | null = null;
      let kiteApex: string | null = null;

      for (const tp of [a, b, c]) {
        if (opp.p1Name === tp || opp.p2Name === tp) {
          trineTarget = tp;
          kiteApex = otherPlanet(opp, tp);
          break;
        }
      }

      if (!trineTarget || !kiteApex) continue;
      if ([a, b, c].includes(kiteApex)) continue;

      const others = [a, b, c].filter(p => p !== trineTarget);
      const sex1 = findAspect(sextiles, kiteApex, others[0]);
      const sex2 = findAspect(sextiles, kiteApex, others[1]);

      if (sex1 && sex2) {
        const key = [kiteApex, a, b, c].sort().join(',');
        if (!patterns.some(p => p.type === 'kite' && p.planets.sort().join(',') === key)) {
          patterns.push({
            type: 'kite',
            planets: [kiteApex, a, b, c],
            details: { apex: kiteApex, trineTriangle: `${a}, ${b}, ${c}` },
          });
        }
      }
    }
  }

  return patterns;
}

function detectGrandCrosses(aspects: Aspect[], planets: Planet[]): ChartPattern[] {
  const patterns: ChartPattern[] = [];
  const oppositions = aspects.filter(a => a.aspect === 'opposition');
  const squares = aspects.filter(a => a.aspect === 'square');

  // Find two oppositions where the four planets form a square ring
  for (let i = 0; i < oppositions.length - 1; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const opp1 = oppositions[i];
      const opp2 = oppositions[j];
      const four = [opp1.p1Name, opp1.p2Name, opp2.p1Name, opp2.p2Name];
      if (new Set(four).size !== 4) continue;

      // Check that adjacent planets are square to each other
      const [a, b] = [opp1.p1Name, opp1.p2Name];
      const [c, d] = [opp2.p1Name, opp2.p2Name];

      const hasAllSquares =
        (findAspect(squares, a, c) && findAspect(squares, a, d) &&
         findAspect(squares, b, c) && findAspect(squares, b, d));

      // Actually for a grand cross: a opposes b, c opposes d,
      // and a squares c, c squares b, b squares d, d squares a (ring)
      const ring1 = findAspect(squares, a, c) && findAspect(squares, c, b) &&
                    findAspect(squares, b, d) && findAspect(squares, d, a);
      const ring2 = findAspect(squares, a, d) && findAspect(squares, d, b) &&
                    findAspect(squares, b, c) && findAspect(squares, c, a);

      if (ring1 || ring2) {
        const pa = planets.find(p => p.name === a);
        const mode = pa ? getModality(pa.sign) : 'unknown';
        const key = four.sort().join(',');
        if (!patterns.some(p => p.type === 'grand-cross' && p.planets.sort().join(',') === key)) {
          patterns.push({
            type: 'grand-cross',
            planets: four,
            details: { mode },
          });
        }
      }
    }
  }

  return patterns;
}

function detectMysticRectangles(aspects: Aspect[]): ChartPattern[] {
  const patterns: ChartPattern[] = [];
  const oppositions = aspects.filter(a => a.aspect === 'opposition');
  const sextiles = aspects.filter(a => a.aspect === 'sextile');
  const trines = aspects.filter(a => a.aspect === 'trine');

  for (let i = 0; i < oppositions.length - 1; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const opp1 = oppositions[i];
      const opp2 = oppositions[j];
      const four = [opp1.p1Name, opp1.p2Name, opp2.p1Name, opp2.p2Name];
      if (new Set(four).size !== 4) continue;

      const [a, b] = [opp1.p1Name, opp1.p2Name];
      const [c, d] = [opp2.p1Name, opp2.p2Name];

      // Mystic rectangle: two oppositions linked by sextiles and trines
      // a-c sextile, b-d sextile, a-d trine, b-c trine (or rotated)
      const config1 = findAspect(sextiles, a, c) && findAspect(sextiles, b, d) &&
                      findAspect(trines, a, d) && findAspect(trines, b, c);
      const config2 = findAspect(sextiles, a, d) && findAspect(sextiles, b, c) &&
                      findAspect(trines, a, c) && findAspect(trines, b, d);

      if (config1 || config2) {
        const key = four.sort().join(',');
        if (!patterns.some(p => p.type === 'mystic-rectangle' && p.planets.sort().join(',') === key)) {
          patterns.push({
            type: 'mystic-rectangle',
            planets: four,
            details: {},
          });
        }
      }
    }
  }

  return patterns;
}

// ─── Critical Degrees ──────────────────────────────────────────────────────────

function detectCriticalDegrees(planets: Planet[]): CriticalDegree[] {
  const results: CriticalDegree[] = [];

  for (const p of planets) {
    const pos = p.position;
    const sign = p.sign;
    const modality = getModality(sign);

    // Anaretic degree (29°)
    if (pos >= 29.0) {
      results.push({ planet: p.name, type: 'anaretic', position: pos, sign });
    }

    // 0° of a sign
    if (pos < 1.0) {
      results.push({ planet: p.name, type: 'zero-degree', position: pos, sign });
    }

    // Critical degrees by mode
    if (modality === 'cardinal') {
      const criticals = [0, 13, 26];
      for (const cd of criticals) {
        if (Math.abs(pos - cd) <= 1.0) {
          results.push({ planet: p.name, type: 'critical-cardinal', position: pos, sign });
          break;
        }
      }
    } else if (modality === 'fixed') {
      // 8-9° and 21-22°
      if ((pos >= 7.0 && pos <= 10.0) || (pos >= 20.0 && pos <= 23.0)) {
        results.push({ planet: p.name, type: 'critical-fixed', position: pos, sign });
      }
    } else if (modality === 'mutable') {
      const criticals = [4, 17];
      for (const cd of criticals) {
        if (Math.abs(pos - cd) <= 1.0) {
          results.push({ planet: p.name, type: 'critical-mutable', position: pos, sign });
          break;
        }
      }
    }
  }

  return results;
}

// ─── Combust / Cazimi / Under Beams ───────────────────────────────────────────

function detectCombustPlanets(planets: Planet[]): CombustStatus[] {
  const results: CombustStatus[] = [];
  const sun = planets.find(p => p.name === 'Sun');
  if (!sun) return results;

  for (const p of planets) {
    if (p.name === 'Sun') continue;

    let diff = Math.abs(p.absPosition - sun.absPosition);
    if (diff > 180) diff = 360 - diff;

    if (diff <= 0.283) {
      results.push({ planet: p.name, type: 'cazimi', distanceFromSun: diff });
    } else if (diff <= 8) {
      results.push({ planet: p.name, type: 'combust', distanceFromSun: diff });
    } else if (diff <= 17) {
      results.push({ planet: p.name, type: 'under-the-beams', distanceFromSun: diff });
    }
  }

  return results;
}

// ─── Essential Dignities ───────────────────────────────────────────────────────

function computeDignities(planets: Planet[]): PlanetDignity[] {
  const results: PlanetDignity[] = [];

  for (const p of planets) {
    const name = p.name;
    const sign = p.sign;

    if (DOMICILE[name]?.includes(sign)) {
      results.push({ planet: name, sign, dignity: 'domicile' });
    } else if (EXALTATION[name] === sign) {
      results.push({ planet: name, sign, dignity: 'exaltation' });
    } else if (DETRIMENT[name]?.includes(sign)) {
      results.push({ planet: name, sign, dignity: 'detriment' });
    } else if (FALL[name] === sign) {
      results.push({ planet: name, sign, dignity: 'fall' });
    } else {
      results.push({ planet: name, sign, dignity: 'peregrine' });
    }
  }

  return results;
}

// ─── Sect (Day/Night) ──────────────────────────────────────────────────────────

function computeSect(planets: Planet[]): ChartAnalysis['sect'] {
  const sun = planets.find(p => p.name === 'Sun');
  const sunHouse = sun ? houseToNum(sun.house) : null;

  // Houses 7-12 are above the horizon
  const isDayChart = sunHouse !== null && sunHouse >= 7 && sunHouse <= 12;

  return {
    isDayChart,
    sectLight: isDayChart ? 'Sun' : 'Moon',
    benefic: isDayChart ? 'Jupiter' : 'Venus',
    malefic: isDayChart ? 'Saturn' : 'Mars',
  };
}

// ─── Moon Phase ────────────────────────────────────────────────────────────────

function computeMoonPhase(planets: Planet[]): ChartAnalysis['moonPhase'] {
  const sun = planets.find(p => p.name === 'Sun');
  const moon = planets.find(p => p.name === 'Moon');

  if (!sun || !moon) {
    return { phase: 'unknown', angle: 0, description: 'Sun or Moon not found' };
  }

  let angle = normalizeAngle(moon.absPosition - sun.absPosition);

  const phases: { name: string; min: number; max: number; desc: string }[] = [
    { name: 'New Moon', min: 0, max: 45, desc: 'Seed phase — new beginnings, instinct-driven' },
    { name: 'Waxing Crescent', min: 45, max: 90, desc: 'Emergence — pushing forward despite resistance' },
    { name: 'First Quarter', min: 90, max: 135, desc: 'Crisis in action — building, deciding' },
    { name: 'Waxing Gibbous', min: 135, max: 180, desc: 'Refinement — analyzing, perfecting' },
    { name: 'Full Moon', min: 180, max: 225, desc: 'Illumination — awareness, relationships, fulfillment' },
    { name: 'Waning Gibbous', min: 225, max: 270, desc: 'Dissemination — sharing, teaching' },
    { name: 'Last Quarter', min: 270, max: 315, desc: 'Crisis in consciousness — reorientation' },
    { name: 'Balsamic', min: 315, max: 360, desc: 'Release — surrender, karmic completion' },
  ];

  const phase = phases.find(ph => angle >= ph.min && angle < ph.max) || phases[0];

  return { phase: phase.name, angle, description: phase.desc };
}

// ─── Hemisphere & Balance ──────────────────────────────────────────────────────

function computeHemispheres(planets: Planet[]): ChartAnalysis['hemispheres'] {
  let above = 0, below = 0, east = 0, west = 0;

  for (const p of planets) {
    const h = houseToNum(p.house);
    if (h === null) continue;

    // Above horizon: houses 7-12; Below: 1-6
    if (h >= 7 && h <= 12) above++;
    else below++;

    // East: houses 10, 11, 12, 1, 2, 3; West: 4, 5, 6, 7, 8, 9
    if ([10, 11, 12, 1, 2, 3].includes(h)) east++;
    else west++;
  }

  let emphasis = '';
  if (above > below + 2) emphasis = 'above-horizon (public, outer-world focus)';
  else if (below > above + 2) emphasis = 'below-horizon (private, inner-world focus)';
  else if (east > west + 2) emphasis = 'eastern (self-directed, independent)';
  else if (west > east + 2) emphasis = 'western (other-directed, relational)';
  else emphasis = 'balanced';

  return { above, below, east, west, emphasis };
}

function computeElementBalance(planets: Planet[]): ChartAnalysis['elementBalance'] {
  const counts = { fire: 0, earth: 0, air: 0, water: 0 };

  for (const p of planets) {
    const el = getElement(p.sign) as keyof typeof counts;
    if (el in counts) counts[el]++;
  }

  const entries = Object.entries(counts) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const dominant = entries[0][0];
  const lacking = entries[entries.length - 1][1] === 0 ? entries[entries.length - 1][0] : null;

  return { ...counts, dominant, lacking };
}

function computeModalityBalance(planets: Planet[]): ChartAnalysis['modalityBalance'] {
  const counts = { cardinal: 0, fixed: 0, mutable: 0 };

  for (const p of planets) {
    const mod = getModality(p.sign) as keyof typeof counts;
    if (mod in counts) counts[mod]++;
  }

  const entries = Object.entries(counts) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const dominant = entries[0][0];
  const lacking = entries[entries.length - 1][1] === 0 ? entries[entries.length - 1][0] : null;

  return { ...counts, dominant, lacking };
}

// ─── Aspect Markers ────────────────────────────────────────────────────────────

function findTightAspects(aspects: Aspect[]): TightAspect[] {
  return aspects
    .filter(a => a.orbit < 1)
    .map(a => ({
      p1: a.p1Name,
      p2: a.p2Name,
      aspect: a.aspect,
      orb: a.orbit,
      isExact: a.orbit < 0.1,
    }));
}

function findSunMoonAspect(aspects: Aspect[]): ChartAnalysis['sunMoonAspect'] {
  const found = aspects.find(a =>
    (a.p1Name === 'Sun' && a.p2Name === 'Moon') ||
    (a.p1Name === 'Moon' && a.p2Name === 'Sun')
  );
  if (!found) return null;
  return { aspect: found.aspect, orb: found.orbit };
}

// ─── House Markers ─────────────────────────────────────────────────────────────

function findEmptyHouses(planets: Planet[], houses: House[]): number[] {
  const occupied = new Set<number>();
  for (const p of planets) {
    const h = houseToNum(p.house);
    if (h !== null) occupied.add(h);
  }
  const empty: number[] = [];
  for (let i = 1; i <= 12; i++) {
    if (!occupied.has(i)) empty.push(i);
  }
  return empty;
}

function findHouseEmphasis(planets: Planet[]): ChartAnalysis['houseEmphasis'] {
  const byHouse: Record<number, string[]> = {};
  for (const p of planets) {
    const h = houseToNum(p.house);
    if (h !== null) {
      if (!byHouse[h]) byHouse[h] = [];
      byHouse[h].push(p.name);
    }
  }
  return Object.entries(byHouse)
    .filter(([_, names]) => names.length >= 3)
    .map(([house, names]) => ({ house: Number(house), count: names.length, planets: names }));
}

function findAngularPlanets(planets: Planet[]): string[] {
  return planets
    .filter(p => {
      const h = houseToNum(p.house);
      return h !== null && [1, 4, 7, 10].includes(h);
    })
    .map(p => p.name);
}

function findCadentPlanets(planets: Planet[]): string[] {
  return planets
    .filter(p => {
      const h = houseToNum(p.house);
      return h !== null && [3, 6, 9, 12].includes(h);
    })
    .map(p => p.name);
}

// ─── Modern/Niche Markers ──────────────────────────────────────────────────────

function findRetrogradePlanets(planets: Planet[]): RetrogradeMarker[] {
  return planets
    .filter(p => p.retrograde)
    .map(p => ({
      planet: p.name,
      isPersonal: PERSONAL_PLANETS.includes(p.name),
    }));
}

function findSingletons(planets: Planet[]): Singleton[] {
  const results: Singleton[] = [];

  // Element singletons
  const elGroups: Record<string, string[]> = { fire: [], earth: [], air: [], water: [] };
  for (const p of planets) {
    const el = getElement(p.sign);
    if (el in elGroups) elGroups[el].push(p.name);
  }
  for (const [el, names] of Object.entries(elGroups)) {
    if (names.length === 1) {
      results.push({ planet: names[0], type: 'element', value: el });
    }
  }

  // Modality singletons
  const modGroups: Record<string, string[]> = { cardinal: [], fixed: [], mutable: [] };
  for (const p of planets) {
    const mod = getModality(p.sign);
    if (mod in modGroups) modGroups[mod].push(p.name);
  }
  for (const [mod, names] of Object.entries(modGroups)) {
    if (names.length === 1) {
      results.push({ planet: names[0], type: 'modality', value: mod });
    }
  }

  // Hemisphere singletons
  const hemiGroups: Record<string, string[]> = { above: [], below: [], east: [], west: [] };
  for (const p of planets) {
    const h = houseToNum(p.house);
    if (h === null) continue;
    if (h >= 7 && h <= 12) hemiGroups['above'].push(p.name);
    else hemiGroups['below'].push(p.name);
    if ([10, 11, 12, 1, 2, 3].includes(h)) hemiGroups['east'].push(p.name);
    else hemiGroups['west'].push(p.name);
  }
  for (const [hemi, names] of Object.entries(hemiGroups)) {
    if (names.length === 1) {
      results.push({ planet: names[0], type: 'hemisphere', value: hemi });
    }
  }

  return results;
}

function findUnaspectedPlanets(planets: Planet[], aspects: Aspect[]): string[] {
  const majorAspects = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
  return planets
    .filter(p => {
      const pAspects = aspectsOf(aspects, p.name).filter(a => majorAspects.includes(a.aspect));
      return pAspects.length === 0;
    })
    .map(p => p.name);
}

function findMutualReceptions(planets: Planet[]): MutualReception[] {
  const results: MutualReception[] = [];
  const seen = new Set<string>();

  for (const p1 of planets) {
    for (const p2 of planets) {
      if (p1.name === p2.name) continue;
      const key = [p1.name, p2.name].sort().join(',');
      if (seen.has(key)) continue;

      // p1 is in p2's ruling sign, and p2 is in p1's ruling sign
      const p1Rules = DOMICILE[p1.name];
      const p2Rules = DOMICILE[p2.name];
      if (!p1Rules || !p2Rules) continue;

      if (p2Rules.includes(p1.sign) && p1Rules.includes(p2.sign)) {
        seen.add(key);
        results.push({
          planet1: p1.name,
          planet2: p2.name,
          sign1: p1.sign,
          sign2: p2.sign,
        });
      }
    }
  }

  return results;
}

function findFinalDispositor(planets: Planet[]): string | null {
  // Build dispositor chain: each planet's dispositor is the ruler of the sign it's in
  const planetMap = new Map<string, Planet>();
  for (const p of planets) planetMap.set(p.name, p);

  // Find planets that rule their own sign (self-disposing)
  const selfDisposing = planets.filter(p => DOMICILE[p.name]?.includes(p.sign));

  if (selfDisposing.length === 0) return null;
  if (selfDisposing.length === 1) {
    // Verify all chains lead to this planet
    const candidate = selfDisposing[0].name;
    for (const p of planets) {
      if (p.name === candidate) continue;
      let current = p.name;
      const visited = new Set<string>();
      while (current !== candidate) {
        if (visited.has(current)) break;
        visited.add(current);
        const currentPlanet = planetMap.get(current);
        if (!currentPlanet) break;
        const ruler = SIGN_RULER[currentPlanet.sign];
        if (!ruler) break;
        current = ruler;
      }
      if (current !== candidate) return null;
    }
    return candidate;
  }

  // Multiple self-disposing planets — no single final dispositor
  return null;
}

// ─── Main Analysis Function ────────────────────────────────────────────────────

/**
 * Performs comprehensive natal chart analysis.
 *
 * @param planets - Array of planet placements
 * @param houses - Array of house cusps
 * @param aspects - Array of aspects between planets
 * @param specialPoints - Optional array of special chart points (Nodes, Part of Fortune, etc.)
 * @param midheaven - Optional midheaven degree
 * @returns Complete chart analysis
 */
export function analyzeChart(
  planets: Planet[],
  houses: House[],
  aspects: Aspect[],
  specialPoints?: Planet[],
  midheaven?: number,
): ChartAnalysis {
  // Combine planets with special points for some calculations
  const allBodies = specialPoints ? [...planets, ...specialPoints] : planets;

  // Pattern detection
  const grandTrines = detectGrandTrines(aspects, planets);
  const patterns: ChartPattern[] = [
    ...detectStelliums(allBodies),
    ...detectTSquares(aspects),
    ...grandTrines,
    ...detectYods(aspects),
    ...detectKites(aspects, grandTrines),
    ...detectGrandCrosses(aspects, planets),
    ...detectMysticRectangles(aspects),
  ];

  return {
    patterns,
    criticalDegrees: detectCriticalDegrees(allBodies),
    dignities: computeDignities(planets),
    sect: computeSect(planets),
    moonPhase: computeMoonPhase(planets),
    hemispheres: computeHemispheres(allBodies),
    elementBalance: computeElementBalance(allBodies),
    modalityBalance: computeModalityBalance(allBodies),
    tightAspects: findTightAspects(aspects),
    sunMoonAspect: findSunMoonAspect(aspects),
    emptyHouses: findEmptyHouses(allBodies, houses),
    houseEmphasis: findHouseEmphasis(allBodies),
    angularPlanets: findAngularPlanets(allBodies),
    cadentPlanets: findCadentPlanets(allBodies),
    retrogradePlanets: findRetrogradePlanets(planets),
    singletons: findSingletons(allBodies),
    unaspectedPlanets: findUnaspectedPlanets(planets, aspects),
    mutualReceptions: findMutualReceptions(planets),
    finalDispositor: findFinalDispositor(planets),
    combustPlanets: detectCombustPlanets(planets),
  };
}
