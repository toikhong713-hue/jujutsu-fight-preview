/* EDO ITACHI SKILL OVERHAUL
   S4 Crow Replacement -> S3 Yasaka Barrage -> S5 Amaterasu Field -> Yata -> animated Susanoo finisher.
   The finisher uses the existing articulated Canvas rig; SVG is reserved for light camera/VFX overlays.
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
const EDO_SUSANOO_HITS=[62,88,114,156,190,224,258];
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
 const c={rebuildVersion:2,owner:f,target:target,frame:0,duration:330,face:d,hitEvents:[],
  ownerStartX:f.x,ownerStartY:f.y,targetStartX:target?target.x:f.x+d*360,targetStartY:target?target.y:f.y,
  ownerInvuln:f.invuln||0,ownerPoseBefore:f.itachiPoseKey||'',ownerCinemaBefore:f.itachiCinemaKind||'',
  ownerSusanooBefore:!!f.itachiSusanooActive,ownerSusanooFramesBefore:f.itachiSusanooFrames||0,
  cameraState:snapshotCamera(),uiDisplays:[],lastHit:0,finalKO:false};
 c.distance=Math.abs(c.targetStartX-c.ownerStartX);
 c.wideZoom=clamp(430/Math.max(260,c.distance+340),.68,1.0);
 Q.edoSusanooCine=c;Q.edoTotsuka=null;Q.edoCrowEffect=null;Q.edoBlackFlameZone=null;
 Q.shots.length=0;Q.clone=null;
 f.facing=d;f.vx=0;f.vy=0;f.itachiPoseKey='ult';f.itachiCinemaKind='ult';
 f.itachiSusanooActive=false;f.invuln=Math.max(f.invuln||0,c.duration+8);
 if(target){
  target.move=null;target.moveKey=null;target.moveFrame=0;target.hasHit=false;target.vx=0;target.vy=0;
  target.blocking=false;target.grabTarget=null;target.grabber=null;
  target.hitstun=c.duration+8;target.immobilize=c.duration+8;target.itachiCinemaStun=c.duration+8;
  target.state='HITSTUN';target.stateFrame=0;
 }
 hideCinemaHud(c);
 Q.cinema={kind:'edoSusanoo',owner:f,target:target,frame:-1,duration:c.duration,hitDone:false,
  createdAt:Q.tick,targetStartHp:target?target.hp:0,edoCine:c};
 if(typeof SFX!=='undefined'&&SFX.awaken)SFX.awaken();
 animateSusanooCamera(c,0);return true;
}
function animateSusanooCamera(c,n){
 if(!c||typeof cam==='undefined'||!cam)return;
 const orig=c.cameraState||{},ox=c.ownerStartX,oy=c.ownerStartY,dx=c.targetStartX-ox;
 let x=ox+dx*.36,y=oy-138,z=c.wideZoom;
 if(n<38){const p=smooth(n/38);x=ox+dx*.22;y=oy-92;z=1.02-(1.02-c.wideZoom)*p;}
 else if(n<150){x=ox+dx*.37+Math.sin(n*.052)*9;y=oy-150;z=c.wideZoom*(1+.025*Math.sin(n*.07));}
 else if(n<236){x=ox+dx*.42+Math.sin((n-150)*.08)*16;y=oy-184;z=c.wideZoom*.98;}
 else if(n<286){const p=smooth((n-236)/50);x=ox+dx*.44;y=oy-160;z=c.wideZoom*(.98+.04*p);}
 else{
  const p=smooth((n-286)/44),oxCam=Number.isFinite(orig.x)?orig.x:ox,oyCam=Number.isFinite(orig.y)?orig.y-120:oy-120,oz=Number.isFinite(orig.zoom)?orig.zoom:1;
  x=oxCam+(ox+dx*.42-oxCam)*(1-p);y=oyCam+(oy-152-oyCam)*(1-p);z=oz+(c.wideZoom*.98-oz)*(1-p);
 }
 cam.x=x;cam.y=y;cam.zoom=z;if('tx' in cam)cam.tx=x;if('ty' in cam)cam.ty=y;if('tzoom' in cam)cam.tzoom=z;
}
function susanooImpact(c,n){
 const o=c.target,final=n===258,tx=o&&Number.isFinite(o.x)?o.x:c.targetStartX,ty=o&&Number.isFinite(o.y)?o.y-88:c.targetStartY-88;
 c.lastHit=n;c.hitEvents.push({frame:n,x:tx,y:ty,final:final,index:c.hitEvents.length+1});
 if(!o||!alive(o))return;
 const max=o.maxHp||200;
 if(final){
  const damage=Math.round(max*.42);
  if(o.hp<=damage||o.hp/Math.max(1,max)<=.22){o.hp=0;o.state='DEFEAT';o.stateFrame=0;c.finalKO=true;}
  else{o.hp=Math.max(1,o.hp-damage);o.state='HITSTUN';o.stateFrame=0;o.hitstun=34;}
  o.x=clamp(c.targetStartX+c.face*84,window.WALL||130,arena()-(window.WALL||130));o.y=c.targetStartY;
 }else{o.hp=Math.max(1,o.hp-Math.max(1,Math.round(max*.052)));o.state='HITSTUN';o.stateFrame=0;o.hitstun=22;}
 if(typeof SFX!=='undefined'){if(final&&SFX.blackflash)SFX.blackflash();else if(c.hitEvents.length%2===0&&SFX.heavy)SFX.heavy();}
 if(final){fx('shock',tx,ty,34,{edoSusanoo:true,final:true});if(typeof flash==='function')flash(.26,'#a98aff');if(typeof shake==='function')shake(13);}
 else if(c.hitEvents.length%2===0){fx('shock',tx,ty,17,{edoSusanoo:true,index:c.hitEvents.length});if(typeof shake==='function')shake(5);}
}
function finishEdoSusanooCinema(){
 const c=Q.edoSusanooCine;if(!c)return;
 const f=c.owner,o=c.target;
 if(o){
  o.immobilize=0;o.hitstun=0;o.itachiCinemaStun=0;o.vx=0;o.vy=0;o.move=null;o.moveKey=null;o.moveFrame=0;o.grabTarget=null;o.grabber=null;
  o.y=c.targetStartY;
  if(o.hp<=0||o.state==='DEFEAT'){o.hp=0;o.state='DEFEAT';o.stateFrame=0;}
  else{if(c.lastHit>=258)o.x=clamp(c.targetStartX+c.face*84,window.WALL||130,arena()-(window.WALL||130));else o.x=c.targetStartX;o.state='IDLE';o.stateFrame=0;o.invuln=Math.max(o.invuln||0,18);}
 }
 if(f){
  f.itachiCinemaKind=c.ownerCinemaBefore||'';f.itachiPoseKey='';f.itachiSusanooActive=c.ownerSusanooBefore;f.itachiSusanooFrames=c.ownerSusanooFramesBefore;
  f.invuln=c.ownerInvuln;f.vx=0;f.vy=0;f.move=null;f.moveKey=null;f.moveFrame=0;
  if(f.hp<=0||f.state==='DEFEAT'){f.hp=0;f.state='DEFEAT';f.stateFrame=0;}else{f.state='IDLE';f.stateFrame=0;}
 }
 restoreCamera(c);restoreCinemaHud(c);Q.edoSusanooCine=null;
 if(Q.cinema&&Q.cinema.kind==='edoSusanoo')Q.cinema=null;
}
function updateSusanooCinemaFrame(c,n){
 if(!c)return;c.frame=n;
 if(c.target&&alive(c.target)){
  if(n>=164&&n<=218){const p=(n-164)/54;c.target.x=c.targetStartX+c.face*22*Math.sin(p*Math.PI);c.target.y=c.targetStartY-86*Math.sin(p*Math.PI);}
  else if(n>218&&n<258){c.target.x=c.targetStartX;c.target.y=c.targetStartY;}
 }
 for(const h of EDO_SUSANOO_HITS)if(n===h)susanooImpact(c,n);
 if(n===4)fx('reflect',c.ownerStartX,c.ownerStartY-145,24,{edoSusanoo:true,reveal:true});
 if(n===38||n===118||n===156||n===224)fx('shock',c.owner.x,c.owner.y-90,22,{edoSusanoo:true,beat:n});
 if(n===258&&typeof SFX!=='undefined'&&SFX.awaken)SFX.awaken();
 animateSusanooCamera(c,n);
}
function updateTotsuka(f,n){
 if(n===1){
  if(Q.cinema){stop(f);return;}
  f.itachiPoseKey='ult';if(alive(f.opp)&&Math.abs(f.opp.y-f.y)<=340)f.facing=f.opp.x>=f.x?1:-1;
  f.vx=0;f.vy=0;beginEdoSusanoo(f);return;
 }
 if(n>=2&&n<330){f.itachiPoseKey='ult';return;}
 if(n>=330&&!Q.edoSusanooCine)stop(f);
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
 const n=c.frame||0,o=c.target,dir=c.face||1,owner=point(c.owner.x,c.owner.y);
 const target=point(o&&Number.isFinite(o.x)?o.x:c.targetStartX,o&&Number.isFinite(o.y)?o.y-82:c.targetStartY-82);
 const appear=smooth(n/42),s=clamp(1.08*owner.s,.88,1.22),baseY=Math.min(674,Math.max(410,owner.y+5*owner.s));
 const combo=n>=48&&n<132,guard=n>=132&&n<194,final=n>=234&&n<286,seal=n>=258;
 const armL=guard?-28:(combo?Math.sin(n*.17)*32:-18),armR=final?-72:(combo?-48+Math.sin(n*.22)*62:(guard?18:-32));
 const swordA=combo?Math.sin(n*.17)*34:(final?-54+(n-234)*1.5:(guard?-14:-34));
 let svg='<defs>'+
 '<radialGradient id="edoNewAura"><stop offset="0" stop-color="#e6d7ff" stop-opacity=".5"/><stop offset=".36" stop-color="#8158ff" stop-opacity=".28"/><stop offset="1" stop-color="#2a0b63" stop-opacity="0"/></radialGradient>'+
 '<linearGradient id="edoNewArmor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f6f1ff"/><stop offset=".16" stop-color="#bda3ff"/><stop offset=".42" stop-color="#7049d6"/><stop offset=".72" stop-color="#30205f"/><stop offset="1" stop-color="#120c2d"/></linearGradient>'+
 '<linearGradient id="edoNewBlade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffaff"/><stop offset=".18" stop-color="#d4c5ff"/><stop offset=".46" stop-color="#8c69ff"/><stop offset=".72" stop-color="#f9f5ff"/><stop offset="1" stop-color="#4d2ab5"/></linearGradient>'+
 '</defs>';
 svg+='<rect width="1280" height="720" fill="#09051a" opacity=".19"/><rect width="1280" height="720" fill="#5726bd" opacity="'+(final?.075:.025)+'"/>';
 for(let i=0;i<7;i++){const x=32+i*197+(n%17)*.7,off=Math.sin(n*.035+i*2.2)*13;svg+='<path d="M '+x+' 45 L '+(x-18+off)+' 164 L '+(x+16-off)+' 238 L '+(x-7)+' 322" fill="none" stroke="'+(i%2?'#8060d9':'#e9e1ff')+'" stroke-width="'+(i%3===0?2.2:1)+'" opacity="'+(.16+appear*.18)+'"/>';}
 if(n<54||guard||seal){const rr=44+appear*128+Math.sin(n*.09)*5,cx=owner.x,cy=baseY-212*s;svg+='<g opacity="'+(.22+appear*.42)+'"><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rr+'" ry="'+(rr*.32)+'" fill="none" stroke="#a88cff" stroke-width="2.2" stroke-dasharray="8 10" transform="rotate('+(-17+n*.7)+' '+cx+' '+cy+')"/><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(rr*.68)+'" ry="'+(rr*.48)+'" fill="none" stroke="#f3edff" stroke-width="1.1" stroke-dasharray="3 9" transform="rotate('+(23-n*.55)+' '+cx+' '+cy+')"/></g>';}
 // New articulated guardian: oversized head, layered armor, moving arms, giant Yata and Totsuka.
 svg+='<g transform="translate('+owner.x+' '+baseY+') scale('+(dir*s*appear)+' '+(s*appear)+')" opacity="'+(.38+appear*.62)+'">';
 svg+='<ellipse cx="0" cy="-177" rx="170" ry="244" fill="url(#edoNewAura)"/><ellipse cx="0" cy="-18" rx="128" ry="19" fill="#7b50ef" opacity=".22"/>';
 svg+='<path d="M -54 -162 L -78 -102 L -69 -32 L -28 -25 L -17 -91 L -17 -152 Z M 18 -152 L 18 -91 L 29 -25 L 71 -32 L 79 -102 L 54 -162 Z" fill="url(#edoNewArmor)" stroke="#d4c5ff" stroke-width="4"/>';
 svg+='<path d="M -77 -95 L -35 -87 L -39 -37 L -77 -35 Z M 35 -87 L 77 -95 L 77 -35 L 39 -37 Z" fill="#211443" stroke="#8766f7" stroke-width="2.5"/>';
 svg+='<path d="M -51 -204 L -91 -178 L -101 -117 L -54 -104 L -18 -153 L 0 -139 L 18 -153 L 54 -104 L 101 -117 L 91 -178 L 51 -204 Z" fill="url(#edoNewArmor)" stroke="#e0d5ff" stroke-width="4"/>';
 svg+='<path d="M -77 -169 L -54 -145 L -46 -117 L -31 -139 L -19 -116 L 0 -136 L 19 -116 L 31 -139 L 46 -117 L 54 -145 L 77 -169" fill="none" stroke="#5d3ab9" stroke-width="5"/>';
 svg+='<path d="M -49 -281 L -78 -252 L -62 -196 L -35 -165 L 35 -165 L 62 -196 L 78 -252 L 49 -281 L 24 -265 L 0 -273 L -24 -265 Z" fill="url(#edoNewArmor)" stroke="#e6dcff" stroke-width="4"/>';
 for(let i=0;i<4;i++){const yy=-248+i*17;svg+='<path d="M -50 '+yy+' Q -20 '+(yy+17)+' 0 '+(yy+10)+' Q 20 '+(yy+17)+' 50 '+yy+'" fill="none" stroke="'+(i%2?'#6244bd':'#f0eaff')+'" stroke-width="'+(i%2?4:2.5)+'" opacity=".9"/>';}
 svg+='<path d="M -27 -220 L 0 -234 L 27 -220 L 17 -190 L 0 -177 L -17 -190 Z" fill="#160d31" stroke="#b8a0ff" stroke-width="3"/><path d="M -12 -215 L 0 -202 L 12 -215" fill="none" stroke="#fffaff" stroke-width="3"/>';
 svg+='<g transform="rotate('+armL+' -68 -258)"><path d="M -64 -269 Q -105 -296 -124 -265 L -143 -220 L -111 -192 L -76 -222 Z" fill="url(#edoNewArmor)" stroke="#e1d7ff" stroke-width="4"/><path d="M -124 -236 L -148 -189 L -125 -160 L -94 -185 L -105 -216 Z" fill="#39236f" stroke="#b19aff" stroke-width="3"/><path d="M -135 -190 L -151 -169 L -122 -150 L -104 -173 Z" fill="#ede6ff" stroke="#8661e9" stroke-width="3"/></g>';
 svg+='<g transform="rotate('+armR+' 68 -260)"><path d="M 64 -269 Q 105 -296 124 -265 L 143 -220 L 111 -192 L 76 -222 Z" fill="url(#edoNewArmor)" stroke="#e1d7ff" stroke-width="4"/><path d="M 124 -236 L 148 -189 L 125 -160 L 94 -185 L 105 -216 Z" fill="#39236f" stroke="#b19aff" stroke-width="3"/><path d="M 135 -190 L 151 -169 L 122 -150 L 104 -173 Z" fill="#ede6ff" stroke="#8661e9" stroke-width="3"/></g>';
 svg+='<path d="M -48 -285 L -63 -318 L -39 -305 L -31 -346 L -10 -321 L 0 -362 L 13 -321 L 35 -346 L 42 -307 L 64 -319 L 47 -284 L 31 -267 L -31 -267 Z" fill="#201044" stroke="#b8a0ff" stroke-width="4"/>';
 svg+='<path d="M -35 -299 L -18 -312 L 0 -304 L 18 -312 L 35 -299 L 28 -276 L 0 -262 L -28 -276 Z" fill="url(#edoNewArmor)" stroke="#f3edff" stroke-width="3"/>';
 svg+='<path d="M -28 -287 L -9 -281 L -16 -273 Z M 28 -287 L 9 -281 L 16 -273 Z" fill="#fffaff"/><path d="M -8 -270 L 0 -263 L 8 -270" fill="none" stroke="#f4eaff" stroke-width="2.4"/>';
 svg+='<g transform="translate(-137 -196) scale(1.06)"><ellipse rx="48" ry="69" fill="#150c30" stroke="#d6c8ff" stroke-width="5"/><ellipse rx="38" ry="58" fill="none" stroke="#875ef0" stroke-width="4" stroke-dasharray="7 5" transform="rotate('+(-n*1.7)+')"/><path d="M 0 -49 L 12 -17 L 35 0 L 12 17 L 0 49 L -12 17 L -35 0 L -12 -17 Z" fill="url(#edoNewArmor)" stroke="#fffaff" stroke-width="2.5"/><circle r="12" fill="#f1eaff" opacity=".82"/><circle r="5" fill="#7150d9"/></g>';
 svg+='<g transform="translate(118 -218) rotate('+swordA+')"><path d="M -8 16 L 8 16 L 7 -23 L -7 -23 Z" fill="#2b1748" stroke="#d9cbff" stroke-width="2"/><path d="M -17 -22 L 17 -22 L 21 -15 L -20 -15 Z" fill="#c7b5ff" stroke="#fffaff" stroke-width="2"/><path d="M -5 -22 Q -13 -115 -4 -195 L 1 -241 L 11 -202 Q 22 -115 5 -22 Z" fill="url(#edoNewBlade)" stroke="#fffaff" stroke-width="3"/><path d="M 2 -35 L 7 -205" stroke="#fffaff" stroke-width="2.5" opacity=".9"/><path d="M 0 -240 L 13 -203 L 4 -193 Z" fill="#fffaff"/></g>';
 svg+='</g>';
 svg+='<g opacity="'+(.26+appear*.4)+'"><ellipse cx="'+owner.x+'" cy="'+(baseY-10)+'" rx="'+(72+Math.min(150,n*1.1))+'" ry="'+(8+Math.min(17,n*.06))+'" fill="none" stroke="#8f6cff" stroke-width="3" stroke-dasharray="10 12"/>';
 for(let i=0;i<8;i++){const xx=owner.x+(i-3.5)*24,yy=baseY-3,dx=Math.sin(i*3.7+n*.03)*24;svg+='<path d="M '+xx+' '+yy+' l '+dx+' -'+(8+i%4*5)+' l '+(dx*.7)+' -'+(8+i%3*4)+'" fill="none" stroke="'+(i%2?'#8b6bff':'#eee7ff')+'" stroke-width="'+(i%3===0?2.5:1.3)+'"/>';}
 svg+='</g>';
 for(const h of c.hitEvents||[]){
  const age=n-h.frame;if(age<0||age>(h.final?12:7))continue;
  const endX=h.final?target.x+dir*118:target.x+dir*(35+age*12),endY=h.final?target.y-100:target.y-80-age*3,alpha=1-age/(h.final?13:8);
  svg+='<g opacity="'+alpha+'"><path d="M '+(target.x-dir*260)+' '+(endY+130)+' Q '+(target.x-dir*60)+' '+(endY-120)+' '+endX+' '+(endY-35)+'" fill="none" stroke="'+(h.final?'#cdbbff':'#8a68ff')+'" stroke-width="'+(h.final?43:24)+'" stroke-linecap="round"/><path d="M '+(target.x-dir*260)+' '+(endY+130)+' Q '+(target.x-dir*60)+' '+(endY-120)+' '+endX+' '+(endY-35)+'" fill="none" stroke="#fffaff" stroke-width="'+(h.final?11:5)+'" stroke-linecap="round"/>';
  if(h.final)svg+='<path d="M '+(target.x-dir*185)+' '+(target.y-210)+' L '+target.x+' '+(target.y+42)+' L '+(target.x+dir*185)+' '+(target.y-210)+'" fill="none" stroke="#f2eaff" stroke-width="3"/>';
  svg+='</g>';
 }
 if(seal){
  const q=clamp((n-258)/38,0,1),rad=30+q*145;
  svg+='<g transform="translate('+target.x+' '+(target.y-70)+')" opacity="'+(1-q*.18)+'"><circle r="'+rad+'" fill="none" stroke="#a98aff" stroke-width="4" stroke-dasharray="8 12" transform="rotate('+(-n*1.5)+')"/><circle r="'+(rad*.7)+'" fill="none" stroke="#eee7ff" stroke-width="2" stroke-dasharray="3 9"/><path d="M 0 '+(-rad)+' L '+(rad*.19)+' '+(-rad*.21)+' L '+rad+' 0 L '+(rad*.19)+' '+(rad*.21)+' L 0 '+rad+' L '+(-rad*.19)+' '+(rad*.21)+' L '+(-rad)+' 0 L '+(-rad*.19)+' '+(-rad*.21)+' Z" fill="#6540c6" fill-opacity=".12" stroke="#d9ccff" stroke-width="2"/></g>';
 }
 if(n>=256&&n<=270){const q=1-Math.abs(n-258)/13;svg+='<rect width="1280" height="720" fill="#ded4ff" opacity="'+(Math.max(0,q)*.22)+'"/>';}
 for(let i=0;i<10;i++){const xx=(i*139+n*(.6+(i%3)*.17))%1280,yy=515-((i*61+n*(.8+(i%4)*.13))%390);svg+='<circle cx="'+xx+'" cy="'+yy+'" r="'+(1+i%3*.45)+'" fill="'+(i%2?'#b39aff':'#f4efff')+'" opacity="'+(.24+appear*.55)+'"/>';}
 svg+='<g font-family="monospace"><rect x="0" y="0" width="1280" height="42" fill="#08051a" opacity=".73"/><text x="30" y="25" fill="#d7c9ff" font-size="12" letter-spacing="3">EDO TENSEI // COMPLETE SUSANOO</text><text x="1250" y="25" text-anchor="end" fill="#f3ecff" font-size="11" letter-spacing="2">'+Math.min(7,c.hitEvents.length)+' / 7 IMPACTS</text><rect x="0" y="676" width="1280" height="44" fill="#08051a" opacity=".75"/><text x="640" y="703" text-anchor="middle" fill="#f0eaff" font-family="serif" font-size="19" letter-spacing="4">TOTSUKA SEALING FINALE</text></g>';
 return svg;
}
function renderStage(){
 if(!stage)return;
 if(Q.edoSusanooCine&&Q.edoSusanooCine.rebuildVersion===2){stage.innerHTML=susanooCinemaSvg(Q.edoSusanooCine);return;}
 if(typeof G==='undefined'||G.mode==='menu'||(Q.cinema&&Q.cinema.kind==='tsukuyomi')){stage.innerHTML='';return;}
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
window.JFF_EDO_ITACHI_SKILLS={ready:true,version:4,cinematicUltimate:'Complete Susanoo: Totsuka Sealing Finale · 5.5 seconds · giant purple SVG battle rig · 7 impact beats',skills:['Crow Body Replacement','Yasaka Barrage','Amaterasu Black Flame Field','Yata Mirror Reversal','Totsuka Sealing Finale']};
console.info('[Edo Itachi] New purple Susanoo ultimate loaded; bounded SVG render and Esc-safe frame loop enabled.');
})();