"""Build the two OILS26 ETH screen graphics from the approved poster assets."""

from __future__ import annotations

import base64
import html
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "07_Codigo" / "A3_desde_Roche" / "assets"
OUT = Path(__file__).resolve().parent


def data_uri(filename: str, mime: str) -> str:
    encoded = base64.b64encode((ASSETS / filename).read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


BACKGROUND = data_uri("bg_teaser.jpg", "image/jpeg")
OILS = data_uri("oils_logo_fallback.png", "image/png")
ROCHE = data_uri("logo_roche.png", "image/png")
SPONSORS = [
    ("logo_wesemann.png", 1500, 289),
    ("logo_roche.png", 3840, 1996),
    ("logo_kanton_zurich.png", 1152, 402),
    ("logo_microsynth.png", 1181, 327),
    ("logo_nucleate.png", 1736, 242),
    ("logo_lsz_business.png", 903, 292),
    ("logo_innovation_zurich.png", 6446, 1534),
    ("logo_eth_alumni.png", 851, 133),
]


def text(x: int, y: int, value: str, size: int, *, weight: int = 400,
         fill: str = "#fff", spacing: int = 0) -> str:
    return (
        f'<text x="{x}" y="{y}" fill="{fill}" font-family="Helvetica,Arial,sans-serif" '
        f'font-size="{size}" font-weight="{weight}" letter-spacing="{spacing}">'
        f'{html.escape(value)}</text>'
    )


def shell(width: int, height: int, content: str) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
    <image href="{BACKGROUND}" width="{width}" height="{height}" preserveAspectRatio="xMidYMid slice"/>
    <rect width="{width}" height="{height}" fill="#061538" opacity="0.18"/>
    {content}
    </svg>'''


def sponsor_panel(width: int, y: int, height: int, *, logo_height: int) -> str:
    side_margin = 36
    cell_width = (width - 2 * side_margin) / 4
    if height <= 250:
        first_row = y + 54
        second_row = y + height - logo_height - 16
    else:
        first_row = y + 73
        second_row = y + height - logo_height - 31
    parts = [
        f'<rect x="0" y="{y}" width="{width}" height="{height}" fill="#ffffff"/>',
        text(70, y + 44, "SPONSORS & PARTNERS", 24, weight=700,
             fill="#1a3563", spacing=2),
    ]
    for index, (filename, image_width, image_height) in enumerate(SPONSORS):
        col, row = index % 4, index // 4
        max_width = cell_width - 36
        scale = min(max_width / image_width, logo_height / image_height)
        actual_width = image_width * scale
        actual_height = image_height * scale
        x = side_margin + col * cell_width + (cell_width - actual_width) / 2
        row_top = first_row if row == 0 else second_row
        logo_y = row_top + (logo_height - actual_height) / 2
        parts.append(
            f'<image href="{data_uri(filename, "image/png")}" x="{x:.1f}" '
            f'y="{logo_y:.1f}" width="{actual_width:.1f}" height="{actual_height:.1f}"/>'
        )
    return "\n".join(parts)


portrait = shell(1080, 1920, "\n".join([
    f'<image href="{OILS}" x="78" y="76" width="300" height="134"/>',
    text(78, 346, "#OILS26 CONFERENCE", 38, weight=700, fill="#86d2f1", spacing=2),
    text(73, 486, "From Bit to", 116, weight=700),
    text(73, 613, "Bench", 142, weight=700),
    text(78, 702, "Shaping sustainable & ethical", 37, fill="#d1eafa"),
    text(78, 750, "innovation in life sciences", 37, fill="#d1eafa"),
    '<rect x="78" y="784" width="924" height="3" fill="#75cbe9" opacity="0.75"/>',
    text(78, 872, "20 OCTOBER 2026", 65, weight=700, fill="#8bd9f4"),
    text(78, 929, "UNIVERSITY OF ZURICH", 38, weight=600),
    '<rect x="78" y="995" width="924" height="300" rx="28" fill="#ffffff"/>',
    text(123, 1052, "SPONSOR & SITE VISIT", 27, weight=700, fill="#1b5daa", spacing=1),
    f'<image href="{ROCHE}" x="720" y="1014" width="227" height="118"/>',
    text(123, 1155, "Visit Roche in Basel", 58, weight=700, fill="#102d62"),
    text(123, 1222, "21 OCTOBER 2026", 43, weight=700, fill="#1b5daa"),
    text(123, 1271, "Programme & visit details online", 30, fill="#233e6c"),
    '<rect x="78" y="1335" width="924" height="105" rx="20" fill="#87d0ed"/>',
    text(123, 1401, "Register & explore the agenda", 44, weight=700, fill="#092750"),
    text(78, 1522, "b2match.com/e/oils2026", 47, weight=700),
    sponsor_panel(1080, 1560, 360, logo_height=94),
]))


landscape = shell(1920, 1080, "\n".join([
    f'<image href="{OILS}" x="80" y="42" width="225" height="101"/>',
    text(84, 228, "#OILS26 CONFERENCE", 36, weight=700, fill="#86d2f1", spacing=2),
    text(78, 347, "From Bit to", 108, weight=700),
    text(78, 465, "Bench", 129, weight=700),
    '<rect x="84" y="520" width="1050" height="3" fill="#80d4f0" opacity="0.8"/>',
    text(84, 608, "20 OCTOBER 2026", 60, weight=700, fill="#8bd9f4"),
    text(84, 661, "UNIVERSITY OF ZURICH", 36, weight=600),
    text(84, 727, "REGISTER & VIEW THE AGENDA", 28, weight=700, fill="#d4edfa", spacing=1),
    '<rect x="78" y="744" width="1110" height="90" rx="18" fill="#87d0ed"/>',
    text(118, 806, "b2match.com/e/oils2026", 53, weight=700, fill="#092750"),
    '<rect x="1270" y="82" width="570" height="752" rx="28" fill="#ffffff"/>',
    text(1320, 153, "SPONSOR & SITE VISIT", 26, weight=700, fill="#1b5daa", spacing=1),
    f'<image href="{ROCHE}" x="1370" y="200" width="370" height="192"/>',
    '<rect x="1320" y="410" width="470" height="3" fill="#dbe7f4"/>',
    text(1320, 492, "VISIT ROCHE", 53, weight=700, fill="#102d62"),
    text(1320, 554, "IN BASEL", 53, weight=700, fill="#102d62"),
    text(1320, 630, "21 OCTOBER", 38, weight=700, fill="#1b5daa"),
    text(1320, 691, "Programme &", 33, fill="#233e6c"),
    text(1320, 734, "visit details online", 33, fill="#233e6c"),
    sponsor_panel(1920, 850, 230, logo_height=72),
]))


for name, svg, width, height in (
    ("OILS26_ETH_vertical_1080x1920", portrait, 1080, 1920),
    ("OILS26_ETH_eLink_1920x1080", landscape, 1920, 1080),
):
    source = OUT / f"{name}.svg"
    target = OUT / f"{name}.png"
    source.write_text(svg, encoding="utf-8")
    with tempfile.TemporaryDirectory() as workdir:
        render_source = Path(workdir) / "overlay.svg"
        overlay = Path(workdir) / "overlay.png"
        background_tag = (f'<image href="{BACKGROUND}" width="{width}" height="{height}" '
                          'preserveAspectRatio="xMidYMid slice"/>')
        render_source.write_text(svg.replace(background_tag, ""), encoding="utf-8")
        subprocess.run(["magick", "-font", "/System/Library/Fonts/Helvetica.ttc",
                        "-background", "none", str(render_source), str(overlay)], check=True)
        subprocess.run(["magick", str(ASSETS / "bg_teaser.jpg"),
                        "-resize", f"{width}x{height}^", "-gravity", "center",
                        "-extent", f"{width}x{height}", str(overlay),
                        "-compose", "over", "-composite", str(target)], check=True)
    print(target)
