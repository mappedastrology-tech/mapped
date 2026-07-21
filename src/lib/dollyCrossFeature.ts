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
      const last = Array.isArray(hist) && hist.length ? hist[hist.length - 1] : null;
      if (last) {
        const name = last.card?.name || last.name || last.cardName || last.card || "";
        const when = (last.date || last.created_at || "").slice(0, 10);
        const rev = last.reversed ? " (reversed)" : "";
        const note = last.notes || last.meaning || "";
        tarotContext = name
          ? `${name}${rev}${when ? ` — pulled ${when}` : ""}${note ? `. Their note: ${String(note).slice(0, 160)}` : ""}`
          : "";
      }
    }
  } catch { /* ignore */ }
  return { journalContext, tarotContext };
}
