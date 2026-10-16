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
 if(!stage)return;
 // Edo Susanoo has its own animated rig/overlay; skip this redundant legacy SVG pass.
 if(Q.cinema&&Q.cinema.kind==='edoSusanoo')return;
 const cinematic=Q.cinema&&Q.cinema.kind==='ult';stage.style.zIndex=cinematic?'9':'6';if(typeof G!=='undefined'&&G.mode==='menu'){stage.innerHTML='';return;}
 let s='<defs><radialGradient id="it50Gourd"><stop stop-color="#f7cf88"/><stop offset=".28" stop-color="#b85135"/><stop offset=".68" stop-color="#71203c"/><stop offset="1" stop-color="#2b0b20"/></radialGradient><linearGradient id="it50Blade" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#9b9cab"/><stop offset=".22" stop-color="#fff4d2"/><stop offset=".45" stop-color="#8b93a8"/><stop offset=".65" stop-color="#f9f4e5"/><stop offset="1" stop-color="#44445c"/></linearGradient><linearGradient id="it50Armor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8b188"/><stop offset=".23" stop-color="#ad4350"/><stop offset=".62" stop-color="#4a132d"/><stop offset="1" stop-color="#110711"/></linearGradient><linearGradient id="it50ArmorBright" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffc698"/><stop offset=".35" stop-color="#c65b65"/><stop offset=".75" stop-color="#6b203b"/><stop offset="1" stop-color="#230a1e"/></linearGradient><linearGradient id="it50Mirror" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff4cf"/><stop offset=".18" stop-color="#9af4ff"/><stop offset=".36" stop-color="#b59cff"/><stop offset=".54" stop-color="#ffb0cf"/><stop offset=".72" stop-color="#f6f1d0"/><stop offset="1" stop-color="#8ad7fb"/></linearGradient></defs>';
 const c=Q.cinema;
 if(Q.flameBreath&&Q.flameBreath.owner){
  const b=Q.flameBreath,owner=b.owner,d=owner.facing||1;
  const scale=point(owner.x,owner.y).s||1;
  // Itachi himself is the only emitter. No dragon head, neck, or creature silhouette.
  const mouth=point(owner.x+d*44,owner.y-113),ox=mouth.x,oy=mouth.y;
  const foe=owner.opp,valid=alive(foe)&&(foe.x-owner.x)*d>0&&Math.abs(foe.x-owner.x)<=720&&Math.abs(foe.y-owner.y)<=255;
  const aim=valid?point(foe.x-d*18,foe.y-94):point(owner.x+d*720,owner.y-132+Math.sin(b.t*.14)*18);
  let endX=aim.x+d*(valid?76:0)*scale,endY=aim.y+Math.sin(b.t*.23)*17*scale;
  let length=(endX-ox)*d;
  if(length<180*scale){length=180*scale;endX=ox+d*length;endY=oy+Math.sin(b.t*.2)*24*scale;}
  const spread=(66+Math.min(140,length*.17)+Math.sin(b.t*.31)*9)*scale;
  const midX=ox+d*length*.52,midY=oy+(endY-oy)*.52+Math.sin(b.t*.25)*spread*.14;
  const upper='M '+ox+' '+(oy-7*scale)+
   ' C '+(ox+d*length*.2)+' '+(oy-18*scale)+' '+(midX-d*length*.08)+' '+(midY-spread*.5)+' '+(endX-d*length*.08)+' '+(endY-spread*.82)+
   ' Q '+(endX+d*12*scale)+' '+(endY-spread*.45)+' '+endX+' '+(endY-spread)+
   ' Q '+(endX-d*48*scale)+' '+(endY-spread*.55)+' '+endX+' '+endY;
  const plume='M '+ox+' '+(oy-9*scale)+
   ' C '+(ox+d*length*.22)+' '+(oy-12*scale)+' '+(midX-d*length*.08)+' '+(midY-spread*.54)+' '+endX+' '+(endY-spread)+
   ' C '+(endX-d*length*.16)+' '+(endY-spread*.68)+' '+(endX+d*10*scale)+' '+(endY-spread*.18)+' '+endX+' '+endY+
   ' C '+(endX+d*5*scale)+' '+(endY+spread*.25)+' '+(endX-d*length*.17)+' '+(endY+spread*.76)+' '+endX+' '+(endY+spread)+
   ' C '+(midX-d*length*.02)+' '+(midY+spread*.43)+' '+(ox+d*length*.18)+' '+(oy+16*scale)+' '+ox+' '+(oy+9*scale)+' Z';
  const inner='M '+ox+' '+(oy-4*scale)+
   ' C '+(ox+d*length*.23)+' '+(oy-5*scale)+' '+(midX-d*length*.1)+' '+(midY-spread*.28)+' '+endX+' '+(endY-spread*.62)+
   ' C '+(endX-d*length*.08)+' '+(endY-spread*.2)+' '+(endX+d*8*scale)+' '+(endY+spread*.12)+' '+endX+' '+endY+
   ' C '+(endX+d*8*scale)+' '+(endY+spread*.18)+' '+(midX-d*length*.08)+' '+(midY+spread*.32)+' '+ox+' '+(oy+4*scale)+' Z';
  s+='<defs>'+
   '<linearGradient id="it50FlamethrowerOuter" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ff8d29"/><stop offset=".42" stop-color="#ff381b"/><stop offset="1" stop-color="#80101c"/></linearGradient>'+
   '<linearGradient id="it50FlamethrowerCore" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffbd4"/><stop offset=".5" stop-color="#ffe66c"/><stop offset="1" stop-color="#ff8c28"/></linearGradient>'+
   '</defs>';
  // Large conical flame, emitted directly from the fighter's mouth and widened into the arena.
  s+='<path d="'+plume+'" fill="#4a0711" opacity=".9"/>';
  s+='<path d="'+plume+'" fill="url(#it50FlamethrowerOuter)" opacity=".98"/>';
  s+='<path d="'+inner+'" fill="#ff8028" opacity=".96"/>';
  s+='<path d="'+inner+'" fill="url(#it50FlamethrowerCore)" opacity=".9"/>';
  s+='<path d="M '+ox+' '+oy+' C '+(ox+d*length*.24)+' '+(oy-4*scale)+' '+(midX-d*length*.08)+' '+(midY-spread*.16)+' '+endX+' '+(endY-11*scale)+' Q '+(endX-d*length*.1)+' '+endY+' '+endX+' '+(endY+11*scale)+' C '+(midX-d*length*.08)+' '+(midY+spread*.16)+' '+(ox+d*length*.24)+' '+(oy+4*scale)+' '+ox+' '+oy+' Z" fill="#fff7bc" opacity=".91"/>';
  // Rolling pockets and corkscrew bands make the flame turbulent rather than a straight laser.
  for(let i=0;i<10;i++){
   const u=.08+((i*17+b.t*2.5)%88)/100,v=1-u;
   const cx=v*v*v*ox+3*v*v*u*(ox+d*length*.3)+3*v*u*u*(endX-d*length*.2)+u*u*u*endX;
   const baseline=oy+(endY-oy)*u;
   const roll=Math.sin(b.t*.22+u*15+i*1.7)*spread*(.08+u*.25);
   const cy=baseline+roll,rx=(9+(i%5)*4+u*spread*.12)*scale,ry=(4+(i%4)*2+u*spread*.045)*scale;
   const col=i%5===0?'#fff8c4':(i%3===0?'#ffd24b':(i%2?'#ff6a22':'#ef2c1b'));
   s+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+(d*(b.t*5+i*29))+' '+cx+' '+cy+')" fill="'+col+'" opacity="'+(.38+(i%4)*.12)+'"/>';
  }
  for(let r=0;r<2;r++){
   let ribbon='';
   for(let j=0;j<=8;j++){
    const u=.04+j*.115,v=1-u,x=ox+d*length*u;
    const centre=oy+(endY-oy)*u;
    const phase=b.t*.22+u*13+r*1.6;
    const y=centre+Math.sin(phase)*(spread*u*.32)+Math.cos(phase*.55)*spread*u*.08;
    ribbon+=(j?' L ':'M ')+x+' '+y;
   }
   s+='<path d="'+ribbon+'" fill="none" stroke="'+(r%2?'#ffba35':'#fff2a1')+'" stroke-width="'+((13-r*2.1)*scale)+'" stroke-linecap="round" opacity="'+(.3+r*.07)+'"/>';
  }
  // Long ragged tongues flare outward at the sides of the cone.
  for(let k=0;k<12;k++){
   const u=.1+((k*19+b.t*1.8)%86)/100,x=ox+d*length*u;
   const baseY=oy+(endY-oy)*u+Math.sin(b.t*.22+u*12)*spread*u*.12;
   const side=k%2?-1:1,reach=(12+(k%5)*7+Math.sin(b.t*.25+k)*5)*scale*(.4+u);
   const flick=Math.sin(b.t*.19+k*2.3)*(10+u*24)*scale;
   s+='<path d="M '+(x-d*reach*.2)+' '+baseY+' Q '+(x+flick)+' '+(baseY+side*reach*.5)+' '+(x+flick+d*reach*.9)+' '+(baseY+side*reach)+' Q '+(x+flick-d*reach*.15)+' '+(baseY+side*reach*.42)+' '+(x-d*reach*.2)+' '+baseY+' Z" fill="'+(k%4===0?'#fff6b0':(k%3===0?'#ffb638':'#ff4520'))+'" opacity="'+(.43+(k%5)*.1)+'"/>';
  }
  // Electrical discharge branches through the fire, not around a dragon.
  for(let arc=0;arc<5;arc++){
   const from=.08+arc*.095,to=Math.min(.99,from+.2+(arc%3)*.07),pts=[];
   for(let q=0;q<=6;q++){
    const u=from+(to-from)*q/6,x=ox+d*length*u;
    const centre=oy+(endY-oy)*u;
    const offset=q===0||q===8?0:Math.sin((b.t*1.45+arc*11+q*3)*.38)*(spread*u*.42);
    pts.push([x,centre+offset]);
   }
   let bolt='M '+pts[0][0]+' '+pts[0][1];
   for(let q=1;q<pts.length;q++)bolt+=' L '+pts[q][0]+' '+pts[q][1];
   const bx=pts[4][0]+d*(9+arc%3*5)*scale,by=pts[4][1]+(arc%2?-1:1)*(18+arc%3*9)*scale;
   bolt+=' M '+pts[4][0]+' '+pts[4][1]+' L '+bx+' '+by+' L '+(bx+d*12*scale)+' '+(by+(arc%2?-11:11)*scale);
   s+='<path d="'+bolt+'" fill="none" stroke="#176cff" stroke-width="'+(5.8*scale)+'" stroke-linecap="round" stroke-linejoin="round" opacity=".83"/>';
   s+='<path d="'+bolt+'" fill="none" stroke="#d2fbff" stroke-width="'+(2.25*scale)+'" stroke-linecap="round" stroke-linejoin="round" opacity=".99"/>';
  }
  for(let i=0;i<14;i++){
   const u=((i*17+b.t*2.7)%98)/100,x=ox+d*length*u;
   const y=oy+(endY-oy)*u+Math.sin(i*3+b.t*.2)*spread*u*.58;
   s+='<circle cx="'+(x+Math.sin(i*5+b.t*.18)*16*scale)+'" cy="'+y+'" r="'+((1.3+i%4*.65)*scale)+'" fill="'+(i%6===0?'#c9fbff':(i%2?'#ffd66b':'#ff5725'))+'" opacity="'+(.32+(i%5)*.12)+'"/>';
  }
  s+='<ellipse cx="'+ox+'" cy="'+oy+'" rx="'+(22*scale)+'" ry="'+(15*scale)+'" fill="#fff7bb" opacity=".94"/>';
  s+='<ellipse cx="'+(ox+d*7*scale)+'" cy="'+oy+'" rx="'+(37*scale)+'" ry="'+(24*scale)+'" fill="#ff4b21" opacity=".38"/>';
  // Heat-burned screen edges pulse during the continuous flame stream.
  s+='<path d="M 0 62 Q 22 115 7 175 T 10 274 T 0 360 L 0 0 Z M 1280 0 L 1280 360 Q 1258 309 1273 252 T 1264 119 L 1260 0 Z" fill="#ef3c20" opacity=".24"/>';
  s+='<path d="M 0 592 Q 19 546 5 510 T 11 428 L 0 388 L 0 720 L 54 720 Q 31 672 44 634 T 20 603 Z M 1280 720 L 1221 720 Q 1247 673 1235 630 T 1261 580 L 1280 553 Z" fill="#bd1f22" opacity=".22"/>';
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