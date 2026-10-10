'use strict';
/* ===== TOJI TRAVERSAL MAP ===== */
const TOJI_MAP_PLATFORMS=[
  // Building roofs / ledges
  {x:470,y:418,w:360,h:18,type:'roof',id:'b1roof'},
  {x:1050,y:332,w:430,h:18,type:'roof',id:'b2roof'},
  {x:1840,y:404,w:380,h:18,type:'roof',id:'b3roof'},
  {x:2470,y:302,w:440,h:18,type:'roof',id:'b4roof'},
  // Fire escapes / balconies
  {x:560,y:470,w:120,h:12,type:'ledge',id:'b1ledge'},
  {x:1170,y:390,w:160,h:12,type:'ledge',id:'b2ledge'},
  {x:1950,y:455,w:150,h:12,type:'ledge',id:'b3ledge'},
  {x:2580,y:360,w:160,h:12,type:'ledge',id:'b4ledge'},
  // Staircase steps
  {x:350,y:522,w:90,h:12,type:'step',id:'st1'},
  {x:405,y:484,w:90,h:12,type:'step',id:'st2'},
  {x:460,y:446,w:90,h:12,type:'step',id:'st3'},
  {x:515,y:418,w:90,h:12,type:'step',id:'st4'},
  {x:890,y:500,w:80,h:12,type:'step',id:'st5'},
  {x:935,y:460,w:80,h:12,type:'step',id:'st6'},
  {x:980,y:420,w:80,h:12,type:'step',id:'st7'},
  // Tree climbing branches
  {x:710,y:442,w:170,h:12,type:'branch',id:'tree1low'},
  {x:735,y:366,w:130,h:12,type:'branch',id:'tree1high'},
  {x:1510,y:455,w:170,h:12,type:'branch',id:'tree2low'},
  {x:1540,y:378,w:140,h:12,type:'branch',id:'tree2high'},
  {x:2850,y:430,w:180,h:12,type:'branch',id:'tree3low'},
  {x:2880,y:350,w:140,h:12,type:'branch',id:'tree3high'}
];
const TOJI_SORU_ANCHORS=[
  ...TOJI_MAP_PLATFORMS.filter(p=>p.type==='roof'||p.type==='branch').map(p=>({x:p.x+p.w*.5,y:p.y-10,type:p.type,id:p.id})),
  {x:1320,y:205,type:'air',id:'air1'},{x:2240,y:185,type:'air',id:'air2'},{x:2960,y:220,type:'air',id:'air3'}
];
function tojiPlatformAt(x,y,margin=0){
  for(const p of TOJI_MAP_PLATFORMS){
    if(x>=p.x-margin&&x<=p.x+p.w+margin&&Math.abs(y-p.y)<=5)return p;
  }
  return null;
}
function tojiSupportAt(x,y){
  if(Math.abs(y-GROUND)<=5)return true;
  return !!tojiPlatformAt(x,y,8);
}
function doTojiSoru(f,inp){
  if(f.id!=='toji'||f.tojiSoruCd>0||f.state==='ATTACK'||f.state==='DEFEAT')return false;
  const o=f.opp;let dx=0;if(inp.left)dx--;if(inp.right)dx++;
  const fromX=f.x,fromY=f.y;
  let target=null;
  // Up + Soru: take the sky and set up an aerial punish.
  if(inp.up){
    const ox=o?o.x:f.x+f.facing*80;
    target={x:clamp(ox-f.facing*62,WALL,ARENA_W-WALL),y:Math.max(175,(o?.y||GROUND)-245),type:'air',id:'sky-punish'};
  }else if(dx!==0){
    f.facing=dx>0?1:-1;
    const candidates=TOJI_SORU_ANCHORS.filter(a=>(a.x-f.x)*dx>20);
    candidates.sort((a,b)=>Math.abs(a.x-f.x)-Math.abs(b.x-f.x));
    target=candidates[0]||null;
  }else if(o){
    // Neutral Soru snaps behind the opponent when no direction is held.
    target={x:clamp(o.x-f.facing*92,WALL,ARENA_W-WALL),y:Math.max(170,o.y-6),type:'rear',id:'rear'};
    target.x=clamp(target.x,WALL,ARENA_W-WALL);
  }
  if(!target)return false;
  f.x=clamp(target.x,WALL,ARENA_W-WALL);f.y=target.y;
  f.tojiSoruCd=42;f.tojiSoruAnchor=target;f.stateFrame=0;f.vx=0;
  const landedOnTraversal=target.type==='roof'||target.type==='branch';
  f.onGround=landedOnTraversal;
  f.state=landedOnTraversal?'IDLE':'JUMP';
  if(target.type==='air')f.vy=2.2;else if(landedOnTraversal)f.vy=0;else f.vy=-1.8;
  f.facing=o?(o.x>=f.x?1:-1):f.facing;
  f.invuln=Math.max(f.invuln,10);
  for(let i=0;i<5;i++)pushAfterimage(f,computePose(f));
  ring(fromX,fromY-58,'#eef1f3',28,13);ring(f.x,f.y-58,'#ffffff',38,16);
  vfxSlashTrail(fromX,fromY-78,f.x,f.y-78,'#e7ebed',3.5,13);
  spark(f.x,f.y-64,10,'#dfe5e8',4.5,6,15,0);
  if(target.type==='air'){flash(.13,'#ffffff');camPunch(.08);}else{flash(.08,'#e9edf0');}
  SFX.dash();
  return true;
}

