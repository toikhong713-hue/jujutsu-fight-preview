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
 p1_bones:{name:'Bones of Judgement',cd:390,hp:3,duration:132,visual:'phase1_bones'},
 p1_magatama:{name:'Yasaka Magatama',cd:420,hp:4,duration:150,visual:'phase1_magatama'},
 p2_seal:{name:'Crimson Sealing Wave',cd:600,hp:6,duration:168,visual:'phase2_seal'},
 p2_guard:{name:'Prismatic Chakra Guard',cd:540,hp:5,duration:144,visual:'phase2_guard'}
};
function phaseOf(f){return clamp(Math.round(Number(f&&f.itachiSusanooPhase)||3),1,3);}
function idFor(f,slot){return phaseOf(f)===1?(slot===1?'p1_bones':'p1_magatama'):(phaseOf(f)===2?(slot===1?'p2_seal':'p2_guard'):null);}
function cooldownText(f,id){const until=f.itachiPhaseSkillCooldowns&&f.itachiPhaseSkillCooldowns[id]||0;return until>now()?'COOLDOWN '+((until-now())/60).toFixed(1)+'s':'READY';}
function labelFor(f){
 const a=idFor(f,1),b=idFor(f,2),k1=f.isP2?'NUM +':'Z',k2=f.isP2?'NUM /':'X';
 return '<div class="jff-psk-owner">'+(f.isP2?'P2':'P1')+' · '+(f.itachiEdo?'EDO ITACHI':'ITACHI')+' · PHASE '+phaseOf(f)+'</div>'+
 '<div class="jff-psk-grid"><div class="jff-psk-card"><span class="jff-psk-key">'+k1+'</span><b>'+skills[a].name+'</b><small>'+cooldownText(f,a)+'</small></div>'+
 '<div class="jff-psk-card"><span class="jff-psk-key">'+k2+'</span><b>'+skills[b].name+'</b><small>'+cooldownText(f,b)+'</small></div></div>';
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
 if(id==='p2_guard'){f.itachiPhaseGuardUntil=now()+78;f.itachiPhaseGuardTarget=null;f.itachiPhaseGuardCounterHit=false;}
 f.moveKey=def.visual;f.moveFrame=0;f.state='ATTACK';f.stateFrame=0;f.vx*=.12;
 f.itachiSusanooAction=def.visual;f.itachiPoseKey=def.visual;
 f.move={name:def.name,kind:'special',startup:12,active:24,recovery:20,damage:0,hitbox:null,cost:0,cd:0};
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
function updateSkill(f){
 const id=f.itachiPhaseSkillKey;if(!id||!f.move){finishSkill(f);return;}
 const n=(f.moveFrame||0)+1,o=f.opp,d=f.facing||1,t=now();f.moveFrame=n;f.itachiPoseKey=f.moveKey;f.itachiSusanooAction=f.moveKey;
 if(id==='p1_bones'){
  if(n===1){f.vx*=.1;fx('seal',f.x,f.y-125,24);fx('reflect',f.x,f.y-165,24);}
  if(n===18){fx('seal',f.x,f.y-155,40);fx('shock',f.x,f.y-90,28);impact(.08,f.itachiEdo?'#b52c48':'#ff633f',2);}
  if(n===34){fx('shock',f.x+d*100,f.y-100,35);fx('fire',f.x+d*95,f.y-145,28);}
  if(n===50){fx('shock',f.x+d*170,f.y-40,45);fx('explosion',f.x+d*185,f.y-75,36);}
  if(n===66){fx('shock',f.x+d*205,f.y-30,50);fx('explosion',f.x+d*210,f.y-85,40);impact(.2,f.itachiEdo?'#bd324c':'#ff5b38',8);}
  if(n===76&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;const ok=hitTarget(f,32,390,{hitstun:34,kbx:d*13,kby:-5,hitstop:12,armorBreak:true,vertical:205,fx:false});if(ok){fx('explosion',o.x,o.y-75,42);fx('shock',o.x,o.y-25,52);fx('fire',o.x,o.y-95,35);impact(.27,f.itachiEdo?'#9d243b':'#ff6038',12);if(typeof window.floatText==='function')window.floatText(o.x,o.y-176,'BONES OF JUDGEMENT','#ffd0a8',14,40);}else impact(.1,'#ff633f',3);}
  if(n>=132)finishSkill(f);
 }else if(id==='p1_magatama'){
  if(n===1){f.vx*=.1;fx('magatama',f.x+d*50,f.y-155,26);}
  if(n===15){fx('magatama',f.x+d*72,f.y-200,26);fx('magatama',f.x+d*95,f.y-178,26);fx('magatama',f.x+d*62,f.y-151,26);}
  if(n===38&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;projectiles.push({type:'yasaka-triad',owner:f,target:o,x:f.x+d*98,y:f.y-178,vx:d*15.5,dir:d,age:0,maxAge:70,done:false});fx('magatama',f.x+d*105,f.y-178,32);fx('shock',f.x+d*90,f.y-155,24);fx('seal',f.x+d*118,f.y-178,18);impact(.08,f.itachiEdo?'#b12c43':'#ff693d',3);}
  if(n>=150)finishSkill(f);
 }else if(id==='p2_seal'){
  if(n===1){f.vx*=.08;fx('seal',f.x,f.y-150,30);fx('reflect',f.x+d*75,f.y-165,22);}
  if(n===25){fx('seal',f.x+d*95,f.y-175,34);fx('magatama',f.x+d*120,f.y-180,25);}
  if(n===47){fx('shock',f.x+d*165,f.y-125,38);fx('fire',f.x+d*165,f.y-110,28);impact(.09,f.itachiEdo?'#b72d47':'#ff633f',3);}
  if(n===76){fx('seal',f.x+d*230,f.y-115,46);fx('shock',f.x+d*245,f.y-90,48);fx('explosion',f.x+d*245,f.y-70,35);impact(.16,f.itachiEdo?'#a92743':'#ff5c37',6);}
  if(n===92&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;const ok=hitTarget(f,39,590,{hitstun:40,kbx:d*16,kby:-4,hitstop:14,armorBreak:true,vertical:195,fx:false});if(ok){o.itachiPhaseSilenceUntil=t+120;fx('seal',o.x,o.y-110,48);fx('shock',o.x,o.y-40,52);fx('explosion',o.x,o.y-85,36);impact(.31,f.itachiEdo?'#ad2d4c':'#ff643f',15);if(typeof window.floatText==='function')window.floatText(o.x,o.y-182,'CRIMSON SEAL · 2s','#ffd4b9',14,44);}else impact(.12,'#ff633f',5);}
  if(n>=168)finishSkill(f);
 }else if(id==='p2_guard'){
  if(n===1){f.itachiPhaseGuardUntil=t+78;f.itachiPhaseGuardTriggered=false;f.itachiPhaseGuardTarget=null;f.itachiPhaseGuardCounterHit=false;fx('reflect',f.x+d*94,f.y-145,30);fx('seal',f.x+d*94,f.y-145,24);impact(.06,f.itachiEdo?'#a93a55':'#ff9666',2);}
  if(n===24){fx('reflect',f.x+d*104,f.y-145,35);fx('shock',f.x+d*108,f.y-90,25);}
  if(f.itachiPhaseGuardTriggered&&n===34&&!f.itachiPhaseGuardCounterHit){
   f.itachiPhaseGuardCounterHit=true;const target=f.itachiPhaseGuardTarget||o;
   const ok=hitTarget(f,31,420,{hitstun:38,kbx:d*12,kby:-4,hitstop:12,vertical:200,fx:false});
   if(ok){const waveX=f.x+d*170,waveY=f.y-105;fx('reflect',f.x+d*105,f.y-145,36);fx('shock',waveX,waveY,48);fx('explosion',f.x+d*235,f.y-85,40);fx('seal',target.x,target.y-115,30);impact(.25,f.itachiEdo?'#b32d50':'#ff7449',13);if(typeof window.floatText==='function')window.floatText(target.x,target.y-178,'YATA SHOCKWAVE','#ffd7b8',14,40);}
  }
  if(n===80)f.itachiPhaseGuardUntil=0;
  if(n>=144){f.itachiPhaseGuardUntil=0;finishSkill(f);}
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
  const p=projectiles[i],o=p.target;p.age++;p.x+=p.vx;p.y+=Math.sin(p.age*.22)*1.25;
  if(p.type==='yasaka-triad'){
   const spread=10+Math.min(17,p.age*.32),spin=p.age*.12;
   for(let bead=0;bead<3;bead++){const a=spin+bead*Math.PI*2/3,bx=p.x+Math.cos(a)*spread,by=p.y+Math.sin(a)*spread*.72; if(p.age%2===0)fx('magatama',bx,by,12,{spin:a,ash:!!p.owner.itachiEdo});}
   if(p.age%4===0){fx('seal',p.x-p.vx*.7,p.y,10,{ash:!!p.owner.itachiEdo});}
  }else if(p.age%3===0){fx('magatama',p.x,p.y,14,{spin:p.age*.2,ash:!!p.owner.itachiEdo});}
  const collided=alive(o)&&Math.abs(o.x-p.x)<(p.type==='yasaka-triad'?82:62)&&Math.abs((o.y-90)-p.y)<(p.type==='yasaka-triad'?125:105);
  const missed=p.age>=p.maxAge||p.x<(window.WALL||90)||p.x>(window.ARENA_W||3200)-(window.WALL||90);
  if(collided||missed){
   fx('explosion',p.x,p.y,36);fx('shock',p.x,p.y+18,38);impact(.18,p.owner&&p.owner.itachiEdo?'#a72a45':'#ff663c',8);
   if(alive(o)&&Math.abs(o.x-p.x)<(p.type==='yasaka-triad'?165:145)&&Math.abs(o.y-p.owner.y)<205){
    const result=window.resolveHit(p.owner,o,{damage:p.type==='yasaka-triad'?31:25,hitstun:p.type==='yasaka-triad'?32:28,blockstun:10,kbx:(p.owner.facing||1)*(p.type==='yasaka-triad'?13:10),kby:-3,hitstop:10,meter:7,armorBreak:false,kind:'special',type:'chakra'},p.x,p.y);
    if(result==='hit'){const base=Number.isFinite(o.walk)?o.walk:3.5;o.itachiPhaseSlowBase=base;o.itachiPhaseSlowUntil=t+90;fx('seal',o.x,o.y-90,24);fx('explosion',o.x,o.y-90,p.type==='yasaka-triad'?42:30);if(typeof window.floatText==='function')window.floatText(o.x,o.y-150,p.type==='yasaka-triad'?'YASAKA TRIAD · SLOWED':'CHAKRA SLOWED','#ffd0bc',11,30);}
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
  if((f.itachiPhaseSilenceUntil||0)>t&&f.itachiPhaseSilenceUntil){/* active seal status */}
  else if(f.itachiPhaseSilenceUntil){f.itachiPhaseSilenceUntil=0;}
 }
}
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
if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);const t=now();if(t%6===0){lastTick=t;updatePanel(true);}else updatePanel(false);return r;};
if(typeof window.resetFighter==='function'){
 const oldReset=window.resetFighter;
 window.resetFighter=function(f){if(f){f.itachiPhaseSkillKey='';f.itachiPhaseSkillCooldowns={};f.itachiPhaseGuardUntil=0;f.itachiPhaseSilenceUntil=0;f.itachiPhaseSlowUntil=0;delete f.itachiPhaseSlowBase;}return oldReset.apply(this,arguments);};
}
window.JFF_SUSANOO_PHASE_SKILLS={ready:true,version:5,skills,phase3Unchanged:true,activate:(f,slot)=>{const id=idFor(f,slot);return startSkill(f,id);}};
console.info('[Susanoo] Phase 1/2 abilities rebuilt; P2 uses Numpad + and Numpad /. Numpad - remains available to passive.');
})();