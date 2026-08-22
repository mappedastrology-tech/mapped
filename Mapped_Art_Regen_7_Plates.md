# Mapped — Regenerate 7 plates

All 165 plates you sent are installed and live. **158 are correct and on-brief.**
This covers the 7 that need a re-run, plus one swap I already fixed for you.

---

## What went wrong (so it doesn't happen again)

The original brief said *"Re-use The Anvil as the style anchor."* On these seven,
the model anchored on the anvil's **subject** rather than its **style** — so it
painted the anvil and then decorated it with the brief's detail. The stitching,
the web, the lens, the birds are all rendered correctly. They're just sitting on
an anvil that shouldn't be in the picture.

**Fix for the re-run:** keep the anvil attached as the style reference, but add
this line to the prompt, every time:

> The reference image is for PAINT STYLE ONLY — brushwork, lighting, edge
> quality, white ground. Do not include an anvil, a blacksmith's tool, or any
> part of the reference's subject in the image. The only subject is the one
> described below.

Generate these seven in **one fresh chat** with the anchor re-attached, and check
each one before moving on.

---

## The 7 plates

Same output spec as before: 1024×1024 PNG, painted plate on pure white, no
ground plane, no shadow cast onto a surface, no text, no human faces.
**Filenames must match exactly** — they're the library IDs.

| File | Subject | Paint this | Palette |
|---|---|---|---|
| `character.ahab.png` | **Ahab** (*Moby-Dick*) | a carved whalebone leg braced against a ship's deck plank | whale ivory, tar black, sea grey |
| `character.emma_woodhouse.png` | **Emma Woodhouse** (*Emma*) | a hand-drawn portrait sketch, unfinished, beside a matchmaker's list of names | pencil grey, paper cream, rose |
| `character.frankensteins_creature.png` | **Frankenstein's Creature** (*Frankenstein*) | a hand-stitched patchwork of mismatched leathers, the sutures still raw | grey flesh tone, black thread, wound red |
| `character.moriarty.png` | **Moriarty** (*The Final Problem*) | a spider's web strung across a blackboard of abstruse equations | chalk white, slate black, grey |
| `character.sherlock_holmes.png` | **Sherlock Holmes** | a magnifying lens laid over a single unremarkable footprint | brass, glass grey, ash |
| `animal.crow.png` | **Crow** | a crow perched with head cocked, eye bright — natural-history plate, no perch, no ground | matte black, grey sheen, bone beak |
| `animal.hawk.png` | **Hawk** | a hawk perched, breast barred, eye fixed forward — natural-history plate, no perch, no ground | russet brown, cream barring, yellow cere |

For the two birds: "perched" in the brief is what invited a perch object. Say
**"standing, no perch and no branch, floating on white"** instead.

---

## What I fixed without asking

- **Mowgli and Tarzan had each other's art.** `character.mowgli` came back with
  Tarzan's vine-wrapped knife; `character.tarzan` had Mowgli's trap ring and red
  flower. Both subjects were painted correctly — they were just filed under the
  wrong names. I swapped the files. Nothing to redo.
- **`character.mina_harker` was a 0-byte file** after a processing job was cut
  short on my side. Re-keyed from your 1024 source; it's correct now.

## What I did to all 165

Re-keyed the backgrounds from your 1024 PNGs with the same algorithm used on the
original 96 archetypes, rather than using the bundled 512 webps — so all 253
installed plates come out of one identical pass and match each other exactly.
Then verified every one: no corrupt files, no opaque backgrounds, no plate with
its subject eaten by the key.

## Still with no art

The **108 deities** have no plates and weren't part of this batch — they fall
back to a glyph in the app. That's fine as-is; say the word if you want a brief
for them.
