import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

/**
 * GET /api/dolly/test
 * Quick test to verify the Anthropic API key and model work.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No ANTHROPIC_API_KEY set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{ role: "user", content: "Say hello in exactly 5 words." }],
    });

    const text =
      msg.content[0]?.type === "text" ? msg.content[0].text : "No text";

    return new Response(
      JSON.stringify({ ok: true, model: msg.model, text, usage: msg.usage }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const errName = err instanceof Error ? err.constructor.name : "Unknown";
    return new Response(
      JSON.stringify({ ok: false, error: errMsg, type: errName }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
