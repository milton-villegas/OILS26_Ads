# OILS26 ETH screen ads

Ready-to-use graphics for ETH Campus Services screens:

| Channel | File | Size |
| --- | --- | --- |
| Portrait screens | [PNG](OILS26_ETH_vertical_1080x1920.png) · [editable SVG](OILS26_ETH_vertical_1080x1920.svg) | 1080 × 1920 px |
| ETH eLink bus screens | [PNG](OILS26_ETH_eLink_1920x1080.png) · [editable SVG](OILS26_ETH_eLink_1920x1080.svg) | 1920 × 1080 px |

Both ads take their look from the approved posters in `01_FINAL` (navy pattern background, OILS logo, white Roche card, light-blue call to action) and follow the ETH Campus Services design recommendations (*Gestaltungsempfehlungen für wirkungsvolle Werbemittel*): a short title, large type, What / When / Where, strong contrast, one clear call to action and a readable URL instead of a QR code. To keep them effective on screen the content is reduced to the title, date and venue, the Roche sponsor and site visit (21 October), and [b2match.com/e/oils2026](https://www.b2match.com/e/oils2026). The full sponsor and partner logo wall stays on the print posters.

## Approved poster references

The [final poster files](01_FINAL) show the complete print layouts and sponsor treatment. The PDFs are for printing; the PowerPoint files are editable.

| Poster | Print PDF | Editable PowerPoint |
| --- | --- | --- |
| Teaser A3 | [PDF](01_FINAL/OILS26_teaser_A3.pdf) | [PPTX](01_FINAL/OILS26_teaser_A3.pptx) |
| Agenda A3 | [PDF](01_FINAL/OILS26_agenda_A3.pdf) | [PPTX](01_FINAL/OILS26_agenda_A3.pptx) |
| Teaser A0 | [PDF](01_FINAL/OILS26_teaser_A0.pdf) | [PPTX](01_FINAL/OILS26_teaser_A0_editable.pptx) |

<img src="01_FINAL/OILS26_teaser_A3_vista_previa.png" alt="Final A3 teaser with Roche visit and sponsor logos" width="360">
<img src="01_FINAL/OILS26_agenda_A3_vista_previa.png" alt="Final A3 agenda with sponsor logos" width="360">

## Source files

- [Final logo and background assets](07_Codigo/A3_desde_Roche/assets) include the OILS logo, the Roche logo and the background used in the ads.
- [OILS brand resources](06_Recursos/marca) include the vector OILS logo and pattern artwork.
- [ETH screen generator](Logistica_ETH/build_eth_screens.py) builds the screen PNGs and SVGs from those assets. It renders with headless Chromium (set `CHROME` to override the path) and uses Eurostile, as in the posters, when it is installed; otherwise it falls back to Inter/Helvetica.
- [ETH Campus Services design guidance](Logistica_ETH/cc_gestaltungshinweise_de.pdf) explains the recommendations used for the screen graphics.

The PowerPoint files in `01_FINAL` are the reference for the final print layouts. The Python scripts in `07_Codigo/A3_desde_Roche` document earlier poster generation steps and may require archived inputs that are not part of this delivery.
