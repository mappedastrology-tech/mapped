// ============================================================================
// celestialMechanics.ts — Astronomical data computation for almanac app
// Computes sun/moon times, twilight, visible planets, and meteor showers
// for any given date and geographic coordinates. No external APIs required.
// ============================================================================

// --------------------------------------------------------------------------
// Interfaces
// --------------------------------------------------------------------------

export interface GoldenHour {
  start: string;
  end: string;
}

export interface PlanetVisibility {
  name: string;
  direction: string;
  brightness: string;
  note: string;
}

export interface MeteorShower {
  name: string;
  peakDate: string;
  zhr: number;
  note: string;
}

export interface CelestialData {
  // Sun times
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLengthMinutes: number;
  dayLengthDelta: number;
  goldenHourMorning: GoldenHour;
  goldenHourEvening: GoldenHour;

  // Twilight
  civilDawn: string;
  civilDusk: string;
  nauticalDawn: string;
  nauticalDusk: string;
  astronomicalDawn: string;
  astronomicalDusk: string;

  // Moon
  moonrise: string | null;
  moonset: string | null;
  illuminationPct: number;
  distanceKm: number;
  isSupermoon: boolean;
  isMicromoon: boolean;

  // Planets
  visiblePlanets: PlanetVisibility[];

  // Meteor showers
  meteorShower: MeteorShower | null;
}

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

/**
 * @deprecated Last-resort fallback only. Prefer the user's real location via
 * src/lib/userLocation.ts (fetchUserLocation / getCachedLocation).
 */
export const DEFAULT_COORDS = { lat: 30.267, lng: -97.743 }; // Austin, TX

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Synodic month (new moon to new moon)
const SYNODIC_MONTH = 29.530588853;
// Anomalistic month (perigee to perigee)
const ANOMALISTIC_MONTH = 27.554;
// Reference new moon: January 6, 2000 18:14 UTC (Julian Date 2451550.26)
const NEW_MOON_EPOCH_JD = 2451550.1;
// Reference perigee: January 1, 2000 (Julian Date ~2451544.5)
const PERIGEE_EPOCH_JD = 2451544.5;

// Lunar distance parameters (km)
const LUNAR_MEAN_DISTANCE = 384400;
const LUNAR_DISTANCE_AMPLITUDE = 25150; // half of (406700 - 356500) roughly

// --------------------------------------------------------------------------
// Utility: Time formatting
// --------------------------------------------------------------------------

function formatTime(hours: number): string {
  // hours is in decimal (0-24), convert to HH:MM AM/PM
  let h = ((hours % 24) + 24) % 24;
  const minutes = Math.round((h - Math.floor(h)) * 60);
  h = Math.floor(h);
  if (minutes === 60) {
    h += 1;
    h = h % 24;
  }
  const m = minutes === 60 ? 0 : minutes;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
}

// --------------------------------------------------------------------------
// Utility: Julian Date
// --------------------------------------------------------------------------

function toJulianDate(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let yr = y;
  let mo = m;
  if (mo <= 2) {
    yr -= 1;
    mo += 12;
  }

  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (yr + 4716)) +
    Math.floor(30.6001 * (mo + 1)) +
    d +
    B -
    1524.5
  );
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

// --------------------------------------------------------------------------
// Sun Position Calculations
// --------------------------------------------------------------------------

interface SolarPosition {
  declination: number; // degrees
  equationOfTime: number; // minutes
}

