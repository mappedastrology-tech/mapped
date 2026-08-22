/**
 * Dolly's reply parser handles untrusted model output on every streamed token.
 * These pin the two things that matter: raw JSON never reaches the screen, and
 * a model-authored link never renders unless it's a route we own.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { parseDollyReply, dollyBody } from "../src/lib/dollyReply";

const META = '{"tags":[{"label":"Saturn in the 10th","kind":"chart"}],"lead":"Slowly, then all at once.","action":{"label":"Open your birth chart","href":"/you"},"follow":["What about money?"]}';

test("parses a well-formed reply", () => {
  const r = parseDollyReply(`${META}\n\nSaturn sits on your 10th house cusp.`);
  assert.equal(r.metaPending, false);
  assert.equal(r.body, "Saturn sits on your 10th house cusp.");
  assert.equal(r.meta?.lead, "Slowly, then all at once.");
  assert.deepEqual(r.meta?.tags, [{ label: "Saturn in the 10th", kind: "chart" }]);
  assert.deepEqual(r.meta?.action, { label: "Open your birth chart", href: "/you" });
  assert.deepEqual(r.meta?.follow, ["What about money?"]);
});

test("a reply that does not open with { is prose from the first character", () => {
  for (const s of ["S", "Saturn sits", "  Hello {not json}"]) {
    const r = parseDollyReply(s);
    assert.equal(r.metaPending, false, s);
    assert.equal(r.meta, null, s);
    assert.equal(r.body, s, s);
  }
});

test("withholds a half-written meta line instead of flashing raw JSON", () => {
  for (let i = 1; i < META.length; i++) {
    const r = parseDollyReply(META.slice(0, i));
    assert.equal(r.metaPending, true, `at ${i}`);
    assert.equal(r.body, "", `at ${i}`);
    assert.equal(r.meta, null, `at ${i}`);
  }
});

test("never leaks a brace-opening prefix as body while streaming", () => {
  const full = `${META}\n\nSaturn sits on your 10th house cusp.`;
  for (let i = 1; i <= full.length; i++) {
    const r = parseDollyReply(full.slice(0, i));
    assert.ok(!r.body.includes('"tags"'), `leaked meta at ${i}: ${r.body.slice(0, 60)}`);
    assert.ok(!r.body.includes("{\"lead"), `leaked meta at ${i}`);
  }
});

test("malformed JSON degrades to prose rather than eating the reply", () => {
  const raw = '{"tags": oops\nThe real answer.';
  const r = parseDollyReply(raw);
  assert.equal(r.meta, null);
  assert.equal(r.body, raw);
  assert.equal(r.metaPending, false);
});

test("drops an action whose href is not one of ours", () => {
  for (const href of ["https://evil.example/x", "javascript:alert(1)", "/admin", "//evil.example", ""]) {
    const raw = `{"action":{"label":"Tap","href":${JSON.stringify(href)}},"lead":"Hi"}\n\nBody.`;
    const r = parseDollyReply(raw);
    assert.equal(r.meta?.action ?? null, null, href);
    assert.equal(r.meta?.lead, "Hi", href);   // the rest of the meta survives
  }
});

test("caps tags, follow-ups and lengths", () => {
  const raw = JSON.stringify({
    tags: [
      { label: "a", kind: "chart" }, { label: "b", kind: "sky" },
      { label: "c", kind: "card" }, { label: "d", kind: "chart" },
    ],
    lead: "x".repeat(500),
    follow: ["one", "two", "three"],
  }) + "\n\nBody.";
  const r = parseDollyReply(raw);
  assert.equal(r.meta?.tags.length, 3);
  assert.equal(r.meta?.follow.length, 2);
  assert.equal(r.meta?.lead, null);          // over-long lead is dropped, not truncated
  assert.equal(r.body, "Body.");
});

test("an unknown tag kind falls back to chart rather than reaching the DOM", () => {
  const raw = '{"tags":[{"label":"Odd","kind":"<script>"}]}\n\nBody.';
  assert.equal(parseDollyReply(raw).meta?.tags[0].kind, "chart");
});

test("an empty meta object is treated as no meta", () => {
  const r = parseDollyReply('{}\n\nJust prose.');
  assert.equal(r.meta, null);
  assert.equal(r.body, "Just prose.");
});

test("dollyBody strips meta and leaves plain replies untouched", () => {
  assert.equal(dollyBody(`${META}\n\nThe prose.`), "The prose.");
  assert.equal(dollyBody("Old conversation with no meta."), "Old conversation with no meta.");
});
