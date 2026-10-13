/* Itachi Outsider Combat Overhaul v1.0
   Native hitboxes/collision state are retained. All Itachi-authored attacks use their own
   collision and SVG effects, deliberately bypassing the shared Jujutsu VFX helper calls. */
(function(){
  'use strict';
  if(window.__JFF_ITACHI_COMBAT_V1__)return;
  window.__JFF_ITACHI_COMBAT_V1__=true;
  const sys=window.JFF_OUTSIDER||(window.JFF_OUTSIDER={tick:0,fx:[],shots:[],clone:null,burn:null,burns:[],moon:null,sealing:null});
  if(!Array.isArray(sys.burns))sys.burns=sys.burn?[sys.burn]:[];
  const moves={
    light:{name:'Crow Flicker Dance',kind:'outsider_light',startup:4,active:62,recovery:8,damage:8,hitstun:17,blockstun:10,kbx:4,kby:-1,hitbox:{x:18,y:-95,w:90,h:58},cost:0,cd:0,meter:4},
    heavy:{name:'Susanoo Rib-Cage Smash',kind:'outsider_heavy',startup:15,active:12,recovery:15,damage:30,hitstun:32,blockstun:20,kbx:10,kby:-8,hitbox:{x:0,y:-100,w:200,h:120},cost:0,cd:0,meter:10,armorBreak:true},
    air:{name:'Crow Dive',kind:'outsider_air',startup:6,active:12,recovery:14,damage:12,hitstun:22,blockstun:12,kbx:6,kby:-3,hitbox:{x:24,y:-75,w:92,h:52},cost:0,cd:0,meter:5},
    s1:{name:'Grand Fireball Technique',kind:'outsider_fireball',startup:3,active:90,recovery:16,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:16,cd:220,meter:7},
    s2:{name:'Mangekyo Genjutsu: Tsukuyomi',kind:'outsider_counter',startup:3,active:42,recovery:15,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:22,cd:420,meter:10},
    s3:{name:'Susanoo: Yasaka Magatama Barrage',kind:'outsider_magatama',startup:17,active:4,recovery:23,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:26,cd:340,meter:10},
    s4:{name:'Shadow Clone Great Explosion',kind:'outsider_clone',startup:10,active:45,recovery:20,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:22,cd:380,meter:9},
    s5:{name:'Amaterasu Target Lock',kind:'outsider_amaterasu',startup:19,active:2,recovery:24,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:32,cd:540,meter:12},
    def:{name:'Akatsuki Cloak Adjustment',kind:'outsider_emote',startup:1,active:1,recovery:8,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:0,cd:0,meter:0},
    ult:{name:'Susanoo: Totsuka no Tsurugi & Yata Mirror',kind:'outsider_ult',startup:36,active:3,recovery:261,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:0,cd:0,meter:0,invuln:36}
  };
  if(window.CHARS&&CHARS.itachi){CHARS.itachi.moves=moves;CHARS.itachi.hp=205;CHARS.itachi.walk=3.65;}
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const sign=v=>v<0?-1:(v>0?1:0);
  const near=(a,b,r)=>Math.abs(a.x-b.x)<=r&&Math.abs(a.y-b.y)<=130;
  const fx=(t,x,y,d,data)=>window.JFF_OUTSIDER_FX?window.JFF_OUTSIDER_FX(t,x,y,d,data):null;
  function fighters(){return typeof G!=='undefined'?(G.fighters||[]):[];}
  function keyFor(f,skill){
    const p=fighters().indexOf(f)===0;
    const map=p?{s1:'Digit3',s2:'Digit4',s3:'Digit5',s4:'Digit6',s5:'Digit7'}:
      {s1:'Numpad3',s2:'Numpad4',s3:'Numpad5',s4:'Numpad6',s5:'Numpad9'};
    return map[skill]||'';
  }
  function damageOnly(attacker,defender,amount,stun){
    if(!defender||defender.hp<=0)return;
    defender.hp=Math.max(0,defender.hp-Math.max(1,Math.round(amount)));
    defender.hitstun=Math.max(defender.hitstun||0,stun||12);
    defender.state='HITSTUN';defender.stateFrame=0;defender.move=null;defender.moveKey=null;
    defender.vx=(attacker.x>defender.x?-1:1)*4.2;defender.vy=-1.6;
    defender.comboCount=(defender.comboCount||0)+1;defender.comboTimer=95;
    attacker.comboDamage=(attacker.comboDamage||0)+amount;
    defender.hitFlash=4;
  }
  function resolveItachiHit(attacker,defender,mv,hx,hy){
    if(!attacker||!defender||defender.hp<=0||defender.invuln>0&&!mv.armorBreak)return 'whiff';
    // Existing defensive rules still apply, but the Outsider feedback is all SVG-native.
    if((defender.id==='gojo'&&defender.infinity>0||defender.id==='young_gojo'&&defender.youngInfinity>0)&&!mv.armorBreak){
      fx('reflect',defender.x,defender.y-82,26);attacker.vx=-attacker.facing*2.2;return 'infinity';
    }
    const dirToAtt=sign(attacker.x-defender.x)||1;
    const facing=defender.facing===dirToAtt;
    const blocking=typeof canBlockAgainst==='function'&&canBlockAgainst(defender)&&facing&&!mv.armorBreak;
    if(blocking){
      const chip=Math.max(1,Math.round((mv.damage||1)*.10));
      defender.hp=Math.max(1,defender.hp-chip);defender.blockstun=Math.max(defender.blockstun||0,mv.blockstun||10);
      defender.state='BLOCKSTUN';defender.stateFrame=0;defender.vx=-dirToAtt*1.8;
      defender.meter=Math.min(defender.maxMeter||100,(defender.meter||0)+(mv.meter||3)*.5);
      fx('shock',hx,hy,16);return 'block';
    }
    if(defender.parry>0&&facing){defender.parry=0;defender.state='IDLE';defender.stateFrame=0;attacker.moveFrame=(attacker.moveFrame||0)+7;fx('reflect',hx,hy,24);return 'parry';}
    if(defender.guardArmor>0&&!mv.armorBreak){defender.guardArmor=0;defender.guardCounter=20;fx('reflect',hx,hy,24);return 'armor';}
    const scale=Math.max(.4,1-.05*(defender.comboCount||0));
    let dmg=Math.max(1,Math.round((mv.damage||1)*scale));
    defender.hp=Math.max(0,defender.hp-dmg);
    defender.hitstun=Math.max(1,mv.hitstun||16);defender.state='HITSTUN';defender.stateFrame=0;
    defender.move=null;defender.moveKey=null;
    defender.vx=(mv.kbx||3)*(attacker.x>defender.x?-1:1)*.9;
    if(mv.kby){defender.vy=mv.kby;if(mv.kby<-3)defender.onGround=false;}
    defender.comboCount=(defender.comboCount||0)+1;defender.comboTimer=95;
    attacker.comboDamage=(attacker.comboDamage||0)+dmg;
    attacker.meter=Math.min(attacker.maxMeter||100,(attacker.meter||0)+(mv.meter||4));
    defender.meter=Math.min(defender.maxMeter||100,(defender.meter||0)+dmg*.25);
    attacker.energy=Math.min(attacker.maxEnergy||100,(attacker.energy||0)+2);
    defender.hitFlash=5;
    fx('slash',hx,hy,20);fx('shock',hx,hy,18);
    return 'hit';
  }
  const baseResolve=window.resolveHit;
  if(typeof baseResolve==='function'){
    window.resolveHit=function(attacker,defender,mv,hx,hy){
      if(attacker&&attacker.id==='itachi')return resolveItachiHit(attacker,defender,mv||{},hx==null?attacker.x:hx,hy==null?attacker.y-80:hy);
      // Tsukuyomi is a true counter: only a real incoming, unblocked hit triggers it.
      if(defender&&defender.id==='itachi'&&defender.itachiCounterUntil>sys.tick&&attacker&&attacker!==defender){
        const facing=defender.facing===(sign(attacker.x-defender.x)||1);
        const isBlocking=typeof canBlockAgainst==='function'&&canBlockAgainst(defender)&&facing;
        if(!isBlocking&&defender.invuln<=0){
          defender.itachiCounterUntil=0;
          fx('moon',attacker.x,attacker.y-110,30);
          sys.moon={target:attacker,t:0,d:180};
          sys.genjutsu={target:attacker,t:0,d:180,next:24,owner:defender};
          attacker.move=null;attacker.moveKey=null;attacker.state='HITSTUN';attacker.stateFrame=0;
          attacker.hitstun=Math.max(attacker.hitstun||0,180);attacker.vx=0;attacker.vy=0;
          damageOnly(defender,attacker,18,180);
          defender.meter=Math.min(defender.maxMeter||100,(defender.meter||0)+10);
          fx('shock',attacker.x,attacker.y-85,38);
          return 'itachi_counter';
        }
      }
      if(defender&&defender.id==='itachi'&&defender.itachiMirrorUntil>sys.tick&&mv&&mv.type==='projectile'){
        fx('reflect',defender.x+defender.facing*36,defender.y-88,24);
        damageOnly(defender,attacker,Math.max(7,(mv.damage||10)*.7),14);
        return 'reflected';
      }
      return baseResolve.apply(this,arguments);
    };
  }
  const baseStart=window.startMove;
  if(typeof baseStart==='function'){
    window.startMove=function(f,key,isBF){
      if(f&&f.id==='itachi'&&key==='def'&&!f.move&&(f.state==='IDLE'||f.state==='WALK')){
        triggerEmote(f,true);return false;
      }
      const ok=baseStart.apply(this,arguments);
      if(ok&&f&&f.id==='itachi'){
        f.itachiHitMarks={};f.itachiCharge=0;f.itachiChargeFired=false;
        f.itachiStartedAt=sys.tick;f.itachiMoveKey=key;
        if(key==='s1'){f.itachiChargeKey=keyFor(f,key);f.itachiChargeStart=sys.tick;}
        if(key==='s2'){f.itachiCounterUntil=sys.tick+45;fx('shock',f.x,f.y-88,20);}
        if(key==='s4'){f.itachiCloneSerial=(f.itachiCloneSerial||0)+1;}
        if(key==='ult'){
          f.itachiMirrorUntil=sys.tick+145;f.itachiAwake=145;f.invuln=Math.max(f.invuln||0,36);
          sys.reflectUntil=sys.tick+145;
          fx('shock',f.x,f.y-90,36);fx('emote',f.x,f.y-92,50);
        }
      }
      return ok;
    };
  }
  function triggerEmote(f,manual){
    if(!f)return;
    f.itachiEmote=88;f.itachiChakraBuff=300;f.itachiIdleFrames=0;f.itachiEmoteCooldown=480;
    fx('emote',f.x,f.y-90,70);
    fx('crows',f.x-f.facing*15,f.y-85,34);
    if(manual&&window.SFX&&SFX.ui)SFX.ui();
  }
  function createShot(owner,kind,x,y,vx,vy,data){
    sys.shots.push({owner:owner,kind:kind,x:x,y:y,vx:vx,vy:vy,r:data.r||20,damage:data.damage||10,stun:data.stun||18,life:data.life||90,curve:data.curve||0,rot:0,hit:false,t:0});
    if(sys.shots.length>28)sys.shots.splice(0,sys.shots.length-28);
  }
  function fireball(f,charge){
    const q=clamp(charge,0,1),o=f.opp;
    const x=f.x+f.facing*55,y=f.y-103;
    createShot(f,'fireball',x,y,(15+q*5)*f.facing,-.25,{r:24+q*48,damage:18+Math.round(q*22),stun:22+Math.round(q*10),life:100});
    fx('fire',x,y,24,{charge:q});fx('shock',x,y,18);
  }
  function fireMagatama(f){
    const spread=[-.2,0,.2];
    for(let i=0;i<spread.length;i++){
      const a=spread[i];
      createShot(f,'magatama',f.x+f.facing*54,f.y-105,(14+Math.max(0,1-Math.abs(a))*3)*f.facing,a*12,{r:20,damage:7,stun:15,life:92,curve:a*.22});
    }
    fx('emote',f.x+f.facing*42,f.y-103,42);
    fx('shock',f.x+f.facing*60,f.y-94,25);
  }
  function cloneBurst(owner,c){
    if(!c||c.triggered)return;
    c.triggered=true;
    const o=owner.opp;
    fx('explosion',c.x,c.y-80,30);fx('shock',c.x,c.y-74,32);fx('crows',c.x,c.y-80,35);
    if(o&&Math.abs(o.x-c.x)<175&&Math.abs(o.y-c.y)<140){
      resolveItachiHit(owner,o,{damage:28,hitstun:35,blockstun:20,kbx:10,kby:-8,hitstop:12,armorBreak:true,meter:8},c.x,c.y-80);
    }
    sys.clone=null;
  }
  function updateShots(){
    for(let i=sys.shots.length-1;i>=0;i--){
      const q=sys.shots[i],o=q.owner&&q.owner.opp;
      q.t++;q.x+=q.vx;q.y+=q.vy;q.vy+=q.curve||0;q.rot+=.2;q.life--;
      if(!q.hit&&o&&o.hp>0&&Math.abs(q.x-o.x)<q.r+27&&Math.abs(q.y-(o.y-84))<q.r+63){
        const res=resolveItachiHit(q.owner,o,{damage:q.damage,hitstun:q.stun,blockstun:12,kbx:7,kby:-3,hitstop:5,meter:3,type:'projectile'},q.x,q.y);
        if(res!=='whiff'&&res!=='parry'&&res!=='armor'){q.hit=true;q.life=0;fx(q.kind==='fireball'?'explosion':'magatama',q.x,q.y,18);}
      }
      if(q.life<=0||q.x< -160||q.x>ARENA_W+160)sys.shots.splice(i,1);
    }
  }
  function updateClone(){
    const c=sys.clone;if(!c)return;
    c.t++;
    const o=c.owner&&c.owner.opp;
    if(!o||o.hp<=0||c.t>c.d){sys.clone=null;return;}
    const dist=Math.abs(o.x-c.x);
    const m=o.move,frame=o.moveFrame||0,hb=m&&m.hitbox;
    const activeAttack=!!(o.state==='ATTACK'&&m&&frame>=(m.startup||0)&&frame<=(m.startup||0)+(m.active||0));
    const localX=(c.x-o.x)*(o.facing||1);
    const reach=hb?(hb.x||0)+(hb.w||0):82;
    const attackY=hb?o.y+(hb.y||-80)+(hb.h||40)*.5:o.y-80;
    const hitClone=activeAttack&&localX>=Math.max(-22,(hb?hb.x||0:-10))&&localX<=reach+14&&Math.abs(attackY-(c.y-80))<100;
    // The clone is a separate hurtbox: merely approaching it does not detonate it.
    if(hitClone)cloneBurst(c.owner,c);
  }
  function updateBurn(){
    // Multiple independent DOTs may coexist without overwriting one another.
    for(let i=sys.burns.length-1;i>=0;i--){
      const b=sys.burns[i],o=b.target;b.t++;
      if(!o||o.hp<=0||b.t>=b.d){sys.burns.splice(i,1);continue;}
      if(b.kind==='amaterasu'&&((Math.abs(o.vx||0)>5.8&&['DASH','SORU','ROLL','DODGE'].includes(o.state))||Math.abs(o.x-b.startX)>245&&b.t<150)){
        fx('shock',o.x,o.y-88,22);sys.burns.splice(i,1);continue;
      }
      if(b.t>=b.next){
        b.next+=30;
        const dot=b.kind==='amaterasu'?6:3;
        o.hp=Math.max(0,o.hp-dot);o.hitFlash=2;
        if(o.hp<=0){o.state='DEFEAT';o.stateFrame=0;}
        fx('explosion',o.x,o.y-70,12);
      }
      b.lastX=o.x;b.lastY=o.y;
    }
    sys.burn=sys.burns[0]||null;
    if(sys.genjutsu){
      const g=sys.genjutsu,o=g.target;g.t++;
      if(!o||o.hp<=0||g.t>=g.d){sys.genjutsu=null;}
      else if(g.t>=g.next){g.next+=30;o.hp=Math.max(1,o.hp-4);o.hitFlash=2;}
    }
  }
  function updatePlayerStates(){
    for(const f of fighters()){
      if(!f||f.id!=='itachi')continue;
      if(f.itachiEmote>0)f.itachiEmote--;
      if(f.itachiChakraBuff>0){f.itachiChakraBuff--;f.energy=Math.min(f.maxEnergy||100,(f.energy||0)+.025);}
      if(f.itachiEmoteCooldown>0)f.itachiEmoteCooldown--;
      if(f.itachiAwake>0)f.itachiAwake--;
      if((f.state==='IDLE'||f.state==='WALK')&&!f.move&&!f.blocking){
        f.itachiIdleFrames=(f.itachiIdleFrames||0)+1;
        if(f.itachiIdleFrames>=180&&(f.itachiEmoteCooldown||0)<=0)triggerEmote(f,false);
      }else{
        f.itachiIdleFrames=0;
      }
      if(f.itachiCounterUntil>0&&f.itachiCounterUntil<=sys.tick)f.itachiCounterUntil=0;
      if(f.itachiMoveKey==='s1'&&f.move&&f.moveKey==='s1'&&!f.itachiChargeFired){
        const code=f.itachiChargeKey||keyFor(f,'s1');
        f.itachiCharge=clamp((sys.tick-(f.itachiChargeStart||sys.tick))/90,0,1);
        const canRelease=!(window.KEY&&KEY[code]);
        if(canRelease||f.itachiCharge>=1){
          fireball(f,f.itachiCharge);
          f.itachiChargeFired=true;f.moveFrame=(f.move.startup||3)+(f.move.active||2)+1;
          f.itachiCharge=0;
        }
      }
    }
    updateShots();updateClone();updateBurn();
  }
  const baseUpdate=window.updateMove;
  if(typeof baseUpdate==='function'){
    window.updateMove=function(f){
      if(!f||f.id!=='itachi')return baseUpdate.apply(this,arguments);
      const m=f.move;
      if(!m){f.state='IDLE';f.moveFrame=0;return;}
      f.moveFrame=(f.moveFrame||0)+1;
      const n=f.moveFrame,k=f.moveKey,o=f.opp,dir=f.facing||1;
      if(k==='light'){
        const marks=f.itachiHitMarks||(f.itachiHitMarks={});
        const phase=n<=9?1:n<=19?2:n<=33?3:n<=48?4:5;
        if(phase===1||phase===2){
          const hitAt=phase===1?6:15;
          if(n===hitAt&&!marks[phase]&&o&&near(f,o,135)){
            marks[phase]=1;
            resolveItachiHit(f,o,{damage:7,hitstun:15,blockstun:9,kbx:4,kby:0,hitstop:4,meter:3},f.x+dir*62,f.y-95);
            fx('slash',f.x+dir*60,f.y-96,16);
          }
        }
        if(n===27&&!marks[3]){
          marks[3]=1;fx('crows',f.x,f.y-85,34);
          if(o&&Math.abs(o.x-f.x)<185&&Math.abs(o.y-f.y)<135){
            const nx=clamp(o.x+dir*72,WALL,ARENA_W-WALL);
            f.x=clamp(nx-dir*44,WALL,ARENA_W-WALL);f.facing=o.x>=f.x?1:-1;
            fx('crows',o.x,o.y-95,28);
            resolveItachiHit(f,o,{damage:11,hitstun:25,blockstun:13,kbx:8,kby:-7,hitstop:7,meter:5},o.x,o.y-82);
          }
        }
        if(n===42&&!marks[4]){
          marks[4]=1;
          for(let i=-1;i<=1;i++)createShot(f,'shuriken',f.x+dir*44,f.y-98,dir*(17-Math.abs(i)*1.5),i*3.8,{r:15,damage:6,stun:16,life:66,curve:i*.045,tagged:true});
          fx('magatama',f.x+dir*55,f.y-101,24);
        }
        if(n===60&&!marks[5]){
          marks[5]=1;
          if(o&&near(f,o,145)){
            resolveItachiHit(f,o,{damage:14,hitstun:28,blockstun:14,kbx:10,kby:-5,hitstop:9,meter:6,armorBreak:true},o.x,o.y-88);
            sys.burns.push({owner:f,target:o,t:0,d:120,next:32,startX:o.x,escapeMeter:0,kind:'fire'});sys.burn=sys.burns[0]||null;
          }
          fx('fire',f.x+dir*68,f.y-87,24);
        }
      }else if(k==='heavy'){
        if(n===5)fx('shock',f.x,f.y-80,22);
        if(n===18&&!f.itachiHitMarks.heavy){
          f.itachiHitMarks.heavy=1;
          fx('shock',f.x+dir*30,f.y-8,34);fx('explosion',f.x+dir*40,f.y-10,25);
          if(o&&Math.abs(o.x-f.x)<235&&Math.abs(o.y-f.y)<155){
            const guarding=typeof canBlockAgainst==='function'&&canBlockAgainst(o)&&o.facing===(sign(f.x-o.x)||1);
            if(guarding){o.blocking=false;o.state='BLOCKSTUN';o.blockstun=Math.max(o.blockstun||0,34);}
            resolveItachiHit(f,o,{damage:guarding?19:30,hitstun:30,blockstun:26,kbx:12,kby:-8,hitstop:12,armorBreak:true,meter:9},o.x,o.y-90);
          }
        }
      }else if(k==='air'){
        if(n===m.startup+2&&!f.itachiHitMarks.air&&o&&near(f,o,150)){
          f.itachiHitMarks.air=1;fx('crows',f.x,f.y-80,25);
          resolveItachiHit(f,o,{damage:13,hitstun:23,blockstun:12,kbx:8,kby:-4,hitstop:7,meter:5},o.x,o.y-80);
        }
      }else if(k==='s1'){
        // Charge timing and release are polled outside updateMove so short taps fire too.
        if(n===4)fx('fire',f.x+dir*30,f.y-110,18,{charge:.1});
      }else if(k==='s2'){
        if(n===3){f.itachiCounterUntil=sys.tick+42;fx('emote',f.x,f.y-92,30);}
        if(n===m.startup+m.active+1&&f.itachiCounterUntil>0)f.itachiCounterUntil=0;
      }else if(k==='s3'){
        if(n===m.startup+1&&!f.itachiHitMarks.mag){f.itachiHitMarks.mag=1;fireMagatama(f);}
      }else if(k==='s4'){
        if(n===m.startup&&!f.itachiHitMarks.clone){
          f.itachiHitMarks.clone=1;
          const oldX=f.x,oldY=f.y;
          sys.clone={owner:f,x:oldX,y:oldY,t:0,d:74,face:dir,triggered:false};
          f.x=clamp(f.x-dir*92,WALL,ARENA_W-WALL);
          fx('crows',oldX,oldY-85,30);fx('shock',f.x,f.y-75,23);
        }
      }else if(k==='s5'){
        if(n===m.startup+1&&!f.itachiHitMarks.ama){
          f.itachiHitMarks.ama=1;
          if(o&&o.hp>0){
            sys.burns=sys.burns.filter(b=>!(b.target===o&&b.kind==='amaterasu'));sys.burns.push({owner:f,target:o,t:0,d:300,next:25,startX:o.x,lastX:o.x,lastY:o.y,escapeMeter:0,kind:'amaterasu'});sys.burn=sys.burns[0]||null;
            fx('moon',o.x,o.y-100,35);fx('shock',o.x,o.y-84,27);
          }
        }
      }else if(k==='ult'){
        if(n===7){f.itachiAwake=300;fx('reflect',f.x+dir*45,f.y-85,28);fx('shock',f.x,f.y-95,28);}
        if(n===m.startup&&!f.itachiHitMarks.ult){
          f.itachiHitMarks.ult=1;
          fx('shock',f.x,f.y-85,38);
          const target=o;
          if(target&&target.hp>0&&Math.abs(target.x-f.x)<300&&Math.abs(target.y-f.y)<190){
            const ko=target.hp<=((target.maxHp||target.hp)*.30);
            fx('slash',target.x,target.y-90,32);
            const dmg=ko?0:Math.min(32,Math.max(1,target.hp-1));
            if(dmg>0)target.hp=Math.max(1,target.hp-dmg);
            target.itachiSealPendingKO=ko;
            target.itachiSealSavedState=target.state;
            target.state='HITSTUN';target.stateFrame=0;target.hitstun=270;
            target.vx=0;target.vy=0;target.move=null;target.moveKey=null;
            target.invuln=Math.max(target.invuln||0,264);
            sys.sealing={target:target,t:0,d:264,ko:ko,owner:f};
            fx('seal',target.x,target.y-75,60);
          }else{
            // A missed finisher still completes its dramatic recovery without trapping the opponent.
            fx('crows',f.x+dir*70,f.y-85,30);
          }
        }
      }
      if(f.move&&f.moveFrame>=(m.startup||0)+(m.active||0)+(m.recovery||0))endMove(f);
    };
  }
  // A short input chord lets Shift + M1 use the Susanoo heavy. Ordinary M2 still works.
  function tryHeavyChord(e){
    const code=e.code;
    let m1Code='',f=null,chord=false;
    if(code==='Digit1'||code==='Numpad1'){
      const shift=!!(window.KEY&&(KEY.ShiftLeft||KEY.ShiftRight));
      if(!shift)return;
      m1Code=code;f=code==='Digit1'?fighters()[0]:fighters()[1];chord=true;
    }else if(code==='ShiftLeft'||code==='ShiftRight'){
      if(window.KEY&&KEY.Digit1){m1Code='Digit1';f=fighters()[0];chord=true;}
      else if(window.KEY&&KEY.Numpad1){m1Code='Numpad1';f=fighters()[1];chord=true;}
    }
    if(!chord||!f||f.id!=='itachi'||f.state==='HITSTUN'||f.state==='BLOCKSTUN'||f.state==='DEFEAT')return;
    if(f.move&&!(f.moveKey==='light'&&(f.moveFrame||0)<=3))return;
    if(f.move&&typeof endMove==='function')endMove(f);
    if(typeof startMove==='function'&&startMove(f,'heavy')){
      if(window.KP)KP[m1Code]=false;
      if(code===m1Code){e.preventDefault();e.stopImmediatePropagation();}
    }
  }
  addEventListener('keydown',e=>{if(!e.repeat)tryHeavyChord(e);},true);
  // Update Outsider-owned shots, counter windows, DOT and idle emotes on the render cadence.
  const baseRender=window.render;
  if(typeof baseRender==='function'){
    window.render=function(){
      baseRender.apply(this,arguments);
      if(typeof G!=='undefined'&&G.mode!=='menu'&&!G.paused){
        // Monotonic simulation-frame clock for charge, counter windows and cinematic timers.
        sys.tick++;
        updatePlayerStates();
        if(sys.moon){sys.moon.t=(sys.moon.t||0)+1;if(sys.moon.t>=sys.moon.d)sys.moon=null;}
        if(sys.sealing){
          sys.sealing.t=(sys.sealing.t||0)+1;
          if(sys.sealing.t>=sys.sealing.d){
            const seal=sys.sealing,target=seal.target;
            if(target){
              target.invuln=Math.max(0,(target.invuln||0)-264);
              target.itachiSealPendingKO=false;
              if(seal.ko){target.hp=0;target.state='DEFEAT';target.stateFrame=0;}
              else{target.hp=Math.max(1,target.hp);target.hitstun=0;target.state='IDLE';target.stateFrame=0;}
            }
            sys.sealing=null;
          }
        }
      }
    };
  }
  console.info('[JFF Outsider] Itachi combat overhaul loaded: Crow Flicker Dance, Susanoo, Tsukuyomi, Yasaka, Clone Trap, Amaterasu and Totsuka/Yata.');
})();