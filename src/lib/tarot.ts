/**
 * Tarot Card Database — all 78 cards with meanings, keywords, and spread definitions.
 */

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */

export type Suit = "major" | "wands" | "cups" | "swords" | "pentacles";

export interface TarotCard {
  id: string;                // e.g. "major-0", "wands-1", "cups-queen"
  name: string;              // e.g. "The Fool", "Ace of Wands"
  number: number;            // 0-21 for major, 1-14 for minor (11=Page,12=Knight,13=Queen,14=King)
  suit: Suit;
  arcana: "major" | "minor";
  uprightKeywords: string[];
  reversedKeywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  element?: string;          // Fire, Water, Air, Earth
  planet?: string;           // Astrological association
  zodiac?: string;           // Zodiac sign association
}

export interface SpreadPosition {
  name: string;
  description: string;
  x: number;   // 0-100 percentage for layout
  y: number;   // 0-100 percentage for layout
}

export interface TarotSpread {
  id: string;
  name: string;
  cardCount: number;
  description: string;
  whenToUse: string;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  revealed: boolean;
  positionIndex: number;
}

export interface OracleDeck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  price: number;           // in cents
  coverColor: string;      // gradient or hex
  previewCards: string[];   // sample card names
  purchased: boolean;
}

/* ═══════════════════════════════════════════
   Major Arcana (22 cards)
   ═══════════════════════════════════════════ */

