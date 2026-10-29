/**
 * Celestial Calendar — multi-cultural astronomical & astrological date system.
 *
 * Moon phases, zodiac seasons, nakshatras, eclipses, retrogrades and the
 * solar-term festivals are computed with astronomy-engine for any year.
 * Festivals on a lunisolar calendar that depends on local observance (the
 * Hindu tithi calendar, Islamic moon sighting, the Tibetan calendar) are taken
 * from a table of verified dates, and are shown ONLY for the years in that
 * table — a missing festival is better than last year's date.
 */

import * as Astronomy from "astronomy-engine";
import {
  eclipsesBetween,
  eclipseNear,
  retrogradePeriodsBetween,
  calendarDayIn,
  isOnDay,
  localDayWindow,
  type SkyEclipse,
} from "@/lib/astro/skyCalendar";
import {
  getMoonPhaseFraction,
  getMoonIllumination,
  getMoonLongitude,
  getSunLongitude,
  getCurrentMoonSign,
  getCurrentSunSign,
  getSeasonDates,
  moonEventsForYear,
  nextMoonEventInstant,
  isSameLocalDay,
} from "@/lib/astro/currentSky";
import { jdFromDate, toSidereal, type AyanamsaName } from "@/lib/astro/vedic/ayanamsa";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface MoonPhaseInfo {
  phase: "new" | "waxing-crescent" | "first-quarter" | "waxing-gibbous" | "full" | "waning-gibbous" | "last-quarter" | "waning-crescent";
  label: string;
  illumination: number; // 0-100
  emoji: string;
  description: string;
  energy: string;
  almanac: AlmanacInfo;
}

export interface AlmanacLifeTip {
  category: string;
  icon: string;
  tip: string;
}

export interface AlmanacRitual {
  name: string;
  description: string;
}

export interface AlmanacInfo {
  gardening: string;
  bestFor: string[];       // e.g. ["planting leafy greens", "pruning"]
  avoid: string[];         // e.g. ["harvesting herbs", "transplanting"]
  weatherLore: string;
  folkWisdom: string;
  rituals: AlmanacRitual[];  // actual ritual practices for this phase
  lifeTips: AlmanacLifeTip[];
}

// ─── MOON PHASE CORRESPONDENCES ─────────────────────────────────────────────
// Crystals, oils, candles, runes, chakras, flowers, colors, tarot per phase

export interface PhaseCorrespondence {
  crystals: { name: string; reason: string }[];
  essentialOils: { name: string; reason: string }[];
  candleColor: { color: string; reason: string };
  rune: { symbol: string; name: string; meaning: string };
  chakra: { name: string; color: string; focus: string };
  flowers: { name: string; use: string }[];
  tarot: { card: string; meaning: string };
  colors: string[];
  simpleRitual: { name: string; steps: string[] };
}

export const PHASE_CORRESPONDENCES: Record<MoonPhaseInfo["phase"], PhaseCorrespondence> = {
  "new": {
    crystals: [
      { name: "Black Tourmaline", reason: "Grounding and protection from negative energy" },
      { name: "Moonstone", reason: "Lunar connection and inner knowing" },
      { name: "Clear Quartz", reason: "Amplifies intentions and brings clarity" },
      { name: "Obsidian", reason: "Absorbs negativity, supports fresh starts" },
    ],
    essentialOils: [
      { name: "Frankincense", reason: "Purification and connection to inner wisdom" },
      { name: "Cypress", reason: "Cleansing and grounding during transition" },
      { name: "Lavender", reason: "Calm openness to new possibilities" },
    ],
    candleColor: { color: "Black or white", reason: "Black for the void and infinite potential; white for cleansing and new beginnings" },
    rune: { symbol: "ᛒ", name: "Berkano", meaning: "Birth, new beginnings, fertile potential" },
    chakra: { name: "Root (Muladhara)", color: "#e74c3c", focus: "Grounding and stability as foundation for new intentions" },
    flowers: [
      { name: "Mugwort", use: "Dreams and intuition — burn as incense or place under pillow" },
      { name: "Jasmine", use: "Spiritual connection — steep as tea or diffuse the oil" },
      { name: "Chamomile", use: "Receptivity to change — gentle tea before intention setting" },
    ],
    tarot: { card: "The Hermit", meaning: "Introspection and inner clarity before action" },
    colors: ["Black", "Deep purple", "Indigo"],
    simpleRitual: {
      name: "Candle & Intentions",
      steps: [
        "Light a white or black candle in a quiet space",
        "Hold a crystal (moonstone or black tourmaline) in your non-dominant hand",
        "Write 3–5 specific intentions for this lunar cycle",
        "Read each intention aloud once, then fold the paper",
        "Place it somewhere you'll see it daily — altar, nightstand, mirror",
      ],
    },
  },
  "waxing-crescent": {
    crystals: [
      { name: "Citrine", reason: "Motivation, creativity, and manifestation energy" },
      { name: "Green Aventurine", reason: "Prosperity and new opportunities" },
      { name: "Clear Quartz", reason: "Amplifies the growing energy of intentions" },
      { name: "Moonstone", reason: "Gentle lunar connection during growth" },
    ],
    essentialOils: [
      { name: "Lemon", reason: "Clarity and mental sharpness for first steps" },
      { name: "Orange", reason: "Creative fire and optimism" },
      { name: "Rosemary", reason: "Focus, remembrance, and intention-keeping" },
    ],
    candleColor: { color: "Pale yellow or green", reason: "Emerging light and fresh growth energy" },
    rune: { symbol: "ᚲ", name: "Kenaz", meaning: "Illumination, passion, creative awakening" },
    chakra: { name: "Sacral (Svadhisthana)", color: "#f39c12", focus: "Creativity, new ideas, fertile potential" },
    flowers: [
      { name: "Basil", use: "Abundance and new beginnings — keep a sprig on your desk" },
      { name: "Rosemary", use: "Clarity and intention — burn or steep as tea" },
      { name: "Mint", use: "Fresh energy and mental activation — chew a leaf or diffuse" },
    ],
    tarot: { card: "The Magician", meaning: "Taking first action and harnessing potential" },
    colors: ["Green", "Gold", "Pale yellow", "Silver"],
    simpleRitual: {
      name: "First Action Ritual",
      steps: [
        "Light a pale yellow or green candle",
        "Hold citrine or green aventurine in your hand",
        "Review your new moon intentions — pick the one that pulls you most",
        "Write down the smallest possible action you can take today",
        "Do it. Send the email, make the call, buy the supplies",
      ],
    },
  },
  "first-quarter": {
    crystals: [
      { name: "Carnelian", reason: "Motivation, courage, and willpower" },
      { name: "Red Jasper", reason: "Strength and determination" },
      { name: "Tiger's Eye", reason: "Clarity, confidence, and focus" },
      { name: "Pyrite", reason: "Protective action and resolute energy" },
    ],
    essentialOils: [
      { name: "Ginger", reason: "Courage, warmth, and forward momentum" },
      { name: "Cinnamon", reason: "Swift manifestation and energetic push" },
      { name: "Black Pepper", reason: "Overcoming obstacles and resistance" },
    ],
    candleColor: { color: "Red or orange", reason: "Action, willpower, and decisive energy" },
    rune: { symbol: "ᛃ", name: "Jera", meaning: "Cycles, harvest, reaping rewards of action" },
    chakra: { name: "Solar Plexus (Manipura)", color: "#f1c40f", focus: "Personal will, decisive action, confidence" },
    flowers: [
      { name: "Cinnamon bark", use: "Speedy manifestation — burn a stick or add to tea" },
      { name: "Ginger root", use: "Courage and warmth — brew fresh ginger tea" },
      { name: "Nettle", use: "Strength and boundary-setting — steep as tea" },
    ],
    tarot: { card: "The Chariot", meaning: "Overcoming obstacles with determination" },
    colors: ["Red", "Orange", "Bright yellow", "Gold"],
    simpleRitual: {
      name: "Obstacle & Commitment",
      steps: [
        "Light a red or orange candle",
        "Hold carnelian or tiger's eye in your dominant hand",
        "Write down the biggest obstacle between you and your intention",
        "Speak aloud: 'I take this step with clarity and courage'",
        "Burn the paper safely — watch the obstacle become ash",
      ],
    },
  },
  "waxing-gibbous": {
    crystals: [
      { name: "Amethyst", reason: "Clarity of mind and spiritual refinement" },
      { name: "Fluorite", reason: "Focus, organization, and discernment" },
      { name: "Labradorite", reason: "Intuitive clarity and inner wisdom" },
      { name: "Sodalite", reason: "Truthful assessment and calm analysis" },
    ],
    essentialOils: [
      { name: "Lavender", reason: "Calm focus and peaceful refinement" },
      { name: "Sandalwood", reason: "Wisdom, mindfulness, grounding clarity" },
      { name: "Eucalyptus", reason: "Mental clarity and sharpened focus" },
    ],
    candleColor: { color: "Purple or deep blue", reason: "Refinement, mindfulness, and wisdom" },
    rune: { symbol: "ᚨ", name: "Ansuz", meaning: "Knowledge, wisdom, divine communication" },
    chakra: { name: "Third Eye (Ajna)", color: "#8e44ad", focus: "Intuition, vision, refined perception" },
    flowers: [
      { name: "Sage", use: "Clarity and energetic refinement — burn or brew" },
      { name: "Thyme", use: "Focus and mental sharpness — cook with or steep" },
      { name: "Lavender", use: "Calm contemplation — sachets, tea, or diffuse" },
    ],
    tarot: { card: "The Hermit", meaning: "Refinement through introspection" },
    colors: ["Purple", "Deep blue", "Indigo", "Violet"],
    simpleRitual: {
      name: "Refinement Review",
      steps: [
        "Light a purple or deep blue candle",
        "Hold amethyst and sit quietly for 3 breaths",
        "Review your progress since the new moon — what's working?",
        "Write down 2–3 tweaks or adjustments to your approach",
        "This is polishing, not starting over — trust what you've built",
      ],
    },
  },
  "full": {
    crystals: [
      { name: "Selenite", reason: "Lunar alignment, clarity, high vibration" },
      { name: "Clear Quartz", reason: "Amplifies all energy at peak" },
      { name: "Labradorite", reason: "Intuition, inner light, and magic" },
      { name: "Rose Quartz", reason: "Self-love and gratitude at the peak" },
    ],
    essentialOils: [
      { name: "Rose", reason: "Completion, self-love, and appreciation" },
      { name: "Jasmine", reason: "Culmination and heightened intuition" },
      { name: "Ylang Ylang", reason: "Peace, harmony, and heart opening" },
    ],
    candleColor: { color: "White or silver", reason: "Illumination, completion, peak clarity" },
    rune: { symbol: "ᚠ", name: "Fehu", meaning: "Abundance, fullness, manifestation of intention" },
    chakra: { name: "Crown (Sahasrara)", color: "#9b59b6", focus: "Illumination, connection, transcendence" },
    flowers: [
      { name: "Rose", use: "Gratitude and completion — float petals in moon water" },
      { name: "Mugwort", use: "Heightened intuition — burn or place under pillow" },
      { name: "Yarrow", use: "Integration and wholeness — steep as tea" },
    ],
    tarot: { card: "The Moon", meaning: "Intuition at fullness, culmination of the cycle" },
    colors: ["White", "Silver", "Pale gold"],
    simpleRitual: {
      name: "Moon Water & Release",
      steps: [
        "Light a white or silver candle by a window",
        "Write what has manifested this cycle — celebrate it",
        "Write what you're releasing — read it aloud, then burn or tear it",
        "Fill a glass jar with water and set it in the moonlight overnight",
        "Use the moon water for tea, plants, or cleansing your space",
      ],
    },
  },
  "waning-gibbous": {
    crystals: [
      { name: "Rose Quartz", reason: "Compassionate release and gratitude" },
      { name: "Smoky Quartz", reason: "Grounding release, transmuting heaviness" },
      { name: "Rhodonite", reason: "Healing past wounds and emotional release" },
      { name: "Lepidolite", reason: "Surrender, peace, and gentle letting go" },
    ],
    essentialOils: [
      { name: "Lavender", reason: "Calm release and soothing" },
      { name: "Rose", reason: "Compassionate letting go and self-love" },
      { name: "Chamomile", reason: "Gentle surrender and peaceful transition" },
    ],
    candleColor: { color: "Blue or soft purple", reason: "Graceful release and peaceful transition" },
    rune: { symbol: "ᛞ", name: "Dagaz", meaning: "Breakthrough, transition, dawn of new clarity" },
    chakra: { name: "Heart (Anahata)", color: "#27ae60", focus: "Compassionate release, gratitude, healing" },
    flowers: [
      { name: "Lavender", use: "Emotional soothing — bath, sachets, or tea" },
      { name: "Rose petals", use: "Compassionate letting go — scatter in bath" },
      { name: "Chamomile", use: "Peaceful surrender — gentle tea before bed" },
    ],
    tarot: { card: "Temperance", meaning: "Graceful integration and finding balance" },
    colors: ["Blue", "Soft purple", "Gray", "Silver"],
    simpleRitual: {
      name: "Gratitude & Release",
      steps: [
        "Light a blue or soft purple candle",
        "Hold rose quartz against your heart",
        "Write one thing you're releasing with gratitude for what it taught you",
        "Speak: 'I release this with love'",
        "Steep chamomile tea and sip it slowly — let the warmth dissolve what's left",
      ],
    },
  },
  "last-quarter": {
    crystals: [
      { name: "Black Tourmaline", reason: "Final clearing and protection" },
      { name: "Obsidian", reason: "Shadow release and completion" },
      { name: "Smoky Quartz", reason: "Grounding transmutation" },
      { name: "Hematite", reason: "Stabilizing closure and earthing" },
    ],
    essentialOils: [
      { name: "Frankincense", reason: "Spiritual closure and inner work" },
      { name: "Cedarwood", reason: "Final purification and grounding" },
      { name: "Patchouli", reason: "Earthiness and grounding completion" },
    ],
    candleColor: { color: "Gray or dark blue", reason: "Closure, clearing, and final release" },
    rune: { symbol: "ᛇ", name: "Eihwaz", meaning: "Transition, death and rebirth, resilience" },
    chakra: { name: "Root (Muladhara)", color: "#e74c3c", focus: "Grounding completion, preparing for renewal" },
    flowers: [
      { name: "Cedar", use: "Final cleansing — burn tips or use cedarwood oil" },
      { name: "Thyme", use: "Releasing what's stuck — steep and drink mindfully" },
      { name: "Mugwort", use: "Inner clearing and shadow work — burn as smudge" },
    ],
    tarot: { card: "The Hanged Man", meaning: "Surrender and releasing what no longer serves" },
    colors: ["Black", "Gray", "Dark blue", "Earth tones"],
    simpleRitual: {
      name: "Cord Cutting",
      steps: [
        "Light a gray or dark blue candle",
        "Hold black tourmaline or obsidian in your hand",
        "Write what you're consciously releasing — patterns, beliefs, habits",
        "Burn or tear the paper: 'I let this go. I clear space for what's next'",
        "Press your feet firmly to the floor — feel yourself grounded and free",
      ],
    },
  },
  "waning-crescent": {
    crystals: [
      { name: "Black Moonstone", reason: "Rest and inner wisdom in stillness" },
      { name: "Lepidolite", reason: "Surrender, peace, and gentle dissolution" },
      { name: "Smoky Quartz", reason: "Grounding completion" },
      { name: "Amethyst", reason: "Dream work and spiritual integration" },
    ],
    essentialOils: [
      { name: "Myrrh", reason: "Inner reflection and spiritual completion" },
      { name: "Frankincense", reason: "Introspection and preparation for renewal" },
      { name: "Sandalwood", reason: "Grounding rest and peaceful closure" },
    ],
    candleColor: { color: "Deep indigo or black", reason: "Rest, the void before rebirth" },
    rune: { symbol: "ᛁ", name: "Isa", meaning: "Ice, stillness, clarity through pause" },
    chakra: { name: "Crown (Sahasrara)", color: "#9b59b6", focus: "Rest and integration, surrendering to the void" },
    flowers: [
      { name: "Mugwort", use: "Dream work — place under pillow or burn before sleep" },
      { name: "Passionflower", use: "Peaceful surrender — steep as sleep tea" },
      { name: "Patchouli", use: "Grounding rest — diffuse or add to bath" },
    ],
    tarot: { card: "The Star", meaning: "Hope and rest, inner wisdom in stillness" },
    colors: ["Black", "Deep indigo", "Dark purple", "Silver"],
    simpleRitual: {
      name: "Sacred Rest",
      steps: [
        "Dim the lights or sit in darkness — skip the candle if you want",
        "Hold lepidolite or amethyst loosely in your hand",
        "Journal stream-of-consciousness about the entire cycle",
        "Don't force closure — just listen to what surfaces",
        "The waning crescent asks nothing of you except presence",
      ],
    },
  },
};

