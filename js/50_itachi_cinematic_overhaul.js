/* ITACHI CINEMATIC OVERHAUL v1.0: Katon, ranged Amaterasu, Tsukuyomi, enlarged Susanoo. */
(function(){
'use strict';
if(window.__JFF_ITACHI_CINEMATIC_V1__)return;
const Q=window.JFF_ITACHI_REBOOT;if(!Q)return;
window.__JFF_ITACHI_CINEMATIC_V1__=true;
const oldStart=window.startMove,oldUpdate=window.updateMove,oldHit=window.resolveHit,oldReset=window.resetFighter,oldRender=window.render,oldPose=window.applyCharacterIdentityPose;
const fighters=()=>typeof G!=='undefined'&&Array.isArray(G.fighters)?G.fighters:[];
const alive=o=>!!(o&&o.hp>0&&o.state!=='DEFEAT'&&o.state!=='VICTORY');
const down=code=>{const k=typeof KEY!=='undefined'?KEY:(window.KEY||{});return !!k[code];};
const fx=(t,x,y,d,data)=>{if(typeof window.JFF_OUTSIDER_FX==='function')window.JFF_OUTSIDER_FX(t,x,y,d||20,data||{});};
const stopMove=f=>{if(typeof window.endMove==='function')window.endMove(f);else{f.move=null;f.moveKey=null;f.moveFrame=0;f.state='IDLE';}f.itachiPoseKey='';};
function targetFor(f,range){const o=f&&f.opp;return alive(o)&&Math.abs(o.x-f.x)<=range&&Math.abs(o.y-f.y)<245?o:null;}
function startTsukuyomi(a,b,source){
 if(Q.cinema||!alive(a)||!alive(b))return false;
 a.facing=b.x>=a.x?1:-1;a.itachiCounterUntil=0;a.itachiCinemaKind='tsukuyomi';a.itachiPoseKey='s2';a.vx=0;a.invuln=Math.max(a.invuln||0,484);
 if(!a.move){a.move=a.moves&&a.moves.s2||{name:'Tsukuyomi',active:480};a.moveKey='s2';a.moveFrame=0;a.state='ATTACK';}
 b.itachiCinemaStun=483;b.move=null;b.moveKey=null;b.moveFrame=0;b.vx=0;b.vy=0;b.hitstun=Math.max(b.hitstun||0,483);b.immobilize=Math.max(b.immobilize||0,483);b.state='HITSTUN';b.stateFrame=0;
 Q.shots.length=0;Q.clone=null;
 Q.cinema={kind:'tsukuyomi',owner:a,target:b,frame:0,duration:480,hitDone:false,createdAt:Q.tick,targetStartHp:b.hp,source:source||'direct'};
 fx('moon',b.x,b.y-90,480);fx('crows',a.x,a.y-90,48);
 if(typeof flash==='function')flash(.4,'#870e2f');if(typeof shake==='function')shake(8);if(typeof camPunch==='function')camPunch(.22);
 if(typeof SFX!=='undefined'&&SFX.domain)SFX.domain();return true;
}
function addFireball(f,i){
 const d=f.facing||1;Q.shots.push({owner:f,kind:'fireball',x:f.x+d*45,y:f.y-114+(i-3)*2.8,vx:d*(13.1-Math.abs(i-3)*.18),vy:(i-3)*.48-.15,r:i===3?29:23,damage:i===3?10:7,stun:19,kbx:7,kby:-3,life:110,rot:0,hit:false,armorBreak:false});
 if(Q.shots.length>(Q.maxShots||24))Q.shots.splice(0,Q.shots.length-(Q.maxShots||24));
}
function startBreath(f){Q.flameBreath={owner:f,t:0,d:102,nextHit:18};f.itachiFireMode='breath';f.itachiFireDone=true;fx('fire',f.x+(f.facing||1)*80,f.y-100,70,{charge:1});fx('shock',f.x+(f.facing||1)*72,f.y-90,30);if(typeof flash==='function')flash(.24,'#e34b29');if(typeof shake==='function')shake(7);if(typeof SFX!=='undefined'&&SFX.fugaRelease)SFX.fugaRelease();}
function updateFire(f,n){
 const held=down(f.itachiChargeKey||(f.isP2?'Numpad3':'Digit3'));f.itachiPoseKey='s1';f.itachiChargeFrames=n;
 if(n<180){if(held)f.itachiHeldTicks=(f.itachiHeldTicks||0)+1;else if(n>1)f.itachiFireReleased=true;return;}
 if(!f.itachiFireMode){if(held||(f.itachiHeldTicks||0)>=175)startBreath(f);else{f.itachiFireMode='volley';f.itachiVolleyStart=n;if(typeof SFX!=='undefined'&&SFX.fugaRelease)SFX.fugaRelease();if(typeof flash==='function')flash(.15,'#ff6530');}}
 if(f.itachiFireMode==='volley'){
  const t=n-f.itachiVolleyStart;if(t>=0&&t<=36&&t%6===0){addFireball(f,Math.min(6,Math.floor(t/6)));fx('fire',f.x+(f.facing||1)*55,f.y-114,14,{charge:.35});}
  if(n>=f.itachiVolleyStart+56)stopMove(f);return;
 }
 if(f.itachiFireMode==='breath'&&Q.flameBreath&&Q.flameBreath.owner===f){
  const b=Q.flameBreath;b.t++;f.itachiPoseKey='s1fire';
  if(b.t>=b.nextHit&&b.t%18===0){b.nextHit=b.t+18;if(alive(f.opp)&&typeof window.resolveHit==='function')window.resolveHit(f,f.opp,{damage:5,hitstun:16,blockstun:12,kbx:5,kby:-2,hitstop:5,meter:3,kind:'projectile',type:'special'},f.opp.x,f.opp.y-82);}
  if(b.t%18===0)fx('fire',f.x+(f.facing||1)*165,f.y-104,18,{charge:1});
  if(b.t>=b.d){Q.flameBreath=null;stopMove(f);}
 }else if(f.itachiFireMode==='breath')stopMove(f);
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
  if(k==='s1'){f.itachiChargeKey=f.isP2?'Numpad3':'Digit3';f.itachiHeldTicks=0;f.itachiFireMode='';f.itachiFireDone=false;f.itachiFireReleased=false;f.itachiChargeFrames=0;Q.flameBreath=null;}
  if(k==='s2'){const t=targetFor(f,1100);if(t){f.itachiDirectTsukuyomiTarget=t;f.itachiCounterUntil=0;f.facing=t.x>=f.x?1:-1;}else{f.itachiDirectTsukuyomiTarget=null;f.itachiTsukuyomiCounter=true;}}
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
if(typeof oldReset==='function')window.resetFighter=function(f){const r=oldReset.apply(this,arguments);if(f&&f.id==='itachi'){f.itachiFireMode='';f.itachiHeldTicks=0;f.itachiDirectTsukuyomiTarget=null;f.itachiAmaterasuFrame=0;}if(Q.flameBreath&&Q.flameBreath.owner===f)Q.flameBreath=null;if(Q.amaterasuImpact&&(Q.amaterasuImpact.owner===f||Q.amaterasuImpact.target===f))Q.amaterasuImpact=null;return r;};

function point(x,y){const z=typeof cam!=='undefined'&&Number.isFinite(cam.zoom)?cam.zoom:1,cx=typeof cam!=='undefined'&&Number.isFinite(cam.x)?cam.x:640,cy=typeof cam!=='undefined'&&Number.isFinite(cam.y)?cam.y:360;return{x:640+((G&&G.shakeX)||0)+(x-cx)*z,y:360+((G&&G.shakeY)||0)+(y-cy)*z,s:z};}
const stage=document.createElementNS('http://www.w3.org/2000/svg','svg');stage.setAttribute('id','jffItachiCinematicStage');stage.setAttribute('viewBox','0 0 1280 720');stage.setAttribute('preserveAspectRatio','none');stage.setAttribute('aria-hidden','true');stage.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:8;pointer-events:none;overflow:hidden;display:block';
const wrap=document.getElementById('wrap');if(wrap)wrap.appendChild(stage);
function blackFire(b){
 const p=point(b.target.x,b.target.y-82),t=Q.tick||0;let s='<g transform="translate('+p.x+' '+p.y+') scale('+p.s+')"><ellipse rx="49" ry="63" fill="#030208" opacity=".9"/>';
 for(let i=0;i<11;i++){const x=(i-5)*7,w=Math.sin((t+i*7)*.19)*6,h=49+(i%4)*12+Math.sin((t+i*5)*.13)*7;s+='<path d="M '+(x-8)+' 36 Q '+(x-24+w)+' 5 '+(x-10)+' '+(-h*.55)+' Q '+(x+w)+' '+(-h*.24)+' '+(x+4)+' '+(-h)+' Q '+(x+25+w)+' '+(-h*.47)+' '+(x+13)+' 18 Q '+(x+10)+' 39 '+(x-8)+' 36 Z" fill="'+(i%3===0?'#240b2d':'#05040a')+'" stroke="'+(i%3===0?'#a12b68':'#57204f')+'" stroke-width="2.2"/>';}
 for(let i=0;i<8;i++){const x=Math.sin((t+i*13)*.16)*(25+i*2),y=-25-((t*1.8+i*31)%92);s+='<circle cx="'+x+'" cy="'+y+'" r="'+(1.4+i%3)+'" fill="'+(i%2?'#ff315d':'#a64fff')+'"/>';}
 return s+'<path d="M -40 2 Q -18 -22 -8 6 T 23 -4 T 42 19" fill="none" stroke="#6b245f" stroke-width="5"/></g>';
}
function bound(x,y,scale){return '<g transform="translate('+x+' '+y+') scale('+scale+')"><path d="M -12 -80 Q -28 -75 -25 -54 L -28 -9 L -18 21 L -8 17 L -6 -12 L 6 -12 L 8 17 L 18 21 L 28 -9 L 25 -54 Q 28 -75 12 -80 Z" fill="#09070d" stroke="#8c1d3c" stroke-width="2"/><circle cy="-96" r="15" fill="#08060d" stroke="#a52c47" stroke-width="2"/><path d="M -13 -101 Q 0 -114 13 -101" fill="none" stroke="#ff526e" stroke-width="3"/><path d="M -18 -60 L -45 -47 L -72 -35 M 18 -60 L 45 -47 L 72 -35" stroke="#08060d" stroke-width="10" stroke-linecap="round"/><path d="M -18 -60 L -45 -47 L -72 -35 M 18 -60 L 45 -47 L 72 -35" stroke="#a72d50" stroke-width="2.5" fill="none"/><path d="M -7 -12 L -27 22 L -25 46 M 7 -12 L 27 22 L 25 46" stroke="#08060d" stroke-width="10" stroke-linecap="round"/><path d="M -76 -39 L 76 -39 M 0 -137 L 0 53" stroke="#3e1524" stroke-width="10"/><path d="M -76 -39 L 76 -39 M 0 -137 L 0 53" stroke="#8a2b43" stroke-width="2" stroke-dasharray="6 6"/></g>';}
function itachiShadow(x,y,scale,n){const swing=Math.sin(n*.26)*18;return '<g transform="translate('+x+' '+y+') scale('+scale+')"><path d="M -32 -115 Q -50 -91 -44 -55 L -39 0 L -15 10 L 0 -7 L 16 10 L 39 0 L 44 -55 Q 50 -91 32 -115 L 22 -150 L 9 -130 L 0 -157 L -10 -130 L -24 -150 Z" fill="#07060d" stroke="#631a36" stroke-width="3"/><path d="M -27 -113 Q -48 -90 -58 -39 L -37 -24 L -14 -76 M 27 -113 Q 48 -90 58 -39 L 37 -24 L 14 -76" fill="#07060d" stroke="#651b38" stroke-width="3"/><path d="M 18 -57 L '+(38+swing)+' -2 L '+(96+swing)+' -176" stroke="#0a080f" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M '+(96+swing)+' -176 L '+(102+swing)+' -193 L '+(108+swing)+' -171 Z" fill="#ffe5df"/><path d="M '+(30+swing)+' -12 L '+(92+swing)+' -170" stroke="#ff4568" stroke-width="2.5"/></g>';}
function tsukuyomi(c){
 const n=c.frame||0,flash=n%18<3?.3:0;
 let s='<defs><radialGradient id="it50Moon"><stop stop-color="#ffb3bf"/><stop offset=".38" stop-color="#c42046"/><stop offset="1" stop-color="#25050e"/></radialGradient></defs><rect width="1280" height="720" fill="#020207"/><rect width="1280" height="720" fill="#5c071e" opacity=".1"/><circle cx="1020" cy="137" r="111" fill="url(#it50Moon)" stroke="#fa5571" stroke-width="3"/><circle cx="1020" cy="137" r="128" fill="none" stroke="#9d163a" stroke-width="2" stroke-dasharray="4 14"/>';
 for(let i=0;i<14;i++){const x=(i*197-n*.7+1280)%1280,y=(i*89+n*.26)%720;s+='<circle cx="'+x+'" cy="'+y+'" r="'+(i%3+1)+'" fill="'+(i%2?'#ff5575':'#9b1b46')+'" opacity=".6"/>';}
 if(n<36){s+='<g transform="translate(640 335)"><circle r="150" fill="#10030a" stroke="#a51f47" stroke-width="4"/><circle r="119" fill="none" stroke="#f9476c" stroke-width="3" stroke-dasharray="15 9"/><circle r="83" fill="#15040c" stroke="#fb6c86" stroke-width="4"/><circle r="36" fill="#ef315c"/><circle r="18" fill="#06040a"/><path d="M -130 -52 L -43 -19 L -59 -108 L 0 -49 L 59 -108 L 43 -19 L 130 -52 L 59 17 L 96 90 L 0 55 L -96 90 L -59 17 Z" fill="none" stroke="#ff8fa4" stroke-width="4"/></g><text x="640" y="588" fill="#ffb2c2" text-anchor="middle" font-size="28" letter-spacing="8" font-family="monospace">TSUKUYOMI // EYE CONTACT</text>';}
 else{
  s+='<path d="M 0 526 Q 240 463 470 522 T 920 515 T 1280 491 L 1280 720 L 0 720 Z" fill="#05040a"/><g transform="translate(650 416)"><path d="M -12 -190 L -12 110 L 12 110 L 12 -190 Z M -174 -93 L 174 -93 L 174 -65 L -174 -65 Z" fill="#100911" stroke="#8c2445" stroke-width="3"/></g>'+bound(650,435,1.35)+'<ellipse cx="650" cy="570" rx="180" ry="22" fill="#620c2b" opacity=".3"/>';
  if(n<106){s+=itachiShadow(340,440,1.1,n)+'<path d="M 397 255 L 411 246 L 670 395 L 659 405 Z" fill="#ffe8e8" opacity=".8"/>';}
  else if(n<372){
   const pov=Math.floor((n-106)/42)%3;
   if(pov===0)s+='<g transform="translate(640 360)"><circle r="145" fill="#12040d" stroke="#8e1638" stroke-width="3"/><circle r="105" fill="none" stroke="#df2852" stroke-width="3" stroke-dasharray="3 12"/><path d="M -28 -36 L 0 -16 L 28 -36 L 18 5 L 0 28 L -18 5 Z" fill="#a51f43" stroke="#ffb3c0" stroke-width="2"/></g><text x="640" y="618" text-anchor="middle" fill="#ff9fb5" font-size="22" letter-spacing="7">POV 01 // THE PRISON</text>';
   else if(pov===1)s+=itachiShadow(455,448,1.35,n)+'<path d="M 512 262 L 522 252 L 720 420 L 709 429 Z" fill="#fff3eb" opacity="'+(.62+flash)+'"/><path d="M 525 245 L 733 427" stroke="#ff2f61" stroke-width="4"/><text x="640" y="618" text-anchor="middle" fill="#ff9fb5" font-size="22" letter-spacing="7">POV 02 // SHADOW OF THE BLADE</text>';
   else s+='<g transform="translate(640 370)"><rect x="-240" y="-170" width="480" height="310" rx="8" fill="#08060d" stroke="#51152f" stroke-width="3"/><path d="M -175 105 L 177 -122 M -175 -122 L 177 105" stroke="#fff0f2" stroke-width="5" opacity="'+(.35+flash)+'"/><path d="M -195 77 L 197 -96 M -195 -96 L 197 77" stroke="#e72b55" stroke-width="8" opacity=".67"/></g><text x="640" y="618" text-anchor="middle" fill="#ff9fb5" font-size="22" letter-spacing="7">POV 03 // TIME HAS NO MERCY</text>';
   for(let i=0;i<4;i++){const x=180+i*300+Math.sin(n*.2+i)*17;s+='<path d="M '+x+' 130 L '+(x+190)+' 590" stroke="#f42f5c" stroke-width="'+(i%2?2:4)+'" opacity="'+(.12+flash*.4)+'"/>';}
  }else if(n<432)s+='<circle cx="640" cy="355" r="'+(80+(n-372)*2.2)+'" fill="none" stroke="#da2855" stroke-width="4" opacity=".75"/><text x="640" y="345" fill="#fff1f5" text-anchor="middle" font-size="78" letter-spacing="7" font-family="monospace">72 HOURS</text><text x="640" y="393" fill="#ff7895" text-anchor="middle" font-size="22" letter-spacing="7">INSIDE THE GENJUTSU</text>'+itachiShadow(325,470,.8,n);
  else s+='<circle cx="640" cy="355" r="'+(300-(n-432)*7)+'" fill="none" stroke="#e52b58" stroke-width="4" opacity=".72"/><path d="M 0 0 L 1280 720 M 1280 0 L 0 720" stroke="#ff315f" stroke-width="2" opacity=".25"/><text x="640" y="366" text-anchor="middle" fill="#fff0f4" font-size="35" letter-spacing="8">GENJUTSU RELEASE</text>';
 }
 if(flash)s+='<rect width="1280" height="720" fill="#fff0f5" opacity="'+flash+'"/>';
 return s+'<rect width="1280" height="42" fill="#030208" opacity=".9"/><text x="34" y="27" fill="#ff8ea8" font-family="monospace" font-size="16" letter-spacing="5">MANGEKYO // TSUKUYOMI</text><rect y="678" width="1280" height="42" fill="#030208" opacity=".92"/><text x="640" y="705" fill="#d65a78" text-anchor="middle" font-family="monospace" font-size="14" letter-spacing="5">A MOMENT OUTSIDE REAL TIME</text>';
}
function weapons(n){
 let s='<g transform="translate(84 -48) rotate(17)"><path d="M -18 -29 Q -34 -51 -17 -66 Q 0 -78 17 -66 Q 34 -51 18 -29 L 14 -12 Q 36 8 27 35 Q 18 59 0 62 Q -18 59 -27 35 Q -36 8 -14 -12 Z" fill="url(#it50Gourd)" stroke="#ffd3a0" stroke-width="3"/><path d="M -13 -61 Q 0 -52 13 -61 M -24 1 Q 0 15 24 1 M -26 19 Q 0 32 26 19 M -18 38 Q 0 48 18 38" fill="none" stroke="#6c172f" stroke-width="4"/><rect x="-7" y="-81" width="14" height="12" rx="3" fill="#2b101b" stroke="#ffd9ad" stroke-width="2"/></g>';
 if(n>=48)s+='<g transform="translate(125 -115) rotate(-49)"><path d="M -13 18 L 13 18 L 16 -13 L 6 -28 L -6 -28 L -16 -13 Z" fill="#421524" stroke="#ffdcad" stroke-width="3"/><path d="M -4 -24 L -4 -45 L 4 -45 L 4 -24 M -14 -45 L 14 -45 L 7 -72 L -7 -72 Z" fill="#171018" stroke="#f4c69c" stroke-width="3"/><path d="M -9 -70 L -9 -300 L 0 -338 L 9 -300 L 9 -70 Z" fill="url(#it50Blade)" stroke="#fff3d4" stroke-width="3.2"/><path d="M 0 -330 L 1 -80" stroke="#fff7e3" stroke-width="3"/><path d="M -8 -89 L 8 -89" stroke="#f6d4ab" stroke-width="4"/></g>';
 return s;
}
function susanooArt(x,y,scale,frame,alpha){
 const n=frame||0;let s='<g transform="translate('+x+' '+y+') scale('+scale+')" opacity="'+(alpha==null?1:alpha)+'"><ellipse cy="68" rx="188" ry="24" fill="#7b112c" opacity=".3"/>';
 s+='<g stroke="#f6b48d" stroke-width="4" stroke-linejoin="round" fill="url(#it50Armor)"><path d="M -75 -236 L -106 -205 L -122 -150 L -105 -97 L -77 -68 L -62 -18 L -38 49 L -7 42 L 0 -28 L 7 42 L 38 49 L 62 -18 L 77 -68 L 105 -97 L 122 -150 L 106 -205 L 75 -236 L 40 -218 L 0 -202 L -40 -218 Z"/><path d="M -71 -234 Q -96 -264 -81 -295 L -58 -324 L -42 -283 L -24 -342 L 0 -305 L 24 -342 L 42 -283 L 58 -324 L 81 -295 Q 96 -264 71 -234 L 42 -211 L 0 -199 L -42 -211 Z" fill="url(#it50ArmorBright)"/><path d="M -43 -264 L -18 -254 L 0 -267 L 18 -254 L 43 -264 L 28 -235 L 0 -222 L -28 -235 Z" fill="#16050e"/><path d="M -78 -203 L -112 -181 L -143 -127 L -119 -108 L -84 -148 L -45 -164 Z" fill="#53172a"/><path d="M 78 -203 L 112 -181 L 143 -127 L 119 -108 L 84 -148 L 45 -164 Z" fill="#53172a"/><path d="M -48 -200 L 0 -181 L 48 -200 L 61 -145 L 37 -94 L 0 -78 L -37 -94 L -61 -145 Z" fill="#7d263c"/><path d="M -51 -177 Q 0 -148 51 -177 L 38 -139 L 0 -123 L -38 -139 Z" fill="#190812"/><path d="M -48 -111 L -79 -75 L -72 -30 L -42 -10 L -16 -38 L 0 -20 L 16 -38 L 42 -10 L 72 -30 L 79 -75 L 48 -111 Z" fill="url(#it50ArmorBright)"/><path d="M -77 -73 L -111 -38 L -94 -8 L -67 -35 M 77 -73 L 111 -38 L 94 -8 L 67 -35" fill="#5b1b30"/></g>';
 for(let i=0;i<4;i++)s+='<path d="M -42 '+(-101+i*19)+' Q 0 '+(-79+i*19)+' 42 '+(-101+i*19)+'" fill="none" stroke="#f8c49b" stroke-width="3"/>';
 s+='<path d="M -34 -253 L -9 -246 L -20 -237 M 34 -253 L 9 -246 L 20 -237" stroke="#ffdbaf" stroke-width="4"/><path d="M -24 -219 L -11 -203 L 0 -210 L 11 -203 L 24 -219 L 13 -193 L 0 -188 L -13 -193 Z" fill="#0d0810"/><path d="M 104 -158 Q 142 -182 166 -143 L 177 -105 L 131 -88 L 106 -120 Z" fill="#632139" stroke="#fbc09a" stroke-width="4"/>'+weapons(n);
 if(n>=40)s+='<g transform="translate(-156 -124) rotate(-12)"><ellipse rx="78" ry="116" fill="#f4d6b2" opacity=".2"/><ellipse rx="67" ry="105" fill="url(#it50Mirror)" stroke="#fff2d7" stroke-width="6"/><ellipse rx="55" ry="92" fill="#281226" fill-opacity=".32" stroke="#ffd8a6" stroke-width="3"/><ellipse rx="44" ry="78" fill="none" stroke="#fff3d2" stroke-width="4"/><path d="M -47 -63 L 0 -88 L 47 -63 L 31 -3 L 0 58 L -31 -3 Z" fill="#fff1d3" fill-opacity=".28" stroke="#fff6df" stroke-width="3"/><path d="M -57 0 L 57 0 M 0 -93 L 0 94 M -37 -74 L 37 74 M 37 -74 L -37 74" stroke="#e6fbff" stroke-width="2.5"/><circle cy="-2" r="17" fill="#f9e6c3" fill-opacity=".6" stroke="#fff6de" stroke-width="3"/><circle cy="-2" r="7" fill="#9f1d45" stroke="#fff1d4" stroke-width="2"/></g><path d="M -115 -115 L -160 -94 L -176 -37 L -149 -8 L -112 -57" fill="#672039" stroke="#f3b18b" stroke-width="4"/>';
 s+='</g>';return s;
}
function render(){
 if(!stage)return;if(typeof G!=='undefined'&&G.mode==='menu'){stage.innerHTML='';return;}
 let s='<defs><radialGradient id="it50Gourd"><stop stop-color="#f7cf88"/><stop offset=".28" stop-color="#b85135"/><stop offset=".68" stop-color="#71203c"/><stop offset="1" stop-color="#2b0b20"/></radialGradient><linearGradient id="it50Blade" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#9b9cab"/><stop offset=".22" stop-color="#fff4d2"/><stop offset=".45" stop-color="#8b93a8"/><stop offset=".65" stop-color="#f9f4e5"/><stop offset="1" stop-color="#44445c"/></linearGradient><linearGradient id="it50Armor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8b188"/><stop offset=".23" stop-color="#ad4350"/><stop offset=".62" stop-color="#4a132d"/><stop offset="1" stop-color="#110711"/></linearGradient><linearGradient id="it50ArmorBright" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffc698"/><stop offset=".35" stop-color="#c65b65"/><stop offset=".75" stop-color="#6b203b"/><stop offset="1" stop-color="#230a1e"/></linearGradient><linearGradient id="it50Mirror" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff4cf"/><stop offset=".18" stop-color="#9af4ff"/><stop offset=".36" stop-color="#b59cff"/><stop offset=".54" stop-color="#ffb0cf"/><stop offset=".72" stop-color="#f6f1d0"/><stop offset="1" stop-color="#8ad7fb"/></linearGradient></defs>';
 const c=Q.cinema;if(c&&c.kind==='tsukuyomi'){stage.innerHTML=s+tsukuyomi(c);return;}
 if(Q.flameBreath&&Q.flameBreath.owner&&alive(Q.flameBreath.owner.opp)){
  const b=Q.flameBreath,o=point(b.owner.x,b.owner.y-86),d=b.owner.facing||1,p=clamp(b.t/20,0,1);
  s+='<rect width="1280" height="720" fill="#14050b" opacity="'+(.14+p*.1)+'"/><path d="M 0 580 Q 180 510 330 574 T 650 550 T 980 567 T 1280 520 L 1280 720 L 0 720 Z" fill="#4a0a16" opacity=".55"/>';
  for(let i=0;i<15;i++){const xx=(d>0?o.x-18:o.x+18)+(d>0?1:-1)*(i/14)*1180,h=180+(i%5)*31+Math.sin((b.t+i*8)*.13)*22,w=43+(i%4)*10;s+='<path d="M '+(xx-w)+' 620 Q '+(xx-w*1.35)+' '+(500-h*.2)+' '+(xx-w*.38)+' '+(470-h*.45)+' Q '+(xx+w*.1)+' '+(390-h)+' '+(xx+w*.22)+' '+(430-h*.8)+' Q '+(xx+w*1.2)+' '+(460-h*.3)+' '+(xx+w)+' 620 Z" fill="'+(i%3===0?'#ffad40':(i%3===1?'#f04426':'#941425'))+'" opacity=".72"/><path d="M '+(xx-w*.27)+' 620 Q '+(xx-w*.1)+' '+(510-h*.25)+' '+(xx+w*.04)+' '+(445-h*.75)+' Q '+(xx+w*.35)+' '+(500-h*.18)+' '+(xx+w*.33)+' 620 Z" fill="#ffe5a7" opacity=".7"/>';}
  for(let i=0;i<12;i++){const xx=(i*103+b.t*7)%1280,yy=640-((i*57+b.t*4)%390);s+='<circle cx="'+xx+'" cy="'+yy+'" r="'+(1.5+i%3)+'" fill="'+(i%2?'#ffcb72':'#ff5b38')+'"/>';}
  s+='<path d="M '+o.x+' '+(o.y-4)+' L '+(d>0?1280:0)+' '+(245+Math.sin(b.t*.13)*30)+'" stroke="#ff8b48" stroke-width="5" opacity=".44"/>';
 }
 if(Q.amaterasuImpact&&Q.amaterasuImpact.t<42){const q=Q.amaterasuImpact,p=point(q.target.x,q.target.y-84),t=q.t;s+='<g opacity="'+(1-t/44)+'"><circle cx="'+p.x+'" cy="'+p.y+'" r="'+(28+t*4)+'" fill="none" stroke="#ff3b69" stroke-width="3"/><circle cx="'+p.x+'" cy="'+p.y+'" r="'+(19+t*2.8)+'" fill="none" stroke="#8d3cff" stroke-width="2"/><path d="M '+(p.x-360)+' '+(p.y-180)+' L '+p.x+' '+p.y+' L '+(p.x+240)+' '+(p.y+60)+'" fill="none" stroke="#ed2c58" stroke-width="2"/><text x="'+p.x+'" y="'+(p.y-90-t)+'" fill="#ff8ca8" font-size="22" font-family="monospace" text-anchor="middle" letter-spacing="6">MANGEKYO LOCK</text></g>';}
 for(const b of Q.burns||[])if(b&&b.kind==='amaterasu'&&alive(b.target))s+=blackFire(b);
 if(!c||c.kind!=='ult')for(const f of fighters())if(f&&f.id==='itachi'&&f.moveKey==='s1'&&f.moveFrame<180){const p=point(f.x,f.y-119),t=Q.tick||0;s+='<g transform="translate('+p.x+' '+p.y+') scale('+p.s+')"><path d="M -40 -4 Q -32 17 -9 5 L -1 -5 L -15 -20 Q -30 -24 -40 -4 Z M 40 -4 Q 32 17 9 5 L 1 -5 L 15 -20 Q 30 -24 40 -4 Z" fill="#17111d" stroke="#b98a92" stroke-width="2"/><path d="M -18 -12 L -2 0 L -10 13 M 18 -12 L 2 0 L 10 13" fill="none" stroke="#ffe1c7" stroke-width="3"/><circle r="'+(6+Math.sin(t*.18)*2)+'" fill="#ff573f"/></g>';}
 if(c&&c.kind==='ult')s+='<rect width="1280" height="720" fill="#040208" opacity=".18"/>'+susanooArt(642,525,1.12,c.frame,.98);
 else for(const f of fighters())if(f&&f.id==='itachi'&&f.moveKey==='heavy'&&f.moveFrame>=5&&f.moveFrame<=44){const p=point(f.x,f.y-110);s+=susanooArt(p.x,p.y,.49,f.moveFrame,.55);}
 stage.innerHTML=s;
}
if(typeof oldRender==='function')window.render=function(){const out=oldRender.apply(this,arguments);render();if(Q.amaterasuImpact)Q.amaterasuImpact.t=Math.min(42,Q.amaterasuImpact.t+1);return out;};
console.info('[JFF Itachi] Katon hand-seals/tap-volley/hold-flamethrower, long-range Amaterasu, 8s Tsukuyomi, and larger Susanoo VFX ready.');
})();