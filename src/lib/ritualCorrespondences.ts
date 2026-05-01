/**
 * Ritual Correspondence Knowledge Base
 *
 * Structured reference for ritual creation across moon phases, days of the week,
 * planets, chakras, stones, oils, flowers, herbs, candle colors, elements, and
 * zodiac signs. Used by the Ritual Wizard to compose personalized rituals.
 *
 * Source philosophy: Hellenistic astrology, Western magical tradition (Golden Dawn),
 * Hermetic Qabalah, Celtic/pagan practice, traditional crystal healing, aromatherapy,
 * herbalism, and color theory. Western/New Age conventions used where traditions disagree.
 */

// ─── MOON PHASES ───────────────────────────────────────────────────────────────

export interface MoonPhaseCorrespondence {
  phase: string;
  emoji: string;
  energy: string;
  bestFor: string[];
  avoid: string[];
  elementAffinity: string[];
  mood: string;
  ritualTypes: string[];
}

export const MOON_PHASES: MoonPhaseCorrespondence[] = [
  {
    phase: "New Moon",
    emoji: "🌑",
    energy: "Beginning, planting, intention, darkness, potential",
    bestFor: ["Setting intentions", "starting new projects", "planting seeds", "vision work", "fresh starts"],
    avoid: ["Releasing", "ending", "public work", "big launches"],
    elementAffinity: ["Earth", "Water"],
    mood: "Hushed, possibility, quiet excitement",
    ritualTypes: ["Vision letters", "intention setting", "seed planting", "mirror gazing", "journaling", "divination"],
  },
  {
    phase: "Waxing Crescent",
    emoji: "🌒",
    energy: "Stirring, gathering, building momentum, beginning to act",
    bestFor: ["Taking first action on intentions", "gathering resources", "asking for what you need", "learning"],
    avoid: ["Releasing", "big endings"],
    elementAffinity: ["Fire", "Air"],
    mood: "Anticipation, gentle effort",
    ritualTypes: ["First-action rituals", "learning rituals", "ask rituals", "courage work"],
  },
  {
    phase: "First Quarter",
    emoji: "🌓",
    energy: "Decision, friction, commitment, action",
    bestFor: ["Making decisions", "overcoming obstacles", "committing to a path", "declaring publicly"],
    avoid: ["Passive practices", "waiting"],
    elementAffinity: ["Fire", "Air"],
    mood: "Focused, slightly confrontational, decisive",
    ritualTypes: ["Decision rituals", "courage rituals", "declaration rituals", "conflict-resolution work"],
  },
  {
    phase: "Waxing Gibbous",
    emoji: "🌔",
    energy: "Refining, fine-tuning, almost-there, perfecting",
    bestFor: ["Editing", "revising", "adjusting course", "last-mile work", "preparation"],
    avoid: ["Starting completely new things", "major launches"],
    elementAffinity: ["Earth", "Air"],
    mood: "Patient effort, attention to detail",
    ritualTypes: ["Editing rituals", "refinement work", "course-corrections", "preparation ceremonies"],
  },
  {
    phase: "Full Moon",
    emoji: "🌕",
    energy: "Culmination, illumination, visibility, peak power",
    bestFor: ["Celebration", "manifestation completion", "charging tools", "visibility work", "gratitude"],
    avoid: ["Quiet contemplation if it conflicts with ritual time"],
    elementAffinity: ["Water", "Fire"],
    mood: "Heightened, emotional, electric",
    ritualTypes: ["Charging crystals/water", "manifestation completion", "gratitude rituals", "visibility work", "group ritual", "celebration"],
  },
  {
    phase: "Waning Gibbous",
    emoji: "🌖",
    energy: "Sharing, gratitude, distributing, harvesting",
    bestFor: ["Gratitude practice", "sharing what you've made", "teaching", "giving thanks"],
    avoid: ["Aggressive new starts"],
    elementAffinity: ["Earth", "Water"],
    mood: "Grateful, generous, slightly tired",
    ritualTypes: ["Gratitude rituals", "sharing rituals", "teaching", "harvest reflection"],
  },
  {
    phase: "Last Quarter",
    emoji: "🌗",
    energy: "Releasing, breaking, forgiving, letting go",
    bestFor: ["Releasing grudges", "ending what's already over", "forgiveness", "breaking habits", "decluttering"],
    avoid: ["Starting new things"],
    elementAffinity: ["Fire", "Water"],
    mood: "Resolute, sometimes sad, cleansing",
    ritualTypes: ["Burn rituals", "forgiveness rituals", "decluttering", "breaking-up rituals", "endings"],
  },
  {
    phase: "Waning Crescent",
    emoji: "🌘",
    energy: "Rest, surrender, integration, dreamtime",
    bestFor: ["Resting", "dreaming", "integration", "processing", "deep restoration"],
    avoid: ["Productivity", "public work", "decisions"],
    elementAffinity: ["Water", "Earth"],
    mood: "Quiet, contemplative, sometimes melancholic",
    ritualTypes: ["Dream work", "deep rest", "meditation", "integration journaling", "gentle self-care"],
  },
];

