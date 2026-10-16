/* ITACHI SUSANOO PHASE SKILLS v1
   Phase 1/2 combat kits for regular and Edo Itachi.
   Phase 3 inputs and attacks are deliberately left untouched.
*/
(function(){
'use strict';
if(window.__JFF_SUSANOO_PHASE_SKILLS_V1__)return;
const Q=window.JFF_ITACHI_REBOOT;
if(!Q)return;
window.__JFF_SUSANOO_PHASE_SKILLS_V1__=true;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fighters=()=>typeof G!=='undefined'&&Array.isArray(G.fighters)?G.fighters:[];
const alive=f=>!!(f&&f.hp>0&&f.state!=='DEFEAT'&&f.state!=='VICTORY');
const now=()=>Number(Q.tick||(typeof G!=='undefined'&&G.frame)||0);
const fx=(kind,x,y,d,data)=>{if(typeof window.JFF_OUTSIDER_FX==='function')window.JFF_OUTSIDER_FX(kind,x,y,d||20,data||{});};
const impact=(power,color)=>{if(typeof window.flash==='function')window.flash(power||.12,color||'#d7434d');if(typeof window.shake==='function')window.shake(Math.max(2,Math.round((power||.12)*24)));if(typeof window.camPunch==='function')window.camPunch((power||.12)*.2);};
const projectileList=[];
const burns=[];
const skillNames={
 life_p1_claw:{name:'Flame Claw Strike',cd:330,hp:3,visual:'sus_m1'},
 life_p1_fist:{name:'Flaming Fist Crush',cd:390,hp:4,visual:'sus_x'},
 life_p2_yata:{name:'Yata Mirror Reflection',cd:540,hp:5,visual:'sus_z'},
 life_p2_totsuka:{name:'Totsuka Blade Slash',cd:660,hp:7,visual:'sus_x'},
 edo_p1_yasaka:{name:'Yasaka no Magatama',cd:330,hp:0,visual:'sus_x'},
 edo_p1_grasp:{name:'Edo Bone Grasp',cd:420,hp:0,visual:'sus_m1'},
 edo_p2_amaterasu:{name:'Amaterasu-Infused Totsuka',cd:660,hp:0,visual:'sus_x'},
 edo_p2_counter:{name:'Edo Yata Counter',cd:540,hp:0,visual:'sus_z'}
};
function phaseOf(f){return clamp(Math.round(Number(f&&f.itachiSusanooPhase)||3),1,3);}
function idFor(f,slot){
 const p=phaseOf(f),edo=!!f.itachiEdo;
 if(p===1)return edo?(slot===1?'edo_p1_yasaka':'edo_p1_grasp'):(slot===1?'life_p1_claw':'life_p1_fist');
 if(p===2)return edo?(slot===1?'edo_p2_amaterasu':'edo_p2_counter'):(slot===1?'life_p2_yata':'life_p2_totsuka');
 return null;
}
function labelFor(f,id){
 const keys=f&&f.isP2?'NUM 2':'2',keys2=f&&f.isP2?'NUM 3':'3';
 const one=skillNames[idFor(f,1)],two=skillNames[idFor(f,2)];
 return '<div class="jff-psk-owner">'+(f.isP2?'P2':'P1')+' · '+(f.itachiEdo?'EDO ITACHI':'ITACHI')+' · PHASE '+phaseOf(f)+'</div>'+
 '<div class="jff-psk-grid"><div class="jff-psk-card"><span class="jff-psk-key">'+keys+'</span><b>'+one.name+'</b><small>'+cooldownText(f,idFor(f,1))+'</small></div>'+
 '<div class="jff-psk-card"><span class="jff-psk-key">'+keys2+'</span><b>'+two.name+'</b><small>'+cooldownText(f,idFor(f,2))+'</small></div></div>';
}
function cooldownText(f,id){const until=f.itachiPhaseSkillCooldowns&&f.itachiPhaseSkillCooldowns[id]||0;return until>now()?'COOLDOWN '+((until-now())/60).toFixed(1)+'s':'READY';}
let skillPanel=null,lastPanelTick=-999,lastPanelSignature='';
function updatePanel(force){
 if(typeof document==='undefined')return;
 if(!skillPanel){
  skillPanel=document.getElementById('jffSusanooPhaseSkillPanel');
  if(!skillPanel){
   skillPanel=document.createElement('div');skillPanel.id='jffSusanooPhaseSkillPanel';
   skillPanel.setAttribute('aria-live','polite');
   const st=document.createElement('style');
   st.textContent='#jffSusanooPhaseSkillPanel{position:absolute;right:18px;top:318px;width:354px;max-width:calc(100% - 36px);box-sizing:border-box;z-index:9;pointer-events:none;color:#f8e9ee;font:11px/1.35 Arial,sans-serif;background:linear-gradient(140deg,rgba(24,8,19,.95),rgba(9,8,16,.94));border:1px solid rgba(229,102,124,.72);border-radius:8px;padding:9px;box-shadow:0 6px 24px rgba(0,0,0,.3)}#jffSusanooPhaseSkillPanel .jff-psk-owner{font-weight:800;letter-spacing:1px;color:#ffc4cf;margin-bottom:7px}#jffSusanooPhaseSkillPanel .jff-psk-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}#jffSusanooPhaseSkillPanel .jff-psk-card{position:relative;min-width:0;border:1px solid rgba(244,151,164,.27);background:rgba(255,255,255,.045);border-radius:5px;padding:7px 6px 6px 34px;min-height:39px;box-sizing:border-box}#jffSusanooPhaseSkillPanel .jff-psk-key{position:absolute;left:6px;top:7px;border:1px solid rgba(255,197,208,.8);border-radius:4px;padding:2px 4px;color:#fff3f5;font-weight:800}#jffSusanooPhaseSkillPanel b{display:block;font-size:10px;line-height:1.25;margin-bottom:5px}#jffSusanooPhaseSkillPanel small{display:block;color:#ffb5c1;font-size:9px;letter-spacing:.4px}';
   document.head.appendChild(st);document.getElementById('wrap')?.appendChild(skillPanel);
  }
 }
 const hidden=typeof G==='undefined'||G.mode==='menu'||G.paused||!!Q.cinema||!!Q.edoSusanooCutscene;
 const owners=hidden?[]:fighters().filter(f=>alive(f)&&f.id==='itachi'&&!f.ai&&f.itachiSusanooActive&&phaseOf(f)<3).sort((a,b)=>(a.isP2?1:0)-(b.isP2?1:0));
 const signature=owners.map(f=>(f.isP2?'2':'1')+':'+(f.itachiEdo?'e':'n')+':'+phaseOf(f)).join('|');
 if(signature!==lastPanelSignature){lastPanelSignature=signature;force=true;}
 skillPanel.style.display=owners.length?'block':'none';
 skillPanel.setAttribute('aria-hidden',owners.length?'false':'true');
 if(force)skillPanel.innerHTML=owners.map(f=>labelFor(f)).join('<div style="height:7px"></div>');
}
function findPlayer(code){
 const fs=fighters();
 const f=(code==='Numpad2'||code==='Numpad3')?fs[1]:fs[0];
 return f&&f.id==='itachi'&&!f.ai&&f.itachiSusanooActive&&alive(f)?f:null;
}
function canCast(f,id){
 if(!id||!f||!alive(f)||!f.itachiSusanooActive||phaseOf(f)>=3||Q.cinema||Q.edoSusanooCutscene)return false;
 if(f.move||!['IDLE','WALK','LAND','ATTACK'].includes(f.state))return false;
 const until=f.itachiPhaseSkillCooldowns&&f.itachiPhaseSkillCooldowns[id]||0;
 if(until>now()){if(typeof window.floatText==='function')window.floatText(f.x,f.y-200,'COOLDOWN · '+((until-now())/60).toFixed(1)+'s','#ffc2ce',12,25);return false;}
 const hpCost=skillNames[id].hp||0;
 if(hpCost&&f.hp<=hpCost){if(typeof window.floatText==='function')window.floatText(f.x,f.y-180,'TOO WEAK TO CAST','#ff9baf',12,26);return false;}
 return true;
}
function startSkill(f,id){
 if(!canCast(f,id))return false;
 const def=skillNames[id],o=f.opp,d=f.facing||1;
 if(alive(o)&&Math.abs(o.y-f.y)<190)f.facing=o.x>=f.x?1:-1;
 if(def.hp)f.hp=Math.max(1,f.hp-def.hp);
 f.itachiPhaseSkillCooldowns=f.itachiPhaseSkillCooldowns||{};
 f.itachiPhaseSkillCooldowns[id]=now()+def.cd;
 f.itachiPhaseSkillKey=id;f.itachiPhaseSkillUsed=false;f.itachiPhaseSkillMarks={};f.itachiPhaseParryTriggered=false;
 f.moveKey=def.visual;f.moveFrame=0;f.state='ATTACK';f.stateFrame=0;f.vx*=.16;
 f.itachiSusanooAction=def.visual;f.itachiPoseKey=def.visual;
 f.move={name:def.name,kind:'special',startup:12,active:24,recovery:20,damage:0,hitbox:null,cost:0,cd:0};
 fx(f.itachiEdo?'crows':'fire',f.x-d*24,f.y-100,15);
 if(typeof SFX!=='undefined'&&SFX.ui)SFX.ui();
 return true;
}
function finishSkill(f){
 f.itachiPhaseSkillKey='';f.itachiPhaseSkillUsed=false;f.itachiPhaseCounterUntil=0;
 f.move=null;f.moveKey=null;f.moveFrame=0;f.state=alive(f)?'IDLE':'DEFEAT';f.stateFrame=0;
 f.itachiPoseKey='';f.itachiSusanooAction='';f.vx*=.2;
}
function hitTarget(f,damage,range,opts){
 const o=f&&f.opp;if(!alive(f)||!alive(o))return false;
 const d=f.facing||1,dx=(o.x-f.x)*d;
 if(dx< -36||dx>range||Math.abs(o.y-f.y)>(opts&&opts.vertical||175))return false;
 const cfg=opts||{};
 const mv={damage:damage,hitstun:cfg.hitstun||22,blockstun:cfg.blockstun===undefined?10:cfg.blockstun,kbx:cfg.kbx===undefined?d*6:cfg.kbx,kby:cfg.kby===undefined?-2:cfg.kby,hitstop:cfg.hitstop||7,meter:cfg.meter===undefined?6:cfg.meter,armorBreak:!!cfg.armorBreak,kind:cfg.kind||'special',type:cfg.type||'special',susanoo:true};
 const result=typeof window.resolveHit==='function'?window.resolveHit(f,o,mv,f.x+d*Math.min(range,Math.max(80,dx)),f.y-105):'whiff';
 if(result&&result!=='whiff'){if(cfg.fx!==false)fx(cfg.fx||'slash',o.x,o.y-100,cfg.fxDuration||22);return true;}
 return false;
}
function addBurn(target,kind){
 if(!alive(target))return;
 burns.push({target:target,kind:kind,next:now()+(kind==='amaterasu'?30:60),remaining:kind==='amaterasu'?6:3});
 fx(kind==='amaterasu'?'amaterasu':'fire',target.x,target.y-92,34);
}
function damageOverTime(b){
 const o=b.target;if(!alive(o))return;
 const amount=b.kind==='amaterasu'?5:Math.max(1,Math.ceil((o.maxHp||200)*.02));
 o.hp=Math.max(0,o.hp-amount);o.hitFlash=4;
 fx(b.kind==='amaterasu'?'amaterasu':'fire',o.x,o.y-90,10);
 if(typeof window.floatText==='function')window.floatText(o.x,o.y-155,'-'+amount+(b.kind==='amaterasu'?' AMATERASU':' BURN'),b.kind==='amaterasu'?'#c5a4ff':'#ff9c64',11,26);
 if(o.hp<=0){o.hp=0;o.state='DEFEAT';o.stateFrame=0;}
}
function updateSkill(f){
 const id=f.itachiPhaseSkillKey;
 if(!id||!f.move){finishSkill(f);return;}
 const n=(f.moveFrame||0)+1,o=f.opp,d=f.facing||1,t=now();
 f.moveFrame=n;f.itachiPoseKey=f.moveKey;f.itachiSusanooAction=f.moveKey;
 if(id==='life_p1_claw'){
  if(n===5){fx('fire',f.x+d*95,f.y-220,22);fx('slash',f.x+d*155,f.y-205,17);}
  if(n===14&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;if(hitTarget(f,19,350,{forward:210,hitstun:24,kbx:d*8,kby:-3,armorBreak:false,fx:'slash',fxDuration:28})){addBurn(o,'burn');fx('fire',o.x,o.y-40,22);fx('explosion',o.x,o.y-20,18);}}
  if(n>=42)finishSkill(f);
 }else if(id==='life_p1_fist'){
  if(n===1){fx('fire',f.x+d*80,f.y-145,20);}
  if(n===12){fx('shock',f.x+d*155,f.y-85,23);fx('fire',f.x+d*178,f.y-120,24);impact(.12,'#ff9a59');}
  if(n===16&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;const landed=hitTarget(f,27,470,{hitstun:30,blockstun:0,kbx:d*17,kby:-4,hitstop:10,armorBreak:true,fx:'explosion',fxDuration:30});if(landed){fx('shock',o.x,o.y-70,25);impact(.18,'#ff9c5e');}}
  if(n>=48)finishSkill(f);
 }else if(id==='life_p2_yata'){
  if(n===1){f.itachiPhaseYataUntil=t+90;f.itachiPhaseYataLast=-999;fx('reflect',f.x+d*110,f.y-150,32);fx('shock',f.x+d*120,f.y-104,24);impact(.07,'#ffcf81');}
  if(n===90){f.itachiPhaseYataUntil=0;fx('explosion',f.x+d*110,f.y-130,19);}
  if(n>=96)finishSkill(f);
 }else if(id==='life_p2_totsuka'){
  if(n===7){fx('magatama',f.x+d*110,f.y-190,18);}
  if(n===21){fx('slash',f.x+d*165,f.y-185,32);fx('fire',f.x+d*220,f.y-105,26);impact(.15,'#ff945c');}
  if(n===25&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;if(hitTarget(f,36,540,{hitstun:34,blockstun:0,kbx:d*13,kby:-3,hitstop:11,armorBreak:true,fx:'slash',fxDuration:34})){o.itachiPhaseSilenceUntil=t+120;fx('seal',o.x,o.y-120,42);if(typeof window.floatText==='function')window.floatText(o.x,o.y-188,'TECHNIQUES SEALED · 2s','#ffd4b9',12,48);}}
  if(n>=68)finishSkill(f);
 }else if(id==='edo_p1_yasaka'){
  if(n===6){fx('magatama',f.x+d*62,f.y-190,23);fx('magatama',f.x+d*73,f.y-208,23);fx('magatama',f.x+d*49,f.y-171,23);}
  if(n===10&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;projectileList.push({owner:f,target:o,x:f.x+d*78,y:f.y-172,vx:d*13.8,vy:-.15,age:0,maxAge:74,done:false});}
  if(n>=42)finishSkill(f);
 }else if(id==='edo_p1_grasp'){
  if(n===9){fx('shock',o&&o.x||f.x+d*150,f.y-12,20);fx('crows',o&&o.x||f.x+d*150,f.y-30,18);}
  if(n===23&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;if(hitTarget(f,17,390,{hitstun:42,blockstun:0,kbx:d*2,kby:-1,armorBreak:true,fx:'explosion',fxDuration:28})){o.itachiPhaseRootUntil=t+90;o.itachiPhaseRootX=o.x;o.itachiPhaseRootY=o.y;o.vx=0;o.vy=0;fx('seal',o.x,o.y-95,28);fx('crows',o.x,o.y-35,30);if(typeof window.floatText==='function')window.floatText(o.x,o.y-160,'EDO BONE GRASP · ROOT','#d4c8df',12,44);}}
  if(n>=54)finishSkill(f);
 }else if(id==='edo_p2_amaterasu'){
  if(n===7){fx('amaterasu',f.x+d*110,f.y-180,24);fx('crows',f.x-d*25,f.y-130,14);}
  if(n===23){fx('slash',f.x+d*180,f.y-182,30);fx('amaterasu',f.x+d*225,f.y-122,32);impact(.17,'#aa6dce');}
  if(n===27&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;if(hitTarget(f,34,560,{hitstun:32,blockstun:0,kbx:d*14,kby:-4,hitstop:12,armorBreak:true,fx:'amaterasu',fxDuration:36})){addBurn(o,'amaterasu');fx('explosion',o.x,o.y-80,25);}}
  if(n>=72)finishSkill(f);
 }else if(id==='edo_p2_counter'){
  if(n===1){f.itachiPhaseCounterUntil=t+12;f.itachiPhaseParryTriggered=false;fx('reflect',f.x+d*125,f.y-150,22);fx('crows',f.x+d*75,f.y-70,16);impact(.05,'#caa6f2');}
  if(f.itachiPhaseParryTriggered&&n===3){const enemy=f.opp;if(alive(enemy)){const face=f.facing||1;f.x=clamp(enemy.x+face*72,window.WALL||90,(window.ARENA_W||3200)-(window.WALL||90));f.facing=enemy.x>=f.x?1:-1;f.vx=0;f.vy=0;fx('crows',enemy.x,enemy.y-90,32);fx('reflect',f.x,f.y-120,24);fx('slash',enemy.x,enemy.y-92,30);impact(.2,'#c79aff');}}
  if(n===12)f.itachiPhaseCounterUntil=0;
  if(n>=50)finishSkill(f);
 }
}
const oldUpdate=window.updateMove;
if(typeof oldUpdate==='function')window.updateMove=function(f){
 if(f&&f.itachiPhaseSkillKey){const k=f.itachiPhaseSkillKey;if(!f.move||!skillNames[k]||f.moveKey!==skillNames[k].visual){f.itachiPhaseSkillKey='';f.itachiPhaseYataUntil=0;f.itachiPhaseCounterUntil=0;return oldUpdate.apply(this,arguments);}updateSkill(f);return;}
 return oldUpdate.apply(this,arguments);
};
const oldResolve=window.resolveHit;
function frontFacing(def,att){return (def.facing||1)===(Math.sign(att.x-def.x)||1);}
if(typeof oldResolve==='function')window.resolveHit=function(attacker,defender,mv,hx,hy){
 const t=now();
 if(defender&&alive(defender)&&alive(attacker)&&attacker!==defender&&mv){
  if(defender.itachiPhaseSkillKey==='life_p2_yata'&&(defender.itachiPhaseYataUntil||0)>t&&frontFacing(defender,attacker)){
   const dmg=Math.max(1,Math.round(Number(mv.damage)||1)*.5);
   oldResolve.call(this,defender,attacker,{damage:dmg,hitstun:25,blockstun:0,kbx:(defender.facing||1)*7,kby:-2,hitstop:8,meter:5,armorBreak:false,kind:'special',type:'fire'},defender.x+(defender.facing||1)*70,defender.y-100);
   fx('reflect',defender.x+(defender.facing||1)*62,defender.y-110,24);fx('fire',attacker.x,attacker.y-88,16);
   return 'parry';
  }
  if(defender.itachiPhaseSkillKey==='edo_p2_counter'&&(defender.itachiPhaseCounterUntil||0)>=t&&!defender.itachiPhaseParryTriggered&&frontFacing(defender,attacker)){
   defender.itachiPhaseParryTriggered=true;defender.itachiPhaseCounterUntil=0;
   oldResolve.call(this,defender,attacker,{damage:36,hitstun:60,blockstun:0,kbx:(defender.facing||1)*12,kby:-5,hitstop:12,meter:12,armorBreak:true,kind:'special',type:'special'},defender.x+(defender.facing||1)*82,defender.y-98);
   fx('crows',defender.x,defender.y-94,30);fx('slash',attacker.x,attacker.y-92,34);
   if(typeof window.floatText==='function')window.floatText(attacker.x,attacker.y-172,'YATA COUNTER · CRITICAL','#e2caff',14,44);
   impact(.2,'#cba0ff');return 'parry';
  }
 }
 return oldResolve.apply(this,arguments);
};
const oldStart=window.startMove;
if(typeof oldStart==='function')window.startMove=function(f,key){
 if(f&&alive(f)&&(f.itachiPhaseSilenceUntil||0)>now()&&['s1','s2','s3','s4','s5','def','ult'].includes(key)){
  if(typeof window.floatText==='function')window.floatText(f.x,f.y-170,'SEALED · '+Math.ceil((f.itachiPhaseSilenceUntil-now())/60)+'s','#ffd0bc',12,24);
  return false;
 }
 return oldStart.apply(this,arguments);
};
function updateProjectiles(){
 const t=now();
 for(let i=projectileList.length-1;i>=0;i--){
  const p=projectileList[i],o=p.target;
  p.age++;p.x+=p.vx;p.y+=p.vy+Math.sin(p.age*.27)*1.6;
  if(p.age%3===0){
   for(const dy of [-12,0,12])fx('magatama',p.x,p.y+dy,8,{spin:p.age*.2,ash:!!(p.owner&&p.owner.itachiEdo)});
   if(p.age%6===0)fx('crows',p.x-p.vx*1.5,p.y+10,8);
  }
  const collided=alive(o)&&Math.abs(o.x-p.x)<68&&Math.abs((o.y-92)-p.y)<115;
  const missed=p.age>=p.maxAge||p.x<(window.WALL||90)||p.x>(window.ARENA_W||3200)-(window.WALL||90);
  if(collided||missed){
   const ix=p.x,iy=p.y;
   fx('explosion',ix,iy,31);fx('shock',ix,iy+30,27);impact(.1,'#a65f91');
   if(alive(o)&&Math.abs(o.x-ix)<155&&Math.abs(o.y-iy)<190){
    const result=window.resolveHit(p.owner,o,{damage:22,hitstun:25,blockstun:11,kbx:(p.owner&&p.owner.facing||1)*8,kby:-3,hitstop:8,meter:7,armorBreak:false,kind:'special',type:'chakra'},ix,iy);
    if(result&&result!=='whiff'){
     const base=Number.isFinite(o.walk)?o.walk:3.5;o.itachiPhaseSlowBase=base;o.itachiPhaseSlowUntil=t+120;
     fx('seal',o.x,o.y-90,20);if(typeof window.floatText==='function')window.floatText(o.x,o.y-150,'SLOWED · 30%','#ddc3e7',12,36);
    }
   }
   projectileList.splice(i,1);
  }
 }
}
function updateStatuses(){
 const t=now();
 for(let i=burns.length-1;i>=0;i--){
  const b=burns[i];if(!alive(b.target)){burns.splice(i,1);continue;}
  if(t>=b.next){
   damageOverTime(b);b.remaining--;b.next+=b.kind==='amaterasu'?30:60;
   if(b.remaining<=0||!alive(b.target))burns.splice(i,1);
  }
 }
 for(const f of fighters()){
  if(!f)continue;
  if((f.itachiPhaseSlowUntil||0)>t&&Number.isFinite(f.itachiPhaseSlowBase))f.walk=f.itachiPhaseSlowBase*.7;
  else if(f.itachiPhaseSlowBase!==undefined){f.walk=f.itachiPhaseSlowBase;delete f.itachiPhaseSlowBase;f.itachiPhaseSlowUntil=0;}
  if((f.itachiPhaseRootUntil||0)>t){if(Number.isFinite(f.itachiPhaseRootX))f.x=f.itachiPhaseRootX;if(Number.isFinite(f.itachiPhaseRootY))f.y=f.itachiPhaseRootY;f.vx=0;f.vy=0;}else if(f.itachiPhaseRootX!==undefined){delete f.itachiPhaseRootX;delete f.itachiPhaseRootY;}
  if((f.itachiPhaseSilenceUntil||0)>0&&(f.itachiPhaseSilenceUntil||0)<=t)f.itachiPhaseSilenceUntil=0;
 }
}
const oldStep=window.step;
if(typeof oldStep==='function')window.step=function(){const r=oldStep.apply(this,arguments);if(typeof G!=='undefined'&&G.mode!=='menu'&&!G.paused){updateProjectiles();updateStatuses();}return r;};
function handleKey(e){
 if(typeof G==='undefined'||G.mode==='menu'||G.paused||Q.cinema||Q.edoSusanooCutscene)return;
 if(e.repeat)return;
 if(e.code!=='Digit2'&&e.code!=='Digit3'&&e.code!=='Numpad2'&&e.code!=='Numpad3')return;
 const f=findPlayer(e.code);if(!f||phaseOf(f)>=3)return;
 const slot=(e.code==='Digit2'||e.code==='Numpad2')?1:2,id=idFor(f,slot);
 if(!id)return;
 e.preventDefault();e.stopImmediatePropagation();
 startSkill(f,id);
}
addEventListener('keydown',handleKey,true);
const oldRender=window.render;
if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);const t=now();if(t%6===0||t!==lastPanelTick){lastPanelTick=t;updatePanel(true);}else updatePanel(false);return r;};
if(typeof window.resetFighter==='function'){
 const oldReset=window.resetFighter;
 window.resetFighter=function(f){if(f){f.itachiPhaseSkillKey='';f.itachiPhaseSkillCooldowns={};f.itachiPhaseYataUntil=0;f.itachiPhaseCounterUntil=0;f.itachiPhaseRootUntil=0;delete f.itachiPhaseRootX;delete f.itachiPhaseRootY;f.itachiPhaseSilenceUntil=0;f.itachiPhaseSlowUntil=0;}return oldReset.apply(this,arguments);};
}
window.JFF_SUSANOO_PHASE_SKILLS={ready:true,version:1,skills:skillNames,phase3Unchanged:true};
console.info('[Itachi Susanoo] Phase 1/2 skills enabled for regular + Edo; phase 3 moveset untouched.');
})();