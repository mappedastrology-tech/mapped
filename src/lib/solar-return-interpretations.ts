/**
 * Solar Return Interpretations for Mapped.
 *
 * Solar return placements mean different things than natal placements.
 * The SR chart maps themes for the YEAR ahead, not your personality.
 *
 * Key placements to interpret:
 * - SR Moon sign → emotional theme of the year
 * - SR Rising sign → how the year feels / first impressions
 * - SR Sun house → where your identity/energy focuses this year
 * - SR Moon house → where emotional growth happens
 * - Key planet houses → which life areas get activated
 */

// ═══════════════════════════════════════════
// SR MOON IN SIGN — emotional landscape of the year
// ═══════════════════════════════════════════

export const SR_MOON_SIGN: Record<string, { theme: string; description: string }> = {
  Ari: {
    theme: "Emotional independence",
    description: "This year your emotional life craves action and autonomy. You'll feel restless staying still, and your instinct is to charge ahead — even if you haven't thought it through. Anger surfaces faster than usual. Channel it. This is a year to trust your gut and stop waiting for permission to feel what you feel.",
  },
  Tau: {
    theme: "Emotional security",
    description: "This year you need stability, comfort, and simplicity to feel okay. Your emotional world slows down — you're less reactive, more deliberate. You'll crave physical pleasures: good food, nature, touch, beauty. The lesson is learning that safety can come from within, not just from what you accumulate.",
  },
  Gem: {
    theme: "Emotional curiosity",
    description: "Your feelings this year are restless and changeable — you process emotions by talking them out, writing them down, or learning something new. You might feel scattered or overstimulated at times. The gift is that you're more adaptable than usual. The challenge is sitting with feelings instead of intellectualizing them.",
  },
  Can: {
    theme: "Emotional depth",
    description: "This is one of the most emotionally intense solar return years. Home, family, roots, and belonging become central themes. You may feel more sensitive and protective than usual. Old memories resurface. This year teaches you to honor your needs without drowning in them.",
  },
  Leo: {
    theme: "Emotional expression",
    description: "Your heart wants to be seen this year. Emotions are bigger, bolder, more dramatic — and they want an audience. Creative self-expression becomes an emotional need, not just a hobby. The challenge is separating genuine feeling from performance. When you let yourself be vulnerable without the armor of confidence, that's when the real growth happens.",
  },
  Vir: {
    theme: "Emotional refinement",
    description: "This year you process feelings through practical action — fixing, organizing, improving. Anxiety might spike because you're more aware of imperfections (in yourself and everything else). The gift is emotional clarity: you can finally name what's been bothering you. The lesson is that not every feeling needs to be solved.",
  },
  Lib: {
    theme: "Emotional balance",
    description: "Relationships dominate your emotional landscape this year. You crave harmony, fairness, and partnership. The challenge is that you may lose yourself trying to keep everyone happy. Your emotional growth comes from learning that your peace matters as much as anyone else's — and that conflict isn't the same as cruelty.",
  },
  Sco: {
    theme: "Emotional transformation",
    description: "Nothing stays on the surface this year. Your emotional life goes deep — obsessions, revelations, power dynamics, and truth-telling all intensify. You may feel ready to let go of patterns or beliefs that no longer serve you. It can be uncomfortable, and it can also be clarifying.",
  },
  Sag: {
    theme: "Emotional expansion",
    description: "Your emotional needs this year center on freedom, meaning, and adventure. You'll feel suffocated by routine and drawn toward anything that expands your perspective — travel, philosophy, new experiences. The danger is using optimism to avoid difficult feelings. The gift is rediscovering what excites you about being alive.",
  },
  Cap: {
    theme: "Emotional maturity",
    description: "This year asks you to grow up emotionally. Feelings are filtered through a lens of responsibility, ambition, and long-term thinking. You may feel emotionally restrained or serious. That's not suppression — it's discernment. You're learning which emotions serve your goals and which ones are just noise.",
  },
  Aqu: {
    theme: "Emotional detachment",
    description: "Your emotional landscape this year is unconventional. You process feelings through ideas, community, and causes bigger than yourself. You may feel emotionally distant or different from those around you. The lesson is that detachment isn't coldness — it's the ability to care without losing yourself. You're rewiring how you relate.",
  },
  Pis: {
    theme: "Emotional dissolution",
    description: "Boundaries between you and the world thin out this year. You absorb everything — other people's moods, collective anxieties, beauty, suffering. Creativity and spirituality become emotional lifelines. The challenge is staying grounded when everything feels overwhelming. The gift is a compassion deep enough to soften old hurts.",
  },
};

