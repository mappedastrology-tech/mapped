/**
 * Characters — 85 entries (spec §5.3). Public-domain literary and legendary
 * figures, each rendered as a trait vector over the 24-trait space plus content
 * and provenance (source work + author). The engine is library-agnostic: a
 * character is just another vector matched by the same decorrelated cosine the
 * archetypes and animal guides use.
 *
 * Scope: PUBLIC DOMAIN ONLY. Everyone here comes from a work old enough to be
 * freely usable — Homer and the Greek tragedians, Austen and the Brontës,
 * Dickens, Tolstoy and Dostoevsky, Doyle's Holmes, Stoker's Dracula, the
 * Arthurian and folk traditions. No modern or in-copyright characters, and no
 * modern reference layer.
 *
 * Each vector is composed as clamp(50 + delta) around the population-typical 50,
 * with 4–8 salient traits per entry so the 85 spread widely across the space.
 */

import { TraitDeltas, TraitVec, TraitId, TRAIT_ORDER } from "./traits";
import { rankLibrary } from "./engine";
import { characterOffset } from "./calibration";

interface CharacterDef {
  slug: string;
  name: string;
  work: string;                 // source work title (or tradition for legends)
  author: string;               // author, or compiler for legends
  deltas: TraitDeltas;          // salient emphases around the 50 baseline
  sources: string[];            // 1–2 short attributions
  tagline: string;              // ≤ 12 words
  essence: string;
  shadow: string;               // REQUIRED — the real failure mode
}

export interface CharacterGuide {
  id: string;
  name: string;
  work: string;
  author: string;
  traits: TraitVec;
  sources: string[];
  tagline: string;
  essence: string;
  shadow: string;
  signature: TraitId[];         // top 3 emphasised traits
}

const clamp = (n: number) => Math.max(2, Math.min(98, Math.round(n)));

