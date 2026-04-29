/**
 * Composite chart interpretations for Mapped.
 *
 * The composite chart represents the relationship itself as its own entity.
 * These interpretations describe the relationship's personality, needs, and purpose.
 */

/* ─── Composite Sun in Sign ─── */
/* What the relationship is fundamentally about */

export const COMPOSITE_SUN_SIGN: Record<string, { theme: string; description: string }> = {
  Ari: {
    theme: "The Spark",
    description:
      "This relationship thrives on excitement, spontaneity, and forward motion. You two ignite each other — there's a natural competitive edge and an urge to conquer the world together. Boredom is the enemy here; the relationship needs constant adventure and new challenges to stay alive. The danger is that competition turns into real conflict, and impatience burns bridges. When it works, you push each other to be braver than either of you would be alone.",
  },
  Tau: {
    theme: "The Anchor",
    description:
      "This relationship craves stability, comfort, and sensory pleasure. You build something tangible together — there's loyalty and patience at the core. The shadow side: stubbornness becomes a weapon, possessiveness creeps in, and the relationship can resist necessary change until it stagnates. When it stays flexible, it's an unshakeable foundation.",
  },
  Gem: {
    theme: "The Conversation",
    description:
      "This relationship lives and breathes through communication. Ideas bounce between you constantly — mental stimulation is the lifeblood. The downside: conversations can replace real emotional depth. You might talk around feelings instead of through them, and the constant need for novelty can make the bond feel scattered or unreliable.",
  },
  Can: {
    theme: "The Nest",
    description:
      "This relationship is deeply emotional and nurturing at its core. You create a private world together — a sense of belonging that exists between just the two of you. The risk is that it becomes too insular: emotional dependency, guilt trips, and moodiness that the other person is expected to manage. Boundaries matter here as much as closeness.",
  },
  Leo: {
    theme: "The Spotlight",
    description:
      "This relationship is warm, generous, and wants to be seen. Together you shine — there's a natural radiance when you're in the same room. The danger: ego clashes, attention-seeking, and drama when either person feels upstaged. If one person always needs to be the star, the other starts to dim. It works when the spotlight is genuinely shared.",
  },
  Vir: {
    theme: "The Partnership",
    description:
      "This relationship is built on service, improvement, and practical devotion. You make each other's lives work better — there's an instinct to help, fix, and refine together. The shadow: constant criticism disguised as helpfulness. Nothing is ever good enough, and the nitpicking can erode confidence. It works when the fixing energy turns outward instead of on each other.",
  },
  Lib: {
    theme: "The Balance",
    description:
      "This relationship is fundamentally about harmony, beauty, and fairness. You two are drawn to create equilibrium — there's a natural grace in how you relate. The problem: conflict avoidance becomes its own form of dishonesty. Real issues get smoothed over instead of solved, resentment builds quietly, and codependency can set in. It works when you learn that disagreement isn't destruction.",
  },
  Sco: {
    theme: "The Transformation",
    description:
      "This relationship is intense, deep, and profoundly transformative. Nothing stays surface-level between you — there's a magnetic pull toward truth, intimacy, and shared power. The hard truth: this placement breeds power struggles, jealousy, and control issues if either person feels threatened. Secrets destroy it. When both of you commit to radical honesty, it fundamentally transforms you — but that transformation isn't always comfortable.",
  },
  Sag: {
    theme: "The Adventure",
    description:
      "This relationship is about growth, freedom, and shared meaning. You expand each other's worlds — there's an infectious optimism and hunger for truth. The shadow: restlessness disguised as growth. Commitment gets dodged by calling it 'freedom,' and hard truths get avoided through relentless positivity. When one person needs to sit with something heavy, the other's instinct to fix it with a pep talk can feel dismissive.",
  },
  Cap: {
    theme: "The Legacy",
    description:
      "This relationship is ambitious, structured, and built to last. You two mean business — there's a shared drive to achieve something real in the world together. The relationship needs goals, commitment, and mutual respect. The downside is real: it can feel cold, transactional, or like all duty and no joy. If you forget to actually enjoy each other, you'll build an impressive structure with no warmth inside it.",
  },
  Aqu: {
    theme: "The Revolution",
    description:
      "This relationship is unconventional, forward-thinking, and fiercely independent. You two don't follow anyone else's rules — there's a shared vision for something bigger than yourselves. The shadow: emotional detachment passed off as independence. When one person needs warmth or vulnerability, the other intellectualizes it away. The bond can feel more like an alliance than a real connection if feelings are treated as inconvenient.",
  },
  Pis: {
    theme: "The Dream",
    description:
      "This relationship is deeply spiritual, intuitive, and boundaryless. There's an almost psychic connection that transcends words. The danger: boundaries dissolve completely. Enabling, escapism, and martyrdom are real risks. One person may carry the other's emotional weight until they collapse under it. When grounded, this connection heals. When ungrounded, it drowns.",
  },
};

/* ─── Composite Moon in Sign ─── */
/* The emotional needs and instincts of the relationship */