export interface CelestialEvent {
  id: string;
  name: string;
  date: Date;
  endDate?: Date;
  tradition: "vedic" | "chinese" | "celtic" | "islamic" | "western" | "indigenous" | "astronomical" | "pagan" | "egyptian" | "persian" | "tibetan" | "thai" | "japanese";
  category: "moon" | "solar" | "festival" | "season" | "planetary";
  description: string;
  ritualHint: string;
  element?: "fire" | "water" | "earth" | "air" | "spirit";
}

export interface ZodiacSeason {
  sign: string;
  element: "fire" | "water" | "earth" | "air";
  modality: "cardinal" | "fixed" | "mutable";
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  rulingPlanet: string;
  theme: string;
}

export interface DailyEnergy {
  moonPhase: MoonPhaseInfo;
  zodiacSeason: ZodiacSeason;
  dayOfWeek: PlanetaryDay;
  upcomingEvents: CelestialEvent[];
  currentEvents: CelestialEvent[];
  element: "fire" | "water" | "earth" | "air";
}

export interface PlanetaryDay {
  day: string;
  planet: string;
  energy: string;
  color: string;
  focus: string;
}

// ─── ZODIAC SEASONS ───────────────────────────────────────────────────────────

export const ZODIAC_SEASONS: ZodiacSeason[] = [
  { sign: "Aries", element: "fire", modality: "cardinal", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19, rulingPlanet: "Mars", theme: "Initiative & new beginnings" },
  { sign: "Taurus", element: "earth", modality: "fixed", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20, rulingPlanet: "Venus", theme: "Grounding & abundance" },
  { sign: "Gemini", element: "air", modality: "mutable", startMonth: 5, startDay: 21, endMonth: 6, endDay: 20, rulingPlanet: "Mercury", theme: "Curiosity & connection" },
  { sign: "Cancer", element: "water", modality: "cardinal", startMonth: 6, startDay: 21, endMonth: 7, endDay: 22, rulingPlanet: "Moon", theme: "Nurturing & home" },
  { sign: "Leo", element: "fire", modality: "fixed", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22, rulingPlanet: "Sun", theme: "Expression & joy" },
  { sign: "Virgo", element: "earth", modality: "mutable", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22, rulingPlanet: "Mercury", theme: "Service & refinement" },
  { sign: "Libra", element: "air", modality: "cardinal", startMonth: 9, startDay: 23, endMonth: 10, endDay: 22, rulingPlanet: "Venus", theme: "Balance & harmony" },
  { sign: "Scorpio", element: "water", modality: "fixed", startMonth: 10, startDay: 23, endMonth: 11, endDay: 21, rulingPlanet: "Pluto", theme: "Transformation & depth" },
  { sign: "Sagittarius", element: "fire", modality: "mutable", startMonth: 11, startDay: 22, endMonth: 12, endDay: 21, rulingPlanet: "Jupiter", theme: "Expansion & truth" },
  { sign: "Capricorn", element: "earth", modality: "cardinal", startMonth: 12, startDay: 22, endMonth: 1, endDay: 19, rulingPlanet: "Saturn", theme: "Discipline & legacy" },
  { sign: "Aquarius", element: "air", modality: "fixed", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18, rulingPlanet: "Uranus", theme: "Innovation & community" },
  { sign: "Pisces", element: "water", modality: "mutable", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20, rulingPlanet: "Neptune", theme: "Dreams & intuition" },
];

// ─── PLANETARY DAYS ───────────────────────────────────────────────────────────
// Ancient system shared across Vedic, Hellenistic, and many other traditions

export const PLANETARY_DAYS: PlanetaryDay[] = [
  { day: "Sunday", planet: "Sun", energy: "Vitality & self-expression", color: "Gold", focus: "Your core identity and creative power. Good for setting intentions about who you want to become." },
  { day: "Monday", planet: "Moon", energy: "Emotion & intuition", color: "Silver", focus: "Your inner world and emotional needs. Good for journaling, rest, and listening to your gut." },
  { day: "Tuesday", planet: "Mars", energy: "Action & courage", color: "Red", focus: "Physical energy and initiative. Good for starting projects, workouts, and tackling hard conversations." },
  { day: "Wednesday", planet: "Mercury", energy: "Communication & learning", color: "Yellow", focus: "The mind and connections. Good for writing, studying, important conversations, and networking." },
  { day: "Thursday", planet: "Jupiter", energy: "Growth & abundance", color: "Blue", focus: "Expansion and opportunity. Good for big-picture planning, travel, and generous acts." },
  { day: "Friday", planet: "Venus", energy: "Love & beauty", color: "Green", focus: "Relationships and pleasure. Good for dates, art, self-care, and appreciating what you have." },
  { day: "Saturday", planet: "Saturn", energy: "Structure & discipline", color: "Black", focus: "Responsibility and long-term goals. Good for organizing, decluttering, and honest self-assessment." },
];

// Extended planetary day context — explainers for users new to this system
export interface PlanetaryDayContext {
  planetMeaning: string;      // what does this planet represent
  colorMeaning: string;       // why this specific color
  vedicName: string;          // Sanskrit name for the day
  bodyPart: string;           // body area associated
  doToday: string[];          // specific actionable suggestions
  avoidToday: string[];       // what doesn't flow well today
  howToUseColor: string;      // practical color application
}

export const PLANETARY_DAY_CONTEXT: Record<string, PlanetaryDayContext> = {
  Sunday: {
    planetMeaning: "The Sun represents your core self — your ego, vitality, life force, and how you shine in the world. In Vedic astrology (Jyotish), Surya is the soul itself. When the Sun rules the day, your sense of self is amplified — both your confidence and your ego.",
    colorMeaning: "Gold and orange are the Sun's colors because they mirror its light — warmth, radiance, visibility. Wearing gold on Sunday strengthens your solar energy: confidence, leadership, and self-expression. It's about being seen.",
    vedicName: "Ravivāra (रविवार) — from Ravi, meaning Sun",
    bodyPart: "Heart, eyes, and bones — your structural vitality",
    doToday: ["Set personal intentions", "Creative self-expression", "Leadership decisions", "Spend time in actual sunlight", "Wear gold jewelry or gold-toned clothes"],
    avoidToday: ["People-pleasing", "Dimming yourself for others", "Starting something for someone else's approval"],
    howToUseColor: "Wear gold, orange, or warm yellow. If subtle, a gold ring or amber-toned accessory works. The idea is to carry solar warmth on your body — it signals to your subconscious that today is about your own radiance.",
  },
  Monday: {
    planetMeaning: "The Moon represents your emotional body — your feelings, instincts, habits, comfort needs, and inner child. In Vedic astrology, Chandra rules the mind (manas). Monday is for tending to your emotional landscape, not pushing through it.",
    colorMeaning: "Silver and white reflect the Moon's cool, receptive light. Unlike the Sun's active gold, silver is about receiving, reflecting, and softening. Wearing silver on Monday supports emotional clarity and intuitive flow.",
    vedicName: "Somavāra (सोमवार) — from Soma, the Moon/nectar",
    bodyPart: "Chest, stomach, and fluids — your emotional and digestive center",
    doToday: ["Journal and emotional check-ins", "Nurture yourself or someone close", "Cook comfort food", "Water-related activities", "Trust your gut instincts"],
    avoidToday: ["Pushing through exhaustion", "Making decisions purely from logic", "Ignoring how you feel about something"],
    howToUseColor: "Wear white, silver, cream, or pale blue. Silver jewelry is traditional. The goal is to feel soft and receptive rather than armored — you're honoring the inner world today, not performing for the outer one.",
  },
  Tuesday: {
    planetMeaning: "Mars represents your drive, courage, physical energy, sexuality, and capacity for conflict. In Vedic astrology, Mangala is both the warrior and the protector. Tuesday is about action — not thinking about acting, but actually moving.",
    colorMeaning: "Red is the color of blood, fire, and urgency. It raises your heart rate, increases adrenaline, and signals the nervous system to activate. Wearing red on Tuesday channels Mars's direct, courageous energy — it's permission to be bold.",
    vedicName: "Maṅgalavāra (मंगलवार) — from Mangala, meaning auspicious/Mars",
    bodyPart: "Muscles, blood, and adrenals — your action system",
    doToday: ["Exercise and physical challenges", "Start difficult projects", "Have hard conversations", "Compete or assert yourself", "Cut through indecision with action"],
    avoidToday: ["Passive-aggression (Mars prefers directness)", "Picking fights without purpose", "Stewing in anger instead of channeling it"],
    howToUseColor: "Wear red, rust, or deep coral. Even red underwear or a red phone case counts — it doesn't have to be loud. The color activates your Mars energy: physical courage and willingness to begin.",
  },
  Wednesday: {
    planetMeaning: "Mercury represents your mind — how you think, communicate, learn, and process information. In Vedic astrology, Budha (Mercury) rules intelligence and speech. Wednesday is about mental agility, connections, and getting the words right.",
    colorMeaning: "Green and yellow are Mercury's colors — green for growth of ideas, yellow for mental brightness. These colors stimulate the nervous system gently and support alert, curious thinking without overstimulation.",
    vedicName: "Budhavāra (बुधवार) — from Budha, meaning Mercury/wisdom",
    bodyPart: "Nervous system, hands, and lungs — your communication pathways",
    doToday: ["Write (anything — emails, journals, creative work)", "Study and learn new things", "Have important conversations", "Network and connect people", "Send the message you've been drafting"],
    avoidToday: ["Zoning out on passive content", "Avoiding communication", "Making decisions without gathering information first"],
    howToUseColor: "Wear green or yellow — emerald green for grounded intellect, bright yellow for mental clarity. Mercury energy is quick and light, so these colors should feel fresh rather than heavy.",
  },
  Thursday: {
    planetMeaning: "Jupiter is the great benefic — expansion, luck, wisdom, higher learning, and abundance. In Vedic astrology, Guru (Jupiter) is literally the teacher. Thursday amplifies whatever you direct your attention toward, so aim it at growth.",
    colorMeaning: "Blue and gold are Jupiter's colors. Royal blue represents wisdom, sky-gazing, and the expansive quality of Jupiter's energy. Gold represents abundance and the reward that comes from living generously.",
    vedicName: "Guruvāra (गुरुवार) — from Guru, meaning teacher/Jupiter",
    bodyPart: "Liver, thighs, and fat stores — your expansion system",
    doToday: ["Big-picture planning and vision work", "Generous acts (give more than usual)", "Higher learning and teaching", "Travel or plan travel", "Take calculated risks"],
    avoidToday: ["Playing small", "Scarcity thinking", "Refusing to share what you have"],
    howToUseColor: "Wear royal blue, sapphire tones, or gold. Jupiter energy is expansive and generous — these colors mirror that. Blue especially signals openness and trust, which attracts opportunity.",
  },
  Friday: {
    planetMeaning: "Venus represents love, beauty, pleasure, art, harmony, and your values. In Vedic astrology, Shukra rules both romantic love and material comfort. Friday is about appreciating beauty, connecting with what you love, and letting yourself enjoy things.",
    colorMeaning: "Green and pink are Venus's colors — green for growth in relationships and abundance, pink for tenderness and heart-opening. White and pastels also work. Venus energy is soft, receptive, and aesthetically refined.",
    vedicName: "Shukravāra (शुक्रवार) — from Shukra, meaning Venus/brightness",
    bodyPart: "Kidneys, skin, and reproductive system — your pleasure and balance centers",
    doToday: ["Self-care rituals", "Dates and quality time with loved ones", "Art, music, and creative expression", "Bring something beautiful into your space", "Eat slowly and with full attention"],
    avoidToday: ["Denying yourself pleasure", "Purely transactional interactions", "Ignoring aesthetics (how you look, how your space looks)"],
    howToUseColor: "Wear green, pink, white, or soft pastels. Floral patterns are very Venus. The goal is to feel beautiful and soft — Venus rewards you for slowing down and appreciating sensory experience.",
  },
  Saturday: {
    planetMeaning: "Saturn represents time, discipline, karma, limitations, and long-term rewards. In Vedic astrology, Shani is both the taskmaster and the great teacher — he restricts in order to strengthen. Saturday is about respecting structure, not resenting it.",
    colorMeaning: "Black and dark blue are Saturn's colors. Black represents the void of distraction — focus, absence of frills, getting down to what's essential. It's not depressing; it's serious. Saturn rewards you for taking yourself seriously.",
    vedicName: "Shanivāra (शनिवार) — from Shani, meaning Saturn/slow-moving",
    bodyPart: "Bones, teeth, knees, and joints — your structural integrity",
    doToday: ["Organize and declutter", "Do the hard, boring, necessary task", "Set boundaries", "Long-term planning", "Acknowledge what you've endured"],
    avoidToday: ["Shortcuts and quick fixes", "Avoiding responsibility", "Over-committing to new things (finish what's started)"],
    howToUseColor: "Wear black, dark navy, or charcoal. Saturn energy is about simplicity and seriousness — dark, clean colors reflect discipline and focus. It's not about being somber; it's about being intentional.",
  },
};

