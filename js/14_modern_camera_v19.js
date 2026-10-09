'use strict';
/* ===== MODERN CAMERA ===== */
(function(){
  if(window.JFF_MODERN_CAMERA_V19)return;
  const legacyUpdateCamera=window.updateCamera;
  function updateModernCamera(){
    legacyUpdateCamera();
    if(!G.fighters||G.mode==='menu'||G.tojiCineX)return;
    const a=G.fighters[0],b=G.fighters[1];
    if(!a||!b)return;
    const midX=(a.x+b.x)*0.5;
    const midY=Math.min(a.y,b.y)-18;
    const dist=Math.abs(a.x-b.x);
    const combatZoom=clamp(1.12-dist/1500,0.82,1.10);
    const velocity=Math.min(1.0,(Math.abs(a.vx||0)+Math.abs(b.vx||0))/18);
    let targetZoom=combatZoom + velocity*.035;
    if(G.zoomPunch)targetZoom+=Math.min(.12,G.zoomPunch*.24);
    if(G.hitstop>0)targetZoom+=Math.min(.05,G.hitstop*.002);
    cam.tx=clamp(midX,W/2/cam.zoom,ARENA_W-W/2/cam.zoom);
    cam.ty=clamp(midY,220,500);
    cam.tzoom=clamp(targetZoom,.78,1.14);
    cam.cine=Math.max(cam.cine||0,0);
    /* A tiny anticipation offset makes fast movement feel intentional, not floaty. */
    const lead=((a.vx||0)+(b.vx||0))*3;
    cam.tx=clamp(cam.tx+lead,W/2/cam.tzoom,ARENA_W-W/2/cam.tzoom);
  }
  window.updateCamera=updateModernCamera;
  window.JFF_MODERN_CAMERA_V19=true;
})();