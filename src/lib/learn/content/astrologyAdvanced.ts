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
    "Work with time and other people: transits, progressions, returns, profections, midpoints, harmonics, synastry, and composite charts.",
  estMinutes: 75,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,

  outline: [
    { module: "Timing", lessons: ["Transits", "Secondary progressions", "Returns", "Annual profections", "Time-lords & releasing"] },
    { module: "Advanced Techniques", lessons: ["Midpoints", "Harmonics"] },
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
          estMinutes: 7,
          blocks: [
            { kind: "text", text: "Your natal chart is fixed — a snapshot of the sky at your first breath. But the real planets keep moving. A 'transit' is a current planet forming an aspect to a point in your birth chart: the live sky meeting your fixed map. Transits are the primary way astrologers read timing, the moving hand against the still clock-face of the natal chart." },
            { kind: "text", text: "Because each planet moves at its own speed, transits come in very different sizes. The Moon laps the whole zodiac in about a month; Pluto takes roughly 248 years. So a Moon transit is a passing mood, while a Pluto transit can describe a multi-year transformation. Speed, not importance, is what makes a transit brief or weighty." },
            { kind: "callout", tone: "tip", title: "The outer planets write the chapters", text: "Fast planets (Moon, Mercury, Venus) make brief, day-to-day transits. The slow outer planets — Jupiter, Saturn, Uranus, Neptune, Pluto — linger for months or years, and their transits mark major life chapters. The famous 'Saturn return' (Saturn returning to its birth position around age 29–30) is a transit that reliably coincides with a big growing-up passage." },
            { kind: "table", headers: ["Planet", "Full zodiac cycle", "Typical transit feel"], rows: [
              ["Moon", "~27.3 days", "Passing mood, a day or two"],
              ["Sun", "~1 year", "Monthly emphasis as it crosses each house"],
              ["Jupiter", "~12 years", "A year of growth in one area"],
              ["Saturn", "~29.5 years", "Maturity tests; the Saturn return at ~29 & ~58"],
              ["Uranus", "~84 years", "Disruption & awakening; opposition at ~42 (midlife)"],
              ["Pluto", "~248 years", "Deep, slow transformation"],
            ] },
            { kind: "callout", tone: "history", title: "Why outer planets are 'modern'", text: "Uranus (1781), Neptune (1846), and Pluto (1930) were discovered far too recently for traditional astrology, which worked with the seven visible 'planets' (Sun through Saturn). Their meanings — sudden change, dissolution, transformation — were assigned by modern astrologers partly from the events surrounding their discovery." },
            { kind: "callout", tone: "tip", title: "Retrogrades and 'three passes'", text: "Because planets appear to slow, stop, and back up (retrograde) from Earth's vantage, a slow transit often crosses an exact aspect three times — direct, retrograde, then direct again. Astrologers read this as a theme that arrives, gets revisited, and is finally resolved over many months." },
            { kind: "keyfacts", items: [
              "Transit = a moving planet aspecting a fixed natal point.",
              "Slower planet = longer, weightier transit.",
              "Saturn return (~29) and Uranus opposition (~42) are landmark transits.",
              "Outer-planet transits often perfect three times via retrograde motion.",
            ] },
            { kind: "callout", tone: "evidence", title: "What this is — and isn't", text: "Transits are a symbolic, interpretive language for timing, not a tested predictive science. Controlled studies have not shown that transits forecast specific events. Used honestly, they're a mirror for reflection on the season you're in, not a forecast you must obey." },
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
            { id: "q4", type: "mcq", prompt: "Why does a slow transit often perfect an aspect three times?", options: [
              { id: "a", text: "The planet goes retrograde, crossing the same degree forward, back, then forward again", correct: true, explanation: "Right — direct, retrograde, direct." },
              { id: "b", text: "Because the natal point moves to meet it", correct: false, explanation: "Natal points are fixed." },
              { id: "c", text: "Because the Sun amplifies it three times a day", correct: false, explanation: "Not a real mechanism." },
            ] },
            { id: "q5", type: "true-false", prompt: "Transits are best read as a symbolic timing language — a way to reflect on the themes a period is asking you to work with.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — transits map symbolic seasons of growth, not fixed forecasts." },
              { id: "f", text: "False", correct: false, explanation: "Reading transits as symbolic timing is exactly how the tradition uses them." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the apparent backward motion of a planet (from Earth's view) that makes a transit cross the same degree three times.", options: [], answer: "retrograde", accept: ["retrogression", "retrograde motion"], explanation: "Retrograde motion produces the classic 'three passes' of a slow transit." },
          ],
        },
        {
          id: "l2-progressions",
          title: "Secondary progressions",
          objective: "Describe the day-for-a-year progression method.",
          estMinutes: 7,
          blocks: [
            { kind: "text", text: "Progressions are a symbolic timing technique that, unlike transits, derive entirely from your own birth data. The most common, 'secondary progressions,' use a simple key: each day after your birth corresponds to one year of your life. So the planetary positions 30 days after you were born describe your 30th year." },
            { kind: "text", text: "The key isn't arbitrary — it echoes a real rhythm: the Earth's daily rotation symbolically standing in for the Earth's yearly orbit ('a day for a year'). Because the technique only advances the clock a few days for a whole lifetime, the inner planets move modestly and the outer planets barely budge — which is exactly why progressions describe slow inner ripening rather than outer events." },
            { kind: "callout", tone: "tip", title: "The slow inner unfolding", text: "Where transits are the weather outside, progressions are your inner evolution. The progressed Moon is especially useful — it moves through a new sign about every 2.5 years, marking shifting emotional seasons. A change of progressed Sun sign (roughly every 30 years) signals a major maturing of identity." },
            { kind: "table", headers: ["Progressed body", "Moves about", "What it tracks"], rows: [
              ["Moon", "1 sign / 2.5 yrs", "Emotional seasons; ~27-yr full cycle"],
              ["Sun", "~1° / year", "Maturing identity; sign change ~every 30 yrs"],
              ["Mercury / Venus", "Slowly, sometimes retrograde", "Evolving mind & values"],
              ["Outer planets", "Almost not at all", "Rarely used in progressions"],
            ] },
            { kind: "callout", tone: "history", title: "Roots in Ptolemy", text: "The 'day for a year' idea is ancient; a version appears in Ptolemy's Tetrabiblos (2nd century CE). Secondary progressions as practiced today were formalized in the modern era, but the symbolic equation of one rotation with one revolution is very old." },
            { kind: "callout", tone: "evidence", title: "Progressed vs. progressed-to-natal", text: "Astrologers read two layers: a progressed planet changing sign or house (an internal shift), and a progressed planet aspecting a natal planet (an internal development 'landing' on a birth theme). Both are symbolic overlays on the unchanging natal chart, not new physical positions in the sky." },
            { kind: "keyfacts", items: [
              "Secondary progressions: 1 day after birth = 1 year of life.",
              "Built from birth data alone — no current sky needed.",
              "Progressed Moon: new sign ~every 2.5 years.",
              "Progressed Sun sign change ~every 30 years = identity milestone.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "Why do outer planets barely move in secondary progressions?", options: [
              { id: "a", text: "The method only advances the clock a few days for a whole life", correct: true, explanation: "Right — slow planets move little in a few days." },
              { id: "b", text: "Outer planets are excluded by rule", correct: false, explanation: "They're just nearly motionless, not banned." },
              { id: "c", text: "They reverse the day-for-a-year key", correct: false, explanation: "The key is the same for all bodies." },
            ] },
            { id: "q5", type: "true-false", prompt: "Secondary progressions are calculated from your birth data, not the current sky.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they advance your own chart symbolically." },
              { id: "f", text: "False", correct: false, explanation: "They derive entirely from birth data." },
            ] },
          ],
        },
        {
          id: "l3-returns",
          title: "Returns",
          objective: "Explain solar and lunar return charts.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "A 'return' chart is cast for the exact moment a planet comes back to its precise natal position. It's a full, fresh horoscope — Ascendant, houses, and all — for a defined cycle, layered on top of (not replacing) your natal chart." },
            { kind: "list", items: [
              "**Solar return** — when the Sun returns to its exact birth degree (around your birthday). The chart for that moment is read as a preview of the year ahead.",
              "**Lunar return** — when the Moon returns to its natal position (about every 27–28 days), read as the theme of the coming month.",
            ] },
            { kind: "text", text: "Because a return chart has its own Ascendant and house positions, where it's cast matters. The same solar return looks different if you spend your birthday at home versus abroad, which is why some practitioners deliberately travel for a more favorable 'relocated' solar return — a practice as debated as it is popular." },
            { kind: "callout", tone: "tip", title: "A fresh chart for a cycle", text: "Returns give you a brand-new chart to read for a defined period — the solar return for your personal year, the lunar return for your emotional month — layered on top of your unchanging natal chart." },
            { kind: "callout", tone: "history", title: "Older than you'd think", text: "Annual (solar) revolutions were a staple of medieval and Renaissance astrology, where the 'revolution of the year' chart was combined with profections and directions to forecast the year. Returns aren't a modern invention; they're a revived classical tool." },
            { kind: "table", headers: ["Return", "Cast when planet returns to natal…", "Reads as"], rows: [
              ["Solar", "Sun (≈ birthday, yearly)", "Your personal year"],
              ["Lunar", "Moon (≈ every 27–28 days)", "Your emotional month"],
              ["Saturn", "Saturn (~29.5 yrs)", "A maturity threshold"],
            ] },
            { kind: "callout", tone: "evidence", title: "Keep it as a lens", text: "A return chart is a structured way to set intentions for a cycle and reflect on its themes. Treat its 'forecast' as a prompt for self-reflection, not a fixed prediction — and never as a basis for medical or financial decisions." },
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
            { id: "q3", type: "mcq", prompt: "Why can the location you're in on your birthday change a solar return reading?", options: [
              { id: "a", text: "The return chart has its own Ascendant and houses, which depend on place", correct: true, explanation: "Right — hence 'relocated' solar returns." },
              { id: "b", text: "The Sun returns to a different degree elsewhere", correct: false, explanation: "The solar degree is the same everywhere." },
              { id: "c", text: "Your natal chart changes when you travel", correct: false, explanation: "The natal chart never changes." },
            ] },
            { id: "q4", type: "true-false", prompt: "A solar return chart is read as a preview of the year ahead.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — your personal year chart." },
              { id: "f", text: "False", correct: false, explanation: "That's exactly how it's used." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the word for the type of return chart cast around your birthday each year.", options: [], answer: "solar", accept: ["solar return"], explanation: "The solar return marks the Sun's return to its natal degree — your personal year." },
          ],
        },
        {
          id: "l4-profections",
          title: "Annual profections",
          objective: "Use annual profections to find the year's emphasis.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Profections are an elegant traditional timing method. Each year of life advances the emphasis by one house: your 1st year of life highlights the 1st house, your 2nd the 2nd house, and so on, cycling back to the 1st house every 12 years (ages 0, 12, 24, 36… are all 1st-house years)." },
            { kind: "text", text: "To find your profected house, take your age, divide by 12, and keep the remainder. A remainder of 0 is a 1st-house year, 1 is a 2nd-house year, and so on. The whole point is to spotlight one house — and one ruling planet — for the next twelve months." },
            { kind: "callout", tone: "tip", title: "The 'lord of the year'", text: "The planet that rules the sign on the profected house becomes the year's 'time-lord' — the planet running the show for those twelve months. Transits to it, and its own condition, color the year. It's a simple way to know which area of life and which planet are emphasized." },
            { kind: "table", headers: ["Age", "Profected house", "Life area emphasized"], rows: [
              ["0, 12, 24, 36…", "1st", "Self, body, vitality"],
              ["1, 13, 25, 37…", "2nd", "Money, resources, values"],
              ["6, 18, 30, 42…", "7th", "Partnership, others"],
              ["9, 21, 33, 45…", "10th", "Career, public role"],
            ] },
            { kind: "callout", tone: "history", title: "A Hellenistic staple", text: "Annual profections come from Hellenistic astrology (roughly 2nd century BCE–7th century CE) and were transmitted through Persian and medieval astrologers. They're a cornerstone of the 'time-lord' systems that have been revived by modern traditional astrologers." },
            { kind: "callout", tone: "tradition", title: "Pairing profections with returns", text: "Classically, the lord of the year is examined in that year's solar return and watched for transits. The profected house tells you the theme; the time-lord's condition and the transits to it are read as how the theme plays out — a layered, structured forecast rather than a single omen." },
            { kind: "keyfacts", items: [
              "Profections advance one house per year of life.",
              "Cycle repeats every 12 years (age mod 12 → house).",
              "The ruler of the profected sign is the year's time-lord.",
              "Hellenistic in origin; paired with the solar return.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "Profections originate in which tradition?", options: [
              { id: "a", text: "Hellenistic astrology", correct: true, explanation: "Right — a classical time-lord technique." },
              { id: "b", text: "20th-century psychological astrology", correct: false, explanation: "They're far older, recently revived." },
              { id: "c", text: "Vedic nakshatras", correct: false, explanation: "A different lineage entirely." },
            ] },
            { id: "q5", type: "true-false", prompt: "The profected house tells you which life area is emphasized for the year.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — and its ruler is the time-lord." },
              { id: "f", text: "False", correct: false, explanation: "That's exactly what it indicates." },
            ] },
          ],
        },
        {
          id: "l5-timelords",
          title: "Time-lords & releasing",
          objective: "Describe what a time-lord system is and name one example beyond profections.",
          estMinutes: 7,
          blocks: [
            { kind: "text", text: "A 'time-lord' system divides life into chapters, each governed by a particular planet that 'has the floor' for a stretch of time. Profections are the simplest example — one ruling planet per year — but classical astrology developed several more elaborate systems that hand the baton from planet to planet across longer spans." },
            { kind: "callout", tone: "history", title: "Hellenistic engineering of time", text: "Hellenistic astrologers built multiple overlapping time-lord procedures — annual profections, planetary periods (firdaria), and zodiacal releasing among them — precisely because a single technique can't capture the layering of life. Used together, they were meant to show which themes activate, and when." },
            { kind: "callout", tone: "tradition", title: "Zodiacal releasing (from the Lots)", text: "Zodiacal releasing is a method, drawn from the astrologer Vettius Valens, that unfolds time from one of the 'Lots' (calculated points) — most famously the Lot of Spirit for career and the Lot of Fortune for body and circumstance. It marks major and minor periods and notable 'peak' chapters called Loosing of the Bond." },
            { kind: "table", headers: ["System", "Unit of time", "Reads as"], rows: [
              ["Annual profections", "One year per house", "The year's emphasized house & lord"],
              ["Firdaria", "Multi-year planetary periods", "Long chapters ruled by a planet"],
              ["Zodiacal releasing", "Periods unfolding from a Lot", "Career/fortune chapters & peaks"],
            ] },
            { kind: "callout", tone: "culture", title: "Why these were revived", text: "For most of the 20th century, Western astrology emphasized psychology and natal interpretation over prediction. The translation of Hellenistic sources (notably Project Hindsight from the 1990s) brought time-lord techniques back into wide use, reconnecting modern practice with its classical roots." },
            { kind: "callout", tone: "evidence", title: "Structure, not certainty", text: "Time-lord systems are intricate and internally consistent, which can make them feel authoritative. But they remain symbolic frameworks for organizing reflection on life's chapters — not validated forecasts. Hold any 'peak' or 'crisis' period as a theme to consider, never as a fated event." },
            { kind: "keyfacts", items: [
              "Time-lord = a planet governing a defined span of life.",
              "Profections are the simplest time-lord system (one year each).",
              "Zodiacal releasing unfolds periods from a Lot (Spirit or Fortune).",
              "These Hellenistic methods were revived by modern translation work.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A 'time-lord' system does what?", options: [
              { id: "a", text: "Divides life into chapters each governed by a particular planet", correct: true, explanation: "Correct — a planet 'has the floor' for a span of time." },
              { id: "b", text: "Predicts the weather", correct: false, explanation: "Not its purpose." },
              { id: "c", text: "Assigns a permanent ruling planet for life", correct: false, explanation: "The rulership rotates over time." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which is the simplest time-lord system?", options: [
              { id: "a", text: "Annual profections", correct: true, explanation: "Yes — one ruling planet per year." },
              { id: "b", text: "Zodiacal releasing", correct: false, explanation: "That's more elaborate, unfolding from a Lot." },
              { id: "c", text: "Synastry", correct: false, explanation: "Synastry isn't a time-lord system at all." },
            ] },
            { id: "q3", type: "mcq", prompt: "Zodiacal releasing unfolds time from…", options: [
              { id: "a", text: "One of the Lots, such as Spirit or Fortune", correct: true, explanation: "Correct — most famously the Lot of Spirit." },
              { id: "b", text: "The progressed Moon", correct: false, explanation: "That's secondary progressions." },
              { id: "c", text: "The current transit of Saturn", correct: false, explanation: "Releasing is calculated from a Lot, not a transit." },
            ] },
            { id: "q4", type: "mcq", prompt: "Why did time-lord techniques re-enter modern practice?", options: [
              { id: "a", text: "Translation of Hellenistic sources (e.g., Project Hindsight) revived them", correct: true, explanation: "Right — recovered classical texts brought them back." },
              { id: "b", text: "They were invented by 1980s computer astrologers", correct: false, explanation: "They're ancient, not newly invented." },
              { id: "c", text: "NASA endorsed them", correct: false, explanation: "Astronomy doesn't endorse astrology." },
            ] },
            { id: "q5", type: "true-false", prompt: "Time-lord systems are validated, certain forecasts of fated events.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they're symbolic frameworks, not proven predictions." },
              { id: "f", text: "False", correct: true, explanation: "Correct — hold their 'peaks' as themes, not fate." },
            ] },
            { id: "q6", type: "recall", prompt: "Name the Lot most associated with career in zodiacal releasing (the Lot of ___).", options: [], answer: "spirit", accept: ["lot of spirit", "the lot of spirit"], explanation: "Releasing from the Lot of Spirit is the classic method for reading career chapters." },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Advanced Techniques",
      lessons: [
        {
          id: "l6-midpoints",
          title: "Midpoints",
          objective: "Explain what a midpoint is and how a midpoint picture is read.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "A midpoint is the exact halfway point between two planets along the zodiac. It's treated as a sensitive spot: a third planet sitting at (or aspecting) that halfway degree is said to combine the meanings of all three, written as A/B = C ('the midpoint of A and B equals C')." },
            { kind: "text", text: "For example, the Sun/Moon midpoint — halfway between your Sun and Moon — is read as a point of inner integration, often emphasized in relationship astrology. If, say, Venus sits on your Sun/Moon midpoint, an astrologer reads love and harmony as woven into your core sense of self." },
            { kind: "callout", tone: "history", title: "Ebertin and Cosmobiology", text: "Midpoint work was systematized by Reinhold Ebertin in the 20th century in a school he called 'Cosmobiology,' which stripped astrology down to planets, a few aspects, and midpoint 'pictures.' His reference, The Combination of Stellar Influences, catalogs midpoint meanings and is still widely used." },
            { kind: "callout", tone: "tip", title: "Direct and indirect midpoints", text: "A planet can sit right on a midpoint (a 'direct' midpoint) or aspect it by hard angles — conjunction, square, opposition (an 'indirect' one). Midpoint practitioners use tight orbs (often 1–2°) and a '90° dial' tool that brings these hard-aspect relationships into view at a glance." },
            { kind: "table", headers: ["Midpoint picture", "Often read as"], rows: [
              ["Sun/Moon = Venus", "Love woven into the core self"],
              ["Mars/Saturn = planet", "Effort, friction, or hard discipline"],
              ["Sun/Mercury = Jupiter", "Confident, expansive thinking"],
            ] },
            { kind: "callout", tone: "evidence", title: "Precision isn't proof", text: "Midpoints feel exacting because they're calculated to the degree, but precision of calculation is not evidence of effect. Like the rest of astrology, midpoint pictures are an interpretive vocabulary — they have not been shown to predict behavior in controlled tests." },
            { kind: "keyfacts", items: [
              "Midpoint = the halfway degree between two planets.",
              "A/B = C means a third planet activates that midpoint.",
              "The Sun/Moon midpoint is a key 'integration' point.",
              "Systematized by Ebertin's Cosmobiology; uses tight orbs and a 90° dial.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A midpoint is…", options: [
              { id: "a", text: "The halfway point between two planets along the zodiac", correct: true, explanation: "Correct — a sensitive degree between two bodies." },
              { id: "b", text: "The center of the natal chart", correct: false, explanation: "That's just the chart's center point, not a midpoint." },
              { id: "c", text: "A planet's retrograde station", correct: false, explanation: "Unrelated to midpoints." },
            ] },
            { id: "q2", type: "mcq", prompt: "The notation A/B = C means…", options: [
              { id: "a", text: "Planet C sits on (or aspects) the midpoint of A and B", correct: true, explanation: "Yes — combining all three meanings." },
              { id: "b", text: "A, B, and C are in a grand trine", correct: false, explanation: "That's a different configuration." },
              { id: "c", text: "C is exactly opposite both A and B", correct: false, explanation: "Not what the midpoint notation means." },
            ] },
            { id: "q3", type: "mcq", prompt: "Who systematized modern midpoint work (Cosmobiology)?", options: [
              { id: "a", text: "Reinhold Ebertin", correct: true, explanation: "Correct — author of The Combination of Stellar Influences." },
              { id: "b", text: "Claudius Ptolemy", correct: false, explanation: "Ptolemy is ancient; midpoints were systematized much later." },
              { id: "c", text: "Vettius Valens", correct: false, explanation: "Valens is linked to zodiacal releasing, not midpoints." },
            ] },
            { id: "q4", type: "mcq", prompt: "The Sun/Moon midpoint is typically read as…", options: [
              { id: "a", text: "A point of inner integration, important in relationships", correct: true, explanation: "Right — it blends the two luminaries." },
              { id: "b", text: "The moment of your next eclipse", correct: false, explanation: "Unrelated to eclipses." },
              { id: "c", text: "Your career house ruler", correct: false, explanation: "Not a midpoint meaning." },
            ] },
            { id: "q5", type: "true-false", prompt: "Because midpoints are calculated precisely, they are scientifically proven to predict behavior.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — calculation precision isn't evidence of effect." },
              { id: "f", text: "False", correct: true, explanation: "Correct — they remain an interpretive vocabulary." },
            ] },
          ],
        },
        {
          id: "l7-harmonics",
          title: "Harmonics",
          objective: "Explain the basic idea of harmonic charts and the aspect each harmonic emphasizes.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Harmonic astrology treats the 360° circle like a wave that can be divided into whole-number 'harmonics.' Multiplying every planet's longitude by a number (say 5) and reducing it back into a circle produces a 'harmonic chart' that foregrounds aspects based on that number — in this case the fifth harmonic, tied to the quintile (72°)." },
            { kind: "text", text: "The logic is that each aspect is really a division of the circle: the opposition divides it by 2, the trine by 3, the square by 4, the quintile by 5, the sextile by 6. So the 2nd harmonic chart spotlights oppositions, the 4th spotlights squares and the 'hard' dynamic aspects, the 5th the quintiles, and so on." },
            { kind: "callout", tone: "history", title: "John Addey's revival", text: "British astrologer John Addey (1920s–1982) pioneered modern harmonic theory, arguing in Harmonics in Astrology that astrology is fundamentally about waves and numbers. His work built on older 'aspect as division of the circle' ideas reaching back to Kepler's interest in harmonic ratios." },
            { kind: "table", headers: ["Harmonic", "Core aspect (division)", "Theme often associated"], rows: [
              ["2nd", "Opposition (÷2)", "Awareness, polarity"],
              ["4th", "Square (÷4)", "Effort, tension, manifestation"],
              ["5th", "Quintile (÷5)", "Creativity, skill, style"],
              ["7th", "Septile (÷7)", "Inspiration, the irrational"],
              ["9th", "Novile (÷9)", "Completion, spiritual themes"],
            ] },
            { kind: "callout", tone: "tip", title: "Why bother with harmonics?", text: "Harmonic charts make minor aspects easy to see. A scatter of weak quintiles across a natal chart is hard to spot, but in the 5th harmonic chart those planets snap into conjunction, making a creative 'signature' obvious. The harmonic chart is essentially a magnifying glass for one family of aspects." },
            { kind: "callout", tone: "evidence", title: "Elegant, still symbolic", text: "Harmonics give astrology a tidy mathematical structure, and Addey even attempted statistical studies. But the framework, however elegant, remains an interpretive system; its aspect 'meanings' are traditional associations, not measured forces. Treat harmonic readings as another symbolic lens." },
            { kind: "keyfacts", items: [
              "Each aspect is a whole-number division of the 360° circle.",
              "The Nth harmonic chart highlights the aspect tied to N.",
              "5th harmonic ↔ quintile (creativity); 4th ↔ square (effort).",
              "Modern harmonic theory was developed by John Addey.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A harmonic chart is made by…", options: [
              { id: "a", text: "Multiplying each planet's longitude by a number and reducing it back into a circle", correct: true, explanation: "Correct — that foregrounds the matching family of aspects." },
              { id: "b", text: "Adding the houses together", correct: false, explanation: "Not how harmonics work." },
              { id: "c", text: "Casting the chart for a different city", correct: false, explanation: "That's relocation, not a harmonic." },
            ] },
            { id: "q2", type: "mcq", prompt: "The 5th harmonic chart emphasizes which aspect?", options: [
              { id: "a", text: "The quintile (72°)", correct: true, explanation: "Yes — division of the circle by 5." },
              { id: "b", text: "The trine (120°)", correct: false, explanation: "That's the 3rd harmonic." },
              { id: "c", text: "The opposition (180°)", correct: false, explanation: "That's the 2nd harmonic." },
            ] },
            { id: "q3", type: "mcq", prompt: "Each astrological aspect can be understood as…", options: [
              { id: "a", text: "A whole-number division of the 360° circle", correct: true, explanation: "Right — opposition ÷2, trine ÷3, square ÷4, and so on." },
              { id: "b", text: "A color of light", correct: false, explanation: "Not relevant to aspects." },
              { id: "c", text: "A planet's distance from Earth", correct: false, explanation: "Aspects are angular, not distance-based." },
            ] },
            { id: "q4", type: "mcq", prompt: "Who developed modern harmonic theory in astrology?", options: [
              { id: "a", text: "John Addey", correct: true, explanation: "Correct — author of Harmonics in Astrology." },
              { id: "b", text: "Reinhold Ebertin", correct: false, explanation: "Ebertin is associated with midpoints/Cosmobiology." },
              { id: "c", text: "Alan Leo", correct: false, explanation: "Leo popularized sun-sign astrology, not harmonics." },
            ] },
            { id: "q5", type: "true-false", prompt: "The 4th harmonic chart highlights squares and 'hard' dynamic aspects.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the square is a division by 4." },
              { id: "f", text: "False", correct: false, explanation: "It does emphasize the square family." },
            ] },
            { id: "q6", type: "recall", prompt: "What is the name of the aspect emphasized by the 5th harmonic (the ___)?", options: [], answer: "quintile", accept: ["quintiles"], explanation: "Dividing the circle by 5 gives the 72° quintile, linked to creativity." },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Relationships",
      lessons: [
        {
          id: "l8-synastry",
          title: "Synastry",
          objective: "Explain how synastry compares two charts.",
          estMinutes: 7,
          blocks: [
            { kind: "text", text: "Synastry is the comparison of two people's birth charts to understand their connection. You look at how each person's planets aspect the other's, and where one person's planets land in the other's houses." },
            { kind: "list", items: [
              "**Cross-aspects** — e.g., your Venus trine their Mars suggests easy attraction; your Saturn square their Sun can feel restrictive or grounding, depending.",
              "**House overlays** — where their planets fall in your houses shows which areas of your life they 'light up' (e.g., someone's Sun in your 7th house feels partnership-flavored).",
              "**Key players** — Sun, Moon, Venus, Mars, and the Ascendant rulers carry the most weight in relationship comparison.",
            ] },
            { kind: "text", text: "Different contacts carry different flavors. Sun–Moon links suggest a natural fit of identity and feeling; Venus–Mars links speak to attraction and chemistry; Moon–Moon shows emotional rapport; and Saturn contacts bring weight, commitment, or constraint. No single contact 'makes' or 'breaks' a bond — it's the overall pattern that matters." },
            { kind: "table", headers: ["Contact", "Often described as"], rows: [
              ["Sun–Moon", "Core compatibility of self & feeling"],
              ["Venus–Mars", "Attraction and chemistry"],
              ["Moon–Moon", "Emotional rapport and comfort"],
              ["Saturn–personal planet", "Commitment, weight, or restriction"],
            ] },
            { kind: "callout", tone: "tip", title: "Both charts, no shortcuts", text: "Good synastry weighs the whole picture — harmonious and challenging contacts together — rather than declaring a match 'good' or 'bad' from one aspect." },
            { kind: "callout", tone: "history", title: "From elections to compatibility", text: "Comparing charts for relationship is old, but the modern, aspect-by-aspect 'synastry' grid became popular in the 20th century alongside psychological astrology. The word itself comes from Greek roots meaning 'a bringing together of stars.'" },
            { kind: "callout", tone: "evidence", title: "Compatibility isn't fixed by charts", text: "Studies of 'astrological compatibility' have not found that sign or chart matching predicts relationship success. Synastry is best used as a conversation-starter about each person's needs and patterns — not as a verdict on whether two people belong together." },
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
            { id: "q4", type: "mcq", prompt: "Venus–Mars contacts in synastry are most associated with…", options: [
              { id: "a", text: "Attraction and chemistry", correct: true, explanation: "Right — the classic 'spark' contact." },
              { id: "b", text: "Career success", correct: false, explanation: "Not what Venus–Mars describes." },
              { id: "c", text: "Family inheritance", correct: false, explanation: "Unrelated to this contact." },
            ] },
            { id: "q5", type: "true-false", prompt: "A single harmonious aspect is enough to declare a relationship a 'good match.'", options: [
              { id: "t", text: "True", correct: false, explanation: "No — good synastry weighs the whole pattern." },
              { id: "f", text: "False", correct: true, explanation: "Correct — never judge a bond from one contact." },
            ] },
            { id: "q6", type: "recall", prompt: "Type the term for the technique of comparing two people's birth charts.", options: [], answer: "synastry", accept: ["chart comparison"], explanation: "Synastry compares two charts to read the dynamics between two people." },
          ],
        },
        {
          id: "l9-composite",
          title: "Composite charts",
          objective: "Explain what a composite chart represents.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Where synastry compares two separate charts, a composite chart creates a single new chart for the relationship itself. The most common method takes the midpoints between each pair of planets (the midpoint of the two Suns becomes the composite Sun, and so on)." },
            { kind: "text", text: "A second, related method is the 'Davison' chart, which is cast for the literal midpoint in time and space between two births — the date, time, and place exactly halfway between both partners. Unlike the abstract midpoint composite, the Davison is a real chart for a real (if hypothetical) moment, which some astrologers prefer for that reason." },
            { kind: "callout", tone: "tip", title: "The relationship as its own being", text: "The composite chart is read like a birth chart — but for the partnership as an entity: its purpose (composite Sun), its emotional tone (composite Moon), how it relates (composite Venus), and the area of life it centers on (the house emphasis). It describes the relationship, not either individual." },
            { kind: "table", headers: ["Method", "How it's built", "Note"], rows: [
              ["Midpoint composite", "Average each pair of planets", "Most common; an abstract chart"],
              ["Davison", "Midpoint of the two birth dates/places", "A real moment & location"],
            ] },
            { kind: "callout", tone: "history", title: "A mid-century idea", text: "The composite (midpoint) chart was popularized by Robert Hand's 1975 book Planets in Composite, which made relationship astrology-as-an-entity widely known. The Davison method is named for astrologer Ronald Davison." },
            { kind: "callout", tone: "evidence", title: "One lens among several", text: "Composite and Davison charts are interpretive constructs, not measurements of a relationship's 'fate.' They're useful for reflecting on a partnership's shared themes, but they don't predict whether it will last — and shouldn't be used to pressure anyone to stay or leave." },
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
            { id: "q3", type: "mcq", prompt: "The Davison chart is cast for…", options: [
              { id: "a", text: "The midpoint in time and place between the two births", correct: true, explanation: "Right — a real moment exactly halfway between partners." },
              { id: "b", text: "The wedding day", correct: false, explanation: "That would be an event chart, not a Davison." },
              { id: "c", text: "The next solar eclipse", correct: false, explanation: "Unrelated to the Davison method." },
            ] },
            { id: "q4", type: "mcq", prompt: "In a composite chart, the composite Sun describes…", options: [
              { id: "a", text: "The purpose or core identity of the relationship", correct: true, explanation: "Correct — read like a birth Sun, but for the bond." },
              { id: "b", text: "The older partner's ego", correct: false, explanation: "It's the relationship's Sun, not a person's." },
              { id: "c", text: "The date the couple will marry", correct: false, explanation: "Charts don't fix that." },
            ] },
            { id: "q5", type: "true-false", prompt: "A composite chart is read much like a birth chart, but for the partnership.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the relationship as its own 'being.'" },
              { id: "f", text: "False", correct: false, explanation: "That's exactly how it's read." },
            ] },
          ],
        },
        {
          id: "l10-ethics",
          title: "Reading relationships ethically",
          objective: "Apply an ethical, non-fatalistic approach to relationship astrology.",
          estMinutes: 6,
          blocks: [
            { kind: "callout", tone: "tip", title: "No 'doomed' or 'destined'", text: "Charts show tendencies and dynamics, not verdicts. Avoid telling people a relationship is 'doomed' or 'meant to be' — challenging aspects describe growth edges, and easy ones can be taken for granted. People always have agency and choice." },
            { kind: "callout", tone: "culture", title: "Consent & privacy", text: "Reading someone else's chart — or a relationship — involves another person's data and life. Get consent where you can, hold what you see with care, and never use astrology to control, pressure, or pathologize someone." },
            { kind: "text", text: "Language matters enormously in relationship readings. Compare 'you two are incompatible' with 'this contact can bring friction you'll both want to talk about.' The first closes a door; the second opens a conversation. Ethical practice favors descriptive, agency-preserving language that the person can act on." },
            { kind: "callout", tone: "safety", title: "Stay in your lane", text: "Relationship astrology is not therapy, legal advice, medical advice, or financial advice. If someone is in distress — especially around abuse, self-harm, or a crisis — point them toward qualified human support, not a chart. Never use a reading to diagnose a condition or to advise someone to stay in or leave a situation that may be unsafe." },
            { kind: "callout", tone: "evidence", title: "Keep it grounded", text: "Relationship astrology is a lens for reflection and conversation, not a substitute for honest communication, therapy, or your own judgment about who is good for you. There is no good evidence that charts determine compatibility; treat readings accordingly." },
            { kind: "keyfacts", items: [
              "Describe dynamics, never deliver verdicts ('doomed'/'destined').",
              "Seek consent before reading another person's chart.",
              "Use agency-preserving, descriptive language.",
              "Refer crises to qualified human support — astrology isn't care.",
            ] },
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
            { id: "q3", type: "mcq", prompt: "Which phrasing best models ethical, agency-preserving language?", options: [
              { id: "a", text: "'This contact can bring friction you'll both want to talk about.'", correct: true, explanation: "Right — descriptive and actionable, not a verdict." },
              { id: "b", text: "'You two are simply incompatible.'", correct: false, explanation: "That closes the door and removes agency." },
              { id: "c", text: "'The chart says you must break up.'", correct: false, explanation: "Charts don't issue commands." },
            ] },
            { id: "q4", type: "mcq", prompt: "If someone discloses a crisis during a reading, the ethical move is to…", options: [
              { id: "a", text: "Point them toward qualified human support", correct: true, explanation: "Correct — astrology isn't a substitute for care." },
              { id: "b", text: "Diagnose the problem from their chart", correct: false, explanation: "Never diagnose from a chart." },
              { id: "c", text: "Tell them the transits will fix it", correct: false, explanation: "That dismisses a real need." },
            ] },
            { id: "q5", type: "true-false", prompt: "Relationship astrology can replace honest communication and good judgment.", options: [
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
    { id: "f4", type: "mcq", prompt: "A slow transit often perfects three times because the planet…", options: [
      { id: "a", text: "Goes retrograde, crossing the degree forward, back, then forward", correct: true },
      { id: "b", text: "Speeds up near the natal point", correct: false },
      { id: "c", text: "Splits into three", correct: false },
      { id: "d", text: "Is amplified by the Moon", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "In secondary progressions, one day after birth equals…", options: [
      { id: "a", text: "One year of life", correct: true },
      { id: "b", text: "One month", correct: false },
      { id: "c", text: "One decade", correct: false },
      { id: "d", text: "One week", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "The progressed Moon changes sign about every…", options: [
      { id: "a", text: "2.5 years", correct: true },
      { id: "b", text: "2.5 days", correct: false },
      { id: "c", text: "30 years", correct: false },
      { id: "d", text: "1 month", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "Secondary progressions are calculated from…", options: [
      { id: "a", text: "Your own birth data, advanced symbolically", correct: true },
      { id: "b", text: "Today's live sky", correct: false },
      { id: "c", text: "A random chart", correct: false },
      { id: "d", text: "The composite chart", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "A solar return chart is cast for…", options: [
      { id: "a", text: "When the Sun returns to its birth degree (≈ birthday)", correct: true },
      { id: "b", text: "Every new moon", correct: false },
      { id: "c", text: "Each Monday", correct: false },
      { id: "d", text: "The winter solstice", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "A lunar return happens about every…", options: [
      { id: "a", text: "27–28 days", correct: true },
      { id: "b", text: "Year", correct: false },
      { id: "c", text: "Decade", correct: false },
      { id: "d", text: "Week", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Why can your location affect a solar return reading?", options: [
      { id: "a", text: "The return chart's Ascendant and houses depend on place", correct: true },
      { id: "b", text: "The Sun returns to a different degree elsewhere", correct: false },
      { id: "c", text: "Your natal chart changes when you travel", correct: false },
      { id: "d", text: "It doesn't — location is irrelevant", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "In profections, each year advances the emphasis by…", options: [
      { id: "a", text: "One house", correct: true },
      { id: "b", text: "One random sign", correct: false },
      { id: "c", text: "One chosen planet", correct: false },
      { id: "d", text: "Nothing", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "The 'lord of the year' is…", options: [
      { id: "a", text: "The ruler of the sign on the profected house", correct: true },
      { id: "b", text: "Always the Sun", correct: false },
      { id: "c", text: "The brightest planet", correct: false },
      { id: "d", text: "Random", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "Profections come from which tradition?", options: [
      { id: "a", text: "Hellenistic astrology", correct: true },
      { id: "b", text: "1900s psychological astrology", correct: false },
      { id: "c", text: "Modern statistics", correct: false },
      { id: "d", text: "Renaissance alchemy", correct: false },
    ] },
    { id: "f14", type: "mcq", prompt: "A 'time-lord' system…", options: [
      { id: "a", text: "Divides life into chapters each governed by a planet", correct: true },
      { id: "b", text: "Assigns one ruling planet for all of life", correct: false },
      { id: "c", text: "Predicts the weather", correct: false },
      { id: "d", text: "Compares two charts", correct: false },
    ] },
    { id: "f15", type: "mcq", prompt: "Zodiacal releasing unfolds time from…", options: [
      { id: "a", text: "One of the Lots, such as Spirit or Fortune", correct: true },
      { id: "b", text: "The progressed Sun", correct: false },
      { id: "c", text: "A transit of Jupiter", correct: false },
      { id: "d", text: "The composite Moon", correct: false },
    ] },
    { id: "f16", type: "mcq", prompt: "A midpoint is…", options: [
      { id: "a", text: "The halfway point between two planets", correct: true },
      { id: "b", text: "The center of the chart wheel", correct: false },
      { id: "c", text: "A retrograde station", correct: false },
      { id: "d", text: "A house cusp", correct: false },
    ] },
    { id: "f17", type: "mcq", prompt: "Modern midpoint work (Cosmobiology) was systematized by…", options: [
      { id: "a", text: "Reinhold Ebertin", correct: true },
      { id: "b", text: "John Addey", correct: false },
      { id: "c", text: "Ptolemy", correct: false },
      { id: "d", text: "Robert Hand", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "The 5th harmonic chart emphasizes which aspect?", options: [
      { id: "a", text: "The quintile (72°)", correct: true },
      { id: "b", text: "The trine (120°)", correct: false },
      { id: "c", text: "The square (90°)", correct: false },
      { id: "d", text: "The sextile (60°)", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "Each aspect can be understood as…", options: [
      { id: "a", text: "A whole-number division of the 360° circle", correct: true },
      { id: "b", text: "A planet's brightness", correct: false },
      { id: "c", text: "A distance in miles", correct: false },
      { id: "d", text: "A house ruler", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "Modern harmonic theory in astrology was developed by…", options: [
      { id: "a", text: "John Addey", correct: true },
      { id: "b", text: "Reinhold Ebertin", correct: false },
      { id: "c", text: "Vettius Valens", correct: false },
      { id: "d", text: "Alan Leo", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "Synastry is…", options: [
      { id: "a", text: "Comparing two charts to understand a connection", correct: true },
      { id: "b", text: "A yearly solo forecast", correct: false },
      { id: "c", text: "A house system", correct: false },
      { id: "d", text: "A transit", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "A house overlay shows…", options: [
      { id: "a", text: "Where one person's planets fall in another's houses", correct: true },
      { id: "b", text: "The wedding date", correct: false },
      { id: "c", text: "Who is right in a fight", correct: false },
      { id: "d", text: "Nothing", correct: false },
    ] },
    { id: "f23", type: "mcq", prompt: "Venus–Mars contacts in synastry suggest…", options: [
      { id: "a", text: "Attraction and chemistry", correct: true },
      { id: "b", text: "Career success", correct: false },
      { id: "c", text: "Inheritance", correct: false },
      { id: "d", text: "A house system", correct: false },
    ] },
    { id: "f24", type: "mcq", prompt: "A composite chart represents…", options: [
      { id: "a", text: "The relationship itself, as one entity", correct: true },
      { id: "b", text: "Only one partner", correct: false },
      { id: "c", text: "A yearly forecast", correct: false },
      { id: "d", text: "A transit", correct: false },
    ] },
    { id: "f25", type: "mcq", prompt: "The Davison chart is cast for…", options: [
      { id: "a", text: "The midpoint in time and place between two births", correct: true },
      { id: "b", text: "The wedding day", correct: false },
      { id: "c", text: "The next eclipse", correct: false },
      { id: "d", text: "Each birthday", correct: false },
    ] },
    { id: "f26", type: "mcq", prompt: "The common composite method uses…", options: [
      { id: "a", text: "Midpoints between each pair of planets", correct: true },
      { id: "b", text: "Only the first person", correct: false },
      { id: "c", text: "Random positions", correct: false },
      { id: "d", text: "The Sun alone", correct: false },
    ] },
    { id: "f27", type: "mcq", prompt: "An ethical relationship reading avoids…", options: [
      { id: "a", text: "Calling a relationship 'doomed' or 'destined'", correct: true },
      { id: "b", text: "Weighing both charts", correct: false },
      { id: "c", text: "Encouraging communication", correct: false },
      { id: "d", text: "Respecting privacy", correct: false },
    ] },
    { id: "f28", type: "mcq", prompt: "If a client discloses a crisis, you should…", options: [
      { id: "a", text: "Point them to qualified human support", correct: true },
      { id: "b", text: "Diagnose it from the chart", correct: false },
      { id: "c", text: "Say the transits will fix it", correct: false },
      { id: "d", text: "Ignore it and continue", correct: false },
    ] },
    { id: "f29", type: "true-false", prompt: "Charts show tendencies, not fixed verdicts about relationships.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f30", type: "true-false", prompt: "Reading another person's chart deserves consent and care.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f31", type: "true-false", prompt: "Transits are a symbolic timing system, not a tested predictive science.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f32", type: "true-false", prompt: "The 4th harmonic chart emphasizes the square and 'hard' aspects.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
