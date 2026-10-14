/* ITACHI SUSANOO FORM REBUILD v1
   Persistent articulated Susanoo, awakening cinematic, M1 / Z / X moves.
   Lightweight Canvas 2D rig designed for low-end PCs. */
(function(){
'use strict';
if(window.__JFF_ITACHI_SUSANOO_FORM_V1__)return;
const Q=window.JFF_ITACHI_REBOOT;
if(!Q){console.warn('[Susanoo] Itachi controller missing');return;}
window.__JFF_ITACHI_SUSANOO_FORM_V1__=true;
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
window.JFF_ITACHI_SUSANOO_FORM={ready:true,activate:activate,version:1};
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
function drawSusanooRig(f,x,baseY,scale,phase,alpha,sceneMode){
  if(typeof ctx==='undefined')return;
  const t=phase||0,k=sceneMode==='awakening'?'ult':(f&&f.moveKey||''),n=f&&f.moveFrame||0;
  const prog=alpha===undefined?1:clamp(alpha,0,1);
  ctx.save();ctx.globalAlpha*=prog;ctx.translate(x,baseY);ctx.scale((f&&(f.facing||1)<0?-1:1)*scale,scale);
  const bob=Math.sin(t*.075)*2,breath=Math.sin(t*.055)*2.4;
  const heavy=k==='sus_m1',guard=k==='sus_z',thrust=k==='sus_x',awakening=sceneMode==='awakening';
  // Shadow and chakra silhouette behind the fighter.
  const aura=ctx.createRadialGradient(0,-155,18,0,-155,194);aura.addColorStop(0,'rgba(255,119,77,.20)');aura.addColorStop(.5,'rgba(197,37,60,.11)');aura.addColorStop(1,'rgba(90,6,28,0)');
  ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(0,-155,178,205,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,126,89,.18)';ctx.lineWidth=2.2;
  for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(0,-112,72+i*16,31+i*9,0,Math.PI*(.1+i*.13)+t*.002,Math.PI*(1.05+i*.17)+t*.002);ctx.stroke();}
  ctx.restore();
  // Legs and split greaves. The silhouette shares the fighter's feet so it never floats.
  const legLift=(f&&f.state==='WALK')?Math.sin(t*.24)*7:0;
  armorLimb([-25,-91],[-31+legLift*.35,-42],15,'#ff9a65');
  armorLimb([25,-91],[31-legLift*.35,-42],15,'#d85349');
  polygon([[-43,-55],[-18,-59],[-13,-28],[-48,-25]],'#5a162b','#210711',3);
  polygon([[18,-59],[43,-55],[48,-25],[13,-28]],'#7a2035','#210711',3);
  ctx.fillStyle='#211018';ctx.beginPath();ctx.ellipse(-33,-18,23,8,-.08,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(33,-18,23,8,.08,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ed8562';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-47,-20);ctx.lineTo(-17,-20);ctx.moveTo(17,-20);ctx.lineTo(47,-20);ctx.stroke();
  // Articulated hips, ribbed breastplate, and layered abdominal armor.
  polygon([[-48,-128],[-37,-102],[-25,-91],[0,-86],[25,-91],[37,-102],[48,-128],[31,-148],[-31,-148]],'#421225','#16060d',4);
  polygon([[-50,-204],[-76,-218],[-65,-177],[-47,-158],[-36,-119],[-17,-101],[0,-97],[17,-101],[36,-119],[47,-158],[65,-177],[76,-218],[50,-204],[34,-213],[-34,-213]],'#651b30','#1b0711',5);
  const chest=ctx.createLinearGradient(-50,-208,45,-104);chest.addColorStop(0,'#ffb181');chest.addColorStop(.24,'#c9514f');chest.addColorStop(.55,'#7c2035');chest.addColorStop(1,'#330c1c');
  polygon([[-43,-205],[-26,-216],[0,-211],[26,-216],[43,-205],[31,-169],[17,-139],[0,-126],[-17,-139],[-31,-169]],chest,'#ffad80',3);
  // Rib plates are individual curved strokes, not a flat breastplate decal.
  ctx.lineCap='round';ctx.lineJoin='round';
  for(let i=0;i<4;i++){
    const yy=-192+i*13;
    ctx.strokeStyle=i%2?'#6e2034':'#f08b68';ctx.lineWidth=6.5;
    ctx.beginPath();ctx.moveTo(-36+i*2,yy);ctx.quadraticCurveTo(-12,yy+14,0,yy+10);ctx.quadraticCurveTo(15,yy+14,36-i*2,yy);ctx.stroke();
    ctx.strokeStyle='rgba(255,218,173,.62)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-31+i*2,yy-2);ctx.quadraticCurveTo(-12,yy+10,0,yy+7);ctx.quadraticCurveTo(15,yy+10,31-i*2,yy-2);ctx.stroke();
  }
  for(let i=0;i<3;i++)polygon([[-21,-119+i*8],[-5,-124+i*8],[0,-117+i*8],[-5,-108+i*8],[-20,-110+i*8]],'#9c3040','#f08d66',1.2);
  // Neck, shoulders and independent arms.
  armorLimb([-20,-215],[-12,-231],15,'#ffad7a');armorLimb([20,-215],[12,-231],15,'#ffad7a');
  polygon([[-82,-227],[-112,-217],[-119,-193],[-98,-177],[-69,-189],[-55,-213]],'#7e2036','#210711',4);
  polygon([[82,-227],[112,-217],[119,-193],[98,-177],[69,-189],[55,-213]],'#8d293a','#210711',4);
  polygon([[-108,-214],[-82,-235],[-55,-222],[-72,-198],[-99,-193]],'#c7534d','#ffbb8a',2.4);
  polygon([[108,-214],[82,-235],[55,-222],[72,-198],[99,-193]],'#d7604c','#ffc28f',2.4);
  // Susanoo's secondary right arm carries the sake gourd that houses Totsuka.
  // Keep this separate from the primary sword arm so both relics read clearly.
  armorLimb([49,-210],[91,-200],13,'#d65b4b');
  armorLimb([91,-200],[119,-183],11,'#ff9c70');
  drawSakeGourd(142+breath*.2,-169,1.03,t);
  // Motion keys shift the actual shoulder/elbow/wrist joints during attacks.
  let armL1=[-91,-187],armL2=[-112,-145],armR1=[91,-185],armR2=[110,-143],swordAngle=.16;
  if(heavy){const q=clamp(n/57,0,1);if(n<8){armR1=[70,-228];armR2=[40,-246];swordAngle=-.48;}else if(n<18){armR1=[97,-184];armR2=[143,-170];swordAngle=1.15;}else if(n<31){armR1=[75,-183];armR2=[120,-224];swordAngle=.55;}else{armR1=[108,-174];armR2=[151,-163];swordAngle=1.35;}armL1=[-84,-183];armL2=[-107,-142];}
  if(guard){armR1=[100,-198];armR2=[128,-158];armL1=[-76,-184];armL2=[-41,-145];}
  if(thrust){
    armL1=[-88,-183];armL2=[-111,-145];
    if(n<19){
      const q=smooth(n/19);armR1=[lerp(91,58,q),lerp(-185,-224,q)];armR2=[lerp(119,34,q),lerp(-183,-248,q)];swordAngle=lerp(-.18,-.82,q);
    }else if(n<32){
      const q=smooth((n-19)/13);armR1=[lerp(58,85,q),lerp(-224,-251,q)];armR2=[lerp(34,67,q),lerp(-248,-282,q)];swordAngle=lerp(-.82,-.98,q);
    }else if(n<44){
      const q=smooth((n-32)/12);armR1=[lerp(85,112,q),lerp(-251,-185,q)];armR2=[lerp(67,151,q),lerp(-282,-160,q)];swordAngle=lerp(-.98,1.14,q);
    }else if(n<63){
      const q=smooth((n-44)/19);armR1=[lerp(112,82,q),lerp(-185,-201,q)];armR2=[lerp(151,114,q),lerp(-160,-171,q)];swordAngle=lerp(1.14,.55,q);
    }else{
      const q=smooth((n-63)/19);armR1=[lerp(82,91,q),lerp(-201,-185,q)];armR2=[lerp(114,119,q),lerp(-171,-183,q)];swordAngle=lerp(.55,-.18,q);
    }
  }
  if(awakening){
    if(t<42){armR1=[64,-186];armR2=[46,-202];armL1=[-64,-186];armL2=[-47,-202];}
    else if(t<88){armR1=[83,-197];armR2=[111,-158];armL1=[-83,-197];armL2=[-111,-158];}
    else if(t<154){armR1=[98,-190];armR2=[129,-149];armL1=[-98,-190];armL2=[-129,-149];}
    else {armR1=[108,-183];armR2=[135,-140];armL1=[-108,-183];armL2=[-135,-140];}
  }
  armorLimb([-70,-207],armL1,19,'#b84449');armorLimb(armL1,armL2,16,'#ff9c70');
  armorLimb([70,-207],armR1,19,'#c84c4a');armorLimb(armR1,armR2,16,'#ffb07a');
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
  }else{
    // The large mirror remains attached to the off-hand even when not guarding.
    drawShield(armL2[0]-5,armL2[1]-10,1.03,.28);
  }
  // The sword is not permanently in the hand: it is drawn out of the sake gourd for M1/X, then returns.
  if(heavy||thrust){
    const pulling=heavy?n<8:n<19;
    if(pulling){
      const q=heavy?clamp(n/8,0,1):clamp(n/19,0,1);
      const gx=142,gy=-216;
      const hx=armR2[0]+7,hy=armR2[1]+1;
      drawTotsuka(gx+(hx-gx)*q,gy+(hy-gy)*q,heavy?lerp(-.48,swordAngle,q):lerp(-.18,swordAngle,q),heavy?lerp(.55,1.42,q):lerp(.62,1.42,q),1);
    }else drawTotsuka(armR2[0]+7,armR2[1]+1,swordAngle,1.42,1);
  }
  // Boss-scale diagonal slash with layered hot-orange trails and drawn sword afterimages.
  if(thrust&&n>=29&&n<=62){
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
  if(thrust&&n>=42&&n<=68){
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
  polygon([[-39,-249],[-57,-267],[-45,-264],[-48,-292],[-28,-270],[-13,-301],[0,-278],[17,-301],[27,-271],[49,-289],[46,-260],[36,-244],[31,-226],[0,-218],[-31,-226]],'#461326','#1a0710',4);
  polygon([[-35,-255],[-23,-270],[0,-261],[23,-270],[35,-255],[29,-235],[13,-225],[-13,-225],[-29,-235]],'#a43843','#ffb07a',2.4);
  polygon([[-22,-252],[0,-259],[22,-252],[17,-235],[0,-228],[-17,-235]],'#210913','#e98766',2);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,75,52,.34)';ctx.beginPath();ctx.ellipse(-13,-244,12,5,0,0,Math.PI*2);ctx.ellipse(13,-244,12,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff2c8';ctx.beginPath();ctx.ellipse(-13,-244,5.2,2.1,0,0,Math.PI*2);ctx.ellipse(13,-244,5.2,2.1,0,0,Math.PI*2);ctx.fill();ctx.restore();
  polygon([[-13,-234],[0,-224],[13,-234],[8,-212],[-8,-212]],'#e36a55','#561728',2);
  // Crest and shoulder embers remain deterministic, with no particle objects allocated.
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.65;
  for(let i=0;i<5;i++){const ex=Math.sin(t*.12+i*2.1)*(50+i*14),ey=-150-((t*1.4+i*39)%120);ctx.fillStyle=i%2?'#ffca86':'#ff5b45';ctx.beginPath();ctx.arc(ex,ey,1.2+(i%3)*.45,0,Math.PI*2);ctx.fill();}
  ctx.restore();
  ctx.restore();
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
  drawSusanooRig(owner,ox-16,610,rigScale,n,appear,'awakening');
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
  if(validItachi(f)&&f.itachiSusanooActive&&!(Q.cinema&&Q.cinema.kind==='ult'))drawSusanooRig(f,f.x-(f.facing||1)*9,f.y+3,1.58,tick(),1,'battle');
  return previousDrawFighter.apply(this,arguments);
};
if(typeof previousReset==='function')window.resetFighter=function(f){
  if(f&&f.id==='itachi'){
    f.itachiSusanooActive=false;f.itachiSusanooPending=false;f.itachiSusanooAction='';f.itachiSusanooMarks={};f.itachiYataUntil=0;f.itachiSusanooFrames=0;f.itachiYataCounterUsed=false;
  }
  return previousReset.apply(this,arguments);
};
if(typeof previousStep==='function')window.step=function(){
  const r=previousStep.apply(this,arguments);
  for(const f of fighters()){
    if(!f||f.id!=='itachi')continue;
    if(f.itachiSusanooPending&&!Q.cinema&&f.moveKey!=='ult'&&!f.move){
      f.itachiSusanooPending=false;f.itachiSusanooActive=true;f.itachiSusanooAction='';f.itachiSusanooFrames=1200;f.itachiYataUntil=0;f.itachiYataCounterUsed=false;
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
  if(Q.cinema&&Q.cinema.kind==='ult')drawAwakening();
  else{
    hideStages(false);
    if(typeof G!=='undefined'&&G.mode!=='menu')drawFormHint();
  }
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
  if(!Q.cinema&&!f.move&&['IDLE','WALK','LAND','ATTACK'].includes(f.state))activate(f,key);
},true);
window.JFF_ITACHI_SUSANOO_DEBUG={getForm:f=>!!(f&&f.itachiSusanooActive),drawSusanoo:drawSusanooRig,reset:f=>{if(f){f.itachiSusanooActive=false;f.itachiSusanooPending=false;f.itachiSusanooAction='';}}};
console.info('[Itachi Susanoo] Rebuilt articulated guardian, awakening cinematic, Totsuka M1, Yata Z, sealing thrust X.');
})();