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
  estMinutes: 60,
  status: "published",
  passThreshold: 0.8,
  finalTestSize: 10,
  safetyNote:
    "Some minerals are genuinely toxic — never make 'gem water' or elixirs from cinnabar, galena, malachite, and others. This course covers exactly which, and why.",

  outline: [
    { module: "What a Crystal Actually Is", lessons: ["Mineral, rock, or crystal?", "The seven crystal systems", "The Mohs hardness scale", "How crystals form"] },
    { module: "History & a Field Guide", lessons: ["Ancient ornament vs modern healing", "Birthstones, decoded", "The quartz family", "Beyond quartz", "Why crystals glow: color & fluorescence"] },
    { module: "Practice, Safety & Evidence", lessons: ["Cleansing & charging", "Buying wisely", "Real, synthetic, or fake?", "Toxic crystals & elixir safety", "What the evidence says"] },
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
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Before any lore, it helps to know what these objects actually are. The three words get used loosely, but they mean different things — and once the distinction clicks, a lot of confusing 'crystal shop' language suddenly makes sense." },
            { kind: "list", items: [
              "A **mineral** is a naturally occurring, inorganic solid with a definite chemical composition and an ordered internal atomic structure (a 'crystal lattice').",
              "A **crystal** is a solid whose atoms are arranged in that repeating, ordered lattice — which is what gives many of them their flat faces and geometric shapes.",
              "A **rock** is an aggregate — a mixture of one or more minerals stuck together (granite, for example, is mostly quartz, feldspar, and mica).",
            ] },
            { kind: "text", text: "Geologists use five tests to decide whether something even counts as a mineral. A diamond passes all five; a sugar crystal, an icicle, and a pearl each fail at least one. The strict checklist is what keeps the term meaningful." },
            { kind: "keyfacts", items: [
              "Naturally occurring — not made in a factory (lab-grown gems are 'synthetic').",
              "Inorganic — not produced by a living process (so pearl and amber are technically not minerals).",
              "Solid — not a liquid or gas at normal conditions.",
              "Definite chemical composition — expressible as a formula (quartz = SiO₂).",
              "Ordered internal structure — atoms in a repeating lattice.",
            ] },
            { kind: "callout", tone: "history", title: "Why 'healing crystal' is mostly quartz", text: "Most popular 'healing crystals' — clear quartz, amethyst, citrine, rose quartz — are varieties of one mineral, quartz. It's common, hard (Mohs 7), and durable, so it survives being tumbled and sold. The market is shaped as much by what survives handling as by any tradition." },
            { kind: "callout", tone: "tip", title: "A quick gut-check", text: "If a stone is a smooth swirl of several colors with no flat faces (like lapis lazuli or many 'jaspers'), it's usually a rock — a blend of minerals — rather than a single crystal. Sharp, repeating faces are the signature of a single mineral that had room to grow." },
            { kind: "table", headers: ["Object", "Mineral?", "Why"], rows: [
              ["Quartz point", "Yes", "Natural, inorganic, SiO₂, ordered lattice"],
              ["Granite", "No — it's a rock", "A mixture of several minerals"],
              ["Pearl", "No", "Made by a living oyster (organic)"],
              ["Amber", "No", "Fossilized tree resin (organic)"],
              ["Obsidian", "No", "Volcanic glass — no ordered lattice"],
            ] },
            { kind: "keyfacts", items: [
              "Mineral = natural, inorganic, defined chemistry, ordered lattice.",
              "Crystal = a solid with that ordered, repeating atomic structure.",
              "Rock = a mixture of minerals.",
              "Organic gems (pearl, amber, jet, coral) are prized but not minerals.",
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
            { id: "q4", type: "mcq", prompt: "Why is a pearl NOT classified as a mineral?", options: [
              { id: "a", text: "It's produced by a living organism, so it's organic", correct: true, explanation: "Right — minerals must be inorganic; pearls are made by oysters." },
              { id: "b", text: "It's too small", correct: false, explanation: "Size is irrelevant to the definition." },
              { id: "c", text: "It dissolves in water", correct: false, explanation: "The disqualifier is its organic origin, not solubility." },
            ] },
            { id: "q5", type: "recall", prompt: "Type the one-word term for a solid mixture of one or more minerals (e.g., granite).", options: [], answer: "rock", accept: ["a rock"], explanation: "A rock is an aggregate of minerals — granite mixes quartz, feldspar, and mica." },
          ],
        },
        {
          id: "l2-crystal-systems",
          title: "The seven crystal systems",
          objective: "Recall that crystals are classified into seven systems by lattice symmetry.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Crystals are grouped by the symmetry of their internal lattice into seven 'crystal systems.' You don't need to memorize all the geometry — just know the classification exists and is based on structure, not color or value." },
            { kind: "text", text: "Each system is defined by the imaginary 'unit cell' — the smallest repeating box of atoms — and the lengths and angles of its three axes. Cubic crystals have three equal axes meeting at right angles, which is why pyrite can grow as perfect little cubes. Other systems stretch or skew that box, producing needles, prisms, plates, or tablets." },
            { kind: "table", headers: ["System", "Axes (informal)", "Example mineral"], rows: [
              ["Cubic (isometric)", "3 equal, all 90°", "Pyrite, halite, diamond, garnet"],
              ["Tetragonal", "2 equal + 1 different, all 90°", "Zircon"],
              ["Orthorhombic", "3 different, all 90°", "Topaz, olivine"],
              ["Hexagonal", "6-fold symmetry axis", "Beryl (emerald, aquamarine)"],
              ["Trigonal", "3-fold symmetry axis", "Quartz, calcite, corundum"],
              ["Monoclinic", "One oblique angle", "Gypsum (selenite), malachite"],
              ["Triclinic", "All angles oblique", "Turquoise, feldspar, kyanite"],
            ] },
            { kind: "callout", tone: "tradition", title: "Where 'sacred geometry' meets real geometry", text: "Crystal shapes really are geometric — but for an ordinary physical reason (how atoms pack), not a mystical one. The honest version is genuinely beautiful: the outward shape is a direct echo of the atomic order inside. A quartz point's six-sided prism isn't a coincidence; it's the trigonal lattice showing through at human scale." },
            { kind: "callout", tone: "history", title: "Steno's law (1669)", text: "Nicolas Steno noticed that the angles between matching faces of a quartz crystal are constant from one specimen to the next, no matter the crystal's size or where it formed. This 'law of constancy of interfacial angles' was an early clue that an invisible internal order governs the outer shape — long before atoms could be seen." },
            { kind: "callout", tone: "evidence", title: "Habit vs. system", text: "A mineral's 'habit' is the shape an individual crystal actually grew into (blocky, fibrous, bladed), which depends on growth conditions. Its 'system' is the underlying symmetry class, which never changes. Two pyrite specimens can show different habits (cubes vs. pyritohedrons) while both belong to the cubic system." },
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
            { id: "q4", type: "mcq", prompt: "Pyrite often grows as near-perfect cubes. Which system does that point to?", options: [
              { id: "a", text: "Cubic (isometric)", correct: true, explanation: "Right — three equal axes at right angles allow cubic forms." },
              { id: "b", text: "Triclinic", correct: false, explanation: "Triclinic axes are all oblique — no perfect cubes." },
              { id: "c", text: "Hexagonal", correct: false, explanation: "Hexagonal has a six-fold axis, not cubic symmetry." },
            ] },
            { id: "q5", type: "mcq", prompt: "What did Steno's 'law of constancy of interfacial angles' establish?", options: [
              { id: "a", text: "Matching faces of a given mineral meet at the same angle regardless of size", correct: true, explanation: "Correct — an early clue that internal order governs outer shape." },
              { id: "b", text: "All crystals are the same size", correct: false, explanation: "It's about angles, not size." },
              { id: "c", text: "Crystals get harder with age", correct: false, explanation: "Hardness isn't what Steno measured." },
            ] },
          ],
        },
        {
          id: "l3-mohs-hardness",
          title: "The Mohs hardness scale",
          objective: "Use the Mohs scale to reason about how to care for a stone.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The Mohs scale (introduced by Friedrich Mohs in 1812) ranks mineral hardness from 1 (talc, softest) to 10 (diamond, hardest), based on which mineral can scratch which. Hardness here means resistance to scratching specifically — not whether a stone can shatter." },
            { kind: "callout", tone: "tip", title: "It's relative, not linear", text: "The scale is ordinal: diamond (10) is far more than ten times harder than talc (1). The jump from corundum (9) to diamond (10) is the biggest of all. The scale tells you the order of hardness, not exact ratios." },
            { kind: "table", headers: ["Mineral", "Mohs", "Everyday reference"], rows: [
              ["Talc", "1", "Crumbles under a fingernail"],
              ["Gypsum (selenite)", "2", "A fingernail (~2.5) scratches it"],
              ["Calcite", "3", "A copper coin (~3.5) scratches it"],
              ["Fluorite", "4", "A steel knife scratches it"],
              ["Apatite", "5", "About knife-blade hardness"],
              ["Orthoclase feldspar", "6", "A steel file scratches it"],
              ["Quartz (amethyst, etc.)", "7", "Scratches window glass"],
              ["Topaz", "8", "Scratches quartz"],
              ["Corundum (ruby, sapphire)", "9", "Second only to diamond"],
              ["Diamond", "10", "Scratches everything else"],
            ] },
            { kind: "callout", tone: "tip", title: "The 'glass and steel' field test", text: "Two handy reference points: a steel knife or nail is about 5.5, and ordinary glass is about 5.5–6. If a stone scratches glass, it's roughly 6 or harder — a quick way to flag a soft fake sold as a hard gem." },
            { kind: "callout", tone: "safety", title: "Hardness ≠ toughness", text: "Diamond is the hardest natural material but can still chip or cleave along its planes if struck the wrong way. 'Toughness' (resistance to breaking) is a different property from 'hardness' (resistance to scratching). Jade is only ~6–7 but is extraordinarily tough." },
            { kind: "text", text: "Why it matters in practice: a soft stone like selenite (2) scratches easily and even dissolves in water, while quartz (7) is tough enough to tumble and handle daily. The classic rule of thumb is that anything below ~5–6 is vulnerable to everyday dust (which contains quartz), so soft display pieces get cloudy over time. Hardness is your first guide to safe care." },
            { kind: "keyfacts", items: [
              "1 = talc (softest); 10 = diamond (hardest).",
              "Quartz = 7; the dust in your home is largely quartz, so softer stones abrade.",
              "Hardness resists scratching; toughness resists breaking — they're different.",
              "Fingernail ≈ 2.5, copper coin ≈ 3.5, steel knife ≈ 5.5, glass ≈ 5.5–6.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "A stone scratches a glass plate but is itself scratched by a topaz (8). Its hardness is roughly…", options: [
              { id: "a", text: "Between about 6 and 8", correct: true, explanation: "Right — harder than glass (~6) but softer than topaz (8)." },
              { id: "b", text: "Below 2", correct: false, explanation: "Anything below 2 couldn't scratch glass." },
              { id: "c", text: "Exactly 10", correct: false, explanation: "A 10 would scratch topaz, not be scratched by it." },
            ] },
            { id: "q5", type: "true-false", prompt: "'Hardness' and 'toughness' mean the same thing for a gemstone.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — hardness resists scratching; toughness resists breaking. Diamond is hard but can still chip." },
              { id: "f", text: "False", correct: true, explanation: "Correct — they're distinct properties." },
            ] },
            { id: "q6", type: "recall", prompt: "Name the mineral that defines Mohs hardness 10 (the hardest).", options: [], answer: "diamond", accept: ["a diamond"], explanation: "Diamond sits at 10 and scratches every other natural mineral." },
          ],
        },
        {
          id: "l4-how-crystals-form",
          title: "How crystals form",
          objective: "Name the main ways crystals form in nature.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Crystals grow whenever atoms have time and conditions to settle into an ordered lattice. The main routes mirror the rock cycle:" },
            { kind: "list", items: [
              "**Igneous / magmatic** — minerals crystallize as molten rock cools (slow cooling underground makes bigger crystals).",
              "**Hydrothermal** — minerals precipitate out of hot, mineral-rich water moving through cracks (how many quartz veins and geodes form).",
              "**Sedimentary** — minerals form from evaporating water or settling sediment (e.g., gypsum/selenite, halite).",
              "**Metamorphic** — heat and pressure recrystallize existing minerals into new ones (e.g., garnet).",
            ] },
            { kind: "text", text: "One principle ties it all together: the slower atoms are allowed to assemble, the larger and more perfect the crystals. Lava that chills in seconds makes glassy obsidian with no crystals at all; magma that cools over thousands of years deep underground can grow crystals you can hold in your hand. The giant selenite beams of Mexico's Cueva de los Cristales — some over 10 meters long — grew because mineral-rich water sat at a near-constant temperature for hundreds of thousands of years." },
            { kind: "callout", tone: "history", title: "The biggest crystals on Earth", text: "Discovered in 2000 in the Naica mine, Mexico, the Cave of the Crystals holds gypsum (selenite) crystals among the largest ever found. They formed underwater in mineral-saturated, geothermally heated water held within a razor-thin temperature window for an immense span of time — a vivid demonstration that size tracks patience, not magic." },
            { kind: "callout", tone: "evidence", title: "Why quartz is everywhere", text: "Quartz is both hard (Mohs 7) and chemically stable, so it survives weathering and transport that destroy softer minerals. That durability — not any special 'energy' — is why quartz grains dominate so many beaches, rivers, and crystal shops." },
            { kind: "keyfacts", items: [
              "Slow growth → larger, more well-formed crystals; fast cooling → tiny crystals or glass.",
              "Geodes form when mineral-rich fluids line a cavity and crystallize inward.",
              "Many gem pockets ('vugs') are hydrothermal — deposited by hot circulating water.",
              "Quartz's abundance is about durability and survival, not recent formation.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "The enormous selenite crystals of Mexico's Naica cave grew so large because…", options: [
              { id: "a", text: "Mineral-rich water stayed at a near-constant temperature for an extremely long time", correct: true, explanation: "Right — stable conditions over immense time let crystals grow huge." },
              { id: "b", text: "They cooled from lava in minutes", correct: false, explanation: "Fast cooling makes tiny crystals or glass, not giants." },
              { id: "c", text: "They were carved by miners", correct: false, explanation: "They formed naturally underwater." },
            ] },
            { id: "q5", type: "true-false", prompt: "Lava that cools in seconds tends to form large, well-shaped crystals.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — very fast cooling gives tiny crystals or glass like obsidian." },
              { id: "f", text: "False", correct: true, explanation: "Correct — large crystals need slow, patient growth." },
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
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Humans have prized stones for millennia — but it's worth separating what's historically documented from what's recent. Doing so respects the genuine history and keeps us honest about the modern claims." },
            { kind: "callout", tone: "history", title: "What's actually old", text: "Ancient Egyptians, Greeks, Chinese, and Sumerians used stones like lapis lazuli, turquoise, and carnelian as ornaments, amulets, status symbols, and cosmetics. Cleopatra-era Egyptians ground lapis lazuli into eyeshadow; Romans wore carnelian signet rings. That's well-documented archaeology." },
            { kind: "text", text: "The lore did carry medical and protective claims in the past, too. Medieval European 'lapidaries' (books cataloguing stones and their supposed powers) advised amethyst against drunkenness — the Greek 'amethystos' literally means 'not intoxicated' — and bloodstone to staunch bleeding. These were sincere beliefs, but they were pre-scientific folk medicine, not evidence of efficacy." },
            { kind: "callout", tone: "history", title: "What's actually recent", text: "Crystal *healing* as practiced today — placing stones to channel 'energy,' align 'chakras,' and treat ailments — is largely a 20th-century New Age phenomenon that gathered momentum in the 1970s–80s. It borrows vocabulary from older traditions but is not an unbroken ancient medical lineage." },
            { kind: "callout", tone: "culture", title: "Borrowed vocabulary", text: "Words like 'chakra' come from Indian yogic and tantric traditions, where they have specific spiritual meanings unrelated to placing gemstones on the body. The modern crystal-healing blend repackages such terms; it's worth knowing their actual origins rather than assuming one seamless 'ancient wisdom.'" },
            { kind: "text", text: "Birthstones feel ancient too, but the familiar 12-month list was **standardized by U.S. jewelers (the National Association of Jewelers) in 1912** — a marketing initiative. It loosely echoes the 12 stones on Aaron's breastplate in the Bible, but the modern list bears little resemblance to it. (The next lesson digs into how that list has been edited ever since.)" },
            { kind: "keyfacts", items: [
              "Documented: stones as ornament, amulet, status symbol, and cosmetic across many ancient cultures.",
              "Documented: pre-scientific folk-medicine claims in medieval lapidaries.",
              "Recent: today's energy/chakra crystal-healing system (mostly post-1970s New Age).",
              "'Amethyst' = Greek for 'not intoxicated' — an old belief, not a proven effect.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "Why did ancient Greeks associate amethyst with sobriety?", options: [
              { id: "a", text: "Its name means 'not intoxicated' — a folk belief it prevented drunkenness", correct: true, explanation: "Right — 'amethystos' is Greek for 'not intoxicated.'" },
              { id: "b", text: "Because it was proven to cure hangovers in trials", correct: false, explanation: "It was belief, not tested efficacy." },
              { id: "c", text: "Because it was used to brew wine", correct: false, explanation: "The link was protective folklore, not winemaking." },
            ] },
            { id: "q5", type: "recall", prompt: "Medieval books that catalogued stones and their supposed powers were called ____ (one word).", options: [], answer: "lapidaries", accept: ["lapidary", "a lapidary"], explanation: "Lapidaries were pre-scientific reference books on gemstones and their attributed virtues." },
          ],
        },
        {
          id: "l12-birthstones",
          title: "Birthstones, decoded",
          objective: "Explain how the modern birthstone list was assembled and edited over time.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Birthstones feel timeless, but the version most people know is a modern, lightly-edited marketing list. Understanding its history makes you a far better-informed buyer." },
            { kind: "callout", tone: "history", title: "A list that keeps changing", text: "The 1912 list from the (U.S.) National Association of Jewelers favored transparent, sellable gems. It has been revised several times since: in 1952 the Jewelry Industry Council added alexandrite (June), citrine (November) and pink tourmaline (October), and swapped some stones around. Tanzanite was added to December in 2002, and spinel to August in 2016 — both at the urging of trade associations." },
            { kind: "table", headers: ["Month", "Common modern birthstone", "Mineral / note"], rows: [
              ["January", "Garnet", "Silicate group, often deep red"],
              ["February", "Amethyst", "Purple quartz (SiO₂)"],
              ["March", "Aquamarine", "Blue beryl"],
              ["April", "Diamond", "Pure carbon, Mohs 10"],
              ["May", "Emerald", "Green beryl (fairly brittle)"],
              ["June", "Pearl / alexandrite / moonstone", "Pearl is organic, not a mineral"],
              ["July", "Ruby", "Red corundum (Mohs 9)"],
              ["August", "Peridot / spinel", "Spinel added 2016"],
              ["September", "Sapphire", "Corundum — any color but red"],
              ["October", "Opal / tourmaline", "Opal is hydrated silica"],
              ["November", "Topaz / citrine", "Citrine added 1952"],
              ["December", "Turquoise / tanzanite / zircon", "Tanzanite added 2002"],
            ] },
            { kind: "callout", tone: "tradition", title: "Older systems exist too", text: "Before the modern list there were 'traditional' birthstones and various zodiac-stone and 'apostle stone' systems, which differ from the jewelers' list and from each other. Some traditions even assigned stones to the day of the week or the planetary hour. There has never been one universal, ancient list — pick the system that's meaningful to you." },
            { kind: "callout", tone: "evidence", title: "Why this is useful to know", text: "Because the list is a sales tool, a 'birthstone' isn't a statement about geology or any property of the stone — ruby and sapphire are the same mineral (corundum), and several months offer multiple options precisely so jewelers always have something to sell. Treat birthstones as personal symbolism, not science." },
            { kind: "keyfacts", items: [
              "Modern list: 1912 jewelers' standard, revised 1952, 2002, 2016 and more.",
              "Several months have multiple options — partly a marketing decision.",
              "Ruby and sapphire are both corundum; the 'birthstone' label isn't about chemistry.",
              "Pearl (June) and opal (October) aren't even minerals in the strict sense.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Tanzanite became a December birthstone in which year?", options: [
              { id: "a", text: "2002", correct: true, explanation: "Correct — added by a trade association in 2002." },
              { id: "b", text: "1912", correct: false, explanation: "The original list was 1912, but tanzanite wasn't on it." },
              { id: "c", text: "Ancient times", correct: false, explanation: "Tanzanite was only discovered in 1967." },
            ] },
            { id: "q2", type: "true-false", prompt: "There has always been one single, universal, ancient list of birthstones.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — multiple systems exist and the modern list is a 20th-century marketing standard." },
              { id: "f", text: "False", correct: true, explanation: "Correct — traditional, zodiac, and modern lists differ." },
            ] },
            { id: "q3", type: "mcq", prompt: "Why do several months list multiple birthstones?", options: [
              { id: "a", text: "Partly so jewelers always have something to sell across price points", correct: true, explanation: "Right — it's partly a marketing/availability decision." },
              { id: "b", text: "Because each stone has a proven medical effect", correct: false, explanation: "There's no proven effect; it's symbolism and commerce." },
              { id: "c", text: "Because the months are longer", correct: false, explanation: "Month length has nothing to do with it." },
            ] },
            { id: "q4", type: "mcq", prompt: "July's ruby and September's sapphire are both varieties of which single mineral?", options: [
              { id: "a", text: "Corundum", correct: true, explanation: "Correct — ruby is red corundum; sapphire is corundum in other colors." },
              { id: "b", text: "Quartz", correct: false, explanation: "Both are corundum (aluminum oxide), not quartz." },
              { id: "c", text: "Beryl", correct: false, explanation: "Beryl gives emerald and aquamarine, not ruby/sapphire." },
            ] },
            { id: "q5", type: "true-false", prompt: "Because June's pearl is made by an oyster, it isn't a mineral in the strict sense.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — pearl is organic, so it's a gem but not a mineral." },
              { id: "f", text: "False", correct: false, explanation: "It is true — organic origin disqualifies it as a mineral." },
            ] },
          ],
        },
        {
          id: "l6-quartz-family",
          title: "The quartz family",
          objective: "Explain why several popular 'crystals' are all quartz, and what gives them color.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Here's one of the most useful facts in the whole hobby: several of the most popular stones are the exact same mineral — quartz, silicon dioxide (SiO₂). Their different colors come from trace impurities or natural radiation, not different 'energies.'" },
            { kind: "text", text: "Quartz actually splits into two structural families. **Macrocrystalline** quartz has crystals big enough to see (clear quartz, amethyst, citrine, smoky, rose). **Cryptocrystalline** quartz — also called chalcedony — is made of microscopic fibers too small to see, which is what agate, carnelian, onyx, jasper, and chrysoprase all are. Same chemistry, different crystal size." },
            { kind: "table", headers: ["Stone", "What it is", "Color from"], rows: [
              ["Clear quartz", "SiO₂", "Nothing — pure"],
              ["Amethyst", "SiO₂", "Iron + natural irradiation (violet)"],
              ["Citrine", "SiO₂", "Iron (yellow) — often heat-treated"],
              ["Rose quartz", "SiO₂", "Trace minerals (pink)"],
              ["Smoky quartz", "SiO₂", "Natural irradiation (brown/grey)"],
              ["Agate / carnelian", "SiO₂ (chalcedony)", "Iron and trace elements (banded/orange)"],
            ] },
            { kind: "callout", tone: "evidence", title: "Most 'citrine' is cooked amethyst", text: "Natural citrine is fairly rare. The vast majority of 'citrine' sold (often cited around 95%) is amethyst that's been heat-treated to turn yellow-orange. That's not a scam if disclosed — but it's worth knowing what you're buying. A tell: heated citrine often shows a strong orange-red 'Madeira' tone and a whitish base, while natural citrine tends toward a softer pale yellow." },
            { kind: "callout", tone: "history", title: "Amethyst lost its crown", text: "Amethyst was once as costly as ruby or emerald — until vast deposits were found in Brazil and Uruguay in the 1800s. The flood of supply turned it from an elite gem into an affordable favorite. A reminder that a stone's price reflects supply and fashion, not any inherent power." },
            { kind: "callout", tone: "tip", title: "Heat and the amethyst–citrine link", text: "Both amethyst and citrine owe their color to iron in the lattice; gentle heating shifts the iron's state, changing violet to yellow-orange. Heat an amethyst too far at home and you can ruin it or turn it colorless — another reason daily sun exposure fades these stones." },
            { kind: "keyfacts", items: [
              "Macrocrystalline quartz = visible crystals (amethyst, citrine, smoky, rose, clear).",
              "Cryptocrystalline quartz (chalcedony) = microscopic fibers (agate, carnelian, onyx, jasper).",
              "All are SiO₂; color comes from trace impurities, iron state, or natural irradiation.",
              "Most 'citrine' on the market is heat-treated amethyst.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "Agate, carnelian, and jasper are forms of which kind of quartz?", options: [
              { id: "a", text: "Cryptocrystalline quartz (chalcedony) — microscopic fibers", correct: true, explanation: "Right — they're chalcedony, with crystals too small to see." },
              { id: "b", text: "Macrocrystalline quartz with big visible points", correct: false, explanation: "Those forms are micro-crystalline, not large-crystal." },
              { id: "c", text: "Not quartz at all", correct: false, explanation: "They are all SiO₂ chalcedony." },
            ] },
            { id: "q5", type: "mcq", prompt: "Why did amethyst go from rare and costly to affordable in the 1800s?", options: [
              { id: "a", text: "Huge deposits were discovered in Brazil and Uruguay", correct: true, explanation: "Right — a supply surge dropped its price." },
              { id: "b", text: "People decided it had no power", correct: false, explanation: "Price tracked supply, not belief." },
              { id: "c", text: "It was outlawed", correct: false, explanation: "No prohibition was involved." },
            ] },
            { id: "q6", type: "recall", prompt: "Give the chemical formula for quartz.", options: [], answer: "SiO2", accept: ["SiO₂", "silicon dioxide", "sio2"], explanation: "Quartz is silicon dioxide, SiO₂ — the base for every quartz variety." },
          ],
        },
        {
          id: "l7-beyond-quartz",
          title: "Beyond quartz",
          objective: "Identify a few popular non-quartz stones and a couple of common myths about them.",
          estMinutes: 6,
          blocks: [
            { kind: "sort", prompt: "Match crystals to their reputation", instructions: "Tap a stone, then tap its traditional use (lore, not medicine)", groups: [
              { name: "Calm", accent: "#8e6bb5", items: ["Amethyst", "Lepidolite"] },
              { name: "Love", accent: "#c0398a", items: ["Rose Quartz", "Rhodonite"] },
              { name: "Protection", accent: "#3d3d4a", items: ["Black Tourmaline", "Obsidian"] },
              { name: "Abundance", accent: "#c9a227", items: ["Citrine", "Pyrite"] },
            ] },
            { kind: "text", text: "Plenty of popular pieces aren't quartz — and a few aren't even crystals. Knowing what they really are protects both your collection and (sometimes) your health." },
            { kind: "keyfacts", items: [
              "**Obsidian is volcanic glass** — it cooled too fast for atoms to form a lattice, so it's amorphous (no crystal structure). Technically it isn't a crystal at all.",
              "**Selenite is gypsum** (calcium sulfate), Mohs 2, and **dissolves in water** — so the popular 'rinse your selenite' advice will slowly ruin it.",
              "**Pyrite ('fool's gold')** can react with moisture and air over years, sometimes crumbling or giving off a sulfur smell — keep it dry.",
            ] },
            { kind: "table", headers: ["Stone", "What it really is"], rows: [
              ["Obsidian", "Volcanic glass — amorphous, not crystalline"],
              ["Selenite", "Gypsum (CaSO₄·2H₂O) — soft, water-soluble"],
              ["Lapis lazuli", "A rock (lazurite + pyrite + calcite)"],
              ["Malachite", "Copper carbonate — toxic in raw/dust form"],
              ["Pyrite", "Iron sulfide (FeS₂) — 'fool's gold'"],
              ["Labradorite", "A feldspar — its flash is 'labradorescence'"],
            ] },
            { kind: "callout", tone: "tip", title: "The play of color is physics, not magic", text: "Labradorite's blue-green 'flash' and opal's fire come from light interacting with internal layers and microstructures (interference and diffraction), the same physics that colors a soap bubble. It's a real, repeatable optical effect — and arguably more interesting than any mystical story." },
            { kind: "callout", tone: "history", title: "Lapis: the blue of kings", text: "For centuries the world's finest lapis lazuli came from a single region in Afghanistan. Ground into the pigment 'ultramarine,' it was once more expensive than gold and reserved for the robes of the Virgin Mary in Renaissance paintings — a striking example of a stone's value coming from rarity and labor, not metaphysics." },
            { kind: "callout", tone: "safety", title: "Preview: not all stones are water-safe", text: "Malachite, pyrite, and several others are toxic or water-reactive. The safety lesson later in this course covers exactly which stones to keep away from water and skin." },
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
            { id: "q4", type: "mcq", prompt: "Labradorite's colorful 'flash' (labradorescence) is caused by…", options: [
              { id: "a", text: "Light interfering with its internal layered structure", correct: true, explanation: "Right — it's an optical interference effect, like a soap bubble." },
              { id: "b", text: "A stored electrical charge", correct: false, explanation: "There's no stored charge; it's an optical effect." },
              { id: "c", text: "Heat from the hand", correct: false, explanation: "Holding it doesn't cause the flash; light does." },
            ] },
            { id: "q5", type: "mcq", prompt: "Lapis lazuli was historically ground to make which prized pigment?", options: [
              { id: "a", text: "Ultramarine", correct: true, explanation: "Correct — once more costly than gold." },
              { id: "b", text: "Vermilion", correct: false, explanation: "Vermilion came from cinnabar, a toxic mercury mineral." },
              { id: "c", text: "Verdigris", correct: false, explanation: "Verdigris is a copper compound, not lapis." },
            ] },
          ],
        },
        {
          id: "l13-color-fluorescence",
          title: "Why crystals glow: color & fluorescence",
          objective: "Explain at a basic level what gives crystals color and why some fluoresce under UV light.",
          estMinutes: 6,
          blocks: [
            { kind: "text", text: "Two of the most-asked questions about crystals — 'why is it that color?' and 'why does it glow under a blacklight?' — have clean, satisfying scientific answers. No vibrations required." },
            { kind: "heading", text: "Where color comes from" },
            { kind: "text", text: "A crystal's color is mostly about how its electrons absorb and reflect light. The color you see is the light that ISN'T absorbed. The usual sources are:" },
            { kind: "list", items: [
              "**Trace transition metals** — tiny amounts of iron, chromium, copper, manganese, etc. The same chromium that turns corundum into red ruby turns beryl into green emerald.",
              "**Structural defects & irradiation** — natural radiation knocks the lattice slightly out of order, creating 'color centers' (this gives amethyst its violet and smoky quartz its brown).",
              "**Optical effects** — not pigment at all, but light interacting with internal layers or microstructures (opal's fire, labradorite's flash). This is called 'structural color.'",
            ] },
            { kind: "callout", tone: "evidence", title: "Same element, different color", text: "Color depends on which atoms are present AND how they sit in the lattice. Iron gives one quartz violet (amethyst) and another yellow (citrine) depending on its oxidation state and surroundings. That's why 'this stone is blue, so it's for the throat' style reasoning doesn't hold up — color is chemistry and structure, not a fixed property." },
            { kind: "heading", text: "Why some crystals fluoresce" },
            { kind: "text", text: "Fluorescence is when a mineral absorbs invisible ultraviolet (UV) light and re-emits it as visible light — so it appears to glow. The mechanism is well understood: UV photons kick electrons in certain trace atoms ('activators') up to a higher energy level; when those electrons drop back down, they release the energy as visible light." },
            { kind: "table", headers: ["Term", "Meaning"], rows: [
              ["Activator", "A trace element (e.g. manganese) that enables the glow"],
              ["Quencher", "An element (often iron) that suppresses fluorescence"],
              ["Shortwave UV", "Higher-energy UV; often gives the strongest glow"],
              ["Longwave UV", "Lower-energy UV (typical 'blacklight')"],
              ["Phosphorescence", "Glow that lingers after the UV is switched off"],
            ] },
            { kind: "callout", tone: "tip", title: "Why not every stone glows", text: "The word 'fluorescence' actually comes from fluorite, a classic glowing mineral. But fluorescence depends on having the right activator and not too much of a quencher like iron — so two specimens of the same mineral can behave completely differently. A non-glowing crystal isn't fake; it just lacks the right trace recipe." },
            { kind: "callout", tone: "safety", title: "UV lamps need respect", text: "Mineral collectors sometimes use shortwave UV lamps, which emit UV-C. Looking directly at the lamp or shining it on skin can cause eye and skin damage (think 'welder's flash' and sunburn). If you ever explore fluorescence, use eye protection and never point the lamp at people." },
            { kind: "keyfacts", items: [
              "Color = which wavelengths a crystal absorbs vs. reflects (often due to trace metals).",
              "The same element can give different colors depending on its state and the lattice.",
              "Fluorescence = absorbing UV and re-emitting visible light via 'activator' atoms.",
              "Iron often 'quenches' (suppresses) the glow, so not all specimens fluoresce.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Fluorescence in a mineral is best described as…", options: [
              { id: "a", text: "Absorbing UV light and re-emitting it as visible light", correct: true, explanation: "Correct — that's exactly the mechanism." },
              { id: "b", text: "Storing sunlight as electricity", correct: false, explanation: "No electricity is stored; it's light re-emission." },
              { id: "c", text: "Producing heat from the lattice", correct: false, explanation: "Fluorescence is about light, not heat." },
            ] },
            { id: "q2", type: "mcq", prompt: "The same chromium impurity makes one mineral red (ruby) and another green (emerald). This shows color depends on…", options: [
              { id: "a", text: "Both the element present and how it sits in the host lattice", correct: true, explanation: "Right — element plus structural context determines color." },
              { id: "b", text: "Only the stone's price", correct: false, explanation: "Price is unrelated to the physics of color." },
              { id: "c", text: "The phase of the Moon", correct: false, explanation: "Color is fixed chemistry/structure, not lunar." },
            ] },
            { id: "q3", type: "true-false", prompt: "Every specimen of a fluorescent mineral species will glow equally under UV.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it depends on activators and quenchers like iron, which vary by specimen." },
              { id: "f", text: "False", correct: true, explanation: "Correct — trace chemistry varies, so glow varies too." },
            ] },
            { id: "q4", type: "mcq", prompt: "A trace element that ENABLES a mineral to fluoresce is called a(n)…", options: [
              { id: "a", text: "Activator", correct: true, explanation: "Correct — activators absorb UV and enable the glow." },
              { id: "b", text: "Quencher", correct: false, explanation: "A quencher suppresses the glow." },
              { id: "c", text: "Insulator", correct: false, explanation: "Not a fluorescence term." },
            ] },
            { id: "q5", type: "true-false", prompt: "Shortwave UV lamps can harm eyes and skin and should be used with care.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — shortwave UV-C can cause eye and skin damage; use protection." },
              { id: "f", text: "False", correct: false, explanation: "It is true — treat UV lamps as a real hazard." },
            ] },
            { id: "q6", type: "recall", prompt: "Which classic glowing mineral gave 'fluorescence' its name?", options: [], answer: "fluorite", accept: ["fluorspar", "calcium fluoride"], explanation: "The phenomenon is named after fluorite, a mineral famous for glowing under UV." },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Practice, Safety & Perspective",
      lessons: [
        {
          id: "l8-cleansing-charging",
          title: "Cleansing & charging",
          objective: "Describe the traditional practices and the real care science behind them.",
          estMinutes: 5,
          blocks: [
            { kind: "callout", tone: "tradition", title: "The tradition", text: "Practitioners distinguish 'cleansing' (clearing stagnant energy) from 'charging' (replenishing or 'programming' it with an intention). Common methods include running water, smoke, sound, moonlight or sunlight, salt, burying in earth, and resting a stone on a quartz cluster or selenite slab." },
            { kind: "callout", tone: "tip", title: "Ritual meets care", text: "Cleansing and charging are acts of intention and ritual — ways to reset a stone's role in your practice and renew your focus. The one practical note is physical: some methods will damage certain stones, so a little geology protects your collection." },
            { kind: "table", headers: ["Method", "Tradition says", "Geology says"], rows: [
              ["Running water", "Washes away energy", "Dissolves selenite/halite; unsafe on toxic stones"],
              ["Sunlight", "Recharges the stone", "Fades amethyst, rose quartz, citrine, fluorite"],
              ["Salt / salt water", "Absorbs negativity", "Scratches soft stones; corrodes some"],
              ["Moonlight", "Gentle recharge", "Harmless to the stone (a safe ritual choice)"],
              ["Sound / smoke", "Clears the field", "Harmless to the stone"],
            ] },
            { kind: "keyfacts", items: [
              "**Water** dissolves or damages soft/soluble stones (selenite, halite) — and is unsafe on toxic ones.",
              "**Sunlight** fades amethyst, rose quartz, citrine, and fluorite over time.",
              "**Salt** can scratch softer stones and lodge in cracks.",
              "Honest cleaning = hygiene: a soft cloth, or brief lukewarm water only for hard, non-toxic stones like quartz.",
            ] },
            { kind: "callout", tone: "tip", title: "A safe default ritual", text: "If you want a cleansing routine that can't harm your stones, moonlight, sound (a bell or bowl), or simply holding the stone and setting an intention work for any specimen — including soft, soluble, or toxic ones. Save water and salt for hard, non-toxic stones only." },
            { kind: "callout", tone: "culture", title: "On 'smudging'", text: "Burning white sage to cleanse is drawn from Indigenous North American ceremony and raises over-harvesting and appropriation concerns. If smoke appeals to you, consider incense, garden herbs, or sound instead, and source any sacred materials respectfully." },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Which stones are prone to FADING in sunlight?", options: [
              { id: "a", text: "Amethyst, rose quartz, citrine, fluorite", correct: true, explanation: "Correct — their color is light-sensitive." },
              { id: "b", text: "All stones are completely lightfast", correct: false, explanation: "Several are not — color can fade." },
              { id: "c", text: "Only black stones", correct: false, explanation: "Color isn't the predictor; specific minerals fade." },
            ] },
            { id: "q2", type: "true-false", prompt: "Cleansing and charging are best understood as acts of intention and ritual that renew your focus on a stone.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — they're rituals of intention and reset, which is exactly how the tradition uses them." },
              { id: "f", text: "False", correct: false, explanation: "They are rituals of intention and focus — that's the heart of the practice." },
            ] },
            { id: "q3", type: "mcq", prompt: "The safest universal way to physically clean a hard, non-toxic stone like quartz is…", options: [
              { id: "a", text: "A soft cloth or brief lukewarm water", correct: true, explanation: "Gentle and safe for hard, non-toxic stones." },
              { id: "b", text: "Soaking any stone in salt water for days", correct: false, explanation: "Salt and long soaks can damage many stones." },
              { id: "c", text: "Leaving every stone in direct sun for a week", correct: false, explanation: "Sun fades several popular stones." },
            ] },
            { id: "q4", type: "mcq", prompt: "You want a cleansing ritual that's safe even for selenite or a toxic mineral. Best choice?", options: [
              { id: "a", text: "Moonlight, sound, or simply setting an intention", correct: true, explanation: "Right — these can't physically harm any stone." },
              { id: "b", text: "A long soak in salt water", correct: false, explanation: "Water and salt can dissolve or damage these stones." },
              { id: "c", text: "A week in direct midday sun", correct: false, explanation: "Sun fades many stones and won't help." },
            ] },
            { id: "q5", type: "true-false", prompt: "Burning white sage to 'cleanse' is free of cultural and sustainability concerns.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — it raises over-harvesting and appropriation concerns; source respectfully or use alternatives." },
              { id: "f", text: "False", correct: true, explanation: "Correct — be mindful; consider incense or sound instead." },
            ] },
          ],
        },
        {
          id: "l9-buying-wisely",
          title: "Buying wisely",
          objective: "Spot common fakes, treatments, and misleading names.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "The crystal market is full of treated stones, man-made glass, and creative naming. None of this is necessarily bad — treated stones are fine if disclosed — but you deserve to know what you're buying." },
            { kind: "table", headers: ["Sold as", "Often actually is"], rows: [
              ["'Citrine'", "Heat-treated amethyst"],
              ["'Opalite'", "Man-made glass (not opal)"],
              ["'Goldstone'", "Glass with copper flecks"],
              ["'Cherry / blue quartz'", "Often dyed glass"],
              ["'Turquoise' (cheap)", "Dyed howlite or magnesite"],
              ["'Alexandrite' (cheap)", "Color-change synthetic corundum"],
            ] },
            { kind: "callout", tone: "tip", title: "Red flags at the table", text: "Be skeptical of: a 'crystal' with tiny air bubbles inside (a glass tell), unnaturally uniform candy colors, a rainbow 'aura' coating (that's a thin metal vapor layer applied in a lab), suspiciously cheap 'rare' stones, and names ending in '-ite' you've never heard of. None automatically mean fraud — but they mean ask questions." },
            { kind: "table", headers: ["Honest term", "What it signals"], rows: [
              ["Natural", "Mined, untreated (beyond cutting/polishing)"],
              ["Treated / enhanced", "Heated, irradiated, dyed, or coated"],
              ["Synthetic / lab-grown", "Real mineral, grown in a lab"],
              ["Simulant / imitation", "Looks like it but is a different material (often glass)"],
              ["Reconstituted", "Crushed stone bonded with resin"],
            ] },
            { kind: "callout", tone: "tip", title: "How to shop honestly", text: "Ask whether a stone is natural, treated, or synthetic, and whether the color is dyed. Reputable sellers disclose treatments without hesitation. A wet cotton swab can lift dye from a poorly-dyed stone; a hot point (done by an expert) can reveal plastic by smell. When in doubt, buy from sellers who name a locality and welcome questions." },
            { kind: "keyfacts", items: [
              "Treated/enhanced stones are normal and fine — as long as it's disclosed.",
              "'Simulant' or 'imitation' means a different material made to look like the gem.",
              "Air bubbles, perfect uniform color, and metallic 'aura' coatings often indicate glass or lab treatment.",
              "A locality (where it was mined) is a sign of a knowledgeable, honest seller.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "Tiny round air bubbles trapped inside a clear 'crystal' most likely mean it's…", options: [
              { id: "a", text: "Glass (a simulant)", correct: true, explanation: "Right — trapped spherical bubbles are a classic glass tell." },
              { id: "b", text: "An especially pure natural crystal", correct: false, explanation: "Natural crystals don't trap round air bubbles this way." },
              { id: "c", text: "Proof it's a diamond", correct: false, explanation: "Bubbles suggest glass, not diamond." },
            ] },
            { id: "q5", type: "mcq", prompt: "A rainbow 'aura quartz' coating is produced by…", options: [
              { id: "a", text: "Bonding a thin metal vapor layer onto the stone in a lab", correct: true, explanation: "Right — it's a lab surface treatment, not natural color." },
              { id: "b", text: "Centuries of underground pressure", correct: false, explanation: "Aura coatings are man-made surface layers." },
              { id: "c", text: "The stone's natural energy field", correct: false, explanation: "It's a deposited metal film, fully explainable." },
            ] },
          ],
        },
        {
          id: "l14-real-synthetic-fake",
          title: "Real, synthetic, or fake?",
          objective: "Distinguish natural, synthetic, and imitation stones — and why the difference matters.",
          estMinutes: 5,
          blocks: [
            { kind: "text", text: "Three words get blurred together at the market table: natural, synthetic, and imitation. They mean very different things, and the difference decides both the price and whether the label on the bin is honest." },
            { kind: "table", headers: ["Category", "What it is", "Example"], rows: [
              ["Natural", "Mined from the Earth; may be cut or polished", "A dug amethyst point"],
              ["Synthetic (lab-grown)", "The SAME mineral, grown in a lab — same chemistry & structure", "Lab-grown ruby or quartz"],
              ["Imitation (simulant)", "A DIFFERENT material made to look like the gem", "Glass or cubic zirconia sold as 'diamond'"],
              ["Treated/enhanced", "Natural stone altered (heat, dye, irradiation, coating)", "Heat-treated citrine"],
            ] },
            { kind: "callout", tone: "evidence", title: "The key distinction", text: "A SYNTHETIC stone is the real thing — same chemical formula, same crystal structure, same hardness — just grown by people instead of geology. An IMITATION only looks similar; it's a different material (often glass or cubic zirconia) with different properties. 'Lab-grown ruby' is genuine corundum; 'ruby glass' is not ruby at all." },
            { kind: "text", text: "This matters because honest sellers price each category differently and disclose which it is. A lab-grown emerald is a legitimate, often beautiful product; selling it as 'natural' is fraud. Likewise, cubic zirconia is a fine stone in its own right — the problem is only when it's passed off as diamond." },
            { kind: "callout", tone: "tip", title: "Clues, not proof", text: "Some hints a stone might be glass or synthetic: it feels warm quickly (real crystals tend to feel cool and conduct heat away), it's flawlessly clean with no natural inclusions, it has visible mold seams or trapped bubbles, or the color is impossibly even. Definitive ID often needs a jeweler's tools — these clues just tell you when to ask." },
            { kind: "callout", tone: "safety", title: "Why honesty also protects you", text: "Knowing real-vs-imitation isn't just about money. Some genuine minerals are toxic (next lesson), and a few 'natural' specimens are quietly dyed or stabilized with resins. If a seller won't say what something is or how it was treated, that's a reason to walk away — especially before putting anything near water you'll drink or against your skin." },
            { kind: "keyfacts", items: [
              "Synthetic = same mineral, lab-grown (genuine; just not mined).",
              "Imitation/simulant = different material that mimics the look (e.g., glass, cubic zirconia).",
              "Treated = natural stone modified; fine if disclosed.",
              "Selling synthetic or imitation as 'natural' is the actual fraud — not the existence of lab stones.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "A lab-grown ruby is best described as…", options: [
              { id: "a", text: "Genuine corundum — same chemistry and structure as natural ruby, just grown in a lab", correct: true, explanation: "Correct — synthetic means the real mineral, lab-grown." },
              { id: "b", text: "A piece of red glass", correct: false, explanation: "That would be an imitation, not a synthetic." },
              { id: "c", text: "A fake with different chemistry", correct: false, explanation: "Synthetics share the natural stone's chemistry and structure." },
            ] },
            { id: "q2", type: "mcq", prompt: "Cubic zirconia sold honestly as itself is…", options: [
              { id: "a", text: "A legitimate stone; the only problem is passing it off as diamond", correct: true, explanation: "Right — it's a fine simulant; fraud is only in misrepresentation." },
              { id: "b", text: "Always a scam in every case", correct: false, explanation: "Disclosed, it's a perfectly honest product." },
              { id: "c", text: "Chemically identical to diamond", correct: false, explanation: "It's a different material — a diamond simulant." },
            ] },
            { id: "q3", type: "true-false", prompt: "A 'simulant' (imitation) shares the same chemical composition as the gem it mimics.", options: [
              { id: "t", text: "True", correct: false, explanation: "No — a simulant is a different material that only looks similar." },
              { id: "f", text: "False", correct: true, explanation: "Correct — only synthetics share the natural stone's composition." },
            ] },
            { id: "q4", type: "mcq", prompt: "Which is most likely a clue that a clear stone is glass rather than natural crystal?", options: [
              { id: "a", text: "It warms up fast in your hand and has trapped round bubbles", correct: true, explanation: "Right — glass conducts heat poorly and can trap bubbles." },
              { id: "b", text: "It feels cool and has tiny natural inclusions", correct: false, explanation: "That pattern actually suggests a natural crystal." },
              { id: "c", text: "It is hard enough to scratch steel", correct: false, explanation: "Hardness alone doesn't flag glass." },
            ] },
            { id: "q5", type: "recall", prompt: "What single word describes a lab-grown stone that has the SAME chemistry and structure as its natural counterpart?", options: [], answer: "synthetic", accept: ["lab-grown", "lab grown", "lab-created", "synthetic gemstone"], explanation: "Synthetic (lab-grown) stones are the genuine mineral, just not mined — unlike imitations." },
          ],
        },
        {
          id: "l10-toxic-crystals",
          title: "Toxic crystals & elixir safety",
          objective: "Identify toxic minerals and the safe way to make crystal-infused water.",
          estMinutes: 6,
          blocks: [
            { kind: "callout", tone: "safety", title: "This one matters", text: "Some popular minerals are genuinely poisonous. Never grind, lick, inhale dust from, or soak them in water you'll drink. 'Gem elixirs' made the naive way can cause heavy-metal poisoning, which can be serious and cumulative." },
            { kind: "table", headers: ["Mineral", "Toxic element", "Hazard"], rows: [
              ["Cinnabar", "Mercury", "Mercury poisoning"],
              ["Galena", "Lead", "Lead poisoning"],
              ["Realgar / orpiment", "Arsenic", "Arsenic poisoning"],
              ["Stibnite", "Antimony", "Antimony toxicity"],
              ["Malachite (raw)", "Copper", "Toxic dust / soluble copper"],
              ["Chrysocolla / azurite", "Copper", "Copper toxicity (dust/soluble)"],
              ["Torbernite / autunite", "Uranium", "Radioactive + toxic"],
              ["Vanadinite / wulfenite", "Lead / vanadium", "Lead & vanadium toxicity"],
            ] },
            { kind: "callout", tone: "safety", title: "The danger isn't only swallowing it", text: "Hazards come three ways: ingestion (elixirs, hand-to-mouth), inhalation (dust from cutting, sanding, or tumbling raw toxic stones), and prolonged skin contact with soluble copper or arsenic minerals. Radioactive uranium minerals (torbernite, autunite) should be stored away from where people sit and never kept in a bedroom; cutting them is especially hazardous." },
            { kind: "list", items: [
              "**Never dry-grind, sand, or tumble** a toxic mineral without proper dust control — the powder is the worst form.",
              "**Wash hands** after handling raw specimens, and don't eat or touch your face mid-handling.",
              "**Keep toxic and radioactive specimens away from children and pets**, ideally labeled and in a separate case.",
              "**When unsure, treat an unknown stone as not water-safe and not skin-safe** until you've identified it.",
            ] },
            { kind: "callout", tone: "tip", title: "How to make crystal water safely", text: "Use the indirect method: seal the stone in a closed glass container (or test tube) and place that inside the water, so the stone never touches what you drink. Or stick to inert clear quartz. The indirect method also protects soft or porous stones (and the water) regardless of toxicity." },
            { kind: "keyfacts", items: [
              "Mercury (cinnabar), lead (galena), arsenic (realgar/orpiment), antimony (stibnite) = never for elixirs.",
              "Copper minerals (malachite, azurite, chrysocolla) are toxic raw or as dust.",
              "Uranium minerals (torbernite, autunite) are radioactive AND toxic.",
              "Indirect method = stone sealed in a separate container, never touching your drink.",
            ] },
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
            { id: "q4", type: "mcq", prompt: "Torbernite and autunite carry an extra hazard beyond chemical toxicity. What is it?", options: [
              { id: "a", text: "They are radioactive (uranium minerals)", correct: true, explanation: "Correct — store away from living/sleeping areas and never cut casually." },
              { id: "b", text: "They are magnetic", correct: false, explanation: "Magnetism isn't the hazard; radioactivity is." },
              { id: "c", text: "They glow harmlessly", correct: false, explanation: "The issue is genuine radioactivity, not a harmless glow." },
            ] },
            { id: "q5", type: "mcq", prompt: "Aside from drinking it, a major way toxic minerals harm people is…", options: [
              { id: "a", text: "Inhaling dust from cutting, sanding, or tumbling them", correct: true, explanation: "Right — powder is the most dangerous form; control dust." },
              { id: "b", text: "Looking at them in normal light", correct: false, explanation: "Simply viewing a specimen isn't the hazard." },
              { id: "c", text: "Photographing them", correct: false, explanation: "Photography poses no exposure risk." },
            ] },
            { id: "q6", type: "recall", prompt: "Which toxic heavy metal is found in the mineral galena?", options: [], answer: "lead", accept: ["pb"], explanation: "Galena is lead sulfide (PbS); never soak it in water you'll drink." },
          ],
        },
        {
          id: "l11-evidence",
          title: "Crystals as a practice",
          objective: "Understand crystal work as a practice of intention and ritual, and how to use it well.",
          estMinutes: 6,
          blocks: [
            { kind: "callout", tone: "tip", title: "The heart of the practice", text: "Crystal work is a practice of intention, focus, and meaning. A stone becomes an anchor for an aim you're holding — calm, courage, clarity — something you can see, carry, and return to. Worked this way, the value lives in the ritual and the attention it gathers, and many people find that genuinely steadying." },
            { kind: "callout", tone: "tip", title: "Ritual, focus, and intention", text: "The power of a crystal practice comes from how you use it: choosing a stone for a purpose, setting an intention, and letting the object remind you of it through the day. Treat the stone as a focal point for your own attention and the practice does its real work — concentrating intention into something tangible." },
            { kind: "callout", tone: "tip", title: "Quartz and real physics", text: "Some crystals (notably quartz) are genuinely piezoelectric — squeeze them and they produce a tiny voltage, which is why quartz keeps time in watches. It's a lovely reminder that these are remarkable natural objects with real, beautiful properties, quite apart from how you choose to work with them ritually." },
            { kind: "callout", tone: "tip", title: "Ritual and attention shape experience", text: "Expectation, ritual, and focused attention genuinely change subjective experience like calm and perceived sense of ease. That's exactly why a crystal makes such a good ritual or mindfulness anchor — a reminder to slow down, breathe, and set an intention. The benefit is in the practice you build around the stone." },
            { kind: "callout", tone: "safety", title: "The one firm line", text: "Never use a crystal in place of medical or mental-health care. The real danger isn't the stone — it's delay: choosing a gem over a doctor for a treatable condition. Enjoy crystals as ritual and as beautiful natural objects; see a professional for anything medical." },
            { kind: "callout", tone: "culture", title: "A respect note", text: "'Smudging' with white sage and palo santo is rooted in Indigenous North American ceremony and faces over-harvesting and appropriation concerns. Source respectfully, or use alternatives like incense or sound." },
            { kind: "keyfacts", items: [
              "Crystal work is a practice of intention, focus, and ritual.",
              "The stone is an anchor for your attention — the practice is where the value lives.",
              "Quartz's piezoelectricity is real, elegant physics and part of what makes these objects remarkable.",
              "Ritual and intention genuinely shape experience — and never replace medical care.",
            ] },
          ],
          quiz: [
            { id: "q1", type: "mcq", prompt: "Crystal work is best understood as…", options: [
              { id: "a", text: "A practice of intention, focus, and ritual", correct: true, explanation: "Correct — the stone anchors your attention, and the practice is where the value lives." },
              { id: "b", text: "A replacement for medical treatment", correct: false, explanation: "Never — crystals are not a substitute for medical care." },
              { id: "c", text: "A way to diagnose illness", correct: false, explanation: "Diagnosis belongs to a clinician." },
            ] },
            { id: "q2", type: "mcq", prompt: "A healthy, grounded way to use crystals is…", options: [
              { id: "a", text: "As a ritual or mindfulness anchor for an intention you're holding", correct: true, explanation: "Yes — that captures the real strength of the practice and keeps it safe." },
              { id: "b", text: "As a replacement for prescribed medical treatment", correct: false, explanation: "Never — crystals are not a substitute for medical care." },
              { id: "c", text: "To diagnose illness", correct: false, explanation: "Crystals can't diagnose anything." },
            ] },
            { id: "q3", type: "true-false", prompt: "The strength of a crystal practice comes from the intention, ritual, and focus you bring to it.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — choosing a stone for a purpose and returning to it is where the practice works." },
              { id: "f", text: "False", correct: false, explanation: "Intention and ritual are exactly what give the practice its meaning." },
            ] },
            { id: "q4", type: "mcq", prompt: "Quartz's piezoelectricity (used in watches) tells us that…", options: [
              { id: "a", text: "Quartz makes a tiny voltage under mechanical pressure — a real, elegant physical property", correct: true, explanation: "Correct — it's genuine physics and part of what makes the mineral remarkable." },
              { id: "b", text: "Quartz is just ordinary glass", correct: false, explanation: "No — quartz is a crystalline mineral with real piezoelectric behavior." },
              { id: "c", text: "Quartz is radioactive", correct: false, explanation: "Piezoelectricity has nothing to do with radioactivity." },
            ] },
            { id: "q5", type: "mcq", prompt: "What is the single most important safety rule when using crystals?", options: [
              { id: "a", text: "Never use them in place of medical or mental-health care", correct: true, explanation: "Right — the real risk is delaying real treatment." },
              { id: "b", text: "Always soak them in tap water first", correct: false, explanation: "Soaking can damage stones and is unsafe for toxic ones." },
              { id: "c", text: "Only buy the most expensive stones", correct: false, explanation: "Price has nothing to do with safety." },
            ] },
            { id: "q6", type: "true-false", prompt: "The placebo effect on subjective calm and perceived pain is a real, measurable psychological phenomenon.", options: [
              { id: "t", text: "True", correct: true, explanation: "Correct — ritual and expectation genuinely shift subjective experience; that's why a crystal can be a useful mindfulness anchor." },
              { id: "f", text: "False", correct: false, explanation: "It is true — placebo effects on subjective measures are well documented." },
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
    { id: "f17", type: "mcq", prompt: "A 'synthetic' (lab-grown) ruby is…", options: [
      { id: "a", text: "Genuine corundum — same chemistry as natural ruby, grown in a lab", correct: true },
      { id: "b", text: "A piece of red glass", correct: false },
      { id: "c", text: "A different material entirely", correct: false },
      { id: "d", text: "Always a fraud", correct: false },
    ] },
    { id: "f18", type: "mcq", prompt: "An 'imitation' or 'simulant' gemstone is…", options: [
      { id: "a", text: "A different material made to look like the gem (e.g., glass, cubic zirconia)", correct: true },
      { id: "b", text: "The same mineral grown in a lab", correct: false },
      { id: "c", text: "Always more valuable than the natural stone", correct: false },
      { id: "d", text: "A naturally mined version", correct: false },
    ] },
    { id: "f19", type: "mcq", prompt: "Fluorescence in a mineral happens when it…", options: [
      { id: "a", text: "Absorbs UV light and re-emits it as visible light", correct: true },
      { id: "b", text: "Stores sunlight as electricity", correct: false },
      { id: "c", text: "Generates its own heat", correct: false },
      { id: "d", text: "Becomes magnetic", correct: false },
    ] },
    { id: "f20", type: "mcq", prompt: "Torbernite and autunite are dangerous mainly because they are…", options: [
      { id: "a", text: "Radioactive uranium minerals (also toxic)", correct: true },
      { id: "b", text: "Extremely soft", correct: false },
      { id: "c", text: "Made of pure gold", correct: false },
      { id: "d", text: "Magnetic", correct: false },
    ] },
    { id: "f21", type: "mcq", prompt: "Ruby and sapphire are both varieties of which mineral?", options: [
      { id: "a", text: "Corundum", correct: true },
      { id: "b", text: "Quartz", correct: false },
      { id: "c", text: "Beryl", correct: false },
      { id: "d", text: "Feldspar", correct: false },
    ] },
    { id: "f22", type: "mcq", prompt: "Agate, carnelian, and jasper are forms of which kind of quartz?", options: [
      { id: "a", text: "Cryptocrystalline quartz (chalcedony)", correct: true },
      { id: "b", text: "A non-quartz mineral", correct: false },
      { id: "c", text: "Volcanic glass", correct: false },
      { id: "d", text: "Lab-grown synthetic", correct: false },
    ] },
    { id: "f23", type: "mcq", prompt: "Slow cooling of magma deep underground tends to produce…", options: [
      { id: "a", text: "Larger crystals", correct: true },
      { id: "b", text: "Only glass", correct: false },
      { id: "c", text: "No crystals", correct: false },
      { id: "d", text: "Radioactive stones", correct: false },
    ] },
    { id: "f24", type: "true-false", prompt: "'Hardness' (resistance to scratching) and 'toughness' (resistance to breaking) are the same property.", options: [
      { id: "t", text: "True", correct: false },
      { id: "f", text: "False", correct: true },
    ] },
    { id: "f25", type: "true-false", prompt: "The single most important rule is to never use a crystal in place of medical care.", options: [
      { id: "t", text: "True", correct: true },
      { id: "f", text: "False", correct: false },
    ] },
  ],
};
