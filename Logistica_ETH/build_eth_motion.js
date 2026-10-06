// Builds the polished OILS26 ETH screen ads (v2): a still PNG and a silent MP4 spot
// per orientation, in the formats ETH Campus Services accepts.
//
//   portrait  1080 x 1920   landscape 1920 x 1080   png / mp4, max. 30 s, no sound
//
// Content follows the ETH design recommendations: short title, large type,
// What / When / Where, strong contrast, one call to action, URL instead of QR code.
// The animation is deterministic: render(t) positions every element for time t, so the
// PNG is simply the last frame and the MP4 is the frames in between.
//
// Usage: node Logistica_ETH/build_eth_motion.js [outDir]    (needs playwright + ffmpeg)

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "07_Codigo", "A3_desde_Roche", "assets");
const OUT = path.resolve(process.argv[2] || path.join(__dirname, "v2"));
const FPS = 30;
const DURATION = 15; // seconds, ETH maximum is 30
const HOLD_FROM = 7.2; // everything is on screen from here on (the PNG is taken here)

const uri = (file, mime) =>
  `data:${mime};base64,${fs.readFileSync(path.join(ASSETS, file)).toString("base64")}`;
const BG = uri("bg_teaser.jpg", "image/jpeg");
const OILS = uri("oils_logo_fallback.png", "image/png");
const ROCHE = uri("logo_roche.png", "image/png");
const QR = uri("qr_oils2026.png", "image/png");


// data-in = start second, data-d = duration, data-from = entrance direction
const page = (w, h, layout) => `<!doctype html><html><head><meta charset="utf-8"><style>
:root{--navy:#061433;--sky:#8ccbf2;--ink:#0b2554;--blue:#1b5daa;--soft:#c9d6ec}
*{box-sizing:border-box;margin:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:var(--navy)}
body{font-family:Eurostile,'Eurostile Extended',Inter,Helvetica,Arial,sans-serif;color:#fff;position:relative}
.bg{position:absolute;inset:-6%;background:url(${BG}) center/cover;will-change:transform}
.shade{position:absolute;inset:0;background:rgba(6,20,51,.30)}
.glow{position:absolute;border-radius:50%;filter:blur(90px);background:#2f7fd0;opacity:.35}
.el{position:absolute;opacity:0}
.title{font-weight:800;letter-spacing:-.035em;line-height:.98}
.chip{display:inline-flex;align-items:center;gap:18px;background:rgba(140,203,242,.16);border:2px solid rgba(140,203,242,.7);
  color:var(--sky);font-weight:700;letter-spacing:.16em;border-radius:999px;text-transform:uppercase;font-family:Inter,Helvetica,sans-serif}
.chip i{width:14px;height:14px;border-radius:50%;background:var(--sky)}
.tag{font-family:Inter,Helvetica,sans-serif;color:var(--soft);font-weight:500;line-height:1.28}
.tag b{color:var(--sky);font-weight:800}
.row{display:flex;align-items:center;gap:26px}
.row svg{flex:none;color:var(--sky)}
.when{font-weight:800;letter-spacing:-.01em;color:#fff}
.where{font-family:Inter,Helvetica,sans-serif;font-weight:500;color:var(--soft)}
.card{background:#fff;color:var(--ink);box-shadow:0 30px 80px rgba(0,0,0,.45)}
.card .k{font-family:Inter,Helvetica,sans-serif;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--blue)}
.card .h{font-weight:800;letter-spacing:-.025em;line-height:1.02}
.card .d{font-weight:800;color:var(--blue);letter-spacing:-.01em}
.card img{display:block}
.cta{background:linear-gradient(100deg,#8ccbf2,#b7defa);color:var(--ink);display:flex;align-items:center;justify-content:space-between}
.cta .l{font-family:Inter,Helvetica,sans-serif;font-weight:700;letter-spacing:.02em}
.cta .u{font-weight:800;letter-spacing:-.025em}
.cta .go{background:var(--ink);color:var(--sky);border-radius:50%;display:grid;place-items:center;flex:none}
.cta .go svg{width:54%;height:54%}
.rule{height:4px;background:linear-gradient(90deg,var(--sky),transparent);opacity:.85}
${layout.css}
</style></head><body>
<div class="bg" id="bg"></div><div class="shade"></div>
${layout.glows}
${layout.html}
<script>
const ease=x=>1-Math.pow(1-x,3);
function render(t){
  const bg=document.getElementById('bg');
  const k=Math.min(t/${DURATION},1);
  bg.style.transform='scale('+(1.04+0.04*k)+') translate('+(-1.2*k)+'%,'+(-0.8*k)+'%)';
  document.querySelectorAll('.el').forEach(e=>{
    const s=+e.dataset.in,d=+(e.dataset.d||0.8),p=ease(Math.min(Math.max((t-s)/d,0),1));
    const dir=e.dataset.from||'up',m=70*(1-p);
    const tx=dir==='left'?-m:dir==='right'?m:0,ty=dir==='up'?m:dir==='down'?-m:0;
    e.style.opacity=p;
    e.style.transform='translate('+tx+'px,'+ty+'px)'+(e.dataset.pulse&&t>${HOLD_FROM}?' scale('+(1+0.012*Math.sin((t-${HOLD_FROM})*3.2))+')':'');
  });
}
render(0);
</script></body></html>`;

