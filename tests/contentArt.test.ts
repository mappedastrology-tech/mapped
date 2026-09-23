import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { ALL_COURSES, DOMAINS, courseLessons } from "../src/lib/learn/registry";
import type { LessonBlock } from "../src/lib/learn/types";

/**
 * Every picture the library points at has to actually be there.
 *
 * A missing image does not throw — it renders as a broken frame or, worse,
 * silently nothing — so there is no way to find out except by opening each
 * lesson. This walks the shipped content instead, which takes milliseconds and
 * covers screens nobody has looked at in months.
 *
 * It also stands in for a browser check of the tarot flip block: that exercise
 * is only reachable after answering a lesson's whole quiz, so asserting the
 * block exists and that all six cards and the back resolve is the practical
 * way to know it is wired up.
 */

const PUBLIC = join(process.cwd(), "public");

/** Every image path a block refers to, whatever kind it is. */
function imagesIn(block: LessonBlock): string[] {
  const out: string[] = [];
  const b = block as unknown as Record<string, unknown>;

  if (typeof b.image === "string") out.push(b.image);
  if (typeof b.back === "string") out.push(b.back);

  for (const key of ["cards", "items", "pairs"]) {
    const list = b[key];
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      if (entry && typeof entry === "object") {
        const img = (entry as Record<string, unknown>).img;
        const cover = (entry as Record<string, unknown>).image;
        if (typeof img === "string") out.push(img);
        if (typeof cover === "string") out.push(cover);
      }
    }
  }
  return out;
}

test("every image referenced by a lesson exists in /public", () => {
  const missing: string[] = [];
  let checked = 0;

  for (const course of ALL_COURSES) {
    for (const lesson of courseLessons(course)) {
      for (const block of lesson.blocks) {
        for (const src of imagesIn(block)) {
          checked++;
          // Only local assets; anything remote is out of scope here.
          if (!src.startsWith("/")) continue;
          if (!existsSync(join(PUBLIC, src))) missing.push(`${course.id}/${lesson.id}: ${src}`);
        }
      }
    }
  }

  assert.ok(checked > 0, "walked no images at all — the walker is broken, not the content");
  assert.deepEqual(missing, [], `missing art:\n${missing.join("\n")}`);
});

test("every domain's cover art exists", () => {
  // This is what shipped a butterfly on Almanac & Moon: the path was valid, so
  // only a human could catch that one — but a path that has gone missing is
  // catchable, and the tiles are the first thing anyone sees.
  const missing = DOMAINS
    .filter((d) => d.cover && d.cover.startsWith("/") && !existsSync(join(PUBLIC, d.cover)))
    .map((d) => `${d.id}: ${d.cover}`);
  assert.deepEqual(missing, []);
});

test("the tarot lesson teaches the Majors with a flip exercise", () => {
  // The component existed for a while with no lesson using it, so it was dead
  // code that could rot unnoticed. This pins the wiring.
  const tarot = ALL_COURSES.find((c) => c.id === "tarot-foundations");
  assert.ok(tarot, "tarot-foundations is missing");

  const lesson = courseLessons(tarot).find((l) => l.id === "l4-major-arcana");
  assert.ok(lesson, "the Major Arcana lesson is missing");

  const flip = lesson.blocks.find((b) => b.kind === "flip");
  assert.ok(flip, "the Major Arcana lesson has no flip exercise");
  assert.equal(flip.cards.length, 6, "the design's frame turns six Majors");
  assert.ok(flip.back, "the flip block should use the deck's real card back");
});
