import test from "node:test";
import assert from "node:assert/strict";

import { getZoneCenter, isInsideZone, getTimezoneForCoords } from "../src/lib/astro/timezone";

/**
 * The theme follows the DEVICE's timezone, because that is the part of "where
 * am I" a phone keeps up to date by itself. These cover the inversion of the
 * coords-to-zone table that makes it possible.
 */

const AUSTIN = { lat: 30.2672, lng: -97.7431 };   // America/Chicago
const MANILA = { lat: 14.5995, lng: 120.9842 };   // Asia/Manila

test("a zone's centre lands inside that zone", () => {
  // A centre that fell outside its own box would mean the sun was being placed
  // in a different timezone than the one the device reported.
  for (const tz of ["America/Chicago", "America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney"]) {
    const c = getZoneCenter(tz);
    assert.ok(c, `${tz} should be in the table`);
    assert.ok(isInsideZone(tz, c.lat, c.lng), `${tz} centre fell outside its own box`);
  }
});

test("someone at home is recognised as being in their device's zone", () => {
  // Austin is in America/Chicago, so an Austin reader on a Chicago-time phone
  // should get their exact coordinates rather than the box centre.
  assert.equal(getTimezoneForCoords(AUSTIN.lat, AUSTIN.lng), "America/Chicago");
  assert.ok(isInsideZone("America/Chicago", AUSTIN.lat, AUSTIN.lng));
});

test("a birth location abroad is NOT treated as where you are", () => {
  // This is the bug the device-first rule exists to fix: born in Manila,
  // reading in Texas. Manila must not satisfy the Chicago zone, or the app
  // would go dark at a Manila sunset on a Texas clock.
  assert.ok(!isInsideZone("America/Chicago", MANILA.lat, MANILA.lng));
  assert.ok(!isInsideZone("Asia/Manila", AUSTIN.lat, AUSTIN.lng));
});

test("an unknown zone has no centre, so the caller falls through", () => {
  assert.equal(getZoneCenter("Not/AZone"), null);
  assert.equal(getZoneCenter("Etc/GMT+5"), null);
  assert.equal(isInsideZone("Not/AZone", 0, 0), false);
});

test("zone centres are plausible coordinates", () => {
  for (const tz of ["America/Chicago", "Europe/London", "Asia/Tokyo"]) {
    const c = getZoneCenter(tz)!;
    assert.ok(c.lat >= -90 && c.lat <= 90, `${tz} latitude out of range`);
    assert.ok(c.lng >= -180 && c.lng <= 180, `${tz} longitude out of range`);
  }
});