const MAJOR_ARCANA: TarotCard[] = [
  {
    id: "major-0", name: "The Fool", number: 0, suit: "major", arcana: "major",
    uprightKeywords: ["new beginnings", "innocence", "spontaneity", "free spirit", "leap of faith"],
    reversedKeywords: ["recklessness", "fear of change", "naivety", "stagnation"],
    uprightMeaning: "A new journey is beginning and the universe is asking you to trust it. You don't need to have every answer right now — just take the first step with an open heart. The path will reveal itself as you walk it.",
    reversedMeaning: "Fear is holding you back from something that could change everything. Whether it's recklessness disguised as courage or genuine paralysis, something needs to shift. Ask yourself what you're really afraid of losing.",
    element: "Air", planet: "Uranus",
  },
  {
    id: "major-1", name: "The Magician", number: 1, suit: "major", arcana: "major",
    uprightKeywords: ["manifestation", "willpower", "resourcefulness", "skill", "concentration"],
    reversedKeywords: ["manipulation", "untapped potential", "trickery", "poor planning"],
    uprightMeaning: "You have all the tools you need right in front of you — and more than enough power to make something real. Channel your focus, trust your skill, and don't hesitate to act. The resources were always there; now it's time to use them.",
    reversedMeaning: "Your potential is calling but something inside you is blocking it — whether that's self-doubt, scattered energy, or someone else's influence. It's also possible you're using your skills in ways that aren't honest with yourself.",
    element: "Air", planet: "Mercury",
  },
  {
    id: "major-2", name: "The High Priestess", number: 2, suit: "major", arcana: "major",
    uprightKeywords: ["intuition", "mystery", "inner voice", "subconscious", "divine feminine"],
    reversedKeywords: ["secrets", "disconnected from intuition", "withdrawal", "silence"],
    uprightMeaning: "Your gut knows something your mind hasn't caught up to yet — and it's time to trust that knowing. The answers you're looking for aren't somewhere outside of you; they're already here, waiting in the silence. Quiet your mind and listen.",
    reversedMeaning: "You're ignoring a truth you already sense, or you've been hiding something from yourself. The silence that once felt peaceful has become isolating, and secrets are weighing heavier than the protection they offer.",
    element: "Water", planet: "Moon",
  },
  {
    id: "major-3", name: "The Empress", number: 3, suit: "major", arcana: "major",
    uprightKeywords: ["abundance", "nurturing", "fertility", "nature", "sensuality"],
    reversedKeywords: ["dependence", "smothering", "creative block", "neglect"],
    uprightMeaning: "Creation is flowing through you right now — whether that's literal birth or any new thing you're bringing to life. Abundance is available, but only if you nurture what you're growing with patience and care. Enjoy the beauty and sensuality of this season.",
    reversedMeaning: "Either you're not tending to what needs your attention, or someone is trying to nurture you in ways that feel suffocating. Creative energy feels stuck, blocked, or dependent on something outside yourself — it's time to reclaim your generative power.",
    element: "Earth", planet: "Venus",
  },
  {
    id: "major-4", name: "The Emperor", number: 4, suit: "major", arcana: "major",
    uprightKeywords: ["authority", "structure", "stability", "discipline", "leadership"],
    reversedKeywords: ["domination", "rigidity", "tyranny", "lack of control"],
    uprightMeaning: "It's time to take charge and build something lasting through clear structure and discipline. Step into your authority without apology — people need you to know what you want and lead with conviction. This is your moment to establish the foundation.",
    reversedMeaning: "Control is the issue now, whether you're wielding too much of it or have lost it entirely. Rigidity has replaced wisdom, or chaos has replaced structure — something needs to shift to bring things back into balance.",
    element: "Fire", zodiac: "Aries",
  },
  {
    id: "major-5", name: "The Hierophant", number: 5, suit: "major", arcana: "major",
    uprightKeywords: ["tradition", "conformity", "spiritual wisdom", "mentorship", "institutions"],
    reversedKeywords: ["rebellion", "subversion", "unorthodoxy", "questioning beliefs"],
    uprightMeaning: "There's real value in seeking wisdom from those who've walked the path before you — whether that's tradition, a mentor, or an established system. Sometimes the old way isn't just reliable; it's exactly what you need. Trust in the authority of experience.",
    reversedMeaning: "You're questioning the rules for good reason, and part of you needs to break free and find your own way. The established path doesn't fit who you're becoming, and forcing yourself into it is only delaying the inevitable.",
    element: "Earth", zodiac: "Taurus",
  },
  {
    id: "major-6", name: "The Lovers", number: 6, suit: "major", arcana: "major",
    uprightKeywords: ["love", "harmony", "partnership", "choices", "alignment"],
    reversedKeywords: ["disharmony", "imbalance", "misalignment", "bad choices"],
    uprightMeaning: "This is about choice as much as connection — choosing what feels true to your deepest values. A meaningful relationship, a commitment, or an important decision is asking for your honesty. When you choose from alignment, everything flows.",
    reversedMeaning: "Something is out of alignment in a relationship or choice you're facing — one person is giving more, values don't match, or you're choosing something that doesn't actually feel true. It's time for an honest conversation or a difficult decision.",
    element: "Air", zodiac: "Gemini",
  },
  {
    id: "major-7", name: "The Chariot", number: 7, suit: "major", arcana: "major",
    uprightKeywords: ["determination", "willpower", "victory", "control", "momentum"],
    reversedKeywords: ["lack of direction", "aggression", "no control", "obstacles"],
    uprightMeaning: "You're in the driver's seat and the momentum is yours to command. Push through whatever stands in your way with focused willpower and absolute determination. This is your time to take control and move forward with confidence.",
    reversedMeaning: "The reins have slipped from your hands and you've lost your direction — or opposing forces are pulling you in different directions. Without clear control, you'll keep spinning your wheels instead of advancing.",
    element: "Water", zodiac: "Cancer",
  },
  {
    id: "major-8", name: "Strength", number: 8, suit: "major", arcana: "major",
    uprightKeywords: ["courage", "inner strength", "patience", "compassion", "gentle power"],
    reversedKeywords: ["self-doubt", "weakness", "insecurity", "raw emotion"],
    uprightMeaning: "Real power isn't loud or forceful — it's patient, compassionate, and grounded in deep knowing. You have the inner strength to face what needs facing, not through aggression but through gentleness and courage combined. Trust the quiet power within.",
    reversedMeaning: "Self-doubt is eating away at your confidence, making you question whether you have what it takes. You're running on raw emotion instead of steady strength, and the insecurity is showing in ways you can't hide.",
    element: "Fire", zodiac: "Leo",
  },
  {
    id: "major-9", name: "The Hermit", number: 9, suit: "major", arcana: "major",
    uprightKeywords: ["introspection", "solitude", "inner guidance", "searching", "wisdom"],
    reversedKeywords: ["isolation", "loneliness", "withdrawal", "lost"],
    uprightMeaning: "Step back from the world and listen to what only silence can teach you. The answers you're seeking live within, and you can only find them by turning inward. This solitude isn't punishment — it's your path to truth.",
    reversedMeaning: "Isolation has become loneliness, and the inner work has turned into avoidance. You're either too withdrawn from the world or avoiding the reflection that's actually calling for your attention. It's time to reconnect — with yourself or with others.",
    element: "Earth", zodiac: "Virgo",
  },
  {
    id: "major-10", name: "Wheel of Fortune", number: 10, suit: "major", arcana: "major",
    uprightKeywords: ["change", "cycles", "fate", "luck", "turning point"],
    reversedKeywords: ["bad luck", "resistance to change", "breaking cycles", "stagnation"],
    uprightMeaning: "The wheel is turning whether you're ready or not, and change is coming — probably in ways you can't fully predict. This is a turning point where luck and timing are in your favor. Trust the cycle and ride the wave upward.",
    reversedMeaning: "You're fighting a natural cycle that's trying to shift, or you're stuck in a pattern that refuses to break. The luck seems to have run out, but maybe it's asking you to finally let go and move forward.",
    planet: "Jupiter",
  },
  {
    id: "major-11", name: "Justice", number: 11, suit: "major", arcana: "major",
    uprightKeywords: ["fairness", "truth", "law", "cause and effect", "accountability"],
    reversedKeywords: ["injustice", "dishonesty", "unfairness", "avoidance"],
    uprightMeaning: "The truth is surfacing and what's fair will have its say. What you've put out into the world is coming back to meet you — the consequences are real, and so is the justice. Be honest with yourself and others, because accountability is here.",
    reversedMeaning: "Something isn't fair or someone isn't being honest — including possibly yourself. You're avoiding an uncomfortable truth or waiting for someone else to own up when it's your turn to face what you've done.",
    element: "Air", zodiac: "Libra",
  },
  {
    id: "major-12", name: "The Hanged Man", number: 12, suit: "major", arcana: "major",
    uprightKeywords: ["surrender", "new perspective", "letting go", "pause", "sacrifice"],
    reversedKeywords: ["stalling", "resistance", "indecision", "needless sacrifice"],
    uprightMeaning: "Stop pushing and let yourself hang in this moment — it's uncomfortable, but it's asking for something real. Surrender isn't defeat; it's the exact shift in perspective you need to see the way forward. Pause here, let go of what you can't control, and trust the process.",
    reversedMeaning: "You're resisting a pause that's trying to happen, or sacrificing things for reasons that don't actually serve you. The hang-up is becoming a stalling point, and indecision is costing you more than any loss would.",
    element: "Water", planet: "Neptune",
  },
  {
    id: "major-13", name: "Death", number: 13, suit: "major", arcana: "major",
    uprightKeywords: ["endings", "transformation", "transition", "letting go", "rebirth"],
    reversedKeywords: ["resistance to change", "fear of endings", "stagnation", "holding on"],
    uprightMeaning: "Something must end for something new to begin — and that's not a failure, it's a rebirth. The version of you or your life that's dying has already served its purpose; let it go with gratitude. What emerges from this ending will be worth it.",
    reversedMeaning: "You're clinging to what's already finished, trying to resurrect something that needs to stay dead. The transformation is happening whether you accept it or not — resistance only makes it more painful.",
    element: "Water", zodiac: "Scorpio",
  },
  {
    id: "major-14", name: "Temperance", number: 14, suit: "major", arcana: "major",
    uprightKeywords: ["balance", "moderation", "patience", "harmony", "alchemy"],
    reversedKeywords: ["imbalance", "excess", "lack of harmony", "impatience"],
    uprightMeaning: "Find the middle path by blending opposites with patience and trust in the slow process. Balance isn't static — it's an active dance between extremes. Keep your eyes on harmony and you'll find the alchemy that transforms everything.",
    reversedMeaning: "Too much of one thing is throwing everything off balance — whether that's work, emotion, spending, or control. Impatience is pushing you toward extremes when what you need is moderation and time.",
    element: "Fire", zodiac: "Sagittarius",
  },
  {
    id: "major-15", name: "The Devil", number: 15, suit: "major", arcana: "major",
    uprightKeywords: ["shadow self", "attachment", "addiction", "materialism", "bondage"],
    reversedKeywords: ["liberation", "release", "breaking free", "reclaiming power"],
    uprightMeaning: "Something has a hold on you and it's time to face it directly — whether that's a shadow part of yourself, an addiction, a toxic pattern, or the chains of materialism. The trap isn't real; it's only as strong as your willingness to stay in it. Look it in the eye.",
    reversedMeaning: "You're breaking free from something that controlled you, and liberation is within reach. The chains are loosening because you're finally ready to reclaim your power and walk away from what never belonged to you.",
    element: "Earth", zodiac: "Capricorn",
  },
  {
    id: "major-16", name: "The Tower", number: 16, suit: "major", arcana: "major",
    uprightKeywords: ["sudden change", "upheaval", "revelation", "destruction", "awakening"],
    reversedKeywords: ["avoidance", "fear of change", "delayed disaster", "resisting breakdown"],
    uprightMeaning: "The structure is coming down because it was built on illusions and false foundations. This destruction is actually an awakening — painful but necessary for truth to emerge. What falls was meant to fall; what rises from the rubble will be real.",
    reversedMeaning: "You're trying to hold together something that needs to collapse, delaying the inevitable upheaval. The disaster is coming whether you prepare or not — fighting it only makes the fall harder.",
    element: "Fire", planet: "Mars",
  },
  {
    id: "major-17", name: "The Star", number: 17, suit: "major", arcana: "major",
    uprightKeywords: ["hope", "renewal", "inspiration", "serenity", "faith"],
    reversedKeywords: ["despair", "disconnection", "lack of faith", "hopelessness"],
    uprightMeaning: "After the storm comes clarity, and the light is real. Hope isn't naive — it's the knowing that comes when you've survived enough to trust you'll survive again. Healing is happening, and inspiration is guiding you toward something beautiful.",
    reversedMeaning: "You've lost faith or feel completely disconnected from purpose and meaning. The light is still there, but you can't see it yet — despair has blocked your vision. It's time to remember that hopelessness is a feeling, not a truth.",
    element: "Air", zodiac: "Aquarius",
  },
  {
    id: "major-18", name: "The Moon", number: 18, suit: "major", arcana: "major",
    uprightKeywords: ["illusion", "fear", "subconscious", "intuition", "shadow"],
    reversedKeywords: ["clarity", "releasing fear", "truth emerging", "confusion lifting"],
    uprightMeaning: "Things aren't what they seem and your instincts know the difference — trust them even as fear whispers lies. Navigate the fog by feeling your way through rather than looking for answers. What's hidden beneath the surface needs your attention.",
    reversedMeaning: "The confusion is finally clearing and truths that were buried are surfacing into light. What was hidden is coming to light, and the fear that seemed so real is dissolving now that you can see clearly.",
    element: "Water", zodiac: "Pisces",
  },
  {
    id: "major-19", name: "The Sun", number: 19, suit: "major", arcana: "major",
    uprightKeywords: ["joy", "success", "vitality", "warmth", "positivity"],
    reversedKeywords: ["temporary setback", "inner child wounded", "overly optimistic", "burnout"],
    uprightMeaning: "Everything is illuminated and this is your moment to bask in clarity, success, and genuine joy. Let yourself feel the warmth and celebrate without doubt. This is what you've been working toward, and it's real.",
    reversedMeaning: "The joy feels blocked or you're burning too bright and heading toward exhaustion. Success is there but it feels hollow, or the inner light has been dimmed by something that happened. Slow down and reconnect with what actually makes you happy.",
    element: "Fire", planet: "Sun",
  },
  {
    id: "major-20", name: "Judgement", number: 20, suit: "major", arcana: "major",
    uprightKeywords: ["reflection", "reckoning", "awakening", "purpose", "calling"],
    reversedKeywords: ["self-doubt", "refusal of calling", "harsh self-judgment", "avoidance"],
    uprightMeaning: "A moment of reckoning is here — answer the call that's been whispering to you. Own your past, learn from it, and rise into who you're actually meant to become. This awakening is your invitation to greatness; accept it.",
    reversedMeaning: "You're avoiding a necessary reckoning or being so hard on yourself about the past that you can't move forward. The calling is clear but self-doubt is drowning it out. You need to forgive yourself before you can answer what's asking for you.",
    element: "Fire", planet: "Pluto",
  },
  {
    id: "major-21", name: "The World", number: 21, suit: "major", arcana: "major",
    uprightKeywords: ["completion", "wholeness", "achievement", "fulfillment", "integration"],
    reversedKeywords: ["incompletion", "shortcuts", "unfinished business", "almost there"],
    uprightMeaning: "A cycle is complete and you've arrived at wholeness — celebrate what you've achieved and integrated. You've come full circle, and this moment of completion is yours to savor before the next journey begins. You did it.",
    reversedMeaning: "Something is unfinished and you're close but haven't quite crossed the threshold yet. You're taking shortcuts that will cost you later, or there's unfinished business that needs tending. The destination is visible but not quite reached.",
    element: "Earth", planet: "Saturn",
  },
];

