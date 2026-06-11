import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

/**
 * POST /api/dolly
 *
 * Dolly — streaming AI life coach powered by Claude.
 *
 * Accepts the user's message + their full chart context (planets, houses,
 * transits, connections) and streams back Dolly's response. Conversation
 * history is passed in from the client so Dolly has multi-turn memory.
 */

const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

function expandSign(s: string): string {
  return SIGN_FULL[s] || SIGN_FULL[s?.slice(0, 3)] || s;
}

interface ChartContext {
  bigThree?: { sun: string; moon: string; rising: string };
  planets?: { name: string; sign: string; position: number; house: string | null; retrograde: boolean }[];
  houses?: { number: number; sign: string; position: number }[];
  specialPoints?: { name: string; sign: string; position: number; house: string | null }[];
  birthDate?: string;
  birthTime?: string;
}

interface TransitContext {
  transitDate?: string;
  transitAspects?: {
    transitPlanet: string;
    transitSign: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
    transitHouse: number;
  }[];
}

interface ConnectionContext {
  name: string;
  relationship: string;
  category: string;
  bigThree?: { sun: string; moon: string; rising: string } | null;
  planets?: { name: string; sign: string; position: number; house: string | null; retrograde: boolean }[] | null;
  houses?: { number: number; sign: string; position: number }[] | null;
}

interface DollyRequest {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  chart?: ChartContext;
  transits?: TransitContext;
  connections?: ConnectionContext[];
  userName?: string;
}

