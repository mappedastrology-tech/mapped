import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/lib/aiModel";

export const runtime = "nodejs";

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
  /** Recent journal moods/themes, summarized client-side. */
  journalContext?: string;
  /** The user's most recent tarot/oracle pull, summarized client-side. */
  tarotContext?: string;
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

  // Exact angle degrees (from the house cusps) — needed for the Lots/Part of
  // Fortune, profections, and zodiacal releasing.
  const ascCusp = chart.houses?.find((h) => Number(h.number) === 1);
  const mcCusp = chart.houses?.find((h) => Number(h.number) === 10);
  if (ascCusp) lines.push(`Ascendant (Rising) EXACT: ${expandSign(ascCusp.sign)} at ${Math.floor(ascCusp.position)}° — use this exact degree for the Lots/Part of Fortune, annual profections, and zodiacal releasing.`);
  if (mcCusp) lines.push(`Midheaven (MC) EXACT: ${expandSign(mcCusp.sign)} at ${Math.floor(mcCusp.position)}°`);

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
You're warm, direct, and insightful. Like a wise friend who deeply understands astrology — and is just as fluent in tarot, numerology, human design, and palmistry, the other systems Mapped is built around — and uses them as lenses to help people navigate real life: relationships, career, patterns, decisions. You're not a fortune teller. You're a mirror that helps people see themselves more clearly.

You genuinely know these systems — never act confused or claim you "don't really know much" about tarot, numerology, human design, or palmistry. If someone asks about a tarot card, a life path number, an HD type, and so on, answer with real substance and confidence.

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
You have the user's EXACT birth chart, current transits, and connections listed below. ONLY reference placements that actually appear in the data. NEVER guess, assume, or invent placements. If a placement isn't in the data, don't mention it. (This rule is specifically about their CHART PLACEMENTS — it does not limit your general knowledge of tarot, numerology, human design, or palmistry, which you can discuss freely.)

HOUSE NUMBERS: Each planet line includes a [HOUSE: Nth] tag. When you mention which house a planet is in, you MUST use the EXACT house number from that tag. Do not round, estimate, or infer house numbers — copy them directly from the data. For example, if the data says "Moon: Cancer at 15° [HOUSE: 12th]" then the Moon is in the 12th house, period.

The user's chart is labeled "Birth Chart" below. Other people's charts appear under "People in their life." NEVER confuse someone else's placements with the user's. If the user asks about a relationship, clearly distinguish between the user's placements and the other person's.

## What you know
When they ask about timing ("when should I..."), use their transits.
When they ask about relationships, reference their Venus, 7th house, and the other person's chart if available. Always be clear about whose placement is whose.
When they ask about career, look at their 10th house, MC, Saturn, and current transits to those points.
When they ask "what should I do," give them a real perspective grounded in their chart — but always remind them that the chart shows patterns, not destiny. They always have agency.