/* ═══════════════════════════════════════════
   Minor Arcana Helper
   ═══════════════════════════════════════════ */

function minorCard(suit: "wands" | "cups" | "swords" | "pentacles", number: number, name: string, up: string[], rev: string[], upM: string, revM: string): TarotCard {
  return {
    id: `${suit}-${number}`, name, number, suit, arcana: "minor",
    uprightKeywords: up, reversedKeywords: rev, uprightMeaning: upM, reversedMeaning: revM,
    element: suit === "wands" ? "Fire" : suit === "cups" ? "Water" : suit === "swords" ? "Air" : "Earth",
  };
}

/* ═══════════════════════════════════════════
   Wands (Fire) — action, passion, creativity
   ═══════════════════════════════════════════ */

const WANDS: TarotCard[] = [
  minorCard("wands", 1, "Ace of Wands",
    ["inspiration", "new opportunity", "creative spark", "potential", "passion"],
    ["delays", "missed opportunity", "lack of motivation", "creative block"],
    "A burst of creative energy is calling to you — grab this opportunity and run with it. Your passion is alive and ready to be channeled into something real. The spark is there; all you have to do is feed the flame.",
    "The creative moment is stalled or you've let it slip away — something is blocking the flow of inspiration. The spark exists but it's not catching fire, and you're left wondering if the moment has passed."),
  minorCard("wands", 2, "Two of Wands",
    ["planning", "future vision", "decisions", "discovery", "progress"],
    ["fear of the unknown", "lack of planning", "playing it safe", "indecision"],
    "You're standing at the crossroads with vision in hand and you need to make a move. The future is calling and you can see two paths — now commit to one and start walking. Indecision is the only real danger here.",
    "Fear of the unknown is paralyzing you, or you haven't done the planning needed to move forward with conviction. You're playing it safe when the opportunity is asking for courage, and that hesitation is costing you momentum."),
  minorCard("wands", 3, "Three of Wands",
    ["expansion", "foresight", "momentum", "exploration", "growth"],
    ["delays", "frustration", "obstacles to progress", "limited vision"],
    "What you set in motion is expanding beyond what you imagined — your plans are gaining real momentum. The view is getting wider and bigger than you thought possible. Trust the trajectory and keep moving forward.",
    "Progress feels painfully slow and obstacles keep appearing where you expected clear path. The expansion you were counting on isn't happening, and frustration is setting in because something is blocking the growth."),
  minorCard("wands", 4, "Four of Wands",
    ["celebration", "homecoming", "harmony", "community", "milestone"],
    ["tension at home", "transition", "instability", "lack of support"],
    "You've reached a milestone worth celebrating — enjoy the stability and belonging you've built. This is a moment of harmony and community, a homecoming of sorts. Celebrate this foundation you've created.",
    "The stability feels shaky or there's tension beneath the surface — something isn't as secure or supportive as it looks. Home or community doesn't feel like a safe place, and the harmony is fractured by conflict or change."),
  minorCard("wands", 5, "Five of Wands",
    ["conflict", "competition", "tension", "disagreement", "struggle"],
    ["avoiding conflict", "inner tension", "compromise", "resolution"],
    "Egos are clashing and tension is high — but not every fight needs a winner. Find the productive friction and let the struggle sharpen you instead of divide you. The conflict is real but it doesn't have to be destructive.",
    "You're either avoiding necessary conflict or the tension is finally resolving after building for a while. The battle is winding down, and if you're willing to let go of the need to win, peace is possible."),
  minorCard("wands", 6, "Six of Wands",
    ["victory", "recognition", "confidence", "success", "public praise"],
    ["ego", "fall from grace", "private achievement", "self-doubt despite success"],
    "You've won and people notice — the recognition is real and you deserve it. Own the victory without letting praise inflate your ego or make you reckless. This is your moment to shine with genuine confidence.",
    "Success happened but the recognition didn't follow, or the praise went to your head in ways that feel hollow. The victory is real but something inside knows it's not as solid as it looks, or the fall from grace is coming."),
  minorCard("wands", 7, "Seven of Wands",
    ["perseverance", "defense", "standing your ground", "courage", "challenge"],
    ["overwhelmed", "giving up", "exhaustion", "losing ground"],
    "You're being tested and challenged from all sides — but hold your ground. The fight proves you're worth fighting for, and your perseverance in the face of opposition is the real victory. Stand firm and don't back down.",
    "The constant fighting is draining you and you're losing the will to continue. Exhaustion is setting in, and holding your position feels impossible when you're running on empty. Know when to defend and when to step back and rest."),
  minorCard("wands", 8, "Eight of Wands",
    ["speed", "momentum", "swift action", "movement", "progress"],
    ["delays", "frustration", "waiting", "scattered energy"],
    "Things are moving fast and momentum is building — don't overthink it. This is the time for swift action and forward motion. Ride the wave and trust that the speed will carry you to where you need to be.",
    "Everything feels stalled and the progress you expected isn't materializing. Frustration is building because the momentum has disappeared, and the waiting is harder than any action would be."),
  minorCard("wands", 9, "Nine of Wands",
    ["resilience", "persistence", "grit", "boundaries", "last stand"],
    ["exhaustion", "paranoia", "overwhelm", "stubbornness"],
    "You're bruised but not broken — one more push is all you need. The finish line is closer than it feels, and your grit and resilience have brought you this far. You can make it through if you hold the line just a little longer.",
    "You're running on empty and your defenses are so high that you're isolating yourself. Paranoia and exhaustion have distorted your vision, and the stubbornness that kept you going is now keeping you stuck. Rest before you break completely."),
  minorCard("wands", 10, "Ten of Wands",
    ["burden", "responsibility", "hard work", "overwhelm", "carrying too much"],
    ["release", "delegation", "burnout", "letting go of burdens"],
    "You're carrying too much and it's becoming unbearable — something has to give before you do. The weight you're bearing is real, but it's also not all yours to carry. Put down what doesn't belong to you.",
    "You're finally putting down what was never yours to carry, or you're about to. The burden is lifting and the relief is coming — delegation and release are finally possible."),
  minorCard("wands", 11, "Page of Wands",
    ["enthusiasm", "exploration", "discovery", "free spirit", "new ideas"],
    ["impatience", "lack of direction", "scattered energy", "hasty"],
    "Fresh enthusiasm and curiosity are alive in you — follow that energy toward discovery. A new creative direction is calling and your free spirit is meant to explore it. Stay open to the surprises the path brings.",
    "Excitement is there but focus isn't — all spark, no follow-through. The impatience is pushing you to start things you don't finish, and the lack of direction is scattering your energy in too many places at once."),
  minorCard("wands", 12, "Knight of Wands",
    ["action", "adventure", "impulsiveness", "energy", "passion"],
    ["recklessness", "haste", "scattered", "volatile temper"],
    "Bold action and fearless adventure are calling — charge ahead but keep enough awareness to avoid recklessness. Your passion is an asset if you channel it with intention. Move fast but not so fast you crash.",
    "You're moving without thinking, driven by impulse instead of wisdom. The passion is burning but it's consuming everything in its path — haste and volatility are creating chaos instead of progress."),
  minorCard("wands", 13, "Queen of Wands",
    ["confidence", "independence", "warmth", "determination", "vibrancy"],
    ["jealousy", "selfishness", "demanding", "insecurity masked by bravado"],
    "Radiant confidence and magnetic warmth — own your power without apology. You're independent and determined, and that energy is attractive to everyone around you. Let your vibrancy shine without needing approval.",
    "Insecurity is hiding behind a bold front, or confidence has curdled into control and jealousy. The warmth has become demanding, and the independence is really just isolation dressed up as strength."),
  minorCard("wands", 14, "King of Wands",
    ["leadership", "vision", "honor", "entrepreneurial", "bold decisions"],
    ["impulsiveness", "tyranny", "ruthlessness", "overbearing"],
    "Visionary leadership is your strength — you know what needs to happen and you have the fire to make it real. Your bold decisions and entrepreneurial spirit are inspiring others. Lead with vision and integrity intact.",
    "Power is being wielded without wisdom and leadership has become domination. Impulsiveness is replacing strategy, and the ruthlessness underneath the boldness is showing. Vision without restraint becomes tyranny."),
];

