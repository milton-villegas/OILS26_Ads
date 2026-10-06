// Animated ETH screen spot built from an edited PowerPoint (see pptx_to_layout.py).
//
//   python3 pptx_to_layout.py OILS26_ETH_vertical_1080x1920_v2.pptx /tmp/lay_v
//   node build_eth_video.js /tmp/lay_v out/OILS26_ETH_vertical_1080x1920_video
//
// Writes <out>.mp4 (silent H.264, 30 fps, 10 s, loops cleanly) and <out>_still.png.
// Every element comes from the PowerPoint; only the motion is added here:
//   bits rain -> title decodes from 0/1 into letters (the "Bit to Bench" idea),
//   fast overshoot entrances, living background, periodic pulses, quick exit for the loop.
// Needs playwright (PLAYWRIGHT_MODULE) and ffmpeg.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const FPS = 30;
const DUR = 10; // ETH maximum is 30 s
const EXIT = 9.35; // everything leaves here so the loop restarts clean
const STILL_T = +(process.env.STILL_T || 4.4);

const [layoutDir, outBase] = process.argv.slice(2);
const L = JSON.parse(fs.readFileSync(path.join(layoutDir, "layout.json"), "utf8"));
const { w: W, h: H } = L;

const FACE = {
  Eurostile: "Eurostile,'Eurostile Extended','Inter Display',Inter,Helvetica,sans-serif",
  Arial: "Inter,Helvetica,Arial,sans-serif",
};
const mime = (f) => (f.endsWith("jpg") ? "image/jpeg" : "image/png");
const dataUri = (rel) =>
  `data:${mime(rel)};base64,${fs.readFileSync(path.join(layoutDir, rel)).toString("base64")}`;

// ---- classify the slide's items into animated roles --------------------------------------
const items = L.items;
const firstText = (it) => it.paras[0].runs[0].t;
const role = (it) => {
  if (it.type === "pic") {
    if (it.i === items[0].i) return "bg";
    return it.pw === 1034 ? "logo" : it.pw === 3840 ? "roche" : "qr";
  }
  if (it.type === "shape") {
    if (it.w >= W && it.h >= H) return "shade";
    if (it.h < 10) return it.fill === "75CBE9" ? "ruleMain" : "ruleCard";
    return it.fill === "FFFFFF" ? "card" : "cta";
  }
  const s = firstText(it);
  if (/^From Bit/i.test(s)) return "title";
  if (/Conference/i.test(s)) return "sub";
  if (/OCTOBER 2026/i.test(s)) return "date";
  if (/Zurich/i.test(s)) return "venue";
  if (/SCAN/i.test(s)) return "qrCap";
  if (/Sponsor/i.test(s)) return "kicker";
  if (/Visit Roche/i.test(s)) return "head";
  if (/^21/i.test(s)) return "rdate";
  if (/Register/i.test(s)) return "ctaLabel";
  if (/b2match/i.test(s)) return "ctaUrl";
  return "other";
};
items.forEach((it) => (it.role = role(it)));
const by = (r) => items.find((i) => i.role === r);
const card = by("card"), cta = by("cta");
const inside = (it, box) => it.x >= box.x - 2 && it.y >= box.y - 2 && it.x + it.w <= box.x + box.w + 40 && it.y + it.h <= box.y + box.h + 2;

// group -> member roles; [start s, duration s, style]
const cardKids = items.filter((i) => i !== card && i.type !== "pic" || (i.role === "roche")).filter((i) => i !== card && inside(i, card));
const ctaKids = items.filter((i) => i !== cta && inside(i, cta));
const cardOnRight = card.x > W / 2;
const GROUPS = [
  { key: "logo", members: [by("logo")], t: 0.15, d: 0.5, style: "pop" },
  { key: "qr", members: [by("qr")], t: 0.3, d: 0.5, style: "pop" },
  { key: "qrCap", members: [by("qrCap")], t: 0.6, d: 0.35, style: "up", dist: 40 },
  { key: "title", members: [by("title")], t: 0.4, d: 0.01, style: "scramble" },
  { key: "sub", members: [by("sub")], t: 1.45, d: 0.4, style: "left", dist: 160 },
  { key: "rule", members: [by("ruleMain")], t: 1.6, d: 0.45, style: "wipe" },
  { key: "date", members: [by("date")], t: 1.85, d: 0.5, style: "left", dist: 420, flash: true },
  { key: "venue", members: [by("venue")], t: 2.1, d: 0.45, style: "left", dist: 260 },
  { key: "card", members: [card, ...cardKids], t: 2.6, d: 0.55, style: cardOnRight ? "right" : "up", dist: cardOnRight ? 360 : 260, kidStagger: 0.07 },
  { key: "cta", members: [cta, ...ctaKids], t: 3.3, d: 0.55, style: "up", dist: 220, kidStagger: 0.08 },
].filter((g) => g.members.every(Boolean));
const PULSES = { date: [5.0, 8.2], card: [6.1], cta: [7.2], qr: [5.6], title: [8.6], logo: [7.7] };

