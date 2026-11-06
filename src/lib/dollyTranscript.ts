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

/** A4 in points, which is jsPDF's unit here. */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;
const TEXT_W = PAGE_W - MARGIN * 2;
/** Where the footer starts, and therefore where the text has to stop. */
const BOTTOM = PAGE_H - 74;

const BODY_SIZE = 10.5;
const BODY_LEAD = 15.5;

/** Print colours, sampled from the app rather than invented. */
const INK: [number, number, number] = [42, 35, 32];
const INK_SOFT: [number, number, number] = [120, 110, 100];
const BRASS: [number, number, number] = [150, 118, 46];
const PLUM: [number, number, number] = [92, 70, 128];
const RULE: [number, number, number] = [214, 206, 194];

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
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  doc.setLineHeightFactor(1.3);

  const first = (userName ?? "").trim().split(/\s+/)[0] ?? "";
  const youLabel = toPdfText(first) || "You";
  const blocks = transcriptBlocks(messages, youLabel);

  let y = MARGIN;

  /** Make room for `need` points, starting a page if there isn't any. */
  const room = (need: number) => {
    if (y + need <= BOTTOM) return;
    doc.addPage();
    y = MARGIN;
  };

  const write = (text: string, size: number, color: [number, number, number], style = "normal", font = "helvetica") => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, TEXT_W) as string[];
    const lead = size * 1.45;
    // Keep at least two lines with whatever introduced them, so a paragraph
    // never starts with one orphan line at the foot of a page.
    room(Math.min(lines.length, 2) * lead);
    for (const line of lines) {
      room(lead);
      doc.text(line, MARGIN, y + size);
      y += lead;
    }
  };

  /* ── Title ── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRASS);
  doc.text("M A P P E D", MARGIN, y + 8);
  y += 24;

  doc.setFont("times", "italic");
  doc.setFontSize(21);
  doc.setTextColor(...INK);
  doc.text("Conversation with Dolly", MARGIN, y + 16);
  y += 32;

  // When the conversation happened, and when this copy was taken. They are
  // usually the same day and then saying both is noise — but a transcript
  // pulled out of the history list months later is exactly the case where the
  // reader needs to know which conversation they are holding.
  const longDate = (d: Date) =>
    d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const saved = longDate(now);
  const held = /^\d{4}-\d{2}-\d{2}$/.test(day ?? "")
    // Parsed as local midnight, not through Date("YYYY-MM-DD"), which is read
    // as UTC and lands on the previous day for anyone west of Greenwich.
    ? longDate(new Date(Number(day!.slice(0, 4)), Number(day!.slice(5, 7)) - 1, Number(day!.slice(8, 10))))
    : null;
  const turns = messages.filter((m) => !m.notice && !m.crisis).length;
  const parts = [
    youLabel === "You" ? null : youLabel,
    held && held !== saved ? `${held}, saved ${saved}` : `Saved ${saved}`,
    `${turns} message${turns === 1 ? "" : "s"}`,
  ].filter(Boolean);
  write(parts.join(" · "), 9, INK_SOFT);
  y += 6;
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 20;

  /* ── The conversation ── */
  if (blocks.length === 0) {
    write("This conversation is empty.", BODY_SIZE, INK_SOFT, "italic");
  }
  for (const block of blocks) {
    if (block.kind === "stamp") {
      y += 8;
      write(block.text.toUpperCase(), 8, INK_SOFT, "bold");
      y += 4;
    } else if (block.kind === "speaker") {
      y += 10;
      // Keep the name with the first lines of what they said.
      room(BODY_LEAD * 3);
      write(block.text, 8.5, block.who === "dolly" ? PLUM : BRASS, "bold");
      y += 2;
    } else if (block.kind === "note") {
      y += 6;
      write(block.text, 9.5, INK_SOFT, "italic");
      y += 2;
    } else {
      write(block.text, BODY_SIZE, INK, "normal");
      y += 4;
    }
  }

  /* ── What this is, said on the page itself ── */
  y += 14;
  room(40);
  doc.setDrawColor(...RULE);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 12;
  write(
    "Dolly is an AI, not a person. She uses astrology as a lens, not a prediction — you always have agency. "
      + "This transcript is a record of a conversation, not advice, a diagnosis or a forecast.",
    8.5,
    INK_SOFT,
    "italic",
  );

  /* ── Footers, once the page count is finally known ── */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...INK_SOFT);
    doc.text("Mapped · Dolly", MARGIN, PAGE_H - 34);
    const label = `${p} of ${pages}`;
    doc.text(label, PAGE_W - MARGIN - doc.getTextWidth(label), PAGE_H - 34);
  }

  return doc.output("blob") as Blob;
}
