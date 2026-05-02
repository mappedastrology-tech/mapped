/**
 * Ritual Suggestion Engine
 *
 * Generates light, grounded rituals based on:
 * - Current moon phase
 * - Day of the week (planetary ruler)
 * - Zodiac season
 * - Upcoming celestial events
 * - User's birth chart (optional bonus personalization)
 *
 * Vibe: cozy self-care meets mindful spirituality.
 * Nothing too witchy, no special supplies needed.
 */

import {
  type MoonPhaseInfo,
  type ZodiacSeason,
  type PlanetaryDay,
  type NakshatraInfo,
  type CelestialEvent,
  PHASE_CORRESPONDENCES,
  getDailyEnergy,
  getCurrentNakshatra,
} from "./celestialCalendar";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface Ritual {
  id: string;
  title: string;
  duration: string;       // "5 min" | "10 min" | "15 min" | "20 min"
  description: string;
  steps: string[];
  mood: "calm" | "energized" | "reflective" | "joyful" | "grounded" | "releasing";
  element: "fire" | "water" | "earth" | "air" | "spirit";
  source: string;         // what triggered this suggestion
  isPersonalized?: boolean;
}

export interface DailyRituals {
  featured: Ritual;
  moonRitual: Ritual;
  dayRitual: Ritual;
  seasonRitual: Ritual;
  personalRitual?: Ritual;  // only if chart data available
  nakshatraInsight: { nakshatra: NakshatraInfo; suggestion: string };
}

// ─── MOON PHASE RITUALS — modality-aware ────────────────────────────────────
// Steps dynamically include crystals, candles, oils, etc. based on user prefs

export type ModalityPrefs = Record<string, boolean>;

// Each phase has 3 rich steps. Each step has a base version and tool-enhanced
// fragments that get woven in when the user has those tools enabled.
// The result is always exactly 3 fleshed-out instructions — never a list of extras.

interface PhaseRitualData {
  title: string;
  description: string;
  mood: Ritual["mood"];
  element: Ritual["element"];
  // Each step: [base, { toolKey: enhanced clause }]
  // The function picks up to 1 tool per step and weaves it in.
  steps: [string, Record<string, string>][];
}

