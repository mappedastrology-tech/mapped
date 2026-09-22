import test from "node:test";
import assert from "node:assert/strict";

import { costMicros, rateFor } from "../src/lib/ai/pricing";

/**
 * These guard the arithmetic that decides when someone's AI access shuts off.
 * A rate typo here doesn't crash anything — it quietly bills people at the
 * wrong multiple, either cutting off a paying subscriber early or letting an
 * expensive month run uncapped.
 */

test("published rates are what Anthropic charges", () => {
  // Per million tokens, in micro-dollars: Sonnet 4.6 $3/$15, Opus 4.8 $5/$25,
  // Haiku 4.5 $1/$5.
  assert.deepEqual(rateFor("claude-sonnet-4-6"), { input: 3_000_000, output: 15_000_000 });
  assert.deepEqual(rateFor("claude-opus-4-8"), { input: 5_000_000, output: 25_000_000 });
  assert.deepEqual(rateFor("claude-haiku-4-5"), { input: 1_000_000, output: 5_000_000 });
});

test("dated model snapshots match their family rate", () => {
  // aiModel.ts uses the dated Haiku id, so a prefix miss here would silently
  // bill every fallback call at the unknown-model rate.
  assert.deepEqual(rateFor("claude-haiku-4-5-20251001"), rateFor("claude-haiku-4-5"));
});

test("an unpriced model bills at the most expensive rate, not zero", () => {
  // If a model is retired and someone forgets to add the replacement here,
  // the failure has to be an overcharge, not free unlimited usage.
  const unknown = rateFor("claude-something-not-yet-released");
  assert.equal(unknown.input, 5_000_000);
  assert.equal(unknown.output, 25_000_000);
});

test("a plain Sonnet call costs what the arithmetic says", () => {
  // 10k in at $3/MTok = $0.03; 1k out at $15/MTok = $0.015. Total $0.045.
  const micros = costMicros("claude-sonnet-4-6", { input_tokens: 10_000, output_tokens: 1_000 });
  assert.equal(micros, 45_000);
});

test("cached tokens are discounted and cache writes cost a premium", () => {
  // Cache reads bill at a tenth of input, writes at 1.25x.
  const read = costMicros("claude-sonnet-4-6", { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 10_000 });
  const write = costMicros("claude-sonnet-4-6", { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 10_000 });
  const plain = costMicros("claude-sonnet-4-6", { input_tokens: 10_000, output_tokens: 0 });
  assert.equal(read, plain / 10);
  assert.equal(write, plain * 1.25);
});

test("a tiny call still costs something", () => {
  // Rounding to nearest would make a one-token Haiku call free, and a loop of
  // free calls is exactly the shape of abuse the ceiling exists to stop.
  assert.ok(costMicros("claude-haiku-4-5", { input_tokens: 1, output_tokens: 0 }) > 0);
});

test("missing usage costs nothing rather than throwing", () => {
  // A stream that dies before reporting usage must not take the request down.
  assert.equal(costMicros("claude-sonnet-4-6", null), 0);
  assert.equal(costMicros("claude-sonnet-4-6", undefined), 0);
  assert.equal(costMicros("claude-sonnet-4-6", {}), 0);
});

test("a month of ordinary Dolly use stays inside the $11.11 tier's ceiling", () => {
  // The ceiling is $5.00 (5_000_000 micros). A Dolly turn sends the chart plus
  // history — call it 6k in, 400 out on Sonnet. Someone chatting twice a day
  // for a month should not come anywhere near being cut off.
  const perTurn = costMicros("claude-sonnet-4-6", { input_tokens: 6_000, output_tokens: 400 });
  const monthOfTwiceDaily = perTurn * 60;
  assert.ok(
    monthOfTwiceDaily < 5_000_000,
    `ordinary use would hit the ceiling: ${monthOfTwiceDaily} micros for 60 turns`,
  );
});