export const COMPOSITE_MOON_SIGN: Record<string, { theme: string; description: string }> = {
  Ari: {
    theme: "Reactive Instincts",
    description:
      "Emotionally, this relationship is direct and fiery. Feelings come out fast — there's no hiding or stuffing things down. The problem: reactions are often impulsive and hurtful. Anger flares before anyone thinks, apologies come too late, and the same explosive patterns repeat. When you learn to pause before reacting, the directness becomes a gift. Until then, it stings.",
  },
  Tau: {
    theme: "Steady Devotion",
    description:
      "Emotionally, this relationship craves consistency and physical closeness. You feel safe with each other through routines, shared meals, touch, and dependable presence. Emotional security is everything — the relationship gets stressed by sudden changes or instability. When nurtured, it's the most comforting bond imaginable.",
  },
  Gem: {
    theme: "Emotional Dialogue",
    description:
      "This relationship processes feelings through talking. You need to verbalize emotions to understand them — silence feels like distance. Humor and playfulness are how you comfort each other. The emotional tone is light and curious, which is beautiful, though deeper feelings may need extra effort to surface.",
  },
  Can: {
    theme: "Deep Belonging",
    description:
      "The emotional core of this relationship is profoundly nurturing. You instinctively care for each other — there's a mama-bear protectiveness baked in. Home, family, and emotional safety are the top priorities. Moodiness can be an issue, but when this relationship feels secure, it creates an unbreakable emotional bond.",
  },
  Leo: {
    theme: "Warm Expression",
    description:
      "Emotionally, this relationship needs to feel special and celebrated. Grand gestures, heartfelt compliments, and creative play keep the emotional bond alive. The risk: if one person doesn't feel adequately appreciated, the wounded pride can turn into cold withdrawal or dramatic scenes. Emotional generosity here is extraordinary — when mutual. When one-sided, it breeds resentment.",
  },
  Vir: {
    theme: "Acts of Care",
    description:
      "Emotions in this relationship are expressed through service and practical support. You show love by helping, organizing, and paying attention to details others miss. The emotional tone is modest and conscientious. Criticism can be a pitfall, but at its best, no one has ever taken care of you like this relationship does.",
  },
  Lib: {
    theme: "Harmony First",
    description:
      "This relationship emotionally craves peace and balance above all. You both instinctively smooth over rough edges, which keeps things pleasant but can mean real feelings get buried. The emotional language is diplomacy, fairness, and aesthetic beauty. When you learn to fight fair instead of avoiding conflict, the emotional bond deepens.",
  },
  Sco: {
    theme: "Emotional Depths",
    description:
      "The emotional undercurrent here is intense and all-consuming. You feel everything deeply together — jealousy, desire, devotion, fear. Nothing is casual about this emotional bond. The problem is that emotional manipulation, silent treatments, and score-keeping come naturally when either person feels vulnerable. This placement demands radical honesty, and anything less poisons it slowly.",
  },
  Sag: {
    theme: "Emotional Freedom",
    description:
      "This relationship needs emotional breathing room and a sense of shared meaning. You comfort each other through optimism, laughter, and philosophical perspective. The blind spot: using humor or reframing to dodge genuine pain. When one person is hurting, the other's instinct to cheer them up can feel like their feelings aren't being taken seriously.",
  },
  Cap: {
    theme: "Emotional Maturity",
    description:
      "Emotions in this relationship are controlled, reserved, and deeply loyal. You don't waste energy on drama — feelings are expressed through commitment, responsibility, and showing up consistently. The real risk is emotional suppression disguised as maturity. If neither person ever cracks open, the bond can feel more like a business arrangement than something alive.",
  },
  Aqu: {
    theme: "Friendly Detachment",
    description:
      "Emotionally, this relationship values friendship and intellectual connection over raw feeling. You process emotions through ideas and shared ideals rather than tears or intensity. It can feel detached to outsiders, but between you, the emotional bond is built on mutual respect, freedom, and genuine liking of each other as people.",
  },
  Pis: {
    theme: "Emotional Telepathy",
    description:
      "The emotional bond here is almost psychic — you sense each other's feelings without words. There's boundless compassion flowing between you. The danger: you absorb each other's pain, moods, and anxieties until you can't tell whose feelings are whose. Codependency, emotional exhaustion, and losing yourself in the other person's needs are real risks if boundaries aren't maintained.",
  },
};

/* ─── Composite Rising in Sign ─── */
/* How the relationship appears to the outside world */

