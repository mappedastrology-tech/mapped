# Mapped — Art Brief: Gods & Goddesses (108 plates)

**Companion to:** the Archetype Art Generation Plan and the Animals/Characters
brief. Same painted-plate style, same anchor workflow, same output spec. This is
the last library without art.

| Set | Count | Status |
|---|---|---|
| Gods & Goddesses | 108 | none generated |

Output: **1024×1024 PNG**, painted plate on **pure white**, no ground plane, no
cast shadow onto a surface, no text, no border. I key the white out and resize
on my side — send the flat white PNGs, don't pre-cut them.

**Filenames are the library IDs.** `deity.zeus.png`, `deity.amaterasu.png`, and
so on, exactly as in the table. A correctly-named file drops straight in with no
code change — the profile page is already wired to `/deities/<id>.webp` and falls
back to a glyph until each file exists, so you can send these in batches and they
appear as they land.

---

## 1. The rule that governs this whole set: paint the emblem, never the god

Every one of these 108 is represented by **its traditional emblem or attribute —
an object, never a figure, never a face.** This is the same rule the characters
followed, and here it matters more than anywhere else in the app:

- The established style block already forbids faces and human figures, so the
  library stays visually consistent with the other 253 plates.
- **30 of the 108 are from living faiths** — Hindu, Shinto, Buddhist, Daoist.
  Generating an image of a living tradition's deity is a line this app doesn't
  need to cross to work. Their traditional attributes — the trishula, the conch,
  the vajra, the sacred mirror — are exactly how devotional art itself signals
  which deity is meant, so the emblem approach is *more* correct here, not a
  workaround.
- It also sidesteps the failure mode where a generator produces a generic robed
  figure and the plate could be any deity in the set.

The app's own cultural gate was applied when this library was written: nothing
here comes from a closed or vulnerable tradition — no Òrìṣà, no Lwa, no
Indigenous North American, Aboriginal Australian or Siberian figures, no living
Maya day-signs, and no Abrahamic divine figures.

### Two extra instructions for the living-tradition entries

The 30 plates marked **living** in the table are sacred objects to people
practising today. For those:

- Render the implement **accurately and with dignity** — correct number of
  prongs, correct form, correct hand-object where it's traditionally specific.
- **No whimsy, no damage, no decay, no irony.** Rust, cracks, blood, cobwebs and
  "weathered" treatments are fine on the Norse and Mesopotamian plates and wrong
  on these.

### The anchor warning, repeated

Keep The Anvil attached as the style reference, and put this in **every** prompt:

> The reference image is for PAINT STYLE ONLY — brushwork, lighting, edge
> quality, white ground. Do not include an anvil, a blacksmith's tool, or any
> part of the reference's subject. The only subject is the one described below.

The last batch lost seven plates to exactly this. Fresh chat every 8–12 images,
re-attach the anchor each time, eyeball each one before moving on.

---

## 2. The 108

Colours are the natural palette for the subject — the same "natural colour per
subject" rule as the other sets, not a forced house palette.