const PHASE_RITUALS: Record<MoonPhaseInfo["phase"], PhaseRitualData> = {
  "new": {
    title: "New Moon Intention Setting",
    description: "The sky is dark — perfect for planting seeds in your inner garden.",
    mood: "calm",
    element: "water",
    steps: [
      [
        "Find a quiet spot and dim the lights. Take 5 slow breaths until you feel your body settle — this is you arriving in the darkness of the new moon, where all things begin.",
        {
          candle: "Light a black or white candle beside you — black for the void of potential, white for the clean slate. Let it be the only light in the room.",
          oils: "Before you sit down, anoint your wrists and temples with frankincense oil. Breathe it in — it clears mental noise and opens the channel to your deeper knowing.",
          colors: "Dress the space in black, deep purple, or indigo — drape a scarf over your lamp, choose dark paper to write on. You're matching the void where seeds germinate unseen.",
        },
      ],
      [
        "Write down 3 intentions for this lunar cycle. Be specific enough to recognize when they arrive, but open enough to let them surprise you. Write what you want to feel, not just what you want to have.",
        {
          crystals: "Hold moonstone or black tourmaline in your non-dominant hand while you write. The moonstone opens your intuition to name what you truly want; the tourmaline keeps you grounded so you don't drift into fantasy.",
          chakra: "Place your free hand on the base of your spine — your root chakra. Breathe into that foundation. New intentions need stable ground beneath them, or they float away.",
          flowers: "Sip mugwort or chamomile tea while you write. Mugwort opens the dream channel and helps you access what's beneath the surface; chamomile softens any resistance you feel to wanting things.",
        },
      ],
      [
        "Read each intention aloud — hearing your own voice say it makes it real. Then fold the paper and place it somewhere you'll see it daily: your mirror, your nightstand, tucked in your wallet.",
        {
          rune: "On the back of the paper, draw the rune Berkano (ᛒ) — the birch rune of birth and new beginnings. It seals your intentions with the energy of emergence.",
          tarot: "Prop The Hermit card next to your intention paper. The Hermit reminds you that clarity comes from going inward — you don't need anyone else's permission to begin.",
        },
      ],
    ],
  },
  "waxing-crescent": {
    title: "First Step Momentum",
    description: "The tiniest sliver of light has appeared — your intentions need their first real-world action.",
    mood: "energized",
    element: "fire",
    steps: [
      [
        "Pull out your new moon intentions and read them. Which one makes your chest feel tight or excited? That's the one asking for attention. Pick it — not the easiest one, the one that's pulling.",
        {
          tarot: "Before you choose, pull a card or meditate on The Magician — the reminder that you already have everything you need to begin. The tools are in your hands. Trust that.",
          chakra: "Place your hand below your navel and take 3 breaths into your sacral center — this is where creative impulse lives. Let it warm up before you decide.",
        },
      ],
      [
        "Write down the smallest possible first action. Not the whole plan — just one thing you could do in the next 10 minutes that moves it forward. Make it embarrassingly small if you need to. The point is to break the seal.",
        {
          candle: "Light a pale yellow or green candle while you think — these are the colors of emergence and first growth. Let it burn beside you as you plan your move.",
          oils: "Diffuse lemon or sweet orange oil in your space. These scents cut through fog and bring optimistic, action-ready energy — exactly what a first step needs.",
          flowers: "Set fresh basil near where you're working. Basil carries the energy of abundance and courageous beginnings — it's been used to bless new ventures for centuries.",
        },
      ],
      [
        "Now do it. Send the text, open the document, lace up the shoes, make the call. Don't wait until you feel ready — momentum creates readiness, not the other way around. You just need the first push.",
        {
          crystals: "Put citrine in your pocket before you begin. It's the stone of motivation and manifestation — touch it any time resistance creeps in today. It reminds you that starting is the hardest part.",
          rune: "Trace the rune Kenaz (ᚲ) on your palm — the torch rune, creative fire, illumination. You're carrying the spark. Now let it catch.",
          colors: "Wear green or gold today. These are the colors of fresh growth and emerging light — visual momentum that signals to your subconscious: we're doing this.",
        },
      ],
    ],
  },
  "first-quarter": {
    title: "The Commitment Check-In",
    description: "Half-lit, half-dark — challenges are testing whether you really want this.",
    mood: "reflective",
    element: "air",
    steps: [
      [
        "Make yourself a warm drink and sit somewhere comfortable. Ask yourself honestly: what obstacles have shown up since the new moon? What's gotten in the way — external blocks, internal resistance, both? Name them without judgment.",
        {
          candle: "Light a red or orange candle — the colors of Mars, courage, decisive action. Let the warmth of the flame remind you that obstacles are not stop signs, they're tests of commitment.",
          oils: "Rub a drop of ginger or cinnamon oil between your palms and inhale before you start. These are push-through scents — they cut hesitation and warm your resolve from the inside.",
          flowers: "Brew ginger root tea instead of your usual. Ginger is a Mars herb — warming, courageous, forward-moving. Let it heat you up from the inside while you face what's hard.",
        },
      ],
      [
        "Write each obstacle down. Next to each one, write: \"This is teaching me…\" and finish the sentence honestly. Maybe it's teaching you patience. Maybe it's teaching you that you need help. Maybe it's teaching you this isn't the right goal after all. All answers are valid.",
        {
          crystals: "Hold carnelian or tiger's eye in your dominant hand while you write. Carnelian fires up courage to be honest; tiger's eye brings the focused confidence to see clearly without flinching.",
          chakra: "Place your free hand on your solar plexus — the spot above your navel where willpower lives. Breathe into it. Feel your determination solidify. You're allowed to be strong here.",
          rune: "Visualize the rune Jera (ᛃ) — the harvest rune, the slow turning of seasons. Your effort is building toward something even when you can't see it yet. Keep going.",
        },
      ],
      [
        "Now decide: recommit to your intentions as they are, or adjust them based on what you've learned. Both are powerful choices — changing course takes as much courage as staying the course. Once you decide, take one immediate action that proves your commitment.",
        {
          tarot: "Pull The Chariot and set it where you can see it. This is the card of willpower conquering obstacles — not through force, but through clear direction. You're in the driver's seat.",
          colors: "Wear red or bright orange today. Bold moves need bold energy — no pastels, no muting. Let the color on your body match the decisiveness in your mind.",
        },
      ],
    ],
  },
  "waxing-gibbous": {
    title: "Refinement Ritual",
    description: "Almost full — you can see the shape of what you've been building. Fine-tune, don't start over.",
    mood: "grounded",
    element: "earth",
    steps: [
      [
        "Look at your physical space — your desk, your room, your phone home screen. Does it reflect where you're headed, or where you've been? Notice what feels cluttered, stale, or misaligned. Your environment is a mirror of your inner state right now.",
        {
          candle: "Light a purple or deep blue candle — the colors of wisdom and careful discernment. Let it burn while you survey your space with fresh eyes. Purple invites you to see beyond the surface.",
          oils: "Diffuse lavender and sandalwood together. This combination creates calm focus — honest assessment without anxiety. You want clarity, not criticism.",
          colors: "Notice what colors surround you today. Introduce purple, indigo, or violet where you can — these are the frequencies of intuitive clarity, helping you see what's working and what isn't.",
        },
      ],
      [
        "Make 3 small adjustments. Tidy one thing, delete or remove one thing, rearrange one thing. These aren't random — choose changes that bring your space closer to who you're becoming. Small physical shifts create big energetic ones.",
        {
          crystals: "Hold amethyst while you work. It brings the mental clarity to distinguish what's serving you from what's just taking up space — physically and emotionally. Let it guide your editing eye.",
          chakra: "Touch gently between your eyebrows — your third eye — and ask: what am I not seeing? Breathe. Trust whatever answer surfaces, even if it surprises you.",
          flowers: "Burn garden sage or thyme as you move through your space. Sage clears stagnant energy; thyme sharpens the mind. Let the smoke carry away what belongs to an older version of your plans.",
        },
      ],
      [
        "Review your intentions from the new moon. What needs tweaking? Not overhauling — just adjusting. You're closer than you think. Write down any refinements and trust the momentum you've already built.",
        {
          rune: "Meditate on the rune Ansuz (ᚨ) — the rune of divine communication and refined understanding. It asks you to listen for subtle guidance. What's trying to tell you something?",
          tarot: "Sit with The Hermit card for a moment. Refinement comes through honest introspection — not comparison, not outside opinions. What does your inner wisdom say to adjust?",
        },
      ],
    ],
  },
  "full": {
    title: "Full Moon Release & Gratitude",
    description: "Maximum illumination — everything is visible, including what you need to let go of.",
    mood: "releasing",
    element: "water",
    steps: [
      [
        "Sit by a window where you can see or feel the moonlight, or go outside if you can. Take a few deep breaths and write down 5 things you're genuinely grateful for from this lunar cycle. Be specific — not \"my health\" but \"the walk I took Tuesday when everything clicked.\"",
        {
          candle: "Light a white or silver candle — full moon illumination in miniature. Let it be the only artificial light. You want to feel the fullness of this moment, bright and exposed.",
          oils: "Anoint your pulse points — wrists, temples, behind your ears — with rose or jasmine oil. These are scents of full bloom, completion, and self-love. You're marking this moment on your body.",
          colors: "Wear white or silver tonight. Full moon energy is about peak visibility — let yourself be seen, even if just by yourself. Set out white flowers if you have them.",
        },
      ],
      [
        "Now write what you're releasing. Habits that aren't serving you, grudges you're tired of carrying, worries that have overstayed their welcome, old stories you tell about yourself that aren't true anymore. Be ruthless and honest.",
        {
          crystals: "Hold selenite in one hand and rose quartz in the other while you write. Selenite connects you to lunar energy; rose quartz reminds you that releasing is an act of self-love, not punishment.",
          chakra: "Place your free hand on the crown of your head — your highest point of connection. Breathe into it. The full moon is peak illumination from above. Receive that clarity now.",
          rune: "When you're done writing, draw the rune Fehu (ᚠ) on your gratitude list — the abundance rune. It marks what has manifested. Your release list gets no rune — it's already leaving.",
        },
      ],
      [
        "Read your release list aloud — hearing it gives it weight and then lets it go. Tear the paper into small pieces, or burn it safely in a fireproof bowl. Take 5 deep breaths. You are lighter than you were 10 minutes ago.",
        {
          flowers: "Float rose petals in a bowl of water and set it on your windowsill in the moonlight. You're making moon water — use it tomorrow to cleanse your space, water plants, or add to a bath.",
          tarot: "Pull The Moon card and sit with its imagery for a moment. What does your intuition illuminate right now that your logical mind hasn't caught onto yet? Trust that knowing.",
        },
      ],
    ],
  },
  "waning-gibbous": {
    title: "Generosity & Integration",
    description: "The light is gently fading — what you've learned this cycle wants to be shared.",
    mood: "joyful",
    element: "air",
    steps: [
      [
        "Think about something you've learned or realized this cycle — a skill you've practiced, a life lesson that landed, a shift in how you see something. It doesn't have to be profound. Even small wisdom counts when it's honestly earned.",
        {
          candle: "Light a soft blue or purple candle — the colors of graceful transition. Let it burn beside you while you journal about what the full moon illuminated. What became clear that wasn't before?",
          chakra: "Place both hands on your heart and take 3 slow breaths. You're integrating. Feel the fullness of what you've received this cycle before you share any of it outward.",
          oils: "Diffuse lavender or chamomile — scents of calm settling. The intensity of the full moon is fading, and these help you process gently rather than clinging to the peak.",
        },
      ],
      [
        "Share what you've learned with someone today. A text telling a friend what clicked for you, a voice note about something you figured out, a real conversation where you're honest about what shifted. Teaching is how we solidify what we know.",
        {
          crystals: "Carry rose quartz with you today. Touch it when you share something or do something generous — it's the stone of compassionate giving. Let it remind you that sharing from fullness isn't depleting.",
          rune: "Before you share, meditate briefly on Dagaz (ᛞ) — the dawn rune of breakthrough and integration. Whatever became clear at the full moon, Dagaz helps you carry it forward into the next phase.",
          colors: "Wear soft blues or grays today — the colors of peaceful, graceful transition. Not mourning the fullness that's passing, but trusting the rhythm of release.",
        },
      ],
      [
        "Do one small generous act — buy someone's coffee, share a resource, send an encouraging message unprompted. Then pay attention: giving from a full cup makes you feel fuller, not emptier. That's the waning gibbous teaching.",
        {
          flowers: "Make chamomile or lavender tea and sip it slowly while you sit with whatever came up during the full moon. These are transition herbs — they help you process without rushing to the next thing.",
          tarot: "Reflect on the Temperance card — the angel pouring water between two cups. Integration and balance. How do you blend what you've just learned with who you already are?",
        },
      ],
    ],
  },
  "last-quarter": {
    title: "Clearing & Cord-Cutting",
    description: "Half-dark again — the cycle is winding down. Time to clear what's lingering.",
    mood: "releasing",
    element: "water",
    steps: [
      [
        "Pick one physical area that's been nagging at you — a cluttered drawer, a messy shelf, an overflowing inbox, that pile of clothes. Set a timer for 10 minutes and clear it with intention. You're not just tidying — you're making space for what comes next.",
        {
          candle: "Light a gray or dark blue candle while you work — the colors of closure and completion. As the wax melts, visualize it carrying away what you're releasing. When you're done clearing, blow it out deliberately.",
          oils: "Diffuse cedarwood or frankincense in the room while you clear. These are purification scents — used across traditions to mark endings and bless transitions. Let the air itself feel cleaner.",
          colors: "Wear black or dark earth tones while you do this work. The colors of compost — what decays becomes soil for the next cycle. You're not destroying, you're composting.",
        },
      ],
      [
        "While you clear the physical space, notice what emotional clutter surfaces. Resentments, guilt, obligations you've outgrown, relationships you're holding onto out of habit rather than love. Name them honestly — even just to yourself.",
        {
          crystals: "Hold black tourmaline or obsidian in your non-dominant hand while you think. These stones absorb what you're ready to let go of — they take the weight so you don't have to carry it anymore. Cleanse them in salt water when you're done.",
          chakra: "Press your feet firmly into the ground. Breathe into your root chakra and feel the earth beneath you. Releasing is not falling — the ground holds you steady while things leave.",
          rune: "Draw or visualize the rune Eihwaz (ᛇ) — the yew tree that stands between worlds, death and rebirth. You are in the passage between one cycle and the next. This is a sacred threshold.",
        },
      ],
      [
        "For each piece of emotional clutter you named, say aloud or silently: \"I'm releasing this. It served its purpose and it's done now.\" You don't have to feel complete closure — you just have to decide to stop carrying it. The rest will follow.",
        {
          flowers: "Burn cedar tips or light a cedarwood incense while you speak your releases. Cedar is the tree of purification across dozens of traditions — its smoke has been carrying away what's finished for thousands of years.",
          tarot: "Sit with The Hanged Man — the card of surrender and shifted perspective. What would change if you stopped fighting this release and simply let it fall away? The Hanged Man says: the struggle is optional.",
        },
      ],
    ],
  },
  "waning-crescent": {
    title: "Sacred Rest",
    description: "The final sliver before darkness — your body and soul need rest. Be empty so you can receive what's next.",
    mood: "calm",
    element: "water",
    steps: [
      [
        "Cancel or postpone one unnecessary thing today — a meeting that could be an email, an errand that can wait, a social obligation you're dreading. Guard your energy. The waning crescent is the exhale before the next inhale, and exhales need space.",
        {
          candle: "If you light a candle at all tonight, make it deep indigo and sit in near-darkness with it. Or skip the candle entirely — the waning crescent asks for stillness and shadow, not illumination.",
          oils: "Draw a warm bath and add myrrh or sandalwood oil, or diffuse them in your bedroom before sleep. These are oils of spiritual completion — they signal to your nervous system that the cycle is closing and it's safe to rest.",
          colors: "Wear soft, dark things — deep indigo, black, dark purple. Cocoon energy. You are the caterpillar right now, not the butterfly. That's not failure, it's preparation.",
        },
      ],
      [
        "Lie down somewhere comfortable — bed, couch, floor with a blanket. No phone. Do a slow body scan: notice your feet, your calves, your thighs, your belly, your chest, your arms, your face, the crown of your head. Wherever you find tension, breathe into it and let it soften.",
        {
          crystals: "Place amethyst or lepidolite under your pillow or hold one on your chest while you rest. Both support dream work and surrender — they help your subconscious process what your waking mind has been too busy to sort through.",
          chakra: "Trail your hand slowly from the crown of your head down to your heart. You're integrating everything this cycle brought — pulling wisdom down from the top and settling it into your core. Crown to heart, sky to body.",
          flowers: "Brew passionflower or mugwort tea before you lie down. Passionflower eases the grip of a mind that won't stop planning; mugwort opens the dream channel so your sleep can do the deeper processing.",
        },
      ],
      [
        "Let your mind wander completely free — no directing, no planning, no solving. Whatever surfaces is processing. When you feel ready (no rush), whisper to yourself what you hope the next cycle brings. Keep it simple. Then rest.",
        {
          rune: "Meditate on the rune Isa (ᛁ) — a single vertical line. Ice. Stillness. The sacred pause. Nothing needs to move right now. Nothing needs to be decided. You are allowed to simply be.",
          tarot: "Place The Star card by your bed where you can see it as you drift off. The Star is hope in the darkest sky — a reminder that even at the end of a cycle, light is returning. You are not lost.",
        },
      ],
    ],
  },
};

