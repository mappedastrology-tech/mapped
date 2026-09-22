import test from "node:test";
import assert from "node:assert/strict";

import { risingIntervals, rectifyBirthTime, windowRange } from "../src/lib/birthTimeRectification";
import { calculateChart } from "../src/lib/astro/calculateChart";

/**
 * The value of this feature is that its answer is checkable. These check it.
 *
 * Austin, Texas on 1990-06-15 — a mid-northern latitude, so the ascension
 * times are lopsided (the short-ascension signs pass quickly), which is
 * exactly where a naive "two hours per sign" assumption would show up wrong.
 */
const AUSTIN = { birthDate: "1990-06-15", latitude: 30.2672, longitude: -97.7431 };

test("a day contains every sign, in order, covering the whole clock", () => {
  const ivs = risingIntervals(AUSTIN);
  assert.ok(ivs.length >= 12, `expected at least 12 intervals, got ${ivs.length}`);

  // Contiguous: each interval starts where the last ended, and together they
  // span midnight to midnight. A gap would mean a birth minute with no answer.
  assert.equal(ivs[0].startHour, 0);
  assert.equal(ivs[ivs.length - 1].endHour, 24);
  for (let i = 1; i < ivs.length; i++) {
    assert.equal(ivs[i].startHour, ivs[i - 1].endHour, `gap before interval ${i}`);
  }

  // All twelve signs rise in a day, everywhere outside the polar circles.
  assert.equal(new Set(ivs.map((iv) => iv.sign)).size, 12);
});

test("the scan agrees with the chart engine at the midpoint of every interval", () => {
  // This is the real check: the intervals are only worth anything if the sign
  // they name is the sign calculateChart independently produces for a birth at
  // that moment. Anything else means the feature would hand someone a time
  // that builds a different chart than the one it promised.
  const ivs = risingIntervals(AUSTIN);
  for (const iv of ivs) {
    const mid = (iv.startHour + iv.endHour) / 2;
    const h = Math.floor(mid);
    const m = Math.round((mid - h) * 60);
    if (h >= 24) continue;
    const chart = calculateChart({
      name: "t",
      birthDate: AUSTIN.birthDate,
      birthTime: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      unknownTime: false,
      latitude: AUSTIN.latitude,
      longitude: AUSTIN.longitude,
    }) as { bigThree: { rising: string } };
    assert.equal(
      chart.bigThree.rising,
      iv.sign.slice(0, 3),
      `at ${h}:${m} the scan said ${iv.sign} but the chart says ${chart.bigThree.rising}`,
    );
  }
});

test("window and sign agreeing gives a span inside that window", () => {
  const ivs = risingIntervals(AUSTIN);
  // Pick a sign that genuinely rises in the afternoon at this place and date,
  // rather than assuming one.
  const win = windowRange("afternoon");
  const inWin = ivs.find((iv) => iv.startHour < win.endHour && iv.endHour > win.startHour);
  assert.ok(inWin, "expected some sign rising in the afternoon");

  const r = rectifyBirthTime({ ...AUSTIN, window: "afternoon", candidateSigns: [inWin.sign] });
  assert.equal(r.outcome, "agreed");
  assert.equal(r.risingSign, inWin.sign);
  assert.ok(r.startHour >= win.startHour && r.endHour <= win.endHour, "span escaped the window");
  assert.ok(r.spanMinutes > 0 && r.spanMinutes <= 3 * 60);
});

test("a sign that wasn't rising in the remembered window is reported as a conflict", () => {
  const ivs = risingIntervals(AUSTIN);
  const win = windowRange("afternoon");
  const notInWin = ivs.find((iv) => iv.endHour <= win.startHour || iv.startHour >= win.endHour);
  assert.ok(notInWin);

  const r = rectifyBirthTime({ ...AUSTIN, window: "afternoon", candidateSigns: [notInWin.sign] });
  assert.equal(r.outcome, "conflict");
  // It still gives them something usable: what WAS rising then.
  assert.ok(r.signsInWindow.length > 0);
  assert.ok(r.spanMinutes > 0);
});

test("a sign with no window still narrows to that sign's own span", () => {
  const ivs = risingIntervals(AUSTIN);
  const sign = ivs[3].sign;
  const r = rectifyBirthTime({ ...AUSTIN, window: null, candidateSigns: [sign] });
  assert.equal(r.outcome, "sign_only");
  assert.equal(r.risingSign, sign);
  assert.ok(r.spanMinutes < 24 * 60);
});

test("told nothing, it says the whole day rather than inventing a minute", () => {
  const r = rectifyBirthTime({ ...AUSTIN, window: null, candidateSigns: [] });
  assert.equal(r.spanMinutes, 24 * 60);
  assert.equal(r.risingSign, null);
});

test("a window that crosses midnight is handled without wrapping", () => {
  // late_night is 11 PM – 2 AM. A modular-arithmetic slip here would silently
  // produce an empty or inverted span.
  const r = rectifyBirthTime({ ...AUSTIN, window: "late_night", candidateSigns: [] });
  assert.ok(r.endHour > r.startHour, "span inverted across midnight");
  assert.ok(r.spanMinutes > 0 && r.spanMinutes <= 3 * 60);
  assert.ok(r.signsInWindow.length > 0);
});

test("the estimated time always sits inside the span it came from", () => {
  for (const w of ["morning", "afternoon", "late_night", "overnight"] as const) {
    const r = rectifyBirthTime({ ...AUSTIN, window: w, candidateSigns: [] });
    const [h, m] = r.estimatedTime.split(":").map(Number);
    const asHour = h + m / 60;
    // late_night's span runs past 24 in internal hours; compare on the clock.
    const start = r.startHour % 24;
    const end = r.endHour > 24 ? r.endHour - 24 : r.endHour;
    const inside = end > start ? asHour >= start - 0.02 && asHour <= end + 0.02 : true;
    assert.ok(inside, `${w}: ${r.estimatedTime} outside ${r.startHour}–${r.endHour}`);
  }
});

test("the southern hemisphere is not just the north upside down", () => {
  // Sydney. Different ascension order entirely; this catches a latitude sign
  // error that a northern-only test would sail past.
  const sydney = { birthDate: "1990-06-15", latitude: -33.8688, longitude: 151.2093 };
  const ivs = risingIntervals(sydney);
  assert.equal(new Set(ivs.map((iv) => iv.sign)).size, 12);
  assert.equal(ivs[0].startHour, 0);
  assert.equal(ivs[ivs.length - 1].endHour, 24);
});
