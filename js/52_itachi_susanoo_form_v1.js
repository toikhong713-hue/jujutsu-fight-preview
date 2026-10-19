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
  if(code==='Numpad1'||code==='NumpadDivide'||code==='NumpadAdd')return fs[1]&&fs[1].id==='itachi'&&!fs[1].ai&&fs[1].itachiSusanooActive?fs[1]:null;
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
window.JFF_ITACHI_SUSANOO_FORM={ready:true,activate:activate,version:8,idlePoses:{itachi:'Guardian Stance',edo:'Edo War Stance'},summonPhases:['Skeletal','Muscular Chakra','Armored Tengu'],setPhase:(f,n)=>{if(!validItachi(f)||!f.itachiSusanooActive)return false;f.itachiSusanooPhase=clamp(Math.round(Number(n)||3),1,3);return true;}};
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
  if(f&&f.id==='itachi'&&!f.itachiEdo&&f.itachiSusanooExhausted&&key==='ult'){if(typeof window.floatText==='function')window.floatText(f.x,f.y-180,'SUSANOO EXHAUSTED · ROUND RESET','#ffb0c4',12,34);return false;}
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
 const t=frame||0,owner=fighter||null,state=owner&&owner.state||'IDLE';
 const moving=/^(WALK|RUN|DASH)$/.test(state),skill=owner&&owner.itachiPhaseSkillKey;
 const active=!!(owner&&owner.move&&!moving)||!!skill;
 const idle=active?.2:1,walk=t*.34,step=moving?Math.sin(walk):0;
 const skeletalGuardIdle=stage===0&&!moving&&!active;
 const guardBlend=skeletalGuardIdle?1:0;
 const breath=Math.sin(t*(stage===0?.062:.055))*idle*(stage===0?4.2:3.5);
 const sway=Math.sin(t*(stage===0?.031:.033))*idle*(stage===0?5.2:2.3);
 const armSwing=moving?step*9:Math.sin(t*(stage===0?.038:.052))*(stage===0?5.5:5)*idle;
 const skillKey=owner&&owner.itachiPhaseSkillKey||'';
 const skillFrame=owner&&owner.moveFrame||0;
 const crossSkill=skillKey==='p1_skeletal_x'||skillKey==='edo_p1_skeletal_x';
 const crossWind=crossSkill?smooth(skillFrame/18)*(1-smooth((skillFrame-23)/9)):0;
 const crossSweep=crossSkill?smooth((skillFrame-(skillKey==='edo_p1_skeletal_x'?25:21))/(skillKey==='edo_p1_skeletal_x'?13:11))*(1-smooth((skillFrame-(skillKey==='edo_p1_skeletal_x'?48:43))/11)):0;
 const crossDrop=crossSkill?smooth((skillFrame-(skillKey==='edo_p1_skeletal_x'?62:56))/(skillKey==='edo_p1_skeletal_x'?10:9))*(1-smooth((skillFrame-(skillKey==='edo_p1_skeletal_x'?80:73))/12)):0;
 const armStretch=crossSkill?(8+crossWind*24+crossSweep*52+crossDrop*18):((skillKey==='p1_bones'||skillKey==='edo_p1_grasp')?42+smooth(skillFrame/5)*20:8);
 const dashPose=skillKey==='p1_bones'?smooth((skillFrame-2)/9)*(1-smooth((skillFrame-57)/19)):skillKey==='edo_p1_grasp'?smooth(skillFrame/7)*(1-smooth((skillFrame-38)/12)):crossSkill?smooth((skillFrame-22)/10)*(1-smooth((skillFrame-(skillKey==='edo_p1_skeletal_x'?80:72))/16)):0;
 const dashImpact=skillKey==='p1_bones'?smooth((skillFrame-39)/7)*(1-smooth((skillFrame-57)/12)):crossSkill?crossDrop:0;
 // Animate the titan's body mass into a forward-driving crouch; the player stays anchored.
 ctx.save();
 // Skeletal Susanoo is an ethereal emergence, not a fully grounded statue: keep roughly its lower half below the arena plane.
 if(stage===0)ctx.translate(0,120);
 ctx.translate(dashPose*20,dashPose*11-dashImpact*7);ctx.translate(0,-126);ctx.rotate(dashPose*.17-dashImpact*.12);ctx.translate(0,126);
 const bob=moving?Math.abs(Math.sin(walk))*4:Math.sin(t*.047)*2.1*idle;
 const idleHeadTilt=stage===0?Math.sin(t*.019)*idle*.035:0;
 const idleShoulderLift=stage===0?Math.sin(t*.062)*idle*2.1:0;
 const hit=owner&&(state==='HITSTUN'||(owner.hitstun||0)>0);
 const recoil=hit?Math.min(1,Math.max(.25,(owner.hitstun||5)/8)):0;
 const xSkill=skillKey==='p1_skeletal_x'||skillKey==='edo_p1_skeletal_x';
 const hot=xSkill&&edo?'#7047c8':(edo?'#a81e38':'#e54a2e');
 const edge=xSkill&&edo?'#d9c5ff':(edo?'#f06a73':'#ff9b62');
 const dark=edo?'#210b18':'#3b1016';
 const core=edo?'#ff283f':'#ffe29a';
 const mid=edo?'#64152d':'#a82c26';
 const bone=(x1,y1,x2,y2,w,c)=>{ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=dark;ctx.lineWidth=w+5;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle=c||hot;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle=edge;ctx.lineWidth=Math.max(1.1,w*.17);ctx.beginPath();ctx.moveTo(x1-1,y1-1);ctx.lineTo(x2-1,y2-1);ctx.stroke();};
 const orb=(x,y,r,c)=>{ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=c;ctx.globalAlpha*=.25;ctx.beginPath();ctx.arc(x,y,r*2.3,0,Math.PI*2);ctx.fill();ctx.globalAlpha*=3.1;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();};
 const joint=(x,y,r)=>{ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=core;ctx.globalAlpha*=.72;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();};
 // Cinematic crimson-orange chakra flare with a hot rim and directional motion streaks.
 ctx.save();ctx.globalCompositeOperation='lighter';
 const activeDash=skillKey==='p1_bones'||skillKey==='edo_p1_grasp'||crossSkill;
 const flare=activeDash?(.55+.45*Math.sin(skillFrame*.52)):0;
 const aura=ctx.createRadialGradient(0,-155,8,0,-155,activeDash?285:220);
 aura.addColorStop(0,activeDash?'rgba(255,75,30,.58)':(edo?'rgba(211,31,65,.30)':'rgba(255,86,42,.29)'));
 aura.addColorStop(.28,activeDash?'rgba(255,34,20,.40)':(edo?'rgba(150,18,52,.23)':'rgba(205,32,24,.18)'));
 aura.addColorStop(.62,activeDash?'rgba(255,111,36,.22)':(edo?'rgba(84,9,35,.18)':'rgba(163,32,22,.15)'));
 aura.addColorStop(1,'rgba(10,3,8,0)');
 ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(0,-155,activeDash?260:218,activeDash?275:235,0,0,Math.PI*2);ctx.fill();
 if(activeDash){
  ctx.globalAlpha*=.7+flare*.3;ctx.strokeStyle='#ff4b24';ctx.lineWidth=4.5+flare*2;
  ctx.beginPath();ctx.ellipse(-20,-132,104+flare*17,154+flare*20,-.12,Math.PI*.12+skillFrame*.07,Math.PI*1.72+skillFrame*.07);ctx.stroke();
  ctx.strokeStyle='#ffb04d';ctx.lineWidth=2.1;ctx.beginPath();ctx.ellipse(-24,-135,122+flare*22,177+flare*15,.1,-Math.PI*.82+skillFrame*.055,Math.PI*.62+skillFrame*.055);ctx.stroke();
  for(let i=0;i<11;i++){const yy=-38-((skillFrame*8+i*23)%225),len=32+(i%4)*19+flare*20,sx=-35-(i%3)*17;ctx.globalAlpha*=.92;ctx.strokeStyle=i%3===0?'#ffd078':'#ff542b';ctx.lineWidth=i%3===0?2.4:1.5;ctx.beginPath();ctx.moveTo(sx,yy);ctx.lineTo(sx-len,yy-9-flare*5);ctx.stroke();}
 }
 ctx.restore();
 // Lower body: clear joint pivots and planted feet. Phase 1 remains skeletal; Phase 2 has plated greaves.
 const kly=-57-Math.max(0,Math.cos(walk))*5.5*(moving?1:0),kry=-57-Math.max(0,Math.cos(walk+Math.PI))*5.5*(moving?1:0);
 const klx=-39+sway*.35+step*5,krx=39-sway*.35-step*5;
 bone(-20,-102,klx,kly,stage===0?11:17,stage===0?hot:mid);
 bone(20,-102,krx,kry,stage===0?11:17,stage===0?hot:mid);
 bone(klx,kly,-47+step*7,-28,stage===0?8:13,stage===0?hot:mid);
 bone(krx,kry,47-step*7,-28,stage===0?8:13,stage===0?hot:mid);
 bone(-47+step*7,-28,-17+step*7,-26,stage===0?8:14,dark);
 bone(47-step*7,-28,17-step*7,-26,stage===0?8:14,dark);
 joint(klx,kly,4);joint(krx,kry,4);
 ctx.save();ctx.translate(sway*.13,-bob+dashPose*10);ctx.translate(0,-126);ctx.rotate(-recoil*(stage===0?.09:.065)+Math.sin(t*.025)*idle*.025+dashPose*(owner&&owner.facing<0?-.42:.42));ctx.translate(0,126);
 if(stage===0){
  // PHASE 1 REBIRTH: anatomy-first skeletal titan, with separate clavicles, scapulae, sternum and pelvis.
  // The spine is segmented so the silhouette reads as a creature, not a set of glowing lines.
  bone(0,-105,0,-226,12,hot);
  for(let v=0;v<7;v++){
   const sy=-118-v*13;
   polygon([[-7,sy-3],[0,sy-6],[7,sy-3],[6,sy+4],[0,sy+7],[-6,sy+4]],v%2?mid:dark,edge,1.1);
  }
  // Shoulder blades and clavicles create a wide, recognizable upper silhouette.
  bone(0,-213,-34,-219,8,hot);bone(-34,-219,-63,-207,9,hot);
  bone(0,-213,34,-219,8,hot);bone(34,-219,63,-207,9,hot);
  polygon([[-39,-218],[-67,-225],[-91,-207],[-84,-188],[-58,-193],[-44,-205]],dark,edge,2.4);
  polygon([[39,-218],[67,-225],[91,-207],[84,-188],[58,-193],[44,-205]],dark,edge,2.4);
  // Seven separate ribs flare outward on inhale and tighten on exhale.
  for(let i=0;i<7;i++){
   const y=-196+i*13+breath*.42,w=39-i*2.1+Math.max(0,breath)*.7;
   const tipY=y+8+(i%2?1.5:0);
   ctx.strokeStyle=dark;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-w,y);ctx.bezierCurveTo(-w-13,y+4,-w+2,tipY+9,-14,tipY+2);ctx.quadraticCurveTo(-6,tipY+7,0,tipY+3);ctx.quadraticCurveTo(6,tipY+7,14,tipY+2);ctx.bezierCurveTo(w-2,tipY+9,w+13,y+4,w,y);ctx.stroke();
   ctx.strokeStyle=hot;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-w,y);ctx.bezierCurveTo(-w-13,y+4,-w+2,tipY+9,-14,tipY+2);ctx.quadraticCurveTo(-6,tipY+7,0,tipY+3);ctx.quadraticCurveTo(6,tipY+7,14,tipY+2);ctx.bezierCurveTo(w-2,tipY+9,w+13,y+4,w,y);ctx.stroke();
   ctx.strokeStyle=edge;ctx.lineWidth=1.35;ctx.beginPath();ctx.moveTo(-w+4,y-1);ctx.quadraticCurveTo(-w+3,tipY+2,-11,tipY+1);ctx.moveTo(w-4,y-1);ctx.quadraticCurveTo(w-3,tipY+2,11,tipY+1);ctx.stroke();
  }
  // Sternum glows in pulses; living Itachi's light flickers while Edo remains unwavering.
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=edo?.82:(.42+.32*Math.sin(t*.27));
  ctx.fillStyle=core;ctx.beginPath();ctx.moveTo(0,-202);ctx.lineTo(7,-178);ctx.lineTo(0,-151);ctx.lineTo(-7,-178);ctx.closePath();ctx.fill();
  ctx.strokeStyle=edge;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,-146);ctx.lineTo(0,-139);ctx.lineTo(12,-146);ctx.stroke();ctx.restore();
  // Pelvis ring and hip joints anchor the long skeletal arms and legs.
  bone(-24,-112,-39,-97,8,hot);bone(-39,-97,-24,-83,7,hot);bone(-24,-83,0,-88,7,hot);
  bone(24,-112,39,-97,8,hot);bone(39,-97,24,-83,7,hot);bone(24,-83,0,-88,7,hot);
  const eY=-184+armSwing*.28+idleShoulderLift+crossWind*20-crossSweep*12+crossDrop*28+dashPose*10,wY=-142+armSwing*.6+crossWind*22-crossSweep*27+crossDrop*58+dashPose*15;
  const elbowReach=armStretch*.42+crossSweep*22,handReach=armStretch;
  const leftElbowX=(-73+sway-elbowReach)*(1-guardBlend)+(-58+sway*.25)*guardBlend;
  const leftElbowY=eY*(1-guardBlend)+(-151+idleShoulderLift*.3)*guardBlend;
  const leftHandX=(-104+armSwing-handReach)*(1-guardBlend)+(-54+armSwing*.2)*guardBlend;
  const leftHandY=wY*(1-guardBlend)+(-66+Math.sin(t*.038)*1.5)*guardBlend;
  const rightElbowX=(73-sway+elbowReach)*(1-guardBlend)+(59-sway*.2)*guardBlend;
  const rightElbowY=eY*(1-guardBlend)+(-192+idleShoulderLift*.35)*guardBlend;
  const rightHandX=(104-armSwing+handReach)*(1-guardBlend)+(18+Math.sin(t*.033)*1.5)*guardBlend;
  const rightHandY=wY*(1-guardBlend)+(-169+Math.sin(t*.041)*1.2)*guardBlend;
  bone(-43,-211,leftElbowX,leftElbowY,14,hot);bone(leftElbowX,leftElbowY,leftHandX,leftHandY,9,hot);
  bone(43,-211,rightElbowX,rightElbowY,14,hot);bone(rightElbowX,rightElbowY,rightHandX,rightHandY,9,hot);
  for(const side of [-1,1]){
   const hx=side<0?leftHandX:rightHandX,hy=side<0?leftHandY:rightHandY;
   // Metacarpals, knuckles and hooked phalanges, with a slight idle curl.
   bone(hx-side*5,hy,hx+side*5,hy+3,5,hot);
   for(let j=0;j<4;j++){
    const curl=Math.sin(t*.041+j*.7)*idle*1.7;
    bone(hx+side*j*2,hy+1,hx+side*(8+j*3),hy-10-j*2+curl,3,hot);
    joint(hx+side*(8+j*3),hy-10-j*2+curl,1.7);
   }
   bone(hx-side*3,hy+3,hx-side*12,hy+11,3.2,edge);
  }
  // Head has its own subtle idle tilt, independent of the breathing rib cage.
  ctx.save();ctx.translate(0,-237);ctx.rotate(idleHeadTilt);ctx.translate(0,237);
  // Angular Tengu skull: deep sockets, cheek flanges, split jaw and readable teeth.
  polygon([[-31,-239],[-41,-260],[-24,-253],[-14,-280],[0,-263],[14,-280],[24,-253],[41,-260],[31,-239],[20,-224],[-20,-224]],dark,edge,2.8);
  polygon([[-24,-243],[-13,-250],[0,-244],[13,-250],[24,-243],[16,-231],[0,-226],[-16,-231]],mid,hot,2);
  polygon([[-17,-242],[-9,-247],[0,-243],[9,-247],[17,-242],[10,-235],[0,-232],[-10,-235]],dark,edge,1.3);
  // Eye sockets are dark and recessed; only the inner Sharingan glow is luminous.
  ctx.fillStyle='#10050c';ctx.beginPath();ctx.ellipse(-10,-243,7.4,4.1,-.12,0,Math.PI*2);ctx.ellipse(10,-243,7.4,4.1,.12,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=core;
  ctx.globalAlpha*=edo?.98:(.38+.48*Math.sin(t*.29));
  ctx.beginPath();ctx.ellipse(-10,-243,4.8,2,-.1,0,Math.PI*2);ctx.ellipse(10,-243,4.8,2,.1,0,Math.PI*2);ctx.fill();
  if(edo){ctx.strokeStyle='#ff879e';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(-10,-243,6.3,t*.06,t*.06+Math.PI*1.6);ctx.arc(10,-243,6.3,-t*.06,-t*.06+Math.PI*1.6);ctx.stroke();}
  ctx.restore();
  polygon([[-15,-233],[15,-233],[10,-218],[4,-211],[0,-208],[-4,-211],[-10,-218]],dark,edge,1.6);
  ctx.strokeStyle=edge;ctx.lineWidth=1.7;ctx.beginPath();
  for(let tooth=0;tooth<5;tooth++){const tx=-10+tooth*5;ctx.moveTo(tx,-230);ctx.lineTo(tx+1,-225);}
  ctx.stroke();
  bone(-25,-243,-53,-261,5,hot);bone(25,-243,53,-261,5,hot);
  // Short horn ridges and temple plates break up the outline.
  polygon([[-28,-253],[-40,-267],[-35,-245],[-25,-237]],dark,edge,1.6);
  polygon([[28,-253],[40,-267],[35,-245],[25,-237]],dark,edge,1.6);
  ctx.restore(); // independent skull idle
  for(const p of [[-35,-202],[-73,-201],[35,-202],[73,-201],[0,-105],[-39,-97],[39,-97]])joint(p[0],p[1],3.4);
 }else{
  // NEW PHASE 2: muscular torso, broad shoulder plates, segmented arm guards and a reinforced Tengu helm.
  const muscle=ctx.createLinearGradient(-70,-220,70,-90);
  muscle.addColorStop(0,edo?'#9b1d3a':'#e64b2c');muscle.addColorStop(.5,edo?'#64152d':'#a92b24');muscle.addColorStop(1,dark);
  polygon([[-39,-211],[-68,-191],[-58,-151],[-39,-125],[-17,-112],[0,-108],[17,-112],[39,-125],[58,-151],[68,-191],[39,-211],[18,-197],[0,-188],[-18,-197]],muscle,edge,3.5);
  // Sternum and abdominal segmentation move with the breathing cycle.
  ctx.strokeStyle=edge;ctx.lineWidth=5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,-202);ctx.lineTo(0,-119);
  for(let i=0;i<4;i++){const y=-184+i*16+breath*.25;ctx.moveTo(-31+i*2,y);ctx.quadraticCurveTo(-12,y+10,0,y+5);ctx.quadraticCurveTo(12,y+10,31-i*2,y);}ctx.stroke();
  polygon([[-53,-205],[-79,-194],[-91,-171],[-68,-161],[-48,-177]],dark,edge,2.2);
  polygon([[53,-205],[79,-194],[91,-171],[68,-161],[48,-177]],dark,edge,2.2);
  polygon([[-58,-189],[-82,-181],[-102,-159],[-91,-144],[-67,-157]],mid,edge,2);
  polygon([[58,-189],[82,-181],[102,-159],[91,-144],[67,-157]],mid,edge,2);
  const ey=-176+armSwing*.45+crossWind*18-crossSweep*12+crossDrop*25+dashPose*8,wy=-137+armSwing*.9+crossWind*20-crossSweep*25+crossDrop*54+dashPose*12;
  const elbowReach=armStretch*.46+crossSweep*25,handReach=armStretch*1.08;
  bone(-51,-193,-83+sway-elbowReach,ey,17,mid);bone(-83+sway-elbowReach,ey,-119+armSwing-handReach,wy,13,mid);
  bone(51,-193,83-sway+elbowReach,ey,17,mid);bone(83-sway+elbowReach,ey,119-armSwing+handReach,wy,13,mid);
  for(const side of [-1,1]){
   const hx=side*(119-armSwing+handReach-crossSweep*158)+crossSweep*82,hy=wy;
   polygon([[hx-side*7,hy-7],[hx+side*4,hy-13],[hx+side*17,hy-9],[hx+side*22,hy+2],[hx+side*9,hy+6]],dark,edge,1.8);
   for(let j=0;j<4;j++)bone(hx+side*j*2,hy+1,hx+side*(8+j*3),hy-10-j*1.5,3,mid);
  }
  // Layered Tengu helm with a long angular faceplate and a visible forehead chakra seal.
  polygon([[-34,-245],[-30,-263],[-13,-255],[0,-278],[13,-255],[30,-263],[34,-245],[20,-222],[-20,-222]],dark,edge,3);
  polygon([[-17,-241],[0,-252],[17,-241],[9,-224],[4,-205],[0,-199],[-4,-205],[-9,-224]],mid,hot,2.5);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=core;ctx.globalAlpha*=edo?.98:(.62+.2*Math.sin(t*.22));
  ctx.beginPath();ctx.ellipse(-11,-243,4.7,2.2,0,0,Math.PI*2);ctx.ellipse(11,-243,4.7,2.2,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=hot;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-230,9,t*.025,t*.025+Math.PI*1.5);ctx.stroke();ctx.restore();
  // Two rotating Mangekyo-inspired rings are abstract chakra marks, not physical objects.
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=edo?'#ff304e':'#ff9562';ctx.lineWidth=2.2;ctx.globalAlpha*=.62;
  for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(0,-221,13+j*5,4+j*1.6,t*.035+j*.8,0,Math.PI*2);ctx.stroke();}ctx.restore();
  // Forearm and shoulder plate highlights give Phase 2 a heavier silhouette.
  for(const side of [-1,1]){
   polygon([[side*66,-185],[side*88,-176],[side*98,-160],[side*84,-149],[side*68,-162]],dark,edge,1.8);
   bone(side*25,-112,side*34,-91,8,mid);joint(side*83,ey,4);
  }
 }
 ctx.restore();
 // Shared live hand/finger articulation and a restrained reaction ripple.
 if(recoil>.1){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=recoil*.55;ctx.strokeStyle=edge;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(0,-163,80+recoil*20,52+recoil*14,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
 drawPhaseCombatMotion(fighter,stage,edo,t,rigScale);
 // Ambient differences: living chakra is ember-like; Edo reanimation sheds paper ash and black-red flakes.
 ctx.save();
 if(edo){
  ctx.globalAlpha*=.72;ctx.fillStyle='#b2a8b7';ctx.strokeStyle='#2b0b20';ctx.lineWidth=1;
  for(let i=0;i<7;i++){const x=Math.sin(t*.055+i*2.4)*(48+i*15),y=-30-((t*1.45+i*37)%225);ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.031+i)*.9);ctx.beginPath();ctx.moveTo(-3,-5);ctx.lineTo(4,-3);ctx.lineTo(3,5);ctx.lineTo(-2,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#270711';ctx.lineWidth=2;
  for(let i=0;i<4;i++){const x=Math.sin(t*.1+i*2.3)*(55+i*17),y=-100-((t*1.8+i*43)%130);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+5,y-7);ctx.lineTo(x+2,y-13);ctx.lineTo(x+10,y-19);ctx.stroke();}
 }else{
  ctx.globalCompositeOperation='lighter';ctx.fillStyle='#ff9a62';
  for(let i=0;i<8;i++){const x=Math.sin(t*.1+i*2.1)*(35+i*14),y=-38-((t*1.8+i*29)%215);ctx.globalAlpha*=.96;ctx.beginPath();ctx.arc(x,y,1.2+(i%3)*.55,0,Math.PI*2);ctx.fill();}
 }
 ctx.restore();
 ctx.restore(); // close the full-body dash pose transform
 if(stage===0){
  // Large chakra pool at the ground intersection, overlaid on submerged bones.
  ctx.save();ctx.globalCompositeOperation='lighter';
  const pulse=1+.045*Math.sin(t*.055),poolX=0,poolY=-26;
  const pool=ctx.createRadialGradient(poolX,poolY,8,poolX,poolY,180*pulse);
  pool.addColorStop(0,edo?'rgba(149,93,255,.48)':'rgba(255,102,54,.43)');
  pool.addColorStop(.38,edo?'rgba(113,58,235,.32)':'rgba(255,63,34,.30)');
  pool.addColorStop(.72,edo?'rgba(86,43,190,.16)':'rgba(183,35,26,.17)');
  pool.addColorStop(1,'rgba(18,4,22,0)');
  ctx.fillStyle=pool;ctx.beginPath();ctx.ellipse(poolX,poolY,180*pulse,31*pulse,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=edo?'rgba(200,170,255,.84)':'rgba(255,165,103,.82)';ctx.lineWidth=2.6;
  for(let i=0;i<3;i++){ctx.globalAlpha=.65-i*.14;ctx.beginPath();ctx.ellipse(poolX,poolY,86+i*37+Math.sin(t*.04+i)*5,10+i*5,0,0,Math.PI*2);ctx.stroke();}
  ctx.globalAlpha=.6;ctx.strokeStyle=edo?'#9b74ff':'#ff6a35';ctx.lineWidth=2;
  for(let i=0;i<11;i++){const a=(Math.PI*2*i/11)+t*.012,rx=92+(i%4)*19,ry=9+(i%3)*4;ctx.beginPath();ctx.moveTo(Math.cos(a)*rx,poolY+Math.sin(a)*ry);ctx.lineTo(Math.cos(a)*(rx+16),poolY+Math.sin(a)*(ry+3));ctx.stroke();}
  ctx.restore();
 }
}
function drawPhaseCombatMotion(f,stage,edo,t,rigScale){
 const id=f&&f.itachiPhaseSkillKey;if(!id)return;
 const n=f.moveFrame||0,d=f.facing||1,edoX=id==='edo_p1_skeletal_x',hot=edoX?'#9c78ff':(edo?'#bd243f':'#f05232'),edge=edoX?'#e4d6ff':(edo?'#ff5267':'#ffb17a'),dark=edoX?'#24143f':(edo?'#300817':'#451016');
 const smooth=q=>{q=clamp(q,0,1);return q*q*(3-2*q);};
 const path=(pts,w,color,alpha)=>{ctx.save();ctx.globalAlpha*=alpha===undefined?1:alpha;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=dark;ctx.lineWidth=w+7;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();ctx.strokeStyle=color||hot;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();ctx.strokeStyle=edge;ctx.lineWidth=Math.max(1,w*.14);ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0]-1,pts[i][1]-1);ctx.stroke();ctx.restore();};
 const ring=(x,y,rx,ry,color,w,alpha,rot)=>{ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=alpha===undefined?1:alpha;ctx.strokeStyle=color||edge;ctx.lineWidth=w||3;ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2);ctx.stroke();ctx.restore();};
 const glow=(x,y,r,color,alpha)=>{ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=alpha===undefined?.8:alpha;ctx.fillStyle=color||hot;ctx.beginPath();ctx.arc(x,y,r*2,0,Math.PI*2);ctx.fill();ctx.globalAlpha*=.45;ctx.beginPath();ctx.arc(x,y,r*.7,0,Math.PI*2);ctx.fill();ctx.restore();};
 if(id==='p1_bones'){
   // Ordinary Itachi Z: skeletal Susanoo winds up, extends one articulated arm, then hammers the target.
   const wind=smooth(n/22),extend=smooth((n-20)/25),slam=smooth((n-43)/14),retract=smooth((n-70)/24);
   const target=f.opp;
   const rigAdvance=Number.isFinite(f.itachiSusanooRigLunge)?f.itachiSusanooRigLunge:0;
   const rigRearOffset=(f.itachiEdo?43:39)*(f.itachiSusanooPhase===3?(f.itachiEdo?1.88:1.64):(f.itachiSusanooPhase===1?(f.itachiEdo?2.03:1.98):(f.itachiEdo?2.12:2.06)));
   const targetDistance=target&&Number.isFinite(target.x)?clamp((((target.x-f.x)*(f.facing||1))-rigAdvance+rigRearOffset)/Math.max(.8,rigScale||1),78,250):175;
   const reach=targetDistance,shoulder=[38,-204];
   const elbow=[lerp(42,reach*.56,extend),lerp(-203,-157,extend)+slam*22+retract*28];
   const handX=lerp(34,reach+8,extend),handY=lerp(-188,-116,extend)+slam*112+retract*(-48),wrist=[handX,handY];
   const fistClose=smooth((n-38)/12)*(1-smooth((n-69)/12));
   ctx.save();ctx.globalAlpha*=n<95?1:Math.max(0,1-(n-95)/22);
   if(n<28){
    ring(14,-177,25+wind*42,18+wind*24,edge,2.5,.35+wind*.35,t*.018);ring(14,-177,18+wind*28,12+wind*17,hot,1.7,.5,t*-.02);
    for(let i=0;i<6;i++){const a=t*.035+i*Math.PI/3;path([[14+Math.cos(a)*23,-177+Math.sin(a)*15],[14+Math.cos(a)*(45+wind*18),-177+Math.sin(a)*(29+wind*8)]],2.1,edge,.6*wind);}
   }
   path([shoulder,elbow],31,dark,.98);path([shoulder,elbow],23,hot,.98);path([[shoulder[0],shoulder[1]-2],[elbow[0],elbow[1]-2]],3.2,edge,.78);glow(elbow[0],elbow[1],15,edge,.78);
   path([elbow,wrist],26,dark,.98);path([elbow,wrist],18,hot,.98);path([[elbow[0],elbow[1]-2],[wrist[0],wrist[1]-2]],2.8,edge,.8);glow(wrist[0],wrist[1],18,edge,.85);
   ctx.save();ctx.translate(wrist[0],wrist[1]);ctx.rotate(-.08+slam*.3-retract*.2);
   ctx.fillStyle=dark;ctx.strokeStyle=edge;ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(-15,-14);ctx.lineTo(22,-17);ctx.lineTo(34,0);ctx.lineTo(26,23);ctx.lineTo(-15,20);ctx.lineTo(-24,3);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle=hot;ctx.globalAlpha*=.92;ctx.beginPath();ctx.moveTo(-10,-10);ctx.lineTo(19,-12);ctx.lineTo(27,1);ctx.lineTo(20,16);ctx.lineTo(-10,14);ctx.lineTo(-17,2);ctx.closePath();ctx.fill();
   for(let i=0;i<4;i++){const fx=8+i*7,curl=fistClose*9;path([[fx,-10],[fx+3,-23+curl],[fx+8,-25+curl]],4.8,edge,.98);glow(fx+7,-24+curl,2.4,edge,.8);}
   path([[-13,2],[-27,9],[-22,18],[-9,13]],5.5,edge,.95);ctx.restore();
   if(n>=43&&n<=82){
    const q=smooth((n-43)/15),alpha=(1-smooth((n-68)/14))*(n<57?0.65:1),gx=reach+4,gy=-7+slam*12;
    ring(gx,gy,24+q*138,10+q*39,edge,4.5,alpha);ring(gx,gy,42+q*172,16+q*53,hot,2.3,alpha*.78);
    for(let i=0;i<9;i++){const a=i*Math.PI*2/9,inner=20+q*18,outer=58+q*120;path([[gx+Math.cos(a)*inner,gy+Math.sin(a)*inner*.45],[gx+Math.cos(a)*outer,gy+Math.sin(a)*outer*.52]],2.5,edge,alpha*.8);}
    if(n>=55&&n<=67){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=1-(n-55)/12;ctx.fillStyle='rgba(255,203,144,.24)';ctx.beginPath();ctx.ellipse(gx,gy,70,31,0,0,Math.PI*2);ctx.fill();ctx.restore();}
   }
   for(let i=0;i<7;i++){const age=(n+i*5)%24,xx=lerp(shoulder[0],wrist[0],i/7)+Math.sin(t*.15+i*2)*5,yy=lerp(shoulder[1],wrist[1],i/7)-age*.8;ctx.save();ctx.globalAlpha*=clamp(1-age/24,0,1)*(.4+slam*.6);ctx.fillStyle=i%2?edge:hot;ctx.translate(xx,yy);ctx.rotate(t*.04+i);ctx.fillRect(-2,-4,4,8);ctx.restore();}
   ctx.restore();
}else if(id==='p1_skeletal_x'||id==='edo_p1_skeletal_x'){
  const edoX=id==='edo_p1_skeletal_x';
  const wind=smooth(n/(edoX?27:20))*(1-smooth((n-(edoX?29:23))/9));
  const cross=smooth((n-(edoX?27:21))/(edoX?13:11))*(1-smooth((n-(edoX?49:43))/10));
  const recoil=smooth((n-(edoX?48:42))/8)*(1-smooth((n-(edoX?61:53))/8));
  const drop=smooth((n-(edoX?63:56))/(edoX?10:9))*(1-smooth((n-(edoX?81:73))/12));
  const fade=n<(edoX?105:92)?1:Math.max(0,1-(n-(edoX?105:92))/(edoX?27:26));
  ctx.save();ctx.globalAlpha*=fade;
  const bone=(pts,w,c,a)=>path(pts,w,c,a===undefined?.98:a);
  const forward=edoX?184:164;
  const shoulderL=[-42,-207],shoulderR=[42,-207];
  const elbowL=[-42+wind*20+cross*86+drop*15,-194+wind*8+cross*28+drop*28];
  const elbowR=[42-wind*8+cross*64+drop*18,-194+wind*8+cross*22+drop*28];
  const handL=[-18+wind*5+cross*forward+drop*10,-168+wind*7+cross*12+drop*98];
  const handR=[22-wind*4+cross*(forward+18)+drop*10,-164+wind*4-cross*24+drop*104];
  ring(12,-171,27+wind*62,18+wind*37,edge,2.7,.3+wind*.55,t*.02);
  ring(12,-171,18+wind*43,12+wind*25,hot,1.8,.4+wind*.5,-t*.025);
  for(let i=0;i<7;i++){const a=t*.04+i*Math.PI*2/7;path([[12+Math.cos(a)*22,-171+Math.sin(a)*14],[12+Math.cos(a)*(40+wind*42),-171+Math.sin(a)*(26+wind*26)]],2.1,edge,.35+wind*.5);}
  for(const side of [-1,1]){
    const sh=side<0?shoulderL:shoulderR,el=side<0?elbowL:elbowR,hand=side<0?handL:handR;
    bone([sh,el],31,dark);bone([sh,el],21,hot);bone([el,hand],27,dark);bone([el,hand],17,hot);
    bone([[sh[0],sh[1]-2],[el[0],el[1]-2]],3.1,edge,.8);bone([[el[0],el[1]-2],[hand[0],hand[1]-2]],2.6,edge,.85);
    glow(el[0],el[1],13,edge,.8);glow(hand[0],hand[1],16,edge,.9);
    ctx.save();ctx.translate(hand[0],hand[1]);ctx.rotate(-.12+cross*.25+drop*.24);
    ctx.fillStyle=dark;ctx.strokeStyle=edge;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-15,-13);ctx.lineTo(18,-15);ctx.lineTo(30,0);ctx.lineTo(23,21);ctx.lineTo(-15,18);ctx.closePath();ctx.fill();ctx.stroke();
    for(let j=0;j<4;j++)bone([[7+j*4,-9],[12+j*4,-22+drop*7]],4.5,edge);
    bone([[-12,2],[-23,10],[-16,17]],5,edge);ctx.restore();
  }
  const hitQ=smooth((n-(edoX?39:31))/(edoX?9:8));
  if(n>=(edoX?39:31)&&n<=(edoX?55:48)){
    ring(forward+drop*20,-70+drop*8,38+hitQ*106,16+hitQ*35,edge,3.8,fade*.9,t*.035);
    ring(forward+drop*20,-62+drop*8,54+hitQ*137,21+hitQ*42,hot,2.2,fade*.75,-t*.03);
    for(let j=0;j<7;j++){const y=-125+j*18;path([[forward-34,y],[forward+90+hitQ*42,y-9]],2.5,edge,fade*.72);}
  }
  if(n>=(edoX?62:55)&&n<=(edoX?82:74)){
    const impactQ=smooth((n-(edoX?68:61))/5);
    ring(forward+18,-8,42+impactQ*135,12+impactQ*44,edge,4,fade*.9,t*.025);
    ring(forward+18,-8,65+impactQ*175,18+impactQ*58,hot,2.5,fade*.72,-t*.022);
    for(let j=0;j<9;j++){const a=j*Math.PI*2/9;path([[forward+18+Math.cos(a)*35,-7+Math.sin(a)*7],[forward+18+Math.cos(a)*(90+impactQ*130),-7+Math.sin(a)*(18+impactQ*24)]],2.6,edge,fade*.78);}
  }
  if(edoX&&n>=53&&n<=84){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade*.8;ctx.strokeStyle='#c6a8ff';ctx.lineWidth=3.5;for(let j=0;j<7;j++){ctx.beginPath();ctx.moveTo(18+j*17,-193);ctx.lineTo(128+j*18,10+drop*28);ctx.stroke();}ctx.restore();}
  if(recoil>.02){ctx.save();ctx.globalAlpha*=recoil*.6;ring(0,-152,78+recoil*44,48+recoil*18,edge,2.4,.65);ctx.restore();}
  ctx.restore();
 }else if(id==='edo_phase1_grasp'){
  // Oversized foreground hand: the underground arm clearly rises through a cracked seal and clamps down.
  const rise=smooth((n-8)/42),close=smooth((n-65)/35),slam=smooth((n-105)/16);
  const fade=n<126?1:Math.max(0,1-(n-126)/24);
  const worldDx=(f.opp&&Number.isFinite(f.opp.x)?(f.opp.x-f.x)*d:220);
  const tx=clamp(worldDx/Math.max(.8,rigScale||1),95,245);
  const palmY=38-rise*178+slam*48,palmW=36+close*17;
  ctx.save();ctx.globalAlpha*=fade;
  ctx.globalCompositeOperation='source-over';
  // Ground hole + bright fracture ring.
  ctx.fillStyle='rgba(15,2,12,.9)';ctx.beginPath();ctx.ellipse(tx,2,68+rise*20,14+rise*5,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ff536d';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(tx,1,74+rise*22,16+rise*6,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#6c102c';ctx.lineWidth=11;ctx.beginPath();ctx.ellipse(tx,1,56+rise*18,10+rise*4,0,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<8;i++){const ang=i*Math.PI/4;path([[tx+Math.cos(ang)*48,Math.sin(ang)*7],[tx+Math.cos(ang)*95,Math.sin(ang)*12-4]],3,edge,.98);}
  // Two glowing sides of the giant forearm connect the hand to the hole.
  path([[tx-25,40],[tx-24,10],[tx-19,palmY+34],[tx-10,palmY+12]],36,dark,.99);
  path([[tx-25,40],[tx-24,10],[tx-19,palmY+34],[tx-10,palmY+12]],22,hot,.99);
  path([[tx+24,40],[tx+22,10],[tx+17,palmY+31],[tx+10,palmY+12]],34,dark,.99);
  path([[tx+24,40],[tx+22,10],[tx+17,palmY+31],[tx+10,palmY+12]],20,hot,.99);
  // Oversized palm, knuckles and five distinct fingers.
  ctx.beginPath();ctx.ellipse(tx,palmY,palmW,29,0,0,Math.PI*2);ctx.fillStyle=dark;ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=5;ctx.stroke();
  ctx.beginPath();ctx.ellipse(tx,palmY,palmW-8,20,0,0,Math.PI*2);ctx.strokeStyle=hot;ctx.lineWidth=3;ctx.stroke();
  for(let finger=0;finger<5;finger++){
   const spread=(finger-2)*20,fan=spread*(1-close*.83);
   const baseX=tx+spread*.45,midX=tx+fan*.88,tipX=tx+fan;
   const baseY=palmY-10,midY=palmY-47-rise*5+close*24,tipY=palmY-70-rise*9+close*(finger===2?47:59)+slam*8;
   path([[baseX,baseY],[midX,midY],[tipX,tipY]],14,dark,.99);
   path([[baseX,baseY],[midX,midY],[tipX,tipY]],7,hot,.99);
   path([[baseX-2,baseY-2],[midX-2,midY-3],[tipX-2,tipY-2]],2.1,edge,.98);
   glow(tipX,tipY,8,edge,.95);
  }
  if(n>62){
   const q=smooth((n-62)/38);ctx.globalCompositeOperation='lighter';
   ring(tx,palmY-5,42+q*78,19+q*30,edge,4,.95,t*.018);
   ring(tx,palmY-5,57+q*95,25+q*38,hot,2.4,.8,-t*.022);
   for(let i=0;i<7;i++){const ang=i*Math.PI/3.5+t*.012,rr=38+q*80;path([[tx+Math.cos(ang)*rr,2+Math.sin(ang)*5],[tx+Math.cos(ang)*(rr+25),2+Math.sin(ang)*9]],3,edge,.9);}
  }
  // Fixed-count paper talismans, no unbounded particle emitter.
  ctx.globalCompositeOperation='source-over';
  for(let i=0;i<7;i++){const ax=tx+Math.sin(t*.055+i*2.4)*(34+i*13),ay=-25-((t*1.2+i*29)%165);ctx.save();ctx.translate(ax,ay);ctx.rotate(t*.025+i);ctx.fillStyle='#d5c7d2';ctx.globalAlpha*=.78;ctx.fillRect(-3,-6,6,10);ctx.strokeStyle='#6c102c';ctx.lineWidth=1;ctx.strokeRect(-3,-6,6,10);ctx.restore();}
  ctx.restore();
}else if(id==='edo_phase1_rift'){
  // Crow Rift Collapse: a vanishing silhouette, three offset rupture planes, then a converging crimson burst.
  const vanish=1-smooth(n/19),returning=smooth((n-18)/10),collapse=smooth((n-52)/16),fade=n<74?1:Math.max(0,1-(n-74)/30);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
  // Ash vortex around the caster, unlike the normal phase's orb volley.
  for(let layer=0;layer<4;layer++){
   const rr=22+layer*13+n*.48;
   ctx.save();ctx.rotate(t*.025*(layer%2?1:-1)+layer*.5);
   ctx.beginPath();ctx.ellipse(0,-105,rr,rr*.72,0,Math.PI*.12,Math.PI*1.72);
   ctx.strokeStyle=layer%2?edge:hot;ctx.lineWidth=layer===0?4:1.8;ctx.stroke();ctx.restore();
  }
  ctx.globalAlpha*=Math.max(.08,vanish);
  for(let i=0;i<12;i++){const a=i*2.399+t*.06,rr=20+(n%20)*2.4;glow(Math.cos(a)*rr,-100+Math.sin(a)*rr,2+(i%3),edge,.65);}
  ctx.globalAlpha*=Math.max(.1,returning);
  if(n>25){
   const tx=clamp(((f.opp&&Number.isFinite(f.opp.x)?f.opp.x:f.x+d*260)-f.x)*d,100,480),ty=-112;
   for(let plane=0;plane<3;plane++){
    const q=smooth((n-(28+plane*8))/10),spread=24+q*94;
    ctx.save();ctx.translate(tx,ty+(plane-1)*18);ctx.rotate((plane-1)*.55+t*.01);
    ctx.beginPath();ctx.moveTo(-spread,-spread*.55);ctx.lineTo(-spread*.35,-spread*.12);ctx.lineTo(0,-spread*.82);ctx.lineTo(spread*.28,-spread*.1);ctx.lineTo(spread,spread*.52);
    ctx.strokeStyle=dark;ctx.lineWidth=12;ctx.stroke();ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.stroke();ctx.restore();
   }
   for(let j=0;j<3;j++){const q=smooth((n-(42+j*11))/13),rr=(1-q)*74+q*18;ring(tx,ty,rr+j*8,rr*.58+j*5,j===1?hot:edge,3,fade*.9,t*.03+j);}
   if(n>58){const q=smooth((n-58)/12);ctx.globalAlpha*=q;for(let i=0;i<12;i++){const a=i*2.399+t*.025,rr=20+q*94;path([[tx+Math.cos(a)*rr,ty+Math.sin(a)*rr*.58],[tx+Math.cos(a)*(rr+18),ty+Math.sin(a)*(rr+16)*.58]],2.8,edge,.9);}}
  }
  ctx.restore();
 }else if(id==='p1_magatama'){
  const charge=1-smooth(n/38),release=smooth((n-34)/14),fade=n<42?1:Math.max(0,1-(n-42)/43);
  const cx=88+charge*18,cy=-203-charge*28;
  if(edo){
   // Edo X: three independent magatama orbit in a triangular seal, then peel away as a staggered volley.
   const charge=1-smooth(n/34),release=smooth((n-30)/20),fade=n<58?1:Math.max(0,1-(n-58)/36);
   const cx=76+charge*10,cy=-184;
   ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
   ring(cx,cy,28+charge*9,43+charge*8,edge,2.8,.9,t*.025);
   ring(cx,cy,39+charge*10,54+charge*7,hot,1.6,.72,-t*.02);
   for(let bead=0;bead<3;bead++){
    const a=t*.12+bead*Math.PI*2/3,bx=cx+Math.cos(a)*(27+charge*10),by=cy+Math.sin(a)*(38+charge*9);
    ctx.save();ctx.translate(bx,by);ctx.rotate(a+t*.03);
    ctx.beginPath();ctx.moveTo(-10,0);ctx.quadraticCurveTo(-7,-13,5,-10);ctx.quadraticCurveTo(15,-2,7,9);ctx.quadraticCurveTo(-4,13,-10,0);ctx.closePath();
    ctx.fillStyle='rgba(120,12,40,.92)';ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=3;ctx.stroke();glow(0,0,6,hot,.95);ctx.restore();
   }
   if(n>30){for(let bead=0;bead<3;bead++){const q=smooth((n-(34+bead*8))/10),x=83+q*(52+bead*10),y=cy+(bead-1)*30;ring(x,y,10,15,edge,2.2,q*.9,t*.08);}}
   if(n>48){const q=smooth((n-48)/12);for(let i=0;i<5;i++){const a=i*2.399+t*.03,rr=28+q*55;glow(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,2.4,edge,.6*fade);}}
   ctx.restore();
  }
  if(!edo){
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=n<34?1:fade;
  for(let i=0;i<3;i++){
   const a=t*.17+i*Math.PI*2/3,x=cx+Math.cos(a)*19,y=cy+Math.sin(a)*13;
   ctx.strokeStyle=dark;ctx.lineWidth=8;ctx.beginPath();ctx.arc(x,y,11,a,a+Math.PI*1.5);ctx.stroke();
   ctx.strokeStyle=edge;ctx.lineWidth=3.5;ctx.beginPath();ctx.arc(x,y,11,a,a+Math.PI*1.5);ctx.stroke();glow(x,y,7,hot,.9);
  }
  path([[cx-17,cy],[cx,cy-7],[cx+18,cy],[cx,cy+8],[cx-17,cy]],2.5,edge,.9);
  if(n>30){for(let j=0;j<3;j++){const x=35+release*(120+j*20),y=-207+j*24+Math.sin(t*.18+j)*7;ctx.save();ctx.translate(x,y);ctx.rotate(t*.16+j);ctx.beginPath();ctx.moveTo(-9,0);ctx.quadraticCurveTo(-4,-13,8,-8);ctx.quadraticCurveTo(15,0,3,10);ctx.quadraticCurveTo(-6,9,-9,0);ctx.fillStyle=hot;ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=2;ctx.stroke();ctx.restore();}}
  ctx.restore();
  }
 }else if(id==='p2_seal'){
  const charge=smooth(n/48),sweep=smooth((n-48)/28),fade=n<106?1:Math.max(0,1-(n-106)/42);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
  // Wide chakra crescent and nested sealing rings, with no physical blade.
  ctx.strokeStyle=dark;ctx.lineWidth=56;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(18,-204);ctx.bezierCurveTo(58,-282,162,-278,220,-184);ctx.bezierCurveTo(260,-121,245,-76,212,-55);ctx.stroke();
  ctx.strokeStyle=hot;ctx.lineWidth=35;ctx.beginPath();ctx.moveTo(18,-204);ctx.bezierCurveTo(58,-282,162,-278,220,-184);ctx.bezierCurveTo(260,-121,245,-76,212,-55);ctx.stroke();
  ctx.strokeStyle=edge;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(18,-204);ctx.bezierCurveTo(58,-282,162,-278,220,-184);ctx.bezierCurveTo(260,-121,245,-76,212,-55);ctx.stroke();
  const sx=145+sweep*85,sy=-140+sweep*40;
  for(let i=0;i<4;i++)ring(sx,sy,22+i*17+charge*9,14+i*11+charge*5, i%2?hot:edge, i===0?3:1.8,.8*fade,t*.02+i*.45);
  for(let i=0;i<10;i++){const q=i/9,x=28+q*220,y=-255+q*183+Math.sin(t*.17+i)*7;glow(x,y,3+i%3,edge,.68*fade);}
  ctx.restore();
 }else if(id==='edo_phase2_eclipse'){
  // Black Ash Eclipse: a remote black sun grows above the opponent and collapses in stacked shock-rings.
  const tx=clamp(((f.opp&&Number.isFinite(f.opp.x)?f.opp.x:f.x+d*300)-f.x)*d,130,520),ty=-155;
  const open=smooth(n/35),collapse=smooth((n-64)/22),fade=n<94?1:Math.max(0,1-(n-94)/36);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
  // Distinct eclipse disc, angular corona and inward falling ash ribbons.
  ctx.save();ctx.translate(tx,ty);ctx.rotate(t*.012);
  ctx.beginPath();ctx.arc(0,0,20+open*39,0,Math.PI*2);ctx.fillStyle='rgba(5,2,10,'+(.65+collapse*.2)+')';ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.stroke();
  for(let i=0;i<12;i++){const a=i*Math.PI/6+t*.018,inner=48+open*18,outer=80+open*35;path([[Math.cos(a)*inner,Math.sin(a)*inner],[Math.cos(a+.09)*outer,Math.sin(a+.09)*outer]],i%3===0?4:2, i%2?hot:edge,.9);}
  ctx.restore();
  for(let layer=0;layer<5;layer++){
   const rr=(52+layer*22)*(1-collapse)+collapse*(14+layer*8);
   ctx.save();ctx.translate(tx,ty);ctx.rotate((layer%2?1:-1)*(t*.02+n*.006));
   ctx.beginPath();ctx.ellipse(0,0,rr,rr*(.42+layer*.04),0,0,Math.PI*2);
   ctx.strokeStyle=layer%2?hot:edge;ctx.lineWidth=layer===0?5:2.1;ctx.stroke();ctx.restore();
  }
  if(n>35){for(let i=0;i<10;i++){const q=(i/10),a=i*2.399+t*.025,rr=118-(n%24)*2.4;path([[tx+Math.cos(a)*rr,ty+Math.sin(a)*rr*.5],[tx+Math.cos(a)*(rr-20),ty+Math.sin(a)*(rr-12)*.5]],2.2,edge,.75);}}
  if(n>61){const q=smooth((n-61)/20);ring(tx,ty,36+q*175,20+q*82,edge,5,q,t*.025);ring(tx,ty,50+q*195,28+q*94,hot,2.4,q*.82,-t*.018);}
  ctx.restore();
 }else if(id==='p2_guard'){
  const guard=smooth(n/12),counter=smooth((n-82)/12),fade=n<110?1:Math.max(0,1-(n-110)/28);
  const sx=112,sy=-150;
  if(edo){
   // Edo X: Black Ash Eclipse. A remote seal opens around the opponent and contracts into a crimson-black implosion.
   const tx=clamp(((f.opp&&Number.isFinite(f.opp.x)?f.opp.x:f.x+d*270)-f.x)*d,145,470),ty=-105;
   const charge=smooth(n/38),collapse=smooth((n-57)/31),fade=n<95?1:Math.max(0,1-(n-95)/39);
   if(!edo){
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
   for(let layer=0;layer<4;layer++){
    const rr=(72+layer*24)*(1-collapse)+collapse*(18+layer*8);
    ctx.save();ctx.translate(tx,ty);ctx.rotate((layer%2?1:-1)*(t*.025+n*.012));
    ctx.beginPath();ctx.ellipse(0,0,rr,rr*(.52+layer*.035),0,0,Math.PI*2);
    ctx.strokeStyle=layer%2?hot:edge;ctx.lineWidth=layer===0?5:2.2;ctx.stroke();ctx.restore();
   }
   ctx.save();ctx.translate(tx,ty);ctx.rotate(-t*.02);
   ctx.beginPath();ctx.arc(0,0,28+charge*16,0,Math.PI*2);ctx.fillStyle='rgba(10,3,12,'+(.35+collapse*.45)+')';ctx.fill();
   ctx.strokeStyle=edge;ctx.lineWidth=3.5;ctx.stroke();
   for(let j=0;j<8;j++){const a=j*Math.PI/4+t*.03,inner=24+collapse*28,outer=74*(1-collapse)+collapse*33;path([[Math.cos(a)*inner,Math.sin(a)*inner],[Math.cos(a+.14)*outer,Math.sin(a+.14)*outer]],3,edge,.85);}
   ctx.restore();
   if(n>55){for(let j=0;j<7;j++){const a=j*2.399+t*.04,rr=18+(1-collapse)*90;glow(tx+Math.cos(a)*rr,ty+Math.sin(a)*rr*.55,2.5,edge,.75*fade);}}
   if(n>82){ring(tx,ty,40+collapse*90,20+collapse*45,edge,4,collapse*.85,t*.03);}
   ctx.restore();
  }
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=fade;
  ctx.translate(sx,sy);ctx.rotate(Math.sin(t*.035)*.035);
  ctx.beginPath();ctx.moveTo(0,-70);ctx.lineTo(46,-48);ctx.lineTo(55,-8);ctx.lineTo(38,39);ctx.lineTo(0,63);ctx.lineTo(-38,39);ctx.lineTo(-55,-8);ctx.lineTo(-46,-48);ctx.closePath();
  ctx.fillStyle=edo?'rgba(128,20,54,.42)':'rgba(255,91,55,.32)';ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.stroke();
  for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(0,-2,63+i*12+guard*5,76+i*13+guard*5,t*.02+i*.6,0,Math.PI*2);ctx.strokeStyle=i===1?hot:edge;ctx.lineWidth=i===1?3:1.6;ctx.stroke();}
  for(let i=0;i<6;i++){const a=t*.06+i*Math.PI/3;path([[Math.cos(a)*20,Math.sin(a)*24],[Math.cos(a)*(55+counter*90),Math.sin(a)*(62+counter*25)]],2.5,edge,.7+counter*.3);}
  ctx.restore();
  if(n>78&&n<118){
   const q=smooth((n-78)/16),spread=34+q*185;
   ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=counter*.62;
   ctx.beginPath();ctx.moveTo(47,-176);ctx.lineTo(160,-176-spread*.22);ctx.quadraticCurveTo(250,-145,160,-114+spread*.18);ctx.lineTo(47,-128);ctx.closePath();
   ctx.fillStyle=edo?'rgba(187,27,66,.42)':'rgba(255,93,52,.38)';ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=3.5;ctx.stroke();
   ctx.restore();
   ring(180,-145,30+counter*170,16+counter*80,edge,5,counter*.9);ring(180,-145,46+counter*190,24+counter*90,hot,2.4,counter*.8);
   for(let j=0;j<5;j++){const yy=-166+j*10;path([[65,yy],[110+q*80,yy+(j-2)*5]],2.2,edge,.65*counter);}
  }
  }
 }
 if(edo&&(n%4===0)){ctx.save();ctx.globalAlpha*=.55;ctx.fillStyle='#b6a9b9';for(let i=0;i<5;i++){const x=Math.sin(t*.14+i*2.5)*(25+i*14),y=-70-((t*2+i*27)%170);ctx.save();ctx.translate(x,y);ctx.rotate(t*.03+i);ctx.fillRect(-2,-4,4,7);ctx.restore();}ctx.restore();}
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
  ctx.fillStyle='#fff0dd';ctx.font='11px sans-serif';ctx.fillText((f.isP2?'NUM 1':'1')+' M1  TOTSUKA  ·  '+(f.isP2?'NUM +':'Z')+' PHASE SKILL  ·  '+(f.isP2?'NUM /':'X')+' SEAL',x+12,y+37);
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
    // Phase-1 Grave Slam moves the giant Susanoo rig independently of Itachi.
    let rigLunge=0;
    if(f.itachiPhaseSkillKey==='p1_bones'||f.itachiPhaseSkillKey==='p1_skeletal_x'||f.itachiPhaseSkillKey==='edo_p1_skeletal_x'){
      const frame=f.moveFrame||0,target=f.opp;
      const dist=target&&Number.isFinite(target.x)?Math.abs(target.x-f.x):280;
      const xSkill=f.itachiPhaseSkillKey==='p1_skeletal_x'||f.itachiPhaseSkillKey==='edo_p1_skeletal_x';
      const reach=clamp(dist+backOffset-(xSkill?35:65),100,520);
      const charge=smooth(frame/(xSkill?19:5));
      const hold=1-smooth((frame-(xSkill?(f.itachiEdo?72:64):48))/18);
      const returnPhase=smooth((frame-(xSkill?(f.itachiEdo?86:78):70))/15);
      rigLunge=reach*charge*Math.max(hold,0)*(1-returnPhase);
    }
    f.itachiSusanooRigLunge=rigLunge;
    drawSusanooRig(f,f.x-face*backOffset+face*rigLunge,baseY,size,tick(),1,'battle');
  }
  return previousDrawFighter.apply(this,arguments);
};
if(typeof previousReset==='function')window.resetFighter=function(f){
  if(f&&f.id==='itachi'){
    f.itachiSusanooActive=false;f.itachiSusanooPending=false;f.itachiSusanooAction='';f.itachiSusanooMarks={};f.itachiYataUntil=0;f.itachiSusanooFrames=0;f.itachiSusanooPhase=3;f.itachiYataCounterUsed=false;f.itachiSusanooExhausted=false;
  }
  return previousReset.apply(this,arguments);
};
if(typeof previousStep==='function')window.step=function(){
  const r=previousStep.apply(this,arguments);
  for(const f of fighters()){
    if(!f||f.id!=='itachi')continue;
    if(!Number.isFinite(f.itachiSusanooPhase))f.itachiSusanooPhase=3;
    if(f.itachiSusanooPending&&!f.itachiSusanooExhausted&&!Q.cinema&&f.moveKey!=='ult'&&!f.move){
      f.itachiSusanooPending=false;f.itachiSusanooActive=true;f.itachiSusanooAction='';f.itachiSusanooFrames=1200;f.itachiSusanooPhase=1;f.itachiYataUntil=0;f.itachiYataCounterUsed=false;
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
      if(!f.itachiEdo){const hpCap=Math.max(1,Number(f.maxHp)||200),floorHp=hpCap*.05;if(f.hp<=floorHp+.045){f.hp=floorHp;f.itachiSusanooActive=false;f.itachiSusanooAction='';f.itachiYataUntil=0;f.itachiSusanooFrames=0;f.itachiSusanooExhausted=true;f.itachiPhaseSkillKey='';f.itachiPhaseSkillUsed=false;f.itachiGravehandPose='';f.move=null;f.moveKey=null;f.moveFrame=0;f.state='IDLE';f.stateFrame=0;f.itachiPoseKey='';fx('shock',f.x,f.y-70,38);fx('crows',f.x,f.y-90,28);if(typeof window.floatText==='function')window.floatText(f.x,f.y-208,'SUSANOO EXHAUSTED · 5% HP','#ffb0c4',13,50);if(typeof flash==='function')flash(.18,'#bd5960');}else f.hp=Math.max(floorHp,f.hp-.045);}
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
// Old Itachi listeners are patched separately for X and P2's numpad-plus Z binding.
addEventListener('keydown',function(e){
  if(typeof G==='undefined'||G.mode==='menu'||G.paused)return;
  const f=currentOwnerForCode(e.code);if(!f)return;
  if(e.repeat){e.preventDefault();e.stopImmediatePropagation();return;}
  let key=null;
  if(e.code==='Digit1'||e.code==='Numpad1')key='m1';
  else if(e.code==='KeyZ'||e.code==='NumpadAdd')key='z';
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