### Greek — 14

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.zeus.png` | Zeus | a forked bronze thunderbolt laid across the step of a marble throne | bronze, storm white, marble grey |
| `deity.hera.png` | Hera | a peacock's tail feather laid across a gold wedding diadem | peacock blue-green, gold, ivory |
| `deity.athena.png` | Athena | a crested bronze helmet resting beside an olive sprig and a drop spindle | bronze, olive green, wool cream |
| `deity.apollo.png` | Apollo | a seven-stringed tortoiseshell lyre beside a laurel wreath | tortoiseshell, gut string, laurel green |
| `deity.artemis.png` | Artemis | a silver hunting bow, unstrung, with a crescent-moon clasp | silver, moon white, yew brown |
| `deity.aphrodite.png` | Aphrodite | a scallop shell holding a gold hand-mirror and a strand of pearls | shell rose, gold, pearl |
| `deity.ares.png` | Ares | a blooded spearhead and a dented bronze greave | iron, dried blood, bronze |
| `deity.hades.png` | Hades | a black iron helm and a two-pronged bident, a split pomegranate beside them | iron black, pomegranate red, shadow grey |
| `deity.hermes.png` | Hermes | a winged sandal beside a caduceus and a sealed traveller's letter | gold wing, olive wood, wax red |
| `deity.dionysus.png` | Dionysus | an ivy-wound thyrsus leaning on an overturned wine krater, wine still running | ivy green, wine dark, terracotta |
| `deity.hecate.png` | Hecate | a ring of three iron keys and a lit torch at a three-way crossroads marker | iron, torch flame, night blue |
| `deity.nyx.png` | Nyx | a black veil drawn across a field of stars, its edge dissolving into them | void black, star silver, deep indigo |
| `deity.eris.png` | Eris | a single inscribed gold apple, lying where it was thrown | gold, ash grey |
| `deity.hermaphroditus.png` | Hermaphroditus | a still spring pool holding two reflections that merge into one | spring green, bronze, water silver |

### Roman — 6

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.janus.png` | Janus | a stone doorway arch with a bronze key, its threshold worn hollow from passage both ways | limestone, bronze, worn stone |
| `deity.bellona.png` | Bellona | a spear driven upright into the ground before a temple door, a war trumpet beside it | iron, bronze, blood |
| `deity.vesta.png` | Vesta | a low round hearth ringed in white stone, its fire burning steadily | white stone, hearth gold, ember |
| `deity.vertumnus.png` | Vertumnus | a bowl of fruit in which each piece is a different season — blossom, green, ripe, dried | blossom pink, orchard green, autumn russet |
| `deity.fortuna.png` | Fortuna | a ship's rudder resting on a globe beside a cornucopia and a spoked wheel | bronze, wheat gold, sea grey |
| `deity.saturn.png` | Saturn | a curved harvest sickle laid across an hourglass and a fallen crown | iron, sand gold, tarnished gold |

### Norse — 10

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.odin.png` | Odin | a grey traveller's hat and an ash spear leaning over a dark well, one raven feather on the rim | weathered grey, ash wood, well black |
| `deity.thor.png` | Thor | a short-hafted iron hammer with iron gauntlets and a strength-belt | iron, oak haft, storm grey |
| `deity.freyja.png` | Freyja | an extraordinary gold necklace laid on a falcon-feather cloak | gold, amber, falcon brown |
| `deity.freyr.png` | Freyr | a folded ship small enough to hold in one hand, resting on a sheaf of ripe barley | gold, barley, sail cream |
| `deity.loki.png` | Loki | a half-knotted fishing net thrown over a broken oath-ring and a single salmon scale | hemp tan, silver, gold |
| `deity.frigg.png` | Frigg | a distaff wound with cloud-white wool and a ring of household keys | wool white, gold, birch |
| `deity.tyr.png` | Tyr | one empty right-hand gauntlet laid beside a sword and a snapped fetter | iron, leather, wolf grey |
| `deity.hel.png` | Hel | a plain wooden bowl and knife set at a bare table, half the wood living and half grey | bone, dead wood, dim ember |
| `deity.baldr.png` | Baldr | a sprig of mistletoe resting on a shield hung with white flowers | mistletoe green, white petal, shield gold |
| `deity.skadi.png` | Skadi | skis and a hunting bow leaning against a cairn of mountain stone | snow white, yew, granite grey |

### Egyptian — 10

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.ra.png` | Ra | a reed solar barque carrying a golden disc, a rearing cobra at the prow | gold, reed tan, lapis |
| `deity.isis.png` | Isis | a pair of outstretched gold kite-wings above a knotted red tyet sash | gold, kite brown, tyet red |
| `deity.osiris.png` | Osiris | a crook and flail crossed above a wooden tray of sprouting green wheat | gold, linen, wheat green |
| `deity.set.png` | Set | a curved was-sceptre and a red desert stone caught in a whirl of sand | desert red, iron, sand |
| `deity.anubis.png` | Anubis | a balance scale, a heart on one pan and a single white feather on the other | gold, feather white, obsidian |
| `deity.thoth.png` | Thoth | a scribe's palette with reed pens and an ibis feather on an open papyrus | papyrus cream, ink black, palette wood |
| `deity.sekhmet.png` | Sekhmet | seven arrows fanned beside a jar of red beer, a sun-disc behind them | gold, ochre, blood red |
| `deity.hathor.png` | Hathor | a sistrum rattle and a polished mirror with a beaded menat necklace | gold, turquoise, faience blue |
| `deity.hapi.png` | Hapi | a tipped clay jar pouring over black silt, lotus and papyrus rising out of it | Nile brown, silt black, papyrus green |
| `deity.nephthys.png` | Nephthys | a small alabaster house with a basket on its roof, set on folded grave-linen | alabaster, linen grey, dusk |