// ─── VEDIC SYSTEM: NAKSHATRAS & TITHIS ───────────────────────────────────────

export interface NakshatraInfo {
  name: string;
  deity: string;
  quality: string;
  element: "fire" | "water" | "earth" | "air";
  brief: string;
}

// 27 Nakshatras (lunar mansions) — core of Vedic astrology
export const NAKSHATRAS: NakshatraInfo[] = [
  { name: "Ashwini", deity: "Ashwini Kumaras", quality: "Swift", element: "fire", brief: "Healing, speed, fresh starts. The divine physicians ride through — a star traditionally linked with swiftness and new beginnings." },
  { name: "Bharani", deity: "Yama", quality: "Creative", element: "earth", brief: "Birth, death, transformation. A potent time for letting go of what no longer serves and welcoming what's emerging." },
  { name: "Krittika", deity: "Agni", quality: "Purifying", element: "fire", brief: "Fire of purification. Burns away the unnecessary. Good for cutting cords, cleansing spaces, or speaking hard truths." },
  { name: "Rohini", deity: "Brahma", quality: "Nurturing", element: "earth", brief: "Fertility, beauty, growth. The most creative and lush nakshatra. Ideal for planting seeds — literal or metaphorical." },
  { name: "Mrigashira", deity: "Soma", quality: "Searching", element: "air", brief: "The seeker's star. Curiosity is amplified. Great for research, exploration, and following what intrigues you." },
  { name: "Ardra", deity: "Rudra", quality: "Stormy", element: "water", brief: "Emotional storms that clear the air. Tears may come but they're cleansing. Good for breakthroughs after struggle." },
  { name: "Punarvasu", deity: "Aditi", quality: "Renewing", element: "air", brief: "Return and renewal. Things that were lost come back. A hopeful, abundant energy for second chances." },
  { name: "Pushya", deity: "Brihaspati", quality: "Nourishing", element: "water", brief: "Considered the most auspicious nakshatra for almost everything. Nurture, protect, and invest in what matters." },
  { name: "Ashlesha", deity: "Nagas", quality: "Mystical", element: "water", brief: "Serpent wisdom and hidden knowledge. Good for intuitive work and uncovering secrets, but watch for manipulation." },
  { name: "Magha", deity: "Pitris (Ancestors)", quality: "Royal", element: "fire", brief: "Ancestral power and authority. Honor your lineage and claim your rightful place. Good for connecting with family roots." },
  { name: "Purva Phalguni", deity: "Bhaga", quality: "Joyful", element: "water", brief: "Pleasure, relaxation, and celebration. The universe says rest and enjoy. Perfect for socializing and romance." },
  { name: "Uttara Phalguni", deity: "Aryaman", quality: "Friendly", element: "fire", brief: "Patronage and friendship. Good for forming alliances, asking for help, and acts of generosity." },
  { name: "Hasta", deity: "Savitar", quality: "Skillful", element: "air", brief: "Craftsmanship and manual skill. Whatever your hands touch today can be shaped beautifully. Good for making things." },
  { name: "Chitra", deity: "Tvashtar", quality: "Brilliant", element: "fire", brief: "The cosmic architect. Beauty, design, and creation. Excellent for artistic work, fashion, and aesthetic choices." },
  { name: "Swati", deity: "Vayu", quality: "Independent", element: "air", brief: "The wind star — freedom, independence, and flexibility. Good for adapting, traveling, and doing your own thing." },
  { name: "Vishakha", deity: "Indra-Agni", quality: "Determined", element: "fire", brief: "Single-pointed focus and ambition. Great for pushing through obstacles when you've got a clear goal." },
  { name: "Anuradha", deity: "Mitra", quality: "Devotional", element: "water", brief: "Friendship and devotion. Deepen bonds, honor commitments, and practice loyalty to people and causes you love." },
  { name: "Jyeshtha", deity: "Indra", quality: "Protective", element: "air", brief: "The eldest star — leadership and protection. Stand up for those who need it. Watch for ego battles." },
  { name: "Mula", deity: "Nirriti", quality: "Uprooting", element: "earth", brief: "Getting to the root. Powerful for shadow work and digging into why you do what you do. Can feel destabilizing." },
  { name: "Purva Ashadha", deity: "Apas", quality: "Invincible", element: "water", brief: "Unstoppable momentum. Once you begin under this star, you will not be defeated. Good for declarations and commitments." },
  { name: "Uttara Ashadha", deity: "Vishvadevas", quality: "Universal", element: "earth", brief: "Ultimate victory through patience. The slow, steady win. Good for long-term strategy and ethical stands." },
  { name: "Shravana", deity: "Vishnu", quality: "Listening", element: "air", brief: "Deep listening and learning. The universe has something to tell you — be still and pay attention." },
  { name: "Dhanishtha", deity: "Vasus", quality: "Rhythmic", element: "earth", brief: "Wealth, music, and rhythm. Traditionally linked with abundance; a day for creative expression through sound and finding your groove." },
  { name: "Shatabhisha", deity: "Varuna", quality: "Healing", element: "air", brief: "The hundred healers. Solitude and healing are favored. Traditionally a star of retreat, quiet and restoration." },
  { name: "Purva Bhadrapada", deity: "Aja Ekapada", quality: "Intense", element: "fire", brief: "Intense spiritual fire. Good for bold spiritual practices and breaking through limitations, but can feel extreme." },
  { name: "Uttara Bhadrapada", deity: "Ahir Budhnya", quality: "Deep", element: "water", brief: "The deep ocean serpent. Profound wisdom emerges from stillness. Meditation and spiritual practice are deeply supported." },
  { name: "Revati", deity: "Pushan", quality: "Gentle", element: "earth", brief: "The final nakshatra — completion, safe journeys, and gentle endings. Good for wrapping up projects and saying goodbye with grace." },
];

// ─── FULL ALMANAC REFERENCE ───────────────────────────────────────────────────
// All 8 moon phases with complete almanac data, for the standalone almanac view

export interface AlmanacPhaseEntry {
  phase: MoonPhaseInfo["phase"];
  label: string;
  emoji: string;
  daysInCycle: string;
  energy: string;
  almanac: AlmanacInfo;
}

/**
 * Which days of the 29.53-day cycle a phase covers, derived from the same
 * eighth-of-a-cycle bins getMoonPhase() classifies with: each named phase is
 * centred on its exact moment (first quarter ~day 7.4, full ~14.8, last
 * quarter ~22.1), so the label matches what the moon card shows that day.
 * These used to be typed by hand and put the full moon on days 11–15, three
 * days early.
 */
const SYNODIC_DAYS = 29.53;
function phaseDays(index: number): string {
  const width = SYNODIC_DAYS / 8;
  const from = Math.round(((index - 0.5) * width + SYNODIC_DAYS) % SYNODIC_DAYS);
  const to = Math.round((index + 0.5) * width);
  return index === 0 ? `Days ${from}–${to} (around day 0)` : `Days ${from}–${to}`;
}

