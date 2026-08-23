# Mapped — Art Brief: Chinese Zodiac

**You need three images, not twelve.**

Nine of the twelve signs are animals your Animal Guides library already has
painted, in exactly this style. I've copied those across, so the zodiac card on
the profile is showing real art right now for nine signs out of twelve.

| Sign | Status |
|---|---|
| Rat, Ox, Tiger, Dragon, Snake, Horse, Monkey, Rooster, Dog | ✅ done — reused from the animal library |
| **Rabbit, Goat, Pig** | ❌ **need new plates** |

The Dragon is worth calling out: the one in your animal library is already an
Eastern dragon among clouds, so it is the right dragon for this, not a
substitute.

---

## Why these three can't be reused

Your library has a hare, a wild ram and a wild boar. Those are different
animals from the zodiac's, and side by side the difference is obvious — a hare
next to a rabbit reads as a mistake, not a variation.

| Sign | What the library has | Why it doesn't work |
|---|---|---|
| Rabbit (兔) | `animal.hare` — a brown hare, lean, long-legged, huge ears, wild | A hare is not a rabbit. Longer ears and legs, leggy build, and it reads as a wild field animal. |
| Goat (羊) | `animal.ram` — a wild ram with heavy curled horns | A bighorn ram is a different animal from the domestic goat of the zodiac. |
| Pig (猪) | `animal.boar` — a wild boar with tusks and bristles | The zodiac pig is a farm pig. The boar is tusked, dark and bristled — the opposite reading. |

Both sets appear on the same profile page, so a viewer can see them together.
They have to be distinguishable.

---

## The three plates

Same spec as the animal library: **1024×1024 PNG, painted plate on pure white,
whole body, one clear pose, no habitat, no ground plane, no cast shadow, no
text.** Natural-history accuracy, not stylised or cute. I key the white out and
resize on my side — send flat white PNGs, don't pre-cut them.

**Filenames must match exactly.**

| File | Subject | Paint this | Palette |
|---|---|---|---|
| `zodiac.rabbit.png` | **Rabbit** | a domestic rabbit sitting upright, ears raised but SHORT and rounded, body compact and round, soft dense coat | warm grey-brown, cream belly, pink inner ear |
| `zodiac.goat.png` | **Goat** | a domestic goat standing in profile, head turned to the viewer, swept-back ridged horns, beard, slotted eye | cream and tan, horn amber, dark hoof |
| `zodiac.pig.png` | **Pig** | a domestic pig standing in profile, plump, upright ears, curled tail, snub snout — no tusks, no bristles | pale pink, dust ochre, dark trotter |

**Say what it is NOT in each prompt**, since the model will drift to the wild
version otherwise:

- Rabbit: *"a domestic rabbit, NOT a hare — short rounded ears, compact body"*
- Goat: *"a domestic goat, NOT a ram or bighorn sheep — swept-back ridged horns, beard"*
- Pig: *"a domestic farm pig, NOT a wild boar — no tusks, no bristles, smooth pink hide"*

### The anchor warning, again

Keep The Anvil attached as the style reference and put this in every prompt:

> The reference image is for PAINT STYLE ONLY — brushwork, lighting, edge
> quality, white ground. Do not include an anvil, a blacksmith's tool, or any
> part of the reference's subject. The only subject is the one described below.

---

## Optional: the five elements

Not needed for anything to work — say the word only if you want it. Your zodiac
year is named "Yang Wood Dragon", and the profile shows the element as a text
row. Five small emblems would let that row carry a mark instead.

| File | Element | Paint this | Palette |
|---|---|---|---|
| `zodiac.element.wood.png` | Wood | a single new bamboo shoot, leaves just opening | new green, culm gold |
| `zodiac.element.fire.png` | Fire | one clean flame, no fuel beneath it | ember orange, gold, deep red |
| `zodiac.element.earth.png` | Earth | a turned clod of dark earth with a seedling root showing | loam brown, ochre, pale root |
| `zodiac.element.metal.png` | Metal | a small cast bronze bell, unrung | bronze, verdigris, dark patina |
| `zodiac.element.water.png` | Water | a single curling wave crest, no shoreline | jade green, foam white, deep blue |

Keep these **simpler and smaller in the frame** than the animal plates — they
sit next to a line of text, not on their own card.

---

## What happens when you send them

Drop the three PNGs in a folder named as above and I'll key, resize and install
them. Until they arrive, those three signs fall back to a glyph on the profile
card rather than showing a broken image — so nothing is waiting on them.
