/**
 * Astrology glossary — powers both inline InfoTip tooltips
 * and the full Learn page. Written in Dolly's voice.
 */

export interface GlossaryEntry {
  term: string;
  short: string;     // 1-2 sentence tooltip version
  full: string;      // Longer explanation for the Learn page
  category: "basics" | "dignities" | "markers" | "chart-features" | "houses" | "planets";
}

export const GLOSSARY: GlossaryEntry[] = [
  // ─── BASICS ───
  {
    term: "Birth Chart",
    short: "A snapshot of the sky at the exact moment you were born. It maps where every planet was, what sign it was in, and which house it occupied.",
    full: "Your birth chart is the foundation of everything in astrology. It's a map of the sky frozen at the exact moment and place you were born. The positions of the Sun, Moon, and planets in the signs and houses tell the story of your personality, challenges, gifts, and life path. No two charts are identical — even twins born minutes apart can have different rising signs.",
    category: "basics",
  },
  {
    term: "Sign",
    short: "The zodiac sign a planet was in when you were born. It colors HOW that planet's energy expresses itself.",
    full: "There are 12 zodiac signs, each with a distinct energy. When we say 'your Sun is in Scorpio,' we mean the Sun was moving through the Scorpio section of the sky when you were born. The sign modifies the planet — it tells you the style, flavor, and approach. Think of the planet as WHAT and the sign as HOW.",
    category: "basics",
  },
  {
    term: "House",
    short: "The area of life where a planet's energy plays out. There are 12 houses, each ruling a different life domain — self, money, communication, home, creativity, etc.",
    full: "Houses are the 12 sections of your chart, each governing a different area of life. The 1st house is your identity and appearance. The 7th is partnerships. The 10th is career and public image. When a planet sits in a house, its energy gets channeled into that life area. So Sun in the 7th means your identity expresses through relationships. The house tells you WHERE in your life something happens.",
    category: "basics",
  },
  {
    term: "Planet",
    short: "Each planet represents a different part of you — the Sun is your core identity, the Moon is your emotions, Mercury is your mind, Venus is how you love.",
    full: "In astrology, planets are the actors in your chart. Each one governs a specific part of your psyche and life. The Sun is who you are at your core. The Moon is how you feel and what you need emotionally. Mercury is how you think and communicate. Venus is how you love and what you value. Mars is how you take action and assert yourself. Jupiter is where you grow and get lucky. Saturn is where you face challenges and build discipline. Uranus, Neptune, and Pluto are generational planets that shape deeper themes.",
    category: "planets",
  },
  {
    term: "Big Three",
    short: "Your Sun sign, Moon sign, and Rising sign — the three most important placements that define your core personality.",
    full: "Your Big Three is the starting point of understanding your chart. Your Sun sign is your core identity — who you are when you're fully yourself. Your Moon sign is your emotional inner world — how you feel, what you need, how you process. Your Rising sign (or Ascendant) is the mask you wear — how you come across to others and your instinctive approach to new situations. Together, these three placements give a surprisingly accurate picture of who you are.",
    category: "basics",
  },
  {
    term: "Rising Sign",
    short: "Also called the Ascendant. The sign that was rising on the eastern horizon when you were born. It shapes your outward personality and first impressions.",
    full: "Your Rising sign changes roughly every two hours, which is why birth time matters so much. It determines the entire layout of your houses and is the lens through which people first experience you. If your Sun sign is who you are, your Rising sign is who you appear to be. Many people identify more with their Rising sign than their Sun sign, especially in social situations.",
    category: "basics",
  },
  {
    term: "Retrograde",
    short: "When a planet appears to move backward in the sky. In your birth chart, it means that planet's energy turns inward — you process it privately and differently than most.",
    full: "Planets don't actually move backward — it's an optical illusion from Earth's perspective. But in astrology, the symbolism matters. When a planet is retrograde in your birth chart, its energy is internalized. Mercury retrograde natally means you think deeply and revise constantly. Venus retrograde means your love life doesn't follow the standard script. It's not bad — it just means that area of life works differently for you and requires more self-awareness.",
    category: "basics",
  },
  {
    term: "Aspect",
    short: "The angle between two planets in your chart. Certain angles create harmony (trines, sextiles) and others create tension (squares, oppositions).",
    full: "Aspects are the relationships between planets based on their geometric angles. A conjunction (0°) merges two planets' energies. A trine (120°) creates natural flow and talent. A sextile (60°) offers opportunities. A square (90°) creates friction and growth through challenge. An opposition (180°) creates tension between two parts of yourself that need balancing. The most interesting charts usually have a mix — tension is what creates drive and growth.",
    category: "basics",
  },

  // ─── DIGNITIES ───
  {
    term: "Domicile",
    short: "A planet in the sign it rules — it's completely at home. This is the strongest, most natural expression of that planet's energy.",
    full: "When a planet is in domicile, it's in the sign it naturally rules. Sun in Leo, Moon in Cancer, Venus in Taurus — these planets are operating in their home territory. The energy flows effortlessly. You don't have to work at expressing this part of yourself — it just comes naturally. It's like speaking your native language. People with planets in domicile often take those gifts for granted because they feel so normal.",
    category: "dignities",
  },
  {
    term: "Exalted",
    short: "A planet in the sign where it's honored and amplified — its energy is at peak performance. Think of it as being a VIP guest.",
    full: "Exaltation is like being a celebrated guest in someone's home. The planet isn't in its own sign, but it's in a sign that brings out its best qualities. Mars in Capricorn is exalted — Mars's drive gets Capricorn's discipline and becomes incredibly effective. Venus in Pisces is exalted — Venus's love becomes unconditional and transcendent. Exalted planets often represent your strongest natural gifts.",
    category: "dignities",
  },
  {
    term: "Detriment",
    short: "A planet in the sign opposite its home — it's uncomfortable and has to work harder. The energy is available but doesn't come naturally.",
    full: "Detriment means a planet is in the sign opposite the one it rules. Sun in Aquarius (opposite Leo), Moon in Capricorn (opposite Cancer). The planet's energy still works, but it's like writing with your non-dominant hand. You can do it, but it requires conscious effort. People with planets in detriment often develop unique strengths precisely because they had to work harder at something others take for granted.",
    category: "dignities",
  },
  {
    term: "In Fall",
    short: "A planet in the sign opposite its exaltation — it's at its most challenged. The energy is muted or difficult to access, but working through it builds real depth.",
    full: "Fall is the opposite of exaltation. Moon in Scorpio (opposite Taurus), Mercury in Pisces (opposite Virgo). The planet's energy doesn't express easily in this sign — there's internal friction. But here's the thing: planets in fall often produce the most interesting, complex people. You develop depth, resilience, and self-awareness because nothing about this energy came for free. The challenge IS the gift — you just have to earn it.",
    category: "dignities",
  },

  // ─── MARKERS ───
  {
    term: "Fame Marker",
    short: "A placement in your chart that's traditionally associated with public recognition, visibility, and being known. Doesn't guarantee fame — but the energy is there.",
    full: "Certain placements show up disproportionately in the charts of famous people. Sun or Jupiter in the 10th house, Venus in the 1st, Leo on the Midheaven. These placements give you natural visibility, charisma, or public appeal. Having a fame marker doesn't mean you'll be a celebrity — it means you have the raw material for public recognition in whatever field you pursue.",
    category: "markers",
  },
  {
    term: "Fortune Marker",
    short: "A placement associated with financial abundance, material luck, or wealth-building ability.",
    full: "Fortune markers point to areas where money and resources flow more easily. Jupiter in the 2nd house (earned income), Pluto in the 8th (other people's money, investments, inheritance), Venus in Taurus — these placements suggest natural abundance in specific areas. They don't mean money falls from the sky, but they do mean you have an innate sense for building or attracting wealth in particular ways.",
    category: "markers",
  },
  {
    term: "Marriage Marker",
    short: "A placement that indicates partnership is especially important in your life — and often that you'll attract significant, meaningful relationships.",
    full: "Marriage markers highlight that committed partnership is central to your life path. Venus or Jupiter in the 7th house, Sun in the 7th — these placements mean relationships aren't just nice to have, they're where you grow, shine, or find your purpose. People with multiple marriage markers often find that their biggest life changes happen through partnerships.",
    category: "markers",
  },
  {
    term: "Psychic Marker",
    short: "A placement linked to heightened intuition, empathy, or spiritual sensitivity. You pick up on things others miss.",
    full: "Psychic markers show up in people who have strong intuition, empathic abilities, or spiritual gifts. Neptune in the 12th, Moon in the 8th or 12th, Moon in Pisces or Scorpio. These aren't about crystal balls — they're about having a nervous system that picks up subtle information. You sense moods, predict outcomes, and know things without knowing how you know them. The challenge is learning to trust it and protect your energy.",
    category: "markers",
  },
  {
    term: "Karmic Marker",
    short: "A placement suggesting unfinished lessons from the past. These areas of life feel heavy but offer the deepest growth.",
    full: "Karmic markers point to areas where you carry extra weight — sometimes from family patterns, sometimes from experiences that shaped you before you had words for them. Saturn in the 12th or 4th, Pluto in the 12th — these placements feel like you came into this life with homework already assigned. The good news: working through karmic placements produces the most profound personal transformation. The depth you gain is unmatched.",
    category: "markers",
  },

  // ─── HOUSES (abbreviated) ───
  {
    term: "1st House",
    short: "The house of self, identity, and first impressions. How you show up in the world.",
    full: "The 1st house is you — your physical presence, your instinctive behavior, and how people perceive you before you even speak. It's tied to your Rising sign. Planets here have an outsized effect on your personality because they color everything about how you move through the world.",
    category: "houses",
  },
  {
    term: "7th House",
    short: "The house of partnership, marriage, and one-on-one relationships. Who you attract and what you need from a partner.",
    full: "The 7th house is your mirror — it represents the people you draw into your life through committed partnership. It's not just romantic. Business partners, close collaborators, even open enemies fall here. Planets in the 7th shape what kind of partner you attract and what dynamics play out in your closest relationships.",
    category: "houses",
  },
  {
    term: "10th House",
    short: "The house of career, public image, and legacy. What you're known for and how you contribute to the world.",
    full: "The 10th house is your public face — your career, your reputation, your legacy. The sign on the cusp (your Midheaven) describes your professional style and what you're meant to contribute. Planets here get amplified publicly. Whatever sits in your 10th house, the world will see it.",
    category: "houses",
  },

  // ─── CHART FEATURES ───
  {
    term: "Stellium",
    short: "Three or more planets clustered in the same sign or house. It concentrates a massive amount of energy in one area of your life.",
    full: "A stellium is like a spotlight on one part of your chart. When three or more planets share a sign or house, that area of life gets disproportionate focus. A 10th house stellium means career dominates your chart. A Scorpio stellium means intensity and transformation color everything. Stelliums create both incredible talent and potential overwhelm in that area — it's a lot of energy in one place.",
    category: "chart-features",
  },
  {
    term: "Grand Trine",
    short: "Three planets forming a perfect triangle (120° apart). It creates natural talent and flow in the element involved — but can also make you a little too comfortable.",
    full: "A Grand Trine connects three planets in the same element (all Fire, all Water, etc.) in a harmonious triangle. It represents natural gifts that come easily — sometimes too easily. Fire Grand Trines give effortless confidence and creativity. Water Grand Trines give deep emotional intelligence. The shadow is complacency: when things come naturally, you might not push yourself to grow.",
    category: "chart-features",
  },
  {
    term: "T-Square",
    short: "Two planets in opposition with a third squaring both. It creates persistent tension and drive — the most productive stress pattern in astrology.",
    full: "A T-Square is uncomfortable but powerful. Two planets oppose each other, and a third planet squares both, creating a pressure point. That third planet (the apex) becomes your focal point — where all the tension channels into action. Many highly successful people have T-Squares because the friction won't let them rest. It's the engine that drives achievement.",
    category: "chart-features",
  },
];

/** Quick lookup by term name */
export function getGlossaryEntry(term: string): GlossaryEntry | undefined {
  return GLOSSARY.find((g) => g.term.toLowerCase() === term.toLowerCase());
}

/** Get all entries for a category */
export function getGlossaryByCategory(category: GlossaryEntry["category"]): GlossaryEntry[] {
  return GLOSSARY.filter((g) => g.category === category);
}
