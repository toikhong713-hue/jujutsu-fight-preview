/* ITACHI SUSANOO FORM REBUILD v2 · PHASED TENGU GUARDIAN

   Persistent articulated Susanoo, awakening cinematic, M1 / Z / X moves.
   Lightweight Canvas 2D rig designed for low-end PCs. */
(function(){
'use strict';
if(window.__JFF_ITACHI_SUSANOO_FORM_V2__)return;
const Q=window.JFF_ITACHI_REBOOT;
if(!Q){console.warn('[Susanoo] Itachi controller missing');return;}
window.__JFF_ITACHI_SUSANOO_FORM_V2__=true;
const previousStart=window.startMove;
const previousUpdate=window.updateMove;
const previousReset=window.resetFighter;
const previousResolveHit=window.resolveHit;
const previousStep=window.step;
const previousRender=window.render;
const previousDrawFighter=window.drawFighter;
const previousPose=window.applyCharacterIdentityPose;
const stages=['jffOutsiderStage','jffItachiRebootStage','jffItachiCinematicStage'];
const savedDisplay=new Map();
const fighters=()=>typeof G!=='undefined'&&Array.isArray(G.fighters)?G.fighters:[];
const alive=f=>!!(f&&f.hp>0&&f.state!=='DEFEAT'&&f.state!=='VICTORY');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const easeOut=t=>1-Math.pow(1-clamp(t,0,1),3);
const arenaWidth=()=>typeof ARENA_W!=='undefined'?ARENA_W:(window.ARENA_W||3200);
const tick=()=>Number((Q&&Q.tick)||(typeof G!=='undefined'&&G.frame)||0);
const fx=(type,x,y,d,data)=>{if(typeof window.JFF_OUTSIDER_FX==='function')window.JFF_OUTSIDER_FX(type,x,y,d||20,data||{});};
function hideStages(hide){
  for(const id of stages){
    const el=document.getElementById(id);if(!el)continue;
    if(!savedDisplay.has(id))savedDisplay.set(id,el.style.display||'');
    el.style.display=hide?'none':savedDisplay.get(id);
  }
}
function validItachi(f){return !!(f&&f.id==='itachi'&&alive(f));}
function currentOwnerForCode(code){
  const fs=fighters();
  if(code==='Digit1'||code==='KeyZ'||code==='KeyX')return fs[0]&&fs[0].id==='itachi'&&!fs[0].ai&&fs[0].itachiSusanooActive?fs[0]:null;
  if(code==='Numpad1'||code==='NumpadDivide')return fs[1]&&fs[1].id==='itachi'&&!fs[1].ai&&fs[1].itachiSusanooActive?fs[1]:null;
  if(code==='NumpadSubtract')return fs[1]&&fs[1].id==='itachi'&&!fs[1].ai&&fs[1].itachiSusanooActive?fs[1]:null;
  return null;
}
function beginAttack(f,key){
  if(!validItachi(f)||!f.itachiSusanooActive||Q.cinema||f.move||!['IDLE','WALK','LAND','ATTACK'].includes(f.state))return false;
  const o=f.opp;
  if(alive(o)&&Math.abs(o.y-f.y)<190)f.facing=o.x>=f.x?1:-1;
  f.itachiSusanooAction=key;f.itachiSusanooMarks={};f.itachiPoseKey=key;
  f.moveKey=key;f.moveFrame=0;f.state='ATTACK';f.stateFrame=0;
  f.move={name:key==='sus_m1'?'Totsuka Blade: Susanoo Combo':(key==='sus_z'?'Yata Mirror Counter':'Totsuka Sealing Thrust'),kind:'melee',startup:5,active:24,recovery:20,damage:0,hitbox:null,cost:0,cd:0};
  f.vx*=.15;
  if(key==='sus_z'){f.itachiYataUntil=tick()+36;f.itachiYataCounterUsed=false;f.itachiYataLastReflectAt=-999;f.itachiYataLastReflectTarget=null;}
  if(typeof SFX!=='undefined'&&SFX.ui)SFX.ui();
  return true;
}
function activate(f,key){return beginAttack(f,key==='z'?'sus_z':(key==='x'?'sus_x':'sus_m1'));}
window.JFF_ITACHI_SUSANOO_FORM={ready:true,activate:activate,version:7,idlePoses:{itachi:'Guardian Stance',edo:'Edo War Stance'},summonPhases:['Skeletal','Muscular Chakra','Armored Tengu'],setPhase:(f,n)=>{if(!validItachi(f)||!f.itachiSusanooActive)return false;f.itachiSusanooPhase=clamp(Math.round(Number(n)||3),1,3);return true;}};
function hit(f,frame,damage,range,opts){
  const o=f&&f.opp,d=f.facing||1;if(!alive(o))return false;
  const cfg=opts||{};
  // A dedicated world-space rectangle follows Susanoo's massive weapon arc, independently of Itachi's native melee range.
  const forward=cfg.forward===undefined?Math.max(105,range*.78):cfg.forward;
  const width=cfg.width===undefined?Math.max(220,range*.9):cfg.width;
  const top=cfg.top===undefined?302:cfg.top;
  const height=cfg.height===undefined?252:cfg.height;
  const cx=f.x+d*forward,box={x:cx-width/2,y:f.y-top,w:width,h:height};
  const enemyBox={x:o.x-38,y:o.y-176,w:76,h:188};
  const overlaps=box.x<enemyBox.x+enemyBox.w&&box.x+box.w>enemyBox.x&&box.y<enemyBox.y+enemyBox.h&&box.y+box.h>enemyBox.y;
  if(!overlaps)return false;
  const mv={damage:damage,hitstun:cfg.hitstun||20,blockstun:cfg.blockstun||12,kbx:cfg.kbx===undefined?d*5:cfg.kbx,kby:cfg.kby===undefined?-1.5:cfg.kby,hitstop:cfg.hitstop||7,meter:cfg.meter===undefined?4:cfg.meter,armorBreak:!!cfg.armorBreak,kind:cfg.kind||'melee',type:cfg.type||'melee',susanoo:true};
  const res=typeof window.resolveHit==='function'?window.resolveHit(f,o,mv,cx,f.y-top+height*.42):'whiff';
  if(res&&res!=='whiff'){fx('slash',cx,f.y-top+height*.42,20);if(cfg.seal)fx('seal',o.x,o.y-100,46);if(typeof shake==='function')shake(cfg.shake||4);return true;}
  return false;
}
function finishAttack(f){
  f.move=null;f.moveKey=null;f.moveFrame=0;f.state=alive(f)?'IDLE':'DEFEAT';f.stateFrame=0;f.itachiPoseKey='';
  f.itachiSusanooAction='';f.vx*=.25;
}
function updateSusanooMove(f){
  if(!f.move)return;
  const k=f.moveKey,n=(f.moveFrame||0)+1,d=f.facing||1,o=f.opp;
  f.moveFrame=n;f.itachiPoseKey=k;f.itachiSusanooAction=k;
  if(k==='sus_m1'){
    // Four distinct sword contacts, each using Susanoo's own long-range weapon hitbox.
    if(n===8)hit(f,n,5,260,{forward:156,width:280,top:312,height:265,hitstun:12,kbx:d*3,hitstop:4,shake:2});
    if(n===22)hit(f,n,5,288,{forward:194,width:310,top:322,height:275,hitstun:13,kbx:d*4,hitstop:4,shake:2});
    if(n===36)hit(f,n,6,306,{forward:216,width:334,top:315,height:270,hitstun:14,kbx:d*4,hitstop:5,shake:3});
    if(n===50)hit(f,n,7,334,{forward:250,width:370,top:310,height:265,hitstun:18,kbx:d*6,kby:-2,hitstop:6,armorBreak:true,shake:4});
    if(n>=68)finishAttack(f);
  }else if(k==='sus_z'){
    if(n===2){f.itachiYataUntil=tick()+35;f.itachiYataCounterUsed=false;fx('reflect',f.x+d*150,f.y-185,40);fx('shock',f.x+d*125,f.y-108,24);}
    // Holding Yata Mirror guards throughout the planted-shield portion of the animation.
    if(n===35)f.itachiYataUntil=0;
    if(n>=51){f.itachiYataUntil=0;finishAttack(f);}
  }else if(k==='sus_x'){
    // 1-19: pull Totsuka from the sake gourd; 20-31: raise; 32-43: diagonal slash;
    // 44-62: impact wave, dust and lingering light; 63-82: heavy recovery.
    if(n===19)fx('magatama',f.x+d*165,f.y-235,24);
    if(n===32){fx('slash',f.x+d*155,f.y-190,32);if(typeof flash==='function')flash(.11,'#ff8b51');}
    if(n===42){
      hit(f,n,17,450,{forward:252,width:520,top:344,height:304,hitstun:25,kbx:d*8,kby:-2,hitstop:8,armorBreak:true,seal:true,shake:8});
      fx('explosion',f.x+d*255,f.y-176,34);fx('shock',f.x+d*220,f.y-74,36);
      if(typeof flash==='function')flash(.2,'#ff9a58');if(typeof shake==='function')shake(13);if(typeof camPunch==='function')camPunch(.18);
    }
    if(n===47||n===54||n===61){fx('slash',f.x+d*(155+n),f.y-95,16);fx('shock',f.x+d*230,f.y-18,16);}
    if(n>=82)finishAttack(f);
  }else{if(typeof previousUpdate==='function')previousUpdate.apply(this,arguments);}
}
if(typeof previousResolveHit==='function')window.resolveHit=function(attacker,defender,mv,hx,hy){
  // Yata Mirror is a real front-facing counter: negate the incoming hit, punish its source, and return before normal damage.
  if(defender&&defender.id==='itachi'&&defender.itachiSusanooActive&&defender.moveKey==='sus_z'&&
     defender.itachiYataUntil>tick()&&alive(attacker)&&attacker!==defender){
    const dx=attacker.x-defender.x,comingFromFront=defender.facing===(Math.sign(dx)||1);
    if(comingFromFront){
      // Every front-facing contact is blocked. Counter damage is throttled, but the barrier remains up.
      const freshTarget=defender.itachiYataLastReflectTarget!==attacker;
      const ready=freshTarget||tick()-(defender.itachiYataLastReflectAt||-999)>=12;
      if(ready){
        defender.itachiYataCounterUsed=true;defender.itachiYataLastReflectAt=tick();defender.itachiYataLastReflectTarget=attacker;
        attacker.hp=Math.max(0,attacker.hp-9);attacker.hitFlash=10;
        attacker.vx=(Math.sign(dx)||defender.facing)*6.2;attacker.vy=-1.8;
        attacker.move=null;attacker.moveKey=null;attacker.moveFrame=0;attacker.hitstun=Math.max(attacker.hitstun||0,18);
        attacker.immobilize=Math.max(attacker.immobilize||0,8);attacker.state=attacker.hp>0?'HITSTUN':'DEFEAT';attacker.stateFrame=0;
        defender.meter=Math.min(defender.maxMeter||100,(defender.meter||0)+5);
        fx('reflect',defender.x+defender.facing*150,defender.y-185,34);fx('shock',attacker.x,attacker.y-90,20);
        if(typeof SFX!=='undefined'&&SFX.parry)SFX.parry();
        if(typeof shake==='function')shake(5);if(typeof camPunch==='function')camPunch(.1);
        if(typeof flash==='function')flash(.2,'#ffe0a7');
      }else{fx('reflect',defender.x+defender.facing*145,defender.y-170,10);}
      return 'parry';
    }
  }
  return previousResolveHit.apply(this,arguments);
};
if(typeof previousStart==='function')window.startMove=function(f,key,isBF){
  if(f&&f.id==='itachi'&&f.itachiSusanooActive&&key==='ult')return false;
  const ok=previousStart.apply(this,arguments);
  if(ok&&f&&f.id==='itachi'&&key==='ult')f.itachiSusanooPending=true;
  return ok;
};
if(typeof previousUpdate==='function')window.updateMove=function(f){
  if(f&&f.id==='itachi'&&f.itachiSusanooActive&&/^sus_(m1|z|x)$/.test(f.moveKey||'')){updateSusanooMove(f);return;}
  return previousUpdate.apply(this,arguments);
};
if(typeof previousPose==='function')window.applyCharacterIdentityPose=function(P,f){
  previousPose.apply(this,arguments);
  if(!P||!f||f.id!=='itachi'||!f.itachiSusanooActive)return;
  const k=f.moveKey||'',n=f.moveFrame||0;
  if(k==='sus_m1'){
    if(n<8){P.lean=-10;P.armF=[-38,-48];P.armB=[48,-55];}
    else if(n<18){P.lean=12;P.armF=[35,34];P.armB=[58,-24];}
    else if(n<31){P.lean=-13;P.armF=[-32,-44];P.armB=[26,42];}
    else{P.lean=18;P.armF=[55,25];P.armB=[40,-32];}
  }else if(k==='sus_z'){P.lean=-8;P.armF=[22,-55];P.armB=[138,18];}
  else if(k==='sus_x'){P.lean=22;P.armF=[10,-12];P.armB=[8,22];}
};
function strokePath(points,width,color){
  const c=ctx;c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;c.lineWidth=width;c.beginPath();
  c.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);c.stroke();
}
function polygon(points,fill,stroke,lineWidth){
  ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth||2;ctx.lineJoin='round';ctx.stroke();}
}
function armorLimb(a,b,r,inner){
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='#19070e';ctx.lineWidth=r*1.34;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
  ctx.strokeStyle='#682033';ctx.lineWidth=r;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
  ctx.strokeStyle=inner||'#d96a4c';ctx.lineWidth=Math.max(3,r*.42);ctx.beginPath();ctx.moveTo(a[0]-1,a[1]-1);ctx.lineTo(b[0]-1,b[1]-1);ctx.stroke();
  ctx.fillStyle='#a93645';ctx.beginPath();ctx.arc(a[0],a[1],r*.67,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(b[0],b[1],r*.67,0,Math.PI*2);ctx.fill();
}
function drawShield(x,y,scale,glow){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  const g=ctx.createLinearGradient(-34,-38,36,42);g.addColorStop(0,'#fff0c2');g.addColorStop(.22,'#8ad8e8');g.addColorStop(.45,'#e5c6ff');g.addColorStop(.7,'#ac594f');g.addColorStop(1,'#54182d');
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,185,128,'+(.16+glow*.26)+')';ctx.beginPath();ctx.ellipse(0,0,48,61,0,0,Math.PI*2);ctx.fill();ctx.restore();
  polygon([[0,-68],[45,-49],[53,8],[27,56],[0,72],[-27,56],[-53,8],[-45,-49]],g,'#ffe3ab',4);
  polygon([[0,-49],[30,-33],[36,8],[18,37],[0,48],[-18,37],[-36,8],[-30,-33]],'rgba(57,13,37,.32)','rgba(255,223,174,.85)',2.5);
  ctx.strokeStyle='#622b3d';ctx.lineWidth=3.6;ctx.beginPath();ctx.ellipse(0,0,32,45,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='rgba(255,249,221,.96)';ctx.lineWidth=2.3;ctx.beginPath();ctx.arc(0,0,21,.2,Math.PI*1.9);ctx.stroke();
  ctx.fillStyle='#f8e6b0';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(Math.cos(i*1.256)*12,Math.sin(i*1.256)*19,3.7,0,Math.PI*2);ctx.fill();}
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55+glow*.28;ctx.strokeStyle='#fff6d9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-22,-44);ctx.lineTo(0,-61);ctx.lineTo(24,-43);ctx.stroke();ctx.restore();
  ctx.restore();
}
function drawSakeGourd(x,y,scale,phase){
  ctx.save();ctx.translate(x,y);ctx.rotate(-.22+Math.sin((phase||0)*.035)*.025);ctx.scale(scale,scale);
  const g=ctx.createLinearGradient(-28,-30,30,35);g.addColorStop(0,'#ffcc86');g.addColorStop(.19,'#c65a3f');g.addColorStop(.46,'#85293a');g.addColorStop(.76,'#4b1429');g.addColorStop(1,'#240b19');
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,130,78,.19)';ctx.beginPath();ctx.ellipse(0,7,34,42,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle='#210a15';ctx.beginPath();ctx.ellipse(0,8,26,34,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=g;ctx.strokeStyle='#f2a56b';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(-6,-19);ctx.quadraticCurveTo(-31,-15,-28,9);ctx.quadraticCurveTo(-24,32,-6,37);ctx.quadraticCurveTo(4,42,15,31);ctx.quadraticCurveTo(29,17,25,3);ctx.quadraticCurveTo(22,-14,7,-19);ctx.lineTo(6,-31);ctx.lineTo(-6,-31);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#451326';ctx.fillRect(-8,-38,16,12);ctx.fillStyle='#eab078';ctx.fillRect(-10,-41,20,5);ctx.fillRect(-25,2,50,4);ctx.fillRect(-20,18,40,3);
  ctx.strokeStyle='rgba(255,224,169,.75)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-14,-9);ctx.quadraticCurveTo(-23,7,-11,23);ctx.moveTo(8,-9);ctx.quadraticCurveTo(18,8,9,23);ctx.stroke();
  // A hilt and guard peeking out of the gourd neck show that Totsuka is stored inside.
  ctx.strokeStyle='#1a1018';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,-37);ctx.lineTo(0,-52);ctx.stroke();ctx.strokeStyle='#f0c17d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,-45);ctx.lineTo(9,-45);ctx.stroke();
  ctx.restore();
}
function drawTotsuka(x,y,angle,scale,power){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='#210812';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,24);ctx.stroke();
  ctx.strokeStyle='#f1c078';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo(0,23);ctx.stroke();
  ctx.strokeStyle='#4b1026';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-7,18);ctx.lineTo(7,10);ctx.moveTo(-7,12);ctx.lineTo(7,4);ctx.stroke();
  const blade=ctx.createLinearGradient(-7,-5,7,-108);blade.addColorStop(0,'#b94c42');blade.addColorStop(.24,'#ffbc77');blade.addColorStop(.52,'#fff3cf');blade.addColorStop(.78,'#e86a52');blade.addColorStop(1,'#ffddb0');
  polygon([[-7,0],[-10,-87],[-5,-126],[0,-158],[6,-126],[11,-87],[7,0]],blade,'#6b202b',2.5);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.48+power*.38;ctx.strokeStyle='#fff0c6';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,-146);ctx.stroke();ctx.restore();
  ctx.restore();
}
const SUSANOO_FRENZY_POSES=[
 {f:0,torso:-.30,l1:[-91,-206],l2:[-57,-246],r1:[74,-233],r2:[121,-275],s:-.68,kl:[-42,-54],al:[-49,-29],kr:[37,-56],ar:[43,-30]},
 {f:12,torso:.30,l1:[-75,-193],l2:[-34,-167],r1:[98,-190],r2:[145,-143],s:1.04,kl:[-42,-54],al:[-50,-29],kr:[50,-47],ar:[56,-25]},
 {f:27,torso:-.24,l1:[-79,-194],l2:[-102,-163],r1:[101,-191],r2:[171,-183],s:1.54,kl:[-48,-54],al:[-57,-27],kr:[38,-57],ar:[45,-30]},
 {f:42,torso:.43,l1:[-72,-202],l2:[-42,-177],r1:[90,-214],r2:[132,-253],s:-.91,kl:[-45,-53],al:[-54,-29],kr:[44,-51],ar:[52,-27]},
 {f:58,torso:.35,l1:[-46,-207],l2:[14,-197],r1:[116,-188],r2:[169,-178],s:1.52,kl:[-35,-54],al:[-42,-28],kr:[51,-47],ar:[58,-25]},
 {f:76,torso:-.09,l1:[-78,-181],l2:[-42,-144],r1:[98,-184],r2:[131,-148],s:1.05,kl:[-30,-56],al:[-34,-27],kr:[35,-57],ar:[39,-27]},
 {f:96,torso:-.12,l1:[-82,-181],l2:[-50,-143],r1:[87,-180],r2:[119,-154],s:.64,kl:[-31,-56],al:[-34,-27],kr:[33,-56],ar:[37,-27]}
];
function drawSummonPhase(frame,stage,edo,fighter,rigScale){
   // Animated in-engine articulated silhouette. These are live rig phases, not cutscene stills.
   const t=frame||0,pulse=.72+.28*Math.sin(t*.22);
   const owner=fighter||null,state=owner&&owner.state||'IDLE';
   const isWalking=!!(owner&&/^(WALK|RUN|DASH)$/.test(state));
   const hasSkill=!!(owner&&owner.itachiPhaseSkillKey);
   const isActing=!!(owner&&owner.move&&!isWalking)||hasSkill;
   const poseWeight=isActing?.16:1;
   const gait=t*.32,step=isWalking?Math.sin(gait):0;
   const liftL=isWalking?Math.max(0,Math.cos(gait))*5.5:0;
   const liftR=isWalking?Math.max(0,Math.cos(gait+Math.PI))*5.5:0;
   const idlePulse=Math.sin(t*(stage===0?.071:.058))*poseWeight;
   const breath=Math.sin(t*.078)*(stage===0?2.4:1.8)*poseWeight;
   const sway=Math.sin(t*(stage===0?.045:.031))*(stage===0?3.2:2.2)*poseWeight;
   const armFlex=Math.sin(t*(isWalking?.36:.05))*(isWalking?4.4:(stage===0?3:4))*poseWeight;
   const hitReact=!!(owner&&(state==='HITSTUN'||(owner.hitstun||0)>0));
   const reactWeight=hitReact?Math.min(1,Math.max(.35,(owner.hitstun||8)/8)):0;
   const torsoLean=(stage===0?Math.sin(t*.027)*.028:Math.sin(t*.022)*.018)*poseWeight
     -(isWalking?step*(stage===0?.035:.028):0)-reactWeight*(stage===0?.11:.085);
   const rootBob=isWalking?Math.abs(Math.sin(gait))*3.8:Math.sin(t*.075)*(stage===0?1.6:1.25)*poseWeight;
   const hot=edo?'#c85c83':'#ff4a18',edge=edo?'#e2b8d3':'#ffad69',
         deep=edo?'#260e29':'#500d19',mid=edo?'#681a43':'#a92127',
         core=edo?'#e3caff':'#ffff99';
   const bone=(x1,y1,x2,y2,w,outer,inner)=>{
     ctx.lineCap='round';ctx.lineJoin='round';
     ctx.strokeStyle=deep;ctx.lineWidth=w+5;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
     ctx.strokeStyle=outer;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
     ctx.strokeStyle=inner||edge;ctx.lineWidth=Math.max(1.5,w*.24);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
   };
   const joint=(x,y,r)=>{
     ctx.save();ctx.globalCompositeOperation='lighter';
     ctx.fillStyle=edo?'rgba(209,176,255,.3)':'rgba(255,255,130,.35)';
     ctx.beginPath();ctx.arc(x,y,r*2.1,0,Math.PI*2);ctx.fill();
     ctx.fillStyle=core;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();
   };
   const aura=ctx.createRadialGradient(0,-157,8,0,-157,225);
   aura.addColorStop(0,edo?'rgba(131,25,80,.3)':'rgba(255,71,17,.25)');
   aura.addColorStop(.62,edo?'rgba(62,16,64,.19)':'rgba(206,35,16,.15)');
   aura.addColorStop(1,'rgba(20,4,15,0)');
   ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(0,-158,220,236,0,0,Math.PI*2);ctx.fill();
   // Four spectral wing spars stretch out behind the frame as the skeleton coalesces.
   ctx.save();ctx.globalAlpha*=stage===0?.9:.45;
   for(const side of [-1,1]){
     ctx.save();ctx.scale(side,1);bone(34,-192,92,-253,8,hot,edge);bone(92,-253,151,-294,6,hot,edge);bone(65,-212,154,-231,5,hot,edge);
     for(let i=0;i<4;i++){const y=-247-i*15,x=90+i*13;bone(x,y,x+31,y-26,3,mid,edge);}
     ctx.restore();
   }
   ctx.restore();
   // Shared lower-body skeleton remains fully articulated while the upper form evolves.
   const kneeLX=-43+sway*.45+(isWalking?step*5:0),kneeLY=-58-liftL;
   const kneeRX=42-sway*.45-(isWalking?step*5:0),kneeRY=-58-liftR;
   const ankleLX=-50+sway*.5+(isWalking?step*8:0),ankleLY=-30-liftL*.9;
   const ankleRX=49-sway*.5-(isWalking?step*8:0),ankleRY=-30-liftR*.9;
   bone(-24,-93,kneeLX,kneeLY,13,hot,edge);bone(kneeLX,kneeLY,ankleLX,ankleLY,10,hot,edge);
   bone(24,-93,kneeRX,kneeRY,13,hot,edge);bone(kneeRX,kneeRY,ankleRX,ankleRY,10,hot,edge);
   bone(ankleLX,ankleLY,ankleLX+28,ankleLY+2,12,deep,edge);bone(ankleRX,ankleRY,ankleRX+28,ankleRY+2,12,deep,edge);
   joint(kneeLX,kneeLY,5);joint(kneeRX,kneeRY,5);
   // Move the upper body around the spine pivot while the legs keep their own gait.
   // The live combat state reduces idle sway during attacks and emphasizes recoil on hit.
   ctx.save();
   ctx.translate(isWalking?-step*1.8:sway*.12,-rootBob);
   ctx.translate(0,-120);ctx.rotate(torsoLean);ctx.translate(0,120);
   if(stage===0){
     // Phase 1: ribs, spine, shoulder sockets, long Tengu skull and twin swept-back horns.
     bone(0,-103,0,-206,13,hot,core);
     for(let i=0;i<6;i++){
       const y=-191+i*14+breath*.28,w=36-i*2+Math.abs(idlePulse)*.35;
       ctx.strokeStyle=deep;ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(-w,y);ctx.quadraticCurveTo(-12,y+9,0,y+7);ctx.quadraticCurveTo(12,y+9,w,y);ctx.stroke();
       ctx.strokeStyle=hot;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-w,y);ctx.quadraticCurveTo(-12,y+9,0,y+7);ctx.quadraticCurveTo(12,y+9,w,y);ctx.stroke();
       ctx.strokeStyle=core;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-w+2,y-1);ctx.quadraticCurveTo(0,y+12,w-2,y-1);ctx.stroke();
     }
     const p1ElbowY=-205+armFlex*.22,p1WristY=-178+armFlex;
     bone(-43,-201,-82-armFlex*.28,p1ElbowY,13,hot,core);
     bone(-82-armFlex*.28,p1ElbowY,-113-armFlex*.42,p1WristY,10,hot,edge);
     bone(43,-201,82+armFlex*.28,p1ElbowY,13,hot,core);
     bone(82+armFlex*.28,p1ElbowY,113+armFlex*.42,p1WristY,10,hot,edge);
     bone(-8,-205,-12,-230,11,hot,edge);bone(8,-205,12,-230,11,hot,edge);
     // Tengu mask silhouette with sharply glowing eyes and a long beak.
     polygon([[-27,-239],[-37,-258],[-20,-252],[-14,-275],[-2,-259],[11,-277],[22,-254],[37,-261],[28,-238],[18,-223],[-18,-223]],deep,edge,3);
     polygon([[-16,-239],[0,-248],[16,-239],[7,-226],[2,-205],[-2,-205],[-7,-226]],mid,hot,2);
     ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=core;ctx.globalAlpha*=pulse;
     ctx.beginPath();ctx.ellipse(-10,-242,5,2.4,-.18,0,Math.PI*2);ctx.ellipse(10,-242,5,2.4,.18,0,Math.PI*2);ctx.fill();ctx.restore();
     bone(-25,-244,-53,-260,6,hot,edge);bone(25,-244,53,-260,6,hot,edge);
     ctx.strokeStyle=edge;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-13,-218);ctx.lineTo(-8,-211);ctx.lineTo(-3,-218);ctx.lineTo(2,-211);ctx.lineTo(7,-218);ctx.lineTo(12,-211);ctx.stroke();
     [[-43,-201],[-82,-205],[43,-201],[82,-205],[-12,-230],[12,-230],[0,-104]].forEach(p=>joint(p[0],p[1],4));
   }else{
     // Phase 2: chakra musculature takes shape; face stays Tengu-like, with a long beak and flared cheek-tusks.
     const flesh=ctx.createLinearGradient(-70,-220,65,-93);
     flesh.addColorStop(0,edo?'rgba(128,28,78,.92)':'rgba(226,64,30,.86)');
     flesh.addColorStop(.52,edo?'rgba(76,17,61,.94)':'rgba(139,20,29,.92)');
     flesh.addColorStop(1,deep);
     polygon([[-41,-207],[-68,-188],[-54,-145],[-25,-119],[0,-109],[25,-119],[54,-145],[68,-188],[41,-207],[20,-197],[0,-185],[-20,-197]],flesh,edge,3.5);
     ctx.strokeStyle=hot;ctx.lineWidth=7;ctx.lineCap='round';
     for(let i=0;i<4;i++){const y=-185+i*17+breath*.34;ctx.beginPath();ctx.moveTo(-32+i*2,y);ctx.quadraticCurveTo(-10,y+13,0,y+9+breath*.22);ctx.quadraticCurveTo(10,y+13,32-i*2,y);ctx.stroke();}
     const p2ElbowY=-197+armFlex*.7,p2WristY=-163+armFlex*1.25;
     bone(-53,-192,-99-armFlex*.4,p2ElbowY,16,mid,edge);
     bone(-99-armFlex*.4,p2ElbowY,-134-armFlex*.65,p2WristY,12,mid,edge);
     bone(53,-192,99+armFlex*.4,p2ElbowY,16,mid,edge);
     bone(99+armFlex*.4,p2ElbowY,134+armFlex*.65,p2WristY,12,mid,edge);
     bone(-14,-208,-18,-229,15,mid,edge);bone(14,-208,18,-229,15,mid,edge);
     polygon([[-33,-244],[-27,-264],[-12,-253],[0,-274],[12,-253],[28,-264],[34,-244],[19,-224],[-19,-224]],deep,edge,3);
     polygon([[-17,-241],[0,-251],[17,-241],[9,-226],[4,-206],[0,-200],[-4,-206],[-9,-226]],mid,hot,2.5);
     ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=pulse;ctx.fillStyle=core;
     ctx.beginPath();ctx.ellipse(-10,-243,4.6,2.2,0,0,Math.PI*2);ctx.ellipse(10,-243,4.6,2.2,0,0,Math.PI*2);ctx.fill();ctx.restore();
     // The chakra cloak blows out in separate animated tongues, not a flat ring.
     ctx.save();ctx.globalAlpha*=.58;ctx.lineWidth=5;ctx.lineCap='round';ctx.strokeStyle=hot;
     for(let side of [-1,1])for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(side*(42+j*4),-127-j*9);ctx.bezierCurveTo(side*(91+j*9),-153-j*9,side*(110+j*11),-220-j*12,side*(76+j*18),-246-j*10);ctx.stroke();}
     ctx.restore();
     [[-99,-197],[-134,-163],[99,-197],[134,-163],[-18,-229],[18,-229]].forEach(p=>joint(p[0],p[1],3.4));
   }
   // Finger curl makes both skeletal hands and muscular gauntlets feel alive.
   const handX=stage===0?113:134,handY=stage===0?-178+armFlex:-163+armFlex*1.25;
   const handCurl=Math.sin(t*.063)*2.8*poseWeight;
   for(const side of [-1,1]){
     const hx=side*handX,hy=handY;
     bone(hx,hy,hx+side*(8+handCurl*.35),hy-7+handCurl,4.2,hot,edge);
     bone(hx+side*(8+handCurl*.35),hy-7+handCurl,hx+side*(13+handCurl*.6),hy-14-handCurl,3.2,mid,edge);
     bone(hx,hy,hx+side*5,hy+5+handCurl*.4,3.1,hot,edge);
   }
   ctx.restore();
   if(reactWeight>.1){
     ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=Math.min(.54,reactWeight*.46);
     ctx.strokeStyle=edo?'#e4b5ff':'#ffd59a';ctx.lineWidth=2.6;
     ctx.beginPath();ctx.ellipse(0,-164,72+reactWeight*23,49+reactWeight*16,torsoLean,0,Math.PI*2);ctx.stroke();
     ctx.beginPath();ctx.moveTo(-58,-204);ctx.lineTo(-72,-216);ctx.lineTo(-63,-228);
     ctx.moveTo(58,-204);ctx.lineTo(72,-216);ctx.lineTo(63,-228);ctx.stroke();ctx.restore();
   }
   drawPhaseCombatMotion(fighter,stage,edo,t,rigScale);

   // Edo ash or living-form embers are deterministic and allocation-free.
   if(edo){
     ctx.save();ctx.globalAlpha*=.66;ctx.strokeStyle='#160c20';ctx.lineWidth=2;
     for(let i=0;i<4;i++){const x=Math.sin(t*.12+i*2.6)*(64+i*23),y=-90-((t*1.9+i*47)%210);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+6,y-8);ctx.lineTo(x+1,y-15);ctx.lineTo(x+12,y-22);ctx.stroke();}
     ctx.fillStyle='#8e8999';
     for(let i=0;i<6;i++){const x=Math.sin(t*.055+i*4.2)*(48+i*19),y=-35-((t*1.55+i*31)%220);ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.03+i)*.8);ctx.beginPath();ctx.moveTo(-3,-5);ctx.lineTo(4,-3);ctx.lineTo(3,5);ctx.lineTo(-2,4);ctx.closePath();ctx.fill();ctx.restore();}
     ctx.restore();
   }else{
     ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ff9a48';
     for(let i=0;i<7;i++){const x=Math.sin(t*.1+i*2.1)*(36+i*15),y=-42-((t*2+i*29)%228);ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(x,y,1.1+(i%3)*.5,0,Math.PI*2);ctx.fill();}
     ctx.restore();
   }
 }
 
