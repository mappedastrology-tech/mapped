import { getTarotHistoryKey } from "@/lib/completionSync";

/**
 * Gather recent journal + latest tarot/oracle pull from local storage so Dolly
 * has the same cross-feature context on web and mobile. Reads only client
 * storage; safe to call in the browser. Returns empty strings when nothing is
 * stored.
 */
export function gatherCrossFeatureContext(userId: string | null): { journalContext: string; tarotContext: string } {
  let journalContext = "";
  let tarotContext = "";
  try {
    const raw = localStorage.getItem("mapped:journal-entries");
    if (raw) {
      const entries = JSON.parse(raw) as Array<{ text?: string; content?: string; mood?: string; created_at?: string; date?: string }>;
      const recent = [...entries]
        .sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime())
        .slice(0, 5);
      journalContext = recent
        .map((e) => {
          const when = (e.created_at || e.date || "").slice(0, 10);
          const mood = e.mood ? ` [${e.mood}]` : "";
          const bodyText = (e.text || e.content || "").replace(/\s+/g, " ").trim().slice(0, 160);
          return `- ${when}${mood}: ${bodyText}`;
        })
        .filter((l) => l.length > 8)
        .join("\n");
    }
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
