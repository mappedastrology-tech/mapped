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
  estMinutes: 40,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "The Chart & Its Building Blocks", lessons: ["What astrology is (and isn't)", "The birth chart", "Elements & modalities", "The twelve signs"] },
    { module: "Planets, Points & Houses", lessons: ["The luminaries & personal planets", "The social & outer planets", "The Big Three", "The twelve houses"] },
    { module: "Putting It Together", lessons: ["The major aspects", "Reading a chart holistically"] },
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
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Astrology is a symbolic language. A natal (birth) chart is a map of the sky from one specific place and moment — your birth. Astrologers read the positions of the Sun, Moon, and planets in that map as a set of symbols for describing personality, timing, and meaning." },
            { kind: "text", text: "Crucially, the chart is not a force acting on you. Think of it less like a weather forecast and more like a mirror or a deck of prompts: a structured way to reflect on who you are and what you're navigating." },
            { kind: "callout", tone: "evidence", title: "A note on evidence", text: "Astrology isn't a science, and controlled studies haven't found that it predicts events or measures personality. But prediction isn't really what most people come to it for. Think of astrology as a language or a mirror — a rich symbolic framework for reflecting on yourself, your relationships, and your timing. Held that way, many people find it genuinely meaningful. Stay curious, take what resonates, and leave what doesn't." },
            { kind: "keyfacts", items: [
              "A natal chart = the sky at your exact birth time and place.",
              "Astrology is a symbolic/reflective language, not a physical force.",
              "Mainstream science does not consider astrology validated as predictive.",
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
            { id: "q3", type: "mcq", prompt: "The 'Forer effect' refers to…", options: [
              { id: "a", text: "The tendency for vague, flattering statements to feel personally accurate", correct: true, explanation: "Right — it explains much of astrology's felt accuracy." },
              { id: "b", text: "A method for calculating the Ascendant", correct: false, explanation: "That's unrelated to the Forer effect." },
              { id: "c", text: "The gravitational pull of the Moon", correct: false, explanation: "No — the Forer effect is a psychological phenomenon, not astronomical." },
            ] },
          ],
        },
        {
          id: "l2-the-birth-chart",
          title: "The birth chart",
          objective: "Identify the three pieces of information a chart needs and why birth time matters.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "To calculate a chart you need three things: the date, the exact time, and the place of birth. Date and place are usually easy. Birth time is the tricky one — and it matters more than people expect." },
            { kind: "annotated", prompt: "Anatomy of the chart wheel", instructions: "Tap each marker to learn the part", image: "/images/learn/chart-wheel-diagram.svg", pins: [
              { x: 50, y: 8, title: "The zodiac rim", body: "The twelve signs ring the outer wheel — the zodiac backdrop the Sun, Moon and planets move across." },
              { x: 77, y: 43, title: "The twelve houses", body: "Spokes divide the wheel into twelve houses, numbered from the 1st around to the 12th — each one a different area of life." },
              { x: 50, y: 50, title: "The center — you", body: "At the hub is your point of view: the chart is the whole sky captured from your exact time and place of birth." },
            ] },
            { kind: "text", text: "The fast-moving angles of the chart — the Ascendant (Rising sign) and the houses — shift roughly one degree every four minutes. Get the time wrong by an hour and your Rising sign and house placements can be completely different. The Sun, Moon, and planets by sign are far more forgiving." },
            { kind: "callout", tone: "tip", title: "No birth time?", text: "You can still learn a lot from a chart without a birth time — the Sun, Moon (usually), and planetary signs are reliable. But the Rising sign, houses, and angles can't be calculated accurately, so a good app will hide them rather than guess." },
            { kind: "keyfacts", items: [
              "A chart needs: date, exact time, and place of birth.",
              "Rising sign + houses depend on an accurate birth time.",
              "Planetary signs are far less sensitive to time errors.",
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
          ],
        },
        {
          id: "l3-elements-modalities",
          title: "Elements & modalities",
          objective: "Classify any sign by its element and modality.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The twelve signs are organized by two overlapping systems. The four elements describe a sign's basic temperament; the three modalities describe how it moves through the world." },
            { kind: "table", headers: ["Element", "Signs", "Temperament"], rows: [
              ["Fire", "Aries, Leo, Sagittarius", "Active, spirited, expressive"],
              ["Earth", "Taurus, Virgo, Capricorn", "Grounded, practical, steady"],
              ["Air", "Gemini, Libra, Aquarius", "Mental, social, communicative"],
              ["Water", "Cancer, Scorpio, Pisces", "Emotional, intuitive, receptive"],
            ] },
            { kind: "table", headers: ["Modality", "Signs", "Style"], rows: [
              ["Cardinal", "Aries, Cancer, Libra, Capricorn", "Initiating — starts things"],
              ["Fixed", "Taurus, Leo, Scorpio, Aquarius", "Stabilizing — sustains things"],
              ["Mutable", "Gemini, Virgo, Sagittarius, Pisces", "Adapting — changes things"],
            ] },
            { kind: "text", text: "Every sign is exactly one element and one modality, and each element/modality pairing is unique. For example, Aries is the only Cardinal Fire sign." },
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
          ],
        },
        {
          id: "l4-the-twelve-signs",
          title: "The twelve signs",
          objective: "Recall each sign's element, modality, and ruling planet.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Each sign blends an element and modality, and each has a traditional ruling planet — the planet most 'at home' in that sign. Don't memorize all of this at once; use the table as a reference you'll absorb over time." },
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
            { kind: "callout", tone: "history", title: "Old & new rulers", text: "Before the outer planets were discovered, each planet ruled two signs. Modern astrologers added Pluto (Scorpio), Uranus (Aquarius), and Neptune (Pisces) as 'co-rulers.' Both the traditional and modern rulers are still used." },
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
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "If signs are the 'how,' planets are the 'what.' The fastest-moving bodies — the two luminaries (Sun, Moon) and the personal planets (Mercury, Venus, Mars) — describe the most personal, day-to-day parts of you." },
            { kind: "table", headers: ["Body", "Governs"], rows: [
              ["Sun ☉", "Core identity, vitality, what you're growing toward"],
              ["Moon ☽", "Emotions, instincts, what makes you feel safe"],
              ["Mercury ☿", "Mind, communication, how you think and speak"],
              ["Venus ♀", "Love, beauty, values, what you're drawn to"],
              ["Mars ♂", "Drive, anger, desire, how you take action"],
            ] },
            { kind: "text", text: "A useful shorthand: the Sun is who you are, the Moon is how you feel, Mercury is how you think, Venus is how you love, and Mars is how you act." },
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
          ],
        },
        {
          id: "l6-outer-planets",
          title: "The social & outer planets",
          objective: "Distinguish the social planets (Jupiter, Saturn) from the outer planets (Uranus, Neptune, Pluto).",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Beyond Mars, the planets move slowly — so they describe broader, more generational themes rather than daily personality." },
            { kind: "table", headers: ["Body", "Governs"], rows: [
              ["Jupiter ♃", "Growth, luck, belief, expansion"],
              ["Saturn ♄", "Discipline, limits, responsibility, time"],
              ["Uranus ♅", "Change, rebellion, sudden insight"],
              ["Neptune ♆", "Dreams, spirituality, illusion"],
              ["Pluto ♇", "Power, transformation, the buried"],
            ] },
            { kind: "callout", tone: "tradition", title: "Personal vs generational", text: "Jupiter and Saturn are the 'social' planets — they bridge the personal and the collective. Uranus, Neptune, and Pluto move so slowly they stay in a sign for years, so by sign they describe whole generations; their house and aspects make them personal to you." },
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
          ],
        },
        {
          id: "l7-big-three",
          title: "The Big Three",
          objective: "Explain what the Sun, Moon, and Rising sign each contribute to the 'Big Three.'",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "When people say 'I'm a Leo,' they usually mean their Sun sign. But the most useful quick portrait of a chart is the 'Big Three': Sun, Moon, and Rising sign together." },
            { kind: "list", items: [
              "Sun — your core identity and what you're growing toward.",
              "Moon — your inner emotional world and needs.",
              "Rising (Ascendant) — the 'mask' you wear, your first impression and approach to life.",
            ] },
            { kind: "callout", tone: "tip", title: "Why the Rising matters", text: "The Rising sign is set by the exact birth time and place — it's the sign that was on the eastern horizon at your birth. It colors the whole chart, which is why two people with the same Sun sign can feel so different." },
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
          ],
        },
        {
          id: "l8-the-houses",
          title: "The twelve houses",
          objective: "Describe what the houses add to a chart and recall a few key house meanings.",
          estMinutes: 5,
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
            { kind: "callout", tone: "tip", title: "Reading a placement", text: "Combine all three: a planet's sign (how), the planet (what), and its house (where). E.g., 'Mars in Gemini in the 10th' = drive (Mars), expressed in a quick, verbal way (Gemini), focused on career (10th)." },
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
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Aspects are the angles planets make to each other — they describe how the parts of you talk to one another. There are five 'major' aspects, defined by the degrees between two planets (within a margin called the 'orb')." },
            { kind: "table", headers: ["Aspect", "Angle", "Nature"], rows: [
              ["Conjunction", "0°", "Blended/intensified (depends on the planets)"],
              ["Sextile", "60°", "Harmonious — opportunity"],
              ["Square", "90°", "Tense — friction, growth"],
              ["Trine", "120°", "Harmonious — natural flow"],
              ["Opposition", "180°", "Tense — polarity, balance"],
            ] },
            { kind: "callout", tone: "tradition", title: "Tension isn't bad", text: "Squares and oppositions get a bad reputation, but they're where growth happens — they create the friction that pushes you to develop. Trines and sextiles flow easily but can be taken for granted." },
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
          ],
        },
        {
          id: "l10-reading-holistically",
          title: "Reading a chart holistically",
          objective: "Combine signs, planets, houses, and aspects into a single balanced reading.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "A chart is more than a list of placements. Reading well means stepping back and weighing the whole: which elements dominate, where the Big Three point, which planets are emphasized, and how the aspects tie it together." },
            { kind: "list", ordered: true, items: [
              "Start with the Big Three (Sun, Moon, Rising) for the overall portrait.",
              "Notice the elemental balance — lots of fire? little water?",
              "Read each planet as planet + sign + house.",
              "Layer in the aspects to see how the parts interact.",
              "Hold it all loosely — look for themes, not contradictions to 'solve.'",
            ] },
            { kind: "callout", tone: "evidence", title: "Keep it honest", text: "A chart describes patterns and possibilities, not fixed destiny — you always have agency. Astrology is most valuable as a mirror for self-reflection. It is not a substitute for medical, legal, financial, or mental-health advice." },
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
          ],
        },
      ],
    },
  ],

  // Final-test bank — engine samples `finalTestSize` (10) at random per attempt.
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
    { id: "f14", type: "mcq", prompt: "Which best describes astrology's relationship to science?", options: [
      { id: "a", text: "It isn't a science; it's best used as a reflective, symbolic tool", correct: true },
      { id: "b", text: "It has been scientifically proven to predict the future", correct: false },
      { id: "c", text: "It is a modern branch of astronomy", correct: false },
      { id: "d", text: "It reliably diagnoses health conditions", correct: false },
    ] },
    { id: "f15", type: "true-false", prompt: "Outer planets describe generational themes by sign because they move slowly.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f16", type: "true-false", prompt: "A birth chart fixes your destiny and removes your agency.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
  ],
};
