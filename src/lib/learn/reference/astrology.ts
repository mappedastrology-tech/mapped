import type { ReferenceEntry } from "../types";

/**
 * Quick-reference for the core astrology vocabulary — the 12 signs, 10 planets,
 * 12 houses, the 5 major aspects, and key points. Makes search resolve everyday
 * terms like "scorpio", "mars", "trine", or "7th house".
 */

function sign(id: string, name: string, dates: string, element: string, modality: string, ruler: string, summary: string, keywords: string, strengths: string, watchouts: string): ReferenceEntry {
  return {
    domain: "astrology", id: `sign-${id}`, name, category: "Zodiac sign", summary,
    image: `/images/learn/zodiac-${id}.webp`,
    fields: [
      { label: "Dates", value: dates },
      { label: "Element", value: element },
      { label: "Modality", value: modality },
      { label: "Ruling planet", value: ruler },
      { label: "Keywords", value: keywords },
      { label: "Strengths", value: strengths },
      { label: "Watch-outs", value: watchouts },
    ],
    tags: ["sign", "zodiac", element.toLowerCase(), modality.toLowerCase()],
  };
}

function planet(id: string, name: string, symbol: string, summary: string, rules: string, keywords: string, cycle: string): ReferenceEntry {
  return {
    domain: "astrology", id: `planet-${id}`, name, category: "Planet", summary,
    fields: [
      { label: "Symbol", value: symbol },
      { label: "Rules", value: rules },
      { label: "Keywords", value: keywords },
      { label: "Cycle", value: cycle },
    ],
    tags: ["planet"],
  };
}

function house(num: number, ordinal: string, summary: string, naturalSign: string, type: string, keywords: string): ReferenceEntry {
  return {
    domain: "astrology", id: `house-${num}`, name: `${ordinal} House`,
    aka: [`${num}th house`, `house ${num}`, `${num} house`],
    category: "House", summary,
    fields: [
      { label: "Natural sign", value: naturalSign },
      { label: "Type", value: type },
      { label: "Keywords", value: keywords },
    ],
    tags: ["house", `${num}`, ordinal.toLowerCase(), type.toLowerCase()],
  };
}

function aspect(id: string, name: string, angle: string, nature: string, summary: string, feels: string, orb: string): ReferenceEntry {
  return {
    domain: "astrology", id: `aspect-${id}`, name, category: "Aspect", summary,
    fields: [
      { label: "Angle", value: angle },
      { label: "Nature", value: nature },
      { label: "Feels like", value: feels },
      { label: "Typical orb", value: orb },
    ],
    tags: ["aspect"],
  };
}

function point(id: string, name: string, aka: string[], summary: string, detail: string): ReferenceEntry {
  return {
    domain: "astrology", id: `point-${id}`, name, aka, category: "Point / angle", summary,
    fields: [{ label: "Meaning", value: detail }],
    tags: ["point", "angle"],
  };
}

function concept(id: string, name: string, category: string, summary: string, fields: { label: string; value: string }[], tags: string[]): ReferenceEntry {
  return { domain: "astrology", id, name, category, summary, fields, tags };
}