// ---- html ------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function textHtml(it, scramble) {
  const lines = it.paras.map((p) => {
    const spans = p.runs.map((r) => {
      const face = FACE[r.face] || FACE.Arial;
      const weight = r.b ? (r.face === "Eurostile" ? 800 : 700) : 500;
      const css = `font-family:${face};font-size:${r.sz}px;font-weight:${weight};color:#${r.color};letter-spacing:${r.spc || (r.face === "Eurostile" && r.sz > 60 ? -r.sz * 0.02 : 0)}px`;
      const body = scramble
        ? [...r.t].map((c) => `<span class="ch" data-c="${esc(c)}">${esc(c)}</span>`).join("")
        : esc(r.t);
      return `<span style="${css}">${body}</span>`;
    });
    const size = Math.max(...p.runs.map((r) => r.sz));
    return `<div style="text-align:${p.algn === "ctr" ? "center" : p.algn === "r" ? "right" : "left"};font-size:${size}px;line-height:${(size * 1.17 * p.ln).toFixed(1)}px;white-space:pre-wrap">${spans.join("")}</div>`;
  });
  return `<div class="t" style="left:${it.x}px;top:${it.y}px;width:${it.w}px">${lines.join("")}</div>`;
}
function itemHtml(it, extra = "") {
  if (it.type === "pic")
    return `<img class="p" ${extra} src="${dataUri(it.media)}" style="left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px">`;
  if (it.type === "shape") {
    const r = it.prst === "roundRect" ? Math.min(it.w, it.h) * it.adj : 0;
    return `<div class="s" ${extra} style="left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px;border-radius:${r}px;background:#${it.fill}"></div>`;
  }
  return textHtml(it, it.role === "title").replace('class="t"', `class="t" ${extra}`);
}

let body = "";
GROUPS.forEach((g, gi) => {
  const bx = Math.min(...g.members.map((m) => m.x)), by_ = Math.min(...g.members.map((m) => m.y));
  const bx2 = Math.max(...g.members.map((m) => m.x + m.w)), by2 = Math.max(...g.members.map((m) => m.y + m.h));
  g.cx = (bx + bx2) / 2; g.cy = (by_ + by2) / 2;
  body += `<div class="g" id="g${gi}" style="transform-origin:${g.cx}px ${g.cy}px">` +
    g.members.map((m, k) => itemHtml(m, `data-k="${k}"`)).join("") + `</div>`;
});

