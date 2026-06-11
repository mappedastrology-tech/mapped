/**
 * Chart Insights — human-readable interpretations for chart analysis findings.
 *
 * Each function takes raw analysis results and returns interpretation text
 * in plain language. No astro-jargon without explanation.
 */

/* ─── Types ─── */

export interface PatternInterpretation {
  title: string;
  emoji: string;
  summary: string;
  detail: string;
}

export interface CriticalDegreeInterpretation {
  title: string;
  summary: string;
}

export interface DignityInterpretation {
  label: string;
  emoji: string;
  summary: string;
}

export interface MoonPhaseInterpretation {
  emoji: string;
  title: string;
  summary: string;
}

export interface SectInterpretation {
  title: string;
  summary: string;
}

export interface BalanceInterpretation {
  summary: string;
}

export interface HouseInterpretation {
  summary: string;
}

export interface AngularInterpretation {
  summary: string;
}

export interface RetrogradeInterpretation {
  summary: string;
}

/* ─── 1. Pattern Interpretations ─── */

const PATTERNS: Record<string, PatternInterpretation> = {
  stellium: {
    title: "Concentrated power",
    emoji: "🔥",
    summary:
      "When 3+ planets cluster in one sign or house, that area of life gets ALL your energy.",
    detail:
      "It's your superpower and your obsession. The house and sign where the stellium falls is where you pour everything — talent, attention, anxiety, ambition. Other areas of life might feel neglected because this one demands so much of you. The upside: unmatched depth and expertise in that domain. The downside: tunnel vision.",
  },
  "t-square": {
    title: "Productive tension",
    emoji: "⚡",
    summary:
      "Three planets locked in a triangle of friction. The apex planet is where all the pressure lands.",
    detail:
      "And where your biggest growth happens. T-squares are restless — they won't let you coast. The two planets in opposition create a constant push-pull, and the apex planet gets squeezed by both sides. It's uncomfortable, but it's the engine that drives achievement. Most high-performers have one. You don't get to relax here — but you get to be extraordinary.",
  },
  "grand-trine": {
    title: "Natural talent",
    emoji: "🌊",
    summary:
      "Three planets flowing effortlessly in the same element. This is what comes easy to you.",
    detail:
      "Almost too easy. Grand trines represent gifts you were born with — abilities that feel so natural you might not even recognize them as special. The risk is coasting: because this energy flows without effort, you may never fully develop it. The trine needs a challenge (usually from a square or opposition elsewhere) to activate its potential. Without friction, talent stays latent.",
  },
  yod: {
    title: "A pointed calling",
    emoji: "☝️",
    summary:
      "Two planets funnel their energy into one focal point through uncomfortable angles.",
    detail:
      "You can't ignore what the Yod points to — it's your mission, whether you like it or not. The apex planet feels fated, non-negotiable. The two base planets cooperate to push energy toward it through awkward angles that demand constant adjustment. People with Yods often feel a sense of purpose they can't quite articulate until midlife. It's not comfortable. It is meaningful.",
  },
  kite: {
    title: "Talent with direction",
    emoji: "🪁",
    summary:
      "A grand trine that actually goes somewhere, thanks to an opposition that gives it purpose.",
    detail:
      "You have gifts AND the drive to use them. The opposition creates tension within the flowing trine — a specific goal or relationship that channels all that effortless energy toward something concrete. This is one of the most productive patterns in a chart: natural ability plus motivation. The planet opposite the apex of the kite is your focal point — where everything comes together.",
  },
  "grand-cross": {
    title: "The pressure cooker",
    emoji: "✚",
    summary:
      "Four planets in maximum tension. Everything pulls in a different direction.",
    detail:
      "It's exhausting and it produces extraordinary people. A grand cross is two oppositions that also square each other — cardinal, fixed, or mutable. The pressure is constant and comes from all sides. There's no easy release valve. But the people who carry this pattern develop incredible resilience, resourcefulness, and multi-dimensional competence. You learn to hold contradictions because you have no other choice.",
  },
  "mystic-rectangle": {
    title: "Structured flow",
    emoji: "🔷",
    summary:
      "Two oppositions held together by trines and sextiles. Tension exists, but it's productive.",
    detail:
      "Like a well-designed bridge — it carries weight precisely because of how the forces balance. The oppositions provide awareness and drive; the trines and sextiles provide outlets and resolution. This pattern gives you the ability to see both sides of any situation AND find workable solutions. It's practical wisdom built into your chart's architecture.",
  },
};