function getSolarPosition(jd: number): SolarPosition {
  // Number of days from J2000.0
  const n = jd - 2451545.0;

  // Mean longitude (degrees)
  const L = (280.46 + 0.9856474 * n) % 360;

  // Mean anomaly (degrees)
  const g = ((357.528 + 0.9856003 * n) % 360) * DEG_TO_RAD;

  // Ecliptic longitude (degrees)
  const lambda =
    (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG_TO_RAD;

  // Obliquity of ecliptic
  const epsilon = 23.439 * DEG_TO_RAD;

  // Declination
  const declination =
    Math.asin(Math.sin(epsilon) * Math.sin(lambda)) * RAD_TO_DEG;

  // Right ascension
  const ra =
    Math.atan2(
      Math.cos(epsilon) * Math.sin(lambda),
      Math.cos(lambda)
    ) * RAD_TO_DEG;

  // Equation of time (minutes).
  // Wrap (L - ra) to [-180, 180) — note the +180 must be subtracted back
  // after the modulo. The previous version omitted that, shifting every
  // result by -720 minutes (12 hours) and flipping AM/PM downstream.
  const eot = (((L - ra + 180) % 360) + 360) % 360 - 180;
  const equationOfTime = eot * 4; // 4 minutes per degree

  return { declination, equationOfTime };
}

/**
 * Compute hour angle for when the sun reaches a given altitude.
 * Returns NaN if the sun never reaches that altitude (polar day/night).
 */
function hourAngle(lat: number, declination: number, altitude: number): number {
  const latRad = lat * DEG_TO_RAD;
  const decRad = declination * DEG_TO_RAD;
  const altRad = altitude * DEG_TO_RAD;

  const cosH =
    (Math.sin(altRad) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));

  if (cosH > 1 || cosH < -1) return NaN;
  return Math.acos(cosH) * RAD_TO_DEG;
}

interface SunTimes {
  sunrise: number; // decimal hours, local
  sunset: number;
  solarNoon: number;
}

function computeSunTimes(
  date: Date,
  lat: number,
  lng: number,
  altitude: number
): { rise: number; set: number; noon: number } | null {
  const jd = toJulianDate(date);
  const { declination, equationOfTime } = getSolarPosition(jd);
  const tzOffset = -date.getTimezoneOffset() / 60; // hours ahead of UTC

  // Solar noon in local time (hours)
  const solarNoon = 12 - equationOfTime / 60 - lng / 15 + tzOffset;

  const ha = hourAngle(lat, declination, altitude);
  if (isNaN(ha)) return null;

  const haHours = ha / 15; // convert degrees to hours
  const rise = solarNoon - haHours;
  const set = solarNoon + haHours;

  return { rise, set, noon: solarNoon };
}

/**
 * Sunrise/sunset (decimal local hours) for real coordinates.
 * Returns null in polar day/night conditions.
 */
export function getSunriseSunset(
  date: Date,
  lat: number,
  lng: number
): { sunrise: number; sunset: number } | null {
  const times = computeSunTimes(date, lat, lng, -0.833);
  if (!times) return null;
  return { sunrise: times.rise, sunset: times.set };
}

function getDayLengthMinutes(date: Date, lat: number, lng: number): number {
  const times = computeSunTimes(date, lat, lng, -0.833);
  if (!times) return lat > 0 ? 1440 : 0; // polar day or night approximation
  return (times.set - times.rise) * 60;
}

// --------------------------------------------------------------------------
// Moon Calculations
// --------------------------------------------------------------------------

interface MoonData {
  illuminationPct: number;
  distanceKm: number;
  isSupermoon: boolean;
  isMicromoon: boolean;
  moonrise: number | null; // decimal hours local, or null
  moonset: number | null;
}

function getMoonDeclination(jd: number): number {
  // Simplified lunar position
  const n = jd - 2451545.0;

  // Moon's mean longitude
  const Lm = (218.316 + 13.176396 * n) % 360;
  // Moon's mean anomaly
  const Mm = ((134.963 + 13.064993 * n) % 360) * DEG_TO_RAD;
  // Moon's mean distance (ascending node)
  const F = ((93.272 + 13.22935 * n) % 360) * DEG_TO_RAD;

  // Ecliptic longitude
  const lambdaMoon =
    (Lm + 6.289 * Math.sin(Mm)) * DEG_TO_RAD;
  // Ecliptic latitude
  const betaMoon = 5.128 * Math.sin(F) * DEG_TO_RAD;

  const epsilon = 23.439 * DEG_TO_RAD;

  // Declination
  const dec =
    Math.asin(
      Math.sin(betaMoon) * Math.cos(epsilon) +
        Math.cos(betaMoon) * Math.sin(epsilon) * Math.sin(lambdaMoon)
    ) * RAD_TO_DEG;

  return dec;
}

