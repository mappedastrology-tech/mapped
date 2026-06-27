/**
 * Synastry aspect interpretation copy.
 *
 * Several Maps sections used to generate text keyed on a single coarse
 * dimension — a category word ("communication"), or an aspect's nature
 * (harmonious/challenging) — so genuinely different planet pairs collapsed to
 * identical sentences. This module returns copy keyed on the actual planet
 * pair, so every line reflects the specific chart.
 *
 *   getGrowthArea   — hard aspects (square / opposition / quincunx)  → "Growth areas"
 *   getStrengthArea — soft aspects (trine / sextile)                 → "Strengths"
 *   getMergeArea    — conjunctions                                   → fused energies
 *   getAspectCopy   — routes by aspect type (used by the aspect list)
 *
 * Copy is mutual ("one of you… the other…") so it reads correctly regardless of
 * which person owns which planet.
 */

const THEME: Record<string, string> = {
  Sun: "a need to be seen",
  Moon: "emotional needs",
  Mercury: "a communication style",
  Venus: "a way of loving",
  Mars: "drive and temper",
  Jupiter: "a push to expand",
  Saturn: "caution and rules",
  Uranus: "a need for freedom",
  Neptune: "dreams and idealism",
  Pluto: "intensity and control",
};

function key(a: string, b: string): string {
  return [a, b].sort().join("|");
}

// ───────────────────────── Hard aspects (Growth areas) ─────────────────────────