export function getPatternInterpretation(
  pattern: string
): PatternInterpretation | undefined {
  return PATTERNS[pattern.toLowerCase()];
}

/* ─── 2. Critical Degree Interpretations ─── */

export function getCriticalDegreeInterpretation(
  type: string,
  planet: string,
  sign: string
): CriticalDegreeInterpretation {
  switch (type.toLowerCase()) {
    case "anaretic":
      return {
        title: "Last call",
        summary: `${planet} at the final degree of ${sign}. There's urgency here — like finishing an exam as the clock runs out. You're completing a deep lesson around ${planet}'s themes, and there's a sense of mastery tinged with exhaustion. This degree carries the weight of everything you've learned in this sign.`,
      };
    case "zero":
    case "zero-degree":
      return {
        title: "Fresh start",
        summary: `${planet} at the very beginning of ${sign}. Raw, unformed, pure expression. You're learning this energy from scratch, with beginner's mind. There's excitement and awkwardness here — like the first day at a new job. The potential is enormous, the confidence is still building.`,
      };
    case "critical":
    case "critical-cardinal":
      return {
        title: "Turning point",
        summary: `${planet} sits at a critical degree in a starter sign. Cardinal critical degrees (0°, 13°, 26°) are associated with fate and new beginnings. Events connected to ${planet} tend to feel pivotal — like the universe is pushing you to make a move, start something, or take charge.`,
      };
    case "critical-fixed":
      return {
        title: "Power degree",
        summary: `${planet} sits at a critical degree in a sustainer sign. Fixed critical degrees (8–9°, 21–22°) are associated with stubborn determination and deep focus. Events connected to ${planet} tend to feel immovable and intensely important — once you commit, there's no turning back.`,
      };
    case "critical-mutable":
      return {
        title: "Crossroads",
        summary: `${planet} sits at a critical degree in an adapter sign. Mutable critical degrees (4°, 17°) are associated with pivotal choices and sudden shifts. Events connected to ${planet} tend to arrive as crossroads moments — a fork in the road where you have to choose a direction.`,
      };
    case "cazimi":
      return {
        title: "Hidden gift",
        summary: `${planet} is so close to the Sun it's literally in its heart. Instead of being burned, it's purified. This is a rare and powerful placement — a gift you carry that most people never develop. ${planet}'s energy is fused with your core identity in a way that makes it effortless and potent.`,
      };
    case "combust":
      return {
        title: "Overshadowed",
        summary: `${planet} is too close to the Sun — its energy gets absorbed into your identity. You might struggle to access ${planet}'s themes independently; they're always tangled up with ego. Other people might not see this planet's expression in you clearly, even though you feel it intensely.`,
      };
    case "under-the-beams":
      return {
        title: "In the Sun's shadow",
        summary: `${planet} is weakened by proximity to the Sun. Its energy is present but muted — like a voice you can hear but can't quite make out. You know ${planet}'s themes matter to you, but expressing them clearly takes more effort than it should.`,
      };
    default:
      return {
        title: "Notable degree",
        summary: `${planet} in ${sign} sits at a significant degree that adds emphasis to this placement.`,
      };
  }
}

/* ─── 3. Dignity Interpretations ─── */