/* ═══════════════════════════════════════════
   Cups (Water) — emotions, relationships, intuition
   ═══════════════════════════════════════════ */

const CUPS: TarotCard[] = [
  minorCard("cups", 1, "Ace of Cups",
    ["new love", "compassion", "emotional beginning", "creativity", "intuition"],
    ["emotional loss", "blocked feelings", "emptiness", "repressed emotions"],
    "Your heart is opening to something new — whether that's love, deep compassion, or creative flow. The emotional gift is pouring in and you're ready to receive it. Let yourself feel the fullness of what's arriving.",
    "Something is blocking the emotional flow — feelings are dammed up inside and you're cut off from what wants to reach you. Walls have gone up, and the compassion and intuition that usually flow are frozen or turned inward as grief."),
  minorCard("cups", 2, "Two of Cups",
    ["connection", "partnership", "mutual attraction", "unity", "balance"],
    ["imbalance", "broken communication", "disconnection", "tension in relationship"],
    "A deep connection is real — mutual respect, attraction, and emotional balance between two people. This is partnership at its best, where both are giving and both are receiving equally. Honor the unity.",
    "One person is giving more than the other, or the communication has broken down in ways that feel impossible to repair. The balance that once existed has shifted, and disconnection is growing where intimacy used to be."),
  minorCard("cups", 3, "Three of Cups",
    ["celebration", "friendship", "community", "joy", "gathering"],
    ["overindulgence", "gossip", "isolation", "superficial connections"],
    "Joy shared is joy multiplied — celebrate with your people and feel the connection. Friendship is real and community is wrapping around you. This is the beauty of gathering with those who matter.",
    "The party has gone too far or the celebration has turned sour with gossip and superficiality. You're feeling left out of the circle, or the connections feel empty despite the gathering. Isolation lurks beneath the cheer."),
  minorCard("cups", 4, "Four of Cups",
    ["apathy", "contemplation", "dissatisfaction", "meditation", "reevaluation"],
    ["awareness", "acceptance", "renewed motivation", "seizing opportunity"],
    "You're bored or checked out, but something is being offered that you're not seeing because you're too busy sulking. The world isn't satisfying you right now — step back and look at what's actually available if you opened your eyes.",
    "The fog of apathy is lifting and awareness is returning. You're starting to see what was available all along, and acceptance is helping you move forward with new motivation. Opportunity is within reach if you reach back."),
  minorCard("cups", 5, "Five of Cups",
    ["grief", "loss", "regret", "disappointment", "mourning"],
    ["acceptance", "moving on", "finding peace", "forgiveness"],
    "You're focused on what's been lost — and yes, the grief is real. But look behind you; there are cups still standing, people still there, and life still waiting. The mourning is necessary, but it doesn't have to be the whole story.",
    "The grief is transforming into acceptance and you're finally turning around to face forward again. Forgiveness — of yourself and others — is making peace possible. The worst of the pain is becoming the beginning of healing."),
  minorCard("cups", 6, "Six of Cups",
    ["nostalgia", "innocence", "childhood memories", "reunion", "simplicity"],
    ["stuck in the past", "unrealistic memories", "naivety", "clinging"],
    "The past is calling — old memories, childhood feelings, or someone from before is resurfacing. There's innocence and simplicity in what's being remembered, and it's connecting you to a part of yourself worth honoring.",
    "You're romanticizing the past instead of living in the present, or clinging to how things used to be instead of accepting how things are now. Naivety about the past is keeping you from moving forward into something real."),
  minorCard("cups", 7, "Seven of Cups",
    ["fantasy", "illusion", "choices", "wishful thinking", "imagination"],
    ["clarity", "alignment", "overwhelm clearing", "choosing wisely"],
    "So many options but not all of them are real — separate fantasy from genuine opportunity. Imagination is beautiful but it can trick you if you're not careful. Look closely at what's actually possible versus what you're just wishing for.",
    "The fog of too many choices is clearing and you can finally see which options are worth your energy. Alignment is returning and you know which path is actually yours. The overwhelm is lifting and clarity is here."),
  minorCard("cups", 8, "Eight of Cups",
    ["walking away", "disillusionment", "seeking truth", "leaving behind", "courage to move on"],
    ["fear of change", "stagnation", "avoidance", "clinging to comfort"],
    "Something you once loved no longer fills you — and it takes real courage to walk away and seek something more true. The disillusionment is painful but also clarifying. You're brave enough to leave what's hollow.",
    "You know you need to leave but fear keeps you rooted in something that's already empty. Comfort, even when it's shallow, feels safer than the unknown. Stagnation is winning because you won't risk the walk away."),
  minorCard("cups", 9, "Nine of Cups",
    ["wish fulfillment", "contentment", "satisfaction", "gratitude", "emotional fulfillment"],
    ["complacency", "dissatisfaction", "materialism", "unfulfilled wishes"],
    "The wish card — what you wanted is here or arriving soon. Savor the satisfaction and let yourself feel the contentment of getting what you worked for. Gratitude is the only appropriate response right now.",
    "You got what you wanted but it doesn't feel like enough, or the wish hasn't manifested yet and you're beginning to wonder if it will. Complacency or dissatisfaction is showing you that the external wasn't what you actually needed."),
  minorCard("cups", 10, "Ten of Cups",
    ["harmony", "family", "emotional fulfillment", "happiness", "love"],
    ["broken family", "misalignment", "disconnection", "unmet emotional needs"],
    "Emotional wholeness — love, family, and a deep sense of home. This is the dream realized and the picture-perfect life actually being real because it's built on genuine connection. Celebrate the fulfillment.",
    "The picture-perfect life has cracks running through it, or the happiness is surface-level while emotional needs go unmet beneath. Family or connection feels broken, and the harmony is fractured by disconnection."),
  minorCard("cups", 11, "Page of Cups",
    ["creative opportunity", "curiosity", "intuitive message", "youthful love", "sensitivity"],
    ["emotional immaturity", "creative block", "escapism", "insecurity"],
    "An emotional or creative message is arriving — stay open and curious to what wants to come through you. Youth and sensitivity are gifts right now, not weaknesses. An intuitive spark is asking for your attention.",
    "Emotional sensitivity is working against you — you're either too guarded to feel or too reactive to think. Creative blocks are coming from fear, and escapism is more appealing than actually doing the work."),
  minorCard("cups", 12, "Knight of Cups",
    ["romance", "charm", "imagination", "idealism", "following the heart"],
    ["moodiness", "unrealistic expectations", "jealousy", "emotional manipulation"],
    "The romantic in pursuit — follow your heart, but keep one foot in reality. Charm and imagination are gifts if they're grounded in honesty. Idealism is beautiful when it's paired with genuine feeling.",
    "Charm without substance is covering up mood swings and unrealistic expectations. Emotions are being used as a tool rather than expressed honestly, and jealousy is poisoning what could be real."),
  minorCard("cups", 13, "Queen of Cups",
    ["compassion", "emotional security", "calm", "intuition", "nurturing"],
    ["emotional manipulation", "codependence", "insecurity", "overwhelm"],
    "Deep emotional intelligence — you see through people and hold space without judgment. Compassion is your strength and intuition is your guide. Nurture others from a place of emotional security within yourself.",
    "Your empathy is being exploited or you're losing yourself in other people's emotions. Codependence is disguising itself as compassion, and insecurity is hidden beneath the calm exterior you're maintaining."),
  minorCard("cups", 14, "King of Cups",
    ["emotional balance", "diplomacy", "calmness", "wisdom", "generosity"],
    ["emotional suppression", "manipulation", "moodiness", "volatility beneath surface"],
    "Mastery over emotions — calm waters on the surface with deep currents beneath. Your emotional wisdom and diplomacy are respected, and the generosity comes from a place of inner strength. Balance is your natural state.",
    "Emotions are being suppressed rather than managed — the calm exterior is hiding a storm that's building beneath. Manipulation or moodiness is the real story, and the volatility is catching up with the facade."),
];

