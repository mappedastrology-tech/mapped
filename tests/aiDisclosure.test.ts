import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Dolly has a name, a portrait, a first-person voice and a warm manner. All
 * of that is deliberate and good, and all of it makes the same implication —
 * so the app has to say plainly, somewhere the reader will actually look,
 * that she is software.
 *
 * It also has to stop implying otherwise. Both screens carried a small green
 * dot beside her name: the presence indicator every messaging app uses to mean
 * a person is at the other end, shown permanently, next to a portrait. It was
 * decoration that happened to make a claim.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const SCREENS = [
  "src/app/(tabs)/dolly/page.tsx",
  "src/components/web/WebDolly.tsx",
];

test("both Dolly screens say she is an AI, in words", () => {
  // A two-letter badge alone is not a disclosure — plenty of people won't
  // parse "AI" as a claim about what they're talking to. There has to be a
  // sentence.
  for (const file of SCREENS) {
    assert.match(
      read(file),
      /Dolly is an AI, not a person/,
      `${file} never states plainly that Dolly is not a person`,
    );
  }
});

test("both screens carry a marked-up AI label next to her name", () => {
  for (const file of SCREENS) {
    assert.match(
      read(file),
      /aria-label="Dolly is an AI assistant"/,
      `${file} has no labelled AI mark`,
    );
  }
});

test("neither screen shows a presence dot", () => {
  // The specific shape being guarded against: a small round element filled
  // with a green/go token, which reads as "online".
  for (const file of SCREENS) {
    const src = read(file).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    assert.doesNotMatch(
      src,
      /borderRadius: "50%",\s*background: "var\(--go\)"/,
      `${file} still draws an online dot`,
    );
    assert.doesNotMatch(
      src,
      /background: "var\(--sage\)", boxShadow: "0 0 7px var\(--sage\)"/,
      `${file} still draws an online dot`,
    );
  }
});

test("the privacy page says what Dolly is and is not", () => {
  const src = read("src/app/privacy/page.tsx");
  assert.match(src, /Dolly is software, not a person/);
  assert.match(src, /not a counsellor, therapist or medical service/);
});

test("the privacy page lists what actually gets sent", () => {
  // It used to claim only "the relevant chart and celestial data and, where
  // applicable, your first name" — while Dolly also receives journal
  // excerpts, tarot notes, a stored summary of the reader's life, and the
  // names and charts of third parties who never agreed to anything.
  const src = read("src/app/privacy/page.tsx");
  for (const thing of [
    /Recent journal entries/,
    /latest tarot or oracle pull/,
    /People you have saved as connections/,
    /summary Dolly keeps about you/,
    /photo of your palm/,
  ]) {
    assert.match(src, thing, `privacy page omits: ${thing}`);
  }
});

test("the stored memory can be read and deleted, as the privacy page claims", () => {
  // The page says so. It was not true until the Account control existed, and
  // a privacy page that promises a control that does not exist is worse than
  // one that admits the gap.
  const section = read("src/components/DollyMemorySection.tsx");
  assert.match(section, /from\("dolly_memory"\)[\s\S]{0,200}\.select\(/, "no way to read it");
  assert.match(section, /from\("dolly_memory"\)\s*\.delete\(\)/, "no way to delete it");
  assert.match(read("src/app/account/page.tsx"), /<DollyMemorySection \/>/, "not shown in Account");
  // And it travels with a data export, which is where someone looks first.
  assert.match(read("src/lib/exportUserData.ts"), /dolly_memory: "user_id"/);
});