const TENSION_PAIR: Record<string, string> = {
  "Jupiter|Mars": "One of you wants to go big and fast, the other wants it bigger — you egg each other on past the point of good judgment. Restraint is the missing ingredient.",
  "Jupiter|Mercury": "Big-picture optimism meets the fine print: one glosses the details, the other gets lost in them. Agreeing on the actual facts takes effort.",
  "Jupiter|Moon": "One wants room to roam, the other wants reassurance. Generosity tips into too much, and needs can feel either smothered or brushed aside.",
  "Jupiter|Neptune": "Two dreamers with no brakes — inspiring, but prone to wishful thinking. It's easy to believe the best and miss what's actually true.",
  "Jupiter|Pluto": "Ambition runs hot: one wants to grow, the other wants to control how. It can quietly become a contest over who steers.",
  "Jupiter|Saturn": "Expansion versus caution — one says yes, the other says wait. Pacing and risk tolerance are the ongoing negotiation.",
  "Jupiter|Sun": "One inflates, the other wants to be seen as they already are. Confidence is contagious here, but so is overreach and ego.",
  "Jupiter|Uranus": "Both love freedom and dislike limits, so commitments stay loose and plans keep changing. Reliability is the thing that slips.",
  "Jupiter|Venus": "Indulgence is the theme — easy to overdo the good stuff and dodge the hard conversations. Pleasant, but it can avoid depth.",
  "Mars|Mercury": "Words turn sharp fast: one fires off, the other argues back, and talks heat up before they resolve. Pace and tone are the friction.",
  "Mars|Moon": "Drive meets sensitivity — one pushes, the other bruises. What reads as motivation to one lands as harshness to the other.",
  "Mars|Neptune": "Action meets fog. Energy gets misdirected or deflated, and it's hard to tell whether you're inspired or just avoiding. Follow-through wavers.",
  "Mars|Pluto": "Raw power on both sides — conflicts go from zero to total fast, and winning can matter more than resolving. Restraint is everything.",
  "Mars|Saturn": "One hits the gas, the other the brake. Drive gets blocked or criticized; frustration and stop-start energy are the pattern.",
  "Mars|Sun": "Two strong wills — great aimed at a shared target, combustible aimed at each other. Ego and competition flare easily.",
  "Mars|Uranus": "Impulse meets impulse — exciting and volatile. Reactions are fast and unpredictable, and tempers can spike out of nowhere.",
  "Mars|Venus": "Desire and affection keep misfiring — what one wants, the other offers differently. The chemistry is real, but the timing feels off.",
  "Mercury|Moon": "Head versus heart: one wants to talk it through, the other to feel it out, and each can find the other cold or irrational.",
  "Mercury|Neptune": "Wires cross easily — one means one thing, the other hears a dream. Vagueness and misremembering cause more friction than either intends.",
  "Mercury|Pluto": "Conversations probe and push — one digs, the other guards. It can slide into interrogation or mind games if you're not careful.",
  "Mercury|Saturn": "One thinks out loud, the other judges or shuts it down. Talks can feel like exams: careful, critical, and a little chilly.",
  "Mercury|Sun": "Identity and opinion tangle, so disagreements feel personal — one can feel talked over, the other unheard.",
  "Mercury|Uranus": "Quick minds on different channels — one jumps tracks, the other can't follow. Scattered, tangential, and interruption-prone.",
  "Mercury|Venus": "Small misreads in how you express care — what's meant warmly comes out flat, or sweet talk skips the substance. Minor, but recurring.",
  "Moon|Neptune": "Feelings blur with fantasy — easy to project, idealize, or absorb each other's moods until no one's sure whose feeling is whose.",
  "Moon|Pluto": "Emotions run deep and possessive. Closeness tips into control or jealousy, and old wounds get triggered hard.",
  "Moon|Saturn": "One reaches for comfort, the other for composure. Warmth can feel withheld and needs can feel like burdens — it runs cool when it should run warm.",
  "Moon|Sun": "Core self meets core needs and they don't quite sync — one feels unsupported, the other feels managed. Friction over what each requires day to day.",
  "Moon|Uranus": "Closeness and freedom pull opposite ways — one wants steadiness, the other space. Emotional consistency is hard to count on.",
  "Moon|Venus": "Affection styles diverge — what feels loving to one leaves the other cold. Sweet overall, but the comfort can miss its mark.",
  "Neptune|Pluto": "Subtle and generational — undercurrents of power and illusion you sense more than name. Rarely the loud problem, but it colors trust.",
  "Neptune|Saturn": "Dream versus reality — one wants to believe, the other wants proof. Disappointment and doubt erode the magic if left unmanaged.",
  "Neptune|Sun": "Identity goes hazy — one idealizes the other instead of seeing them clearly. Disillusionment follows when the real person shows up.",
  "Neptune|Uranus": "Both unstable in their own way — plans dissolve or swerve, and solid ground is hard to find. Mostly a background hum.",
  "Neptune|Venus": "Love through a soft filter — beautiful, but built partly on illusion. Idealizing each other sets up a let-down when reality lands.",
  "Pluto|Saturn": "Control meets endurance — a heavy, grinding dynamic. Power struggles get entrenched and neither yields easily.",
  "Pluto|Sun": "One wants to transform the other, who wants to stay themselves. Magnetic, but it can become a battle over identity and control.",
  "Pluto|Uranus": "Disruptive and intense — change arrives by upheaval rather than agreement. Volatile, and more generational than personal.",
  "Pluto|Venus": "Love runs obsessive and possessive — magnetic, but jealousy and power games lurk. It rarely stays light.",
  "Saturn|Sun": "One feels judged or limited by the other. There's an authority-and-approval dynamic that can dim confidence over time.",
  "Saturn|Uranus": "Order versus rebellion — one tightens, the other breaks loose. The tug between structure and freedom defines the friction.",
  "Saturn|Venus": "Affection meets restraint — love feels tested, rationed, or dutiful. Warmth has to push past coolness and a fear of vulnerability.",
  "Sun|Uranus": "One wants steadiness in who they are, the other keeps shaking it up. Exciting, but identity feels unstable and plans unreliable.",
  "Sun|Venus": "Pride and affection rub — one wants admiration, the other warmth, and flattery can stand in for real connection.",
  "Uranus|Venus": "Attraction runs hot then cold — exciting, erratic, allergic to routine. Hard to build steady closeness on such changeable ground.",
};

// ───────────────────────── Soft aspects (Strengths) ─────────────────────────

