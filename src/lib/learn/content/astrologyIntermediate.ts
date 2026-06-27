import type { Course } from "../types";

/** FLAGSHIP #12 — Astrology, Intermediate. Builds on Astrology Foundations. */
export const astrologyIntermediate: Course = {
  id: "astrology-intermediate",
  domain: "astrology",
  title: "Astrology, Intermediate",
  subtitle: "Dignities, nodes, and the deeper chart",
  level: "intermediate",
  icon: "☿",
  summary:
    "Go past the basics: the chart ruler, planetary dignities, retrogrades, the lunar nodes, Chiron, Lilith, and reading a chart's overall shape.",
  estMinutes: 45,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "Strength & Condition", lessons: ["The chart ruler", "Essential dignities", "Retrograde planets"] },
    { module: "Points of Depth", lessons: ["The lunar nodes", "Chiron, the wounded healer", "Black Moon Lilith"] },
    { module: "The Whole Picture", lessons: ["Hemispheres & chart shapes", "Stelliums & emphasis"] },
  ],

  modules: [
    {
      id: "m1",
      title: "Strength & Condition",
      lessons: [
        {
          id: "l1-chart-ruler",
          title: "The chart ruler",
          objective: "Identify the chart ruler and why it matters.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The chart ruler is the planet that rules your Rising (Ascendant) sign. If you have a Libra Ascendant, Venus (Libra's ruler) is your chart ruler; a Scorpio Ascendant points to Mars (and modern Pluto)." },
            { kind: "callout", tone: "tip", title: "The captain of the chart", text: "Because the Rising sign colors the whole chart, its ruler acts like the captain — where that planet sits (its sign and house) and the aspects it makes describe a great deal about how you move through life. Find your chart ruler and pay special attention to it." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The chart ruler is the planet that rules…", options: [
              { id: "a", text: "Your Rising (Ascendant) sign", correct: true, explanation: "Correct — the Ascendant's ruler leads the chart." },
              { id: "b", text: "Your Sun sign", correct: false, explanation: "It's the Ascendant's ruler, not the Sun's." },
              { id: "c", text: "Whichever planet you like most", correct: false, explanation: "It's determined by the Rising sign." },
            ] },
            { id: "q2", type: "mcq", prompt: "If someone has a Libra Ascendant, their chart ruler is…", options: [
              { id: "a", text: "Venus", correct: true, explanation: "Yes — Venus rules Libra." },
              { id: "b", text: "Mars", correct: false, explanation: "Mars rules Aries/Scorpio, not Libra." },
              { id: "c", text: "The Moon", correct: false, explanation: "The Moon rules Cancer." },
            ] },
            { id: "q3", type: "true-false", prompt: "The chart ruler's sign, house, and aspects are especially important to read.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it's the 'captain' of the whole chart." },
              { id: "f", text: "False", correct: false, explanation: "It genuinely deserves special attention." },
            ] },
          ],
        },
        {
          id: "l2-dignities",
          title: "Essential dignities",
          objective: "Define domicile, exaltation, detriment, and fall.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "'Dignity' describes how comfortable a planet is in a given sign — a kind of strength rating from traditional astrology." },
            { kind: "table", headers: ["Dignity", "Meaning"], rows: [
              ["Domicile (rulership)", "The planet is 'at home' in the sign it rules — strong and natural"],
              ["Exaltation", "An honored guest — the planet expresses especially well"],
              ["Detriment", "Opposite its domicile — out of place, has to work harder"],
              ["Fall", "Opposite its exaltation — its weakest, most awkward placement"],
            ] },
            { kind: "callout", tone: "tip", title: "Worked example — the Sun", text: "The Sun is in domicile in Leo, exalted in Aries, in detriment in Aquarius, and in fall in Libra. A dignity doesn't make a placement 'good' or 'bad' — it just describes how easily that planet's energy flows." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A planet in its 'domicile' is…", options: [
              { id: "a", text: "In the sign it rules — strong and at home", correct: true, explanation: "Correct — its most natural placement." },
              { id: "b", text: "In its weakest sign", correct: false, explanation: "That's 'fall.'" },
              { id: "c", text: "Always retrograde", correct: false, explanation: "Dignity is unrelated to retrograde motion." },
            ] },
            { id: "q2", type: "mcq", prompt: "'Fall' is the placement…", options: [
              { id: "a", text: "Opposite a planet's exaltation — its most awkward sign", correct: true, explanation: "Yes — the weakest dignity." },
              { id: "b", text: "Where a planet rules", correct: false, explanation: "That's domicile." },
              { id: "c", text: "Where a planet is exalted", correct: false, explanation: "Fall is the opposite of exaltation." },
            ] },
            { id: "q3", type: "mcq", prompt: "The Sun is exalted in…", options: [
              { id: "a", text: "Aries", correct: true, explanation: "Correct — Sun: domicile Leo, exalted Aries." },
              { id: "b", text: "Libra", correct: false, explanation: "Libra is the Sun's fall." },
              { id: "c", text: "Aquarius", correct: false, explanation: "Aquarius is the Sun's detriment." },
            ] },
          ],
        },
        {
          id: "l3-retrogrades",
          title: "Retrograde planets",
          objective: "Explain what a retrograde planet means in a natal chart.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "A retrograde planet appears, from Earth, to move backward through the zodiac for a while. It's an optical effect of orbital speeds, not a real reversal. Every planet except the Sun and Moon goes retrograde periodically." },
            { kind: "callout", tone: "tradition", title: "Natal retrogrades turn inward", text: "When a planet is retrograde in your birth chart, its energy is often expressed more internally, reflectively, or unconventionally — you may revisit and rework that planet's themes rather than expressing them outwardly at face value. It's not a flaw; it's a different flavor." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A retrograde planet is…", options: [
              { id: "a", text: "Apparently moving backward from Earth's view (an optical effect)", correct: true, explanation: "Correct — not a true reversal." },
              { id: "b", text: "Physically orbiting backward", correct: false, explanation: "It only appears to; it's about relative speeds." },
              { id: "c", text: "About to crash", correct: false, explanation: "Nothing of the sort." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which bodies never go retrograde?", options: [
              { id: "a", text: "The Sun and Moon", correct: true, explanation: "Correct — only the planets appear to." },
              { id: "b", text: "Mercury and Venus", correct: false, explanation: "Those do go retrograde." },
              { id: "c", text: "All planets", correct: false, explanation: "The planets do; the luminaries don't." },
            ] },
            { id: "q3", type: "mcq", prompt: "A natal retrograde planet often expresses its themes…", options: [
              { id: "a", text: "More internally or reflectively", correct: true, explanation: "Yes — turned inward, revisited." },
              { id: "b", text: "With no difference at all", correct: false, explanation: "There's usually an inward flavor." },
              { id: "c", text: "By disappearing from the chart", correct: false, explanation: "It's still there, just retrograde." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Points of Depth",
      lessons: [
        {
          id: "l4-nodes",
          title: "The lunar nodes",
          objective: "Explain the North and South Nodes.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The lunar nodes aren't bodies — they're the two points where the Moon's orbit crosses the ecliptic. They always sit exactly opposite each other and are read as an axis of growth." },
            { kind: "list", items: [
              "**North Node** — your soul's growth edge: qualities and experiences you're here to lean into, even though they feel unfamiliar.",
              "**South Node** — your comfort zone: gifts and patterns you arrived with that can become a crutch if you over-rely on them.",
            ] },
            { kind: "callout", tone: "tradition", title: "Where you've been vs where you're going", text: "Think of the nodal axis as a compass: ease toward the North Node's themes (the stretch) while not abandoning the South Node's strengths (the foundation)." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The North Node represents…", options: [
              { id: "a", text: "Your growth direction — what to lean into", correct: true, explanation: "Correct — the unfamiliar stretch." },
              { id: "b", text: "Your comfort zone", correct: false, explanation: "That's the South Node." },
              { id: "c", text: "A physical planet", correct: false, explanation: "It's a calculated point, not a body." },
            ] },
            { id: "q2", type: "mcq", prompt: "The South Node represents…", options: [
              { id: "a", text: "Comfort, gifts you arrived with — and a possible crutch", correct: true, explanation: "Yes — the familiar foundation." },
              { id: "b", text: "Your future growth", correct: false, explanation: "That's the North Node." },
              { id: "c", text: "Your career", correct: false, explanation: "That's more the Midheaven." },
            ] },
            { id: "q3", type: "true-false", prompt: "The North and South Nodes always sit opposite each other.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they form one axis." },
              { id: "f", text: "False", correct: false, explanation: "They are always exactly opposite." },
            ] },
          ],
        },
        {
          id: "l5-chiron",
          title: "Chiron, the wounded healer",
          objective: "Describe what Chiron represents.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Chiron is a small body orbiting between Saturn and Uranus, named for the wise centaur of Greek myth who could heal others but not his own wound. In a chart, it points to a core wound — an old hurt or insecurity — that becomes a source of wisdom and healing for others once you work with it." },
            { kind: "callout", tone: "tip", title: "Wound into gift", text: "Chiron's sign and house show the area of life where the wound lives and where, over time, you can develop a particular ability to help others through the same struggle." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Chiron is known as the…", options: [
              { id: "a", text: "Wounded healer", correct: true, explanation: "Correct — heals others, carries an old wound." },
              { id: "b", text: "Ruler of Leo", correct: false, explanation: "That's the Sun." },
              { id: "c", text: "Fastest-moving planet", correct: false, explanation: "That's the Moon." },
            ] },
            { id: "q2", type: "mcq", prompt: "Chiron's placement points to…", options: [
              { id: "a", text: "A core wound that can become a source of healing for others", correct: true, explanation: "Yes — wound into gift." },
              { id: "b", text: "Your lucky numbers", correct: false, explanation: "That's not astrology." },
              { id: "c", text: "Your career success", correct: false, explanation: "That's more the 10th house/MC." },
            ] },
            { id: "q3", type: "true-false", prompt: "Chiron's house shows where you may develop an ability to help others through a struggle you know.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the wound becomes a gift." },
              { id: "f", text: "False", correct: false, explanation: "That's the heart of Chiron's meaning." },
            ] },
          ],
        },
        {
          id: "l6-lilith",
          title: "Black Moon Lilith",
          objective: "Explain what Black Moon Lilith represents.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Black Moon Lilith isn't a body either — it's a calculated point (related to the Moon's orbit). Named after the mythic Lilith who refused to submit, it represents your raw, untamed, unapologetic side — the parts that were suppressed or shamed and the power you reclaim when you stop apologizing for them." },
            { kind: "callout", tone: "tip", title: "Where you refuse to be tamed", text: "Lilith's sign and house show where you experience taboo, suppression, or raw instinct — and where reclaiming that energy can be deeply freeing." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Black Moon Lilith represents…", options: [
              { id: "a", text: "Your raw, untamed, suppressed-then-reclaimed power", correct: true, explanation: "Correct — the wild, unapologetic self." },
              { id: "b", text: "Your daily routine", correct: false, explanation: "That's more the 6th house." },
              { id: "c", text: "A major planet", correct: false, explanation: "It's a calculated point, not a body." },
            ] },
            { id: "q2", type: "mcq", prompt: "Lilith's sign and house show…", options: [
              { id: "a", text: "Where you meet taboo, suppression, or raw instinct", correct: true, explanation: "Yes — and where reclaiming it frees you." },
              { id: "b", text: "Your exact lifespan", correct: false, explanation: "Astrology makes no such claim." },
              { id: "c", text: "Your bank balance", correct: false, explanation: "Not what Lilith describes." },
            ] },
            { id: "q3", type: "true-false", prompt: "Black Moon Lilith is a calculated point, not a physical planet.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — like the nodes, it's a point." },
              { id: "f", text: "False", correct: false, explanation: "It is a calculated point." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "The Whole Picture",
      lessons: [
        {
          id: "l7-shapes",
          title: "Hemispheres & chart shapes",
          objective: "Read a chart's overall balance and shape.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Before reading individual placements, zoom out: where are the planets clustered?" },
            { kind: "list", items: [
              "**Hemispheres** — many planets in the top (south) half lean toward public, outer life; the bottom (north) half toward private, inner life. The left (east) half emphasizes self-direction; the right (west) half, relationships and circumstance.",
              "**Chart shapes** — the overall pattern of planets has classic forms (e.g. Bundle — all bunched together; Bowl — all in one half; Locomotive — spread across two-thirds; Splash — spread all around), each describing how focused or wide-ranging the person's energy is.",
            ] },
            { kind: "callout", tone: "tip", title: "Read the forest first", text: "The hemisphere balance and shape give you the 'forest' before the 'trees' — a quick read on whether someone is inwardly or outwardly oriented, focused or scattered, self-driven or other-driven." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A chart with most planets in the upper (south) half leans toward…", options: [
              { id: "a", text: "Public, outer-world life", correct: true, explanation: "Correct — the top half is the visible, social sphere." },
              { id: "b", text: "Private, inner life", correct: false, explanation: "That's the lower half." },
              { id: "c", text: "Nothing in particular", correct: false, explanation: "Hemisphere emphasis is meaningful." },
            ] },
            { id: "q2", type: "mcq", prompt: "A 'Bowl' chart shape has planets…", options: [
              { id: "a", text: "All within one half of the chart", correct: true, explanation: "Yes — a clear emphasis on one hemisphere." },
              { id: "b", text: "Evenly spread all around", correct: false, explanation: "That's a Splash." },
              { id: "c", text: "Bunched into a tiny cluster", correct: false, explanation: "That's a Bundle." },
            ] },
            { id: "q3", type: "true-false", prompt: "Reading the chart's overall shape gives a quick 'big picture' before individual placements.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the forest before the trees." },
              { id: "f", text: "False", correct: false, explanation: "Shape really does set the overview." },
            ] },
          ],
        },
        {
          id: "l8-stelliums",
          title: "Stelliums & emphasis",
          objective: "Recognize a stellium and what it signifies.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "A stellium is a cluster of three or more planets in the same sign or house. It marks a powerful concentration of energy — a theme the person can't help but live out intensely." },
            { kind: "callout", tone: "tip", title: "Concentrated focus", text: "A stellium in a sign floods the person with that sign's qualities; in a house, it pours energy into that area of life. It can be a superpower and an obsession — a place of great talent that also demands balance with the rest of the chart." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A stellium is…", options: [
              { id: "a", text: "Three or more planets clustered in one sign or house", correct: true, explanation: "Correct — a concentration of energy." },
              { id: "b", text: "A single planet alone", correct: false, explanation: "That's the opposite of a stellium." },
              { id: "c", text: "An aspect between two planets", correct: false, explanation: "A stellium is a cluster, not an aspect." },
            ] },
            { id: "q2", type: "mcq", prompt: "A stellium in a house pours energy into…", options: [
              { id: "a", text: "That house's area of life", correct: true, explanation: "Yes — concentrated focus there." },
              { id: "b", text: "Every house equally", correct: false, explanation: "It concentrates, not spreads." },
              { id: "c", text: "Nothing", correct: false, explanation: "It's a strong emphasis." },
            ] },
            { id: "q3", type: "true-false", prompt: "A stellium marks a powerful concentration of energy that can be both a strength and an intensity to balance.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — talent and obsession in one." },
              { id: "f", text: "False", correct: false, explanation: "That's exactly what a stellium does." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "The chart ruler is the planet ruling your…", options: [
      { id: "a", text: "Rising (Ascendant) sign", correct: true },
      { id: "b", text: "Sun sign", correct: false },
      { id: "c", text: "Moon sign", correct: false },
      { id: "d", text: "favorite planet", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "A Libra Ascendant's chart ruler is…", options: [
      { id: "a", text: "Venus", correct: true },
      { id: "b", text: "Mars", correct: false },
      { id: "c", text: "Saturn", correct: false },
      { id: "d", text: "The Moon", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "'Domicile' means a planet is…", options: [
      { id: "a", text: "In the sign it rules — strong", correct: true },
      { id: "b", text: "In its weakest sign", correct: false },
      { id: "c", text: "Retrograde", correct: false },
      { id: "d", text: "Missing", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "The Sun is exalted in…", options: [
      { id: "a", text: "Aries", correct: true },
      { id: "b", text: "Libra", correct: false },
      { id: "c", text: "Aquarius", correct: false },
      { id: "d", text: "Cancer", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "A retrograde planet…", options: [
      { id: "a", text: "Appears to move backward (an optical effect)", correct: true },
      { id: "b", text: "Physically reverses orbit", correct: false },
      { id: "c", text: "Leaves the chart", correct: false },
      { id: "d", text: "Is always harmful", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Which never go retrograde?", options: [
      { id: "a", text: "The Sun and Moon", correct: true },
      { id: "b", text: "Mercury and Mars", correct: false },
      { id: "c", text: "All planets", correct: false },
      { id: "d", text: "Venus and Jupiter", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "The North Node represents…", options: [
      { id: "a", text: "Your growth direction", correct: true },
      { id: "b", text: "Your comfort zone", correct: false },
      { id: "c", text: "Your career", correct: false },
      { id: "d", text: "A planet", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "The South Node represents…", options: [
      { id: "a", text: "Comfort and gifts you arrived with", correct: true },
      { id: "b", text: "Future growth", correct: false },
      { id: "c", text: "Your appearance", correct: false },
      { id: "d", text: "Wealth", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "Chiron is the…", options: [
      { id: "a", text: "Wounded healer — a core wound that becomes a gift", correct: true },
      { id: "b", text: "Ruler of Aries", correct: false },
      { id: "c", text: "Fastest body", correct: false },
      { id: "d", text: "Same as the Sun", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Black Moon Lilith represents…", options: [
      { id: "a", text: "Your raw, untamed, reclaimed power", correct: true },
      { id: "b", text: "Daily routine", correct: false },
      { id: "c", text: "A major planet", correct: false },
      { id: "d", text: "Your finances", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "Planets in the upper (south) half emphasize…", options: [
      { id: "a", text: "Public, outer life", correct: true },
      { id: "b", text: "Private, inner life", correct: false },
      { id: "c", text: "Nothing", correct: false },
      { id: "d", text: "Retrogrades", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "A 'Bowl' chart has planets…", options: [
      { id: "a", text: "All in one half of the chart", correct: true },
      { id: "b", text: "Spread all around", correct: false },
      { id: "c", text: "In a tiny cluster", correct: false },
      { id: "d", text: "Only on the angles", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "A stellium is…", options: [
      { id: "a", text: "Three+ planets in one sign or house", correct: true },
      { id: "b", text: "A lone planet", correct: false },
      { id: "c", text: "An aspect", correct: false },
      { id: "d", text: "A house system", correct: false },
    ] },
    { id: "f14", type: "true-false", prompt: "The lunar nodes are calculated points, not physical bodies.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f15", type: "true-false", prompt: "A dignity makes a placement strictly 'good' or 'bad.'", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f16", type: "true-false", prompt: "A natal retrograde planet often expresses its themes more internally.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
