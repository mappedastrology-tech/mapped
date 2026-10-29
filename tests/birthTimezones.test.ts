/**
 * Birth time → UTC, the input most likely to make a chart wrong.
 *
 * The zone used to come from hand-drawn bounding boxes: 38 of 46 edge-case
 * places got the wrong offset (Phoenix on Denver DST, Nashville on Eastern,
 * Seoul on UTC+8, Amsterdam on Etc/GMT …). Zones now come from geo-tz's real
 * boundaries and are stored on the chart; this file pins both halves.
 *
 * Every expected offset below was checked against IANA tzdata 2026f compiled
 * WITH backzone (zic + Python zoneinfo), an implementation independent of
 * lib/astro/birthTimezone. Chart angles are Swiss Ephemeris reference values.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { lookupTimezone } from "../src/lib/astro/geoTimezone";
import {
  birthTimeToUtcHour, describeAmbiguity, describeBirthOffset, formatOffsetLabel,
  isResolvedZone, localClock, parseZone, resolveBirthOffset,
} from "../src/lib/astro/birthTimezone";
import { calculateChart } from "../src/lib/astro/calculateChart";
import { calculateSolarReturn } from "../src/lib/astro/calculateSolarReturn";

// [place, lat, lon, date, time, expected IANA zone, expected UTC offset (h)]
const PLACES: [string, number, number, string, string, string, number][] = [
  ["Honolulu 1961", 21.3069, -157.8583, "1961-08-04", "19:24", "Pacific/Honolulu", -10],
  ["Seattle 1942 (war time)", 47.6062, -122.3321, "1942-11-27", "10:15", "America/Los_Angeles", -7],
  ["Liverpool 1942 (double summer time)", 53.4084, -2.9916, "1942-06-18", "14:00", "Europe/London", 2],
  ["Reykjavik 1965", 64.1466, -21.9426, "1965-11-21", "07:50", "Atlantic/Reykjavik", -1],
  ["Melbourne 1968", -37.8136, 144.9631, "1968-05-28", "11:00", "Australia/Melbourne", 10],
  ["Sao Paulo 1985", -23.5505, -46.6333, "1985-12-10", "08:30", "America/Sao_Paulo", -2],
  ["Tromso 1990", 69.6492, 18.9553, "1990-12-15", "10:00", "Europe/Oslo", 1],
  ["Phoenix 1990", 33.4484, -112.074, "1990-07-04", "09:00", "America/Phoenix", -7],
  ["Indianapolis 1985", 39.7684, -86.1581, "1985-07-04", "09:00", "America/Indiana/Indianapolis", -5],
  ["Nashville 1995", 36.1627, -86.7816, "1995-03-10", "09:00", "America/Chicago", -6],
  ["Birmingham AL 2000", 33.5186, -86.8104, "2000-01-15", "09:00", "America/Chicago", -6],
  ["Huntsville AL 2000", 34.7304, -86.5861, "2000-07-01", "09:00", "America/Chicago", -5],
  ["Boise 1992", 43.615, -116.2023, "1992-02-01", "09:00", "America/Boise", -7],
  ["Midland TX 1988", 31.9973, -102.0779, "1988-11-20", "09:00", "America/Chicago", -6],
  ["Regina 1990", 50.4452, -104.6189, "1990-01-20", "09:00", "America/Regina", -6],
  ["Monterrey 1990", 25.6866, -100.3161, "1990-07-15", "09:00", "America/Monterrey", -6],
  ["Hermosillo 2010", 29.0729, -110.9559, "2010-07-15", "09:00", "America/Hermosillo", -7],
  ["Tucson 2000", 32.2226, -110.9747, "2000-07-01", "09:00", "America/Phoenix", -7],
  ["Cancun 2020", 21.1619, -86.8515, "2020-01-15", "09:00", "America/Cancun", -5],
  ["Thunder Bay 2000", 48.3809, -89.2477, "2000-01-15", "09:00", "America/Toronto", -5],
  ["Amsterdam 1995", 52.3676, 4.9041, "1995-07-15", "09:00", "Europe/Amsterdam", 2],
  ["Vienna 1995", 48.2082, 16.3738, "1995-07-15", "09:00", "Europe/Vienna", 2],
  ["Budapest 1995", 47.4979, 19.0402, "1995-07-15", "09:00", "Europe/Budapest", 2],
  ["Kyiv 2000", 50.4501, 30.5234, "2000-07-15", "09:00", "Europe/Kyiv", 3],
  ["Belgrade 2000", 44.7866, 20.4489, "2000-07-01", "09:00", "Europe/Belgrade", 2],
  ["Bratislava 2000", 48.1486, 17.1077, "2000-07-01", "09:00", "Europe/Bratislava", 2],
  ["Minsk 2015", 53.9006, 27.559, "2015-07-01", "09:00", "Europe/Minsk", 3],
  ["Kaliningrad 2015", 54.7104, 20.4522, "2015-01-15", "09:00", "Europe/Kaliningrad", 2],
  ["Samara 2000", 53.1959, 50.1002, "2000-07-01", "09:00", "Europe/Samara", 5],
  ["Istanbul 2020", 41.0082, 28.9784, "2020-01-15", "09:00", "Europe/Istanbul", 3],
  ["Jerusalem 2015", 31.7683, 35.2137, "2015-07-01", "09:00", "Asia/Jerusalem", 3],
  ["Tehran 1995", 35.6892, 51.389, "1995-07-10", "09:00", "Asia/Tehran", 4.5],
  ["Kabul 1995", 34.5553, 69.2075, "1995-07-10", "09:00", "Asia/Kabul", 4.5],
  ["Ahmedabad 1995", 23.0225, 72.5714, "1995-03-10", "09:00", "Asia/Kolkata", 5.5],
  ["Jaipur 1995", 26.9124, 75.7873, "1995-03-10", "09:00", "Asia/Kolkata", 5.5],
  ["Chandigarh 2000", 30.7333, 76.7794, "2000-07-01", "09:00", "Asia/Kolkata", 5.5],
  ["Kathmandu 1995", 27.7172, 85.324, "1995-03-10", "09:00", "Asia/Kathmandu", 5.75],
  ["Dhaka 1995", 23.8103, 90.4125, "1995-03-10", "09:00", "Asia/Dhaka", 6],
  ["Yangon 2000", 16.8409, 96.1735, "2000-07-01", "09:00", "Asia/Yangon", 6.5],
  ["Hong Kong 1975", 22.3193, 114.1694, "1975-07-10", "09:00", "Asia/Hong_Kong", 9],
  ["Seoul 1995", 37.5665, 126.978, "1995-03-10", "09:00", "Asia/Seoul", 9],
  ["Fukuoka 1995", 33.5902, 130.4017, "1995-03-10", "09:00", "Asia/Tokyo", 9],
  ["Darwin 1995", -12.4634, 130.8456, "1995-03-10", "09:00", "Australia/Darwin", 9.5],
  ["Alice Springs 2000", -23.698, 133.8807, "2000-01-15", "09:00", "Australia/Darwin", 9.5],
  ["Accra 1995", 5.6037, -0.187, "1995-03-10", "09:00", "Africa/Accra", 0],
  ["Dakar 2000", 14.7167, -17.4677, "2000-07-01", "09:00", "Africa/Dakar", 0],
  ["Algiers 2000", 36.7538, 3.0588, "2000-07-01", "09:00", "Africa/Algiers", 1],
  ["Tunis 2000", 36.8065, 10.1815, "2000-07-01", "09:00", "Africa/Tunis", 1],
  ["La Paz 2000", -16.4897, -68.1193, "2000-07-01", "09:00", "America/La_Paz", -4],
  ["Fortaleza 2005", -3.7319, -38.5267, "2005-01-15", "09:00", "America/Fortaleza", -3],
  ["Mendoza 1995", -32.8895, -68.8458, "1995-03-10", "09:00", "America/Argentina/Mendoza", -3],
  ["Santo Domingo 1995", 18.4861, -69.9312, "1995-03-10", "09:00", "America/Santo_Domingo", -4],
  ["Key West 1995", 24.5551, -81.78, "1995-07-10", "09:00", "America/New_York", -4],
  ["Utqiagvik 2000", 71.2906, -156.7886, "2000-06-21", "12:00", "America/Anchorage", -8],
  ["Austin 1990", 30.2672, -97.7431, "1990-05-05", "14:30", "America/Chicago", -5],
  // Pre-1937 Netherlands kept Amsterdam Mean Time, +0:19:32 — backzone only.
  ["Amsterdam Jan 1935", 52.3676, 4.9041, "1935-01-15", "09:00", "Europe/Amsterdam", 1172 / 3600],
  ["Amsterdam Jul 1935", 52.3676, 4.9041, "1935-07-15", "09:00", "Europe/Amsterdam", 4772 / 3600],
];

function hourOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

test("geo-tz resolves each edge-case birthplace to its real IANA zone", () => {
  for (const [place, lat, lon, , , zone] of PLACES) {
    assert.equal(lookupTimezone(lat, lon), zone, place);
  }
});

test("each edge-case birth gets the offset in force there and then", () => {
  for (const [place, lat, lon, date, time, zone, offset] of PLACES) {
    const [y, m, d] = date.split("-").map(Number);
    const r = resolveBirthOffset(zone, lat, lon, y, m, d, hourOf(time));
    assert.ok(Math.abs(r.offsetHours - offset) < 1e-9, `${place}: got ${r.offsetHours}, expected ${offset}`);
    assert.equal(r.source, "zone", place);
    assert.equal(r.zone, zone, place);
  }
});

test("the zone lookup rejects missing or invalid coordinates instead of answering for 0,0", () => {
  assert.equal(lookupTimezone(NaN, 10), null);
  assert.equal(lookupTimezone(91, 0), null);
  assert.equal(lookupTimezone(0, 181), null);
});

test("pre-standard-time births use the BIRTHPLACE's local mean time", () => {
  // Germany adopted CET in 1893. IANA's LMT is Berlin's, +0:53:28; Ulm, at
  // 9°59′E, kept +0:39:57 — the difference moves the Ascendant ~3°.
  const r = resolveBirthOffset("Europe/Berlin", 48.4011, 9.9876, 1879, 3, 14, 11.5);
  assert.equal(r.lmt, true);
  assert.equal(Math.round(r.offsetHours * 3600), Math.round(9.9876 * 240));
  assert.match(describeBirthOffset(r), /^Local mean time for the birthplace \(UTC\+0:39:57\)/);
  // After 1893 the zone's own standard time applies, not LMT.
  assert.equal(resolveBirthOffset("Europe/Berlin", 48.4011, 9.9876, 1900, 1, 15, 12).offsetHours, 1);
  // US railroad time began 18 Nov 1883; a Chicago birth before it is LMT at −87.65°.
  const chi = resolveBirthOffset("America/Chicago", 41.8781, -87.6298, 1880, 6, 1, 12);
  assert.equal(chi.lmt, true);
  assert.equal(Math.round(chi.offsetHours * 3600), Math.round(-87.6298 * 240));
});

const fmt = (p: { sign: string; position: number } | null) =>
  p ? `${p.sign} ${Math.floor(p.position)}°${String(Math.floor((p.position % 1) * 60)).padStart(2, "0")}′` : null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chart = (c: Record<string, unknown>): any => calculateChart({ name: "", ...c } as never);

test("reference charts land on the Swiss Ephemeris angles", () => {
  const einstein = chart({ birthDate: "1879-03-14", birthTime: "11:30", latitude: 48.4011, longitude: 9.9876, timezone: "Europe/Berlin" });
  assert.equal(fmt(einstein.ascendant), "Can 11°38′");
  assert.equal(fmt(einstein.midheaven), "Pis 12°50′");

  const obama = chart({ birthDate: "1961-08-04", birthTime: "19:24", latitude: 21.3069, longitude: -157.8583, timezone: "Pacific/Honolulu" });
  assert.equal(fmt(obama.ascendant), "Aqu 18°03′");

  // Iceland was UTC−1 until 1968; the runtime's own data says GMT.
  const bjork = chart({ birthDate: "1965-11-21", birthTime: "07:50", latitude: 64.1466, longitude: -21.9426, timezone: "Atlantic/Reykjavik" });
  assert.equal(bjork.ascendant.sign, "Sco");
  assert.ok(Math.abs(bjork.ascendant.position - (15 + 30 / 60)) < 2 / 60, `Björk Asc ${fmt(bjork.ascendant)}`);
  assert.equal(bjork.timezoneInfo.backzone, true);
});

test("a chart carries the zone it used, and never records an estimate as the zone", () => {
  const known = chart({ birthDate: "1990-05-05", birthTime: "14:30", latitude: 30.2672, longitude: -97.7431, timezone: "America/Chicago" });
  assert.equal(known.timezone, "America/Chicago");
  assert.equal(known.timezoneInfo.abbreviation, "CDT");
  assert.equal(describeBirthOffset(known.timezoneInfo), "America/Chicago (CDT, UTC−5)");

  for (const placeholder of [null, undefined, "", "UTC"]) {
    const est = chart({ birthDate: "1990-05-05", birthTime: "14:30", latitude: 30.2672, longitude: -97.7431, timezone: placeholder });
    assert.equal(est.timezone, null, `placeholder ${placeholder}`);
    assert.equal(est.timezoneInfo.source, "estimated");
  }
});

test("natal aspects count the node axis once", () => {
  const c = chart({ birthDate: "1990-05-05", birthTime: "14:30", latitude: 30.2672, longitude: -97.7431, timezone: "America/Chicago" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assert.equal(c.aspects.filter((a: any) => a.p1Name === "South Node" || a.p2Name === "South Node").length, 0);
  assert.equal(typeof c.planets[0].stationary, "boolean");
  assert.equal(c.polarFallback, false);
});

test("manual overrides: fixed offsets and LMT", () => {
  assert.deepEqual(parseZone("UTC-05:00"), { kind: "fixed", offsetSeconds: -18000 });
  assert.deepEqual(parseZone("UTC+5:30"), { kind: "fixed", offsetSeconds: 19800 });
  assert.deepEqual(parseZone("LMT"), { kind: "lmt" });
  assert.equal(parseZone("UTC"), null, "the legacy placeholder is not a zone");
  assert.equal(parseZone("Mars/Olympus_Mons"), null);
  assert.equal(isResolvedZone("Asia/Kathmandu"), true);

  const fixed = resolveBirthOffset("UTC-05:00", 30.27, -97.74, 1990, 5, 5, 14.5);
  assert.equal(fixed.offsetHours, -5);
  assert.equal(fixed.source, "manual");
  const lmt = resolveBirthOffset("LMT", 30.27, -97.74, 1990, 5, 5, 14.5);
  assert.equal(Math.round(lmt.offsetHours * 3600), Math.round(-97.74 * 240));
  assert.equal(formatOffsetLabel(-18000), "UTC−5");
  assert.equal(formatOffsetLabel(20700), "UTC+5:45");
});

test("a skipped clock hour is read on the old clock, and said so", () => {
  // US spring-forward 2019-03-10 02:00: 02:30 never existed in New York.
  const r = resolveBirthOffset("America/New_York", 40.7128, -74.006, 2019, 3, 10, 2.5);
  assert.equal(r.offsetHours, -5);
  assert.equal(r.ambiguity?.kind, "gap");
  assert.equal(r.ambiguity?.otherOffsetHours, -4);
  assert.match(describeAmbiguity(r, "02:30")!, /never appeared.*03:30/);
});

test("a repeated clock hour takes the first occurrence, and says so", () => {
  // US fall-back 2019-11-03 02:00 EDT → 01:00 EST: 01:30 happened twice.
  const r = resolveBirthOffset("America/New_York", 40.7128, -74.006, 2019, 11, 3, 1.5);
  assert.equal(r.offsetHours, -4);
  assert.equal(r.ambiguity?.kind, "overlap");
  assert.equal(r.ambiguity?.otherOffsetHours, -5);
  assert.match(describeAmbiguity(r, "01:30")!, /happened twice/);
  // An ordinary time on the same day is unambiguous.
  assert.equal(resolveBirthOffset("America/New_York", 40.7128, -74.006, 2019, 11, 3, 8).ambiguity, null);
});

test("astrocartography gets UT, not local time and not a CST guess", () => {
  // Austin 14:30 CDT = 19:30 UT. The old path passed the "UTC" placeholder
  // through and sent 14.5; with no zone at all it assumed CST (+6).
  assert.equal(birthTimeToUtcHour("1990-05-05", "14:30", "America/Chicago", 30.2672, -97.7431), 19.5);
  // Honolulu evening births cross into the next UT day; julday is linear in the hour.
  assert.equal(birthTimeToUtcHour("1961-08-04", "19:24", "Pacific/Honolulu", 21.3069, -157.8583), 29.4);
  // Kathmandu's +5:45 — far from any CST fallback.
  assert.equal(birthTimeToUtcHour("1995-03-10", "09:00", "Asia/Kathmandu", 27.7172, 85.324), 3.25);
  // An unresolved zone is estimated from the coordinates, not assumed.
  assert.equal(birthTimeToUtcHour("1990-05-05", "14:30", "UTC", 30.2672, -97.7431), 19.5);
});

test("solar return: unrounded natal Sun, and the instant shown on local clocks", () => {
  const natal = chart({ birthDate: "1990-05-05", birthTime: "14:30", latitude: 30.2672, longitude: -97.7431, timezone: "America/Chicago" });
  const sun = natal.planets.find((p: { name: string }) => p.name === "Sun");
  const sr = calculateSolarReturn({
    natalSunAbsPos: sun.absPosition, // rounded to 0.01° — superseded by the birth data
    birthDate: "1990-05-05", birthTime: "14:30", birthTimezone: "America/Chicago",
    birthLatitude: 30.2672, birthLongitude: -97.7431,
    latitude: 30.2672, longitude: -97.7431, year: 2026,
  }) as Record<string, unknown>;
  // Swiss Ephemeris: 2026 return at 12:43 UT.
  const utc = new Date(String(sr.returnUtc));
  const minutes = utc.getUTCHours() * 60 + utc.getUTCMinutes() + utc.getUTCSeconds() / 60;
  assert.equal(String(sr.returnUtc).slice(0, 10), "2026-05-05");
  assert.ok(Math.abs(minutes - (12 * 60 + 43)) <= 1, `return at ${sr.returnUtc}`);
  const local = localClock(String(sr.returnUtc), "America/Chicago");
  assert.equal(local.date, "2026-05-05");
  assert.equal(local.abbreviation, "CDT");
  assert.match(local.time, /^07:4[234]$/);
});