const HARMONY_PAIR: Record<string, string> = {
  "Jupiter|Mars": "Shared momentum — you greenlight each other's boldest moves and turn plans into action. Together you're braver and more decisive than either is alone.",
  "Jupiter|Mercury": "Ideas get bigger in the telling — you teach, plan, and brainstorm easily, and optimism keeps the conversation generous.",
  "Jupiter|Moon": "Warm and expansive — one's generosity meets the other's care, so the bond feels safe and abundant. You give each other room and reassurance at once.",
  "Jupiter|Neptune": "A shared sense of meaning — compassion and imagination flow, and you inspire each other toward something larger.",
  "Jupiter|Pluto": "Big, deep ambition that actually moves — you back each other's growth with real intensity and aim high together.",
  "Jupiter|Saturn": "Vision meets structure — one dreams it, the other builds it, so plans get both reach and a foundation. Sustainable growth is the gift.",
  "Jupiter|Sun": "Mutual encouragement — one shines, the other expands it, and confidence compounds. You make each other feel capable of more.",
  "Jupiter|Uranus": "Adventurous and open — you say yes to the new together and give each other freedom to grow. Exciting without feeling unstable.",
  "Jupiter|Venus": "Easy generosity and pleasure — affection flows, tastes align, and you enjoy the good things together without keeping score.",
  "Mars|Mercury": "Quick, decisive thinking — you talk things through and act on them fast. Debate energizes rather than divides, and you get things done.",
  "Mars|Moon": "Protective and responsive — one's drive shields the other's feelings, and passion has warmth behind it. You move and care in sync.",
  "Mars|Neptune": "Inspired action — dreams get legs here, and you pursue ideals together with real devotion. Energy serves something meaningful.",
  "Mars|Pluto": "Formidable together — deep drive and stamina that can move mountains when aligned. Few obstacles survive your combined focus.",
  "Mars|Saturn": "Disciplined drive — energy gets structure, so effort actually lasts. You build endurance and follow-through into whatever you tackle.",
  "Mars|Sun": "Aligned willpower — you energize each other and push toward goals as a team. Confidence and action reinforce each other.",
  "Mars|Uranus": "Electric initiative — you spark each other into bold, original moves. Fast, exciting, and rarely boring when channeled.",
  "Mars|Venus": "Classic chemistry — desire and affection click, and attraction stays easy and warm. The spark survives without much effort.",
  "Mercury|Moon": "Head and heart in sync — you can talk about feelings without it getting tangled. Understanding comes naturally.",
  "Mercury|Neptune": "Imaginative rapport — you finish each other's half-formed ideas and speak in images and intuition. Creatively attuned.",
  "Mercury|Pluto": "Deep, perceptive talk — you go beneath the surface together and trust each other with real truths. Conversations matter here.",
  "Mercury|Saturn": "Clear, grounded communication — you think things through carefully and take each other seriously. Plans hold up.",
  "Mercury|Sun": "On the same page — your thinking and their sense of self line up, so you feel both understood and articulate together.",
  "Mercury|Uranus": "Bright, inventive minds — you spark ideas off each other and love a good tangent. Mentally quick and never dull.",
  "Mercury|Venus": "Sweet, easy communication — you say kind things well and the everyday exchange feels warm and considerate.",
  "Moon|Neptune": "Tender, intuitive closeness — you sense each other's moods and offer gentle, compassionate care.",
  "Moon|Pluto": "Profound emotional bonding — you reach each other's depths and form an intimate, loyal tie. Feelings run deep and true.",
  "Moon|Saturn": "Dependable comfort — care comes with commitment, and you make each other feel safe and held over time. Steady warmth.",
  "Moon|Sun": "Natural understanding — one shines, the other nurtures, and you instinctively get what the other needs. Easy and home-like.",
  "Moon|Uranus": "Refreshing emotional honesty — you give each other space and accept each other's quirks. Closeness without clinging.",
  "Moon|Venus": "Soft and affectionate — feelings and love language align, so tenderness flows. Comfort and warmth come easily.",
  "Neptune|Pluto": "A shared depth of vision — subtle, generational attunement to meaning and transformation. Quietly bonding.",
  "Neptune|Saturn": "Grounded dreams — you make ideals real and give structure to compassion. Vision with staying power.",
  "Neptune|Sun": "Inspired identity — one lifts the other toward their ideals and reflects their best self. Gently uplifting.",
  "Neptune|Uranus": "Visionary and open — you imagine new possibilities together without rigid expectations. Future-leaning.",
  "Neptune|Venus": "Romantic and tender — love takes on a dreamy, compassionate quality. Beauty and devotion flow.",
  "Pluto|Saturn": "Enduring intensity — you commit deeply and weather hard things together. Built to withstand pressure.",
  "Pluto|Sun": "Empowering depth — one helps the other transform and step into real strength. Magnetic and growth-driving.",
  "Pluto|Uranus": "Catalytic change — you push each other to evolve in bold, freeing ways. Dynamic and transformative.",
  "Pluto|Venus": "Magnetic devotion — love runs deep and transformative, intimate in a way that reshapes you both.",
  "Saturn|Sun": "Respect and backbone — one steadies the other's identity, and you build something durable. Maturity and trust.",
  "Saturn|Uranus": "Stable innovation — structure meets originality, so new ideas actually get built. Freedom with a foundation.",
  "Saturn|Venus": "Committed affection — love is loyal, patient, and built to last. Warmth you can rely on.",
  "Sun|Uranus": "Energizing individuality — you celebrate what's unique in each other and keep things fresh. Inspiring autonomy.",
  "Sun|Venus": "Warm mutual admiration — you genuinely like and appreciate each other. Affection and identity glow together.",
  "Uranus|Venus": "Exciting, free-spirited attraction — love feels fresh, playful, and unbound by routine. Sparky and light.",
};

