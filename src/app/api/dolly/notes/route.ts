import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/lib/aiModel";

export const runtime = "nodejs";

/**
 * POST /api/dolly/notes
 *
 * Generates personalized reflection notes for a card pull, incorporating
 * the user's birth chart and current transits when available.
 */

const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

function expandSign(s: string): string {
  return SIGN_FULL[s] || SIGN_FULL[s?.slice(0, 3)] || s;
}

function ordinalHouse(h: string | number): string {
  const n = typeof h === "string" ? parseInt(h, 10) : h;
  if (isNaN(n)) return `${h}`;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

interface ChartData {
  bigThree?: { sun: string; moon: string; rising: string };
  planets?: { name: string; sign: string; house: string | null; retrograde: boolean }[];
  houses?: { number: number; sign: string }[];
  specialPoints?: { name: string; sign: string; house: string | null }[];
}

interface TransitData {
  transitAspects?: {
    transitPlanet: string;
    transitSign: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
    transitHouse: number;
  }[];
}

function buildContext(chart?: ChartData, transits?: TransitData): string {
  if (!chart?.bigThree) return "";

  const lines: string[] = [];
  lines.push("## User's Chart");
  lines.push(`Big Three: ${expandSign(chart.bigThree.sun)} Sun, ${expandSign(chart.bigThree.moon)} Moon, ${expandSign(chart.bigThree.rising)} Rising`);

  if (chart.planets?.length) {
    lines.push("\nKey placements (HOUSE numbers are exact — use only these):");
    for (const p of chart.planets) {
      const retro = p.retrograde ? " (retrograde)" : "";
      const house = p.house ? ` [HOUSE: ${ordinalHouse(p.house)}]` : "";
      lines.push(`- ${p.name}: ${expandSign(p.sign)}${house}${retro}`);
    }
  }

  if (transits?.transitAspects?.length) {
    const outerPlanets = ["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter"];
    const major = transits.transitAspects.filter(a => outerPlanets.includes(a.transitPlanet));
    const active = major.length ? major.slice(0, 5) : transits.transitAspects.slice(0, 5);

    lines.push("\n## Active Transits Today");
    for (const a of active) {
      lines.push(`- Transit ${a.transitPlanet} in ${expandSign(a.transitSign)} ${a.aspect} natal ${a.natalPlanet} (house ${a.transitHouse})`);
    }
  }

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const { getAuthedUserId } = await import("@/lib/apiAuth");
    const uid = await getAuthedUserId(request);
    if (!uid) {
      return new Response(JSON.stringify({ error: "Sign in required." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const { checkRateLimitDurable } = await import("@/lib/rateLimit");
    const { allowed } = await checkRateLimitDurable(`dolly-notes:${uid}`, 60, 24 * 60 * 60 * 1000);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Too many requests. Try again later." }), { status: 429, headers: { "Content-Type": "application/json" } });
    }

    const { cardName, keywords, meaning, chart, transits } = await request.json();

    if (!cardName) {
      return new Response(JSON.stringify({ error: "No card provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const chartContext = buildContext(chart, transits);

    const systemPrompt = chartContext
      ? `You write short, personalized reflection notes about tarot and oracle card pulls. You have the user's birth chart and current transits — use them to make the reflection specific to THEIR life right now.

Connect the card's meaning to their specific placements and active transits. For example, if they pulled a card about transformation and they have transit Pluto conjunct their natal Venus, tie those together naturally.

Write 2-3 sentences max. Be warm and specific — not generic. No headers, no bullet points. Reference their actual placements naturally (e.g. "with your Scorpio Moon..." or "as Saturn moves through your 7th house..."). Don't list placements mechanically — weave them into the reflection.

CRITICAL: When referencing house numbers, use ONLY the exact [HOUSE: Nth] values from the chart data below. Never guess or infer house numbers.

${chartContext}`
      : `You write short, warm personal reflection notes about tarot and oracle card pulls. Write 2-3 sentences max. Be poetic but grounded — connect the card's energy to everyday life. No headers, no bullet points. Just write a brief, beautiful reflection.`;

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `I pulled ${cardName} today. Keywords: ${keywords}. Meaning: ${meaning}. Write me a short personal reflection note.`,
        },
      ],
      stream: true,
    } as Parameters<typeof client.messages.create>[0]);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for await (const event of response as any) {
            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta" &&
              typeof event.delta.text === "string"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Notes stream error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Dolly notes error:", errMsg);

    return new Response(
      JSON.stringify({ error: "Couldn't generate notes right now." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
