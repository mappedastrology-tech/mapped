/**
 * The copy rules, enforced.
 *
 * Writing "title under 30 characters, no emoji" in a comment does nothing —
 * the previous library had its rules in a docstring and a line 124 characters
 * long three entries below it. These check the rendered output against the
 * longest real substitutions, because a template that fits and a notification
 * that fits are different things.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { COPY, renderCopy, copyFor, MAX_TITLE, MAX_BODY, shortPoint } from "../src/lib/notifications/copy";

/** The longest value each slot can actually take in this app. */
const WORST: Record<string, string> = {
  sign: "Sagittarius",
  name: "Strawberry",          // longest traditional full-moon name
  planet: "Mercury",           // ties Jupiter and Neptune at 7
  natal: "Mercury",
  house: "12th",
  axis: "Gemini/Sagittarius",
  month: "September",
  year: "2008",
  years: "20",
  time: "11:47 PM",
  days: "7",
  n: "365",
  occasion: "full moons",
  prompt: "What did you build that you are now being asked to defend?",
  title: "Mercury opposes your MC",   // the longest transit title, reused by the journal check-in
  count: "three",
  flavour: "Conversations land differently today. Worth saying the thing.",
};

test("every title fits, with the longest values it can ever hold", () => {
  const over: string[] = [];
  for (const t of COPY) {
    const { title } = renderCopy(t, WORST);
    if (title.length > MAX_TITLE) over.push(`${title.length}  ${t.category}/${t.variant}: "${title}"`);
  }
  assert.deepEqual(over, [], `\nTitles over ${MAX_TITLE} characters:\n  ${over.join("\n  ")}\n`);
});

test("every body fits, with the longest values it can ever hold", () => {
  const over: string[] = [];
  for (const t of COPY) {
    const { body } = renderCopy(t, WORST);
    if (body.length > MAX_BODY) over.push(`${body.length}  ${t.category}/${t.variant}: "${body}"`);
  }
  assert.deepEqual(over, [], `\nBodies over ${MAX_BODY} characters:\n  ${over.join("\n  ")}\n`);
});

test("no emoji anywhere", () => {
  // The largest available study found emoji lift is negative in this category.
  const emoji = /\p{Extended_Pictographic}/u;
  const found = COPY.filter((t) => emoji.test(t.title) || emoji.test(t.body))
    .map((t) => `${t.category}/${t.variant}`);
  assert.deepEqual(found, []);
});

test("no urgency pressure and no doom", () => {
  // People delete astrology apps over exactly this, and the words that test
  // well in retail would poison a daily ritual.
  const banned = /\b(hurry|don't miss|last chance|act now|urgent|dying|death|illness|disaster|doomed)\b/i;
  const found = COPY.filter((t) => banned.test(t.title) || banned.test(t.body))
    .map((t) => `${t.category}/${t.variant}`);
  assert.deepEqual(found, []);
});

test("the specific thing is in the title, not a category label", () => {
  const labels = new Set(["Mapped", "Full Moon", "New Moon", "Your chart today", "Moon Practice"]);
  const lazy = COPY.filter((t) => labels.has(t.title)).map((t) => `${t.category}/${t.variant}`);
  assert.deepEqual(lazy, []);
});

test("an unfilled slot throws instead of sending a hole", () => {
  assert.throws(
    () => renderCopy(copyFor("full_moon", "named"), { sign: "Aries" }),   // [name] missing
    /has no value for \[name\]/,
  );
});

test("variants are addressable by name, so nothing is chosen at random", () => {
  // The old library used pickRandom, which is how someone got "tonight" copy
  // on the wrong night.
  assert.equal(copyFor("eclipses", "solar").body.includes("Not a day for starting"), true);
  assert.equal(copyFor("eclipses", "lunar").body.includes("release"), true);
  assert.throws(() => copyFor("eclipses", "nonsense"), /no notification copy/);
});

test("the angles are written the way an astrologer says them", () => {
  assert.equal(shortPoint("Midheaven"), "MC");
  assert.equal(shortPoint("Ascendant"), "Rising");
  assert.equal(shortPoint("Saturn"), "Saturn");
  // and the short form is what keeps the longest transit title inside the cap
  const { title } = renderCopy(copyFor("major_transits", "opposition"),
    { planet: "Mercury", natal: shortPoint("Midheaven") });
  assert.ok(title.length <= MAX_TITLE, title);
});
