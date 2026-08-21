# Mapped — Art Brief: Animals, Characters & Renamed Archetypes

**Companion to:** *Mapped — Archetype Art Generation Plan* (the 96 archetype plates).
Same painted-plate style, same workflow, same output spec. This brief covers the
**three sets still needing art**:

| Set | Count | Status |
|---|---|---|
| Animal Guides | 72 | none generated |
| Characters | 85 | none generated |
| Renamed archetypes | 8 | replacing plates whose subject no longer matches the name |
| **Total** | **165** | |

---

## 1. Use the same setup as the archetypes

Everything in §1–§4 of the Archetype Art Generation Plan applies unchanged:
the Style Block, the Negative prompt, the "natural colour per subject" rule, and
the anchor-image workflow (re-attach the anchor at the start of every new chat;
a fresh chat every 8–12 images).

**Re-use The Anvil as the style anchor** so all four sets stay one collection.

### The one addition for these sets

The archetypes are objects and forces. Animals are living subjects, and
characters are people — which the style block explicitly forbids depicting. So:

- **Animals** — paint the animal as a natural-history plate: whole body, one
  clear pose, no habitat, no ground plane, floating on white exactly like the
  archetypes. Anatomically accurate, not stylised or cute.
- **Characters** — **never depict the person.** Each character is represented by
  a single emblematic *object* from their story (Hamlet is the skull; Ahab is
  the whalebone leg). This keeps the whole library inside the established style,
  avoids faces entirely, and sidesteps any likeness question. The object lines
  below are written to be unmistakable to anyone who knows the work and
  intriguing to anyone who doesn't.

**Append to the Negative prompt for characters:** `people, faces, portraits,
figures, human hands, costume on a body`.

---

## 2. Output spec (unchanged)

| | |
|---|---|
| Format | Square 1:1, generated 1024×1024 |
| Delivery | PNG on **pure white** — do not ask for transparency |
| Naming | exactly the **File** column below (`animal.wolf.png`, `character.hamlet.png`, `arch.root.kindler.png`) |
| Keying | run `scripts/archetype-art/keyout.py` — it removes the white ground, keeps pale subjects, and clears enclosed gaps |

> **Filenames are load-bearing.** They map straight onto the library IDs already
> in the code, so a correctly-named file drops in with no further work. A
> mismatched name is the only way this goes wrong.

---

## 3. Renamed archetypes — 8 new plates

**Why the renames.** The original naming rule was *"The" + one concrete noun — a
force, an object, or a piece of the physical world*. That rule reliably produces
objects, and an object is not an archetype: "you are The Solder" doesn't land.
The test each name now has to pass is **"can you say *you are The X* and have it
read as an identity?"** — which The Wildfire passes (a force with agency) and
The Confluence fails (a geographic feature).

27 names were changed in two moves:

1. **Objects → the figure who uses them** (14). The loom plate is now **The
   Weaver**, the blueprint is **The Architect**, the ferry is **The Ferryman**.
   *These keep their existing plates* — the tool is exactly what that figure is
   pictured with, so the art was already right; only the name was wrong.
   Cartographer · Joiner · Librarian · Healer · Spinner · Weaver · Sentinel ·
   Prospector · Journeyman · Sculptor · Architect · Ferryman · Chronicler ·
   Archivist.

2. **Mundane or passive nouns → beings and roles** (13). Five of these also keep
   their plates (**The Vessel** ← Basin, **The Mason** ← Mortar, **The Miner** ←
   Shaft, **The Tinker** ← Solder, **The Forger** ← Scrap). The remaining **8
   need new art** — listed below.

Everything else was already carrying real charge (The Vault, The Undertow, The
Mask, The Cuckoo, The Marrow) and was left alone.

> One name was withdrawn on cultural grounds: an earlier draft used *The Hoodoo*
> for stone/trickster. Hoodoo is a living African-American spiritual tradition,
> so borrowing it as a personality label is exactly what the cultural gate
> forbids elsewhere in this app. It is now **The Drifter**.

### Replace these 8