function getMoonRitual(moon: MoonPhaseInfo, modalities?: ModalityPrefs): Ritual {
  const data = PHASE_RITUALS[moon.phase];
  const m = modalities || {};

  // Tool priority order — we pick at most 1 tool enhancement per step
  const toolPriority = ["candle", "crystals", "oils", "chakra", "rune", "flowers", "tarot", "colors"];
  // Map pref keys to the keys used in step enhancements
  const prefToKey: Record<string, string> = {
    candle: "candle", crystals: "crystals", oils: "oils",
    chakra: "chakra", rune: "rune", flowers: "flowers",
    tarot: "tarot", colors: "colors",
  };

  // Get enabled tools
  const enabledTools = toolPriority.filter((t) => m[t] !== false);

  // Build 3 steps — each gets at most 1 tool woven in
  const usedTools = new Set<string>();
  const steps = data.steps.map(([base, enhancements]) => {
    // Find the first enabled tool that has an enhancement for this step
    for (const tool of enabledTools) {
      const key = prefToKey[tool] || tool;
      if (!usedTools.has(key) && enhancements[key]) {
        usedTools.add(key);
        return base + " " + enhancements[key];
      }
    }
    return base;
  });

  return {
    id: `moon-${moon.phase}`,
    title: data.title,
    duration: "",
    description: data.description,
    steps,
    mood: data.mood,
    element: data.element,
    source: moon.label,
  };
}