function drawPhaseCombatMotion(f,stage,edo,t,rigScale){
 const id=f&&f.itachiPhaseSkillKey;
 if(!id)return;
 const n=f.moveFrame||0,wide=stage===1,sc=rigScale||2,d=f.facing||1;
 const hot=edo?'#c47be8':'#ff5928',edge=edo?'#ead0ff':'#ffe1a0',dark=edo?'#210b29':'#490b17';
 const smoothLocal=q=>{q=clamp(q,0,1);return q*q*(3-2*q);};
 const path=(pts,w,color,alpha)=>{
  ctx.save();ctx.globalAlpha*=alpha===undefined?1:alpha;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle=dark;ctx.lineWidth=w+8;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();
  ctx.strokeStyle=color||hot;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();
  ctx.strokeStyle=edge;ctx.lineWidth=Math.max(1.4,w*.16);ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0]-1,pts[i][1]-1);ctx.stroke();ctx.restore();
 };
 const glow=(x,y,r,color,alpha)=>{
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=alpha===undefined?.8:alpha;ctx.fillStyle=color||hot;
  ctx.beginPath();ctx.arc(x,y,r*2.2,0,Math.PI*2);ctx.fill();ctx.globalAlpha*=.65;ctx.beginPath();ctx.arc(x,y,r*.8,0,Math.PI*2);ctx.fill();ctx.restore();
 };
 const ring=(x,y,rx,ry,color,width,alpha,rotate)=>{
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=alpha===undefined?1:alpha;ctx.strokeStyle=color||edge;ctx.lineWidth=width||3;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rotate||0,0,Math.PI*2);ctx.stroke();ctx.restore();
 };
 let shoulder=wide?[54,-191]:[43,-198],elbow=[wide?92:76,wide?-166:-173],hand=[wide?130:106,wide?-143:-147];
 const idleJiggle=Math.sin(t*.18)*2;
 if(id==='life_p1_claw'){
  if(n<13){const q=smoothLocal(n/13);elbow=[lerp(65,94,q),lerp(-182,-209,q)];hand=[lerp(72,104,q),lerp(-220,-249,q)];}
  else if(n<32){const q=smoothLocal((n-13)/19);elbow=[lerp(94,153,q),lerp(-209,-145,q)];hand=[lerp(104,224,q),lerp(-249,-63,q)];}
  else{const q=smoothLocal((n-32)/33);elbow=[lerp(153,79,q),lerp(-145,-171,q)];hand=[lerp(224,106,q),lerp(-63,-147,q)];}
 }else if(id==='life_p1_fist'){
  if(n<19){const q=smoothLocal(n/19);elbow=[lerp(84,61,q),lerp(-173,-159,q)];hand=[lerp(112,58,q),lerp(-143,-130,q)];}
  else if(n<38){const q=smoothLocal((n-19)/19);elbow=[lerp(61,151,q),lerp(-159,-142,q)];hand=[lerp(58,240,q),lerp(-130,-125,q)];}
  else{const q=smoothLocal((n-38)/40);elbow=[lerp(151,76,q),lerp(-142,-173,q)];hand=[lerp(240,106,q),lerp(-125,-147,q)];}
 }else if(id==='edo_p1_yasaka'){
  if(n<20){const q=smoothLocal(n/20);elbow=[lerp(81,88,q),lerp(-174,-206,q)];hand=[lerp(112,136,q),lerp(-151,-237,q)];}
  else if(n<31){const q=smoothLocal((n-20)/11);elbow=[lerp(88,145,q),lerp(-206,-164,q)];hand=[lerp(136,202,q),lerp(-237,-152,q)];}
  else{const q=smoothLocal((n-31)/41);elbow=[lerp(145,75,q),lerp(-164,-172,q)];hand=[lerp(202,105,q),lerp(-152,-147,q)];}
 }else if(id==='edo_p1_grasp'){
  const q=smoothLocal(n<22?n/22:(n<49?1:1-(n-49)/35));elbow=[lerp(76,134,q),lerp(-178,-144,q)];hand=[lerp(105,190,q),lerp(-154,-91,q)];
 }else if(id==='life_p2_yata'||id==='edo_p2_counter'){
  const q=smoothLocal(n<13?n/13:(n<73?1:Math.max(0,1-(n-73)/30)));elbow=[lerp(72,110,q),lerp(-177,-194,q)];hand=[lerp(103,150,q),lerp(-151,-175,q)];
 }else if(id==='life_p2_totsuka'){
  if(n<24){const q=smoothLocal(n/24);elbow=[lerp(78,100,q),lerp(-175,-225,q)];hand=[lerp(105,145,q),lerp(-151,-255,q)];}
  else if(n<45){const q=smoothLocal((n-24)/21);elbow=[lerp(100,171,q),lerp(-225,-155,q)];hand=[lerp(145,258,q),lerp(-255,-114,q)];}
  else{const q=smoothLocal((n-45)/75);elbow=[lerp(171,78,q),lerp(-155,-175,q)];hand=[lerp(258,105,q),lerp(-114,-151,q)];}
 }else if(id==='edo_p2_amaterasu'){
  if(n<30){const q=smoothLocal(n/30);elbow=[lerp(77,98,q),lerp(-176,-231,q)];hand=[lerp(104,145,q),lerp(-151,-276,q)];}
  else if(n<49){const q=smoothLocal((n-30)/19);elbow=[lerp(98,155,q),lerp(-231,-137,q)];hand=[lerp(145,223,q),lerp(-276,-55,q)];}
  else{const q=smoothLocal((n-49)/83);elbow=[lerp(155,77,q),lerp(-137,-175,q)];hand=[lerp(223,105,q),lerp(-55,-151,q)];}
 }
 // The attacking arm is a jointed, scaled rig, not a flat slash pasted over the character.
 ctx.save();ctx.globalCompositeOperation='lighter';
 path([shoulder,elbow],wide?22:12,hot,.96);glow(elbow[0],elbow[1],wide?14:9,edge,.85);
 path([elbow,hand],wide?19:10,hot,.98);glow(hand[0],hand[1],wide?16:10,edge,.95);
 if(!wide){
  for(let i=0;i<5;i++){const spread=(i-2)*6,fan=(i-2)*8;path([[hand[0],hand[1]+spread*.3],[hand[0]+27+Math.abs(i-2)*2,hand[1]+fan-12]],3.2,hot,.95);}
 }else{
  ctx.fillStyle=edo?'#572354':'#9e2734';ctx.strokeStyle=edge;ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(hand[0]+6,hand[1],17,22,-.28,0,Math.PI*2);ctx.fill();ctx.stroke();
 }
 ctx.restore();
 if(id==='life_p1_claw'){
  const q=n<13?0:(n<34?1:Math.max(0,1-(n-34)/28));
  if(q>0){
   for(let i=0;i<3;i++){
    const shift=(i-1)*22;
    path([[40+shift,-267],[98+shift,-216],[151+shift,-151],[191+shift,-65]],44-i*7,'rgba(255,70,24,.88)',q*.85);
    path([[43+shift,-262],[100+shift,-214],[151+shift,-150],[188+shift,-70]],4.5,'rgba(255,230,165,.95)',q);
   }
   if(n>=17&&n<=47){
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=q;
    for(let i=0;i<3;i++){const xx=136+i*30;ctx.strokeStyle=i===1?'#ffdb8a':'#ff5425';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(xx,-22);ctx.lineTo(xx+20,-7);ctx.stroke();ctx.strokeStyle='#260811';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xx,-20);ctx.lineTo(xx+20,-5);ctx.stroke();}
    ctx.restore();
   }
  }
 }else if(id==='life_p1_fist'){
  const charge=1-smoothLocal(n/20);
  if(n<21){glow(hand[0],hand[1],18+charge*17,'#ffbc5b',.75);ring(hand[0],hand[1],22+(n%4)*4,18+(n%3)*3,'#ff8c37',4,.82);}
  if(n>=24&&n<=43){
   const q=smoothLocal((n-24)/7),fade=n<34?1:Math.max(0,1-(n-34)/9);
   ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
   ring(hand[0]+35,hand[1]+3,25+q*165,19+q*82,'#ffb95c',7,.95);
   ring(hand[0]+35,hand[1]+3,40+q*145,30+q*75,'#ff5b29',3,.85);
   for(let i=0;i<13;i++){const a=i*Math.PI*2/13+q*.22;path([[hand[0]+20+Math.cos(a)*30,hand[1]+Math.sin(a)*22],[hand[0]+20+Math.cos(a)*(110+q*60),hand[1]+Math.sin(a)*(65+q*40)]],3,i%3?'#ff8b40':'#ffe3a5',.7);}
   ctx.restore();
  }
 }else if(id==='life_p2_yata'||id==='edo_p2_counter'){
  const sx=hand[0]+48,sy=hand[1]-1,active=id==='edo_p2_counter'?(n<13):(n<75);
  ctx.save();ctx.translate(sx,sy);ctx.rotate(Math.sin(t*.03)*.035);
  ctx.globalCompositeOperation='lighter';
  ctx.fillStyle=edo?'rgba(89,48,128,.87)':'rgba(236,166,62,.83)';ctx.strokeStyle=edge;ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(0,-65);ctx.quadraticCurveTo(50,-51,51,-12);ctx.quadraticCurveTo(44,37,0,61);ctx.quadraticCurveTo(-44,37,-51,-12);ctx.quadraticCurveTo(-50,-51,0,-65);ctx.closePath();ctx.fill();ctx.stroke();
  for(let i=0;i<12;i++){const a=i*Math.PI/6+t*.035;ctx.save();ctx.rotate(a);ctx.strokeStyle=i%2?edge:(edo?'#c78aff':'#fff1ae');ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-4,-45);ctx.lineTo(4,-37);ctx.lineTo(-2,-29);ctx.stroke();ctx.restore();}
  ring(0,-2,63+n%4,76+n%5,edge,2.5,.8);
  ring(0,-2,72+n%7,84+n%6,edo?'#c28cff':'#ffb94e',1.7,.55);
  ctx.restore();
  if(active&&n%8<4)ring(sx,sy,83+n%5,100+n%4,edge,2,.55);
  if(id==='edo_p2_counter'&&n>13&&n<48){
   const fade=Math.max(0,1-(n-13)/35);for(let i=0;i<8;i++){const a=t*.13+i*2.4,x=sx+Math.cos(a)*(35+i%3*14),y=sy+Math.sin(a)*(28+i%4*12);path([[x,y],[x+Math.cos(a+1)*22,y-11]],2.5,'#8a758f',fade);}
  }
 }else if(id==='life_p2_totsuka'){
  const q=smoothLocal((n-23)/23),fade=n<24?.15:(n<61?1:Math.max(0,1-(n-61)/21));
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
  // Broad 180-degree liquid-flame sweep: three nested ribbons make the strike read at arena scale.
  ctx.strokeStyle='rgba(73,9,20,.98)';ctx.lineWidth=69;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-28,-181);ctx.bezierCurveTo(42,-292,160,-269,231,-157);ctx.bezierCurveTo(290,-67,260,-26,222,-20);ctx.stroke();
  ctx.strokeStyle='rgba(255,81,36,.96)';ctx.lineWidth=43;ctx.beginPath();ctx.moveTo(-28,-181);ctx.bezierCurveTo(42,-292,160,-269,231,-157);ctx.bezierCurveTo(290,-67,260,-26,222,-20);ctx.stroke();
  ctx.strokeStyle='rgba(255,203,125,.98)';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(-25,-181);ctx.bezierCurveTo(44,-282,163,-259,227,-157);ctx.bezierCurveTo(279,-73,253,-37,220,-22);ctx.stroke();
  ctx.strokeStyle='rgba(255,250,219,.98)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-19,-180);ctx.bezierCurveTo(45,-276,166,-255,223,-157);ctx.bezierCurveTo(270,-80,250,-42,219,-25);ctx.stroke();
  for(let i=0;i<16;i++){const z=i/15,x=20+z*220,y=-252+z*213+Math.sin(t*.25+i)*9;glow(x,y,4+i%4,'#ffd38a',.75);}
  ctx.restore();
 }else if(id==='edo_p1_yasaka'){
  // Three large rotating beads connected by a visible chakra cord before launch.
  for(let i=0;i<3;i++){const a=t*.23+i*Math.PI*2/3,x=hand[0]+35+Math.cos(a)*18,y=hand[1]-13+Math.sin(a)*13;glow(x,y,10,'#bd84f1',1);ring(x,y,10,10,'#e9d8ff',3,.95);path([[hand[0]+21,hand[1]-13],[x,y]],3,'#9d69d1',.8);}
 }else if(id==='edo_p1_grasp'){
  const target=f.opp;
  if(target&&alive(target)){
   const tx=40+(target.x-f.x)*d/sc,gy=(target.y-f.y)/sc-34;
   const rise=smoothLocal((n-15)/18)*74,fade=n<18?.4:(n<52?1:Math.max(0,1-(n-52)/31));
   if(n>=12&&n<=83){
    ctx.save();ctx.globalAlpha*=fade;
    // Ground fracture and ash paper spiral surround the exact target point.
    ctx.strokeStyle='#64213f';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(tx-65,gy+4);ctx.lineTo(tx-24,gy-1);ctx.lineTo(tx-43,gy-24);ctx.moveTo(tx+60,gy+5);ctx.lineTo(tx+25,gy-3);ctx.lineTo(tx+42,gy-28);ctx.moveTo(tx-22,gy+8);ctx.lineTo(tx-9,gy+20);ctx.moveTo(tx+21,gy+6);ctx.lineTo(tx+8,gy+21);ctx.stroke();
    ctx.strokeStyle='rgba(203,109,193,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx-48,gy+2);ctx.lineTo(tx-22,gy-2);ctx.lineTo(tx-34,gy-17);ctx.moveTo(tx+45,gy+2);ctx.lineTo(tx+21,gy-2);ctx.lineTo(tx+35,gy-20);ctx.stroke();
    const palmY=gy+11-rise;
    ctx.fillStyle=dark;ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(tx,palmY,27,32,-.1,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=edo?'#68274f':'#ad303a';ctx.beginPath();ctx.ellipse(tx,palmY,19,23,-.1,0,Math.PI*2);ctx.fill();
    for(let i=0;i<5;i++){
      const spread=(i-2)*12,fx=tx+spread,fy=palmY-18-Math.abs(i-2)*4;
      path([[tx+(i-2)*4,palmY-12],[fx,fy-29],[fx+d*2,fy-47]],10,'#9a4267',fade);
      path([[tx+(i-2)*4,palmY-12],[fx,fy-29],[fx+d*2,fy-47]],3,edge,fade);
      glow(fx,fy-47,4,'#c49bd7',.7*fade);
    }
    for(let i=0;i<12;i++){const a=t*.1+i*2.4,x=tx+Math.cos(a)*(38+i%3*13),y=palmY-20+Math.sin(a)*(28+i%4*9);path([[x,y],[x+Math.cos(a+1)*9,y-13]],2.4,i%3?'#827887':'#c4a4d8',.75*fade);}
    ctx.restore();
   }
  }
 }else if(id==='edo_p2_amaterasu'){
  const q=smoothLocal((n-28)/22),fade=n<21?.35:(n<60?1:Math.max(0,1-(n-60)/28));
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
  // Amaterasu blade: black-violet core wrapped in restless violet fire tongues.
  ctx.strokeStyle='rgba(5,3,13,.99)';ctx.lineWidth=72;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hand[0]-3,hand[1]-28);ctx.lineTo(hand[0]+18,hand[1]+195*q);ctx.stroke();
  ctx.strokeStyle='rgba(58,18,80,.98)';ctx.lineWidth=43;ctx.beginPath();ctx.moveTo(hand[0]-3,hand[1]-28);ctx.lineTo(hand[0]+18,hand[1]+195*q);ctx.stroke();
  ctx.strokeStyle='rgba(177,105,243,.9)';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(hand[0]-3,hand[1]-28);ctx.lineTo(hand[0]+18,hand[1]+195*q);ctx.stroke();
  for(let i=0;i<11;i++){const u=i/11,x=hand[0]+Math.sin(t*.18+i*2.7)*10+u*18,y=hand[1]-32+u*205*q;path([[x,y],[x+Math.sin(i*3+t*.12)*13,y-14-i%4*4]],3.4,i%2?'#8d59cf':'#24142e',.95*fade);}
  if(n>=33&&n<=61){const surge=smoothLocal((n-33)/8);ring(hand[0]+26,hand[1]+163*surge,27+surge*110,8+surge*22,'#9f6be9',5,.8);}
  ctx.restore();
 }
 // Screen-independent local dust trails make each pose readable even on low-end rendering.
 if(edo&&(n%3===0)&&(id==='edo_p1_grasp'||id==='edo_p1_yasaka'||id==='edo_p2_counter'||id==='edo_p2_amaterasu')){
  ctx.save();ctx.globalAlpha*=.55;ctx.fillStyle='#a49aab';
  for(let i=0;i<8;i++){const x=Math.sin(t*.17+i*2.2)*(25+i*16),y=-65-((t*2.4+i*29)%230);ctx.save();ctx.translate(x,y);ctx.rotate(t*.04+i);ctx.beginPath();ctx.moveTo(-4,-7);ctx.lineTo(4,-4);ctx.lineTo(3,5);ctx.lineTo(-2,7);ctx.closePath();ctx.fill();ctx.restore();}
  ctx.restore();
 }
}

