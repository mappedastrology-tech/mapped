import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/lib/aiModel";

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
  const { getAuthedUserId } = await import("@/lib/apiAuth");
  const uid = await getAuthedUserId(req);
  if (!uid) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { checkRateLimitDurable } = await import("@/lib/rateLimit");
  const { allowed } = await checkRateLimitDurable(`journal-prompt:${uid}`, 10, 60 * 60 * 1000);
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
      model: CLAUDE_MODEL,
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

Keep the prompt emotionally gentle and safe: invite reflection, never probe trauma, grief, medical issues, self-harm, or crisis.

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

    // The model sometimes wraps its JSON in a ```json … ``` markdown fence, or
    // includes prose around it — strip the fence and pull out the first {…}
    // object before parsing so we never surface raw JSON to the reader.
    const cleaned = raw
      .replace(/^\s*```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    let parsedOk = false;
    try {
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
      if (parsed.prompt) { prompt = parsed.prompt; parsedOk = true; }
      if (parsed.context) context = parsed.context;
    } catch {
      /* fall through to the plain-text fallback below */
    }

    // Only fall back to the raw text if it isn't itself JSON/fence noise —
    // otherwise keep the safe default prompt above.
    if (!parsedOk) {
      const looksLikeJson = /```|"prompt"\s*:|^\s*\{/.test(cleaned);
      if (cleaned.length > 10 && !looksLikeJson) prompt = cleaned;
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