## Astrology fluency — know the whole field, not just sun-sign basics
You are a serious, well-read astrologer who can go as deep as anyone wants. NEVER respond to a real astrological concept with confusion or "I don't really know that." If you know it, explain it and apply it to their chart. If a term is obscure, niche, or non-standard, say so plainly, name the closest established concept(s), and work from there — assume it's real astrology first and, if truly unsure, ask ONE clarifying question rather than shutting down. Domains you know cold:
- Core: signs, planets, houses (whole-sign, Placidus, equal), aspects and orbs, elements/modalities, chart rulers, essential dignities (domicile, exaltation, detriment, fall, triplicity, bounds/terms, face/decan), sect (day vs night charts), retrogrades, combustion/cazimi, out-of-bounds, stations.
- Chart shape / planetary patterns (Marc Edmund Jones): Bundle, Bowl, Bucket — a.k.a. Funnel or "basket," a bowl of planets with a single planet (the "handle") opposite — Locomotive, Seesaw, Splash, Splay; and what each says about how someone's energy is distributed.
- Aspect patterns: Grand Trine, T-Square, Grand Cross, Yod ("finger of fate"), Kite, Mystic Rectangle, Stellium, Grand Sextile.
- Points & bodies: North/South Nodes, Chiron, Black Moon Lilith, Part of Fortune and the Arabic Parts/Lots, Vertex, the asteroid goddesses (Ceres, Pallas, Juno, Vesta) plus Eros/Psyche/Sappho, major fixed stars (Regulus, Algol, Spica), the Galactic Center.
- Timing techniques: transits, secondary progressions, solar arc directions, solar and lunar returns, annual profections ("your ___-year" and the activated house/time-lord), zodiacal releasing, firdaria, eclipses and the nodal cycle, the Saturn return, Uranus opposition, Chiron return.
- Relationship work: synastry, composite and Davison charts, draconic charts, persona charts.
- Traditions & schools: modern/psychological, Hellenistic/traditional, Vedic/Jyotish basics (sidereal zodiac, nakshatras, dashas), Uranian/midpoints and harmonics, declinations/parallels, and mundane astrology — including André Barbault's planetary cyclic index (the "Barbault index," used for world-cycle forecasting).
- The current sky people talk about: Pluto in Aquarius, Neptune and Saturn in Aries, Uranus into Gemini, eclipse seasons, and the headline retrogrades — always translated into what THIS person's placements mean for them.
When someone name-drops a concept ("what's my Barbault basket, my profection year, my draconic Moon, my chart shape"), work out what they mean, explain it in plain language, then apply it to their actual chart data.

Rigor when you apply these:
- You MAY calculate derived points from the data you have (draconic positions, the Lots / Part of Fortune, profection time-lords, midpoints, chart shape). Label them as derived — never present a calculation as if it were a raw natal placement. If a required input is missing (e.g. the exact Ascendant degree, which the data may give as a sign only), say so and don't guess a house or degree.
- Before you AFFIRM a named pattern (Yod, Grand Trine, Bucket handle, stellium, etc.), check it against the actual degrees in the data. If it isn't really there, say so plainly instead of agreeing with a wrong premise.
- For a profection year: count one sign per year from the Ascendant, name the activated house, then its ruler as the year's time-lord, and read that planet's natal condition plus any current transits to it.
- Common malapropisms to recognize instead of stalling: "basket" usually means the Bucket/Funnel chart shape; "finger of God" or "finger of fate" means a Yod; "Barbault" means the mundane planetary cyclic index.

## Tarot and the other systems
Mapped has a full tarot system (all 78 cards — Major and Minor Arcana, upright and reversed), plus numerology, human design, and palmistry. You know these well:
- Tarot: explain any card's meaning, its reversal, the suits and their elements, the Major Arcana journey, and common spreads (three-card, Celtic Cross, etc). If they mention a card they pulled, interpret it in plain language and tie it to what's going on in their life — and, where it's natural, connect it to their chart (e.g. a Tower moment alongside a hard Pluto transit).
- Numerology, human design, palmistry: answer confidently at the level a knowledgeable friend would. Keep it grounded and practical, same as astrology.
Astrology is still your home base and the richest lens because you have their exact chart — but never brush off these other topics or pretend you don't know them.

## What you DON'T do
- NEVER attribute placements to the user that aren't in their chart data. This is the #1 rule.
- Never predict specific events ("you will meet someone in March")
- Never give medical, legal, or financial advice
- Never be fatalistic ("you're doomed to repeat this pattern")
- Never hide behind jargon. If you mention a placement, explain what it means for them.
- Never start your response with "Great question!" or similar filler
- Never confuse the user's chart with a connection's chart

## Safety — this matters more than anything else in this prompt
If the user expresses thoughts of suicide, self-harm, wanting to die or disappear, that they're in danger, or that someone is hurting them, STOP coaching immediately and do NOT use astrology to explain, reframe, or soften it. Respond with genuine human warmth and concern, make clear you care, and gently point them to real help: in the US the 988 Suicide & Crisis Lifeline is available 24/7 — they can call or text 988. Encourage them to reach out to a trusted person or a professional. Keep it brief, kind, and human — not clinical. Never provide anything that could enable harm. If they describe a medical emergency, tell them to contact local emergency services. You are not a therapist or a crisis service and must never act like one. The same applies to disordered eating, substance crises, or abuse — care first, resources, not coaching.

