/**
 * Local fallback horoscope.
 *
 * The home page normally shows an AI-generated daily horoscope. If that call
 * fails for ANY reason — a retired model, an API outage, a rate-limit, a
 * network blip, missing chart data — we render this instead of a blank
 * "unavailable" message. It's built entirely from today's real sky data
 * (moon phase, zodiac season, planetary day) that the page already has, so it's
 * always available and always reflects the actual day. Plain language, no jargon,
 * matching the app's voice.
 */

interface CelestialLike {
  moonPhase: string;
  zodiacSeason?: string;
  seasonElement?: string;
  planetaryDay?: string;
  planetaryDayPlanet?: string;
}

interface BigThree {
  sun: string;
  moon: string;
  rising: string;
}

export interface FallbackHoroscope {
  headline: string;
  horoscope: string;
  vibes: string[];
  avoid: string[];
  generatedAt: string;
}

interface PhaseCopy {
  headline: string;
  opener: string;
  vibes: string[];
  avoid: string[];
}

const PHASES: { match: RegExp; copy: PhaseCopy }[] = [
  {
    match: /new/i,
    copy: {
      headline: "A quiet new beginning",
      opener:
        "The moon is dark right now, which in astrology is the most fertile kind of quiet — a blank page, the held breath before something starts.",
      vibes: ["Set one small intention", "Rest before you rush", "Let yourself imagine what's next"],
      avoid: ["Forcing a big launch today", "Mistaking stillness for being stuck"],
    },
  },
  {
    match: /waxing.*crescent/i,
    copy: {
      headline: "Early momentum is building",
      opener:
        "The first sliver of moon is back — the energy is young and building, the season of planting seeds rather than harvesting them.",
      vibes: ["Take one small step", "Protect a new idea", "Follow your curiosity"],
      avoid: ["Expecting instant results", "Talking the plan to death"],
    },
  },
  {
    match: /first.*quarter/i,
    copy: {
      headline: "Push through the first wall",
      opener:
        "The moon is half-lit — the point where momentum meets its first real obstacle. This is a doing day, not a dreaming one.",
      vibes: ["Make the decision", "Do the harder thing first", "Push through a little friction"],
      avoid: ["Backing down at the first no", "Overthinking the next move"],
    },
  },
  {
    match: /waxing.*gibbous/i,
    copy: {
      headline: "Almost there — refine it",
      opener:
        "The moon is nearly full, so things are close to ripe. This is the editing stage: small adjustments before the big reveal.",
      vibes: ["Refine instead of restarting", "Tie up loose ends", "Trust the work you've done"],
      avoid: ["Second-guessing everything", "Adding more when it's already enough"],
    },
  },
  {
    match: /full/i,
    copy: {
      headline: "Everything comes to light",
      opener:
        "The moon is full and bright — feelings, results, and truths are all at their peak. Whatever's been building wants to be seen now.",
      vibes: ["Let yourself feel it fully", "Celebrate something", "Say the thing out loud"],
      avoid: ["Making permanent decisions in a heightened moment", "Picking a fight you don't mean"],
    },
  },
  {
    match: /waning.*gibbous/i,
    copy: {
      headline: "Share what you've gathered",
      opener:
        "The moon is just past full and softening — the harvest is in, and now it's about gratitude and giving some of it back.",
      vibes: ["Share what you know", "Express some thanks", "Let a win actually land"],
      avoid: ["Clinging to the peak", "Overextending yourself"],
    },
  },
  {
    match: /last.*quarter|third.*quarter/i,
    copy: {
      headline: "Let something go",
      opener:
        "The moon is half-lit and shrinking — a turning point that asks what's worth keeping and what's ready to be released.",
      vibes: ["Release an old habit", "Forgive and move forward", "Clear a little space"],
      avoid: ["Holding on out of habit", "Starting something brand new"],
    },
  },
  {
    match: /waning.*crescent|balsamic/i,
    copy: {
      headline: "Rest and reset",
      opener:
        "The last sliver of moon — the exhale before the whole cycle begins again. This is a day for rest, not output.",
      vibes: ["Rest without guilt", "Reflect on the last month", "Be gentle with yourself"],
      avoid: ["Pushing for productivity", "Judging yourself for slowing down"],
    },
  },
];

const DEFAULT_PHASE: PhaseCopy = {
  headline: "Today's quiet weather",
  opener: "The sky has its own rhythm today, and you're part of it.",
  vibes: ["Move at your own pace", "Notice what you actually need", "Do one kind thing for yourself"],
  avoid: ["Comparing your day to anyone else's", "Forcing what isn't ready"],
};

const ELEMENT_MOOD: Record<string, string> = {
  fire: "a bold, restless",
  earth: "a grounded, practical",
  air: "a curious, social",
  water: "a tender, intuitive",
};

