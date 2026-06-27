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
    { module: "The Real Sky", lessons: ["Why moon phases happen", "Why eclipses happen", "Solstices, equinoxes & the seasons"] },
    { module: "Lunar Living", lessons: ["The 8 moon phases & their meanings", "Planetary days & hours", "The Wheel of the Year"] },
    { module: "Folklore & Evidence", lessons: ["Gardening by the moon", "Building your own almanac rhythm"] },
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
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The Moon doesn't make its own light — it reflects the Sun. As the Moon orbits Earth (about every 29.5 days), we see different amounts of its sunlit half. That changing view is the cycle of phases." },
            { kind: "list", items: [
              "**New moon** — the Moon is between Earth and Sun, so its lit side faces away from us (it looks dark).",
              "**Full moon** — Earth is between the Moon and Sun, so we see the whole lit face.",
              "**Quarters** — we see half the lit face, as the Moon sits at a right angle to the Sun from our view.",
            ] },
            { kind: "callout", tone: "history", title: "The same face, always", text: "The Moon is 'tidally locked' to Earth — it rotates once per orbit — so we always see the same face. The phases aren't Earth's shadow on the Moon (that's an eclipse); they're just how much of the sunlit side is turned toward us." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Moon phases are caused by…", options: [
              { id: "a", text: "How much of the Moon's sunlit half faces Earth as it orbits", correct: true, explanation: "Correct — it's our changing view of the lit side." },
              { id: "b", text: "Earth's shadow falling on the Moon", correct: false, explanation: "That's a lunar eclipse, not the monthly phases." },
              { id: "c", text: "The Moon producing its own light", correct: false, explanation: "The Moon only reflects sunlight." },
            ] },
            { id: "q2", type: "mcq", prompt: "At a new moon, the Moon is…", options: [
              { id: "a", text: "Between Earth and the Sun, with its lit side facing away", correct: true, explanation: "Yes — so it appears dark to us." },
              { id: "b", text: "On the far side of Earth from the Sun", correct: false, explanation: "That's a full moon." },
              { id: "c", text: "In Earth's shadow", correct: false, explanation: "That would be an eclipse." },
            ] },
            { id: "q3", type: "true-false", prompt: "We always see the same face of the Moon.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the Moon is tidally locked to Earth." },
              { id: "f", text: "False", correct: false, explanation: "We do — it rotates once per orbit." },
            ] },
          ],
        },
        {
          id: "l2-eclipses",
          title: "Why eclipses happen",
          objective: "Distinguish solar and lunar eclipses and why they're not monthly.",
          estMinutes: 4,
          blocks: [
            { kind: "table", headers: ["Eclipse", "What happens", "Occurs at"], rows: [
              ["Solar", "The Moon passes between Sun and Earth, casting a shadow on Earth", "A new moon"],
              ["Lunar", "Earth passes between Sun and Moon, casting its shadow on the Moon", "A full moon"],
            ] },
            { kind: "callout", tone: "history", title: "Why not every month?", text: "The Moon's orbit is tilted about 5° from Earth's orbit around the Sun. Most months the Moon passes a little above or below the Sun–Earth line, so there's no eclipse. Eclipses only happen when a new or full moon lines up near the crossing points (the 'nodes')." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A solar eclipse happens when…", options: [
              { id: "a", text: "The Moon passes between the Sun and Earth (at a new moon)", correct: true, explanation: "Correct — the Moon's shadow falls on Earth." },
              { id: "b", text: "Earth passes between the Sun and Moon", correct: false, explanation: "That's a lunar eclipse." },
              { id: "c", text: "The Moon glows red on its own", correct: false, explanation: "The Moon doesn't glow on its own." },
            ] },
            { id: "q2", type: "mcq", prompt: "A lunar eclipse occurs at…", options: [
              { id: "a", text: "A full moon, when Earth's shadow falls on the Moon", correct: true, explanation: "Yes — Earth between Sun and Moon." },
              { id: "b", text: "A new moon", correct: false, explanation: "That's when solar eclipses can occur." },
              { id: "c", text: "Any random night", correct: false, explanation: "It requires a specific alignment at full moon." },
            ] },
            { id: "q3", type: "mcq", prompt: "Why isn't there an eclipse every month?", options: [
              { id: "a", text: "The Moon's orbit is tilted, so it usually misses the Sun–Earth line", correct: true, explanation: "Correct — alignment only happens near the nodes." },
              { id: "b", text: "The Moon disappears some months", correct: false, explanation: "It doesn't disappear; it's just misaligned." },
              { id: "c", text: "Clouds block it", correct: false, explanation: "It's about orbital geometry, not weather." },
            ] },
          ],
        },
        {
          id: "l3-seasons",
          title: "Solstices, equinoxes & the seasons",
          objective: "Explain what causes the seasons and what equinoxes and solstices are.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "history", title: "It's the tilt, not the distance", text: "Seasons happen because Earth's axis is tilted about 23.5°. As Earth orbits the Sun, each hemisphere tilts toward the Sun (summer) or away (winter). It's not about Earth being closer to the Sun." },
            { kind: "table", headers: ["Event", "What it is"], rows: [
              ["Equinox (spring & autumn)", "The Sun is over the equator; day and night are nearly equal everywhere"],
              ["Summer solstice", "The longest day — your hemisphere is tilted most toward the Sun"],
              ["Winter solstice", "The shortest day — your hemisphere is tilted most away from the Sun"],
            ] },
            { kind: "text", text: "These four points anchor the solar year and many seasonal traditions — they're the astronomical backbone behind festivals worldwide." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The seasons are caused by…", options: [
              { id: "a", text: "Earth's axial tilt (~23.5°)", correct: true, explanation: "Correct — the tilt, as Earth orbits the Sun." },
              { id: "b", text: "Earth getting closer to and farther from the Sun", correct: false, explanation: "Distance isn't the main cause; tilt is." },
              { id: "c", text: "The Moon's phases", correct: false, explanation: "The Moon doesn't drive the seasons." },
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
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Lunar Living",
      lessons: [
        {
          id: "l4-eight-phases",
          title: "The 8 moon phases & their meanings",
          objective: "Name the 8 phases and their traditional themes.",
          estMinutes: 5,
          blocks: [
            { kind: "table", headers: ["Phase", "Traditional theme"], rows: [
              ["New moon", "Intention, fresh starts, planting seeds"],
              ["Waxing crescent", "First steps, hope, building"],
              ["First quarter", "Decision, action, pushing through"],
              ["Waxing gibbous", "Refinement, adjustment, almost there"],
              ["Full moon", "Culmination, clarity, release, celebration"],
              ["Waning gibbous", "Gratitude, sharing, giving back"],
              ["Last quarter", "Letting go, forgiveness, clearing"],
              ["Waning crescent", "Rest, reflection, surrender before renewal"],
            ] },
            { kind: "callout", tone: "tradition", title: "A rhythm of build and release", text: "The waxing half (new → full) is traditionally for building and growing; the waning half (full → new) is for releasing and resting. Many people set intentions at the new moon and reflect or let go at the full moon." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The new moon is traditionally a time for…", options: [
              { id: "a", text: "Setting intentions and fresh starts", correct: true, explanation: "Correct — planting seeds for the cycle." },
              { id: "b", text: "Celebrating culmination", correct: false, explanation: "That's the full moon." },
              { id: "c", text: "Nothing in particular", correct: false, explanation: "It marks the start of the cycle." },
            ] },
            { id: "q2", type: "mcq", prompt: "The waxing half of the cycle (new → full) is for…", options: [
              { id: "a", text: "Building and growing", correct: true, explanation: "Yes — energy is 'increasing.'" },
              { id: "b", text: "Releasing and resting", correct: false, explanation: "That's the waning half." },
              { id: "c", text: "Eclipses only", correct: false, explanation: "Eclipses are separate events." },
            ] },
            { id: "q3", type: "mcq", prompt: "The full moon is traditionally associated with…", options: [
              { id: "a", text: "Culmination, clarity, and release", correct: true, explanation: "Correct — the peak of the cycle." },
              { id: "b", text: "Brand-new beginnings", correct: false, explanation: "That's the new moon." },
              { id: "c", text: "Deep rest before renewal", correct: false, explanation: "That's the waning crescent." },
            ] },
          ],
        },
        {
          id: "l5-planetary-days",
          title: "Planetary days & hours",
          objective: "Recall which planet rules each day of the week.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "An old tradition assigns each day of the week to a 'ruling' planet — and the day names still carry it. Each planet lends the day a flavor used for timing rituals and tasks." },
            { kind: "table", headers: ["Day", "Planet", "Theme"], rows: [
              ["Sunday", "Sun", "Vitality, success, self"],
              ["Monday", "Moon", "Emotion, home, intuition"],
              ["Tuesday", "Mars", "Energy, courage, action"],
              ["Wednesday", "Mercury", "Communication, learning"],
              ["Thursday", "Jupiter", "Growth, luck, abundance"],
              ["Friday", "Venus", "Love, beauty, money"],
              ["Saturday", "Saturn", "Discipline, boundaries, endings"],
            ] },
            { kind: "callout", tone: "tradition", title: "Planetary hours", text: "The tradition goes further, dividing each day and night into 'planetary hours' that cycle through the planets in the old Chaldean order. It's a niche timing practice — the day rulers above are the part most people use." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which planet rules Monday?", options: [
              { id: "a", text: "The Moon", correct: true, explanation: "Correct — 'Monday' literally means Moon-day." },
              { id: "b", text: "Mars", correct: false, explanation: "Mars rules Tuesday." },
              { id: "c", text: "Saturn", correct: false, explanation: "Saturn rules Saturday." },
            ] },
            { id: "q2", type: "mcq", prompt: "Friday is traditionally ruled by…", options: [
              { id: "a", text: "Venus (love, beauty, money)", correct: true, explanation: "Yes — a day for Venusian themes." },
              { id: "b", text: "Jupiter", correct: false, explanation: "Jupiter rules Thursday." },
              { id: "c", text: "Mercury", correct: false, explanation: "Mercury rules Wednesday." },
            ] },
            { id: "q3", type: "mcq", prompt: "The day names of the week come partly from…", options: [
              { id: "a", text: "The planets assigned to each day", correct: true, explanation: "Correct — Sun-day, Moon-day, Saturn-day, etc." },
              { id: "b", text: "Random choice", correct: false, explanation: "They trace to planetary rulers." },
              { id: "c", text: "The phases of the Moon", correct: false, explanation: "It's the planets, not lunar phases." },
            ] },
          ],
        },
        {
          id: "l6-wheel-of-year",
          title: "The Wheel of the Year",
          objective: "Describe the eight festivals of the seasonal wheel.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The 'Wheel of the Year' is a modern seasonal calendar (drawn from older European traditions) of eight festivals: the four solar points plus four 'cross-quarter' days that fall between them." },
            { kind: "table", headers: ["Festival", "Roughly when", "Marks"], rows: [
              ["Yule", "Winter solstice", "The longest night; the return of the light"],
              ["Imbolc", "Early February", "First stirrings of spring"],
              ["Ostara", "Spring equinox", "Balance, new growth"],
              ["Beltane", "Early May", "Fertility, passion, bloom"],
              ["Litha", "Summer solstice", "Peak light and abundance"],
              ["Lughnasadh", "Early August", "First harvest"],
              ["Mabon", "Autumn equinox", "Second harvest, gratitude, balance"],
              ["Samhain", "Late October", "Final harvest; honoring the dead"],
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The Wheel of the Year has how many festivals?", options: [
              { id: "a", text: "Eight", correct: true, explanation: "Four solar points + four cross-quarter days." },
              { id: "b", text: "Four", correct: false, explanation: "There are eight in total." },
              { id: "c", text: "Twelve", correct: false, explanation: "That's months/zodiac, not the wheel." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which festival falls on the winter solstice?", options: [
              { id: "a", text: "Yule", correct: true, explanation: "Correct — the longest night." },
              { id: "b", text: "Beltane", correct: false, explanation: "Beltane is early May." },
              { id: "c", text: "Mabon", correct: false, explanation: "Mabon is the autumn equinox." },
            ] },
            { id: "q3", type: "mcq", prompt: "'Cross-quarter' days fall…", options: [
              { id: "a", text: "Between the solstices and equinoxes", correct: true, explanation: "Yes — the midpoints of the seasons." },
              { id: "b", text: "Only on full moons", correct: false, explanation: "They're solar/seasonal, not lunar." },
              { id: "c", text: "On the equinoxes themselves", correct: false, explanation: "Those are the quarter days, not cross-quarter." },
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
          id: "l7-moon-gardening",
          title: "Gardening by the moon",
          objective: "Weigh the tradition of lunar gardening against the evidence.",
          estMinutes: 4,
          blocks: [
            { kind: "callout", tone: "tradition", title: "The tradition", text: "Moon gardening times planting and harvesting to the lunar cycle — for example, sowing 'above-ground' crops as the moon waxes and 'root' crops as it wanes. It's an old and widespread folk practice." },
            { kind: "callout", tone: "evidence", title: "What the evidence says", text: "Controlled studies have not found reliable evidence that the moon's phase affects plant growth (beyond the Moon's real effect on ocean tides). Moonlight is roughly 100–1,000× dimmer than sunlight, far too weak to drive growth. What actually matters is soil, water, temperature, light, and timing of the real seasons." },
            { kind: "callout", tone: "tip", title: "So is it useless?", text: "Not necessarily — as a gentle scheduling rhythm and a way to stay connected to the sky, moon gardening can be a lovely practice. Just hold the 'it makes plants grow better' claim loosely, and let the real garden science do the heavy lifting." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "What does controlled research say about lunar gardening?", options: [
              { id: "a", text: "No reliable evidence the moon's phase affects plant growth", correct: true, explanation: "Correct — beyond tides, no demonstrated effect." },
              { id: "b", text: "It dramatically increases yields", correct: false, explanation: "Studies don't support that." },
              { id: "c", text: "Moonlight is as strong as sunlight", correct: false, explanation: "Moonlight is 100–1,000× dimmer." },
            ] },
            { id: "q2", type: "mcq", prompt: "What actually drives plant growth?", options: [
              { id: "a", text: "Soil, water, temperature, light, and the real seasons", correct: true, explanation: "Yes — the measurable factors." },
              { id: "b", text: "The phase of the moon", correct: false, explanation: "No reliable evidence for that." },
              { id: "c", text: "The day of the week", correct: false, explanation: "Not a factor in plant biology." },
            ] },
            { id: "q3", type: "true-false", prompt: "Moon gardening can still be a pleasant scheduling rhythm, even without a proven growth effect.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — enjoy the rhythm; hold the growth claim loosely." },
              { id: "f", text: "False", correct: false, explanation: "It can be a nice practice regardless of the evidence." },
            ] },
          ],
        },
        {
          id: "l8-almanac-rhythm",
          title: "Building your own almanac rhythm",
          objective: "Use the lunar and seasonal calendar as a personal rhythm, honestly.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "An almanac practice is really about rhythm: using the predictable cycles of the sky as gentle anchors for reflection, planning, and ritual." },
            { kind: "list", ordered: true, items: [
              "At the **new moon**, set an intention or start something small.",
              "At the **full moon**, take stock — celebrate, or release what isn't working.",
              "At the **solstices and equinoxes**, pause to mark the turning season.",
              "Let the **day rulers** lightly theme your week if you enjoy it.",
            ] },
            { kind: "callout", tone: "tip", title: "Keep it grounded", text: "The astronomy (phases, eclipses, seasons) is real and exact — a beautiful, reliable clock. The meanings you attach are tradition and personal ritual, not mechanism. Used that way, an almanac rhythm is a meaningful structure, not a forecast." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "An almanac practice is best understood as…", options: [
              { id: "a", text: "A rhythm of reflection and ritual anchored to real sky cycles", correct: true, explanation: "Yes — structure and meaning, not prediction." },
              { id: "b", text: "A way to predict the future precisely", correct: false, explanation: "It's a rhythm, not a forecast." },
              { id: "c", text: "A replacement for a calendar app", correct: false, explanation: "It's about meaning, not scheduling logistics." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which part of an almanac practice is literally real and exact?", options: [
              { id: "a", text: "The astronomy — phases, eclipses, and seasons", correct: true, explanation: "Correct — a reliable celestial clock." },
              { id: "b", text: "The predictive meaning of each phase", correct: false, explanation: "That's tradition, not mechanism." },
              { id: "c", text: "Nothing is real", correct: false, explanation: "The astronomy is genuinely precise." },
            ] },
            { id: "q3", type: "true-false", prompt: "The meanings attached to moon phases are tradition and personal ritual, not proven mechanisms.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — hold them as meaningful ritual, not forecast." },
              { id: "f", text: "False", correct: false, explanation: "They're symbolic tradition, not mechanism." },
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
    { id: "f3", type: "mcq", prompt: "A solar eclipse happens at…", options: [
      { id: "a", text: "A new moon, when the Moon is between Sun and Earth", correct: true },
      { id: "b", text: "A full moon", correct: false },
      { id: "c", text: "Any night", correct: false },
      { id: "d", text: "An equinox", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "A lunar eclipse happens at…", options: [
      { id: "a", text: "A full moon, when Earth's shadow falls on the Moon", correct: true },
      { id: "b", text: "A new moon", correct: false },
      { id: "c", text: "A solstice", correct: false },
      { id: "d", text: "First quarter", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "Why isn't there an eclipse every month?", options: [
      { id: "a", text: "The Moon's orbit is tilted, so it usually misses the alignment", correct: true },
      { id: "b", text: "The Moon vanishes", correct: false },
      { id: "c", text: "Eclipses are random", correct: false },
      { id: "d", text: "The Sun moves", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "The seasons are caused by…", options: [
      { id: "a", text: "Earth's axial tilt", correct: true },
      { id: "b", text: "Distance from the Sun", correct: false },
      { id: "c", text: "Moon phases", correct: false },
      { id: "d", text: "Eclipses", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "On an equinox…", options: [
      { id: "a", text: "Day and night are nearly equal", correct: true },
      { id: "b", text: "The day is longest", correct: false },
      { id: "c", text: "The Moon is full", correct: false },
      { id: "d", text: "The Sun doesn't rise", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "The new moon traditionally signals…", options: [
      { id: "a", text: "Intention and fresh starts", correct: true },
      { id: "b", text: "Culmination", correct: false },
      { id: "c", text: "Final harvest", correct: false },
      { id: "d", text: "Nothing", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "The full moon traditionally signals…", options: [
      { id: "a", text: "Culmination and release", correct: true },
      { id: "b", text: "New beginnings", correct: false },
      { id: "c", text: "Deep rest", correct: false },
      { id: "d", text: "Planting seeds", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Which planet rules Monday?", options: [
      { id: "a", text: "The Moon", correct: true },
      { id: "b", text: "Mars", correct: false },
      { id: "c", text: "Venus", correct: false },
      { id: "d", text: "Saturn", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "Friday is traditionally ruled by…", options: [
      { id: "a", text: "Venus", correct: true },
      { id: "b", text: "Jupiter", correct: false },
      { id: "c", text: "Mercury", correct: false },
      { id: "d", text: "The Sun", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "The Wheel of the Year has…", options: [
      { id: "a", text: "Eight festivals", correct: true },
      { id: "b", text: "Four festivals", correct: false },
      { id: "c", text: "Twelve festivals", correct: false },
      { id: "d", text: "Two festivals", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "Which falls on the winter solstice?", options: [
      { id: "a", text: "Yule", correct: true },
      { id: "b", text: "Beltane", correct: false },
      { id: "c", text: "Samhain", correct: false },
      { id: "d", text: "Imbolc", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "What does research say about lunar gardening?", options: [
      { id: "a", text: "No reliable evidence the moon's phase affects plant growth", correct: true },
      { id: "b", text: "It strongly boosts yields", correct: false },
      { id: "c", text: "Moonlight matches sunlight", correct: false },
      { id: "d", text: "It's been definitively proven", correct: false },
    ] },
    { id: "f15", type: "true-false", prompt: "The astronomy behind phases, eclipses, and seasons is real and exact.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f16", type: "true-false", prompt: "The meanings attached to moon phases are tradition, not proven mechanisms.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