/* ═══════════════════════════════════════════
   Swords (Air) — intellect, truth, conflict
   ═══════════════════════════════════════════ */

const SWORDS: TarotCard[] = [
  minorCard("swords", 1, "Ace of Swords",
    ["clarity", "truth", "breakthrough", "new idea", "mental clarity"],
    ["confusion", "miscommunication", "chaos", "harsh truths"],
    "A breakthrough in clarity is cutting through the confusion — see the truth and let it land. A new idea is arriving with the power to change everything. The mental fog is lifting and you can finally think straight.",
    "The truth is there but delivered harshly, or you can't see it clearly because confusion is still thick. Miscommunication is creating more chaos, and clarity feels impossible when there's so much noise."),
  minorCard("swords", 2, "Two of Swords",
    ["indecision", "stalemate", "difficult choice", "avoidance", "blocked emotions"],
    ["information overload", "lesser of two evils", "no right answer", "forced choice"],
    "You're stuck between two options and refusing to choose — but not choosing is still a choice. Both sides have merit, but you can't stay in this stalemate forever. One path requires your commitment, even if it feels incomplete.",
    "The decision is being forced and there's no good option visible — you're picking the lesser of two evils. Too much information is overwhelming you, and every choice feels wrong because none feel fully right."),
  minorCard("swords", 3, "Three of Swords",
    ["heartbreak", "grief", "sorrow", "painful truth", "betrayal"],
    ["recovery", "forgiveness", "releasing pain", "healing"],
    "Heartbreak is here and the truth hurts, but it's necessary. Feel the grief fully because that's how it moves through you instead of staying stuck. The sorrow is real but it doesn't last forever if you let yourself feel it.",
    "The worst of the pain is behind you now, though it doesn't feel like it yet. Healing has begun even in your suffering, and forgiveness is starting to become possible. Recovery is coming if you stop resisting it."),
  minorCard("swords", 4, "Four of Swords",
    ["rest", "recovery", "contemplation", "stillness", "retreat"],
    ["restlessness", "burnout", "refusing to rest", "forced recovery"],
    "Your mind needs rest — step back, recover, and let the mental noise settle. Stillness and contemplation are exactly what you need right now, not more action. Retreat is a strategic move, not a failure.",
    "You won't stop even though your body and mind are begging for it, and the cost is mounting. Burnout is setting in because you've refused the rest that's essential. Forced recovery is coming whether you choose it or not."),
  minorCard("swords", 5, "Five of Swords",
    ["conflict", "defeat", "winning at a cost", "dishonor", "betrayal"],
    ["reconciliation", "moving on", "forgiveness", "choosing peace"],
    "Someone won but everyone lost — was the victory worth the damage? Conflict has left you bruised, whether you're the victor or the vanquished. The fight took something from everyone, and the aftermath is heavier than the victory feels good.",
    "The fight is ending and it's time to drop the sword and make peace. Reconciliation is possible if you can let go of winning and choosing healing instead. Forgiveness — especially of yourself — is becoming an option."),
  minorCard("swords", 6, "Six of Swords",
    ["transition", "moving on", "leaving behind", "calm after storm", "mental shift"],
    ["resistance to change", "unfinished business", "baggage", "stuck in limbo"],
    "You're moving toward calmer waters and leaving the turbulent past behind. The hardest part was deciding to leave, and now the journey itself is bringing peace. A mental shift is happening that makes the transition feel possible.",
    "You're trying to move on but the past is still weighing down the boat — unfinished business and emotional baggage are keeping you stuck. You're in limbo, neither fully gone nor fully committed to staying. Let go of what's holding you down."),
  minorCard("swords", 7, "Seven of Swords",
    ["deception", "strategy", "stealth", "getting away with something", "shortcuts"],
    ["confession", "coming clean", "conscience", "getting caught"],
    "Someone is being clever but not honest — or you're trying to outsmart a situation instead of facing it directly. Shortcuts look appealing but they come with hidden costs. The deception might work for now, but it won't work forever.",
    "The deception is unraveling and the truth is catching up — your conscience is demanding that you come clean. Getting away with something was never really an option; it was just a matter of time. Confession is becoming inevitable."),
  minorCard("swords", 8, "Eight of Swords",
    ["trapped", "victim mentality", "self-imposed restriction", "helplessness", "overthinking"],
    ["freedom", "release", "empowerment", "new perspective"],
    "You feel trapped but the cage is mostly mental — the bindings are loose if you look closely. The restriction you're feeling is largely self-imposed, built by fear and overthinking. Open your eyes and see that you can step free.",
    "You're breaking free from limiting beliefs and realizing that the prison was always in your mind. A new perspective is making escape possible, and the empowerment that comes with releasing those old chains is real."),
  minorCard("swords", 9, "Nine of Swords",
    ["anxiety", "nightmares", "worry", "guilt", "mental anguish"],
    ["hope", "reaching out", "recovery", "worst is over"],
    "3am thoughts where everything spirals — the worry is eating you alive. Most of what you fear won't happen, but the mental anguish is real. Guilt is weighing on you in ways that need compassion, not punishment.",
    "The darkest night is passing and you're starting to see that your fear was worse than reality. Hope is returning and reaching out to others doesn't feel impossible anymore. The worst of the mental anguish is releasing."),
  minorCard("swords", 10, "Ten of Swords",
    ["rock bottom", "endings", "betrayal", "crisis", "painful conclusion"],
    ["recovery", "regeneration", "rising up", "worst is behind you"],
    "It's over and you've hit rock bottom — but rock bottom is also a foundation to rebuild on. This painful conclusion was necessary, even if it doesn't feel that way. From here, there's nowhere to go but up.",
    "You survived the worst and you're standing back up. What didn't kill you is making you stronger, and the recovery is beginning even if you can't feel it yet. The worst is truly behind you now."),
  minorCard("swords", 11, "Page of Swords",
    ["curiosity", "mental energy", "vigilance", "new ideas", "communication"],
    ["gossip", "hasty decisions", "deception", "all talk no action"],
    "Sharp mind and quick tongue — new ideas are flowing and curiosity is alive. Mental energy is high and communication is happening. Just remember to think before you speak and stay vigilant about who you trust.",
    "Words are being used carelessly — gossip, hasty judgments, and promises without follow-through. Deception is hiding in the chatter, and talking has replaced doing. All energy with no action is just noise."),
  minorCard("swords", 12, "Knight of Swords",
    ["ambition", "fast action", "determination", "direct communication", "assertive"],
    ["aggression", "impulsiveness", "no tact", "rushing in without thinking"],
    "Charging forward with conviction and determination — just make sure you're heading in the right direction. Direct communication and assertiveness are powerful if they're grounded in clear thinking. The ambition is real; use it wisely.",
    "You're moving so fast you're cutting people on the way — aggression is replacing assertiveness. The rushing in without thinking is causing damage, and the lack of tact is burning bridges. Slow down before the costs become irreversible."),
  minorCard("swords", 13, "Queen of Swords",
    ["clear boundaries", "independence", "direct communication", "intellectual power", "truth"],
    ["cold", "cruel", "bitter", "overly critical"],
    "Sharp mind, clear boundaries, and zero tolerance for dishonesty — respect is earned, not given. Your intellectual power is an asset and your directness is refreshing. Stand in your truth without needing anyone's permission.",
    "The sharp tongue has become cruel and clarity has become cruelty. Boundaries have turned into walls, and the independence is really just isolation. Critical judgment is cutting people down instead of protecting you."),
  minorCard("swords", 14, "King of Swords",
    ["intellectual authority", "truth", "ethics", "clear thinking", "fair judgment"],
    ["manipulation", "tyranny", "misuse of power", "cold rationality"],
    "The mind rules — clear, fair, and ethical. Logic is being used with integrity, and your intellectual authority is respected because it's grounded in wisdom. Fair judgment and truth are your guiding principles.",
    "Intellect without heart — power and logic are being wielded without empathy. Manipulation is hiding behind logic, and rationality has become an excuse for cruelty. The tyranny of being 'right' all the time is costing you everything that matters."),
];