/* ===== FIGHTER UPDATE ===== */
function updateFighter(f,inp){
  f.animT++;
  if(f.hitFlash>0)f.hitFlash--;
  if(f.comboTimer>0){f.comboTimer--;if(f.comboTimer<=0){f.comboCount=0;}}
  if(f.chainTimer>0){f.chainTimer--;if(f.chainTimer<=0)f.chain=0;}
  if(f.dashCd>0)f.dashCd--;
  if(f.tojiSoruCd>0)f.tojiSoruCd--;
  if(f.blackFlashWindow>0)f.blackFlashWindow--;
  if(f.invuln>0)f.invuln--;
  if(f.parry>0)f.parry--;
  if(f.guardArmor>0)f.guardArmor--;
  if(f.guardCounter>0)f.guardCounter--;
  if(f.infinity>0)f.infinity--;
  if(f.hitstop>0)f.hitstop--;
  if(f.afterTimer>0)f.afterTimer--;
  if(f.landing>0)f.landing--;
  if(f.formCd>0)f.formCd--;
  if(f.awakenCd>0)f.awakenCd--;
  if(f.awakenGlow>0)f.awakenGlow--;
  if(f.rikaTimer>0)f.rikaTimer--;
  if(f.jackpot>0)f.jackpot--;
  if(f.burstCooldown>0)f.burstCooldown--;
  if(f.grabCooldown>0)f.grabCooldown--;
  if(f.guardCancelCooldown>0)f.guardCancelCooldown--;
  if(f.rollInvuln>0)f.rollInvuln--;
  if(f.burstTimer>0)f.burstTimer--;
  if(f.restless>0)f.restless--; if(f.tojiHunt>0)f.tojiHunt--; if(f.youngSixEyes>0)f.youngSixEyes--; if(f.youngInfinity>0)f.youngInfinity--;
  if(f.rollTimer>0){f.rollTimer--;if(f.rollTimer===0){if(f.id==='hakari'){resolveJackpot(f);}else{f.rollResult=null;}}}
  if(f.immobilize>0){f.immobilize--;if(f.immobilize===0&&f.state==='IMMOBILIZED'){f.state='IDLE';f.stateFrame=0;f.invuln=Math.max(f.invuln,8);}}
  for(const k in f.cd){if(f.cd[k]>0)f.cd[k]--;}
  const regen=(f.awakened?0.34:0.19)*(G.mode==='training'&&G.training.infEnergy?0:1);
  f.energy=Math.min(f.maxEnergy,f.energy+regen);
  if(f.state==='CINE_REACT'&&G.tojiCineX&&G.tojiCineX.target===f){f.vx=0;f.vy=0;f.x=clamp(f.x,WALL,ARENA_W-WALL);return;}
  if(f.id==='hakari'&&f.jackpot>0&&f.hp>0&&f.hp<f.maxHp){f.healTick=(f.healTick||0)+1;if(f.healTick>=30){f.healTick=0;f.hp=Math.min(f.maxHp,f.hp+1);vfxHakariHeal(f.x,f.y-70);if(G.frame%60===0)SFX.heal();}}
  if(!f.awakened&&f.awakenCd<=0&&inp.awaken&&f.meter>=50&&f.state!=='DEFEAT'&&f.state!=='HITSTUN'&&f.state!=='IMMOBILIZED'){
    f.awakened=true;f.meter=Math.max(0,f.meter-50);f.awakenCd=600;f.awakenGlow=40;
    const ac=({gojo:'#7fd8ff',young_gojo:'#bfeeff',yuta:'#c9a6ff',hakari:'#ffd166',heian_sukuna:'#ff3344',the_strongest_today:STRONGEST_CYAN}[f.id]||'#ff3344');
    flash(0.65,ac);shake(20);camPunch(0.24);ring(f.x,f.y-60,ac,70,44);burst(f.x,f.y-60,44,ac,10,13,46);
    floatText(f.x,f.y-200,'AWAKENING','#ffd166',30,80);SFX.awaken();
  }
  if(!f.awakened&&f.hp<=f.maxHp*0.25&&f.hp>0){
    f.awakened=true;f.awakenGlow=40;
    const ac=f.id==='gojo'?'#7fd8ff':(f.id==='young_gojo'?'#bfeeff':(f.id==='yuta'?'#c9a6ff':(f.id==='hakari'?'#ffd166':(f.id==='heian_sukuna'?'#ff3344':(f.id==='the_strongest_today'?STRONGEST_CYAN:'#ff3344')))));
    flash(0.6,ac);shake(18);camPunch(0.20);ring(f.x,f.y-60,ac,60,40);burst(f.x,f.y-60,40,ac,9,12,44);
    floatText(f.x,f.y-190,'AWAKENING','#ffd166',28,80);SFX.awaken();
  }
  if(f.def.hasForms&&f.formCd<=0&&inp.form&&f.state!=='DEFEAT'&&f.state!=='HITSTUN'&&f.state!=='KNOCKBACK'&&f.state!=='CLASH'&&f.state!=='IMMOBILIZED'){
    f.form=1-f.form;f.formCd=90;f.moves=f.form===0?f.def.moves:f.altMoves;
    f.state='IDLE';f.move=null;f.moveKey=null;f.stateFrame=0;
    flash(0.55,f.form===0?'#ff3344':'#ff5577');shake(14);camPunch(0.18);SFX.transform();
    ring(f.x,f.y-70,'#ff3344',60,30);burst(f.x,f.y-70,30,'#ff3344',8,12,36);
    floatText(f.x,f.y-100,f.form===0?'SUKUNA':'YUJI','#ffffff',26,60);
  }
  if(f.jackpot>0&&G.frame%6===0){
    const p=pget();const a=rnd(-0.6,0.6);p.active=true;p.x=f.x+rnd(-30,30);p.y=f.y-rnd(10,120);p.vx=Math.cos(a)*0.6;p.vy=-rnd(1,2.5);p.maxLife=p.life=rnd(20,38);p.size=rnd(2,4.5);p.color=Math.random()<0.5?'#ffd166':'#ffffff';p.grav=-0.03;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
  }
  if(f.id==='heian_sukuna'&&G.frame%8===0){
    const p=pget();const a=Math.random()*6.28;const r=rnd(40,70);p.active=true;p.x=f.x+Math.cos(a)*r*0.6;p.y=f.y-70+Math.sin(a)*r;p.vx=rnd(-0.3,0.3);p.vy=-rnd(0.5,1.5);p.maxLife=p.life=rnd(20,36);p.size=rnd(2,4);p.color=Math.random()<0.5?'#ff3344':'#881122';p.grav=-0.02;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
  }
  if(f.id==='the_strongest_today'&&f.overdriveActive&&G.frame%6===0){
    const p=pget();const a=Math.random()*6.28;const r=rnd(50,90);p.active=true;p.x=f.x+Math.cos(a)*r*0.7;p.y=f.y-70+Math.sin(a)*r;p.vx=rnd(-0.4,0.4);p.vy=-rnd(0.5,1.5);p.maxLife=p.life=rnd(18,32);p.size=rnd(2,4);p.color=Math.random()<0.5?STRONGEST_CYAN:STRONGEST_WHITE;p.grav=-0.02;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
  }
  let doubleBlockPress=false;
  if(inp.blockPress){
    if(f.blockTapTimer>0){doubleBlockPress=true;f.blockTapTimer=0;}
    else f.blockTapTimer=8;
  }
  if(f.blockTapTimer>0)f.blockTapTimer--;
  /* ===== V26 YOUNG GOJO RED COUNTER STATE ===== */
  if(f.state==='YOUNG_RED_COUNTER'){
    updateYoungGojoRedCounterV26(f);
    f.stateFrame++;
    return;
  }
  if(f.state==='GRABBED') {
    if(f.grabber&&f.grabber.grabTarget===f){
      if(doubleBlockPress&&f.grabber.state==='GRAB'&&f.grabber.stateFrame<=6){resolveThrowTech(f,f.grabber);return;}
      f.x=clamp(f.grabber.x+f.grabber.facing*54,WALL,ARENA_W-WALL);f.y=f.grabber.y;f.vx=0;f.vy=0;f.onGround=true;f.stateFrame++;return;
    }
    f.state='IDLE';f.stateFrame=0;
  }
  if(f.state==='GRAB'){updateGrabState(f);return;}
  if(f.state==='BURST'){
    f.stateFrame++;f.invuln=Math.max(f.invuln,1);f.x=clamp(f.x+f.vx,WALL,ARENA_W-WALL);f.vx*=0.86;f.vy+=GRAV;f.y+=f.vy;
    if(f.stateFrame%3===0)burst(f.x,f.y-60,5,'#ffffff',3,7,14);
    if(f.y>=GROUND){f.y=GROUND;f.vy=-2;}
    if(f.stateFrame>=16){f.state='IDLE';f.stateFrame=0;f.onGround=true;f.vx=0;f.vy=0;}
    return;
  }
  if(f.state==='ROLL'){
    f.stateFrame++;f.invuln=Math.max(f.invuln,1);
    const t=clamp(f.stateFrame/18,0,1);
    const step=7.6-3.8*t;
    const prevX=f.x;f.x=clamp(f.x+f.rollDir*step,WALL,ARENA_W-WALL);f.rollDistance+=Math.abs(f.x-prevX);
    f.vy+=GRAV*0.55;f.y+=f.vy;
    if(f.stateFrame%2===0){
      pushAfterimage(f,computePose(f));
      burst(f.x-f.rollDir*14,f.y-42,2,'#cfe7ff',2.2,5,12);
      ring(f.x,f.y-42,'#9fd8ff',14+f.stateFrame*0.35,8);
    }
    if(f.y>=GROUND){f.y=GROUND;f.vy=0;f.onGround=true;}
    if(f.stateFrame>=18){f.state='IDLE';f.stateFrame=0;f.vx=0;f.vy=0;f.onGround=true;f.rollDir=0;f.rollDistance=0;}
    return;
  }
  if(f.state==='IMMOBILIZED'){f.stateFrame++;physics(f);return;}
  if(f.state==='CLASH'||f.state==='TRAPPED'){f.stateFrame++;return;}
  if(f.hp<=0){f.hp=0;if(f.state!=='DEFEAT'){f.state='DEFEAT';f.stateFrame=0;f.vx=-f.facing*6;f.vy=-8;f.onGround=false;SFX.ko();shake(20);}physics(f);f.stateFrame++;return;}
  if(f.state==='VICTORY'){f.stateFrame++;physics(f);return;}
  if(f.hitstun>0){
    if(inp.block&&doBurst(f))return;
    f.hitstun--;physics(f);if(f.hitstun<=0&&f.onGround){f.state='IDLE';f.stateFrame=0;}else if(!f.onGround)f.state='FALL';return;
  }
  if(f.blockstun>0){
    if(inp.guardCancel&&doGuardCancel(f))return;
    f.blockstun--;physics(f);if(f.blockstun<=0)f.state=f.blocking?'BLOCK':'IDLE';return;
  }
  if(f.id==='toji'&&inp.soru&&f.tojiSoruCd<=0&&f.state!=='ATTACK'&&f.state!=='KNOCKDOWN'&&f.state!=='WAKEUP'){if(doTojiSoru(f,inp))return;}
  if(f.state==='KNOCKDOWN'){
    if(inp.blockPress){doWakeupRoll(f);return;}
    f.stateFrame++;physics(f);if(f.stateFrame>34){f.state='WAKEUP';f.stateFrame=0;f.invuln=14;}return;
  }
  if(f.state==='WAKEUP'){f.stateFrame++;physics(f);if(f.stateFrame>16){f.state='IDLE';f.stateFrame=0;}return;}
  if(f.state==='ATTACK'){
    if(f.move){
      const m=f.move;
      const cw=m.cancelFrom||0,cwEnd=m.cancelTo||0;
      const inWindow=f.moveFrame>=cw&&f.moveFrame<=cwEnd;
      if(inWindow&&f.hasHit){
        const c=m.cancels||{};
        if(inp.light&&c.light&&f.chain<3){if(startMove(f,'light',f.blackFlashWindow>0)){f.chain++;f.moveFrame=-1;}}
        else if(inp.heavy&&c.heavy){if(startMove(f,'heavy',f.blackFlashWindow>0))f.moveFrame=-1;}
        else if((inp.s1||inp.s2||inp.s3||inp.s4||inp.s5)&&c.skill){const key=inp.s1?'s1':(inp.s2?'s2':(inp.s3?'s3':(inp.s4?'s4':'s5')));if(f.moves[key]&&startMove(f,key,false))f.moveFrame=-1;}
        else if(inp.blockPress&&c.dash){doDash(f,inp,true);}
        else if(inp.ult&&c.ult&&f.meter>=100&&f.id!=='yuta'&&f.id!=='hakari'){if(startMove(f,'ult',false))f.moveFrame=-1;}
        else if(inp.ult&&c.ult&&f.id==='hakari'&&(f.jackpot>0||f.meter>=100)){if(startMove(f,'ult',false))f.moveFrame=-1;}
      }
    }
    if(f.state==='ATTACK')updateMove(f);
    physics(f);f.stateFrame++;return;
  }
  if(f.state==='DASH'){
    f.stateFrame++;
    const dashSpeed=9.4*((f.restless>0||f.jackpot>0||f.tojiHunt>0)?1.15:1);
    f.x+=f.dashDir*dashSpeed;
    f.x=clamp(f.x,WALL,ARENA_W-WALL);
    f.invulnDash=Math.max(0,f.invulnDash-1);
    if(f.invulnDash>0)f.invuln=Math.max(f.invuln,1);
    if(f.stateFrame%2===0){
      const p=pget();p.active=true;p.x=f.x-f.dashDir*10;p.y=f.y-rnd(20,80);p.vx=-f.dashDir*1.5;p.vy=rnd(-0.6,0.2);p.maxLife=p.life=16;p.size=rnd(3,7);p.color=(f.jackpot>0)?'#ffd166':(f.id==='heian_sukuna'?'#ff3344':(f.id==='the_strongest_today'?STRONGEST_CYAN:getColors(f).aura));p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
      pushAfterimage(f,computePose(f));
    }
    if(f.stateFrame>=12){f.state=f.onGround?'IDLE':'FALL';f.stateFrame=0;}
    physics(f);return;
  }
  if(f.state==='PARRY'){
    if(doubleBlockPress&&f.onGround&&tryGrab(f))return;
    f.stateFrame++;f.parry=Math.max(f.parry,0);if(f.stateFrame>=8){if(inp.block||f.blocking){f.state='BLOCK';f.stateFrame=0;}else{f.state='IDLE';f.stateFrame=0;}}physics(f);return;
  }
  if(f.state==='BLOCK'){
    if(doubleBlockPress&&f.onGround&&tryGrab(f))return;
    f.blocking=true;
    if(!inp.block){f.state='IDLE';f.blocking=false;f.stateFrame=0;}
    physics(f);return;
  }
  if(f.id==='yuta'){
    const canStartCharge=(f.state==='IDLE'||f.state==='WALK'||f.state==='CROUCH')&&f.onGround&&f.meter>=100;
    if(!f.ultCharging&&inp.ultHeld&&canStartCharge&&f.ultStart<G.frame-30){f.ultCharging=true;f.ultHoldFrames=0;f.domainReady=false;}
    if(f.ultCharging){
      if(inp.ultHeld){f.ultHoldFrames++;if(f.ultHoldFrames>=ULT_HOLD_THRESHOLD&&!f.domainReady){f.domainReady=true;SFX.domain();floatText(f.x,f.y-200,'DOMAIN READY','#c9a6ff',22,50);flash(0.35,'#c9a6ff');ring(f.x,f.y-70,'#c9a6ff',60,30);}}
      else{if(f.domainReady){startYutaDomain(f);}else{startYutaBeam(f);}f.ultCharging=false;f.ultHoldFrames=0;f.domainReady=false;return;}
      f.stateFrame++;return;
    }
  }
  if(f.state!=='ATTACK'&&!f.onGround&&inp.block){f.state='BLOCK';f.blocking=true;f.stateFrame=0;f.parry=0;physics(f);return;}
  if((f.state==='IDLE'||f.state==='WALK'||f.state==='CROUCH')&&f.onGround&&doubleBlockPress){if(tryGrab(f))return;}

  /* v40: Keep P2's physical block key separate from the character-specific R/def skill.
     The latter is mapped to Numpad8; block is mapped to NumpadMultiply. */
  if(f.isP2&&inp.block&&f.onGround&&
     (f.state==='IDLE'||f.state==='WALK'||f.state==='CROUCH')){
    f.state='BLOCK';f.blocking=true;f.stateFrame=0;f.parry=0;
    physics(f);return;
  }
  const canAct=(f.state==='IDLE'||f.state==='WALK'||f.state==='CROUCH');
  if(canAct&&f.onGround){
    /* The Strongest of Today: Six Eyes Overdrive requires a FULL Ultimate meter. */
    if(f.id==='the_strongest_today'&&inp.ult&&f.meter>=100){if(startMove(f,'ult',false))return;}
    else if(f.id==='hakari'){if(inp.ult&&(f.jackpot>0||f.meter>=100)){if(startMove(f,'ult',false))return;}}
    else if(f.id!=='yuta'&&inp.ult&&f.meter>=100){if(startMove(f,'ult',false))return;}
    if(f.id==='heian_sukuna'&&inp.wcs&&f.moves.wcs){if(startMove(f,'wcs',false))return;}
    if(f.id==='the_strongest_today'&&inp.wcs&&f.moves.wcs){if(startMove(f,'wcs',false))return;}
    if(inp.special1&&f.moves.z&&f.id==='young_gojo'){
      if(f.awakened){if(startYoungGojoRedCounter(f))return;}
      else if(startMove(f,'z',false))return;
    }
    if(inp.special2&&f.moves.x&&f.id==='young_gojo'){if(startMove(f,'x',false))return;}
    if(inp.special1&&f.id==='toji'&&f.moves.z){if(startMove(f,'z',false))return;}
    if(inp.special2&&f.id==='toji'&&f.moves.x){if(startMove(f,'x',false))return;}
    if(inp.def){if(startMove(f,'def',false))return;}
    if(inp.blockPress){f.state='PARRY';f.stateFrame=0;f.parry=8;f.blocking=true;SFX.block();return;}
    if(inp.copy&&f.id==='yuta'&&f.copiedTech){if(useCopiedTechnique(f))return;}
    if(inp.s1&&f.moves.s1&&startMove(f,'s1',false))return;
    if(inp.s2&&f.moves.s2&&startMove(f,'s2',false))return;
    if(inp.s3&&f.moves.s3&&startMove(f,'s3',false))return;
    if(inp.s4&&f.moves.s4&&startMove(f,'s4',false))return;
    if(inp.s5&&f.moves.s5&&startMove(f,'s5',false))return;
    if(inp.light){if(startMove(f,'light',f.blackFlashWindow>0)){f.chain=1;return;}}
    if(inp.heavy){if(startMove(f,'heavy',f.blackFlashWindow>0))return;}
    if(inp.down){f.state='CROUCH';}
    else{
      let dir=0;if(inp.left)dir-=1;if(inp.right)dir+=1;
      if(dir!==0){
        if(f.lastDir===dir&&f.tapTimer>0&&f.dashCd<=0){doDash(f,inp,false);f.tapTimer=0;return;}
        f.lastDir=dir;f.tapTimer=10;
        const spd=f.def.walk*(f.awakened?1.12:1)*((f.restless>0||f.jackpot>0)?1.15:1)* (f.tojiHunt>0?1.18:1);
        f.x+=dir*spd;f.x=clamp(f.x,WALL,ARENA_W-WALL);f.facing=dir>0?1:-1;f.state='WALK';f.walk+=0.22;
      }else{f.state='IDLE';f.walk*=0.9;f.facing=f.opp.x>f.x?1:-1;}
    }
    if(f.tapTimer>0)f.tapTimer--;
    if(inp.up&&f.jumps>0){f.vy=f.def.jump;f.onGround=false;f.jumps--;f.state='JUMP';f.stateFrame=0;SFX.dash();spark(f.x,f.y,8,'#c8d6f0',4,6,16,0.1);}
  }else if(!f.onGround){
    if(inp.light&&f.state!=='ATTACK')startMove(f,'air',f.blackFlashWindow>0);
    else if(inp.heavy&&f.state!=='ATTACK')startMove(f,'heavy',f.blackFlashWindow>0);
    else if(inp.s1&&f.moves.s1&&startMove(f,'s1',false)){}
    else if(inp.s2&&f.moves.s2&&startMove(f,'s2',false)){}
    let dir=0;if(inp.left)dir-=1;if(inp.right)dir+=1;
    if(dir!==0){f.x+=dir*2.0;f.facing=dir>0?1:-1;f.x=clamp(f.x,WALL,ARENA_W-WALL);}
    if(f.state!=='ATTACK')f.state=f.vy<0?'JUMP':'FALL';
  }
  physics(f);f.stateFrame++;
}
function doDash(f,inp,fromCancel){
  if(f.dashCd>0&&!fromCancel)return;
  let dir=f.facing;if(inp&&inp.left)dir=-1;if(inp&&inp.right)dir=1;
  f.state='DASH';f.stateFrame=0;f.dashDir=dir;f.invulnDash=6;f.dashCd=48;f.facing=dir;
  SFX.dash();spark(f.x,f.y,10,'#cfd8ea',4.5,6,18,0.15);
}
function physics(f){
  // If a character walks off a rooftop/branch, immediately re-enter falling state.
  if(f.onGround&&f.y<GROUND-4&&!tojiSupportAt(f.x,f.y))f.onGround=false;
  if(!f.onGround||f.vy<0){
    const prevY=f.y;
    f.vy+=GRAV;f.y+=f.vy;
    let landedPlatform=null;
    if(f.vy>=0){
      for(const p of TOJI_MAP_PLATFORMS){
        if(f.x>=p.x&&f.x<=p.x+p.w&&prevY<=p.y+1&&f.y>=p.y){landedPlatform=p;break;}
      }
    }
    if(landedPlatform){
      f.y=landedPlatform.y;f.vy=0;
      if(!f.onGround){f.onGround=true;f.jumps=2;f.landing=8;spark(f.x,f.y,5,'#8b96ad',3,5,12,0.05);ring(f.x,f.y,'#8b96ad',12,10);}
    }else if(f.y>=GROUND){
      f.y=GROUND;f.vy=0;
      if(!f.onGround){
        f.onGround=true;f.jumps=2;f.landing=8;
        if(f.state==='JUMP'||f.state==='FALL'){f.state=f.move?'ATTACK':'IDLE';if(f.move&&f.move.kind==='air')endMove(f);}
        spark(f.x,GROUND,7,'#8b96ad',3,5,16,0.1);
        ring(f.x,GROUND,'#8b96ad',14,12);
        if(f.hitstun > 20 || Math.abs(f.vx) > 8){
          const dustN = 12;
          for(let i=0;i<dustN;i++){
            const p=pget();
            const dirDust = Math.random()<0.5?-1:1;
            p.active=true;
            p.x=f.x+dirDust*rnd(10,40);
            p.y=GROUND-rnd(0,8);
            p.vx=dirDust*rnd(2,6);
            p.vy=-rnd(0.5,3);
            p.maxLife=p.life=rnd(20,36);
            p.size=rnd(4,9);
            p.color='rgba(90,60,40,0.55)';
            p.grav=0.10;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
          }
          ring(f.x,GROUND,'#c8b0a0',26,18);
          shake(8);
        }
      }
    } else f.onGround=false;
  }
  if(!f.onGround)f.jumps=Math.max(f.jumps,0);
  if(f.vx!==0){f.x+=f.vx;f.vx*=0.90;if(Math.abs(f.vx)<0.15)f.vx=0;}
  f.x=clamp(f.x,WALL,ARENA_W-WALL);
  const o=f.opp;
  if(o&&o.state!=='DEFEAT'){
    const grabbing = (f.id==='heian_sukuna'&&f.move&&f.move.kind==='cleave_seq') || 
                     (o.id==='heian_sukuna'&&o.move&&o.move.kind==='cleave_seq');
    if(grabbing) return;
    const d=Math.abs(f.x-o.x);const min=62;
    if(d<min&&d>0.001){const push=(min-d)/2;const s=sign(f.x-o.x)||1;f.x+=s*push*0.5;o.x-=s*push*0.5;f.x=clamp(f.x,WALL,ARENA_W-WALL);o.x=clamp(o.x,WALL,ARENA_W-WALL);}
  }
}
/* ===== AI ===== */
function aiThink(f){
  const o=f.opp;
  const lvl=f.ai?f.ai.lvl:'normal';
  const dist=Math.abs(o.x-f.x);const dir=sign(o.x-f.x)||1;const hpPct=f.hp/f.maxHp;
  const aggression={easy:0.35,normal:0.55,hard:0.72,expert:0.85}[lvl]||0.55;
  const blockSkill={easy:0.18,normal:0.38,hard:0.62,expert:0.80}[lvl]||0.4;
  const parrySkill={easy:0.02,normal:0.08,hard:0.18,expert:0.30}[lvl]||0.08;
  f.aiTimer--;
  if(f.aiTimer>0){const c=Object.assign({},f.aiCache);c.light=0;c.heavy=0;c.s1=0;c.s2=0;c.s3=0;c.s4=0;c.s5=0;c.ult=0;c.def=0;c.blockPress=0;c.copy=0;c.wcs=0;c.special1=0;c.special2=0;return c;}
  f.aiTimer=rint(4,10);
  if(!f.awakened&&f.meter>=50&&hpPct<0.45&&Math.random()<0.3){f.aiCache=emptyInput();f.aiCache.awaken=1;f.aiTimer=6;return f.aiCache;}
  if(f.def.hasForms&&f.formCd<=0&&Math.random()<0.02){f.aiCache=emptyInput();f.aiCache.form=1;f.aiTimer=10;return f.aiCache;}
  if(f.id==='yuta'&&f.hp<f.maxHp*0.5&&f.energy>=40&&(f.cd.s5||0)<=0&&Math.random()<0.3){f.aiCache=emptyInput();f.aiCache.s5=1;f.aiTimer=rint(20,30);return f.aiCache;}
  if(f.id==='young_gojo'){
    if(f.meter>=75&&(f.cd.x||0)<=0&&dist<520&&Math.random()<0.12){f.aiCache=emptyInput();f.aiCache.special2=1;f.aiTimer=rint(30,48);return f.aiCache;}
    if(f.energy>=26&&(f.cd.s3||0)<=0&&Math.random()<0.08){f.aiCache=emptyInput();f.aiCache.s3=1;f.aiTimer=rint(20,30);return f.aiCache;}
    if(dist<130&&f.energy>=20&&(f.cd.z||0)<=0&&Math.random()<0.22){f.aiCache=emptyInput();f.aiCache.special1=1;f.aiTimer=rint(12,20);return f.aiCache;}
    if(dist>220&&f.energy>=18&&(f.cd.s1||0)<=0&&Math.random()<0.28){f.aiCache=emptyInput();f.aiCache.s1=1;f.aiTimer=rint(18,26);return f.aiCache;}
    if(dist>180&&f.energy>=34&&(f.cd.s5||0)<=0&&Math.random()<0.15){f.aiCache=emptyInput();f.aiCache.s5=1;f.aiTimer=rint(24,40);return f.aiCache;}
  }
  if(f.id==='hakari'){
    const inJackpot=f.jackpot>0;const rolling=f.rollTimer>0;
    if(!rolling&&!inJackpot&&!G.hakariCin){
      if(f.energy>=55&&(f.cd.s3||0)<=0&&dist<300&&Math.random()<0.12){f.aiCache=emptyInput();f.aiCache.s3=1;f.aiTimer=20;return f.aiCache;}
      if(f.energy>=25&&(f.cd.s4||0)<=0&&dist<200&&Math.random()<0.09){f.aiCache=emptyInput();f.aiCache.s4=1;f.aiTimer=18;return f.aiCache;}
      if(f.energy>=26&&(f.cd.s5||0)<=0&&dist<260&&Math.random()<0.06){f.aiCache=emptyInput();f.aiCache.s5=1;f.aiTimer=12;return f.aiCache;}
    }
    if(inJackpot&&dist<200&&Math.random()<0.5){f.aiCache=emptyInput();f.aiCache.ult=1;f.aiTimer=10;return f.aiCache;}
    if(!inJackpot&&f.meter>=100&&dist<220&&Math.random()<0.35){f.aiCache=emptyInput();f.aiCache.ult=1;f.aiTimer=10;return f.aiCache;}
    if(inJackpot){
      if(dist>140){f.aiCache=emptyInput();if(dir>0)f.aiCache.right=1;else f.aiCache.left=1;f.aiTimer=rint(5,10);return f.aiCache;}
      const r=Math.random();
      if(r<0.42){f.aiCache=emptyInput();f.aiCache.light=1;f.aiTimer=rint(4,8);return f.aiCache;}
      if(r<0.68){f.aiCache=emptyInput();f.aiCache.heavy=1;f.aiTimer=rint(10,16);return f.aiCache;}
      if(r<0.86&&(f.cd.s1||0)<=0&&f.energy>=20){f.aiCache=emptyInput();f.aiCache.s1=1;f.aiTimer=rint(12,18);return f.aiCache;}
      if((f.cd.s2||0)<=0&&f.energy>=28){f.aiCache=emptyInput();f.aiCache.s2=1;f.aiTimer=rint(16,24);return f.aiCache;}
      f.aiCache=emptyInput();if(Math.random()<0.5)f.aiCache.left=1;else f.aiCache.right=1;f.aiTimer=rint(6,12);return f.aiCache;
    }
    if(dist>200){f.aiCache=emptyInput();if(dir>0)f.aiCache.right=1;else f.aiCache.left=1;f.aiTimer=rint(8,14);if(Math.random()<0.12)f.aiCache.up=1;return f.aiCache;}
  }
  if(f.id==='heian_sukuna'){
    if(dist>240){f.aiCache=emptyInput();if(dir>0)f.aiCache.right=1;else f.aiCache.left=1;f.aiTimer=rint(6,12);return f.aiCache;}
    if(dist>340){
      if(f.energy>=50&&(f.cd.s3||0)<=0&&Math.random()<0.30){f.aiCache=emptyInput();f.aiCache.s3=1;f.aiTimer=rint(30,50);return f.aiCache;}
      if(f.energy>=12&&(f.cd.s1||0)<=0&&Math.random()<0.50){f.aiCache=emptyInput();f.aiCache.s1=1;f.aiTimer=rint(14,24);return f.aiCache;}
      f.aiCache=emptyInput();if(dir>0)f.aiCache.right=1;else f.aiCache.left=1;f.aiTimer=rint(6,12);return f.aiCache;
    }
    if(dist>180){
      const r=Math.random();
      if(r<0.35&&(f.cd.s5||0)<=0&&f.energy>=28){f.aiCache=emptyInput();f.aiCache.s5=1;f.aiTimer=rint(20,32);return f.aiCache;}
      if(r<0.65&&(f.cd.def||0)<=0&&f.energy>=26){f.aiCache=emptyInput();f.aiCache.def=1;f.aiTimer=rint(16,26);return f.aiCache;}
      f.aiCache=emptyInput();if(dir>0)f.aiCache.right=1;else f.aiCache.left=1;f.aiTimer=rint(6,12);return f.aiCache;
    }
    const r=Math.random();
    if(r<0.35){f.aiCache=emptyInput();f.aiCache.light=1;f.aiTimer=rint(4,8);return f.aiCache;}
    if(r<0.62){f.aiCache=emptyInput();f.aiCache.heavy=1;f.aiTimer=rint(10,16);return f.aiCache;}
    if(r<0.82&&(f.cd.s2||0)<=0&&f.energy>=22){f.aiCache=emptyInput();f.aiCache.s2=1;f.aiTimer=rint(14,22);return f.aiCache;}
    if(f.meter>=100&&Math.random()<0.05){f.aiCache=emptyInput();f.aiCache.ult=1;f.aiTimer=10;return f.aiCache;}
    if(f.energy>=45&&(f.cd.wcs||0)<=0&&Math.random()<0.06){f.aiCache=emptyInput();f.aiCache.wcs=1;f.aiTimer=rint(30,50);return f.aiCache;}
    f.aiCache=emptyInput();if(Math.random()<0.5)f.aiCache.left=1;else f.aiCache.right=1;f.aiTimer=rint(8,16);return f.aiCache;
  }
  if(f.meter>=100&&dist<330&&o.hp>0&&Math.random()<aggression*0.9&&f.id!=='hakari'){f.aiCache=emptyInput();f.aiCache.ult=1;f.aiTimer=8;return f.aiCache;}
  if(o.move&&dist<170&&Math.random()<blockSkill){f.aiCache=emptyInput();f.aiCache.block=1;if(Math.random()<parrySkill)f.aiCache.blockPress=1;f.aiTimer=rint(12,26);return f.aiCache;}
  if(dist<100){
    const r=Math.random();const aggrBoost=(f.jackpot>0)?1.15:1.0;const adjAggr=Math.min(1,aggression*aggrBoost);
    if(r<adjAggr*0.55){f.aiCache=emptyInput();f.aiCache.light=1;f.aiTimer=rint(5,9);return f.aiCache;}
    else if(r<adjAggr*0.8){f.aiCache=emptyInput();f.aiCache.heavy=1;f.aiTimer=rint(12,20);return f.aiCache;}
    else if(r<adjAggr*0.95&&(f.cd.s2||0)<=0&&f.energy>=(f.moves.s2?f.moves.s2.cost:20)){f.aiCache=emptyInput();f.aiCache.s2=1;f.aiTimer=rint(16,26);return f.aiCache;}
    else{f.aiCache=emptyInput();if(Math.random()<0.5)f.aiCache.left=1;else f.aiCache.right=1;f.aiTimer=rint(10,20);return f.aiCache;}
  }
  if(dist<300){
    const r=Math.random();const s1c=f.moves.s1?f.moves.s1.cost:20;const s2c=f.moves.s2?f.moves.s2.cost:25;
    if(r<0.34&&f.energy>=s1c&&(f.cd.s1||0)<=0){f.aiCache=emptyInput();f.aiCache.s1=1;f.aiTimer=rint(16,30);return f.aiCache;}
    if(r<0.44&&f.energy>=s2c&&(f.cd.s2||0)<=0){f.aiCache=emptyInput();f.aiCache.s2=1;f.aiTimer=rint(22,34);return f.aiCache;}
    f.aiCache=emptyInput();if(dir>0)f.aiCache.right=1;else f.aiCache.left=1;f.aiTimer=rint(8,16);if(Math.random()<0.15)f.aiCache.up=1;return f.aiCache;
  }
  const r=Math.random();const s3c=f.moves.s3?f.moves.s3.cost:40;const s1c=f.moves.s1?f.moves.s1.cost:20;
  if(r<0.22&&f.energy>=s3c&&(f.cd.s3||0)<=0&&hpPct>0.3&&f.id!=='hakari'){f.aiCache=emptyInput();f.aiCache.s3=1;f.aiTimer=rint(40,60);return f.aiCache;}
  if(r<0.40&&f.energy>=s1c&&(f.cd.s1||0)<=0){f.aiCache=emptyInput();f.aiCache.s1=1;f.aiTimer=rint(14,26);return f.aiCache;}
  f.aiCache=emptyInput();if(dir>0)f.aiCache.right=1;else f.aiCache.left=1;f.aiTimer=rint(10,20);if(Math.random()<0.10)f.aiCache.up=1;return f.aiCache;
}
/* ===== MAIN STEP ===== */
function step(){
  if(G.paused)return;
  if(G.slowmoTarget>0){if(G.slowmo<G.slowmoTarget)G.slowmo++;else G.slowmoTarget=0;if(G.slowmo>0&&G.frame%3!==0){G.frame++;updateVFX();updateCamera();KP_RESET();return;}if(G.slowmoTarget===0)G.slowmo=Math.max(0,G.slowmo-1);}
  else if(G.slowmo>0)G.slowmo--;
  G.frame++;
  if(G.mode==='menu'){KP_RESET();return;}
  if(G.storyCutscene){updateVFX();updateCamera();if(G.domain)updateDomain();KP_RESET();return;}
  if(G.hitstop>0){G.hitstop--;updateVFX();updateCamera();if(G.clash)updateClash(i1,i2);KP_RESET();return;}
  const f1=G.fighters[0],f2=G.fighters[1];
  const i1=readInput(KEYMAP.p1);let i2;
  if(f2.ai)i2=aiThink(f2);else i2=readInput(KEYMAP.p2);
  if(G.roundState==='intro'){G.roundTimer--;updateCamera();updateVFX();if(G.roundTimer<=0)G.roundState='fight';KP_RESET();return;}
  if(G.roundState==='ko'){G.roundTimer--;updateVFX();updateCamera();if(G.clash)updateClash(i1,i2);if(G.domain)updateDomain();if(G.hakariCin)updateHakariCinematic();if(G.roundTimer<=0)nextRound();KP_RESET();return;}
  if(G.mode==='training'){if(G.training.infHP){f1.hp=f1.maxHp;f2.hp=f2.maxHp;}if(G.training.infEnergy){f1.energy=f1.maxEnergy;f2.energy=f2.maxEnergy;}if(G.training.infUlt){f1.meter=100;f2.meter=100;}}
  if(G.clash){updateClash(i1,i2);updateVFX();updateCamera();KP_RESET();return;}
  updateFighter(f1,i1);updateFighter(f2,i2);
  triggerChapter1Event();
  updateProjectiles();
  if(G.domain)updateDomain();
  handleChapter1ClashResolution();
  if(G.hakariCin)updateHakariCinematic();
  updateVFX();updateCamera();
  if(f1.state==='IDLE')f1.facing=f2.x>f1.x?1:-1;
  if(f2.state==='IDLE')f2.facing=f1.x>f2.x?1:-1;
  updateComboDisplay(f1,f2);
  if(!G.matchOver&&(f1.hp<=0||f2.hp<=0)&&G.roundState==='fight'){
    G.roundState='ko';G.roundTimer=150;
    const loser=f1.hp<=0?f1:f2;const winner=loser===f1?f2:f1;
    winner.wins=(winner.wins||0)+1;winner.state='VICTORY';winner.stateFrame=0;
    flash(0.7,'#ffffff');shake(24);camPunch(0.28);SFX.ko();
    if(G.mode==='timeattack')G.timeAttackResult=(performance.now()-G.timeAttackStart)/1000;
  }
  KP_RESET();
}
function updateComboDisplay(a,b){
  let who=null,cnt=0,dmg=0;
  if(a.comboCount>1&&a.comboTimer>0){who=a;cnt=a.comboCount;dmg=a.comboDamage;}
  if(b.comboCount>1&&b.comboTimer>0){who=b;cnt=b.comboCount;dmg=b.comboDamage;}
  if(who){G.comboDisplay={owner:who.opp,count:cnt,damage:Math.round(dmg),timer:10,pulse:1};}
  if(G.comboDisplay){G.comboDisplay.timer--;G.comboDisplay.pulse=Math.max(0,G.comboDisplay.pulse-0.12);if(G.comboDisplay.timer<=0)G.comboDisplay=null;}
  if(a.comboTimer<=0&&a.comboCount>0){a.comboCount=0;a.comboDamage=0;}
  if(b.comboTimer<=0&&b.comboCount>0){b.comboCount=0;b.comboDamage=0;}
}
function nextRound(){
  if(G.matchOver)return;
  const f1=G.fighters[0],f2=G.fighters[1];
  f1.comboDamage=0;f2.comboDamage=0;
  if(G.mode==='timeattack'||G.mode==='survival'||G.mode==='story'){endMatch();return;}
  if(f1.wins>=2||f2.wins>=2){endMatch();return;}
  G.round++;resetRound();
}
function endMatch(){
  G.matchOver=true;G.hakariCin=null;
  G.winner=G.fighters[0].wins>G.fighters[1].wins?G.fighters[0]:G.fighters[1];
  if(G.fighters[0].wins===G.fighters[1].wins)G.winner=G.fighters[0];
  const p1won=(G.winner===G.fighters[0]);
  if(G.mode==='survival'){setTimeout(()=>{if(p1won){G.survivalRound++;const p1char=G.fighters[0].id;const chars=['gojo','young_gojo','sukuna','yuta','hakari','toji'];const p2char=chars[Math.floor(Math.random()*chars.length)];const r=G.survivalRound;const diff=(r<3)?'easy':(r<6)?'normal':(r<10)?'hard':'expert';showTransition('SURVIVAL','BATTLE '+r+'  —  '+diff.toUpperCase(),800,()=>{startMatch('survival',p1char,p2char,diff);});}else{showResult();}},900);return;}
function launch(mode,p1,p2){
  showScreen(null);
  if(mode==='story'){startChapter1(p1||'gojo');return;}
  if(mode==='survival'){G.survivalRound=1;}
  startMatch(mode,p1,p2,G.difficulty);
}
/* ===== STORY CONTROLLER ===== */
const STORY_CHAPTERS={
  1:{title:'ENCOUNTER',subtitle:'THE STRONGEST MEETS THE KING OF CURSES',
     p1:'gojo',p2:'sukuna',diff:'hard',
     acts:[
       {name:'PROLOGUE',speaker:'GOJO SATORU',text:'So this is the one everyone has been talking about.',tone:'#7fd8ff'},
       {name:'RISING CONFLICT',speaker:'SUKUNA',text:'You came here to test a legend. Do not blink.',tone:'#ff7a7a'},
       {name:'DOMAIN CLASH',speaker:'BOTH',text:'Then let us settle this with our domains.',tone:'#ffd166'},
       {name:'FINAL EXCHANGE',speaker:'GOJO SATORU',text:'No more testing. I am ending this.',tone:'#7fd8ff'},
       {name:'EPILOGUE',speaker:'NARRATOR',text:'The first collision has only opened the door.',tone:'#c9d7ff'}
     ]}
};
function startChapter1(p1Char='gojo'){
  G.story={chapter:1,act:0,phase:0,cutscene:true,clashStarted:false,clashResolved:false,ending:null,checkpoint:0,flags:{clean:false,clashWinner:null}};
  localStorage.setItem('jff_story_ch1_started','1');
  // Build the actual match first, then freeze the combat simulation under the cinematic intro.
  startMatch('story',p1Char,'sukuna','hard');
  G.storyCutscene=true;
  G.story.cutscene=true;
  G.roundState='intro';
  G.roundTimer=999999;
  G.storyIntro={active:true,t:0,phase:0,phaseChanged:-1,taunt:'',tauntWho:'',subtitle:'',introDone:false};
  const gojo=G.fighters[0], sukuna=G.fighters[1];
  // Start both fighters off-camera. Their actual movement is driven by storyIntroTick().
  gojo.x=820;gojo.y=GROUND;gojo.facing=1;gojo.state='WALK';gojo.stateFrame=0;gojo.animT=0;
  sukuna.x=2380;sukuna.y=GROUND;sukuna.facing=-1;sukuna.state='IDLE';sukuna.stateFrame=0;sukuna.animT=0;
  gojo.vx=0;gojo.vy=0;sukuna.vx=0;sukuna.vy=0;
  cam.x=1100;cam.y=430;cam.zoom=1;cam.tx=1100;cam.ty=430;cam.tzoom=1;
  cam.cine=1;cam.cineX=780;cam.cineY=455;cam.cineZoom=1.42;
  flash(1,'#000000');
}
function storyScene(label,who,text,dur,cb){
  G.story.cutscene=true;
  const dlg=document.getElementById('dialogue');
  dlg.querySelector('.who').textContent=who;
  dlg.querySelector('.say').textContent=label+'\n\n'+text;
  dlg.classList.add('on');
  setTimeout(()=>{dlg.classList.remove('on');if(cb)cb();},dur);
}
function storyBattlePause(label,who,text,dur,next){
  G.story.cutscene=true;G.roundState='intro';G.roundTimer=dur/16;
  storyScene(label,who,text,dur,()=>{
    if(G.matchOver)return;
    G.roundState='fight';G.story.cutscene=false;if(next)next();
  });
}
function storyCheckpoint(name){
  if(!G.story)return;
  G.story.checkpoint=G.story.phase;
  localStorage.setItem('jff_story_ch1_checkpoint',String(G.story.checkpoint));
  localStorage.setItem('jff_story_ch1_checkpoint_name',name);
}
function triggerChapter1Event(){
  if(G.mode!=='story'||!G.story||G.story.cutscene||G.matchOver||G.clash)return;
  const f1=G.fighters[0],f2=G.fighters[1];
  if(!f1||!f2)return;
  const p2hp=f2.hp/f2.maxHp;
  const p1hp=f1.hp/f1.maxHp;
  if(G.story.phase===1&&p2hp<=0.72){
    G.story.phase=2;G.story.act=1;storyCheckpoint('RISING_CONFLICT');
    f2.awakened=true;f2.awakenGlow=50;f2.meter=Math.min(100,f2.meter+40);
    flash(0.75,'#ff3344');shake(18);camPunch(0.22);
    storyBattlePause('RISING CONFLICT','SUKUNA','Now you have my attention.',1300);
    return;
  }
  if(G.story.phase===2&&p2hp<=0.45){
    G.story.phase=3;G.story.act=2;storyCheckpoint('DOMAIN CLASH');
    f1.meter=100;f2.meter=100;
    flash(1,'#ffffff');shake(24);camPunch(0.28);
    storyBattlePause('DOMAIN CLASH','BOTH','DOMAIN EXPANSION.',900,()=>{
      if(!G.clash&&!G.matchOver){
        G.story.clashStarted=true;
        triggerClash(f1,f2);
      }
    });
    return;
  }
  if(G.story.phase===4&&p2hp<=0.18){
    G.story.phase=5;G.story.act=3;storyCheckpoint('FINAL EXCHANGE');
    f1.meter=Math.max(f1.meter,100);f1.energy=Math.max(f1.energy,75);
    f2.meter=Math.max(f2.meter,80);
    flash(0.9,'#ffffff');shake(20);camPunch(0.25);
    storyBattlePause('FINAL EXCHANGE','GOJO SATORU','No more testing.',900);
    return;
  }
  if(G.story.phase===5&&p1hp>0&&p1hp<=0.25&&f2.hp>0){
    G.story.flags.clean=false;
  }
}
function handleChapter1ClashResolution(){
  if(!G.story||!G.story.clashStarted||G.story.clashResolved||G.clash)return;
  if(G.story.phase===3){
    G.story.clashResolved=true;G.story.phase=4;G.story.act=3;
    storyCheckpoint('POST_DOMAIN');
    const w=G.clash&&G.clash.winner;
    G.story.flags.clashWinner=w?w.id:'collapse';
  }
}
function showStoryEnding(success){
  const dlg=document.getElementById('dialogue');
  const clean=!!(G.story&&G.story.flags&&G.story.flags.clean);
  let headline='CHAPTER 1 COMPLETE';
  let body='ENCOUNTER CLEARED. The next chapter awaits.';
  if(!success){headline='CHAPTER 1 FAILED';body='The encounter is unfinished. Restart Chapter 1 and try again.';}
  else if(clean){headline='CHAPTER 1 COMPLETE · CLEAN';body='You reached the final exchange without falling below 25% HP.\n\nA special ending flag has been recorded.';}
  else if(G.story&&G.story.flags&&G.story.flags.clashWinner==='gojo'){body='Unlimited Void wins the first great collision.\n\nA hidden route flag has been recorded.';}
  else if(G.story&&G.story.flags&&G.story.flags.clashWinner==='sukuna'){body='Malevolent Shrine survives the clash.\n\nA hidden route flag has been recorded.';}
  dlg.querySelector('.who').textContent=headline;
  dlg.querySelector('.say').textContent=body+'\n\nPress ENTER / SPACE / ESC to return to the menu.';
  dlg.classList.add('on');G.matchOverScreen=true;
  if(success){localStorage.setItem('jff_story_ch1_complete','1');localStorage.setItem('jff_story_unlocked_ch2','1');}
}
  setTimeout(()=>{showResult();},900);
}
/* ===== CAMERA ===== */
function updateCamera(){
  if(G.tojiCineX){const c=G.tojiCineX;if(c.owner&&c.target&&!c.done){const q=tojiCineShot(c);cam.tx=q.x;cam.ty=q.y;cam.tzoom=q.z;cam.x=lerp(cam.x,cam.tx,0.24);cam.y=lerp(cam.y,cam.ty,0.20);cam.zoom=lerp(cam.zoom,cam.tzoom,0.18);}return;}
  /* X has ended. Return to the ordinary combat camera immediately and safely. */
  if(cam.cine>0 && !G.hakariCin && !G.domain && !G.clash){cam.cine=Math.max(0,cam.cine-.12);} 
  if(G.fighters.length<2)return;
  const a=G.fighters[0],b=G.fighters[1];
  const mid=(a.x+b.x)/2;const dist=Math.abs(a.x-b.x);
  let z=1.18-(dist/1500);z=clamp(z,0.68,1.16);z*=1+G.zoomPunch+G.camPunch;
  let tx=mid;let ty=430+Math.min(90,Math.max(0,Math.abs(a.y-GROUND)+Math.abs(b.y-GROUND))*0.28);
  if(cam.cine>0){cam.cine=Math.max(0,cam.cine-0.008);tx=lerp(tx,cam.cineX,cam.cine);ty=lerp(ty,cam.cineY,cam.cine);z=lerp(z,cam.cineZoom,cam.cine);}
  cam.tx=tx;cam.ty=ty;cam.tzoom=z;
  cam.x=lerp(cam.x,cam.tx,0.12);cam.y=lerp(cam.y,cam.ty,0.08);cam.zoom=lerp(cam.zoom,cam.tzoom,0.09);
  const halfW=(W/2)/cam.zoom;if(cam.x-halfW<0)cam.x=halfW;if(cam.x+halfW>ARENA_W)cam.x=ARENA_W-halfW;
}
/* ===== POSE ===== */
function POSE(hipY,shY,headY,headX,lean,armF,armB,legF,legB){return {hipY,shY,headY,headX,lean,armF,armB,legF,legB};}
const IDLE_POSE=POSE(-58,-96,-112,0,0,[78,26],[104,22],[88,6],[94,-6]);
function easeOut(t){return 1-Math.pow(1-t,2.2);}
function easeIn(t){return t*t;}
function lerpPose(A,B,t){const e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;const L=(a,b)=>a+(b-a)*e;return {hipY:L(A.hipY,B.hipY),shY:L(A.shY,B.shY),headY:L(A.headY,B.headY),headX:L(A.headX,B.headX),lean:L(A.lean,B.lean),armF:[L(A.armF[0],B.armF[0]),L(A.armF[1],B.armF[1])],armB:[L(A.armB[0],B.armB[0]),L(A.armB[1],B.armB[1])],legF:[L(A.legF[0],B.legF[0]),L(A.legF[1],B.legF[1])],legB:[L(A.legB[0],B.legB[0]),L(A.legB[1],B.legB[1])]};}
const MOVE_POSES={
  gojo:{light:{wind:POSE(-58,-96,-112,0,-10,[115,48],[98,30],[88,8],[94,-6]),extend:POSE(-62,-100,-118,2,14,[0,-5],[95,25],[94,4],[86,-8]),recover:POSE(-58,-96,-112,0,3,[68,18],[104,22],[88,6],[94,-6])},heavy:{wind:POSE(-54,-94,-108,0,-18,[125,58],[90,25],[92,10],[90,-8]),extend:POSE(-64,-102,-120,2,20,[-8,-8],[100,30],[96,2],[84,-10]),recover:POSE(-58,-96,-112,0,6,[78,22],[104,22],[88,6],[94,-6])},air:{wind:POSE(-62,-96,-112,0,-6,[100,35],[110,25],[80,-30],[120,-20]),extend:POSE(-64,-100,-116,2,10,[40,-40],[105,20],[70,-40],[115,-30]),recover:POSE(-60,-96,-112,0,3,[70,10],[108,22],[88,6],[94,-6])},skill1:{wind:POSE(-60,-98,-116,0,-6,[50,-40],[40,-30],[88,6],[94,-6]),extend:POSE(-62,-100,-118,2,10,[-15,-15],[0,-20],[92,4],[88,-6]),recover:POSE(-58,-96,-112,0,4,[70,15],[80,10],[88,6],[94,-6])},skill2:{wind:POSE(-58,-96,-114,0,-10,[50,-50],[55,-45],[88,6],[94,-6]),extend:POSE(-62,-100,-118,2,16,[-10,-5],[45,15],[92,4],[88,-8]),recover:POSE(-58,-96,-112,0,4,[70,20],[104,22],[88,6],[94,-6])},skill3:{wind:POSE(-58,-98,-116,0,-8,[10,-80],[170,-60],[88,6],[94,-6]),extend:POSE(-62,-100,-120,2,18,[-20,-25],[-15,-30],[94,4],[86,-8]),recover:POSE(-58,-96,-112,0,6,[85,20],[110,25],[88,6],[94,-6])},def:{wind:POSE(-58,-96,-112,0,-4,[-60,-30],[90,20],[88,6],[94,-6]),extend:POSE(-58,-96,-112,0,0,[70,25],[110,22],[88,6],[94,-6]),recover:IDLE_POSE},ult:{wind:POSE(-58,-96,-112,0,-6,[-30,-80],[-30,-80],[88,6],[94,-6]),extend:POSE(-58,-98,-116,0,0,[10,-60],[10,-60],[88,6],[94,-6]),recover:POSE(-58,-96,-112,0,0,[70,25],[100,25],[88,6],[94,-6])}},
  sukuna:{light:{wind:POSE(-58,-96,-112,0,-14,[130,35],[100,25],[88,10],[94,-8]),extend:POSE(-62,-100,-118,2,12,[30,-25],[95,20],[94,4],[86,-10]),recover:POSE(-58,-96,-112,0,3,[75,25],[104,22],[88,6],[94,-6])},heavy:{wind:POSE(-54,-94,-108,0,-22,[150,20],[80,20],[92,10],[90,-10]),extend:POSE(-64,-102,-120,2,25,[-10,-15],[110,25],[96,2],[84,-12]),recover:POSE(-58,-96,-112,0,6,[80,20],[104,22],[88,6],[94,-6])},air:{wind:POSE(-62,-96,-112,0,-6,[120,30],[100,20],[80,-30],[120,-20]),extend:POSE(-64,-100,-116,2,12,[20,-30],[105,22],[70,-40],[115,-30]),recover:POSE(-60,-96,-112,0,3,[75,10],[108,22],[88,6],[94,-6])},skill1:{wind:POSE(-58,-96,-114,0,-6,[60,-40],[95,25],[88,6],[94,-6]),extend:POSE(-60,-98,-116,2,6,[10,-60],[100,25],[92,4],[88,-6]),recover:POSE(-58,-96,-112,0,3,[75,20],[104,22],[88,6],[94,-6])},skill2:{wind:POSE(-58,-96,-114,0,-8,[40,-60],[40,-60],[88,6],[94,-6]),extend:POSE(-62,-100,-118,2,14,[-20,-20],[140,-30],[94,4],[86,-10]),recover:POSE(-58,-96,-112,0,4,[75,20],[104,22],[88,6],[94,-6])},skill3:{wind:POSE(-58,-98,-116,0,-10,[60,-60],[60,-60],[88,6],[94,-6]),extend:POSE(-62,-100,-118,2,16,[10,-20],[15,-15],[94,4],[86,-8]),recover:POSE(-58,-96,-112,0,6,[80,20],[104,22],[88,6],[94,-6])},skill4:{wind:POSE(-58,-96,-114,0,-8,[40,-60],[40,-60],[88,6],[94,-6]),extend:POSE(-62,-100,-118,2,14,[-20,-20],[140,-30],[94,4],[86,-10]),recover:POSE(-58,-96,-112,0,4,[75,20],[104,22],[88,6],[94,-6])},def:{wind:POSE(-58,-96,-114,0,-4,[40,-60],[40,-60],[88,6],[94,-6]),extend:POSE(-58,-96,-114,0,0,[30,-60],[30,-60],[88,6],[94,-6]),recover:IDLE_POSE},ult:{wind:POSE(-58,-96,-114,0,-6,[-20,-70],[30,-60],[88,6],[94,-6]),extend:POSE(-58,-98,-116,0,0,[-45,-20],[100,-30],[88,6],[94,-6]),recover:POSE(-58,-96,-112,0,0,[75,25],[104,22],[88,6],[94,-6])}},
  yuta:{light:{wind:POSE(-58,-96,-114,0,-14,[110,40],[95,25],[88,8],[94,-6]),extend:POSE(-62,-102,-120,2,16,[-5,-15],[90,20],[94,4],[86,-10]),recover:POSE(-58,-96,-112,0,3,[70,20],[104,22],[88,6],[94,-6])},heavy:{wind:POSE(-54,-94,-108,0,-22,[130,55],[90,25],[92,10],[90,-8]),extend:POSE(-64,-104,-122,2,22,[-15,-20],[100,30],[96,2],[84,-12]),recover:POSE(-58,-96,-112,0,6,[78,22],[104,22],[88,6],[94,-6])},air:{wind:POSE(-62,-96,-112,0,-6,[100,35],[110,25],[80,-30],[120,-20]),extend:POSE(-64,-100,-116,2,12,[30,-30],[105,20],[70,-40],[115,-30]),recover:POSE(-60,-96,-112,0,3,[70,10],[108,22],[88,6],[94,-6])},skill1:{wind:POSE(-58,-98,-116,0,-6,[60,-30],[95,25],[88,6],[94,-6]),extend:POSE(-60,-98,-118,2,8,[30,-20],[100,20],[92,4],[88,-6]),recover:POSE(-58,-96,-112,0,4,[70,15],[100,20],[88,6],[94,-6])},skill2:{wind:POSE(-58,-96,-116,0,-6,[60,-50],[60,-50],[88,6],[94,-6]),extend:POSE(-62,-98,-118,2,10,[-20,-30],[130,-20],[94,4],[86,-8]),recover:POSE(-58,-96,-112,0,4,[75,20],[104,22],[88,6],[94,-6])},skill3:{wind:POSE(-58,-96,-114,0,-4,[40,-40],[40,-40],[88,6],[94,-6]),extend:POSE(-58,-96,-114,0,0,[60,30],[110,25],[88,6],[94,-6]),recover:IDLE_POSE},skill4:{wind:POSE(-58,-98,-116,0,-8,[70,-40],[95,25],[88,6],[94,-6]),extend:POSE(-62,-100,-118,2,14,[-10,-20],[60,20],[92,4],[88,-6]),recover:POSE(-58,-96,-112,0,4,[75,20],[104,22],[88,6],[94,-6])},skill5:{wind:POSE(-58,-96,-114,0,-4,[50,-50],[50,-50],[88,6],[94,-6]),extend:POSE(-58,-98,-116,0,0,[65,-40],[65,-40],[88,6],[94,-6]),recover:IDLE_POSE},def:{wind:POSE(-58,-96,-114,0,-4,[40,-60],[40,-60],[88,6],[94,-6]),extend:POSE(-58,-96,-114,0,0,[35,-65],[35,-65],[88,6],[94,-6]),recover:IDLE_POSE},ult:{wind:POSE(-58,-98,-116,0,-6,[-30,-80],[-30,-80],[88,6],[94,-6]),extend:POSE(-62,-100,-120,2,18,[-20,-25],[-15,-30],[94,4],[86,-8]),recover:POSE(-58,-96,-112,0,6,[80,25],[110,25],[88,6],[94,-6])}},
  hakari:{light:{wind:POSE(-58,-96,-112,0,-12,[120,42],[100,28],[88,10],[94,-6]),extend:POSE(-62,-100,-118,2,16,[0,-10],[95,25],[94,4],[86,-8]),recover:POSE(-58,-96,-112,0,3,[72,22],[104,22],[88,6],[94,-6])},heavy:{wind:POSE(-54,-94,-108,0,-20,[140,30],[90,22],[92,10],[90,-10]),extend:POSE(-64,-102,-120,2,22,[-15,-20],[110,28],[96,2],[84,-12]),recover:POSE(-58,-96,-112,0,6,[80,20],[104,22],[88,6],[94,-6])},air:{wind:POSE(-62,-96,-112,0,-6,[110,35],[105,25],[80,-30],[120,-20]),extend:POSE(-64,-100,-116,2,12,[30,-35],[105,22],[70,-40],[115,-30]),recover:POSE(-60,-96,-112,0,3,[75,10],[108,22],[88,6],[94,-6])},skill1:{wind:POSE(-58,-96,-114,0,-14,[125,44],[95,25],[88,8],[94,-6]),extend:POSE(-62,-102,-118,2,20,[-12,-25],[100,25],[94,4],[86,-10]),recover:POSE(-58,-96,-112,0,4,[75,20],[104,22],[88,6],[94,-6])},skill2:{wind:POSE(-54,-94,-110,0,-18,[135,50],[90,25],[92,10],[90,-10]),extend:POSE(-64,-104,-120,2,22,[-15,-25],[110,30],[96,2],[84,-12]),recover:POSE(-58,-96,-112,0,5,[78,22],[104,22],[88,6],[94,-6])},skill3:{wind:POSE(-58,-98,-116,0,-6,[-25,-60],[-25,-60],[88,6],[94,-6]),extend:POSE(-58,-98,-116,0,-2,[15,-70],[15,-70],[88,6],[94,-6]),recover:POSE(-58,-96,-112,0,0,[75,25],[104,22],[88,6],[94,-6])},skill4:{wind:POSE(-58,-96,-114,0,-8,[40,-70],[40,-70],[88,6],[94,-6]),extend:POSE(-58,-98,-118,0,-4,[20,-50],[20,-50],[88,6],[94,-6]),recover:POSE(-58,-96,-112,0,4,[78,22],[104,22],[88,6],[94,-6])},skill5:{wind:POSE(-58,-96,-112,0,-6,[50,-45],[50,-45],[88,6],[94,-6]),extend:POSE(-58,-98,-116,0,0,[65,-40],[65,-40],[88,6],[94,-6]),recover:IDLE_POSE},def:{wind:POSE(-58,-96,-114,0,-4,[40,-60],[40,-60],[88,6],[94,-6]),extend:POSE(-58,-96,-114,0,0,[30,-65],[30,-65],[88,6],[94,-6]),recover:IDLE_POSE},ult:{wind:POSE(-58,-96,-110,0,-14,[140,30],[95,25],[88,10],[94,-8]),extend:POSE(-64,-102,-120,2,22,[-20,-30],[120,30],[96,2],[84,-12]),recover:POSE(-58,-96,-112,0,6,[80,22],[104,22],[88,6],[94,-6])}},
  toji:{
    light:{wind:POSE(-58,-97,-114,0,-18,[108,34],[102,22],[88,8],[94,-7]),extend:POSE(-62,-101,-120,2,24,[-6,-12],[104,26],[96,3],[84,-10]),recover:POSE(-58,-96,-112,0,5,[74,20],[104,22],[88,6],[94,-6])},
    heavy:{wind:POSE(-54,-94,-108,0,-28,[150,20],[92,22],[96,12],[88,-12]),extend:POSE(-66,-105,-123,3,31,[-20,-18],[118,30],[102,0],[80,-14]),recover:POSE(-58,-96,-112,0,7,[80,22],[104,22],[88,6],[94,-6])},
    air:{wind:POSE(-64,-96,-112,0,-12,[118,18],[108,20],[62,-44],[130,-18]),extend:POSE(-68,-103,-120,2,18,[18,-42],[114,18],[54,-58],[124,-30]),recover:POSE(-60,-96,-112,0,4,[74,12],[108,22],[88,6],[94,-6])},
    skill1:{wind:POSE(-62,-101,-120,0,-34,[24,-72],[118,8],[76,18],[108,-18]),extend:POSE(-68,-106,-126,4,18,[8,-18],[126,26],[106,-2],[74,-20]),recover:POSE(-58,-96,-112,0,7,[78,22],[104,22],[88,6],[94,-6])},
    skill2:{wind:POSE(-58,-99,-118,0,-26,[6,-50],[126,-4],[88,10],[96,-12]),extend:POSE(-70,-108,-126,3,38,[-4,-10],[166,-8],[108,0],[72,-18]),recover:POSE(-58,-96,-112,0,6,[76,20],[104,22],[88,6],[94,-6])},
    skill3:{wind:POSE(-60,-102,-120,0,-20,[42,-66],[150,-14],[92,8],[92,-10]),extend:POSE(-66,-105,-124,2,8,[12,-78],[172,-22],[104,2],[82,-12]),recover:POSE(-58,-96,-112,0,6,[80,20],[108,22],[88,6],[94,-6])},
    skill4:{wind:POSE(-58,-100,-118,0,-30,[146,-42],[88,26],[102,8],[78,-8]),extend:POSE(-68,-108,-126,3,34,[-18,-38],[152,34],[108,0],[72,-14]),recover:POSE(-58,-96,-112,0,6,[80,20],[104,22],[88,6],[94,-6])},
    skill5:{wind:POSE(-70,-108,-126,2,-42,[18,-66],[152,-20],[112,0],[70,-18]),extend:POSE(-76,-112,-130,4,-8,[-12,-84],[170,-30],[116,-2],[64,-22]),recover:POSE(-58,-96,-112,0,3,[76,20],[104,22],[88,6],[94,-6])},
    def:{wind:POSE(-58,-96,-114,0,-12,[6,-72],[34,-54],[88,6],[94,-6]),extend:POSE(-58,-97,-114,0,-8,[20,-78],[50,-62],[88,6],[94,-6]),recover:IDLE_POSE},
    ult:{wind:POSE(-68,-106,-124,2,-36,[36,-72],[156,-16],[110,4],[72,-16]),extend:POSE(-76,-114,-132,4,36,[-30,-26],[172,24],[116,-2],[66,-22]),recover:POSE(-58,-96,-112,0,7,[80,22],[104,22],[88,6],[94,-6])}
  },
  heian_sukuna:{
    light:{wind:POSE(-58,-96,-110,0,-14,[130,42],[100,30],[88,10],[94,-8]),extend:POSE(-62,-100,-118,2,18,[10,-8],[95,28],[94,4],[86,-10]),recover:POSE(-58,-96,-112,0,4,[75,22],[104,22],[88,6],[94,-6])},
    heavy:{wind:POSE(-52,-94,-106,0,-24,[155,20],[80,20],[92,12],[88,-12]),extend:POSE(-64,-102,-122,2,26,[-18,-12],[115,30],[96,2],[84,-14]),recover:POSE(-58,-96,-112,0,7,[80,22],[104,22],[88,6],[94,-6])},
    air:{wind:POSE(-62,-96,-112,0,-6,[115,35],[105,25],[80,-30],[120,-20]),extend:POSE(-64,-100,-116,2,14,[25,-35],[105,22],[70,-40],[115,-30]),recover:POSE(-60,-96,-112,0,3,[75,10],[108,22],[88,6],[94,-6])},
    skill1:{wind:POSE(-58,-96,-114,0,-6,[70,-40],[95,25],[88,6],[94,-6]),extend:POSE(-60,-98,-116,2,6,[15,-70],[100,25],[92,4],[88,-6]),recover:POSE(-58,-96,-112,0,3,[75,20],[104,22],[88,6],[94,-6])},
    cleave_seq:{wind:POSE(-58,-96,-110,0,-8,[130,30],[100,25],[88,10],[94,-6]),extend:POSE(-58,-100,-116,2,18,[35,-45],[110,20],[94,4],[86,-8]),recover:POSE(-58,-96,-112,0,4,[78,22],[104,22],[88,6],[94,-6])},
    s3:{wind:POSE(-58,-98,-116,0,-12,[60,-65],[60,-65],[88,6],[94,-6]),extend:POSE(-62,-100,-118,2,18,[10,-25],[15,-20],[94,4],[86,-8]),recover:POSE(-58,-96,-112,0,6,[80,20],[104,22],[88,6],[94,-6])},
    s5:{wind:POSE(-54,-92,-108,0,-22,[170,25],[88,25],[92,10],[90,-10]),extend:POSE(-62,-104,-122,2,24,[25,45],[115,30],[96,2],[84,-12]),recover:POSE(-58,-96,-112,0,6,[85,22],[104,22],[88,6],[94,-6])},
    wcs:{wind:POSE(-58,-94,-108,0,-6,[150,15],[85,15],[88,6],[94,-6]),extend:POSE(-62,-98,-114,2,10,[165,-5],[80,10],[92,4],[88,-6]),recover:POSE(-58,-96,-112,0,6,[80,25],[110,25],[88,6],[94,-6])},
    def:{wind:POSE(-58,-98,-118,0,-10,[-30,-60],[-30,-60],[88,6],[94,-6]),extend:POSE(-62,-102,-120,2,16,[-15,-45],[130,-55],[94,4],[86,-10]),recover:POSE(-58,-96,-112,0,5,[78,22],[104,22],[88,6],[94,-6])},
    ult:{wind:POSE(-58,-96,-112,0,-10,[-30,-70],[-30,-70],[88,6],[94,-6]),extend:POSE(-58,-98,-118,0,-4,[10,-85],[10,-85],[88,6],[94,-6]),recover:POSE(-58,-96,-112,0,6,[80,25],[104,22],[88,6],[94,-6])}
  },
  the_strongest_today:{
    light:{wind:POSE(-58,-96,-110,0,-10,[120,40],[100,26],[88,8],[94,-6]),extend:POSE(-62,-100,-118,2,14,[10,-15],[95,25],[94,4],[86,-8]),recover:POSE(-58,-96,-112,0,3,[72,20],[104,22],[88,6],[94,-6])},
    heavy:{wind:POSE(-54,-94,-108,0,-20,[140,30],[90,22],[92,10],[90,-10]),extend:POSE(-64,-102,-120,2,24,[-15,-18],[110,28],[96,2],[84,-12]),recover:POSE(-58,-96,-112,0,6,[80,22],[104,22],[88,6],[94,-6])},
    air:{wind:POSE(-62,-96,-112,0,-6,[110,35],[105,25],[80,-30],[120,-20]),extend:POSE(-64,-100,-116,2,12,[30,-35],[105,22],[70,-40],[115,-30]),recover:POSE(-60,-96,-112,0,3,[75,10],[108,22],[88,6],[94,-6])},
    skill0:{wind:POSE(-58,-96,-114,0,-8,[70,-40],[70,-30],[88,6],[94,-6]),extend:POSE(-58,-96,-114,0,-4,[30,-20],[80,15],[88,6],[94,-6]),recover:IDLE_POSE},
    skill1:{wind:POSE(-58,-96,-114,0,-6,[60,-50],[60,-50],[88,6],[94,-6]),extend:POSE(-58,-98,-116,0,0,[50,-60],[50,-60],[88,6],[94,-6]),recover:IDLE_POSE},
    skill2:{wind:POSE(-58,-96,-114,0,-6,[50,-50],[50,-50],[88,6],[94,-6]),extend:POSE(-58,-98,-116,0,-2,[40,-55],[40,-55],[88,6],[94,-6]),recover:IDLE_POSE},
    skill3:{wind:POSE(-54,-94,-110,0,-14,[130,30],[100,25],[88,10],[94,-6]),extend:POSE(-64,-102,-120,2,18,[-8,-12],[105,26],[96,2],[84,-10]),recover:POSE(-58,-96,-112,0,5,[78,22],[104,22],[88,6],[94,-6])},
    skill4:{wind:POSE(-58,-98,-116,0,-8,[20,-70],[160,-50],[88,6],[94,-6]),extend:POSE(-62,-100,-118,2,12,[-15,-25],[15,-20],[92,4],[88,-6]),recover:POSE(-58,-96,-112,0,6,[80,22],[104,22],[88,6],[94,-6])},
    skill5:{wind:POSE(-58,-96,-114,0,-4,[-30,-60],[-30,-60],[88,6],[94,-6]),extend:POSE(-58,-98,-118,0,0,[5,-70],[5,-70],[88,6],[94,-6]),recover:POSE(-58,-96,-112,0,4,[75,22],[104,22],[88,6],[94,-6])},
    transform:{wind:POSE(-58,-98,-114,0,-6,[50,-40],[50,-40],[88,6],[94,-6]),extend:POSE(-58,-100,-118,0,-2,[30,-50],[30,-50],[88,6],[94,-6]),recover:POSE(-58,-96,-112,0,0,[75,25],[104,22],[88,6],[94,-6])},
    wcs:{wind:POSE(-58,-96,-114,0,-6,[80,-40],[80,-30],[88,6],[94,-6]),extend:POSE(-58,-98,-116,0,-2,[60,-50],[60,-40],[88,6],[94,-6]),recover:IDLE_POSE},
    def:{wind:POSE(-58,-96,-114,0,-4,[40,-60],[40,-60],[88,6],[94,-6]),extend:POSE(-58,-96,-114,0,0,[30,-65],[30,-65],[88,6],[94,-6]),recover:IDLE_POSE},
    ult:{wind:POSE(-58,-96,-112,0,-8,[-40,-70],[-40,-70],[88,6],[94,-6]),extend:POSE(-58,-98,-116,0,-4,[10,-70],[10,-70],[88,6],[94,-6]),recover:POSE(-58,-96,-112,0,4,[75,25],[104,22],[88,6],[94,-6])}
  }
};
function applyStrongestTechniquePose(P,f){
  if(f.id!=='the_strongest_today'||f.state!=='ATTACK'||!f.move)return false;
  const k=f.move.kind,mf=f.moveFrame,sp=Math.max(1,f.move.startup);
  const u=clamp(mf/sp,0,1), s=Math.sin(f.animT*0.08);
  if(k==='strongest_maxblue'){
    const calm=mf<Math.floor(sp*0.08), extend=mf<Math.floor(sp*0.16), collapse=mf>=Math.floor(sp*0.91);
    P.hipY=-59+s*0.8;P.shY=-96;P.headY=-113;P.headX=2;P.lean=calm?1:0;
    P.armB=[108-s*2,22];
    if(calm)P.armF=[68,28];
    else if(extend){const q=easeOut(clamp((u-0.08)/0.08,0,1));P.armF=[lerp(68,8,q),lerp(28,-12,q)];}
    else if(collapse){const q=clamp((u-0.91)/0.09,0,1);P.armF=[lerp(8,30,q),lerp(-12,4,q)];}
    else P.armF=[8,-12];
    return true;
  }
  if(k==='strongest_maxred'){
    const approach=mf<Math.floor(sp*0.18),gesture=mf>=Math.floor(sp*0.18)&&mf<Math.floor(sp*0.28),release=mf>=Math.floor(sp*0.39)&&mf<Math.floor(sp*0.44),recover=mf>=sp;
    P.hipY=-58+s*0.7;P.shY=-96;P.headY=-113;P.headX=2;P.lean=approach?1:0;
    P.armB=[108-s*2,22];
    if(approach)P.armF=[68,30];
    else if(gesture){const q=easeOut(clamp((mf/sp-0.18)/0.10,0,1));P.armF=[lerp(68,4,q),lerp(30,-6,q)];}
    else if(recover){const q=clamp((mf-sp)/Math.max(1,f.move.recovery),0,1);P.armF=[lerp(4,72,q),lerp(-6,24,q)];}
    else if(release)P.armF=[2,-8];
    else P.armF=[4,-6];
    return true;
  }
  if(k==='strongest_purplechant'){
    const chant=u>=0.23&&u<0.925, convergence=u>=0.57&&u<0.74, release=u>=0.95&&u<0.966, recover=mf>=sp;
    P.hipY=-59+s*0.5;P.shY=-97;P.headY=chant?-116:-113;P.headX=chant?3:1;P.lean=chant?0:-1;
    if(recover){const q=clamp((mf-sp)/Math.max(1,f.move.recovery),0,1);P.armF=[lerp(25,72,q),lerp(-40,24,q)];P.armB=[lerp(145,106,q),lerp(-28,22,q)];}
    else if(convergence){
      const q=(u-0.57)/0.17;P.armF=[lerp(52,28,q),lerp(-38,-54,q)];P.armB=[lerp(132,150,q),lerp(-30,-40,q)];
    }else if(release){P.armF=[20,-48];P.armB=[148,-34];}
    else if(chant){P.armF=[34,-46];P.armB=[142,-30];}
    else {P.armF=[50,-28];P.armB=[128,-22];}
    return true;
  }
  return false;
}
function applyHeianTechniquePose(P,f){
  if(f.id!=='heian_sukuna'||f.state!=='ATTACK'||!f.move)return false;
  const k=f.move.kind,mf=f.moveFrame,sp=Math.max(1,f.move.startup),rc=Math.max(1,f.move.recovery);
  const u=clamp(mf/sp,0,1), pulse=Math.sin(f.animT*0.18);
  if(k==='skill3'){
    /* Fuga: two lower arms form the ignition/arrow hand seal while the upper arms
       stabilize the flame, then all four arms open on release. */
    const charge=clamp(mf/63,0,1);
    P.hipY=-58-Math.sin(charge*Math.PI)*3;
    P.shY=-98;P.headY=-116;P.headX=2;
    if(mf<12){
      P.lean=-8;
      P.armF=[92,-28]; P.armB=[92,-28];
    }else if(mf<28){
      const q=easeOut(clamp((mf-12)/16,0,1));
      P.lean=lerp(-8,-16,q);
      P.armF=[lerp(92,28,q),lerp(-28,-58,q)];
      P.armB=[lerp(92,28,q),lerp(-28,-58,q)];
    }else if(mf<51){
      const q=clamp((mf-28)/23,0,1);
      P.lean=-16-q*5;
      P.armF=[lerp(28,8,q),lerp(-58,-74,q)];
      P.armB=[lerp(28,8,q),lerp(-58,-74,q)];
    }else if(mf<64){
      const q=clamp((mf-51)/13,0,1);
      P.lean=-21+q*10;
      P.armF=[lerp(8,22,q),lerp(-74,-48,q)];
      P.armB=[lerp(8,22,q),lerp(-74,-48,q)];
    }else{
      const q=clamp((mf-sp)/rc,0,1);
      P.lean=lerp(-11,5,q);
      P.armF=[lerp(22,82,q),lerp(-48,24,q)];
      P.armB=[lerp(22,108,q),lerp(-48,22,q)];
    }
    P.legF=[90+pulse*2,8];P.legB=[92-pulse*2,-8];
    return true;
  }
  if(k==='cleave_seq'){
    /* Four-arm execution pose: crouch, seize, then rapid cross-slashes. */
    P.hipY=-58;P.shY=-99;P.headY=-116;P.headX=2;
    if(mf<12){
      const q=easeOut(mf/12);P.lean=lerp(-4,-18,q);
      P.armF=[lerp(72,28,q),lerp(28,-48,q)];
      P.armB=[lerp(104,38,q),lerp(22,-42,q)];
    }else if(mf<30){
      const q=easeOut((mf-12)/18);P.lean=lerp(-18,10,q);
      P.armF=[lerp(28,8,q),lerp(-48,-72,q)];
      P.armB=[lerp(38,150,q),lerp(-42,-18,q)];
    }else if(mf<=94){
      const phase=Math.floor((mf-38)/8)%2;
      const q=(Math.sin((mf-38)*Math.PI/4)+1)*0.5;
      P.lean=phase?14:-10;
      if(phase===0){
        P.armF=[lerp(8,150,q),lerp(-72,18,q)];
        P.armB=[lerp(150,18,q),lerp(-18,-72,q)];
      }else{
        P.armF=[lerp(150,18,q),lerp(18,-72,q)];
        P.armB=[lerp(18,150,q),lerp(-72,18,q)];
      }
    }else{
      const q=clamp((mf-94)/30,0,1);
      P.lean=lerp(18,4,q);
      P.armF=[lerp(18,82,q),lerp(-72,24,q)];
      P.armB=[lerp(150,106,q),lerp(-18,22,q)];
    }
    P.legF=[94+pulse*2,5];P.legB=[88-pulse*2,-8];
    return true;
  }
  return false;
}
function applyYoungGojoTechniquePose(P,f){
  if(f.id!=='young_gojo'||f.state!=='ATTACK'||!f.move)return false;
  const k=f.move.kind,mf=f.moveFrame,mt=f.youngMotionFrame||0;
  if(f.youngMotion==='run'){const s=Math.sin(mt*0.9);P.hipY=-59-Math.abs(s)*3.5;P.shY=-98;P.headY=-116;P.lean=8+s*4;P.armF=[58-s*18,18+Math.abs(s)*10];P.armB=[124+s*18,10];P.legF=[86+s*31,4+Math.max(0,-s)*20];P.legB=[94-s*31,-8+Math.max(0,s)*20];return true;}
  if(f.youngMotion==='dash'){const q=clamp(mt/5,0,1),s=Math.sin(q*Math.PI);P.hipY=-55-s*4;P.shY=-101;P.headY=-119;P.lean=18+s*12;P.armF=[14,-42+s*8];P.armB=[154,-14-s*8];P.legF=[58,-34-s*5];P.legB=[128,-18+s*4];return true;}
  if(f.youngMotion==='blink'){const q=clamp(mt/6,0,1),s=Math.sin(q*Math.PI);P.hipY=-50-s*8;P.shY=-91;P.headY=-112;P.headX=-5+s*10;P.lean=-18+s*44;P.armF=[24-s*18,-30-s*16];P.armB=[142+s*8,2-s*10];P.legF=[66-s*12,22-s*42];P.legB=[120+s*5,-14-s*10];return true;}
  if(k==='young_blue'){const pulse=Math.sin(mf*0.28);P.hipY=-58;P.shY=-98;P.headY=-116;P.lean=mf<22?-16:mf<56?18:-10;P.armF=mf<22?[34,-48-pulse*3]:mf<58?[8,-18]:[22,20];P.armB=mf<22?[126,-14]:[148,-24];P.legF=mf<36?[72,-26]:[88+pulse*12,8];P.legB=mf<36?[120,-8]:[96-pulse*10,-7];return true;}
  if(k==='young_red'){const pulse=Math.sin(mf*0.35);P.hipY=-58;P.shY=-99;P.headY=-117;P.lean=mf<24?-10:mf<45?24:-12;P.armF=mf<24?[34,-38]:mf<42?[4,-8]:[10,-44-pulse*8];P.armB=mf<42?[122,8]:[146,-4];P.legF=mf<38?[66,-20]:[84,10];P.legB=mf<38?[122,-4]:[96,-8];return true;}
  if(k==='young_sixeyes'){const s=Math.sin(mf*0.18);P.hipY=-59+s*2;P.shY=-98;P.headY=-119;P.headX=3+s*2;P.lean=s*2;P.armF=[58+s*14,-12-Math.abs(s)*8];P.armB=[124-s*12,10];P.legF=[88+s*7,4];P.legB=[96-s*7,-5];return true;}
  if(k==='young_limitless'){const s=Math.sin(mf*0.26),q=Math.sin(mf*0.13);P.hipY=-58;P.shY=-98;P.headY=-117;P.lean=-2+q*3;P.armF=[52+s*10,-8-Math.abs(s)*14];P.armB=[130-s*8,8+Math.abs(s)*8];P.legF=[88+s*8,4];P.legB=[94-s*8,-5];return true;}
  if(k==='young_maxblue'){const s=Math.sin(mf*0.3),q=Math.sin(mf*0.14);P.hipY=-58-Math.abs(s)*2;P.shY=-98;P.headY=-117;P.lean=8+q*8;P.armF=mf<76?[38,-42]:[12,-12];P.armB=mf<76?[132,18]:[150,-28];P.legF=[86+s*18,6];P.legB=[96-s*18,-6];return true;}
  if(k==='young_z'){const s=Math.sin(mf*0.55);P.hipY=-56;P.shY=-98;P.headY=-118;P.lean=18+s*10;P.armF=[12,-22-s*14];P.armB=[150,4];P.legF=[62,-34-s*10];P.legB=[126,-16+s*5];return true;}
  if(k==='young_x'){const s=Math.sin(mf*0.16),q=Math.sin(mf*0.09);P.hipY=-59-Math.abs(q)*2;P.shY=-100;P.headY=-120;P.headX=3+s*2;P.lean=5+q*5;P.armF=mf<126?[44,-42-s*6]:mf<198?[18,-52]:[10,-40];P.armB=mf<160?[132,8]:[150,-30];P.legF=[92+s*8,4];P.legB=[90-s*8,-6];return true;}
  if(k==='ult'){const q=clamp(mf/Math.max(1,f.move.startup),0,1);P.hipY=-58;P.shY=-100;P.headY=-121;P.headX=3;P.lean=q<0.7?-4:6;P.armF=q<0.72?[34,-42]:[-12,-54];P.armB=q<0.72?[134,6]:[148,-34];P.legF=[90,5];P.legB=[94,-5];return true;}
  return false;
}
function applyTojiTechniquePose(P,f){
  if(f.id!=='toji'||f.state!=='ATTACK'||!f.move)return false;
  const k=f.moveKey,mf=f.moveFrame;
  const sp=Math.max(1,f.move.startup),ac=Math.max(1,f.move.active),rc=Math.max(1,f.move.recovery);
  const ease=q=>q*q*(3-2*q);
  const phase=(a,b)=>ease(clamp((mf-a)/Math.max(1,b-a),0,1));
  const pulse=Math.sin(mf*0.35);

  /* Movement poses are intentionally distinct from the generic fighter attack pose.
     M1 and Heavy have dedicated silhouettes too. */
  if(k==='light'){
    if(mf<sp){const q=phase(0,sp);P.hipY=-46-7*q;P.shY=-80-10*q;P.headY=-104-12*q;P.lean=-18-12*q;P.armF=[34-18*q,34-60*q];P.armB=[146,16-12*q];P.legF=[56+18*q,42-18*q];P.legB=[128-12*q,-8];}
    else if(mf<14){const q=phase(sp,14);P.hipY=-58-3*q;P.shY=-96;P.headY=-118;P.lean=-30+54*q;P.armF=[8+118*q,-52-10*q];P.armB=[152-54*q,-10+36*q];P.legF=[56+22*q,18-12*q];P.legB=[126-42*q,-10];}
    else if(mf<22){const q=phase(14,22);P.hipY=-58+3*q;P.shY=-97+3*q;P.headY=-119+3*q;P.lean=24-18*q;P.armF=[126-30*q,-54+60*q];P.armB=[76+56*q,18-36*q];P.legF=[80+18*q,10+14*q];P.legB=[112-12*q,-10];}
    else if(mf<30){const q=phase(22,30);P.hipY=-50-3*q;P.shY=-84-5*q;P.headY=-105-6*q;P.lean=6+14*q;P.armF=[58+26*q,-8+18*q];P.armB=[140-20*q,10];P.legF=[76+14*q,50-44*q];P.legB=[118-16*q,-8];}
    else{const q=phase(30,sp+ac+rc);P.hipY=-57;P.shY=-95;P.headY=-116;P.lean=16-12*q;P.armF=[154-84*q,16+4*q];P.armB=[122-18*q,10];P.legF=[92,8];P.legB=[96,-8];}
    return true;
  }
  if(k==='heavy'){
    if(mf<sp){const q=phase(0,sp);P.hipY=-44-8*q;P.shY=-78-12*q;P.headY=-102-14*q;P.lean=-24-18*q;P.armF=[28,-10-66*q];P.armB=[150,16-12*q];P.legF=[56+18*q,46-24*q];P.legB=[130-18*q,-12];}
    else if(mf<24){const q=phase(sp,24);P.hipY=-60;P.shY=-99;P.headY=-121;P.lean=-4+24*q;P.armF=[30+118*q,-54+58*q];P.armB=[148-72*q,-8+34*q];P.legF=[60+24*q,22-16*q];P.legB=[128-44*q,-8];}
    else if(mf<32){const q=phase(24,32);P.hipY=-54+5*q;P.shY=-88+8*q;P.headY=-108+8*q;P.lean=20-138*q;P.armF=[148-20*q,12+82*q];P.armB=[56+36*q,-10-46*q];P.legF=[118-42*q,12+76*q];P.legB=[76+46*q,-10];}
    else if(mf<52){const q=phase(32,52),spin=Math.sin(q*Math.PI);P.hipY=-42-18*spin;P.shY=-58-44*spin;P.headY=-78-62*spin;P.headX=-4-8*spin;P.lean=-118+238*q;P.armF=[34+96*q,-68+118*q];P.armB=[150-102*q,-22+96*q];P.legF=[38+126*q,52-112*q];P.legB=[140-96*q,-18+42*q];}
    else{const q=phase(52,sp+ac+rc);P.hipY=-58;P.shY=-96;P.headY=-114;P.headX=0;P.lean=8-4*q;P.armF=[82,24];P.armB=[126,12];P.legF=[90,8];P.legB=[96,-8];}
    return true;
  }
  if(k==='s1'){
    /* 3 = Split Soul Katana: low draw -> diagonal rise -> low finishing cut. */
    if(mf<sp){
      const q=phase(0,sp);P.hipY=-48-12*q;P.shY=-82-12*q;P.headY=-106-12*q;P.lean=-22-10*q;
      P.armF=[34-42*q,30-92*q];P.armB=[138+16*q,18-22*q];P.legF=[56+24*q,36-18*q];P.legB=[126-18*q,-12];
    }else if(mf<sp+18){
      const q=phase(sp,sp+18);P.hipY=-58-5*q;P.shY=-98-2*q;P.headY=-120;P.lean=-28+52*q;
      P.armF=[-4+156*q,-62-8*q];P.armB=[150-86*q,-20+48*q];P.legF=[58+48*q,18-18*q];P.legB=[126-54*q,-12];
    }else if(mf<sp+46){
      const q=phase(sp+18,sp+46);P.hipY=-60+4*q;P.shY=-101+8*q;P.headY=-123+8*q;P.lean=24-12*q;
      P.armF=[152-112*q,-70+118*q];P.armB=[58+98*q,28-36*q];P.legF=[106-28*q,-2+28*q];P.legB=[76+30*q,-18+18*q];
    }else{
      const q=phase(sp+46,sp+ac+rc);P.hipY=-54+4*q;P.shY=-92+7*q;P.headY=-114+7*q;P.lean=12-26*q;
      P.armF=[42+84*q,48-68*q];P.armB=[142-48*q,16+6*q];P.legF=[64+32*q,30-20*q];P.legB=[122-32*q,-14+12*q];
    }
    return true;
  }

  if(k==='s2'){
    /* 4 = ISOH: low ready -> straight chest thrust -> downward diagonal thrust -> recovery. */
    if(mf<sp){
      const q=phase(0,sp);P.hipY=-44-8*q;P.shY=-84-12*q;P.headY=-107-13*q;P.lean=-18-4*q;
      P.armF=[18,-18-34*q];P.armB=[148,16-12*q];P.legF=[66,34-10*q];P.legB=[126,-10];
    }else if(mf<sp+16){
      const q=phase(sp,sp+16);P.hipY=-58;P.shY=-98;P.headY=-119;P.lean=-5+8*q;
      P.armF=[34+42*q,-18-4*q];P.armB=[142+18*q,2-8*q];P.legF=[70+12*q,8];P.legB=[120-12*q,-10];
    }else if(mf<sp+40){
      const q=phase(sp+16,sp+40);P.hipY=-58-5*q;P.shY=-96-4*q;P.headY=-117-3*q;P.lean=5-12*q;
      P.armF=[76+86*q,-14+48*q];P.armB=[160-32*q,-4+24*q];P.legF=[78+22*q,6+12*q];P.legB=[116-34*q,-8];
    }else if(mf<sp+66){
      const q=phase(sp+40,sp+66);P.hipY=-62-10*q;P.shY=-100-10*q;P.headY=-122-7*q;P.lean=-8+26*q;
      P.armF=[152-74*q,34+58*q];P.armB=[128-38*q,26+14*q];P.legF=[102-18*q,20+38*q];P.legB=[76+24*q,-12];
    }else{
      P.hipY=-58;P.shY=-96;P.headY=-116;P.lean=2;pulse;
      P.armF=[96,30];P.armB=[126,14];P.legF=[88,8];P.legB=[96,-8];
    }
    return true;
  }

  if(k==='s3'){
    /* 5 = Chain: low circular sweep -> side pull -> overhead lash. */
    const q=phase(0,Math.max(ac,70));
    if(mf<22){
      const p=phase(0,22);P.hipY=-38-10*p;P.shY=-70-18*p;P.headY=-92-18*p;P.lean=-34-6*p;
      P.armF=[12+20*p,28+44*p];P.armB=[164-18*p,18+42*p];P.legF=[52+24*p,52-16*p];P.legB=[128-10*p,-6];
    }else if(mf<54){
      const p=phase(22,54);P.hipY=-48-4*p;P.shY=-88-2*p;P.headY=-112;P.lean=-18+32*p;
      P.armF=[30+132*p,52-98*p];P.armB=[158-70*p,60-86*p];P.legF=[56+62*p,34-34*p];P.legB=[128-48*p,-4];
    }else if(mf<92){
      const p=phase(54,92);P.hipY=-54+6*p;P.shY=-92+4*p;P.headY=-116+4*p;P.lean=18-8*p;
      P.armF=[162-126*p,-44+108*p];P.armB=[86+62*p,-22+66*p];P.legF=[118-42*p,12+26*p];P.legB=[72+44*p,-6];
    }else{
      P.hipY=-52;P.shY=-91;P.headY=-114;P.lean=8+q*4;P.armF=[82,34];P.armB=[134,20];P.legF=[92,8];P.legB=[96,-8];
    }
    return true;
  }

  if(k==='s4'){
    /* 6 = Playful Cloud: unique three-stage stance: overhead -> horizontal -> floor sweep. */
    if(mf<sp){
      const q=phase(0,sp);P.hipY=-56-3*q;P.shY=-95-8*q;P.headY=-118-8*q;P.lean=18-16*q;
      P.armF=[116-12*q,-48-34*q];P.armB=[42+18*q,-24-52*q];P.legF=[72+18*q,2];P.legB=[122-22*q,-10];
    }else if(mf<sp+42){
      const p=phase(sp,sp+42);P.hipY=-58+6*p;P.shY=-98+4*p;P.headY=-119+4*p;P.lean=-20+44*p;
      P.armF=[-2+164*p,-70+86*p];P.armB=[150-12*p,-34+70*p];P.legF=[54+64*p,28-22*p];P.legB=[128-46*p,-8+8*p];
    }else if(mf<sp+86){
      const p=phase(sp+42,sp+86);P.hipY=-54+4*p;P.shY=-92+8*p;P.headY=-113+6*p;P.lean=24-52*p;
      P.armF=[154-108*p,16+50*p];P.armB=[62+80*p,24-26*p];P.legF=[122-72*p,8+42*p];P.legB=[72+34*p,-14];
    }else{
      const p=phase(sp+86,sp+ac+rc);P.hipY=-48+8*p;P.shY=-84+10*p;P.headY=-106+9*p;P.lean=-28+20*p;
      P.armF=[18+84*p,46-22*p];P.armB=[150-66*p,24-4*p];P.legF=[52+48*p,40-8*p];P.legB=[126-38*p,-12];
    }
    return true;
  }

  if(k==='s5'){
    /* 7 = Zero Presence: very low profile, then a side-on rear strike, never the usual rising pose. */
    const p=phase(0,Math.max(sp,ac));
    P.hipY=-34-7*Math.sin(p*Math.PI);P.shY=-68-16*Math.sin(p*Math.PI);P.headY=-88-18*Math.sin(p*Math.PI);
    P.headX=-6+18*Math.sin(p*Math.PI);P.lean=-42+64*Math.sin(p*Math.PI);
    P.armF=[8+138*Math.sin(p*Math.PI),28-64*Math.sin(p*Math.PI)];P.armB=[158-20*Math.sin(p*Math.PI),20-8*Math.sin(p*Math.PI)];
    P.legF=[42+86*Math.sin(p*Math.PI),50-38*Math.sin(p*Math.PI)];P.legB=[132-54*Math.sin(p*Math.PI),-6+16*Math.sin(p*Math.PI)];
    return true;
  }

  if(k==='z'){
    /* Z = Predator Step: crouch -> vertical blink -> airborne diagonal descent. */
    if(mf<26){
      const p=phase(0,26);P.hipY=-34-12*p;P.shY=-66-18*p;P.headY=-88-20*p;P.lean=-34-14*p;
      P.armF=[18+8*p,28-18*p];P.armB=[158-8*p,20-6*p];P.legF=[44+10*p,48-22*p];P.legB=[136-8*p,-8];
    }else if(mf<72){
      const p=phase(26,72);P.hipY=-58-18*p;P.shY=-98-30*p;P.headY=-118-34*p;P.lean=18-4*p;
      P.armF=[46+92*p,-34+118*p];P.armB=[148-18*p,-20+30*p];P.legF=[62+16*p,8-76*p];P.legB=[128-14*p,-12-32*p];
    }else if(mf<126){
      const p=phase(72,126);P.hipY=-76+18*p;P.shY=-128+26*p;P.headY=-156+28*p;P.lean=10-26*p;
      P.armF=[138-118*p,86-142*p];P.armB=[128+12*p,18-92*p];P.legF=[118-50*p,-62+112*p];P.legB=[74+30*p,-50+74*p];
    }else{
      P.hipY=-58;P.shY=-96;P.headY=-114;P.lean=4;P.armF=[100,30];P.armB=[128,18];P.legF=[90,8];P.legB=[96,-8];
    }
    return true;
  }

  if(k==='def'){
    /* 8 = weapon guard: compact defensive cross-body silhouette. */
    const p=clamp(mf/Math.max(1,sp),0,1);
    P.hipY=-54;P.shY=-90;P.headY=-112;P.lean=-12+3*p;
    P.armF=[12,-70];P.armB=[36,-58];P.legF=[86,10];P.legB=[98,-8];
    return true;
  }

  if(k==='ult'){
    /* 9 = Cursed Arsenal: the pose changes with each weapon phase instead of using one loop. */
    if(mf<50){
      const p=phase(0,50);P.hipY=-48-8*p;P.shY=-84-14*p;P.headY=-106-16*p;P.lean=-28+18*p;
      P.armF=[24+118*p,-54+8*p];P.armB=[148-60*p,-20+18*p];P.legF=[56+36*p,38-18*p];P.legB=[130-36*p,-10];
    }else if(mf<105){
      const p=phase(50,105);P.hipY=-58;P.shY=-98;P.headY=-120;P.lean=8-4*p;
      P.armF=[42+112*p,-18+22*p];P.armB=[148-16*p,4-18*p];P.legF=[72+22*p,8+6*p];P.legB=[124-28*p,-10];
    }else if(mf<165){
      const p=phase(105,165);P.hipY=-54+10*p;P.shY=-90+8*p;P.headY=-112+7*p;P.lean=22-48*p;
      P.armF=[154-112*p,26+52*p];P.armB=[54+88*p,34-42*p];P.legF=[120-78*p,6+40*p];P.legB=[70+46*p,-12];
    }else if(mf<225){
      const p=phase(165,225);P.hipY=-50-8*p;P.shY=-82-16*p;P.headY=-104-20*p;P.lean=-20+22*p;
      P.armF=[20+142*p,48-112*p];P.armB=[158-56*p,24-30*p];P.legF=[48+70*p,40-28*p];P.legB=[130-54*p,-10+8*p];
    }else{
      const p=phase(225,300);P.hipY=-58+4*p;P.shY=-96+4*p;P.headY=-116+3*p;P.lean=2-8*p;
      P.armF=[126-38*p,12+30*p];P.armB=[80+34*p,18+6*p];P.legF=[96-20*p,6+12*p];P.legB=[78+22*p,-8];
    }
    return true;
  }
  return false;
}

