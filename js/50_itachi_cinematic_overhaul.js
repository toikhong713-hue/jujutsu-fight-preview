/* ITACHI CINEMATIC OVERHAUL v1.0: Katon, ranged Amaterasu, Tsukuyomi, enlarged Susanoo. */
(function(){
'use strict';
if(window.__JFF_ITACHI_CINEMATIC_V1__)return;
const Q=window.JFF_ITACHI_REBOOT;if(!Q)return;
window.__JFF_ITACHI_CINEMATIC_V1__=true;
const oldStart=window.startMove,oldUpdate=window.updateMove,oldHit=window.resolveHit,oldReset=window.resetFighter,oldRender=window.render,oldPose=window.applyCharacterIdentityPose,oldStep=window.step;
const fighters=()=>typeof G!=='undefined'&&Array.isArray(G.fighters)?G.fighters:[];
const alive=o=>!!(o&&o.hp>0&&o.state!=='DEFEAT'&&o.state!=='VICTORY');
const down=code=>{const k=typeof KEY!=='undefined'?KEY:(window.KEY||{});return !!k[code];};
const fx=(t,x,y,d,data)=>{if(typeof window.JFF_OUTSIDER_FX==='function')window.JFF_OUTSIDER_FX(t,x,y,d||20,data||{});};
const stopMove=f=>{if(typeof window.endMove==='function')window.endMove(f);else{f.move=null;f.moveKey=null;f.moveFrame=0;f.state='IDLE';}f.itachiPoseKey='';};
function targetFor(f,range){const o=f&&f.opp;return alive(o)&&Math.abs(o.x-f.x)<=range&&Math.abs(o.y-f.y)<245?o:null;}
function startTsukuyomi(a,b,source){
 if(Q.cinema||!alive(a)||!alive(b))return false;
 a.facing=b.x>=a.x?1:-1;a.itachiCounterUntil=0;a.itachiCinemaKind='tsukuyomi';a.itachiPoseKey='s2';a.vx=0;a.invuln=Math.max(a.invuln||0,844);
 if(!a.move){a.move=a.moves&&a.moves.s2||{name:'Tsukuyomi',active:840};a.moveKey='s2';a.moveFrame=0;a.state='ATTACK';}
 b.itachiCinemaStun=843;b.move=null;b.moveKey=null;b.moveFrame=0;b.vx=0;b.vy=0;b.hitstun=Math.max(b.hitstun||0,843);b.immobilize=Math.max(b.immobilize||0,843);b.state='HITSTUN';b.stateFrame=0;
 Q.shots.length=0;Q.clone=null;
 Q.cinema={kind:'tsukuyomi',owner:a,target:b,frame:0,duration:840,hitDone:false,createdAt:Q.tick,targetStartHp:b.hp,source:source||'direct'};
 fx('moon',b.x,b.y-90,840);fx('crows',a.x,a.y-90,48);
 if(typeof flash==='function')flash(.4,'#870e2f');if(typeof shake==='function')shake(8);if(typeof camPunch==='function')camPunch(.22);
 if(typeof SFX!=='undefined'&&SFX.domain)SFX.domain();return true;
}
function addFireball(f,i){
 const d=f.facing||1;Q.shots.push({owner:f,kind:'fireball',x:f.x+d*45,y:f.y-114+(i-3)*2.8,vx:d*(13.1-Math.abs(i-3)*.18),vy:(i-3)*.48-.15,r:i===3?29:23,damage:i===3?10:7,stun:19,kbx:7,kby:-3,life:110,rot:0,hit:false,armorBreak:false});
 if(Q.shots.length>(Q.maxShots||24))Q.shots.splice(0,Q.shots.length-(Q.maxShots||24));
}
function startBreath(f){
 // The fast Tiger/Serpent/Ram/Rat/Dog/Tiger sequence has completed. Lock to stream only.
 f.itachiFireMode='breath';f.itachiFireDone=true;f.itachiPoseKey='s1fire';
 Q.flameBreath={owner:f,t:0,d:84,nextHit:12};
 fx('fire',f.x+(f.facing||1)*72,f.y-105,42,{charge:1,streamStart:true});
 fx('shock',f.x+(f.facing||1)*72,f.y-92,28);
 if(typeof flash==='function')flash(.22,'#e34b29');
 if(typeof shake==='function')shake(5);
 if(typeof camPunch==='function')camPunch(.06);
 if(typeof SFX!=='undefined'&&SFX.fugaRelease)SFX.fugaRelease();
}
function launchGreatFireball(f,q){
 q=clamp(q||.18,.18,1);
 const d=f.facing||1,x=f.x+d*50,y=f.y-117;
 const radius=52+q*24;
 Q.shots.push({owner:f,kind:'fireball',gokakyu:true,trail:[{x:x-d*12,y:y+2},{x,y}],x,y,vx:d*(10.4+q*1.1),vy:-.16,r:radius,damage:Math.round(24+q*10),stun:28+Math.round(q*8),kbx:12+q*4,kby:-6,life:132,rot:0,hit:false,armorBreak:q>=.78});
 if(Q.shots.length>(Q.maxShots||24))Q.shots.splice(0,Q.shots.length-(Q.maxShots||24));
 fx('fire',x,y,42,{charge:q,gokakyu:true});fx('shock',x,y,26);
 const impact=.25+q*.12;
 if(typeof flash==='function')flash(impact,'#e8472f');
 if(typeof shake==='function')shake(Math.max(4,Math.round(impact*26)));
 if(typeof camPunch==='function')camPunch(impact*.33);
 if(typeof SFX!=='undefined'&&SFX.fugaRelease)SFX.fugaRelease();
}
function updateFire(f,n){
 const koto=window.JFF_KOTOAMATSUKAMI;
 const mappedHeld=koto&&typeof koto.isSkillHeld==='function'?koto.isSkillHeld(f,'s1'):null;
 const held=typeof mappedHeld==='boolean'?mappedHeld:down(f.itachiChargeKey||(f.isP2?'Numpad3':'Digit3'));
 f.itachiChargeFrames=n;
 if(f.itachiFireMode==='breath'){
  f.itachiPoseKey='s1fire';
  const b=Q.flameBreath;if(!b||b.owner!==f){stopMove(f);return;}
  b.t++;
  if(b.t>=b.nextHit){
   b.nextHit+=12;
   const target=f.opp,dir=f.facing||1;
   const inBreathRange=!!(target&&target.hp>0&&target.state!=='DEFEAT'&&target.state!=='VICTORY'&&
    (target.x-f.x)*dir>-24&&Math.abs(target.x-f.x)<=520&&Math.abs(target.y-f.y)<=185);
   if(inBreathRange&&typeof window.resolveHit==='function'){
    window.resolveHit(f,target,{damage:4,hitstun:10,blockstun:8,kbx:4,kby:-1,hitstop:3,meter:1,kind:'projectile',type:'projectile'},f.x+dir*300,f.y-105);
   }
  }
  if(b.t>=b.d){Q.flameBreath=null;stopMove(f);}
  return;
 }
 if(f.itachiFireMode==='fireball'){
  f.itachiPoseKey='s1release';
  if(n>=(f.itachiFireFrame||n)+18)stopMove(f);
  return;
 }
 if(f.itachiFireMode==='fireball-seals'){
  f.itachiPoseKey='s1fireball-seals';
  if(n-(f.itachiSealStart||n)>=41){
   f.itachiFireMode='fireball';f.itachiFireDone=true;f.itachiFireFrame=n;f.itachiPoseKey='s1release';
   launchGreatFireball(f,clamp((f.itachiHeldTicks||0)/16,.18,.95));
  }
  return;
 }
 if(f.itachiFireMode==='breath-seals'){
  f.itachiPoseKey='s1breath-seals';
  if(n-(f.itachiSealStart||n)>=23){startBreath(f);}
  return;
 }
 f.itachiPoseKey='s1';
 if(held)f.itachiHeldTicks=(f.itachiHeldTicks||0)+1;
 // A deliberate hold (16 frames) commits to the quick, separate dragon-breath seal chain.
 if(held&&(f.itachiHeldTicks||0)>=16){
  f.itachiFireMode='breath-seals';f.itachiSealStart=n;f.itachiPoseKey='s1breath-seals';return;
 }
 // Releasing before the hold threshold commits to the seven-sign Great Fireball chain.
 if(!held){
  f.itachiFireMode='fireball-seals';f.itachiFireReleased=true;f.itachiSealStart=n;f.itachiPoseKey='s1fireball-seals';return;
 }
}
function updateAmaterasu(f,n){
 f.itachiPoseKey='s5';f.itachiAmaterasuFrame=n;
 if(n===52){
  const o=f.opp;
  if(alive(o)){
   Q.burns=Q.burns.filter(b=>b.target!==o);
   Q.burns.push({target:o,t:0,d:420,next:30,kind:'amaterasu',damage:4});
   Q.amaterasuImpact={owner:f,target:o,t:0,d:42};fx('amaterasu',o.x,o.y-85,48,{charge:1});fx('shock',o.x,o.y-85,32);
   if(typeof flash==='function')flash(.3,'#16071e');if(typeof shake==='function')shake(8);if(typeof SFX!=='undefined'&&SFX.red)SFX.red();
   if(typeof floatText==='function')floatText(o.x,o.y-155,'AMATERASU','#ff6680',18,46);
  }else fx('crows',f.x+(f.facing||1)*55,f.y-90,22);
 }
 if(n>=83)stopMove(f);
}
if(typeof oldStart==='function')window.startMove=function(f,k,isBF){
 if(Q.cinema)return false;const ok=oldStart.apply(this,arguments);
 if(ok&&f&&f.id==='itachi'){
  if(k==='s1'){f.itachiChargeKey=f.isP2?'Numpad3':'Digit3';f.itachiHeldTicks=0;f.itachiFireMode='charge';f.itachiSealMode='charge';f.itachiSealStart=0;f.itachiFireDone=false;f.itachiFireReleased=false;f.itachiChargeFrames=0;if(Q.flameBreath&&Q.flameBreath.owner===f)Q.flameBreath=null;}
  if(k==='s2'){const t=targetFor(f,window.ARENA_W||3200);if(t){f.itachiDirectTsukuyomiTarget=t;f.itachiCounterUntil=0;f.facing=t.x>=f.x?1:-1;}else{f.itachiDirectTsukuyomiTarget=null;f.itachiTsukuyomiCounter=true;}}
  if(k==='s5'){f.itachiAmaterasuFrame=0;Q.amaterasuImpact=null;}
 }
 return ok;
};
if(typeof oldHit==='function')window.resolveHit=function(a,b,mv,hx,hy){
 if(!Q.cinema&&b&&b.id==='itachi'&&b.itachiCounterUntil>Q.tick&&alive(a)){b.itachiCounterUntil=0;startTsukuyomi(b,a,'counter');return 'parry';}
 return oldHit.apply(this,arguments);
};
if(typeof oldUpdate==='function')window.updateMove=function(f){
 if(!f||f.id!=='itachi')return oldUpdate.apply(this,arguments);
 if(Q.cinema&&Q.cinema.owner===f){f.moveFrame=(f.moveFrame||0)+1;return;}
 const k=f.moveKey,n=(f.moveFrame||0)+1;
 if(k==='s1'&&f.move){f.moveFrame=n;updateFire(f,n);return;}
 if(k==='s5'&&f.move){f.moveFrame=n;updateAmaterasu(f,n);return;}
 if(k==='s2'&&f.move&&f.itachiDirectTsukuyomiTarget){
  f.moveFrame=n;f.itachiPoseKey='s2';if(n===1){const t=f.itachiDirectTsukuyomiTarget;f.itachiDirectTsukuyomiTarget=null;if(alive(t))startTsukuyomi(f,t,'direct');else f.itachiCounterUntil=(Q.tick||0)+22;}
  if(!Q.cinema&&n>=42)stopMove(f);return;
 }
 return oldUpdate.apply(this,arguments);
};
if(typeof oldPose==='function')window.applyCharacterIdentityPose=function(P,f){
 oldPose.apply(this,arguments);if(!P||!f||f.id!=='itachi')return;
 const n=f.moveFrame||0,k=f.itachiPoseKey||f.moveKey||'';
 const set=(lean,a,b)=>{P.lean=lean;P.armF=a.slice();P.armB=b.slice();};
 if(k==='s1'&&n<180){const a=[[-4,[42,-29],[112,-29]],[-8,[31,-36],[126,-22]],[-11,[28,-18],[124,-39]],[3,[39,-42],[111,-17]],[-6,[30,-27],[133,-28]],[0,[36,-34],[118,-34]]][Math.floor((n%180)/30)];set(a[0],a[1],a[2]);}
 else if(k==='s1fire')set(-18,[18,-58],[150,-55]);
 else if(k==='s5'&&n<52){const a=[[31,-29,118,-23],[38,-38,127,-12],[24,-18,135,-37],[34,-42,120,-29]][Math.floor(n/13)%4];set(-9,[a[0],a[1]],[a[2],a[3]]);}
 else if(k==='s5')set(-5,[18,-49],[147,-37]);
};
if(typeof oldReset==='function')window.resetFighter=function(f){const r=oldReset.apply(this,arguments);if(f&&f.id==='itachi'){f.itachiFireMode='';f.itachiSealMode='';f.itachiSealStart=0;f.itachiHeldTicks=0;f.itachiDirectTsukuyomiTarget=null;f.itachiAmaterasuFrame=0;}if(Q.flameBreath&&Q.flameBreath.owner===f)Q.flameBreath=null;if(Q.amaterasuImpact&&(Q.amaterasuImpact.owner===f||Q.amaterasuImpact.target===f))Q.amaterasuImpact=null;return r;};

function point(x,y){const z=typeof cam!=='undefined'&&Number.isFinite(cam.zoom)?cam.zoom:1,cx=typeof cam!=='undefined'&&Number.isFinite(cam.x)?cam.x:640,cy=typeof cam!=='undefined'&&Number.isFinite(cam.y)?cam.y:360;return{x:640+((G&&G.shakeX)||0)+(x-cx)*z,y:360+((G&&G.shakeY)||0)+(y-cy)*z,s:z};}
const stage=document.createElementNS('http://www.w3.org/2000/svg','svg');stage.setAttribute('id','jffItachiCinematicStage');stage.setAttribute('viewBox','0 0 1280 720');stage.setAttribute('preserveAspectRatio','none');stage.setAttribute('aria-hidden','true');stage.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:8;pointer-events:none;overflow:hidden;display:block';
const wrap=document.getElementById('wrap');if(wrap)wrap.appendChild(stage);
function blackFire(b){
 const p=point(b.target.x,b.target.y-82),t=Q.tick||0;let s='<g transform="translate('+p.x+' '+p.y+') scale('+p.s+')"><ellipse rx="49" ry="63" fill="#030208" opacity=".9"/>';
 for(let i=0;i<11;i++){const x=(i-5)*7,w=Math.sin((t+i*7)*.19)*6,h=49+(i%4)*12+Math.sin((t+i*5)*.13)*7;s+='<path d="M '+(x-8)+' 36 Q '+(x-24+w)+' 5 '+(x-10)+' '+(-h*.55)+' Q '+(x+w)+' '+(-h*.24)+' '+(x+4)+' '+(-h)+' Q '+(x+25+w)+' '+(-h*.47)+' '+(x+13)+' 18 Q '+(x+10)+' 39 '+(x-8)+' 36 Z" fill="'+(i%3===0?'#240b2d':'#05040a')+'" stroke="'+(i%3===0?'#a12b68':'#57204f')+'" stroke-width="2.2"/>';}
 for(let i=0;i<8;i++){const x=Math.sin((t+i*13)*.16)*(25+i*2),y=-25-((t*1.8+i*31)%92);s+='<circle cx="'+x+'" cy="'+y+'" r="'+(1.4+i%3)+'" fill="'+(i%2?'#ff315d':'#a64fff')+'"/>';}
 return s+'<path d="M -40 2 Q -18 -22 -8 6 T 23 -4 T 42 19" fill="none" stroke="#6b245f" stroke-width="5"/></g>';
}
// Tsukuyomi is rendered only by js/51_itachi_rig_cinematics_v2.js using live game fighters.
function render(){
 if(!stage)return;const cinematic=Q.cinema&&Q.cinema.kind==='ult';stage.style.zIndex=cinematic?'9':'6';if(typeof G!=='undefined'&&G.mode==='menu'){stage.innerHTML='';return;}
 let s='<defs><radialGradient id="it50Gourd"><stop stop-color="#f7cf88"/><stop offset=".28" stop-color="#b85135"/><stop offset=".68" stop-color="#71203c"/><stop offset="1" stop-color="#2b0b20"/></radialGradient><linearGradient id="it50Blade" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#9b9cab"/><stop offset=".22" stop-color="#fff4d2"/><stop offset=".45" stop-color="#8b93a8"/><stop offset=".65" stop-color="#f9f4e5"/><stop offset="1" stop-color="#44445c"/></linearGradient><linearGradient id="it50Armor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8b188"/><stop offset=".23" stop-color="#ad4350"/><stop offset=".62" stop-color="#4a132d"/><stop offset="1" stop-color="#110711"/></linearGradient><linearGradient id="it50ArmorBright" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffc698"/><stop offset=".35" stop-color="#c65b65"/><stop offset=".75" stop-color="#6b203b"/><stop offset="1" stop-color="#230a1e"/></linearGradient><linearGradient id="it50Mirror" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff4cf"/><stop offset=".18" stop-color="#9af4ff"/><stop offset=".36" stop-color="#b59cff"/><stop offset=".54" stop-color="#ffb0cf"/><stop offset=".72" stop-color="#f6f1d0"/><stop offset="1" stop-color="#8ad7fb"/></linearGradient></defs>';
 const c=Q.cinema;
 if(Q.flameBreath&&Q.flameBreath.owner){
  const b=Q.flameBreath,owner=b.owner,d=owner.facing||1;
  const origin=point(owner.x+d*38,owner.y-112);
  const foe=owner.opp,canTrack=alive(foe)&&(foe.x-owner.x)*d>0&&Math.abs(foe.x-owner.x)<=580&&Math.abs(foe.y-owner.y)<=230;
  const target=canTrack?point(foe.x-d*18,foe.y-100):point(owner.x+d*560,owner.y-142+Math.sin(b.t*.16)*12);
  const ex=target.x,ey=target.y,ox=origin.x,oy=origin.y;
  const sway=Math.sin(b.t*.31)*10,midX=(ox+ex)*.5,midY=(oy+ey)*.5+sway;
  const streamPath='M '+ox+' '+oy+' Q '+(midX-20*d)+' '+(midY-14)+' '+ex+' '+ey;
  const lowerPath='M '+ox+' '+(oy+13)+' Q '+(midX-8*d)+' '+(midY+23)+' '+ex+' '+(ey+9);
  s+='<defs><linearGradient id="it50DragonFlame" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff7c1"/><stop offset=".22" stop-color="#ffe16a"/><stop offset=".53" stop-color="#ff7d26"/><stop offset="1" stop-color="#a91820"/></linearGradient></defs>';
  s+='<rect width="1280" height="720" fill="#170307" opacity=".045"/>';
  s+='<path d="'+streamPath+'" fill="none" stroke="#4c090f" stroke-width="88" stroke-linecap="round" opacity=".62"/>';
  s+='<path d="'+streamPath+'" fill="none" stroke="#c51e1e" stroke-width="72" stroke-linecap="round" opacity=".87"/>';
  s+='<path d="'+streamPath+'" fill="none" stroke="#ff4b20" stroke-width="56" stroke-linecap="round" opacity=".94"/>';
  s+='<path d="'+streamPath+'" fill="none" stroke="#ffad38" stroke-width="36" stroke-linecap="round"/>';
  s+='<path d="'+streamPath+'" fill="none" stroke="#fff0a7" stroke-width="19" stroke-linecap="round" opacity=".96"/>';
  s+='<path d="'+lowerPath+'" fill="none" stroke="#ff5a20" stroke-width="27" stroke-linecap="round" opacity=".62"/>';
  for(let i=0;i<12;i++){
   const u=.07+((i*17+b.t*2)%84)/100,v=1-u;
   const px=v*v*ox+2*v*u*midX+u*u*ex,py=v*v*oy+2*v*u*midY+u*u*ey;
   const dx=Math.sin((b.t+i*11)*.23)*(8+i%4*3),dy=Math.cos((b.t+i*7)*.19)*(8+i%3*4);
   s+='<path d="M '+(px-dx)+' '+(py-dy)+' Q '+(px+dx*1.2)+' '+(py-18-dy)+' '+(px+dx*1.6)+' '+(py-25-dy)+'" fill="none" stroke="'+(i%3?'#ff8d35':'#fff0a0')+'" stroke-width="'+(1.5+i%3)+'" stroke-linecap="round" opacity="'+(.28+(i%5)*.12)+'"/>';
  }
  // The leading flame takes a dragon-head silhouette and tracks the opponent's height.
  s+='<g transform="translate('+(ex-7*d)+' '+ey+') scale('+d+' 1)"><path d="M -49 -17 L -34 -37 L -16 -27 L -3 -32 L 15 -21 L 38 -12 L 53 -3 L 36 4 L 52 13 L 28 20 L 7 13 L -7 29 L -18 9 L -42 4 L -34 -5 Z" fill="#e53a24" stroke="#701016" stroke-width="3"/><path d="M -20 -23 L -25 -42 L -8 -30 M 1 -23 L 11 -39 L 17 -22 M -8 10 L 4 23 L 20 13" fill="none" stroke="#ffb13e" stroke-width="5" stroke-linejoin="round"/><path d="M 4 -14 Q 23 -18 40 -8 L 24 -2 L 42 7 Q 22 10 7 1 Z" fill="#ffc54b"/><ellipse cx="12" cy="-12" rx="4.5" ry="3.4" fill="#fff7bf"/><ellipse cx="13" cy="-12" rx="1.8" ry="3" fill="#301012"/><path d="M 27 9 L 39 13 L 22 16" fill="none" stroke="#fff0a2" stroke-width="2.2"/></g>';
  s+='<path d="M 0 80 Q 18 120 7 165 T 9 260 T 0 350 L 0 0 Z M 1280 0 L 1280 360 Q 1260 310 1272 258 T 1268 130 L 1260 0 Z" fill="#ef3c20" opacity=".24"/>';
  s+='<path d="M 0 590 Q 19 550 5 510 T 11 430 L 0 392 L 0 720 L 55 720 Q 31 672 44 634 T 20 603 Z M 1280 720 L 1222 720 Q 1247 673 1235 630 T 1261 580 L 1280 553 Z" fill="#bd1f22" opacity=".23"/>';
  s+='<rect x="7" y="7" width="1266" height="706" rx="12" fill="none" stroke="#ff5527" stroke-width="'+(2.5+Math.sin(b.t*.35)*1.8)+'" opacity=".45"/>';
  for(let i=0;i<18;i++){const x=(i*113+b.t*5)%1280,y=(i*47+b.t*3)%720;s+='<circle cx="'+x+'" cy="'+y+'" r="'+(1.2+i%3*.6)+'" fill="'+(i%2?'#ffb74e':'#ff4e27')+'" opacity="'+(.3+(i%4)*.12)+'"/>';}
  s+='<path d="M '+ox+' '+(oy+75)+' Q '+midX+' '+(midY+115)+' '+ex+' '+(ey+90)+'" fill="none" stroke="#511018" stroke-width="28" opacity=".24"/>';
 }
 if(Q.amaterasuImpact&&Q.amaterasuImpact.t<42){const q=Q.amaterasuImpact,p=point(q.target.x,q.target.y-84),t=q.t;s+='<g opacity="'+(1-t/44)+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="'+(28+t*4)+'" fill="none" stroke="#ff3b69" stroke-width="3"/><circle cx="'+p.x+'" cy="'+p.y+'" r="'+(19+t*2.8)+'" fill="none" stroke="#8d3cff" stroke-width="2"/><path d="M '+(p.x-360)+' '+(p.y-180)+' L '+p.x+' '+p.y+' L '+(p.x+240)+' '+(p.y+60)+'" fill="none" stroke="#ed2c58" stroke-width="2"/><text x="'+p.x+'" y="'+(p.y-90-t)+'" fill="#ff8ca8" font-size="22" font-family="monospace" text-anchor="middle" letter-spacing="6">MANGEKYO LOCK</text></g>';}
 for(const b of Q.burns||[])if(b&&b.kind==='amaterasu'&&alive(b.target))s+=blackFire(b);
 if(!c||c.kind!=='ult')for(const f of fighters())if(f&&f.id==='itachi'&&f.moveKey==='s1'&&f.moveFrame<180){const P=computePose(f),sh={x:f.x+P.lean*.28,y:f.y+P.shY},ef=joint(sh,P.armF[0],20),hf=joint(ef,P.armF[0]+P.armF[1],20),eb=joint(sh,P.armB[0],17),hb=joint(eb,P.armB[0]+P.armB[1],17),mx=(hf.x+hb.x)*.5,my=(hf.y+hb.y)*.5,p=point(mx,my),t=Q.tick||0,r=5+Math.sin(t*.22)*2;s+='<g transform="translate('+p.x+' '+p.y+') scale('+p.s+')"><circle r="'+(r+10)+'" fill="#f15b42" opacity=".13"/><circle r="'+r+'" fill="#ff704b" opacity=".78"/><circle r="'+(r+8)+'" fill="none" stroke="#ffb28b" stroke-width="1.6" stroke-dasharray="3 5"/><path d="M -18 0 Q 0 -8 18 0 M 0 -18 Q 8 0 0 18" fill="none" stroke="#ffc49a" stroke-width="1.3" opacity=".8"/></g>';}
 // Legacy SVG Susanoo art removed: js/52 draws a live articulated Canvas 2D rig.
 stage.innerHTML=s;
}
if(typeof oldRender==='function')window.render=function(){const out=oldRender.apply(this,arguments);render();if(Q.amaterasuImpact)Q.amaterasuImpact.t=Math.min(42,Q.amaterasuImpact.t+1);return out;};
// Apply real HP damage exactly when the live-fighter katana thrust reaches the target.
const tsukuyomiHitFrames=[178,250,322,394,466,538,610,682],tsukuyomiHitDamage=[5,5,6,6,7,8,10,13];
if(typeof oldStep==='function')window.step=function(){
 const result=oldStep.apply(this,arguments);
 const c=Q.cinema;
 if(c&&c.kind==='tsukuyomi'&&c.target){
  const n=c.frame||0,i=tsukuyomiHitFrames.indexOf(n),target=c.target;
  if(i>=0&&target.hp>0){
   if(!c.tsukuyomiStabHits)c.tsukuyomiStabHits=Object.create(null);
   if(!c.tsukuyomiStabHits[i]){
    c.tsukuyomiStabHits[i]=true;c.hitDone=true;
    const damage=tsukuyomiHitDamage[i];
    target.hp=Math.max(0,target.hp-damage);target.hitFlash=10;
    if(target.hp<=0){target.hp=0;target.state='DEFEAT';target.stateFrame=0;}
    fx('shock',target.x,target.y-82,26,{cinematic:'tsukuyomi',stab:i+1});
    fx('reflect',target.x,target.y-82,18,{cinematic:'tsukuyomi',stab:i+1});
    if(typeof floatText==='function')floatText(target.x,target.y-150,'-'+damage,'#ff7a96',18,40);
    if(typeof shake==='function')shake(5+i*2);
    if(typeof flash==='function')flash(.12,'#d91f4a');
   }
  }
 }
 return result;
};
console.info('[JFF Itachi] Katon hand-seals/tap-volley/hold-flamethrower, long-range Amaterasu, 14s Tsukuyomi, and larger Susanoo VFX ready.');
})();