/* ═══════════════════════════════════════════
   Pentacles (Earth) — material, work, finances
   ═══════════════════════════════════════════ */

const PENTACLES: TarotCard[] = [
  minorCard("pentacles", 1, "Ace of Pentacles",
    ["new financial opportunity", "prosperity", "abundance", "manifestation", "security"],
    ["missed opportunity", "scarcity mindset", "poor planning", "instability"],
    "A tangible new opportunity is arriving — money, career, health, security. Plant the seed and tend it with care; this has real potential to grow. The practical abundance is here if you're willing to invest the work.",
    "An opportunity slipped by or you're too focused on scarcity to see the abundance available. The mindset is blocking the manifestation, and without planning, instability will follow even if resources appear."),
  minorCard("pentacles", 2, "Two of Pentacles",
    ["balance", "juggling", "adaptability", "multitasking", "time management"],
    ["overwhelm", "disorganization", "dropping the ball", "financial stress"],
    "You're juggling multiple demands and staying flexible is your superpower right now. Adaptability is helping you keep everything moving, but know that you can't hold this balance forever. Manage your time and energy wisely.",
    "Too many balls are in the air and something is about to drop — overwhelm is setting in and disorganization is making it worse. Financial stress is mounting because you're trying to do everything at once without a clear strategy."),
  minorCard("pentacles", 3, "Three of Pentacles",
    ["teamwork", "collaboration", "skill", "craftsmanship", "building"],
    ["lack of teamwork", "disorganization", "poor quality", "lone wolf"],
    "Good work is being built through collaboration — your skills matter here and so do the skills of those around you. Craftsmanship and teamwork are creating something real. Trust the process and the people.",
    "The team isn't working together or you're trying to do everything alone — either way, quality suffers. Disorganization is costing you, and the lone wolf approach is producing subpar results. You need help to build something solid."),
  minorCard("pentacles", 4, "Four of Pentacles",
    ["security", "control", "conservation", "saving", "holding on"],
    ["greed", "materialism", "hoarding", "fear of loss"],
    "Holding tight to what you have makes sense for security, but don't strangle what needs to flow. Conservation and saving are smart, but attachment to control is costing you opportunities. Hold with an open hand.",
    "The grip is too tight and fear of losing is costing you more than any loss would. Greed and materialism have replaced security, and hoarding is replacing the wise conservation that once made sense. Let go before the holding destroys everything."),
  minorCard("pentacles", 5, "Five of Pentacles",
    ["hardship", "loss", "isolation", "worry", "financial struggle"],
    ["recovery", "end of hardship", "spiritual growth through loss", "finding support"],
    "A tough stretch — financial or physical hardship is real and the worry is justified. But help is available if you look up and ask for it — you don't have to walk this alone. The hardship is temporary, even though it feels eternal.",
    "The hard times are ending and you're finding your way back to solid ground. Support is arriving, and the loss is teaching you something you needed to know. Recovery is beginning and hope is returning."),
  minorCard("pentacles", 6, "Six of Pentacles",
    ["generosity", "charity", "giving and receiving", "balance of resources", "sharing"],
    ["strings attached", "debt", "one-sided generosity", "power imbalance through money"],
    "Generosity is flowing and both giving and receiving feel right — the exchange is balanced. Share what you have without keeping score, and receive what's offered without shame. Abundance circulates when both sides are honored.",
    "The giving has invisible strings attached or the balance of power is off — who really holds the purse and controls the relationship? Debt is building and one-sided generosity is creating an imbalance that will eventually break."),
  minorCard("pentacles", 7, "Seven of Pentacles",
    ["patience", "long-term view", "investment", "perseverance", "assessment"],
    ["impatience", "lack of reward", "bad investment", "wasted effort"],
    "You've planted the seeds and done the work — now wait and trust the process. Growth takes time, and patience is your investment in the future. The long-term view shows that this is worth the wait, even if the reward feels distant.",
    "The investment isn't paying off as expected and impatience is making you question whether to continue. Wasted effort is a possibility, and the lack of visible reward is discouraging. It's time to assess whether this is truly worth your continued investment."),
  minorCard("pentacles", 8, "Eight of Pentacles",
    ["skill development", "mastery", "dedication", "craftsmanship", "diligence"],
    ["perfectionism", "lack of motivation", "sloppy work", "dead-end effort"],
    "Head down, hands busy — you're building real skill through repetition and dedication. Mastery comes from diligence, and craftsmanship is your pride. This disciplined focus is creating something that will last.",
    "The work has become mindless or perfectionism is killing the joy of craft. Motivation is gone and the quality is slipping, or the effort feels like it's leading nowhere. Diligence without direction becomes a dead end."),
  minorCard("pentacles", 9, "Nine of Pentacles",
    ["abundance", "luxury", "self-sufficiency", "financial independence", "reward"],
    ["overworking", "superficial success", "financial dependence", "living beyond means"],
    "You've earned this — enjoy the independence, the comfort, the rewards of your labor. Self-sufficiency and financial security are real, not accidents. Savor the abundance without guilt and celebrate what you've built.",
    "The success looks good on the outside but something is hollow inside, or you're overworking to maintain an illusion. Financial independence is fragile because it's built on superficial means, and the spending is outpacing the income."),
  minorCard("pentacles", 10, "Ten of Pentacles",
    ["legacy", "inheritance", "family wealth", "long-term security", "establishment"],
    ["family disputes", "financial failure", "broken traditions", "loss of inheritance"],
    "Generational wealth and family legacy — what you build now lasts beyond you. Long-term security is solid and tradition carries weight. The establishment of something lasting is happening, and future generations benefit.",
    "Family money is causing conflict or traditions are breaking, and the legacy isn't the gift it should be. Financial failure is erasing what was built, or disputes are tearing apart what was once unified. The inheritance is tainted."),
  minorCard("pentacles", 11, "Page of Pentacles",
    ["ambition", "new venture", "studiousness", "opportunity", "goal setting"],
    ["lack of focus", "procrastination", "missed opportunity", "laziness"],
    "Eyes on the prize — a new goal or financial opportunity deserves your full attention and study. Ambition is calling and the opportunity is real. Apply yourself with discipline and the pay-off will come.",
    "The dream is there but the discipline isn't — all planning and no doing. Procrastination is killing the opportunity and laziness is winning over ambition. Focus needs to shift from dreaming to doing."),
  minorCard("pentacles", 12, "Knight of Pentacles",
    ["hard work", "reliability", "routine", "patience", "methodical progress"],
    ["stubbornness", "laziness", "boredom", "perfectionism stalling progress"],
    "Slow and steady — not exciting but absolutely effective. Consistency is your superpower right now and reliability is building respect. Methodical progress is the tortoise that wins the race; keep moving forward.",
    "Routine has become a rut and boredom is making you question the whole path. Stubbornness is keeping you locked in a pattern that isn't serving you anymore, and perfectionism is preventing any progress at all."),
  minorCard("pentacles", 13, "Queen of Pentacles",
    ["nurturing", "practicality", "abundance", "home", "financial security"],
    ["smothering", "work-life imbalance", "codependence", "neglecting self"],
    "Warm, grounded, and abundant — you create security and comfort for everyone around you. Practicality and nurturing go hand in hand, and home is where your abundance is shared. This is genuine care, not control.",
    "You're giving so much to others that you've neglected your own needs and boundaries. Work-life imbalance is costing you, and smothering is hiding beneath the nurturing. Codependence is disguising itself as care."),
  minorCard("pentacles", 14, "King of Pentacles",
    ["wealth", "business", "abundance", "discipline", "security"],
    ["greed", "materialism", "stubbornness", "financial mismanagement"],
    "Material mastery — wealth built through discipline, patience, and smart decisions. You know how to create security and abundance, and the respect you've earned is real. Lead with generosity, not just accumulation.",
    "Money has become the measure of everything — don't let wealth replace wisdom. Greed is distorting your judgment and materialism is making you hollow. Stubbornness about how things 'should be' is leading to poor decisions and loss."),
];

