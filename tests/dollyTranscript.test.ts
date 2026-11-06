/**
 * Dolly chats, saved as PDF transcripts.
 *
 * Three things have to hold, and all three have bitten this codebase before in
 * one form or another:
 *
 *   1. Dolly's leading JSON meta line NEVER reaches the page. It is untrusted
 *      model output that the bubble already strips; a transcript that printed
 *      it would be shipping raw JSON to a file someone forwards to a therapist.
 *   2. Characters a built-in PDF font cannot hold are turned into words or
 *      dropped, never into a different letter. WinAnsi substitution is silent.
 *   3. A long conversation paginates instead of running off the page.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { readFileSync } from "node:fs";
import {
  toPdfText,
  transcriptBlocks,
  transcriptFilename,
  buildTranscriptPdf,
  type TranscriptMessage,
} from "../src/lib/dollyTranscript";

const META =
  '{"tags":[{"label":"Saturn square Moon","kind":"chart"}],"lead":"Avoidance has a shape","action":{"label":"Open your chart","href":"/you"},"follow":["Say more"]}';

const AT = Date.parse("2026-11-06T21:14:00Z");

/** Every string drawn into the PDF, in order, decompressed from its pages. */
function pdfStrings(bytes: Buffer): string[] {
  const out: string[] = [];
  const raw = bytes.toString("latin1");
  // One regex over the whole file rather than a hand-rolled indexOf walk: the
  // word "stream" occurs inside "endstream", so a scanner that resumes from
  // the end marker finds it again and desyncs — silently returning only the
  // first page, which is the one shape of bug that would make a pagination
  // test pass while pagination was broken.
  for (const m of raw.matchAll(/[^d]stream\r?\n([\s\S]*?)endstream/g)) {
    let text: string;
    try {
      text = inflateSync(Buffer.from(m[1], "latin1")).toString("latin1");
    } catch {
      continue;
    }
    // [\s\S] rather than the /s flag: the project targets an older
    // ECMAScript than dotAll.
    for (const t of text.matchAll(/\(([\s\S]*?)\)\s*Tj/g)) out.push(t[1]);
  }
  return out;
}

/* ── What the transcript says ───────────────────────────────────────────── */

test("Dolly's meta line is stripped, the prose is kept", () => {
  const blocks = transcriptBlocks([
    { role: "assistant", content: `${META}\n\nSaturn sits on your 10th house cusp.`, timestamp: AT },
  ]);
  const bodies = blocks.filter((b) => b.kind === "body").map((b) => b.text);
  assert.deepEqual(bodies, ["Saturn sits on your 10th house cusp."]);
  for (const b of blocks) {
    assert.ok(!b.text.includes('"kind"'), `meta leaked into a ${b.kind} block: ${b.text}`);
    assert.ok(!b.text.includes("/you"), `action href leaked: ${b.text}`);
  }
});

test("each speaker is named, and the person's own first name is used", () => {
  const blocks = transcriptBlocks(
    [
      { role: "user", content: "hello", timestamp: AT },
      { role: "assistant", content: "hello back", timestamp: AT + 1000 },
    ],
    "Taylor",
  );
  const speakers = blocks.filter((b) => b.kind === "speaker").map((b) => b.text);
  assert.equal(speakers.length, 2);
  assert.match(speakers[0], /^Taylor · /);
  assert.match(speakers[1], /^Dolly · /);
});

test("paragraphs survive as paragraphs", () => {
  const blocks = transcriptBlocks([
    { role: "user", content: "One thing.\n\nAnd another.", timestamp: AT },
  ]);
  assert.deepEqual(
    blocks.filter((b) => b.kind === "body").map((b) => b.text),
    ["One thing.", "And another."],
  );
});

test("a date divider only appears where the thread shows one", () => {
  const hour = 60 * 60 * 1000;
  const blocks = transcriptBlocks([
    { role: "user", content: "a", timestamp: AT },
    { role: "assistant", content: "b", timestamp: AT + 5000 },      // same breath
    { role: "user", content: "c", timestamp: AT + 5 * hour },       // came back
  ]);
  assert.equal(blocks.filter((b) => b.kind === "stamp").length, 2);
});