### Mesopotamian — 9

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.inanna.png` | Inanna | an eight-pointed lapis star above seven ornaments laid aside in a row | lapis blue, gold, carnelian |
| `deity.ereshkigal.png` | Ereshkigal | a bolted lapis gate, shut, with a hook set into the wall beside it | lapis, corroded bronze, cave dark |
| `deity.enki.png` | Enki | a vessel from which two streams of water pour, fish swimming upward inside them | water blue, clay, fish silver |
| `deity.enlil.png` | Enlil | a horned crown alone on a stone plinth, a storm gathering behind it | limestone, storm grey, gold |
| `deity.marduk.png` | Marduk | a spade-headed sceptre and a net laid across the split halves of a great shell | bronze, hemp, shell pearl |
| `deity.nergal.png` | Nergal | a lion-headed mace on cracked ground under a scorching noon disc | bronze, sun white, parched earth |
| `deity.tiamat.png` | Tiamat | salt sea meeting fresh water in a shallow black basin, coiling into a serpent's shape | deep sea, salt white, storm |
| `deity.shamash.png` | Shamash | a saw-toothed blade rising between two mountains above a stone law-stele | gold, stone grey, dawn |
| `deity.ninhursag.png` | Ninhursag | the omega-shaped womb emblem above a bowl of wet river clay | clay ochre, copper, riverbank green |

### Celtic — 8

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.morrigan.png` | The Morrígan | three crow feathers laid across a washed and bloodied shirt at a ford | crow black, water grey, blood |
| `deity.brigid.png` | Brigid | an anvil, a harp, and a stone well-head together under one triple flame | forge orange, bronze, water |
| `deity.lugh.png` | Lugh | a long spear and a full set of craftsmen's tools laid together at a hall threshold | spear iron, tool bronze, oak |
| `deity.dagda.png` | The Dagda | a great bronze cauldron that never empties, with a club and a carved oak harp | bronze, oak, hearth gold |
| `deity.cernunnos.png` | Cernunnos | a set of shed antlers with a gold torc hung on one tine, a serpent coiled at the base | antler bone, gold, moss |
| `deity.cerridwen.png` | Cerridwen | a cauldron over a fire with three bright drops caught on the rim | cauldron black, brew green, ember |
| `deity.arawn.png` | Arawn | a bone hunting horn with a red-stained rim, and a crown left on a stone seat | bone white, red, otherworld grey |
| `deity.rhiannon.png` | Rhiannon | a silver bridle hung with small bells, three birds settled on it | silver, white, birdsong gold |

### Slavic — 4

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.perun.png` | Perun | an axe-head split from an oak trunk by lightning, a thunderstone beside it | oak, iron, lightning white |
| `deity.veles.png` | Veles | a serpent coiled at the wet roots of an oak, a cattle horn laid beside it | serpent green, wet bark, horn |
| `deity.mokosh.png` | Mokosh | a wet earth furrow with a spindle and unspun flax laid into it | dark earth, pale flax, red thread |
| `deity.morana.png` | Morana | a straw-and-cloth winter effigy half sunk in dark spring water | straw gold, ice grey, river dark |

### Baltic — 3

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.perkunas.png` | Perkūnas | an axe and a whetstone at the foot of a lightning-struck oak | oak, iron, storm |
| `deity.saule.png` | Saulė | an amber sun-disc resting on a woven sash at the rim of a hill | amber gold, linen, dawn |
| `deity.laima.png` | Laima | a loom with a single new thread just begun, a linden branch across the frame | linden green, linen white, red thread |