export const FULL_ALMANAC: AlmanacPhaseEntry[] = [
  {
    phase: "new", label: "New Moon", emoji: "🌑", daysInCycle: phaseDays(0),
    energy: "Plant seeds of intention. This is the most powerful time for setting new goals, starting fresh, and dreaming into existence.",
    almanac: {
      gardening: "The best time to plant above-ground crops with seeds that produce their yield outside the fruit — lettuce, spinach, celery, grains. The gravitational pull draws water up, encouraging strong leaf growth.",
      bestFor: ["planting leafy greens", "sowing seeds", "starting new garden beds", "grafting"],
      avoid: ["harvesting for storage", "cutting timber", "pruning"],
      weatherLore: "A new moon with a clear sky often means fair weather ahead. If the new moon holds rain, expect wet for the next cycle.",
      folkWisdom: "\"Plant by the new moon, harvest by the full.\" Farmers across cultures have sown seeds at this time for millennia. The Farmer's Almanac calls these the best planting days.",
      rituals: [
        { name: "New Moon Intention Setting", description: "Write down 3–5 intentions for this lunar cycle. Be specific — not 'be healthier' but 'walk 20 minutes every morning.' Place the list somewhere you'll see it daily." },
        { name: "Dark Moon Bath", description: "Bathe by candlelight with salt (sea salt or epsom). The darkness mirrors the moon — let the water dissolve what you're leaving behind. Drain the tub and visualize it going with the water." },
        { name: "Seed Planting Ceremony", description: "Plant a physical seed (herb, flower, anything) while naming your intention aloud. As the plant grows through the cycle, your intention takes root." },
        { name: "Black Candle Meditation", description: "Light a black candle (for new beginnings/void energy). Sit in silence for 5–10 minutes. Focus on the space between — the pause before the next breath." },
      ],
      lifeTips: [
        { category: "Baby & Kids", icon: "👶", tip: "Best time to start potty training — new habits take root under the new moon. Children tend to sleep deeper around the new moon." },
        { category: "Hair & Beauty", icon: "💇", tip: "Cut hair now if you want it to grow back faster and thicker. The waxing energy ahead will encourage strong growth. Good time to start a new skincare routine." },
        { category: "Rest & Body", icon: "🌿", tip: "Almanac tradition treats the new moon as a beginning — a natural moment to notice which small habit you'd like to start. Gentle beats ambitious." },
        { category: "Home", icon: "🏠", tip: "Start renovations, paint rooms, move into a new home. Begin deep cleaning projects. Set mouse traps — they're most effective during the new moon." },
        { category: "Relationships", icon: "💕", tip: "Ask someone out, have the DTR talk, propose. New moon energy supports new chapters in relationships. Also a good time to set boundaries — new rules for a new cycle." },
        { category: "Cooking & Preserving", icon: "🫙", tip: "Start ferments and sourdough starters — the rising energy helps cultures grow. Bake bread (the yeast rises better). Not ideal for canning or preserving." },
        { category: "Fishing & Outdoors", icon: "🎣", tip: "Fishing is slower around new and full moons in traditional almanac wisdom. Fish feed less. Better to prep gear and plan your next trip." },
      ],
    },
  },
  {
    phase: "waxing-crescent", label: "Waxing Crescent", emoji: "🌒", daysInCycle: phaseDays(1),
    energy: "Take the first small step. Your intentions from the new moon need action now — even tiny ones count.",
    almanac: {
      gardening: "Strong leaf growth continues. Good for planting above-ground annuals, especially those with outside seeds. The increasing moonlight stimulates growth.",
      bestFor: ["planting annuals", "transplanting seedlings", "watering deeply", "fertilizing"],
      avoid: ["pruning to slow growth", "harvesting root vegetables"],
      weatherLore: "If the crescent moon holds water (tilted so it could be a cup), dry weather follows. If it spills (tilted forward), expect rain.",
      folkWisdom: "\"When the moon is young, the sap runs up.\" European farming tradition holds that rising sap makes this ideal for anything you want to grow upward.",
      rituals: [
        { name: "First Action Step", description: "Take one concrete action toward your new moon intention today. Send the email, make the call, buy the supplies. The crescent rewards movement, not perfection." },
        { name: "Courage Journaling", description: "Write about what scares you about your intention. Name the fear, then write one reason you're doing it anyway. Fold the paper and keep it until the full moon." },
        { name: "Crescent Moon Walk", description: "Walk outside at dusk and find the crescent moon. Stand facing it for a few breaths. Ask: what small thing can I do tomorrow to keep this growing?" },
      ],
      lifeTips: [
        { category: "Baby & Kids", icon: "👶", tip: "Good days for introducing new skills — stacking blocks, first words, potty training if you started at the new moon. Momentum is building. Kids may be more curious and willing to try new things." },
        { category: "Hair & Beauty", icon: "💇", tip: "Hair grows back quickly if cut now. Great time for coloring — it absorbs better with the rising energy. Start new beauty routines. Nails grow faster too." },
        { category: "Rest & Body", icon: "🌿", tip: "Folk tradition says what you begin under a waxing crescent keeps growing. Notice whether the new habit from the new moon is still with you." },
        { category: "Home", icon: "🏠", tip: "Build, add, and expand. Good time for additions, new furniture, or organizing systems you want to grow into. Plant indoor herbs." },
        { category: "Relationships", icon: "💕", tip: "Good time for second and third dates. Connections planted at the new moon are beginning to take shape. Send the follow-up text." },
        { category: "Cooking & Preserving", icon: "🫙", tip: "Ferments are bubbling. Feed your sourdough starter. Good for making stocks and broths — flavors develop with the rising energy." },
        { category: "Fishing & Outdoors", icon: "🎣", tip: "Fish begin feeding more actively as the moon waxes. Good for freshwater fishing, especially in the morning hours." },
      ],
    },
  },
  {
    phase: "first-quarter", label: "First Quarter", emoji: "🌓", daysInCycle: phaseDays(2),
    energy: "Make decisions and push through resistance. Challenges that arise are testing your commitment to what you started.",
    almanac: {
      gardening: "The increasing light and strong gravitational pull make this the best time for planting above-ground crops that have seeds inside the fruit — tomatoes, peppers, squash, beans.",
      bestFor: ["planting fruiting crops", "mowing to encourage growth", "laying sod", "trimming to encourage growth"],
      avoid: ["planting root crops", "canning or preserving"],
      weatherLore: "A first quarter moon rising at noon often brings afternoon storms. Clear skies at the quarter moon suggest a settled week ahead.",
      folkWisdom: "\"Quarter moon, quarter turn\" — many traditions see this as a decision point. Cherokee planting calendars favor this phase for corn and beans.",
      rituals: [
        { name: "Obstacle Burning", description: "Write down the biggest thing standing between you and your intention. Burn the paper safely (candle flame, fireproof dish). Watch it turn to ash — the obstacle is acknowledged and released." },
        { name: "Commitment Check-In", description: "Revisit your new moon intentions. Which ones still feel alive? Double down on those. Let go of any that no longer resonate — without guilt." },
        { name: "Red Candle Power Ritual", description: "Light a red candle for courage and action. Hold a stone or crystal in your hand. State aloud what you're committed to. Keep the stone in your pocket as a reminder." },
      ],
      lifeTips: [
        { category: "Baby & Kids", icon: "👶", tip: "Toddlers may be extra strong-willed — the quarter moon brings a \"push\" energy. Don't start battles you can't win. Channel their determination into challenges: obstacle courses, new puzzles." },
        { category: "Hair & Beauty", icon: "💇", tip: "Best days for perms, chemical treatments, and anything you want to hold shape. Hair is strong and resilient right now." },
        { category: "Rest & Body", icon: "🌿", tip: "Old almanacs call the first quarter a strong, pushing time. Some people like it for a harder workout; listen to what your body says." },
        { category: "Home", icon: "🏠", tip: "Make decisions about the house you've been putting off. This phase rewards commitment. Good for settling on the paint color or the layout you keep circling." },
        { category: "Relationships", icon: "💕", tip: "Challenges may surface in relationships. Don't avoid them — the quarter moon rewards honesty. If it survives this phase, it's real." },
        { category: "Cooking & Preserving", icon: "🫙", tip: "Good for baking pies and anything with fruit fillings — the fruiting energy of this phase extends to the kitchen. Make jams (but don't can them yet)." },
        { category: "Fishing & Outdoors", icon: "🎣", tip: "Great fishing days. Fish are actively feeding. Best results fishing at dawn and dusk when the tides are shifting." },
      ],
    },
  },
  {
    phase: "waxing-gibbous", label: "Waxing Gibbous", emoji: "🌔", daysInCycle: phaseDays(3),
    energy: "Fine-tune and adjust. You can see what's working and what isn't. Edit, revise, and prepare for the culmination.",
    almanac: {
      gardening: "Moonlight is strong and sap is high. Good for transplanting and encouraging established plants. Not ideal for starting new plantings.",
      bestFor: ["transplanting", "applying mulch", "building compost", "watering established plants"],
      avoid: ["starting new seeds", "harvesting for long storage"],
      weatherLore: "The gibbous moon often brings clear, bright nights. Old sailors called this \"lantern weather\" — good for night sailing and night fishing.",
      folkWisdom: "\"Gibbous means almost — and almost is a powerful place to be.\" Japanese farming tradition uses this phase for tending and nurturing crops already in the ground.",
      rituals: [
        { name: "Refinement Journaling", description: "Write about what's working and what needs adjusting in your life right now. The gibbous moon is an editor, not a creator — revise, don't restart." },
        { name: "Gratitude Offering", description: "Place something beautiful on your altar or windowsill — a flower, a stone, a piece of fruit. Thank the process for what it's already bringing, even before it's complete." },
        { name: "Almost-Full Meditation", description: "Sit with a single candle. Breathe and visualize your intention at 80% complete. Feel the anticipation. Trust that the last 20% is coming." },
      ],
      lifeTips: [
        { category: "Baby & Kids", icon: "👶", tip: "Review what's working in your routines. Adjust nap times, feeding schedules, or bedtime routines — the gibbous phase rewards fine-tuning over starting new. Babies may be extra alert." },
        { category: "Hair & Beauty", icon: "💇", tip: "Touch-ups, trims, and maintenance. Not the best for dramatic changes — save those for new or full moon. Good for deep conditioning treatments and masks." },
        { category: "Rest & Body", icon: "🌿", tip: "The almost-full moon is traditionally a time to refine. Notice what is working in your routines and what feels like effort for its own sake." },
        { category: "Home", icon: "🏠", tip: "Finish projects, patch holes, touch up paint. Tighten loose handles. Fix the squeaky door. This is the handyman phase — maintenance over renovation." },
        { category: "Relationships", icon: "💕", tip: "Check in with your people. How are things actually going? The almost-full moon illuminates what you've been ignoring. Address small issues before they become big ones." },
        { category: "Cooking & Preserving", icon: "🫙", tip: "Good for slow-cooking and developing flavors over time. Stews, braises, and curries hit different during this phase. Let things simmer." },
        { category: "Fishing & Outdoors", icon: "🎣", tip: "Night fishing is excellent — the bright gibbous moon illuminates the water and fish are active at night." },
      ],
    },
  },
  {
    phase: "full", label: "Full Moon", emoji: "🌕", daysInCycle: phaseDays(4),
    energy: "Celebrate, release, and let go. What no longer serves you becomes obvious under the full moon's light.",
    almanac: {
      gardening: "Root crops thrive now — the full moon's gravity pulls moisture down into the soil. Plant carrots, beets, potatoes, turnips, and onions. Also the best time for harvesting above-ground crops at peak ripeness.",
      bestFor: ["planting root vegetables", "harvesting above-ground crops", "picking medicinal herbs", "setting fence posts"],
      avoid: ["pruning", "transplanting", "starting leafy crops"],
      weatherLore: "A full moon often brings a brief dip in temperature. If there's a ring around the full moon, rain or snow is coming within three days — the wider the ring, the sooner the storm.",
      folkWisdom: "\"Full moon, full plate.\" The Farmer's Almanac tradition of naming each full moon (Wolf, Snow, Worm, Pink, Flower...) comes from tracking seasonal changes. Indigenous peoples across continents used full moon names as a living calendar.",
      rituals: [
        { name: "Full Moon Release", description: "Write down everything you want to release — fears, habits, resentments, stories you keep telling yourself. Read the list aloud under the moon (or by a window). Burn or tear the paper." },
        { name: "Moon Water", description: "Fill a glass jar with water and set it on a windowsill or outside under the full moon overnight. Use the charged water for tea, watering plants, or cleaning your space." },
        { name: "Mirror Ritual", description: "Look at yourself in a mirror by candlelight. Say aloud three things you're proud of from this cycle. The full moon illuminates — let it illuminate what you've done right." },
        { name: "Forgiveness Practice", description: "Name someone (including yourself) you need to forgive. You don't have to feel it fully yet — just say it: 'I am willing to forgive.' The full moon makes space for release." },
      ],
      lifeTips: [
        { category: "Baby & Kids", icon: "👶", tip: "Babies and toddlers may sleep less — many parents notice restlessness around the full moon. Keep bedtime routines extra consistent. Good time for potty training breakthroughs — what's \"full\" often empties." },
        { category: "Hair & Beauty", icon: "💇", tip: "Cut hair now if you want it to stay the same length longer — the full moon slows regrowth. Best time for haircuts if you like your current length. Skin may be more sensitive — go gentle on treatments." },
        { category: "Rest & Body", icon: "🌿", tip: "Many people say they sleep more lightly around the full moon. Tradition calls it a time when feelings run high — a good night for an early, quiet bedtime." },
        { category: "Home", icon: "🏠", tip: "Harvest your herbs and dry them. Make tinctures and infusions — the full moon charges water and plants with peak energy. Set out water in moonlight (\"moon water\") for cleaning and cooking. Deep clean your fridge — toss what's expired." },
        { category: "Relationships", icon: "💕", tip: "Emotions are amplified. Everything you've been feeling comes to the surface. Good for breakthroughs, hard conversations, and cathartic honesty. Not ideal for making big relationship decisions — wait a few days." },
        { category: "Cooking & Preserving", icon: "🫙", tip: "Peak flavor for harvesting herbs and vegetables. Cook a feast. Bake with full moon energy. Traditional almanac says: make wine and beer during the full moon — fermentation is strongest." },
        { category: "Fishing & Outdoors", icon: "🎣", tip: "Full moon fishing is hit-or-miss — some swear by it, others say fish feed all night and aren't hungry by day. Try night fishing with the moonlight." },
      ],
    },
  },
  {
    phase: "waning-gibbous", label: "Waning Gibbous", emoji: "🌖", daysInCycle: phaseDays(5),
    energy: "Share what you've learned and give back. This is a generous, reflective phase for teaching and mentoring.",
    almanac: {
      gardening: "The decreasing light signals plants to focus energy on roots. Good for planting root crops, bulbs, and perennials. The best phase for harvesting and preserving.",
      bestFor: ["planting bulbs and perennials", "harvesting for storage", "canning and preserving", "drying herbs"],
      avoid: ["planting annuals", "sowing seeds for leafy crops"],
      weatherLore: "Waning light often brings calmer weather. Old English weather lore says: \"After the full, the storms will lull.\"",
      folkWisdom: "\"Share the harvest with your neighbor\" — many agricultural communities timed their communal feasts and food preservation to this phase, when crops are at peak and the work of gathering brings people together.",
      rituals: [
        { name: "Gratitude Harvest", description: "Write a list of everything that came to fruition this cycle — big or small. Read it aloud. Let yourself feel the fullness before the release continues." },
        { name: "Sharing Ritual", description: "Give something away — a meal, a book, advice, your time. The waning gibbous is the teacher phase. What you've learned is meant to be shared." },
        { name: "Integration Journaling", description: "What did the full moon reveal? Write about it without judgment. What surprised you? What became obvious? Let the insight settle." },
      ],
      lifeTips: [
        { category: "Baby & Kids", icon: "👶", tip: "Good phase for breaking bad habits — thumb-sucking, pacifier dependence, night waking. The waning energy supports letting go. Read extra bedtime stories — the sharing energy is strong." },
        { category: "Hair & Beauty", icon: "💇", tip: "Hair removal lasts longer in the waning moon — wax, shave, or laser now for slower regrowth. Good time for facials." },
        { category: "Rest & Body", icon: "🌿", tip: "The waning moon is traditionally associated with release. A good evening for a long bath, a stretch, or simply doing less." },
        { category: "Home", icon: "🏠", tip: "Preserve, can, and stock up. Good time for canning fruits, making preserves, and stocking the pantry. Organize closets — the energy supports sorting and storing." },
        { category: "Relationships", icon: "💕", tip: "Share what the full moon revealed. Have the follow-up conversation. This is the integration phase — process what came up and teach each other what you learned." },
        { category: "Cooking & Preserving", icon: "🫙", tip: "Best canning and preserving days of the lunar cycle. Make pickles, jams, and ferments meant for long storage. Dry herbs and flowers. Smoke meats." },
        { category: "Fishing & Outdoors", icon: "🎣", tip: "Excellent fishing. Fish are hungry and active. The decreasing moonlight brings them closer to the surface during the day." },
      ],
    },
  },
  {
    phase: "last-quarter", label: "Last Quarter", emoji: "🌗", daysInCycle: phaseDays(6),
    energy: "Let go of grudges, habits, and clutter. Clear out what's blocking you before the next cycle begins.",
    almanac: {
      gardening: "A rest phase for the garden. Reduced moonlight and gravitational pull make this ideal for maintenance tasks rather than planting. Focus on pulling weeds, turning compost, and clearing spent crops.",
      bestFor: ["weeding", "turning soil", "pest control", "pruning to reduce growth", "cutting timber"],
      avoid: ["planting anything new", "transplanting"],
      weatherLore: "The last quarter moon rising at midnight often signals a weather change within 48 hours. Watch for shifting winds.",
      folkWisdom: "\"Cut in the wane, and the wood won't stain.\" Timber cut in the waning moon has less sap and is more resistant to rot — a practice documented from Roman times through Appalachian folk tradition.",
      rituals: [
        { name: "Cord Cutting", description: "Visualize an energetic cord connecting you to a habit, person, or pattern you're releasing. Imagine cutting it with intention — not in anger, but in clarity. Breathe out as you let it go." },
        { name: "Banishing Candle", description: "Light a white or black candle. Write what you're banishing on a piece of paper. Hold it to the flame and let it burn in a fireproof dish. Snuff (don't blow) the candle when done." },
        { name: "Closet Purge Ritual", description: "Go through one drawer, shelf, or box. For each item: does this belong in the next cycle of my life? If not, thank it and let it go. Physical clearing mirrors emotional clearing." },
      ],
      lifeTips: [
        { category: "Baby & Kids", icon: "👶", tip: "Good time to end sleep associations, stop co-sleeping, or drop a feeding. The releasing energy supports \"goodbye\" transitions. Let kids practice independence — they may surprise you." },
        { category: "Hair & Beauty", icon: "💇", tip: "Best time to wax or do laser hair removal — slowest regrowth. Cut hair only if you want it to grow back very slowly." },
        { category: "Rest & Body", icon: "🌿", tip: "Tradition links the last quarter with letting go. If there's a habit you've been meaning to set down, this is the phase the old almanacs associate with it." },
        { category: "Home", icon: "🏠", tip: "Demolition and tear-down energy. Rip out old carpet, tear down wallpaper, remove dead trees. Pest control is most effective now. Clear gutters and drains." },
        { category: "Relationships", icon: "💕", tip: "End what needs ending. Break up, set firm boundaries, or release resentments you've been carrying. Do it with love but do it clearly." },
        { category: "Cooking & Preserving", icon: "🫙", tip: "Good for making beef jerky and dried foods. The drying, contracting energy preserves well. Clean out the fridge and pantry — toss what's past its prime." },
        { category: "Fishing & Outdoors", icon: "🎣", tip: "Fishing slows as the moon wanes toward darkness. Good for catch-and-release practice. Better days for hunting than fishing." },
      ],
    },
  },
  {
    phase: "waning-crescent", label: "Waning Crescent", emoji: "🌘", daysInCycle: phaseDays(7),
    energy: "Rest, reflect, and surrender. The old cycle is ending. Sleep more, journal, dream. The new moon is coming.",
    almanac: {
      gardening: "The garden rests. This is a fallow phase — don't plant, don't push. Clean tools, plan your next cycle's garden, and let the soil be.",
      bestFor: ["cleaning garden tools", "planning next plantings", "composting", "soil testing", "resting"],
      avoid: ["planting anything", "transplanting", "harvesting for flavor"],
      weatherLore: "The thin crescent before new moon often brings the quietest weather of the cycle. Calm before renewal.",
      folkWisdom: "\"Rest when the moon rests.\" Across cultures — from Andean to Appalachian — the dark of the moon is a time for stillness. The land is recharging. So should you.",
      rituals: [
        { name: "Dream Journaling", description: "Keep a notebook by your bed. Write your dreams as soon as you wake — even fragments. The balsamic moon (waning crescent) is the most psychically active phase. Your subconscious is speaking." },
        { name: "Surrender Bath", description: "Draw a warm bath with lavender or chamomile. No phone. No music. Just you and the water. Let the dark moon dissolve whatever you're still holding. This is not laziness — it's sacred rest." },
        { name: "Cycle Review", description: "Look back at the full lunar cycle. What did you set in motion at the new moon? What grew? What was released? Write a few sentences of reflection. Then close the notebook — the cycle is complete." },
        { name: "Stillness Practice", description: "Sit in a dark or dimly lit room for 10 minutes. No intention, no mantra, no visualization. Just be. The waning crescent asks nothing of you except presence." },
      ],
      lifeTips: [
        { category: "Baby & Kids", icon: "👶", tip: "Babies sleep the deepest in the dark moon phase. Let kids rest, daydream, and play without structure." },
        { category: "Hair & Beauty", icon: "💇", tip: "Avoid haircuts unless you want very slow regrowth. Good for deep rest and recovery treatments — overnight masks, oil treatments, and long baths. Your body is in restore mode." },
        { category: "Rest & Body", icon: "🌿", tip: "The dark of the moon is the almanac's rest phase. Sleep in if you can, go easy at the gym, and give yourself room to process." },
        { category: "Home", icon: "🏠", tip: "Don't start projects. Finish loose ends, put tools away, and prepare your space for the new cycle. Clean and organize — not from anxiety, but from completion. Sage or open windows to clear stale energy." },
        { category: "Relationships", icon: "💕", tip: "Be gentle with yourself and others. Low energy is not low love. Spend quiet time together. Don't force important conversations — they'll land better after the new moon." },
        { category: "Cooking & Preserving", icon: "🫙", tip: "Simple, nourishing food. Soups, broths, warm drinks. Don't attempt elaborate recipes — keep it gentle. Use up what's in the fridge rather than buying new." },
        { category: "Fishing & Outdoors", icon: "🎣", tip: "Quietest fishing of the cycle. Good for solitary nature walks, birdwatching, and being outside without an agenda." },
      ],
    },
  },
];