// ─── DAYS OF THE WEEK ──────────────────────────────────────────────────────────

export interface DayCorrespondence {
  day: string;
  planet: string;
  colors: string[];
  metal: string;
  stones: string[];
  herbs: string[];
  oils: string[];
  body: string;
  bestFor: string[];
  avoid: string[];
  mood: string;
}

export const DAYS_OF_WEEK: DayCorrespondence[] = [
  {
    day: "Sunday",
    planet: "Sun",
    colors: ["Gold", "yellow", "orange"],
    metal: "Gold",
    stones: ["Citrine", "sunstone", "tiger's eye", "amber"],
    herbs: ["Calendula", "rosemary", "sunflower", "chamomile", "St. John's wort"],
    oils: ["Frankincense", "rosemary", "orange"],
    body: "Heart, spine, vitality, eyes",
    bestFor: ["Vitality", "identity", "leadership", "success", "confidence", "creative self-expression"],
    avoid: ["Hiding", "false modesty"],
    mood: "Bright, generous, regal",
  },
  {
    day: "Monday",
    planet: "Moon",
    colors: ["Silver", "white", "pale blue", "pearl"],
    metal: "Silver",
    stones: ["Moonstone", "selenite", "pearl", "opal"],
    herbs: ["Jasmine", "mugwort", "lemon balm", "willow"],
    oils: ["Jasmine", "sandalwood", "ylang-ylang"],
    body: "Womb, breasts, stomach, lymph",
    bestFor: ["Emotional work", "dream work", "intuition", "family", "home"],
    avoid: ["Major decisions", "confrontations"],
    mood: "Soft, receptive, slightly tender",
  },
  {
    day: "Tuesday",
    planet: "Mars",
    colors: ["Red", "scarlet", "deep orange"],
    metal: "Iron",
    stones: ["Carnelian", "red jasper", "bloodstone", "garnet"],
    herbs: ["Nettle", "ginger", "cayenne", "basil"],
    oils: ["Black pepper", "ginger", "cinnamon"],
    body: "Muscles, blood, head, sex organs",
    bestFor: ["Action", "courage", "releasing anger", "defending boundaries", "sex magic"],
    avoid: ["Diplomatic conversations", "fragile work"],
    mood: "Hot, decisive, sometimes irritable",
  },
  {
    day: "Wednesday",
    planet: "Mercury",
    colors: ["Yellow", "orange", "multi-colored"],
    metal: "Aluminum",
    stones: ["Citrine", "agate", "fluorite", "opal"],
    herbs: ["Lavender", "peppermint", "dill", "fennel"],
    oils: ["Peppermint", "lavender", "eucalyptus"],
    body: "Lungs, hands, nervous system, mouth/tongue",
    bestFor: ["Communication", "writing", "learning", "contracts", "technology", "decision-making"],
    avoid: ["Long-term commitments"],
    mood: "Quick, witty, slightly scattered",
  },
  {
    day: "Thursday",
    planet: "Jupiter",
    colors: ["Royal blue", "purple", "deep green"],
    metal: "Tin",
    stones: ["Amethyst", "lapis lazuli", "sapphire", "turquoise"],
    herbs: ["Sage", "oak", "dandelion", "nutmeg"],
    oils: ["Cedarwood", "sage", "nutmeg"],
    body: "Liver, thighs, hips, growth",
    bestFor: ["Expansion", "generosity", "travel", "education", "abundance", "philosophical inquiry"],
    avoid: ["Restriction", "contraction"],
    mood: "Expansive, generous, slightly excessive",
  },
  {
    day: "Friday",
    planet: "Venus",
    colors: ["Pink", "green", "copper", "rose gold"],
    metal: "Copper",
    stones: ["Rose quartz", "emerald", "jade", "malachite"],
    herbs: ["Rose", "vanilla", "hibiscus", "apple", "raspberry leaf"],
    oils: ["Rose", "ylang-ylang", "vanilla", "geranium"],
    body: "Throat, kidneys, lower back, skin",
    bestFor: ["Love", "beauty", "art", "pleasure", "money/value", "relationships", "self-worth"],
    avoid: ["Conflict", "harshness"],
    mood: "Soft, beautiful, sensual",
  },
  {
    day: "Saturday",
    planet: "Saturn",
    colors: ["Black", "dark gray", "deep brown", "indigo"],
    metal: "Lead",
    stones: ["Black tourmaline", "obsidian", "hematite", "onyx", "jet"],
    herbs: ["Patchouli", "comfrey", "mullein", "Solomon's seal"],
    oils: ["Patchouli", "vetiver", "myrrh", "cypress"],
    body: "Bones, teeth, skin, knees, joints",
    bestFor: ["Discipline", "structure", "banishing", "protection", "mirror work", "accountability", "ancestor work"],
    avoid: ["Quick wins", "frivolity"],
    mood: "Serious, slow, grounded",
  },
];

