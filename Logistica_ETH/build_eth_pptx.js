// Editable PowerPoint versions of the two OILS26 ETH screen graphics.
// Same layout as build_eth_screens.py; 1 slide pixel = 0.01 inch.
const path = require("path");
const pptxgen = require("pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "07_Codigo", "A3_desde_Roche", "assets");
const BG = path.join(ASSETS, "bg_teaser.jpg");
const OILS = path.join(ASSETS, "oils_logo_fallback.png");
const ROCHE = path.join(ASSETS, "logo_roche.png");

const NAVY_DEEP = "061433", SKY = "8CCBF2", SOFT = "C9D6EC", INK = "0B2554", BLUE = "1B5DAA", WHITE = "FFFFFF";
const HEAD = "Eurostile", BODY = "Arial";
const px = (n) => n / 100;
const pt = (n) => Math.round(n * 0.72);

function build(file, W, H, draw) {
  const pres = new pptxgen();
  pres.defineLayout({ name: "SCREEN", width: px(W), height: px(H) });
  pres.layout = "SCREEN";
  pres.title = "OILS26 ETH screen ad";
  const s = pres.addSlide();
  s.background = { color: NAVY_DEEP };
  s.addImage({ path: BG, x: 0, y: 0, w: px(W), h: px(H), sizing: { type: "cover", w: px(W), h: px(H) }, altText: "OILS pattern background" });
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: px(W), h: px(H), fill: { color: NAVY_DEEP, transparency: 70 }, line: { type: "none" } });
  const t = (value, x, y, w, h, size, o = {}) =>
    s.addText(value, { x: px(x), y: px(y), w: px(w), h: px(h), fontFace: o.face || HEAD, fontSize: pt(size),
      bold: o.bold !== false, color: o.color || WHITE, margin: 0, valign: "top", isTextBox: true,
      charSpacing: o.spacing, lineSpacingMultiple: o.line, fit: "none" });
  draw({ pres, s, t });
  return pres.writeFile({ fileName: path.join(ROOT, file) });
}

function cta(ctx, x, y, w, h, urlSize) {
  const { pres, s, t } = ctx;
  s.addShape(pres.ShapeType.roundRect, { x: px(x), y: px(y), w: px(w), h: px(h), rectRadius: px(h / 5),
    fill: { color: SKY }, line: { type: "none" } });
  t("Register & see the agenda", x + 48, y + h * 0.14, w - 96, h * 0.28, 40, { face: BODY, color: INK });
  t("b2match.com/e/oils2026", x + 48, y + h * 0.46, w - 96, h * 0.42, urlSize, { color: INK });
}

const vertical = build("OILS26_ETH_vertical_1080x1920.pptx", 1080, 1920, (ctx) => {
  const { pres, s, t } = ctx;
  s.addImage({ path: OILS, x: px(78), y: px(90), w: px(380), h: px(170), altText: "OILS logo" });
  t("From Bit\nto Bench", 78, 330, 924, 420, 150, { line: 1.0 });
  t("OILS26 Conference", 78, 770, 924, 60, 44, { face: BODY, bold: false, color: SOFT });
  s.addShape(pres.ShapeType.rect, { x: px(78), y: px(850), w: px(924), h: px(4), fill: { color: "75CBE9" }, line: { type: "none" } });
  t("20 OCTOBER 2026", 78, 890, 924, 110, 80, { color: SKY });
  t("University of Zurich", 78, 1000, 924, 80, 52, { face: BODY, bold: false });
  s.addShape(pres.ShapeType.roundRect, { x: px(78), y: px(1120), w: px(924), h: px(370), rectRadius: px(32),
    fill: { color: WHITE }, line: { type: "none" } });
  t("Sponsor & site visit", 130, 1160, 800, 50, 34, { face: BODY, color: BLUE });
  s.addImage({ path: ROCHE, x: px(130), y: px(1250), w: px(270), h: px(140), altText: "Roche logo" });
  t("Visit Roche\nin Basel", 440, 1225, 540, 170, 64, { color: INK, line: 1.0 });
  t("21 OCTOBER", 440, 1390, 540, 80, 52, { color: BLUE });
  cta(ctx, 78, 1560, 924, 270, 62);
});

const landscape = build("OILS26_ETH_eLink_1920x1080.pptx", 1920, 1080, (ctx) => {
  const { pres, s, t } = ctx;
  s.addImage({ path: OILS, x: px(90), y: px(50), w: px(330), h: px(148), altText: "OILS logo" });
  t("OILS26 Conference", 90, 225, 1020, 50, 40, { face: BODY, bold: false, color: SOFT });
  t("From Bit to\nBench", 90, 285, 1080, 270, 104, { line: 1.0 });
  s.addShape(pres.ShapeType.rect, { x: px(90), y: px(575), w: px(1020), h: px(4), fill: { color: "75CBE9" }, line: { type: "none" } });
  t("20 OCTOBER 2026", 90, 600, 1020, 90, 68, { color: SKY });
  t("University of Zurich", 90, 693, 1020, 60, 44, { face: BODY, bold: false });
  cta(ctx, 90, 800, 1020, 190, 62);
  s.addShape(pres.ShapeType.roundRect, { x: px(1230), y: px(120), w: px(600), h: px(840), rectRadius: px(36),
    fill: { color: WHITE }, line: { type: "none" } });
  s.addImage({ path: ROCHE, x: px(1310), y: px(190), w: px(440), h: px(229), altText: "Roche logo" });
  s.addShape(pres.ShapeType.rect, { x: px(1290), y: px(460), w: px(480), h: px(4), fill: { color: "DBE7F4" }, line: { type: "none" } });
  t("Sponsor & site visit", 1290, 510, 480, 50, 32, { face: BODY, color: BLUE });
  t("Visit Roche\nin Basel", 1290, 585, 500, 190, 62, { color: INK, line: 1.0 });
  t("21 OCTOBER", 1290, 800, 500, 90, 54, { color: BLUE });
});

Promise.all([vertical, landscape]).then(() => console.log("ok"));
