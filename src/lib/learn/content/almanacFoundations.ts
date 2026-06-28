import type { Course } from "../types";

/** FLAGSHIP #8 — Almanac & lunar living: real astronomy alongside the tradition. */
export const almanacFoundations: Course = {
  id: "almanac-foundations",
  domain: "almanac",
  title: "Reading the Sky & the Almanac",
  subtitle: "Moon phases, seasons & lunar living",
  level: "foundations",
  icon: "🌙",
  summary:
    "Learn the real astronomy behind moon phases, eclipses, and the seasons — alongside the traditions of living by the lunar and seasonal calendar.",
  estMinutes: 40,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "The Real Sky", lessons: ["Why moon phases happen", "Why eclipses happen", "Solstices, equinoxes & the seasons", "Tides & the Moon", "Why the earliest sunset isn't the solstice"] },
    { module: "Lunar Living", lessons: ["The 8 moon phases & their meanings", "Planetary days & hours", "The Wheel of the Year"] },
    { module: "Folklore & Evidence", lessons: ["Gardening by the moon", "How to read an almanac", "Building your own almanac rhythm"] },
  ],

  modules: [
    {
      id: "m1",
      title: "The Real Sky",
      lessons: [
        {
          id: "l1-moon-phases",
          title: "Why moon phases happen",
          objective: "Explain what causes the moon's phases.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The Moon doesn't make its own light — it reflects the Sun. As the Moon orbits Earth, we see different amounts of its sunlit half from our angle. That changing view is the cycle of phases. Crucially, half the Moon is *always* lit (the half facing the Sun); phases are just about how much of that lit half is turned toward us." },
            { kind: "list", items: [
              "**New moon** — the Moon is between Earth and Sun, so its lit side faces away from us (it looks dark).",
              "**Full moon** — Earth is between the Moon and Sun, so we see the whole lit face.",
              "**Quarters** — we see half the lit face, as the Moon sits at a right angle to the Sun from our view.",
              "**Crescent vs gibbous** — a 'crescent' is less than half lit; a 'gibbous' is more than half but not yet full.",
            ] },
            { kind: "callout", tone: "history", title: "The same face, always", text: "The Moon is 'tidally locked' to Earth — it rotates once per orbit — so we always see the same near side. The phases aren't Earth's shadow on the Moon (that's an eclipse); they're just how much of the sunlit side is turned toward us. There is no permanent 'dark side' — every part of the Moon gets sunlight over a month; there's only a far side we never see from Earth." },
            { kind: "callout", tone: "evidence", title: "Two lengths of 'a month'", text: "The Moon takes about 27.3 days to circle Earth once relative to the stars (a *sidereal* month). But because Earth is also moving around the Sun, the Moon needs an extra ~2.2 days to return to the same phase — so the cycle new-moon-to-new-moon (the *synodic* month) is about 29.5 days. Calendar 'moonths' descend from that 29.5-day rhythm." },
            { kind: "keyfacts", items: [
              "The Moon shines by reflecting sunlight, not its own light.",
              "Phases = our changing view of the always-half-lit Moon.",
              "Sidereal month ≈ 27.3 days (relative to the stars).",
              "Synodic month ≈ 29.5 days (new moon to new moon).",
              "Tidal locking is why we always see the same near side.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Moon phases are caused by…", options: [
              { id: "a", text: "How much of the Moon's sunlit half faces Earth as it orbits", correct: true, explanation: "Correct — it's our changing view of the lit side." },
              { id: "b", text: "Earth's shadow falling on the Moon", correct: false, explanation: "That's a lunar eclipse, not the monthly phases." },
              { id: "c", text: "The Moon producing its own light", correct: false, explanation: "The Moon only reflects sunlight." },
              { id: "d", text: "The Moon spinning faster than Earth", correct: false, explanation: "Spin rate isn't what makes the phases." },
            ] },
            { id: "q2", type: "mcq", prompt: "At a new moon, the Moon is…", options: [
              { id: "a", text: "Between Earth and the Sun, with its lit side facing away", correct: true, explanation: "Yes — so it appears dark to us." },
              { id: "b", text: "On the far side of Earth from the Sun", correct: false, explanation: "That's a full moon." },
              { id: "c", text: "In Earth's shadow", correct: false, explanation: "That would be an eclipse." },
            ] },
            { id: "q3", type: "mcq", prompt: "Why is the synodic month (~29.5 days) longer than the sidereal month (~27.3 days)?", options: [
              { id: "a", text: "Earth moves along its orbit, so the Moon must travel a bit farther to repeat a phase", correct: true, explanation: "Right — the Moon has to 'catch up' to the new Sun–Earth line." },
              { id: "b", text: "The Moon slows down at full moon", correct: false, explanation: "Its speed isn't the cause." },
              { id: "c", text: "The Moon shrinks and grows", correct: false, explanation: "The Moon's size is constant." },
              { id: "d", text: "Clouds delay the phase", correct: false, explanation: "Weather has nothing to do with orbital periods." },
            ] },
            { id: "q4", type: "true-false", prompt: "We always see the same face of the Moon.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the Moon is tidally locked to Earth." },
              { id: "f", text: "False", correct: false, explanation: "We do — it rotates once per orbit." },
            ] },
            { id: "q5", type: "true-false", prompt: "There is a permanent 'dark side' of the Moon that never receives sunlight.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — every part is sunlit over a month; there's a far side we can't see, but not a permanently dark one." },
              { id: "f", text: "False", correct: true, explanation: "Correct — 'far side' yes, 'dark side' no." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the name for the ~29.5-day cycle from one new moon to the next.", options: [], answer: "synodic month", accept: ["synodic", "the synodic month", "lunation", "lunar month"], explanation: "The synodic month (lunation) is ~29.5 days — the cycle of phases." },
          ],
        },
        {
          id: "l2-eclipses",
          title: "Why eclipses happen",
          objective: "Distinguish solar and lunar eclipses and why they're not monthly.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "An eclipse is a shadow event: one body's shadow falls across another. There are exactly two kinds, and each can only happen at one specific phase." },
            { kind: "table", headers: ["Eclipse", "What happens", "Occurs at"], rows: [
              ["Solar", "The Moon passes between Sun and Earth, casting a shadow on Earth", "A new moon"],
              ["Lunar", "Earth passes between Sun and Moon, casting its shadow on the Moon", "A full moon"],
            ] },
            { kind: "callout", tone: "history", title: "Why not every month?", text: "The Moon's orbit is tilted about 5° from Earth's orbit around the Sun. Most months the Moon passes a little above or below the Sun–Earth line, so there's no eclipse. Eclipses only happen when a new or full moon lines up near the two crossing points — the 'nodes' — where the tilted orbit intersects Earth's orbital plane." },
            { kind: "list", items: [
              "**Total solar eclipse** — the Moon fully covers the Sun's disk; only visible along a narrow path, because the Moon's dark shadow (umbra) is small.",
              "**Partial / annular** — the Moon covers part of the Sun, or (when farther away) leaves a bright 'ring of fire' around it.",
              "**Total lunar eclipse** — the Moon turns coppery-red ('blood moon') because it's lit only by sunlight bent through Earth's atmosphere.",
            ] },
            { kind: "callout", tone: "safety", title: "Never look at the Sun directly", text: "A solar eclipse is the one sky event with a real hazard: looking at the Sun, even mostly covered, can permanently damage your eyes. Use certified eclipse glasses or a pinhole projector. A lunar eclipse, by contrast, is completely safe to watch with the naked eye." },
            { kind: "callout", tone: "tradition", title: "Eclipses in folklore", text: "Across cultures, eclipses were read as omens — a dragon or wolf 'swallowing' the Sun or Moon. The honest version is just as dramatic: a precise, predictable alignment we can now forecast centuries ahead. The wonder is real; the swallowing isn't." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A solar eclipse happens when…", options: [
              { id: "a", text: "The Moon passes between the Sun and Earth (at a new moon)", correct: true, explanation: "Correct — the Moon's shadow falls on Earth." },
              { id: "b", text: "Earth passes between the Sun and Moon", correct: false, explanation: "That's a lunar eclipse." },
              { id: "c", text: "The Moon glows red on its own", correct: false, explanation: "The Moon doesn't glow on its own." },
              { id: "d", text: "The Sun moves behind Earth", correct: false, explanation: "The Sun isn't the body that moves into a shadow here." },
            ] },
            { id: "q2", type: "mcq", prompt: "A lunar eclipse occurs at…", options: [
              { id: "a", text: "A full moon, when Earth's shadow falls on the Moon", correct: true, explanation: "Yes — Earth between Sun and Moon." },
              { id: "b", text: "A new moon", correct: false, explanation: "That's when solar eclipses can occur." },
              { id: "c", text: "Any random night", correct: false, explanation: "It requires a specific alignment at full moon." },
            ] },
            { id: "q3", type: "mcq", prompt: "Why isn't there an eclipse every month?", options: [
              { id: "a", text: "The Moon's orbit is tilted ~5°, so it usually misses the Sun–Earth line", correct: true, explanation: "Correct — alignment only happens near the nodes." },
              { id: "b", text: "The Moon disappears some months", correct: false, explanation: "It doesn't disappear; it's just misaligned." },
              { id: "c", text: "Clouds block it", correct: false, explanation: "It's about orbital geometry, not weather." },
              { id: "d", text: "The Sun turns off", correct: false, explanation: "Obviously not — it's about alignment." },
            ] },
            { id: "q4", type: "mcq", prompt: "Why does a totally eclipsed Moon look coppery-red?", options: [
              { id: "a", text: "It's lit by sunlight bent and reddened through Earth's atmosphere", correct: true, explanation: "Right — the same reason sunsets are red." },
              { id: "b", text: "The Moon catches fire", correct: false, explanation: "Nothing burns; it's refracted sunlight." },
              { id: "c", text: "Mars reflects onto it", correct: false, explanation: "Mars has nothing to do with it." },
            ] },
            { id: "q5", type: "true-false", prompt: "It is safe to look directly at a solar eclipse without eye protection.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — looking at the Sun, even mostly covered, can permanently damage your eyes." },
              { id: "f", text: "False", correct: true, explanation: "Correct — use certified eclipse glasses or a pinhole projector." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the term for the two points where the Moon's tilted orbit crosses Earth's orbital plane — eclipses happen near them.", options: [], answer: "nodes", accept: ["node", "the nodes", "lunar nodes"], explanation: "The nodes are the crossing points; an eclipse needs a new/full moon near one." },
          ],
        },
        {
          id: "l3-seasons",
          title: "Solstices, equinoxes & the seasons",
          objective: "Explain what causes the seasons and what equinoxes and solstices are.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "evidence", title: "It's the tilt, not the distance", text: "Seasons happen because Earth's axis is tilted about 23.5°. As Earth orbits the Sun, each hemisphere tilts toward the Sun (summer) or away (winter). It's not about Earth being closer to the Sun — in fact Earth is *closest* to the Sun in early January, during Northern-Hemisphere winter. The tilt changes how high the Sun climbs and how long it's up." },
            { kind: "table", headers: ["Event", "What it is", "~Date (N. Hemisphere)"], rows: [
              ["Spring equinox", "Sun over the equator; day and night nearly equal", "~Mar 20"],
              ["Summer solstice", "Longest day — your hemisphere tilts most toward the Sun", "~Jun 21"],
              ["Autumn equinox", "Sun over the equator again; day and night nearly equal", "~Sep 22"],
              ["Winter solstice", "Shortest day — your hemisphere tilts most away from the Sun", "~Dec 21"],
            ] },
            { kind: "text", text: "These four points anchor the solar year and many seasonal traditions — they're the astronomical backbone behind festivals worldwide. The seasons are flipped between hemispheres: when it's the June solstice (summer in the north), it's the shortest day and winter in the south." },
            { kind: "callout", tone: "history", title: "Why 'equinox' and 'solstice'?", text: "'Equinox' is Latin for 'equal night' (aequus + nox). 'Solstice' means 'Sun stands still' (sol + sistere) — around the solstice the Sun's noon height barely changes for several days, as if it pauses before reversing direction along the horizon." },
            { kind: "keyfacts", items: [
              "Seasons are caused by Earth's ~23.5° axial tilt, not its distance from the Sun.",
              "Equinox = day and night nearly equal everywhere.",
              "Summer solstice = longest day; winter solstice = shortest day.",
              "The two hemispheres have opposite seasons at the same time.",
              "The four points are fixed by the Sun, independent of the Moon.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The seasons are caused by…", options: [
              { id: "a", text: "Earth's axial tilt (~23.5°)", correct: true, explanation: "Correct — the tilt, as Earth orbits the Sun." },
              { id: "b", text: "Earth getting closer to and farther from the Sun", correct: false, explanation: "Distance isn't the main cause; tilt is. Earth is actually closest in January." },
              { id: "c", text: "The Moon's phases", correct: false, explanation: "The Moon doesn't drive the seasons." },
              { id: "d", text: "Solar eclipses", correct: false, explanation: "Eclipses are unrelated to seasons." },
            ] },
            { id: "q2", type: "mcq", prompt: "On an equinox…", options: [
              { id: "a", text: "Day and night are nearly equal; the Sun is over the equator", correct: true, explanation: "Yes — 'equinox' means 'equal night.'" },
              { id: "b", text: "The day is longest", correct: false, explanation: "That's the summer solstice." },
              { id: "c", text: "The Moon is full", correct: false, explanation: "Equinoxes are solar events, unrelated to moon phase." },
            ] },
            { id: "q3", type: "mcq", prompt: "The winter solstice is…", options: [
              { id: "a", text: "The shortest day, when your hemisphere tilts most from the Sun", correct: true, explanation: "Correct." },
              { id: "b", text: "The longest day", correct: false, explanation: "That's the summer solstice." },
              { id: "c", text: "When day and night are equal", correct: false, explanation: "That's an equinox." },
            ] },
            { id: "q4", type: "mcq", prompt: "When it's the June solstice (summer in the Northern Hemisphere), the Southern Hemisphere is having…", options: [
              { id: "a", text: "Its winter, with the shortest day", correct: true, explanation: "Right — the hemispheres have opposite seasons." },
              { id: "b", text: "Its summer too", correct: false, explanation: "Seasons are reversed between hemispheres." },
              { id: "c", text: "An eclipse", correct: false, explanation: "Unrelated to the solstice." },
            ] },
            { id: "q5", type: "true-false", prompt: "Earth is closest to the Sun during Northern-Hemisphere summer.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — Earth is closest in early January, during N. Hemisphere winter." },
              { id: "f", text: "False", correct: true, explanation: "Correct — distance isn't what drives the seasons; tilt is." },
            ] },
          ],
        },
        {
          id: "l4-tides",
          title: "Tides & the Moon",
          objective: "Explain why the Moon causes two tides a day and what spring and neap tides are.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Tides are the one everyday effect the Moon genuinely, measurably has on Earth — not on plants or moods, but on the oceans. The Moon's gravity pulls hardest on the side of Earth nearest it, less on Earth's center, and least on the far side. That *difference* in pull stretches the oceans into two bulges." },
            { kind: "callout", tone: "evidence", title: "Why two high tides a day, not one", text: "Water bulges toward the Moon on the near side (pulled most) and away from it on the far side (pulled least, so it's 'left behind'). Earth rotates through both bulges each day, so most coasts get two high tides and two low tides roughly every 24 hours and 50 minutes — the extra ~50 minutes is the Moon moving along in its orbit." },
            { kind: "table", headers: ["Tide type", "When", "What it looks like"], rows: [
              ["Spring tide", "New & full moon (Sun + Moon aligned)", "Biggest range — very high highs, very low lows"],
              ["Neap tide", "First & last quarter (Sun ⟂ Moon)", "Smallest range — modest highs and lows"],
            ] },
            { kind: "callout", tone: "history", title: "The Sun helps too", text: "The Sun also raises tides, but at about half the Moon's strength because it's so far away. When Sun and Moon line up (new and full moon) their pulls add — that's a 'spring' tide (nothing to do with the season; it means the water 'springs' up). At the quarters they work at right angles and partly cancel — a gentler 'neap' tide." },
            { kind: "keyfacts", items: [
              "The Moon's *differential* gravity raises two ocean bulges.",
              "Most coasts see two high and two low tides per ~24h 50m.",
              "Spring tides (largest) come at new and full moon.",
              "Neap tides (smallest) come at the quarter moons.",
              "The Sun's tidal pull is about half the Moon's.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Why does most of Earth get TWO high tides per day?", options: [
              { id: "a", text: "There are two bulges — one toward the Moon, one on the far side", correct: true, explanation: "Correct — Earth rotates through both bulges." },
              { id: "b", text: "The Moon orbits twice a day", correct: false, explanation: "The Moon takes ~27 days to orbit, not half a day." },
              { id: "c", text: "The Sun and Moon each make one", correct: false, explanation: "Both bulges come from the Moon's differential gravity." },
              { id: "d", text: "Tides have nothing to do with the Moon", correct: false, explanation: "The Moon is the main driver of tides." },
            ] },
            { id: "q2", type: "mcq", prompt: "Spring tides (the largest range) happen at…", options: [
              { id: "a", text: "New moon and full moon, when Sun and Moon align", correct: true, explanation: "Yes — their pulls add together." },
              { id: "b", text: "Only in the spring season", correct: false, explanation: "'Spring' here means the water springs up, not the season." },
              { id: "c", text: "The quarter moons", correct: false, explanation: "Those give the smallest (neap) tides." },
            ] },
            { id: "q3", type: "mcq", prompt: "Compared with the Moon, the Sun's tide-raising pull is…", options: [
              { id: "a", text: "About half as strong", correct: true, explanation: "Correct — the Sun is far more massive but much farther away." },
              { id: "b", text: "About twice as strong", correct: false, explanation: "It's weaker, roughly half." },
              { id: "c", text: "Exactly equal", correct: false, explanation: "It's roughly half the Moon's." },
            ] },
            { id: "q4", type: "true-false", prompt: "Neap tides (the smallest range) occur at the first and last quarter moons.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — Sun and Moon pull at right angles and partly cancel." },
              { id: "f", text: "False", correct: false, explanation: "Quarter moons do give the gentle neap tides." },
            ] },
            { id: "q5", type: "true-false", prompt: "The Moon's measurable physical effect on tides proves it also measurably affects plant growth and human moods.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — tides are a real gravitational effect on oceans; growth and mood claims aren't supported by evidence." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep the genuine tidal effect separate from unproven claims." },
            ] },
          ],
        },
        {
          id: "l5-analemma",
          title: "Why the earliest sunset isn't the solstice",
          objective: "Explain why earliest sunset and latest sunrise don't fall on the winter solstice.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "A surprise hidden in any almanac's sunrise/sunset tables: the winter solstice is the *shortest day*, but it is NOT the day of the earliest sunset. In the Northern Hemisphere the earliest sunset comes a couple of weeks *before* the solstice, and the latest sunrise a couple of weeks *after* it." },
            { kind: "callout", tone: "evidence", title: "Blame the 'equation of time'", text: "Clocks tick a perfectly even 24 hours, but the real Sun runs a little fast or slow through the year. That's because Earth's orbit is slightly elliptical and its axis is tilted, so 'solar noon' drifts relative to clock noon. The gap between sundial time and clock time is called the equation of time — and near the December solstice it shifts sunset and sunrise off the shortest-day mark." },
            { kind: "callout", tone: "tradition", title: "The figure-eight in the sky", text: "If you photographed the Sun at the same clock time every week for a year, it would trace a lopsided figure-8 called the analemma — a picture of the equation of time plus the seasonal tilt. You'll sometimes see it printed on globes. It's the visual record of why the Sun doesn't keep perfect clock time." },
            { kind: "list", items: [
              "**Shortest day** = winter solstice (least daylight overall).",
              "**Earliest sunset** = ~2 weeks *before* the solstice (at ~40°N, around Dec 7).",
              "**Latest sunrise** = ~2 weeks *after* the solstice (early January).",
              "The exact offsets depend on your latitude.",
            ] },
            { kind: "keyfacts", items: [
              "The solstice is the shortest day but not the earliest sunset.",
              "The equation of time = sundial time minus clock time.",
              "It comes from Earth's elliptical orbit + axial tilt.",
              "The analemma is its figure-8 picture in the sky.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In the Northern Hemisphere, the earliest sunset of the year falls…", options: [
              { id: "a", text: "About two weeks before the winter solstice", correct: true, explanation: "Correct — sunset starts getting later again before the shortest day." },
              { id: "b", text: "Exactly on the winter solstice", correct: false, explanation: "The solstice is the shortest day, but not the earliest sunset." },
              { id: "c", text: "On the summer solstice", correct: false, explanation: "That's the longest day, with the latest sunset." },
              { id: "d", text: "On the spring equinox", correct: false, explanation: "Unrelated to earliest sunset." },
            ] },
            { id: "q2", type: "mcq", prompt: "The mismatch between earliest sunset and the solstice is explained by…", options: [
              { id: "a", text: "The equation of time (Earth's elliptical orbit + axial tilt)", correct: true, explanation: "Right — solar noon drifts relative to clock noon." },
              { id: "b", text: "The Moon's phase", correct: false, explanation: "Phases don't shift sunset times this way." },
              { id: "c", text: "Daylight saving clocks", correct: false, explanation: "It happens even without clock changes." },
            ] },
            { id: "q3", type: "mcq", prompt: "The analemma is…", options: [
              { id: "a", text: "The figure-8 the Sun traces if photographed at the same clock time all year", correct: true, explanation: "Correct — a picture of the equation of time plus tilt." },
              { id: "b", text: "A type of eclipse", correct: false, explanation: "It's not an eclipse." },
              { id: "c", text: "The Moon's monthly path", correct: false, explanation: "It's about the Sun, not the Moon." },
            ] },
            { id: "q4", type: "true-false", prompt: "The winter solstice is the shortest day of the year (least daylight).", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — it has the least daylight, even though it isn't the earliest sunset." },
              { id: "f", text: "False", correct: false, explanation: "It is the shortest day; it just isn't the earliest-sunset day." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the name for the difference between sundial (true solar) time and clock (mean) time.", options: [], answer: "equation of time", accept: ["the equation of time", "eot"], explanation: "The equation of time is why the Sun doesn't keep perfect clock time." },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Lunar Living",
      lessons: [
        {
          id: "l6-eight-phases",
          title: "The 8 moon phases & their meanings",
          objective: "Name the 8 phases and their traditional themes.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The continuous cycle of phases is conventionally split into eight named stages — four 'principal' phases (new, first quarter, full, last quarter) and four 'intermediate' ones (the crescents and gibbous moons) between them." },
            { kind: "explore", prompt: "The eight moon phases", instructions: "Tap a phase to learn it", items: [
              { glyph: "🌑", name: "New Moon", meta: "Beginnings", accent: "#5b6bb5", blurb: "The Moon sits between Earth and Sun, unlit. A time for intentions and fresh starts." },
              { glyph: "🌒", name: "Waxing Crescent", meta: "Intention", accent: "#6a9a4a", blurb: "A sliver returns. Energy builds; take first steps toward what you set." },
              { glyph: "🌓", name: "First Quarter", meta: "Action", accent: "#c9881f", blurb: "Half-lit and climbing. A decision point — push through resistance." },
              { glyph: "🌔", name: "Waxing Gibbous", meta: "Refinement", accent: "#c9a227", blurb: "Almost full. Adjust, refine and stay the course." },
              { glyph: "🌕", name: "Full Moon", meta: "Culmination", accent: "#d4b878", blurb: "Fully lit. Things come to light — celebration, clarity, release." },
              { glyph: "🌖", name: "Waning Gibbous", meta: "Gratitude", accent: "#a8842c", blurb: "The light recedes. Share, give thanks and digest what came." },
              { glyph: "🌗", name: "Last Quarter", meta: "Release", accent: "#8e6bb5", blurb: "Half-lit and falling. Let go of what no longer serves." },
              { glyph: "🌘", name: "Waning Crescent", meta: "Rest", accent: "#6c5ce7", blurb: "The final sliver. Rest, reflect and prepare for the next new moon." },
            ] },
            { kind: "table", headers: ["Phase", "Sky fact", "Traditional theme"], rows: [
              ["New moon", "Rises & sets with the Sun; invisible", "Intention, fresh starts, planting seeds"],
              ["Waxing crescent", "Low in the west after sunset", "First steps, hope, building"],
              ["First quarter", "Half-lit; highest at sunset", "Decision, action, pushing through"],
              ["Waxing gibbous", "More than half, brightening", "Refinement, adjustment, almost there"],
              ["Full moon", "Rises at sunset, sets at sunrise", "Culmination, clarity, release, celebration"],
              ["Waning gibbous", "Rises after sunset, fading", "Gratitude, sharing, giving back"],
              ["Last quarter", "Half-lit; highest at sunrise", "Letting go, forgiveness, clearing"],
              ["Waning crescent", "Low in the east before sunrise", "Rest, reflection, surrender before renewal"],
            ] },
            { kind: "callout", tone: "tradition", title: "A rhythm of build and release", text: "The waxing half (new → full) is traditionally for building and growing; the waning half (full → new) is for releasing and resting. Many people set intentions at the new moon and reflect or let go at the full moon. This is symbolic ritual, not a claim about the Moon affecting outcomes — and used that way it's a meaningful structure." },
            { kind: "callout", tone: "culture", title: "Named full moons", text: "Many almanacs print folk names for each month's full moon — Wolf Moon (January), Snow Moon (February), Harvest Moon (the full moon nearest the autumn equinox), and so on. Most of these names come from North American and European seasonal folklore and were popularized by 20th-century almanacs; they're tradition and storytelling, not astronomy." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The new moon is traditionally a time for…", options: [
              { id: "a", text: "Setting intentions and fresh starts", correct: true, explanation: "Correct — planting seeds for the cycle." },
              { id: "b", text: "Celebrating culmination", correct: false, explanation: "That's the full moon." },
              { id: "c", text: "Nothing in particular", correct: false, explanation: "It marks the start of the cycle." },
              { id: "d", text: "The final harvest", correct: false, explanation: "That's a seasonal/festival theme, not the new moon." },
            ] },
            { id: "q2", type: "mcq", prompt: "The waxing half of the cycle (new → full) is traditionally for…", options: [
              { id: "a", text: "Building and growing", correct: true, explanation: "Yes — energy is 'increasing.'" },
              { id: "b", text: "Releasing and resting", correct: false, explanation: "That's the waning half." },
              { id: "c", text: "Eclipses only", correct: false, explanation: "Eclipses are separate events." },
            ] },
            { id: "q3", type: "mcq", prompt: "A 'gibbous' moon is one that is…", options: [
              { id: "a", text: "More than half lit, but not yet full", correct: true, explanation: "Correct — between quarter and full." },
              { id: "b", text: "Less than half lit", correct: false, explanation: "That's a crescent." },
              { id: "c", text: "Completely dark", correct: false, explanation: "That's the new moon." },
            ] },
            { id: "q4", type: "mcq", prompt: "The full moon, as a sky fact, …", options: [
              { id: "a", text: "Rises around sunset and sets around sunrise", correct: true, explanation: "Right — it's opposite the Sun, so it's up all night." },
              { id: "b", text: "Rises and sets with the Sun", correct: false, explanation: "That's the new moon." },
              { id: "c", text: "Is only visible at midday", correct: false, explanation: "The full moon is a nighttime object." },
            ] },
            { id: "q5", type: "true-false", prompt: "The 'Harvest Moon' name is astronomy, not folklore.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — full-moon names are seasonal folklore, popularized by almanacs." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's tradition and storytelling, not astronomy." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the word for the half of the cycle when the lit portion is shrinking (full → new).", options: [], answer: "waning", accept: ["the waning", "waning half"], explanation: "Waning = decreasing light; waxing = increasing." },
          ],
        },
        {
          id: "l7-planetary-days",
          title: "Planetary days & hours",
          objective: "Recall which planet rules each day of the week.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "An old tradition assigns each day of the week to a 'ruling' planet — and the day names still carry it, in English and even more clearly in Romance languages. Each planet lends the day a flavor used for timing rituals and tasks." },
            { kind: "table", headers: ["Day", "Planet", "Theme", "Name echo"], rows: [
              ["Sunday", "Sun", "Vitality, success, self", "Sun-day"],
              ["Monday", "Moon", "Emotion, home, intuition", "Moon-day / lundi"],
              ["Tuesday", "Mars", "Energy, courage, action", "mardi (Mars)"],
              ["Wednesday", "Mercury", "Communication, learning", "mercredi (Mercury)"],
              ["Thursday", "Jupiter", "Growth, luck, abundance", "jeudi (Jove)"],
              ["Friday", "Venus", "Love, beauty, money", "vendredi (Venus)"],
              ["Saturday", "Saturn", "Discipline, boundaries, endings", "Saturn-day"],
            ] },
            { kind: "callout", tone: "history", title: "Where the order comes from", text: "The day-rulers follow from the ancient 'Chaldean order' of the seven classical planets by apparent speed (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon). Assign planets hour by hour around that cycle and the planet ruling the first hour of each day lands on exactly this weekday sequence — a neat piece of ancient mathematics, not coincidence." },
            { kind: "callout", tone: "tradition", title: "Planetary hours", text: "The tradition goes further, dividing each day and night into 'planetary hours' that cycle through the seven planets in the Chaldean order, starting with the day's ruler at dawn. It's a niche timing practice — the day rulers above are the part most people use." },
            { kind: "callout", tone: "culture", title: "English keeps Norse names", text: "English Tuesday–Friday swapped the Roman gods for Norse equivalents: Tiw (Mars) → Tuesday, Woden (Mercury) → Wednesday, Thor (Jupiter) → Thursday, Frigg (Venus) → Friday. The planetary logic is the same; only the local gods changed." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which planet rules Monday?", options: [
              { id: "a", text: "The Moon", correct: true, explanation: "Correct — 'Monday' literally means Moon-day." },
              { id: "b", text: "Mars", correct: false, explanation: "Mars rules Tuesday." },
              { id: "c", text: "Saturn", correct: false, explanation: "Saturn rules Saturday." },
              { id: "d", text: "Venus", correct: false, explanation: "Venus rules Friday." },
            ] },
            { id: "q2", type: "mcq", prompt: "Friday is traditionally ruled by…", options: [
              { id: "a", text: "Venus (love, beauty, money)", correct: true, explanation: "Yes — a day for Venusian themes; cf. French 'vendredi.'" },
              { id: "b", text: "Jupiter", correct: false, explanation: "Jupiter rules Thursday." },
              { id: "c", text: "Mercury", correct: false, explanation: "Mercury rules Wednesday." },
            ] },
            { id: "q3", type: "mcq", prompt: "The weekday-ruler order comes from…", options: [
              { id: "a", text: "The Chaldean order of the seven classical planets, applied hour by hour", correct: true, explanation: "Correct — an ancient hour-counting scheme." },
              { id: "b", text: "Random medieval choice", correct: false, explanation: "It traces to a specific planetary scheme." },
              { id: "c", text: "The phases of the Moon", correct: false, explanation: "It's the planets, not lunar phases." },
            ] },
            { id: "q4", type: "mcq", prompt: "Thursday's ruler, Jupiter, traditionally governs…", options: [
              { id: "a", text: "Growth, luck, and abundance", correct: true, explanation: "Right — Jupiter's expansive theme." },
              { id: "b", text: "Discipline and endings", correct: false, explanation: "That's Saturn (Saturday)." },
              { id: "c", text: "Courage and conflict", correct: false, explanation: "That's Mars (Tuesday)." },
            ] },
            { id: "q5", type: "true-false", prompt: "The seven days of the week are named after the seven classical 'planets' (including Sun and Moon).", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — Sun, Moon, and the five visible planets." },
              { id: "f", text: "False", correct: false, explanation: "They are; the names still echo the planets." },
            ] },
          ],
        },
        {
          id: "l8-wheel-of-year",
          title: "The Wheel of the Year",
          objective: "Describe the eight festivals of the seasonal wheel.",
          estMinutes: 5,
          blocks: [
            { kind: "sort", prompt: "Sort the Wheel of the Year", instructions: "Tap a festival, then tap its season", groups: [
              { name: "Spring", accent: "#6a9a4a", items: ["Ostara", "Beltane"] },
              { name: "Summer", accent: "#c9881f", items: ["Litha", "Lughnasadh"] },
              { name: "Autumn", accent: "#a8842c", items: ["Mabon", "Samhain"] },
              { name: "Winter", accent: "#5b6bb5", items: ["Yule", "Imbolc"] },
            ] },
            { kind: "text", text: "The 'Wheel of the Year' is a modern seasonal calendar (assembled in the mid-20th century from older European folk traditions) of eight festivals: the four solar points (solstices and equinoxes) plus four 'cross-quarter' days that fall roughly midway between them." },
            { kind: "table", headers: ["Festival", "Roughly when", "Type", "Marks"], rows: [
              ["Yule", "Winter solstice", "Solar", "The longest night; the return of the light"],
              ["Imbolc", "Early February", "Cross-quarter", "First stirrings of spring"],
              ["Ostara", "Spring equinox", "Solar", "Balance, new growth"],
              ["Beltane", "Early May", "Cross-quarter", "Fertility, passion, bloom"],
              ["Litha", "Summer solstice", "Solar", "Peak light and abundance"],
              ["Lughnasadh", "Early August", "Cross-quarter", "First harvest"],
              ["Mabon", "Autumn equinox", "Solar", "Second harvest, gratitude, balance"],
              ["Samhain", "Late October", "Cross-quarter", "Final harvest; honoring the dead"],
            ] },
            { kind: "callout", tone: "history", title: "Older roots, modern wheel", text: "The four cross-quarter days (Imbolc, Beltane, Lughnasadh, Samhain) descend from Gaelic seasonal festivals; the solar four were added to round out the cycle. The unified eight-spoked 'Wheel' as we know it is a 1950s–60s synthesis — genuinely beautiful, but newer than it often sounds." },
            { kind: "callout", tone: "culture", title: "Familiar echoes", text: "You already meet the wheel in mainstream holidays: Samhain underlies Halloween, Yule overlaps the winter-holiday season, Imbolc relates to Groundhog Day, and Beltane to May Day. Harvest festivals worldwide cluster around Lughnasadh and Mabon." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The Wheel of the Year has how many festivals?", options: [
              { id: "a", text: "Eight", correct: true, explanation: "Four solar points + four cross-quarter days." },
              { id: "b", text: "Four", correct: false, explanation: "There are eight in total." },
              { id: "c", text: "Twelve", correct: false, explanation: "That's months/zodiac, not the wheel." },
              { id: "d", text: "Six", correct: false, explanation: "It's eight." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which festival falls on the winter solstice?", options: [
              { id: "a", text: "Yule", correct: true, explanation: "Correct — the longest night." },
              { id: "b", text: "Beltane", correct: false, explanation: "Beltane is early May." },
              { id: "c", text: "Mabon", correct: false, explanation: "Mabon is the autumn equinox." },
            ] },
            { id: "q3", type: "mcq", prompt: "'Cross-quarter' days fall…", options: [
              { id: "a", text: "Roughly midway between the solstices and equinoxes", correct: true, explanation: "Yes — the midpoints of the seasons." },
              { id: "b", text: "Only on full moons", correct: false, explanation: "They're solar/seasonal, not lunar." },
              { id: "c", text: "On the equinoxes themselves", correct: false, explanation: "Those are the quarter days, not cross-quarter." },
            ] },
            { id: "q4", type: "mcq", prompt: "Which modern holiday most directly echoes Samhain?", options: [
              { id: "a", text: "Halloween", correct: true, explanation: "Correct — Samhain underlies Halloween." },
              { id: "b", text: "Independence Day", correct: false, explanation: "Unrelated to the wheel." },
              { id: "c", text: "Valentine's Day", correct: false, explanation: "Not derived from Samhain." },
            ] },
            { id: "q5", type: "true-false", prompt: "The unified eight-festival Wheel of the Year is an ancient unbroken tradition.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's a mid-20th-century synthesis of older festivals." },
              { id: "f", text: "False", correct: true, explanation: "Correct — older roots, but the eight-spoked wheel is modern." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Folklore & Evidence",
      lessons: [
        {
          id: "l9-moon-gardening",
          title: "Gardening by the moon",
          objective: "Weigh the tradition of lunar gardening against the evidence.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "tradition", title: "The tradition", text: "Moon gardening times planting and harvesting to the lunar cycle — for example, sowing 'above-ground' crops as the moon waxes and 'root' crops as it wanes, and pruning or harvesting on particular phases. It's an old and widespread folk practice, printed in farmers' almanacs for centuries." },
            { kind: "callout", tone: "evidence", title: "What the evidence says", text: "Controlled studies have not found reliable evidence that the moon's phase affects plant germination or growth (beyond the Moon's real effect on ocean tides). Moonlight is roughly 100–1,000× dimmer than sunlight — far too weak to drive photosynthesis. What actually matters is soil, water, temperature, day length, and the timing of the real seasons." },
            { kind: "callout", tone: "history", title: "Why the belief persisted", text: "Almanacs that printed moon-planting tables also printed genuinely useful frost dates, day lengths, and seasonal timing — so gardens did better when people followed them, and the moon got the credit. Bundling good seasonal advice with the lunar rule made the lunar rule look like it worked." },
            { kind: "callout", tone: "tip", title: "So is it useless?", text: "Not necessarily — as a gentle scheduling rhythm and a way to stay connected to the sky, moon gardening can be a lovely practice. Just hold the 'it makes plants grow better' claim loosely, and let the real garden science (frost dates, soil, sun) do the heavy lifting." },
            { kind: "keyfacts", items: [
              "No reliable evidence that moon phase changes plant growth.",
              "Moonlight is ~100–1,000× dimmer than sunlight.",
              "Real drivers: soil, water, temperature, day length, frost dates.",
              "Fine as a rhythm; not a mechanism.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "What does controlled research say about lunar gardening?", options: [
              { id: "a", text: "No reliable evidence the moon's phase affects plant growth", correct: true, explanation: "Correct — beyond tides, no demonstrated effect." },
              { id: "b", text: "It dramatically increases yields", correct: false, explanation: "Studies don't support that." },
              { id: "c", text: "Moonlight is as strong as sunlight", correct: false, explanation: "Moonlight is 100–1,000× dimmer." },
              { id: "d", text: "It only works on root crops", correct: false, explanation: "No reliable phase effect was found at all." },
            ] },
            { id: "q2", type: "mcq", prompt: "What actually drives plant growth?", options: [
              { id: "a", text: "Soil, water, temperature, light, and the real seasons", correct: true, explanation: "Yes — the measurable factors." },
              { id: "b", text: "The phase of the moon", correct: false, explanation: "No reliable evidence for that." },
              { id: "c", text: "The day of the week", correct: false, explanation: "Not a factor in plant biology." },
            ] },
            { id: "q3", type: "mcq", prompt: "Why did moon-planting rules seem to 'work' in old almanacs?", options: [
              { id: "a", text: "They were bundled with genuinely useful frost dates and seasonal timing", correct: true, explanation: "Correct — the good seasonal advice got the credit attributed to the moon." },
              { id: "b", text: "The moon really controls germination", correct: false, explanation: "No reliable evidence supports that." },
              { id: "c", text: "Gardeners imagined their whole harvest", correct: false, explanation: "The harvests were real; the cause was seasonal, not lunar." },
            ] },
            { id: "q4", type: "true-false", prompt: "Moon gardening can still be a pleasant scheduling rhythm, even without a proven growth effect.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — enjoy the rhythm; hold the growth claim loosely." },
              { id: "f", text: "False", correct: false, explanation: "It can be a nice practice regardless of the evidence." },
            ] },
            { id: "q5", type: "true-false", prompt: "Moonlight is about as bright as sunlight, which is why some claim it powers growth.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — moonlight is hundreds to a thousand times dimmer than sunlight." },
              { id: "f", text: "False", correct: true, explanation: "Correct — far too dim to drive photosynthesis." },
            ] },
          ],
        },
        {
          id: "l10-read-almanac",
          title: "How to read an almanac",
          objective: "Interpret the common tables and symbols in an almanac or ephemeris.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "An almanac is, at heart, a yearly table of predictable sky events: sunrise and sunset, moon phases, eclipses, and seasonal markers, often padded with weather lore and gardening tips. An *ephemeris* is the stricter astronomical version — a day-by-day table of where the Sun, Moon, and planets sit among the zodiac signs." },
            { kind: "table", headers: ["Column / symbol", "What it tells you"], rows: [
              ["Sunrise / Sunset", "Local clock times the Sun crosses the horizon"],
              ["Moonrise / Moonset", "When the Moon clears or drops below the horizon"],
              ["● ◐ ○ ◑", "New, first-quarter, full, last-quarter moon dates"],
              ["Length of day", "Hours of daylight (rises near solstice, falls after)"],
              ["☌ / ☍", "Conjunction (same spot) / opposition (opposite) of two bodies"],
              ["Sign glyphs (♈–♓)", "Which zodiac sign a body sits in that day (in an ephemeris)"],
            ] },
            { kind: "callout", tone: "evidence", title: "What's reliable vs. what's decorative", text: "The astronomical columns — sunrise/sunset, moon phases, eclipses, planet positions — are computed from orbital mechanics and are accurate to the minute. The *weather predictions* famously printed in old almanacs are not: long-range 'forecasts' made a year ahead have no demonstrated skill above chance. Trust the sky tables; treat the weather and 'best days' lore as folklore." },
            { kind: "list", items: [
              "**Find tonight's phase:** locate today's date between the two nearest phase symbols.",
              "**Plan an event:** use sunset times for golden hour, or full-moon dates for a moonlit night.",
              "**Read an ephemeris line:** each row is a date; columns give each body's sign and degree.",
              "**Spot an eclipse:** flagged on its date, with the path or visibility noted.",
            ] },
            { kind: "callout", tone: "history", title: "A very old format", text: "Almanacs are among the oldest printed books — Babylonian and medieval astronomers tabulated planetary positions long before print. Benjamin Franklin's 'Poor Richard's Almanack' (1732–58) blended the genuine astronomy with proverbs and humor, the same mix you still see today." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "An ephemeris is best described as…", options: [
              { id: "a", text: "A day-by-day table of where the Sun, Moon, and planets are", correct: true, explanation: "Correct — the strict astronomical table." },
              { id: "b", text: "A weather forecast for the year", correct: false, explanation: "That's the unreliable lore, not the ephemeris." },
              { id: "c", text: "A calendar of personal lucky days", correct: false, explanation: "Not what an ephemeris is." },
              { id: "d", text: "A map of constellations only", correct: false, explanation: "It's positions over time, not a star map." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which part of an old almanac is genuinely reliable?", options: [
              { id: "a", text: "The astronomical tables — sunrise/sunset, phases, eclipses, planet positions", correct: true, explanation: "Right — computed to the minute." },
              { id: "b", text: "The year-ahead weather predictions", correct: false, explanation: "Long-range forecasts have no demonstrated skill." },
              { id: "c", text: "The 'best days' for luck", correct: false, explanation: "That's folklore, not science." },
            ] },
            { id: "q3", type: "mcq", prompt: "In an ephemeris, the symbol ☌ between two bodies means they are in…", options: [
              { id: "a", text: "Conjunction — at the same spot in the sky", correct: true, explanation: "Correct — opposition (☍) is the opposite." },
              { id: "b", text: "Opposition", correct: false, explanation: "That's ☍, the opposite symbol." },
              { id: "c", text: "Eclipse", correct: false, explanation: "Eclipses are flagged separately." },
            ] },
            { id: "q4", type: "mcq", prompt: "To find tonight's moon phase in an almanac, you…", options: [
              { id: "a", text: "Locate today's date between the two nearest phase symbols", correct: true, explanation: "Right — interpolate between the marked phases." },
              { id: "b", text: "Read the weather column", correct: false, explanation: "Weather doesn't tell you the phase." },
              { id: "c", text: "Check the proverbs page", correct: false, explanation: "Proverbs are decoration." },
            ] },
            { id: "q5", type: "true-false", prompt: "The year-ahead weather forecasts in traditional almanacs are scientifically reliable.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — long-range almanac forecasts show no skill above chance." },
              { id: "f", text: "False", correct: true, explanation: "Correct — trust the sky tables, not the weather lore." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the term for a day-by-day astronomical table of the positions of the Sun, Moon, and planets.", options: [], answer: "ephemeris", accept: ["an ephemeris", "the ephemeris"], explanation: "An ephemeris lists each body's position (sign and degree) by date." },
          ],
        },
        {
          id: "l11-almanac-rhythm",
          title: "Building your own almanac rhythm",
          objective: "Use the lunar and seasonal calendar as a personal rhythm, honestly.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "An almanac practice is really about rhythm: using the predictable cycles of the sky as gentle anchors for reflection, planning, and ritual. None of it requires believing the sky *causes* anything — only that the cycles make reliable, beautiful markers to organize attention around." },
            { kind: "list", ordered: true, items: [
              "At the **new moon**, set an intention or start something small.",
              "At the **full moon**, take stock — celebrate, or release what isn't working.",
              "At the **solstices and equinoxes**, pause to mark the turning season.",
              "Let the **day rulers** lightly theme your week if you enjoy it.",
              "Watch one real event a season — a meteor shower, an eclipse, the harvest moon.",
            ] },
            { kind: "callout", tone: "tip", title: "Keep it grounded", text: "The astronomy (phases, eclipses, seasons, tides) is real and exact — a beautiful, reliable clock. The meanings you attach are tradition and personal ritual, not mechanism. Used that way, an almanac rhythm is a meaningful structure, not a forecast." },
            { kind: "callout", tone: "safety", title: "Stay in the symbolic lane", text: "Treat all of this as reflection and ritual, never as guidance for health, money, or major decisions. The Moon's phase has no demonstrated effect on those — so let an almanac rhythm add meaning and routine, not replace medical, financial, or practical judgment." },
            { kind: "keyfacts", items: [
              "Anchor reflection to real, predictable cycles.",
              "Astronomy = exact clock; meanings = personal tradition.",
              "Witness one real sky event each season.",
              "Never a substitute for medical, financial, or practical advice.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "An almanac practice is best understood as…", options: [
              { id: "a", text: "A rhythm of reflection and ritual anchored to real sky cycles", correct: true, explanation: "Yes — structure and meaning, not prediction." },
              { id: "b", text: "A way to predict the future precisely", correct: false, explanation: "It's a rhythm, not a forecast." },
              { id: "c", text: "A replacement for a calendar app", correct: false, explanation: "It's about meaning, not scheduling logistics." },
              { id: "d", text: "A medical planning tool", correct: false, explanation: "It should never guide health decisions." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which part of an almanac practice is literally real and exact?", options: [
              { id: "a", text: "The astronomy — phases, eclipses, seasons, and tides", correct: true, explanation: "Correct — a reliable celestial clock." },
              { id: "b", text: "The predictive meaning of each phase", correct: false, explanation: "That's tradition, not mechanism." },
              { id: "c", text: "Nothing is real", correct: false, explanation: "The astronomy is genuinely precise." },
            ] },
            { id: "q3", type: "mcq", prompt: "A healthy way to use a lunar/seasonal rhythm is to…", options: [
              { id: "a", text: "Add meaning and routine, while keeping medical and financial choices separate", correct: true, explanation: "Right — symbolic structure, not life advice." },
              { id: "b", text: "Decide medical treatment by moon phase", correct: false, explanation: "No — the phase has no demonstrated health effect." },
              { id: "c", text: "Time investments to the full moon", correct: false, explanation: "No basis for that; keep finance separate." },
            ] },
            { id: "q4", type: "true-false", prompt: "The meanings attached to moon phases are tradition and personal ritual, not proven mechanisms.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — hold them as meaningful ritual, not forecast." },
              { id: "f", text: "False", correct: false, explanation: "They're symbolic tradition, not mechanism." },
            ] },
            { id: "q5", type: "true-false", prompt: "An almanac rhythm is a good tool for making major medical or financial decisions.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — keep it symbolic; it should never replace professional judgment." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's for meaning and routine; keep medical and financial choices with the right professionals." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "Moon phases are caused by…", options: [
      { id: "a", text: "Our changing view of the Moon's sunlit half", correct: true },
      { id: "b", text: "Earth's shadow on the Moon", correct: false },
      { id: "c", text: "The Moon making its own light", correct: false },
      { id: "d", text: "Clouds", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "At a new moon, the Moon is…", options: [
      { id: "a", text: "Between Earth and the Sun", correct: true },
      { id: "b", text: "Behind Earth from the Sun", correct: false },
      { id: "c", text: "In Earth's shadow", correct: false },
      { id: "d", text: "Closest to Earth", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "The synodic month (~29.5 days) is longer than the sidereal month (~27.3 days) because…", options: [
      { id: "a", text: "Earth moves along its orbit, so the Moon must catch up to repeat a phase", correct: true },
      { id: "b", text: "The Moon slows down", correct: false },
      { id: "c", text: "The Moon shrinks", correct: false },
      { id: "d", text: "Of clouds", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "A solar eclipse happens at…", options: [
      { id: "a", text: "A new moon, when the Moon is between Sun and Earth", correct: true },
      { id: "b", text: "A full moon", correct: false },
      { id: "c", text: "Any night", correct: false },
      { id: "d", text: "An equinox", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "A lunar eclipse happens at…", options: [
      { id: "a", text: "A full moon, when Earth's shadow falls on the Moon", correct: true },
      { id: "b", text: "A new moon", correct: false },
      { id: "c", text: "A solstice", correct: false },
      { id: "d", text: "First quarter", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Why isn't there an eclipse every month?", options: [
      { id: "a", text: "The Moon's orbit is tilted, so it usually misses the alignment", correct: true },
      { id: "b", text: "The Moon vanishes", correct: false },
      { id: "c", text: "Eclipses are random", correct: false },
      { id: "d", text: "The Sun moves", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "The two points where the Moon's orbit crosses Earth's orbital plane are called…", options: [
      { id: "a", text: "The nodes", correct: true },
      { id: "b", text: "The poles", correct: false },
      { id: "c", text: "The quarters", correct: false },
      { id: "d", text: "The tropics", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "The seasons are caused by…", options: [
      { id: "a", text: "Earth's axial tilt", correct: true },
      { id: "b", text: "Distance from the Sun", correct: false },
      { id: "c", text: "Moon phases", correct: false },
      { id: "d", text: "Eclipses", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "On an equinox…", options: [
      { id: "a", text: "Day and night are nearly equal", correct: true },
      { id: "b", text: "The day is longest", correct: false },
      { id: "c", text: "The Moon is full", correct: false },
      { id: "d", text: "The Sun doesn't rise", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Earth is closest to the Sun during…", options: [
      { id: "a", text: "Early January (N. Hemisphere winter)", correct: true },
      { id: "b", text: "Mid-summer in the north", correct: false },
      { id: "c", text: "The spring equinox", correct: false },
      { id: "d", text: "An eclipse", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "Why does most of Earth get two high tides a day?", options: [
      { id: "a", text: "Two ocean bulges — one toward the Moon, one on the far side", correct: true },
      { id: "b", text: "The Moon orbits twice a day", correct: false },
      { id: "c", text: "The Sun makes one and the Moon the other", correct: false },
      { id: "d", text: "Tides aren't related to the Moon", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "Spring tides (the largest range) occur at…", options: [
      { id: "a", text: "New and full moon", correct: true },
      { id: "b", text: "The quarter moons", correct: false },
      { id: "c", text: "Only in springtime", correct: false },
      { id: "d", text: "During eclipses only", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "The earliest sunset in the Northern Hemisphere falls…", options: [
      { id: "a", text: "About two weeks before the winter solstice", correct: true },
      { id: "b", text: "Exactly on the winter solstice", correct: false },
      { id: "c", text: "On the summer solstice", correct: false },
      { id: "d", text: "On the spring equinox", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "The difference between sundial time and clock time is called…", options: [
      { id: "a", text: "The equation of time", correct: true },
      { id: "b", text: "The synodic month", correct: false },
      { id: "c", text: "A solstice", correct: false },
      { id: "d", text: "An eclipse", correct: false },
    ] },
    { id: "f15", type: "mcq", prompt: "The new moon traditionally signals…", options: [
      { id: "a", text: "Intention and fresh starts", correct: true },
      { id: "b", text: "Culmination", correct: false },
      { id: "c", text: "Final harvest", correct: false },
      { id: "d", text: "Nothing", correct: false },
    ] },
    { id: "f16", type: "mcq", prompt: "The full moon traditionally signals…", options: [
      { id: "a", text: "Culmination and release", correct: true },
      { id: "b", text: "New beginnings", correct: false },
      { id: "c", text: "Deep rest", correct: false },
      { id: "d", text: "Planting seeds", correct: false },
    ] },
    { id: "f17", type: "mcq", prompt: "A 'gibbous' moon is…", options: [
      { id: "a", text: "More than half lit but not yet full", correct: true },
      { id: "b", text: "Less than half lit", correct: false },
      { id: "c", text: "Completely dark", correct: false },
      { id: "d", text: "Exactly half lit", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "Which planet rules Monday?", options: [
      { id: "a", text: "The Moon", correct: true },
      { id: "b", text: "Mars", correct: false },
      { id: "c", text: "Venus", correct: false },
      { id: "d", text: "Saturn", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "Friday is traditionally ruled by…", options: [
      { id: "a", text: "Venus", correct: true },
      { id: "b", text: "Jupiter", correct: false },
      { id: "c", text: "Mercury", correct: false },
      { id: "d", text: "The Sun", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "The Wheel of the Year has…", options: [
      { id: "a", text: "Eight festivals", correct: true },
      { id: "b", text: "Four festivals", correct: false },
      { id: "c", text: "Twelve festivals", correct: false },
      { id: "d", text: "Two festivals", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "Which falls on the winter solstice?", options: [
      { id: "a", text: "Yule", correct: true },
      { id: "b", text: "Beltane", correct: false },
      { id: "c", text: "Samhain", correct: false },
      { id: "d", text: "Imbolc", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "'Cross-quarter' days fall…", options: [
      { id: "a", text: "Midway between the solstices and equinoxes", correct: true },
      { id: "b", text: "On full moons", correct: false },
      { id: "c", text: "On the equinoxes", correct: false },
      { id: "d", text: "On new moons", correct: false },
    ] },
    { id: "f23", type: "mcq", prompt: "An ephemeris is…", options: [
      { id: "a", text: "A day-by-day table of Sun, Moon, and planet positions", correct: true },
      { id: "b", text: "A year-ahead weather forecast", correct: false },
      { id: "c", text: "A list of lucky days", correct: false },
      { id: "d", text: "A constellation map", correct: false },
    ] },
    { id: "f24", type: "mcq", prompt: "What does research say about lunar gardening?", options: [
      { id: "a", text: "No reliable evidence the moon's phase affects plant growth", correct: true },
      { id: "b", text: "It strongly boosts yields", correct: false },
      { id: "c", text: "Moonlight matches sunlight", correct: false },
      { id: "d", text: "It's been definitively proven", correct: false },
    ] },
    { id: "f25", type: "true-false", prompt: "The astronomy behind phases, eclipses, seasons, and tides is real and exact.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f26", type: "true-false", prompt: "The meanings attached to moon phases are tradition, not proven mechanisms.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f27", type: "true-false", prompt: "It is safe to look directly at a solar eclipse without eye protection.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f28", type: "true-false", prompt: "There is a permanently 'dark side' of the Moon that never receives sunlight.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
  ],
};