// ─── ELEMENTS ──────────────────────────────────────────────────────────────────

export interface ElementCorrespondence {
  element: string;
  direction: string;
  season: string;
  timeOfDay: string;
  signs: string[];
  colors: string[];
  stones: string[];
  herbs: string[];
  oils: string[];
  tools: string[];
  tarotSuit: string;
  bodyPractices: string[];
  intentions: string[];
}

export const ELEMENTS: ElementCorrespondence[] = [
  {
    element: "Earth",
    direction: "North",
    season: "Winter",
    timeOfDay: "Midnight",
    signs: ["Taurus", "Virgo", "Capricorn"],
    colors: ["Brown", "deep green", "black", "ochre"],
    stones: ["Hematite", "smoky quartz", "obsidian", "jet", "jasper"],
    herbs: ["Patchouli", "vetiver", "cypress", "oak", "sage", "rosemary"],
    oils: ["Patchouli", "vetiver", "oakmoss", "cypress"],
    tools: ["Pentacle", "salt", "soil", "stones", "coins"],
    tarotSuit: "Pentacles",
    bodyPractices: ["Walking", "gardening", "cooking", "lifting weights"],
    intentions: ["Grounding", "manifestation", "money", "body", "home", "stability", "ancestor work"],
  },
  {
    element: "Fire",
    direction: "South",
    season: "Summer",
    timeOfDay: "Noon",
    signs: ["Aries", "Leo", "Sagittarius"],
    colors: ["Red", "orange", "gold", "crimson"],
    stones: ["Carnelian", "ruby", "garnet", "citrine", "sunstone", "amber"],
    herbs: ["Cinnamon", "ginger", "basil", "dragon's blood", "calendula", "frankincense"],
    oils: ["Cinnamon", "ginger", "frankincense", "dragon's blood", "orange"],
    tools: ["Candle", "wand", "flame", "lighter"],
    tarotSuit: "Wands",
    bodyPractices: ["Cardio", "dance", "sex", "sauna"],
    intentions: ["Action", "courage", "passion", "creativity", "banishing", "transformation", "sex magic"],
  },
  {
    element: "Water",
    direction: "West",
    season: "Autumn",
    timeOfDay: "Sunset/dusk",
    signs: ["Cancer", "Scorpio", "Pisces"],
    colors: ["Blue", "sea green", "silver", "white", "pearl"],
    stones: ["Moonstone", "aquamarine", "larimar", "pearl", "opal", "selenite"],
    herbs: ["Jasmine", "lotus", "water lily", "willow", "kelp", "mugwort"],
    oils: ["Jasmine", "lotus", "ylang-ylang", "sandalwood"],
    tools: ["Cup", "chalice", "bowl of water", "mirror", "rain"],
    tarotSuit: "Cups",
    bodyPractices: ["Bathing", "swimming", "crying", "hydration rituals"],
    intentions: ["Emotional healing", "dream work", "intuition", "love", "grief", "release"],
  },
  {
    element: "Air",
    direction: "East",
    season: "Spring",
    timeOfDay: "Dawn",
    signs: ["Gemini", "Libra", "Aquarius"],
    colors: ["Yellow", "light blue", "white", "pale silver"],
    stones: ["Citrine", "clear quartz", "amethyst", "fluorite", "aventurine"],
    herbs: ["Lavender", "peppermint", "eucalyptus", "lemongrass", "sage", "pine"],
    oils: ["Peppermint", "lavender", "eucalyptus", "lemongrass", "pine"],
    tools: ["Feather", "incense", "sound (bells, singing bowls)", "wind"],
    tarotSuit: "Swords",
    bodyPractices: ["Breathwork", "singing", "chanting", "meditation", "journaling"],
    intentions: ["Mental clarity", "communication", "decisions", "learning", "sound healing", "freedom"],
  },
];