export const COMPOSITE_RISING_SIGN: Record<string, { theme: string; description: string }> = {
  Ari: {
    theme: "Power Couple Energy",
    description:
      "People see you as a dynamic, take-charge duo. There's a boldness to how you move through the world together — you don't ask permission, you just go. The relationship comes across as energetic, competitive, and exciting. Others might find you intimidating but also magnetic.",
  },
  Tau: {
    theme: "The Solid Pair",
    description:
      "Others see a stable, grounded couple that just makes sense together. There's a calm elegance to how you present — nothing frantic, nothing forced. People feel comfortable around you because the relationship radiates reliability and taste. You seem like you've been together forever, even if you haven't.",
  },
  Gem: {
    theme: "The Social Duo",
    description:
      "People see you as fun, witty, and always in motion. You light up rooms with conversation and humor — everyone wants to be around you both. The relationship comes across as youthful and intellectually stimulating. Others might struggle to pin down what you are exactly, but they're always entertained.",
  },
  Can: {
    theme: "The Cozy Pair",
    description:
      "Others see a deeply caring, family-oriented relationship. There's a warmth and protectiveness that's visible from the outside — people feel nurtured just being around you. The relationship comes across as private and emotionally rich. You're the couple that hosts dinner parties and remembers everyone's birthday.",
  },
  Leo: {
    theme: "The Golden Couple",
    description:
      "People can't help but notice you two. There's a warmth and magnetism that draws attention wherever you go together. The relationship comes across as generous, playful, and slightly larger than life. Others might envy what you have. At your best, you inspire people to believe in love.",
  },
  Vir: {
    theme: "The Thoughtful Team",
    description:
      "Others see a practical, well-organized partnership that runs like a well-oiled machine. There's a quiet competence to how you handle life together. The relationship comes across as helpful, modest, and detail-oriented. People come to you for advice because you seem to have it together.",
  },
  Lib: {
    theme: "The Beautiful Match",
    description:
      "People see elegance, charm, and visual harmony when they look at you two. The relationship comes across as balanced and socially graceful — you complement each other perfectly. Others think of you as the ideal couple. The aesthetic of the relationship matters, and it shows.",
  },
  Sco: {
    theme: "The Magnetic Bond",
    description:
      "Others sense something intense and private about your relationship. There's an almost palpable chemistry that people can feel — it's magnetic and a little mysterious. The relationship comes across as deep, loyal, and not to be messed with. People know better than to come between you.",
  },
  Sag: {
    theme: "The Free Spirits",
    description:
      "People see a fun-loving, adventurous couple that doesn't play by conventional rules. There's an infectious enthusiasm to how you move through life together. The relationship comes across as free, optimistic, and culturally curious. Others want to join your adventures.",
  },
  Cap: {
    theme: "The Power Team",
    description:
      "Others see a serious, ambitious partnership that's clearly going places. There's a maturity and quiet authority to how you present together. The relationship comes across as accomplished, strategic, and built for success. People respect what you've built and trust your judgment as a unit.",
  },
  Aqu: {
    theme: "The Unusual Pair",
    description:
      "People see you as an unconventional, progressive couple. There's something unique about how you function together that doesn't fit the mold. The relationship comes across as intellectual, humanitarian, and independent. Others admire your individuality and might be a little puzzled by your dynamic.",
  },
  Pis: {
    theme: "The Soul Bond",
    description:
      "Others sense a deep, almost otherworldly connection between you. There's a dreamy, artistic quality to how you present as a couple. The relationship comes across as gentle, compassionate, and spiritually attuned. People feel something peaceful when they're around you both.",
  },
};

/* ─── Composite Sun in House ─── */
/* Where the relationship's core energy focuses */

export const COMPOSITE_SUN_HOUSE: Record<number, { area: string; description: string }> = {
  1: {
    area: "Identity & Self-Expression",
    description:
      "The relationship itself has a strong, visible identity. You two are very much a defined 'unit' — people recognize you as a pair. The core purpose is about self-expression and showing up authentically together in the world.",
  },
  2: {
    area: "Values & Security",
    description:
      "This relationship is fundamentally about building something of value together. Shared resources, finances, and what you both consider 'worth having' are central themes. Security and comfort are the core purpose.",
  },
  3: {
    area: "Communication & Learning",
    description:
      "Communication is the heartbeat of this relationship. You exist together to share ideas, learn, and stay mentally engaged. Everyday conversations, local adventures, and intellectual exchange are the core purpose.",
  },
  4: {
    area: "Home & Foundation",
    description:
      "This relationship is centered around home, family, and emotional roots. Creating a shared domestic life — whether that's a literal home or an emotional safe haven — is the core purpose. Family matters deeply.",
  },
  5: {
    area: "Romance & Creativity",
    description:
      "This relationship is fundamentally about joy, creativity, and romance. You exist together to play, create, and express love openly. The core purpose is pleasure — children, artistic projects, and keeping the spark alive.",
  },
  6: {
    area: "Daily Life & Service",
    description:
      "This relationship is centered around everyday routines, health, and being of service. You function best when you have shared projects, rituals, and ways to improve each other's daily lives. The core purpose is practical devotion.",
  },
  7: {
    area: "Balance & Equality",
    description:
      "The relationship itself is about learning to be true equals. There's a strong pull toward fairness, balance, and mutual respect. The core purpose is figuring out how to share space, power, and attention without one person dominating. When it's off-balance, resentment builds quietly.",
  },
  8: {
    area: "Transformation & Intimacy",
    description:
      "This relationship is centered around deep transformation, shared resources, and intense closeness. Nothing stays surface-level — and that's not always pleasant. Power struggles over money, control, and emotional territory are common. The core purpose is mutual evolution, but evolution here means confronting the parts of yourselves you'd rather keep hidden.",
  },
  9: {
    area: "Growth & Meaning",
    description:
      "This relationship is fundamentally about expanding horizons together. Travel, philosophy, higher learning, and spiritual growth are central. The core purpose is finding shared meaning and a bigger picture you both believe in.",
  },
  10: {
    area: "Public Life & Achievement",
    description:
      "This relationship is visible in the public sphere. You two are recognized as a unit in your career or community. The core purpose is shared ambition and building a reputation or legacy together.",
  },
  11: {
    area: "Community & Ideals",
    description:
      "This relationship is centered around shared ideals, friendships, and community involvement. You exist together to be part of something bigger — groups, causes, and future visions. The core purpose is collective impact.",
  },
  12: {
    area: "Spiritual Connection & Privacy",
    description:
      "This relationship has a deeply private, hidden dimension. Much of what happens between you exists beneath the surface, away from public view. This can feel spiritual and transcendent — or it can mean confusion, avoidance, and unspoken resentments that never get resolved. The core purpose is healing, but healing requires facing things both of you might prefer to ignore.",
  },
};