/** Author-supplied deltas (§5.3). Concise, salient — the vector is composed around 50. */
const DEFS: CharacterDef[] = [
  // ————————————————————————————— Greek & classical —————————————————————————————
  {
    slug: "odysseus", name: "Odysseus", work: "the Odyssey", author: "Homer",
    deltas: { adaptability: 24, analysis: 20, endurance: 18, concealment: 12, autonomy: 12, craft: 10, initiative: 10 },
    sources: ["Homer, the Odyssey", "Homer, the Iliad"],
    tagline: "Talks his way home when force can't.",
    essence: "The wandering king of Ithaca, famed as 'the man of many turns' — the one who survives a ten-year voyage home by cunning rather than strength. He lies, disguises himself, endures, and out-thinks gods and monsters alike. You improvise your way through what should be impossible, and you never stop scheming toward the goal.",
    shadow: "The endless cleverness curdles into deceit for its own sake, and pride invites disaster he could have avoided.",
  },
  {
    slug: "penelope", name: "Penelope", work: "the Odyssey", author: "Homer",
    deltas: { loyalty: 26, endurance: 22, craft: 16, concealment: 14, stillness: 12, care: 10 },
    sources: ["Homer, the Odyssey"],
    tagline: "Weaves by day, unpicks by night, waits.",
    essence: "Odysseus's wife, who holds their household together for twenty years while suitors press her to remarry. She stalls them with a famous trick — weaving a shroud by day and secretly unravelling it each night — keeping faith without ever raising a sword. You endure through patience and quiet strategy, and your loyalty is a form of strength.",
    shadow: "Faithful waiting can shade into passivity, deferring your own life indefinitely for someone who may not return.",
  },
  {
    slug: "antigone", name: "Antigone", work: "Antigone", author: "Sophocles",
    deltas: { sovereignty: 24, loyalty: 20, disruption: 18, intensity: 16, initiative: 12, care: 12, order: -14 },
    sources: ["Sophocles, Antigone"],
    tagline: "Buries her brother though the law forbids it.",
    essence: "The Theban princess who defies the king's decree to give her dead brother a burial, choosing sacred duty and family over the state — and death over dishonour. She will not bend, even knowing it will cost her life. You answer to a higher law than the one on the books, and you'd rather break than betray it.",
    shadow: "Absolute conviction leaves no room for compromise or survival; she takes everyone down with her rather than yield an inch.",
  },
  {
    slug: "medea", name: "Medea", work: "Medea", author: "Euripides",
    deltas: { intensity: 26, shadow: 24, disruption: 18, analysis: 14, transformation: 12, autonomy: 12, care: -18 },
    sources: ["Euripides, Medea"],
    tagline: "Betrayed, she answers with total devastation.",
    essence: "A sorceress and princess who helped the hero Jason win the Golden Fleece, then was cast aside for a younger bride. Her revenge is monstrous and complete — she destroys everything he loves, including their own children. You feel wrongs at a scorching pitch and can turn brilliant intelligence toward annihilation.",
    shadow: "Wounded love becomes a fire that consumes the innocent; the revenge costs her the very things she claims to love.",
  },
  {
    slug: "cassandra", name: "Cassandra", work: "Agamemnon", author: "Aeschylus",
    deltas: { vision: 28, intuition: 22, transcendence: 14, expression: 12, display: -8, magnetism: -14 },
    sources: ["Aeschylus, Agamemnon", "Homer, the Iliad"],
    tagline: "Sees the future, doomed never to be believed.",
    essence: "A Trojan princess cursed with true prophecy that no one will ever heed. She foresees catastrophe — the fall of Troy, her own murder — and is dismissed as mad. You perceive what's coming before anyone else does, and the loneliest part is watching it happen anyway.",
    shadow: "The gift becomes torment: knowing the truth and being disbelieved can harden into despair and withdrawal.",
  },
  {
    slug: "achilles", name: "Achilles", work: "the Iliad", author: "Homer",
    deltas: { intensity: 28, initiative: 18, sovereignty: 14, display: 14, embodiment: 12, shadow: 12, stillness: -12 },
    sources: ["Homer, the Iliad"],
    tagline: "The greatest warrior, undone by his own wrath.",
    essence: "The near-invincible Greek champion of the Trojan War, whose rage and wounded pride drive the whole tragedy. He sulks in his tent when slighted, then returns in unstoppable, grief-mad fury. You burn with an intensity that makes you formidable and dangerous in equal measure, chasing glory over long life.",
    shadow: "Pride and volcanic temper override reason; his refusal to let a slight go costs the lives of those he loves.",
  },
  {
    slug: "circe", name: "Circe", work: "the Odyssey", author: "Homer",
    deltas: { craft: 22, transformation: 20, autonomy: 18, magnetism: 14, sovereignty: 12, intuition: 12, loyalty: -8 },
    sources: ["Homer, the Odyssey"],
    tagline: "The witch of the island who turns men to swine.",
    essence: "A goddess-sorceress who lives alone on an island, transforming careless sailors into animals with herb and spell. Powerful, self-possessed, and answerable to no one, she bends the world with craft rather than force. You cultivate your own power in your own domain and reshape what comes to you.",
    shadow: "Living apart with total control, she can grow imperious and cold, treating others as material to be transformed.",
  },
  {
    slug: "scheherazade", name: "Scheherazade", work: "One Thousand and One Nights", author: "Traditional (Arabic/Persian)",
    deltas: { expression: 28, endurance: 16, craft: 16, analysis: 14, care: 12, intuition: 10 },
    sources: ["One Thousand and One Nights (the Arabian Nights) frame tale"],
    tagline: "Tells a story each night to stay alive.",
    essence: "The bride who marries a king in the habit of executing each new wife at dawn — and survives by telling him a story every night, always breaking off at the cliffhanger so he must spare her to hear the end. A thousand and one nights later she has won his heart and saved countless lives. You use narrative and wit as survival, buying time and turning a killer into a listener.",
    shadow: "Always performing for the next reprieve, she risks never resting, never able to simply be rather than perform.",
  },
  {
    slug: "don_quixote", name: "Don Quixote", work: "Don Quixote", author: "Miguel de Cervantes",
    deltas: { vision: 26, transcendence: 16, initiative: 16, display: 12, disruption: 12, analysis: -14, adaptability: -10 },
    sources: ["Miguel de Cervantes, Don Quixote"],
    tagline: "Charges the windmills he insists are giants.",
    essence: "An aging gentleman who reads so many tales of chivalry that he sets off to revive knight-errantry, mistaking windmills for giants and inns for castles. Absurd yet noble, he insists the world be as ideal as his imagination. You chase a grand vision the rest of the world calls delusion, and there's a strange dignity in the tilting.",
    shadow: "Refusing to see reality gets people hurt; idealism untethered from facts becomes its own kind of blindness.",
  },
  {
    slug: "sancho_panza", name: "Sancho Panza", work: "Don Quixote", author: "Miguel de Cervantes",
    deltas: { loyalty: 24, embodiment: 20, care: 14, endurance: 12, adaptability: 10, display: -8, transcendence: -12 },
    sources: ["Miguel de Cervantes, Don Quixote"],
    tagline: "The earthy squire who follows the mad dream anyway.",
    essence: "Don Quixote's plain, proverb-spouting peasant companion, who sees plainly that the giants are windmills and follows his master regardless — for the promised reward, and out of love. He is common sense, appetite, and loyalty made flesh. You keep your feet on the ground while staying faithful to someone reaching past it.",
    shadow: "Grounded practicality can slide into self-interest and timidity, following rather than ever leading.",
  },

  // ————————————————————————————— Shakespeare —————————————————————————————
  {
    slug: "hamlet", name: "Hamlet", work: "Hamlet", author: "William Shakespeare",
    deltas: { analysis: 24, expression: 16, shadow: 18, stillness: 14, concealment: 12, intensity: 12, initiative: -14 },
    sources: ["William Shakespeare, Hamlet"],
    tagline: "Thinks the deed to death before he does it.",
    essence: "The Danish prince commanded by his father's ghost to avenge a murder — who then spends the play interrogating whether, when, and how, brilliant and paralysed at once. His mind is his glory and his trap. You see every angle so clearly that acting feels like a betrayal of thought.",
    shadow: "Endless deliberation becomes paralysis; the delay costs far more lives than a swift, imperfect act would have.",
  },
  {
    slug: "lady_macbeth", name: "Lady Macbeth", work: "Macbeth", author: "William Shakespeare",
    deltas: { initiative: 26, intensity: 22, sovereignty: 20, shadow: 20, magnetism: 12, care: -12, stillness: -18 },
    sources: ["William Shakespeare, Macbeth"],
    tagline: "Steels her husband's hand toward the crown.",
    essence: "The wife who, hungrier for the throne than her hesitating husband, goads him into murdering the king and hardens herself against all softness to do it. Ferociously ambitious and iron-willed, she drives the plot she can't quite survive. You will the outcome so fiercely you override every restraint, your own included.",
    shadow: "The ambition she summons cannot be unsummoned; guilt she denied returns as the madness that destroys her.",
  },
  {
    slug: "prospero", name: "Prospero", work: "The Tempest", author: "William Shakespeare",
    deltas: { craft: 22, sovereignty: 20, analysis: 16, transformation: 14, memory: 12, vision: 12, disruption: -8 },
    sources: ["William Shakespeare, The Tempest"],
    tagline: "The exiled duke who commands the storm.",
    essence: "A deposed duke and master magician marooned on an island, who raises a tempest to bring his enemies within reach — then, holding total power over them, chooses forgiveness and lays his magic down. Learned, controlling, and finally wise. You orchestrate events from behind the scenes and, at your best, know when to release your grip.",
    shadow: "The urge to stage-manage everyone's fate is a hair from tyranny; the control can smother the very people he loves.",
  },
  {
    slug: "puck", name: "Puck", work: "A Midsummer Night's Dream", author: "William Shakespeare",
    deltas: { disruption: 26, adaptability: 20, expression: 16, magnetism: 14, display: 12, stillness: -8, order: -14 },
    sources: ["William Shakespeare, A Midsummer Night's Dream"],
    tagline: "The sprite who mixes up the lovers for fun.",
    essence: "A mischievous fairy — also called Robin Goodfellow — who serves the fairy king and delights in confusion, dosing the wrong sleepers with a love-charm and shrugging, 'what fools these mortals be.' Quick, playful, and gleefully chaotic. You break the pattern to see what happens, and mischief is half your charm.",
    shadow: "Treating other people's hearts as a game, the fun can cause real harm he waves off too lightly.",
  },
  {
    slug: "beatrice", name: "Beatrice", work: "Much Ado About Nothing", author: "William Shakespeare",
    deltas: { expression: 26, autonomy: 18, magnetism: 16, sovereignty: 12, display: 12, intuition: 10, concealment: 8 },
    sources: ["William Shakespeare, Much Ado About Nothing"],
    tagline: "Fences with wit, guards a fierce heart.",
    essence: "The sharp-tongued noblewoman who trades barbs with Benedick and swears off marriage, wittiest voice in the room and fiercely her own person. Beneath the banter runs deep loyalty and a fire for justice. You defend yourself with humour and independence, and it takes real trust to let anyone past the wit.",
    shadow: "The armour of cleverness can keep love and vulnerability at bay long after they've been earned.",
  },
  {
    slug: "iago", name: "Iago", work: "Othello", author: "William Shakespeare",
    deltas: { concealment: 26, analysis: 24, disruption: 22, shadow: 16, expression: 10, loyalty: -18, care: -20 },
    sources: ["William Shakespeare, Othello"],
    tagline: "Smiles as friend while engineering your ruin.",
    essence: "Othello's trusted ensign, who out of resentment and motiveless malignity engineers the general's downfall — poisoning him with insinuation while playing the loyal 'honest Iago.' A masterful, patient manipulator who reads everyone's weakness. He is the danger of a brilliant mind wholly detached from conscience.",
    shadow: "There is nothing but the shadow: a cold intelligence turned entirely to destroying trust and the people who extend it.",
  },

  // ————————————————————————————— Austen —————————————————————————————
  {
    slug: "elizabeth_bennet", name: "Elizabeth Bennet", work: "Pride and Prejudice", author: "Jane Austen",
    deltas: { expression: 22, analysis: 16, autonomy: 16, magnetism: 14, transformation: 12, display: 10, care: 10 },
    sources: ["Jane Austen, Pride and Prejudice"],
    tagline: "Judges quickly, then learns to see clearly.",
    essence: "The sharp, spirited second Bennet daughter who trusts her own read of people, spars with the proud Mr. Darcy, and refuses to marry for anything but love. Her wit is matched by a willingness to be wrong. You form strong first impressions, hold your independence dear, and grow by examining your own mistakes.",
    shadow: "Confidence in her own judgement becomes prejudice; she nearly misreads the person who most deserves her regard.",
  },
  {
    slug: "mr_darcy", name: "Mr. Darcy", work: "Pride and Prejudice", author: "Jane Austen",
    deltas: { sovereignty: 20, concealment: 18, transformation: 14, loyalty: 16, order: 14, care: 12, display: -14 },
    sources: ["Jane Austen, Pride and Prejudice"],
    tagline: "Cold on the surface, constant underneath.",
    essence: "The wealthy, reserved gentleman first mistaken for arrogance, whose stiff pride masks integrity, deep loyalty, and a love he learns to express humbly. He changes quietly and proves himself by deeds rather than charm. You keep your warmth guarded, run deep on principle, and reveal yourself slowly.",
    shadow: "Reserve reads as contempt; the pride that protects him also insults the people he most wants to reach.",
  },
  {
    slug: "emma_woodhouse", name: "Emma Woodhouse", work: "Emma", author: "Jane Austen",
    deltas: { initiative: 20, magnetism: 16, sovereignty: 14, display: 14, transformation: 12, care: 12, concealment: -10 },
    sources: ["Jane Austen, Emma"],
    tagline: "Meddles in matches, mistakes herself for wise.",
    essence: "A clever, well-off young woman who fancies herself a matchmaker and rearranges her friends' romances with cheerful, misguided confidence — until she learns humility and her own heart. Charming, self-assured, and often wrong. You take charge of situations and people, meaning well while overreaching.",
    shadow: "Self-satisfied meddling causes real hurt; her certainty blinds her to her own feelings and others' dignity.",
  },
  {
    slug: "marianne_dashwood", name: "Marianne Dashwood", work: "Sense and Sensibility", author: "Jane Austen",
    deltas: { intensity: 24, expression: 18, transformation: 12, magnetism: 12, embodiment: 10, order: -10, concealment: -14 },
    sources: ["Jane Austen, Sense and Sensibility"],
    tagline: "Feels everything at full volume, hides nothing.",
    essence: "The younger Dashwood sister who lives by feeling — passionate about music, poetry, and love, scornful of restraint, and nearly wrecked by a romance she throws herself into headlong. She learns, painfully, to temper sensibility with sense. You feel intensely and wear your heart openly, for better and worse.",
    shadow: "Unguarded passion leaves her wide open to heartbreak and folly; feeling without discretion nearly destroys her.",
  },

  // ————————————————————————————— The Brontës —————————————————————————————
  {
    slug: "jane_eyre", name: "Jane Eyre", work: "Jane Eyre", author: "Charlotte Brontë",
    deltas: { sovereignty: 22, endurance: 18, autonomy: 16, care: 14, intensity: 12, transcendence: 10, display: -10 },
    sources: ["Charlotte Brontë, Jane Eyre"],
    tagline: "Plain, poor, and unbreakably her own.",
    essence: "An orphaned governess who endures cruelty and hardship without surrendering her conscience or self-respect, refusing to be anyone's possession even at the cost of love. Small and unshowy, she is immovable on principle. You hold your integrity as non-negotiable and would rather walk away whole than stay diminished.",
    shadow: "The fierce self-governance can become rigid pride, refusing help or happiness that doesn't meet her exact terms.",
  },
  {
    slug: "rochester", name: "Rochester", work: "Jane Eyre", author: "Charlotte Brontë",
    deltas: { concealment: 20, intensity: 20, magnetism: 16, shadow: 16, transformation: 14, sovereignty: 10, order: -10 },
    sources: ["Charlotte Brontë, Jane Eyre"],
    tagline: "Brooding master with a locked-away past.",
    essence: "The moody, magnetic master of Thornfield Hall, who loves Jane fiercely while hiding a mad wife in the attic and a life of concealed guilt. Passionate and self-destructive, he is redeemed only by loss. You carry buried history and strong feeling, and secrecy is both your armour and your undoing.",
    shadow: "The hidden past he refuses to face nearly ruins the woman he loves; concealment corrodes everything it touches.",
  },
  {
    slug: "heathcliff", name: "Heathcliff", work: "Wuthering Heights", author: "Emily Brontë",
    deltas: { intensity: 28, shadow: 24, disruption: 16, loyalty: 16, endurance: 12, transcendence: -8, care: -16 },
    sources: ["Emily Brontë, Wuthering Heights"],
    tagline: "Loves and hates with the same wild fire.",
    essence: "An orphan taken in and then degraded, whose obsessive love for Catherine curdles into a decades-long campaign of revenge against everyone who wronged him. Elemental, tormented, and unforgiving. You feel a bond so total it becomes possession, and grief can turn to a scorched-earth need to make others suffer.",
    shadow: "Love twisted into vengeance consumes two generations; he cannot let go, and the holding poisons everything.",
  },
  {
    slug: "catherine_earnshaw", name: "Catherine Earnshaw", work: "Wuthering Heights", author: "Emily Brontë",
    deltas: { intensity: 26, magnetism: 16, autonomy: 16, disruption: 16, embodiment: 12, shadow: 12, order: -14 },
    sources: ["Emily Brontë, Wuthering Heights"],
    tagline: "Wild heart torn between passion and comfort.",
    essence: "The willful, magnetic mistress of Wuthering Heights, who declares 'I am Heathcliff' yet marries for status and standing — a self split between untamed passion and the safe, respectable life. Vivid and destructive, she can't have both and won't choose. You feel divided at the root, wild and worldly at once.",
    shadow: "Refusing to choose between her two loves, she betrays both and herself, and the division kills her.",
  },

  // ————————————————————————————— American 19th c. —————————————————————————————
  {
    slug: "ahab", name: "Ahab", work: "Moby-Dick", author: "Herman Melville",
    deltas: { intensity: 28, sovereignty: 20, shadow: 16, vision: 14, initiative: 14, magnetism: 12, care: -14 },
    sources: ["Herman Melville, Moby-Dick"],
    tagline: "Hunts the white whale into his own grave.",
    essence: "The one-legged whaling captain consumed by a monomaniacal need to kill the white whale that maimed him, dragging his whole crew toward destruction to satisfy it. Charismatic, grand, and doomed. You can fixate on a single defining reckoning until it eclipses reason, safety, and everyone around you.",
    shadow: "The obsession is a black hole; he sacrifices ship, crew, and self to a vengeance that was never survivable.",
  },
  {
    slug: "ishmael", name: "Ishmael", work: "Moby-Dick", author: "Herman Melville",
    deltas: { analysis: 18, expression: 18, adaptability: 14, vision: 14, transcendence: 12, memory: 12, intensity: -8 },
    sources: ["Herman Melville, Moby-Dick"],
    tagline: "Goes to sea to read the whole world.",
    essence: "The wandering narrator who signs onto the doomed whaling voyage out of restlessness and curiosity, and survives to tell it — observing, questioning, and finding meaning in everything from friendship to the color white. 'Call me Ishmael.' You watch and reflect, turning experience into understanding, and outlast the catastrophe by not being at its center.",
    shadow: "The observer's distance can become detachment, narrating life more readily than living inside it.",
  },
  {
    slug: "bartleby", name: "Bartleby", work: "Bartleby, the Scrivener", author: "Herman Melville",
    deltas: { stillness: 26, concealment: 20, disruption: 16, autonomy: 14, shadow: 12, expression: -14, initiative: -18 },
    sources: ["Herman Melville, Bartleby, the Scrivener"],
    tagline: "\"I would prefer not to.\"",
    essence: "A law-office clerk who, one day, quietly declines to do his work — and then anything at all — with the unshakeable, unexplained formula 'I would prefer not to.' His passive refusal baffles and defeats every attempt to move him. You can withdraw consent absolutely, and pure, still refusal turns out to be a strange kind of power.",
    shadow: "The great refusal has no door back out; total withdrawal ends not in freedom but in slow self-erasure.",
  },
  {
    slug: "hester_prynne", name: "Hester Prynne", work: "The Scarlet Letter", author: "Nathaniel Hawthorne",
    deltas: { endurance: 22, sovereignty: 18, care: 16, transformation: 14, concealment: 12, transcendence: 10, display: 8 },
    sources: ["Nathaniel Hawthorne, The Scarlet Letter"],
    tagline: "Wears the scarlet letter and outgrows the shame.",
    essence: "A woman in Puritan Boston forced to wear a scarlet 'A' for adultery, who bears public disgrace with dignity, raises her daughter alone, and refuses to name her child's father. Over time her mark of shame becomes a badge of strength and mercy. You carry judgement without breaking and transmute punishment into quiet moral authority.",
    shadow: "Protecting a secret at her own expense, she shoulders a burden of silence that isolates her for years.",
  },
  {
    slug: "jo_march", name: "Jo March", work: "Little Women", author: "Louisa May Alcott",
    deltas: { expression: 24, autonomy: 16, initiative: 16, craft: 12, care: 12, disruption: 12, order: -8 },
    sources: ["Louisa May Alcott, Little Women"],
    tagline: "The tomboy writer who won't be tamed.",
    essence: "The fiery second March sister — a would-be author who cuts and sells her hair, rejects a comfortable proposal, and insists on a life and a voice of her own in a world with little room for either. Warm, impulsive, and fiercely creative. You chase your work and independence hard, loving your people while refusing to be shrunk to fit.",
    shadow: "The same headstrong temper that fuels her can flare into anger and impatience she later regrets.",
  },

  // ————————————————————————————— Doyle / Holmes —————————————————————————————
  {
    slug: "sherlock_holmes", name: "Sherlock Holmes", work: "the Sherlock Holmes stories", author: "Arthur Conan Doyle",
    deltas: { analysis: 30, autonomy: 22, vision: 12, craft: 12, concealment: 10, loyalty: -12, care: -18 },
    sources: ["Arthur Conan Doyle, A Study in Scarlet and later stories"],
    tagline: "Reads your whole life from your cuffs.",
    essence: "The consulting detective whose ferocious powers of observation and deduction solve what baffles the police — brilliant, aloof, and impatient with ordinary feeling. He treats the mind as the only instrument that matters. You see the pattern everyone else misses, and connection is a distant second to the clarity of the problem.",
    shadow: "The cold primacy of reason leaves people, and his own wellbeing, as afterthoughts; without a case he decays.",
  },
  {
    slug: "watson", name: "Watson", work: "the Sherlock Holmes stories", author: "Arthur Conan Doyle",
    deltas: { loyalty: 26, care: 18, expression: 14, endurance: 14, embodiment: 10, order: 10, autonomy: -10 },
    sources: ["Arthur Conan Doyle, the Sherlock Holmes stories"],
    tagline: "The steadfast friend who makes genius bearable.",
    essence: "The former army doctor who shares Holmes's rooms, chronicles his cases, and supplies the loyalty, decency, and human warmth the detective lacks. Brave, grounded, and unfailingly reliable. You are the dependable partner who anchors a brilliant friend and translates their strangeness into something the rest of us can follow.",
    shadow: "Loyal admiration can slip into living in another's shadow, underrating his own steady worth.",
  },
  {
    slug: "irene_adler", name: "Irene Adler", work: "A Scandal in Bohemia", author: "Arthur Conan Doyle",
    deltas: { autonomy: 20, analysis: 20, magnetism: 18, concealment: 16, display: 12, sovereignty: 12, loyalty: -8 },
    sources: ["Arthur Conan Doyle, A Scandal in Bohemia"],
    tagline: "The woman who outwits Sherlock Holmes.",
    essence: "An opera singer and adventuress — 'the woman' — who is the only person to outsmart Holmes, seeing through his disguise and slipping away with the upper hand. Clever, magnetic, and entirely self-directed. You match sharp minds on their own ground and win by being underestimated.",
    shadow: "Living by wit and self-interest, she keeps everyone at a strategic distance, trusting almost no one.",
  },
  {
    slug: "moriarty", name: "Moriarty", work: "The Final Problem", author: "Arthur Conan Doyle",
    deltas: { analysis: 26, concealment: 22, shadow: 18, sovereignty: 16, order: 14, loyalty: -14, care: -16 },
    sources: ["Arthur Conan Doyle, The Final Problem"],
    tagline: "The Napoleon of crime, unseen at the web's center.",
    essence: "A respected mathematics professor who is secretly the organising genius behind half the crime in London — Holmes's intellectual equal, sitting motionless at the center of a vast criminal web. Cold, brilliant, and patient. You could architect whole systems from the shadows, mind matched only against another great mind.",
    shadow: "The genius is bent wholly toward control and profit; nothing restrains an intellect that recognises no conscience.",
  },

  // ————————————————————————————— Gothic —————————————————————————————
  {
    slug: "dracula", name: "Dracula", work: "Dracula", author: "Bram Stoker",
    deltas: { shadow: 24, magnetism: 22, transformation: 16, concealment: 16, sovereignty: 14, intensity: 12, care: -16 },
    sources: ["Bram Stoker, Dracula"],
    tagline: "Ancient hunger behind an aristocrat's courtesy.",
    essence: "The centuries-old Transylvanian count who preys on the living, seductive and courtly on the surface and utterly predatory beneath. He crosses borders unseen, bends others to his will, and refuses to die. You can be magnetic and controlled in the open while something far older and hungrier moves underneath.",
    shadow: "A charm entirely in service of appetite: he consumes those drawn to him and calls the taking love.",
  },
  {
    slug: "van_helsing", name: "Van Helsing", work: "Dracula", author: "Bram Stoker",
    deltas: { analysis: 22, memory: 16, care: 14, loyalty: 14, transcendence: 12, order: 12, vision: 10 },
    sources: ["Bram Stoker, Dracula"],
    tagline: "The old scholar who knows how to kill a vampire.",
    essence: "The learned Dutch doctor and folklorist who recognises the vampire for what it is and rallies the others to hunt it, marrying modern science to old faith and lore. Wise, tireless, and fatherly to his band. You combine deep knowledge with the resolve to act on it, leading others against what they can barely believe.",
    shadow: "Certainty in his own hard-won knowledge can turn commanding, asking others to trust and sacrifice on his word alone.",
  },
  {
    slug: "mina_harker", name: "Mina Harker", work: "Dracula", author: "Bram Stoker",
    deltas: { memory: 20, care: 18, loyalty: 16, analysis: 14, order: 12, endurance: 12, intuition: 10 },
    sources: ["Bram Stoker, Dracula"],
    tagline: "Assembles the whole case that hunts the count.",
    essence: "The quick, methodical schoolmistress who gathers everyone's scattered journals and telegrams into the single record that lets the hunters track Dracula — brave, brilliant, and warm even as the vampire begins to touch her. She is the mind and heart holding the band together. You organise chaos into understanding and hold people steady with care.",
    shadow: "Selfless devotion to the group can lead her to hide her own peril rather than burden the others.",
  },
  {
    slug: "frankensteins_creature", name: "Frankenstein's Creature", work: "Frankenstein", author: "Mary Shelley",
    deltas: { shadow: 22, intensity: 18, expression: 16, transformation: 14, endurance: 12, embodiment: 10, loyalty: -10 },
    sources: ["Mary Shelley, Frankenstein; or, The Modern Prometheus"],
    tagline: "Made, abandoned, and turned to vengeance by rejection.",
    essence: "The being stitched together and brought to life by Victor Frankenstein, then abandoned in horror — an eloquent, feeling soul who teaches himself to speak and read, longs only to be loved, and is driven to murder by relentless rejection. He is not the mute monster of legend. You know the loneliness of being cast out for what you are, and how longing can sour into rage.",
    shadow: "Denied all tenderness, his wounded need becomes murderous; he answers cruelty by inflicting it.",
  },
  {
    slug: "victor_frankenstein", name: "Victor Frankenstein", work: "Frankenstein", author: "Mary Shelley",
    deltas: { vision: 24, craft: 18, analysis: 16, shadow: 14, initiative: 14, transformation: 12, care: -14 },
    sources: ["Mary Shelley, Frankenstein; or, The Modern Prometheus"],
    tagline: "Creates life, then flees what he has made.",
    essence: "The obsessive young scientist who conquers the secret of animating dead matter — and, the instant his creation opens its eyes, recoils and abandons it, setting a tragedy in motion. Brilliant, ambitious, and morally absent at the crucial moment. You can reach for a world-changing achievement and refuse responsibility for its consequences.",
    shadow: "The refusal to care for what he made is the real crime; ambition without responsibility destroys everyone near him.",
  },
  {
    slug: "jekyll_and_hyde", name: "Jekyll & Hyde", work: "Strange Case of Dr Jekyll and Mr Hyde", author: "Robert Louis Stevenson",
    deltas: { transformation: 26, shadow: 24, concealment: 18, intensity: 14, analysis: 12, disruption: 14, order: -8 },
    sources: ["Robert Louis Stevenson, Strange Case of Dr Jekyll and Mr Hyde"],
    tagline: "One respectable man, one released monster, one body.",
    essence: "The respectable doctor who brews a potion to split off and indulge his darker self, becoming the brutal Mr. Hyde — until the monstrous half grows stronger than the man who freed it. A single divided soul at war with itself. You know the pull of the disowned appetite, and the danger of a shadow you feed in secret.",
    shadow: "The suppressed self, once indulged, takes over; what he tried to control ends by controlling and consuming him.",
  },
  {
    slug: "dorian_gray", name: "Dorian Gray", work: "The Picture of Dorian Gray", author: "Oscar Wilde",
    deltas: { display: 24, shadow: 20, magnetism: 18, concealment: 16, embodiment: 14, transformation: 10, care: -14 },
    sources: ["Oscar Wilde, The Picture of Dorian Gray"],
    tagline: "Stays beautiful while his portrait rots.",
    essence: "A ravishing young man who wishes his painted portrait would age and bear his sins in his place — and gets his wish, pursuing every pleasure and cruelty while his face stays flawless and the hidden picture grows monstrous. Vain, charming, and hollowing out from within. You can make surface beauty a whole philosophy while the real cost accumulates out of sight.",
    shadow: "Every consequence he refuses is stored up unseen; the reckoning arrives all at once and cannot be evaded.",
  },

  // ————————————————————————————— Children's classics —————————————————————————————
  {
    slug: "alice", name: "Alice", work: "Alice's Adventures in Wonderland", author: "Lewis Carroll",
    deltas: { adaptability: 22, analysis: 16, vision: 14, expression: 12, sovereignty: 12, transformation: 10, order: -8 },
    sources: ["Lewis Carroll, Alice's Adventures in Wonderland"],
    tagline: "Keeps her wits in a world with none.",
    essence: "The curious, level-headed girl who tumbles down a rabbit hole into a nonsensical world and meets its absurdities with polite logic, growing and shrinking but never quite losing her composure. She insists on sense in a place that has none. You stay curious and self-possessed amid chaos, questioning the rules that everyone else takes for granted.",
    shadow: "Insisting on her own logic where none applies, she can miss the point of a world that runs on different rules.",
  },
  {
    slug: "the_cheshire_cat", name: "The Cheshire Cat", work: "Alice's Adventures in Wonderland", author: "Lewis Carroll",
    deltas: { concealment: 22, intuition: 16, autonomy: 16, expression: 14, transcendence: 12, adaptability: 12, order: -14 },
    sources: ["Lewis Carroll, Alice's Adventures in Wonderland"],
    tagline: "A grin that fades in and out of nowhere.",
    essence: "The riddling cat who appears and vanishes at will — sometimes leaving only its smile — and answers Alice's questions with unsettling paradox: 'we're all mad here.' Detached, cryptic, and knowing. You come and go on your own terms, seeing the deeper joke and speaking in truths that don't quite resolve.",
    shadow: "Perpetual detachment and riddling can withhold real help, appearing only to unsettle and then dissolve away.",
  },
  {
    slug: "the_red_queen", name: "The Red Queen", work: "Through the Looking-Glass", author: "Lewis Carroll",
    deltas: { sovereignty: 22, order: 18, initiative: 16, intensity: 14, display: 12, care: -12, stillness: -12 },
    sources: ["Lewis Carroll, Through the Looking-Glass"],
    tagline: "Runs full speed just to stay in place.",
    essence: "The imperious chess-queen of the looking-glass world, who lays down rigid rules and famously explains that here you must run as fast as you can merely to keep still. Brisk, commanding, and relentlessly demanding. You set a hard pace and hold others to exacting standards, mistaking constant motion for progress.",
    shadow: "The relentless standard and speed can be tyrannical, exhausting everyone in a race that goes nowhere.",
  },
  {
    slug: "peter_pan", name: "Peter Pan", work: "Peter and Wendy", author: "J. M. Barrie",
    deltas: { initiative: 20, autonomy: 16, disruption: 16, display: 16, magnetism: 14, care: -10, memory: -14 },
    sources: ["J. M. Barrie, Peter and Wendy"],
    tagline: "The boy who refuses to grow up.",
    essence: "The crowing, high-flying boy who leads the Lost Boys in Neverland and will never become an adult — all daring, play, and heedless freedom, unable to hold onto memory or lasting attachment. Joyful and heartbreakingly shallow at once. You can be pure vitality and adventure, at the cost of depth, commitment, and the passage of time.",
    shadow: "The refusal to grow up means he cannot truly love or remember; he forgets the very people who loved him.",
  },
  {
    slug: "wendy", name: "Wendy", work: "Peter and Wendy", author: "J. M. Barrie",
    deltas: { care: 26, loyalty: 16, order: 14, transformation: 12, expression: 12, memory: 10, disruption: -8 },
    sources: ["J. M. Barrie, Peter and Wendy"],
    tagline: "Mothers the Lost Boys, then chooses to grow up.",
    essence: "The eldest Darling child who flies to Neverland and becomes 'mother' to the Lost Boys, telling stories and tending them — and who, unlike Peter, chooses to return home and grow up. Nurturing, responsible, and quietly brave. You care for others instinctively and have the wisdom to embrace change rather than flee it.",
    shadow: "The instinct to mother everyone can slot her into caretaking before she's chosen it, tending others' needs over her own.",
  },
  {
    slug: "captain_hook", name: "Captain Hook", work: "Peter and Wendy", author: "J. M. Barrie",
    deltas: { sovereignty: 18, shadow: 16, intensity: 16, display: 16, order: 12, concealment: 8, care: -12 },
    sources: ["J. M. Barrie, Peter and Wendy"],
    tagline: "The pirate obsessed with a boy and a crocodile.",
    essence: "The elegant, vengeful pirate captain who lost a hand to Peter Pan and the crocodile that swallowed it — now fixated on revenge, fussy about 'good form,' and haunted by the ticking clock in the beast's belly. Menacing, theatrical, and secretly insecure. You can turn a wound into a grand vendetta and dress bitterness in fine manners.",
    shadow: "The whole self organised around a grudge; obsession with revenge and appearances leaves nothing else alive in him.",
  },
  {
    slug: "dorothy_gale", name: "Dorothy Gale", work: "The Wonderful Wizard of Oz", author: "L. Frank Baum",
    deltas: { care: 22, loyalty: 18, initiative: 14, endurance: 14, adaptability: 12, magnetism: 10, shadow: -8 },
    sources: ["L. Frank Baum, The Wonderful Wizard of Oz"],
    tagline: "A Kansas girl who leads misfits home.",
    essence: "The plain-spoken farm girl swept to the land of Oz, who befriends a band of seekers, faces down a witch, and holds fast to one goal: getting home. Kind, brave, and steadying to everyone she gathers. You lead by heart rather than force, drawing the lost together and keeping everyone pointed toward what matters.",
    shadow: "The longing for home can undervalue the extraordinary road she's on and the people found along it.",
  },
  {
    slug: "the_scarecrow", name: "The Scarecrow", work: "The Wonderful Wizard of Oz", author: "L. Frank Baum",
    deltas: { analysis: 22, vision: 14, adaptability: 12, care: 12, craft: 12, loyalty: 12, intensity: -8 },
    sources: ["L. Frank Baum, The Wonderful Wizard of Oz"],
    tagline: "Wants a brain, already the cleverest of the party.",
    essence: "The straw man who joins Dorothy believing he has no brain — yet keeps devising the plans that save the group, proving he was clever all along. Thoughtful, resourceful, and endearingly self-doubting. You underrate your own mind while quietly being the one who solves the problem.",
    shadow: "Chronic self-doubt makes him seek from others the very capability he already has, discounting his own worth.",
  },
  {
    slug: "the_tin_woodman", name: "The Tin Woodman", work: "The Wonderful Wizard of Oz", author: "L. Frank Baum",
    deltas: { care: 26, loyalty: 16, craft: 12, endurance: 12, embodiment: 10, order: 10, shadow: -8 },
    sources: ["L. Frank Baum, The Wonderful Wizard of Oz"],
    tagline: "Seeks a heart, weeps at every small cruelty.",
    essence: "The woodcutter turned to tin, who joins the quest longing for a heart — yet is the tenderest of them all, so gentle he grieves stepping on a beetle and rusts from his own tears. Devoted and kind past his own belief. You ache to feel more while already feeling more deeply than most.",
    shadow: "So afraid of being heartless, he can rust himself with feeling, undone by the tenderness he thinks he lacks.",
  },
  {
    slug: "the_cowardly_lion", name: "The Cowardly Lion", work: "The Wonderful Wizard of Oz", author: "L. Frank Baum",
    deltas: { loyalty: 20, care: 14, transformation: 14, display: 12, endurance: 12, sovereignty: -8, intensity: -14 },
    sources: ["L. Frank Baum, The Wonderful Wizard of Oz"],
    tagline: "Trembles with fear, acts bravely anyway.",
    essence: "The great beast who believes himself a coward and begs the Wizard for courage — yet charges into every danger to protect his friends, discovering that courage is acting despite fear, not the absence of it. Bluster over a soft, frightened core. You may feel afraid at every turn and still be the one who steps forward.",
    shadow: "Convinced he lacks courage, he can talk himself smaller than he is, mistaking felt fear for real weakness.",
  },
  {
    slug: "anne_shirley", name: "Anne Shirley", work: "Anne of Green Gables", author: "L. M. Montgomery",
    deltas: { expression: 26, vision: 20, magnetism: 14, transformation: 12, initiative: 12, care: 10, stillness: -10 },
    sources: ["L. M. Montgomery, Anne of Green Gables"],
    tagline: "An orphan who talks a grey world into color.",
    essence: "The talkative, red-haired orphan mistakenly sent to an elderly brother and sister, who wins over a whole town with her runaway imagination, big feelings, and gift for finding wonder — and 'scope for imagination' — in everything. Dramatic, warm, and irrepressibly hopeful. You reframe the ordinary into the marvellous and carry others up with you.",
    shadow: "The vivid imagination and hot temper can outrun reality, spinning small slights or dreams into oversized drama.",
  },

  // ————————————————————————————— Adventure —————————————————————————————
  {
    slug: "long_john_silver", name: "Long John Silver", work: "Treasure Island", author: "Robert Louis Stevenson",
    deltas: { magnetism: 22, concealment: 20, adaptability: 16, analysis: 14, sovereignty: 12, loyalty: -14, care: -8 },
    sources: ["Robert Louis Stevenson, Treasure Island"],
    tagline: "The charming cook who's leading the mutiny.",
    essence: "The one-legged ship's cook who befriends young Jim Hawkins while secretly captaining the pirates plotting mutiny — genial, quick-witted, and loyal to no one but himself, yet with a real streak of fondness that complicates every betrayal. You can be genuinely likeable and thoroughly self-serving at once, shifting allegiance to whoever holds the advantage.",
    shadow: "Every bond is provisional; his charm serves survival first, and he'll switch sides the moment the odds turn.",
  },
  {
    slug: "jim_hawkins", name: "Jim Hawkins", work: "Treasure Island", author: "Robert Louis Stevenson",
    deltas: { initiative: 22, adaptability: 16, transformation: 14, endurance: 14, loyalty: 12, vision: 10, stillness: -8 },
    sources: ["Robert Louis Stevenson, Treasure Island"],
    tagline: "A boy who grows up on a pirate voyage.",
    essence: "The innkeeper's son who finds a treasure map and ships out on a voyage full of pirates, taking bold initiative — hiding in an apple barrel, retaking the ship single-handed — and coming of age through danger. Resourceful, brave, and quick to learn. You rise to the occasion and grow fastest when thrown in over your head.",
    shadow: "Youthful boldness can shade into rashness, wandering off alone into danger on impulse.",
  },
  {
    slug: "robinson_crusoe", name: "Robinson Crusoe", work: "Robinson Crusoe", author: "Daniel Defoe",
    deltas: { endurance: 26, craft: 20, order: 16, autonomy: 16, sovereignty: 12, analysis: 12, magnetism: -10 },
    sources: ["Daniel Defoe, Robinson Crusoe"],
    tagline: "Builds a whole life alone on a desert island.",
    essence: "The castaway shipwrecked alone for decades, who survives by relentless practicality — farming, building, taming, keeping careful accounts of his days — and remakes a civilisation of one out of nothing. Self-reliant and indefatigable. You meet catastrophe by rolling up your sleeves and constructing order from raw circumstance.",
    shadow: "Total self-sufficiency can turn to isolation and a controlling need to master everything, people included.",
  },
  {
    slug: "gulliver", name: "Gulliver", work: "Gulliver's Travels", author: "Jonathan Swift",
    deltas: { adaptability: 20, analysis: 18, endurance: 14, transformation: 12, vision: 12, memory: 10, magnetism: -8 },
    sources: ["Jonathan Swift, Gulliver's Travels"],
    tagline: "The traveller among giants, tiny men, and talking horses.",
    essence: "The ship's surgeon whose voyages strand him among miniature people, giants, mad philosophers, and rational horses — an observant, adaptable everyman whose journeys become a mirror held up to human folly. He returns changed and disillusioned. You navigate strange worlds by watching closely, and what you see can quietly sour your view of home.",
    shadow: "Endless comparison and disillusion can curdle into misanthropy, preferring any world to the flawed human one.",
  },
  {
    slug: "cyrano", name: "Cyrano de Bergerac", work: "Cyrano de Bergerac", author: "Edmond Rostand",
    deltas: { expression: 30, craft: 18, sovereignty: 14, magnetism: 12, care: 12, concealment: 12, display: -8 },
    sources: ["Edmond Rostand, Cyrano de Bergerac"],
    tagline: "Dazzling wit, self-doubt over an enormous nose.",
    essence: "The brilliant poet-swordsman with a famously large nose, who loves the beautiful Roxane but, believing himself too ugly to be loved, pours his eloquence into wooing her on behalf of a handsomer, tongue-tied rival. Peerless with words and blade, wounded in self-regard. You can give your gift to everyone but the one thing you most want.",
    shadow: "Pride and self-doubt keep him silent about his own heart for a lifetime, sacrificing his happiness to a fear.",
  },

  // ————————————————————————————— Hugo / French —————————————————————————————
  {
    slug: "jean_valjean", name: "Jean Valjean", work: "Les Misérables", author: "Victor Hugo",
    deltas: { care: 26, transformation: 24, endurance: 20, transcendence: 18, concealment: 12, loyalty: 12, shadow: -8 },
    sources: ["Victor Hugo, Les Misérables"],
    tagline: "An ex-convict who spends his life doing good.",
    essence: "A man imprisoned nineteen years for stealing bread, transformed by one act of mercy into a tireless doer of good — a factory owner, a mayor, an adoptive father — forever hiding his past from the law that hunts him. His whole life is one long redemption. You can remake yourself completely and turn a hard past into relentless kindness.",
    shadow: "The saintly self-sacrifice and secrecy can isolate him, hiding his true self even from those he loves most.",
  },
  {
    slug: "javert", name: "Javert", work: "Les Misérables", author: "Victor Hugo",
    deltas: { order: 28, endurance: 16, loyalty: 14, sovereignty: 14, intensity: 14, care: -14, adaptability: -18 },
    sources: ["Victor Hugo, Les Misérables"],
    tagline: "The lawman who cannot forgive a broken law.",
    essence: "The relentless police inspector who pursues Jean Valjean across decades, believing utterly that law is justice and that a criminal can never truly change. Incorruptible, rigid, and finally shattered when mercy proves him wrong. You can hold to duty and principle with iron consistency — and break when reality won't fit the rule.",
    shadow: "Absolute rigidity has no room for mercy or nuance; when his black-and-white world cracks, he cannot survive it.",
  },
  {
    slug: "eponine", name: "Éponine", work: "Les Misérables", author: "Victor Hugo",
    deltas: { loyalty: 24, care: 16, intensity: 14, shadow: 12, endurance: 12, transformation: 10, magnetism: 8 },
    sources: ["Victor Hugo, Les Misérables"],
    tagline: "Loves a boy who loves someone else, and helps them anyway.",
    essence: "A poor young woman raised by scheming innkeepers, hardened by the streets yet capable of fierce, selfless love — she guides the boy she adores to the girl he loves, then dies taking a bullet meant for him. Neglected and brave. You can pour devotion into someone who can't return it, and find a hard dignity in the giving.",
    shadow: "Her love turns into self-erasure; she gives everything, including her life, for someone who barely notices her.",
  },

  // ————————————————————————————— Russian —————————————————————————————
  {
    slug: "raskolnikov", name: "Raskolnikov", work: "Crime and Punishment", author: "Fyodor Dostoevsky",
    deltas: { analysis: 22, shadow: 24, intensity: 18, sovereignty: 14, transformation: 14, concealment: 12, stillness: -10 },
    sources: ["Fyodor Dostoevsky, Crime and Punishment"],
    tagline: "Murders to prove a theory, then unravels.",
    essence: "A destitute former student who talks himself into killing a pawnbroker to test his theory that 'extraordinary' men may transgress ordinary morality — and is then consumed by guilt, feverish self-argument, and a long road toward confession. Proud, tormented, and brilliant. You can reason yourself into a terrible act and be undone by the conscience you tried to argue away.",
    shadow: "Intellect divorced from feeling licenses monstrousness; the theory collapses under a guilt it never accounted for.",
  },
  {
    slug: "sonya", name: "Sonya", work: "Crime and Punishment", author: "Fyodor Dostoevsky",
    deltas: { care: 24, transcendence: 22, endurance: 16, loyalty: 16, transformation: 12, autonomy: -8, display: -12 },
    sources: ["Fyodor Dostoevsky, Crime and Punishment"],
    tagline: "Sells herself to feed her family, keeps her soul.",
    essence: "A gentle young woman forced into prostitution to support her starving family, who holds onto faith and compassion through utter degradation — and whose quiet love and belief finally lead Raskolnikov to confess and change. Meek in manner, unbreakable in spirit. You can endure the worst without losing tenderness, and heal others by refusing to give up on them.",
    shadow: "Boundless self-sacrifice can slide into martyrdom, absorbing suffering rather than ever claiming a life of her own.",
  },
  {
    slug: "prince_myshkin", name: "Prince Myshkin", work: "The Idiot", author: "Fyodor Dostoevsky",
    deltas: { transcendence: 26, care: 22, intuition: 16, magnetism: 12, expression: 10, shadow: -14, sovereignty: -12 },
    sources: ["Fyodor Dostoevsky, The Idiot"],
    tagline: "A holy innocent too good for a cruel world.",
    essence: "An epileptic prince returning to society after years in a sanatorium — so guileless, honest, and compassionate that people take him for an idiot, even as his goodness exposes the vanity and cruelty around him. Christlike and heartbreakingly out of place. You can meet a hard world with total sincerity, and watch that very purity get crushed by it.",
    shadow: "Utter innocence has no defenses; his inability to navigate deceit and passion ends in ruin for those he loves.",
  },

  // ————————————————————————————— Tolstoy —————————————————————————————
  {
    slug: "anna_karenina", name: "Anna Karenina", work: "Anna Karenina", author: "Leo Tolstoy",
    deltas: { intensity: 24, magnetism: 20, disruption: 16, shadow: 16, embodiment: 12, care: 10, order: -14 },
    sources: ["Leo Tolstoy, Anna Karenina"],
    tagline: "Risks everything for a love society forbids.",
    essence: "A radiant, married aristocrat who abandons a loveless marriage for a consuming affair, defying a hypocritical society that will let a man stray but destroy a woman for it. Passionate, alive, and slowly crushed by shame and jealousy. You can feel love and vitality so intensely that you'll sacrifice everything to it — and be punished for wanting more than your role allows.",
    shadow: "Passion untethered from stability curdles into jealousy and despair; the love that frees her also isolates and destroys her.",
  },
  {
    slug: "levin", name: "Levin", work: "Anna Karenina", author: "Leo Tolstoy",
    deltas: { embodiment: 20, transcendence: 16, analysis: 18, endurance: 12, autonomy: 12, care: 12, display: -14 },
    sources: ["Leo Tolstoy, Anna Karenina"],
    tagline: "Finds meaning in the soil and an honest life.",
    essence: "A landowner who shuns fashionable society, works alongside his peasants, and wrestles constantly with questions of faith, love, and how to live rightly — finding his answers in family, labor, and the land rather than theory. Earnest, awkward, and searching. You look for meaning in real work and real bonds, not in status or clever ideas.",
    shadow: "The restless search for meaning can tip into brooding and jealousy, unable to simply rest in the good he already has.",
  },
  {
    slug: "natasha_rostova", name: "Natasha Rostova", work: "War and Peace", author: "Leo Tolstoy",
    deltas: { magnetism: 22, transformation: 14, expression: 16, intensity: 14, embodiment: 14, care: 12, concealment: -10 },
    sources: ["Leo Tolstoy, War and Peace"],
    tagline: "Pure life force who grows through joy and folly.",
    essence: "The vivid, impulsive young countess whose overflowing vitality lights up every room — falling in and out of love, blundering badly, and maturing through joy, betrayal, and grief into a woman of depth. She is life itself, learning. You feel and live at full intensity, and you grow through the mistakes that passion leads you into.",
    shadow: "Impulsive feeling outruns judgement; her openness to the moment can betray her into folly that wounds those who trust her.",
  },

  // ————————————————————————————— Wild / feral —————————————————————————————
  {
    slug: "mowgli", name: "Mowgli", work: "The Jungle Book", author: "Rudyard Kipling",
    deltas: { embodiment: 24, adaptability: 18, initiative: 14, loyalty: 14, intuition: 12, autonomy: 10, order: -12 },
    sources: ["Rudyard Kipling, The Jungle Book"],
    tagline: "Raised by wolves, at home in neither world.",
    essence: "The 'man-cub' raised by a wolf pack in the Indian jungle, taught the law of the wild by a bear and a panther, at ease among animals yet never fully belonging to beast or human world. Instinctive, brave, and between two natures. You move fluidly by instinct and loyalty to your pack, and you carry the ache of not wholly fitting anywhere.",
    shadow: "Belonging fully to neither world, he can feel perpetually caught between them, at home nowhere for long.",
  },
  {
    slug: "bagheera", name: "Bagheera", work: "The Jungle Book", author: "Rudyard Kipling",
    deltas: { care: 20, sovereignty: 16, analysis: 14, loyalty: 14, craft: 14, stillness: 12, disruption: -8 },
    sources: ["Rudyard Kipling, The Jungle Book"],
    tagline: "The black panther who guards and teaches the cub.",
    essence: "The sleek, wise black panther who becomes Mowgli's protector and mentor, pairing deadly skill with patient counsel and knowing when to fight and when to hold back. Elegant, watchful, and deeply loyal. You guide those in your charge with a mix of strength and restraint, teaching more by example than by force.",
    shadow: "The mentor's caution and control can hold a ward too close, slow to let them face the world on their own.",
  },
  {
    slug: "tarzan", name: "Tarzan", work: "Tarzan of the Apes", author: "Edgar Rice Burroughs",
    deltas: { embodiment: 26, endurance: 18, autonomy: 16, adaptability: 14, intuition: 12, sovereignty: 12, order: -10 },
    sources: ["Edgar Rice Burroughs, Tarzan of the Apes"],
    tagline: "The lord of the jungle raised by apes.",
    essence: "An orphaned English nobleman raised by great apes in the African jungle, who becomes its strongest and most capable creature and later straddles the wild and civilised worlds. Physical, instinctive, and self-taught. You master your environment through the body and sheer capability, at home in the wild yet pulled toward the human.",
    shadow: "Trusting instinct and strength over society's rules, he can find the civilised world a cage he never fully accepts.",
  },

  // ————————————————————————————— Legend & folklore —————————————————————————————
  {
    slug: "robin_hood", name: "Robin Hood", work: "English legend", author: "Traditional",
    deltas: { initiative: 20, disruption: 18, care: 16, magnetism: 16, loyalty: 14, craft: 10, order: -12 },
    sources: ["English outlaw ballads (Geste of Robyn Hode and later tradition)"],
    tagline: "Robs the rich, gives to the poor, laughs doing it.",
    essence: "The outlaw of Sherwood Forest who defies a corrupt authority to steal from the rich and give to the poor, leading a band of merry men with wit, archery, and rough justice. Bold, generous, and rebellious. You take from the powerful on behalf of the powerless and build fierce loyalty by fighting for the underdog.",
    shadow: "Righteous rebellion can slide toward vigilantism, deciding for himself whose rules are worth breaking.",
  },
  {
    slug: "maid_marian", name: "Maid Marian", work: "English legend", author: "Traditional",
    deltas: { loyalty: 20, autonomy: 16, care: 14, initiative: 14, craft: 10, sovereignty: 10, display: -8 },
    sources: ["English Robin Hood tradition (May Games and later ballads)"],
    tagline: "The noblewoman who chooses the outlaw's cause.",
    essence: "Robin Hood's beloved, a noblewoman who casts her lot with the outlaws — in many tellings a skilled fighter in her own right, matching Robin's courage and sharing his fight for the common folk. Spirited, capable, and true. You give your loyalty to a cause rather than a comfort, and hold your own beside anyone.",
    shadow: "Devotion to a shared cause can subordinate her own story to her partner's, cast as loyal companion more than lead.",
  },
  {
    slug: "arthur", name: "Arthur (King Arthur)", work: "Arthurian legend", author: "Traditional",
    deltas: { sovereignty: 24, order: 18, care: 14, loyalty: 14, vision: 12, transcendence: 10, disruption: -10 },
    sources: ["Arthurian tradition (Geoffrey of Monmouth; Malory, Le Morte d'Arthur)"],
    tagline: "The rightful king who dreams of a just realm.",
    essence: "The once and future king who draws the sword from the stone and founds a fellowship of knights around a Round Table, striving to replace might-makes-right with justice and honour. Noble, idealistic, and finally betrayed by those closest to him. You lead by ideal and build fellowships around a shared code — and stake everything on people living up to it.",
    shadow: "The dream of perfect justice is blind to the flaws of those he trusts; the ideal shatters on human betrayal.",
  },
  {
    slug: "guinevere", name: "Guinevere", work: "Arthurian legend", author: "Traditional",
    deltas: { magnetism: 20, concealment: 14, intensity: 14, care: 14, display: 12, transformation: 10, loyalty: -8 },
    sources: ["Arthurian tradition (Chrétien de Troyes; Malory, Le Morte d'Arthur)"],
    tagline: "The queen whose forbidden love breaks a kingdom.",
    essence: "Arthur's queen, radiant and beloved, whose secret love for the great knight Lancelot pulls her between devotion and desire — and whose affair helps bring the whole Round Table crashing down. Gracious, passionate, and torn. You can be caught between loyalty and love, and the pull of the heart can carry a terrible cost.",
    shadow: "Divided between king and lover, she keeps a secret whose exposure ruins the very fellowship she was meant to grace.",
  },
  {
    slug: "lancelot", name: "Lancelot", work: "Arthurian legend", author: "Traditional",
    deltas: { craft: 20, intensity: 16, shadow: 14, display: 14, transformation: 12, loyalty: 12, order: -8 },
    sources: ["Arthurian tradition (Chrétien de Troyes; Malory, Le Morte d'Arthur)"],
    tagline: "The best knight, ruined by his best friend's wife.",
    essence: "The greatest knight of the Round Table, peerless in arms and devoted to Arthur — yet consumed by a forbidden love for the queen that betrays his king and his own ideals. Brilliant, passionate, and tragically divided. You can be exceptional at what you do and undone by the one loyalty you cannot honor.",
    shadow: "The gap between his ideal self and his forbidden passion tears him apart, and his fall drags a kingdom down with him.",
  },
  {
    slug: "morgan_le_fay", name: "Morgan le Fay", work: "Arthurian legend", author: "Traditional",
    deltas: { craft: 22, shadow: 20, concealment: 16, autonomy: 14, transformation: 14, sovereignty: 12, care: -12 },
    sources: ["Arthurian tradition (Geoffrey of Monmouth; Malory, Le Morte d'Arthur)"],
    tagline: "The sorceress-queen who schemes against Camelot.",
    essence: "A powerful enchantress and Arthur's half-sister, versed in magic and healing, who in many tellings works to undermine him and expose the court's hypocrisies. Cunning, autonomous, and hard to pin as villain or wronged woman. You wield hidden power and hold your own agenda, moving against those who underestimate you.",
    shadow: "Grievance and hunger for power turn her gifts toward destruction, plotting against kin she can't forgive.",
  },
  {
    slug: "merlin", name: "Merlin", work: "Arthurian legend", author: "Traditional",
    deltas: { vision: 24, craft: 18, transcendence: 16, analysis: 14, memory: 14, concealment: 10, display: -8 },
    sources: ["Arthurian tradition (Geoffrey of Monmouth; Malory, Le Morte d'Arthur)"],
    tagline: "The wizard who sees the whole story unfolding.",
    essence: "The prophet-magician who guides Arthur to the throne and shapes the destiny of Camelot, knowing the future yet unable to escape his own — undone in the end by a love that traps him. Wise, powerful, and lonely with foreknowledge. You can see far ahead and shape events from the wings, and still be blindsided by your own heart.",
    shadow: "Even total foresight can't save him from his one blind spot; knowing the future doesn't mean escaping it.",
  },
  {
    slug: "gawain", name: "Gawain", work: "Sir Gawain and the Green Knight", author: "Traditional",
    deltas: { loyalty: 22, order: 16, transformation: 14, endurance: 14, care: 12, sovereignty: 10, shadow: -8 },
    sources: ["Sir Gawain and the Green Knight (anonymous Middle English)"],
    tagline: "A knight who keeps his word to a beheading game.",
    essence: "The courteous young knight who accepts a monstrous Green Knight's challenge — one blow now for one returned a year later — and journeys to keep his word even to his own death, tested along the way on honesty and courage. Chivalrous, earnest, and humbled by a single small failing. You hold to your word and your code, and grow through honestly facing where you fell short.",
    shadow: "The exacting code makes one human lapse feel like total disgrace; his honor can turn to harsh self-reproach.",
  },
  {
    slug: "mulan", name: "Mulan (legend)", work: "the Ballad of Mulan", author: "Traditional (Northern Wei era)",
    deltas: { loyalty: 24, endurance: 18, concealment: 16, initiative: 14, transformation: 12, care: 12, display: -10 },
    sources: ["the Ballad of Mulan (Ballad of Mulan / Mulan shi)"],
    tagline: "Takes her father's place at war, in disguise.",
    essence: "The legendary Chinese daughter who disguises herself as a man to serve in the army in place of her aging father, fights with distinction for years, and then quietly returns home to her family, declining reward. Dutiful, brave, and self-effacing. You'll shoulder a burden meant for someone you love, prove yourself in silence, and ask for nothing back.",
    shadow: "Hiding her true self to serve can mean a long erasure of her own identity beneath the role she takes on.",
  },
  {
    slug: "sun_wukong", name: "Sun Wukong", work: "Journey to the West", author: "Wu Cheng'en, Journey to the West",
    deltas: { disruption: 24, transformation: 18, initiative: 18, autonomy: 16, display: 14, sovereignty: 12, order: -16 },
    sources: ["Wu Cheng'en, Journey to the West"],
    tagline: "The Monkey King who storms heaven itself.",
    essence: "The Monkey King, born from stone and gifted with immense power and seventy-two transformations, who rebels against heaven so brazenly that the Buddha must pin him under a mountain — then earns redemption escorting a monk on a sacred quest. Irrepressible, cocky, and mighty. You can bend rules and reality alike, and your greatest growth is learning to serve something larger.",
    shadow: "Boundless pride and defiance provoke disaster; his gifts run wild until discipline is forced upon him.",
  },
  {
    slug: "baba_yaga", name: "Baba Yaga", work: "Slavic folklore", author: "Traditional",
    deltas: { shadow: 24, sovereignty: 18, autonomy: 16, transformation: 16, concealment: 12, craft: 12, care: -12 },
    sources: ["Slavic folk tradition (recorded by Afanasyev and others)"],
    tagline: "The witch in the hut on chicken legs.",
    essence: "The fearsome old witch of Slavic tale who lives deep in the forest in a hut that stands on chicken legs, flying in a mortar — she may devour the unworthy or richly reward the brave and clever who come to her. Ambiguous, wild, and utterly her own. You are a keeper of the threshold: dangerous to the false, generous to those who face you honestly.",
    shadow: "The same power that tests and rewards can just as easily devour; she answers to no one and spares no one who fails her.",
  },

  // ————————————————————————————— Dickens —————————————————————————————
  {
    slug: "scrooge", name: "Scrooge", work: "A Christmas Carol", author: "Charles Dickens",
    deltas: { transformation: 22, order: 20, shadow: 16, autonomy: 16, memory: 12, care: -16, magnetism: -10 },
    sources: ["Charles Dickens, A Christmas Carol"],
    tagline: "A miser remade in a single haunted night.",
    essence: "The cold, money-hoarding old miser who scorns Christmas and human warmth — until three spirits force him to confront his past, present, and lonely future, and he wakes transformed into a generous, joyful man. The classic parable of the closed heart cracked open. You may harden around scarcity and control, yet carry the capacity for total change.",
    shadow: "Left unchallenged, the walls of thrift and self-protection wall out every warmth, until only a cold, lonely end remains.",
  },
  {
    slug: "miss_havisham", name: "Miss Havisham", work: "Great Expectations", author: "Charles Dickens",
    deltas: { shadow: 22, stillness: 22, memory: 18, intensity: 12, concealment: 12, care: -14, transformation: -14 },
    sources: ["Charles Dickens, Great Expectations"],
    tagline: "Frozen in the moment she was jilted, forever.",
    essence: "The wealthy recluse jilted at the altar, who stops every clock at the moment of betrayal and grows old in her yellowed wedding dress amid the rotting feast — raising her ward to break men's hearts as revenge on all men. Time-stopped, vengeful, and hollow. You know the danger of building an entire life around a single old wound.",
    shadow: "Refusing to move past her heartbreak, she poisons her own life and warps a child into a weapon of her bitterness.",
  },
  {
    slug: "pip", name: "Pip", work: "Great Expectations", author: "Charles Dickens",
    deltas: { transformation: 20, vision: 18, care: 14, loyalty: 12, endurance: 12, expression: 10, sovereignty: -8 },
    sources: ["Charles Dickens, Great Expectations"],
    tagline: "A poor boy chasing gentility learns what matters.",
    essence: "The orphaned blacksmith's boy who comes into a mysterious fortune and 'great expectations,' grows ashamed of his humble origins as he chases the life of a gentleman, and finally learns that worth lies in loyalty and love, not status. Aspiring, snobbish, and ultimately humbled. You can outgrow the people who raised you, then find your way back to gratitude.",
    shadow: "Aspiration curdles into snobbery; he neglects the humble people who love him while chasing a hollow ideal.",
  },
  {
    slug: "sydney_carton", name: "Sydney Carton", work: "A Tale of Two Cities", author: "Charles Dickens",
    deltas: { transcendence: 24, transformation: 18, shadow: 16, care: 14, intensity: 12, concealment: 10, display: -10 },
    sources: ["Charles Dickens, A Tale of Two Cities"],
    tagline: "A wasted man redeemed by one final sacrifice.",
    essence: "A brilliant but dissipated, self-loathing lawyer who has thrown his gifts away — until he gives his life in another man's place at the guillotine, out of love, in 'a far, far better thing' than he has ever done. Cynical outside, capable of the ultimate grace. You may hold a hidden nobility beneath weariness and waste, and find meaning in a single decisive act.",
    shadow: "Self-contempt keeps him squandering his gifts for a lifetime; only in death does he value what he could have lived.",
  },

  // ————————————————————————————— Goethe —————————————————————————————
  {
    slug: "faust", name: "Faust", work: "Faust", author: "Johann Wolfgang von Goethe",
    deltas: { vision: 24, analysis: 18, transformation: 16, shadow: 16, initiative: 12, transcendence: 12, stillness: -12 },
    sources: ["Johann Wolfgang von Goethe, Faust"],
    tagline: "Trades his soul for boundless knowledge and experience.",
    essence: "The brilliant, restless scholar who has exhausted human learning and, still unsatisfied, wagers his soul to the devil for limitless experience and striving. He can never be content to rest in any single moment. You are driven by an insatiable hunger to know and to reach further, and that striving is both your glory and your peril.",
    shadow: "The refusal to ever be satisfied can trample everything in its path; ambition becomes a bargain that damns him.",
  },
  {
    slug: "mephistopheles", name: "Mephistopheles", work: "Faust", author: "Johann Wolfgang von Goethe",
    deltas: { shadow: 22, analysis: 20, disruption: 18, concealment: 18, expression: 14, magnetism: 12, care: -16 },
    sources: ["Johann Wolfgang von Goethe, Faust"],
    tagline: "The witty devil who negates all he touches.",
    essence: "The urbane, sardonic devil who wagers for Faust's soul — 'the spirit that always negates,' clever and charming, tempting through cynicism and delivering exactly what's asked for with a twist. Sharp, seductive, and coldly amused by human striving. You can see through every ideal to its flaw, and turn wit into a weapon that undermines whatever it meets.",
    shadow: "Pure negation with nothing to build; his brilliance exists only to corrupt, seduce, and unmake the good in others.",
  },
];