// ─── CHAKRAS ───────────────────────────────────────────────────────────────────

export interface ChakraCorrespondence {
  number: number;
  name: string;
  sanskrit: string;
  location: string;
  color: string;
  element: string;
  stones: string[];
  oils: string[];
  herbs: string[];
  mantra: string;
  planet: string;
  intentions: string[];
  imbalanceSigns: string;
}

export const CHAKRAS: ChakraCorrespondence[] = [
  {
    number: 1, name: "Root", sanskrit: "Muladhara", location: "Base of spine",
    color: "Red", element: "Earth",
    stones: ["Red jasper", "hematite", "garnet", "smoky quartz", "black tourmaline"],
    oils: ["Patchouli", "vetiver", "cedarwood", "cypress"],
    herbs: ["Dandelion root", "ginger", "burdock"],
    mantra: "LAM", planet: "Saturn",
    intentions: ["Safety", "survival", "grounding", "money basics", "home", "ancestral patterns"],
    imbalanceSigns: "Anxiety, financial chaos, ungrounded, dissociated from body",
  },
  {
    number: 2, name: "Sacral", sanskrit: "Svadhisthana", location: "Below navel",
    color: "Orange", element: "Water",
    stones: ["Carnelian", "orange calcite", "moonstone", "amber", "sunstone"],
    oils: ["Ylang-ylang", "jasmine", "sweet orange", "sandalwood"],
    herbs: ["Hibiscus", "damiana", "raspberry leaf"],
    mantra: "VAM", planet: "Moon",
    intentions: ["Pleasure", "creativity", "sexuality", "emotional flow", "sensuality"],
    imbalanceSigns: "Numbness, blocked creativity, sexual dysfunction, emotional flooding",
  },
  {
    number: 3, name: "Solar Plexus", sanskrit: "Manipura", location: "Above navel",
    color: "Yellow", element: "Fire",
    stones: ["Citrine", "tiger's eye", "yellow jasper", "pyrite", "sunstone"],
    oils: ["Lemon", "ginger", "frankincense", "rosemary"],
    herbs: ["Chamomile", "fennel", "ginger", "peppermint"],
    mantra: "RAM", planet: "Sun",
    intentions: ["Personal power", "will", "confidence", "identity", "decision-making", "leadership"],
    imbalanceSigns: "People-pleasing, lack of boundaries, digestive issues, ego inflation or collapse",
  },
  {
    number: 4, name: "Heart", sanskrit: "Anahata", location: "Center of chest",
    color: "Green", element: "Air",
    stones: ["Rose quartz", "green aventurine", "jade", "malachite", "emerald"],
    oils: ["Rose", "geranium", "ylang-ylang", "jasmine"],
    herbs: ["Rose", "hawthorn", "motherwort"],
    mantra: "YAM", planet: "Venus",
    intentions: ["Love", "compassion", "forgiveness", "grief", "self-love", "relationships"],
    imbalanceSigns: "Closed off, codependent, grief unprocessed, can't receive love",
  },
  {
    number: 5, name: "Throat", sanskrit: "Vishuddha", location: "Throat",
    color: "Blue", element: "Air/Ether",
    stones: ["Lapis lazuli", "aquamarine", "blue lace agate", "sodalite", "turquoise"],
    oils: ["Eucalyptus", "peppermint", "chamomile"],
    herbs: ["Sage", "peppermint", "slippery elm"],
    mantra: "HAM", planet: "Mercury",
    intentions: ["Communication", "truth-telling", "voice", "expression", "listening"],
    imbalanceSigns: "Can't speak up, oversharing, sore throat patterns, jaw tension",
  },
  {
    number: 6, name: "Third Eye", sanskrit: "Ajna", location: "Between eyebrows",
    color: "Indigo", element: "Light",
    stones: ["Amethyst", "lapis lazuli", "fluorite", "iolite", "sodalite"],
    oils: ["Frankincense", "sandalwood", "clary sage", "lavender"],
    herbs: ["Mugwort", "lavender", "blue lotus"],
    mantra: "OM", planet: "Moon",
    intentions: ["Intuition", "vision", "dream work", "divination", "insight", "inner sight"],
    imbalanceSigns: "Foggy thinking, can't trust intuition, headaches, disturbing dreams",
  },
  {
    number: 7, name: "Crown", sanskrit: "Sahasrara", location: "Top of head",
    color: "Violet", element: "Spirit/Ether",
    stones: ["Amethyst", "clear quartz", "selenite", "white moonstone"],
    oils: ["Frankincense", "sandalwood", "lotus", "myrrh"],
    herbs: ["Lotus", "frankincense resin"],
    mantra: "Silence",
    planet: "Saturn",
    intentions: ["Spiritual connection", "divine source", "surrender", "transcendence"],
    imbalanceSigns: "Spiritual nihilism, dissociation, materialism, lack of meaning",
  },
];