| File | New name | Was | Subject | Palette |
|---|---|---|---|---|
| `arch.flame.mender.png` | **The Lamplighter** | The Coal | a brass lamplighter's pole with its small flame lit, leaning against nothing | brass, flame gold, night blue |
| `arch.tide.builder.png` | **The Harbour** | The Channel | a stone harbour arm curving around still water, mooring rings set into it | wet stone grey, harbour green, iron |
| `arch.wind.kindler.png` | **The Muse** | The Draft | a lyre with one string still vibrating, laid on nothing | olive wood, gut string cream, bronze |
| `arch.stone.trickster.png` | **The Drifter** | The Sand | a wind-carved dune ridge with its crest smoking away in the wind | sand ochre, shadow tan, pale sky |
| `arch.root.mender.png` | **The Alchemist** | The Loam | a glass alembic and retort, dark matter turning to gold at the neck | glass green, gold, soot black |
| `arch.thread.mender.png` | **The Mother** | The Stitch | a hand-carved wooden cradle, rockers worn smooth, a folded blanket inside | warm oak, wool cream, soft shadow |
| `arch.thread.trickster.png` | **The Changeling** | The Tangle | a carved wooden poppet left in a nest of straw where a child should be | pale birch, straw gold, grey |
| `arch.wheel.builder.png` | **The Clockmaker** | The Calendar | an open clock movement, escapement and gear train exposed, mid-tick | brass, steel blue, jewel red |

---

## 4. Animal Guides — 72 plates

Whole animal, one clear pose, floating on white. No habitat, no ground, no cast shadow.

### Land mammals (22)

| File | Animal | Subject | Palette |
|---|---|---|---|
| `animal.wolf.png` | **Wolf** | a wolf standing square, head slightly lowered, ears forward, winter coat dense | slate grey, cream underfur, charcoal |
| `animal.bear.png` | **Bear** | a brown bear seated upright on its haunches, forepaws loose | umber brown, warm tan, black |
| `animal.fox.png` | **Fox** | a red fox mid-step with brush low and head turned back over its shoulder | rust red, cream throat, black stockings |
| `animal.stag.png` | **Stag** | a red stag in full antler, head raised in profile | chestnut brown, bone antler, moss |
| `animal.horse.png` | **Horse** | a horse at a collected trot, mane lifting, seen from the side | bay brown, black mane, dust |
| `animal.lion.png` | **Lion** | a male lion lying couchant, head up, mane full | tawny gold, dark mane, sand |
| `animal.tiger.png` | **Tiger** | a tiger walking directly toward the viewer, shoulders rolling | burnt orange, black stripe, cream |
| `animal.jaguar.png` | **Jaguar** | a jaguar crouched low on a branch stub, rosettes clear | deep gold, black rosette, shadow green |
| `animal.leopard.png` | **Leopard** | a leopard draped along a bough, tail hanging | pale gold, black rosette, bark grey |
| `animal.elephant.png` | **Elephant** | an elephant in profile, ears spread, trunk curled inward | grey, dust ochre, ivory |
| `animal.boar.png` | **Boar** | a wild boar with head low and tusks forward, bristles raised | blackish brown, tusk ivory, mud |
| `animal.hare.png` | **Hare** | a hare sitting upright, ears erect, hind legs coiled | sandy brown, cream belly, black ear tip |
| `animal.rat.png` | **Rat** | a rat upright on its hind legs, forepaws together, whiskers spread | brown-grey, pink tail, cream |
| `animal.ox.png` | **Ox** | an ox standing yoked and still, head heavy | dun brown, horn cream, iron yoke |
| `animal.ram.png` | **Ram** | a ram in profile with full curled horns | off-white fleece, horn amber, slate |
| `animal.dog.png` | **Dog** | a dog seated in profile, alert, one ear tipped | tan, white blaze, black |
| `animal.cat.png` | **Cat** | a cat seated with tail curled around its feet, eyes half closed | charcoal, amber eye, cream |
| `animal.monkey.png` | **Monkey** | a macaque perched, one hand raised, looking sidelong | grey-brown, pink face tone, umber |
| `animal.otter.png` | **Otter** | an otter floating on its back, forepaws on its chest | dark brown, wet-sheen tan, river grey |
| `animal.badger.png` | **Badger** | a badger low to the ground, striped mask forward | black and white, earth brown, grey |
| `animal.bat.png` | **Bat** | a bat hanging folded, wings wrapped, head visible | dark umber, membrane grey, black |
| `animal.whale.png` | **Whale** | a humpback whale, long pectoral fin extended, seen from the side | deep blue-grey, barnacle white, ocean |