function getMoonRightAscension(jd: number): number {
  const n = jd - 2451545.0;
  const Lm = (218.316 + 13.176396 * n) % 360;
  const Mm = ((134.963 + 13.064993 * n) % 360) * DEG_TO_RAD;
  const F = ((93.272 + 13.22935 * n) % 360) * DEG_TO_RAD;

  const lambdaMoon = (Lm + 6.289 * Math.sin(Mm)) * DEG_TO_RAD;
  const betaMoon = 5.128 * Math.sin(F) * DEG_TO_RAD;
  const epsilon = 23.439 * DEG_TO_RAD;

  const ra =
    Math.atan2(
      Math.sin(lambdaMoon) * Math.cos(epsilon) -
        Math.tan(betaMoon) * Math.sin(epsilon),
      Math.cos(lambdaMoon)
    ) * RAD_TO_DEG;

  return (ra + 360) % 360;
}

function computeMoonData(date: Date, lat: number, lng: number): MoonData {
  const jd = toJulianDate(date);
  const tzOffset = -date.getTimezoneOffset() / 60;

  // --- Illumination ---
  const daysSinceNewMoon = ((jd - NEW_MOON_EPOCH_JD) % SYNODIC_MONTH + SYNODIC_MONTH) % SYNODIC_MONTH;
  const phaseAngle = (daysSinceNewMoon / SYNODIC_MONTH) * 2 * Math.PI;
  const illuminationPct = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 100);

  // --- Distance ---
  const daysSincePerigee = ((jd - PERIGEE_EPOCH_JD) % ANOMALISTIC_MONTH + ANOMALISTIC_MONTH) % ANOMALISTIC_MONTH;
  const anomalyAngle = (daysSincePerigee / ANOMALISTIC_MONTH) * 2 * Math.PI;
  const distanceKm = Math.round(
    LUNAR_MEAN_DISTANCE - LUNAR_DISTANCE_AMPLITUDE * Math.cos(anomalyAngle)
  );

  // --- Supermoon / Micromoon ---
  // Full moon: phase ~0.5 of synodic cycle (illumination near 100%)
  const isFullMoon = Math.abs(daysSinceNewMoon - SYNODIC_MONTH / 2) < 1.0;
  const isSupermoon = isFullMoon && distanceKm < 360000;
  const isMicromoon = isFullMoon && distanceKm > 404000;

  // --- Moonrise / Moonset (approximate) ---
  // The moon transits ~50 minutes later each day
  const moonDec = getMoonDeclination(jd);
  const moonRA = getMoonRightAscension(jd);

  // Approximate moon transit time
  // Greenwich sidereal time at 0h UT
  const T = (jd - 0.5 - Math.floor(jd - 0.5) + 0.5 - 2451545.0) / 36525;
  const jd0 = Math.floor(jd - 0.5) + 0.5; // JD at 0h UT of this day
  const T0 = (jd0 - 2451545.0) / 36525;
  const GST0 = (100.46061837 + 36000.770053608 * T0 + 0.000387933 * T0 * T0) % 360;
  const LST0 = (GST0 + lng + 360) % 360;

  // Moon transit: when LST = moonRA
  let transitHoursUT = ((moonRA - LST0 + 360) % 360) / 15;
  const transitHoursLocal = transitHoursUT + tzOffset;

  // Hour angle for moonrise/set (using 0.125° for moon's average apparent radius + refraction)
  const ha = hourAngle(lat, moonDec, 0.125);

  let moonrise: number | null = null;
  let moonset: number | null = null;

  if (!isNaN(ha)) {
    const haHours = ha / 15;
    moonrise = transitHoursLocal - haHours;
    moonset = transitHoursLocal + haHours;

    // Normalize to 0-24
    if (moonrise < 0) moonrise += 24;
    if (moonrise >= 24) moonrise -= 24;
    if (moonset < 0) moonset += 24;
    if (moonset >= 24) moonset -= 24;
  }

  return {
    illuminationPct,
    distanceKm,
    isSupermoon,
    isMicromoon,
    moonrise,
    moonset,
  };
}

// --------------------------------------------------------------------------
// Visible Planets (2026 monthly visibility table)
// --------------------------------------------------------------------------

interface PlanetMonthData {
  visible: boolean;
  direction: string;
  brightness: string;
  note: string;
}