test("the app's own notices and the crisis card are marked as not-Dolly", () => {
  const blocks = transcriptBlocks([
    { role: "assistant", content: "Dolly comes with Mapped+.", timestamp: AT, notice: true },
    { role: "assistant", content: "", timestamp: AT + 1000, crisis: true },
  ]);
  assert.equal(blocks.filter((b) => b.kind === "speaker").length, 0);
  const notes = blocks.filter((b) => b.kind === "note").map((b) => b.text);
  assert.deepEqual(notes, ["[ Dolly comes with Mapped+. ]", "[ Crisis support resources were shown here. ]"]);
});

test("an empty conversation produces no blocks rather than an empty speaker", () => {
  assert.deepEqual(transcriptBlocks([{ role: "user", content: "   ", timestamp: AT }]), []);
});

/* ── Characters a PDF font can actually draw ────────────────────────────── */

test("astrology glyphs become the words Dolly would have said", () => {
  assert.equal(toPdfText("Saturn □ Moon"), "Saturn square Moon");
  assert.equal(toPdfText("☉ in ♓"), "Sun in Pisces");
  assert.equal(toPdfText("Venus ☌ Mars"), "Venus conjunct Mars");
  assert.equal(toPdfText("Mercury ℞"), "Mercury retrograde");
});

test("cp1252 typography is kept exactly — it is not approximated", () => {
  // These are the characters an em dash and a curly apostrophe would be
  // silently swapped for if the WinAnsi set were wrong by one entry.
  const typographic = "‘a’ “b” – — … • € ™ café 45°";
  assert.equal(toPdfText(typographic), typographic);
});

test("characters no built-in font can draw are dropped, never substituted", () => {
  const out = toPdfText("done ✨\u{1f52e} ok");
  assert.equal(out, "done ok");
  for (const ch of out) assert.ok((ch.codePointAt(0) ?? 0) <= 0xff, `kept ${ch}`);
});

test("control characters cannot break out into the PDF", () => {
  assert.equal(toPdfText("a\u0000b\u0007c"), "abc");
  assert.equal(toPdfText("a\r\nb"), "a\nb");
});

/* ── The file itself ────────────────────────────────────────────────────── */

test("the filename carries the conversation's own date", () => {
  assert.equal(transcriptFilename("2026-11-06"), "dolly-transcript-2026-11-06.pdf");
  // Not a date: falls back to today rather than to "undefined".
  assert.equal(
    transcriptFilename("rubbish", new Date(2026, 10, 6)),
    "dolly-transcript-2026-11-06.pdf",
  );
});

test("builds a real PDF, with the words in it and the JSON not", async () => {
  const msgs: TranscriptMessage[] = [
    { role: "user", content: "I keep putting it off.", timestamp: AT },
    { role: "assistant", content: `${META}\n\nThat is Saturn □ Moon doing what it does.`, timestamp: AT + 4000 },
  ];
  const blob = await buildTranscriptPdf({ messages: msgs, userName: "Taylor Corbett", day: "2026-11-06", now: new Date(2026, 10, 6) });
  assert.equal(blob.type, "application/pdf");

  const bytes = Buffer.from(await blob.arrayBuffer());
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");

  const drawn = pdfStrings(bytes).join("\n");
  assert.match(drawn, /I keep putting it off\./);
  assert.match(drawn, /That is Saturn square Moon doing what it does\./);
  assert.match(drawn, /Conversation with Dolly/);
  assert.match(drawn, /Taylor/);
  // The disclaimer travels with the file, not just with the screen.
  assert.match(drawn, /Dolly is an AI, not a person/);
  assert.ok(!drawn.includes('"kind"'), "Dolly's meta JSON reached the page");
});

test("a long conversation paginates, and every page is numbered", async () => {
  const long = Array.from({ length: 160 }, (_, i) => `Paragraph ${i} of a reply that keeps going.`).join(" ");
  const blob = await buildTranscriptPdf({
    messages: [{ role: "assistant", content: long, timestamp: AT }],
    now: new Date(2026, 10, 6),
  });
  const bytes = Buffer.from(await blob.arrayBuffer());
  const pages = (bytes.toString("latin1").match(/\/Type \/Page[^s]/g) ?? []).length;
  assert.ok(pages >= 2, `expected more than one page, got ${pages}`);

  const drawn = pdfStrings(bytes);
  for (let p = 1; p <= pages; p += 1) {
    assert.ok(drawn.includes(`${p} of ${pages}`), `page ${p} of ${pages} is not numbered`);
  }
  // Nothing drawn runs off the measure: the longest line has to fit the
  // text column, or splitTextToSize was handed the wrong width.
  for (const line of drawn) {
    assert.ok(line.length < 140, `line is too long to have been wrapped: ${line}`);
  }
});