const DAY_FOCUS: Record<string, string> = {
  Sun: "showing up and being seen",
  Moon: "rest, home, and feeling your feelings",
  Mars: "action and getting things done",
  Mercury: "conversations, errands, and ideas",
  Jupiter: "growth, learning, and saying yes",
  Venus: "love, beauty, and small pleasures",
  Saturn: "focus, discipline, and steady work",
};

function phaseFor(moonPhase: string): PhaseCopy {
  for (const p of PHASES) if (p.match.test(moonPhase || "")) return p.copy;
  return DEFAULT_PHASE;
}

// ─── Chart-based personalization ─────────────────────────────────────────────

const SIGN_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_ELEMENT: Record<string, "fire" | "earth" | "air" | "water"> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

/** A short "lean into this today" vibe tuned to the user's Sun sign. */
const SUN_VIBE: Record<string, string> = {
  Aries: "Act on your first instinct",
  Taurus: "Move at your own steady pace",
  Gemini: "Say yes to the conversation",
  Cancer: "Tend to home and heart",
  Leo: "Let yourself be seen",
  Virgo: "Sort out one small thing",
  Libra: "Choose beauty and balance",
  Scorpio: "Trust your gut read",
  Sagittarius: "Follow the bigger question",
  Capricorn: "Take one real step on a goal",
  Aquarius: "Do it your own way",
  Pisces: "Make room for the dream",
};

/** How today's Sun (current zodiac season) relates to the user's natal Sun. */
function sunSeasonLine(seasonSign?: string, natalSun?: string): string | null {
  if (!seasonSign || !natalSun) return null;
  const si = SIGN_ORDER.indexOf(seasonSign);
  const ni = SIGN_ORDER.indexOf(natalSun);
  if (si < 0 || ni < 0) return null;
  const diff = ((ni - si) + 12) % 12;
  const el = SIGN_ELEMENT[natalSun] || "";
  switch (diff) {
    case 0:
      return `The Sun is moving through your own sign of ${natalSun} — your yearly reset, the month you're meant to be seen. Lead with it.`;
    case 6:
      return `With the Sun opposite your ${natalSun} Sun, your focus swings toward other people and partnership; balance is the quiet work of these weeks.`;
    case 4:
    case 8:
      return `The Sun is in fellow ${el} sign ${seasonSign}, moving in step with your ${natalSun} Sun — momentum is on your side right now.`;
    case 3:
    case 9:
      return `The Sun is squaring your ${natalSun} Sun — a little friction that's really an invitation to grow. Meet it head-on.`;
    case 2:
    case 10:
      return `The Sun is sextiling your ${natalSun} Sun — a supportive stretch where doors open if you actually knock.`;
    default:
      return `The Sun sits at an offbeat angle to your ${natalSun} Sun — a subtle recalibration; trust small adjustments over sweeping moves.`;
  }
}

export function buildFallbackHoroscope(c: CelestialLike, bigThree?: BigThree): FallbackHoroscope {
  const phase = phaseFor(c.moonPhase || "");
  const personalized = !!(bigThree?.sun && SIGN_ORDER.includes(bigThree.sun));

  const sentences = [phase.opener];
  const vibes = [...phase.vibes];

  if (personalized && bigThree) {
    const sunLine = sunSeasonLine(c.zodiacSeason, bigThree.sun);
    if (sunLine) sentences.push(sunLine);
    if (bigThree.moon && SIGN_ELEMENT[bigThree.moon]) {
      const mood = ELEMENT_MOOD[SIGN_ELEMENT[bigThree.moon]] || "a distinct";
      sentences.push(`Your Moon in ${bigThree.moon} gives today ${mood} emotional undertone.`);
    }
    if (c.planetaryDay && c.planetaryDayPlanet) {
      const focus = DAY_FOCUS[c.planetaryDayPlanet] || "tending to what matters to you";
      sentences.push(`It's ${c.planetaryDay}, a good day for ${focus}.`);
    }
    const sv = SUN_VIBE[bigThree.sun];
    if (sv) vibes.unshift(sv);
  } else {
    if (c.zodiacSeason) {
      const mood = ELEMENT_MOOD[(c.seasonElement || "").toLowerCase()] || "a distinct";
      sentences.push(`${c.zodiacSeason} season lends ${mood} undertone to everything right now.`);
    }
    if (c.planetaryDay && c.planetaryDayPlanet) {
      const focus = DAY_FOCUS[c.planetaryDayPlanet] || "tending to what matters to you";
      sentences.push(`It's ${c.planetaryDay}, a good day for ${focus}.`);
    }
  }

  sentences.push("Take it one moment at a time — the rest will follow.");

  return {
    headline: phase.headline,
    horoscope: sentences.join(" "),
    vibes: vibes.slice(0, 4),
    avoid: phase.avoid,
    generatedAt: new Date().toISOString(),
  };
}
