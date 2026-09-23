import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The invariant: no gate may ever be what answers a crisis message.
 *
 * lib/crisis.ts is tested on its own for what it detects. This file tests the
 * thing that was actually broken — the ORDER. Detection is worthless if the
 * paywall, the daily cap or the monthly ceiling runs first, because each of
 * them returns before the message is ever looked at.
 *
 * These are structural assertions over source text, which is a blunt
 * instrument, but the alternative is standing up the whole React tree and a
 * Supabase session to prove a branch ordering. The failure being guarded
 * against is someone later moving a gate above the check, and that is exactly
 * what reading the source catches.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

function indexOfOrFail(haystack: string, needle: string | RegExp, what: string): number {
  const i = typeof needle === "string" ? haystack.indexOf(needle) : haystack.search(needle);
  assert.ok(i >= 0, `could not find ${what} — this test is stale, not passing`);
  return i;
}

test("Dolly mobile checks for crisis before it consults the tier gate", () => {
  const src = read("src/app/(tabs)/dolly/page.tsx");
  const check = indexOfOrFail(src, "const crisis = detectCrisis(msg)", "the crisis check");
  const gate = indexOfOrFail(src, 'gateWithReason("ai_features")', "the tier gate");
  assert.ok(check < gate, "the paywall would be consulted before the message is read");
});

test("Dolly mobile never opens the paywall for a crisis message", () => {
  // gateWithReason SHOWS the modal as a side effect, so it is not enough to
  // ignore its result — it must not be called at all.
  const src = read("src/app/(tabs)/dolly/page.tsx");
  assert.match(
    src,
    /if \(tier === "free" && !crisis\) \{/,
    "the free-tier gate should be skipped entirely when the message looks like crisis",
  );
});

test("the Dolly route reads the message before any gate can refuse it", () => {
  const src = read("src/app/api/dolly/route.ts");
  const parse = indexOfOrFail(src, "body = await request.json()", "the body parse");
  const detect = indexOfOrFail(src, "detectCrisis(message)", "the crisis check");
  const rate = indexOfOrFail(src, "checkRateLimitDurable(`dolly:", "the rate limit");
  const budget = indexOfOrFail(src, "await checkAiBudget(uid)", "the budget ceiling");
  assert.ok(parse < detect, "the message must be parsed before it can be checked");
  assert.ok(detect < rate, "the rate limit would refuse before the message is read");
  assert.ok(detect < budget, "the spend ceiling would refuse before the message is read");
});

test("every refusal in the Dolly route yields to the crisis branch", () => {
  // Each of these returned a limit or an upgrade prompt. If a new refusal is
  // added later without the same guard, this fails.
  const src = read("src/app/api/dolly/route.ts");
  const refusals = [
    { after: "if (!allowed) {", what: "the daily rate limit" },
    { after: "if (!budget.allowed) {", what: "the monthly spend ceiling" },
  ];
  for (const { after, what } of refusals) {
    const at = indexOfOrFail(src, after, what);
    const block = src.slice(at, at + 400);
    assert.match(block, /if \(isCrisis\) return crisisResponse\(\);/, `${what} can still answer a crisis message`);
  }
});

test("desktop Dolly checks before it sends, and does not stack a limit on top", () => {
  const src = read("src/components/web/WebDolly.tsx");
  const check = indexOfOrFail(src, "const crisis = detectCrisis(userText)", "the crisis check");
  const post = indexOfOrFail(src, 'authedFetch("/api/dolly"', "the request");
  assert.ok(check < post, "the check must happen before the request");
  // The 402/429/503 branch must bail out rather than render a plan limit.
  const at = indexOfOrFail(src, "res.status === 402 || res.status === 429 || res.status === 503", "the limit branch");
  assert.match(src.slice(at, at + 400), /if \(crisis\) return;/, "a plan limit could render under the support card");
});

test("there is exactly one crisis detector in the codebase", () => {
  // The journal had its own nine-phrase copy with no guard against figures of
  // speech, so the same sentence was a crisis in one screen and not in
  // another. Two standards for this question is one too many.
  const journal = read("src/lib/journal.ts");
  assert.match(journal, /export \{ detectCrisis as detectCrisisContent \} from "@\/lib\/crisis"/);
  assert.doesNotMatch(journal, /const CRISIS_PHRASES = \[/, "the journal still has its own phrase list");
});

test("no surface hardcodes a crisis phone number any more", () => {
  // They drifted: the wizard said one thing, the journal another, and both
  // offered a US-only number with nothing for anyone else. The resources live
  // in lib/crisis.ts and are rendered by CrisisCard.
  // Comments stripped first: the files explain in prose why the numbers were
  // removed, and matching that would fail for saying so.
  const stripComments = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  for (const file of [
    "src/components/RitualWizard.tsx",
    "src/app/(tabs)/journal/JournalClient.tsx",
    "src/app/(tabs)/dolly/page.tsx",
    "src/components/web/WebDolly.tsx",
  ]) {
    assert.doesNotMatch(stripComments(read(file)), /\b988\b|\b741741\b/, `${file} hardcodes a crisis number`);
  }
});