function drawSusanooRig(f,x,baseY,scale,phase,alpha,sceneMode){
  if(typeof ctx==='undefined')return;
  const t=phase||0,k=sceneMode==='awakening'?'ult':(f&&f.moveKey||''),rawFrame=f&&f.moveFrame||0;
  const prog=alpha===undefined?1:clamp(alpha,0,1);
  const awakening=sceneMode==='awakening',cinematicSlash=sceneMode==='cinematic-slash',cinematicSlam=sceneMode==='cinematic-slam',
        cinematicCharge=sceneMode==='cinematic-charge',cinematicFinal=sceneMode==='cinematic-final',cinematicOutro=sceneMode==='cinematic-outro';
  const segmentStart=awakening?0:(cinematicSlash?72:(cinematicSlam?168:(cinematicCharge?270:(cinematicFinal?348:(cinematicOutro?390:0)))));
  const n=(awakening||cinematicSlash||cinematicSlam||cinematicCharge||cinematicFinal||cinematicOutro)?t-segmentStart:rawFrame;
  // Restore the rig's world anchor and facing transform before any body parts are rendered.
  ctx.save();ctx.globalAlpha*=prog;ctx.translate(x,baseY);ctx.scale((f&&(f.facing||1)<0?-1:1)*scale,scale);
  const bob=Math.sin(t*.075)*2,breath=Math.sin(t*.055)*2.4;
  // Persistent battle-form idle is its own pose, not the default attack-rest pose.
  const battleIdle=sceneMode==='battle'&&!(f&&f.move)&&!(k==='sus_m1'||k==='sus_z'||k==='sus_x');
  const edoForm=!!(f&&f.itachiEdo),edoIdle=edoForm,idleBreath=Math.sin(t*.035),idleSway=Math.sin(t*.022);
  const shellDark=edoForm?'#211020':'#19070e',shellMid=edoForm?'#561b40':'#682033',shellHot=edoForm?'#a33b68':'#d96a4c',shellEdge=edoForm?'#e0a6d0':'#ff9c70',coreGlow=edoForm?'#e0c6ff':'#ffff99';
  // The selected phase owns idle and attack visuals; Phase 1/2 skills never fall through to the armored rig.
   if(sceneMode==='battle'){const selectedPhase=clamp(Math.round(Number(f&&f.itachiSusanooPhase)||3),1,3);if(selectedPhase<3){drawSummonPhase(t,selectedPhase-1,edoForm,f,scale);ctx.restore();return;}}
  // Summon cinematic evolves automatically through skeletal, muscular, and armored forms.
  if(awakening){const summonStage=edoForm?(n<19?0:(n<42?1:2)):(n<48?0:(n<108?1:2));if(summonStage<2){drawSummonPhase(n,summonStage,edoForm);ctx.restore();return;}}
  const heavy=cinematicSlash||k==='sus_m1',guard=k==='sus_z',thrust=cinematicSlam||k==='sus_x',
        charge=cinematicCharge||k==='sus_charge',finalStrike=cinematicFinal||k==='sus_final';
  // Shadow and chakra silhouette behind the fighter.
  const aura=ctx.createRadialGradient(0,-155,18,0,-155,194);aura.addColorStop(0,edoForm?'rgba(173,57,111,.24)':'rgba(255,119,77,.20)');aura.addColorStop(.5,edoForm?'rgba(92,24,83,.17)':'rgba(197,37,60,.11)');aura.addColorStop(1,'rgba(24,5,24,0)');
  ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(0,-155,178,205,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,126,89,.18)';ctx.lineWidth=2.2;
  for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(0,-112,72+i*16,31+i*9,0,Math.PI*(.1+i*.13)+t*.002,Math.PI*(1.05+i*.17)+t*.002);ctx.stroke();}
  ctx.restore();
  // Giant skeletal chakra wings flare during the Titan summon.
  if(awakening){
    const wingOpen=smooth(clamp(n/44,0,1));ctx.save();ctx.globalAlpha*=.24+.54*wingOpen;ctx.lineJoin='round';
    for(const side of [-1,1]){
      ctx.save();ctx.scale(side,1);ctx.fillStyle=edoForm?'#2a102b':'#481327';ctx.strokeStyle=edoForm?'#d8b7e9':'#ffb17d';ctx.lineWidth=edoForm?2.3:3;
      ctx.beginPath();ctx.moveTo(38,-190);ctx.bezierCurveTo(80,-261,155,-310,246,-325);ctx.bezierCurveTo(226,-287,211,-254,196,-222);ctx.bezierCurveTo(160,-238,133,-224,108,-194);ctx.closePath();ctx.fill();ctx.stroke();
      for(let i=0;i<6;i++){const q=i/5,ex=82+q*148,ey=-224-q*82;ctx.beginPath();ctx.moveTo(72+q*100,-201-q*28);ctx.quadraticCurveTo(ex+17,ey-14,ex+19,ey+22);ctx.lineTo(ex-8,ey+8);ctx.closePath();ctx.fillStyle=i%2?'#7b2037':'#c64b4b';ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(82+q*95,-198-q*29);ctx.lineTo(ex+5,ey+5);ctx.strokeStyle='rgba(255,221,176,.8)';ctx.lineWidth=1.3;ctx.stroke();}
      ctx.restore();
    }
    ctx.restore();
  }
  // Pose-driven leg rig: weight shifts through knees, ankles, planted toes and a hero landing.
  let kneeL=[-31,-57],ankleL=[-31,-42],kneeR=[31,-57],ankleR=[31,-42],footLX=-33,footRX=33,footAngleL=-.08,footAngleR=.08;
  const walkLift=(f&&f.state==='WALK')?Math.sin(t*.24)*7:0;
  if(cinematicSlash){
    const keys=SUSANOO_FRENZY_POSES,fr=clamp(n,0,96);let ii=0;while(ii<keys.length-2&&fr>keys[ii+1].f)ii++;
    const a=keys[ii],b=keys[ii+1],q=smooth((fr-a.f)/(b.f-a.f));
    kneeL=[lerp(a.kl[0],b.kl[0],q),lerp(a.kl[1],b.kl[1],q)];ankleL=[lerp(a.al[0],b.al[0],q),lerp(a.al[1],b.al[1],q)];
    kneeR=[lerp(a.kr[0],b.kr[0],q),lerp(a.kr[1],b.kr[1],q)];ankleR=[lerp(a.ar[0],b.ar[0],q),lerp(a.ar[1],b.ar[1],q)];
    footLX=ankleL[0]+7;footRX=ankleR[0]+7;footAngleL=-.1;footAngleR=.11;
  }else if(cinematicSlam){
    const landed=smooth((n-39)/12);kneeL=[lerp(-35,-42,landed),lerp(-58,-43,landed)];ankleL=[lerp(-43,-65,landed),lerp(-32,-20,landed)];
    kneeR=[lerp(35,18,landed),lerp(-58,-49,landed)];ankleR=[lerp(43,14,landed),lerp(-31,-17,landed)];
    footLX=ankleL[0]+8;footRX=ankleR[0]+5;footAngleL=-.08;footAngleR=.28*landed;
  }else if(cinematicCharge){
    kneeL=[-30,-64];ankleL=[-41,-43];kneeR=[31,-66];ankleR=[44,-42];footLX=-41;footRX=48;footAngleL=-.12;footAngleR=.12;
  }else if(cinematicFinal){
    const q=smooth(n/19);kneeL=[lerp(-30,-43,q),lerp(-57,-49,q)];ankleL=[lerp(-34,-60,q),lerp(-26,-22,q)];
    kneeR=[lerp(31,24,q),lerp(-57,-45,q)];ankleR=[lerp(37,19,q),lerp(-26,-18,q)];footLX=ankleL[0]+7;footRX=ankleR[0]+6;footAngleL=-.08;footAngleR=.22*q;
  }else if(awakening){
    const wide=smooth(clamp(n/48,0,1));
    kneeL=[lerp(-29,-46,wide),-55];ankleL=[lerp(-30,-67,wide),-27];
    kneeR=[lerp(29,46,wide),-55];ankleR=[lerp(30,67,wide),-27];
    footLX=ankleL[0]-2;footRX=ankleR[0]+2;footAngleL=-.12;footAngleR=.12;
  }else if(battleIdle){
    // Both variants stay planted behind Itachi; Edo uses a heavier, wider guard stance.
    const sway=Math.sin(t*.024);
    if(edoIdle){
      kneeL=[-43+sway*1.2,-58];ankleL=[-50+sway,-36];kneeR=[41-sway*1.1,-55];ankleR=[48-sway,-34];
      footLX=ankleL[0]-2;footRX=ankleR[0]+4;footAngleL=-.11;footAngleR=.16;
    }else{
      kneeL=[-37+sway,-57];ankleL=[-41+sway*.7,-39];kneeR=[35-sway,-56];ankleR=[40-sway*.7,-39];
      footLX=ankleL[0]-2;footRX=ankleR[0]+2;footAngleL=-.08;footAngleR=.09;
    }
  }else{
    kneeL=[-31+walkLift*.25,-58];ankleL=[-31+walkLift*.35,-42];kneeR=[31-walkLift*.25,-58];ankleR=[31-walkLift*.35,-42];
    footLX=-33;footRX=33;footAngleL=-.08;footAngleR=.08;
  }
  armorLimb([-25,-91],kneeL,15,edoForm?'#c2618b':'#ff9a65');armorLimb(kneeL,ankleL,13,edoForm?'#ad477b':'#ff8c61');armorLimb([25,-91],kneeR,15,edoForm?'#95406e':'#d85349');armorLimb(kneeR,ankleR,13,edoForm?'#95406e':'#d85349');
  polygon([[kneeL[0]-13,kneeL[1]-4],[kneeL[0]+12,kneeL[1]-6],[ankleL[0]+15,ankleL[1]+1],[ankleL[0]-13,ankleL[1]+1]],edoForm?'#451632':'#5a162b',shellDark,edoForm?4:3);
  polygon([[kneeR[0]-12,kneeR[1]-6],[kneeR[0]+13,kneeR[1]-4],[ankleR[0]+13,ankleR[1]+1],[ankleR[0]-15,ankleR[1]+1]],edoForm?'#5b1a42':'#7a2035',shellDark,edoForm?4:3);
  ctx.fillStyle='#211018';ctx.beginPath();ctx.ellipse(footLX,ankleL[1]+8,23,8,footAngleL,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(footRX,ankleR[1]+8,23,8,footAngleR,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ed8562';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(footLX-14,ankleL[1]+8);ctx.lineTo(footLX+14,ankleL[1]+8);ctx.moveTo(footRX-14,ankleR[1]+8);ctx.lineTo(footRX+14,ankleR[1]+8);ctx.stroke();
  let torsoAngle=0,armL1=[-91,-187],armL2=[-112,-145],armR1=[91,-185],armR2=[110,-143],swordAngle=.16;
  if(awakening){
    const q=smooth(clamp(n/48,0,1));torsoAngle=-.16+Math.sin(n*.055)*.018;
    armL1=[lerp(-48,-122,q),lerp(-206,-184,q)];armL2=[lerp(-31,-184,q),lerp(-232,-166,q)];
    armR1=[lerp(48,122,q),lerp(-206,-184,q)];armR2=[lerp(31,184,q),lerp(-232,-166,q)];swordAngle=-.15;
  }else if(cinematicSlash){
    let i=0;while(i<SUSANOO_FRENZY_POSES.length-2&&n>SUSANOO_FRENZY_POSES[i+1].f)i++;
    const a=SUSANOO_FRENZY_POSES[i],b=SUSANOO_FRENZY_POSES[i+1],q=smooth((n-a.f)/(b.f-a.f)),mix=(x,y)=>[lerp(x[0],y[0],q),lerp(x[1],y[1],q)];
    torsoAngle=lerp(a.torso,b.torso,q);armL1=mix(a.l1,b.l1);armL2=mix(a.l2,b.l2);armR1=mix(a.r1,b.r1);armR2=mix(a.r2,b.r2);swordAngle=lerp(a.s,b.s,q);
  }else if(cinematicSlam){
    const wind=smooth(clamp(n/43,0,1)),landed=smooth((n-43)/16);
    const r1=[72,-232],r2=[57,-326],l1=[-72,-232],l2=[-58,-323],lr1=[97,-203],lr2=[116,-166],ll1=[-86,-202],ll2=[-38,-183];
    armR1=[lerp(r1[0],lr1[0],wind),lerp(r1[1],lr1[1],wind)];armR2=[lerp(r2[0],lr2[0],wind),lerp(r2[1],lr2[1],wind)];
    armL1=[lerp(l1[0],ll1[0],wind),lerp(l1[1],ll1[1],wind)];armL2=[lerp(l2[0],ll2[0],wind),lerp(l2[1],ll2[1],wind)];
    torsoAngle=lerp(-.04,.35,landed);swordAngle=lerp(-.05,Math.PI,wind);
  }else if(cinematicCharge){
    const q=smooth(clamp(n/22,0,1));torsoAngle=-.07;
    armR1=[lerp(86,72,q),lerp(-204,-232,q)];armR2=[lerp(118,57,q),lerp(-184,-326,q)];
    armL1=[lerp(-83,-72,q),lerp(-204,-232,q)];armL2=[lerp(-39,-58,q),lerp(-179,-323,q)];swordAngle=lerp(1.15,.02,q);
  }else if(cinematicFinal){
    const q=smooth(clamp(n/19,0,1)),follow=smooth(clamp((n-19)/22,0,1));
    torsoAngle=lerp(-.07,.52,q)-follow*.16;armR1=[lerp(72,104,q),lerp(-232,-184,q)];armR2=[lerp(57,149,q),lerp(-326,-169,q)];
    armL1=[lerp(-72,-107,q),lerp(-232,-181,q)];armL2=[lerp(-58,-129,q),lerp(-323,-148,q)];swordAngle=lerp(.02,Math.PI,q);
    if(n>19){armR1[1]-=follow*5;armR2[1]-=follow*12;armL1[1]-=follow*4;armL2[1]-=follow*7;}
  }else if(cinematicOutro){
    const q=smooth(clamp(n/14,0,1)),wave=smooth(clamp((n-11)/12,0,1));torsoAngle=lerp(.24,-.025,q);
    armR1=[lerp(104,82,q),lerp(-183,-174,q)];armR2=[lerp(132,114,q),lerp(-143,-139,q)];
    armL1=[lerp(-108,-126,wave),lerp(-182,-166,wave)];armL2=[lerp(-136,-180,wave),lerp(-141,-150,wave)];swordAngle=lerp(1.25,.76,q);
  }else if(battleIdle){
    // Regular Itachi's guardian is composed and protective; Edo's is wider and more threatening.
    if(edoIdle){
      torsoAngle=-.075+idleSway*.014;
      // Primary pair stays close to the torso; the rear pair holds Yata and Totsuka independently.
      armL1=[-73,-188+idleBreath*1.7];armL2=[-91,-145+idleBreath*2.2];
      armR1=[74,-188+idleBreath*1.7];armR2=[93,-145+idleBreath*2.2];swordAngle=2.78;
    }else{
      torsoAngle=-.035+idleSway*.012;
      armL1=[-68,-182+idleBreath*1.2];armL2=[-81,-140+idleBreath*2];
      armR1=[68,-182+idleBreath*1.2];armR2=[82,-140+idleBreath*2];swordAngle=2.92;
    }
  }else if(heavy){
    if(n<12){torsoAngle=-.24;armR1=[70,-228];armR2=[40,-246];armL1=[-84,-183];armL2=[-107,-142];swordAngle=-.48;}
    else if(n<28){torsoAngle=.28;armR1=[97,-184];armR2=[143,-170];armL1=[-84,-183];armL2=[-107,-142];swordAngle=1.15;}
    else if(n<45){torsoAngle=-.18;armR1=[75,-183];armR2=[120,-224];armL1=[-84,-183];armL2=[-107,-142];swordAngle=.55;}
    else{torsoAngle=.14;armR1=[108,-174];armR2=[151,-163];armL1=[-84,-183];armL2=[-107,-142];swordAngle=1.35;}
  }else if(guard){armR1=[100,-198];armR2=[128,-158];armL1=[-76,-184];armL2=[-41,-145];}
  else if(thrust){
    armL1=[-88,-183];armL2=[-111,-145];
    if(n<19){const q=smooth(n/19);armR1=[lerp(91,58,q),lerp(-185,-224,q)];armR2=[lerp(119,34,q),lerp(-183,-248,q)];swordAngle=lerp(-.18,-.82,q);}
    else if(n<32){const q=smooth((n-19)/13);armR1=[lerp(58,85,q),lerp(-224,-251,q)];armR2=[lerp(34,67,q),lerp(-248,-282,q)];swordAngle=lerp(-.82,-.98,q);}
    else if(n<44){const q=smooth((n-32)/12);armR1=[lerp(85,112,q),lerp(-251,-185,q)];armR2=[lerp(67,151,q),lerp(-282,-160,q)];swordAngle=lerp(-.98,1.14,q);}
    else if(n<63){const q=smooth((n-44)/19);armR1=[lerp(112,82,q),lerp(-185,-201,q)];armR2=[lerp(151,114,q),lerp(-160,-171,q)];swordAngle=lerp(1.14,.55,q);}
    else{const q=smooth((n-63)/19);armR1=[lerp(82,91,q),lerp(-201,-185,q)];armR2=[lerp(114,119,q),lerp(-171,-183,q)];swordAngle=lerp(.55,-.18,q);}
  }else if(charge){
    const q=smooth(clamp(n/78,0,1));armR1=[lerp(91,72,q),lerp(-185,-232,q)];armR2=[lerp(119,57,q),lerp(-183,-326,q)];
    armL1=[lerp(-91,-72,q),lerp(-187,-232,q)];armL2=[lerp(-112,-58,q),lerp(-145,-323,q)];swordAngle=lerp(.16,-.05,q);
  }else if(finalStrike){
    if(n<14){armR1=[72,-232];armR2=[57,-326];armL1=[-72,-232];armL2=[-58,-323];swordAngle=-.05;}
    else if(n<42){const q=smooth((n-14)/28);armR1=[lerp(72,112,q),lerp(-232,-185,q)];armR2=[lerp(57,151,q),lerp(-326,-160,q)];armL1=[lerp(-72,-108,q),lerp(-232,-184,q)];armL2=[lerp(-58,-135,q),lerp(-323,-141,q)];swordAngle=lerp(-.05,2.55,q);}
    else{armR1=[108,-174];armR2=[151,-163];armL1=[-108,-183];armL2=[-135,-140];swordAngle=1.35;}
  }
  // Apply a curving upper body independently of the planted feet.
  ctx.save();ctx.translate(0,-91);ctx.rotate(torsoAngle);ctx.translate(0,91);
  // The fourth arm grows from behind the left shoulder. It is the guardian's Yata-support arm;
  // the existing secondary right arm carries the sake gourd and Totsuka, separate from the two combat arms.
  armorLimb([-43,-197],[-91,-194],edoForm?13:12,edoForm?'#b45a91':'#ff9a70');
  armorLimb([-91,-194],[-135,-158],edoForm?10:9,edoForm?'#d1a1d5':'#ffb180');
  ctx.strokeStyle=edoForm?'#dfbedf':'#ffc58d';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-135,-158);ctx.lineTo(-146,-150);ctx.lineTo(-140,-164);ctx.moveTo(-134,-157);ctx.lineTo(-127,-149);ctx.stroke();
  // Articulated hips, ribbed breastplate, and layered abdominal armor.
  polygon([[-48,-128],[-37,-102],[-25,-91],[0,-86],[25,-91],[37,-102],[48,-128],[31,-148],[-31,-148]],edoForm?'#2d112b':'#421225',shellDark,edoForm?5:4);
  polygon([[-50,-204],[-76,-218],[-65,-177],[-47,-158],[-36,-119],[-17,-101],[0,-97],[17,-101],[36,-119],[47,-158],[65,-177],[76,-218],[50,-204],[34,-213],[-34,-213]],edoForm?'#451539':'#651b30',shellDark,edoForm?6:5);
  const chest=ctx.createLinearGradient(-50,-208,45,-104);chest.addColorStop(0,edoForm?'#bc739d':'#ffb181');chest.addColorStop(.24,edoForm?'#943b70':'#c9514f');chest.addColorStop(.55,edoForm?'#59163f':'#7c2035');chest.addColorStop(1,edoForm?'#1c0a22':'#330c1c');
  polygon([[-43,-205],[-26,-216],[0,-211],[26,-216],[43,-205],[31,-169],[17,-139],[0,-126],[-17,-139],[-31,-169]],chest,edoForm?'#e0a6d0':'#ffad80',edoForm?4:3);
  // Rib plates are individual curved strokes, not a flat breastplate decal.
  ctx.lineCap='round';ctx.lineJoin='round';
  for(let i=0;i<4;i++){
    const yy=-192+i*13;
    ctx.strokeStyle=edoForm?(i%2?'#44132f':'#aa4d7e'):(i%2?'#6e2034':'#f08b68');ctx.lineWidth=edoForm?7.2:6.5;
    ctx.beginPath();ctx.moveTo(-36+i*2,yy);ctx.quadraticCurveTo(-12,yy+14,0,yy+10);ctx.quadraticCurveTo(15,yy+14,36-i*2,yy);ctx.stroke();
    ctx.strokeStyle='rgba(255,218,173,.62)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-31+i*2,yy-2);ctx.quadraticCurveTo(-12,yy+10,0,yy+7);ctx.quadraticCurveTo(15,yy+10,31-i*2,yy-2);ctx.stroke();
  }
  for(let i=0;i<3;i++)polygon([[-21,-119+i*8],[-5,-124+i*8],[0,-117+i*8],[-5,-108+i*8],[-20,-110+i*8]],edoForm?'#7d2859':'#9c3040',edoForm?'#dcaedc':'#f08d66',1.2);
  // Inner chakra core: hot yellow for living Itachi, pale sealed light for Edo Tensei.
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=.8+.12*Math.sin(t*.09);
  ctx.fillStyle=edoForm?'rgba(201,151,255,.19)':'rgba(255,255,118,.24)';ctx.beginPath();ctx.ellipse(0,-164,24,32,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=edoForm?'rgba(232,211,255,.82)':'rgba(255,255,153,.9)';ctx.beginPath();ctx.moveTo(0,-184);ctx.lineTo(11,-164);ctx.lineTo(0,-145);ctx.lineTo(-11,-164);ctx.closePath();ctx.fill();ctx.restore();
  // Neck, shoulders and independent arms.
  armorLimb([-20,-215],[-12,-231],15,edoForm?'#b95182':'#ffad7a');armorLimb([20,-215],[12,-231],15,edoForm?'#b95182':'#ffad7a');
  polygon([[-82,-227],[-112,-217],[-119,-193],[-98,-177],[-69,-189],[-55,-213]],edoForm?'#42132f':'#7e2036',shellDark,edoForm?5:4);
  polygon([[82,-227],[112,-217],[119,-193],[98,-177],[69,-189],[55,-213]],edoForm?'#4c1538':'#8d293a',shellDark,edoForm?5:4);
  polygon([[-108,-214],[-82,-235],[-55,-222],[-72,-198],[-99,-193]],edoForm?'#7e285a':'#c7534d',edoForm?'#dfabd6':'#ffbb8a',edoForm?3:2.4);
  polygon([[108,-214],[82,-235],[55,-222],[72,-198],[99,-193]],edoForm?'#732455':'#d7604c',edoForm?'#dfabd6':'#ffc28f',edoForm?3:2.4);
  // Susanoo's secondary right arm carries the sake gourd that houses Totsuka.
  // Keep this separate from the primary sword arm so both relics read clearly.
  armorLimb([49,-210],[91,-200],13,edoForm?'#9c3f73':'#d65b4b');
  armorLimb([91,-200],[119,-183],11,edoForm?'#c083c7':'#ff9c70');
  if(!cinematicSlash&&!cinematicSlam&&!cinematicCharge&&!cinematicFinal||cinematicOutro)drawSakeGourd(142+breath*.2,-169,1.03,t);
  armorLimb([-70,-207],armL1,19,edoForm?'#73305e':'#b84449');armorLimb(armL1,armL2,16,edoForm?'#bd78b0':'#ff9c70');
  armorLimb([70,-207],armR1,19,edoForm?'#853564':'#c84c4a');armorLimb(armR1,armR2,16,edoForm?'#d1a0d6':'#ffb07a');
  // Angular bracers make the hands read as gauntlets at gameplay scale.
  polygon([[armL2[0]-12,armL2[1]-11],[armL2[0]+8,armL2[1]-14],[armL2[0]+12,armL2[1]+10],[armL2[0]-7,armL2[1]+15]],'#471324','#ffb07c',2);
  polygon([[armR2[0]-8,armR2[1]-14],[armR2[0]+13,armR2[1]-10],[armR2[0]+9,armR2[1]+15],[armR2[0]-12,armR2[1]+9]],'#57172a','#ffb07c',2);
  // Forearm shield is held out toward the opponent during Yata Mirror.
  if(guard){
    // The Yata barrier is planted far in front of Susanoo during the guard stance.
    const shieldPulse=.8+Math.sin(n*.58)*.2;
    drawShield(armR2[0]+33,armR2[1]-8,2.08,shieldPulse);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.28+Math.sin(n*.42)*.12;ctx.strokeStyle='#fff1c6';ctx.lineWidth=3;
    ctx.beginPath();ctx.ellipse(armR2[0]+33,armR2[1]-8,72,111,-.1,0,Math.PI*2);ctx.stroke();ctx.restore();
  }else if(battleIdle){
    // Distinct resting guard: Itachi's shield is compact; Edo keeps Yata raised and ready.
    const shieldPulse=.55+Math.sin(t*.026)*.08;
    drawShield(-151,-164,edoIdle?1.12:.94,shieldPulse);
  }else if(!cinematicSlash&&!cinematicSlam&&!cinematicCharge&&!cinematicFinal&&!cinematicOutro){
    // Keep the Yata shield away from both hands during two-handed Totsuka poses.
    drawShield(armL2[0]-5,armL2[1]-10,1.03,.28);
  }
  // Totsuka rests tip-down during idle, then animates normally for attacks and cinematics.
  if(heavy||thrust||charge||finalStrike||cinematicOutro||battleIdle){
    const pulling=cinematicOutro||battleIdle?false:(heavy?n<8:(thrust&&!cinematicSlam&&n<19));
    if(pulling){
      const q=heavy?clamp(n/8,0,1):clamp(n/19,0,1);
      const gx=142,gy=-216;
      const hx=armR2[0]+7,hy=armR2[1]+1;
      drawTotsuka(gx+(hx-gx)*q,gy+(hy-gy)*q,heavy?lerp(-.48,swordAngle,q):lerp(-.18,swordAngle,q),heavy?lerp(.55,1.42,q):lerp(.62,1.42,q),1);
    }else if(battleIdle){drawTotsuka(132,-177,swordAngle,edoIdle?1.02:.94,edoIdle?.92:.78);}else drawTotsuka(armR2[0]+7,armR2[1]+1,swordAngle,1.42,1);
  }
  // Boss-scale diagonal slash with layered hot-orange trails and drawn sword afterimages.
  if(k==='sus_x'&&!cinematicSlam&&n>=29&&n<=62){
    const fade=n<47?1:clamp(1-(n-47)/15,0,1);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
    for(let i=0;i<3;i++){
      const lag=i*8,progress=clamp((n-29-lag)/15,0,1);
      ctx.save();ctx.globalAlpha=i===0?.18:.09;
      drawTotsuka(lerp(-86,armR2[0]+25,progress),lerp(-286,armR2[1]+28,progress),lerp(-.98,1.14,progress),1.3,1);
      ctx.restore();
    }
    ctx.lineCap='round';ctx.lineJoin='round';
    ctx.strokeStyle='rgba(255,92,39,.2)';ctx.lineWidth=39;ctx.beginPath();ctx.moveTo(-178,-303);ctx.quadraticCurveTo(22,-226,282,-80);ctx.stroke();
    ctx.strokeStyle='rgba(255,128,58,.48)';ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(-170,-306);ctx.quadraticCurveTo(25,-224,276,-82);ctx.stroke();
    ctx.strokeStyle='rgba(255,210,145,.86)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-165,-304);ctx.quadraticCurveTo(32,-222,270,-83);ctx.stroke();
    ctx.strokeStyle='rgba(255,249,217,.94)';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-154,-300);ctx.quadraticCurveTo(35,-220,255,-86);ctx.stroke();
    for(let i=0;i<11;i++){
      const q=i/10,px=lerp(-166,270,q),py=lerp(-304,-83,q),wig=Math.sin(t*.24+i*4.1)*5;
      ctx.strokeStyle=i%3===0?'rgba(255,245,200,.9)':'rgba(255,117,48,.75)';ctx.lineWidth=i%3===0?2.6:1.4;
      ctx.beginPath();ctx.moveTo(px-9,py-7+wig);ctx.lineTo(px+13,py+5+wig);ctx.stroke();
    }
    ctx.restore();
  }
  if(finalStrike&&n>=12&&n<=42){
    const fade=n<31?1:clamp(1-(n-31)/11,0,1);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
    ctx.strokeStyle='rgba(255,82,52,.20)';ctx.lineWidth=66;ctx.beginPath();ctx.moveTo(-240,-343);ctx.quadraticCurveTo(12,-222,283,-35);ctx.stroke();
    ctx.strokeStyle='rgba(255,119,67,.50)';ctx.lineWidth=36;ctx.beginPath();ctx.moveTo(-235,-340);ctx.quadraticCurveTo(15,-220,279,-38);ctx.stroke();
    ctx.strokeStyle='rgba(255,221,166,.92)';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-224,-337);ctx.quadraticCurveTo(20,-219,269,-43);ctx.stroke();
    ctx.strokeStyle='rgba(255,248,228,.96)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-209,-330);ctx.quadraticCurveTo(24,-216,253,-50);ctx.stroke();
    ctx.restore();
  }
  if(k==='sus_x'&&!cinematicSlam&&n>=42&&n<=68){
    const impactFade=n<54?1:clamp(1-(n-54)/14,0,1);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=impactFade;
    ctx.strokeStyle='rgba(255,119,61,.78)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(170,-17,35+(n-42)*8,9+(n-42)*.45,0,Math.PI,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='rgba(255,210,146,.6)';ctx.lineWidth=2;
    for(let i=0;i<9;i++){const a=Math.PI+(i/8)*Math.PI,rr=55+(i%3)*21;ctx.beginPath();ctx.moveTo(170,-20);ctx.lineTo(170+Math.cos(a)*rr,-20+Math.sin(a)*rr*.38);ctx.stroke();}
    for(let i=0;i<16;i++){
      const q=(n-42)*1.3+i*7.4,xx=170+Math.sin(q*.21)*(28+(i%5)*14)+(n-42)*(i%2?2.8:-2.1),yy=-8-Math.abs(Math.cos(q*.16))*(8+(i%4)*7)-(n-42)*.26;
      ctx.strokeStyle=i%3===0?'rgba(255,235,183,.92)':'rgba(255,110,47,.74)';ctx.lineWidth=i%3===0?2.5:1.4;
      ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+Math.sin(q)*14,yy-4-(i%4)*3);ctx.stroke();
    }
    ctx.restore();
  }
  // Helmet and horned crown.
  polygon([[-39,-249],[-57,-267],[-45,-264],[-48,-292],[-28,-270],[-13,-301],[0,-278],[17,-301],[27,-271],[49,-289],[46,-260],[36,-244],[31,-226],[0,-218],[-31,-226]],edoForm?'#241025':'#461326',edoForm?'#e0c0eb':'#1a0710',edoForm?5:4);
  polygon([[-35,-255],[-23,-270],[0,-261],[23,-270],[35,-255],[29,-235],[13,-225],[-13,-225],[-29,-235]],edoForm?'#71305c':'#a43843',edoForm?'#edcbed':'#ffb07a',edoForm?3:2.4);
  polygon([[-22,-252],[0,-259],[22,-252],[17,-235],[0,-228],[-17,-235]],edoForm?'#17091d':'#210913',edoForm?'#d7b2ea':'#e98766',2);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,75,52,.34)';ctx.beginPath();ctx.ellipse(-13,-244,12,5,0,0,Math.PI*2);ctx.ellipse(13,-244,12,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=edoForm?'#e6d2ff':'#fff2c8';ctx.beginPath();ctx.ellipse(-13,-244,5.2,2.1,0,0,Math.PI*2);ctx.ellipse(13,-244,5.2,2.1,0,0,Math.PI*2);ctx.fill();ctx.restore();
  if(awakening&&n>8&&n<66){
    const roar=smooth(clamp((n-8)/18,0,1))*(1-smooth(clamp((n-55)/11,0,1)));
    ctx.save();ctx.globalAlpha*=roar;ctx.fillStyle='#10030b';ctx.strokeStyle='#ffb77f';ctx.lineWidth=2.2;
    ctx.beginPath();ctx.moveTo(-13,-234);ctx.quadraticCurveTo(0,-225,13,-234);ctx.lineTo(9,-213);ctx.quadraticCurveTo(0,-204,-9,-213);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff0c8';ctx.beginPath();ctx.moveTo(-9,-229);ctx.lineTo(9,-229);ctx.lineTo(7,-224);ctx.lineTo(-7,-224);ctx.closePath();ctx.fill();ctx.restore();
  }else polygon([[-13,-234],[0,-224],[13,-234],[8,-212],[-8,-212]],edoForm?'#a64b7f':'#e36a55',edoForm?'#280c2b':'#561728',2);
  // Tengu facial profile: long beak, angular cheek flanges, split fangs and pointed Kabuto crest.
  const beak=ctx.createLinearGradient(-7,-241,8,-199);beak.addColorStop(0,edoForm?'#dba8d5':'#ffd09a');beak.addColorStop(.45,edoForm?'#8f376e':'#c94a43');beak.addColorStop(1,edoForm?'#35102f':'#5a1422');
  polygon([[-10,-239],[0,-246],[10,-239],[5,-222],[3,-207],[0,-200],[-3,-207],[-5,-222]],beak,edoForm?'#e2bde2':'#ffc18c',edoForm?2.7:2.2);
  polygon([[-23,-237],[-39,-244],[-51,-258],[-44,-236],[-29,-223],[-17,-226]],edoForm?'#421333':'#651628',edoForm?'#bd79b4':'#ffad76',2);
  polygon([[23,-237],[39,-244],[51,-258],[44,-236],[29,-223],[17,-226]],edoForm?'#421333':'#651628',edoForm?'#bd79b4':'#ffad76',2);
  ctx.strokeStyle=edoForm?'#e3c9e3':'#ffe1b4';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-14,-216);ctx.lineTo(-9,-208);ctx.lineTo(-4,-216);ctx.lineTo(1,-207);ctx.lineTo(6,-216);ctx.lineTo(11,-208);ctx.lineTo(16,-216);ctx.stroke();
  // Edo's plates have a hard, crystal-like highlight rather than soft flame edging.
  if(edoForm){ctx.save();ctx.globalAlpha*=.72;ctx.strokeStyle='#ead7fa';ctx.lineWidth=1.15;ctx.beginPath();ctx.moveTo(-49,-204);ctx.lineTo(-66,-177);ctx.lineTo(-44,-124);ctx.lineTo(0,-112);ctx.lineTo(44,-124);ctx.lineTo(66,-177);ctx.lineTo(49,-204);ctx.moveTo(-31,-169);ctx.lineTo(-15,-139);ctx.lineTo(0,-126);ctx.lineTo(15,-139);ctx.lineTo(31,-169);ctx.stroke();ctx.restore();}
  // Chakra fingers fan outward during the summon roar.
  if(awakening&&n>18){
    ctx.save();ctx.globalAlpha*=.85;ctx.strokeStyle='#ffc18c';ctx.lineWidth=2.2;ctx.lineCap='round';
    for(const side of [-1,1]){const hx=side*184,hy=-166;for(let j=0;j<4;j++){const sx=hx+side*j*2,sy=hy-4-j*1.8,ex=hx+side*(12+j*7),ey=hy-23-j*4;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(hx+side*(7+j*5),hy-15-j*3,ex,ey);ctx.stroke();}ctx.beginPath();ctx.moveTo(hx,hy+1);ctx.lineTo(hx+side*17,hy+10);ctx.stroke();}
    ctx.restore();
  }
  // Variant-specific ambient matter: warm sparks for the living form, paper-ash and black crackle for Edo.
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.65;
  if(edoForm){
    ctx.globalCompositeOperation='source-over';
    for(let i=0;i<8;i++){const ex=Math.sin(t*.047+i*2.7)*(38+i*15),ey=-18-((t*1.35+i*31)%255),rot=Math.sin(t*.031+i)*.9;ctx.save();ctx.translate(ex,ey);ctx.rotate(rot);ctx.fillStyle=i%2?'rgba(133,132,150,.77)':'rgba(49,43,65,.92)';ctx.strokeStyle='rgba(220,207,237,.54)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-3,-6);ctx.lineTo(4,-4);ctx.lineTo(3,5);ctx.lineTo(-2,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
    ctx.strokeStyle='rgba(19,8,28,.92)';ctx.lineWidth=1.7;
    for(let i=0;i<4;i++){const ex=Math.sin(t*.12+i*2.1)*(55+i*14),ey=-135-((t*1.7+i*37)%135);ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex+5,ey-7);ctx.lineTo(ex+1,ey-12);ctx.lineTo(ex+9,ey-18);ctx.stroke();}
  }else{
    for(let i=0;i<7;i++){const ex=Math.sin(t*.12+i*2.1)*(50+i*14),ey=-150-((t*1.4+i*39)%120);ctx.fillStyle=i%2?'#ffca86':'#ff5b45';ctx.beginPath();ctx.arc(ex,ey,1.2+(i%3)*.45,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore(); // ember / Edo ash subpass
  ctx.restore(); // upper-body pose transform
  ctx.restore(); // complete Susanoo rig
}
function drawAwakeningBackground(n){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#080610');g.addColorStop(.52,'#24101f');g.addColorStop(1,'#08070c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.globalAlpha=.28;ctx.fillStyle='#f25f52';ctx.beginPath();ctx.arc(936,163,90+Math.sin(n*.06)*3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.9;ctx.fillStyle='#170a19';ctx.beginPath();ctx.arc(957,154,88,0,Math.PI*2);ctx.fill();ctx.restore();
  // Distant broken towers and fire haze.
  for(let i=0;i<13;i++){
    const x=i*112-35-(n*.26)%112,h=94+(i*53)%145;
    ctx.fillStyle=i%2?'#120d18':'#1a101d';ctx.fillRect(x,542-h,35+(i%3)*17,h);
    ctx.fillStyle='rgba(255,104,75,.09)';ctx.fillRect(x+5,545-h,4,h*.8);
  }
  const haze=ctx.createLinearGradient(0,475,0,650);haze.addColorStop(0,'rgba(184,32,52,0)');haze.addColorStop(.7,'rgba(180,31,48,.18)');haze.addColorStop(1,'rgba(255,105,59,.04)');ctx.fillStyle=haze;ctx.fillRect(0,460,W,230);
  const floor=ctx.createLinearGradient(0,565,0,720);floor.addColorStop(0,'#35202c');floor.addColorStop(.25,'#1c121d');floor.addColorStop(1,'#08070a');ctx.fillStyle=floor;ctx.fillRect(0,565,W,155);
  ctx.strokeStyle='rgba(255,136,99,.23)';ctx.lineWidth=1.5;
  for(let i=0;i<9;i++){const x=105+i*143;ctx.beginPath();ctx.moveTo(x,566);ctx.lineTo(x-26+(i%3)*16,604+(i%4)*15);ctx.lineTo(x+22,629+(i%5)*12);ctx.stroke();}
  for(let i=0;i<27;i++){const x=(i*139+n*(.45+(i%3)*.12))%W,y=560-((i*71+n*(.7+(i%4)*.12))%420);ctx.fillStyle=i%2?'rgba(255,160,102,.7)':'rgba(255,63,73,.62)';ctx.beginPath();ctx.arc(x,y,1+(i%3)*.6,0,Math.PI*2);ctx.fill();}
  const v=ctx.createRadialGradient(W/2,H/2,135,W/2,H/2,620);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.72)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}
function drawAwakening(){
  const c=Q.cinema;if(!c||c.kind!=='ult'||!c.owner)return false;
  const n=c.frame||0,owner=c.owner,target=c.target;
  hideStages(true);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);drawAwakeningBackground(n);
  const shakeAmt=n>145&&n<208?Math.sin(n*1.7)*3.5:0;
  const zoom=n<32?1.03:n<82?1.06:n<154?1.1:n<202?1.12:1.06;
  ctx.save();ctx.translate(W/2+shakeAmt,360);ctx.scale(zoom,zoom);ctx.translate(-W/2,-360);
  // Target is staged first so the giant spirit and Itachi occupy the foreground.
  const tx=target&&alive(target)?870:970,ox=500;
  if(target){
    const save={x:target.x,y:target.y,facing:target.facing};
    try{target.x=tx;target.y=610;target.facing=-1;window.drawFighter(target);}finally{target.x=save.x;target.y=save.y;target.facing=save.facing;}
  }
  const appear=n<28?smooth(n/28)*.08:(n<68?.08+smooth((n-28)/40)*.35:(n<132?.43+smooth((n-68)/64)*.48:1));
  const rigScale=(n<35?.16+easeOut(n/35)*.36:(n<105?.52+easeOut((n-35)/70)*.76:(n<150?1.28+easeOut((n-105)/45)*.30:1.58)));
  const priorRigFacing=owner.facing;
  owner.facing=1; // the staged opponent is on the right; Susanoo must face the same way
  drawSusanooRig(owner,ox-64,610+34*rigScale,rigScale,n,appear,'awakening');
  owner.facing=priorRigFacing;
  const save={x:owner.x,y:owner.y,facing:owner.facing,pose:owner.itachiPoseKey};
  try{owner.x=ox;owner.y=610;owner.facing=target&&target.x<owner.x?-1:1;owner.itachiPoseKey='ult';window.drawFighter(owner);}finally{owner.x=save.x;owner.y=save.y;owner.facing=save.facing;owner.itachiPoseKey=save.pose;}
  ctx.restore();
  // Hand-seal aura and the final armor lock-in.
  if(n<78){
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,112,83,'+(.3+Math.sin(n*.2)*.12)+')';ctx.lineWidth=2;
    for(let i=0;i<5;i++){const r=26+n*1.25+i*14;ctx.beginPath();ctx.ellipse(ox,492,r,r*.42,n*.007+i*.4,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }
  if(n>142&&n<210){ctx.save();ctx.globalAlpha=Math.sin(n*.42)*.045+.06;ctx.fillStyle='#ff5c45';ctx.fillRect(0,0,W,H);ctx.restore();}
  if(n>208){
    const a=smooth((n-208)/18);ctx.save();ctx.globalAlpha=a;ctx.fillStyle='rgba(5,3,9,.68)';ctx.fillRect(354,62,572,47);
    ctx.strokeStyle='rgba(255,176,128,.72)';ctx.lineWidth=1.4;ctx.strokeRect(354,62,572,47);
    ctx.fillStyle='#ffe3c0';ctx.font='bold 23px sans-serif';ctx.textAlign='center';ctx.fillText('SUSANOO AWAKENING',640,93);
    ctx.fillStyle='rgba(255,204,164,.88)';ctx.font='12px sans-serif';ctx.fillText('THE TOTSUKA BLADE · THE YATA MIRROR',640,127);ctx.restore();
  }
  if(n>234){ctx.save();ctx.globalAlpha=smooth((n-234)/6);ctx.fillStyle='#ffe8c9';ctx.fillRect(0,0,W,H);ctx.restore();}
  ctx.restore();return true;
}
let phaseControlRoot=null,phaseControlOwners=[],phaseControlSignature='';
 function ensurePhaseControls(){
   if(phaseControlRoot||!document||!document.getElementById)return;
   const wrap=document.getElementById('wrap');if(!wrap)return;
   const style=document.createElement('style');
   style.id='jffSusanooPhaseControlStyle';
   style.textContent='#jffSusanooPhaseControls{position:absolute;right:18px;top:162px;width:354px;padding:10px 11px 11px;z-index:8;display:none;pointer-events:auto;color:#f1e6ed;background:linear-gradient(145deg,rgba(19,7,20,.96),rgba(7,8,15,.96));border:1px solid rgba(234,133,119,.58);box-shadow:0 7px 26px rgba(0,0,0,.42),inset 0 1px rgba(255,255,255,.06);font-family:Consolas,monospace}#jffSusanooPhaseControls .jff-phase-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px;font-size:9px;letter-spacing:1.5px;font-weight:900;color:#ffbd9f}#jffSusanooPhaseControls .jff-phase-sub{font-size:7px;letter-spacing:.8px;color:#8e859a;font-weight:700}#jffSusanooPhaseControls .jff-phase-row{display:flex;align-items:center;gap:5px;margin-top:5px}#jffSusanooPhaseControls .jff-phase-player{width:28px;flex:0 0 28px;font-size:8px;font-weight:900;color:#d6a8bf}#jffSusanooPhaseControls button{appearance:none;flex:1;min-width:0;padding:8px 4px;border:1px solid rgba(201,144,151,.24);border-radius:2px;background:linear-gradient(180deg,rgba(47,24,39,.88),rgba(17,11,22,.95));color:#b8a8b7;font:900 8px/1 Consolas,monospace;letter-spacing:.2px;cursor:pointer;transition:background .12s,border-color .12s,color .12s}#jffSusanooPhaseControls button:hover{border-color:#ffb08b;color:#fff0db;background:rgba(103,39,53,.85)}#jffSusanooPhaseControls button.is-active{border-color:#ff946d;color:#fff3c8;background:linear-gradient(180deg,rgba(128,43,42,.9),rgba(57,16,29,.95));box-shadow:inset 0 0 12px rgba(255,99,65,.18),0 0 8px rgba(255,100,71,.12)}#jffSusanooPhaseControls button:focus-visible{outline:2px solid #fff0bf;outline-offset:2px}';
   document.head.appendChild(style);
   phaseControlRoot=document.createElement('div');phaseControlRoot.id='jffSusanooPhaseControls';
   phaseControlRoot.setAttribute('aria-label','Susanoo form selector');phaseControlRoot.setAttribute('aria-hidden','true');
   phaseControlRoot.addEventListener('click',function(e){
     const btn=e.target&&e.target.closest?e.target.closest('button[data-phase]'):null;
     if(!btn||!phaseControlRoot.contains(btn))return;
     const f=phaseControlOwners[Number(btn.getAttribute('data-owner-slot'))];
     if(!f||!validItachi(f)||!f.itachiSusanooActive)return;
     f.itachiSusanooPhase=clamp(Number(btn.getAttribute('data-phase'))||3,1,3);
     refreshPhaseControlButtons();
     if(typeof SFX!=='undefined'&&SFX.ui)SFX.ui();
   });
   wrap.appendChild(phaseControlRoot);
 }
 function refreshPhaseControlButtons(){
   if(!phaseControlRoot)return;
   for(const btn of phaseControlRoot.querySelectorAll('button[data-phase]')){
     const f=phaseControlOwners[Number(btn.getAttribute('data-owner-slot'))];
     const selected=!!(f&&clamp(Math.round(Number(f.itachiSusanooPhase)||3),1,3)===Number(btn.getAttribute('data-phase')));
     btn.classList.toggle('is-active',selected);btn.setAttribute('aria-pressed',selected?'true':'false');
   }
 }
 function updatePhaseControls(){
   ensurePhaseControls();if(!phaseControlRoot)return;
   const hidden=typeof G==='undefined'||G.mode==='menu'||G.paused||!!Q.edoSusanooCutscene||!!Q.cinema;
   const owners=hidden?[]:fighters().filter(f=>validItachi(f)&&!f.ai&&f.itachiSusanooActive).sort((a,b)=>(a.isP2?1:0)-(b.isP2?1:0));
   const signature=owners.map(f=>f.isP2?'P2':'P1').join('|');
   phaseControlOwners=owners;
   if(signature!==phaseControlSignature){
     phaseControlSignature=signature;
     phaseControlRoot.innerHTML=owners.map((f,i)=>'<div class="jff-phase-row-wrap"><div class="jff-phase-head"><span>'+(f.isP2?'P2':'P1')+' · SUSANOO FORM</span><span class="jff-phase-sub">SELECT PHASE</span></div><div class="jff-phase-row"><span class="jff-phase-player">FORM</span><button type="button" data-owner-slot="'+i+'" data-phase="1">01 · SKELETAL</button><button type="button" data-owner-slot="'+i+'" data-phase="2">02 · MUSCULAR</button><button type="button" data-owner-slot="'+i+'" data-phase="3">03 · ARMORED</button></div></div>').join('');
   }
   const visible=owners.length>0&&!hidden;
   phaseControlRoot.style.display=visible?'block':'none';
   phaseControlRoot.setAttribute('aria-hidden',visible?'false':'true');
   refreshPhaseControlButtons();
 }
 function drawFormHint(){
  const fs=fighters(),f=fs.find(x=>x&&x.id==='itachi'&&x.itachiSusanooActive&&alive(x));
  if(!f||typeof ctx==='undefined'||!W||!H)return;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.93;
  const x=22,y=H-87,w=310,h=63;
  ctx.fillStyle='rgba(10,5,12,.82)';ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(255,154,112,.65)';ctx.lineWidth=1.3;ctx.strokeRect(x,y,w,h);
  ctx.fillStyle='#ffd0a9';ctx.font='bold 13px sans-serif';ctx.textAlign='left';ctx.fillText('SUSANOO · AWAKENED',x+12,y+18);
  ctx.fillStyle='#fff0dd';ctx.font='11px sans-serif';ctx.fillText((f.isP2?'NUM 1':'1')+' M1  TOTSUKA  ·  '+(f.isP2?'NUM −':'Z')+' YATA  ·  '+(f.isP2?'NUM /':'X')+' SEAL',x+12,y+37);
  const secs=Math.max(0,(f.itachiSusanooFrames||0)/60);ctx.fillStyle='rgba(255,200,157,.88)';ctx.font='10px sans-serif';ctx.fillText('FORM EXPIRES IN '+secs.toFixed(1)+'s',x+12,y+52);ctx.restore();
}
if(typeof previousDrawFighter==='function')window.drawFighter=function(f){
  const cine=Q.edoSusanooCutscene;
  if(cine&&cine.owner===f&&validItachi(f)&&f.itachiSusanooActive){
    const n=cine.frame||0;let size=f.itachiEdo?2.12:1.94,mode='battle',baseY=f.y+3,alpha=1;
    if(n<72){size=.06+1.98*smooth(n/50);mode='awakening';}
    else if(n<168){size=2.12;mode='cinematic-slash';}
    else if(n<270){size=2.24;mode='cinematic-slam';baseY-=Math.sin(Math.min(1,(n-168)/42)*Math.PI)*44;}
    else if(n<348){size=2.12;mode='cinematic-charge';baseY-=92*smooth((n-270)/24);}
    else if(n<390){size=2.08;mode='cinematic-final';baseY-=20;}
    else{size=1.92;mode='cinematic-outro';alpha=Math.max(0,1-(n-390)/30);}
    const face=f.facing||1;
    // On the summon/reveal shot, anchor the giant behind Itachi and put its feet on the stage floor.
    const rigX=mode==='awakening'?f.x-face*72:f.x-face*9*size/1.58;
    if(mode==='awakening')baseY=f.y+34*size;
    drawSusanooRig(f,rigX,baseY,size,n,alpha,mode);
  }else if(validItachi(f)&&f.itachiSusanooActive&&!(Q.cinema&&Q.cinema.kind==='ult')){
    const phase=clamp(Math.round(Number(f.itachiSusanooPhase)||3),1,3),face=f.facing||1;
    // Phase 1/2 are arena-scale entities, not a small companion sprite. Keep Phase 3 at its existing scale.
    const size=phase===3?(f.itachiEdo?1.88:1.64):(phase===1?(f.itachiEdo?2.03:1.98):(f.itachiEdo?2.12:2.06));
    const backOffset=Math.round(size*(f.itachiEdo?43:39));
    const baseY=f.y+34*size;
    drawSusanooRig(f,f.x-face*backOffset,baseY,size,tick(),1,'battle');
  }
  return previousDrawFighter.apply(this,arguments);
};
if(typeof previousReset==='function')window.resetFighter=function(f){
  if(f&&f.id==='itachi'){
    f.itachiSusanooActive=false;f.itachiSusanooPending=false;f.itachiSusanooAction='';f.itachiSusanooMarks={};f.itachiYataUntil=0;f.itachiSusanooFrames=0;f.itachiSusanooPhase=3;f.itachiYataCounterUsed=false;
  }
  return previousReset.apply(this,arguments);
};
if(typeof previousStep==='function')window.step=function(){
  const r=previousStep.apply(this,arguments);
  for(const f of fighters()){
    if(!f||f.id!=='itachi')continue;
    if(!Number.isFinite(f.itachiSusanooPhase))f.itachiSusanooPhase=3;
    if(f.itachiSusanooPending&&!Q.cinema&&f.moveKey!=='ult'&&!f.move){
      f.itachiSusanooPending=false;f.itachiSusanooActive=true;f.itachiSusanooAction='';f.itachiSusanooFrames=1200;f.itachiSusanooPhase=3;f.itachiYataUntil=0;f.itachiYataCounterUsed=false;
      f.state=alive(f)?'IDLE':'DEFEAT';f.stateFrame=0;f.move=null;f.moveKey=null;f.moveFrame=0;f.vx=0;f.vy=0;
      f.invuln=Math.min(f.invuln||0,36);f.itachiPoseKey='';
      fx('shock',f.x,f.y-90,44);fx('magatama',f.x+f.facing*52,f.y-185,48);
      if(typeof flash==='function')flash(.26,'#ff8a62');if(typeof shake==='function')shake(10);if(typeof camPunch==='function')camPunch(.18);
      f.itachiSusanooGlow=160;f.itachiSusanooActivatedThisStep=true;
    }
    if(!alive(f)||G.matchOver||G.mode==='menu'){
      f.itachiSusanooActive=false;f.itachiSusanooAction='';f.itachiSusanooFrames=0;
    }else if(f.itachiSusanooActive&&!f.itachiSusanooActivatedThisStep&&!G.paused&&G.roundState!=='ko'&&!Q.cinema&&f.itachiSusanooFrames>0){
      f.itachiSusanooFrames--;
      if(f.itachiSusanooFrames<=0){
        f.itachiSusanooActive=false;f.itachiSusanooAction='';f.itachiYataUntil=0;f.itachiSusanooFrames=0;
        if(/^sus_(m1|z|x)$/.test(f.moveKey||'')){f.move=null;f.moveKey=null;f.moveFrame=0;f.state='IDLE';f.stateFrame=0;}
        f.itachiPoseKey='';fx('shock',f.x,f.y-70,28);fx('crows',f.x,f.y-90,26);
        if(typeof flash==='function')flash(.14,'#bd5960');
      }
    }
    f.itachiSusanooActivatedThisStep=false;
    if(f.itachiSusanooGlow>0)f.itachiSusanooGlow--;
  }
  return r;
};
if(typeof previousRender==='function')window.render=function(){
  const out=previousRender.apply(this,arguments);
  if(Q.edoSusanooCutscene)hideStages(true);
  else if(Q.cinema&&Q.cinema.kind==='ult')drawAwakening();
  else{
    hideStages(false);
    if(typeof G!=='undefined'&&G.mode!=='menu')drawFormHint();
  }
  updatePhaseControls();
  return out;
};
// M1 / Z / X are consumed only while Itachi's persistent Susanoo form is active.
// Old Itachi listeners are patched separately for X and P2's numpad-minus Z binding.
addEventListener('keydown',function(e){
  if(typeof G==='undefined'||G.mode==='menu'||G.paused)return;
  const f=currentOwnerForCode(e.code);if(!f)return;
  if(e.repeat){e.preventDefault();e.stopImmediatePropagation();return;}
  let key=null;
  if(e.code==='Digit1'||e.code==='Numpad1')key='m1';
  else if(e.code==='KeyZ'||e.code==='NumpadSubtract')key='z';
  else if(e.code==='KeyX'||e.code==='NumpadDivide')key='x';
  if(!key)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(!Q.cinema&&!f.move&&['IDLE','WALK','LAND','ATTACK'].includes(f.state)){
    const selectedPhase=clamp(Math.round(Number(f.itachiSusanooPhase)||3),1,3);
    if(selectedPhase<3&&window.JFF_SUSANOO_PHASE_SKILLS&&typeof window.JFF_SUSANOO_PHASE_SKILLS.activate==='function')window.JFF_SUSANOO_PHASE_SKILLS.activate(f,key==='z'?1:2);
    else activate(f,key);
  }
},true);
window.JFF_ITACHI_SUSANOO_DEBUG={getForm:f=>!!(f&&f.itachiSusanooActive),drawSusanoo:drawSusanooRig,reset:f=>{if(f){f.itachiSusanooActive=false;f.itachiSusanooPending=false;f.itachiSusanooAction='';}}};
console.info('[Itachi Susanoo] On-screen phase buttons: Skeletal / Muscular / Armored for regular and Edo Itachi.');
})();