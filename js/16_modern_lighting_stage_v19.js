'use strict';
/* ===== MODERN STAGE + LIGHTING ===== */
(function(){
  if(window.JFF_MODERN_LIGHTING_V19)return;
  const legacyArena=window.drawArenaWorld;
  function stagePass(){
    if(G.mode==='menu')return;
    const q=G.modernFx?.quality||1;
    const horizon=GROUND-40;
    const shift=((cam.x-ARENA_W*.5)*.018)%W;
    ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=.08*q;
    const glow=ctx.createLinearGradient(0,horizon,0,GROUND+100);
    glow.addColorStop(0,'rgba(150,190,255,.55)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,horizon,W,160);
    ctx.globalAlpha=.045*q;
    for(let i=0;i<7;i++){
      const x=(i*240+shift+W*2)%W;
      ctx.beginPath();ctx.moveTo(x,horizon);ctx.lineTo(x-90,horizon+180);ctx.lineTo(x+34,horizon+180);ctx.closePath();ctx.fillStyle=i%2?'#8fa8c8':'#c2d5e8';ctx.fill();
    }
    ctx.restore();
    /* Foreground depth bars are very cheap and make jumps/rooftops read better. */
    ctx.save();ctx.globalAlpha=.09*q;ctx.fillStyle='#05070b';ctx.fillRect(0,GROUND+28,W,H-GROUND-28);ctx.restore();
  }
  window.drawArenaWorld=function(){legacyArena();stagePass();};

  window.JFF_MODERN_LIGHTING_V19=true;
})();