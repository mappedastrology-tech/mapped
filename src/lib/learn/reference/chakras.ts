import type { ReferenceEntry } from "../types";

/**
 * Quick-reference chakra lookup. Presents the chakra system as the yogic and
 * tantric tradition holds it: the seven main wheels of the subtle body, their
 * standard correspondences (color, element, bija sound, location), plus the
 * energetic anatomy that surrounds them — nadis, prana, kundalini, and the
 * higher transpersonal centers.
 */

function chakra(e: Omit<ReferenceEntry, "domain">): ReferenceEntry {
  return { domain: "chakras", ...e };
}

export const chakraReference: ReferenceEntry[] = [
  chakra({
    id: "chakra-subtle-body",
    name: "The Subtle Body",
    aka: ["sukshma sharira", "energy body"],
    category: "Overview",
    summary:
      "In the yogic and tantric tradition the physical body is interpenetrated by a subtle body of energy — a network of nadis (channels) along which prana (life-force) flows, organized around a central column of chakras. The chakras are spinning wheels of awareness strung along the spine, each governing a layer of our physical, emotional, and spiritual life.",
    fields: [
      { label: "What it is", value: "The energetic anatomy that animates the physical form — channels (nadis), life-force (prana), and the wheels (chakras) that distribute it." },
      { label: "Main chakras", value: "Seven principal centers run from the base of the spine to the crown of the head, threaded by the central channel (sushumna)." },
      { label: "How energy moves", value: "Prana flows through the nadis; when the chakras are open and the channels clear, energy rises freely along the spine." },
      { label: "Aim of practice", value: "To purify the channels and balance the wheels so that awareness can ascend from the root to the crown." },
    ],
    tags: ["overview", "subtle body", "prana", "nadis", "yoga", "tantra"],
  }),
  chakra({
    id: "chakra-root",
    name: "Root Chakra",
    aka: ["Muladhara", "Mooladhara", "base chakra", "first chakra"],
    category: "Chakra",
    summary:
      "Muladhara, the root, sits at the base of the spine and is the foundation of the whole chakra system. It governs survival, stability, and our sense of belonging to the earth. When the root is strong we feel grounded, safe, and at home in the body.",
    fields: [
      { label: "Sanskrit", value: "Muladhara — 'root support' (mula, root; adhara, base)." },
      { label: "Location", value: "Base of the spine / perineum." },
      { label: "Color", value: "Red." },
      { label: "Element", value: "Earth (prithvi)." },
      { label: "Seed sound (bija)", value: "LAM." },
      { label: "Themes", value: "Survival, security, stability, grounding, belonging, the physical body and basic needs." },
      { label: "Balanced", value: "Grounded, safe, stable, and resourced; a steady sense of presence and trust in life." },
      { label: "Out of balance", value: "Anxiety, fear, restlessness, feeling uprooted or insecure; or rigidity and heaviness when overactive." },
      { label: "Supportive practices", value: "Grounding standing poses, mountain and squat postures, walking barefoot on the earth, chanting LAM, working with red stones, and steady rhythmic breath." },
    ],
    tags: ["red", "earth", "grounding", "survival", "lam", "first chakra"],
  }),
  chakra({
    id: "chakra-sacral",
    name: "Sacral Chakra",
    aka: ["Svadhisthana", "Swadhisthana", "second chakra"],
    category: "Chakra",
    summary:
      "Svadhisthana, the seat of the self, sits in the lower belly and governs emotion, pleasure, creativity, and flow. It is the watery center where desire and feeling move, inviting us to enjoy life and create freely.",
    fields: [
      { label: "Sanskrit", value: "Svadhisthana — 'one's own dwelling place' or 'seat of the self.'" },
      { label: "Location", value: "Lower abdomen, below the navel / sacrum." },
      { label: "Color", value: "Orange." },
      { label: "Element", value: "Water (apas)." },
      { label: "Seed sound (bija)", value: "VAM." },
      { label: "Themes", value: "Emotion, sensuality, pleasure, creativity, desire, flow, and intimacy." },
      { label: "Balanced", value: "Emotionally fluid, creative, sensual, and able to feel pleasure and connection with ease." },
      { label: "Out of balance", value: "Emotional numbness or volatility, blocked creativity, guilt around pleasure, or dependency and excess." },
      { label: "Supportive practices", value: "Hip-opening poses, flowing movement and dance, creative play, working with the breath in the belly, chanting VAM, and orange stones." },
    ],
    tags: ["orange", "water", "creativity", "emotion", "pleasure", "vam", "second chakra"],
  }),
  chakra({
    id: "chakra-solar-plexus",
    name: "Solar Plexus Chakra",
    aka: ["Manipura", "third chakra", "navel chakra"],
    category: "Chakra",
    summary:
      "Manipura, the city of jewels, blazes at the navel and is the center of personal power, will, and confidence. It is our inner fire — the source of self-esteem, drive, and the ability to act in the world.",
    fields: [
      { label: "Sanskrit", value: "Manipura — 'city of jewels' (mani, jewel; pura, city)." },
      { label: "Location", value: "Solar plexus, between the navel and the base of the sternum." },
      { label: "Color", value: "Yellow." },
      { label: "Element", value: "Fire (agni / tejas)." },
      { label: "Seed sound (bija)", value: "RAM." },
      { label: "Themes", value: "Personal power, will, confidence, identity, discipline, transformation, and drive." },
      { label: "Balanced", value: "Confident, self-assured, purposeful, and able to act with healthy willpower and boundaries." },
      { label: "Out of balance", value: "Low self-worth, passivity, or — when overactive — control, anger, and domination." },
      { label: "Supportive practices", value: "Core-building and twisting poses, breath of fire (kapalabhati), sun salutations, chanting RAM, and yellow stones." },
    ],
    tags: ["yellow", "fire", "power", "will", "confidence", "ram", "third chakra"],
  }),
  chakra({
    id: "chakra-heart",
    name: "Heart Chakra",
    aka: ["Anahata", "fourth chakra"],
    category: "Chakra",
    summary:
      "Anahata, the unstruck sound, sits at the center of the chest and is the bridge between the lower, earthly chakras and the higher, spiritual ones. It is the seat of love, compassion, and connection — where we open to others and to ourselves.",
    fields: [
      { label: "Sanskrit", value: "Anahata — 'unstruck' or 'unhurt,' referring to a sound that arises without two things striking." },
      { label: "Location", value: "Center of the chest." },
      { label: "Color", value: "Green (with a secondary association of pink)." },
      { label: "Element", value: "Air (vayu)." },
      { label: "Seed sound (bija)", value: "YAM." },
      { label: "Themes", value: "Love, compassion, connection, forgiveness, acceptance, and balance — the meeting point of body and spirit." },
      { label: "Balanced", value: "Loving, compassionate, open-hearted, and able to give and receive love with ease and equanimity." },
      { label: "Out of balance", value: "Grief, isolation, defensiveness, or difficulty trusting; or over-giving and loss of boundaries when overactive." },
      { label: "Supportive practices", value: "Chest-opening backbends, loving-kindness (metta) meditation, gratitude practice, balanced breath, chanting YAM, and green or pink stones." },
    ],
    tags: ["green", "pink", "air", "love", "compassion", "yam", "fourth chakra"],
  }),
  chakra({
    id: "chakra-throat",
    name: "Throat Chakra",
    aka: ["Vishuddha", "Vishuddhi", "fifth chakra"],
    category: "Chakra",
    summary:
      "Vishuddha, the purification center, sits at the throat and governs voice, truth, and authentic expression. It is where inner truth becomes outer sound — the chakra of communication, listening, and speaking our genuine self.",
    fields: [
      { label: "Sanskrit", value: "Vishuddha — 'especially pure' or 'purification.'" },
      { label: "Location", value: "Throat." },
      { label: "Color", value: "Blue (sky or turquoise blue)." },
      { label: "Element", value: "Ether / space (akasha)." },
      { label: "Seed sound (bija)", value: "HAM." },
      { label: "Themes", value: "Communication, truth, self-expression, listening, creativity in speech, and authenticity." },
      { label: "Balanced", value: "Clear, honest, and expressive; able to speak truth and listen deeply." },
      { label: "Out of balance", value: "Difficulty expressing oneself, fear of speaking, or — when overactive — talking over others and not listening." },
      { label: "Supportive practices", value: "Chanting and mantra, singing, neck and shoulder openers, ujjayi breath, journaling, chanting HAM, and blue stones." },
    ],
    tags: ["blue", "ether", "space", "communication", "truth", "ham", "fifth chakra"],
  }),
  chakra({
    id: "chakra-third-eye",
    name: "Third Eye Chakra",
    aka: ["Ajna", "Agya", "brow chakra", "sixth chakra"],
    category: "Chakra",
    summary:
      "Ajna, the command center, sits between the eyebrows and is the seat of intuition, insight, and inner vision. It is where we perceive beyond the senses — the chakra of wisdom, imagination, and clear seeing.",
    fields: [
      { label: "Sanskrit", value: "Ajna — 'command' or 'to perceive.'" },
      { label: "Location", value: "Between and slightly above the eyebrows (the brow center)." },
      { label: "Color", value: "Indigo (deep blue-violet)." },
      { label: "Element", value: "Light / mind (often given as the element beyond the elements)." },
      { label: "Seed sound (bija)", value: "OM (sometimes given as KSHAM)." },
      { label: "Themes", value: "Intuition, insight, imagination, perception, wisdom, and inner vision." },
      { label: "Balanced", value: "Intuitive, perceptive, and clear-minded; trusting inner knowing and seeing situations clearly." },
      { label: "Out of balance", value: "Confusion, lack of clarity, over-reliance on intellect, or — when overactive — overactive imagination and dissociation." },
      { label: "Supportive practices", value: "Trataka (candle gazing), brow-focused meditation, visualization, alternate-nostril breath, chanting OM, and indigo stones." },
    ],
    tags: ["indigo", "intuition", "insight", "vision", "om", "sixth chakra", "brow"],
  }),
  chakra({
    id: "chakra-crown",
    name: "Crown Chakra",
    aka: ["Sahasrara", "thousand-petalled lotus", "seventh chakra"],
    category: "Chakra",
    summary:
      "Sahasrara, the thousand-petalled lotus, rests at the crown of the head and is the highest of the main chakras. It is the seat of pure consciousness and spiritual connection — where the individual self opens to the universal, and union (yoga) is realized.",
    fields: [
      { label: "Sanskrit", value: "Sahasrara — 'thousand-petalled,' the thousand-petalled lotus." },
      { label: "Location", value: "Crown of the head (or just above it)." },
      { label: "Color", value: "Violet or white (sometimes described as luminous gold)." },
      { label: "Element", value: "Pure consciousness / thought, beyond the elements." },
      { label: "Seed sound (bija)", value: "Silence, or the cosmic OM / AUM; often held as soundless." },
      { label: "Themes", value: "Spiritual connection, unity, pure awareness, transcendence, and enlightenment." },
      { label: "Balanced", value: "A sense of spiritual connection, peace, presence, and unity with something greater." },
      { label: "Out of balance", value: "Disconnection, cynicism, or spiritual emptiness; or being ungrounded and 'in the clouds' when overactive." },
      { label: "Supportive practices", value: "Silent meditation, devotional practice, stillness, surrender, chanting OM, and clear or violet stones." },
    ],
    tags: ["violet", "white", "crown", "consciousness", "unity", "om", "seventh chakra"],
  }),
  chakra({
    id: "chakra-earth-star",
    name: "Earth Star Chakra",
    aka: ["super root", "Vasundhara"],
    category: "Transpersonal chakra",
    summary:
      "The Earth Star sits below the feet, anchoring the whole energy system into the planet itself. Held as a transpersonal center beneath the root, it deepens grounding and connects the subtle body to the Earth's own field, lending stability and a sense of being held by the ground.",
    fields: [
      { label: "Location", value: "Roughly 30 cm to a metre below the soles of the feet." },
      { label: "Color", value: "Deep brown to black, sometimes magnetic/iridescent earth tones." },
      { label: "Themes", value: "Deep grounding, connection to the Earth, stability, and anchoring of one's energy into the planet." },
      { label: "Balanced", value: "Deeply rooted, steady, and connected to the Earth; able to draw on the ground's support." },
      { label: "Out of balance", value: "Feeling untethered, spacey, or unable to stay present in the body and the world." },
      { label: "Supportive practices", value: "Earthing and walking on the land, visualizing roots descending into the Earth, and grounding stones such as hematite and black tourmaline." },
    ],
    tags: ["earth star", "grounding", "transpersonal", "below feet", "anchor"],
  }),
  chakra({
    id: "chakra-soul-star",
    name: "Soul Star Chakra",
    aka: ["seat of the soul", "eighth chakra"],
    category: "Transpersonal chakra",
    summary:
      "The Soul Star sits above the crown, the first of the transpersonal centers reaching beyond the body. Held as the seat of the soul and divine connection, it is the gateway through which higher spiritual energy and one's deeper purpose flow down into the system.",
    fields: [
      { label: "Location", value: "Roughly 15 cm to a foot above the crown of the head." },
      { label: "Color", value: "White or magenta, sometimes described as luminous gold." },
      { label: "Themes", value: "Divine connection, the soul's purpose, spiritual download, transcendence, and unconditional love." },
      { label: "Balanced", value: "Connected to one's higher purpose and a sense of the sacred, while remaining grounded." },
      { label: "Out of balance", value: "Spiritual bypassing, ungroundedness, or disconnection from a sense of meaning." },
      { label: "Supportive practices", value: "Meditation on the space above the head, devotional and surrender practices, and high-vibration stones such as selenite and clear quartz." },
    ],
    tags: ["soul star", "transpersonal", "above crown", "soul", "divine"],
  }),
  chakra({
    id: "chakra-nadis",
    name: "Nadis (Ida, Pingala, Sushumna)",
    aka: ["energy channels", "ida", "pingala", "sushumna"],
    category: "Subtle anatomy",
    summary:
      "The nadis are the subtle channels through which prana flows. Tradition counts thousands of them, but three are central: Sushumna, the great channel running up the spine, and Ida and Pingala, which spiral around it. The chakras are the points where these channels meet.",
    fields: [
      { label: "What they are", value: "Subtle energy channels (nadis) carrying prana through the body; tradition names 72,000, with three principal channels." },
      { label: "Sushumna", value: "The central channel running up the spinal column; the path along which awakened energy (kundalini) rises through the chakras." },
      { label: "Ida", value: "The left channel — cooling, lunar, receptive and feminine in quality; associated with the parasympathetic, calming side." },
      { label: "Pingala", value: "The right channel — heating, solar, active and masculine in quality; associated with the energizing, dynamic side." },
      { label: "Where they meet", value: "Ida and Pingala spiral around Sushumna and cross at each chakra, like the strands of a caduceus." },
      { label: "Aim of practice", value: "To balance Ida and Pingala so that prana can enter and rise through the central Sushumna channel." },
    ],
    tags: ["nadis", "ida", "pingala", "sushumna", "channels", "subtle anatomy"],
  }),
  chakra({
    id: "chakra-prana",
    name: "Prana",
    aka: ["life-force", "vital energy", "chi", "qi"],
    category: "Subtle anatomy",
    summary:
      "Prana is the vital life-force that animates all living things — the subtle energy that flows through the nadis and enlivens the chakras. Carried especially on the breath, prana is what yoga practices seek to gather, direct, and refine.",
    fields: [
      { label: "What it is", value: "The universal life-force or vital energy that pervades and animates the body and cosmos." },
      { label: "How it moves", value: "Prana flows through the nadis and is distributed by the chakras; it is closely tied to the breath." },
      { label: "Pranayama", value: "The yogic art of breath regulation (prana, life-force; ayama, to extend) used to gather and direct prana." },
      { label: "The five vayus", value: "Prana is said to move in five currents (vayus): prana, apana, samana, udana, and vyana, each governing a function of the body." },
      { label: "Why it matters", value: "Clear, abundant prana brings vitality and clarity; when it stagnates, energy and the chakras can feel blocked." },
    ],
    tags: ["prana", "life force", "breath", "pranayama", "vayu", "chi", "qi"],
  }),
  chakra({
    id: "chakra-kundalini",
    name: "Kundalini",
    aka: ["serpent power", "coiled energy", "kundalini shakti"],
    category: "Subtle anatomy",
    summary:
      "Kundalini is the dormant spiritual energy said to lie coiled like a serpent at the base of the spine. Through dedicated practice it awakens and rises through the central channel, piercing each chakra in turn until it unites with consciousness at the crown — the awakening at the heart of tantric yoga.",
    fields: [
      { label: "What it is", value: "A latent spiritual energy (kundalini shakti) pictured as a serpent coiled three and a half times at the base of the spine." },
      { label: "Where it rests", value: "Dormant at the root chakra (Muladhara), at the base of the spine." },
      { label: "The ascent", value: "When awakened, it rises through the Sushumna channel, opening each chakra in turn from root to crown." },
      { label: "The union", value: "At the crown (Sahasrara), the rising Shakti unites with Shiva (consciousness) — the realization of yoga." },
      { label: "Approach with care", value: "Tradition treats kundalini as powerful and best awakened gradually under experienced guidance, with grounding and patience." },
    ],
    safety: "Kundalini awakening is traditionally approached slowly and with experienced guidance. Honor grounding, patience, and steady foundations rather than forcing the process.",
    tags: ["kundalini", "serpent", "shakti", "awakening", "spine", "tantra"],
  }),
  chakra({
    id: "chakra-bija-mantra",
    name: "Bija Mantras (Seed Sounds)",
    aka: ["seed mantra", "seed sound", "bija"],
    category: "Practice",
    summary:
      "A bija ('seed') mantra is a single-syllable sound vibration associated with each chakra. Chanting these seed sounds is a traditional way to activate, balance, and tune the chakras, resonating each center with its own note.",
    fields: [
      { label: "What it is", value: "A one-syllable 'seed' sound that carries the essential vibration of a chakra or deity." },
      { label: "The seven seeds", value: "LAM (root), VAM (sacral), RAM (solar plexus), YAM (heart), HAM (throat), OM (third eye), and silence or OM (crown)." },
      { label: "How they are used", value: "Chanted aloud or silently, often while resting attention on the chakra's location, to awaken and balance the center." },
      { label: "OM / AUM", value: "OM (AUM) is the primordial sound, the seed of the third eye and the cosmic vibration from which all others arise." },
      { label: "Why it works (in tradition)", value: "Each chakra is held to resonate with its seed sound, so chanting it brings that center into harmony and flow." },
    ],
    tags: ["bija", "mantra", "seed sound", "lam", "vam", "ram", "yam", "ham", "om", "chanting"],
  }),
];