// ───────────────────────── Conjunctions (fused energies) ─────────────────────────

const MERGE_PAIR: Record<string, string> = {
  "Jupiter|Mars": "Expansion fuses with drive — bold, restless, and hungry for more. Exhilarating, with a real risk of overreach.",
  "Jupiter|Mercury": "Big ideas and big talk merge — persuasive, optimistic, idea-rich. Watch for promising more than you can deliver.",
  "Jupiter|Moon": "Generosity fuses with feeling — warm, abundant, emotionally expansive. Can tip into excess or mood swings.",
  "Jupiter|Neptune": "Faith and imagination merge — visionary and compassionate, occasionally unrealistic. Inspiring but easily ungrounded.",
  "Jupiter|Pluto": "Ambition fuses with intensity — a relentless drive to grow and transform on a big scale. Powerful, with a shadow of obsession.",
  "Jupiter|Saturn": "Growth meets discipline — you build big things deliberately. Ambition with a plan, as long as patience holds.",
  "Jupiter|Sun": "Confidence and expansion fuse — radiant, generous, larger than life. Ego and overreach are the risks.",
  "Jupiter|Uranus": "Freedom and luck merge — sudden opportunities and a taste for the unconventional. Thrilling and unpredictable.",
  "Jupiter|Venus": "Pleasure and abundance fuse — indulgent, warm, generous with affection. Lovely, with a tendency to overdo.",
  "Mars|Mercury": "Thought fuses with action — sharp, fast, decisive, sometimes combative. Quick to speak and quick to move.",
  "Mars|Moon": "Drive fuses with feeling — passionate and reactive, protective but volatile. Emotions move straight into action.",
  "Mars|Neptune": "Energy merges with dream — inspired or scattered, devoted or deceived. Action aimed at something unseen.",
  "Mars|Pluto": "Raw force fuses with depth — immense, almost ruthless power. Magnetic and intense, risky if uncontrolled.",
  "Mars|Saturn": "Drive meets control — disciplined, enduring effort, or blocked frustration. Cold persistence either way.",
  "Mars|Sun": "Will fuses with action — bold, energetic, assertive. A powerhouse aimed well, a hothead aimed badly.",
  "Mars|Uranus": "Drive fuses with rebellion — explosive, fast, electric. Brilliant initiative or reckless impulse.",
  "Mars|Venus": "Desire fuses with affection — magnetic, sensual, immediate. The classic attraction signature.",
  "Mercury|Moon": "Mind fuses with feeling — you think and feel as one channel. Articulate emotions, or moody overthinking.",
  "Mercury|Neptune": "Thought merges with imagination — poetic, intuitive, sometimes vague. Inspired talk that blurs the facts.",
  "Mercury|Pluto": "Mind fuses with depth — penetrating, investigative, intense. Powerful insight or compulsive overthinking.",
  "Mercury|Saturn": "Thought meets structure — careful, serious, precise. A disciplined mind, or a critical and rigid one.",
  "Mercury|Sun": "Identity fuses with intellect — you think out loud as who you are. Bright and expressive, occasionally one-note.",
  "Mercury|Uranus": "Mind fuses with lightning — fast, original, inventive. Genius sparks and scattered tangents both.",
  "Mercury|Venus": "Thought fuses with charm — graceful, warm, well-spoken. Communication that pleases and connects.",
  "Moon|Neptune": "Feeling merges with dream — deeply sensitive, empathic, impressionable. Tender, sometimes boundaryless.",
  "Moon|Pluto": "Emotion fuses with depth — intense, intimate, all-consuming. Profound bonding or obsessive attachment.",
  "Moon|Saturn": "Feeling meets structure — steady, committed, contained. Emotional security, or emotional restraint.",
  "Moon|Sun": "Self fuses with feeling — whole and integrated, identity and needs as one. Warm, home-like unity.",
  "Moon|Uranus": "Feeling fuses with freedom — emotionally electric and independent. Exciting, but the moods are unpredictable.",
  "Moon|Venus": "Feeling fuses with love — tender, affectionate, nurturing. Soft and warm at the core.",
  "Neptune|Pluto": "Dream merges with depth — generational, mystical, transformative undercurrents. Subtle and powerful.",
  "Neptune|Saturn": "Dream meets structure — ideals made real, or doubt cast on the vague. Disciplined imagination.",
  "Neptune|Sun": "Identity merges with dream — inspired, idealistic, sometimes unclear. Luminous or self-deceived.",
  "Neptune|Uranus": "Imagination fuses with revolution — visionary, future-facing, unstable. Big ideas on shaky ground.",
  "Neptune|Venus": "Love merges with dream — romantic, idealized, compassionate. Enchanting, with a soft focus on reality.",
  "Pluto|Saturn": "Power meets endurance — heavy, controlled, transformative through sheer persistence. Formidable and grinding.",
  "Pluto|Sun": "Identity fuses with power — magnetic, intense, commanding presence. Transformative, with control issues lurking.",
  "Pluto|Uranus": "Power fuses with upheaval — explosive, revolutionary, generational. Radical change by force.",
  "Pluto|Venus": "Love fuses with power — obsessive, magnetic, all-or-nothing. Transformative desire that doesn't let go.",
  "Saturn|Sun": "Identity meets structure — serious, responsible, self-disciplined. Solid, or self-doubting and heavy.",
  "Saturn|Uranus": "Structure fuses with rebellion — disciplined innovation, or tension between old and new. Built breakthroughs.",
  "Saturn|Venus": "Love meets commitment — loyal, durable, serious affection. Devoted, or cool and dutiful.",
  "Sun|Uranus": "Identity fuses with originality — individual, electric, unconventional. Brilliantly yourself, hard to pin down.",
  "Sun|Venus": "Identity fuses with charm — warm, attractive, gracious. You shine through affection and beauty.",
  "Uranus|Venus": "Love fuses with freedom — unconventional, exciting, unpredictable attraction. Sparky and unbound.",
};

