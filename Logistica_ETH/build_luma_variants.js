// Three exploratory designs for the Luma event cover (1600 x 1600): A "Bit -> Bench", B typographic, C minimal.
// No QR / URL (registration is on the Luma page); corners are kept clear because Luma rounds them.
// Run: PLAYWRIGHT_MODULE=... node build_luma_variants.js [outDir]
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const ASSETS = path.join(__dirname, "..", "07_Codigo", "A3_desde_Roche", "assets");
const OUT = path.resolve(process.argv[2] || path.join(__dirname, "luma"));
const uri = (f) => `data:${f.endsWith("jpg") ? "image/jpeg" : "image/png"};base64,${fs.readFileSync(path.join(ASSETS, f)).toString("base64")}`;
const BG = uri("bg_teaser.jpg"), OILS = uri("oils_logo_fallback.png"), ROCHE = uri("logo_roche.png");

const base = (body, css) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1600px;height:1600px;overflow:hidden;background:#061433}
body{position:relative;font-family:Eurostile,'Inter Display',Inter,Helvetica,sans-serif;color:#fff}
.bg{position:absolute;inset:0;background:url(${BG}) center/cover}
.abs{position:absolute}
.logo{position:absolute;display:block}
.title{font-weight:800;letter-spacing:-.035em;line-height:.96}
.sky{color:#8ccbf2}
.pill{background:#8ccbf2;color:#0b2554;font-weight:800;letter-spacing:-.01em;border-radius:28px;display:inline-block}
.venue{font-family:Inter,Helvetica,sans-serif;font-weight:500;letter-spacing:.08em;text-transform:uppercase}
.tag{font-family:Inter,Helvetica,sans-serif;font-weight:500;color:#c9d6ec;line-height:1.25}
.tag b{color:#8ccbf2;font-weight:800}
.roche{display:flex;align-items:center;background:#fff;color:#0b2554;border-radius:999px;box-shadow:0 18px 50px rgba(0,0,0,.4)}
.roche img{display:block}
.roche .k{font-family:Inter,Helvetica,sans-serif;font-weight:800;color:#1b5daa;letter-spacing:.1em;text-transform:uppercase}
.roche .h{font-weight:800;letter-spacing:-.02em}
${css}</style></head><body><div class="bg"></div>${body}</body></html>`;

const rocheBadge = (x, y, h) => `<div class="abs roche" style="left:${x}px;top:${y}px;height:${h}px;padding:0 ${h * .45}px 0 ${h * .3}px;gap:${h * .26}px">
  <img src="${ROCHE}" style="height:${h * .56}px"><div style="width:3px;height:${h * .56}px;background:#dbe7f4"></div>
  <div><div class="k" style="font-size:${h * .17}px">Site visit · Wed 21 Oct</div><div class="h" style="font-size:${h * .3}px;margin-top:${h * .04}px">Visit Roche in Basel</div></div></div>`;

// ---- A: Bit -> Bench ---------------------------------------------------------------------------
function helix() {
  const w = 620, h = 1240, A = 190, lam = 520, cx = w / 2;
  const pt = (y, ph) => cx + A * Math.sin((2 * Math.PI * y) / lam + ph);
  let s1 = "", s2 = "", rungs = "", nodes = "";
  for (let y = 0; y <= h; y += 6) { s1 += `${y ? "L" : "M"}${pt(y, 0).toFixed(1)} ${y} `; s2 += `${y ? "L" : "M"}${pt(y, Math.PI).toFixed(1)} ${y} `; }
  for (let y = 20; y < h; y += 34) {
    const a = pt(y, 0), b = pt(y, Math.PI), depth = Math.cos((2 * Math.PI * y) / lam);
    rungs += `<line x1="${a}" y1="${y}" x2="${b}" y2="${y}" stroke="#8ccbf2" stroke-width="5" opacity="${(0.25 + 0.5 * Math.abs(depth)).toFixed(2)}"/>`;
    nodes += `<circle cx="${a}" cy="${y}" r="9" fill="#d8efff"/><circle cx="${b}" cy="${y}" r="9" fill="#8ccbf2"/>`;
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="filter:drop-shadow(0 0 22px rgba(140,203,242,.85))">
    ${rungs}<path d="${s1}" fill="none" stroke="#d8efff" stroke-width="12" stroke-linecap="round"/><path d="${s2}" fill="none" stroke="#8ccbf2" stroke-width="12" stroke-linecap="round" opacity=".8"/>${nodes}</svg>`;
}
function bits() {
  let r = 11, out = "";
  const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  for (let row = 0; row < 25; row++) { let line = ""; for (let c = 0; c < 15; c++) line += rnd() < 0.5 ? "0 " : "1 "; out += `<div>${line}</div>`; }
  return out;
}
const A = base(`
  <div class="abs" style="right:-120px;top:-120px;width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle,rgba(70,150,230,.55),transparent 65%)"></div>
  <div class="abs" style="left:880px;top:130px;width:620px;height:1340px;filter:blur(60px);background:radial-gradient(ellipse,rgba(140,203,242,.35),transparent 70%)"></div>
  <div class="abs" style="left:880px;top:140px;width:620px;height:1240px;font-family:'DejaVu Sans Mono',monospace;font-weight:700;font-size:44px;line-height:50px;color:#8ccbf2;letter-spacing:6px;white-space:pre;overflow:hidden;opacity:.55;
     -webkit-mask-image:linear-gradient(to bottom,#000 0%,rgba(0,0,0,.6) 35%,transparent 62%)">${bits()}</div>
  <div class="abs" style="left:880px;top:140px;-webkit-mask-image:linear-gradient(to bottom,transparent 18%,#000 62%)">${helix()}</div>
  <img class="logo" src="${OILS}" style="left:120px;top:110px;width:380px">
  <div class="abs title" style="left:116px;top:430px;font-size:170px">From Bit<br>to <span class="sky">Bench</span></div>
  <div class="abs tag" style="left:120px;top:800px;font-size:46px;width:760px">Shaping sust<b>AI</b>nable &amp; ethical innovation in life sciences</div>
  <div class="abs pill" style="left:120px;top:1005px;font-size:78px;padding:18px 44px">20 OCTOBER 2026</div>
  <div class="abs venue" style="left:124px;top:1150px;font-size:36px">University of Zurich, Switzerland</div>
  ${rocheBadge(120, 1290, 170)}`, ``);

// ---- B: typographic ----------------------------------------------------------------------------
const B = base(`
  <div class="abs" style="inset:0;background:linear-gradient(135deg,rgba(6,20,51,.55) 0%,rgba(6,20,51,.2) 60%,rgba(40,110,200,.45) 100%)"></div>
  <div class="abs" style="right:-230px;bottom:-470px;font-weight:900;font-size:1250px;line-height:1;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:5px rgba(140,203,242,.55);opacity:.85">26</div>
  <div class="abs" style="right:-230px;bottom:-470px;font-weight:900;font-size:1250px;line-height:1;letter-spacing:-.06em;color:rgba(140,203,242,.10)">26</div>
  <img class="logo" src="${OILS}" style="left:120px;top:110px;width:360px">
  <div class="abs sky" style="left:122px;top:330px;font-family:Inter,sans-serif;font-weight:800;font-size:40px;letter-spacing:.14em">#OILS26 CONFERENCE</div>
  <div class="abs title" style="left:112px;top:385px;font-size:236px;line-height:.9">From<br>Bit to<br><span class="sky">Bench</span></div>
  <div class="abs sky" style="left:120px;top:1060px;font-weight:800;font-size:100px;letter-spacing:-.02em">20 OCTOBER 2026</div>
  <div class="abs venue" style="left:124px;top:1190px;font-size:36px">University of Zurich, Switzerland</div>
  ${rocheBadge(120, 1300, 150)}`, ``);

// ---- C: minimal --------------------------------------------------------------------------------
const C = base(`
  <div class="abs" style="inset:0;background:rgba(6,20,51,.55)"></div>
  <div class="abs" style="left:200px;top:300px;width:1200px;height:1000px;background:radial-gradient(ellipse,rgba(70,150,230,.55),transparent 68%)"></div>
  <img class="logo" src="${OILS}" style="left:520px;top:130px;width:560px">
  <div class="abs title" style="left:0;width:1600px;top:470px;text-align:center;font-size:250px;line-height:.95">From Bit<br>to <span class="sky">Bench</span></div>
  <div class="abs" style="left:0;width:1600px;top:1030px;text-align:center"><span class="pill" style="font-size:84px;padding:20px 56px">20 OCTOBER 2026</span></div>
  <div class="abs venue" style="left:0;width:1600px;top:1210px;text-align:center;font-size:38px">University of Zurich, Switzerland</div>
  <div class="abs" style="left:0;width:1600px;top:1320px;display:flex;justify-content:center"><div class="roche" style="height:110px;padding:0 44px 0 30px;gap:28px;position:relative">
    <img src="${ROCHE}" style="height:60px"><div style="width:3px;height:60px;background:#dbe7f4"></div><div class="h" style="font-size:36px">Site visit in Basel · 21 Oct</div></div></div>`, ``);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox", "--disable-gpu"] });
  const pg = await (await browser.newContext({ viewport: { width: 1600, height: 1600 } })).newPage();
  for (const [name, html] of [["A_bit_to_bench", A], ["B_typographic", B], ["C_minimal", C]]) {
    const f = path.join(os.tmpdir(), `luma_${name}.html`);
    fs.writeFileSync(f, html);
    await pg.goto("file://" + f);
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(OUT, `OILS26_Luma_cover_${name}_1600x1600.png`) });
    console.log(name);
  }
  await browser.close();
})();
