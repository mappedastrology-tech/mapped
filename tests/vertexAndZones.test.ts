/**
 * Two bugs in the chart's own geometry.
 *
 * 1. The Vertex was `calcAscendant(ramc, obliquity, 90 - lat)`. The Vertex is
 *    the ecliptic point on the WESTERN prime vertical, and the prime vertical
 *    of (lat, LST) is the horizon of (90 - lat, LST + 180) — so the formula
 *    needs `ramc + 180`. Without it the result sat 12-39 degrees off the prime
 *    vertical, and that number fed every "fated contact" in synastry at
 *    weight 88.
 *
 * 2. The Australia/Sydney bounding box was listed before Australia/Brisbane
 *    and strictly contains it, so Queensland births picked up New South Wales
 *    daylight saving. Queensland ran a DST trial from 1989 to 1992 and has
 *    observed none since, so the two zones agree only inside that window.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { getHouses, julday } from "../src/lib/astro/ephemeris";
import { getTimezoneForCoords } from "../src/lib/astro/timezone";
import { getUtcOffsetHours } from "../src/lib/astro/calculateChart";

const DEG = Math.PI / 180, RAD = 180 / Math.PI;
const OBLIQUITY = 23.4393;

/** Azimuth of an ecliptic longitude, measured north through east. */
function azimuthOf(lambda: number, ramc: number, geoLat: number): number {
  const L = lambda * DEG, o = OBLIQUITY * DEG, phi = geoLat * DEG;
  const ra = Math.atan2(Math.cos(o) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(o) * Math.sin(L));
  const H = ramc * DEG - ra;
  const az = Math.atan2(
    -Math.sin(H) * Math.cos(dec),
    Math.sin(dec) * Math.cos(phi) - Math.cos(dec) * Math.sin(phi) * Math.cos(H),
  );
  return ((az * RAD) % 360 + 360) % 360;
}

test("the Vertex lands on the western prime vertical at every latitude", () => {
  const places: [string, number, number, number, number, number][] = [
    ["Houston",   1990, 7,  4, 19.5,  29.7604],
    ["London",    1985, 3, 21,  6.25, 51.5074],
    ["Sydney",    1992,11, 20, 21.25,-33.8688],
    ["Reykjavik", 1998,12, 21,  3.17, 64.1466],
    ["Nairobi",   1979, 5, 10, 11.0,  -1.2921],
    ["Tokyo",     2001, 9,  9,  2.0,  35.6762],
  ];

  for (const [name, y, m, d, h, lat] of places) {
    const houses = getHouses(julday(y, m, d, h), lat, 0);
    const az = azimuthOf(houses.vertex, houses.armc, lat);
    // 270 is the Vertex, 90 the Antivertex — atan2 picks a branch, and either
    // is ON the prime vertical, which is what this is testing.
    const offPrimeVertical = Math.min(Math.abs(az - 270), Math.abs(az - 90));
    assert.ok(
      offPrimeVertical < 1,
      `${name}: vertex ${houses.vertex.toFixed(2)} has azimuth ${az.toFixed(1)}, ` +
        `${offPrimeVertical.toFixed(1)} off the prime vertical`,
    );
  }
});

test("Queensland is not given New South Wales daylight saving", () => {
  const BRISBANE: [number, number] = [-27.4698, 153.0251];
  const CAIRNS: [number, number] = [-16.9186, 145.7781];
  const SYDNEY: [number, number] = [-33.8688, 151.2093];

  assert.equal(getTimezoneForCoords(...BRISBANE), "Australia/Brisbane");
  assert.equal(getTimezoneForCoords(...CAIRNS), "Australia/Brisbane");
  assert.equal(getTimezoneForCoords(...SYDNEY), "Australia/Sydney");

  // Outside the 1989-92 trial, Queensland stays on +10 through the summer.
  for (const year of [1995, 2010, 2024]) {
    assert.equal(getUtcOffsetHours(...BRISBANE, year, 1, 15, 14.5), 10, `Brisbane Jan ${year}`);
    assert.equal(getUtcOffsetHours(...SYDNEY, year, 1, 15, 14.5), 11, `Sydney Jan ${year}`);
  }

  // Inside the trial they genuinely agreed — the zone data knows this, and a
  // test that asserted +10 here would be pinning the wrong answer.
  assert.equal(getUtcOffsetHours(...BRISBANE, 1990, 1, 15, 14.5), 11, "Brisbane during the DST trial");

  // Winter: no daylight saving anywhere, both on standard time.
  assert.equal(getUtcOffsetHours(...BRISBANE, 2010, 7, 15, 14.5), 10);
  assert.equal(getUtcOffsetHours(...SYDNEY, 2010, 7, 15, 14.5), 10);
});