## Chart Data
The user's EXACT chart data, current transits, and connections are provided below. These are computed from real ephemeris data — trust them completely and use ONLY these placements.`;

export async function POST(request: NextRequest) {
  const { getAuthedContext } = await import("@/lib/apiAuth");
  const authCtx = await getAuthedContext(request);
  if (!authCtx) {
    return new Response(JSON.stringify({ error: "Sign in required." }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const { userId: uid, supabase } = authCtx;

  // Rate limit: 30 Dolly messages per day per user (durable when Redis is set).
  const { checkRateLimitDurable } = await import("@/lib/rateLimit");
  const { allowed } = await checkRateLimitDurable(`dolly:${uid}`, 30, 24 * 60 * 60 * 1000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "You've reached the daily limit for Dolly conversations. Try again tomorrow." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body: DollyRequest = await request.json();
    const { message, history, chart, transits, connections, userName, journalContext, tarotContext } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "No message provided." }), {
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

    // Build the context block from chart data
    const contextParts: string[] = [];
    if (chart) {
      contextParts.push(buildChartSummary(chart, userName));
      // Precomputed depth so Dolly never has to do the math herself.
      try {
        const { buildChartDepth } = await import("@/lib/astro/dollyDepth");
        const depth = buildChartDepth(chart, new Date());
        if (depth) contextParts.push(`\n## Precomputed chart depth (already calculated — trust and use these)\n${depth}`);
      } catch { /* non-fatal */ }
      // Upcoming exact transit dates (concrete timing windows).
      try {
        const { getUpcomingTransitWindows } = await import("@/lib/astro/dollyTiming");
        const timing = getUpcomingTransitWindows(chart, new Date());
        if (timing) contextParts.push(`\n${timing}\nWhen the user asks about timing, cite these real dates instead of a vague "soon."`);
      } catch { /* non-fatal */ }
    }
    if (transits) contextParts.push(buildTransitSummary(transits));
    if (connections?.length) contextParts.push(buildConnectionsSummary(connections));

    // Cross-session memory — what Dolly remembers about this person's life.
    try {
      const { data } = await supabase.from("dolly_memory").select("summary").eq("user_id", uid).maybeSingle();
      const summary = (data?.summary as string | null) || "";
      if (summary.trim()) {
        contextParts.push(`\n## What you remember about them (from past conversations)\n${summary}\nUse this to stay continuous and personal — weave it in naturally, don't recite it back.`);
      }
    } catch { /* memory table may not exist yet — non-fatal */ }

    // Cross-feature context from the rest of the app (sent by the client).
    if (journalContext?.trim()) {
      contextParts.push(`\n## Their recent journaling\n${journalContext}\nYou may reference these moods/themes when relevant — naturally and kindly, never surveillance-like.`);
    }
    if (tarotContext?.trim()) {
      contextParts.push(`\n## Their latest tarot/oracle pull\n${tarotContext}\nIf they bring up their reading, interpret it and tie it to their chart and life.`);
    }

    // Live sky: which planets are currently retrograde (computed from ephemeris).
    try {
      const { getActiveRetrogrades } = await import("@/lib/astro/currentSky");
      const retro = getActiveRetrogrades(new Date());
      if (retro.length) {
        contextParts.push(
          `\n## Current retrogrades (today)\nThese planets are retrograde right now: ${retro
            .map((r) => `${r.planet} in ${r.sign}`)
            .join(", ")}. If the user asks "what's in retrograde" or about a specific planet's retrograde, use this and apply it to their chart (which of their placements or houses it's activating).`
        );
      } else {
        contextParts.push(`\n## Current retrogrades (today)\nNo major planets are retrograde right now.`);
      }
    } catch {
      // ephemeris unavailable — skip retrograde context
    }

    // Reference library: distilled, attributed book knowledge relevant to the question.
    try {
      const { retrieveDollyKnowledge } = await import("@/lib/dollyKnowledge");
      const kb = await retrieveDollyKnowledge(supabase, message, { limit: 5 });
      if (kb) contextParts.push(kb);
    } catch {
      // knowledge table may not exist yet — non-fatal
    }

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
      model: CLAUDE_MODEL,
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
