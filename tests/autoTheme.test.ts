import test from "node:test";
import assert from "node:assert/strict";

import { themeForMoment, msUntilNextSwitch } from "../src/lib/autoTheme";
import { getSunriseSunset } from "../src/lib/celestialMechanics";

/**
 * The sunrise maths is expressed in the DEVICE's local hours, so these tests
 * only mean anything if the process timezone matches the coordinates. The
 * suite runs under whatever TZ the machine has, so rather than assume one,
 * each test derives the day's actual sunrise and sunset for the fixture and
 * asserts about moments relative to those. That keeps them honest in CI, on a
 * laptop in another country, and in a container running UTC.
 */

const AUSTIN = { lat: 30.2672, lng: -97.7431 };
const MINUTE = 60_000;

/** A Date at a given decimal local hour on a fixed date. */
function at(hour: number, day = new Date(2026, 5, 15)): Date {
  const d = new Date(day);
  d.setHours(Math.floor(hour), Math.round((hour - Math.floor(hour)) * 60), 0, 0);
  return d;
}

test("midday is light and the small hours are dark", () => {
  const times = getSunriseSunset(at(12), AUSTIN.lat, AUSTIN.lng);
  assert.ok(times, "fixture should have a sunrise and sunset");
  const noon = (times.sunrise + times.sunset) / 2;

  assert.equal(themeForMoment(at(noon), AUSTIN), "light");
  // Half way round from solar noon is the dead of night.
  const midnight = (noon + 12) % 24;
  assert.equal(themeForMoment(at(midnight), AUSTIN), "dark");
});

test("it flips exactly at sunrise and at sunset, not an hour either side", () => {
  const times = getSunriseSunset(at(12), AUSTIN.lat, AUSTIN.lng);
  assert.ok(times);

  // A minute before sunrise is still night; a minute after is day.
  assert.equal(themeForMoment(at(times.sunrise - 0.02), AUSTIN), "dark");
  assert.equal(themeForMoment(at(times.sunrise + 0.02), AUSTIN), "light");

  // And the same at the other end.
  assert.equal(themeForMoment(at(times.sunset - 0.02), AUSTIN), "light");
  assert.equal(themeForMoment(at(times.sunset + 0.02), AUSTIN), "dark");
});

test("no location means no opinion, so the caller can fall back to the OS", () => {
  // Returning a guess here would be worse than saying nothing: the provider
  // would show a theme with no reason behind it and no way to tell.
  assert.equal(themeForMoment(at(12), null), null);
  assert.equal(themeForMoment(at(12), { lat: NaN, lng: 0 }), null);
});

test("the southern hemisphere is not the northern one inverted", () => {
  // Sydney in June is winter: short day. The naive mistake is to key off the
  // month, which would make this light for most of the day.
  const sydney = { lat: -33.8688, lng: 151.2093 };
  const times = getSunriseSunset(at(12), sydney.lat, sydney.lng);
  assert.ok(times);
  // Day length is independent of which clock the hours are quoted on, because
  // the device offset cancels out of the subtraction.
  const dayLength = ((times.sunset - times.sunrise) % 24 + 24) % 24;
  assert.ok(dayLength < 12, `June in Sydney should be a short day, got ${dayLength.toFixed(1)}h`);

  // Midpoint measured along the daylight arc, so this holds whatever timezone
  // the test process is running in.
  const mid = ((times.sunrise + dayLength / 2) % 24 + 24) % 24;
  assert.equal(themeForMoment(at(mid), sydney), "light");
});

test("polar summer stays light and polar winter stays dark all day", () => {
  // Longyearbyen: the sun neither rises nor sets, so getSunriseSunset gives up
  // and the tie is broken by which way the planet is tilted. Without this the
  // feature would silently fall back to the OS for months at a time.
  const svalbard = { lat: 78.22, lng: 15.65 };
  const june = new Date(2026, 5, 21);
  const december = new Date(2026, 11, 21);

  assert.equal(getSunriseSunset(at(12, june), svalbard.lat, svalbard.lng), null);
  for (const h of [2, 9, 15, 23]) {
    assert.equal(themeForMoment(at(h, june), svalbard), "light", `June ${h}:00 should be light`);
    assert.equal(themeForMoment(at(h, december), svalbard), "dark", `December ${h}:00 should be dark`);
  }
});

test("the next switch is scheduled for the next boundary, not a fixed poll", () => {
  const times = getSunriseSunset(at(12), AUSTIN.lat, AUSTIN.lng);
  assert.ok(times);

  // An hour before sunset, the wait should be about an hour.
  const ms = msUntilNextSwitch(at(times.sunset - 1), AUSTIN);
  assert.ok(Math.abs(ms - 60 * MINUTE) < 3 * MINUTE, `expected ~1h, got ${Math.round(ms / MINUTE)}min`);
});

test("after the last boundary of the day it waits for tomorrow's sunrise", () => {
  const times = getSunriseSunset(at(12), AUSTIN.lat, AUSTIN.lng);
  assert.ok(times);
  const ms = msUntilNextSwitch(at(times.sunset + 0.5), AUSTIN);
  // Somewhere overnight — definitely more than an hour, and capped at six.
  assert.ok(ms > 60 * MINUTE, "should not re-check within the hour");
  assert.ok(ms <= 6 * 60 * MINUTE, "should be capped so a stale result self-corrects");
});

test("the wait is never zero and never longer than six hours", () => {
  // A zero would spin; an unbounded wait would let a wrong answer — a changed
  // location, a slept-through transition — persist until the next reload.
  for (let h = 0; h < 24; h += 0.25) {
    const ms = msUntilNextSwitch(at(h), AUSTIN);
    assert.ok(ms >= MINUTE, `hour ${h}: ${ms}ms is too eager`);
    assert.ok(ms <= 6 * 60 * MINUTE, `hour ${h}: ${ms}ms is too long`);
  }
  assert.ok(msUntilNextSwitch(at(12), null) <= 6 * 60 * MINUTE);
});
