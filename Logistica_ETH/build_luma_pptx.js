// Editable PowerPoint for the Luma event cover (square 1:1, 1600 x 1600 px; Luma recommends >= 800 x 800).
// Built from the A3 teaser look. No QR or URL: registration happens on the Luma event page itself.
// Keep important content away from the corners: Luma rounds them.
// 1 slide pixel = 0.01 inch.  Run: NODE_PATH=<dir with pptxgenjs> node build_luma_pptx.js
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const ASSETS = path.join(__dirname, "..", "07_Codigo", "A3_desde_Roche", "assets");
const OUT = path.join(__dirname, "luma");
fs.mkdirSync(OUT, { recursive: true });

const NAVY = "061433", SKY = "8CCBF2", SOFT = "C9D6EC", INK = "0B2554", BLUE = "1B5DAA", WHITE = "FFFFFF";
const HEAD = "Eurostile", BODY = "Arial";
const S = 1600;
const px = (n) => n / 100;
const pt = (n) => Math.round(n * 0.72 * 100) / 100; // px -> pt at 100 px per inch

const pres = new pptxgen();
pres.defineLayout({ name: "LUMA", width: px(S), height: px(S) });
pres.layout = "LUMA";
pres.title = "OILS26 Luma cover";
const s = pres.addSlide();
s.background = { color: NAVY };
s.addImage({ path: path.join(ASSETS, "bg_teaser.jpg"), x: 0, y: 0, w: px(S), h: px(S), sizing: { type: "cover", w: px(S), h: px(S) }, altText: "OILS pattern background" });
s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: px(S), h: px(S), fill: { color: NAVY, transparency: 70 }, line: { type: "none" } });

const t = (value, x, y, w, h, size, o = {}) =>
  s.addText(value, { x: px(x), y: px(y), w: px(w), h: px(h), fontFace: o.face || HEAD, fontSize: pt(size),
    bold: o.bold !== false, color: o.color || WHITE, margin: 0, valign: "top", isTextBox: true,
    charSpacing: o.spacing, lineSpacingMultiple: o.line, fit: "none" });

const L = 120, W = 1360; // content column, 120 px from the edges
s.addImage({ path: path.join(ASSETS, "oils_logo_fallback.png"), x: px(L), y: px(110), w: px(420), h: px(188), altText: "OILS logo" });
t("#OILS26 Conference", L, 345, W, 60, 46, { face: BODY, color: SKY });
t("From Bit\nto Bench", L, 410, W, 400, 190, { line: 0.95 });
s.addText([
  { text: "Shaping sust", options: { color: SOFT } },
  { text: "AI", options: { color: SKY, bold: true } },
  { text: "nable & ethical", options: { color: SOFT, breakLine: true } },
  { text: "innovation in life sciences", options: { color: SOFT } },
], { x: px(L), y: px(850), w: px(W), h: px(150), fontFace: BODY, fontSize: pt(54), bold: false, margin: 0, valign: "top", isTextBox: true, lineSpacingMultiple: 1.0, fit: "none" });
s.addShape(pres.ShapeType.rect, { x: px(L), y: px(1030), w: px(W), h: px(4), fill: { color: "75CBE9" }, line: { type: "none" } });
t("20 OCTOBER 2026", L, 1065, W, 120, 100, { color: SKY });
t("UNIVERSITY OF ZURICH, SWITZERLAND", L, 1190, W, 60, 42, { face: BODY, bold: false, spacing: 2 });

// Roche site-visit card (same content as the teaser)
s.addShape(pres.ShapeType.roundRect, { x: px(L), y: px(1290), w: px(W), h: px(210), rectRadius: px(34),
  fill: { color: WHITE }, line: { type: "none" } });
s.addImage({ path: path.join(ASSETS, "logo_roche.png"), x: px(165), y: px(1335), w: px(250), h: px(130), altText: "Roche logo" });
s.addShape(pres.ShapeType.rect, { x: px(450), y: px(1325), w: px(3), h: px(140), fill: { color: "DBE7F4" }, line: { type: "none" } });
t("ROCHE SITE VISIT  |  WEDNESDAY 21 OCTOBER", 490, 1328, 960, 40, 28, { face: BODY, color: BLUE, spacing: 1 });
t("Visit Roche in Basel", 490, 1372, 960, 80, 66, { color: INK });
t("Limited places. Express interest by 15 October.", 490, 1450, 960, 40, 30, { face: BODY, bold: false, color: INK });

pres.writeFile({ fileName: path.join(OUT, "OILS26_Luma_cover_1600x1600.pptx") }).then(() => console.log("ok"));
