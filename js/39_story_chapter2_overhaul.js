'use strict';
/* Chapter 2 Cinematic / Rika / Enhance / Tap Ultimate overhaul. Isolated to Story Chapter 2. */
(function(){
 if(window.__JFF_CH2_OVERHAUL_V3__)return;window.__JFF_CH2_OVERHAUL_V3__=true;
 const prevStep=window.step,prevRender=window.render,prevMenuKey=MenuKey,prevBeam=window.startYutaBeam,prevResolve=window.resolveHit,prevArena=window.drawArenaWorld,prevFighter=window.drawFighter,prevPose=window.computePose;
 const clamp01=v=>Math.max(0,Math.min(1,v)),mix=(a,b,t)=>a+(b-a)*t,ease=v=>{v=clamp01(v);return v*v*(3-2*v);};
 const phases=[
 {a:0,b:2.2,n:'SLASHES',title:'SUKUNA SPLITS THE SILENCE'},
 {a:2.2,b:3.6,n:'ENHANCE',title:'ENHANCE  /  BLADE GUARD'},
 {a:3.6,b:5,n:'DEFLECT',title:'STEEL AGAINST CALAMITY'},
 {a:5,b:7.1,n:'IMPACT',title:'THE WALL GIVES WAY'},
 {a:7.1,b:8.3,n:'CATCH',title:'RIKA CATCHES HIM'},
 {a:8.3,b:11.5,n:'RCT',title:'REVERSE CURSED TECHNIQUE'},
 {a:11.5,b:13.2,n:'YUTA_DASH',title:'YUTA RETURNS'},
 {a:13.2,b:14.2,n:'SUKUNA_WARP',title:'THE KING MOVES'},
 {a:14.2,b:16.8,n:'CLASH',title:'CURSED ENERGY COLLIDES'},
 {a:16.8,b:17.4,n:'FIGHT',title:'RISING CONFLICT'}];
 const unlocked=()=>{try{return localStorage.getItem('jff_story_ch1_complete')==='1'||localStorage.getItem('jff_story_unlocked_ch2')==='1';}catch(e){return false;}};
 const story=()=>G.mode==='story'&&G.story&&G.story.chapter===2;
 const cine=()=>G.ch2CinematicV3&&G.ch2CinematicV3.active?G.ch2CinematicV3:null;
 const phaseAt=t=>{for(let i=phases.length-1;i>=0;i--)if(t>=phases[i].a)return i;return 0;};
 const norm=(t,i)=>clamp01((t-phases[i].a)/(phases[i].b-phases[i].a));
 const sfx=n=>{try{if(SFX&&typeof SFX[n]==='function')SFX[n]();}catch(e){}};
 const camera=(x,y,z)=>{cam.x=cam.tx=x;cam.y=cam.ty=y;cam.zoom=cam.tzoom=z;cam.cine=0;};
 const pose=(f,p,state)=>{if(!f)return;f.storyCinePose=p||null;f.state=state||'IDLE';f.stateFrame=0;f.vx=0;f.vy=0;f.walk=0;};
 function start(){
  try{if(SFX&&SFX.init){SFX.init();if(SFX.ctx&&SFX.ctx.state==='suspended')SFX.ctx.resume();}}catch(e){}
  if(!unlocked()){if(typeof showStoryArchiveNotice==='function')showStoryArchiveNotice('CHAPTER 2 IS LOCKED. COMPLETE CHAPTER 1 FIRST.\n\nWIN CHAPTER 1 TO UNLOCK RISING CONFLICT.\n\nPRESS ENTER / SPACE / ESC TO CLOSE.');return false;}
  G.ch1Cine=null;G.storyIntro=null;G.ch2Cine=null;G.ch2CinematicV3=null;G.startupCine=null;G.presenceCine=null;G.presenceFx=null;G.storyArchiveNotice=false;G.matchOverScreen=false;G.matchOver=false;G.winner=null;
  const dlg=document.getElementById('dialogue');if(dlg)dlg.classList.remove('on');
  G.story={chapter:2,p1:'yuta',act:0,phase:0,cutscene:true,clashStarted:false,clashResolved:false,ending:null,checkpoint:0,flags:{clean:true,clashWinner:null}};
  G.storyCutscene=true;try{localStorage.setItem('jff_story_ch2_started','1');}catch(e){}
  startMatch('story','yuta','sukuna','hard');G.mode='story';G.storyCutscene=true;G.story.cutscene=true;G.roundState='intro';G.roundTimer=999999;G.matchOver=false;G.winner=null;G.paused=false;
  const y=G.fighters[0],s=G.fighters[1];if(!y||!s){G.storyCutscene=false;G.story.cutscene=false;G.mode='menu';showScreen('menu');return false;}
  y.x=850;y.y=GROUND;y.vx=0;y.vy=0;y.facing=1;y.state='IDLE';y.stateFrame=0;y.animT=0;y.walk=0;
  s.x=1550;s.y=GROUND;s.vx=0;s.vy=0;s.facing=-1;s.state='IDLE';s.stateFrame=0;s.animT=0;s.walk=0;
  y.hp=y.maxHp;s.maxHp=Math.round(s.maxHp*1.18);s.hp=s.maxHp;y.rikaTimer=0;y.awakenGlow=0;s.awakenGlow=0;
  y.jffEnhanceCharge=0;y.jffEnhanceClock=0;y.jffEnhanceUsedFlash=0;y.jffUltProjectileUntil=0;
  y.storyCinePose='ready';y.storyCineRika=null;y.storyEnhanceVisual=false;s.storyCinePose='calm';
  G.ch2CinematicV3={active:true,t:0,duration:17.4,phase:-1,impactApplied:false,clashMade:false,lastSlash:-1,healStart:.34,deflectSound:false};
  camera(1200,450,.82);G.flash=1;G.flashColor='#05030a';return true;
 }
 window.startStoryChapter2=start;
 function enter(c,i){
  c.phase=i;const y=G.fighters[0],s=G.fighters[1];
  if(i===0){pose(y,'ready');pose(s,'calm');y.storyCineRika=null;camera(1200,450,.82);}
  else if(i===1){pose(y,'enhance');pose(s,'slash-ready');y.storyEnhanceVisual=true;camera(1130,440,.9);sfx('skill');G.flash=.15;G.flashColor='#c9a6ff';}
  else if(i===2){pose(y,'guard','BLOCK');pose(s,'slash');y.storyEnhanceVisual=true;camera(1110,440,.94);}
  else if(i===3){pose(y,'hurt','KNOCKBACK');pose(s,'slash-ready');y.storyEnhanceVisual=false;y.storyCineRika=null;y.x=820;y.y=GROUND-20;camera(1000,430,.94);}
  else if(i===4){pose(y,'support','KNOCKDOWN');pose(s,'calm');y.storyCineRika='support';y.rikaTimer=150;y.y=GROUND;y.x=700;camera(970,442,1.02);sfx('rika');G.flash=.22;G.flashColor='#d7bdff';try{ring(y.x,y.y-85,'#c9a6ff',82,32);}catch(e){}}
  else if(i===5){pose(y,'rct');pose(s,'calm');y.storyCineRika='support';y.rikaTimer=180;y.y=GROUND;y.x=700;camera(980,438,1.04);sfx('heal');}
  else if(i===6){pose(y,'dash','DASH');pose(s,'calm');y.storyCineRika=null;y.x=730;y.y=GROUND;camera(1120,440,.91);sfx('dash');}
  else if(i===7){pose(y,'dash','DASH');pose(s,'slash','DASH');y.x=1100;s.x=1450;y.y=GROUND;s.y=GROUND;camera(1260,440,.88);sfx('dash');}
  else if(i===8){pose(y,'clash','ATTACK');pose(s,'clash','ATTACK');y.x=1090;s.x=1285;y.y=GROUND;s.y=GROUND;camera(1190,438,1.02);}
  else if(i===9){pose(y,null);pose(s,null);y.storyCineRika=null;y.storyEnhanceVisual=false;camera(1100,430,.86);G.flash=.45;G.flashColor='#ffffff';}
  y.facing=1;s.facing=-1;
 }
 function tickFilm(){
  const c=cine();if(!c||G.mode!=='story'||!G.fighters||G.fighters.length<2)return;
  c.t+=1/60;if(c.t>=c.duration){finish();return;}
  const i=phaseAt(c.t),q=norm(c.t,i);if(i!==c.phase)enter(c,i);
  const y=G.fighters[0],s=G.fighters[1];y.animT+=1.2;s.animT+=.82;y.stateFrame++;s.stateFrame++;
  if(i===0){
   camera(1200-28*q,450-Math.sin(q*Math.PI)*8,.82+q*.035);s.storyCinePose='slash-ready';
   const k=Math.floor(c.t*60/8);if(k!==c.lastSlash){c.lastSlash=k;try{spark(mix(s.x-160,y.x+85,.35+(k%3)*.17),GROUND-rnd(45,155),3,'#ff475b',2,4,14,0);}catch(e){}}
  }else if(i===1){
   camera(1130,440,.90+Math.sin(q*Math.PI)*.025);y.x=850;s.x=1460;y.storyEnhanceVisual=true;
   if(Math.floor(c.t*60)%8===0)try{ring(y.x+24,y.y-72,'#d8c4ff',24+q*18,16);spark(y.x+45,y.y-106,2,'#f4ecff',1.8,4,12,0);}catch(e){}
  }else if(i===2){
   camera(1110,440,.94+Math.sin(q*Math.PI)*.02);y.x=850-Math.sin(q*Math.PI)*10;s.x=1435-25*q;
   if(Math.floor(c.t*60)%4===0)try{spark(y.x+70,GROUND-105,3,'#fff5ff',3.5,5,15,0);spark(y.x+70,GROUND-105,3,'#c9a6ff',3,4,14,0);}catch(e){}
   if(q>.78&&!c.deflectSound){c.deflectSound=true;sfx('block');G.flash=.22;G.flashColor='#f4eaff';}
  }else if(i===3){
   const u=ease(q);y.x=mix(820,690,u);y.y=GROUND-(q<.34?20+Math.sin(q*8)*42:0);y.storyCinePose=q<.62?'hurt':'down';y.state=q<.62?'KNOCKBACK':'KNOCKDOWN';s.x=1410;camera(1000-70*u,430,.94+u*.05);
   if(q>=.20&&!c.impactApplied){c.impactApplied=true;y.hp=Math.max(1,Math.round(y.maxHp*c.healStart));y.y=GROUND;y.state='KNOCKDOWN';y.storyCinePose='down';G.flash=.64;G.flashColor='#ffffff';G.shake=20;G.hitstop=Math.max(G.hitstop||0,5);sfx('heavy');try{burst(y.x-20,GROUND-118,26,'#d5bdff',5,11,26);ring(y.x-5,GROUND-145,'#e9dbff',105,34);}catch(e){}}
  }else if(i===4){
   y.x=700;y.y=GROUND;y.state='KNOCKDOWN';y.storyCinePose='support';y.storyCineRika='support';camera(970,442,1.02);
   if(Math.floor(c.t*60)%5===0)try{spark(y.x-25+rnd(-16,16),GROUND-92+rnd(-25,20),2,'#d9c5ff',1.1,4,15,0);}catch(e){}
  }else if(i===5){
   y.x=700;y.y=GROUND;y.state='IDLE';y.storyCinePose='rct';y.storyCineRika='support';if(c.impactApplied)y.hp=Math.min(y.maxHp,Math.round(mix(y.maxHp*c.healStart,y.maxHp,q)));
   camera(980,438,1.04+Math.sin(q*Math.PI)*.025);
   if(Math.floor(c.t*60)%3===0)try{const hx=y.x+14,hy=GROUND-75;spark(hx+rnd(-22,22),hy+rnd(-34,22),1,'#d6b5ff',.8,3,18,0);if(Math.floor(c.t*60)%12===0)ring(hx,hy,'#c9a6ff',18+q*26,18);}catch(e){}
  }else if(i===6){
   const u=Math.pow(q,.58);y.x=mix(730,1100,u);y.y=GROUND;y.state='DASH';y.storyCinePose='dash';y.storyCineRika=null;camera(1120,440,.91+q*.06);
   if(Math.floor(c.t*60)%3===0)try{if(typeof pushAfterimage==='function')pushAfterimage(y,computePose(y));spark(y.x-35,GROUND-90,2,'#d5bbff',1.8,4,13,0);}catch(e){}
  }else if(i===7){
   const u=ease(q);y.x=1100+u*18;s.x=mix(1450,1260,u);y.y=GROUND;s.y=GROUND;y.state='DASH';s.state='DASH';y.storyCinePose='dash';s.storyCinePose='slash';camera(1220,438,.91+Math.sin(q*Math.PI)*.045);
   if(Math.floor(c.t*60)%3===0)try{spark(s.x+16,GROUND-100,3,'#ff4057',2.8,5,13,0);}catch(e){}
  }else if(i===8){
   const u=ease(q);y.x=mix(1100,1170,u);s.x=mix(1260,1210,u);y.y=GROUND;s.y=GROUND;y.state='ATTACK';s.state='ATTACK';y.storyCinePose='clash';s.storyCinePose='clash';camera(1190,438,1.02+Math.sin(q*Math.PI)*.035);
   if(q>=.38&&!c.clashMade){c.clashMade=true;G.flash=.8;G.flashColor='#f5edff';G.shake=23;G.hitstop=Math.max(G.hitstop||0,8);sfx('clash');try{burst((y.x+s.x)/2,GROUND-110,34,'#eadbff',7,15,32);burst((y.x+s.x)/2,GROUND-80,24,'#ff455e',6,12,28);ring((y.x+s.x)/2,GROUND-100,'#ffffff',120,34);}catch(e){}}
  }else if(i===9){y.x=930;s.x=1270;y.y=GROUND;s.y=GROUND;y.state='IDLE';s.state='IDLE';camera(1100,430,.86);}
 }
 function finish(){
  if(!cine())return;const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];
  if(y&&s){y.x=930;s.x=1270;y.y=GROUND;s.y=GROUND;y.vx=0;y.vy=0;s.vx=0;s.vy=0;y.hp=y.maxHp;s.hp=s.maxHp;y.state='IDLE';s.state='IDLE';y.stateFrame=0;s.stateFrame=0;y.storyCinePose=null;s.storyCinePose=null;y.storyCineRika=null;y.storyEnhanceVisual=false;y.rikaTimer=0;y.jffEnhanceCharge=0;y.jffEnhanceClock=0;y.awakenGlow=0;s.awakenGlow=0;y.facing=1;s.facing=-1;}
  G.storyCutscene=false;G.story.cutscene=false;G.story.phase=1;G.story.act=0;G.roundState='fight';G.roundTimer=0;try{localStorage.setItem('jff_story_ch2_checkpoint','1');localStorage.setItem('jff_story_ch2_checkpoint_name','PROLOGUE');}catch(e){}
  camera(1100,430,.86);G.flash=.24;G.flashColor='#fff';G.ch2CinematicV3=null;
 }
 function abort(){G.ch2CinematicV3=null;G.ch2Cine=null;G.storyCutscene=false;G.story=null;G.fighters=[];G.mode='menu';G.roundState='intro';G.matchOver=false;G.matchOverScreen=false;G.paused=false;const d=document.getElementById('dialogue');if(d)d.classList.remove('on');showScreen('menu');}
 function tickEnhance(){
  if(!story()||G.story.cutscene||G.storyCutscene||G.roundState!=='fight'||G.matchOver||G.paused)return;const y=G.fighters&&G.fighters[0];if(!y||y.id!=='yuta')return;
  y.jffEnhanceClock=(y.jffEnhanceClock||0)+1;if(y.jffEnhanceClock>=180){y.jffEnhanceClock=0;if(!y.jffEnhanceCharge){y.jffEnhanceCharge=1;try{ring(y.x,y.y-72,'#c9a6ff',48,24);floatText(y.x,y.y-170,'ENHANCE READY','#e8dcff',19,48);sfx('skill');}catch(e){}}}
  y.jffEnhanceUsedFlash=Math.max(0,(y.jffEnhanceUsedFlash||0)-1);
 }
 if(typeof prevResolve==='function')window.resolveHit=function(attacker,defender,mv,hx,hy){
  const eligible=!!(story()&&!G.story.cutscene&&!G.storyCutscene&&attacker&&attacker.id==='yuta'&&attacker.jffEnhanceCharge&&mv&&Number(mv.damage)>0&&!mv.heal&&!mv.doCopy&&!mv.doJackpot&&!mv.buff&&!(attacker.move&&attacker.move.kind==='ult')&&mv.kind!=='ult'&&!(attacker.jffUltProjectileUntil>G.frame));
  const before=defender&&defender.hp,changed=eligible?Object.assign({},mv,{damage:Math.max(1,Math.round(Number(mv.damage)*1.3))}):mv;
  const result=prevResolve.apply(this,[attacker,defender,changed,hx,hy]);
  if(eligible&&defender&&defender.hp<before){attacker.jffEnhanceCharge=0;attacker.jffEnhanceUsedFlash=34;try{floatText(hx||attacker.x,hy||attacker.y-100,'ENHANCE  +30%','#e5d7ff',18,42);spark(hx||attacker.x,hy||attacker.y-80,10,'#d9c2ff',2.8,5,18,0);sfx('skill');}catch(e){}}
  return result;
 };
 if(typeof prevBeam==='function')window.startYutaBeam=function(f){
  prevBeam.apply(this,arguments);if(f&&f.move&&f.move.ultType==='beam'&&f.move.projectile){f.move.projectile.w=360;f.move.projectile.h=72;f.move.projectile.speed=26;f.move.projectile.life=54;f.move.projectile.hitstop=24;f.jffUltProjectileUntil=(G.frame||0)+120;f.rikaTimer=Math.max(f.rikaTimer||0,150);try{ring(f.x+f.facing*48,f.y-94,'#d8c0ff',52,24);burst(f.x+f.facing*55,f.y-94,18,'#c9a6ff',5,10,25);}catch(e){}}
 };
 if(typeof prevPose==='function')window.computePose=function(f){
  const P=prevPose.apply(this,arguments);if(!f||!f.storyCinePose)return P;const d=f.facing||1,arm=(key,a,b)=>{P[key]=[d>0?a:180-a,d>0?b:-b];};
  if(f.id==='sukuna'){switch(f.storyCinePose){case 'slash-ready':P.lean=8;arm('armF',-35,25);arm('armB',-8,26);P.legF=[78,8];break;case 'slash':P.lean=26;arm('armF',-14,38);arm('armB',30,24);P.legF=[60,14];P.legB=[122,-15];break;case 'clash':P.lean=22;arm('armF',-8,34);arm('armB',8,28);P.legF=[62,15];P.legB=[120,-17];break;}return P;}
  if(f.id!=='yuta')return P;
  switch(f.storyCinePose){
   case 'ready':P.lean=3;arm('armF',48,28);arm('armB',114,20);P.legF=[88,5];P.legB=[95,-5];break;
   case 'enhance':P.lean=-1;arm('armF',-72,20);arm('armB',36,30);break;
   case 'guard':P.lean=-12;arm('armF',-62,24);arm('armB',-48,22);P.hipY=-55;break;
   case 'hurt':P.lean=-40;arm('armF',154,28);arm('armB',134,20);P.legF=[58,28];P.legB=[128,-20];break;
   case 'down':P.hipY=-19;P.shY=-35;P.headY=-42;P.lean=-75;arm('armF',170,10);arm('armB',150,-10);P.legF=[20,-25];P.legB=[-8,18];break;
   case 'support':P.hipY=-24;P.shY=-46;P.headY=-54;P.lean=-44;arm('armF',28,18);arm('armB',150,20);P.legF=[40,18];P.legB=[-8,18];break;
   case 'rct':P.hipY=-47;P.shY=-80;P.headY=-100;P.lean=-12;arm('armF',34,18);arm('armB',142,18);P.legF=[68,12];P.legB=[108,-8];break;
   case 'dash':P.lean=36;arm('armF',-20,22);arm('armB',155,-12);P.legF=[55,-33];P.legB=[126,-18];P.hipY=-53;break;
   case 'clash':P.lean=20;arm('armF',-5,30);arm('armB',-18,26);P.legF=[58,18];P.legB=[124,-20];break;
  }return P;
 };
 if(typeof prevArena==='function')window.drawArenaWorld=function(){
  prevArena.apply(this,arguments);if(!cine())return;const x=555,g=GROUND,top=g-315,w=285;ctx.save();ctx.fillStyle='#111019';ctx.strokeStyle='#51465f';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(x,g+10);ctx.lineTo(x,top+34);ctx.lineTo(x+34,top);ctx.lineTo(x+w-40,top+10);ctx.lineTo(x+w,top+72);ctx.lineTo(x+w-8,g+10);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(77,61,95,.46)';for(let k=0;k<5;k++){const px=x+18+k*51,h=90+(k%3)*27;ctx.fillRect(px,g-h,17,h);ctx.strokeStyle='rgba(157,141,178,.38)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px-7,g-h);ctx.lineTo(px+24,g-h);ctx.stroke();}
  ctx.fillStyle='#09080e';ctx.fillRect(x+96,top+78,49,86);ctx.fillRect(x+181,top+110,35,64);ctx.strokeStyle='rgba(205,190,226,.34)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+4,g-22);ctx.lineTo(x+69,g-39);ctx.lineTo(x+94,g-15);ctx.moveTo(x+w-70,g-88);ctx.lineTo(x+w-101,g-54);ctx.lineTo(x+w-87,g-18);ctx.stroke();ctx.restore();
 };
 if(typeof prevFighter==='function')window.drawFighter=function(f){
  prevFighter.apply(this,arguments);if(!f||f.id!=='yuta'||!story())return;const active=(!G.story.cutscene&&!G.storyCutscene&&!!f.jffEnhanceCharge)||!!f.storyEnhanceVisual;if(!active)return;
  const pulse=.58+Math.sin((f.animT||0)*.24)*.18;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.22+pulse*.20;ctx.strokeStyle='#c9a6ff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(f.x,f.y-79,30+Math.sin(f.animT*.18)*2,53,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='rgba(238,226,255,.8)';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(f.x,f.y-79,25,47,0,0,Math.PI*2);ctx.stroke();
  const d=f.facing||1,sx=f.x+d*17,sy=f.y-103;ctx.lineCap='round';ctx.strokeStyle='rgba(170,121,255,.82)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(sx,sy+20);ctx.lineTo(sx+d*66,sy-16);ctx.stroke();ctx.strokeStyle='#f7f1ff';ctx.lineWidth=1.9;ctx.beginPath();ctx.moveTo(sx,sy+18);ctx.lineTo(sx+d*66,sy-16);ctx.stroke();ctx.strokeStyle='rgba(201,166,255,.75)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx-d*5,sy+24);ctx.lineTo(sx+d*4,sy+17);ctx.stroke();ctx.restore();
 };
 function cracks(c){
  if(!c||phases[c.phase].n!=='IMPACT')return;const sx=W/2+(700-cam.x)*cam.zoom+(G.shakeX||0),sy=H/2+(GROUND-125-cam.y)*cam.zoom+(G.shakeY||0),a=clamp01((norm(c.t,3)-.18)*2.6);
  ctx.save();ctx.globalAlpha=a;ctx.strokeStyle='rgba(235,222,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-31,sy-18);ctx.lineTo(sx-48,sy-11);ctx.lineTo(sx-69,sy-39);ctx.moveTo(sx,sy);ctx.lineTo(sx+22,sy-24);ctx.lineTo(sx+42,sy-20);ctx.lineTo(sx+63,sy-48);ctx.moveTo(sx-9,sy-3);ctx.lineTo(sx-4,sy+21);ctx.lineTo(sx-19,sy+35);ctx.moveTo(sx+17,sy-21);ctx.lineTo(sx+8,sy-44);ctx.lineTo(sx+18,sy-59);ctx.stroke();ctx.restore();
 }
 function sparkBurst(x,y,n,col,t){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=col;ctx.lineWidth=2;for(let k=0;k<n;k++){const a=k/n*Math.PI*2+t*.23,r=8+(k%3)*4;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.lineTo(x+Math.cos(a)*(r+14),y+Math.sin(a)*(r+14));ctx.stroke();}ctx.restore();}
 function overlay(){
  const c=cine();if(!c||G.mode!=='story')return;const t=c.t,i=c.phase>=0?c.phase:phaseAt(t),q=norm(t,i),n=phases[i].n;
  ctx.save();ctx.fillStyle='rgba(2,2,7,.97)';ctx.fillRect(0,0,W,42);ctx.fillRect(0,H-42,W,42);const shade=ctx.createRadialGradient(W/2,H/2,110,W/2,H/2,790);shade.addColorStop(0,'rgba(5,2,12,.02)');shade.addColorStop(1,'rgba(2,1,7,.5)');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
  if(n==='SLASHES'){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<5;k++){const z=(t*.7+k*.19)%1,x=W*(.14+((k*.21+z*.36)%.76)),y=H*(.25+(k%3)*.15);ctx.globalAlpha=(1-z)*.65;ctx.strokeStyle=k%2?'#ff596c':'#ecdeff';ctx.lineWidth=k%2?2.2:1.5;ctx.beginPath();ctx.moveTo(x-82,y-57);ctx.lineTo(x+42,y+37);ctx.stroke();}ctx.globalAlpha=.18+Math.sin(t*26)*.05;ctx.strokeStyle='#ff3c56';ctx.lineWidth=2;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(130+k*85,H*.69+k*15);ctx.lineTo(300+k*75,H*.63+k*15);ctx.stroke();}ctx.restore();}
  else if(n==='DEFLECT'){const a=clamp01((q-.22)*2.6);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.translate(W*.39,H*.60);ctx.rotate(-.20);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-36,0);ctx.lineTo(35,0);ctx.stroke();ctx.strokeStyle='#c9a6ff';ctx.lineWidth=10;ctx.globalAlpha*=.22;ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(30,0);ctx.stroke();ctx.restore();if(q>.25)sparkBurst(W*.39,H*.60,9,'#f8efff',t);}
  else if(n==='IMPACT'){const hit=clamp01((q-.18)*2.8);if(hit>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=hit*.65;const g=ctx.createRadialGradient(W*.31,H*.47,3,W*.23,H*.61,175);g.addColorStop(0,'rgba(255,255,255,.72)');g.addColorStop(.25,'rgba(208,179,255,.28)');g.addColorStop(1,'rgba(150,95,240,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();}cracks(c);if(q>.23&&q<.78){ctx.save();ctx.globalAlpha=.68*(1-q);ctx.fillStyle='#b9a5d0';for(let k=0;k<5;k++){const dx=((t*63+k*47)%100)-50,dy=((t*104+k*31)%78)-39;ctx.beginPath();ctx.moveTo(W*.31+dx,H*.51+dy);ctx.lineTo(W*.31+dx+7,H*.51+dy-4);ctx.lineTo(W*.31+dx+10,H*.51+dy+3);ctx.closePath();ctx.fill();}ctx.restore();}}
  else if(n==='CATCH'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.48+Math.sin(t*11)*.12;ctx.strokeStyle='#d7baff';ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(W*.24,H*.62,58+q*10,82+q*12,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  else if(n==='RCT'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.15+q*.22;const g=ctx.createRadialGradient(W*.25,H*.58,4,W*.25,H*.58,140);g.addColorStop(0,'rgba(255,255,255,.88)');g.addColorStop(.28,'rgba(201,166,255,.45)');g.addColorStop(1,'rgba(140,85,210,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(W*.25,H*.58,70,125,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(226,207,255,.76)';ctx.lineWidth=1.5;for(let k=0;k<4;k++){ctx.beginPath();ctx.ellipse(W*.25,H*.59,26+k*13,42+k*16,t*.25+k,0,Math.PI*2);ctx.stroke();}ctx.restore();}
  else if(n==='YUTA_DASH'){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<8;k++){ctx.globalAlpha=(1-k/9)*(.28+q*.35);ctx.strokeStyle=k%2?'#c9a6ff':'#fff';ctx.lineWidth=k===0?2.4:1;ctx.beginPath();ctx.moveTo(W*(.16+q*.12),H*(.46+k*.026));ctx.lineTo(W*(.60+q*.20),H*(.46+k*.026)-5-k);ctx.stroke();}ctx.restore();}
  else if(n==='SUKUNA_WARP'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.18+q*.44;ctx.strokeStyle='#ff455e';ctx.lineWidth=3;for(let k=0;k<6;k++){ctx.beginPath();ctx.moveTo(W*(.78-k*.035),H*(.28+k*.07));ctx.lineTo(W*(.53-k*.015),H*(.42+k*.03));ctx.stroke();}ctx.restore();}
  else if(n==='CLASH'){const a=clamp01((q-.25)*2);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*(.7+Math.sin(t*31)*.12);ctx.strokeStyle='#f6f0ff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(W*.42,H*.52);ctx.lineTo(W*.62,H*.43);ctx.stroke();ctx.strokeStyle='#c9a6ff';ctx.lineWidth=12;ctx.globalAlpha*=.25;ctx.beginPath();ctx.moveTo(W*.41,H*.53);ctx.lineTo(W*.63,H*.42);ctx.stroke();ctx.strokeStyle='#ff5369';ctx.lineWidth=4;ctx.globalAlpha=a*.9;ctx.beginPath();ctx.moveTo(W*.60,H*.54);ctx.lineTo(W*.46,H*.41);ctx.stroke();ctx.restore();if(q>.38)sparkBurst(W*.52,H*.47,10,'#efe6ff',t);}
  else if(n==='FIGHT'){const a=clamp01(q*2.8);ctx.textAlign='center';ctx.globalAlpha=a;ctx.font='900 58px Impact,"Segoe UI",sans-serif';ctx.lineWidth=7;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText('FIGHT',W/2,H/2+15);ctx.fillStyle='#fff';ctx.fillText('FIGHT',W/2,H/2+15);}
  if(n!=='FIGHT'){ctx.globalAlpha=.9;ctx.textAlign='left';ctx.font='800 11px "Segoe UI",sans-serif';ctx.fillStyle='#c9a6ff';ctx.fillText('CHAPTER 2  /  RISING CONFLICT',25,H-73);ctx.fillStyle='#f3edf9';ctx.font='900 18px "Segoe UI",sans-serif';ctx.fillText(phases[i].title,25,H-49);ctx.fillStyle='rgba(201,166,255,.78)';ctx.fillRect(25,H-39,92,2);ctx.textAlign='right';ctx.font='600 10px "Segoe UI",sans-serif';ctx.fillStyle='rgba(245,238,255,.74)';ctx.fillText('ENTER / SPACE  ·  SKIP      ESC  ·  EXIT',W-25,H-49);}
  if(n!=='FIGHT'&&t>16.55){ctx.globalAlpha=clamp01((t-16.55)*2);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);}ctx.restore();
 }
 if(typeof prevStep==='function')window.step=function(){prevStep.apply(this,arguments);if(cine())tickFilm();tickEnhance();};
 if(typeof prevRender==='function')window.render=function(){prevRender.apply(this,arguments);if(cine())overlay();if(story()&&!G.story.cutscene&&!G.storyCutscene){const y=G.fighters&&G.fighters[0];if(y&&y.jffEnhanceCharge){ctx.save();ctx.fillStyle='rgba(20,12,34,.72)';ctx.strokeStyle='rgba(201,166,255,.7)';ctx.lineWidth=1;ctx.fillRect(W-206,52,180,27);ctx.strokeRect(W-206,52,180,27);ctx.fillStyle='#eadfff';ctx.font='800 12px "Segoe UI",sans-serif';ctx.textAlign='right';ctx.fillText('ENHANCE READY  +30%',W-37,70);ctx.restore();}}};
 MenuKey=function(code){
  if(cine()&&G.mode==='story'){if(code==='Escape'){abort();return;}if(code==='Enter'||code==='Space'){finish();return;}return;}
  if(G.mode==='menu'&&screens.storySelect.classList.contains('on')&&(code==='Digit3'||code==='Numpad3')){start();return;}
  if(G.mode==='story'&&G.story&&G.story.chapter===2&&G.matchOverScreen){if(code==='KeyR'){start();return;}if(code==='Enter'||code==='Space'||code==='Escape'){G.story=null;hideResult();return;}return;}
  if(G.mode==='story'&&G.story&&G.story.chapter===2&&G.story.cutscene)return;prevMenuKey.apply(this,arguments);
 };
 window.JFF_STORY_CHAPTER2={version:3,start,get active(){return !!story();},get cinematic(){return !!cine();},get enhanceReady(){const y=G.fighters&&G.fighters[0];return !!(y&&y.jffEnhanceCharge);}};
 console.info('[JFF Story Chapter 2] Cinematic, Rika, Enhance and Tap Ultimate overhaul ready.');
})();