/** Compose a full 24-trait vector from a character's deltas. */
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

export const CHARACTERS: CharacterGuide[] = DEFS.map((d) => ({
  id: `character.${d.slug}`,
  name: d.name,
  work: d.work,
  author: d.author,
  traits: composeVec(d.deltas),
  sources: d.sources,
  tagline: d.tagline,
  essence: d.essence,
  shadow: d.shadow,
  signature: topTraits(d.deltas),
}));

export const CHARACTER_BY_ID: Record<string, CharacterGuide> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
);

export interface CharacterMatch {
  guide: CharacterGuide;
  score: number;             // 0–100 match strength
  alt: CharacterGuide | null; // runner-up, for "also close" copy
}

/**
 * Match a user's trait vector to their Character. Library-agnostic engine — the
 * same decorrelated cosine the archetypes and animal guides use. Mirrors
 * computeAnimalGuide: rank by the calibrated score, return the top match plus a
 * runner-up, and report the raw similarity as the displayed match strength.
 */
export function computeCharacter(userTraits: TraitVec): CharacterMatch | null {
  const ranked = rankLibrary(userTraits, CHARACTERS, characterOffset);
  if (ranked.length === 0) return null;
  const top = CHARACTER_BY_ID[ranked[0].id];
  const alt = ranked[1] ? CHARACTER_BY_ID[ranked[1].id] : null;
  return { guide: top, score: Math.round(ranked[0].s * 100), alt };
}
