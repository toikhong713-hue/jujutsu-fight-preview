'use strict';
/* ===== COPY SYSTEM (Yuta) ===== */
function pickCopyableSkill(opp){
  const pool=[];
  const candidates=['s1','s2','s3','s4','s5'];
  for(const k of candidates){
    const m=opp.moves[k];if(!m)continue;
    if(m.kind==='ult'||m.kind==='def')continue;
    if(m.heal&&!m.hitbox&&!m.projectile&&!m.spawnRika)continue;
    if(m.doCopy&&!m.hitbox&&!m.projectile)continue;
    if(m.doJackpot&&!m.hitbox&&!m.projectile)continue;
    if(m.buff&&!m.hitbox&&!m.projectile)continue;
    pool.push({key:k,move:m});
  }
  if(pool.length===0)return null;
  return pool[Math.floor(Math.random()*pool.length)];
}
function performCopy(f){
  const opp=f.opp;const pick=pickCopyableSkill(opp);
  SFX.copy();flash(0.5,'#c9a6ff');vfxCopySwirl(f.x,f.y-70,30);ring(f.x,f.y-60,'#c9a6ff',60,32);
  if(!pick){floatText(f.x,f.y-170,'NO TARGET','#a080c0',18,50);f.copiedTech=null;return;}
  f.copiedTech={name:pick.move.name,key:pick.key,kind:pick.move.kind,damage:pick.move.damage||pick.move.projectile?.damage||12,hitstun:pick.move.hitstun||pick.move.projectile?.hitstun||20,blockstun:pick.move.blockstun||pick.move.projectile?.blockstun||12,kbx:pick.move.kbx||pick.move.projectile?.kbx||4,kby:pick.move.kby||pick.move.projectile?.kby||0,hitbox:pick.move.hitbox||{x:40,y:-100,w:120,h:120},projectile:pick.move.projectile?Object.assign({},pick.move.projectile):null,spawnRika:pick.move.spawnRika||null,multiHit:pick.move.multiHit||false,hitInterval:pick.move.hitInterval||6,color:'#c9a6ff',sourceChar:opp.id};
  floatText(f.x,f.y-180,'COPIED: '+pick.move.name.slice(0,18),'#c9a6ff',18,70);
}
function useCopiedTechnique(f){
  if(!f.copiedTech)return false;
  if(f.state!=='IDLE'&&f.state!=='WALK'&&f.state!=='CROUCH')return false;
  if(f.energy<15)return false;
  f.energy-=15;
  const ct=f.copiedTech;
  const dynMove={name:ct.name,kind:'skill2',startup:16,active:8,recovery:22,damage:ct.damage,hitstun:ct.hitstun,blockstun:ct.blockstun,kbx:ct.kbx,kby:ct.kby,hitbox:ct.projectile?null:ct.hitbox,projectile:ct.projectile?Object.assign({},ct.projectile,{type:'copied'}):null,spawnRika:ct.spawnRika,multiHit:ct.multiHit,hitInterval:ct.hitInterval,hitstop:8,meter:6,aura:'copy',cost:0,cd:0};
  f.moves.__copied=dynMove;
  const ok=startMove(f,'__copied',false);
  if(ok){SFX.copy();flash(0.4,'#c9a6ff');vfxShockwave(f.x+f.facing*50,f.y-90,'#c9a6ff',70,26);floatText(f.x,f.y-160,ct.name.slice(0,20),'#e0d0ff',16,50);}
  return ok;
}
/* ===== PROJECTILES ===== */
function spawnProjectile(f,pd,offX,offY){
  const dir=f.facing;
  const pr={x:f.x+offX*dir,y:f.y+offY,vx:pd.speed*dir,vy:0,w:pd.w,h:pd.h,damage:pd.damage,hitstun:pd.hitstun,blockstun:pd.blockstun||10,kbx:pd.kbx,kby:pd.kby,life:pd.life,type:pd.type,owner:f,hitstop:pd.hitstop||6,armorBreak:!!pd.armorBreak,spawnPillar:!!pd.spawnPillar,pull:!!pd.pull,pillarH:pd.pillarH||280,pillarDur:pd.pillarDur||70,spatial:!!pd.spatial,hit:false,rot:0,t:0};
  G.projectiles.push(pr);return pr;
}
function updateProjectiles(){
  for(let i=G.projectiles.length-1;i>=0;i--){
    const p=G.projectiles[i];
    p.t++;p.x+=p.vx;p.y+=p.vy;p.rot+=0.1;
    if(p.type==='purple'&&p.t%2===0)spark(p.x,p.y,1,'#c07bff',1.2,7,16,0,'circle');
    if(p.type==='dismantle'&&p.t%2===0)spark(p.x,p.y,1,'#ff8090',1.2,7,16,0,'circle');
    if(p.type==='dismantle_heian'&&p.t%2===0)spark(p.x,p.y,2,'#ff5566',1.6,8,18,0,'bolt');
    if(p.type==='toji_chain'&&p.t%2===0){spark(p.x,p.y,2,'#66ffbe',1.5,7,18,0,'circle');}
    if(p.type==='rika'&&p.t%2===0)spark(p.x,p.y,1,'#e0d0ff',1.5,8,18,0,'circle');
    if(p.type==='strongest_purple'){
      if(p.t%2===0)spark(p.x,p.y,2,'#c07bff',1.4,8,18,0,'circle');
      if(p.t%3===0){const q=pget();q.active=true;q.x=p.x-p.vx*1.5;q.y=p.y+rnd(-12,12);q.vx=-p.vx*0.15;q.vy=-rnd(0.5,1.5);q.maxLife=q.life=rnd(16,30);q.size=rnd(3,6);q.color=Math.random()<0.5?'#c07bff':'#e0d0ff';q.grav=-0.02;q.shape='circle';q.rot=0;q.vr=0;q.add=true;}
    }
    if(p.type==='strongest_maxred'){
      if(p.t%2===0)spark(p.x,p.y,3,'#ff5570',2.4,9,18,0,'circle');
      if(p.t%3===0){const q=pget();q.active=true;q.x=p.x-p.vx*1.6;q.y=p.y+rnd(-16,16);q.vx=-p.vx*0.15;q.vy=rnd(-0.8,0.8);q.maxLife=q.life=rnd(16,30);q.size=rnd(3,7);q.color=Math.random()<0.5?'#ff2244':'#ffb0bb';q.grav=0;q.shape='circle';q.rot=0;q.vr=0;q.add=true;}
    }
    if(p.type==='fuga'){
      if(p.t%2===0){const cols=['#ff8822','#ffaa33','#ff5511','#ffdd66'];spark(p.x,p.y,2,cols[(p.t/2|0)%4],2.2,8,20,0,'circle');}
      if(p.t%3===0){const q=pget();q.active=true;q.x=p.x-p.vx*1.5;q.y=p.y+rnd(-10,10);q.vx=-p.vx*0.15+rnd(-0.4,0.4);q.vy=-rnd(0.5,1.8);q.maxLife=q.life=rnd(20,40);q.size=rnd(3,7);q.color=Math.random()<0.5?'#ff7722':'#ffcc66';q.grav=-0.02;q.shape='circle';q.rot=0;q.vr=0;q.add=true;}
    }
    if(p.type==='heianfuga'){
      if(p.t%2===0){const cols=['#ff2211','#ff4422','#ff6633','#ffdd66'];spark(p.x,p.y,3,cols[(p.t/2|0)%4],3.2,11,24,0,'circle');}
      if(p.t%3===0){const q=pget();q.active=true;q.x=p.x-p.vx*1.8;q.y=p.y+rnd(-12,12);q.vx=-p.vx*0.18+rnd(-0.6,0.6);q.vy=-rnd(0.6,2.2);q.maxLife=q.life=rnd(22,48);q.size=rnd(5,10);q.color=Math.random()<0.5?'#ff3322':'#ffaa44';q.grav=-0.02;q.shape='circle';q.rot=0;q.vr=0;q.add=true;}
      if(p.t%2===1){const q=pget();q.active=true;q.x=p.x+rnd(-p.w*0.3,p.w*0.3);q.y=p.y+rnd(-p.h*0.4,p.h*0.4);q.vx=rnd(-1.5,1.5);q.vy=-rnd(0.5,2);q.maxLife=q.life=rnd(12,24);q.size=rnd(3,6);q.color=Math.random()<0.5?'#ffdd66':'#ffffff';q.grav=-0.03;q.shape='circle';q.rot=0;q.vr=0;q.add=true;}
    }
    if(p.type==='beam'){
      if(p.t%2===0){for(let i=0;i<2;i++){const q=pget();q.active=true;q.x=p.x-p.w*0.5+Math.random()*p.w*0.55;q.y=p.y-p.h*0.42+Math.random()*p.h*0.84;q.vx=rnd(-2,2);q.vy=rnd(-1,1);q.maxLife=q.life=rnd(8,16);q.size=rnd(2,5);q.color=Math.random()<0.5?'#e0d0ff':'#ffffff';q.grav=0;q.shape='circle';q.rot=0;q.vr=0;q.add=true;}}
    }
    if(p.type==='wcs'){
      if(p.t%2===0){
        for(let i=0;i<3;i++){
          const q=pget();
          const perpA = rnd(-Math.PI, Math.PI);
          const offR = rnd(20, 70);
          q.active=true;
          q.x = p.x + Math.cos(perpA)*offR*0.4;
          q.y = p.y + Math.sin(perpA)*offR;
          q.vx = Math.cos(perpA)*rnd(0.4,1.6);
          q.vy = Math.sin(perpA)*rnd(0.4,1.6);
          q.maxLife=q.life=rnd(10,20);
          q.size=rnd(2,4);
          q.color = Math.random()<0.4?'#ffffff':(Math.random()<0.75?'#ff4455':'#ff8899');
          q.grav=0; q.shape='bolt';
          q.rot = perpA;
          q.vr = 0;
          q.add = true;
        }
      }
      if(p.t%3===0){
        const q=pget();
        q.active=true;
        q.x = p.x + rnd(-p.w*0.4, p.w*0.4);
        q.y = p.y + rnd(-12, 12);
        q.vx = 0; q.vy = 0;
        q.maxLife=q.life = rnd(4, 10);
        q.size = rnd(6, 14);
        q.color = 'rgba(255,255,255,0.45)';
        q.grav = 0; q.shape = 'circle'; q.rot = 0; q.vr = 0; q.add = true;
      }
    }
    p.life--;
    const target=p.owner.opp;
    const hb={x:p.x-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h};
    const hurt=getHurtbox(target);
    if(!p.hit&&aabb(hb,hurt)){
      const res=resolveHit(p.owner,target,{damage:p.damage,hitstun:p.hitstun,blockstun:p.blockstun,kbx:p.kbx,kby:p.kby,hitstop:p.hitstop,armorBreak:p.armorBreak,kind:'projectile',type:'projectile',meter:6,pull:!!p.pull},p.x,p.y);
      if(res!=='whiff'){
        p.hit=true;p.life=0;
        if(p.spawnPillar){const hx=(p.x+target.x)/2;spawnFirePillar(hx,p.owner);}
        if(p.type==='beam'){vfxBeamImpact(p.x,p.y);flash(0.6,'#ffffff');shake(20);camPunch(0.28);}
        if(p.type==='strongest_maxred'){
          vfxShockwave(p.x,p.y,'#ff2244',110,24);vfxShockwave(p.x,p.y,'#ff9aaa',72,18);
          burst(p.x,p.y,26,'#ff5566',13,13,28);
          for(let k=0;k<14;k++){const a=Math.random()*6.28;strongestParticle(p.x,p.y,Math.cos(a)*rnd(3,9),Math.sin(a)*rnd(2,7)-1,'#ff8899',rnd(2,5),rnd(14,26),0.08,'circle');}
          flash(0.48,'#ff334f');shake(18);camPunch(0.22);SFX.red();
        }
        if(p.type==='wcs'){
          const facing = Math.sign(p.vx) || 1;
          spawnWCSScar(p.x, p.y, facing);
          vfxShockwave(p.x,p.y,'#ff4455',180,40);
          vfxShockwave(p.x,p.y,'#ffffff',130,32);
          ctx.save();
          ctx.globalCompositeOperation='lighter';
          ctx.strokeStyle='rgba(255,255,255,0.95)';
          ctx.lineWidth=3;
          ctx.beginPath();
          ctx.moveTo(p.x-140,p.y);
          ctx.lineTo(p.x+140,p.y);
          ctx.stroke();
          ctx.strokeStyle='rgba(255,80,110,0.85)';
          ctx.lineWidth=6;
          ctx.beginPath();
          ctx.moveTo(p.x-140,p.y);
          ctx.lineTo(p.x+140,p.y);
          ctx.stroke();
          ctx.restore();
          flash(0.7,'#ffffff');shake(28);camPunch(0.30);
          G.hitstop=Math.max(G.hitstop,20);
          G.slowmoTarget=Math.max(G.slowmoTarget,14);
        }
        if(p.type==='dismantle_heian'){vfxHeianDismantle(p.x,p.y,Math.sign(p.vx)||1);}
        if(p.type==='strongest_purple'){
          vfxShockwave(p.x,p.y,'#c07bff',140,30);
          vfxShockwave(p.x,p.y,'#ffffff',100,26);
          burst(p.x,p.y,26,'#c07bff',12,12,32);
          burst(p.x,p.y,12,'#ffffff',8,10,26);
          flash(0.65,'#c07bff');
          shake(18);camPunch(0.22);
          G.hitstop=Math.max(G.hitstop,12);
        }
        if(p.type==='heianfuga'){
          vfxHeianFugaImpact(p.x,p.y);
          flash(0.9,'#ffffff');
          shake(26);camPunch(0.30);
          G.hitstop=Math.max(G.hitstop,16);
          G.slowmoTarget=Math.max(G.slowmoTarget,18);
          SFX.heianfugaImpact();
          for(let i=0;i<24;i++){
            const a=Math.random()*6.28;
            const q=pget();
            q.active=true;
            q.x=p.x+rnd(-80,80);
            q.y=GROUND-rnd(0,100);
            q.vx=Math.cos(a)*rnd(0.5,2.5);
            q.vy=-rnd(0.5,2.5);
            q.maxLife=q.life=rnd(30,70);
            q.size=rnd(2,5);
            q.color=Math.random()<0.5?'#ff8833':'#ff3322';
            q.grav=-0.02;q.shape='circle';q.rot=0;q.vr=0;q.add=true;
          }
        }
      }
    }
    if(p.life<=0){
      if(p.type==='purple'){burst(p.x,p.y,24,'#c07bff',7,14,26);ring(p.x,p.y,'#c07bff',40,24);shake(10);flash(0.4,'#c07bff');}
      if(p.type==='rika'){burst(p.x,p.y,16,'#e0d0ff',6,12,22);ring(p.x,p.y,'#c9a6ff',34,20);}
      if(p.type==='fuga'&&!p.hit){burst(p.x,p.y,10,'#ff8833',5,10,20);}
      if(p.type==='heianfuga'&&!p.hit){burst(p.x,p.y,12,'#ff3322',6,11,22);}
      if(p.type==='beam'){burst(p.x,p.y,14,'#c9a6ff',6,14,26);ring(p.x,p.y,'#e0d0ff',46,22);}
      if(p.type==='wcs'){
        if(!p.hit){
          const facing = Math.sign(p.vx) || 1;
          spawnWCSScar(p.x, p.y, facing);
          burst(p.x,p.y,10,'#ff5566',5,10,20);
        }
      }
      if(p.type==='strongest_purple'){
        if(!p.hit){burst(p.x,p.y,12,'#c07bff',5,10,20);}
      }
      G.projectiles.splice(i,1);
    }
  }
}
/* ===== BOXES ===== */
function getHurtbox(f){
  let w=46,h=112,oy=-112;
  if(f.state==='CROUCH'){h=74;oy=-74;w=52;}
  if(f.state==='KNOCKDOWN'||f.state==='WAKEUP'){h=44;oy=-44;w=86;}
  if(f.state==='DASH'){w=54;h=100;oy=-100;}
  return {x:f.x-w/2,y:f.y+oy,w,h};
}
function getHitboxWorld(f,hb){const x=f.facing>0?f.x+hb.x:f.x-hb.x-hb.w;return {x,y:f.y+hb.y,w:hb.w,h:hb.h};}
/* ===== COMBAT ===== */
function canBlockAgainst(defender){
  if(defender.state==='BLOCK')return true;
  if(defender.state==='BLOCKSTUN')return true;
  if(defender.state==='IDLE'||defender.state==='WALK'||defender.state==='CROUCH')return defender.blocking;
  return false;
}
function resolveHit(attacker,defender,mv,hx,hy){
  if(defender.invuln>0&&!mv.armorBreak)return 'whiff';
  const dirToAtt=sign(attacker.x-defender.x)||1;
  const facingAtt=(defender.facing===dirToAtt);
  if(defender.id==='young_gojo'&&defender.youngInfinity>0&&!mv.armorBreak){
    G.flash=Math.max(G.flash,0.14);G.flashColor='#8fdcff';
    ring(defender.x+defender.facing*38,defender.y-60,'#8fdcff',22,18);
    spark(defender.x+defender.facing*38,defender.y-60,7,'#d7f7ff',3.5,6,15,0);
    vfxDeflectSparks(defender.x+defender.facing*42,defender.y-64,defender.facing,10);
    SFX.block();attacker.vx=-attacker.facing*2.4;defender.meter=Math.min(defender.maxMeter,defender.meter+2);
    floatText(defender.x,defender.y-136,'LIMITLESS','#bfe8ff',15,38);
    return 'infinity';
  }
  if(defender.id==='gojo'&&defender.infinity>0&&mv.type!=='projectile'&&mv.kind!=='ult'&&!mv.armorBreak){
    G.flash=Math.max(G.flash,0.18);G.flashColor='#7fd8ff';
    ring(defender.x+defender.facing*40,defender.y-60,'#7fd8ff',26,20);
    spark(defender.x+defender.facing*40,defender.y-60,10,'#7fd8ff',4,7,18,0);
    vfxDeflectSparks(defender.x+defender.facing*45,defender.y-65,defender.facing,14);
    SFX.block();attacker.vx=-attacker.facing*3;
    defender.meter=Math.min(defender.maxMeter,defender.meter+3);
    floatText(defender.x,defender.y-140,'INFINITY','#7fd8ff',16,44);
    return 'infinity';
  }
  if(defender.guardArmor>0&&!mv.armorBreak){
    defender.guardArmor=0;defender.guardCounter=22;
    G.hitstop=Math.max(G.hitstop,10);
    const gc=defender.id==='yuta'?'#c9a6ff':(defender.id==='hakari'?'#ffd166':(defender.id==='the_strongest_today'?'#00e5ff':'#ff5566'));
    flash(0.4,gc);shake(12);camPunch(0.12);SFX.parry();
    ring(defender.x,defender.y-60,gc,30,26);
    floatText(defender.x,defender.y-150,'GUARD',gc,18,50);
    return 'armor';
  }
  if(defender.parry>0&&facingAtt){
    defender.parry=0;defender.state='IDLE';defender.stateFrame=0;
    defender.meter=Math.min(defender.maxMeter,defender.meter+12+Math.min(6,defender.comboCount));
    defender.energy=Math.min(defender.maxEnergy,defender.energy+15);
    floatText(defender.x,defender.y-184,'JUST DEFENSE +12','#ffe066',14,42);
    G.hitstop=Math.max(G.hitstop,14);
    flash(0.55,'#ffffff');shake(10);camPunch(0.16);SFX.parry();
    ring(defender.x+dirToAtt*20,defender.y-70,'#ffffff',24,26);
    spark(defender.x+dirToAtt*20,defender.y-70,16,'#ffe9a8',6,8,24,0);
    floatText(defender.x,defender.y-160,'PARRY!','#ffe066',22,55);
    if(attacker.move){attacker.moveFrame=Math.max(attacker.moveFrame,(attacker.move.startup||0)+(attacker.move.active||0)+6);}
    return 'parry';
  }
  const blocked=canBlockAgainst(defender)&&facingAtt&&!mv.armorBreak;
  /* V26 REBUILT YOUNG GOJO COUNTER: only consumes a genuine incoming hit. */
  const redCounterReady=defender.id==='young_gojo'&&defender.awakened&&defender.youngRedCounterReady&&
    defender.youngRedCounterState&&defender.youngRedCounterState.phase==='armed'&&
    !defender.youngRedCounterTriggered&&!blocked&&defender.parry<=0&&defender.guardArmor<=0;
  if(redCounterReady){
    defender.youngRedCounterTriggered=true;
    defender.youngRedCounterAttacker=attacker;
    defender.youngRedCounterHitFrame=G.frame;
    defender.youngRedCounterReady=false;
    defender.youngRedCounterState.phase='vanish';
    defender.youngRedCounterState.t=0;
    defender.youngRedCounterState.target=attacker;
    defender.youngRedCounterState.originX=defender.x;
    defender.youngRedCounterState.originY=defender.y;
    defender.state='YOUNG_RED_COUNTER';
    defender.stateFrame=0;
    defender.invuln=Math.max(defender.invuln,70);
    attacker.vx=0;attacker.vy=0;
    attacker.state='HITSTUN';attacker.stateFrame=0;attacker.hitstun=Math.max(attacker.hitstun||0,18);
    if(attacker.move){attacker.moveFrame=Math.max(attacker.moveFrame,(attacker.move.startup||0)+(attacker.move.active||0)+4);}
    G.hitstop=Math.max(G.hitstop,8);flash(.20,'#ffe7ed');shake(8);camPunch(.12);SFX.red();
    ring(defender.x,defender.y-72,'#ff6f8d',34,18);
    return 'red_counter';
  }
  if(blocked){
    const chip=Math.max(1,Math.round(mv.damage*0.13));
    defender.hp-=chip;defender.blockstun=mv.blockstun||10;
    defender.state='BLOCKSTUN';defender.stateFrame=0;
    defender.vx=(mv.kbx||2)*0.3*(attacker.x>defender.x?-1:1);
    defender.meter=Math.min(defender.maxMeter,defender.meter+(mv.meter||4)*0.5);
    defender.energy=Math.min(defender.maxEnergy,defender.energy+2);
    G.hitstop=Math.max(G.hitstop,Math.min(6,mv.hitstop||5));
    shake(3);SFX.block();
    spark(hx,hy,8,'#9fd8ff',4,6,16,0,'circle');
    ring(hx,hy,'#9fd8ff',14,14);
    floatText(hx,hy-20,'BLOCK','#9fd8ff',13,32);
    return 'block';
  }
  let dmg=mv.damage;
  const scaling=Math.max(0.32,1-0.055*defender.comboCount);
  dmg*=scaling;
  if(attacker.copied>0)dmg*=attacker.copiedMult||1;
  if(attacker.jackpot>0)dmg*=1.25;
  if(attacker.restless>0)dmg*=1.20;
  /* TOJI BALANCE PASS: keep the character lethal without letting every confirm delete a full HP bar. */
  if(attacker.id==='toji')dmg*=0.78;
  if(attacker.tojiHunt>0)dmg*=1.05;
  if(attacker.id==='young_gojo'&&attacker.youngSixEyes>0)dmg*=1.06;
  let bf=false;
  if(attacker.blackFlash&&mv.type!=='projectile'){bf=true;dmg*=1.65;attacker.blackFlash=false;}
  dmg=Math.max(1,Math.round(dmg));
  defender.hp-=dmg;defender.hitstun=mv.hitstun||14;
  if(mv.pull){attacker.x=clamp(defender.x-attacker.facing*86,WALL,ARENA_W-WALL);attacker.vx=0;ring(defender.x,defender.y-72,'#66ffbe',36,22);floatText(defender.x,defender.y-150,'CHAINED','#7dffca',16,42);}
  defender.state='HITSTUN';defender.stateFrame=0;defender.move=null;
  const kdir=attacker.x>defender.x?-1:1;
  defender.vx=(mv.kbx||3)*kdir*0.9;
  if(mv.kby)defender.vy=mv.kby;
  if(mv.kby&&mv.kby<-3)defender.onGround=false;
  defender.comboCount++;defender.comboTimer=100;attacker.comboDamage+=dmg;
  attacker.meter=Math.min(attacker.maxMeter,attacker.meter+(mv.meter||5)*(bf?1.6:1));
  defender.meter=Math.min(defender.maxMeter,defender.meter+dmg*0.35);
  attacker.energy=Math.min(attacker.maxEnergy,attacker.energy+3);
  const hs=(mv.hitstop||6)*(bf?2.55:((mv.damage||0)>15?1.25:1));
  G.hitstop=Math.max(G.hitstop,Math.min(28,Math.round(hs)));
  shake(bf?20:((mv.damage||0)>15?12:5));camPunch(bf?0.24:((mv.damage||0)>15?0.14:0.05));
  combatFeelImpact(hx,hy,mv,bf);
  if(bf){G.slowmoTarget=Math.max(G.slowmoTarget,10);}
  SFX.hit(clamp(dmg/25,0,1.4));  const sparkCol = bf ? '#ff2b4a' : ({gojo:'#8fe4ff',young_gojo:'#bfeeff',yuta:'#e0d0ff',hakari:'#ffd166',toji:'#66ffbe',heian_sukuna:'#ff4455',the_strongest_today:'#00e5ff'}[attacker.id] || '#ff9aa6');
  spark(hx,hy,bf?26:12,sparkCol,bf?9:6,bf?9:6,bf?26:18,0.15,'circle');
  ring(hx,hy,sparkCol,bf?34:18,bf?24:16);
  if(attacker.id==='hakari'&&attacker.jackpot>0){for(let i=0;i<6;i++){const p=pget();const a=Math.random()*6.28;p.active=true;p.x=hx;p.y=hy;p.vx=Math.cos(a)*rnd(3,7);p.vy=Math.sin(a)*rnd(3,7)-2;p.maxLife=p.life=rnd(14,26);p.size=rnd(2,4);p.color=Math.random()<0.5?'#ffd166':'#ffffff';p.grav=0.05;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
  if(bf){
    flash(0.75,'#ff1133');shake(24);camPunch(0.28);SFX.blackflash();
    floatText(hx,hy-40,'BLACK FLASH','#ff3355',26,60);
    for(let i=0;i<18;i++){const p=pget();const a=Math.random()*6.28;p.active=true;p.x=hx;p.y=hy;p.vx=Math.cos(a)*rnd(3,11);p.vy=Math.sin(a)*rnd(3,11);p.maxLife=p.life=rnd(14,26);p.size=rnd(4,10);p.color=i%2?'#ff2244':'#120008';p.grav=0;p.shape='bolt';p.rot=a;p.vr=rnd(-0.2,0.2);p.add=true;}
  }else{flash(0.16,'#ffffff');}
  if(mv.type!=='projectile')attacker.blackFlashWindow=8;
  defender.hitFlash=8;
  return 'hit';
}
/* ===== MOVES ===== */
function moveDuration(m){
  if(m.duration)return m.duration;
  if(m.kind==='def')return m.startup+m.recovery;
  if(m.kind==='ult'&&m.domain)return m.startup+m.recovery;
  return m.startup+m.active+m.recovery;
}
/* ===== PHASE 1 CORE MECHANICS ===== */
function tryGrab(f){
  if(!f.onGround||f.state==='DEFEAT'||f.state==='HITSTUN'||f.state==='BLOCKSTUN'||f.state==='KNOCKDOWN'||f.state==='GRABBED'||f.state==='BURST'||f.grabCooldown>0)return false;
  const o=f.opp;
  if(!o||o.state==='DEFEAT')return false;
  const dist=Math.abs(o.x-f.x);
  if(dist>82||Math.abs((o.y-58)-(f.y-58))>96)return false;
  /* Throw-tech: a defender who also grabs inside the 6-frame tech window wins a neutral reset. */
  if(o.state==='GRAB'&&o.grabTarget===f&&o.stateFrame<=6){resolveThrowTech(f,o);return true;}
  if(f.state==='GRAB')return false;
  f.state='GRAB';f.stateFrame=0;f.grabTimer=14;f.grabTarget=o;f.move=null;f.moveKey=null;f.blocking=false;
  o.state='GRABBED';o.stateFrame=0;o.grabber=f;o.grabTimer=14;o.move=null;o.moveKey=null;o.hitstun=0;o.blockstun=0;o.blocking=false;o.invuln=0;
  f.facing=o.x>=f.x?1:-1;
  f.grabCooldown=12;o.grabCooldown=12;
  SFX.grab();camPunch(0.08);floatText(f.x,f.y-180,'GRAB','#ffd166',18,42);return true;
}
function resolveThrowTech(a,b){
  const aa=a,bb=b;aa.grabTarget=null;bb.grabTarget=null;aa.grabber=null;bb.grabber=null;
  aa.state='KNOCKBACK';bb.state='KNOCKBACK';aa.stateFrame=0;bb.stateFrame=0;aa.vx=-aa.facing*7;bb.vx=bb.facing*7;aa.vy=-4;bb.vy=-4;aa.onGround=false;bb.onGround=false;
  aa.meter=Math.min(aa.maxMeter,aa.meter+4);bb.meter=Math.min(bb.maxMeter,bb.meter+4);aa.grabCooldown=14;bb.grabCooldown=14;
  G.hitstop=Math.max(G.hitstop,8);shake(8);camPunch(0.12);flash(0.24,'#ffd166');SFX.throwTech();ring((aa.x+bb.x)/2,(aa.y+bb.y)/2-60,'#ffd166',48,22);floatText((aa.x+bb.x)/2,(aa.y+bb.y)/2-130,'THROW TECH!','#ffd166',22,54);
}
function performThrow(f){
  const o=f.grabTarget;if(!o)return;
  f.grabTarget=null;o.grabber=null;o.grabTarget=null;
  const dir=f.facing||sign(o.x-f.x)||1;
  const hx=f.x+dir*54,hy=f.y-74;
  const dmg=16;const oldHp=o.hp;o.hp=Math.max(0,o.hp-dmg);o.hitFlash=8;o.state='KNOCKDOWN';o.stateFrame=0;o.vx=dir*10;o.vy=-7;o.onGround=false;o.hitstun=0;o.blockstun=0;o.invuln=0;o.comboTimer=80;o.comboCount=0;
  f.meter=Math.min(f.maxMeter,f.meter+8);f.energy=Math.min(f.maxEnergy,f.energy+3);f.grabCooldown=20;o.grabCooldown=20;f.hasHit=true;
  G.hitstop=Math.max(G.hitstop,10);shake(12);camPunch(0.16);flash(0.30,'#ffd166');SFX.cleaveThrow();burst(hx,hy,16,'#ffd166',5,10,22);ring(hx,hy,'#ffd166',34,20);floatText(hx,hy-30,'THROW','#ffd166',18,44);
  if(o.hp<=0&&oldHp>0){o.hp=0;o.state='DEFEAT';}
}
function updateGrabState(f){
  const o=f.grabTarget;
  if(!o){f.state='IDLE';f.stateFrame=0;return;}
  f.stateFrame++;
  const dir=f.facing||1;
  o.x=clamp(f.x+dir*54,WALL,ARENA_W-WALL);o.y=f.y;o.vx=0;o.vy=0;o.onGround=true;
  o.state='GRABBED';o.stateFrame=f.stateFrame;o.grabber=f;
  if(f.stateFrame===5){SFX.grab();ring(o.x,o.y-62,'#ffd166',22,14);}
  if(f.stateFrame===9){burst(f.x+dir*48,f.y-78,10,'#ffd166',4,8,18);}
  if(f.stateFrame===12)performThrow(f);
  if(f.stateFrame>=20&&f.state==='GRAB'){f.state='IDLE';f.stateFrame=0;}
}
function doWakeupRoll(f){
  const dir=f.opp&&f.opp.x>=f.x?1:-1;
  f.state='ROLL';f.stateFrame=0;f.rollInvuln=18;f.invuln=Math.max(f.invuln,18);
  f.rollDir=dir;f.rollDistance=0;f.vx=0;f.vy=-0.8;f.onGround=false;f.blocking=false;
  SFX.roll();burst(f.x,f.y-36,14,'#cfe7ff',4,9,20);ring(f.x,f.y-42,'#9fd8ff',26,14);floatText(f.x,f.y-150,'ROLL','#9fd8ff',16,38);
}
function doBurst(f){
  if(f.meter<50||f.burstCooldown>0)return false;
  f.meter-=50;f.burstCooldown=90;f.hitstun=0;f.blockstun=0;f.state='BURST';f.stateFrame=0;f.burstTimer=16;f.invuln=Math.max(f.invuln,16);f.move=null;f.moveKey=null;f.grabTarget=null;
  const o=f.opp;const dir=o?sign(f.x-o.x)||1:-(f.facing||1);f.vx=dir*8;f.vy=-5;f.onGround=false;f.comboCount=0;f.comboTimer=0;
  G.hitstop=Math.max(G.hitstop,12);shake(16);camPunch(0.22);flash(0.5,'#ffffff');SFX.burst();ring(f.x,f.y-65,'#ffffff',40,24);burst(f.x,f.y-65,28,'#ffffff',10,16,34);floatText(f.x,f.y-185,'BURST!','#ffffff',28,56);
  return true;
}
function doGuardCancel(f){
  if(f.meter<25||f.guardCancelCooldown>0||!f.moves.heavy)return false;
  f.meter-=25;f.guardCancelCooldown=42;f.blockstun=0;f.blocking=false;f.parry=0;f.invuln=Math.max(f.invuln,8);
  if(!startMove(f,'heavy',false))return false;
  f.moveFrame=-1;G.hitstop=Math.max(G.hitstop,6);camPunch(0.12);SFX.guardCancel();floatText(f.x,f.y-180,'GUARD CANCEL','#9fd8ff',18,46);ring(f.x,f.y-70,'#9fd8ff',28,18);return true;
}
function startMove(f,key,isBF){
  const m=f.moves[key];
  if(!m)return false;
  if(m.cost>0&&f.energy<m.cost)return false;
  if(m.cd>0&&(f.cd[key]||0)>0)return false;
  const infE=G.mode==='training'&&G.training.infEnergy;
  const noCd=G.mode==='training'&&G.training.noCd;
  if(m.cost>0&&!infE)f.energy-=m.cost;
  if(m.cd>0&&!noCd)f.cd[key]=m.cd;
  f.state='ATTACK';
  f.move=m;f.moveKey=key;f.moveFrame=0;
  /* V26: awakened Young Gojo's Red Counter is no longer a normal move. */
  if(f.id==='young_gojo'&&key==='z'&&f.awakened){
    f.youngRedCounterState=null;
    f.youngRedCounterReady=false;
    f.youngRedCounterTriggered=false;
    f.youngRedCounterHidden=false;
    f.youngRedCounterInverted=false;
    f.youngRedCounterAngle=0;
    f.youngRedCounterAttacker=null;
  }
  /* Toji M1 is a click-by-click weapon choreography, not one auto-combo. */
  if(f.id==='toji'&&key==='light'){
    const m1Dur=[180,42,38,34,46][Math.max(0,Math.min(4,f.tojiM1Step||0))];
    f.tojiMoveDuration=m1Dur;
  }else f.tojiMoveDuration=0;
  f.hasHit=false;f.spawned=false;
  f.blackFlash=!!isBF&&!!f.blackFlashWindow;
  if(f.blackFlash)f.blackFlashWindow=0;
  f.stateFrame=0;
  f.delayedHitPending=0;f.delayedHitData=null;
  f.delayedHitFired=false;
  if(m.invuln)f.invuln=Math.max(f.invuln,m.invuln);
  if(m.kind==='ult'){
    f.ultStart=G.frame;f.domainCharge=0;
    if(!(f.id==='hakari'&&f.jackpot>0))f.meter=0;
    if(f.id==='heian_sukuna')SFX.heiandomain();else SFX.domain();
  }
  if(m.kind==='skill1'||m.kind==='skill2'||m.kind==='skill3'||m.kind==='skill4'||m.kind==='skill5'||m.kind==='wcs')SFX.skill();
  if(m.kind==='light'||m.kind==='air')SFX.light();
  if(m.kind==='heavy')SFX.heavy();
  return true;
}
/* === THREE EDITABLE STRONGEST SKILLS ONLY === */
function getStrongestSkillPoint(f){
    const o=f.opp;
    const dist=o?Math.abs(o.x-f.x):9999;
    const x=dist<620?o.x:f.x+f.facing*300;
    const y=dist<620?o.y-58:f.y-72;
    return {x:clamp(x,WALL+40,ARENA_W-WALL-40),y};
  }
function strongestParticle(x,y,vx,vy,color,size,life,grav=0,shape='circle'){
    const p=pget();p.active=true;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.maxLife=p.life=life;p.size=size;p.color=color;p.grav=grav;p.shape=shape;p.rot=0;p.vr=0;p.add=true;return p;
  }
function updateStrongestMaxBlue(f,m){
    const t=f.moveFrame, u=clamp(t/m.startup,0,1);
    if(t===1){
      f.maxBlueState={target:getStrongestSkillPoint(f),didCollapseHit:false};
      SFX.blue();
    }
    const s=f.maxBlueState||{target:getStrongestSkillPoint(f),didCollapseHit:false};
    const cx=s.target.x,cy=s.target.y;
    let strength=0;
    if(u<0.09)strength=0;
    else if(u<0.16)strength=(u-0.09)/0.07*0.18;
    else if(u<0.27)strength=0.18+(u-0.16)/0.11*0.25;
    else if(u<0.42)strength=0.43+(u-0.27)/0.15*0.27;
    else if(u<0.58)strength=0.70+(u-0.42)/0.16*0.20;
    else if(u<0.76)strength=0.90;
    else if(u<0.91)strength=0.90+(u-0.76)/0.15*0.10;
    else strength=Math.max(0,1-(u-0.91)/0.09);
    if(t===Math.floor(m.startup*0.09)){
      ring(cx,cy,'#5ab8ff',24,24);vfxShockwave(cx,cy,'#5ab8ff',34,18);flash(0.18,'#5ab8ff');
    }
    if(t>=Math.floor(m.startup*0.16)&&t<=Math.floor(m.startup*0.91)){
      const pullRange=300+strength*170;
      const o=f.opp;
      if(o&&o.state!=='DEFEAT'){
        const ox=o.x,oy=o.y-58,dx=cx-ox,dy=cy-oy,dist=Math.hypot(dx,dy);
        if(dist>4&&dist<pullRange){
          const force=(0.55+strength*2.7)*(1-dist/pullRange);
          o.vx+=dx/dist*force;
          if(!o.onGround)o.vy+=dy/dist*force*0.42;
          else if(Math.abs(dy)>42&&u>0.72)o.vy+=dy/dist*force*0.10;
        }
      }
      if(G.frame%2===0){
        const a=Math.random()*6.28;
        const r=110+Math.random()*180*(1-strength*0.25);
        const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r*0.68;
        const sp=1.8+strength*4.2;
        strongestParticle(px,py,-Math.cos(a)*sp,-Math.sin(a)*sp,'#5ab8ff',2.2+strength*2.2,12+Math.random()*16,0,'circle');
      }
      if(G.frame%5===0){
        const a=Math.random()*6.28;const r=80+Math.random()*120;
        strongestParticle(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.62,-Math.cos(a)*(1+strength*2.5),-Math.sin(a)*(1+strength*2.5),'#80d8ff',2,14+Math.random()*12,0,'bolt');
      }
    }
    if(t===Math.floor(m.startup*0.27)||t===Math.floor(m.startup*0.43)||t===Math.floor(m.startup*0.59)){
      vfxDistortion(cx,cy,f.facing,140+strength*100,110+strength*80);
    }
    if(t>=Math.floor(m.startup*0.42)&&t<=Math.floor(m.startup*0.76)&&G.frame%5===0){
      ring(cx,cy,'#5ab8ff',60+strength*65,18);
    }
    if(t===Math.floor(m.startup*0.76)){
      SFX.blue();floatText(cx,cy-48,'MAXIMUM OUTPUT: BLUE','#80d8ff',18,55);shake(8);camPunch(0.08);
    }
    if(t>=Math.floor(m.startup*0.91)&&t<=m.startup){
      if(G.frame%2===0) vfxShockwave(cx,cy,'#9be4ff',80+strength*90,12);
      if(t===m.startup&&!s.didCollapseHit){
        s.didCollapseHit=true;flash(0.65,'#d8f4ff');shake(14);camPunch(0.16);G.hitstop=Math.max(G.hitstop,10);
        const o=f.opp; if(o&&Math.hypot(cx-o.x,cy-(o.y-58))<125){
          resolveHit(f,o,{damage:36,hitstun:34,blockstun:20,kbx:9,kby:-6,hitstop:14,armorBreak:true,kind:'skill1',type:'melee',meter:8},cx,cy);
          o.vx+=(cx-o.x)*0.02;
        }
        vfxShockwave(cx,cy,'#e8f8ff',120,24);burst(cx,cy,28,'#c7efff',11,12,28);SFX.blue();
      }
    }
    if(t>m.startup){
      if(G.frame%3===0) ring(cx,cy,'#5ab8ff',28+(m.startup+m.recovery-t)*1.8,10);
    }
  }
function updateStrongestMaxRed(f,m){
    const t=f.moveFrame,u=clamp(t/m.startup,0,1);
    if(t===1){f.maxRedState={released:false};SFX.red();}
    const s=f.maxRedState||{released:false};
    const palmX=f.x+f.facing*54,palmY=f.y-86;
    if(u<0.18){
      if(G.frame%4===0) ring(palmX,palmY,'#ff5570',20+u*50,14);
    }else if(u<0.28){
      if(G.frame%3===0) strongestParticle(palmX+f.facing*rnd(0,18),palmY+rnd(-16,16),-f.facing*rnd(0.5,1.4),rnd(-0.5,0.5),'#ff6b7d',2.5,16,0,'circle');
      if(t===Math.floor(m.startup*0.24)) flash(0.22,'#ff4455');
    }else if(u<0.39){
      ring(palmX,palmY,'#ff2244',40,15);
    }else if(u<0.43){
      if(!s.released){
        s.released=true;
        const pr=spawnProjectile(f,{type:'strongest_maxred',damage:44,hitstun:42,blockstun:24,kbx:44,kby:-11,speed:20,w:92,h:74,life:90,hitstop:18,armorBreak:true},64,-88);
        pr.maxRedRelease=true;
        flash(0.24,'#ff334f');camPunch(0.10);SFX.red();
      }
    }else if(u<0.90){
      /* projectile is now handled by the existing projectile system */
      if(!s.released)s.released=true;
    }
    if(t===Math.floor(m.startup*0.30))floatText(f.x,f.y-176,'MAXIMUM OUTPUT: RED','#ff6b7d',18,55);
    if(t===m.startup&&s.released){SFX.red();}
  }
function updateStrongestPurpleChant(f,m){
    const t=f.moveFrame,u=clamp(t/m.startup,0,1);
    if(t===1){
      const center={x:f.x+f.facing*150,y:f.y-88};
      f.purpleChantState={center,blue:{x:center.x-f.facing*62,y:center.y-12},red:{x:center.x+f.facing*62,y:center.y+8},didDamage:false};
      SFX.purple();
    }
    const s=f.purpleChantState||{center:{x:f.x+f.facing*150,y:f.y-88},blue:{x:f.x+f.facing*88,y:f.y-100},red:{x:f.x+f.facing*212,y:f.y-80},didDamage:false};
    const blue=s.blue,red=s.red,c=s.center;
    if(u<0.06){
      /* silent preparation */
    }else if(u<0.13){
      if(G.frame%3===0){vfxDistortion(blue.x,blue.y,f.facing,80,70);}
    }else if(u<0.18){
      if(G.frame%3===0){ring(red.x,red.y,'#ff2244',22,16);strongestParticle(red.x+rnd(-16,16),red.y+rnd(-12,12),f.facing*rnd(0.3,1.0),rnd(-0.7,0.7),'#ff6070',2.4,16,0,'circle');}
    }else if(u<0.23){
      if(G.frame%4===0){vfxShockwave(c.x,c.y,'#c07bff',34,18);}
      floatText(f.x,f.y-178,'CHANTING...','#d7c2ff',16,40);
    }else if(u<0.34){
      if(G.frame%4===0)floatText(f.x,f.y-188,'∞','#9eeaff',20,26);
      if(G.frame%2===0){
        strongestParticle(blue.x+rnd(-20,20),blue.y+rnd(-14,14),-f.facing*rnd(0.5,1.5),rnd(-0.6,0.6),'#5ab8ff',2.2,18,0,'circle');
        strongestParticle(red.x+rnd(-20,20),red.y+rnd(-14,14), f.facing*rnd(0.5,1.5),rnd(-0.6,0.6),'#ff5566',2.2,18,0,'circle');
      }
    }else if(u<0.43){
      if(G.frame%3===0)vfxDistortion(blue.x,blue.y,f.facing,120,90);
    }else if(u<0.50){
      if(G.frame%2===0)ring(blue.x,blue.y,'#5ab8ff',28,16);
    }else if(u<0.57){
      if(G.frame%2===0)ring(red.x,red.y,'#ff2244',30,16);
    }else if(u<0.65){
      const k=(u-0.57)/0.08;
      const bx=lerp(blue.x,c.x-f.facing*10,k),by=lerp(blue.y,c.y,k);
      const rx=lerp(red.x,c.x+f.facing*10,k),ry=lerp(red.y,c.y,k);
      if(G.frame%2===0){
        vfxDistortion(bx,by,f.facing,70,60);vfxDistortion(rx,ry,-f.facing,70,60);
      }
      if(G.frame%3===0){ring(bx,by,'#5ab8ff',24,13);ring(rx,ry,'#ff2244',24,13);}
    }else if(u<0.68){
      vfxShockwave(c.x,c.y,'#d6a8ff',58,14);ring(c.x,c.y,'#ffffff',34,14);
    }else if(u<0.74){
      if(G.frame%2===0){
        ring(c.x,c.y,'#c07bff',38+u*18,16);
        strongestParticle(c.x+rnd(-24,24),c.y+rnd(-20,20),rnd(-1,1),rnd(-1,1),'#e4cfff',3,16,0,'circle');
      }
    }else if(u<0.81){
      if(G.frame%2===0)vfxShockwave(c.x,c.y,'#c07bff',70,18);
    }else if(u<0.86){
      if(G.frame%3===0)ring(c.x,c.y,'#c07bff',84,18);
    }else if(u<0.90){
      if(G.frame%2===0)vfxShockwave(c.x,c.y,'#b56bff',110,16);
    }else if(u<0.925){
      if(t===Math.floor(m.startup*0.905))floatText(f.x,f.y-184,'FINAL CHANT','#e6d8ff',18,44);
    }else if(u<0.95){
      if(G.frame%2===0){ring(c.x,c.y,'#ffffff',100,14);strongestParticle(c.x+rnd(-36,36),c.y+rnd(-30,30),rnd(-1.8,1.8),rnd(-1.8,1.8),'#c07bff',3,14,0,'circle');}
    }else if(u<0.966){
      if(!s.released){
        s.released=true;
        flash(0.95,'#eadcff');shake(26);camPunch(0.34);G.hitstop=Math.max(G.hitstop,16);SFX.purple();
        vfxShockwave(c.x,c.y,'#ffffff',140,22);vfxShockwave(c.x,c.y,'#c07bff',180,30);burst(c.x,c.y,36,'#c07bff',15,17,36);
      }
    }else{
      const blastT=clamp((u-0.966)/0.034,0,1),radius=55+blastT*430;
      if(G.frame%2===0){ring(c.x,c.y,'#c07bff',radius,10);ring(c.x,c.y,'#ffffff',Math.max(28,radius*0.62),8);}
      if(G.frame%2===0){
        for(let i=0;i<3;i++){
          const a=Math.random()*6.28,sp=2.5+blastT*5.5;
          strongestParticle(c.x,c.y,Math.cos(a)*sp,Math.sin(a)*sp,'#c07bff',2.5+blastT*3,10+Math.random()*8,0.03,'circle');
        }
      }
      const o=f.opp;
      if(o&&!s.didDamage){
        const dx=o.x-c.x,dy=(o.y-58)-c.y,dist=Math.hypot(dx,dy);
        if(dist<=radius+52){
          s.didDamage=true;
          const res=resolveHit(f,o,{damage:76,hitstun:60,blockstun:34,kbx:12,kby:-12,hitstop:24,armorBreak:true,kind:'skill2',type:'melee',meter:14},o.x,o.y-58);
          if(res!=='whiff'){
            const d=Math.max(1,Math.hypot(dx,dy));
            o.vx=(dx/d)*24;o.vy=(dy/d)*19;
            o.onGround=false;
          }
        }
      }
      if(blastT>0.45&&G.frame%4===0){
        for(let i=0;i<4;i++){
          const a=Math.random()*6.28;strongestParticle(c.x+Math.cos(a)*radius*0.8,c.y+Math.sin(a)*radius*0.45,Math.cos(a)*2.6,Math.sin(a)*1.8-0.4,'#e7d9ff',2.5,18,0.04,'bolt');
        }
      }
    }
    /* The source model has no literal fingers or lips, so use controlled pose/VFX cues rather than exact copied dialogue. */
  }
function tojiSeqHit(f,key,damage,hb,opts={}){
  if(!f.opp||f.opp.state==='DEFEAT')return false;
  f.tojiSeqHits=f.tojiSeqHits||{};
  if(f.tojiSeqHits[key])return false;
  const o=f.opp, box=getHitboxWorld(f,hb), hurt=getHurtbox(o);
  if(!aabb(box,hurt))return false;
  f.tojiSeqHits[key]=1;
  const hx=(Math.max(box.x,hurt.x)+Math.min(box.x+box.w,hurt.x+hurt.w))/2;
  const hy=(Math.max(box.y,hurt.y)+Math.min(box.y+box.h,hurt.y+hurt.h))/2;
  const res=resolveHit(f,o,{
    damage,hitstun:opts.hitstun||22,blockstun:opts.blockstun||10,
    kbx:opts.kbx ?? 6,kby:opts.kby ?? -3,hitstop:opts.hitstop||7,
    armorBreak:opts.armorBreak!==false,kind:opts.kind||'skill1',type:'melee',meter:opts.meter||4
  },hx,hy);
  if(res!=='whiff'&&opts.techBreak&&o.move&&o.move.kind!=='ult'){
    o.move=null;o.moveKey=null;o.state='HITSTUN';o.stateFrame=0;o.hasHit=false;
    floatText(o.x,o.y-184,'TECHNIQUE BREAK','#e7edf0',16,42);
  }
  return res!=='whiff';
}
function tojiSeqFX(f,label,col='#e7edf0',power=0.16){
  const dir=f.facing,cx=f.x+dir*52,cy=f.y-86;
  ring(cx,cy,col,42+power*90,16+power*20);
  vfxSlashTrail(f.x-dir*24,f.y-116,cx+dir*88,f.y-42,col,4.5+power*10,18+power*14);
  if(power>0.2)burst(cx,cy,10+Math.floor(power*28),col,4+power*5,8+power*10,20+power*18);
  floatText(f.x,f.y-190,label,col,power>0.32?19:15,42+Math.floor(power*50));
}
/* ===== TOJI X / IN-ENGINE CINEMATIC COMBAT =====
   X is a real move inside the normal combat renderer. No video, no fullscreen
   overlay, no detached animation canvas. The sequence temporarily owns fighter
   positions + camera staging, then gives control back to the live arena. */
function tojiCineEase(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function tojiCineOut(t){return 1-Math.pow(1-clamp(t,0,1),4);}
function tojiCineRect(x,y,w,h){return {x,y,w,h};}
function tojiCineStart(f){
  if(G.tojiCineX)return G.tojiCineX;
  const o=f.opp;
  const state={owner:f,target:o,frame:0,baseX:f.x,baseY:f.y,targetBaseX:o?.x??f.x+150,targetBaseY:o?.y??GROUND,
    prevOwnerState:f.state,prevTargetState:o?.state||'IDLE',prevOwnerFacing:f.facing,prevTargetFacing:o?.facing||-f.facing,
    prevOwnerInvuln:f.invuln,prevTargetInvuln:o?.invuln||0,ghosts:[],shot:0,contactFlash:0,lastX:f.x,lastY:f.y,done:false};
  G.tojiCineX=state;
  f.vx=0;f.vy=0;f.onGround=true;f.invuln=60;
  f.tojiCinePhase=0;f.tojiCineTarget=o?.id||'';
  if(o){o.vx=0;o.vy=0;o.onGround=true;o.state='CINE_REACT';o.stateFrame=0;o.invuln=0;o.blocking=false;o.move=null;o.moveKey=null;}
  G.speedLines.length=0;G.impactBursts.length=0;G.projectiles.length=0;
  flash(0.16,'#eef2f3');shake(5);camPunch(0.08);
  return state;
}
function tojiCineStoreGhost(c){
  const f=c.owner;if(!f)return;
  if(c.frame%2===0){c.ghosts.push({x:f.x,y:f.y,frame:c.frame,pose:tojiCinePose(f,c.frame,true)});if(c.ghosts.length>9)c.ghosts.shift();}
}
function tojiCineResolve(c,key,damage,hb,opts={}){
  if(!c||c.hitKeys?.[key])return false;
  c.hitKeys=c.hitKeys||{};
  const f=c.owner,o=c.target;if(!f||!o||o.hp<=0)return false;
  const box=getHitboxWorld(f,hb),hurt=getHurtbox(o);
  if(!aabb(box,hurt))return false;
  const hx=(Math.max(box.x,hurt.x)+Math.min(box.x+box.w,hurt.x+hurt.w))/2;
  const hy=(Math.max(box.y,hurt.y)+Math.min(box.y+box.h,hurt.y+hurt.h))/2;
  const res=resolveHit(f,o,{damage,hitstun:opts.hitstun||28,blockstun:opts.blockstun||10,
    kbx:opts.kbx??8,kby:opts.kby??-3,hitstop:opts.hitstop||7,armorBreak:opts.armorBreak!==false,
    kind:'toji_cine',type:'melee',meter:opts.meter??Math.max(2,Math.floor(damage*.45))},hx,hy);
  if(res==='whiff')return false;
  c.hitKeys[key]=1;
  const dir=f.x<=o.x?1:-1;
  c.contactFlash=opts.flash||0.20;
  c.lastContact={x:hx,y:hy,power:opts.power||1,dir};
  flash(opts.flash||0.20,opts.flashColor||'#f4f7f9');
  shake(opts.shake||8);camPunch(opts.camPunch||0.12);
  G.hitstop=Math.max(G.hitstop,opts.hitstop||8);
  return true;
}
function tojiCineDashFX(c,x1,y1,x2,y2,power=1){
  const dx=x2-x1,dy=y2-y1,len=Math.max(1,Math.hypot(dx,dy)),nx=dx/len,ny=dy/len;
  const px=-ny,py=nx;
  for(let i=0;i<5;i++){
    const q=(i+1)/6,xx=lerp(x1,x2,q),yy=lerp(y1,y2,q),span=(18+i*9)*power;
    G.speedLines.push({x:xx+px*rnd(-8,8),y:yy+py*rnd(-8,8),angle:Math.atan2(dy,dx)+rnd(-0.12,0.12),len:span,speed:rnd(2.8,5.2),life:10+i,maxLife:10+i,color:i%2?'#9aa3a8':'#eef2f3'});
  }
  for(let i=0;i<3;i++){
    vfxSlashTrail(x1+px*rnd(-14,14),y1+py*rnd(-14,14),x2+px*rnd(-10,10),y2+py*rnd(-10,10),'#cbd1d4',2.4+power*1.8,10+Math.floor(power*5));
  }
}
function tojiCineImpactFX(c,power=1,color='#e4e8ea'){
  const hit=c.lastContact;if(!hit)return;
  const x=hit.x,y=hit.y;
  burst(x,y,12+Math.floor(power*10),color,4+power*3,3+power*3,14+Math.floor(power*8));
  vfxSlashTrail(x-hit.dir*70,y-35,x+hit.dir*100,y+18,color,3+power*2,12+Math.floor(power*5));
  vfxShockwave(x,y,color,44+power*70,12+power*16);
  for(let i=0;i<4;i++){
    const p=pget(),a=(i/4)*Math.PI*2+rnd(-0.2,0.2);p.active=true;p.x=x;p.y=y;p.vx=Math.cos(a)*rnd(2.5,5.8);p.vy=Math.sin(a)*rnd(1.8,4.6)-1.3;p.maxLife=p.life=rnd(10,18);p.size=rnd(2,4);p.color=color;p.grav=0.06;p.shape='diamond';p.rot=a;p.vr=rnd(-0.1,0.1);p.add=true;
  }
}
function tojiCineFakeBlood(x,y,dir=1,power=1){
  /* Restrained anime/game VFX: a few short-lived red particles, no wound textures. */
  const n=4+Math.floor(power*2);
  for(let i=0;i<n;i++){
    const p=pget(),a=(-Math.PI*0.78)+rnd(-0.34,0.34),s=rnd(2.0,4.8)*power;
    p.active=true;p.x=x+dir*rnd(-5,8);p.y=y+rnd(-5,7);
    p.vx=dir*Math.cos(a)*s;p.vy=Math.sin(a)*s-rnd(0.2,1.1);
    p.maxLife=p.life=rnd(8,15);p.size=rnd(1.4,3.2)*power;
    p.color=Math.random()<0.55?'#8b2531':'#bd3542';p.grav=0.075;p.shape='circle';p.rot=0;p.vr=rnd(-0.08,0.08);p.add=true;
  }
  for(let i=0;i<2;i++){
    const q=pget();q.active=true;q.x=x+dir*rnd(-8,10);q.y=y+rnd(-3,5);q.vx=dir*rnd(1.2,3.0);q.vy=-rnd(0.5,1.6);
    q.maxLife=q.life=rnd(7,11);q.size=rnd(2.2,3.8);q.color='#761c28';q.grav=0.05;q.shape='diamond';q.rot=rnd(0,6.28);q.vr=rnd(-0.1,0.1);q.add=true;
  }
}
function tojiCineDust(x,y,power=1){
  for(let i=0;i<8+Math.floor(power*6);i++){
    const p=pget(),a=Math.PI+rnd(-0.65,0.65),s=rnd(1.2,4.2)*power;p.active=true;p.x=x+rnd(-20,20);p.y=y+rnd(-4,4);p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s-rnd(0.4,1.4);p.maxLife=p.life=rnd(18,34);p.size=rnd(2,5);p.color=Math.random()<0.5?'#6d7478':'#9ba1a5';p.grav=0.08;p.shape='circle';p.rot=0;p.vr=0;p.add=false;
  }
}
function tojiCinePose(f,frame,ghost=false){
  const c=G.tojiCineX,t=c?c.frame:(frame||0);
  const P=POSE(-58,-96,-114,0,0,[76,26],[104,22],[88,6],[94,-6]);
  const phase=(a,b)=>clamp((t-a)/(b-a),0,1);
  const glide=(a,b)=>tojiCineEase(phase(a,b));
  const smooth=(q)=>q*q*(3-2*q);
  if(f===c?.owner){
    if(t<70){const q=glide(0,70);P.hipY=-56-7*q;P.shY=-93-8*q;P.headY=P.shY-24;P.headX=-2-4*q;P.lean=-10-12*q;P.armF=[46-18*q,-18-12*q];P.armB=[120+10*q,8-10*q];P.legF=[72+8*q,18-14*q];P.legB=[118-14*q,-12-8*q];}
    else if(t<155){const q=glide(70,155);P.hipY=-58;P.shY=-97;P.headY=P.shY-24;P.headX=2;P.lean=16+7*q;P.armF=[24,-44+10*q];P.armB=[150,-8-8*q];P.legF=[56,-28];P.legB=[130,-14];}
    else if(t<235){const q=glide(155,235);P.hipY=-59;P.shY=-99;P.headY=P.shY-24;P.headX=4-6*q;P.lean=6-28*q;P.armF=[-6+82*q,-6-64*q];P.armB=[146-42*q,-8+34*q];P.legF=[72+16*q,8+5*q];P.legB=[116-18*q,-8];}
    else if(t<335){const q=glide(235,335),s=Math.sin(q*Math.PI);P.hipY=-57-3*s;P.shY=-94-7*s;P.headY=P.shY-24;P.headX=-3+8*q;P.lean=-18+34*q;P.armF=[136-118*q,10-72*q];P.armB=[36+108*q,-34+18*q];P.legF=[64+28*q,18-22*q];P.legB=[124-42*q,-10];}
    else if(t<440){const q=glide(335,440);P.hipY=-57;P.shY=-95;P.headY=P.shY-24;P.headX=3;P.lean=12-28*q;P.armF=[128-112*q,18-50*q];P.armB=[42+106*q,-36+18*q];P.legF=[66+26*q,18-18*q];P.legB=[122-48*q,-12];}
    else if(t<550){const q=glide(440,550),s=Math.sin(q*Math.PI);P.hipY=-58-5*s;P.shY=-97-5*s;P.headY=P.shY-24;P.headX=2-5*q;P.lean=20-22*q;P.armF=[8+12*q,-12-38*s];P.armB=[150-110*q,-4-30*s];P.legF=[70+18*s,-8-8*s];P.legB=[124-26*s,-10+10*s];}
    else if(t<650){const q=glide(550,650),s=Math.sin(q*Math.PI);P.hipY=-58-2*s;P.shY=-97-5*s;P.headY=P.shY-24;P.headX=3-6*q;P.lean=10+17*s;P.armF=[22+120*q,-42+12*s];P.armB=[146-74*q,-8-10*s];P.legF=[58+46*q,4-12*s];P.legB=[136-34*q,-14+8*s];}
    else if(t<690){const q=glide(650,690);P.hipY=-57-5*q;P.shY=-95-7*q;P.headY=P.shY-24;P.headX=4;P.lean=22-16*q;P.armF=[62-14*q,-34-12*q];P.armB=[142-18*q,-6+6*q];P.legF=[74+12*q,8-2*q];P.legB=[124-12*q,-10];}
    else if(t<735){const q=glide(690,735),s=Math.sin(q*Math.PI);P.hipY=-55-7*s;P.shY=-90-10*s;P.headY=P.shY-24;P.headX=4-3*q;P.lean=-2+14*q;P.armF=[30+22*q,-16-2*q];P.armB=[124-10*q,8-14*q];P.legF=[124-22*q,96-76*q];P.legB=[76,-20+8*q];}
    else if(t<825){const q=glide(735,825);P.hipY=-49+3*q;P.shY=-78+10*q;P.headY=P.shY-24;P.headX=2+2*q;P.lean=12-6*q;P.armF=[110-20*q,-8-8*q];P.armB=[56+44*q,14-12*q];P.legF=[80+14*q,28-18*q];P.legB=[114-16*q,-8+4*q];}
    else if(t<875){const q=glide(825,875);P.hipY=-51;P.shY=-82;P.headY=P.shY-24;P.headX=3;P.lean=10+10*q;P.armF=[126-22*q,-8-12*q];P.armB=[80+30*q,10-7*q];P.legF=[86+2*q,24-10*q];P.legB=[120-12*q,-8];}
    else if(t<925){const q=glide(875,925);P.hipY=-50-5*q;P.shY=-80-10*q;P.headY=P.shY-24;P.headX=3;P.lean=20+10*q;P.armF=[154-6*q,-2+2*q];P.armB=[118-2*q,6];P.legF=[82+4*q,12];P.legB=[124-8*q,-8];}
    else if(t<960){const q=glide(925,960);P.hipY=-48-4*q;P.shY=-74-9*q;P.headY=P.shY-24;P.headX=4;P.lean=22+6*q;P.armF=[162-2*q,-2];P.armB=[132,-2+4*q];P.legF=[80,10];P.legB=[126,-8];}
    else if(t<995){
      const q=glide(960,995);
      P.hipY=-46+7*q;P.shY=-71+9*q;P.headY=P.shY-24;P.headX=4-2*q;P.lean=28-15*q;
      // Arm drives down into the same diagonal line as the ISOH during the final thrust.
      P.armF=[156-74*q,4+12*q];P.armB=[130-20*q,4+7*q];
      P.legF=[84+3*q,8];P.legB=[120-10*q,-6];
    }
    else{const q=glide(995,1020);P.hipY=-56;P.shY=-94;P.headY=P.shY-24;P.headX=2;P.lean=4+3*q;P.armF=[68+16*q,18+5*q];P.armB=[124-12*q,9+3*q];P.legF=[88,5];P.legB=[94,-6];}
  }else if(f===c?.target){
    const pre=phase(670,725),fall=phase(725,825),settle=phase(825,850);
    if(t<670){P.hipY=-58;P.shY=-96;P.headY=P.shY-24;P.lean=12-9*phase(550,670);P.headX=-4-4*phase(550,670);P.armF=[42+76*phase(550,670),18+18*phase(550,670)];P.armB=[132-18*phase(550,670),22-12*phase(550,670)];P.legF=[88-20*phase(550,670),22+42*phase(550,670)];P.legB=[112-10*phase(550,670),-8];}
    else if(t<725){const q=glide(670,725);P.hipY=-57;P.shY=-96;P.headY=P.shY-24;P.lean=12-10*q;P.headX=-4-4*q;P.armF=[42+76*q,18+18*q];P.armB=[132-18*q,22-12*q];P.legF=[88-20*q,22+42*q];P.legB=[112-10*q,-8];}
    else if(t<825){
      const q=smooth(fall),hitq=smooth(phase(725,770));
      /* Explicit ground fall: buckle -> torso rotation -> head follows -> fully prone. */
      P.hipY=-58+(-44*q);P.shY=-96+88*q;P.headY=-120+101*q;P.headX=-5-78*q;P.lean=18+58*q;
      P.armF=[136-96*q,30+54*q];P.armB=[146-92*q,18+58*q];P.legF=[62-44*q,20+60*q];P.legB=[116-48*q,-10+24*q];
      if(t>=725&&t<780){P.headY-=6*(1-hitq);P.lean+=6*hitq;}
    }else if(t<875){
      /* Fully grounded prone pose. It is intentionally separate from the standing animation set. */
      const q=smooth(settle);P.hipY=-15;P.shY=-20;P.headY=-28;P.headX=60+3*q;P.lean=72;
      P.armF=[154-10*q,34+4*q];P.armB=[148-4*q,22+4*q];P.legF=[88-8*q,8];P.legB=[106-4*q,-6];
    }else if(t<925){
      const q=glide(875,925);P.hipY=-15;P.shY=-20;P.headY=-28;P.headX=62;P.lean=72;P.armF=[154,34];P.armB=[148,24];P.legF=[86,8];P.legB=[106,-6];
    }else{
      const q=phase(925,1020);P.hipY=-15;P.shY=-20;P.headY=-28;P.headX=62;P.lean=72;P.armF=[154,34];P.armB=[148,24];P.legF=[86,8];P.legB=[106,-6];
      if(q>0.35){P.lean=78-4*(q-0.35);}
    }
  }
  P.headY=(f===c?.target && t>=825)?P.headY:P.shY-24;
  if(f===c?.owner){const micro=Math.sin(t*0.19)*0.8;P.lean+=micro;P.headX+=Math.sin(t*0.11)*0.45;P.armF=[P.armF[0]+Math.sin(t*0.17)*0.7,P.armF[1]+Math.sin(t*0.13)*0.45];P.armB=[P.armB[0]-Math.sin(t*0.15)*0.5,P.armB[1]-Math.sin(t*0.12)*0.35];}
  P.headX=(f===c?.target && t>=825)?P.headX:clamp(P.headX||0,-18,55);
  if(ghost){P.headY+=1;P.hipY+=1;}
  return P;
}
function tojiCineWeaponPose(f,t){
  /* X keeps one consistent weapon identity: the real Inverted Spear of Heaven. */
  if(t<70)return {type:'inverted_spear',ang:-0.34+0.12*Math.sin(t*0.10),len:58};
  if(t<155)return {type:'inverted_spear',ang:-0.20+0.34*((t-70)/85),len:62};
  if(t<235)return {type:'inverted_spear',ang:-0.42+0.88*((t-155)/80),len:68};
  if(t<335)return {type:'inverted_spear',ang:0.46-1.04*((t-235)/100),len:66};
  if(t<440)return {type:'inverted_spear',ang:-0.58+0.96*((t-335)/105),len:70};
  if(t<550)return {type:'inverted_spear',ang:-0.10+0.22*((t-440)/110),len:72};
  if(t<650)return {type:'inverted_spear',ang:-0.52+1.18*((t-550)/100),len:68};
  if(t<735)return {type:'inverted_spear',ang:0.78-0.26*((t-650)/85),len:64};
  if(t<875)return {type:'inverted_spear',ang:0.20+0.12*Math.sin(t*0.12),len:60};
  if(t<925)return {type:'inverted_spear',ang:-0.34+0.30*((t-875)/50),len:64};
  if(t<960)return {type:'inverted_spear',ang:0.05+0.78*((t-925)/35),len:68};
  /* Final contact: rotate the real ISOH down with the hand, not independently. */
  if(t<995)return {type:'inverted_spear',ang:0.84+0.22*((t-960)/35),len:72};
  return {type:'inverted_spear',ang:1.08,len:66};
}
function drawTojiCineInvertedSpear(ctx2,hand,a,dir,t){
  ctx2.save();ctx2.translate(hand.x,hand.y);ctx2.scale(dir,1);
  /* 2x smaller than the previous cinematic ISOH. */
  ctx2.scale(0.5,0.5);
  ctx2.rotate(a);ctx2.lineCap='round';ctx2.lineJoin='round';
  const H=30,B=58;
  const hg=ctx2.createLinearGradient(-H,0,0,0);hg.addColorStop(0,'#050607');hg.addColorStop(.5,'#171b1d');hg.addColorStop(1,'#080a0b');
  ctx2.strokeStyle=hg;ctx2.lineWidth=8;ctx2.beginPath();ctx2.moveTo(-H,0);ctx2.lineTo(0,0);ctx2.stroke();
  ctx2.strokeStyle='#3e4549';ctx2.lineWidth=2;for(let i=0;i<5;i++){const x=-H+4+i*5.1;ctx2.beginPath();ctx2.moveTo(x,-3.5);ctx2.lineTo(x+2.2,3.5);ctx2.stroke();}
  ctx2.strokeStyle='#090b0d';ctx2.lineWidth=6;ctx2.beginPath();ctx2.arc(3,0,9,-1.35,1.15);ctx2.stroke();ctx2.strokeStyle='#aeb5b9';ctx2.lineWidth=1.8;ctx2.beginPath();ctx2.arc(3,0,7,-1.30,.98);ctx2.stroke();
  const g=ctx2.createLinearGradient(8,0,B,0);g.addColorStop(0,'#697176');g.addColorStop(.22,'#edf0f1');g.addColorStop(.55,'#b8bec2');g.addColorStop(1,'#596166');ctx2.fillStyle=g;ctx2.beginPath();ctx2.moveTo(8,-6);ctx2.lineTo(23,-13);ctx2.lineTo(43,-13);ctx2.lineTo(B,-6);ctx2.lineTo(B,6);ctx2.lineTo(43,13);ctx2.lineTo(23,13);ctx2.lineTo(8,6);ctx2.closePath();ctx2.fill();ctx2.strokeStyle='#4d555a';ctx2.lineWidth=1.4;ctx2.stroke();
  ctx2.fillStyle='#eef1f2';ctx2.beginPath();ctx2.moveTo(37,-7);ctx2.lineTo(48,-16);ctx2.lineTo(B+13,-11);ctx2.lineTo(B+5,-3);ctx2.lineTo(49,-5);ctx2.closePath();ctx2.fill();ctx2.beginPath();ctx2.moveTo(37,7);ctx2.lineTo(48,16);ctx2.lineTo(B+13,11);ctx2.lineTo(B+5,3);ctx2.lineTo(49,5);ctx2.closePath();ctx2.fill();
  ctx2.strokeStyle='#262c30';ctx2.lineWidth=3;ctx2.beginPath();ctx2.moveTo(39,0);ctx2.lineTo(B+10,0);ctx2.stroke();
  ctx2.strokeStyle='#ffffff';ctx2.lineWidth=1.4;ctx2.beginPath();ctx2.moveTo(20,-5);ctx2.lineTo(48,-8);ctx2.lineTo(B+7,-7);ctx2.stroke();ctx2.beginPath();ctx2.moveTo(20,5);ctx2.lineTo(48,8);ctx2.lineTo(B+7,7);ctx2.stroke();
  ctx2.strokeStyle='#777f84';ctx2.lineWidth=2;ctx2.beginPath();ctx2.moveTo(25,-10);ctx2.lineTo(29,-19);ctx2.stroke();ctx2.beginPath();ctx2.moveTo(29,-19);ctx2.lineTo(33,-16);ctx2.stroke();
  ctx2.strokeStyle='#c7a52c';ctx2.lineWidth=2.2;ctx2.beginPath();ctx2.arc(-H-3,0,5.5,0,Math.PI*2);ctx2.stroke();ctx2.strokeStyle='#8d969a';ctx2.lineWidth=1.8;for(let i=0;i<3;i++){ctx2.beginPath();ctx2.ellipse(-H-10-i*4,(i%2?2:-2),3.5,2,.25,0,Math.PI*2);ctx2.stroke();}
  if(t>=875){const q=clamp((t-875)/90,0,1);ctx2.globalAlpha=.08+.18*(1-q);ctx2.strokeStyle='#f0f3f4';ctx2.lineWidth=4;ctx2.beginPath();ctx2.moveTo(12,0);ctx2.lineTo(B+13,0);ctx2.stroke();}
  ctx2.restore();
}
function drawTojiCinematicWeapon(f,P,fd){
  const c=G.tojiCineX;if(!c||f!==c.owner)return;
  const t=c.frame,hip={x:f.x+fd*P.lean*0.25,y:f.y+P.shY},ef=joint(hip,P.armF[0],20),hand=joint(ef,P.armF[0]+P.armF[1],20);
  const w=tojiCineWeaponPose(f,t),dir=fd;
  // Cinematic weapon angles are stored in radians. Never convert them with D2R.
  let a=w.ang;
  /* FINAL ISOH AIM LOCK
     During the last stab, do not trust a pre-authored angle. Aim the real spear
     from Toji's actual hand toward Gojo's actual chest. This removes the mirrored
     facing bug where the spear could visually point away from the target. */
  if(w.type==='inverted_spear' && t>=925 && c.target && c.target.state!=='DEFEAT'){
    const target=c.target;
    const chestX=target.x + (target.lean||0)*0.18;
    const chestY=target.y - 24;
    const dx=chestX-hand.x,dy=chestY-hand.y;
    const localDx=dx*dir;
    if(Math.abs(dx)+Math.abs(dy)>0.001){
      a=Math.atan2(dy,localDx);
      // Keep the final stab clearly descending without allowing the aim vector
      // to flip over the top of the target when positions get very close.
      if(t>=960){
        const minDown=0.28;
        if(a>-minDown && a<minDown) a=minDown;
      }
    }
  }
  if(w.type==='inverted_spear'){drawTojiCineInvertedSpear(ctx,hand,a,dir,t);return;}
  ctx.save();ctx.translate(hand.x,hand.y);ctx.scale(dir,1);ctx.lineCap='round';ctx.lineJoin='round';ctx.globalCompositeOperation='lighter';
  if(w.type==='katana'){
    ctx.save();ctx.rotate(a);ctx.strokeStyle='#050607';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(w.len,0);ctx.stroke();ctx.strokeStyle='#e8ecee';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(w.len,0);ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(8,-2);ctx.lineTo(w.len-8,-2);ctx.stroke();ctx.strokeStyle='#777f84';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(12,0);ctx.stroke();ctx.restore();
  }else if(w.type==='spear'){
    ctx.save();ctx.rotate(a);ctx.strokeStyle='#4b5155';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(w.len,0);ctx.stroke();ctx.strokeStyle='#e7ebed';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(w.len+18,0);ctx.stroke();ctx.fillStyle='#f5f7f8';ctx.beginPath();ctx.moveTo(w.len+24,0);ctx.lineTo(w.len+6,-7);ctx.lineTo(w.len+9,7);ctx.closePath();ctx.fill();ctx.restore();
  }else if(w.type==='chain'){
    ctx.save();ctx.rotate(a);ctx.strokeStyle='#8b9296';ctx.lineWidth=4;ctx.beginPath();for(let i=0;i<12;i++){const x=i*11,y=Math.sin(i*1.5+t*0.25)*5;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();ctx.strokeStyle='#e5e8ea';ctx.lineWidth=1.2;ctx.stroke();ctx.restore();
  }
  if(t>=140&&t<=650){ctx.globalAlpha=0.26;ctx.strokeStyle='#d9dee0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,w.len*0.72,a-0.45,a+0.22);ctx.stroke();}
  ctx.restore();
}
function drawTojiCinematicXFX(f,P,fd){
  const c=G.tojiCineX;if(!c)return;
  const t=c.frame;
  if(f===c.owner){
    tojiCineStoreGhost(c);
    ctx.save();ctx.globalCompositeOperation='lighter';
    if(t>=70&&t<155){
      const q=phase01(t,70,155);
      for(let i=0;i<7;i++){const k=(i+1)/8,yy=f.y-78+i*5;ctx.globalAlpha=.16*(1-q*.35);ctx.strokeStyle=i%2?'#b9c0c4':'#f1f3f4';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(f.x-fd*(20+i*16),yy);ctx.lineTo(f.x-fd*(62+i*18),yy+6);ctx.stroke();}
    }
    if((t>=70&&t<235)||(t>=235&&t<335)||(t>=335&&t<550)||(t>=550&&t<670)){
      const q=tojiCineWeaponPose(f,t),w=q.len,a=q.ang,hh={x:f.x+fd*(18+P.lean*.25),y:f.y+P.shY+6};
      ctx.globalAlpha=.24;ctx.strokeStyle='#e9edf0';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.arc(hh.x,hh.y,w*.62,a-1.05,a+.48);ctx.stroke();
      ctx.globalAlpha=.65;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(hh.x,hh.y,w*.78,a-.8,a+.28);ctx.stroke();
    }
    if(t>=440&&t<550){for(let i=0;i<5;i++){ctx.globalAlpha=.13+.025*i;ctx.strokeStyle=i%2?'#c6cdd1':'#f1f3f4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f.x+fd*(18+i*18),f.y-100-i*3);ctx.lineTo(f.x+fd*(118+i*14),f.y-96+i*4);ctx.stroke();}}
    if(t>=670&&t<725){
      const q=phase01(t,670,725),s=Math.sin(q*Math.PI);
      /* Foot sweep is readable at a glance: long low arc + floor streak + dust. */
      ctx.globalAlpha=.16+.24*s;ctx.strokeStyle='#edf1f3';ctx.lineWidth=5;ctx.beginPath();ctx.arc(f.x+fd*20,f.y-39,64+18*q,-0.25,0.98);ctx.stroke();
      ctx.globalAlpha=.32+.18*s;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f.x-fd*20,f.y-25);ctx.lineTo(f.x+fd*(100+18*q),f.y-21);ctx.stroke();
      if(t%4===0)tojiCineDust(f.x+fd*48,f.y,1.0+.5*s);
    }
    if(t>=725&&t<790){const q=phase01(t,725,790);ctx.globalAlpha=.12+.13*(1-q);ctx.strokeStyle='#c9d0d4';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f.x-fd*16,f.y-44);ctx.lineTo(f.x+fd*94,f.y-38);ctx.stroke();}
    if(t>=790&&t<835){
      const q=phase01(t,790,835);ctx.globalAlpha=.12+.18*q;ctx.strokeStyle='#e9eef0';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(f.x+fd*20,f.y-99);ctx.lineTo(f.x+fd*(94+42*q),f.y-99);ctx.stroke();
      ctx.globalAlpha=.10+.10*q;ctx.lineWidth=8;ctx.strokeStyle='#c8ced1';ctx.beginPath();ctx.moveTo(f.x+fd*14,f.y-99);ctx.lineTo(f.x+fd*(118+34*q),f.y-99);ctx.stroke();
    }
    if(t>=835&&t<870){
      const q=phase01(t,835,870);ctx.globalAlpha=.30+.52*(1-q);ctx.strokeStyle='#ffffff';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(f.x-fd*20,f.y-99);ctx.lineTo(f.x+fd*(138+20*q),f.y-99);ctx.stroke();
      ctx.globalAlpha=.15+.17*(1-q);ctx.lineWidth=10;ctx.strokeStyle='#dfe5e8';ctx.beginPath();ctx.moveTo(f.x+fd*4,f.y-99);ctx.lineTo(f.x+fd*(132+20*q),f.y-99);ctx.stroke();
    }
    if(t===176||t===268||t===385||t===505||t===592||t===712||t===848){ctx.globalAlpha=.86;ctx.strokeStyle='#ffffff';ctx.lineWidth=2.3;ctx.beginPath();ctx.moveTo(f.x-fd*60,f.y-78);ctx.lineTo(f.x+fd*82,f.y-78);ctx.stroke();}
    if(t>=925&&t<995){const q=phase01(t,925,995);ctx.globalAlpha=.16+.22*q;ctx.strokeStyle='#eef2f3';ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(f.x+fd*18,f.y-94);ctx.lineTo(f.x+fd*(18-10*q),f.y-94+28*q);ctx.stroke();}
    ctx.restore();
    drawTojiCinematicWeapon(f,P,fd);
    for(const g of c.ghosts){const age=t-g.frame;if(age<1||age>14)continue;drawTojiCineGhost(g.x,g.y,fd,g.pose,clamp(1-age/14,0,1));}
  }
  if(f===c.target&&c.lastContact&&c.lastContact.x){
    const h=c.lastContact,age=t-(c.lastContactFrame||0);
    if(age>=0&&age<12){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=clamp(1-age/12,0,1);ctx.strokeStyle='#ffffff';ctx.lineWidth=2.2;for(let i=0;i<10;i++){const a=i*Math.PI/5;ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(h.x+Math.cos(a)*(22+age*7),h.y+Math.sin(a)*(15+age*5));ctx.stroke();}ctx.restore();}
    if(age>=0&&age<7&&c.lastContactFrame===848){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-age/7)*.38;ctx.fillStyle='#a32a37';ctx.beginPath();ctx.arc(h.x,h.y,8+age*2,0,6.283);ctx.fill();ctx.restore();}
  }
}
function drawTojiCineGhost(x,y,fd,P,a){
  ctx.save();ctx.globalAlpha=a*0.20;ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#d7dde0';ctx.lineWidth=2;const hip= {x,y:y+P.hipY},sh={x:x+P.lean*.25*fd,y:y+P.shY},head={x:x+P.headX*fd,y:y+P.headY};
  ctx.beginPath();ctx.moveTo(hip.x-10,hip.y);ctx.lineTo(sh.x+10*fd,sh.y);ctx.stroke();
  for(const [A,B] of [[P.armF,P.armB],[P.legF,P.legB]])for(const seg of B? [A,B]:[]){const a1=seg[0]*D2R,a2=seg[1]*D2R;ctx.beginPath();ctx.moveTo(sh.x,sh.y);ctx.lineTo(sh.x+Math.cos(a1)*28,sh.y+Math.sin(a1)*28);ctx.lineTo(sh.x+Math.cos(a1)*28+Math.cos(a1+a2)*28,sh.y+Math.sin(a1)*28+Math.sin(a1+a2)*28);ctx.stroke();}
  ctx.beginPath();ctx.ellipse(head.x,head.y,12,14,0,0,6.283);ctx.stroke();ctx.restore();
}
function phase01(t,a,b){return clamp((t-a)/(b-a),0,1);}
function tojiCineShot(c){
  const a=c.owner,b=c.target,t=c.frame,mid=(a.x+b.x)/2;
  if(t<70)return {x:a.x*0.55+b.x*0.45,y:GROUND-54,z:1.05,label:'HEAVENLY EXECUTION'};
  if(t<155)return {x:a.x*0.35+b.x*0.65,y:GROUND-70,z:1.24,label:'ZERO DISTANCE'};
  if(t<235)return {x:mid,y:GROUND-72,z:1.46,label:'FIRST CONTACT'};
  if(t<335)return {x:mid,y:GROUND-68,z:1.34,label:'CROSS CUT'};
  if(t<440)return {x:mid,y:GROUND-74,z:1.52,label:'CHAIN PULL'};
  if(t<550)return {x:a.x*0.55+b.x*0.45,y:GROUND-88,z:1.66,label:'HEAVEN PIERCES'};
  if(t<650)return {x:mid,y:GROUND-76,z:1.28,label:'CLOSE PURSUIT'};
  if(t<690)return {x:mid,y:GROUND-50,z:1.42,label:'FOOTWORK'};
  if(t<735)return {x:mid,y:GROUND-8,z:1.70,label:'LOW SWEEP'};
  if(t<825)return {x:mid,y:GROUND-26,z:1.56,label:'KNOCKDOWN'};
  if(t<875)return {x:mid,y:GROUND-34,z:1.42,label:'PRONE'};
  if(t<925)return {x:mid,y:GROUND-58,z:1.62,label:'SPEAR DRAW'};
  if(t<960)return {x:mid,y:GROUND-62,z:1.78,label:'FINAL AIM'};
  if(t<995)return {x:mid,y:GROUND-58,z:1.86,label:'FINAL CONTACT'};
  return {x:mid,y:GROUND-46,z:1.30,label:'SILENCE'};
}
function updateTojiCinematicX(f,m){
  const c=G.tojiCineX||tojiCineStart(f),t=f.moveFrame,o=c.target;
  if(c.done){f.tojiWeaponPhase=null;f.tojiSeqHits=null;f.tojiMoveTween=null;f.tojiMotion='idle';f.tojiMotionFrame=0;f.tojiMotionTimer=0;endMove(f);return;}
  c.frame=t;
  if(!o){tojiEndCinematicX(f);endMove(f);return;}
  o.state='CINE_REACT';o.stateFrame=t;o.hitstun=0;o.vx=0;o.vy=0;o.invuln=0;o.blocking=false;o.onGround=true;
  f.vx=0;f.vy=0;f.invuln=9999;f.onGround=true;
  c.hitKeys=c.hitKeys||{};const ground=GROUND;
  if(t<70){f.x=c.baseX;o.x=c.targetBaseX;f.y=ground;o.y=ground;f.facing=f.x<=o.x?1:-1;o.facing=-f.facing;}
  else if(t<155){const q=tojiCineOut((t-70)/85),px=f.x,py=f.y;f.x=lerp(c.baseX,c.targetBaseX-f.facing*92,q);o.x=c.targetBaseX;f.y=ground;o.y=ground;if(t%2===0)tojiCineDashFX(c,px,py,f.x,f.y,1.05);}
  else if(t<235){const q=tojiCineEase((t-155)/80),px=f.x,py=f.y;f.x=lerp(c.targetBaseX-92,c.targetBaseX+44,q);o.x=lerp(c.targetBaseX,c.targetBaseX+34,q);f.y=ground;o.y=ground;if(t%3===0)tojiCineDashFX(c,px,py,f.x,f.y,.68);if(t===176&&tojiCineResolve(c,'hit1',8,{x:26,y:-124,w:190,h:92},{hitstun:30,kbx:11,kby:0,hitstop:8,power:1.0,shake:5,flash:.16,armorBreak:true})){c.lastContactFrame=t;tojiCineImpactFX(c,1.02,'#eef1f2');tojiCineDust(o.x,o.y,.9);}}
  else if(t<335){const q=tojiCineEase((t-235)/100),px=f.x,py=f.y;f.x=lerp(c.targetBaseX+44,c.targetBaseX-74,q);o.x=lerp(c.targetBaseX+34,c.targetBaseX+4,q);f.y=ground;o.y=ground;if(t%3===0)tojiCineDashFX(c,px,py,f.x,f.y,.62);if(t===268&&tojiCineResolve(c,'hit2',7,{x:14,y:-112,w:188,h:96},{hitstun:28,kbx:9,kby:0,hitstop:7,power:.9,shake:5,flash:.14,armorBreak:true})){c.lastContactFrame=t;tojiCineImpactFX(c,.9,'#d9dee1');tojiCineDust(o.x,o.y,.8);}}
  else if(t<440){const q=tojiCineEase((t-335)/105),px=f.x,py=f.y;f.x=lerp(c.targetBaseX-74,c.targetBaseX+86,q);o.x=lerp(c.targetBaseX+4,c.targetBaseX-28,q);f.y=ground;o.y=ground;if(t%3===0)tojiCineDashFX(c,px,py,f.x,f.y,.66);if(t===385&&tojiCineResolve(c,'hit3',7,{x:30,y:-118,w:210,h:86},{hitstun:30,kbx:10,kby:0,hitstop:8,power:.94,shake:5,flash:.15,armorBreak:true})){c.lastContactFrame=t;tojiCineImpactFX(c,.94,'#c4cacc');tojiCineDust(o.x,o.y,.95);}}
  else if(t<550){const q=tojiCineEase((t-440)/110),px=f.x,py=f.y;f.x=lerp(c.targetBaseX+86,c.targetBaseX-70,q);o.x=lerp(c.targetBaseX-28,c.targetBaseX+8,q);f.y=ground;o.y=ground;if(t%3===0)tojiCineDashFX(c,px,py,f.x,f.y,.55);if(t===505&&tojiCineResolve(c,'hit4',10,{x:42,y:-112,w:230,h:76},{hitstun:34,kbx:12,kby:-3,hitstop:9,power:1.08,shake:6,flash:.19,armorBreak:true})){c.lastContactFrame=t;tojiCineImpactFX(c,1.08,'#e8ecee');tojiCineDust(o.x,o.y,1.1);}}
  else if(t<650){const q=tojiCineEase((t-550)/100),px=f.x,py=f.y;f.x=lerp(c.targetBaseX-70,c.targetBaseX+26,q);o.x=lerp(c.targetBaseX+8,c.targetBaseX+62,q);f.y=ground;o.y=ground;if(t%2===0)tojiCineDashFX(c,px,py,f.x,f.y,.50);if(t===592&&tojiCineResolve(c,'hit5',7,{x:18,y:-132,w:220,h:94},{hitstun:32,kbx:11,kby:-2,hitstop:8,power:1.0,shake:6,flash:.18,armorBreak:true})){c.lastContactFrame=t;tojiCineImpactFX(c,1.0,'#eef1f2');tojiCineDust(o.x,o.y,.95);}}
  else if(t<690){const q=tojiCineEase((t-650)/40),px=f.x,py=f.y;f.x=lerp(c.targetBaseX+26,c.targetBaseX+18,q);o.x=lerp(c.targetBaseX+62,c.targetBaseX+52,q);f.y=ground;o.y=ground;if(t%3===0)tojiCineDashFX(c,px,py,f.x,f.y,.32);}
  else if(t<735){
    const q=tojiCineEase((t-690)/45),px=f.x,py=f.y;f.x=lerp(c.targetBaseX+18,c.targetBaseX-26,q);o.x=lerp(c.targetBaseX+52,c.targetBaseX+7,q);f.y=ground;o.y=ground;
    if(t%2===0)tojiCineDashFX(c,px,py,f.x,f.y,.38);
    if(t===720&&tojiCineResolve(c,'sweep',5,{x:30,y:-32,w:214,h:62},{hitstun:30,kbx:10,kby:0,hitstop:7,power:.94,shake:5,flash:.13,armorBreak:true})){c.lastContactFrame=t;tojiCineImpactFX(c,.90,'#dfe4e6');tojiCineDust(o.x,o.y,1.45);flash(.08,'#e9edf0');}
  }else if(t<825){
    const q=tojiCineEase((t-735)/90);f.x=lerp(c.targetBaseX-26,c.targetBaseX-4,q);o.x=lerp(c.targetBaseX+7,c.targetBaseX+20,q);f.y=ground;o.y=ground;o.cineKnockdown=phase01(t,735,825);
    if(t===739){vfxShockwave(o.x,o.y-6,'#bfc6ca',64,12);tojiCineDust(o.x,o.y,1.2);shake(1.2);camPunch(.018);}
    if(t%8===0)tojiCineDust(o.x,o.y,.45);
  }else if(t<875){
    const q=tojiCineEase((t-825)/50);f.x=lerp(c.targetBaseX-4,c.targetBaseX+18,q);o.x=lerp(c.targetBaseX+20,c.targetBaseX+26,q);f.y=ground;o.y=ground;o.cineKnockdown=1;
    if(t%6===0)tojiCineDashFX(c,f.x-2,f.y,f.x,f.y,.16);
  }else if(t<925){
    const q=tojiCineEase((t-875)/50);f.x=lerp(c.targetBaseX+18,c.targetBaseX+38,q);o.x=c.targetBaseX+26;f.y=ground;o.y=ground;o.cineKnockdown=1;
    if(t===884){flash(.05,'#111417');camPunch(.02);}
  }else if(t<960){
    const q=tojiCineEase((t-925)/35),px=f.x,py=f.y;
    /* Step to the right side of the prone target before the final thrust. */
    f.x=lerp(c.targetBaseX+38,c.targetBaseX+60,q);o.x=c.targetBaseX+26;f.y=ground;o.y=ground;o.cineKnockdown=1;
    if(t%2===0)tojiCineDashFX(c,px,py,f.x,f.y,.20);
  }else if(t<995){
    const q=tojiCineEase((t-960)/35),px=f.x,py=f.y;
    /* Keep Toji just to the right of Gojo. ISOH rotates from ready to a steep downward thrust. */
    f.x=lerp(c.targetBaseX+60,c.targetBaseX+68,q);o.x=c.targetBaseX+26;f.y=ground;o.y=ground;o.cineKnockdown=1;
    if(t%2===0)tojiCineDashFX(c,px,py,f.x,f.y,.16);
    if(t===970&&tojiCineResolve(c,'final',6,{x:5,y:-42,w:104,h:44},{hitstun:40,kbx:7,kby:0,hitstop:11,power:1.30,shake:6,flash:.24,armorBreak:true})){      c.lastContactFrame=t;
      tojiCineImpactFX(c,1.28,'#ffffff');
      tojiCineDust(o.x,o.y,.92);
      /* Contact point is centered on the grounded torso/chest area. */
      const chestDir=f.x<=o.x?1:-1;
      tojiCineFakeBlood(o.x+chestDir*5,o.y-20,chestDir,.60);
      vfxShockwave(o.x+chestDir*6,o.y-20,'#d3d9dc',58,14);
      flash(.16,'#ffffff');
    }
    if(t===978)tojiCineFakeBlood(o.x-f.facing*2,o.y-20,f.facing,.35);
  }else if(t<1020){
    const q=phase01(t,995,1020);f.x=lerp(c.targetBaseX+56,c.targetBaseX+40,q);o.x=lerp(c.targetBaseX+26,c.targetBaseX+34,q);f.y=ground;o.y=ground;o.cineKnockdown=1;
  }
  c.lastX=f.x;c.lastY=f.y;const shot=tojiCineShot(c);c.shot=shot.label;f.facing=f.x<=o.x?1:-1;o.facing=-f.facing;
  if(t===0||t%6===0){c.prevTargetX=o.x;c.prevTargetY=o.y;}
  if(t===74||t===155||t===235||t===335||t===440||t===550||t===650||t===690||t===735||t===825||t===875||t===925||t===960||t===995){flash(.035,'#111417');shake(.8);camPunch(.010);}
  if(t>=1020){tojiEndCinematicX(f);f.tojiWeaponPhase=null;f.tojiSeqHits=null;f.tojiMoveTween=null;f.tojiMotion='idle';f.tojiMotionFrame=0;f.tojiMotionTimer=0;endMove(f);return;}
}
function tojiEndCinematicX(f){
  const c=G.tojiCineX;if(!c||c.done)return;
  c.done=true;const o=c.target;
  f.invuln=Math.max(0,c.prevOwnerInvuln);f.x=clamp(c.baseX,WALL,ARENA_W-WALL);f.y=GROUND;f.vx=0;f.vy=0;f.facing=c.prevOwnerFacing;f.onGround=true;
  if(o){
    o.cineKnockdown=0;
    o.invuln=c.prevTargetInvuln;o.x=clamp(o.x+55,WALL,ARENA_W-WALL);o.y=GROUND;o.vx=0;o.vy=0;o.facing=c.prevTargetFacing;o.onGround=true;
    if(o.hp<=0){o.state='DEFEAT';o.stateFrame=0;o.hitstun=0;}else{o.state='IDLE';o.stateFrame=0;o.hitstun=0;o.blocking=false;}
  }
  cam.cine=0;cam.cineX=0;cam.cineY=0;cam.cineZoom=1;cam.tx=cam.x;cam.ty=cam.y;cam.tzoom=1;
  G.zoomPunch=0;G.camPunch=0;G.slowmoTarget=0;G.slowmo=0;
  /* Never leave the global shake/flash state behind when the cinematic ends. */
  G.shake=0;G.shakeX=0;G.shakeY=0;G.flash=0;G.camPunch=0;G.tojiCineX=null;
}

function tojiSetMotion(f,kind,frames=5){
  f.tojiMotion=kind;
  f.tojiMotionFrame=0;
  f.tojiMotionTimer=Math.max(1,frames|0);
}
function tojiStartTravel(f,targetX,frames=5,kind='dash'){
  const tx=clamp(targetX,WALL,ARENA_W-WALL);
  f.tojiMoveTween={from:f.x,to:tx,frames:Math.max(1,frames|0),t:0,kind};
  tojiSetMotion(f,kind,frames);
}
function tojiBlink(f,targetX){
  const tx=clamp(targetX,WALL,ARENA_W-WALL);
  const old=f.x;
  f.x=tx;
  f.tojiMoveTween=null;
  tojiSetMotion(f,'blink',7);
  f.invuln=Math.max(f.invuln,8);
  for(let i=0;i<4;i++)pushAfterimage(f,computePose(f));
  ring(old,f.y-72,'#778087',28,12);
  ring(tx,f.y-72,'#e8ecef',34,16);
  flash(0.14,'#e8ecef');
  SFX.dash();
}
function tojiTickMotion(f){
  if(f.tojiMoveTween){
    const q=Math.min(1,(f.tojiMoveTween.t+1)/f.tojiMoveTween.frames);
    const e=1-Math.pow(1-q,3);
    f.x=clamp(lerp(f.tojiMoveTween.from,f.tojiMoveTween.to,e),WALL,ARENA_W-WALL);
    f.tojiMoveTween.t++;
    f.tojiMotionFrame=f.tojiMoveTween.t;
    if(f.tojiMotion==='dash'&&f.tojiMotionFrame%2===0)pushAfterimage(f,computePose(f));
    if(f.tojiMoveTween.t>=f.tojiMoveTween.frames){f.tojiMoveTween=null;}
  }else if(f.tojiMotionTimer>0){
    f.tojiMotionFrame++;
  }
  if(f.tojiMotionTimer>0){
    f.tojiMotionTimer--;
    if(f.tojiMotionTimer<=0){f.tojiMotion='idle';f.tojiMotionFrame=0;}
  }
}
function youngGojoSetMotion(f,kind,frames=5){
  f.youngMotion=kind;
  f.youngMotionFrame=0;
  f.youngMotionTimer=Math.max(1,frames|0);
}
function youngGojoStartTravel(f,targetX,frames=5,kind='dash'){
  const tx=clamp(targetX,WALL,ARENA_W-WALL);
  f.youngMoveTween={from:f.x,to:tx,frames:Math.max(1,frames|0),t:0,kind};
  youngGojoSetMotion(f,kind,frames);
}
function youngGojoBlink(f,targetX){
  const tx=clamp(targetX,WALL,ARENA_W-WALL),old=f.x;
  f.youngMoveTween={from:old,to:tx,frames:3,t:0,kind:'blink'};
  youngGojoSetMotion(f,'blink',6);
  f.invuln=Math.max(f.invuln,7);
  for(let i=0;i<2;i++)pushAfterimage(f,computePose(f));
  ring(old,f.y-72,'#74d9ff',24,10);
  ring(tx,f.y-72,'#edfaff',32,14);
  flash(0.08,'#d9f7ff');
  SFX.dash();
}
function youngGojoTickMotion(f){
  if(f.youngMoveTween){
    const q=Math.min(1,(f.youngMoveTween.t+1)/f.youngMoveTween.frames);
    let e=q;
    if(f.youngMoveTween.kind==='run') e=q*q*(3-2*q);
    else if(f.youngMoveTween.kind==='dash') e=1-Math.pow(1-q,4);
    else if(f.youngMoveTween.kind==='blink') e=q<0.5?(2*q*q):(1-Math.pow(-2*q+2,2)/2);
    f.x=clamp(lerp(f.youngMoveTween.from,f.youngMoveTween.to,e),WALL,ARENA_W-WALL);
    f.youngMoveTween.t++;
    f.youngMotionFrame=f.youngMoveTween.t;
    if((f.youngMoveTween.kind==='dash'||f.youngMoveTween.kind==='blink')&&f.youngMotionFrame%1===0)pushAfterimage(f,computePose(f));
    if(f.youngMoveTween.t>=f.youngMoveTween.frames)f.youngMoveTween=null;
  }else if(f.youngMotionTimer>0){
    f.youngMotionFrame++;
  }
  if(f.youngMotionTimer>0){
    f.youngMotionTimer--;
    if(f.youngMotionTimer<=0){f.youngMotion='idle';f.youngMotionFrame=0;}
  }
}
function youngGojoHit(f,key,damage,hb,opts={}){return tojiSeqHit(f,key,damage,hb,opts);}
/* ===== YOUNG GOJO MODERN-ART VFX =====
   Design language: flowing vector ribbons, angular light fragments, spatial shards,
   sparse geometry, and kinetic particle fields. Circular rings are reserved for
   spatial boundaries, not as the primary attack artwork. */
function ygP(x,y,vx,vy,size,color,life,shape='circle',rot=0,grav=0){
  const p=pget();
  p.active=true;p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.size=size;p.color=color;
  p.maxLife=p.life=life;p.grav=grav;p.shape=shape;p.rot=rot;p.vr=rnd(-0.08,0.08);p.add=true;
  return p;
}
function ygFlow(cx,cy,dir,colorA,colorB,count=12,spread=0.7,speed=5.4){
  for(let i=0;i<count;i++){
    const a=rnd(-spread,spread),s=rnd(speed*0.55,speed*1.12),off=rnd(-18,18);
    const p=ygP(cx+dir*off,cy+rnd(-24,24),Math.cos(a)*s*dir,Math.sin(a)*s,rnd(2.4,6.5),Math.random()<0.5?colorA:colorB,rnd(12,24),'streak',a+(dir<0?Math.PI:0));
    p.w=rnd(-2.5,2.5);
  }
}
function ygShards(cx,cy,dir,colorA,colorB,count=14,spd=5.5){
  for(let i=0;i<count;i++){
    const a=rnd(-Math.PI,Math.PI),s=rnd(spd*0.5,spd*1.3);
    const p=ygP(cx,cy,Math.cos(a)*s+dir*rnd(0.4,1.8),Math.sin(a)*s,rnd(2,5.5),Math.random()<0.5?colorA:colorB,rnd(14,28),'shard',a);
    p.vx*=0.98;p.vy*=0.98;
  }
}
function ygRibbons(cx,cy,dir,color,count=3,life=22,amp=16){
  for(let i=0;i<count;i++){
    const p=ygP(cx+dir*rnd(-4,16),cy+rnd(-amp,amp),dir*rnd(1.4,2.8),rnd(-0.6,0.6),rnd(3,6),color,life,'streak',dir<0?Math.PI:0);
    p.w=Math.sin(i*1.7)*amp*0.18;
  }
}
function ygCrosses(cx,cy,color,count=7){
  for(let i=0;i<count;i++){
    const a=Math.random()*6.283,r=rnd(18,72);
    const p=ygP(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.65,rnd(-0.4,0.4),rnd(-0.6,0.6),rnd(2.5,5),color,rnd(12,24),'cross',a);
  }
}
function ygSpatialEdge(cx,cy,color,radius,span=1.1,life=18,rot=0){
  // Spatial boundary is implied by fragments and light slices, never by a drawn circle.
  const count=Math.max(5,Math.min(11,Math.round(radius/18)));
  for(let i=0;i<count;i++){
    const u=count===1?0:i/(count-1);
    const a=rot-span+(span*2)*u+rnd(-0.08,0.08);
    const r=radius*rnd(0.72,1.02);
    const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r*0.58;
    const p=ygP(x,y,-Math.cos(a)*rnd(0.7,1.8),-Math.sin(a)*rnd(0.45,1.5),rnd(2.0,4.8),color,rnd(Math.max(8,life-3),life+8),Math.random()<0.5?'shard':'diamond',a+Math.PI*0.5);
    p.h=rnd(6,14);p.w=rnd(2,5);
  }
  for(let i=0;i<3;i++)ygP(cx+rnd(-radius*0.35,radius*0.35),cy+rnd(-radius*0.28,radius*0.28),Math.cos(rot)*rnd(1.5,3.2),Math.sin(rot)*rnd(0.8,2.2),rnd(2,3.6),color,rnd(8,16),'streak',rot);
}
function ygBlueBurst(cx,cy,dir,power=1){
  ygFlow(cx,cy,dir,'#e8fbff','#59d7ff',14,0.9,6.2*power);
  ygShards(cx,cy,dir,'#bcefff','#5bcfff',10,6.6*power);
  ygRibbons(cx,cy,dir,'#d7f8ff',4,20,18);
}
function ygRedBurst(cx,cy,dir,power=1){
  ygFlow(cx,cy,dir,'#fff2f4','#ff4e72',10,0.75,5.8*power);
  ygShards(cx,cy,dir,'#ffd8df','#ff5877',16,7.5*power);
  for(let i=0;i<5;i++){
    const p=ygP(cx+dir*rnd(-10,24),cy+rnd(-28,28),dir*rnd(2.5,5),rnd(-1.4,1.4),rnd(4,7),'#ff9db0',rnd(12,22),'diamond',rnd(-0.8,0.8));
    p.h=rnd(7,14);p.w=rnd(3,6);
  }
}
function ygReadField(cx,cy,dir){
  ygCrosses(cx,cy,'#d9faff',8);
  ygRibbons(cx,cy,dir,'#a6eaff',3,28,12);
  for(let i=0;i<8;i++){
    const x=cx+dir*rnd(18,120),y=cy+rnd(-64,26);
    const p=ygP(x,y,dir*rnd(0.5,1.5),rnd(-0.3,0.3),rnd(2,4),'#efffff',rnd(14,26),'diamond',rnd(-0.5,0.5));
    p.h=rnd(5,10);p.w=rnd(2,4);
  }
}
function ygDistanceLock(cx,cy,dir){
  for(let i=0;i<5;i++)ygSpatialEdge(cx+dir*rnd(0,12),cy,'#d8fbff',48+i*17,0.55,14+i*2,(i*0.7)+(fmod(G.frame,6)*0.04));
  ygCrosses(cx+dir*28,cy,'#ecfeff',9);
  ygFlow(cx+dir*20,cy,dir,'#ffffff','#83e3ff',9,0.55,3.3);
}
function ygOrbitField(cx,cy,dir,t){
  const colors=['#9feaff','#e9fbff','#76d8ff'];
  for(let k=0;k<3;k++){
    const a=t*0.11+k*2.094;
    const px=cx+Math.cos(a)*76,py=cy+Math.sin(a)*30;
    ygRibbons(px,py,dir,colors[k],2,18,10);
    for(let i=0;i<3;i++){
      const p=ygP(px+rnd(-8,8),py+rnd(-8,8),-Math.sin(a)*2.2,Math.cos(a)*0.9,rnd(2.5,4.5),colors[k],rnd(12,20),'shard',a+Math.PI*0.5);
      p.h=rnd(6,12);p.w=rnd(2,4);
    }
  }
}
function ygStepGlyph(cx,cy,dir){
  for(let i=0;i<4;i++){
    const p=ygP(cx+dir*rnd(-10,18),cy+rnd(-44,34),dir*rnd(1.5,3),rnd(-0.8,0.8),rnd(3,5.5),'#efffff',rnd(10,18),'diamond',rnd(-0.55,0.55));
    p.h=rnd(8,15);p.w=rnd(2.4,4.5);
  }
  ygSpatialEdge(cx,cy,'#e7fcff',28,0.8,11,dir<0?Math.PI:0);
}
function ygAwaken(cx,cy,dir,t){
  const phase=Math.min(1,t/52);
  ygRibbons(cx+dir*18,cy,dir,'#9feaff',4,22,18);
  ygRibbons(cx+dir*22,cy,dir,'#ff8ea4',4,22,18);
  for(let i=0;i<8;i++){
    const a=i/8*6.283+t*0.06;
    const r=34+phase*72;
    const col=i%2?'#e7d9ff':'#b8f0ff';
    const p=ygP(cx+dir*112+Math.cos(a)*r,cy+Math.sin(a)*r*0.55,-Math.cos(a)*2.2, -Math.sin(a)*1.2,rnd(2.5,5),col,rnd(16,28),'shard',a+0.6);
    p.h=rnd(6,12);p.w=rnd(2,4);
  }
  if(t%5===0)ygCrosses(cx+dir*112,cy,'#f1e8ff',4);
}
function fmod(a,b){return a-Math.floor(a/b)*b;}
function updateYoungGojoRedCounterStandalone(f,m){
  let s=f.youngRedCounterState;
  if(!s){s={phase:'ready',t:0,target:null,originX:f.x,originY:f.y};f.youngRedCounterState=s;}
  s.t++;
  const trg=(s.target&&s.target.hp>0)?s.target:null;
  if(s.phase==='ready'){
    f.state='ATTACK';f.onGround=true;f.x=s.originX;f.y=GROUND;f.vx=0;f.vy=0;
    f.youngRedCounterReady=true;
    f.youngRedCounterInverted=false;f.youngRedCounterHidden=false;
    if(!f.youngRedCounterTriggered&&s.t>=32){
      f.youngRedCounterReady=false;
      f.youngRedCounterState=null;
      f.youngRedCounterAttacker=null;
      f.youngRedCounterTriggered=false;
      f.youngRedCounterInverted=false;f.youngRedCounterHidden=false;f.youngRedCounterAngle=0;
      endMove(f);return;
    }
    return;
  }
  if(s.phase==='vanish'){
    f.youngRedCounterHidden=true;f.youngRedCounterInverted=false;
    f.x=s.originX;f.y=GROUND;f.onGround=false;f.vx=0;f.vy=0;
    if(s.t>=6){
      if(!trg){
        f.youngRedCounterState=null;f.youngRedCounterHidden=false;f.youngRedCounterInverted=false;f.youngRedCounterAngle=0;
        f.y=GROUND;f.onGround=true;f.state='IDLE';endMove(f);return;
      }
      s.phase='aerial';s.t=0;
      const tf=trg.facing||1;
      s.behindX=clamp(trg.x-tf*118,WALL,ARENA_W-WALL);
      f.x=s.behindX;f.y=GROUND-154;f.onGround=false;f.vx=0;f.vy=0;
      f.facing=(trg.x>=f.x)?1:-1;
      f.state='JUMP';f.youngRedCounterInverted=true;f.youngRedCounterHidden=false;f.youngRedCounterAngle=Math.PI;
      ring(f.x,f.y-20,'#ff7893',40,18);flash(.12,'#f7e9ed');SFX.red();
    }
    return;
  }
  if(s.phase==='aerial'){
    f.youngRedCounterInverted=true;f.youngRedCounterHidden=false;f.state='JUMP';f.onGround=false;f.vx=0;f.vy=0;
    if(trg){
      s.behindX=clamp(trg.x-(trg.facing||1)*118,WALL,ARENA_W-WALL);
      f.x=s.behindX;f.facing=(trg.x>=f.x)?1:-1;
    }
    const q=clamp(s.t/34,0,1);
    const hover=Math.sin(q*Math.PI)*6;
    f.y=GROUND-154-hover;
    f.youngRedCounterAngle=Math.PI + Math.sin(clamp((s.t-16)/18,0,1)*Math.PI)*0.055;
    if(s.t<8)yg20BackflipBurst(f);
    if(s.t>=8&&s.t<30){
      const q2=clamp((s.t-8)/22,0,1);
      const px=f.x-f.facing*(38+12*q2),py=f.y+58;
      yg20RedCore(px,py,18+12*q2,.72+.22*q2);
      yg20RedPressure(px,py,56+42*q2,.46+.20*q2);
    }
    if(s.t>=30){
      s.phase='release';s.t=0;
      s.shot={x:f.x-f.facing*52,y:f.y+58,target:trg,targetX:trg?trg.x:f.x-f.facing*220,targetY:trg?trg.y-72:f.y+58,launched:false};
    }
    return;
  }
  if(s.phase==='release'){
    const shot=s.shot;
    if(!shot){s.phase='recover';s.t=0;return;}
    if(!shot.launched){
      const tx=(shot.target&&shot.target.hp>0)?shot.target.x:shot.targetX;
      const ty=(shot.target&&shot.target.hp>0)?shot.target.y-72:shot.targetY;
      const dx=tx-shot.x,dy=ty-shot.y,len=Math.max(1,Math.hypot(dx,dy));
      G.youngRedCounterProjectile={x:shot.x,y:shot.y,vx:dx/len*18,vy:dy/len*18,dir:f.facing,life:38,t:0,target:shot.target||null,hitDone:false,owner:f,trailAge:0};
      shot.launched=true;
      yg20RedCore(shot.x,shot.y,32,1);yg20RedPressure(shot.x,shot.y,100,.9);
      flash(.12,'#ffdbe2');shake(5);camPunch(.08);SFX.red();
      // IMPORTANT: release the fighter immediately. The projectile owns the rest of the attack.
      f.youngRedCounterInverted=false;f.youngRedCounterHidden=false;f.youngRedCounterAngle=0;
      f.youngRedCounterState=null;f.youngRedCounterReady=false;f.youngRedCounterTriggered=false;f.youngRedCounterAttacker=null;
      f.youngMotion='idle';f.youngMotionFrame=0;f.youngMotionTimer=0;f.youngMoveTween=null;
      f.move=null;f.moveKey=null;f.moveFrame=-1;
      f.state='FALL';f.stateFrame=0;f.onGround=false;f.vy=2.8;f.vx=0;f.invuln=Math.max(f.invuln,8);
      return;
    }
  }
}
function updateYoungGojoMove(f,m){
  const t=f.moveFrame,d=moveDuration(m),target=()=>f.opp&&f.opp.state!=='DEFEAT'?f.opp:null;
  f.youngPhase=f.youngPhase||0;
  youngGojoTickMotion(f);
  const face=trg=>{if(trg)f.facing=trg.x>=f.x?1:-1;};
  if(t===1){f.youngPhase=0;f.youngPurpleState=null;}
  const chase=(gap=90,frames=4,kind='run')=>{const trg=target();if(!trg)return;face(trg);youngGojoStartTravel(f,trg.x-f.facing*gap,frames,kind);};
  if(m.kind==='young_blue'){
    if(t===1){SFX.blue();floatText(f.x,f.y-192,'BLUE VECTOR','#b7f4ff',18,36);youngGojoSetMotion(f,'focus',5);}
    if(t>=4&&t<18){const a=(t-4)*0.52,px=f.x+f.facing*62,py=f.y-88;ygSpatialEdge(px,py,'#9feaff',22+a*1.2,0.85,10,t*0.06);if(t%3===0)ygBlueBurst(px,py,f.facing,0.55);}
    if(t===18)chase(118,4,'run');
    if(t===30){const trg=target();if(trg){face(trg);youngGojoHit(f,'blueMark',7,{x:14,y:-116,w:176,h:105},{hitstun:18,kbx:4,kby:-2,hitstop:6,kind:'skill1',meter:4});}const px=f.x+f.facing*78,py=f.y-92;ygBlueBurst(px,py,f.facing,1);SFX.blue();}
    if(t>=34&&t<48){const trg=target();if(trg){face(trg);youngGojoStartTravel(f,trg.x+f.facing*46,3,'dash');}if(t%2===0)pushAfterimage(f,computePose(f));}
    if(t===54){const trg=target();if(trg){face(trg);youngGojoHit(f,'blueCut',10,{x:18,y:-128,w:214,h:110},{hitstun:24,kbx:8,kby:-5,hitstop:8,kind:'skill1',meter:6});}ygRibbons(f.x+f.facing*66,f.y-92,f.facing,'#dffaff',5,18,14);ygShards(f.x+f.facing*66,f.y-92,f.facing,'#bff5ff','#7edfff',10,5.5);shake(7);}
    if(t>=59&&t<75){const trg=target();if(trg){face(trg);youngGojoStartTravel(f,trg.x-f.facing*(70+Math.sin(t)*20),3,'run');}if(t%4===0){ygRibbons(f.x+f.facing*46,f.y-90,f.facing,'#9feaff',4,18,15);ygCrosses(f.x+f.facing*46,f.y-90,'#dffaff',5);pushAfterimage(f,computePose(f));}}
    if(t===78){const trg=target();if(trg){face(trg);youngGojoStartTravel(f,trg.x-f.facing*34,2,'dash');}youngGojoHit(f,'blueVectorFinisher',15,{x:8,y:-138,w:244,h:116},{hitstun:32,kbx:12,kby:-7,hitstop:11,kind:'skill1',meter:8});ygSpatialEdge(f.x+f.facing*60,f.y-95,'#f3feff',76,0.9,18,f.facing<0?Math.PI:0);ygShards(f.x+f.facing*60,f.y-95,f.facing,'#f4ffff','#9feaff',18,7.2);flash(0.10,'#dff7ff');shake(9);}
    if(t===86)youngGojoBlink(f,(target()?.x||f.x+f.facing*70)-f.facing*92);
  }
  if(m.kind==='young_red'){
    if(t===1){SFX.red();floatText(f.x,f.y-192,'RED COUNTERFORCE','#ff9aac',18,38);youngGojoSetMotion(f,'charge',7);}
    if(t>=4&&t<22){const q=(t-4)/18,px=f.x+f.facing*(40+q*20),py=f.y-86;ygRibbons(px,py,f.facing,'#ff718b',3,16,12);ygShards(px,py,f.facing,'#ffdbe2','#ff6684',4,3.5);}
    if(t===24){const trg=target();if(trg)face(trg);const px=f.x+f.facing*58,py=f.y-88;ygRedBurst(px,py,f.facing,1);f.vx=-f.facing*10;SFX.red();youngGojoHit(f,'redBurstCore',15,{x:26,y:-118,w:216,h:126},{hitstun:28,kbx:18,kby:-9,hitstop:11,kind:'skill2',meter:8,armorBreak:true});flash(0.16,'#ff91a5');shake(11);camPunch(0.18);}
    if(t>24&&t<40){f.x=clamp(f.x+f.vx,WALL,ARENA_W-WALL);f.vx*=0.74;youngGojoSetMotion(f,'dash',4);if(t%2===0)pushAfterimage(f,computePose(f));}
    if(t===46){const trg=target();if(trg){face(trg);youngGojoStartTravel(f,trg.x-f.facing*120,4,'run');}}
    if(t===58){const trg=target();if(trg){face(trg);youngGojoHit(f,'redReversal',10,{x:24,y:-116,w:190,h:112},{hitstun:22,kbx:11,kby:-5,hitstop:8,kind:'skill2',meter:6});}ygRibbons(f.x+f.facing*54,f.y-90,f.facing,'#ff7f97',4,16,14);ygShards(f.x+f.facing*54,f.y-90,f.facing,'#ffdbe2','#ff6684',8,5.2);}
    if(t===72){const trg=target();if(trg){face(trg);youngGojoBlink(f,trg.x-f.facing*128);}flash(0.11,'#fff0f3');SFX.dash();}
    if(t===82){const px=f.x+f.facing*54,py=f.y-88;youngGojoHit(f,'redEcho',14,{x:12,y:-125,w:220,h:118},{hitstun:30,kbx:15,kby:-8,hitstop:10,kind:'skill2',meter:8});ygRibbons(px,py,f.facing,'#ffdce3',5,18,18);ygShards(px,py,f.facing,'#ff7690','#ffdce3',16,7.2);shake(9);}
  }
  if(m.kind==='young_sixeyes'){
    if(t===1){f.youngSixEyes=d;flash(0.12,'#e9fbff');floatText(f.x,f.y-192,'SIX EYES // READ THE FUTURE','#e5fbff',17,42);SFX.skill();youngGojoSetMotion(f,'eyes',8);}
    if(t%7===0&&t<130){const trg=target();if(trg){face(trg);const dx=trg.x-f.x;const lead=clamp(dx*0.18,-150,150);ygCrosses(f.x+f.facing*lead,f.y-86,'#d7fbff',4);}if(t%14===0){ygReadField(f.x,f.y-88,f.facing);pushAfterimage(f,computePose(f));}}
    if(t>=20&&t<120){const trg=target();if(trg&&Math.abs(trg.x-f.x)>150)youngGojoStartTravel(f,trg.x-f.facing*118,6,'run');if(t%18===0){floatText(f.x+f.facing*18,f.y-146,'READ','#dffaff',12,20);ygReadField(f.x+f.facing*40,f.y-90,f.facing);}}
    if(t===132){const trg=target();if(trg){face(trg);youngGojoBlink(f,trg.x-f.facing*105);}const px=f.x+f.facing*54,py=f.y-90;ygSpatialEdge(px,py,'#f6ffff',62,0.85,16,0);ygReadField(px,py,f.facing);youngGojoHit(f,'futureRead',12,{x:14,y:-122,w:188,h:110},{hitstun:26,kbx:11,kby:-5,hitstop:9,kind:'skill3',meter:10,armorBreak:true});flash(0.14,'#ffffff');}
  }
  if(m.kind==='young_limitless'){
    if(t===1){f.youngInfinity=d;floatText(f.x,f.y-192,'INFINITY // DISTANCE LOCK','#dffaff',17,38);SFX.skill();youngGojoSetMotion(f,'infinity',6);ygSpatialEdge(f.x,f.y-72,'#e4fbff',46,1.0,15,0);ygCrosses(f.x,f.y-72,'#dffaff',5);}
    if(t>=8&&t<150){const q=t/150,base=38+Math.sin(t*0.12)*3;ygDistanceLock(f.x+f.facing*20,f.y-78,f.facing);if(t%20===0){ygRibbons(f.x+f.facing*44,f.y-80,f.facing,'#dffaff',3,18,10);}if(t%24===0){const trg=target();if(trg){face(trg);youngGojoStartTravel(f,trg.x-f.facing*136,6,'run');}}}
    if(t===112){const trg=target();if(trg){face(trg);youngGojoBlink(f,trg.x-f.facing*158);}floatText(f.x,f.y-162,'DISTANCE ZERO','#f5ffff',13,22);ygSpatialEdge(f.x+f.facing*36,f.y-84,'#efffff',72,0.9,18,0);ygShards(f.x+f.facing*36,f.y-84,f.facing,'#e9ffff','#83deff',14,6.5);youngGojoHit(f,'distanceZero',13,{x:8,y:-128,w:210,h:116},{hitstun:28,kbx:14,kby:-7,hitstop:10,kind:'skill4',meter:11});shake(8);flash(0.12,'#e9ffff');}
  }
  if(m.kind==='young_maxblue'){
    // v20: Maximum Output: Blue is a stationary, water-like spatial core.
    // Gojo controls it from the hand; the orb itself never travels across the field.
    if(typeof youngGojoMaxBlueV20==='function'){youngGojoMaxBlueV20(f,m,t,target,face);return;}
  }
  if(m.kind==='young_z'){
    if(f.awakened){
      updateYoungGojoRedCounterStandalone(f,m);
      return;
    }else if(!f.awakened){
      // Legacy pre-awakening Limitless Step remains available.
      if(t===1){SFX.skill();floatText(f.x,f.y-188,'LIMITLESS STEP','#e9fbff',17,30);youngGojoSetMotion(f,'blink',5);}
      if(t===8){const trg=target();if(trg){face(trg);youngGojoBlink(f,trg.x-f.facing*118);}}
      if(t===18){const trg=target();if(trg){youngGojoHit(f,'stepPalm',8,{x:18,y:-120,w:182,h:108},{hitstun:19,kby:-3,hitstop:7,kind:'skill1',meter:5});}ygStepGlyph(f.x+f.facing*44,f.y-84,f.facing);}
      if(t>=30&&t<48){const trg=target();if(trg){face(trg);youngGojoStartTravel(f,trg.x+f.facing*54,3,'dash');}if(t%2===0)pushAfterimage(f,computePose(f));}
      if(t===52){const trg=target();if(trg){face(trg);youngGojoHit(f,'stepFinish',10,{x:10,y:-132,w:220,h:114},{hitstun:24,kby:-6,hitstop:8,kind:'skill2',meter:7});}flash(.10,'#efffff');}
    }
  }
  if(m.kind==='young_x'){
    if(t===1){floatText(f.x,f.y-198,'LIMITLESS // AWAKENED','#ffffff',19,52);SFX.awaken();youngGojoSetMotion(f,'awakening',10);flash(0.24,'#e9fbff');}
    if(t>=16&&t<56){const s=Math.sin(t*0.18);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.16;ctx.fillStyle='#e8fbff';ctx.beginPath();ctx.ellipse(f.x,f.y-94,68+Math.abs(s)*12,94,0,0,Math.PI*2);ctx.fill();ctx.restore();if(t%6===0){ygAwaken(f.x,f.y-96,f.facing,t);pushAfterimage(f,computePose(f));}const trg=target();if(trg&&Math.abs(trg.x-f.x)>110){face(trg);youngGojoStartTravel(f,trg.x-f.facing*96,5,'run');}}
    if(t===62){const trg=target();if(trg){face(trg);youngGojoBlink(f,trg.x-f.facing*118);}flash(0.14,'#e8fbff');}
    if(t>=78&&t<126){const baseX=f.x+f.facing*112,baseY=f.y-96,a=t*0.11,bx=baseX+Math.cos(a)*46,by=baseY+Math.sin(a)*32,rx=baseX+Math.cos(a+Math.PI)*46,ry=baseY+Math.sin(a+Math.PI)*32;ygRibbons(bx,by,f.facing,'#8feaff',3,18,10);ygRibbons(rx,ry,f.facing,'#ff718a',3,18,10);ygShards(bx,by,f.facing,'#dffaff','#7edfff',4,4.0);ygShards(rx,ry,f.facing,'#ffdce3','#ff6885',4,4.2);}
    if(t===132){const cx=f.x+f.facing*112,cy=f.y-96;ygSpatialEdge(cx,cy,'#8ceaff',58,0.7,16,0);ygSpatialEdge(cx,cy,'#ff6c87',46,0.7,14,1.4);ygSpatialEdge(cx,cy,'#f1e8ff',26,0.8,12,2.8);ygCrosses(cx,cy,'#efe8ff',8);floatText(cx,cy-44,'CONVERGENCE','#f6ecff',12,24);SFX.blue();SFX.red();}
    if(t>=144&&t<190){const q=(t-144)/46,cx=f.x+f.facing*(112-72*q),cy=f.y-96;ygSpatialEdge(cx,cy,'#d8c9ff',34+q*26,0.8,12,t*0.05);ygRibbons(cx,cy,f.facing,'#ede4ff',4,16,14);if(t%5===0)ygShards(cx,cy,f.facing,'#ffffff','#dccaff',3,3.6);}
    if(t===196){const cx=f.x+f.facing*48,cy=f.y-92;flash(0.30,'#f3eaff');SFX.purple();shake(18);camPunch(0.24);G.hitstop=Math.max(G.hitstop,16);const pr=spawnProjectile(f,{type:'young_purple',damage:42,hitstun:48,blockstun:26,kbx:16,kby:-10,speed:18,w:116,h:86,life:92,hitstop:15,armorBreak:true},64,-90);pr.youngPurple=true;ygAwaken(cx,cy,f.facing,68);ygShards(cx,cy,f.facing,'#ffffff','#eadcff',30,10);ygSpatialEdge(cx,cy,'#ffffff',102,0.95,22,0);ygSpatialEdge(cx,cy,'#bf8dff',142,0.85,24,1.6);}
    if(t>=206&&t<244){const trg=target();if(trg&&Math.abs(trg.x-f.x)>84){face(trg);youngGojoStartTravel(f,trg.x-f.facing*68,5,'run');}if(t%7===0)pushAfterimage(f,computePose(f));}
    if(t===252){const trg=target();if(trg){face(trg);youngGojoStartTravel(f,trg.x-f.facing*50,3,'dash');}youngGojoHit(f,'awakenedImpact',16,{x:6,y:-146,w:264,h:126},{hitstun:42,kbx:17,kby:-9,hitstop:13,kind:'young_x',meter:12,armorBreak:true});ygSpatialEdge(f.x+f.facing*52,f.y-92,'#eadbff',92,0.8,22,0);ygShards(f.x+f.facing*52,f.y-92,f.facing,'#ffffff','#d8c4ff',20,8);shake(12);}
  }
  if(t>=d){f.youngMoveTween=null;f.youngMotion='idle';f.youngMotionFrame=0;f.youngMotionTimer=0;f.youngPhase=0;f.youngPurpleState=null;endMove(f);}
}
function updateTojiOverhaulMove(f,m){
  const t=f.moveFrame,d=(f.tojiMoveDuration||moveDuration(m)),dir=f.facing,o=f.opp;
  f.tojiSeqHits=f.tojiSeqHits||{};
  tojiTickMotion(f);
  const liveTarget=()=>f.opp&&f.opp.state!=='DEFEAT'?f.opp:null;
  const faceTarget=target=>{if(target)f.facing=target.x>=f.x?1:-1;};
  const chase=target=>{if(!target)return;const dx=target.x-f.x;if(Math.abs(dx)<4){tojiSetMotion(f,'run',2);return;}f.facing=dx>=0?1:-1;f.x=clamp(f.x+clamp(dx*0.14,-8,8),WALL,ARENA_W-WALL);tojiSetMotion(f,'run',3);if(t%4===0)pushAfterimage(f,computePose(f));};
  const burstDash=(target,dist=44)=>{
    const trg=target||liveTarget();let tx=f.x+dir*dist;
    if(trg){faceTarget(trg);tx=trg.x-f.facing*dist*0.16;}
    tojiStartTravel(f,clamp(tx,WALL,ARENA_W-WALL),Math.max(3,Math.min(7,Math.round(Math.abs(tx-f.x)/32)+2)),'dash');
    f.invuln=Math.max(f.invuln,6);pushAfterimage(f,computePose(f));SFX.dash();
  };
  const lockGround=()=>{f.y=GROUND;f.vy=0;f.onGround=true;};
  const lockAir=(y)=>{f.y=y;f.vy=0;f.onGround=false;};

  if(t===1){
    f.tojiSeqHits={};f.tojiWeaponPhase=m.tojiOverhaul;
    if(m.tojiOverhaul==='zero')f.tojiHunt=m.buff?.duration||d;
    if(m.tojiOverhaul==='arsenal')f.invuln=Math.max(f.invuln,Math.min(110,m.invuln||110));
  }

  /* M1: ONE CLICK = ONE beat. First click is a ~3s Inventory Curse draw/catch;
     later clicks each perform exactly one distinct attack. */
  if(m.tojiOverhaul==='basicLight'){
    const step=Math.max(0,Math.min(4,f.tojiM1Step||0));
    if(step===0){
      if(t===1){f.tojiInventoryOpen=180;tojiSetMotion(f,'crouch',8);floatText(f.x,f.y-186,'INVENTORY CURSE // DRAW','#e9edef',16,34);SFX.skill();}
      if(t<58){const q=clamp((t-1)/57,0,1);f.tojiInventoryOpen=180-t*2.5;tojiSetMotion(f,'crouch',5);if(t%8===0)tojiSeqFX(f,'CURSE OPENS','#dfe5e8',.12);}
      if(t>=58&&t<112){tojiSetMotion(f,'draw',7);f.tojiInventoryOpen=36;}
      if(t>=70&&t<130&&t%4===0){
        const ang=-0.35+Math.sin((t-70)*0.22)*0.95;
        const mouth={x:f.x-f.facing*43,y:f.y-91};
        const hand={x:f.x+f.facing*34,y:f.y-100};
        const q=clamp((t-70)/60,0,1);const px=lerp(mouth.x,hand.x,q),py=lerp(mouth.y,hand.y,q);
        tojiSeqFX(f,'CHAIN ROTATION','#d9e0e3',.14);
        drawTojiCineInvertedSpear(ctx,{x:px,y:py},ang,f.facing,t);
      }
      if(t>=112&&t<148){tojiSetMotion(f,'catch',8);f.tojiInventoryOpen=10;}
      if(t===128){tojiSeqFX(f,'ISOH CAUGHT','#ffffff',.30);ring(f.x+f.facing*34,f.y-98,'#edf1f2',22,12);spark(f.x+f.facing*38,f.y-98,10,'#ffffff',3.2,7,16,0);SFX.heavy();shake(4);}
      if(t>=148){f.tojiInventoryOpen=Math.max(0,180-(t-1)*3.0);tojiSetMotion(f,'ready',5);}
    }else if(step===1){
      if(t===1){tojiSetMotion(f,'slashDiag',7);const trg=liveTarget();if(trg)faceTarget(trg);burstDash(trg,24);}
      if(t===14){const trg=liveTarget();if(trg)faceTarget(trg);tojiSeqHit(f,'m1_diag',8,{x:12,y:-132,w:190,h:96},{hitstun:20,kbx:7,kby:-5,hitstop:7,kind:'light',meter:5});tojiSeqFX(f,'ISOH DIAGONAL CUT','#f3f5f6',.28);SFX.heavy();shake(5);}
    }else if(step===2){
      if(t===1){tojiSetMotion(f,'slashHorizontal',7);const trg=liveTarget();if(trg)faceTarget(trg);burstDash(trg,20);}
      if(t===13){const trg=liveTarget();if(trg)faceTarget(trg);tojiSeqHit(f,'m1_horizontal',9,{x:12,y:-108,w:226,h:62},{hitstun:21,kbx:8,kby:-1,hitstop:7,kind:'light',meter:5});tojiSeqFX(f,'ISOH HORIZONTAL CUT','#e3e7e9',.28);SFX.heavy();shake(5);}
    }else if(step===3){
      if(t===1){tojiSetMotion(f,'kick',7);const trg=liveTarget();if(trg)faceTarget(trg);}
      if(t===11){const trg=liveTarget();if(trg)faceTarget(trg);f.x=clamp(f.x+f.facing*18,WALL,ARENA_W-WALL);tojiSeqHit(f,'m1_kick',8,{x:24,y:-66,w:156,h:56},{hitstun:22,kbx:10,kby:-1,hitstop:7,kind:'light',meter:5});tojiSeqFX(f,'RIGHT SIDE KICK','#eef1f2',.24);SFX.heavy();shake(5);}
    }else{
      if(t===1){tojiSetMotion(f,'stabDown',8);const trg=liveTarget();if(trg)faceTarget(trg);burstDash(trg,22);}
      if(t===16){const trg=liveTarget();if(trg)faceTarget(trg);tojiSeqHit(f,'m1_stab',12,{x:20,y:-116,w:204,h:68},{hitstun:28,kbx:11,kby:-5,hitstop:10,kind:'light',meter:7,armorBreak:true});tojiSeqFX(f,'ISOH STAB','#ffffff',.34);flash(.14,'#f7f8f9');shake(7);SFX.heavy();}
    }
  }

  /* Heavy / long rake: one long body-level ISOH slash, then a backward aerial roll. */
  if(m.tojiOverhaul==='basicHeavy'){
    if(t===1){f.tojiInventoryOpen=16;SFX.skill();tojiSetMotion(f,'crouch',7);floatText(f.x,f.y-188,'INVERTED SPEAR // LONG RAKE','#e8ecee',17,40);}
    if(t===5){tojiSetMotion(f,'draw',7);}
    if(t===11){f.tojiInventoryOpen=0;const trg=liveTarget();if(trg)faceTarget(trg);tojiStartTravel(f,(trg?trg.x-f.facing*78:f.x+f.facing*38),5,'dash');}
    if(t===22){const trg=liveTarget();if(trg)faceTarget(trg);tojiSeqHit(f,'bh_rake',26,{x:4,y:-126,w:286,h:100},{hitstun:34,kbx:13,kby:-2,hitstop:12,kind:'heavy',meter:10,armorBreak:true});tojiSeqFX(f,'LONG BODY RAKE','#eef2f3',.34);vfxSlashTrail(f.x-f.facing*112,f.y-128,f.x+f.facing*168,f.y-32,'#f1f3f4',9,14);flash(.20,'#ffffff');shake(12);camPunch(.16);SFX.heavy();}
    if(t>=28&&t<58){
      if(t===28){f.tojiMotion='backflip';f.tojiMotionFrame=0;f.onGround=false;f.vy=-10.5;f.vx=-f.facing*5.2;pushAfterimage(f,computePose(f));}
      if(t%3===0)pushAfterimage(f,computePose(f));
      if(t===42)tojiSeqFX(f,'BACKFLIP RECOVERY','#cfd5d8',.18);
    }
    if(t>=58){lockGround();f.vx=0;f.vy=0;}
  }

  /* 3 / Split Soul Katana: high-to-low variation instead of repeated rising hits. */
  if(m.tojiOverhaul==='katana'){
    if(t===1){SFX.skill();floatText(f.x,f.y-188,'SPLIT SOUL KATANA','#e9edef',18,42);tojiSetMotion(f,'crouch',8);}
    if(t===8){burstDash(liveTarget(),32);}
    const strikes=[[16,32,38,'diagUp'],[42,54,58,'reverseLow'],[66,78,72,'crossHigh']];
    strikes.forEach(([cf,_,dist,label],i)=>{if(t===cf){const trg=liveTarget();if(trg)faceTarget(trg);burstDash(trg,dist);const hb=i===0?{x:20,y:-126,w:150,h:72}:i===1?{x:18,y:-78,w:168,h:58}:{x:28,y:-138,w:150,h:82};tojiSeqHit(f,'kat'+i,7+i*2,hb,{hitstun:18+i*4,kbx:6+i*2,kby:i===1?0:-6,kind:'skill1',meter:4+i*2,hitstop:i===2?8:4});tojiSeqFX(f,label==='reverseLow'?'LOW REVERSE CUT':(label==='crossHigh'?'CROSS RISE':'DIAGONAL DRAW'),white,.16+i*.06);SFX.heavy();}});
    if(t>=82&&t<100)chase(liveTarget());
    if(t===94){const trg=liveTarget();if(trg){faceTarget(trg);burstDash(trg,82);}tojiSeqHit(f,'kfin',18,{x:8,y:-92,w:220,h:62},{hitstun:38,kbx:14,kby:-9,hitstop:14,kind:'skill1',meter:10});flash(.28,'#ffffff');shake(12);camPunch(.18);SFX.heavy();}
  }

  /* 4 / Inverted Spear: long straight thrust, lower thrust, then diagonal downward finish. */
  if(m.tojiOverhaul==='isoh'){
    if(t===1){SFX.skill();floatText(f.x,f.y-188,'INVERTED SPEAR OF HEAVEN','#edf1f2',18,42);tojiSetMotion(f,'crouch',6);}
    if(t===9)burstDash(liveTarget(),26);
    const thrusts=[18,40,66,88];
    thrusts.forEach((cf,i)=>{if(t===cf){const trg=liveTarget();if(trg)faceTarget(trg);burstDash(trg,i===3?84:(i===2?54:32));
      const hb=i===0?{x:32,y:-116,w:190,h:54}:i===1?{x:32,y:-86,w:215,h:52}:i===2?{x:26,y:-62,w:185,h:50}:{x:42,y:-38,w:170,h:64};
      tojiSeqHit(f,'iso'+i,7+i*2,hb,{hitstun:18+i*3,blockstun:9,kbx:8+i,kby:i>=2?-5:0,kind:'skill2',meter:4,techBreak:i===1||i===3,hitstop:i===3?9:4});
      tojiSeqFX(f,['CHEST THRUST','LOW THRUST','HOOKED REACH','DOWNWARD PIERCE'][i],'#e9edef',.16+i*.06);SFX.heavy();
    }});
    if(t>=94&&t<108)chase(liveTarget());
    if(t===110){const trg=liveTarget();if(trg){faceTarget(trg);burstDash(trg,92);}tojiSeqHit(f,'isofin',20,{x:10,y:-98,w:240,h:58},{hitstun:44,kbx:17,kby:-10,hitstop:16,kind:'skill2',meter:11,techBreak:true});flash(.34,'#ffffff');shake(16);camPunch(.22);SFX.heavy();}
  }

  /* 5 / Chain: low sweep -> side pull -> high overhead crush. */
  if(m.tojiOverhaul==='chain'){
    if(t===1){SFX.skill();floatText(f.x,f.y-188,'CHAIN OF A THOUSAND MILES','#d9dde0',18,42);tojiSetMotion(f,'crouch',7);}
    if(t===12){f.tojiChainTarget=liveTarget();}
    if(t===20&&f.tojiChainTarget){const trg=f.tojiChainTarget;faceTarget(trg);burstDash(trg,72);tojiSeqFX(f,'CHAIN LOW SWEEP','#bfc6ca',.20);}
    if(t===30&&f.tojiChainTarget){const trg=f.tojiChainTarget;faceTarget(trg);trg.x=clamp(f.x+f.facing*78,WALL,ARENA_W-WALL);tojiSeqHit(f,'chainLow',8,{x:16,y:-54,w:250,h:48},{hitstun:20,kbx:7,kby:0,hitstop:8,kind:'skill3',meter:6});if(trg)trg.vx=f.facing*6;}
    const pulls=[46,62,80];
    pulls.forEach((cf,i)=>{if(t===cf){const trg=liveTarget();if(trg)faceTarget(trg);burstDash(trg,34+i*10);const hb=i===0?{x:18,y:-104,w:220,h:64}:i===1?{x:20,y:-126,w:240,h:72}:{x:24,y:-158,w:260,h:80};tojiSeqHit(f,'chain'+i,6+i*2,hb,{hitstun:16+i*5,kbx:5+i,kby:i===0?0:-5,kind:'skill3',meter:4});tojiSeqFX(f,['CHAIN PULL','CROSS-STAGE LASH','OVERHEAD LASH'][i],'#d8dde0',.12+i*.07);SFX.dash();}});
    if(t===102){const trg=liveTarget();if(trg){faceTarget(trg);burstDash(trg,94);}tojiSeqHit(f,'chainFin',18,{x:10,y:-148,w:286,h:100},{hitstun:44,kbx:17,kby:-12,hitstop:15,kind:'skill3',meter:11});flash(.30,'#e5e9eb');shake(14);camPunch(.20);SFX.heavy();}
  }

  /* 6 / Playful Cloud: deliberately uses upper, horizontal and ground-level strikes. */
  if(m.tojiOverhaul==='cloud'){
    if(t===1){SFX.skill();floatText(f.x,f.y-188,'PLAYFUL CLOUD','#e2e6e8',18,46);tojiSetMotion(f,'crouch',6);}
    if(t===12)burstDash(liveTarget(),20);
    const hits=[30,54,82,112,140];
    hits.forEach((cf,i)=>{if(t===cf){const trg=liveTarget();if(trg)faceTarget(trg);const dist=[28,44,58,36,92][i];burstDash(trg,dist);
      const hb=[{x:18,y:-150,w:168,h:76},{x:24,y:-104,w:205,h:60},{x:10,y:-74,w:225,h:54},{x:26,y:-126,w:220,h:80},{x:4,y:-48,w:290,h:54}][i];
      tojiSeqHit(f,'cloud'+i,7+i*2,hb,{hitstun:16+i*4,kbx:6+i,kby:i===4?0:(i>=2?-7:-3),hitstop:i>=3?7:4,kind:'skill4',meter:4+i});
      tojiSeqFX(f,['OVERHEAD HAMMER','HORIZONTAL SWING','RISING TURN','REVERSE ARC','FLOOR SWEEP'][i],'#dfe4e6',.13+i*.05);SFX.heavy();
    }});
    if(t>=138&&t<150)chase(liveTarget());
    if(t===152){const trg=liveTarget();if(trg){faceTarget(trg);burstDash(trg,104);}tojiSeqHit(f,'cloudfin',22,{x:4,y:-92,w:300,h:72},{hitstun:46,kbx:18,kby:-10,hitstop:17,kind:'skill4',meter:12});flash(.36,'#ffffff');shake(18);camPunch(.24);SFX.heavy();}
  }

  /* 7 / Zero Presence: side profile, pass-through, then a low rear strike. */
  if(m.tojiOverhaul==='zero'&&m.kind==='skill5'){
    if(t===1){SFX.dash();floatText(f.x,f.y-190,'ZERO PRESENCE','#e9edef',19,44);tojiSetMotion(f,'crouch',9);}
    if(t>=8&&t<24){chase(liveTarget());f.invuln=Math.max(f.invuln,4);}
    if(t===28){const trg=liveTarget();if(trg){faceTarget(trg);tojiBlink(f,trg.x-f.facing*128);}tojiSeqFX(f,'PREDATOR SHIFT','#eef1f2',.26);}
    if(t===40){const trg=liveTarget();if(trg)faceTarget(trg);burstDash(trg,54);tojiSeqHit(f,'zeroLow',12,{x:12,y:-70,w:180,h:50},{hitstun:36,kbx:15,kby:0,hitstop:11,kind:'skill5',meter:9});flash(.20,'#eef1f2');shake(8);SFX.heavy();}
    if(t>=54&&t<92){const trg=liveTarget();if(trg){faceTarget(trg);const side=Math.sin(t*.40)>0?1:-1;tojiStartTravel(f,trg.x+side*112,5,'run');}if(t%8===0)pushAfterimage(f,computePose(f));}
    if(t===104){const trg=liveTarget();if(trg){faceTarget(trg);tojiBlink(f,trg.x-f.facing*92);}tojiSeqFX(f,'REAR ANGLE','#ffffff',.30);}
    if(t===122){const trg=liveTarget();if(trg)faceTarget(trg);burstDash(trg,70);tojiSeqHit(f,'zeroRear',16,{x:10,y:-104,w:192,h:56},{hitstun:42,kbx:17,kby:-8,hitstop:15,kind:'skill5',meter:10});flash(.28,'#ffffff');shake(13);camPunch(.18);SFX.heavy();}
    if(t>=140&&t<172){chase(liveTarget());if(t%10===0)pushAfterimage(f,computePose(f));}
    if(t===176){const trg=liveTarget();if(trg)faceTarget(trg);tojiSeqHit(f,'zeroFin',14,{x:4,y:-54,w:220,h:50},{hitstun:34,kbx:15,kby:0,hitstop:12,kind:'skill5',meter:8});tojiSeqFX(f,'PREDATOR END','#eef1f2',.36);flash(.24,'#ffffff');SFX.heavy();}
  }

  /* Z = airborne diagonal predator cut. */
  if(m.tojiOverhaul==='zero'&&m.kind==='toji_z'){
    if(t===1){SFX.dash();floatText(f.x,f.y-190,'PREDATOR STEP','#e9edef',18,42);tojiSetMotion(f,'crouch',8);}
    if(t===10){const trg=liveTarget();if(trg){faceTarget(trg);tojiBlink(f,trg.x-f.facing*126);}tojiSeqFX(f,'BLINK','#ffffff',.22);}
    if(t>=18&&t<48){lockAir(GROUND-22-(t-18)*1.7);f.x=clamp(f.x+f.facing*2.2,WALL,ARENA_W-WALL);if(t%5===0)pushAfterimage(f,computePose(f));}
    if(t===50){const trg=liveTarget();if(trg){faceTarget(trg);burstDash(trg,48);}lockAir(GROUND-82);tojiSeqHit(f,'zA',10,{x:26,y:-96,w:172,h:76},{hitstun:34,kbx:13,kby:-7,hitstop:10,kind:'toji_z',meter:8});flash(.18,'#ffffff');shake(8);SFX.heavy();}
    if(t>=62&&t<108){const p=(t-62)/46;lockAir(GROUND-86+72*p);f.x=clamp(f.x+f.facing*1.8,WALL,ARENA_W-WALL);}
    if(t===110){const trg=liveTarget();if(trg){faceTarget(trg);burstDash(trg,68);}lockAir(GROUND-18);tojiSeqHit(f,'zDown',14,{x:6,y:-58,w:210,h:64},{hitstun:40,kbx:16,kby:-9,hitstop:13,kind:'toji_z',meter:9});flash(.26,'#f5f7f8');shake(12);camPunch(.18);SFX.heavy();}
    if(t>=124&&t<158){lockAir(GROUND-20+((t-124)*.8));if(t%8===0)pushAfterimage(f,computePose(f));}
    if(t===162){lockGround();tojiSeqHit(f,'zFin',13,{x:10,y:-46,w:228,h:52},{hitstun:36,kbx:14,kby:0,hitstop:11,kind:'toji_z',meter:8});tojiSeqFX(f,'PREDATOR LAND','#eef1f2',.34);flash(.22,'#ffffff');SFX.heavy();}
  }

  /* 8 = dedicated weapon guard. */
  if(m.tojiOverhaul==='guard'){
    if(t===1){tojiSetMotion(f,'crouch',5);SFX.skill();floatText(f.x,f.y-186,'WEAPON GUARD','#cfd5d8',16,38);}
    if(t<42){lockGround();}
    if(t===16){ring(f.x+f.facing*28,f.y-76,'#dfe4e7',42,16);spark(f.x+f.facing*28,f.y-76,8,'#e8edef',3,4,14,.03);}
  }

  if(m.tojiOverhaul==='cinematicX'){
    if(t===1)tojiCineStart(f);
    updateTojiCinematicX(f,m);return;
  }

  /* 9 / Cursed Arsenal: five weapon phases, with unique distances. */
  if(m.tojiOverhaul==='arsenal'){
    if(t===1){SFX.skill();floatText(f.x,f.y-196,'CURSED ARSENAL','#e9edef',21,54);tojiSetMotion(f,'crouch',8);}
    const phases=[
      [24,'aK0',6,38,'DIAGONAL DRAW'],[42,'aK1',7,58,'LOW REVERSE CUT'],[60,'aK2',9,74,'CROSS CUT'],
      [82,'aS0',7,56,'CHEST THRUST'],[104,'aS1',8,78,'LOW THRUST'],[126,'aS2',10,92,'DOWNWARD PIERCE'],
      [152,'aC0',6,44,'CHAIN SWEEP'],[172,'aC1',7,62,'CHAIN PULL'],[192,'aC2',10,82,'OVERHEAD CHAIN'],
      [218,'aP0',7,48,'OVERHEAD CLOUD'],[238,'aP1',9,72,'HORIZONTAL CLOUD'],[258,'aP2',12,102,'FLOOR CLOUD']
    ];
    phases.forEach(([cf,key,dmg,dist,label],i)=>{if(t===cf){const trg=liveTarget();if(trg)faceTarget(trg);burstDash(trg,dist);
      const hb=i<3?(i===1?{x:16,y:-74,w:176,h:52}:{x:18,y:-126,w:170,h:72}):i<6?(i===2?{x:30,y:-42,w:190,h:62}:{x:28,y:-112,w:210,h:60}):i<9?{x:12,y:-76-i*6,w:236,h:58}:{x:12,y:-52,w:250,h:58};
      tojiSeqHit(f,key,dmg,hb,{hitstun:18+Math.min(24,i*2),kbx:7+i*.7,kby:i===1||i===8||i===11?0:-5,hitstop:i%3===2?8:4,kind:'ult',meter:3+i%3,techBreak:i===5});
      tojiSeqFX(f,label,'#e7ebed',.14+(i%4)*.05);SFX.heavy();
    }});
    if(t===272){const trg=liveTarget();if(trg)faceTarget(trg);burstDash(trg,112);tojiSeqHit(f,'afinal',26,{x:2,y:-64,w:326,h:62},{hitstun:56,kbx:21,kby:-12,hitstop:23,kind:'ult',meter:15});flash(.65,'#ffffff');shake(28);camPunch(.31);vfxShockwave(f.x+f.facing*92,f.y-62,'#e4e7e9',170,36);floatText(f.x,f.y-214,'ARSENAL // FINAL CUT','#ffffff',23,88);SFX.blackflash();}
    if(t>274&&t<300){lockGround();f.x=clamp(f.x-f.facing*1.1,WALL,ARENA_W-WALL);}
  }

  if(t>=d){
    if(m.tojiOverhaul==='cinematicX'){G.slowmoTarget=0;if(G.tojiCineX)tojiEndCinematicX(f);}
    lockGround();f.tojiWeaponPhase=null;f.tojiSeqHits=null;f.tojiMoveTween=null;f.tojiMotion='idle';f.tojiMotionFrame=0;f.tojiMotionTimer=0;
    if(m.tojiOverhaul==='zero')f.tojiHunt=0;
    if(m.tojiOverhaul==='basicLight'){
      f.tojiM1Step=(f.tojiM1Step+1)%5;
    }
    f.tojiMoveDuration=0;
    endMove(f);
  }
}

function endMove(f){
  f.move=null;f.moveKey=null;f.state=f.onGround?'IDLE':'FALL';
  f.stateFrame=0;f.chainTimer=20;
}
function updateMove(f){
  const m=f.move;
  if(!m){f.state='IDLE';return;}
  f.moveFrame++;
  if(f.id==='toji'&&m.tojiOverhaul){
    updateTojiOverhaulMove(f,m);
    return;
  }
  if(f.id==='young_gojo'&&(m.kind==='young_blue'||m.kind==='young_red'||m.kind==='young_sixeyes'||m.kind==='young_limitless'||m.kind==='young_maxblue'||m.kind==='young_z'||m.kind==='young_x')){
    updateYoungGojoMove(f,m);
    return;
  }
  const inActive=f.moveFrame>m.startup&&f.moveFrame<=m.startup+m.active;
  if(f.moveFrame>m.startup&&f.moveFrame<=m.startup+m.active){pushAfterimage(f,computePose(f));}
  /* === HEIAN SUKUNA — CLEAVE SEQUENCE === */
  if(f.id==='heian_sukuna'&&m.kind==='cleave_seq'){
    if(!f.cleaveHits)f.cleaveHits={};
    const o=f.opp, dir=f.facing;
    const mf=f.moveFrame;
    if(mf===1){
      f.cleaveHits={};
      f.cleaveLocked=false;
      f.cleaveTargetX=o?o.x:null;
      SFX.cleaveGrab();camPunch(0.10);
    }
    if(mf===12){
      const cx=f.x+dir*70,cy=f.y-92;
      vfxShockwave(cx,cy,'#ff3344',54,18);
      burst(cx,cy,12,'#ff5566',6,9,20);
    }
    if(mf>=30&&mf<=94&&mf%8===6){
      const cx=f.x+dir*82,cy=f.y-94;
      const hb={x:cx-dir*76,y:cy-64,w:152,h:128};
      if(o&&o.state!=='DEFEAT'){
        const hurt=getHurtbox(o);
        if(aabb(hb,hurt)){
          const hitIndex=Math.floor((mf-38)/8);
          if(!f.cleaveHits[hitIndex]){
            f.cleaveHits[hitIndex]=true;
            const fin=mf>=86;
            const res=resolveHit(f,o,{
              damage:fin?18:9,
              hitstun:fin?24:15,
              blockstun:fin?12:9,
              kbx:fin?9:2,
              kby:fin?-6:0,
              hitstop:fin?8:3,
              armorBreak:true,
              kind:'cleave_seq',
              type:'melee',
              meter:fin?6:2
            },cx,cy);
            if(res!=='whiff'){
              o.vx=dir*(fin?7:2);
              if(fin)o.vy=-4;
            }
          }
        }
      }
      /* visible cross-cut even when the target is outside the grab range */
      vfxSlashTrail(cx-dir*58,cy-58,cx+dir*58,cy+18,'#ff3344',7,15);
      vfxSlashTrail(cx-dir*58,cy+18,cx+dir*58,cy-58,'#ffffff',2.5,12);
      if(mf>=70){
        vfxSlashTrail(cx-dir*72,cy-20,cx+dir*72,cy-20,'#ff6680',4,12);
      }
      if(mf===38){
        SFX.cleaveSlash();flash(0.18,'#ff3344');
      }else if(mf%16===6){
        SFX.cleaveSlash();camPunch(0.08);
      }
    }
    if(mf===102){
      const cx=f.x+dir*90,cy=f.y-92;
      vfxHeianCleave(f,dir);
      SFX.cleaveThrow();flash(0.38,'#ff3344');shake(10);camPunch(0.16);
      if(o&&o.state!=='DEFEAT'){
        const hx=cx-dir*40,hy=cy;
        const hb={x:hx-95,y:hy-75,w:190,h:150};
        if(aabb(hb,getHurtbox(o))&&!f.cleaveHits.fin){
          f.cleaveHits.fin=true;
          resolveHit(f,o,{damage:22,hitstun:30,blockstun:14,kbx:10,kby:-7,hitstop:10,armorBreak:true,kind:'cleave_seq',type:'melee',meter:8},hx,hy);
        }
      }
    }
  }
  /* === THE STRONGEST OF TODAY — custom skill handling === */
  if(f.id==='the_strongest_today'){
    if(m.kind==='strongest_shift'){
      if(f.moveFrame===Math.floor(m.startup*0.35)){
        const cx=f.x,cy=f.y-70;
        vfxStrongestSpatialRing(cx,cy,70,26);
        for(let i=0;i<20;i++){
          const a=Math.random()*6.28;
          const p=pget();
          p.active=true;p.x=cx+Math.cos(a)*rnd(40,70);p.y=cy+Math.sin(a)*rnd(40,70);
          p.vx=-Math.cos(a)*rnd(2,4);p.vy=-Math.sin(a)*rnd(2,4);
          p.maxLife=p.life=rnd(14,24);p.size=rnd(2,4);
          p.color=STRONGEST_CYAN;p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
        }
      }
      if(f.moveFrame===m.startup-1){
        const o=f.opp;
        const desiredX=o.x-f.facing*130;
        f.x=clamp(desiredX,WALL,ARENA_W-WALL);
        f.facing=(o.x>=f.x)?1:-1;
        vfxShockwave(f.x,f.y-70,STRONGEST_CYAN,80,26);
        burst(f.x,f.y-70,24,STRONGEST_CYAN,10,10,26);
        flash(0.35,STRONGEST_CYAN);
        shake(10);camPunch(0.12);
        SFX.dash();
      }
    }
    if(m.kind==='strongest_rct'){
      if(f.moveFrame>=Math.floor(m.startup*0.35)&&f.moveFrame<=m.startup&&f.moveFrame%3===0){
        const cx=f.x,cy=f.y-70;
        const p=pget();const a=Math.random()*6.28;const r=rnd(30,60);
        p.active=true;p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r*1.2;
        p.vx=-Math.cos(a)*1.4;p.vy=-Math.abs(Math.sin(a))*2-0.5;
        p.maxLife=p.life=rnd(20,40);p.size=rnd(2,5);
        p.color=STRONGEST_CYAN;p.grav=-0.02;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
      }
      if(f.moveFrame===m.startup){
        f.hp=Math.min(f.maxHp,f.hp+40);
        flash(0.4,STRONGEST_CYAN);
        ring(f.x,f.y-70,STRONGEST_CYAN,80,30);
        burst(f.x,f.y-70,30,STRONGEST_CYAN,10,12,34);
        floatText(f.x,f.y-170,'+40','#00e5ff',22,50);
        SFX.heal();
      }
    }
    if(m.kind==='strongest_simpledomain'){
      if(f.moveFrame===m.startup){
        f.guardArmor=m.active;
        flash(0.35,STRONGEST_CYAN);
        ring(f.x,f.y-70,STRONGEST_CYAN,80,40);
        ring(f.x,f.y-70,STRONGEST_CYAN_LT,60,40);
        for(let i=0;i<24;i++){
          const a=(i/24)*6.28;
          const p=pget();
          p.active=true;p.x=f.x+Math.cos(a)*60;p.y=f.y-70+Math.sin(a)*70;
          p.vx=Math.cos(a)*1.2;p.vy=Math.sin(a)*1.2;
          p.maxLife=p.life=30;p.size=3;
          p.color=STRONGEST_CYAN;p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
        }
        SFX.blue();
      }
    }
    if(m.kind==='strongest_bf'){
      if(f.moveFrame===m.startup-1){
        ring(f.x+f.facing*40,f.y-100,STRONGEST_CYAN,50,20);
      }
      if(f.moveFrame===m.startup){
        flash(0.85,STRONGEST_CYAN);
        shake(20);camPunch(0.26);
        G.hitstop=Math.max(G.hitstop,16);
        const cx=f.x+f.facing*70, cy=f.y-100;
        ring(cx,cy,'#ff2244',60,30);
        burst(cx,cy,40,'#ff2244',14,14,40);
        burst(cx,cy,20,STRONGEST_WHITE,9,10,30);
        floatText(f.x,f.y-190,'BLACK FLASH',STRONGEST_CYAN,26,60);
        SFX.blackflash();
      }
    }
    if(m.kind==='strongest_transform'){
      const cx=f.x, cy=f.y-70;
      if(f.moveFrame<=Math.floor(m.startup*0.15)){
        if(f.moveFrame%5===0) ring(cx,cy,STRONGEST_CYAN,30+f.moveFrame,16);
      }
      else if(f.moveFrame<=Math.floor(m.startup*0.40)){
        if(f.moveFrame%3===0){
          const p=pget();const a=Math.random()*6.28;const r=rnd(50,90);
          p.active=true;p.x=cx+Math.cos(a)*r;p.y=cy-40+Math.sin(a)*r*0.7;
          p.vx=-Math.cos(a)*2.5;p.vy=-Math.sin(a)*2.5;
          p.maxLife=p.life=rnd(16,28);p.size=rnd(2,5);
          p.color=STRONGEST_CYAN;p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
        }
        if(f.moveFrame===Math.floor(m.startup*0.40)){
          flash(0.5,STRONGEST_CYAN);
          vfxShockwave(cx,cy,STRONGEST_CYAN,100,30);
          SFX.domain();
        }
      }
      else if(f.moveFrame<=Math.floor(m.startup*0.70)){
        if(f.moveFrame%2===0){
          const p=pget();const a=Math.random()*6.28;const r=rnd(60,120);
          p.active=true;p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r*0.8;
          p.vx=-Math.cos(a)*3.5;p.vy=-Math.sin(a)*3.5;
          p.maxLife=p.life=rnd(14,26);p.size=rnd(3,6);
          p.color=Math.random()<0.5?STRONGEST_CYAN:STRONGEST_WHITE;
          p.grav=0;p.shape='bolt';p.rot=a;p.vr=0;p.add=true;
        }
      }
      else if(f.moveFrame<=Math.floor(m.startup*0.95)){
        if(f.moveFrame%2===0)vfxShockwave(cx,cy,STRONGEST_CYAN,130,34);
        if(f.moveFrame%4===0){shake(8);camPunch(0.10);}
      }
      if(f.moveFrame===m.startup){
        f.moves=f.def.overdriveMoves;
        f.overdriveActive=true;
        f.meter=0;
        f.awakened=true;
        flash(0.9,STRONGEST_CYAN);
        shake(24);camPunch(0.28);
        ring(cx,cy,STRONGEST_CYAN,140,50);
        ring(cx,cy,STRONGEST_WHITE,100,40);
        burst(cx,cy,50,STRONGEST_CYAN,16,16,50);
        floatText(f.x,f.y-220,'SIX EYES OVERDRIVE',STRONGEST_CYAN,30,100);
        SFX.awaken();
      }
    }
    if(m.kind==='strongest_maxblue') updateStrongestMaxBlue(f,m);
    if(m.kind==='strongest_maxred') updateStrongestMaxRed(f,m);
    if(m.kind==='strongest_purplechant') updateStrongestPurpleChant(f,m);
    if(m.kind==='strongest_spatialcombat'){
      if(f.moveFrame===Math.floor(m.startup*0.15)){
        const o=f.opp;const cx=o.x+40,cy=o.y-80;
        vfxShockwave(cx,cy,STRONGEST_CYAN,80,26);
        for(let i=0;i<18;i++){
          const a=Math.random()*6.28;
          const p=pget();
          p.active=true;p.x=cx+Math.cos(a)*40;p.y=cy+Math.sin(a)*40;
          p.vx=Math.cos(a)*3;p.vy=Math.sin(a)*3;
          p.maxLife=p.life=rnd(12,20);p.size=rnd(2,4);
          p.color=STRONGEST_CYAN;p.grav=0;p.shape='bolt';p.rot=a;p.vr=0;p.add=true;
        }
      }
      if(f.moveFrame===Math.floor(m.startup*0.30)){
        const o=f.opp;
        f.x = o.x - 70;
        f.x = clamp(f.x,WALL,ARENA_W-WALL);
        f.facing = (o.x>=f.x)?1:-1;
        vfxShockwave(f.x,f.y-70,STRONGEST_CYAN,70,24);
      }
      if(f.moveFrame===Math.floor(m.startup*0.45)){
        const o=f.opp;
        const hx=(f.x+o.x)/2, hy=(f.y+o.y)/2-60;
        vfxSlashTrail(f.x+40,f.y-90,o.x,f.y-90,STRONGEST_CYAN,6,18);
        resolveHit(f,o,{damage:14,hitstun:20,blockstun:12,kbx:3,kby:-2,hitstop:6,armorBreak:true,kind:'skill3',type:'melee',meter:5},hx,hy);
        SFX.skill();
      }
      if(f.moveFrame===Math.floor(m.startup*0.60)){
        const o=f.opp;
        f.x = o.x + 60;
        f.x = clamp(f.x,WALL,ARENA_W-WALL);
        f.facing = (o.x>=f.x)?1:-1;
        vfxShockwave(f.x,f.y-70,STRONGEST_CYAN,70,24);
      }
      if(f.moveFrame===Math.floor(m.startup*0.75)){
        const o=f.opp;
        const hx=(f.x+o.x)/2, hy=(f.y+o.y)/2-60;
        vfxSlashTrail(f.x-40,f.y-90,o.x,f.y-90,STRONGEST_CYAN,6,18);
        resolveHit(f,o,{damage:14,hitstun:20,blockstun:12,kbx:3,kby:-2,hitstop:6,armorBreak:true,kind:'skill3',type:'melee',meter:5},hx,hy);
        SFX.skill();
      }
      if(f.moveFrame===Math.floor(m.startup*0.92)){
        const o=f.opp;
        const hx=(f.x+o.x)/2, hy=(f.y+o.y)/2-60;
        vfxShockwave(hx,hy,STRONGEST_CYAN,130,34);
        burst(hx,hy,30,STRONGEST_CYAN,12,14,36);
        flash(0.55,STRONGEST_CYAN);
        shake(16);camPunch(0.20);
        resolveHit(f,o,{damage:22,hitstun:30,blockstun:18,kbx:11,kby:-6,hitstop:12,armorBreak:true,kind:'skill3',type:'melee',meter:8},hx,hy);
        SFX.heianhitenimpact();
      }
    }
    if(m.kind==='strongest_closecombat'){
      const hitTimes=[0.20,0.40,0.60,0.80];
      const dmgVals=[8,10,10,16];
      const hitboxes={x:30,y:-104,w:96,h:60};
      for(let i=0;i<hitTimes.length;i++){
        if(f.moveFrame===Math.floor(m.startup*hitTimes[i])){
          const hb=getHitboxWorld(f,hitboxes);
          const o=f.opp;
          const hurt=getHurtbox(o);
          if(aabb(hb,hurt)){
            const hx=(Math.max(hb.x,hurt.x)+Math.min(hb.x+hb.w,hurt.x+hurt.w))/2;
            const hy=(Math.max(hb.y,hurt.y)+Math.min(hb.y+hb.h,hurt.y+hurt.h))/2;
            resolveHit(f,o,{damage:dmgVals[i],hitstun:12,blockstun:8,kbx:2,kby:0,hitstop:5,armorBreak:true,kind:'skill4',type:'melee',meter:4},hx,hy);
            o.comboCount=0;o.comboTimer=0;
          }
          const cx=f.x+f.facing*70, cy=f.y-90;
          vfxSlashTrail(cx-40,cy+i*10-20,cx+40,cy-i*10+20,STRONGEST_CYAN,5,16);
          spark(cx,cy,8,STRONGEST_CYAN,5,6,14,0.1);
          shake(3);
          SFX.cleaveSlash();
        }
      }
      if(f.moveFrame===Math.floor(m.startup*0.92)){
        const cx=f.x+f.facing*80, cy=f.y-90;
        vfxShockwave(cx,cy,STRONGEST_CYAN,110,30);
        flash(0.5,STRONGEST_CYAN);
        shake(14);camPunch(0.20);
        const o=f.opp;
        const hb={x:cx-60,y:cy-50,w:120,h:100};
        const hurt=getHurtbox(o);
        if(aabb(hb,hurt)){
          const hx=(Math.max(hb.x,hurt.x)+Math.min(hb.x+hb.w,hurt.x+hurt.w))/2;
          const hy=(Math.max(hb.y,hurt.y)+Math.min(hb.y+hb.h,hurt.y+hurt.h))/2;
          resolveHit(f,o,{damage:18,hitstun:26,blockstun:16,kbx:9,kby:-5,hitstop:10,armorBreak:true,kind:'skill4',type:'melee',meter:6},hx,hy);
        }
      }
    }
    if(m.kind==='strongest_advrct'){
      if(f.moveFrame>=Math.floor(m.startup*0.30)&&f.moveFrame<=m.startup&&f.moveFrame%2===0){
        const cx=f.x,cy=f.y-70;
        const p=pget();const a=Math.random()*6.28;const r=rnd(40,80);
        p.active=true;p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r*1.3;
        p.vx=-Math.cos(a)*1.6;p.vy=-Math.abs(Math.sin(a))*2.5-0.5;
        p.maxLife=p.life=rnd(20,40);p.size=rnd(3,6);
        p.color=Math.random()<0.5?STRONGEST_CYAN:STRONGEST_WHITE;
        p.grav=-0.03;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
      }
      if(f.moveFrame===m.startup){
        f.hp=Math.min(f.maxHp,f.hp+65);
        flash(0.55,STRONGEST_CYAN);
        ring(f.x,f.y-70,STRONGEST_CYAN,100,40);
        ring(f.x,f.y-70,STRONGEST_WHITE,70,34);
        burst(f.x,f.y-70,40,STRONGEST_CYAN,12,14,40);
        floatText(f.x,f.y-180,'+65',STRONGEST_CYAN,24,60);
        SFX.heal();
      }
    }
  }
  /* v32 FULL-CAST AUDIT: Kamutoke is a weapon attack, not a guard move.
     Its custom thunder choreography runs for the full 121 frames and strikes once. */
  if(m.kind==='def'&&f.id==='heian_sukuna'&&m.aura==='kamutoke'){
    updateKamutokePeriods(f);
    if(f.moveFrame===58&&!f.hasHit&&f.opp&&f.opp.state!=='DEFEAT'){
      const o=f.opp;
      const result=resolveHit(f,o,{
        damage:m.damage||26,hitstun:m.hitstun||30,blockstun:m.blockstun||18,
        kbx:m.kbx||10,kby:m.kby||-6,hitstop:m.hitstop||12,
        armorBreak:!!m.armorBreak,kind:'skill5',type:'melee',meter:m.meter||10
      },o.x,o.y-92);
      if(result!=='whiff')f.hasHit=true;
    }
    if(f.moveFrame>=moveDuration(m))endMove(f);
    return;
  }
  /* v23: clean, dedicated defense move handler. */
  if(m.kind==='def'){
    if(f.moveFrame===m.startup){
      if(f.id==='gojo'){
        f.infinity=m.active;SFX.blue();ring(f.x,f.y-60,'#7fd8ff',40,30);floatText(f.x,f.y-160,'INFINITY','#7fd8ff',18,50);
      }else if(f.id==='yuta'){
        f.guardArmor=m.active;SFX.rika();ring(f.x,f.y-60,'#c9a6ff',42,32);floatText(f.x,f.y-160,'RIKA GUARD','#c9a6ff',18,50);
      }else if(f.id==='hakari'){
        f.guardArmor=m.active;SFX.hakarirestless();ring(f.x,f.y-60,'#ffd166',44,34);floatText(f.x,f.y-160,'STEADY GUARD','#ffd166',18,50);
      }else if(f.id==='sukuna'){
        f.guardArmor=m.active;SFX.skill();ring(f.x,f.y-60,'#ff5566',36,28);floatText(f.x,f.y-160,"KING'S GUARD",'#ff8080',18,50);
      }else{
        f.guardArmor=m.active;SFX.skill();ring(f.x,f.y-60,'#ff5566',36,28);floatText(f.x,f.y-160,'GUARD','#ff8080',18,50);
      }
      flash(0.22,f.id==='gojo'?'#7fd8ff':(f.id==='yuta'?'#c9a6ff':(f.id==='hakari'?'#ffd166':'#ff5566')));
    }
    if(f.moveFrame>=moveDuration(m))endMove(f);
    return;
  }
  if(m.kind==='wcs'){
    const cx=f.x+f.facing*40,cy=f.y-92;
    if(f.moveFrame===1){
      SFX.heianwcsprep();
    }
    if(f.moveFrame<m.startup){
      const tt=f.moveFrame/m.startup;
      if(f.moveFrame===Math.floor(m.startup*0.30)){
        SFX.heianwcs();
        flash(0.15,'#ff4455');
      }
      if(f.moveFrame===Math.floor(m.startup*0.60)){
        flash(0.28,'#ff3355');
        camPunch(0.10);
      }
      vfxHeianWCSCharge(cx,cy,tt);
      if(f.moveFrame===m.startup-1)vfxShockwave(cx,cy,'#ffffff',90,20);
    }
    if(f.moveFrame===m.startup&&!f.spawned){
      f.spawned=true;
      const pr={x:f.x+f.facing*120,y:f.y-92,vx:0,vy:0,w:360,h:180,damage:m.projectile.damage,hitstun:m.projectile.hitstun,blockstun:m.projectile.blockstun,kbx:m.projectile.kbx,kby:m.projectile.kby,life:26,type:'wcs',owner:f,hitstop:m.projectile.hitstop,armorBreak:true,spatial:true,spawnPillar:false,hit:false,rot:0,t:0};
      G.projectiles.push(pr);
      SFX.heianwcs&&SFX.heianwcs();
      flash(0.85,'#ff4455');shake(28);camPunch(0.34);
      G.hitstop=Math.max(G.hitstop,12);
      G.slowmoTarget=Math.max(G.slowmoTarget,24);
      vfxHeianWCSRelease(f.x,f.y-92,f.facing);
      floatText(f.x,f.y-210,'WORLD-CUTTING SLASH','#ff4455',26,90);
    }
    if(f.moveFrame>=moveDuration(m))endMove(f);
    return;
  }
  if(m.kind==='ult'){
    f.domainCharge=f.moveFrame/m.startup;
    if(m.domain){
      if(f.moveFrame===Math.floor(m.startup*0.35)||f.moveFrame===Math.floor(m.startup*0.7)){
        shake(7);SFX.domain();
        burst(f.x,f.y-60,16,f.id==='heian_sukuna'?'#ff3344':(f.id==='the_strongest_today'?STRONGEST_CYAN:(f.id==='gojo'?'#7fd8ff':'#ff5566')),7,12,28);
      }
      if(f.moveFrame===m.startup)activateDomain(f);
      if(f.moveFrame>=moveDuration(m))endMove(f);
      return;
    }
    if(m.ultType==='beam'){
      const cx=f.x+f.facing*42,cy=f.y-92;
      if(f.moveFrame<m.startup){const tt=f.moveFrame/m.startup;if(f.moveFrame%2===0)vfxBeamChargeConverge(cx,cy,tt);if(f.moveFrame%3===0)vfxShockwave(cx,cy,'#c9a6ff',18+tt*42,14);if(f.moveFrame===m.startup-1)vfxShockwave(cx,cy,'#ffffff',70,20);}
      if(f.moveFrame===m.startup&&!f.spawned){f.spawned=true;spawnProjectile(f,m.projectile,52,-92);flash(0.85,'#ffffff');shake(22);camPunch(0.30);SFX.beamFire();burst(cx,cy,36,'#c9a6ff',13,16,40);burst(cx,cy,20,'#ffffff',9,13,30);vfxShockwave(cx,cy,'#e0d0ff',120,32);vfxShockwave(cx,cy,'#ffffff',80,26);}
      if(f.moveFrame>=moveDuration(m))endMove(f);
      return;
    }
    if(m.ultType==='yuji'){
      const cx=f.x+f.facing*30,cy=f.y-90;
      if(f.moveFrame<m.startup&&f.moveFrame%3===0){vfxEmber(cx,cy,3);spark(cx,cy,2,'#ff2244',3,6,20,0.1);}
      if(f.moveFrame===m.startup){flash(0.8,'#ff2244');shake(24);camPunch(0.28);SFX.blackflash();vfxShockwave(cx,cy,'#ff2244',110,40);}
      if(m.multiHit&&inActive&&m.hitbox&&f.moveFrame%m.hitInterval===0){f.hasHit=false;checkMeleeHit(f,m);}
      if(f.moveFrame>=moveDuration(m))endMove(f);
      return;
    }
    if(m.ultType==='toji'){
      const cx=f.x+f.facing*34,cy=f.y-92;
      if(f.moveFrame< m.startup){
        if(f.moveFrame%3===0){vfxSlashTrail(f.x-f.facing*40,f.y-90,f.x+f.facing*55,f.y-74,'#66ffbe',5,16);burst(cx+rnd(-18,18),cy+rnd(-15,15),4,'#66ffbe',5,9,16);}
        if(f.moveFrame===m.startup-1){flash(0.55,'#ffffff');camPunch(0.22);}
      }
      if(f.moveFrame===m.startup){f.x+=f.facing*55;f.x=clamp(f.x,WALL,ARENA_W-WALL);}
      if(inActive&&m.hitbox&&f.moveFrame%m.hitInterval===0){f.hasHit=false;checkMeleeHit(f,m);vfxSlashTrail(f.x-f.facing*22,f.y-112,f.x+f.facing*95,f.y-42,'#7dffca',7,18);}
      if(f.moveFrame>=moveDuration(m))endMove(f);
      return;
    }
    if(m.ultType==='hakari'){
      const cx=f.x+f.facing*30,cy=f.y-90;
      const sp=m.startup;
      const ac=m.active;
      if(f.moveFrame<sp){if(f.moveFrame%2===0)vfxHakariJackpotRoll(cx,cy);if(f.moveFrame%5===0)vfxShockwave(cx,cy,'#ffd166',20+((f.moveFrame/sp)*50),16);if(f.moveFrame===sp-1)vfxShockwave(cx,cy,'#ffffff',90,20);}
      if(f.moveFrame===sp){flash(0.9,'#ffd166');shake(26);camPunch(0.32);SFX.hakarioverdrive();vfxHakariOverdrivePunch(cx+f.facing*40,cy);f.x+=f.facing*40;f.x=clamp(f.x,WALL,ARENA_W-WALL);for(let i=0;i<4;i++)pushAfterimage(f,computePose(f));}
      if(inActive&&m.hitbox){if(f.moveFrame%m.hitInterval===0){f.hasHit=false;checkMeleeHit(f,m);}const rel=f.moveFrame-sp;if(rel===Math.floor(ac*0.3)){camPunch(0.20);vfxHakariOverdrivePunch(cx+f.facing*60,cy+10);SFX.hakarirough();}if(rel===Math.floor(ac*0.6)){vfxHakariOverdriveBarrage(cx+f.facing*40,cy);}if(rel===ac-1){flash(0.7,'#ffffff');shake(24);camPunch(0.30);vfxHakariOverdriveSlam(f.x+f.facing*40,f.y-70);SFX.hakarijackpotsuccess();G.hitstop=Math.max(G.hitstop,14);G.slowmoTarget=Math.max(G.slowmoTarget,30);if(f.jackpot>0)f.jackpot=Math.max(f.jackpot,240);}}
      if(f.moveFrame>=moveDuration(m))endMove(f);      return;
    }
    if(f.moveFrame>=moveDuration(m))endMove(f);
    return;
  }
  if(m.projectile&&f.moveFrame===m.startup&&!f.spawned){
    f.spawned=true;
    const off=m.projectile.type==='purple'?56:(m.projectile.type==='dismantle_heian'?48:(m.projectile.type==='heianfuga'?50:(m.projectile.type==='strongest_purple'?48:38)));
    spawnProjectile(f,m.projectile,off,-78);
    if(m.projectile.type==='purple'){SFX.purple();shake(20);flash(0.6,'#c07bff');camPunch(0.22);burst(f.x+f.facing*56,f.y-78,40,'#c07bff',10,16,40);}
    if(m.projectile.type==='strongest_purple'){
      SFX.purple();shake(18);flash(0.5,STRONGEST_CYAN);camPunch(0.20);
      burst(f.x+f.facing*56,f.y-88,32,'#c07bff',10,14,36);
      burst(f.x+f.facing*56,f.y-88,16,STRONGEST_CYAN,8,10,28);
    }
    if(m.projectile.type==='fuga'){SFX.fugaRelease();shake(16);flash(0.5,'#ff7722');camPunch(0.18);burst(f.x+f.facing*40,f.y-90,24,'#ff8833',8,12,32);vfxShockwave(f.x+f.facing*40,f.y-90,'#ff8833',70,24);}
    if(m.projectile.type==='heianfuga'){SFX.heianfugarelease();shake(22);flash(0.7,'#ffffff');camPunch(0.26);vfxHeianFugaRelease(f.x+f.facing*50,f.y-90,f.facing);}
    if(m.projectile.type==='dismantle_heian'){SFX.heavy();shake(10);camPunch(0.14);vfxHeianDismantle(f.x+f.facing*48,f.y-78,f.facing);}
  }
  if(m.spawnRika&&f.moveFrame===m.startup&&!f.spawned){
    f.spawned=true;SFX.rika();shake(12);camPunch(0.14);flash(0.35,'#c9a6ff');
    const cx=f.x+f.facing*40,cy=f.y-90;vfxShockwave(cx,cy,'#c9a6ff',80,26);
    const rd=m.spawnRika;
    G.projectiles.push({x:cx,y:cy,vx:rd.speed*f.facing,vy:0,w:rd.w,h:rd.h,damage:rd.damage,hitstun:rd.hitstun,blockstun:rd.blockstun,kbx:rd.kbx,kby:rd.kby,life:rd.life,type:'rika',owner:f,hitstop:rd.hitstop,armorBreak:false,spawnPillar:false,hit:false,rot:0,t:0});
  }
  if(m.heal&&f.moveFrame===m.startup){f.hp=Math.min(f.maxHp,f.hp+m.heal);SFX.heal();const healCol=f.id==='yuta'?'#c9a6ff':'#a6f0d0';flash(0.3,healCol);const cx=f.x,cy=f.y-70;vfxShockwave(cx,cy,healCol,70,26);vfxHealParticles(cx,cy,20);if(f.id==='yuta'){ring(cx,cy,healCol,42,24);spark(cx,cy-12,9,'#eadbff',2.6,5,18,0);}floatText(cx,cy-60,'+'+m.heal,healCol,24,50);}
  if(m.immobilize&&f.moveFrame===m.startup){
    SFX.speech();flash(0.35,'#c9a6ff');vfxSpeechWaves(f.x+f.facing*30,f.y-100,f.facing,'#c9a6ff');vfxSpeechWaves(f.x+f.facing*30,f.y-100,f.facing,'#e0d0ff');
    const o=f.opp;const blockedStates=['CLASH','TRAPPED','DEFEAT','VICTORY'];
    const inUlt=o.state==='ATTACK'&&o.move&&o.move.kind==='ult';
    if(!blockedStates.includes(o.state)&&!inUlt){o.immobilize=Math.max(o.immobilize,m.immobilize.duration);o.state='IMMOBILIZED';o.stateFrame=0;o.vx=0;o.vy=0;o.move=null;ring(o.x,o.y-60,'#c9a6ff',50,40);ring(o.x,o.y-60,'#e0d0ff',36,40);floatText(o.x,o.y-190,"DON'T MOVE",'#e0d0ff',22,70);shake(10);camPunch(0.12);}
    else{floatText(f.x,f.y-170,'RESISTED','#8080a0',16,40);}
  }
  if(m.doCopy&&f.moveFrame===m.startup){performCopy(f);}
  if(m.doJackpot&&f.moveFrame===m.startup){
    const isDomain=(m.kind==='skill3');
    const chance=(f.awakened?0.75:0.60);
    f.rollResult=(Math.random()<chance)?'success':'fail';
    f.rollTimer=m.rollDuration||90;f.rollTotal=f.rollTimer;
    if(isDomain){G.hakariCin={phase:'domain',timer:0,total:170,owner:f,opponent:f.opp,x:f.x,y:f.y,reel:[rint(0,6),rint(0,6),rint(0,6),rint(0,6)],reelTick:0,reelSpeeds:[1.0,1.15,0.95,1.1],win:null,flashes:0};SFX.hakaridomain();G.hakariDomainT=220;flash(0.85,'#3a1a4a');shake(24);camPunch(0.30);G.zoomPunch=0.12;vfxShockwave(f.x,f.y-70,'#ffd166',140,40);burst(f.x,f.y-70,40,'#ffd166',10,15,40);floatText(f.x,f.y-210,'IDLE DEATH GAMBLE','#ffd166',26,90);cam.cine=1;cam.cineX=f.x;cam.cineY=f.y-70;cam.cineZoom=1.28;G.slowmoTarget=Math.max(G.slowmoTarget,30);}
    else{SFX.hakarijackpotroll();flash(0.4,'#ffd166');vfxShockwave(f.x,f.y-70,'#ffd166',70,26);camPunch(0.14);}
  }
  if(f.rollTimer>0&&f.rollResult&&f.moveFrame%4===0)vfxHakariJackpotRoll(f.x,f.y-70);
  if(m.delayedHit&&f.moveFrame===m.startup+m.active&&!f.delayedHitFired){f.delayedHitFired=true;f.delayedHitPending=m.delayedHit.delay;f.delayedHitData=m.delayedHit;}
  if(f.delayedHitPending>0){
    f.delayedHitPending--;
    if(f.delayedHitPending===0&&f.delayedHitData){
      const dh=f.delayedHitData;const o=f.opp;const hx=f.x+f.facing*80,hy=f.y-100;
      const hb={x:hx-60,y:hy-70,w:120,h:140};const hb2=getHurtbox(o);
      if(aabb(hb,hb2)){resolveHit(f,o,{damage:dh.damage,hitstun:dh.hitstun,blockstun:10,kbx:dh.kbx,kby:dh.kby,hitstop:8,kind:'projectile',type:'projectile',meter:5},hx,hy);}
      SFX.red();flash(0.4,'#ff4466');vfxShockwave(hx,hy,'#ff4466',70,24);shake(9);camPunch(0.14);f.delayedHitData=null;
    }
  }
  if(inActive&&m.hitbox&&!m.multiHit&&!f.hasHit)checkMeleeHit(f,m);
  if(inActive&&m.hitbox&&m.multiHit&&f.moveFrame%m.hitInterval===0){f.hasHit=false;checkMeleeHit(f,m);}
  if(m.field&&(inActive||f.moveFrame<=m.startup)&&f.moveFrame>m.startup-4){
    const o=f.opp;
    const cxp=f.x+f.facing*(m.hitbox?m.hitbox.x+m.hitbox.w*0.5:80);
    const cyp=f.y+(m.hitbox?m.hitbox.y+m.hitbox.h*0.5:-80);
    const dx=cxp-o.x,dy=cyp-(o.y-55);const dist=Math.hypot(dx,dy);
    if(dist<m.field.radius+80&&dist>1){const pull=m.field.pull*(1-dist/(m.field.radius+80));o.x+=dx/dist*pull*3.2;if(!o.onGround)o.y+=dy/dist*pull*1.2;o.x=clamp(o.x,WALL,ARENA_W-WALL);}
    if(f.moveFrame%5===0){const a=Math.random()*6.28,r=rnd(30,110);const p=pget();p.active=true;p.x=cxp+Math.cos(a)*r;p.y=cyp+Math.sin(a)*r;p.vx=-Math.cos(a)*2.6;p.vy=-Math.sin(a)*2.6;p.maxLife=p.life=rnd(16,28);p.size=rnd(3,7);p.color='#5ab8ff';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}
  }
  const dir=f.facing;
  if(m.aura==='blue'&&f.moveFrame===m.startup){SFX.blue();ring(f.x+dir*90,f.y-80,'#4aa8ff',34,26);}
  if(m.aura==='red'&&f.moveFrame===m.startup){SFX.red();shake(14);flash(0.35,'#ff4455');camPunch(0.16);}
  if(m.aura==='cleave'&&f.moveFrame===m.startup){SFX.heavy();shake(9);}
  if(m.aura==='flame'&&f.moveFrame===m.startup){SFX.red();shake(26);flash(0.7,'#ff7722');camPunch(0.20);}
  if(m.aura==='door'&&f.moveFrame===m.startup){SFX.hakaridoor();shake(14);camPunch(0.18);vfxHakariDoor(f.x+dir*70,f.y-90,dir);f.x+=dir*10;f.x=clamp(f.x,WALL,ARENA_W-WALL);flash(0.28,'#ffd166');}
  if(m.aura==='rough'&&f.moveFrame===m.startup){SFX.hakarirough();shake(20);camPunch(0.22);flash(0.4,'#ffd166');vfxHakariRough(f.x+dir*70,f.y-92,dir);f.x+=dir*8;f.x=clamp(f.x,WALL,ARENA_W-WALL);}
  if(m.aura==='restless'&&f.moveFrame===m.startup){SFX.hakarirestless();flash(0.5,'#ffd166');vfxShockwave(f.x,f.y-70,'#ffd166',90,30);burst(f.x,f.y-70,24,'#ffd166',8,12,30);f.restless=m.buff.duration;floatText(f.x,f.y-190,'RESTLESS GAMBLER','#ffd166',22,60);}
  if(m.aura==='tojiKatana'&&f.moveFrame===m.startup){SFX.heavy();shake(18);camPunch(0.22);flash(0.22,'#d7dbdd');ring(f.x-dir*36,f.y-82,'#090a0b',66,18);ring(f.x+dir*56,f.y-92,'#777d82',78,18);vfxSlashTrail(f.x-dir*54,f.y-132,f.x+dir*142,f.y-34,'#e4e7e8',9,24);burst(f.x+dir*66,f.y-88,18,'#aab0b4',5,10,24);floatText(f.x,f.y-198,'SILENT SEVER','#eafff5',22,60);}
  if(m.aura==='tojiSpear'&&f.moveFrame===m.startup){SFX.heavy();shake(20);camPunch(0.24);flash(0.18,'#d5d9db');vfxSlashTrail(f.x-dir*28,f.y-108,f.x+dir*170,f.y-82,'#e7eaec',10,24);ring(f.x+dir*112,f.y-86,'#747a7f',54,16);burst(f.x+dir*86,f.y-90,18,'#c3c8cb',5,10,22);floatText(f.x,f.y-198,'ISOH // EXECUTION DRIVE','#eafff5',17,58);}
  if(m.aura==='tojiChain'&&f.moveFrame===m.startup){SFX.dash();shake(14);camPunch(0.14);ring(f.x+dir*26,f.y-86,'#121416',58,16);ring(f.x+dir*62,f.y-90,'#646b70',70,18);for(let i=0;i<5;i++)vfxSlashTrail(f.x+dir*(i*18),f.y-92-i*3,f.x+dir*(44+i*18),f.y-76-i*4,'#a7adb1',2.5,12);burst(f.x+dir*24,f.y-86,16,'#8f969b',3,8,20);floatText(f.x,f.y-190,'CHAIN SNARE','#eafff5',20,56);}
  if(m.aura==='tojiCloud'&&f.moveFrame===m.startup){SFX.heavy();shake(24);camPunch(0.27);flash(0.18,'#d4d8da');vfxShockwave(f.x+dir*54,f.y-86,'#1b1e21',90,24);vfxShockwave(f.x+dir*78,f.y-92,'#6d7378',112,30);for(let i=0;i<4;i++)vfxSlashTrail(f.x-dir*20,f.y-114+i*12,f.x+dir*(96+i*16),f.y-34+i*8,'#d9dddf',5,16);burst(f.x+dir*70,f.y-88,24,'#bcc1c4',6,10,26);floatText(f.x,f.y-202,'PLAYFUL CLOUD // DEATH WALTZ','#eafff5',18,60);}
  if(m.aura==='tojiHunt'&&f.moveFrame===m.startup){SFX.dash();shake(16);camPunch(0.20);flash(0.16,'#e0e3e5');vfxShockwave(f.x,f.y-72,'#070809',132,30);vfxShockwave(f.x,f.y-72,'#596065',72,20);for(let i=0;i<4;i++)pushAfterimage(f,computePose(f));burst(f.x,f.y-72,28,'#08090a',8,14,34);burst(f.x,f.y-72,16,'#858b90',4,9,22);floatText(f.x,f.y-204,'ZERO PRESENCE // PREDATOR STATE','#eafff5',20,74);f.tojiHunt=m.buff.duration;f.invuln=Math.max(f.invuln,32);}
  if(f.id==='toji'&&m.aura==='tojiUlt'&&f.moveFrame===m.startup){SFX.blackflash();shake(30);camPunch(0.34);flash(0.28,'#eef0f1');vfxShockwave(f.x,f.y-84,'#070809',180,40);vfxShockwave(f.x,f.y-84,'#6d7479',120,30);for(let i=0;i<6;i++)vfxSlashTrail(f.x-dir*70,f.y-132+i*22,f.x+dir*(90+i*24),f.y-24+i*10,'#e4e7e8',5,16);burst(f.x,f.y-92,46,'#9da3a7',9,16,38);floatText(f.x,f.y-226,'INVENTORY DEATH','#eafff5',26,100);}
  if(m.aura==='slash'&&f.id==='heian_sukuna'&&f.moveFrame===m.startup){}
  if((m.aura==='cleave_heian'||m.aura==='cleave_seq')&&f.moveFrame===m.startup){
    SFX.heavy();shake(16);camPunch(0.22);flash(0.32,'#ff3344');
    vfxHeianCleave(f,dir);
  }
  if(m.aura==='kamutoke'&&f.moveFrame===m.startup){}
  if(m.aura==='hiten'&&f.id==='heian_sukuna'){
    updateHitenPeriods(f);
  }
  if(m.aura==='heianfuga'&&f.id==='heian_sukuna'){
    updateHeianFugaPeriods(f);
  }
  if(f.id==='heian_sukuna'&&m.kind==='light'&&inActive){
    if(f.moveFrame%6===0)vfxHeianFourArmPunch(f,dir);
  }
  if(f.id==='heian_sukuna'&&m.kind==='heavy'&&f.moveFrame===m.startup-1){
    vfxShockwave(f.x+dir*40,f.y-100,'#ff3344',60,20);
    for(let i=0;i<12;i++){const p=pget();const a=Math.random()*6.28;const r=rnd(30,70);p.active=true;p.x=f.x+Math.cos(a)*r;p.y=f.y-90+Math.sin(a)*r*0.7;p.vx=-Math.cos(a)*1.6;p.vy=-Math.sin(a)*1.6;p.maxLife=p.life=rnd(10,20);p.size=rnd(2,5);p.color='#ff3344';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}
  }
  if(f.id==='heian_sukuna'&&m.kind==='heavy'&&f.moveFrame===m.startup){
    vfxHeianHeavySmash(f,dir);
    flash(0.42,'#ff3344');
  }
  if(m.startup>=20&&f.moveFrame<m.startup&&f.moveFrame%3===0&&m.aura!=='rct'&&m.aura!=='flame'&&m.aura!=='idle'&&m.aura!=='jackpotroll'&&m.aura!=='overdrive'&&m.aura!=='wcs'&&m.aura!=='kamutoke'&&m.aura!=='hiten'&&m.aura!=='cleave_heian'&&m.aura!=='heianfuga'&&m.aura!=='cleave_seq'&&m.aura!=='strongest'){
    const a=Math.random()*6.28,r=rnd(20,60);
    const p=pget();p.active=true;p.x=f.x+Math.cos(a)*r;p.y=f.y-70+Math.sin(a)*r*0.8;p.vx=-Math.cos(a)*1.4;p.vy=-Math.sin(a)*1.4;p.maxLife=p.life=rnd(10,20);p.size=rnd(2,6);
    const auraMap={blue:'#5ab8ff',red:'#ff4455',purple:'#c07bff',speech:'#c9a6ff',copy:'#c9a6ff',sky:'#e0d0ff',rika:'#c9a6ff',rush:'#ff4466',cestrike:'#ff4466',bf:'#ff2244',divergent:'#ff4466',door:'#ffd166',rough:'#ffb060',restless:'#ffd166',tojiKatana:'#9da3a7',tojiSpear:'#c2c7ca',tojiChain:'#6e7479',tojiCloud:'#b3b8bc',tojiHunt:'#4d5358',tojiUlt:'#d5d8da'};
    p.color=auraMap[m.aura]||'#5ab8ff';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
  }
  if(m.advance&&f.moveFrame<=m.startup+m.active)f.x+=m.advance*f.facing;
  if(f.id==='sukuna'&&f.form===0&&m.kind==='skill3'){const cx=f.x+dir*60,cy=f.y-100;const sp=Math.max(1,m.startup);const tt=f.moveFrame/sp;if(f.moveFrame<sp){if(tt<0.3){if(f.moveFrame%4===0)vfxEmber(cx,cy,2);if(f.moveFrame%3===0)vfxFlameCone(cx,cy,dir,8);}else if(tt<0.7){if(f.moveFrame%2===0)vfxFlameCone(cx,cy,dir,12);if(f.moveFrame%3===0)vfxEmber(cx,cy,3);}else{if(f.moveFrame%2===0)vfxFlameCone(cx+dir*10,cy,dir,10);if(f.moveFrame%3===0)vfxEmber(cx,cy,4);if(f.moveFrame%4===0){const p=pget();p.active=true;p.x=cx+rnd(-30,30);p.y=cy+rnd(-30,30);p.vx=dir*rnd(0.5,1.2);p.vy=rnd(-0.3,0.3);p.maxLife=p.life=rnd(8,16);p.size=rnd(3,6);p.color='#ffaa66';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}}}
  if(m.kind==='skill1'&&f.id==='gojo'){const cx=f.x+dir*100,cy=f.y-82;if(f.moveFrame<=m.startup&&f.moveFrame%3===0)vfxSpiralIn(cx,cy,'#5ab8ff',3,55,16);if(f.moveFrame>=m.startup&&f.moveFrame<=m.startup+m.active){if(f.moveFrame%4===0)vfxSpiralIn(cx,cy,'#4aa8ff',4,110,20);if(f.moveFrame===m.startup+1)vfxShockwave(cx,cy,'#7fd8ff',90,30);}}
  if(m.kind==='skill2'&&f.id==='gojo'){const cx=f.x+dir*85,cy=f.y-82;if(f.moveFrame<m.startup&&f.moveFrame%4===0)vfxSpiralIn(cx,cy,'#ff4455',2,48,14);if(f.moveFrame===m.startup){vfxShockwave(cx,cy,'#ff4455',68,26);flash(0.4,'#ff4455');}if(f.moveFrame>m.startup&&f.moveFrame<=m.startup+m.active){const hx=f.x+dir*(m.hitbox.x+m.hitbox.w*0.5);const hy=f.y+m.hitbox.y+m.hitbox.h*0.5;if(f.moveFrame%2===0)vfxShockwave(hx,hy,'#ff4455',110,22);}}
  if(m.kind==='skill3'&&f.id==='gojo'){const cx=f.x+dir*50,cy=f.y-92;if(f.moveFrame<m.startup){const tt=f.moveFrame/m.startup;if(tt<0.55){if(f.moveFrame%3===0)vfxSpiralIn(cx,cy,'#5ab8ff',2,38,14);if(f.moveFrame%3===1)vfxSpiralIn(f.x-dir*30,f.y-100,'#ff4455',2,38,14);}else if(tt<0.9){if(f.moveFrame%2===0)vfxSpiralIn(cx,cy,'#c07bff',3,30,12);}if(f.moveFrame===m.startup){flash(0.75,'#c07bff');vfxShockwave(cx,cy,'#c07bff',90,34);}}}
  if(f.id==='sukuna'&&f.form===0&&m.kind!=='skill3'){
    if(m.kind==='skill1'&&f.moveFrame===m.startup){const sx=f.x+dir*45,sy=f.y-92;vfxSlashTrail(sx-dir*45,sy-28,sx+dir*45,sy+22,'#ff5577',8,20);}
    if(m.kind==='skill2'&&f.moveFrame===m.startup){const cx=f.x+dir*55,cy=f.y-92;vfxSlashTrail(cx-42,cy-42,cx+42,cy+42,'#ff5577',10,22);vfxSlashTrail(cx-42,cy+42,cx+42,cy-42,'#ff5577',10,22);vfxShockwave(cx,cy,'#ff5577',80,22);flash(0.35,'#ff5577');camPunch(0.14);}
  }
  if(f.id==='sukuna'&&f.form===1){
    if(m.kind==='skill1'&&f.moveFrame>m.startup&&f.moveFrame<=m.startup+m.active){f.x+=dir*0.6;if(f.moveFrame%3===0)vfxSlashTrail(f.x-dir*30,f.y-70,f.x+dir*30,f.y-70,'#ff4466',6,14);}
    if(m.kind==='skill2'&&f.moveFrame===m.startup){const cx=f.x+dir*50,cy=f.y-90;vfxShockwave(cx,cy,'#ff4466',72,24);flash(0.35,'#ff4466');}
    if(m.kind==='skill3'&&f.moveFrame===m.startup){const cx=f.x+dir*50,cy=f.y-90;flash(0.9,'#ff2244');shake(22);camPunch(0.28);SFX.blackflash();floatText(f.x,f.y-170,'BLACK FLASH','#ff3355',28,60);for(let i=0;i<20;i++){const p=pget();const a=Math.random()*6.28;p.active=true;p.x=cx;p.y=cy;p.vx=Math.cos(a)*rnd(3,10);p.vy=Math.sin(a)*rnd(3,10);p.maxLife=p.life=rnd(14,26);p.size=rnd(4,9);p.color=i%2?'#ff2244':'#120008';p.grav=0;p.shape='bolt';p.rot=a;p.vr=rnd(-0.2,0.2);p.add=true;}}
    if(m.kind==='skill4'&&f.moveFrame===m.startup){const cx=f.x+dir*50,cy=f.y-90;vfxShockwave(cx,cy,'#ff4466',66,22);vfxEmber(cx,cy,6);}
  }
  if(f.id==='yuta'){
    const cx=f.x+dir*60,cy=f.y-90;
    if(m.kind==='skill1'){if(f.moveFrame>m.startup&&f.moveFrame<=m.startup+m.active&&f.moveFrame%3===0){vfxSpeechWaves(f.x+dir*80,f.y-90,dir,'#c9a6ff');}}
    if(m.kind==='skill2'&&f.moveFrame===m.startup){f.rikaTimer=Math.max(f.rikaTimer,60);}
    if(m.kind==='skill3'){if(f.moveFrame<m.startup&&f.moveFrame%3===0)vfxCopySwirl(f.x,f.y-70,3);}
    if(m.kind==='skill4'){if(f.moveFrame<m.startup&&f.moveFrame%3===0)vfxDistortion(cx,cy,dir,180,140);if(f.moveFrame===m.startup){SFX.sky();flash(0.4,'#e0d0ff');shake(12);camPunch(0.16);vfxShockwave(cx,cy,'#e0d0ff',90,30);}if(f.moveFrame>m.startup&&f.moveFrame<=m.startup+m.active){if(f.moveFrame%2===0)vfxDistortion(cx+dir*40,cy,dir,200,160);}}
    if(m.kind==='skill5'){if(f.moveFrame<m.startup&&f.moveFrame%4===0)vfxHealParticles(f.x,f.y-70,4);}
    if(m.kind==='def'&&f.moveFrame===m.startup){for(let i=0;i<20;i++){const a=(i/20)*6.28;const p=pget();p.active=true;p.x=f.x+Math.cos(a)*48;p.y=f.y-62+Math.sin(a)*64;p.vx=Math.cos(a)*1.4;p.vy=Math.sin(a)*1.4;p.maxLife=p.life=30;p.size=3;p.color='#c9a6ff';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
  }
  if(f.id==='hakari'&&m.kind==='def'&&f.moveFrame===m.startup){for(let i=0;i<18;i++){const a=(i/18)*6.28;const p=pget();p.active=true;p.x=f.x+Math.cos(a)*50;p.y=f.y-62+Math.sin(a)*66;p.vx=Math.cos(a)*1.3;p.vy=Math.sin(a)*1.3;p.maxLife=p.life=28;p.size=3;p.color='#ffd166';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
  if(f.moveFrame>=moveDuration(m))endMove(f);
}
function checkMeleeHit(f,m){
  if(!m.hitbox)return;
  const hb=getHitboxWorld(f,m.hitbox);const o=f.opp;const hurt=getHurtbox(o);
  if(aabb(hb,hurt)){
    const hx=(Math.max(hb.x,hurt.x)+Math.min(hb.x+hb.w,hurt.x+hurt.w))/2;
    const hy=(Math.max(hb.y,hurt.y)+Math.min(hb.y+hb.h,hurt.y+hurt.h))/2;
    const res=resolveHit(f,o,{damage:m.damage,hitstun:m.hitstun,blockstun:m.blockstun,kbx:m.kbx,kby:m.kby,hitstop:m.hitstop,armorBreak:m.armorBreak,kind:m.kind,type:'melee',meter:m.meter||4},hx,hy);
    if(res!=='whiff')f.hasHit=true;
    if(res==='infinity')f.hasHit=true;
    return res;
  }
  return 'whiff';
}
/* ===== JACKPOT RESOLVE ===== */
function resolveJackpot(f){
  const win=(f.rollResult==='success');
  if(win){f.jackpot=720;f.hp=Math.min(f.maxHp,f.hp+50);f.energy=Math.min(f.maxEnergy,f.energy+40);f.meter=Math.min(f.maxMeter,f.meter+20);flash(0.9,'#ffd166');shake(24);camPunch(0.32);vfxHakariJackpotBurst(f.x,f.y-70);ring(f.x,f.y-60,'#ffd166',100,50);ring(f.x,f.y-60,'#ffffff',70,40);G.texts.push({x:f.x,y:f.y-230,txt:'JACKPOT',color:'#ffd166',size:48,life:130,maxLife:130,vy:-0.7});G.texts.push({x:f.x,y:f.y-170,txt:'7 7 7',color:'#ffffff',size:28,life:110,maxLife:110,vy:-0.5});SFX.hakarijackpotsuccess();setTimeout(()=>SFX.hakarijackpotsuccess(),140);floatText(f.x,f.y-100,'+50 HP','#a6f0d0',22,60);cam.cine=Math.max(cam.cine,0.8);cam.cineX=f.x;cam.cineY=f.y-70;cam.cineZoom=1.35;G.slowmoTarget=Math.max(G.slowmoTarget,24);if(G.hakariCin){G.hakariCin.win=true;G.hakariCin.phase='result';G.hakariCin.timer=0;G.hakariCin.total=80;}}
  else{flash(0.3,'#3a1a2a');shake(6);ring(f.x,f.y-60,'#555555',50,24);floatText(f.x,f.y-180,'MISS','#888888',26,55);SFX.hakarijackpotfail();if(G.hakariCin){G.hakariCin.win=false;G.hakariCin.phase='result';G.hakariCin.timer=0;G.hakariCin.total=45;}}
  f.rollResult=null;
}
function startYutaBeam(f){const beamMove={name:'Menacing Beam',kind:'ult',ultType:'beam',startup:36,active:30,recovery:30,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,projectile:{type:'beam',damage:64,hitstun:56,blockstun:34,kbx:18,kby:-10,speed:26,w:130,h:240,life:72,hitstop:24,armorBreak:true,spawnPillar:false},cost:0,cd:0,invuln:100,aura:'beam'};f.moves.__yutaBeam=beamMove;startMove(f,'__yutaBeam',false);f.meter=0;f.rikaTimer=Math.max(f.rikaTimer,120);SFX.beamCharge();flash(0.4,'#c9a6ff');camPunch(0.16);floatText(f.x,f.y-210,'MENACING BEAM','#e0d0ff',28,100);}
function startYutaDomain(f){const domMove={name:'Domain Expansion: Infinite Sword Vault',kind:'ult',startup:80,active:1,recovery:60,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:0,cd:0,domain:'swords',invuln:140,aura:'yutadomain'};f.moves.__yutaDomain=domMove;startMove(f,'__yutaDomain',false);f.meter=0;f.rikaTimer=Math.max(f.rikaTimer,140);SFX.domain();}
/* ===== DOMAINS ===== */
function activateDomain(f){
  const o=f.opp;
  if(o.state==='ATTACK'&&o.move&&o.move.kind==='ult'&&o.move.domain&&Math.abs(f.ultStart-o.ultStart)<46){triggerClash(f,o);return;}
  const type=f.move.domain;
  const tickRate = type==='shrine'?11:(type==='shrine_heian'?10:(type==='swords'?18:(type==='strongest_void'?16:22)));
  G.domain={owner:f,type:type,timer:300,maxTimer:300,tick:0,tickRate:tickRate,swords:null};
  if(type==='swords'){const arr=[];for(let i=0;i<22;i++){arr.push({x:WALL+80+i*(ARENA_W-2*WALL-160)/21,y:GROUND-rnd(20,40),h:rnd(70,160),tilt:rnd(-0.35,0.35)});}G.domain.swords=arr;}
  f.state='ATTACK';f.moveFrame=f.move.startup;
  o.state='TRAPPED';o.stateFrame=0;o.move=null;o.hitstun=300;
  const colMap={void:'#1a0a3a',shrine:'#3a0a0a',swords:'#1a0f2e',shrine_heian:'#2a0510',strongest_void:'#001a2a'};
  G.flash=1;G.flashColor=colMap[type]||'#1a0a3a';
  shake(26);camPunch(0.30);G.zoomPunch=0.10;
  if(type==='shrine_heian'){
    SFX.heiandomain();
    cam.cine=1;cam.cineX=f.x;cam.cineY=f.y-70;cam.cineZoom=1.30;
    G.slowmoTarget=Math.max(G.slowmoTarget,40);
    for(let i=0;i<5;i++){const delay=i*4;setTimeout(()=>{if(G.domain&&G.domain.type==='shrine_heian'){vfxHeianDomainPillar(ARENA_W/2+(i-2)*180);}},delay*16);}
  } else if(type==='strongest_void'){
    SFX.domain();
    cam.cine=1;cam.cineX=f.x;cam.cineY=f.y-70;cam.cineZoom=1.28;
    G.slowmoTarget=Math.max(G.slowmoTarget,30);
    for(let i=0;i<6;i++){
      const delay=i*3;
      setTimeout(()=>{
        if(G.domain&&G.domain.type==='strongest_void'){
          const p=pget();
          p.active=true;
          p.x=f.x+rnd(-300,300);p.y=GROUND-rnd(0,260);
          p.vx=rnd(-0.5,0.5);p.vy=-rnd(1.5,3.5);
          p.maxLife=p.life=rnd(30,60);p.size=rnd(3,7);
          p.color=Math.random()<0.5?STRONGEST_CYAN:STRONGEST_CYAN_LT;
          p.grav=-0.02;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
        }
      },delay*16);
    }
  } else SFX.domain();
  const names={void:'UNLIMITED VOID',shrine:'MALEVOLENT SHRINE',swords:'INFINITE SWORD VAULT',shrine_heian:'MALEVOLENT SHRINE',strongest_void:'UNLIMITED VOID'};
  const cols={void:'#9f7bff',shrine:'#ff5566',swords:'#c9a6ff',shrine_heian:'#ff3344',strongest_void:'#00e5ff'};
  floatText(f.x,f.y-200,names[type],cols[type],30,90);
}
function vfxHeianDomainPillar(cx){
  for(let i=0;i<10;i++){
    const p=pget();
    p.active=true;
    p.x=cx+rnd(-30,30);p.y=GROUND-rnd(0,40);
    p.vx=rnd(-0.4,0.4);p.vy=-rnd(1.5,3.5);
    p.maxLife=p.life=rnd(30,60);p.size=rnd(3,7);
    p.color=Math.random()<0.5?'#ff3344':'#881122';
    p.grav=-0.02;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
  }
}
function updateDomain(){
  if(!G.domain)return;
  const d=G.domain;d.timer--;d.tick++;
  const o=d.owner.opp;
  const manifestProgress = clamp((d.maxTimer - d.timer) / 26, 0, 1);
  if(manifestProgress >= 1 && d.timer % d.tickRate === 0){
    if(d.type==='void'){
      o.hp-=5;o.hitstun=Math.max(o.hitstun,40);o.state='TRAPPED';
      spark(o.x,o.y-60,10,'#b28bff',4,7,22,0);
      floatText(o.x+rnd(-20,20),o.y-120,'VOID','#b28bff',16,36);
    }
    else if(d.type==='shrine'){
      o.hp-=6;o.hitstun=Math.max(o.hitstun,26);o.state='TRAPPED';
      for(let i=0;i<3;i++)spark(o.x+rnd(-40,40),o.y-rnd(20,110),4,'#ff5566',7,8,16,0.1);
      shake(5);SFX.hit(0.5);
    }
    else if(d.type==='shrine_heian'){
      const slashType = (d.tick / d.tickRate) % 4;
      const cx = o.x;
      const cy = o.y - 60;
      const sz = 110;
      let x1, y1, x2, y2;
      if(slashType === 0){x1 = cx - sz; y1 = cy - 50; x2 = cx + sz; y2 = cy + 50;}
      else if(slashType === 1){x1 = cx; y1 = cy - sz; x2 = cx; y2 = cy + sz;}
      else if(slashType === 2){x1 = cx - sz*0.8; y1 = cy - sz*0.6; x2 = cx + sz*0.8; y2 = cy + sz*0.6;}
      else{for(let k=0;k<3;k++) vfxSlashTrail(cx-60+k*20, cy-90, cx+60-k*20, cy-20, '#ff5566', 6, 16);}
      if(slashType < 3){
        vfxSlashTrail(x1, y1, x2, y2, '#ff3344', 8, 20);
        vfxSlashTrail(x1, y1, x2, y2, '#ffffff', 3, 14);
      }
      resolveHit(d.owner, o, {damage: 6, hitstun: 26, blockstun: 16, kbx: 0, kby: 0, hitstop: 3, kind: 'ult', type: 'melee', meter: 2, armorBreak: true}, cx, cy);
      o.comboCount = 0; o.comboTimer = 0;
      o.state = 'TRAPPED'; o.hitstun = Math.max(o.hitstun, 30); o.vx = 0;
      spark(cx + rnd(-40, 40), cy + rnd(-40, 40), 5, '#ff3344', 8, 8, 18, 0.1);
      shake(5);
      SFX.hit(0.55);
    }
    else if(d.type==='strongest_void'){
      /* Overdrive Unlimited Void — spatial distortion + more intense stun */
      o.hp-=5;o.hitstun=Math.max(o.hitstun,44);o.state='TRAPPED';
      spark(o.x,o.y-60,12,STRONGEST_CYAN,6,8,24,0);
      spark(o.x,o.y-90,8,STRONGEST_CYAN_LT,4,6,20,0);
      floatText(o.x+rnd(-20,20),o.y-130,'VOID',STRONGEST_CYAN,16,36);
      vfxSlashTrail(o.x-60,o.y-90,o.x+60,o.y-90,STRONGEST_CYAN,4,14);
      vfxSlashTrail(o.x,o.y-130,o.x,o.y-30,STRONGEST_CYAN,4,14);
      shake(4);
    }
    else if(d.type==='swords'){
      o.hp-=5;o.hitstun=Math.max(o.hitstun,30);o.state='TRAPPED';
      spark(o.x,o.y-60,8,'#c9a6ff',5,7,20,0);
      spark(o.x,o.y-90,6,'#e0d0ff',4,6,18,0);
      floatText(o.x+rnd(-20,20),o.y-130,'SLASH','#e0d0ff',14,30);
      shake(4);
    }
    o.meter=Math.min(o.maxMeter,o.meter+2);if(o.hp<=0)o.hp=0;
  }
  if(G.frame%3===0){
    const p=pget();p.active=true;
    if(d.type==='void'){p.x=cam.x+rnd(-600,600);p.y=cam.y+rnd(-380,380);p.vx=rnd(-0.4,0.4);p.vy=rnd(-0.4,0.4);p.maxLife=p.life=rnd(30,60);p.size=rnd(1,3.5);p.color=Math.random()<0.5?'#9f7bff':'#5ad2ff';}
    else if(d.type==='shrine'){p.x=o.x+rnd(-260,260);p.y=GROUND-rnd(0,260);p.vx=rnd(-1,1);p.vy=rnd(-2.5,-0.6);p.maxLife=p.life=rnd(22,46);p.size=rnd(2,5);p.color=Math.random()<0.5?'#ff5566':'#ffaa33';}
    else if(d.type==='shrine_heian'){p.x=cam.x+rnd(-600,600);p.y=cam.y+rnd(-350,350);p.vx=rnd(-0.5,0.5);p.vy=rnd(-0.6,0.2);p.maxLife=p.life=rnd(24,50);p.size=rnd(2,4.5);p.color=Math.random()<0.5?'#ff3344':'#881122';}
    else if(d.type==='strongest_void'){p.x=cam.x+rnd(-600,600);p.y=cam.y+rnd(-380,380);p.vx=rnd(-0.5,0.5);p.vy=rnd(-0.6,0.2);p.maxLife=p.life=rnd(24,50);p.size=rnd(2,5);p.color=Math.random()<0.5?STRONGEST_CYAN:STRONGEST_CYAN_LT;}
    else{p.x=cam.x+rnd(-600,600);p.y=cam.y+rnd(-350,350);p.vx=rnd(-0.5,0.5);p.vy=rnd(-0.5,0.2);p.maxLife=p.life=rnd(26,52);p.size=rnd(1.5,3.5);p.color=Math.random()<0.5?'#c9a6ff':'#ffffff';}
    p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
  }
  if(d.timer<=0){o.state='IDLE';o.stateFrame=0;o.hitstun=0;G.domain=null;if(cam.cine>0)cam.cine=Math.max(cam.cine,0.3);flash(0.4,'#ffffff');}
}
function triggerClash(a,b){G.clash={a,b,timer:200,resolved:false,winner:null,tug:0,aPresses:0,bPresses:0,pulseA:0,pulseB:0,decay:0};a.state='CLASH';b.state='CLASH';a.move=null;b.move=null;a.hitstun=240;b.hitstun=240;a.vx=0;b.vx=0;flash(1,'#ffffff');shake(30);camPunch(0.34);SFX.clash();G.domain=null;G.slowmoTarget=60;cam.cine=1;cam.cineX=(a.x+b.x)/2;cam.cineY=430;cam.cineZoom=1.28;floatText(ARENA_W/2,GROUND-320,'DOMAIN CLASH','#ffffff',44,160);}
function updateClash(i1,i2){
  const c=G.clash;if(!c)return;c.timer--;
  const a=c.a,b=c.b;
  const aTap=!!(i1&&i1.light);
  const bTap=!!(i2&&i2.light);
  /* Domain Clash is now a direct button-mash tug-of-war. */
  if(aTap){c.aPresses++;c.tug=clamp(c.tug+0.075,-1,1);c.pulseA=1;c.decay=0;SFX.ui();if(c.aPresses%6===0)floatText(a.x,a.y-165,'+','#8fdfff',18,28);}
  if(bTap){c.bPresses++;c.tug=clamp(c.tug-0.075,-1,1);c.pulseB=1;c.decay=0;SFX.ui();if(c.bPresses%6===0)floatText(b.x,b.y-165,'+','#ff7a7a',18,28);}
  /* Small neutral drift prevents one early mash from deciding the whole clash. */
  if(!aTap&&!bTap){c.decay++;if(c.decay>=4){c.tug*=0.992;c.decay=0;}}
  c.pulseA=Math.max(0,c.pulseA-0.12);c.pulseB=Math.max(0,c.pulseB-0.12);
  if(!c.resolved&&c.timer<=90){
    c.resolved=true;
    const diff=c.tug;flash(1,'#ffffff');shake(34);camPunch(0.30);
    if(Math.abs(diff)<0.12){c.winner=null;a.hp=Math.max(1,a.hp-14);b.hp=Math.max(1,b.hp-14);a.state='KNOCKBACK';b.state='KNOCKBACK';a.vx=-9;b.vx=9;a.vy=-7;b.vy=-7;a.onGround=false;b.onGround=false;floatText(ARENA_W/2,GROUND-280,'DOMAINS COLLAPSE','#ffd166',28,90);}
    else{const w=diff>0?a:b,l=diff>0?b:a;c.winner=w;l.hp=Math.max(1,l.hp-32);if(G.story&&G.story.clashStarted){G.story.flags.clashWinner=w.id;}l.state='KNOCKBACK';l.vx=(l.x>w.x?1:-1)*14;l.vy=-9;l.onGround=false;w.state='ATTACK';w.move=w.moves.ult;w.moveKey='ult';w.moveFrame=w.moves.ult.startup||80;if(w.moves.ult.domain){G.domain={owner:w,type:w.moves.ult.domain,timer:170,maxTimer:170,tick:0,tickRate:11,swords:null};if(w.moves.ult.domain==='swords'){const arr=[];for(let i=0;i<22;i++){arr.push({x:WALL+80+i*(ARENA_W-2*WALL-160)/21,y:GROUND-rnd(20,40),h:rnd(70,160),tilt:rnd(-0.35,0.35)});}G.domain.swords=arr;}}else{G.domain=null;}l.state='TRAPPED';l.hitstun=200;floatText(w.x,w.y-220,w.short+' DOMINATES','#ffffff',26,90);flash(0.9,w.id==='gojo'?'#9f7bff':(w.id==='young_gojo'?'#bfeeff':(w.id==='yuta'?'#c9a6ff':(w.id==='hakari'?'#ffd166':(w.id==='heian_sukuna'?'#ff3344':(w.id==='the_strongest_today'?STRONGEST_CYAN:'#ff5566'))))));}
  }
  if(c.timer<=0){const a=c.a,b=c.b;a.state=a.onGround?'IDLE':'FALL';a.stateFrame=0;a.hitstun=0;b.state=b.onGround?'IDLE':'FALL';b.stateFrame=0;b.hitstun=0;G.clash=null;cam.cine=0;}
}
/* ===== HAKARI CINEMATIC ===== */
const REEL_SYMBOLS=['7','◆','♠','777','★','●','▲','♥'];
function updateHakariCinematic(){
  const c=G.hakariCin;if(!c)return;c.timer++;const f=c.owner;
  if(!f||f.state==='DEFEAT'||G.matchOver){G.hakariCin=null;return;}
  if(c.phase==='domain'){const t=c.timer/c.total;c.reelTick++;const speedMult=(t<0.55)?(1+t*1.5):(Math.max(0.15,1.8*(1-(t-0.55)/0.45)));for(let i=0;i<4;i++){if(c.reelTick%Math.max(2,Math.round(6/c.reelSpeeds[i]/speedMult))===0){c.reel[i]=rint(0,REEL_SYMBOLS.length-1);if(G.frame%8===0)SFX.reelspin();}}if(c.timer%3===0){vfxHakariJackpotRoll(f.x+rnd(-40,40),f.y-rnd(40,140));}cam.cine=Math.max(cam.cine,0.6);cam.cineX=f.x;cam.cineY=f.y-70;cam.cineZoom=lerp(1.28,1.34,t);if(c.timer%20===0){flash(0.12,'#ffd166');}if(c.timer>=c.total){c.phase='spinEnd';c.timer=0;c.total=20;}}
  else if(c.phase==='spinEnd'){const loseSet=()=>{const a=rint(0,REEL_SYMBOLS.length-1);let b=rint(0,REEL_SYMBOLS.length-1);let d=rint(0,REEL_SYMBOLS.length-1);let guard=0;while((a===b&&b===d)&&guard<10){d=rint(0,REEL_SYMBOLS.length-1);guard++;}return [a,b,d,rint(0,REEL_SYMBOLS.length-1)];};const wantWin=(f.rollResult==='success');if(wantWin){const sym=rint(0,REEL_SYMBOLS.length-1);c.reel=[sym,sym,sym,rint(0,REEL_SYMBOLS.length-1)];c.matches=3;}else{c.reel=loseSet();c.matches=0;}if(c.timer===0)SFX.reelstop();if(c.timer>=c.total){c.phase='hold';c.timer=0;c.total=24;}}
  else if(c.phase==='hold'){if(c.timer>=c.total){if(f.rollTimer>0){f.rollTimer=1;}c.phase='result';c.timer=0;c.total=(c.win?80:45);}}
  else if(c.phase==='result'){const isWin=!!c.win;if(isWin){if(c.timer===1){vfxHakariJackpotBurst(f.x,f.y-70);for(let i=0;i<20;i++){const p=pget();const a2=Math.random()*6.28;p.active=true;p.x=f.x+rnd(-60,60);p.y=f.y-70;p.vx=Math.cos(a2)*rnd(5,14);p.vy=Math.sin(a2)*rnd(4,10)-6;p.maxLife=p.life=rnd(28,52);p.size=rnd(3,6);p.color=Math.random()<0.5?'#ffd166':'#ffcc44';p.grav=0.2;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}if(c.timer%5===0){vfxHakariJackpotRoll(f.x,f.y-70);}}else{if(c.timer%4===0){const p=pget();p.active=true;p.x=f.x+rnd(-30,30);p.y=f.y-70+rnd(-20,20);p.vx=rnd(-1,1);p.vy=-rnd(0.5,1.5);p.maxLife=p.life=rnd(14,26);p.size=rnd(2,4);p.color='#666677';p.grav=0.05;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}if(c.timer>=c.total){cam.cine=0;G.hakariCin=null;}}
}