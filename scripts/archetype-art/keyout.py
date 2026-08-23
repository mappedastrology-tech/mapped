"""Key the white ground out of the painted plates.

The art is painted on white paper, and the whole job is deciding, pixel by
pixel, which white is the paper and which white is paint. Three signals settle
it, and all three are needed — each one alone gets a whole class of plate wrong.

1. CONNECTIVITY, loosely. A flood fill from the image border at a permissive
   threshold marks everything the paper can reach. This is what opens up the
   cells of a white spider's web: they are the paper, seen through gaps between
   the strands, and they reach the border through those gaps.

2. WHAT MAY BE CUT, strictly. Reachability says where the cut is allowed to go,
   not what it takes. A pixel is only removed if it looks like this image's own
   paper: as bright as the measured ground, flat (paper has no texture), and
   NEUTRAL. The colour test does most of the work — the ground is neutral white,
   while painted white is tinted: cream paper reads about 19 points of chroma
   against the ground's 0-1. Without it, the soft edge where a white subject
   meets the ground bridges the two, and the fill runs into the subject: it ate
   the pages of Mina Harker's journal, the flap of Darcy's letter, the swan's
   back and the dragon's clouds, all of which then showed the app's background
   through them.

3. ENCLOSED GAPS. White fully enclosed by paint — the space inside a timber
   frame, a doorway, the openings in a bridle — cannot reach the border, so it
   is added when it is as bright as the ground. Real subject material reads
   meaningfully darker and survives.

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
FLAT_SD = 3.0                # paper is flat; painted white carries texture
PAPER_BELOW_GROUND = 2.0     # how far under the measured ground still reads as paper
CHROMA_TOL = 5.0             # the ground is neutral; tinted white is paint


def keyout(path):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    lum = a.max(axis=2)
    chroma = lum - a.min(axis=2)

    # Measure THIS image's paper rather than assuming a constant: exports vary,
    # and a fixed threshold is what makes a slightly-grey scan lose its subject.
    ring = np.concatenate([lum[:8, :].ravel(), lum[-8:, :].ravel(),
                           lum[:, :8].ravel(), lum[:, -8:].ravel()])
    ground = float(np.median(ring))
    cring = np.concatenate([chroma[:8, :].ravel(), chroma[-8:, :].ravel(),
                            chroma[:, :8].ravel(), chroma[:, -8:].ravel()])
    gchroma = float(np.percentile(cring, 90))

    m = ndimage.uniform_filter(lum, 7)
    sd = np.sqrt(np.maximum(ndimage.uniform_filter(lum * lum, 7) - m * m, 0))
    paperlike = ((lum >= ground - PAPER_BELOW_GROUND)
                 & (sd < FLAT_SD)
                 & (chroma <= gchroma + CHROMA_TOL))

    lab, n = ndimage.label(lum >= LO)
    if n == 0:
        return im.convert("RGBA")
    border = np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]])
    edge_ids = {int(v) for v in np.unique(border) if v}
    reach = np.isin(lab, list(edge_ids)) if edge_ids else np.zeros_like(lum, bool)

    idx = np.arange(1, n + 1)
    means = ndimage.mean(lum, lab, idx)
    sizes = ndimage.sum(np.ones_like(lum), lab, idx)
    gaps = [int(i) for i, mn, s in zip(idx, means, sizes)
            if int(i) not in edge_ids and s >= ENCLOSED_MIN_PX and mn >= ENCLOSED_MEAN]
    if gaps:
        reach |= np.isin(lab, gaps)

    bg = reach & paperlike
    # Feather two pixels into the soft painted edge, but only inside the region
    # the flood could reach — so the ramp can never start eating a neighbour.
    cut = bg | (ndimage.binary_dilation(bg, iterations=2) & reach)

    alpha = np.full(lum.shape, 255.0, np.float32)
    alpha[cut] = np.clip((HI - lum[cut]) / (HI - LO), 0.0, 1.0) * 255.0
    alpha = ndimage.gaussian_filter(alpha, sigma=0.6)   # feather the matte edge
    return Image.fromarray(np.dstack([a, alpha]).astype(np.uint8), "RGBA")


def render(src, dst, size=512):
    """Key, resize and write one plate. Writes via .part + rename so a run that
    is interrupted can never leave a 0-byte plate behind."""
    tmp = dst + ".part"
    keyout(src).resize((size, size), Image.LANCZOS).save(tmp, "WEBP", quality=85, method=6)
    os.replace(tmp, dst)


if __name__ == "__main__":
    mapping = json.load(open("/tmp/final_mapping.json"))
    outdir = "/root/mapped/public/archetypes"
    os.makedirs(outdir, exist_ok=True)
    for fname, aid in mapping.items():
        src = ("/root/.claude/uploads/7a154441-31bc-5057-8119-e90530864a4c/a4cd38c7-Sun_at_its_zenith.png"
               if aid == "arch.star.sovereign" else f"/tmp/arch96/{fname}")
        render(src, f"{outdir}/{aid}.webp")
    print("processed", len(mapping))