export function getDignityInterpretation(
  planet: string,
  dignity: string,
  sign: string
): DignityInterpretation {
  switch (dignity.toLowerCase()) {
    case "domicile":
      return {
        label: "At home",
        emoji: "🏠",
        summary: `${planet} in ${sign} is in its own territory. It operates at full strength, comfortable and effective. Think of it as a chef in their own kitchen — every tool is where it should be, every recipe is second nature. This planet does its job well without extra effort.`,
      };
    case "exaltation":
      return {
        label: "Honored guest",
        emoji: "👑",
        summary: `${planet} in ${sign} is elevated, empowered, performing at its best. Like being given the keynote speech — this planet shines here. The sign brings out the highest expression of what the planet can do. It's not home, but it's the place where it's most celebrated.`,
      };
    case "detriment":
      return {
        label: "Working against the grain",
        emoji: "🔧",
        summary: `${planet} in ${sign} is in uncomfortable territory — the opposite of where it's strongest. It still works, but it has to work harder. The friction creates character. You might express this planet's energy in unconventional ways, or feel like you're doing things the hard way. That's not failure — it's originality forged under pressure.`,
      };
    case "fall":
      return {
        label: "Struggling",
        emoji: "🪨",
        summary: `${planet} in ${sign} is at its lowest conventional power. The energy is present but it expresses awkwardly or gets blocked. This is where your chart asks you to grow through difficulty. The planet's lessons come harder here — but what you earn through effort, nobody can take from you.`,
      };
    default:
      return {
        label: "Peregrine",
        emoji: "🧭",
        summary: `${planet} in ${sign} has no special dignity — it's a wanderer, operating on its own terms. Not strengthened, not weakened. It expresses itself neutrally, shaped more by aspects and house placement than by sign affinity.`,
      };
  }
}

/* ─── 4. Moon Phase Interpretations ─── */

const MOON_PHASES: Record<string, MoonPhaseInterpretation> = {
  "new-moon": {
    emoji: "🌑",
    title: "The Seed",
    summary:
      "You were born at a beginning. Your life pattern is about initiating, starting fresh, planting seeds others will harvest. You're a natural pioneer — instinctive, subjective, driven by impulse rather than precedent. You trust your gut because you have to; there's no map where you're going.",
  },
  "waxing-crescent": {
    emoji: "🌒",
    title: "The Sprout",
    summary:
      "You were born into momentum. Your life is about pushing forward against resistance, building something from a tiny impulse into reality. There's a struggle here — the seed is breaking through soil — but also unstoppable determination. You don't quit when things get hard; you push harder.",
  },
  "first-quarter": {
    emoji: "🌓",
    title: "The Builder",
    summary:
      "You were born at a crisis point. Your life involves decisive action, turning points, and the courage to commit when others hesitate. You're built for moments that require choice — the kind where you can't go back. Indecision is your enemy; action is your medicine.",
  },
  "waxing-gibbous": {
    emoji: "🌔",
    title: "The Refiner",
    summary:
      "You were born in the polishing phase. Your life is about perfecting, analyzing, and preparing something for its moment in the spotlight. You see what's almost right and know exactly how to fix it. Your gift is refinement — taking the good and making it great.",
  },
  "full-moon": {
    emoji: "🌕",
    title: "The Illuminator",
    summary:
      "You were born at maximum light. Your life is about relationships, awareness, and bringing things to their fullest expression. You live out loud — your internal world is visible to others whether you intend it or not. Objectivity and partnership are your path to self-knowledge.",
  },
  "waning-gibbous": {
    emoji: "🌖",
    title: "The Teacher",
    summary:
      "You were born in the sharing phase. Your life is about distributing wisdom, mentoring, and giving back what you've learned. You process experience by explaining it — to yourself and others. Knowledge isn't real to you until you've shared it.",
  },
  "last-quarter": {
    emoji: "🌗",
    title: "The Revolutionary",
    summary:
      "You were born at another crisis. Your life involves tearing down what no longer works and clearing space for what comes next. You have an instinct for what's outlived its usefulness — systems, beliefs, relationships. You're the one who says 'this isn't working' when everyone else is still pretending.",
  },
  balsamic: {
    emoji: "🌘",
    title: "The Mystic",
    summary:
      "You were born in the dark of the moon. Your life is about endings, release, and preparing the soil for the next cycle. You carry old-soul energy — a sense that you've been here before and you're tying up loose ends. Solitude feeds you. You see what others miss because you're looking at a different layer of reality.",
  },
};