/* ─── Composite Moon in House ─── */
/* Where the relationship finds emotional comfort */

export const COMPOSITE_MOON_HOUSE: Record<number, string> = {
  1: "You feel emotionally secure when you can be yourselves together without pretense. The relationship's emotional well-being depends on honest self-expression and mutual acknowledgment.",
  2: "Emotional security comes from shared resources and financial stability. You feel safest when the material foundation is solid — having enough, building together, enjoying creature comforts.",
  3: "You find emotional comfort through constant communication. Texting, talking, sharing daily updates — the emotional bond stays strong through words and staying connected mentally.",
  4: "The emotional heart of this bond is rooted in home and family. You need a shared sense of belonging — a safe space where you both feel completely at ease and understood.",
  5: "Emotional fulfillment comes through creativity, play, and self-expression. You need fun, spontaneity, and shared enthusiasm to keep the emotional bond thriving.",
  6: "You feel emotionally secure through shared routines and taking care of each other in practical ways. Acts of service, health habits, and daily rituals strengthen the emotional foundation.",
  7: "Emotional security comes from feeling like true equals. Fairness, balance, and mutual awareness keep the emotional bond healthy. The relationship itself is the emotional anchor.",
  8: "The emotional life of this relationship is intense and deeply private. Comfort comes through vulnerability, but getting there means confronting jealousy, control, and fear of betrayal. When trust breaks here, it cuts deep. When it holds, the emotional bond is unmatched.",
  9: "Emotional security comes from shared beliefs and adventures. You feel closest when you're exploring — physically, intellectually, or spiritually. The emotional bond strengthens through growth and meaning.",
  10: "Emotional comfort comes from shared goals and being recognized as a unit. You feel secure when the relationship has structure, direction, and a sense of accomplishment in the world.",
  11: "The emotional bond strengthens through friendship, shared ideals, and community involvement. You feel closest when you're working toward a vision together or surrounded by your people.",
  12: "The emotional life of this relationship is deeply private and spiritual. You comfort each other through intuition, quiet time together, and addressing the unspoken. There's a soulful quality to the emotional bond.",
};

/* ─── Composite Planet in House Highlights ─── */
/* Key one-liners for important planet placements */

export const COMPOSITE_PLANET_HOUSE: Record<string, Record<number, string>> = {
  Venus: {
    1: "Love and affection are immediately visible — everyone sees how much you care for each other.",
    2: "You express love through gifts, shared pleasures, and building financial comfort together.",
    3: "Sweet, flirty communication keeps the love alive. You adore talking to each other.",
    4: "The love in this relationship is domestic and deeply comforting — home is where the heart truly is.",
    5: "This is the ultimate romance placement. The relationship never loses its spark or sense of play.",
    6: "Love shows up in the small things — morning coffee made right, checking in, acts of care.",
    7: "A naturally harmonious partnership built on fairness, courtesy, and genuine appreciation.",
    8: "Love here is intense, transformative, and deeply intimate — not for the faint of heart.",
    9: "You fall deeper in love through travel, learning, and exploring new ideas together.",
    10: "The relationship is publicly admired — people see your love story as aspirational.",
    11: "Your love is built on genuine friendship and shared hopes for the future.",
    12: "A deeply private, almost secret love — the tenderness between you is sacred and hidden from the world.",
  },
  Mars: {
    1: "High energy and passion define this relationship — you motivate and challenge each other constantly.",
    2: "You're driven to build wealth and security together — a power couple with shared financial ambitions.",
    3: "Debates and spirited conversations fuel the relationship. You sharpen each other's minds.",
    4: "Protective energy around home and family — you'll fight for your shared foundation.",
    5: "Intense creative and romantic energy. The passion and playfulness rarely dim.",
    6: "You're an efficient team in daily life — tackling projects, health goals, and routines together.",
    7: "There's a competitive edge to the partnership — it can spark growth or friction, depending on maturity.",
    8: "Deeply passionate and transformative. Power dynamics are real and need conscious navigation.",
    9: "You push each other to grow, explore, and seek truth — a relationship that expands both your worlds.",
    10: "Ambitious energy directed toward shared career or public goals. You're unstoppable as a team.",
    11: "You fight for shared causes and rally your community together. Activist energy as a couple.",
    12: "Passion runs deep beneath the surface — there's a hidden intensity that only the two of you know about.",
  },
  Jupiter: {
    1: "The relationship itself is a source of joy, optimism, and personal growth for both of you.",
    2: "Financial abundance and material generosity flow naturally in this relationship.",
    3: "You expand each other's minds through conversation, travel stories, and shared curiosity.",
    4: "A warm, generous home life. The relationship creates a sense of emotional abundance and belonging.",
    5: "Pure fun and creative expansion. This placement is the jackpot for romance and joyful connection.",
    6: "You improve each other's daily lives in tangible ways — health, habits, and routines get a boost.",
    7: "The partnership itself feels like a blessing. There's ease, generosity, and natural compatibility.",
    8: "Deep transformation leads to profound growth. Shared resources and intimacy expand your lives.",
    9: "The ultimate adventure couple. Travel, philosophy, and spiritual growth are your love language.",
    10: "Together you achieve more than either would alone. Public success and recognition come naturally.",
    11: "Your shared social life is rich and expansive. You attract an incredible community together.",
    12: "Spiritual and emotional growth happens behind the scenes. There's a guardian-angel quality to this bond.",
  },
  Saturn: {
    1: "The relationship demands maturity and commitment from day one. It's serious but built to last.",
    2: "Financial responsibility and careful resource management are central themes. Slow, steady building.",
    3: "Communication can feel heavy or restricted — learning to talk openly is a key relationship lesson.",
    4: "Home life carries responsibility and possibly family obligations. The foundation is solid but serious.",
    5: "Romance requires effort and patience here. Joy doesn't come easily but is deeply earned when it arrives.",
    6: "You tackle life's practical demands as a disciplined team. Strong work ethic as a partnership.",
    7: "This is a serious, committed partnership with real staying power — but flexibility is needed.",
    8: "Trust and power dynamics are major themes. Building emotional safety takes time but is deeply rewarding.",
    9: "Growth comes through structured learning and tested beliefs. Travel and expansion require planning.",
    10: "A power couple with serious ambitions. The relationship demands public accountability and long-term vision.",
    11: "Your social circle may be small but loyal. Shared goals require patience and sustained effort.",
    12: "Old karmic patterns surface for healing. This relationship asks you to face hidden fears together.",
  },
};