// ─── MOON PHASE CALCULATION ──────────────────────────────────────────────────
// Uses astronomy-engine for accurate phase fraction and illumination

export function getMoonPhase(date: Date): MoonPhaseInfo {
  // Use astronomy-engine for accurate phase fraction and illumination
  const fraction = getMoonPhaseFraction(date);
  const illumination = getMoonIllumination(date);

  // Determine phase key based on fraction, then pull almanac from FULL_ALMANAC
  type PhaseKey = MoonPhaseInfo["phase"];
  let phaseKey: PhaseKey;
  let label: string;
  let emoji: string;
  let description: string;
  let energy: string;

  // 8 equal phases, each spanning 1/8 of the cycle
  if (fraction < 0.0625)       { phaseKey = "new"; label = "New Moon"; emoji = "🌑"; description = "The sky is dark and the moon is hidden. A blank page."; energy = "Plant seeds of intention. This is the most powerful time for setting new goals, starting fresh, and dreaming into existence."; }
  else if (fraction < 0.1875)  { phaseKey = "waxing-crescent"; label = "Waxing Crescent"; emoji = "🌒"; description = "A sliver of light appears. Momentum is building."; energy = "Take the first small step. Your intentions from the new moon need action now — even tiny ones count."; }
  else if (fraction < 0.3125)  { phaseKey = "first-quarter"; label = "First Quarter"; emoji = "🌓"; description = "Half-lit, half-dark. A crossroads of commitment."; energy = "Make decisions and push through resistance. Challenges that arise are testing your commitment to what you started."; }
  else if (fraction < 0.4375)  { phaseKey = "waxing-gibbous"; label = "Waxing Gibbous"; emoji = "🌔"; description = "Almost full. Refinement and adjustment."; energy = "Fine-tune and adjust. You can see what's working and what isn't. Edit, revise, and prepare for the culmination."; }
  else if (fraction < 0.5625)  { phaseKey = "full"; label = "Full Moon"; emoji = "🌕"; description = "Maximum illumination. Everything is visible."; energy = "Celebrate, release, and let go. What no longer serves you becomes obvious under the full moon's light. Gratitude and release rituals are powerful."; }
  else if (fraction < 0.6875)  { phaseKey = "waning-gibbous"; label = "Waning Gibbous"; emoji = "🌖"; description = "The light begins to retreat. Gratitude and sharing."; energy = "Share what you've learned and give back. This is a generous, reflective phase for teaching and mentoring."; }
  else if (fraction < 0.8125)  { phaseKey = "last-quarter"; label = "Last Quarter"; emoji = "🌗"; description = "Half-lit again. Release and forgiveness."; energy = "Let go of grudges, habits, and clutter. Clear out what's blocking you before the next cycle begins."; }
  else if (fraction < 0.9375)  { phaseKey = "waning-crescent"; label = "Waning Crescent"; emoji = "🌘"; description = "The final sliver. Rest before renewal."; energy = "Rest, reflect, and surrender. The old cycle is ending. Sleep more, journal, dream. The new moon is coming."; }
  else                         { phaseKey = "new"; label = "New Moon"; emoji = "🌑"; description = "The sky is dark and the moon is hidden. A blank page."; energy = "Plant seeds of intention. This is the most powerful time for setting new goals, starting fresh, and dreaming into existence."; }

  const almanacEntry = FULL_ALMANAC.find(a => a.phase === phaseKey)!;

  return { phase: phaseKey, label, illumination, emoji, description, energy, almanac: almanacEntry.almanac };
}

/**
 * Get the image path for a moon phase.
 * Maps phase keys from getMoonPhase() to the uploaded images in /moons/.
 */
const MOON_PHASE_IMAGES: Record<string, string> = {
  "new": "/moons/new-moon.webp",
  "waxing-crescent": "/moons/waxing-crescent.webp",
  "first-quarter": "/moons/first-quarter.webp",
  "waxing-gibbous": "/moons/waxing-gibbous.webp",
  "full": "/moons/full-moon.webp",
  "waning-gibbous": "/moons/waning-gibbous.webp",
  "last-quarter": "/moons/third-quarter.webp",
  "waning-crescent": "/moons/waning-crescent.webp",
};

export function getMoonPhaseImage(phase: string): string {
  return MOON_PHASE_IMAGES[phase] || "/moons/full-moon.webp";
}

// Nakshatra from real Moon longitude (astronomy-engine) converted to sidereal
// with the Lahiri ayanamsa FOR THIS DATE (it drifts ~50" a year — never a constant).
export function getCurrentNakshatra(date: Date, ayanamsa: AyanamsaName = "lahiri"): NakshatraInfo {
  const siderealLon = toSidereal(getMoonLongitude(date), jdFromDate(date), ayanamsa);
  // Each nakshatra spans 13°20' = 13.3333°
  const nakshatraIndex = Math.floor(siderealLon / (360 / 27)) % 27;
  return NAKSHATRAS[nakshatraIndex];
}

// ─── CURRENT ZODIAC SEASON ────────────────────────────────────────────────────

export function getCurrentZodiacSeason(date: Date): ZodiacSeason {
  // Use astronomy-engine for accurate sun sign (handles ingress date shifts)
  const sunSign = getCurrentSunSign(date);
  const match = ZODIAC_SEASONS.find(s => s.sign === sunSign.full);
  if (match) return match;
  // Fallback to abbreviation match
  const abbMatch = ZODIAC_SEASONS.find(s => s.sign.slice(0, 3).toLowerCase() === sunSign.abbr.toLowerCase());
  return abbMatch || ZODIAC_SEASONS[0];
}

// ─── FIXED & MOVABLE CULTURAL DATES ──────────────────────────────────────────
// Returns events within a date range for the given year