export function getMoonPhaseInterpretation(
  phase: string
): MoonPhaseInterpretation | undefined {
  return MOON_PHASES[phase.toLowerCase().replace(/\s+/g, "-")];
}

/* ─── 5. Sect Interpretation ─── */

export function getSectInterpretation(isDayChart: boolean): SectInterpretation {
  if (isDayChart) {
    return {
      title: "Day chart",
      summary:
        "You were born during the day, so the Sun is your guide. Jupiter is your luckiest planet — your best source of opportunities and growth. Saturn is where your toughest lessons show up. You thrive when things are clear, visible, and out in the open. Conscious effort works better for you than intuition alone.",
    };
  }
  return {
    title: "Night chart",
    summary:
      "You were born at night, so the Moon is your guide. Venus is your luckiest planet — your best source of pleasure, connection, and grace. Mars is where your biggest challenges and frustrations live. You thrive on intuition, subtlety, and emotional intelligence. You read between the lines better than most.",
  };
}

/* ─── 6. Balance Interpretations ─── */

const ELEMENT_DOMINANT: Record<string, string> = {
  fire:
    "You lead with passion, action, and inspiration. You might burn hot and fast — quick to ignite, quick to move on. Your energy is contagious but it needs fuel and direction to sustain.",
  earth:
    "You're practical, grounded, results-oriented. You build things that last. The tangible world is where you feel most real — what you can touch, measure, and produce. Patience is your secret weapon.",
  air:
    "You're intellectual, social, idea-driven. You connect dots others miss and communicate with natural ease. Your mind moves fast; the challenge is landing somewhere long enough to build.",
  water:
    "You're emotionally intelligent, intuitive, empathetic. You feel everything — yours and everyone else's. Your depth is your power, but you need boundaries to keep from drowning in other people's weather.",
};

const ELEMENT_LACKING: Record<string, string> = {
  fire:
    "Initiative and confidence need conscious cultivation. You might hesitate where others leap, or struggle to advocate for yourself. The fix isn't faking boldness — it's finding what genuinely lights you up and letting that be your engine.",
  earth:
    "Grounding and follow-through are growth areas. Great ideas might stay ideas; practical details might bore you. Building routines and honoring the physical world (body, finances, schedules) is your work.",
  air:
    "Communication and objectivity require effort. You might feel things deeply but struggle to articulate them, or get so caught up in experience that perspective is hard to find. Writing things down helps.",
  water:
    "Emotional attunement and vulnerability are your edge work. You might intellectualize feelings or push through discomfort without processing it. Learning to sit with emotion — without fixing, explaining, or escaping — is where your growth lives.",
};

export function getElementBalanceInterpretation(balance: {
  dominant?: string;
  lacking?: string;
}): BalanceInterpretation {
  const parts: string[] = [];

  if (balance.dominant) {
    const key = balance.dominant.toLowerCase();
    if (ELEMENT_DOMINANT[key]) parts.push(ELEMENT_DOMINANT[key]);
  }

  if (balance.lacking) {
    const key = balance.lacking.toLowerCase();
    if (ELEMENT_LACKING[key]) parts.push(ELEMENT_LACKING[key]);
  }

  return { summary: parts.join(" ") || "Your elemental balance is relatively even — no single element dominates or is noticeably absent." };
}

const MODALITY_DOMINANT: Record<string, string> = {
  cardinal:
    "You initiate. You start things. Leadership comes naturally — you see what needs to happen and you move first. The risk: starting more than you finish, or bulldozing others in your urgency to begin.",
  fixed:
    "You sustain. You're persistent, loyal, sometimes stubborn. You finish what you start and hold the line when others waver. The risk: rigidity, resistance to necessary change, holding on past the point of usefulness.",
  mutable:
    "You adapt. You're flexible, versatile, sometimes scattered. You're the bridge between endings and beginnings — able to shift shape as circumstances demand. The risk: inconsistency, people-pleasing, losing yourself in constant adjustment.",
};