// ─── DAY-OF-WEEK RITUALS ────────────────────────────────────────────────────

function getDayRitual(day: PlanetaryDay): Ritual {
  const rituals: Record<string, Ritual> = {
    "Sunday": {
      id: "day-sun",
      title: "Solar Self-Expression",
      duration: "10 min",
      description: "Sunday belongs to the Sun — your core self, your vitality, your creative fire. Today is for being unapologetically you.",
      steps: [
        "Stand in sunlight or near a window for a few minutes. Feel the warmth on your skin.",
        "Ask yourself: when was the last time I did something purely because it brought me joy?",
        "Do one thing today that's just for you. Not productive, not necessary — just joyful.",
        "Wear something that makes you feel like yourself."
      ],
      mood: "joyful",
      element: "fire",
      source: "Sun Day"
    },
    "Monday": {
      id: "day-moon",
      title: "Moon Day Check-In",
      duration: "10 min",
      description: "Monday is ruled by the Moon — your emotions, intuition, and inner needs. Start the week by checking in with how you actually feel.",
      steps: [
        "Before looking at your phone or to-do list, sit quietly for 2 minutes.",
        "Ask yourself: how am I feeling right now? Not how I should feel — how I actually feel.",
        "Write it down in one honest sentence. No judgment.",
        "Set one intention for the week that honors that feeling. If tired: \"I will rest when I need to.\" If excited: \"I will follow this energy.\""
      ],
      mood: "reflective",
      element: "water",
      source: "Moon Day"
    },
    "Tuesday": {
      id: "day-mars",
      title: "Mars Energy Activation",
      duration: "5 min",
      description: "Tuesday belongs to Mars — action, courage, and physical energy. This is your day to tackle something you've been avoiding.",
      steps: [
        "Identify the thing you've been putting off. You know the one.",
        "Set a 5-minute timer and just start. Don't aim for completion — aim for beginning.",
        "Move your body in some way: stretch, walk around the block, do 10 push-ups. Mars likes movement.",
        "Notice: courage isn't the absence of fear. It's starting anyway."
      ],
      mood: "energized",
      element: "fire",
      source: "Mars Day"
    },
    "Wednesday": {
      id: "day-mercury",
      title: "Mercury Mind Clearing",
      duration: "10 min",
      description: "Wednesday is Mercury's day — communication, learning, and mental clarity. Clear the noise and sharpen your mind.",
      steps: [
        "Brain dump: set a timer for 3 minutes and write everything in your head. Don't organize — just empty.",
        "Read the list. Circle the 3 things that actually matter today.",
        "Send one message you've been meaning to send. Mercury rewards communication.",
        "Learn one new thing — a word, a fact, a skill. Feed your curiosity."
      ],
      mood: "energized",
      element: "air",
      source: "Mercury Day"
    },
    "Thursday": {
      id: "day-jupiter",
      title: "Jupiter Expansion",
      duration: "10 min",
      description: "Thursday belongs to Jupiter — growth, abundance, and big-picture thinking. Dream larger today.",
      steps: [
        "Close your eyes and imagine your life one year from now, assuming everything goes well. Be specific. What do you see?",
        "Write down the 3 most important elements of that vision.",
        "Do one generous thing: tip extra, share a resource, offer help without being asked.",
        "Jupiter rewards abundance thinking. Notice what you already have plenty of."
      ],
      mood: "joyful",
      element: "fire",
      source: "Jupiter Day"
    },
    "Friday": {
      id: "day-venus",
      title: "Venus Self-Care",
      duration: "15 min",
      description: "Friday is Venus's day — love, beauty, pleasure, and appreciation. Slow down and enjoy something today.",
      steps: [
        "Do one thing purely for sensory pleasure: light a candle, put on music you love, wear a texture that feels good.",
        "Look at yourself in the mirror and find 3 things you genuinely like. Say them out loud.",
        "Reach out to someone you care about, just to say you appreciate them.",
        "Eat something slowly and with full attention. Taste every bite."
      ],
      mood: "calm",
      element: "earth",
      source: "Venus Day"
    },
    "Saturday": {
      id: "day-saturn",
      title: "Saturn Structure",
      duration: "15 min",
      description: "Saturday belongs to Saturn — discipline, responsibility, and long-term foundations. Not punishing — purposeful.",
      steps: [
        "Look at your commitments and responsibilities. Are any out of alignment? Be honest.",
        "Clean or organize one area of your life that's been chaotic. Saturn loves order.",
        "Write down one long-term goal and one tiny step you can take this week toward it.",
        "Acknowledge yourself for the hard things you've done recently. Saturn rewards perseverance."
      ],
      mood: "grounded",
      element: "earth",
      source: "Saturn Day"
    },
  };

  return rituals[day.day];
}

// ─── ZODIAC SEASON RITUALS ───────────────────────────────────────────────────

