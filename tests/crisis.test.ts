import test from "node:test";
import assert from "node:assert/strict";

import { detectCrisis, CRISIS_RESOURCES, CRISIS_MESSAGE, crisisAnnouncement } from "../src/lib/crisis";

/**
 * The detector exists because every other path can refuse first.
 *
 * A miss here means someone at risk gets "You've reached the daily limit for
 * Dolly conversations" or an upgrade prompt. A false positive means someone
 * asking about their chart gets a hotline they didn't need. Both are tested,
 * because a matcher that fires on everything gets ignored, and an ignored
 * crisis line helps nobody.
 */

test("plain statements of suicidal intent are caught", () => {
  const messages = [
    "I want to die",
    "i want to kill myself",
    "I've been thinking about ending my life",
    "I don't want to be here anymore",
    "there's no reason to live",
    "everyone would be better off without me",
    "I can't keep going",
    "I think I'm suicidal",
  ];
  for (const m of messages) assert.equal(detectCrisis(m), true, `missed: ${m}`);
});

test("self-harm is caught", () => {
  for (const m of ["I've been cutting myself again", "i want to hurt myself", "thinking about self-harm"]) {
    assert.equal(detectCrisis(m), true, `missed: ${m}`);
  }
});

test("someone else causing harm is caught", () => {
  for (const m of ["my partner hits me", "he won't let me leave", "I'm scared to go home"]) {
    assert.equal(detectCrisis(m), true, `missed: ${m}`);
  }
});

test("phones produce curly apostrophes, and they must still match", () => {
  // "don’t" is what an iPhone types. Matching only the straight apostrophe
  // would miss most real messages on the platform this ships to.
  assert.equal(detectCrisis("I don’t want to be here anymore"), true);
  assert.equal(detectCrisis("I can’t go on"), true);
});

test("punctuation and shouting don't hide it", () => {
  assert.equal(detectCrisis("I WANT TO DIE!!!"), true);
  assert.equal(detectCrisis("...i want to die."), true);
  assert.equal(detectCrisis("i   want   to   die"), true);
});

test("ordinary astrology talk does NOT trip it", () => {
  // This is the app's own subject matter. Death, endings, rebirth and Pluto
  // are its everyday vocabulary — a detector that fires on them would be
  // unusable and would train people to ignore it.
  const messages = [
    "What does my 8th house of death and rebirth mean?",
    "Tell me about my Pluto placement",
    "My Scorpio placements are killing me",
    "I'm dying to know what my Saturn return holds",
    "That transit was a killer",
    "This chart reading is to die for",
    "My feet are killing me after that walk, what does the sky say about rest?",
    "Is my Mars in the 12th house about hidden anger?",
    "What's the death of my old self look like in this chapter?",
  ];
  for (const m of messages) assert.equal(detectCrisis(m), false, `false positive: ${m}`);
});

test("empty and non-string input is not a crisis", () => {
  for (const junk of ["", "   ", undefined, null, 42, {}, []]) {
    assert.equal(detectCrisis(junk), false);
  }
});

test("the response never explains it through astrology", () => {
  // The model is told never to reframe this through a chart. The offline copy
  // has to hold the same line, since it is what shows when the model is never
  // reached. Naming astrology to rule it out is the point, so what's banned is
  // the machinery of a reading, not the word itself.
  assert.doesNotMatch(CRISIS_MESSAGE, /\b(chart|transit|placement|planet|house|moon|saturn|pluto|retrograde)\b/i);
  assert.match(CRISIS_MESSAGE, /isn't something to work through with astrology/i);
});

test("the response does not claim to be a person or a service", () => {
  assert.match(CRISIS_MESSAGE, /not a person/i);
});

test("every resource says which country it covers", () => {
  // A US number presented as universal is its own failure — someone in
  // Manchester dialling 988 gets nothing.
  for (const r of CRISIS_RESOURCES) {
    assert.match(`${r.detail}`, /US|country|international/i, `no locality on: ${r.label}`);
  }
  assert.ok(
    CRISIS_RESOURCES.some((r) => /findahelpline/i.test(r.href ?? "")),
    "there should be a route for people outside the US",
  );
});

test("the announcement carries the resources, not just the message", () => {
  // A screen reader cannot see the card's links, so the live region has to
  // say the numbers out loud.
  const said = crisisAnnouncement();
  for (const r of CRISIS_RESOURCES) assert.ok(said.includes(r.label), `missing from announcement: ${r.label}`);
  assert.ok(said.includes("988"));
});
