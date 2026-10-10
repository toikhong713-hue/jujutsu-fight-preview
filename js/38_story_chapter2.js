'use strict';
/* ===== STORY CHAPTER 2: RISING CONFLICT =====
   Isolated chapter controller. It reuses the existing fighter simulation,
   lightweight 2D VFX, result shell and cinematic renderer.
*/
(function(){
  if(window.__JFF_STORY_CHAPTER2_V2__)return;
  window.__JFF_STORY_CHAPTER2_V1__=true;

  const baseStep=step;
  const baseRender=render;
  const baseMenuKey=MenuKey;
  const baseShowResult=showResult;

  const CH2_PHASES=[
    {a:0.00,b:1.05,n:'AFTERMATH'},
    {a:1.05,b:2.60,n:'YUTA_READY'},
    {a:2.60,b:3.85,n:'SUKUNA_REVEAL'},
    {a:3.85,b:6.90,n:'APPROACH'},
    {a:6.90,b:8.15,n:'FACE_OFF'},
    {a:8.15,b:9.12,n:'FIRST_CLASH'},
    {a:9.12,b:9.80,n:'FIGHT'}
  ];
  const clamp01=v=>Math.max(0,Math.min(1,v));
  const easeOut=v=>1-Math.pow(1-clamp01(v),3);
  const phaseAt=t=>{for(let i=CH2_PHASES.length-1;i>=0;i--)if(t>=CH2_PHASES[i].a)return i;return 0;};
  const phaseNorm=(t,i)=>clamp01((t-CH2_PHASES[i].a)/(CH2_PHASES[i].b-CH2_PHASES[i].a));
  const easeInOut=v=>{v=clamp01(v);return v*v*(3-2*v);};
  function setChapter2Camera(x,y,z){
    cam.x=cam.tx=x;cam.y=cam.ty=y;cam.zoom=cam.tzoom=z;cam.cine=0;
  }
  function playChapter2Footstep(f){
    try{
      if(typeof SFX!=='undefined'&&SFX.on&&SFX.ctx){
        const heavy=f.id==='sukuna';
        SFX.noise(heavy?0.075:0.055,heavy?0.042:0.028,heavy?300:520,0.9);
        SFX.tone(heavy?72:108,heavy?0.085:0.055,'sine',heavy?0.035:0.022,heavy?38:62);
      }
    }catch(_){}
  }
  function clearChapter2Gait(f){
    if(!f)return;
    f.storyCineGait=null;f.storyCineGaitPhase=0;
    f.walk=0;f.vx=0;f.vy=0;f.state='IDLE';f.stateFrame=0;
  }
  function safeStore(key,value){try{localStorage.setItem(key,String(value));}catch(e){}}
  function story2Unlocked(){
    try{return localStorage.getItem('jff_story_ch1_complete')==='1'||localStorage.getItem('jff_story_unlocked_ch2')==='1';}
    catch(e){return false;}
  }
  function chapter2Checkpoint(name){
    if(!G.story)return;
    G.story.checkpoint=G.story.phase;
    safeStore('jff_story_ch2_checkpoint',G.story.checkpoint);
    safeStore('jff_story_ch2_checkpoint_name',name);
  }
  function resetChapter2Transient(){
    G.ch1Cine=null;
    G.storyIntro=null;
    G.ch2Cine=null;
    G.startupCine=null;
    G.presenceCine=null;
    G.presenceFx=null;
    G.storyArchiveNotice=false;
    G.matchOverScreen=false;
    const dlg=document.getElementById('dialogue');
    if(dlg)dlg.classList.remove('on');
  }
  function startStoryChapter2(){
    try{if(typeof SFX!=='undefined'&&SFX.init){SFX.init();if(SFX.ctx&&SFX.ctx.state==='suspended')SFX.ctx.resume();}}catch(_){}
    if(!story2Unlocked()){
      if(typeof showStoryArchiveNotice==='function')showStoryArchiveNotice('CHAPTER 2 IS LOCKED. COMPLETE CHAPTER 1 FIRST.\n\nWIN CHAPTER 1 TO UNLOCK RISING CONFLICT.\n\nPRESS ENTER / SPACE / ESC TO CLOSE.');
      return false;
    }
    resetChapter2Transient();
    // Set the Story guard before startMatch calls resetRound, preventing a generic
    // character-intro sequence from being layered on top of this chapter's film.
    G.story={chapter:2,p1:'yuta',act:0,phase:0,cutscene:true,clashStarted:false,clashResolved:false,ending:null,checkpoint:0,flags:{clean:true,clashWinner:null}};
    G.storyCutscene=true;
    safeStore('jff_story_ch2_started','1');
    startMatch('story','yuta','sukuna','hard');
    G.mode='story';G.storyCutscene=true;G.story.cutscene=true;
    G.roundState='intro';G.roundTimer=999999;G.matchOver=false;G.winner=null;G.paused=false;
    const hero=G.fighters[0],boss=G.fighters[1];
    if(!hero||!boss){G.storyCutscene=false;G.story.cutscene=false;G.mode='menu';showScreen('menu');return false;}
    hero.x=430;hero.y=GROUND;hero.vx=0;hero.vy=0;hero.facing=1;hero.state='IDLE';hero.stateFrame=0;hero.animT=0;hero.walk=0;
    boss.x=1770;boss.y=GROUND;boss.vx=0;boss.vy=0;boss.facing=-1;boss.state='IDLE';boss.stateFrame=0;boss.animT=0;boss.walk=0;
    hero.storyCineGait='yuta-ready';hero.storyCineGaitPhase=0;
    boss.storyCineGait='sukuna-calm';boss.storyCineGaitPhase=Math.PI*0.18;
    // A modest boss-health buffer makes all four story beats attainable without
    // turning the encounter into a damage sponge.
    boss.maxHp=Math.round(boss.maxHp*1.18);boss.hp=boss.maxHp;
    hero.awakenGlow=0;boss.awakenGlow=0;
    G.ch2Cine={active:true,t:0,phase:-1,subtitle:'',who:'',taunt:'',flash:0,startYuta:430,endYuta:930,startSukuna:1770,endSukuna:1270,lastYutaStep:0,lastSukunaStep:0,clashHit:false};
    cam.x=1100;cam.y=430;cam.zoom=1;cam.tx=1100;cam.ty=430;cam.tzoom=1;cam.cine=0;
    G.flash=1;G.flashColor='#000000';
    return true;
  }
  window.startStoryChapter2=startStoryChapter2;

  function abortChapter2Cine(){
    G.ch2Cine=null;G.storyCutscene=false;G.story=null;G.fighters=[];
    G.mode='menu';G.roundState='intro';G.matchOver=false;G.matchOverScreen=false;G.paused=false;
    const dlg=document.getElementById('dialogue');if(dlg)dlg.classList.remove('on');
    showScreen('menu');
  }
  function enterChapter2Phase(i){
    const c=G.ch2Cine;if(!c)return;
    c.phase=i;c.subtitle='';c.who='';c.taunt='';
    const y=G.fighters[0],s=G.fighters[1];
    if(i===0){
      c.subtitle='AFTERMATH  /  SHINJUKU';
      y.state='IDLE';s.state='IDLE';
      y.storyCineGait='yuta-ready';s.storyCineGait='sukuna-calm';
      setChapter2Camera(1100,458,0.82);
    }else if(i===1){
      c.subtitle='YUTA OKKOTSU';
      y.state='IDLE';s.state='IDLE';
      y.storyCineGait='yuta-ready';s.storyCineGait='sukuna-calm';
      flash(0.12,'#170e24');
      setChapter2Camera(y.x+8,430,1.48);
    }else if(i===2){
      c.subtitle='RYOMEN SUKUNA';
      y.state='IDLE';s.state='IDLE';
      y.storyCineGait='yuta-ready';s.storyCineGait='sukuna-calm';
      s.awakenGlow=12;
      SFX.cleaveGrab();
      setChapter2Camera(s.x-12,430,1.46);
    }else if(i===3){
      c.subtitle='THE DISTANCE CLOSES';
      y.state='WALK';s.state='WALK';
      y.storyCineGait='yuta-walk';s.storyCineGait='sukuna-walk';
      y.storyCineGaitPhase=-Math.PI/2;s.storyCineGaitPhase=Math.PI/2;
      c.lastYutaStep=0;c.lastSukunaStep=0;
      setChapter2Camera(1100,440,0.86);
    }else if(i===4){
      c.subtitle='COPY  AGAINST  CALAMITY';
      y.state='IDLE';s.state='IDLE';
      y.storyCineGait='yuta-brace';s.storyCineGait='sukuna-brace';
      y.storyCineGaitPhase=0;s.storyCineGaitPhase=0;
      y.x=930;s.x=1270;y.vx=0;s.vx=0;y.facing=1;s.facing=-1;
      y.awakenGlow=20;s.awakenGlow=24;
      shake(4);camPunch(0.08);
      setChapter2Camera(1100,438,0.94);
    }else if(i===5){
      c.subtitle='FIRST EXCHANGE';
      y.state='IDLE';s.state='IDLE';
      y.storyCineGait='yuta-strike';s.storyCineGait='sukuna-counter';
      y.storyCineGaitPhase=0;s.storyCineGaitPhase=0;
      y.x=930;s.x=1270;y.facing=1;s.facing=-1;
      setChapter2Camera(1100,430,1.00);
    }else if(i===6){
      c.subtitle='CHAPTER 2  •  RISING CONFLICT';
      clearChapter2Gait(y);clearChapter2Gait(s);
      y.x=930;s.x=1270;y.facing=1;s.facing=-1;
      flash(0.72,'#ffffff');shake(10);camPunch(0.16);SFX.ui();
      floatText(1100,GROUND-250,'FIGHT!','#ffffff',46,100);
      setChapter2Camera(1100,430,0.86);
    }
  }
  function finishChapter2Cine(){
    if(!G.ch2Cine)return;
    const y=G.fighters[0],s=G.fighters[1];
    if(y&&s){
      clearChapter2Gait(y);clearChapter2Gait(s);
      y.x=930;s.x=1270;y.facing=1;s.facing=-1;
      y.y=GROUND;s.y=GROUND;y.awakenGlow=0;s.awakenGlow=0;
    }
    G.storyCutscene=false;G.story.cutscene=false;
    G.story.phase=1;G.story.act=0;
    G.roundState='fight';G.roundTimer=0;
    chapter2Checkpoint('PROLOGUE');
    setChapter2Camera(1100,430,0.86);
    flash(0.24,'#ffffff');
    G.ch2Cine=null;
  }
  function tickChapter2Cine(){
    const c=G.ch2Cine;if(!c||!c.active||G.mode!=='story'||!G.fighters||G.fighters.length<2)return;
    c.t+=1/60;
    const i=phaseAt(c.t);
    if(i!==c.phase)enterChapter2Phase(i);
    const y=G.fighters[0],s=G.fighters[1];
    y.animT+=1.15;s.animT+=0.82;y.stateFrame++;s.stateFrame++;
    if(i===0){
      const q=phaseNorm(c.t,0);
      setChapter2Camera(1118-36*q,458+Math.sin(q*Math.PI)*-5,0.82+q*0.015);
    }else if(i===1){
      const q=phaseNorm(c.t,1);
      setChapter2Camera(y.x+8,430,1.48+Math.sin(q*Math.PI)*0.025);
      y.storyCineGaitPhase=Math.sin(c.t*1.2)*0.10;
      s.storyCineGaitPhase+=0.012;
      if(Math.floor(c.t*60)%13===0)spark(y.x+48,GROUND-90,1,'#f4eaff',1,2,7,0);
    }else if(i===2){
      const q=phaseNorm(c.t,2);
      setChapter2Camera(s.x-12,430,1.46+Math.sin(q*Math.PI)*0.035);
      s.storyCineGaitPhase+=0.018;
      if(Math.floor(c.t*60)%10===0)spark(s.x+rnd(-22,22),GROUND-rnd(70,125),1,'#ff5967',1,3,10,0);
    }else if(i===3){
      const q=phaseNorm(c.t,3),e=easeInOut(q);
      y.x=c.startYuta+(c.endYuta-c.startYuta)*e;
      s.x=c.startSukuna+(c.endSukuna-c.startSukuna)*e;
      y.storyCineGaitPhase=-Math.PI/2+e*Math.PI*6;
      s.storyCineGaitPhase=Math.PI/2+e*Math.PI*6;
      y.walk=1;s.walk=1;
      setChapter2Camera(1100+Math.sin(q*Math.PI)*3,440,0.86+0.10*e);
      const ys=Math.floor(e*6+0.001),ss=Math.floor(e*6+0.001);
      if(ys>c.lastYutaStep){
        c.lastYutaStep=ys;playChapter2Footstep(y);
        spark(y.x,GROUND-7,4,'#beb4d0',1.4,3.8,13,0);
        if(ys%2===0)spark(y.x+8,GROUND-5,2,'#c9a6ff',1,2.2,9,0);
      }
      if(ss>c.lastSukunaStep){
        c.lastSukunaStep=ss;playChapter2Footstep(s);
        spark(s.x,GROUND-7,5,'#a7a0a4',1.8,4.2,15,0);
        if(ss%2===0)spark(s.x-8,GROUND-5,2,'#ff4358',1,2.4,9,0);
      }
    }else if(i===4){
      const q=phaseNorm(c.t,4);
      y.storyCineGaitPhase+=0.026;s.storyCineGaitPhase+=0.014;
      setChapter2Camera(1100+Math.sin(q*8)*1.2,438,0.94+Math.sin(q*4)*0.006);
      if(Math.floor(c.t*60)%19===0)spark(1100+rnd(-110,110),GROUND-rnd(18,82),1,rnd(0,1)>.5?'#c9a6ff':'#ff4558',1,2.6,12,0);
    }else if(i===5){
      const q=phaseNorm(c.t,5);
      const lunge=Math.sin(Math.PI*q)*16;
      y.x=930+lunge;s.x=1270-lunge;
      y.storyCineGaitPhase=q*Math.PI;s.storyCineGaitPhase=q*Math.PI;
      setChapter2Camera(1100,430,1.00+Math.sin(q*Math.PI)*0.018);
      if(!c.clashHit&&q>=0.42){
        c.clashHit=true;
        flash(0.22,'#e9ddff');shake(12);camPunch(0.19);SFX.clash();
        burst(1100,GROUND-96,26,'#d9c1ff',6,12,28);
        burst(1100,GROUND-72,20,'#ff4059',5,10,23);
      }
    }else if(i===6){
      const q=phaseNorm(c.t,6);
      setChapter2Camera(1100,430,0.86);
      if(q<0.22)y.storyCineGaitPhase+=0.035;
    }
    if(c.t>=9.80)finishChapter2Cine();
  }
  function drawChapter2Cine(){
    const c=G.ch2Cine;if(!c||!c.active||G.mode!=='story')return;
    const t=c.t,i=phaseAt(t),q=phaseNorm(t,i);
    ctx.save();
    const bar=54;
    ctx.fillStyle='#020307';ctx.fillRect(0,0,W,bar);ctx.fillRect(0,H-bar,W,bar);
    const shade=ctx.createRadialGradient(W/2,H/2,160,W/2,H/2,760);
    shade.addColorStop(0,'rgba(0,0,0,0.02)');shade.addColorStop(1,'rgba(0,0,0,0.56)');
    ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);

    if(i===0){
      // Establish the damaged battlefield with restrained, screen-space slash scars.
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.12+Math.sin(t*3)*0.025;
      ctx.strokeStyle='#9a9eaa';ctx.lineWidth=2;
      const drift=t*18;
      for(let k=0;k<5;k++){
        const x=(k*287+drift)%(W+160)-80, y=H*0.64+(k%3)*24;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+72,y-13);ctx.stroke();
      }
      ctx.globalAlpha=0.22;ctx.strokeStyle='#ff394d';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(W*0.32,H*0.71);ctx.lineTo(W*0.44,H*0.66);ctx.stroke();
      ctx.restore();
      const fade=Math.min(clamp01(t/0.18),clamp01((1.05-t)/0.2));
      ctx.globalAlpha=fade;ctx.textAlign='left';
      ctx.font='800 12px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#aebbd0';
      ctx.fillText('JUJUTSU FIGHT  /  SHINJUKU AFTERMATH',34,H-92);
      ctx.font='900 25px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#f4f1fa';
      ctx.fillText('RISING CONFLICT',34,H-58);
      ctx.fillStyle='#c9a6ff';ctx.fillRect(34,H-46,96,2);
    }else if(i===1){
      // Character identification is a small editorial caption, not a copied title card.
      ctx.globalAlpha=clamp01(q*4);
      ctx.textAlign='left';ctx.font='900 14px "Segoe UI",system-ui,sans-serif';
      ctx.fillStyle='#c9a6ff';ctx.fillText('YUTA OKKOTSU',34,H-91);
      ctx.fillStyle='#f1edf8';ctx.font='600 17px "Segoe UI",system-ui,sans-serif';
      ctx.fillText('“I won’t let you pass.”',34,H-62);
      ctx.fillStyle='rgba(201,166,255,0.8)';ctx.fillRect(34,H-49,64,2);
      // Fine glint on the blade shot.
      const gx=W*0.59+Math.sin(t*8)*3,gy=H*0.58;
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.28+Math.sin(t*24)*0.13;
      ctx.strokeStyle='#f4eeff';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(gx-17,gy+5);ctx.lineTo(gx+19,gy-5);ctx.stroke();
      ctx.beginPath();ctx.moveTo(gx,gy-12);ctx.lineTo(gx,gy+12);ctx.stroke();
      ctx.restore();
    }else if(i===2){
      // Red slash wipe reveals Sukuna without cutting to a full black screen.
      const wipe=clamp01(q*1.55);
      ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=0.35*(1-q*0.55);ctx.strokeStyle='#ff334c';ctx.lineWidth=2+wipe*3;
      ctx.beginPath();ctx.moveTo(W*(0.18+0.44*q),H*0.25);ctx.lineTo(W*(0.86-0.12*q),H*0.66);ctx.stroke();
      ctx.globalAlpha=0.12;ctx.strokeStyle='#ff9aa7';ctx.lineWidth=10;
      ctx.beginPath();ctx.moveTo(W*(0.18+0.44*q),H*0.25);ctx.lineTo(W*(0.86-0.12*q),H*0.66);ctx.stroke();
      ctx.restore();
      ctx.globalAlpha=clamp01(q*3);ctx.textAlign='right';
      ctx.font='900 14px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#ff6576';
      ctx.fillText('RYOMEN SUKUNA',W-34,H-72);
      ctx.fillStyle='rgba(255,65,90,0.85)';ctx.fillRect(W-151,H-57,117,2);
    }else if(i===3){
      // Keep the screen clean so the actual footwork is the focus.
      const e=easeInOut(q);
      ctx.globalAlpha=0.78;ctx.textAlign='left';
      ctx.font='800 11px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#d9c6f9';
      ctx.fillText('YUTA',30,H-74);
      ctx.textAlign='right';ctx.fillStyle='#ff8b98';ctx.fillText('SUKUNA',W-30,H-74);
      ctx.globalAlpha=0.18;ctx.strokeStyle='#e4d7ff';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(30,H-58);ctx.lineTo(30+140*e,H-58);ctx.stroke();
      ctx.strokeStyle='#ff6476';ctx.beginPath();ctx.moveTo(W-30,H-58);ctx.lineTo(W-30-140*e,H-58);ctx.stroke();
    }else if(i===4){
      ctx.globalAlpha=0.94;ctx.textAlign='center';
      ctx.font='900 15px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#f0eafc';
      ctx.fillText('COPY  /  CURSE  /  CONVICTION',W/2,95);
      ctx.globalAlpha=0.2+Math.sin(t*9)*0.05;
      ctx.strokeStyle='#c9a6ff';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(W/2-180,H*0.44);ctx.lineTo(W/2-95,H*0.44);ctx.stroke();
      ctx.strokeStyle='#ff455d';ctx.beginPath();ctx.moveTo(W/2+95,H*0.44);ctx.lineTo(W/2+180,H*0.44);ctx.stroke();
    }else if(i===5){
      // Slash and blade flash land at the center on the same frame as the impact VFX.
      const hit=clamp01((q-0.30)/0.38);
      if(hit>0&&hit<1){
        ctx.save();ctx.globalCompositeOperation='lighter';
        ctx.globalAlpha=Math.sin(hit*Math.PI)*0.9;
        const g=ctx.createLinearGradient(W*0.34,H*0.60,W*0.68,H*0.40);
        g.addColorStop(0,'rgba(201,166,255,0)');g.addColorStop(0.43,'rgba(234,220,255,0.9)');
        g.addColorStop(0.56,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,55,82,0)');
        ctx.strokeStyle=g;ctx.lineWidth=7;ctx.beginPath();
        ctx.moveTo(W*0.34,H*0.60);ctx.lineTo(W*0.68,H*0.40);ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,0.52)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(W*0.38,H*0.61);ctx.lineTo(W*0.66,H*0.43);ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha=0.84;ctx.textAlign='center';ctx.font='800 11px "Segoe UI",system-ui,sans-serif';
      ctx.fillStyle='#e7dcff';ctx.fillText('FIRST EXCHANGE',W/2,H-73);
    }else{
      const a=clamp01(q*2.7);
      ctx.textAlign='center';ctx.globalAlpha=a;
      ctx.font='900 '+Math.round(58+6*q)+'px Impact,"Segoe UI",sans-serif';
      ctx.lineWidth=7;ctx.strokeStyle='rgba(0,0,0,0.72)';ctx.strokeText('FIGHT',W/2,H/2+20);
      ctx.fillStyle='#fff';ctx.fillText('FIGHT',W/2,H/2+20);
      ctx.fillStyle='rgba(255,55,80,'+Math.max(0,0.13-q*0.16)+')';ctx.fillRect(0,0,W,H);
    }
    // Subtle transition fade at the end, not a sustained white flash.
    if(i===6){ctx.globalAlpha=Math.max(0,0.32-q*1.05);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);}
    ctx.restore();
  }
  function updateChapter2Phases(){
    if(G.mode!=='story'||!G.story||G.story.chapter!==2||G.story.cutscene||G.storyCutscene||G.matchOver||G.clash)return;
    const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];
    if(!y||!s||!y.maxHp||!s.maxHp)return;
    const bossHp=s.hp/s.maxHp;
    const heroHp=y.hp/y.maxHp;
    if(heroHp<=0.25)G.story.flags.clean=false;
    if(s.hp>0&&G.story.phase===1&&bossHp<=0.72){
      G.story.phase=2;G.story.act=1;chapter2Checkpoint('KING_ADAPTS');
      s.awakened=true;s.awakenGlow=58;s.meter=Math.min(100,s.meter+38);s.energy=Math.min(s.maxEnergy,s.energy+18);
      flash(0.78,'#ff3344');shake(18);camPunch(0.22);SFX.awaken();
      storyBattlePause('KING ADAPTS','RYOMEN SUKUNA','Enough warm-up. Now survive the real fight.',1250);
      return;
    }
    if(s.hp>0&&G.story.phase===2&&bossHp<=0.45){
      G.story.phase=3;G.story.act=2;chapter2Checkpoint('RIKA_SYNCHRONIZATION');
      y.rikaTimer=Math.max(y.rikaTimer||0,240);y.meter=Math.max(y.meter,55);y.energy=Math.max(y.energy,55);
      flash(0.9,'#c9a6ff');shake(15);camPunch(0.22);
      ring(y.x,y.y-70,'#c9a6ff',120,42);burst(y.x,y.y-70,32,'#c9a6ff',8,13,34);SFX.rika();
      storyBattlePause('RIKA SYNCHRONIZATION','YUTA OKKOTSU','Rika. Stay with me. We end this together.',1400,()=>{
        if(G.mode==='story'&&G.story&&G.story.chapter===2&&G.fighters[0])G.fighters[0].rikaTimer=Math.max(G.fighters[0].rikaTimer||0,240);
      });
      return;
    }
    if(s.hp>0&&G.story.phase===3&&bossHp<=0.18){
      G.story.phase=4;G.story.act=3;chapter2Checkpoint('FINAL_EXCHANGE');
      y.meter=100;y.energy=Math.max(y.energy,75);s.meter=Math.max(s.meter,80);
      flash(0.92,'#ffffff');shake(22);camPunch(0.26);SFX.clash();
      storyBattlePause('FINAL EXCHANGE','YUTA OKKOTSU','I will decide how this fight ends.',1050);
    }
  }
  function showChapter2Ending(){
    const dlg=document.getElementById('dialogue');if(!dlg)return;
    const y=G.fighters&&G.fighters[0];
    const success=!!(y&&G.winner===y&&y.hp>0);
    const clean=!!(G.story&&G.story.flags&&G.story.flags.clean);
    let title=success?'CHAPTER 2 COMPLETE':'CHAPTER 2 FAILED';
    let copy=success?'Sukuna has been forced back. The conflict is far from over.':'The encounter is unfinished. Retry and find a better opening.';
    if(success&&clean){title='CHAPTER 2 COMPLETE  •  CLEAN ROUTE';copy='Yuta wins without falling below 25% HP. Your clean-route result has been recorded. The campaign advances.';}
    dlg.querySelector('.who').textContent=title;
    dlg.querySelector('.say').textContent=copy+'\n\nPRESS R TO RETRY CHAPTER 2 · ENTER / SPACE / ESC TO RETURN.';
    dlg.classList.add('on');G.matchOverScreen=true;
    if(G.story)G.story.ending=success?'victory':'defeat';
    if(success){
      safeStore('jff_story_ch2_complete','1');
      safeStore('jff_story_unlocked_ch3','1');
      if(typeof syncStoryArchive==='function')syncStoryArchive();
    }
  }

  // The base step still runs the entire combat simulation. Chapter 1's threshold
  // callbacks are suppressed only while this chapter owns the Story state.
  const baseChapter1Event=window.triggerChapter1Event||function(){};
  const baseChapter1Clash=window.handleChapter1ClashResolution||function(){};
  window.triggerChapter1Event=function(){
    if(G.mode==='story'&&G.story&&G.story.chapter===2)return;
    return baseChapter1Event.apply(this,arguments);
  };
  window.handleChapter1ClashResolution=function(){
    if(G.mode==='story'&&G.story&&G.story.chapter===2)return;
    return baseChapter1Clash.apply(this,arguments);
  };
  window.step=function(){
    baseStep.apply(this,arguments);
    if(G.ch2Cine&&G.ch2Cine.active&&G.mode==='story')tickChapter2Cine();
    else updateChapter2Phases();
  };
  window.render=function(){
    baseRender.apply(this,arguments);
    if(G.ch2Cine&&G.ch2Cine.active)drawChapter2Cine();
  };
  showResult=function(){
    if(G.mode==='story'&&G.story&&G.story.chapter===2){showChapter2Ending();return;}
    baseShowResult.apply(this,arguments);
  };
  MenuKey=function(code){
    if(G.ch2Cine&&G.ch2Cine.active&&G.mode==='story'){
      if(code==='Escape'){abortChapter2Cine();return;}
      if(code==='Enter'||code==='Space'){finishChapter2Cine();return;}
      return;
    }
    if(G.mode==='menu'&&screens.storySelect.classList.contains('on')&&(code==='Digit3'||code==='Numpad3')){
      startStoryChapter2();return;
    }
    if(G.mode==='story'&&G.story&&G.story.chapter===2&&G.matchOverScreen){
      if(code==='KeyR'){startStoryChapter2();return;}
      if(code==='Enter'||code==='Space'||code==='Escape'){G.story=null;hideResult();return;}
      return;
    }
    if(G.mode==='story'&&G.story&&G.story.chapter===2&&G.story.cutscene)return;
    baseMenuKey.apply(this,arguments);
  };

  window.JFF_STORY_CHAPTER2={version:2,start:startStoryChapter2,get active(){return !!(G.mode==='story'&&G.story&&G.story.chapter===2);},get cinematic(){return !!(G.ch2Cine&&G.ch2Cine.active);}};
  console.info('[JFF Story Chapter 2] Rising Conflict controller ready.');
})();