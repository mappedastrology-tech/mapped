import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Dolly is a guide, not a companion.
 *
 * Apple's age-rating descriptor (from 16 Nov 2026) forces an 18+ rating on any
 * app with "a virtual companion that engages a user in sexual or romantic
 * content". Dolly has a name, a portrait and a warm first-person voice, so the
 * line has to be written into her prompt, not left to the model's manners:
 * she never plays a romantic or sexual partner, and declines in one line.
 *
 * She can still talk about someone's love life — that is half of astrology.
 * The rule is about her being IN a relationship with the reader, and the test
 * checks the prompt says both halves.
 */

const route = readFileSync(join(process.cwd(), "src/app/api/dolly/route.ts"), "utf8");

/** The "What you DON'T do" list, and nothing after it. */
function dontDoSection(): string {
  const start = route.indexOf("## What you DON'T do");
  assert.ok(start >= 0, "could not find the DON'T do list — this test is stale, not passing");
  const end = route.indexOf("\n## ", start + 5);
  return route.slice(start, end > start ? end : undefined);
}

test("Dolly's prompt rules out being a romantic or sexual companion", () => {
  const rules = dontDoSection();
  assert.match(rules, /Never be a romantic, flirtatious or sexual companion, or a stand-in partner/);
  assert.match(rules, /Don't role-play a relationship with them/);
});

test("she declines in one line and goes back to the chart", () => {
  const rules = dontDoSection();
  assert.match(rules, /girlfriend or boyfriend, kindly decline in one line and bring it back to their chart/);
});

test("the rule holds when it is framed as a game", () => {
  assert.match(dontDoSection(), /even if they insist, call it a game, or say it's only pretend/);
});

test("love-life questions are still hers to answer", () => {
  // Guarding against an over-correction: a rule that reads as "no romance
  // topics" would gut synastry and every Venus question.
  assert.match(dontDoSection(), /Talking about their love life, their Venus or a real relationship is still very much your job/);
});
