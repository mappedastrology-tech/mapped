import type { ReferenceEntry } from "../types";

/**
 * Quick-reference almanac lookup — the sky overhead and the calendar around it.
 * Real sky-science (phase mechanics, eclipse geometry, solstices) is stated as
 * fact; folk and seasonal traditions (sabbats, full-moon names, planetary days)
 * are stated as the traditions they are. Both sit side by side without apology.
 */

function alm(e: Omit<ReferenceEntry, "domain">): ReferenceEntry {
  return { domain: "almanac", ...e };
}

export const almanacReference: ReferenceEntry[] = [
  /* ─────────────── Moon phases (astronomy + intention) ─────────────── */
  alm({
    id: "almanac-new-moon",
    name: "New Moon",
    category: "Moon phase",
    summary:
      "The Moon sits roughly between Earth and the Sun, so its sunlit face points away from us and the disc is effectively invisible. The lunar cycle begins here, and the sky is at its darkest for stargazing.",
    fields: [
      { label: "What it is", value: "The Moon is between Earth and the Sun; its lit side faces away from us, so the disc appears dark." },
      { label: "Where to look", value: "Up near the Sun — it rises and sets with the Sun, lost in daylight glare." },
      { label: "Traditionally for", value: "Setting intentions, fresh starts, planting the 'seed' of a new cycle.", tone: "tradition" },
    ],
    tags: ["dark moon", "beginnings", "intentions", "lunation start"],
  }),
  alm({
    id: "almanac-waxing-crescent",
    name: "Waxing Crescent",
    category: "Moon phase",
    summary:
      "A thin sliver of light grows on the Moon's right edge (as seen from the Northern Hemisphere) in the days after the New Moon. 'Waxing' means the lit portion is increasing each night.",
    fields: [
      { label: "What it is", value: "A growing sliver lit on the right (Northern Hemisphere) as the Moon pulls away from the Sun's direction." },
      { label: "Where to look", value: "Low in the west just after sunset." },
      { label: "Traditionally for", value: "Taking first steps, building momentum, nurturing new plans.", tone: "tradition" },
    ],
    tags: ["crescent", "growing", "waxing", "momentum"],
  }),
  alm({
    id: "almanac-first-quarter",
    name: "First Quarter",
    category: "Moon phase",
    summary:
      "The Moon is a quarter of the way through its cycle and we see exactly half the disc lit — the right half, in the Northern Hemisphere. The name refers to the orbit, not the shape.",
    fields: [
      { label: "What it is", value: "One quarter through the cycle; the Moon is 90° from the Sun, so we see a half-lit disc." },
      { label: "Where to look", value: "High in the south at sunset; it sets around midnight." },
      { label: "Traditionally for", value: "Decisions, pushing through resistance, taking committed action.", tone: "tradition" },
    ],
    tags: ["half moon", "quarter", "decision", "action"],
  }),
  alm({
    id: "almanac-waxing-gibbous",
    name: "Waxing Gibbous",
    category: "Moon phase",
    summary:
      "More than half the disc is lit and still growing toward Full. 'Gibbous' describes the bulging, less-than-full shape between a quarter and a full moon.",
    fields: [
      { label: "What it is", value: "Over half lit and still increasing, the bulging shape between First Quarter and Full." },
      { label: "Where to look", value: "Rises in the afternoon, high overhead in the evening." },
      { label: "Traditionally for", value: "Refining, adjusting, building toward a goal.", tone: "tradition" },
    ],
    tags: ["gibbous", "growing", "refining", "almost full"],
  }),
  alm({
    id: "almanac-full-moon",
    name: "Full Moon",
    category: "Moon phase",
    summary:
      "Earth sits between the Sun and Moon, so the Moon's entire near side is lit and the disc is fully bright. It rises around sunset and sets around sunrise, visible all night.",
    fields: [
      { label: "What it is", value: "Earth is between the Sun and Moon; the whole near side is illuminated." },
      { label: "Where to look", value: "Rises in the east at sunset, up all night, sets in the west at dawn." },
      { label: "Traditionally for", value: "Culmination, celebration, gratitude, release of what is finished.", tone: "tradition" },
    ],
    tags: ["full", "culmination", "release", "bright"],
  }),
  alm({
    id: "almanac-waning-gibbous",
    name: "Waning Gibbous",
    category: "Moon phase",
    summary:
      "Just past Full, the lit portion begins to shrink while still more than half illuminated. 'Waning' means the light is decreasing each night.",
    fields: [
      { label: "What it is", value: "More than half lit but now decreasing, the shape just after the Full Moon." },
      { label: "Where to look", value: "Rises in the mid-evening; high in the early-morning hours." },
      { label: "Traditionally for", value: "Gratitude, sharing, integrating what you've learned.", tone: "tradition" },
    ],
    tags: ["gibbous", "waning", "decreasing", "gratitude"],
  }),
  alm({
    id: "almanac-last-quarter",
    name: "Last Quarter",
    category: "Moon phase",
    summary:
      "Three quarters through the cycle, we again see half the disc lit — the left half, in the Northern Hemisphere. Also called the Third Quarter.",
    aka: ["Third Quarter"],
    fields: [
      { label: "What it is", value: "Three quarters through the cycle; the Moon is 90° from the Sun on the far side, so the left half is lit." },
      { label: "Where to look", value: "Rises around midnight, high in the south at dawn." },
      { label: "Traditionally for", value: "Releasing, forgiving, clearing space and letting go.", tone: "tradition" },
    ],
    tags: ["half moon", "third quarter", "release", "letting go"],
  }),
  alm({
    id: "almanac-waning-crescent",
    name: "Waning Crescent",
    category: "Moon phase",
    summary:
      "A shrinking sliver of light on the Moon's left edge (Northern Hemisphere) in the final days before the New Moon. Sometimes called the 'balsamic' moon in folk practice.",
    aka: ["Balsamic Moon"],
    fields: [
      { label: "What it is", value: "A thinning sliver lit on the left (Northern Hemisphere) as the Moon returns toward the Sun's direction." },
      { label: "Where to look", value: "Low in the east just before sunrise." },
      { label: "Traditionally for", value: "Rest, reflection, surrender, and preparing for the next cycle.", tone: "tradition" },
    ],
    tags: ["crescent", "waning", "balsamic", "rest", "reflection"],
  }),

  /* ─────────────── Lunar mechanics ─────────────── */
  alm({
    id: "almanac-synodic-month",
    name: "Synodic Month",
    category: "Lunar cycle",
    summary:
      "The time from one New Moon to the next averages about 29.53 days — the full cycle of phases. It is longer than the Moon's 27.3-day orbit because Earth also moves around the Sun, so the Moon must travel a little farther to line up again.",
    aka: ["lunation", "lunar month"],
    fields: [
      { label: "What it is", value: "One complete cycle of phases, New Moon to New Moon: about 29.53 days." },
      { label: "Why not 27.3 days", value: "The 27.3-day sidereal orbit is relative to the stars; Earth's own motion around the Sun adds ~2 extra days to realign Sun, Earth, and Moon." },
      { label: "In practice", value: "About 12.37 lunations fit in a year, which is why some years have 13 full moons." },
    ],
    tags: ["lunation", "29.5 days", "phase cycle", "sidereal"],
  }),
  alm({
    id: "almanac-supermoon",
    name: "Supermoon (Perigee) & Apogee",
    category: "Lunar cycle",
    summary:
      "The Moon's orbit is an ellipse, so its distance varies. Perigee is the closest point (~363,000 km) and apogee the farthest (~405,000 km). A Full Moon near perigee looks slightly larger and brighter — popularly a 'supermoon'.",
    aka: ["perigee", "apogee", "super moon"],
    fields: [
      { label: "What it is", value: "Perigee = Moon nearest Earth; apogee = Moon farthest. The orbit is elliptical, not a perfect circle." },
      { label: "Supermoon", value: "A Full (or New) Moon near perigee. It appears up to ~14% larger and ~30% brighter than at apogee." },
      { label: "Reality check", value: "The size difference is real but subtle to the eye; the famous 'huge moon on the horizon' is mostly a perception illusion." },
    ],
    tags: ["supermoon", "perigee", "apogee", "distance", "elliptical orbit"],
  }),

  /* ─────────────── Full moon names (folk tradition) ─────────────── */
  alm({
    id: "almanac-full-moon-names-winter",
    name: "Winter Full Moons — Wolf, Snow, Worm",
    category: "Full moon names",
    summary:
      "Traditional names, popularised by almanacs and drawn largely from Native American, Colonial, and European folk calendars, mark each month's Full Moon. The deep-winter trio runs January through March.",
    fields: [
      { label: "January — Wolf Moon", value: "Named for wolves heard howling in the cold of midwinter.", tone: "tradition" },
      { label: "February — Snow Moon", value: "For the heavy snowfalls typical of the month; also called the Hunger Moon.", tone: "tradition" },
      { label: "March — Worm Moon", value: "For earthworm casts appearing as the ground thaws; also the Crow or Sap Moon.", tone: "tradition" },
    ],
    tags: ["wolf moon", "snow moon", "worm moon", "winter", "almanac names"],
  }),
  alm({
    id: "almanac-full-moon-names-spring",
    name: "Spring Full Moons — Pink, Flower, Strawberry",
    category: "Full moon names",
    summary:
      "The spring Full Moons, April through June, are named for the season's blooms and first harvests in traditional almanac lore.",
    fields: [
      { label: "April — Pink Moon", value: "For the pink wild ground phlox of early spring, not a pink-coloured moon.", tone: "tradition" },
      { label: "May — Flower Moon", value: "For the abundance of blossoms; also the Milk or Hare Moon.", tone: "tradition" },
      { label: "June — Strawberry Moon", value: "For the short strawberry-harvest season in northeastern North America.", tone: "tradition" },
    ],
    tags: ["pink moon", "flower moon", "strawberry moon", "spring", "almanac names"],
  }),
  alm({
    id: "almanac-full-moon-names-summer",
    name: "Summer Full Moons — Buck, Sturgeon, Harvest/Corn",
    category: "Full moon names",
    summary:
      "The summer Full Moons, July through September, mark antler growth, fishing, and the start of harvest in traditional almanac lore.",
    fields: [
      { label: "July — Buck Moon", value: "For male deer growing new antlers in midsummer; also the Thunder Moon.", tone: "tradition" },
      { label: "August — Sturgeon Moon", value: "For the large sturgeon once readily caught in the Great Lakes this month.", tone: "tradition" },
      { label: "September — Corn / Harvest Moon", value: "For the corn harvest. The Harvest Moon is the Full Moon nearest the autumn equinox, often September.", tone: "tradition" },
    ],
    tags: ["buck moon", "sturgeon moon", "corn moon", "harvest moon", "summer"],
  }),
  alm({
    id: "almanac-full-moon-names-autumn",
    name: "Autumn Full Moons — Harvest, Hunter's, Beaver, Cold",
    category: "Full moon names",
    summary:
      "The late-year Full Moons mark the harvest, the hunt, and the onset of winter. The Harvest and Hunter's Moons are tied to the autumn equinox rather than fixed to a calendar month.",
    fields: [
      { label: "Harvest Moon", value: "The Full Moon nearest the autumn equinox; rises soon after sunset for several nights, lighting the late harvest.", tone: "tradition" },
      { label: "October — Hunter's Moon", value: "The Full Moon after the Harvest Moon, by tradition a time to hunt and lay in meat for winter.", tone: "tradition" },
      { label: "November — Beaver Moon", value: "For beavers building winter lodges; also the Frost Moon.", tone: "tradition" },
      { label: "December — Cold Moon", value: "For the long, cold nights of early winter; also the Long Night Moon.", tone: "tradition" },
    ],
    tags: ["harvest moon", "hunters moon", "beaver moon", "cold moon", "autumn"],
  }),
  alm({
    id: "almanac-blue-moon",
    name: "Blue Moon",
    category: "Full moon names",
    summary:
      "A 'blue moon' is an extra Full Moon that doesn't fit the usual naming scheme — either the second Full Moon in a calendar month, or the third of four in a single season. It has nothing to do with colour.",
    fields: [
      { label: "Monthly blue moon", value: "The second Full Moon within one calendar month (possible because the ~29.5-day cycle is shorter than most months)." },
      { label: "Seasonal blue moon", value: "The older definition: the third Full Moon in a season that has four instead of the usual three." },
      { label: "Note", value: "The Moon does not actually turn blue; rare bluish tints come from dust or smoke in the atmosphere." },
    ],
    tags: ["blue moon", "extra full moon", "rare", "calendar"],
  }),

  /* ─────────────── Solstices, equinoxes, cross-quarters (astronomy) ─────────────── */
  alm({
    id: "almanac-summer-solstice",
    name: "Summer Solstice",
    category: "Solstice & equinox",
    summary:
      "Around June 20–21 in the Northern Hemisphere, the Sun reaches its highest, northernmost point in the sky, giving the longest day and shortest night. It marks the astronomical start of summer.",
    fields: [
      { label: "What it is", value: "The Sun reaches its greatest declination north; for the Northern Hemisphere, the longest day of the year." },
      { label: "Date", value: "About June 20–21 (Northern Hemisphere); around December 21 it is the Southern Hemisphere's summer solstice." },
      { label: "Cause", value: "Earth's ~23.4° axial tilt points the relevant pole most directly toward the Sun." },
    ],
    tags: ["solstice", "longest day", "june", "midsummer"],
  }),
  alm({
    id: "almanac-winter-solstice",
    name: "Winter Solstice",
    category: "Solstice & equinox",
    summary:
      "Around December 21 in the Northern Hemisphere, the Sun reaches its lowest, southernmost point, giving the shortest day and longest night. After it, daylight lengthens again.",
    fields: [
      { label: "What it is", value: "The Sun reaches its greatest declination south; for the Northern Hemisphere, the shortest day of the year." },
      { label: "Date", value: "About December 21–22 (Northern Hemisphere); around June 21 it is the Southern Hemisphere's winter solstice." },
      { label: "Cause", value: "Earth's axial tilt points the relevant pole most directly away from the Sun." },
    ],
    tags: ["solstice", "shortest day", "december", "midwinter"],
  }),
  alm({
    id: "almanac-spring-equinox",
    name: "Spring (Vernal) Equinox",
    category: "Solstice & equinox",
    summary:
      "Around March 20, the Sun crosses the celestial equator heading north, and day and night are nearly equal worldwide. It marks the astronomical start of spring in the Northern Hemisphere.",
    aka: ["vernal equinox"],
    fields: [
      { label: "What it is", value: "The Sun crosses the celestial equator moving northward; daylight and darkness are roughly equal everywhere." },
      { label: "Date", value: "About March 19–20 (Northern Hemisphere spring; Southern Hemisphere autumn)." },
      { label: "Cause", value: "Earth's tilted axis is sideways-on to the Sun, so neither pole leans toward it." },
    ],
    tags: ["equinox", "vernal", "march", "equal day night"],
  }),
  alm({
    id: "almanac-autumn-equinox",
    name: "Autumn (Autumnal) Equinox",
    category: "Solstice & equinox",
    summary:
      "Around September 22–23, the Sun crosses the celestial equator heading south, and day and night are again nearly equal. It marks the astronomical start of autumn in the Northern Hemisphere.",
    aka: ["autumnal equinox", "fall equinox"],
    fields: [
      { label: "What it is", value: "The Sun crosses the celestial equator moving southward; daylight and darkness are roughly equal everywhere." },
      { label: "Date", value: "About September 22–23 (Northern Hemisphere autumn; Southern Hemisphere spring)." },
      { label: "Cause", value: "Earth's tilted axis is sideways-on to the Sun, so neither pole leans toward it." },
    ],
    tags: ["equinox", "autumnal", "september", "equal day night"],
  }),
  alm({
    id: "almanac-cross-quarter-days",
    name: "Cross-Quarter Days",
    category: "Solstice & equinox",
    summary:
      "The four days that fall roughly midway between a solstice and an equinox — near the start of February, May, August, and November. Astronomically they mark the midpoints of the seasons; traditionally they became major festivals.",
    fields: [
      { label: "What they are", value: "The midpoints between solstices and equinoxes: ~Feb 1, ~May 1, ~Aug 1, and ~Nov 1." },
      { label: "Astronomy", value: "Each marks the Sun reaching the halfway point of its journey between a solstice and an equinox along the ecliptic." },
      { label: "Tradition", value: "These dates anchor the cross-quarter sabbats Imbolc, Beltane, Lughnasadh, and Samhain.", tone: "tradition" },
    ],
    tags: ["cross quarter", "midpoint", "season", "sabbat"],
  }),

  /* ─────────────── Wheel of the Year sabbats (seasonal tradition) ─────────────── */
  alm({
    id: "almanac-samhain",
    name: "Samhain",
    category: "Wheel of the Year",
    summary:
      "A cross-quarter sabbat around October 31 – November 1 marking the end of harvest and the start of winter's dark half. In tradition it is when the veil between worlds is thinnest, honouring ancestors and the dead.",
    aka: ["Halloween", "Hallowe'en"],
    fields: [
      { label: "Date", value: "October 31 – November 1 (Northern Hemisphere)." },
      { label: "Meaning", value: "The Celtic new year and harvest's end, the doorway into winter.", tone: "tradition" },
      { label: "Themes", value: "Ancestors, remembrance, divination, endings, and the thinning veil.", tone: "tradition" },
    ],
    tags: ["samhain", "halloween", "ancestors", "cross quarter", "autumn"],
  }),
  alm({
    id: "almanac-yule",
    name: "Yule",
    category: "Wheel of the Year",
    summary:
      "The midwinter sabbat at the winter solstice (around December 21), celebrating the return of the light as days begin to lengthen again. Many of its customs — evergreens, the Yule log, gift-giving — shaped later midwinter festivals.",
    aka: ["Midwinter", "Winter Solstice festival"],
    fields: [
      { label: "Date", value: "Around December 21, the winter solstice (Northern Hemisphere)." },
      { label: "Meaning", value: "The rebirth of the Sun; the longest night gives way to lengthening days.", tone: "tradition" },
      { label: "Themes", value: "Renewal, hope, hearth and home, evergreens, and quiet endurance.", tone: "tradition" },
    ],
    tags: ["yule", "midwinter", "solstice", "return of light", "evergreens"],
  }),
  alm({
    id: "almanac-imbolc",
    name: "Imbolc",
    category: "Wheel of the Year",
    summary:
      "A cross-quarter sabbat around February 1–2 marking the first stirrings of spring and lengthening light. Associated with the goddess and saint Brigid, it celebrates purification, hope, and new growth.",
    aka: ["Candlemas", "Brigid's Day", "Imbolg"],
    fields: [
      { label: "Date", value: "February 1–2 (Northern Hemisphere)." },
      { label: "Meaning", value: "Midpoint between winter solstice and spring equinox; the earliest signs of spring.", tone: "tradition" },
      { label: "Themes", value: "Light returning, purification, fresh starts, Brigid, milk and lambs.", tone: "tradition" },
    ],
    tags: ["imbolc", "candlemas", "brigid", "cross quarter", "spring"],
  }),
  alm({
    id: "almanac-ostara",
    name: "Ostara",
    category: "Wheel of the Year",
    summary:
      "The spring sabbat at the vernal equinox (around March 20), celebrating balance, fertility, and the full arrival of spring. Its symbols of eggs and hares carry into later spring customs.",
    aka: ["Spring Equinox festival", "Eostre"],
    fields: [
      { label: "Date", value: "Around March 20, the spring equinox (Northern Hemisphere)." },
      { label: "Meaning", value: "Day and night in balance, with light now overtaking dark; the green world awakens.", tone: "tradition" },
      { label: "Themes", value: "Fertility, balance, new growth, eggs, hares, and fresh beginnings.", tone: "tradition" },
    ],
    tags: ["ostara", "spring equinox", "eostre", "fertility", "balance"],
  }),
  alm({
    id: "almanac-beltane",
    name: "Beltane",
    category: "Wheel of the Year",
    summary:
      "A cross-quarter sabbat around May 1 marking the height of spring and the start of summer's bright half. Traditionally a fire festival of fertility, passion, and abundance, with bonfires and maypoles.",
    aka: ["May Day", "Beltaine"],
    fields: [
      { label: "Date", value: "May 1 (Northern Hemisphere)." },
      { label: "Meaning", value: "The opposite point of the year to Samhain; life, growth, and union at their peak.", tone: "tradition" },
      { label: "Themes", value: "Fertility, passion, bonfires, maypoles, flowers, and vitality.", tone: "tradition" },
    ],
    tags: ["beltane", "may day", "fire festival", "fertility", "cross quarter"],
  }),
  alm({
    id: "almanac-litha",
    name: "Litha",
    category: "Wheel of the Year",
    summary:
      "The midsummer sabbat at the summer solstice (around June 21), celebrating the Sun at its zenith and the longest day. A high point of light and abundance before the slow turn toward darkness.",
    aka: ["Midsummer", "Summer Solstice festival"],
    fields: [
      { label: "Date", value: "Around June 21, the summer solstice (Northern Hemisphere)." },
      { label: "Meaning", value: "The Sun at full strength; the year's peak of light before days begin to shorten.", tone: "tradition" },
      { label: "Themes", value: "Vitality, power, abundance, solar fire, and gratitude.", tone: "tradition" },
    ],
    tags: ["litha", "midsummer", "summer solstice", "longest day", "sun"],
  }),
  alm({
    id: "almanac-lughnasadh",
    name: "Lughnasadh / Lammas",
    category: "Wheel of the Year",
    summary:
      "A cross-quarter sabbat around August 1 marking the first harvest, especially of grain. Named for the god Lugh (Lughnasadh) and for the loaf-mass of bread (Lammas), it celebrates the first fruits and the labour of reaping.",
    aka: ["Lammas", "Lúnasa", "First Harvest"],
    fields: [
      { label: "Date", value: "August 1 (Northern Hemisphere)." },
      { label: "Meaning", value: "The first of three harvest festivals; the grain is cut and the year's bounty begins to come in.", tone: "tradition" },
      { label: "Themes", value: "Gratitude, first fruits, bread, skill and craft, sacrifice and reward.", tone: "tradition" },
    ],
    tags: ["lughnasadh", "lammas", "first harvest", "grain", "cross quarter"],
  }),
  alm({
    id: "almanac-mabon",
    name: "Mabon",
    category: "Wheel of the Year",
    summary:
      "The autumn sabbat at the fall equinox (around September 22), the second harvest and a festival of balance and thanksgiving. Light and dark stand equal as the year tips toward winter.",
    aka: ["Autumn Equinox festival", "Second Harvest"],
    fields: [
      { label: "Date", value: "Around September 22, the autumn equinox (Northern Hemisphere)." },
      { label: "Meaning", value: "Day and night in balance again, with darkness now gaining; the main harvest is gathered.", tone: "tradition" },
      { label: "Themes", value: "Thanksgiving, balance, reaping what was sown, sharing, and preparation.", tone: "tradition" },
    ],
    tags: ["mabon", "autumn equinox", "second harvest", "thanksgiving", "balance"],
  }),

  /* ─────────────── Planetary days of the week (tradition) ─────────────── */
  alm({
    id: "almanac-monday-moon",
    name: "Monday — the Moon",
    category: "Planetary days",
    summary:
      "Monday is traditionally the day of the Moon, a link preserved in its name (Old English Mōnandæg, 'Moon's day'; French lundi, from luna). In planetary correspondence it governs emotion, intuition, and the home.",
    fields: [
      { label: "Ruling body", value: "The Moon." },
      { label: "Name origin", value: "Mōnandæg ('Moon's day') in Old English; lundi / lunedì from Latin Luna in the Romance languages." },
      { label: "Correspondences", value: "Emotion, intuition, dreams, the home, the feminine, silver, and the colours white and pale blue.", tone: "tradition" },
    ],
    tags: ["monday", "moon", "lundi", "intuition", "planetary day"],
  }),
  alm({
    id: "almanac-tuesday-mars",
    name: "Tuesday — Mars",
    category: "Planetary days",
    summary:
      "Tuesday is traditionally ruled by Mars. The English name honours Tiw, a Germanic war god equated with Mars, while Romance languages keep Mars directly (French mardi). It governs courage, drive, and conflict.",
    fields: [
      { label: "Ruling body", value: "Mars." },
      { label: "Name origin", value: "Tīwesdæg ('Tiw's day', a war god); mardi / martes from Mars in the Romance languages." },
      { label: "Correspondences", value: "Courage, energy, willpower, passion, conflict, iron, and the colour red.", tone: "tradition" },
    ],
    tags: ["tuesday", "mars", "mardi", "courage", "planetary day"],
  }),
  alm({
    id: "almanac-wednesday-mercury",
    name: "Wednesday — Mercury",
    category: "Planetary days",
    summary:
      "Wednesday is traditionally ruled by Mercury. The English name honours Woden (Odin), equated with Mercury, while Romance languages keep Mercury directly (French mercredi). It governs communication, intellect, and travel.",
    fields: [
      { label: "Ruling body", value: "Mercury." },
      { label: "Name origin", value: "Wōdnesdæg ('Woden's day'); mercredi / miércoles from Mercury in the Romance languages." },
      { label: "Correspondences", value: "Communication, intellect, study, commerce, travel, quicksilver, and the colours yellow and orange.", tone: "tradition" },
    ],
    tags: ["wednesday", "mercury", "mercredi", "communication", "planetary day"],
  }),
  alm({
    id: "almanac-thursday-jupiter",
    name: "Thursday — Jupiter",
    category: "Planetary days",
    summary:
      "Thursday is traditionally ruled by Jupiter. The English name honours Thor, equated with Jupiter the thunderer, while Romance languages keep Jupiter directly (French jeudi). It governs growth, fortune, and expansion.",
    fields: [
      { label: "Ruling body", value: "Jupiter." },
      { label: "Name origin", value: "Þūnresdæg ('Thunor/Thor's day'); jeudi / jueves from Jove (Jupiter) in the Romance languages." },
      { label: "Correspondences", value: "Abundance, growth, luck, wisdom, generosity, tin, and the colours royal blue and purple.", tone: "tradition" },
    ],
    tags: ["thursday", "jupiter", "jeudi", "abundance", "planetary day"],
  }),
  alm({
    id: "almanac-friday-venus",
    name: "Friday — Venus",
    category: "Planetary days",
    summary:
      "Friday is traditionally ruled by Venus. The English name honours Frigg/Freya, equated with Venus, while Romance languages keep Venus directly (French vendredi). It governs love, beauty, and harmony.",
    fields: [
      { label: "Ruling body", value: "Venus." },
      { label: "Name origin", value: "Frīgedæg ('Frigg's day'); vendredi / viernes from Venus in the Romance languages." },
      { label: "Correspondences", value: "Love, beauty, friendship, pleasure, art, harmony, copper, and the colours green and pink.", tone: "tradition" },
    ],
    tags: ["friday", "venus", "vendredi", "love", "planetary day"],
  }),
  alm({
    id: "almanac-saturday-saturn",
    name: "Saturday — Saturn",
    category: "Planetary days",
    summary:
      "Saturday is traditionally ruled by Saturn, the only weekday in English to keep its Roman planetary name directly (from Saturn's day). It governs discipline, boundaries, time, and endings.",
    fields: [
      { label: "Ruling body", value: "Saturn." },
      { label: "Name origin", value: "Sæternesdæg ('Saturn's day') — the one English weekday still named for a Roman planet." },
      { label: "Correspondences", value: "Discipline, structure, boundaries, time, protection, banishing, lead, and the colours black and deep grey.", tone: "tradition" },
    ],
    tags: ["saturday", "saturn", "discipline", "boundaries", "planetary day"],
  }),
  alm({
    id: "almanac-sunday-sun",
    name: "Sunday — the Sun",
    category: "Planetary days",
    summary:
      "Sunday is traditionally the day of the Sun, preserved in its name (Old English Sunnandæg, 'Sun's day'). In planetary correspondence it governs vitality, success, confidence, and the self.",
    fields: [
      { label: "Ruling body", value: "The Sun." },
      { label: "Name origin", value: "Sunnandæg ('Sun's day'); the Romance domingo / dimanche instead derive from 'the Lord's day'." },
      { label: "Correspondences", value: "Vitality, success, confidence, leadership, health, gold, and the colours gold and yellow.", tone: "tradition" },
    ],
    tags: ["sunday", "sun", "vitality", "success", "planetary day"],
  }),

  /* ─────────────── Eclipses & nodes (astronomy + tradition) ─────────────── */
  alm({
    id: "almanac-solar-eclipse",
    name: "Solar Eclipse",
    category: "Eclipses & nodes",
    summary:
      "At a New Moon, the Moon can pass directly between Earth and the Sun, casting its shadow on Earth and blocking some or all of the Sun's disc. It is only visible from the narrow track of that shadow.",
    fields: [
      { label: "What it is", value: "The Moon passes between Earth and the Sun, blocking the Sun's light for observers in its shadow." },
      { label: "When", value: "Only at a New Moon, and only when the Moon is near a node — which is why they don't happen every month." },
      { label: "Types", value: "Total (the disc is fully covered, revealing the corona), partial, and annular (a bright 'ring of fire' when the Moon is too far to fully cover the Sun)." },
      { label: "Safety", value: "Never look at the partially eclipsed Sun without certified solar filters — it can permanently damage your eyes.", tone: "safety" },
      { label: "Tradition", value: "Long read as omens of upheaval or sudden change, and in astrology as potent turning points.", tone: "tradition" },
    ],
    safety: "Never look directly at a partial or annular solar eclipse without certified solar-viewing glasses or filters; ordinary sunglasses are not safe.",
    tags: ["solar eclipse", "new moon", "node", "ring of fire", "corona"],
  }),
  alm({
    id: "almanac-lunar-eclipse",
    name: "Lunar Eclipse",
    category: "Eclipses & nodes",
    summary:
      "At a Full Moon, the Moon can pass into Earth's shadow, dimming and often reddening as it does. During totality it glows coppery — the 'blood moon' — from sunlight bent through Earth's atmosphere.",
    aka: ["blood moon"],
    fields: [
      { label: "What it is", value: "Earth passes between the Sun and Moon, and the Moon moves into Earth's shadow." },
      { label: "When", value: "Only at a Full Moon, and only when the Moon is near a node." },
      { label: "Blood moon", value: "In a total lunar eclipse the Moon turns red because Earth's atmosphere bends and filters sunlight onto it." },
      { label: "Viewing", value: "Completely safe to watch with the naked eye, unlike a solar eclipse." },
      { label: "Tradition", value: "Like solar eclipses, long seen as omens; in astrology, emotional culminations and releases.", tone: "tradition" },
    ],
    tags: ["lunar eclipse", "full moon", "blood moon", "earth shadow", "node"],
  }),
  alm({
    id: "almanac-lunar-nodes",
    name: "Lunar Nodes",
    category: "Eclipses & nodes",
    summary:
      "The two points where the Moon's tilted orbit crosses the plane of Earth's orbit (the ecliptic). Eclipses can only occur when a New or Full Moon falls near one of these nodes, which slowly drift around the sky.",
    aka: ["North Node", "South Node", "Rahu", "Ketu"],
    fields: [
      { label: "What they are", value: "The two crossing points of the Moon's orbit with the ecliptic: the ascending (north) and descending (south) nodes." },
      { label: "Why they matter", value: "Eclipses happen only near a node, when Sun, Earth, and Moon can align closely enough." },
      { label: "Drift", value: "The nodes slowly move westward, completing a full cycle in about 18.6 years." },
      { label: "Tradition", value: "In astrology the North Node points to growth and destiny, the South Node to the familiar and the past; in Vedic lore they are Rahu and Ketu.", tone: "tradition" },
    ],
    tags: ["lunar nodes", "north node", "south node", "rahu", "ketu", "ecliptic"],
  }),
];