// ───────── Platonic overrides (family/friend) for romance-coded pairs ─────────
// Only the pairs whose default copy reads romantically need a platonic variant;
// everything else is already relationship-neutral.

const HARMONY_PLATONIC: Record<string, string> = {
  "Mars|Venus": "Easy, energizing teamwork — you click, and doing things together just feels good. The warmth and momentum last.",
  "Pluto|Venus": "Deep devotion — the bond runs deep and reshapes you both, intense and loyal in a way that's rare.",
  "Uranus|Venus": "Free-spirited and fun — the rapport stays fresh and playful, never stuck in routine.",
  "Neptune|Venus": "Tender and idealistic — warmth takes on a dreamy, compassionate quality, and kindness flows easily.",
  "Moon|Pluto": "Profound emotional bonding — you reach each other's depths and form a deep, loyal tie. Feelings run true.",
};

const TENSION_PLATONIC: Record<string, string> = {
  "Mars|Venus": "Wires cross over wants and pace — what one person is up for, the other approaches differently, so timing feels off even when you're close.",
  "Pluto|Venus": "Closeness runs deep and possessive — loyalty is real, but jealousy and control can creep in. It rarely stays light.",
  "Uranus|Venus": "Closeness runs hot then cold — fun and unpredictable, but hard to make steady or rely on.",
  "Neptune|Venus": "Warmth through a soft filter — kind, but idealizing each other sets up a let-down when reality lands.",
};

