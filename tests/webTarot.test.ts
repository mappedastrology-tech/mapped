import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_CARDS, getCardImagePath } from "../src/lib/tarot";

/**
 * Desktop tarot draws from the same 78-card deck as mobile.
 *
 * WebTarot used to carry its own 22-card list, so every desktop pull was a
 * major arcana ("on desktop every card I pull in tarot is a major arcana").
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

test("the desktop classic deck is built from ALL_CARDS, not a local list", () => {
  const src = strip(read("src/components/web/WebTarot.tsx"));
  assert.match(src, /CLASSIC_CARDS: UCard\[\] = ALL_CARDS\.map/);
  assert.doesNotMatch(src, /major-\$\{/, "a majors-only image path is back");
});

test("ALL_CARDS is the full deck, and every card has its image", () => {
  assert.equal(ALL_CARDS.length, 78);
  assert.equal(ALL_CARDS.filter((c) => c.arcana === "minor").length, 56);
  for (const c of ALL_CARDS) {
    const img = getCardImagePath(c.id);
    assert.ok(img && existsSync(join(process.cwd(), "public", img)), `no image for ${c.id}`);
    assert.ok(c.uprightKeywords[0] && c.uprightMeaning, `${c.id} is missing copy`);
  }
});
