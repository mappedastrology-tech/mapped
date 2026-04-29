/**
 * Chart ruler logic.
 *
 * Your chart ruler is the planet that rules your Rising sign.
 * It's the single most important planet in your chart because
 * it colors everything about how you move through the world.
 */

/** Rising sign → ruling planet */
const SIGN_RULER: Record<string, string> = {
  Ari: "Mars",     Tau: "Venus",    Gem: "Mercury",
  Can: "Moon",     Leo: "Sun",      Vir: "Mercury",
  Lib: "Venus",    Sco: "Pluto",    Sag: "Jupiter",
  Cap: "Saturn",   Aqu: "Uranus",   Pis: "Neptune",
};

/** Traditional co-rulers for signs with modern rulers */
const CO_RULERS: Record<string, string> = {
  Sco: "Mars",     // Pluto is modern, Mars is traditional
  Aqu: "Saturn",   // Uranus is modern, Saturn is traditional
  Pis: "Jupiter",  // Neptune is modern, Jupiter is traditional
};

export interface ChartRulerInfo {
  planet: string;        // "Mars"
  coRuler?: string;      // "Pluto" (if applicable)
  risingSIgn: string;    // "Ari"
  rulerSign: string;     // The sign the ruling planet is in
  rulerHouse: string | null; // The house the ruling planet is in
  summary: string;       // Dolly-voiced explanation
}

interface Planet {
  name: string;
  sign: string;
  house: string | null;
}

interface House {
  number: number;
  sign: string;
}

import { SIGN_FULL } from "./knowledge";

const SIGN_FULL_NAMES: Record<string, string> = SIGN_FULL;

function formatHouseOrdinal(house: string | null): string {
  if (!house) return "";
  const ordinals: Record<string, string> = {
    First: "1st", Second: "2nd", Third: "3rd", Fourth: "4th",
    Fifth: "5th", Sixth: "6th", Seventh: "7th", Eighth: "8th",
    Ninth: "9th", Tenth: "10th", Eleventh: "11th", Twelfth: "12th",
  };
  const word = house.split("_")[0];
  return ordinals[word] || word;
}

/** Generate chart ruler info from chart data */
export function getChartRuler(
  planets: Planet[],
  houses: House[]
): ChartRulerInfo | null {
  const risingSign = houses[0]?.sign;
  if (!risingSign) return null;

  const rulerName = SIGN_RULER[risingSign];
  if (!rulerName) return null;

  const coRulerName = CO_RULERS[risingSign];

  const rulerPlanet = planets.find((p) => p.name === rulerName);
  if (!rulerPlanet) return null;

  const risingFull = SIGN_FULL_NAMES[risingSign] || risingSign;
  const rulerSignFull = SIGN_FULL_NAMES[rulerPlanet.sign] || rulerPlanet.sign;
  const houseOrd = formatHouseOrdinal(rulerPlanet.house);

  // Generate Dolly-voiced summary based on the ruler's placement
  const summary = generateRulerSummary(
    rulerName,
    risingFull,
    rulerSignFull,
    houseOrd,
    rulerPlanet.sign
  );

  return {
    planet: rulerName,
    coRuler: coRulerName,
    risingSIgn: risingSign,
    rulerSign: rulerPlanet.sign,
    rulerHouse: rulerPlanet.house,
    summary,
  };
}

/**
 * Ruler-in-sign descriptions: what this ruler placement actually means
 * for how you navigate life, and what to lean into.
 *
 * Key format: "Planet|Sign" → { meaning, advice }
 */