function getSeasonRitual(season: ZodiacSeason): Ritual {
  const rituals: Record<string, Ritual> = {
    "Aries": { id: "season-aries", title: "Aries Season Fire Starter", duration: "5 min", description: "Aries season is about bold beginnings. The astrological new year is here — what are you going to do with all this initiating energy?", steps: ["Write one thing you've been wanting to start but haven't.", "Don't overthink it. Just write the first step.", "Do it today. Aries doesn't wait."], mood: "energized", element: "fire", source: "Aries Season" },
    "Taurus": { id: "season-taurus", title: "Taurus Grounding Practice", duration: "15 min", description: "Taurus season slows everything down. Your body wants comfort, nature, and stability. Listen to it.", steps: ["Go outside barefoot if you can. Feel the ground under your feet for 5 minutes.", "Cook or prepare food with your hands — nothing complicated. A salad, toast, tea.", "Sit somewhere comfortable and do nothing for 5 minutes. No phone. Just exist."], mood: "grounded", element: "earth", source: "Taurus Season" },
    "Gemini": { id: "season-gemini", title: "Gemini Curiosity Hour", duration: "10 min", description: "Gemini season lights up your mind. Follow every interesting thread. Ask questions. Talk to strangers.", steps: ["Pick a topic you know nothing about and read about it for 10 minutes.", "Text or call someone you haven't talked to in a while.", "Write down 3 questions you'd love to know the answer to."], mood: "joyful", element: "air", source: "Gemini Season" },
    "Cancer": { id: "season-cancer", title: "Cancer Nesting Ritual", duration: "20 min", description: "Cancer season turns your attention inward, toward home and emotional safety. Nurture yourself the way you nurture others.", steps: ["Make your bed extra cozy: clean sheets, extra pillows, whatever feels like a hug.", "Cook or order your ultimate comfort food. Eat it without screens.", "Call a family member or chosen family. Real voice, not text.", "Journal: what does safety feel like in your body?"], mood: "calm", element: "water", source: "Cancer Season" },
    "Leo": { id: "season-leo", title: "Leo Joy Practice", duration: "10 min", description: "Leo season is about play, creativity, and shining. Stop being so serious for a minute.", steps: ["Put on a song that makes you want to dance. Dance. Nobody's watching.", "Create something with zero pressure to be good: draw, sing, write, build with Legos.", "Compliment someone sincerely and watch their face light up. That's Leo energy."], mood: "joyful", element: "fire", source: "Leo Season" },
    "Virgo": { id: "season-virgo", title: "Virgo Simplify & Serve", duration: "15 min", description: "Virgo season wants to help, organize, and make things work better. Channel this into something useful.", steps: ["Pick one system in your life that's messy: your closet, your budget, your morning routine.", "Spend 15 minutes improving it. Not perfecting — improving.", "Do one small act of service for someone without being asked."], mood: "grounded", element: "earth", source: "Virgo Season" },
    "Libra": { id: "season-libra", title: "Libra Balance Ritual", duration: "15 min", description: "Libra season craves harmony. Where in your life are things off-balance?", steps: ["Draw a simple scale on paper. On one side write what's getting too much of your energy. On the other, too little.", "Choose one adjustment to make things more balanced this week.", "Do something beautiful: arrange flowers, curate a playlist, rearrange a shelf.", "Reach out to someone you've been meaning to reconnect with."], mood: "calm", element: "air", source: "Libra Season" },
    "Scorpio": { id: "season-scorpio", title: "Scorpio Depth Dive", duration: "20 min", description: "Scorpio season goes deep. The surface-level stuff won't satisfy right now. What's underneath?", steps: ["Sit in a dimly lit room. Light a candle if you have one.", "Journal prompt: what am I pretending is fine that actually isn't?", "Let whatever comes up exist without trying to fix it. Just witness.", "After 10 minutes, write one truth you've been avoiding. This is where transformation lives."], mood: "reflective", element: "water", source: "Scorpio Season" },
    "Sagittarius": { id: "season-sag", title: "Sagittarius Expansion Walk", duration: "15 min", description: "Sagittarius season wants to explore, learn, and break free from the routine. Get out of your comfort zone today.", steps: ["Take a different route than usual — to work, to the store, wherever.", "Start a conversation with someone you wouldn't normally talk to.", "Google one place you'd love to visit. Spend 5 minutes imagining being there.", "Ask yourself: what belief am I outgrowing?"], mood: "energized", element: "fire", source: "Sagittarius Season" },
    "Capricorn": { id: "season-cap", title: "Capricorn Foundation Setting", duration: "15 min", description: "Capricorn season is about building something that lasts. Time to get serious — but not joyless.", steps: ["Write down your top 3 goals for the next 3 months. Be realistic but ambitious.", "For each one, identify the one habit that would make it inevitable.", "Build that habit into your schedule right now. Put it in your calendar.", "Reward yourself for the discipline you've already shown this year."], mood: "grounded", element: "earth", source: "Capricorn Season" },
    "Aquarius": { id: "season-aqua", title: "Aquarius Vision Ritual", duration: "10 min", description: "Aquarius season is about the future, community, and doing things differently. Think bigger than yourself.", steps: ["Imagine the world 10 years from now, exactly as you'd want it. Write or draw what you see.", "Do one thing for your community today: volunteer info, share a resource, check on a neighbor.", "Break one small routine. Sit in a different chair, eat at a different time, take a new route."], mood: "energized", element: "air", source: "Aquarius Season" },
    "Pisces": { id: "season-pisces", title: "Pisces Dream Soak", duration: "20 min", description: "Pisces season dissolves boundaries and opens the imagination. Your dreams are louder right now. Listen.", steps: ["Take a bath or long shower. Add salt if you have it. Water is Pisces' domain.", "While soaking, let your mind go completely free. Don't direct your thoughts.", "Afterward, immediately write down whatever images, feelings, or ideas came up.", "Listen to music that moves you. Not background music — really listen."], mood: "calm", element: "water", source: "Pisces Season" },
  };

  return rituals[season.sign] || rituals["Aries"];
}

// ─── CHART-PERSONALIZED RITUAL ───────────────────────────────────────────────

interface ChartInfo {
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
}

const SIGN_ELEMENTS: Record<string, "fire" | "water" | "earth" | "air"> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

const SIGN_ABBREV_TO_FULL: Record<string, string> = {
  Ari: "Aries", Tau: "Taurus", Gem: "Gemini", Can: "Cancer",
  Leo: "Leo", Vir: "Virgo", Lib: "Libra", Sco: "Scorpio",
  Sag: "Sagittarius", Cap: "Capricorn", Aqu: "Aquarius", Pis: "Pisces",
};

function fullSign(s?: string): string {
  if (!s) return "";
  return SIGN_ABBREV_TO_FULL[s] || s;
}

