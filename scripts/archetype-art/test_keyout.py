"""Guard for the two ways the key can be wrong on a synthetic plate.

Both failures below are real ones this code has had. Run: python3 test_keyout.py
"""
import sys, os, tempfile
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from keyout import keyout


def plate():
    """White paper with two shapes on it.

    LEFT  — a solid orange disc carrying a cream highlight, which is what a
            painted highlight actually measures (the flame cores on num-3 came
            in at 253,249,231 — about 22 points of chroma). It is as bright and
            as flat as the paper, so brightness cannot tell them apart. It must
            stay opaque.
    RIGHT — an orange ring around untouched paper. That paper is a real gap and
            must be cut, or the plate shows a white blob on a dark screen.

    What this does NOT claim: a highlight painted in perfectly neutral white,
    enclosed by paint, is optically identical to an enclosed scrap of paper.
    Nothing in the image separates them, and the key will cut it. Chroma is the
    signal that works because painted white is in practice tinted.
    """
    a = np.full((256, 256, 3), 255, np.uint8)
    yy, xx = np.mgrid[0:256, 0:256]
    disc = (yy - 128) ** 2 + (xx - 64) ** 2 < 45 ** 2
    a[disc] = (235, 140, 40)
    # A painted highlight is not one flat colour: it is cream carrying scattered
    # pure-white brush hits. Those hits are neutral, flat and paper-bright, so
    # they seed a cut, and the two-pixel feather then spreads it through the
    # cream around them. That interleaving is what actually punched the holes in
    # the flames, so the test has to have it.
    hl = (yy - 128) ** 2 + (xx - 64) ** 2 < 20 ** 2
    rng = np.random.default_rng(7)
    a[hl] = np.where(rng.random((hl.sum(), 1)) < 0.35,
                     np.array([255, 255, 255], np.uint8),
                     np.array([253, 249, 231], np.uint8))
    r = (yy - 128) ** 2 + (xx - 192) ** 2
    a[(r < 45 ** 2) & (r > 26 ** 2)] = (235, 140, 40)
    return a


def main():
    a = plate()
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "t.png")
        Image.fromarray(a).save(p)
        alpha = np.asarray(keyout(p))[..., 3]

    yy, xx = np.mgrid[0:256, 0:256]
    highlight = (yy - 128) ** 2 + (xx - 64) ** 2 < 9 ** 2
    gap = (yy - 128) ** 2 + (xx - 192) ** 2 < 20 ** 2
    ground = (xx < 12)

    fail = []
    if alpha[highlight].min() < 250:
        fail.append(f"highlight inside paint was cut (min alpha {alpha[highlight].min()})")
    if alpha[gap].max() > 8:
        fail.append(f"enclosed paper gap was kept (max alpha {alpha[gap].max()})")
    if alpha[ground].max() > 4:
        fail.append(f"the ground itself was kept (max alpha {alpha[ground].max()})")

    if fail:
        print("FAIL")
        for f in fail:
            print(" -", f)
        raise SystemExit(1)
    print("ok — highlight kept, enclosed gap cut, ground cut")


if __name__ == "__main__":
    main()