// ─── CANDLE COLORS ─────────────────────────────────────────────────────────────

export interface CandleColorCorrespondence {
  color: string;
  planet: string;
  element: string;
  intentions: string[];
}

export const CANDLE_COLORS: CandleColorCorrespondence[] = [
  { color: "White", planet: "Moon, Sun", element: "All", intentions: ["Universal", "purity", "clearing", "can substitute for any"] },
  { color: "Black", planet: "Saturn, Pluto", element: "Earth", intentions: ["Banishing", "protection", "shadow work", "absorption of negativity"] },
  { color: "Red", planet: "Mars, Sun", element: "Fire", intentions: ["Passion", "courage", "vitality", "sex", "action"] },
  { color: "Pink", planet: "Venus", element: "Water, Earth", intentions: ["Self-love", "gentle love", "romance", "friendship"] },
  { color: "Orange", planet: "Sun, Mars", element: "Fire", intentions: ["Joy", "creativity", "success", "attraction"] },
  { color: "Yellow", planet: "Mercury, Sun", element: "Air, Fire", intentions: ["Mental clarity", "communication", "learning", "joy"] },
  { color: "Green", planet: "Venus", element: "Earth", intentions: ["Money", "growth", "fertility", "healing"] },
  { color: "Blue", planet: "Jupiter, Mercury", element: "Water, Air", intentions: ["Communication", "peace", "healing", "truth"] },
  { color: "Purple", planet: "Jupiter, Saturn", element: "Spirit", intentions: ["Spiritual work", "wisdom", "psychic protection"] },
  { color: "Brown", planet: "Saturn", element: "Earth", intentions: ["Grounding", "home", "family", "animal magic"] },
  { color: "Gold", planet: "Sun", element: "Fire", intentions: ["Solar work", "abundance", "vitality", "masculine divine"] },
  { color: "Silver", planet: "Moon", element: "Water", intentions: ["Lunar work", "intuition", "feminine divine"] },
];

// ─── INTENT MAPPING ────────────────────────────────────────────────────────────

export type IntentCategory =
  | "release" | "call_in" | "grieve" | "decide" | "ground"
  | "banish" | "celebrate" | "heal" | "prepare" | "ancestors";

export interface IntentMapping {
  category: IntentCategory;
  label: string;
  function: string;
  defaultTemplates: string[];
  keywords: string[];
  planets: string[];
  chakras: string[];
}

