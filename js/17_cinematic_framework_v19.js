'use strict';
/* ===== CINEMATIC SEQUENCE FRAMEWORK ===== */
(function(){
  if(window.JFF_CINEMATIC_FRAMEWORK_V19)return;
  G.modernCine=G.modernCine||null;

  function ease(t){return t*t*(3-2*t);}
  function start(steps,onDone){
    G.modernCine={active:true,t:0,steps:steps||[],step:0,onDone:onDone||null};
  }
  function update(){
    const c=G.modernCine;if(!c||!c.active)return;
    c.t++;
    let s=c.steps[c.step];
    while(s&&c.t>=s.frames){c.t-=s.frames;c.step++;s=c.steps[c.step];}
    if(!s){c.active=false;if(c.onDone)c.onDone();return;}
    const p=ease(clamp(c.t/Math.max(1,s.frames),0,1));
    if(s.camera){cam.tx=lerp(cam.tx,s.camera.x??cam.tx,p);cam.ty=lerp(cam.ty,s.camera.y??cam.ty,p);cam.tzoom=lerp(cam.tzoom,s.camera.zoom??cam.tzoom,p);}
    if(s.flash&&c.t===1)flash(s.flash.value??.18,s.flash.color||'#fff');
    if(s.shake&&c.t===1)shake(s.shake);
  }
  const legacyUpdateCamera=window.updateCamera;
  function updateCamera(){legacyUpdateCamera();update();}
  window.updateCamera=updateCamera;
  window.JFF_Cinematic={start,stop:()=>{if(G.modernCine)G.modernCine.active=false;},get:()=>G.modernCine};
  window.JFF_CINEMATIC_FRAMEWORK_V19=true;
})();