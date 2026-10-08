// Sponsorship packages: JPG (3840x2160) + PDF from HTML. Content in content.json.  node build_sponsorship.js <outdir>
const fs=require("fs"),path=require("path");
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||"playwright");
const C=JSON.parse(fs.readFileSync(path.join(__dirname,"content.json"),"utf8"));
const uri=(f,m)=>`data:${m};base64,${fs.readFileSync(path.join(__dirname,f)).toString("base64")}`;
const bg=uri("bg_16x9.jpg","image/jpeg"),logo=uri("logo_oils.png","image/png");
const OUT=process.argv[2]||".";
const TIER=[{c:"#C9D6EC",t:"#0B2554"},{c:"#E3B94A",t:"#2B1F00"},{c:"#9AA9C2",t:"#0B1B3A"},{c:"#8CCBF2",t:"#06254E"}];
const css=`*{box-sizing:border-box;margin:0}@page{size:1920px 1080px;margin:0}body{width:1920px;height:1080px;position:relative;overflow:hidden;background:#061433;font-family:Inter,Helvetica,Arial,sans-serif;color:#fff;-webkit-print-color-adjust:exact}
.bg{position:absolute;inset:0;background:url(${bg}) center/cover}.ov{position:absolute;inset:0;background:rgba(6,20,51,.78)}
.logo{position:absolute;left:80px;top:48px;width:230px}
.t1{position:absolute;left:350px;top:40px;font:800 78px 'Inter Display',Inter;letter-spacing:-1.5px;line-height:1.05}.t1 span{color:#8CCBF2}
.t2{position:absolute;left:352px;top:132px;font:500 30px Inter;color:#C9D6EC;letter-spacing:.5px}
.hd{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:22px 22px 0 0;text-align:center}
.hd b{font:800 34px 'Inter Display',Inter}.hd i{font:600 23px Inter;font-style:normal;margin-top:4px}
.row{position:absolute;left:80px;width:1760px;border-radius:14px;background:rgba(255,255,255,.08);display:flex;align-items:center}
.row .l{padding:0 34px;font:500 23px/1.28 Inter;width:1010px}
.cell{position:absolute;display:flex;align-items:center;justify-content:center}
.chk{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:800 26px Inter}
.foot{position:absolute;left:80px;bottom:16px;font:500 20px Inter;color:#8CCBF2;letter-spacing:2px}`;
const head=(sub)=>`<div class=bg></div><div class=ov></div><img class=logo src="${logo}"><div class=t1>How to support us <span>#OILS26</span></div><div class=t2>${sub}</div>`;
const foot0=`<div class=foot>OILS26 · 20 OCTOBER 2026 · UNIVERSITY OF ZURICH</div>`;
const foot=foot0;const X0=1105,CW=180,GAP=4,RH=68,Y0=300;
let s1=head("Sponsorship packages");
C.tiers.forEach((t,i)=>{const x=X0+i*(CW+GAP);s1+=`<div class=hd style="left:${x}px;top:190px;width:${CW}px;height:104px;background:${TIER[i].c};color:${TIER[i].t}"><b>${t[0]}</b><i>${t[1]}</i></div>`;});
C.rows.forEach((r,k)=>{const y=Y0+k*(RH+GAP);s1+=`<div class=row style="top:${y}px;height:${RH}px"><div class=l>${r[0]}</div></div>`;
 C.tiers.forEach((t,i)=>{const x=X0+i*(CW+GAP);s1+=`<div class=cell style="left:${x}px;top:${y}px;width:${CW}px;height:${RH}px;background:${r[1][i]?TIER[i].c+"33":"transparent"}">${r[1][i]?`<div class=chk style="background:${TIER[i].c};color:${TIER[i].t}">✓</div>`:""}</div>`;});});

const priced=C.add.some(a=>a[2]),one=C.add.length===1,RW=one?480:340,RX=1840-RW,AH=one?300:136,AG=one?0:148;
const pz=C.add[0];s1+=foot;
s1+=`<div class=row style="top:892px;height:112px"><div class=l style="width:1300px"><div style="font:700 20px Inter;letter-spacing:3px;color:#8CCBF2;margin-bottom:6px">ADDITIONAL OFFER</div><div style="font:700 32px/1.2 'Inter Display',Inter">${pz[0]}</div><div style="font:500 23px Inter;color:#C9D6EC;margin-top:4px">${pz[1]}</div></div></div><div class=cell style="left:1380px;top:892px;width:460px;height:112px;background:#8CCBF233;border-radius:0 14px 14px 0;font:700 34px Inter;color:#8CCBF2">Open to discussion</div>`;

const page=(h)=>`<!doctype html><html><head><meta charset=utf-8><style>${css}</style></head><body>${h}</body></html>`;
(async()=>{const b=await chromium.launch({args:["--no-sandbox","--disable-gpu"]});
 const ctx=await b.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:2});const pg=await ctx.newPage();
 for(const [n,h] of [["onepage",s1]]){await pg.setContent(page(h));await pg.evaluate(()=>document.fonts.ready);
  await pg.screenshot({path:path.join(OUT,`OILS26_Sponsorship_p${n}.png`)});
  await pg.pdf({path:path.join(OUT,`OILS26_Sponsorship_p${n}.pdf`),width:"1920px",height:"1080px",printBackground:true});}
 await b.close();})();
