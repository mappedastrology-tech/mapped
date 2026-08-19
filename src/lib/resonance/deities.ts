/**
 * Gods & Goddesses — 108 entries (spec §5.2). Same library-agnostic engine as
 * the archetypes and animal guides: a deity is a trait vector matched by the
 * decorrelated cosine, plus content + provenance.
 *
 * Provenance is the anti-appropriation move (§5.2.2). Two tiers control the
 * language:
 *   open         — historical pantheons with no substantial living practice
 *                  (Greek, Roman, Norse, Egyptian, Mesopotamian, Celtic, Slavic,
 *                  Baltic, Finnish, Canaanite, historical Aztec/Maya/Polynesian).
 *                  Direct/possessive phrasing is allowed ("Your pattern is
 *                  Hekate's.").
 *   living-open  — living faiths, publicly documented (Hindu, Shinto, Buddhist,
 *                  Daoist). Comparative phrasing ONLY, never "you are" ("Your
 *                  pattern echoes Saraswati's.").
 *
 * Cultural gate (§5.2.3): nothing here is drawn from a closed or vulnerable
 * tradition — no Yorùbá/Ifá Òrìṣà, Vodou Lwa, Indigenous North American,
 * Aboriginal Australian, or Siberian figures, no living Maya day-signs, and no
 * Abrahamic divine figures of any kind.
 */

import { TraitDeltas, TraitVec, TraitId, TRAIT_ORDER } from "./traits";
import { rankLibrary } from "./engine";
import { deityOffset } from "./calibration";

export type DeityTier = "open" | "living-open";
export type DeityGender = "goddess" | "god" | "other";
export type DeityTone = "bright" | "dark";

interface DeityDef {
  slug: string;
  name: string;
  pantheon: string;
  deltas: TraitDeltas;      // salient emphases around the 50 baseline
  tier: DeityTier;
  gender: DeityGender;
  tone: DeityTone;
  sources: string[];        // 1–2 short honest attributions
  tagline: string;          // ≤ 12 words
  essence: string;
  shadow: string;           // REQUIRED — the real failure mode
}

export interface DeityGuide {
  id: string;
  name: string;
  pantheon: string;
  traits: TraitVec;
  tier: DeityTier;
  gender: DeityGender;
  tone: DeityTone;
  sources: string[];
  tagline: string;
  essence: string;
  shadow: string;
  signature: TraitId[];     // top emphasised traits
}

const clamp = (n: number) => Math.max(2, Math.min(98, Math.round(n)));

