import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createMessageResilient } from "@/lib/aiModel";

export const runtime = "nodejs";

/**
 * POST /api/horoscope
 *
 * Generate a personalized daily horoscope using the user's FULL birth chart
 * plus today's real celestial data (moon phase, planetary day, zodiac season,
 * nakshatra, current transits).
 *
 * Returns: { horoscope: string, vibes: string[], avoid: string[] }
 *
 * The horoscope is grounded in actual astronomical data — no generic sun-sign
 * fluff. Claude is instructed to ONLY reference placements that exist in the
 * provided chart data.
 */

const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

function expandSign(s: string): string {
  return SIGN_FULL[s] || SIGN_FULL[s?.slice(0, 3)] || s;
}

interface ChartData {
  bigThree?: { sun: string; moon: string; rising: string };
  planets?: { name: string; sign: string; position: number; house: string | null; retrograde: boolean }[];
  houses?: { number: number; sign: string; position: number }[];
  specialPoints?: { name: string; sign: string; position: number; house: string | null }[];
  aspects?: { planet1: string; planet2: string; aspect: string; orb: number }[];
}

interface CelestialData {
  moonPhase: string;
  moonIllumination: number;
  zodiacSeason: string;
  seasonElement: string;
  planetaryDay: string;
  planetaryDayPlanet: string;
  nakshatra: string;
  nakshatraQuality: string;
}

