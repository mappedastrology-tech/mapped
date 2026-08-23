/**
 * A JSX string attribute does NOT process escape sequences.
 *
 *   glyph="✶"    renders the six characters  \ u 2 7 3 6
 *   glyph={"✶"}  renders  ✶
 *
 * Four of these shipped on the profile page and stayed invisible because every
 * card that used one also had art covering it. The Chinese zodiac card, whose
 * art is still being drawn, put "六" on screen for anyone born in a Rabbit,
 * Goat or Pig year. Cheap to catch, so catch it.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

test("no unicode escape sits in a JSX string attribute", () => {
  const attr = /(\w+)="((?:[^"\\]|\\.)*\\u[0-9A-Fa-f]{4}(?:[^"\\]|\\.)*)"/g;
  const offenders: string[] = [];

  for (const file of walk("src")) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      for (const m of line.matchAll(attr)) {
        // Only a real JSX attribute — the pattern also matches plain object
        // literals and ordinary strings, where the escape works fine.
        if (line.slice(0, m.index).includes("<")) {
          offenders.push(`${file}:${i + 1}  ${m[1]}="${m[2]}"  → use ${m[1]}={"${m[2]}"}`);
        }
      }
    });
  }

  assert.deepEqual(offenders, [], `\n${offenders.join("\n")}\n`);
});