export const astrologyReference: ReferenceEntry[] = [
  // ── 12 signs ──
  sign("aries", "Aries", "Mar 21 – Apr 19", "Fire", "Cardinal", "Mars",
    "Aries is the first sign — cardinal fire, ruled by Mars. It's the zodiac's initiator: bold, direct, and quick to act, happiest leading, starting, and meeting a challenge head-on. At its best it's brave and refreshingly honest; off-balance it turns impulsive, impatient, and combative.",
    "Initiative, courage, drive, independence, directness", "Brave, energetic, honest, a natural starter", "Impulsive, impatient, can pick fights"),
  sign("taurus", "Taurus", "Apr 20 – May 20", "Earth", "Fixed", "Venus",
    "Taurus is fixed earth, ruled by Venus — the zodiac's builder. Steady, sensual, and patient, it values comfort, beauty, security, and what it can rely on. At its best it's grounded and devoted; off-balance it becomes stubborn, possessive, and stuck.",
    "Stability, sensuality, patience, loyalty, comfort", "Reliable, devoted, calm, good with resources", "Stubborn, possessive, resistant to change"),
  sign("gemini", "Gemini", "May 21 – Jun 20", "Air", "Mutable", "Mercury",
    "Gemini is mutable air, ruled by Mercury — the messenger. Curious, quick, and talkative, it loves ideas, variety, and connection, moving easily between interests and people. At its best it's witty and adaptable; off-balance it scatters and grows restless.",
    "Curiosity, communication, wit, versatility, adaptability", "Clever, sociable, adaptable, quick to learn", "Scattered, restless, can seem two-faced"),
  sign("cancer", "Cancer", "Jun 21 – Jul 22", "Water", "Cardinal", "Moon",
    "Cancer is cardinal water, ruled by the Moon — the nurturer. Caring, intuitive, and protective, it leads with feeling and builds safety for the people it loves. At its best it's deeply empathetic and loyal; off-balance it gets moody, clingy, and defensive.",
    "Nurture, intuition, home, memory, protection", "Caring, intuitive, loyal, devoted to family", "Moody, clingy, retreats into its shell"),
  sign("leo", "Leo", "Jul 23 – Aug 22", "Fire", "Fixed", "Sun",
    "Leo is fixed fire, ruled by the Sun — the performer. Warm, proud, and generous, it shines through self-expression, play, and heartfelt leadership. At its best it's radiant and big-hearted; off-balance it turns egocentric, dramatic, and hungry for the spotlight.",
    "Confidence, warmth, creativity, generosity, pride", "Generous, charismatic, loyal, encouraging", "Egocentric, dramatic, needs attention"),
  sign("virgo", "Virgo", "Aug 23 – Sep 22", "Earth", "Mutable", "Mercury",
    "Virgo is mutable earth, ruled by Mercury — the analyst. Precise, practical, and helpful, it improves things through attention to detail and devoted service. At its best it's capable and discerning; off-balance it becomes critical, anxious, and perfectionistic.",
    "Precision, service, analysis, health, improvement", "Diligent, helpful, discerning, practical", "Overly critical, anxious, perfectionist"),
  sign("libra", "Libra", "Sep 23 – Oct 22", "Air", "Cardinal", "Venus",
    "Libra is cardinal air, ruled by Venus — the diplomat. Fair, charming, and relational, it seeks balance, beauty, and harmony, and thinks best in partnership. At its best it's gracious and just; off-balance it grows indecisive and conflict-avoidant.",
    "Balance, harmony, partnership, fairness, charm", "Diplomatic, fair, charming, cooperative", "Indecisive, avoids conflict, people-pleasing"),
  sign("scorpio", "Scorpio", "Oct 23 – Nov 21", "Water", "Fixed", "Mars / Pluto",
    "Scorpio is fixed water, ruled by Mars and — in modern practice — Pluto, the investigator. Intense, private, and perceptive, it dives beneath the surface toward truth, intimacy, and transformation. At its best it's loyal and transformative; off-balance it turns jealous, controlling, and secretive.",
    "Intensity, depth, transformation, loyalty, power", "Loyal, perceptive, resilient, passionate", "Jealous, controlling, holds grudges"),
  sign("sagittarius", "Sagittarius", "Nov 22 – Dec 21", "Fire", "Mutable", "Jupiter",
    "Sagittarius is mutable fire, ruled by Jupiter — the explorer. Free, optimistic, and philosophical, it chases meaning, adventure, and the bigger picture. At its best it's expansive and honest; off-balance it grows restless, blunt, and over-promising.",
    "Freedom, optimism, adventure, meaning, honesty", "Optimistic, adventurous, honest, open-minded", "Restless, tactless, over-promises"),
  sign("capricorn", "Capricorn", "Dec 22 – Jan 19", "Earth", "Cardinal", "Saturn",
    "Capricorn is cardinal earth, ruled by Saturn — the strategist. Disciplined, ambitious, and patient, it climbs steadily toward long-term goals and earned authority. At its best it's responsible and enduring; off-balance it becomes cold, rigid, and all work.",
    "Discipline, ambition, structure, patience, responsibility", "Hardworking, responsible, patient, capable", "Cold, rigid, work over life"),
  sign("aquarius", "Aquarius", "Jan 20 – Feb 18", "Air", "Fixed", "Saturn / Uranus",
    "Aquarius is fixed air, ruled by Saturn and — in modern practice — Uranus, the visionary. Independent, inventive, and humane, it thinks ahead, questions norms, and cares about the collective. At its best it's original and principled; off-balance it turns aloof and emotionally detached.",
    "Independence, innovation, community, ideals, originality", "Inventive, principled, open-minded, humane", "Aloof, contrarian, emotionally distant"),
  sign("pisces", "Pisces", "Feb 19 – Mar 20", "Water", "Mutable", "Jupiter / Neptune",
    "Pisces is mutable water, ruled by Jupiter and — in modern practice — Neptune, the dreamer. Imaginative, compassionate, and porous, it feels everything and softens the boundary between self and world. At its best it's creative and empathic; off-balance it drifts into escapism and self-sacrifice.",
    "Imagination, compassion, intuition, spirituality, surrender", "Empathetic, creative, gentle, intuitive", "Escapist, weak boundaries, self-sacrificing"),

  // ── 10 planets & luminaries ──
  planet("sun", "Sun", "☉",
    "The Sun is your core identity — the conscious self you're growing into. It shows your essential vitality, ego, and the qualities you radiate when you're most fully yourself. By sign it describes your basic character; by house, the area of life where you most need to express and be seen.",
    "Leo", "Identity, vitality, ego, purpose, will", "Circles the zodiac in ~1 year — about a month per sign"),
  planet("moon", "Moon", "☽",
    "The Moon governs your emotional inner world — instincts, moods, needs, and what makes you feel safe and at home. It's your automatic, private self and your bond with comfort, nurture, and the past. By sign it shows how you feel; by house, where you seek security.",
    "Cancer", "Emotion, instinct, needs, comfort, home", "Fastest body — circles the zodiac in ~27.3 days, ~2.5 days per sign"),
  planet("mercury", "Mercury", "☿",
    "Mercury rules the mind — how you think, learn, speak, and process information. It governs communication, curiosity, logic, and the everyday exchange of ideas. By sign it colours your mental style; its retrogrades famously scramble messages, travel, and plans.",
    "Gemini & Virgo", "Mind, communication, learning, logic, curiosity", "Never far from the Sun; retrogrades ~3× per year"),
  planet("venus", "Venus", "♀",
    "Venus governs love, beauty, pleasure, and value — what you find attractive and how you relate, attract, and appreciate. It shapes your taste, your approach to romance and money, and what brings you joy. By sign it shows what you love; by house, where you seek it.",
    "Taurus & Libra", "Love, beauty, values, pleasure, attraction", "Circles the zodiac in ~225 days; retrogrades ~every 18 months"),
  planet("mars", "Mars", "♂",
    "Mars is drive and desire — how you assert yourself, pursue what you want, and handle anger and conflict. It governs energy, courage, competition, and sex drive. By sign it shows how you go after things; by house, where you put your fight and effort.",
    "Aries (traditionally also Scorpio)", "Drive, action, desire, anger, courage", "Circles the zodiac in ~2 years; retrogrades ~every 2 years"),
  planet("jupiter", "Jupiter", "♃",
    "Jupiter is expansion, luck, and meaning — where you grow, seek opportunity, and find faith or philosophy. It governs abundance, optimism, travel, and higher learning, and it amplifies whatever it touches (the good and the excess). By sign and house it shows where life feels generous.",
    "Sagittarius (traditionally also Pisces)", "Growth, luck, faith, abundance, meaning", "~12-year orbit — about a year per sign"),
  planet("saturn", "Saturn", "♄",
    "Saturn is structure, discipline, and time — the teacher of limits, responsibility, and earned mastery. It governs boundaries, commitment, fear, and maturity, rewarding patient effort and exposing where you cut corners. Its first return near age 29 marks a major coming-of-age.",
    "Capricorn (traditionally also Aquarius)", "Discipline, structure, limits, responsibility, time", "~29.5-year orbit; Saturn return ~age 29"),
  planet("uranus", "Uranus", "♅",
    "Uranus is the awakener — sudden change, rebellion, invention, and the urge to break free. It governs innovation, individuality, and lightning-bolt insight, often arriving as disruption that liberates. A slow outer planet, its sign marks a generation more than a person.",
    "Aquarius (modern)", "Change, rebellion, innovation, freedom, insight", "~84-year orbit, ~7 years per sign"),
  planet("neptune", "Neptune", "♆",
    "Neptune is the dissolver — dreams, spirituality, imagination, and illusion. It governs compassion, art, and transcendence, but also fog, escapism, and idealisation, softening the boundary between self and other. A generational planet, its sign colours an era's collective dreams.",
    "Pisces (modern)", "Dreams, spirituality, imagination, illusion, compassion", "~165-year orbit, ~14 years per sign"),
  planet("pluto", "Pluto", "♇",
    "Pluto is deep transformation — power, death and rebirth, and what's buried or taboo. It governs intensity, control, and the slow, irreversible change that strips away and regenerates. The slowest of the classical bodies, its sign marks deep generational shifts.",
    "Scorpio (modern)", "Power, transformation, depth, rebirth, the buried", "~248-year orbit, 12–30 years per sign"),

  // ── 12 houses ──
  house(1, "First",
    "The 1st house is the chart's front door — your identity, body, appearance, and the instinctive way you approach life and meet new people. Planets here are worn openly. It begins at the Ascendant (Rising sign), the most personal angle of the chart.",
    "Aries", "Angular", "Self, identity, body, first impressions"),
  house(2, "Second",
    "The 2nd house covers what you have and what you value — money, possessions, income, and material security, but also self-worth and your relationship to resources. It shows how you earn, spend, and define 'enough.'",
    "Taurus", "Succedent", "Money, possessions, values, self-worth"),
  house(3, "Third",
    "The 3rd house is the everyday mind and immediate world — communication, thinking, learning, siblings, neighbours, short trips, and the daily flow of information.",
    "Gemini", "Cadent", "Communication, learning, siblings, local life"),
  house(4, "Fourth",
    "The 4th house is home and roots — family, your origins, your private inner life, and your sense of belonging. It begins at the IC, the chart's deepest, most hidden point, and describes the foundation you build from.",
    "Cancer", "Angular", "Home, family, roots, foundation"),
  house(5, "Fifth",
    "The 5th house is joy and self-expression — creativity, romance, play, pleasure, and children. It's where you create from the heart and shine simply because it delights you.",
    "Leo", "Succedent", "Creativity, romance, play, self-expression"),
  house(6, "Sixth",
    "The 6th house is daily work and well-being — routines, habits, health, service, and the craft of getting things done. It shows how you maintain body and life day to day.",
    "Virgo", "Cadent", "Work, health, routines, service"),
  house(7, "Seventh",
    "The 7th house is partnership — marriage, committed relationships, and significant one-to-one bonds, including business partners and open rivals. It begins at the Descendant and shows what you seek (and project) in others.",
    "Libra", "Angular", "Partnership, marriage, the other"),
  house(8, "Eighth",
    "The 8th house is the deep and shared — intimacy, sex, other people's money, debt, inheritance, and psychological transformation. It governs what we merge with, lose, and are reborn through.",
    "Scorpio", "Succedent", "Intimacy, shared resources, transformation, the taboo"),
  house(9, "Ninth",
    "The 9th house is the search for meaning — higher education, philosophy, religion, long-distance travel, and the big questions. It's where the mind reaches beyond the familiar.",
    "Sagittarius", "Cadent", "Beliefs, travel, higher learning, meaning"),
  house(10, "Tenth",
    "The 10th house is your public life — career, vocation, reputation, ambition, and your role in the world. It begins at the Midheaven, the chart's highest point, and points to what you're known for.",
    "Capricorn", "Angular", "Career, reputation, ambition, public role"),
  house(11, "Eleventh",
    "The 11th house is community and the future — friends, groups, networks, causes, and long-term hopes and wishes. It's where the individual connects to the collective.",
    "Aquarius", "Succedent", "Friends, community, networks, hopes"),
  house(12, "Twelfth",
    "The 12th house is the hidden and dissolving — the unconscious, solitude, retreat, secrets, endings, and what works behind the scenes. It's the most private, spiritual, and elusive house.",
    "Pisces", "Cadent", "Unconscious, solitude, endings, the hidden"),

  // ── 5 major aspects ──
  aspect("conjunction", "Conjunction", "0°", "Blended / intensified",
    "A conjunction fuses two planets at the same degree, blending their energies into a single, concentrated force. Whether it feels easy or tense depends entirely on which planets are involved — but the effect is always prominent and amplified.",
    "Two voices speaking as one — for better or worse", "~8°"),
  aspect("sextile", "Sextile", "60°", "Harmonious / opportunity",
    "A sextile is a gentle, supportive angle — an opportunity that's available if you reach for it. The two planets cooperate easily, offering talent or ease that still needs a little effort to switch on.",
    "An open door you choose to walk through", "~4°"),
  aspect("square", "Square", "90°", "Tense / dynamic",
    "A square is friction between two planets pulling in different directions. It creates tension, frustration, and challenge — but that very pressure is what drives growth, effort, and achievement.",
    "Productive friction that demands you act", "~7°"),
  aspect("trine", "Trine", "120°", "Harmonious / flowing",
    "A trine is the most harmonious angle — an easy, natural flow between two planets, usually of the same element. It brings talent and grace, though it can be so effortless it's taken for granted.",
    "Effortless flow you barely notice", "~8°"),
  aspect("opposition", "Opposition", "180°", "Polarity / tension",
    "An opposition sits two planets directly across the chart, creating a polarity to balance. It often plays out through other people or a push-pull between two needs, asking for integration rather than either/or.",
    "A see-saw seeking balance", "~8°"),

  // ── Key points & angles ──
  point("ascendant", "Ascendant (Rising)", ["rising", "rising sign", "asc", "ascendant"], "Your 'mask' and first impression — needs an exact birth time.", "The sign rising on the eastern horizon at birth. It colors how you approach life and meet the world, and it sets the houses."),
  point("midheaven", "Midheaven (MC)", ["mc", "midheaven"], "Your public role, career, and reputation.", "The highest point of the chart (the 10th-house cusp). It points to vocation, public image, and life direction."),
  point("north-node", "North Node", ["north node", "true node"], "Your soul's growth direction in this life.", "A point (not a body) marking where the Moon's orbit crosses the ecliptic going north. Traditionally, the qualities you're here to grow toward."),
  point("south-node", "South Node", ["south node"], "Your comfort zone and what you're growing beyond.", "Opposite the North Node — gifts and patterns you arrived with that can become a crutch."),
  point("chiron", "Chiron", ["chiron", "wounded healer"], "The 'wounded healer' — your deepest wound and gift.", "A minor body symbolizing a core wound that, once worked with, becomes a source of healing for yourself and others."),
  point("lilith", "Black Moon Lilith", ["lilith", "black moon"], "Your wild, untamed, unapologetic side.", "A calculated point representing raw, suppressed, or reclaimed feminine power — where you refuse to be tamed."),
  point("retrograde", "Retrograde", ["retrograde", "rx", "mercury retrograde"], "When a planet appears to move backward.", "An optical effect where a planet seems to reverse from Earth's view. Its themes turn inward, slow down, or get revisited — famously with Mercury and communication."),

  // ── 4 elements ──
  concept("element-fire", "Fire", "Element",
    "Fire is the element of spirit, energy, and action. Fire signs are warm, expressive, and instinctive — they radiate enthusiasm and want to initiate, perform, and explore. Held well, fire is courage and inspiration; its shadow is impatience, ego, and burning hot then burning out.",
    [
      { label: "Signs", value: "Aries · Leo · Sagittarius" },
      { label: "Temperament", value: "Warm, dry, energetic" },
      { label: "Keywords", value: "Spirit, will, enthusiasm, courage" },
      { label: "Balanced by", value: "Water (feeling)" },
    ],
    ["element", "fire", "aries", "leo", "sagittarius", "elements"]),
  concept("element-earth", "Earth", "Element",
    "Earth is the element of the material, practical world. Earth signs are grounded, reliable, and sensual — they build, sustain, and trust what they can touch, count on, and use. Held well, earth is patience and competence; its shadow is rigidity, materialism, and resistance to change.",
    [
      { label: "Signs", value: "Taurus · Virgo · Capricorn" },
      { label: "Temperament", value: "Cool, dry, solid" },
      { label: "Keywords", value: "Body, resources, patience, structure" },
      { label: "Balanced by", value: "Air (perspective)" },
    ],
    ["element", "earth", "taurus", "virgo", "capricorn", "elements"]),
  concept("element-air", "Air", "Element",
    "Air is the element of the mind, language, and relationship. Air signs are intellectual, social, and objective — they think, connect, and trade ideas, valuing fairness and a wide view. Held well, air is clarity and connection; its shadow is detachment, indecision, and living in the head.",
    [
      { label: "Signs", value: "Gemini · Libra · Aquarius" },
      { label: "Temperament", value: "Warm, moist, mobile" },
      { label: "Keywords", value: "Mind, communication, ideas, fairness" },
      { label: "Balanced by", value: "Earth (grounding)" },
    ],
    ["element", "air", "gemini", "libra", "aquarius", "elements"]),
  concept("element-water", "Water", "Element",
    "Water is the element of emotion, intuition, and the unconscious. Water signs are feeling, receptive, and deeply attuned — they sense undercurrents, bond, and protect. Held well, water is empathy and depth; its shadow is moodiness, over-attachment, and absorbing everyone else's feelings.",
    [
      { label: "Signs", value: "Cancer · Scorpio · Pisces" },
      { label: "Temperament", value: "Cool, moist, flowing" },
      { label: "Keywords", value: "Feeling, intuition, depth, memory" },
      { label: "Balanced by", value: "Fire (spark)" },
    ],
    ["element", "water", "cancer", "scorpio", "pisces", "elements"]),

  // ── 3 modalities ──
  concept("modality-cardinal", "Cardinal", "Modality",
    "Cardinal signs open each season and are the initiators of the zodiac. They start things, take the lead, and set energy in motion — each through its own element. Their gift is initiative and momentum; their challenge is starting more than they finish.",
    [
      { label: "Signs", value: "Aries · Cancer · Libra · Capricorn" },
      { label: "Role", value: "Initiates — begins the season" },
      { label: "Keywords", value: "Action, leadership, beginnings" },
    ],
    ["modality", "cardinal", "quality", "modalities"]),
  concept("modality-fixed", "Fixed", "Modality",
    "Fixed signs sit in the heart of each season and are the sustainers of the zodiac. They stabilize, hold, and see things through with determination and loyalty. Their gift is staying power; their challenge is stubbornness and resistance to change.",
    [
      { label: "Signs", value: "Taurus · Leo · Scorpio · Aquarius" },
      { label: "Role", value: "Sustains — holds the season" },
      { label: "Keywords", value: "Stability, persistence, loyalty, will" },
    ],
    ["modality", "fixed", "quality", "modalities"]),
  concept("modality-mutable", "Mutable", "Modality",
    "Mutable signs close each season and are the adapters of the zodiac. They flex, transition, and prepare the way for change, valuing versatility over fixed plans. Their gift is adaptability; their challenge is scattered focus and inconsistency.",
    [
      { label: "Signs", value: "Gemini · Virgo · Sagittarius · Pisces" },
      { label: "Role", value: "Adapts — turns the season over" },
      { label: "Keywords", value: "Flexibility, change, versatility" },
    ],
    ["modality", "mutable", "quality", "modalities"]),

  // ── 4 major asteroids ──
  concept("asteroid-ceres", "Ceres", "Asteroid",
    "Ceres is the great mother and nurturer of the asteroid belt — the largest of the four, named for the goddess of the harvest. She governs how you give and receive care, nourishment, and unconditional love, along with the cycles of attachment, loss, and letting go. By sign and house she shows what makes you feel nurtured and how you mother others.",
    [
      { label: "Symbol", value: "⚳" },
      { label: "Themes", value: "Nurture, nourishment, mothering, loss and return" },
      { label: "Keywords", value: "Care, food, fertility, grief, cycles" },
      { label: "Mythology", value: "Roman goddess of the harvest, mother of Proserpina" },
    ],
    ["asteroid", "ceres", "asteroids", "point"]),
  concept("asteroid-pallas", "Pallas Athena", "Asteroid",
    "Pallas Athena is the warrior of wisdom — strategy, pattern recognition, and creative intelligence. Born fully formed from the head of Zeus, she governs how you solve problems, see the whole picture, and fight your battles with foresight rather than force. By sign and house she shows where your insight, craft, and tactical brilliance shine.",
    [
      { label: "Symbol", value: "⚴" },
      { label: "Themes", value: "Wisdom, strategy, pattern, creative intelligence" },
      { label: "Keywords", value: "Insight, craft, justice, problem-solving" },
      { label: "Mythology", value: "Greek goddess of wisdom and just war" },
    ],
    ["asteroid", "pallas", "pallas athena", "athena", "asteroids", "point"]),
  concept("asteroid-juno", "Juno", "Asteroid",
    "Juno is the asteroid of committed partnership — marriage, loyalty, and what you need to feel honoured and secure in a bond. Queen of the gods and wife of Jupiter, she governs the terms of equal union, jealousy, and the fight for fairness within relationship. By sign and house she shows the partner you seek and how you commit.",
    [
      { label: "Symbol", value: "⚵" },
      { label: "Themes", value: "Commitment, marriage, equality, fidelity" },
      { label: "Keywords", value: "Partnership, loyalty, jealousy, contracts" },
      { label: "Mythology", value: "Roman queen of the gods, wife of Jupiter" },
    ],
    ["asteroid", "juno", "asteroids", "point", "marriage"]),
  concept("asteroid-vesta", "Vesta", "Asteroid",
    "Vesta is the keeper of the sacred flame — devotion, focus, and the part of life you treat as holy. Goddess of the hearth, she governs concentrated dedication, sacred sexuality, and the discipline of tending an inner fire. By sign and house she shows where you commit with single-minded purpose and what you keep pure and protected.",
    [
      { label: "Symbol", value: "⚶" },
      { label: "Themes", value: "Devotion, focus, the sacred, dedication" },
      { label: "Keywords", value: "Commitment, purity, service, inner flame" },
      { label: "Mythology", value: "Roman goddess of the hearth and sacred fire" },
    ],
    ["asteroid", "vesta", "asteroids", "point"]),

  // ── Chart points & angles ──
  point("descendant", "Descendant (DC)", ["dc", "descendant", "desc"], "What you seek and project in others.", "The western horizon and 7th-house cusp, exactly opposite the Ascendant. It describes the qualities you're drawn to in partners and what you meet through others."),
  point("ic", "Imum Coeli (IC)", ["ic", "imum coeli", "nadir"], "Your roots, home, and innermost self.", "The lowest point of the chart and 4th-house cusp, opposite the Midheaven. It marks your origins, private foundation, and sense of belonging."),
  point("vertex", "Vertex", ["vertex", "vx"], "A point of fated encounters and turning points.", "A calculated point in the western sky often called a third angle. Contacts to it are associated with fateful meetings and pivotal, destiny-flavoured events."),
  point("part-of-fortune", "Part of Fortune", ["part of fortune", "pars fortuna", "lot of fortune", "fortuna"], "Where ease, joy, and worldly good fortune flow.", "An Arabic part calculated from the Sun, Moon, and Ascendant. It marks a place of natural well-being, prosperity, and where things come together with grace."),
  point("east-point", "East Point", ["east point", "equatorial ascendant"], "A secondary point of self and identity.", "Also called the Equatorial Ascendant — the sign rising over the eastern horizon at the celestial equator. It acts as a subtle, secondary expression of identity and how others first register you."),

  // ── Minor aspects ──
  aspect("semisextile", "Semisextile", "30°", "Minor / adjusting",
    "A semisextile links two neighbouring signs that share little in element or modality. It's a subtle, mildly awkward angle — a quiet nudge to adjust and grow, blending energies that don't naturally understand each other.",
    "A gentle itch to bridge two unlike things", "~2°"),
  aspect("quincunx", "Quincunx", "150°", "Minor / adjusting",
    "A quincunx (or inconjunct) joins two planets with nothing in common — different element and modality. It creates a persistent need to adjust, like two parts of life that won't quite line up, asking for constant fine-tuning rather than outright conflict.",
    "Two things that never fully fit, demanding adjustment", "~3°"),
  aspect("semisquare", "Semisquare", "45°", "Minor / tense",
    "A semisquare is half a square — a minor angle of friction and irritation. It brings a low hum of tension or restlessness that prods you to act, milder than a full square but still energising.",
    "A small but nagging spur to act", "~2°"),
  aspect("sesquiquadrate", "Sesquiquadrate", "135°", "Minor / tense",
    "A sesquiquadrate (sesquisquare) is a square plus a semisquare — a minor hard aspect that surfaces tension at a turning point. It points to friction that builds until it must be released through action or adjustment.",
    "Pressure that crests and demands an outlet", "~2°"),
  aspect("quintile", "Quintile", "72°", "Minor / creative",
    "A quintile divides the circle by five and carries a flavour of talent, creativity, and unique gifts. It marks a special aptitude or inventive spark between two planets — a signature of craft, genius, and distinctive style.",
    "A creative knack that feels almost magical", "~2°"),

  // ── Concepts ──
  concept("concept-stellium", "Stellium", "Concept",
    "A stellium is a cluster of three or more planets gathered in a single sign or house. It concentrates enormous focus and energy in one area of the chart, making that sign or house a defining theme of the life — a place of intensity, talent, and sometimes imbalance, where so much is invested it can crowd out the rest of the chart.",
    [
      { label: "Definition", value: "Three or more planets in one sign or house" },
      { label: "Effect", value: "Concentrated focus and emphasis in that area" },
      { label: "Keywords", value: "Cluster, intensity, dominant theme, specialisation" },
    ],
    ["concept", "stellium", "cluster"]),
  concept("concept-void-of-course-moon", "Void-of-Course Moon", "Concept",
    "The Moon is void-of-course in the stretch after it makes its last major aspect in a sign and before it enters the next. During this window, momentum fades and 'nothing will come of it' — a traditional caution against launching ventures, signing, or making big decisions. It's a fallow, drifting time better suited to rest, routine, and finishing than to starting.",
    [
      { label: "Definition", value: "Moon between its final aspect and the next sign" },
      { label: "Guidance", value: "Avoid starting ventures or making major decisions" },
      { label: "Keywords", value: "Drift, pause, rest, 'nothing will come of it'" },
    ],
    ["concept", "void of course", "void-of-course", "moon", "voc"]),

  // ── Fixed stars ──
  concept("star-regulus", "Regulus", "Fixed star",
    "Regulus, the heart of the Lion in Leo, is one of the four Royal Stars of Persia. It confers honour, ambition, leadership, and the promise of great success and renown — with the classical caveat that its gifts can be lost through revenge or pride. A star of kings, courage, and high position.",
    [
      { label: "Constellation", value: "Leo — the Lion's heart" },
      { label: "Nature", value: "Royal Star; Mars / Jupiter quality" },
      { label: "Themes", value: "Honour, leadership, ambition, success, downfall through pride" },
    ],
    ["fixed star", "star", "regulus", "royal star"]),
  concept("star-spica", "Spica", "Fixed star",
    "Spica, the brightest star in Virgo, is one of the most fortunate of all fixed stars. It bestows talent, brilliance, and unexpected blessings — a gift of grace, refinement, and good fortune that often arrives without striving. Associated with the arts, science, and a touch of luck.",
    [
      { label: "Constellation", value: "Virgo — the ear of wheat" },
      { label: "Nature", value: "Venus / Mars quality; highly benefic" },
      { label: "Themes", value: "Talent, brilliance, gifts, refinement, good fortune" },
    ],
    ["fixed star", "star", "spica"]),
  concept("star-algol", "Algol", "Fixed star",
    "Algol, the Demon Star marking the head of Medusa in Perseus, is the most notorious of the fixed stars. It carries raw, intense, and unflinching power — associated with crisis, loss, and the things we'd rather not face, yet also with profound transformation and primal feminine strength for those who can meet it directly.",
    [
      { label: "Constellation", value: "Perseus — the head of Medusa" },
      { label: "Nature", value: "Saturn / Mars quality; the most challenging fixed star" },
      { label: "Themes", value: "Intensity, crisis, loss, raw power, transformation" },
    ],
    ["fixed star", "star", "algol", "demon star", "medusa"]),
  concept("star-aldebaran", "Aldebaran", "Fixed star",
    "Aldebaran, the fiery eye of the Bull in Taurus, is another of the four Royal Stars. It promises courage, integrity, and worldly success — the warrior's star — provided one stays honest and true. Its blessings hold for those who keep their word and falter for those who don't.",
    [
      { label: "Constellation", value: "Taurus — the Bull's eye" },
      { label: "Nature", value: "Royal Star; Mars quality" },
      { label: "Themes", value: "Courage, integrity, success, honour conditional on honesty" },
    ],
    ["fixed star", "star", "aldebaran", "royal star"]),
  concept("star-antares", "Antares", "Fixed star",
    "Antares, the red heart of the Scorpion in Scorpio, is the fourth Royal Star and the counterpart of Aldebaran across the sky. Intense and warlike, it grants courage, drive, and passionate ambition — but warns of recklessness, obsession, and self-undoing if its fire is not mastered.",
    [
      { label: "Constellation", value: "Scorpius — the Scorpion's heart" },
      { label: "Nature", value: "Royal Star; Mars / Jupiter quality" },
      { label: "Themes", value: "Intensity, courage, passion, ambition, danger of excess" },
    ],
    ["fixed star", "star", "antares", "royal star"]),
];
