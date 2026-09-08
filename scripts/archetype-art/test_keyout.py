"""Guard for the ways the key can be wrong, on a synthetic plate.

Every case below is a real failure this code has had. Run: python3 test_keyout.py
"""
import sys, os, tempfile
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from keyout import keyout

PAINT = (205, 120, 35)      # a mid orange; real paint bounding a real gap
                            # measured a 43-108 point drop below the paper


def plate():
    """White paper carrying three shapes.

    LEFT   — a painted disc with a highlight on it: cream, carrying scattered
             pure-white brush hits. Those hits are neutral, flat and as bright
             as the paper, so every test that identifies the ground matches them
             too; they seed a cut and the two-pixel feather then spreads it
             through the cream around them. That is what punched holes in the
             flames on num-3 and num-11. It must stay opaque.
    MIDDLE — a painted ring around untouched paper. That paper is a real gap and
             must be cut, or the plate shows a white blob on a dark screen.
    RIGHT  — a glow: pure white at the centre fading outward into cream, with no
             edge anywhere. This is chakra-soul-star, where the key took the
             middle out of the light. It must stay opaque.
    """
    a = np.full((256, 384, 3), 255, np.uint8)
    yy, xx = np.mgrid[0:256, 0:384]
    rng = np.random.default_rng(7)

    disc = (yy - 128) ** 2 + (xx - 64) ** 2 < 45 ** 2
    a[disc] = PAINT
    hl = (yy - 128) ** 2 + (xx - 64) ** 2 < 20 ** 2
    a[hl] = np.where(rng.random((hl.sum(), 1)) < 0.35,
                     np.array([255, 255, 255], np.uint8),
                     np.array([253, 249, 231], np.uint8))

    r = (yy - 128) ** 2 + (xx - 192) ** 2
    a[(r < 45 ** 2) & (r > 26 ** 2)] = PAINT

    d = np.sqrt((yy - 128) ** 2 + (xx - 320) ** 2)
    glow = d < 45
    t = np.clip(d[glow] / 45.0, 0, 1)[:, None]
    a[glow] = (np.array([255, 255, 255]) * (1 - t)
               + np.array([250, 238, 205]) * t).astype(np.uint8)
    return a


def main():
    a = plate()
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "t.png")
        Image.fromarray(a).save(p)
        alpha = np.asarray(keyout(p))[..., 3]

    yy, xx = np.mgrid[0:256, 0:384]
    checks = [
        ("highlight inside paint", (yy - 128) ** 2 + (xx - 64) ** 2 < 9 ** 2, "keep"),
        ("enclosed paper gap", (yy - 128) ** 2 + (xx - 192) ** 2 < 20 ** 2, "cut"),
        ("centre of a glow", (yy - 128) ** 2 + (xx - 320) ** 2 < 16 ** 2, "keep"),
        ("the ground itself", xx < 12, "cut"),
    ]
    fail = []
    for label, mask, want in checks:
        if want == "keep" and alpha[mask].min() < 250:
            fail.append(f"{label} was cut (min alpha {alpha[mask].min()})")
        if want == "cut" and alpha[mask].max() > 8:
            fail.append(f"{label} was kept (max alpha {alpha[mask].max()})")

    if fail:
        print("FAIL")
        for f in fail:
            print(" -", f)
        raise SystemExit(1)
    print("ok — highlight and glow kept, enclosed gap and ground cut")


if __name__ == "__main__":
    main()
