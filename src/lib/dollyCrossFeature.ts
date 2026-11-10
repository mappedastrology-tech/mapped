import { getTarotHistoryKey } from "@/lib/completionSync";

/**
 * How much journal text travels with a Dolly message, in characters.
 *
 * It used to be five entries at 160 characters each — 800 characters, which
 * is not an entry, it is the opening sentence of one. Dolly was shown the
 * first line of five mornings and asked to talk about someone's inner life,
 * and she did the honest thing with it: she told them how little she could
 * see. "I can only see two of your entries" reads as *your entries are
 * missing*, even when two is all there are.
 *
 * So she gets the whole journal, and the block says plainly whether it is the
 * whole journal. The budget is the backstop for the person who has written
 * every day for three years, and it is affordable because this block now
 * travels in the CACHED half of the prompt: it changes when they write an
 * entry, not between messages, so a long conversation pays for it once.
 */
const JOURNAL_BUDGET = 10_000;

/** One entry's own ceiling, so a single essay cannot crowd out a year. */
const JOURNAL_ENTRY_MAX = 2_000;

/** The fields of a journal entry this is willing to look at. */
interface JournalLike {
  text?: string;
  content?: string;
  title?: string;
  mood?: string;
  prompt_text?: string | null;
  prompt?: string;
  created_at?: string;
  date?: string;
  /** Written to be released and never stored. Never sent. */
  is_burn?: boolean;
  tags?: { moonPhase?: string; planetaryDay?: string; timeOfDay?: string };
}

const dayOf = (e: JournalLike) => (e.created_at || e.date || "").slice(0, 10);

/** One entry, written out the way a person would read it. */
function renderEntry(e: JournalLike): string {
  const head = [dayOf(e) || "undated"];
  if (e.title?.trim()) head.push(`"${e.title.trim()}"`);
  const sky = [e.tags?.moonPhase, e.tags?.planetaryDay, e.tags?.timeOfDay].filter(Boolean).join(", ");
  if (sky) head.push(`(${sky})`);
  if (e.mood?.trim()) head.push(`[feeling: ${e.mood.trim()}]`);

  const lines = [`### ${head.join(" — ")}`];
  const asked = (e.prompt_text || e.prompt || "").trim();
  // "(free write)" is the placeholder the journal stores when there was no
  // prompt; repeating it to the model is noise.
  if (asked && asked !== "(free write)") lines.push(`Prompt they answered: ${asked}`);

  const body = (e.text || e.content || "").trim();
  lines.push(body.length > JOURNAL_ENTRY_MAX ? `${body.slice(0, JOURNAL_ENTRY_MAX)}\n[…this entry continues]` : body);
  return lines.join("\n");
}

/**
 * The journal, as Dolly sees it.
 *
 * Exported for the test. The first line is the important one: it states the
 * true total and whether what follows is all of it, so Dolly never has to
 * guess at the shape of her own access — guessing at it is what produced
 * "I can only see two."
 *
 * Photos are never included. They are stored on-device as base64 data URLs
 * and would be megabytes of nothing the model can use.
 */
export function buildJournalContext(raw: unknown, budget = JOURNAL_BUDGET): string {
  if (!Array.isArray(raw)) return "";
  const entries = (raw as JournalLike[])
    // Burn entries are written to be let go of — "your words have left no
    // trace" — and are never stored locally or pushed anywhere. Filtered here
    // too, so the promise does not depend on one call site staying correct.
    .filter((e) => e && !e.is_burn && (e.text || e.content || "").trim())
    .sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());

  if (entries.length === 0) return "";

  const included: string[] = [];
  let used = 0;
  for (const entry of entries) {
    const rendered = renderEntry(entry);
    // Always include the newest one, however long it is, rather than
    // reporting a journal and showing none of it.
    if (included.length > 0 && used + rendered.length > budget) break;
    included.push(rendered);
    used += rendered.length;
  }

  const total = entries.length;
  const shown = included.length;
  const plural = total === 1 ? "entry" : "entries";
  const header =
    shown === total
      ? `They have ${total} journal ${plural} in total, and every one of them is below, newest first.`
      : `They have ${total} journal entries in total, going back to ${dayOf(entries[total - 1]) || "an earlier date"}. `
        + `The ${shown} most recent are below in full, newest first; the older ones exist and are theirs to bring up.`;

  return `${header}\n\n${included.join("\n\n")}`;
}

/**
 * Gather the journal + latest tarot/oracle pull from local storage so Dolly
 * has the same cross-feature context on web and mobile. Reads only client
 * storage; safe to call in the browser. Returns empty strings when nothing is
 * stored.
 */
export function gatherCrossFeatureContext(userId: string | null): { journalContext: string; tarotContext: string } {
  let journalContext = "";
  let tarotContext = "";
  try {
    const raw = localStorage.getItem("mapped:journal-entries");
    if (raw) journalContext = buildJournalContext(JSON.parse(raw));
  } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem(getTarotHistoryKey(userId));
    if (raw) {
      const hist = JSON.parse(raw);
      // History is stored newest-first, so the latest pull is the first element.
      const last: Record<string, unknown> | null = Array.isArray(hist) && hist.length ? hist[0] : null;
      if (last) {
        const when = String((last.date as string) || (last.created_at as string) || "").slice(0, 10);
        const cards = last.cards;
        if (Array.isArray(cards) && cards.length) {
          // Multi-card spread: summarize each card and its position.
          const list = (cards as Array<Record<string, unknown>>)
            .map((c) => {
              const pos = c.position ? `${String(c.position)}: ` : "";
              const rev = c.reversed ? " (reversed)" : "";
              return `${pos}${String(c.name ?? "")}${rev}`.trim();
            })
            .filter((s) => s.length > 1)
            .join("; ");
          const spread = last.spreadName ? `${String(last.spreadName)} — ` : "";
          tarotContext = list ? `${spread}${list}${when ? ` (pulled ${when})` : ""}` : "";
        } else {
          // Single-card / legacy shape.
          const cardObj = last.card as Record<string, unknown> | undefined;
          const name =
            (cardObj?.name as string) || (last.name as string) || (last.cardName as string) ||
            (typeof last.card === "string" ? last.card : "") || "";
          const rev = last.reversed ? " (reversed)" : "";
          const note = (last.notes as string) || (last.meaning as string) || "";
          tarotContext = name
            ? `${name}${rev}${when ? ` — pulled ${when}` : ""}${note ? `. Their note: ${String(note).slice(0, 160)}` : ""}`
            : "";
        }
      }
    }
  } catch { /* ignore */ }
  return { journalContext, tarotContext };
}
