# Mapped — Art Brief: the Library

**What this is.** The Library holds **812 reference entries across 11 domains**.
A hundred and fifty-nine of them have art — the 78 tarot cards, the 12 zodiac
signs, the 13 numerology plates, the 9 chakra yantras, the 24 runes, the 8
sabbats, the 8 moon phases and the 7 planetary days. **653 do not.** This file is the instruction set
for filling that in, category by category: what to draw, what the rule is for
each category, what to call the file, and what NOT to draw.

Counts here were read out of the code, not estimated, and every filename in
this document was checked against the app's real reference-entry ids — all 91
match, so a correctly-named file drops straight in.

| Domain | Entries | With art | Needs art |
|---|---:|---:|---:|
| Crystals | 151 | 0 | 151 |
| Astrology | 140 | 12 | 128 |
| Herbalism | 127 | 0 | 127 |
| Dreams | 93 | 0 | 93 |
| Tarot | 78 | **78** | 0 |
| Essential oils | 76 | 0 | 76 |
| Meditation | 43 | 0 | 43 |
| Almanac | 38 | **23** | 15 |
| Numerology | 28 | **13** | 15 |
| Runes | 24 | **24** | 0 |
| Chakras | 14 | **9** | 5 |
| **Total** | **812** | **159** | **653** |

**Read section 1 and 2 once.** They apply to everything. After that, go
straight to the category you're producing and follow its rule.

---

## 0. Before you draw anything: three things you already own

I checked the whole app before writing this, and three sets already exist that
cover entries on the "missing" list. Don't commission these.

| Already exists | Covers | Action |
|---|---|---|
| `public/moons/` — 8 painted moon phases | The 8 moon-phase entries in Almanac | **Wired.** Zero new art. |
| `public/ritual icons/` — fire, water, earth, air, spirit | The 4 element concepts in Astrology | Still to wire. Zero new art. |
| `public/images/tarot/` — all 78 cards | Tarot reference, 78/78 | Already complete and wired. |

That's 90 entries either done or free. Everything below is genuinely new work.

---

## 1. The house style — applies to every category

Same painted-plate style as the 373 plates already in the app (archetypes,
animals, characters, deities, zodiac signs). Keep The Anvil attached as the
style anchor, and put this in **every** prompt:

> The reference image is for PAINT STYLE ONLY — brushwork, lighting, edge
> quality, white ground. Do not include an anvil, a blacksmith's tool, or any
> part of the reference's subject. The only subject is the one described below.

That line is not optional. Seven plates in an earlier batch came back with the
anvil painted into them because it was left out.

**Universal rules:**

- Painted on **pure white**. Send flat white PNGs — do NOT pre-cut them. I key
  the background out with the app's own algorithm so every plate matches.