### Birds (20)

| File | Animal | Subject | Palette |
|---|---|---|---|
| `animal.raven.png` | **Raven** | a raven in profile, feathers glossed, beak heavy | blue-black, oil sheen, slate |
| `animal.crow.png` | **Crow** | a crow perched with head cocked, eye bright | matte black, grey sheen, bone beak |
| `animal.owl.png` | **Owl** | a barn owl facing forward, wings folded, gaze level | buff gold, heart-face white, charcoal |
| `animal.eagle.png` | **Eagle** | a golden eagle, wings half open, head turned in profile | dark brown, golden nape, hooked amber beak |
| `animal.hawk.png` | **Hawk** | a hawk perched, breast barred, eye fixed forward | russet brown, cream barring, yellow cere |
| `animal.falcon.png` | **Falcon** | a peregrine falcon stooping, wings swept back, in a steep dive | slate blue, cream barred breast, black moustache |
| `animal.vulture.png` | **Vulture** | a vulture standing hunched, bare head lowered, ruff high | dusty black, bare pink-grey head, ruff white |
| `animal.crane.png` | **Crane** | a crane standing on one leg, neck curved, plumes trailing | white, black neck, crimson crown |
| `animal.heron.png` | **Heron** | a grey heron motionless in shallows, neck folded | blue-grey, white crown, black plume |
| `animal.swan.png` | **Swan** | a mute swan, neck curved, wings slightly raised | white, orange bill, black knob |
| `animal.goose.png` | **Goose** | a goose in mid-call, neck extended, wings half lifted | grey-brown, white cheek, black neck |
| `animal.peacock.png` | **Peacock** | a peacock with its train fully fanned, seen from the front | iridescent teal, eye-spot gold, indigo |
| `animal.rooster.png` | **Rooster** | a rooster crowing, head thrown back, comb high | copper red, black sickle tail, scarlet comb |
| `animal.dove.png` | **Dove** | a dove alighting, wings cupped, feet reaching | soft white, pearl grey, coral foot |
| `animal.hummingbird.png` | **Hummingbird** | a hummingbird hovering, wings blurred, bill to an unseen flower | emerald green, ruby gorget, warm grey |
| `animal.magpie.png` | **Magpie** | a magpie in profile, long tail angled, wing patch bright | black and white, blue-green iridescence |
| `animal.blackbird.png` | **Blackbird** | a blackbird singing, bill open, perched | matte black, orange bill, grey branch |
| `animal.wren.png` | **Wren** | a wren with tail cocked upright, mid-scold | warm brown, barred wing, cream throat |
| `animal.kingfisher.png` | **Kingfisher** | a kingfisher perched over water, bill down, poised to dive | electric blue, chestnut breast, black bill |
| `animal.nightingale.png` | **Nightingale** | a nightingale singing on a bare twig at dusk | dun brown, rufous tail, dusk grey |

### Reptiles & aquatic (14)

