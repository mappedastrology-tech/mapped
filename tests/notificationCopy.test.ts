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
import { COPY, renderCopy, copyFor, variantsFor, MAX_TITLE, MAX_BODY, shortPoint } from "../src/lib/notifications/copy";

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
  // The solar and lunar lines must stay different: practitioners advise against
  // initiating under a solar eclipse, which is the opposite of the lunar read.
  assert.notEqual(copyFor("eclipses", "solar").body, copyFor("eclipses", "lunar").body);
  // Pin the distinction, not the wording: solar holds you off, lunar names an
  // ending, and neither may borrow the new moon's "start something" language.
  const solar = copyFor("eclipses", "solar").body;
  const lunar = copyFor("eclipses", "lunar").body;
  assert.doesNotMatch(solar, /\bstart\b/i, `solar eclipse copy reads like a new moon: "${solar}"`);
  assert.match(solar, /\b(two days|doesn't|hold|sit)\b/i, solar);
  assert.match(lunar, /\bend(s|ed|ing)\b/i, lunar);
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

/* ─── Voice ─── */

test("nothing hedges", () => {
  // The first draft cushioned almost every line — "if you want one", "worth
  // knowing", "a good night to", "no pressure". Stacked up those don't read as
  // gentle, they read as timid. Say the thing; they can decide what to do with it.
  const hedges = [
    /\bif you want\b/i, /\bworth (knowing|thinking|a look)\b/i, /\bno pressure\b/i,
    /\ba good (night|day|time) to\b/i, /\bmight want to\b/i, /\byou (could|may want)\b/i,
    /\bconsider\b/i, /\bwhenever you want\b/i, /\bperhaps\b/i, /\bfeel free to\b/i,
  ];
  const found: string[] = [];
  for (const t of COPY) {
    for (const h of hedges) {
      if (h.test(t.body) || h.test(t.title)) found.push(`${t.category}/${t.variant}: "${t.body}"`);
    }
  }
  assert.deepEqual([...new Set(found)], []);
});

test("nothing reads like a manual", () => {
  // "Not a day for starting things. Wait 48 hours, then decide." A friend still
  // tells you to sit tight — the difference is whether she sounds like she is
  // reading it off a card.
  const procedural = [
    /\bwait \d+ hours?\b/i, /\bstep \d\b/i, /\bfirst,.*then\b/i,
    /\bread it as\b/i, /\bin order to\b/i, /\bit is (recommended|advised)\b/i,
    /\bbe sure to\b/i, /\bmake sure (you|to)\b/i,
  ];
  const found: string[] = [];
  for (const t of COPY) {
    for (const p of procedural) {
      if (p.test(t.body) || p.test(t.title)) found.push(`${t.category}/${t.variant}: "${t.body}"`);
    }
  }
  assert.deepEqual([...new Set(found)], []);
});

test("no first-person plural", () => {
  // Apple's style guidance says avoid "we", and the largest headline dataset
  // found first-person plural was the one pronoun with a significant negative
  // effect. Two independent sources, same direction.
  const found = COPY
    .filter((t) => /\b(we|we're|we'll|our|us)\b/i.test(`${t.title} ${t.body}`))
    .map((t) => `${t.category}/${t.variant}: "${t.body}"`);
  assert.deepEqual(found, []);
});

test("the journal question stays behind the tap", () => {
  // Apple: you cannot predict what someone is doing when a notification lands.
  // The prompts are good because they are intimate, which is what makes them
  // wrong for a screen a stranger can read over a shoulder.
  for (const t of variantsFor("journal_checkin")) {
    assert.doesNotMatch(t.body, /\?/, `${t.variant} puts a question on the lock screen: "${t.body}"`);
  }
});
