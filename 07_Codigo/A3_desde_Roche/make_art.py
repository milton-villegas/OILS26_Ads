"""Generates the raster artwork for the OILS26 A3 posters (300 dpi, A3 portrait).

  bg_teaser.jpg / bg_agenda.jpg  navy field, glow from the top-right corner and the
                                 OILS line pattern, masked so it stays away from type
  qr_oils2026.png                plain square-module QR, navy on white, ECC level Q

Run with python3.12 (needs Pillow, numpy, qrcode)."""
import os
import numpy as np
import qrcode
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(HERE, "assets")
PATTERN = os.path.join(ROOT, "06_Recursos", "marca", "OILSpattern_LINEwhite_BGtransparent_v09_02.png")

DPI = 300
W, H = round(297 / 25.4 * DPI), round(420 / 25.4 * DPI)   # 3508 x 4961
QR_URL = "https://www.b2match.com/e/oils2026"


def hexrgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32) / 255


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def background(name, glow_r, pat_peak, pat_floor, pat_r, calm=()):
    """calm: (cx, cy, rx, ry, level) soft ellipses in mm where the pattern is held
    down to `level`, so captions never sit on dense line-work."""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u, v = xx / W, yy / W                       # both in page-widths, so circles stay round
    # distance from the top-right corner, in page widths
    d = np.sqrt((1 - u) ** 2 + v ** 2)

    deep, mid = hexrgb("#061433"), hexrgb("#0C275C")
    t = smooth((u * 0.55 + (1 - yy / H) * 0.75) / 1.1)
    img = deep * (1 - t[..., None]) + mid * t[..., None]

    glow = np.exp(-(d / glow_r) ** 2)[..., None]
    gcol = hexrgb("#2F80D4")
    img = 1 - (1 - img) * (1 - gcol * glow * 0.80)          # screen blend

    # pattern: one copy of the brand tile, ~15 mm per icon cell
    pat = Image.open(PATTERN).convert("RGBA")
    scale = 0.92
    cw, ch = int(W / scale), int(H / scale)
    pat = pat.crop((0, 0, min(cw, pat.width), min(ch, pat.height)))
    pat = pat.resize((W, H), Image.LANCZOS)
    pa = np.asarray(pat, dtype=np.float32)[..., 3] / 255

    mask = pat_floor + (pat_peak - pat_floor) * np.exp(-(d / pat_r) ** 2)
    xmm, ymm = xx / W * 297, yy / H * 420
    for cx, cy, rx, ry, level in calm:
        r = np.sqrt(((xmm - cx) / rx) ** 2 + ((ymm - cy) / ry) ** 2)
        inside = 1 - smooth((r - 0.7) / 0.6)
        mask = mask * (1 - inside) + np.minimum(mask, level) * inside
    a = (pa * mask)[..., None]
    img = img * (1 - a) + 1.0 * a

    out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8), "RGB")
    out.save(os.path.join(OUT, name), quality=93, dpi=(DPI, DPI), subsampling=0)
    print("wrote", name, out.size)


def qr(name):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, border=0, box_size=1)
    q.add_data(QR_URL)
    q.make(fit=True)
    m = np.array(q.get_matrix(), dtype=bool)
    n = m.shape[0]
    px = 40
    navy = (6, 20, 51)
    a = np.full((n, n, 3), 255, np.uint8)
    a[m] = navy
    Image.fromarray(a).resize((n * px, n * px), Image.NEAREST).save(os.path.join(OUT, name))
    print("wrote", name, f"{n} modules (version {q.version})")


if __name__ == "__main__":
    background("bg_teaser.jpg", glow_r=0.56, pat_peak=0.42, pat_floor=0.03, pat_r=0.46)
    background("bg_agenda.jpg", glow_r=0.46, pat_peak=0.40, pat_floor=0.022, pat_r=0.36,
               calm=[(253, 74, 42, 11, 0.06), (215, 104, 70, 7, 0.05)])
    qr("qr_oils2026.png")
