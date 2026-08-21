import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/lib/aiModel";

export const runtime = "nodejs";

/**
 * POST /api/chart/interpret
 *
 * Takes a person's Big 3 placements and returns personalized interpretations
 * from Claude. This is what makes Mapped different from generic horoscope apps —
 * every interpretation is written specifically for this person's chart.
 *
 * The API uses streaming internally but returns the complete response.
 * We'll add real streaming to the UI in a future session.
 */

// The voice of Mapped — this is your exact system prompt
const MAPPED_SYSTEM_PROMPT = `You are the voice of mapped, an astrology app for people who want to understand their life, not just their personality. Your tone is warm, direct, and specific — like a wise friend who knows astrology deeply. Never generic. Never mystical for the sake of it. Ground every interpretation in real life. Speak in second person. Keep each placement interpretation to 3-4 sentences. Focus on how this placement shows up in the person's actual life — their patterns, their relationships, their recurring themes — not just their traits. Only interpret the three placements you are given (Sun, Moon, Rising) — do not invent or reference other planets, houses, or aspects. This is for self-reflection and entertainment, not medical, legal, psychological, or financial advice.`;

// Full sign names for the prompt
const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

export async function POST(request: NextRequest) {
  // Rate limit: 3 chart interpretations per hour per IP (anonymous pre-signup route).
  const { checkRateLimitDurable, getClientIP } = await import("@/lib/rateLimit");
  const ip = getClientIP(request);
  const { allowed } = await checkRateLimitDurable(`interpret:${ip}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const { name, bigThree } = await request.json();

    if (!name || !bigThree?.sun || !bigThree?.moon || !bigThree?.rising) {
      return NextResponse.json(
        { error: "Missing name or Big 3 data." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key not configured." },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const sunSign = SIGN_FULL[bigThree.sun] || bigThree.sun;
    const moonSign = SIGN_FULL[bigThree.moon] || bigThree.moon;
    const risingSign = SIGN_FULL[bigThree.rising] || bigThree.rising;

    // Ask Claude to interpret all 3 placements at once.
    // We ask for JSON so we can display each one separately in the UI.
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: MAPPED_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Interpret the Big 3 placements for ${name}:

- Sun in ${sunSign}
- Moon in ${moonSign}
- Rising in ${risingSign}

Return your response as valid JSON with this exact structure:
{
  "sun": "Your Sun in ${sunSign} interpretation here...",
  "moon": "Your Moon in ${moonSign} interpretation here...",
  "rising": "Your ${risingSign} Rising interpretation here..."
}

Each interpretation should be 3-4 sentences. Remember: real life, not just traits. How does this show up in their patterns, relationships, and recurring themes?`,
        },
      ],
    });

    // Extract the text content from Claude's response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude.");
    }

    // Parse the JSON response. Claude sometimes wraps JSON in markdown code blocks,
    // so we strip those if present.
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const interpretations = JSON.parse(jsonText);

    return NextResponse.json({
      interpretations: {
        sun: interpretations.sun,
        moon: interpretations.moon,
        rising: interpretations.rising,
      },
    });
  } catch (error) {
    console.error("Interpretation error:", error);
    return NextResponse.json(
      { error: "Failed to generate interpretations. Please try again." },
      { status: 500 }
    );
  }
}
