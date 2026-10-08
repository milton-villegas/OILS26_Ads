// Editable PowerPoint (2 slides, 19.2 x 10.8 in = 1920x1080 at 100 px/in). Content in content.json.
// NODE_PATH=<dir with pptxgenjs> node build_sponsorship_pptx.js <outdir>
const fs=require("fs"),path=require("path");const pptxgen=require("pptxgenjs");
const C=JSON.parse(fs.readFileSync(path.join(__dirname,"content.json"),"utf8"));
const OUT=process.argv[2]||".";const px=n=>n/100,pt=n=>Math.round(n*0.72*100)/100;
const HEAD="Eurostile",BODY="Arial",NAVY="061433",SKY="8CCBF2",SOFT="C9D6EC",WHITE="FFFFFF";
const TIER=[{c:"C9D6EC",t:"0B2554"},{c:"E3B94A",t:"2B1F00"},{c:"9AA9C2",t:"0B1B3A"},{c:"8CCBF2",t:"06254E"}];
const pres=new pptxgen();pres.defineLayout({name:"S",width:19.2,height:10.8});pres.layout="S";pres.title="OILS26 Sponsorship packages";
const R=pres.ShapeType.rect,RR=pres.ShapeType.roundRect,TOP=pres.ShapeType.round2SameRect;
function base(sub){const s=pres.addSlide();s.background={color:NAVY};
 s.addImage({path:path.join(__dirname,"bg_16x9.jpg"),x:0,y:0,w:19.2,h:10.8,altText:"OILS pattern background"});
 s.addShape(R,{x:0,y:0,w:19.2,h:10.8,fill:{color:NAVY,transparency:22},line:{type:"none"}});
 s.addImage({path:path.join(__dirname,"logo_oils.png"),x:px(80),y:px(48),w:px(230),h:px(103),altText:"OILS logo"});
 s.addText([{text:"How to support us ",options:{color:WHITE}},{text:"#OILS26",options:{color:SKY}}],{x:px(350),y:px(36),w:px(1450),h:px(100),fontFace:HEAD,fontSize:pt(76),bold:true,margin:0,valign:"middle",fit:"none"});
 s.addText(sub,{x:px(352),y:px(130),w:px(900),h:px(44),fontFace:BODY,fontSize:pt(30),color:SOFT,margin:0,valign:"middle"});
 s.addText("OILS26  |  20 OCTOBER 2026  |  UNIVERSITY OF ZURICH",{x:px(80),y:px(1030),w:px(1200),h:px(30),fontFace:BODY,fontSize:pt(20),color:SKY,charSpacing:2,margin:0,valign:"middle"});
 return s;}
const row=(s,y,h,w=1760)=>s.addShape(RR,{x:px(80),y:px(y),w:px(w),h:px(h),rectRadius:px(14),fill:{color:WHITE,transparency:92},line:{type:"none"}});
// slide 1
const X0=1105,CW=180,GAP=4,RH=68,Y0=300;let s=base("Sponsorship packages");
C.tiers.forEach((t,i)=>{const x=X0+i*(CW+GAP);
 s.addShape(TOP,{x:px(x),y:px(190),w:px(CW),h:px(104),fill:{color:TIER[i].c},line:{type:"none"}});
 s.addText([{text:t[0],options:{fontFace:HEAD,fontSize:pt(34),bold:true,breakLine:true}},{text:t[1],options:{fontFace:BODY,fontSize:pt(23),bold:true}}],{x:px(x),y:px(190),w:px(CW),h:px(104),color:TIER[i].t,align:"center",valign:"middle",margin:0,fit:"none"});});
C.rows.forEach((r,k)=>{const y=Y0+k*(RH+GAP);row(s,y,RH);
 s.addText(r[0],{x:px(114),y:px(y),w:px(960),h:px(RH),fontFace:BODY,fontSize:pt(23),color:WHITE,margin:0,valign:"middle",lineSpacingMultiple:1.05,fit:"none"});
 C.tiers.forEach((t,i)=>{if(!r[1][i])return;const x=X0+i*(CW+GAP);
  s.addShape(R,{x:px(x),y:px(y),w:px(CW),h:px(RH),fill:{color:TIER[i].c,transparency:80},line:{type:"none"}});
  s.addShape(pres.ShapeType.ellipse,{x:px(x+CW/2-21),y:px(y+RH/2-21),w:px(42),h:px(42),fill:{color:TIER[i].c},line:{type:"none"}});
  s.addText("✓",{x:px(x+CW/2-21),y:px(y+RH/2-21),w:px(42),h:px(42),fontFace:BODY,fontSize:pt(26),bold:true,color:TIER[i].t,align:"center",valign:"middle",margin:0});});});
// prizes strip (same slide)
const pz=C.add[0];row(s,892,112);
s.addShape(R,{x:px(1380),y:px(892),w:px(460),h:px(112),fill:{color:SKY,transparency:80},line:{type:"none"}});
s.addText([{text:"ADDITIONAL OFFER",options:{fontFace:BODY,fontSize:pt(20),bold:true,color:SKY,charSpacing:3,breakLine:true}},{text:pz[0],options:{fontFace:HEAD,fontSize:pt(32),bold:true,color:WHITE,breakLine:true}},{text:pz[1],options:{fontFace:BODY,fontSize:pt(23),color:SOFT}}],{x:px(114),y:px(892),w:px(1240),h:px(112),margin:0,valign:"middle",fit:"none"});
s.addText("Open to discussion",{x:px(1380),y:px(892),w:px(460),h:px(112),fontFace:BODY,fontSize:pt(34),bold:true,color:SKY,align:"center",valign:"middle",margin:0});
pres.writeFile({fileName:path.join(OUT,"OILS26_Sponsorship_Packages.pptx")}).then(()=>console.log("ok"));
