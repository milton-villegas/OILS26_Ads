// Luma cover (1600 x 1600) built around a real photo, full bleed with a navy tint for legibility.
// Without photos it draws clearly labelled placeholders so the layout can be judged.
//   PHOTO_PEOPLE=/path/people.jpg PHOTO_BUILDING=/path/uzh.jpg node build_luma_photo.js [outDir]
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const ASSETS = path.join(__dirname, "..", "07_Codigo", "A3_desde_Roche", "assets");
const OUT = path.resolve(process.argv[2] || path.join(__dirname, "luma", "foto"));
const uri = (p) => `data:${/jpe?g$/i.test(p) ? "image/jpeg" : "image/png"};base64,${fs.readFileSync(p).toString("base64")}`;
const OILS = uri(path.join(ASSETS, "oils_logo_fallback.png")), ROCHE = uri(path.join(ASSETS, "logo_roche.png"));

const person = (x, y, s, tone) => `<div class="abs" style="left:${x}px;top:${y}px;width:${s}px;height:${s * 2.4}px;filter:blur(2.5px)">
  <div class="abs" style="left:${s * .22}px;top:0;width:${s * .56}px;height:${s * .56}px;border-radius:50%;background:${tone}"></div>
  <div class="abs" style="left:0;top:${s * .62}px;width:${s}px;height:${s * 1.8}px;border-radius:${s * .5}px ${s * .5}px 0 0;background:${tone}"></div></div>`;
const PLACE_PEOPLE = `<div class="abs" style="inset:0;background:linear-gradient(160deg,#a9b5c4,#5f6e84 70%)"></div>
  ${[[60, 310, 190, "#d5dbe4"], [250, 270, 230, "#c3ccd8"], [520, 330, 180, "#dde2ea"], [720, 250, 250, "#b9c3d1"], [980, 320, 200, "#d0d7e1"], [1180, 280, 230, "#c6cfdb"], [1400, 340, 170, "#dbe0e8"]]
    .map((a) => person(...a)).join("")}`;
const PLACE_BUILDING = `<div class="abs" style="inset:0;background:linear-gradient(180deg,#b8c9dc 0%,#8fa4bd 55%,#6d7f96 100%)"></div>
  <div class="abs" style="left:150px;top:300px;width:1300px;height:520px;background:#cfc7b8"></div>
  <div class="abs" style="left:700px;top:60px;width:200px;height:300px;background:#c3bbac"></div>
  <div class="abs" style="left:650px;top:10px;width:300px;height:80px;background:#b3ab9d;clip-path:polygon(50% 0,100% 100%,0 100%)"></div>
  ${Array.from({ length: 10 }, (_, i) => `<div class="abs" style="left:${230 + i * 120}px;top:430px;width:70px;height:300px;border-radius:35px 35px 0 0;background:#7d8ca0"></div>`).join("")}`;

const page = (label, placeholder, photoPath) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:1600px;height:1600px;overflow:hidden;background:#061433}
body{position:relative;font-family:Eurostile,'Inter Display',Inter,Helvetica,sans-serif;color:#fff}
.abs{position:absolute}
.title{font-weight:800;letter-spacing:-.035em;line-height:.96}
.sky{color:#8ccbf2}
.pill{background:#8ccbf2;color:#0b2554;font-weight:800;letter-spacing:-.01em;border-radius:28px;display:inline-block}
.venue{font-family:Inter,Helvetica,sans-serif;font-weight:500;letter-spacing:.08em;text-transform:uppercase}
.roche{display:flex;align-items:center;background:#fff;color:#0b2554;border-radius:999px;box-shadow:0 18px 50px rgba(0,0,0,.4)}
.k{font-family:Inter,Helvetica,sans-serif;font-weight:800;color:#1b5daa;letter-spacing:.1em;text-transform:uppercase}
.h{font-weight:800;letter-spacing:-.02em}
</style></head><body>
${photoPath ? `<img class="abs" src="${uri(photoPath)}" style="inset:0;width:1600px;height:1600px;object-fit:cover">` : placeholder}
<div class="abs" style="inset:0;background:rgba(18,52,110,.42);mix-blend-mode:multiply"></div>
<div class="abs" style="inset:0;background:linear-gradient(to bottom,rgba(6,20,51,.30) 0%,rgba(6,20,51,.35) 30%,rgba(6,20,51,.88) 58%,#061433 100%)"></div>
${photoPath ? "" : `<div class="abs" style="left:0;width:1600px;top:330px;text-align:center"><span style="background:rgba(0,0,0,.55);padding:14px 30px;border-radius:14px;font-family:Inter,sans-serif;font-weight:700;font-size:34px;letter-spacing:.06em">${label}</span></div>`}
<img class="abs" src="${OILS}" style="left:120px;top:110px;width:380px;display:block">
<div class="abs sky" style="left:122px;top:610px;font-family:Inter,sans-serif;font-weight:800;font-size:38px;letter-spacing:.14em">#OILS26 CONFERENCE</div>
<div class="abs title" style="left:116px;top:665px;font-size:176px">From Bit<br>to <span class="sky">Bench</span></div>
<div class="abs pill" style="left:120px;top:1030px;font-size:78px;padding:18px 44px">20 OCTOBER 2026</div>
<div class="abs venue" style="left:124px;top:1175px;font-size:36px">University of Zurich, Switzerland</div>
<div class="abs roche" style="left:120px;top:1290px;height:170px;padding:0 77px 0 51px;gap:44px">
  <img src="${ROCHE}" style="height:95px;display:block"><div style="width:3px;height:95px;background:#dbe7f4"></div>
  <div><div class="k" style="font-size:29px">Site visit · Wed 21 Oct</div><div class="h" style="font-size:51px;margin-top:7px">Visit Roche in Basel</div></div></div>
</body></html>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox", "--disable-gpu"] });
  const pg = await (await browser.newContext({ viewport: { width: 1600, height: 1600 } })).newPage();
  for (const [name, label, ph, photo] of [
    ["personas", "PLACEHOLDER · FOTO DE PERSONAS (OILS25)", PLACE_PEOPLE, process.env.PHOTO_PEOPLE],
    ["edificio", "PLACEHOLDER · FOTO DE LA UNIVERSIDAD DE ZURICH", PLACE_BUILDING, process.env.PHOTO_BUILDING],
  ]) {
    const f = path.join(os.tmpdir(), `luma_foto_${name}.html`);
    fs.writeFileSync(f, page(label, ph, photo));
    await pg.goto("file://" + f);
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(OUT, `OILS26_Luma_cover_foto_${name}_1600x1600.png`) });
    console.log(name);
  }
  await browser.close();
})();