// Monthly visibility data for 2026 (index 0 = January, 11 = December)
const PLANET_VISIBILITY_2026: Record<string, PlanetMonthData[]> = {
  Mercury: [
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: true, direction: "low in west after sunset", brightness: "mag -0.5, moderately bright", note: "Best evening apparition of early 2026" },
    { visible: true, direction: "low in west after sunset", brightness: "mag 0.5, faint", note: "Sinking toward the horizon" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: true, direction: "low in east before sunrise", brightness: "mag 0.3, faint", note: "Brief morning appearance" },
    { visible: true, direction: "low in east before sunrise", brightness: "mag -0.8, bright", note: "Good morning apparition" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: true, direction: "low in west after sunset", brightness: "mag -0.3, moderately bright", note: "Evening apparition returns" },
    { visible: true, direction: "low in west after sunset", brightness: "mag -0.6, bright", note: "Best evening viewing this fall" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: true, direction: "low in east before sunrise", brightness: "mag -0.4, moderately bright", note: "Low in the predawn sky" },
  ],
  Venus: [
    { visible: true, direction: "brilliant in west after sunset", brightness: "mag -3.9, dazzling", note: "Venus dominates the evening sky" },
    { visible: true, direction: "brilliant in west after sunset", brightness: "mag -4.0, dazzling", note: "Reaching greatest brilliancy" },
    { visible: true, direction: "in west after sunset", brightness: "mag -4.2, dazzling", note: "Spectacular crescent in telescopes" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: true, direction: "in east before sunrise", brightness: "mag -4.1, dazzling", note: "The Morning Star returns" },
    { visible: true, direction: "in east before sunrise", brightness: "mag -3.9, dazzling", note: "Brilliant in the predawn sky" },
    { visible: true, direction: "in east before sunrise", brightness: "mag -3.8, very bright", note: "High in the morning sky" },
    { visible: true, direction: "in east before sunrise", brightness: "mag -3.8, very bright", note: "Steadily visible before dawn" },
    { visible: true, direction: "in east before sunrise", brightness: "mag -3.8, very bright", note: "Fading but still prominent" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: true, direction: "low in west after sunset", brightness: "mag -3.9, dazzling", note: "Venus returns to the evening sky" },
  ],
  Mars: [
    { visible: true, direction: "high in south during evening", brightness: "mag -0.4, bright", note: "Mars is well-placed for viewing" },
    { visible: true, direction: "high in south during evening", brightness: "mag 0.2, moderately bright", note: "Fading as Earth pulls away" },
    { visible: true, direction: "in west during evening", brightness: "mag 0.6, moderate", note: "Setting earlier each night" },
    { visible: true, direction: "in west after sunset", brightness: "mag 0.9, moderate", note: "Low in the west after dark" },
    { visible: true, direction: "low in west after sunset", brightness: "mag 1.1, faint", note: "Difficult to spot low on horizon" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: true, direction: "low in east before sunrise", brightness: "mag 1.4, faint", note: "Emerging in morning twilight" },
    { visible: true, direction: "in east before sunrise", brightness: "mag 1.3, faint", note: "Gradually brightening" },
    { visible: true, direction: "in east before sunrise", brightness: "mag 1.1, moderate", note: "Climbing higher each morning" },
    { visible: true, direction: "in east before sunrise", brightness: "mag 0.8, moderate", note: "Noticeably brighter now" },
    { visible: true, direction: "in east-southeast before sunrise", brightness: "mag 0.5, moderately bright", note: "Approaching opposition next year" },
  ],
  Jupiter: [
    { visible: true, direction: "in west during evening", brightness: "mag -2.1, very bright", note: "Still prominent in the evening sky" },
    { visible: true, direction: "low in west after sunset", brightness: "mag -2.0, very bright", note: "Setting earlier, catch it while you can" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: true, direction: "low in east before sunrise", brightness: "mag -2.0, very bright", note: "Jupiter returns in the morning sky" },
    { visible: true, direction: "in east before sunrise", brightness: "mag -2.1, very bright", note: "Rising well before dawn" },
    { visible: true, direction: "in east-southeast before sunrise", brightness: "mag -2.2, very bright", note: "Brightening toward opposition" },
    { visible: true, direction: "in south during predawn hours", brightness: "mag -2.3, very bright", note: "Dominating the morning sky" },
    { visible: true, direction: "rising in east during late evening", brightness: "mag -2.5, brilliant", note: "Rising earlier, approaching opposition" },
    { visible: true, direction: "high in south by midnight", brightness: "mag -2.7, brilliant", note: "Near opposition, brilliant all night" },
    { visible: true, direction: "prominent in evening sky", brightness: "mag -2.8, brilliant", note: "At opposition, closest and brightest" },
    { visible: true, direction: "high in south during evening", brightness: "mag -2.6, brilliant", note: "Still spectacular after opposition" },
  ],
  Saturn: [
    { visible: false, direction: "", brightness: "", note: "" },
    { visible: true, direction: "low in east before sunrise", brightness: "mag 1.0, moderate", note: "Saturn emerges in the morning sky" },
    { visible: true, direction: "in east-southeast before sunrise", brightness: "mag 0.9, moderate", note: "Rings nearly edge-on this year" },
    { visible: true, direction: "in south before sunrise", brightness: "mag 0.8, moderate", note: "Well-placed in the predawn sky" },
    { visible: true, direction: "in south during predawn hours", brightness: "mag 0.7, moderately bright", note: "Rising before midnight" },
    { visible: true, direction: "rising in east late evening", brightness: "mag 0.6, moderately bright", note: "Visible most of the night" },
    { visible: true, direction: "in south by midnight", brightness: "mag 0.4, moderately bright", note: "Approaching opposition" },
    { visible: true, direction: "prominent in south during evening", brightness: "mag 0.3, bright", note: "Near opposition, at its best" },
    { visible: true, direction: "in south during evening", brightness: "mag 0.4, moderately bright", note: "Still well-placed in the evening" },
    { visible: true, direction: "in southwest during evening", brightness: "mag 0.6, moderately bright", note: "Setting earlier each night" },
    { visible: true, direction: "low in southwest after sunset", brightness: "mag 0.8, moderate", note: "Low in the early evening" },
    { visible: false, direction: "", brightness: "", note: "" },
  ],
};

