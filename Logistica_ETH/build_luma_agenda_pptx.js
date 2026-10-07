// Editable agenda image for the Luma event page (tall, 1600 x 2300 px). Content from 01_FINAL/OILS26_agenda_A3.pptx.
// No QR / URL: registration is on the Luma page. 1 slide pixel = 0.01 inch.
// Run: NODE_PATH=<dir with pptxgenjs> node build_luma_agenda_pptx.js
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const ASSETS = path.join(__dirname, "..", "07_Codigo", "A3_desde_Roche", "assets");
const OUT = path.join(__dirname, "luma");
fs.mkdirSync(OUT, { recursive: true });
const NAVY = "061433", SKY = "8CCBF2", SOFT = "C9D6EC", WHITE = "FFFFFF";
const HEAD = "Eurostile", BODY = "Arial";
const W = 1600, H = 2300;
const px = (n) => n / 100;
const pt = (n) => Math.round(n * 0.72 * 100) / 100;

// [time, tag, people, title, row height]; tag "" = plain row (break / ceremony)
const AGENDA = [
  ["09:00", "", "", "Opening Ceremony", 100, true],
  ["09:30", "KEYNOTE 1", "Lizbé Koekemoer", "Feeding the Models: Open Data for AI-Driven Drug Discovery", 195],
  ["10:15", "PANEL", "Jilles Vreeken · Ellen Carbo · Fergus Imrie", "Scientific AI: Data Quality, Limitations & the Future of Models That Understand Science", 195],
  ["11:15", "", "", "Coffee Break", 100, false],
  ["11:45", "WORKSHOP 1", "Sebastian Kahlert · Pernilla Sörme", "Sustainable Practice in the Lab", 145],
  ["13:00", "", "", "Lunch Break", 100, false],
  ["14:00", "WORKSHOP 2", "Joseph Heng", "Accessing & Using Open AI Tools, Pre-trained Models and Datasets for Life Sciences", 195],
  ["15:15", "", "", "Coffee Break", 100, false],
  ["15:45", "KEYNOTE 2", "Nicoletta Iacobacci", "The Missing Behavioral Layer in AI-Assisted Science", 145],
  ["16:30", "PITCHFEST", "", "Emerging Voices: Early-career researchers", 145],
  ["17:30", "", "", "Closing Ceremony — Pitch Winner Awards", 100, true],
  ["17:45", "", "", "Networking Apéro", 100, false],
];

const pres = new pptxgen();
pres.defineLayout({ name: "AGENDA", width: px(W), height: px(H) });
pres.layout = "AGENDA";
pres.title = "OILS26 Luma agenda";
const s = pres.addSlide();
s.background = { color: NAVY };
s.addImage({ path: path.join(ASSETS, "bg_teaser.jpg"), x: 0, y: 0, w: px(W), h: px(H), sizing: { type: "cover", w: px(W), h: px(H) }, altText: "OILS pattern background" });
s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: px(W), h: px(H), fill: { color: NAVY, transparency: 62 }, line: { type: "none" } });

const t = (value, x, y, w, h, size, o = {}) =>
  s.addText(value, { x: px(x), y: px(y), w: px(w), h: px(h), fontFace: o.face || HEAD, fontSize: pt(size),
    bold: o.bold !== false, color: o.color || WHITE, margin: 0, valign: "top", isTextBox: true,
    charSpacing: o.spacing, lineSpacingMultiple: o.line, fit: "none" });

const L = 120;
s.addImage({ path: path.join(ASSETS, "oils_logo_fallback.png"), x: px(L), y: px(100), w: px(330), h: px(148), altText: "OILS logo" });
t("From Bit to Bench", L, 285, 1360, 110, 96, {});
t("20 OCTOBER 2026", L, 405, 1360, 80, 62, { color: SKY });
t("UNIVERSITY OF ZURICH, SWITZERLAND", L, 485, 1360, 50, 34, { face: BODY, bold: false, spacing: 2 });

let y = 570;
const rule = (yy, color = "5C86B8") =>
  s.addShape(pres.ShapeType.rect, { x: px(L), y: px(yy), w: px(1360), h: px(2), fill: { color, transparency: 40 }, line: { type: "none" } });
rule(y - 14, SKY);
for (const [time, tag, people, title, h, bold] of AGENDA) {
  const plain = !tag;
  const major = plain && bold;
  t(time, L, y + (plain ? 24 : 22), 190, 60, 48, { color: SKY });
  const tx = L + 215, tw = 1360 - 215;
  if (plain) {
    t(title, tx, y + 24, tw, 60, 44, { face: BODY, bold: !!major, color: major ? WHITE : SOFT });
  } else {
    s.addText([
      { text: tag, options: { color: SKY, bold: true, charSpacing: 3 } },
      ...(people ? [{ text: "   " + people, options: { color: SOFT, bold: false } }] : []),
    ], { x: px(tx), y: px(y + 18), w: px(tw), h: px(44), fontFace: BODY, fontSize: pt(30), margin: 0, valign: "top", isTextBox: true, fit: "none" });
    t(title, tx, y + 64, tw, h - 70, 42, { face: BODY, color: WHITE, line: 1.0 });
  }
  y += h;
  rule(y - 14);
}
pres.writeFile({ fileName: path.join(OUT, "OILS26_Luma_agenda_1600x2300.pptx") }).then(() => console.log("ok, rows end at", y));
