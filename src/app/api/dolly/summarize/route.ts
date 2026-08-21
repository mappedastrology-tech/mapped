import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FALLBACK_MODEL } from "@/lib/aiModel";
import { getAuthedContext } from "@/lib/apiAuth";

export const runtime = "nodejs";

/**
 * POST /api/dolly/summarize
 * Returns a short (3–6 word) title summarizing what a Dolly chat is about, so
 * the history list is scannable. Uses the cheap/fast model; the client caches
 * the result so this is called at most once per conversation.
 */
interface Turn { role: "user" | "assistant"; content: string }

export async function POST(request: NextRequest) {
  const ctx = await getAuthedContext(request);
  if (!ctx) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  let msgs: Turn[] = [];
  try {
    const body = (await request.json()) as { messages?: Turn[] };
    msgs = Array.isArray(body.messages) ? body.messages.slice(0, 12) : [];
  } catch {
    return new Response(JSON.stringify({ error: "Bad request" }), { status: 400 });
  }

  const text = msgs
    .filter((t) => t?.content)
    .map((t) => `${t.role === "user" ? "User" : "Dolly"}: ${t.content}`)
    .join("\n")
    .trim();
  if (!text) return new Response(JSON.stringify({ summary: "" }), { status: 200 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ summary: "" }), { status: 200 });

  const prompt = `Summarize what this astrology chat is about in a short 3–6 word title (the person's topic or question). Natural capitalization, no surrounding quotes, no trailing punctuation.\n\n${text}\n\nReturn ONLY the short title.`;

  try {
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: FALLBACK_MODEL,
      max_tokens: 24,
      messages: [{ role: "user", content: prompt }],
    });
    const summary = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join(" ")
      .trim()
      .replace(/^["'\s]+|["'\s.]+$/g, "")
      .slice(0, 64);
    return new Response(JSON.stringify({ summary }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ summary: "" }), { status: 200 });
  }
}