export const INTENT_MAPPINGS: IntentMapping[] = [
  {
    category: "release", label: "Release / Let Go", function: "Releasing",
    defaultTemplates: ["burn", "bath"],
    keywords: ["let go", "release", "end", "break", "stop", "quit", "leave", "move on", "over it", "ex", "toxic", "habit", "pattern"],
    planets: ["Pluto", "Saturn", "Mars"], chakras: ["Root", "Heart"],
  },
  {
    category: "call_in", label: "Call In / Manifest", function: "Drawing in",
    defaultTemplates: ["candle", "vision_letter"],
    keywords: ["manifest", "attract", "call in", "want", "more", "abundance", "money", "love", "sexy", "job", "promotion", "luck"],
    planets: ["Jupiter", "Venus", "Sun"], chakras: ["Solar Plexus", "Heart", "Sacral"],
  },
  {
    category: "grieve", label: "Grieve / Process Loss", function: "Grief",
    defaultTemplates: ["body_release", "letter", "bath"],
    keywords: ["died", "death", "grief", "loss", "miss", "gone", "funeral", "passed", "mourning", "lost"],
    planets: ["Saturn", "Moon", "Pluto"], chakras: ["Heart", "Root"],
  },
  {
    category: "decide", label: "Decide / Clarify", function: "Decision",
    defaultTemplates: ["mirror", "candle"],
    keywords: ["decide", "choose", "choice", "confused", "clarity", "clear", "stuck", "which", "should i", "path", "direction"],
    planets: ["Mercury", "Saturn", "Sun"], chakras: ["Third Eye", "Solar Plexus"],
  },
  {
    category: "ground", label: "Ground / Regulate", function: "Grounding",
    defaultTemplates: ["body_release", "bath"],
    keywords: ["ground", "anxious", "overwhelm", "regulate", "calm", "settle", "panic", "stress", "center", "steady"],
    planets: ["Saturn", "Moon"], chakras: ["Root", "Sacral"],
  },
  {
    category: "banish", label: "Banish / Protect", function: "Banishing",
    defaultTemplates: ["candle_black", "altar"],
    keywords: ["banish", "protect", "ward", "shield", "remove", "negative", "toxic person", "curse", "cleanse", "clear energy"],
    planets: ["Saturn", "Mars", "Pluto"], chakras: ["Root", "Solar Plexus"],
  },
  {
    category: "celebrate", label: "Celebrate / Honor", function: "Celebration",
    defaultTemplates: ["altar", "candle"],
    keywords: ["celebrate", "honor", "thank", "grateful", "accomplished", "birthday", "milestone", "achievement", "won", "made it"],
    planets: ["Sun", "Jupiter", "Venus"], chakras: ["Heart", "Crown"],
  },
  {
    category: "heal", label: "Heal / Repair", function: "Healing",
    defaultTemplates: ["bath", "letter", "altar"],
    keywords: ["heal", "repair", "recover", "sick", "hurt", "wound", "broken", "mend", "body", "surgery", "illness"],
    planets: ["Moon", "Venus", "Neptune"], chakras: ["Heart", "Sacral", "Root"],
  },
  {
    category: "prepare", label: "Prepare for Event", function: "Courage / preparation",
    defaultTemplates: ["mirror", "candle", "body_release"],
    keywords: ["prepare", "tomorrow", "meeting", "interview", "conversation", "confront", "fire someone", "speech", "presentation", "test", "exam"],
    planets: ["Mars", "Sun", "Mercury"], chakras: ["Solar Plexus", "Throat"],
  },
  {
    category: "ancestors", label: "Connect to Ancestors", function: "Ancestor work",
    defaultTemplates: ["altar", "candle", "letter"],
    keywords: ["ancestor", "lineage", "heritage", "grandma", "grandpa", "roots", "family line", "tradition", "elders"],
    planets: ["Saturn", "Moon", "Pluto"], chakras: ["Root", "Crown"],
  },
];

// ─── RITUAL TEMPLATES ──────────────────────────────────────────────────────────

export interface RitualTemplate {
  id: string;
  name: string;
  bodyLevel: ("mostly_body" | "mostly_mind" | "both")[];
  requiredTools: string[];  // empty = no tools needed
  minMinutes: number;
  maxMinutes: number;
  bestMoonPhases: string[];
  description: string;
}

export const RITUAL_TEMPLATES: RitualTemplate[] = [
  {
    id: "candle",
    name: "The Candle Ritual",
    bodyLevel: ["mostly_mind", "both"],
    requiredTools: ["candle"],
    minMinutes: 10,
    maxMinutes: 60,
    bestMoonPhases: ["New Moon", "Full Moon", "Last Quarter"],
    description: "Candle + stone + oil, intention-based. Most versatile template.",
  },
  {
    id: "candle_black",
    name: "The Black Candle Banishing",
    bodyLevel: ["mostly_mind", "both"],
    requiredTools: ["candle"],
    minMinutes: 10,
    maxMinutes: 30,
    bestMoonPhases: ["Last Quarter", "Waning Crescent"],
    description: "Black candle for banishing, protection, shadow work.",
  },
  {
    id: "bath",
    name: "The Bath Ritual",
    bodyLevel: ["mostly_body", "both"],
    requiredTools: ["bath"],
    minMinutes: 15,
    maxMinutes: 60,
    bestMoonPhases: ["Last Quarter", "Waning Crescent", "Full Moon"],
    description: "Salt water + oil + stone beside tub. Best for releasing and self-love.",
  },
  {
    id: "burn",
    name: "The Burn Ritual",
    bodyLevel: ["mostly_mind", "both"],
    requiredTools: ["paper"],
    minMinutes: 10,
    maxMinutes: 30,
    bestMoonPhases: ["Last Quarter", "Waning Gibbous", "Full Moon"],
    description: "Write what you're releasing, burn it. Direct and cathartic.",
  },
  {
    id: "letter",
    name: "The Letter to Future Self",
    bodyLevel: ["mostly_mind"],
    requiredTools: ["paper"],
    minMinutes: 10,
    maxMinutes: 30,
    bestMoonPhases: ["New Moon", "Waxing Crescent"],
    description: "Write as if intention has already happened. Vision commitment.",
  },
  {
    id: "mirror",
    name: "The Mirror Practice",
    bodyLevel: ["mostly_mind", "both"],
    requiredTools: [],
    minMinutes: 5,
    maxMinutes: 15,
    bestMoonPhases: ["Full Moon"],
    description: "Eye contact with self. Self-acceptance, accountability, honesty.",
  },
  {
    id: "vision_letter",
    name: "The Vision Letter (New Moon)",
    bodyLevel: ["mostly_mind"],
    requiredTools: ["paper"],
    minMinutes: 15,
    maxMinutes: 60,
    bestMoonPhases: ["New Moon", "Waxing Crescent"],
    description: "New moon intention letter placed under stone on altar.",
  },
  {
    id: "body_release",
    name: "The Body-Based Release",
    bodyLevel: ["mostly_body", "both"],
    requiredTools: [],
    minMinutes: 5,
    maxMinutes: 15,
    bestMoonPhases: [],  // any phase
    description: "No tools. Stand, breathe, sound, move, release. Most accessible.",
  },
  {
    id: "altar",
    name: "The Altar Building",
    bodyLevel: ["both"],
    requiredTools: ["candle"],
    minMinutes: 30,
    maxMinutes: 60,
    bestMoonPhases: ["New Moon"],
    description: "Dedicated surface, four elements, personal items. Long-arc intentions.",
  },
];

