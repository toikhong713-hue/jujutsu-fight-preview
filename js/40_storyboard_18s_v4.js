'use strict';
/* JFF Story Chapter 2: 18-second storyboard cut, in-engine Canvas visuals. */
(function(){
 if(window.__JFF_CH2_STORYBOARD_V4__)return;window.__JFF_CH2_STORYBOARD_V4__=true;
 const baseStart=window.startStoryChapter2,baseStep=window.step,baseRender=window.render,baseMenuKey=MenuKey,baseArena=window.drawArenaWorld;
 const clamp01=v=>Math.max(0,Math.min(1,v)),mix=(a,b,t)=>a+(b-a)*t,ease=v=>{v=clamp01(v);return v*v*(3-2*v);};
 const phases=[
  {a:0,b:.85,n:'OPENING_WIDE',label:'THE OPENING SLASH'},
  {a:.85,b:1.65,n:'BLADE_DETAIL',label:'POV 2  /  YUTA · KATANA'},
  {a:1.65,b:3,n:'OPENING_SLASH',label:'SUKUNA CUTS THE CORRIDOR'},
  {a:3,b:5.8,n:'WALL_BOUNCE',label:'WALL BOUNCE & DESTRUCTION'},
  {a:5.8,b:6.9,n:'RIKA_CATCH',label:'RIKA CATCHES HIM'},
  {a:6.9,b:9.5,n:'RCT',label:'RCT CANCEL  /  HEAL'},
  {a:9.5,b:11.8,n:'YUTA_DASH',label:'YUTA DASHES IN'},
  {a:11.8,b:12.8,n:'SUKUNA_WARP',label:'SUKUNA COUNTERS'},
  {a:12.8,b:16.1,n:'FINAL_CLASH',label:'DASH & FINAL CLASH'},
  {a:16.1,b:18,n:'FIGHT',label:'FIGHT'}
 ];
 const film=()=>G.ch2StoryboardV4&&G.ch2StoryboardV4.active?G.ch2StoryboardV4:null;
 const phaseAt=t=>{for(let i=phases.length-1;i>=0;i--)if(t>=phases[i].a)return i;return 0;};
 const qAt=(t,i)=>clamp01((t-phases[i].a)/(phases[i].b-phases[i].a));
 const sfx=n=>{try{if(SFX&&typeof SFX[n]==='function')SFX[n]();}catch(e){}};
 const camera=(x,y,z)=>{cam.x=cam.tx=x;cam.y=cam.ty=y;cam.zoom=cam.tzoom=z;cam.cine=0;};
 const setPose=(f,p,state)=>{if(!f)return;f.storyCinePose=p||null;f.state=state||'IDLE';f.stateFrame=0;f.vx=0;f.vy=0;f.walk=0;};
 function start(){
  if(typeof baseStart!=='function'||!baseStart.apply(this,arguments))return false;
  G.ch2CinematicV3=null;const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];if(!y||!s)return false;
  y.x=760;y.y=GROUND;y.vx=0;y.vy=0;y.facing=1;y.state='IDLE';y.stateFrame=0;y.animT=0;y.walk=0;
  s.x=1680;s.y=GROUND;s.vx=0;s.vy=0;s.facing=-1;s.state='IDLE';s.stateFrame=0;s.animT=0;s.walk=0;
  y.hp=y.maxHp;y.rikaTimer=0;y.storyCinePose='ready';y.storyCineRika=null;y.storyEnhanceVisual=false;
  s.storyCinePose='calm';s.awakenGlow=0;y.awakenGlow=0;
  G.storyCutscene=true;G.story.cutscene=true;G.roundState='intro';G.roundTimer=999999;
  G.ch2StoryboardV4={active:true,t:0,duration:18,phase:-1,impactApplied:false,clashMade:false,lastSlash:-1,healStart:.34,deflectSound:false};
  camera(1200,445,.66);G.flash=1;G.flashColor='#05030a';return true;
 }
 window.startStoryChapter2=start;
 function enter(c,i){
  c.phase=i;const y=G.fighters[0],s=G.fighters[1];
  if(i===0){setPose(y,'ready');setPose(s,'calm');y.storyCineRika=null;camera(1200,445,.66);}
  else if(i===1){setPose(y,'enhance');setPose(s,'calm');y.storyEnhanceVisual=true;y.x=760;camera(760,430,1.35);sfx('skill');}
  else if(i===2){setPose(y,'guard','BLOCK');setPose(s,'slash');y.storyEnhanceVisual=true;camera(1200,445,.70);G.flash=.18;G.flashColor='#ff263f';}
  else if(i===3){setPose(y,'hurt','KNOCKBACK');setPose(s,'slash-ready');y.storyEnhanceVisual=false;y.storyCineRika=null;y.x=760;y.y=GROUND-10;camera(940,430,1.08);}
  else if(i===4){setPose(y,'support','KNOCKDOWN');setPose(s,'calm');y.storyCineRika='support';y.rikaTimer=150;y.y=GROUND;y.x=680;camera(900,435,1.02);sfx('rika');G.flash=.26;G.flashColor='#d7bdff';try{ring(y.x,y.y-85,'#c9a6ff',82,32);}catch(e){}}
  else if(i===5){setPose(y,'rct');setPose(s,'calm');y.storyCineRika='support';y.rikaTimer=180;y.y=GROUND;y.x=700;camera(700,435,1.04);sfx('heal');}
  else if(i===6){setPose(y,'dash','DASH');setPose(s,'calm');y.storyCineRika=null;y.x=700;y.y=GROUND;camera(1030,440,.76);sfx('dash');}
  else if(i===7){setPose(y,'dash','DASH');setPose(s,'slash','DASH');y.x=1120;s.x=1600;y.y=GROUND;s.y=GROUND;camera(1330,440,.82);sfx('dash');}
  else if(i===8){setPose(y,'clash','IDLE');setPose(s,'clash','IDLE');y.x=1090;s.x=1280;y.y=GROUND;s.y=GROUND;camera(1190,438,1.02);}
  else if(i===9){setPose(y,'clash','IDLE');setPose(s,'clash','IDLE');y.storyCineRika=null;y.storyEnhanceVisual=false;camera(1190,438,.97);G.flash=.4;G.flashColor='#ffffff';}
  y.facing=1;s.facing=-1;
 }
 function tick(){
  const c=film();if(!c||G.mode!=='story'||!G.fighters||G.fighters.length<2)return;
  c.t+=1/60;if(c.t>=c.duration){finish();return;}
  const i=phaseAt(c.t),q=qAt(c.t,i);if(i!==c.phase)enter(c,i);
  const y=G.fighters[0],s=G.fighters[1];y.animT+=1.2;s.animT+=.82;y.stateFrame++;s.stateFrame++;
  if(i===0){camera(1200-18*q,445,.66+q*.025);y.storyCinePose='ready';s.storyCinePose='calm';if(Math.floor(c.t*60)%11===0)try{spark(1320+q*80,GROUND-95,2,'#ff4a5e',1.8,4,12,0);}catch(e){}}
  else if(i===1){y.x=760;s.x=1680;y.storyEnhanceVisual=true;camera(760,430,1.35+Math.sin(q*Math.PI)*.04);if(Math.floor(c.t*60)%5===0)try{spark(y.x+48,GROUND-112,2,'#e8dbff',1.4,4,12,0);}catch(e){}}
  else if(i===2){camera(1200,445,.70+Math.sin(q*Math.PI)*.03);y.x=760;s.x=1640-50*ease(q);y.storyCinePose='guard';s.storyCinePose='slash';if(Math.floor(c.t*60)%3===0){const xx=mix(s.x-100,y.x+55,.24+(Math.floor(c.t*60)%9)*.06);try{spark(xx,GROUND-rnd(55,190),3,'#ff3049',2.7,5,15,0);}catch(e){}}if(q>.2&&q<.86&&Math.floor(c.t*60)%7===0)try{ring(1090+q*140,GROUND-65,'#ff283d',34,19);}catch(e){}}
  else if(i===3){const u=ease(clamp01(q/.40));y.x=mix(760,660,u);y.y=GROUND-(q<.25?24+Math.sin(q*11)*36:0);y.storyCinePose=q<.42?'hurt':'down';y.state=q<.42?'KNOCKBACK':'KNOCKDOWN';s.x=1530;camera(940-36*u,430,1.08+u*.08);if(q>=.30&&!c.impactApplied){c.impactApplied=true;c.healStart=.34;y.hp=Math.max(1,Math.round(y.maxHp*c.healStart));y.x=660;y.y=GROUND;y.state='KNOCKDOWN';y.storyCinePose='down';G.flash=.70;G.flashColor='#f5f2ff';G.shake=22;G.hitstop=Math.max(G.hitstop||0,7);sfx('heavy');try{burst(y.x-10,GROUND-118,28,'#d5bdff',5,11,28);ring(y.x,GROUND-132,'#e9dbff',115,36);spark(y.x-12,GROUND-145,10,'#ffffff',3,7,20,0);}catch(e){}}}
  else if(i===4){y.x=680;y.y=GROUND;y.state='KNOCKDOWN';y.storyCinePose='support';y.storyCineRika='support';camera(900,435,1.02);if(Math.floor(c.t*60)%4===0)try{spark(y.x-24+rnd(-15,15),GROUND-90+rnd(-24,20),2,'#d9c5ff',1.1,4,15,0);}catch(e){}}
  else if(i===5){y.x=700;y.y=GROUND;y.state='IDLE';y.storyCinePose='rct';y.storyCineRika='support';const healQ=clamp01((q-.27)/.73);if(c.impactApplied)y.hp=Math.min(y.maxHp,Math.round(mix(y.maxHp*c.healStart,y.maxHp,healQ)));camera(700,435,1.04+Math.sin(q*Math.PI)*.025);if(Math.floor(c.t*60)%3===0)try{const hx=y.x+14,hy=GROUND-75;spark(hx+rnd(-22,22),hy+rnd(-34,22),1,'#8fffe1',.9,3,18,0);if(Math.floor(c.t*60)%12===0)ring(hx,hy,'#81f5d9',18+q*26,18);}catch(e){}}
  else if(i===6){const u=Math.pow(q,.54);y.x=mix(700,1110,u);y.y=GROUND;y.state='DASH';y.storyCinePose='dash';y.storyCineRika=null;s.x=1640;camera(1060+q*80,440,.76+q*.08);if(Math.floor(c.t*60)%2===0)try{if(typeof pushAfterimage==='function')pushAfterimage(y,computePose(y));spark(y.x-32,GROUND-89,2,'#d5bbff',1.8,4,13,0);}catch(e){}}
  else if(i===7){const u=ease(q);y.x=1120+u*26;s.x=mix(1600,1275,u);y.y=GROUND;s.y=GROUND;y.state='DASH';s.state='DASH';y.storyCinePose='dash';s.storyCinePose='slash';camera(1290,440,.82+Math.sin(q*Math.PI)*.06);if(Math.floor(c.t*60)%2===0)try{spark(s.x+16,GROUND-100,3,'#ff4057',2.8,5,13,0);spark(s.x-15,GROUND-85,2,'#ff9ba8',2,4,11,0);}catch(e){}}
  else if(i===8){const u=ease(q);y.x=mix(1120,1160,u);s.x=mix(1275,1220,u);y.y=GROUND;s.y=GROUND;y.state='IDLE';s.state='IDLE';y.storyCinePose='clash';s.storyCinePose='clash';camera(1190,438,1.02+Math.sin(q*Math.PI)*.045);if(q>=.38&&!c.clashMade){c.clashMade=true;G.flash=.82;G.flashColor='#f5edff';G.shake=24;G.hitstop=Math.max(G.hitstop||0,9);sfx('clash');try{burst((y.x+s.x)/2,GROUND-112,38,'#eadbff',7,15,34);burst((y.x+s.x)/2,GROUND-82,28,'#ff455e',6,12,30);ring((y.x+s.x)/2,GROUND-100,'#ffffff',130,36);}catch(e){}}if(q>.65&&Math.floor(c.t*60)%5===0)try{spark((y.x+s.x)/2,GROUND-108,6,'#ffffff',3.5,5,12,0);}catch(e){}}
  else if(i===9){y.x=1160;s.x=1220;y.y=GROUND;s.y=GROUND;y.state='IDLE';s.state='IDLE';y.storyCinePose='clash';s.storyCinePose='clash';camera(1190,438,.97);}
 }
 function finish(){
  if(!film())return;const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];
  if(y&&s){y.x=930;s.x=1270;y.y=GROUND;s.y=GROUND;y.vx=0;y.vy=0;s.vx=0;s.vy=0;y.hp=y.maxHp;s.hp=s.maxHp;y.state='IDLE';s.state='IDLE';y.stateFrame=0;s.stateFrame=0;y.storyCinePose=null;s.storyCinePose=null;y.storyCineRika=null;y.storyEnhanceVisual=false;y.rikaTimer=0;y.jffEnhanceCharge=0;y.jffEnhanceClock=0;y.awakenGlow=0;s.awakenGlow=0;y.facing=1;s.facing=-1;}
  G.storyCutscene=false;G.story.cutscene=false;G.story.phase=1;G.story.act=0;G.roundState='fight';G.roundTimer=0;try{localStorage.setItem('jff_story_ch2_checkpoint','1');localStorage.setItem('jff_story_ch2_checkpoint_name','PROLOGUE');}catch(e){}
  camera(1100,430,.86);G.flash=.24;G.flashColor='#fff';G.ch2StoryboardV4=null;
 }
 function abort(){G.ch2StoryboardV4=null;G.ch2CinematicV3=null;G.storyCutscene=false;G.story=null;G.fighters=[];G.mode='menu';G.roundState='intro';G.matchOver=false;G.matchOverScreen=false;G.paused=false;const d=document.getElementById('dialogue');if(d)d.classList.remove('on');showScreen('menu');}
 function hallway(){
  ctx.save();const bg=ctx.createLinearGradient(0,-80,0,GROUND+250);bg.addColorStop(0,'#080b12');bg.addColorStop(.52,'#171b24');bg.addColorStop(1,'#080a10');ctx.fillStyle=bg;ctx.fillRect(-500,-100,ARENA_W+1000,GROUND+430);
  ctx.fillStyle='#10141c';ctx.beginPath();ctx.moveTo(-500,-100);ctx.lineTo(570,120);ctx.lineTo(1870,120);ctx.lineTo(ARENA_W+600,-100);ctx.closePath();ctx.fill();
  const left=ctx.createLinearGradient(250,0,1140,0);left.addColorStop(0,'#242a34');left.addColorStop(.54,'#3a4048');left.addColorStop(1,'#202630');ctx.fillStyle=left;ctx.beginPath();ctx.moveTo(160,GROUND+15);ctx.lineTo(610,GROUND+15);ctx.lineTo(1120,126);ctx.lineTo(560,126);ctx.closePath();ctx.fill();
  const right=ctx.createLinearGradient(1280,0,2260,0);right.addColorStop(0,'#262c36');right.addColorStop(.56,'#353b45');right.addColorStop(1,'#181d26');ctx.fillStyle=right;ctx.beginPath();ctx.moveTo(1870,GROUND+15);ctx.lineTo(2300,GROUND+15);ctx.lineTo(1900,126);ctx.lineTo(1280,126);ctx.closePath();ctx.fill();
  const floor=ctx.createLinearGradient(0,130,0,GROUND+300);floor.addColorStop(0,'#262b35');floor.addColorStop(.45,'#161b24');floor.addColorStop(1,'#080b11');ctx.fillStyle=floor;ctx.beginPath();ctx.moveTo(560,126);ctx.lineTo(1900,126);ctx.lineTo(ARENA_W+500,GROUND+350);ctx.lineTo(-400,GROUND+350);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(174,187,207,.18)';ctx.lineWidth=2;for(let k=0;k<10;k++){const v=k/10;ctx.beginPath();ctx.moveTo(1200,130);ctx.lineTo(-380+v*350,GROUND+270);ctx.moveTo(1200,130);ctx.lineTo(1660+v*370,GROUND+270);ctx.stroke();}
  for(let k=0;k<9;k++){const yy=150+k*k*4.3;ctx.beginPath();ctx.moveTo(580-(yy-130)*1.6,yy);ctx.lineTo(1880+(yy-130)*1.6,yy);ctx.stroke();}
  ctx.strokeStyle='rgba(180,191,207,.34)';ctx.lineWidth=3;for(let k=0;k<4;k++){const d=640+k*118,top=175+k*15,ww=68-k*7,hh=225-k*17;ctx.fillStyle='rgba(5,8,14,.42)';ctx.fillRect(d,top,ww,hh);ctx.strokeRect(d,top,ww,hh);ctx.beginPath();ctx.moveTo(d+ww*.5,top);ctx.lineTo(d+ww*.5,top+hh);ctx.stroke();}
  for(let k=0;k<4;k++){const d=1630+k*128,top=175+k*14,ww=64-k*6,hh=224-k*17;ctx.fillStyle='rgba(5,8,14,.42)';ctx.fillRect(d,top,ww,hh);ctx.strokeRect(d,top,ww,hh);}
  ctx.fillStyle='rgba(220,234,250,.30)';for(let k=0;k<5;k++){const xx=1040+k*74;ctx.fillRect(xx,118,30,4);ctx.fillStyle='rgba(220,234,250,.10)';ctx.beginPath();ctx.ellipse(xx+15,126,34,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(220,234,250,.30)';}
  ctx.fillStyle='#303640';ctx.strokeStyle='rgba(195,205,222,.48)';ctx.lineWidth=3;ctx.fillRect(584,118,78,GROUND-118);ctx.strokeRect(584,118,78,GROUND-118);
  ctx.strokeStyle='rgba(12,15,22,.75)';ctx.lineWidth=2;for(let k=0;k<5;k++){const yy=190+k*58;ctx.beginPath();ctx.moveTo(590,yy);ctx.lineTo(655,yy-11);ctx.stroke();}
  const c=film();if(c&&c.phase>=0&&phases[c.phase].n==='WALL_BOUNCE'){const q=qAt(c.t,3),a=clamp01((q-.27)*2.8);ctx.save();ctx.globalAlpha=a;ctx.strokeStyle='rgba(8,10,15,.95)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(645,GROUND-125);ctx.lineTo(616,GROUND-149);ctx.lineTo(599,GROUND-142);ctx.lineTo(589,GROUND-172);ctx.moveTo(645,GROUND-125);ctx.lineTo(668,GROUND-151);ctx.lineTo(655,GROUND-173);ctx.lineTo(680,GROUND-189);ctx.moveTo(645,GROUND-125);ctx.lineTo(634,GROUND-100);ctx.lineTo(613,GROUND-88);ctx.moveTo(645,GROUND-125);ctx.lineTo(670,GROUND-105);ctx.lineTo(680,GROUND-78);ctx.stroke();ctx.restore();}
  if(c&&c.t<3){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.32;ctx.strokeStyle='#ff3048';ctx.lineWidth=3;for(let k=0;k<4;k++){const xx=790+k*195;ctx.beginPath();ctx.moveTo(xx,GROUND-10);ctx.lineTo(xx+70,GROUND-28);ctx.lineTo(xx+138,GROUND-25);ctx.stroke();}ctx.restore();}
  ctx.restore();
 }
 if(typeof baseArena==='function')window.drawArenaWorld=function(){if(film()){hallway();return;}baseArena.apply(this,arguments);};
 function bladeDetail(t){
  ctx.save();ctx.fillStyle='#080a10';ctx.fillRect(0,0,W,H);const wall=ctx.createLinearGradient(0,0,W,H);wall.addColorStop(0,'#252b35');wall.addColorStop(.6,'#10151e');wall.addColorStop(1,'#07090e');ctx.fillStyle=wall;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(170,187,207,.15)';ctx.lineWidth=2;for(let k=0;k<11;k++){ctx.beginPath();ctx.moveTo(k*137,0);ctx.lineTo(k*137-70,H);ctx.stroke();}
  ctx.fillStyle='#141720';ctx.beginPath();ctx.moveTo(20,65);ctx.lineTo(380,40);ctx.lineTo(690,125);ctx.lineTo(770,292);ctx.lineTo(570,445);ctx.lineTo(180,390);ctx.lineTo(45,245);ctx.closePath();ctx.fill();
  ctx.fillStyle='#decbbd';ctx.beginPath();ctx.moveTo(80,120);ctx.lineTo(380,80);ctx.lineTo(630,145);ctx.lineTo(610,305);ctx.lineTo(430,394);ctx.lineTo(160,315);ctx.closePath();ctx.fill();
  ctx.fillStyle='#171923';ctx.beginPath();ctx.moveTo(55,82);ctx.lineTo(165,18);ctx.lineTo(210,80);ctx.lineTo(294,21);ctx.lineTo(340,82);ctx.lineTo(460,38);ctx.lineTo(540,112);ctx.lineTo(635,102);ctx.lineTo(560,170);ctx.lineTo(340,143);ctx.lineTo(180,178);ctx.closePath();ctx.fill();
  ctx.fillStyle='#090b12';ctx.beginPath();ctx.moveTo(165,191);ctx.quadraticCurveTo(322,105,512,197);ctx.quadraticCurveTo(370,275,165,191);ctx.fill();ctx.fillStyle='#f4f0ed';ctx.beginPath();ctx.moveTo(178,191);ctx.quadraticCurveTo(336,129,486,197);ctx.quadraticCurveTo(333,240,178,191);ctx.fill();
  ctx.fillStyle='#3b566e';ctx.beginPath();ctx.ellipse(329,191,36,38,-.12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#090e18';ctx.beginPath();ctx.arc(337,191,17,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(348,178,7,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#11131b';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(134,177);ctx.quadraticCurveTo(330,100,535,183);ctx.stroke();
  ctx.save();ctx.translate(630,365);ctx.rotate(-.255);ctx.shadowColor='#c9a6ff';ctx.shadowBlur=22;ctx.fillStyle='#4a5060';ctx.beginPath();ctx.moveTo(-650,10);ctx.lineTo(570,-13);ctx.lineTo(650,0);ctx.lineTo(560,15);ctx.lineTo(-650,28);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#e9eef8';ctx.beginPath();ctx.moveTo(-650,10);ctx.lineTo(570,-13);ctx.lineTo(650,0);ctx.lineTo(560,4);ctx.lineTo(-650,21);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-650,10);ctx.lineTo(650,0);ctx.stroke();ctx.strokeStyle='#a77dff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-650,29);ctx.lineTo(560,14);ctx.stroke();ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.45+Math.sin(t*35)*.2;ctx.strokeStyle='#ff304a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(825,65);ctx.lineTo(1030,115);ctx.moveTo(865,95);ctx.lineTo(1100,150);ctx.stroke();ctx.restore();
  ctx.strokeStyle='rgba(232,237,248,.62)';ctx.lineWidth=1;ctx.strokeRect(28,28,W-56,H-56);ctx.textAlign='left';ctx.font='800 12px "Segoe UI",sans-serif';ctx.fillStyle='#dfd5ef';ctx.fillText('POV 2 : YUTA  /  KATANA INFUSION',48,H-55);ctx.restore();
 }
 function handDetail(q,t){
  ctx.save();ctx.fillStyle='#070d13';ctx.fillRect(0,0,W,H);const bg=ctx.createRadialGradient(W*.51,H*.54,12,W*.51,H*.54,460);bg.addColorStop(0,'rgba(30,76,81,.60)');bg.addColorStop(1,'rgba(4,8,13,1)');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(158,205,210,.13)';ctx.lineWidth=2;for(let k=0;k<8;k++){ctx.beginPath();ctx.moveTo(k*190,0);ctx.lineTo(k*190+190,H);ctx.stroke();}
  ctx.save();ctx.translate(W*.50,H*.57);ctx.rotate(-.24);ctx.globalCompositeOperation='lighter';const glow=ctx.createRadialGradient(0,30,3,0,20,190);glow.addColorStop(0,'rgba(220,255,246,.96)');glow.addColorStop(.22,'rgba(103,244,212,.76)');glow.addColorStop(.54,'rgba(58,186,177,.25)');glow.addColorStop(1,'rgba(58,186,177,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(0,10,155,190,0,0,Math.PI*2);ctx.fill();
  ctx.globalCompositeOperation='source-over';ctx.fillStyle='#c8b7ad';ctx.strokeStyle='#f1e9de';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-62,175);ctx.lineTo(-43,70);ctx.quadraticCurveTo(-106,14,-104,-38);ctx.lineTo(-88,-83);ctx.quadraticCurveTo(-75,-94,-66,-73);ctx.lineTo(-58,-31);ctx.lineTo(-36,-98);ctx.quadraticCurveTo(-28,-119,-13,-108);ctx.lineTo(-9,-56);ctx.lineTo(7,-126);ctx.quadraticCurveTo(23,-145,34,-122);ctx.lineTo(32,-53);ctx.lineTo(53,-107);ctx.quadraticCurveTo(73,-123,83,-101);ctx.lineTo(72,-21);ctx.quadraticCurveTo(83,33,50,78);ctx.lineTo(39,175);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#1b2833';ctx.fillRect(-62,145,105,48);ctx.strokeStyle='rgba(35,91,89,.65)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-46,64);ctx.quadraticCurveTo(-7,96,34,58);ctx.moveTo(-43,88);ctx.quadraticCurveTo(-7,111,27,88);ctx.stroke();ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(130,255,220,.9)';ctx.lineWidth=4;for(let k=0;k<5;k++){ctx.beginPath();ctx.moveTo(-54+k*29,60);ctx.quadraticCurveTo(-35+k*26,12,-62+k*34,-55-k*4);ctx.stroke();}ctx.restore();ctx.restore();
  ctx.textAlign='left';ctx.font='800 12px "Segoe UI",sans-serif';ctx.fillStyle='#a7f5df';ctx.fillText('POV 2 : RCT CANCEL & HEAL  /  TEAL LIGHT',48,H-55);ctx.fillStyle='rgba(164,244,225,.75)';ctx.fillRect(48,H-42,120+q*210,2);ctx.restore();
 }
 function impact(q){const a=clamp01((q-.22)*2.4);if(a<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;const x=W*.30,y=H*.58,g=ctx.createRadialGradient(x,y,2,x,y,190);g.addColorStop(0,'rgba(255,255,255,.86)');g.addColorStop(.18,'rgba(215,222,240,.46)');g.addColorStop(1,'rgba(140,155,180,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(219,229,243,.75)';ctx.lineWidth=2.4;ctx.beginPath();for(let k=0;k<10;k++){const an=k*Math.PI/5,r=34+(k%3)*13;ctx.moveTo(x+Math.cos(an)*r,y+Math.sin(an)*r);ctx.lineTo(x+Math.cos(an)*(r+26),y+Math.sin(an)*(r+26));}ctx.stroke();ctx.restore();}
 function sparkBurst(x,y,n,col,t){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=col;ctx.lineWidth=2;for(let k=0;k<n;k++){const a=k/n*Math.PI*2+t*.23,r=8+(k%3)*4;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.lineTo(x+Math.cos(a)*(r+14),y+Math.sin(a)*(r+14));ctx.stroke();}ctx.restore();}
 function overlay(){
  const c=film();if(!c||G.mode!=='story')return;const t=c.t,i=c.phase>=0?c.phase:phaseAt(t),q=qAt(t,i),n=phases[i].n;
  ctx.save();ctx.fillStyle='rgba(2,3,8,.97)';ctx.fillRect(0,0,W,36);ctx.fillRect(0,H-36,W,36);
  if(n==='OPENING_WIDE'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.12+Math.sin(t*15)*.05;ctx.strokeStyle='#b7c4d8';ctx.lineWidth=1;for(let k=0;k<8;k++){ctx.beginPath();ctx.moveTo(W*.5,H*.20);ctx.lineTo(k*190,H*.82);ctx.stroke();}ctx.restore();}
  else if(n==='BLADE_DETAIL'){ctx.restore();bladeDetail(t);return;}
  else if(n==='OPENING_SLASH'){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<7;k++){const z=(t*1.2+k*.16)%1,x=W*(.11+((k*.17+z*.51)%.82)),y=H*(.22+(k%4)*.14);ctx.globalAlpha=(1-z)*.82;ctx.strokeStyle=k%3===0?'#fff0f3':'#ff2844';ctx.lineWidth=k%3===0?2:3.5;ctx.beginPath();ctx.moveTo(x-140,y-72);ctx.lineTo(x+85,y+44);ctx.stroke();}ctx.globalAlpha=.6;ctx.strokeStyle='#ff273f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*.12,H*.70);ctx.lineTo(W*.47,H*.58);ctx.lineTo(W*.55,H*.60);ctx.moveTo(W*.58,H*.74);ctx.lineTo(W*.79,H*.66);ctx.stroke();ctx.restore();}
  else if(n==='WALL_BOUNCE'){impact(q);if(q>.25&&q<.72){ctx.save();ctx.globalAlpha=.5*(1-q);ctx.fillStyle='#aeb8c7';for(let k=0;k<9;k++){const dx=((t*94+k*57)%180)-90,dy=((t*150+k*29)%125)-62;ctx.beginPath();ctx.moveTo(W*.30+dx,H*.59+dy);ctx.lineTo(W*.30+dx+10,H*.59+dy-5);ctx.lineTo(W*.30+dx+12,H*.59+dy+6);ctx.closePath();ctx.fill();}ctx.restore();}}
  else if(n==='RIKA_CATCH'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.46+Math.sin(t*13)*.13;ctx.strokeStyle='#d9c2ff';ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(W*.28,H*.56,56+q*12,91+q*10,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  else if(n==='RCT'){if(q>.20&&q<.57){ctx.restore();handDetail(q,t);return;}ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.20+q*.15;const g=ctx.createRadialGradient(W*.30,H*.59,2,W*.30,H*.59,165);g.addColorStop(0,'rgba(193,255,239,.58)');g.addColorStop(.4,'rgba(94,226,201,.24)');g.addColorStop(1,'rgba(58,186,177,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(W*.30,H*.59,82,125,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(156,250,224,.76)';ctx.lineWidth=1.5;for(let k=0;k<4;k++){ctx.beginPath();ctx.ellipse(W*.30,H*.59,22+k*17,39+k*20,t*.24+k,0,Math.PI*2);ctx.stroke();}ctx.restore();}
  else if(n==='YUTA_DASH'){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<9;k++){ctx.globalAlpha=(1-k/10)*(.40+q*.32);ctx.strokeStyle=k%2?'#c9a6ff':'#f8f7ff';ctx.lineWidth=k===0?3:1.2;const yy=H*(.35+k*.035);ctx.beginPath();ctx.moveTo(W*(.10+q*.25),yy);ctx.lineTo(W*(.54+q*.28),yy-9-k);ctx.stroke();}ctx.restore();}
  else if(n==='SUKUNA_WARP'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.22+q*.45;ctx.strokeStyle='#ff334c';ctx.lineWidth=3;for(let k=0;k<8;k++){ctx.beginPath();ctx.moveTo(W*(.90-k*.045),H*(.18+k*.075));ctx.lineTo(W*(.56-k*.014),H*(.40+k*.033));ctx.stroke();}ctx.restore();}
  else if(n==='FINAL_CLASH'){const hit=clamp01((q-.34)*2.5);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.65+Math.sin(t*28)*.13;const x=W*.52,y=H*.49;ctx.strokeStyle='#f9f5ff';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(W*.35,H*.65);ctx.lineTo(W*.66,H*.36);ctx.stroke();ctx.strokeStyle='#d5b8ff';ctx.lineWidth=13;ctx.globalAlpha*=.22;ctx.beginPath();ctx.moveTo(W*.33,H*.66);ctx.lineTo(W*.68,H*.34);ctx.stroke();ctx.globalAlpha=hit*.78;ctx.strokeStyle='#ff3f58';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(W*.62,H*.60);ctx.lineTo(W*.44,H*.37);ctx.stroke();for(let k=0;k<3;k++){ctx.globalAlpha=hit*(.4-k*.08);ctx.strokeStyle=k===0?'#fff':'#c9a6ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(x,y,45+k*28,26+k*17,t*.1,0,Math.PI*2);ctx.stroke();}ctx.restore();
   if(q>.18&&q<.86){ctx.save();ctx.globalAlpha=.88;ctx.fillStyle='rgba(4,6,11,.84)';ctx.fillRect(34,52,205,76);ctx.fillRect(W-244,52,210,76);ctx.strokeStyle='rgba(230,232,243,.62)';ctx.lineWidth=1;ctx.strokeRect(34,52,205,76);ctx.strokeRect(W-244,52,210,76);ctx.fillStyle='#d9c7bb';ctx.beginPath();ctx.ellipse(137,91,74,26,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#11131a';ctx.beginPath();ctx.ellipse(137,91,44,12,-.05,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d5e9f4';ctx.beginPath();ctx.arc(137,91,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d8b49f';ctx.beginPath();ctx.ellipse(W-137,91,58,31,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8c3139';ctx.lineWidth=4;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(W-175+k*23,69);ctx.lineTo(W-163+k*22,111);ctx.stroke();}ctx.fillStyle='#211217';ctx.beginPath();ctx.ellipse(W-137,91,42,9,0,0,Math.PI*2);ctx.fill();ctx.restore();}
   if(q>.48)impact((q-.48)/.52);
  }else if(n==='FIGHT'){const a=clamp01(q*3),jit=Math.sin(t*70)>0?3:-2;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.62;ctx.fillStyle='#ff3654';ctx.font='900 76px Impact,"Segoe UI",sans-serif';ctx.textAlign='center';ctx.fillText('FIGHT',W/2-5+jit,H/2+16);ctx.fillStyle='#46e9f4';ctx.fillText('FIGHT',W/2+5-jit,H/2+16);ctx.restore();ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='900 76px Impact,"Segoe UI",sans-serif';ctx.lineWidth=8;ctx.strokeStyle='rgba(0,0,0,.9)';ctx.strokeText('FIGHT',W/2,H/2+16);ctx.fillStyle='#fff';ctx.fillText('FIGHT',W/2,H/2+16);ctx.save();ctx.globalAlpha=.50;ctx.strokeStyle='#ff334b';ctx.lineWidth=2;for(let k=0;k<7;k++){const yy=130+k*63+Math.sin(t*50+k)*5;ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(W,yy-16);ctx.stroke();}ctx.restore();}
  if(n!=='FIGHT'){ctx.globalAlpha=.94;ctx.textAlign='left';ctx.font='800 11px "Segoe UI",sans-serif';ctx.fillStyle=n==='RCT'?'#9df5df':'#c9a6ff';ctx.fillText('CHAPTER 2  /  RISING CONFLICT',28,H-65);ctx.fillStyle='#f3edf9';ctx.font='900 17px "Segoe UI",sans-serif';ctx.fillText(phases[i].label,28,H-43);ctx.fillStyle='rgba(201,166,255,.8)';ctx.fillRect(28,H-34,94,2);ctx.textAlign='right';ctx.font='600 10px "Segoe UI",sans-serif';ctx.fillStyle='rgba(245,238,255,.74)';ctx.fillText('ENTER / SPACE  ·  SKIP      ESC  ·  EXIT',W-28,H-43);}
  if(n!=='FIGHT'&&t>17.65){ctx.globalAlpha=clamp01((t-17.65)*3);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);}ctx.restore();
 }
 if(typeof baseStep==='function')window.step=function(){baseStep.apply(this,arguments);if(film())tick();};
 if(typeof baseRender==='function')window.render=function(){baseRender.apply(this,arguments);if(film())overlay();};
 MenuKey=function(code){
  if(film()&&G.mode==='story'){if(code==='Escape'){abort();return;}if(code==='Enter'||code==='Space'){finish();return;}return;}
  if(G.mode==='menu'&&screens.storySelect.classList.contains('on')&&(code==='Digit3'||code==='Numpad3')){start();return;}
  baseMenuKey.apply(this,arguments);
 };
 window.JFF_STORY_CHAPTER2={version:4,start,get active(){return G.mode==='story'&&G.story&&G.story.chapter===2;},get cinematic(){return !!film();},get elapsed(){return film()?film().t:0;}};
 console.info('[JFF Story Chapter 2] 18s storyboard cut loaded.');
})();