function ordinalHouse(h: string | number): string {
  const n = typeof h === "string" ? parseInt(h, 10) : h;
  if (isNaN(n)) return `${h}`;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function buildChartSummary(chart: ChartContext, userName?: string): string {
  if (!chart?.bigThree) return "";

  const lines: string[] = [];
  lines.push(`## ${userName || "User"}'s Birth Chart`);

  if (chart.birthDate) lines.push(`Born: ${chart.birthDate}${chart.birthTime ? ` at ${chart.birthTime}` : ""}`);

  lines.push(`\nBig Three: ${expandSign(chart.bigThree.sun)} Sun, ${expandSign(chart.bigThree.moon)} Moon, ${expandSign(chart.bigThree.rising)} Rising`);

  if (chart.planets?.length) {
    lines.push("\nPlanet placements (HOUSE numbers are EXACT — use these, do not change them):");
    for (const p of chart.planets) {
      const retro = p.retrograde ? " (retrograde)" : "";
      const house = p.house ? ` [HOUSE: ${ordinalHouse(p.house)}]` : "";
      lines.push(`- ${p.name}: ${expandSign(p.sign)} at ${Math.floor(p.position)}°${house}${retro}`);
    }
  }

  if (chart.specialPoints?.length) {
    lines.push("\nSpecial points:");
    for (const sp of chart.specialPoints) {
      const house = sp.house ? ` [HOUSE: ${ordinalHouse(sp.house)}]` : "";
      lines.push(`- ${sp.name}: ${expandSign(sp.sign)}${house}`);
    }
  }

  if (chart.houses?.length) {
    lines.push("\nHouse cusps:");
    for (const h of chart.houses) {
      lines.push(`- House ${h.number}: ${expandSign(h.sign)} at ${Math.floor(h.position)}°`);
    }
  }

  return lines.join("\n");
}

function buildTransitSummary(transits: TransitContext): string {
  if (!transits?.transitAspects?.length) return "";

  const lines: string[] = [];
  lines.push(`\n## Current Transits (${transits.transitDate || "today"})`);

  // Sort by outer planets first (most impactful)
  const outerPlanets = ["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter"];
  const major = transits.transitAspects.filter(a => outerPlanets.includes(a.transitPlanet));
  const minor = transits.transitAspects.filter(a => !outerPlanets.includes(a.transitPlanet));

  if (major.length) {
    lines.push("\nMajor transits (long-term themes):");
    for (const a of major) {
      lines.push(`- Transit ${a.transitPlanet} in ${expandSign(a.transitSign)} ${a.aspect} natal ${a.natalPlanet} (${a.orb.toFixed(1)}° orb, house ${a.transitHouse})`);
    }
  }

  if (minor.length) {
    lines.push("\nCurrent activations (short-term):");
    for (const a of minor.slice(0, 8)) {
      lines.push(`- Transit ${a.transitPlanet} in ${expandSign(a.transitSign)} ${a.aspect} natal ${a.natalPlanet} (${a.orb.toFixed(1)}° orb)`);
    }
  }

  return lines.join("\n");
}

function buildConnectionsSummary(connections: ConnectionContext[]): string {
  if (!connections?.length) return "";

  const lines: string[] = [];
  lines.push("\n## People in the user's life (NOT the user — these are OTHER people's charts)");

  for (const c of connections) {
    const bt = c.bigThree
      ? ` — ${expandSign(c.bigThree.sun)} Sun, ${expandSign(c.bigThree.moon)} Moon${c.bigThree.rising ? `, ${expandSign(c.bigThree.rising)} Rising` : ""}`
      : "";
    lines.push(`\n### ${c.name} (${c.relationship}, ${c.category})${bt}`);

    // Include full planet placements if available
    if (c.planets?.length) {
      lines.push("Placements:");
      for (const p of c.planets) {
        const retro = p.retrograde ? " (retrograde)" : "";
        const house = p.house ? ` [HOUSE: ${ordinalHouse(p.house)}]` : "";
        lines.push(`  - ${p.name}: ${expandSign(p.sign)} at ${Math.floor(p.position)}°${house}${retro}`);
      }
    }

    if (c.houses?.length) {
      lines.push("House cusps:");
      for (const h of c.houses) {
        lines.push(`  - House ${h.number}: ${expandSign(h.sign)} at ${Math.floor(h.position)}°`);
      }
    }
  }

  return lines.join("\n");
}

const DOLLY_SYSTEM_PROMPT = `You are Dolly, the AI life coach inside Mapped — an astrology app for people who want to understand their life, not just their personality.

## Who you are
You're warm, direct, and insightful. Like a wise friend who deeply understands astrology and uses it as a lens to help people navigate real life — relationships, career, patterns, decisions. You're not a fortune teller. You're a mirror that helps people see themselves more clearly.

## How you speak
- Second person, always ("you" not "they")
- Warm but not saccharine. Real talk, not toxic positivity.
- Short paragraphs. Conversational. Like texting a wise friend.
- Ground every astrological point in real life. Don't just say "your Moon in Scorpio means you feel deeply" — say "with your Moon in Scorpio, you probably have a hard time letting things go. When someone hurts you, it doesn't just sting — it rewrites the story you tell yourself about them."
- Use astrology as the framework but make it about THEIR life, not about astrology itself.
- You can be funny, a little irreverent, and occasionally blunt when they need it.
- Never use emojis.
- Keep responses focused. 2-4 paragraphs max unless they ask for something detailed.

## CRITICAL: Use ONLY the actual chart data provided
You have the user's EXACT birth chart, current transits, and connections listed below. ONLY reference placements that actually appear in the data. NEVER guess, assume, or invent placements. If a placement isn't in the data, don't mention it.

HOUSE NUMBERS: Each planet line includes a [HOUSE: Nth] tag. When you mention which house a planet is in, you MUST use the EXACT house number from that tag. Do not round, estimate, or infer house numbers — copy them directly from the data. For example, if the data says "Moon: Cancer at 15° [HOUSE: 12th]" then the Moon is in the 12th house, period.

The user's chart is labeled "Birth Chart" below. Other people's charts appear under "People in their life." NEVER confuse someone else's placements with the user's. If the user asks about a relationship, clearly distinguish between the user's placements and the other person's.

## What you know
When they ask about timing ("when should I..."), use their transits.
When they ask about relationships, reference their Venus, 7th house, and the other person's chart if available. Always be clear about whose placement is whose.
When they ask about career, look at their 10th house, MC, Saturn, and current transits to those points.
When they ask "what should I do," give them a real perspective grounded in their chart — but always remind them that the chart shows patterns, not destiny. They always have agency.

## What you DON'T do
- NEVER attribute placements to the user that aren't in their chart data. This is the #1 rule.
- Never predict specific events ("you will meet someone in March")
- Never give medical, legal, or financial advice
- Never be fatalistic ("you're doomed to repeat this pattern")
- Never hide behind jargon. If you mention a placement, explain what it means for them.
- Never start your response with "Great question!" or similar filler
- Never confuse the user's chart with a connection's chart

## Chart Data
The user's EXACT chart data, current transits, and connections are provided below. These are computed from real ephemeris data — trust them completely and use ONLY these placements.`;

export async function POST(request: NextRequest) {
  // Rate limit: 30 Dolly messages per day per IP
  const { checkRateLimit, getClientIP } = await import("@/lib/rateLimit");
  const ip = getClientIP(request);
  const { allowed, remaining } = checkRateLimit(`dolly:${ip}`, 30, 24 * 60 * 60 * 1000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "You've reached the daily limit for Dolly conversations. Try again tomorrow." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body: DollyRequest = await request.json();
    const { message, history, chart, transits, connections, userName } = body;

    console.log("[Dolly] Chart received:", chart ? `bigThree=${JSON.stringify(chart.bigThree)}, planets=${chart.planets?.length || 0}` : "NO CHART");
    console.log("[Dolly] Transits:", transits ? `${transits.transitAspects?.length || 0} aspects` : "NO TRANSITS");
    console.log("[Dolly] Connections:", connections?.length || 0);

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "No message provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log("[Dolly] API key present:", !!apiKey, "length:", apiKey?.length || 0, "starts with:", apiKey?.slice(0, 10) || "NONE");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build the context block from chart data
    const contextParts: string[] = [];
    if (chart) contextParts.push(buildChartSummary(chart, userName));
    if (transits) contextParts.push(buildTransitSummary(transits));
    if (connections?.length) contextParts.push(buildConnectionsSummary(connections));

    const fullSystem = contextParts.length
      ? `${DOLLY_SYSTEM_PROMPT}\n\n---\n\n${contextParts.join("\n")}`
      : DOLLY_SYSTEM_PROMPT;

    // Build message history for multi-turn conversation
    // Anthropic API requires alternating user/assistant roles, starting with user
    const messages: { role: "user" | "assistant"; content: string }[] = [];

    if (history?.length) {
      const recent = history.slice(-20);
      for (const msg of recent) {
        // Skip if same role as previous (defensive)
        if (messages.length > 0 && messages[messages.length - 1].role === msg.role) continue;
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Ensure the last history message isn't a user message (since we're adding one)
    while (messages.length > 0 && messages[messages.length - 1].role === "user") {
      messages.pop();
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const client = new Anthropic({ apiKey });

    // Use create() with stream: true — returns an async iterable
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: fullSystem,
      messages,
      stream: true,
    } as Parameters<typeof client.messages.create>[0]);

    // Pipe the Anthropic stream into an SSE ReadableStream
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
          console.error("Stream iteration error:", err);
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
    const errName = error instanceof Error ? error.constructor.name : "Unknown";
    console.error("Dolly error:", errName, errMsg, error);

    // Friendly error messages
    let friendly = "Dolly is having a moment. Try again in a sec.";
    if (errMsg.includes("credit balance is too low")) {
      friendly = "Dolly's API credits have run out. Add credits at console.anthropic.com to keep chatting.";
    } else if (errMsg.includes("authentication") || errMsg.includes("api_key")) {
      friendly = "Dolly's API key isn't working. Check your ANTHROPIC_API_KEY in .env.local.";
    } else if (errMsg.includes("rate_limit")) {
      friendly = "Dolly is getting too many requests. Wait a moment and try again.";
    }

    return new Response(
      JSON.stringify({ error: friendly }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
