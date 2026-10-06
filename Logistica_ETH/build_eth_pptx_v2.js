// Editable PowerPoint versions of the v2 OILS26 ETH screens (same layout as build_eth_motion.js,
// without the animation). 1 slide pixel = 0.01 inch; export the slide as PNG at 1080x1920 / 1920x1080.
const path = require("path");
const pptxgen = require("pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "07_Codigo", "A3_desde_Roche", "assets");
require("fs").mkdirSync(path.join(__dirname, "v2"), { recursive: true });
const BG = path.join(ASSETS, "bg_teaser.jpg");
const OILS = path.join(ASSETS, "oils_logo_fallback.png");
const ROCHE = path.join(ASSETS, "logo_roche.png");
const QR = path.join(ASSETS, "qr_oils2026.png");
const OUT_DIR = path.join(__dirname, "v2");

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
      charSpacing: o.spacing, align: o.align, lineSpacingMultiple: o.line, fit: "none" });
  draw({ pres, s, t });
  return pres.writeFile({ fileName: path.join(OUT_DIR, file) });
}

function cta(ctx, x, y, w, h, labelSize, urlSize, labelY, urlY) {
  const { pres, s, t } = ctx;
  s.addShape(pres.ShapeType.roundRect, { x: px(x), y: px(y), w: px(w), h: px(h), rectRadius: px(h / 5),
    fill: { color: SKY }, line: { type: "none" } });
  t("Register & see the agenda", x + 48, labelY, w - 96, labelSize * 1.4, labelSize, { face: BODY, color: INK });
  t("b2match.com/e/oils2026", x + 48, urlY, w - 96, urlSize * 1.3, urlSize, { color: INK });
}

function qr(ctx, x, y, size, captionSize) {
  const { pres, s, t } = ctx;
  s.addShape(pres.ShapeType.roundRect, { x: px(x), y: px(y), w: px(size), h: px(size), rectRadius: px(size / 9),
    fill: { color: WHITE }, line: { type: "none" } });
  const pad = size * 0.06;
  s.addImage({ path: QR, x: px(x + pad), y: px(y + pad), w: px(size - 2 * pad), h: px(size - 2 * pad), altText: "QR code to b2match.com/e/oils2026" });
  t("SCAN TO REGISTER", x - 20, y + size + 14, size + 40, captionSize * 1.4, captionSize, { face: BODY, color: SOFT, spacing: 2, align: "center" });
}


const vertical = build("OILS26_ETH_vertical_1080x1920_v2.pptx", 1080, 1920, (ctx) => {
  const { pres, s, t } = ctx;
  s.addImage({ path: OILS, x: px(78), y: px(90), w: px(380), h: px(170), altText: "OILS logo" });
  qr(ctx, 772, 70, 230, 24);
  t("From Bit\nto Bench", 78, 372, 924, 360, 170, { line: 0.92 });
  t("OILS26 Conference", 78, 745, 924, 70, 46, { face: BODY, bold: false, color: SOFT });
  s.addShape(pres.ShapeType.rect, { x: px(78), y: px(850), w: px(924), h: px(4), fill: { color: "75CBE9" }, line: { type: "none" } });
  t("20 OCTOBER 2026", 78, 890, 924, 110, 84, { color: SKY });
  t("University of Zurich", 78, 1000, 924, 80, 52, { face: BODY, bold: false });
  s.addShape(pres.ShapeType.roundRect, { x: px(78), y: px(1120), w: px(924), h: px(370), rectRadius: px(32),
    fill: { color: WHITE }, line: { type: "none" } });
  t("Sponsor & site visit", 130, 1160, 800, 50, 34, { face: BODY, color: BLUE });
  s.addImage({ path: ROCHE, x: px(130), y: px(1250), w: px(270), h: px(140), altText: "Roche logo" });
  t("Visit Roche\nin Basel", 440, 1214, 540, 170, 66, { color: INK, line: 0.95 });
  t("21 OCTOBER", 440, 1390, 540, 80, 52, { color: BLUE });
  cta(ctx, 78, 1560, 924, 270, 40, 62, 1630, 1690);
});

const landscape = build("OILS26_ETH_eLink_1920x1080_v2.pptx", 1920, 1080, (ctx) => {
  const { pres, s, t } = ctx;
  s.addImage({ path: OILS, x: px(90), y: px(70), w: px(330), h: px(148), altText: "OILS logo" });
  qr(ctx, 890, 48, 220, 22);
  t("From Bit to Bench", 88, 335, 1100, 150, 118, { line: 1.0 });
  t("OILS26 Conference", 90, 478, 1020, 60, 42, { face: BODY, bold: false, color: SOFT });
  s.addShape(pres.ShapeType.rect, { x: px(90), y: px(570), w: px(1020), h: px(4), fill: { color: "75CBE9" }, line: { type: "none" } });
  t("20 OCTOBER 2026", 90, 600, 1020, 90, 76, { color: SKY });
  t("University of Zurich", 90, 690, 1020, 60, 46, { face: BODY, bold: false });
  cta(ctx, 90, 800, 1020, 190, 40, 70, 828, 880);
  s.addShape(pres.ShapeType.roundRect, { x: px(1230), y: px(120), w: px(600), h: px(840), rectRadius: px(36),
    fill: { color: WHITE }, line: { type: "none" } });
  s.addImage({ path: ROCHE, x: px(1310), y: px(190), w: px(440), h: px(229), altText: "Roche logo" });
  s.addShape(pres.ShapeType.rect, { x: px(1290), y: px(460), w: px(480), h: px(4), fill: { color: "DBE7F4" }, line: { type: "none" } });
  t("Sponsor & site visit", 1290, 512, 480, 50, 32, { face: BODY, color: BLUE });
  t("Visit Roche\nin Basel", 1290, 585, 500, 190, 70, { color: INK, line: 0.95 });
  t("21 OCTOBER", 1290, 790, 500, 90, 58, { color: BLUE });
});

Promise.all([vertical, landscape]).then(() => console.log("ok"));