export function getCelestialEvents(year: number): CelestialEvent[] {
  const events: CelestialEvent[] = [];

  // ── ASTRONOMICAL / WESTERN ──
  // Equinoxes & solstices: the exact instant, read as the reader's calendar day.
  // (They used to be fixed at 20 Mar / 21 Jun / 22 Sep / 21 Dec, which is a day
  // out in many years and in many places.)
  const seasons = getSeasonDates(year);
  const springEq = calendarDayIn(seasons.springEquinox);
  const summerSol = calendarDayIn(seasons.summerSolstice);
  const autumnEq = calendarDayIn(seasons.autumnEquinox);
  const winterSol = calendarDayIn(seasons.winterSolstice);
  events.push(
    { id: `spring-eq-${year}`, name: "Spring Equinox", date: springEq, tradition: "astronomical", category: "solar", description: "Day and night are equal. Light begins to overtake darkness. Celebrated as Ostara (Celtic), Nowruz (Persian), Holi (Hindu), and the astrological new year.", ritualHint: "Balance ritual — equal parts letting go and welcoming in", element: "air" },
    { id: `summer-sol-${year}`, name: "Summer Solstice", date: summerSol, tradition: "astronomical", category: "solar", description: "The longest day. Peak of solar energy. Celebrated as Litha (Celtic), Midsommar (Nordic), and honored in countless indigenous sun ceremonies.", ritualHint: "Celebrate your fullest expression. Soak in sunlight and joy.", element: "fire" },
    { id: `autumn-eq-${year}`, name: "Autumn Equinox", date: autumnEq, tradition: "astronomical", category: "solar", description: "Balance returns. Day equals night again before darkness grows. Celebrated as Mabon (Celtic), Chuseok (Korean harvest), and the start of many harvest festivals worldwide.", ritualHint: "Gratitude harvest — name everything that grew this year", element: "earth" },
    { id: `winter-sol-${year}`, name: "Winter Solstice", date: winterSol, tradition: "astronomical", category: "solar", description: "The longest night. The turning point where light returns. Celebrated as Yule (Celtic/Norse), Dongzhi (Chinese), Inti Raymi (Incan), and Shab-e Yalda (Persian).", ritualHint: "Light a candle in the darkness. What inner light carries you through?", element: "water" },
  );

  // ── CELTIC WHEEL OF THE YEAR ──
  events.push(
    { id: `imbolc-${year}`, name: "Imbolc", date: new Date(year, 1, 1), tradition: "celtic", category: "festival", description: "First stirrings of spring. Brigid's day — the goddess of healing, poetry, and smithcraft. The earth is waking up beneath the frost.", ritualHint: "Light candles and clean your space. Spring cleaning for the soul.", element: "fire" },
    { id: `beltane-${year}`, name: "Beltane", date: new Date(year, 4, 1), tradition: "celtic", category: "festival", description: "The fire festival of fertility and passion. The veil between worlds is thin. Life force is at its peak.", ritualHint: "Spend time in nature. Plant something. Celebrate what makes you feel alive.", element: "fire" },
    { id: `lughnasadh-${year}`, name: "Lughnasadh", date: new Date(year, 7, 1), tradition: "celtic", category: "festival", description: "First harvest festival. Named for Lugh, god of skill and craft. Celebrate the fruits of your labor.", ritualHint: "Bake bread or share a meal. Acknowledge what your efforts have produced.", element: "earth" },
    { id: `samhain-${year}`, name: "Samhain", date: new Date(year, 9, 31), tradition: "celtic", category: "festival", description: "The Celtic new year. The veil between living and dead is thinnest. Ancestor energy is strong. This is the root of Halloween.", ritualHint: "Set a place at the table for those who've passed. Light a candle for your ancestors.", element: "spirit" },
  );

  // Festivals whose date comes from the verified table: pushed only for the
  // years the table covers.
  const pushKnown = (...xs: (Omit<CelestialEvent, "date"> & { date: Date | null })[]) => {
    for (const x of xs) if (x.date) events.push({ ...x, date: x.date });
  };

  // ── VEDIC / HINDU ──
  // Makar Sankranti is solar (sidereal Sun into Capricorn) and is computed.
  // The rest follow the tithi calendar, where the observed day depends on which
  // tithi is current at sunrise or in the evening in India — not something a
  // new-moon search gets right — so they come from OBSERVED_DATES.
  pushKnown(
    { id: `makar-sankranti-${year}`, name: "Makar Sankranti", date: makarSankranti(year), tradition: "vedic", category: "solar", description: "The sun enters Capricorn (Makara). One of the few Hindu festivals tied to the solar calendar. Marks the end of winter solstice and the beginning of longer days. Celebrated with kite flying and bonfires.", ritualHint: "Let something old fly away — write it on paper and release it. Face the sun.", element: "fire" },
    { id: `maha-shivaratri-${year}`, name: "Maha Shivaratri", date: observed("maha-shivaratri", year), tradition: "vedic", category: "festival", description: "The great night of Shiva. A night of deep meditation and stillness. The darkest night before the new moon in Phalguna. Shiva represents the cosmic destroyer — making space for what's new.", ritualHint: "Stay up late in meditation or quiet reflection. Welcome the void.", element: "spirit" },
    { id: `holi-${year}`, name: "Holi", date: observed("holi", year), tradition: "vedic", category: "festival", description: "Festival of colors and the triumph of good over evil. Celebrates the arrival of spring, forgiveness, and new beginnings. Holika's bonfire burns away the old.", ritualHint: "Forgive someone (even yourself). Wear something colorful. Start fresh.", element: "fire" },
    { id: `navratri-spring-${year}`, name: "Chaitra Navratri", date: observed("navratri-spring", year), tradition: "vedic", category: "festival", description: "Nine nights honoring the divine feminine in all her forms — from fierce Durga to gentle Saraswati. Each night invokes a different aspect of the Goddess. Coincides with the Hindu new year.", ritualHint: "Dedicate each day to a different feminine quality: courage, wisdom, creativity, compassion, strength, beauty, knowledge, abundance, grace.", element: "spirit" },
    { id: `guru-purnima-${year}`, name: "Guru Purnima", date: observed("guru-purnima", year), tradition: "vedic", category: "festival", description: "Full moon honoring teachers and gurus. In Vedic tradition, knowledge passed from teacher to student is sacred. This day honors everyone who has guided your path.", ritualHint: "Thank a teacher, mentor, or guide in your life. Reflect on what you've learned from others.", element: "air" },
    { id: `navratri-autumn-${year}`, name: "Sharad Navratri", date: observed("navratri-autumn", year), tradition: "vedic", category: "festival", description: "The autumn nine nights. The most widely celebrated Navratri. Durga battles the buffalo demon Mahishasura — representing the triumph of consciousness over ignorance.", ritualHint: "Nine days of decluttering — physical, mental, emotional. One layer each day.", element: "spirit" },
    { id: `diwali-${year}`, name: "Diwali", date: observed("diwali", year), tradition: "vedic", category: "festival", description: "Festival of lights. Celebrates the victory of light over darkness, knowledge over ignorance. Connected to Lakshmi (abundance), Ram's return home, and the new moon of Kartik.", ritualHint: "Light candles or diyas in every room. Deep clean your home. Set intentions for the year ahead.", element: "fire" },
  );

  // ── CHINESE / EAST ASIAN ──
  // Computed in Beijing time, which is what the Chinese calendar is reckoned
  // in: solar terms are Sun longitudes, and lunar months begin on the Beijing
  // date of the new moon. (Vietnam reckons in UTC+7 and occasionally differs
  // by a day.)
  events.push(
    { id: `lunar-ny-${year}`, name: "Lunar New Year", date: lunarNewYear(year), tradition: "chinese", category: "festival", description: "The most important festival in Chinese, Korean, Vietnamese, and many East Asian cultures. Based on the lunisolar calendar, it marks the new moon that opens the first lunar month — usually the second new moon after the winter solstice. A time of family reunion, feasting, and fresh starts.", ritualHint: "Clean your entire space before the day. Wear something new. Set 3 intentions for the year.", element: "fire" },
    { id: `qingming-${year}`, name: "Qingming (Tomb Sweeping Day)", date: solarTermDay(15, year), tradition: "chinese", category: "festival", description: "A day to honor and remember ancestors. Families visit graves, clean tombs, and make offerings. In Chinese cosmology, maintaining connection with ancestors ensures harmony.", ritualHint: "Visit a place that connects you to your family history. Cook a family recipe. Tell a story about someone who came before you.", element: "earth" },
    { id: `mid-autumn-${year}`, name: "Mid-Autumn Festival", date: midAutumn(year), tradition: "chinese", category: "moon", description: "The full moon of the eighth lunar month — the most beautiful moon of the year in Chinese tradition. Celebrates reunion, gratitude, and the harvest. Connected to the legend of Chang'e, the moon goddess.", ritualHint: "Share food under the moonlight. Call someone you miss. Make moon-shaped offerings.", element: "water" },
    { id: `dongzhi-${year}`, name: "Dongzhi (Winter Solstice Festival)", date: solarTermDay(270, year), tradition: "chinese", category: "solar", description: "In Chinese philosophy, this is when yin energy peaks and yang begins to return. A celebration of the return of light and longer days. Families gather to make tangyuan (sweet rice balls symbolizing reunion).", ritualHint: "Make or eat something round — symbolizing wholeness and coming full circle.", element: "water" },
  );

  // ── ISLAMIC ──
  // Set by moon sighting, so they can differ by a day between countries. The
  // table holds the expected dates; nothing is shown for a year it lacks.
  pushKnown(
    { id: `ramadan-${year}`, name: "Ramadan Begins", date: observed("ramadan", year), tradition: "islamic", category: "festival", description: "The ninth month of the Islamic calendar. A month of fasting, reflection, and spiritual discipline. From dawn to sunset, Muslims fast — cultivating empathy, gratitude, and self-mastery.", ritualHint: "Try a small personal discipline for one day — an hour of silence, or a screen-free evening. Notice what surfaces when you create space.", element: "spirit" },
    { id: `eid-fitr-${year}`, name: "Eid al-Fitr", date: observed("eid-fitr", year), tradition: "islamic", category: "festival", description: "Festival of breaking the fast. Marks the end of Ramadan with communal prayers, feasting, and charity. A celebration of spiritual accomplishment and generosity.", ritualHint: "Complete something you've been working on and celebrate. Be generous with someone today.", element: "air" },
    { id: `eid-adha-${year}`, name: "Eid al-Adha", date: observed("eid-adha", year), tradition: "islamic", category: "festival", description: "Festival of sacrifice. Honors Abraham's willingness to sacrifice what he valued most. A profound meditation on what we're willing to give up for what matters.", ritualHint: "What are you willing to sacrifice for your deepest values? Make a meaningful offering — time, resources, or ego.", element: "fire" },
  );

  // ── INDIGENOUS & OTHER ──
  events.push(
    { id: `pachamama-${year}`, name: "Pachamama Day", date: new Date(year, 7, 1), tradition: "indigenous", category: "festival", description: "Andean celebration of Mother Earth. In Quechua tradition, August is when Pachamama is hungry and offerings nourish her for the growing season ahead. A time of reciprocity with the earth.", ritualHint: "Go outside barefoot. Offer water or flowers to the earth. Thank the ground that holds you.", element: "earth" },
    { id: `day-of-dead-${year}`, name: "Día de los Muertos", date: new Date(year, 10, 1), endDate: new Date(year, 10, 2), tradition: "indigenous", category: "festival", description: "Mexican tradition blending indigenous Aztec ceremony with Catholic All Saints' Day. The dead return to visit the living. Ofrendas (altars) are built with marigolds, photos, and favorite foods of the departed.", ritualHint: "Build a small altar with photos and objects that remind you of loved ones who've passed. Light a candle for each.", element: "spirit" },
    { id: `winter-count-${year}`, name: "Winter Count Begins", date: new Date(year, 11, 1), tradition: "indigenous", category: "season", description: "In Lakota and other Plains traditions, the winter count (Waniyetu Wowapi) records the year's most significant event through pictographic art. Each year gets one image that captures its essence.", ritualHint: "If this year were one image, what would it be? Draw it, even badly. This is your year's story.", element: "earth" },
  );

  // ── WICCAN / NEO-PAGAN SABBATS (with moon context) ──
  events.push(
    { id: `ostara-${year}`, name: "Ostara", date: springEq, tradition: "pagan", category: "festival", description: "Wiccan name for the Spring Equinox. Balance of light and dark. The goddess returns from winter, and the god grows stronger. A time of renewal and planting.", ritualHint: "Plant seeds (literal or metaphorical). Balance two opposites. Decorate eggs as symbols of new life.", element: "air" },
    { id: `litha-${year}`, name: "Litha (Midsummer)", date: summerSol, tradition: "pagan", category: "festival", description: "Wiccan name for the Summer Solstice. Peak solar power. The god is at full strength. Celebrate your power and fullest expression. Bonfires honor the sun's majesty.", ritualHint: "Jump over a bonfire (real or metaphorical). Dance in full sunlight. Crown yourself with flowers.", element: "fire" },
    { id: `mabon-${year}`, name: "Mabon", date: autumnEq, tradition: "pagan", category: "festival", description: "Wiccan name for the Autumn Equinox. Second harvest festival. Gratitude for abundance. The god enters the underworld as the goddess mourns. Darkness begins to grow.", ritualHint: "Bake bread. Harvest what you've grown this year (literally or creatively). Prepare for the darker half.", element: "earth" },
    { id: `yule-${year}`, name: "Yule (Winter Solstice)", date: winterSol, tradition: "pagan", category: "festival", description: "Wiccan name for the Winter Solstice. The rebirth of the sun god. The darkest night contains the promise of returning light. Fires are lit to encourage the sun's return.", ritualHint: "Light candles in the darkness. Sit in silence. Welcome the inner light that cannot be extinguished.", element: "water" },
  );

  // ── WITCHY & ESOTERIC OBSERVANCES ──
  events.push(
    { id: `festival-brigid-${year}`, name: "Festival of Brigid (Candlemas)", date: new Date(year, 1, 1), tradition: "pagan", category: "festival", description: "Fire goddess Brigid is honored on her sacred day. Also known as Candlemas. Light and warmth return. Brigid inspires healing, poetry, and craft. Sacred wells are visited in Ireland.", ritualHint: "Light a candle for Brigid. Write a poem, song, or prayer. Visit water if possible, or rinse your hands in spring water.", element: "fire" },
    { id: `walpurgis-night-${year}`, name: "Walpurgis Night (Night of the Witches)", date: new Date(year, 3, 30), tradition: "pagan", category: "festival", description: "April 30 — the eve of Beltane. In Germanic tradition, witches gather on Brocken Mountain. A liminal night when the veil is thin and magic is strong. Fire festivals cross into May.", ritualHint: "Burn bay leaves or sage. Write intentions and toss them into a flame. Celebrate your power and wildness.", element: "fire" },
    { id: `lemuria-${year}`, name: "Lemuria (Feast of the Dead)", date: new Date(year, 4, 9), tradition: "pagan", category: "festival", description: "Roman festival (May 9, 11, 13) honoring restless spirits and ancestors. Salt and honey were offerings. A time to acknowledge those who came before and lay them properly to rest. Similar to later Día de los Muertos.", ritualHint: "Leave offerings of honey or grain. Speak the names of your ancestors aloud. Light candles in their honor.", element: "spirit" },
    { id: `hecates-night-${year}`, name: "Hecate's Night (Dark Moon)", date: new Date(year, 10, 16), tradition: "pagan", category: "moon", description: "November 16 (or nearest dark moon). Hecate, goddess of crossroads and the underworld, is honored at the darkest moment. A time for shadow work, divination, and releasing what no longer serves.", ritualHint: "Visit a threshold or crossroads (physically or symbolically). Write what you're releasing and safely burn it. Sit with your shadow.", element: "spirit" },
    { id: `feast-hecate-${year}`, name: "Feast of Hecate", date: new Date(year, 7, 13), tradition: "pagan", category: "festival", description: "August 13 — Hecate, goddess of witchcraft, magic, and the crossroads, is celebrated. In ancient times, food was left at three-way intersections for her and wandering spirits. A powerful day for magic.", ritualHint: "Practice divination or tarot. Leave an offering at a crossroads or on your altar. Meditate on cycles and transitions.", element: "spirit" },
    { id: `festival-diana-${year}`, name: "Festival of Diana", date: new Date(year, 7, 13), tradition: "pagan", category: "festival", description: "August 13 — Diana, Roman goddess of the hunt, the moon, and independence. Sacred to witches as a protector of women and wild things. Bonfires were lit in her honor in ancient Rome.", ritualHint: "Dance or move with wild freedom. Burn candles for Diana. Claim your independence and fierce beauty.", element: "water" },
    { id: `persephone-return-${year}`, name: "Persephone's Return", date: springEq, tradition: "pagan", category: "festival", description: "Spring Equinox — Persephone returns from the underworld, and Demeter's grief becomes joy. Spring returns. Celebrated in ancient Greek Anthesteria and Thesmophoria. The goddess of rebirth and shadow integration.", ritualHint: "Meditate on returning from darkness. Plant seeds in a pot. Welcome yourself back from winter dormancy.", element: "air" },
  );

  // ── EGYPTIAN & GODDESS FESTIVALS ──
  events.push(
    { id: `day-of-isis-${year}`, name: "Day of Isis (Feast of Isis)", date: new Date(year, 2, 5), tradition: "egyptian", category: "festival", description: "March 5 — Isis, the great Egyptian goddess of magic, healing, and motherhood, is honored. Isis gathered the pieces of her beloved Osiris and restored him — a symbol of wholeness and restoration.", ritualHint: "Do magical work for healing. Gather something fragmented and restore it. Honor magic and motherhood.", element: "water" },
    { id: `hathor-festival-${year}`, name: "Festival of Hathor", date: new Date(year, 0, 7), tradition: "egyptian", category: "festival", description: "January 7 (approximate) — Hathor, goddess of love, beauty, music, and joy. Egyptians celebrated with music, dance, and offerings of flowers and honey. A festival of sensuality and happiness.", ritualHint: "Play music and dance. Wear something beautiful. Create or appreciate art. Celebrate joy.", element: "fire" },
  );

  // ── RETROGRADES ──
  // Computed from the station search for whatever year is asked for. These used
  // to be 2026's dates stamped onto `new Date(year, …)`, so every other year
  // showed 2026's periods — including a Venus retrograde that 2027 does not
  // have — with "2026" written in the copy.
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);
  for (const planet of ["Mercury", "Venus", "Mars"] as const) {
    for (const p of retrogradePeriodsBetween(planet, yearStart, yearEnd)) {
      const start = calendarDayIn(p.start);
      const end = calendarDayIn(p.end);
      const span = `${monthDay(start)} – ${monthDay(end)}`;
      const signs = p.startSign === p.endSign ? `in ${p.startSign}` : `from ${p.startSign} back into ${p.endSign}`;
      const copy = RETROGRADE_COPY[planet];
      events.push({
        id: `${planet.toLowerCase()}-retrograde-${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`,
        name: `${planet} Retrograde`,
        date: start,
        endDate: end,
        tradition: "astronomical",
        category: "planetary",
        description: `${span}, ${signs}. ${copy.description}`,
        ritualHint: copy.ritualHint,
        element: copy.element,
      });
    }
  }

  // ── ECLIPSES ──
  // Searched, not typed: type (total, annular, partial, penumbral), sign and
  // day all come from the eclipse itself, read on the reader's calendar.
  for (const e of eclipsesBetween(yearStart, yearEnd)) {
    const day = calendarDayIn(e.at);
    const copy = ECLIPSE_COPY[e.kind];
    events.push({
      id: `${e.kind}-eclipse-${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`,
      name: e.label,
      date: day,
      tradition: "astronomical",
      category: e.kind === "solar" ? "solar" : "moon",
      description: `${monthDay(day)} — ${e.label.toLowerCase()} in ${e.sign}. ${copy.description}`,
      ritualHint: copy.ritualHint,
      element: copy.element,
    });
  }

  // ── CULTURAL ASTROLOGY & NEW YEAR FESTIVALS ──
  pushKnown(
    { id: `nowruz-${year}`, name: "Nowruz (Persian New Year)", date: nowruz(year), tradition: "persian", category: "festival", description: "Ancient Persian spring festival coinciding with the Spring Equinox. Celebrated for over 3,000 years across Persian, Kurdish, Tajik, and Central Asian cultures. A time of renewal, cleansing, and celebrating life's victory over death.", ritualHint: "Wear something new. Clean your entire space. Set intentions for the new year. Light a candle for hope.", element: "fire" },
    { id: `losar-${year}`, name: "Losar (Tibetan New Year)", date: observed("losar", year), tradition: "tibetan", category: "festival", description: "Tibetan Buddhist celebration marking the new year. Celebrated for 15 days with prayer, art, family gatherings, and butter sculptures. A time to purify, decorate with sacred offerings, and welcome new blessings.", ritualHint: "Decorate your space with bright colors and symbols. Gather with community. Eat round foods symbolizing wholeness.", element: "spirit" },
    { id: `songkran-${year}`, name: "Songkran (Thai New Year)", date: new Date(year, 3, 13), endDate: new Date(year, 3, 15), tradition: "thai", category: "festival", description: "April 13–15 — Thai water festival marking the Buddhist new year. Water symbolizes washing away bad luck and bringing blessings. Families gather, temples receive offerings, and water play celebrates renewal and cleansing.", ritualHint: "Bathe or shower mindfully, washing away the old. Splash water on others with joy. Wear white for purity.", element: "water" },
    { id: `obon-${year}`, name: "Obon Festival", date: new Date(year, 7, 13), endDate: new Date(year, 7, 15), tradition: "japanese", category: "festival", description: "August 13–15 — Japanese festival honoring ancestors. Families gather and return to their hometowns. Spirits of ancestors are believed to return. Lanterns (chochin) and fires guide them. A beautiful celebration of connection across time.", ritualHint: "Light lanterns or candles for ancestors. Gather with family. Remember those who came before. Cook family recipes.", element: "spirit" },
  );

  // ── ESBATS (FULL MOONS) CONTEXT NOTE ──
  // Full moons are added separately below, but each one is an Esbat in Wiccan tradition
  // They represent a gathering of witches to work magic aligned with the full moon's energy

  // ── FULL AND NEW MOONS ──
  // Computed, not typed. These used to be two hand-entered tables of dates for
  // 2026 only, and the tables were wrong: three of the twelve new moons were a
  // day out, and the full moons mixed UTC dates with US ones, because whoever
  // wrote them was copying from sources in different timezones. A moon event is
  // an instant, not a date, and which day it falls on depends on where you are
  // standing — September 2026's new moon is 03:26 UTC on the 11th, which is the
  // evening of the 10th in Texas. Both are true, and only the instant knows.
  //
  // The names, the lore and the Esbat framing are cultural and stay written
  // down. The dates come from the same ephemeris the moon card already uses.
  for (const at of moonEventsForYear("full", year)) {
    const month = at.getMonth();
    const day = at.getDate();
    const name = fullMoonNameFor(at);
    const sign = signAt(at);
    const isBlue = name === "Blue Moon";
    const eclipse = eclipseNear(at, "lunar");
    const specialLabel = (isBlue ? " — Blue Moon (rare second full moon this month)" : "")
      + (eclipse ? ` — ${eclipse.label}` : "");
    events.push({
      id: `full-moon-${year}-${month}-${day}`,
      name: `Full ${name} (Esbat)`,
      date: new Date(year, month, day),
      tradition: "pagan",
      category: "moon",
      description: `The ${name} in ${sign}.${specialLabel} In Wiccan tradition, every full moon is an Esbat — a gathering of witches to work magic and celebrate the Goddess. Each full moon has been named by indigenous, Celtic, and colonial American traditions based on the natural world at that time of year.`,
      ritualHint: "Full moon release: write what you want to let go of and safely burn the paper. Sit in moonlight for 10 minutes. Cast a circle and work magic aligned with the moon's energy.",
      element: "water",
    });
  }

  for (const at of moonEventsForYear("new", year)) {
    const month = at.getMonth();
    const sign = signAt(at);
    const eclipse = eclipseNear(at, "solar");
    events.push({
      id: `new-moon-${year}-${month}-${at.getDate()}`,
      name: "New Moon",
      date: new Date(year, month, at.getDate()),
      tradition: "astronomical",
      category: "moon",
      description: `New Moon in ${sign}.${eclipse ? ` — ${eclipse.label}` : ""} The moon is invisible — the darkest sky. In every tradition, this is a time of beginnings, planting, and setting intentions in the fertile darkness.`,
      ritualHint: "Write 3 intentions by candlelight. Speak them aloud to the dark sky.",
      element: "water",
    });
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}


