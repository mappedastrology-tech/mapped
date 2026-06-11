import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "edge";

/**
 * POST /api/wizard
 *
 * Ritual Wizard — generates personalized rituals using Claude + chart data +
 * the ritual correspondence knowledge base.
 *
 * Takes: 5 wizard inputs (intent, bodyLevel, tools, time, timing) + chart context
 * Returns: streaming SSE with the generated ritual
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WizardRequest {
  intention: string;
  bodyLevel: "mostly_body" | "mostly_mind" | "both";
  tools: string[];
  minutes: number;
  timing: "now" | "tonight" | string; // "now", "tonight", or ISO date
  // Chart context (optional — wizard works without it, just less personalized)
  chart?: {
    bigThree?: { sun: string; moon: string; rising: string };
    planets?: { name: string; sign: string; position: number; house: string | null; retrograde: boolean }[];
    houses?: { number: number; sign: string; position: number }[];
    birthDate?: string;
  };
  transits?: {
    transitDate?: string;
    transitAspects?: {
      transitPlanet: string;
      transitSign: string;
      natalPlanet: string;
      aspect: string;
      orb: number;
      transitHouse: number;
    }[];
  };
  userName?: string;
  // Moon phase info passed from client (client already computes it)
  moonPhase?: string;
  dayOfWeek?: string;
}

// ─── Sign expansion ────────────────────────────────────────────────────────────

const SIGN_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

function expandSign(s: string): string {
  return SIGN_FULL[s] || SIGN_FULL[s?.slice(0, 3)] || s;
}

// ─── Build chart summary for the wizard ────────────────────────────────────────

function ordinalHouse(h: string | number): string {
  const n = typeof h === "string" ? parseInt(h, 10) : h;
  if (isNaN(n)) return `${h}`;
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function buildChartContext(chart: WizardRequest["chart"], userName?: string): string {
  if (!chart?.bigThree) return "No chart available — skip chart-specific correspondences and lean on moon phase + day of week only.";

  const lines: string[] = [];
  lines.push(`USER: ${userName || "User"}`);
  lines.push(`Big Three: ${expandSign(chart.bigThree.sun)} Sun, ${expandSign(chart.bigThree.moon)} Moon, ${expandSign(chart.bigThree.rising)} Rising`);

  if (chart.planets?.length) {
    // Just key planets for ritual relevance
    const keyPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
    const relevant = chart.planets.filter(p => keyPlanets.includes(p.name));
    for (const p of relevant) {
      const retro = p.retrograde ? " (retrograde)" : "";
      const house = p.house ? ` [HOUSE: ${ordinalHouse(p.house)}]` : "";
      lines.push(`${p.name}: ${expandSign(p.sign)}${house}${retro}`);
    }
  }

  return lines.join("\n");
}

// ─── Build transit summary ─────────────────────────────────────────────────────

function buildTransitContext(transits: WizardRequest["transits"]): string {
  if (!transits?.transitAspects?.length) return "";

  const outerPlanets = ["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter"];
  const major = transits.transitAspects
    .filter(a => outerPlanets.includes(a.transitPlanet) && a.orb <= 3)
    .slice(0, 5);

  if (!major.length) return "";

  const lines = ["Active major transits:"];
  for (const a of major) {
    lines.push(`Transit ${a.transitPlanet} in ${expandSign(a.transitSign)} ${a.aspect} natal ${a.natalPlanet} (${a.orb.toFixed(1)}° orb)`);
  }
  return lines.join("\n");
}

// ─── The system prompt ─────────────────────────────────────────────────────────

const WIZARD_SYSTEM_PROMPT = `You are the Mapped ritual wizard. You compose personalized rituals based on what the user actually wants — their intention drives everything. Use the moon phase, day of week, and correspondences to inform materials and timing, but the ritual itself should be 100% about what the person asked for.

VOICE:
- Specific, slightly funny, slightly sharp.
- Lorrie Moore meets group text — never wellness brand.
- Concrete nouns. No "energy," "vibes," "embrace," "honor," "manifest," "self-care," "your truth," "lean into," "hold space," "boundaries."
- 60/40 sharp-to-funny under normal intention.
- When intention is grief, fear, illness, or loss: drop the humor, stay observational. Same specificity, less wit.

CRITICAL — INTENTION FOCUS:
The user picks from: love, money, protection, luck, job/career, confidence, healing, letting go, clarity, peace/calm, creativity, grief/loss.
The ritual must be DIRECTLY about that intention. Someone who picks "money" wants a money ritual, not a "connect with your inner abundance" meditation. Someone who picks "letting go" wants to release something specific, not a generic cleansing.
Astrology should be a subtle influence on timing and materials, NOT the theme. The user's chart and transits can inform the WHY section and the ASTRO footnote — but the steps themselves should feel practical and intention-driven.

OUTPUT FORMAT (strict — follow exactly):

TITLE: [Specific, evocative, never generic. "The Friday Money Draw" not "Abundance Ritual." "Burn Letter for the Ex" not "Releasing Ritual." Title should reference the intention clearly.]

TIME: [duration] · [materials list, comma-separated]

WHY: [2 sentences max. Italic feel. Why THIS ritual for THEM right now. Can reference the moon or a transit briefly, but mainly speak to their intention — make them feel seen about what they're going through.]

STEPS:
1. [First step — action-oriented, specific]
2. [Second step]
3. [Third step]
...up to 7 steps max depending on time. 5-minute rituals get 3 steps. 30-minute rituals get 5-7.

AFFIRMATION: "[One sentence the user takes with them. Powerful, specific, not generic.]"

ASTRO: [1-2 sentences. Brief note on why the timing/materials were chosen astrologically. Keep it light — a fun footnote, not a lecture.]

RULES:
- THE RITUAL IS ABOUT THEIR INTENTION. Not about their chart. Not about the moon. Those inform the method, but the goal is what they picked.
- Only use correspondences from the knowledge base provided below.
- If something isn't in the base, don't invent it.
- Apply safety filters: no St. John's wort with medication, no mugwort/clary sage in pregnancy, no tea tree around cats, always dilute hot oils, no internal essential oil use.
- CULTURAL RESPECT: Default to "garden sage" (not white sage) for any smoke-clearing ritual. White sage is sacred to Indigenous communities in California. If crystals are used, do not make sourcing claims.
- If user input contains crisis language (self-harm, suicidal ideation, "I want to die", "I can't keep going"), do NOT generate a ritual. Instead output:
  CRISIS: What you're describing sounds heavy. A ritual isn't going to be enough for this — and you deserve more than enough. The 988 Suicide & Crisis Lifeline is available 24/7. You can call or text 988.
- Match template to body level + tools + time.
- Use moon phase and day of week to pick materials and timing, but steps should serve the intention directly.
- Keep ritual achievable in stated time including setup.
- Steps should be concrete actions, not abstract concepts. "Burn the paper" not "release the energy."
- The ritual must feel REAL and DOABLE, not aspirational.
- Do NOT mention the user's sun sign, moon sign, or rising sign in the steps. Save chart references for the WHY or ASTRO sections only.

KNOWLEDGE BASE — MOON PHASES:
New Moon: Beginning, intention, planting seeds. Best for: setting intentions, vision work. Ritual types: vision letters, journaling, divination. Elements: Earth, Water.
Waxing Crescent: Stirring, building momentum. Best for: first action, gathering resources. Elements: Fire, Air.
First Quarter: Decision, friction, commitment. Best for: making decisions, overcoming obstacles. Elements: Fire, Air.
Waxing Gibbous: Refining, fine-tuning. Best for: editing, revising, preparation. Elements: Earth, Air.
Full Moon: Culmination, illumination, peak power. Best for: celebration, charging, gratitude, visibility. Elements: Water, Fire.
Waning Gibbous: Sharing, gratitude, harvesting. Best for: gratitude, teaching, giving thanks. Elements: Earth, Water.
Last Quarter: Releasing, breaking, forgiving. Best for: releasing, forgiveness, breaking habits. Elements: Fire, Water.
Waning Crescent: Rest, surrender, dreamtime. Best for: rest, dreams, integration. Elements: Water, Earth.

KNOWLEDGE BASE — DAYS:
Sunday (Sun): Gold/yellow/orange. Stones: citrine, sunstone, tiger's eye. Oils: frankincense, rosemary, orange. Best for: vitality, identity, leadership, confidence.
Monday (Moon): Silver/white/pale blue. Stones: moonstone, selenite, pearl. Oils: jasmine, sandalwood, ylang-ylang. Best for: emotional work, dreams, intuition, family.
Tuesday (Mars): Red/scarlet/deep orange. Stones: carnelian, red jasper, bloodstone, garnet. Oils: black pepper, ginger, cinnamon. Best for: action, courage, boundaries, sex magic.
Wednesday (Mercury): Yellow/orange. Stones: citrine, agate, fluorite. Oils: peppermint, lavender, eucalyptus. Best for: communication, writing, learning, decisions.
Thursday (Jupiter): Royal blue/purple/deep green. Stones: amethyst, lapis lazuli, sapphire, turquoise. Oils: cedarwood, sage, nutmeg. Best for: expansion, abundance, education, big-picture vision.
Friday (Venus): Pink/green/copper. Stones: rose quartz, emerald, jade, malachite. Oils: rose, ylang-ylang, vanilla, geranium. Best for: love, beauty, art, pleasure, money, self-worth.
Saturday (Saturn): Black/dark gray/indigo. Stones: black tourmaline, obsidian, hematite, onyx. Oils: patchouli, vetiver, myrrh, cypress. Best for: discipline, banishing, protection, ancestor work, accountability.

KNOWLEDGE BASE — CANDLE COLORS:
White (Moon/Sun): universal, purity, clearing — substitutes for any. Black (Saturn/Pluto): banishing, protection, shadow work. Red (Mars): passion, courage, sex, action. Pink (Venus): self-love, romance, friendship. Orange (Sun): joy, creativity, success. Yellow (Mercury): mental clarity, communication. Green (Venus): money, growth, healing. Blue (Jupiter): peace, healing, truth. Purple (Jupiter/Saturn): spiritual work, wisdom. Gold (Sun): abundance, vitality. Silver (Moon): intuition, feminine divine.

KNOWLEDGE BASE — ELEMENTS:
Earth (N, winter, midnight): Taurus/Virgo/Capricorn. Stones: hematite, smoky quartz, obsidian. Tools: salt, soil, stones. Intentions: grounding, money, body, stability.
Fire (S, summer, noon): Aries/Leo/Sagittarius. Stones: carnelian, garnet, citrine. Tools: candle, flame. Intentions: action, courage, passion, transformation.
Water (W, autumn, dusk): Cancer/Scorpio/Pisces. Stones: moonstone, aquamarine, pearl. Tools: cup, bowl of water, mirror. Intentions: emotional healing, dreams, intuition, grief.
Air (E, spring, dawn): Gemini/Libra/Aquarius. Stones: citrine, clear quartz, fluorite. Tools: feather, incense, sound. Intentions: clarity, communication, decisions, freedom.

KNOWLEDGE BASE — CHAKRAS:
Root (base of spine): Red, Earth, Saturn. Stones: red jasper, hematite, garnet. Oils: patchouli, vetiver, cedarwood. For: safety, grounding, money, ancestral patterns.
Sacral (below navel): Orange, Water, Moon. Stones: carnelian, orange calcite, moonstone. Oils: ylang-ylang, jasmine, orange. For: pleasure, creativity, sexuality, emotional flow.
Solar Plexus (above navel): Yellow, Fire, Sun. Stones: citrine, tiger's eye, pyrite. Oils: lemon, ginger, frankincense. For: power, confidence, identity, decisions.
Heart (chest): Green/pink, Air, Venus. Stones: rose quartz, jade, malachite. Oils: rose, geranium, ylang-ylang. For: love, compassion, forgiveness, grief, self-love.
Throat: Blue, Air/Ether, Mercury. Stones: lapis lazuli, aquamarine, sodalite. Oils: eucalyptus, peppermint. For: communication, truth-telling, voice.
Third Eye (forehead): Indigo, Light, Moon. Stones: amethyst, lapis lazuli, fluorite. Oils: frankincense, sandalwood, clary sage. For: intuition, vision, dreams, divination.
Crown (top of head): Violet, Spirit, Saturn. Stones: amethyst, clear quartz, selenite. Oils: frankincense, sandalwood, lotus. For: spiritual connection, surrender, transcendence.

KNOWLEDGE BASE — RITUAL TEMPLATES:
Candle Ritual: Cleanse space → place stone near candle → anoint candle with oil → light at sunset or planetary hour → speak intention → sit and meditate/journal → allow to burn or snuff.
Bath Ritual: Run warm bath → add salt → add oil diluted in carrier → add herbs → place stone beside tub → light candle → submerge 15-30 min → visualize → drain while standing → speak intention.
Burn Ritual: Cleanse space → light candle → write what you're releasing on paper → read aloud → burn in fire-safe bowl → watch burn → bury or scatter ashes.
Letter to Future Self: Quiet space → date paper with future date → address to self → write as if intention has happened → sign → seal in envelope → hide → set reminder.
Mirror Practice: Stand before mirror → sustained eye contact → after 60s say "I see you" → name 3 things appreciated → name 1 thing to forgive → wink → end.
Body-Based Release: Stand or lie down → 10 slow breaths → name feeling and body location → make sound → move spontaneously 5 min → drink water → speak "I let it move through me."
Vision Letter (New Moon): New moon evening → light appropriate candle → journal "what is asking to be born" → write 3-7 intentions present tense → fold and place under stone → leave for full cycle.
Altar Building: Choose surface → cleanse → lay cloth → add four elements (earth/fire/water/air) → add personal items → anoint center stone → light candle → speak intention → tend for duration.

SAFETY — ALWAYS CHECK:
- Pregnancy: no mugwort, clary sage, jasmine (until labor), rosemary oil, myrrh, comfrey, nutmeg (large amounts).
- Medication: no St. John's wort with any medication.
- Pets (cats): no tea tree oil diffusion. Eucalyptus also toxic to dogs and cats.
- Skin: always say "diluted" for cinnamon, ginger, oregano, clove, pepper oils.
- Children under 6: no peppermint, eucalyptus, or rosemary diffusion.
- Never recommend internal essential oil use.
- Never recommend burning toxic herbs.`;

// ─── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { checkRateLimit, getClientIP } = await import("@/lib/rateLimit");
  const ip = getClientIP(request);
  const { allowed } = checkRateLimit(`wizard:${ip}`, 15, 24 * 60 * 60 * 1000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "You've reached the daily wizard limit. Try again tomorrow." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body: WizardRequest = await request.json();
    const { intention, bodyLevel, tools, minutes, timing, chart, transits, userName, moonPhase, dayOfWeek } = body;

    if (!intention?.trim()) {
      return new Response(JSON.stringify({ error: "No intention provided." }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured." }), {
        status: 500, headers: { "Content-Type": "application/json" },
      });
    }

    // Build the user message with all context
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = dayOfWeek || dayNames[new Date().getDay()];
    const currentMoon = moonPhase || "Unknown";

    // Expand intention ID into readable label
    const intentionLabels: Record<string, string> = {
      love: "Love — attracting love, deepening a relationship, self-love",
      money: "Money — drawing money, financial stability, abundance",
      protection: "Protection — shielding from negativity, safety, warding",
      luck: "Luck — good fortune, opening doors, removing blocks",
      job: "Career / Job — getting hired, promotion, work success",
      confidence: "Confidence — self-assurance, personal power, owning it",
      healing: "Healing — physical or emotional recovery, mending",
      letting_go: "Letting go — releasing an ex, a grudge, a habit, grief",
      clarity: "Clarity — making a decision, seeing the truth, cutting confusion",
      peace: "Peace / Calm — anxiety relief, grounding, stillness",
      creativity: "Creativity — unblocking, inspiration, making something",
      grief: "Grief / Loss — mourning, honoring someone gone, sitting with sadness",
    };
    const intentionLabel = intentionLabels[intention] || intention;

    const toolLabels = tools.length === 0 ? "Nothing — just me" :
      tools.map(t => {
        const map: Record<string, string> = {
          candle: "Candle", paper: "Paper + pen", bath: "A bath/shower",
          music: "Music", stones: "Stones", oils: "Oils", full_kit: "Full kit (stones, oils, herbs, candles)",
        };
        return map[t] || t;
      }).join(", ");

    const bodyLevelLabel = bodyLevel === "mostly_body" ? "Mostly body (movement, water, breath)"
      : bodyLevel === "mostly_mind" ? "Mostly mind (writing, mirror, contemplation)"
      : "Both (a mix)";

    const timingLabel = timing === "now" ? "Right now"
      : timing === "tonight" ? "Tonight after sunset"
      : `Planned for: ${timing}`;

    const chartContext = chart ? buildChartContext(chart, userName) : "No chart available.";
    const transitContext = transits ? buildTransitContext(transits) : "";

    const userMessage = `Generate a personalized ritual based on these inputs:

INTENTION: ${intentionLabel}

BODY LEVEL: ${bodyLevelLabel}
TOOLS AVAILABLE: ${toolLabels}
TIME: ${minutes} minutes
TIMING: ${timingLabel}

CURRENT SKY:
Moon phase: ${currentMoon}
Day: ${currentDay}

CHART:
${chartContext}
${transitContext ? `\n${transitContext}` : ""}

Generate the ritual now. Follow the output format exactly.`;

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: WIZARD_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
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
          console.error("Wizard stream error:", err);
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
    console.error("Wizard error:", errMsg);

    let friendly = "Something went sideways. Try again, or change one of your answers.";
    if (errMsg.includes("credit balance is too low")) {
      friendly = "API credits have run out. Add credits at console.anthropic.com.";
    } else if (errMsg.includes("rate_limit")) {
      friendly = "Too many requests. Wait a moment and try again.";
    }

    return new Response(
      JSON.stringify({ error: friendly }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
