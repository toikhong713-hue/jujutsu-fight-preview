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
const impact=(power,color,hitstop)=>{if(typeof window.flash==='function')window.flash(power||.12,color||'#d7434d');if(typeof window.shake==='function')window.shake(Math.max(2,Math.round((power||.12)*30)));if(typeof window.camPunch==='function')window.camPunch((power||.12)*.25);if(hitstop&&typeof G!=='undefined')G.hitstop=Math.max(G.hitstop||0,hitstop);};
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
 const keys=f&&f.isP2?'NUM −':'Z',keys2=f&&f.isP2?'NUM /':'X';
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
 const f=(code==='NumpadSubtract'||code==='NumpadDivide')?fs[1]:fs[0];
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
 if(id==='edo_p2_counter'){f.itachiPhaseCounterUntil=now()+11;f.itachiPhaseParryTarget=null;f.itachiPhaseCounterTeleported=false;f.itachiPhaseCounterHit=false;}
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
 const mv={damage:damage,hitstun:cfg.hitstun||22,blockstun:cfg.blockstun===undefined?10:cfg.blockstun,kbx:cfg.kbx===undefined?d*6:cfg.kbx,kby:cfg.kby===undefined?-2:cfg.kby,hitstop:cfg.hitstop||7,meter:cfg.meter===undefined?6:cfg.meter,armorBreak:!!cfg.armorBreak,kind:cfg.kind||'special',type:cfg.type||'special',susanoo:true,trueDamage:!!cfg.trueDamage};
 const result=typeof window.resolveHit==='function'?window.resolveHit(f,o,mv,f.x+d*Math.min(range,Math.max(80,dx)),f.y-105):'whiff';
 if(result==='hit'){if(cfg.fx!==false)fx(cfg.fx||'slash',o.x,o.y-100,cfg.fxDuration||22);return true;}
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
 const id=f.itachiPhaseSkillKey;if(!id||!f.move){finishSkill(f);return;}
 const n=(f.moveFrame||0)+1,o=f.opp,d=f.facing||1,t=now();f.moveFrame=n;f.itachiPoseKey=f.moveKey;f.itachiSusanooAction=f.moveKey;
 if(id==='life_p1_claw'){
  if(n===1){f.vx*=.2;fx('fire',f.x+d*80,f.y-180,26);}
  if(n===8){fx('fire',f.x+d*145,f.y-242,36);fx('magatama',f.x+d*125,f.y-212,20);impact(.08,'#ff7136',2);}
  if(n===13){fx('slash',f.x+d*180,f.y-178,36);fx('slash',f.x+d*205,f.y-120,31);fx('fire',f.x+d*200,f.y-75,38);}
  if(n===20&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;const ok=hitTarget(f,25,390,{hitstun:27,kbx:d*10,kby:-3,hitstop:10,fx:false});if(ok){addBurn(o,'burn');fx('explosion',o.x,o.y-76,34);fx('shock',o.x,o.y-25,42);fx('fire',o.x,o.y-44,52);for(let i=0;i<3;i++){fx('slash',o.x-d*18+i*18,o.y-22+i*3,82);fx('fire',o.x-d*22+i*22,o.y-5,76);}if(typeof window.floatText==='function')window.floatText(o.x,o.y-178,'FLAME CLAW · BURN','#ffb16b',15,42);impact(.28,'#ff6a2e',12);}else{fx('slash',f.x+d*205,f.y-105,22);impact(.1,'#ff7136',3);}}
  if(n>=66)finishSkill(f);
 }else if(id==='life_p1_fist'){
  if(n===1){f.vx*=.1;fx('fire',f.x+d*70,f.y-140,22);}
  if(n===9){fx('fire',f.x+d*105,f.y-154,36);fx('magatama',f.x+d*97,f.y-150,25);}
  if(n===16){fx('shock',f.x+d*105,f.y-115,28);fx('fire',f.x+d*115,f.y-134,32);impact(.1,'#ffb45b',2);}
  if(n===21){f.x=clamp(f.x+d*26,window.WALL||90,(window.ARENA_W||3200)-(window.WALL||90));f.vx=d*2.6;fx('slash',f.x+d*150,f.y-120,22);}
  if(n===30&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;const ok=hitTarget(f,34,500,{hitstun:37,blockstun:0,kbx:d*19,kby:-5,hitstop:14,armorBreak:true,fx:false});fx('explosion',f.x+d*255,f.y-105,42);fx('shock',f.x+d*230,f.y-60,54);fx('fire',f.x+d*255,f.y-124,42);if(ok){fx('explosion',o.x,o.y-80,42);fx('shock',o.x,o.y-35,54);fx('fire',o.x,o.y-130,37);impact(.36,'#ff9a4d',16);if(typeof window.floatText==='function')window.floatText(o.x,o.y-180,'GUARD BREAK','#ffd08b',18,42);}else impact(.18,'#ff9a4d',7);}
  if(n>=78){f.vx=0;finishSkill(f);}
 }else if(id==='life_p2_yata'){
  if(n===1){f.itachiPhaseYataUntil=0;f.itachiPhaseYataLast=-999;fx('reflect',f.x+d*145,f.y-175,34);fx('shock',f.x+d*130,f.y-100,29);impact(.08,'#ffcf81',2);}
  if(n===12){f.itachiPhaseYataUntil=t+64;fx('seal',f.x+d*142,f.y-170,38);fx('reflect',f.x+d*142,f.y-170,44);impact(.1,'#ffe0a0',3);}
  if(n===73){f.itachiPhaseYataUntil=0;fx('explosion',f.x+d*150,f.y-135,30);fx('shock',f.x+d*155,f.y-70,34);impact(.12,'#ffcf81',4);}
  if(n>=108){f.itachiPhaseYataUntil=0;finishSkill(f);}
 }else if(id==='life_p2_totsuka'){
  if(n===1){f.vx*=.1;fx('magatama',f.x+d*80,f.y-150,22);}
  if(n===12){fx('magatama',f.x+d*125,f.y-190,26);fx('fire',f.x+d*145,f.y-195,28);}
  if(n===23){fx('slash',f.x+d*180,f.y-185,46);fx('fire',f.x+d*205,f.y-120,48);impact(.12,'#ff945c',4);}
  if(n===31){fx('slash',f.x+d*210,f.y-120,47);fx('fire',f.x+d*240,f.y-85,45);}
  if(n===36&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;const ok=hitTarget(f,39,600,{hitstun:38,blockstun:0,kbx:d*15,kby:-4,hitstop:15,armorBreak:true,fx:false});if(ok){o.itachiPhaseSilenceUntil=t+120;fx('seal',o.x,o.y-120,46);fx('explosion',o.x,o.y-86,41);fx('shock',o.x,o.y-40,46);fx('slash',o.x,o.y-110,50);impact(.32,'#ff9a58',16);if(typeof window.floatText==='function')window.floatText(o.x,o.y-188,'TOTSUKA SEAL · 2s','#ffd4b9',15,46);}else impact(.15,'#ff945c',6);}
  if(n>=120)finishSkill(f);
 }else if(id==='edo_p1_yasaka'){
  if(n===1){f.vx*=.12;fx('crows',f.x-d*18,f.y-105,23);fx('magatama',f.x+d*70,f.y-175,20);}
  if(n===9){fx('magatama',f.x+d*100,f.y-208,28);fx('magatama',f.x+d*125,f.y-183,28);fx('magatama',f.x+d*80,f.y-155,28);fx('shock',f.x+d*95,f.y-155,20);}
  if(n===18&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;projectileList.push({owner:f,target:o,x:f.x+d*105,y:f.y-174,vx:d*18.5,vy:-.12,age:0,maxAge:74,done:false});fx('crows',f.x+d*95,f.y-170,28);fx('magatama',f.x+d*100,f.y-175,35);impact(.09,'#bd83ee',3);}
  if(n>=72)finishSkill(f);
 }else if(id==='edo_p1_grasp'){
  if(n===1){f.vx*=.1;f.itachiPoseKey='edo-bone-hand-seals';fx('seal',f.x,f.y-155,23);fx('crows',f.x-d*14,f.y-90,15);}
  if(n===12){fx('shock',o&&o.x||f.x+d*180,f.y-10,30);fx('seal',o&&o.x||f.x+d*180,f.y-24,32);impact(.08,'#9b58ae',2);}
  if(n===19){fx('explosion',o&&o.x||f.x+d*180,f.y-13,29);fx('crows',o&&o.x||f.x+d*180,f.y-37,36);fx('shock',o&&o.x||f.x+d*180,f.y-70,26);}
  if(n===30&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;if(hitTarget(f,24,470,{hitstun:48,blockstun:0,kbx:d*1,kby:-5,hitstop:12,armorBreak:true,fx:false})){o.itachiPhaseRootUntil=t+90;o.itachiPhaseRootX=o.x;o.itachiPhaseRootY=o.y;o.vx=0;o.vy=-1.2;fx('seal',o.x,o.y-96,42);fx('crows',o.x,o.y-52,52);fx('explosion',o.x,o.y-24,36);fx('shock',o.x,o.y-70,40);impact(.24,'#b36fd2',12);if(typeof window.floatText==='function')window.floatText(o.x,o.y-170,'EDO BONE GRASP · ROOT','#e0c9ed',15,48);}else{fx('shock',f.x+d*180,f.y-25,20);impact(.08,'#9b58ae',2);}}
  if(n>=84)finishSkill(f);
 }else if(id==='edo_p2_amaterasu'){
  if(n===1){f.vx*=.08;fx('crows',f.x-d*22,f.y-110,22);fx('amaterasu',f.x+d*95,f.y-195,26);}
  if(n===14){fx('amaterasu',f.x+d*122,f.y-240,40);fx('seal',f.x+d*110,f.y-190,28);impact(.08,'#9d65ce',3);}
  if(n===30){fx('amaterasu',f.x+d*170,f.y-185,45);fx('slash',f.x+d*160,f.y-180,40);}
  if(n===40&&!f.itachiPhaseSkillUsed){f.itachiPhaseSkillUsed=true;const ok=hitTarget(f,42,610,{hitstun:42,blockstun:0,kbx:d*16,kby:-7,hitstop:16,armorBreak:true,trueDamage:true,kind:'fire',fx:false});fx('amaterasu',f.x+d*230,f.y-12,100);fx('slash',f.x+d*210,f.y-22,104);fx('explosion',f.x+d*225,f.y-70,43);if(ok){addBurn(o,'amaterasu');fx('amaterasu',o.x,o.y-70,72);fx('crows',o.x,o.y-45,38);fx('shock',o.x,o.y-24,43);impact(.34,'#9c68d4',17);if(typeof window.floatText==='function')window.floatText(o.x,o.y-185,'BLACK FLAME · TRUE DAMAGE','#d6b9ff',15,48);}else impact(.15,'#9c68d4',6);}
  if(n>=132)finishSkill(f);
 }else if(id==='edo_p2_counter'){
  if(n===1){f.itachiPhaseParryTriggered=false;f.itachiPhaseParryTarget=null;f.itachiPhaseCounterTeleported=false;f.itachiPhaseCounterHit=false;fx('reflect',f.x+d*135,f.y-160,30);fx('crows',f.x+d*80,f.y-70,24);impact(.06,'#caa6f2',2);}
  if(f.itachiPhaseParryTriggered&&n===3&&!f.itachiPhaseCounterTeleported){const enemy=f.itachiPhaseParryTarget||f.opp;if(alive(enemy)){f.itachiPhaseCounterTeleported=true;const face=f.facing||1;fx('crows',f.x,f.y-92,38);fx('reflect',f.x,f.y-115,27);f.x=clamp(enemy.x+face*78,window.WALL||90,(window.ARENA_W||3200)-(window.WALL||90));f.y=enemy.y;f.facing=enemy.x>=f.x?1:-1;f.vx=0;f.vy=0;fx('crows',f.x,f.y-90,46);fx('seal',f.x,f.y-115,25);fx('slash',f.x,f.y-100,25);impact(.14,'#b989e8',8);}}
  if(f.itachiPhaseParryTriggered&&n===15&&!f.itachiPhaseCounterHit){f.itachiPhaseCounterHit=true;const target=f.itachiPhaseParryTarget||f.opp;const ok=hitTarget(f,43,260,{hitstun:58,blockstun:0,kbx:(f.facing||1)*15,kby:-6,hitstop:16,armorBreak:true,kind:'special',fx:false});if(ok){fx('slash',target.x,target.y-105,43);fx('shock',target.x,target.y-45,39);fx('crows',target.x,target.y-72,44);impact(.38,'#bb8cf2',18);if(typeof window.floatText==='function')window.floatText(target.x,target.y-185,'YATA COUNTER · CRITICAL','#e2caff',16,46);}else impact(.1,'#b989e8',5);}
  if(n===14&&!f.itachiPhaseParryTriggered)f.itachiPhaseCounterUntil=0;
  if(n>=96){f.itachiPhaseCounterUntil=0;finishSkill(f);}
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
 if(mv&&mv.trueDamage&&defender&&alive(defender)&&alive(attacker)&&attacker!==defender&&typeof oldResolve==='function'){
  if((defender.invuln||0)>0)return 'whiff';
  const safe=Object.assign({},mv,{damage:0,armorBreak:true,trueDamage:false});const staged=oldResolve.call(this,attacker,defender,safe,hx,hy);
  if(staged==='whiff'||staged==='infinity'||staged==='parry')return staged;
  const amount=Math.max(0,Number(mv.damage)||0);defender.hp=Math.max(0,defender.hp-amount);defender.hitFlash=7;
  if(defender.hp<=0){defender.hp=0;defender.state='DEFEAT';defender.stateFrame=0;}
  if(typeof window.floatText==='function')window.floatText(defender.x,defender.y-168,'-'+Math.round(amount)+' TRUE','#d6b9ff',14,36);return 'hit';
 }
 if(defender&&alive(defender)&&alive(attacker)&&attacker!==defender&&mv){
  if(defender.itachiPhaseSkillKey==='life_p2_yata'&&(defender.itachiPhaseYataUntil||0)>t&&frontFacing(defender,attacker)){
   const dmg=Math.max(1,Math.round(Number(mv.damage)||1)*.5);
   oldResolve.call(this,defender,attacker,{damage:dmg,hitstun:25,blockstun:0,kbx:(defender.facing||1)*7,kby:-2,hitstop:8,meter:5,armorBreak:false,kind:'special',type:'fire'},defender.x+(defender.facing||1)*70,defender.y-100);
   fx('reflect',defender.x+(defender.facing||1)*62,defender.y-110,24);fx('fire',attacker.x,attacker.y-88,16);
   return 'parry';
  }
  if(defender.itachiPhaseSkillKey==='edo_p2_counter'&&(defender.itachiPhaseCounterUntil||0)>=t&&!defender.itachiPhaseParryTriggered&&frontFacing(defender,attacker)){
   defender.itachiPhaseParryTriggered=true;defender.itachiPhaseParryTarget=attacker;defender.itachiPhaseCounterUntil=0;
   attacker.vx=0;attacker.vy=0;attacker.hitstun=Math.max(attacker.hitstun||0,18);attacker.state='HITSTUN';attacker.stateFrame=0;attacker.move=null;attacker.moveKey=null;attacker.moveFrame=0;
   fx('crows',defender.x,defender.y-94,30);fx('reflect',defender.x+(defender.facing||1)*54,defender.y-113,26);
   if(typeof window.floatText==='function')window.floatText(attacker.x,attacker.y-172,'COUNTER CONFIRMED','#e2caff',14,36);
   impact(.13,'#cba0ff',7);return 'parry';
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
  if(p.age%2===0){for(const dy of [-17,0,17])fx('magatama',p.x,p.y+dy,12,{spin:p.age*.28,ash:true});if(p.age%4===0){fx('crows',p.x-p.vx*1.6,p.y+8,13);fx('shock',p.x-p.vx*1.2,p.y+12,8);}}
  const collided=alive(o)&&Math.abs(o.x-p.x)<68&&Math.abs((o.y-92)-p.y)<115;
  const missed=p.age>=p.maxAge||p.x<(window.WALL||90)||p.x>(window.ARENA_W||3200)-(window.WALL||90);
  if(collided||missed){
   const ix=p.x,iy=p.y;
   fx('explosion',ix,iy,44);fx('shock',ix,iy+30,43);fx('crows',ix,iy-20,36);fx('magatama',ix,iy,28);impact(.24,'#a65f91',13);
   if(alive(o)&&Math.abs(o.x-ix)<155&&Math.abs(o.y-iy)<190){
    const result=window.resolveHit(p.owner,o,{damage:22,hitstun:25,blockstun:11,kbx:(p.owner&&p.owner.facing||1)*8,kby:-3,hitstop:8,meter:7,armorBreak:false,kind:'special',type:'chakra'},ix,iy);
    if(result==='hit'){
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
 if(e.code!=='KeyZ'&&e.code!=='KeyX'&&e.code!=='NumpadSubtract'&&e.code!=='NumpadDivide')return;
 const f=findPlayer(e.code);if(!f||phaseOf(f)>=3)return;
 const slot=(e.code==='KeyZ'||e.code==='NumpadSubtract')?1:2,id=idFor(f,slot);
 if(!id)return;
 e.preventDefault();e.stopImmediatePropagation();
 startSkill(f,id);
}
addEventListener('keydown',handleKey,true);
const oldRender=window.render;
if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);const t=now();if(t%6===0){lastPanelTick=t;updatePanel(true);}else updatePanel(false);return r;};
if(typeof window.resetFighter==='function'){
 const oldReset=window.resetFighter;
 window.resetFighter=function(f){if(f){f.itachiPhaseSkillKey='';f.itachiPhaseSkillCooldowns={};f.itachiPhaseYataUntil=0;f.itachiPhaseCounterUntil=0;f.itachiPhaseRootUntil=0;delete f.itachiPhaseRootX;delete f.itachiPhaseRootY;f.itachiPhaseSilenceUntil=0;f.itachiPhaseSlowUntil=0;}return oldReset.apply(this,arguments);};
}
window.JFF_SUSANOO_PHASE_SKILLS={ready:true,version:3,skills:skillNames,phase3Unchanged:true,activate:(f,slot)=>{const id=idFor(f,slot);return startSkill(f,id);}};
console.info('[Itachi Susanoo] Phase 1/2 skills enabled for regular + Edo; phase 3 moveset untouched.');
})();