### Finnish — 3

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.vainamoinen.png` | Väinämöinen | a kantele strung on a pike's jawbone, resting on still water | pike bone, gut string, lake grey |
| `deity.ilmarinen.png` | Ilmarinen | a smith's hammer beside the Sampo — a mill with a many-coloured lid | iron, forge glow, copper |
| `deity.louhi.png` | Louhi | a locked stone door in a hillside, faint sun and moon light sealed behind it | granite, iron, faint gold |

### Canaanite — 3

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.baal.png` | Baal Hadad | a lightning-shaped cedar spear and a mace crossed above a first rainfall | bronze, storm, cedar green |
| `deity.anat.png` | Anat | a blooded mace and a sickle laid together on a threshing floor | bronze, blood, chaff gold |
| `deity.astarte.png` | Astarte | a gold morning-star set on a war helm wound with a lover's ribbon | gold, bronze, ribbon rose |

### Aztec — 4

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.tezcatlipoca.png` | Tezcatlipoca | a polished black obsidian mirror, smoking faintly at its rim | obsidian black, smoke grey, gold rim |
| `deity.quetzalcoatl.png` | Quetzalcoatl | a cut conch-shell wind jewel beside a single long quetzal feather | conch white, quetzal green, jade |
| `deity.tlaloc.png` | Tlaloc | a clay water jar pouring hard over young maize, a lightning-serpent staff beside it | rain blue, clay, maize gold |
| `deity.coatlicue.png` | Coatlicue | a skirt woven entirely of serpents, hanging on a stone plinth | stone grey, serpent green, obsidian |

### Maya — 2

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.itzamna.png` | Itzamná | an open bark-paper codex with a calendar wheel and a medicine bundle | bark paper, codex red, jade |
| `deity.ixchel.png` | Ixchel | a backstrap loom mid-weave and a tipped clay jar, a crescent above | cotton, clay, moon silver |

### Polynesian — 2

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.maui.png` | Māui | a carved bone fish-hook with its rope, beside a snare of plaited flax | bone white, flax, ocean |
| `deity.hine-nui-te-po.png` | Hine-nui-te-pō | a carved doorway hung with a closed flax curtain, obsidian set at the threshold | flax, obsidian black, night |

---

### Hindu — 14 · **living tradition — dignity rules apply**

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.shiva.png` | Shiva | a trishula standing upright with a damaru drum tied to it, a crescent and a coil of ash at its base | ash grey, steel, moon white |
| `deity.vishnu.png` | Vishnu | the four attributes arranged together — conch, discus, mace, lotus | gold, conch white, lotus rose |
| `deity.brahma.png` | Brahma | four palm-leaf manuscripts with a water pot and an open lotus | palm leaf, lotus rose, gold |
| `deity.lakshmi.png` | Lakshmi | a gold pot overflowing with coins, lotus blossoms floating around it, a lit ghee lamp | gold, lotus pink, lamp flame |
| `deity.saraswati.png` | Saraswati | a veena resting beside a palm-leaf manuscript and a white lotus | veena wood, lotus white, ink |
| `deity.kali.png` | Kali | a curved khadga blade laid across a garland of red hibiscus | blade steel, hibiscus red, night blue |
| `deity.durga.png` | Durga | a trident, discus and conch borne together on a crimson lion-embroidered banner | crimson, gold, tawny |
| `deity.ganesha.png` | Ganesha | a modak on a leaf beside a single ivory tusk used as a stylus, on an open manuscript | ivory, leaf green, sweet gold |
| `deity.krishna.png` | Krishna | a bamboo flute laid across a peacock feather beside a pot of butter | bamboo, peacock blue-green, butter cream |
| `deity.hanuman.png` | Hanuman | a gada resting against a carried mountain-top with healing herbs growing on it | gada gold, mountain grey, herb green |
| `deity.parvati.png` | Parvati | a rudraksha rosary and a mirror laid on a mountain stone with a lotus | rudraksha brown, silver, lotus rose |
| `deity.ardhanarishvara.png` | Ardhanarishvara | one emblem split down the centre — trishula and ash on one half, mirror and lotus on the other, joined seamlessly | ash grey and lotus rose, gold seam |
| `deity.yama.png` | Yama | a noose and a staff laid beside an open ledger of accounts | dark iron, ledger cream, deep brown |
| `deity.ganga.png` | Ganga | a kalasha pouring an unbroken stream that widens into a river, lotus and fish in it | river silver, copper, lotus |