// ═══════════════════════════════════════════
// SR RISING SIGN — how the year feels
// ═══════════════════════════════════════════

export const SR_RISING_SIGN: Record<string, { theme: string; description: string }> = {
  Ari: {
    theme: "A year of new beginnings",
    description: "The year ahead has a fresh, combative energy. You're starting something — a new identity, a new chapter. People see you as bolder than usual. You move first, think later. This is a year for courage, not caution.",
  },
  Tau: {
    theme: "A year of building",
    description: "This year moves slowly and deliberately. You're focused on creating something tangible — stability, a home, a daily life you feel good in. Others see you as grounded and reliable. Patience is the superpower; rushing is the enemy.",
  },
  Gem: {
    theme: "A year of connections",
    description: "The year buzzes with social energy, information, and movement. You're juggling more conversations, projects, and ideas than usual. Others see you as quick-witted and versatile. The risk is spreading yourself too thin. Stay curious but stay focused.",
  },
  Can: {
    theme: "A year of nesting",
    description: "Home and emotional security define this year. You're drawn inward — toward family, roots, and creating a safe space. Others see you as nurturing but guarded. The private sphere is where this year's work happens: home, family dynamics, inner healing.",
  },
  Leo: {
    theme: "A year of visibility",
    description: "You're stepping into the spotlight this year, whether you planned to or not. Creative projects, romance, and self-expression take center stage. Others notice you more. The year asks you to be brave enough to be seen — flaws and all.",
  },
  Vir: {
    theme: "A year of improvement",
    description: "This year is about getting your life in order. Health, habits, work routines, and daily systems get an overhaul. Others see you as competent and detail-oriented. The growth comes from learning that good enough is sometimes better than perfect.",
  },
  Lib: {
    theme: "A year of relationships",
    description: "Partnerships — romantic, business, creative — are the engine of this year. You can't do it alone, and the universe keeps reminding you of that. Others see you as diplomatic and charming. The work is learning to advocate for yourself within partnerships.",
  },
  Sco: {
    theme: "A year of intensity",
    description: "Nothing about this year is casual. Themes of power, intimacy, shared resources, and transformation dominate. Others sense your intensity. You're shedding skin — old identities, old coping mechanisms, old ways of hiding. What emerges is more authentically you.",
  },
  Sag: {
    theme: "A year of expansion",
    description: "The year feels wide open. Travel, education, publishing, spirituality, or cross-cultural experiences pull you forward. Others see you as optimistic and adventurous. The lesson is that growth requires leaving your comfort zone — and staying gone long enough to actually change.",
  },
  Cap: {
    theme: "A year of ambition",
    description: "This is a serious, productive year. Career, reputation, and long-term goals demand your attention. Others see you as authoritative and focused. You're building something meant to last — but the work is real, and shortcuts won't hold.",
  },
  Aqu: {
    theme: "A year of reinvention",
    description: "You're breaking from convention this year. Your social circle shifts, your goals evolve, and you care less about fitting in. Others see you as independent and unconventional. The year asks you to be yourself even when it's uncomfortable for everyone else.",
  },
  Pis: {
    theme: "A year of surrender",
    description: "This year has a dreamy, spiritual quality. You're more intuitive, more creative, and more emotionally permeable. Others see you as gentle and otherworldly. The lesson is letting go of control — this year asks you to notice where trusting the current serves you better than fighting it.",
  },
};

// ═══════════════════════════════════════════
// SR SUN IN HOUSE — where your energy focuses
// ═══════════════════════════════════════════

