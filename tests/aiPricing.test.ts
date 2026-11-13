import test from "node:test";
import { CLAUDE_MODEL, FALLBACK_MODEL } from "../src/lib/aiModel";
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
  const plain = costMicros("claude-sonnet-4-6", { input_tokens: 10_000, output_tokens: 0 });
  const read = costMicros("claude-sonnet-4-6", { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 10_000 });
  assert.equal(read, plain / 10);

  // Writes are billed by how long the entry lives: 1.25x for five minutes,
  // 2x for an hour. This app asks for an hour (lib/ai/promptCache.ts).
  const write5m = costMicros("claude-sonnet-4-6", {
    cache_creation: { ephemeral_5m_input_tokens: 10_000, ephemeral_1h_input_tokens: 0 },
  });
  const write1h = costMicros("claude-sonnet-4-6", {
    cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 10_000 },
  });
  assert.equal(write5m, plain * 1.25);
  assert.equal(write1h, plain * 2);
});

test("an unsplit cache write bills at the HIGHER rate, not the lower one", () => {
  // The split is missing on an older response shape. Guessing the cheap rate
  // would under-count spend against the monthly ceiling — the one thing
  // between a heavy user and an open-ended bill. Guess expensive instead.
  const plain = costMicros("claude-sonnet-4-6", { input_tokens: 10_000, output_tokens: 0 });
  const unsplit = costMicros("claude-sonnet-4-6", { cache_creation_input_tokens: 10_000 });
  assert.equal(unsplit, plain * 2);
});

test("a model id is never billed at a different model's rate", () => {
  // "claude-sonnet-5" is a prefix of "claude-sonnet-5-5"; the lookup returns
  // the first match, so the order of the table is load-bearing. Same for the
  // Opus pair. Get it wrong and one model quietly bills as another.
  const sonnet55 = costMicros("claude-sonnet-5-5", { input_tokens: 1_000_000, output_tokens: 0 });
  const sonnet5 = costMicros("claude-sonnet-5", { input_tokens: 1_000_000, output_tokens: 0 });
  assert.equal(sonnet55, 2_000_000, "sonnet 5.5 input is $2/MTok");
  assert.equal(sonnet5, 2_000_000, "sonnet 5 input is $2/MTok");

  const opus55 = costMicros("claude-opus-5-5", { input_tokens: 1_000_000, output_tokens: 0 });
  const opus5 = costMicros("claude-opus-5", { input_tokens: 1_000_000, output_tokens: 0 });
  assert.equal(opus55, 4_000_000, "opus 5.5 input is $4/MTok — not opus 5's $5");
  assert.equal(opus5, 5_000_000);

  // And the two models this app actually runs are priced, not billed at the
  // unknown-model rate.
  assert.equal(costMicros("claude-haiku-5-5", { input_tokens: 1_000_000 }), 100_000);
});

test("the models the app runs are cheaper than the ones they replaced", () => {
  // The point of the change. If someone bumps CLAUDE_MODEL to something
  // dearer, this says so.
  const call = { input_tokens: 500, output_tokens: 350, cache_read_input_tokens: 6_800 };
  assert.ok(
    costMicros(CLAUDE_MODEL, call) < costMicros("claude-sonnet-4-6", call),
    "the default model is no cheaper than the Sonnet 4.6 it replaced",
  );
  assert.ok(
    costMicros(FALLBACK_MODEL, call) < costMicros("claude-haiku-4-5", call),
    "the fallback model is no cheaper than the Haiku 4.5 it replaced",
  );
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
