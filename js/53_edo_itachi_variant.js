/* EDO ITACHI VARIANT v1
   Separate training-only Itachi loadout with restrained reanimation healing and Kotoamatsukami counter.
   It deliberately reuses the existing Itachi combat/render/Susanoo stack to keep controls stable. */
(function(){
  'use strict';
  if(window.__JFF_EDO_ITACHI_VARIANT_V1__)return;
  if(typeof CHARS==='undefined'||!CHARS.itachi||!window.JFF_ITACHI_REBOOT)return;
  window.__JFF_EDO_ITACHI_VARIANT_V1__=true;
  const Q=window.JFF_ITACHI_REBOOT;
  const cloneMoves=source=>{
    const out={};
    for(const key of Object.keys(source||{}))out[key]=Object.assign({},source[key],source[key].hitbox?{hitbox:Object.assign({},source[key].hitbox)}:{});
    return out;
  };
  const EDO_MOVES=cloneMoves(CHARS.itachi.moves);
  EDO_MOVES.light.name='Crow-Feather Flicker';
  EDO_MOVES.heavy.name='Reanimated Rib-Cage Breaker';
  EDO_MOVES.s1.name='Fire Style: Great Fireball';
  EDO_MOVES.s2=Object.assign({},EDO_MOVES.s2,{
    name:'Kotoamatsukami: Release Counter',startup:7,active:108,recovery:16,
    damage:16,cost:34,cd:600,meter:14,aura:'itachiKotoamatsukami'
  });
  EDO_MOVES.s3.name='Susanoo: Yasaka Magatama';
  EDO_MOVES.s4=Object.assign({},EDO_MOVES.s4,{
    name:'Crow Body Replacement',cost:28,cd:420,aura:'itachiCrowRebirth'
  });
  EDO_MOVES.s5.name='Amaterasu: Unquenchable Black Flame';
  EDO_MOVES.def.name='Yata Mirror: Reanimated Guard';
  EDO_MOVES.ult.name='Edo Susanoo: Totsuka Sealing Finale';
  const EDO={
    name:'EDO ITACHI UCHIHA',short:'EDO ITACHI',moves:EDO_MOVES,
    colors:{skin:'#dfe4eb',skin2:'#929eae',hair:'#151821',hair2:'#070910',top:'#101018',top2:'#252a36',bottom:'#080910',accent:'#aab6cc',aura:'#bdc8dc',energy:'#a9b9d6',rim:'#f0f5ff'},
    hp:220,walk:3.48,jump:-14.25,weight:1.02,awakening:'sharingan',trainingOnly:true,outsider:true
  };
  CHARS.edo_itachi=EDO;
  const fx=(type,x,y,d,data)=>{
    if(typeof window.JFF_OUTSIDER_FX==='function')window.JFF_OUTSIDER_FX(type,x,y,d||22,data||{});
  };
  function configureEdo(f,resetLife){
    if(!f)return f;
    f.id='itachi';
    f.itachiEdo=true;
    f.def=EDO;
    f.name=EDO.name;
    f.short=EDO.short;
    f.moves=EDO_MOVES;
    f.maxHp=EDO.hp;
    f.walk=EDO.walk;
    if(resetLife){
      f.hp=EDO.hp;f.prevHp=EDO.hp;f.itachiEdoLastHp=EDO.hp;
      f.itachiEdoRegenClock=0;f.itachiEdoRegenUsed=0;f.itachiEdoPulse=0;
    }else{
      f.itachiEdoLastHp=Number.isFinite(f.hp)?f.hp:EDO.hp;
      f.itachiEdoRegenClock=0;f.itachiEdoRegenUsed=0;f.itachiEdoPulse=0;
    }
    f.itachiEdoCounterUntil=0;f.itachiEdoCounterUsed=false;
    f.itachiEdoCounterLastAt=-999;f.itachiEdoCounterLastTarget=null;
    return f;
  }
  const previousCreate=window.createFighter;
  if(typeof previousCreate==='function'){
    window.createFighter=function(charId){
      const f=previousCreate.apply(this,arguments);
      if(f&&charId==='edo_itachi')configureEdo(f,false);
      return f;
    };
  }
  const previousReset=window.resetFighter;
  if(typeof previousReset==='function'){
    window.resetFighter=function(f){
      const wasEdo=!!(f&&f.itachiEdo);
      const result=previousReset.apply(this,arguments);
      if(wasEdo)configureEdo(f,true);
      return result;
    };
  }
  const previousStart=window.startMove;
  if(typeof previousStart==='function'){
    window.startMove=function(f,key){
      if(f&&f.itachiEdo)f.moves=EDO_MOVES;
      const ok=previousStart.apply(this,arguments);
      if(f&&f.itachiEdo){
        f.moves=EDO_MOVES;
        if(ok&&key==='s2'){
          f.itachiCounterUntil=0;
          f.itachiEdoCounterUntil=0;
          f.itachiEdoCounterUsed=false;
        }else if(ok){
          f.itachiEdoCounterUntil=0;
        }
      }
      return ok;
    };
  }
  const previousUpdate=window.updateMove;
  if(typeof previousUpdate==='function'){
    window.updateMove=function(f){
      if(f&&f.itachiEdo&&f.moveKey==='s2'&&f.move&&
         !(Q.cinema&&(Q.cinema.owner===f||Q.cinema.target===f))){
        f.moveFrame=(f.moveFrame||0)+1;
        const n=f.moveFrame,d=f.facing||1;
        if(n===1){
          f.itachiEdoCounterUntil=0;f.itachiEdoCounterUsed=false;
          f.itachiEdoCounterLastAt=-999;f.itachiEdoCounterLastTarget=null;
          f.vx=0;
          fx('crows',f.x-d*14,f.y-90,22);
          fx('reflect',f.x+d*35,f.y-108,22);
        }
        if(n===7){
          // Long, time-based window stays open through multi-hit strings.
          f.itachiEdoCounterUntil=(Q.tick||0)+108;
          fx('seal',f.x+d*34,f.y-104,34);
          fx('reflect',f.x+d*52,f.y-110,74);
          if(typeof window.floatText==='function')window.floatText(f.x,f.y-166,'KOTOAMATSUKAMI · COUNTER ACTIVE','#dbe5f7',16,52);
        }
        if(n>=116)f.itachiEdoCounterUntil=0;
        if(n>=132){
          f.itachiEdoCounterUntil=0;
          if(typeof window.endMove==='function')window.endMove(f);
          else{f.move=null;f.moveKey=null;f.state=f.onGround?'IDLE':'FALL';f.stateFrame=0;}
        }
        return;
      }
      return previousUpdate.apply(this,arguments);
    };
  }
  const previousResolve=window.resolveHit;
  if(typeof previousResolve==='function'){
    window.resolveHit=function(attacker,defender,mv,hx,hy){
      if(defender&&defender.itachiEdo&&defender.moveKey==='s2'&&
         defender.itachiEdoCounterUntil>(Q.tick||0)&&
         attacker&&attacker!==defender&&attacker.hp>0){
        const dx=attacker.x-defender.x;
        const fromFront=defender.facing===(Math.sign(dx)||1);
        if(fromFront){
          // Front-facing contacts are negated throughout the window; counter damage is paced.
          const lastAt=defender.itachiEdoCounterLastAt||-999;
          const freshTarget=defender.itachiEdoCounterLastTarget!==attacker;
          const canPunish=freshTarget||(Q.tick||0)-lastAt>=22;
          if(canPunish){
            defender.itachiEdoCounterUsed=true;
            defender.itachiEdoCounterLastAt=Q.tick||0;
            defender.itachiEdoCounterLastTarget=attacker;
            const reflected={damage:16,hitstun:27,blockstun:0,kbx:10,kby:-3.5,hitstop:10,meter:7,armorBreak:true,kind:'special',type:'special'};
            previousResolve.call(this,defender,attacker,reflected,
              defender.x+(defender.facing||1)*86,defender.y-92);
            fx('reflect',defender.x+(defender.facing||1)*76,defender.y-112,34);
            fx('crows',attacker.x,attacker.y-82,26);
            if(typeof window.floatText==='function')window.floatText(defender.x,defender.y-178,'KOTO COUNTER!','#e0e8f7',16,40);
            if(typeof window.shake==='function')window.shake(4);
            if(typeof SFX!=='undefined'&&SFX.parry)SFX.parry();
          }else{
            fx('reflect',defender.x+(defender.facing||1)*68,defender.y-106,10);
          }
          return 'parry';
        }
      }
      return previousResolve.apply(this,arguments);
    };
  }
  const previousStep=window.step;
  if(typeof previousStep==='function'){
    window.step=function(){
      const result=previousStep.apply(this,arguments);
      if(typeof G==='undefined'||G.mode==='menu'||G.paused)return result;
      const now=Q.tick||G.frame||0;
      for(const f of (G.fighters||[])){
        if(!f||!f.itachiEdo||f.hp<=0||f.state==='DEFEAT')continue;
        const currentHp=f.hp;
        if(currentHp<(f.itachiEdoLastHp===undefined?currentHp:f.itachiEdoLastHp))f.itachiEdoRegenClock=0;
        f.itachiEdoLastHp=currentHp;
        if(f.itachiEdoPulse>0&&now>=f.itachiEdoPulse)f.itachiEdoPulse=0;
        if(currentHp<(f.maxHp||EDO.hp)&&(f.itachiEdoRegenUsed||0)<16){
          f.itachiEdoRegenClock=(f.itachiEdoRegenClock||0)+1;
          if(f.itachiEdoRegenClock>=180){
            const heal=Math.min(2,(f.maxHp||EDO.hp)-f.hp,16-(f.itachiEdoRegenUsed||0));
            if(heal>0){
              f.hp=Math.min(f.maxHp||EDO.hp,f.hp+heal);
              f.itachiEdoRegenUsed=(f.itachiEdoRegenUsed||0)+heal;
              f.itachiEdoPulse=now+28;
              fx('seal',f.x,f.y-92,28);
              fx('reflect',f.x,f.y-112,20);
              if(typeof window.floatText==='function')window.floatText(f.x,f.y-148,'+'+heal+' REANIMATION','#dce6f7',14,36);
            }
            f.itachiEdoRegenClock=0;
          }
        }else if(currentHp>=(f.maxHp||EDO.hp)){
          f.itachiEdoRegenClock=0;
        }
      }
      return result;
    };
  }
  const previousPose=window.applyCharacterIdentityPose;
  if(typeof previousPose==='function'){
    window.applyCharacterIdentityPose=function(P,f){
      previousPose.apply(this,arguments);
      if(f&&f.itachiEdo&&f.moveKey==='s2'&&P){
        const n=f.moveFrame||0;
        P.lean=n<7?-3:-8;
        P.armF=n<7?[-55,-18]:[-72,-28];
        P.armB=n<7?[44,-5]:[22,-34];
        P.headY=-115;
      }
    };
  }
  window.JFF_EDO_ITACHI={ready:true,moves:EDO_MOVES,passive:'up to 16 HP restored in 2 HP pulses every 180 frames',counter:'front-facing multi-hit Kotoamatsukami counter, active for 108 frames (~1.8 seconds)'};
  console.info('[Edo Itachi] Training-only variant ready: reanimation look, capped healing and Kotoamatsukami counter.');
})();