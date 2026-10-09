'use strict';
/* ===== MODERN ANIMATION LAYER =====
   Adds readable timing, secondary motion and motion telemetry without replacing poses.
*/
(function(){
  if(window.JFF_MODERN_ANIMATION_V19)return;
  G.modernAnim=G.modernAnim||new WeakMap();
  const legacyStep=window.step;

  function profile(f){
    let p=G.modernAnim.get(f);
    if(!p){p={state:'',frame:0,phase:0,energy:0,prevX:f.x,prevY:f.y,velX:0,velY:0,age:0};G.modernAnim.set(f,p);}
    p.state=f.state;p.frame=(f.stateFrame||0);p.age++;p.velX=f.x-p.prevX;p.velY=f.y-p.prevY;p.prevX=f.x;p.prevY=f.y;
    const move=(f.moveFrame||0),m=f.move;
    if(m&&m.duration)p.phase=clamp(move/Math.max(1,m.duration),0,1);else p.phase=clamp(move/Math.max(1,(m?.startup||1)+(m?.active||0)+(m?.recovery||1)),0,1);
    p.energy=clamp(Math.hypot(p.velX,p.velY)/12,0,1);
    return p;
  }
  window.getModernAnimProfile=profile;

  function modernAnimationTick(){
    if(!G.fighters)return;
    for(const f of G.fighters)profile(f);
    if(G.modernFx){
      const max=G.modernFx.motion||[];
      for(let i=max.length-1;i>=0;i--){max[i].life--;if(max[i].life<=0)max.splice(i,1);}
    }
  }

  window.step=function(){
    legacyStep();
    if(G.mode!=='menu')modernAnimationTick();
  };
  window.JFF_MODERN_ANIMATION_V19=true;
})();