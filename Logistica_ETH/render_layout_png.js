// Render a PowerPoint layout (see pptx_to_layout.py) as a PNG with headless Chromium.
// The PowerPoint is the source of truth; this just draws what is in it.
//   node render_layout_png.js <layoutDir> <out.png>
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const [layoutDir, outPng] = process.argv.slice(2);
const L = JSON.parse(fs.readFileSync(path.join(layoutDir, "layout.json"), "utf8"));
const FACE = {
  Eurostile: "Eurostile,'Eurostile Extended','Inter Display',Inter,Helvetica,sans-serif",
  Arial: "Inter,Helvetica,Arial,sans-serif",
};
const uri = (rel) => `data:${rel.endsWith("jpg") ? "image/jpeg" : "image/png"};base64,${fs.readFileSync(path.join(layoutDir, rel)).toString("base64")}`;
const esc = (x) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const html = L.items.map((it) => {
  const pos = `left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px`;
  if (it.type === "pic") return `<img src="${uri(it.media)}" style="position:absolute;${pos};object-fit:${it.w >= L.w ? "cover" : "fill"}">`;
  if (it.type === "shape") {
    const r = it.prst === "roundRect" ? Math.min(it.w, it.h) * it.adj : 0;
    return `<div style="position:absolute;${pos};border-radius:${r}px;background:#${it.fill};opacity:${it.alpha}"></div>`;
  }
  const lines = it.paras.map((p) => {
    const size = Math.max(...p.runs.map((r) => r.sz));
    const spans = p.runs.map((r) => {
      const weight = r.b ? (r.face === "Eurostile" ? 800 : 700) : 500;
      const ls = r.spc || (r.face === "Eurostile" && r.sz > 60 ? -r.sz * 0.02 : 0);
      return `<span style="font-family:${FACE[r.face] || FACE.Arial};font-size:${r.sz}px;font-weight:${weight};color:#${r.color};letter-spacing:${ls}px">${esc(r.t)}</span>`;
    }).join("");
    return `<div style="font-size:${size}px;line-height:${(size * 1.17 * p.ln).toFixed(1)}px;white-space:pre-wrap;text-align:${p.algn === "ctr" ? "center" : "left"}">${spans}</div>`;
  }).join("");
  return `<div style="position:absolute;left:${it.x}px;top:${it.y}px;width:${it.w}px">${lines}</div>`;
}).join("\n");

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox", "--disable-gpu"] });
  const pg = await (await browser.newContext({ viewport: { width: L.w, height: L.h } })).newPage();
  const file = path.join(os.tmpdir(), path.basename(outPng) + ".html");
  fs.writeFileSync(file, `<!doctype html><html><body style="margin:0;width:${L.w}px;height:${L.h}px;overflow:hidden;position:relative;background:#061433">${html}</body></html>`);
  await pg.goto("file://" + file);
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: outPng });
  await browser.close();
  console.log(outPng);
})();
