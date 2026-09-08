/**
 * The Library art brief promises a filename for each plate, and those
 * filenames ARE the reference-entry ids — that is what lets a delivered folder
 * drop straight into the app with no renaming.
 *
 * Every art batch so far has landed cleanly because the names were checked
 * before anyone drew anything; the one batch that wasn't checked cost seven
 * regenerations. This pins the brief to the code so a renamed entry, or a typo
 * in the brief, is caught here rather than after 100 images exist.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ALL_REFERENCE } from "../src/lib/learn/reference/index";

const BRIEF = "Mapped_Art_Brief_Library.md";

/** Filenames the brief names, minus the domain covers (which aren't entries). */
function promisedEntryPlates(): string[] {
  const md = readFileSync(BRIEF, "utf8");
  const named = [...md.matchAll(/`([a-z0-9][a-z0-9-]*)\.png`/g)].map((m) => m[1]);
  return [...new Set(named)].filter((n) => !n.startsWith("cover-"));
}

test("every plate the brief names is a real reference-entry id", () => {
  const ids = new Set(ALL_REFERENCE.map((e) => e.id));
  const orphans = promisedEntryPlates().filter((n) => !ids.has(n));
  assert.deepEqual(orphans, [], `\nThese filenames match no entry id:\n  ${orphans.join("\n  ")}\n`);
});

test("the brief covers every member of the closed sets it claims to complete", () => {
  // Sets the brief says it finishes. A new rune or aspect added to the app
  // should fail here, because the brief would then be silently incomplete.
  const closed: Record<string, RegExp> = {
    runes: /^rune-/,
    planets: /^planet-/,
    houses: /^house-/,
    aspects: /^aspect-/,
  };
  const promised = new Set(promisedEntryPlates());
  const gaps: string[] = [];
  for (const [label, re] of Object.entries(closed)) {
    for (const e of ALL_REFERENCE) {
      if (re.test(e.id) && !promised.has(e.id)) gaps.push(`${label}: ${e.id}`);
    }
  }
  assert.deepEqual(gaps, [], `\nClosed sets missing from the brief:\n  ${gaps.join("\n  ")}\n`);
});

test("the brief's headline entry count matches the code", () => {
  const md = readFileSync(BRIEF, "utf8");
  const m = /\*\*(\d{3,4})\*\* \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \|/.exec(md);
  assert.ok(m, "no total row found in the brief's domain table");
  const [, total, withArt, needs] = m.map(Number);
  const actualTotal = ALL_REFERENCE.length;
  const actualWith = ALL_REFERENCE.filter((e) => e.image).length;
  assert.equal(total, actualTotal, `brief says ${total} entries, code has ${actualTotal}`);
  assert.equal(withArt, actualWith, `brief says ${withArt} with art, code has ${actualWith}`);
  assert.equal(needs, actualTotal - actualWith, "brief's needs-art column doesn't add up");
});

/**
 * The flat list handed to whoever actually draws the plates. Same contract as
 * the brief — the filenames are entry ids — but it also names files that are
 * deliberately NOT entries (domain covers, lesson backdrops, element emblems),
 * so those prefixes are excluded rather than the whole file being untested.
 */
const LIST = "Mapped_Learn_Image_List.md";
const NON_ENTRY = /^(cover|explore|element)-/;

function listedPlates(): string[] {
  const md = readFileSync(LIST, "utf8");
  const named = [...md.matchAll(/`([a-z0-9][a-z0-9-]*)\.png`/g)].map((m) => m[1]);
  return [...new Set(named)];
}

test("every entry plate the image list names is a real entry id", () => {
  const ids = new Set(ALL_REFERENCE.map((e) => e.id));
  const orphans = listedPlates().filter((n) => !NON_ENTRY.test(n) && !ids.has(n));
  assert.deepEqual(orphans, [], `\nListed filenames matching no entry id:\n  ${orphans.join("\n  ")}\n`);
});

test("the image list finishes the closed sets it claims to finish", () => {
  const listed = new Set(listedPlates());
  const gaps: string[] = [];
  for (const re of [/^rune-/, /^planet-/, /^house-/, /^aspect-/]) {
    for (const e of ALL_REFERENCE) {
      if (re.test(e.id) && !listed.has(e.id)) gaps.push(e.id);
    }
  }
  assert.deepEqual(gaps, [], `\nClosed sets missing from the image list:\n  ${gaps.join("\n  ")}\n`);
});

test("the image list's headline counts match the code", () => {
  const md = readFileSync(LIST, "utf8");
  const m = /\*\*(\d{3,4})\s+reference entries,\s+(\d+)\s+with art/.exec(md);
  assert.ok(m, "no headline count sentence found in the image list");
  assert.equal(Number(m[1]), ALL_REFERENCE.length);
  assert.equal(Number(m[2]), ALL_REFERENCE.filter((e) => e.image).length);
});

test("the image list's file total matches the number of files it actually names", () => {
  const md = readFileSync(LIST, "utf8");
  const m = /\*\*(\d+) files\.\*\*/.exec(md);
  assert.ok(m, "no headline file total found in the image list");
  // Rows are numbered 1..N across the batches; the last number is the total.
  // The rune table runs two numbered columns per row, so match anywhere in the line.
  const numbered = [...md.matchAll(/\| (\d+) \| `[a-z0-9-]+\.png`/g)].map((x) => Number(x[1]));
  assert.equal(numbered.length, Number(m[1]), "numbered rows don't match the stated total");
  // The rune table numbers down two columns, so document order is not 1..N.
  const sorted = [...numbered].sort((a, b) => a - b);
  assert.deepEqual(sorted, sorted.map((_, i) => i + 1), "row numbering has a gap or repeat");
});