/* ─── Key Composite Aspects ─── */
/* Interpretations for significant inter-planetary aspects in the composite */

export const COMPOSITE_ASPECT_MEANINGS: Record<string, Record<string, string>> = {
  "Sun-Moon": {
    conjunction: "Your core purpose and emotional needs are perfectly aligned. This is one of the strongest indicators of a relationship that feels 'meant to be.'",
    opposition: "What the relationship wants to be and what it needs emotionally are at odds. You can feel pulled in two directions — one person's comfort zone is the other's growth edge. This tension is magnetic but exhausting if neither side yields.",
    trine: "An easy, flowing connection between the relationship's identity and emotional core. Things just work between you — naturally harmonious.",
    square: "The relationship's purpose and emotional needs genuinely clash. This creates recurring friction — the same arguments, the same unmet needs surfacing in different forms. It's workable, but it requires both people to actively compromise rather than dig in.",
    sextile: "A gentle, supportive link between head and heart in the relationship. You have the opportunity to blend purpose with feeling beautifully.",
  },
  "Sun-Venus": {
    conjunction: "Love and identity are intertwined. This relationship is deeply affectionate at its core — love is the whole point.",
    opposition: "There's a push-pull between the relationship's purpose and its expression of love. One person may feel they give more than they receive, creating resentment if not addressed directly.",
    trine: "Natural warmth and affection flow through the relationship. Being together feels good — there's an easy, loving quality.",
    square: "Love is present but often expressed in mismatched ways. What feels caring to one person feels smothering or insufficient to the other. Without honest conversation about needs, this creates a slow buildup of frustration.",
    sextile: "A sweet, supportive connection that brings beauty and pleasure into the relationship's core identity.",
  },
  "Sun-Mars": {
    conjunction: "High energy, drive, and passion define this relationship. You're a force together but arguments can escalate fast — neither side backs down easily.",
    opposition: "Power struggles are a real pattern here. You can bring out each other's competitive edge in ways that are motivating or destructive depending on how you handle conflict. Ego clashes need honest management.",
    trine: "Energizing and motivating. You naturally encourage each other's ambitions without stepping on toes.",
    square: "This is one of the most combative aspects in a composite chart. Friction, arguments, and frustration are baked in. The energy is enormous — but without a constructive outlet, it turns into resentment or explosive fights.",
    sextile: "A productive, active connection. You're good at working together and supporting each other's goals.",
  },
  "Sun-Saturn": {
    conjunction: "A serious, weighty bond. There's real commitment here, but it can feel more like obligation than choice. The relationship demands maturity — sometimes more than feels fair.",
    opposition: "Duty and restriction can genuinely dampen the relationship's vitality. One person may feel held back or criticized by the other. Finding joy within this structure is the challenge, and it doesn't always succeed.",
    trine: "Natural stability and maturity. The relationship has staying power and earns respect from others.",
    square: "This is a hard aspect. The relationship can feel burdensome, restrictive, or like it's constantly testing you. One or both people may feel they can never do enough. Growth is possible, but it comes through genuine difficulty, not just 'lessons.'",
    sextile: "A healthy dose of structure supports the relationship's growth. Commitment comes with practical benefits.",
  },
  "Moon-Venus": {
    conjunction: "Emotional tenderness and affection are deeply intertwined. This is one of the sweetest placements for mutual care and love.",
    opposition: "Emotional needs and love expression pull in different directions. What one person needs to feel safe is different from what the other naturally gives. This can create a persistent feeling of being slightly out of sync.",
    trine: "Effortless emotional warmth. You instinctively know how to comfort and please each other.",
    square: "Emotional comfort and love expression sometimes clash. One person's way of showing care may not land the way it's intended, creating hurt feelings despite good intentions.",
    sextile: "A gentle, nurturing love that grows stronger over time through shared emotional experiences.",
  },
  "Moon-Mars": {
    conjunction: "Emotions run hot. Feelings and reactions are intensely linked — fights can be dramatic and hurtful if neither person pauses before reacting.",
    opposition: "Emotional volatility is a real issue. One person's emotional needs can trigger the other's defensive or aggressive response. Learning to express anger without wounding is essential — and not guaranteed.",
    trine: "Emotions and actions flow together naturally. You instinctively protect and energize each other.",
    square: "Emotional triggers and reactive patterns are a genuine problem here. You know exactly how to hurt each other, even unintentionally. This requires real emotional discipline from both people — without it, the cycle of trigger-and-react can become toxic.",
    sextile: "A healthy emotional-physical balance. You're good at supporting each other through action.",
  },
  "Venus-Mars": {
    conjunction: "Intense romantic and sexual chemistry. The attraction between you is palpable and doesn't fade easily.",
    opposition: "Magnetic sexual tension with a push-pull dynamic. The chase keeps things exciting but can also mean one person is always pursuing while the other withdraws.",
    trine: "Natural romantic harmony. Attraction and affection flow easily — you're just drawn to each other effortlessly.",
    square: "Desire and frustration coexist. The attraction is undeniable but the way you each express it creates friction — one person's passion feels like pressure to the other. Needs direct communication to avoid resentment.",
    sextile: "A pleasant, stimulating attraction that deepens with time. You bring out each other's charm naturally.",
  },
  "Venus-Saturn": {
    conjunction: "Love is serious and committed here. The relationship values loyalty over passion — but it can feel more dutiful than warm if tenderness isn't actively cultivated.",
    opposition: "Affection feels restricted or withheld. One person may feel emotionally starved while the other feels they're showing love through loyalty and structure. This disconnect is painful and requires direct conversation.",
    trine: "A beautiful blend of love and stability. The relationship ages like fine wine — it gets better with time.",
    square: "This is genuinely difficult for emotional warmth. Walls go up. Vulnerability feels dangerous. One or both people may withhold affection as self-protection. The bond can endure, but it risks becoming cold if neither person risks being soft first.",
    sextile: "Practical love that builds something real. Affection is expressed through reliability and long-term investment.",
  },
};