const portrait = {
  w: 1080, h: 1920,
  css: `
  .logo{left:78px;top:90px;width:380px}.logo img{width:100%;display:block}
  .qr{left:772px;top:70px;width:230px;text-align:center}
  .qr .t{background:#fff;border-radius:26px;padding:14px;box-shadow:0 14px 40px rgba(0,0,0,.35)}.qr img{width:100%;display:block}
  .qr .c{font-family:Inter,Helvetica,sans-serif;font-weight:700;font-size:26px;letter-spacing:.08em;text-transform:uppercase;color:var(--soft);margin-top:14px}
  .title{font-size:178px;line-height:.97}
  .sub{font-family:Inter,Helvetica,sans-serif;font-weight:500;font-size:46px;letter-spacing:.02em;color:var(--soft)}
  .when{font-size:88px;color:var(--sky)}.where{font-size:54px;font-family:Inter,Helvetica,sans-serif;font-weight:500;color:#fff}
  .card{border-radius:32px;overflow:hidden}
  .card .k{font-size:34px;letter-spacing:.04em;text-transform:none}.card .h{font-size:70px}.card .d{font-size:56px}
  .cta{border-radius:54px;padding:0 48px}
  .cta .l{font-size:41px}.cta .u{font-size:66px}
  `,
  glows: ``,
  html: `
  <div class="el logo" data-in="0.2" data-from="left"><img src="${OILS}"></div>
  <div class="el qr" data-in="0.5" data-from="right"><div class="t"><img src="${QR}"></div><div class="c">Scan to register</div></div>
  <div class="el title" data-in="1.0" style="left:76px;top:385px">From Bit<br>to Bench</div>
  <div class="el sub" data-in="1.8" style="left:78px;top:745px">OILS26 Conference</div>
  <div class="el rule" data-in="2.4" data-from="left" style="left:78px;top:850px;width:924px"></div>
  <div class="el when" data-in="2.8" data-from="left" style="left:78px;top:893px">20 OCTOBER 2026</div>
  <div class="el where" data-in="3.3" data-from="left" style="left:78px;top:1000px">University of Zurich</div>
  <div class="el card" data-in="4.2" style="left:78px;top:1120px;width:924px;height:370px">
    <div class="k" style="position:absolute;left:52px;top:42px">Sponsor &amp; site visit</div>
    <img src="${ROCHE}" style="position:absolute;left:52px;top:130px;width:270px">
    <div style="position:absolute;left:362px;top:94px"><div class="h">Visit Roche<br>in Basel</div><div class="d" style="margin-top:18px">21 OCTOBER</div></div></div>
  <div class="el cta" data-in="5.4" data-pulse="1" style="left:78px;top:1560px;width:924px;height:270px;align-items:flex-start;flex-direction:column;justify-content:center"><div class="l">Register &amp; see the agenda</div><div class="u">b2match.com/e/oils2026</div></div>
  `,
};