### Shinto — 6 · **living tradition**

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.amaterasu.png` | Amaterasu | a bronze mirror at the mouth of a rock cave, light escaping around the stone | bronze, cave stone, dawn gold |
| `deity.susanoo.png` | Susanoo | a sword drawn from a serpent's tail, resting on storm-flattened reeds | steel, storm grey, reed green |
| `deity.tsukuyomi.png` | Tsukuyomi | a moon-white lacquer bowl and a folded sleeve turned away, a full moon behind | moon white, lacquer black, silver |
| `deity.inari.png` | Inari | a sheaf of ripe rice before a small vermilion torii, a stone fox seated either side | vermilion, rice gold, stone grey |
| `deity.izanami.png` | Izanami | a jewelled spear standing over the first island, a great sealed boulder behind it | jewel, sea blue, boulder grey |
| `deity.raijin.png` | Raijin | a ring of taiko drums with the sticks laid across them, storm light behind | lacquer, hide tan, storm |

### Buddhist — 5 · **living tradition**

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.avalokiteshvara.png` | Avalokiteshvara | a white lotus and a vase of nectar with a prayer rosary beside them | lotus white, nectar gold, jade |
| `deity.tara.png` | Tara | a blue utpala lotus in full bloom, one step already taken from the seat beside it | utpala blue, green, gold |
| `deity.manjushri.png` | Mañjuśrī | a flaming sword raised above a palm-leaf sutra resting on a lotus | flame gold, steel, lotus blue |
| `deity.vajrapani.png` | Vajrapāṇi | a bronze vajra held in a nimbus of flame | bronze, flame, storm blue |
| `deity.mahakala.png` | Mahākāla | a ritual chopper laid on a dark protective canopy, ringed in flame | dark blue-black, bronze, flame orange |

### Daoist — 5 · **living tradition**

| File | Deity | Paint this | Palette |
|---|---|---|---|
| `deity.xiwangmu.png` | Xiwangmu | a bough of peaches on a jade dish, a far mountain behind | peach blush, jade green, mountain mist |
| `deity.lu-dongbin.png` | Lü Dongbin | a straight sword and a fly-whisk beside a bowl of millet still steaming | steel, whisk white, millet gold |
| `deity.he-xiangu.png` | He Xiangu | a lotus flower and a bamboo ladle with a scatter of mica flakes | lotus pink, bamboo, mica silver |
| `deity.lan-caihe.png` | Lan Caihe | a flat basket of flowers and a pair of castanets, with one shoe of a pair missing | bright flowers, cane, worn leather |
| `deity.laozi.png` | Laozi | a tipped gourd, water running around a stone rather than against it, a bamboo-slip scroll beside | gourd tan, water, bamboo green |

---

## 3. Sending them back

Zip them the way you did the last batch — a flat folder of `deity.<slug>.png` at
1024. Filenames are the only thing I need to be exact; I'll key the backgrounds,
resize, QA every plate against this table, and install.

If you want to send in batches, do it by pantheon — the table order is a
reasonable production order, and each block is small enough for one chat.