function getPersonalRitual(chart: ChartInfo, season: ZodiacSeason): Ritual | undefined {
  if (!chart.sunSign && !chart.moonSign) return undefined;

  // Convert abbreviated sign names to full names
  const sun = fullSign(chart.sunSign);
  const moon = fullSign(chart.moonSign);
  const rising = fullSign(chart.risingSign);

  const moonElement = moon ? SIGN_ELEMENTS[moon] : null;
  const sunElement = sun ? SIGN_ELEMENTS[sun] : null;
  const seasonElement = season.element;

  // Check if user's chart harmonizes or clashes with current season
  const moonMatchesSeason = moonElement === seasonElement;
  const sunMatchesSeason = sunElement === seasonElement;

  if (moonMatchesSeason) {
    return {
      id: "personal-moon-harmony",
      title: `Your Moon in ${moon} is Home`,
      duration: "10 min",
      description: `The current ${season.sign} season shares the same ${seasonElement} element as your Moon sign. Your emotional instincts are amplified right now — trust your gut more than usual.`,
      steps: [
        `Your ${moon} Moon knows this energy well. What does your gut tell you to focus on right now?`,
        "Write a letter to your future self about what your intuition is saying.",
        "Do something that nourishes your emotional body: comfort food, music that moves you, or time with someone safe.",
      ],
      mood: "calm",
      element: seasonElement,
      source: `${moon} Moon + ${season.sign} Season`,
      isPersonalized: true,
    };
  }

  if (sunMatchesSeason) {
    return {
      id: "personal-sun-harmony",
      title: `Your Sun in ${sun} is Activated`,
      duration: "10 min",
      description: `${season.sign} season shares your Sun's ${seasonElement} element. This is your power season — you'll feel more like yourself than usual.`,
      steps: [
        "Set one bold goal for this season that aligns with who you really are.",
        "Do something today that makes you feel powerful and authentic.",
        `Your ${sun} energy is extra potent right now. Lean into what makes you unique.`,
      ],
      mood: "energized",
      element: seasonElement,
      source: `${sun} Sun + ${season.sign} Season`,
      isPersonalized: true,
    };
  }

  // Elements that challenge each other: fire/water, earth/air
  const challenging = (e1: string, e2: string) =>
    (e1 === "fire" && e2 === "water") || (e1 === "water" && e2 === "fire") ||
    (e1 === "earth" && e2 === "air") || (e1 === "air" && e2 === "earth");

  if (moonElement && challenging(moonElement, seasonElement)) {
    return {
      id: "personal-moon-challenge",
      title: `Navigating ${season.sign} Season with Your ${moon} Moon`,
      duration: "15 min",
      description: `Your ${moon} Moon (${moonElement}) and ${season.sign} season (${seasonElement}) have different rhythms. You might feel slightly out of sync — that's okay. This tension is creative.`,
      steps: [
        `When the ${seasonElement} energy feels overwhelming, return to what grounds your ${moon} Moon.`,
        moonElement === "water" ? "Let yourself feel without judgment. Take a bath or sit by water." :
        moonElement === "fire" ? "Move your body. Dance, run, stretch — let the tension burn off." :
        moonElement === "earth" ? "Touch something natural: wood, stone, plants. Feel gravity holding you." :
        "Write, talk, or breathe deeply. Let air move through the stuckness.",
        "Journal: what is this season trying to teach me that my comfort zone wouldn't?",
      ],
      mood: "reflective",
      element: moonElement,
      source: `${moon} Moon navigating ${season.sign} Season`,
      isPersonalized: true,
    };
  }

  // Default personalized: rising sign ritual
  if (rising) {
    const risingDescriptions: Record<string, { vibe: string; strength: string; step: string }> = {
      Aries: { vibe: "People see you as bold, direct, and energizing — you walk into a room and things start moving.", strength: "Your natural confidence inspires others to act. You don't wait for permission.", step: "Stand tall, shoulders back. Take up space. You're the spark that gets things started today." },
      Taurus: { vibe: "People see you as steady, calming, and trustworthy — your presence makes others feel safe.", strength: "Your groundedness is a superpower in chaos. People lean on your stability.", step: "Feel your feet on the floor. Touch something solid. You're the anchor today — own that." },
      Gemini: { vibe: "People see you as quick, curious, and engaging — you light up conversations without trying.", strength: "Your ability to connect ideas and people is rare. Use your words intentionally today.", step: "Take a deep breath and ask yourself: what's the most interesting question I could explore today?" },
      Cancer: { vibe: "People see you as warm, nurturing, and emotionally perceptive — you notice what others miss.", strength: "Your emotional intelligence lets you read rooms instantly. Trust that gut feeling.", step: "Place your hand on your heart. You lead with care, not force — and that's exactly what's needed." },
      Leo: { vibe: "People see you as magnetic, generous, and radiant — you naturally draw attention and lift the energy.", strength: "Your warmth and expressiveness make people feel seen. That's leadership.", step: "Look in the mirror and remind yourself: your light doesn't diminish anyone else's. Shine fully today." },
      Virgo: { vibe: "People see you as thoughtful, precise, and genuinely helpful — you notice details others overlook.", strength: "Your ability to improve things is a gift. But remember: you don't have to fix everything.", step: "Pick one thing to do exceptionally well today. Let the rest be good enough." },
      Libra: { vibe: "People see you as graceful, fair, and socially attuned — you bring harmony wherever you go.", strength: "Your sense of balance and beauty creates spaces where people feel comfortable.", step: "Before your first interaction today, set the intention: 'I will be honest AND kind.'" },
      Scorpio: { vibe: "People see you as intense, perceptive, and magnetic — you make strong impressions without trying.", strength: "Your depth and emotional honesty cut through surface-level interactions.", step: "Look in the mirror. That intensity isn't too much — it's your power. Don't dilute it for comfort." },
      Sagittarius: { vibe: "People see you as adventurous, optimistic, and free-spirited — your enthusiasm is contagious.", strength: "Your ability to see the bigger picture keeps others from getting lost in the weeds.", step: "Ask yourself: what would make today feel like an adventure, even in a small way?" },
      Capricorn: { vibe: "People see you as capable, composed, and reliable — you carry yourself with quiet authority.", strength: "Your discipline and follow-through build trust that flashier people can't match.", step: "Set one clear goal for today. Write it down. You were built for this kind of focus." },
      Aquarius: { vibe: "People see you as original, independent, and forward-thinking — you don't follow the crowd.", strength: "Your unique perspective shows people possibilities they hadn't considered.", step: "Do one thing differently today — break a small routine. Your innovation lives in the unexpected." },
      Pisces: { vibe: "People see you as intuitive, creative, and deeply empathetic — you sense things before they're said.", strength: "Your imagination and compassion let you connect with anyone. That's rare.", step: "Place your hand on your heart and breathe. You absorb a lot — set the intention to carry only what's yours today." },
    };

    const rd = risingDescriptions[rising] || { vibe: "Your rising sign shapes how the world experiences you.", strength: "Your natural energy is a gift.", step: "Take 3 breaths and step into your day with intention." };

    return {
      id: "personal-rising",
      title: `Your ${rising} Rising`,
      duration: "5 min",
      description: rd.vibe,
      steps: [
        `Before you start your day, take 3 slow breaths. ${rd.strength}`,
        rd.step,
        "Set one intention for how you want to show up today. Not what you'll do — how you'll be.",
      ],
      mood: "grounded",
      element: SIGN_ELEMENTS[rising] || "spirit",
      source: `${rising} Rising`,
      isPersonalized: true,
    };
  }

  return undefined;
}

// ─── MAIN EXPORT: GET TODAY'S RITUALS ────────────────────────────────────────