/* ═══════════════════════════════════════════
   Full Deck
   ═══════════════════════════════════════════ */

export const ALL_CARDS: TarotCard[] = [...MAJOR_ARCANA, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];

export function getCardById(id: string): TarotCard | undefined {
  return ALL_CARDS.find(c => c.id === id);
}

/**
 * Get the image path for a tarot card.
 * Returns the classic deck image if it exists, or null for missing cards.
 * Missing: major-3 (The Empress), major-8 (Strength), major-9 (The Hermit), major-10 (Wheel of Fortune)
 */
const MISSING_IMAGES = new Set<string>([]);

export function getCardImagePath(cardId: string): string | null {
  if (MISSING_IMAGES.has(cardId)) return null;
  return `/tarot/classic/${cardId}.webp`;
}

export const CARD_BACK_IMAGE = "/tarot/classic/backside.webp";

/* ═══════════════════════════════════════════
   Spreads
   ═══════════════════════════════════════════ */

export const SPREADS: TarotSpread[] = [
  {
    id: "single",
    name: "Daily Pull",
    cardCount: 1,
    description: "One card, one message. Your daily check-in with the deck.",
    whenToUse: "Every morning or whenever you need quick guidance.",
    positions: [
      { name: "The Message", description: "What the universe wants you to know today", x: 50, y: 50 },
    ],
  },
  {
    id: "three-card",
    name: "Past, Present, Future",
    cardCount: 3,
    description: "The classic three-card read. Where you've been, where you are, where you're headed.",
    whenToUse: "When you need a quick but meaningful overview of a situation.",
    positions: [
      { name: "Past", description: "What brought you here — the energy or event that set this in motion", x: 20, y: 50 },
      { name: "Present", description: "Where you are right now — the current energy surrounding you", x: 50, y: 50 },
      { name: "Future", description: "Where this is heading — the likely outcome if you stay on this path", x: 80, y: 50 },
    ],
  },
  {
    id: "yes-no",
    name: "Yes or No",
    cardCount: 3,
    description: "Three cards to answer a direct question. Majority upright = yes, majority reversed = no.",
    whenToUse: "When you have a specific yes/no question.",
    positions: [
      { name: "Factor 1", description: "The first energy weighing in on your question", x: 20, y: 50 },
      { name: "Factor 2", description: "The second energy weighing in", x: 50, y: 50 },
      { name: "Factor 3", description: "The deciding factor", x: 80, y: 50 },
    ],
  },
  {
    id: "five-card-cross",
    name: "The Cross",
    cardCount: 5,
    description: "A deeper look at a situation — what's at the center, what's influencing it from all sides.",
    whenToUse: "When three cards aren't enough but you don't need a full Celtic Cross.",
    positions: [
      { name: "The Heart", description: "The core of the situation — what this is really about", x: 50, y: 50 },
      { name: "What Crosses You", description: "The challenge or obstacle you're facing", x: 50, y: 25 },
      { name: "The Past", description: "What led to this moment", x: 20, y: 50 },
      { name: "The Future", description: "Where this is heading", x: 80, y: 50 },
      { name: "The Advice", description: "What the deck wants you to do about it", x: 50, y: 75 },
    ],
  },
  {
    id: "relationship",
    name: "Relationship Spread",
    cardCount: 6,
    description: "See both sides of a connection — what you bring, what they bring, and what's between you.",
    whenToUse: "When you want insight into a specific relationship dynamic.",
    positions: [
      { name: "You", description: "What you're bringing to this relationship right now", x: 25, y: 30 },
      { name: "Them", description: "What they're bringing to this relationship right now", x: 75, y: 30 },
      { name: "The Connection", description: "The energy between you — what binds you", x: 50, y: 50 },
      { name: "Your Challenge", description: "What you need to work on in this dynamic", x: 25, y: 70 },
      { name: "Their Challenge", description: "What they need to work on", x: 75, y: 70 },
      { name: "The Outcome", description: "Where this relationship is heading if things continue", x: 50, y: 85 },
    ],
  },
  {
    id: "horseshoe",
    name: "The Horseshoe",
    cardCount: 7,
    description: "A seven-card arc that maps a situation from past to outcome with practical guidance.",
    whenToUse: "When you want a comprehensive read without the intensity of a Celtic Cross.",
    positions: [
      { name: "The Past", description: "What happened to create this", x: 10, y: 70 },
      { name: "The Present", description: "Where you are now", x: 25, y: 40 },
      { name: "Hidden Influences", description: "What you can't see that's affecting things", x: 40, y: 20 },
      { name: "The Obstacle", description: "What stands in your way", x: 55, y: 20 },
      { name: "External Influences", description: "People or circumstances affecting the outcome", x: 70, y: 40 },
      { name: "The Advice", description: "What the deck recommends", x: 85, y: 70 },
      { name: "The Outcome", description: "Where this is heading", x: 50, y: 85 },
    ],
  },
  {
    id: "celtic-cross",
    name: "Celtic Cross",
    cardCount: 10,
    description: "The definitive spread. Ten cards that map every dimension of a situation — past, present, hopes, fears, and final outcome.",
    whenToUse: "When you need the full picture on a major question or life situation.",
    positions: [
      { name: "The Present", description: "The central theme — what this reading is really about", x: 35, y: 50 },
      { name: "The Challenge", description: "What's crossing you — the main obstacle or influence", x: 35, y: 35 },
      { name: "The Root", description: "The foundation — what's beneath the surface driving this", x: 35, y: 75 },
      { name: "Recent Past", description: "What just happened — the energy that's fading", x: 15, y: 50 },
      { name: "The Crown", description: "Your best possible outcome — what could happen", x: 35, y: 15 },
      { name: "Near Future", description: "What's coming next — the energy that's arriving", x: 55, y: 50 },
      { name: "Your Attitude", description: "How you see yourself in this situation", x: 80, y: 80 },
      { name: "External Influences", description: "How others and circumstances are affecting this", x: 80, y: 60 },
      { name: "Hopes & Fears", description: "What you secretly want and what you're afraid of", x: 80, y: 40 },
      { name: "The Outcome", description: "Where this all leads — the final card", x: 80, y: 20 },
    ],
  },
];