const RULER_IN_SIGN: Record<string, { meaning: string; advice: string }> = {
  // ── MARS (rules Aries rising) ──
  "Mars|Aries": {
    meaning: "Your instincts are razor-sharp and you move through life like you were born running. You lead with courage, and people feel it the second you walk in — there's an urgency to you that's magnetic.",
    advice: "Trust your first impulse more than your second-guessing. Start the thing. Say the thing. Your power comes from speed, not strategy — overthinking is your kryptonite.",
  },
  "Mars|Taurus": {
    meaning: "You have a slow-burning, unstoppable drive. You don't rush into anything, but once you commit, nothing moves you off course. Your life builds through patience and sheer stubbornness.",
    advice: "Stop feeling guilty about taking your time. Your pace IS your power. Build things that last — investments, skills, relationships. Quick wins aren't your game; legacy is.",
  },
  "Mars|Gemini": {
    meaning: "Your energy scatters across a dozen interests at once, and you navigate life through words, ideas, and connections. You're wired to stay mentally stimulated or you go stir-crazy.",
    advice: "Follow your curiosity — it's not distraction, it's your compass. Write, talk, network, learn. But pick ONE project to finish before starting three more. That's your growth edge.",
  },
  "Mars|Cancer": {
    meaning: "Your drive is emotional and protective. You fight hardest for the people you love, and your instincts about what's safe and what's not are unusually sharp. Home and family fuel everything.",
    advice: "Stop apologizing for being emotional about your goals. Your sensitivity is strategic — it tells you who to trust and when to move. Build a home base that feels safe, then conquer from there.",
  },
  "Mars|Leo": {
    meaning: "You move through life with natural confidence and creative fire. People notice you whether you try or not, and your drive is tied to self-expression, recognition, and making things that feel alive.",
    advice: "Stop dimming yourself for other people's comfort. Create boldly, lead visibly, take up space. Your vitality literally depends on doing work that lets you shine — don't settle for invisible roles.",
  },
  "Mars|Virgo": {
    meaning: "Your drive is precise and service-oriented. You attack problems methodically, and your power comes from being the most competent person in the room without needing anyone to notice.",
    advice: "Channel your energy into mastery — pick skills, refine them, become indispensable. But stop waiting for perfection before you act. 'Good enough' from you is already better than most people's best.",
  },
  "Mars|Libra": {
    meaning: "Your drive works through other people. Partnerships, collaborations, and one-on-one dynamics are where your energy flows best. You're wired for diplomacy, but there's steel underneath the charm.",
    advice: "Stop avoiding conflict — your growth depends on learning to fight fairly, not avoiding fights entirely. Use partnerships strategically. You're at your most powerful when you have a great collaborator.",
  },
  "Mars|Scorpio": {
    meaning: "Your drive runs deep and quiet. You don't show your hand, you don't waste energy on things that don't matter, and when you decide something is yours, your willpower is almost frightening.",
    advice: "Trust your intensity — it's not too much. Go all-in on what matters and cut what doesn't without guilt. Your power grows in private. You don't need to explain your moves to anyone.",
  },
  "Mars|Sagittarius": {
    meaning: "Your drive is expansive and restless. You need freedom, meaning, and forward motion — staying still feels like dying. You navigate life through big bets, bold moves, and an unshakable belief that something better is coming.",
    advice: "Say yes to the adventure. Travel, learn, take the risk that scares you. Your energy gets blocked when life feels small or meaningless — always have something on the horizon to move toward.",
  },
  "Mars|Capricorn": {
    meaning: "Your drive is disciplined, strategic, and built for the long haul. Mars is exalted here — you have an almost ruthless ability to set a goal and grind until you reach it, no matter how long it takes.",
    advice: "Play the long game. Every move should serve your five-year plan. Don't waste your considerable energy on things that won't compound over time. You're built for authority — claim it.",
  },
  "Mars|Aquarius": {
    meaning: "Your drive is unconventional and community-oriented. You're energized by ideas, causes, and doing things your own way. Conformity kills your motivation faster than anything.",
    advice: "Build something that changes how people think. Your energy is strongest when it serves a vision bigger than yourself. Find your people — the weird ones, the rebels — and mobilize them.",
  },
  "Mars|Pisces": {
    meaning: "Your drive is subtle, intuitive, and creatively charged. You don't push through obstacles — you flow around them. Your energy is strongest when it's tied to something meaningful or artistic.",
    advice: "Stop forcing yourself to be aggressive about your goals. Your power is in your vision and your ability to inspire others. Create, heal, imagine — and trust that the right action will find you.",
  },

  // ── VENUS (rules Taurus + Libra rising) ──
  "Venus|Aries": {
    meaning: "You navigate life by chasing what excites you — in love, in aesthetics, in everything. There's an urgency to your desires and you don't wait around for things to come to you.",
    advice: "Go after what you want directly. Don't play it cool when you're burning inside. Your authenticity in desire is attractive — use it. But learn to stay after the chase is over.",
  },
  "Venus|Taurus": {
    meaning: "Venus is at home here, and it shows. Your whole life is oriented around beauty, comfort, pleasure, and building things of lasting value. You have impeccable taste and know exactly what you want.",
    advice: "Invest in quality over quantity — in possessions, relationships, experiences. Your senses are your superpower. Surround yourself with beauty and watch your whole life elevate.",
  },
  "Venus|Gemini": {
    meaning: "You move through life with charm, wit, and an insatiable curiosity about people. Connection is everything to you — not deep and brooding, but sparkling, varied, and intellectually alive.",
    advice: "Talk to everyone. Your network IS your net worth. Keep your social world diverse and stimulating. When life feels flat, it's because you're not learning anything new — fix that immediately.",
  },
  "Venus|Cancer": {
    meaning: "Your life is guided by emotional bonds, family, and creating spaces where people feel safe. You navigate by intuition and your sense of belonging drives every major decision.",
    advice: "Build your nest — literally and emotionally. The people you nurture become your greatest assets. Trust your gut about who deserves your care and who's draining it.",
  },
  "Venus|Leo": {
    meaning: "You navigate life through warmth, generosity, and an instinct for the dramatic. You need to be seen, appreciated, and celebrated — not out of vanity, but because recognition fuels your whole system.",
    advice: "Don't downplay your need for attention — it's valid. Create, perform, lead with your heart. Surround yourself with people who genuinely celebrate you, not just tolerate you.",
  },
  "Venus|Virgo": {
    meaning: "You move through life with quiet devotion and practical care. You show love through acts of service, attention to detail, and making things work better for the people around you.",
    advice: "Stop underselling yourself. Your thoughtfulness is rare and valuable. But also learn to receive — you're so busy helping that you forget to let people take care of you too.",
  },
  "Venus|Libra": {
    meaning: "Venus is at home here, and your whole life revolves around harmony, partnership, and aesthetics. You have a gift for making things — and people — beautiful. Balance isn't just a preference, it's a need.",
    advice: "Lean into partnership as a life strategy. You're genuinely better with a great collaborator by your side. Curate your environment ruthlessly — ugliness and chaos drain you more than you realize.",
  },
  "Venus|Scorpio": {
    meaning: "You navigate life through intensity, loyalty, and a deep need for emotional truth. Surface-level anything repels you. Your connections are all-or-nothing, and that magnetism shapes your entire path.",
    advice: "Stop pretending you can do casual — in love, in work, in anything. Your power is in going deep. Choose fewer things and people, but commit completely. That's where your life transforms.",
  },
  "Venus|Sagittarius": {
    meaning: "You move through life seeking freedom, adventure, and experiences that expand your worldview. Your connections are forged through shared beliefs and a mutual love of exploration.",
    advice: "Keep your life expansive. Travel, study, debate, explore. Relationships that try to shrink your world will fail — find people who want to grow alongside you, not contain you.",
  },
  "Venus|Capricorn": {
    meaning: "You navigate life with quiet ambition and a deep respect for things that endure. Your taste runs toward classic over trendy, and your relationships are chosen with the same care as your career moves.",
    advice: "Build relationships the way you build your career — with intention, loyalty, and a long-term vision. Quality over quantity in everything. Your patience is an asset most people can't match.",
  },
  "Venus|Aquarius": {
    meaning: "You move through life valuing freedom, intellectual connection, and community above all. Your relationships are unconventional by design — you need friends and partners who respect your independence.",
    advice: "Stop trying to fit into traditional relationship molds. Your way of connecting is valid even if it looks different. Build a community of brilliant, independent people and watch your life expand.",
  },
  "Venus|Pisces": {
    meaning: "Venus is exalted here — your capacity for love, beauty, and compassion is extraordinary. You navigate life through empathy, creative vision, and an almost psychic connection to the people around you.",
    advice: "Trust your artistic instincts and your heart — they're more reliable than logic for you. But protect your energy fiercely. Not everyone deserves the depth of care you naturally offer.",
  },

  // ── MERCURY (rules Gemini + Virgo rising) ──
  "Mercury|Aries": {
    meaning: "Your mind moves fast and your words hit hard. You think on your feet, speak before you filter, and navigate life through quick decisions and bold communication.",
    advice: "Lead with your ideas — they're sharper than you think. But build a 5-second pause between thought and speech. Your directness is a gift; your impulsiveness can be a liability.",
  },
  "Mercury|Taurus": {
    meaning: "Your mind is deliberate, practical, and sensory. You think things through slowly and thoroughly, and your words carry weight because you don't waste them.",
    advice: "Don't let fast-talkers rush your thinking. Your slow processing is actually deep processing. Make decisions at your own pace and trust that your conclusions are more solid than most people's snap judgments.",
  },
  "Mercury|Gemini": {
    meaning: "Mercury is at home here — your mind is your greatest asset. Quick, versatile, endlessly curious. You process information faster than almost anyone and you navigate life by learning everything about everything.",
    advice: "Feed your mind constantly — books, conversations, courses, rabbit holes. Your intellectual restlessness isn't a flaw, it's your fuel. Just make sure you occasionally go deep, not just wide.",
  },
  "Mercury|Cancer": {
    meaning: "Your mind thinks in feelings. Memory, nostalgia, and emotional intelligence drive how you process the world. You remember how things felt long after others forget what happened.",
    advice: "Trust your emotional read on situations — it's more accurate than any spreadsheet. Write, journal, tell stories. Your memory is your archive of wisdom. Use it.",
  },
  "Mercury|Leo": {
    meaning: "Your mind is creative, dramatic, and built for storytelling. You think in narratives, communicate with warmth, and have a natural gift for making ideas feel exciting and important.",
    advice: "Present, pitch, teach, perform. Your communication style is magnetic — use it. Write the blog, give the talk, start the podcast. Your ideas need an audience to reach their full power.",
  },
  "Mercury|Virgo": {
    meaning: "Mercury is at home and exalted here — your analytical mind is extraordinary. Detail-oriented, precise, and genuinely brilliant at breaking complex things into understandable pieces.",
    advice: "Trust your analysis. You see what others miss — that's not nitpicking, it's intelligence. Build systems, document processes, solve problems. But don't let perfectionism stop you from sharing your insights.",
  },
  "Mercury|Libra": {
    meaning: "Your mind naturally sees every side. You think in terms of fairness, balance, and how ideas relate to each other. Communication for you is about creating understanding between people.",
    advice: "Use your diplomatic mind strategically — mediate, negotiate, advise. But practice making decisions without needing everyone's input. Your ability to see all sides is a strength until it becomes paralysis.",
  },
  "Mercury|Scorpio": {
    meaning: "Your mind is investigative, penetrating, and relentless. You see beneath surfaces, detect lies instinctively, and think with a psychological depth that most people can't match.",
    advice: "Trust your detective instincts. Research, investigate, dig deep. Your mind is wasted on surface-level work. But learn to share your insights without weaponizing them — truth is powerful enough without an edge.",
  },
  "Mercury|Sagittarius": {
    meaning: "Your mind thinks big — philosophy, meaning, the future, the global picture. Details bore you but vision excites you. You communicate with enthusiasm and conviction.",
    advice: "Chase the big ideas. Study philosophy, travel, debate, teach. Your mind needs expansion to function — small talk and routine paperwork will suffocate it. Always have a question you're trying to answer.",
  },
  "Mercury|Capricorn": {
    meaning: "Your mind is strategic, practical, and built for authority. You think in terms of what works, what's realistic, and what will still matter in ten years.",
    advice: "Use your mental discipline to build something real. Write the business plan, create the framework, structure the system. People trust your thinking because it's grounded — lean into that authority.",
  },
  "Mercury|Aquarius": {
    meaning: "Your mind sees the future before everyone else. You think in systems, patterns, and unconventional connections. Your ideas are often ahead of their time.",
    advice: "Don't dumb down your ideas for people who aren't ready. Find your intellectual community — online, in niche spaces, wherever the forward-thinkers are. Your mind needs other brilliant minds to spark off of.",
  },
  "Mercury|Pisces": {
    meaning: "Your mind works in images, metaphors, and intuitive leaps. Linear logic isn't your strength, but creative and emotional intelligence absolutely is.",
    advice: "Stop comparing yourself to analytical thinkers. Your mind works differently and that's your edge. Express your ideas through art, story, music, or poetry. Learn to trust your hunches — they're usually right.",
  },

  // ── MOON (rules Cancer rising) ──
  "Moon|Aries": { meaning: "Your emotional instincts are fast and fierce. You process feelings by taking action — sitting with emotions feels unbearable. Your life is driven by gut reactions and emotional courage.", advice: "When you feel something, move. Exercise, start a project, have the conversation. Your emotions are fuel, not problems to solve. Just learn to pause before reacting in anger — that's your one growth edge." },
  "Moon|Taurus": { meaning: "Your emotional world is steady, sensual, and deeply grounded. Security — financial, physical, emotional — drives everything. When you feel safe, you're unstoppable.", advice: "Build a life that feels physically good. Invest in comfort, save money, cook well, sleep deeply. Your stability is your superpower and everything else flows from it." },
  "Moon|Gemini": { meaning: "You process emotions by talking, writing, and thinking them through. Stillness feels uncomfortable — your emotional world needs constant stimulation and variety.", advice: "Journal, voice memo, call your best friend. You need to verbalize feelings to understand them. Keep your social circle wide and your mind fed — emotional stagnation is your real enemy." },
  "Moon|Cancer": { meaning: "The Moon is at home here — your emotional world is the engine of your entire life. Your intuition is extraordinary, your capacity for care is bottomless, and home is sacred.", advice: "Trust your feelings above all else — they're your most reliable compass. Create a home that genuinely nurtures you. The people you mother will become your greatest allies in life." },
  "Moon|Leo": { meaning: "Your emotional world is warm, dramatic, and needs to be witnessed. You process feelings through creative expression and you genuinely need appreciation to feel emotionally safe.", advice: "Stop pretending you don't need recognition — you do, and that's okay. Express your feelings boldly. Create, perform, be generous with your warmth. Your emotional generosity comes back tenfold." },
  "Moon|Virgo": { meaning: "You process emotions by analyzing them, organizing them, and finding practical solutions. Messy feelings make you anxious. Your emotional security comes from competence and usefulness.", advice: "Help someone when you're feeling lost — it resets your whole system. But also learn that some feelings just need to be felt, not fixed. You're allowed to be imperfect and still be worthy." },
  "Moon|Libra": { meaning: "Your emotional world craves harmony, beauty, and partnership. You feel most secure when your relationships are balanced and your environment is aesthetically pleasing.", advice: "Don't sacrifice your own needs to keep the peace — that's not balance, it's self-abandonment. Surround yourself with beauty and people who genuinely reciprocate your care." },
  "Moon|Scorpio": { meaning: "Your emotional world runs deep, intense, and private. You feel everything at maximum volume but show almost none of it. Trust is earned, not given, and your emotional memory is permanent.", advice: "Let people in — selectively, but genuinely. Your depth is a gift but isolation is your trap. Find one or two people who can handle your intensity and let them see the real you." },
  "Moon|Sagittarius": { meaning: "Your emotional world needs freedom, meaning, and forward motion. You process feelings by moving — literally or philosophically. Emotional stagnation makes you restless to the point of escape.", advice: "Always have something to look forward to. Travel, a new book, a goal on the horizon. Your optimism is real medicine — protect it. But don't run from hard emotions by chasing the next adventure." },
  "Moon|Capricorn": { meaning: "Your emotional world is guarded, self-sufficient, and quietly powerful. You feel deeply but process alone. Emotional security comes from achievement and knowing you can handle anything.", advice: "Let yourself need people — it's not weakness. Your self-sufficiency is impressive but lonely. Build emotional endurance by practicing vulnerability with one trusted person. You're stronger than you think, which means you can afford to soften." },
  "Moon|Aquarius": { meaning: "Your emotional world is intellectual and community-oriented. You process feelings by analyzing them from a distance and you feel most secure when you belong to a group that shares your values.", advice: "Stop intellectualizing every feeling — some things just need to be felt. But also honor your need for space and independence in relationships. Your emotional style is unconventional and that's valid." },
  "Moon|Pisces": { meaning: "Your emotional world is vast, porous, and spiritually sensitive. You absorb other people's feelings like a sponge and your inner life is rich with imagination, intuition, and compassion.", advice: "Protect your energy ruthlessly. Salt baths, alone time, creative outlets — these aren't luxuries, they're survival tools. Your empathy is a superpower when you learn to manage it instead of drowning in it." },

  // ── SUN (rules Leo rising) ──
  "Sun|Aries": { meaning: "Your life force is bold, initiating, and independent. You're built to go first, to lead, to pioneer. Your vitality comes from challenges and your identity is forged in action.", advice: "Start things. Be first. Compete. Your life stagnates when you play it safe. You need physical and mental challenges constantly — build a life that provides them." },
  "Sun|Taurus": { meaning: "Your life force is steady, grounded, and sensual. You build your identity through what you create, accumulate, and sustain. Patience isn't just a virtue for you — it's a strategy.", advice: "Build slowly and enjoy the process. Your greatest achievements come from persistence, not speed. Invest in tangible things — skills, property, relationships with real substance." },
  "Sun|Gemini": { meaning: "Your life force is curious, versatile, and communication-driven. Your identity is expressed through ideas, words, and connections. You need intellectual stimulation like you need oxygen.", advice: "Never stop learning. Talk to people who challenge your thinking. Write, teach, connect. You're at your best when you're the bridge between different worlds and ideas." },
  "Sun|Cancer": { meaning: "Your life force flows through emotional connection, family, and nurturing. Your identity is tied to who and what you protect. Home isn't just a place — it's your power source.", advice: "Build something that shelters people. Your caring isn't soft — it's your strongest quality. Create a home, a business, a community where people feel genuinely safe." },
  "Sun|Leo": { meaning: "The Sun is at home in Leo — your life force burns bright, warm, and impossible to ignore. Your identity IS self-expression. You're built to create, lead, and inspire.", advice: "Shine without apology. Your light isn't taking from anyone else's. Create, perform, lead with generosity. The world literally needs your warmth — withholding it helps nobody." },
  "Sun|Virgo": { meaning: "Your life force is expressed through service, skill, and quiet excellence. Your identity is built on being genuinely useful and doing things the right way.", advice: "Master your craft. Your identity grows stronger every time you solve a problem or improve a system. But celebrate your wins — you earn them and then forget to enjoy them." },
  "Sun|Libra": { meaning: "Your life force flows through partnership, beauty, and creating balance. Your identity is deeply relational — you discover who you are through meaningful connections with others.", advice: "Collaborate. Your best work and your deepest self-knowledge emerge through partnership. But make sure you're choosing partners who elevate you, not just anyone who shows up." },
  "Sun|Scorpio": { meaning: "Your life force is intense, transformative, and psychologically deep. You're built for regeneration — you die and are reborn more times in one lifetime than most people can imagine.", advice: "Go deep. Surface living will make you sick. Your power comes from facing what everyone else avoids. Transform yourself first, then help others do the same." },
  "Sun|Sagittarius": { meaning: "Your life force is expansive, truth-seeking, and restlessly optimistic. Your identity is tied to freedom, adventure, and the relentless pursuit of meaning.", advice: "Never stop exploring — physically, intellectually, spiritually. Your life needs a quest at all times. When you lose your sense of meaning, everything else falls apart. Keep searching." },
  "Sun|Capricorn": { meaning: "Your life force is ambitious, structured, and built for the long climb. Your identity is forged through achievement and earning genuine respect.", advice: "Set the 10-year goal and work backward. Your power compounds over time — don't compare your chapter 2 to someone else's chapter 20. Build your legacy brick by brick." },
  "Sun|Aquarius": { meaning: "Your life force is individualistic, future-oriented, and wired for community impact. Your identity lives at the intersection of radical independence and deep belonging.", advice: "Be yourself loudly. Your uniqueness isn't a phase — it's your purpose. Find your people, champion a cause, build something that serves the collective. You're here to change things." },
  "Sun|Pisces": { meaning: "Your life force is fluid, compassionate, and spiritually attuned. Your identity dissolves and re-forms through art, service, and mystical experience.", advice: "Create. Heal. Serve. Your life has meaning when it's connected to something transcendent. But ground yourself — without boundaries, your gift becomes your burden." },

  // ── JUPITER (rules Sagittarius rising) ──
  "Jupiter|Aries": { meaning: "Your growth comes through bold, independent action. Luck finds you when you're brave enough to go first. Your path expands every time you take a risk others wouldn't.", advice: "Be the first mover. Start the company, pitch the idea, book the flight. Your luck is tied to courage — the bigger the leap, the bigger the reward." },
  "Jupiter|Taurus": { meaning: "Your growth is slow, steady, and incredibly fruitful. Luck finds you through patience, investment, and building real value. Financial abundance is genuinely available to you.", advice: "Invest — in yourself, in assets, in skills. Your wealth compounds over time. Don't chase get-rich-quick; your path is get-rich-inevitably." },
  "Jupiter|Gemini": { meaning: "Your growth comes through learning, communicating, and connecting ideas. Luck finds you through your network and your ability to make people understand complex things.", advice: "Never stop learning and never stop talking about what you've learned. Your luck multiplies through communication — write, teach, podcast, network." },
  "Jupiter|Cancer": { meaning: "Jupiter is exalted here — your growth comes through nurturing, family, and emotional intelligence. Your generosity and caring attract extraordinary luck.", advice: "Lean into your emotional gifts. Build family — biological or chosen. Your luck flows through the relationships you nurture. The more you give, the more comes back." },
  "Jupiter|Leo": { meaning: "Your growth comes through creative self-expression, leadership, and generosity. Luck finds you on stage, in charge, or in any situation where your warmth is visible.", advice: "Be generous and visible. Your luck is tied to your willingness to shine. Create, lead, celebrate others — abundance follows your warmth." },
  "Jupiter|Virgo": { meaning: "Your growth comes through mastery, service, and getting the details right. Your luck is quieter than most — it shows up as opportunities to be genuinely useful.", advice: "Become the expert. Your luck comes through competence, not charm. The more skilled you become, the more doors open. Master something fully." },
  "Jupiter|Libra": { meaning: "Your growth comes through partnership, justice, and creating beauty. Luck finds you through collaboration and your ability to bring people together.", advice: "Partner up. Your biggest wins come through collaboration, not solo effort. Invest in relationships with people who are as ambitious and fair-minded as you are." },
  "Jupiter|Scorpio": { meaning: "Your growth comes through transformation, depth, and working with other people's resources. Luck finds you in crisis, in intimacy, and in the things most people avoid.", advice: "Go where others are afraid to look. Your luck lives in the shadows — investments, psychology, shared resources, deep research. The deeper you go, the more you find." },
  "Jupiter|Sagittarius": { meaning: "Jupiter is at home here — your growth potential is enormous. Travel, philosophy, higher education, and big-picture thinking are all supercharged. Your optimism is genuinely prophetic.", advice: "Think bigger than everyone around you. Travel, study, publish, teach. Your vision for what's possible is more accurate than people give you credit for. Bet on yourself." },
  "Jupiter|Capricorn": { meaning: "Jupiter is in fall here — your growth doesn't come easy or free. But what you build is more solid than anyone's. Your luck is earned through discipline and long-term strategy.", advice: "Play the long game patiently. Your rewards come late but they come BIG. Don't compare your timeline to anyone else's — you're building something that lasts." },
  "Jupiter|Aquarius": { meaning: "Your growth comes through innovation, community, and thinking differently than everyone else. Luck finds you in groups, movements, and future-oriented projects.", advice: "Find your tribe and build something radical together. Your luck multiplies through community and original thinking. Don't try to fit in — your different perspective IS your advantage." },
  "Jupiter|Pisces": { meaning: "Jupiter is the traditional ruler of Pisces — your growth comes through compassion, faith, creativity, and spiritual connection. Your generosity is genuinely limitless.", advice: "Trust your intuition about opportunities — your gut is more reliable than spreadsheets. Give generously but set boundaries. Your spiritual gifts are real assets — treat them like it." },

  // ── SATURN (rules Capricorn + Aquarius rising) ──
  "Saturn|Aries": { meaning: "Your biggest life lessons come through learning to act with discipline instead of impulse. You're meant to become a leader — but only after you learn to lead yourself first.", advice: "Channel your fire through structure. Impulsive action burns out; disciplined action builds empires. You're learning that real courage requires patience, not just nerve." },
  "Saturn|Taurus": { meaning: "Your life lessons center on building genuine security — not just financial, but deep self-worth. You're meant to become unshakeable, but only after you stop looking for external validation.", advice: "Build real wealth — skills, savings, self-knowledge. Don't shortcut the process. Your security comes from what you've genuinely earned, not what you've been given." },
  "Saturn|Gemini": { meaning: "Your life lessons are about depth of thought and the discipline of communication. You're meant to become a real intellectual authority — but only after you stop skimming the surface.", advice: "Go deep on one subject instead of wide on twenty. Write the book, finish the degree, master the craft of clear thinking. Your mind becomes your greatest asset when it's disciplined." },
  "Saturn|Cancer": { meaning: "Your life lessons involve learning to be emotionally self-sufficient while still allowing yourself to need people. Family dynamics — probably difficult ones — are your greatest teacher.", advice: "Do the family healing work. Whatever patterns you inherited, they stop with you. Learn that emotional strength includes vulnerability, not just endurance." },
  "Saturn|Leo": { meaning: "Your life lessons center on authentic self-expression and the courage to be seen. You're learning that real confidence isn't performing — it's being genuinely yourself.", advice: "Create from a place of authenticity, not approval-seeking. Your authority grows when you stop needing applause and start trusting your own creative vision." },
  "Saturn|Virgo": { meaning: "Your life lessons are about the difference between perfectionism and genuine excellence. You're meant to master real craftsmanship — but not at the cost of your mental health.", advice: "Set standards that challenge you without destroying you. Your discipline is a gift but your self-criticism is a trap. Learn to be excellent AND kind to yourself." },
  "Saturn|Libra": { meaning: "Saturn is exalted here — your life lessons around fairness, commitment, and partnership carry real weight and real reward. You're building mature, lasting relationships that others envy.", advice: "Take commitment seriously — in love and in business. Your greatest achievements come through partnership, but only when both parties are truly accountable. Build with integrity." },
  "Saturn|Scorpio": { meaning: "Your life lessons involve confronting deep fears — around trust, control, power, and intimacy. You're learning to hold power without being consumed by it.", advice: "Face what scares you. Every fear you walk through makes you more powerful. Your maturity comes from emotional honesty — not control, not manipulation, just truth." },
  "Saturn|Sagittarius": { meaning: "Your life lessons center on turning big ideas into real-world results. Vision without execution is your cautionary tale — you're learning to build bridges between dreams and reality.", advice: "Commit to one philosophy and live it. Stop jumping between belief systems. Your growth comes from depth of conviction, not breadth of exploration." },
  "Saturn|Capricorn": { meaning: "Saturn is at home here — your life is structured around achievement, responsibility, and building something that outlasts you. This is a powerful placement for long-term success.", advice: "You were born for this. Build the institution, the career, the legacy. Just remember that success without human connection is hollow — don't sacrifice relationships for status." },
  "Saturn|Aquarius": { meaning: "Saturn is at home here too — your life lessons involve building lasting structures for collective freedom. You're learning to be both independent and responsible to a community.", advice: "Build systems that serve people, not just ideas. Your unique perspective becomes truly powerful when it's organized into something real. Be the responsible rebel." },
  "Saturn|Pisces": { meaning: "Your life lessons involve learning discipline around your spiritual and creative gifts. Without structure, your sensitivity drowns you. With it, you become an extraordinary healer.", advice: "Create daily practices — meditation, art, journaling — that give form to your formless gifts. Your boundaries aren't walls; they're containers that let your gifts actually reach people." },

  // ── PLUTO (rules Scorpio rising) ──
  "Pluto|Aries": { meaning: "Your power transforms through bold reinvention. You don't just change — you burn everything down and rebuild from scratch. People sense your intensity before you say a word.", advice: "Use your power to transform yourself first, then lead others through their own rebirths. You're not here for small changes — own that." },
  "Pluto|Taurus": { meaning: "Your power transforms through values, resources, and the material world. You have an intense relationship with money, security, and what things are really worth.", advice: "Use your transformative power to build something of genuine, lasting value. Your intensity is best channeled into creating rather than controlling." },
  "Pluto|Gemini": { meaning: "Your power transforms through information, communication, and how people think. You see the manipulation in words and can use language as a tool for deep change.", advice: "Use your insight into communication to reveal truth, not to manipulate. Your writing, speaking, and ideas have unusual power — wield them responsibly." },
  "Pluto|Cancer": { meaning: "Your power transforms through family, home, and emotional bonds. Family dynamics are where your deepest work happens — healing generational patterns is your actual life mission.", advice: "Do the family healing work. Break the cycles. Your transformation of home and emotional life ripples out to everyone around you." },
  "Pluto|Leo": { meaning: "Your power transforms through creative self-expression and leadership. You have a magnetic presence that can either inspire devotion or create power struggles.", advice: "Lead through authenticity, not dominance. Your creative power is enormous — channel it into work that transforms how people see themselves." },
  "Pluto|Virgo": { meaning: "Your power transforms through analysis, health, and service. You see what's broken in systems and people, and you have the intensity to actually fix it.", advice: "Use your penetrating analysis for healing, not criticism. Your ability to diagnose problems — in health, systems, or people — is your superpower." },
  "Pluto|Libra": { meaning: "Your power transforms through relationships and justice. Every significant partnership is a crucible — you and the people closest to you transform each other profoundly.", advice: "Choose your partners carefully — they shape your transformation. Use your power to create fairness, not to control relationship dynamics." },
  "Pluto|Scorpio": { meaning: "Pluto is at home here — your power is at maximum intensity. You see through everything, transform constantly, and carry a depth that most people find either magnetic or terrifying.", advice: "You already know you're powerful. The work is learning to be powerful WITHOUT controlling everything. Let people transform at their own pace. Your depth is a gift — don't weaponize it." },
  "Pluto|Sagittarius": { meaning: "Your power transforms through beliefs, truth-seeking, and exposing what's false. You have an intense need for meaning and you won't settle for comfortable lies.", advice: "Use your transformative vision to teach and inspire. Your passion for truth is genuine — share it through travel, writing, teaching, or philosophy." },
  "Pluto|Capricorn": { meaning: "Your power transforms through institutions, career, and structures of authority. You have the capacity to completely rebuild how power works in your field or community.", advice: "Aim your transformative intensity at systems that need rebuilding. Your ambition + your depth = the ability to create lasting structural change." },
  "Pluto|Aquarius": { meaning: "Your power transforms through community, technology, and collective consciousness. You see how groups function and you have the intensity to fundamentally change the dynamic.", advice: "Use your transformative power for the collective, not just personal evolution. You're wired to disrupt systems that no longer serve humanity — do it with both conviction and compassion." },
  "Pluto|Pisces": { meaning: "Your power transforms through spirituality, compassion, and dissolving what's false. You carry enormous psychic depth and your presence can heal or unsettle people.", advice: "Trust your spiritual power — it's real. Use your depth for healing work, creative expression, or helping people face what they've been avoiding. Protect your energy fiercely." },

  // ── URANUS (rules Aquarius rising — modern) ──
  "Uranus|Aries": { meaning: "Your independence is fierce and pioneering. You break new ground and refuse to follow anyone else's path. Revolution through individual action is your signature.", advice: "Be the disruptor. Your restlessness is purposeful — it drives innovation. Channel it into starting things nobody else has the nerve to start." },
  "Uranus|Taurus": { meaning: "Your independence transforms how you relate to security, money, and material life. You challenge conventional ideas about stability and build freedom on your own terms.", advice: "Reinvent your relationship with money and security. Your unconventional approach to resources is actually visionary — trust it." },
  "Uranus|Gemini": { meaning: "Your independence expresses through radical thinking, communication innovation, and intellectual rebellion. You think in ways that others won't catch up to for years.", advice: "Say the thing nobody else will say. Write the unconventional take. Your ideas are ahead of their time — find platforms and communities that can handle your thinking." },
  "Uranus|Cancer": { meaning: "Your independence transforms home, family, and emotional life. Your definition of family and belonging is unconventional and that's your strength.", advice: "Build family and home on YOUR terms. Don't inherit anyone else's definition of belonging. Your unconventional emotional wisdom is needed." },
  "Uranus|Leo": { meaning: "Your independence expresses through radical creativity and authentic self-expression. You refuse to perform for approval and your creative vision is genuinely original.", advice: "Create without permission. Your authenticity is more magnetic than any polished performance. Lead with your weirdness — it's what makes you unforgettable." },
  "Uranus|Virgo": { meaning: "Your independence transforms through innovation in health, work, and systems. You see more efficient, humane ways to organize life and work.", advice: "Redesign the systems everyone else just tolerates. Your eye for improvement is revolutionary when you apply it to real problems." },
  "Uranus|Libra": { meaning: "Your independence transforms relationships and social justice. You challenge conventional partnership models and fight for radical fairness.", advice: "Redefine partnership on your own terms. Your vision of equality in relationships is ahead of its time — live it." },
  "Uranus|Scorpio": { meaning: "Your independence runs through psychological depth and transformative power. You see through pretense instantly and refuse to participate in anything inauthentic.", advice: "Use your penetrating insight for liberation, not just destruction. Your ability to see truth is rare — share it with compassion." },
  "Uranus|Sagittarius": { meaning: "Your independence expresses through radical beliefs, unconventional philosophy, and a refusal to accept any single dogma. Your mind roams free.", advice: "Challenge every belief system you encounter — including your own. Your intellectual freedom inspires others to think bigger." },
  "Uranus|Capricorn": { meaning: "Your independence transforms institutions and authority structures. You see how to make systems more humane without destroying everything.", advice: "Reform from within. Your genius is seeing how to keep what works while revolutionizing what doesn't. Be the structural innovator." },
  "Uranus|Aquarius": { meaning: "Uranus is at home here — your independence is at full power. You're genuinely avant-garde, wired for community revolution, and allergic to conformity.", advice: "Lead the movement. Your vision of the future is clearer than almost anyone's. Build the community, the technology, the system that moves humanity forward." },
  "Uranus|Pisces": { meaning: "Your independence transforms spirituality and collective consciousness. You challenge old mystical frameworks and pioneer new ways of accessing the transcendent.", advice: "Trust your spiritual rebellion. The old systems don't work for everyone — you're here to create new pathways to meaning." },

  // ── NEPTUNE (rules Pisces rising — modern) ──
  "Neptune|Aries": { meaning: "Your spiritual vision is active, pioneering, and brave. You don't wait for enlightenment — you charge toward it. Your dreams are about leading and creating new realities.", advice: "Act on your visions. Your spiritual gifts become powerful through decisive action, not passive waiting. Be the spiritual warrior." },
  "Neptune|Taurus": { meaning: "Your spiritual vision is grounded, sensual, and connected to the earth. You experience the divine through nature, beauty, art, and physical pleasure.", advice: "Make beauty your spiritual practice. Your connection to the physical world IS your connection to the transcendent. Garden, cook, create with your hands." },
  "Neptune|Gemini": { meaning: "Your spiritual vision expresses through ideas, writing, and communication. You channel inspired words and your imagination works through language and story.", advice: "Write the poem. Tell the story. Your spiritual gifts flow through communication — you're the messenger between the seen and unseen." },
  "Neptune|Cancer": { meaning: "Your spiritual vision flows through emotion, nurturing, and creating sacred space. Your home can be a temple and your caring is genuinely healing.", advice: "Create sanctuary. Your ability to make people feel safe is a spiritual gift. Trust your emotional intuition — it's closer to psychic than you think." },
  "Neptune|Leo": { meaning: "Your spiritual vision expresses through creativity, performance, and generous warmth. You inspire people by making the transcendent feel personal and dramatic.", advice: "Create art that moves people spiritually. Your creative expression has genuine healing power. Be the light you keep trying to describe." },
  "Neptune|Virgo": { meaning: "Your spiritual vision is practical and service-oriented. You bring the transcendent down to earth through healing work, health, and humble service.", advice: "Your spiritual path runs through being genuinely useful. Healing, teaching, tending — these are sacred acts when you do them. Trust your grounded wisdom." },
  "Neptune|Libra": { meaning: "Your spiritual vision centers on beauty, harmony, and the divine in relationships. You see partnership as a spiritual practice and beauty as a portal to meaning.", advice: "Create beauty as a spiritual practice. Your relationships can be genuinely sacred spaces. Pursue harmony not as people-pleasing but as a spiritual calling." },
  "Neptune|Scorpio": { meaning: "Your spiritual vision is intense, transformative, and psychologically deep. You access the divine through shadow work, intensity, and fearless emotional honesty.", advice: "Dive deep. Your spiritual power is in the underworld — psychology, transformation, the things everyone else is afraid to look at. You're the healer who works in the dark." },
  "Neptune|Sagittarius": { meaning: "Your spiritual vision is expansive, philosophical, and fired by genuine faith. You see the big picture of human meaning and your optimism has a mystical quality.", advice: "Explore every spiritual tradition that calls to you. Your faith is real — it just needs breadth and depth to fully bloom. Teach what you discover." },
  "Neptune|Capricorn": { meaning: "Your spiritual vision is disciplined and practical. You don't just dream — you build temples. Your spirituality needs structure to function.", advice: "Give your spiritual life real structure — scheduled practice, concrete study, real-world application. You make the transcendent tangible, and that's rare." },
  "Neptune|Aquarius": { meaning: "Your spiritual vision is collective, technological, and future-oriented. You see how consciousness can evolve on a mass scale through innovation and community.", advice: "Build the spiritual community of the future. Your vision of collective awakening needs real-world infrastructure — create it." },
  "Neptune|Pisces": { meaning: "Neptune is at home here — your spiritual gifts are at maximum power. Intuition, empathy, creative vision, mystical experience — you access all of it naturally.", advice: "Trust your mysticism completely, but ground it through daily practice. Your spiritual depth is extraordinary — protect it with boundaries and share it through art, healing, or teaching." },
};

