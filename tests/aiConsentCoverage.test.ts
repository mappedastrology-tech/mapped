/**
 * Every route that sends user data to Anthropic asks for consent first.
 *
 * The bug this pins: /api/palmistry ran three gates — auth, rate limit and the
 * tier/budget guard — but never called guardAiConsent. A user who tapped "No"
 * on the consent screen still had a photograph of their hand base64-forwarded
 * to a third party. App Store Guideline 5.1.2(i) requires consent before
 * personal data reaches a third-party service, which is why the guard exists.
 *
 * The check is structural rather than per-route so a new AI route cannot ship
 * without one: anything that reaches the Anthropic SDK has to be in the list.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AI_SHARED_ITEMS } from "../src/lib/aiConsent";

const API_ROOT = "src/app/api";

/** Anything that constructs a model request, however it is spelled. */
const CALLS_ANTHROPIC = /anthropic\.messages\.(create|stream)|createMessageResilient|messages\.stream\(/;

function routeFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) routeFiles(p, out);
    else if (entry === "route.ts") out.push(p);
  }
  return out;
}

test("every route that calls Anthropic guards on AI consent first", () => {
  const offenders: string[] = [];

  for (const file of routeFiles(API_ROOT)) {
    const src = readFileSync(file, "utf8");
    if (!CALLS_ANTHROPIC.test(src)) continue;
    if (!src.includes("guardAiConsent")) {
      offenders.push(`${file} reaches Anthropic but never calls guardAiConsent`);
    }
  }

  assert.deepEqual(offenders, [], offenders.join("\n  "));
});

test("the consent screen discloses the palm photograph it sends", () => {
  const items = AI_SHARED_ITEMS.join(" ").toLowerCase();
  assert.ok(
    items.includes("palm"),
    "AI_SHARED_ITEMS must name the palm photograph — the palmistry route sends it, " +
      "and a disclosure that omits it is not consent for it.",
  );
});