- **No faces, no human figures**, with the two exceptions the existing
  libraries already make (the zodiac's Gemini/Virgo/Aquarius/Sagittarius are
  classical figures; that's the sign set, not a licence elsewhere).
- **No text, no labels, no numerals rendered as type.** A number is drawn as a
  thing, never set in a typeface — see Numerology below.
- Natural colour for the subject. No forced house palette.
- One subject, centred, no ground plane, no cast shadow onto a surface.
- Fresh chat every 8–12 images, re-attach the anchor each time, look at each
  one before moving on.

---

## 2. There are only two shapes in this Library

Everything you produce is one of these. Getting the shape right matters more
than anything else in this document, because the Library crops hard.

### Shape A — the reference icon (this is 95% of the work)

Every reference entry renders in exactly two places, both **square**:

| Where | Rendered at |
|---|---|
| Search-result row (`ReferenceList`) | **31 × 31 px**, inside a 40px rounded tile |
| Detail sheet orb (`ReferenceSheet`) | **60 × 60 px**, inset in a 96px glowing circle |

**Deliver 1024 × 1024 PNG, square, subject centred with a little air around it.**

Two consequences worth internalising:

1. **It must read at 31 pixels.** That is a thumbnail. One clear silhouette,
   strong value contrast, no fine detail that turns to mush. If you squint at
   your 1024 and can't tell what it is, it fails.
2. **Square, not portrait.** The existing zodiac files are 192 × 320 portrait
   and get letterboxed into both slots, wasting a third of the space. Square
   masters from here on.

### Shape B — the domain cover (11 of these, one per domain)

Sits behind the domain tile and hero. Rendered at **58 × 58** on the Library
grid and **112 × 112** bleeding off the bottom-right corner of the domain
banner, at 85% opacity.

**Deliver 1024 × 1024 PNG.** Because it gets cropped off-corner, keep the
subject **loose and off-centre-tolerant** — nothing that breaks if the
bottom-right quarter is cut off.

### The three lesson blocks (small, specific, do these last)

| Block | Renders at | Notes |
|---|---|---|
| `MatchBlock` cue art | 72px tall × ~110px wide, `contain` | 3-up grid inside a lesson |
| `ExploreBlock` backdrop | 204 × 204, **20% opacity, desaturated** | It's a wash behind glyphs. Design for atmosphere, not detail. |
| `AnnotatedBlock` diagram | 248 × 248 square, full opacity | A labelled teaching diagram with numbered pins. **SVG preferred.** Pin positions are percentages of the box, so internal geometry must be preserved if you replace one. |

---

## 3. Priority order

Don't try to draw 704 things. This order front-loads the **closed, canonical sets** — the ones that never
grow — so whole categories finish rather than filling in patchily.

| # | Set | Count | Why first |
|---|---|---|---|
| 1 | ~~**Chakras**~~ | ~~9~~ | **Delivered.** Installed and wired; `chakra-solar-plexus` and `chakra-throat` need a redraw for petal count. |
| 2 | ~~**Numerology**~~ | ~~13~~ | **Delivered.** Installed and wired; `num-8` and `num-22` need a redraw for count. |
| 3 | ~~**Runes**~~ | ~~24~~ | **Delivered.** Installed and wired; `rune-perthro` needs a redraw. |
| 4 | ~~**Almanac — Wheel of the Year**~~ | ~~8~~ | **Delivered.** All 8 installed and wired, no redraws. |
| 5 | ~~**Almanac — planetary days**~~ | ~~7~~ | **Delivered.** All 7 installed and wired, no redraws. |
| 6 | **Astrology — planets** | 10 | The single most looked-up set in the app. |
| 7 | **Astrology — houses** | 12 | Closed. |
| 8 | **Astrology — aspects** | 10 | Closed, and geometric — one fitting redrawn at ten angles. |
| 9 | **Domain covers** | 11 | Lifts every tile and hero at once. See §5. |
| | **Total for a complete-looking Library** | **104** | |

After that, the open-ended domains (crystals 151, herbs 127, dreams 93, oils
76) are worth doing in tranches — see §6 — but the Library stops looking
unfinished at 104.

---

## 4. Category instructions

### 4.1 Chakras — 9 plates (of 14 entries)

**Filenames:** `chakra-root.png`, `chakra-sacral.png`, `chakra-solar-plexus.png`,
`chakra-heart.png`, `chakra-throat.png`, `chakra-third-eye.png`,
`chakra-crown.png`, `chakra-earth-star.png`, `chakra-soul-star.png`

**The rule:** paint the **traditional yantra** for each chakra — the lotus with
its correct petal count, containing its correct geometric figure — as a painted
object, not a flat vector icon. Petal counts are fixed and wrong counts will be
noticed by anyone who knows the system:

| File | Petals | Inner figure | Colour |
|---|---|---|---|
| `chakra-root` | 4 | downward square | deep red |
| `chakra-sacral` | 6 | crescent moon | orange |
| `chakra-solar-plexus` | 10 | downward triangle | yellow |
| `chakra-heart` | 12 | six-pointed star (two interlocked triangles) | green |
| `chakra-throat` | 16 | downward triangle holding a circle | sky blue |
| `chakra-third-eye` | 2 | downward triangle | indigo |
| `chakra-crown` | 1000 (paint as a dense radiant many-petalled bloom) | none | violet-white |
| `chakra-earth-star` | — | a dark sphere below a root, held in stone | umber, iron |
| `chakra-soul-star` | — | a pale sphere of light above an open bloom | white-gold |

**Do NOT** paint a body, a silhouette, or a figure with glowing points. These
are emblems, and a body at 31px is an unreadable smudge.

**The other 5 chakra entries are concepts, not chakras** — `chakra-subtle-body`,
`chakra-nadis`, `chakra-prana`, `chakra-kundalini`, `chakra-bija-mantra`. They
stay on the letter fallback for now; a yantra would misrepresent them and there
is no obvious object for "prana". Flag it if you want them solved.

---

### 4.2 Numerology — 13 plates (of 28 entries)

**Filenames (all 13, in full):** `num-0.png`, `num-1.png`, `num-2.png`,
`num-3.png`, `num-4.png`, `num-5.png`, `num-6.png`, `num-7.png`, `num-8.png`,
`num-9.png`, `num-11.png`, `num-22.png`, `num-33.png`

**The rule — this is the important one:** **do not draw the numeral.** Type at
31 pixels is just a digit, and a digit is not an illustration. Instead, paint
an **object group whose COUNT is the number** and whose character matches the
number's meaning. The count does the work; the reading comes for free.

| File | Number's character | Paint this |
|---|---|---|
| `num-1` | initiative, the self | one standing stone, upright and alone |
| `num-2` | pairing, balance | two cups leaning together, touching at the rim |
| `num-3` | expression, creativity | three flames of different heights on one wick-tray |
| `num-4` | structure, work | four squared timber beams stacked into a frame corner |
| `num-5` | change, freedom | five loose feathers caught mid-scatter |
| `num-6` | care, home | six ripe fruits in a shallow dish |
| `num-7` | inwardness, study | seven closed books stacked, one bookmark trailing |
| `num-8` | power, material mastery | eight gold coins in a leaning stack |
| `num-9` | completion, release | nine seed heads gone to down, one loosing its seeds |
| `num-0` | potential, the void | one empty dark bowl, nothing in it |
| `num-11` | vision (master) | two tall matched candles, both lit, flames leaning together |
| `num-22` | the builder (master) | two sets of eleven bricks forming an arch keystone |
| `num-33` | the teacher (master) | three tiered lamps, each burning, on one stand |

Keep the counts **exact and countable at a glance**. That is the whole design.

**The other 15 numerology entries are not numbers you can count** — the four
karmic debts (`num-13`, `num-14`, `num-16`, `num-19`), seven chart positions
(`num-life-path`, `num-expression`, `num-soul-urge`, `num-personality`,
`num-birthday`, `num-personal-year`), the system entry
(`num-pythagorean-chart`), and four angel numbers (`num-111`, `num-222`,
`num-333`, `num-444`). The counting trick breaks at 111. Leave them for now.

---

### 4.3 Runes — 24 plates

**Filenames:** `rune-fehu.png`, `rune-uruz.png`, `rune-thurisaz.png`,
`rune-ansuz.png`, `rune-raidho.png`, `rune-kenaz.png`, `rune-gebo.png`,
`rune-wunjo.png`, `rune-hagalaz.png`, `rune-nauthiz.png`, `rune-isa.png`,
`rune-jera.png`, `rune-eihwaz.png`, `rune-perthro.png`, `rune-algiz.png`,
`rune-sowilo.png`, `rune-tiwaz.png`, `rune-berkano.png`, `rune-ehwaz.png`,
`rune-mannaz.png`, `rune-laguz.png`, `rune-ingwaz.png`, `rune-dagaz.png`,
`rune-othala.png`

**The rule:** one **cast tile** per rune — a rectangle of pale bone or
weathered birch, slightly irregular, with the rune **carved into it** and the
cut stained dark red-brown. Same tile shape, same lighting, same angle across
all 24; only the carved mark changes. This is a set that must look like a set —
someone will lay all 24 out on one screen.

The rune mark itself must be the **correct Elder Futhark form**. It is a
straight-line alphabet: no curves, no serifs, no decoration.

**Do NOT** add foliage, ravens, knotwork borders or Norse pastiche. The tile and
the mark, nothing else.

---

### 4.4 Almanac — 15 plates (8 moon phases already done)

**Wheel of the Year — 8 plates.** Filenames: `almanac-samhain.png`,
`almanac-yule.png`, `almanac-imbolc.png`, `almanac-ostara.png`,
`almanac-beltane.png`, `almanac-litha.png`, `almanac-lughnasadh.png`,
`almanac-mabon.png`

**The rule:** one seasonal object per festival, the thing that season is
actually *doing*. No wheels, no pentacles, no generic "witchy" props.

| File | Festival | Paint this |
|---|---|---|
| `almanac-samhain` | late autumn, the dead | a hollowed turnip lantern, lit, beside a bare apple branch |
| `almanac-yule` | winter solstice | a split oak log burning low, holly beside it |
| `almanac-imbolc` | first stirring | a bowl of new ewe's milk with a woven rush cross |
| `almanac-ostara` | spring equinox | speckled eggs in a nest of new grass and hare fur |
| `almanac-beltane` | fire, fertility | a hawthorn bough in flower with ribbons knotted to it |
| `almanac-litha` | midsummer | a sun-bleached wreath of St John's wort and vervain |
| `almanac-lughnasadh` | first harvest | the first loaf, cut, on a sheaf of wheat |
| `almanac-mabon` | second harvest | a basket of apples, grapes and hazelnuts, tipped |

**Planetary days — 7 plates.** Filenames: `almanac-sunday-sun.png`,
`almanac-monday-moon.png`, `almanac-tuesday-mars.png`,
`almanac-wednesday-mercury.png`, `almanac-thursday-jupiter.png`,
`almanac-friday-venus.png`, `almanac-saturday-saturn.png`

**The rule:** the planet's **classical metal**, worked into a small object —
this is the traditional correspondence and it gives the set a unifying logic.

| File | Metal | Paint this |
|---|---|---|
| `almanac-sunday-sun` | gold | a beaten gold disc, rayed |
| `almanac-monday-moon` | silver | a silver crescent mirror |
| `almanac-tuesday-mars` | iron | an iron spearhead, freshly forged |
| `almanac-wednesday-mercury` | quicksilver | a glass phial of mercury, beaded |
| `almanac-thursday-jupiter` | tin | a tin cup, generous and dented |
| `almanac-friday-venus` | copper | a copper hand-mirror, green at the edge |
| `almanac-saturday-saturn` | lead | a lead weight on a plumb line |

---

### 4.5 Astrology — 32 plates (of 128 still needing art)

**Planets — 10.** Filenames: `planet-sun.png`, `planet-moon.png`,
`planet-mercury.png`, `planet-venus.png`, `planet-mars.png`,
`planet-jupiter.png`, `planet-saturn.png`, `planet-uranus.png`,
`planet-neptune.png`, `planet-pluto.png`

**The rule:** the **planet's body as an astronomical plate** — the actual
world, painted from observation, floating with no orbit lines or diagram
furniture. Saturn keeps its rings, Jupiter its bands and red spot, Mars its
polar cap. Sun and Moon are the disc and the full lunar face.

Reason for this rule rather than mythological objects: these entries sit
alongside the chart, where a person is reading "Mars in Libra". The body is
unambiguous; a spearhead would collide with the planetary-day set above.

**Houses — 12.** Filenames, in full: `house-1.png`, `house-2.png`,
`house-3.png`, `house-4.png`, `house-5.png`, `house-6.png`, `house-7.png`,
`house-8.png`, `house-9.png`, `house-10.png`, `house-11.png`, `house-12.png`

**The rule:** the **room or place** that house governs — an interior, painted
as a small stage, empty of people.

| File | House of | Paint this |
|---|---|---|
| `house-1` | self, body | a doorway with a mirror facing it |
| `house-2` | possessions, worth | a strongbox, open, with coin and grain |
| `house-3` | speech, siblings, short trips | a writing desk with letters and a bicycle bell |
| `house-4` | home, roots | a hearth with a kettle on the hook |
| `house-5` | play, love, creation | a stage with a lyre and scattered petals |
| `house-6` | work, routine, health | a workbench with tools hung in order |
| `house-7` | partnership | two chairs facing across a small table |
| `house-8` | death, debt, the shared | a locked chest and a key that isn't yours |
| `house-9` | belief, distance, study | a travelling case, a map and an open codex |
| `house-10` | vocation, standing | a mountain-top marker with a hung robe |
| `house-11` | friendship, the future | a long table set for many |
| `house-12` | the hidden, retreat | a shuttered cell with one candle |

**Aspects — 10.** The five majors first: `aspect-conjunction.png`,
`aspect-sextile.png`, `aspect-square.png`, `aspect-trine.png`,
`aspect-opposition.png`. Then the five minors, which are the same drawing at a
different angle and cost almost nothing once the fitting exists:
`aspect-semisextile.png` (30°), `aspect-semisquare.png` (45°),
`aspect-quintile.png` (72°), `aspect-sesquiquadrate.png` (135°),
`aspect-quincunx.png` (150°)

**The rule:** the **geometry itself**, painted as a brass orrery fitting — two
polished spheres joined by a rod at the correct angle, mounted on a pivot.
Conjunction 0°, sextile 60°, square 90°, trine 120°, opposition 180°. Same
fitting each time, only the angle changes. **The angle must be accurate** —
this is the one set where a viewer can measure your drawing against the
definition and catch it.

---

## 5. Domain covers — 11 plates (Shape B)

Filenames: `cover-astrology.png`, `cover-tarot.png`, `cover-numerology.png`,
`cover-crystals.png`, `cover-chakras.png`, `cover-herbalism.png`,
`cover-essential-oils.png`, `cover-almanac.png`, `cover-meditation.png`,
`cover-dreams.png`, `cover-runes.png`

**Why these matter:** all 11 currently exist but **10 of 11 are generic stock
collage with no relationship to their subject** — Dreams is a blue cloud strip,
Runes is a sparkle doodle, Chakras is a halftone eye. They're the first thing
anyone sees in the Library and they're currently telling the user nothing.

**The rule:** an arranged **still life of that practice's working tools**, seen
from slightly above, as if laid out on a table before use. Richer and busier
than an icon — this is the one place in the Library where detail is welcome,
because it's the largest thing on screen.

| File | Lay out |
|---|---|
| `cover-astrology` | an ephemeris open, brass dividers, a ring dial |
| `cover-tarot` | a spread part-dealt, three cards face-down, a silk wrap |
| `cover-numerology` | a ledger of figures, a straight rule, a counting bead frame |
| `cover-crystals` | raw and cut specimens on a cloth, one catching light |
| `cover-chakras` | seven coloured stones in a vertical line on a mat |
| `cover-herbalism` | bundled drying herbs, a mortar, a folded paper of seed |
| `cover-essential-oils` | small amber bottles, a glass dropper, a sprig of the source plant |
| `cover-almanac` | a farmer's almanac, a moon-phase dial, a sprig of wheat |
| `cover-meditation` | a worn cushion, a struck bowl and beater, a mala |
| `cover-dreams` | an unmade bed corner, a notebook and pencil, a guttered candle |
| `cover-runes` | scattered rune tiles on a cloth, a drawstring bag |

Remember the crop: the **bottom-right quarter gets cut off** on the domain
hero. Put nothing essential there.

---

## 6. The open-ended domains — tranches, not the whole list

These four have too many entries to draw exhaustively (447 between them). Do
them in tranches; each tranche is chosen so a whole *category* inside the domain
completes at once, which is what makes the Library feel finished rather than
patchy.

| Domain | Total | First tranche | What to draw |
|---|---|---|---|
| **Crystals** | 151 | **19 quartz family** → then 15 chalcedony | The specimen itself — raw or tumbled as that stone is usually met. Accurate habit and colour; a crystal drawn with the wrong crystal system is the one error this audience will catch. Filenames are the entry id verbatim: `clear-quartz.png`, `amethyst.png`, `citrine.png`, `rose-quartz.png`, `smoky-quartz.png`, `selenite.png` … |
| **Herbalism** | 127 | **9 calming** → 8 digestive → 6 adaptogen | A botanical plate: the living plant, leaf and flower, in the manner of a herbal. Filenames are the id verbatim: `chamomile.png`, `valerian.png`, `lemon-balm.png`, `ginger.png`, `peppermint.png` … |
| **Essential oils** | 76 | — | **Check the herb set first.** Many oils come from plants already drawn for Herbalism (lavender, peppermint, ginger). Where the species overlaps, the oil entry gets a small amber bottle **with that plant's sprig beside it**, so the two sets read as related rather than duplicated. Filenames: `oil-lavender.png`, `oil-peppermint.png`, `oil-tea-tree.png` … |
| **Dreams** | 93 | **23 common scenarios** — the marquee set | The dream's central *image* as an object or a small stage, never a person having the dream. Falling: a shoe over an edge. Teeth: teeth on a washbasin rim. Chased: a doorway with something just past the frame. Filenames: `dream-falling.png`, `dream-flying.png`, `dream-being-chased.png`, `dream-teeth-falling-out.png`, `dream-unprepared-exam.png`, `dream-naked-in-public.png` … |

**Meditation (43)** deliberately isn't in this table. Its entries are
techniques, not things — "focused attention", "body scan", "loving-kindness" —
and the honest illustration of a technique is a person doing it, which the
house style forbids. Do the 11 domain covers instead and leave meditation
entries on their letter fallback until we decide what a technique should look
like. That's a real design question, not a drawing task.

---

## 7. What NOT to draw

- **Anything at 20px.** The chart wheel's sign ring uses line-art SVG and keeps
  it. Painted plates are mud at that size.
- **Replacements for the existing Library zodiac emblems.** Those small engraved
  medallions with foliage are a coherent set built for that surface. They stay.
- **Meditation technique entries** — see above.
- **`SortBlock` art.** Eleven of these exist across the courses and the block
  type has no image support at all. Nothing to fill.
- **`FlipBlock` art**, yet. The component is built and shipped but no lesson
  uses it. If you want it, that's a content decision first (3-up grid, 168px
  tall, **crops** rather than fits, roughly a tarot-card ratio).

---

## 8. Sending them back

One flat folder per category, PNGs named exactly as listed. Filenames are the
only thing that must be perfect — they're the reference-entry ids and they
become the image paths verbatim.

When a set arrives I: key the white out with the app's own algorithm, resize,
install, add the one-line `image:` field to that domain's reference factory
(most of them don't have one yet — that's a code change on my side, not
something you need to handle), then QA every plate against this brief and
report anything off before it ships.