function computePose(f){
  if(G.tojiCineX&&(f===G.tojiCineX.owner||f===G.tojiCineX.target))return tojiCinePose(f,G.tojiCineX.frame,false);
  const st=f.state;
  const P={hipY:-58,shY:-96,headY:-112,headX:0,lean:0,armF:[78,26],armB:[104,22],legF:[88,6],legB:[94,-6]};
  const t=f.animT;
  if(st==='IDLE'||st==='WALK'||st==='CROUCH'||st==='BLOCK'||st==='PARRY'){P.hipY=-58+Math.sin(t*0.08)*1.6;}
  switch(st){
    case 'IDLE':{
      if(f.id==='hakari'){
        const s1=Math.sin(t*0.045),s2=Math.sin(t*0.13),breathe=Math.sin(t*0.07)*1.4,jackpotBoost=(f.jackpot>0)?1.6:1.0;
        P.armF=[74+s1*6*jackpotBoost+s2*2,30+s2*3];P.armB=[100-s1*4*jackpotBoost,24];
        P.hipY=-58+breathe+s2*0.8;P.headY=-112+s1*1.5;P.lean=s1*3;
        P.legF=[88+s1*2,6];P.legB=[94-s1*2,-6];
      } else if(f.id==='heian_sukuna'){
        const s1=Math.sin(t*0.04),s2=Math.sin(t*0.11);
        P.armF=[72+s1*5+s2*2,34+s2*3];P.armB=[102-s1*4,26];
        P.hipY=-58+Math.sin(t*0.06)*1.8;
        P.headY=-112+s1*1.2;
        P.lean=s1*4;
        P.legF=[90+s1*3,8];P.legB=[92-s1*3,-8];
      } else if(f.id==='the_strongest_today'){
        const s1=Math.sin(t*0.06),s2=Math.sin(t*0.14);
        const od=f.overdriveActive?1:0;
        P.armF=[74+s1*5,26+s2*3+od*6];P.armB=[102-s1*4,22];
        P.hipY=-58+Math.sin(t*0.07)*1.6;
        P.headY=-112+s1*1.4;
        P.lean=s1*3;
        P.legF=[88+s1*3,6];P.legB=[94-s1*3,-6];
      } else {
        P.armF=[72+Math.sin(t*0.08)*4,28];P.armB=[108+Math.sin(t*0.08+1)*4,20];
      }      break;
    }
    case 'WALK':{const s=Math.sin(f.walk*1.6);P.legF=[88+s*24,6+Math.max(0,-s)*26];P.legB=[94-s*24,-6+Math.max(0,s)*26];P.armF=[80-s*14,26];P.armB=[100+s*14,22];P.hipY=-58-Math.abs(s)*2;break;}
    case 'CROUCH':{P.hipY=-34;P.shY=-68;P.headY=-84;P.legF=[60,60];P.legB=[120,-60];P.armF=[60,40];P.armB=[110,30];break;}
    case 'JUMP':{P.legF=[62,-46];P.legB=[118,-30];P.armF=[40,-30];P.armB=[130,-20];P.hipY=-62;break;}
    case 'FALL':{P.legF=[100,-14];P.legB=[78,16];P.armF=[56,-10];P.armB=[124,10];break;}
    case 'DASH':{P.lean=22;P.legF=[62,-40];P.legB=[122,-24];P.armF=[20,-40];P.armB=[150,-10];P.hipY=-54;break;}
    case 'ROLL':{P.lean=48;P.legF=[54,-52];P.legB=[122,-16];P.armF=[20,-52];P.armB=[145,-32];P.hipY=-46;break;}
    case 'BURST':{P.lean=34;P.legF=[54,-40];P.legB=[126,-20];P.armF=[-10,-58];P.armB=[170,-38];P.hipY=-50;break;}
    case 'GRAB':{P.lean=-14;P.armF=[20,-8];P.armB=[150,-12];P.legF=[82,8];P.legB=[96,-8];P.hipY=-58;break;}
    case 'GRABBED':{P.lean=-38;P.armF=[148,34];P.armB=[160,22];P.legF=[64,20];P.legB=[116,-10];P.headX=-8;break;}
    case 'BLOCK':case 'PARRY':{P.lean=-8;P.armF=[6,-74];P.armB=[24,-66];P.legF=[84,10];P.legB=[98,-8];P.hipY=-56;break;}
    case 'HITSTUN':{P.lean=-24;P.armF=[130,30];P.armB=[150,20];P.legF=[70,20];P.legB=[110,-10];P.headX=-6;break;}
    case 'BLOCKSTUN':{P.lean=-14;P.armF=[16,-60];P.armB=[30,-54];P.legF=[96,14];P.legB=[84,-12];break;}
    case 'KNOCKBACK':{P.lean=-34;P.armF=[140,40];P.armB=[160,26];P.legF=[56,30];P.legB=[120,-20];break;}
    case 'KNOCKDOWN':case 'WAKEUP':{P.hipY=-20;P.shY=-34;P.headY=-40;P.lean=-70;P.armF=[170,10];P.armB=[150,-10];P.legF=[20,-30];P.legB=[-10,20];break;}
    case 'DEFEAT':{P.hipY=-18;P.shY=-30;P.headY=-36;P.lean=-80;P.armF=[175,4];P.armB=[168,-8];P.legF=[16,-26];P.legB=[-4,18];break;}
    case 'VICTORY':{
      if(f.id==='heian_sukuna'||f.id==='the_strongest_today'){
        const s=Math.sin(t*0.05);
        P.armF=[-70+s*4,-40];P.armB=[130-s*4,-20];
        P.legF=[86,10];P.legB=[96,-10];
        P.hipY=-60+Math.sin(t*0.06)*2;
        P.lean=s*2;
      } else {
        P.armF=[-60,-30];P.armB=[120,-10];P.legF=[86,8];P.legB=[96,-8];P.hipY=-60+Math.sin(t*0.06)*2;
      }
      break;
    }
    case 'TRAPPED':{P.lean=-30;P.armF=[130,50];P.armB=[150,40];P.legF=[70,30];P.legB=[110,-20];P.hipY=-56+Math.sin(t*0.5)*1.5;break;}
    case 'IMMOBILIZED':{P.lean=0;P.armF=[88+Math.sin(t*0.5)*1.5,28];P.armB=[108+Math.sin(t*0.5+1)*1.5,22];P.legF=[88,6];P.legB=[94,-6];break;}
    case 'CLASH':{P.armF=[-40,-70];P.armB=[-40,-70];P.legF=[80,20];P.legB=[100,-20];P.hipY=-60;break;}
    case 'ATTACK':{
      const m=f.move;if(!m)break;
      const mf=f.moveFrame;
      if(applyStrongestTechniquePose(P,f)) break;
      if(applyHeianTechniquePose(P,f)) break;
      if(applyYoungGojoTechniquePose(P,f)) break;
      if(applyTojiTechniquePose(P,f)) break;
      const sp=Math.max(1,m.startup),ac=Math.max(1,m.active),rc=Math.max(1,m.recovery);
      const table=MOVE_POSES[f.id];if(!table)break;
      let poseSet=table[m.kind];
      if(!poseSet){
        if(m.kind==='strongest_shift'||m.kind==='strongest_rct'||m.kind==='strongest_simpledomain'||m.kind==='strongest_spatialcombat'||m.kind==='strongest_closecombat'||m.kind==='strongest_advrct') poseSet=table.skill0;
        else if(m.kind==='strongest_bf') poseSet=table.skill3;
        else if(m.kind==='strongest_transform') poseSet=table.transform;
      }
      if(!poseSet)break;
      let R;
      if(mf<sp){R=lerpPose(IDLE_POSE,poseSet.wind,easeOut((mf/sp)*1.15));}
      else if(mf<sp+ac){const bt=Math.min(1,((mf-sp)/ac)/0.25);R=lerpPose(poseSet.wind,poseSet.extend,easeOut(bt));}
      else{R=lerpPose(poseSet.extend,poseSet.recover,easeIn((mf-sp-ac)/rc));}
      P.hipY=R.hipY;P.shY=R.shY;P.headY=R.headY;P.headX=R.headX;P.lean=R.lean;
      P.armF=R.armF;P.armB=R.armB;P.legF=R.legF;P.legB=R.legB;
      break;
    }
  }
  applyCharacterIdentityPose(P,f);
  if(f.facing<0){
    P.armF=[180-P.armF[0],-P.armF[1]];P.armB=[180-P.armB[0],-P.armB[1]];
    P.legF=[180-P.legF[0],-P.legF[1]];P.legB=[180-P.legB[0],-P.legB[1]];
  }
  return P;
}