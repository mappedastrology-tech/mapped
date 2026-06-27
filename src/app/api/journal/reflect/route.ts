import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createMessageResilient } from "@/lib/aiModel";

export const runtime = "edge";

/**
 * POST /api/journal/reflect
 *
 * Generates an AI reflection for a given period based on past journal entries.
 * Called for weekly, monthly, quarterly, yearly, and new-year reflections.
 */

const anthropic = new Anthropic();

interface ReflectRequest {
  entries: { date: string; content: string; prompt: string; mood?: string; celestial_context?: Record<string, string> }[];
  cadence: "weekly" | "monthly" | "quarterly" | "yearly" | "new-year";
  periodStart: string;
  periodEnd: string;
  userName?: string;
  chartSummary?: string;  // for new-year: summary of birth chart transits for the year
}

export async function POST(req: NextRequest) {
  try {
    const { getAuthedUserId } = await import("@/lib/apiAuth");
    const uid = await getAuthedUserId(req);
    if (!uid) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    // Rate limit: this route makes paid AI calls. 10 reflections/hr per user.
    const { checkRateLimitDurable } = await import("@/lib/rateLimit");
    const { allowed } = await checkRateLimitDurable(`journal-reflect:${uid}`, 10, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body: ReflectRequest = await req.json();
    const { cadence, periodStart, periodEnd, userName, chartSummary } = body;
    // Cap the number of entries we process to bound token cost.
    const entries = (body.entries || []).slice(0, 200);

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: "No entries to reflect on" }, { status: 400 });
    }

    const cadenceDescriptions: Record<string, string> = {
      weekly: "the past week",
      monthly: "the past month",
      quarterly: "the past three months",
      yearly: "the past year",
      "new-year": "the entire past year, comparing their journey to their astrological chart",
    };

    // Build entries summary for the prompt
    const entrySummary = entries
      .map((e) => `[${e.date}]${e.mood ? ` (mood: ${e.mood})` : ""}: ${e.content.slice(0, 500)}`)
      .join("\n\n");

    const systemPrompt = `You are a warm, insightful reflection writer for a personal astrology journal app.
You're writing a ${cadence} reflection for ${userName || "the user"} covering ${cadenceDescriptions[cadence]}.

Your tone: intimate, honest, poetic but grounded. Like a wise friend who sees patterns you missed.
Structure: Start with where they were at the beginning of this period. Notice the arc — what shifted, what they kept coming back to, what emerged. End with a forward-looking observation.

Length: 3-5 paragraphs for weekly, 4-6 for monthly, 5-8 for quarterly/yearly.
${cadence === "new-year" && chartSummary ? `\nAstrological context for the year:\n${chartSummary}\n\nWeave in references to how their chart's transits aligned with what they wrote about — but don't force it. Only mention astrology where it genuinely illuminates the pattern.` : ""}

Do NOT use bullet points or headers. Write in flowing prose.

SAFETY: If the entries suggest the person may be in crisis — thoughts of suicide or self-harm, abuse, a serious eating disorder, or a medical emergency — do not interpret it through astrology or frame it as growth. Gently and warmly acknowledge it and encourage them to reach out for real support (in the US, the 988 Suicide & Crisis Lifeline is available 24/7 by call or text). Care comes before reflection.`;

    const message = await createMessageResilient(anthropic, {
      max_tokens: cadence === "weekly" ? 600 : cadence === "monthly" ? 1000 : 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here are the journal entries from ${periodStart} to ${periodEnd} (${entries.length} entries):\n\n${entrySummary}\n\nWrite a ${cadence} reflection that honors their journey during this period.`,
        },
      ],
    });

    const reflection =
      message.content[0].type === "text"
        ? message.content[0].text.trim()
        : "Unable to generate reflection.";

    return NextResponse.json({ reflection });
  } catch (error) {
    console.error("Journal reflection error:", error);
    return NextResponse.json({ error: "Failed to generate reflection" }, { status: 500 });
  }
}
