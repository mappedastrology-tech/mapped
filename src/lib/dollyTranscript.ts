/**
 * A Dolly conversation, as a PDF you can keep.
 *
 * These are not throwaway chats. People bring Dolly a death in the family, a
 * decision about a job, the same worry three months running — and the only
 * copy lived in localStorage and a Supabase row, behind an account, inside an
 * app. There was no way to take it out: not to re-read on a laptop, not to
 * bring to a therapist, not to keep if the subscription lapses.
 *
 * Deliberately TEXT, not a screenshot of the thread. html2canvas is already a
 * dependency and would have been quicker, but it produces one enormous image
 * per screen: nothing is selectable, nothing is searchable, a screen reader
 * gets nothing, and a long conversation becomes a dozen megabytes of pixels
 * that cannot be split across pages at a sensible place. A transcript's whole
 * value is the words.
 *
 * jsPDF is imported dynamically by `buildTranscriptPdf` so none of it reaches
 * the initial bundle — it loads the first time someone saves a transcript and
 * never otherwise. Everything above that call is plain, synchronous and
 * testable without a DOM.
 */

import { dollyBody } from "./dollyReply";

export interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  /** A product rule (a limit, a plan boundary) rather than something Dolly said. */
  notice?: boolean;
  /** The crisis support card. It carries no text of its own. */
  crisis?: boolean;
}

export interface TranscriptOptions {
  messages: TranscriptMessage[];
  /** The person's name, for the title page. */
  userName?: string;
  /** YYYY-MM-DD the conversation belongs to, when it is known. */
  day?: string;
  /** Injected in tests so the output is deterministic. */
  now?: Date;
}

/* ═══════════════════════════════════════════
   Text that a PDF's built-in fonts can hold
   ═══════════════════════════════════════════ */

/**
 * The standard PDF fonts are encoded in WinAnsi (cp1252), which is Latin-1
 * plus 27 typographic extras. Hand it a character outside that and you don't
 * get a warning — you get a different letter, silently, in the middle of
 * someone's sentence.
 *
 * Embedding a Unicode font instead would mean shipping a TTF for the sake of a
 * handful of symbols. Dolly's prose is words; the glyphs that do turn up are
 * astrological, and every one of them has a name that reads better in a
 * transcript anyway. "Saturn square Moon" is what she would have said out
 * loud.
 */
const GLYPH_WORDS: Record<string, string> = {
  // Signs
  "♈": "Aries", "♉": "Taurus", "♊": "Gemini", "♋": "Cancer",
  "♌": "Leo", "♍": "Virgo", "♎": "Libra", "♏": "Scorpio",
  "♐": "Sagittarius", "♑": "Capricorn", "♒": "Aquarius", "♓": "Pisces",
  // Bodies and points
  "☉": "Sun", "☼": "Sun", "☽": "Moon", "☾": "Moon", "☿": "Mercury",
  "♀": "Venus", "♂": "Mars", "♃": "Jupiter", "♄": "Saturn",
  "♅": "Uranus", "♆": "Neptune", "♇": "Pluto",
  "⚷": "Chiron", "⚳": "Ceres", "⚴": "Pallas", "⚵": "Juno", "⚶": "Vesta",
  "☊": "North Node", "☋": "South Node", "⚸": "Lilith",
  "⊕": "Earth", "℞": "retrograde",
  // Aspects
  "☌": "conjunct", "☍": "opposite", "□": "square", "△": "trine",
  "⚹": "sextile", "⚻": "quincunx", "⚺": "semisextile",
};

/**
 * The 27 characters cp1252 adds in 0x80-0x9F, where Latin-1 has nothing.
 *
 * Written as code points, not as the glyphs themselves. Several of them are
 * invisible or all but identical to a neighbour in a source file, and a single
 * slip here would silently drop every curly apostrophe out of every transcript.
 */
