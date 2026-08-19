/**
 * Animal Guides — 72 entries (spec §5.4). The engine is library-agnostic: an
 * animal is just another trait vector matched by the same decorrelated cosine.
 *
 * Terminology is deliberate. This is an "Animal Guide", never a "spirit animal"
 * or "power animal" — those name a specific Indigenous North American religious
 * relationship whose casual/commercial use is widely and specifically objected
 * to (spec §5.4.1). Every entry carries a provenance tier + source, because
 * showing where a meaning comes from IS the anti-appropriation move and the
 * product differentiator (§5.4.2): most circulating "animal meanings" are ~40
 * years old and trace to two or three commercial books.
 *
 * Cultural gate (§5.4.3): nothing here is assigned from a closed tradition —
 * no Aboriginal Australian totems, Yorùbá/Ifá, Indigenous North American clan
 * animals, Hawaiian aumakua, Siberian helping spirits, or living Maya day-signs.
 * Those belong only in a sourced editorial section. Where an animal also lives
 * in a closed tradition, we cite an open one (e.g. spider → Greek Arachne, not
 * Diné) and never reproduce closed-tradition art styles.
 *
 * tier:  attested       — named tradition with a citable source
 *        widely-shared  — recurs across unrelated traditions, no single origin
 *        modern-popular — a 20th/21st-c. reading, labelled honestly
 * status: open          — historical / no substantial living gate; assignable
 *         living-open   — living faith, publicly documented; comparative phrasing
 */

import { TraitDeltas, TraitVec, TraitId, TRAIT_ORDER } from "./traits";
import { rankLibrary } from "./engine";
import { animalOffset } from "./calibration";

export type ProvenanceTier = "attested" | "widely-shared" | "modern-popular";
export type CulturalStatus = "open" | "living-open";

interface AnimalDef {
  slug: string;
  name: string;
  group: "mammal" | "bird" | "reptile" | "insect" | "mythic";
  deltas: TraitDeltas;          // salient emphases around the 50 baseline
  tier: ProvenanceTier;
  tradition: string;            // short, human-readable
  sources: string[];           // 1–2 short attributions (badge shows the first)
  status: CulturalStatus;
  tagline: string;             // ≤ 12 words
  essence: string;
  shadow: string;              // REQUIRED — the real failure mode
}

export interface AnimalGuide {
  id: string;
  name: string;
  group: AnimalDef["group"];
  traits: TraitVec;
  tier: ProvenanceTier;
  tradition: string;
  sources: string[];
  status: CulturalStatus;
  tagline: string;
  essence: string;
  shadow: string;
  signature: TraitId[];        // top 3 emphasised traits
}

const clamp = (n: number) => Math.max(2, Math.min(98, Math.round(n)));

