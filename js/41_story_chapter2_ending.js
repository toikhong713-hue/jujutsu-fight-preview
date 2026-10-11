'use strict';
/* Chapter 2 cliffhanger: The Inevitable Intervention. */
(function(){
 if(window.__JFF_CH2_ENDING_V1__)return;
 window.__JFF_CH2_ENDING_V1__=true;
 const oldStep=window.step,oldRender=window.render,oldKey=MenuKey,oldResult=showResult,oldPose=window.computePose,oldDrawProjectiles=window.drawProjectiles;
 const clamp01=v=>Math.max(0,Math.min(1,v)),mix=(a,b,t)=>a+(b-a)*t;
 const ease=v=>{v=clamp01(v);return v*v*(3-2*v);};
 const beats=[
  {a:0,b:2.5,n:'POV_YUTA',label:'POV 1  /  YUTA · EXHAUSTED'},
  {a:2.5,b:4,n:'SUKUNA_CLOSE',label:'POV 2  /  SUKUNA · CLOSE-UP'},
  {a:4,b:8,n:'RCT',label:'POV 2  /  REVERSE CURSED TECHNIQUE'},
  {a:8,b:10.3,n:'YUTA_REACT',label:'POV 1  /  YUTA REALIZES TOO LATE'},
  {a:10.3,b:14.8,n:'WORLD_SLASH',label:'POV 2  /  WORLD-CUTTING SLASH'},
  {a:14.8,b:17.3,n:'GOJO_ARRIVES',label:'POV 1  /  GOJO INTERVENES'},
  {a:17.3,b:20.4,n:'INFINITY',label:'POV 3  /  GOJO · INFINITY'},
  {a:20.4,b:22.3,n:'GOJO_LINE',label:'POV 3  /  GOJO SATORU'},
  {a:22.3,b:25,n:'END_CARD',label:'TO BE CONTINUED'}
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
  G.ch2EndingCine={active:true,finished:false,t:0,duration:25,beat:-1,sukunaLow:low,sukunaMax:s.maxHp,registered:false,said:false,
    gojoActor:gojo,gojoStartX:320,gojoBlockX:1085,slashCX:s.x+80,slashActive:false,slashBlocked:false,slashDissolve:0};
  G.matchOver=false;G.matchOverScreen=false;G.winner=null;G.paused=false;G.storyCutscene=true;G.story.cutscene=true;G.roundState='intro';G.roundTimer=999999;
  y.x=950;y.y=GROUND;y.vx=0;y.vy=0;y.facing=1;y.state='BLOCK';y.stateFrame=0;y.storyCinePose='guard';y.storyCineRika=null;y.rikaTimer=0;
  s.x=1320;s.y=GROUND;s.vx=0;s.vy=0;s.facing=-1;s.state='KNOCKDOWN';s.stateFrame=0;s.storyCinePose=null;s.maxHp=G.ch2EndingCine.sukunaMax;s.hp=low;
  camera(1110,440,.91);G.shakeX=0;G.shakeY=0;G.zoomPunch=0;G.camPunch=0;G.flash=.48;G.flashColor='#eef7ff';G.shake=5;
  return true;
 } function speakLine(){
  try{
   if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
   window.speechSynthesis.cancel();
   const u=new SpeechSynthesisUtterance("You're my enemy.");u.lang='en-US';u.rate=.78;u.pitch=.48;u.volume=.86;
   const voices=window.speechSynthesis.getVoices(),voice=voices.find(v=>/^en(-|_)?US/i.test(v.lang)&&/male|david|mark|alex|daniel/i.test(v.name));
   if(voice)u.voice=voice;
   u.onend=()=>{try{if(!film()||G.ch2EndingCine.beat!==7)return;const echo=new SpeechSynthesisUtterance("You're my enemy.");echo.lang='en-US';echo.rate=.92;echo.pitch=.43;echo.volume=.22;if(voice)echo.voice=voice;window.speechSynthesis.speak(echo);}catch(e){}};
   window.speechSynthesis.speak(u);
  }catch(e){}
 }
 function finishCard(){
  const c=G.ch2EndingCine;if(!c)return;
  c.t=25;c.beat=8;c.finished=true;G.matchOver=true;G.matchOverScreen=true;G.roundState='over';G.storyCutscene=true;G.story.cutscene=true;G.flash=0;G.shake=0;G.shakeX=0;G.shakeY=0;
  if(!c.registered){unlock3();c.registered=true;}
 }
 function enterBeat(c,i){
  c.beat=i;const y=G.fighters[0],s=G.fighters[1],g=c.gojoActor;
  if(i===0){y.state='BLOCK';y.storyCinePose='guard';s.state='KNOCKDOWN';camera(1110,440,.91);}
  else if(i===1){s.state='KNOCKDOWN';camera(s.x,GROUND-110,1.82);}
  else if(i===2){s.state='IDLE';s.awakenGlow=1;camera(s.x+6,GROUND-100,1.18);play('awaken');play('heal');}
  else if(i===3){y.state='HITSTUN';y.storyCinePose='hurt';s.state='IDLE';camera(y.x,GROUND-110,1.68);}
  else if(i===4){y.state='BLOCK';y.storyCinePose='guard';s.state='ATTACK';camera((y.x+s.x)/2,GROUND-108,.98);play('throwTech');c.slashActive=true;}
  else if(i===5){y.state='BLOCK';y.storyCinePose='guard';s.state='ATTACK';camera(1120,GROUND-110,.98);play('dash');G.flash=.32;G.flashColor='#dffbff';}
  else if(i===6){camera((g.x+s.x)/2,GROUND-112,1.06);c.slashBlocked=true;play('block');play('clash');G.flash=.58;G.flashColor='#e5fbff';G.shake=14;}
  else if(i===7){camera(g.x+38,GROUND-110,1.42);if(!c.said){c.said=true;play('speech');speakLine();}}
  else if(i===8){camera(1100,GROUND-105,.92);unlock3();c.registered=true;}
 }
 function tick(){
  const c=film();if(!c||c.finished)return;
  G.flash=Math.max(0,(G.flash||0)-.045);G.shake=Math.max(0,(G.shake||0)-.7);G.shakeX=0;G.shakeY=0;
  c.t=Math.min(25,c.t+1/60);const i=phaseAt(c.t),q=qAt(c.t,i);if(i!==c.beat)enterBeat(c,i);
  const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1],g=c.gojoActor;
  if(y&&s){
   y.animT=(y.animT||0)+.7;s.animT=(s.animT||0)+.54;y.stateFrame++;s.stateFrame++;
   if(g){g.animT=(g.animT||0)+.9;g.stateFrame++;g.vx=0;g.vy=0;g.ai=null;}
   if(i===0){
    camera(1110+Math.sin(c.t*27)*2.3,440+Math.sin(c.t*17)*2,.91+Math.sin(c.t*2)*.012);
    s.x=1320;s.y=GROUND;s.state='KNOCKDOWN';if(g){g.x=c.gojoStartX;g.storyCinePose='arrival';}
   }else if(i===1){
    camera(s.x+Math.sin(c.t*4)*2,GROUND-110,1.82+Math.sin(q*Math.PI)*.035);
    s.x=1320;s.y=GROUND;s.state='KNOCKDOWN';if(g){g.x=c.gojoStartX;g.storyCinePose='arrival';}
   }else if(i===2){
    s.hp=Math.max(1,Math.round(mix(c.sukunaLow,c.sukunaMax*.42,ease(q))));s.state=q>.4?'IDLE':'KNOCKDOWN';s.awakenGlow=.8;
    camera(1260+Math.sin(c.t*4)*3,GROUND-108,1.18+Math.sin(q*Math.PI)*.025);
    if(g){g.x=c.gojoStartX;g.storyCinePose='arrival';}
    if(Math.floor(c.t*60)%6===0)try{spark(s.x+rnd(-38,38),GROUND-rnd(70,150),2,'#171c2a',1.5,5,14,0);spark(s.x+rnd(-27,27),GROUND-rnd(75,145),1,'#a8ced7',1,3,12,0);}catch(e){}
   }else if(i===3){
    y.x=950;y.y=GROUND;y.state='HITSTUN';y.storyCinePose='hurt';s.x=1320;s.state='IDLE';s.awakenGlow=.65;
    camera(965+Math.sin(c.t*20)*2,GROUND-110,1.68+Math.sin(q*Math.PI)*.025);if(g){g.x=c.gojoStartX;g.storyCinePose='arrival';}
   }else if(i===4){
    y.x=950;y.y=GROUND;y.state='BLOCK';y.storyCinePose='guard';s.x=1320;s.state='ATTACK';s.awakenGlow=.8;
    c.slashCX=mix(s.x+80,c.gojoBlockX+155,ease(q));c.slashActive=q>.10;c.slashBlocked=false;
    camera(mix(1135,1160,q),GROUND-110,.98+Math.sin(q*Math.PI)*.025);
    if(g){g.x=c.gojoStartX;g.storyCinePose='arrival';}
   }else if(i===5){
    y.x=950;y.state='BLOCK';y.storyCinePose='guard';s.x=1320;s.state='ATTACK';s.awakenGlow=.7;
    const appear=ease(clamp01(q/.15));g.x=mix(c.gojoStartX,c.gojoBlockX,appear);g.y=GROUND;g.facing=1;
    g.storyCinePose=q<.15?'arrival':'infinity';g.state=q<.15?'DASH':'BLOCK';
    c.slashCX=c.gojoBlockX+155;c.slashActive=true;c.slashBlocked=false;
    camera(1120+Math.sin(q*Math.PI)*3,GROUND-110,.98+Math.sin(q*Math.PI)*.035);
    if(q<.19&&Math.floor(c.t*60)%2===0)try{spark(g.x-15,GROUND-135,3,'#a9efff',2.2,5,13,0);spark(g.x-22,GROUND-95,2,'#eefcff',1.6,4,12,0);}catch(e){}
   }else if(i===6){
    g.x=c.gojoBlockX;g.y=GROUND;g.facing=1;g.storyCinePose='infinity';g.state='BLOCK';
    y.x=950;y.state='BLOCK';s.x=1320;s.state='ATTACK';c.slashCX=c.gojoBlockX+155;c.slashActive=true;c.slashBlocked=true;
    camera(1185,GROUND-110,1.06+Math.sin(q*Math.PI)*.025);
    if(Math.floor(c.t*60)%8===0)try{spark(g.x+20+rnd(-8,8),GROUND-126+rnd(-18,18),2,'#d7f9ff',1.3,3,12,0);}catch(e){}
    if(q>.60)c.slashDissolve=clamp01((q-.60)/.34);
   }else if(i===7){
    g.x=c.gojoBlockX;g.y=GROUND;g.facing=1;g.storyCinePose='infinity';g.state='IDLE';y.x=950;y.state='IDLE';s.x=1320;s.state='IDLE';
    c.slashDissolve=1;camera(g.x+35,GROUND-110,1.42+Math.sin(q*Math.PI)*.02);
   }else{
    g.x=c.gojoBlockX;g.storyCinePose='infinity';g.state='IDLE';c.slashActive=false;camera(1100,GROUND-105,.92);
   }
  }
  if(i===5&&q<.18){const a=(1-ease(q/.18))*7;G.shakeX=Math.sin(c.t*94)*a;G.shakeY=Math.cos(c.t*77)*a*.42;}
  else if(i===6){const a=(1-q)*10;G.shakeX=Math.sin(c.t*92)*a;G.shakeY=Math.cos(c.t*83)*a*.48;}
  if(c.t>=25)finishCard();
 } function px(wx){return W/2+(wx-cam.x)*cam.zoom;}
 function py(wy){return H/2+(wy-cam.y)*cam.zoom;}
 function caption(label,color){ctx.save();ctx.globalAlpha=.95;ctx.textAlign='left';ctx.font='800 11px "Segoe UI",sans-serif';ctx.fillStyle=color||'#c9a6ff';ctx.fillText('CHAPTER 2  /  THE INEVITABLE INTERVENTION',27,H-66);ctx.font='900 17px "Segoe UI",sans-serif';ctx.fillStyle='#f5f4fa';ctx.fillText(label,27,H-43);ctx.textAlign='right';ctx.font='600 10px "Segoe UI",sans-serif';ctx.fillStyle='rgba(242,243,252,.72)';ctx.fillText('ENTER / SPACE  ·  SKIP',W-27,H-43);ctx.restore();}
 function drawBars(c,t){
  const pct=clamp01((c.sukunaLow+(c.sukunaMax*.42-c.sukunaLow)*ease(clamp01((t-4)/4)))/c.sukunaMax),blink=.68+Math.sin(t*19)*.32;
  ctx.save();ctx.fillStyle='rgba(3,5,9,.86)';ctx.fillRect(W-330,48,300,45);ctx.strokeStyle='rgba(235,231,244,.35)';ctx.strokeRect(W-330,48,300,45);ctx.textAlign='left';ctx.font='900 11px "Segoe UI",sans-serif';ctx.fillStyle='#f4edf2';ctx.fillText('SUKUNA  /  RCT',W-318,65);ctx.fillStyle='#291119';ctx.fillRect(W-318,73,276,11);ctx.fillStyle='#ff263f';ctx.globalAlpha=blink;ctx.fillRect(W-318,73,276*pct,11);ctx.globalAlpha=1;if(t<4.2){ctx.globalAlpha=blink;ctx.textAlign='right';ctx.fillStyle='#ff3c50';ctx.font='900 12px "Segoe UI",sans-serif';ctx.fillText('CRITICAL',W-37,65);}ctx.restore();
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
  if((i===4||i===5||i===6)&&c.slashActive&&c.slashDissolve<1){
   const cx=c.slashCX,fade=i===6?1-c.slashDissolve:1;
   const sx=cx+124,sy=GROUND-177,ex=cx-116,ey=GROUND-126,ctrlx=cx+7,ctrly=GROUND-238;
   ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.max(0,fade);ctx.lineCap='round';ctx.lineJoin='round';
   ctx.strokeStyle='rgba(2,4,9,.97)';ctx.lineWidth=48;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(ctrlx,ctrly,ex,ey);ctx.stroke();
   ctx.strokeStyle='rgba(4,8,15,.98)';ctx.lineWidth=39;ctx.beginPath();ctx.moveTo(sx+2,sy-1);ctx.quadraticCurveTo(ctrlx,ctrly-1,ex-1,ey);ctx.stroke();
   ctx.strokeStyle='#f8fbff';ctx.lineWidth=28;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(ctrlx,ctrly,ex,ey);ctx.stroke();
   ctx.strokeStyle='#ffffff';ctx.lineWidth=17;ctx.beginPath();ctx.moveTo(sx+1,sy);ctx.quadraticCurveTo(ctrlx-1,ctrly+2,ex,ey-1);ctx.stroke();
   ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(105,174,202,.52)';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(sx+4,sy-3);ctx.quadraticCurveTo(ctrlx+3,ctrly+5,ex+2,ey-3);ctx.stroke();
   for(let k=0;k<5;k++){const u=.18+k*.145,xx=mix(sx,ex,u),yy=mix(sy,ey,u)-Math.sin(u*Math.PI)*78;ctx.globalAlpha=fade*(.22+(k%2)*.12);ctx.strokeStyle=k%2?'#0d1723':'#b8eaf2';ctx.lineWidth=k%2?3:1.3;ctx.beginPath();ctx.moveTo(xx-9,yy-14);ctx.lineTo(xx+8,yy+11);ctx.stroke();}
   ctx.restore();
  }
  if((i===5||i===6||i===7)&&g&&g.x>=c.gojoBlockX-6){
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
   drawBars(c,t);drawTargetLock(t);if(q>.48&&q<.72){ctx.save();ctx.globalAlpha=.14;ctx.fillStyle='#d8f9ff';ctx.fillRect(0,0,W,H);ctx.restore();}
   ctx.save();ctx.globalAlpha=.17;ctx.strokeStyle='#e2faff';ctx.lineWidth=1;for(let k=0;k<8;k++){const yy=H*(.18+k*.075);ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy+Math.sin(k+t*8)*2);ctx.stroke();}ctx.restore();
  }else if(n==='GOJO_ARRIVES'){
   if(q<.18){ctx.save();ctx.globalAlpha=(.18-q)*1.8;ctx.fillStyle='#bff5ff';ctx.fillRect(0,0,W,H);ctx.restore();}
  }else if(n==='INFINITY'){
   ctx.save();ctx.globalAlpha=.10+Math.sin(t*32)*.06;ctx.fillStyle='#d8faff';ctx.fillRect(0,0,W,H);ctx.restore();
  }else if(n==='GOJO_LINE'){
   ctx.save();ctx.fillStyle='#f7f7fa';ctx.strokeStyle='#0a0c12';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(W*.48,H*.18);ctx.quadraticCurveTo(W*.48,H*.15,W*.52,H*.15);ctx.lineTo(W*.91,H*.15);ctx.quadraticCurveTo(W*.94,H*.15,W*.94,H*.19);ctx.lineTo(W*.94,H*.31);ctx.quadraticCurveTo(W*.94,H*.35,W*.90,H*.35);ctx.lineTo(W*.66,H*.35);ctx.lineTo(W*.61,H*.40);ctx.lineTo(W*.62,H*.35);ctx.lineTo(W*.52,H*.35);ctx.quadraticCurveTo(W*.48,H*.35,W*.48,H*.31);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#10131a';ctx.textAlign='center';ctx.font='900 20px Impact,"Segoe UI",sans-serif';ctx.fillText("You're my enemy.",W*.71,H*.255);ctx.restore();
  }else if(n==='END_CARD'){ctx.restore();drawFinalCard(t);return;}
  caption(beats[i].label,n==='RCT'?'#d4b8ff':((n==='GOJO_LINE'||n==='INFINITY')?'#94e9ff':'#c9a6ff'));
  if(n==='GOJO_ARRIVES'&&q>.60){ctx.save();ctx.globalAlpha=clamp01((q-.60)*1.4);ctx.fillStyle='#eafcff';ctx.fillRect(0,0,W,H);ctx.restore();}
  ctx.restore();
 } function leave(){
  try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(e){}
  G.ch2EndingCine=null;G.ch2StoryboardV4=null;G.ch2CinematicV3=null;G.storyCutscene=false;G.flash=0;G.shake=0;G.shakeX=0;G.shakeY=0;G.story=null;G.fighters=[];G.mode='menu';G.matchOver=false;G.matchOverScreen=false;G.winner=null;G.paused=false;G.roundState='intro';dismissDialog();showScreen('storySelect');
 }
 if(typeof oldPose==='function')window.computePose=function(f){
  const P=oldPose.apply(this,arguments),c=film();
  if(c&&f&&f===c.gojoActor){const arriving=c.beat===5&&qAt(c.t,5)<.16,speaking=c.beat===7;P.hipY=-58+Math.sin(c.t*5)*.7;P.shY=-96;P.headY=-113;P.headX=0;P.lean=arriving?9:2;P.armF=arriving?[-74,38]:(speaking?[70,28]:[-88,58]);P.armB=[112,24];P.legF=arriving?[66,-24]:[88,5];P.legB=arriving?[118,-18]:[94,-6];}
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
 window.JFF_CH2_ENDING={version:3,get active(){return !!film();},get elapsed(){return film()?film().t:0;},start:startEnding};
 console.info('[JFF Story Chapter 2] Inevitable Intervention ending ready.');
})();