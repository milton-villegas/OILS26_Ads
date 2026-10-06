"""The approved "05 bloom" artwork, redrawn for an A3 page at print resolution.

Same recipe as build/plates2.py (bloom_layers, light="top"): soft glow orb, the brand
pattern blown up and masked into a burst off the top-right corner, and a faint
full-page pattern. With light="top" every box is anchored to the top edge, so a
taller page keeps the composition identical and simply extends downwards.

Every pixel constant is multiplied by F, so the 1080-unit-wide design is rendered
at ~300 dpi on a 297 mm page instead of being upscaled from 1080 px.
Output is transparent (the PPTX keeps its navy "Background" rectangle underneath).
"""
import os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
PAT = os.path.join(ROOT, "06_Recursos", "marca", "OILSpattern_LINEwhite_BGtransparent_v09_02.png")
OUT = os.path.join(HERE, "assets")

W0, H0 = 1080, 1350          # design units of the original programme poster
F = 3.25                     # 1080 * 3.25 = 3510 px across 297 mm ~ 300 dpi


def s(v):
    return int(round(v * F))


def pattern(scale, opacity, offset, size):
    p = Image.open(PAT).convert("RGBA").resize((s(scale), s(scale)), Image.LANCZOS)
    p.putalpha(p.getchannel("A").point(lambda v: int(v * opacity)))
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(p, (s(offset[0]), s(offset[1])))
    return canvas


def sphere(size, inner, outer):
    size = s(size)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    steps = 300
    for i in range(steps, 0, -1):
        t = i / steps
        r = size / 2 * t
        c = tuple(round(inner[k] + (outer[k] - inner[k]) * t) for k in range(3))
        a = round(255 * (1 - t) ** 0.85)
        d.ellipse([size / 2 - r, size / 2 - r, size / 2 + r, size / 2 + r], fill=c + (a,))
    return img.filter(ImageFilter.GaussianBlur(size * 0.02))


def overlay(name, h_units, fine_offset_y):
    """h_units: page height in design units; fine_offset_y: vertical offset of the
    faint full-page pattern, taken from the original poster so it lines up the same."""
    size = (s(W0), s(h_units))
    base = Image.new("RGBA", size, (0, 0, 0, 0))
    # bloom_geometry(h, "top"), which reduces to constants
    glow_y = H0 - 470 - 1500
    pat_y = H0 - 420 - 2300
    ell0, ell1 = H0 - 1560, H0 - 500
    base.alpha_composite(sphere(1500, (58, 150, 220), (10, 30, 74)), (s(330), s(glow_y)))
    bloom = pattern(2300, 0.30, (300, pat_y), size)
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).ellipse([s(360), s(ell0), s(1420), s(ell1)], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(s(70)))
    base.alpha_composite(Image.composite(bloom, Image.new("RGBA", size, (0, 0, 0, 0)), mask))
    base.alpha_composite(pattern(1500, 0.07, (-(1500 - W0) // 2, fine_offset_y), size))
    base.save(os.path.join(OUT, name), optimize=True)
    print("wrote", name, size)


if __name__ == "__main__":
    h_a3 = W0 * 420 / 297                       # 1527.3 units
    overlay("bloom_a3_program.png", h_a3, -(1500 - 1350) // 2)
    overlay("bloom_a3_teaser.png", h_a3, -(1500 - 1160) // 2)
