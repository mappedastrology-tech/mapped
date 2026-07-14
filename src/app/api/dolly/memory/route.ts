import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FALLBACK_MODEL } from "@/lib/aiModel";
import { getAuthedContext } from "@/lib/apiAuth";

export const runtime = "edge";

/**
 * POST /api/dolly/memory
 *
 * Folds the latest conversation turns into a small, evolving per-user memory
 * summary (stored in the dolly_memory table), so Dolly remembers what's going
 * on in someone's life across sessions. Called fire-and-forget by the client
 * after each assistant reply. Uses the cheap/fast model.
 */

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const ctx = await getAuthedContext(request);
  if (!ctx) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const { userId, supabase } = ctx;

  let recent: Turn[] = [];
  try {
    const body = (await request.json()) as { recentMessages?: Turn[] };
    recent = Array.isArray(body.recentMessages) ? body.recentMessages.slice(-8) : [];
  } catch {
    return new Response(JSON.stringify({ error: "Bad request" }), { status: 400 });
  }
  // Only the user's own words matter for life-context; skip if nothing to learn.
  const userText = recent.filter((t) => t.role === "user").map((t) => t.content).join("\n").trim();
  if (!userText) return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: "AI unavailable" }), { status: 503 });

  // Load the existing summary.
  let existing = "";
  try {
    const { data } = await supabase.from("dolly_memory").select("summary").eq("user_id", userId).maybeSingle();
    existing = (data?.summary as string) || "";
  } catch { /* table may not exist yet */ }

  const transcript = recent.map((t) => `${t.role === "user" ? "User" : "Dolly"}: ${t.content}`).join("\n");

  const prompt = `You maintain a compact memory of a person for their astrology guide, Dolly. Update the memory with anything durable and personal from the latest exchange — their situation, relationships (names/roles), work, ongoing struggles, goals, and preferences. Keep ONLY lasting facts and themes; drop small talk, one-off astrology questions, and anything ephemeral. Write it as a tight bulleted list, at most ~12 short bullets, newest context folded in. If nothing new and durable came up, return the existing memory unchanged.

EXISTING MEMORY:
${existing || "(none yet)"}

LATEST EXCHANGE:
${transcript}

Return ONLY the updated memory (bullets), no preamble.`;

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: FALLBACK_MODEL,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });
    const summary = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      .slice(0, 4000);
    if (summary) {
      await supabase
        .from("dolly_memory")
        .upsert({ user_id: userId, summary, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("[dolly/memory] failed:", err instanceof Error ? err.message : String(err));
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500 });
  }
}