/** Author-supplied deltas (§5.4). Concise, salient — the vector is composed around 50. */
const DEFS: AnimalDef[] = [
  // ————————————————————————————— Land mammals (22) —————————————————————————————
  {
    slug: "wolf", name: "Wolf", group: "mammal",
    deltas: { loyalty: 30, endurance: 18, intensity: 14, care: 12, initiative: 10, autonomy: -18, order: 8 },
    tier: "widely-shared", tradition: "Pan-cultural (Norse, Roman, Mongol)",
    sources: ["Norse úlfheðnar (pack-warriors)", "Roman she-wolf; Mongol origin myth"], status: "open",
    tagline: "The pack is the point, not the loner.",
    essence: "The Wolf is built for the pack — coordinated, loyal, and fierce in defence of its own. The traditional wolf is never the 'lone wolf' of pop culture; Norse, Roman, and Mongol sources all read it as kinship, hierarchy, and shared hunt. You lead and follow by turns, and you're at your strongest inside a bonded group.",
    shadow: "Loyalty can curdle into us-against-them, and the pack's rules can override your own judgement.",
  },
  {
    slug: "bear", name: "Bear", group: "mammal",
    deltas: { endurance: 24, stillness: 20, sovereignty: 14, care: 14, intensity: 12, embodiment: 12, adaptability: -10 },
    tier: "widely-shared", tradition: "Pan-cultural (Celtic, Norse, Siberian-adjacent)",
    sources: ["Celtic Artio; Norse berserkr", "Widely attested across the northern hemisphere"], status: "open",
    tagline: "Withdraws to gather, returns immovable.",
    essence: "The Bear holds enormous power in reserve. It withdraws — hibernates, retreats, goes quiet — and returns renewed and unmoveable. Protective of its own and slow to rouse, but overwhelming once it is. You restore through solitude and defend what's yours without needing to prove it.",
    shadow: "The retreat can become a cave you never leave, and roused anger runs to disproportionate force.",
  },
  {
    slug: "fox", name: "Fox", group: "mammal",
    deltas: { adaptability: 26, analysis: 16, concealment: 18, autonomy: 12, craft: 10, order: -12, loyalty: -6 },
    tier: "attested", tradition: "Norse fylgja; Japanese kitsune",
    sources: ["Norse fylgja (fox = the cunning/deceitful)", "Japanese kitsune folklore"], status: "open",
    tagline: "Wins by wit where force would fail.",
    essence: "The Fox solves by cleverness what others can't by strength — reading the terrain, slipping constraints, finding the unguarded door. In the Norse fylgja tradition a fox-shape marked a cunning character. You improvise brilliantly and rarely meet a fence you can't get around.",
    shadow: "Cleverness slides into cutting corners and quiet deceit; you can outsmart yourself out of trust.",
  },
  {
    slug: "stag", name: "Stag", group: "mammal",
    deltas: { sovereignty: 22, display: 16, vision: 12, transcendence: 12, autonomy: 10, initiative: 8, concealment: -8 },
    tier: "attested", tradition: "Celtic (Cernunnos); Welsh",
    sources: ["Celtic Cernunnos", "Welsh 'Oldest Animals' — Stag of Rhedynfre (Culhwch ac Olwen)"], status: "open",
    tagline: "Wears its crown in the open.",
    essence: "The Stag carries its authority visibly — antlers like a crown, regrown each year. In Celtic myth it stands for the wild sovereign and the turning seasons, and among the Welsh Oldest Animals it is a keeper of long memory. You hold a natural dignity and renew your power through cycles of shedding and regrowth.",
    shadow: "The need to be seen as noble can make you rigid, and pride refuses help until it's too late.",
  },
  {
    slug: "horse", name: "Horse", group: "mammal",
    deltas: { initiative: 20, endurance: 18, adaptability: 14, magnetism: 12, autonomy: 12, embodiment: 10, stillness: -12 },
    tier: "attested", tradition: "Celtic (Epona); Norse",
    sources: ["Celtic Epona", "Norse Sleipnir; widely as free movement"], status: "open",
    tagline: "Freedom in motion, power in partnership.",
    essence: "The Horse is drive and momentum — it covers ground, carries others, and gives its strength willingly once it trusts. The goddess Epona shows the horse as both freedom and faithful partnership. You need forward motion and open country, and you're most powerful in a partnership you've chosen.",
    shadow: "Restlessness can bolt past everything solid; without trust you spook, buck, and run.",
  },
  {
    slug: "lion", name: "Lion", group: "mammal",
    deltas: { sovereignty: 24, display: 20, magnetism: 16, initiative: 12, intensity: 10, concealment: -12, stillness: -8 },
    tier: "attested", tradition: "Egyptian (Sekhmet); heraldic",
    sources: ["Egyptian Sekhmet; Greek Nemean lion", "Near-universal heraldry of kingship"], status: "open",
    tagline: "Rules by presence, not permission.",
    essence: "The Lion commands a room by simply entering it — regal, warm, and unafraid of the spotlight. From Sekhmet to a thousand coats of arms, the lion is sovereignty made visible. You carry natural authority and generous pride, and you protect the people who sit under your name.",
    shadow: "The spotlight becomes a need; when admiration thins, ego and temper fill the gap.",
  },
  {
    slug: "tiger", name: "Tiger", group: "mammal",
    deltas: { intensity: 26, initiative: 18, autonomy: 18, sovereignty: 12, embodiment: 12, order: -10, loyalty: -8 },
    tier: "attested", tradition: "Chinese (White Tiger of the West)",
    sources: ["Chinese Four Symbols — Báihǔ", "Widely as solitary sovereign predator"], status: "open",
    tagline: "Solitary, absolute, all at once.",
    essence: "The Tiger is concentrated force that moves alone. One of the Chinese Four Symbols, the White Tiger governs the west and autumn — courage, war, and swift decisive power. You commit completely and need no company to act; when you strike, it's total.",
    shadow: "All-or-nothing intensity burns hot and isolates; patience and compromise feel like weakness.",
  },
  {
    slug: "jaguar", name: "Jaguar", group: "mammal",
    deltas: { shadow: 22, intensity: 18, concealment: 16, transformation: 14, sovereignty: 12, intuition: 10, display: -10 },
    tier: "attested", tradition: "Mesoamerican (historical Olmec/Aztec)",
    sources: ["Olmec were-jaguar; Aztec night-jaguar of Tezcatlipoca"], status: "open",
    tagline: "Moves through the dark like it belongs there.",
    essence: "The Jaguar owns the night and the threshold between worlds. In historical Mesoamerican thought it was the animal of rulers and the night sun, at home in darkness and passage. You see in low light — literally and otherwise — and you're drawn to the powerful, hidden edges others avoid.",
    shadow: "Comfort in the dark can tip into secrecy and dominance for its own sake.",
  },
  {
    slug: "leopard", name: "Leopard", group: "mammal",
    deltas: { concealment: 22, autonomy: 18, adaptability: 16, intensity: 12, craft: 10, initiative: 8, loyalty: -8 },
    tier: "attested", tradition: "Greek (Dionysus); African folklore",
    sources: ["Greek — Dionysus's leopards", "Recurrent West/Central African trickster-hunter"], status: "open",
    tagline: "Unseen until it chooses otherwise.",
    essence: "The Leopard is self-possessed and unbothered by belonging — it hunts alone, hides in plain sight, and answers to no group. Linked to Dionysus and to many African hunter tales, it blends power with concealment. You keep your own counsel and reveal yourself only on your terms.",
    shadow: "Radical self-sufficiency reads as coldness; you can vanish from people who needed you.",
  },
  {
    slug: "elephant", name: "Elephant", group: "mammal",
    deltas: { memory: 26, care: 20, endurance: 16, loyalty: 16, stillness: 12, sovereignty: 10, disruption: -12 },
    tier: "attested", tradition: "Hindu (Ganesha); Buddhist",
    sources: ["Hindu Ganesha — remover of obstacles", "Buddhist white elephant (Māyā's dream)"], status: "living-open",
    tagline: "Remembers everything, forgets no one.",
    essence: "The Elephant carries deep memory and deep care — matriarchal, patient, and immensely strong. Your pattern echoes Ganesha's, the remover of obstacles who clears the path by sheer steady weight. You hold family and history, grieve fully, and move obstacles others call immovable.",
    shadow: "A long memory keeps old wounds fresh, and duty to the herd can bury your own needs.",
  },
  {
    slug: "boar", name: "Boar", group: "mammal",
    deltas: { initiative: 22, intensity: 20, endurance: 16, disruption: 14, autonomy: 10, order: -12, stillness: -10 },
    tier: "attested", tradition: "Celtic; Norse (Freyr)",
    sources: ["Celtic Twrch Trwyth (Culhwch ac Olwen)", "Norse Gullinbursti, boar of Freyr"], status: "open",
    tagline: "Charges straight through what others go around.",
    essence: "The Boar is raw courage that meets things head-on. Celtic and Norse myth cast it as the untameable warrior — Freyr's golden boar, the great hunt of Twrch Trwyth. You confront rather than evade, and your fearlessness clears ground nobody else would take.",
    shadow: "Headlong courage becomes recklessness; you charge before you've checked the ground.",
  },
  {
    slug: "hare", name: "Hare", group: "mammal",
    deltas: { intuition: 20, adaptability: 18, initiative: 14, transcendence: 12, vision: 10, endurance: -10, order: -8 },
    tier: "attested", tradition: "Chinese moon-hare; European folklore",
    sources: ["Chinese Moon Hare (jade rabbit)", "European spring/fertility folklore; Aesop"], status: "open",
    tagline: "Quick, lunar, always two jumps ahead.",
    essence: "The Hare is speed, instinct, and a link to the moon's cycles. The Chinese jade rabbit pounds elixir on the moon; across Europe the hare marks spring and renewal. You move fast on gut sense and land somewhere new before others have decided to start.",
    shadow: "Speed without endurance means half-finished sprints; you can startle and flee real intimacy.",
  },
  {
    slug: "rat", name: "Rat", group: "mammal",
    deltas: { analysis: 20, adaptability: 22, initiative: 14, craft: 12, autonomy: 10, order: -8, display: -10 },
    tier: "attested", tradition: "Chinese zodiac (first sign)",
    sources: ["Chinese zodiac — the Rat won the race by wit"], status: "open",
    tagline: "Resourceful, quick-witted, first across the line.",
    essence: "The Rat is survival intelligence — resourceful, adaptable, and quietly ahead. In the Chinese zodiac the Rat wins first place not by strength but by cleverness, riding the ox and jumping first. You thrive anywhere, spot the opening early, and turn scarcity into advantage.",
    shadow: "Endless resourcefulness can become opportunism; you take the shortcut and rationalise it later.",
  },
  {
    slug: "ox", name: "Ox", group: "mammal",
    deltas: { endurance: 28, order: 18, craft: 12, loyalty: 12, stillness: 12, embodiment: 12, disruption: -14, initiative: -8 },
    tier: "attested", tradition: "Chinese zodiac; agrarian",
    sources: ["Chinese zodiac — patient, dependable labour", "Near-universal plough/harvest symbol"], status: "open",
    tagline: "Pulls the load the whole way, every time.",
    essence: "The Ox is steady, reliable strength — it puts its shoulder down and finishes the season's work. The Chinese zodiac honours it as the dependable one, patient and honest. You carry more than your share without drama and outlast every flashier start.",
    shadow: "Stubborn steadiness resists change long after the field has flooded.",
  },
  {
    slug: "ram", name: "Ram", group: "mammal",
    deltas: { initiative: 24, sovereignty: 16, intensity: 14, autonomy: 12, display: 10, stillness: -12, adaptability: -8 },
    tier: "attested", tradition: "Egyptian (Khnum/Amun); Greek (Aries)",
    sources: ["Egyptian ram-gods Khnum and Amun", "Greek — the golden ram / Aries"], status: "open",
    tagline: "Leads from the front, horns first.",
    essence: "The Ram is initiative and headstrong leadership. Egyptian ram-gods embodied creative force and virility; the Greek golden ram carried heroes to safety. You go first, set the direction, and butt against limits until they give.",
    shadow: "Leading with the head means collisions; you'll ram a wall rather than admit it's a wall.",
  },
  {
    slug: "dog", name: "Dog", group: "mammal",
    deltas: { loyalty: 30, care: 18, initiative: 10, embodiment: 10, endurance: 10, autonomy: -20, concealment: -10 },
    tier: "attested", tradition: "Egyptian (Anubis); pan-cultural",
    sources: ["Egyptian Anubis, guardian and guide", "Near-universal symbol of loyalty"], status: "open",
    tagline: "Faithful to the end, and past it.",
    essence: "The Dog is devotion made animal — loyal, protective, and attuned to its people. Anubis guarded the threshold between life and death; the guide-dog motif recurs everywhere. You love wholeheartedly, guard fiercely, and read the emotional weather of everyone around you.",
    shadow: "Devotion without boundaries becomes dependence; you'll stay loyal to people who don't deserve it.",
  },
  {
    slug: "cat", name: "Cat", group: "mammal",
    deltas: { autonomy: 24, intuition: 16, concealment: 16, stillness: 12, display: 8, craft: 8, loyalty: -12 },
    tier: "attested", tradition: "Egyptian (Bastet)",
    sources: ["Egyptian Bastet — home, protection, independence"], status: "open",
    tagline: "Affection on its own terms, never yours.",
    essence: "The Cat is grace, independence, and unhurried self-possession. Bastet joined the domestic hearth to fierce protection and pleasure. You give affection freely but never on command, sense what a room is really doing, and keep a private world nobody fully enters.",
    shadow: "Independence can read as aloofness; you withhold to stay in control.",
  },
  {
    slug: "monkey", name: "Monkey", group: "mammal",
    deltas: { adaptability: 24, expression: 18, disruption: 16, analysis: 12, magnetism: 10, order: -12, stillness: -8 },
    tier: "attested", tradition: "Chinese (Sun Wukong)",
    sources: ["Chinese — Sun Wukong, the Monkey King (Journey to the West)"], status: "open",
    tagline: "Plays, tests, and breaks the rules brilliantly.",
    essence: "The Monkey is inventive, mischievous intelligence. Sun Wukong is clever enough to storm heaven and irrepressible enough to be humbled by it. You learn by playing, puncture pomp, and find the trick that everyone else missed.",
    shadow: "Cleverness without discipline chases novelty and mischief past the point of trust.",
  },
  {
    slug: "otter", name: "Otter", group: "mammal",
    deltas: { expression: 16, adaptability: 18, care: 14, magnetism: 14, embodiment: 12, intensity: -10, order: -8 },
    tier: "attested", tradition: "Norse (Ótr); Celtic",
    sources: ["Norse — Ótr, the shape-shifting otter (Otter's Ransom)", "Celtic 'water-dog' helper"], status: "open",
    tagline: "Takes joy seriously and work lightly.",
    essence: "The Otter braids play and skill together — it works by enjoying the work. Norse myth gives the otter a shape-shifter's cleverness; Celtic lore made it a helpful river-spirit. You keep delight in the middle of effort and knit loose groups together with warmth.",
    shadow: "Play as avoidance: when things get heavy you slip downstream instead of staying.",
  },
  {
    slug: "badger", name: "Badger", group: "mammal",
    deltas: { endurance: 20, autonomy: 18, order: 14, craft: 12, intensity: 12, sovereignty: 10, adaptability: -12 },
    tier: "widely-shared", tradition: "European folklore; heraldry",
    sources: ["European folklore — tenacity and homekeeping", "British heraldic 'brock'"], status: "open",
    tagline: "Digs in, holds ground, finishes underground.",
    essence: "The Badger is dogged, self-reliant persistence. Folklore casts it as the grumpy, formidable homebody who will not be dislodged. You build deep, defend your ground, and grind through work others abandon — quietly, on your own.",
    shadow: "Tenacity hardens into stubborn isolation; you'd rather dig deeper than ask for help.",
  },
  {
    slug: "bat", name: "Bat", group: "mammal",
    deltas: { intuition: 22, transformation: 18, concealment: 16, adaptability: 12, shadow: 12, vision: 8, display: -10 },
    tier: "attested", tradition: "Chinese luck; Mesoamerican",
    sources: ["Chinese fú — the bat as a homophone for good fortune", "Mesoamerican night/underworld associations"], status: "open",
    tagline: "Navigates the dark by a sense others lack.",
    essence: "The Bat crosses thresholds — day to night, life to underworld, ending to beginning. In Chinese art five bats mean fivefold blessing; in Mesoamerica it belonged to the cave and the dark. You perceive by non-obvious senses and move easily through transitions that unsettle everyone else.",
    shadow: "Living in transitions can mean never landing; intuition without check turns to spooked suspicion.",
  },
  {
    slug: "whale", name: "Whale", group: "mammal",
    deltas: { memory: 22, transcendence: 18, care: 14, stillness: 14, intuition: 12, endurance: 12, initiative: -10 },
    tier: "widely-shared", tradition: "Pan-cultural sea lore",
    sources: ["Recurrent 'living island' / deep-keeper across sea-faring cultures"], status: "open",
    tagline: "Holds the deep, and the old songs in it.",
    essence: "The Whale carries depth, memory, and long communication across distance. Sea-faring cultures made it the keeper of the abyss and the ancestral song. You feel the emotional deep, remember across long spans, and hold a calm that steadies whole groups.",
    shadow: "Going that deep, you can submerge for too long and surface only for others, never yourself.",
  },

  // ————————————————————————————————— Birds (20) —————————————————————————————————
  {
    slug: "raven", name: "Raven", group: "bird",
    deltas: { analysis: 22, vision: 18, transformation: 14, memory: 14, concealment: 12, expression: 8, care: -8 },
    tier: "attested", tradition: "Norse (Odin); Welsh (Brân)",
    sources: ["Norse — Huginn & Muninn, Odin's thought and memory", "Welsh Brân the Blessed"], status: "open",
    tagline: "Thought and memory on two black wings.",
    essence: "The Raven is intelligence that ranges wide and reports back. Odin's ravens, Thought and Memory, flew the world each day; Brân's name means raven. You gather knowledge others miss, connect distant things, and carry a mind that will not stop turning things over.",
    shadow: "A restless intellect broods; you can circle a problem or an omen until it becomes fate.",
  },
  {
    slug: "crow", name: "Crow", group: "bird",
    deltas: { analysis: 20, adaptability: 20, expression: 14, craft: 12, memory: 12, order: -8, display: -6 },
    tier: "attested", tradition: "Greek (Apollo); widely",
    sources: ["Greek — Apollo's crow", "Near-universal clever-corvid folklore"], status: "open",
    tagline: "Tool-smart, social, impossible to fool twice.",
    essence: "The Crow is street-smart, communal cleverness — it makes tools, remembers faces, and shares the news. Apollo's crow carried messages and truth. You solve real problems inventively, keep a sharp social memory, and rarely fall for the same trick again.",
    shadow: "Cleverness can turn to cynicism and grudge-keeping; you file every slight and forget nothing.",
  },
  {
    slug: "owl", name: "Owl", group: "bird",
    deltas: { intuition: 22, analysis: 18, stillness: 16, concealment: 12, vision: 12, transcendence: 8, display: -12 },
    tier: "attested", tradition: "Greek (Athena); Welsh",
    sources: ["Greek — Athena's owl of wisdom", "Welsh — Owl of Cwm Cawlwyd (Culhwch ac Olwen)"], status: "open",
    tagline: "Sees in the dark, says little in the light.",
    essence: "The Owl is quiet, penetrating perception. Athena's bird made it the emblem of wisdom in the West, though Roman and Mesoamerican readings also tied it to death and omen — a reminder that clear sight can be unwelcome. You watch more than you speak and see what the daylight crowd walks right past.",
    shadow: "Detached watching becomes isolation; you observe everyone and let no one see you.",
  },
  {
    slug: "eagle", name: "Eagle", group: "bird",
    deltas: { vision: 24, sovereignty: 20, initiative: 14, display: 12, autonomy: 12, transcendence: 10, stillness: -8 },
    tier: "attested", tradition: "Roman (Jupiter); Welsh",
    sources: ["Roman aquila, bird of Jupiter", "Welsh — Eagle of Gwernabwy (Oldest Animals)"], status: "open",
    tagline: "Rises highest, sees furthest, answers to sky.",
    essence: "The Eagle takes the long, high view and acts on it. Rome carried it as the standard of empire; the Welsh made it one of the Oldest Animals. You climb above the detail to see the whole terrain, aim high, and hold a sovereign independence.",
    shadow: "Altitude breeds distance and hauteur; the ground-level cost of your vision can vanish from view.",
  },
  {
    slug: "hawk", name: "Hawk", group: "bird",
    deltas: { vision: 22, initiative: 18, intensity: 14, analysis: 12, autonomy: 10, craft: 8, stillness: -8 },
    tier: "attested", tradition: "Egyptian (Horus)",
    sources: ["Egyptian — Horus the falcon-hawk, sky and kingship"], status: "open",
    tagline: "Focus that ends in a single strike.",
    essence: "The Hawk is focused sight married to decisive action. Horus's sky-eye watched over kingship and order. You lock onto the target, hold it while others get distracted, and commit fully at the exact moment.",
    shadow: "Total focus tunnels; you fixate on the target and miss the field around it.",
  },
  {
    slug: "falcon", name: "Falcon", group: "bird",
    deltas: { initiative: 22, intensity: 20, craft: 14, sovereignty: 12, display: 10, order: 8, stillness: -12 },
    tier: "attested", tradition: "Egyptian (Ra/Horus)",
    sources: ["Egyptian — Ra and Horus in falcon form; the fastest striker"], status: "open",
    tagline: "Trained speed, aimed like a weapon.",
    essence: "The Falcon is disciplined, high-velocity precision — the fastest animal alive, and in Egypt the very face of the sun-god. You channel intensity through training rather than chaos, and when you dive, nothing is faster or more exact.",
    shadow: "Speed and discipline can turn merciless; you'll sacrifice the process — and people — to the strike.",
  },
  {
    slug: "vulture", name: "Vulture", group: "bird",
    deltas: { transformation: 22, transcendence: 16, care: 14, intuition: 12, endurance: 12, display: -12, initiative: -8 },
    tier: "attested", tradition: "Egyptian (Nekhbet); Mesoamerican",
    sources: ["Egyptian Nekhbet, protective mother-vulture", "Mesoamerican purification / renewal"], status: "open",
    tagline: "Cleans what died so the living can go on.",
    essence: "The Vulture is renewal through the unwanted work — it transforms death into fresh ground. Egypt made the vulture a protective mother-goddess, not a villain; it purifies. You do the metabolising nobody thanks you for, and you carry a fierce, unsqueamish care.",
    shadow: "Living among endings can leave you circling loss, patient to the point of passivity.",
  },
  {
    slug: "crane", name: "Crane", group: "bird",
    deltas: { transcendence: 20, stillness: 18, order: 14, loyalty: 14, craft: 10, vision: 8, disruption: -10 },
    tier: "attested", tradition: "Chinese & Japanese longevity; Greek",
    sources: ["East Asian crane of longevity and fidelity", "Greek geranos crane-dance"], status: "open",
    tagline: "Poised, patient, mated for life.",
    essence: "The Crane is graceful discipline and long-life devotion. East Asian art pairs it with the pine as an emblem of longevity; its dance and lifelong pair-bond made it a symbol of fidelity. You hold poise under pressure, commit for the long haul, and turn patience into a kind of elegance.",
    shadow: "Poise can become perfectionism; you'd rather stand still and correct than move and err.",
  },
  {
    slug: "heron", name: "Heron", group: "bird",
    deltas: { stillness: 22, intuition: 16, autonomy: 16, analysis: 12, concealment: 10, initiative: -8, magnetism: -6 },
    tier: "widely-shared", tradition: "Egyptian (Bennu-adjacent); widely",
    sources: ["Egyptian benu heron, dawn and renewal", "Widely as the solitary patient fisher"], status: "open",
    tagline: "Stands still until the exact right moment.",
    essence: "The Heron is patience as a discipline — it stands motionless in the shallows and strikes only when certain. The Egyptian benu heron was tied to the first dawn and self-renewal. You wait others out, act with precision once, and are comfortable being alone at the water's edge.",
    shadow: "Waiting for certainty can become waiting forever; stillness slides into standoffish solitude.",
  },
  {
    slug: "swan", name: "Swan", group: "bird",
    deltas: { display: 20, transcendence: 16, loyalty: 16, magnetism: 14, care: 10, transformation: 10, disruption: -10 },
    tier: "attested", tradition: "Greek; Norse; Irish",
    sources: ["Greek — Zeus and Leda", "Irish Children of Lir; Norse fylgja (swan = beauty)"], status: "open",
    tagline: "Serene above, working hard beneath.",
    essence: "The Swan pairs beauty with hidden effort and deep fidelity. Myth gave it transformation (the Children of Lir), divine disguise (Zeus), and, in the Norse fylgja, the shape of beauty itself. You present grace while paddling hard underneath, and you love for life.",
    shadow: "The serene surface can hide exhaustion and resentment you never let anyone see.",
  },
  {
    slug: "goose", name: "Goose", group: "bird",
    deltas: { loyalty: 22, care: 16, expression: 14, endurance: 14, order: 12, initiative: 8, autonomy: -12 },
    tier: "attested", tradition: "Roman (Capitoline geese); Egyptian",
    sources: ["Roman — the geese that saved the Capitol", "Egyptian 'Great Cackler'; Mother Goose folklore"], status: "open",
    tagline: "Loud, loyal, and takes turns leading the V.",
    essence: "The Goose is vocal loyalty and shared endurance. Rome credited watchful geese with saving the Capitol; migrating skeins take turns breaking the wind so the whole flock flies further. You speak up, guard your people, and pull your weight in a group that rotates the lead.",
    shadow: "Vigilance turns to noisy alarm and honking territoriality over small things.",
  },
  {
    slug: "peacock", name: "Peacock", group: "bird",
    deltas: { display: 26, magnetism: 18, transcendence: 12, expression: 12, sovereignty: 10, concealment: -14, stillness: -6 },
    tier: "attested", tradition: "Greek (Hera); Hindu",
    sources: ["Greek — Hera's peacock, the hundred eyes of Argus", "Hindu — mount of Kartikeya; Saraswati"], status: "living-open",
    tagline: "Made to be seen, and unashamed of it.",
    essence: "The Peacock turns visibility into a virtue — radiant, watchful (Hera set Argus's hundred eyes in its tail), and unafraid to be looked at. Your pattern echoes the birds of Hera and Kartikeya. You shine on purpose, draw the eye, and use presence as a real form of power.",
    shadow: "The display can hollow into vanity; when eyes turn away, so does your sense of worth.",
  },
  {
    slug: "rooster", name: "Rooster", group: "bird",
    deltas: { initiative: 20, display: 18, expression: 16, order: 14, sovereignty: 10, concealment: -12, stillness: -10 },
    tier: "attested", tradition: "Chinese zodiac; Greek",
    sources: ["Chinese zodiac — punctual, proud herald of dawn", "Greek — cock sacred to Asclepius"], status: "open",
    tagline: "Announces the day and dares it to arrive.",
    essence: "The Rooster is confidence, punctuality, and public courage — it calls up the sun and stands its ground. The Chinese zodiac honours its pride and reliability; the Greeks tied it to healing and renewal. You show up on time, speak first, and aren't shy about being counted.",
    shadow: "Confidence tips into cockiness and crowing; you can mistake being loudest for being right.",
  },
  {
    slug: "dove", name: "Dove", group: "bird",
    deltas: { care: 24, loyalty: 16, magnetism: 12, transcendence: 12, stillness: 10, intensity: -12, disruption: -12 },
    tier: "attested", tradition: "Greek (Aphrodite); widely",
    sources: ["Greek — Aphrodite's dove", "Near-universal peace/spirit symbol"], status: "open",
    tagline: "Chooses tenderness as a real strategy.",
    essence: "The Dove is gentleness, devotion, and peace-making. Sacred to Aphrodite and a near-universal emblem of love and truce, it carries reconciliation. You soften conflict, bond deeply, and treat kindness not as weakness but as the way through.",
    shadow: "Peace at any price avoids the necessary fight; gentleness can enable what it should confront.",
  },
  {
    slug: "hummingbird", name: "Hummingbird", group: "bird",
    deltas: { intensity: 22, initiative: 18, embodiment: 14, magnetism: 12, adaptability: 12, endurance: -10, stillness: -12 },
    tier: "attested", tradition: "Aztec (Huitzilopochtli)",
    sources: ["Aztec — Huitzilopochtli, 'hummingbird of the south'; fallen warriors return as hummingbirds"], status: "open",
    tagline: "A warrior-soul, not a greeting card.",
    essence: "The Hummingbird is fierce vitality in a tiny frame. The pop reading of 'joy, live in the moment' inverts the source: to the Aztecs it was Huitzilopochtli's bird, and fallen warriors returned as hummingbirds — a warrior-soul. You burn hot and bright, defend your patch ferociously, and pack astonishing energy into a small space.",
    shadow: "That metabolism can't idle; you burn out, and stillness feels like dying.",
  },
  {
    slug: "magpie", name: "Magpie", group: "bird",
    deltas: { analysis: 18, craft: 16, expression: 14, adaptability: 14, display: 12, memory: 10, order: -8 },
    tier: "attested", tradition: "Chinese joy; European folklore",
    sources: ["Chinese xǐquè — 'magpie of joy'; the Qixi bridge of magpies", "European counting-rhyme folklore"], status: "open",
    tagline: "Collects the bright, the useful, the overheard.",
    essence: "The Magpie is curious, acquisitive intelligence. In China it's the bird of joy and the bridge that reunites lovers at Qixi; in Europe it stars in the counting rhyme. You gather ideas, objects, and stories magpie-fashion, and you're the one who connects two people who needed to meet.",
    shadow: "Acquisitiveness scatters you; you collect shiny beginnings and finish few of them.",
  },
  {
    slug: "blackbird", name: "Blackbird", group: "bird",
    deltas: { expression: 22, memory: 16, transcendence: 12, intuition: 12, stillness: 10, craft: 8, display: -6 },
    tier: "attested", tradition: "Welsh (Oldest Animals); Celtic",
    sources: ["Welsh — Blackbird of Cilgwri, first of the Oldest Animals", "Celtic — song as gateway to the otherworld"], status: "open",
    tagline: "The first, oldest voice at the gate.",
    essence: "The Blackbird is song, memory, and quiet threshold-keeping. Among the Welsh Oldest Animals the Blackbird of Cilgwri is the first consulted, and Celtic lore made its song a doorway between worlds. You carry a voice that reaches people, a long memory, and an ear for the space between things.",
    shadow: "Living at the threshold, you can sing about the deep water rather than cross it.",
  },
  {
    slug: "wren", name: "Wren", group: "bird",
    deltas: { initiative: 16, expression: 14, autonomy: 14, adaptability: 12, craft: 10, display: -6, sovereignty: 8 },
    tier: "attested", tradition: "Celtic ('king of birds'); European",
    sources: ["European fable — the wren wins kingship by cunning height", "Celtic wren lore"], status: "open",
    tagline: "Smallest bird, and still the crowned king.",
    essence: "The Wren is outsized presence from a tiny frame. In the fable it becomes king of the birds by hiding on the eagle's back and flying one beat higher — wit beating size. You punch far above your weight, make yourself heard, and win by cleverness where scale is against you.",
    shadow: "Proving yourself against bigger players can become a chip on the shoulder that never rests.",
  },
  {
    slug: "kingfisher", name: "Kingfisher", group: "bird",
    deltas: { stillness: 16, initiative: 16, craft: 14, care: 12, adaptability: 10, display: 10, intensity: 8 },
    tier: "attested", tradition: "Greek (Halcyon)",
    sources: ["Greek — Alcyone, the halcyon; the calm 'halcyon days' at her nesting"], status: "open",
    tagline: "Calm on the surface, sudden in the dive.",
    essence: "The Kingfisher is bright patience that ends in a flash. The Greek myth of Alcyone gave us the 'halcyon days' — a stretch of calm the gods grant for her floating nest. You bring calm to turbulent water, watch quietly, and then move with sudden brilliant precision.",
    shadow: "The calm can be a held breath; you keep the peace by never showing the strain.",
  },
  {
    slug: "nightingale", name: "Nightingale", group: "bird",
    deltas: { expression: 24, transcendence: 16, intensity: 12, care: 12, transformation: 10, concealment: 8, display: -8 },
    tier: "attested", tradition: "Greek (Philomela); literary",
    sources: ["Greek — Philomela, who turns grief into song", "Literary — Keats, 'Ode to a Nightingale'"], status: "open",
    tagline: "Sings most beautifully in the dark.",
    essence: "The Nightingale turns pain into beauty. The myth of Philomela makes its song the voice of grief transformed; the Romantics heard immortality in it. You feel deeply, sing in the dark hours, and give others language for what hurts.",
    shadow: "Beauty from pain can become attachment to the pain; you may hide your voice by daylight.",
  },

  // ————————————————————————— Reptiles / aquatic (14) —————————————————————————
  {
    slug: "snake", name: "Snake", group: "reptile",
    deltas: { transformation: 26, intuition: 16, shadow: 14, transcendence: 12, embodiment: 10, adaptability: 10, display: -10 },
    tier: "widely-shared", tradition: "Near-universal (Greek Asclepius; Egyptian)",
    sources: ["Greek — Asclepius's healing serpent", "Egyptian uraeus; near-universal renewal via the shed skin"], status: "open",
    tagline: "Sheds the old skin and keeps living.",
    essence: "The Snake is transformation itself — it renews by shedding, and its venom both kills and heals. Asclepius's staff still marks medicine; the shed skin is the world's oldest rebirth symbol. You cycle through versions of yourself, sense danger early, and carry a power that cuts either way.",
    shadow: "Constant reinvention can leave nothing continuous; the same power that heals can poison.",
  },
  {
    slug: "tortoise", name: "Tortoise", group: "reptile",
    deltas: { endurance: 26, stillness: 20, order: 14, memory: 12, sovereignty: 10, embodiment: 10, initiative: -12, disruption: -10 },
    tier: "attested", tradition: "Chinese (Black Tortoise); Hindu (Kurma)",
    sources: ["Chinese Four Symbols — the Black Tortoise of the North", "Hindu Kurma; Aesop's tortoise"], status: "open",
    tagline: "Slow, ancient, carries its home along.",
    essence: "The Tortoise is patience, longevity, and self-contained stability. One of the Chinese Four Symbols and the world-bearer in many cosmologies, it wins by lasting. You move deliberately, carry your own shelter, and outlast every faster rival that burned out early.",
    shadow: "Self-containment becomes a shell you won't leave; caution outlasts the moment to act.",
  },
  {
    slug: "crocodile", name: "Crocodile", group: "reptile",
    deltas: { stillness: 20, intensity: 20, sovereignty: 14, embodiment: 12, shadow: 12, concealment: 12, care: -10, display: -8 },
    tier: "attested", tradition: "Egyptian (Sobek)",
    sources: ["Egyptian — Sobek, the crocodile of the Nile, power and fertility"], status: "open",
    tagline: "Perfect patience, absolute strike.",
    essence: "The Crocodile is ancient, waiting power. Sobek embodied the Nile's dangerous fertility — strength that is worshipped precisely because it is not safe. You wait with total stillness, hold formidable force in reserve, and act with a suddenness that ends the matter.",
    shadow: "That much held force can turn cold and territorial; patience becomes ambush.",
  },
  {
    slug: "frog", name: "Frog", group: "reptile",
    deltas: { transformation: 24, care: 14, adaptability: 14, expression: 12, intuition: 10, embodiment: 10, order: -8 },
    tier: "attested", tradition: "Egyptian (Heket)",
    sources: ["Egyptian — Heket, frog-goddess of birth and renewal", "Widely as rain/fertility herald"], status: "open",
    tagline: "Lives the whole metamorphosis, out loud.",
    essence: "The Frog is transformation and fertile renewal — its life cycle is a visible metamorphosis, and its chorus calls the rain. Egypt made the frog-goddess Heket a midwife of creation. You move between elements, herald new seasons, and grow through complete changes of form.",
    shadow: "Perpetual becoming can dodge commitment; you announce change more than you inhabit it.",
  },
  {
    slug: "lizard", name: "Lizard", group: "reptile",
    deltas: { adaptability: 22, stillness: 14, intuition: 14, autonomy: 12, transformation: 12, embodiment: 10, loyalty: -8 },
    tier: "widely-shared", tradition: "Widely (regeneration folklore)",
    sources: ["Recurrent regeneration/dreaming folklore (the shed tail that regrows)"], status: "open",
    tagline: "Drops what's caught and grows it back.",
    essence: "The Lizard is survival by letting go — it sheds a trapped tail and regenerates. Sun-warmed and still, it belongs to the liminal daydream state between waking and sleep. You cut losses cleanly, regrow what you release, and read a situation before you commit heat to it.",
    shadow: "Detaching to survive becomes a habit of dropping things — and people — the moment they hold you.",
  },
  {
    slug: "chameleon", name: "Chameleon", group: "reptile",
    deltas: { adaptability: 28, concealment: 18, analysis: 12, intuition: 12, autonomy: 8, craft: 8, display: -10 },
    tier: "widely-shared", tradition: "African folklore; widely",
    sources: ["Recurrent African creation/messenger tales", "Near-universal symbol of change and patience"], status: "open",
    tagline: "Becomes the room, then reads it.",
    essence: "The Chameleon is adaptive perception — it changes with its surroundings and moves one careful step at a time, each eye tracking separately. Many African tales cast it as the deliberate messenger. You blend into any context, sense the mood precisely, and shift yourself to fit what a moment needs.",
    shadow: "Endless adaptation can erase you; you match the room so well you forget your own colour.",
  },
  {
    slug: "salmon", name: "Salmon", group: "reptile",
    deltas: { endurance: 22, vision: 18, memory: 16, initiative: 14, transcendence: 12, adaptability: 10, stillness: -10 },
    tier: "attested", tradition: "Irish; Welsh",
    sources: ["Irish — the Salmon of Knowledge (Fionn mac Cumhaill)", "Welsh — Salmon of Llyn Llyw, oldest of the Oldest Animals"], status: "open",
    tagline: "Swims the whole river home for the wisdom.",
    essence: "The Salmon is hard-won wisdom and the drive to return. Irish myth makes it the Salmon of Knowledge; the Welsh make it the oldest and wisest of the Oldest Animals. You swim upstream against real resistance toward a source that matters, and you carry deep memory and purpose.",
    shadow: "The upstream drive can become one relentless goal that costs you everything else on the way.",
  },
  {
    slug: "octopus", name: "Octopus", group: "reptile",
    deltas: { analysis: 22, adaptability: 24, craft: 16, intuition: 12, autonomy: 12, concealment: 10, order: -10 },
    tier: "modern-popular", tradition: "21st-century (labelled honestly)",
    sources: ["Modern — cephalopod science; My Octopus Teacher. No traditional attestation."], status: "open",
    tagline: "Solves it eight ways, in disguise.",
    essence: "The Octopus is distributed, improvisational intelligence — arms that think semi-independently, camouflage on demand, an escape artist's problem-solving. Honestly, this reading is 21st-century: no old tradition attests it, and we say so. You think laterally, reshape yourself to the problem, and slip constraints that trap other people.",
    shadow: "So many options at once can mean no centre; you camouflage so thoroughly no one finds the real you.",
  },
  {
    slug: "crab", name: "Crab", group: "reptile",
    deltas: { concealment: 18, care: 16, endurance: 14, order: 12, autonomy: 12, adaptability: 10, display: -10 },
    tier: "attested", tradition: "Greek (Karkinos / Cancer)",
    sources: ["Greek — Karkinos, placed in the sky as Cancer", "Widely as the armoured, sidelong survivor"], status: "open",
    tagline: "Soft inside, armoured out, moves oblique.",
    essence: "The Crab guards a tender interior behind a hard shell and approaches things sideways. The Greek Karkinos earned its place in the zodiac; the crab is the classic protective, home-bound survivor. You shelter what's soft, defend your ground, and reach your aims by indirect routes.",
    shadow: "The armour can seal you in; sideways approach becomes an inability to face things head-on.",
  },
  {
    slug: "shark", name: "Shark", group: "reptile",
    deltas: { initiative: 22, intensity: 20, endurance: 16, autonomy: 14, embodiment: 12, stillness: -12, care: -10 },
    tier: "modern-popular", tradition: "Modern; Pacific (general)",
    sources: ["Modern apex-predator symbol; broad Pacific sea-power lore (not aumakua)"], status: "open",
    tagline: "Keeps moving or it doesn't survive.",
    essence: "The Shark is relentless forward drive — many species must keep swimming to breathe, and it reads the faintest signal in the water. A perfected, ancient predator, it means momentum and instinct. You move constantly toward goals, sense opportunity before others, and don't stall.",
    shadow: "Momentum without rest becomes ruthlessness; you can treat everything as prey or obstacle.",
  },
  {
    slug: "dolphin", name: "Dolphin", group: "reptile",
    deltas: { expression: 20, magnetism: 18, intuition: 16, care: 14, adaptability: 12, transcendence: 10, concealment: -10 },
    tier: "attested", tradition: "Greek (Apollo, Dionysus)",
    sources: ["Greek — dolphins of Apollo (Delphi) and Dionysus; rescuer of Arion"], status: "open",
    tagline: "Brilliant, playful, brings people to shore.",
    essence: "The Dolphin is social intelligence with a rescuer's heart. Greek myth has dolphins guide ships, found Delphi, and save the poet Arion. You connect people, communicate with unusual subtlety, and lace real depth with genuine play.",
    shadow: "Reading everyone's needs, you can perform ease while quietly running on empty.",
  },
  {
    slug: "seal", name: "Seal", group: "reptile",
    deltas: { intuition: 18, adaptability: 16, care: 14, transformation: 14, expression: 10, magnetism: 10, sovereignty: -8 },
    tier: "attested", tradition: "Scottish/Irish (selkie); Norse",
    sources: ["Celtic selkie — the seal who sheds its skin to walk as human"], status: "open",
    tagline: "Two worlds, one skin it can shed.",
    essence: "The Seal lives between elements and between selves. The selkie sheds its skin to walk on land, torn between sea-home and human love — a story of longing and belonging in two places. You move fluidly between worlds and roles, feel deeply, and carry a quiet ache for a home that's never only one place.",
    shadow: "Belonging everywhere and nowhere, you can give your skin away and lose the way back to yourself.",
  },
  {
    slug: "eel", name: "Eel", group: "reptile",
    deltas: { concealment: 20, adaptability: 20, endurance: 16, transformation: 14, autonomy: 12, intuition: 10, display: -12 },
    tier: "widely-shared", tradition: "Widely (Japanese, Greek, Pacific)",
    sources: ["Recurrent mystery-of-origin lore — the eel's breeding was unknown for millennia"], status: "open",
    tagline: "Travels unseen, arrives against the current.",
    essence: "The Eel is hidden endurance and mysterious range. For millennia no one knew where eels bred; they cross oceans and climb wet rock, appearing where no one expects. You persist through unlikely routes, keep your workings private, and turn up transformed after a long unseen journey.",
    shadow: "So much concealment breeds slipperiness; people can't get a grip on where you actually stand.",
  },
  {
    slug: "koi", name: "Koi", group: "reptile",
    deltas: { endurance: 22, initiative: 16, transformation: 16, transcendence: 14, order: 12, craft: 8, stillness: -8 },
    tier: "attested", tradition: "Chinese (Dragon Gate)",
    sources: ["Chinese — the carp that leaps the Dragon Gate and becomes a dragon"], status: "open",
    tagline: "Swims up the waterfall to become more.",
    essence: "The Koi is aspiration through perseverance. The Chinese legend has the carp that swims up the falls and leaps the Dragon Gate transform into a dragon — effort rewarded with transcendence. You climb against the current toward a higher form of yourself and treat the hard ascent as the whole point.",
    shadow: "The climb can become the only story; you defer arriving, always one more waterfall to clear.",
  },

  // ————————————————————————— Insects / arthropods (10) —————————————————————————
  {
    slug: "spider", name: "Spider", group: "insect",
    deltas: { craft: 24, order: 16, analysis: 14, autonomy: 12, vision: 10, transformation: 8, display: -8 },
    tier: "widely-shared", tradition: "Greek (Arachne); recurs widely",
    sources: ["Greek — Arachne, the weaver turned spider", "Recurs across unrelated cultures as maker/fate-weaver"], status: "open",
    tagline: "Builds the whole world it lives in.",
    essence: "The Spider is the maker and pattern-weaver — it builds an intricate structure and waits at its centre, feeling every thread. The Greek Arachne was the weaver whose skill rivalled a goddess. You design systems, sense the whole web from any point, and create the environment others move through.",
    shadow: "The web can become a trap you set for others — or the one you're stuck at the centre of.",
  },
  {
    slug: "bee", name: "Bee", group: "insect",
    deltas: { order: 22, craft: 18, loyalty: 16, endurance: 14, care: 12, autonomy: -14, concealment: -6 },
    tier: "attested", tradition: "Egyptian; Greek",
    sources: ["Egyptian — the royal bee of Lower Egypt; born from the tears of Ra", "Greek Melissae, bee-priestesses"], status: "open",
    tagline: "The hive is the self; the work is sacred.",
    essence: "The Bee is industrious devotion to the collective. Egypt made the bee a royal emblem born of the sun-god's tears; Greek priestesses were called Melissae. You work tirelessly toward a shared good, build sweetness and structure together, and find meaning in belonging to something larger.",
    shadow: "Devotion to the hive can erase the self; you'll work yourself out before you'll break ranks.",
  },
  {
    slug: "butterfly", name: "Butterfly", group: "insect",
    deltas: { transformation: 26, transcendence: 18, expression: 12, adaptability: 12, display: 10, intuition: 8, endurance: -12 },
    tier: "widely-shared", tradition: "Greek (psyche = soul); widely",
    sources: ["Greek — psychē, meaning both 'butterfly' and 'soul'", "Near-universal metamorphosis/rebirth symbol"], status: "open",
    tagline: "Dies as one thing to live as another.",
    essence: "The Butterfly is metamorphosis and the soul. The Greek word psyche meant both butterfly and soul; the caterpillar's dissolution into wings is the world's clearest image of transformation. You change completely rather than incrementally, carry a light spiritual quality, and emerge from hard chrysalis phases remade.",
    shadow: "The next transformation can be an escape from the present; beauty can be brief and hard to sustain.",
  },
  {
    slug: "moth", name: "Moth", group: "insect",
    deltas: { transformation: 20, intuition: 18, transcendence: 14, intensity: 14, shadow: 12, concealment: 10, display: -12 },
    tier: "modern-popular", tradition: "Modern/folkloric (labelled)",
    sources: ["Folkloric — drawn to flame; death's-head omen. Largely modern symbolic reading."], status: "open",
    tagline: "Flies toward the light that could end it.",
    essence: "The Moth is devotion to the unreachable light — nocturnal, transformative, and pulled toward what burns. Folklore ties it to omen and the flame; honestly, much of its 'meaning' is modern symbolic reading, which we flag. You're drawn to intensity and the numinous, change in the dark, and feel most alive near the edge.",
    shadow: "The pull toward the flame is literal risk; you can burn on the thing you can't stop approaching.",
  },
  {
    slug: "ant", name: "Ant", group: "insect",
    deltas: { order: 24, endurance: 22, craft: 14, loyalty: 14, initiative: 10, autonomy: -16, display: -8 },
    tier: "attested", tradition: "Greek (Myrmidons); Aesop",
    sources: ["Greek — the Myrmidons, people made from ants", "Aesop — the ant and the grasshopper"], status: "open",
    tagline: "Small effort, endlessly repeated, moves mountains.",
    essence: "The Ant is disciplined, cooperative industry. The Myrmidons were an entire people made from ants; Aesop made the ant the emblem of provident labour. You prepare, coordinate, and carry many times your own weight — and a colony of small steadfast efforts is unstoppable.",
    shadow: "Total dedication to the task and the colony can leave no room for your own life or rest.",
  },
  {
    slug: "scarab", name: "Scarab", group: "insect",
    deltas: { transformation: 22, order: 16, endurance: 16, transcendence: 16, craft: 12, initiative: 10, display: -8 },
    tier: "attested", tradition: "Egyptian (Khepri)",
    sources: ["Egyptian — Khepri, the scarab that rolls the sun into each new dawn"], status: "open",
    tagline: "Rolls the sun up out of the dark, daily.",
    essence: "The Scarab is self-renewal and the daily remaking of the world. Egypt saw the dung-beetle rolling its ball and read the sun reborn each morning — Khepri, 'he who comes into being.' You regenerate through effort, turn base material into new life, and trust that the light comes back if you keep rolling.",
    shadow: "The daily renewal can become grinding repetition; you rebuild endlessly and rarely rest in the result.",
  },
  {
    slug: "dragonfly", name: "Dragonfly", group: "insect",
    deltas: { adaptability: 20, initiative: 16, transformation: 14, vision: 14, expression: 10, intensity: 10, stillness: -8 },
    tier: "attested", tradition: "Japanese (Akitsushima)",
    sources: ["Japanese — the dragonfly isles; samurai emblem of victory (never retreats)"], status: "open",
    tagline: "Darts, hovers, turns on a pinpoint.",
    essence: "The Dragonfly is agile maturity and clear sight. Japan called itself the Dragonfly Islands and made it a samurai emblem because it only flies forward; it also lives most of its life underwater before emerging to fly. You maneuver with sudden precision, arrive at your winged form after a long submerged stage, and see with almost 360-degree eyes.",
    shadow: "Constant darting can look like flightiness; the long underwater years can make emerging feel overdue.",
  },
  {
    slug: "scorpion", name: "Scorpion", group: "insect",
    deltas: { intensity: 22, autonomy: 18, concealment: 16, shadow: 16, sovereignty: 12, care: -10, display: -10 },
    tier: "attested", tradition: "Greek (Scorpius); Egyptian (Serket)",
    sources: ["Greek — the scorpion that felled Orion, set in the sky", "Egyptian — Serket, protective scorpion-goddess"], status: "open",
    tagline: "Defends the line, and means it.",
    essence: "The Scorpion is self-protective intensity and hard boundaries. It killed Orion and became a constellation; Serket used the same sting to guard the dead. You keep a formidable defence, hold your ground without apology, and carry a sting you'd rather not use but absolutely will.",
    shadow: "A defence held that tightly can wound pre-emptively; you strike at closeness you read as threat.",
  },
  {
    slug: "cicada", name: "Cicada", group: "insect",
    deltas: { stillness: 18, endurance: 20, transcendence: 16, expression: 14, memory: 12, transformation: 12, initiative: -8 },
    tier: "attested", tradition: "Greek; Chinese",
    sources: ["Greek — Tithonus; Plato's Phaedrus (cicadas as singers/muses)", "Chinese jade cicada, rebirth and immortality"], status: "open",
    tagline: "Years underground for one loud summer.",
    essence: "The Cicada is long dormancy rewarded with sudden voice. It waits years underground, then emerges to sing; China buried jade cicadas with the dead for rebirth, and Plato made them muses' messengers. You incubate quietly for a long time, then arrive loud and unmistakable, carrying themes of patience and return.",
    shadow: "The long silence can become hiding; you may wait for the 'right' emergence until the season passes.",
  },
  {
    slug: "mantis", name: "Mantis", group: "insect",
    deltas: { stillness: 22, intuition: 16, analysis: 14, intensity: 14, concealment: 12, craft: 10, initiative: -8 },
    tier: "attested", tradition: "Greek (mantis = 'prophet')",
    sources: ["Greek — the name mantis means seer/prophet, from its praying stance"], status: "open",
    tagline: "Perfect stillness that ends in a snap.",
    essence: "The Mantis is meditative patience over lethal precision. The Greeks named it 'the prophet' for its praying posture; it holds utterly still and strikes faster than the eye. You wait with composure, watch with an almost prophetic focus, and act decisively at the exact instant.",
    shadow: "That composed patience can turn predatory and cold; stillness becomes calculation.",
  },

  // ————————————————————————— Composite / mythic (6) —————————————————————————
  {
    slug: "dragon", name: "Dragon (Eastern)", group: "mythic",
    deltas: { sovereignty: 22, transcendence: 20, vision: 16, transformation: 14, magnetism: 12, embodiment: -8, order: 8 },
    tier: "attested", tradition: "Chinese (celestial dragon)",
    sources: ["Chinese — the lóng, benevolent bringer of rain, water, and imperial power"], status: "open",
    tagline: "Auspicious power that rides the weather.",
    essence: "The Eastern Dragon is benevolent, cosmic authority — nothing like the Western monster. It commands rain and rivers, symbolises the emperor, and blesses rather than hoards. A literary and heraldic guide, it occupies trait regions no living animal reaches. You carry visionary sovereignty and a sense that your influence moves with larger forces.",
    shadow: "Cosmic scale can float above ordinary life; power that expects to be revered resents the mundane.",
  },
  {
    slug: "phoenix", name: "Phoenix", group: "mythic",
    deltas: { transformation: 28, transcendence: 22, endurance: 16, vision: 14, display: 12, initiative: 10, shadow: -8 },
    tier: "attested", tradition: "Egyptian (Bennu); Greek",
    sources: ["Egyptian benu heron of renewal", "Greek/Roman phoinix — reborn from its own ashes"], status: "open",
    tagline: "Burns down to nothing, rises anyway.",
    essence: "The Phoenix is death and rebirth as a single motion — it is consumed by fire and rises renewed from the ash. Rooted in the Egyptian benu and the Greek phoinix, it's a literary emblem, included because no living animal holds this much transformation and transcendence at once. You survive your own endings and come back changed and brighter.",
    shadow: "A self-image built on rising from ashes can invite the fire; you may burn things down to feel reborn.",
  },
  {
    slug: "griffin", name: "Griffin", group: "mythic",
    deltas: { sovereignty: 22, loyalty: 18, vision: 16, initiative: 14, order: 14, autonomy: 8, adaptability: -8 },
    tier: "attested", tradition: "Greek/Persian; medieval heraldry",
    sources: ["Greek/Persian — guardian of gold", "Medieval heraldry — eagle-lion, valour and vigilance"], status: "open",
    tagline: "Eagle's sight, lion's heart, one guardian.",
    essence: "The Griffin fuses the eagle's vision with the lion's courage into a single guardian of treasure. Heraldry loved it as the union of sky-sovereign and earth-sovereign — vigilance plus valour. A composite emblem, it holds a blend of traits no one animal does. You protect what's precious with both far sight and front-line nerve, and your loyalty, once given, is absolute.",
    shadow: "Guardianship can become possessive vigilance; you hoard and defend what you were only meant to watch.",
  },
  {
    slug: "sphinx", name: "Sphinx", group: "mythic",
    deltas: { analysis: 22, concealment: 20, sovereignty: 16, vision: 14, memory: 12, transcendence: 10, display: -8 },
    tier: "attested", tradition: "Greek; Egyptian",
    sources: ["Greek — the riddling Sphinx of Thebes", "Egyptian — the guardian sphinx of thresholds"], status: "open",
    tagline: "Guards the gate; charges a riddle to pass.",
    essence: "The Sphinx is the keeper of thresholds and hard questions. Egypt set it to guard sacred ground; Greece made it pose the riddle you had to solve or die. A composite guide for those who hold knowledge others must earn. You keep counsel, test people before you admit them, and sit at the border of what's known.",
    shadow: "Riddling guardianship can become withholding for power's sake; you make people pass tests to reach you.",
  },
  {
    slug: "unicorn", name: "Unicorn", group: "mythic",
    deltas: { transcendence: 24, autonomy: 20, care: 14, craft: 10, concealment: 12, sovereignty: 10, intensity: -8 },
    tier: "attested", tradition: "Greek/literary; medieval bestiary",
    sources: ["Greek — Ctesias's account", "Medieval bestiary — purity, the horn that heals poison; only tamed by the gentle"], status: "open",
    tagline: "Untameable, except by the truly gentle.",
    essence: "The Unicorn is fierce purity and rare, uncompromising integrity. The bestiaries said its horn neutralised poison and that it could be approached only by the genuinely gentle — power that answers solely to sincerity. A literary guide for the singular and idealistic. You hold a rare standard, resist being caught or used, and heal what's tainted.",
    shadow: "Uncompromising purity can become isolation and disillusion when the world falls short — as it will.",
  },
  {
    slug: "makara", name: "Makara", group: "mythic",
    deltas: { intuition: 18, transformation: 18, sovereignty: 14, adaptability: 14, embodiment: 12, intensity: 10, order: -8 },
    tier: "attested", tradition: "Hindu",
    sources: ["Hindu — mount of Ganga and Varuna; source of the Capricorn/Makara sign"], status: "living-open",
    tagline: "Guardian of the threshold where waters meet.",
    essence: "The Makara is a composite water-guardian — part crocodile, part fish or elephant — that carries the river-goddess Ganga and marks temple thresholds. Your pattern echoes the Makara's: it guards the passage between elements and stands behind the Capricorn sign. You hold boundaries at points of change and blend forces that don't usually combine.",
    shadow: "Guarding the threshold, you can become the obstacle at it — resisting the very crossings you keep.",
  },
];