export function getDailyRituals(date: Date, chart?: ChartInfo, modalities?: ModalityPrefs): DailyRituals {
  const energy = getDailyEnergy(date);
  const nakshatra = getCurrentNakshatra(date);

  const moonRitual = getMoonRitual(energy.moonPhase, modalities);
  const dayRitual = getDayRitual(energy.dayOfWeek);
  const seasonRitual = getSeasonRitual(energy.zodiacSeason);
  const personalRitual = chart ? getPersonalRitual(chart, energy.zodiacSeason) : undefined;

  // Featured ritual: pick based on what's most notable today
  let featured = moonRitual;
  if (energy.moonPhase.phase === "full" || energy.moonPhase.phase === "new") {
    featured = moonRitual; // full/new moon always takes priority
  } else if (energy.currentEvents.length > 0) {
    // Build a ritual from the current event
    const event = energy.currentEvents[0];
    featured = {
      id: `event-${event.id}`,
      title: event.name,
      duration: "15 min",
      description: event.description,
      steps: [event.ritualHint, "Take a moment to honor this day's significance across cultures.", "Journal: how does this energy resonate with where you are in life right now?"],
      mood: "reflective",
      element: event.element || energy.zodiacSeason.element,
      source: `${event.tradition.charAt(0).toUpperCase() + event.tradition.slice(1)} tradition`,
    };
  } else if (personalRitual) {
    featured = personalRitual;
  }

  // Nakshatra suggestion
  const nakshatraSuggestions: Record<NakshatraInfo["quality"], string> = {
    "Swift": "Move fast today — decisions, actions, and conversations will flow better if you don't overthink.",
    "Creative": "Make something. Cook, draw, write, arrange flowers. Your creative channel is wide open.",
    "Purifying": "Clean something — your space, your inbox, a relationship. Burn away what's dead weight.",
    "Nurturing": "Feed someone (including yourself). This is the most fertile and lush energy of the lunar cycle.",
    "Searching": "Follow your curiosity today. The question matters more than the answer.",
    "Stormy": "If emotions rise, let them. Tears are cleansing. Something needs to break through.",
    "Renewing": "Try again. Whatever you gave up on might have a second chance today.",
    "Nourishing": "This is considered the most auspicious day in Vedic astrology. Invest, commit, and nurture what matters.",
    "Mystical": "Trust your instincts. Something hidden wants to be found. Good for divination and dream work.",
    "Royal": "Claim your space. You have a right to be here. Connect with your ancestors.",
    "Joyful": "Rest and play. The universe is giving you permission to enjoy yourself.",
    "Friendly": "Reach out to someone who's helped you. Good for alliances and asking for support.",
    "Skillful": "Work with your hands. Whatever you craft today will have extra care in it.",
    "Brilliant": "Beauty and design are favored. Trust your aesthetic instincts today.",
    "Independent": "Do your own thing. Today favors independence and flexibility.",
    "Determined": "Lock in on one goal and push. You have extra willpower available.",
    "Devotional": "Deepen a bond. Show up for someone fully. Loyalty is rewarded.",
    "Protective": "Stand up for what's right. Leadership energy is strong, but watch for ego.",
    "Uprooting": "Get to the root of something. Shadow work and deep questions are favored.",
    "Invincible": "Start something you're serious about. Once you begin today, momentum carries you.",
    "Universal": "Play the long game. Patient, ethical action wins today.",
    "Listening": "Be quiet and listen. The universe has something to tell you.",
    "Rhythmic": "Find your groove. Music, dance, and financial moves are all favored.",
    "Healing": "Solitude heals today. Retreat if you can. Alternative approaches work well.",
    "Intense": "Go bold in your spiritual practice. Break through something that's been stuck.",
    "Deep": "Meditate. The deepest wisdom comes from stillness today.",
    "Gentle": "Wrap things up gracefully. This is a day for gentle endings and safe passages.",
  };

  return {
    featured,
    moonRitual,
    dayRitual,
    seasonRitual,
    personalRitual,
    nakshatraInsight: {
      nakshatra,
      suggestion: nakshatraSuggestions[nakshatra.quality] || "Trust the flow of the day.",
    },
  };
}

// ─── LEARNING CONTENT: HISTORY & HOW-TO ──────────────────────────────────────

export interface LearnArticle {
  id: string;
  title: string;
  category: "tarot-history" | "astrology-history" | "how-to" | "elements" | "zodiac" | "houses" | "planets";
  preview: string;
  content: string[];  // paragraphs
}

