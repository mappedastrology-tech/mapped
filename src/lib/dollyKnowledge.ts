import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Distilled, attributed reference passages that power Dolly's retrieval.
 * Rows live in the `kb_passages` table and are searched via the
 * `search_kb_passages` Postgres function (full-text ranked).
 */
export interface KbPassage {
  id: string;
  domain: string;
  topic: string | null;
  title: string;
  body: string;
  summary: string | null;
  keywords: string[];
  entities: string[];
  source_title: string | null;
  source_author: string | null;
  source_year: number | null;
  public_domain: boolean;
}

/**
 * Retrieve the most relevant distilled passages for a Dolly question and
 * format them as a context block. Returns "" when nothing relevant is found
 * or on any error (retrieval must never break a conversation).
 */
export async function retrieveDollyKnowledge(
  supabase: SupabaseClient,
  message: string,
  opts: { domain?: string | null; limit?: number } = {}
): Promise<string> {
  const q = (message || "").slice(0, 400).trim();
  if (!q) return "";
  try {
    const { data, error } = await supabase.rpc("search_kb_passages", {
      q,
      d: opts.domain ?? null,
      lim: opts.limit ?? 5,
    });
    if (error || !Array.isArray(data) || data.length === 0) return "";
    const lines = (data as KbPassage[]).map((p) => `- **${p.title}**: ${p.body}`);
    return (
      `\n## Relevant background knowledge\n` +
      `${lines.join("\n")}\n` +
      `This is your own understanding — weave it in naturally as part of what you know. ` +
      `Do NOT cite sources, books, or authors, and do not quote it verbatim. ` +
      `Where traditions differ, speak to it as perspective, and always tie back to their chart.`
    );
  } catch {
    return "";
  }
}
