import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  cachedSystem,
  withCachedHistory,
  countBreakpoints,
  MAX_BREAKPOINTS,
  HISTORY_CACHE_MIN_MESSAGES,
} from "../src/lib/ai/promptCache";

/**
 * Caching matches a PREFIX, so the ordering is the whole mechanism. Get it
 * wrong and nothing fails, nothing errors, and nothing is cached — the bill
 * is simply what it was before, silently. That is the failure these tests
 * exist to catch, because nothing else would.
 */

const block = (text: string) => ({ type: "text" as const, text });

test("the shared system prompt is cached first, on its own", () => {
  // On its own deliberately: it is byte-identical for every reader, so its
  // cache entry stays warm from everyone's traffic together. Bundled with
  // one person's chart it would only ever be warm for that person.
  const out = cachedSystem({ base: "PERSONA", stable: ["CHART"], volatile: ["TODAY"] });
  assert.equal(out[0].text, "PERSONA");
  assert.ok(out[0].cache_control, "the shared prompt is not cached");
});

test("stable context is cached, volatile context is not", () => {
  const out = cachedSystem({ base: "PERSONA", stable: ["CHART"], volatile: ["TODAY"] });
  const stable = out.find((b) => b.text.includes("CHART"));
  const volatile = out.find((b) => b.text.includes("TODAY"));
  assert.ok(stable?.cache_control, "the chart should be cached — it is the same every turn");
  assert.ok(volatile && !volatile.cache_control, "volatile context must not be cached");
});

test("volatile content always comes last", () => {
  // The one that matters. A volatile block placed before a cached one
  // invalidates the prefix on every request, so the cache can never hit and
  // the writes are pure cost.
  const out = cachedSystem({ base: "PERSONA", stable: ["CHART"], volatile: ["TODAY"] });
  const lastCached = out.map((b) => !!b.cache_control).lastIndexOf(true);
  const firstVolatile = out.findIndex((b) => !b.cache_control);
  assert.ok(firstVolatile > lastCached, "a volatile block sits before a cached one");
});

test("a reader with no chart still gets the shared prompt cached", () => {
  const out = cachedSystem({ base: "PERSONA" });
  assert.equal(out.length, 1);
  assert.ok(out[0].cache_control);
});

test("empty and whitespace-only parts don't produce empty blocks", () => {
  // An empty text block is rejected by the API, and this assembles from a
  // dozen optional sources that can each come back blank.
  const out = cachedSystem({ base: "PERSONA", stable: ["", "   "], volatile: [""] });
  assert.equal(out.length, 1);
  for (const b of out) assert.ok(b.text.trim().length > 0);
});

test("history is cached at the last turn before the new question", () => {
  // Everything up to there is exactly what the next turn sends again, so it
  // is the longest prefix worth storing.
  const messages = [
    { role: "user" as const, content: block("q1").text },
    { role: "assistant" as const, content: "a1" },
    { role: "user" as const, content: "q2" },
    { role: "assistant" as const, content: "a2" },
    { role: "user" as const, content: "q3 — the new one" },
  ];
  const out = withCachedHistory(messages);
  const marked = out.findIndex((m) => typeof m.content !== "string");
  assert.equal(marked, out.length - 2, "the breakpoint is not on the last prior turn");
  assert.equal(typeof out[out.length - 1].content, "string", "the new question must not be cached");
});

test("a short conversation is left alone", () => {
  // A cache entry costs 1.25x to write. Storing two short lines to save a
  // tenth of two short lines loses money.
  const short = [
    { role: "user" as const, content: "hello" },
    { role: "assistant" as const, content: "hi" },
    { role: "user" as const, content: "what's my sun sign?" },
  ];
  assert.ok(short.length < HISTORY_CACHE_MIN_MESSAGES);
  const out = withCachedHistory(short);
  assert.deepEqual(out, short);
});

test("the input array is never modified", () => {
  const messages = Array.from({ length: 6 }, (_, i) => ({
    role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
    content: `turn ${i}`,
  }));
  const copy = JSON.parse(JSON.stringify(messages));
  withCachedHistory(messages);
  assert.deepEqual(messages, copy, "withCachedHistory mutated its input");
});

test("a turn already in block form is left alone", () => {
  // It may carry its own breakpoint; rewriting it blind could push the
  // request past the four-breakpoint limit.
  const messages = [
    { role: "user" as const, content: "a" },
    { role: "assistant" as const, content: "b" },
    { role: "user" as const, content: "c" },
    { role: "assistant" as const, content: [{ type: "text" as const, text: "d" }] },
    { role: "user" as const, content: "e" },
  ];
  const out = withCachedHistory(messages);
  assert.deepEqual(out[3].content, [{ type: "text", text: "d" }]);
});

test("a full request stays within Anthropic's four breakpoints", () => {
  const system = cachedSystem({ base: "PERSONA", stable: ["CHART"], volatile: ["TODAY"] });
  const messages = withCachedHistory(
    Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `turn ${i}`,
    })),
  );
  const used = countBreakpoints(system, messages);
  assert.ok(used <= MAX_BREAKPOINTS, `uses ${used} breakpoints, the limit is ${MAX_BREAKPOINTS}`);
  assert.ok(used >= 3, `only ${used} breakpoints — the caching is not doing its job`);
});

test("the Dolly route builds its prompt stable-first", () => {
  // The route decides which tier each block goes in, and the obvious place to
  // add a new one is the end of whichever list is nearest. This pins the two
  // that must not swap: the chart is stable, what she remembers is not.
  const src = readFileSync(join(process.cwd(), "src/app/api/dolly/route.ts"), "utf8");
  assert.match(src, /stableParts\.push\(buildChartSummary/, "the chart summary must be cacheable");
  assert.match(
    src,
    /volatileParts\.push\(\s*`\\n## What you remember about them/,
    "the memory summary changes between turns and must not be cached",
  );
  // And the retrieved passages, which are different for every question.
  assert.match(src, /if \(kb\) volatileParts\.push\(kb\)/);
});
