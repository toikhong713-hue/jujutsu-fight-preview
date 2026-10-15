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
  if(n-(f.itachiSealStart||n)>=42){
   f.itachiFireMode='fireball';f.itachiFireDone=true;f.itachiFireFrame=n;f.itachiPoseKey='s1release';
   launchGreatFireball(f,clamp((f.itachiHeldTicks||0)/16,.18,.95));
  }
  return;
 }
 if(f.itachiFireMode==='breath-seals'){
  f.itachiPoseKey='s1breath-seals';
  if(n-(f.itachiSealStart||n)>=24){startBreath(f);}
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
  const origin=point(owner.x+d*42,owner.y-111),scale=origin.s||1;
  const foe=owner.opp,canTrack=alive(foe)&&(foe.x-owner.x)*d>0&&Math.abs(foe.x-owner.x)<=650&&Math.abs(foe.y-owner.y)<=240;
  const aim=canTrack?point(foe.x-d*14,foe.y-100):point(owner.x+d*650,owner.y-136+Math.sin(b.t*.17)*24);
  const ox=origin.x,oy=origin.y,fx=aim.x,fy=aim.y;
  // Keep the dragon face near Itachi. The mouth, not a long neck, becomes the emitter.
  const hx=ox+d*83*scale,hy=oy+Math.sin(b.t*.13)*3*scale;
  const headSize=1.06*scale,mouthX=hx+d*59*headSize,mouthY=hy+1*headSize;
  let endX=fx+d*92*scale,endY=fy+Math.sin(b.t*.21)*15*scale;
  if((endX-mouthX)*d<230*scale){endX=mouthX+d*230*scale;endY=hy+Math.sin(b.t*.25)*26*scale;}
  const dx=endX-mouthX,dist=Math.abs(dx),wave=Math.sin(b.t*.3)*18*scale;
  const spread=(46+Math.min(116,dist*.115)+Math.sin(b.t*.27)*10)*scale;
  const c1x=mouthX+dx*.24,c1y=mouthY-25*scale+wave*.25;
  const c2x=endX-dx*.17,c2y=endY+wave;
  const outer='M '+mouthX+' '+(mouthY-10*scale)+
   ' C '+c1x+' '+(c1y-spread*.10)+' '+c2x+' '+(endY-spread*.78)+' '+endX+' '+(endY-spread)+
   ' C '+(endX-dx*.11)+' '+(endY-spread*.24)+' '+(endX-dx*.11)+' '+(endY+spread*.24)+' '+endX+' '+(endY+spread)+
   ' C '+c2x+' '+(endY+spread*.78)+' '+c1x+' '+(c1y+spread*.10)+' '+mouthX+' '+(mouthY+10*scale)+' Z';
  const middle='M '+mouthX+' '+(mouthY-6*scale)+
   ' C '+(mouthX+dx*.25)+' '+(mouthY-11*scale)+' '+(endX-dx*.16)+' '+(endY-spread*.48)+' '+endX+' '+(endY-spread*.57)+
   ' C '+(endX-dx*.15)+' '+(endY-spread*.14)+' '+(endX-dx*.15)+' '+(endY+spread*.14)+' '+endX+' '+(endY+spread*.57)+
   ' C '+(endX-dx*.16)+' '+(endY+spread*.48)+' '+(mouthX+dx*.25)+' '+(mouthY+11*scale)+' '+mouthX+' '+(mouthY+6*scale)+' Z';
  const core='M '+mouthX+' '+mouthY+
   ' C '+(mouthX+dx*.3)+' '+(mouthY-5*scale)+' '+(endX-dx*.2)+' '+(endY-15*scale)+' '+endX+' '+(endY-8*scale)+
   ' Q '+(endX-dx*.12)+' '+endY+' '+endX+' '+(endY+8*scale)+
   ' C '+(endX-dx*.2)+' '+(endY+15*scale)+' '+(mouthX+dx*.3)+' '+(mouthY+5*scale)+' '+mouthX+' '+mouthY+' Z';
  s+='<defs>'+
   '<linearGradient id="it50DragonFireOuter" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffb72f"/><stop offset=".48" stop-color="#ff3a1e"/><stop offset="1" stop-color="#a80e21"/></linearGradient>'+
   '<linearGradient id="it50DragonFireCore" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffbd0"/><stop offset=".48" stop-color="#fff0a0"/><stop offset="1" stop-color="#ffad32"/></linearGradient>'+
   '<linearGradient id="it50DragonThroat" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#ff3e20"/><stop offset=".55" stop-color="#ffba3b"/><stop offset="1" stop-color="#fff1a0"/></linearGradient>'+
   '</defs>';
  // A short burning mane merges into the face; there is deliberately no long straight neck.
  s+='<path d="M '+(ox+d*10*scale)+' '+(oy-18*scale)+' Q '+(ox+d*39*scale)+' '+(oy-54*scale)+' '+(hx-d*42*headSize)+' '+(hy-22*headSize)+
   ' Q '+(hx-d*63*headSize)+' '+(hy+1*headSize)+' '+(hx-d*32*headSize)+' '+(hy+26*headSize)+
   ' Q '+(ox+d*44*scale)+' '+(oy+32*scale)+' '+(ox+d*10*scale)+' '+(oy+12*scale)+' Z" fill="#94121c" opacity=".96"/>';
  s+='<path d="M '+(ox+d*18*scale)+' '+(oy-15*scale)+' Q '+(ox+d*43*scale)+' '+(oy-40*scale)+' '+(hx-d*39*headSize)+' '+(hy-14*headSize)+
   ' Q '+(hx-d*48*headSize)+' '+(hy+3*headSize)+' '+(hx-d*29*headSize)+' '+(hy+20*headSize)+' Q '+(ox+d*43*scale)+' '+(oy+23*scale)+' '+(ox+d*18*scale)+' '+(oy-15*scale)+' Z" fill="#ff6a25"/>';
  // The main breath is a wide, turbulent plume, with a hot white-yellow heart and ragged edges.
  s+='<path d="'+outer+'" fill="#640a19" opacity=".9"/>';
  s+='<path d="'+outer+'" fill="url(#it50DragonFireOuter)" opacity=".98"/>';
  s+='<path d="'+middle+'" fill="#ff8425" opacity=".97"/>';
  s+='<path d="'+middle+'" fill="url(#it50DragonFireCore)" opacity=".86"/>';
  s+='<path d="'+core+'" fill="#fff7c3" opacity=".96"/>';
  // Animated rolling fire pockets make the breath feel like a flame thrower, not a beam.
  for(let i=0;i<12;i++){
   const u=.1+((i*13+b.t*2.25)%82)/100,v=1-u;
   const cx=v*v*mouthX+3*v*v*u*c1x+3*v*u*u*c2x+u*u*u*endX;
   const cy=v*v*mouthY+3*v*v*u*c1y+3*v*u*u*c2y+u*u*u*endY;
   const size=(7+(i%5)*3+u*spread*.12)*scale;
   const yy=cy+Math.sin((b.t*1.1+i*4)*.3)*spread*.18;
   s+='<ellipse cx="'+cx+'" cy="'+yy+'" rx="'+(size*1.85)+'" ry="'+(size*.72)+'" transform="rotate('+(d*(b.t*7+i*31))+' '+cx+' '+yy+')" fill="'+(i%4===0?'#fff5b2':(i%2?'#ffbf36':'#ff4c20'))+'" opacity="'+(.33+(i%4)*.12)+'"/>';
  }
  // Flame tongues break out of both sides of the cone and whip backward in the airflow.
  for(let k=0;k<18;k++){
   const u=.12+((k*17+b.t*1.9)%78)/100,v=1-u;
   const cx=v*v*mouthX+3*v*v*u*c1x+3*v*u*u*c2x+u*u*u*endX;
   const cy=v*v*mouthY+3*v*v*u*c1y+3*v*u*u*c2y+u*u*u*endY;
   const side=k%2?-1:1,reach=(10+(k%5)*6+Math.sin(b.t*.28+k)*5)*scale*(.55+u);
   const flick=Math.sin((b.t+k*9)*.21)*(10+u*20)*scale;
   s+='<path d="M '+(cx-d*reach*.15)+' '+cy+
    ' Q '+(cx+flick)+' '+(cy+side*reach*.35)+' '+(cx+flick+d*reach*.66)+' '+(cy+side*reach)+
    ' Q '+(cx+flick-d*reach*.12)+' '+(cy+side*reach*.45)+' '+(cx-d*reach*.15)+' '+cy+' Z" fill="'+(k%4===0?'#fff6b5':(k%3===0?'#ffb735':'#ff4b21'))+'" opacity="'+(.45+(k%4)*.12)+'"/>';
  }
  // Draw the dragon face over the cone so the jaw clearly frames the point where fire exits.
  s+='<g transform="translate('+hx+' '+hy+') scale('+(d*headSize)+' '+headSize+')">';
  s+='<path d="M -61 -7 L -53 -29 L -35 -26 L -25 -48 L -11 -32 L 7 -35 L 25 -27 L 43 -20 L 58 -12 L 76 -4 L 61 3 L 43 6 L 59 22 L 38 35 L 13 27 L -4 42 L -19 15 L -43 11 L -59 3 Z" fill="#711019" stroke="#f34b29" stroke-width="3"/>';
  s+='<path d="M -40 -27 L -57 -49 L -33 -42 L -19 -63 L -5 -35 M -6 -34 L 7 -53 L 23 -34" fill="#c92b22" stroke="#ffb23f" stroke-width="4" stroke-linejoin="round"/>';
  s+='<path d="M -38 -17 Q -17 -29 1 -24 L 19 -18 L 39 -13 L 60 -5 L 35 -1 L 12 1 L -6 -5 Z" fill="#ff7a28"/>';
  s+='<path d="M 7 -7 Q 29 -15 60 -5 L 44 1 L 64 8 Q 42 15 23 8 L 8 3 Z" fill="#21070d" stroke="#ffbf4b" stroke-width="2.5"/>';
  s+='<path d="M 17 -1 L 22 7 L 28 0 L 34 9 L 39 1 L 45 7 L 50 1" fill="#fff7c5" stroke="#fff7c5" stroke-width="1.5"/>';
  s+='<path d="M 22 13 L 36 19 L 52 14" fill="none" stroke="#ff8c2b" stroke-width="3"/>';
  s+='<ellipse cx="33" cy="-14" rx="5.5" ry="4" fill="#fffbd7"/><ellipse cx="35" cy="-14" rx="2" ry="3.4" fill="#10101b"/><path d="M 27 -16 L 39 -18" stroke="#fff7c4" stroke-width="1.6"/>';
  s+='<path d="M -54 -6 L -69 -13 L -61 3 M -20 17 L -8 30 L 3 20" fill="none" stroke="#ffad43" stroke-width="3.2"/>';
  s+='</g>';
  // A hot flare at the jaws visually anchors the cone to the dragon's open mouth.
  s+='<ellipse cx="'+(mouthX+d*3*scale)+'" cy="'+mouthY+'" rx="'+(19*scale)+'" ry="'+(11*scale)+'" fill="#fff8c1" opacity=".94"/>';
  s+='<ellipse cx="'+(mouthX+d*10*scale)+'" cy="'+mouthY+'" rx="'+(29*scale)+'" ry="'+(18*scale)+'" fill="#ff7527" opacity=".38"/>';
  // Lightning branches across the whole plume, alternating cobalt edges and white-hot cores.
  for(let arc=0;arc<8;arc++){
   const from=.06+arc*.105,to=Math.min(.98,from+.2+(arc%3)*.075),pts=[];
   for(let q=0;q<=8;q++){
    const u=from+(to-from)*q/8,v=1-u;
    const cx=v*v*v*mouthX+3*v*v*u*c1x+3*v*u*u*c2x+u*u*u*endX;
    const cy=v*v*v*mouthY+3*v*v*u*c1y+3*v*u*u*c2y+u*u*u*endY;
    const width=(7+u*spread*.72)*scale;
    const off=q===0||q===8?0:Math.sin((b.t*1.55+arc*12+q*3)*.39)*width;
    pts.push([cx,cy+off]);
   }
   let bolt='M '+pts[0][0]+' '+pts[0][1];
   for(let q=1;q<pts.length;q++)bolt+=' L '+pts[q][0]+' '+pts[q][1];
   const branch=pts[4][0]+d*(9+arc%3*5)*scale,branchY=pts[4][1]+(arc%2?-1:1)*(15+arc%3*8)*scale;
   bolt+=' M '+pts[4][0]+' '+pts[4][1]+' L '+branch+' '+branchY+' L '+(branch+d*11*scale)+' '+(branchY+(arc%2?-11:11)*scale);
   s+='<path d="'+bolt+'" fill="none" stroke="#176cff" stroke-width="'+(5.5*scale)+'" stroke-linecap="round" stroke-linejoin="round" opacity=".83"/>';
   s+='<path d="'+bolt+'" fill="none" stroke="#c9fbff" stroke-width="'+(2.2*scale)+'" stroke-linecap="round" stroke-linejoin="round" opacity=".99"/>';
  }
  // Sparks and heat shimmer swirl around the blast rather than following one line.
  for(let i=0;i<26;i++){
   const u=((i*17+b.t*2.5)%97)/100,v=1-u;
   const cx=v*v*v*mouthX+3*v*v*u*c1x+3*v*u*u*c2x+u*u*u*endX;
   const cy=v*v*v*mouthY+3*v*v*u*c1y+3*v*u*u*c2y+u*u*u*endY;
   s+='<circle cx="'+(cx+Math.sin(i*5+b.t*.21)*spread*.34)+'" cy="'+(cy+Math.cos(i*3+b.t*.23)*spread*.42)+'" r="'+(1.3+i%4*.65)*scale+'" fill="'+(i%5===0?'#c9fbff':(i%2?'#ffd76b':'#ff5828'))+'" opacity="'+(.35+(i%5)*.11)+'"/>';
  }
  s+='<path d="M '+(ox-d*8*scale)+' '+(oy+74*scale)+' Q '+(ox+d*36*scale)+' '+(oy+116*scale)+' '+(hx-d*42*headSize)+' '+(hy+90*headSize)+'" fill="none" stroke="#511018" stroke-width="'+(24*scale)+'" opacity=".22"/>';
  // Heat-burned screen edges pulse while the dragon breath is active.
  s+='<path d="M 0 62 Q 22 115 7 175 T 10 274 T 0 360 L 0 0 Z M 1280 0 L 1280 360 Q 1258 309 1273 252 T 1264 119 L 1260 0 Z" fill="#ef3c20" opacity=".25"/>';
  s+='<path d="M 0 592 Q 19 546 5 510 T 11 428 L 0 388 L 0 720 L 54 720 Q 31 672 44 634 T 20 603 Z M 1280 720 L 1221 720 Q 1247 673 1235 630 T 1261 580 L 1280 553 Z" fill="#bd1f22" opacity=".24"/>';
  s+='<rect x="7" y="7" width="1266" height="706" rx="12" fill="none" stroke="#ff5527" stroke-width="'+(2.5+Math.sin(b.t*.35)*1.8)+'" opacity=".42"/>';
 }
 if(Q.amaterasuImpact&&Q.amaterasuImpact.t<42){const q=Q.amaterasuImpact,p=point(q.target.x,q.target.y-84),t=q.t;s+='<g opacity="'+(1-t/44)+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="'+(28+t*4)+'" fill="none" stroke="#ff3b69" stroke-width="3"/><circle cx="'+p.x+'" cy="'+p.y+'" r="'+(19+t*2.8)+'" fill="none" stroke="#8d3cff" stroke-width="2"/><path d="M '+(p.x-360)+' '+(p.y-180)+' L '+p.x+' '+p.y+' L '+(p.x+240)+' '+(p.y+60)+'" fill="none" stroke="#ed2c58" stroke-width="2"/><text x="'+p.x+'" y="'+(p.y-90-t)+'" fill="#ff8ca8" font-size="22" font-family="monospace" text-anchor="middle" letter-spacing="6">MANGEKYO LOCK</text></g>';}
 for(const b of Q.burns||[])if(b&&b.kind==='amaterasu'&&alive(b.target))s+=blackFire(b);
 if(!c||c.kind!=='ult')for(const f of fighters())if(f&&f.id==='itachi'&&f.moveKey==='s1'&&f.moveFrame<180){
  const P=computePose(f),sh={x:f.x+P.lean*.28,y:f.y+P.shY};
  const ef=joint(sh,P.armF[0],20),hf=joint(ef,P.armF[0]+P.armF[1],20),eb=joint(sh,P.armB[0],17),hb=joint(eb,P.armB[0]+P.armB[1],17);
  const pf=point(hf.x,hf.y),pb=point(hb.x,hb.y),ch=point((hf.x+hb.x)*.5,(hf.y+hb.y)*.5),t=Q.tick||0,mode=f.itachiFireMode||'charge';
  if(mode==='fireball-seals'||mode==='breath-seals'){
   const age=Math.max(0,(f.moveFrame||0)-(f.itachiSealStart||0)),fast=mode==='breath-seals';
   for(let j=0;j<3;j++){
    const fade=.36-j*.09,dx=Math.sin((age+j*2)*.7)*(fast?13:19),dy=Math.cos((age+j*2)*.63)*(fast?9:13);
    s+='<path d="M '+(pf.x-dx)+' '+(pf.y-dy)+' Q '+(pf.x+dx*1.2)+' '+(pf.y-12-dy)+' '+(pf.x+dx*1.9)+' '+(pf.y-23-dy)+'" fill="none" stroke="'+(fast?'#ff8a45':'#ffb06b')+'" stroke-width="'+(3-j*.65)+'" stroke-linecap="round" opacity="'+fade+'"/><path d="M '+(pb.x+dx*.55)+' '+(pb.y+dy*.45)+' Q '+(pb.x-dx)+' '+(pb.y-9+dy)+' '+(pb.x-dx*1.7)+' '+(pb.y-20+dy)+'" fill="none" stroke="#ff5c36" stroke-width="'+(2.5-j*.5)+'" stroke-linecap="round" opacity="'+(fade*.8)+'"/>';
   }
   s+='<circle cx="'+ch.x+'" cy="'+ch.y+'" r="'+(7+Math.sin(t*.28)*2)+'" fill="#ff6738" opacity=".28"/>';
  }else{
   const r=5+Math.sin(t*.22)*2;
   s+='<circle cx="'+ch.x+'" cy="'+ch.y+'" r="'+(r+10)+'" fill="#f15b42" opacity=".13"/><circle cx="'+ch.x+'" cy="'+ch.y+'" r="'+r+'" fill="#ff704b" opacity=".78"/><circle cx="'+ch.x+'" cy="'+ch.y+'" r="'+(r+8)+'" fill="none" stroke="#ffb28b" stroke-width="1.6" stroke-dasharray="3 5"/>';
  }
 }
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