import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { AI_RESTING_MESSAGE, AI_UNAVAILABLE_MESSAGE, AI_UPGRADE_MESSAGE } from "../src/lib/ai/messages";

/**
 * Modules that must never reach the browser bundle, and why.
 *
 * `@/lib/ai/budget` builds a Supabase service-role client and holds the
 * monthly dollar ceilings, which are deliberately not disclosed to
 * subscribers. Its header says "never import this from a client component" —
 * and nothing enforced that. A client component wanting one user-facing
 * sentence out of it would have pulled the whole module in, which is exactly
 * the mistake this file now catches. The sentences live in
 * `@/lib/ai/messages`, which is safe to import anywhere.
 */
const SERVER_ONLY = ["@/lib/ai/budget", "@/lib/ai/meter"];

/** The server-only modules themselves — they may import each other. */
const EXEMPT = ["src/lib/ai/budget.ts", "src/lib/ai/meter.ts"];

/** Where client code lives. API routes are server-side and may import freely. */
const CLIENT_ROOTS = ["src/app", "src/components", "src/hooks", "src/lib"];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      // Route handlers run on the server; they are the intended callers.
      if (p.includes("src/app/api")) continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

test("no client-side module imports the server-only AI budget", () => {
  const offenders: string[] = [];
  for (const root of CLIENT_ROOTS) {
    for (const file of walk(join(process.cwd(), root))) {
      const rel = file.replace(process.cwd() + "/", "");
      if (EXEMPT.includes(rel)) continue;
      const src = readFileSync(file, "utf8");
      for (const mod of SERVER_ONLY) {
        // Both `from "…"` and a dynamic `import("…")`, which is how the API
        // routes reach these and how a client file would most easily sneak one in.
        const q = mod.replace(/\//g, "\\/");
        if (new RegExp(`(from|import\\()\\s*["']${q}["']`).test(src)) {
          offenders.push(`${rel} imports ${mod}`);
        }
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `these would pull the service-role client and the private spend ceilings into the browser:\n${offenders.join("\n")}`,
  );
});

test("the user-facing AI messages never name a limit", () => {
  // The ceilings are intentionally undisclosed. A message that quotes a dollar
  // figure or a message count leaks the number the ceilings exist to keep
  // private — and these strings DO ship in the browser bundle.
  for (const msg of [AI_RESTING_MESSAGE, AI_UNAVAILABLE_MESSAGE, AI_UPGRADE_MESSAGE]) {
    assert.doesNotMatch(msg, /\$\s*\d/, `names a dollar figure: ${msg}`);
    assert.doesNotMatch(msg, /\b\d+\s*(messages?|requests?|credits?|tokens?)\b/i, `names a count: ${msg}`);
  }
});

test("a limit and an outage do not share wording", () => {
  // They were the same sentence once, so a failed database read told people
  // they had used up an allowance they had barely touched.
  assert.notEqual(AI_RESTING_MESSAGE, AI_UNAVAILABLE_MESSAGE);
});