| File | Animal | Subject | Palette |
|---|---|---|---|
| `animal.snake.png` | **Snake** | a snake coiled once with head raised, tongue extended | olive green, dark banding, cream belly |
| `animal.tortoise.png` | **Tortoise** | a tortoise walking, head extended from a domed shell | shell umber, scute gold, leathery grey |
| `animal.crocodile.png` | **Crocodile** | a crocodile at the waterline, only eyes and snout ridge above | olive black, scute grey, water |
| `animal.frog.png` | **Frog** | a frog mid-leap, legs extended | leaf green, cream belly, wet sheen |
| `animal.lizard.png` | **Lizard** | a lizard on warm rock, one foot lifted, tail curved | sand brown, dark banding, stone grey |
| `animal.chameleon.png` | **Chameleon** | a chameleon gripping a thin branch, tail coiled, eye turned | leaf green, ochre, turquoise |
| `animal.salmon.png` | **Salmon** | a salmon leaping clear of white water | silver, rose flank, spray white |
| `animal.octopus.png` | **Octopus** | an octopus with arms curling outward, mantle raised | russet red, suckers cream, deep blue |
| `animal.crab.png` | **Crab** | a crab facing forward, claws raised wide | shell orange-red, cream underside, wet sand |
| `animal.shark.png` | **Shark** | a shark in level cruise, seen from the side | steel grey, white belly, deep blue |
| `animal.dolphin.png` | **Dolphin** | a dolphin breaking the surface in an arc | slate blue-grey, pale belly, foam white |
| `animal.seal.png` | **Seal** | a seal hauled out, head lifted, whiskers spread | mottled grey, wet sheen, cream |
| `animal.eel.png` | **Eel** | an eel curved into an S, head forward, body sinuous | olive black, yellow belly, dark water |
| `animal.koi.png` | **Koi** | a koi swimming upward, fins trailing | white, vermilion, black sumi markings |

### Insects & arthropods (10)

| File | Animal | Subject | Palette |
|---|---|---|---|
| `animal.spider.png` | **Spider** | an orb spider at the centre of its finished web | amber brown, black banding, silver silk |
| `animal.bee.png` | **Bee** | a honeybee in flight, pollen baskets loaded | amber gold, black band, pollen yellow |
| `animal.butterfly.png` | **Butterfly** | a butterfly with wings fully open, seen from above | monarch orange, black vein, white spot |
| `animal.moth.png` | **Moth** | a large moth at rest, wings spread flat, feathered antennae | dusty grey, ochre eyespot, cream |
| `animal.ant.png` | **Ant** | an ant carrying a leaf fragment many times its size | dark red-brown, leaf green, black |
| `animal.scarab.png` | **Scarab** | a scarab beetle rolling a sphere of earth | iridescent blue-black, earth brown, gold sheen |
| `animal.dragonfly.png` | **Dragonfly** | a dragonfly with all four wings extended, seen from above | steel blue, glassy wing, black |
| `animal.scorpion.png` | **Scorpion** | a scorpion with tail arched forward over its back | sand tan, dark carapace, amber |
| `animal.cicada.png` | **Cicada** | a cicada clinging to bark beside its split empty shell | olive green, amber wing, bark brown |
| `animal.mantis.png` | **Mantis** | a praying mantis upright, forelegs folded, head turned | leaf green, cream underside, black eye |

### Composite & mythic (6)

| File | Animal | Subject | Palette |
|---|---|---|---|
| `animal.dragon.png` | **Dragon (Eastern)** | an Eastern dragon coiling through cloud, whiskered, four-clawed | jade green, gold horn, cloud white |
| `animal.phoenix.png` | **Phoenix** | a phoenix rising from a nest of flame, wings spreading | flame gold, ember red, ash grey |
| `animal.griffin.png` | **Griffin** | a griffin standing guard, eagle head and lion body, wings folded | eagle gold, lion tawny, bronze |
| `animal.sphinx.png` | **Sphinx** | a seated sphinx in stone, wings folded along its flanks | limestone cream, shadow grey, gold leaf |
| `animal.unicorn.png` | **Unicorn** | a unicorn standing alert in profile, single spiral horn | pearl white, silver horn, mist grey |
| `animal.makara.png` | **Makara** | a makara, crocodile-jawed and fish-tailed, carved as a temple guardian | stone grey, verdigris, ochre |

> **Mythic five + makara:** paint these as heraldic/literary subjects — carved,
> cast, or embroidered rather than photographic creatures — so they read as
> emblems and never as fantasy illustration.

---

## 5. Characters — 85 plates

**One emblematic object each. No people, no faces, no figures.** The object is
the character's most recognisable possession, token, or trace.

### All 85

