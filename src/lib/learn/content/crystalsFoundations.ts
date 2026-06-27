import type { Course } from "../types";

/**
 * FLAGSHIP COURSE #2 — Crystals, taught evidence-forward.
 * Real geology + history + tradition, with the science clearly separated and a
 * prominent safety module on toxic minerals. Facts verified against the research
 * blueprint (docs/learning-library-research.md).
 */
export const crystalsFoundations: Course = {
  id: "crystals-foundations",
  domain: "crystals",
  title: "Crystals: Tradition & Truth",
  subtitle: "The geology, the lore, and the safety",
  level: "foundations",
  icon: "💎",
  summary:
    "Learn what crystals actually are (real geology), the traditions and history around them, what the evidence does and doesn't support, and how to handle them safely.",
  estMinutes: 45,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,
  safetyNote:
    "Some minerals are genuinely toxic — never make 'gem water' or elixirs from cinnabar, galena, malachite, and others. This course covers exactly which, and why.",

  outline: [
    { module: "What a Crystal Actually Is", lessons: ["Mineral, rock, or crystal?", "The seven crystal systems", "The Mohs hardness scale", "How crystals form"] },
    { module: "History & a Field Guide", lessons: ["Ancient ornament vs modern healing", "The quartz family", "Beyond quartz"] },
    { module: "Practice, Safety & Evidence", lessons: ["Cleansing & charging", "Buying wisely", "Toxic crystals & elixir safety", "What the evidence says"] },
  ],

  modules: [
    {
      id: "m1",
      title: "What a Crystal Actually Is",
      lessons: [
        {
          id: "l1-mineral-rock-crystal",
          title: "Mineral, rock, or crystal?",
          objective: "Distinguish a mineral, a rock, and a crystal.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Before any lore, it helps to know what these objects actually are. The three words get used loosely, but they mean different things." },
            { kind: "list", items: [
              "A **mineral** is a naturally occurring, inorganic solid with a definite chemical composition and an ordered internal atomic structure (a 'crystal lattice').",
              "A **crystal** is a solid whose atoms are arranged in that repeating, ordered lattice — which is what gives many of them their flat faces and geometric shapes.",
              "A **rock** is an aggregate — a mixture of one or more minerals stuck together (granite, for example, is mostly quartz, feldspar, and mica).",
            ] },
            { kind: "callout", tone: "history", title: "Why 'healing crystal' is mostly quartz", text: "Most popular 'healing crystals' — clear quartz, amethyst, citrine, rose quartz — are varieties of one mineral, quartz. It's common, hard, and durable, so it survives being tumbled and sold." },
            { kind: "keyfacts", items: [
              "Mineral = natural, inorganic, defined chemistry, ordered lattice.",
              "Crystal = a solid with that ordered, repeating atomic structure.",
              "Rock = a mixture of minerals.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "What makes a solid a 'crystal' in the geological sense?", options: [
              { id: "a", text: "Its atoms are arranged in an ordered, repeating lattice", correct: true, explanation: "Exactly — the ordered internal structure is the defining feature." },
              { id: "b", text: "It is shiny and colorful", correct: false, explanation: "Appearance doesn't define a crystal; internal structure does." },
              { id: "c", text: "It was formed by a living organism", correct: false, explanation: "Minerals are inorganic by definition." },
            ] },
            { id: "q2", type: "mcq", prompt: "A rock is best described as…", options: [
              { id: "a", text: "An aggregate (mixture) of one or more minerals", correct: true, explanation: "Right — e.g., granite is a mix of quartz, feldspar, and mica." },
              { id: "b", text: "A single pure element", correct: false, explanation: "That would be a native element, not a rock." },
              { id: "c", text: "Any large crystal", correct: false, explanation: "Size doesn't make something a rock; being a mineral mixture does." },
            ] },
            { id: "q3", type: "true-false", prompt: "Clear quartz, amethyst, and citrine are all varieties of the same mineral.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they're all quartz (silicon dioxide)." },
              { id: "f", text: "False", correct: false, explanation: "They are in fact all quartz; the color differences come from impurities." },
            ] },
          ],
        },
        {
          id: "l2-crystal-systems",
          title: "The seven crystal systems",
          objective: "Recall that crystals are classified into seven systems by lattice symmetry.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Crystals are grouped by the symmetry of their internal lattice into seven 'crystal systems.' You don't need to memorize all the geometry — just know the classification exists and is based on structure, not color or value." },
            { kind: "table", headers: ["System", "Example mineral"], rows: [
              ["Cubic (isometric)", "Pyrite, halite, diamond"],
              ["Tetragonal", "Zircon"],
              ["Orthorhombic", "Topaz"],
              ["Hexagonal", "Beryl (emerald, aquamarine)"],
              ["Trigonal", "Quartz, calcite"],
              ["Monoclinic", "Gypsum (selenite), malachite"],
              ["Triclinic", "Turquoise, feldspar"],
            ] },
            { kind: "callout", tone: "tradition", title: "Where 'sacred geometry' meets real geometry", text: "Crystal shapes really are geometric — but for an ordinary physical reason (how atoms pack), not a mystical one. The honest version is genuinely beautiful: the outward shape is a direct echo of the atomic order inside." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Crystals are classified into seven systems based on…", options: [
              { id: "a", text: "The symmetry of their internal atomic lattice", correct: true, explanation: "Yes — the systems are defined by lattice symmetry." },
              { id: "b", text: "Their color", correct: false, explanation: "Color comes from impurities, not the system." },
              { id: "c", text: "Their monetary value", correct: false, explanation: "Value is a market factor, not a classification basis." },
            ] },
            { id: "q2", type: "mcq", prompt: "Which crystal system does quartz belong to?", options: [
              { id: "a", text: "Trigonal", correct: true, explanation: "Correct — quartz is trigonal." },
              { id: "b", text: "Cubic", correct: false, explanation: "Pyrite and halite are cubic; quartz is trigonal." },
              { id: "c", text: "Hexagonal", correct: false, explanation: "Beryl is hexagonal; quartz is trigonal (closely related but distinct)." },
            ] },
            { id: "q3", type: "true-false", prompt: "A crystal's geometric shape reflects the ordered arrangement of its atoms.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — the outer form echoes the internal lattice." },
              { id: "f", text: "False", correct: false, explanation: "It is true — outer shape mirrors atomic order." },
            ] },
          ],
        },
        {
          id: "l3-mohs-hardness",
          title: "The Mohs hardness scale",
          objective: "Use the Mohs scale to reason about how to care for a stone.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The Mohs scale (introduced by Friedrich Mohs in 1812) ranks mineral hardness from 1 (talc, softest) to 10 (diamond, hardest), based on which mineral can scratch which." },
            { kind: "callout", tone: "tip", title: "It's relative, not linear", text: "The scale is ordinal: diamond (10) is far more than ten times harder than talc (1). It tells you the order of hardness, not exact ratios." },
            { kind: "table", headers: ["Mineral", "Mohs"], rows: [
              ["Talc", "1"],
              ["Gypsum (selenite)", "2"],
              ["Calcite", "3"],
              ["Fluorite", "4"],
              ["Quartz (amethyst, etc.)", "7"],
              ["Diamond", "10"],
            ] },
            { kind: "text", text: "Why it matters in practice: a soft stone like selenite (2) scratches easily and even dissolves in water, while quartz (7) is tough enough to tumble and handle daily. Hardness is your first guide to safe care." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "On the Mohs scale, which is the SOFTEST?", options: [
              { id: "a", text: "Talc (1)", correct: true, explanation: "Right — talc defines 1, the soft end." },
              { id: "b", text: "Quartz (7)", correct: false, explanation: "Quartz is fairly hard at 7." },
              { id: "c", text: "Diamond (10)", correct: false, explanation: "Diamond is the hardest at 10." },
            ] },
            { id: "q2", type: "true-false", prompt: "The Mohs scale is linear, so a 10 is exactly ten times harder than a 1.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it's ordinal/relative, not linear." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it ranks order of hardness, not exact ratios." },
            ] },
            { id: "q3", type: "mcq", prompt: "Why is selenite (Mohs 2) risky to soak in water?", options: [
              { id: "a", text: "It's soft and water-soluble, so water damages or dissolves it", correct: true, explanation: "Correct — selenite is gypsum and dissolves." },
              { id: "b", text: "It becomes radioactive", correct: false, explanation: "Hardness has nothing to do with radioactivity." },
              { id: "c", text: "It is too hard to clean", correct: false, explanation: "The opposite — it's very soft." },
            ] },
          ],
        },
        {
          id: "l4-how-crystals-form",
          title: "How crystals form",
          objective: "Name the main ways crystals form in nature.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Crystals grow whenever atoms have time and conditions to settle into an ordered lattice. The main routes mirror the rock cycle:" },
            { kind: "list", items: [
              "**Igneous / magmatic** — minerals crystallize as molten rock cools (slow cooling underground makes bigger crystals).",
              "**Hydrothermal** — minerals precipitate out of hot, mineral-rich water moving through cracks (how many quartz veins and geodes form).",
              "**Sedimentary** — minerals form from evaporating water or settling sediment (e.g., gypsum/selenite, halite).",
              "**Metamorphic** — heat and pressure recrystallize existing minerals into new ones (e.g., garnet).",
            ] },
            { kind: "callout", tone: "evidence", title: "Why quartz is everywhere", text: "Quartz is both hard (Mohs 7) and chemically stable, so it survives weathering and transport that destroy softer minerals. That durability — not any special 'energy' — is why quartz grains dominate so many beaches, rivers, and crystal shops." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Quartz veins and geodes most often form by which process?", options: [
              { id: "a", text: "Hydrothermal — precipitating from hot mineral-rich water", correct: true, explanation: "Correct — circulating hot fluids deposit quartz in cracks and cavities." },
              { id: "b", text: "Biological growth", correct: false, explanation: "Minerals are inorganic; they don't grow biologically." },
              { id: "c", text: "Freezing of pure water", correct: false, explanation: "Ice isn't a mineral crystal of this kind." },
            ] },
            { id: "q2", type: "mcq", prompt: "Slow cooling of magma deep underground tends to produce…", options: [
              { id: "a", text: "Larger crystals", correct: true, explanation: "More time to grow means bigger crystals." },
              { id: "b", text: "No crystals at all", correct: false, explanation: "Slow cooling actually favors crystal growth." },
              { id: "c", text: "Only volcanic glass", correct: false, explanation: "Glass (like obsidian) forms from fast cooling, not slow." },
            ] },
            { id: "q3", type: "mcq", prompt: "Quartz is so common in nature mainly because it is…", options: [
              { id: "a", text: "Hard and chemically stable, so it survives weathering", correct: true, explanation: "Right — durability is the real reason." },
              { id: "b", text: "Attracted to the Earth's energy field", correct: false, explanation: "There's no such mechanism; durability explains it." },
              { id: "c", text: "Recently formed everywhere", correct: false, explanation: "Its abundance is about survival, not recent formation." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "History & a Field Guide",
      lessons: [
        {
          id: "l5-history",
          title: "Ancient ornament vs modern healing",
          objective: "Separate the documented history of crystals from the modern healing movement.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "Humans have prized stones for millennia — but it's worth separating what's historically documented from what's recent." },
            { kind: "callout", tone: "history", title: "What's actually old", text: "Ancient Egyptians, Greeks, Chinese, and Sumerians used stones like lapis lazuli, turquoise, and carnelian as ornaments, amulets, status symbols, and cosmetics. That's well documented archaeology." },
            { kind: "callout", tone: "history", title: "What's actually recent", text: "Crystal *healing* as practiced today — placing stones to channel 'energy' and treat ailments — is largely a 20th-century New Age phenomenon, not an unbroken ancient medical tradition." },
            { kind: "text", text: "Birthstones feel ancient too, but the familiar 12-month list was **standardized by U.S. jewelers (the National Association of Jewelers) in 1912** — a marketing initiative. It loosely echoes the 12 stones on Aaron's breastplate in the Bible, but the modern list bears little resemblance to it." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "The modern 12-month birthstone list was standardized when, and by whom?", options: [
              { id: "a", text: "1912, by a U.S. jewelers' association", correct: true, explanation: "Correct — it was a 1912 marketing standard." },
              { id: "b", text: "Ancient Egypt, by temple priests", correct: false, explanation: "The modern list is a 20th-century creation." },
              { id: "c", text: "The 1600s, by European royalty", correct: false, explanation: "No — it dates to 1912." },
            ] },
            { id: "q2", type: "true-false", prompt: "Crystal healing as practiced today is an unbroken ancient medical tradition.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — modern crystal healing is largely a 20th-century New Age development." },
              { id: "f", text: "False", correct: true, explanation: "Correct — ancient peoples used stones ornamentally; today's healing practice is recent." },
            ] },
            { id: "q3", type: "mcq", prompt: "Which IS well-documented about ancient use of stones?", options: [
              { id: "a", text: "They were used as amulets, ornaments, and status symbols", correct: true, explanation: "Yes — that's supported by archaeology." },
              { id: "b", text: "They reliably cured diseases", correct: false, explanation: "There's no evidence stones cured disease." },
              { id: "c", text: "They powered ancient machines", correct: false, explanation: "That's not historical." },
            ] },
          ],
        },
        {
          id: "l6-quartz-family",
          title: "The quartz family",
          objective: "Explain why several popular 'crystals' are all quartz, and what gives them color.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Here's one of the most useful facts in the whole hobby: several of the most popular stones are the exact same mineral — quartz, silicon dioxide (SiO₂). Their different colors come from trace impurities or natural radiation, not different 'energies.'" },
            { kind: "table", headers: ["Stone", "What it is", "Color from"], rows: [
              ["Clear quartz", "SiO₂", "Nothing — pure"],
              ["Amethyst", "SiO₂", "Iron + natural irradiation (violet)"],
              ["Citrine", "SiO₂", "Iron (yellow) — often heat-treated"],
              ["Rose quartz", "SiO₂", "Trace minerals (pink)"],
              ["Smoky quartz", "SiO₂", "Natural irradiation (brown/grey)"],
            ] },
            { kind: "callout", tone: "evidence", title: "Most 'citrine' is cooked amethyst", text: "Natural citrine is fairly rare. The vast majority of 'citrine' sold (often cited around 95%) is amethyst that's been heat-treated to turn yellow-orange. That's not a scam if disclosed — but it's worth knowing what you're buying." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Amethyst, citrine, and rose quartz differ in color because…", options: [
              { id: "a", text: "Of trace impurities or natural irradiation in the same mineral (quartz)", correct: true, explanation: "Correct — they're all SiO₂; color comes from impurities/irradiation." },
              { id: "b", text: "They are completely different minerals", correct: false, explanation: "They're all quartz." },
              { id: "c", text: "They vibrate at different frequencies", correct: false, explanation: "Color is a chemistry/physics fact, not 'frequency.'" },
            ] },
            { id: "q2", type: "mcq", prompt: "Most 'citrine' on the market is actually…", options: [
              { id: "a", text: "Heat-treated amethyst", correct: true, explanation: "Right — natural citrine is rare; most is heated amethyst." },
              { id: "b", text: "Dyed glass", correct: false, explanation: "Some fakes are glass, but citrine is usually heated amethyst." },
              { id: "c", text: "A different element entirely", correct: false, explanation: "It's still quartz, just heated." },
            ] },
            { id: "q3", type: "true-false", prompt: "Different-colored quartz varieties have fundamentally different chemical compositions.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — they're all silicon dioxide; only trace impurities differ." },
              { id: "f", text: "False", correct: true, explanation: "Correct — same SiO₂ base, different trace coloring." },
            ] },
          ],
        },
        {
          id: "l7-beyond-quartz",
          title: "Beyond quartz",
          objective: "Identify a few popular non-quartz stones and a couple of common myths about them.",
          estMinutes: 5,
          blocks: [
            { kind: "sort", prompt: "Match crystals to their reputation", instructions: "Tap a stone, then tap its traditional use (lore, not medicine)", groups: [
              { name: "Calm", accent: "#8e6bb5", items: ["Amethyst", "Lepidolite"] },
              { name: "Love", accent: "#c0398a", items: ["Rose Quartz", "Rhodonite"] },
              { name: "Protection", accent: "#3d3d4a", items: ["Black Tourmaline", "Obsidian"] },
              { name: "Abundance", accent: "#c9a227", items: ["Citrine", "Pyrite"] },
            ] },
            { kind: "text", text: "Plenty of popular pieces aren't quartz — and a few aren't even crystals. Two great myth-busters:" },
            { kind: "keyfacts", items: [
              "**Obsidian is volcanic glass** — it cooled too fast for atoms to form a lattice, so it's amorphous (no crystal structure). Technically it isn't a crystal at all.",
              "**Selenite is gypsum** (calcium sulfate), Mohs 2, and **dissolves in water** — so the popular 'rinse your selenite' advice will slowly ruin it.",
            ] },
            { kind: "table", headers: ["Stone", "What it really is"], rows: [
              ["Obsidian", "Volcanic glass — amorphous, not crystalline"],
              ["Selenite", "Gypsum (CaSO₄·2H₂O) — soft, water-soluble"],
              ["Lapis lazuli", "A rock (lazurite + pyrite + calcite)"],
              ["Malachite", "Copper carbonate — toxic in raw/dust form"],
            ] },
            { kind: "callout", tone: "safety", title: "Preview: not all stones are water-safe", text: "Malachite and several others are toxic or water-reactive. The safety lesson later in this course covers exactly which stones to keep away from water and skin." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Why is obsidian technically not a crystal?", options: [
              { id: "a", text: "It's volcanic glass — cooled too fast to form an ordered lattice", correct: true, explanation: "Correct — it's amorphous, lacking crystal structure." },
              { id: "b", text: "It's made of plastic", correct: false, explanation: "It's natural volcanic glass, not plastic." },
              { id: "c", text: "It's too dark to be a crystal", correct: false, explanation: "Color is irrelevant; structure is the issue." },
            ] },
            { id: "q2", type: "mcq", prompt: "What's the problem with rinsing selenite under water?", options: [
              { id: "a", text: "It's water-soluble (gypsum), so water slowly dissolves it", correct: true, explanation: "Right — selenite degrades in water." },
              { id: "b", text: "It explodes", correct: false, explanation: "It doesn't explode; it dissolves." },
              { id: "c", text: "Nothing — it's perfectly fine", correct: false, explanation: "It's not fine; water damages selenite." },
            ] },
            { id: "q3", type: "true-false", prompt: "Lapis lazuli is a single pure mineral.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — lapis is a rock made of several minerals (lazurite, pyrite, calcite)." },
              { id: "f", text: "False", correct: true, explanation: "Correct — it's a rock, not a single mineral." },
            ] },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Practice, Safety & Evidence",
      lessons: [
        {
          id: "l8-cleansing-charging",
          title: "Cleansing & charging",
          objective: "Describe the traditional practices and the real care science behind them.",
          estMinutes: 4,
          blocks: [
            { kind: "callout", tone: "tradition", title: "The tradition", text: "Practitioners distinguish 'cleansing' (clearing stagnant energy) from 'charging' (replenishing it). Common methods include running water, smoke, sound, moonlight or sunlight, salt, and resting a stone on a quartz cluster." },
            { kind: "callout", tone: "evidence", title: "The reality", text: "There's no measurable 'energy' being added or removed — these are rituals. That's fine as ritual, but some methods will physically damage your stones, so a little geology protects your collection." },
            { kind: "keyfacts", items: [
              "**Water** dissolves or damages soft/soluble stones (selenite, halite) — and is unsafe on toxic ones.",
              "**Sunlight** fades amethyst, rose quartz, citrine, and fluorite over time.",
              "**Salt** can scratch softer stones.",
              "Honest cleaning = hygiene: a soft cloth, or brief lukewarm water only for hard, non-toxic stones like quartz.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which stones are prone to FADING in sunlight?", options: [
              { id: "a", text: "Amethyst, rose quartz, citrine, fluorite", correct: true, explanation: "Correct — their color is light-sensitive." },
              { id: "b", text: "All stones are completely lightfast", correct: false, explanation: "Several are not — color can fade." },
              { id: "c", text: "Only black stones", correct: false, explanation: "Color isn't the predictor; specific minerals fade." },
            ] },
            { id: "q2", type: "true-false", prompt: "Cleansing and charging add or remove a measurable energy that science can detect.", options: [
              { id: "t", text: "True", correct: false, explanation: "No measurable energy is involved — these are rituals." },
              { id: "f", text: "False", correct: true, explanation: "Correct — there's no detectable energy; treat it as ritual." },
            ] },
            { id: "q3", type: "mcq", prompt: "The safest universal way to physically clean a hard, non-toxic stone like quartz is…", options: [
              { id: "a", text: "A soft cloth or brief lukewarm water", correct: true, explanation: "Gentle and safe for hard, non-toxic stones." },
              { id: "b", text: "Soaking any stone in salt water for days", correct: false, explanation: "Salt and long soaks can damage many stones." },
              { id: "c", text: "Leaving every stone in direct sun for a week", correct: false, explanation: "Sun fades several popular stones." },
            ] },
          ],
        },
        {
          id: "l9-buying-wisely",
          title: "Buying wisely",
          objective: "Spot common fakes, treatments, and misleading names.",
          estMinutes: 4,
          blocks: [
            { kind: "text", text: "The crystal market is full of treated stones, man-made glass, and creative naming. None of this is necessarily bad — treated stones are fine if disclosed — but you deserve to know what you're buying." },
            { kind: "table", headers: ["Sold as", "Often actually is"], rows: [
              ["'Citrine'", "Heat-treated amethyst"],
              ["'Opalite'", "Man-made glass (not opal)"],
              ["'Goldstone'", "Glass with copper flecks"],
              ["'Cherry / blue quartz'", "Often dyed glass"],
              ["'Turquoise' (cheap)", "Dyed howlite or magnesite"],
            ] },
            { kind: "callout", tone: "tip", title: "How to shop honestly", text: "Ask whether a stone is natural, treated, or synthetic, and whether the color is dyed. Reputable sellers disclose treatments. Be skeptical of perfectly uniform, super-cheap, candy-colored 'crystals.'" },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "'Opalite' sold in shops is usually…", options: [
              { id: "a", text: "Man-made glass", correct: true, explanation: "Correct — opalite is manufactured glass, not opal." },
              { id: "b", text: "A rare natural opal", correct: false, explanation: "It's typically glass, despite the name." },
              { id: "c", text: "A type of quartz", correct: false, explanation: "It's glass, not quartz." },
            ] },
            { id: "q2", type: "mcq", prompt: "Cheap 'turquoise' is frequently…", options: [
              { id: "a", text: "Dyed howlite or magnesite", correct: true, explanation: "Right — common substitutes dyed to look like turquoise." },
              { id: "b", text: "Always genuine high-grade turquoise", correct: false, explanation: "Cheap turquoise is often dyed substitute material." },
              { id: "c", text: "Pure gold", correct: false, explanation: "No — it's usually dyed stone." },
            ] },
            { id: "q3", type: "true-false", prompt: "A treated or heated stone is fine to buy as long as the treatment is disclosed.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — disclosure is the key; treatments are normal." },
              { id: "f", text: "False", correct: false, explanation: "Treated stones are acceptable when disclosed." },
            ] },
          ],
        },
        {
          id: "l10-toxic-crystals",
          title: "Toxic crystals & elixir safety",
          objective: "Identify toxic minerals and the safe way to make crystal-infused water.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "safety", title: "This one matters", text: "Some popular minerals are genuinely poisonous. Never grind, lick, inhale dust from, or soak them in water you'll drink. 'Gem elixirs' made the naive way can cause heavy-metal poisoning." },
            { kind: "table", headers: ["Mineral", "Toxic element", "Hazard"], rows: [
              ["Cinnabar", "Mercury", "Mercury poisoning"],
              ["Galena", "Lead", "Lead poisoning"],
              ["Realgar / orpiment", "Arsenic", "Arsenic poisoning"],
              ["Stibnite", "Antimony", "Antimony toxicity"],
              ["Malachite (raw)", "Copper", "Toxic dust / soluble copper"],
              ["Torbernite / autunite", "Uranium", "Radioactive + toxic"],
            ] },
            { kind: "callout", tone: "tip", title: "How to make crystal water safely", text: "Use the indirect method: seal the stone in a closed glass container (or test tube) and place that inside the water, so the stone never touches what you drink. Or stick to inert clear quartz. Always wash your hands after handling raw specimens, and keep them away from children." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which mineral should NEVER be soaked in water you intend to drink?", options: [
              { id: "a", text: "Cinnabar (contains mercury)", correct: true, explanation: "Correct — cinnabar is mercury sulfide and highly toxic." },
              { id: "b", text: "Clear quartz", correct: false, explanation: "Inert quartz is the safe choice." },
              { id: "c", text: "Glass beads", correct: false, explanation: "Glass is inert; the danger is toxic minerals." },
            ] },
            { id: "q2", type: "mcq", prompt: "The safe way to make 'crystal water' is…", options: [
              { id: "a", text: "The indirect method — stone sealed in a separate container", correct: true, explanation: "Right — the stone never contacts the water you drink." },
              { id: "b", text: "Drop any raw stone straight into your glass", correct: false, explanation: "Unsafe for toxic, soluble, or porous stones." },
              { id: "c", text: "Grind the stone into a powder and stir it in", correct: false, explanation: "Never ingest mineral dust." },
            ] },
            { id: "q3", type: "true-false", prompt: "Galena is safe to handle freely and soak in drinking water.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — galena is lead sulfide; treat it with care and never soak it for drinking." },
              { id: "f", text: "False", correct: true, explanation: "Correct — galena contains lead and is a poisoning risk." },
            ] },
          ],
        },
        {
          id: "l11-evidence",
          title: "What the evidence says",
          objective: "Summarize the scientific evidence on crystals and a healthy way to use them.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "evidence", title: "The bottom line", text: "There is no scientific evidence that crystals emit a healing energy, hold 'vibrations' that affect the body, or treat any disease. Scientifically, crystal healing is considered a pseudoscience." },
            { kind: "text", text: "A widely cited study (Christopher French and colleagues, around 1999–2001) gave 80 people either genuine quartz or fake plastic 'crystals' and primed them to expect sensations like tingling and warmth. Both groups reported the sensations at the same rate — and reporting tracked with prior belief and expectation, not with whether the crystal was real. (Note: it was presented at conferences rather than published in a peer-reviewed journal, so treat it as illustrative.)" },
            { kind: "callout", tone: "tip", title: "The placebo effect is real — and useful", text: "Expectation, ritual, and focused attention genuinely change subjective experience like calm and pain. So a crystal can be a meaningful ritual or mindfulness anchor — a reminder to slow down and set an intention — without any claim that the stone itself heals. Just never use it in place of medical care." },
            { kind: "callout", tone: "culture", title: "A respect note", text: "'Smudging' with white sage and palo santo is rooted in Indigenous North American ceremony and faces over-harvesting and appropriation concerns. Source respectfully, or use alternatives like incense or sound." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "In the French et al. crystal study, what predicted whether people felt 'energy' sensations?", options: [
              { id: "a", text: "Their prior belief and expectation — not whether the crystal was real", correct: true, explanation: "Correct — fake and real crystals produced the same reports; expectation drove it." },
              { id: "b", text: "The exact mineral type", correct: false, explanation: "Real vs fake made no difference." },
              { id: "c", text: "The phase of the Moon", correct: false, explanation: "That wasn't the variable; belief/expectation was." },
            ] },
            { id: "q2", type: "mcq", prompt: "A healthy, honest way to use crystals is…", options: [
              { id: "a", text: "As a ritual or mindfulness anchor, with no medical claims", correct: true, explanation: "Yes — that captures the real, placebo-mediated benefit safely." },
              { id: "b", text: "As a replacement for prescribed medical treatment", correct: false, explanation: "Never — crystals are not a substitute for medical care." },
              { id: "c", text: "To diagnose illness", correct: false, explanation: "Crystals can't diagnose anything." },
            ] },
            { id: "q3", type: "true-false", prompt: "There is good scientific evidence that crystals emit a measurable healing energy.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — no such energy has ever been measured." },
              { id: "f", text: "False", correct: true, explanation: "Correct — crystal healing is not scientifically supported." },
            ] },
          ],
        },
      ],
    },
  ],

  finalTest: [
    { id: "f1", type: "mcq", prompt: "What defines a 'crystal' geologically?", options: [
      { id: "a", text: "An ordered, repeating internal atomic lattice", correct: true },
      { id: "b", text: "Being shiny and valuable", correct: false },
      { id: "c", text: "Being formed by living things", correct: false },
      { id: "d", text: "Being a mixture of minerals", correct: false },
    ] },
    { id: "f2", type: "mcq", prompt: "Clear quartz, amethyst, and citrine are…", options: [
      { id: "a", text: "All the same mineral (quartz), differing by impurities", correct: true },
      { id: "b", text: "Three unrelated minerals", correct: false },
      { id: "c", text: "All man-made glass", correct: false },
      { id: "d", text: "All forms of diamond", correct: false },
    ] },
    { id: "f3", type: "mcq", prompt: "On the Mohs scale, talc and diamond are…", options: [
      { id: "a", text: "1 (softest) and 10 (hardest)", correct: true },
      { id: "b", text: "10 and 1", correct: false },
      { id: "c", text: "Both 7", correct: false },
      { id: "d", text: "Not on the scale", correct: false },
    ] },
    { id: "f4", type: "mcq", prompt: "Most 'citrine' sold is actually…", options: [
      { id: "a", text: "Heat-treated amethyst", correct: true },
      { id: "b", text: "Natural citrine", correct: false },
      { id: "c", text: "Dyed howlite", correct: false },
      { id: "d", text: "Volcanic glass", correct: false },
    ] },
    { id: "f5", type: "mcq", prompt: "Obsidian is technically not a crystal because it is…", options: [
      { id: "a", text: "Amorphous volcanic glass with no ordered lattice", correct: true },
      { id: "b", text: "Too hard", correct: false },
      { id: "c", text: "Man-made", correct: false },
      { id: "d", text: "Radioactive", correct: false },
    ] },
    { id: "f6", type: "mcq", prompt: "Why shouldn't you rinse selenite in water?", options: [
      { id: "a", text: "It's gypsum (Mohs 2) and dissolves", correct: true },
      { id: "b", text: "It's radioactive", correct: false },
      { id: "c", text: "It's too hard to wet", correct: false },
      { id: "d", text: "Water makes it explode", correct: false },
    ] },
    { id: "f7", type: "mcq", prompt: "The modern birthstone list was standardized in…", options: [
      { id: "a", text: "1912, by a U.S. jewelers' association", correct: true },
      { id: "b", text: "Ancient Egypt", correct: false },
      { id: "c", text: "The Renaissance", correct: false },
      { id: "d", text: "The 1980s New Age movement", correct: false },
    ] },
    { id: "f8", type: "mcq", prompt: "Which mineral is toxic and must NOT be soaked for drinking water?", options: [
      { id: "a", text: "Cinnabar (mercury)", correct: true },
      { id: "b", text: "Clear quartz", correct: false },
      { id: "c", text: "Amethyst", correct: false },
      { id: "d", text: "Rose quartz", correct: false },
    ] },
    { id: "f9", type: "mcq", prompt: "The safe way to make crystal-infused water is…", options: [
      { id: "a", text: "The indirect method (stone sealed in a separate container)", correct: true },
      { id: "b", text: "Grinding the stone into the water", correct: false },
      { id: "c", text: "Soaking any raw stone directly", correct: false },
      { id: "d", text: "Boiling the stone", correct: false },
    ] },
    { id: "f10", type: "mcq", prompt: "Which stones tend to FADE in sunlight?", options: [
      { id: "a", text: "Amethyst, rose quartz, citrine, fluorite", correct: true },
      { id: "b", text: "No stones fade", correct: false },
      { id: "c", text: "Only diamonds", correct: false },
      { id: "d", text: "Only black obsidian", correct: false },
    ] },
    { id: "f11", type: "mcq", prompt: "What did the French et al. study find?", options: [
      { id: "a", text: "Fake and real crystals produced the same reported sensations", correct: true },
      { id: "b", text: "Real crystals measurably healed participants", correct: false },
      { id: "c", text: "Crystals emit detectable energy", correct: false },
      { id: "d", text: "Only amethyst worked", correct: false },
    ] },
    { id: "f12", type: "mcq", prompt: "Crystals are classified into seven systems based on…", options: [
      { id: "a", text: "Lattice symmetry", correct: true },
      { id: "b", text: "Color", correct: false },
      { id: "c", text: "Price", correct: false },
      { id: "d", text: "Country of origin", correct: false },
    ] },
    { id: "f13", type: "mcq", prompt: "Quartz veins and geodes usually form by…", options: [
      { id: "a", text: "Hydrothermal precipitation from hot mineral-rich water", correct: true },
      { id: "b", text: "Biological growth", correct: false },
      { id: "c", text: "Freezing water", correct: false },
      { id: "d", text: "3D printing", correct: false },
    ] },
    { id: "f14", type: "true-false", prompt: "A treated stone is fine to buy as long as the treatment is disclosed.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
    { id: "f15", type: "true-false", prompt: "Crystal healing is supported by strong scientific evidence.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f16", type: "true-false", prompt: "A crystal can be a useful ritual or mindfulness anchor even though it doesn't physically heal.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