const page = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#061433}
.layer,.g{position:absolute;left:0;top:0;width:${W}px;height:${H}px}
.g{will-change:transform,opacity}
.p,.s,.t{position:absolute}
.t{overflow:visible}
.ch{display:inline-block;text-align:center}
.bit{position:absolute;font-family:'DejaVu Sans Mono',monospace;font-weight:700;color:#8ccbf2}
#flash{position:absolute;inset:0;background:#8ccbf2;opacity:0}
#bar{position:absolute;left:0;bottom:0;height:${Math.round(H / 130)}px;background:#8ccbf2}
</style></head><body>
<div class="layer" style="overflow:hidden"><img id="bg" src="${dataUri(by("bg").media)}" style="position:absolute;left:-6%;top:-6%;width:112%;height:112%;object-fit:cover"></div>
<div class="layer" style="background:rgba(6,20,51,${by("shade").alpha})"></div>
<div class="layer" id="bits"></div>
${body}
<div id="flash"></div><div id="bar"></div>
<script>
const W=${W},H=${H},DUR=${DUR},EXIT=${EXIT};
const G=${JSON.stringify(GROUPS.map((g) => ({ key: g.key, t: g.t, d: g.d, style: g.style, dist: g.dist || 0, flash: !!g.flash, kidStagger: g.kidStagger || 0, cx: g.cx, cy: g.cy })))};
const PULSES=${JSON.stringify(PULSES)};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const back=x=>{const c1=1.9,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const cubic=x=>1-Math.pow(1-x,3);
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
// bits rain
const R=rng(7),bits=[],layer=document.getElementById('bits'),N=Math.round(W*H/16000);
for(let i=0;i<N;i++){const e=document.createElement('div');e.className='bit';const s=14+R()*20;
  e.style.fontSize=s+'px';e.textContent=R()<.5?'0':'1';layer.appendChild(e);
  bits.push({e,x:R()*W,y0:R()*(H+200),sp:40+R()*90,op:.10+R()*.2,ph:R()*6.28,sw:6+R()*14})}
// title chars: freeze widths so scrambling never reflows the line
let chars=[];
function prepTitle(){const g=document.querySelector('#g'+G.findIndex(x=>x.key==='title'));
  chars=[...g.querySelectorAll('.ch')];chars.forEach(c=>{c.style.width=c.getBoundingClientRect().width+'px';});
  chars.forEach((c,i)=>{c._real=c.dataset.c;c._rev=c._real.trim()===''?-1:0});
  let n=0;chars.forEach(c=>{if(c._real.trim()!=='')c._i=n++});}
document.fonts.ready.then(prepTitle);
const gEls=G.map((g,i)=>document.getElementById('g'+i));
function render(t){
  // background: slow zoom + drift
  const bg=document.getElementById('bg'),k=t/DUR;
  bg.style.transform='scale('+(1.02+0.07*Math.sin(k*Math.PI))+') translate('+(-30*Math.sin(t*0.7))+'px,'+(-26*k)+'px)';
  // bits: fast rain at the start, easing into a slow drift
  const run=t*1+260*(1-Math.exp(-1.6*t))/1.6;
  const fade=1-clamp((t-EXIT)/0.5)*0.7;
  bits.forEach(b=>{const y=((b.y0+b.sp*run)%(H+200))-100;
    b.e.style.transform='translate('+(b.x+Math.sin(t*1.3+b.ph)*b.sw)+'px,'+y+'px)';
    b.e.style.opacity=b.op*fade*(t<0.05?0:1)});
  // title scramble
  const tg=G.find(x=>x.key==='title'),step=0.05;let lastRev=0;
  chars.forEach(c=>{if(c._rev===-1){c.textContent=c._real;return}
    const rt=tg.t+0.15+c._i*step;lastRev=Math.max(lastRev,rt);
    if(t<tg.t){c.textContent=' ';return}
    if(t>=rt){c.textContent=c._real}else{const f=Math.floor(t*30);c.textContent=((f*7+c._i*13)%5<2.5)?'0':'1';}
    c.style.color=(t>=rt&&t<rt+0.12)?'#8ccbf2':''});
  // groups
  let flash=0;
  G.forEach((g,i)=>{const el=gEls[i];
    const p=clamp((t-g.t)/g.d),e=g.style==='scramble'?1:back(p),o=g.style==='scramble'?(t>=g.t?1:0):clamp(p*3.5);
    let tx=0,ty=0,sc=1,clip='';
    if(g.style==='pop'){sc=0.4+0.6*e}
    else if(g.style==='left'){tx=-(1-e)*g.dist}
    else if(g.style==='right'){tx=(1-e)*g.dist}
    else if(g.style==='up'){ty=(1-e)*g.dist}
    else if(g.style==='wipe'){clip='inset(0 '+((1-cubic(p))*100)+'% 0 0)'}
    if(g.flash&&t>=g.t&&t<g.t+0.3)flash=Math.max(flash,0.22*(1-(t-g.t)/0.3));
    // pulses
    (PULSES[g.key]||[]).forEach(pt=>{const q=(t-pt)/0.5;if(q>0&&q<1)sc*=1+0.06*Math.sin(Math.PI*q)});
    if(g.key==='title'){const q=(t-(lastRev))/0.35;if(q>0&&q<1)sc*=1+0.05*Math.sin(Math.PI*q)}
    // exit (staggered so the loop restarts clean)
    const ex=clamp((t-EXIT-i*0.025)/0.35),eo=1-ex;
    el.style.opacity=o*eo;
    el.style.clipPath=clip||'none';
    el.style.transform='translate('+tx+'px,'+(ty-ex*ex*60)+'px) scale('+(sc*(1+ex*0.05))+')';
    // inner stagger for card/cta contents
    if(g.kidStagger){[...el.children].forEach((c,k)=>{if(k===0)return;
      const q=clamp((t-g.t-0.12-k*g.kidStagger)/0.3);c.style.opacity=q;c.style.transform='translateY('+((1-cubic(q))*26)+'px)'})}
    if(g.key==='cta'){const first=el.children[0],a=0.5+0.5*Math.sin(t*4);
      first.style.boxShadow=t>g.t+0.5?'0 0 '+(24+36*a)+'px rgba(140,203,242,'+(0.35+0.4*a)+')':'none'}
  });
  document.getElementById('flash').style.opacity=flash;
  const bar=document.getElementById('bar');bar.style.width=(clamp(t/DUR)*W)+'px';bar.style.opacity=t>EXIT?1-clamp((t-EXIT)/0.5):0.85;
}
render(0);
</script></body></html>`;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox", "--disable-gpu"] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const pg = await ctx.newPage();
  const file = path.join(os.tmpdir(), path.basename(outBase) + ".html");
  fs.writeFileSync(file, page);
  await pg.goto("file://" + file);
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(300);
  fs.mkdirSync(path.dirname(outBase), { recursive: true });
  await pg.evaluate((t) => render(t), STILL_T);
  await pg.screenshot({ path: outBase + "_still.png" });
  if (process.env.STILL_ONLY) { console.log("still " + outBase); await browser.close(); return; }
  const frames = fs.mkdtempSync(path.join(os.tmpdir(), "frames_"));
  const n = DUR * FPS;
  for (let i = 0; i < n; i++) {
    await pg.evaluate((t) => render(t), i / FPS);
    await pg.screenshot({ path: path.join(frames, `f${String(i).padStart(4, "0")}.jpg`), type: "jpeg", quality: 95 });
  }
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(frames, "f%04d.jpg"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", "-an", outBase + ".mp4"]);
  fs.rmSync(frames, { recursive: true, force: true });
  console.log("video " + outBase);
  await browser.close();
})();