interface TransitData {
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

interface HoroscopeRequest {
  chart: ChartData;
  celestial: CelestialData;
  transits?: TransitData;
  userName?: string;
  userId?: string;
  lordOfTheYear?: {
    planet: string;
    profectionHouse: number;
    profectionSign: string;
  };
}

function ordinalHouse(h: string | number): string {
  const n = typeof h === "string" ? parseInt(h, 10) : h;
  if (isNaN(n)) return `${h}`;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function buildChartBlock(chart: ChartData, userName?: string): string {
  const lines: string[] = [];
  lines.push(`## ${userName || "User"}'s Birth Chart`);

  if (chart.bigThree) {
    lines.push(`Big Three: ${expandSign(chart.bigThree.sun)} Sun, ${expandSign(chart.bigThree.moon)} Moon, ${expandSign(chart.bigThree.rising)} Rising`);
  }

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

  if (chart.aspects?.length) {
    lines.push("\nNatal aspects:");
    for (const a of chart.aspects.slice(0, 15)) {
      const orb = typeof a.orb === "number" ? ` (${a.orb.toFixed(1)}° orb)` : "";
      lines.push(`- ${a.planet1 || "?"} ${a.aspect || "?"} ${a.planet2 || "?"}${orb}`);
    }
  }

  return lines.join("\n");
}

function buildCelestialBlock(celestial: CelestialData): string {
  return [
    "## Today's Sky (real astronomical data)",
    `Moon phase: ${celestial.moonPhase} (${celestial.moonIllumination}% illuminated)`,
    `Zodiac season: ${celestial.zodiacSeason} (${celestial.seasonElement} element)`,
    `Planetary day: ${celestial.planetaryDay} — ruled by ${celestial.planetaryDayPlanet}`,
    `Nakshatra (lunar mansion): ${celestial.nakshatra} — ${celestial.nakshatraQuality}`,
  ].join("\n");
}

function buildTransitBlock(transits: TransitData): string {
  if (!transits?.transitAspects?.length) return "";

  const lines: string[] = [];
  lines.push(`\n## Current Transits (${transits.transitDate || "today"})`);

  const outerPlanets = ["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter"];
  const major = transits.transitAspects.filter(a => outerPlanets.includes(a.transitPlanet));
  const minor = transits.transitAspects.filter(a => !outerPlanets.includes(a.transitPlanet));

  if (major.length) {
    lines.push("\nMajor transits (long-term themes):");
    for (const a of major) {
      const orb = typeof a.orb === "number" ? ` (${a.orb.toFixed(1)}° orb)` : "";
      lines.push(`- Transit ${a.transitPlanet} in ${expandSign(a.transitSign || "")} ${a.aspect} natal ${a.natalPlanet}${orb}, house ${a.transitHouse || "?"}`);
    }
  }

  if (minor.length) {
    lines.push("\nCurrent activations (short-term):");
    for (const a of minor.slice(0, 8)) {
      const orb = typeof a.orb === "number" ? ` (${a.orb.toFixed(1)}° orb)` : "";
      lines.push(`- Transit ${a.transitPlanet} in ${expandSign(a.transitSign || "")} ${a.aspect} natal ${a.natalPlanet}${orb}`);
    }
  }

  return lines.join("\n");
}

const HOROSCOPE_SYSTEM_PROMPT = `You are the daily horoscope writer for Mapped, an astrology app that gives real, grounded readings — not generic fluff.

## Your task
Write a personalized daily horoscope that tells the STORY of this person's day. Not a list of transits — a narrative. What's the big theme? What's the weather of their inner world today?

## Structure — TWO PARTS
The horoscope has two distinct parts, separated naturally:

**Part 1: The sky right now (1-2 sentences)**
Set the scene. What's the big cosmic weather EVERYONE is experiencing? Count the transit planets by sign. If there's a stellium (3+ planets in one sign), NAME IT — "Five planets are packed into Aries right now" or "The sky is heavy with Taurus energy." This is the universal weather report. Mention the moon phase energy too. This part is NOT personalized — it's what any astrologer would say about today's sky.

**Part 2: How it hits YOUR chart (2-3 sentences)**
NOW make it personal. Their rising sign is the lens — it determines which house the stellium/cluster falls in. If 5 planets are in Aries and they have Aries rising, that's a 1st house pile-up and it's about THEM. If they have Capricorn rising, Aries is their 4th house — it's about home and roots. Tell THAT story. Reference their natal planets being activated.

## How to think about it
1. ZOOM OUT FIRST. Count transit planets per sign. Name the clusters. This is the headline.
2. Their RISING SIGN determines the house. Figure out the house, then tell the life story.
3. Don't list transits. Synthesize. "Five planets are charging through your 1st house" > listing each one.
4. The moon phase sets the emotional undertone — waxing = building momentum, full = peak/release, waning = letting go.
5. Lead with the big picture, then get personal.

## Voice
- Second person ("you"). Warm, direct, a little poetic. Like a wise friend reading the weather for your soul.
- ABSOLUTELY NO astrology jargon in the horoscope body. A complete beginner should understand every word. No "stellium," "opposition," "trine," "square," "house" numbers, "transit," "natal," "conjunct," "sextile," "ascendant," or ANY technical term. Translate EVERYTHING into plain emotional/life language.
- BAD: "The sun opposes your Scorpio stellium from across the sky. This cosmic tension between earthy stability and your deep water nature creates a powerful pull."
- GOOD: "You're caught between wanting to build something solid and needing to let something go. That push-pull feeling? It's real — and today it's louder than usual."
- Ground every insight in real life. Not "your 7th house is activated" but "partnerships are demanding your attention today."
- No emojis. No filler.
- 3-5 sentences for the horoscope. Tell one cohesive story, not disconnected observations. Make the reader feel SEEN, not lectured at.
- Write like you're texting your best friend who happens to be psychic — intimate, specific, human.

## Headline
- The "headline" is a short, evocative title for the day (3-7 words). It should capture the main theme.
- Examples: "The slow unraveling", "Your career is calling", "Everything wants your attention", "Let the mess be beautiful", "Something is finally clicking"
- NO astrology jargon in the headline. Never mention houses, signs, or planets. Make it emotional and poetic.
- NOT generic ("A good day ahead") — it should feel personal and specific.

## Vibes & Avoid
- "vibes" = 3-4 short phrases of what to lean into today. Feel like permissions or invitations. Use plain language a friend would use.
- "avoid" = 3-4 short phrases of what to watch for. Feel like gentle warnings, not doom.
- Both must connect to the actual chart + sky data but use ZERO jargon. Not "honor your Scorpio intensity" but "trust your gut even when it's uncomfortable."
- These should feel like advice from someone who knows you well, not an astrology textbook.

## CRITICAL: Variety & avoiding repetition
- If the user has a stellium (3+ planets in one sign/house), do NOT default to that house theme every day. The stellium is always there — it's background noise. Focus on what's DIFFERENT today: which transits are hitting OTHER parts of the chart? What's the moon activating that ISN'T the stellium?
- Rotate your focus across different life areas. If yesterday might have been about relationships, today should be about creativity, work, inner world, or something else.
- The day's story comes from what's CHANGING (transits, moon phase), not what's permanently strong in the chart.
- Only mention the stellium house if a specific transit is actively hitting planets IN that stellium today.

## CRITICAL: Accuracy
- ONLY reference placements that appear in the chart data below. If you say "your Venus in the 5th house," Venus MUST be in the 5th house.
- HOUSE NUMBERS: Each planet line includes a [HOUSE: Nth] tag. When you reference which house a planet is in, you MUST use the EXACT house number from that tag. Copy it directly — do not estimate, round, or infer house numbers.
- When mentioning transits, distinguish clearly: "Venus is moving through Taurus right now" (transit) vs "your natal Venus" (birth chart).
- Never fabricate placements. If unsure, focus on what you CAN see in the data.

## Output format
Respond with ONLY valid JSON, no markdown, no explanation:
{"headline":"...","horoscope":"...","vibes":["...","...","..."],"avoid":["...","...","..."]}`;

// Server-side daily cache keyed by user_id + date
// Uses Supabase horoscope_cache table for cross-device consistency
async function getCachedHoroscope(userId: string, dateStr: string) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    // Server-side only: use the service role so this table can have strict RLS
    // (no public/anon access). Falls back to anon if the service key is unset.
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await sb
      .from("horoscope_cache")
      .select("response")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .single();
    return data?.response || null;
  } catch { return null; }
}