| File | Character | Work | Subject (object) | Palette |
|---|---|---|---|---|
| `character.odysseus.png` | **Odysseus** | *the Odyssey* | a coil of ship's rope beside a carved olive-wood oar blade | weathered oak, sea-salt white, rope tan |
| `character.penelope.png` | **Penelope** | *the Odyssey* | an upright loom with a half-finished shroud, the last night's weaving unravelled at the bottom | undyed linen, dark wood, wool grey |
| `character.antigone.png` | **Antigone** | *Antigone* | a handful of dry funeral earth scattered over a bare stone slab | grave grey, dust ochre, bone white |
| `character.medea.png` | **Medea** | *Medea* | a bronze vial tipped over, one dark drop suspended at its lip | verdigris bronze, poison green, black |
| `character.cassandra.png` | **Cassandra** | *Agamemnon* | a laurel wreath half-burnt, its leaves curling from an unseen heat | scorched laurel green, ash grey, ember orange |
| `character.achilles.png` | **Achilles** | *the Iliad* | a bronze greave with a single deep score across the heel | hammered bronze, blood red, shadow black |
| `character.circe.png` | **Circe** | *the Odyssey* | a stone mortar and pestle with crushed herbs and a scatter of pig bristles | herb green, grey stone, umber |
| `character.scheherazade.png` | **Scheherazade** | *One Thousand and One Nights* | a stack of a thousand loose manuscript pages bound with one silk thread | parchment cream, ink black, crimson silk |
| `character.don_quixote.png` | **Don Quixote** | *Don Quixote* | a dented barber's basin worn as a helmet, a lance propped behind it | tarnished tin, rust, dry-grass gold |
| `character.sancho_panza.png` | **Sancho Panza** | *Don Quixote* | a fat wineskin and a heel of bread on a folded saddle blanket | leather brown, bread tan, faded red |
| `character.hamlet.png` | **Hamlet** | *Hamlet* | a bare human skull resting on a folded black cloth | bone ivory, black wool, cold grey |
| `character.lady_macbeth.png` | **Lady Macbeth** | *Macbeth* | a pale scrubbing cloth stained at one corner with a mark that will not lift | linen white, dark red, candle gold |
| `character.prospero.png` | **Prospero** | *The Tempest* | a wooden staff broken cleanly in two, laid over a closed grimoire | driftwood grey, sea blue, gold leaf |
| `character.puck.png` | **Puck** | *A Midsummer Night's Dream* | a scattering of crushed wildflower petals and one small horn | violet, meadow green, brass |
| `character.beatrice.png` | **Beatrice** | *Much Ado About Nothing* | two crossed rapiers with buttoned tips, arranged like a witticism | steel blue, ribbon scarlet, oak |
| `character.iago.png` | **Iago** | *Othello* | a folded handkerchief embroidered with strawberries, dropped in dust | linen white, strawberry red, grey dust |
| `character.elizabeth_bennet.png` | **Elizabeth Bennet** | *Pride and Prejudice* | a folded letter with a broken seal beside a pair of muddy walking boots | paper cream, seal red, mud brown |
| `character.mr_darcy.png` | **Mr. Darcy** | *Pride and Prejudice* | a signet ring resting on a folded formal letter | gold, deep green wax, ivory paper |
| `character.emma_woodhouse.png` | **Emma Woodhouse** | *Emma* | a hand-drawn portrait sketch, unfinished, beside a matchmaker's list of names | pencil grey, paper cream, rose |
| `character.marianne_dashwood.png` | **Marianne Dashwood** | *Sense and Sensibility* | a sprig of dried wildflowers pressed inside an open book of verse | faded lilac, paper cream, ink |
| `character.jane_eyre.png` | **Jane Eyre** | *Jane Eyre* | a small plain grey travelling case beside a single guttering candle | slate grey, candle gold, brown leather |
| `character.rochester.png` | **Rochester** | *Jane Eyre* | a scorched wooden door handle and a burnt fragment of curtain | char black, ember orange, brass |
| `character.heathcliff.png` | **Heathcliff** | *Wuthering Heights* | a windswept moorland thorn branch torn from its root | heather purple, black peat, bone-grey wood |
| `character.catherine_earnshaw.png` | **Catherine Earnshaw** | *Wuthering Heights* | a window casement thrown open onto bare moor, its latch broken | window grey, heather, cold blue |
| `character.ahab.png` | **Ahab** | *Moby-Dick* | a carved whalebone leg braced against a ship's deck plank | whale ivory, tar black, sea grey |
| `character.ishmael.png` | **Ishmael** | *Moby-Dick* | a sailor's sea chest with a coil of line and a folded oilskin | salt-worn oak, rope tan, slate |
| `character.bartleby.png` | **Bartleby** | *Bartleby, the Scrivener* | a copyist's desk with an untouched stack of legal paper and a dry inkwell | office grey, paper cream, dead-wall brick |
| `character.hester_prynne.png` | **Hester Prynne** | *The Scarlet Letter* | an embroidered scarlet letter A, gold-threaded, on grey homespun | scarlet, gold thread, homespun grey |
| `character.jo_march.png` | **Jo March** | *Little Women* | a writing desk with a scorched manuscript, a cut lock of chestnut hair beside it | ink black, chestnut, wood brown |
| `character.sherlock_holmes.png` | **Sherlock Holmes** | *the Sherlock Holmes stories* | a magnifying lens laid over a single unremarkable footprint | brass, glass grey, ash |
| `character.watson.png` | **Watson** | *the Sherlock Holmes stories* | a doctor's leather bag open beside a service revolver and a notebook | oxblood leather, gunmetal, paper |
| `character.irene_adler.png` | **Irene Adler** | *A Scandal in Bohemia* | a cabinet photograph face-down beside a discarded false moustache | sepia, black silk, pearl |
| `character.moriarty.png` | **Moriarty** | *The Final Problem* | a spider's web strung across a blackboard of abstruse equations | chalk white, slate black, grey |
| `character.dracula.png` | **Dracula** | *Dracula* | a shipping crate of Transylvanian earth, its lid prised open | coffin oak, dark soil, iron nail |
| `character.van_helsing.png` | **Van Helsing** | *Dracula* | a physician's case of sharpened stakes, garlic, and a crucifix | dark leather, silver, garlic white |
| `character.mina_harker.png` | **Mina Harker** | *Dracula* | a portable typewriter beside a shorthand journal, mid-entry | typewriter black, paper, ink blue |
| `character.frankensteins_creature.png` | **Frankenstein's Creature** | *Frankenstein* | a hand-stitched patchwork of mismatched leathers, the sutures still raw | grey flesh tone, black thread, wound red |
| `character.victor_frankenstein.png` | **Victor Frankenstein** | *Frankenstein* | a laboratory bench of glass apparatus with a spilled flask | glass green, brass, spilled dark |
| `character.jekyll_and_hyde.png` | **Jekyll & Hyde** | *Strange Case of Dr Jekyll and Mr Hyde* | a single glass beaker of tincture, half clear and half clouded, mid-swirl | clear glass, murky green, brass |
| `character.dorian_gray.png` | **Dorian Gray** | *The Picture of Dorian Gray* | an ornate gilt picture frame turned to face the wall | gilt gold, canvas back, dust grey |
| `character.alice.png` | **Alice** | *Alice's Adventures in Wonderland* | a small glass bottle labelled DRINK ME beside an iron key too large for its lock | glass blue, brass key, cream label |
| `character.the_cheshire_cat.png` | **The Cheshire Cat** | *Alice's Adventures in Wonderland* | a wide grin of teeth alone, the rest of the face fading into a branch | moon white, dusk mauve, bark |
| `character.the_red_queen.png` | **The Red Queen** | *Through the Looking-Glass* | a red chess queen mid-topple on a chequered board | lacquer red, ivory, black |
| `character.peter_pan.png` | **Peter Pan** | *Peter and Wendy* | a boy's shadow detached and pinned at the shoulder with a needle | shadow black, linen white, silver |
| `character.wendy.png` | **Wendy** | *Peter and Wendy* | a thimble on a folded night-nursery blanket beside an open window | thimble silver, blanket blue, cream |
| `character.captain_hook.png` | **Captain Hook** | *Peter and Wendy* | an iron hook and a ticking pocket watch resting side by side | iron black, brass, crocodile green |
| `character.dorothy_gale.png` | **Dorothy Gale** | *The Wonderful Wizard of Oz* | a pair of worn silver slippers on a road of yellow brick | silver, brick gold, prairie grey |
| `character.the_scarecrow.png` | **The Scarecrow** | *The Wonderful Wizard of Oz* | a straw-stuffed glove and a scrap of burlap on a broken pole | straw gold, burlap tan, weathered wood |
| `character.the_tin_woodman.png` | **The Tin Woodman** | *The Wonderful Wizard of Oz* | a tin funnel-cap and an oilcan, one rust bloom at the joint | tin grey, rust orange, oil amber |
| `character.the_cowardly_lion.png` | **The Cowardly Lion** | *The Wonderful Wizard of Oz* | a woven medal ribbon hung on a tuft of coarse mane | ribbon green, lion tawny, brass |
| `character.anne_shirley.png` | **Anne Shirley** | *Anne of Green Gables* | a cracked slate writing board beside a broken hair ribbon | slate grey, chalk white, ribbon red |
| `character.long_john_silver.png` | **Long John Silver** | *Treasure Island* | a wooden crutch and a parrot's dropped feather over a folded chart | wood brown, feather green, chart cream |
| `character.jim_hawkins.png` | **Jim Hawkins** | *Treasure Island* | a rolled treasure map weighted with a black-spotted paper disc | chart cream, ink brown, black |
| `character.robinson_crusoe.png` | **Robinson Crusoe** | *Robinson Crusoe* | a tally of days scratched into a wooden post beside a single bare footprint | driftwood grey, sand tan, char |
| `character.gulliver.png` | **Gulliver** | *Gulliver's Travels* | a hand-sized coil of ropes and dozens of tiny stakes driven into sand | rope tan, sand, iron |
| `character.cyrano.png` | **Cyrano de Bergerac** | *Cyrano de Bergerac* | a white feathered hat plume laid across an unsigned love letter | plume white, paper cream, ink black |
| `character.jean_valjean.png` | **Jean Valjean** | *Les Misérables* | a pair of silver candlesticks beside a snapped convict's chain link | silver, iron black, candle gold |
| `character.javert.png` | **Javert** | *Les Misérables* | a police lantern and a coil of chain set on a bridge parapet | lantern brass, chain iron, river grey |
| `character.eponine.png` | **Éponine** | *Les Misérables* | a rain-soaked letter, the ink running, held in a torn shawl | wet paper grey, running ink, shawl brown |
| `character.raskolnikov.png` | **Raskolnikov** | *Crime and Punishment* | an axe leaned in a stairwell corner beside a pawned silver watch | axe iron, stair grey, tarnished silver |
| `character.sonya.png` | **Sonya** | *Crime and Punishment* | a worn green shawl folded over a small well-thumbed gospel | shawl green, paper cream, faded gold |
| `character.prince_myshkin.png` | **Prince Myshkin** | *The Idiot* | a plain wooden cross and an epileptic's dropped walking cane | pale wood, dust, iron |
| `character.anna_karenina.png` | **Anna Karenina** | *Anna Karenina* | a red velvet handbag dropped beside a railway track | velvet crimson, rail iron, snow grey |
| `character.levin.png` | **Levin** | *Anna Karenina* | a scythe laid down in cut hay at the end of a long row | scythe steel, hay gold, field green |
| `character.natasha_rostova.png` | **Natasha Rostova** | *War and Peace* | a satin dancing slipper and a folded ballroom card | satin cream, ribbon rose, candle gold |
| `character.mowgli.png` | **Mowgli** | *The Jungle Book* | a broken iron trap ring and a red flower blossom on jungle leaf litter | jungle green, flame red, iron |
| `character.bagheera.png` | **Bagheera** | *The Jungle Book* | a black panther's discarded collar, the fur-worn buckle green with age | panther black, brass verdigris, leaf |
| `character.tarzan.png` | **Tarzan** | *Tarzan of the Apes* | a knotted vine loop over a father's rusted hunting knife | vine green, rust, bone |
| `character.robin_hood.png` | **Robin Hood** | *English legend* | a longbow and a single arrow struck through a gold coin | yew brown, goose-feather grey, gold |
| `character.maid_marian.png` | **Maid Marian** | *English legend* | a hooded green travelling cloak with a hidden dagger at the hem | forest green, leather, steel |
| `character.arthur.png` | **Arthur (King Arthur)** | *Arthurian legend* | a sword standing in a cleft stone, the stone moss-grown | steel blue, granite grey, moss |
| `character.guinevere.png` | **Guinevere** | *Arthurian legend* | a queen's circlet resting on a folded altar cloth | gold, linen white, rose |
| `character.lancelot.png` | **Lancelot** | *Arthurian legend* | a dented shield with a lance splintered across it | shield white, blood red, oak |
| `character.morgan_le_fay.png` | **Morgan le Fay** | *Arthurian legend* | a black scrying mirror in a wrought silver frame | obsidian black, silver, deep violet |
| `character.merlin.png` | **Merlin** | *Arthurian legend* | a hawthorn staff and a crystal shard on a bed of oak leaves | hawthorn grey, crystal blue, oak brown |
| `character.gawain.png` | **Gawain** | *Sir Gawain and the Green Knight* | a green sash tied around a nicked axe haft | sash green, axe steel, leather |
| `character.mulan.png` | **Mulan (legend)** | *the Ballad of Mulan* | a folded suit of lamellar armour beside a bronze hand mirror | lacquer red, bronze, iron grey |
| `character.sun_wukong.png` | **Sun Wukong** | *Journey to the West* | an iron-banded staff and a golden circlet resting on a rock | iron black, gold, stone grey |
| `character.baba_yaga.png` | **Baba Yaga** | *Slavic folklore* | a wooden mortar and pestle beside a fence post topped with a lantern | birch white, bone, lantern amber |
| `character.scrooge.png` | **Scrooge** | *A Christmas Carol* | a cold counting-house ledger with a single guttering candle stub | ledger green, wax white, coal black |
| `character.miss_havisham.png` | **Miss Havisham** | *Great Expectations* | a decayed wedding cake collapsed under cobwebs, a stopped clock beside it | yellowed ivory, cobweb grey, dust |
| `character.pip.png` | **Pip** | *Great Expectations* | a blacksmith's small apron folded beside a gentleman's calling card | forge grey, linen, card cream |
| `character.sydney_carton.png` | **Sydney Carton** | *A Tale of Two Cities* | a wine glass tipped over beside a folded coat and a guillotine blade's shadow | wine red, coat black, steel |
| `character.faust.png` | **Faust** | *Faust* | a signed contract with a still-wet ink signature beside a spent quill | parchment, blood-dark ink, candle gold |
| `character.mephistopheles.png` | **Mephistopheles** | *Faust* | a black poodle's collar and a contract seal broken in two | jet black, seal red, sulphur yellow |

