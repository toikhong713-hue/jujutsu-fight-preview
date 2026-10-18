/* SUSANOO PHASE 1/2 REBUILD
   New non-weapon chakra abilities. Phase 3 remains owned by the legacy combat kit.
   P1: Z / X. P2: Numpad + / Numpad /.
*/
(function(){
'use strict';
if(window.__JFF_SUSANOO_PHASE_SKILLS_V2__)return;
const Q=window.JFF_ITACHI_REBOOT;
if(!Q)return;
window.__JFF_SUSANOO_PHASE_SKILLS_V2__=true;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fighters=()=>typeof G!=='undefined'&&Array.isArray(G.fighters)?G.fighters:[];
const alive=f=>!!(f&&f.hp>0&&f.state!=='DEFEAT'&&f.state!=='VICTORY');
const now=()=>Number(Q.tick||(typeof G!=='undefined'&&G.frame)||0);
const fx=(kind,x,y,d,data)=>{if(typeof window.JFF_OUTSIDER_FX==='function')window.JFF_OUTSIDER_FX(kind,x,y,d||20,data||{});};
const impact=(power,color,hitstop)=>{if(typeof window.flash==='function')window.flash(power||.12,color||'#e84b45');if(typeof window.shake==='function')window.shake(Math.max(2,Math.round((power||.12)*24)));if(typeof window.camPunch==='function')window.camPunch((power||.12)*.2);if(hitstop&&typeof G!=='undefined')G.hitstop=Math.max(G.hitstop||0,hitstop);};
const projectiles=[];
const skills={
 p1_bones:{name:'Bone Requiem',cd:390,hp:3,duration:150,visual:'phase1_bones'},
 edo_p1_grasp:{name:'Edo · Ashen Grasp',cd:420,hp:0,duration:150,visual:'edo_phase1_grasp'},
 p1_magatama:{name:'Yasaka Magatama',cd:420,hp:4,duration:150,visual:'phase1_magatama'},
 edo_p1_rift:{name:'Edo · Crow Rift Collapse',cd:450,hp:0,duration:108,visual:'edo_phase1_rift'},
 p2_seal:{name:'Crimson Sealing Wave',cd:600,hp:6,duration:168,visual:'phase2_seal'},
 p2_guard:{name:'Prismatic Chakra Guard',cd:540,hp:5,duration:144,visual:'phase2_guard'},
 edo_p2_eclipse:{name:'Edo · Black Ash Eclipse',cd:600,hp:0,duration:132,visual:'edo_phase2_eclipse'}
};
function phaseOf(f){return clamp(Math.round(Number(f&&f.itachiSusanooPhase)||3),1,3);}
function idFor(f,slot){if(phaseOf(f)===1)return slot===1?(f&&f.itachiEdo?'edo_p1_grasp':'p1_bones'):(f&&f.itachiEdo?'edo_p1_rift':'p1_magatama');if(phaseOf(f)===2)return slot===1?'p2_seal':(f&&f.itachiEdo?'edo_p2_eclipse':'p2_guard');return null;}
function cooldownText(f,id){const until=f.itachiPhaseSkillCooldowns&&f.itachiPhaseSkillCooldowns[id]||0;return until>now()?'COOLDOWN '+((until-now())/60).toFixed(1)+'s':'READY';}
function skillNameFor(f,id){
 if(!id||!skills[id])return 'No Phase Skill';
 if(id==='edo_p1_rift')return 'Edo · Crow Rift Collapse';
 if(id==='edo_p2_eclipse')return 'Edo · Black Ash Eclipse';
 return skills[id].name;
}
function labelFor(f){
 const a=idFor(f,1),b=idFor(f,2),k1=f.isP2?'NUM +':'Z',k2=f.isP2?'NUM /':'X';
 return '<div class="jff-psk-owner">'+(f.isP2?'P2':'P1')+' · '+(f.itachiEdo?'EDO ITACHI':'ITACHI')+' · PHASE '+phaseOf(f)+'</div>'+
 '<div class="jff-psk-grid"><div class="jff-psk-card"><span class="jff-psk-key">'+k1+'</span><b>'+skillNameFor(f,a)+'</b><small>'+cooldownText(f,a)+'</small></div>'+
 '<div class="jff-psk-card"><span class="jff-psk-key">'+k2+'</span><b>'+skillNameFor(f,b)+'</b><small>'+cooldownText(f,b)+'</small></div></div>';
}
let panel=null,lastTick=-999,lastSignature='';
function updatePanel(force){
 if(typeof document==='undefined')return;
 if(!panel){
  panel=document.getElementById('jffSusanooPhaseSkillPanel');
  if(!panel){
   panel=document.createElement('div');panel.id='jffSusanooPhaseSkillPanel';panel.setAttribute('aria-live','polite');
   const st=document.createElement('style');
   st.textContent='#jffSusanooPhaseSkillPanel{position:absolute;right:18px;top:318px;width:354px;max-width:calc(100% - 36px);box-sizing:border-box;z-index:9;pointer-events:none;color:#fff0e8;font:11px/1.35 Arial,sans-serif;background:linear-gradient(140deg,rgba(30,7,13,.96),rgba(9,7,13,.95));border:1px solid rgba(255,102,74,.72);border-radius:8px;padding:9px;box-shadow:0 6px 24px rgba(0,0,0,.3)}#jffSusanooPhaseSkillPanel .jff-psk-owner{font-weight:800;letter-spacing:1px;color:#ffb19a;margin-bottom:7px}#jffSusanooPhaseSkillPanel .jff-psk-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}#jffSusanooPhaseSkillPanel .jff-psk-card{position:relative;min-width:0;border:1px solid rgba(255,145,116,.3);background:rgba(255,255,255,.045);border-radius:5px;padding:7px 6px 6px 38px;min-height:39px;box-sizing:border-box}#jffSusanooPhaseSkillPanel .jff-psk-key{position:absolute;left:6px;top:7px;border:1px solid rgba(255,177,154,.8);border-radius:4px;padding:2px 4px;color:#fff5ed;font-weight:800}#jffSusanooPhaseSkillPanel b{display:block;font-size:10px;line-height:1.25;margin-bottom:5px}#jffSusanooPhaseSkillPanel small{display:block;color:#ffb19a;font-size:9px;letter-spacing:.4px}';
   document.head.appendChild(st);document.getElementById('wrap')?.appendChild(panel);
  }
 }
 const hidden=typeof G==='undefined'||G.mode==='menu'||G.paused||!!Q.cinema||!!Q.edoSusanooCutscene;
 const owners=hidden?[]:fighters().filter(f=>alive(f)&&f.id==='itachi'&&!f.ai&&f.itachiSusanooActive&&phaseOf(f)<3).sort((a,b)=>(a.isP2?1:0)-(b.isP2?1:0));
 const signature=owners.map(f=>(f.isP2?'2':'1')+':'+(f.itachiEdo?'e':'n')+':'+phaseOf(f)).join('|');
 if(signature!==lastSignature){lastSignature=signature;force=true;}
 panel.style.display=owners.length?'block':'none';panel.setAttribute('aria-hidden',owners.length?'false':'true');
 if(force)panel.innerHTML=owners.map(labelFor).join('<div style="height:7px"></div>');
}
function findPlayer(code){const fs=fighters();const f=(code==='NumpadAdd'||code==='NumpadDivide')?fs[1]:fs[0];return f&&f.id==='itachi'&&!f.ai&&f.itachiSusanooActive&&alive(f)?f:null;}
function canCast(f,id){
 if(!id||!f||!alive(f)||!f.itachiSusanooActive||phaseOf(f)>=3||Q.cinema||Q.edoSusanooCutscene)return false;
 if(f.move||!['IDLE','WALK','LAND','ATTACK'].includes(f.state))return false;
 const until=f.itachiPhaseSkillCooldowns&&f.itachiPhaseSkillCooldowns[id]||0;
 if(until>now()){if(typeof window.floatText==='function')window.floatText(f.x,f.y-190,'COOLDOWN · '+((until-now())/60).toFixed(1)+'s','#ffb19a',12,25);return false;}
 const cost=f.itachiEdo?0:(skills[id].hp||0);
 if(cost&&f.hp<=cost){if(typeof window.floatText==='function')window.floatText(f.x,f.y-180,'TOO WEAK TO CAST','#ff9baf',12,26);return false;}
 return true;
}
function startSkill(f,id){
 if(!canCast(f,id))return false;
 const def=skills[id],o=f.opp,d=f.facing||1;
 if(alive(o)&&Math.abs(o.y-f.y)<190)f.facing=o.x>=f.x?1:-1;
 if(!f.itachiEdo&&def.hp)f.hp=Math.max(1,f.hp-def.hp);
 f.itachiPhaseSkillCooldowns=f.itachiPhaseSkillCooldowns||{};f.itachiPhaseSkillCooldowns[id]=now()+def.cd;
 f.itachiPhaseSkillKey=id;f.itachiPhaseSkillUsed=false;f.itachiPhaseSkillMarks={};f.itachiPhaseGuardTriggered=false;
 if(id==='p2_guard'){f.itachiPhaseGuardUntil=f.itachiEdo?0:now()+78;f.itachiPhaseGuardTarget=null;f.itachiPhaseGuardCounterHit=false;}
 f.moveKey=def.visual;f.moveFrame=0;f.state='ATTACK';f.stateFrame=0;f.vx*=.12;
 f.itachiSusanooAction=def.visual;f.itachiPoseKey=def.visual;
 f.move={name:skillNameFor(f,id),kind:'special',startup:12,active:24,recovery:20,damage:0,hitbox:null,cost:0,cd:0};
 fx(f.itachiEdo?'crows':'fire',f.x-d*26,f.y-100,18);
 if(typeof SFX!=='undefined'&&SFX.ui)SFX.ui();return true;
}
function finishSkill(f){
 f.itachiPhaseSkillKey='';f.itachiPhaseSkillUsed=false;f.itachiPhaseGuardUntil=0;
 f.move=null;f.moveKey=null;f.moveFrame=0;f.state=alive(f)?'IDLE':'DEFEAT';f.stateFrame=0;f.itachiPoseKey='';f.itachiSusanooAction='';f.vx*=.2;
}
function hitTarget(f,damage,range,opts){
 const o=f&&f.opp;if(!alive(f)||!alive(o))return false;
 const d=f.facing||1,dx=(o.x-f.x)*d,cfg=opts||{};
 if(dx< -40||dx>range||Math.abs(o.y-f.y)>(cfg.vertical||180))return false;
 const mv={damage,hitstun:cfg.hitstun||25,blockstun:cfg.blockstun===undefined?10:cfg.blockstun,kbx:cfg.kbx===undefined?d*7:cfg.kbx,kby:cfg.kby===undefined?-2:cfg.kby,hitstop:cfg.hitstop||8,meter:cfg.meter===undefined?6:cfg.meter,armorBreak:!!cfg.armorBreak,kind:'special',type:'chakra',susanoo:true};
 const result=typeof window.resolveHit==='function'?window.resolveHit(f,o,mv,f.x+d*Math.min(range,Math.max(75,dx)),f.y-105):'whiff';
 if(result==='hit'){fx(cfg.fx||'shock',o.x,o.y-88,cfg.fxDuration||24);return true;}return false;
}

/* Edo Z replacement: articulated grave-hand rig, independent of the shared VFX pool. */
const gravehand={owner:null,target:null,start:0,impactDone:false,particles:[],root:null};
function gravePoint(x,y){
 const z=(typeof cam!=='undefined'&&Number.isFinite(cam.zoom))?cam.zoom:1;
 const cx=(typeof cam!=='undefined'&&Number.isFinite(cam.x))?cam.x:640;
 const cy=(typeof cam!=='undefined'&&Number.isFinite(cam.y))?cam.y:360;
 return {x:640+((typeof G!=='undefined'&&G.shakeX)||0)+(x-cx)*z,y:360+((typeof G!=='undefined'&&G.shakeY)||0)+(y-cy)*z,s:z};
}
function graveRoot(){
 if(gravehand.root)return gravehand.root;
 const wrap=document.getElementById('wrap');if(!wrap)return null;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.id='jffEdoGravehandStage';svg.setAttribute('viewBox','0 0 1280 720');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
 svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:7;pointer-events:none;overflow:hidden;display:block';
 wrap.appendChild(svg);gravehand.root=svg;return svg;
}
function boneCapsule(x1,y1,x2,y2,w){
 const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,ang=Math.atan2(dy,dx)*180/Math.PI;
 return '<g transform="translate('+x1.toFixed(1)+' '+y1.toFixed(1)+') rotate('+ang.toFixed(1)+')"><rect x="0" y="'+(-w/2)+'" width="'+len.toFixed(1)+'" height="'+w+'" rx="'+(w*.42)+'" fill="url(#graveBone)" stroke="#34343b" stroke-width="'+Math.max(1,w*.09)+'"/><path d="M 4 '+(-w*.18)+' L '+(len-4)+' '+(-w*.18)+'" stroke="#fff2d6" stroke-width="'+Math.max(1,w*.11)+'" opacity=".85"/><ellipse cx="4" cy="0" rx="'+(w*.42)+'" ry="'+(w*.38)+'" fill="#b8b4b1" stroke="#34343b" stroke-width="1"/><ellipse cx="'+(len-4)+'" cy="0" rx="'+(w*.42)+'" ry="'+(w*.38)+'" fill="#d5d0c8" stroke="#34343b" stroke-width="1"/></g>';
}
/* Override the actual shared fighter rig only while Edo Z is active. */
const gravehandBasePose=window.computePose;
if(typeof gravehandBasePose==='function')window.computePose=function(f){
 const pose=gravehandBasePose.apply(this,arguments);
 if(f&&f.itachiGravehandPose==='kneel-touch'&&pose){
  pose.hipY=-34;pose.shY=-52;pose.headY=-83;pose.lean=34;
  pose.legF=[62,60];pose.legB=[120,-60];
  pose.armF=[72,15];pose.armB=[110,30];
 }
 return pose;
};
function drawGravehand(){
 const svg=graveRoot();if(!svg)return;
 const g=gravehand,owner=g.owner,target=g.target;
 if(!owner||!alive(owner)||!owner.itachiPhaseSkillKey){svg.innerHTML='';g.owner=null;g.target=null;g.particles.length=0;return;}
 const n=Math.max(0,(owner.moveFrame||0)),p=gravePoint(target?target.x:owner.x+(owner.facing||1)*230,target?target.y:owner.y),z=p.s||1;
 const q=(a,b)=>clamp((n-a)/(b-a),0,1),rise=q(18,53),lift=q(44,72),slam=q(70,82),recover=q(83,112);
 const eased=rise*rise*(3-2*rise),slamEase=slam*slam*(3-2*slam);
 const scale=clamp(z,.68,1.35),handW=138*scale,groundY=p.y+12*scale;
 const handY=groundY+(1-eased)*145*scale-lift*48*scale+slamEase*48*scale;
 const close=q(58,72),fingerCurl=close*24;
 let dust='';
 for(let i=0;i<18;i++){
  const seed=i*2.399,n0=(n*.72+i*17)%43,side=Math.cos(seed),up=Math.sin(seed);
  const age=(n+i*7)%36,alpha=clamp(1-age/36,0,1)*(n<18?.0:n<70?1:clamp(1-(n-70)/22,0,1));
  const dx=side*(32+age*1.55)*scale,dy=-Math.abs(up)*(8+age*1.9)*scale+age*.36;
  dust+='<circle cx="'+(p.x+dx).toFixed(1)+'" cy="'+(groundY+dy).toFixed(1)+'" r="'+((1.4+(i%4)*.8)*scale).toFixed(1)+'" fill="'+(i%3===0?'#c4b7a4':'#655d58')+'" opacity="'+alpha.toFixed(2)+'"/>';
 }
 let smoke='';
 for(let i=0;i<7;i++){const age=(n*1.05+i*9)%42,xx=p.x+Math.sin(n*.09+i*2.2)*18*scale,yy=groundY-age*1.35*scale;smoke+='<ellipse cx="'+xx.toFixed(1)+'" cy="'+yy.toFixed(1)+'" rx="'+((8+age*.48)*scale).toFixed(1)+'" ry="'+((4+age*.25)*scale).toFixed(1)+'" fill="#77757b" opacity="'+(clamp(1-age/45,0,1)*.24).toFixed(2)+'"/>';}
 const wristTop=handY+10*scale,wristBottom=groundY+36*scale;
 const palmX=0,palmY=handY+34*scale;
 const fingers=[
  {x:-49,lean:-.62,len:42,w:13},{x:-25,lean:-.25,len:52,w:15},{x:0,lean:0,len:58,w:16},{x:25,lean:.28,len:51,w:15},{x:48,lean:.62,len:41,w:13}
 ];
 let bones='';
 fingers.forEach((f,i)=>{
   const curl=(i===0?-1:i===4?1:(i-2)*.16)*fingerCurl;
   const bx=f.x*scale,by=palmY;
   const j1x=bx+Math.sin(f.lean+curl*.012)*f.len*.55*scale,j1y=by-f.len*.55*scale;
   const j2x=j1x+Math.sin(f.lean+curl*.024)*f.len*.37*scale,j2y=j1y-f.len*.37*scale;
   const tipx=j2x+Math.sin(f.lean+curl*.032)*f.len*.27*scale,tipy=j2y-f.len*.27*scale;
   bones+=boneCapsule(bx,by,j1x,j1y,f.w*scale)+boneCapsule(j1x,j1y,j2x,j2y,(f.w-2)*scale)+boneCapsule(j2x,j2y,tipx,tipy,(f.w-4)*scale);
 });
 const visible=n>13&&n<112,opacity=visible?clamp(n<83?1:1-recover*.96,0,1):0;
 const crackOpacity=clamp(q(5,20)*(1-q(87,103)),0,1);
 const hitFlash=n>=78&&n<89?clamp(1-(n-78)/11,0,1):0;
 const hand='<g opacity="'+opacity.toFixed(2)+'" transform="translate('+p.x.toFixed(1)+' 0)">'+
   '<ellipse cx="0" cy="'+(groundY+4*scale).toFixed(1)+'" rx="'+(105*scale).toFixed(1)+'" ry="'+(17*scale).toFixed(1)+'" fill="#07070b" opacity=".58"/>'+
   '<path d="M -100 '+groundY+' L -64 '+(groundY-8*scale)+' L -42 '+(groundY+2*scale)+' L -17 '+(groundY-9*scale)+' L 4 '+(groundY+1*scale)+' L 35 '+(groundY-10*scale)+' L 62 '+(groundY+1*scale)+' L 96 '+groundY+'" fill="none" stroke="#c7bcae" stroke-width="'+(2.5*scale)+'" opacity="'+crackOpacity.toFixed(2)+'"/>'+
   '<g transform="translate(0 '+(wristTop).toFixed(1)+')">'+
   '<path d="M -24 0 L -29 '+(wristBottom-wristTop).toFixed(1)+' L 29 '+(wristBottom-wristTop).toFixed(1)+' L 24 0 Z" fill="#77757a" stroke="#26252d" stroke-width="'+(3*scale)+'"/>'+
   '<path d="M -14 4 L -16 '+(wristBottom-wristTop-4).toFixed(1)+' M 0 3 L 0 '+(wristBottom-wristTop-3).toFixed(1)+' M 14 4 L 16 '+(wristBottom-wristTop-4).toFixed(1)+'" stroke="#e2d9cc" stroke-width="'+(3*scale)+'" opacity=".85"/>'+
   '</g>'+
   '<path d="M -52 '+(palmY+8*scale)+' Q -63 '+(palmY-13*scale)+' -43 '+(palmY-25*scale)+' L -22 '+(palmY-31*scale)+' L 22 '+(palmY-31*scale)+' L 43 '+(palmY-20*scale)+' Q 61 '+(palmY-5*scale)+' 49 '+(palmY+14*scale)+' L 32 '+(palmY+28*scale)+' L -31 '+(palmY+28*scale)+' Z" fill="#8f8b8b" stroke="#2c2b32" stroke-width="'+(4*scale)+'"/>'+
   '<path d="M -37 '+(palmY-18*scale)+' Q 0 '+(palmY-35*scale)+' 37 '+(palmY-15*scale)+'" fill="none" stroke="#e4dbce" stroke-width="'+(5*scale)+'" opacity=".8"/>'+
   bones+
   '<g transform="translate(-35 '+(palmY+8*scale)+') rotate(-32)">'+boneCapsule(0,0,31*scale,7*scale,14*scale)+'</g>'+
   '</g>';
 svg.innerHTML='<defs><linearGradient id="graveBone" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#fff5dd"/><stop offset=".35" stop-color="#c8c1b7"/><stop offset=".7" stop-color="#85828a"/><stop offset="1" stop-color="#d8d0c4"/></linearGradient><radialGradient id="graveDust"><stop stop-color="#a9a09a" stop-opacity=".65"/><stop offset="1" stop-color="#48464d" stop-opacity="0"/></radialGradient><filter id="graveShadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter></defs>'+
   '<g>'+smoke+dust+'</g>'+
   (hitFlash?'<ellipse cx="'+p.x+'" cy="'+groundY+'" rx="'+(110*scale)+'" ry="'+(22*scale)+'" fill="none" stroke="#e8d6d1" stroke-width="'+(3*scale)+'" opacity="'+hitFlash+'"/><ellipse cx="'+p.x+'" cy="'+groundY+'" rx="'+(65*scale)+'" ry="'+(13*scale)+'" fill="none" stroke="#8d263e" stroke-width="'+(4*scale)+'" opacity="'+hitFlash+'"/>':'')+
   hand;
}

function updateSkill(f){
 const id=f.itachiPhaseSkillKey;if(!id||!f.move){finishSkill(f);return;}
 const n=(f.moveFrame||0)+1,o=f.opp,d=f.facing||1,t=now();f.moveFrame=n;f.itachiPoseKey=f.moveKey;f.itachiSusanooAction=f.moveKey;
 if(id==='p1_bones'){
  // 2.5s in-game timeline: seal -> twin-arm sweep -> synchronized ground slam -> recovery.
  if(n===1){f.vx*=.08;fx('seal',f.x,f.y-128,24);fx('reflect',f.x,f.y-168,20);}
  if(n===18){fx('seal',f.x,f.y-165,32);fx('shock',f.x,f.y-95,20);impact(.06,'#ff714b',2);}
  if(n===36){fx('shock',f.x+d*95,f.y-120,25);fx('fire',f.x+d*110,f.y-165,20);}
  if(n===60&&!f.itachiPhaseSkillMarks.boneSweep){f.itachiPhaseSkillMarks.boneSweep=true;const ok=hitTarget(f,12,390,{hitstun:18,kbx:d*4,kby:-1,hitstop:5,vertical:220,fx:false});if(ok){fx('shock',o.x,o.y-80,28);fx('seal',o.x,o.y-125,20);impact(.1,'#ff7548',4);}}
  if(n===76){fx('shock',f.x+d*170,f.y-25,40);fx('explosion',f.x+d*175,f.y-75,28);}
  if(n===90&&!f.itachiPhaseSkillMarks.boneSlam){f.itachiPhaseSkillMarks.boneSlam=true;const ok=hitTarget(f,25,420,{hitstun:32,kbx:d*12,kby:-5,hitstop:11,armorBreak:true,vertical:230,fx:false});if(ok){fx('explosion',o.x,o.y-82,42);fx('shock',o.x,o.y-25,50);fx('fire',o.x,o.y-95,28);impact(.24,'#ff603c',11);if(typeof window.floatText==='function')window.floatText(o.x,o.y-176,'BONE REQUIEM','#ffd0a8',14,40);}else impact(.08,'#ff633f',3);}
  if(n>=150)finishSkill(f);
 }else if(id==='edo_p1_grasp'){
  // Gravehand timeline: kneel and touch ground -> dirt breach -> articulated skeletal hand rises -> impact -> recover.
  if(n===1){
   f.vx=0;f.vy=0;f.itachiGravehandPose='kneel-touch';f.itachiPoseKey='edo_gravehand_kneel';
   gravehand.owner=f;gravehand.target=alive(o)?o:null;gravehand.start=t;gravehand.impactDone=false;gravehand.particles.length=0;
   fx('seal',f.x,f.y-8,20,{ash:true});impact(.035,'#6d2736',1);
  }
  if(n===8){fx('shock',f.x,f.y-3,14,{ash:true});}
   if(n===48)f.itachiGravehandPose='';
  if(n===15){
   const tx=gravehand.target&&alive(gravehand.target)?gravehand.target.x:f.x+d*230;
   const ty=gravehand.target&&alive(gravehand.target)?gravehand.target.y:f.y;
   fx('seal',tx,ty-8,28,{ash:true});fx('shock',tx,ty+3,18,{ash:true});impact(.045,'#6b2738',1);
  }
  if(n===24){fx('crows',gravehand.target?gravehand.target.x:f.x+d*230,(gravehand.target?gravehand.target.y:f.y)-8,12,{ash:true});}
  if(n===43){const tx=gravehand.target&&alive(gravehand.target)?gravehand.target.x:f.x+d*230;fx('explosion',tx,(gravehand.target?gravehand.target.y:f.y)+4,16,{ash:true});impact(.06,'#5e2636',2);}
  if(n===78&&!f.itachiPhaseSkillMarks.gravehandHit){
   f.itachiPhaseSkillMarks.gravehandHit=true;
   const target=gravehand.target&&alive(gravehand.target)?gravehand.target:o;
   if(alive(target)&&Math.abs(target.x-f.x)<620&&Math.abs(target.y-f.y)<260){
    const dir=target.x>=f.x?1:-1;f.facing=dir;
    const result=typeof window.resolveHit==='function'?window.resolveHit(f,target,{damage:29,hitstun:36,blockstun:12,kbx:dir*11,kby:-5,hitstop:12,meter:7,armorBreak:true,kind:'special',type:'chakra',susanoo:true},target.x,target.y-60):'whiff';
    if(result==='hit'||result==='block'){
     if(result==='hit')target.vy=Math.min(target.vy||0,-3.5);
     fx('explosion',target.x,target.y-46,26,{ash:true});fx('shock',target.x,target.y+4,34,{ash:true});fx('crows',target.x,target.y-60,12,{ash:true});
     impact(.24,'#9b354b',11);if(typeof window.floatText==='function')window.floatText(target.x,target.y-150,'GRAVEHAND SLAM','#f1dce0',13,38);
    }else impact(.08,'#72172d',3);
   }else impact(.06,'#72172d',2);
  }
  if(n>=116){f.itachiGravehandPose='';gravehand.owner=null;gravehand.target=null;finishSkill(f);}
 }else if(id==='p1_magatama'){
  if(n===1){f.vx*=.1;fx('magatama',f.x+d*50,f.y-155,26);}
  if(n===15){fx('magatama',f.x+d*72,f.y-200,26);fx('magatama',f.x+d*95,f.y-178,26);fx('magatama',f.x+d*62,f.y-151,26);}
  if(n===38&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;projectiles.push({type:'yasaka-triad',owner:f,target:o,x:f.x+d*98,y:f.y-178,vx:d*15.5,dir:d,age:0,maxAge:70,done:false});fx('magatama',f.x+d*105,f.y-178,32);fx('shock',f.x+d*90,f.y-155,24);fx('seal',f.x+d*118,f.y-178,18);impact(.08,'#ff693d',3);}
  if(n>=150)finishSkill(f);
 }else if(id==='edo_p1_rift'){
  // A phase change, not a projectile: vanish into ash, reappear behind the opponent, then trigger three remote rift bursts.
  if(n===1){f.vx=0;f.invuln=Math.max(f.invuln||0,10);fx('crows',f.x,f.y-100,34);fx('seal',f.x,f.y-125,28);impact(.08,'#6f112b',3);}
  if(n===12){fx('crows',f.x,f.y-105,42);fx('explosion',f.x,f.y-95,24);}
  if(n===22&&alive(o)&&Math.abs(o.x-f.x)<620&&Math.abs(o.y-f.y)<240){
   const dir=o.x>=f.x?1:-1;f.x=clamp(o.x-dir*86,window.WALL||90,(window.ARENA_W||3200)-(window.WALL||90));f.facing=dir;f.vx=0;f.invuln=Math.max(f.invuln||0,12);
   fx('crows',f.x,f.y-100,38);fx('seal',o.x,o.y-120,30);impact(.12,'#7c102b',5);
  }
  if(n===34){fx('seal',o&&alive(o)?o.x:f.x+d*150,o&&alive(o)?o.y-120:f.y-120,34);fx('shock',o&&alive(o)?o.x:f.x+d*150,o&&alive(o)?o.y-90:f.y-90,24);}
  if(n===43&&!f.itachiPhaseSkillMarks.riftA){f.itachiPhaseSkillMarks.riftA=true;const ok=hitTarget(f,12,440,{hitstun:18,kbx:d*3,kby:-1,hitstop:4,vertical:240,fx:false});if(ok){fx('explosion',o.x,o.y-90,26);fx('crows',o.x,o.y-100,18);}}
  if(n===54&&!f.itachiPhaseSkillMarks.riftB){f.itachiPhaseSkillMarks.riftB=true;const ok=hitTarget(f,12,440,{hitstun:20,kbx:d*5,kby:-2,hitstop:5,vertical:240,fx:false});if(ok){fx('shock',o.x,o.y-75,28);fx('seal',o.x,o.y-110,28);}}
  if(n===66&&!f.itachiPhaseSkillMarks.riftC){f.itachiPhaseSkillMarks.riftC=true;const ok=hitTarget(f,24,470,{hitstun:32,kbx:d*12,kby:-6,hitstop:12,armorBreak:true,vertical:240,fx:false});if(ok){fx('explosion',o.x,o.y-85,42);fx('shock',o.x,o.y-35,46);fx('crows',o.x,o.y-100,26);impact(.26,'#97152f',13);if(typeof window.floatText==='function')window.floatText(o.x,o.y-175,'CROW RIFT · COLLAPSE','#ffd0dc',13,40);}else impact(.08,'#6f112b',3);}
  if(n>=108)finishSkill(f);
 }else if(id==='p2_seal'){
  if(n===1){f.vx*=.08;fx('seal',f.x,f.y-150,30);fx('reflect',f.x+d*75,f.y-165,22);}
  if(n===25){fx('seal',f.x+d*95,f.y-175,34);fx('magatama',f.x+d*120,f.y-180,25);}
  if(n===47){fx('shock',f.x+d*165,f.y-125,38);fx('fire',f.x+d*165,f.y-110,28);impact(.09,f.itachiEdo?'#b72d47':'#ff633f',3);}
  if(n===76){fx('seal',f.x+d*230,f.y-115,46);fx('shock',f.x+d*245,f.y-90,48);fx('explosion',f.x+d*245,f.y-70,35);impact(.16,f.itachiEdo?'#a92743':'#ff5c37',6);}
  if(n===92&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;const ok=hitTarget(f,39,590,{hitstun:40,kbx:d*16,kby:-4,hitstop:14,armorBreak:true,vertical:195,fx:false});if(ok){o.itachiPhaseSilenceUntil=t+120;fx('seal',o.x,o.y-110,48);fx('shock',o.x,o.y-40,52);fx('explosion',o.x,o.y-85,36);impact(.31,f.itachiEdo?'#ad2d4c':'#ff643f',15);if(typeof window.floatText==='function')window.floatText(o.x,o.y-182,'CRIMSON SEAL · 2s','#ffd4b9',14,44);}else impact(.12,'#ff633f',5);}
  if(n>=168)finishSkill(f);
 }else if(id==='p2_guard'){
  if(n===1){f.itachiPhaseGuardUntil=t+78;f.itachiPhaseGuardTriggered=false;f.itachiPhaseGuardTarget=null;f.itachiPhaseGuardCounterHit=false;fx('reflect',f.x+d*94,f.y-145,30);fx('seal',f.x+d*94,f.y-145,24);impact(.06,'#ff9666',2);}
  if(n===24){fx('reflect',f.x+d*104,f.y-145,35);fx('shock',f.x+d*108,f.y-90,25);}
  if(f.itachiPhaseGuardTriggered&&n===34&&!f.itachiPhaseGuardCounterHit){
   f.itachiPhaseGuardCounterHit=true;const target=f.itachiPhaseGuardTarget||o;
   const ok=hitTarget(f,31,420,{hitstun:38,kbx:d*12,kby:-4,hitstop:12,vertical:200,fx:false});
   if(ok){const waveX=f.x+d*170,waveY=f.y-105;fx('reflect',f.x+d*105,f.y-145,36);fx('shock',waveX,waveY,48);fx('explosion',f.x+d*235,f.y-85,40);fx('seal',target.x,target.y-115,30);impact(.25,'#ff7449',13);if(typeof window.floatText==='function')window.floatText(target.x,target.y-178,'YATA SHOCKWAVE','#ffd7b8',14,40);}
  }
  if(n===80)f.itachiPhaseGuardUntil=0;
  if(n>=144){f.itachiPhaseGuardUntil=0;finishSkill(f);}
 }else if(id==='edo_p2_eclipse'){
  // A large, remote gravity well. No parry stance and no arm-based heavy animation.
  if(n===1){f.vx=0;fx('crows',f.x,f.y-105,36);fx('seal',f.x+d*120,f.y-175,32);impact(.08,'#390b22',3);}
  if(n===18){const tx=alive(o)?o.x:f.x+d*300,ty=alive(o)?o.y:f.y;fx('seal',tx,ty-135,50);fx('magatama',tx,ty-185,36);fx('crows',tx,ty-95,26);}
  if(n===38&&alive(o)&&Math.abs(o.x-f.x)<760&&Math.abs(o.y-f.y)<300){
   o.itachiEclipseMarkedUntil=t+60;o.vx*=.25;fx('seal',o.x,o.y-130,54);fx('shock',o.x,o.y-55,28);impact(.1,'#64112a',5);
  }
  if(n===62&&!f.itachiPhaseSkillMarks.eclipseA){
   f.itachiPhaseSkillMarks.eclipseA=true;
   const ok=hitTarget(f,18,780,{hitstun:24,kbx:d*3,kby:-2,hitstop:7,vertical:300,fx:false});
   if(ok){o.vx=(f.x-o.x)*.035;fx('explosion',o.x,o.y-105,34);fx('seal',o.x,o.y-135,48);impact(.13,'#78132d',7);}
  }
  if(n===84&&!f.itachiPhaseSkillMarks.eclipseB){
   f.itachiPhaseSkillMarks.eclipseB=true;
   const ok=hitTarget(f,34,780,{hitstun:42,kbx:d*14,kby:-7,hitstop:15,armorBreak:true,vertical:300,fx:false});
   if(ok){o.itachiPhaseSilenceUntil=t+120;fx('explosion',o.x,o.y-100,58);fx('shock',o.x,o.y-30,64);fx('crows',o.x,o.y-95,36);impact(.32,'#9d1738',16);if(typeof window.floatText==='function')window.floatText(o.x,o.y-185,'BLACK ASH ECLIPSE','#ffc4d0',15,48);}
   else impact(.1,'#64112a',4);
  }
  if(n>=132)finishSkill(f);
 }
}
const oldUpdate=window.updateMove;
if(typeof oldUpdate==='function')window.updateMove=function(f){
 if(f&&f.itachiPhaseSkillKey){const k=f.itachiPhaseSkillKey;if(!f.move||!skills[k]||f.moveKey!==skills[k].visual){f.itachiPhaseSkillKey='';f.itachiPhaseGuardUntil=0;return oldUpdate.apply(this,arguments);}updateSkill(f);return;}
 return oldUpdate.apply(this,arguments);
};
const oldResolve=window.resolveHit;
function frontFacing(def,att){return (def.facing||1)===(Math.sign(att.x-def.x)||1);}
if(typeof oldResolve==='function')window.resolveHit=function(attacker,defender,mv,hx,hy){
 const t=now();
 if(defender&&alive(defender)&&alive(attacker)&&attacker!==defender&&mv&&defender.itachiPhaseSkillKey==='p2_guard'&&(defender.itachiPhaseGuardUntil||0)>=t&&!defender.itachiPhaseGuardTriggered&&frontFacing(defender,attacker)){
  defender.itachiPhaseGuardTriggered=true;defender.itachiPhaseGuardTarget=attacker;defender.itachiPhaseGuardUntil=0;
  attacker.vx=0;attacker.vy=0;attacker.hitstun=Math.max(attacker.hitstun||0,16);attacker.state='HITSTUN';attacker.stateFrame=0;attacker.move=null;attacker.moveKey=null;attacker.moveFrame=0;
  fx('reflect',defender.x+(defender.facing||1)*70,defender.y-110,30);fx('shock',attacker.x,attacker.y-65,26);impact(.12,defender.itachiEdo?'#a93a55':'#ff9666',7);
  if(typeof window.floatText==='function')window.floatText(attacker.x,attacker.y-170,'CHAKRA GUARD · PARRIED','#ffd7b8',13,34);
  return 'parry';
 }
 return oldResolve.apply(this,arguments);
};
const oldStart=window.startMove;
if(typeof oldStart==='function')window.startMove=function(f,key){
 if(f&&alive(f)&&(f.itachiPhaseSilenceUntil||0)>now()&&['s1','s2','s3','s4','s5','def','ult'].includes(key)){
  if(typeof window.floatText==='function')window.floatText(f.x,f.y-170,'SEALED · '+Math.ceil((f.itachiPhaseSilenceUntil-now())/60)+'s','#ffd0bc',12,24);return false;
 }
 return oldStart.apply(this,arguments);
};
function updateProjectiles(){
 const t=now();
 for(let i=projectiles.length-1;i>=0;i--){
  const p=projectiles[i],o=p.target;p.age++;p.x+=p.vx;p.y+=Math.sin(p.age*.22+(p.shot||0))*(p.type==='edo-yasaka-bead'?2.2:1.25);
  if(p.type==='yasaka-triad'){
   const spread=10+Math.min(17,p.age*.32),spin=p.age*.12;
   for(let bead=0;bead<3;bead++){const a=spin+bead*Math.PI*2/3,bx=p.x+Math.cos(a)*spread,by=p.y+Math.sin(a)*spread*.72;if(p.age%2===0)fx('magatama',bx,by,12,{spin:a,ash:!!p.owner.itachiEdo});}
   if(p.age%4===0)fx('seal',p.x-p.vx*.7,p.y,10,{ash:!!p.owner.itachiEdo});
  }else if(p.type==='edo-yasaka-bead'){
   if(p.age%2===0){fx('magatama',p.x,p.y,15,{spin:p.age*.25,ash:true});fx('seal',p.x-p.vx*.55,p.y,9,{ash:true});}
  }else if(p.age%3===0)fx('magatama',p.x,p.y,14,{spin:p.age*.2,ash:!!p.owner.itachiEdo});
  const edoBead=p.type==='edo-yasaka-bead';
  const collided=alive(o)&&Math.abs(o.x-p.x)<(p.type==='yasaka-triad'?82:edoBead?56:62)&&Math.abs((o.y-90)-p.y)<(p.type==='yasaka-triad'?125:edoBead?76:105);
  const missed=p.age>=p.maxAge||p.x<(window.WALL||90)||p.x>(window.ARENA_W||3200)-(window.WALL||90);
  if(collided||missed){
   if(edoBead){fx('explosion',p.x,p.y,24);fx('shock',p.x,p.y+10,26);fx('crows',p.x,p.y-15,12);}
   else{fx('explosion',p.x,p.y,36);fx('shock',p.x,p.y+18,38);}
   impact(edoBead ? 0.12 : 0.18,p.owner&&p.owner.itachiEdo?'#a72a45':'#ff663c',edoBead?5:8);
   if(alive(o)&&Math.abs(o.x-p.x)<(p.type==='yasaka-triad'?165:edoBead?92:145)&&Math.abs(o.y-p.owner.y)<205){
    const result=window.resolveHit(p.owner,o,{damage:edoBead?15:p.type==='yasaka-triad'?31:25,hitstun:edoBead?18:p.type==='yasaka-triad'?32:28,blockstun:10,kbx:(p.owner.facing||1)*(edoBead?7:p.type==='yasaka-triad'?13:10),kby:edoBead?-1:-3,hitstop:edoBead?5:10,meter:edoBead?3:7,armorBreak:false,kind:'special',type:'chakra'},p.x,p.y);
    if(result==='hit'){
     if(!edoBead){const base=Number.isFinite(o.walk)?o.walk:3.5;o.itachiPhaseSlowBase=base;o.itachiPhaseSlowUntil=t+90;}
     fx('seal',o.x,o.y-90,edoBead?15:24);fx('explosion',o.x,o.y-90,edoBead?22:p.type==='yasaka-triad'?42:30);
     if(typeof window.floatText==='function')window.floatText(o.x,o.y-150,edoBead?'EDO MAGATAMA':p.type==='yasaka-triad'?'YASAKA TRIAD · SLOWED':'CHAKRA SLOWED','#ffd0bc',11,30);
    }
   }
   projectiles.splice(i,1);
  }
 }
}
function updateStatuses(){
 const t=now();
 for(const f of fighters()){
  if(!f)continue;
  if((f.itachiPhaseSlowUntil||0)>t&&Number.isFinite(f.itachiPhaseSlowBase))f.walk=f.itachiPhaseSlowBase*.7;
  else if(f.itachiPhaseSlowBase!==undefined){f.walk=f.itachiPhaseSlowBase;delete f.itachiPhaseSlowBase;f.itachiPhaseSlowUntil=0;}
  if((f.itachiEclipseMarkedUntil||0)>t&&f.itachiEclipseMarkedUntil&&f.opp&&alive(f.opp)){f.vx+=(f.opp.x-f.x)*.0008;}
  else if(f.itachiEclipseMarkedUntil){f.itachiEclipseMarkedUntil=0;}
  if((f.itachiPhaseSilenceUntil||0)>t&&f.itachiPhaseSilenceUntil){/* active seal status */}
  else if(f.itachiPhaseSilenceUntil){f.itachiPhaseSilenceUntil=0;}
 }
}
const oldUpdateMove=window.updateMove;
if(typeof oldUpdateMove==='function')window.updateMove=function(f){
 if(f&&f.id==='itachi'&&f.itachiPhaseSkillKey){updateSkill(f);drawGravehand();return;}
 return oldUpdateMove.apply(this,arguments);
};
const oldStep=window.step;
if(typeof oldStep==='function')window.step=function(){const r=oldStep.apply(this,arguments);if(typeof G!=='undefined'&&G.mode!=='menu'&&!G.paused){updateProjectiles();updateStatuses();}return r;};
function handleKey(e){
 if(typeof G==='undefined'||G.mode==='menu'||G.paused||Q.cinema||Q.edoSusanooCutscene||e.repeat)return;
 if(e.code!=='KeyZ'&&e.code!=='KeyX'&&e.code!=='NumpadAdd'&&e.code!=='NumpadDivide')return;
 const f=findPlayer(e.code);if(!f||phaseOf(f)>=3)return;
 const slot=(e.code==='KeyZ'||e.code==='NumpadAdd')?1:2,id=idFor(f,slot);if(!id)return;
 e.preventDefault();e.stopImmediatePropagation();startSkill(f,id);
}
addEventListener('keydown',handleKey,true);
const oldRender=window.render;
if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);const t=now();if(t%6===0){lastTick=t;updatePanel(true);}else updatePanel(false);drawGravehand();return r;};
if(typeof window.resetFighter==='function'){
 const oldReset=window.resetFighter;
 window.resetFighter=function(f){if(f){f.itachiPhaseSkillKey='';f.itachiPhaseSkillCooldowns={};f.itachiPhaseGuardUntil=0;f.itachiPhaseSilenceUntil=0;f.itachiPhaseSlowUntil=0;delete f.itachiPhaseSlowBase;}return oldReset.apply(this,arguments);};
}
window.JFF_SUSANOO_PHASE_SKILLS={ready:true,version:8,skills,phase3Unchanged:true,activate:(f,slot)=>{const id=idFor(f,slot);return startSkill(f,id);}};
console.info('[Susanoo] Phase 1/2 abilities rebuilt; P2 uses Numpad + and Numpad /. Numpad - remains available to passive.');
})();