export function getModalityBalanceInterpretation(balance: {
  dominant?: string;
}): BalanceInterpretation {
  if (balance.dominant) {
    const key = balance.dominant.toLowerCase();
    if (MODALITY_DOMINANT[key]) return { summary: MODALITY_DOMINANT[key] };
  }
  return { summary: "Your modality balance is relatively even — you can initiate, sustain, and adapt with roughly equal facility." };
}

/* ─── 7. House Marker Interpretations ─── */

const HOUSE_EMPHASIS: Record<number, string> = {
  1: "Your chart emphasizes identity and self-expression. Life keeps asking: who are you, really? Your appearance, body, and first impressions carry unusual weight.",
  2: "Your chart emphasizes resources and values. What you own, earn, and find worthy — these themes dominate. Self-worth and material security are central storylines.",
  3: "Your chart emphasizes communication and immediate environment. Siblings, neighbors, daily movement, learning, writing — you're wired to connect and exchange information constantly.",
  4: "Your chart emphasizes home, roots, and emotional foundations. Family of origin, private life, and where you feel safe — these are your defining themes.",
  5: "Your chart emphasizes creativity, romance, and self-expression. Joy, play, children, art, risk-taking — you need outlets for your creative fire or you wilt.",
  6: "Your chart emphasizes daily work and health. Routines, service, craftsmanship, and wellness — you find meaning in the details and the discipline of showing up every day.",
  7: "Your chart emphasizes partnership and one-on-one relationships. You discover who you are through others. Marriage, business partnerships, and open enemies all teach you.",
  8: "Your chart emphasizes transformation, shared resources, and intimacy. Sex, death, other people's money, psychological depth — you're drawn to what most people avoid.",
  9: "Your chart emphasizes meaning, travel, and higher learning. Philosophy, foreign cultures, publishing, law — you need a big-picture framework to make sense of life.",
  10: "Your chart emphasizes career, reputation, and public role. What you're known for matters enormously. Legacy, ambition, and authority are central themes.",
  11: "Your chart emphasizes community, friendship, and collective vision. Groups, networks, hopes for the future — you thrive when you're part of something bigger than yourself.",
  12: "Your chart emphasizes the unconscious, solitude, and transcendence. What's hidden, what's spiritual, what's sacrificed — your inner life is richer (and more demanding) than most.",
};

export function getHouseEmphasisInterpretation(house: number): HouseInterpretation {
  return {
    summary: HOUSE_EMPHASIS[house] || `House ${house} is emphasized in your chart, drawing extra focus to its life themes.`,
  };
}

export function getAngularPlanetInterpretation(
  planet: string,
  type: "angular" | "cadent" = "angular"
): AngularInterpretation {
  if (type === "angular") {
    return {
      summary: `${planet} sits at one of the four most powerful points in your chart — the spots that govern your identity, relationships, career, and private life. This makes ${planet}'s themes highly visible. Other people notice them in you immediately. You can't hide what this planet represents even if you try.`,
    };
  }
  return {
    summary: `${planet} works behind the scenes in your chart. Its energy is more internal and subtle — shaping your thoughts, daily routines, beliefs, or unconscious patterns. It's not less important than other planets, just less visible to others. You feel it more than people see it.`,
  };
}

/* ─── 8. Retrograde Interpretations ─── */

