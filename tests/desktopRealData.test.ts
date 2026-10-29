/**
 * The desktop web screens show the signed-in person's own data — never the
 * design prototype's sample values.
 *
 * The beta sweep found desktop Today showing a fake chart ("Sun Cancer · Moon
 * Pisces · Leo rising", "Transiting Mars … 10th house"), "Personal Day 7",
 * "tonight's Scorpio Moon" and a "7-DAY STREAK"; desktop Journal showing three
 * invented entries and a hardcoded streak; desktop Almanac falling back to
 * "Born on July 1" and fixed "Explore the day" cards; and the landing page
 * printing "Waxing Gibbous · 73% · Moon in Scorpio" every night of the year.
 *
 * The components cannot be rendered under node, so these checks are
 * structural: the specific sample strings must not come back into the source,
 * and the pure helpers the screens now share must behave.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { journalStreak, entryDate } from "../src/lib/journalStreak";
import { dayPart, greetingFor, firstNameOf, EVENING_STARTS_AT } from "../src/lib/greeting";
import { computeNumerology } from "../src/lib/numerology";
import { MOON_SIGN_THEMES, moonSignTheme } from "../src/components/web/moonSignThemes";
import { signedOutHref, safeNext } from "../src/lib/returnPath";

const read = (p: string) => readFileSync(p, "utf8");
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
const code = (p: string) => stripComments(read(p));

const WEB = "src/components/web";

// Sample strings from the design prototype, per screen. Any of these in the
// source means a signed-in person can see them again.
const SAMPLES: Record<string, string[]> = {
  [`${WEB}/WebToday.tsx`]: [
    "Sun Cancer", "Moon Pisces", "Leo rising", "Cancer 10°", "Pisces 24°", "Leo 2°",
    "10th house", "Personal Day 7", "7-day streak", "Scorpio Moon", "Waxing Gibbous · 73%",
    "Sunrise 5:58", "2:32 pm", "major-17",
  ],
  [`${WEB}/WebJournal.tsx`]: [
    "SEED", "const streak = 7", "Scorpio Moon", "The Star, reversed", "kettle going",
  ],
  [`${WEB}/WebAlmanac.tsx`]: [
    "Born on July 1", "Princess Diana", "Debbie Harry", "8/10", "Antares", "Scorpio Moon",
    "Waxing Gibbous · 73%", "July 1, 2026", "2:32 pm", "Mars trine Jupiter", "Full Moon in Capricorn",
  ],
  [`${WEB}/WebLanding.tsx`]: ["Waxing Gibbous · 73%", "Moon in Scorpio —"],
  [`${WEB}/WebShell.tsx`]: ["waxing gibbous moon"],
};

for (const [file, samples] of Object.entries(SAMPLES)) {
  test(`${file.split("/").pop()} carries no prototype sample data`, () => {
    const src = code(file);
    for (const s of samples) {
      assert.ok(!src.includes(s), `${file} still contains the sample "${s}"`);
    }
  });
}

test("signed-in desktop pages don't offer the sign-up card", () => {
  // Journal and Almanac only render inside the signed-in (tabs) layout.
  for (const f of [`${WEB}/WebJournal.tsx`, `${WEB}/WebAlmanac.tsx`]) {
    assert.ok(!code(f).includes("Start free"), `${f} still shows "Start free" to a signed-in person`);
  }
});

test("desktop Today reads the saved chart, not just sessionStorage", () => {
  const hook = code(`${WEB}/useSavedChart.ts`);
  assert.ok(hook.includes('.from("charts")'), "useSavedChart must read the charts table");
  assert.ok(hook.indexOf('.from("charts")') < hook.indexOf("sessionStorage"), "the saved chart must win over the tab's cache");
  assert.ok(code(`${WEB}/WebToday.tsx`).includes("useSavedChart"));
});

test("useLiveSky's moon theme is about the Moon's sign, not the Sun season", () => {
  const src = code(`${WEB}/useLiveSky.ts`);
  assert.ok(!/moonSignTheme:\s*s\.sunSignTheme/.test(src));
  assert.equal(Object.keys(MOON_SIGN_THEMES).length, 12);
  assert.match(moonSignTheme("Aries"), /Aries/);
});

test("journal streak counts consecutive days ending today or yesterday", () => {
  const now = new Date(2026, 9, 28, 9, 0);
  const d = (day: number, h = 20) => new Date(2026, 9, day, h, 0);
  assert.equal(journalStreak([], now), 0);
  assert.equal(journalStreak([d(28, 8), d(27), d(26)], now), 3);
  // Nothing yet today — yesterday's run still counts.
  assert.equal(journalStreak([d(27), d(26), d(24)], now), 2);
  // Two entries on one day are one day.
  assert.equal(journalStreak([d(28, 7), d(28, 8)], now), 1);
  // A gap of two days breaks it.
  assert.equal(journalStreak([d(25), d(24)], now), 0);
  // Unparseable dates are ignored, not counted.
  assert.equal(journalStreak([new Date(NaN), d(28, 8)], now), 1);
  assert.equal(entryDate({ date: "2026-10-28", created_at: null }).getUTCDate(), 28);
});

test("one greeting, evening from 17:00", () => {
  assert.equal(EVENING_STARTS_AT, 17);
  assert.equal(dayPart(new Date(2026, 0, 1, 11, 59)), "morning");
  assert.equal(dayPart(new Date(2026, 0, 1, 16, 59)), "afternoon");
  assert.equal(dayPart(new Date(2026, 0, 1, 17, 0)), "evening");
  assert.equal(greetingFor(new Date(2026, 0, 1, 17, 30)), "Good evening");
  assert.equal(firstNameOf("  Ada  Lovelace "), "Ada");
  assert.equal(firstNameOf(""), null);
  assert.equal(firstNameOf(null), null);
});

test("no screen keeps its own evening cutoff", () => {
  for (const f of [
    "src/app/(tabs)/home/page.tsx",
    "src/app/(tabs)/learn/RitualPageContent.tsx",
    "src/app/(tabs)/dolly/page.tsx",
    `${WEB}/WebToday.tsx`,
  ]) {
    assert.ok(!/<\s*1[78]\s*\?/.test(code(f)), `${f} has its own hour cutoff`);
  }
});

test("signed-out links go to /welcome with a safe return path", () => {
  assert.equal(signedOutHref("/almanac"), "/welcome?next=%2Falmanac");
  assert.equal(signedOutHref("/library"), "/library");
  assert.equal(signedOutHref("/library/astrology-foundations"), "/library/astrology-foundations");
  assert.equal(signedOutHref("/#features"), "/#features");
  assert.equal(signedOutHref("/welcome?mode=signin"), "/welcome?mode=signin");
  assert.equal(signedOutHref("mailto:a@b.c"), "mailto:a@b.c");
  assert.equal(safeNext("/almanac"), "/almanac");
  assert.equal(safeNext("//evil.example"), "/home");
  assert.equal(safeNext("https://evil.example"), "/home");
  assert.equal(safeNext(null), "/home");
  // The footer "Log in" is sign-in, not sign-up.
  assert.ok(code(`${WEB}/WebShell.tsx`).includes('{ label: "Log in", href: "/welcome?mode=signin" }'));
});

test("personal day works from a birth date alone (no name needed)", () => {
  // 1990-08-05 on 2026-10-28: personal year 5, month 6, day 7.
  const now = new Date(2026, 9, 28);
  assert.equal(computeNumerology("", "1990-08-05", { now })?.personalDay, 7);
  assert.equal(computeNumerology("Ada Lovelace", "1990-08-05", { now })?.personalDay, 7);
});
