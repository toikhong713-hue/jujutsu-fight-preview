/* EDO ITACHI SKILL OVERHAUL
   S4 Crow Replacement -> S3 Yasaka Barrage -> S5 Amaterasu Field -> Yata -> Totsuka.
   Lightweight custom SVG overlay; original character artwork remains unchanged.
*/
(function(){
'use strict';
if(window.__JFF_EDO_ITACHI_SKILLS_V1__)return;
const Q=window.JFF_ITACHI_REBOOT;
if(!Q||!window.JFF_EDO_ITACHI)return;
window.__JFF_EDO_ITACHI_SKILLS_V1__=true;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const alive=f=>!!(f&&f.hp>0&&f.state!=='DEFEAT'&&f.state!=='VICTORY');
const sign=v=>v<0?-1:(v>0?1:0);
const fx=(t,x,y,d,data)=>{if(typeof window.JFF_OUTSIDER_FX==='function')window.JFF_OUTSIDER_FX(t,x,y,d||20,data||{});};
const oldUpdate=window.updateMove,oldResolve=window.resolveHit,oldStep=window.step,oldRender=window.render,oldReset=window.resetFighter,oldPose=window.applyCharacterIdentityPose;
const arena=()=>window.ARENA_W||3200;
function stop(f){if(typeof window.endMove==='function')window.endMove(f);else{f.move=null;f.moveKey=null;f.moveFrame=0;f.state=f.onGround?'IDLE':'FALL';f.stateFrame=0;}f.itachiPoseKey='';}
function impact(p,c){if(typeof window.flash==='function')window.flash(p,c);if(typeof window.shake==='function')window.shake(Math.max(2,Math.round(p*22)));if(typeof window.camPunch==='function')window.camPunch(p*.22);}
function applyHit(f,o,damage,cfg){
 if(!alive(f)||!alive(o)||typeof window.resolveHit!=='function')return 'whiff';
 cfg=cfg||{};const d=f.facing||1;
 return window.resolveHit(f,o,{damage,hitstun:cfg.hitstun||20,blockstun:cfg.blockstun===undefined?12:cfg.blockstun,kbx:cfg.kbx===undefined?d*6:cfg.kbx,kby:cfg.kby===undefined?-2:cfg.kby,hitstop:cfg.hitstop||7,meter:cfg.meter===undefined?6:cfg.meter,armorBreak:!!cfg.armorBreak,kind:cfg.kind||'special',type:cfg.type||'special'},cfg.x===undefined?f.x+d*74:cfg.x,cfg.y===undefined?f.y-92:cfg.y);
}

/* 1) S4: Crow Body Replacement. The dodge window, reposition and punish are separate beats. */
function updateCrow(f,n){
 const o=f.opp,d=f.facing||1;
 if(n===1){
  f.itachiCrowTeleported=false;f.itachiCrowStruck=false;f.itachiPoseKey='edo-crow-vanish';
  f.invuln=Math.max(f.invuln||0,20);
  Q.edoCrowEffect={owner:f,x:f.x,y:f.y,t:0,d:32,phase:'vanish'};
  fx('crows',f.x-d*12,f.y-86,32);fx('reflect',f.x,f.y-96,18);impact(.1,'#dce5f8');
 }
 if(n===3&&Q.edoCrowEffect)Q.edoCrowEffect.phase='burst';
 if(n===6&&!f.itachiCrowTeleported){
  f.itachiCrowTeleported=true;
  const x0=f.x,y0=f.y;
  if(alive(o)){f.x=clamp(o.x-(o.facing||-d)*76,window.WALL||130,arena()-(window.WALL||130));f.y=o.y;f.facing=o.x>=f.x?1:-1;}
  else f.x=clamp(f.x+d*112,window.WALL||130,arena()-(window.WALL||130));
  f.vx=0;f.vy=0;f.invuln=Math.max(f.invuln||0,12);
  if(Q.edoCrowEffect){Q.edoCrowEffect.toX=f.x;Q.edoCrowEffect.toY=f.y;Q.edoCrowEffect.fromX=x0;Q.edoCrowEffect.fromY=y0;Q.edoCrowEffect.phase='reappear';}
  fx('crows',x0,y0-84,24);fx('crows',f.x,f.y-88,30);fx('shock',f.x,f.y-78,17);
 }
 if(n===9&&f.itachiCrowTeleported&&!f.itachiCrowStruck){
  f.itachiCrowStruck=true;
  if(alive(o)&&Math.abs(o.x-f.x)<=158&&Math.abs(o.y-f.y)<=155){applyHit(f,o,18,{hitstun:27,blockstun:17,kbx:(f.facing||1)*10,kby:-6,hitstop:10,meter:8,armorBreak:true,x:o.x,y:o.y-86});fx('crows',o.x,o.y-86,30);fx('explosion',o.x,o.y-82,22);impact(.23,'#c7d6ef');}
  else fx('crows',f.x+(f.facing||1)*55,f.y-84,20);
 }
 if(n>=34){Q.edoCrowEffect=null;stop(f);}
}

/* 2) S3: heavier seven-orb Yasaka fan with a central armor-breaking projectile. */
function launchYasaka(f){
 const d=f.facing||1,x=f.x+d*83,y=f.y-169,fan=[-4.7,-3.2,-1.7,0,1.7,3.2,4.7];
 for(let i=0;i<fan.length;i++){
  const centre=i===3,speed=14.1+(centre?2.2:0)+(i%2)*.5;
  Q.shots.push({owner:f,kind:'magatama',edoYasaka:true,x,y,vx:d*speed,vy:fan[i],r:centre?27:22,damage:centre?13:9,stun:centre?25:18,kbx:d*(centre?10:7),kby:-3,life:92,rot:i*.31,hit:false,armorBreak:centre,trail:[]});
 }
 if(Q.shots.length>(Q.maxShots||24))Q.shots.splice(0,Q.shots.length-(Q.maxShots||24));
 fx('magatama',x,y,34,{charge:1,edo:true});fx('shock',x,y,26);fx('reflect',x,y,22);impact(.27,'#b9c9e5');
 if(typeof SFX!=='undefined'&&SFX.heavy)SFX.heavy();
}
function updateYasaka(f,n){
 const d=f.facing||1;f.itachiPoseKey='edo-yasaka';
 if(n===1){f.itachiEdoYasakaFired=false;f.vx*=.25;fx('reflect',f.x+d*44,f.y-126,24);fx('magatama',f.x+d*55,f.y-162,22,{charge:.2,edo:true});}
 if(n===8)fx('magatama',f.x+d*69,f.y-171,26,{charge:.55,edo:true});
 if(n===15&&!f.itachiEdoYasakaFired){f.itachiEdoYasakaFired=true;launchYasaka(f);}
 if(n>=50)stop(f);
}

/* 3) S5: target burn plus a temporary ground zone that punishes standing still. */
function updateAmaterasu(f,n){
 const d=f.facing||1,o=f.opp;f.itachiPoseKey='edo-amaterasu';
 if(n===1){f.itachiEdoAmaterasuCast=false;f.vx*=.1;fx('amaterasu',f.x+d*48,f.y-90,28,{charge:.2,edo:true});fx('reflect',f.x+d*48,f.y-103,28);}
 if(n===13)fx('amaterasu',f.x+d*60,f.y-92,42,{charge:.8,edo:true});
 if(n===28&&!f.itachiEdoAmaterasuCast){
  f.itachiEdoAmaterasuCast=true;
  if(alive(o)&&(o.x-f.x)*d>-10&&Math.abs(o.x-f.x)<=760&&Math.abs(o.y-f.y)<=220){
   Q.burns=(Q.burns||[]).filter(b=>!(b&&b.target===o&&b.kind==='amaterasu'));
   Q.burns.push({target:o,t:0,d:330,next:24,kind:'amaterasu',damage:4});
   Q.edoBlackFlameZone={owner:f,x:o.x,y:o.y,t:0,d:168,width:336,nextDamage:24};
   Q.amaterasuImpact={owner:f,target:o,t:0,d:42};
   fx('amaterasu',o.x,o.y-82,60,{charge:1,edo:true});fx('shock',o.x,o.y-80,30);
   for(let j=0;j<6;j++)fx('amaterasu',o.x+(j-2.5)*32,o.y+3,90,{charge:.75,ground:true,edo:true});
   impact(.35,'#25202e');
   if(typeof window.floatText==='function')window.floatText(o.x,o.y-150,'AMATERASU · BLACK FLAME FIELD','#d8d4e7',16,48);
   if(typeof SFX!=='undefined'&&SFX.red)SFX.red();
  }else fx('crows',f.x+d*60,f.y-88,18);
 }
 if(n>=57)stop(f);
}

/* 4) Yata Mirror: a timed defense window that can reflect more than one hit, paced by cooldown. */
function updateYata(f,n){
 f.itachiPoseKey='edo-yata';if(n===1){f.vx*=.1;f.itachiEdoYataUntil=0;f.itachiEdoYataLastReflect=-999;fx('reflect',f.x+(f.facing||1)*38,f.y-112,32);fx('seal',f.x+(f.facing||1)*42,f.y-106,24);fx('crows',f.x-(f.facing||1)*12,f.y-84,17);}
 if(n===4){f.itachiEdoYataUntil=(Q.tick||0)+34;fx('reflect',f.x+(f.facing||1)*50,f.y-112,36);impact(.15,'#e2e8f5');}
 if(n>=42){f.itachiEdoYataUntil=0;stop(f);}
}

/* 5) Ultimate: seven-second Edo Susanoo cinematic. The match simulation is paused
   while the cinematic clock, camera and SVG action continue at a fixed 60-frame timeline. */
const EDO_SUSANOO_HITS=[64,78,92,106,120,153,167,181,195,209,223,350];
const CAM_KEYS=['x','y','zoom','tx','ty','tzoom','cine','cineX','cineY','cineZoom'];
function snapshotCamera(){
 const out={};if(typeof cam!=='undefined'&&cam)for(const k of CAM_KEYS)out[k]=cam[k];return out;
}
function restoreCamera(c){
 if(!c||!c.cameraState||typeof cam==='undefined'||!cam)return;
 for(const k of CAM_KEYS)if(Object.prototype.hasOwnProperty.call(c.cameraState,k))cam[k]=c.cameraState[k];
}
function hideCinemaHud(c){
 c.uiDisplays=[];
 for(const id of ['jffFightingHud','trainingPanel']){
  const el=document.getElementById(id);if(el){c.uiDisplays.push({el:el,display:el.style.display});el.style.display='none';}
 }
}
function restoreCinemaHud(c){
 if(!c||!c.uiDisplays)return;
 for(const item of c.uiDisplays)if(item&&item.el)item.el.style.display=item.display;
 c.uiDisplays=[];
}
function beginEdoSusanoo(f){
 if(Q.cinema)return false;
 const raw=f.opp,target=alive(raw)&&Math.abs(raw.x-f.x)<=1650&&Math.abs(raw.y-f.y)<=340?raw:null;
 const d=target?(target.x>=f.x?1:-1):(f.facing||1);
 const c={
  owner:f,target:target,frame:0,duration:420,face:d,hitEvents:[],
  ownerStartX:f.x,ownerStartY:f.y,targetStartX:target?target.x:f.x+d*330,
  targetStartY:target?target.y:f.y,ownerInvuln:f.invuln||0,
  ownerPoseBefore:f.itachiPoseKey||'',ownerCinemaBefore:f.itachiCinemaKind||'',
  ownerSusanooBefore:!!f.itachiSusanooActive,ownerSusanooFramesBefore:f.itachiSusanooFrames||0,
  cameraState:snapshotCamera(),uiDisplays:[],lastHit:0
 };
 c.distance=Math.abs(c.targetStartX-c.ownerStartX);
 c.wideZoom=clamp(252/Math.max(180,c.distance),.58,1.08);
 Q.edoSusanooCine=c;
 Q.edoTotsuka=null;Q.edoCrowEffect=null;Q.edoBlackFlameZone=null;
 Q.shots.length=0;Q.clone=null;
 f.facing=d;f.vx=0;f.vy=0;f.itachiPoseKey='ult';f.itachiCinemaKind='ult';
 f.itachiSusanooActive=false;f.invuln=Math.max(f.invuln||0,423);
 if(target){
  target.move=null;target.moveKey=null;target.moveFrame=0;target.hasHit=false;
  target.vx=0;target.vy=0;target.blocking=false;target.grabTarget=null;target.grabber=null;
  target.hitstun=423;target.immobilize=423;target.itachiCinemaStun=423;
  target.state='HITSTUN';target.stateFrame=0;
 }
 hideCinemaHud(c);
 Q.cinema={kind:'edoSusanoo',owner:f,target:target,frame:-1,duration:420,hitDone:false,
  createdAt:Q.tick,targetStartHp:target?target.hp:0,edoCine:c};
 if(typeof SFX!=='undefined'&&SFX.awaken)SFX.awaken();
 animateSusanooCamera(c,0);
 return true;
}
function animateSusanooCamera(c,n){
 if(!c||typeof cam==='undefined'||!cam)return;
 const orig=c.cameraState||{},ox=c.ownerStartX,oy=c.ownerStartY,tx=c.targetStartX,dx=tx-ox;
 const blend=(a,b,t)=>a+(b-a)*clamp(t,0,1);
 let zoom=c.wideZoom,focusX=ox+dx*.42,focusY=oy-160;
 if(n<34){
  const p=smooth(n/34);zoom=blend(1.2,c.wideZoom,p);focusX=ox+dx*.2;focusY=oy-118;
 }else if(n<60){
  const p=smooth((n-34)/26);zoom=blend(c.wideZoom*.98,c.wideZoom,p);focusX=ox+dx*.38;focusY=oy-150;
 }else if(n<150){
  const orbit=Math.sin(((n-60)/90)*Math.PI)*Math.min(90,c.distance*.16);
  focusX=ox+dx*.42+orbit;focusY=oy-155;zoom=c.wideZoom*(1+Math.sin(n*.045)*.025);
 }else if(n<240){
  focusX=ox+dx*.45+Math.sin((n-150)*.12)*24;focusY=oy-255;zoom=c.wideZoom*1.035;
 }else if(n<330){
  focusX=ox+dx*.42;focusY=oy-180;zoom=c.wideZoom*.97;
 }else if(n<390){
  focusX=ox+dx*.46;focusY=oy-202;zoom=c.wideZoom*.86;
 }else{
  const p=smooth((n-390)/30);
  focusX=blend(ox+dx*.46,Number.isFinite(orig.x)?orig.x:ox,p);
  focusY=blend(oy-202,Number.isFinite(orig.y)?orig.y:oy-120,p);
  zoom=blend(c.wideZoom*.86,Number.isFinite(orig.zoom)?orig.zoom:1,p);
 }
 let shake=0;
 for(const h of c.hitEvents){const age=n-h.frame;if(age>=0&&age<5)shake=Math.max(shake,(h.final?25:12)*(1-age/5));}
 if(n>=345&&n<=359)shake=Math.max(shake,18*(1-Math.abs(n-350)/10));
 focusX+=Math.sin(n*2.4)*shake/Math.max(.5,zoom);
 focusY+=Math.cos(n*2.1)*shake*.36/Math.max(.5,zoom);
 cam.x=focusX;cam.y=focusY;cam.zoom=zoom;
 if('tx' in cam)cam.tx=focusX;if('ty' in cam)cam.ty=focusY;if('tzoom' in cam)cam.tzoom=zoom;
}
function susanooImpact(c,n){
 const f=c.owner,o=c.target,final=n===350;
 const targetX=o&&Number.isFinite(o.x)?o.x:c.ownerStartX+c.face*300;
 const targetY=o&&Number.isFinite(o.y)?o.y-88:c.ownerStartY-88;
 c.lastHit=n;c.hitEvents.push({frame:n,x:targetX,y:targetY,final:final,index:c.hitEvents.length+1});
 if(o&&alive(o)){
  const max=o.maxHp||200;
  if(final){
   const damage=Math.round(max*.40);
   if(o.hp<=damage||o.hp/Math.max(1,max)<=.22){o.hp=0;o.state='DEFEAT';o.stateFrame=0;c.finalKO=true;}
   else{o.hp=Math.max(1,o.hp-damage);o.state='HITSTUN';o.stateFrame=0;o.hitstun=24;}
   o.x=clamp(c.targetStartX+c.face*78,window.WALL||130,arena()-(window.WALL||130));
   o.y=c.targetStartY;
  }else{
   o.hp=Math.max(1,o.hp-Math.max(1,Math.round(max*.03)));
   o.state='HITSTUN';o.stateFrame=0;o.hitstun=18;
   if(n>=153&&n<=223)o.y=c.targetStartY-78*Math.sin(clamp((n-153)/68,0,1)*Math.PI);
  }
 }
 if(final){
  fx('slash',targetX,targetY,48,{edoSusanoo:true,final:true});
  fx('explosion',targetX,targetY,38,{edoSusanoo:true});
  if(typeof SFX!=='undefined'&&SFX.blackflash)SFX.blackflash();
 }else{
  fx('slash',targetX,targetY,19,{edoSusanoo:true,index:c.hitEvents.length});
  if(c.hitEvents.length%2===0)fx('shock',targetX,targetY,16,{edoSusanoo:true});
  if(c.hitEvents.length===6&&typeof SFX!=='undefined'&&SFX.heavy)SFX.heavy();
 }
}
function finishEdoSusanooCinema(){
 const c=Q.edoSusanooCine;if(!c)return;
 const f=c.owner,o=c.target;
 if(o){
  o.immobilize=0;o.hitstun=0;o.itachiCinemaStun=0;o.vx=0;o.vy=0;o.move=null;o.moveKey=null;o.moveFrame=0;
  o.y=c.targetStartY;
  if(o.hp<=0||o.state==='DEFEAT'){o.hp=0;o.state='DEFEAT';o.stateFrame=0;}
  else{o.state='IDLE';o.stateFrame=0;o.invuln=Math.max(o.invuln||0,18);}
 }
 if(f){
  f.itachiCinemaKind=c.ownerCinemaBefore||'';f.itachiPoseKey='';
  f.itachiSusanooActive=c.ownerSusanooBefore;f.itachiSusanooFrames=c.ownerSusanooFramesBefore;
  f.invuln=c.ownerInvuln;f.vx=0;f.vy=0;f.move=null;f.moveKey=null;f.moveFrame=0;
  if(f.hp<=0||f.state==='DEFEAT'){f.hp=0;f.state='DEFEAT';f.stateFrame=0;}
  else{f.state='IDLE';f.stateFrame=0;}
 }
 restoreCamera(c);restoreCinemaHud(c);
 Q.edoSusanooCine=null;
 if(Q.cinema&&Q.cinema.kind==='edoSusanoo')Q.cinema=null;
}
function updateSusanooCinemaFrame(c,n){
 if(!c)return;
 c.frame=n;
 if(c.target){
  if(n>=150&&n<=220)c.target.y=c.targetStartY-78*Math.sin(clamp((n-150)/70,0,1)*Math.PI);
  else if(n>220&&n<350)c.target.y=c.targetStartY;
  if(n>=350&&n<390)c.target.y=c.targetStartY;
 }
 for(const h of EDO_SUSANOO_HITS)if(n===h)susanooImpact(c,n);
 if(n===1){fx('reflect',c.ownerStartX,c.ownerStartY-145,38,{edoSusanoo:true});}
 if(n===30||n===58||n===150||n===221||n===330)fx('shock',c.owner.x,c.owner.y-80,28,{edoSusanoo:true,beat:n});
 if(n===150&&typeof SFX!=='undefined'&&SFX.heavy)SFX.heavy();
 if(n===221&&typeof SFX!=='undefined'&&SFX.heavy)SFX.heavy();
 if(n===390&&typeof SFX!=='undefined'&&SFX.ui)SFX.ui();
 animateSusanooCamera(c,n);
}
function updateTotsuka(f,n){
 if(n===1){
  if(Q.cinema){stop(f);return;}
  f.itachiPoseKey='ult';
  if(alive(f.opp)&&Math.abs(f.opp.y-f.y)<=340)f.facing=f.opp.x>=f.x?1:-1;
  f.vx=0;f.vy=0;
  beginEdoSusanoo(f);
  return;
 }
 if(n>=2&&n<420){f.itachiPoseKey='ult';return;}
 if(n>=420&&!Q.edoSusanooCine)stop(f);
}
function updateEdo(f){
 const k=f.moveKey,n=(f.moveFrame||0)+1;f.moveFrame=n;
 if(k==='s4')updateCrow(f,n);else if(k==='s3')updateYasaka(f,n);else if(k==='s5')updateAmaterasu(f,n);else if(k==='def')updateYata(f,n);else if(k==='ult')updateTotsuka(f,n);
}
if(typeof oldUpdate==='function')window.updateMove=function(f){
 if(f&&f.itachiEdo&&f.move&&['s3','s4','s5','def','ult'].includes(f.moveKey)&&!(Q.cinema&&(Q.cinema.owner===f||Q.cinema.target===f))){updateEdo(f);return;}
 return oldUpdate.apply(this,arguments);
};
if(typeof oldResolve==='function')window.resolveHit=function(attacker,defender,mv,hx,hy){
 if(defender&&defender.itachiEdo&&defender.itachiEdoYataUntil>(Q.tick||0)&&alive(attacker)&&attacker!==defender){
  const d=defender.facing||1,front=d===(sign(attacker.x-defender.x)||1);
  if(front){
   const now=Q.tick||0,last=defender.itachiEdoYataLastReflect||-999;
   if(now-last>=18){
    defender.itachiEdoYataLastReflect=now;
    oldResolve.call(this,defender,attacker,{damage:12,hitstun:23,blockstun:0,kbx:d*8,kby:-3,hitstop:9,meter:7,armorBreak:true,kind:'special',type:'special'},defender.x+d*70,defender.y-91);
    fx('reflect',defender.x+d*48,defender.y-112,30);fx('shock',attacker.x,attacker.y-83,23);if(typeof SFX!=='undefined'&&SFX.parry)SFX.parry();
   }else fx('reflect',defender.x+d*44,defender.y-108,10);
   return 'parry';
  }
 }
 return oldResolve.apply(this,arguments);
};
if(typeof oldStep==='function')window.step=function(){
 const active=Q.edoSusanooCine;
 if(active&&Q.cinema&&Q.cinema.kind==='edoSusanoo'){
  if(typeof G!=='undefined'&&(G.mode==='menu'||G.matchOver||G.roundState==='ko')){finishEdoSusanooCinema();return;}
  if(typeof G!=='undefined'&&G.paused)return;
  const next=(Q.cinema.frame||0)+1;
  Q.cinema.frame=next;
  if(next>active.duration){finishEdoSusanooCinema();return;}
  updateSusanooCinemaFrame(active,next);
  return;
 }
 const result=oldStep.apply(this,arguments);
 if(Q.edoSusanooCine&&Q.cinema&&Q.cinema.kind==='edoSusanoo'){
  Q.edoSusanooCine.frame=Math.max(0,Q.cinema.frame||0);
  animateSusanooCamera(Q.edoSusanooCine,Q.edoSusanooCine.frame);
 }
 if(typeof G==='undefined'||G.mode==='menu'||G.paused)return result;
 const lane=Q.edoBlackFlameZone;
 if(lane){
  lane.t++;const target=lane.owner&&lane.owner.opp;
  if(lane.t>=lane.nextDamage){
   lane.nextDamage+=24;
   if(alive(target)&&Math.abs(target.x-lane.x)<=lane.width*.5&&Math.abs(target.y-lane.y)<=155){
    applyHit(lane.owner,target,3,{hitstun:11,blockstun:8,kbx:(lane.owner.facing||1)*3,kby:-1,hitstop:3,meter:2,x:target.x,y:target.y-48});
    fx('amaterasu',target.x,target.y+3,18,{ground:true,edo:true});fx('shock',target.x,target.y,11);
   }
  }
  if(lane.t>=lane.d)Q.edoBlackFlameZone=null;
 }
 if(Q.edoCrowEffect){Q.edoCrowEffect.t++;if(Q.edoCrowEffect.t>=Q.edoCrowEffect.d)Q.edoCrowEffect=null;}
 if(Q.edoTotsuka){Q.edoTotsuka.t++;if(Q.edoTotsuka.t>=Q.edoTotsuka.d)Q.edoTotsuka=null;}
 for(const q of Q.shots||[])if(q&&q.edoYasaka){if(!Array.isArray(q.trail))q.trail=[];q.trail.push({x:q.x,y:q.y});if(q.trail.length>8)q.trail.shift();}
 return result;
};
if(typeof oldReset==='function')window.resetFighter=function(f){
 if(Q.edoSusanooCine&&((Q.edoSusanooCine.owner===f)||(Q.edoSusanooCine.target===f)))finishEdoSusanooCinema();
 const result=oldReset.apply(this,arguments);
 if(f&&f.itachiEdo){f.itachiEdoYataUntil=0;f.itachiCrowTeleported=false;f.itachiCrowStruck=false;}
 for(const key of ['edoBlackFlameZone','edoCrowEffect','edoTotsuka'])if(Q[key]&&Q[key].owner===f)Q[key]=null;
 Q.shots=(Q.shots||[]).filter(q=>q&&q.owner!==f);return result;
};
if(typeof oldPose==='function')window.applyCharacterIdentityPose=function(P,f){
 oldPose.apply(this,arguments);
 if(!P||!f||!f.itachiEdo)return;
 const cine=Q.edoSusanooCine;
 if(cine&&cine.owner===f){
  const n=cine.frame||0;
  if(n<18){P.lean=-3;P.armF=[-42,-34];P.armB=[42,-34];P.legF=[80,8];P.legB=[104,-10];P.headY=-116;}
  else if(n<38){P.lean=-7;P.armF=[-58,-48];P.armB=[58,-48];P.legF=[77,11];P.legB=[109,-12];P.headY=-119;}
  else if(n<60){P.lean=-2;P.armF=[-64,-26];P.armB=[64,-26];P.legF=[79,8];P.legB=[106,-9];}
  else if(n<150){const a=Math.sin(n*.22);P.lean=12*a;P.armF=[35+18*a,30-28*a];P.armB=[136-16*a,-22+30*a];P.legF=[77,12];P.legB=[110,-11];}
  else if(n<240){P.lean=20;P.armF=[12,-5];P.armB=[-24,-18];P.legF=[63,19];P.legB=[124,-17];}
  else if(n<330){P.lean=-16;P.armF=[-48,-74];P.armB=[-62,-66];P.legF=[76,8];P.legB=[108,-9];}
  else if(n<390){P.lean=27;P.armF=[65,28];P.armB=[48,8];P.legF=[58,20];P.legB=[126,-18];}
  else{P.lean=0;P.armF=[22,-31];P.armB=[140,-18];P.legF=[82,8];P.legB=[101,-8];}
  return;
 }
 if(!f.move)return;
 const n=f.moveFrame||0,k=f.moveKey||'';
 if(k==='s4'){P.lean=n<6?-12:14;P.armF=n<6?[28,-45]:[10,-58];P.armB=n<6?[145,-35]:[151,-42];P.legF=n<6?[70,19]:[62,24];P.legB=n<6?[111,-12]:[119,-20];P.headY=-116;}
 else if(k==='s3'){P.lean=n<15?-8:14;P.armF=n<15?[35,-45]:[12,-58];P.armB=n<15?[130,-35]:[151,-45];P.legF=[77,14];P.legB=[109,-12];}
 else if(k==='s5'){P.lean=-7;P.armF=n<28?[24,-35]:[16,-58];P.armB=n<28?[133,-32]:[147,-46];P.legF=[80,9];P.legB=[102,-8];}
 else if(k==='def'){P.lean=-5;P.armF=[24,-52];P.armB=[143,-45];P.legF=[80,9];P.legB=[105,-10];}
 else if(k==='ult'){P.lean=n<38?-15:15;P.armF=n<38?[35,-45]:[13,-64];P.armB=n<38?[143,-40]:[151,-52];P.legF=[72,18];P.legB=[113,-17];}
};
const wrap=document.getElementById('wrap');let stage=null;
if(wrap){stage=document.createElementNS('http://www.w3.org/2000/svg','svg');stage.setAttribute('id','jffEdoItachiSkillStage');stage.setAttribute('viewBox','0 0 1280 720');stage.setAttribute('preserveAspectRatio','none');stage.setAttribute('aria-hidden','true');stage.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:10;pointer-events:none;overflow:hidden;display:block';wrap.appendChild(stage);}
function point(x,y){const z=typeof cam!=='undefined'&&Number.isFinite(cam.zoom)?cam.zoom:1,cx=typeof cam!=='undefined'&&Number.isFinite(cam.x)?cam.x:640,cy=typeof cam!=='undefined'&&Number.isFinite(cam.y)?cam.y:360;return{x:640+((G&&G.shakeX)||0)+(x-cx)*z,y:360+((G&&G.shakeY)||0)+(y-cy)*z,s:z};}
function crows(p,t,alpha){
 let out='<g transform="translate('+p.x+' '+p.y+') scale('+p.s+') rotate('+(Math.sin(t*.22)*9)+')" opacity="'+alpha+'">';
 for(let i=0;i<7;i++){const a=t*.18+i*2.399,r=12+(i%3)*9,x=Math.cos(a)*r,y=Math.sin(a)*r*.65,w=Math.sin(t*.45+i)*5;out+='<path d="M '+(x-14)+' '+y+' Q '+(x-7)+' '+(y-9-w)+' '+x+' '+(y-3)+' L '+(x+5)+' '+(y-12+w)+' L '+(x+9)+' '+(y-2)+' L '+(x+16)+' '+(y+2)+' L '+(x+5)+' '+(y+5)+' L '+(x-4)+' '+(y+11)+' L '+(x-4)+' '+(y+4)+' Z" fill="#060710" stroke="#a7bad8" stroke-width=".75"/>';}
 return out+'</g>';
}
function susanooCinemaSvg(c){
 if(!c||!c.owner)return '';
 const n=c.frame||0,f=c.owner,o=c.target,d=c.face||1;
 const p=point(f.x,f.y),tp=point(o&&Number.isFinite(o.x)?o.x:c.ownerStartX+d*300,o&&Number.isFinite(o.y)?o.y-90:c.ownerStartY-90);
 const appear=clamp(n/48,0,1),ease=appear*appear*(3-2*appear),scale=.16+ease*.99;
 let swordAngle=-22;
 if(n<60)swordAngle=-38+clamp(n/60,0,1)*18;
 else if(n<150)swordAngle=Math.sin(n*.25)*48;
 else if(n<240)swordAngle=95+Math.sin(n*.17)*8;
 else if(n<330)swordAngle=-82+Math.sin(n*.035)*5;
 else if(n<350)swordAngle=-82+clamp((n-330)/20,0,1)*153;
 else if(n<390)swordAngle=71-(n-350)*.52;
 else swordAngle=50-clamp((n-390)/30,0,1)*76;
 let s='';
 s+='<defs><linearGradient id=\"edoSusArmor\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#edf2ff\"/><stop offset=\".18\" stop-color=\"#9aa8c8\"/><stop offset=\".44\" stop-color=\"#42445f\"/><stop offset=\".72\" stop-color=\"#171729\"/><stop offset=\"1\" stop-color=\"#a9b5d7\"/></linearGradient>';
 s+='<linearGradient id=\"edoSusBlade\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"0\"><stop offset=\"0\" stop-color=\"#21182f\"/><stop offset=\".33\" stop-color=\"#b6a9e6\"/><stop offset=\".52\" stop-color=\"#fffdf7\"/><stop offset=\".72\" stop-color=\"#bda8f9\"/><stop offset=\"1\" stop-color=\"#261a38\"/></linearGradient>';
 s+='<linearGradient id=\"edoSusSlash\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#5d3eaa\"/><stop offset=\".44\" stop-color=\"#fffdf5\"/><stop offset=\".7\" stop-color=\"#e5c8ff\"/><stop offset=\"1\" stop-color=\"#7d183c\"/></linearGradient>';
 s+='<radialGradient id=\"edoSusVignette\"><stop offset=\".12\" stop-color=\"#080610\" stop-opacity=\".04\"/><stop offset=\".66\" stop-color=\"#080610\" stop-opacity=\".32\"/><stop offset=\"1\" stop-color=\"#010107\" stop-opacity=\".88\"/></radialGradient></defs>';
 s+='<rect width=\"1280\" height=\"720\" fill=\"#070611\" opacity=\".48\"/><rect width=\"1280\" height=\"720\" fill=\"url(#edoSusVignette)\"/>';
 const aura=26+Math.sin(n*.09)*9;
 s+='<g opacity=\"'+(.28+.28*ease)+'\"><ellipse cx=\"'+p.x+'\" cy=\"'+(p.y-178*scale)+'\" rx=\"'+(175*scale+aura)+'\" ry=\"'+(248*scale+aura)+'\" fill=\"#6551b6\" opacity=\".14\"/><ellipse cx=\"'+p.x+'\" cy=\"'+(p.y-172*scale)+'\" rx=\"'+(139*scale+aura)+'\" ry=\"'+(214*scale+aura)+'\" fill=\"none\" stroke=\"#a99dff\" stroke-width=\"2.5\" stroke-dasharray=\"7 13\"/><ellipse cx=\"'+p.x+'\" cy=\"'+(p.y-174*scale)+'\" rx=\"'+(108*scale+aura)+'\" ry=\"'+(182*scale+aura)+'\" fill=\"none\" stroke=\"#e5e1ff\" stroke-width=\"1.2\" opacity=\".5\"/></g>';
 // A complete armored Susanoo silhouette: helmet, horned crest, shoulder wings, ribbed cuirass, limbs and a full-length blade.
 s+='<g transform=\"translate('+p.x+' '+p.y+') scale('+(d*scale)+' '+scale+')\" opacity=\"'+(.2+.8*ease)+'\">';
 s+='<ellipse cx=\"0\" cy=\"-18\" rx=\"108\" ry=\"15\" fill=\"#06040e\" opacity=\".8\"/><path d=\"M -84 -80 L -112 -35 L -70 -24 L -33 -49 L 0 -29 L 35 -49 L 74 -24 L 115 -37 L 83 -84 Z\" fill=\"#25243d\" stroke=\"#aaa9d4\" stroke-width=\"3\"/>';
 s+='<path d=\"M -35 -88 L -28 -38 L -54 -25 L -67 -28 L -61 -88 Z M 35 -88 L 28 -38 L 54 -25 L 67 -28 L 61 -88 Z\" fill=\"url(#edoSusArmor)\" stroke=\"#222039\" stroke-width=\"4\"/>';
 s+='<path d=\"M -68 -87 L -88 -174 L -54 -211 L -27 -183 L -8 -151 L 0 -112 L 8 -151 L 27 -183 L 54 -211 L 88 -174 L 68 -87 L 36 -64 L 0 -57 L -36 -64 Z\" fill=\"url(#edoSusArmor)\" stroke=\"#d8dcfa\" stroke-width=\"4\"/>';
 s+='<path d=\"M -84 -179 L -137 -235 L -163 -286 L -113 -267 L -78 -235 L -57 -195 Z\" fill=\"#3a385b\" stroke=\"#c0c4e8\" stroke-width=\"3\"/><path d=\"M 84 -179 L 137 -235 L 163 -286 L 113 -267 L 78 -235 L 57 -195 Z\" fill=\"#3a385b\" stroke=\"#c0c4e8\" stroke-width=\"3\"/>';
 s+='<path d=\"M -112 -235 L -176 -254 L -145 -204 L -102 -190 Z M 112 -235 L 176 -254 L 145 -204 L 102 -190 Z\" fill=\"#19182b\" stroke=\"#8b91bc\" stroke-width=\"3\"/>';
 s+='<path d=\"M -39 -268 L -61 -308 L -43 -307 L -23 -334 L -8 -302 L 0 -288 L 8 -302 L 23 -334 L 43 -307 L 61 -308 L 39 -268 Z\" fill=\"url(#edoSusArmor)\" stroke=\"#eff0ff\" stroke-width=\"3\"/>';
 s+='<path d=\"M -36 -275 L -31 -326 L -17 -301 L 0 -354 L 17 -301 L 31 -326 L 36 -275 Z\" fill=\"#25213c\" stroke=\"#b4b6df\" stroke-width=\"3\"/>';
 s+='<path d=\"M -28 -280 Q -43 -299 -35 -326 L -18 -343 L 0 -351 L 18 -343 L 35 -326 Q 43 -299 28 -280 L 22 -252 L 0 -241 L -22 -252 Z\" fill=\"#555675\" stroke=\"#e0e5ff\" stroke-width=\"3\"/>';
 s+='<path d=\"M -27 -314 L -8 -309 L -14 -298 L -30 -303 Z M 27 -314 L 8 -309 L 14 -298 L 30 -303 Z\" fill=\"#e7e7ff\" stroke=\"#b4b6f4\" stroke-width=\"2\"/><path d=\"M -25 -310 L -11 -307 L -18 -303 Z M 25 -310 L 11 -307 L 18 -303 Z\" fill=\"#f2e9ff\"/>';
 s+='<path d=\"M -12 -281 L 0 -291 L 12 -281 L 8 -260 L 0 -251 L -8 -260 Z\" fill=\"#0a0712\" stroke=\"#b7a9e8\" stroke-width=\"2\"/><path d=\"M -9 -274 L 0 -270 L 9 -274\" stroke=\"#d7d7f5\" stroke-width=\"2.5\" fill=\"none\"/>';
 s+='<path d=\"M -58 -239 L -92 -218 L -87 -158 L -60 -125 L -34 -143 L -24 -199 Z\" fill=\"#3f405e\" stroke=\"#bec7ec\" stroke-width=\"3\"/><path d=\"M 58 -239 L 92 -218 L 87 -158 L 60 -125 L 34 -143 L 24 -199 Z\" fill=\"#3f405e\" stroke=\"#bec7ec\" stroke-width=\"3\"/>';
 s+='<path d=\"M -66 -231 L -104 -248 L -128 -222 L -107 -181 L -76 -173 L -57 -194 Z M 66 -231 L 104 -248 L 128 -222 L 107 -181 L 76 -173 L 57 -194 Z\" fill=\"url(#edoSusArmor)\" stroke=\"#f0efff\" stroke-width=\"3\"/>';
 s+='<path d=\"M -56 -222 Q 0 -255 56 -222 L 75 -184 L 49 -126 L 0 -103 L -49 -126 L -75 -184 Z\" fill=\"#222138\" stroke=\"#a7a8d2\" stroke-width=\"4\"/>';
 for(let i=0;i<4;i++){const yy=-211+i*19,ww=43+i*7;s+='<path d=\"M -'+ww+' '+yy+' Q 0 '+(yy+20)+' '+ww+' '+yy+'\" fill=\"none\" stroke=\"'+(i%2?'#c7c9ee':'#7f83b4')+'\" stroke-width=\"5\" opacity=\".95\"/>';}
 s+='<path d=\"M -43 -220 L -30 -185 L 0 -166 L 30 -185 L 43 -220 L 28 -230 L 0 -212 L -28 -230 Z\" fill=\"url(#edoSusArmor)\" stroke=\"#d6d7f4\" stroke-width=\"2.5\"/>';
 s+='<path d=\"M -23 -174 L -37 -145 L -25 -119 L 0 -111 L 25 -119 L 37 -145 L 23 -174 L 0 -158 Z\" fill=\"#4a456e\" stroke=\"#dddafa\" stroke-width=\"3\"/><path d=\"M -8 -154 L 0 -166 L 8 -154 L 0 -137 Z\" fill=\"#e7e1ff\" stroke=\"#8174bf\" stroke-width=\"2\"/>';
 s+='<path d=\"M -74 -226 L -105 -192 L -91 -148 L -66 -126 L -53 -157 L -58 -191 Z\" fill=\"#686887\" stroke=\"#dadcf4\" stroke-width=\"3\"/><path d=\"M 74 -226 L 105 -192 L 91 -148 L 66 -126 L 53 -157 L 58 -191 Z\" fill=\"#686887\" stroke=\"#dadcf4\" stroke-width=\"3\"/>';
 s+='<path d=\"M -75 -143 L -49 -119 L -46 -83 L -65 -60 L -91 -77 L -93 -115 Z\" fill=\"url(#edoSusArmor)\" stroke=\"#bfc5e4\" stroke-width=\"3\"/><path d=\"M 75 -143 L 49 -119 L 46 -83 L 65 -60 L 91 -77 L 93 -115 Z\" fill=\"url(#edoSusArmor)\" stroke=\"#bfc5e4\" stroke-width=\"3\"/>';
 s+='<path d=\"M -34 -113 L -56 -86 L -48 -35 L -24 -23 L -8 -34 L -12 -87 Z M 34 -113 L 56 -86 L 48 -35 L 24 -23 L 8 -34 L 12 -87 Z\" fill=\"#33314d\" stroke=\"#adb5dc\" stroke-width=\"3\"/>';
 // The sword follows the full cinematic wind-up and snaps down during the dimensional cut.
 s+='<g transform=\"translate(80 -253) rotate('+swordAngle+')\"><path d=\"M -18 7 L -24 -37 L -15 -130 L 14 -273 L 30 -291 L 29 -245 L 18 -128 L 16 -38 L 11 7 Z\" fill=\"url(#edoSusBlade)\" stroke=\"#f3efff\" stroke-width=\"3.5\"/><path d=\"M -8 -35 L 20 -252\" stroke=\"#ffffff\" stroke-width=\"3\" opacity=\".85\"/><path d=\"M -28 -27 L 24 -17 L 36 -6 L -35 -10 Z\" fill=\"#c7c6e9\" stroke=\"#fff6dd\" stroke-width=\"2.5\"/><path d=\"M -8 7 L -11 32 L -2 41 L 10 32 L 8 7 Z\" fill=\"#171124\" stroke=\"#aeb7dd\" stroke-width=\"3\"/><path d=\"M -8 12 L 8 29 M 8 12 L -8 29\" stroke=\"#d9dff6\" stroke-width=\"2\"/></g>';
 s+='<path d=\"M -33 -92 L -8 -72 L 0 -43 L 8 -72 L 33 -92 L 24 -48 L 0 -31 L -24 -48 Z\" fill=\"#7d7ca7\" stroke=\"#d6d9f5\" stroke-width=\"3\"/>';
 s+='<path d=\"M -16 -25 L -25 -8 L 0 0 L 25 -8 L 16 -25 Z\" fill=\"#27253d\" stroke=\"#d0d4ef\" stroke-width=\"2\"/>';
 s+='</g>';
 // Five fast air cuts, then the ground-splitting pressure sequence.
 for(const h of c.hitEvents||[]){
  const age=n-h.frame;if(age<0||age>9)continue;
  const hp=point(h.x,h.y),fade=1-age/10,ang=(h.index%2?1:-1)*(h.final?-.45:(.35+(h.index%3)*.18));
  const dx=235,dy=130,ax=Math.cos(ang)*dx,ay=Math.sin(ang)*dy;
  s+='<g opacity=\"'+fade+'\"><path d=\"M '+(hp.x-ax)+' '+(hp.y-ay)+' Q '+hp.x+' '+(hp.y+((h.index%2)?-42:42))+' '+(hp.x+ax)+' '+(hp.y+ay)+'\" fill=\"none\" stroke=\"url(#edoSusSlash)\" stroke-width=\"'+(h.final?45:31)+'\" stroke-linecap=\"round\" opacity=\".5\"/><path d=\"M '+(hp.x-ax)+' '+(hp.y-ay)+' Q '+hp.x+' '+(hp.y+((h.index%2)?-42:42))+' '+(hp.x+ax)+' '+(hp.y+ay)+'\" fill=\"none\" stroke=\"#f8f4ff\" stroke-width=\"'+(h.final?12:7)+'\" stroke-linecap=\"round\"/><circle cx=\"'+hp.x+'\" cy=\"'+hp.y+'\" r=\"'+(17+age*16)+'\" fill=\"none\" stroke=\"'+(h.final?'#fff2ff':'#b9a4f2')+'\" stroke-width=\"'+(h.final?4:2)+'\" opacity=\".8\"/></g>';
 }
 // Low-cost ash streaks and an expanding impact floor ring.
 if(n>24&&n<390){
  for(let i=0;i<13;i++){const x=(i*151+n*(.6+(i%3)*.14))%1280,y=(i*91+n*(.9+(i%4)*.13))%630;s+='<path d=\"M '+x+' '+y+' l '+(-13-(i%4)*4)+' '+(16+(i%5)*4)+'\" stroke=\"'+(i%3?'#827ab8':'#efe9ff')+'\" stroke-width=\"1.3\" opacity=\"'+(.15+ease*.2)+'\"/>';}
 }
 if(n>=150&&n<240){
  const prog=(n-150)/90,rad=90+prog*370;
  s+='<ellipse cx=\"'+(p.x+(tp.x-p.x)*.44)+'\" cy=\"'+(p.y+12)+'\" rx=\"'+rad+'\" ry=\"'+(13+prog*10)+'\" fill=\"none\" stroke=\"#9ba2d9\" stroke-width=\"'+(4-prog*2)+'\" opacity=\"'+(.6-prog*.3)+'\"/><path d=\"M 0 634 Q 240 610 420 640 T 835 630 T 1280 636\" fill=\"none\" stroke=\"#aab0e9\" stroke-width=\"2\" opacity=\".55\"/>';
 }
 if(n>=240&&n<330){
  const charge=clamp((n-240)/90,0,1),cx=p.x+d*85,cy=p.y-475*scale;
  s+='<g opacity=\"'+(.25+charge*.5)+'\"><circle cx=\"'+cx+'\" cy=\"'+cy+'\" r=\"'+(26+charge*74)+'\" fill=\"none\" stroke=\"#e7e3ff\" stroke-width=\"2\" stroke-dasharray=\"5 9\"/><circle cx=\"'+cx+'\" cy=\"'+cy+'\" r=\"'+(13+charge*47)+'\" fill=\"#dedbff\" opacity=\".18\"/><path d=\"M '+cx+' '+(cy-130*charge)+' L '+(cx+9)+' '+(cy-19)+' L '+(cx-11)+' '+(cy+24)+' L '+(cx+7)+' '+(cy+102*charge)+'\" stroke=\"#f7f3ff\" stroke-width=\"2.5\" fill=\"none\"/></g>';
 }
 if(n>=345&&n<=368){
  const age=n-350,tearFade=Math.max(0,1-Math.abs(age)/19);
  const shift=(n<350?1:age<0?1:-1)*Math.min(28,Math.abs(age)*2.8);
  s+='<g opacity=\"'+(.22+tearFade*.55)+'\"><path d=\"M 0 58 L 163 83 L 260 65 L 388 104 L 493 75 L 623 113 L 761 65 L 888 88 L 1012 48 L 1134 82 L 1280 47 L 1280 206 L 1110 224 L 976 190 L 826 231 L 691 193 L 551 225 L 415 182 L 277 220 L 142 183 L 0 202 Z\" fill=\"#9f6cef\" opacity=\".35\" transform=\"translate('+shift+' 0)\"/><path d=\"M 0 65 L 168 92 L 263 69 L 390 110 L 498 81 L 627 120 L 760 72 L 888 94 L 1014 56 L 1137 88 L 1280 54\" fill=\"none\" stroke=\"#f7f2ff\" stroke-width=\"3\"/><path d=\"M 0 201 L 142 183 L 277 220 L 415 182 L 551 225 L 691 193 L 826 231 L 976 190 L 1110 224 L 1280 206\" fill=\"none\" stroke=\"#d52e88\" stroke-width=\"2.5\" transform=\"translate('+(-shift)+' 0)\"/></g>';
 }
 const flashHit=(c.hitEvents||[]).some(h=>n>=h.frame&&n<h.frame+(h.final?7:3));
 if(flashHit){const final=(c.hitEvents||[]).some(h=>h.final&&n>=h.frame&&n<h.frame+5);s+='<rect width=\"1280\" height=\"720\" fill=\"'+(final?'#efe8ff':'#bcb2ef')+'\" opacity=\"'+(final?.22:.09)+'\"/>';}
 const introGlow=clamp(1-n/35,0,1)*.24;
 if(introGlow>0)s+='<rect width=\"1280\" height=\"720\" fill=\"#a99dff\" opacity=\"'+introGlow+'\"/>';
 s+='<rect x=\"0\" y=\"0\" width=\"1280\" height=\"58\" fill=\"#020208\" opacity=\".96\"/><rect x=\"0\" y=\"662\" width=\"1280\" height=\"58\" fill=\"#020208\" opacity=\".96\"/>';
 s+='<text x=\"640\" y=\"34\" text-anchor=\"middle\" fill=\"#e6e2ff\" font-family=\"monospace\" font-size=\"13\" letter-spacing=\"5\" opacity=\".9\">EDO TENSEI  //  PERFECT SUSANOO</text>';
 s+='<text x=\"640\" y=\"694\" text-anchor=\"middle\" fill=\"#f1edff\" font-family=\"serif\" font-size=\"20\" letter-spacing=\"4\">SUSANOO · THIÊN PHÁ TRẢM</text>';
 s+='<text x=\"640\" y=\"714\" text-anchor=\"middle\" fill=\"#9c91cc\" font-family=\"monospace\" font-size=\"9\" letter-spacing=\"3\">SPACE-SEVERING FINISHER   ·   '+Math.min(12,(c.hitEvents||[]).length)+' / 12 IMPACTS</text>';
 return s;
}
function renderStage(){
 if(!stage)return;if(typeof G==='undefined'||G.mode==='menu'||(Q.cinema&&Q.cinema.kind==='tsukuyomi')){stage.innerHTML='';return;}
 let s='';const crow=Q.edoCrowEffect;
 if(crow){const p=point(crow.x,crow.y-78),fade=Math.max(0,1-crow.t/crow.d);s+=crows(p,crow.t,fade*.88);s+='<g opacity="'+fade+'"><ellipse cx="'+p.x+'" cy="'+(p.y+18*p.s)+'" rx="'+(32+crow.t*1.1)*p.s+'" ry="'+(7+crow.t*.1)*p.s+'" fill="#080a12" opacity=".72"/><circle cx="'+p.x+'" cy="'+p.y+'" r="'+(14+crow.t*1.3)*p.s+'" fill="none" stroke="#d7e1f4" stroke-width="2" stroke-dasharray="4 7"/></g>';if(crow.phase==='reappear'&&crow.toX!==undefined)s+=crows(point(crow.toX,crow.toY-80),crow.t+7,fade*.4);}
 for(const q of Q.shots||[])if(q&&q.edoYasaka&&!q.hit&&q.life>0){
  const p=point(q.x,q.y),tr=(q.trail||[]).map(v=>point(v.x,v.y));
  if(tr.length>1){let path='';for(let i=0;i<tr.length;i++)path+=(i?' L ':'M ')+tr[i].x+' '+tr[i].y;s+='<path d="'+path+'" fill="none" stroke="#8195c4" stroke-width="'+(q.r*.85*p.s)+'" opacity=".3" stroke-linecap="round"/><path d="'+path+'" fill="none" stroke="#e3ebfa" stroke-width="'+(q.r*.28*p.s)+'" opacity=".7" stroke-linecap="round"/>';}
  s+='<g transform="translate('+p.x+' '+p.y+') rotate('+(q.rot*57.3)+') scale('+p.s+')"><circle r="'+(q.r*1.5)+'" fill="#cbd8f4" opacity=".16"/><path d="M 0 -'+(q.r*1.45)+' L '+(q.r*.36)+' -'+(q.r*.42)+' L '+(q.r*1.25)+' 0 L '+(q.r*.36)+' '+(q.r*.42)+' L 0 '+(q.r*1.45)+' L -'+(q.r*.36)+' '+(q.r*.42)+' L -'+(q.r*1.25)+' 0 L -'+(q.r*.36)+' -'+(q.r*.42)+' Z" fill="#d9e4f7" stroke="#fff4ce" stroke-width="1.8"/><circle r="'+(q.r*.42)+'" fill="#6e7fa4" stroke="#f4edda" stroke-width="1.3"/></g>';
 }
 const lane=Q.edoBlackFlameZone;
 if(lane){const base=point(lane.x,lane.y+22),left=point(lane.x-lane.width*.5,lane.y+12),right=point(lane.x+lane.width*.5,lane.y+12),fade=Math.max(0,Math.min(1,(lane.d-lane.t)/25));s+='<g opacity="'+fade+'"><ellipse cx="'+base.x+'" cy="'+base.y+'" rx="'+(lane.width*.5*base.s)+'" ry="'+(17*base.s)+'" fill="#05050a" opacity=".82"/><ellipse cx="'+base.x+'" cy="'+base.y+'" rx="'+(lane.width*.38*base.s)+'" ry="'+(9*base.s)+'" fill="#35102c" opacity=".85"/><path d="M '+left.x+' '+left.y+' Q '+(base.x-100*base.s)+' '+(base.y-12*base.s)+' '+(base.x-28*base.s)+' '+(base.y+4*base.s)+' Q '+base.x+' '+(base.y-5*base.s)+' '+(base.x+35*base.s)+' '+(base.y+4*base.s)+' Q '+(base.x+100*base.s)+' '+(base.y-18*base.s)+' '+right.x+' '+right.y+'" fill="none" stroke="#121019" stroke-width="'+(18*base.s)+'"/>';
  for(let i=0;i<10;i++){const x=base.x-lane.width*.42*base.s+((i*31+lane.t*2.4)%(lane.width*.84*base.s)),h=(16+i%4*8+Math.sin(lane.t*.2+i)*5)*base.s;s+='<path d="M '+(x-7*base.s)+' '+(base.y+7*base.s)+' Q '+(x-16*base.s)+' '+(base.y-h*.5)+' '+x+' '+(base.y-h)+' Q '+(x+16*base.s)+' '+(base.y-h*.4)+' '+(x+7*base.s)+' '+(base.y+7*base.s)+' Z" fill="'+(i%3===0?'#a7a2c8':(i%2?'#28102d':'#08070d'))+'" stroke="'+(i%3===0?'#d3d8ef':'#6b2c5e')+'" stroke-width="1.2"/>';}
  s+='</g>';}
 const edoCine=Q.edoSusanooCine;if(edoCine)s+=susanooCinemaSvg(edoCine);
 const ult=Q.edoTotsuka;
 if(ult&&ult.owner){const f=ult.owner,o=ult.target||f.opp,d=f.facing||1,from=point(f.x+d*48,f.y-112),to=point(o&&alive(o)?o.x:f.x+d*430,o&&alive(o)?o.y-100:f.y-100),u=clamp(ult.t/38,0,1),fade=ult.t<54?1:Math.max(0,(ult.d-ult.t)/24),tx=from.x+(to.x-from.x)*u,ty=from.y+(to.y-from.y)*u-10*Math.sin(u*Math.PI)*from.s;
  s+='<g opacity="'+fade+'"><path d="M '+from.x+' '+from.y+' L '+(tx-14*from.s)+' '+(ty+6*from.s)+' L '+tx+' '+ty+' L '+(tx-7*from.s)+' '+(ty+17*from.s)+' Z" fill="#b4a7dc" stroke="#f4eac7" stroke-width="2"/><path d="M '+from.x+' '+(from.y-3*from.s)+' L '+(tx-8*from.s)+' '+(ty+1*from.s)+'" stroke="#fff7dd" stroke-width="'+(4*from.s)+'"/><path d="M '+(from.x-14*from.s)+' '+(from.y+4*from.s)+' L '+(from.x+12*from.s)+' '+(from.y-9*from.s)+' M '+(from.x-9*from.s)+' '+(from.y+11*from.s)+' L '+(from.x+17*from.s)+' '+(from.y-2*from.s)+'" stroke="#8f80bc" stroke-width="'+(5*from.s)+'"/>';
  if(ult.hit){const p=point(o&&alive(o)?o.x:f.x+d*260,o&&alive(o)?o.y-90:f.y-90),rad=(18+ult.t*1.2)*p.s;s+='<ellipse cx="'+p.x+'" cy="'+p.y+'" rx="'+rad+'" ry="'+(rad*1.5)+'" fill="none" stroke="#d9d0f3" stroke-width="3" stroke-dasharray="7 7"/><ellipse cx="'+p.x+'" cy="'+p.y+'" rx="'+(rad*.7)+'" ry="'+(rad*1.2)+'" fill="none" stroke="#fff1c0" stroke-width="2"/>';if(ult.sealed)s+='<text x="'+p.x+'" y="'+(p.y-rad*1.5)+'" text-anchor="middle" font-family="monospace" font-size="18" fill="#f4eac7" letter-spacing="4">SEALED</text>';}
  s+='</g>';}
 stage.innerHTML=s;
}
if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);renderStage();return r;};
if(typeof CHARS!=='undefined'&&CHARS.edo_itachi&&CHARS.edo_itachi.moves&&CHARS.edo_itachi.moves.ult)CHARS.edo_itachi.moves.ult.name='Susanoo: Thiên Phá Trảm';
window.JFF_EDO_ITACHI_SKILLS={ready:true,version:2,cinematicUltimate:'Susanoo: Thiên Phá Trảm · 7 seconds · 12 hit beats',skills:['Crow Body Replacement','Yasaka Barrage','Amaterasu Black Flame Field','Yata Mirror Reversal','Totsuka Sealing Finale']};
console.info('[Edo Itachi] Unique skills loaded: Crow Replacement, Yasaka Barrage, Black Flame Field, Yata Reversal, Totsuka Sealing.');
})();