/** House-specific actionable insight */
const HOUSE_INSIGHT: Record<string, string> = {
  "1st": "It shapes your physical presence and how you show up in every room. When in doubt, lead with this energy — it's your natural brand.",
  "2nd": "It drives how you earn, spend, and define your self-worth. Pay attention to your financial instincts — they're sharper than you think.",
  "3rd": "It lives in your daily conversations, your learning habits, and your immediate environment. Your everyday interactions carry more power than you realize.",
  "4th": "It roots into your home life, your family patterns, and your emotional foundation. What happens in private is where your real power lives.",
  "5th": "It fuels your creativity, your romance, and your capacity for joy. The things that make you feel alive aren't luxuries — they're necessities.",
  "6th": "It runs through your daily routines, your health habits, and your work ethic. How you spend your ordinary days IS how you spend your life.",
  "7th": "It plays out through your closest partnerships and one-on-one relationships. The people you choose to commit to shape your entire trajectory.",
  "8th": "It operates in the deep end — intimacy, shared resources, transformation, and everything you don't show the world. Your hidden depths are where the real growth happens.",
  "9th": "It drives your hunger for meaning, travel, and higher learning. Your beliefs aren't just opinions — they're the architecture of your entire life.",
  "10th": "It shapes your public image, career, and legacy. What you're known for and what you build in the world carries this energy at its core.",
  "11th": "It flows through your friendships, communities, and vision for the future. The groups you belong to amplify this energy exponentially.",
  "12th": "It operates beneath the surface — in your dreams, your solitude, and your spiritual life. The most important work you do happens when nobody's watching.",
};

function generateRulerSummary(
  ruler: string,
  _risingSignFull: string,
  rulerSignFull: string,
  houseOrdinal: string,
  _rulerSignAbbr: string
): string {
  const key = `${ruler}|${rulerSignFull}`;
  const entry = RULER_IN_SIGN[key];

  if (entry) {
    let text = entry.meaning + " " + entry.advice;
    if (houseOrdinal && HOUSE_INSIGHT[houseOrdinal]) {
      text += " " + HOUSE_INSIGHT[houseOrdinal];
    }
    return text;
  }

  // Fallback for any unexpected combo
  let fallback = `${ruler} in ${rulerSignFull} is driving your chart. This placement shapes how you approach everything — it's the lens your whole life looks through.`;
  if (houseOrdinal && HOUSE_INSIGHT[houseOrdinal]) {
    fallback += " " + HOUSE_INSIGHT[houseOrdinal];
  }
  return fallback;
}