async function setCachedHoroscope(userId: string, dateStr: string, response: object) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    // Server-side only: use the service role so this table can have strict RLS
    // (no public/anon access). Falls back to anon if the service key is unset.
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await sb
      .from("horoscope_cache")
      .upsert({ user_id: userId, date: dateStr, response }, { onConflict: "user_id,date" });
  } catch { /* best effort */ }
}

export async function POST(request: NextRequest) {
  // Require a signed-in user; derive their id from the verified token (never the body).
  const { getAuthedUserId } = await import("@/lib/apiAuth");
  const userId = await getAuthedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  // Rate limit per user (durable across workers when Redis is configured).
  const { checkRateLimitDurable } = await import("@/lib/rateLimit");
  const { allowed } = await checkRateLimitDurable(`horoscope:${userId}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limited. Horoscope should be cached — try refreshing." }, { status: 429 });
  }

  try {
    const body: HoroscopeRequest = await request.json();
    const { chart, celestial, transits, userName, lordOfTheYear } = body;

    // Check server-side cache (cross-device consistency)
    // Use the client's local date if provided, so all devices in the same timezone
    // get the same horoscope regardless of when they hit the UTC boundary.
    const localDate = (body as unknown as Record<string, unknown>).localDate as string | undefined;
    const todayStr = (localDate && /^\d{4}-\d{2}-\d{2}$/.test(localDate))
      ? localDate
      : new Date().toISOString().slice(0, 10);
    const forceRefresh = (body as unknown as Record<string, unknown>).forceRefresh === true;
    if (userId && !forceRefresh) {
      const cached = await getCachedHoroscope(userId, todayStr);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    if (!chart?.bigThree) {
      return NextResponse.json(
        { error: "No chart data provided." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured." },
        { status: 500 }
      );
    }

    // Build the context
    const contextParts: string[] = [];
    contextParts.push(buildChartBlock(chart, userName));
    contextParts.push(buildCelestialBlock(celestial));
    if (transits) contextParts.push(buildTransitBlock(transits));

    // Add Lord of the Year context if available
    if (lordOfTheYear) {
      const loyBlock = [
        "\n## Lord of the Year (Annual Profection)",
        `This person is in a ${lordOfTheYear.profectionHouse}${["st","nd","rd"][lordOfTheYear.profectionHouse-1] || "th"} house profection year.`,
        `Their Lord of the Year is ${lordOfTheYear.planet} (rules ${expandSign(lordOfTheYear.profectionSign)}).`,
        `IMPORTANT: If today's transits involve ${lordOfTheYear.planet} in any way, lead with that — "${lordOfTheYear.planet} is your year, and today..." framing. Transits to the Lord of the Year hit harder and are more personally significant this year.`,
      ].join("\n");
      contextParts.push(loyBlock);
    }

    // Add variety hint to prevent repetitive stellium focus
    const LIFE_THEMES = [
      "identity, appearance, personal energy",
      "money, self-worth, what you value",
      "communication, siblings, learning, short trips",
      "home, family, roots, inner world",
      "creativity, romance, fun, self-expression",
      "health, routines, work, daily life",
      "relationships, partnerships, one-on-one connections",
      "transformation, intimacy, shared resources, endings",
      "travel, higher learning, beliefs, expansion",
      "career, public image, ambition, legacy",
      "friends, community, hopes, future vision",
      "spirituality, solitude, dreams, the unconscious",
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const themeIndex = dayOfYear % 12;
    const varietyHint = `\n\n## Today's focus suggestion\nToday, try to center the reading around themes of: ${LIFE_THEMES[themeIndex]}. Only override this if a transit is STRONGLY hitting a different area (within 1° orb).`;

    const fullSystem = `${HOROSCOPE_SYSTEM_PROMPT}\n\n---\n\n${contextParts.join("\n\n")}${varietyHint}`;

    const client = new Anthropic({ apiKey });

    const response = await createMessageResilient(client, {
      max_tokens: 512,
      system: fullSystem,
      messages: [
        {
          role: "user",
          content: `Write today's daily horoscope for ${userName || "this person"}. Remember: JSON only, grounded in the actual chart data above.`,
        },
      ],
    });

    // Extract the text content
    const textBlock = response.content.find(b => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No response from AI." },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsed: { headline: string; horoscope: string; vibes: string[]; avoid: string[] };
    try {
      // Strip any markdown fencing if Claude added it despite instructions
      let raw = textBlock.text.trim();
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      parsed = JSON.parse(raw);
    } catch {
      console.error("Failed to parse horoscope JSON:", textBlock.text);
      return NextResponse.json(
        { error: "Failed to parse horoscope response." },
        { status: 500 }
      );
    }

    // Validate shape
    if (!parsed.headline) parsed.headline = "Your day";
    if (!parsed.horoscope || !Array.isArray(parsed.vibes) || !Array.isArray(parsed.avoid)) {
      return NextResponse.json(
        { error: "Invalid horoscope format." },
        { status: 500 }
      );
    }

    const result = {
      headline: parsed.headline,
      horoscope: parsed.horoscope,
      vibes: parsed.vibes.slice(0, 4),
      avoid: parsed.avoid.slice(0, 4),
      generatedAt: new Date().toISOString(),
    };

    // Cache server-side for cross-device consistency
    if (userId) {
      setCachedHoroscope(userId, todayStr, result);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Horoscope error:", errMsg, error);
    // Don't leak internal/provider error detail to the client.
    return NextResponse.json(
      { error: "Couldn't generate your horoscope right now." },
      { status: 500 }
    );
  }
}
