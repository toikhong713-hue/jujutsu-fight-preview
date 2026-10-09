'use strict';
/*
  YOUNG GOJO RED COUNTER V26
  Rebuilt from scratch around a dedicated state machine.
  Keeps the V25 red orb / pressure VFX helpers untouched.
*/
(() => {
  if(window.JFF_V26_RED_COUNTER)return;
  const clampLocal=(v,a,b)=>Math.max(a,Math.min(b,v));

  function resetYoungRedCounterV26(f,land=true){
    f.youngRedCounterReady=false;
    f.youngRedCounterTriggered=false;
    f.youngRedCounterHidden=false;
    f.youngRedCounterInverted=false;
    f.youngRedCounterAngle=0;
    f.youngRedCounterAttacker=null;
    f.youngRedCounterState=null;
    f.youngRedCounterHitFrame=0;
    f.youngMotion='idle';
    f.youngMotionFrame=0;
    f.youngMotionTimer=0;
    f.youngMoveTween=null;
    if(land){
      f.x=clampLocal(f.x,WALL,ARENA_W-WALL);
      f.y=GROUND;
      f.vx=0;f.vy=0;f.onGround=true;
      f.state='IDLE';f.stateFrame=0;
    }
  }

  function startYoungGojoRedCounter(f){
    if(!f||f.id!=='young_gojo'||!f.awakened)return false;
    if(f.state!=='IDLE'&&f.state!=='WALK'&&f.state!=='CROUCH')return false;
    if(!f.onGround)return false;
    if(f.youngRedCounterState||G.youngRedCounterProjectile)return false;
    const cost=16;
    if(f.energy<cost)return false;
    f.energy-=cost;
    f.state='YOUNG_RED_COUNTER';
    f.stateFrame=0;
    f.youngRedCounterState={
      phase:'armed',
      t:0,
      target:null,
      originX:f.x,
      originY:GROUND,
      behindX:f.x,
      chargeX:f.x,
      chargeY:GROUND-150,
      shot:null
    };
    f.youngRedCounterReady=true;
    f.youngRedCounterTriggered=false;
    f.youngRedCounterHidden=false;
    f.youngRedCounterInverted=false;
    f.youngRedCounterAngle=0;
    f.youngRedCounterAttacker=null;
    floatText(f.x,f.y-188,'RED COUNTER','#ffb5c4',15,34);
    ring(f.x,f.y-70,'#ff6f8d',26,16);
    SFX.red();
    return true;
  }

  function armFx(f,t){
    if(t%6===0){
      yg20RedPressure(f.x+f.facing*46,f.y-82,34+Math.sin(t*.2)*8,.36);
    }
  }

  function doVanish(f,s){
    f.youngRedCounterHidden=true;
    f.youngRedCounterInverted=false;
    f.youngRedCounterAngle=0;
    f.vx=0;f.vy=0;f.onGround=false;
    if(s.t===1){
      flash(.18,'#ffe7ed');
      ring(s.originX,s.originY-72,'#ff8aa0',48,22);
      for(let i=0;i<3;i++)pushAfterimage(f,computePose(f));
      SFX.dash();
    }
    if(s.t>=5){
      const trg=s.target&&s.target.hp>0?s.target:null;
      if(!trg){resetYoungRedCounterV26(f,true);return;}
      const away=(trg.facing||1);
      s.behindX=clampLocal(trg.x-away*126,WALL+30,ARENA_W-WALL-30);
      s.chargeX=s.behindX;
      s.chargeY=GROUND-158;
      f.x=s.chargeX;
      f.y=s.chargeY;
      f.onGround=false;
      f.vx=0;f.vy=0;
      f.facing=trg.x>=f.x?1:-1;
      f.youngRedCounterHidden=false;
      f.youngRedCounterInverted=true;
      f.youngRedCounterAngle=Math.PI;
      s.phase='inverted';
      s.t=0;
      ring(f.x,f.y+40,'#ff7893',38,18);
      flash(.10,'#f8edf0');
      SFX.dash();
    }
  }

  function updateInverted(f,s){
    const trg=s.target&&s.target.hp>0?s.target:null;
    if(!trg){resetYoungRedCounterV26(f,false);f.state='FALL';f.onGround=false;f.vy=2.2;return;}
    f.state='YOUNG_RED_COUNTER';f.onGround=false;f.vx=0;f.vy=0;
    s.behindX=clampLocal(trg.x-(trg.facing||1)*126,WALL+30,ARENA_W-WALL-30);
    f.x=s.behindX;
    f.facing=trg.x>=f.x?1:-1;
    const q=clampLocal(s.t/38,0,1);
    f.y=GROUND-158+Math.sin(q*Math.PI)*6;
    f.youngRedCounterInverted=true;
    f.youngRedCounterHidden=false;
    f.youngRedCounterAngle=Math.PI + Math.sin(q*Math.PI)*0.045;
    if(s.t<7){yg20BackflipBurst(f);}
    if(s.t>=7&&s.t<34){
      const charge=clampLocal((s.t-7)/27,0,1);
      const px=f.x-f.facing*(44+10*charge), py=f.y+58;
      yg20RedCore(px,py,20+14*charge,.80+.20*charge);
      yg20RedPressure(px,py,62+44*charge,.44+.28*charge);
      if(s.t%4===0){
        ygRibbons(px,py,f.facing,'#ff6b86',3,14,10);
        ygShards(px,py,f.facing,'#ffe2e7','#ff6a86',4,3.8);
      }
    }
    if(s.t===34){
      const px=f.x-f.facing*54,py=f.y+58;
      s.shot={x:px,y:py,target:trg,targetX:trg.x,targetY:trg.y-68};
      yg20RedCore(px,py,34,1);
      yg20RedPressure(px,py,112,1);
      flash(.16,'#fff0f3');
      shake(5);camPunch(.08);SFX.red();
      s.phase='release';s.t=0;
    }
  }

  function releaseRed(f,s){
    const shot=s.shot;
    if(!shot){resetYoungRedCounterV26(f,false);f.state='FALL';f.onGround=false;f.vy=2.2;return;}
    if(s.t===1){
      const trg=shot.target&&shot.target.hp>0?shot.target:null;
      const tx=trg?trg.x:shot.targetX;
      const ty=trg?trg.y-68:shot.targetY;
      const dx=tx-shot.x,dy=ty-shot.y,len=Math.max(1,Math.hypot(dx,dy));
      G.youngRedCounterProjectile={
        x:shot.x,y:shot.y,vx:dx/len*19,vy:dy/len*19,dir:f.facing,
        life:44,t:0,target:trg,hitDone:false,owner:f,trailAge:0
      };
      yg20RedCore(shot.x,shot.y,38,1);
      yg20RedPressure(shot.x,shot.y,122,1);
      floatText(f.x,f.y-210,'REVERSAL RED','#ff9aac',16,34);
      flash(.14,'#ffe5eb');shake(7);camPunch(.10);SFX.red();
      // Release every cinematic lock now. Physics owns Gojo from this frame onward.
      resetYoungRedCounterV26(f,false);
      f.state='FALL';f.stateFrame=0;f.onGround=false;f.vx=0;f.vy=2.4;
      f.invuln=Math.max(f.invuln,8);
      return;
    }
    if(s.t>4){
      resetYoungRedCounterV26(f,false);
      f.state='FALL';f.stateFrame=0;f.onGround=false;f.vy=2.2;
    }
  }

  function updateYoungGojoRedCounterV26(f){
    let s=f.youngRedCounterState;
    if(!s){
      resetYoungRedCounterV26(f,true);
      return;
    }
    s.t++;
    if(s.phase==='armed'){
      f.state='YOUNG_RED_COUNTER';
      f.onGround=true;f.y=GROUND;f.vx=0;f.vy=0;
      f.youngRedCounterReady=true;
      f.youngRedCounterHidden=false;f.youngRedCounterInverted=false;f.youngRedCounterAngle=0;
      armFx(f,s.t);
      if(!f.youngRedCounterTriggered&&s.t>=52){resetYoungRedCounterV26(f,true);}
      return;
    }
    if(s.phase==='vanish'){doVanish(f,s);return;}
    if(s.phase==='inverted'){updateInverted(f,s);return;}
    if(s.phase==='release'){releaseRed(f,s);return;}
    resetYoungRedCounterV26(f,true);
  }

  window.startYoungGojoRedCounter=startYoungGojoRedCounter;
  window.updateYoungGojoRedCounterV26=updateYoungGojoRedCounterV26;
  window.resetYoungRedCounterV26=resetYoungRedCounterV26;
  window.JFF_V26_RED_COUNTER=true;
})();