'use strict';
/* Chapter 2 cliffhanger: The Inevitable Intervention. */
(function(){
 if(window.__JFF_CH2_ENDING_V5__)return;
 window.__JFF_CH2_ENDING_V5__=true;
 const oldStep=window.step,oldRender=window.render,oldKey=MenuKey,oldResult=showResult,oldPose=window.computePose,oldDrawProjectiles=window.drawProjectiles;
 const clamp01=v=>Math.max(0,Math.min(1,v)),mix=(a,b,t)=>a+(b-a)*t;
 const ease=v=>{v=clamp01(v);return v*v*(3-2*v);};
 const beats=[
  {a:0,b:2.6,n:'POV_YUTA',label:'POV 1  /  YUTA · EXHAUSTED'},
  {a:2.6,b:4.9,n:'SUKUNA_CLOSE',label:'POV 2  /  SUKUNA · THE KING RISES'},
  {a:4.9,b:7.6,n:'RCT',label:'POV 2  /  REVERSE CURSED TECHNIQUE'},
  {a:7.6,b:10,n:'YUTA_REACT',label:'POV 1  /  YUTA · RESOLVE'},
  {a:10,b:12.6,n:'WORLD_SLASH',label:'POV 2  /  WORLD-CUTTING SLASH'},
  {a:12.6,b:15.2,n:'GOJO_ARRIVES',label:'POV 1  /  GOJO INTERVENES'},
  {a:15.2,b:19.4,n:'INFINITY',label:'POV 3  /  GOJO · INFINITY'},
  {a:19.4,b:22,n:'GOJO_LINE',label:'POV 3  /  GOJO SATORU'},
  {a:22,b:25,n:'AFTERMATH',label:'THE BATTLEFIELD HOLDS ITS BREATH'},
  {a:25,b:30,n:'END_CARD',label:'TO BE CONTINUED'}
 ];
 const dialogueCues=[
  {start:.32,end:2.38,speaker:'YUTA OKKOTSU',text:"He's healing... already?",color:'#c9a6ff',pitch:1.02,rate:.94},
  {start:2.72,end:4.82,speaker:'RYOMEN SUKUNA',text:"Did you think that would finish me, Okkotsu?",color:'#ff7180',pitch:.58,rate:.88},
  {start:7.72,end:9.76,speaker:'YUTA OKKOTSU',text:"I'm not letting you reach anyone else.",color:'#c9a6ff',pitch:1.02,rate:.94},
  {start:10.12,end:11.78,speaker:'RYOMEN SUKUNA',text:"Then try to stop this.",color:'#ff7180',pitch:.58,rate:.88},
  {start:12.82,end:14.35,speaker:'YUTA OKKOTSU',text:"Gojo-sensei?!",color:'#c9a6ff',pitch:1.02,rate:.9},
  {start:15.72,end:18.42,speaker:'RYOMEN SUKUNA',text:"So, the strongest finally arrives.",color:'#ff7180',pitch:.58,rate:.88},
  {start:19.58,end:21.55,speaker:'SATORU GOJO',text:"You're my enemy.",color:'#8fe7ff',pitch:.66,rate:.9},
  {start:22.12,end:24.28,speaker:'YUTA OKKOTSU',text:"He stopped it...?",color:'#c9a6ff',pitch:1.02,rate:.92}
 ];
 const film=()=>G.ch2EndingCine&&G.ch2EndingCine.active?G.ch2EndingCine:null;
 const isCh2=()=>G.mode==='story'&&G.story&&G.story.chapter===2;
 const phaseAt=t=>{for(let i=beats.length-1;i>=0;i--)if(t>=beats[i].a)return i;return 0;};
 const qAt=(t,i)=>clamp01((t-beats[i].a)/(beats[i].b-beats[i].a));
 const play=n=>{try{if(SFX&&typeof SFX[n]==='function')SFX[n]();}catch(e){}};
 const camera=(x,y,z)=>{cam.x=cam.tx=x;cam.y=cam.ty=y;cam.zoom=cam.tzoom=z;cam.cine=0;};
 function dismissDialog(){const d=document.getElementById('dialogue');if(d)d.classList.remove('on');}
 function unlock3(){try{localStorage.setItem('jff_story_ch2_complete','1');localStorage.setItem('jff_story_unlocked_ch3','1');localStorage.setItem('jff_story_ch2_ending','inevitable_intervention');}catch(e){}try{if(typeof syncStoryArchive==='function')syncStoryArchive();}catch(e){}if(G.story){G.story.ending='cliffhanger';G.story.phase=5;G.story.act=4;G.story.flags=G.story.flags||{};G.story.flags.cliffhanger=true;}}
 function shouldStart(){const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];return !!(isCh2()&&!film()&&!G.ch2StoryboardV4&&!G.ch2CinematicV3&&!G.ch2Cine&&!G.storyCutscene&&!G.story.cutscene&&y&&s&&s.id==='sukuna'&&s.hp<=0&&y.hp>0);}
 function startEnding(){
  if(film()||!isCh2())return false;
  const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];
  if(!y||!s||typeof createFighter!=='function')return false;
  dismissDialog();G.ch2StoryboardV4=null;G.ch2CinematicV3=null;G.ch2Cine=null;
  const gojo=createFighter('gojo',320,1,true);
  if(!gojo)return false;
  gojo.ai=null;gojo.opp=s;gojo.state='IDLE';gojo.stateFrame=0;gojo.walk=0;gojo.vx=0;gojo.vy=0;gojo.storyCinePose='arrival';gojo.storyCineRika=null;
  G.fighters.push(gojo);
  const low=Math.max(1,Math.round(s.maxHp*.025));
  G.ch2EndingCine={active:true,finished:false,t:0,duration:30,beat:-1,sukunaLow:low,sukunaMax:s.maxHp,registered:false,said:false,dialogueCueIndex:-1,
    gojoActor:gojo,gojoStartX:320,gojoBlockX:1085,slashOriginX:1460,slashImpactX:1105,slashCX:1460,slashActive:false,slashBlocked:false,slashDissolve:0,slashCharge:0,slashFlight:0,slashWidth:1};
  G.matchOver=false;G.matchOverScreen=false;G.winner=null;G.paused=false;G.storyCutscene=true;G.story.cutscene=true;G.roundState='intro';G.roundTimer=999999;
  y.x=950;y.y=GROUND;y.vx=0;y.vy=0;y.facing=1;y.state='BLOCK';y.stateFrame=0;y.storyCinePose='guard';y.storyCineRika=null;y.rikaTimer=0;
  s.x=1320;s.y=GROUND;s.vx=0;s.vy=0;s.facing=-1;s.state='KNOCKDOWN';s.stateFrame=0;s.storyCinePose=null;s.maxHp=G.ch2EndingCine.sukunaMax;s.hp=low;
  camera(1110,440,.91);G.shakeX=0;G.shakeY=0;G.zoomPunch=0;G.camPunch=0;G.flash=.48;G.flashColor='#eef7ff';G.shake=5;
  return true;
 }
 function speakDialogueCue(cue){
  try{
   if(!window.speechSynthesis||!window.SpeechSynthesisUtterance||!cue)return;
   window.speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance(cue.text);
   u.lang='en-US';u.rate=cue.rate||.92;u.pitch=cue.pitch||1;u.volume=.84;
   const voices=window.speechSynthesis.getVoices();
   const voice=voices.find(v=>/^en(-|_)?US/i.test(v.lang)&&(
     cue.speaker==='RYOMEN SUKUNA'?/male|david|mark|alex|daniel/i.test(v.name):
     cue.speaker==='SATORU GOJO'?/male|david|mark|alex|daniel/i.test(v.name):
     /female|zira|samantha|victoria|karen/i.test(v.name)
   ));
   if(voice)u.voice=voice;
   window.speechSynthesis.speak(u);
  }catch(e){}
 }
 function updateDialogue(c){
  const idx=dialogueCues.findIndex(v=>c.t>=v.start&&c.t<v.end);
  if(idx===c.dialogueCueIndex)return;
  c.dialogueCueIndex=idx;
  if(idx>=0)speakDialogueCue(dialogueCues[idx]);
 }
 function drawDialogueCue(t){
  const cue=dialogueCues.find(v=>t>=v.start&&t<v.end);
  if(!cue)return;
  const elapsed=t-cue.start,remain=cue.end-t;
  const fade=Math.min(1,elapsed/.13,remain/.16);
  const bw=Math.min(850,W-72),bh=64,bx=(W-bw)/2,by=H-137;
  ctx.save();ctx.globalAlpha=Math.max(0,fade);
  ctx.fillStyle='rgba(3,6,13,.91)';ctx.fillRect(bx,by,bw,bh);
  ctx.fillStyle=cue.color;ctx.fillRect(bx,by,3,bh);
  ctx.strokeStyle='rgba(225,235,250,.18)';ctx.lineWidth=1;ctx.strokeRect(bx+.5,by+.5,bw-1,bh-1);
  ctx.textAlign='left';ctx.font='900 10px "Segoe UI",sans-serif';ctx.fillStyle=cue.color;
  ctx.fillText(cue.speaker,bx+17,by+18);
  ctx.font='700 19px "Segoe UI",sans-serif';ctx.fillStyle='#f7f8fc';
  ctx.fillText(cue.text,bx+17,by+46,bw-34);
  ctx.restore();
 }
 function finishCard(){
  const c=G.ch2EndingCine;if(!c)return;
  c.t=30;c.beat=9;c.finished=true;G.matchOver=true;G.matchOverScreen=true;G.roundState='over';G.storyCutscene=true;G.story.cutscene=true;G.flash=0;G.shake=0;G.shakeX=0;G.shakeY=0;try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(e){}
  if(!c.registered){unlock3();c.registered=true;}
 }
 function enterBeat(c,i){
  c.beat=i;const y=G.fighters[0],s=G.fighters[1],g=c.gojoActor;
  if(i===0){y.state='HITSTUN';y.storyCinePose='hurt';s.state='KNOCKDOWN';camera(1110,440,.91);}
  else if(i===1){s.state='KNOCKDOWN';camera(s.x,GROUND-110,2.25);}
  else if(i===2){s.state='IDLE';s.awakenGlow=1;camera(s.x+6,GROUND-100,1.18);play('awaken');play('heal');}
  else if(i===3){y.state='HITSTUN';y.storyCinePose='hurt';s.state='IDLE';camera(y.x,GROUND-110,2.02);}
  else if(i===4){y.state='BLOCK';y.storyCinePose='guard';s.state='ATTACK';camera((y.x+s.x)/2,GROUND-108,.98);play('throwTech');c.slashActive=false;c.slashBlocked=false;c.slashDissolve=0;c.slashCX=c.slashOriginX;c.slashCharge=0;c.slashFlight=0;c.slashWidth=1;}
  else if(i===5){y.state='BLOCK';y.storyCinePose='guard';s.state='ATTACK';camera(1120,GROUND-110,.98);play('dash');G.flash=.32;G.flashColor='#dffbff';}
  else if(i===6){camera((g.x+s.x)/2,GROUND-112,1.06);c.slashBlocked=true;play('block');play('clash');G.flash=.58;G.flashColor='#e5fbff';G.shake=14;}
  else if(i===7){camera(g.x+38,GROUND-110,1.70);if(!c.said){c.said=true;play('speech');}}
  else if(i===8){camera(1130,GROUND-112,.88);c.slashActive=false;c.slashDissolve=1;}
  else if(i===9){camera(1100,GROUND-105,.92);unlock3();c.registered=true;}
 }
 function tick(){
  const c=film();if(!c||c.finished)return;
  G.flash=Math.max(0,(G.flash||0)-.045);G.shake=Math.max(0,(G.shake||0)-.7);G.shakeX=0;G.shakeY=0;
  c.t=Math.min(30,c.t+1/60);const i=phaseAt(c.t),q=qAt(c.t,i);if(i!==c.beat)enterBeat(c,i);
  const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1],g=c.gojoActor;
  if(y&&s){
   y.animT=(y.animT||0)+.7;s.animT=(s.animT||0)+.54;y.stateFrame++;s.stateFrame++;
   if(g){g.animT=(g.animT||0)+.9;g.stateFrame++;g.vx=0;g.vy=0;g.ai=null;}
   if(i===0){
    camera(1110+Math.sin(c.t*27)*2.3,440+Math.sin(c.t*17)*2,.91+Math.sin(c.t*2)*.012);
    s.x=1320;s.y=GROUND;s.state='KNOCKDOWN';if(g){g.x=c.gojoStartX;g.storyCinePose='arrival';}
   }else if(i===1){
    camera(s.x+Math.sin(c.t*4)*2,GROUND-110,2.25+Math.sin(q*Math.PI)*.025);
    s.x=1320;s.y=GROUND;s.state='KNOCKDOWN';if(g){g.x=c.gojoStartX;g.storyCinePose='arrival';}
   }else if(i===2){
    s.hp=Math.max(1,Math.round(mix(c.sukunaLow,c.sukunaMax*.42,ease(q))));s.state=q>.4?'IDLE':'KNOCKDOWN';s.awakenGlow=.8;
    camera(1260+Math.sin(c.t*4)*3,GROUND-108,1.18+Math.sin(q*Math.PI)*.025);
    if(g){g.x=c.gojoStartX;g.storyCinePose='arrival';}
    if(Math.floor(c.t*60)%6===0)try{spark(s.x+rnd(-38,38),GROUND-rnd(70,150),2,'#171c2a',1.5,5,14,0);spark(s.x+rnd(-27,27),GROUND-rnd(75,145),1,'#a8ced7',1,3,12,0);}catch(e){}
   }else if(i===3){
    y.x=950;y.y=GROUND;y.state='HITSTUN';y.storyCinePose='hurt';s.x=1320;s.state='IDLE';s.awakenGlow=.65;
    camera(965+Math.sin(c.t*20)*2,GROUND-110,2.02+Math.sin(q*Math.PI)*.02);if(g){g.x=c.gojoStartX;g.storyCinePose='arrival';}
   }else if(i===4){
    y.x=950;y.y=GROUND;y.state='BLOCK';y.storyCinePose='guard';s.x=1320;s.state='ATTACK';s.awakenGlow=.8;
    /* Sukuna holds a distinct casting pose; the spatial cut launches only in the final beat. */
    const chargeEnd=.78,flightEnd=.96;
    c.slashCharge=clamp01(q/chargeEnd);
    c.slashFlight=clamp01((q-chargeEnd)/(flightEnd-chargeEnd));
    c.slashCX=mix(c.slashOriginX,c.slashImpactX,ease(c.slashFlight));
    c.slashWidth=q<=flightEnd?1:1-.08*ease(clamp01((q-flightEnd)/.04));
    c.slashActive=q>.77;c.slashBlocked=false;c.slashDissolve=0;
    s.storyCinePose=q<.55?'wcs-windup':(q<.82?'wcs-aim':'wcs-release');
    if(q<.55)camera(1320,GROUND-108,1.34+Math.sin(q/.55*Math.PI)*.05);
    else if(q<.78)camera(mix(1320,1210,ease((q-.55)/.23)),GROUND-110,mix(1.34,.98,ease((q-.55)/.23)));
    else camera(1165,GROUND-110,.92);
    if(g){g.x=c.gojoStartX;g.storyCinePose='arrival';}
   }else if(i===5){
    y.x=950;y.y=GROUND;y.state='BLOCK';y.storyCinePose='guard';s.x=1320;s.state='ATTACK';s.awakenGlow=.7;
    const appear=ease(clamp01(q/.15));g.x=mix(c.gojoStartX,c.gojoBlockX,appear);g.y=GROUND;g.facing=1;
    g.storyCinePose=q<.15?'arrival':'wcs-brace';g.state=q<.15?'DASH':'BLOCK';
    /* The travelling arc has arrived at the brace point; keep the apex locked to both hands. */
    c.slashCX=c.slashImpactX;c.slashActive=true;c.slashBlocked=false;
    c.slashWidth=1;
    camera(1120+Math.sin(q*Math.PI)*3,GROUND-110,.98+Math.sin(q*Math.PI)*.035);
    if(q<.19&&Math.floor(c.t*60)%2===0)try{spark(g.x-15,GROUND-135,3,'#a9efff',2.2,5,13,0);spark(g.x-22,GROUND-95,2,'#eefcff',1.6,4,12,0);}catch(e){}
   }else if(i===6){
    g.x=c.gojoBlockX;g.y=GROUND;g.facing=1;g.storyCinePose='wcs-brace';g.state='BLOCK';
    y.x=950;y.state='BLOCK';s.x=1320;s.state='ATTACK';c.slashCX=c.slashImpactX;c.slashActive=true;c.slashBlocked=true;c.slashWidth=1;
    camera(1185,GROUND-110,1.06+Math.sin(q*Math.PI)*.025);
    if(Math.floor(c.t*60)%8===0)try{spark(g.x+20+rnd(-8,8),GROUND-126+rnd(-18,18),2,'#d7f9ff',1.3,3,12,0);}catch(e){}
    if(q>.46)c.slashDissolve=clamp01((q-.46)/.32);
   }else if(i===7){
    g.x=c.gojoBlockX;g.y=GROUND;g.facing=1;g.storyCinePose='infinity';g.state='IDLE';y.x=950;y.state='IDLE';s.x=1320;s.state='IDLE';
    c.slashDissolve=1;camera(g.x+38,GROUND-110,1.70+Math.sin(q*Math.PI)*.02);
   }else if(i===8){
    g.x=c.gojoBlockX;g.y=GROUND;g.facing=1;g.storyCinePose='infinity-release';g.state='IDLE';
    y.x=950;y.state='IDLE';y.storyCinePose='hurt';s.x=1320;s.state='IDLE';s.storyCinePose='clash';
    c.slashActive=false;c.slashDissolve=1;camera(1130+Math.sin(q*Math.PI)*12,GROUND-110,.88+Math.sin(q*Math.PI)*.025);
   }else{
    g.x=c.gojoBlockX;g.storyCinePose='infinity';g.state='IDLE';c.slashActive=false;camera(1100,GROUND-105,.92);
   }
  }
  if(i===5&&q<.18){const a=(1-ease(q/.18))*7;G.shakeX=Math.sin(c.t*94)*a;G.shakeY=Math.cos(c.t*77)*a*.42;}
  else if(i===6){const a=(1-q)*10;G.shakeX=Math.sin(c.t*92)*a;G.shakeY=Math.cos(c.t*83)*a*.48;}
  updateDialogue(c);
  if(c.t>=30)finishCard();
 } function px(wx){return W/2+(wx-cam.x)*cam.zoom;}
 function py(wy){return H/2+(wy-cam.y)*cam.zoom;}
 function caption(label,color){ctx.save();ctx.globalAlpha=.95;ctx.textAlign='left';ctx.font='800 11px "Segoe UI",sans-serif';ctx.fillStyle=color||'#c9a6ff';ctx.fillText('CHAPTER 2  /  THE INEVITABLE INTERVENTION',27,H-66);ctx.font='900 17px "Segoe UI",sans-serif';ctx.fillStyle='#f5f4fa';ctx.fillText(label,27,H-43);ctx.textAlign='right';ctx.font='600 10px "Segoe UI",sans-serif';ctx.fillStyle='rgba(242,243,252,.72)';ctx.fillText('ENTER / SPACE  ·  SKIP',W-27,H-43);ctx.restore();}
 function drawBars(c,t){
  const pct=clamp01((c.sukunaLow+(c.sukunaMax*.42-c.sukunaLow)*ease(qAt(t,2)))/c.sukunaMax),blink=.68+Math.sin(t*19)*.32;
  ctx.save();ctx.fillStyle='rgba(3,5,9,.86)';ctx.fillRect(W-330,48,300,45);ctx.strokeStyle='rgba(235,231,244,.35)';ctx.strokeRect(W-330,48,300,45);ctx.textAlign='left';ctx.font='900 11px "Segoe UI",sans-serif';ctx.fillStyle='#f4edf2';ctx.fillText('SUKUNA  /  RCT',W-318,65);ctx.fillStyle='#291119';ctx.fillRect(W-318,73,276,11);ctx.fillStyle='#ff263f';ctx.globalAlpha=blink;ctx.fillRect(W-318,73,276*pct,11);ctx.globalAlpha=1;if(t<beats[2].a+.25){ctx.globalAlpha=blink;ctx.textAlign='right';ctx.fillStyle='#ff3c50';ctx.font='900 12px "Segoe UI",sans-serif';ctx.fillText('CRITICAL',W-37,65);}ctx.restore();
 }
 function drawEndingWorldFX(){
  const c=film();if(!c||!c.active||c.finished||G.mode!=='story')return;
  const i=c.beat,t=c.t,y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1],g=c.gojoActor;
  if(i===2&&s){
   const x=s.x+4,yy=GROUND-104,q=qAt(t,2);ctx.save();ctx.globalCompositeOperation='lighter';
   const aura=ctx.createRadialGradient(x,yy,4,x,yy,125);aura.addColorStop(0,'rgba(18,22,35,.06)');aura.addColorStop(.28,'rgba(17,20,34,.30)');aura.addColorStop(.60,'rgba(135,22,44,.18)');aura.addColorStop(1,'rgba(130,0,20,0)');
   ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(x,yy,74+q*18,100+q*14,Math.sin(t*3)*.05,0,Math.PI*2);ctx.fill();
   for(let k=0;k<4;k++){ctx.globalAlpha=.30-k*.045;ctx.strokeStyle=k%2?'#a7b7c9':'#9d2037';ctx.lineWidth=2.1;ctx.beginPath();ctx.ellipse(x,yy,34+k*16,43+k*19,-t*.18+k*.5,0,Math.PI*2);ctx.stroke();}
   ctx.restore();
  }
  if(i===4&&s&&qAt(t,4)<.78){
   const q=qAt(t,4),hx=s.x-38,hy=GROUND-104,charge=ease(q/.78);
   ctx.save();ctx.globalCompositeOperation='lighter';
   const aura=ctx.createRadialGradient(hx,hy,3,hx,hy,36+charge*42);
   aura.addColorStop(0,'rgba(255,246,250,.82)');aura.addColorStop(.22,'rgba(255,53,91,.48)');aura.addColorStop(1,'rgba(255,30,55,0)');
   ctx.globalAlpha=.62;ctx.fillStyle=aura;ctx.beginPath();ctx.arc(hx,hy,36+charge*42,0,Math.PI*2);ctx.fill();
   for(let k=0;k<4;k++){
    const a=t*(2.2+k*.22)+k*Math.PI*.5,r=12+charge*25;
    ctx.globalAlpha=.28+charge*.42;ctx.strokeStyle=k%2?'#ff536c':'#f1fbff';ctx.lineWidth=1.4+k*.25;
    ctx.beginPath();ctx.ellipse(hx,hy,r*(1+k*.12),r*.38,a,0,Math.PI*1.58);ctx.stroke();
   }
   if(Math.floor(t*60)%3===0)try{spark(hx+rnd(-18,18),hy+rnd(-16,16),2,'#ff536c',1.9+charge*2,3.4,10,0);}catch(e){}
   ctx.restore();
  }
  if((i===4||i===5||i===6)&&c.slashActive&&c.slashDissolve<1){
   const fade=Math.max(0,i===6?1-c.slashDissolve:1);
   const widthScale=Math.max(.12,Math.min(1,c.slashWidth||1));
   const contactX=c.gojoBlockX+20,apexX=i===4?Math.max(contactX,c.slashCX):contactX;
   const apexY=GROUND-126,groundY=GROUND-5;
   /* Sideways parenthesis arc "(":
      the center bulges LEFT toward Yuta; its upper and lower ends sit to the RIGHT.
      The leftmost centerline point is anchored to Gojo's hand contact. */
   const radiusX=260,radiusY=groundY-apexY,curveEndX=apexX+radiusX,centers=[];
   const segments=84;
   for(let n=0;n<=segments;n++){
    const u=n/segments,angle=(u*2-1)*Math.PI/2;
    const x=apexX+radiusX*(1-Math.cos(angle));
    const y0=apexY+radiusY*Math.sin(angle);
    const tangentX=radiusX*Math.sin(angle),tangentY=radiusY*Math.cos(angle);
    const norm=Math.hypot(tangentX,tangentY)||1;
    const ripple=1.2*Math.sin(2*Math.PI*u)*Math.sin(Math.PI*u)*Math.sin(t*32+u*17);
    const taper=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.48);
    centers.push({x,y:y0+ripple,nx:-tangentY/norm,ny:tangentX/norm,taper,u});
   }
   function fillArcBand(halfWidth,fill){
    const top=[],bottom=[];
    for(const p of centers){
     const hw=halfWidth*p.taper*widthScale;
     top.push({x:p.x-p.nx*hw,y:p.y-p.ny*hw});
     bottom.push({x:p.x+p.nx*hw,y:p.y+p.ny*hw});
    }
    ctx.beginPath();ctx.moveTo(top[0].x,top[0].y);
    for(let k=1;k<top.length;k++)ctx.lineTo(top[k].x,top[k].y);
    for(let k=bottom.length-1;k>=0;k--)ctx.lineTo(bottom[k].x,bottom[k].y);
    ctx.closePath();ctx.fillStyle=fill;ctx.fill();
   }
   function drawDistortion(offset,color,lineWidth,alpha,phase){
    ctx.beginPath();
    for(let k=0;k<centers.length;k++){
     const p=centers[k],wobble=offset*Math.sin(p.u*Math.PI)*Math.sin(t*34+p.u*22+phase);
     const xx=p.x+wobble*.35,yy=p.y+wobble;
     if(k===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
    }
    ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.globalAlpha=fade*alpha;ctx.stroke();
   }
   ctx.save();ctx.globalAlpha=fade;ctx.lineJoin='round';ctx.lineCap='round';
   ctx.globalCompositeOperation='lighter';
   drawDistortion(12,'rgba(105,220,255,.68)',2.2,.82,.2);
   drawDistortion(8,'rgba(255,42,79,.78)',3,.7,2.1);
   drawDistortion(4,'rgba(235,250,255,.8)',1.3,.76,4.3);
   fillArcBand(58,'rgba(255,35,65,.24)');
   fillArcBand(48,'#02040a');
   fillArcBand(39,'#721525');
   fillArcBand(31,'#080b12');
   const core=ctx.createLinearGradient(apexX,apexY,curveEndX,groundY);
   core.addColorStop(0,'#ffffff');core.addColorStop(.34,'#dceefa');core.addColorStop(.56,'#ffffff');core.addColorStop(.79,'#d5e8f2');core.addColorStop(1,'#ffffff');
   fillArcBand(20,core);
   fillArcBand(11,'#ffffff');
   /* Leading wedge points LEFT toward Yuta; its base merges into the arc by Gojo's hands. */
   ctx.globalCompositeOperation='source-over';
   ctx.beginPath();ctx.moveTo(apexX-34,apexY);
   ctx.lineTo(apexX+39,apexY-17*widthScale);
   ctx.lineTo(apexX+29,apexY);
   ctx.lineTo(apexX+39,apexY+17*widthScale);
   ctx.closePath();ctx.fillStyle='#02040a';ctx.fill();
   ctx.strokeStyle='rgba(240,250,255,.75)';ctx.lineWidth=1.4;ctx.stroke();
   ctx.beginPath();ctx.moveTo(apexX-31,apexY);
   ctx.lineTo(apexX+31,apexY-6.5*widthScale);
   ctx.lineTo(apexX+38,apexY);
   ctx.lineTo(apexX+31,apexY+6.5*widthScale);
   ctx.closePath();ctx.fillStyle='#ffffff';ctx.fill();
   /* Lower endpoint reaches the floor: scrape marks are anchored there. */
   ctx.globalCompositeOperation='lighter';ctx.globalAlpha=fade*.82;
   ctx.strokeStyle='rgba(255,54,77,.82)';ctx.lineWidth=5.5;
   ctx.beginPath();ctx.moveTo(curveEndX-112,GROUND-5);ctx.lineTo(curveEndX+34,GROUND-5);ctx.stroke();
   ctx.strokeStyle='rgba(244,251,255,.9)';ctx.lineWidth=1.7;
   ctx.beginPath();ctx.moveTo(curveEndX-93,GROUND-7);ctx.lineTo(curveEndX+14,GROUND-7);ctx.stroke();
   for(let k=0;k<10;k++){
    const ex=curveEndX-91+k*12,ey=GROUND-5;
    ctx.globalAlpha=fade*(.22+(k%3)*.1);
    ctx.strokeStyle=k%2?'#ff5a72':'#effaff';ctx.lineWidth=k%2?1.8:1.2;
    ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+9,ey-3-(k%3)*2);ctx.stroke();
   }
   if((i===5||i===6)&&qAt(t,i)>.04){
    const pulse=1+Math.sin(t*42)*.045;
    ctx.globalAlpha=fade*(i===6?.65:.3);
    for(let k=0;k<4;k++){
     const rx=(18+k*17)*pulse,ry=(7+k*7)*pulse;
     ctx.strokeStyle=k%2?'rgba(255,72,105,.72)':'rgba(205,246,255,.78)';
     ctx.lineWidth=k===0?2.2:1.25;
     ctx.beginPath();ctx.ellipse(contactX,apexY,rx,ry,-.04,Math.PI*.10,Math.PI*1.90);ctx.stroke();
    }
    if(i===6&&Math.floor(t*60)%3===0){
     try{spark(contactX,apexY,2,'#f2fdff',2.4,3.8,10,0);spark(contactX-8,apexY+3,2,'#ff4d69',2,3,9,0);}catch(e){}
    }
   }
   ctx.restore();
  }
  if((i===5||i===6||i===7||i===8)&&g&&g.x>=c.gojoBlockX-6){
   const hx=g.x+20,hy=GROUND-126;ctx.save();ctx.globalCompositeOperation='lighter';
   for(let k=0;k<5;k++){const r=17+k*10+Math.sin(t*17+k*1.4)*2;ctx.globalAlpha=(i===5?.22:.52)-k*.065;ctx.strokeStyle=k%2?'#9feaff':'#ecfdff';ctx.lineWidth=k===0?2.7:1.25;ctx.beginPath();ctx.ellipse(hx,hy,r*1.05,r*1.22,t*.12+k*.13,0,Math.PI*2);ctx.stroke();}
   ctx.globalAlpha=i===5?.28:.48;ctx.strokeStyle='#a7eaff';ctx.lineWidth=1.4;
   for(let k=0;k<7;k++){const yy=GROUND-183+k*17;ctx.beginPath();ctx.moveTo(hx+58,yy);ctx.quadraticCurveTo(hx+26,yy+((k%2)?8:-8),hx+(k-3)*5,hy+(k-3)*3);ctx.stroke();}
   ctx.globalAlpha=.82;ctx.fillStyle='#e5fbff';ctx.beginPath();ctx.arc(hx,hy,3.5+Math.sin(t*26)*1.5,0,Math.PI*2);ctx.fill();ctx.restore();
  }
 }
 function drawTargetLock(t){
  const y=G.fighters&&G.fighters[0];if(!y)return;
  const hx=W/2+(y.x-cam.x)*cam.zoom+G.shakeX,hy=H/2+(GROUND-104-cam.y)*cam.zoom+G.shakeY,r=34+Math.sin(t*18)*2;
  ctx.save();ctx.globalAlpha=.82;ctx.strokeStyle='#bdeff7';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(hx,hy,r,0,Math.PI*2);ctx.moveTo(hx-r-12,hy);ctx.lineTo(hx-r+4,hy);ctx.moveTo(hx+r-4,hy);ctx.lineTo(hx+r+12,hy);ctx.moveTo(hx,hy-r-12);ctx.lineTo(hx,hy-r+4);ctx.moveTo(hx,hy+r-4);ctx.lineTo(hx,hy+r+12);ctx.stroke();ctx.font='800 10px "Segoe UI",sans-serif';ctx.fillStyle='#c6f4fb';ctx.textAlign='center';ctx.fillText('TARGET LOCK',hx,hy-r-10);ctx.restore();
 } function drawFinalCard(t){
  ctx.fillStyle='#020307';ctx.fillRect(0,0,W,H);const flicker=.78+Math.sin(t*53)*.08;ctx.save();ctx.globalAlpha=.38*flicker;ctx.fillStyle='#ff2446';ctx.fillRect(0,H*.47,W,2);ctx.fillStyle='#3de6f5';ctx.fillRect(0,H*.55,W,1);ctx.restore();
  ctx.save();ctx.textAlign='center';ctx.font='900 36px Impact,"Segoe UI",sans-serif';ctx.globalAlpha=.35;ctx.fillStyle='#ff3557';ctx.fillText('TO BE CONTINUED',W/2-3,H*.48);ctx.fillStyle='#42e7f4';ctx.fillText('TO BE CONTINUED',W/2+3,H*.48);ctx.globalAlpha=1;ctx.fillStyle='#f6f5f9';ctx.fillText('TO BE CONTINUED.',W/2,H*.48+2);ctx.font='800 14px "Segoe UI",sans-serif';ctx.fillStyle='rgba(238,239,245,.78)';ctx.fillText('WAIT FOR CHAPTER 3.',W/2,H*.57);ctx.globalAlpha=.62;ctx.font='600 10px "Segoe UI",sans-serif';ctx.fillText('CHAPTER 2 COMPLETE  ·  CHAPTER 3 UNLOCKED',W/2,H*.66);ctx.globalAlpha=.5;ctx.fillText('ENTER / SPACE  ·  STORY ARCHIVE',W/2,H*.86);ctx.restore();
 }
 function overlay(){
  const c=film();if(!c||G.mode!=='story')return;const t=c.t,i=c.beat>=0?c.beat:phaseAt(t),q=qAt(t,i),n=beats[i].n;
  ctx.save();ctx.fillStyle='rgba(1,3,8,.94)';ctx.fillRect(0,0,W,36);ctx.fillRect(0,H-36,W,36);
  const vg=ctx.createRadialGradient(W/2,H/2,140,W/2,H/2,780);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.42)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  if(n==='POV_YUTA'){
   drawBars(c,t);ctx.save();ctx.globalAlpha=.18+Math.sin(t*17)*.05;ctx.strokeStyle='#d9e3eb';ctx.lineWidth=1;for(let k=0;k<7;k++){ctx.beginPath();ctx.moveTo(W*.46,H*.37);ctx.lineTo(k*190,H*.86);ctx.stroke();}ctx.restore();
  }else if(n==='SUKUNA_CLOSE'||n==='RCT'){drawBars(c,t);}
  else if(n==='YUTA_REACT'){ctx.save();ctx.globalAlpha=.12+Math.sin(t*25)*.04;ctx.fillStyle='#e6e9f5';ctx.fillRect(0,0,W,H);ctx.restore();}
  else if(n==='WORLD_SLASH'){
   drawBars(c,t);drawTargetLock(t);if(q>.27&&q<.36){ctx.save();ctx.globalAlpha=.18*Math.sin(((q-.27)/.09)*Math.PI);ctx.fillStyle='#d8f9ff';ctx.fillRect(0,0,W,H);ctx.restore();}
   ctx.save();ctx.globalAlpha=.17;ctx.strokeStyle='#e2faff';ctx.lineWidth=1;for(let k=0;k<8;k++){const yy=H*(.18+k*.075);ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy+Math.sin(k+t*8)*2);ctx.stroke();}ctx.restore();
  }else if(n==='GOJO_ARRIVES'){
   if(q<.18){ctx.save();ctx.globalAlpha=(.18-q)*1.8;ctx.fillStyle='#bff5ff';ctx.fillRect(0,0,W,H);ctx.restore();}
  }else if(n==='INFINITY'){
   ctx.save();ctx.globalAlpha=.10+Math.sin(t*32)*.06;ctx.fillStyle='#d8faff';ctx.fillRect(0,0,W,H);ctx.restore();
  }else if(n==='GOJO_LINE'){
   ctx.save();ctx.globalCompositeOperation='lighter';
   const pulse=.5+.5*Math.sin(t*9);
   const gx=W*.69,gy=H*.37;
   ctx.globalAlpha=.12+pulse*.08;
   const glow=ctx.createRadialGradient(gx,gy,4,gx,gy,210);
   glow.addColorStop(0,'rgba(150,232,255,.62)');glow.addColorStop(1,'rgba(60,160,220,0)');
   ctx.fillStyle=glow;ctx.fillRect(gx-220,gy-220,440,440);
   ctx.globalAlpha=.28+pulse*.18;ctx.strokeStyle='#a8edff';ctx.lineWidth=1.2;
   ctx.beginPath();ctx.moveTo(W*.51,H*.29);ctx.lineTo(W*.86,H*.29);ctx.stroke();
   ctx.beginPath();ctx.moveTo(W*.57,H*.32);ctx.lineTo(W*.79,H*.32);ctx.stroke();
   ctx.restore();
  }else if(n==='END_CARD'){ctx.restore();drawFinalCard(t);return;}
  if(n!=='END_CARD')drawDialogueCue(t);
  caption(beats[i].label,n==='RCT'?'#d4b8ff':((n==='GOJO_LINE'||n==='INFINITY')?'#94e9ff':'#c9a6ff'));
  if(n==='GOJO_ARRIVES'&&q>.60){ctx.save();ctx.globalAlpha=clamp01((q-.60)*1.4);ctx.fillStyle='#eafcff';ctx.fillRect(0,0,W,H);ctx.restore();}
  ctx.restore();
 } function leave(){
  try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(e){}
  G.ch2EndingCine=null;G.ch2StoryboardV4=null;G.ch2CinematicV3=null;G.storyCutscene=false;G.flash=0;G.shake=0;G.shakeX=0;G.shakeY=0;G.story=null;G.fighters=[];G.mode='menu';G.matchOver=false;G.matchOverScreen=false;G.winner=null;G.paused=false;G.roundState='intro';dismissDialog();showScreen('storySelect');
 }
 if(typeof oldPose==='function')window.computePose=function(f){
  const P=oldPose.apply(this,arguments),c=film();
  if(!c||!f||!G.fighters)return P;
  const i=c.beat,t=c.t;
  const y=G.fighters[0],s=G.fighters[1],g=c.gojoActor;
  const poseArm=(key,a,b,d)=>{P[key]=d>0?[a,b]:[180-a,-b];};
  if(f===s&&i===4){
   const q=qAt(t,4),d=f.facing||-1;
   P.hipY=-56+Math.sin(t*10)*.7;P.shY=-94;P.headY=-110;P.headX=-2;
   P.legF=q<.55?[78,8]:(q<.82?[70,18]:[60,14]);P.legB=[122,-15];
   if(q<.55){
    const u=ease(q/.55);P.lean=mix(8,21,u);
    poseArm('armF',mix(-35,-52,u),mix(25,16,u),d);
    poseArm('armB',mix(-8,-35,u),mix(26,28,u),d);
   }else if(q<.82){
    const u=ease((q-.55)/.27);P.lean=mix(21,31,u);
    poseArm('armF',mix(-52,-7,u),mix(16,-18,u),d);
    poseArm('armB',mix(-35,-10,u),mix(28,-24,u),d);
   }else{
    const u=ease((q-.82)/.18);P.lean=mix(31,17,u);
    poseArm('armF',mix(-7,-3,u),mix(-18,-10,u),d);
    poseArm('armB',mix(-10,-2,u),mix(-24,-12,u),d);
   }
  }
  if(f===g){
   if(i===5&&qAt(t,5)<.15){
    const u=ease(qAt(t,5)/.15);P.hipY=-58;P.shY=-96;P.headY=-113;P.lean=mix(12,3,u);
    P.armF=[-72,38];P.armB=[-88,58];P.legF=[66,-24];P.legB=[118,-18];
   }else if(i===5||i===6){
    const q=i===5?qAt(t,5):qAt(t,6),pressure=.5+.5*Math.sin(t*34);
    /* Low center of gravity: front knee folds forward, rear leg anchors behind. */
    P.hipY=-51+pressure*1.7;P.shY=-94+pressure*1.2;P.headY=-106+pressure*1.1;P.headX=-2;
    P.lean=-19-pressure*3.5;P.armF=[-55-pressure*2,7];P.armB=[-40-pressure*2,-10];
    P.legF=[58,47+pressure*5];P.legB=[128,-18];
   }else if(i===7){
    P.hipY=-57;P.shY=-96;P.headY=-113;P.lean=2;
    P.armF=[10,-66];P.armB=[28,-60];P.legF=[88,5];P.legB=[95,-7];
   }else if(i===8){
    P.hipY=-57;P.shY=-95;P.headY=-112;P.lean=-2;
    P.armF=[48,-35];P.armB=[74,-25];P.legF=[88,8];P.legB=[96,-8];
   }else if(i>=9){
    P.hipY=-58;P.shY=-96;P.headY=-112;P.lean=2;
    P.armF=[64,28];P.armB=[112,18];P.legF=[88,7];P.legB=[95,-7];
   }
  }
  return P;
 };
 if(typeof oldDrawProjectiles==='function')window.drawProjectiles=function(){oldDrawProjectiles.apply(this,arguments);if(film())drawEndingWorldFX();};
 if(typeof oldResult==='function')showResult=function(){
  if(film())return;
  const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];
  if(isCh2()&&!G.storyCutscene&&!G.story.cutscene&&s&&s.hp<=0&&y&&y.hp>0){startEnding();return;}
  oldResult.apply(this,arguments);
 };
 if(typeof oldStep==='function')window.step=function(){
  if(film()){tick();return;}
  oldStep.apply(this,arguments);if(shouldStart())startEnding();
 };
 if(typeof oldRender==='function')window.render=function(){oldRender.apply(this,arguments);if(film())overlay();};
 MenuKey=function(code){
  const c=G.ch2EndingCine;
  if(c&&c.active){
   if(c.finished&&(code==='Enter'||code==='Space'||code==='Escape')){leave();return;}
   if(c.finished&&code==='KeyR'){G.ch2EndingCine=null;startStoryChapter2();return;}
   if(!c.finished&&(code==='Enter'||code==='Space'||code==='Escape')){finishCard();return;}
   return;
  }
  oldKey.apply(this,arguments);
 };
 window.JFF_CH2_ENDING={version:7,get active(){return !!film();},get elapsed(){return film()?film().t:0;},start:startEnding};
 console.info('[JFF Story Chapter 2] Inevitable Intervention ending v7: Sukuna cast pose, Gojo brace, dialogue timeline.');
})();