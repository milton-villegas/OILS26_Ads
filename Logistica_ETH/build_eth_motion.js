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

const ICON_CAL = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="9" width="36" height="33" rx="6"/><path d="M6 20h36M15 4v9M33 4v9"/></svg>`;
const ICON_PIN = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 44S9 30.5 9 19a15 15 0 0 1 30 0c0 11.500-15 25-15 25z"/><circle cx="24" cy="19" r="5.500"/></svg>`;
const ICON_ARROW = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 24h30M26 11l13 13-13 13"/></svg>`;

// data-in = start second, data-d = duration, data-from = entrance direction
const page = (w, h, layout) => `<!doctype html><html><head><meta charset="utf-8"><style>
:root{--navy:#061433;--sky:#8ccbf2;--ink:#0b2554;--blue:#1b5daa;--soft:#c9d6ec}
*{box-sizing:border-box;margin:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:var(--navy)}
body{font-family:Eurostile,'Eurostile Extended',Inter,Helvetica,Arial,sans-serif;color:#fff;position:relative}
.bg{position:absolute;inset:-6%;background:url(${BG}) center/cover;will-change:transform}
.shade{position:absolute;inset:0;background:
  radial-gradient(120% 70% at 85% 0%,rgba(46,120,200,.55),transparent 60%),
  linear-gradient(180deg,rgba(6,20,51,.35),rgba(6,20,51,.78))}
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
.card .bar{height:100%;position:absolute;left:0;top:0;width:14px;background:linear-gradient(180deg,#1b5daa,#8ccbf2)}
.cta{background:linear-gradient(100deg,#8ccbf2,#b7defa);color:var(--ink);display:flex;align-items:center;justify-content:space-between;
  box-shadow:0 20px 60px rgba(140,203,242,.35)}
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
  .logo{left:80px;top:80px;width:380px}.logo img{width:100%;display:block;box-shadow:0 14px 40px rgba(0,0,0,.4)}
  .chip{font-size:30px;padding:16px 32px}
  .title{font-size:190px}
  .tag{font-size:48px}
  .when{font-size:80px}.where{font-size:54px}
  .row svg{width:76px;height:76px}
  .card{left:80px;width:920px;height:340px;border-radius:36px;overflow:hidden}
  .card .k{font-size:28px}.card .h{font-size:66px}.card .d{font-size:52px}
  .cta{left:80px;width:920px;height:225px;border-radius:44px;padding:0 48px 0 56px}
  .cta .l{font-size:34px}.cta .u{font-size:53px}.cta .go{width:104px;height:104px}
  `,
  glows: `<div class="glow" style="width:900px;height:900px;right:-380px;top:120px"></div>
          <div class="glow" style="width:700px;height:700px;left:-300px;bottom:100px;opacity:.25"></div>`,
  html: `
  <div class="el logo" data-in="0.2" data-from="left"><img src="${OILS}"></div>
  <div class="el" data-in="0.7" style="left:80px;top:320px"><span class="chip"><i></i>OILS26 Conference</span></div>
  <div class="el title" data-in="1.0" style="left:76px;top:405px">From Bit</div>
  <div class="el title" data-in="1.35" style="left:76px;top:590px">to Bench</div>
  <div class="el tag" data-in="1.9" style="left:80px;top:810px;width:900px">Shaping sust<b>AI</b>nable &amp; ethical<br>innovation in life sciences</div>
  <div class="el rule" data-in="2.6" data-from="left" style="left:80px;top:965px;width:920px"></div>
  <div class="el row" data-in="3.0" data-from="left" style="left:80px;top:1010px">${ICON_CAL}<span class="when">20 OCTOBER 2026</span></div>
  <div class="el row" data-in="3.5" data-from="left" style="left:80px;top:1110px">${ICON_PIN}<span class="where">University of Zurich</span></div>
  <div class="el card" data-in="4.4" style="left:80px;top:1215px;position:absolute"><div class="bar"></div>
    <div style="position:absolute;left:64px;top:38px" class="k">Sponsor &amp; site visit</div>
    <img src="${ROCHE}" style="position:absolute;left:64px;top:128px;width:290px">
    <div style="position:absolute;left:420px;top:92px"><div class="h">Visit Roche<br>in Basel</div><div class="d" style="margin-top:16px">21 OCTOBER</div></div></div>
  <div class="el cta" data-in="5.6" data-pulse="1" style="left:80px;top:1590px"><div><div class="l">Register &amp; see the agenda</div><div class="u">b2match.com/e/oils2026</div></div><div class="go">${ICON_ARROW}</div></div>
  `,
};

const landscape = {
  w: 1920, h: 1080,
  css: `
  .logo{left:96px;top:64px;width:330px}.logo img{width:100%;display:block;box-shadow:0 14px 40px rgba(0,0,0,.4)}
  .chip{font-size:28px;padding:14px 30px}
  .title{font-size:132px}
  .when{font-size:80px}.where{font-size:50px}
  .row svg{width:76px;height:76px}
  .card{left:1230px;top:90px;width:600px;height:900px;border-radius:40px;overflow:hidden}
  .card .k{font-size:28px}.card .h{font-size:78px}.card .d{font-size:62px}
  .cta{width:1010px;height:170px;border-radius:40px;padding:0 40px 0 56px}
  .cta .l{font-size:32px}.cta .u{font-size:62px}.cta .go{width:96px;height:96px}
  `,
  glows: `<div class="glow" style="width:800px;height:800px;right:-250px;top:-200px"></div>
          <div class="glow" style="width:600px;height:600px;left:-200px;bottom:-250px;opacity:.25"></div>`,
  html: `
  <div class="el logo" data-in="0.2" data-from="left"><img src="${OILS}"></div>
  <div class="el" data-in="0.7" style="left:96px;top:250px"><span class="chip"><i></i>OILS26 Conference</span></div>
  <div class="el title" data-in="1.0" style="left:92px;top:332px">From Bit<br>to Bench</div>
  <div class="el row" data-in="3.0" data-from="left" style="left:96px;top:625px">${ICON_CAL}<span class="when">20 OCTOBER 2026</span></div>
  <div class="el row" data-in="3.5" data-from="left" style="left:96px;top:722px">${ICON_PIN}<span class="where">University of Zurich</span></div>
  <div class="el card" data-in="4.4" data-from="right" style="position:absolute"><div class="bar"></div>
    <img src="${ROCHE}" style="position:absolute;left:84px;top:96px;width:440px">
    <div class="rule" style="position:absolute;left:64px;top:420px;width:470px;background:#dbe7f4;opacity:1"></div>
    <div class="k" style="position:absolute;left:64px;top:470px">Sponsor &amp; site visit</div>
    <div class="h" style="position:absolute;left:64px;top:540px">Visit Roche<br>in Basel</div>
    <div class="d" style="position:absolute;left:64px;top:740px">21 OCTOBER</div></div>
  <div class="el cta" data-in="5.6" data-pulse="1" style="left:96px;top:820px"><div><div class="l">Register &amp; see the agenda</div><div class="u">b2match.com/e/oils2026</div></div><div class="go">${ICON_ARROW}</div></div>
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
