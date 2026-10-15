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

/* 5) Ultimate: a live Totsuka thrust, followed by sealing instead of the normal Susanoo transform. */
function updateTotsuka(f,n){
 const d=f.facing||1,o=f.opp;f.itachiPoseKey='edo-totsuka';
 if(n===1){Q.edoTotsuka={owner:f,target:o||null,t:0,d:78,hit:false,sealed:false};f.vx=0;f.invuln=Math.max(f.invuln||0,58);fx('reflect',f.x+d*52,f.y-135,38);fx('crows',f.x-d*14,f.y-88,28);if(typeof SFX!=='undefined'&&SFX.awaken)SFX.awaken();impact(.28,'#c5cde0');}
 if(n===22){fx('seal',f.x+d*65,f.y-116,36);fx('reflect',f.x+d*88,f.y-140,34);}
 if(n===38&&Q.edoTotsuka&&!Q.edoTotsuka.hit){
  const target=f.opp,valid=alive(target)&&(target.x-f.x)*d>-25&&Math.abs(target.x-f.x)<=730&&Math.abs(target.y-f.y)<=230;
  Q.edoTotsuka.hit=true;
  if(valid){
   f.facing=target.x>=f.x?1:-1;const max=target.maxHp||200;
   const damage=Math.round(max*.42);
   if(target.hp<=damage||target.hp/max<=.30){target.hp=0;target.state='DEFEAT';target.stateFrame=0;Q.edoTotsuka.sealed=true;}
   else{target.hp=Math.max(1,target.hp-damage);target.hitFlash=14;target.hitstun=Math.max(target.hitstun||0,42);target.vx=(f.facing||1)*10;target.vy=-4;if(target.state!=='DEFEAT')target.state='HITSTUN';}
   fx('seal',target.x,target.y-86,80);fx('explosion',target.x,target.y-83,34);fx('shock',target.x,target.y-82,35);impact(.58,'#e6d9b0');
   if(typeof window.floatText==='function')window.floatText(target.x,target.y-161,Q.edoTotsuka.sealed?'TOTSUKA · SEALED':'TOTSUKA STRIKE','#f1e7c4',18,48);
   if(typeof SFX!=='undefined'&&SFX.blackflash)SFX.blackflash();
  }else fx('reflect',f.x+d*95,f.y-120,18);
 }
 if(n>=82)stop(f);
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
 const result=oldStep.apply(this,arguments);
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
 const result=oldReset.apply(this,arguments);
 if(f&&f.itachiEdo){f.itachiEdoYataUntil=0;f.itachiCrowTeleported=false;f.itachiCrowStruck=false;}
 for(const key of ['edoBlackFlameZone','edoCrowEffect','edoTotsuka'])if(Q[key]&&Q[key].owner===f)Q[key]=null;
 Q.shots=(Q.shots||[]).filter(q=>q&&q.owner!==f);return result;
};
if(typeof oldPose==='function')window.applyCharacterIdentityPose=function(P,f){
 oldPose.apply(this,arguments);
 if(!P||!f||!f.itachiEdo||!f.move)return;
 const n=f.moveFrame||0,k=f.moveKey||'';
 if(k==='s4'){P.lean=n<6?-12:14;P.armF=n<6?[28,-45]:[10,-58];P.armB=n<6?[145,-35]:[151,-42];P.legF=n<6?[70,19]:[62,24];P.legB=n<6?[111,-12]:[119,-20];P.headY=-116;}
 else if(k==='s3'){P.lean=n<15?-8:14;P.armF=n<15?[35,-45]:[12,-58];P.armB=n<15?[130,-35]:[151,-45];P.legF=[77,14];P.legB=[109,-12];}
 else if(k==='s5'){P.lean=-7;P.armF=n<28?[24,-35]:[16,-58];P.armB=n<28?[133,-32]:[147,-46];P.legF=[80,9];P.legB=[102,-8];}
 else if(k==='def'){P.lean=-5;P.armF=[24,-52];P.armB=[143,-45];P.legF=[80,9];P.legB=[105,-10];}
 else if(k==='ult'){P.lean=n<38?-15:15;P.armF=n<38?[35,-45]:[13,-64];P.armB=n<38?[143,-40]:[151,-52];P.legF=[72,18];P.legB=[113,-17];}
};
const wrap=document.getElementById('wrap');let stage=null;
if(wrap){stage=document.createElementNS('http://www.w3.org/2000/svg','svg');stage.setAttribute('id','jffEdoItachiSkillStage');stage.setAttribute('viewBox','0 0 1280 720');stage.setAttribute('preserveAspectRatio','none');stage.setAttribute('aria-hidden','true');stage.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:7;pointer-events:none;overflow:hidden;display:block';wrap.appendChild(stage);}
function point(x,y){const z=typeof cam!=='undefined'&&Number.isFinite(cam.zoom)?cam.zoom:1,cx=typeof cam!=='undefined'&&Number.isFinite(cam.x)?cam.x:640,cy=typeof cam!=='undefined'&&Number.isFinite(cam.y)?cam.y:360;return{x:640+((G&&G.shakeX)||0)+(x-cx)*z,y:360+((G&&G.shakeY)||0)+(y-cy)*z,s:z};}
function crows(p,t,alpha){
 let out='<g transform="translate('+p.x+' '+p.y+') scale('+p.s+') rotate('+(Math.sin(t*.22)*9)+')" opacity="'+alpha+'">';
 for(let i=0;i<7;i++){const a=t*.18+i*2.399,r=12+(i%3)*9,x=Math.cos(a)*r,y=Math.sin(a)*r*.65,w=Math.sin(t*.45+i)*5;out+='<path d="M '+(x-14)+' '+y+' Q '+(x-7)+' '+(y-9-w)+' '+x+' '+(y-3)+' L '+(x+5)+' '+(y-12+w)+' L '+(x+9)+' '+(y-2)+' L '+(x+16)+' '+(y+2)+' L '+(x+5)+' '+(y+5)+' L '+(x-4)+' '+(y+11)+' L '+(x-4)+' '+(y+4)+' Z" fill="#060710" stroke="#a7bad8" stroke-width=".75"/>';}
 return out+'</g>';
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
 const ult=Q.edoTotsuka;
 if(ult&&ult.owner){const f=ult.owner,o=ult.target||f.opp,d=f.facing||1,from=point(f.x+d*48,f.y-112),to=point(o&&alive(o)?o.x:f.x+d*430,o&&alive(o)?o.y-100:f.y-100),u=clamp(ult.t/38,0,1),fade=ult.t<54?1:Math.max(0,(ult.d-ult.t)/24),tx=from.x+(to.x-from.x)*u,ty=from.y+(to.y-from.y)*u-10*Math.sin(u*Math.PI)*from.s;
  s+='<g opacity="'+fade+'"><path d="M '+from.x+' '+from.y+' L '+(tx-14*from.s)+' '+(ty+6*from.s)+' L '+tx+' '+ty+' L '+(tx-7*from.s)+' '+(ty+17*from.s)+' Z" fill="#b4a7dc" stroke="#f4eac7" stroke-width="2"/><path d="M '+from.x+' '+(from.y-3*from.s)+' L '+(tx-8*from.s)+' '+(ty+1*from.s)+'" stroke="#fff7dd" stroke-width="'+(4*from.s)+'"/><path d="M '+(from.x-14*from.s)+' '+(from.y+4*from.s)+' L '+(from.x+12*from.s)+' '+(from.y-9*from.s)+' M '+(from.x-9*from.s)+' '+(from.y+11*from.s)+' L '+(from.x+17*from.s)+' '+(from.y-2*from.s)+'" stroke="#8f80bc" stroke-width="'+(5*from.s)+'"/>';
  if(ult.hit){const p=point(o&&alive(o)?o.x:f.x+d*260,o&&alive(o)?o.y-90:f.y-90),rad=(18+ult.t*1.2)*p.s;s+='<ellipse cx="'+p.x+'" cy="'+p.y+'" rx="'+rad+'" ry="'+(rad*1.5)+'" fill="none" stroke="#d9d0f3" stroke-width="3" stroke-dasharray="7 7"/><ellipse cx="'+p.x+'" cy="'+p.y+'" rx="'+(rad*.7)+'" ry="'+(rad*1.2)+'" fill="none" stroke="#fff1c0" stroke-width="2"/>';if(ult.sealed)s+='<text x="'+p.x+'" y="'+(p.y-rad*1.5)+'" text-anchor="middle" font-family="monospace" font-size="18" fill="#f4eac7" letter-spacing="4">SEALED</text>';}
  s+='</g>';}
 stage.innerHTML=s;
}
if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);renderStage();return r;};
window.JFF_EDO_ITACHI_SKILLS={ready:true,version:1,skills:['Crow Body Replacement','Yasaka Barrage','Amaterasu Black Flame Field','Yata Mirror Reversal','Totsuka Sealing Finale']};
console.info('[Edo Itachi] Unique skills loaded: Crow Replacement, Yasaka Barrage, Black Flame Field, Yata Reversal, Totsuka Sealing.');
})();