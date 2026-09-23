import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { FEATURES, USAGE_LIMITS, getFeatureInfo } from "../src/lib/tier";
import { DAILY_AI_LIMITS } from "../src/lib/ai/dailyLimits";

/**
 * What the plan promises has to be what the product does.
 *
 * "Unlimited Dolly — ask Dolly as much as you like, subject to fair use" was
 * sold against a hard cap of 30 messages a day. Three separate places
 * disagreed: the route enforced 30, USAGE_LIMITS claimed Infinity, and the
 * copy claimed no limit at all. Nobody was lying on purpose — the numbers were
 * just written three times and drifted. These tests make drift fail.
 */

test("no plan copy promises something unlimited that is capped", () => {
  const capped = new Set(["unlimited_dolly", "unlimited_wizard"]);
  const offenders = FEATURES
    .filter((f) => capped.has(f.key))
    .filter((f) => /unlimited|as much as you like|as many .* as you want|no limit/i.test(`${f.label} ${f.description}`))
    .map((f) => `${f.key}: "${f.label}" — "${f.description}"`);
  assert.deepEqual(offenders, [], `capped features described as unlimited:\n${offenders.join("\n")}`);
});

test("'fair use' is not used to stand in for a hard number", () => {
  // It reads as "be reasonable and you'll be fine", which is not what a fixed
  // daily cap is. If there is a number, say the number.
  const offenders = FEATURES
    .filter((f) => /fair use/i.test(f.description))
    .map((f) => f.key);
  assert.deepEqual(offenders, []);
});

test("the Dolly plan copy names the cap the server actually enforces", () => {
  const info = getFeatureInfo("unlimited_dolly");
  assert.ok(info, "the Dolly plan feature is missing");
  assert.match(
    info.description,
    new RegExp(`\\b${DAILY_AI_LIMITS.dolly}\\b`),
    `copy should name ${DAILY_AI_LIMITS.dolly}: "${info.description}"`,
  );
});

test("the UI's idea of the Dolly limit matches the server's", () => {
  // USAGE_LIMITS said Infinity, so nothing in the app could ever warn someone
  // they were near the cap, or explain the refusal when they hit it.
  assert.equal(USAGE_LIMITS.mid.dollyMessagesPerDay, DAILY_AI_LIMITS.dolly);
  assert.equal(USAGE_LIMITS.max.dollyMessagesPerDay, DAILY_AI_LIMITS.dolly);
});

test("the routes read the shared cap instead of their own literal", () => {
  // The whole point of the constant. A route that hardcodes its number again
  // can drift from the copy without any test noticing.
  for (const [file, key] of [
    ["src/app/api/dolly/route.ts", "dolly"],
    ["src/app/api/wizard/route.ts", "wizard"],
  ] as const) {
    const src = readFileSync(join(process.cwd(), file), "utf8");
    assert.match(src, new RegExp(`DAILY_AI_LIMITS\\.${key}`), `${file} should use DAILY_AI_LIMITS.${key}`);
  }
});
