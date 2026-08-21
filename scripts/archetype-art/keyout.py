"""Key the white ground out of the archetype plates.

The art is painted on pure white by design. A naive whiteness threshold punches
holes in subjects that are themselves pale (paper, sand, snow, bone), so the
background is found by FLOOD FILL from the image border: only white connected to
the edge is removed, and interior pales stay opaque.

That alone leaves enclosed gaps opaque — the cells inside a spider's web, the
openings in a timber frame, the space between scissor blades — so enclosed white
regions are also removed when they are as bright as the ground itself
(mean luminance >= ENCLOSED_MEAN). Real subject material reads meaningfully
darker (sand ~235, shaded paper ~232), so it survives.

A luminance ramp across the boundary keeps the deliberately soft, irregular
painted edges from turning into a hard matte line.
"""
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
import numpy as np
from scipy import ndimage
import json, os

HI, LO = 250.0, 222.0        # lum >= HI fully transparent; <= LO fully opaque
ENCLOSED_MEAN = 248.0        # enclosed white this bright is a gap, not subject
ENCLOSED_MIN_PX = 150        # ignore speckle-sized components

def keyout(path):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    lum = a.max(axis=2)
    loose = lum >= LO
    lab, n = ndimage.label(loose)
    if n == 0:
        return im.convert("RGBA")

    border = np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]])
    bg_ids = {int(v) for v in np.unique(border) if v}

    # Enclosed gaps as bright as the ground count as background too.
    idx = np.arange(1, n + 1)
    means = ndimage.mean(lum, lab, idx)
    sizes = ndimage.sum(np.ones_like(lum), lab, idx)
    for i, m, s in zip(idx, means, sizes):
        if int(i) not in bg_ids and s >= ENCLOSED_MIN_PX and m >= ENCLOSED_MEAN:
            bg_ids.add(int(i))

    bg = np.isin(lab, list(bg_ids))
    alpha = np.full(lum.shape, 255.0, np.float32)
    alpha[bg] = np.clip((HI - lum[bg]) / (HI - LO), 0.0, 1.0) * 255.0
    alpha = ndimage.gaussian_filter(alpha, sigma=0.6)   # feather the matte edge
    return Image.fromarray(np.dstack([a, alpha]).astype(np.uint8), "RGBA")

if __name__ == "__main__":
    mapping = json.load(open("/tmp/final_mapping.json"))
    outdir = "/root/mapped/public/archetypes"
    os.makedirs(outdir, exist_ok=True)
    for fname, aid in mapping.items():
        src = ("/root/.claude/uploads/7a154441-31bc-5057-8119-e90530864a4c/a4cd38c7-Sun_at_its_zenith.png"
               if aid == "arch.star.sovereign" else f"/tmp/arch96/{fname}")
        keyout(src).resize((512, 512), Image.LANCZOS).save(
            f"{outdir}/{aid}.webp", "WEBP", quality=85, method=6)
    print("processed", len(mapping))
