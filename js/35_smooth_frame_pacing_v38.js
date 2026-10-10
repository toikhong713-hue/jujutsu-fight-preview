'use strict';
/* JFF v38: render-only interpolation and static arena cache. No gameplay math changes. */
(function(){
  if(window.JFF_SMOOTH_V38)return;
  const state={version:'v38',fps:0,renderMs:0,interpolating:true,arenaCached:false,qualityGuard:'watching',fallbackRequested:false};
  window.JFF_SMOOTH_V38=state;
  let previous=null;
  const readEntity=e=>({x:e.x,y:e.y,walk:e.walk,animT:e.animT,moveFrame:e.moveFrame,stateFrame:e.stateFrame,state:e.state,move:e.move});
  function beforeStep(){
    if(typeof G==='undefined')return;
    const fighters=new Map(),projectiles=new Map();
    if(Array.isArray(G.fighters))for(const f of G.fighters)if(f)fighters.set(f,readEntity(f));
    if(Array.isArray(G.projectiles))for(const p of G.projectiles)if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))projectiles.set(p,{x:p.x,y:p.y});
    const camera=(typeof cam!=='undefined')?{x:cam.x,y:cam.y,zoom:cam.zoom}:null;
    previous={fighters,projectiles,camera,shakeX:G.shakeX,shakeY:G.shakeY};
  }
  window.JFFFramePacingV38={beforeStep};
  function buildArenaCache(){
    const cache=document.createElement('canvas');cache.width=ARENA_W;cache.height=720;
    const c=cache.getContext('2d',{alpha:true,desynchronized:true});if(!c)return null;
    const gg=c.createLinearGradient(0,GROUND-10,0,GROUND+180);
    gg.addColorStop(0,'#2a2233');gg.addColorStop(.35,'#1a1420');gg.addColorStop(1,'#0a0810');
    c.fillStyle=gg;c.fillRect(-400,GROUND,ARENA_W+800,300);
    c.strokeStyle='rgba(140,120,180,0.35)';c.lineWidth=2;c.beginPath();c.moveTo(-400,GROUND);c.lineTo(ARENA_W+400,GROUND);c.stroke();
    c.strokeStyle='rgba(90,140,220,0.18)';c.lineWidth=2;
    for(let i=0;i<26;i++){const sx=((i*137)%ARENA_W);c.beginPath();let x=sx,y=GROUND+6;c.moveTo(x,y);for(let k=0;k<4;k++){x+=((i*37)%2?1:-1)*rnd(12,34);y+=rnd(3,12);c.lineTo(x,y);}c.stroke();}
    c.fillStyle='rgba(40,34,52,0.9)';
    for(let i=0;i<40;i++){const x=((i*241)%ARENA_W),w=rnd(10,34),h=rnd(4,12);c.save();c.translate(x,GROUND+rnd(4,40));c.rotate(((i*17)%10-5)*.1);c.fillRect(-w/2,-h/2,w,h);c.restore();}
    if(typeof drawTojiTraversalMap==='function')drawTojiTraversalMap(c);
    c.save();
    const bg=c.createLinearGradient(WALL-40,0,WALL+40,0);bg.addColorStop(0,'rgba(120,180,255,0)');bg.addColorStop(1,'rgba(120,180,255,0.22)');c.fillStyle=bg;c.fillRect(WALL-40,0,80,GROUND);
    const bg2=c.createLinearGradient(ARENA_W-WALL-40,0,ARENA_W-WALL+40,0);bg2.addColorStop(0,'rgba(120,180,255,0.22)');bg2.addColorStop(1,'rgba(120,180,255,0)');c.fillStyle=bg2;c.fillRect(ARENA_W-WALL-40,0,80,GROUND);c.restore();
    return cache;
  }
  const baseDrawArenaWorld=window.drawArenaWorld;let arenaCache=null;
  try{arenaCache=buildArenaCache();}catch(e){console.warn('[JFF V38] Static arena cache skipped.',e);}
  if(arenaCache&&typeof baseDrawArenaWorld==='function'){
    window.drawArenaWorld=function(){
      if(G.tojiCineX||!G.bgFar||!G.bgMid)return baseDrawArenaWorld.apply(this,arguments);
      const off1=(cam.x-ARENA_W/2)*.12,off2=(cam.x-ARENA_W/2)*.34;
      ctx.save();ctx.drawImage(G.bgFar,-260-off1,-40);ctx.drawImage(G.bgMid,-300-off2,-40);ctx.restore();
      ctx.drawImage(arenaCache,0,0);
    };
    state.arenaCached=true;
  }
  const baseRender=window.render;if(typeof baseRender!=='function')return;
  let windowStarted=performance.now(),windowFrames=0,lowWindows=0,qualityDropped=false,fallbackRequested=false;
  const mix=(a,b,t)=>Number.isFinite(a)&&Number.isFinite(b)?a+(b-a)*t:b;
  window.render=function(){
    const alpha=Math.max(0,Math.min(1,Number.isFinite(window.__JFF_RENDER_ALPHA_V38)?window.__JFF_RENDER_ALPHA_V38:1));
    const restore=[];
    if(previous&&typeof G!=='undefined'&&alpha<.999){
      try{
        if(Array.isArray(G.fighters))for(const f of G.fighters){
          const p=previous.fighters.get(f);if(!p)continue;
          const values={x:f.x,y:f.y,walk:f.walk,animT:f.animT,moveFrame:f.moveFrame,stateFrame:f.stateFrame};
          restore.push({entity:f,values});f.x=mix(p.x,f.x,alpha);f.y=mix(p.y,f.y,alpha);
          if(p.state===f.state&&p.move===f.move){
            if(Number.isFinite(p.walk)&&Number.isFinite(f.walk))f.walk=mix(p.walk,f.walk,alpha);
            if(Number.isFinite(p.animT)&&Number.isFinite(f.animT))f.animT=mix(p.animT,f.animT,alpha);
            if(Number.isFinite(p.moveFrame)&&Number.isFinite(f.moveFrame))f.moveFrame=mix(p.moveFrame,f.moveFrame,alpha);
            if(Number.isFinite(p.stateFrame)&&Number.isFinite(f.stateFrame))f.stateFrame=mix(p.stateFrame,f.stateFrame,alpha);
          }
        }
        if(Array.isArray(G.projectiles))for(const p of G.projectiles){const q=previous.projectiles.get(p);if(q){restore.push({entity:p,values:{x:p.x,y:p.y}});p.x=mix(q.x,p.x,alpha);p.y=mix(q.y,p.y,alpha);}}
        if(typeof cam!=='undefined'&&previous.camera){restore.push({entity:cam,values:{x:cam.x,y:cam.y,zoom:cam.zoom}});cam.x=mix(previous.camera.x,cam.x,alpha);cam.y=mix(previous.camera.y,cam.y,alpha);cam.zoom=mix(previous.camera.zoom,cam.zoom,alpha);}
        if(Number.isFinite(G.shakeX)&&Number.isFinite(previous.shakeX)){restore.push({entity:G,values:{shakeX:G.shakeX,shakeY:G.shakeY}});G.shakeX=mix(previous.shakeX,G.shakeX,alpha);G.shakeY=mix(previous.shakeY,G.shakeY,alpha);}
      }catch(_){}
    }
    const begin=performance.now();
    try{return baseRender.apply(this,arguments);}
    finally{
      for(let i=restore.length-1;i>=0;i--){const row=restore[i];for(const k in row.values)row.entity[k]=row.values[k];}
      const end=performance.now();state.renderMs=end-begin;
      if(!document.hidden){windowFrames++;if(end-windowStarted>=1000){
        state.fps=windowFrames*1000/(end-windowStarted);windowFrames=0;windowStarted=end;
        const vfx=window.JFF_V37_PIXI_VFX;
        if(state.fps<54){lowWindows++;if(!qualityDropped&&vfx&&typeof vfx.setQuality==='function'){vfx.setQuality('low');qualityDropped=true;state.qualityGuard='reduced VFX quality';}}
        else lowWindows=0;
        if(state.fps<50&&lowWindows>=2&&!fallbackRequested&&vfx&&vfx.renderer==='PIXI WEBGL'&&typeof vfx.forceFallback==='function'){vfx.forceFallback('FRAME PACING SAFETY');fallbackRequested=true;state.qualityGuard='Canvas 2D fallback';}
      }}else{windowStarted=end;windowFrames=0;}
      state.fallbackRequested=fallbackRequested;state.renderer=window.JFF_V37_PIXI_VFX?.renderer||'Canvas 2D';
    }
  };
})();