export const LEARN_ARTICLES: LearnArticle[] = [
  // ── ELEMENTS ──
  {
    id: "elem-fire",
    title: "Fire Signs: Aries, Leo, Sagittarius",
    category: "elements",
    preview: "The spark that starts everything",
    content: [
      "Fire is the first element — the spark of creation, the impulse to begin, the courage to act before thinking. Fire signs don't wait for permission. They move, they lead, they burn bright.",
      "Aries is the strike of a match — pure initiation. Leo is the sustained flame of a bonfire — warm, dramatic, impossible to ignore. Sagittarius is the wildfire — expansive, uncontainable, following its own path across the landscape.",
      "Fire signs at their best are inspiring, courageous, and generously warm. At their worst, they burn through people and situations without noticing the damage. The lesson of fire is learning that some things are worth the slow burn instead of the blaze.",
      "If you have a lot of fire in your chart, you probably have strong instincts, natural leadership ability, and a need for movement and freedom. Your challenge is patience and sensitivity to others' pace.",
    ],
  },
  {
    id: "elem-water",
    title: "Water Signs: Cancer, Scorpio, Pisces",
    category: "elements",
    preview: "The emotional depths beneath the surface",
    content: [
      "Water is feeling. It's the element that knows things before the mind does — intuition, empathy, the unspoken current running beneath every conversation.",
      "Cancer is the tide pool — protective, nurturing, holding life close. Scorpio is the deep ocean — transformative, powerful, hiding entire worlds beneath the surface. Pisces is the mist — dissolving boundaries, merging with everything, dreaming reality into new shapes.",
      "Water signs at their best are deeply compassionate, intuitive, and emotionally intelligent. At their worst, they can drown in feelings, manipulate through emotion, or lose themselves in other people's pain. The lesson of water is learning to feel everything without being consumed by it.",
      "If you have a lot of water in your chart, you probably absorb the emotions of those around you. Your gift is empathy and healing. Your challenge is maintaining boundaries and not losing yourself in others.",
    ],
  },
  {
    id: "elem-earth",
    title: "Earth Signs: Taurus, Virgo, Capricorn",
    category: "elements",
    preview: "The ground beneath your feet",
    content: [
      "Earth is what's real. It's the body, the material world, the tangible results of effort. Earth signs build things that last — relationships, careers, gardens, homes.",
      "Taurus is the fertile field — sensual, abundant, patient as the seasons. Virgo is the carefully tended garden — skilled, service-oriented, improving everything it touches. Capricorn is the mountain — ambitious, enduring, reaching toward something that matters.",
      "Earth signs at their best are reliable, grounded, and deeply practical. At their worst, they can be rigid, materialistic, or so focused on security that they miss life's spontaneous gifts. The lesson of earth is learning that stability doesn't require control.",
      "If you have a lot of earth in your chart, people trust you. You're probably good with your hands, your money, or your word. Your challenge is flexibility and trusting what can't be measured.",
    ],
  },
  {
    id: "elem-air",
    title: "Air Signs: Gemini, Libra, Aquarius",
    category: "elements",
    preview: "The invisible force connecting everything",
    content: [
      "Air is thought. It's communication, connection, and the space between things where meaning lives. Air signs process the world through ideas, language, and social interaction.",
      "Gemini is the conversation — quick, curious, connecting dots nobody else sees. Libra is the balance — seeking harmony, beauty, and justice in every interaction. Aquarius is the broadcast signal — visionary, humanitarian, thinking decades ahead.",
      "Air signs at their best are brilliant communicators, connectors, and thinkers who see patterns others miss. At their worst, they can be detached, scattered, or so in their head that they forget they have a body and feelings. The lesson of air is learning to land — to commit, to feel, to be present.",
      "If you have a lot of air in your chart, you're probably a natural communicator and thinker. Your challenge is grounding your ideas into action and not confusing thinking about feelings with actually feeling them.",
    ],
  },

  // ── HISTORY OF ASTROLOGY ──
  {
    id: "astro-history-origins",
    title: "Where Astrology Comes From",
    category: "astrology-history",
    preview: "5,000 years of looking up",
    content: [
      "Astrology is one of humanity's oldest knowledge systems. The earliest records come from ancient Mesopotamia around 3000 BCE, where Babylonian priests tracked planetary movements to predict seasonal floods, harvests, and political events.",
      "From Babylon, astrology spread to Egypt, Greece, India, and China — each culture developing its own sophisticated system. Hellenistic Greece gave us the 12-sign zodiac and house system we use in Western astrology today. India developed Jyotish (Vedic astrology), which uses sidereal calculations and the 27 nakshatras. China created an entirely different system based on years, elements, and animals.",
      "For most of human history, astrology and astronomy were the same discipline. Astronomers at the world's greatest courts were also astrologers. It wasn't until the European Enlightenment that the two formally separated.",
      "Today, astrology is experiencing a massive revival — not as a replacement for science, but as a symbolic language for understanding personality, timing, and the human experience. Whether you believe the planets cause events or simply mirror them, the patterns are remarkably consistent.",
    ],
  },
  {
    id: "astro-history-vedic",
    title: "Vedic Astrology (Jyotish)",
    category: "astrology-history",
    preview: "India's science of light",
    content: [
      "Jyotish means \"science of light\" in Sanskrit. It's one of the six Vedangas — auxiliary disciplines of the Vedas — making it at least 3,000 years old and possibly much older.",
      "Unlike Western astrology, Vedic astrology uses the sidereal zodiac, which tracks the actual current positions of constellations rather than the tropical seasons. This means your Vedic Sun sign might be different from your Western one.",
      "The nakshatra system divides the sky into 27 lunar mansions, each with its own deity, quality, and energy. This gives Vedic astrology a level of daily precision that Western astrology typically lacks. The Panchang (five-limbed calendar) tracks tithis (lunar days), nakshatras, yogas, and karanas to determine the quality of each day.",
      "Vedic astrology places special emphasis on karma, dharma, and spiritual evolution. The birth chart (Kundali) is seen not just as a personality map but as a roadmap of your soul's journey across lifetimes.",
    ],
  },
  {
    id: "astro-history-chinese",
    title: "Chinese Astrology",
    category: "astrology-history",
    preview: "Animals, elements, and cosmic balance",
    content: [
      "Chinese astrology is built on a different foundation than Western or Vedic systems. Instead of 12 monthly signs, it uses a 12-year animal cycle (Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig) combined with five elements (Wood, Fire, Earth, Metal, Water), creating a 60-year grand cycle.",
      "The system is deeply tied to Chinese philosophy — particularly the concepts of Yin and Yang and the flow of Qi (life force). Your birth year animal tells you about your personality and destiny, but the month, day, and hour animals add layers of nuance.",
      "Chinese astrology also integrates with feng shui, traditional medicine, and the I Ching. The concept of auspicious and inauspicious dates for weddings, business deals, and travel is still widely practiced across East Asia.",
      "The Lunar New Year — the most important holiday in Chinese culture — marks the beginning of a new animal/element year and is celebrated with rituals for cleansing the old and welcoming the new.",
    ],
  },

  // ── HISTORY OF TAROT ──
  {
    id: "tarot-history-origins",
    title: "Where Tarot Comes From",
    category: "tarot-history",
    preview: "From card game to cosmic mirror",
    content: [
      "Tarot began as a card game in 15th-century Italy called \"tarocchi.\" The original decks were hand-painted for wealthy families and used for a trick-taking game similar to bridge. The 22 trump cards (now called Major Arcana) were simply the highest-value cards.",
      "It wasn't until the 18th century that tarot became associated with divination and mysticism. French occultist Antoine Court de Gébelin claimed the cards contained hidden Egyptian wisdom, and from there, tarot became a tool for spiritual seekers, fortune tellers, and psychologists alike.",
      "The most famous tarot deck — the Rider-Waite-Smith, published in 1909 — was illustrated by Pamela Colman Smith under the direction of Arthur Edward Waite. Smith's vivid, symbolic imagery made the cards accessible to anyone, not just occult scholars.",
      "Today, tarot is used worldwide as a tool for self-reflection, creative inspiration, and psychological insight. Most readers see the cards not as fortune-telling devices but as mirrors — reflecting your own subconscious wisdom back to you.",
    ],
  },
  {
    id: "tarot-how-to-read",
    title: "How to Read Tarot Cards",
    category: "how-to",
    preview: "A beginner's guide to pulling cards",
    content: [
      "Reading tarot is simpler than most people think. You don't need psychic gifts or years of study. You need a deck, a question, and willingness to sit with whatever comes up.",
      "Start by shuffling while thinking about your question. When the deck feels ready (you'll know — it might fall, a card might pop out, or you'll just feel done), pull one card. Look at the image before reading any meanings. What do you notice? What feelings does it bring up? Your first impression matters more than the \"official\" meaning.",
      "The Major Arcana (0-21) represent big life themes and spiritual lessons. The Minor Arcana represent everyday situations: Cups are emotions, Wands are passion and action, Swords are thoughts and conflict, Pentacles are material reality and work.",
      "Reversed cards (upside-down) aren't bad — they usually mean the energy is blocked, internalized, or emerging. A reversed Tower might mean an internal shift rather than an external upheaval.",
      "The most important rule: there are no wrong interpretations. The cards are talking to you, not to a textbook. Trust what resonates and let go of what doesn't.",
    ],
  },
  {
    id: "how-to-read-chart",
    title: "How to Read a Birth Chart",
    category: "how-to",
    preview: "Making sense of the cosmic blueprint",
    content: [
      "A birth chart can look overwhelming at first — circles, lines, symbols, degrees. But the basics are surprisingly approachable.",
      "Start with the Big Three: your Sun sign (core identity), Moon sign (emotional nature), and Rising sign (how you appear to others). These three placements give you about 80% of the picture.",
      "Next, look at where your planets fall by house. The house tells you the life area. Sun in the 10th? Your identity is wrapped up in career and public image. Venus in the 4th? Love and beauty center around home and family.",
      "Then check for patterns: do most of your planets cluster in one area? That's where your life's action concentrates. Are there squares (90° angles)? Those are your growth challenges. Trines (120°)? Those are your natural gifts.",
      "Don't try to learn everything at once. Start with Sun, Moon, Rising. Then add one planet at a time. Within a few weeks, you'll be reading charts like it's second nature.",
    ],
  },
];