/** Compose a full 24-trait vector from an animal's deltas. */
function composeVec(deltas: TraitDeltas): TraitVec {
  const v = {} as TraitVec;
  for (const t of TRAIT_ORDER) v[t] = clamp(50 + (deltas[t] ?? 0));
  return v;
}

function topTraits(deltas: TraitDeltas, n = 3): TraitId[] {
  return TRAIT_ORDER
    .filter((t) => (deltas[t] ?? 0) > 0)
    .sort((a, b) => (deltas[b] ?? 0) - (deltas[a] ?? 0))
    .slice(0, n);
}

export const ANIMAL_GUIDES: AnimalGuide[] = DEFS.map((d) => ({
  id: `animal.${d.slug}`,
  name: d.name,
  group: d.group,
  traits: composeVec(d.deltas),
  tier: d.tier,
  tradition: d.tradition,
  sources: d.sources,
  status: d.status,
  tagline: d.tagline,
  essence: d.essence,
  shadow: d.shadow,
  signature: topTraits(d.deltas),
}));

export const ANIMAL_BY_ID: Record<string, AnimalGuide> = Object.fromEntries(
  ANIMAL_GUIDES.map((a) => [a.id, a]),
);

export interface AnimalMatch {
  guide: AnimalGuide;
  score: number;          // 0–100 match strength
  alt: AnimalGuide | null; // runner-up, for "also close" copy
}

/**
 * Match a user's trait vector to their Animal Guide. Library-agnostic engine —
 * same decorrelated cosine the archetypes use. (No per-entry calibration yet;
 * the 72 are hand-tuned to spread the space. Balancing offsets can be added the
 * same way the archetypes' were if a cohort check shows concentration.)
 */
export function computeAnimalGuide(userTraits: TraitVec): AnimalMatch | null {
  const ranked = rankLibrary(userTraits, ANIMAL_GUIDES, animalOffset);
  if (ranked.length === 0) return null;
  const top = ANIMAL_BY_ID[ranked[0].id];
  const alt = ranked[1] ? ANIMAL_BY_ID[ranked[1].id] : null;
  return { guide: top, score: Math.round(ranked[0].s * 100), alt };
}

export const TIER_LABEL: Record<ProvenanceTier, string> = {
  attested: "Attested",
  "widely-shared": "Widely shared",
  "modern-popular": "Modern",
};
