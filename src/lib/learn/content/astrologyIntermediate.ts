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
    "Go past the basics: the chart ruler, planetary dignities, retrogrades, the lunar nodes, hemispheres and quadrants, Chiron, Lilith, and reading a chart's overall shape.",
  estMinutes: 70,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "Strength & Condition", lessons: ["The chart ruler", "Essential dignities", "Retrograde planets"] },
    { module: "Points of Depth", lessons: ["The lunar nodes", "Chiron, the wounded healer", "Black Moon Lilith"] },
    { module: "The Whole Picture", lessons: ["Hemispheres & quadrants", "Hemispheres & chart shapes", "Stelliums & emphasis"] },
  ],

  modules: [
    {
      id: "m1",
      title: "Strength & Condition",
      lessons: [
        {
          id: "l1-chart-ruler",
          title: "The chart ruler",
          objective: "Identify the chart ruler and explain why its placement matters.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "The chart ruler — sometimes called the ruler of the chart or the Ascendant ruler — is the planet that rules your Rising (Ascendant) sign. If you have a Libra Ascendant, Venus (Libra's ruler) is your chart ruler; a Scorpio Ascendant points to Mars in traditional astrology, and to Pluto for modern astrologers." },
            { kind: "text", text: "Because the Rising sign sets the cusp of the 1st house and frames the entire wheel, its ruler is the single planet most tied to your whole sense of self and your path. Wherever that planet falls by sign and house, and whatever aspects it makes, becomes a major chapter of the chart's story. Two people can share a Sun sign, yet a difference in Ascendant — and therefore chart ruler — can make their lives look completely different." },
            { kind: "heading", text: "Finding it in three steps" },
            { kind: "list", ordered: true, items: [
              "Note the Rising sign (the sign on the Ascendant).",
              "Look up that sign's ruling planet (e.g., Gemini → Mercury, Cancer → Moon).",
              "Find where that ruling planet sits — its sign, its house, and its aspects. That placement is the chart ruler's 'report card.'",
            ] },
            { kind: "table", headers: ["Rising sign", "Traditional ruler", "Modern co-ruler"], rows: [
              ["Aries", "Mars", "—"],
              ["Taurus / Libra", "Venus", "—"],
              ["Gemini / Virgo", "Mercury", "—"],
              ["Cancer", "Moon", "—"],
              ["Leo", "Sun", "—"],
              ["Scorpio", "Mars", "Pluto"],
              ["Sagittarius", "Jupiter", "—"],
              ["Capricorn", "Saturn", "—"],
              ["Aquarius", "Saturn", "Uranus"],
              ["Pisces", "Jupiter", "Neptune"],
            ] },
            { kind: "callout", tone: "tip", title: "The captain of the chart", text: "Think of the chart ruler as the captain. The Rising sign is the ship's hull — the first thing people see — and the chart ruler is who's steering. A Cancer Rising with the Moon in the 10th house steers very differently from a Cancer Rising with the Moon hidden in the 12th." },
            { kind: "callout", tone: "history", title: "Why the Ascendant leads", text: "In Hellenistic astrology (roughly 2nd century BCE onward), the Ascendant was the most important point in the chart — it marked the exact degree rising over the eastern horizon at birth and anchored the whole-sign house system. The 'lord of the Ascendant' was studied for clues about the native's life direction long before the Sun sign became the popular headline." },
            { kind: "callout", tone: "evidence", title: "Why birth time matters here", text: "The Ascendant moves about one degree every four minutes, so it changes signs roughly every two hours. An uncertain birth time can put the Rising — and therefore the chart ruler — in the wrong sign entirely. This is a symbolic interpretive system, not a measurement of physical forces; an accurate birth time simply keeps the symbolism internally consistent." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The chart ruler is the planet that rules…", options: [
              { id: "a", text: "Your Rising (Ascendant) sign", correct: true, explanation: "Correct — the Ascendant's ruler leads the chart." },
              { id: "b", text: "Your Sun sign", correct: false, explanation: "It's the Ascendant's ruler, not the Sun's." },
              { id: "c", text: "Your Moon sign", correct: false, explanation: "The Moon sign has its own ruler, but the chart ruler tracks the Ascendant." },
              { id: "d", text: "Whichever planet you like most", correct: false, explanation: "It's determined by the Rising sign, not preference." },
            ] },
            { id: "q2", type: "mcq", prompt: "If someone has a Libra Ascendant, their chart ruler is…", options: [
              { id: "a", text: "Venus", correct: true, explanation: "Yes — Venus rules Libra." },
              { id: "b", text: "Mars", correct: false, explanation: "Mars rules Aries and (traditionally) Scorpio, not Libra." },
              { id: "c", text: "The Moon", correct: false, explanation: "The Moon rules Cancer." },
            ] },
            { id: "q3", type: "mcq", prompt: "To read the chart ruler, you look at its…", options: [
              { id: "a", text: "Sign, house, and aspects", correct: true, explanation: "Correct — those describe how the 'captain' operates." },
              { id: "b", text: "Color and number", correct: false, explanation: "Those aren't part of reading a planet's condition." },
              { id: "c", text: "Distance from Earth in miles", correct: false, explanation: "Physical distance isn't used in chart interpretation." },
            ] },
            { id: "q4", type: "true-false", prompt: "Because the Ascendant changes signs roughly every two hours, an accurate birth time matters for finding the chart ruler.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — a wrong time can put the Rising, and the ruler, in the wrong sign." },
              { id: "f", text: "False", correct: false, explanation: "The Ascendant is time-sensitive, so birth time genuinely matters." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the planet that is the traditional chart ruler for a Capricorn Ascendant.", options: [], answer: "Saturn", accept: ["saturn"], explanation: "Saturn rules Capricorn, so it's the chart ruler for a Capricorn Rising." },
          ],
        },
        {
          id: "l2-dignities",
          title: "Essential dignities",
          objective: "Define domicile, exaltation, detriment, and fall, and locate them for the classical planets.",
          estMinutes: 7,
          blocks: [
            { kind: "text", text: "'Dignity' describes how comfortable a planet is in a given sign — a strength-and-condition rating inherited from traditional astrology. It doesn't make a placement morally 'good' or 'bad'; it describes how easily that planet's energy flows and how much extra effort it has to make." },
            { kind: "text", text: "The four 'essential dignities' most students learn first come in two opposing pairs. Domicile and detriment are opposite each other across the zodiac; exaltation and fall are also opposite each other. Knowing one tells you the other for free." },
            { kind: "table", headers: ["Dignity", "Meaning"], rows: [
              ["Domicile (rulership)", "The planet is 'at home' in the sign it rules — strong and natural"],
              ["Exaltation", "An honored guest — the planet expresses especially well, even if it's not home"],
              ["Detriment", "Opposite its domicile — out of place, has to work harder"],
              ["Fall", "Opposite its exaltation — its weakest, most awkward placement"],
            ] },
            { kind: "heading", text: "The classical table" },
            { kind: "text", text: "Traditional astrology used the seven visible planets and assigned each its domicile, exaltation, detriment, and fall. These correspondences are standardized — they aren't invented per chart." },
            { kind: "table", headers: ["Planet", "Domicile", "Exaltation", "Detriment", "Fall"], rows: [
              ["Sun", "Leo", "Aries", "Aquarius", "Libra"],
              ["Moon", "Cancer", "Taurus", "Capricorn", "Scorpio"],
              ["Mercury", "Gemini & Virgo", "Virgo", "Sagittarius & Pisces", "Pisces"],
              ["Venus", "Taurus & Libra", "Pisces", "Aries & Scorpio", "Virgo"],
              ["Mars", "Aries & Scorpio", "Capricorn", "Taurus & Libra", "Cancer"],
              ["Jupiter", "Sagittarius & Pisces", "Cancer", "Gemini & Virgo", "Capricorn"],
              ["Saturn", "Capricorn & Aquarius", "Libra", "Cancer & Leo", "Aries"],
            ] },
            { kind: "callout", tone: "tip", title: "Worked example — the Sun", text: "The Sun is in domicile in Leo, exalted in Aries, in detriment in Aquarius (opposite Leo), and in fall in Libra (opposite Aries). Notice how each pair sits across the wheel from its partner — that's the pattern, not a list to brute-force memorize." },
            { kind: "callout", tone: "history", title: "An ancient scheme", text: "The system of essential dignities is laid out in texts like Ptolemy's 'Tetrabiblos' (2nd century CE) and was central to medieval and Renaissance astrology, which also used finer dignities (triplicity, terms, and faces) to score a planet's strength. Modern astrology often keeps domicile and exaltation while treating detriment and fall more gently — as a different mode of expression rather than a defect." },
            { kind: "callout", tone: "evidence", title: "A symbolic rating, not a verdict", text: "A 'fallen' planet is not doomed and an 'exalted' one is not guaranteed to thrive. Dignity is one symbolic input among many; the whole chart — aspects, house, and the rest — always qualifies it. Treat it as flavor and emphasis, never as fortune-telling about outcomes." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A planet in its 'domicile' is…", options: [
              { id: "a", text: "In the sign it rules — strong and at home", correct: true, explanation: "Correct — its most natural placement." },
              { id: "b", text: "In its weakest sign", correct: false, explanation: "That's 'fall.'" },
              { id: "c", text: "Always retrograde", correct: false, explanation: "Dignity is unrelated to retrograde motion." },
            ] },
            { id: "q2", type: "mcq", prompt: "'Fall' is the placement…", options: [
              { id: "a", text: "Opposite a planet's exaltation — its most awkward sign", correct: true, explanation: "Yes — the weakest dignity, across the wheel from exaltation." },
              { id: "b", text: "Where a planet rules", correct: false, explanation: "That's domicile." },
              { id: "c", text: "Where a planet is exalted", correct: false, explanation: "Fall is the opposite of exaltation." },
              { id: "d", text: "Opposite a planet's domicile", correct: false, explanation: "That's detriment, not fall." },
            ] },
            { id: "q3", type: "mcq", prompt: "The Sun is exalted in…", options: [
              { id: "a", text: "Aries", correct: true, explanation: "Correct — Sun: domicile Leo, exalted Aries." },
              { id: "b", text: "Libra", correct: false, explanation: "Libra is the Sun's fall." },
              { id: "c", text: "Aquarius", correct: false, explanation: "Aquarius is the Sun's detriment." },
            ] },
            { id: "q4", type: "mcq", prompt: "Detriment is the sign…", options: [
              { id: "a", text: "Opposite a planet's domicile", correct: true, explanation: "Right — detriment sits across the wheel from where the planet rules." },
              { id: "b", text: "Where a planet is exalted", correct: false, explanation: "Exaltation is a different dignity." },
              { id: "c", text: "Where a planet always fails", correct: false, explanation: "Detriment means out-of-place, not doomed." },
            ] },
            { id: "q5", type: "true-false", prompt: "A dignity makes a placement strictly 'good' or 'bad.'", options: [
              { id: "t", text: "True", correct: false, explanation: "Dignity describes how easily energy flows, not a verdict — the whole chart qualifies it." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's flavor and emphasis, not a fortune." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the sign where the Moon is in domicile (the sign it rules).", options: [], answer: "Cancer", accept: ["cancer"], explanation: "The Moon rules Cancer, so Cancer is the Moon's domicile." },
          ],
        },
        {
          id: "l3-retrogrades",
          title: "Retrograde planets",
          objective: "Explain what a retrograde planet means in a natal chart and which bodies it applies to.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "A retrograde planet appears, from Earth, to move backward through the zodiac for a while. It's an optical effect of orbital speeds — as Earth overtakes a slower outer planet (or is overtaken by a faster inner one), that planet seems to slow, stop, and drift backward against the stars before resuming. Nothing physically reverses." },
            { kind: "text", text: "Every planet except the two luminaries — the Sun and Moon — goes retrograde periodically, because retrograde is about relative motion and the Sun and Moon never get overtaken in that way from Earth's frame. The symbol 'Rx' (or a small ℞) next to a planet in a chart marks it as retrograde at birth." },
            { kind: "table", headers: ["Planet", "Retrograde roughly every", "For about"], rows: [
              ["Mercury", "3–4 months", "3 weeks"],
              ["Venus", "~19 months", "~6 weeks"],
              ["Mars", "~2 years", "2–3 months"],
              ["Jupiter / Saturn", "Once a year", "~4–5 months"],
              ["Uranus / Neptune / Pluto", "Once a year", "~5+ months"],
            ] },
            { kind: "callout", tone: "tradition", title: "Natal retrogrades turn inward", text: "When a planet is retrograde in your birth chart, its energy is often expressed more internally, reflectively, or unconventionally — you may revisit and rework that planet's themes rather than expressing them outwardly at face value. A natal Mercury retrograde person, for instance, may think before speaking and process ideas privately. It's not a flaw; it's a different flavor." },
            { kind: "callout", tone: "tip", title: "The outer planets are retrograde a lot", text: "The slower a planet, the more of the year it spends retrograde — the outer planets are retrograde for roughly 40% of any given year. So a natal retrograde Saturn or Pluto is common and shouldn't be read as rare or alarming. Retrograde Mercury, Venus, or Mars in the natal chart is more individually distinctive." },
            { kind: "callout", tone: "evidence", title: "What's literally true vs. symbolic", text: "The apparent backward motion is real and well understood by astronomy — you could photograph it. The personality meanings assigned to a natal retrograde are symbolic interpretation, not a measured effect. Hold the astronomy as fact and the meaning as tradition; don't let one borrow the other's authority." },
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
              { id: "d", text: "Saturn and Jupiter", correct: false, explanation: "Both of those go retrograde yearly." },
            ] },
            { id: "q3", type: "mcq", prompt: "A natal retrograde planet often expresses its themes…", options: [
              { id: "a", text: "More internally or reflectively", correct: true, explanation: "Yes — turned inward, revisited." },
              { id: "b", text: "With no difference at all", correct: false, explanation: "There's usually an inward flavor." },
              { id: "c", text: "By disappearing from the chart", correct: false, explanation: "It's still there, just retrograde." },
            ] },
            { id: "q4", type: "mcq", prompt: "Why are the outer planets retrograde for so much of the year?", options: [
              { id: "a", text: "They are slow, so Earth overtakes them often and for longer", correct: true, explanation: "Right — slower planets spend a larger share of the year in apparent retrograde." },
              { id: "b", text: "They orbit the wrong way", correct: false, explanation: "Their orbits are normal; it's an apparent effect from Earth." },
              { id: "c", text: "They are closer to the Sun", correct: false, explanation: "They're farther out, not closer." },
            ] },
            { id: "q5", type: "true-false", prompt: "The apparent backward motion of a retrograde planet is a genuine astronomical effect you could photograph.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the apparent motion is real; the personality meaning is symbolic." },
              { id: "f", text: "False", correct: false, explanation: "The astronomy is real and observable." },
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
          objective: "Explain the North and South Nodes and how to read the nodal axis as life direction.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "The lunar nodes aren't bodies — they're the two points where the Moon's orbit crosses the ecliptic (the Sun's apparent path). The North Node (☊, Caput Draconis or 'dragon's head') is where the Moon crosses going north; the South Node (☋, Cauda Draconis or 'dragon's tail') is the opposite crossing. They always sit exactly 180° apart, forming a single axis of growth." },
            { kind: "list", items: [
              "**North Node** — your soul's growth edge: qualities and experiences you're here to lean into, even though they feel unfamiliar or uncomfortable at first.",
              "**South Node** — your comfort zone: gifts and patterns you arrived with that come easily but can become a crutch if you over-rely on them.",
            ] },
            { kind: "text", text: "Astrologers read the nodal axis as a story of direction: the South Node is 'where you've been' (familiar, automatic) and the North Node is 'where you're going' (the stretch that fosters growth). Both the sign and the house of each node matter — the sign describes the quality to develop, the house describes the area of life in which to develop it." },
            { kind: "callout", tone: "history", title: "The dragon's head and tail", text: "The 'head and tail of the dragon' imagery comes through Persian, Arabic, and medieval European astrology, where the nodes were tied to eclipses (which can only happen near a node). Eclipses still tend to land in the signs of the nodes, which is why eclipse seasons and nodal themes are linked in tradition." },
            { kind: "callout", tone: "tradition", title: "Where you've been vs where you're going", text: "Think of the nodal axis as a compass: ease toward the North Node's themes (the stretch) while not abandoning the South Node's strengths (the foundation). The aim isn't to reject the South Node — it's to stop hiding there." },
            { kind: "callout", tone: "evidence", title: "The nodes move backward", text: "The nodes drift backward (retrograde) through the zodiac, completing a full cycle in about 18.6 years — which is why the 'nodal return' around ages 18–19, 37, and 55–56 is noted as a directional checkpoint. The astronomy (the 18.6-year cycle) is precise; the life-direction meaning layered onto it is symbolic interpretation." },
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
              { id: "d", text: "A bright fixed star", correct: false, explanation: "The South Node is a calculated crossing point, not a star." },
            ] },
            { id: "q3", type: "mcq", prompt: "Reading a node, the house it falls in tells you…", options: [
              { id: "a", text: "The area of life in which to work the node's theme", correct: true, explanation: "Right — sign = quality, house = arena." },
              { id: "b", text: "The exact day events occur", correct: false, explanation: "Astrology doesn't pin dates this way." },
              { id: "c", text: "Your lucky number", correct: false, explanation: "That isn't what the nodes describe." },
            ] },
            { id: "q4", type: "true-false", prompt: "The North and South Nodes always sit exactly opposite each other.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they form one 180° axis." },
              { id: "f", text: "False", correct: false, explanation: "They are always exactly opposite." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the direction (North or South) of the node that represents your growth edge — what you're here to lean into.", options: [], answer: "North", accept: ["north", "north node", "the north node"], explanation: "The North Node is the growth edge; the South Node is the comfort zone." },
          ],
        },
        {
          id: "l5-chiron",
          title: "Chiron, the wounded healer",
          objective: "Describe what Chiron represents and how its sign and house are read.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Chiron is a small icy body — formally a 'centaur,' a class of objects orbiting between Saturn and Uranus — discovered in 1977. It's named for the wise centaur of Greek myth who could heal others but, wounded by a poisoned arrow, could not heal himself. In a chart, it points to a core wound: an old hurt, insecurity, or sensitive spot that becomes a source of wisdom and healing for others once you work with it." },
            { kind: "text", text: "Chiron takes about 50 years to orbit the Sun, so people born within a few years of each other tend to share its sign — making the house placement and aspects more personally distinctive than the sign alone. The 'Chiron return' near age 50 is noted in tradition as a time of revisiting and integrating that wound." },
            { kind: "callout", tone: "tradition", title: "Wound into gift", text: "Chiron's sign and house show the area of life where the wound lives and where, over time, you can develop a particular ability to help others through the same struggle. The teacher who once struggled to learn, the counselor who knew loneliness — that's the Chiron pattern: mastery born of the very place that hurt." },
            { kind: "callout", tone: "history", title: "A modern addition", text: "Chiron is a recent arrival to astrology — its symbolism was developed only after 1977, so unlike the classical planets it has no ancient tradition behind it. Astrologers built its meaning from the myth and from observing charts, which is why its interpretation is comparatively young and varies a little between authors." },
            { kind: "callout", tone: "evidence", title: "Hold it lightly", text: "Chiron is a real object with a real orbit, but its 'wounded healer' meaning is a modern symbolic overlay, not a measured effect. Treat it as a reflective prompt about resilience — never as a diagnosis or a claim about health outcomes." },
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
              { id: "d", text: "Your daily routine", correct: false, explanation: "That's closer to the 6th house." },
            ] },
            { id: "q3", type: "mcq", prompt: "Why is Chiron's house often more personal than its sign?", options: [
              { id: "a", text: "It moves slowly, so a whole age group shares its sign", correct: true, explanation: "Right — ~50-year orbit means the sign is generational; house is individual." },
              { id: "b", text: "Its sign is random", correct: false, explanation: "The sign isn't random; it's just slow-moving and shared." },
              { id: "c", text: "Houses don't matter for Chiron", correct: false, explanation: "Houses matter a great deal for Chiron." },
            ] },
            { id: "q4", type: "true-false", prompt: "Chiron's house shows where you may develop an ability to help others through a struggle you know.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the wound becomes a gift." },
              { id: "f", text: "False", correct: false, explanation: "That's the heart of Chiron's meaning." },
            ] },
            { id: "q5", type: "true-false", prompt: "Chiron has an ancient astrological tradition reaching back to Babylon.", options: [
              { id: "t", text: "True", correct: false, explanation: "Chiron was only discovered in 1977; its meaning is modern." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's a modern addition with no ancient lineage." },
            ] },
          ],
        },
        {
          id: "l6-lilith",
          title: "Black Moon Lilith",
          objective: "Explain what Black Moon Lilith represents and how it differs from a physical body.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Black Moon Lilith isn't a body either — most commonly it's a calculated point: the empty focus of the Moon's elliptical orbit (the point opposite the perigee, the Moon's closest approach to Earth). Named after the mythic Lilith who, in some legends, refused to submit and left Eden on her own terms, it represents your raw, untamed, unapologetic side — the parts that were suppressed or shamed, and the power you reclaim when you stop apologizing for them." },
            { kind: "callout", tone: "tip", title: "Where you refuse to be tamed", text: "Lilith's sign and house show where you experience taboo, suppression, or raw instinct — and where reclaiming that energy can be deeply freeing. In the 7th house it might surface in relationships; in the 2nd, around self-worth and the body." },
            { kind: "callout", tone: "history", title: "Several Liliths exist", text: "Confusingly, astrologers use more than one 'Lilith.' The most common is Black Moon Lilith (the orbital point, mean or 'true'); there's also Asteroid Lilith (1181 Lilith, an actual asteroid) and the hypothetical 'Dark Moon' Lilith. When someone cites a Lilith placement, it's worth knowing which one — they sit in different spots." },
            { kind: "callout", tone: "culture", title: "A reclaimed symbol", text: "The Lilith figure was long cast as a demoness in folklore, but modern and feminist readings reframe her as a symbol of autonomy and refusing to be diminished. In astrology this colors Black Moon Lilith as empowerment rather than menace — a place to own, not exorcise." },
            { kind: "callout", tone: "evidence", title: "A point, not a force", text: "Black Moon Lilith is a geometric point in the Moon's orbit, not an object exerting any pull. Its meaning is purely symbolic and interpretive — a lens for reflecting on suppressed parts of the self, not a predictive measurement." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Black Moon Lilith represents…", options: [
              { id: "a", text: "Your raw, untamed, suppressed-then-reclaimed power", correct: true, explanation: "Correct — the wild, unapologetic self." },
              { id: "b", text: "Your daily routine", correct: false, explanation: "That's more the 6th house." },
              { id: "c", text: "A major planet", correct: false, explanation: "It's a calculated point, not a body." },
            ] },
            { id: "q2", type: "mcq", prompt: "Black Moon Lilith is most commonly defined as…", options: [
              { id: "a", text: "The empty focus of the Moon's elliptical orbit", correct: true, explanation: "Right — a geometric point, not an object." },
              { id: "b", text: "A large moon of Saturn", correct: false, explanation: "It isn't a moon at all." },
              { id: "c", text: "The Moon's North Node", correct: false, explanation: "That's a different point entirely." },
              { id: "d", text: "A bright star in Scorpio", correct: false, explanation: "It isn't a star." },
            ] },
            { id: "q3", type: "mcq", prompt: "Modern and feminist readings tend to frame Lilith as a symbol of…", options: [
              { id: "a", text: "Autonomy and refusing to be diminished", correct: true, explanation: "Yes — reclaimed as empowerment rather than menace." },
              { id: "b", text: "Wealth and luck", correct: false, explanation: "That's not the Lilith theme." },
              { id: "c", text: "Strict obedience", correct: false, explanation: "Lilith is the opposite of submission in the myth." },
            ] },
            { id: "q4", type: "true-false", prompt: "There is more than one 'Lilith' used in astrology (e.g., Black Moon Lilith and Asteroid Lilith).", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they're different points and sit in different places." },
              { id: "f", text: "False", correct: false, explanation: "Several Liliths exist; it's worth knowing which is meant." },
            ] },
            { id: "q5", type: "true-false", prompt: "Black Moon Lilith is a calculated point, not a physical planet.", options: [
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
          id: "l7-hemispheres-quadrants",
          title: "Hemispheres & quadrants",
          objective: "Read a chart's hemisphere balance and the four quadrants for overall orientation.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Before interpreting any single planet, it pays to zoom all the way out and ask where the planets are clustered on the wheel. The chart divides into halves (hemispheres) along two axes, and the crossing of those axes makes four quadrants. A lopsided distribution is one of the fastest 'big picture' reads available." },
            { kind: "heading", text: "The two hemisphere axes" },
            { kind: "list", items: [
              "**Horizon axis (Ascendant–Descendant)** — splits the chart into an upper (southern) half above the horizon and a lower (northern) half below it. Many planets up top lean toward public, outer, visible life; many below lean toward private, inner, foundational life.",
              "**Meridian axis (Midheaven–IC)** — splits the chart into an eastern (left) half and a western (right) half. The eastern half (around the Ascendant) emphasizes self-direction and personal agency; the western half (around the Descendant) emphasizes relationships, others, and circumstance.",
            ] },
            { kind: "heading", text: "The four quadrants" },
            { kind: "text", text: "Where the two axes cross, they create four quadrants, each spanning three houses. A heavy concentration in one quadrant flavors the whole personality toward that quadrant's blend of inner/outer and self/other." },
            { kind: "table", headers: ["Quadrant", "Houses", "Keynote"], rows: [
              ["First (lower-east)", "1–3", "Self-formation, instinct, personal beginnings"],
              ["Second (lower-west)", "4–6", "Roots, home, daily work and care"],
              ["Third (upper-west)", "7–9", "Relationships, others, shared meaning"],
              ["Fourth (upper-east)", "10–12", "Public life, contribution, transcendence"],
            ] },
            { kind: "callout", tone: "tip", title: "Read the lean first", text: "A chart loaded below the horizon and on the east side suggests a private, self-directed person building from the inside out; one loaded up top and on the west suggests a public, relationship-driven life. You're not predicting anything — you're getting oriented before the detail work." },
            { kind: "callout", tone: "history", title: "Angles as anchors", text: "The four points where these axes meet the wheel — Ascendant, IC, Descendant, and Midheaven — are the chart's 'angles,' considered the most sensitive degrees in traditional astrology. Planets sitting right on an angle are read as especially prominent, which is part of why hemisphere emphasis carries weight." },
            { kind: "callout", tone: "evidence", title: "An overview tool", text: "Hemisphere and quadrant emphasis is a structural summary of where the symbols cluster — useful for orientation, not a measurement of temperament. As always, it's one interpretive lens among many, and individual placements can qualify or override the overall lean." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The horizon axis (Ascendant–Descendant) splits the chart into…", options: [
              { id: "a", text: "An upper (public) half and a lower (private) half", correct: true, explanation: "Correct — above vs. below the horizon." },
              { id: "b", text: "A fire half and a water half", correct: false, explanation: "Elements aren't how hemispheres are defined." },
              { id: "c", text: "A fast half and a slow half", correct: false, explanation: "Speed isn't the basis of the split." },
            ] },
            { id: "q2", type: "mcq", prompt: "The eastern (left) half of the chart, around the Ascendant, emphasizes…", options: [
              { id: "a", text: "Self-direction and personal agency", correct: true, explanation: "Yes — the 'self' side of the meridian axis." },
              { id: "b", text: "Other people and relationships", correct: false, explanation: "That's the western half." },
              { id: "c", text: "Money only", correct: false, explanation: "That's far too narrow." },
            ] },
            { id: "q3", type: "mcq", prompt: "How many quadrants does the chart divide into, and how many houses each?", options: [
              { id: "a", text: "Four quadrants of three houses each", correct: true, explanation: "Right — two crossing axes make four quadrants spanning houses 1–3, 4–6, 7–9, and 10–12." },
              { id: "b", text: "Two quadrants of six houses each", correct: false, explanation: "Those are hemispheres, not quadrants." },
              { id: "c", text: "Twelve quadrants of one house each", correct: false, explanation: "Those would just be the houses themselves." },
            ] },
            { id: "q4", type: "mcq", prompt: "The four angles of the chart are the…", options: [
              { id: "a", text: "Ascendant, IC, Descendant, and Midheaven", correct: true, explanation: "Correct — the most sensitive points where the axes meet the wheel." },
              { id: "b", text: "Sun, Moon, Mercury, and Venus", correct: false, explanation: "Those are planets, not angles." },
              { id: "c", text: "Aries, Cancer, Libra, and Capricorn", correct: false, explanation: "Those are the cardinal signs, not the chart's angles." },
            ] },
            { id: "q5", type: "true-false", prompt: "Hemisphere and quadrant emphasis is best used as a quick orientation tool before reading individual placements.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it's the 'forest before the trees.'" },
              { id: "f", text: "False", correct: false, explanation: "It genuinely works as an overview lens." },
            ] },
          ],
        },
        {
          id: "l8-shapes",
          title: "Hemispheres & chart shapes",
          objective: "Recognize the classic chart shapes and what each says about energy distribution.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Beyond which half the planets favor, their overall pattern around the wheel falls into a handful of classic shapes. The astrologer Marc Edmund Jones catalogued seven of these in the 20th century, and they remain a popular shorthand for how focused or wide-ranging someone's energy is." },
            { kind: "table", headers: ["Shape", "Pattern", "Suggests"], rows: [
              ["Bundle", "All planets within ~120° (a third of the wheel)", "Highly focused, specialized, self-contained"],
              ["Bowl", "All planets within ~180° (one half)", "A clear emphasis; a sense of something sought on the empty side"],
              ["Bucket", "A bowl plus one planet opposite (the 'handle')", "Focus channeled through the single handle planet"],
              ["Locomotive", "Planets spread across ~two-thirds, one third empty", "Driving, self-motivated, with a missing-area to develop"],
              ["Seesaw", "Two groups roughly opposite each other", "Weighing two camps; awareness of opposing pulls"],
              ["Splash", "Planets spread fairly evenly all around", "Wide-ranging interests; many irons in the fire"],
              ["Splay", "Irregular clumps with sharp emphases", "Strong, individual, hard-to-pigeonhole focus"],
            ] },
            { kind: "callout", tone: "tip", title: "Read the forest first", text: "The hemisphere balance and overall shape give you the 'forest' before the 'trees' — a quick read on whether someone is inwardly or outwardly oriented, focused or scattered, self-driven or other-driven. A Bundle and a Splash describe very different ways of moving through life before you've examined a single aspect." },
            { kind: "callout", tone: "tip", title: "Use the gaps", text: "Empty space is informative too. A Bowl's empty half, or a Locomotive's empty third, often points to an area the person feels drawn to fill or develop — the shape's 'missing' region is part of the reading, not just the planets themselves." },
            { kind: "callout", tone: "history", title: "Marc Edmund Jones' patterns", text: "Jones introduced these 'planetary patterns' in 'The Guide to Horoscope Interpretation' (1941), and astrologer Robert Carl Jansky and others later refined them. They're a modern systematizing tool rather than an ancient one, which is why the exact degree cutoffs vary slightly between authors." },
            { kind: "callout", tone: "evidence", title: "A pattern, not a personality test", text: "Chart shape is a geometric description of where symbols cluster, useful as an overview. It isn't a validated measure of personality, and individual placements always qualify it — a 'Splash' person can still be intensely focused if a stellium pulls one way." },
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
              { id: "d", text: "In two opposite groups", correct: false, explanation: "That's a Seesaw." },
            ] },
            { id: "q3", type: "mcq", prompt: "A 'Bucket' shape is essentially a Bowl plus…", options: [
              { id: "a", text: "A single planet opposite, forming a 'handle'", correct: true, explanation: "Right — the handle planet channels the whole bowl's focus." },
              { id: "b", text: "A second full bowl", correct: false, explanation: "Two opposite groups would be a Seesaw." },
              { id: "c", text: "An empty chart", correct: false, explanation: "A bucket still has all planets placed." },
            ] },
            { id: "q4", type: "mcq", prompt: "In shape analysis, an empty region of the wheel often points to…", options: [
              { id: "a", text: "An area the person feels drawn to develop or fill", correct: true, explanation: "Yes — gaps are part of the reading." },
              { id: "b", text: "A mistake in the chart", correct: false, explanation: "Empty space is normal and meaningful, not an error." },
              { id: "c", text: "Nothing at all", correct: false, explanation: "Gaps are informative in shape analysis." },
            ] },
            { id: "q5", type: "true-false", prompt: "Reading the chart's overall shape gives a quick 'big picture' before individual placements.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the forest before the trees." },
              { id: "f", text: "False", correct: false, explanation: "Shape really does set the overview." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the name of the chart shape in which all the planets are bunched within about a third of the wheel.", options: [], answer: "Bundle", accept: ["bundle", "the bundle"], explanation: "A Bundle packs all planets within roughly 120° — the most focused, self-contained shape." },
          ],
        },
        {
          id: "l9-stelliums",
          title: "Stelliums & emphasis",
          objective: "Recognize a stellium and explain what a concentration of planets signifies.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "A stellium is a cluster of three or more planets in the same sign or the same house. (Some astrologers want four-plus, or require the planets to be close enough to all aspect one another; three in one sign or house is the common working definition.) It marks a powerful concentration of energy — a theme the person can't help but live out intensely." },
            { kind: "text", text: "A stellium in a sign floods the person with that sign's qualities; a stellium in a house pours energy into that area of life. Often the two overlap, since planets bunched in one sign frequently fall in one house. The more personal the planets involved (Sun, Moon, Mercury, Venus, Mars), the more individually defining the stellium tends to be." },
            { kind: "callout", tone: "tip", title: "Concentrated focus", text: "A stellium can be a superpower and an obsession at once — a place of great talent and drive that also demands conscious balance with the rest of the chart, so the person isn't swallowed by that one theme. Whatever sign or house holds the stellium usually becomes a defining storyline of the life." },
            { kind: "callout", tone: "tradition", title: "The ruler matters", text: "When a stellium fills a sign, the planet that rules that sign (its dispositor) gains importance — it 'manages' the whole cluster. Tracking where that ruler sits adds depth: a Virgo stellium, for example, routes much of its energy through wherever Mercury lands." },
            { kind: "callout", tone: "evidence", title: "Emphasis, not destiny", text: "A stellium signals where a chart's energy concentrates — a strong interpretive emphasis, not a forecast of success or failure. It describes intensity and focus; what someone does with that focus is open. Keep the framing symbolic and developmental." },
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
            { id: "q3", type: "mcq", prompt: "When a stellium fills a sign, which planet gains added importance?", options: [
              { id: "a", text: "The ruler (dispositor) of that sign", correct: true, explanation: "Right — the sign's ruler 'manages' the whole cluster." },
              { id: "b", text: "Whichever planet is brightest", correct: false, explanation: "Brightness isn't how dispositors work." },
              { id: "c", text: "The Sun, always", correct: false, explanation: "It's the sign's own ruler, not automatically the Sun." },
            ] },
            { id: "q4", type: "mcq", prompt: "A stellium involving personal planets (Sun, Moon, Mercury, Venus, Mars) tends to be…", options: [
              { id: "a", text: "More individually defining", correct: true, explanation: "Yes — personal planets make the emphasis more uniquely yours." },
              { id: "b", text: "Completely irrelevant", correct: false, explanation: "Personal planets heighten, not reduce, the effect." },
              { id: "c", text: "A sign the chart is broken", correct: false, explanation: "Stelliums are normal, meaningful features." },
            ] },
            { id: "q5", type: "true-false", prompt: "A stellium marks a powerful concentration of energy that can be both a strength and an intensity to balance.", options: [
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
    { id: "f3", type: "mcq", prompt: "The traditional chart ruler for a Capricorn Ascendant is…", options: [
      { id: "a", text: "Saturn", correct: true },
      { id: "b", text: "Jupiter", correct: false },
      { id: "c", text: "Mars", correct: false },
      { id: "d", text: "Venus", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "'Domicile' means a planet is…", options: [
      { id: "a", text: "In the sign it rules — strong", correct: true },
      { id: "b", text: "In its weakest sign", correct: false },
      { id: "c", text: "Retrograde", correct: false },
      { id: "d", text: "Missing", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "The Sun is exalted in…", options: [
      { id: "a", text: "Aries", correct: true },
      { id: "b", text: "Libra", correct: false },
      { id: "c", text: "Aquarius", correct: false },
      { id: "d", text: "Cancer", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Detriment is the sign…", options: [
      { id: "a", text: "Opposite a planet's domicile", correct: true },
      { id: "b", text: "Where a planet rules", correct: false },
      { id: "c", text: "Opposite a planet's exaltation", correct: false },
      { id: "d", text: "Where a planet is exalted", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "The Moon is in domicile (rules) in…", options: [
      { id: "a", text: "Cancer", correct: true },
      { id: "b", text: "Leo", correct: false },
      { id: "c", text: "Capricorn", correct: false },
      { id: "d", text: "Scorpio", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "A retrograde planet…", options: [
      { id: "a", text: "Appears to move backward (an optical effect)", correct: true },
      { id: "b", text: "Physically reverses orbit", correct: false },
      { id: "c", text: "Leaves the chart", correct: false },
      { id: "d", text: "Is always harmful", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "Which never go retrograde?", options: [
      { id: "a", text: "The Sun and Moon", correct: true },
      { id: "b", text: "Mercury and Mars", correct: false },
      { id: "c", text: "All planets", correct: false },
      { id: "d", text: "Venus and Jupiter", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "A natal retrograde planet often expresses its themes…", options: [
      { id: "a", text: "More internally or reflectively", correct: true },
      { id: "b", text: "By disappearing", correct: false },
      { id: "c", text: "With no difference at all", correct: false },
      { id: "d", text: "Only after age 50", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "The North Node represents…", options: [
      { id: "a", text: "Your growth direction", correct: true },
      { id: "b", text: "Your comfort zone", correct: false },
      { id: "c", text: "Your career", correct: false },
      { id: "d", text: "A planet", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "The South Node represents…", options: [
      { id: "a", text: "Comfort and gifts you arrived with", correct: true },
      { id: "b", text: "Future growth", correct: false },
      { id: "c", text: "Your appearance", correct: false },
      { id: "d", text: "Wealth", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "The lunar nodes complete a full cycle through the zodiac in about…", options: [
      { id: "a", text: "18.6 years", correct: true },
      { id: "b", text: "1 year", correct: false },
      { id: "c", text: "84 years", correct: false },
      { id: "d", text: "29.5 days", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "Chiron is the…", options: [
      { id: "a", text: "Wounded healer — a core wound that becomes a gift", correct: true },
      { id: "b", text: "Ruler of Aries", correct: false },
      { id: "c", text: "Fastest body", correct: false },
      { id: "d", text: "Same as the Sun", correct: false },
    ] },
    { id: "f15", type: "mcq", prompt: "Why is Chiron's house often more personal than its sign?", options: [
      { id: "a", text: "It moves slowly, so an age group shares its sign", correct: true },
      { id: "b", text: "Its sign is chosen at random", correct: false },
      { id: "c", text: "Houses don't matter for Chiron", correct: false },
      { id: "d", text: "It has no house", correct: false },
    ] },
    { id: "f16", type: "mcq", prompt: "Black Moon Lilith represents…", options: [
      { id: "a", text: "Your raw, untamed, reclaimed power", correct: true },
      { id: "b", text: "Daily routine", correct: false },
      { id: "c", text: "A major planet", correct: false },
      { id: "d", text: "Your finances", correct: false },
    ] },
    { id: "f17", type: "mcq", prompt: "Black Moon Lilith is most commonly defined as…", options: [
      { id: "a", text: "The empty focus of the Moon's elliptical orbit", correct: true },
      { id: "b", text: "A moon of Jupiter", correct: false },
      { id: "c", text: "The Moon's North Node", correct: false },
      { id: "d", text: "A fixed star", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "The horizon axis (Ascendant–Descendant) splits the chart into…", options: [
      { id: "a", text: "An upper (public) half and a lower (private) half", correct: true },
      { id: "b", text: "A fire half and a water half", correct: false },
      { id: "c", text: "An odd half and an even half", correct: false },
      { id: "d", text: "A fast half and a slow half", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "The chart's four angles are the…", options: [
      { id: "a", text: "Ascendant, IC, Descendant, and Midheaven", correct: true },
      { id: "b", text: "Sun, Moon, Mercury, and Venus", correct: false },
      { id: "c", text: "Four cardinal signs", correct: false },
      { id: "d", text: "Four lunar nodes", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "Planets in the upper (south) half emphasize…", options: [
      { id: "a", text: "Public, outer life", correct: true },
      { id: "b", text: "Private, inner life", correct: false },
      { id: "c", text: "Nothing", correct: false },
      { id: "d", text: "Retrogrades", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "A 'Bowl' chart has planets…", options: [
      { id: "a", text: "All in one half of the chart", correct: true },
      { id: "b", text: "Spread all around", correct: false },
      { id: "c", text: "In a tiny cluster", correct: false },
      { id: "d", text: "Only on the angles", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "A 'Bucket' shape is a Bowl plus…", options: [
      { id: "a", text: "A single opposite planet (the 'handle')", correct: true },
      { id: "b", text: "A second full bowl", correct: false },
      { id: "c", text: "An empty chart", correct: false },
      { id: "d", text: "A retrograde Sun", correct: false },
    ] },
    { id: "f23", type: "mcq", prompt: "A stellium is…", options: [
      { id: "a", text: "Three+ planets in one sign or house", correct: true },
      { id: "b", text: "A lone planet", correct: false },
      { id: "c", text: "An aspect", correct: false },
      { id: "d", text: "A house system", correct: false },
    ] },
    { id: "f24", type: "mcq", prompt: "When a stellium fills a sign, which planet gains added importance?", options: [
      { id: "a", text: "The ruler (dispositor) of that sign", correct: true },
      { id: "b", text: "The brightest planet", correct: false },
      { id: "c", text: "The Sun, always", correct: false },
      { id: "d", text: "None — rulers are irrelevant", correct: false },
    ] },
    { id: "f25", type: "true-false", prompt: "The lunar nodes are calculated points, not physical bodies.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f26", type: "true-false", prompt: "A dignity makes a placement strictly 'good' or 'bad.'", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f27", type: "true-false", prompt: "Chiron has an ancient astrological tradition reaching back to Babylon.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f28", type: "true-false", prompt: "The Ascendant changes signs roughly every two hours, so an accurate birth time matters for the chart ruler.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
