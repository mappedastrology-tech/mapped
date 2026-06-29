#!/usr/bin/env node
/**
 * Remove file-sync duplicate copies — the "name 2.ext", "name 3.ext",
 * "BUILD_ID 2", etc. that iCloud/Dropbox-style sync leaves behind. When these
 * land in src/ or in Next's generated .next/types they break `tsc` and the
 * build, so we sweep them before every deploy (and on demand via `clean:dupes`).
 *
 * Scoped to the project tree, skipping node_modules and .git. Matches a single
 * space followed by a digit 2–9 at the end of the name, optionally before a
 * single extension — the exact shape these copies take.
 */
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const SKIP = new Set(["node_modules", ".git"]);
const DUP = /\s[2-9](\.[A-Za-z0-9]+)?$/;

let removed = 0;
function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (DUP.test(e.name)) {
      try {
        rmSync(p, { recursive: true, force: true });
        removed++;
      } catch {
        /* ignore */
      }
      continue;
    }
    if (e.isDirectory()) walk(p);
  }
}

walk(process.cwd());
console.log(removed ? `clean-dupes: removed ${removed} sync-duplicate file(s)/dir(s)` : "clean-dupes: none found");
