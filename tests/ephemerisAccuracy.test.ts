/**
 * The chart engine checked against Swiss Ephemeris 2.10.03 (sepl/semo/seas_18),
 * the reference every serious astrology program agrees with. Each expected
 * value below came from pyswisseph; the comments say what used to be wrong.
 *
 * 1. Chiron was a Keplerian orbit with hand-set corrections, up to 5.6° off
 *    (wrong sign on 6% of dates 1920–2030). It is now a Swiss table.
 * 2. Between the tropics the Vertex came back as the anti-Vertex on about a
 *    quarter of sidereal times (0° Libra where Swiss says 0° Aries).
 * 3. Above the polar circle Placidus produced repeated cusps, and the
 *    Ascendant was sometimes the western horizon point.
 * 4. Composite cusps were midpointed one at a time and could come out of order.
 * 5. Retrograde was a 1-day forward difference — wrong near stations.
 * 6. posToSign could say "30.00° Taurus".
 */

import test from "node:test";
import assert from "node:assert/strict";

import { getHouses, getPlanetData, getSpecialPoints, julday } from "../src/lib/astro/ephemeris";
import { getChironData } from "../src/lib/astro/chironEphemeris";
import { posToSign } from "../src/lib/astro/constants";
import { calculateChart } from "../src/lib/astro/calculateChart";
import { calculateComposite } from "../src/lib/astro/calculateComposite";

/** Unsigned angular distance in degrees. */
const sep = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);

test("Chiron matches Swiss Ephemeris", () => {
  // Jimi Hendrix, 27 Nov 1942 10:15 PWT (UTC−7), Seattle: 29°08′ Leo direct.
  const hendrix = getChironData(julday(1942, 11, 27, 17.25));
  assert.ok(sep(hendrix.longitude, 149.14096) < 0.002, `Hendrix Chiron ${hendrix.longitude}`);
  assert.ok(hendrix.speed > 0);

  // Today, 2026-10-28 12:00 UT: 28°14′ Aries, retrograde.
  const now = getPlanetData(julday(2026, 10, 28, 12), "Chiron");
  assert.ok(sep(now.longitude, 28.23561) < 0.002, `2026 Chiron ${now.longitude}`);
  assert.equal(now.retrograde, true);
  assert.ok(Math.abs(now.longitudeSpeed - -0.046284) < 0.0005);

  // Aries ingress: Swiss has it at 2018-04-17 ~09:00 UT.
  assert.ok(getChironData(julday(2018, 4, 17, 6)).longitude > 359.9);
  assert.ok(getChironData(julday(2018, 4, 17, 12)).longitude < 0.1);
});

test("Chiron is left out where there is no authoritative ephemeris", () => {
  assert.ok(Number.isNaN(getChironData(julday(1750, 1, 1)).longitude));
  const names = getSpecialPoints(julday(1750, 1, 1)).map((p) => p.name);
  assert.deepEqual(names, ["North Node", "South Node", "Lilith"]);
  assert.ok(getSpecialPoints(julday(1990, 1, 1)).some((p) => p.name === "Chiron"));
});

test("the Vertex is always the western point, including in the tropics", () => {
  // Swiss Vertex every 2 hours UT on 1990-03-15.
  const swiss: Record<string, [number, number, number[]]> = {
    Equator: [0, 0, [0, 180, 180, 180, 180, 180, 180, 0, 0, 0, 0, 0]],
    Honolulu: [21.3069, -157.8583,
      [230.77, 242.16, 62.93, 297.56, 117.64, 128.97, 142.46, 157.06, 172.34, 187.85, 203.11, 217.71]],
    Mumbai: [19.076, 72.8777,
      [168.07, 182.56, 196.96, 210.71, 223.15, 232.84, 52.63, 336.99, 304.78, 130.38, 141.43, 154.47]],
  };
  for (const [place, [lat, lon, expected]] of Object.entries(swiss)) {
    expected.forEach((vx, i) => {
      const h = getHouses(julday(1990, 3, 15, i * 2), lat, lon);
      assert.ok(sep(h.vertex, vx) < 0.05, `${place} ${i * 2}h UT: vertex ${h.vertex}, Swiss ${vx}`);
    });
  }
});