const RETROGRADES: Record<string, string> = {
  mercury:
    "You process differently. Internal thinker, often brilliant but misunderstood communicator. You revise and refine ideas others rush through. Your first draft isn't your best — your third is. You might say things backward, think in spirals, or need extra time to articulate what you know. That's not a deficit; it's depth.",
  venus:
    "You love differently. Your relationship patterns don't follow the standard script. You may revisit past relationships or have unconventional values around beauty, pleasure, and connection. What you find attractive, how you show affection, what you consider worthy — it's all slightly off the beaten path. That's not broken; it's original.",
  mars:
    "You assert differently. Your anger goes inward before it goes outward. You're strategic rather than impulsive, but that bottled energy needs release. You might struggle with direct confrontation or find that your drive operates in bursts rather than steady flames. Physical outlets and conscious anger work are essential, not optional.",
  jupiter:
    "You grow differently. Expansion happens internally before it shows externally. You might question conventional definitions of success or feel that abundance comes in waves rather than steady accumulation. Your philosophical development is rich but private.",
  saturn:
    "You structure differently. Authority and discipline are things you had to figure out on your own terms — external rules never quite fit. You might bloom later in life, or find that your relationship to responsibility is complex and self-directed.",
};

export function getRetrogradeInterpretation(
  planet: string
): RetrogradeInterpretation {
  const key = planet.toLowerCase();
  return {
    summary: RETROGRADES[key] || `${planet} retrograde in your natal chart means its energy turns inward. You experience ${planet}'s themes in a more reflective, internalized way than most — revisiting, revising, and developing a personal relationship with that energy over time.`,
  };
}

/* ─── 9. Other Markers ─── */

export function getMutualReceptionInterpretation(
  planet1: string,
  sign1: string,
  planet2: string,
  sign2: string
): { title: string; summary: string } {
  return {
    title: "Planets helping each other",
    summary: `${planet1} is in the sign that ${planet2} rules, and ${planet2} is in the sign that ${planet1} rules — so they're in each other's "home." It's like two friends house-sitting for each other: each one has access to the other's resources. This gives both planets extra strength. In your life, the themes of ${planet1} (${planet1 === "Venus" ? "love, values" : planet1 === "Mars" ? "drive, action" : planet1 === "Mercury" ? "thinking, communication" : planet1 === "Moon" ? "emotions, needs" : planet1 === "Sun" ? "identity, purpose" : planet1 === "Jupiter" ? "growth, luck" : planet1 === "Saturn" ? "discipline, lessons" : "its core themes"}) and ${planet2} (${planet2 === "Venus" ? "love, values" : planet2 === "Mars" ? "drive, action" : planet2 === "Mercury" ? "thinking, communication" : planet2 === "Moon" ? "emotions, needs" : planet2 === "Sun" ? "identity, purpose" : planet2 === "Jupiter" ? "growth, luck" : planet2 === "Saturn" ? "discipline, lessons" : "its core themes"}) naturally support each other.`,
  };
}

export function getFinalDispositorInterpretation(
  planet: string
): { title: string; summary: string } {
  return {
    title: "Your chart's boss",
    summary: `${planet} is the one planet that all the others ultimately answer to through a chain of sign rulership. Think of it as the CEO of your psyche — its themes color everything. When ${planet} is doing well (when you're honoring what it represents), your whole life feels more aligned. When it's stressed, everything else feels harder too. This is rare — most charts don't have a single planet in charge.`,
  };
}

export function getSingletonInterpretation(
  planet: string,
  type: string
): { title: string; summary: string } {
  return {
    title: "The odd one out",
    summary: `${planet} stands alone in your chart — it's the only planet in its ${type === "element" ? "element (fire, earth, air, or water)" : type === "modality" ? "mode (starter, sustainer, or adapter)" : type === "hemisphere" ? "half of the chart" : type}. Like being the only introvert at a party, it sticks out. Because it's the exception, ${planet}'s themes carry extra weight in your life. You might identify strongly with it or feel like it's the part of you that doesn't quite fit the rest — either way, it demands attention.`,
  };
}

export function getUnaspectedInterpretation(
  planet: string
): { title: string; summary: string } {
  return {
    title: "Lone wolf planet",
    summary: `${planet} doesn't connect to any other planet in your chart — it operates solo. This makes it a wildcard: sometimes brilliantly powerful, sometimes hard to access. Without links to the rest of your chart, ${planet}'s energy comes in unpredictable bursts rather than flowing naturally with everything else. You might feel like this part of you is on its own schedule, unrelated to your other traits — showing up intensely and then going quiet.`,
  };
}