// ─── Moon event naming ───────────────────────────────────────────────────────

/**
 * The traditional name for a month's full moon.
 *
 * One name per calendar month, and a second full moon inside the same month is
 * a Blue Moon — which is the actual folk rule, so it is computed rather than
 * marked by hand on the one row somebody happened to notice.
 */
const FULL_MOON_NAMES = [
  "Wolf Moon", "Snow Moon", "Worm Moon", "Pink Moon", "Flower Moon", "Strawberry Moon",
  "Buck Moon", "Sturgeon Moon", "Harvest Moon", "Hunter's Moon", "Beaver Moon", "Cold Moon",
];

function fullMoonNameFor(at: Date, timeZone?: string | null): string {
  // The month is the reader's month: a full moon at 03:00 UTC on 1 November is
  // still 31 October in Texas, and there it may be the month's second.
  const here = calendarDayIn(at, timeZone);
  const previous = calendarDayIn(nextMoonEventInstant("full", new Date(at.getTime() - 35 * DAY_MS)), timeZone);
  const sameMonth = previous.getFullYear() === here.getFullYear() && previous.getMonth() === here.getMonth();
  return sameMonth ? "Blue Moon" : FULL_MOON_NAMES[here.getMonth()];
}

// ─── Computed festival dates ─────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

function monthDay(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

/** The instant the Sun reaches a tropical longitude, searching from 1 Jan UTC. */
function sunReaches(longitude: number, year: number): Date {
  const t = Astronomy.SearchSunLongitude(longitude, new Date(Date.UTC(year, 0, 1)), 367);
  if (!t) throw new Error(`Sun never reached ${longitude}° in ${year}`);
  return t.date;
}

/** A Chinese solar term (jieqi) — the Beijing date the Sun reaches that longitude. */
function solarTermDay(longitude: number, year: number): Date {
  return calendarDayIn(sunReaches(longitude, year), "Asia/Shanghai");
}

/** The Beijing date of the last new moon on or before `target`'s Beijing date. */
function lunarMonthStartOnOrBefore(target: Date): Date {
  const targetDay = calendarDayIn(target, "Asia/Shanghai").getTime();
  let cursor = new Date(target.getTime() - 32 * DAY_MS);
  let best = calendarDayIn(cursor, "Asia/Shanghai");
  for (let i = 0; i < 3; i++) {
    const nm = nextMoonEventInstant("new", cursor);
    const day = calendarDayIn(nm, "Asia/Shanghai");
    if (day.getTime() > targetDay) break;
    best = day;
    cursor = new Date(nm.getTime() + DAY_MS);
  }
  return best;
}

/**
 * Lunar New Year: the first day of the lunar month that contains the
 * principal term Yushui (Sun at 330°) — the month-numbering rule of the
 * modern Chinese calendar. Checked against 2025 (29 Jan), 2026 (17 Feb),
 * 2027 (6 Feb) and the awkward 2033 (31 Jan).
 */
function lunarNewYear(year: number): Date {
  return lunarMonthStartOnOrBefore(sunReaches(330, year));
}

/** Mid-Autumn: the 15th day of the month that contains the autumn equinox. */
function midAutumn(year: number): Date {
  const start = lunarMonthStartOnOrBefore(sunReaches(180, year));
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 14);
}

/**
 * Nowruz: the Iranian calendar's rule — the day of the equinox if it falls
 * before noon in Tehran, otherwise the next day. (Iran uses true noon; mean
 * noon can differ for an equinox within a few minutes of 12:00.)
 */
function nowruz(year: number): Date {
  const eq = getSeasonDates(year).springEquinox;
  const day = calendarDayIn(eq, "Asia/Tehran");
  const noon = new Date(localDayWindow(day, "Asia/Tehran").start.getTime() + 12 * 60 * 60 * 1000);
  return eq < noon ? day : new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
}

/** Makar Sankranti: the Sun enters sidereal (Lahiri) Capricorn, dated in India. */
function makarSankranti(year: number): Date {
  // Find the tropical longitude that is 270° sidereal at that moment: start
  // with the ayanamsa near the date, then correct once for its drift.
  let at = sunReaches(294, year);
  for (let i = 0; i < 2; i++) {
    const tropical = getSunLongitude(at);
    const ayanamsa = ((tropical - toSidereal(tropical, jdFromDate(at), "lahiri")) % 360 + 360) % 360;
    const t = Astronomy.SearchSunLongitude(270 + ayanamsa, new Date(at.getTime() - 5 * DAY_MS), 10);
    if (t) at = t.date;
  }
  return calendarDayIn(at, "Asia/Kolkata");
}

/**
 * Festivals on calendars that cannot be derived from a new-moon search: the
 * Hindu tithi calendar (the observed day depends on which tithi holds at
 * sunrise or at dusk in India), Islamic months (set by moon sighting, and can
 * differ by a day between countries), and the Tibetan calendar (its own leap
 * and skipped days). Month is 0-based. ONLY years listed here show these
 * festivals; add each new year from an authoritative panchang / hijri
 * calendar rather than extrapolating. Islamic dates are the expected dates.
 */
const OBSERVED_DATES: Record<string, Record<number, [number, number]>> = {
  "maha-shivaratri": { 2026: [1, 15] },
  holi:              { 2026: [2, 4] },   // Holika Dahan the evening of Mar 3
  "navratri-spring": { 2026: [2, 19] },
  "guru-purnima":    { 2026: [6, 29] },
  "navratri-autumn": { 2026: [9, 11] },
  diwali:            { 2026: [10, 8] },
  ramadan:           { 2026: [1, 18] },
  "eid-fitr":        { 2026: [2, 20] },
  "eid-adha":        { 2026: [4, 27] },
  losar:             { 2026: [1, 18] },
};

function observed(id: string, year: number): Date | null {
  const md = OBSERVED_DATES[id]?.[year];
  return md ? new Date(year, md[0], md[1]) : null;
}

// ─── Retrograde & eclipse copy ───────────────────────────────────────────────
// Reflection only. No advice about contracts, purchases, money or health:
// a real decision does not get made by a transit.

const RETROGRADE_COPY: Record<"Mercury" | "Venus" | "Mars", Pick<CelestialEvent, "description" | "ritualHint" | "element">> = {
  Mercury: {
    description: "Mercury appears to move backward in the sky. Astrology associates this stretch with review — rereading, revisiting, reconnecting with people and projects from the past. A time traditionally given to editing rather than launching.",
    ritualHint: "Reread something you wrote months ago. Revisit an unfinished conversation. Journal about what deserves a second look.",
    element: "air",
  },
  Venus: {
    description: "Venus moves backward — it happens roughly every eighteen months. Traditionally a time for reassessing relationships and clarifying what you truly value and desire.",
    ritualHint: "Practice radical self-care. Reflect on your relationships. Clarify your values. What do you truly want?",
    element: "water",
  },
  Mars: {
    description: "Mars moves backward, about every two years. Astrology reads this as drive turning inward — a season traditionally associated with rethinking strategy rather than forcing momentum.",
    ritualHint: "Notice where you've been pushing. Move your body gently and let frustration have somewhere to go.",
    element: "fire",
  },
};

const ECLIPSE_COPY: Record<SkyEclipse["kind"], Pick<CelestialEvent, "description" | "ritualHint" | "element">> = {
  solar: {
    description: "Solar eclipses are often called cosmic reset buttons — a new moon turned up. The shadow of the moon crosses the sun. What becomes visible in the darkness?",
    ritualHint: "Sit in silence and darkness. Name an intention that needs solar fire. What do you want to begin?",
    element: "spirit",
  },
  lunar: {
    description: "Lunar eclipses are traditionally read as illuminating what was hidden — a full moon turned up. The earth's shadow falls on the moon. What is asking to be seen?",
    ritualHint: "Journal about what's being revealed. Release what no longer serves. Name your truth.",
    element: "water",
  },
};

/** The sign the moon is actually standing in at that instant. */
function signAt(at: Date): string {
  return getCurrentMoonSign(at).full;
}

// ─── FULL MOON NAME LORE ─────────────────────────────────────────────────────
// Traditional names for each month's full moon, drawn from Algonquin, Colonial
// American, Celtic, and other folk traditions. The names describe what was
// happening in the natural world at that time of year.

export interface MoonNameLore {
  name: string;
  altNames: string[];
  origin: string;
  story: string;
  energy: string;
  emoji: string;
}

export const MOON_LORE: Record<string, MoonNameLore> = {
  "Wolf Moon": {
    name: "Wolf Moon",
    altNames: ["Old Moon", "Moon After Yule", "Ice Moon"],
    origin: "Algonquin, Colonial American",
    story:
      "January's full moon. Named for the howling wolf packs heard outside villages during the deepest cold of winter, when food was scarce. The Celts called it the Quiet Moon.",
    energy:
      "Stillness and endurance. What are you protecting? What's howling in you that wants to be heard?",
    emoji: "🐺",
  },
  "Snow Moon": {
    name: "Snow Moon",
    altNames: ["Hunger Moon", "Storm Moon", "Bone Moon"],
    origin: "Algonquin",
    story:
      "February's full moon, named for the heaviest snowfall of the year. Also called the Hunger Moon by the Cherokee, because hunting was hardest and food stores were running low.",
    energy:
      "Deep rest and conservation. Stillness as strength. Tend to what little you have and trust the thaw is coming.",
    emoji: "❄️",
  },
  "Worm Moon": {
    name: "Worm Moon",
    altNames: ["Sap Moon", "Crow Moon", "Crust Moon", "Lenten Moon"],
    origin: "Algonquin, Anglo-Saxon",
    story:
      "March's full moon. Named for the earthworms reappearing in the thawing soil — a sign of spring and returning life. Also called the Sap Moon for the running maple sap.",
    energy:
      "Thaw and emergence. What's been frozen in you is starting to move again. Follow what stirs.",
    emoji: "🪱",
  },
  "Pink Moon": {
    name: "Pink Moon",
    altNames: ["Sprouting Grass Moon", "Egg Moon", "Fish Moon", "Paschal Moon"],
    origin: "Algonquin",
    story:
      "April's full moon. Not actually pink — named for the wild pink phlox (moss pink) that blooms early in the spring across eastern North America. It's also the Paschal Moon used to determine Easter's date.",
    energy:
      "New growth and first bloom. Whatever you planted is breaking ground. Tend it gently — it's still young.",
    emoji: "🌸",
  },
  "Flower Moon": {
    name: "Flower Moon",
    altNames: ["Milk Moon", "Corn Planting Moon", "Hare Moon"],
    origin: "Algonquin, Anglo-Saxon",
    story:
      "May's full moon. Named for the explosion of wildflowers in the Northern Hemisphere. The Old English called it the Milk Moon, when cows came back to full milk on new grass.",
    energy:
      "Fullness and beauty. Abundance is here. Let yourself enjoy it without rushing toward the next thing.",
    emoji: "🌷",
  },
  "Strawberry Moon": {
    name: "Strawberry Moon",
    altNames: ["Honey Moon", "Mead Moon", "Rose Moon"],
    origin: "Algonquin, European",
    story:
      "June's full moon. Named for the short strawberry harvest in the Northeast. In Europe it was the Honey Moon — the origin of the word 'honeymoon' — when mead was brewed from the first honey.",
    energy:
      "Sweetness and fruition. Taste what you've cultivated. Love, honey, ripeness — this is a tender full moon.",
    emoji: "🍓",
  },
  "Buck Moon": {
    name: "Buck Moon",
    altNames: ["Thunder Moon", "Hay Moon", "Wyrt Moon"],
    origin: "Algonquin",
    story:
      "July's full moon. Named for the new antlers pushing through the velvet on male deer. Also called the Thunder Moon for summer storms. The Anglo-Saxons called it the Wyrt (plant) Moon.",
    energy:
      "Virility and new growth after maturity. Sharpen what you've built. Strength is returning after the long days.",
    emoji: "🦌",
  },
  "Sturgeon Moon": {
    name: "Sturgeon Moon",
    altNames: ["Green Corn Moon", "Grain Moon", "Red Moon"],
    origin: "Algonquin",
    story:
      "August's full moon. Named for the giant sturgeon of the Great Lakes, most easily caught at this time of year. Sometimes called the Red Moon because it rises low through the summer haze.",
    energy:
      "Harvest preparation. Abundance is close — gather, preserve, celebrate. Don't let the peak pass unnoticed.",
    emoji: "🐟",
  },
  "Harvest Moon": {
    name: "Harvest Moon",
    altNames: ["Corn Moon", "Barley Moon"],
    origin: "European, Algonquin",
    story:
      "September's full moon (the one closest to the autumn equinox). Named because its bright light let farmers harvest late into the night. It rises earlier each evening than usual — an extra hour of moonlight.",
    energy:
      "Reaping what you've sown. Gratitude and gathering in. What's ripe in your life? Take it in before winter.",
    emoji: "🌾",
  },
  "Hunter's Moon": {
    name: "Hunter's Moon",
    altNames: ["Blood Moon", "Sanguine Moon", "Travel Moon"],
    origin: "Algonquin, European",
    story:
      "October's full moon. After the harvest, fields were clear and game was fat — ideal conditions for hunting. The bright moon let hunters track prey well into the night in preparation for winter.",
    energy:
      "Preparation and provision. Stock up on what you'll need for the dark half of the year — literally and spiritually.",
    emoji: "🏹",
  },
  "Beaver Moon": {
    name: "Beaver Moon",
    altNames: ["Frost Moon", "Mourning Moon", "Oak Moon"],
    origin: "Algonquin, Colonial American",
    story:
      "November's full moon. Named because it was the last chance to set beaver traps before the swamps froze — beaver fur was essential winter clothing. Also called the Frost Moon as the first hard freezes arrive.",
    energy:
      "Final preparations. Build your shelter, literal or metaphorical. Who and what are you wintering with?",
    emoji: "🦫",
  },
  "Cold Moon": {
    name: "Cold Moon",
    altNames: ["Long Night Moon", "Moon Before Yule", "Oak Moon"],
    origin: "Algonquin, European",
    story:
      "December's full moon. Named for the biting cold of deep winter. It's the Long Night Moon because it rises high and lingers — the darkest nights of the year have the most moonlight.",
    energy:
      "Endurance and inner fire. The darkest night is also the longest moonlight. Whatever you've been carrying, you've almost made it through.",
    emoji: "❄️",
  },
  "Blue Moon": {
    name: "Blue Moon",
    altNames: ["Second Moon", "Bonus Moon"],
    origin: "European, Colonial American",
    story:
      "A rare second full moon in a single calendar month — happening roughly every 2.5 years. The phrase 'once in a blue moon' comes from this rarity.",
    energy:
      "The unexpected gift. An extra full moon is a bonus round — use it for whatever unfinished business the first one stirred up. Double the release, double the magic.",
    emoji: "🔵",
  },
};

