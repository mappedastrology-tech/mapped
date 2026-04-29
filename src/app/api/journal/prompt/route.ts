import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

/**
 * POST /api/journal/prompt
 *
 * Generates a journal prompt based on today's horoscope and celestial context.
 * The prompt should feel personal, introspective, and tied to what's happening
 * in the sky — not generic.
 */

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { checkRateLimit, getClientIP } = await import("@/lib/rateLimit");
  const { allowed } = checkRateLimit(`journal-prompt:${getClientIP(req)}`, 10, 60 * 60 * 1000);
  if (!allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const body = await req.json();
    const { horoscope, celestial, userName } = body;

    if (!horoscope) {
      return NextResponse.json({ error: "horoscope required" }, { status: 400 });
    }

    const moonPhase = celestial?.moonPhase || "unknown";
    const zodiacSeason = celestial?.zodiacSeason || "unknown";
    const planetaryDay = celestial?.planetaryDay || "unknown";
    const nakshatraName = celestial?.nakshatra || "unknown";
    const nakshatraQuality = celestial?.nakshatraQuality || "";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Generate a journal prompt for today based on this context:

Horoscope: "${horoscope}"
Moon phase: ${moonPhase}
Zodiac season: ${zodiacSeason}
Planetary day: ${planetaryDay}
Nakshatra: ${nakshatraName} (${nakshatraQuality})
${userName ? `User's name: ${userName}` : ""}

Return a JSON object with exactly two fields:
1. "prompt": One introspective question or invitation to write (1-2 sentences max). Should feel specific to TODAY's energy, not generic. Tone: warm, curious, a little poetic — like a thoughtful friend asking you a question. Don't mention astrology jargon — translate the energy into emotional/experiential language. Don't start with "Today" or "Write about".
2. "context": A brief 1-sentence note explaining what celestial factor inspired this prompt, written casually. Example: "Inspired by the waxing crescent's energy of first steps and Mars's push toward action." Use plain language but name the actual celestial elements.

Return ONLY the JSON object, no other text.`,
        },
      ],
    });

    const raw =
      message.content[0].type === "text"
        ? message.content[0].text.trim()
        : "";

    let prompt = "What's alive in you right now that you haven't given words to yet?";
    let context = `Inspired by the ${moonPhase} and ${zodiacSeason} season energy.`;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.prompt) prompt = parsed.prompt;
      if (parsed.context) context = parsed.context;
    } catch {
      // If JSON parse fails, use the raw text as the prompt
      if (raw.length > 10) prompt = raw;
    }

    return NextResponse.json({ prompt, context });
  } catch (error) {
    console.error("Journal prompt error:", error);
    return NextResponse.json(
      {
        prompt: "What's asking for your attention today — not the loudest thing, but the most honest one?",
        context: "A gentle check-in for when the stars are quiet.",
      },
      { status: 200 }
    );
  }
}
