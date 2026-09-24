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

test("plan copy does NOT quote a message count", () => {
  // The first fix for the "Unlimited Dolly" overclaim was to print the exact
  // daily figure on the pricing card. That trades one problem for another: no
  // subscription quotes a message count, and a number there reads as a ration
  // rather than an allowance — it invites a comparison that helps nobody and
  // makes a generous limit sound mean. Non-absolute language on the card, the
  // figures in the Terms, and a plain message at the moment someone reaches
  // one.
  for (const f of FEATURES) {
    assert.doesNotMatch(
      f.description,
      /\b\d+\s*(messages?|rituals?|requests?|chats?)\b/i,
      `${f.key} quotes a count: "${f.description}"`,
    );
  }
});

test("the limits are disclosed somewhere a reader can find them", () => {
  // Not naming a number on the pricing card is only acceptable because the
  // limits are documented and linked. Vague-by-omission would be the original
  // "subject to fair use" problem again.
  const terms = readFileSync(join(process.cwd(), "src/app/terms/page.tsx"), "utf8");
  assert.match(terms, /Limits on AI features/, "the Terms have no limits section");
  assert.match(terms, /per-day cap/i);
  assert.match(terms, /monthly ceiling/i);

  // And the surfaces that used to carry the claim now point at it.
  for (const file of ["src/components/Paywall.tsx", "src/app/account/page.tsx"]) {
    const src = readFileSync(join(process.cwd(), file), "utf8");
    assert.match(src, /AI features have usage limits/, `${file} does not mention limits`);
    assert.match(src, /href="\/terms"/, `${file} does not link the Terms`);
  }
});

test("the private monthly spend ceilings are still not disclosed anywhere", () => {
  // The per-day caps are a product limit and fair to document. The monthly
  // DOLLAR ceilings are not: they are a cost control, and naming them tells
  // people how much AI they can extract for their subscription.
  const terms = readFileSync(join(process.cwd(), "src/app/terms/page.tsx"), "utf8");
  // Scoped to the AI section: the liability cap elsewhere names a figure, and
  // is supposed to.
  const from = terms.indexOf("Limits on AI features");
  const section = terms.slice(from, terms.indexOf("Acceptable use", from));
  assert.ok(section.length > 200, "the AI limits section was not found — this test is stale");
  assert.doesNotMatch(section, /\$\s*\d/, "the AI limits section names a dollar figure");
  assert.doesNotMatch(section, /\b\d+\s*(messages?|rituals?)\b/i, "the AI limits section quotes a count");
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
