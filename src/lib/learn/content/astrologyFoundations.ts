import type { Course } from "../types";

/**
 * FLAGSHIP COURSE — fully authored to demonstrate the engine end-to-end.
 * Evidence-forward: leads with what astrology is (a symbolic language for
 * reflection) and what the science says, then teaches the tradition in depth.
 */
export const astrologyFoundations: Course = {
  id: "astrology-foundations",
  domain: "astrology",
  title: "Astrology Foundations",
  subtitle: "Read a birth chart from the ground up",
  level: "foundations",
  icon: "☉", // ☉
  summary:
    "Start from zero and build a real working knowledge of the natal chart — the signs, planets, houses, and aspects — and learn to read them as a language for self-reflection.",
  estMinutes: 75,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "The Chart & Its Building Blocks", lessons: ["What astrology is (and isn't)", "The birth chart", "Elements & modalities", "The twelve signs"] },
    { module: "Planets, Points & Houses", lessons: ["The luminaries & personal planets", "The social & outer planets", "The Big Three", "The twelve houses", "Essential dignities: a preview"] },
    { module: "Putting It Together", lessons: ["The major aspects", "Retrogrades, demystified", "The lunar nodes", "Chart shapes & patterns", "Reading a chart holistically"] },
  ],

  modules: [
    {
      id: "m1",
      title: "The Chart & Its Building Blocks",
      lessons: [
        {
          id: "l1-what-astrology-is",
          title: "What astrology is (and isn't)",
          objective: "Explain what a natal chart represents and how to think about astrology honestly.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Astrology is a symbolic language. A natal (birth) chart is a map of the sky from one specific place and moment — your birth. Astrologers read the positions of the Sun, Moon, and planets in that map as a set of symbols for describing personality, timing, and meaning." },
            { kind: "text", text: "Crucially, the chart is not a force acting on you. Think of it less like a weather forecast and more like a mirror or a deck of prompts: a structured way to reflect on who you are and what you're navigating. The planets don't 'do' anything to you; their positions are a vocabulary you can think with." },
            { kind: "callout", tone: "history", title: "An old, layered tradition", text: "Western astrology grew out of Babylonian sky-watching over 2,000 years ago, was systematized in the Hellenistic Greek-Egyptian world, and was carried forward through the Islamic Golden Age and Renaissance Europe. Until the 1600s astrology and astronomy were studied together — Kepler and Galileo both cast charts. They split as the scientific method matured." },
            { kind: "callout", tone: "culture", title: "Many astrologies", text: "There isn't one astrology. Western (tropical) astrology ties the signs to the seasons; Vedic (Jyotish) astrology in India uses a sidereal zodiac fixed to the constellations; Chinese astrology runs on a twelve-year animal cycle. This course teaches the Western tropical system, the most common in the English-speaking world." },
            { kind: "callout", tone: "tradition", title: "How to hold it", text: "Astrology is a symbolic language and a mirror for self-reflection — a rich framework for thinking about who you are, your relationships, and your timing. Prediction isn't really the point; the chart is a vocabulary you can think with. Held that way, many people find it genuinely meaningful. Stay curious, take what resonates, and leave what doesn't." },
            { kind: "callout", tone: "tip", title: "Why a chart can feel so personal", text: "A good reading lands because the chart hands you precise, evocative language for things you're already living. That's the gift of a symbolic system: it gives shape to inner experience and a fresh angle on it. Use the chart as a prompt for reflection — a way to put words to what you're navigating." },
            { kind: "keyfacts", items: [
              "A natal chart = the sky at your exact birth time and place.",
              "Astrology is a symbolic, reflective language — a mirror, not a physical force.",
              "The chart is a vocabulary you think with, not a forecast that acts on you.",
              "Western (tropical), Vedic (sidereal), and Chinese astrology are distinct systems.",
              "A reading lands by giving precise language to what you're already living.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A natal chart is best described as…", options: [
              { id: "a", text: "A map of the sky at your exact birth moment and place", correct: true, explanation: "Exactly — it's a snapshot of planetary positions from your birth time and location." },
              { id: "b", text: "A force that controls your future", correct: false, explanation: "Astrology treats the chart as symbolic, not as a physical force acting on you." },
              { id: "c", text: "A medical diagnosis", correct: false, explanation: "Astrology makes no medical claims and isn't diagnostic." },
              { id: "d", text: "A randomly generated personality quiz", correct: false, explanation: "It's calculated from real astronomical positions, not random." },
            ] },
            { id: "q2", type: "true-false", prompt: "Astrology is best approached as a reflective tool rather than a way to predict the future.", options: [
              { id: "t", text: "True", correct: true, explanation: "Yes — its real value is as a mirror for self-reflection and meaning, not forecasting." },
              { id: "f", text: "False", correct: false, explanation: "Astrology isn't a reliable predictor; it shines as a reflective, symbolic language." },
            ] },
            { id: "q3", type: "mcq", prompt: "Treating the chart as 'a vocabulary you think with' means…", options: [
              { id: "a", text: "Using its symbols as prompts to reflect on your life", correct: true, explanation: "Right — that's astrology as a symbolic language and mirror." },
              { id: "b", text: "Believing the planets physically control your day", correct: false, explanation: "The chart is symbolic, not a force acting on you." },
              { id: "c", text: "Calculating the gravitational pull of the Moon", correct: false, explanation: "That's astronomy, not how astrology's symbols are used." },
            ] },
            { id: "q4", type: "mcq", prompt: "Which system fixes the zodiac to the seasons rather than the constellations?", options: [
              { id: "a", text: "Western (tropical) astrology", correct: true, explanation: "Tropical astrology anchors 0° Aries to the spring equinox." },
              { id: "b", text: "Vedic (sidereal) astrology", correct: false, explanation: "Vedic astrology uses a sidereal zodiac tied to the constellations." },
              { id: "c", text: "Chinese astrology", correct: false, explanation: "Chinese astrology uses a twelve-year animal cycle, not the tropical zodiac." },
            ] },
            { id: "q5", type: "recall", prompt: "Astrology is often described as a symbolic language and a ______ for self-reflection. Fill in the one word.", options: [], answer: "mirror", accept: ["mirror", "a mirror"], explanation: "A mirror — the chart reflects you back to yourself, a prompt for reflection rather than a forecast." },
          ],
        },
        {
          id: "l2-the-birth-chart",
          title: "The birth chart",
          objective: "Identify the three pieces of information a chart needs and why birth time matters.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "To calculate a chart you need three things: the date, the exact time, and the place of birth. Date and place are usually easy. Birth time is the tricky one — and it matters more than people expect." },
            { kind: "text", text: "Why three? The date fixes where the Sun and slow planets sit in the zodiac. The place fixes your spot on a spinning Earth. The exact time fixes which slice of the sky was rising on the eastern horizon — and the whole house framework hangs off that horizon." },
            { kind: "annotated", prompt: "Anatomy of the chart wheel", instructions: "Tap each marker to learn the part", image: "/images/learn/chart-wheel-diagram.svg", pins: [
              { x: 50, y: 8, title: "The zodiac rim", body: "The twelve signs ring the outer wheel — the zodiac backdrop the Sun, Moon and planets move across." },
              { x: 77, y: 43, title: "The twelve houses", body: "Spokes divide the wheel into twelve houses, numbered from the 1st around to the 12th — each one a different area of life." },
              { x: 50, y: 50, title: "The center — you", body: "At the hub is your point of view: the chart is the whole sky captured from your exact time and place of birth." },
            ] },
            { kind: "text", text: "The fast-moving angles of the chart — the Ascendant (Rising sign) and the houses — shift roughly one degree every four minutes. Get the time wrong by an hour and your Rising sign and house placements can be completely different. The Sun, Moon, and planets by sign are far more forgiving." },
            { kind: "callout", tone: "history", title: "The four angles", text: "Four points anchor every chart: the Ascendant (eastern horizon, the 'I am'), the Descendant opposite it (relationships), the Midheaven or MC (highest point, career and public role), and the Imum Coeli or IC opposite it (home and roots). These angles are the most personal, time-sensitive points in the whole chart." },
            { kind: "callout", tone: "tip", title: "No birth time?", text: "You can still learn a lot from a chart without a birth time — the Sun, Moon (usually), and planetary signs are reliable. But the Rising sign, houses, and angles can't be calculated accurately, so a good app will hide them rather than guess. If your time is uncertain, an astrologer can sometimes narrow it down through a process called rectification." },
            { kind: "keyfacts", items: [
              "A chart needs: date, exact time, and place of birth.",
              "Rising sign + houses depend on an accurate birth time.",
              "Planetary signs are far less sensitive to time errors.",
              "The four angles are the Ascendant, Descendant, Midheaven (MC), and IC.",
              "The angles and houses move ~1° every 4 minutes.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which part of the chart is MOST sensitive to an inaccurate birth time?", options: [
              { id: "a", text: "The Rising sign and houses", correct: true, explanation: "The angles and houses move ~1° every 4 minutes, so they shift quickly." },
              { id: "b", text: "The Sun sign", correct: false, explanation: "The Sun moves slowly and is the most forgiving of time errors." },
              { id: "c", text: "The element of each planet", correct: false, explanation: "Elements are tied to signs, which barely change over an hour." },
            ] },
            { id: "q2", type: "mcq", prompt: "The three pieces of information needed to calculate a chart are:", options: [
              { id: "a", text: "Date, exact time, and place of birth", correct: true, explanation: "Correct — these three locate the sky precisely." },
              { id: "b", text: "Name, age, and zodiac sign", correct: false, explanation: "These don't locate the sky; the chart is computed from date/time/place." },
              { id: "c", text: "Date, season, and country", correct: false, explanation: "Season and country are too coarse — you need exact time and place." },
            ] },
            { id: "q3", type: "true-false", prompt: "Without an accurate birth time, the Rising sign and houses can still be calculated reliably.", options: [
              { id: "t", text: "True", correct: false, explanation: "They can't — the angles move too fast for an uncertain time." },
              { id: "f", text: "False", correct: true, explanation: "Correct — Rising and houses need an accurate time." },
            ] },
            { id: "q4", type: "mcq", prompt: "The Midheaven (MC) is the angle associated with…", options: [
              { id: "a", text: "Career, reputation, and public role", correct: true, explanation: "The MC is the highest point of the chart — your public-facing direction." },
              { id: "b", text: "Home and family roots", correct: false, explanation: "That's the IC, opposite the Midheaven." },
              { id: "c", text: "Emotional security", correct: false, explanation: "That's more the Moon and the IC/4th house." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the name of the angle on the eastern horizon — your Rising sign, also called the…", options: [], answer: "Ascendant", accept: ["the ascendant", "rising", "rising sign", "ascendent"], explanation: "The Ascendant (Rising sign) sits on the eastern horizon and anchors the houses." },
          ],
        },
        {
          id: "l3-elements-modalities",
          title: "Elements & modalities",
          objective: "Classify any sign by its element and modality.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "The twelve signs are organized by two overlapping systems. The four elements describe a sign's basic temperament; the three modalities describe how it moves through the world. Together they form a 4 × 3 grid that produces exactly twelve unique combinations — the twelve signs." },
            { kind: "table", headers: ["Element", "Signs", "Temperament"], rows: [
              ["Fire", "Aries, Leo, Sagittarius", "Active, spirited, expressive"],
              ["Earth", "Taurus, Virgo, Capricorn", "Grounded, practical, steady"],
              ["Air", "Gemini, Libra, Aquarius", "Mental, social, communicative"],
              ["Water", "Cancer, Scorpio, Pisces", "Emotional, intuitive, receptive"],
            ] },
            { kind: "callout", tone: "history", title: "Older than astrology", text: "The four elements come from ancient Greek natural philosophy — Empedocles and later Aristotle held that everything was a blend of fire, earth, air, and water. Astrology borrowed the scheme. The classical pairing of fire/air as 'active' and earth/water as 'receptive' still shapes how astrologers read elemental balance." },
            { kind: "table", headers: ["Modality", "Signs", "Style"], rows: [
              ["Cardinal", "Aries, Cancer, Libra, Capricorn", "Initiating — starts things"],
              ["Fixed", "Taurus, Leo, Scorpio, Aquarius", "Stabilizing — sustains things"],
              ["Mutable", "Gemini, Virgo, Sagittarius, Pisces", "Adapting — changes things"],
            ] },
            { kind: "callout", tone: "tradition", title: "Modalities track the seasons", text: "The modalities map onto the rhythm of a season. Cardinal signs open each season (Aries = spring, Cancer = summer, Libra = autumn, Capricorn = winter), fixed signs hold the middle of a season at its peak, and mutable signs dissolve one season into the next. That's why cardinal signs feel like beginnings and mutable signs feel like transitions." },
            { kind: "text", text: "Every sign is exactly one element and one modality, and each element/modality pairing is unique. For example, Aries is the only Cardinal Fire sign, and Scorpio is the only Fixed Water sign. If you know two facts about a sign — its element and its modality — you've pinned it down completely." },
            { kind: "callout", tone: "tip", title: "Reading elemental balance", text: "When you look at a whole chart, count the elements. A stack of fire and air placements with no water can suggest someone who lives in ideas and action but skips the feeling layer; an all-water chart can be deeply empathic but easily flooded. Balance isn't 'better' — it's just one of the first things a chart shows you." },
            { kind: "sort", prompt: "Place each sign in its element", instructions: "Tap a sign, then tap its element", groups: [
              { name: "Fire", accent: "#c9881f", items: ["Aries", "Leo", "Sagittarius"] },
              { name: "Earth", accent: "#6a9a4a", items: ["Taurus", "Virgo", "Capricorn"] },
              { name: "Air", accent: "#B8A0D2", items: ["Gemini", "Libra", "Aquarius"] },
              { name: "Water", accent: "#5b6bb5", items: ["Cancer", "Scorpio", "Pisces"] },
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which signs are the Earth element?", options: [
              { id: "a", text: "Taurus, Virgo, Capricorn", correct: true, explanation: "Correct — the three Earth signs." },
              { id: "b", text: "Aries, Leo, Sagittarius", correct: false, explanation: "Those are the Fire signs." },
              { id: "c", text: "Gemini, Libra, Aquarius", correct: false, explanation: "Those are the Air signs." },
            ] },
            { id: "q2", type: "mcq", prompt: "A 'Cardinal' sign is one that…", options: [
              { id: "a", text: "Initiates — it starts things", correct: true, explanation: "Cardinal signs begin each season and initiate." },
              { id: "b", text: "Sustains and stabilizes", correct: false, explanation: "That's the Fixed modality." },
              { id: "c", text: "Adapts and changes", correct: false, explanation: "That's the Mutable modality." },
            ] },
            { id: "q3", type: "mcq", prompt: "How many elements and modalities are there?", options: [
              { id: "a", text: "4 elements and 3 modalities", correct: true, explanation: "Right — 4 × 3 = the 12 signs." },
              { id: "b", text: "3 elements and 4 modalities", correct: false, explanation: "It's the other way around: 4 elements, 3 modalities." },
              { id: "c", text: "12 elements and 12 modalities", correct: false, explanation: "There are 12 signs, but only 4 elements and 3 modalities." },
            ] },
            { id: "q4", type: "recall", prompt: "Which element is described as grounded, practical, and steady?", options: [], answer: "Earth", accept: ["earth element"], explanation: "Earth — Taurus, Virgo, and Capricorn." },
            { id: "q5", type: "mcq", prompt: "Scorpio is which element and modality?", options: [
              { id: "a", text: "Fixed Water", correct: true, explanation: "Scorpio is the only Fixed Water sign." },
              { id: "b", text: "Cardinal Water", correct: false, explanation: "That's Cancer." },
              { id: "c", text: "Mutable Water", correct: false, explanation: "That's Pisces." },
            ] },
            { id: "q6", type: "true-false", prompt: "Mutable signs fall at the end of each season and govern transition and change.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — mutable signs dissolve one season into the next." },
              { id: "f", text: "False", correct: false, explanation: "Mutable signs do close each season; cardinal signs open them." },
            ] },
          ],
        },
        {
          id: "l4-the-twelve-signs",
          title: "The twelve signs",
          objective: "Recall each sign's element, modality, and ruling planet.",
          estMinutes: 6,
          blocks: [
            { kind: "match", prompt: "Match each sign to its nature", instructions: "Tap a sign, then tap its meaning", pairs: [
              { cue: "Aries", img: "/images/learn/zodiac-aries.webp", match: "Cardinal fire — the initiator" },
              { cue: "Taurus", img: "/images/learn/zodiac-taurus.webp", match: "Fixed earth — the stabiliser" },
              { cue: "Gemini", img: "/images/learn/zodiac-gemini.webp", match: "Mutable air — the messenger" },
              { cue: "Cancer", img: "/images/learn/zodiac-cancer.webp", match: "Cardinal water — the nurturer" },
              { cue: "Leo", img: "/images/learn/zodiac-leo.webp", match: "Fixed fire — the performer" },
              { cue: "Virgo", img: "/images/learn/zodiac-virgo.webp", match: "Mutable earth — the analyst" },
            ] },
            { kind: "text", text: "Each sign blends an element and modality, and each has a traditional ruling planet — the planet most 'at home' in that sign. Don't memorize all of this at once; use the table as a reference you'll absorb over time. The signs also follow a story arc: Aries begins with raw selfhood and the wheel matures toward Pisces, where the self dissolves back into the collective." },
            { kind: "table", headers: ["Sign", "Element", "Modality", "Ruler"], rows: [
              ["Aries", "Fire", "Cardinal", "Mars"],
              ["Taurus", "Earth", "Fixed", "Venus"],
              ["Gemini", "Air", "Mutable", "Mercury"],
              ["Cancer", "Water", "Cardinal", "Moon"],
              ["Leo", "Fire", "Fixed", "Sun"],
              ["Virgo", "Earth", "Mutable", "Mercury"],
              ["Libra", "Air", "Cardinal", "Venus"],
              ["Scorpio", "Water", "Fixed", "Mars / Pluto"],
              ["Sagittarius", "Fire", "Mutable", "Jupiter"],
              ["Capricorn", "Earth", "Cardinal", "Saturn"],
              ["Aquarius", "Air", "Fixed", "Saturn / Uranus"],
              ["Pisces", "Water", "Mutable", "Jupiter / Neptune"],
            ] },
            { kind: "callout", tone: "tradition", title: "Polarities: every sign has a partner", text: "The signs pair into six opposite axes (Aries–Libra, Taurus–Scorpio, and so on). Opposite signs share a modality and complementary elements, and they often express two ends of the same theme — Aries' 'me' balancing Libra's 'we,' Cancer's private home balancing Capricorn's public ambition." },
            { kind: "callout", tone: "history", title: "Old & new rulers", text: "Before the outer planets were discovered, each planet ruled two signs. Modern astrologers added Pluto (Scorpio), Uranus (Aquarius), and Neptune (Pisces) as 'co-rulers.' Both the traditional and modern rulers are still used — traditional astrologers often keep Mars for Scorpio and Saturn for Aquarius." },
            { kind: "explore", prompt: "The wheel of signs", instructions: "Tap any glyph to learn it", image: "/images/learn/zodiac-wheel-fragment-1.webp", items: [
              { glyph: "♈", name: "Aries", meta: "Fire · Cardinal · Mar 21–Apr 19", accent: "#c9881f", blurb: "Cardinal fire, ruled by Mars — the initiator. Bold, direct and quick to begin." },
              { glyph: "♉", name: "Taurus", meta: "Earth · Fixed · Apr 20–May 20", accent: "#6a9a4a", blurb: "Fixed earth, ruled by Venus — steady and sensual. Patient, grounded, loyal." },
              { glyph: "♊", name: "Gemini", meta: "Air · Mutable · May 21–Jun 20", accent: "#B8A0D2", blurb: "Mutable air, ruled by Mercury — curious and quick. Communicative and adaptable." },
              { glyph: "♋", name: "Cancer", meta: "Water · Cardinal · Jun 21–Jul 22", accent: "#5b6bb5", blurb: "Cardinal water, ruled by the Moon — protective and feeling. Nurturing and intuitive." },
              { glyph: "♌", name: "Leo", meta: "Fire · Fixed · Jul 23–Aug 22", accent: "#c9881f", blurb: "Fixed fire, ruled by the Sun — warm and proud. Generous, expressive, loyal." },
              { glyph: "♍", name: "Virgo", meta: "Earth · Mutable · Aug 23–Sep 22", accent: "#6a9a4a", blurb: "Mutable earth, ruled by Mercury — precise and practical. Helpful and analytical." },
              { glyph: "♎", name: "Libra", meta: "Air · Cardinal · Sep 23–Oct 22", accent: "#B8A0D2", blurb: "Cardinal air, ruled by Venus — relational and fair. Harmonious and diplomatic." },
              { glyph: "♏", name: "Scorpio", meta: "Water · Fixed · Oct 23–Nov 21", accent: "#5b6bb5", blurb: "Fixed water, ruled by Mars and Pluto — intense and private. Probing and transformative." },
              { glyph: "♐", name: "Sagittarius", meta: "Fire · Mutable · Nov 22–Dec 21", accent: "#c9881f", blurb: "Mutable fire, ruled by Jupiter — restless and seeking. Adventurous and candid." },
              { glyph: "♑", name: "Capricorn", meta: "Earth · Cardinal · Dec 22–Jan 19", accent: "#6a9a4a", blurb: "Cardinal earth, ruled by Saturn — ambitious and disciplined. Patient and enduring." },
              { glyph: "♒", name: "Aquarius", meta: "Air · Fixed · Jan 20–Feb 18", accent: "#B8A0D2", blurb: "Fixed air, ruled by Saturn and Uranus — independent and original. Inventive and humane." },
              { glyph: "♓", name: "Pisces", meta: "Water · Mutable · Feb 19–Mar 20", accent: "#5b6bb5", blurb: "Mutable water, ruled by Jupiter and Neptune — dreamy and porous. Imaginative and compassionate." },
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which planet traditionally rules Leo?", options: [
              { id: "a", text: "The Sun", correct: true, explanation: "Leo is ruled by the Sun." },
              { id: "b", text: "The Moon", correct: false, explanation: "The Moon rules Cancer." },
              { id: "c", text: "Mars", correct: false, explanation: "Mars rules Aries (and traditionally Scorpio)." },
            ] },
            { id: "q2", type: "mcq", prompt: "Mercury rules which two signs?", options: [
              { id: "a", text: "Gemini and Virgo", correct: true, explanation: "Correct — Mercury rules both Gemini and Virgo." },
              { id: "b", text: "Taurus and Libra", correct: false, explanation: "Those are ruled by Venus." },
              { id: "c", text: "Aries and Scorpio", correct: false, explanation: "Those are traditionally ruled by Mars." },
            ] },
            { id: "q3", type: "true-false", prompt: "Capricorn is a Cardinal Earth sign ruled by Saturn.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct on all three counts." },
              { id: "f", text: "False", correct: false, explanation: "It is in fact Cardinal, Earth, and Saturn-ruled." },
            ] },
            { id: "q4", type: "mcq", prompt: "Which sign sits opposite Aries on the zodiac wheel?", options: [
              { id: "a", text: "Libra", correct: true, explanation: "Aries ('me') opposes Libra ('we') — both cardinal signs." },
              { id: "b", text: "Cancer", correct: false, explanation: "Cancer squares Aries; it doesn't oppose it." },
              { id: "c", text: "Pisces", correct: false, explanation: "Pisces sits just before Aries, not opposite it." },
            ] },
            { id: "q5", type: "mcq", prompt: "Venus traditionally rules which pair of signs?", options: [
              { id: "a", text: "Taurus and Libra", correct: true, explanation: "Venus rules earthy Taurus and airy Libra." },
              { id: "b", text: "Gemini and Virgo", correct: false, explanation: "Those are Mercury's signs." },
              { id: "c", text: "Aries and Scorpio", correct: false, explanation: "Those are Mars's traditional signs." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Planets, Points & Houses",
      lessons: [
        {
          id: "l5-personal-planets",
          title: "The luminaries & personal planets",
          objective: "State what the Sun, Moon, Mercury, Venus, and Mars each represent.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "If signs are the 'how,' planets are the 'what.' The fastest-moving bodies — the two luminaries (Sun, Moon) and the personal planets (Mercury, Venus, Mars) — describe the most personal, day-to-day parts of you. Because they move quickly, they differ noticeably even between people born in the same week." },
            { kind: "table", headers: ["Body", "Governs"], rows: [
              ["Sun ☉", "Core identity, vitality, what you're growing toward"],
              ["Moon ☽", "Emotions, instincts, what makes you feel safe"],
              ["Mercury ☿", "Mind, communication, how you think and speak"],
              ["Venus ♀", "Love, beauty, values, what you're drawn to"],
              ["Mars ♂", "Drive, anger, desire, how you take action"],
            ] },
            { kind: "text", text: "A useful shorthand: the Sun is who you are, the Moon is how you feel, Mercury is how you think, Venus is how you love, and Mars is how you act." },
            { kind: "callout", tone: "history", title: "Luminaries vs. planets", text: "Strictly, the Sun and Moon are 'luminaries,' not planets — but classical astrology counted them among the seven visible 'wandering stars' (planetes in Greek) alongside Mercury, Venus, Mars, Jupiter, and Saturn. For seventeen centuries those seven were the entire toolkit." },
            { kind: "callout", tone: "tip", title: "Mercury never strays far from the Sun", text: "Because Mercury and Venus orbit inside Earth, they're never far from the Sun in the sky. Your Mercury sign is always your Sun sign or one of the two adjacent signs, and Venus is always within two signs of the Sun. That's why so many people's 'mind' and 'identity' signs are neighbors." },
            { kind: "keyfacts", items: [
              "Luminaries: Sun (identity) and Moon (emotion).",
              "Personal planets: Mercury (mind), Venus (love/values), Mars (drive).",
              "These move fast, so they're the most individual part of a chart.",
              "Mercury is always within one sign of the Sun; Venus within two.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The Moon in a chart primarily governs…", options: [
              { id: "a", text: "Emotions, instincts, and what makes you feel safe", correct: true, explanation: "Yes — the Moon is the emotional, instinctive self." },
              { id: "b", text: "Career and public reputation", correct: false, explanation: "That's more the domain of the Midheaven and Saturn." },
              { id: "c", text: "Communication and thinking", correct: false, explanation: "That's Mercury." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which planet governs love, beauty, and values?", options: [
              { id: "a", text: "Venus", correct: true, explanation: "Venus rules love, beauty, and what we value." },
              { id: "b", text: "Mars", correct: false, explanation: "Mars rules drive and action." },
              { id: "c", text: "Mercury", correct: false, explanation: "Mercury rules the mind and communication." },
            ] },
            { id: "q3", type: "mcq", prompt: "Mars is associated with…", options: [
              { id: "a", text: "Drive, desire, and how you take action", correct: true, explanation: "Correct — Mars is the planet of action and assertion." },
              { id: "b", text: "Emotion and nurture", correct: false, explanation: "That's the Moon." },
              { id: "c", text: "Identity and vitality", correct: false, explanation: "That's the Sun." },
            ] },
            { id: "q4", type: "true-false", prompt: "Your Mercury sign is always within one sign of your Sun sign.", options: [
              { id: "t", text: "True", correct: true, explanation: "Mercury orbits close to the Sun, so it's never more than a sign away." },
              { id: "f", text: "False", correct: false, explanation: "It's true — Mercury stays close to the Sun in the sky." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the planet of the mind, communication, and how you think and speak.", options: [], answer: "Mercury", accept: ["mercury"], explanation: "Mercury — the planet of mind and communication." },
          ],
        },
        {
          id: "l6-outer-planets",
          title: "The social & outer planets",
          objective: "Distinguish the social planets (Jupiter, Saturn) from the outer planets (Uranus, Neptune, Pluto).",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Beyond Mars, the planets move slowly — so they describe broader, more generational themes rather than daily personality. The further out a planet orbits, the longer it lingers in a sign and the more it speaks to collective rather than personal life." },
            { kind: "table", headers: ["Body", "Governs"], rows: [
              ["Jupiter ♃", "Growth, luck, belief, expansion"],
              ["Saturn ♄", "Discipline, limits, responsibility, time"],
              ["Uranus ♅", "Change, rebellion, sudden insight"],
              ["Neptune ♆", "Dreams, spirituality, illusion"],
              ["Pluto ♇", "Power, transformation, the buried"],
            ] },
            { kind: "callout", tone: "tradition", title: "Personal vs generational", text: "Jupiter and Saturn are the 'social' planets — they bridge the personal and the collective. Uranus, Neptune, and Pluto move so slowly they stay in a sign for years, so by sign they describe whole generations; their house and aspects make them personal to you." },
            { kind: "table", headers: ["Body", "Years per sign (approx.)"], rows: [
              ["Jupiter ♃", "About 1 year"],
              ["Saturn ♄", "About 2.5 years"],
              ["Uranus ♅", "About 7 years"],
              ["Neptune ♆", "About 14 years"],
              ["Pluto ♇", "12–30 years (varies)"],
            ] },
            { kind: "callout", tone: "history", title: "Discovered in the modern era", text: "Uranus (1781), Neptune (1846), and Pluto (1930) were all found by telescope, long after astrology's core was set — so astrologers had to assign them meanings. Their discoveries were even read symbolically: Uranus with revolution, Neptune with Romanticism and spiritualism, Pluto with the atomic age. Pluto was reclassified a 'dwarf planet' by astronomers in 2006, but astrologers still use it." },
            { kind: "callout", tone: "evidence", title: "Generational, not deterministic", text: "Because everyone in your age cohort shares an outer-planet sign, that placement says little about you as an individual on its own. It becomes personal only through the house it falls in and the aspects it makes to your faster, personal planets. Treat outer-planet signs as backdrop, not headline." },
            { kind: "keyfacts", items: [
              "Social planets: Jupiter (expansion) and Saturn (structure).",
              "Outer planets: Uranus (change), Neptune (dreams), Pluto (transformation).",
              "Slower orbit = longer in a sign = more generational by sign.",
              "Outer planets get personal through house and aspect, not sign.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Saturn is the planet of…", options: [
              { id: "a", text: "Discipline, limits, and responsibility", correct: true, explanation: "Saturn governs structure, time, and hard lessons." },
              { id: "b", text: "Luck and expansion", correct: false, explanation: "That's Jupiter." },
              { id: "c", text: "Dreams and illusion", correct: false, explanation: "That's Neptune." },
            ] },
            { id: "q2", type: "mcq", prompt: "Why do the outer planets (Uranus, Neptune, Pluto) describe whole generations by sign?", options: [
              { id: "a", text: "They move so slowly they stay in one sign for years", correct: true, explanation: "Right — everyone born over those years shares the sign placement." },
              { id: "b", text: "They are larger than the other planets", correct: false, explanation: "Size isn't the reason; their slow motion is." },
              { id: "c", text: "They are closer to Earth", correct: false, explanation: "They're the farthest, which is why they move slowly across the sky." },
            ] },
            { id: "q3", type: "mcq", prompt: "Pluto is associated with…", options: [
              { id: "a", text: "Power, transformation, and what's buried", correct: true, explanation: "Correct — Pluto rules deep transformation." },
              { id: "b", text: "Communication and trade", correct: false, explanation: "That's Mercury." },
              { id: "c", text: "Comfort and home", correct: false, explanation: "That's more the Moon and 4th house." },
            ] },
            { id: "q4", type: "mcq", prompt: "Which two planets are called the 'social' planets that bridge personal and collective life?", options: [
              { id: "a", text: "Jupiter and Saturn", correct: true, explanation: "Jupiter and Saturn sit between the personal and outer planets." },
              { id: "b", text: "Mars and Venus", correct: false, explanation: "Those are personal planets." },
              { id: "c", text: "Neptune and Pluto", correct: false, explanation: "Those are outer, generational planets." },
            ] },
            { id: "q5", type: "true-false", prompt: "An outer planet's sign becomes personally meaningful mainly through its house and aspects.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the sign is shared by a generation; house and aspect make it yours." },
              { id: "f", text: "False", correct: false, explanation: "It's true — house and aspects personalize a generational sign placement." },
            ] },
          ],
        },
        {
          id: "l7-big-three",
          title: "The Big Three",
          objective: "Explain what the Sun, Moon, and Rising sign each contribute to the 'Big Three.'",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "When people say 'I'm a Leo,' they usually mean their Sun sign. But the most useful quick portrait of a chart is the 'Big Three': Sun, Moon, and Rising sign together. One sign rarely captures a person; three start to." },
            { kind: "list", items: [
              "Sun — your core identity and what you're growing toward.",
              "Moon — your inner emotional world and needs.",
              "Rising (Ascendant) — the 'mask' you wear, your first impression and approach to life.",
            ] },
            { kind: "callout", tone: "tip", title: "Why the Rising matters", text: "The Rising sign is set by the exact birth time and place — it's the sign that was on the eastern horizon at your birth. It colors the whole chart, which is why two people with the same Sun sign can feel so different. The Rising also sets where every house begins, so it quietly arranges the entire chart." },
            { kind: "callout", tone: "tradition", title: "A handy metaphor", text: "An old teaching frames it as a house: the Sun is what burns at the core, the Moon is the private inner life behind closed doors, and the Rising is the front door and façade that visitors meet first. None is the 'real' you — they're three layers of the same person." },
            { kind: "keyfacts", items: [
              "Big Three = Sun (identity) + Moon (emotion) + Rising (approach).",
              "Sun and Moon need only the date; Rising needs the exact time.",
              "The Rising sign sets the cusp of the 1st house and orders the rest.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The 'Big Three' refers to which placements?", options: [
              { id: "a", text: "Sun, Moon, and Rising sign", correct: true, explanation: "Correct — the quick portrait of a chart." },
              { id: "b", text: "Sun, Mercury, and Venus", correct: false, explanation: "Those are personal planets but not 'the Big Three.'" },
              { id: "c", text: "Mars, Jupiter, and Saturn", correct: false, explanation: "Those aren't the Big Three." },
            ] },
            { id: "q2", type: "mcq", prompt: "The Rising sign represents…", options: [
              { id: "a", text: "Your first impression and approach to life", correct: true, explanation: "Yes — the 'mask' and lens through which you meet the world." },
              { id: "b", text: "Your hidden emotional needs", correct: false, explanation: "That's the Moon." },
              { id: "c", text: "Your career path", correct: false, explanation: "That's more the Midheaven." },
            ] },
            { id: "q3", type: "true-false", prompt: "Two people with the same Sun sign always have the same Rising sign.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — the Rising depends on exact time and place, so it varies widely." },
              { id: "f", text: "False", correct: true, explanation: "Correct — same Sun sign people often have very different Risings." },
            ] },
            { id: "q4", type: "mcq", prompt: "Which of the Big Three requires an accurate birth time to determine?", options: [
              { id: "a", text: "The Rising sign", correct: true, explanation: "The Rising depends on the exact moment of birth." },
              { id: "b", text: "The Sun sign", correct: false, explanation: "The Sun sign needs only the date." },
              { id: "c", text: "The Moon sign", correct: false, explanation: "The Moon usually needs only the date (it shifts signs every ~2.5 days)." },
            ] },
            { id: "q5", type: "recall", prompt: "Which of the Big Three describes your inner emotional world and needs?", options: [], answer: "Moon", accept: ["the moon", "moon sign"], explanation: "The Moon — your private, instinctive, emotional self." },
          ],
        },
        {
          id: "l8-the-houses",
          title: "The twelve houses",
          objective: "Describe what the houses add to a chart and recall a few key house meanings.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Signs are the 'how' and planets are the 'what' — the twelve houses are the 'where.' Each house is an area of life. A planet's house tells you which part of your life it most shows up in." },
            { kind: "table", headers: ["House", "Life area"], rows: [
              ["1st", "Self, identity, appearance"],
              ["2nd", "Money, values, self-worth"],
              ["3rd", "Communication, siblings, local life"],
              ["4th", "Home, family, roots"],
              ["5th", "Creativity, romance, play"],
              ["6th", "Work, health, daily routine"],
              ["7th", "Partnership, close relationships"],
              ["8th", "Intimacy, shared resources, transformation"],
              ["9th", "Travel, beliefs, higher learning"],
              ["10th", "Career, reputation, public role"],
              ["11th", "Friends, community, hopes"],
              ["12th", "The unconscious, solitude, endings"],
            ] },
            { kind: "callout", tone: "tradition", title: "Angular, succedent, cadent", text: "The houses come in three groups of four. Angular houses (1, 4, 7, 10) sit on the chart's angles and are the most prominent and action-oriented. Succedent houses (2, 5, 8, 11) consolidate and hold resources. Cadent houses (3, 6, 9, 12) are about learning, adapting, and reflection. A planet in an angular house tends to 'speak louder.'" },
            { kind: "callout", tone: "history", title: "Many house systems", text: "Houses can be carved up in different ways — Placidus (the most common today), Whole Sign (the oldest, where each sign = one house), Equal, Koch, and more. They mostly agree on the planets' houses but can disagree near house edges (cusps). Beginners do fine with whichever their app defaults to." },
            { kind: "callout", tone: "tip", title: "Reading a placement", text: "Combine all three: a planet's sign (how), the planet (what), and its house (where). E.g., 'Mars in Gemini in the 10th' = drive (Mars), expressed in a quick, verbal way (Gemini), focused on career (10th)." },
            { kind: "keyfacts", items: [
              "Houses = the 'where' — the life area a planet plays out in.",
              "Angular houses (1, 4, 7, 10) are the most prominent.",
              "The 1st, 7th, 10th, and 4th houses begin at the four angles.",
              "House systems (Placidus, Whole Sign, etc.) divide the wheel differently.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In a chart, the houses primarily describe…", options: [
              { id: "a", text: "Areas of life where energies play out", correct: true, explanation: "Yes — the houses are the 'where' of the chart." },
              { id: "b", text: "The emotional tone of a planet", correct: false, explanation: "That's more the sign and the planet itself." },
              { id: "c", text: "How fast a planet moves", correct: false, explanation: "Houses aren't about planetary speed." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which house is associated with career and public reputation?", options: [
              { id: "a", text: "The 10th house", correct: true, explanation: "Correct — the 10th is career and public role." },
              { id: "b", text: "The 4th house", correct: false, explanation: "The 4th is home and family." },
              { id: "c", text: "The 7th house", correct: false, explanation: "The 7th is partnership." },
            ] },
            { id: "q3", type: "mcq", prompt: "To read a single placement fully, you combine…", options: [
              { id: "a", text: "The planet (what), its sign (how), and its house (where)", correct: true, explanation: "Exactly — that three-part combination is the core skill." },
              { id: "b", text: "Only the sign", correct: false, explanation: "The sign alone misses the planet and house." },
              { id: "c", text: "Only the house", correct: false, explanation: "The house alone misses the planet and sign." },
            ] },
            { id: "q4", type: "mcq", prompt: "Which houses are the 'angular' houses?", options: [
              { id: "a", text: "1, 4, 7, and 10", correct: true, explanation: "The angular houses sit on the four angles and are the most prominent." },
              { id: "b", text: "2, 5, 8, and 11", correct: false, explanation: "Those are the succedent houses." },
              { id: "c", text: "3, 6, 9, and 12", correct: false, explanation: "Those are the cadent houses." },
            ] },
            { id: "q5", type: "true-false", prompt: "The 7th house governs partnership and close one-to-one relationships.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the 7th house is the house of partnership." },
              { id: "f", text: "False", correct: false, explanation: "It's true — the 7th is the relationship house, opposite the 1st." },
            ] },
          ],
        },
        {
          id: "l11-essential-dignities",
          title: "Essential dignities: a preview",
          objective: "Recognize the idea of essential dignity and identify a planet's domicile, detriment, exaltation, and fall.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Not every placement is equally comfortable. Traditional astrology asks how 'at home' a planet is in the sign it occupies — its essential dignity. The same planet can act with ease in one sign and strain in another, the way a person works differently in their own kitchen versus a stranger's." },
            { kind: "text", text: "There are four headline conditions. Two are about home turf — domicile and detriment — and two are about reputation — exaltation and fall. They sit in pairs of opposites, so learning one half teaches you the other." },
            { kind: "table", headers: ["Dignity", "Meaning", "Quick read"], rows: [
              ["Domicile (rulership)", "Planet is in the sign it rules", "Strong, at ease, expresses freely"],
              ["Detriment", "Planet is in the sign opposite its rulership", "Out of place, has to work harder"],
              ["Exaltation", "Planet is an 'honored guest' in a sign", "Elevated, well-regarded, idealized"],
              ["Fall", "Planet is in the sign opposite its exaltation", "Undervalued, awkward, deflated"],
            ] },
            { kind: "callout", tone: "history", title: "A medieval scoring system", text: "Traditional astrologers from the Hellenistic and medieval eras used dignities to weigh which planet 'wins' a chart. Beyond the four headline conditions, they added minor dignities (triplicity, term, and face) and built point tables to rank a planet's overall strength. Modern psychological astrology often softens or skips this layer." },
            { kind: "table", headers: ["Planet", "Domicile (rules)", "Exaltation"], rows: [
              ["Sun", "Leo", "Aries"],
              ["Moon", "Cancer", "Taurus"],
              ["Mercury", "Gemini, Virgo", "Virgo"],
              ["Venus", "Taurus, Libra", "Pisces"],
              ["Mars", "Aries, Scorpio", "Capricorn"],
              ["Jupiter", "Sagittarius, Pisces", "Cancer"],
              ["Saturn", "Capricorn, Aquarius", "Libra"],
            ] },
            { kind: "callout", tone: "evidence", title: "Use it as nuance, not a verdict", text: "Dignity is a lens, not a grade. A planet 'in fall' isn't broken and a planet 'in domicile' isn't a free pass — these are old metaphors for ease and strain, best held as shading on a reading rather than a score that decides your worth. Take what's useful." },
            { kind: "keyfacts", items: [
              "Domicile = a planet in the sign it rules (strong, at ease).",
              "Detriment = opposite a planet's domicile (working harder).",
              "Exaltation = an honored, elevated placement; Fall is its opposite.",
              "The Sun rules Leo and is exalted in Aries; the Moon rules Cancer, exalted in Taurus.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A planet in 'domicile' is…", options: [
              { id: "a", text: "In the sign it rules, where it's strong and at ease", correct: true, explanation: "Domicile = a planet at home in the sign it rules." },
              { id: "b", text: "In the sign opposite the one it rules", correct: false, explanation: "That's detriment, not domicile." },
              { id: "c", text: "In a randomly assigned sign", correct: false, explanation: "Dignities follow fixed rulership rules, not chance." },
            ] },
            { id: "q2", type: "mcq", prompt: "'Detriment' describes a planet that is…", options: [
              { id: "a", text: "In the sign opposite the one it rules", correct: true, explanation: "Detriment is opposite a planet's domicile — it has to work harder." },
              { id: "b", text: "At its strongest and most honored", correct: false, explanation: "That's closer to exaltation." },
              { id: "c", text: "Moving backward through the zodiac", correct: false, explanation: "That's retrograde, a different concept." },
            ] },
            { id: "q3", type: "true-false", prompt: "The Sun is exalted in Aries.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the Sun rules Leo and is exalted in Aries." },
              { id: "f", text: "False", correct: false, explanation: "It's true — the Sun's exaltation is Aries." },
            ] },
            { id: "q4", type: "mcq", prompt: "The pair opposite to 'exaltation' (an honored placement) is called…", options: [
              { id: "a", text: "Fall", correct: true, explanation: "Fall sits opposite exaltation — the planet feels undervalued there." },
              { id: "b", text: "Domicile", correct: false, explanation: "Domicile pairs with detriment, not exaltation." },
              { id: "c", text: "Retrograde", correct: false, explanation: "Retrograde is apparent backward motion, not a dignity." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the term for a planet placed in the sign it rules (its 'home' sign).", options: [], answer: "domicile", accept: ["rulership", "in domicile", "ruler"], explanation: "Domicile (rulership) — the planet is at home and expresses freely." },
            { id: "q6", type: "mcq", prompt: "Which sign does the Moon rule (its domicile)?", options: [
              { id: "a", text: "Cancer", correct: true, explanation: "The Moon rules Cancer and is exalted in Taurus." },
              { id: "b", text: "Leo", correct: false, explanation: "Leo is ruled by the Sun." },
              { id: "c", text: "Capricorn", correct: false, explanation: "Capricorn is ruled by Saturn." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Putting It Together",
      lessons: [
        {
          id: "l9-the-aspects",
          title: "The major aspects",
          objective: "Name the five major aspects and whether each is harmonious or tense.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Aspects are the angles planets make to each other — they describe how the parts of you talk to one another. There are five 'major' aspects, defined by the degrees between two planets (within a margin called the 'orb')." },
            { kind: "table", headers: ["Aspect", "Angle", "Nature"], rows: [
              ["Conjunction", "0°", "Blended/intensified (depends on the planets)"],
              ["Sextile", "60°", "Harmonious — opportunity"],
              ["Square", "90°", "Tense — friction, growth"],
              ["Trine", "120°", "Harmonious — natural flow"],
              ["Opposition", "180°", "Tense — polarity, balance"],
            ] },
            { kind: "callout", tone: "tip", title: "What an 'orb' is", text: "Aspects rarely land on the exact degree, so astrologers allow a margin called the orb — usually a few degrees, wider for the Sun and Moon. A square that's 2° off the exact 90° still counts; one that's 12° off generally doesn't. The tighter the orb, the louder the aspect." },
            { kind: "callout", tone: "history", title: "Soft, hard, and the major/minor split", text: "The five majors come from Ptolemy, who tied them to simple divisions of the circle. Astrologers group them as 'soft' (sextile, trine — flowing) and 'hard' (square, opposition — challenging), with the conjunction neutral. Later astrologers added 'minor' aspects like the quincunx (150°) and semisextile (30°), used more sparingly." },
            { kind: "callout", tone: "tradition", title: "Tension isn't bad", text: "Squares and oppositions get a bad reputation, but they're where growth happens — they create the friction that pushes you to develop. Trines and sextiles flow easily but can be taken for granted, sometimes becoming talents you never bother to use." },
            { kind: "keyfacts", items: [
              "Five majors: conjunction (0°), sextile (60°), square (90°), trine (120°), opposition (180°).",
              "Soft/harmonious: sextile and trine. Hard/tense: square and opposition.",
              "The conjunction is neutral — its tone depends on the planets involved.",
              "An 'orb' is the allowed margin around the exact angle.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A square aspect is formed at what angle, and what's its nature?", options: [
              { id: "a", text: "90° — tense/growth-oriented", correct: true, explanation: "Correct — squares are 90° and create productive friction." },
              { id: "b", text: "120° — harmonious", correct: false, explanation: "That describes a trine." },
              { id: "c", text: "180° — opposition", correct: false, explanation: "180° is an opposition, not a square." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which aspect is at 120° and considered harmonious?", options: [
              { id: "a", text: "Trine", correct: true, explanation: "Yes — trines (120°) flow easily." },
              { id: "b", text: "Square", correct: false, explanation: "Squares are 90° and tense." },
              { id: "c", text: "Conjunction", correct: false, explanation: "A conjunction is 0°." },
            ] },
            { id: "q3", type: "true-false", prompt: "Squares and oppositions are 'bad' aspects that should be avoided.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they create the friction that drives growth." },
              { id: "f", text: "False", correct: true, explanation: "Correct — tense aspects are where development happens." },
            ] },
            { id: "q4", type: "mcq", prompt: "A sextile is formed at what angle?", options: [
              { id: "a", text: "60° — harmonious, an opportunity", correct: true, explanation: "The sextile is 60° and offers easy potential you can choose to develop." },
              { id: "b", text: "90° — tense", correct: false, explanation: "90° is the square." },
              { id: "c", text: "0° — blended", correct: false, explanation: "0° is the conjunction." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the term for the allowed margin (a few degrees) around an aspect's exact angle.", options: [], answer: "orb", accept: ["the orb", "aspect orb"], explanation: "The orb — the tolerance around the exact angle; tighter orbs are stronger." },
            { id: "q6", type: "mcq", prompt: "The conjunction (0°) is best described as…", options: [
              { id: "a", text: "Neutral — its tone depends on the two planets joined", correct: true, explanation: "A conjunction blends and intensifies; whether that's easy or hard depends on the planets." },
              { id: "b", text: "Always harmonious", correct: false, explanation: "Not necessarily — a Saturn–Mars conjunction can be quite tense." },
              { id: "c", text: "Always tense", correct: false, explanation: "Not necessarily — a Venus–Jupiter conjunction is generally pleasant." },
            ] },
          ],
        },
        {
          id: "l12-retrogrades",
          title: "Retrogrades, demystified",
          objective: "Explain what a retrograde actually is astronomically and how astrologers interpret it.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Few astrology words cause more dread than 'retrograde.' But the phenomenon itself is an optical illusion, and the interpretation is gentler than its reputation. Let's separate the astronomy from the symbolism." },
            { kind: "text", text: "A retrograde happens when a planet appears to move backward through the zodiac from Earth's point of view. Nothing actually reverses. As faster and slower planets pass each other on their orbits, the closer one seems to slip backward — the same way a car you overtake on the highway looks like it's drifting behind you. It's apparent, not real, motion." },
            { kind: "callout", tone: "history", title: "An old puzzle, finally solved", text: "Explaining retrograde 'loops' was one of astronomy's great early challenges. Ptolemy's Earth-centered model used epicycles — circles upon circles — to reproduce them. Copernicus's Sun-centered model (1543) explained the loops naturally as a trick of perspective between orbiting planets. The illusion is real; the backward motion is not." },
            { kind: "table", headers: ["Planet", "Retrograde frequency", "Roughly how long"], rows: [
              ["Mercury", "3–4 times a year", "About 3 weeks each"],
              ["Venus", "About every 18 months", "About 6 weeks"],
              ["Mars", "About every 2 years", "About 2–2.5 months"],
              ["Jupiter–Pluto", "Once a year", "Months at a time"],
            ] },
            { kind: "callout", tone: "tradition", title: "How astrologers read it", text: "Symbolically, a retrograde planet's themes are said to turn inward — to be reviewed, revised, and revisited (many 're-' words). Mercury retrograde, the famous one, is read as a time for double-checking communication, contracts, and travel rather than a cosmic curse. The invitation is reflection, not disaster." },
            { kind: "callout", tone: "evidence", title: "Keep perspective", text: "There's no evidence that Mercury retrograde causes technology to fail or plans to collapse — confirmation bias does the rest, since we notice mishaps more when we're told to expect them. Outer planets are retrograde roughly 40% of the time, so 'retrograde' is ordinary, not ominous. Use it as a nudge to slow down, not a reason to cancel your life." },
            { kind: "keyfacts", items: [
              "Retrograde = apparent backward motion, an illusion of perspective.",
              "No planet actually reverses direction.",
              "Mercury retrogrades 3–4 times a year for about 3 weeks.",
              "Astrologers read retrogrades as a time to review and revise (inward focus).",
              "Outer planets are retrograde a large fraction of every year — it's normal.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Astronomically, a planetary retrograde is…", options: [
              { id: "a", text: "An apparent backward motion caused by Earth's changing viewpoint", correct: true, explanation: "Right — it's an optical illusion of perspective, not real reversal." },
              { id: "b", text: "A planet physically reversing its orbit", correct: false, explanation: "No planet actually moves backward; the motion is apparent." },
              { id: "c", text: "A planet falling out of the solar system", correct: false, explanation: "Nothing leaves orbit; the planet simply appears to slip backward." },
            ] },
            { id: "q2", type: "true-false", prompt: "During a retrograde, the planet genuinely reverses direction in its orbit.", options: [
              { id: "t", text: "True", correct: false, explanation: "It only appears to — the reversal is an illusion of perspective." },
              { id: "f", text: "False", correct: true, explanation: "Correct — retrograde motion is apparent, not actual." },
            ] },
            { id: "q3", type: "mcq", prompt: "How do astrologers typically interpret a retrograde planet?", options: [
              { id: "a", text: "As a time to review, revise, and turn the planet's themes inward", correct: true, explanation: "Yes — the 're-' theme: reflect, revisit, double-check." },
              { id: "b", text: "As a guaranteed period of disaster", correct: false, explanation: "That's the myth; the symbolism is about review, not catastrophe." },
              { id: "c", text: "As proof a chart is invalid", correct: false, explanation: "Retrogrades are normal and don't invalidate anything." },
            ] },
            { id: "q4", type: "mcq", prompt: "Which planet's retrograde is the most famous and happens 3–4 times a year?", options: [
              { id: "a", text: "Mercury", correct: true, explanation: "Mercury retrograde is the well-known one, lasting about three weeks each time." },
              { id: "b", text: "Saturn", correct: false, explanation: "Saturn retrogrades once a year, but it isn't the famous 'Mercury retrograde.'" },
              { id: "c", text: "The Sun", correct: false, explanation: "The Sun and Moon never appear retrograde from Earth." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the astronomer whose Sun-centered model (1543) explained retrograde loops as a trick of perspective.", options: [], answer: "Copernicus", accept: ["nicolaus copernicus", "copernicas"], explanation: "Copernicus — his heliocentric model accounted for retrograde motion naturally." },
          ],
        },
        {
          id: "l13-lunar-nodes",
          title: "The lunar nodes",
          objective: "Describe what the North and South Nodes are and the growth narrative astrologers attach to them.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The lunar nodes aren't planets or even visible objects — they're two mathematical points, yet many astrologers treat them as the most meaningful pair in a chart. They mark where the Moon's path crosses the Sun's path (the ecliptic), the very spots where eclipses can occur." },
            { kind: "text", text: "Because they're points rather than bodies, the nodes always sit exactly opposite each other: the North Node in one sign, the South Node in the sign across the wheel. Together they form an axis, not two separate placements." },
            { kind: "table", headers: ["Node", "Glyph", "Astrological meaning"], rows: [
              ["North Node ☊", "Rising node", "Growth edge — qualities to develop, the unfamiliar direction"],
              ["South Node ☋", "Falling node", "Comfort zone — familiar gifts and habits to release or rely on less"],
            ] },
            { kind: "callout", tone: "history", title: "Dragon's head and tail", text: "Old traditions pictured the nodes as a celestial dragon: Caput Draconis (the dragon's head, North Node) and Cauda Draconis (the dragon's tail, South Node). The image came from the way eclipses 'devoured' the Sun or Moon at these crossing points. Vedic astrology personifies them as Rahu and Ketu." },
            { kind: "callout", tone: "tradition", title: "The growth-axis reading", text: "Many modern astrologers read the South Node as where you're already fluent — even over-reliant — and the North Node as the unfamiliar territory your growth pulls toward. The narrative isn't 'good vs. bad'; it's 'comfortable vs. stretching.' The nodes move slowly backward through the zodiac, taking about 18.6 years to circle the chart." },
            { kind: "callout", tone: "evidence", title: "A symbolic compass, not a fate map", text: "Some astrologers tie the nodes to past lives; whether or not that resonates for you, you don't have to. The nodes work just as well as a plain metaphor: what comes easily, and what's worth leaning into. As always, take the framing that helps you reflect and leave the rest." },
            { kind: "keyfacts", items: [
              "The nodes are points where the Moon's path crosses the Sun's path.",
              "North Node = growth direction; South Node = familiar comfort zone.",
              "They always sit exactly opposite each other, forming one axis.",
              "Eclipses happen near the nodes; old lore called them the dragon's head and tail.",
              "The nodal axis takes about 18.6 years to travel the whole zodiac.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The lunar nodes are…", options: [
              { id: "a", text: "The two points where the Moon's path crosses the Sun's path", correct: true, explanation: "Right — they're calculated points, and eclipses occur near them." },
              { id: "b", text: "Two newly discovered moons of Earth", correct: false, explanation: "They're mathematical points, not physical bodies." },
              { id: "c", text: "Another name for the Ascendant and Descendant", correct: false, explanation: "Those are the horizon angles, not the lunar nodes." },
            ] },
            { id: "q2", type: "mcq", prompt: "The North Node is most often read as…", options: [
              { id: "a", text: "Your growth edge — the unfamiliar direction to develop toward", correct: true, explanation: "Yes — the North Node points to stretching, growth-oriented territory." },
              { id: "b", text: "Your most comfortable, well-worn habits", correct: false, explanation: "That's the South Node." },
              { id: "c", text: "Your career and reputation", correct: false, explanation: "That's the Midheaven, not the North Node." },
            ] },
            { id: "q3", type: "true-false", prompt: "The North and South Nodes always sit exactly opposite each other in the chart.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they form a single axis across the wheel." },
              { id: "f", text: "False", correct: false, explanation: "It's true — the nodes are always 180° apart." },
            ] },
            { id: "q4", type: "mcq", prompt: "Near the lunar nodes, what astronomical event can occur?", options: [
              { id: "a", text: "Eclipses", correct: true, explanation: "Eclipses happen when a new or full Moon falls near a node." },
              { id: "b", text: "Meteor showers", correct: false, explanation: "Meteor showers aren't tied to the lunar nodes." },
              { id: "c", text: "Planetary retrogrades", correct: false, explanation: "Retrogrades are unrelated to the nodes." },
            ] },
            { id: "q5", type: "true-false", prompt: "The South Node represents familiar gifts and comfort-zone habits.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the South Node is where you're already fluent, even over-reliant." },
              { id: "f", text: "False", correct: false, explanation: "It's true — the South Node is the comfort zone; the North Node is the growth edge." },
            ] },
          ],
        },
        {
          id: "l14-chart-shapes",
          title: "Chart shapes & patterns",
          objective: "Recognize that the overall distribution of planets forms shapes, and identify a few common aspect patterns.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Before reading any single placement, you can learn something from the chart's overall picture — how the planets are spread around the wheel. The astrologer Marc Edmund Jones popularized seven planetary 'shapes' in the 20th century; you don't need all seven, just the idea that distribution carries meaning." },
            { kind: "table", headers: ["Shape", "Distribution", "Flavor"], rows: [
              ["Bundle", "All planets within about a third of the wheel", "Focused, specialized, self-contained"],
              ["Bowl", "Planets fill one half of the wheel", "Self-contained but reaching across the empty half"],
              ["Bucket", "A bowl plus one planet (the 'handle') opposite", "The handle becomes a funnel for the chart's energy"],
              ["Splash", "Planets scattered all around the wheel", "Versatile, many interests, can lack focus"],
              ["Locomotive", "Planets fill two-thirds, leaving a gap", "Driven, with momentum toward the empty third"],
            ] },
            { kind: "callout", tone: "tip", title: "Where the gaps are talks too", text: "An empty stretch of the wheel isn't a flaw — it often points to where a person reaches or compensates. In a Bowl chart, the empty half can describe what the person is unconsciously seeking; in a Bucket, the lone 'handle' planet frequently becomes a life focus the whole chart funnels through." },
            { kind: "text", text: "Beyond the whole-chart shape, smaller aspect patterns link three or more planets into a recognizable figure. These are where individual aspects combine into a story." },
            { kind: "table", headers: ["Pattern", "Built from", "Theme"], rows: [
              ["Grand Trine", "Three planets in trine (a triangle)", "Easy, flowing talent — sometimes too easy"],
              ["T-Square", "Two planets opposed, both square a third", "Dynamic tension driving toward the empty point"],
              ["Grand Cross", "Four planets in two oppositions, all square", "High tension, hard-won balance"],
              ["Stellium", "Three or more planets clustered in one sign or house", "Intense concentration of energy in one area"],
            ] },
            { kind: "callout", tone: "evidence", title: "Patterns are emphasis, not verdicts", text: "A Grand Trine isn't 'good luck' and a Grand Cross isn't a 'curse' — they're just where a chart concentrates ease or tension. Spotting a pattern tells you where to look first and what themes repeat; it doesn't decide outcomes. Read it as emphasis, then move on to the details." },
            { kind: "keyfacts", items: [
              "Chart 'shapes' (Bundle, Bowl, Bucket, Splash, Locomotive…) read the whole spread of planets.",
              "Empty zones of the wheel often show where a person reaches or compensates.",
              "A stellium is three or more planets clustered together — a concentrated focus.",
              "A T-square is two planets in opposition, both squaring a third.",
              "Patterns mark emphasis, not fixed outcomes.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A 'stellium' is…", options: [
              { id: "a", text: "Three or more planets clustered in one sign or house", correct: true, explanation: "Right — a stellium concentrates energy in a single area of the chart." },
              { id: "b", text: "Two planets exactly opposite each other", correct: false, explanation: "That's an opposition, not a stellium." },
              { id: "c", text: "A planet with no aspects", correct: false, explanation: "An unaspected planet is the opposite idea — not a cluster." },
            ] },
            { id: "q2", type: "mcq", prompt: "In a 'Bucket' chart shape, the lone 'handle' planet…", options: [
              { id: "a", text: "Often becomes a focal funnel for the chart's energy", correct: true, explanation: "Yes — the handle channels the rest of the chart through it." },
              { id: "b", text: "Is ignored as unimportant", correct: false, explanation: "It's typically the most emphasized point, not ignored." },
              { id: "c", text: "Cancels out the other planets", correct: false, explanation: "It focuses, rather than cancels, the chart's energy." },
            ] },
            { id: "q3", type: "mcq", prompt: "A T-square is built from…", options: [
              { id: "a", text: "Two planets in opposition, both square a third", correct: true, explanation: "Correct — it forms a tension pattern aimed at the empty fourth point." },
              { id: "b", text: "Three planets in an easy trine", correct: false, explanation: "That's a Grand Trine, a flowing pattern." },
              { id: "c", text: "Four planets all conjunct", correct: false, explanation: "That would be a stellium, not a T-square." },
            ] },
            { id: "q4", type: "true-false", prompt: "An empty area of the chart wheel often shows where a person reaches or compensates.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — gaps are meaningful, especially in Bowl and Bucket shapes." },
              { id: "f", text: "False", correct: false, explanation: "It's true — empty zones frequently point to what someone seeks." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the term for three or more planets clustered together in one sign or house.", options: [], answer: "stellium", accept: ["a stellium"], explanation: "A stellium — a concentrated cluster that emphasizes one area of life." },
            { id: "q6", type: "mcq", prompt: "A Grand Trine is best understood as…", options: [
              { id: "a", text: "Easy, flowing talent that can sometimes be taken for granted", correct: true, explanation: "Three planets in trine flow easily — gift and complacency both possible." },
              { id: "b", text: "A guaranteed sign of bad luck", correct: false, explanation: "It's a harmonious pattern, not a misfortune." },
              { id: "c", text: "Two planets at 90°", correct: false, explanation: "That's a single square, not a Grand Trine." },
            ] },
          ],
        },
        {
          id: "l10-reading-holistically",
          title: "Reading a chart holistically",
          objective: "Combine signs, planets, houses, and aspects into a single balanced reading.",
          estMinutes: 7,
          blocks: [
            { kind: "text", text: "A chart is more than a list of placements. Reading well means stepping back and weighing the whole: which elements dominate, where the Big Three point, which planets are emphasized, and how the aspects tie it together. Beginners list facts; readers find themes." },
            { kind: "list", ordered: true, items: [
              "Start with the Big Three (Sun, Moon, Rising) for the overall portrait.",
              "Scan the chart's shape and any stelliums — where is the energy concentrated?",
              "Notice the elemental and modal balance — lots of fire? little water? mostly fixed?",
              "Read each planet as planet + sign + house.",
              "Layer in the aspects to see how the parts interact, weighting tight orbs most.",
              "Hold it all loosely — look for themes that repeat, not contradictions to 'solve.'",
            ] },
            { kind: "callout", tone: "tip", title: "Look for repetition", text: "The strongest signal in a chart is repetition. If you keep meeting the same theme — say, lots of Scorpio plus an 8th-house emphasis plus a Pluto aspect to the Sun — that recurrence matters more than any single placement. When the chart 'says something three times,' trust it; when one factor contradicts a clear theme, treat it as nuance, not a veto." },
            { kind: "callout", tone: "tradition", title: "Synthesis over inventory", text: "The classical skill astrologers prized was synthesis — weaving placements into a coherent portrait rather than reciting them. A planet that rules an angle, sits in a prominent house, and makes tight aspects deserves more airtime than a quiet, unaspected one. Weighting is the art." },
            { kind: "callout", tone: "evidence", title: "Keep it honest", text: "A chart describes patterns and possibilities, not fixed destiny — you always have agency. Astrology is most valuable as a mirror for self-reflection. It is not a substitute for medical, legal, financial, or mental-health advice." },
            { kind: "keyfacts", items: [
              "Lead with the Big Three, then chart shape, then balances, then placements, then aspects.",
              "Repetition is the strongest signal — themes that recur matter most.",
              "Synthesis (weaving a portrait) beats inventory (listing facts).",
              "A chart shows possibilities, not fixed fate — you keep your agency.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A good first step when reading a whole chart is to…", options: [
              { id: "a", text: "Start with the Big Three for the overall portrait", correct: true, explanation: "Yes — the Big Three orient the whole reading." },
              { id: "b", text: "Memorize every degree", correct: false, explanation: "Synthesis matters more than exhaustive detail." },
              { id: "c", text: "Ignore the aspects", correct: false, explanation: "Aspects show how the parts interact — they're essential." },
            ] },
            { id: "q2", type: "true-false", prompt: "A birth chart fixes your destiny and removes your agency.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — a chart shows patterns and possibilities; you keep your agency." },
              { id: "f", text: "False", correct: true, explanation: "Correct — astrology is best used as a reflective mirror, not fate." },
            ] },
            { id: "q3", type: "mcq", prompt: "Reading a planet fully means combining…", options: [
              { id: "a", text: "The planet, its sign, and its house", correct: true, explanation: "Right — what, how, and where." },
              { id: "b", text: "Only its element", correct: false, explanation: "Element alone is far too coarse." },
              { id: "c", text: "Only the aspect", correct: false, explanation: "Aspects matter but can't be read in isolation." },
            ] },
            { id: "q4", type: "mcq", prompt: "What is the strongest signal to trust when interpreting a whole chart?", options: [
              { id: "a", text: "A theme that repeats across several placements", correct: true, explanation: "Repetition is the surest signal — when the chart says it three times, trust it." },
              { id: "b", text: "A single isolated placement", correct: false, explanation: "One factor is weak evidence on its own." },
              { id: "c", text: "The planet with the longest name", correct: false, explanation: "That's not a meaningful criterion." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the one-word skill of weaving placements into one coherent portrait (rather than just listing them).", options: [], answer: "synthesis", accept: ["chart synthesis", "synthesize"], explanation: "Synthesis — the heart of skilled chart reading." },
          ],
        },
      ],
    },
  ],

  // Final-test bank — engine samples `finalTestSize` (10) at random per attempt.
  // ONLY mcq / true-false here (no recall in the final test).
  finalTest: [
    { id: "f1", type: "mcq", prompt: "A natal chart represents…", options: [
      { id: "a", text: "The sky at your exact birth time and place", correct: true },
      { id: "b", text: "A force controlling your fate", correct: false },
      { id: "c", text: "A random personality generator", correct: false },
      { id: "d", text: "A medical assessment", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "Which is MOST affected by an inaccurate birth time?", options: [
      { id: "a", text: "The Rising sign and houses", correct: true },
      { id: "b", text: "The Sun sign", correct: false },
      { id: "c", text: "The element of a sign", correct: false },
      { id: "d", text: "The number of planets", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "The Fire signs are:", options: [
      { id: "a", text: "Aries, Leo, Sagittarius", correct: true },
      { id: "b", text: "Taurus, Virgo, Capricorn", correct: false },
      { id: "c", text: "Cancer, Scorpio, Pisces", correct: false },
      { id: "d", text: "Gemini, Libra, Aquarius", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "Cardinal signs are best described as…", options: [
      { id: "a", text: "Initiating — they start things", correct: true },
      { id: "b", text: "Stabilizing — they sustain things", correct: false },
      { id: "c", text: "Adapting — they change things", correct: false },
      { id: "d", text: "Emotional — they feel things", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "The Moon governs…", options: [
      { id: "a", text: "Emotions, instincts, and safety", correct: true },
      { id: "b", text: "Career and reputation", correct: false },
      { id: "c", text: "Discipline and limits", correct: false },
      { id: "d", text: "Communication", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Saturn is the planet of…", options: [
      { id: "a", text: "Discipline, limits, and responsibility", correct: true },
      { id: "b", text: "Luck and expansion", correct: false },
      { id: "c", text: "Love and beauty", correct: false },
      { id: "d", text: "Sudden change", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "The 'Big Three' are…", options: [
      { id: "a", text: "Sun, Moon, and Rising", correct: true },
      { id: "b", text: "Sun, Mercury, Venus", correct: false },
      { id: "c", text: "Mars, Jupiter, Saturn", correct: false },
      { id: "d", text: "Moon, Venus, Pluto", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "The houses in a chart describe…", options: [
      { id: "a", text: "Areas of life where energies play out", correct: true },
      { id: "b", text: "How fast planets move", correct: false },
      { id: "c", text: "The colors of the signs", correct: false },
      { id: "d", text: "The phase of the Moon", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "The 10th house is associated with…", options: [
      { id: "a", text: "Career and public reputation", correct: true },
      { id: "b", text: "Home and family", correct: false },
      { id: "c", text: "Partnership", correct: false },
      { id: "d", text: "Money", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "A trine is formed at…", options: [
      { id: "a", text: "120° and is harmonious", correct: true },
      { id: "b", text: "90° and is tense", correct: false },
      { id: "c", text: "180° and is an opposition", correct: false },
      { id: "d", text: "0° and is a conjunction", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "A square aspect…", options: [
      { id: "a", text: "Is 90° and creates growth-driving friction", correct: true },
      { id: "b", text: "Is always harmful and should be avoided", correct: false },
      { id: "c", text: "Is 60° and harmonious", correct: false },
      { id: "d", text: "Has no effect on a chart", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "To read a placement fully you combine…", options: [
      { id: "a", text: "Planet (what), sign (how), and house (where)", correct: true },
      { id: "b", text: "Only the sign", correct: false },
      { id: "c", text: "Only the house", correct: false },
      { id: "d", text: "Only the Moon phase", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "Mercury rules which two signs?", options: [
      { id: "a", text: "Gemini and Virgo", correct: true },
      { id: "b", text: "Taurus and Libra", correct: false },
      { id: "c", text: "Aries and Scorpio", correct: false },
      { id: "d", text: "Cancer and Leo", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "Which best describes how to approach astrology?", options: [
      { id: "a", text: "As a symbolic language and mirror for self-reflection", correct: true },
      { id: "b", text: "As a force that physically controls your future", correct: false },
      { id: "c", text: "As a modern branch of astronomy", correct: false },
      { id: "d", text: "As a tool that diagnoses health conditions", correct: false },
    ] },
    { id: "f15", type: "true-false", prompt: "Outer planets describe generational themes by sign because they move slowly.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f16", type: "true-false", prompt: "A birth chart fixes your destiny and removes your agency.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f17", type: "mcq", prompt: "A planetary retrograde is…", options: [
      { id: "a", text: "An apparent backward motion caused by Earth's viewpoint", correct: true },
      { id: "b", text: "A planet physically reversing its orbit", correct: false },
      { id: "c", text: "A planet leaving the solar system", correct: false },
      { id: "d", text: "A type of eclipse", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "The North Node is usually read as…", options: [
      { id: "a", text: "A growth edge — the unfamiliar direction to develop", correct: true },
      { id: "b", text: "A comfortable, well-worn habit", correct: false },
      { id: "c", text: "Your career and reputation", correct: false },
      { id: "d", text: "The fastest-moving point in the chart", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "A 'stellium' is…", options: [
      { id: "a", text: "Three or more planets clustered in one sign or house", correct: true },
      { id: "b", text: "Two planets exactly opposite each other", correct: false },
      { id: "c", text: "A planet with no aspects", correct: false },
      { id: "d", text: "Another name for the Ascendant", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "A planet in 'domicile' is…", options: [
      { id: "a", text: "In the sign it rules, where it is strong and at ease", correct: true },
      { id: "b", text: "In the sign opposite the one it rules", correct: false },
      { id: "c", text: "Moving backward through the zodiac", correct: false },
      { id: "d", text: "Always invisible in the sky", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "Which houses are the 'angular' houses?", options: [
      { id: "a", text: "1, 4, 7, and 10", correct: true },
      { id: "b", text: "2, 5, 8, and 11", correct: false },
      { id: "c", text: "3, 6, 9, and 12", correct: false },
      { id: "d", text: "5, 6, 7, and 8", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "The Midheaven (MC) is associated with…", options: [
      { id: "a", text: "Career, reputation, and public role", correct: true },
      { id: "b", text: "Home and family roots", correct: false },
      { id: "c", text: "Hidden emotions", correct: false },
      { id: "d", text: "Daily health routines", correct: false },
    ] },
    { id: "f23", type: "mcq", prompt: "The four elements come from…", options: [
      { id: "a", text: "Ancient Greek natural philosophy (fire, earth, air, water)", correct: true },
      { id: "b", text: "Twentieth-century psychology", correct: false },
      { id: "c", text: "Modern astronomy", correct: false },
      { id: "d", text: "The discovery of the outer planets", correct: false },
    ] },
    { id: "f24", type: "mcq", prompt: "A sextile aspect is…", options: [
      { id: "a", text: "60° and harmonious — an opportunity", correct: true },
      { id: "b", text: "90° and tense", correct: false },
      { id: "c", text: "180° and an opposition", correct: false },
      { id: "d", text: "0° and a conjunction", correct: false },
    ] },
    { id: "f25", type: "true-false", prompt: "The North and South Nodes always sit exactly opposite each other.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f26", type: "true-false", prompt: "Squares and oppositions are 'bad' aspects best avoided entirely.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f27", type: "mcq", prompt: "Venus governs…", options: [
      { id: "a", text: "Love, beauty, and values", correct: true },
      { id: "b", text: "Drive and action", correct: false },
      { id: "c", text: "Discipline and time", correct: false },
      { id: "d", text: "Sudden insight", correct: false },
    ] },
    { id: "f28", type: "mcq", prompt: "Scorpio's element and modality are…", options: [
      { id: "a", text: "Fixed Water", correct: true },
      { id: "b", text: "Cardinal Water", correct: false },
      { id: "c", text: "Mutable Fire", correct: false },
      { id: "d", text: "Fixed Fire", correct: false },
    ] },
  ],
};
