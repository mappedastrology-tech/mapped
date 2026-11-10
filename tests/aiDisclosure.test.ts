import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AI_SHARED_ITEMS } from "../src/lib/aiConsent";

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
    /Your journal entries/,
    /latest tarot or oracle pull/,
    /People you have saved as connections/,
    /summary Dolly keeps about you/,
    /photo of your palm/,
  ]) {
    assert.match(src, thing, `privacy page omits: ${thing}`);
  }

  // And it does not UNDERSTATE them. The page used to say Dolly was sent
  // "short excerpts" of the latest entries, which was true of the old
  // 160-character sample and is not true of the journal she is given now. A
  // disclosure that undersells what leaves the device is worse than none.
  assert.doesNotMatch(src, /short excerpts/i, "the privacy page still describes journal excerpts");
  assert.match(src, /full text/i, "the privacy page does not say the entries are sent in full");
  // Burn entries are promised to leave no trace; the page has to say so.
  assert.match(src, /burn[\s\S]{0,80}never (stored|sent)/i, "the privacy page does not mention burned entries");
});

test("the consent screen's list matches what the privacy page describes", () => {
  // The consent screen is the one most people actually read, and it said
  // journal entries went "when you ask for a reflection or a prompt" long
  // after they started going with every message.
  // Only the line about DOLLY. A separate item says journal entries go when
  // you ask for a reflection on a week or a month, and that one is true —
  // reflections really are on request. Matching across the whole list caught
  // it by accident and would have forced a correct disclosure to be removed.
  const dolly = AI_SHARED_ITEMS.find((i) => /journal/i.test(i) && /every message/i.test(i));
  assert.ok(dolly, "the consent screen does not say the journal goes with every Dolly message");
  assert.doesNotMatch(
    dolly!,
    /when you ask/i,
    "the consent screen still says Dolly only gets the journal when asked",
  );
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
