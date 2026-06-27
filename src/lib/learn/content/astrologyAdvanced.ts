import type { Course } from "../types";

/** FLAGSHIP #13 — Astrology, Advanced. Timing techniques and relationship astrology. */
export const astrologyAdvanced: Course = {
  id: "astrology-advanced",
  domain: "astrology",
  title: "Astrology, Advanced",
  subtitle: "Timing, transits, and relationships",
  level: "advanced",
  icon: "♆",
  summary:
    "Work with time and other people: transits, progressions, returns, profections, synastry, and composite charts.",
  estMinutes: 50,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "Timing", lessons: ["Transits", "Secondary progressions", "Returns", "Annual profections"] },
    { module: "Relationships", lessons: ["Synastry", "Composite charts", "Reading relationships ethically"] },
  ],

  modules: [
    {
      id: "m1",
      title: "Timing",
      lessons: [
        {
          id: "l1-transits",
          title: "Transits",
          objective: "Explain what transits are and why outer-planet transits matter most.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Your natal chart is fixed, but the real planets keep moving. A 'transit' is a current planet forming an aspect to a point in your birth chart — the live sky meeting your fixed map. Transits are the main way astrologers read timing." },
            { kind: "callout", tone: "tip", title: "The outer planets write the chapters", text: "Fast planets (Moon, Mercury, Venus) make brief, day-to-day transits. The slow outer planets — Jupiter, Saturn, Uranus, Neptune, Pluto — linger for months or years, and their transits mark major life chapters. The famous 'Saturn return' (Saturn returning to its birth position around age 29–30) is a transit that reliably coincides with a big growing-up passage." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A transit is…", options: [
              { id: "a", text: "A current planet aspecting a point in your natal chart", correct: true, explanation: "Correct — the live sky meeting your fixed chart." },
              { id: "b", text: "A planet leaving the solar system", correct: false, explanation: "Nothing leaves; it's about current positions." },
              { id: "c", text: "A fixed point in your birth chart", correct: false, explanation: "That's the natal chart; transits are the moving part." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which transits mark major life chapters?", options: [
              { id: "a", text: "The slow outer planets (Jupiter–Pluto)", correct: true, explanation: "Yes — they linger for months or years." },
              { id: "b", text: "The fast Moon transits", correct: false, explanation: "Those are brief, day-to-day." },
              { id: "c", text: "None — transits don't matter", correct: false, explanation: "Transits are the core of timing." },
            ] },
            { id: "q3", type: "mcq", prompt: "The 'Saturn return' happens around age…", options: [
              { id: "a", text: "29–30", correct: true, explanation: "Correct — Saturn returns to its birth position." },
              { id: "b", text: "5", correct: false, explanation: "Far too early for a Saturn return." },
              { id: "c", text: "75", correct: false, explanation: "The first return is around 29–30." },
            ] },
          ],
        },
        {
          id: "l2-progressions",
          title: "Secondary progressions",
          objective: "Describe the day-for-a-year progression method.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Progressions are a symbolic timing technique. The most common, 'secondary progressions,' use a simple key: each day after your birth corresponds to one year of your life. So the planetary positions 30 days after you were born describe your 30th year." },
            { kind: "callout", tone: "tip", title: "The slow inner unfolding", text: "Where transits are the weather outside, progressions are your inner evolution. The progressed Moon is especially useful — it moves through a new sign about every 2.5 years, marking shifting emotional seasons. A change of progressed Sun sign (roughly every 30 years) signals a major maturing of identity." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In secondary progressions, one day after birth equals…", options: [
              { id: "a", text: "One year of life", correct: true, explanation: "Correct — the day-for-a-year key." },
              { id: "b", text: "One month of life", correct: false, explanation: "It's a day for a year." },
              { id: "c", text: "One decade", correct: false, explanation: "A day maps to a single year." },
            ] },
            { id: "q2", type: "mcq", prompt: "Progressions are best thought of as…", options: [
              { id: "a", text: "Your slow inner evolution", correct: true, explanation: "Yes — versus transits as outer 'weather.'" },
              { id: "b", text: "Daily news headlines", correct: false, explanation: "That's more like fast transits." },
              { id: "c", text: "A fixed birth snapshot", correct: false, explanation: "That's the natal chart." },
            ] },
            { id: "q3", type: "mcq", prompt: "The progressed Moon changes sign about every…", options: [
              { id: "a", text: "2.5 years", correct: true, explanation: "Correct — marking emotional seasons." },
              { id: "b", text: "2.5 days", correct: false, explanation: "That's the real Moon, not the progressed one." },
              { id: "c", text: "30 years", correct: false, explanation: "That's closer to the progressed Sun." },
            ] },
          ],
        },
        {
          id: "l3-returns",
          title: "Returns",
          objective: "Explain solar and lunar return charts.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "A 'return' chart is cast for the moment a planet comes back to its exact natal position." },
            { kind: "list", items: [
              "**Solar return** — when the Sun returns to its exact birth degree (around your birthday). The chart for that moment is read as a preview of the year ahead.",
              "**Lunar return** — when the Moon returns to its natal position (about every 27–28 days), read as the theme of the coming month.",
            ] },
            { kind: "callout", tone: "tip", title: "A fresh chart for a cycle", text: "Returns give you a brand-new chart to read for a defined period — the solar return for your personal year, the lunar return for your emotional month — layered on top of your unchanging natal chart." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A solar return chart is cast for…", options: [
              { id: "a", text: "When the Sun returns to its exact birth degree (≈ your birthday)", correct: true, explanation: "Correct — a preview of the year ahead." },
              { id: "b", text: "Every new moon", correct: false, explanation: "That's unrelated to your solar return." },
              { id: "c", text: "Your half-birthday only", correct: false, explanation: "It's the exact solar return, near your birthday." },
            ] },
            { id: "q2", type: "mcq", prompt: "A lunar return happens about every…", options: [
              { id: "a", text: "27–28 days", correct: true, explanation: "Yes — the Moon returns to its natal spot monthly." },
              { id: "b", text: "Year", correct: false, explanation: "That's the solar return." },
              { id: "c", text: "Decade", correct: false, explanation: "Far too long for a lunar cycle." },
            ] },
            { id: "q3", type: "true-false", prompt: "A solar return chart is read as a preview of the year ahead.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — your personal year chart." },
              { id: "f", text: "False", correct: false, explanation: "That's exactly how it's used." },
            ] },
          ],
        },
        {
          id: "l4-profections",
          title: "Annual profections",
          objective: "Use annual profections to find the year's emphasis.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Profections are an elegant traditional timing method. Each year of life advances the emphasis by one house: your 1st year of life highlights the 1st house, your 2nd the 2nd house, and so on, cycling back to the 1st house every 12 years (ages 0, 12, 24, 36… are all 1st-house years)." },
            { kind: "callout", tone: "tip", title: "The 'lord of the year'", text: "The planet that rules the sign on the profected house becomes the year's 'time-lord' — the planet running the show for those twelve months. Transits to it, and its own condition, color the year. It's a simple way to know which area of life and which planet are emphasized." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In annual profections, each year advances the emphasis by…", options: [
              { id: "a", text: "One house", correct: true, explanation: "Correct — 1st-house year, then 2nd, and so on." },
              { id: "b", text: "One sign of the zodiac at random", correct: false, explanation: "It's house-by-house from the Ascendant." },
              { id: "c", text: "One planet you choose", correct: false, explanation: "It's determined by age, not choice." },
            ] },
            { id: "q2", type: "mcq", prompt: "Ages 0, 12, 24, and 36 are all…", options: [
              { id: "a", text: "1st-house years (the cycle repeats every 12)", correct: true, explanation: "Yes — profections cycle every twelve years." },
              { id: "b", text: "10th-house years", correct: false, explanation: "Those would be different ages in the cycle." },
              { id: "c", text: "Random", correct: false, explanation: "It's a fixed 12-year cycle." },
            ] },
            { id: "q3", type: "mcq", prompt: "The 'lord of the year' is…", options: [
              { id: "a", text: "The planet ruling the sign on the profected house", correct: true, explanation: "Correct — the year's emphasized planet." },
              { id: "b", text: "Always the Sun", correct: false, explanation: "It depends on the profected house's ruler." },
              { id: "c", text: "Whichever planet is brightest", correct: false, explanation: "Brightness isn't the criterion." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Relationships",
      lessons: [
        {
          id: "l5-synastry",
          title: "Synastry",
          objective: "Explain how synastry compares two charts.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Synastry is the comparison of two people's birth charts to understand their connection. You look at how each person's planets aspect the other's, and where one person's planets land in the other's houses." },
            { kind: "list", items: [
              "**Cross-aspects** — e.g., your Venus trine their Mars suggests easy attraction; your Saturn square their Sun can feel restrictive or grounding, depending.",
              "**House overlays** — where their planets fall in your houses shows which areas of your life they 'light up' (e.g., someone's Sun in your 7th house feels partnership-flavored).",
              "**Key players** — Sun, Moon, Venus, Mars, and the Ascendant rulers carry the most weight in relationship comparison.",
            ] },
            { kind: "callout", tone: "tip", title: "Both charts, no shortcuts", text: "Good synastry weighs the whole picture — harmonious and challenging contacts together — rather than declaring a match 'good' or 'bad' from one aspect." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Synastry is…", options: [
              { id: "a", text: "Comparing two people's charts to understand their connection", correct: true, explanation: "Correct — the astrology of relationships." },
              { id: "b", text: "A single person's yearly forecast", correct: false, explanation: "That's more like a solar return." },
              { id: "c", text: "A house system", correct: false, explanation: "It's a comparison technique." },
            ] },
            { id: "q2", type: "mcq", prompt: "A 'house overlay' in synastry shows…", options: [
              { id: "a", text: "Where one person's planets fall in the other's houses", correct: true, explanation: "Yes — which life areas they activate." },
              { id: "b", text: "The exact wedding date", correct: false, explanation: "Astrology doesn't fix that." },
              { id: "c", text: "Who is 'right' in an argument", correct: false, explanation: "Not what synastry does." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which planets carry the most weight in synastry?", options: [
              { id: "a", text: "Sun, Moon, Venus, Mars, and the Ascendant rulers", correct: true, explanation: "Correct — the personal, relationship-relevant points." },
              { id: "b", text: "Only Pluto", correct: false, explanation: "Outer planets matter but aren't the whole story." },
              { id: "c", text: "None of them", correct: false, explanation: "These are exactly the key players." },
            ] },
          ],
        },
        {
          id: "l6-composite",
          title: "Composite charts",
          objective: "Explain what a composite chart represents.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Where synastry compares two separate charts, a composite chart creates a single new chart for the relationship itself. The most common method takes the midpoints between each pair of planets (the midpoint of the two Suns becomes the composite Sun, and so on)." },
            { kind: "callout", tone: "tip", title: "The relationship as its own being", text: "The composite chart is read like a birth chart — but for the partnership as an entity: its purpose (composite Sun), its emotional tone (composite Moon), how it relates (composite Venus), and the area of life it centers on (the house emphasis). It describes the relationship, not either individual." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A composite chart represents…", options: [
              { id: "a", text: "The relationship itself, as a single entity", correct: true, explanation: "Correct — not either person alone." },
              { id: "b", text: "Only the older partner", correct: false, explanation: "It's the blend, not one person." },
              { id: "c", text: "A yearly forecast", correct: false, explanation: "That's a return chart." },
            ] },
            { id: "q2", type: "mcq", prompt: "The common composite method uses…", options: [
              { id: "a", text: "The midpoints between each pair of planets", correct: true, explanation: "Yes — e.g., the midpoint of the two Suns." },
              { id: "b", text: "Only the first person's planets", correct: false, explanation: "It blends both via midpoints." },
              { id: "c", text: "Random positions", correct: false, explanation: "It's a precise midpoint calculation." },
            ] },
            { id: "q3", type: "true-false", prompt: "A composite chart is read much like a birth chart, but for the partnership.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the relationship as its own 'being.'" },
              { id: "f", text: "False", correct: false, explanation: "That's exactly how it's read." },
            ] },
          ],
        },
        {
          id: "l7-ethics",
          title: "Reading relationships ethically",
          objective: "Apply an ethical, non-fatalistic approach to relationship astrology.",
          estMinutes: 4,
          blocks: [
            { kind: "callout", tone: "tip", title: "No 'doomed' or 'destined'", text: "Charts show tendencies and dynamics, not verdicts. Avoid telling people a relationship is 'doomed' or 'meant to be' — challenging aspects describe growth edges, and easy ones can be taken for granted. People always have agency and choice." },
            { kind: "callout", tone: "culture", title: "Consent & privacy", text: "Reading someone else's chart — or a relationship — involves another person's data and life. Get consent where you can, hold what you see with care, and never use astrology to control, pressure, or pathologize someone." },
            { kind: "callout", tone: "evidence", title: "Keep it grounded", text: "Relationship astrology is a lens for reflection and conversation, not a substitute for honest communication, therapy, or your own judgment about who is good for you." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "An ethical reading avoids…", options: [
              { id: "a", text: "Declaring a relationship 'doomed' or 'destined'", correct: true, explanation: "Correct — charts show tendencies, not verdicts." },
              { id: "b", text: "Considering both people's charts", correct: false, explanation: "That's good practice." },
              { id: "c", text: "Encouraging communication", correct: false, explanation: "That's encouraged." },
            ] },
            { id: "q2", type: "mcq", prompt: "When reading another person's chart, you should…", options: [
              { id: "a", text: "Seek consent and hold what you see with care", correct: true, explanation: "Yes — it's their data and life." },
              { id: "b", text: "Use it to pressure or control them", correct: false, explanation: "Never — that's an abuse of the tool." },
              { id: "c", text: "Share it publicly", correct: false, explanation: "Respect their privacy." },
            ] },
            { id: "q3", type: "true-false", prompt: "Relationship astrology can replace honest communication and good judgment.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's a lens for reflection, not a substitute." },
              { id: "f", text: "False", correct: true, explanation: "Correct — keep it grounded." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "A transit is…", options: [
      { id: "a", text: "A current planet aspecting your natal chart", correct: true },
      { id: "b", text: "A fixed birth point", correct: false },
      { id: "c", text: "A planet leaving the solar system", correct: false },
      { id: "d", text: "A house system", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "Which transits mark major life chapters?", options: [
      { id: "a", text: "The slow outer planets", correct: true },
      { id: "b", text: "Fast Moon transits", correct: false },
      { id: "c", text: "None", correct: false },
      { id: "d", text: "Only the Sun", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "The Saturn return is around age…", options: [
      { id: "a", text: "29–30", correct: true },
      { id: "b", text: "7", correct: false },
      { id: "c", text: "50", correct: false },
      { id: "d", text: "18", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "In secondary progressions, one day after birth equals…", options: [
      { id: "a", text: "One year of life", correct: true },
      { id: "b", text: "One month", correct: false },
      { id: "c", text: "One decade", correct: false },
      { id: "d", text: "One week", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "The progressed Moon changes sign about every…", options: [
      { id: "a", text: "2.5 years", correct: true },
      { id: "b", text: "2.5 days", correct: false },
      { id: "c", text: "30 years", correct: false },
      { id: "d", text: "1 month", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "A solar return chart is cast for…", options: [
      { id: "a", text: "When the Sun returns to its birth degree (≈ birthday)", correct: true },
      { id: "b", text: "Every new moon", correct: false },
      { id: "c", text: "Each Monday", correct: false },
      { id: "d", text: "The winter solstice", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "A lunar return happens about every…", options: [
      { id: "a", text: "27–28 days", correct: true },
      { id: "b", text: "Year", correct: false },
      { id: "c", text: "Decade", correct: false },
      { id: "d", text: "Week", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "In profections, each year advances the emphasis by…", options: [
      { id: "a", text: "One house", correct: true },
      { id: "b", text: "One random sign", correct: false },
      { id: "c", text: "One chosen planet", correct: false },
      { id: "d", text: "Nothing", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "The 'lord of the year' is…", options: [
      { id: "a", text: "The ruler of the sign on the profected house", correct: true },
      { id: "b", text: "Always the Sun", correct: false },
      { id: "c", text: "The brightest planet", correct: false },
      { id: "d", text: "Random", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Synastry is…", options: [
      { id: "a", text: "Comparing two charts to understand a connection", correct: true },
      { id: "b", text: "A yearly solo forecast", correct: false },
      { id: "c", text: "A house system", correct: false },
      { id: "d", text: "A transit", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "A house overlay shows…", options: [
      { id: "a", text: "Where one person's planets fall in another's houses", correct: true },
      { id: "b", text: "The wedding date", correct: false },
      { id: "c", text: "Who is right in a fight", correct: false },
      { id: "d", text: "Nothing", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "A composite chart represents…", options: [
      { id: "a", text: "The relationship itself, as one entity", correct: true },
      { id: "b", text: "Only one partner", correct: false },
      { id: "c", text: "A yearly forecast", correct: false },
      { id: "d", text: "A transit", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "The common composite method uses…", options: [
      { id: "a", text: "Midpoints between each pair of planets", correct: true },
      { id: "b", text: "Only the first person", correct: false },
      { id: "c", text: "Random positions", correct: false },
      { id: "d", text: "The Sun alone", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "An ethical relationship reading avoids…", options: [
      { id: "a", text: "Calling a relationship 'doomed' or 'destined'", correct: true },
      { id: "b", text: "Weighing both charts", correct: false },
      { id: "c", text: "Encouraging communication", correct: false },
      { id: "d", text: "Respecting privacy", correct: false },
    ] },
    { id: "f15", type: "true-false", prompt: "Charts show tendencies, not fixed verdicts about relationships.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f16", type: "true-false", prompt: "Reading another person's chart deserves consent and care.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