test("inside the polar circle: Porphyry, flagged, eastern Ascendant (Swiss convention)", () => {
  // Tromsø 69.65°N, 2001-12-01. Swiss refuses Placidus here and gives Porphyry.
  const cases: [number, number[]][] = [
    [9, [238.89, 294.83, 350.77, 46.71, 50.77, 54.83, 58.89, 114.83, 170.77, 226.71, 230.77, 234.83]],
    [21, [157.54, 180.76, 203.98, 227.2, 263.98, 300.76, 337.54, 0.76, 23.98, 47.2, 83.98, 120.76]],
    [15.5, [122.79, 128.39, 133.99, 139.59, 193.99, 248.39, 302.79, 308.39, 313.99, 319.59, 13.99, 68.39]],
  ];
  for (const [hour, expected] of cases) {
    const h = getHouses(julday(2001, 12, 1, hour), 69.6492, 18.9553);
    assert.equal(h.polarFallback, true);
    assert.equal(h.houseSystemUsed, "porphyry");
    h.cusps.forEach((c, i) =>
      assert.ok(sep(c, expected[i]) < 0.03, `Tromsø ${hour}h cusp ${i + 1}: ${c}, Swiss ${expected[i]}`));
  }
  // South of the circle nothing changes.
  const london = getHouses(julday(1985, 3, 21, 6.25), 51.5074, -0.1278);
  assert.equal(london.polarFallback, false);
  assert.equal(london.houseSystemUsed, "placidus");
});

test("Placidus angles and cusps match Swiss at ordinary latitudes", () => {
  // Nairobi 1979-05-10 11:00 UT and Mumbai 1991-12-02 23:00 UT.
  const h1 = getHouses(2444003.958333, -1.2921, 36.8219);
  assert.ok(sep(h1.ascendant, 157.589) < 0.02 && sep(h1.mc, 71.041) < 0.02);
  const h2 = getHouses(2448593.458333, 19.076, 72.8777);
  assert.ok(sep(h2.ascendant, 216.646) < 0.02 && sep(h2.mc, 126.77) < 0.02);
});

test("retrograde is the instantaneous direction; stations are marked", () => {
  // Swiss: Mercury stations direct 2026-11-13 16:05 UT (JD 2461358.17).
  const station = 2461358.17;
  const before = getPlanetData(station - 3 / 24, "Mercury");
  const after = getPlanetData(station + 3 / 24, "Mercury");
  // The old 1-day forward difference already called the hours before the
  // station direct.
  assert.equal(before.retrograde, true);
  assert.equal(after.retrograde, false);
  assert.equal(before.stationary, true);
  assert.equal(after.stationary, true);
  // Three days out: plainly moving, not stationary.
  for (const d of [-3, 3]) {
    const p = getPlanetData(station + d, "Mercury");
    assert.equal(p.retrograde, d < 0);
    assert.equal(p.stationary, false);
  }});

test("composite houses always form an ordered wheel", () => {
  let bad = 0;
  for (let h = 0; h < 24; h++) {
    for (let h2 = 0; h2 < 24; h2 += 3) {
      const a = calculateChart({ name: "a", birthDate: "1990-05-05", birthTime: `${String(h).padStart(2, "0")}:00`, latitude: 30.27, longitude: -97.74 });
      const b = calculateChart({ name: "b", birthDate: "1988-11-20", birthTime: `${String(h2).padStart(2, "0")}:00`, latitude: 40.71, longitude: -74.0 });
      const c = calculateComposite({ chart1: a as never, chart2: b as never });
      const cu = c.houses.map((x) => x.absPosition);
      let total = 0;
      for (let i = 0; i < 12; i++) total += (((cu[(i + 1) % 12] - cu[i]) % 360) + 360) % 360;
      if (Math.abs(total - 360) > 0.5) bad++;
      // Composite MC is the NEAR midpoint of the two MCs.
      const mc1 = (a.midheaven as { absPosition: number }).absPosition;
      const mc2 = (b.midheaven as { absPosition: number }).absPosition;
      assert.ok(sep(c.houses[9].absPosition, mc1) <= sep(mc1, mc2) / 2 + 0.02);
    }
  }
  assert.equal(bad, 0, `${bad}/192 composite wheels out of order`);
});

test("composite aspects do not restate the nodal axis", () => {
  const a = calculateChart({ name: "a", birthDate: "1990-05-05", birthTime: "12:00", latitude: 30.27, longitude: -97.74 });
  const b = calculateChart({ name: "b", birthDate: "1988-11-20", birthTime: "08:00", latitude: 40.71, longitude: -74.0 });
  const c = calculateComposite({ chart1: a as never, chart2: b as never });
  assert.ok(!c.aspects.some((x) => x.p1Name === "South Node" || x.p2Name === "South Node"));
});

test("posToSign never reports 30° of a sign", () => {
  assert.deepEqual(posToSign(59.996), { sign: "Tau", signNum: 1, position: 29.99, absPosition: 59.99 });
  assert.deepEqual(posToSign(60), { sign: "Gem", signNum: 2, position: 0, absPosition: 60 });
  assert.equal(posToSign(359.999).position, 29.99);
  assert.equal(posToSign(359.999).sign, "Pis");
  for (let x = 0; x < 360; x += 0.0037) {
    const p = posToSign(x);
    assert.ok(p.position >= 0 && p.position < 30, `${x} -> ${p.position}`);
    assert.equal(p.signNum, Math.floor(p.absPosition / 30));
  }
});
