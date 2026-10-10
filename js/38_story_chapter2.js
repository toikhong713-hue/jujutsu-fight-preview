'use strict';
/* ===== STORY CHAPTER 2: RISING CONFLICT =====
   Isolated chapter controller. It reuses the existing fighter simulation,
   lightweight 2D VFX, result shell and cinematic renderer.
*/
(function(){
  if(window.__JFF_STORY_CHAPTER2_V1__)return;
  window.__JFF_STORY_CHAPTER2_V1__=true;

  const baseStep=step;
  const baseRender=render;
  const baseMenuKey=MenuKey;
  const baseShowResult=showResult;

  const CH2_PHASES=[
    {a:0.00,b:0.90,n:'TITLE'},
    {a:0.90,b:3.15,n:'YUTA_ENTRY'},
    {a:3.15,b:4.35,n:'YUTA_TAUNT'},
    {a:4.35,b:4.90,n:'BLACKOUT'},
    {a:4.90,b:6.95,n:'SUKUNA_ENTRY'},
    {a:6.95,b:8.05,n:'SUKUNA_TAUNT'},
    {a:8.05,b:9.00,n:'FACE_OFF'},
    {a:9.00,b:9.80,n:'FIGHT'}
  ];
  const clamp01=v=>Math.max(0,Math.min(1,v));
  const easeOut=v=>1-Math.pow(1-clamp01(v),3);
  const phaseAt=t=>{for(let i=CH2_PHASES.length-1;i>=0;i--)if(t>=CH2_PHASES[i].a)return i;return 0;};
  const phaseNorm=(t,i)=>clamp01((t-CH2_PHASES[i].a)/(CH2_PHASES[i].b-CH2_PHASES[i].a));
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
    hero.x=430;hero.y=GROUND;hero.vx=0;hero.vy=0;hero.facing=1;hero.state='WALK';hero.stateFrame=0;hero.animT=0;hero.walk=1;
    boss.x=1770;boss.y=GROUND;boss.vx=0;boss.vy=0;boss.facing=-1;boss.state='IDLE';boss.stateFrame=0;boss.animT=0;boss.walk=0;
    // A modest boss-health buffer makes all four story beats attainable without
    // turning the encounter into a damage sponge.
    boss.maxHp=Math.round(boss.maxHp*1.18);boss.hp=boss.maxHp;
    hero.awakenGlow=0;boss.awakenGlow=0;
    G.ch2Cine={active:true,t:0,phase:-1,subtitle:'',who:'',taunt:'',flash:0};
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
      c.subtitle='CHAPTER 2  •  RISING CONFLICT';
      y.state='IDLE';s.state='IDLE';
    }else if(i===1){
      c.subtitle='POV 01  •  YUTA OKKOTSU';
      y.state='WALK';y.walk=1;s.state='IDLE';s.walk=0;
      flash(0.45,'#100b19');
    }else if(i===2){
      c.subtitle='THE COPYCAT';c.who='YUTA OKKOTSU';
      c.taunt='If you are still standing, then I am not finished.';
      y.state='IDLE';y.walk=0;y.awakenGlow=35;
      ring(y.x,y.y-70,'#c9a6ff',72,26);burst(y.x,y.y-70,18,'#c9a6ff',6,10,26);SFX.copy();
    }else if(i===3){
      flash(1,'#000000');
    }else if(i===4){
      c.subtitle='POV 02  •  RYOMEN SUKUNA';
      s.state='WALK';s.walk=1;y.state='IDLE';y.walk=0;
      flash(0.65,'#24070d');SFX.cleaveGrab();
    }else if(i===5){
      c.subtitle='THE KING OF CURSES';c.who='RYOMEN SUKUNA';
      c.taunt='So they sent the copycat. Show me what you copied.';
      s.state='IDLE';s.walk=0;s.awakenGlow=48;
      ring(s.x,s.y-70,'#ff3344',84,30);burst(s.x,s.y-70,22,'#ff4455',7,12,30);
    }else if(i===6){
      c.subtitle='TWO TECHNIQUES  •  ONE BATTLEFIELD';
      y.state='IDLE';s.state='IDLE';y.walk=0;s.walk=0;y.x=930;s.x=1270;y.facing=1;s.facing=-1;
      flash(0.38,'#ffffff');shake(9);camPunch(0.14);
    }else if(i===7){
      c.subtitle='CHAPTER 2  •  RISING CONFLICT';
      flash(0.82,'#ffffff');shake(13);camPunch(0.20);SFX.ui();
      floatText(1100,GROUND-250,'FIGHT!','#ffffff',46,100);
    }
  }
  function finishChapter2Cine(){
    if(!G.ch2Cine)return;
    const y=G.fighters[0],s=G.fighters[1];
    if(y&&s){
      y.x=930;s.x=1270;y.facing=1;s.facing=-1;
      y.state='IDLE';s.state='IDLE';y.walk=0;s.walk=0;
      y.awakenGlow=0;s.awakenGlow=0;
    }
    G.storyCutscene=false;G.story.cutscene=false;
    G.story.phase=1;G.story.act=0;
    G.roundState='fight';G.roundTimer=0;
    chapter2Checkpoint('PROLOGUE');
    cam.x=1100;cam.y=430;cam.zoom=0.84;cam.tx=1100;cam.ty=430;cam.tzoom=0.84;cam.cine=0;
    flash(0.32,'#ffffff');
    G.ch2Cine=null;
  }
  function tickChapter2Cine(){
    const c=G.ch2Cine;if(!c||!c.active||G.mode!=='story'||!G.fighters||G.fighters.length<2)return;
    c.t+=1/60;
    const i=phaseAt(c.t);
    if(i!==c.phase)enterChapter2Phase(i);
    const y=G.fighters[0],s=G.fighters[1];
    y.animT+=1.2;s.animT+=1.15;y.stateFrame++;s.stateFrame++;
    if(i===0){
      cam.x=1100;cam.y=430;cam.zoom=1.0;
    }else if(i===1){
      const q=easeOut(phaseNorm(c.t,1));
      y.x=430+(930-430)*q;y.state='WALK';y.walk=1;
      cam.x=y.x+65;cam.y=432;cam.zoom=1.38;
      if(Math.floor(c.t*60)%12===0)ring(y.x,GROUND-8,'#c9a6ff',22,12);
      if(Math.floor(c.t*60)%18===0)spark(y.x+rnd(-15,15),GROUND-rnd(3,10),3,'#d7baff',2,4,14,0);
    }else if(i===2){
      cam.x=y.x+15;cam.y=425;cam.zoom=1.55+Math.sin(phaseNorm(c.t,2)*Math.PI)*0.035;
      if(Math.floor(c.t*60)%9===0)spark(y.x+rnd(-20,20),y.y-rnd(55,130),2,'#c9a6ff',2,5,13,0);
    }else if(i===3){
      cam.x=1100;cam.y=430;cam.zoom=1.0;
    }else if(i===4){
      const q=easeOut(phaseNorm(c.t,4));
      s.x=1770+(1270-1770)*q;s.state='WALK';s.walk=1;
      cam.x=s.x-65;cam.y=432;cam.zoom=1.40;
      if(Math.floor(c.t*60)%9===0)ring(s.x,GROUND-8,'#ff3344',24,12);
      if(Math.floor(c.t*60)%14===0)spark(s.x+rnd(-24,24),GROUND-rnd(5,14),4,'#ff5566',2,5,18,0);
    }else if(i===5){
      cam.x=s.x-15;cam.y=425;cam.zoom=1.62+Math.sin(phaseNorm(c.t,5)*Math.PI)*0.035;
      if(Math.floor(c.t*60)%8===0)spark(s.x+rnd(-18,18),s.y-rnd(65,130),3,'#ff4455',2,5,14,0);
    }else if(i===6){
      y.state='IDLE';s.state='IDLE';y.walk=0;s.walk=0;y.x=930;s.x=1270;
      cam.x=1100;cam.y=430;cam.zoom=0.84;
    }else{
      cam.x=1100;cam.y=430;cam.zoom=0.82;
    }
    if(c.t>=9.80)finishChapter2Cine();
  }
  function drawChapter2Cine(){
    const c=G.ch2Cine;if(!c||!c.active||G.mode!=='story')return;
    const t=c.t,i=phaseAt(t);
    ctx.save();
    const bar=62;
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,bar);ctx.fillRect(0,H-bar,W,bar);
    const darkness=(i===0||i===3)?0.92:0.14;
    ctx.fillStyle='rgba(0,0,0,'+darkness+')';ctx.fillRect(0,0,W,H);
    if(i===0){
      const a=Math.min(clamp01(t/0.18),clamp01((0.90-t)/0.22));
      ctx.globalAlpha=a;
      ctx.textAlign='center';ctx.font='800 14px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#9daec7';
      ctx.fillText('JUJUTSU FIGHT  //  CAMPAIGN',W/2,H/2-56);
      ctx.font='900 52px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#fff';
      ctx.fillText('CHAPTER 2',W/2,H/2+8);
      ctx.font='800 18px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#c9a6ff';
      ctx.fillText('RISING CONFLICT',W/2,H/2+43);
    }else if(i===3){
      ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=0.6+Math.sin(t*28)*0.12;
      ctx.fillStyle='#ff3344';ctx.fillRect(W/2-1,0,2,H);
    }else{
      ctx.globalAlpha=0.9;ctx.textAlign='left';
      ctx.font='800 13px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#d8e5ff';
      ctx.fillText(c.subtitle||'CHAPTER 2  •  RISING CONFLICT',30,H-88);
      if(c.taunt){
        const accent=(c.who==='YUTA OKKOTSU')?'#c9a6ff':'#ff7a7a';
        const bx=56,by=H-165,bw=W-112,bh=65;
        ctx.globalAlpha=0.95;ctx.fillStyle='rgba(3,5,12,0.92)';ctx.fillRect(bx,by,bw,bh);
        ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(bx,by,bw,bh);
        ctx.font='900 12px "Segoe UI",system-ui,sans-serif';ctx.fillStyle=accent;ctx.fillText(c.who,bx+18,by+22);
        ctx.font='700 17px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#fff';ctx.fillText(c.taunt,bx+18,by+48);
      }
      if(i===6){
        ctx.textAlign='center';ctx.globalAlpha=1;ctx.font='900 30px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#fff';
        ctx.fillText('YUTA OKKOTSU  VS  RYOMEN SUKUNA',W/2,108);
        ctx.font='700 13px "Segoe UI",system-ui,sans-serif';ctx.fillStyle='#b9c8df';
        ctx.fillText('COPY  •  RIKA  •  MALEVOLENT SHRINE',W/2,132);
      }
      if(i===7){
        const q=phaseNorm(t,7);ctx.textAlign='center';ctx.globalAlpha=Math.min(1,q*1.7);
        ctx.font='900 '+Math.round(54+9*q)+'px Impact,"Segoe UI",sans-serif';ctx.fillStyle='#fff';
        ctx.fillText('FIGHT!',W/2,H/2+18);
        ctx.fillStyle='rgba(255,50,80,'+Math.max(0,0.22-q*0.32)+')';ctx.fillRect(0,0,W,H);
      }
    }
    const vignette=ctx.createRadialGradient(W/2,H/2,190,W/2,H/2,720);
    vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,0.68)');
    ctx.globalAlpha=1;ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
    if(i===7){const q=phaseNorm(t,7);ctx.fillStyle='rgba(255,255,255,'+Math.max(0,0.65-q*1.2)+')';ctx.fillRect(0,0,W,H);}
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

  window.JFF_STORY_CHAPTER2={version:1,start:startStoryChapter2,get active(){return !!(G.mode==='story'&&G.story&&G.story.chapter===2);},get cinematic(){return !!(G.ch2Cine&&G.ch2Cine.active);}};
  console.info('[JFF Story Chapter 2] Rising Conflict controller ready.');
})();