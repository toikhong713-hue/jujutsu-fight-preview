'use strict';
/* ===== STORY CINEMATIC ISOLATION PATCH =====
   One deterministic controller. No story timers, no shared cinematic overlay,
   and no Story state leakage into other modes. */
(function(){
  if(window.__JFF_STORY_CINE_CLEAN__) return;
  window.__JFF_STORY_CINE_CLEAN__=true;
  const GAME_STEP = step;
  const GAME_RENDER = render;
  const GAME_DRAW_UI = drawUI;
  const GAME_SHOW_RESULT = showResult;
  const GAME_MENU_KEY = MenuKey;
  const PHASES=[
    {a:0.00,b:0.95,n:'TITLE'},
    {a:0.95,b:4.05,n:'GOJO_ENTRY'},
    {a:4.05,b:5.95,n:'GOJO_TAUNT'},
    {a:5.95,b:6.85,n:'CUT_TO_BLACK'},
    {a:6.85,b:9.95,n:'SUKUNA_ENTRY'},
    {a:9.95,b:11.85,n:'SUKUNA_TAUNT'},
    {a:11.85,b:13.65,n:'FACE_OFF'},
    {a:13.65,b:14.75,n:'FIGHT'}
  ];
  const clamp01=v=>Math.max(0,Math.min(1,v));
  const phaseAt=t=>{for(let i=PHASES.length-1;i>=0;i--)if(t>=PHASES[i].a)return i;return 0;};
  const pnorm=(t,i)=>clamp01((t-PHASES[i].a)/(PHASES[i].b-PHASES[i].a));
  const easeOut=t=>1-Math.pow(1-clamp01(t),3);
  function clearStoryCine(){
    G.storyCutscene=false;
    G.ch1Cine=null;
    G.storyIntro=null;
    if(G.story)G.story.cutscene=false;
    const dlg=document.getElementById('dialogue');
    if(dlg)dlg.classList.remove('on');
    G.matchOverScreen=false;
  }
  function abortStoryCine(){
    clearStoryCine();
    G.fighters=[];
    G.mode='menu';
    G.roundState='intro';
    G.matchOver=false;
    G.paused=false;
    showScreen('menu');
  }
  function beginStoryChapter1(p1Char='gojo'){
    clearStoryCine();
    const protagonist=p1Char==='young_gojo'?'young_gojo':'gojo';
    G.story={chapter:1,p1:protagonist,act:0,phase:0,cutscene:true,clashStarted:false,clashResolved:false,ending:null,checkpoint:0,flags:{clean:true,clashWinner:null}};
    try{localStorage.setItem('jff_story_ch1_started','1');}catch(e){}
    startMatch('story',protagonist,'sukuna','hard');
    G.mode='story';G.storyCutscene=true;G.story.cutscene=true;
    G.roundState='intro';G.roundTimer=999999;G.matchOver=false;
    const hero=G.fighters[0],sukuna=G.fighters[1];
    hero.x=620;hero.y=GROUND;hero.vx=0;hero.vy=0;hero.facing=1;hero.state='IDLE';hero.stateFrame=0;hero.animT=0;hero.walk=0;
    sukuna.x=2440;sukuna.y=GROUND;sukuna.vx=0;sukuna.vy=0;sukuna.facing=-1;sukuna.state='IDLE';sukuna.stateFrame=0;sukuna.animT=0;sukuna.walk=0;
    hero.awakenGlow=0;sukuna.awakenGlow=0;
    G.ch1Cine={active:true,t:0,phase:-1,subtitle:'',who:'',taunt:'',flash:0,heroId:protagonist};
    cam.x=1100;cam.y=430;cam.zoom=1;cam.tx=1100;cam.ty=430;cam.tzoom=1;cam.cine=0;
    G.flash=1;G.flashColor='#000000';
  }
  function enterPhase(i){
    const c=G.ch1Cine;if(!c)return;
    c.phase=i;c.subtitle='';c.who='';c.taunt='';
    const g=G.fighters[0],s=G.fighters[1];
    if(i===0){
      c.subtitle='CHAPTER 1  •  ENCOUNTER';
      g.state='IDLE';s.state='IDLE';
    }else if(i===1){
      c.subtitle='POV 01  •  '+(g.id==='young_gojo'?'YOUNG GOJO':'GOJO SATORU');
      g.state='WALK';g.walk=1;s.state='IDLE';s.walk=0;
      flash(0.55,'#05060a');
    }else if(i===2){
      const young=g.id==='young_gojo';
      c.subtitle=young?'THE LIMITLESS PRODIGY':'THE STRONGEST';c.who=young?'YOUNG GOJO':'GOJO SATORU';
      c.taunt=young?'You are the curse everyone fears? Let us find out.':'Still standing there? I came all this way.';
      g.state='IDLE';g.walk=0;g.awakenGlow=45;
      ring(g.x,g.y-70,young?'#bfe8ff':'#7fd8ff',76,28);burst(g.x,g.y-70,20,young?'#8fdcff':'#4fc3f7',8,11,28);SFX.ui();
    }else if(i===3){
      flash(1,'#000000');
    }else if(i===4){
      c.subtitle='POV 02  •  RYOMEN SUKUNA';
      s.state='WALK';s.walk=1;g.state='IDLE';g.walk=0;
      flash(0.55,'#120308');
    }else if(i===5){
      c.subtitle='THE KING OF CURSES';c.who='RYOMEN SUKUNA';
      c.taunt='You came to test a legend. Try not to break first.';
      s.state='IDLE';s.walk=0;s.awakenGlow=48;
      ring(s.x,s.y-70,'#ff3344',82,30);burst(s.x,s.y-70,22,'#ff4455',8,12,32);SFX.cleaveGrab();
    }else if(i===6){
      c.subtitle='THE BATTLEFIELD';
      g.state='IDLE';s.state='IDLE';g.walk=0;s.walk=0;g.x=930;s.x=1270;g.facing=1;s.facing=-1;
      flash(0.30,'#ffffff');shake(8);camPunch(0.12);
    }else if(i===7){
      c.subtitle='CHAPTER 1  •  ENCOUNTER';
      flash(0.82,'#ffffff');shake(12);camPunch(0.18);SFX.ui();
      floatText(1100,GROUND-250,'FIGHT!','#ffffff',46,100);
    }
  }
  function finishStoryCine(){
    const c=G.ch1Cine;if(!c)return;
    c.active=false;
    const g=G.fighters[0],s=G.fighters[1];
    g.x=930;s.x=1270;g.facing=1;s.facing=-1;
    g.state='IDLE';s.state='IDLE';g.walk=0;s.walk=0;g.awakenGlow=0;s.awakenGlow=0;
    G.storyCutscene=false;
    G.story.cutscene=false;
    G.story.phase=1;
    G.story.act=1;
    G.story.checkpoint=1;
    localStorage.setItem('jff_story_ch1_checkpoint','1');
    localStorage.setItem('jff_story_ch1_checkpoint_name','PROLOGUE');
    G.roundState='fight';G.roundTimer=0;
    cam.x=1100;cam.y=430;cam.zoom=0.86;cam.tx=1100;cam.ty=430;cam.tzoom=0.86;cam.cine=0;
    flash(0.35,'#ffffff');
    G.ch1Cine=null;
  }
  function cineStep(){
    const c=G.ch1Cine;if(!c||!c.active||G.mode!=='story'||!G.fighters.length)return;
    c.t+=1/60;
    const i=phaseAt(c.t);
    if(i!==c.phase)enterPhase(i);
    const g=G.fighters[0],s=G.fighters[1];
    g.animT+=1.2;s.animT+=1.15;g.stateFrame++;s.stateFrame++;
    if(i===0){
      cam.x=1100;cam.y=430;cam.zoom=1.0;
    }else if(i===1){
      const q=easeOut(pnorm(c.t,1));
      g.x=430+(930-430)*q;g.state='WALK';
      cam.x=g.x+65;cam.y=432;cam.zoom=1.42;
      if(Math.floor(c.t*60)%10===0)ring(g.x,GROUND-8,'#7fd8ff',18,10);
    }else if(i===2){
      cam.x=g.x+15;cam.y=425;cam.zoom=1.60+Math.sin(pnorm(c.t,2)*Math.PI)*0.04;
      if(Math.floor(c.t*60)%8===0)spark(g.x+rnd(-18,18),g.y-rnd(70,125),2,'#7fd8ff',2,4,12,0);
    }else if(i===3){
      cam.x=1100;cam.y=430;cam.zoom=1.0;
    }else if(i===4){
      const q=easeOut(pnorm(c.t,4));
      s.x=1770+(1270-1770)*q;s.state='WALK';
      cam.x=s.x-65;cam.y=432;cam.zoom=1.42;
      if(Math.floor(c.t*60)%10===0)ring(s.x,GROUND-8,'#ff3344',18,10);
    }else if(i===5){
      cam.x=s.x-15;cam.y=425;cam.zoom=1.60+Math.sin(pnorm(c.t,5)*Math.PI)*0.04;
      if(Math.floor(c.t*60)%8===0)spark(s.x+rnd(-18,18),s.y-rnd(70,125),2,'#ff4455',2,4,12,0);
    }else if(i===6){
      g.state='IDLE';s.state='IDLE';g.x=930;s.x=1270;
      cam.x=1100;cam.y=430;cam.zoom=0.84;
    }else if(i===7){
      cam.x=1100;cam.y=430;cam.zoom=0.82;
    }
    if(c.t>=14.75)finishStoryCine();
  }
  function drawStoryCine(){
    const c=G.ch1Cine;if(!c||!c.active||G.mode!=='story')return;
    const t=c.t,i=phaseAt(t);
    ctx.save();
    const bar=66;
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,bar);ctx.fillRect(0,H-bar,W,bar);
    let dark=(i===0||i===3)?1:0.16;
    ctx.fillStyle='rgba(0,0,0,'+dark+')';ctx.fillRect(0,0,W,H);
    if(i===0){
      const q=clamp01(t/0.95);
      ctx.textAlign='center';ctx.globalAlpha=q;
      ctx.font='800 15px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#9db0ce';ctx.fillText('JUJUTSU FIGHT',W/2,H/2-48);
      ctx.font='900 54px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#fff';ctx.fillText('CHAPTER 1',W/2,H/2+16);
      ctx.font='800 18px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#9ec5ff';ctx.fillText('ENCOUNTER',W/2,H/2+52);
    }else{
      ctx.textAlign='left';ctx.globalAlpha=0.92;ctx.font='800 13px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#d8e5ff';ctx.fillText(c.subtitle||'CHAPTER 1  •  ENCOUNTER',34,H-92);
      if(c.taunt){
        const accent=(c.who==='GOJO SATORU'||c.who==='YOUNG GOJO')?'#7fd8ff':'#ff7a7a';
        const bx=58,by=H-170,bw=W-116,bh=70;
        ctx.globalAlpha=0.96;ctx.fillStyle='rgba(3,6,13,0.90)';ctx.fillRect(bx,by,bw,bh);
        ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(bx,by,bw,bh);
        ctx.textAlign='left';ctx.font='900 13px "Segoe UI",system-ui,sans-serif';ctx.fillStyle=accent;ctx.fillText(c.who,bx+20,by+24);
        ctx.font='700 18px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#fff';ctx.fillText(c.taunt,bx+20,by+52);
      }
      if(i===6){
        ctx.textAlign='center';ctx.globalAlpha=1;ctx.font='900 32px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#fff';ctx.fillText((G.fighters[0].id==='young_gojo'?'YOUNG GOJO':'GOJO SATORU')+'  VS  RYOMEN SUKUNA',W/2,110);
        ctx.font='700 13px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#b9c8df';ctx.fillText('THE STRONGEST  •  THE KING OF CURSES',W/2,135);
      }
      if(i===7){
        const q=pnorm(t,7),a=Math.min(1,q*1.6);ctx.textAlign='center';ctx.globalAlpha=a;ctx.font='900 '+Math.round(54+8*q)+'px Impact,"Segoe UI",sans-serif';ctx.fillStyle='#fff';ctx.fillText('FIGHT!',W/2,H/2+18);
      }
    }
    const vignette=ctx.createRadialGradient(W/2,H/2,170,W/2,H/2,720);
    vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,0.72)');
    ctx.globalAlpha=1;ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
    if(i===0){
      const fadeIn=clamp01(t/0.20),fadeOut=clamp01((0.95-t)/0.20);const a=Math.min(fadeIn,fadeOut);
      ctx.fillStyle='rgba(0,0,0,'+(1-a)+')';ctx.fillRect(0,0,W,H);
    }else if(i===3){
      ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
    }else if(i===7){
      const q=pnorm(t,7);ctx.fillStyle='rgba(255,255,255,'+Math.max(0,0.75-q*1.3)+')';ctx.fillRect(0,0,W,H);
    }
    ctx.restore();
  }
  function launchClean(mode,p1,p2){
    // Any non-Story launch is guaranteed to purge every Story cinematic state.
    clearStoryCine();
    if(mode!=='story')G.story=null;
    showScreen(null);
    if(mode==='story'){
      beginStoryChapter1(p1||'gojo');
      return;
    }
    if(mode==='survival')G.survivalRound=1;
    startMatch(mode,p1,p2,G.difficulty);
  }
  // Replace both entry points so every Story entry uses only the clean controller.
  launch=launchClean;
  startChapter1=beginStoryChapter1;
  showResult=function(){
    if(G.mode==='story'&&G.story){
      const hero=G.fighters&&G.fighters[0];
      showStoryEnding(!!(hero&&G.winner===hero&&hero.hp>0));
      return;
    }
    GAME_SHOW_RESULT.apply(this,arguments);
  };
  // Keep the base step for all modes. During Story Cine, base step freezes combat
  // because G.storyCutscene is true, then this deterministic tick advances the film.
  step=function(){
    GAME_STEP();
    if(G.ch1Cine&&G.ch1Cine.active&&G.mode==='story')cineStep();
  };
  drawUI=function(){
    if(G.ch1Cine&&G.ch1Cine.active&&G.mode==='story')return;
    GAME_DRAW_UI();
  };
  render=function(){
    GAME_RENDER();
    if(G.ch1Cine&&G.ch1Cine.active&&G.mode==='story')drawStoryCine();
  };
  MenuKey=function(code){
    if(G.ch1Cine&&G.ch1Cine.active&&G.mode==='story'){
      if(code==='Escape'){abortStoryCine();return;}
      if(code==='Enter'||code==='Space'){finishStoryCine();return;}
      return;
    }
    if(G.mode==='story'&&G.matchOverScreen){
      if(code==='KeyR'){
        beginStoryChapter1(G.story&&G.story.p1==='young_gojo'?'young_gojo':'gojo');
        return;
      }
      if(code==='Enter'||code==='Space'||code==='Escape'){
        G.story=null;hideResult();return;
      }
      return;
    }
    GAME_MENU_KEY(code);
  };
})();