export const SR_SUN_HOUSE: Record<number, { area: string; description: string }> = {
  1: {
    area: "Identity & self-image",
    description: "This year is about YOU. Your appearance, your personality, your sense of self — all of it gets a refresh. You're more visible than usual, and the choices you make are deeply personal. It's a year of self-discovery and reinvention.",
  },
  2: {
    area: "Money & values",
    description: "Self-worth and what you value take center stage. You're rethinking what you're willing to work for and what kind of security you need. The real lesson is internal: knowing your own worth.",
  },
  3: {
    area: "Communication & learning",
    description: "Your mind is active and your schedule is full. Writing, speaking, teaching, learning, and local connections dominate. Siblings or neighbors may play a bigger role than usual. It's a mentally stimulating year — stay curious.",
  },
  4: {
    area: "Home & family",
    description: "The foundation of your life gets attention. Moves, renovations, family dynamics, and emotional roots are all highlighted. This is an internal year — the growth happens in private. You're building (or rebuilding) your sense of home.",
  },
  5: {
    area: "Creativity & romance",
    description: "Joy, play, creative expression, and romance light up this year. If you have children, they're a major focus. If you don't, your inner child is. This year asks you to remember what makes you happy — and to actually do those things.",
  },
  6: {
    area: "Health & daily life",
    description: "The everyday matters this year: routines, work habits, pets, and daily rituals all ask for attention. Restructuring your day-to-day is the theme. Small improvements add up.",
  },
  7: {
    area: "Partnerships",
    description: "Relationships are in the foreground this year. Partners, collaborators, close friends, even rivals — the mirror of other people shows you who you are. What you want from commitment gets clearer.",
  },
  8: {
    area: "Transformation & shared resources",
    description: "This is a year of depth. Themes include what you share with others, trust, intimacy, power dynamics, and psychological change. Notice what you're ready to let go of, and what you want to make room for.",
  },
  9: {
    area: "Expansion & meaning",
    description: "Your world gets bigger. Travel, higher education, publishing, or spiritual seeking pull you toward growth. You're questioning your beliefs and searching for something that feels true. The year rewards bold thinking.",
  },
  10: {
    area: "Career & public life",
    description: "Your professional life and public reputation are in the spotlight. Ambition, visibility, and your relationship with authority are the themes. This is a year to think about what you want to build.",
  },
  11: {
    area: "Community & future vision",
    description: "Friends, groups, networks, and your vision for the future take center stage. You may join new communities, pursue humanitarian goals, or finally articulate what you want your life to look like long-term. The collective matters more than the individual.",
  },
  12: {
    area: "Rest & inner work",
    description: "This is a quieter, more introspective year. Solitude, spirituality, therapy, rest, and letting go are the themes. It can feel like a retreat from the world — and that's exactly the point. What you process internally this year is groundwork for whatever you start next.",
  },
};

// ═══════════════════════════════════════════
// SR MOON IN HOUSE — emotional growth area
// ═══════════════════════════════════════════

export const SR_MOON_HOUSE: Record<number, string> = {
  1: "Emotions are on the surface and visible to others. Your feelings directly shape your actions and how people perceive you.",
  2: "Emotional security feels tied to material stability. Notice what you reach for when you need comfort, and whether it actually helps.",
  3: "You process feelings through words — journaling, texting, talking it out. Emotional connections with siblings or neighbors intensify.",
  4: "Home is where the heart is, literally. Family matters, living situations, and childhood patterns dominate your emotional landscape.",
  5: "Your heart opens through creativity, romance, and play. Emotional fulfillment comes from self-expression and joy, not obligation.",
  6: "Your feelings show up in your daily rhythms. Routines, small acts of care, and meaningful daily work help you settle.",
  7: "Your emotional state is deeply intertwined with your partner or closest relationships. You can't process feelings in isolation this year.",
  8: "Intense emotional experiences around intimacy, loss, or transformation. Feelings go deep and don't stay hidden. Catharsis is available if you're willing.",
  9: "Emotional growth through travel, education, or expanding your worldview. You feel most alive when you're learning or exploring.",
  10: "Your career and public role trigger strong emotions. Professional ups and downs hit harder than usual. Your reputation matters to your heart.",
  11: "Friends and community provide emotional nourishment. Group belonging feels essential. Loneliness hits harder, but so does the joy of connection.",
  12: "Emotions run underground. You may need more alone time to process what you're feeling. Dreams are vivid. Intuition is sharp. Honor the need for solitude.",
};

