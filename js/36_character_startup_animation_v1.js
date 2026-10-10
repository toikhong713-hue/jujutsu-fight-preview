/* JFF CHARACTER STARTUP ANIMATION SYSTEM v1.0
   Shared READY -> cinematic face-off -> FIGHT controller.
   No external libraries. Reuses the existing Canvas 2D renderer and fighter state.
*/
(function(){
  'use strict';
  if (window.JFF_CHARACTER_STARTUP_V1) return;

  const DURATION = 5.25;
  const AURA_FRAMES = 120;
  const INTRO_END = 4.55;
  const baseResetRound = window.resetRound;
  const baseStep = window.step;
  const baseRender = window.render;
  const baseDrawFighter = window.drawFighter;

  if (![baseResetRound, baseStep, baseRender, baseDrawFighter].every(fn => typeof fn === 'function')) {
    console.warn('[JFF Startup] Required game hooks were not found; startup system disabled.');
    return;
  }

  const PALETTE = {
    gojo: '#73dcff',
    young_gojo: '#b8efff',
    sukuna: '#ff465d',
    yuji: '#ff765e',
    yuta: '#c7a8ff',
    hakari: '#ffd166',
    toji: '#c2d2d8',
    heian_sukuna: '#ff354f',
    the_strongest_today: '#00e5ff'
  };
  const clamp01 = n => Math.max(0, Math.min(1, n));
  const easeOut = t => 1 - Math.pow(1 - clamp01(t), 3);
  const easeInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
  const paletteFor = f => (f && f.id === 'sukuna' && f.form) ? '#ff916f' : PALETTE[f && f.id] || '#c8e7ff';

  function activeCine(){
    return !!(G.startupCine && G.startupCine.active);
  }
  function storyCineActive(){
    return !!(G.mode === 'story' && G.ch1Cine && G.ch1Cine.active);
  }
  function setCamera(x, zoom){
    cam.x = cam.tx = x;
    cam.y = cam.ty = 430;
    cam.zoom = cam.tzoom = zoom;
  }
  function clearHeldInput(){
    try {
      if (typeof KP_RESET === 'function') KP_RESET();
      else if (typeof KP !== 'undefined') for (const k in KP) KP[k] = false;
    } catch (_) {}
  }
  function beginStartup(){
    if (!G.fighters || G.fighters.length < 2 || G.mode === 'menu') return;
    // Story Chapter 1 already owns a bespoke 14.75s cinematic. Do not run two films at once.
    if (G.mode === 'story' && (G.storyCutscene || (G.story && G.story.cutscene) || storyCineActive())) return;
    const [a,b] = G.fighters;
    if (!a || !b) return;
    const center = ARENA_W / 2;
    const targetA = center - 190;
    const targetB = center + 190;
    G.startupCine = {
      active:true, t:0, phase:-1, center, targetA, targetB,
      startA:center-425, startB:center+425,
      oldRoundState:G.roundState
    };
    for (const f of [a,b]) {
      f.startupAuraFrames = 0;
      f.startupPoseSeed = f.id === 'toji' ? 0.7 : f.id === 'hakari' ? 1.4 : 0;
      f.vx=0; f.vy=0; f.walk=0; f.state='IDLE'; f.stateFrame=0;
      f.move=null; f.moveKey=null; f.moveFrame=0; f.blocking=false;
    }
    a.x=G.startupCine.startA; b.x=G.startupCine.startB;
    a.y=GROUND; b.y=GROUND;
    a.facing=1; b.facing=-1;
    G.roundState='intro'; G.roundTimer=0;
    G.matchOver=false; G.winner=null;
    G.domain=null; G.clash=null;
    setCamera(a.x,1.12);
  }
  function finishStartup(){
    const c=G.startupCine;
    if(!c || !G.fighters || G.fighters.length<2) { G.startupCine=null; return; }
    const [a,b]=G.fighters;
    a.x=c.targetA; b.x=c.targetB;
    for (const f of [a,b]) {
      f.y=GROUND; f.vx=0; f.vy=0; f.walk=0;
      f.state='IDLE'; f.stateFrame=0; f.move=null; f.moveKey=null; f.moveFrame=0;
      f.startupAuraFrames=AURA_FRAMES;
    }
    a.facing=1; b.facing=-1;
    G.roundState='fight'; G.roundTimer=0;
    G.startupCine=null;
    setCamera(c.center,0.90);
    clearHeldInput();
  }
  function tickStartup(){
    const c=G.startupCine;
    if (!c || !c.active || G.paused) return;
    c.t += 1/60;
    const t=c.t, [a,b]=G.fighters;
    if (!a || !b) { G.startupCine=null; return; }
    G.frame=(G.frame||0)+1;
    for(const f of [a,b]) {
      f.animT=(f.animT||0)+1.05;
      f.stateFrame=(f.stateFrame||0)+1;
      f.vx=0;f.vy=0;
    }
    if(t<1.65){
      const q=easeOut((t-.18)/1.18);
      a.x=c.startA+(c.targetA-c.startA)*q;
      a.state=t>.25&&t<1.35?'WALK':'IDLE';
      a.walk=t>.25&&t<1.35?Math.sin(t*13)*1.2:0;
      b.x=c.startB;
      b.state='IDLE';b.walk=0;
      setCamera(a.x+36,1.14+Math.sin(t*2)*.025);
      c.phase=0;
    }else if(t<2.12){
      a.x=c.targetA;a.state='IDLE';a.walk=0;
      setCamera(c.targetA+12,1.28);
      c.phase=1;
    }else if(t<3.72){
      const q=easeOut((t-2.12)/1.28);
      b.x=c.startB+(c.targetB-c.startB)*q;
      b.state=t<3.43?'WALK':'IDLE';
      b.walk=t<3.43?Math.sin(t*12)*1.15:0;
      a.x=c.targetA;a.state='IDLE';a.walk=0;
      setCamera(b.x-36,1.14+Math.sin(t*2.2)*.025);
      c.phase=2;
    }else if(t<INTRO_END){
      a.x=c.targetA;b.x=c.targetB;
      a.state='IDLE';b.state='IDLE';a.walk=0;b.walk=0;
      setCamera(c.center,0.91+Math.sin(t*4)*.012);
      c.phase=3;
    }else{
      a.x=c.targetA;b.x=c.targetB;
      a.state='IDLE';b.state='IDLE';a.walk=0;b.walk=0;
      setCamera(c.center,0.90);
      c.phase=4;
    }
    if(t>=DURATION) finishStartup();
  }

  function drawSignature(f, alpha, strong){
    if(!f || typeof ctx==='undefined') return;
    const color=paletteFor(f);
    const t=(G.frame||0)*.055+(f.startupPoseSeed||0);
    const x=f.x, y=f.y-78;
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=alpha;
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
    ctx.lineWidth=strong?2.0:1.35;
    const radius=(strong?27:20)+Math.sin(t*2)*2.5;
    if(f.id==='toji'){
      // Steel glints and short motion slashes, not a supernatural aura.
      for(let i=0;i<2;i++){
        const yy=y-13+i*17;
        ctx.beginPath();ctx.moveTo(x-31+(t%1)*7,yy+7);ctx.lineTo(x+15,yy-8);ctx.stroke();
      }
      ctx.beginPath();ctx.moveTo(x+f.facing*22,y-14);ctx.lineTo(x+f.facing*37,y-21);ctx.stroke();
    }else if(f.id==='sukuna'||f.id==='heian_sukuna'||f.id==='yuji'){
      for(let i=0;i<(f.id==='heian_sukuna'?4:3);i++){
        const yy=y-24+i*15;
        ctx.beginPath();ctx.moveTo(x-31,yy+8);ctx.lineTo(x+30,yy-7);ctx.stroke();
      }
    }else if(f.id==='hakari'){
      ctx.save();ctx.translate(x,y);ctx.rotate(t*.4);
      ctx.strokeRect(-radius*.55,-radius*.55,radius*1.1,radius*1.1);
      ctx.restore();
      ctx.beginPath();ctx.arc(x,y,radius,0.25+t,1.95+t);ctx.stroke();
    }else if(f.id==='yuta'){
      ctx.beginPath();ctx.arc(x-7,y,radius,.45+t*.15,2.45+t*.15);ctx.stroke();
      ctx.beginPath();ctx.arc(x+8,y,radius*.78,3.45-t*.12,5.25-t*.12);ctx.stroke();
    }else{
      ctx.beginPath();ctx.ellipse(x,y,radius,radius*1.28,t*.04,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.arc(x,y,radius*.72,.25+t,2.2+t);ctx.stroke();
      if(f.id==='the_strongest_today'||f.id==='young_gojo'){
        ctx.beginPath();ctx.moveTo(x,y-radius-9);ctx.lineTo(x,y-radius+1);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x-5,y-radius-4);ctx.lineTo(x+5,y-radius-4);ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawCinematicOverlay(){
    const c=G.startupCine;
    if(!c || !c.active || typeof ctx==='undefined') return;
    const t=c.t, phase=c.phase;
    const [a,b]=G.fighters||[];
    ctx.save();
    const barH=clamp01(t/.22)*46;
    ctx.fillStyle='#05070d';
    ctx.fillRect(0,0,W,barH);
    ctx.fillRect(0,H-barH,W,barH);
    // Light, low-cost vignette approximation: edge strips instead of a large gradient.
    ctx.globalAlpha=.18;
    ctx.fillRect(0,0,W,5);ctx.fillRect(0,H-5,W,5);
    ctx.globalAlpha=1;
    let label='READY';
    let sub='THE BATTLE BEGINS';
    if(phase===0){label='READY';sub=(a&&a.name||'FIGHTER 1')+' // ENTRANCE';}
    else if(phase===1){label='READY';sub=(a&&a.name||'FIGHTER 1')+' // READY';}
    else if(phase===2){label='READY';sub=(b&&b.name||'FIGHTER 2')+' // ENTRANCE';}
    else if(phase===3){label='FACE OFF';sub=(a&&a.short||'P1')+'  VS  '+(b&&b.short||'P2');}
    else {label='FIGHT!';sub='';}
    ctx.textAlign='center';
    if(phase===0||phase===1||phase===2){
      const focus=phase===2?b:a;
      const color=paletteFor(focus);
      ctx.globalAlpha=.86;
      ctx.fillStyle=color;ctx.font='800 12px system-ui, sans-serif';
      ctx.fillText(sub,W/2,H-67);
    }else if(phase===3){
      ctx.globalAlpha=.94;
      ctx.fillStyle='#e6f3ff';ctx.font='800 14px system-ui, sans-serif';
      ctx.fillText(sub,W/2,72);
    }
    if(phase===4){
      const pulse=.86+.14*Math.sin(t*18);
      ctx.globalAlpha=pulse;
      ctx.font='900 60px Impact, system-ui, sans-serif';
      ctx.lineWidth=5;ctx.strokeStyle='#101621';ctx.strokeText('FIGHT!',W/2,H/2+19);
      ctx.fillStyle='#ffffff';ctx.fillText('FIGHT!',W/2,H/2+19);
      ctx.globalAlpha=.9;ctx.font='800 11px system-ui, sans-serif';ctx.fillStyle='#c5d5ea';
      ctx.fillText('NO RETREAT  //  NO RESET',W/2,H/2+48);
    }
    // Brief flash at the start and at FIGHT, with no full-screen blur.
    if(t<.20){
      ctx.globalAlpha=(1-t/.20)*.22;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
    }else if(phase===4 && t<4.70){
      ctx.globalAlpha=(1-(t-INTRO_END)/.15)*.18;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
    }
    ctx.restore();
  }

  window.resetRound=function(){
    baseResetRound();
    // Story Chapter 1 already has its own cinematic entry; avoid double intro.
    if(G.mode==='story' && ((G.story&&G.story.cutscene)||G.storyCutscene||storyCineActive())) return;
    beginStartup();
  };
  window.step=function(){
    if(activeCine()){
      tickStartup();
      return;
    }
    const wasStoryCine=storyCineActive();
    baseStep();
    // Reuse the existing Story film for Chapter 1, then give its fighters the same short aura tail.
    if(wasStoryCine && !storyCineActive() && G.mode==='story' && G.fighters){
      for(const f of G.fighters) f.startupAuraFrames=AURA_FRAMES;
    }
    if(G.fighters) for(const f of G.fighters){
      if(f.startupAuraFrames>0) f.startupAuraFrames--;
    }
  };
  window.drawFighter=function(f){
    if(f){
      if(activeCine()){
        const t=G.startupCine.t;
        const focused=(G.startupCine.phase===2?G.fighters[1]:G.fighters[0])===f;
        if(focused) drawSignature(f,.36,true);
        else drawSignature(f,.10,false);
      }else if(f.startupAuraFrames>0){
        drawSignature(f,Math.min(.34,f.startupAuraFrames/AURA_FRAMES*.34),false);
      }
    }
    baseDrawFighter(f);
  };
  window.render=function(){
    baseRender();
    drawCinematicOverlay();
  };

  window.JFF_CHARACTER_STARTUP_V1={
    version:'1.0',
    get active(){return activeCine();},
    get time(){return G.startupCine?G.startupCine.t:0;},
    get duration(){return DURATION;},
    auraFrames:AURA_FRAMES
  };
  console.info('[JFF Startup] Character Startup Animation System v1.0 ready.');
})();