// ─── ZODIAC SIGN TABLE ─────────────────────────────────────────────────────────

export interface ZodiacCorrespondence {
  sign: string;
  glyph: string;
  ruler: string;
  traditionalRuler: string;
  element: string;
  modality: string;
  bodyPart: string;
}

export const ZODIAC_SIGNS: ZodiacCorrespondence[] = [
  { sign: "Aries", glyph: "♈", ruler: "Mars", traditionalRuler: "Mars", element: "Fire", modality: "Cardinal", bodyPart: "Head, face" },
  { sign: "Taurus", glyph: "♉", ruler: "Venus", traditionalRuler: "Venus", element: "Earth", modality: "Fixed", bodyPart: "Throat, neck" },
  { sign: "Gemini", glyph: "♊", ruler: "Mercury", traditionalRuler: "Mercury", element: "Air", modality: "Mutable", bodyPart: "Lungs, arms, hands" },
  { sign: "Cancer", glyph: "♋", ruler: "Moon", traditionalRuler: "Moon", element: "Water", modality: "Cardinal", bodyPart: "Stomach, breasts" },
  { sign: "Leo", glyph: "♌", ruler: "Sun", traditionalRuler: "Sun", element: "Fire", modality: "Fixed", bodyPart: "Heart, spine" },
  { sign: "Virgo", glyph: "♍", ruler: "Mercury", traditionalRuler: "Mercury", element: "Earth", modality: "Mutable", bodyPart: "Digestion, intestines" },
  { sign: "Libra", glyph: "♎", ruler: "Venus", traditionalRuler: "Venus", element: "Air", modality: "Cardinal", bodyPart: "Kidneys, lower back" },
  { sign: "Scorpio", glyph: "♏", ruler: "Pluto", traditionalRuler: "Mars", element: "Water", modality: "Fixed", bodyPart: "Sex organs, elimination" },
  { sign: "Sagittarius", glyph: "♐", ruler: "Jupiter", traditionalRuler: "Jupiter", element: "Fire", modality: "Mutable", bodyPart: "Hips, thighs, liver" },
  { sign: "Capricorn", glyph: "♑", ruler: "Saturn", traditionalRuler: "Saturn", element: "Earth", modality: "Cardinal", bodyPart: "Knees, bones, teeth" },
  { sign: "Aquarius", glyph: "♒", ruler: "Uranus", traditionalRuler: "Saturn", element: "Air", modality: "Fixed", bodyPart: "Ankles, circulation" },
  { sign: "Pisces", glyph: "♓", ruler: "Neptune", traditionalRuler: "Jupiter", element: "Water", modality: "Mutable", bodyPart: "Feet, lymphatic" },
];

// ─── SAFETY RULES ──────────────────────────────────────────────────────────────