// ═══════════════════════════════════════════
// Key SR planet-in-house highlights
// ═══════════════════════════════════════════

export const SR_PLANET_HOUSE_HIGHLIGHTS: Record<string, Record<number, string>> = {
  // Written as themes to notice, never as events. A solar return describes the
  // texture of a year; it does not say what will happen in it, and nothing here
  // forecasts money, health, legal or relationship outcomes.
  Venus: {
    1: "Beauty and pleasure feel personal this year. You may find it easier to like yourself, and others may notice.",
    2: "Your relationship with comfort and what you value comes into focus. Notice what actually makes you feel secure.",
    3: "Sweeter conversations. Writing and everyday exchanges can feel warmer. Sibling bonds may soften.",
    4: "Home asks to be made lovely. Family warmth, a room you finally make yours, a softer private life.",
    5: "Creative and romantic energy runs high. A year to make things for the joy of it and let yourself play.",
    6: "Daily life can get kinder. Looking for pleasure in your routines instead of punishment is the theme.",
    7: "Partnership is in the foreground. What you want from the people closest to you gets easier to say.",
    8: "Closeness goes deeper. Trust, what you share, and what you're willing to let someone see are the themes.",
    9: "Love of the faraway: travel, study, or people from a different background or culture may draw you in.",
    10: "Charm and diplomacy become part of how you work. How you're seen in public may soften.",
    11: "Friendships are a source of joy. You may find yourself among people who share your values.",
    12: "Private pleasures and quiet beauty. Inspiration that comes from solitude and the inner world.",
  },
  Mars: {
    1: "Energy, directness, and a competitive streak sit close to the surface. Notice where you want to push.",
    2: "Drive around resources and self-worth. Ambition is high, and so can be the urge to act on impulse.",
    3: "A quick mind and sharp words. Conversations with siblings or neighbors may carry more heat than usual.",
    4: "Home life feels active. Projects around the house, or friction at home that's asking to be addressed.",
    5: "Creative fire and passionate pursuits. Competitive hobbies, a drive to perform, a hunger to make things.",
    6: "Lots of energy for daily tasks. Pacing yourself is the theme, so the drive doesn't tip into burnout.",
    7: "Relationships feel dynamic. Passion and disagreement can sit side by side; how you handle friction matters.",
    8: "Intensity around closeness and what you share. Old patterns around power may ask to be looked at.",
    9: "Driven to travel, study, or stand up for what you believe. Adventures with an edge.",
    10: "Ambition runs hot. You're pushing for professional goals, and friction with authority may surface.",
    11: "Energy for groups and causes. You may lead something, or find your ideals rubbing against a friend's.",
    12: "Frustration that's been kept quiet may surface. Energy for inner and spiritual work. Notice self-sabotage.",
  },
  Saturn: {
    1: "A serious year of self-discipline and responsibility. You may feel more grown-up. Growth through limits.",
    2: "A year for getting honest about what security means to you. Building slowly. Less can be more.",
    3: "Serious study, or harder conversations that teach you to say things clearly.",
    4: "Home responsibilities may feel heavier. Family obligations ask for attention. Building a steadier base.",
    5: "Creative blocks that can become your most disciplined work. Romance may take on a more serious tone.",
    6: "Your routines ask for structure. Work feels demanding; building better systems is the theme.",
    7: "Commitment, responsibility, and distance are themes in close relationships. What you want long-term gets clearer.",
    8: "Facing fears and old psychological patterns. Tough, honest inner work.",
    9: "Structured learning, slower travel plans, beliefs put to the test. Wisdom through limitation.",
    10: "Career responsibility is in focus. The work is demanding, and what you build is yours.",
    11: "Your social circle may narrow to who matters most. Community responsibilities. Quality over quantity.",
    12: "Solitude and inner work feel necessary, not optional. Facing old fears. Spiritual discipline.",
  },
  Jupiter: {
    1: "Optimism and expansion in your personal life. Confidence can grow. A year to take up a little more room.",
    2: "A generous year for how you value yourself. Notice where you're ready to ask for what you're worth.",
    3: "Mental expansion, easier conversations, short trips that feel good. Learning comes easily.",
    4: "Home life wants more room: more space, more people around the table, or simply more ease at home.",
    5: "Wonderful for creativity, play, and joy. One of the most generous placements for having fun.",
    6: "Daily life can get more enjoyable. Work that feels like growth, and good company with animals.",
    7: "Partnership is a place of growth. Generosity between you and the people you're closest to is the theme.",
    8: "Growth through trust and depth. Emotional healing, and honest conversations about what's shared.",
    9: "Jupiter's favorite house. Travel, study, publishing, and spiritual seeking all feel expansive.",
    10: "Professional growth and visibility are themes. A year to aim a little higher at work.",
    11: "Your social circle may grow. New friendships, and hopes you can share with your community.",
    12: "Quiet grace. Spiritual growth, and good things that arrive privately rather than loudly.",
  },
};