---

## 6. Suggested batching

15 chats, anchor re-attached each time, ~11 images per chat.

| Batch | Set | Why this order |
|---|---|---|
| 1 | The 8 renamed archetypes | Smallest set, same subject type you've already done — re-locks the style. |
| 2–4 | Mammals (22) | Fur and mass; the easiest living subjects to keep painterly. |
| 5–6 | Birds (20) | Feather detail tests the stipple at fine scale. |
| 7 | Reptiles & aquatic (14) | Watch for gloss — water and scales go plasticky fastest. |
| 8 | Insects (10) | Small, high-detail; keep the brushwork visible at wing scale. |
| 9 | Mythic (6) | Do these once the animal style is locked. |
| 10–15 | Characters (85) | Objects again, so quality holds even late in the run. |

## 7. QA before keying

- Pure white ground, no gradient, no paper texture in the background.
- Subject fills ~85% of frame with even margin; no cropping at the edge.
- No cast shadow, ground plane, or reflection.
- Matte — no gloss, bloom, or rim light.
- No text, labels, borders, or signatures.
- **Characters: no human figure anywhere in frame.**
- Filename matches the table exactly.

Then run `npx tsx` nothing — just:

```
python3 scripts/archetype-art/keyout.py      # keys white → transparent, writes 512px webp
```

(Point its `mapping` at the new folder, or drop files into `public/animals/`,
`public/characters/`, `public/archetypes/` and re-run.)
