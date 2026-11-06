/**
 * What Dolly is given of someone's journal.
 *
 * The bug this pins, in the reader's words: "She is saying she can only see
 * two, but there are only two." Dolly was handed five entries truncated to
 * 160 characters each and nothing telling her whether that was the lot, so
 * she hedged — and "I can only see two of your entries" reads to the person
 * who wrote two as *the rest are missing*. A working app sounding broken.
 *
 * Two halves to the fix, and both are tested here: she gets the whole journal,
 * and the block states plainly how much of it she has.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildJournalContext } from "../src/lib/dollyCrossFeature";

type Entry = Record<string, unknown>;

const entry = (day: string, text: string, extra: Entry = {}): Entry => ({
  id: day,
  text,
  content: text,
  date: day,
  created_at: `${day}T09:00:00.000Z`,
  is_burn: false,
  ...extra,
});

/* ── She is given all of it ─────────────────────────────────────────────── */

test("two entries means two entries, and she is told that is all of them", () => {
  const out = buildJournalContext([
    entry("2026-11-06", "I keep putting off the conversation with my dad."),
    entry("2026-11-02", "Slept badly. The same dream about the house."),
  ]);
  assert.match(out, /They have 2 journal entries in total, and every one of them is below/);
  assert.match(out, /putting off the conversation with my dad/);
  assert.match(out, /The same dream about the house/);
});

test("one entry reads as one entry, not one entries", () => {
  assert.match(buildJournalContext([entry("2026-11-06", "First one.")]), /1 journal entry in total/);
});

test("entries arrive in full, not as a first line", () => {
  // The old builder cut every entry at 160 characters, so Dolly was shown the
  // opening sentence of someone's morning and asked about their inner life.
  const long = `Opening sentence. ${"Then a real paragraph that carries the actual point. ".repeat(12)}And the end of it.`;
  const out = buildJournalContext([entry("2026-11-06", long)]);
  assert.match(out, /And the end of it\./, "the entry was truncated");
  assert.ok(out.length > 600, `only ${out.length} characters reached her`);
});

test("entries are newest first, whichever order they were stored in", () => {
  const out = buildJournalContext([
    entry("2026-01-04", "Oldest."),
    entry("2026-11-06", "Newest."),
    entry("2026-06-01", "Middle."),
  ]);
  assert.ok(out.indexOf("Newest.") < out.indexOf("Middle."));
  assert.ok(out.indexOf("Middle.") < out.indexOf("Oldest."));
});

test("the date, title, mood, sky and prompt travel with each entry", () => {
  const out = buildJournalContext([
    entry("2026-11-06", "Wrote it down at last.", {
      title: "Dad",
      mood: "heavy, tired",
      prompt_text: "What are you putting off?",
      tags: { moonPhase: "waning gibbous", planetaryDay: "Saturn", timeOfDay: "evening" },
    }),
  ]);
  assert.match(out, /2026-11-06/);
  assert.match(out, /"Dad"/);
  assert.match(out, /feeling: heavy, tired/);
  assert.match(out, /waning gibbous, Saturn, evening/);
  assert.match(out, /Prompt they answered: What are you putting off\?/);
});

test('"(free write)" is not repeated back as though it were a prompt', () => {
  const out = buildJournalContext([entry("2026-11-06", "Just thinking.", { prompt: "(free write)" })]);
  assert.doesNotMatch(out, /free write/);
});

/* ── Privacy ────────────────────────────────────────────────────────────── */

test("burned entries are never sent — their words left no trace", () => {
  const out = buildJournalContext([
    entry("2026-11-06", "Something I kept."),
    entry("2026-11-05", "SOMETHING I BURNED", { is_burn: true }),
  ]);
  assert.doesNotMatch(out, /BURNED/, "a burned entry reached the AI prompt");
  assert.match(out, /1 journal entry in total/, "a burned entry was counted");
});

test("a photo attached to an entry is never sent", () => {
  // Stored on-device as a base64 data URL; megabytes of nothing the model
  // can use, in a block that is billed by the character.
  const out = buildJournalContext([
    entry("2026-11-06", "By the river.", { image: `data:image/jpeg;base64,${"A".repeat(5000)}` }),
  ]);
  assert.doesNotMatch(out, /base64|AAAA/);
  assert.ok(out.length < 400);
});

test("empty and malformed journals produce nothing rather than an empty heading", () => {
  assert.equal(buildJournalContext([]), "");
  assert.equal(buildJournalContext(null), "");
  assert.equal(buildJournalContext("not an array"), "");
  assert.equal(buildJournalContext([entry("2026-11-06", "   ")]), "");
});

/* ── The person who has written every day for three years ───────────────── */

test("a very long journal is capped, and she is told what is missing", () => {
  const many = Array.from({ length: 400 }, (_, i) =>
    entry(`2026-${String((i % 12) + 1).padStart(2, "0")}-01`, `Entry ${i}. ${"A sentence about the day. ".repeat(10)}`, {
      id: `e${i}`,
      created_at: new Date(Date.UTC(2026, 0, 1) + i * 86_400_000).toISOString(),
    }));
  const out = buildJournalContext(many, 10_000);

  assert.ok(out.length < 12_000, `the cap did not hold: ${out.length} characters`);
  assert.match(out, /They have 400 journal entries in total/);
  assert.match(out, /most recent are below in full/);
  assert.match(out, /the older ones exist and are theirs to bring up/);
  // The newest is present and the oldest is not.
  assert.match(out, /Entry 399\./);
  assert.doesNotMatch(out, /Entry 0\./);
});

test("a single enormous entry still reaches her rather than being dropped", () => {
  const out = buildJournalContext([entry("2026-11-06", "X".repeat(50_000))], 1_000);
  assert.match(out, /XXXX/);
  assert.match(out, /this entry continues/);
});

/* ── And she is told not to narrate her own access ──────────────────────── */

test("the prompt forbids describing how much of the journal she can see", () => {
  const route = readFileSync("src/app/api/dolly/route.ts", "utf8");
  const block = route.slice(route.indexOf("## Their journal"), route.indexOf("## Their journal") + 1600);
  assert.ok(block.length > 100, "the journal block is not where this test expects it");
  assert.match(block, /NEVER describe your own access/);
  assert.match(block, /only/, "the prompt does not name the exact phrasing being banned");
});

test("the journal travels in the cached half of the prompt, not the volatile half", () => {
  // It changes when they write an entry, not between messages. Sending the
  // whole journal uncached would buy it again on every single turn, against a
  // monthly AI budget the reader cannot see and did nothing to spend.
  const route = readFileSync("src/app/api/dolly/route.ts", "utf8");
  const at = route.indexOf("if (journalContext?.trim())");
  assert.ok(at > 0);
  const block = route.slice(at, at + 400);
  assert.match(block, /stableParts\.push/);
  assert.doesNotMatch(block, /volatileParts\.push/);
});
