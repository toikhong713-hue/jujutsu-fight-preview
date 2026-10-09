'use strict';
/* ===== CHARACTERS ===== */
const SUKUNA_COLORS={skin:'#efd0bb',skin2:'#cfa88f',hair:'#f0a0b4',hair2:'#c26f88',top:'#231016',top2:'#4a1a24',bottom:'#150a10',accent:'#ff5566',aura:'#ff4d5e',energy:'#ff3355',rim:'#ffb0b0'};
const YUJI_COLORS={skin:'#f3d4b8',skin2:'#cfa88f',hair:'#f5c0b8',hair2:'#b88080',top:'#151018',top2:'#3a1418',bottom:'#0c0810',accent:'#ff5577',aura:'#ff4466',energy:'#ff2244',rim:'#ffb0b0'};
const CHARS={
  gojo:{name:'GOJO SATORU',short:'GOJO',moves:GOJO_MOVES,colors:{skin:'#f3d9c4',skin2:'#d9b79c',hair:'#f4f7ff',hair2:'#c2d2ee',top:'#1b2440',top2:'#33477a',bottom:'#0f1424',accent:'#4fc3f7',aura:'#5ad2ff',energy:'#3aa0ff',rim:'#9fe4ff'},hp:200,walk:3.5,jump:-14.6,weight:1,awakening:'spatial'},
  young_gojo:{name:'YOUNG GOJO',short:'YOUNG GOJO',moves:YOUNG_GOJO_MOVES,colors:{skin:'#f3d9c4',skin2:'#d9b79c',hair:'#f5f8ff',hair2:'#cde0f5',top:'#101a2e',top2:'#284b76',bottom:'#0b1320',accent:'#9fe4ff',aura:'#72d9ff',energy:'#4fbaff',rim:'#d8f4ff'},hp:195,walk:3.9,jump:-14.8,weight:0.98,awakening:'young_sixeyes'},
  sukuna:{name:'RYOMEN SUKUNA',short:'SUKUNA',moves:SUKUNA_MOVES,colors:SUKUNA_COLORS,altMoves:YUJI_MOVES,altColors:YUJI_COLORS,altName:'YUJI (SUKUNA)',altShort:'YUJI',hp:200,walk:3.3,jump:-14.2,weight:1.05,awakening:'slash',hasForms:true},
  yuta:{name:'YUTA OKKOTSU',short:'YUTA',moves:YUTA_MOVES,colors:{skin:'#efd5c0',skin2:'#c8a488',hair:'#e8e8f2',hair2:'#a8a8c0',top:'#141824',top2:'#2a3452',bottom:'#0a0e18',accent:'#c9a6ff',aura:'#c9a6ff',energy:'#a070ff',rim:'#e0d0ff'},hp:195,walk:3.5,jump:-14.4,weight:1,awakening:'rika'},
  hakari:{name:'KINJI HAKARI',short:'HAKARI',moves:HAKARI_MOVES,colors:{skin:'#f0cfb6',skin2:'#cda088',hair:'#3a2a3f',hair2:'#1e1626',top:'#2a1830',top2:'#5a2a48',bottom:'#180e20',accent:'#ffd166',aura:'#ffd166',energy:'#ffcc44',rim:'#ffe9a8'},hp:205,walk:3.7,jump:-14.6,weight:1.02,awakening:'jackpot'},
  toji:{name:'TOJI FUSHIGURO',short:'TOJI',moves:TOJI_MOVES,colors:{skin:'#e8c8b0',skin2:'#c49c80',hair:'#111315',hair2:'#24282b',top:'#101214',top2:'#25292d',bottom:'#090a0b',accent:'#7b8084',aura:'#3e4347',energy:'#686e73',rim:'#c7cbce'},hp:215,walk:4.25,jump:-14.9,weight:0.96,awakening:'toji'},
  heian_sukuna:{name:'HEIAN SUKUNA',short:'HEIAN',moves:HEIAN_SUKUNA_MOVES,
    colors:{skin:'#e8c8ac',skin2:'#c49c80',hair:'#f0a8b0',hair2:'#a05860',top:'#2a0d0d',top2:'#5a1a1a',bottom:'#150505',accent:'#ff4455',aura:'#ff3344',energy:'#ff2244',rim:'#ff8090'},
    hp:440,walk:3.4,jump:-14.3,weight:1.08,awakening:'heian',trainingOnly:true},
  the_strongest_today:{name:'THE STRONGEST OF TODAY',short:'STRONGEST',
    moves:STRONGEST_BASE_MOVES,
    overdriveMoves:STRONGEST_OVERDRIVE_MOVES,
    colors:{skin:'#f5e0d0',skin2:'#d9b79c',hair:'#f8fbff',hair2:'#9fd4ff',top:'#0a1428',top2:'#1a3a6a',bottom:'#050a14',accent:'#00e5ff',aura:'#00d4ff',energy:'#00b8ff',rim:'#b0f0ff'},
    hp:400,walk:3.5,jump:-14.6,weight:1,awakening:'spatial',trainingOnly:true}
};
/* ===== STATE ===== */
const G={mode:'menu',frame:0,fighters:[],projectiles:[],particles:[],texts:[],afterimages:[],firePillars:[],heianFugaImpacts:[],wcsScars:[],speedLines:[],impactBursts:[],hitstop:0,shake:0,shakeX:0,shakeY:0,flash:0,flashColor:'#fff',zoomPunch:0,camPunch:0,round:1,roundState:'intro',roundTimer:0,matchOver:false,winner:null,domain:null,clash:null,paused:false,slowmo:0,slowmoTarget:0,difficulty:'normal',survivalRound:1,timeAttackStart:0,timeAttackResult:0,training:{infHP:false,infEnergy:false,infUlt:false,noCd:false,boxes:false,frames:false},story:null,storyCutscene:false,bgFar:null,bgMid:null,ambient:[],comboDisplay:null,matchOverScreen:false,hakariDomainT:0,hakariCin:null,tojiCineX:null};
const cam={x:1100,y:430,zoom:1,tx:1100,ty:430,tzoom:1,cine:0,cineX:0,cineY:0,cineZoom:1};
/* ===== FIGHTER ===== */
function createFighter(charId,x,facing,isP2){
  const base=CHARS[charId];
  if(!base)return null;
  const f={id:charId,def:base,name:base.name,short:base.short,isP2,opp:null,x,y:GROUND,vx:0,vy:0,facing,hp:base.hp,maxHp:base.hp,energy:100,maxEnergy:100,meter:0,maxMeter:100,state:'IDLE',stateFrame:0,move:null,moveKey:null,moveFrame:0,hasHit:false,spawned:false,delayedHitPending:0,delayedHitData:null,blackFlash:false,blackFlashWindow:0,hitstun:0,blockstun:0,immobilize:0,onGround:true,jumps:2,cd:{},parry:0,blocking:false,invuln:0,guardArmor:0,guardCounter:0,infinity:0,dashCd:0,dashDir:0,invulnDash:0,tapTimer:0,lastDir:0,awakened:false,awakenCd:0,awakenGlow:0,domainCharge:0,ultStart:-999,comboCount:0,comboTimer:0,comboDamage:0,chain:0,chainTimer:0,ai:null,aiTimer:0,aiCache:emptyInput(),animT:Math.random()*100,hitFlash:0,walk:0,landing:0,afterTimer:0,wins:0,form:0,formCd:0,copiedTech:null,rikaTimer:0,ultCharging:false,ultHoldFrames:0,domainReady:false,jackpot:0,restless:0,rollTimer:0,rollResult:null,rollTotal:0,healTick:0,prevHp:0,wcsCharge:0,overdriveActive:false,grabTarget:null,grabber:null,grabTimer:0,grabCooldown:0,burstTimer:0,burstCooldown:0,rollInvuln:0,rollDir:0,rollDistance:0,guardCancelCooldown:0,blockTapTimer:0,tojiHunt:0,tojiSeqHits:null,tojiWeaponPhase:null,tojiMotion:'idle',tojiMotionFrame:0,tojiMoveTween:null,tojiSoruCd:0,tojiSoruAnchor:null,tojiInventoryOpen:0,tojiM1Step:0,tojiMoveDuration:0,youngSixEyes:0,youngInfinity:0,youngMotion:'idle',youngMotionFrame:0,youngMoveTween:null,youngPhase:0,youngPurpleState:null,tojiCineTarget:'',tojiCinePhase:0};
  if(base.hasForms){f.altMoves=base.altMoves;f.altColors=base.altColors;f.altName=base.altName;f.altShort=base.altShort;}
  f.moves=base.moves;
  return f;
}
function getColors(f){if(f.id==='sukuna'&&f.form===1)return f.altColors;return f.def.colors;}
function getDisplayName(f){if(f.id==='sukuna'&&f.form===1)return f.altName;return f.name;}
function getDisplayShort(f){if(f.id==='sukuna'&&f.form===1)return f.altShort;return f.short;}
function resetFighter(f,x,facing){
  const base=CHARS[f.id];
  f.x=x;f.y=GROUND;f.vx=0;f.vy=0;f.facing=facing;
  f.hp=base.hp;f.energy=100;f.meter=0;
  f.state='IDLE';f.stateFrame=0;f.move=null;f.moveKey=null;f.moveFrame=0;
  f.hitstun=0;f.blockstun=0;f.immobilize=0;f.onGround=true;f.jumps=2;
  f.cd={};f.parry=0;f.blocking=false;f.invuln=0;f.guardArmor=0;
  f.infinity=0;f.dashCd=0;f.invulnDash=0;
  f.awakened=false;f.awakenCd=0;f.awakenGlow=0;
  f.comboCount=0;f.comboTimer=0;f.comboDamage=0;
  f.chain=0;f.chainTimer=0;f.hitFlash=0;f.ultStart=-999;
  f.blackFlash=false;f.blackFlashWindow=0;
  f.landing=0;f.afterTimer=0;
  f.form=0;f.formCd=0;f.copiedTech=null;
  f.rikaTimer=0;f.delayedHitPending=0;f.delayedHitData=null;
  f.ultCharging=false;f.ultHoldFrames=0;f.domainReady=false;
  f.jackpot=0;f.restless=0;f.tojiHunt=0;f.tojiSeqHits=null;f.tojiWeaponPhase=null;f.tojiMotion='idle';f.tojiMotionFrame=0;f.tojiMoveTween=null;f.tojiSoruCd=0;f.tojiSoruAnchor=null;f.tojiInventoryOpen=0;f.tojiM1Step=0;f.tojiMoveDuration=0;f.rollTimer=0;f.rollResult=null;f.rollTotal=0;
  f.grabTarget=null;f.grabber=null;f.grabTimer=0;f.grabCooldown=0;f.burstTimer=0;f.burstCooldown=0;f.rollInvuln=0;f.rollDir=0;f.rollDistance=0;f.guardCancelCooldown=0;f.blockTapTimer=0;
  f.healTick=0;f.prevHp=f.hp;f.wcsCharge=0;
  f.youngSixEyes=0;f.youngInfinity=0;f.youngMotion='idle';f.youngMotionFrame=0;f.youngMoveTween=null;f.youngPhase=0;f.youngPurpleState=null;
  /* Young Gojo Red Counter: hard-reset transient visual/control state every round. */
  f.youngRedCounterReady=false;f.youngRedCounterTriggered=false;f.youngRedCounterHidden=false;f.youngRedCounterInverted=false;
  f.youngRedCounterAngle=0;f.youngRedCounterAttacker=null;f.youngRedCounterHitFrame=0;f.redCounterVisualRotation=0;f.youngRedCounterState=null;
  /* Strongest of Today: reset overdrive back to base */
  f.overdriveActive=false;
  delete f.maxBlueState;delete f.maxRedState;delete f.purpleChantState;
  if(base.hasForms)f.moves=base.moves;
  else f.moves=base.moves;
}
/* ===== MATCH SETUP ===== */
function startMatch(mode,p1char,p2char,diff){
  if(mode!=='training'&&(p1char==='heian_sukuna'||p2char==='heian_sukuna')){
    if(p1char==='heian_sukuna')p1char='sukuna';
    if(p2char==='heian_sukuna')p2char='sukuna';
  }
  if(mode!=='training'&&(p1char==='the_strongest_today'||p2char==='the_strongest_today')){
    if(p1char==='the_strongest_today')p1char='gojo';
    if(p2char==='the_strongest_today')p2char='gojo';
  }
  G.mode=mode;G.difficulty=diff||G.difficulty;
  G.fighters=[];
  const f1=createFighter(p1char||'gojo',ARENA_W/2-170,1,false);
  const f2=createFighter(p2char||'sukuna',ARENA_W/2+170,-1,true);
  if(!f1||!f2)return;
  f1.opp=f2;f2.opp=f1;
  G.fighters.push(f1,f2);
  G.projectiles.length=0;G.particles.length=0;G.texts.length=0;
  G.afterimages.length=0;G.firePillars.length=0;G.heianFugaImpacts.length=0;G.wcsScars.length=0;
  G.round=1;G.matchOver=false;G.winner=null;G.domain=null;G.clash=null;
  G.hakariDomainT=0;G.hakariCin=null;G.tojiCineX=null;
  if(mode!=='survival')G.survivalRound=1;
  f1.wins=0;f2.wins=0;
  resetRound();
  if(mode==='cpu'||mode==='survival'||mode==='timeattack'||mode==='story'){f2.ai={lvl:G.difficulty};}
  else f2.ai=null;
  if(mode==='training'){f2.ai=null;document.getElementById('trainingPanel').classList.add('on');}
  else{document.getElementById('trainingPanel').classList.remove('on');}
  if(mode==='timeattack')G.timeAttackStart=performance.now();
  showScreen(null);
}
function resetRound(){
  const f1=G.fighters[0],f2=G.fighters[1];
  resetFighter(f1,ARENA_W/2-190,1);resetFighter(f2,ARENA_W/2+190,-1);
  G.projectiles.length=0;G.particles.length=0;G.afterimages.length=0;
  G.firePillars.length=0;G.heianFugaImpacts.length=0;G.wcsScars.length=0;G.speedLines.length=0;G.impactBursts.length=0;G.domain=null;G.clash=null;G.hakariDomainT=0;G.hakariCin=null;
  G.roundState='intro';G.roundTimer=110;G.tojiCineX=null;
  cam.x=ARENA_W/2;cam.y=430;cam.zoom=1;cam.tx=cam.x;cam.ty=cam.y;cam.tzoom=1;
  cam.cine=0;G.zoomPunch=0;G.camPunch=0;G.slowmo=0;G.slowmoTarget=0;
  G.comboDisplay=null;
}