const fs=require("fs"),path=require("path");
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const A="/home/user/OILS26_Ads/07_Codigo/A3_desde_Roche/assets/";
const b64=(f,m)=>`data:${m};base64,${fs.readFileSync(A+f).toString("base64")}`;
const bg=b64("bg_teaser.jpg","image/jpeg"), logo=b64("oils_logo_fallback.png","image/png");
const OUT=process.argv[2];
const css=`*{box-sizing:border-box;margin:0}body{width:1920px;height:1080px;position:relative;overflow:hidden;background:#061433;font-family:Inter,Helvetica,Arial,sans-serif;color:#fff}
.bg{position:absolute;inset:0;background:url(${bg}) center/cover}.ov{position:absolute;inset:0;background:rgba(6,20,51,.78)}
.logo{position:absolute;left:80px;top:48px;width:230px}
.t1{position:absolute;left:350px;top:40px;font:800 78px 'Inter Display',Inter;letter-spacing:-1.5px;line-height:1.05}
.t1 span{color:#8CCBF2}.t2{position:absolute;left:352px;top:132px;font:500 30px Inter;color:#C9D6EC;letter-spacing:.5px}
.hd{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:22px 22px 0 0;text-align:center}
.hd b{font:800 34px 'Inter Display',Inter;letter-spacing:.5px}.hd i{font:600 23px Inter;font-style:normal;margin-top:4px}
.row{position:absolute;left:80px;width:1760px;border-radius:14px;background:rgba(255,255,255,.08);display:flex;align-items:center}
.row .l{padding:0 34px;font:500 23px/1.28 Inter;width:1010px;color:#fff}
.cell{position:absolute;display:flex;align-items:center;justify-content:center}
.chk{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:800 28px Inter}
.foot{position:absolute;left:80px;bottom:16px;font:500 20px Inter;color:#8CCBF2;letter-spacing:2px}
`;
const tiers=[{n:"Silver",p:"CHF 800",c:"#C9D6EC",t:"#0B2554"},{n:"Gold",p:"CHF 1600",c:"#E3B94A",t:"#2B1F00"},{n:"Platinum",p:"CHF 3000",c:"#9AA9C2",t:"#0B1B3A"},{n:"Plus",p:"+ CHF 1000",c:"#8CCBF2",t:"#06254E"}];
const rows=[
 ["Logo on conference website, online flyers, conference virtual background, homescreen at the beginning of both days, printed materials",[1,1,1,0]],
 ["Free access to the virtual conference platform to access online marketplace and 1:1 meetings with conference attendees",[1,1,1,0]],
 ["5 min company promotion talk at Networking Apero",[0,1,1,0]],
 ["Social Media advertising 1x month prior to conference (LinkedIn/Twitter)",[0,1,0,0]],
 ["Social Media advertising 2x month prior to conference (LinkedIn/Twitter)",[0,0,1,0]],
 ["Email marketing to share company’s content to attendees",[0,0,1,0]],
 ["Most prominent logo on all printed material",[0,0,1,0]],
 ["Logo and advertising material displayed during coffee breaks in viewing rooms and apero, booth/poster during conference, evening apero admission (max. 2)",[0,0,0,1]],
];
const X0=1096,CW=180,G=0; // tier column x
let s1=`<div class=bg></div><div class=ov></div><img class=logo src="${logo}">
<div class=t1>How to support us <span>#OILS26</span></div><div class=t2>Sponsorship packages</div>`;
tiers.forEach((t,i)=>{const x=X0+i*(CW+5);
 s1+=`<div class=hd style="left:${x}px;top:206px;width:${CW}px;height:118px;background:${t.c};color:${t.t}"><b>${t.n}</b><i>${t.p}</i></div>`;});
const RH=78,Y0=332;
rows.forEach((r,k)=>{const y=Y0+k*(RH+5);
 s1+=`<div class=row style="top:${y}px;height:${RH}px"><div class=l>${r[0]}</div></div>`;
 tiers.forEach((t,i)=>{const x=X0+i*(CW+5);
  s1+=`<div class=cell style="left:${x}px;top:${y}px;width:${CW}px;height:${RH}px;background:${r[1][i]?t.c+"33":"transparent"};border-radius:${k==rows.length-1?"0 0 22px 22px":"0"}">${r[1][i]?`<div class=chk style="background:${t.c};color:${t.t}">✓</div>`:""}</div>`;});
});
s1+=`<div class=foot>OILS26 · 20 OCTOBER 2026 · UNIVERSITY OF ZURICH</div>`;
const add=[["Sponsorship of Virtual One-to-One Matchmaking Session","name displayed on agenda","350"],
["Sponsorship of streaming from conference rooms","advertising material distribution, name of the sponsor for the conference room","500"],
["Sponsorship of coffee breaks","name on agenda and announced during apero","600"],
["Sponsorship of drink catering at the evening Networking Apero","name on agenda and announced during apero","1000"],
["Sponsorship for Best Innovation & Science pitch, or Poster winner prizes","Cash prize or giveaway (e.g. iPad, camera, gift certificate, etc.)",null]];
let s2=`<div class=bg></div><div class=ov></div><img class=logo src="${logo}">
<div class=t1>How to support us <span>#OILS26</span></div><div class=t2>Additional offers</div>
<div style="position:absolute;left:1500px;top:206px;width:340px;height:70px;border-radius:22px 22px 0 0;background:#8CCBF2;color:#06254E;display:flex;align-items:center;justify-content:center;font:800 38px 'Inter Display',Inter">CHF</div>`;
add.forEach((a,k)=>{const y=290+k*148;
 s2+=`<div class=row style="top:${y}px;height:136px"><div class=l style="width:1380px"><div style="font:700 34px/1.2 'Inter Display',Inter">${a[0]}</div><div style="font:500 25px Inter;color:#C9D6EC;margin-top:8px">${a[1]}</div></div></div>
 <div class=cell style="left:1500px;top:${y}px;width:340px;height:136px;background:#8CCBF233;border-radius:0 14px 14px 0;font:800 64px 'Inter Display',Inter;color:#8CCBF2">${a[2]||"<span style='font:700 30px Inter;color:#C9D6EC'>Open to discussion</span>"}</div>`;});
s2+=`<div class=foot>OILS26 · 20 OCTOBER 2026 · UNIVERSITY OF ZURICH</div>`;
(async()=>{const b=await chromium.launch({args:["--no-sandbox","--disable-gpu"]});
 const pg=await (await b.newContext({viewport:{width:1920,height:1080}})).newPage();
 for(const [n,h] of [["1",s1],["2",s2]]){
  await pg.setContent(`<!doctype html><html><head><meta charset=utf-8><style>${css}</style></head><body>${h}</body></html>`);
  await pg.evaluate(()=>document.fonts.ready);
  await pg.screenshot({path:`${OUT}/OILS26_Sponsorship_p${n}.png`});}
 await b.close();})();
