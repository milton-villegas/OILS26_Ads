const fs=require("fs");const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const b=(f)=>"data:image/jpeg;base64,"+fs.readFileSync("/tmp/claude-0/-home-user-OILS26-Ads/9806ead1-6872-55aa-92d2-a5d41b3c230b/images/"+f).toString("base64");
const logo="data:image/png;base64,"+fs.readFileSync("/home/user/OILS26_Ads/07_Codigo/A3_desde_Roche/assets/oils_logo_fallback.png").toString("base64");
const html=`<!doctype html><html><head><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box;margin:0}
body{width:210mm;height:297mm;font-family:Inter,Helvetica,Arial,sans-serif;color:#0B2554;padding:12mm 16mm;position:relative}
.top{display:flex;align-items:center;gap:8mm;border-bottom:1.2mm solid #8CCBF2;padding-bottom:5mm}
.top img{height:15mm;background:#061433;padding:1.5mm 3mm;border-radius:2mm}
h1{font:800 21pt/1.1 'Inter Display',Inter}h1 span{color:#1B5DAA}
.sub{font:500 10.5pt Inter;color:#4a5f82;margin-top:1.5mm}
.box{background:#EAF3FC;border-radius:3mm;padding:4mm 5mm;margin:5mm 0 3mm;font:500 10.5pt/1.45 Inter}
.box b{color:#1B5DAA}
.step{margin-top:5mm}.step .h{display:flex;align-items:center;gap:3mm;font:700 12.5pt Inter;margin-bottom:2.5mm}
.n{width:7.5mm;height:7.5mm;border-radius:50%;background:#1B5DAA;color:#fff;display:flex;align-items:center;justify-content:center;font:800 11pt Inter}
.step p{font:500 10.5pt/1.45 Inter;margin:0 0 2.5mm 10.5mm}
.step img{display:block;width:146mm;margin-left:10.5mm;border:.3mm solid #c9d6ec;border-radius:2mm}
.foot{margin-top:6mm;font:500 9.5pt/1.45 Inter;color:#4a5f82;border-top:.3mm solid #c9d6ec;padding-top:3mm}
</style></head><body>
<div class=top><img src="${logo}"><div><h1>Roche site visit: <span>how to sign up</span></h1><div class=sub>OILS26  |  Wednesday 21 October 2026, Basel</div></div></div>
<div class=box>Please mark your interest in your <b>b2match profile</b> by <b>15 October 2026, 23:59 CEST</b>. Places are limited. If there are more requests than places, they will be allocated through a <b>fair random draw</b>, and everyone will be informed by email on 16 October. Participants arrange their own travel to and from Basel (transport is not provided).</div>
<div class=step><div class=h><div class=n>1</div>Log in to b2match and open "Edit profile"</div><p>On your home page, click the <b>pencil icon</b> next to "Go to my profile" (red arrow).</p><img src="${b("6.jpg")}"></div>
<div class=step><div class=h><div class=n>2</div>Answer "Yes" and save</div><p>Scroll to the question <b>"Would you like to be considered for the Roche site visit on Wednesday 21 October 2026 in Basel?"</b>, select <b>Yes</b> and click <b>Save</b> (bottom right).</p><img src="${b("7.jpg")}"></div>
<div class=foot>Questions or problems with the platform? Write to open@lifescience.uzh.ch.</div>
</body></html>`;
(async()=>{const br=await chromium.launch({args:["--no-sandbox"]});const pg=await br.newPage();await pg.setContent(html);await pg.evaluate(()=>document.fonts.ready);
await pg.pdf({path:"/home/user/OILS26_Ads/Logistica_ETH/roche_visit/OILS26_Roche_visit_instructions.pdf",format:"A4",printBackground:true});await br.close();})();
