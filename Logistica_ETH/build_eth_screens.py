"""Build the two OILS26 ETH screen graphics from the approved poster assets.

Layout follows the ETH Campus Services "Gestaltungsempfehlungen" (short title,
big type, What/When/Where, strong contrast, one call to action, URL instead of
QR code on screens, "less is more") and reuses the look of the approved posters
in 01_FINAL (navy pattern background, OILS logo, Eurostile headline, sky-blue
date, white Roche card, light-blue call-to-action).

Rendering needs headless Chromium (Playwright's build is fine). Set CHROME to
override its path. The posters use Eurostile; if it is not installed the text
falls back to Inter / Helvetica.
"""

from __future__ import annotations

import base64
import html
import os
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "07_Codigo" / "A3_desde_Roche" / "assets"
OUT = Path(__file__).resolve().parent.parent
CHROME = os.environ.get("CHROME") or next(
    (str(p) for p in sorted(Path("/opt/pw-browsers").glob("chromium-*/chrome-linux/chrome"))),
    "chromium",
)

NAVY_DEEP = "#061433"
SKY = "#8ccbf2"
SOFT = "#c9d6ec"
INK = "#0b2554"
BLUE = "#1b5daa"
HEAD = "Eurostile, 'Eurostile Extended', 'Inter Display', Helvetica, Arial, sans-serif"
BODY = "Aptos, 'Inter', Helvetica, Arial, sans-serif"


def data_uri(filename: str, mime: str) -> str:
    encoded = base64.b64encode((ASSETS / filename).read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


BACKGROUND = data_uri("bg_teaser.jpg", "image/jpeg")
OILS = data_uri("oils_logo_fallback.png", "image/png")
ROCHE = data_uri("logo_roche.png", "image/png")


def text(x: int, y: int, value: str, size: int, *, weight: int = 700,
         fill: str = "#fff", spacing: int = 0, family: str = HEAD) -> str:
    return (
        f'<text x="{x}" y="{y}" fill="{fill}" font-family="{family}" '
        f'font-size="{size}" font-weight="{weight}" letter-spacing="{spacing}">'
        f'{html.escape(value)}</text>'
    )


def shell(width: int, height: int, content: str) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
    <image href="{BACKGROUND}" width="{width}" height="{height}" preserveAspectRatio="xMidYMid slice"/>
    <rect width="{width}" height="{height}" fill="{NAVY_DEEP}" opacity="0.30"/>
    {content}
    </svg>'''


def cta(x: int, y: int, w: int, h: int, label: str, url: str, *, size: int) -> str:
    """Light-blue call-to-action pill: verb on top, big readable URL below."""
    return "\n".join([
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h // 5}" fill="{SKY}"/>',
        text(x + 48, y + int(h * 0.38), label, int(size * 0.62), fill=INK, spacing=1, family=BODY),
        text(x + 48, y + int(h * 0.80), url, size, fill=INK),
    ])


portrait = shell(1080, 1920, "\n".join([
    f'<image href="{OILS}" x="78" y="90" width="380" height="170"/>',
    # What
    text(78, 520, "From Bit", 178),
    text(78, 690, "to Bench", 178),
    text(78, 790, "OILS26 Conference", 46, weight=500, fill=SOFT, spacing=1, family=BODY),
    # When / Where
    '<rect x="78" y="850" width="924" height="4" fill="#75cbe9" opacity="0.8"/>',
    text(78, 970, "20 OCTOBER 2026", 88, fill=SKY),
    text(78, 1048, "University of Zurich", 54, weight=500, family=BODY),
    # Roche sponsor + site visit
    '<rect x="78" y="1120" width="924" height="370" rx="32" fill="#ffffff"/>',
    text(130, 1190, "Sponsor & site visit", 34, weight=700, fill=BLUE, spacing=1, family=BODY),
    f'<image href="{ROCHE}" x="130" y="1250" width="270" height="140"/>',
    text(440, 1285, "Visit Roche", 70, fill=INK),
    text(440, 1365, "in Basel", 70, fill=INK),
    text(440, 1445, "21 OCTOBER", 56, fill=BLUE),
    # Call to action
    cta(78, 1560, 924, 270, "Register & see the agenda", "b2match.com/e/oils2026", size=66),
]))


landscape = shell(1920, 1080, "\n".join([
    f'<image href="{OILS}" x="90" y="70" width="330" height="148"/>',
    # What
    text(90, 440, "From Bit to Bench", 124),
    text(90, 520, "OILS26 Conference", 44, weight=500, fill=SOFT, spacing=1, family=BODY),
    # When / Where
    '<rect x="90" y="570" width="1020" height="4" fill="#75cbe9" opacity="0.8"/>',
    text(90, 670, "20 OCTOBER 2026", 80, fill=SKY),
    text(90, 735, "University of Zurich", 48, weight=500, family=BODY),
    # Call to action
    cta(90, 800, 1020, 190, "Register & see the agenda", "b2match.com/e/oils2026", size=76),
    # Roche sponsor + site visit
    '<rect x="1230" y="120" width="600" height="840" rx="36" fill="#ffffff"/>',
    f'<image href="{ROCHE}" x="1310" y="190" width="440" height="229"/>',
    '<rect x="1290" y="460" width="480" height="4" fill="#dbe7f4"/>',
    text(1290, 560, "Sponsor & site visit", 34, weight=700, fill=BLUE, family=BODY),
    text(1290, 660, "Visit Roche", 76, fill=INK),
    text(1290, 745, "in Basel", 76, fill=INK),
    text(1290, 860, "21 OCTOBER", 62, fill=BLUE),
]))


for name, svg, width, height in (
    ("OILS26_ETH_vertical_1080x1920", portrait, 1080, 1920),
    ("OILS26_ETH_eLink_1920x1080", landscape, 1920, 1080),
):
    source = OUT / f"{name}.svg"
    target = OUT / f"{name}.png"
    source.write_text(svg, encoding="utf-8")
    with tempfile.TemporaryDirectory() as workdir:
        page = Path(workdir) / "page.html"
        page.write_text(
            f'<html><body style="margin:0;background:#061433">{svg}</body></html>',
            encoding="utf-8")
        subprocess.run([CHROME, "--headless=new", "--no-sandbox", "--disable-gpu",
                        "--hide-scrollbars", f"--window-size={width},{height + 200}",
                        f"--screenshot={target}", page.as_uri()], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["convert", str(target), "-crop", f"{width}x{height}+0+0",
                        "+repage", str(target)], check=True)
    print(target)