// ═══════════════════════════════════════════
// Generate year-ahead summary
// ═══════════════════════════════════════════

export function generateYearSummary(solarReturn: {
  bigThree?: { sun?: string; moon?: string; rising?: string };
  planets?: { name: string; sign: string; house?: number | null }[];
  houses?: { number: number; sign: string }[];
}): { title: string; themes: { heading: string; body: string }[] } {
  const themes: { heading: string; body: string }[] = [];
  const moon = solarReturn.bigThree?.moon;
  const rising = solarReturn.bigThree?.rising;

  // Track covered houses to avoid redundancy
  const coveredHouses = new Set<number>();

  // 1. SR Rising — sets the tone of the whole year
  if (rising && SR_RISING_SIGN[rising]) {
    const r = SR_RISING_SIGN[rising];
    themes.push({ heading: r.theme, body: r.description });
  }

  // 2. SR Moon emotional theme — how you'll feel
  if (moon && SR_MOON_SIGN[moon]) {
    const m = SR_MOON_SIGN[moon];
    themes.push({ heading: `Emotional theme: ${m.theme}`, body: m.description });
  }

  // 3. SR Sun house — where your energy focuses
  const sunPlanet = solarReturn.planets?.find(p => p.name === "Sun");
  if (sunPlanet?.house && SR_SUN_HOUSE[sunPlanet.house]) {
    coveredHouses.add(sunPlanet.house);
    const s = SR_SUN_HOUSE[sunPlanet.house];
    themes.push({ heading: `Energy focus: ${s.area}`, body: s.description });
  }

  // 4. SR Moon house — where emotional growth happens (skip if same house as Sun)
  const moonPlanet = solarReturn.planets?.find(p => p.name === "Moon");
  if (moonPlanet?.house && SR_MOON_HOUSE[moonPlanet.house] && !coveredHouses.has(moonPlanet.house)) {
    coveredHouses.add(moonPlanet.house);
    themes.push({
      heading: `Emotional growth: House ${moonPlanet.house}`,
      body: SR_MOON_HOUSE[moonPlanet.house],
    });
  }

  // 5. Pick the 2 most impactful planet highlights (skip houses already covered)
  const planetCards: { heading: string; body: string }[] = [];
  for (const planetName of ["Jupiter", "Saturn", "Venus", "Mars"]) {
    const planet = solarReturn.planets?.find(p => p.name === planetName);
    if (planet?.house && SR_PLANET_HOUSE_HIGHLIGHTS[planetName]?.[planet.house] && !coveredHouses.has(planet.house)) {
      const labels: Record<string, string> = {
        Jupiter: "Luck & growth",
        Saturn: "Lessons & structure",
        Venus: "Love & beauty",
        Mars: "Drive & conflict",
      };
      planetCards.push({
        heading: `${labels[planetName]}: House ${planet.house}`,
        body: SR_PLANET_HOUSE_HIGHLIGHTS[planetName][planet.house],
      });
    }
  }
  themes.push(...planetCards.slice(0, 2));

  // Title
  const title = rising && SR_RISING_SIGN[rising]
    ? SR_RISING_SIGN[rising].theme
    : "Your year ahead";

  return { title, themes };
}