const WIN_ANSI_EXTRAS = new Set([
  "\u20ac", "\u201a", "\u0192", "\u201e", "\u2026", "\u2020", "\u2021",
  "\u02c6", "\u2030", "\u0160", "\u2039", "\u0152", "\u017d", "\u2018",
  "\u2019", "\u201c", "\u201d", "\u2022", "\u2013", "\u2014", "\u02dc",
  "\u2122", "\u0161", "\u203a", "\u0153", "\u017e", "\u0178",
]);

/**
 * Everything a built-in PDF font can actually draw, and nothing else.
 *
 * Unknown symbols are dropped rather than turned into "?" — a row of question
 * marks looks like the file is broken, where a missing decorative star looks
 * like nothing at all. Tabs become spaces; CRLF becomes LF so the line
 * splitter downstream sees one kind of break.
 */
export function toPdfText(input: string): string {
  // U+2100-U+2BFF covers the letterlike symbols, geometric shapes and every
  // sign, planet and aspect glyph in the map above. Escapes, not the glyphs
  // themselves, so the range cannot be broken by an editor or a copy-paste.
  const mapped = input.replace(/[\u2100-\u2bff]/g, (ch) => GLYPH_WORDS[ch] ?? ch);
  let out = "";
  for (const ch of mapped) {
    if (ch === "\n") { out += "\n"; continue; }
    if (ch === "\t") { out += "  "; continue; }
    const code = ch.codePointAt(0) ?? 0;
    // C0 controls carry no text and some of them break PDF strings.
    if (code < 0x20) continue;
    if (code <= 0xff || WIN_ANSI_EXTRAS.has(ch)) { out += ch; continue; }
    // Anything else: dropped, leaving a space so words don't fuse together.
    out += " ";
  }
  return out
    .replace(/\r\n?/g, "\n")
    .replace(/[  ]{2,}/g, " ")
    .replace(/ +\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ═══════════════════════════════════════════
   The document, before anything is drawn
   ═══════════════════════════════════════════ */

/** A divider is "you came back", not "you paused" — same hour as the thread. */
const GAP_MS = 60 * 60 * 1000;

export type TranscriptBlock =
  /** A date/time divider, where the conversation resumed after a gap. */
  | { kind: "stamp"; text: string }
  /** Who is about to speak, and when. */
  | { kind: "speaker"; who: "you" | "dolly"; text: string }
  /** One paragraph of what they said. */
  | { kind: "body"; who: "you" | "dolly"; text: string }
  /** The app talking: a limit, a plan boundary, a card that was shown. */
  | { kind: "note"; text: string };

function stampOf(ts: number): string {
  const d = new Date(ts);
  return `${d.toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })}, ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function timeOf(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * The conversation as an ordered list of things to draw.
 *
 * Pulled out of the renderer on purpose: this is where every decision about
 * what the transcript SAYS lives, and it can be asserted on without a PDF
 * library, a canvas or a browser.
 */
export function transcriptBlocks(messages: TranscriptMessage[], youLabel = "You"): TranscriptBlock[] {
  const blocks: TranscriptBlock[] = [];
  let prevTs: number | null = null;

  /**
   * Called only once we know this message is going to put something on the
   * page. Stamping first would leave a date heading standing over nothing
   * whenever a message turned out to be empty — which is exactly what an
   * aborted reply leaves behind in a saved conversation.
   */
  const stamp = (ts: number) => {
    if (!ts) return;
    if (prevTs === null || ts - prevTs > GAP_MS) {
      blocks.push({ kind: "stamp", text: stampOf(ts) });
    }
    prevTs = ts;
  };

  for (const msg of messages) {
    if (msg.crisis) {
      stamp(msg.timestamp);
      // The card is a list of local helplines rendered by the app, not words
      // from Dolly. Saying so beats a blank gap where the reader remembers
      // something having been there.
      blocks.push({ kind: "note", text: "[ Crisis support resources were shown here. ]" });
      continue;
    }
    if (msg.notice) {
      const notice = toPdfText(msg.content);
      if (!notice) continue;
      stamp(msg.timestamp);
      blocks.push({ kind: "note", text: `[ ${notice} ]` });
      continue;
    }

    // Dolly opens every reply with one line of JSON carrying her chips and
    // headline. dollyBody is what the bubble renders, so it is what the
    // transcript records — raw JSON must never reach the page.
    const raw = msg.role === "assistant" ? dollyBody(msg.content) : msg.content;
    const text = toPdfText(raw);
    if (!text) continue;

    stamp(msg.timestamp);
    const who = msg.role === "assistant" ? "dolly" : "you";
    const name = who === "dolly" ? "Dolly" : youLabel;
    blocks.push({
      kind: "speaker",
      who,
      text: msg.timestamp ? `${name} · ${timeOf(msg.timestamp)}` : name,
    });
    for (const para of text.split("\n").map((p) => p.trim()).filter(Boolean)) {
      blocks.push({ kind: "body", who, text: para });
    }
  }
  return blocks;
}

/** `dolly-transcript-2026-11-06.pdf` — sorts by date in any file browser. */
export function transcriptFilename(day?: string, now: Date = new Date()): string {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(day ?? "")
    ? (day as string)
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return `dolly-transcript-${iso}.pdf`;
}

/* ═══════════════════════════════════════════
   Drawing it
   ═══════════════════════════════════════════ */

/**
 * The transcript is meant to look like it came from Mapped.
 *
 * The first version was black Helvetica on white paper — correct, legible,
 * and indistinguishable from anything else a language model has ever printed.
 * It had none of the app in it. Someone who saves a conversation with Dolly is
 * keeping something personal; handing them a generic dump of their own words
 * is a worse gift than it looks.
 *
 * So it is drawn the way the thread is drawn: cream paper, Dolly in her plum
 * bubble with cream ink, the reader's own words in a white card on the right,
 * brass rules and brass small-caps, and the Mapped star at the top and between
 * the days. All of it from the app's light-theme tokens rather than
 * approximated by eye.
 *
 * Typefaces are the built-in PDF ones, deliberately. Mapped's own faces (Le
 * Jour Serif, Bodoni Moda, DM Sans) ship as woff2, which a PDF cannot embed —
 * they would have to be converted and bundled, their licences would have to
 * cover PDF embedding, and every transcript would carry the font's bytes.
 * Times stands in for the serif and follows Mapped's own rule that body copy
 * on light surfaces is a serif; Helvetica carries the small-caps labels, which
 * is what --font-ui does in the app.
 */

/** A4 in points, which is jsPDF's unit here. */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;
/** Where the footer starts, and therefore where the content has to stop. */
const BOTTOM = PAGE_H - 70;

/** A bubble never runs the full measure — the asymmetry is what says "chat". */
const BUBBLE_MAX = CONTENT_W * 0.86;
const PAD_X = 15;
const PAD_Y = 12;
const RADIUS = 13;

const BODY_SIZE = 10.3;
const BODY_LEAD = 15;
/** Between paragraphs inside one bubble. */
const PARA_GAP = 6;

type RGB = [number, number, number];

/** Mapped's light theme, straight from globals.css. */
const PAPER: RGB = [245, 240, 225];   // --background
const CARD: RGB = [255, 255, 255];    // --background-card
const INK: RGB = [26, 24, 21];        // --foreground
const MUTED: RGB = [101, 94, 78];     // --foreground-muted
const BRASS: RGB = [126, 101, 38];    // --brass
const PLUM: RGB = [74, 37, 64];       // --plum
const CREAM: RGB = [240, 230, 210];   // --cream (on plum)
const RULE: RGB = [216, 208, 192];    // --border-card

/** jsPDF's surface, as much of it as this file uses. */
interface Doc {
  addPage(): void;
  setPage(n: number): void;
  getNumberOfPages(): number;
  setFont(name: string, style?: string): void;
  setFontSize(n: number): void;
  setTextColor(r: number, g: number, b: number): void;
  setFillColor(r: number, g: number, b: number): void;
  setDrawColor(r: number, g: number, b: number): void;
  setLineWidth(n: number): void;
  text(text: string, x: number, y: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  rect(x: number, y: number, w: number, h: number, style?: string): void;
  roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string): void;
  lines(lines: number[][], x: number, y: number, scale?: number[], style?: string, closed?: boolean): void;
  splitTextToSize(text: string, width: number): string[];
  getTextWidth(text: string): number;
  output(type: string): unknown;
  setLineHeightFactor(n: number): void;
}

/**
 * Mapped's four-pointed star, drawn rather than typed.
 *
 * The app's ✦ is not in any encoding a built-in PDF font can reach, and
 * embedding a font for one glyph is absurd — so it is eight line segments.
 */
function star(doc: Doc, cx: number, cy: number, r: number, color: RGB) {
  const w = r * 0.22;
  doc.setFillColor(...color);
  doc.lines(
    [
      [w, r - w], [r - w, w], [w - r, w], [-w, r - w],
      [-w, w - r], [w - r, -w], [r - w, -w], [w, w - r],
    ],
    cx,
    cy - r,
    [1, 1],
    "F",
    true,
  );
}

/**
 * Build the PDF.
 *
 * Returns a Blob rather than saving it: handing the file to the person is
 * `saveOrShareFile`'s job, and it has to be, because a synthetic `<a download>`
 * does nothing at all inside WKWebView — which is three of the four platforms
 * this ships to.
 */
export async function buildTranscriptPdf(opts: TranscriptOptions): Promise<Blob> {
  const { messages, userName, day, now = new Date() } = opts;
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true }) as unknown as Doc;
  doc.setLineHeightFactor(1.3);

  const first = (userName ?? "").trim().split(/\s+/)[0] ?? "";
  const youLabel = toPdfText(first) || "You";
  const blocks = transcriptBlocks(messages, youLabel);

  let y = MARGIN;

  /** Cream paper, edge to edge. Every page, before anything is drawn on it. */
  const paint = () => {
    doc.setFillColor(...PAPER);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  };

  const newPage = () => {
    doc.addPage();
    paint();
    y = MARGIN;
  };

  /** Make room for `need` points, turning the page if there isn't any. */
  const room = (need: number) => {
    if (y + need > BOTTOM) newPage();
  };

  paint();

  /** Wrap `text` at `width` in the given face, and report how tall it will be. */
  const wrap = (text: string, width: number, size: number, font: string, style: string) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    return doc.splitTextToSize(text, width);
  };

  /** A centred line of small-caps, with the brass star for company. */
  const centred = (text: string, size: number, color: RGB, font = "helvetica", style = "bold") => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const w = doc.getTextWidth(text);
    doc.text(text, (PAGE_W - w) / 2, y + size);
    return w;
  };

  /* ── Title ──────────────────────────────────────────────────────────── */

  star(doc, MARGIN + 5, y + 5, 5.5, BRASS);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRASS);
  doc.text("M A P P E D", MARGIN + 18, y + 8.5);
  y += 28;

  doc.setFont("times", "italic");
  doc.setFontSize(23);
  doc.setTextColor(...INK);
  doc.text("Conversation with Dolly", MARGIN, y + 17);
  y += 34;

  // When it happened and when this copy was taken. Usually the same day, and
  // then saying both is noise — but a transcript pulled out of the history
  // list months later is exactly when the reader needs to know which
  // conversation they are holding.
  const longDate = (d: Date) =>
    d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const saved = longDate(now);
  const held = /^\d{4}-\d{2}-\d{2}$/.test(day ?? "")
    // Parsed as local midnight, not through Date("YYYY-MM-DD"), which is read
    // as UTC and lands on the previous day for anyone west of Greenwich.
    ? longDate(new Date(Number(day!.slice(0, 4)), Number(day!.slice(5, 7)) - 1, Number(day!.slice(8, 10))))
    : null;
  const turns = messages.filter((m) => !m.notice && !m.crisis).length;
  const subtitle = [
    youLabel === "You" ? null : youLabel,
    held && held !== saved ? `${held}, saved ${saved}` : `Saved ${saved}`,
    `${turns} message${turns === 1 ? "" : "s"}`,
  ].filter(Boolean).join("  ·  ");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(subtitle, MARGIN, y + 9);
  y += 20;

  doc.setDrawColor(...BRASS);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 22;

  /* ── The conversation ───────────────────────────────────────────────── */

  /**
   * One speaker's turn, as a bubble.
   *
   * Paragraphs stay inside one bubble, the way they do on screen. A turn
   * longer than a page is split, and each piece gets its own bubble — which
   * reads honestly as "this carries on" rather than as a rectangle sliced by
   * the paper's edge.
   */
  const drawBubble = (paras: string[], who: "you" | "dolly") => {
    const mine = who === "you";
    const inner = BUBBLE_MAX - PAD_X * 2;
    const font = "times";

    // Wrap first, then size the bubble to the longest line it actually has —
    // a three-word answer should be a three-word bubble, not a full-width bar.
    const wrapped = paras.map((t) => wrap(t, inner, BODY_SIZE, font, "normal"));
    const flat: { text: string; gapAfter: boolean }[] = [];
    wrapped.forEach((lines, i) => {
      lines.forEach((text, j) => {
        flat.push({ text, gapAfter: j === lines.length - 1 && i < wrapped.length - 1 });
      });
    });
    doc.setFont(font, "normal");
    doc.setFontSize(BODY_SIZE);
    const widest = flat.reduce((m, l) => Math.max(m, doc.getTextWidth(l.text)), 0);
    const boxW = Math.min(BUBBLE_MAX, Math.max(widest + PAD_X * 2, 68));

    let i = 0;
    while (i < flat.length) {
      // At least two lines of a turn travel together; one orphan line in its
      // own bubble at the foot of a page looks like a mistake.
      const minimum = PAD_Y * 2 + BODY_LEAD * Math.min(2, flat.length - i);
      if (y + minimum > BOTTOM) newPage();

      // How many lines fit in what is left of this page.
      let count = 0;
      let used = PAD_Y * 2;
      while (i + count < flat.length) {
        const add = BODY_LEAD + (flat[i + count].gapAfter ? PARA_GAP : 0);
        if (y + used + add > BOTTOM) break;
        used += add;
        count += 1;
      }
      if (count === 0) count = 1;

      let h = PAD_Y * 2;
      for (let k = 0; k < count; k += 1) h += BODY_LEAD + (flat[i + k].gapAfter ? PARA_GAP : 0);

      const x = mine ? PAGE_W - MARGIN - boxW : MARGIN;
      if (mine) {
        // The reader's own words: a white card with a hairline, which is what
        // --background-card over --background looks like.
        doc.setFillColor(...CARD);
        doc.setDrawColor(...RULE);
        doc.setLineWidth(0.6);
        doc.roundedRect(x, y, boxW, h, RADIUS, RADIUS, "FD");
      } else {
        // Dolly's bubble is plum in BOTH themes in the app, so it is plum here.
        doc.setFillColor(...PLUM);
        doc.roundedRect(x, y, boxW, h, RADIUS, RADIUS, "F");
      }

      doc.setFont(font, "normal");
      doc.setFontSize(BODY_SIZE);
      doc.setTextColor(...(mine ? INK : CREAM));
      let ty = y + PAD_Y;
      for (let k = 0; k < count; k += 1) {
        doc.text(flat[i + k].text, x + PAD_X, ty + BODY_SIZE);
        ty += BODY_LEAD + (flat[i + k].gapAfter ? PARA_GAP : 0);
      }

      y += h;
      i += count;
      if (i < flat.length) y += 5;
    }
  };

  /** "DOLLY · 9:14 PM", over the bubble, on the bubble's own side. */
  const drawSpeaker = (text: string, who: "you" | "dolly") => {
    room(BODY_LEAD * 3);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);
    doc.setTextColor(...(who === "dolly" ? PLUM : BRASS));
    const w = doc.getTextWidth(text);
    doc.text(text, who === "you" ? PAGE_W - MARGIN - w : MARGIN, y + 8);
    y += 13;
  };

  if (blocks.length === 0) {
    doc.setFont("times", "italic");
    doc.setFontSize(BODY_SIZE);
    doc.setTextColor(...MUTED);
    doc.text("This conversation is empty.", MARGIN, y + BODY_SIZE);
    y += BODY_LEAD;
  }

  // Consecutive body blocks after a speaker belong to that speaker's turn, and
  // share one bubble — the way they share one bubble on screen.
  for (let b = 0; b < blocks.length; b += 1) {
    const block = blocks[b];

    if (block.kind === "stamp") {
      y += 12;
      room(30);
      // A rule either side of the date, with the star sitting in the gap.
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.6);
      const label = block.text.toUpperCase();
      const w = doc.getTextWidth(label);
      const mid = PAGE_W / 2;
      doc.setDrawColor(...RULE);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, y + 4, mid - w / 2 - 16, y + 4);
      doc.line(mid + w / 2 + 16, y + 4, PAGE_W - MARGIN, y + 4);
      star(doc, mid - w / 2 - 9, y + 4, 2.6, BRASS);
      star(doc, mid + w / 2 + 9, y + 4, 2.6, BRASS);
      centred(label, 7.6, MUTED);
      y += 20;
      continue;
    }

    if (block.kind === "note") {
      y += 8;
      const lines = wrap(block.text, CONTENT_W - 60, 9.2, "times", "italic");
      room(lines.length * 13 + 6);
      doc.setFont("times", "italic");
      doc.setFontSize(9.2);
      doc.setTextColor(...MUTED);
      for (const line of lines) {
        const w = doc.getTextWidth(line);
        doc.text(line, (PAGE_W - w) / 2, y + 9.2);
        y += 13;
      }
      y += 6;
      continue;
    }

    if (block.kind === "speaker") {
      y += 11;
      drawSpeaker(block.text, block.who);
      const paras: string[] = [];
      while (b + 1 < blocks.length && blocks[b + 1].kind === "body") {
        b += 1;
        paras.push(blocks[b].text);
      }
      if (paras.length) drawBubble(paras, block.who);
      continue;
    }

    // A body block with no speaker before it — can't happen today, but it
    // should print rather than disappear if it ever does.
    drawBubble([block.text], block.who);
  }

  /* ── What this is, said on the page itself ──────────────────────────── */

  y += 20;
  room(56);
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 14;
  const closing = wrap(
    "Dolly is an AI, not a person. She uses astrology as a lens, not a prediction — you always have "
      + "agency. This transcript is a record of a conversation: not advice, not a diagnosis, not a forecast.",
    CONTENT_W,
    8.6,
    "times",
    "italic",
  );
  doc.setFont("times", "italic");
  doc.setFontSize(8.6);
  doc.setTextColor(...MUTED);
  for (const line of closing) {
    doc.text(line, MARGIN, y + 8.6);
    y += 12;
  }

  /* ── Footers, once the page count is finally known ──────────────────── */

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, PAGE_H - 50, PAGE_W - MARGIN, PAGE_H - 50);

    star(doc, MARGIN + 3, PAGE_H - 36, 3.2, BRASS);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.4);
    doc.setTextColor(...BRASS);
    doc.text("M A P P E D", MARGIN + 12, PAGE_H - 33.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(...MUTED);
    const label = `${p} of ${pages}`;
    doc.text(label, PAGE_W - MARGIN - doc.getTextWidth(label), PAGE_H - 33.5);
  }

  return doc.output("blob") as Blob;
}