// Short cultural context for the dark New Moon (shared across all new moons)
export const NEW_MOON_LORE: MoonNameLore = {
  name: "New Moon",
  altNames: ["Dark Moon", "Hecate's Moon"],
  origin: "Universal",
  story:
    "The moon is invisible — completely hidden in the sun's glare. In every tradition this is the darkest point of the lunar cycle, when the sky is empty and the stars are bright. The Greeks called it Hecate's Moon, sacred to the goddess of the crossroads and new beginnings.",
  energy:
    "The blank page. Plant seeds of intention in the fertile darkness. This is the most powerful point in the lunar cycle for starting something new.",
  emoji: "🌑",
};

// ─── NEXT MOON EVENT FINDER ──────────────────────────────────────────────────

export interface NextMoonEvent {
  kind: "full" | "new";
  date: Date;
  /** Traditional name (e.g. "Pink Moon") — undefined for new moons */
  moonName?: string;
  /** Pretty label — "Pink Moon" for full, "New Moon in Taurus" for new */
  label: string;
  /** Zodiac sign the moon event occurs in (always set for new moons) */
  zodiacSign?: string;
  /** Days until it happens (0 = today) */
  daysUntil: number;
}

/**
 * Find the next full moon and next new moon from a given date.
 * Pulls from the full moon + new moon event data in getCelestialEvents,
 * and falls back to checking next year's events if nothing is upcoming in
 * the current year.
 */
export function getNextMoonEvents(fromDate: Date): {
  nextFull: NextMoonEvent | null;
  nextNew: NextMoonEvent | null;
} {
  const from = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate()
  );

  const eventsThisYear = getCelestialEvents(from.getFullYear());
  const eventsNextYear = getCelestialEvents(from.getFullYear() + 1);
  const allMoons = [...eventsThisYear, ...eventsNextYear].filter(
    (e) => e.category === "moon"
  );

  const msPerDay = 1000 * 60 * 60 * 24;

  // Normalize to start of day so we don't miss today's events
  // (event dates are midnight, but `from` could be any time of day)
  const fromStart = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();

  const nextFullEvent = allMoons.find(
    (e) => e.name.startsWith("Full ") && e.date.getTime() >= fromStart
  );
  const nextNewEvent = allMoons.find(
    (e) => e.name === "New Moon" && e.date.getTime() >= fromStart
  );

  // Parse the moon name out of "Full Pink Moon (Esbat)" → "Pink Moon"
  const parseMoonName = (name: string): string | undefined => {
    const m = name.match(/^Full (.+?)(?: \(Esbat\))?$/);
    return m ? m[1] : undefined;
  };

  // Parse the moon's zodiac sign from the event description
  // Description format: "The Flower Moon in Scorpio." or "New moon in Taurus."
  const parseMoonSign = (desc: string): string | undefined => {
    const m = desc.match(/in ([A-Z][a-z]+)\./);
    return m ? m[1] : undefined;
  };

  const nextFull: NextMoonEvent | null = nextFullEvent
    ? {
        kind: "full",
        date: nextFullEvent.date,
        moonName: parseMoonName(nextFullEvent.name),
        label: parseMoonName(nextFullEvent.name) ?? "Full Moon",
        zodiacSign: parseMoonSign(nextFullEvent.description) || getCurrentZodiacSeason(nextFullEvent.date).sign,
        daysUntil: Math.round(
          (nextFullEvent.date.getTime() - fromStart) / msPerDay
        ),
      }
    : null;

  const nextNew: NextMoonEvent | null = nextNewEvent
    ? (() => {
        const sign = parseMoonSign(nextNewEvent.description) || getCurrentZodiacSeason(nextNewEvent.date).sign;
        return {
          kind: "new" as const,
          date: nextNewEvent.date,
          label: `New Moon in ${sign}`,
          zodiacSign: sign,
          daysUntil: Math.round(
            (nextNewEvent.date.getTime() - fromStart) / msPerDay
          ),
        };
      })()
    : null;

  return { nextFull, nextNew };
}

// ─── TODAY'S MOON EVENT ─────────────────────────────────────────────────────
// Returns info about today's full/new moon event, or null if today isn't one.

// ─── Solstices & Equinoxes (the solar wheel of the year) ────────────────────

export type SolarEventKind =
  | "spring-equinox"
  | "summer-solstice"
  | "autumn-equinox"
  | "winter-solstice";

export interface TodaysSolarEvent {
  kind: SolarEventKind;
  name: string;
  date: Date;
  sign: string;        // the sign the Sun enters: Aries / Cancer / Libra / Capricorn
  element: string;     // air / fire / earth / water
  dayType: string;     // "The longest day", "Day and night in balance", etc.
  description: string;
  ritualHint: string;
  bestFor: string[];
}

const SOLAR_META: Record<SolarEventKind, Omit<TodaysSolarEvent, "date">> = {
  "spring-equinox": {
    kind: "spring-equinox",
    name: "Spring Equinox",
    sign: "Aries",
    element: "air",
    dayType: "Day and night in balance",
    description: "Day and night are equal, and light begins to overtake darkness. This is the astrological new year — the Sun enters Aries. Celebrated across the world as Ostara, Nowruz, and Holi: a moment of renewal, fresh starts, and planting what you want to grow.",
    ritualHint: "Balance ritual — equal parts letting go and welcoming in. Plant a seed, literal or symbolic.",
    bestFor: ["New beginnings", "Planting intentions", "Fresh starts", "Renewal"],
  },
  "summer-solstice": {
    kind: "summer-solstice",
    name: "Summer Solstice",
    sign: "Cancer",
    element: "fire",
    dayType: "The longest day",
    description: "The longest day of the year and the peak of solar power, as the Sun enters Cancer. Honored as Litha, Midsommar, and countless sun ceremonies. A time to celebrate your fullest expression, soak in light, and stand in your own warmth.",
    ritualHint: "Celebrate your fullest expression. Soak in sunlight, name what's flourishing, and let yourself be seen.",
    bestFor: ["Celebration", "Full expression", "Gratitude", "Vitality"],
  },
  "autumn-equinox": {
    kind: "autumn-equinox",
    name: "Autumn Equinox",
    sign: "Libra",
    element: "earth",
    dayType: "Day and night in balance",
    description: "Balance returns — day equals night once more before the dark half of the year grows. The Sun enters Libra. Celebrated as Mabon and countless harvest festivals: a time for gratitude, gathering what you've grown, and releasing what you haven't.",
    ritualHint: "Gratitude harvest — name everything that grew this year, and what you're ready to release.",
    bestFor: ["Gratitude", "Harvest", "Letting go", "Balance"],
  },
  "winter-solstice": {
    kind: "winter-solstice",
    name: "Winter Solstice",
    sign: "Capricorn",
    element: "water",
    dayType: "The longest night",
    description: "The longest night — and the turning point where light begins its return, as the Sun enters Capricorn. Honored as Yule, Dongzhi, Inti Raymi, and Shab-e Yalda. The darkest night holds the promise of returning light; a time for rest, reflection, and inner warmth.",
    ritualHint: "Light a candle in the darkness. Sit with the quiet. Ask what inner light carries you through.",
    bestFor: ["Rest", "Reflection", "Inner light", "Setting roots"],
  },
};

/**
 * Returns the solstice/equinox falling on `date` (local calendar day), or null.
 * Dates are computed exactly from astronomy-engine, so this fires on the real
 * day each year (e.g. the solstice may be Jun 20, 21, or 22).
 */
export function getTodaysSolarEvent(date: Date): TodaysSolarEvent | null {
  const seasons = getSeasonDates(date.getFullYear());
  const candidates: [SolarEventKind, Date][] = [
    ["spring-equinox", seasons.springEquinox],
    ["summer-solstice", seasons.summerSolstice],
    ["autumn-equinox", seasons.autumnEquinox],
    ["winter-solstice", seasons.winterSolstice],
  ];
  const sameLocalDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  for (const [kind, eventDate] of candidates) {
    if (sameLocalDay(eventDate, date)) {
      return { ...SOLAR_META[kind], date: eventDate };
    }
  }
  return null;
}

/** The four solar points for a year, for the "Wheel of the Year" grid. */
export function getSolarEventsForYear(year: number): TodaysSolarEvent[] {
  const seasons = getSeasonDates(year);
  return [
    { ...SOLAR_META["spring-equinox"], date: seasons.springEquinox },
    { ...SOLAR_META["summer-solstice"], date: seasons.summerSolstice },
    { ...SOLAR_META["autumn-equinox"], date: seasons.autumnEquinox },
    { ...SOLAR_META["winter-solstice"], date: seasons.winterSolstice },
  ];
}

export interface TodaysMoonEvent {
  kind: "full" | "new";
  moonName?: string;      // e.g. "Flower Moon", "Blue Moon"
  zodiacSign: string;     // e.g. "Scorpio"
  isBlue: boolean;        // rare second full moon in a month
  isEclipse: boolean;     // lunar or solar eclipse
  lore?: MoonNameLore;    // rich lore data
  /**
   * True only on the calendar day holding the exact instant.
   *
   * The moon reads as new or full for about three days either side, and the
   * phase card says so for all of them — so the PAGE is offered for all of
   * them, because a card that says "New Moon" and does nothing when you tap it
   * is the bug this flag exists to end. The uninvited banner is the intrusive
   * part, and that stays on the one day the event actually happens.
   */
  isPeak: boolean;
  /** "Total Lunar Eclipse", "Annular Solar Eclipse"… when isEclipse. */
  eclipseLabel?: string;
}

/**
 * Today's new or full moon, if the moon reads as one.
 *
 * `date` is the day being asked about. In a browser, pass the current time and
 * leave `timeZone` off — the runtime's zone is the reader's. On a server, pass
 * the person's calendar date (as localNow() builds it) WITH their IANA zone:
 * the peak day and the month that names the moon are both calendar questions,
 * and the server's calendar is not theirs.
 *
 * Eclipses come from the eclipse search, for every year. (This used to match a
 * 2026-only table and answer "no eclipse" for every other year.)
 */
export function getTodaysMoonEvent(date: Date, timeZone?: string | null): TodaysMoonEvent | null {
  // With a zone, read the phase at their local noon; without one, at `date`.
  const ref = timeZone
    ? new Date(localDayWindow(date, timeZone).start.getTime() + 12 * 60 * 60 * 1000)
    : date;
  const phase = getMoonPhase(ref).phase;
  if (phase !== "new" && phase !== "full") return null;

  // Look back far enough to catch an instant a day or two behind us: the phase
  // window opens before the event and closes after it.
  const from = new Date(ref.getTime() - 4 * DAY_MS);
  const at = nextMoonEventInstant(phase, from);
  const isPeak = timeZone ? isOnDay(at, date, timeZone) : isSameLocalDay(at, date);
  const zodiacSign = getCurrentMoonSign(at).full;
  const eclipse = eclipseNear(at, phase === "full" ? "lunar" : "solar");

  if (phase === "full") {
    const name = fullMoonNameFor(at, timeZone);
    return {
      kind: "full",
      moonName: name,
      zodiacSign,
      isBlue: name === "Blue Moon",
      isEclipse: !!eclipse,
      eclipseLabel: eclipse?.label,
      lore: MOON_LORE[name],
      isPeak,
    };
  }

  return {
    kind: "new",
    zodiacSign,
    isBlue: false,
    isEclipse: !!eclipse,
    eclipseLabel: eclipse?.label,
    lore: NEW_MOON_LORE,
    isPeak,
  };
}

// ─── ALL FULL MOONS FOR A YEAR (for the "Moons of 2026" grid) ──────────────

export interface YearMoonEntry {
  month: number;       // 0-11
  day: number;
  name: string;        // "Flower Moon", "Blue Moon"
  sign: string;        // "Scorpio"
  isBlue: boolean;
  emoji: string;
}

const FULL_MOON_EMOJI: Record<string, string> = {
  "Wolf Moon": "🐺", "Snow Moon": "❄️", "Worm Moon": "🪱", "Pink Moon": "🌸",
  "Flower Moon": "🌷", "Strawberry Moon": "🍓", "Buck Moon": "🦌", "Sturgeon Moon": "🐟",
  "Harvest Moon": "🌾", "Hunter's Moon": "🏹", "Beaver Moon": "🦫", "Cold Moon": "❄️",
  "Blue Moon": "🔵",
};

/**
 * Every full moon in a year, for the "Moons of" grid.
 *
 * This used to return an empty array for any year but 2026, which meant the
 * grid would simply vanish on 1 January 2027 with nothing to say why.
 */
export function getFullMoonsForYear(year: number): YearMoonEntry[] {
  return moonEventsForYear("full", year).map((at) => {
    const name = fullMoonNameFor(at);
    return {
      month: at.getMonth(),
      day: at.getDate(),
      name,
      sign: getCurrentMoonSign(at).full,
      isBlue: name === "Blue Moon",
      emoji: FULL_MOON_EMOJI[name] ?? "🌕",
    };
  });
}

// ─── DAILY ENERGY CALCULATOR ─────────────────────────────────────────────────

export function getDailyEnergy(date: Date): DailyEnergy {
  const moonPhase = getMoonPhase(date);
  const zodiacSeason = getCurrentZodiacSeason(date);
  const dayOfWeek = PLANETARY_DAYS[date.getDay()];
  const allEvents = getCelestialEvents(date.getFullYear());

  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const currentEvents = allEvents.filter(e => {
    const eDate = new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate());
    if (e.endDate) {
      const eEnd = new Date(e.endDate.getFullYear(), e.endDate.getMonth(), e.endDate.getDate());
      return eDate <= today && eEnd >= today;
    }
    return eDate.getTime() === today.getTime();
  });

  const upcomingEvents = allEvents.filter(e => {
    const eDate = new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate());
    return eDate > today && eDate <= monthFromNow;
  });

  return {
    moonPhase,
    zodiacSeason,
    dayOfWeek,
    upcomingEvents,
    currentEvents,
    element: zodiacSeason.element,
  };
}