const landscape = {
  w: 1920, h: 1080,
  css: `
  .logo{left:90px;top:70px;width:330px}.logo img{width:100%;display:block}
  .qr{left:890px;top:48px;width:220px;text-align:center}
  .qr .t{background:#fff;border-radius:24px;padding:13px;box-shadow:0 14px 40px rgba(0,0,0,.35)}.qr img{width:100%;display:block}
  .qr .c{font-family:Inter,Helvetica,sans-serif;font-weight:700;font-size:24px;letter-spacing:.08em;text-transform:uppercase;color:var(--soft);margin-top:12px}
  .title{font-size:124px;line-height:1}
  .sub{font-family:Inter,Helvetica,sans-serif;font-weight:500;font-size:44px;letter-spacing:.02em;color:var(--soft)}
  .when{font-size:80px;color:var(--sky)}.where{font-size:48px;font-family:Inter,Helvetica,sans-serif;font-weight:500;color:#fff}
  .card{border-radius:36px;overflow:hidden}
  .card .k{font-size:34px;letter-spacing:.02em;text-transform:none}.card .h{font-size:76px}.card .d{font-size:62px}
  .cta{border-radius:38px;padding:0 48px}
  .cta .l{font-size:42px}.cta .u{font-size:76px}
  `,
  glows: ``,
  html: `
  <div class="el logo" data-in="0.2" data-from="left"><img src="${OILS}"></div>
  <div class="el qr" data-in="0.5" data-from="right"><div class="t"><img src="${QR}"></div><div class="c">Scan to register</div></div>
  <div class="el title" data-in="1.0" style="left:88px;top:345px">From Bit to Bench</div>
  <div class="el sub" data-in="1.8" style="left:90px;top:478px">OILS26 Conference</div>
  <div class="el rule" data-in="2.4" data-from="left" style="left:90px;top:570px;width:1020px"></div>
  <div class="el when" data-in="2.8" data-from="left" style="left:90px;top:603px">20 OCTOBER 2026</div>
  <div class="el where" data-in="3.3" data-from="left" style="left:90px;top:690px">University of Zurich</div>
  <div class="el card" data-in="4.2" data-from="right" style="left:1230px;top:120px;width:600px;height:840px">
    <img src="${ROCHE}" style="position:absolute;left:80px;top:70px;width:440px">
    <div class="rule" style="position:absolute;left:60px;top:340px;width:480px;background:#dbe7f4;opacity:1"></div>
    <div class="k" style="position:absolute;left:60px;top:400px">Sponsor &amp; site visit</div>
    <div class="h" style="position:absolute;left:60px;top:470px">Visit Roche<br>in Basel</div>
    <div class="d" style="position:absolute;left:60px;top:670px">21 OCTOBER</div></div>
  <div class="el cta" data-in="5.4" data-pulse="1" style="left:90px;top:800px;width:1020px;height:190px;align-items:flex-start;flex-direction:column;justify-content:center"><div class="l">Register &amp; see the agenda</div><div class="u">b2match.com/e/oils2026</div></div>
  `,
};

const SPECS = {
  vertical: { ...portrait, name: "OILS26_ETH_vertical_1080x1920_v2" },
  eLink: { ...landscape, name: "OILS26_ETH_eLink_1920x1080_v2" },
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME || undefined,
    args: ["--no-sandbox", "--disable-gpu"],
  });
  for (const spec of Object.values(SPECS)) {
    const ctx = await browser.newContext({ viewport: { width: spec.w, height: spec.h } });
    const pg = await ctx.newPage();
    const file = path.join(os.tmpdir(), `${spec.name}.html`);
    fs.writeFileSync(file, page(spec.w, spec.h, spec));
    await pg.goto("file://" + file);
    await pg.evaluate(() => document.fonts.ready);
    // still: everything visible, hold pose
    await pg.evaluate((t) => render(t), HOLD_FROM + 2);
    await pg.screenshot({ path: path.join(OUT, spec.name + ".png") });
    if (process.env.STILL_ONLY) { console.log(spec.name); await ctx.close(); continue; }
    // video frames
    const frames = fs.mkdtempSync(path.join(os.tmpdir(), spec.name + "_"));
    const n = DURATION * FPS;
    for (let i = 0; i < n; i++) {
      await pg.evaluate((t) => render(t), i / FPS);
      await pg.screenshot({ path: path.join(frames, `f${String(i).padStart(4, "0")}.png`) });
    }
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS),
      "-i", path.join(frames, "f%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p",
      "-crf", "17", "-preset", "slow", "-movflags", "+faststart", "-an",
      path.join(OUT, spec.name + ".mp4")]);
    fs.rmSync(frames, { recursive: true, force: true });
    console.log(spec.name);
    await ctx.close();
  }
  await browser.close();
})();
