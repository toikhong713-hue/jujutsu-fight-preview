/* EDO ITACHI · SUSANOO: TENPAZAN (天破斬) · FULL CINEMATIC V1
   7.0-second camera-directed ultimate using the game's actual articulated Canvas Susanoo/fighter rigs.
   The combat simulation and countdown pause only while this finite cutscene clock runs.
   Escape, reset, menu exit, KO state, and teardown all restore camera/HUD/input state. */
(function(){
'use strict';
if(window.__JFF_EDO_SUSANOO_TENPAZAN_V1__)return;
const Q=window.JFF_ITACHI_REBOOT;
if(!Q||typeof window.updateMove!=='function'||typeof window.step!=='function')return;
window.__JFF_EDO_SUSANOO_TENPAZAN_V1__=true;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*clamp(t,0,1);
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const alive=f=>!!(f&&f.hp>0&&f.state!=='DEFEAT'&&f.state!=='VICTORY');
const ARENA=()=>window.ARENA_W||3200;
const DURATION=420, PHASES={summon:72,air:168,ground:270,charge:348,slice:390,outro:420};
const HITS=[
 {frame:84,damage:7,kind:'slash'},
 {frame:99,damage:7,kind:'slash'},
 {frame:114,damage:8,kind:'slash'},
 {frame:130,damage:9,kind:'slash'},
 {frame:148,damage:12,kind:'slash'},
 {frame:211,damage:18,kind:'ground',heavy:true},
 {frame:366,damage:52,kind:'final',heavy:true,final:true}
];
const oldUpdate=window.updateMove,oldStep=window.step,oldRender=window.render,oldReset=window.resetFighter,oldStart=window.startMove,oldPose=window.applyCharacterIdentityPose;
const stageIds=['jffOutsiderStage','jffItachiRebootStage','jffItachiCinematicStage','jffEdoItachiSkillStage','jffItachiSusanooStage'];
const hudIds=['jffFightingHud','trainingPanel'];
let stage=document.getElementById('jffEdoSusanooTenpazanStage');
const wrap=document.getElementById('wrap');
if(!stage&&wrap){
 stage=document.createElementNS('http://www.w3.org/2000/svg','svg');
 stage.setAttribute('id','jffEdoSusanooTenpazanStage');
 stage.setAttribute('viewBox','0 0 1280 720');
 stage.setAttribute('preserveAspectRatio','none');
 stage.setAttribute('aria-hidden','true');
 stage.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:12;pointer-events:none;overflow:hidden;display:block';
 wrap.appendChild(stage);
}
function snapshotCamera(){
 const out={};
 if(typeof cam!=='undefined'&&cam){
  for(const k of ['x','y','zoom','tx','ty','tzoom','cine','cineX','cineY','cineZoom'])if(k in cam)out[k]=cam[k];
 }
 return out;
}
function restoreCamera(u){
 if(!u||!u.cameraBefore||typeof cam==='undefined'||!cam)return;
 for(const k of Object.keys(u.cameraBefore))cam[k]=u.cameraBefore[k];
}
function setCamera(x,y,z){
 if(typeof cam==='undefined'||!cam)return;
 cam.x=x;cam.y=y;cam.zoom=z;
 if('tx'in cam)cam.tx=x;if('ty'in cam)cam.ty=y;if('tzoom'in cam)cam.tzoom=z;
 if('cine'in cam)cam.cine=0;if('cineX'in cam)cam.cineX=x;if('cineY'in cam)cam.cineY=y;if('cineZoom'in cam)cam.cineZoom=z;
}
function captureFighter(f){
 if(!f)return null;
 const keys=['x','y','facing','vx','vy','state','stateFrame','move','moveKey','moveFrame','itachiPoseKey','itachiCinemaKind','itachiSusanooActive','itachiSusanooAction','itachiSusanooFrames','itachiEdoUltimateActive','invuln','hitstun','immobilize','blocking','grabTarget','grabber','itachiSusanooPending'];
 const out={};for(const k of keys)out[k]=f[k];return out;
}
function hideCinematicUI(u){
 u.hidden=[];
 for(const id of hudIds.concat(stageIds)){
  const el=document.getElementById(id);if(!el)continue;
  u.hidden.push({el,display:el.style.display});
  el.style.display='none';
 }
}
function restoreCinematicUI(u){
 if(!u||!u.hidden)return;
 for(const v of u.hidden)if(v&&v.el)v.el.style.display=v.display;
 u.hidden=[];
}
function screenImpact(power,color){
 const u=Q.edoSusanooCutscene;
 if(u){u.impactPower=power||.2;u.impactColor=color||'#fff0d9';u.impactFlashUntil=u.frame+(power>.5?4:2);return;}
 if(typeof window.flash==='function')window.flash(power,color);
 if(typeof window.shake==='function')window.shake(power>0.5?18:(power>0.25?11:5));
 if(typeof window.camPunch==='function')window.camPunch(power>0.5?.3:.12);
}
function startCutscene(f){
 if(Q.edoSusanooCutscene||Q.cinema)return false;
 const opponent=f.opp,target=alive(opponent)?opponent:null;
 const face=target?(target.x>=f.x?1:-1):(f.facing||1);
 const u={
  kind:'edo-susanoo-tenpazan',frame:0,duration:DURATION,owner:f,target,face,
  ownerBefore:captureFighter(f),targetBefore:captureFighter(target),cameraBefore:snapshotCamera(),
  hidden:[],startTick:Q.tick||0,ownerX:f.x,ownerY:f.y,targetX:target?target.x:f.x+face*420,
  targetY:target?target.y:f.y,hitFrames:Object.create(null),hitEvents:[],lastHitFrame:-1,
  rigTick:Q.tick||0,finished:false,cancelled:false,hasDamage:false,impactFlashUntil:0,
  invertUntil:0,shakeFrame:0
 };
 Q.edoSusanooCutscene=u;
 f.facing=face;f.vx=0;f.vy=0;f.moveKey='ult';f.moveFrame=0;f.itachiPoseKey='ult';
 f.itachiCinemaKind='tenpazan';f.itachiSusanooActive=true;f.itachiSusanooAction='cinematic';
 f.itachiEdoUltimateActive=true;f.itachiSusanooFrames=Math.max(f.itachiSusanooFrames||0,DURATION+30);
 f.invuln=DURATION+30;
 if(target){
  target.move=null;target.moveKey=null;target.moveFrame=0;target.vx=0;target.vy=0;
  target.blocking=false;target.grabTarget=null;target.grabber=null;
  target.itachiCinemaStun=DURATION+30;target.hitstun=DURATION+30;target.immobilize=DURATION+30;
  target.state='HITSTUN';target.stateFrame=0;
 }
 if(Q.shots)Q.shots.length=0;Q.clone=null;Q.edoBlackFlameZone=null;Q.edoCrowEffect=null;Q.edoTotsuka=null;
 hideCinematicUI(u);
 if(typeof SFX!=='undefined'&&SFX.awaken)SFX.awaken();
 if(typeof SFX!=='undefined'&&SFX.tone)SFX.tone(74,.42,'sine',.07,38);
 screenImpact(.48,'#170a12');
 applyTimeline(u,0);
 return true;
}
function point(x,y){
 const z=typeof cam!=='undefined'&&Number.isFinite(cam.zoom)?cam.zoom:1;
 const cx=typeof cam!=='undefined'&&Number.isFinite(cam.x)?cam.x:640;
 const cy=typeof cam!=='undefined'&&Number.isFinite(cam.y)?cam.y:360;
 return{x:640+((typeof G!=='undefined'&&G.shakeX)||0)+(x-cx)*z,y:360+((typeof G!=='undefined'&&G.shakeY)||0)+(y-cy)*z,s:z};
}
function applyCamera(u){
 const n=u.frame,o=u.owner,t=u.target,face=u.face,ox=u.ownerX,oy=u.ownerY,tx=u.targetX,ty=u.targetY;
 const dist=Math.abs(tx-ox);
 if(n<72){
  if(n<30){
   const p=smooth(n/30),z=2.28-(2.28-1.42)*p;
   setCamera(ox-face*12,oy-104,z);
  }else{
   const p=smooth((n-30)/42),z=lerp(1.42,clamp(770/(dist+520),.77,1.12),p);
   setCamera(lerp(ox-face*12,(ox+tx)*.5,p),lerp(oy-104,(oy+ty)*.5-25,p),z);
  }
 }else if(n<168){
  const p=(n-72)/96,ang=p*Math.PI*2;
  const radius=76+Math.min(110,dist*.12),cx=tx+Math.sin(ang)*radius,cy=ty-94+Math.cos(ang)*32;
  setCamera(cx,cy,clamp(750/(dist+430),.74,1.02)+Math.sin(ang*2)*.025);
 }else if(n<270){
  const p=smooth((n-168)/102);
  setCamera(lerp((ox+tx)*.5,ox+face*34,p),lerp(oy-18,oy+105,p),lerp(.96,.83,p));
 }else if(n<348){
  const p=(n-270)/78;
  setCamera(ox+face*(40+p*62),oy-138-p*62,lerp(.83,.91,smooth(p)));
 }else if(n<390){
  const z=clamp(720/(dist+650),.57,.82);
  setCamera((ox+tx)*.5,oy-22,z);
 }else{
  const p=smooth((n-390)/30),origin=u.cameraBefore||{};
  const fromX=ox-face*95,fromY=oy-104,fromZ=.96;
  setCamera(lerp(fromX,Number.isFinite(origin.x)?origin.x:fromX,p),lerp(fromY,Number.isFinite(origin.y)?origin.y:fromY,p),lerp(fromZ,Number.isFinite(origin.zoom)?origin.zoom:1,p));
 }
}
function targetPosition(u,n){
 const o=u.target;if(!o)return;
 const x=u.targetX,y=u.targetY,d=u.face;
 let nx=x,ny=y;
 if(n>=72&&n<168){
  const p=(n-72)/96;
  nx=x+d*(9*Math.sin(p*Math.PI*2));
  ny=y-68-42*Math.sin(p*Math.PI);
 }else if(n>=168&&n<211){
  const p=smooth((n-168)/43);
  nx=x+d*(18+28*p);ny=y-110-70*p;
 }else if(n>=211&&n<270){
  const p=(n-211)/59;
  nx=x+d*(46+18*Math.sin(p*Math.PI));
  ny=y-180+145*smooth(p);
 }else if(n>=270&&n<348){
  const p=(n-270)/78;
  nx=x+d*(44+5*Math.sin(p*4));ny=y-45-35*Math.sin(p*Math.PI);
 }else if(n>=348&&n<390){
  const p=(n-348)/42;
  nx=x+d*(48+36*smooth(p));ny=y-80+75*smooth(p);
 }else if(n>=390){
  nx=x+d*82;ny=y;
 }
 o.x=clamp(nx,window.WALL||130,ARENA()-(window.WALL||130));
 o.y=ny;o.vx=0;o.vy=0;o.move=null;o.moveKey=null;o.moveFrame=0;
 if(alive(o)){o.state='HITSTUN';o.stateFrame=0;o.hitstun=Math.max(o.hitstun||0,DURATION-n+4);o.immobilize=Math.max(o.immobilize||0,DURATION-n+4);}
}
function damageTarget(u,event){
 const o=u.target,f=u.owner;if(!alive(o)||!f)return;
 const before=o.hp||0;
 o.hp=Math.max(0,before-event.damage);
 o.prevHp=before;o.hitFlash=event.final?12:8;o.lastHitKind='special';
 u.hasDamage=true;u.lastHitFrame=event.frame;
 o.state=o.hp<=0?'DEFEAT':'HITSTUN';o.stateFrame=0;o.hitstun=event.final?42:(event.heavy?31:23);
 if(o.hp<=0){o.hp=0;o.state='DEFEAT';}
 const x=o.x,y=o.y-96;
 const mark={frame:event.frame,x,y,kind:event.kind,final:!!event.final};
 u.hitEvents.push(mark);if(u.hitEvents.length>10)u.hitEvents.shift();
 u.invertUntil=event.frame+1;u.impactFlashUntil=event.frame+(event.final?8:3);
 if(event.heavy){
  screenImpact(event.final?.9:.65,event.final?'#fff0d9':'#f05a46');
  if(typeof SFX!=='undefined'){
   if(event.final&&SFX.clash)SFX.clash();
   else if(SFX.heianfugaImpact)SFX.heianfugaImpact();
   else if(SFX.heavy)SFX.heavy();
  }
 }else{
  screenImpact(.2,'#fff0d9');
  if(typeof SFX!=='undefined'&&SFX.heavy)SFX.heavy();
 }
}
function applyTimeline(u,n){
 u.frame=n;
 const f=u.owner;
 if(f){
  f.x=u.ownerX;f.y=u.ownerY;f.vx=0;f.vy=0;f.moveKey='ult';f.moveFrame=n;f.itachiPoseKey='ult';
  f.facing=(n>=390)?-u.face:u.face;f.itachiSusanooActive=true;f.itachiSusanooAction='cinematic';f.itachiEdoUltimateActive=true;
 }
 targetPosition(u,n);
 for(const e of HITS)if(n>=e.frame&&!u.hitFrames[e.frame]){u.hitFrames[e.frame]=true;damageTarget(u,e);}
 if(n===72&&typeof SFX!=='undefined'&&SFX.heavy)SFX.heavy();
 if(n===171&&typeof SFX!=='undefined'&&SFX.clash)SFX.clash();
 if(n===205&&typeof SFX!=='undefined'&&SFX.heianfugaTension)SFX.heianfugaTension();
 if(n===270&&typeof SFX!=='undefined'&&SFX.tone)SFX.tone(42,1.0,'sine',.11,26);
 if(n===348&&typeof SFX!=='undefined'&&SFX.heianwcs)SFX.heianwcs();
 if(n===414&&typeof SFX!=='undefined'&&SFX.block)SFX.block();
 if(n>=202&&n<=220){if(typeof window.shake==='function'&&n%4===0)window.shake(15);}
 u.rigTick=(u.startTick||0)+((n>=270&&n<318)?270+(n-270)*.2:n);
 applyCamera(u);
}
function finishCutscene(u,cancelled){
 u=u||Q.edoSusanooCutscene;if(!u||u.finished)return;
 u.finished=true;u.cancelled=!!cancelled;
 const f=u.owner,o=u.target;
 if(f){
  const prev=u.ownerBefore||{};
  f.x=u.ownerX;f.y=u.ownerY;f.facing=prev.facing===undefined?u.face:prev.facing;
  f.vx=0;f.vy=0;f.move=null;f.moveKey=null;f.moveFrame=0;
  f.itachiPoseKey='';f.itachiCinemaKind=prev.itachiCinemaKind||'';
  f.itachiSusanooActive=!!prev.itachiSusanooActive;
  f.itachiSusanooAction=prev.itachiSusanooAction||'';
  f.itachiSusanooFrames=prev.itachiSusanooFrames||0;f.itachiEdoUltimateActive=!!prev.itachiEdoUltimateActive;
  f.itachiSusanooPending=!!prev.itachiSusanooPending;f.invuln=prev.invuln||0;f.hitstun=prev.hitstun||0;f.immobilize=prev.immobilize||0;
  if(alive(f)){f.state='IDLE';f.stateFrame=0;}else{f.hp=0;f.state='DEFEAT';f.stateFrame=0;}
 }
 if(o){
  const prev=u.targetBefore||{};
  o.x=clamp(u.hasDamage?u.targetX+u.face*118:u.targetX,window.WALL||130,ARENA()-(window.WALL||130));
  o.y=u.targetY;o.vx=0;o.vy=0;o.move=null;o.moveKey=null;o.moveFrame=0;o.grabTarget=null;o.grabber=null;
  o.immobilize=0;o.itachiCinemaStun=0;
  if(o.hp<=0||o.state==='DEFEAT'){o.hp=0;o.state='DEFEAT';o.stateFrame=0;o.hitstun=0;}
  else if(u.hasDamage){o.state='HITSTUN';o.stateFrame=0;o.hitstun=28;o.vx=u.face*3.8;o.vy=-1.8;o.invuln=0;}
  else{
   o.state=prev.state||'IDLE';o.stateFrame=prev.stateFrame||0;o.hitstun=prev.hitstun||0;
   o.move=prev.move||null;o.moveKey=prev.moveKey||null;o.moveFrame=prev.moveFrame||0;
   o.facing=prev.facing===undefined?o.facing:prev.facing;
   o.vx=prev.vx||0;o.vy=prev.vy||0;o.blocking=!!prev.blocking;
   o.invuln=prev.invuln||0;
  }
 }
 restoreCamera(u);restoreCinematicUI(u);
 if(stage)stage.innerHTML='';
 Q.edoSusanooCutscene=null;
}
function lockPose(u){
 const f=u.owner,n=u.frame;
 if(!f)return;
 f.moveKey='ult';f.moveFrame=n;f.itachiPoseKey='ult';
 f.facing=n>=390?-u.face:u.face;
}
function cancelCutscene(){
 if(Q.edoSusanooCutscene)finishCutscene(Q.edoSusanooCutscene,true);
}
window.updateMove=function(f){
 if(f&&f.itachiEdo&&f.move&&f.moveKey==='ult'){
  f.moveFrame=(f.moveFrame||0)+1;
  if(f.moveFrame===1){if(!startCutscene(f)){if(typeof window.endMove==='function')window.endMove(f);else{f.move=null;f.moveKey=null;f.state='IDLE';}return;}}
  return;
 }
 return oldUpdate.apply(this,arguments);
};
if(typeof oldPose==='function')window.applyCharacterIdentityPose=function(P,f){
 oldPose.apply(this,arguments);
 const u=Q.edoSusanooCutscene;
 if(!u||u.owner!==f||!P)return;
 const n=u.frame;
 if(n<72){
  const p=n<30?0:smooth((n-30)/42);
  P.lean=-8-5*p;P.armF=[22-18*p,-44-10*p];P.armB=[144+8*p,-36-8*p];P.legF=[77,8];P.legB=[108,-10];P.headY=-117;
 }else if(n<168){
  const q=Math.sin(n*.34);P.lean=10*q;P.armF=[35+20*q,24-22*q];P.armB=[142-20*q,-24+22*q];P.legF=[72,12];P.legB=[115,-15];P.headY=-116;
 }else if(n<270){
  const p=smooth((n-168)/102);P.lean=lerp(-4,22,p);P.armF=[lerp(16,58,p),lerp(-50,30,p)];P.armB=[lerp(146,-22,p),lerp(-45,-67,p)];P.legF=[lerp(77,57,p),lerp(8,22,p)];P.legB=[lerp(108,126,p),lerp(-10,-18,p)];P.headY=-116;
 }else if(n<348){
  const p=(n-270)/78,slow=n<318?.2:2.2;const q=smooth(clamp((n<318?(n-270)*slow:(9.6+(n-318)*2.2))/78,0,1));
  P.lean=lerp(-5,-17,q);P.armF=[lerp(24,-40,q),lerp(-54,-78,q)];P.armB=[lerp(142,-48,q),lerp(-50,-78,q)];P.legF=[76,8];P.legB=[109,-10];P.headY=-118;
 }else if(n<390){
  const p=clamp((n-348)/42,0,1);P.lean=lerp(-17,25,p);P.armF=[lerp(-40,64,p),lerp(-78,32,p)];P.armB=[lerp(-48,48,p),lerp(-78,18,p)];P.legF=[lerp(76,57,p),lerp(8,20,p)];P.legB=[lerp(109,125,p),lerp(-10,-18,p)];P.headY=-116;
 }else{
  const p=smooth((n-390)/30);P.lean=lerp(14,0,p);P.armF=[lerp(35,18,p),lerp(28,-31,p)];P.armB=[lerp(140,123,p),lerp(18,-16,p)];P.legF=[80,8];P.legB=[105,-9];P.headY=-115;
 }
};
if(typeof oldStart==='function')window.startMove=function(f,key){
 if(Q.edoSusanooCutscene)return false;
 return oldStart.apply(this,arguments);
};
if(typeof oldReset==='function')window.resetFighter=function(f){
 if(Q.edoSusanooCutscene&&(Q.edoSusanooCutscene.owner===f||Q.edoSusanooCutscene.target===f))finishCutscene(Q.edoSusanooCutscene,true);
 return oldReset.apply(this,arguments);
};
window.step=function(){
 const u=Q.edoSusanooCutscene;
 if(u){
  if(typeof G!=='undefined'&&(G.mode==='menu'||G.matchOver||G.roundState==='ko')){finishCutscene(u,true);return;}
  if(typeof G!=='undefined'&&G.paused)return;
  if(u.frame>=DURATION){finishCutscene(u,false);return;}
  applyTimeline(u,u.frame+1);
  return;
 }
 const result=oldStep.apply(this,arguments);
 const started=Q.edoSusanooCutscene;
 if(started)applyTimeline(started,0);
 return result;
};
function cameraGuard(u){
 if(!u)return;
 applyCamera(u);
}
function addSlash(s,p,age,final){
 const alpha=Math.max(0,1-age/(final?24:13)),dir=s.face;
 const width=(final?48:24)*p.s;
 const x1=p.x-dir*(final?390:240)*p.s,y1=p.y+(final?220:125)*p.s;
 const x2=p.x+dir*(final?110:68)*p.s,y2=p.y-(final?260:128)*p.s;
 return '<g opacity="'+alpha+'"><path d="M '+x1+' '+y1+' Q '+(p.x-dir*65*p.s)+' '+(p.y-112*p.s)+' '+x2+' '+y2+'" fill="none" stroke="'+(final?'#fa553e':'#bd2945')+'" stroke-width="'+width+'" stroke-linecap="round"/><path d="M '+x1+' '+y1+' Q '+(p.x-dir*65*p.s)+' '+(p.y-112*p.s)+' '+x2+' '+y2+'" fill="none" stroke="'+(final?'#fff4d2':'#ffd8cc')+'" stroke-width="'+(final?8:4)*p.s+'" stroke-linecap="round"/>'+(final?'<path d="M '+(p.x-dir*26*p.s)+' '+(p.y-245*p.s)+' L '+(p.x+dir*7*p.s)+' '+(p.y+230*p.s)+'" stroke="#1a0711" stroke-width="'+(24*p.s)+'" opacity=".82"/><path d="M '+(p.x-dir*31*p.s)+' '+(p.y-245*p.s)+' L '+(p.x+dir*2*p.s)+' '+(p.y+230*p.s)+'" stroke="#fff0cf" stroke-width="'+(7*p.s)+'"/>':'')+'</g>';
}
function renderCutscene(u){
 if(!stage)return;
 if(!u){stage.innerHTML='';return;}
 const n=u.frame,o=u.owner,t=u.target,d=u.face;
 const p=point(o.x,o.y),tp=t?point(t.x,t.y-85):point(u.targetX,u.targetY-85);
 let s='<defs><radialGradient id="tenpazanVignette"><stop offset="0" stop-color="#07040a" stop-opacity="0"/><stop offset=".66" stop-color="#07040a" stop-opacity=".13"/><stop offset="1" stop-color="#020106" stop-opacity=".78"/></radialGradient><linearGradient id="tenpazanBladeGlow" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff7d8"/><stop offset=".35" stop-color="#ff9973"/><stop offset=".7" stop-color="#d72b48"/><stop offset="1" stop-color="#410d28"/></linearGradient></defs>';
 // Shot 1: fade through black, Mangekyo glint, skeleton flash and chakra bloom as the articulated rig grows in.
 if(n<72){
  const reveal=smooth(n/62);
  s+='<rect width="1280" height="720" fill="#050309" opacity="'+(n<6?1-smooth(n/6):.18*(1-reveal))+'"/>';
  s+='<ellipse cx="'+p.x+'" cy="'+(p.y-100*p.s)+'" rx="'+(120+reveal*180)*p.s+'" ry="'+(80+reveal*150)*p.s+'" fill="#a31739" opacity="'+(.05+reveal*.1)+'"/>';
  for(let i=0;i<7;i++){
   const a=i*Math.PI*2/7+n*.05,r=55+reveal*160;
   s+='<path d="M '+p.x+' '+(p.y-16*p.s)+' L '+(p.x+Math.cos(a)*r*p.s)+' '+(p.y+Math.sin(a)*r*.6*p.s)+'" stroke="'+(i%2?'#ef4c50':'#ffc18c')+'" stroke-width="'+(1.2+reveal*1.3)+'" opacity="'+(.2+reveal*.38)+'"/>';
  }
  if(n<34){
   const eye=point(o.x+d*9,o.y-116);
   s+='<g transform="translate('+eye.x+' '+eye.y+') scale('+Math.min(1.35,eye.s)+')" opacity="'+(1-n/40)+'"><path d="M -74 0 Q -36 -38 0 -16 Q 36 -38 74 0 Q 36 38 0 16 Q -36 38 -74 0 Z" fill="#13040e" stroke="#ec5a69" stroke-width="3"/><circle r="19" fill="#b42142" stroke="#ffbd97" stroke-width="2"/><circle r="10" fill="#0b030a" stroke="#ff9e89" stroke-width="2"/><path d="M 0 -33 L 7 -12 L 28 -8 L 11 5 L 16 26 L 0 14 L -16 26 L -11 5 L -28 -8 L -7 -12 Z" fill="#f04b62" transform="rotate('+n*31+')"/></g>';
  }
  if(n>=18&&n<72){
   const q=smooth((n-18)/54),rx=45+q*210;
   s+='<g opacity="'+(.18+q*.52)+'" transform="translate('+p.x+' '+(p.y+26*p.s)+') scale('+p.s+')"><ellipse rx="'+rx+'" ry="'+(rx*.18)+'" fill="none" stroke="#ff785d" stroke-width="3" stroke-dasharray="9 9" transform="rotate('+(-n*2)+')"/><ellipse rx="'+(rx*.73)+'" ry="'+(rx*.28)+'" fill="none" stroke="#ffd0a0" stroke-width="1.6" stroke-dasharray="3 8" transform="rotate('+(n*1.4)+')"/></g>';
  }
  if(n<54){
   const k=smooth(n/54);
   s+='<g transform="translate('+p.x+' '+(p.y+10*p.s)+') scale('+p.s+') " opacity="'+(1-k*.35)+'"><path d="M 0 -210 L 29 -160 L 0 -135 L -29 -160 Z M -78 -144 L -30 -120 L -22 -86 L -61 -69 L -101 -93 Z M 78 -144 L 30 -120 L 22 -86 L 61 -69 L 101 -93 Z" fill="none" stroke="#ff674e" stroke-width="4"/><path d="M -66 -89 Q -33 -60 0 -76 Q 33 -60 66 -89 M -45 -60 Q 0 -36 45 -60" stroke="#ffba87" stroke-width="3" fill="none"/></g>';
  }
 }else if(n<168){
  // Shot 2: rapid five-hit aerial combo with orbiting camera parallax, layered slash trails, and two-frame invert flashes.
  const orbit=(n-72)/96,ang=orbit*Math.PI*2;
  s+='<rect width="1280" height="720" fill="#09030d" opacity=".1"/>';
  s+='<g opacity=".48" transform="translate('+tp.x+' '+tp.y+') rotate('+(n*1.9)+' )"><ellipse rx="'+(118+Math.sin(ang*3)*10)+'" ry="48" fill="none" stroke="#b62244" stroke-width="2.2" stroke-dasharray="7 9"/><ellipse rx="'+(82+Math.cos(ang*2)*8)+'" ry="29" fill="none" stroke="#ffd3ad" stroke-width="1.2" stroke-dasharray="3 10"/></g>';
  for(let i=0;i<12;i++){
   const a=ang*2.8+i*2.4,rad=50+(i%4)*37,xx=tp.x+Math.cos(a)*rad,yy=tp.y+Math.sin(a)*rad*.64;
   s+='<path d="M '+xx+' '+yy+' l '+(Math.sin(a)*35)+' '+(-44-Math.cos(a)*28)+'" stroke="'+(i%3?'#c7254b':'#ffd6b3')+'" stroke-width="'+(i%3?2:1.2)+'" opacity=".47"/>';
  }
  for(const h of u.hitEvents){const age=n-h.frame;if(h.kind==='slash'&&age>=0&&age<15)s+=addSlash(u,point(h.x,h.y),age,false);}
  if(n<=u.invertUntil&&n>=u.invertUntil-1)s+='<rect width="1280" height="720" fill="#fff" opacity=".78" style="mix-blend-mode:difference"/>';
  s+='<path d="M 40 '+(110+Math.sin(ang)*22)+' L 1240 '+(580+Math.cos(ang)*26)+' M 30 '+(604+Math.cos(ang)*18)+' L 1220 '+(135+Math.sin(ang)*28)+'" stroke="#e44a65" stroke-width="1.5" opacity=".22"/>';
 }else if(n<270){
  // Shot 3: worm's-eye slam, terrain fractures, floating debris, lightning-like chakra spurs.
  const floor=point(o.x,o.y),age=n-168,q=smooth(age/102),r=30+q*400;
  s+='<rect width="1280" height="720" fill="#08030b" opacity=".18"/>';
  s+='<path d="M 0 '+(floor.y+54)+' Q 300 '+(floor.y+30)+' 640 '+(floor.y+57)+' T 1280 '+(floor.y+45)+' L 1280 720 L 0 720 Z" fill="#110914" opacity=".6"/>';
  s+='<g transform="translate('+p.x+' '+(floor.y+45)+')" opacity="'+(n<211?.5:Math.max(.08,1-(n-211)/59))+'"><ellipse rx="'+r+'" ry="'+(r*.13)+'" fill="none" stroke="#ec543f" stroke-width="4" stroke-dasharray="12 12"/><ellipse rx="'+(r*.62)+'" ry="'+(r*.08)+'" fill="none" stroke="#ffd4a0" stroke-width="2"/>';
  for(let i=0;i<12;i++){const a=i*Math.PI/6+n*.035,len=70+(i%4)*35+q*90,x=Math.cos(a)*len,y=Math.sin(a)*len*.5;s+='<path d="M 0 0 L '+(x*.6)+' '+(y*.6)+' L '+x+' '+(y-10)+' L '+(x+Math.sin(a)*16)+' '+(y-26)+'" fill="none" stroke="'+(i%3?'#eb493f':'#ffe0af')+'" stroke-width="'+(i%3?2.6:1.7)+'"/>';}
  s+='</g>';
  for(let i=0;i<18;i++){const a=i*2.399+n*.11,rad=30+((n*3+i*41)%210),x=p.x+Math.cos(a)*rad,y=floor.y+18-Math.abs(Math.sin(a))*rad*.55;s+='<path d="M '+x+' '+y+' l '+(Math.cos(a)*12)+' '+(-12-Math.abs(Math.sin(a))*22)+' l '+(Math.sin(a)*7)+' -5" stroke="'+(i%2?'#d85a48':'#ffd4a2')+'" stroke-width="'+(1.2+i%3*.4)+'" opacity=".72"/>';}
  for(const h of u.hitEvents){const age=n-h.frame;if(h.kind==='ground'&&age>=0&&age<26)s+=addSlash(u,point(h.x,h.y),age,true);}
 }else if(n<348){
  // Shot 4: time dilation. The rig clock is slowed in-place; environmental particles visibly rewind towards Totsuka.
  const q=(n-270)/78,bladeX=p.x+d*126*p.s,bladeY=p.y-265*p.s;
  s+='<rect width="1280" height="720" fill="#05030a" opacity="'+(.25+q*.17)+'"/><ellipse cx="'+bladeX+'" cy="'+bladeY+'" rx="'+(75+q*105)+'" ry="'+(170+q*95)+'" fill="none" stroke="#ee4b50" stroke-width="2" opacity=".32" transform="rotate('+(-d*12)+' '+bladeX+' '+bladeY+')"/>';
  s+='<path d="M '+bladeX+' '+(bladeY+40*p.s)+' L '+bladeX+' '+(bladeY-265*p.s)+'" stroke="url(#tenpazanBladeGlow)" stroke-width="'+(3+q*10)+'" opacity="'+(.4+q*.48)+'"/>';
  for(let i=0;i<28;i++){
   const ox=((i*97+33)%1260)+10,oy=80+((i*59+27)%545),t=smooth((n-270)/78),x=lerp(ox,bladeX,t),y=lerp(oy,bladeY,t);
   s+='<path d="M '+(x+(ox-bladeX)*.055)+' '+(y+(oy-bladeY)*.055)+' L '+x+' '+y+'" stroke="'+(i%4?'#e65751':'#ffe0af')+'" stroke-width="'+(i%4?1.4:2.1)+'" opacity="'+(.15+q*.65)+'"/>';
  }
  s+='<g transform="translate('+bladeX+' '+bladeY+') rotate('+(d*-7)+')"><path d="M -42 10 L -10 -15 L 0 -176 L 12 -15 L 42 10 L 12 4 L 0 -148 L -10 4 Z" fill="url(#tenpazanBladeGlow)" opacity="'+(.24+q*.56)+'"/><path d="M 0 -188 L 0 24" stroke="#fff9e5" stroke-width="'+(2+q*4)+'" opacity="'+(.4+q*.55)+'"/></g>';
  if(n>314)s+='<rect width="1280" height="720" fill="#05030a" opacity="'+((n-314)/34*.24)+'"/>';
 }else if(n<390){
  // Shot 5: extreme-wide vertical world split, 40px screen-slice offsets, dimensional fracture and black smoke.
  const q=smooth((n-348)/42),hitAge=n-366,center=point((u.ownerX+u.targetX)*.5,u.ownerY-30),split=n>=355&&n<=367?40*(1-Math.abs(n-361)/6):0;
  s+='<rect width="1280" height="720" fill="#07030b" opacity=".16"/>';
  s+='<path d="M '+(center.x+split)+' -30 L '+(center.x-split*.4)+' 135 L '+(center.x+split*.25)+' 278 L '+(center.x-split*.7)+' 438 L '+(center.x+split*.3)+' 755" stroke="#130713" stroke-width="'+(45+q*42)+'" opacity=".84"/>';
  s+='<path d="M '+(center.x+split)+' -20 L '+(center.x-split*.4)+' 135 L '+(center.x+split*.25)+' 278 L '+(center.x-split*.7)+' 438 L '+(center.x+split*.3)+' 755" stroke="#ee3d4e" stroke-width="'+(21+q*16)+'"/>';
  s+='<path d="M '+(center.x+split)+' -20 L '+(center.x-split*.4)+' 135 L '+(center.x+split*.25)+' 278 L '+(center.x-split*.7)+' 438 L '+(center.x+split*.3)+' 755" stroke="#fff2d2" stroke-width="'+(5+q*4)+'"/>';
  for(let i=0;i<12;i++){const y=35+i*59,x=center.x+Math.sin(i*3.8+n*.45)*(18+split);s+='<path d="M '+(x-52)+' '+y+' L '+(x+48)+' '+(y+Math.sin(i+n)*15)+' L '+(x+17)+' '+(y+18)+'" fill="none" stroke="'+(i%2?'#f25a59':'#ffe0b0')+'" stroke-width="'+(i%3?1.2:2.2)+'" opacity="'+(.28+q*.48)+'"/>';}
  if(n>=364&&n<=375)s+='<rect width="1280" height="720" fill="#fff4de" opacity="'+(1-Math.abs(n-366)/10)*.72+'"/>';
  for(let i=0;i<18;i++){const x=center.x+Math.sin(i*2.3+n*.13)*(30+i%4*24),y=350+Math.cos(i*1.7+n*.18)*(90+i%5*36);s+='<path d="M '+x+' '+y+' q '+(Math.sin(i)*16)+' -10 '+(Math.cos(i)*25)+' -32" stroke="#150b17" stroke-width="'+(3+i%4)+'" opacity=".65" fill="none"/>';}
  for(const h of u.hitEvents){const age=n-h.frame;if(h.final&&age>=0&&age<25)s+=addSlash(u,point(h.x,h.y),age,true);}
 }else{
  // Shot 6: explosion behind Itachi; he turns away, lowers the weapon, and the original camera returns.
  const q=smooth((n-390)/30),ex=tp.x,ey=tp.y+24*p.s,r=(24+(n-390)*13)*p.s;
  s+='<rect width="1280" height="720" fill="#07030b" opacity="'+(.18*(1-q))+'"/>';
  for(let i=0;i<7;i++){const rr=r*(.45+i*.16);s+='<circle cx="'+ex+'" cy="'+ey+'" r="'+rr+'" fill="none" stroke="'+(i%2?'#e4473e':'#ffc17f')+'" stroke-width="'+(3-i%2)+'" opacity="'+(1-q*.72)+'" stroke-dasharray="'+(8+i%3*5)+' 11" transform="rotate('+(n*1.2+i*20)+' '+ex+' '+ey+')"/>';}
  s+='<ellipse cx="'+ex+'" cy="'+ey+'" rx="'+r*1.7+'" ry="'+r*1.1+'" fill="#e74b33" opacity="'+((1-q)*.18)+'"/>';
 }
 // Two-frame monochrome inversion on every actual cutscene impact.
 if(n<=u.invertUntil&&n>=u.invertUntil-1)s+='<rect width="1280" height="720" fill="#fff" opacity=".8" style="mix-blend-mode:difference"/>';
 if(n<=u.impactFlashUntil&&u.impactPower>.35)s+='<rect width="1280" height="720" fill="'+(u.impactColor||'#fff0d9')+'" opacity="'+(Math.max(0,1-(u.impactFlashUntil-n)/4)*.16)+'"/>';
 if(n<6)s+='<rect width="1280" height="720" fill="#000" opacity="'+(1-smooth(n/6))+'"/>';
 if(n>=414)s+='<rect width="1280" height="720" fill="#fff4df" opacity="'+(smooth((n-414)/6)*.94)+'"/>';
 s+='<rect width="1280" height="720" fill="url(#tenpazanVignette)"/>';
 if(n>7&&n<414){
  const title=n<72?'SHARINGAN // SUSANOO DESCENT':(n<168?'FIVEFOLD AERIAL CLEAVE':(n<270?'CHAKRA EARTHBREAK':(n<348?'TENPAZAN // TEMPORAL COMPRESSION':(n<390?'TENPAZAN // SPACE FRACTURE':'THE SILENT AFTERBLAST'))));
  s+='<g font-family="monospace"><rect x="0" y="0" width="1280" height="38" fill="#05020a" opacity=".54"/><text x="28" y="24" fill="#ffca99" font-size="11" letter-spacing="3">'+title+'</text><text x="1250" y="24" fill="#f4e4d0" font-size="10" text-anchor="end" letter-spacing="2">EDO TENSEI  //  '+(Math.min(n,DURATION)/60).toFixed(2)+'s</text></g>';
 }
 stage.innerHTML=s;
}
window.render=function(){
 const u=Q.edoSusanooCutscene;
 if(!u)return oldRender.apply(this,arguments);
 cameraGuard(u);
 const f=u.owner,save=f?{moveKey:f.moveKey,moveFrame:f.moveFrame,itachiPoseKey:f.itachiPoseKey,facing:f.facing}:null;
 const previousTick=Q.tick;
 if(f){
  const n=u.frame;
  if(n<72){f.moveKey='ult';f.moveFrame=n;u.rigTick=u.startTick+n;}
  else if(n<168){f.moveKey='sus_m1';f.moveFrame=((n-72)%68)+1;u.rigTick=u.startTick+n;}
  else if(n<270){f.moveKey='sus_x';f.moveFrame=20+Math.round((n-168)/102*60);u.rigTick=u.startTick+n;}
  else if(n<348){f.moveKey='sus_charge';f.moveFrame=n<318?(n-270)*.2:9.6+(n-318)*2.2;u.rigTick=u.startTick+(n<318?270+(n-270)*.2:n);}
  else if(n<390){f.moveKey='sus_final';f.moveFrame=n-348;u.rigTick=u.startTick+n;}
  else{f.moveKey='sus_m1';f.moveFrame=50+Math.min(16,n-390);u.rigTick=u.startTick+n;}
  f.itachiPoseKey='ult';f.facing=n>=390?-u.face:u.face;
 }
 Q.tick=(u.startTick||0)+(u.rigTick-(u.startTick||0));
 let result;
 try{result=oldRender.apply(this,arguments);}finally{
  Q.tick=previousTick;
  if(f&&save){f.moveKey=save.moveKey;f.moveFrame=save.moveFrame;f.itachiPoseKey=save.itachiPoseKey;f.facing=save.facing;}
 }
 renderCutscene(u);
 return result;
};
window.JFF_EDO_SUSANOO_TENPAZAN={
 ready:true,version:1,durationFrames:DURATION,durationSeconds:7,
 phases:[{start:0,end:72,key:'Summon'},{start:72,end:168,key:'Five aerial slashes'},{start:168,end:270,key:'Ground crush'},{start:270,end:348,key:'Slow-motion charge'},{start:348,end:390,key:'Tenpazan space slice'},{start:390,end:420,key:'Outro and camera return'}],
 hits:HITS.map(e=>({frame:e.frame,damage:e.damage,kind:e.kind})),
 cancel:cancelCutscene
};
addEventListener('keydown',function(e){
 const u=Q.edoSusanooCutscene;if(!u)return;
 if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();cancelCutscene();return;}
 e.preventDefault();e.stopImmediatePropagation();
},true);
console.info('[Edo Itachi] Tenpazan 7s full camera cutscene loaded; finite timeline, safe camera/HUD restoration.');
})();