/* ─── Platonic text adaptation ─── */
/* Swaps romantic/sexual language for platonic equivalents when the
   relationship is family or friend. Applied as a post-processing pass
   so we don't need to maintain two full sets of 200+ interpretations. */

const PLATONIC_SWAPS: [RegExp, string][] = [
  // Multi-word phrases first (order matters — longer matches before shorter)
  [/retreat from the world together and just be/gi, "come together and feel at ease"],
  [/retreat from the world together/gi, "come together and recharge"],
  [/solitude together/gi, "downtime together"],
  [/dissolve into each other/gi, "tune into each other deeply"],
  [/\bsexual chemistry\b/gi, "magnetic energy"],
  [/\bsexual tension\b/gi, "intense energy"],
  [/\bsexual intensity\b/gi, "emotional intensity"],
  [/\bsexual\b/gi, "emotional"],
  [/\bsoulmate bond\b/gi, "soul-level bond"],
  [/\bsoulmate\b/gi, "soul-level"],
  [/\blove affair[s]?\b/gi, "creative breakthrough"],
  [/\bfall for someone\b/gi, "connect deeply with someone"],
  [/\bfall deeper in love\b/gi, "grow closer"],
  [/\byour love story\b/gi, "your bond"],
  [/\byour love\b/gi, "your bond"],
  [/\bbelieve in love\b/gi, "believe in deep connection"],
  [/\bin love\b/gi, "connected"],
  [/\bthe love in this\b/gi, "the warmth in this"],
  [/\bLove is\b/g, "The bond is"],
  [/\bLove here is\b/g, "The bond here is"],
  [/\bLove shows up\b/g, "Care shows up"],
  [/\bLove and\b/g, "Warmth and"],
  [/\blove and\b/g, "warmth and"],
  [/\bLove style\b/g, "Bond style"],
  [/\bkeeping the spark alive\b/gi, "keeping the energy alive"],
  [/\bthe spark\b/gi, "the energy"],
  [/\bthe chase\b/gi, "the dynamic"],
  [/\bpower couple energy\b/gi, "powerhouse duo energy"],
  [/\bpower couple\b/gi, "powerhouse duo"],
  [/\bgolden couple\b/gi, "golden pair"],
  [/\bcouple\b/gi, "pair"],
  [/\bmarriage\b/gi, "commitment"],
  [/\bpartner\b/gi, "person"],
  [/\bpartnership\b/gi, "bond"],
  [/\bromance\b/gi, "connection"],
  [/\bromantic\b/gi, "deep"],
  [/\bpassionate\b/gi, "intense"],
  [/\bpassion\b(?! for)/gi, "intensity"],
  [/\bintimate\b/gi, "close"],
  [/\bintimacy\b/gi, "closeness"],
  [/\baffection\b/gi, "warmth"],
  [/\baffectionate\b/gi, "warm"],
  [/\battractive and magnetic\b/gi, "charismatic and magnetic"],
  [/\battraction\b/gi, "connection"],
  [/\bdesire\b/gi, "drive"],
  [/\bflirty\b/gi, "playful"],
  [/\bmaking up\b/gi, "reconciling"],
  [/\bdoses of romance\b/gi, "doses of fun"],
  [/\bsecret love\b/gi, "private bond"],
  [/\bsecret romances\b/gi, "private connections"],
];