/* ═══════════════════════════════════════════
   Deck Shuffling & Drawing
   ═══════════════════════════════════════════ */

/** Fisher-Yates shuffle */
export function shuffleDeck(cards: TarotCard[]): TarotCard[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Draw n cards from a shuffled deck, with random reversed orientation */
export function drawCards(deck: TarotCard[], count: number): DrawnCard[] {
  return deck.slice(0, count).map((card, i) => ({
    card,
    reversed: Math.random() < 0.35, // ~35% chance of reversal, similar to real shuffling
    revealed: false,
    positionIndex: i,
  }));
}

/* ═══════════════════════════════════════════
   Oracle Deck Placeholders (for Store)
   ═══════════════════════════════════════════ */

export const ORACLE_DECKS: OracleDeck[] = [
  {
    id: "shadow-work",
    name: "Shadow Work Oracle",
    description: "36 cards designed to surface what you've been avoiding. Uncomfortable but transformative.",
    cardCount: 36,
    price: 499,
    coverColor: "linear-gradient(135deg, #1a0a2e, #4a1942)",
    previewCards: ["The Mirror", "The Wound", "The Mask", "The Surrender"],
    purchased: false,
  },
  {
    id: "lunar-guidance",
    name: "Lunar Guidance",
    description: "44 cards attuned to moon phases and emotional cycles. For when you need to feel, not think.",
    cardCount: 44,
    price: 499,
    coverColor: "linear-gradient(135deg, #0a1628, #1a3a5c)",
    previewCards: ["New Moon Rising", "Full Moon Clarity", "Waning Release", "Eclipse Rebirth"],
    purchased: false,
  },
  {
    id: "cosmic-messenger",
    name: "Cosmic Messenger",
    description: "40 cards channeling planetary energy into daily guidance. Each card is tied to a celestial body.",
    cardCount: 40,
    price: 599,
    coverColor: "linear-gradient(135deg, #1a0f0a, #3d2b1f)",
    previewCards: ["Saturn's Lesson", "Venus Rising", "Mercury Retrograde", "Jupiter's Gift"],
    purchased: false,
  },
];

/* ═══════════════════════════════════════════
   Suit metadata
   ═══════════════════════════════════════════ */

export const SUIT_INFO: Record<string, { name: string; element: string; theme: string; color: string }> = {
  major: { name: "Major Arcana", element: "Spirit", theme: "Life's big lessons and turning points", color: "#c9a84c" },
  wands: { name: "Wands", element: "Fire", theme: "Action, passion, creativity, willpower", color: "#d4764e" },
  cups: { name: "Cups", element: "Water", theme: "Emotions, relationships, intuition, love", color: "#5b8fa8" },
  swords: { name: "Swords", element: "Air", theme: "Intellect, truth, conflict, decisions", color: "#8b8fa3" },
  pentacles: { name: "Pentacles", element: "Earth", theme: "Material world, finances, health, work", color: "#7d9a6b" },
};