function getVisiblePlanets(date: Date): PlanetVisibility[] {
  const month = date.getMonth(); // 0-indexed
  const planets: PlanetVisibility[] = [];

  for (const [name, monthlyData] of Object.entries(PLANET_VISIBILITY_2026)) {
    const data = monthlyData[month];
    if (data.visible) {
      planets.push({
        name,
        direction: data.direction,
        brightness: data.brightness,
        note: data.note,
      });
    }
  }

  return planets;
}

// --------------------------------------------------------------------------
// Meteor Showers
// --------------------------------------------------------------------------

interface MeteorShowerData {
  name: string;
  peakMonth: number; // 1-12
  peakDay: number;
  zhr: number;
  note: string;
}

const METEOR_SHOWERS: MeteorShowerData[] = [
  { name: "Quadrantids", peakMonth: 1, peakDay: 3, zhr: 110, note: "Brief but intense shower; best after midnight. Radiant in Bootes." },
  { name: "Lyrids", peakMonth: 4, peakDay: 22, zhr: 18, note: "Ancient shower from Comet Thatcher. Look near Vega after midnight." },
  { name: "Eta Aquariids", peakMonth: 5, peakDay: 6, zhr: 50, note: "Debris from Halley's Comet. Best in predawn hours, favors southern latitudes." },
  { name: "Delta Aquariids", peakMonth: 7, peakDay: 30, zhr: 25, note: "Gentle summer shower. Best after midnight, radiant in Aquarius." },
  { name: "Perseids", peakMonth: 8, peakDay: 12, zhr: 100, note: "The crowd favorite! Fast, bright meteors from Comet Swift-Tuttle." },
  { name: "Draconids", peakMonth: 10, peakDay: 8, zhr: 10, note: "Best in the evening, unusual for a meteor shower. Look toward Draco." },
  { name: "Orionids", peakMonth: 10, peakDay: 21, zhr: 20, note: "Another Halley's Comet shower. Fast meteors near Orion's club." },
  { name: "Leonids", peakMonth: 11, peakDay: 17, zhr: 15, note: "Famous for occasional storms. Radiant in Leo, best after midnight." },
  { name: "Geminids", peakMonth: 12, peakDay: 14, zhr: 150, note: "The year's best shower! Bright, slow meteors from asteroid Phaethon." },
  { name: "Ursids", peakMonth: 12, peakDay: 22, zhr: 10, note: "Modest shower near the winter solstice. Radiant near Polaris." },
];