function adaptForPlatonic(text: string): string {
  let result = text;
  for (const [pattern, replacement] of PLATONIC_SWAPS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/* ─── Platonic overrides for specific entries ─── */
/* Some descriptions are too couple-coded for regex to fix.
   These are full replacements used when category is family/friend. */

const PLATONIC_SUN_HOUSE_5: { area: string; description: string } = {
  area: "Creativity & Fun",
  description:
    "This relationship is fundamentally about joy, creativity, and self-expression. You exist together to play, create, and have fun. The core purpose is shared enthusiasm — creative projects, humor, and keeping each other's spirits high.",
};

const PLATONIC_VENUS_HOUSE: Record<number, string> = {
  1: "Warmth and care are immediately visible — everyone sees how much you mean to each other.",
  2: "You show care through generosity, shared pleasures, and looking out for each other's comfort.",
  3: "Playful, easy communication keeps the bond strong. You genuinely enjoy talking to each other.",
  4: "The warmth in this bond is domestic and deeply comforting — home feels better when you're both there.",
  5: "Creativity and fun are the glue here. You bring out each other's playful, expressive side.",
  6: "Care shows up in the small things — checking in, helping out, noticing what the other person needs.",
  7: "A naturally harmonious bond built on fairness, mutual respect, and genuine appreciation.",
  8: "The bond here runs deep and transformative — you trust each other with things you don't share easily.",
  9: "You grow closer through shared experiences, travel, and exploring new ideas together.",
  10: "The bond is publicly visible — people see your closeness and respect what you have.",
  11: "Your connection is built on genuine friendship and shared hopes for the future.",
  12: "A deeply private bond — the tenderness between you is quiet and sacred.",
};

const PLATONIC_SATURN_HOUSE: Record<number, string> = {
  1: "This bond carries weight and responsibility. There's a seriousness to it — you hold each other accountable.",
  2: "Financial responsibility or shared resources are a recurring theme. You teach each other about stability.",
  3: "Communication can feel heavy or restricted at times. Learning to be honest without defensiveness is the lesson.",
  4: "Home and family obligations are central. The foundation is solid but the expectations run deep.",
  5: "Fun and spontaneity don't come naturally here. Joy is earned through effort, but that makes it more meaningful.",
  6: "You tackle life's practical demands as a disciplined team. Routines and responsibilities bond you.",
  7: "This bond demands fairness and maturity. It has real staying power but rigidity can be an issue.",
  8: "Trust and power dynamics surface. Building emotional safety takes time but the depth is worth it.",
  9: "Growth comes through tested beliefs and structured learning. Expanding together requires patience.",
  10: "A serious, goal-oriented bond. You push each other toward responsibility and long-term thinking.",
  11: "Your shared circle may be small but loyal. Working toward common goals requires sustained effort.",
  12: "Old family patterns and unspoken dynamics surface for healing. This bond asks you to face what's been buried.",
};

/* ─── Generate Relationship Summary ─── */

export type RelationshipCategory = "partner" | "family" | "friend";

export function generateRelationshipSummary(
  compositeData: {
    bigThree?: { sun?: string; moon?: string; rising?: string };
    planets?: { name: string; sign: string; house?: number | null }[];
    houses?: { number: number; sign: string }[];
    aspects?: { p1Name: string; p2Name: string; aspect: string; orbit: number }[];
  },
  category: RelationshipCategory = "partner",
  personName?: string,
): { title: string; themes: { heading: string; body: string }[] } {
  const themes: { heading: string; body: string }[] = [];
  const isPlatonic = category === "family" || category === "friend";
  const firstName = personName?.split(" ")[0] || "";

  const sunSign = compositeData.bigThree?.sun;
  const moonSign = compositeData.bigThree?.moon;
  const risingSign = compositeData.bigThree?.rising;

  // Track which houses are already covered by Sun/Moon to avoid redundancy
  const coveredHouses = new Set<number>();

  // ── 1. Relationship identity (Sun sign) — what it IS
  if (sunSign && COMPOSITE_SUN_SIGN[sunSign]) {
    const s = COMPOSITE_SUN_SIGN[sunSign];
    themes.push({
      heading: s.theme,
      body: isPlatonic ? adaptForPlatonic(s.description) : s.description,
    });
  }

  // ── 2. Public image (Rising sign) — how it LOOKS
  if (risingSign && COMPOSITE_RISING_SIGN[risingSign]) {
    const r = COMPOSITE_RISING_SIGN[risingSign];
    const heading = isPlatonic ? adaptForPlatonic(r.theme) : r.theme;
    themes.push({
      heading: firstName ? `You & ${firstName}: ${heading}` : heading,
      body: isPlatonic ? adaptForPlatonic(r.description) : r.description,
    });
  }

  // ── 3. Emotional needs (Moon sign) — how it FEELS
  if (moonSign && COMPOSITE_MOON_SIGN[moonSign]) {
    const m = COMPOSITE_MOON_SIGN[moonSign];
    themes.push({
      heading: m.theme,
      body: isPlatonic ? adaptForPlatonic(m.description) : m.description,
    });
  }

  // ── 4. Sun's house — where the relationship's purpose lives
  const sunPlanet = compositeData.planets?.find((p) => p.name === "Sun");
  if (sunPlanet?.house && COMPOSITE_SUN_HOUSE[sunPlanet.house]) {
    coveredHouses.add(sunPlanet.house);
    // Use platonic override for house 5 (Romance → Creativity)
    const h = (isPlatonic && sunPlanet.house === 5)
      ? PLATONIC_SUN_HOUSE_5
      : COMPOSITE_SUN_HOUSE[sunPlanet.house];
    const body = isPlatonic ? adaptForPlatonic(h.description) : h.description;
    themes.push({
      heading: `Your purpose together: ${h.area}`,
      body,
    });
  }

  // ── 5. Moon's house — where comfort lives (skip if same house as Sun)
  const moonPlanet = compositeData.planets?.find((p) => p.name === "Moon");
  if (moonPlanet?.house && COMPOSITE_MOON_HOUSE[moonPlanet.house] && !coveredHouses.has(moonPlanet.house)) {
    coveredHouses.add(moonPlanet.house);
    const body = isPlatonic
      ? adaptForPlatonic(COMPOSITE_MOON_HOUSE[moonPlanet.house])
      : COMPOSITE_MOON_HOUSE[moonPlanet.house];
    themes.push({
      heading: "Where you find comfort",
      body,
    });
  }

  // ── 6. Pick the 1-2 most interesting planet highlights (skip houses already covered)
  const planetHighlights: { heading: string; body: string }[] = [];
  for (const planetName of ["Venus", "Saturn", "Jupiter", "Mars"]) {
    const planet = compositeData.planets?.find((p) => p.name === planetName);
    if (planet?.house && COMPOSITE_PLANET_HOUSE[planetName]?.[planet.house] && !coveredHouses.has(planet.house)) {
      const label = isPlatonic
        ? (planetName === "Venus" ? "Bond style"
            : planetName === "Saturn" ? "Where you're tested"
              : planetName === "Jupiter" ? "Where you grow"
                : "Where your fire burns")
        : (planetName === "Venus" ? "Love style"
            : planetName === "Saturn" ? "Where you're tested"
              : planetName === "Jupiter" ? "Where you grow"
                : "Where your fire burns");
      // Use dedicated platonic overrides for Venus & Saturn; regex for others
      let body: string;
      if (isPlatonic && planetName === "Venus" && PLATONIC_VENUS_HOUSE[planet.house]) {
        body = PLATONIC_VENUS_HOUSE[planet.house];
      } else if (isPlatonic && planetName === "Saturn" && PLATONIC_SATURN_HOUSE[planet.house]) {
        body = PLATONIC_SATURN_HOUSE[planet.house];
      } else if (isPlatonic) {
        body = adaptForPlatonic(COMPOSITE_PLANET_HOUSE[planetName][planet.house]);
      } else {
        body = COMPOSITE_PLANET_HOUSE[planetName][planet.house];
      }
      planetHighlights.push({ heading: label, body });
    }
  }
  // Only add up to 2 planet highlights to keep cards focused
  themes.push(...planetHighlights.slice(0, 2));

  // ── 7. One key aspect (the most significant one found)
  if (compositeData.aspects) {
    // For platonic relationships, deprioritize Venus-Mars (sexual chemistry)
    const keyPairs = isPlatonic
      ? ["Sun-Moon", "Sun-Saturn", "Moon-Venus", "Sun-Venus", "Venus-Mars"]
      : ["Venus-Mars", "Sun-Moon", "Moon-Venus", "Sun-Venus", "Sun-Saturn"];
    for (const pair of keyPairs) {
      const [p1, p2] = pair.split("-");
      const match = compositeData.aspects.find(
        (a) =>
          (a.p1Name === p1 && a.p2Name === p2) ||
          (a.p1Name === p2 && a.p2Name === p1)
      );
      if (match && COMPOSITE_ASPECT_MEANINGS[pair]?.[match.aspect]) {
        const aspectLabel =
          match.aspect === "conjunction" ? "united"
            : match.aspect === "opposition" ? "in tension"
              : match.aspect === "trine" ? "in harmony"
                : match.aspect === "square" ? "in friction"
                  : "linked";
        const body = isPlatonic
          ? adaptForPlatonic(COMPOSITE_ASPECT_MEANINGS[pair][match.aspect])
          : COMPOSITE_ASPECT_MEANINGS[pair][match.aspect];
        themes.push({
          heading: `${p1} & ${p2} — ${aspectLabel}`,
          body,
        });
        break; // Only one aspect card to avoid overload
      }
    }
  }

  const bondWord = isPlatonic ? "Bond" : "Relationship";
  const themeLabel = sunSign ? (COMPOSITE_SUN_SIGN[sunSign]?.theme || sunSign) : "";
  return {
    title: firstName
      ? `You & ${firstName}: ${themeLabel || bondWord}`
      : themeLabel ? `${themeLabel} ${bondWord}` : "Your Composite Chart",
    themes,
  };
}
