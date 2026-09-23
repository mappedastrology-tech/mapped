import test from "node:test";
import assert from "node:assert/strict";

import { weakTopicIds, WEAK_THRESHOLD, WEAK_WINDOW } from "../src/lib/learn/weakTopics";

/**
 * The "weak spots" count on the Library home. Nothing in the app derived this
 * before — quiz attempts were written and only ever read back as a per-course
 * best score — so the rule is new and worth pinning down.
 */

const DOMAIN_OF: Record<string, string> = {
  "astro-101": "astrology",
  "astro-201": "astrology",
  "tarot-101": "tarot",
  "herbs-101": "herbalism",
};
const domainOf = (courseId: string) => DOMAIN_OF[courseId] ?? null;

/** Attempts newest-last, with spaced timestamps. */
function attempts(...rows: Array<[string, number]>) {
  return rows.map(([courseId, score], i) => ({
    courseId,
    score,
    createdAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
  }));
}

test("a topic scoring below the threshold is weak", () => {
  const weak = weakTopicIds(attempts(["astro-101", 0.4], ["astro-101", 0.5]), domainOf);
  assert.deepEqual(weak, ["astrology"]);
});

test("a topic scoring above the threshold is not", () => {
  const weak = weakTopicIds(attempts(["astro-101", 0.9], ["astro-101", 0.8]), domainOf);
  assert.deepEqual(weak, []);
});

test("the threshold is exclusive, so exactly 70% is not a weak spot", () => {
  // Someone sitting exactly on the pass mark should not be told they are
  // failing — the rule is "below 70%".
  const weak = weakTopicIds(attempts(["astro-101", WEAK_THRESHOLD]), domainOf);
  assert.deepEqual(weak, []);
});

test("courses roll up into their topic", () => {
  // A domain usually holds several courses, and the block counts TOPICS. Two
  // mediocre courses in one domain are one weak spot, not two.
  const weak = weakTopicIds(attempts(["astro-101", 0.3], ["astro-201", 0.4]), domainOf);
  assert.deepEqual(weak, ["astrology"]);
});

test("only the most recent attempts count, so improvement clears the flag", () => {
  // Five bad attempts followed by five good ones: the window has moved past
  // the bad run entirely. Without this, an early struggle would keep a topic
  // flagged long after it had been learned.
  const early: Array<[string, number]> = Array.from({ length: WEAK_WINDOW }, () => ["astro-101", 0.2]);
  const later: Array<[string, number]> = Array.from({ length: WEAK_WINDOW }, () => ["astro-101", 0.95]);
  const weak = weakTopicIds(attempts(...early, ...later), domainOf);
  assert.deepEqual(weak, [], "an old bad run should not still count against them");
});

test("a recent slump is caught even after a strong start", () => {
  const early: Array<[string, number]> = Array.from({ length: WEAK_WINDOW }, () => ["tarot-101", 1]);
  const later: Array<[string, number]> = Array.from({ length: WEAK_WINDOW }, () => ["tarot-101", 0.3]);
  assert.deepEqual(weakTopicIds(attempts(...early, ...later), domainOf), ["tarot"]);
});

test("ordering is decided here, not by the caller's query", () => {
  // The same attempts shuffled must give the same answer, or the count would
  // depend on however the rows happened to come back.
  const rows = attempts(["tarot-101", 0.1], ["tarot-101", 0.1], ["tarot-101", 0.1],
                        ["tarot-101", 0.1], ["tarot-101", 0.1], ["tarot-101", 1]);
  const forwards = weakTopicIds(rows, domainOf);
  const backwards = weakTopicIds([...rows].reverse(), domainOf);
  assert.deepEqual(forwards, backwards);
});

test("attempts from a retired course are ignored, not counted as a topic", () => {
  // getCourse() returns undefined for content that has been removed. Treating
  // that as its own topic would put a nameless entry in the count.
  const weak = weakTopicIds(attempts(["gone-101", 0.1], ["astro-101", 0.9]), domainOf);
  assert.deepEqual(weak, []);
});

test("unusable scores are skipped rather than poisoning the mean", () => {
  const rows = [
    { courseId: "herbs-101", score: Number.NaN, createdAt: "2026-01-01T00:00:00.000Z" },
    { courseId: "herbs-101", score: 0.9, createdAt: "2026-01-02T00:00:00.000Z" },
  ];
  assert.deepEqual(weakTopicIds(rows, domainOf), []);
});

test("no attempts means no weak spots, not every topic", () => {
  assert.deepEqual(weakTopicIds([], domainOf), []);
});

test("several weak topics are returned in a stable order", () => {
  const weak = weakTopicIds(
    attempts(["tarot-101", 0.2], ["astro-101", 0.2], ["herbs-101", 0.2]),
    domainOf,
  );
  assert.deepEqual(weak, ["astrology", "herbalism", "tarot"]);
});
