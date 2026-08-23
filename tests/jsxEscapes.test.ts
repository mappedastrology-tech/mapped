/**
 * JSX does NOT process escape sequences — not in a string attribute, and not in
 * the text between tags.
 *
 *   glyph="✶"                renders the six characters  \ u 2 7 3 6
 *   glyph={"✶"}              renders  ✶
 *   <span>Read more →</span>    renders  Read more \u2192
 *   <span>Read more {"→"}</span>  renders  Read more →
 *
 * The attribute form shipped on four profile cards and stayed invisible because
 * each also had art covering the glyph. The FIRST version of this test only
 * checked attributes, so it passed while "Read more \u2192" sat at the bottom
 * of every read card in the app. Both shapes are checked now.
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

test("no unicode escape sits in JSX text between tags", () => {
  // Text directly between > and <, with no braces — i.e. literal JSX children.
  const between = />([^<>{}]*\\u[0-9A-Fa-f]{4}[^<>{}]*)</g;
  const offenders: string[] = [];

  for (const file of walk("src")) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      for (const m of line.matchAll(between)) {
        offenders.push(`${file}:${i + 1}  >${m[1].trim()}<  → wrap the escape in {"..."}`);
      }
    });
  }

  assert.deepEqual(offenders, [], `\n${offenders.join("\n")}\n`);
});