/* ── It has to look like Mapped, not like a language model ──────────────── */

/** The light-theme value of a CSS custom property, as #rrggbb. */
function lightToken(name: string): string {
  const css = readFileSync("src/app/globals.css", "utf8");
  const block = css.slice(css.indexOf('[data-theme="light"] {'));
  const m = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(m, `globals.css has no light --${name}`);
  return m[1].toLowerCase();
}

/** An RGB triple declared in the transcript renderer, as #rrggbb. */
function pdfColour(name: string): string {
  const src = readFileSync("src/lib/dollyTranscript.ts", "utf8");
  const m = src.match(new RegExp(`const ${name}: RGB = \\[(\\d+), (\\d+), (\\d+)\\]`));
  assert.ok(m, `dollyTranscript has no ${name}`);
  return `#${[1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("")}`;
}

test("the transcript is drawn in Mapped's own colours, not approximated by eye", () => {
  // Pinned against globals.css rather than against literals, so the day
  // someone retunes the palette this says so instead of leaving the PDF a
  // shade behind the app it came from.
  assert.equal(pdfColour("PAPER"), lightToken("background"), "the paper is not Mapped's cream");
  assert.equal(pdfColour("INK"), lightToken("foreground"));
  assert.equal(pdfColour("MUTED"), lightToken("foreground-muted"));
  assert.equal(pdfColour("BRASS"), lightToken("brass"));
  assert.equal(pdfColour("PLUM"), lightToken("plum"));
  assert.equal(pdfColour("CARD"), lightToken("background-card"));
});

test("Dolly's words stay legible on her plum bubble", () => {
  // Cream on plum, as in the app, where her bubble is plum in BOTH themes.
  // Checked rather than assumed: this is the one place in the document where
  // light text sits on a dark fill, and getting it wrong prints a page of
  // near-invisible text that nobody sees until it is on paper.
  const lum = (hex: string) => {
    const c = [1, 3, 5].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a: string, b: string) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  assert.ok(ratio(pdfColour("CREAM"), pdfColour("PLUM")) >= 7, "Dolly's bubble text is hard to read");
  assert.ok(ratio(pdfColour("INK"), pdfColour("CARD")) >= 7, "the reader's own words are hard to read");
  assert.ok(ratio(pdfColour("BRASS"), pdfColour("PAPER")) >= 4.5, "the brass labels are hard to read");
  assert.ok(ratio(pdfColour("MUTED"), pdfColour("PAPER")) >= 4.5, "the muted lines are hard to read");
});

test("every page is painted cream, not left white", async () => {
  const blob = await buildTranscriptPdf({
    messages: Array.from({ length: 90 }, (_, i) => ({
      role: (i % 2 ? "assistant" : "user") as "assistant" | "user",
      content: `Message ${i}. ${"Something said at some length. ".repeat(6)}`,
      timestamp: AT + i * 60_000,
    })),
    now: new Date(2026, 10, 6),
  });
  const bytes = Buffer.from(await blob.arrayBuffer());
  const pages = (bytes.toString("latin1").match(/\/Type \/Page[^s]/g) ?? []).length;
  assert.ok(pages >= 3, `expected several pages, got ${pages}`);

  // jsPDF writes fills as "r g b rg", the components as 0-1 fractions at two
  // decimal places.
  const paper = pdfColour("PAPER")
    .slice(1)
    .match(/../g)!
    .map((h) => (parseInt(h, 16) / 255).toFixed(2))
    .join(" ");
  const fills = pdfStrings(bytes); // forces the streams to decompress
  assert.ok(fills.length > 0);

  const raw = bytes.toString("latin1");
  let painted = 0;
  for (const m of raw.matchAll(/[^d]stream\r?\n([\s\S]*?)endstream/g)) {
    let text: string;
    try { text = inflateSync(Buffer.from(m[1], "latin1")).toString("latin1"); } catch { continue; }
    if (!text.includes("Tj")) continue;
    if (text.includes(`${paper} rg`)) painted += 1;
  }
  assert.equal(painted, pages, `${pages - painted} page(s) print on white`);
});
