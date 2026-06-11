/**
 * Weather Lore — Traditional weather proverbs, sayings, and folk wisdom.
 * Rotates by day-of-year for almanac display.
 */

export interface WeatherProverb {
  saying: string;
  meaning: string;
  origin?: string;
}

const PROVERBS: WeatherProverb[] = [
  { saying: "Red sky at night, sailor's delight. Red sky in morning, sailor's warning.", meaning: "A red sunset indicates high pressure (fair weather) approaching from the west; a red sunrise means it has passed.", origin: "English maritime" },
  { saying: "When the dew is on the grass, rain will never come to pass.", meaning: "Dew forms on clear, calm nights — signs of stable high pressure.", origin: "English farming" },
  { saying: "A ring around the moon means rain is coming soon.", meaning: "Halos form when ice crystals in cirrus clouds refract light — cirrus often precede warm fronts.", origin: "European" },
  { saying: "If March comes in like a lion, it will go out like a lamb.", meaning: "Rough weather at the start of March often gives way to mild weather by month's end.", origin: "English proverb" },
  { saying: "When swallows fly low, rain is on the way.", meaning: "Insects fly lower in humid air before storms, and swallows follow them down.", origin: "European rural" },
  { saying: "Clear moon, frost soon.", meaning: "A clearly visible moon means no cloud cover to trap heat — frost is likely overnight.", origin: "English farming" },
  { saying: "If the rooster crows at night, he crows at the sight of rain.", meaning: "Restless roosters at night may sense dropping barometric pressure.", origin: "Southern U.S." },
  { saying: "Rain before seven, fine by eleven.", meaning: "Morning rain from overnight fronts often clears by late morning.", origin: "English" },
  { saying: "When clouds appear like rocks and towers, the earth's refreshed by frequent showers.", meaning: "Towering cumulus clouds signal atmospheric instability and thunderstorms.", origin: "English" },
  { saying: "A cow with its tail to the west makes weather the best; a cow with its tail to the east makes weather the least.", meaning: "Cows graze facing away from the wind — westerlies bring fair weather.", origin: "English farming" },
  { saying: "If bees stay at home, rain will soon come. If they fly away, fine will be the day.", meaning: "Bees can sense humidity changes and stay close to the hive before rain.", origin: "European beekeeping" },
  { saying: "Evening red and morning gray sets the traveler on his way.", meaning: "Gray mornings often precede clearing skies, safe for travel.", origin: "English" },
  { saying: "When the stars begin to huddle, the earth will soon become a puddle.", meaning: "When fewer stars are visible, thin clouds are moving in ahead of rain.", origin: "American frontier" },
  { saying: "The sharper the blast, the sooner it's past.", meaning: "Intense, violent storms tend to be short-lived; gentle rain lasts longer.", origin: "English maritime" },
  { saying: "Mackerel sky and mares' tails make tall ships carry low sails.", meaning: "Cirrocumulus (mackerel sky) and cirrus (mares' tails) signal approaching storm systems.", origin: "English naval" },
  { saying: "When the wind is in the south, the rain is in its mouth.", meaning: "Southerly winds often carry moisture from the Gulf up into the continent.", origin: "American South" },
  { saying: "If spiders spin their webs by noon, fine weather is coming soon.", meaning: "Spiders sense barometric pressure and spin when conditions are stable.", origin: "European folk" },
  { saying: "A year of snow, a year of plenty.", meaning: "Snow cover protects winter crops and slowly releases moisture for spring growth.", origin: "French farming" },
  { saying: "When smoke descends, good weather ends.", meaning: "Smoke hanging low indicates falling pressure and approaching bad weather.", origin: "American frontier" },
  { saying: "No weather is ill if the wind be still.", meaning: "Calm winds often indicate a stable high pressure system overhead.", origin: "English" },
  { saying: "If the sun sets clear on Friday night, rain will come before Monday night.", meaning: "Weekend fair weather after a clear Friday often precedes an early-week system.", origin: "American Midwest" },
  { saying: "Sound traveling far and wide, a stormy day will betide.", meaning: "Sound carries farther when humidity is high and pressure is dropping.", origin: "English rural" },
  { saying: "When leaves show their undersides, be sure rain betides.", meaning: "Increased humidity makes leaves curl, showing their lighter undersides.", origin: "English" },
  { saying: "Oak before ash, in for a splash. Ash before oak, in for a soak.", meaning: "Whichever tree leafs out first predicts summer rainfall.", origin: "English" },
  { saying: "Anvil-shaped clouds bring thunderstorms and hail.", meaning: "Cumulonimbus clouds with anvil tops indicate severe convective storms.", origin: "American storm-watching" },
  { saying: "When the wind backs and the barometer falls, prepare yourself for gales and squalls.", meaning: "Backing winds with falling pressure signal a deepening low approaching.", origin: "English maritime" },
  { saying: "Pale moon rains, red moon blows; white moon neither rains nor snows.", meaning: "Moon color reflects atmospheric moisture and dust content.", origin: "European" },
  { saying: "The higher the clouds, the finer the weather.", meaning: "High clouds indicate stable air and no nearby fronts.", origin: "European" },
  { saying: "Three days of rain will empty any sky.", meaning: "Most weather systems pass within three days.", origin: "Southern U.S." },
  { saying: "A summer fog for fair, a winter fog for rain.", meaning: "Summer fog forms under high pressure; winter fog forms when warm air overruns cold, presaging rain.", origin: "American" },
  { saying: "Rainbow in the morning gives you fair warning.", meaning: "Morning rainbows appear in the west where storms approach from.", origin: "English maritime" },
  { saying: "If the goose honks high, fair weather. If the goose honks low, foul weather.", meaning: "Geese fly higher in high pressure and lower when pressure drops.", origin: "American frontier" },
  { saying: "The wider the ring around the moon, the nearer the rain.", meaning: "A large halo means thin clouds at high altitude; the nearer the approaching front.", origin: "European" },
  { saying: "No dew in the morning means rain by evening.", meaning: "Clouds overnight prevent dew formation and usually bring rain.", origin: "English farming" },
  { saying: "When the glass falls low, prepare for a blow. When it rises high, let all your kites fly.", meaning: "A falling barometer warns of storms; a rising one promises fair weather.", origin: "English maritime" },
  { saying: "Frost and fair weather seldom go together.", meaning: "Wait — they often do! This is a contrarian saying reminding us weather defies expectations.", origin: "Scottish" },
  { saying: "If February give much snow, a fine summer it doth foreshow.", meaning: "Cold, snowy winters are often followed by warm, dry summers.", origin: "English" },
  { saying: "Catchy winds and catchy rains — neither long will remain.", meaning: "Gusty, intermittent conditions signal a front passing quickly.", origin: "English" },
  { saying: "When grass is dry at morning light, look for rain before the night.", meaning: "No morning dew suggests cloud cover and incoming moisture.", origin: "English farming" },
  { saying: "March winds and April showers bring forth May flowers.", meaning: "Spring's progression from wind to rain naturally produces blooming.", origin: "English proverb" },
  { saying: "If woolly caterpillars are mostly black, the coming winter will be harsh.", meaning: "Folk wisdom says darker woolly bears predict colder winters.", origin: "American folk" },
  { saying: "Onion skins very thin, mild winter coming in. Onion skins thick and tough, coming winter cold and rough.", meaning: "Plants may develop thicker skins in response to pre-winter conditions.", origin: "American farming" },
  { saying: "When the chairs squeak, it's about rain they speak.", meaning: "Increased humidity makes wood swell and furniture joints creak.", origin: "European household" },
  { saying: "Evening gray and morning red, the traveler lifts his head.", meaning: "Gray evenings and red mornings both precede clearing weather.", origin: "Dutch" },
  { saying: "If birds fly low, expect rain and a blow.", meaning: "Low air pressure pushes birds and insects to fly at lower altitudes.", origin: "English" },
  { saying: "Mare's tails and mackerel scales make lofty ships carry low sails.", meaning: "Cirrus and altocumulus clouds warn of approaching fronts within 12-24 hours.", origin: "English naval" },
  { saying: "January warm, the Lord have mercy.", meaning: "An unseasonably warm January was seen as an ominous sign for the year ahead.", origin: "Southern U.S." },
  { saying: "When the perfume of flowers is unusually strong, rain is near.", meaning: "Falling pressure and high humidity release and trap scent molecules near ground level.", origin: "European" },
  { saying: "If the first week in August is unusually warm, the coming winter will be snowy and long.", meaning: "Weather pattern correlations noted over centuries of farming.", origin: "American Midwest" },
  { saying: "The north wind doth blow, and we shall have snow.", meaning: "North winds in winter bring polar air masses south.", origin: "English nursery rhyme" },
  { saying: "Sun dogs in the morning, sailors take warning.", meaning: "Sun dogs (parhelia) form from ice crystals in cirrus clouds preceding storm fronts.", origin: "English maritime" },
  { saying: "When the night has a fever, it cries in the morning.", meaning: "A warm, humid night often produces morning fog or dew — and sometimes rain by afternoon.", origin: "Spanish" },
  { saying: "A wind in the south has rain in her mouth.", meaning: "Southerly winds carry Gulf moisture northward, bringing rain.", origin: "Texas ranching" },
  { saying: "If the sunset is pale yellow, there will be rain tomorrow.", meaning: "A washed-out yellow sunset indicates moisture in the air to the west.", origin: "European" },
  { saying: "Flowers blooming in late autumn, a sign of a bad winter.", meaning: "Late blooms may indicate unusual warmth that often precedes harsh cold snaps.", origin: "German farming" },
  { saying: "Dust rising in dry weather is a sign of approaching change.", meaning: "Convective currents lifting dust often precede thunderstorm development.", origin: "American Plains" },
  { saying: "A sunny Christmas means an Easter in white.", meaning: "Mild December patterns sometimes correlate with cold springs.", origin: "German" },
  { saying: "When ditches and ponds offend the nose, look out for rain and stormy blows.", meaning: "Low pressure releases trapped gases from stagnant water.", origin: "English rural" },
  { saying: "Who shears his sheep before St. Servatius' Day loves his wool more than his sheep.", meaning: "Don't shear before mid-May — the Ice Saints (May 11-13) often bring late frost.", origin: "German farming" },
  { saying: "If the oak flowers before the ash, we shall have a splash. If the ash flowers before the oak, we shall have a soak.", meaning: "Whichever tree blooms first predicts whether summer will be dry or wet.", origin: "English" },
];

/**
 * Get a weather proverb for a given date. Rotates through the collection by day-of-year.
 */
export function getWeatherLore(date: Date): WeatherProverb {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  const index = dayOfYear % PROVERBS.length;
  return PROVERBS[index];
}

/**
 * Get weather proverb by explicit index (for testing or specific selection).
 */
export function getWeatherProverbByIndex(index: number): WeatherProverb {
  return PROVERBS[((index % PROVERBS.length) + PROVERBS.length) % PROVERBS.length];
}