export const SAFETY_RULES = `
SAFETY GUARDRAILS — MANDATORY:

Pregnancy: Never recommend mugwort, clary sage, jasmine (until labor), rosemary oil, myrrh, comfrey, nutmeg in large amounts.
Medication: Never recommend St. John's wort if user has flagged any medication.
Pets at home: Never recommend tea tree oil diffusion if user has cats. Eucalyptus is also toxic to dogs and cats.
Skin sensitivity: Always specify "diluted" for cinnamon, ginger, oregano, clove, pepper essential oils.
Children under 6: No peppermint, eucalyptus, or rosemary diffusion.

Never recommend:
- Internal use of essential oils
- Burning toxic herbs (oleander, foxglove, etc.)
- Holding breath beyond standard breathwork
- Cold exposure beyond 30 seconds for heart conditions
- Fasting rituals beyond a single meal
- Isolation longer than the ritual itself

CRISIS LANGUAGE: If user input contains language indicating crisis (self-harm, suicidal ideation, "I want to die", "I can't keep going"), do NOT generate a ritual. Respond with care and direct to 988 Suicide & Crisis Lifeline.
`;

// ─── HELPER: Get today's day correspondence ────────────────────────────────────

export function getTodayDay(): DayCorrespondence {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = dayNames[new Date().getDay()];
  return DAYS_OF_WEEK.find(d => d.day === today)!;
}

// ─── HELPER: Parse intent from user text ───────────────────────────────────────

export function parseIntent(text: string): IntentMapping {
  const lower = text.toLowerCase();
  let bestMatch: IntentMapping = INTENT_MAPPINGS[0];
  let bestScore = 0;

  for (const mapping of INTENT_MAPPINGS) {
    let score = 0;
    for (const keyword of mapping.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.split(" ").length; // multi-word keywords score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = mapping;
    }
  }

  return bestMatch;
}

// ─── HELPER: Find matching templates ───────────────────────────────────────────

export function findMatchingTemplates(
  bodyLevel: "mostly_body" | "mostly_mind" | "both",
  tools: string[],
  minutes: number,
  intent: IntentMapping,
): RitualTemplate[] {
  // Get templates that match the intent's defaults
  const intentTemplateIds = new Set(intent.defaultTemplates);

  return RITUAL_TEMPLATES.filter(t => {
    // Must match body level
    if (!t.bodyLevel.includes(bodyLevel)) return false;
    // Must have required tools available (empty = no tools needed)
    if (t.requiredTools.length > 0 && !t.requiredTools.every(r => tools.includes(r))) return false;
    // Must fit in time
    if (t.minMinutes > minutes) return false;
    return true;
  }).sort((a, b) => {
    // Prefer intent-matched templates
    const aIntent = intentTemplateIds.has(a.id) ? 1 : 0;
    const bIntent = intentTemplateIds.has(b.id) ? 1 : 0;
    return bIntent - aIntent;
  });
}

// ─── HELPER: Build knowledge base prompt section ───────────────────────────────

export function buildKnowledgeBasePrompt(
  moonPhase: string,
  dayOfWeek: string,
  intent: IntentMapping,
): string {
  const day = DAYS_OF_WEEK.find(d => d.day === dayOfWeek) || getTodayDay();
  const moon = MOON_PHASES.find(m => m.phase === moonPhase) || MOON_PHASES[0];
  const chakra = CHAKRAS.find(c => intent.chakras.includes(c.name));
  const element = ELEMENTS.find(e => e.signs.some(s =>
    ZODIAC_SIGNS.find(z => z.sign === s)?.ruler === day.planet
  ));

  return `
CURRENT SKY:
- Moon phase: ${moon.phase} ${moon.emoji} — ${moon.energy}
  Best for: ${moon.bestFor.join(", ")}
  Ritual types: ${moon.ritualTypes.join(", ")}
- Day: ${day.day} (${day.planet} day)
  Colors: ${day.colors.join(", ")}
  Stones: ${day.stones.join(", ")}
  Herbs: ${day.herbs.join(", ")}
  Oils: ${day.oils.join(", ")}
  Best for: ${day.bestFor.join(", ")}
  Mood: ${day.mood}

INTENT: ${intent.label} — ${intent.function}
  Associated planets: ${intent.planets.join(", ")}
  Associated chakras: ${intent.chakras.join(", ")}

${chakra ? `PRIMARY CHAKRA: ${chakra.name} (${chakra.sanskrit})
  Color: ${chakra.color}, Element: ${chakra.element}
  Stones: ${chakra.stones.join(", ")}
  Oils: ${chakra.oils.join(", ")}
  Intentions: ${chakra.intentions.join(", ")}
` : ""}

CANDLE COLORS:
${CANDLE_COLORS.map(c => `- ${c.color}: ${c.intentions.join(", ")}`).join("\n")}

${SAFETY_RULES}
`;
}
