/* ITACHI MOVESET REBOOT v1
   Single source of truth for Itachi combat, posing, Susanoo, cinematic locks and effects.
   The core engine still owns movement, round state, AI, energy and cooldown accounting.
*/
(function(){
  'use strict';
  if(window.__JFF_ITACHI_MOVESET_REBOOT__) return;
  window.__JFF_ITACHI_MOVESET_REBOOT__ = true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const sign=v=>v<0?-1:(v>0?1:0);
  const Q=window.JFF_ITACHI_REBOOT={
    version:'1.0.0',tick:0,shots:[],clone:null,burns:[],cinema:null,
    lastMode:'',maxShots:24,fxCount:0
  };
  const fxSys=window.JFF_OUTSIDER||(window.JFF_OUTSIDER={tick:0,fx:[],shots:[],clone:null,burn:null,burns:[],moon:null,sealing:null});
  const MOVES={
    light:{name:'Crow Flicker Dance',kind:'light',startup:8,active:82,recovery:0,damage:8,hitstun:16,blockstun:10,kbx:4,kby:-1,hitbox:{x:20,y:-95,w:96,h:60},hitstop:5,meter:5,cost:0,cd:0},
    heavy:{name:'Susanoo Rib-Cage Smash',kind:'heavy',startup:15,active:50,recovery:0,damage:28,hitstun:42,blockstun:28,kbx:12,kby:-8,hitbox:{x:10,y:-120,w:220,h:140},armorBreak:true,hitstop:13,meter:10,cost:0,cd:0},
    air:{name:'Crow Dive',kind:'air',startup:6,active:12,recovery:10,damage:13,hitstun:22,blockstun:12,kbx:7,kby:-4,hitbox:{x:18,y:-80,w:96,h:60},hitstop:7,meter:6,cost:0,cd:0},
    s1:{name:'Katon: Gōkakyū no Jutsu',kind:'skill1',startup:25,active:45,recovery:25,damage:0,hitstun:0,blockstun:0,hitbox:null,cost:18,cd:300,meter:8,aura:'itachiFireball'},
    s2:{name:'Mangekyō: Tsukuyomi Counter',kind:'skill2',startup:20,active:1,recovery:22,damage:24,hitstun:0,blockstun:0,hitbox:null,cost:30,cd:540,meter:12,aura:'itachiTsukuyomi'},
    s3:{name:'Susanoo: Yasaka Magatama',kind:'skill3',startup:40,active:20,recovery:30,damage:0,hitstun:0,blockstun:0,hitbox:null,cost:30,cd:420,meter:12,aura:'itachiMagatama'},
    s4:{name:'Bunshin Daibakuha',kind:'skill4',startup:20,active:20,recovery:10,damage:0,hitstun:0,blockstun:0,hitbox:null,cost:26,cd:460,meter:10,aura:'itachiClone'},
    s5:{name:'Amaterasu: Black Flame',kind:'skill5',startup:26,active:34,recovery:0,damage:0,hitstun:0,blockstun:0,hitbox:null,cost:36,cd:600,meter:12,aura:'itachiAmaterasu'},
    def:{name:'Yata Mirror',kind:'def',startup:4,active:44,recovery:12,damage:0,hitstun:0,blockstun:0,hitbox:null,cost:18,cd:420,meter:0,aura:'itachiYata'},
    ult:{name:'Complete Susanoo: Totsuka Sealing Finale',kind:'ult',startup:45,active:195,recovery:0,damage:0,hitstun:0,blockstun:0,hitbox:null,cost:0,cd:0,meter:0,invuln:242,aura:'itachiUltimate'}
  };
  if(typeof CHARS!=='undefined'&&CHARS.itachi){
    CHARS.itachi.moves=MOVES;CHARS.itachi.hp=200;CHARS.itachi.walk=3.65;CHARS.itachi.trainingOnly=true;CHARS.itachi.outsider=true;
  }
  if(typeof G!=='undefined'&&Array.isArray(G.fighters))for(const f of G.fighters)if(f&&f.id==='itachi')f.moves=MOVES;

  const baseStartMove=window.startMove;
  const baseUpdateMove=window.updateMove;
  const baseResolveHit=window.resolveHit;
  const baseResetFighter=window.resetFighter;
  const baseStep=window.step;
  const baseRender=window.render;
  const baseDrawFighter=window.drawFighter;
  const basePose=window.applyCharacterIdentityPose;

  function effect(type,x,y,d,data){
    if(typeof window.JFF_OUTSIDER_FX==='function')return window.JFF_OUTSIDER_FX(type,x,y,d||20,data||{});
    if(Array.isArray(fxSys.fx)){fxSys.fx.push({type:type,x:x,y:y,t:0,d:d||20,data:data||{}});return null;}
    return null;
  }
  function screenImpact(power,color){
    if(typeof flash==='function')flash(power||.2,color||'#bd263f');
    if(typeof shake==='function')shake(Math.max(2,Math.round((power||.2)*24)));
    if(typeof camPunch==='function')camPunch((power||.2)*.24);
  }
  function fighters(){return typeof G!=='undefined'&&Array.isArray(G.fighters)?G.fighters:[];}
  function frontTarget(f,range,yRange){
    const o=f&&f.opp,dir=f&&f.facing||1;
    return !!(o&&o.hp>0&&o.state!=='DEFEAT'&&o.state!=='VICTORY'&&((o.x-f.x)*dir>-18)&&Math.abs(o.x-f.x)<=range&&Math.abs(o.y-f.y)<=yRange);
  }
  function resolveItachiHit(f,o,data,x,y){
    if(!f||!o||o.hp<=0)return 'whiff';
    const mv=Object.assign({damage:8,hitstun:16,blockstun:10,kbx:4,kby:0,hitstop:5,meter:4,kind:'melee',type:'melee'},data||{});
    if(typeof window.resolveHit==='function')return window.resolveHit(f,o,mv,x==null?f.x+f.facing*60:x,y==null?f.y-90:y);
    return 'whiff';
  }
  function impactText(x,y,t,color){
    if(typeof floatText==='function')floatText(x,y,t,color||'#ff506b',18,46);
  }
  function spawnShot(owner,kind,x,y,vx,vy,opt){
    opt=opt||{};
    Q.shots.push({owner:owner,kind:kind,x:x,y:y,vx:vx,vy:vy,r:opt.r||20,damage:opt.damage||10,stun:opt.stun||16,kbx:opt.kbx||7,kby:opt.kby||-3,life:opt.life||100,rot:0,hit:false,armorBreak:!!opt.armorBreak});
    if(Q.shots.length>Q.maxShots)Q.shots.splice(0,Q.shots.length-Q.maxShots);
  }
  function fireball(f,q){
    q=clamp(q||0,0,1);
    const d=f.facing,x=f.x+d*48,y=f.y-116;
    spawnShot(f,'fireball',x,y,(14+q*2.8)*d,-.22,{r:27*(1+.5*q),damage:Math.round(20*(1+.3*q)),stun:25+Math.round(q*5),kbx:10+q*3,kby:-5,life:96,armorBreak:false});
    effect('fire',x,y,28,{charge:q});effect('shock',x,y,18);screenImpact(.14,'#e8472f');
    if(typeof SFX!=='undefined'&&SFX.fugaRelease)SFX.fugaRelease();
  }
  function yasaka(f){
    const d=f.facing,x=f.x+d*96,y=f.y-194;
    for(let i=0;i<3;i++){
      const vy=(i-1)*2.45;
      spawnShot(f,'magatama',x,y,(16+(i===1?2:0))*d,vy,{r:18,damage:8,stun:17,kbx:8,kby:-4,life:100});
    }
    effect('magatama',x,y,32);effect('shock',x,y,28);screenImpact(.22,'#d44a51');
    if(typeof SFX!=='undefined'&&SFX.heavy)SFX.heavy();
  }
  function shurikenFan(f){
    const d=f.facing,x=f.x+d*48,y=f.y-108;
    for(let i=-1;i<=1;i++)spawnShot(f,'shuriken',x,y,(18-Math.abs(i)*1.2)*d,i*2.4,{r:13,damage:6,stun:13,kbx:5,kby:-1,life:72});
    effect('crows',f.x-d*8,f.y-86,22);effect('shock',x,y,14);
  }
  function updateShots(){
    if(Q.cinema)return;
    for(let i=Q.shots.length-1;i>=0;i--){
      const q=Q.shots[i],o=q.owner&&q.owner.opp;
      q.x+=q.vx;q.y+=q.vy;q.rot+=.22;q.life--;
      if(!q.hit&&o&&o.hp>0&&Math.abs(q.x-o.x)<q.r+29&&Math.abs(q.y-(o.y-84))<q.r+54){
        const res=resolveItachiHit(q.owner,o,{damage:q.damage,hitstun:q.stun,blockstun:12,kbx:q.kbx,kby:q.kby,hitstop:6,meter:3,armorBreak:q.armorBreak,kind:'projectile',type:'projectile'},q.x,q.y);
        if(res!=='whiff'){q.hit=true;q.life=0;effect(q.kind==='fireball'?'explosion':'magatama',q.x,q.y,20);effect('shock',q.x,q.y,15);}
      }
      if(q.life<=0||q.x< -100||q.x>(window.ARENA_W||3200)+100)Q.shots.splice(i,1);
    }
  }
  function detonateClone(c){
    if(!c||c.triggered)return;
    c.triggered=true;
    const f=c.owner,o=f&&f.opp;
    effect('explosion',c.x,c.y-82,32);effect('crows',c.x,c.y-82,36);effect('shock',c.x,c.y-78,30);
    screenImpact(.3,'#a91f38');
    if(o&&o.hp>0&&Math.abs(o.x-c.x)<190&&Math.abs(o.y-c.y)<150){
      resolveItachiHit(f,o,{damage:27,hitstun:32,blockstun:21,kbx:11,kby:-7,hitstop:12,armorBreak:true,meter:9,kind:'projectile',type:'special'},c.x,c.y-80);
    }
    Q.clone=null;
  }
  function updateClone(){
    const c=Q.clone;if(!c)return;
    c.t++;
    const o=c.owner&&c.owner.opp;
    if(!o||o.hp<=0||c.t>c.d){Q.clone=null;return;}
    const dist=Math.hypot(o.x-c.x,(o.y-c.y)*.7);
    const m=o.move,frame=o.moveFrame||0;
    const active=!!(o.state==='ATTACK'&&m&&frame>(m.startup||0)&&frame<=(m.startup||0)+(m.active||0));
    if(dist<77||active&&Math.abs(o.x-c.x)<145){detonateClone(c);}
  }
  function updateBurns(){
    for(let i=Q.burns.length-1;i>=0;i--){
      const b=Q.burns[i],o=b.target;
      if(!o||o.hp<=0||b.t>=b.d){Q.burns.splice(i,1);continue;}
      b.t++;
      if(b.t%10===0)effect(b.kind==='amaterasu'?'amaterasu':'fire',o.x,o.y-84,14,{charge:.25});
      if(b.t>=b.next){
        b.next+=30;o.hp=Math.max(0,o.hp-4);o.hitFlash=3;
        if(o.hp<=0){o.hp=0;o.state='DEFEAT';o.stateFrame=0;}
      }
    }
  }
  function validCinematicTarget(f,range){
    const o=f&&f.opp;
    return !!(o&&o.hp>0&&o.state!=='DEFEAT'&&o.state!=='VICTORY'&&(o.x-f.x)*(f.facing||1)>0&&Math.abs(o.x-f.x)<=range&&Math.abs(o.y-f.y)<175);
  }
  function beginCinema(kind,owner,target,duration){
    if(Q.cinema)return false;
    Q.cinema={kind:kind,owner:owner,target:target||null,frame:0,duration:duration,hitDone:false,createdAt:Q.tick,targetStartHp:target?target.hp:0};
    Q.shots.length=0;Q.clone=null;
    if(owner){owner.itachiCinemaKind=kind;owner.itachiPoseKey=kind==='ult'?'ult':'s2';owner.invuln=Math.max(owner.invuln||0,duration+3);owner.vx=0;}
    if(target){
      target.itachiCinemaStun=duration+3;
      target.move=null;target.moveKey=null;target.moveFrame=0;target.vx=0;target.vy=0;
      target.hitstun=Math.max(target.hitstun||0,duration+3);target.immobilize=Math.max(target.immobilize||0,duration+3);
      target.state='HITSTUN';target.stateFrame=0;
    }
    if(kind==='tsukuyomi'){
      effect('moon',target?target.x:owner.x+owner.facing*100,target?target.y-90:owner.y-90,duration);
      effect('crows',owner.x,owner.y-90,36);
      if(typeof SFX!=='undefined'&&SFX.domain)SFX.domain();
    }else{
      effect('shock',owner.x,owner.y-100,42);effect('reflect',owner.x+owner.facing*48,owner.y-100,34);
      if(typeof SFX!=='undefined'&&SFX.awaken)SFX.awaken();
    }
    screenImpact(kind==='ult'?.62:.35,kind==='ult'?'#c94d40':'#7e1231');
    if(typeof camPunch==='function')camPunch(kind==='ult'?.34:.20);
    return true;
  }
  function finishCinema(){
    const c=Q.cinema;if(!c)return;
    const o=c.target,owner=c.owner;
    if(o){
      o.immobilize=0;o.hitstun=0;o.itachiCinemaStun=0;o.vx=0;o.vy=0;o.move=null;o.moveKey=null;o.moveFrame=0;
      if(o.hp<=0||o.state==='DEFEAT'){o.hp=0;o.state='DEFEAT';o.stateFrame=0;}
      else{o.state='IDLE';o.stateFrame=0;o.invuln=Math.max(o.invuln||0,18);}
    }
    if(owner){
      owner.itachiCinemaKind='';owner.itachiPoseKey='';
      if(owner.move&&owner.moveKey==='ult')endMove(owner);
      else if(owner.move&&owner.moveKey==='s2')endMove(owner);
      owner.vx=0;
    }
    Q.cinema=null;
  }
  function updateCinema(){
    const c=Q.cinema;if(!c)return;
    c.frame++;
    const n=c.frame,o=c.target,owner=c.owner;
    if(c.kind==='tsukuyomi'){
      if(n===72&&o&&!c.hitDone){
        c.hitDone=true;o.hp=Math.max(0,o.hp-24);o.hitFlash=7;
        if(o.hp<=0){o.hp=0;o.state='DEFEAT';o.stateFrame=0;}
        effect('slash',o.x,o.y-95,24);effect('shock',o.x,o.y-84,26);
      }
    }else{
      if(n===46&&owner){effect('shock',owner.x,owner.y-100,40);effect('magatama',owner.x+owner.facing*80,owner.y-178,36);}
      if(n===82&&owner){effect('reflect',owner.x+owner.facing*85,owner.y-160,48);screenImpact(.24,'#ffd5a0');}
      if(n===151&&!c.hitDone&&o&&o.hp>0){
        c.hitDone=true;
        const pct=o.hp/Math.max(1,o.maxHp||200);
        if(pct<=.30){o.hp=0;o.state='DEFEAT';o.stateFrame=0;}
        else{o.hp=Math.max(1,o.hp-Math.round((o.maxHp||200)*.40));o.hitFlash=8;}
        effect('seal',o.x,o.y-82,90);effect('explosion',o.x,o.y-82,32);
        screenImpact(.7,'#d64d4b');
        if(typeof SFX!=='undefined'&&SFX.blackflash)SFX.blackflash();
      }
      if(n===180&&o&&o.state!=='DEFEAT')effect('seal',o.x,o.y-82,50);
    }
    if(n>=c.duration)finishCinema();
  }
  function guardItachiAgainst(attacker,defender,mv){
    if(!attacker||!defender||defender.id!=='itachi'||attacker===defender)return false;
    const toward=defender.facing===(sign(attacker.x-defender.x)||1);
    if(!toward||(defender.invuln||0)>0)return false;
    const now=Q.tick;
    const tsukuReady=defender.moveKey==='s2'&&defender.itachiCounterUntil>now&&defender.state==='ATTACK';
    if(tsukuReady&&attacker.hp>0&&attacker.state!=='DEFEAT'&&attacker.state!=='VICTORY'){
      beginCinema('tsukuyomi',defender,attacker,140);
      attacker.move=null;attacker.moveKey=null;attacker.vx=0;attacker.vy=0;
      effect('crows',defender.x,defender.y-86,28);effect('shock',attacker.x,attacker.y-86,28);
      return true;
    }
    if(defender.moveKey==='def'&&defender.itachiYataUntil>now){
      defender.itachiYataUntil=0;
      attacker.move=null;attacker.moveKey=null;attacker.moveFrame=0;attacker.state='HITSTUN';attacker.stateFrame=0;
      attacker.hitstun=Math.max(attacker.hitstun||0,24);attacker.vx=defender.facing*5;attacker.vy=-1.3;
      effect('reflect',defender.x+defender.facing*34,defender.y-86,28);
      effect('shock',attacker.x,attacker.y-80,22);
      if(typeof SFX!=='undefined'&&SFX.parry)SFX.parry();
      return true;
    }
    return false;
  }
  if(typeof baseResolveHit==='function'){
    window.resolveHit=function(attacker,defender,mv,hx,hy){
      if(Q.cinema){
        const c=Q.cinema;
        if(defender===c.target||attacker===c.target||defender===c.owner||attacker===c.owner)return 'whiff';
      }
      if(guardItachiAgainst(attacker,defender,mv||{}))return 'parry';
      if(defender&&defender.id==='itachi'&&defender.itachiYataUntil>Q.tick){
        const toward=defender.facing===(sign(attacker.x-defender.x)||1);
        if(toward){defender.itachiYataUntil=0;effect('reflect',defender.x+defender.facing*30,defender.y-88,24);return 'parry';}
      }
      return baseResolveHit.apply(this,arguments);
    };
  }
  if(typeof baseStartMove==='function'){
    window.startMove=function(f,key,isBF){
      if(Q.cinema)return false;
      const ok=baseStartMove.apply(this,arguments);
      if(ok&&f&&f.id==='itachi'){
        f.moves=MOVES;f.itachiPoseKey=key;f.itachiCinemaKind='';
        f.itachiHitMarks={};f.itachiChargeFrames=0;f.itachiFireReleased=false;f.itachiFireDone=false;
        f.itachiGuardStarted=0;f.itachiYataUntil=0;f.itachiCounterUntil=0;
        f.itachiMoveStart=Q.tick;f.itachiCloneSerial=(f.itachiCloneSerial||0)+1;
        if(key==='s1')f.itachiChargeKey=f.isP2?'Numpad3':'Digit3';
        if(key==='s2')f.itachiCounterUntil=Q.tick+22;
        if(key==='def')f.itachiYataUntil=Q.tick+48;
        if(key==='ult'){f.invuln=Math.max(f.invuln||0,244);f.itachiUltStartHp=f.opp?f.opp.hp:0;}
      }
      return ok;
    };
  }
  if(typeof baseUpdateMove==='function'){
    window.updateMove=function(f){
      if(!f||f.id!=='itachi')return baseUpdateMove.apply(this,arguments);
      const m=f.move;if(!m){f.state='IDLE';return;}
      if(Q.cinema&&Q.cinema.owner===f){f.moveFrame=(f.moveFrame||0)+1;return;}
      f.moveFrame=(f.moveFrame||0)+1;
      const n=f.moveFrame,k=f.moveKey,o=f.opp,d=f.facing||1;
      f.itachiPoseKey=k;
      const once=(name)=>{if(f.itachiHitMarks[name])return false;f.itachiHitMarks[name]=true;return true;};
      if(k==='light'){
        if(n===8&&once('m1a')){
          if(frontTarget(f,132,130))resolveItachiHit(f,o,{damage:7,hitstun:15,blockstun:10,kbx:4,kby:-1,hitstop:5,meter:3},f.x+d*62,f.y-96);
          effect('slash',f.x+d*62,f.y-96,16);
        }
        if(n===18&&once('m1b')){
          if(frontTarget(f,142,130))resolveItachiHit(f,o,{damage:8,hitstun:17,blockstun:11,kbx:5,kby:-2,hitstop:6,meter:4},f.x+d*68,f.y-93);
          effect('slash',f.x+d*65,f.y-91,18);
        }
        if(n===27&&once('m1c')){
          if(frontTarget(f,430,150)){
            f.x=clamp(o.x-(o.facing||-d)*62,(window.WALL||130),(window.ARENA_W||3200)-(window.WALL||130));
            f.facing=o.x>f.x?1:-1;f.vx=0;f.invuln=Math.max(f.invuln||0,8);
          }
          effect('crows',f.x-d*20,f.y-86,32);effect('shock',f.x,f.y-82,18);
        }
        if(n===37&&once('m1kick')){
          if(o&&o.hp>0&&Math.abs(o.x-f.x)<150&&Math.abs(o.y-f.y)<150)resolveItachiHit(f,o,{damage:10,hitstun:21,blockstun:13,kbx:8,kby:-6,hitstop:8,meter:5},o.x,o.y-86);
          effect('slash',f.x+d*54,f.y-74,22);effect('crows',f.x-d*10,f.y-85,20);
        }
        if(n===54&&once('m1shuriken'))shurikenFan(f);
        if(n===78&&once('m1finisher')){
          if(o&&o.hp>0&&Math.abs(o.x-f.x)<190&&Math.abs(o.y-f.y)<150){
            resolveItachiHit(f,o,{damage:18,hitstun:28,blockstun:18,kbx:13,kby:-8,hitstop:13,meter:8},o.x,o.y-82);
            Q.burns.push({target:o,t:0,d:120,next:30,kind:'ember'});
          }
          effect('fire',f.x+d*70,f.y-90,24,{charge:.3});effect('explosion',f.x+d*70,f.y-86,24);screenImpact(.28,'#f04d37');
        }
        if(n>=90)endMove(f);
      }else if(k==='heavy'){
        if(n===5){effect('shock',f.x,f.y-85,22);effect('reflect',f.x,f.y-138,22);}
        if(n===16){effect('shock',f.x,f.y-100,30);}
        if(n===27&&once('heavyImpact')){
          const hit=o&&o.hp>0&&Math.abs(o.x-f.x)<250&&Math.abs(o.y-f.y)<165;
          effect('explosion',f.x+d*55,f.y-14,35);effect('shock',f.x+d*55,f.y-10,36);screenImpact(.5,'#cb5845');
          if(hit){if(typeof canBlockAgainst==='function'&&canBlockAgainst(o)&&o.facing===(sign(f.x-o.x)||1))o.blocking=false;
            resolveItachiHit(f,o,{damage:28,hitstun:40,blockstun:29,kbx:13,kby:-9,hitstop:15,armorBreak:true,meter:11},o.x,o.y-88);}
        }
        if(n>=65)endMove(f);
      }else if(k==='air'){
        if(n===8&&once('airHit')&&o&&o.hp>0&&Math.abs(o.x-f.x)<155&&Math.abs(o.y-f.y)<155){
          resolveItachiHit(f,o,{damage:13,hitstun:22,blockstun:12,kbx:7,kby:-5,hitstop:8,meter:6},o.x,o.y-84);effect('crows',f.x,f.y-82,22);
        }
        if(n>=28)endMove(f);
      }else if(k==='s1'){
        const code=f.itachiChargeKey||(f.isP2?'Numpad3':'Digit3');
        if(!f.itachiFireDone){
          if(typeof KEY!=='undefined'&&KEY[code]&&n<91)f.itachiChargeFrames=Math.min(90,(f.itachiChargeFrames||0)+1);
          else f.itachiFireReleased=true;
          if(f.itachiChargeFrames>=90||(f.itachiFireReleased&&n>=25)){
            fireball(f,Math.max(.18,(f.itachiChargeFrames||0)/90));
            f.itachiFireDone=true;f.itachiFireFrame=n;f.itachiChargeFrames=0;
          }
        }
        if(n>=Math.max(34,(f.itachiFireFrame||m.startup)+24))endMove(f);
      }else if(k==='s2'){
        if(n===1){effect('reflect',f.x+d*26,f.y-104,23);effect('crows',f.x-d*12,f.y-82,18);}
        if(n>=42&&!Q.cinema)endMove(f);
      }else if(k==='s3'){
        if(n===20){effect('reflect',f.x+d*45,f.y-155,28);effect('magatama',f.x+d*74,f.y-192,26);}
        if(n===41&&once('yasaka'))yasaka(f);
        if(n>=90)endMove(f);
      }else if(k==='s4'){
        if(n===10&&once('cloneCreate')){
          Q.clone={owner:f,x:f.x,y:f.y,t:0,d:78,face:d,triggered:false};
          effect('crows',f.x,f.y-84,28);effect('shock',f.x,f.y-78,16);
        }
        if(n===15&&once('cloneTeleport')){
          if(o&&o.hp>0&&Math.abs(o.x-f.x)<390&&Math.abs(o.y-f.y)<160){
            f.x=clamp(o.x-(o.facing||-d)*70,(window.WALL||130),(window.ARENA_W||3200)-(window.WALL||130));
            f.facing=o.x>f.x?1:-1;
          }else f.x=clamp(f.x-d*92,(window.WALL||130),(window.ARENA_W||3200)-(window.WALL||130));
          f.vx=0;f.invuln=Math.max(f.invuln||0,9);effect('crows',f.x,f.y-84,28);effect('shock',f.x,f.y-78,20);
        }
        if(n>=44)endMove(f);
      }else if(k==='s5'){
        if(n===26&&once('amaterasu')){
          if(frontTarget(f,420,155)){
            Q.burns=Q.burns.filter(b=>b.target!==o);
            Q.burns.push({target:o,t:0,d:300,next:30,kind:'amaterasu'});
            effect('amaterasu',o.x,o.y-84,42);effect('shock',o.x,o.y-85,30);screenImpact(.28,'#1d0913');
            if(typeof SFX!=='undefined'&&SFX.red)SFX.red();impactText(o.x,o.y-156,'AMATERASU','#ff6680');
          }else effect('crows',f.x+d*48,f.y-86,24);
        }
        if(n>=60)endMove(f);
      }else if(k==='def'){
        if(n===4){f.itachiYataUntil=Q.tick+44;effect('reflect',f.x+d*36,f.y-92,35);effect('shock',f.x+d*32,f.y-78,22);if(typeof SFX!=='undefined'&&SFX.parry)SFX.parry();}
        if(n>=60){f.itachiYataUntil=0;endMove(f);}
      }else if(k==='ult'){
        if(n===1){
          f.itachiPoseKey='ult';
          const target=validCinematicTarget(f,475)?o:null;
          beginCinema('ult',f,target,240);
        }
        if(n>=242&&!Q.cinema)endMove(f);
      }else{
        if(n>=((m.startup||6)+(m.active||4)+(m.recovery||8)))endMove(f);
      }
    };
  }
  if(typeof baseResetFighter==='function'){
    window.resetFighter=function(f){
      // Unlock both sides before the engine resets one fighter during training/round transitions.
      if(Q.cinema&&(Q.cinema.owner===f||Q.cinema.target===f))finishCinema();
      const r=baseResetFighter.apply(this,arguments);
      if(f&&f.id==='itachi'){
        f.moves=MOVES;f.itachiPoseKey='';f.itachiCinemaKind='';f.itachiChargeFrames=0;f.itachiFireDone=false;
        f.itachiCounterUntil=0;f.itachiYataUntil=0;f.itachiTauntFrames=0;f.itachiTauntCd=0;f.itachiVictoryFrames=0;f.itachiVictoryActive=false;
        f.itachiInvulnDash=0;
      }
      if(Q.clone&&Q.clone.owner===f)Q.clone=null;
      Q.shots=Q.shots.filter(s=>s.owner!==f);
      Q.burns=Q.burns.filter(b=>b.target!==f);
      return r;
    };
  }

  function updateTick(){
    if(typeof G==='undefined')return;
    if(G.mode==='menu'){
      if(Q.lastMode!=='menu'){
        Q.shots.length=0;Q.clone=null;Q.burns.length=0;
        if(Q.cinema)finishCinema();
        if(Array.isArray(fxSys.fx))fxSys.fx.length=0;
      }
      Q.lastMode='menu';return;
    }
    // Pausing must freeze the cinematic, not discard its controller and strand a locked target.
    if(G.paused)return;
    Q.lastMode=G.mode;Q.tick++;fxSys.tick=Q.tick;
    if(Array.isArray(fxSys.fx)){
      for(let i=fxSys.fx.length-1;i>=0;i--){const a=fxSys.fx[i];a.t=(a.t||0)+1;if(a.t>=(a.d||24))fxSys.fx.splice(i,1);}
    }
    for(const f of fighters()){
      if(!f||f.id!=='itachi')continue;
      if(f.itachiTauntFrames>0)f.itachiTauntFrames--;
      if(f.state==='VICTORY'){
        f.itachiVictoryFrames=(f.itachiVictoryFrames||0)+1;
        if(!f.itachiVictoryActive){f.itachiVictoryActive=true;effect('moon',f.x,f.y-100,120);effect('crows',f.x,f.y-85,50);}
        if(f.itachiVictoryFrames<120&&f.itachiVictoryFrames%14===0)effect('crows',f.x,f.y-85,28);
      }else{f.itachiVictoryFrames=0;f.itachiVictoryActive=false;}
    }
    if(!Q.cinema){updateShots();updateClone();updateBurns();}
    updateCinema();
    if(fxSys.fx&&fxSys.fx.length>90)fxSys.fx.splice(0,fxSys.fx.length-90);
  }
  window.JFF_ITACHI_FIXED_UPDATE=updateTick;
  let fixedStepHooked=false;
  if(typeof baseStep==='function'){
    window.step=function(){const r=baseStep.apply(this,arguments);updateTick();return r;};
    fixedStepHooked=true;
  }

  function pose(P,f){
    if(typeof basePose==='function')basePose.apply(this,arguments);
    if(!P||!f||f.id!=='itachi')return;
    const n=f.moveFrame||0,k=f.itachiPoseKey||f.moveKey||'',cine=Q.cinema&&Q.cinema.owner===f;
    const set=(lean,a,b,legs,hip,head,sh)=>{
      P.lean=lean;P.armF=a.slice();P.armB=b.slice();
      if(legs){P.legF=legs[0].slice();P.legB=legs[1].slice();}
      if(hip!==undefined)P.hipY=hip;if(head!==undefined)P.headY=head;if(sh!==undefined)P.shY=sh;
    };
    if(f.state==='VICTORY'||f.itachiTauntFrames>0){
      const t=f.itachiTauntFrames>0?1:0;
      set(-3,[35,-27],[125,-18],[[86,3],[98,-3]],-58,-116);
      if(t)set(-7,[27,-36],[124,-28],[[79,2],[104,-4]],-57,-118);
      return;
    }
    if(cine&&Q.cinema.kind==='ult'){
      if(Q.cinema.frame<45)set(-13,[34,-42],[146,-40],[[77,7],[109,-9]],-52,-117);
      else if(Q.cinema.frame<82)set(-9,[15,-52],[161,-42],[[74,9],[113,-9]],-50,-115);
      else set(15,[16,42],[151,30],[[72,15],[115,-13]],-51,-112);
      return;
    }
    if(k==='light'){
      if(n<11)set(-10,[43,-29],[130,18],[[81,5],[105,-5]],-59,-115);
      else if(n<24)set(13,[25,28],[143,27],[[73,10],[116,-12]],-54,-111);
      else if(n<36)set(-12,[38,-25],[148,38],[[62,-20],[121,16]],-61,-116);
      else if(n<47)set(2,[18,-41],[133,18],[[92,6],[104,-6]],-57,-116);
      else if(n<68)set(-7,[28,-18],[157,11],[[78,5],[109,-6]],-56,-115);
      else set(21,[15,45],[142,22],[[71,15],[115,-14]],-53,-111);
    }else if(k==='heavy'){
      if(n<16)set(-13,[35,-26],[126,-24],[[76,7],[110,-8]],-54,-115);
      else if(n<27)set(-25,[12,-58],[157,-62],[[70,14],[116,-12]],-48,-109);
      else if(n<39)set(20,[12,54],[163,48],[[62,18],[120,-17]],-50,-108);
      else set(-2,[62,14],[118,14],[[85,0],[99,-1]],-57,-114);
    }else if(k==='s1'){
      if(f.itachiFireDone){set(19,[15,22],[148,-17],[[72,14],[113,-12]],-53,-119,-90);return;}
      const seals=[[54,21,126,14,-4],[34,-24,143,22,-8],[46,-36,133,-25,0],[23,8,153,-9,5],[31,-15,145,14,-6],[20,-26,154,24,-12]];
      const q=clamp((f.itachiChargeFrames||n)/18,0,1)*(seals.length-1),i=Math.min(seals.length-2,Math.floor(q)),t=q-i,a=seals[i],b=seals[i+1];
      set(a[4]+(b[4]-a[4])*t,[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],[a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t],[[84,3],[100,-3]],-57,-115);
    }else if(k==='s2')set(-9+Math.sin(n*.3)*2,[27,-35],[145,-21],[[79,3],[104,-5]],-57,-118);
    else if(k==='s3'){if(n<41)set(-11,[36,-38],[150,-22],[[75,8],[111,-9]],-55,-117);else set(12,[12,-38],[159,-14],[[80,6],[106,-5]],-56,-115);}
    else if(k==='s4'){if(n<15)set(-5,[37,-25],[131,18],[[80,5],[106,-5]],-58,-115);else set(9,[18,-30],[146,27],[[74,8],[114,-9]],-54,-112);}
    else if(k==='s5'){if(n<26)set(-12,[35,-27],[123,-3],[[80,5],[106,-5]],-57,-118);else set(-2,[13,-43],[154,14],[[83,1],[99,-1]],-57,-116);}
    else if(k==='def')set(-8,[19,-44],[151,37],[[78,3],[106,-7]],-56,-116);
    else if(k==='ult'){if(n<45)set(-10,[29,-44],[149,-34],[[76,8],[111,-9]],-52,-116);else if(n<82)set(-7,[14,-56],[161,-45],[[73,10],[113,-10]],-50,-115);else set(17,[15,44],[151,30],[[73,14],[114,-12]],-52,-111);}
  }
  window.applyCharacterIdentityPose=pose;

  function drawSusanoo(f){
    if(typeof ctx==='undefined'||!f||f.id!=='itachi'||f.state==='DEFEAT')return;
    const k=f.moveKey||'',n=f.moveFrame||0,cine=Q.cinema&&Q.cinema.owner===f;
    const heavy=f.state==='ATTACK'&&k==='heavy'&&n>=5&&n<=44;
    const mag=f.state==='ATTACK'&&k==='s3'&&n>=15&&n<=67;
    const ult=f.state==='ATTACK'&&k==='ult'||!!cine&&Q.cinema.kind==='ult';
    if(!heavy&&!mag&&!ult)return;
    const d=f.facing||1,full=ult,phase=Q.cinema&&Q.cinema.kind==='ult'?Q.cinema.frame:n;
    const sc=full?1.28:1;
    ctx.save();ctx.translate(f.x,f.y-(full?214:150));ctx.scale(d*sc,sc);
    const pulse=.84+Math.sin((f.animT||0)*.13)*.06;
    ctx.globalAlpha=pulse*(full?.92:.77);
    const armor=ctx.createLinearGradient(-100,-190,100,115);
    armor.addColorStop(0,'#ffdaa7');armor.addColorStop(.22,'#d97961');armor.addColorStop(.55,'#9e3947');armor.addColorStop(1,'#3c1024');
    const edge='#ffbf9a';
    ctx.save();ctx.globalAlpha*=.2;ctx.fillStyle='#ed4c55';ctx.beginPath();ctx.ellipse(0,146,104,17,0,0,Math.PI*2);ctx.fill();ctx.restore();
    // Rib cage silhouette, kept behind the real fighter.
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.fillStyle='rgba(25,5,18,.72)';
    ctx.beginPath();ctx.moveTo(-30,-116);ctx.quadraticCurveTo(-59,-92,-43,-50);ctx.lineTo(-27,-12);ctx.lineTo(27,-12);ctx.lineTo(43,-50);ctx.quadraticCurveTo(59,-92,30,-116);ctx.closePath();ctx.fill();ctx.stroke();
    for(let i=0;i<5;i++){const y=-100+i*18;ctx.beginPath();ctx.moveTo(-31+(i%2)*3,y);ctx.quadraticCurveTo(0,y+17,31-(i%2)*3,y);ctx.stroke();}
    // Susanoo torso and shoulder plates.
    ctx.fillStyle=armor;ctx.strokeStyle=edge;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(-35,-138);ctx.lineTo(-55,-110);ctx.lineTo(-42,-57);ctx.lineTo(-27,-28);ctx.lineTo(27,-28);ctx.lineTo(42,-57);ctx.lineTo(55,-110);ctx.lineTo(35,-138);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-31,-132);ctx.quadraticCurveTo(-70,-156,-92,-124);ctx.lineTo(-111,-82);ctx.lineTo(-82,-59);ctx.lineTo(-43,-82);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(31,-132);ctx.quadraticCurveTo(70,-156,92,-124);ctx.lineTo(111,-82);ctx.lineTo(82,-59);ctx.lineTo(43,-82);ctx.closePath();ctx.fill();ctx.stroke();
    // Helmet, brow and eyes.
    ctx.beginPath();ctx.moveTo(-25,-145);ctx.lineTo(-19,-174);ctx.lineTo(-7,-158);ctx.lineTo(0,-190);ctx.lineTo(8,-158);ctx.lineTo(21,-174);ctx.lineTo(27,-145);ctx.lineTo(18,-124);ctx.lineTo(0,-113);ctx.lineTo(-18,-124);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#2b0617';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-17,-139);ctx.lineTo(-4,-133);ctx.lineTo(-10,-123);ctx.moveTo(17,-139);ctx.lineTo(4,-133);ctx.lineTo(10,-123);ctx.stroke();
    ctx.strokeStyle='#fff0c9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-14,-121);ctx.lineTo(0,-129);ctx.lineTo(14,-121);ctx.stroke();
    // Left shield arm.
    ctx.strokeStyle=edge;ctx.lineWidth=4;ctx.fillStyle=armor;
    ctx.beginPath();ctx.moveTo(-48,-108);ctx.lineTo(-78,-88);ctx.lineTo(-96,-45);ctx.lineTo(-75,-35);ctx.lineTo(-49,-72);ctx.closePath();ctx.fill();ctx.stroke();
    // Right arm changes pose during the heavy slam and sword sequence.
    let handX=100,handY=-75;
    if(heavy){
      const u=clamp((n-16)/11,0,1);handX=60+u*70;handY=-110+u*125;
    }else if(mag){handX=93;handY=n<41?-128:-66;}
    else if(full&&phase<82){handX=124;handY=-35;}
    else if(full&&phase<151){handX=125;handY=-85;}
    else if(full){handX=120;handY=-48;}
    ctx.beginPath();ctx.moveTo(43,-111);ctx.quadraticCurveTo(70,-132,91,-105);ctx.lineTo(handX+6,handY-17);ctx.lineTo(handX+24,handY+7);ctx.lineTo(handX+9,handY+20);ctx.lineTo(handX-14,handY-1);ctx.lineTo(70,-61);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffd5a4';ctx.beginPath();ctx.ellipse(handX+6,handY,17,19,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    if(heavy&&n>=20&&n<=34){
      ctx.strokeStyle='#fff0dc';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(handX+6,handY-3);ctx.lineTo(handX+6,handY+42);ctx.stroke();
    }
    if(mag){
      for(let i=0;i<3;i++){
        const bx=83+i*13,by=-112+Math.sin(i*1.8+n*.16)*8;
        ctx.save();ctx.translate(bx,by);ctx.rotate(n*.09+i*.55);ctx.fillStyle='#ffd5a5';ctx.strokeStyle='#fff0d2';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(0,-11);ctx.bezierCurveTo(14,-7,13,8,0,12);ctx.bezierCurveTo(-7,7,-5,2,1,0);ctx.bezierCurveTo(6,-3,5,-7,0,-11);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
      }
    }
    if(full){
      // Full-form lower armor and skirt plates create a readable, much larger silhouette.
      ctx.fillStyle=armor;ctx.strokeStyle=edge;ctx.lineWidth=3.4;
      ctx.beginPath();ctx.moveTo(-28,-29);ctx.lineTo(-48,8);ctx.lineTo(-40,61);ctx.lineTo(-14,61);ctx.lineTo(-6,11);ctx.lineTo(0,-19);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(28,-29);ctx.lineTo(48,8);ctx.lineTo(40,61);ctx.lineTo(14,61);ctx.lineTo(6,11);ctx.lineTo(0,-19);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle='#ffe5c6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-42,18);ctx.lineTo(-13,25);ctx.moveTo(42,18);ctx.lineTo(13,25);ctx.stroke();
    }
    ctx.restore();
  }
  if(typeof baseDrawFighter==='function'){
    window.drawFighter=function(f){
      if(f&&f.id==='itachi'){
        drawSusanoo(f);
        if(f.state==='VICTORY'&&(f.itachiVictoryFrames||0)>132)return;
      }
      return baseDrawFighter.apply(this,arguments);
    };
  }

  function worldPoint(x,y){
    const z=typeof cam!=='undefined'&&Number.isFinite(cam.zoom)?cam.zoom:1;
    const cx=typeof cam!=='undefined'&&Number.isFinite(cam.x)?cam.x:640;
    const cy=typeof cam!=='undefined'&&Number.isFinite(cam.y)?cam.y:360;
    return {x:640+((G&&G.shakeX)||0)+(x-cx)*z,y:360+((G&&G.shakeY)||0)+(y-cy)*z,s:z};
  }
  const stage=document.createElementNS('http://www.w3.org/2000/svg','svg');
  stage.setAttribute('id','jffItachiRebootStage');stage.setAttribute('viewBox','0 0 1280 720');stage.setAttribute('preserveAspectRatio','none');stage.setAttribute('aria-hidden','true');
  stage.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:5;pointer-events:none;overflow:hidden;display:block';
  const wrap=document.getElementById('wrap');if(wrap)wrap.appendChild(stage);
  function shotSvg(q){
    const p=worldPoint(q.x,q.y),s=p.s;
    if(q.kind==='fireball')return '<g transform="translate('+p.x+' '+p.y+') scale('+s+')"><ellipse rx="'+(q.r*1.3)+'" ry="'+(q.r*.88)+'" fill="url(#itRebootFire)" opacity=".9"/><ellipse rx="'+(q.r*.72)+'" ry="'+(q.r*.58)+'" fill="#ff632f"/><ellipse rx="'+(q.r*.32)+'" ry="'+(q.r*.26)+'" fill="#fff5d8"/><path d="M '+(-q.r*1.5)+' -4 Q '+(-q.r*.5)+' -20 '+(-q.r*.8)+' -'+q.r+' M '+(-q.r*1.4)+' 9 Q '+(-q.r*.2)+' 27 '+(-q.r*.7)+' '+(q.r*.8)+'" stroke="#ff9a4d" stroke-width="4" fill="none"/></g>';
    if(q.kind==='magatama')return '<g transform="translate('+p.x+' '+p.y+') rotate('+(q.rot*57.3)+') scale('+s+')"><ellipse rx="16" ry="25" fill="none" stroke="#ef655f" stroke-width="2"/><path d="M 0 -19 C 24 -14 19 16 0 20 C -9 11 -7 4 1 0 C 8 -4 7 -12 0 -19 Z" fill="#ffd29c" stroke="#fff0ce" stroke-width="1.7"/><circle cy="-4" r="3.5" fill="#8b1530"/></g>';
    return '<g transform="translate('+p.x+' '+p.y+') rotate('+(q.rot*57.3)+') scale('+s+')"><path d="M -54 0 Q -35 -12 -18 0" fill="none" stroke="#a96bff" stroke-width="2.8" stroke-dasharray="4 5" opacity=".95"/><path d="M 0 -22 L 5 -5 L 22 0 L 5 5 L 0 22 L -5 5 L -22 0 L -5 -5 Z" fill="#dce0e8" stroke="#fff4e8" stroke-width="1.8"/><circle r="4" fill="#702038"/><path d="M -26 0 L -40 -7 M -26 0 L -40 7 M -13 -15 L -5 -8 L -2 -18 M 13 15 L 5 8 L 2 18" stroke="#a96bff" stroke-width="2"/><g transform="translate(15 -9) rotate(22)"><rect x="-4" y="-6" width="8" height="12" rx="1" fill="#c72c46" stroke="#ffe7ed" stroke-width="1"/><path d="M -2 -3 L 2 3 M 2 -3 L -2 3" stroke="#ffe7ed" stroke-width=".8"/></g><circle cx="-31" cy="10" r="1.8" fill="#d3a3ff"/><circle cx="28" cy="-8" r="1.4" fill="#d3a3ff"/></g>';
  }
  function cinematicSvg(c){
    const n=c.frame,kind=c.kind,o=c.target,owner=c.owner;
    let s='';
    if(kind==='tsukuyomi'){
      const phase=n<20?1:(n<86?2:(n<120?3:4));
      const blink=n%13<2?.18:0;
      const zoom=phase===1?1.06+Math.sin(n*.16)*.025:(phase===2?1.10+Math.sin(n*.22)*.008:(phase===3?1.07:1.015));
      const panX=phase===2?Math.sin(n*.055)*16:(phase===3?28:0),panY=phase===2?Math.cos(n*.045)*10:0;
      const cameraTransform='translate('+(640-panX)+' '+(360-panY)+') scale('+zoom+') translate(-640 -360)';
      s+='<g transform="'+cameraTransform+'"><rect width="1280" height="720" fill="#080710" opacity=".84"/><rect width="1280" height="720" fill="#7c0c2c" opacity="'+(.10+Math.sin(n*.14)*.035)+'"/>';
      s+='<circle cx="'+(995+Math.sin(n*.03)*12)+'" cy="155" r="112" fill="url(#itRebootMoon)" stroke="#ff6d82" stroke-width="3"/><circle cx="995" cy="155" r="126" fill="none" stroke="#e84761" stroke-width="1.5" stroke-dasharray="8 13"/>';
      s+='<path d="M 0 515 Q 210 455 405 520 T 820 505 T 1280 490 L 1280 720 L 0 720 Z" fill="#05050b" opacity=".82"/>';
      if(phase===1){
        s+='<g transform="translate(640 345)"><ellipse rx="165" ry="202" fill="#13101a" stroke="#d1284c" stroke-width="3"/><path d="M -90 0 Q -60 -98 0 -96 Q 60 -98 90 0 Q 50 68 0 83 Q -50 68 -90 0 Z" fill="#09060c" stroke="#b92a4e" stroke-width="3"/>';
        s+='<g fill="#fb2d57"><ellipse cx="-44" cy="-7" rx="20" ry="8"/><ellipse cx="44" cy="-7" rx="20" ry="8"/></g><circle cx="-44" cy="-7" r="4" fill="#0a0610"/><circle cx="44" cy="-7" r="4" fill="#0a0610"/><path d="M -30 -7 L -17 -17 L -11 -2 M 30 -7 L 17 -17 L 11 -2" fill="none" stroke="#f9c4d0" stroke-width="2"/></g>';
        s+='<text x="640" y="595" fill="#ff6680" font-size="25" font-family="monospace" letter-spacing="9" text-anchor="middle">POV 01 // SHARINGAN</text>';
      }else if(phase===2){
        const tx=o?610:700;
        s+='<g transform="translate('+tx+' 383)" fill="#08070b" stroke="#9d1d3a" stroke-width="3"><path d="M -9 -118 Q -46 -112 -44 -72 L -58 30 L -29 44 L -18 -2 L 18 -2 L 29 44 L 58 30 L 44 -72 Q 46 -112 9 -118 Z"/><circle cy="-142" r="22" fill="#0b0810"/><path d="M -5 -118 L -5 -32 M 5 -118 L 5 -32" stroke="#5d102b" stroke-width="2"/></g>';
        s+='<path d="M 80 110 L 1190 590 M 60 600 L 1180 95" stroke="#dc3154" stroke-width="2" opacity=".34"/><text x="640" y="626" fill="#fa5876" font-size="24" font-family="monospace" letter-spacing="7" text-anchor="middle">POV 02 // PERCEPTION DISTORTED</text>';
      }else if(phase===3){
        s+='<g transform="translate(855 370)"><path d="M -45 164 L -31 30 L -18 -10 L -41 -50 L -22 -83 L 13 -85 L 39 -51 L 23 -12 L 40 32 L 53 164 Z" fill="#08070e" stroke="#84213a" stroke-width="3"/><circle cx="0" cy="-111" r="32" fill="#09070d" stroke="#c4274a" stroke-width="2"/><path d="M -22 -112 L -6 -105 L 4 -114 L 18 -107" stroke="#f23f61" stroke-width="3" fill="none"/><path d="M -24 -79 L 24 -79" stroke="#e43658" stroke-width="3"/></g>';
        s+='<path d="M 215 214 L 1070 487 M 250 500 L 1010 205" stroke="#ffdae0" stroke-width="3" opacity=".74"/><path d="M 285 220 L 1030 460 M 300 480 L 990 230" stroke="#f12c57" stroke-width="7" opacity=".58"/><text x="640" y="626" fill="#fa5876" font-size="24" font-family="monospace" letter-spacing="7" text-anchor="middle">POV 03 // ITACHI OWNS THIS WORLD</text>';
      }else{
        s+='<circle cx="640" cy="360" r="'+(90+n*.5)+'" fill="none" stroke="#e93658" stroke-width="3" opacity=".6"/><text x="640" y="370" fill="#fff1f4" font-size="30" font-family="monospace" letter-spacing="8" text-anchor="middle">GENJUTSU RELEASE</text>';
      }
      if(blink)s+='<rect width="1280" height="720" fill="#ffeef2" opacity="'+blink+'"/>';
      s+='<rect x="0" y="0" width="1280" height="36" fill="#05050a" opacity=".92"/><rect x="0" y="684" width="1280" height="36" fill="#05050a" opacity=".92"/></g></g>';
    }else{
      const rot=n*1.8,phase=n<46?1:(n<82?2:(n<151?3:4));
      const zoom=phase===1?1.02+n*.0009:(phase===2?1.09+Math.sin(n*.13)*.012:(phase===3?1.13+Math.sin(n*.31)*.018:1.02));
      const panX=phase===3?Math.sin(n*.045)*22:Math.sin(n*.025)*6,panY=phase===1?-4:phase===3?Math.cos(n*.04)*12:0;
      const cameraTransform='translate('+(640-panX)+' '+(360-panY)+') scale('+zoom+') translate(-640 -360)';
      s+='<g transform="'+cameraTransform+'"><rect width="1280" height="720" fill="#05040a" opacity=".78"/><rect width="1280" height="720" fill="url(#itRebootUltVignette)" opacity=".64"/>';
      s+='<circle cx="640" cy="355" r="'+(140+n*.7)+'" fill="none" stroke="#d34d4d" stroke-width="2" opacity=".42" transform="rotate('+rot+' 640 355)"/><circle cx="640" cy="355" r="'+(180+n*.45)+'" fill="none" stroke="#ffc391" stroke-width="1.5" stroke-dasharray="6 15" transform="rotate('+(-rot)+' 640 355)"/>';
      s+='<g transform="translate(630 386) scale('+(phase===1?.75:(phase===2?1.05:1.18))+')"><path d="M -60 -95 Q -95 -132 -128 -94 L -150 -40 L -111 -18 L -64 -51 M 60 -95 Q 95 -132 128 -94 L 150 -40 L 111 -18 L 64 -51" fill="#5d1b2b" stroke="#ee8b75" stroke-width="5"/><path d="M -45 -118 L -30 -170 L -10 -145 L 0 -205 L 15 -146 L 35 -174 L 48 -118 L 31 -82 L 0 -70 L -31 -82 Z" fill="#a64c4b" stroke="#ffd2a0" stroke-width="4"/><path d="M -65 -50 Q 0 -90 65 -50 L 52 55 L 20 97 L 0 78 L -20 97 L -52 55 Z" fill="#7c2939" stroke="#f6a27d" stroke-width="4"/><path d="M -48 -21 Q 0 9 48 -21 M -41 5 Q 0 35 41 5 M -34 30 Q 0 57 34 30" fill="none" stroke="#ffd0aa" stroke-width="4"/></g>';
      if(phase===2){
        s+='<g transform="translate(477 315) rotate(-12)"><ellipse cx="0" cy="4" rx="58" ry="83" fill="url(#itRebootPrism)" stroke="#fff0d4" stroke-width="5"/><ellipse cx="0" cy="4" rx="43" ry="66" fill="none" stroke="#ffffff" stroke-width="2.5" opacity=".9"/><path d="M -40 -40 L 0 -70 L 38 -39 L 20 9 L 0 52 L -22 8 Z" fill="#fff0cf" fill-opacity=".25" stroke="#fff7dc" stroke-width="2"/><path d="M -47 0 L 45 0 M -28 -56 L 29 58 M 27 -56 L -29 58" stroke="#e6fbff" stroke-width="2" opacity=".82"/><path d="M -7 -82 L 7 -82 L 10 76 L -10 76 Z" fill="#cb594d" stroke="#ffe0b1" stroke-width="2.5"/></g>';
      }else if(phase===3){
        s+='<g transform="translate(480 318) rotate('+(n<116?-23:12)+')"><path d="M -9 52 L 8 43 L 27 80 L 12 92 Z" fill="#62202d" stroke="#e6a078" stroke-width="3"/><path d="M -3 49 L 21 65" stroke="#fff0ca" stroke-width="3"/><path d="M 4 40 L 26 26 L 260 -86 L 246 -47 L 36 72 L 13 61 Z" fill="#ffb86d" stroke="#fff0cf" stroke-width="4"/><path d="M 30 47 L 246 -55 L 251 -42 L 37 62 Z" fill="#f05a3f" opacity=".8"/><path d="M 43 38 L 245 -50" stroke="#fff6dc" stroke-width="2.5"/><path d="M 40 57 Q 95 30 130 10 T 233 -39" stroke="#ff7049" stroke-width="9" fill="none" opacity=".62"/></g>';
      }
      if(phase===3&&n>96){
        s+='<path d="M 230 380 L 1100 250 L 1080 290 L 215 420 Z" fill="#ffdda8" opacity="'+(.32+Math.sin(n*.5)*.18)+'"/><path d="M 250 408 L 1090 280" stroke="#fff3da" stroke-width="3"/>';
      }
      if(phase===4){
        for(let i=0;i<8;i++){const a=i*Math.PI/4+n*.025,x=640+Math.cos(a)*105,y=380+Math.sin(a)*82;s+='<text x="'+x+'" y="'+y+'" fill="#ffc9a2" font-size="22" opacity=".9" text-anchor="middle" transform="rotate('+(n+i*31)+' '+x+' '+y+')">封</text>';}
      }
      const title=phase===1?'COMPLETE SUSANOO':(phase===2?'YATA MIRROR // ABSOLUTE GUARD':(phase===3?'TOTSUKA BLADE // SEALING STRIKE':'SEALING COMPLETE'));
      if(phase===4)s+='<g transform="translate(900 398)" opacity=".88"><circle r="83" fill="#13050f" stroke="#e63f5e" stroke-width="4"/><circle r="66" fill="none" stroke="#ffc9a2" stroke-width="2" stroke-dasharray="5 8" transform="rotate('+rot+')"/><path d="M -12 -57 L -22 -19 L -35 45 L -13 38 L 0 5 L 12 39 L 35 45 L 22 -19 L 12 -57 Z" fill="#05040a" stroke="#ba354d" stroke-width="3"/><circle cy="-77" r="16" fill="#08050b" stroke="#ba354d" stroke-width="2"/></g>';
      s+='<rect x="0" y="0" width="1280" height="68" fill="#030308" opacity=".82"/><rect x="0" y="652" width="1280" height="68" fill="#030308" opacity=".82"/><text x="640" y="44" fill="#ffe0c4" font-size="22" font-family="monospace" letter-spacing="7" text-anchor="middle">'+title+'</text><text x="640" y="690" fill="#ffbd9c" font-size="15" font-family="monospace" letter-spacing="6" text-anchor="middle">UCHIHA // MANGEKYO FINAL ART</text></g></g>';
    }
    return s;
  }
  function renderStage(){
    if(!stage)return;
    if(typeof G==='undefined'||G.mode==='menu'){stage.innerHTML='';return;}
    const defs='<defs><radialGradient id="itRebootMoon"><stop stop-color="#ff9cac"/><stop offset=".42" stop-color="#ba173d"/><stop offset="1" stop-color="#320916"/></radialGradient><radialGradient id="itRebootFire"><stop stop-color="#fff9d9"/><stop offset=".23" stop-color="#ffc16b"/><stop offset=".55" stop-color="#ef4931"/><stop offset=".84" stop-color="#5b101e"/><stop offset="1" stop-color="#17050c" stop-opacity="0"/></radialGradient><linearGradient id="itRebootPrism" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f2d4ff"/><stop offset=".18" stop-color="#8de7ff"/><stop offset=".38" stop-color="#f8efba"/><stop offset=".57" stop-color="#f7a4c7"/><stop offset=".78" stop-color="#b4f4d0"/><stop offset="1" stop-color="#a1aaff"/></linearGradient><radialGradient id="itRebootUltVignette"><stop stop-color="#bd493c" stop-opacity=".06"/><stop offset=".72" stop-color="#250711" stop-opacity=".22"/><stop offset="1" stop-color="#030208" stop-opacity=".92"/></radialGradient></defs>';
    let body='';
    for(const q of Q.shots)body+=shotSvg(q);
    const c=Q.clone;
    if(c){const p=worldPoint(c.x,c.y),alpha=clamp(1-c.t/c.d,0,1);body+='<g opacity="'+(.72*alpha)+'" transform="translate('+p.x+' '+p.y+') scale('+p.s*(c.face||1)+' '+p.s+')"><path d="M -24 -103 L -37 -60 L -47 -8 L -20 1 L 0 -15 L 24 0 L 49 -12 L 36 -66 L 21 -104 Z" fill="#0b0910" stroke="#a51c3e" stroke-width="2.5" stroke-dasharray="5 4"/><ellipse cy="-123" rx="23" ry="27" fill="#08070d" stroke="#d62b4b" stroke-width="2"/><path d="M -21 -127 L -25 -154 L -12 -145 L -5 -161 L 8 -145 L 21 -155 L 22 -127 Z" fill="#030307"/><path d="M -13 -123 L -5 -120 M 6 -120 L 14 -123" stroke="#ff506a" stroke-width="2.5"/></g>';}
    for(const b of Q.burns){
      if(!b.target||b.target.hp<=0)continue;
      const p=worldPoint(b.target.x,b.target.y-80);
      if(b.kind==='amaterasu'){
        body+='<g transform="translate('+p.x+' '+p.y+') scale('+p.s+')"><ellipse rx="42" ry="57" fill="none" stroke="#07070b" stroke-width="12" opacity=".8"/><path d="M -35 25 Q -52 -6 -24 -36 L -13 -18 L -5 -57 L 7 -20 L 20 -42 Q 39 -4 24 23 Q 6 41 -8 23 Q -22 40 -35 25 Z" fill="#08070b" stroke="#a22243" stroke-width="2"/><path d="M -24 28 L -7 4 L 2 25 L 19 -10" fill="none" stroke="#4d1530" stroke-width="3"/></g>';
      }else{
        body+='<g transform="translate('+p.x+' '+p.y+') scale('+p.s+')"><path d="M -19 20 Q -28 -4 -11 -22 L -4 -10 L 3 -36 L 10 -10 L 18 -20 Q 29 4 13 21 Q -2 31 -19 20 Z" fill="#ef542f" stroke="#ffc16b" stroke-width="2"/><circle cy="2" r="8" fill="#fff0bc"/></g>';
      }
    }
    if(Q.cinema)body+=cinematicSvg(Q.cinema);
    for(const f of fighters()){
      if(f&&f.id==='itachi'&&f.itachiTauntFrames>0){const p=worldPoint(f.x,f.y-176);body+='<text x="'+p.x+'" y="'+p.y+'" fill="#ffb7c5" font-size="18" font-family="monospace" text-anchor="middle">"YOU ARE TOO WEAK."</text>';}
    }
    stage.innerHTML=defs+body;
  }
  if(typeof baseRender==='function'){
    window.render=function(){const r=baseRender.apply(this,arguments);if(!fixedStepHooked)updateTick();renderStage();return r;};
  }

  function taunt(f){
    if(!f||f.id!=='itachi'||Q.cinema||f.move||!['IDLE','WALK'].includes(f.state)||(f.itachiTauntCd||0)>Q.tick)return;
    f.itachiTauntFrames=58;f.itachiTauntCd=Q.tick+300;
    effect('emote',f.x,f.y-110,42);effect('crows',f.x-f.facing*12,f.y-82,26);
    if(typeof SFX!=='undefined'&&SFX.ui)SFX.ui();
  }
  addEventListener('keydown',function(e){
    if(typeof G==='undefined'||G.mode==='menu')return;
    const p1=fighters()[0],p2=fighters()[1];
    // Itachi's blueprint reserves R for the iconic two-finger taunt.
    // Suppress the engine's normal R/def input for Itachi only.
    if(e.code==='KeyR'&&p1&&p1.id==='itachi'&&!p1.ai){
      e.preventDefault();e.stopImmediatePropagation();
      if(!e.repeat)taunt(p1);
      return;
    }
    // X is Itachi P1's Yata Mirror command. Other fighters retain their X controls.
    if(e.code==='KeyX'&&p1&&p1.id==='itachi'&&!p1.ai){
      e.preventDefault();e.stopImmediatePropagation();
      if(!e.repeat&&!Q.cinema&&!p1.move&&['IDLE','WALK'].includes(p1.state)&&typeof window.startMove==='function')window.startMove(p1,'def');
      return;
    }
    if(e.code==='NumpadSubtract'&&p2&&p2.id==='itachi'&&!p2.ai){
      e.preventDefault();e.stopImmediatePropagation();
      if(!e.repeat)taunt(p2);
      return;
    }
  },true);

  console.info('[JFF Itachi] Move set reboot active: Crow Flicker, Rib-Cage Smash, Great Fireball, Tsukuyomi Counter, Yasaka, Clone Explosion, Amaterasu, Yata Mirror and Complete Susanoo.');
})();