function getActiveMeteorShower(date: Date): MeteorShower | null {
  const year = date.getFullYear();

  for (const shower of METEOR_SHOWERS) {
    const peakDate = new Date(year, shower.peakMonth - 1, shower.peakDay);
    const diffDays = Math.abs(
      (date.getTime() - peakDate.getTime()) / 86400000
    );

    if (diffDays <= 3) {
      return {
        name: shower.name,
        peakDate: `${shower.peakMonth}/${shower.peakDay}`,
        zhr: shower.zhr,
        note: shower.note,
      };
    }
  }

  return null;
}

// --------------------------------------------------------------------------
// Main Function
// --------------------------------------------------------------------------

export function getCelestialData(
  date: Date,
  lat: number,
  lng: number
): CelestialData {
  // --- Sun times ---
  const sunTimes = computeSunTimes(date, lat, lng, -0.833);
  const civilTimes = computeSunTimes(date, lat, lng, -6);
  const nauticalTimes = computeSunTimes(date, lat, lng, -12);
  const astroTimes = computeSunTimes(date, lat, lng, -18);
  const goldenTimes = computeSunTimes(date, lat, lng, 6);

  const sunrise = sunTimes ? formatTime(sunTimes.rise) : "--:-- --";
  const sunset = sunTimes ? formatTime(sunTimes.set) : "--:-- --";
  const solarNoon = sunTimes ? formatTime(sunTimes.noon) : "--:-- --";

  const dayLengthMinutes = getDayLengthMinutes(date, lat, lng);

  // Day length delta: compare with yesterday
  const yesterday = new Date(date.getTime() - 86400000);
  const yesterdayLength = getDayLengthMinutes(yesterday, lat, lng);
  const dayLengthDelta = Math.round((dayLengthMinutes - yesterdayLength) * 10) / 10;

  // Golden hour
  const goldenHourMorning: GoldenHour = {
    start: sunTimes ? formatTime(sunTimes.rise) : "--:-- --",
    end: goldenTimes ? formatTime(goldenTimes.rise) : "--:-- --",
  };
  const goldenHourEvening: GoldenHour = {
    start: goldenTimes ? formatTime(goldenTimes.set) : "--:-- --",
    end: sunTimes ? formatTime(sunTimes.set) : "--:-- --",
  };

  // Twilight times
  const civilDawn = civilTimes ? formatTime(civilTimes.rise) : "--:-- --";
  const civilDusk = civilTimes ? formatTime(civilTimes.set) : "--:-- --";
  const nauticalDawn = nauticalTimes ? formatTime(nauticalTimes.rise) : "--:-- --";
  const nauticalDusk = nauticalTimes ? formatTime(nauticalTimes.set) : "--:-- --";
  const astronomicalDawn = astroTimes ? formatTime(astroTimes.rise) : "--:-- --";
  const astronomicalDusk = astroTimes ? formatTime(astroTimes.set) : "--:-- --";

  // --- Moon ---
  const moonData = computeMoonData(date, lat, lng);

  // --- Planets ---
  const visiblePlanets = getVisiblePlanets(date);

  // --- Meteor shower ---
  const meteorShower = getActiveMeteorShower(date);

  return {
    sunrise,
    sunset,
    solarNoon,
    dayLengthMinutes: Math.round(dayLengthMinutes),
    dayLengthDelta,
    goldenHourMorning,
    goldenHourEvening,

    civilDawn,
    civilDusk,
    nauticalDawn,
    nauticalDusk,
    astronomicalDawn,
    astronomicalDusk,

    moonrise: moonData.moonrise !== null ? formatTime(moonData.moonrise) : null,
    moonset: moonData.moonset !== null ? formatTime(moonData.moonset) : null,
    illuminationPct: moonData.illuminationPct,
    distanceKm: moonData.distanceKm,
    isSupermoon: moonData.isSupermoon,
    isMicromoon: moonData.isMicromoon,

    visiblePlanets,
    meteorShower,
  };
}