const MERGE_PLATONIC: Record<string, string> = {
  "Mars|Venus": "Drive fuses with warmth — immediate and energizing, the kind of pairing that gets things moving and feels good doing it.",
  "Pluto|Venus": "Warmth fuses with power — deep, all-or-nothing devotion that reshapes you both. Not a casual bond.",
  "Uranus|Venus": "Warmth fuses with freedom — unconventional, exciting, and unpredictable closeness. Sparky and unbound.",
  "Neptune|Venus": "Warmth merges with dream — idealized and compassionate. Enchanting, with a soft focus on reality.",
  "Moon|Pluto": "Emotion fuses with depth — intense, deep, all-consuming. Profound bonding, or possessive attachment.",
};

// ───────────────────────── Public API ─────────────────────────

/** Hard-aspect challenge copy (Growth areas). */
export function getGrowthArea(p1Name: string, p2Name: string, _aspect?: string, platonic = false): string {
  if (p1Name === p2Name) {
    const t = THEME[p1Name];
    if (t) return `You both lead with ${t}, and when it clashes neither of you backs down easily. The standoff is the work.`;
    return `You share this drive strongly, and when it collides neither gives ground. Learning to yield is the growth.`;
  }
  const k = key(p1Name, p2Name);
  if (platonic && TENSION_PLATONIC[k]) return TENSION_PLATONIC[k];
  const direct = TENSION_PAIR[k];
  if (direct) return direct;
  const a = THEME[p1Name];
  const b = THEME[p2Name];
  if (a && b) return `One of you brings ${a}, the other ${b}, and the two don't naturally mesh — expect friction that asks for real compromise.`;
  return `Your ${p1Name} and their ${p2Name} pull in different directions here, which takes patience and compromise to bridge.`;
}

/** Soft-aspect strength copy (Strengths). */
export function getStrengthArea(p1Name: string, p2Name: string, _aspect?: string, platonic = false): string {
  if (p1Name === p2Name) {
    const t = THEME[p1Name];
    if (t) return `You share ${t}, and in easy aspect it reinforces rather than competes — you instinctively get this part of each other.`;
    return `You share this strongly, and it flows easily between you — a point of natural, effortless agreement.`;
  }
  const k = key(p1Name, p2Name);
  if (platonic && HARMONY_PLATONIC[k]) return HARMONY_PLATONIC[k];
  const direct = HARMONY_PAIR[k];
  if (direct) return direct;
  const a = THEME[p1Name];
  const b = THEME[p2Name];
  if (a && b) return `One of you brings ${a}, the other ${b}, and here they support each other — an easy, complementary fit.`;
  return `Your ${p1Name} and their ${p2Name} work together smoothly here, adding ease to how you relate.`;
}

/** Conjunction copy (fused energies). */
export function getMergeArea(p1Name: string, p2Name: string, _aspect?: string, platonic = false): string {
  if (p1Name === p2Name) {
    const t = THEME[p1Name];
    if (t) return `You double down on ${t} — the same energy amplified. Powerful when aligned, overwhelming when it isn't.`;
    return `The same energy doubles here — amplified for better and worse, and impossible to ignore.`;
  }
  const k = key(p1Name, p2Name);
  if (platonic && MERGE_PLATONIC[k]) return MERGE_PLATONIC[k];
  const direct = MERGE_PAIR[k];
  if (direct) return direct;
  const a = THEME[p1Name];
  const b = THEME[p2Name];
  if (a && b) return `${a[0].toUpperCase()}${a.slice(1)} fuses with ${b} — an intense, blended focus that's magnetic or overwhelming depending on how you handle it.`;
  return `Your ${p1Name} and their ${p2Name} fuse into a single intense focus — a defining, can't-ignore-it point of the bond.`;
}

/** Route to the right copy by aspect type (used by the full aspect list). */
export function getAspectCopy(p1Name: string, p2Name: string, aspect: string, platonic = false): string {
  if (aspect === "conjunction") return getMergeArea(p1Name, p2Name, aspect, platonic);
  if (aspect === "trine" || aspect === "sextile") return getStrengthArea(p1Name, p2Name, aspect, platonic);
  if (aspect === "square" || aspect === "opposition" || aspect === "quincunx") return getGrowthArea(p1Name, p2Name, aspect, platonic);
  return getStrengthArea(p1Name, p2Name, aspect, platonic);
}
