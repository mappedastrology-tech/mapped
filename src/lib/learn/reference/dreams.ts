import type { ReferenceEntry } from "../types";

/**
 * Quick-reference dream-symbol lookup. Warm, confident readings drawn from the
 * traditions of dreamwork and depth psychology (Jung, Freud, folk dream-lore).
 * Dreams are deeply personal — these are common starting points, not verdicts.
 * Treat each entry as a doorway: the truest meaning is the one that resonates
 * with your own life when you sit with it.
 */

function dream(e: Omit<ReferenceEntry, "domain">): ReferenceEntry {
  return { domain: "dreams", ...e };
}

export const dreamReference: ReferenceEntry[] = [
  // ───────────────────────── Common scenarios ─────────────────────────
  dream({
    id: "dream-falling",
    name: "Falling",
    aka: ["falling dream", "free fall"],
    category: "Common scenario",
    summary:
      "One of the most universal dreams. Falling usually mirrors a loss of control, insecurity, or the feeling that something in waking life is slipping out from under you.",
    fields: [
      { label: "Often reflects", value: "Insecurity, overwhelm, fear of failure, or letting go of control you were gripping too tightly." },
      { label: "Ask yourself", value: "Where in my life do I feel unsupported, or like the ground has shifted?" },
      { label: "Variations", value: "A jolt awake (a hypnic jerk as you drift to sleep) is normal and harmless. Falling gracefully or landing softly can signal a surrender that's actually freeing." },
    ],
    tags: ["falling", "control", "insecurity", "letting go"],
  }),
  dream({
    id: "dream-flying",
    name: "Flying",
    aka: ["flying dream", "soaring"],
    category: "Common scenario",
    summary:
      "A buoyant, often euphoric dream tied to freedom, possibility, and rising above what once held you down. Many people read it as a sign of confidence and release.",
    fields: [
      { label: "Often reflects", value: "Liberation, ambition, a fresh sense of perspective, or breaking free of limits." },
      { label: "Ask yourself", value: "What have I outgrown, and where am I ready to rise?" },
      { label: "Variations", value: "Struggling to stay aloft can mirror self-doubt or fear of success; effortless soaring suggests you're stepping into your power." },
    ],
    tags: ["flying", "freedom", "ambition", "perspective"],
  }),
  dream({
    id: "dream-being-chased",
    name: "Being chased",
    aka: ["chased", "pursued"],
    category: "Common scenario",
    summary:
      "A classic anxiety dream. Being chased usually points to something you're avoiding — a feeling, a person, a decision — that's catching up with you.",
    fields: [
      { label: "Often reflects", value: "Avoidance, stress, or a problem you'd rather not turn and face." },
      { label: "Ask yourself", value: "What am I running from, and what would happen if I stopped and looked at it?" },
      { label: "Variations", value: "The identity of the pursuer matters — an animal, a stranger, or a shadowy figure often symbolizes the part of yourself or the fear you're fleeing." },
    ],
    tags: ["chased", "anxiety", "avoidance", "pursuit"],
  }),
  dream({
    id: "dream-teeth-falling-out",
    name: "Teeth falling out",
    aka: ["losing teeth", "crumbling teeth"],
    category: "Common scenario",
    summary:
      "An unsettling but very common dream, traditionally linked to anxiety about appearance, power, and how you're seen — your teeth being part of your smile, your bite, your voice.",
    fields: [
      { label: "Often reflects", value: "Worry about self-image, aging, loss, or feeling powerless to 'bite back' or speak up." },
      { label: "Ask yourself", value: "Where do I feel I'm losing face, footing, or my voice?" },
      { label: "Variations", value: "Folk traditions tie falling teeth to change and transition; some link it to communication you're holding back." },
    ],
    tags: ["teeth", "anxiety", "appearance", "loss", "voice"],
  }),
  dream({
    id: "dream-unprepared-exam",
    name: "Unprepared / failing an exam",
    aka: ["exam dream", "test dream", "showing up unprepared"],
    category: "Common scenario",
    summary:
      "Walking into a test you didn't study for, or a presentation you forgot. A signature performance-anxiety dream about being measured and found wanting.",
    fields: [
      { label: "Often reflects", value: "Self-doubt, fear of being judged, or feeling unready for something life is asking of you." },
      { label: "Ask yourself", value: "Where am I afraid of being 'tested,' and am I judging myself more harshly than anyone else would?" },
      { label: "Variations", value: "Often appears before real-life evaluations — a deadline, an interview, a new role. Frequently your competence is fine; it's your confidence that's wobbling." },
    ],
    tags: ["exam", "test", "anxiety", "unprepared", "judgment"],
  }),
  dream({
    id: "dream-naked-in-public",
    name: "Naked in public",
    aka: ["nudity dream", "exposed"],
    category: "Common scenario",
    summary:
      "Suddenly bare in front of others while no one else seems to notice. A dream about vulnerability, exposure, and the fear of being truly seen.",
    fields: [
      { label: "Often reflects", value: "Feeling exposed, judged, or unprepared — or a fear that others will see your 'real' self." },
      { label: "Ask yourself", value: "Where do I feel vulnerable or afraid of being found out?" },
      { label: "Variations", value: "If the nakedness feels freeing rather than shameful, it can signal authenticity and comfort in your own skin." },
    ],
    tags: ["naked", "nudity", "vulnerability", "exposure", "shame"],
  }),
  dream({
    id: "dream-missing-transport",
    name: "Missing a train or flight",
    aka: ["missed train", "missed flight", "missed the bus"],
    category: "Common scenario",
    summary:
      "Racing through a station only to watch the doors close. A dream of timing, missed opportunity, and the fear that life is moving on without you.",
    fields: [
      { label: "Often reflects", value: "Fear of missing out, regret, or worry that a window is closing on a goal or chance." },
      { label: "Ask yourself", value: "What opportunity am I afraid of missing — and is the timing really as urgent as it feels?" },
      { label: "Variations", value: "Sometimes it's a gentle nudge that you're on the wrong 'train' entirely and missing it would be a relief." },
    ],
    tags: ["train", "flight", "missed", "opportunity", "timing"],
  }),
  dream({
    id: "dream-cant-move",
    name: "Can't run or move",
    aka: ["frozen", "paralyzed in a dream", "stuck"],
    category: "Common scenario",
    summary:
      "Legs like lead, a scream that won't come out. Trying to move or shout and finding yourself stuck — often with a sleep-paralysis quality.",
    fields: [
      { label: "Often reflects", value: "Feeling trapped, powerless, or held back in waking life from acting or speaking." },
      { label: "Ask yourself", value: "Where do I feel paralyzed or unable to move forward?" },
      { label: "Variations", value: "This often overlaps with real sleep paralysis as the body's natural sleep 'muscle lock' lingers into waking — uncomfortable but harmless." },
    ],
    safety: "Sleep paralysis can be frightening but is medically harmless. If it's frequent and distressing, a doctor or sleep specialist can help — you deserve restful sleep.",
    tags: ["paralysis", "stuck", "frozen", "powerless", "sleep paralysis"],
  }),
  dream({
    id: "dream-losing-something",
    name: "Losing or forgetting something",
    aka: ["lost item", "can't find", "forgetting"],
    category: "Common scenario",
    summary:
      "Frantically searching for a wallet, a phone, a child, your way home. A dream about what feels precarious or neglected in your waking life.",
    fields: [
      { label: "Often reflects", value: "Anxiety about responsibilities, fear of loss, or a sense that you've misplaced part of yourself." },
      { label: "Ask yourself", value: "What feels lost or overlooked in my life right now?" },
      { label: "Variations", value: "What you're searching for is a clue — keys (access, solutions), a child (a vulnerable or new part of you), your way home (belonging)." },
    ],
    tags: ["losing", "forgetting", "searching", "loss"],
  }),
  dream({
    id: "dream-new-rooms",
    name: "Finding new rooms in a house",
    aka: ["hidden rooms", "secret rooms", "extra rooms"],
    category: "Common scenario",
    summary:
      "Discovering doors and whole wings you never knew your home had. A wonderful, expansive dream of untapped potential and unexplored parts of the self.",
    fields: [
      { label: "Often reflects", value: "Hidden talents, new possibilities, or aspects of yourself you're only beginning to discover." },
      { label: "Ask yourself", value: "What capacity or part of me is asking to be explored?" },
      { label: "Variations", value: "Dusty or unsettling rooms may hold neglected memories or feelings; bright, beautiful rooms hint at gifts waiting to be claimed." },
    ],
    tags: ["house", "rooms", "potential", "discovery", "self"],
  }),
  dream({
    id: "dream-drowning",
    name: "Drowning",
    aka: ["going under", "can't breathe underwater"],
    category: "Common scenario",
    summary:
      "Being pulled under and struggling for air. Because water often symbolizes emotion, drowning frequently points to feeling overwhelmed by your feelings.",
    fields: [
      { label: "Often reflects", value: "Being swamped by emotion, stress, or circumstances that feel like too much to keep up with." },
      { label: "Ask yourself", value: "What am I feeling overwhelmed by, and where could I come up for air?" },
      { label: "Variations", value: "Surfacing, being rescued, or learning you can breathe underwater can mark a turning point in mastering hard emotions." },
    ],
    safety: "If you feel like you're 'drowning' in waking life too, please reach out to someone you trust or a support line. You don't have to carry it alone.",
    tags: ["drowning", "water", "overwhelm", "emotion"],
  }),
  dream({
    id: "dream-car-out-of-control",
    name: "Car out of control",
    aka: ["brakes fail", "runaway car", "no brakes"],
    category: "Common scenario",
    summary:
      "Slamming brakes that don't work, a wheel that won't turn. The car is often you, and your control of it mirrors how steered you feel in your own life.",
    fields: [
      { label: "Often reflects", value: "A sense that life is speeding ahead without you at the wheel, or that you've lost your grip on a situation." },
      { label: "Ask yourself", value: "Where do I feel I'm not in the driver's seat of my own life?" },
      { label: "Variations", value: "Who's driving matters — if someone else is at the wheel, ask where you've handed your control away." },
    ],
    tags: ["car", "control", "driving", "brakes", "direction"],
  }),
  dream({
    id: "dream-recurring-nightmare",
    name: "Recurring nightmares",
    aka: ["repeating dream", "same nightmare"],
    category: "Common scenario",
    summary:
      "A dream that returns again and again, often the same scene. Recurring dreams usually flag an unresolved feeling or situation that's still waiting for your attention.",
    fields: [
      { label: "Often reflects", value: "An unprocessed worry, conflict, or wound that keeps knocking until it's acknowledged." },
      { label: "Ask yourself", value: "What does this dream keep trying to show me — and what would it mean to finally face it?" },
      { label: "Variations", value: "Recurring dreams often soften or stop once the underlying issue is named, felt, or resolved." },
    ],
    safety: "If nightmares are frequent and disrupting your sleep or mood, a therapist (especially one trained in trauma or imagery-rehearsal work) can genuinely help. Reaching out is a strength.",
    tags: ["recurring", "nightmare", "repeating", "unresolved"],
  }),
  dream({
    id: "dream-lucid",
    name: "Lucid dreaming",
    aka: ["aware in a dream", "conscious dreaming"],
    category: "Common scenario",
    summary:
      "Realizing, within the dream, that you're dreaming — sometimes with the power to shape what happens next. A state prized in many traditions for insight and creativity.",
    fields: [
      { label: "Often reflects", value: "Growing self-awareness, a desire for agency, or a mind ready to explore its inner landscape." },
      { label: "Ask yourself", value: "If I can shape this dream, what does that tell me about the waking choices I'm freer to make than I think?" },
      { label: "Variations", value: "Reality checks (looking at your hands, reading text twice) and a dream journal are traditional ways to cultivate lucidity." },
    ],
    tags: ["lucid", "awareness", "control", "consciousness"],
  }),

  // ───────────────────────── People & figures ─────────────────────────
  dream({
    id: "dream-ex-partner",
    name: "Ex-partner",
    aka: ["ex", "old flame", "former lover"],
    category: "People & figures",
    summary:
      "Dreaming of an ex rarely means you want them back. More often they represent a lesson, a feeling, or a quality from that chapter that's relevant to you now.",
    fields: [
      { label: "Often reflects", value: "Unfinished emotional business, a pattern repeating, or qualities (good or bad) you associate with that relationship." },
      { label: "Ask yourself", value: "What did that relationship teach me, and which of those themes is alive in my life today?" },
      { label: "Variations", value: "It can surface during new relationships as your mind compares and processes, not because you long to return." },
    ],
    tags: ["ex", "relationship", "love", "past", "closure"],
  }),
  dream({
    id: "dream-deceased-loved-one",
    name: "Deceased loved one",
    aka: ["dead relative", "visitation dream", "lost loved one"],
    category: "People & figures",
    summary:
      "A tender, sometimes deeply comforting dream. Many traditions see these as 'visitation' dreams; psychologically they're often part of grieving and staying connected.",
    fields: [
      { label: "Often reflects", value: "Grief, love that endures, a longing for guidance, or an ongoing bond that doesn't simply end." },
      { label: "Ask yourself", value: "What do I most want to say to them — or hear from them — and what is that need pointing to in me?" },
      { label: "Variations", value: "These dreams often bring peace and a sense of presence. Whether you read them as the psyche healing or a true visit, let them be a gift." },
    ],
    safety: "Grief dreams can stir up a lot. Be gentle with yourself, and lean on people who love you. Grief support groups and counselors are there if you want them.",
    tags: ["death", "grief", "visitation", "loved one", "loss"],
  }),
  dream({
    id: "dream-baby",
    name: "Baby",
    aka: ["infant", "newborn"],
    category: "People & figures",
    summary:
      "A baby in a dream is a classic image of new beginnings — a fresh project, a budding idea, or a vulnerable new part of yourself that needs care.",
    fields: [
      { label: "Often reflects", value: "New starts, creativity, innocence, or something tender and growing that you're responsible for nurturing." },
      { label: "Ask yourself", value: "What 'new life' am I bringing into being, and what does it need from me to thrive?" },
      { label: "Variations", value: "A crying or neglected baby can point to a need of your own you've been overlooking — something tender that's gone untended." },
    ],
    tags: ["baby", "new beginnings", "creativity", "innocence", "nurture"],
  }),
  dream({
    id: "dream-stranger",
    name: "Stranger",
    aka: ["unknown person", "someone you don't know"],
    category: "People & figures",
    summary:
      "An unfamiliar figure often represents an unknown or unrecognized part of yourself, or a new influence entering your life.",
    fields: [
      { label: "Often reflects", value: "An undiscovered side of you, a new possibility, or feelings you haven't yet 'put a face to.'" },
      { label: "Ask yourself", value: "What quality does this stranger carry, and could it be something I'm being invited to recognize in myself?" },
      { label: "Variations", value: "How you feel about the stranger — drawn in, wary, curious — colors the meaning." },
    ],
    tags: ["stranger", "unknown", "self", "new"],
  }),
  dream({
    id: "dream-shadowy-figure",
    name: "Shadowy figure",
    aka: ["dark figure", "shadow person", "menacing presence"],
    category: "People & figures",
    summary:
      "A dark, often menacing presence. In Jungian terms this is the 'shadow' — the disowned, hidden, or feared parts of yourself asking to be acknowledged.",
    fields: [
      { label: "Often reflects", value: "Repressed fears, anger, or traits you've pushed away — and, sometimes, hidden strength waiting to be reclaimed." },
      { label: "Ask yourself", value: "What part of myself am I afraid to look at — and what might it offer me if I did?" },
      { label: "Variations", value: "Turning toward the figure (in the dream or in reflection) often drains its menace. The shadow usually wants integration, not harm." },
    ],
    tags: ["shadow", "fear", "dark", "jung", "repressed"],
  }),
  dream({
    id: "dream-celebrity",
    name: "Celebrity",
    aka: ["famous person", "star"],
    category: "People & figures",
    summary:
      "Dreaming of a famous person usually isn't about them — it's about the qualities they embody for you, and your relationship to recognition and aspiration.",
    fields: [
      { label: "Often reflects", value: "Traits you admire or aspire to, a wish to be seen, or values you project onto that figure." },
      { label: "Ask yourself", value: "What does this person represent to me, and how might I cultivate that quality in my own life?" },
      { label: "Variations", value: "It can also touch on themes of status, validation, or comparison worth gently examining." },
    ],
    tags: ["celebrity", "fame", "aspiration", "recognition"],
  }),
  dream({
    id: "dream-faceless-person",
    name: "Faceless person",
    aka: ["no face", "blurred face", "featureless figure"],
    category: "People & figures",
    summary:
      "A figure with no clear face often represents an unknown identity, an undefined role, or a presence whose meaning you haven't yet pinned down.",
    fields: [
      { label: "Often reflects", value: "Uncertainty about who someone (or some part of you) really is, or a relationship/role that feels undefined." },
      { label: "Ask yourself", value: "Whose face is missing — and what is it about that person or part of me I can't yet 'see clearly'?" },
      { label: "Variations", value: "Faceless authority figures can point to vague pressures or expectations rather than one specific person." },
    ],
    tags: ["faceless", "unknown", "identity", "uncertainty"],
  }),

  // ───────────────────────── Animals ─────────────────────────
  dream({
    id: "dream-snake",
    name: "Snake",
    aka: ["serpent"],
    category: "Animals",
    summary:
      "One of the richest dream symbols. Snakes traditionally signal transformation, healing, and hidden wisdom — but also fear, temptation, or a 'snake in the grass.'",
    fields: [
      { label: "Often reflects", value: "Transformation and renewal (the shedding skin), healing, sexuality, or a fear/person you sense but can't quite see." },
      { label: "Ask yourself", value: "Is this a warning to heed, or an invitation to shed an old skin and renew myself?" },
      { label: "Variations", value: "Across cultures the snake spans danger and deep medicine — context and your feeling toward it tell you which face is showing." },
    ],
    tags: ["snake", "serpent", "transformation", "healing", "fear"],
  }),
  dream({
    id: "dream-spider",
    name: "Spider",
    aka: ["spiders", "web"],
    category: "Animals",
    summary:
      "Spiders weave webs, so they often symbolize creativity, fate, and the way you're 'weaving' your life — alongside the more obvious themes of feeling trapped or entangled.",
    fields: [
      { label: "Often reflects", value: "Creativity and patient craft, feeling caught in a 'web' (a sticky situation or relationship), or a powerful feminine/creative force." },
      { label: "Ask yourself", value: "Am I the weaver of my own web, or do I feel caught in one someone else has spun?" },
      { label: "Variations", value: "In many traditions the spider is a wise weaver of destiny; if spiders scare you, it may simply be amplifying ordinary anxiety." },
    ],
    tags: ["spider", "web", "creativity", "fate", "trapped"],
  }),
  dream({
    id: "dream-dog",
    name: "Dog",
    aka: ["dogs", "hound"],
    category: "Animals",
    summary:
      "Dogs classically represent loyalty, friendship, and protection. How the dog behaves often mirrors the state of your relationships and trust.",
    fields: [
      { label: "Often reflects", value: "Loyalty, companionship, protection, and your instincts about who's 'on your side.'" },
      { label: "Ask yourself", value: "Where do I need (or doubt) loyalty and protection in my life right now?" },
      { label: "Variations", value: "A friendly dog suggests trustworthy bonds; an aggressive one may flag a conflict or a loyalty that's been betrayed." },
    ],
    tags: ["dog", "loyalty", "friendship", "protection", "instinct"],
  }),
  dream({
    id: "dream-cat",
    name: "Cat",
    aka: ["cats", "kitten"],
    category: "Animals",
    summary:
      "Cats are tied to independence, intuition, mystery, and the feminine. Their elusiveness often mirrors something untamed or unknowable in yourself.",
    fields: [
      { label: "Often reflects", value: "Independence, intuition, sensuality, or a self-reliant, mysterious part of you." },
      { label: "Ask yourself", value: "What part of me values its freedom and won't be 'tamed'?" },
      { label: "Variations", value: "A purring cat suggests comfort and trust; a hissing or hiding one can point to an intuition you're ignoring." },
    ],
    tags: ["cat", "independence", "intuition", "mystery", "feminine"],
  }),
  dream({
    id: "dream-horse",
    name: "Horse",
    aka: ["horses", "stallion", "mare"],
    category: "Animals",
    summary:
      "A horse embodies power, freedom, and drive. It often represents your own vitality and the forces — wild or harnessed — that carry you forward.",
    fields: [
      { label: "Often reflects", value: "Strength, freedom, passion, and the energy that propels your life." },
      { label: "Ask yourself", value: "Is my drive running free, harnessed well, or feeling reined in?" },
      { label: "Variations", value: "A wild horse speaks of untamed energy; a saddled or working horse, of power you've learned to direct." },
    ],
    tags: ["horse", "power", "freedom", "drive", "vitality"],
  }),
  dream({
    id: "dream-wolf",
    name: "Wolf",
    aka: ["wolves", "pack"],
    category: "Animals",
    summary:
      "Wolves carry instinct, the wild, and the tension between the lone self and the pack. They can mean a threat, or a call back to your primal, untamed nature.",
    fields: [
      { label: "Often reflects", value: "Wild instinct, loyalty to your 'pack,' a perceived threat, or a fierce, independent part of you." },
      { label: "Ask yourself", value: "Am I being warned of a danger, or called to trust my own instincts more?" },
      { label: "Variations", value: "A lone wolf may mirror feelings of independence or isolation; a pack, your sense of belonging and shared loyalty." },
    ],
    tags: ["wolf", "instinct", "wild", "pack", "loyalty"],
  }),
  dream({
    id: "dream-bird",
    name: "Bird",
    aka: ["birds", "flock"],
    category: "Animals",
    summary:
      "Birds often symbolize freedom, the spirit, perspective, and messages. Watching them fly can echo your own longing to rise above and see further.",
    fields: [
      { label: "Often reflects", value: "Freedom, aspiration, the soul or spirit, and news or insight on its way." },
      { label: "Ask yourself", value: "What higher perspective or freedom is my spirit reaching for?" },
      { label: "Variations", value: "A caged bird can mirror feeling confined; a soaring flock, hope and possibility. The species adds flavor — owls for wisdom, doves for peace." },
    ],
    tags: ["bird", "freedom", "spirit", "perspective", "message"],
  }),
  dream({
    id: "dream-fish",
    name: "Fish",
    aka: ["fishes", "fishing"],
    category: "Animals",
    summary:
      "Swimming in the waters of emotion and the unconscious, fish often represent insights, feelings, or even abundance rising up from your depths.",
    fields: [
      { label: "Often reflects", value: "Emotions and intuitions surfacing, fertility and abundance, or unconscious material coming into view." },
      { label: "Ask yourself", value: "What is rising from my depths that I'm being invited to notice?" },
      { label: "Variations", value: "Catching a fish can mean grasping an insight; fish slipping away, an idea or feeling you can't quite hold onto." },
    ],
    tags: ["fish", "emotion", "unconscious", "intuition", "abundance"],
  }),
  dream({
    id: "dream-bear",
    name: "Bear",
    aka: ["bears"],
    category: "Animals",
    summary:
      "A bear blends great strength with a need for retreat and renewal (the hibernation). It often points to power, protectiveness, or a season of turning inward.",
    fields: [
      { label: "Often reflects", value: "Inner strength, fierce protectiveness, solitude, or a call to rest and go within." },
      { label: "Ask yourself", value: "Do I need to summon my strength, set a boundary, or retreat and recharge?" },
      { label: "Variations", value: "A threatening bear can mirror an overwhelming force or a temper (yours or another's); a calm bear, grounded power." },
    ],
    tags: ["bear", "strength", "protection", "retreat", "power"],
  }),
  dream({
    id: "dream-lion",
    name: "Lion",
    aka: ["lions", "lioness"],
    category: "Animals",
    summary:
      "The lion is courage, leadership, and personal power — the 'king' of your inner kingdom. It often calls you to claim your authority and pride (in the best sense).",
    fields: [
      { label: "Often reflects", value: "Courage, leadership, dignity, and the part of you ready to step into power." },
      { label: "Ask yourself", value: "Where am I being called to lead, roar, or stand in my own strength?" },
      { label: "Variations", value: "A caged or wounded lion can mirror power you're holding back; a roaring one, energy ready to be expressed." },
    ],
    tags: ["lion", "courage", "leadership", "power", "pride"],
  }),

  // ───────────────────────── Places & elements ─────────────────────────
  dream({
    id: "dream-water-ocean",
    name: "Ocean",
    aka: ["sea", "deep water"],
    category: "Places & elements",
    summary:
      "The ocean is the grand symbol of the unconscious and the depth of emotion. Its state — calm, stormy, vast — mirrors your inner emotional weather.",
    fields: [
      { label: "Often reflects", value: "The depth and power of your emotions, the unconscious, and feelings too vast to fully grasp." },
      { label: "Ask yourself", value: "What is the 'weather' of my emotional ocean right now — calm, choppy, or storm-tossed?" },
      { label: "Variations", value: "Diving in can mean exploring your depths; standing at the shore, contemplating feelings from a safe distance." },
    ],
    tags: ["ocean", "sea", "emotion", "unconscious", "depth"],
  }),
  dream({
    id: "dream-water-river",
    name: "River",
    aka: ["stream", "current"],
    category: "Places & elements",
    summary:
      "A river is the flow of life and feeling — moving from one phase to the next. Its current speaks to how easily you're going with, or against, life's flow.",
    fields: [
      { label: "Often reflects", value: "Life's journey, the passage of time, emotional flow, and transitions between chapters." },
      { label: "Ask yourself", value: "Am I flowing with the current of my life, or struggling upstream?" },
      { label: "Variations", value: "Crossing a river often marks a transition; a blocked or dried-up river, stuck energy or emotion." },
    ],
    tags: ["river", "flow", "journey", "transition", "emotion"],
  }),
  dream({
    id: "dream-flood",
    name: "Flood",
    aka: ["flooding", "rising water"],
    category: "Places & elements",
    summary:
      "Rising water that overruns its banks. A flood usually means emotions or circumstances have surged past what you can manage — but floods also clear the way for renewal.",
    fields: [
      { label: "Often reflects", value: "Overwhelming feelings or pressures, but also a cleansing that washes away the old." },
      { label: "Ask yourself", value: "What has built up past its limits — and what might be cleared once the waters recede?" },
      { label: "Variations", value: "Watching from high ground suggests you're finding perspective; being swept away, that you need support to cope." },
    ],
    tags: ["flood", "water", "overwhelm", "emotion", "renewal"],
  }),
  dream({
    id: "dream-fire",
    name: "Fire",
    aka: ["flames", "burning"],
    category: "Places & elements",
    summary:
      "Fire is transformation, passion, and energy — it both destroys and purifies. What's burning, and how you feel about it, shapes whether it's danger or rebirth.",
    fields: [
      { label: "Often reflects", value: "Passion, anger, transformation, or a powerful change clearing space for the new." },
      { label: "Ask yourself", value: "What in my life is burning away, and what might rise from the ashes?" },
      { label: "Variations", value: "A warm, contained fire suggests passion and vitality; a raging blaze, anger or a change that feels out of control." },
    ],
    tags: ["fire", "transformation", "passion", "anger", "rebirth"],
  }),
  dream({
    id: "dream-house",
    name: "House",
    aka: ["home", "rooms of a house"],
    category: "Places & elements",
    summary:
      "In dreamwork the house is the self — each room a different part of you. Where you find yourself in it says a lot about where your attention and identity live.",
    fields: [
      { label: "Often reflects", value: "Your psyche and identity; rooms map to facets of you — the basement (unconscious), attic (memory/intellect), kitchen (nourishment), bedroom (intimacy)." },
      { label: "Ask yourself", value: "Which room am I in, and what part of myself is it asking me to tend?" },
      { label: "Variations", value: "A crumbling house can mirror neglected self-care; a grand or expanding one, growth and untapped potential." },
    ],
    tags: ["house", "home", "self", "psyche", "identity"],
  }),
  dream({
    id: "dream-school",
    name: "School",
    aka: ["classroom", "back at school"],
    category: "Places & elements",
    summary:
      "Returning to school as an adult is a common dream of learning, testing, and old insecurities. It often surfaces when life is asking you to grow or prove yourself.",
    fields: [
      { label: "Often reflects", value: "Life lessons, a sense of being tested or evaluated, and lingering self-doubts from formative years." },
      { label: "Ask yourself", value: "What is life trying to teach me right now — and whose approval am I still seeking?" },
      { label: "Variations", value: "Often pairs with exam dreams. Being lost in the halls can mirror feeling unsure of your path or 'where you belong.'" },
    ],
    tags: ["school", "learning", "testing", "growth", "insecurity"],
  }),
  dream({
    id: "dream-bridge",
    name: "Bridge",
    aka: ["crossing a bridge"],
    category: "Places & elements",
    summary:
      "A bridge spans a gap — between phases, choices, or people. It's a hopeful symbol of transition and the willingness to cross into something new.",
    fields: [
      { label: "Often reflects", value: "A transition, a connection between two parts of life, or a decision to move from one stage to the next." },
      { label: "Ask yourself", value: "What am I crossing from, and toward — and am I ready to take the step?" },
      { label: "Variations", value: "A sturdy bridge suggests a safe passage; a rickety or broken one, fear about a change or a connection that feels unstable." },
    ],
    tags: ["bridge", "transition", "connection", "crossing", "decision"],
  }),
  dream({
    id: "dream-stairs",
    name: "Stairs",
    aka: ["staircase", "steps"],
    category: "Places & elements",
    summary:
      "Stairs represent movement between levels — of awareness, status, or emotion. The direction you're heading colors the meaning.",
    fields: [
      { label: "Often reflects", value: "Progress and growth (climbing up) or descending into the unconscious and the past (going down)." },
      { label: "Ask yourself", value: "Am I rising toward something, or being drawn down to explore what's beneath the surface?" },
      { label: "Variations", value: "Endless or shifting stairs can mirror a goal that feels just out of reach; a smooth climb, steady progress." },
    ],
    tags: ["stairs", "ascent", "descent", "progress", "levels"],
  }),
  dream({
    id: "dream-road",
    name: "Road",
    aka: ["path", "highway", "crossroads"],
    category: "Places & elements",
    summary:
      "A road is your life's path and direction. Forks, dead ends, and detours often mirror the choices and uncertainties you're navigating.",
    fields: [
      { label: "Often reflects", value: "Your life direction, choices ahead, and how clear or uncertain the way forward feels." },
      { label: "Ask yourself", value: "Where is my path leading, and am I at a crossroads I haven't admitted to myself?" },
      { label: "Variations", value: "A clear open road suggests confidence and momentum; a blocked, winding, or forking road, decisions and obstacles to weigh." },
    ],
    tags: ["road", "path", "direction", "choice", "crossroads"],
  }),
  dream({
    id: "dream-forest",
    name: "Forest",
    aka: ["woods", "woodland"],
    category: "Places & elements",
    summary:
      "The forest is the unknown, the unconscious, and the place of trials and growth in countless fairy tales. Entering it often means venturing into mystery and self-discovery.",
    fields: [
      { label: "Often reflects", value: "The unknown, the unconscious, a period of searching, or a transformative journey into yourself." },
      { label: "Ask yourself", value: "What am I venturing into that feels unknown — and what might I find at its heart?" },
      { label: "Variations", value: "Feeling lost in the woods mirrors confusion; finding a path or clearing, emerging insight and direction." },
    ],
    tags: ["forest", "woods", "unknown", "unconscious", "journey"],
  }),
  dream({
    id: "dream-storm",
    name: "Storm",
    aka: ["thunderstorm", "tempest", "lightning"],
    category: "Places & elements",
    summary:
      "A gathering storm often mirrors brewing emotion or conflict — turmoil on the horizon — though storms also clear the air and break tension.",
    fields: [
      { label: "Often reflects", value: "Building tension, anger, or anxiety, and an emotional upheaval that may need to break before calm returns." },
      { label: "Ask yourself", value: "What turbulence am I sensing in myself or my life that wants to be acknowledged?" },
      { label: "Variations", value: "Lightning can signal sudden insight or a shock; the calm after the storm, relief and resolution." },
    ],
    tags: ["storm", "tension", "emotion", "conflict", "release"],
  }),
  dream({
    id: "dream-mountain",
    name: "Mountain",
    aka: ["mountains", "climbing a mountain", "summit"],
    category: "Places & elements",
    summary:
      "A mountain is a goal, a challenge, or an aspiration. Climbing it speaks to ambition and effort; the summit, to achievement and perspective.",
    fields: [
      { label: "Often reflects", value: "A significant goal or obstacle, the effort it demands, and the perspective gained from rising above." },
      { label: "Ask yourself", value: "What 'mountain' am I climbing, and how far up do I feel — energized or weary?" },
      { label: "Variations", value: "Reaching the peak suggests accomplishment; an impossible or ever-growing climb, a goal that feels daunting." },
    ],
    tags: ["mountain", "goal", "challenge", "ambition", "achievement"],
  }),

  // ───────────────────────── Death & transformation ─────────────────────────
  dream({
    id: "dream-death",
    name: "Death",
    aka: ["dying", "someone dies"],
    category: "Death & transformation",
    summary:
      "One of the most misunderstood dreams. Death almost always symbolizes endings and transformation, not literal death — the close of one chapter so another can begin.",
    fields: [
      { label: "Often reflects", value: "Major change, the end of a phase, identity, or relationship, and the rebirth waiting on the other side." },
      { label: "Ask yourself", value: "What in my life is ending or being shed — and what is being born in its place?" },
      { label: "Variations", value: "Dreaming of your own death often points to deep personal transformation; the death of another, change in what they represent to you." },
    ],
    safety: "These dreams are about change, not prophecy. But if they bring real distress or grief, it's okay to talk it through with someone you trust.",
    tags: ["death", "change", "endings", "transformation", "rebirth"],
  }),
  dream({
    id: "dream-pregnancy",
    name: "Pregnancy",
    aka: ["being pregnant", "expecting"],
    category: "Death & transformation",
    summary:
      "A pregnancy dream usually symbolizes something new gestating in you — a project, an idea, a growing self — rather than a literal forecast.",
    fields: [
      { label: "Often reflects", value: "Creativity, anticipation, and a new venture or part of yourself developing toward 'birth.'" },
      { label: "Ask yourself", value: "What am I incubating right now that's not quite ready to be born?" },
      { label: "Variations", value: "Anxiety in the dream can mirror worry about whether you're ready; joy, excitement about what's coming." },
    ],
    tags: ["pregnancy", "creativity", "new beginnings", "growth", "anticipation"],
  }),
  dream({
    id: "dream-wedding",
    name: "Wedding",
    aka: ["getting married", "marriage"],
    category: "Death & transformation",
    summary:
      "A wedding symbolizes union and commitment — often the joining of two parts of yourself, or a new bond, rather than a literal marriage.",
    fields: [
      { label: "Often reflects", value: "Commitment, integration of different sides of you, a new partnership, or a major life transition." },
      { label: "Ask yourself", value: "What am I being asked to commit to, or what parts of me are coming together?" },
      { label: "Variations", value: "A joyful wedding suggests harmony and readiness; a chaotic or dreaded one, ambivalence about a commitment." },
    ],
    tags: ["wedding", "marriage", "union", "commitment", "integration"],
  }),
  dream({
    id: "dream-blood",
    name: "Blood",
    aka: ["bleeding"],
    category: "Death & transformation",
    summary:
      "Blood is life-force, passion, and vitality — but also injury and loss. It often points to where your energy, or a wound, is flowing.",
    fields: [
      { label: "Often reflects", value: "Life energy and passion, or a hurt, sacrifice, or loss of vitality that needs attention." },
      { label: "Ask yourself", value: "Where is my energy pouring out, and is something asking to be healed?" },
      { label: "Variations", value: "Bleeding can mirror feeling drained or wounded; blood shared (as in family 'bloodlines') can speak to kinship and inheritance." },
    ],
    tags: ["blood", "vitality", "passion", "wound", "energy"],
  }),
  dream({
    id: "dream-funeral",
    name: "Funeral",
    aka: ["burial", "mourning"],
    category: "Death & transformation",
    summary:
      "A funeral marks a formal goodbye. It often signals a conscious ending — closure you're ready to honor, or feelings you're laying to rest.",
    fields: [
      { label: "Often reflects", value: "Closure, grieving a chapter or version of yourself, and the ritual of letting go." },
      { label: "Ask yourself", value: "What am I ready to lay to rest, and have I given myself permission to grieve it?" },
      { label: "Variations", value: "Whose funeral it is hints at what's ending — and a sense of peace afterward suggests acceptance." },
    ],
    tags: ["funeral", "closure", "grief", "endings", "letting go"],
  }),

  // ───────────────────────── Objects ─────────────────────────
  dream({
    id: "dream-money",
    name: "Money",
    aka: ["cash", "coins", "finding money"],
    category: "Objects",
    summary:
      "Money in dreams often symbolizes self-worth, energy, and value more than literal finances. Finding or losing it tracks how rich or depleted you feel.",
    fields: [
      { label: "Often reflects", value: "Self-worth, power, opportunity, and how valued or abundant you feel — emotionally as much as materially." },
      { label: "Ask yourself", value: "Where do I feel rich, and where do I feel I'm 'running short' in my life?" },
      { label: "Variations", value: "Finding money can signal newfound confidence or opportunity; losing it, fears about security or self-worth." },
    ],
    tags: ["money", "self-worth", "value", "abundance", "power"],
  }),
  dream({
    id: "dream-keys",
    name: "Keys",
    aka: ["key", "lost keys"],
    category: "Objects",
    summary:
      "A key is access, solutions, and unlocking potential. Finding one suggests an answer is near; losing one, that something feels out of reach.",
    fields: [
      { label: "Often reflects", value: "Solutions, opportunities, access to hidden parts of yourself, or the 'key' to a current problem." },
      { label: "Ask yourself", value: "What door am I trying to open, and do I sense I already hold the key?" },
      { label: "Variations", value: "Lost keys can mirror feeling locked out or stuck; a new key, a fresh insight or opportunity opening up." },
    ],
    tags: ["keys", "access", "solutions", "potential", "opportunity"],
  }),
  dream({
    id: "dream-doors",
    name: "Doors",
    aka: ["door", "doorway"],
    category: "Objects",
    summary:
      "Doors are thresholds — opportunities, choices, and transitions. Whether they're open, closed, or locked speaks to how available your next step feels.",
    fields: [
      { label: "Often reflects", value: "Opportunities and choices, new beginnings, and the passage from one phase or state to another." },
      { label: "Ask yourself", value: "Which doors feel open to me, and which am I afraid to walk through?" },
      { label: "Variations", value: "A locked door can mirror an obstacle or something you're not ready for; an open one, an invitation waiting to be accepted." },
    ],
    tags: ["doors", "opportunity", "threshold", "choice", "transition"],
  }),
  dream({
    id: "dream-mirror",
    name: "Mirror",
    aka: ["mirrors", "reflection"],
    category: "Objects",
    summary:
      "A mirror reflects how you see yourself. What you find there — clear, distorted, or unrecognizable — often mirrors your self-image and self-honesty.",
    fields: [
      { label: "Often reflects", value: "Self-image, identity, self-reflection, and how honestly you're seeing yourself." },
      { label: "Ask yourself", value: "What am I really seeing when I look at myself — and is it the truth or a distortion?" },
      { label: "Variations", value: "A distorted or empty reflection can point to confusion about identity; a clear one, self-acceptance and clarity." },
    ],
    tags: ["mirror", "reflection", "self-image", "identity", "truth"],
  }),
  dream({
    id: "dream-phone-cant-dial",
    name: "Phone you can't dial",
    aka: ["broken phone", "can't call", "phone not working"],
    category: "Objects",
    summary:
      "Fingers slipping on the keys, a number that won't connect. This frustrating dream usually points to a communication problem or a connection you can't quite make.",
    fields: [
      { label: "Often reflects", value: "Difficulty communicating, feeling unheard, or struggling to reach someone or something important." },
      { label: "Ask yourself", value: "Who or what am I trying to reach — and what's getting in the way of being heard?" },
      { label: "Variations", value: "A dead phone can mirror feeling disconnected; an urgent call you can't complete, a message you're afraid won't land." },
    ],
    tags: ["phone", "communication", "connection", "unheard", "frustration"],
  }),
  dream({
    id: "dream-clothes",
    name: "Clothes",
    aka: ["clothing", "wrong outfit", "changing clothes"],
    category: "Objects",
    summary:
      "Clothes are the self you present to the world — your persona and roles. The state of your outfit often mirrors how you feel about how you're being seen.",
    fields: [
      { label: "Often reflects", value: "Identity, self-presentation, the roles you play, and how authentic or 'put together' you feel." },
      { label: "Ask yourself", value: "What 'outfit' am I wearing for the world — and does it match who I really am?" },
      { label: "Variations", value: "Wrong or missing clothes echo vulnerability and not fitting in; a fine new outfit, confidence or a new role you're stepping into." },
    ],
    tags: ["clothes", "persona", "identity", "self-presentation", "roles"],
  }),
  dream({
    id: "dream-stairs-elevator",
    name: "Elevator",
    aka: ["lift", "elevator dream"],
    category: "Objects",
    summary:
      "An elevator carries you swiftly between levels of life or emotion. Sudden rises, drops, or getting stuck mirror rapid changes in mood, status, or circumstance.",
    fields: [
      { label: "Often reflects", value: "Rapid shifts in mood, status, or awareness, and how in or out of control those changes feel." },
      { label: "Ask yourself", value: "Am I rising, dropping, or stuck between floors right now — and how does that match my life?" },
      { label: "Variations", value: "A plummeting elevator can mirror anxiety or a sudden fall in fortune; a stuck one, feeling caught between two phases." },
    ],
    tags: ["elevator", "levels", "change", "mood", "status"],
  }),
  dream({
    id: "dream-money-teeth-misc-stairs",
    name: "Stairs going nowhere",
    aka: ["endless stairs", "impossible staircase"],
    category: "Objects",
    summary:
      "Climbing stairs that loop, shift, or never end. A vivid image of effort without arrival — striving toward a goal that keeps moving.",
    fields: [
      { label: "Often reflects", value: "Feeling like you're working hard without progress, or chasing a goal that keeps receding." },
      { label: "Ask yourself", value: "Where am I exhausting myself on a climb that may need a different route — or a rest?" },
      { label: "Variations", value: "It can be a kind invitation to redefine the goal, or to notice how much you've actually grown despite feeling stuck." },
    ],
    tags: ["stairs", "effort", "progress", "frustration", "goal"],
  }),

  // ───────────────────────── More common themes ─────────────────────────
  dream({
    id: "dream-late",
    name: "Running late",
    aka: ["being late", "can't get ready in time"],
    category: "Common scenario",
    summary:
      "Scrambling and still not ready, watches reading the wrong time. A dream of pressure, expectations, and the worry that you're falling behind.",
    fields: [
      { label: "Often reflects", value: "Stress about time, expectations, or a sense of not keeping up with where you 'should' be." },
      { label: "Ask yourself", value: "Whose timeline am I measuring myself against, and is it really mine?" },
      { label: "Variations", value: "Often appears in busy seasons. It can be a gentle cue to ease the pressure you're putting on yourself." },
    ],
    tags: ["late", "time", "pressure", "expectations", "behind"],
  }),
  dream({
    id: "dream-getting-lost",
    name: "Getting lost",
    aka: ["lost", "can't find the way"],
    category: "Common scenario",
    summary:
      "Wandering an unfamiliar place with no way home. A dream of uncertainty about your direction, identity, or where you belong.",
    fields: [
      { label: "Often reflects", value: "Feeling directionless, uncertain about a decision, or disconnected from your sense of self or belonging." },
      { label: "Ask yourself", value: "Where in my life do I feel I've lost my way — and what would 'home' look like?" },
      { label: "Variations", value: "Finding a familiar landmark or path mid-dream can signal that clarity is closer than it feels." },
    ],
    tags: ["lost", "direction", "uncertainty", "belonging"],
  }),
  dream({
    id: "dream-house-fire",
    name: "House on fire",
    aka: ["burning house", "home burning"],
    category: "Places & elements",
    summary:
      "Since the house is the self, a house on fire intensifies the meaning: a powerful, sometimes urgent transformation or upheaval touching who you are.",
    fields: [
      { label: "Often reflects", value: "Major change or emotional intensity reaching into your core identity — destructive, purifying, or both." },
      { label: "Ask yourself", value: "What part of my life or self feels like it's burning — and what could be cleared for something new?" },
      { label: "Variations", value: "Saving people or treasures from the fire can mirror what you most want to protect through a big change." },
    ],
    tags: ["house", "fire", "self", "transformation", "upheaval"],
  }),
  dream({
    id: "dream-water-calm",
    name: "Calm, clear water",
    aka: ["still water", "clear lake", "tranquil water"],
    category: "Places & elements",
    summary:
      "Still, transparent water is one of the loveliest dream images — a sign of emotional peace, clarity, and being at home with your feelings.",
    fields: [
      { label: "Often reflects", value: "Emotional calm, clarity, healing, and a settled relationship with your inner world." },
      { label: "Ask yourself", value: "What in me has finally grown peaceful — and how can I protect that calm?" },
      { label: "Variations", value: "Seeing your reflection clearly in calm water can suggest self-acceptance and honest self-knowledge." },
    ],
    tags: ["water", "calm", "clarity", "peace", "emotion"],
  }),
  dream({
    id: "dream-snake-bite",
    name: "Snake bite",
    aka: ["bitten by a snake"],
    category: "Animals",
    summary:
      "Being bitten by a snake sharpens the snake's themes into something more pointed — a wake-up call, a wound, or the sting of a truth you've been avoiding.",
    fields: [
      { label: "Often reflects", value: "A warning made urgent, a hurtful situation or person, or a truth that's finally getting your attention." },
      { label: "Ask yourself", value: "What is biting at me that I've been ignoring — and what change is it pushing me toward?" },
      { label: "Variations", value: "In healing traditions the snake's 'venom' can also be medicine — a painful catalyst for transformation." },
    ],
    tags: ["snake", "bite", "warning", "wound", "wake-up"],
  }),
  dream({
    id: "dream-baby-animal",
    name: "Baby animal",
    aka: ["puppy", "kitten", "young animal"],
    category: "Animals",
    summary:
      "A young, vulnerable creature often represents a tender new part of yourself, an emerging instinct, or something innocent that needs your protection.",
    fields: [
      { label: "Often reflects", value: "Innocence, a budding instinct or relationship, and a need for nurture and gentleness." },
      { label: "Ask yourself", value: "What young, vulnerable part of me is asking to be cared for?" },
      { label: "Variations", value: "The species hints at which instinct — a puppy for trust and loyalty, a kitten for independence finding its feet." },
    ],
    tags: ["baby animal", "innocence", "instinct", "nurture", "new"],
  }),
  dream({
    id: "dream-owl",
    name: "Owl",
    aka: ["owls"],
    category: "Animals",
    summary:
      "The owl is the classic emblem of wisdom, intuition, and seeing in the dark. It often appears when you're being asked to trust deeper knowing.",
    fields: [
      { label: "Often reflects", value: "Wisdom, intuition, insight, and the ability to see what's hidden in the shadows." },
      { label: "Ask yourself", value: "What does my deeper wisdom already know that my waking mind hasn't admitted?" },
      { label: "Variations", value: "In some folk traditions owls carry omens or messages; mostly, they invite you to trust your inner sight." },
    ],
    tags: ["owl", "wisdom", "intuition", "insight", "night"],
  }),
  dream({
    id: "dream-butterfly",
    name: "Butterfly",
    aka: ["butterflies", "moth"],
    category: "Animals",
    summary:
      "Few symbols capture transformation like the butterfly. It speaks of metamorphosis, the soul, and emerging beautifully from a period of change.",
    fields: [
      { label: "Often reflects", value: "Transformation, rebirth, the soul, and the grace of becoming who you're meant to be." },
      { label: "Ask yourself", value: "What transformation am I in the middle of — and can I trust the process even before I have wings?" },
      { label: "Variations", value: "A cocoon or caterpillar emphasizes that you're mid-change; a butterfly in flight, that you've emerged renewed." },
    ],
    tags: ["butterfly", "transformation", "rebirth", "soul", "change"],
  }),
  dream({
    id: "dream-teeth-crumbling",
    name: "Teeth crumbling",
    aka: ["teeth breaking", "rotting teeth"],
    category: "Common scenario",
    summary:
      "A close cousin of losing teeth, with crumbling or rotting teeth often intensifying themes of decay, neglect, or things falling apart faster than you can manage.",
    fields: [
      { label: "Often reflects", value: "Worry about something deteriorating, feeling unable to keep things together, or neglected self-care." },
      { label: "Ask yourself", value: "What feels like it's 'falling apart,' and where might I have been neglecting myself?" },
      { label: "Variations", value: "Like falling-teeth dreams, this is extremely common and usually speaks to stress and self-image rather than the body itself." },
    ],
    tags: ["teeth", "crumbling", "decay", "stress", "self-image"],
  }),
  dream({
    id: "dream-cliff-edge",
    name: "Standing at a cliff edge",
    aka: ["edge of a cliff", "precipice"],
    category: "Common scenario",
    summary:
      "Toes at the brink, the drop below. A cliff edge captures the thrill and terror of a big decision — the threshold between holding back and taking the leap.",
    fields: [
      { label: "Often reflects", value: "A pivotal choice, fear of a leap of faith, or standing at the edge of major change." },
      { label: "Ask yourself", value: "What leap am I contemplating, and is my fear protecting me or just holding me back?" },
      { label: "Variations", value: "Choosing to jump (and flying, not falling) can signal readiness; backing away, a need for more time or safety." },
    ],
    tags: ["cliff", "edge", "decision", "leap", "fear"],
  }),
  dream({
    id: "dream-test-can't-finish",
    name: "Can't finish a task",
    aka: ["unfinished task", "can't complete"],
    category: "Common scenario",
    summary:
      "Endlessly repeating a chore, or a job that won't come together no matter what. A dream of frustration, perfectionism, or feeling stuck in waking life.",
    fields: [
      { label: "Often reflects", value: "Frustration, perfectionism, or a real situation where you feel blocked from completing something." },
      { label: "Ask yourself", value: "Where am I spinning my wheels — and is the obstacle external, or the bar I've set for myself?" },
      { label: "Variations", value: "It can gently suggest that 'good enough' might free you, or that you need help to get unstuck." },
    ],
    tags: ["task", "unfinished", "frustration", "perfectionism", "stuck"],
  }),
  dream({
    id: "dream-finding-money-treasure",
    name: "Finding treasure",
    aka: ["hidden treasure", "buried treasure", "gold"],
    category: "Objects",
    summary:
      "Unearthing something precious. Discovering treasure often symbolizes recognizing your own hidden gifts, worth, or a valuable insight coming to light.",
    fields: [
      { label: "Often reflects", value: "Discovering inner gifts, self-worth, or an opportunity and insight you'd overlooked." },
      { label: "Ask yourself", value: "What value in myself or my life am I just beginning to recognize?" },
      { label: "Variations", value: "Treasure that's guarded or hard to reach can mirror gifts you've buried under doubt; freely found, a sense of deserving good things." },
    ],
    tags: ["treasure", "worth", "gifts", "discovery", "abundance"],
  }),
  dream({
    id: "dream-water-rain",
    name: "Rain",
    aka: ["rainfall", "downpour"],
    category: "Places & elements",
    summary:
      "Rain can wash clean and renew, or weigh down a gloomy scene. Gentle rain often means emotional release and refreshment; a downpour, feelings welling up.",
    fields: [
      { label: "Often reflects", value: "Emotional release, cleansing, renewal, or sadness that's asking to be felt and let out." },
      { label: "Ask yourself", value: "What feelings might be ready to fall — and could releasing them clear the air for me?" },
      { label: "Variations", value: "Sun breaking through rain echoes hope after hard feelings; a relentless downpour, emotion that needs a gentle outlet." },
    ],
    tags: ["rain", "emotion", "release", "cleansing", "renewal"],
  }),
  dream({
    id: "dream-tunnel",
    name: "Tunnel",
    aka: ["passing through a tunnel"],
    category: "Places & elements",
    summary:
      "A tunnel is a passage through darkness toward something new — often a transition or a difficult stretch with light waiting at the end.",
    fields: [
      { label: "Often reflects", value: "A challenging transition, a focused (if narrow) path forward, and hope of emerging on the other side." },
      { label: "Ask yourself", value: "What dark stretch am I passing through, and can I trust there's light ahead?" },
      { label: "Variations", value: "Seeing the end of the tunnel suggests hope and progress; a tunnel with no end, feeling stuck in a hard phase." },
    ],
    tags: ["tunnel", "transition", "passage", "hope", "darkness"],
  }),
  dream({
    id: "dream-window",
    name: "Window",
    aka: ["windows", "looking out a window"],
    category: "Objects",
    summary:
      "A window lets you see out (or others see in) without crossing through. It often represents perspective, possibility, and the boundary between your inner and outer worlds.",
    fields: [
      { label: "Often reflects", value: "Perspective, hope, possibilities you're observing, or the line between your private self and the world." },
      { label: "Ask yourself", value: "What am I looking out toward — or keeping at a safe distance behind glass?" },
      { label: "Variations", value: "A bright open window suggests openness and opportunity; a dark or barred one, feeling shut in or distanced from life." },
    ],
    tags: ["window", "perspective", "possibility", "boundary", "hope"],
  }),
  dream({
    id: "dream-baby-crying",
    name: "Crying baby",
    aka: ["baby won't stop crying"],
    category: "People & figures",
    summary:
      "A baby you can't soothe often represents a need of your own — emotional, creative, or physical — that's been calling for attention and care.",
    fields: [
      { label: "Often reflects", value: "An overlooked need, a vulnerable part of you asking for care, or feeling overwhelmed by responsibility." },
      { label: "Ask yourself", value: "What part of me is 'crying' for attention that I keep putting off?" },
      { label: "Variations", value: "Being able to comfort the baby can mirror reconnecting with and tending to your own needs." },
    ],
    tags: ["baby", "crying", "needs", "vulnerability", "self-care"],
  }),
  dream({
    id: "dream-back-at-work",
    name: "Back at an old job or workplace",
    aka: ["old workplace", "former job"],
    category: "Places & elements",
    summary:
      "Returning to a past job or workplace often surfaces lessons, dynamics, or feelings from that period that mirror something in your present life.",
    fields: [
      { label: "Often reflects", value: "Patterns or feelings from a past chapter — pressure, belonging, competence — echoing in your current situation." },
      { label: "Ask yourself", value: "What does that old environment remind me of, and where is that theme showing up now?" },
      { label: "Variations", value: "It's rarely about going back; more often your mind is borrowing a familiar setting to process something happening today." },
    ],
    tags: ["work", "workplace", "past", "patterns", "competence"],
  }),
  dream({
    id: "dream-being-attacked",
    name: "Being attacked",
    aka: ["attacked", "assaulted in a dream"],
    category: "Common scenario",
    summary:
      "Facing an attacker is a charged anxiety dream, often representing a threat you feel in waking life, internal conflict, or a part of yourself you're at war with.",
    fields: [
      { label: "Often reflects", value: "A perceived threat, a conflict, vulnerability, or anger turned inward or outward." },
      { label: "Ask yourself", value: "What or who feels threatening right now — and is the attacker outside me or within?" },
      { label: "Variations", value: "Standing your ground or defending yourself can signal growing strength and boundaries." },
    ],
    safety: "If these dreams echo real fear or past trauma, please be gentle with yourself — talking with a counselor can lighten the load. You're not alone in it.",
    tags: ["attacked", "threat", "conflict", "vulnerability", "fear"],
  }),
  dream({
    id: "dream-water-waves",
    name: "Tidal wave",
    aka: ["tsunami", "giant wave"],
    category: "Places & elements",
    summary:
      "A towering wave bearing down on you is a vivid image of emotional overwhelm — a feeling or situation so big it threatens to engulf you.",
    fields: [
      { label: "Often reflects", value: "A wave of emotion (grief, anxiety, anger) or a life event that feels too large to handle alone." },
      { label: "Ask yourself", value: "What's building toward me that feels overwhelming — and who could help me meet it?" },
      { label: "Variations", value: "Reaching higher ground or riding the wave can mark a turning point in mastering big feelings." },
    ],
    safety: "When waking emotions feel like a tidal wave, reaching out — to a friend, a counselor, or a support line — is a strong and kind thing to do for yourself.",
    tags: ["tsunami", "wave", "overwhelm", "emotion", "fear"],
  }),
  dream({
    id: "dream-spider-web",
    name: "Caught in a web",
    aka: ["tangled in a web", "stuck in webbing"],
    category: "Animals",
    summary:
      "Being snared in a web sharpens the spider's themes toward feeling trapped — in a situation, a relationship, or a pattern that's hard to break free of.",
    fields: [
      { label: "Often reflects", value: "Feeling entangled in a complicated situation, a manipulative dynamic, or a sticky habit." },
      { label: "Ask yourself", value: "What web do I feel caught in — and did I help weave it?" },
      { label: "Variations", value: "Freeing yourself in the dream can mirror untangling from something that's been holding you." },
    ],
    tags: ["web", "trapped", "entangled", "relationship", "pattern"],
  }),
  dream({
    id: "dream-old-friend",
    name: "Old friend",
    aka: ["childhood friend", "long-lost friend"],
    category: "People & figures",
    summary:
      "An old friend often embodies a quality, a memory, or a version of yourself from that friendship that's relevant to your life now.",
    fields: [
      { label: "Often reflects", value: "Nostalgia, a quality you associate with them, or a part of yourself from that era resurfacing." },
      { label: "Ask yourself", value: "What did that friendship bring out in me, and could I use more of it now?" },
      { label: "Variations", value: "It can be a gentle nudge to reconnect — with the person, or with the freer, younger self they remind you of." },
    ],
    tags: ["friend", "nostalgia", "memory", "self", "connection"],
  }),
  dream({
    id: "dream-fish-aquarium",
    name: "Fish in a tank",
    aka: ["aquarium", "fish in a bowl"],
    category: "Animals",
    summary:
      "Fish confined to a tank can represent emotions or potential being contained, observed from a safe distance, or kept from their natural depths.",
    fields: [
      { label: "Often reflects", value: "Feelings you're keeping contained, potential held back, or watching your emotions rather than living them." },
      { label: "Ask yourself", value: "What am I keeping 'in a tank' — safely observed but not fully expressed?" },
      { label: "Variations", value: "A crowded or murky tank can mirror feeling confined; a clear, thriving one, emotions in healthy balance." },
    ],
    tags: ["fish", "tank", "contained", "emotion", "potential"],
  }),
  dream({
    id: "dream-empty-rooms",
    name: "Empty house or rooms",
    aka: ["bare house", "abandoned house"],
    category: "Places & elements",
    summary:
      "An empty or abandoned house can mirror feelings of loneliness, a blank slate, or parts of yourself that feel vacant and waiting to be filled.",
    fields: [
      { label: "Often reflects", value: "Emptiness or loneliness, a fresh start with room to grow, or aspects of yourself left unattended." },
      { label: "Ask yourself", value: "Does this emptiness feel lonely, or like open space inviting something new?" },
      { label: "Variations", value: "Bare rooms can be daunting or freeing depending on your mood in the dream — both are valid readings." },
    ],
    tags: ["house", "empty", "loneliness", "fresh start", "self"],
  }),
  dream({
    id: "dream-being-late-naked-combo",
    name: "Public speaking gone wrong",
    aka: ["forgot my speech", "stage fright dream"],
    category: "Common scenario",
    summary:
      "On stage with no notes, the words gone, all eyes on you. A performance-anxiety dream about visibility, judgment, and the fear of being exposed when it counts.",
    fields: [
      { label: "Often reflects", value: "Fear of judgment, self-consciousness, or pressure to perform and 'get it right' in front of others." },
      { label: "Ask yourself", value: "Where do I feel on display, and am I afraid of being seen falling short?" },
      { label: "Variations", value: "Often surfaces before real high-visibility moments. Usually your fear is louder than any actual risk of failing." },
    ],
    tags: ["speaking", "stage", "judgment", "anxiety", "exposure"],
  }),
  dream({
    id: "dream-light-sun",
    name: "Sunlight",
    aka: ["sun", "sunshine", "dawn"],
    category: "Places & elements",
    summary:
      "Warm light and sunshine are heartening dream symbols of clarity, hope, vitality, and consciousness — illumination dawning on something.",
    fields: [
      { label: "Often reflects", value: "Clarity, optimism, energy, and a truth or insight 'coming to light.'" },
      { label: "Ask yourself", value: "What is becoming clear to me, and where is hope returning?" },
      { label: "Variations", value: "A rising sun suggests new beginnings; a warm, steady glow, contentment and well-being." },
    ],
    tags: ["sun", "light", "clarity", "hope", "vitality"],
  }),
  dream({
    id: "dream-darkness",
    name: "Darkness",
    aka: ["the dark", "pitch black"],
    category: "Places & elements",
    summary:
      "Total darkness can feel frightening, but it often represents the unknown, the unconscious, or a phase of uncertainty before clarity returns.",
    fields: [
      { label: "Often reflects", value: "The unknown, uncertainty, the unconscious, or a difficult, unclear period you're moving through." },
      { label: "Ask yourself", value: "What am I in the dark about — and can I trust myself to find my way through it?" },
      { label: "Variations", value: "Finding or carrying a light source in the dark suggests inner resources guiding you forward." },
    ],
    tags: ["darkness", "unknown", "unconscious", "uncertainty"],
  }),
  dream({
    id: "dream-mountain-summit",
    name: "Reaching a summit",
    aka: ["reaching the peak", "top of the mountain"],
    category: "Places & elements",
    summary:
      "Standing at the top after a long climb. A triumphant dream of achievement, accomplishment, and the clear perspective that comes from having made it.",
    fields: [
      { label: "Often reflects", value: "Achievement, pride, a goal realized, and the broad perspective earned by hard effort." },
      { label: "Ask yourself", value: "What summit have I reached (or am near reaching) — and have I let myself feel the win?" },
      { label: "Variations", value: "A summit shrouded in cloud can mirror success that doesn't feel as satisfying as hoped, worth reflecting on." },
    ],
    tags: ["summit", "peak", "achievement", "perspective", "success"],
  }),
  dream({
    id: "dream-pregnancy-others",
    name: "Someone else is pregnant",
    aka: ["friend is pregnant", "another's pregnancy"],
    category: "Death & transformation",
    summary:
      "Dreaming that someone else is expecting often reflects change or new potential you sense in them, your relationship, or a quality they represent to you.",
    fields: [
      { label: "Often reflects", value: "New developments in another person or relationship, or a quality of theirs you're 'expecting' to grow." },
      { label: "Ask yourself", value: "What new thing do I sense developing in them — or in what they represent to me?" },
      { label: "Variations", value: "It can mirror your own creative potential projected onto someone you admire." },
    ],
    tags: ["pregnancy", "others", "potential", "change", "relationship"],
  }),
  dream({
    id: "dream-keys-locked-out",
    name: "Locked out",
    aka: ["can't get in", "shut out"],
    category: "Objects",
    summary:
      "Standing outside a door you can't open. A dream of exclusion, missed access, or feeling shut out of a place, relationship, or part of yourself.",
    fields: [
      { label: "Often reflects", value: "Feeling excluded, denied access, or cut off from something (or someone) you want to reach." },
      { label: "Ask yourself", value: "Where do I feel shut out — and is the lock external, or one I've placed on myself?" },
      { label: "Variations", value: "Finding another way in can suggest resourcefulness and that a closed door isn't the only path." },
    ],
    tags: ["locked out", "exclusion", "access", "doors", "barrier"],
  }),
  dream({
    id: "dream-mirror-broken",
    name: "Broken mirror",
    aka: ["cracked mirror", "shattered reflection"],
    category: "Objects",
    summary:
      "A cracked or shattered mirror intensifies the mirror's themes toward a fractured self-image, distorted self-perception, or a sense of identity in pieces.",
    fields: [
      { label: "Often reflects", value: "A fractured or shaken sense of self, harsh self-criticism, or seeing yourself in a distorted way." },
      { label: "Ask yourself", value: "Where has my self-image cracked, and how might I begin to see myself whole again?" },
      { label: "Variations", value: "Despite the folklore about bad luck, this is far more about self-perception than omen — and broken things can be mended." },
    ],
    tags: ["mirror", "broken", "self-image", "identity", "self-criticism"],
  }),
  dream({
    id: "dream-vehicle-passenger",
    name: "Being a passenger",
    aka: ["someone else driving", "not in control of the car"],
    category: "Places & elements",
    summary:
      "Riding while someone else drives often mirrors feeling that you're not in charge of your own direction, having handed the wheel to another person or circumstance.",
    fields: [
      { label: "Often reflects", value: "Letting others steer your life, going along passively, or trusting (or distrusting) who's in control." },
      { label: "Ask yourself", value: "Who's driving my life right now, and do I want to take back the wheel?" },
      { label: "Variations", value: "A trusted driver can mean healthy support and surrender; a reckless one, a need to reclaim your own agency." },
    ],
    tags: ["passenger", "control", "driving", "agency", "direction"],
  }),
  dream({
    id: "dream-being-trapped",
    name: "Being trapped",
    aka: ["locked in", "can't escape", "confined"],
    category: "Common scenario",
    summary:
      "Trapped in a room, a cage, or a situation with no exit. A dream of feeling stuck, restricted, or unable to escape something in waking life.",
    fields: [
      { label: "Often reflects", value: "Feeling confined by circumstances, a relationship, a job, or your own fears and limits." },
      { label: "Ask yourself", value: "What do I feel trapped by — and what small freedom is actually within my reach?" },
      { label: "Variations", value: "Finding an unexpected exit can mirror the realization that an option you'd overlooked is available." },
    ],
    tags: ["trapped", "confined", "stuck", "restriction", "escape"],
  }),
  dream({
    id: "dream-meeting-self",
    name: "Meeting yourself",
    aka: ["seeing a double", "doppelganger"],
    category: "People & figures",
    summary:
      "Encountering a version of yourself is a striking dream of self-reflection — often a meeting with a part of you you've ignored, feared, or are becoming.",
    fields: [
      { label: "Often reflects", value: "Self-reflection, integration, an emerging side of you, or a confrontation with who you're becoming." },
      { label: "Ask yourself", value: "What is this other 'me' showing me about myself — past, hidden, or future?" },
      { label: "Variations", value: "A younger self can carry old needs or wounds; an older or different self, where you're headed." },
    ],
    tags: ["self", "double", "reflection", "integration", "identity"],
  }),
  dream({
    id: "dream-garden",
    name: "Garden",
    aka: ["gardening", "blooming garden"],
    category: "Places & elements",
    summary:
      "A garden symbolizes growth, nurture, and the inner life you cultivate. Its state — flourishing or overgrown — mirrors how tended your own well-being feels.",
    fields: [
      { label: "Often reflects", value: "Personal growth, the rewards of care and patience, and the state of your inner cultivation." },
      { label: "Ask yourself", value: "What in my life am I growing, and is it being well tended?" },
      { label: "Variations", value: "A blooming garden suggests thriving and reward; an overgrown or barren one, areas of life that need attention." },
    ],
    tags: ["garden", "growth", "nurture", "cultivation", "inner life"],
  }),
  dream({
    id: "dream-baby-forgotten",
    name: "Forgetting you have a baby",
    aka: ["neglected baby", "lost the baby"],
    category: "Common scenario",
    summary:
      "The unsettling dream of suddenly remembering a baby you've left unattended. It usually points to a responsibility, project, or part of yourself you fear you've neglected.",
    fields: [
      { label: "Often reflects", value: "Guilt or anxiety about a neglected responsibility, goal, or vulnerable part of your life." },
      { label: "Ask yourself", value: "What have I been neglecting that needs my care before it's too late?" },
      { label: "Variations", value: "It's a very common parenting and caretaker dream — rarely literal, usually about feeling stretched too thin." },
    ],
    tags: ["baby", "neglect", "responsibility", "guilt", "anxiety"],
  }),
  dream({
    id: "dream-blood-wound",
    name: "An open wound",
    aka: ["injury", "cut that won't heal"],
    category: "Death & transformation",
    summary:
      "A wound that bleeds or won't close often represents an emotional hurt that's still raw, a vulnerability, or pain that's asking to be tended.",
    fields: [
      { label: "Often reflects", value: "An emotional injury still healing, a vulnerability, or a hurt you've left unattended." },
      { label: "Ask yourself", value: "What old wound is still open in me, and what would help it finally heal?" },
      { label: "Variations", value: "A healing or bandaged wound can mirror recovery underway and care you're starting to give yourself." },
    ],
    tags: ["wound", "hurt", "healing", "vulnerability", "pain"],
  }),
  dream({
    id: "dream-clock-time",
    name: "Clocks and time",
    aka: ["clock", "watch", "running out of time"],
    category: "Objects",
    summary:
      "Clocks, especially ones running fast, stuck, or counting down, often express anxiety about time, mortality, deadlines, or the feeling that life is slipping past.",
    fields: [
      { label: "Often reflects", value: "Pressure of time, fear of running out, awareness of mortality, or urgency about a goal." },
      { label: "Ask yourself", value: "Where do I feel time pressing on me — and is that urgency real or self-imposed?" },
      { label: "Variations", value: "A stopped clock can mirror feeling stuck in time; a melting or warping one, a sense that time itself feels unreal." },
    ],
    tags: ["clock", "time", "mortality", "deadline", "urgency"],
  }),
];