/** Author-supplied deltas (§5.2). Composed around the 50 baseline. */
const DEFS: DeityDef[] = [
  // ————————————————————————————————— Greek (14) —————————————————————————————————
  {
    slug: "zeus", name: "Zeus", pantheon: "Greek",
    deltas: { sovereignty: 26, initiative: 16, magnetism: 16, order: 14, display: 12, intensity: 10 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Homer, Iliad", "Hesiod, Theogony"],
    tagline: "Holds the throne and keeps the wider order.",
    essence: "Your pattern is Zeus's — the sky-father who wins the throne and then keeps the whole order balanced. He rules by weight of presence and the threat of the thunderbolt, arbitrating gods and men alike. You gather authority naturally and expect the room to arrange itself around your decisions.",
    shadow: "The appetite for rule and conquest outruns the responsibility, and the throne excuses every trespass.",
  },
  {
    slug: "hera", name: "Hera", pantheon: "Greek",
    deltas: { sovereignty: 20, loyalty: 22, order: 14, intensity: 16, magnetism: 12, autonomy: 8 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Homer, Iliad", "Hesiod, Theogony"],
    tagline: "Guards the vow, and never forgets a betrayal.",
    essence: "Your pattern is Hera's — queen of the gods and keeper of marriage and sworn bond. She holds the dignity of the covenant absolutely, and her wrath at betrayal is legendary and long. You defend commitment fiercely and hold your station with unbending pride.",
    shadow: "Loyalty curdles into jealousy and vendetta; the wound is never allowed to close.",
  },
  {
    slug: "athena", name: "Athena", pantheon: "Greek",
    deltas: { analysis: 24, craft: 18, order: 16, vision: 14, sovereignty: 12, intensity: 8 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Homer, Odyssey", "Athenian cult of Athena Polias"],
    tagline: "Wins by strategy, not by rage.",
    essence: "Your pattern is Athena's — the goddess of wisdom, strategy, and skilled craft, born fully armed from the head of Zeus. She wins wars by counsel and cunning rather than fury, and she patrons the weaver as much as the general. You solve by clear thought and disciplined skill, and you keep your head where others lose theirs.",
    shadow: "Cool strategy can chill into detachment; being always right leaves little room for others' mess.",
  },
  {
    slug: "apollo", name: "Apollo", pantheon: "Greek",
    deltas: { expression: 20, craft: 16, vision: 18, display: 14, order: 12, transcendence: 10 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Homeric Hymns", "Oracle of Delphi"],
    tagline: "Light, music, and prophecy in one bright line.",
    essence: "Your pattern is Apollo's — god of light, music, healing, and prophecy, the very image of harmony and form. He speaks through the Delphic oracle and sets the measure of song and reason. You reach for clarity and beauty, and you make truth audible.",
    shadow: "The pursuit of perfection turns pitiless; his myths are full of loves and rivals destroyed for falling short.",
  },
  {
    slug: "artemis", name: "Artemis", pantheon: "Greek",
    deltas: { autonomy: 24, sovereignty: 16, intensity: 14, embodiment: 12, concealment: 12, care: 10 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Homeric Hymn to Artemis", "Callimachus, Hymn to Artemis"],
    tagline: "Belongs to the wild and to no one.",
    essence: "Your pattern is Artemis's — virgin huntress of the wild places, protector of the young and of untamed things. She keeps her own company, guards her independence absolutely, and answers a broken boundary with a swift arrow. You are self-contained and at home away from the crowd, fierce in defence of what is yours to protect.",
    shadow: "The guarded independence can become unforgiving; Actaeon died for a single accidental glimpse.",
  },
  {
    slug: "aphrodite", name: "Aphrodite", pantheon: "Greek",
    deltas: { magnetism: 26, display: 16, care: 14, embodiment: 16, expression: 12, transformation: 8 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Hesiod, Theogony", "Homeric Hymn to Aphrodite"],
    tagline: "Desire as a force that moves the world.",
    essence: "Your pattern is Aphrodite's — goddess of love, beauty, and desire, born from the sea-foam. She draws gods and mortals together and treats attraction as a genuine cosmic power. You pull people in, live through the senses, and understand that longing itself reshapes lives.",
    shadow: "Desire without discipline sows chaos; her favours and jealousies started the Trojan War.",
  },
  {
    slug: "ares", name: "Ares", pantheon: "Greek",
    deltas: { intensity: 26, initiative: 20, disruption: 16, embodiment: 14, endurance: 8 },
    tier: "open", gender: "god", tone: "dark",
    sources: ["Homer, Iliad", "Greek cult of Ares"],
    tagline: "The raw appetite of the battlefield.",
    essence: "Your pattern is Ares's — the god of war in its rawest form, the bloodlust and chaos of the fight itself. Unlike Athena's strategy, he is pure martial fury, feared even by the other gods. You meet conflict head-on with overwhelming force and feel most alive at the pitch of struggle.",
    shadow: "Fury without strategy loses; Ares is wounded and humiliated as often as he triumphs.",
  },
  {
    slug: "hades", name: "Hades", pantheon: "Greek",
    deltas: { stillness: 18, sovereignty: 20, shadow: 22, concealment: 16, order: 12, endurance: 10 },
    tier: "open", gender: "god", tone: "dark",
    sources: ["Homeric Hymn to Demeter", "Hesiod, Theogony"],
    tagline: "Rules the realm no one wants to enter.",
    essence: "Your pattern is Hades's — lord of the underworld and the wealth beneath the earth, ruling the realm of the dead with grim fairness. He is not evil but implacable: what comes down stays down. You govern the hidden and unwanted with a cold steadiness, and you keep what you are given.",
    shadow: "The steady grip on the dark becomes possessiveness; he took Persephone rather than courted her.",
  },
  {
    slug: "hermes", name: "Hermes", pantheon: "Greek",
    deltas: { adaptability: 22, expression: 16, initiative: 16, craft: 12, magnetism: 12, concealment: 10 },
    tier: "open", gender: "other", tone: "bright",
    sources: ["Homeric Hymn to Hermes", "Greek cult of Hermes Psychopompos"],
    tagline: "Crosses every border, carries every message.",
    essence: "Your pattern is Hermes's — messenger of the gods, trickster, and guide of souls between worlds, a fluid figure who patrons travellers, thieves, and merchants alike. He slips every boundary and speaks every tongue. You move easily between roles and rooms, translate across worlds, and find the opening others miss.",
    shadow: "The gift for boundary-crossing shades into slipperiness; the messenger is also the patron of thieves and lies.",
  },
  {
    slug: "dionysus", name: "Dionysus", pantheon: "Greek",
    deltas: { disruption: 20, embodiment: 18, transformation: 18, intensity: 14, magnetism: 14, adaptability: 10 },
    tier: "open", gender: "other", tone: "dark",
    sources: ["Euripides, The Bacchae", "Greek Dionysian mysteries"],
    tagline: "Ecstasy that dissolves the ordered self.",
    essence: "Your pattern is Dionysus's — god of wine, ecstasy, and dissolution, a shapeshifting figure who blurs the line between male and female, man and beast, joy and madness. He frees and unmakes in the same gesture. You break down false order and let something wilder move through, and people are drawn to that release.",
    shadow: "The ecstasy that liberates also destroys; the Bacchae tears apart anyone who resists it.",
  },
  {
    slug: "hecate", name: "Hecate", pantheon: "Greek",
    deltas: { concealment: 20, shadow: 20, transformation: 16, intuition: 18, sovereignty: 12, transcendence: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Hesiod, Theogony", "Greek Magical Papyri"],
    tagline: "Holds the keys to the crossroads at night.",
    essence: "Your pattern is Hecate's — goddess of crossroads, magic, ghosts, and the moon's dark face, holding torches at the threshold between worlds. She sees down every road at once and moves in the liminal hours. You are drawn to thresholds, hidden knowledge, and the choices made in the dark.",
    shadow: "Living at the crossroads can mean never choosing a road; the occult pull can isolate you in shadow.",
  },
  {
    slug: "nyx", name: "Nyx", pantheon: "Greek",
    deltas: { stillness: 18, shadow: 22, concealment: 18, transcendence: 16, sovereignty: 14, intuition: 12 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Hesiod, Theogony", "Orphic Hymns"],
    tagline: "The primordial night even Zeus fears.",
    essence: "Your pattern is Nyx's — primordial goddess of night, so ancient and powerful that Zeus himself will not cross her. From her come Sleep, Death, Strife, and Fate. You carry a deep, quiet authority that older and larger than any argument, and others sense a power in your stillness they don't challenge.",
    shadow: "That much depth can swallow the light; withdrawing into the dark, you birth more strife than you mean to.",
  },
  {
    slug: "eris", name: "Eris", pantheon: "Greek",
    deltas: { disruption: 26, intensity: 16, initiative: 12, concealment: 12, autonomy: 10, shadow: 12 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Hesiod, Works and Days", "The golden apple / Judgement of Paris"],
    tagline: "One thrown apple, and everything unravels.",
    essence: "Your pattern is Eris's — goddess of strife and discord, who rolls the golden apple 'to the fairest' into the wedding and starts the chain that ends in Troy. Hesiod also names a good strife, the rivalry that drives craftsmen. You expose the fault lines others paper over, and your presence forces things to a head.",
    shadow: "The talent for exposing conflict tips into starting it for its own sake; you can burn a room to make a point.",
  },
  {
    slug: "hermaphroditus", name: "Hermaphroditus", pantheon: "Greek",
    deltas: { transformation: 20, embodiment: 16, magnetism: 14, adaptability: 16, transcendence: 12, autonomy: 8 },
    tier: "open", gender: "other", tone: "bright",
    sources: ["Ovid, Metamorphoses", "Child of Hermes and Aphrodite"],
    tagline: "Two natures fused into a single self.",
    essence: "Your pattern is Hermaphroditus's — child of Hermes and Aphrodite, merged with the nymph Salmacis into one body holding both sexes. The myth is one of union that cannot be undone. You hold seemingly opposite natures in a single form and refuse to be sorted into one column.",
    shadow: "A self built from fusion can feel unfinished in every camp; belonging wholly to neither can ache.",
  },

  // ————————————————————————————————— Roman (6) —————————————————————————————————
  {
    slug: "janus", name: "Janus", pantheon: "Roman",
    deltas: { vision: 20, transformation: 16, order: 14, memory: 16, adaptability: 12, transcendence: 8 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Ovid, Fasti", "Roman cult of Janus Geminus"],
    tagline: "One face on the past, one on what comes.",
    essence: "Your pattern is Janus's — the two-faced god of doorways, beginnings, and transitions, looking backward and forward at once. Rome opened every undertaking in his name. You hold the whole arc of a change in view, honouring where things came from while facing where they're going.",
    shadow: "Standing forever in the doorway, you can watch both directions and step through neither.",
  },
  {
    slug: "bellona", name: "Bellona", pantheon: "Roman",
    deltas: { intensity: 22, initiative: 18, disruption: 14, loyalty: 12, endurance: 12, sovereignty: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Roman cult of Bellona", "Virgil, Aeneid"],
    tagline: "The war-frenzy that opens the campaign.",
    essence: "Your pattern is Bellona's — Roman goddess of war whose temple stood where the Senate met foreign envoys and declared war. She embodies the martial resolve of the state itself. You bring decisive, mobilising force to a conflict and rally others to the fight.",
    shadow: "The appetite for the campaign can find a war where diplomacy would have done.",
  },
  {
    slug: "vesta", name: "Vesta", pantheon: "Roman",
    deltas: { stillness: 20, order: 18, care: 16, loyalty: 14, endurance: 12, concealment: 8 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Ovid, Fasti", "Roman cult of the Vestal Virgins"],
    tagline: "Keeps the hearth-fire that must never go out.",
    essence: "Your pattern is Vesta's — goddess of the hearth and the sacred flame at the heart of Rome, tended by the Vestal Virgins. Her fire was the continuity of the state and the home. You keep the centre steady and the essential things burning, quietly, so everyone else can range outward.",
    shadow: "Tending the centre so faithfully, you can vanish into the role and let the flame consume your own life.",
  },
  {
    slug: "vertumnus", name: "Vertumnus", pantheon: "Roman",
    deltas: { adaptability: 24, transformation: 20, craft: 14, care: 10, embodiment: 12, magnetism: 8 },
    tier: "open", gender: "other", tone: "bright",
    sources: ["Ovid, Metamorphoses", "Roman god of seasons and change"],
    tagline: "Takes whatever shape the season needs.",
    essence: "Your pattern is Vertumnus's — Roman god of seasons, gardens, and change, who could take any shape and courted Pomona by turning himself old woman and young man by turns. He is transformation in service of growth. You reshape yourself fluidly to fit the moment and coax things into ripening.",
    shadow: "Endless shapeshifting to please can lose the true form; Vertumnus wins Pomona only by finally dropping the disguise.",
  },
  {
    slug: "fortuna", name: "Fortuna", pantheon: "Roman",
    deltas: { disruption: 18, transformation: 16, adaptability: 16, vision: 12, magnetism: 10, sovereignty: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Roman cult of Fortuna", "Boethius, Consolation of Philosophy"],
    tagline: "Turns the wheel that raises and ruins.",
    essence: "Your pattern is Fortuna's — goddess of luck and fate who turns the wheel that lifts some and casts others down, blindfolded and impartial. She rules the part of life no plan controls. You ride change well and understand that fortune is a wheel, not a ladder, so nothing high stays high untended.",
    shadow: "Trusting the wheel can become fatalism; you gamble on the turn instead of building on stone.",
  },
  {
    slug: "saturn", name: "Saturn", pantheon: "Roman",
    deltas: { endurance: 18, order: 16, memory: 16, shadow: 16, transformation: 12, stillness: 10 },
    tier: "open", gender: "god", tone: "dark",
    sources: ["Ovid, Fasti", "Roman festival of Saturnalia"],
    tagline: "Time, harvest, and the god who was dethroned.",
    essence: "Your pattern is Saturn's — god of time, agriculture, and the lost Golden Age, who devoured his children to keep his throne and was overthrown all the same. His festival, Saturnalia, briefly inverted the whole order. You carry deep endurance and a long memory, aware that everything you build is also being harvested by time.",
    shadow: "The fear of being surpassed can make you devour what you should nurture, and hoard against a loss that comes anyway.",
  },

  // ————————————————————————————————— Norse (10) —————————————————————————————————
  {
    slug: "odin", name: "Odin", pantheon: "Norse",
    deltas: { vision: 22, analysis: 16, transformation: 16, sovereignty: 14, shadow: 16, transcendence: 12 },
    tier: "open", gender: "other", tone: "dark",
    sources: ["Poetic Edda, Hávamál", "Snorri Sturluson, Prose Edda"],
    tagline: "Trades an eye, and a self, for wisdom.",
    essence: "Your pattern is Odin's — the All-Father, god of wisdom, war, poetry, and death, who hung nine nights on the world-tree and gave an eye at the well to win knowledge. He practices seiðr, a magic gendered female, and shapeshifts freely. You will pay almost anything for understanding, and you're willing to unmake yourself to see further.",
    shadow: "The hunger for knowledge and power sacrifices everything to itself; Odin betrays his own chosen heroes to stock Valhalla.",
  },
  {
    slug: "thor", name: "Thor", pantheon: "Norse",
    deltas: { endurance: 20, initiative: 16, loyalty: 18, embodiment: 16, intensity: 14, care: 8 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Poetic Edda, Þrymskviða", "Snorri Sturluson, Prose Edda"],
    tagline: "Stands between the world and the giants.",
    essence: "Your pattern is Thor's — god of thunder and the defender of gods and humans, swinging Mjölnir against the giants of chaos. He is strength in service of protection, direct and honest and untiring. You put your body between danger and the people you love, and you keep swinging.",
    shadow: "The reflex to solve things by force meets every problem as a giant to be hammered.",
  },
  {
    slug: "freyja", name: "Freyja", pantheon: "Norse",
    deltas: { magnetism: 20, intensity: 14, care: 12, shadow: 14, transformation: 14, autonomy: 12 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Poetic Edda", "Snorri Sturluson, Prose Edda"],
    tagline: "Love and war and the first pick of the slain.",
    essence: "Your pattern is Freyja's — goddess of love, beauty, seiðr magic, and death, who takes half of those who fall in battle to her own hall before Odin gets his. She weds desire to power and sorcery. You hold beauty and ferocity together, and your longing has real force behind it.",
    shadow: "Wanting beautiful things intensely, you can weep gold and bargain your body for a necklace, as Freyja did.",
  },
  {
    slug: "freyr", name: "Freyr", pantheon: "Norse",
    deltas: { care: 18, embodiment: 18, magnetism: 14, endurance: 12, transcendence: 10, order: 8 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Poetic Edda, Skírnismál", "Snorri Sturluson, Prose Edda"],
    tagline: "Peace, fair weather, and the fertile field.",
    essence: "Your pattern is Freyr's — god of fertility, prosperity, sunshine, and peace, lord of the harvest and the good year. He is generous, life-giving, and beloved. You bring warmth and abundance to what you tend, and people flourish in your care.",
    shadow: "Longing for what you desire, you can give away your sword for it, as Freyr did — and be left disarmed at the end.",
  },
  {
    slug: "loki", name: "Loki", pantheon: "Norse",
    deltas: { disruption: 24, adaptability: 20, craft: 14, concealment: 16, transformation: 16, intensity: 10 },
    tier: "open", gender: "other", tone: "dark",
    sources: ["Poetic Edda, Lokasenna", "Snorri Sturluson, Prose Edda"],
    tagline: "The flaw in the plan, and sometimes the fix.",
    essence: "Your pattern is Loki's — the shapeshifting trickster who changes sex and species at will, mothering a foal as a mare and fathering monsters. He causes the gods' worst crises and solves several of them too. You break the frame, improvise brilliantly, and are impossible to keep in one box.",
    shadow: "The trickster who is tolerated too long turns saboteur; Loki ends bound beneath a dripping serpent, and then ends the world.",
  },
  {
    slug: "frigg", name: "Frigg", pantheon: "Norse",
    deltas: { intuition: 20, care: 18, memory: 14, concealment: 16, vision: 14, loyalty: 10 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Poetic Edda", "Snorri Sturluson, Prose Edda"],
    tagline: "Knows every fate, and speaks none of it.",
    essence: "Your pattern is Frigg's — queen of the Aesir and goddess of foresight, who knows the fate of all things and keeps her counsel. She loves fiercely and tries to shield her son Baldr from his doom. You see what's coming and carry that knowledge quietly, protecting the people you love as best foresight allows.",
    shadow: "Knowing the fate and still fighting it, you can overlook the one small thing — the mistletoe — that undoes everything.",
  },
  {
    slug: "tyr", name: "Tyr", pantheon: "Norse",
    deltas: { loyalty: 20, sovereignty: 16, order: 18, endurance: 14, initiative: 10, care: 8 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Poetic Edda", "Snorri Sturluson, Prose Edda (binding of Fenrir)"],
    tagline: "Puts his hand in the wolf's mouth on purpose.",
    essence: "Your pattern is Tyr's — god of law, justice, and honourable war, who alone dared place his hand in the wolf Fenrir's jaws so the gods could bind it, and lost the hand keeping faith. He is the price of the oath, paid. You hold to justice and your word even when it costs you, and others trust that about you.",
    shadow: "Keeping the letter of the law and the oath can cost you a hand — and can miss where the law itself is the trap.",
  },
  {
    slug: "hel", name: "Hel", pantheon: "Norse",
    deltas: { stillness: 20, shadow: 22, sovereignty: 16, concealment: 14, transformation: 12, autonomy: 12 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Snorri Sturluson, Prose Edda", "Poetic Edda, Baldrs draumar"],
    tagline: "Rules the quiet dead with an even hand.",
    essence: "Your pattern is Hel's — daughter of Loki, half-living and half-corpse, who rules the realm of those who die of sickness and age. She is grim but fair, and even the gods must bargain with her to get Baldr back. You hold the dominion no one wants, keep your own counsel, and cannot be flattered out of your terms.",
    shadow: "Presiding over endings, you can grow cold to appeals; Hel keeps Baldr on a technicality when one creature refuses to weep.",
  },
  {
    slug: "baldr", name: "Baldr", pantheon: "Norse",
    deltas: { care: 18, magnetism: 18, display: 12, transcendence: 14, loyalty: 10, embodiment: 8 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Snorri Sturluson, Prose Edda", "Poetic Edda, Baldrs draumar"],
    tagline: "The best-loved light, and the first to fall.",
    essence: "Your pattern is Baldr's — the radiant, beloved god of light and goodness, so cherished that all things swore not to harm him. His death by a mistletoe dart is the omen that begins the end of the world. You draw love easily and shine goodwill, and people orient around your brightness.",
    shadow: "Being universally beloved is a kind of fragility; the one thing not warded against is the thing that kills you.",
  },
  {
    slug: "skadi", name: "Skadi", pantheon: "Norse",
    deltas: { autonomy: 20, intensity: 16, endurance: 18, embodiment: 14, initiative: 12, sovereignty: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Snorri Sturluson, Prose Edda", "Poetic Edda, Skírnismál"],
    tagline: "The mountain-cold huntress who came for revenge.",
    essence: "Your pattern is Skadi's — giantess goddess of winter, skiing, and the hunt, who marched armed on the gods to avenge her father and won a settlement on her own terms. She belongs to the high cold places. You are self-reliant and hard-wintered, and you press your claim rather than swallow a wrong.",
    shadow: "The cold self-sufficiency can't share a home; Skadi and her sea-god husband part because neither will leave their own country.",
  },

  // ———————————————————————————————— Egyptian (10) ————————————————————————————————
  {
    slug: "ra", name: "Ra", pantheon: "Egyptian",
    deltas: { sovereignty: 22, vision: 16, initiative: 14, transcendence: 16, display: 14, endurance: 10 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Egyptian Book of the Dead", "Heliopolitan solar theology"],
    tagline: "Sails the sun across sky and underworld daily.",
    essence: "Your pattern is Ra's — the sun god who sails his barque across the sky by day and battles the serpent Apophis through the underworld each night to be reborn at dawn. He is creation renewing itself endlessly. You carry a central, ordering brightness and the discipline to do the dark passage over and over.",
    shadow: "The sun-king ages and grows remote; in the myths Ra becomes so distant that humanity plots against him.",
  },
  {
    slug: "isis", name: "Isis", pantheon: "Egyptian",
    deltas: { care: 20, craft: 16, transformation: 16, memory: 14, magnetism: 14, intuition: 12 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Plutarch, On Isis and Osiris", "Egyptian Book of the Dead"],
    tagline: "Reassembles the beloved dead by sheer will.",
    essence: "Your pattern is Isis's — great goddess of magic, motherhood, and healing, who gathered the scattered pieces of murdered Osiris and used her power to conceive their son and set things right. She is devotion made effective. You hold love and competence together, and you will patiently reassemble what has been broken.",
    shadow: "The drive to fix and protect can become control; Isis even tricks Ra out of his secret name to gain power.",
  },
  {
    slug: "osiris", name: "Osiris", pantheon: "Egyptian",
    deltas: { transformation: 20, sovereignty: 16, transcendence: 16, stillness: 14, order: 12, endurance: 10 },
    tier: "open", gender: "god", tone: "dark",
    sources: ["Plutarch, On Isis and Osiris", "Egyptian Book of the Dead"],
    tagline: "Killed, remade, and crowned king of the dead.",
    essence: "Your pattern is Osiris's — god of death, resurrection, and the fertile Nile flood, murdered by his brother and reborn to rule the underworld and judge the dead. His story is the promise that death is a passage, not an end. You carry authority earned through undergoing, and you preside best over things in transition.",
    shadow: "The one who has died and been remade rules from the far side; you can become present only to endings, absent from the living.",
  },
  {
    slug: "set", name: "Set", pantheon: "Egyptian",
    deltas: { disruption: 22, intensity: 18, shadow: 18, sovereignty: 12, embodiment: 14, initiative: 12 },
    tier: "open", gender: "other", tone: "dark",
    sources: ["Egyptian Book of the Dead", "Plutarch, On Isis and Osiris"],
    tagline: "Chaos, storm, and the strength that guards the sun.",
    essence: "Your pattern is Set's — god of the desert, storms, disorder, and violence, an unclassifiable beast who murdered Osiris yet also stands at the prow of Ra's barque to spear the serpent of chaos each night. He is danger that the order actually needs. You disrupt, unsettle, and carry a wild strength that is destructive and protective at once.",
    shadow: "The chaos that guards the world can turn on it; Set's jealousy dismembers his own brother.",
  },
  {
    slug: "anubis", name: "Anubis", pantheon: "Egyptian",
    deltas: { care: 16, order: 16, concealment: 14, transformation: 16, stillness: 14, analysis: 10 },
    tier: "open", gender: "god", tone: "dark",
    sources: ["Egyptian Book of the Dead", "Cult of Anubis, embalming rites"],
    tagline: "Weighs the heart against a single feather.",
    essence: "Your pattern is Anubis's — jackal-headed god of embalming and the dead, guide of souls who weighs each heart against the feather of truth. He does the tender, exacting work at the threshold of death. You tend what others find unbearable, with precision and quiet care, and you judge fairly.",
    shadow: "Living so close to the scales and the dead, you can hold everyone — including yourself — to an impossible weightless standard.",
  },
  {
    slug: "thoth", name: "Thoth", pantheon: "Egyptian",
    deltas: { analysis: 22, craft: 16, memory: 20, expression: 16, vision: 12, order: 12 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Egyptian Book of the Dead", "Hermopolitan theology"],
    tagline: "Invented writing; keeps the record of everything.",
    essence: "Your pattern is Thoth's — ibis-headed god of writing, wisdom, measurement, and the moon, scribe of the gods who records the verdict at the weighing of the heart. He is knowledge kept and made exact. You name, count, and record, and you are the one who remembers precisely how it went.",
    shadow: "The keeper of the record can retreat into the archive, mistaking having written it down for having lived it.",
  },
  {
    slug: "sekhmet", name: "Sekhmet", pantheon: "Egyptian",
    deltas: { intensity: 24, initiative: 16, disruption: 16, care: 12, embodiment: 14, sovereignty: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Egyptian myth of the Destruction of Mankind", "Cult of Sekhmet, healer-goddess"],
    tagline: "The lioness whose fury also heals.",
    essence: "Your pattern is Sekhmet's — lion-headed goddess of war, plague, and healing, the burning eye of Ra sent to destroy, who had to be tricked with red-dyed beer to stop the slaughter. The same power that devastates also cures. You carry a fierce, protective heat, and your intensity is medicine and weapon both.",
    shadow: "Once the fury is loose it doesn't know when to stop; Sekhmet nearly wipes out humanity and can't self-halt.",
  },
  {
    slug: "hathor", name: "Hathor", pantheon: "Egyptian",
    deltas: { magnetism: 20, care: 16, display: 16, expression: 14, embodiment: 16, transcendence: 8 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Egyptian Book of the Dead", "Cult of Hathor at Dendera"],
    tagline: "Music, joy, love, and the milk of the sky.",
    essence: "Your pattern is Hathor's — goddess of love, music, dance, joy, and motherhood, the celestial cow who nourishes the living and welcomes the dead with kindness. She is delight made sacred. You bring warmth, beauty, and celebration, and you know pleasure can be a form of devotion.",
    shadow: "Hathor and Sekhmet are two faces of one goddess; the sweetness can flip to fury when the joy is refused.",
  },
  {
    slug: "hapi", name: "Hapi", pantheon: "Egyptian",
    deltas: { care: 18, embodiment: 18, endurance: 16, transformation: 14, adaptability: 12, magnetism: 8 },
    tier: "open", gender: "other", tone: "bright",
    sources: ["Egyptian Hymn to Hapi", "Nile inundation cult"],
    tagline: "The flood that feeds the whole black land.",
    essence: "Your pattern is Hapi's — androgynous god of the Nile's annual flood, depicted with a swelling belly and pendulous breasts, joining the two lands and bringing the silt that makes Egypt live. Hapi is fertility that belongs to neither sex. You nourish broadly and impartially, and your gifts arrive in generous, life-giving cycles.",
    shadow: "The flood that gives everything can also drown; too much of your abundance at once overwhelms what it meant to feed.",
  },
  {
    slug: "nephthys", name: "Nephthys", pantheon: "Egyptian",
    deltas: { concealment: 20, care: 16, shadow: 16, intuition: 14, transformation: 12, stillness: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Plutarch, On Isis and Osiris", "Egyptian funerary texts"],
    tagline: "The mourner at the edge of every grave.",
    essence: "Your pattern is Nephthys's — goddess of mourning, night, and the hidden, sister of Isis who helps gather Osiris and guards the dead with her. She works in the shadow of the brighter goddess and does the grief-work. You are drawn to the quiet, unglamorous care that surrounds loss, and you hold vigil where others turn away.",
    shadow: "Standing always in the sister's shadow, mourning others' losses, you can neglect your own grief entirely.",
  },

  // ———————————————————————————— Mesopotamian (9) ————————————————————————————
  {
    slug: "inanna", name: "Inanna", pantheon: "Mesopotamian",
    deltas: { magnetism: 22, intensity: 18, initiative: 16, transformation: 16, display: 14, sovereignty: 12 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Sumerian Descent of Inanna", "Hymns of Enheduanna"],
    tagline: "Queen of heaven who walks into hell to rule more.",
    essence: "Your pattern is Inanna's — Sumerian goddess of love, war, and the morning star, who descended through seven gates into the underworld, was stripped and killed, and returned. She is ambition that will risk everything to expand her domain. You want the whole of life, love and power both, and you'll go through the dark to get it.",
    shadow: "The all-consuming ambition takes a price; to return from hell, Inanna hands over her own husband to die in her place.",
  },
  {
    slug: "ereshkigal", name: "Ereshkigal", pantheon: "Mesopotamian",
    deltas: { shadow: 24, sovereignty: 18, stillness: 16, concealment: 16, transformation: 12, intensity: 12 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Sumerian Descent of Inanna", "Akkadian Nergal and Ereshkigal"],
    tagline: "Queen of the great below, and no one's guest.",
    essence: "Your pattern is Ereshkigal's — goddess of the underworld who rules the land of no return alone, grieving and furious, and who kills even her radiant sister Inanna for trespassing. Her realm is sorrow and finality. You hold the hard, sovereign ground of loss, and you do not let it be trivialised or invaded.",
    shadow: "Ruling the dark in isolation, the grief can become a kingdom you refuse to leave or let anyone lighten.",
  },
  {
    slug: "enki", name: "Enki", pantheon: "Mesopotamian",
    deltas: { analysis: 20, craft: 16, intuition: 14, care: 16, adaptability: 16, vision: 10 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Sumerian Enki and the World Order", "Atrahasis epic"],
    tagline: "The clever god who warns the flood is coming.",
    essence: "Your pattern is Enki's — god of fresh water, wisdom, crafts, and mischief, the cunning problem-solver who repeatedly saves humanity, including tipping off the one man to build a boat before the flood. He rules by cleverness and goodwill. You find the ingenious workaround and use your wits to protect people.",
    shadow: "The clever fixer bends every rule; Enki's endless workarounds and appetites also seed new problems.",
  },
  {
    slug: "enlil", name: "Enlil", pantheon: "Mesopotamian",
    deltas: { sovereignty: 22, intensity: 16, order: 16, initiative: 14, disruption: 12, endurance: 10 },
    tier: "open", gender: "god", tone: "dark",
    sources: ["Sumerian hymns to Enlil", "Atrahasis epic"],
    tagline: "The storm-lord whose word decides the fates.",
    essence: "Your pattern is Enlil's — chief god of wind and storm, whose command separated heaven and earth and whose decrees set destinies. Powerful and easily angered, it is he who sends the flood to quiet noisy humanity. You carry weighty, decisive authority, and your word moves things — for good and for ruin.",
    shadow: "The authority that decrees fate grows impatient with the small and the loud; Enlil would erase humanity for disturbing his sleep.",
  },
  {
    slug: "marduk", name: "Marduk", pantheon: "Mesopotamian",
    deltas: { initiative: 20, sovereignty: 20, order: 16, craft: 12, vision: 14, intensity: 12 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Babylonian Enuma Elish", "Cult of Marduk at Babylon"],
    tagline: "Slays chaos and builds the world from it.",
    essence: "Your pattern is Marduk's — patron god of Babylon who slew the chaos-dragon Tiamat and fashioned the ordered cosmos from her body, earning kingship over the gods. He is order won by facing the monster. You step up when things are chaotic, take charge under the condition that you'll actually lead, and build structure out of the wreck.",
    shadow: "Order founded on a conquest can demand endless supremacy; the price of Marduk's kingship is that he must be acclaimed above all.",
  },
  {
    slug: "nergal", name: "Nergal", pantheon: "Mesopotamian",
    deltas: { intensity: 22, disruption: 18, shadow: 18, embodiment: 14, initiative: 12, sovereignty: 12 },
    tier: "open", gender: "god", tone: "dark",
    sources: ["Akkadian Nergal and Ereshkigal", "Sumerian underworld texts"],
    tagline: "War, plague, and the noon-day sun that kills.",
    essence: "Your pattern is Nergal's — god of war, plague, and the scorching sun, who stormed into the underworld and, rather than being destroyed, seized Ereshkigal and became its king. He is destructive force that ends up ruling the dark it invaded. You bring overwhelming intensity to hard ground and can end up master of the very thing you came to fight.",
    shadow: "The force that conquers by violence rules by it too; Nergal's answer to a threat is always escalation.",
  },
  {
    slug: "tiamat", name: "Tiamat", pantheon: "Mesopotamian",
    deltas: { disruption: 20, intensity: 16, transformation: 18, sovereignty: 14, shadow: 16, embodiment: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Babylonian Enuma Elish"],
    tagline: "The primordial deep from which all things are made.",
    essence: "Your pattern is Tiamat's — the primordial saltwater ocean, mother of the gods, who turned to war when her children killed her consort and was split by Marduk into sky and earth. She is the formless origin that becomes the world. You carry the raw generative chaos that comes before order, vast and hard to contain.",
    shadow: "The formless power resists all shaping; provoked, it wars against its own offspring and is undone by the order it birthed.",
  },
  {
    slug: "shamash", name: "Shamash", pantheon: "Mesopotamian",
    deltas: { vision: 20, order: 18, care: 14, expression: 12, sovereignty: 12, endurance: 10 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Code of Hammurabi prologue", "Sumerian/Akkadian sun hymns"],
    tagline: "The sun that sees all and gives the law.",
    essence: "Your pattern is Shamash's — sun god of justice, whose light reaches every corner and who handed Hammurabi the law itself. Nothing is hidden from him, and he judges the living and the dead. You bring things into the light, insist on fairness, and let clear sight settle the matter.",
    shadow: "The one who sees everything and judges can become severe; total transparency leaves no room for mercy or shade.",
  },
  {
    slug: "ninhursag", name: "Ninhursag", pantheon: "Mesopotamian",
    deltas: { care: 22, embodiment: 18, craft: 14, endurance: 14, transformation: 12, order: 8 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Sumerian Enki and Ninhursag", "Sumerian mother-goddess hymns"],
    tagline: "The earth-mother who shapes life from clay.",
    essence: "Your pattern is Ninhursag's — mother goddess of the earth, mountains, and fertility, who helped fashion humankind from clay and gives birth to gods and grain alike. She is the generative ground of things. You make and nurture, patiently bringing life and form out of raw material.",
    shadow: "The nurturer who makes everything can also withdraw it; when wronged, Ninhursag curses Enki and lets him waste until she relents.",
  },

  // ————————————————————————————————— Celtic (8) —————————————————————————————————
  {
    slug: "morrigan", name: "The Morrígan", pantheon: "Celtic",
    deltas: { shadow: 22, intensity: 16, transformation: 18, vision: 16, sovereignty: 14, concealment: 12 },
    tier: "open", gender: "other", tone: "dark",
    sources: ["Irish Cath Maige Tuired", "Ulster Cycle, Táin Bó Cúailnge"],
    tagline: "Crow of battle who foresees who falls.",
    essence: "Your pattern is the Morrígan's — Irish triple goddess of war, fate, and sovereignty, who appears as raven, eel, wolf, and hag, foretelling death and washing the armour of the doomed. She shapeshifts across forms and roles. You perceive the outcome others deny, and you move between shapes to meet what's coming.",
    shadow: "Foreseeing the fall, you can become the omen of it; the Morrígan turns on Cú Chulainn when he refuses her.",
  },
  {
    slug: "brigid", name: "Brigid", pantheon: "Celtic",
    deltas: { craft: 20, care: 16, expression: 16, transcendence: 14, initiative: 12, transformation: 10 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Irish Sanas Cormaic (Cormac's Glossary)", "Lebor Gabála Érenn"],
    tagline: "Fire of the forge, the poem, and the hearth.",
    essence: "Your pattern is Brigid's — Irish goddess of poetry, smithcraft, and healing, a threefold fire of inspiration, the forge, and the healing well. She makes and mends and sings. You create across domains that seem unrelated, and the same warmth runs through all of it.",
    shadow: "Tending three fires at once, you can scatter your flame and leave each craft half-forged.",
  },
  {
    slug: "lugh", name: "Lugh", pantheon: "Celtic",
    deltas: { craft: 18, initiative: 16, expression: 14, vision: 14, magnetism: 14, adaptability: 12 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Irish Cath Maige Tuired", "Lebor Gabála Érenn"],
    tagline: "Master of every art, admitted for all of them.",
    essence: "Your pattern is Lugh's — Irish god of skill, light, and kingship, called Samildánach, 'master of all arts,' who gained entry to the court by being not the best at one thing but capable at everything. He leads the gods to victory. You are the versatile one who can do a little of everything well, and that range is your power.",
    shadow: "Excelling at everything, you can commit to nothing fully, spread thin across every art you could master.",
  },
  {
    slug: "dagda", name: "The Dagda", pantheon: "Celtic",
    deltas: { endurance: 18, care: 16, magnetism: 14, embodiment: 16, sovereignty: 14, craft: 10 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Irish Cath Maige Tuired", "Lebor Gabála Érenn"],
    tagline: "The good god with the cauldron that never empties.",
    essence: "Your pattern is the Dagda's — the 'good god' of Irish myth, a huge, earthy, generous father-figure with a club that kills and revives, a harp that orders the seasons, and a cauldron no company leaves unsatisfied. He is abundance and rough good humour. You provide without stint and hold the group together by sheer warm, capable presence.",
    shadow: "The appetite matches the generosity; the Dagda's comic gluttony and lust can make him an undignified, over-full figure.",
  },
  {
    slug: "cernunnos", name: "Cernunnos", pantheon: "Celtic",
    deltas: { embodiment: 20, stillness: 16, sovereignty: 14, transcendence: 14, transformation: 16, autonomy: 10 },
    tier: "open", gender: "other", tone: "dark",
    sources: ["Gaulish Pillar of the Boatmen (Paris)", "Gundestrup Cauldron iconography"],
    tagline: "The horned lord seated among the wild things.",
    essence: "Your pattern is Cernunnos's — the antlered Gaulish god of animals, wild places, and the liminal, shown seated cross-legged among beasts holding a serpent and a torc. Half-human, half-stag, he sits between worlds. You belong to the threshold between the human and the wild, and you hold a deep, animal stillness others find uncanny.",
    shadow: "Rooted in the wild and the in-between, you can drift out of the human world and its claims entirely.",
  },
  {
    slug: "cerridwen", name: "Cerridwen", pantheon: "Celtic",
    deltas: { transformation: 22, craft: 16, shadow: 16, intuition: 16, concealment: 14, endurance: 10 },
    tier: "open", gender: "other", tone: "dark",
    sources: ["Welsh Tale of Taliesin", "Middle Welsh poetry"],
    tagline: "Brews wisdom, then hunts down the one who steals it.",
    essence: "Your pattern is Cerridwen's — Welsh enchantress who brewed a cauldron of inspiration for a year and a day, and when the boy Gwion swallowed its power, chased him through every shape she could take until she caught and rebirthed him as the poet Taliesin. She is transformation as pursuit. You brew deep knowledge slowly and will shapeshift relentlessly to protect or reclaim it.",
    shadow: "The relentless pursuit through every form can become obsession; Cerridwen hunts the child down to devour him.",
  },
  {
    slug: "arawn", name: "Arawn", pantheon: "Celtic",
    deltas: { sovereignty: 20, shadow: 18, order: 14, stillness: 16, loyalty: 12, concealment: 10 },
    tier: "open", gender: "god", tone: "dark",
    sources: ["Welsh Mabinogi, First Branch (Pwyll)"],
    tagline: "King of the otherworld who trades places to test you.",
    essence: "Your pattern is Arawn's — king of Annwn, the Welsh otherworld, who swaps shapes and kingdoms with a mortal lord for a year to settle a rivalry, and rewards the honour shown to his wife. He rules the hidden realm with dignity and exacting fairness. You hold the underworld's boundaries, test people quietly, and repay loyalty in kind.",
    shadow: "Ruling the hidden realm by strict codes of honour, you can withdraw into the otherworld and judge from behind the veil.",
  },
  {
    slug: "rhiannon", name: "Rhiannon", pantheon: "Celtic",
    deltas: { sovereignty: 18, endurance: 20, magnetism: 16, care: 14, autonomy: 14, transcendence: 8 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Welsh Mabinogi, First and Third Branches"],
    tagline: "Rides at her own unhurried pace, and is not caught.",
    essence: "Your pattern is Rhiannon's — Welsh horse-goddess and queen who chooses her own husband, rides a horse no one can overtake, and endures a cruel false accusation for years with unbroken dignity before she is vindicated. She is patient sovereignty. You keep your own counsel and pace, and you bear injustice without breaking or becoming bitter.",
    shadow: "The dignity that endures wrongs in silence can suffer far too long before it finally names the lie.",
  },

  // ————————————————————————————————— Slavic (4) —————————————————————————————————
  {
    slug: "perun", name: "Perun", pantheon: "Slavic",
    deltas: { initiative: 20, intensity: 18, sovereignty: 18, order: 14, embodiment: 12, loyalty: 8 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Primary Chronicle (Rus' oaths on Perun)", "Reconstructed Slavic thunder-god lore"],
    tagline: "The oak-and-thunder god who strikes the serpent.",
    essence: "Your pattern is Perun's — supreme Slavic god of thunder, war, and law, wielder of the axe and the lightning, eternally at war with the serpent Veles below. He is the storm that enforces the order of the world. You bring decisive, striking force and stand at the top of the hierarchy you defend.",
    shadow: "The thunder-god's answer to a challenge is the lightning-bolt; every rivalry becomes a war with the serpent.",
  },
  {
    slug: "veles", name: "Veles", pantheon: "Slavic",
    deltas: { shadow: 20, transformation: 18, adaptability: 18, concealment: 16, embodiment: 12, craft: 10 },
    tier: "open", gender: "other", tone: "dark",
    sources: ["Reconstructed Slavic myth of Perun and Veles", "Primary Chronicle"],
    tagline: "The shapeshifting serpent of the wet underworld.",
    essence: "Your pattern is Veles's — Slavic god of the underworld, cattle, magic, and trickery, a shapeshifting serpent or dragon who steals from the thunder-god and hides in the roots of the world. He rules wealth, the dead, and the arts of cunning. You work from below and in disguise, and you are drawn to magic, mischief, and the hidden flow of things.",
    shadow: "The one who works by trickery from the shadows invites the thunderbolt; Veles is forever being struck down and slinking back.",
  },
  {
    slug: "mokosh", name: "Mokosh", pantheon: "Slavic",
    deltas: { care: 20, craft: 16, endurance: 16, embodiment: 16, intuition: 14, memory: 8 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Primary Chronicle (Vladimir's pantheon)", "Slavic folk practice of Mokosh"],
    tagline: "Moist Mother Earth who spins the threads of life.",
    essence: "Your pattern is Mokosh's — Slavic goddess of the earth, water, women's work, and fate, who spins and weaves the threads of life and watches over the household and the harvest. She is the fertile, laboring ground. You tend the ongoing work that sustains a life, and you hold the domestic and the earthy as genuinely sacred.",
    shadow: "The one who spins everyone's thread and keeps the home can be spun into nothing but that labour.",
  },
  {
    slug: "morana", name: "Morana", pantheon: "Slavic",
    deltas: { shadow: 20, transformation: 16, stillness: 16, endurance: 14, transcendence: 12, concealment: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["West Slavic Marzanna spring rites", "Reconstructed Slavic death-goddess lore"],
    tagline: "Winter and death, drowned each spring to end her reign.",
    essence: "Your pattern is Morana's — Slavic goddess of winter, death, and the dormant earth, whose effigy is drowned or burned each spring to break winter's grip and let life return. She is the necessary season of ending. You hold the fallow, letting-go phase that has to come before renewal, and you don't flinch from the dark stretch of the year.",
    shadow: "Presiding over the long winter, you can outstay the season, holding the freeze past the point where spring wants to come.",
  },

  // ————————————————————————————————— Baltic (3) —————————————————————————————————
  {
    slug: "perkunas", name: "Perkūnas", pantheon: "Baltic",
    deltas: { initiative: 20, intensity: 18, order: 16, sovereignty: 16, embodiment: 12, loyalty: 8 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Lithuanian folk songs (dainos)", "Baltic thunder-god folklore"],
    tagline: "The thunder that cleanses and keeps the order.",
    essence: "Your pattern is Perkūnas's — Baltic god of thunder, sky, and justice, who rides across the heavens striking devils and the unclean, punishing liars and lifting the fertility of the fields. His thunder is a moral force. You bring cleansing, order-keeping energy and a strong instinct for what is fair and foul.",
    shadow: "The thunder that punishes the unclean can grow righteous and quick to smite; not every wrong is a devil to strike.",
  },
  {
    slug: "saule", name: "Saulė", pantheon: "Baltic",
    deltas: { care: 18, display: 16, endurance: 16, transcendence: 14, magnetism: 14, embodiment: 10 },
    tier: "open", gender: "goddess", tone: "bright",
    sources: ["Lithuanian and Latvian folk songs (dainos)", "Baltic solar mythology"],
    tagline: "The sun-mother who mourns and warms the world.",
    essence: "Your pattern is Saulė's — Baltic sun goddess who drives her chariot across the sky, warms and nurtures the living world, and weeps amber tears over her troubled celestial family. She is radiant, faithful, and enduring. You give steady warmth and care over the long haul, and you carry a tender sorrow inside the brightness.",
    shadow: "Warming everyone and mourning the whole family, the sun-mother can burn out her own light in constant giving.",
  },
  {
    slug: "laima", name: "Laima", pantheon: "Baltic",
    deltas: { vision: 18, memory: 16, intuition: 18, transformation: 14, care: 12, sovereignty: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Latvian and Lithuanian folk songs (dainos)", "Baltic goddess-of-fate lore"],
    tagline: "Weaves the fate laid down at each birth.",
    essence: "Your pattern is Laima's — Baltic goddess of fate, fortune, and childbirth, who decides the length and lot of each life at the moment of birth and blesses or withholds. She holds the thread of destiny. You sense how things are fated to fall and carry an intuitive, decisive read on people's futures.",
    shadow: "Reading everyone's fate, you can treat the lot as fixed and stop fighting for a different ending.",
  },

  // ———————————————————————————————— Finnish (3) ————————————————————————————————
  {
    slug: "vainamoinen", name: "Väinämöinen", pantheon: "Finnish",
    deltas: { expression: 20, craft: 16, memory: 20, vision: 14, transcendence: 14, endurance: 10 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Finnish Kalevala (compiled by Elias Lönnrot)"],
    tagline: "Sings so truly the world rearranges itself.",
    essence: "Your pattern is Väinämöinen's — the ancient sage-hero of the Kalevala, born old and wise, whose songs and runes hold such power that they shape reality and sink his rivals into swamps. He is the master of word and memory. You move things through knowledge, voice, and the long view rather than force.",
    shadow: "The old wise one can grow attached to the old ways; Väinämöinen sails off rather than yield to the new age that follows him.",
  },
  {
    slug: "ilmarinen", name: "Ilmarinen", pantheon: "Finnish",
    deltas: { craft: 24, endurance: 18, order: 16, initiative: 12, vision: 10, embodiment: 12 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Finnish Kalevala (compiled by Elias Lönnrot)"],
    tagline: "Forged the sky, and the Sampo that mills fortune.",
    essence: "Your pattern is Ilmarinen's — the eternal smith of the Kalevala, who hammered out the dome of the sky and forged the Sampo, the magical mill of endless prosperity. He makes the impossible object through sheer skill and labour. You build the thing that shouldn't be buildable, and you'd rather forge a solution than talk your way to one.",
    shadow: "The smith can pour his whole self into the work; Ilmarinen even forges a wife of gold, and finds the metal cold at his side.",
  },
  {
    slug: "louhi", name: "Louhi", pantheon: "Finnish",
    deltas: { sovereignty: 20, concealment: 16, craft: 14, shadow: 18, intensity: 14, autonomy: 12 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Finnish Kalevala (compiled by Elias Lönnrot)"],
    tagline: "The witch-queen of the north who hides the sun.",
    essence: "Your pattern is Louhi's — the fierce sorceress-ruler of Pohjola, the dark northland of the Kalevala, who commands storms and plagues, hides the sun and moon, and drives a hard bargain for her daughters and the Sampo. She is a formidable adversary and a shrewd matriarch. You rule your own cold domain with cunning and refuse to be crossed.",
    shadow: "Guarding her northland by gripping and hiding what others need, Louhi's power curdles into spite and theft.",
  },

  // ———————————————————————————————— Canaanite (3) ————————————————————————————————
  {
    slug: "baal", name: "Baal Hadad", pantheon: "Canaanite",
    deltas: { initiative: 20, intensity: 18, sovereignty: 16, embodiment: 14, transformation: 12, endurance: 10 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Ugaritic Baal Cycle (Ras Shamra tablets)"],
    tagline: "The storm-king who dies and rises with the rains.",
    essence: "Your pattern is Baal Hadad's — Canaanite god of storm, rain, and fertility, who fights the sea-god Yam and the death-god Mot, is swallowed into death, and returns with the reviving rains. He is vital force that must keep proving itself. You bring energising, life-bringing power, and you rise again after being brought low.",
    shadow: "The storm-king's rule is never secure; Baal must keep fighting Yam and Mot, and every victory is provisional.",
  },
  {
    slug: "anat", name: "Anat", pantheon: "Canaanite",
    deltas: { intensity: 24, initiative: 18, disruption: 16, loyalty: 16, embodiment: 12, care: 8 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Ugaritic Baal Cycle (Ras Shamra tablets)"],
    tagline: "Wades through blood to bring her brother back.",
    essence: "Your pattern is Anat's — Canaanite goddess of war and the hunt, ferocious and devoted, who wades knee-deep in the blood of her enemies and personally tears apart Mot to recover the slain Baal. Her loyalty is violent and absolute. You defend your own with overwhelming, unhesitating force.",
    shadow: "The devotion that will slaughter anything for a loved one recognises no limit and no mercy.",
  },
  {
    slug: "astarte", name: "Astarte", pantheon: "Canaanite",
    deltas: { magnetism: 22, display: 16, intensity: 14, embodiment: 14, sovereignty: 12, initiative: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Ugaritic and Phoenician sources", "Sidonian cult of Astarte"],
    tagline: "Beauty and war held in the same hand.",
    essence: "Your pattern is Astarte's — Canaanite and Phoenician goddess of love, sexuality, and war, a queen of heaven worshipped across the ancient Levant who joins desire to martial power. She is allure that also commands armies. You draw people powerfully and carry a hard edge beneath the attraction.",
    shadow: "Fusing desire and war, the same magnetism that draws people can be turned to dominate and consume them.",
  },

  // ————————————————————————— Aztec (4, historical) —————————————————————————
  {
    slug: "tezcatlipoca", name: "Tezcatlipoca", pantheon: "Aztec",
    deltas: { shadow: 22, disruption: 18, transformation: 16, sovereignty: 14, concealment: 16, intuition: 10 },
    tier: "open", gender: "other", tone: "dark",
    sources: ["Florentine Codex (Sahagún)", "Aztec Codex Borgia"],
    tagline: "The smoking mirror that sees your every fault.",
    essence: "Your pattern is Tezcatlipoca's — Aztec god of night, sorcery, fate, and the shifting present, called 'the smoking mirror,' a shapeshifting trickster who sees into hearts and topples the proud. He gives and takes fortune on a whim. You perceive what people hide, unsettle the settled, and hold a mirror no one enjoys looking into.",
    shadow: "The mirror that exposes everyone can become cruelty for its own sake; Tezcatlipoca ruins others to prove he can.",
  },
  {
    slug: "quetzalcoatl", name: "Quetzalcoatl", pantheon: "Aztec",
    deltas: { vision: 20, craft: 16, transcendence: 18, expression: 14, transformation: 16, care: 10 },
    tier: "open", gender: "other", tone: "bright",
    sources: ["Florentine Codex (Sahagún)", "Aztec and Toltec Quetzalcoatl traditions"],
    tagline: "The feathered serpent who gives knowledge, not blood.",
    essence: "Your pattern is Quetzalcoatl's — the feathered serpent, Aztec god of wind, learning, and the arts, who joins earth-snake and sky-bird and, in myth, opposed human sacrifice and brought maize and knowledge to people. He is the civilising, self-transforming impulse. You bring learning and refinement, and you reach for a higher way of doing things.",
    shadow: "The high ideal is fragile; shamed into disgrace, Quetzalcoatl exiles himself and sails away in defeat.",
  },
  {
    slug: "tlaloc", name: "Tlaloc", pantheon: "Aztec",
    deltas: { intensity: 18, care: 14, embodiment: 16, endurance: 14, shadow: 16, transformation: 12 },
    tier: "open", gender: "god", tone: "dark",
    sources: ["Florentine Codex (Sahagún)", "Templo Mayor, Tlaloc precinct"],
    tagline: "Gives the rain, and drowns you in it.",
    essence: "Your pattern is Tlaloc's — Aztec god of rain, water, and fertility, who nourishes the crops and also sends floods, drought, and lightning, and to whom children were sacrificed for rain. He rules the water that gives and takes life. You hold the power to nourish and to overwhelm, and your gifts arrive with real weather behind them.",
    shadow: "The rain-giver can turn withholding or drowning; the same hand that feeds the field can flood or parch it.",
  },
  {
    slug: "coatlicue", name: "Coatlicue", pantheon: "Aztec",
    deltas: { transformation: 20, shadow: 20, care: 14, embodiment: 16, endurance: 14, sovereignty: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Florentine Codex (Sahagún)", "Coatlicue monolith, Templo Mayor"],
    tagline: "The earth-mother wearing a skirt of serpents.",
    essence: "Your pattern is Coatlicue's — Aztec earth goddess, mother of the gods, depicted with a skirt of snakes and a necklace of hearts and hands, who gives birth to all life and devours all death back into herself. She is creation and the grave in one body. You hold the whole cycle of making and unmaking, and you are not frightened by the mortal underside of life.",
    shadow: "Being the ground that both births and swallows, you can consume what you create and blur nurture with devouring.",
  },

  // ————————————————————————— Maya (2, historical) —————————————————————————
  {
    slug: "itzamna", name: "Itzamná", pantheon: "Maya",
    deltas: { analysis: 20, craft: 16, memory: 18, vision: 14, order: 14, transcendence: 12 },
    tier: "open", gender: "god", tone: "bright",
    sources: ["Maya Dresden Codex", "Yucatec Maya creator-god traditions"],
    tagline: "Gave writing, the calendar, and the healing arts.",
    essence: "Your pattern is Itzamná's — supreme Maya creator god of the sky, wisdom, writing, and medicine, credited with giving humanity the calendar, the script, and the healing arts. He is civilisation's knowledge personified. You gather and pass on knowledge across fields, and you build the systems others learn from.",
    shadow: "The elder keeper of all knowledge can become remote and abstract, ruling from the sky rather than the ground.",
  },
  {
    slug: "ixchel", name: "Ixchel", pantheon: "Maya",
    deltas: { care: 18, transformation: 16, intuition: 16, craft: 14, shadow: 16, embodiment: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Maya Dresden Codex", "Postclassic Yucatec traditions of Ixchel"],
    tagline: "Midwife of the moon, and the flood in her jar.",
    essence: "Your pattern is Ixchel's — Maya goddess of the moon, midwifery, weaving, and medicine, an aged jaguar-clawed figure who also pours destroying floods from her overturned jar. She spans birth-work and deluge. You tend life at its thresholds — birth, healing, the loom — while carrying the darker power of the waters.",
    shadow: "The same jar that waters can be overturned to flood; the midwife's power over life and water can turn destructive.",
  },

  // ————————————————————————— Polynesian (2, historical) —————————————————————————
  {
    slug: "maui", name: "Māui", pantheon: "Polynesian",
    deltas: { adaptability: 20, initiative: 18, craft: 14, disruption: 16, expression: 12, autonomy: 12 },
    tier: "open", gender: "god", tone: "dark",
    sources: ["Pan-Polynesian Māui cycle", "Māori and Hawaiian oral traditions"],
    tagline: "Snares the sun and fishes up the islands.",
    essence: "Your pattern is Māui's — the pan-Polynesian trickster demigod who slowed the sun to lengthen the day, fished whole islands from the sea, and stole fire for humankind by cunning and nerve. He wrests gifts from the gods by audacity. You bend the rules of what's possible and win advantages for everyone through sheer daring wit.",
    shadow: "The audacity that steals fire also overreaches; Māui dies trying to conquer death itself, crushed reaching too far.",
  },
  {
    slug: "hine-nui-te-po", name: "Hine-nui-te-pō", pantheon: "Polynesian",
    deltas: { shadow: 22, stillness: 16, transformation: 16, sovereignty: 16, transcendence: 14, concealment: 10 },
    tier: "open", gender: "goddess", tone: "dark",
    sources: ["Māori Māui cycle", "Pan-Polynesian traditions of the night-mother"],
    tagline: "The great woman of night who keeps death final.",
    essence: "Your pattern is Hine-nui-te-pō's — the Polynesian goddess of night and death, the great ancestress who receives the dead into the darkness and crushes Māui when he tries to reverse mortality by crawling through her body. She is the finality that makes life meaningful. You hold firm boundaries around endings and cannot be tricked out of them.",
    shadow: "Guarding the finality of death, you can meet every attempt at renewal as a trespass to be crushed.",
  },

  // ————————————————————————— Hindu (14, living-open) —————————————————————————
  {
    slug: "shiva", name: "Shiva", pantheon: "Hindu",
    deltas: { transformation: 22, transcendence: 20, stillness: 18, disruption: 16, sovereignty: 12, shadow: 12 },
    tier: "living-open", gender: "god", tone: "dark",
    sources: ["Shvetashvatara Upanishad", "Shaiva Puranic tradition"],
    tagline: "Dissolves the world so it can begin again.",
    essence: "Your pattern echoes Shiva's — the great ascetic and lord of destruction and transformation, who dances the universe into dissolution and sits in deep meditation on the mountain. In his tradition, ending is what makes renewal possible. This pattern holds stillness and upheaval together and treats dissolution as a creative act.",
    shadow: "The withdrawal into transcendence can become detachment from the living, and the destroyer can tear down what still had life in it.",
  },
  {
    slug: "vishnu", name: "Vishnu", pantheon: "Hindu",
    deltas: { order: 20, care: 16, sovereignty: 16, endurance: 16, transcendence: 14, adaptability: 12 },
    tier: "living-open", gender: "other", tone: "bright",
    sources: ["Bhagavad Gita", "Vaishnava Puranic tradition"],
    tagline: "Descends in many forms to restore the balance.",
    essence: "Your pattern echoes Vishnu's — the preserver who maintains cosmic order and descends across ages in many avatars, including the enchantress Mohini, to set the world right whenever balance fails. In his tradition he is steady sustaining grace. This pattern keeps things in balance and takes whatever form the moment of restoration requires.",
    shadow: "The one who preserves the order can prop up what should change, mistaking the status quo for the balance it protects.",
  },
  {
    slug: "brahma", name: "Brahma", pantheon: "Hindu",
    deltas: { vision: 20, craft: 16, transcendence: 16, memory: 16, order: 14, expression: 10 },
    tier: "living-open", gender: "god", tone: "bright",
    sources: ["Puranic creation accounts", "Brahmanical cosmology"],
    tagline: "Speaks the worlds and their forms into being.",
    essence: "Your pattern echoes Brahma's — the creator who brings forth the cosmos and the four Vedas, the origin from which forms and knowledge unfold. In his tradition he begins things but does not cling to running them. This pattern originates and designs, giving shape to what did not exist before.",
    shadow: "The creator who makes and moves on is barely worshipped; originating everything and sustaining none can leave your work untended.",
  },
  {
    slug: "lakshmi", name: "Lakshmi", pantheon: "Hindu",
    deltas: { care: 18, magnetism: 18, display: 16, embodiment: 14, order: 12, transcendence: 10 },
    tier: "living-open", gender: "goddess", tone: "bright",
    sources: ["Sri Sukta (Rigvedic appendix)", "Vaishnava tradition of Sri-Lakshmi"],
    tagline: "Fortune, beauty, and abundance that must be tended.",
    essence: "Your pattern echoes Lakshmi's — goddess of wealth, fortune, beauty, and prosperity, who brings flourishing where she is honoured and withdraws where she is not. In her tradition abundance is a grace that has to be welcomed and kept. This pattern draws prosperity and beauty and understands that good fortune is cultivated, not owned.",
    shadow: "Fortune is famously fickle; chasing or clutching abundance, this pattern can find that Lakshmi slips away when gripped too hard.",
  },
  {
    slug: "saraswati", name: "Saraswati", pantheon: "Hindu",
    deltas: { expression: 22, craft: 16, analysis: 16, transcendence: 14, vision: 14, stillness: 8 },
    tier: "living-open", gender: "goddess", tone: "bright",
    sources: ["Rigveda (Saraswati hymns)", "Tradition of Saraswati, goddess of learning"],
    tagline: "Knowledge, music, and speech as a flowing river.",
    essence: "Your pattern echoes Saraswati's — goddess of knowledge, music, art, and eloquent speech, seated with the veena and the book, a river of learning and clarity. In her tradition wisdom and the arts are one current. This pattern lives for learning and expression, and it refines whatever it touches into something clearer and more beautiful.",
    shadow: "Devotion to pure knowledge and art can float above the practical; the river of learning can forget the ground it waters.",
  },
  {
    slug: "kali", name: "Kali", pantheon: "Hindu",
    deltas: { shadow: 24, disruption: 18, transformation: 18, intensity: 16, sovereignty: 12, autonomy: 12 },
    tier: "living-open", gender: "goddess", tone: "dark",
    sources: ["Devi Mahatmya", "Shakta and Tantric tradition of Kali"],
    tagline: "Fierce mother who devours the ego and time itself.",
    essence: "Your pattern echoes Kali's — the fierce dark goddess of time, destruction, and liberation, garlanded with skulls and dancing on the field of the slain, who annihilates demons and the false self alike. In her tradition her terror is a mother's liberating love. This pattern confronts what others flee, and it destroys illusions to set something free.",
    shadow: "The liberating fury, unchecked, can lose itself in destruction; the dance that frees can become a dance that cannot stop.",
  },
  {
    slug: "durga", name: "Durga", pantheon: "Hindu",
    deltas: { initiative: 20, sovereignty: 18, intensity: 16, care: 14, endurance: 16, order: 10 },
    tier: "living-open", gender: "goddess", tone: "dark",
    sources: ["Devi Mahatmya", "Shakta tradition of Durga"],
    tagline: "Rides the lion to fight what gods could not.",
    essence: "Your pattern echoes Durga's — the warrior goddess riding a lion, wielding every god's weapon at once, who defeats the buffalo-demon no male god could stop. In her tradition she is invincible protective power summoned when all else fails. This pattern rises to the impossible fight and shields others with unshakeable resolve.",
    shadow: "The invincible protector can define herself only by the battle, always needing a demon to fight.",
  },
  {
    slug: "ganesha", name: "Ganesha", pantheon: "Hindu",
    deltas: { analysis: 18, craft: 14, initiative: 14, care: 16, memory: 16, order: 12 },
    tier: "living-open", gender: "god", tone: "bright",
    sources: ["Puranic accounts of Ganesha", "Tradition of Ganesha, remover of obstacles"],
    tagline: "Clears the road and blesses the beginning.",
    essence: "Your pattern echoes Ganesha's — the elephant-headed god of beginnings, wisdom, and the removal of obstacles, invoked before any undertaking, patient scribe of the epics. In his tradition he both clears and places obstacles as each path requires. This pattern smooths the way for others and brings a grounded, good-humoured intelligence to starting things.",
    shadow: "The one who clears every obstacle for others can forget to begin his own road, endlessly enabling instead of acting.",
  },
  {
    slug: "krishna", name: "Krishna", pantheon: "Hindu",
    deltas: { magnetism: 22, expression: 16, vision: 16, adaptability: 16, care: 12, transcendence: 10 },
    tier: "living-open", gender: "god", tone: "bright",
    sources: ["Bhagavad Gita", "Bhagavata Purana"],
    tagline: "The playful counsellor who teaches through love.",
    essence: "Your pattern echoes Krishna's — the beloved cowherd, flute-player, and divine statesman who charms all who meet him and counsels Arjuna on duty and detachment in the Gita. In his tradition delight and deep wisdom are inseparable. This pattern draws people through charm and play while carrying real guidance beneath the lightness.",
    shadow: "The charm and strategic cunning can shade into manipulation; the same guile that wins the war bends a lot of rules to do it.",
  },
  {
    slug: "hanuman", name: "Hanuman", pantheon: "Hindu",
    deltas: { loyalty: 24, endurance: 18, initiative: 14, care: 14, embodiment: 14, expression: 8 },
    tier: "living-open", gender: "god", tone: "bright",
    sources: ["Valmiki Ramayana", "Tradition of Hanuman, devotee of Rama"],
    tagline: "Devotion so total it can leap oceans.",
    essence: "Your pattern echoes Hanuman's — the monkey god of strength, courage, and boundless devotion, who leaps oceans, carries mountains, and serves Rama with a wholehearted love that unlocks superhuman power. In his tradition selfless devotion is the source of his might. This pattern finds its greatest strength in loyal service to something larger than itself.",
    shadow: "Strength that flows only from devotion can forget its own power without a master to serve, and lose itself in the service.",
  },
  {
    slug: "parvati", name: "Parvati", pantheon: "Hindu",
    deltas: { care: 18, endurance: 18, embodiment: 14, transformation: 14, magnetism: 14, loyalty: 10 },
    tier: "living-open", gender: "goddess", tone: "bright",
    sources: ["Puranic accounts of Parvati", "Shaiva tradition of Parvati"],
    tagline: "Steady love that draws the ascetic back to life.",
    essence: "Your pattern echoes Parvati's — goddess of love, devotion, and fertility, whose patient tapas wins the ascetic Shiva and draws him back into the world and marriage. In her tradition she balances his withdrawal with warmth and rootedness. This pattern holds steady, loving persistence and gently reconnects what has gone remote.",
    shadow: "The devotion that patiently waits and softens another can lose its own edges, defined only through the partner it draws back.",
  },
  {
    slug: "ardhanarishvara", name: "Ardhanarishvara", pantheon: "Hindu",
    deltas: { transformation: 18, transcendence: 18, sovereignty: 14, embodiment: 14, magnetism: 12, adaptability: 12 },
    tier: "living-open", gender: "other", tone: "bright",
    sources: ["Puranic and Shaiva iconography", "Tradition of Ardhanarishvara"],
    tagline: "Half Shiva, half Parvati, a single undivided form.",
    essence: "Your pattern echoes Ardhanarishvara's — the composite deity split vertically down the middle, half Shiva and half Parvati, embodying the union of masculine and feminine as one indivisible whole. In its tradition it shows that the poles are ultimately inseparable. This pattern integrates opposites within a single self and refuses to be halved into one nature.",
    shadow: "Holding both natures in one form can mean belonging fully to neither camp, and being read as a symbol rather than a self.",
  },
  {
    slug: "yama", name: "Yama", pantheon: "Hindu",
    deltas: { order: 20, sovereignty: 16, shadow: 18, endurance: 14, stillness: 14, memory: 10 },
    tier: "living-open", gender: "god", tone: "dark",
    sources: ["Rigveda (Yama hymns)", "Katha Upanishad"],
    tagline: "The first to die, and lord of the law of death.",
    essence: "Your pattern echoes Yama's — the god of death and dharma, the first mortal to die who became the just judge of the dead and keeper of cosmic law. In his tradition he is stern but scrupulously fair, and in the Katha Upanishad he teaches the deepest wisdom about death. This pattern holds firm, impartial judgement and is unafraid of the reality of endings.",
    shadow: "The impartial keeper of the law can become rigid and remote, applying the rule where a life needed mercy.",
  },
  {
    slug: "ganga", name: "Ganga", pantheon: "Hindu",
    deltas: { care: 20, transformation: 18, transcendence: 18, embodiment: 14, adaptability: 14, endurance: 8 },
    tier: "living-open", gender: "goddess", tone: "bright",
    sources: ["Ramayana (descent of the Ganges)", "Puranic tradition of Ganga"],
    tagline: "The river of heaven that washes away what's carried.",
    essence: "Your pattern echoes Ganga's — the sacred river goddess who descended from heaven to earth, her fall broken by Shiva's hair, to purify the living and carry the dead toward release. In her tradition her waters cleanse whatever is brought to them. This pattern flows around every obstacle and carries away what people cannot let go of themselves.",
    shadow: "The one who absorbs and washes away everyone's burdens can take on more than any current should have to carry.",
  },

  // ————————————————————————— Shinto (6, living-open) —————————————————————————
  {
    slug: "amaterasu", name: "Amaterasu", pantheon: "Shinto",
    deltas: { display: 18, sovereignty: 20, transcendence: 16, care: 14, magnetism: 16, order: 10 },
    tier: "living-open", gender: "goddess", tone: "bright",
    sources: ["Kojiki", "Nihon Shoki"],
    tagline: "The sun withdrawn, and the world coaxing her out.",
    essence: "Your pattern echoes Amaterasu's — the radiant sun goddess and highest deity of the Shinto pantheon, ancestress of the imperial line, who once hid in a cave and plunged the world into darkness until she was drawn back out. In her tradition her light is the source of order and life. This pattern carries a central, warming radiance that others orient around.",
    shadow: "When wounded, the radiant one can withdraw into the cave, and her absence darkens the whole world around her.",
  },
  {
    slug: "susanoo", name: "Susanoo", pantheon: "Shinto",
    deltas: { disruption: 22, intensity: 18, initiative: 16, transformation: 14, embodiment: 12, sovereignty: 8 },
    tier: "living-open", gender: "god", tone: "dark",
    sources: ["Kojiki", "Nihon Shoki"],
    tagline: "The storm-brother, exiled, who still slays the serpent.",
    essence: "Your pattern echoes Susanoo's — the tempestuous god of storms and sea, whose rampages got him cast out of heaven, yet who then slew the eight-headed serpent Yamata-no-Orochi and found a bride. In his tradition his wildness is both destructive and heroic. This pattern brings turbulent, disruptive force that can wreck and rescue in the same season.",
    shadow: "The storm that gets you exiled precedes the heroism; the rampage can cost you everything before the redemption arrives.",
  },
  {
    slug: "tsukuyomi", name: "Tsukuyomi", pantheon: "Shinto",
    deltas: { stillness: 20, concealment: 16, order: 16, autonomy: 16, shadow: 14, analysis: 8 },
    tier: "living-open", gender: "god", tone: "dark",
    sources: ["Kojiki", "Nihon Shoki"],
    tagline: "The moon who left the sun over a matter of honour.",
    essence: "Your pattern echoes Tsukuyomi's — the cold, orderly moon god who killed the food goddess in disgust at her manners, and for that was cast out by his sister the sun, so that day and night have been apart ever since. In his tradition he is proper, remote, and unforgiving of the crude. This pattern values order and propriety and keeps a self-contained distance.",
    shadow: "The insistence on propriety can turn brutally cold; one breach of decorum and Tsukuyomi cuts the offender off forever.",
  },
  {
    slug: "inari", name: "Inari", pantheon: "Shinto",
    deltas: { care: 18, adaptability: 20, craft: 14, magnetism: 14, transformation: 16, concealment: 10 },
    tier: "living-open", gender: "other", tone: "bright",
    sources: ["Shinto Inari cult", "Fushimi Inari tradition"],
    tagline: "Rice, fortune, and foxes — appearing as any gender.",
    essence: "Your pattern echoes Inari's — the immensely popular deity of rice, prosperity, and foxes, depicted variously as an old man, a young woman, or an androgynous figure, and served by shapeshifting fox messengers. In their tradition the deity's very form is fluid. This pattern nourishes and prospers what it tends, and it moves fluidly across roles and appearances.",
    shadow: "The shapeshifting abundance can be tricksy and hard to pin; foxes are as known for deceiving as for blessing.",
  },
  {
    slug: "izanami", name: "Izanami", pantheon: "Shinto",
    deltas: { transformation: 20, shadow: 20, care: 14, embodiment: 14, transcendence: 12, endurance: 10 },
    tier: "living-open", gender: "goddess", tone: "dark",
    sources: ["Kojiki", "Nihon Shoki"],
    tagline: "Mother of the islands, then queen of the dead.",
    essence: "Your pattern echoes Izanami's — the primordial goddess who with her husband gave birth to the islands and gods of Japan, died bearing the fire god, and became ruler of the underworld, from which she could not be brought back. In her tradition she is creation that passes into death. This pattern holds the whole arc from making life to presiding over its end.",
    shadow: "Turned by grief and the shame of being seen decayed, the life-mother becomes an implacable pursuer from the land of the dead.",
  },
  {
    slug: "raijin", name: "Raijin", pantheon: "Shinto",
    deltas: { intensity: 22, disruption: 18, initiative: 16, embodiment: 16, display: 12, endurance: 8 },
    tier: "living-open", gender: "god", tone: "dark",
    sources: ["Japanese folklore and Shinto tradition", "Raijin-Fujin iconography"],
    tagline: "Beats the drums that break the sky with thunder.",
    essence: "Your pattern echoes Raijin's — the fierce thunder god who circles his ring of drums to crash the storms across the sky, feared and honoured as raw elemental power. In his tradition his thunder is dangerous but can drive off worse threats. This pattern brings loud, electric, arresting force and makes itself unmistakably felt.",
    shadow: "The elemental noise-maker can be all storm and spectacle, dangerous to whatever stands too close when the drums start.",
  },

  // ————————————————————————— Buddhist (5, living-open) —————————————————————————
  {
    slug: "avalokiteshvara", name: "Avalokiteshvara", pantheon: "Buddhist",
    deltas: { care: 24, transcendence: 18, adaptability: 16, magnetism: 12, stillness: 12, intuition: 12 },
    tier: "living-open", gender: "other", tone: "bright",
    sources: ["Lotus Sutra", "Mahayana tradition of Avalokiteshvara / Guanyin"],
    tagline: "Hears every cry and takes any form to answer.",
    essence: "Your pattern echoes Avalokiteshvara's — the bodhisattva of infinite compassion, who hears the suffering of the world and manifests in whatever form will help, appearing as male in India and as the female Guanyin in East Asia. In the tradition, boundless mercy takes whatever shape is needed. This pattern turns toward suffering rather than away, and it fits itself to what each person needs.",
    shadow: "Answering everyone's suffering can overwhelm; the compassion that takes on the whole world's pain can leave nothing for the self.",
  },
  {
    slug: "tara", name: "Tara", pantheon: "Buddhist",
    deltas: { care: 20, initiative: 18, transcendence: 16, intuition: 14, magnetism: 12, adaptability: 10 },
    tier: "living-open", gender: "goddess", tone: "bright",
    sources: ["Tibetan Buddhist Tara tantras", "Praises to the Twenty-One Taras"],
    tagline: "Compassion that acts fast, before the plea is finished.",
    essence: "Your pattern echoes Tara's — the female bodhisattva of swift compassion and action, who springs to help the moment she is called, and whose Green form is ready with one foot already stepping off the lotus. In her tradition she is mercy that moves immediately. This pattern joins deep care with quick, decisive action and doesn't leave the suffering waiting.",
    shadow: "The one who springs to every rescue can act before she's asked, and rush in where waiting would have served better.",
  },
  {
    slug: "manjushri", name: "Mañjuśrī", pantheon: "Buddhist",
    deltas: { analysis: 22, vision: 18, transcendence: 16, expression: 14, order: 12, craft: 8 },
    tier: "living-open", gender: "god", tone: "bright",
    sources: ["Mahayana Prajnaparamita literature", "Tradition of Mañjuśrī, bodhisattva of wisdom"],
    tagline: "The flaming sword that cuts through ignorance.",
    essence: "Your pattern echoes Mañjuśrī's — the bodhisattva of wisdom and insight, who wields a flaming sword that severs delusion and holds the book of transcendent knowledge. In the tradition his sharpness is a tool of liberation, cutting confusion at the root. This pattern seeks clarity and uses keen discernment to cut through what is muddled and false.",
    shadow: "The sword that cuts through confusion can cut people too; sharp discernment untempered by warmth can wound where it means to free.",
  },
  {
    slug: "vajrapani", name: "Vajrapāṇi", pantheon: "Buddhist",
    deltas: { intensity: 22, initiative: 16, sovereignty: 16, embodiment: 16, disruption: 14, endurance: 10 },
    tier: "living-open", gender: "god", tone: "dark",
    sources: ["Mahayana and Vajrayana tradition", "Iconography of Vajrapāṇi"],
    tagline: "The wrathful guardian of the teaching's power.",
    essence: "Your pattern echoes Vajrapāṇi's — the fierce, muscular bodhisattva who wields the thunderbolt-scepter and embodies the raw power of an awakened mind, guardian and protector of the teachings. In the tradition his wrath is enlightened energy turned against obstacles, not malice. This pattern brings protective ferocity and channels intensity into guarding what matters.",
    shadow: "Wrathful protective energy can slip its enlightened frame and become plain aggression looking for something to guard against.",
  },
  {
    slug: "mahakala", name: "Mahākāla", pantheon: "Buddhist",
    deltas: { shadow: 22, intensity: 18, transformation: 16, sovereignty: 16, disruption: 12, endurance: 10 },
    tier: "living-open", gender: "god", tone: "dark",
    sources: ["Vajrayana Buddhist tradition", "Iconography of Mahākāla, dharmapala"],
    tagline: "The dark protector who devours obstacles whole.",
    essence: "Your pattern echoes Mahākāla's — the fierce dark protector deity, a wrathful emanation who tramples ego and destroys the obstacles to awakening, terrifying in form yet compassionate in purpose. In the tradition his blackness is the absorption of all into wisdom. This pattern confronts the darkest obstacles directly and turns fearsome power toward protection.",
    shadow: "The wrath that devours obstacles is a hair's breadth from wrath that devours indiscriminately; the fierce protector can become the thing feared.",
  },

  // ————————————————————————— Daoist (5, living-open) —————————————————————————
  {
    slug: "xiwangmu", name: "Xiwangmu", pantheon: "Daoist",
    deltas: { sovereignty: 20, transcendence: 18, transformation: 16, concealment: 14, autonomy: 14, shadow: 12 },
    tier: "living-open", gender: "goddess", tone: "dark",
    sources: ["Classic of Mountains and Seas", "Daoist tradition of the Queen Mother of the West"],
    tagline: "Keeps the peaches of immortality on her far mountain.",
    essence: "Your pattern echoes Xiwangmu's — the Queen Mother of the West, who in early texts had a tiger's teeth and sent plagues, and later became the sovereign keeper of the peaches of immortality on Mount Kunlun. In the tradition she guards the deepest gifts and grants them on her own terms. This pattern holds rare power at a distance and bestows it only on those who truly reach her.",
    shadow: "The keeper of immortality on her distant peak can grow remote and withholding, dispensing her gifts to almost no one.",
  },
  {
    slug: "lu-dongbin", name: "Lü Dongbin", pantheon: "Daoist",
    deltas: { craft: 18, vision: 16, transformation: 16, expression: 14, initiative: 14, adaptability: 10 },
    tier: "living-open", gender: "god", tone: "bright",
    sources: ["Tradition of the Eight Immortals", "Quanzhen Daoist lineage of Lü Dongbin"],
    tagline: "The scholar-swordsman who woke from a lifetime in a dream.",
    essence: "Your pattern echoes Lü Dongbin's — the most famous of the Eight Immortals, a scholar and swordsman who, shown his whole ambitious life and its ruin in a single dream, turned to the Dao and to inner alchemy. In the tradition he brings wisdom, a demon-slaying blade, and a wandering compassion. This pattern joins learning, skill, and a transformative turn toward something deeper.",
    shadow: "The gifted seeker carries a rakish, restless streak; the same charm and appetite that make him human can pull him off the path.",
  },
  {
    slug: "he-xiangu", name: "He Xiangu", pantheon: "Daoist",
    deltas: { care: 18, transcendence: 18, stillness: 16, craft: 12, intuition: 16, autonomy: 12 },
    tier: "living-open", gender: "goddess", tone: "bright",
    sources: ["Tradition of the Eight Immortals", "Daoist hagiography of He Xiangu"],
    tagline: "Ate the mica of the moon and never aged.",
    essence: "Your pattern echoes He Xiangu's — the only woman among the Eight Immortals, who as a girl ate a powdered moonstone in a dream, gave up ordinary food, and gained purity, health, and the power to fly the hills gathering herbs. In the tradition she carries her lotus and a serene, self-possessed grace. This pattern follows an inner purity and a quiet, healing path apart from the crowd.",
    shadow: "The purity that steps away from ordinary life and its appetites can become withdrawal, standing apart rather than among.",
  },
  {
    slug: "lan-caihe", name: "Lan Caihe", pantheon: "Daoist",
    deltas: { expression: 20, adaptability: 16, transcendence: 16, disruption: 14, display: 14, autonomy: 10 },
    tier: "living-open", gender: "other", tone: "bright",
    sources: ["Tradition of the Eight Immortals", "Daoist hagiography of Lan Caihe"],
    tagline: "Sings through the market in one shoe, neither man nor woman.",
    essence: "Your pattern echoes Lan Caihe's — the gender-ambiguous, eccentric immortal who wandered the markets in a tattered blue gown and one bare foot, singing verses about the fleetingness of life and scattering the coins they were given. In the tradition their strangeness is a kind of freedom from convention. This pattern lives outside the usual categories and points, half-clowning, at what really lasts.",
    shadow: "The freedom from convention can tip into aimless drift; the wandering singer never settles to anything or anyone.",
  },
  {
    slug: "laozi", name: "Laozi", pantheon: "Daoist",
    deltas: { stillness: 22, transcendence: 20, vision: 16, analysis: 14, memory: 12, adaptability: 10 },
    tier: "living-open", gender: "god", tone: "bright",
    sources: ["Daodejing", "Daoist deification as Taishang Laojun"],
    tagline: "Teaches the strength of water, yielding and unstoppable.",
    essence: "Your pattern echoes Laozi's — the sage of the Daodejing, later deified as Taishang Laojun, who taught wu wei, effortless action in accord with the Dao, and the quiet power of the soft overcoming the hard. In the tradition he embodies wisdom that acts by not forcing. This pattern moves with things rather than against them and finds real strength in stillness and yielding.",
    shadow: "The wisdom of non-action can slide into passivity or aloof detachment, withdrawing from a world that still needed engaging.",
  },
];

/** Compose a full 24-trait vector from a deity's deltas. */
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

export const DEITIES: DeityGuide[] = DEFS.map((d) => ({
  id: `deity.${d.slug}`,
  name: d.name,
  pantheon: d.pantheon,
  traits: composeVec(d.deltas),
  tier: d.tier,
  gender: d.gender,
  tone: d.tone,
  sources: d.sources,
  tagline: d.tagline,
  essence: d.essence,
  shadow: d.shadow,
  signature: topTraits(d.deltas),
}));

export const DEITY_BY_ID: Record<string, DeityGuide> = Object.fromEntries(
  DEITIES.map((d) => [d.id, d]),
);

export interface DeityMatch {
  guide: DeityGuide;
  score: number;          // 0–100 match strength
  alt: DeityGuide | null; // runner-up, for "also close" copy
}

/**
 * Match a user's trait vector to their resonant deity. Library-agnostic engine —
 * the same decorrelated cosine the archetypes and animal guides use.
 */
export function computeDeity(userTraits: TraitVec): DeityMatch | null {
  const ranked = rankLibrary(userTraits, DEITIES, deityOffset);
  if (ranked.length === 0) return null;
  const top = DEITY_BY_ID[ranked[0].id];
  const alt = ranked[1] ? DEITY_BY_ID[ranked[1].id] : null;
  return { guide: top, score: Math.round(ranked[0].s * 100), alt };
}

export const DEITY_TIER_LABEL: Record<DeityTier, string> = {
  open: "Historical",
  "living-open": "Living tradition",
};
