'use strict';
/* ===== STORY CHAPTER 3: AWAKENING / MOBILE DOMAIN CLASH =====
   Continues from Chapter 2's Gojo interception.
   Domain cinematic is deterministic; once domains collide, both fighters remain playable.
*/
(function(){
  if(window.__JFF_CH3_AWAKENING_V1__)return;
  window.__JFF_CH3_AWAKENING_V1__=true;
  const STEP=1/60;
  const mix=(a,b,t)=>a+(b-a)*t;
  const clamp01=v=>Math.max(0,Math.min(1,v));
  const ease=v=>{v=clamp01(v);return v*v*(3-2*v);};
  const chapter3=()=>G.story3&&G.story3.active?G.story3:null;
  const baseStep=window.step,baseRender=window.render,baseDrawUI=window.drawUI;
  const baseResult=window.showResult,baseMenuKey=MenuKey;
  const baseTriggerClash=window.triggerClash,baseActivateDomain=window.activateDomain;
  const baseTriggerChapter1=window.triggerChapter1Event,baseChapter1Clash=window.handleChapter1ClashResolution;
  const basePose=window.computePose;
  const camera=(x,y,z)=>{cam.x=cam.tx=x;cam.y=cam.ty=y;cam.zoom=cam.tzoom=z;cam.cine=0;};
  const safeStore=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
  const stored=(k)=>{try{return localStorage.getItem(k)==='1';}catch(e){return false;}};
  const play=(name)=>{try{if(SFX&&typeof SFX[name]==='function')SFX[name]();}catch(e){}};
  const stopVoice=()=>{try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(e){}};
  function speak(text,speaker){
    try{
      if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.92;u.volume=.82;
      u.pitch=speaker==='SUKUNA' ? .62 : (speaker==='GOJO' ? .78 : (speaker==='YUTA' ? 1.03 : .9));
      window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function line(c,key,speaker,text,color){
    if(c.lastLine===key)return;
    c.lastLine=key;c.caption={speaker,text,color};speak(text,speaker);
  }
  function resetActor(f,x,facing){
    if(!f)return;
    f.x=x;f.y=GROUND;f.vx=0;f.vy=0;f.facing=facing;f.walk=0;f.state='IDLE';f.stateFrame=0;f.animT=0;
    f.hitstun=0;f.move=null;f.moveKey=null;f.moveFrame=0;f.storyCinePose=null;f.storyCineRika=null;
    // Preserve AI objects. Cinematic ticks never run the combat simulation, so the CPU can safely remain attached.
  }
  function removeYutaProp(c){
    if(!c.yuta)return;
    G.fighters=G.fighters.filter(f=>f!==c.yuta);
    if(c.gojo)c.gojo.opp=c.sukuna;if(c.sukuna)c.sukuna.opp=c.gojo;
  }
  function addYutaProp(c){
    if(!c.yuta&&typeof createFighter==='function')c.yuta=createFighter('yuta',(c.openingCenter||1200)-250,1,true);
    const y=c.yuta;if(!y)return;
    y.ai=null;y.opp=c.gojo;y.x=ARENA_W/2-270;y.y=GROUND;y.vx=0;y.vy=0;y.facing=1;
    y.state='IDLE';y.stateFrame=0;y.animT=0;y.walk=0;y.storyCinePose='support';y.rikaTimer=0;y.move=null;y.hitstun=0;
    if(G.fighters.indexOf(y)<0)G.fighters.push(y);
  }
  function clearTransient(){
    G.storyCutscene=false;G.clash=null;G.domain=null;G.hakariCin=null;
    G.ch1Cine=null;G.storyIntro=null;G.startupCine=null;G.presenceCine=null;G.presenceFx=null;
    G.ch2EndingCine=null;G.ch2StoryboardV4=null;G.ch2CinematicV3=null;G.ch2Cine=null;
    G.flash=0;G.shake=0;G.shakeX=0;G.shakeY=0;G.zoomPunch=0;G.camPunch=0;cam.cine=0;stopVoice();
  }
  function setupOpening(c){
    c.stage='intro';c.t=0;c.phase='phase1';c.domainsActive=false;c.shrineVisible=false;
    G.storyCutscene=true;G.story.cutscene=true;G.roundState='intro';G.roundTimer=999999;
    G.matchOver=false;G.matchOverScreen=false;G.paused=false;G.winner=null;
    const center=c.openingCenter||1200;
    // Match Chapter 2's final blocking: Yuta 950, Gojo 1085, Sukuna 1320, camera 1110.
    resetActor(c.gojo,1085,1);resetActor(c.sukuna,1320,-1);
    c.gojo.ai=null;c.gojo.state='IDLE';c.gojo.storyCinePose='ch3-gojo-low-guard';
    c.sukuna.state='KNOCKDOWN';c.sukuna.storyCinePose='ch3-sukuna-recover';c.sukuna.awakenGlow=.65;
    addYutaProp(c);
    camera(1110,GROUND-120,.91);G.flash=.22;G.flashColor='#e4faff';G.shake=3;
  }
  function startChapter3(){
    if(!stored('jff_story_unlocked_ch3')&&!stored('jff_story_ch2_complete')){
      if(typeof showStoryArchiveNotice==='function')showStoryArchiveNotice('CHAPTER 3 IS LOCKED. COMPLETE CHAPTER 2 FIRST.\n\nPRESS ENTER / SPACE / ESC TO CLOSE.');
      return false;
    }
    clearTransient();
    G.story={chapter:3,p1:'gojo',act:0,phase:0,cutscene:true,clashStarted:false,clashResolved:false,ending:null,checkpoint:0,flags:{clean:true,clashWinner:null}};
    G.storyCutscene=true;
    startMatch('story','gojo','sukuna','hard');
    G.mode='story';G.story={chapter:3,p1:'gojo',act:0,phase:0,cutscene:true,clashStarted:false,clashResolved:false,ending:null,checkpoint:0,flags:{clean:true,clashWinner:null}};
    G.storyCutscene=true;G.story.cutscene=true;G.roundState='intro';G.roundTimer=999999;
    G.matchOver=false;G.matchOverScreen=false;G.winner=null;G.paused=false;
    const g=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];
    if(!g||!s){G.storyCutscene=false;G.story.cutscene=false;G.mode='menu';showScreen('storySelect');return false;}
    g.ai=null;
    const c={active:true,stage:'intro',t:0,phase:'phase1',gojo:g,sukuna:s,yuta:null,lastLine:'',caption:null,
      domainsActive:false,shrineVisible:false,shrineFade:0,domainStarted:false,endingStarted:false,completed:false,
      openingCenter:1200,shrineCenter:null,fromClash:false};
    G.story3=c;window.__JFF_CH3_ACTIVE__=c;
    safeStore('jff_story_ch3_started','1');setupOpening(c);
    console.info('[JFF Chapter 3] Awakening started; opening continues from the Chapter 2 interception.');
    return true;
  }
  window.startStoryChapter3=startChapter3;

  function beginDomainSequence(c,source){
    if(!c||!c.active||c.stage==='domainIntro'||c.stage==='ending'||c.stage==='complete')return false;
    c.stage='domainIntro';c.t=0;c.phase='domainClash';c.lastLine='';c.caption=null;c.fromClash=source==='simultaneous-ult';
    c.domainStarted=true;c.domainsActive=false;c.shrineVisible=false;c.shrineFade=0;
    G.story.phase=2;G.story.act=2;G.story.clashStarted=true;G.story.cutscene=true;
    G.storyCutscene=true;G.roundState='intro';G.roundTimer=999999;G.domain=null;G.clash=null;
    const center=c&&c.openingCenter?c.openingCenter:1200;
    c.shrineCenter=center+175; // Keep the shrine's apex directly under Sukuna's rise pose.
    resetActor(c.gojo,center-170,1);resetActor(c.sukuna,center+170,-1);
    c.gojo.storyCinePose='guard';c.sukuna.storyCinePose='wcs-aim';c.sukuna.awakenGlow=.6;
    camera(center,GROUND-155,.92);G.flash=.72;G.flashColor='#eafaff';G.shake=11;play('domain');
    return true;
  }
  function releaseDomainControl(c){
    const center=c&&c.openingCenter?c.openingCenter:1200;
    removeYutaProp(c);
    resetActor(c.gojo,center-220,1);resetActor(c.sukuna,center+220,-1);
    c.gojo.ai=null;
    c.gojo.hp=Math.max(1,c.gojo.hp);c.sukuna.hp=Math.max(1,c.sukuna.hp);
    c.domainsActive=true;c.shrineVisible=true;c.shrineFade=1;c.stage='combat';c.phase='domainClash';c.t=0;c.caption=null;c.lastLine='';
    G.domain=null;G.clash=null;G.storyCutscene=false;G.story.cutscene=false;G.story.phase=3;G.story.act=2;
    G.roundState='fight';G.roundTimer=0;G.matchOver=false;G.matchOverScreen=false;cam.cine=0;
    camera(center,GROUND-145,.9);floatText(center,GROUND-270,'DOMAIN CLASH  /  FREE COMBAT','#dff8ff',24,90);
    G.flash=.25;G.flashColor='#ffffff';G.shake=12;play('clash');
  }
  function startAwakening(c){
    if(!c||c.phase==='awakening')return;
    c.phase='awakening';c.domainsActive=false;c.shrineFade=1;c.shrineVisible=true;c.t=0;
    G.story.phase=4;G.story.act=3;G.story.clashResolved=true;
    const g=c.gojo,s=c.sukuna;if(g){g.awakenGlow=85;g.meter=Math.max(g.meter||0,100);}
    if(s)s.awakenGlow=.9;
    G.flash=.78;G.flashColor='#eafaff';G.shake=18;camPunch(.28);play('domain');
    floatText((c&&c.openingCenter)||1200,GROUND-300,'THE STRONGEST AWAKENS','#dff8ff',28,100);
  }
  function startEnding(c,won){
    if(!c||c.endingStarted)return;
    c.endingStarted=true;c.stage=won?'ending':'defeat';c.phase=won?'finale':'failed';c.t=0;c.caption=null;c.lastLine='';
    c.domainsActive=false;c.shrineFade=0;c.shrineVisible=false;G.domain=null;G.clash=null;
    G.storyCutscene=true;G.story.cutscene=true;G.story.ending=won?'victory':'defeat';
    G.matchOver=true;G.matchOverScreen=false;G.roundState='over';G.paused=false;removeYutaProp(c);
    if(won){
      const center=c.openingCenter||ARENA_W/2;
      resetActor(c.gojo,center-180,1);resetActor(c.sukuna,center+185,-1);
      c.gojo.ai=null;c.sukuna.ai=null;c.sukuna.hp=0;c.gojo.state='IDLE';c.sukuna.state='IDLE';c.sukuna.facing=-1;
      c.gojo.storyCinePose='ch3-final-combat';c.sukuna.storyCinePose='ch3-final-combat';
      c.finalImpact1=false;c.finalImpact2=false;c.finalImpact3=false;c.finalBlueHit=false;c.finalSweepHit=false;c.finalImpact=false;
      addYutaProp(c);
      if(c.yuta){c.yuta.x=center-390;c.yuta.y=GROUND;c.yuta.facing=1;c.yuta.state='KNOCKDOWN';c.yuta.vx=0;c.yuta.vy=0;c.yuta.walk=0;c.yuta.storyCinePose='ch3-yuta-fallen';}
      camera(center,GROUND-140,.88);G.flash=.22;G.flashColor='#eefaff';G.shake=3;
    }else{c.gojo.state='DEFEAT';camera((c.gojo.x+c.sukuna.x)/2,GROUND-120,.9);}
    stopVoice();
  }
  function markComplete(c){
    if(c.completed)return;
    removeYutaProp(c);
    c.completed=true;c.stage='complete';c.t=20;G.storyCutscene=true;G.story.cutscene=true;
    G.matchOver=true;G.matchOverScreen=true;G.roundState='over';
    safeStore('jff_story_ch3_complete','1');safeStore('jff_story_unlocked_ch3','1');
    try{if(typeof syncStoryArchive==='function')syncStoryArchive();}catch(e){}
    stopVoice();
  }
  function leaveChapter3(){
    const c=chapter3();stopVoice();G.story3=null;window.__JFF_CH3_ACTIVE__=null;G.story=null;G.storyCutscene=false;
    G.domain=null;G.clash=null;G.fighters=[];G.mode='menu';G.matchOver=false;G.matchOverScreen=false;G.paused=false;G.winner=null;G.roundState='intro';
    G.flash=0;G.shake=0;G.shakeX=0;G.shakeY=0;cam.cine=0;if(c&&c.gojo)c.gojo.storyCinePose=null;
    showScreen('storySelect');try{if(typeof syncStoryArchive==='function')syncStoryArchive();}catch(e){}
  }
  function restartChapter3(){G.story3=null;window.__JFF_CH3_ACTIVE__=null;startChapter3();}

  function tickOpening(c){
    // Ten-second, continuous Chapter 2 -> Chapter 3 intro, with purposeful camera cuts.
    c.t+=STEP;const t=c.t,center=c.openingCenter||1200;
    G.flash=Math.max(0,(G.flash||0)-.032);G.shake=Math.max(0,(G.shake||0)-.34);
    c.gojo.animT+=.62+Math.sin(t*3.2)*.025;
    if(t>3.25&&t<8.3&&Math.floor(t*30)%36===0){
      G.shake=Math.max(G.shake,.8+Math.min(.7,(t-3.25)*.12));
      try{ring(c.sukuna.x,GROUND-7,'#ff435b',34+Math.min(20,(t-3.25)*4),18);}catch(e){}
      try{spark(c.sukuna.x+rnd(-42,42),GROUND-6,2,'#aeb6c5',1.1,2.8,16,0);}catch(e){}
    }
    c.sukuna.animT+=.49+Math.sin(t*2.4)*.02;
    if(c.yuta)c.yuta.animT+=.46+Math.sin(t*4.1)*.035;

    if(t<1.55){
      // Establishing shot: preserve the exact final Chapter 2 blocking.
      camera(1110+Math.sin(t*1.25)*2.5,440,.91+Math.sin(t*1.1)*.005);
      c.gojo.x=1085;c.gojo.y=GROUND;c.gojo.facing=1;c.gojo.state='IDLE';c.gojo.storyCinePose='ch3-gojo-low-guard';
      c.sukuna.x=1320;c.sukuna.y=GROUND;c.sukuna.facing=-1;c.sukuna.state='KNOCKDOWN';c.sukuna.storyCinePose='ch3-sukuna-recover';
      if(c.yuta){c.yuta.x=950;c.yuta.y=GROUND;c.yuta.facing=1;c.yuta.state='KNOCKDOWN';c.yuta.storyCinePose='ch3-yuta-fallen';}
      if(t>.25)line(c,'yuta-opening','YUTA','He blocked it... barehanded?','#d8c5ff');
      if(t>.36&&t<1.35&&Math.floor(t*36)%8===0){
        try{spark(938+rnd(-18,18),GROUND-3,1,'#c4ccd8',1,2.6,16,0);}catch(e){}
      }
      if(t>.42&&t<.50){G.shake=Math.max(G.shake,2.1);try{ring(938,GROUND-5,'#c6d2df',32,13);}catch(e){}}
      if(t>.72&&Math.floor(t*30)%8===0)try{spark(1087+rnd(-8,8),GROUND-130,2,'#dffaff',1.5,3.5,10,0);}catch(e){}
      if(t>1.05&&Math.floor(t*60)%17===0)try{spark(1210+rnd(-90,90),GROUND-5,1,'#b7c7d8',.8,2,18,0);}catch(e){}
    }else if(t<3.15){
      // POV 1: Yuta's view toward the person shielding him.
      const q=ease((t-1.55)/1.6);
      camera(1018+Math.sin(q*Math.PI)*5,440,1.13+Math.sin(q*Math.PI)*.055);
      c.gojo.x=1085+q*5;c.gojo.y=GROUND;c.gojo.state='IDLE';c.gojo.storyCinePose='ch3-gojo-reassure';
      c.sukuna.x=1320;c.sukuna.y=GROUND;c.sukuna.state='KNOCKDOWN';c.sukuna.storyCinePose='ch3-sukuna-recover';
      if(c.yuta){c.yuta.x=mix(950,938,q);c.yuta.y=GROUND;c.yuta.state='KNOCKDOWN';c.yuta.walk=0;c.yuta.storyCinePose='ch3-yuta-fallen';}
      if(t>1.8)line(c,'gojo-reassures-yuta','GOJO',"Stay back, Yuta. I'll handle this.",'#a9e9ff');
      if(Math.floor(t*24)%12===0)try{ring(1088,GROUND-112,'#83dfff',39+q*10,18);}catch(e){}
    }else if(t<4.85){
      // POV 2: slow push toward Sukuna as he rises. The body pose changes every frame.
      const q=ease((t-3.15)/1.7);
      camera(mix(1238,1280,q),GROUND-120,1.04+Math.sin(q*Math.PI)*.09);
      c.gojo.x=1090;c.gojo.y=GROUND;c.gojo.state='IDLE';c.gojo.storyCinePose='ch3-gojo-calm';
      c.sukuna.x=1320;c.sukuna.y=GROUND;c.sukuna.state=q<.82?'KNOCKDOWN':'IDLE';c.sukuna.storyCinePose='ch3-sukuna-rise';c.sukuna.awakenGlow=.42+.46*q;
      if(c.yuta){c.yuta.x=938;c.yuta.y=GROUND;c.yuta.state='KNOCKDOWN';c.yuta.walk=0;c.yuta.storyCinePose='ch3-yuta-fallen';}
      if(t>3.95)line(c,'sukuna-rises','SUKUNA','So... the strongest finally arrives.','#ff8b98');
      if(Math.floor(t*30)%7===0)try{spark(1320+rnd(-30,30),GROUND-rnd(52,142),2,'#a8ced7',1.4,4.2,13,0);}catch(e){}
      if(q>.72&&Math.floor(t*60)%14===0){G.shake=Math.max(G.shake,1.15);try{spark(1260+rnd(-65,65),GROUND-4,1,'#b8c1d0',1,2.8,18,0);}catch(e){}}
    }else if(t<6.55){
      // POV 3: Gojo takes one deliberate step forward. Camera travels with him.
      const q=ease((t-4.85)/1.7);
      camera(mix(1160,1115,q),GROUND-125,1.02+q*.045);
      c.gojo.x=mix(1090,1138,q);c.gojo.y=GROUND;c.gojo.state='IDLE';c.gojo.storyCinePose='ch3-gojo-advance';c.gojo.walk=q>.3?1:0;
      c.sukuna.x=1320;c.sukuna.y=GROUND;c.sukuna.state='IDLE';c.sukuna.storyCinePose='ch3-sukuna-final-stance';c.sukuna.awakenGlow=.8;
      if(c.yuta){c.yuta.x=938;c.yuta.state='KNOCKDOWN';c.yuta.walk=0;c.yuta.storyCinePose='ch3-yuta-fallen';}
      if(t>5.85)line(c,'gojo-challenge','GOJO',"You wanted me here. I'm here.",'#a9e9ff');
      if(Math.floor(t*60)%10===0)try{ring(1120+q*16,GROUND-92,'#80dcff',30+q*34,18);}catch(e){}
      if(Math.floor(t*60)%16===0)try{spark(1090+q*44,GROUND-8,1,'#dffaff',1,2.3,12,0);}catch(e){}
    }else if(t<8.15){
      // Over-shoulder release: Yuta yields space while the two fighters square up.
      const q=ease((t-6.55)/1.6);
      camera(1220+Math.sin(q*Math.PI)*8,GROUND-132,.98+Math.sin(q*Math.PI)*.035);
      c.gojo.x=1138;c.gojo.y=GROUND;c.gojo.state='IDLE';c.gojo.storyCinePose='ch3-gojo-final-stance';
      c.sukuna.x=1320;c.sukuna.y=GROUND;c.sukuna.state='IDLE';c.sukuna.storyCinePose='ch3-sukuna-final-stance';c.sukuna.awakenGlow=.72+.2*Math.sin(t*5);
      if(c.yuta){c.yuta.x=938;c.yuta.y=GROUND;c.yuta.state='KNOCKDOWN';c.yuta.walk=0;c.yuta.storyCinePose='ch3-yuta-fallen';}
      if(t>7.9)line(c,'sukuna-challenge','SUKUNA','Then show me the Limitless.','#ff8b98');
      if(Math.floor(t*60)%10===0)try{spark(1320+rnd(-32,32),GROUND-rnd(60,155),2,'#ff5566',1.6,4.5,13,0);}catch(e){}
    }else if(t<9.45){
      // Pull out to the master shot. The dialogue stops so the silence can land.
      const q=ease((t-8.15)/1.3);
      camera(mix(1210,1200,q),GROUND-142,.9+q*.025);
      c.gojo.x=1138;c.gojo.y=GROUND;c.gojo.state='IDLE';c.gojo.storyCinePose='ch3-gojo-final-stance';
      c.sukuna.x=1320;c.sukuna.y=GROUND;c.sukuna.state='IDLE';c.sukuna.storyCinePose='ch3-sukuna-final-stance';
      if(c.yuta){c.yuta.x=938;c.yuta.y=GROUND;c.yuta.state='KNOCKDOWN';c.yuta.walk=0;c.yuta.storyCinePose='ch3-yuta-fallen';}
      if(t>8.28&&c.lastLine!=='narrator-battlefield'){
        stopVoice();c.lastLine='narrator-battlefield';
        c.caption={speaker:'NARRATOR',text:'The corridor falls silent. Neither man looks away.',color:'#d8e8ff'};
      }
      if(Math.floor(t*60)%9===0)try{spark(1200+rnd(-250,250),GROUND-rnd(35,145),1,'#c3d2e6',.8,2.5,17,0);}catch(e){}
      if(Math.floor(t*60)%20===0){G.shake=Math.max(G.shake,.45);}
    }else if(t<10){
      // Final frame and a single soft impact, then hand control over without a hard reset.
      const q=clamp01((t-9.45)/.55);
      camera(mix(1200,1205,q),mix(GROUND-142,GROUND-138,q),mix(.925,.91,q));
      c.gojo.x=1138;c.gojo.y=GROUND;c.gojo.state='IDLE';c.gojo.storyCinePose='ch3-gojo-final-stance';
      c.sukuna.x=1320;c.sukuna.y=GROUND;c.sukuna.state='IDLE';c.sukuna.storyCinePose='ch3-sukuna-final-stance';
      if(c.yuta){c.yuta.x=938;c.yuta.y=GROUND;c.yuta.state='KNOCKDOWN';c.yuta.walk=0;c.yuta.storyCinePose='ch3-yuta-fallen';}
      if(t>9.67)line(c,'fight-call','NARRATOR','FIGHT!','#eaf7ff');
      if(q>.78&&!c.transitionFlash){G.flash=Math.max(G.flash,.14);G.flashColor='#eafaff';c.transitionFlash=true;}
    }else{
      stopVoice();removeYutaProp(c);
      resetActor(c.gojo,1138,1);resetActor(c.sukuna,1320,-1);c.gojo.ai=null;
      c.stage='combat';c.phase='phase1';c.t=0;c.lastLine='';c.caption=null;
      G.storyCutscene=false;G.story.cutscene=false;G.roundState='fight';G.roundTimer=0;G.matchOver=false;G.matchOverScreen=false;
      camera(1205,440,.91);
    }
  }
    function tickDomainIntro(c){
    c.t+=STEP;const t=c.t,center=c.openingCenter||1200;
    G.flash=Math.max(0,(G.flash||0)-.028);G.shake=Math.max(0,(G.shake||0)-.52);
    c.gojo.animT+=.82;c.sukuna.animT+=.66;c.gojo.y=GROUND;c.sukuna.y=GROUND;c.gojo.vx=0;c.sukuna.vx=0;
    if(t<1.35){
      camera(center-105,GROUND-145,1.08);c.gojo.x=center-145;c.gojo.storyCinePose='domain-form';c.gojo.state='ATTACK';
      c.sukuna.x=center+190;c.sukuna.state='IDLE';c.sukuna.storyCinePose='wcs-aim';
      if(t>.18)line(c,'domain-gojo','GOJO','Domain Expansion: Unlimited Void.','#9fe9ff');
      if(Math.floor(t*60)%9===0){try{ring(c.gojo.x,GROUND-100,'#7fd8ff',80+Math.random()*18,24);burst(c.gojo.x,GROUND-100,3,'#c9f4ff',3,5,10,0);}catch(e){}}
    }else if(t<2.45){
      camera(center-130,GROUND-190,.95);c.gojo.x=center-145;c.gojo.storyCinePose='domain-complete';c.gojo.state='IDLE';
      c.sukuna.x=center+190;c.sukuna.storyCinePose='wcs-aim';c.sukuna.state='IDLE';c.shrineVisible=false;c.domainsActive=false;
      if(t>1.55)line(c,'void-complete','NARRATOR','The space around Gojo unfolds.','#dff8ff');
    }else if(t<3.95){
      c.shrineVisible=true;const q=ease((t-2.45)/.55);camera(center+135,GROUND-260,1.0);
      c.gojo.x=center-185;c.gojo.storyCinePose='domain-complete';c.gojo.state='IDLE';
      c.sukuna.x=center+175;c.sukuna.y=GROUND-460*q;c.sukuna.state='IDLE';c.sukuna.storyCinePose='shrine-king';
      if(t>2.65)line(c,'shrine-king','SUKUNA','A domain without a shell. Now look closely.','#ff8190');
      if(Math.floor(t*60)%8===0){try{ring(center,GROUND-250,'#ff334f',130+Math.random()*25,22);}catch(e){}}
    }else if(t<5.15){
      c.shrineVisible=true;camera(center,GROUND-300,.82);c.gojo.x=center-185;c.gojo.y=GROUND;c.gojo.storyCinePose='domain-complete';c.gojo.state='IDLE';
      c.sukuna.x=center+175;c.sukuna.y=GROUND-460;c.sukuna.storyCinePose='shrine-king';c.sukuna.state='IDLE';c.domainsActive=true;
      if(t>4.02)line(c,'domains-collide','NARRATOR','UNLIMITED VOID  ×  MALEVOLENT SHRINE','#f4f7ff');
      if(t>4&&Math.floor(t*60)%4===0){G.flash=.15;G.flashColor=(Math.floor(t*22)%2)?'#7fd8ff':'#ff334f';G.shake=Math.max(G.shake,4);}
    }else if(t<6.15){
      c.shrineVisible=true;c.domainsActive=true;const q=ease((t-5.15)/1);camera(center,GROUND-140,.9);
      c.gojo.x=center-220;c.gojo.y=GROUND;c.gojo.storyCinePose='guard';c.gojo.state='IDLE';
      c.sukuna.x=center+220;c.sukuna.y=mix(GROUND-460,GROUND,q);c.sukuna.state='IDLE';c.sukuna.storyCinePose='shrine-king';
    }else{stopVoice();releaseDomainControl(c);}
  }
  function tickEnding(c){
    c.t=Math.min(20,c.t+STEP);const t=c.t,center=c.openingCenter||ARENA_W/2,g=c.gojo,s=c.sukuna;
    G.flash=Math.max(0,(G.flash||0)-.035);G.shake=Math.max(0,(G.shake||0)-.45);
    if(c.stage==='defeat'){
      camera((g.x+s.x)/2,GROUND-125,.9);
      if(t>2.6){c.stage='failedCard';c.t=2.6;G.matchOverScreen=true;G.roundState='over';}
      return;
    }
    if(!g||!s)return;
    g.y=GROUND;s.y=GROUND;g.vx=0;s.vx=0;g.vy=0;s.vy=0;g.facing=1;s.facing=-1;g.walk=0;s.walk=0;
    g.state='IDLE';s.state='IDLE';g.move=null;s.move=null;g.hitstun=0;s.hitstun=0;
    g.storyCinePose='ch3-final-combat';s.storyCinePose='ch3-final-combat';
    g.animT+=.82+Math.sin(t*8)*.06;s.animT+=.76+Math.sin(t*7.1)*.055;
    if(c.yuta){c.yuta.x=center-390;c.yuta.y=GROUND;c.yuta.vx=0;c.yuta.vy=0;c.yuta.walk=0;c.yuta.state='KNOCKDOWN';c.yuta.storyCinePose='ch3-yuta-fallen';c.yuta.animT+=.18;}
    if(t<2){
      g.x=center-180+Math.sin(t*2.2)*2;s.x=center+185-Math.sin(t*2.5)*3;
      camera(center+Math.sin(t*1.6)*3,GROUND-142,.88+Math.sin(t*1.8)*.008);
      if(t>.45)line(c,'ending-sukuna','SUKUNA','So this is the strongest...','#ff8190');
    }else if(t<5){
      const q=ease((t-2)/3);g.x=mix(center-180,center-64,q)+Math.sin(t*7.4)*5;s.x=mix(center+185,center+64,q)+Math.sin(t*8.2+1)*5;
      g.y=GROUND-Math.max(0,Math.sin((t-2.1)*Math.PI*1.4))*8;s.y=GROUND-Math.max(0,Math.sin((t-2.45)*Math.PI*1.2))*5;
      camera(center-8+Math.sin(t*5)*5,GROUND-132,1.0+Math.sin(t*3.2)*.018);
      if(t>2.02&&t<2.3)line(c,'ending-gojo-counter','GOJO','Keep up.','#a9e9ff');
      if(t>=2.38&&!c.finalImpact1){c.finalImpact1=true;G.flash=.18;G.flashColor='#e8f8ff';G.shake=Math.max(G.shake,5);try{ring(center-4,GROUND-105,'#dff8ff',54,18);burst(center-4,GROUND-104,12,'#bceeff',2,5,15,0);}catch(e){}}
      if(t>=3.38&&t<3.52)G.shake=Math.max(G.shake,3.5);
      if(t>=3.42&&!c.finalImpact2){c.finalImpact2=true;G.flash=.12;G.flashColor='#f6fbff';G.shake=Math.max(G.shake,6);try{ring(center+2,GROUND-85,'#ff9cab',42,16);burst(center+2,GROUND-88,10,'#d9edff',2,4.5,13,0);}catch(e){}}
    }else if(t<8){
      const q=ease((t-5)/3);g.x=mix(center-64,center-152,q)+Math.sin(t*6)*4;s.x=mix(center+64,center+36,q)+Math.sin(t*7.5)*5;
      g.y=GROUND-Math.max(0,Math.sin((t-5.1)*Math.PI*1.1))*13;s.y=GROUND-Math.max(0,Math.sin((t-6.15)*Math.PI*1.3))*10;
      camera(center-22+Math.sin(t*4.1)*6,GROUND-132,1.08+Math.sin(t*2.8)*.025);
      if(t>5.03&&t<5.55)line(c,'ending-cleave','SUKUNA','Cleave.','#ff8190');
      if(t>=5.72&&!c.finalImpact3){c.finalImpact3=true;G.shake=Math.max(G.shake,5);G.flash=.14;G.flashColor='#ff7789';try{ring(center+5,GROUND-105,'#ff425b',66,18);burst(center+5,GROUND-105,13,'#ff5367',2,5,14,0);}catch(e){}}
    }else if(t<11){
      const q=ease((t-8)/3);g.x=mix(center-152,center-102,q);s.x=mix(center+36,center+172,q)+Math.sin(t*4.5)*3;s.y=GROUND-Math.sin(q*Math.PI)*11;
      camera(center+14*Math.sin(q*Math.PI),GROUND-125,1.04+Math.sin(q*Math.PI)*.035);
      if(t>8.18)line(c,'ending-blue','GOJO','Blue.','#9fe9ff');
      if(t>=8.42&&t<8.58){G.flash=.14;G.flashColor='#a9e7ff';}
      if(t>=9.35&&!c.finalBlueHit){c.finalBlueHit=true;G.shake=Math.max(G.shake,6);G.flash=.2;G.flashColor='#b9eeff';try{ring(center+90,GROUND-112,'#83ddff',94,23);burst(center+90,GROUND-112,18,'#9ce8ff',2.5,6,20,0);}catch(e){}}
    }else if(t<14){
      const q=ease((t-11)/3);g.x=mix(center-102,center-57,q)+Math.sin(t*7)*3;s.x=mix(center+172,center+52,q)+Math.sin(t*7.8+1)*4;
      g.y=GROUND-Math.max(0,Math.sin((t-12.2)*Math.PI*1.2))*10;
      camera(center+Math.sin(t*3.4)*5,GROUND-129,1.02+Math.sin(t*3.1)*.025);
      if(t>11.28&&t<11.64)line(c,'ending-impossible','SUKUNA','Impossible!','#ff8190');
      if(t>=12.48&&!c.finalSweepHit){c.finalSweepHit=true;G.flash=.15;G.flashColor='#fff1f2';G.shake=Math.max(G.shake,6);try{ring(center,GROUND-80,'#ff7f91',74,18);burst(center,GROUND-83,15,'#e8f6ff',2,5,15,0);}catch(e){}}
    }else if(t<17){
      const q=ease((t-14)/3);g.x=mix(center-57,center-30,q);s.x=mix(center+52,center+15,q)+Math.sin(t*5)*3;
      camera(center,GROUND-137,.94+Math.sin(q*Math.PI)*.025);
      if(t>14.12&&t<14.62)line(c,'ending-final-setup','GOJO',"Let's finish this.",'#a9e9ff');
      if(t>=15.05&&t<15.22){G.flash=.12;G.flashColor='#8edfff';}
      if(t>=16.25&&t<16.42){G.flash=.12;G.flashColor='#ff596d';}
    }else if(t<19.2){
      const q=ease((t-17)/2.2);g.x=mix(center-30,center-75,q);s.x=mix(center+15,center+68,q);if(t<18.7)s.y=GROUND-Math.max(0,Math.sin((t-17.1)*Math.PI*1.15))*6;
      camera(center,GROUND-145,.84+Math.sin(q*Math.PI)*.025);
      if(t>=17.12&&!c.finalImpact){c.finalImpact=true;G.flash=.62;G.flashColor='#f4fbff';G.shake=Math.max(G.shake,16);play('clash');try{burst(center,GROUND-118,34,'#eaf8ff',4,12,26,0);burst(center+7,GROUND-100,24,'#ff5268',3,9,22,0);ring(center,GROUND-112,'#ffffff',150,34);ring(center,GROUND-112,'#86dfff',96,27);}catch(e){}}
      if(t>17.4&&c.lastLine!=='ending-final-collision')line(c,'ending-final-collision','NARRATOR','THE FINAL COLLISION','#f5f8ff');
    }else{
      const q=ease((t-19.2)/.8);g.x=center-88+Math.sin(t*2)*1.2;s.x=center+64;s.y=GROUND;camera(center,GROUND-137,.86+q*.018);
      if(t>19.28)line(c,'ending-over','GOJO',"It's over.",'#a9e9ff');
      if(t>=19.75&&!c.outroFlash){c.outroFlash=true;G.flash=.09;G.flashColor='#dff8ff';}
    }
    if(t>=20){c.t=20;markComplete(c);}
  }
  function tick(){
    const c=chapter3();if(!c)return;
    if(c.stage==='intro'){tickOpening(c);return;}
    if(c.stage==='domainIntro'){tickDomainIntro(c);return;}
    if(c.stage==='ending'||c.stage==='defeat'){tickEnding(c);return;}
    if(c.stage==='complete'||c.stage==='failedCard')return;
    if(c.stage==='combat'){
      const s=c.sukuna,g=c.gojo;
      if(c.shrineFade>0&&!c.domainsActive){c.shrineFade=Math.max(0,c.shrineFade-STEP*1.15);if(c.shrineFade<=0)c.shrineVisible=false;}
      baseStep.apply(this,arguments);
      if(!chapter3()||c.stage!=='combat'||!g||!s)return;
      if(s.hp<=0&&g.hp>0){startEnding(c,true);return;}
      if(g.hp<=0||G.matchOver){startEnding(c,false);return;}
      const ratio=s.hp/Math.max(1,s.maxHp);
      if(c.phase==='phase1'&&ratio<=.65){beginDomainSequence(c,'hp-threshold');return;}
      if(c.phase==='domainClash'&&c.domainsActive&&ratio<=.30){startAwakening(c);return;}
    }
  }

  function drawShrine(){
    const c=chapter3(),d=G.domain&&(G.domain.type==='shrine'||G.domain.type==='shrine_heian')?G.domain:null;
    const special=!!(c&&c.shrineVisible);if(!d&&!special)return;
    const center=(c&&c.active&&Number.isFinite(c.shrineCenter))?c.shrineCenter:ARENA_W/2,baseY=GROUND-10;let alpha=.9;
    if(d){const appear=clamp01((d.maxTimer-d.timer)/26),leave=clamp01(d.timer/26);alpha=Math.min(appear,leave)*.96;}
    else if(c&&c.stage==='domainIntro')alpha=clamp01((c.t-2.38)/.34)*.94;
    else if(c&&c.domainsActive)alpha=.88;
    else if(c)alpha=.88*(c.shrineFade||0);
    if(alpha<=.01)return;
    ctx.save();ctx.globalAlpha=alpha;
    const glow=ctx.createRadialGradient(center,baseY-180,22,center,baseY-180,640);
    glow.addColorStop(0,'rgba(255,38,72,.42)');glow.addColorStop(.48,'rgba(120,8,27,.19)');glow.addColorStop(1,'rgba(20,0,8,0)');
    ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(center,baseY-165,640,310,0,0,Math.PI*2);ctx.fill();
    // Three separated roof tiers, heavy eaves and an unmistakable centre peak.
    ctx.fillStyle='#18050b';ctx.strokeStyle='rgba(255,74,91,.64)';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(center-420,baseY-334);ctx.lineTo(center-235,baseY-396);ctx.lineTo(center-88,baseY-438);ctx.lineTo(center,baseY-451);ctx.lineTo(center+88,baseY-438);ctx.lineTo(center+235,baseY-396);ctx.lineTo(center+420,baseY-334);ctx.lineTo(center+390,baseY-319);ctx.lineTo(center+205,baseY-371);ctx.lineTo(center,baseY-416);ctx.lineTo(center-205,baseY-371);ctx.lineTo(center-390,baseY-319);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(center-500,baseY-286);ctx.lineTo(center-275,baseY-344);ctx.lineTo(center-130,baseY-371);ctx.lineTo(center,baseY-384);ctx.lineTo(center+130,baseY-371);ctx.lineTo(center+275,baseY-344);ctx.lineTo(center+500,baseY-286);ctx.lineTo(center+465,baseY-270);ctx.lineTo(center+250,baseY-314);ctx.lineTo(center,baseY-351);ctx.lineTo(center-250,baseY-314);ctx.lineTo(center-465,baseY-270);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#100309';ctx.fillRect(center-330,baseY-300,660,300);
    // Crooked side arches frame Sukuna without swallowing his silhouette.
    ctx.strokeStyle='rgba(118,9,31,.98)';ctx.lineWidth=18;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(center-320,baseY-130);ctx.quadraticCurveTo(center-500,baseY-260,center-420,baseY-430);ctx.quadraticCurveTo(center-390,baseY-468,center-350,baseY-420);ctx.stroke();
    ctx.beginPath();ctx.moveTo(center+320,baseY-130);ctx.quadraticCurveTo(center+500,baseY-260,center+420,baseY-430);ctx.quadraticCurveTo(center+390,baseY-468,center+350,baseY-420);ctx.stroke();
    ctx.strokeStyle='rgba(255,57,79,.66)';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(center-320,baseY-130);ctx.quadraticCurveTo(center-500,baseY-260,center-420,baseY-430);ctx.stroke();
    ctx.beginPath();ctx.moveTo(center+320,baseY-130);ctx.quadraticCurveTo(center+500,baseY-260,center+420,baseY-430);ctx.stroke();
    for(let i=-3;i<=3;i++){
      const x=center+i*82,w=i===0?48:22,top=baseY-(i===0?260:285-Math.abs(i)*13);
      ctx.fillStyle=i===0?'#050207':'#25050d';ctx.fillRect(x-w/2,top,w,baseY-top);
      ctx.fillStyle='rgba(255,58,80,.36)';ctx.fillRect(x-w/2,top,3,baseY-top);
      ctx.fillStyle='rgba(4,2,8,.72)';ctx.fillRect(x-w/2-3,top-9,w+6,12);
    }
    // Bone heaps, ribs and skulls ring the shrine. They are drawn before fighters so Sukuna stays readable.
    ctx.save();ctx.globalAlpha=alpha*.94;ctx.lineCap='round';ctx.lineJoin='round';
    function boneSegment(x1,y1,x2,y2,w){
      ctx.strokeStyle='#766b63';ctx.lineWidth=w+2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      ctx.strokeStyle='#d4c8b5';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
      const r=w*.68;ctx.fillStyle='#b9ad9a';
      for(const p of [[x1,y1],[x2,y2]]){ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.fill();}
    }
    function skull(x,y,scale,tilt){
      ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(scale,scale);
      ctx.fillStyle='#7e746b';ctx.beginPath();ctx.ellipse(0,-5,13,11,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#d9cdb8';ctx.beginPath();ctx.ellipse(0,-7,11,10,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(7,0);ctx.lineTo(5,7);ctx.lineTo(-5,7);ctx.closePath();ctx.fill();
      ctx.fillStyle='#302a2a';
      ctx.beginPath();ctx.ellipse(-4,-7,2.7,3.2,0,0,Math.PI*2);ctx.ellipse(4,-7,2.7,3.2,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(-2,0);ctx.lineTo(2,0);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#766b63';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-4,3);ctx.lineTo(-4,6);ctx.moveTo(0,3);ctx.lineTo(0,6);ctx.moveTo(4,3);ctx.lineTo(4,6);ctx.stroke();
      ctx.restore();
    }
    const piles=[
      {x:center-452,y:baseY+5,s:.72,r:-.28,skull:true},
      {x:center-390,y:baseY+11,s:.92,r:.18,skull:true},
      {x:center-315,y:baseY+8,s:.68,r:-.52,skull:false},
      {x:center+315,y:baseY+8,s:.68,r:.45,skull:false},
      {x:center+390,y:baseY+10,s:.90,r:-.18,skull:true},
      {x:center+452,y:baseY+5,s:.72,r:.32,skull:true}
    ];
    for(let i=0;i<piles.length;i++){
      const p=piles[i];ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.scale(p.s,p.s);
      boneSegment(-32,4,28,-5,6);boneSegment(-20,-10,34,13,5);boneSegment(-26,15,18,-15,4.8);
      // A partial rib cage and vertebrae make these read as remains, not random pebbles.
      ctx.strokeStyle='#d4c8b5';ctx.lineWidth=3.2;
      ctx.beginPath();ctx.moveTo(-5,-17);ctx.lineTo(-3,17);ctx.stroke();
      for(let rib=0;rib<4;rib++){
        const yy=-12+rib*8;
        ctx.beginPath();ctx.moveTo(-5,yy);ctx.quadraticCurveTo(-21,yy-3,-22,yy+6);
        ctx.moveTo(-3,yy);ctx.quadraticCurveTo(14,yy-4,17,yy+5);ctx.stroke();
      }
      ctx.fillStyle='#c8bca8';
      for(let v=0;v<4;v++){ctx.beginPath();ctx.ellipse(-4,-13+v*8,4,3,0,0,Math.PI*2);ctx.fill();}
      if(p.skull)skull(8,-22,.84,(i%2?-1:1)*.12);
      ctx.restore();
    }
    // A few taller crossed femurs at both ends of the altar.
    boneSegment(center-485,baseY-20,center-430,baseY+18,5.5);
    boneSegment(center-420,baseY-26,center-470,baseY+16,5);
    boneSegment(center+485,baseY-20,center+430,baseY+18,5.5);
    boneSegment(center+420,baseY-26,center+470,baseY+16,5);
    ctx.restore();
    // Central cursed maw and layered inner altar.
    ctx.fillStyle='#020106';ctx.fillRect(center-54,baseY-248,108,248);
    ctx.strokeStyle='rgba(255,53,77,.82)';ctx.lineWidth=3;ctx.strokeRect(center-54,baseY-248,108,248);
    ctx.fillStyle='rgba(255,58,73,.28)';ctx.beginPath();ctx.ellipse(center,baseY-195,42,58,0,0,Math.PI*2);ctx.fill();
    for(let i=0;i<6;i++){const tx=center-42+i*14;ctx.fillStyle='#dca5a9';ctx.beginPath();ctx.moveTo(tx,baseY-224);ctx.lineTo(tx+7,baseY-224);ctx.lineTo(tx+3.5,baseY-210);ctx.closePath();ctx.fill();}
    ctx.globalCompositeOperation='lighter';ctx.lineWidth=2;
    for(let i=0;i<13;i++){
      const x=center-290+i*48,y=baseY-90-((G.frame*1.8+i*41)%240);
      ctx.globalAlpha=alpha*(.22+((i%3)*.07));ctx.strokeStyle=i%2?'#ff5265':'#ffb0bb';
      ctx.beginPath();ctx.moveTo(x,y+18);ctx.lineTo(x+Math.sin(G.frame*.04+i)*5,y-18);ctx.stroke();
    }
    ctx.globalAlpha=alpha*.68;ctx.strokeStyle='rgba(255,51,82,.65)';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(center,baseY+1,420+Math.sin(G.frame*.04)*5,22,0,0,Math.PI*2);ctx.stroke();
    ctx.restore();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  }
  window.drawHeianShrine=drawShrine;

  function drawDomainClashFX(c){
    if(!c||!c.domainsActive)return;
    const t=G.frame/60,g=c.gojo,s=c.sukuna;
    const gx=W/2+(g.x-cam.x)*cam.zoom,gy=H/2+(GROUND-120-cam.y)*cam.zoom;
    const sx=W/2+(s.x-cam.x)*cam.zoom,sy=H/2+(GROUND-150-cam.y)*cam.zoom;
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<4;i++){
      ctx.globalAlpha=.19-i*.032;ctx.strokeStyle=i%2?'#d8f7ff':'#72cfff';ctx.lineWidth=i===0?2.2:1;
      ctx.beginPath();ctx.ellipse(gx,gy,210+i*40+Math.sin(t*2+i)*7,160+i*21,Math.sin(t*.15)*.025,0,Math.PI*2);ctx.stroke();
    }
    for(let i=0;i<4;i++){
      ctx.globalAlpha=.15-i*.025;ctx.strokeStyle=i%2?'#ff9cab':'#ff334f';ctx.lineWidth=i===0?2:1;
      ctx.beginPath();ctx.ellipse(sx,sy,235+i*52+Math.sin(t*1.7+i)*8,170+i*22,-Math.sin(t*.12)*.02,0,Math.PI*2);ctx.stroke();
    }
    ctx.globalAlpha=.2;ctx.strokeStyle='#fff';ctx.lineWidth=1;
    for(let i=0;i<8;i++){
      const x=W*.5+(i-3.5)*105+Math.sin(t*1.7+i)*8;
      ctx.beginPath();ctx.moveTo(x,105);ctx.bezierCurveTo(x-35,230,x+28,405,x+Math.sin(t*2+i)*18,610);ctx.stroke();
    }
    if(Math.floor(t*2)%2===0){ctx.globalAlpha=.24;ctx.strokeStyle='#d9f7ff';ctx.beginPath();ctx.moveTo(gx+55,gy-15);ctx.lineTo(sx-55,sy+10);ctx.stroke();}
    ctx.restore();
  }
  function drawOpeningFilmFX(c){
    const t=c.t||0,pressure=ease(clamp01((t-2.6)/4.4));
    ctx.save();
    const radius=Math.max(W,H)*(.74+pressure*.08);
    const vg=ctx.createRadialGradient(W*.5,H*.47,Math.min(W,H)*.16,W*.5,H*.47,radius);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(.48,'rgba(0,0,0,'+(.08+pressure*.06)+')');vg.addColorStop(1,'rgba(0,0,0,'+(.36+pressure*.20)+')');
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);

    // Cheap screen-space aura fields, synchronized to the fighters and camera.
    const screenX=x=>W/2+(x-cam.x)*cam.zoom;
    const screenY=y=>H/2+(y-cam.y)*cam.zoom;
    const gx=screenX(c.gojo.x),gy=screenY(GROUND-78);
    const sx=screenX(c.sukuna.x),sy=screenY(GROUND-78);
    const pulse=.5+.5*Math.sin(t*4.6);
    ctx.save();ctx.globalCompositeOperation='screen';
    const gojoGlow=ctx.createRadialGradient(gx,gy,5,gx,gy,95*cam.zoom);
    gojoGlow.addColorStop(0,'rgba(95,214,255,'+(.08+pressure*.10)+')');
    gojoGlow.addColorStop(.42,'rgba(61,170,255,'+(.05+pressure*.055)+')');
    gojoGlow.addColorStop(1,'rgba(40,115,255,0)');
    ctx.fillStyle=gojoGlow;ctx.beginPath();ctx.ellipse(gx,gy,68*cam.zoom,100*cam.zoom,0,0,Math.PI*2);ctx.fill();

    const sukunaGlow=ctx.createRadialGradient(sx,sy,4,sx,sy,(105+pressure*42)*cam.zoom);
    sukunaGlow.addColorStop(0,'rgba(255,65,83,'+(.12+pressure*.18+pulse*.035)+')');
    sukunaGlow.addColorStop(.40,'rgba(191,18,43,'+(.08+pressure*.10)+')');
    sukunaGlow.addColorStop(1,'rgba(72,0,12,0)');
    ctx.fillStyle=sukunaGlow;ctx.beginPath();ctx.ellipse(sx,sy,(78+pressure*14)*cam.zoom,(114+pressure*16)*cam.zoom,0,0,Math.PI*2);ctx.fill();

    // Expanding pressure rings. Sukuna's red rings grow heavier as he stands.
    for(let i=0;i<3;i++){
      const phase=(t*.27+i/3)%1,r=(22+phase*(50+pressure*25))*cam.zoom;
      ctx.globalAlpha=(1-phase)*(.15+pressure*.18);
      ctx.strokeStyle=i%2?'#ff5268':'#ff9aa7';ctx.lineWidth=1.2+i*.35;
      ctx.beginPath();ctx.ellipse(sx,sy,r,r*(1.22+pressure*.10),0,0,Math.PI*2);ctx.stroke();
    }
    for(let i=0;i<2;i++){
      const phase=(t*.20+i*.5)%1,r=(18+phase*42)*cam.zoom;
      ctx.globalAlpha=(1-phase)*(.10+pressure*.10);
      ctx.strokeStyle='#8cddff';ctx.lineWidth=1;
      ctx.beginPath();ctx.ellipse(gx,gy,r,r*1.25,0,0,Math.PI*2);ctx.stroke();
    }

    // Air between the two fighters appears to buckle under opposing cursed energy.
    ctx.globalAlpha=.12+pressure*.20;
    for(let i=0;i<7;i++){
      const q=i/6,y=mix(gy-35*cam.zoom,sy+24*cam.zoom,q);
      const mid=(gx+sx)*.5+Math.sin(t*8+i*1.7)*(4+pressure*12);
      ctx.strokeStyle=i%2?'#ff4b61':'#8ddfff';ctx.lineWidth=i%3===0?1.8:1;
      ctx.beginPath();ctx.moveTo(gx+18*cam.zoom,y);
      ctx.bezierCurveTo(mid-38,y+Math.sin(t*7+i)*7,mid+32,y-Math.cos(t*6+i)*9,sx-18*cam.zoom,y+Math.sin(t*5+i)*3);
      ctx.stroke();
    }
    ctx.restore();

    // A few dust flecks and fine scan lines add texture without expensive blur filters.
    ctx.globalAlpha=.035;ctx.fillStyle='#d5e1f2';
    for(let y=44;y<H-40;y+=8)ctx.fillRect(0,y,W,1);
    const particleCount=12+Math.round(pressure*7);
    for(let k=0;k<particleCount;k++){
      const x=((k*173+t*(11+k%4*3))%Math.max(1,W));
      const y=68+((k*97+t*(5+k%3*2))%Math.max(1,H-132));
      ctx.globalAlpha=.10+(k%3)*.025+pressure*.035;
      ctx.fillStyle=k%4===0?'#ff9da9':'#dceaff';ctx.beginPath();ctx.arc(x,y,1+(k%2)*.5,0,Math.PI*2);ctx.fill();
    }
    let shot='SHOT 01  /  MASTER SHOT',accent='#dceaff';
    if(t>=1.55&&t<3.15){shot='POV 1  /  YUTA: THE PROTECTOR';accent='#b9a1ff';}
    else if(t>=3.15&&t<4.85){shot='POV 2  /  SUKUNA: THE CHALLENGE';accent='#ff8293';}
    else if(t>=4.85&&t<6.55){shot='POV 3  /  GOJO: THE COUNTERSTEP';accent='#9fe9ff';}
    else if(t>=6.55&&t<8.15){shot='OVER-SHOULDER  /  THE DISTANCE CLOSES';accent='#dceaff';}
    else if(t>=8.15&&t<9.45){shot='MASTER SHOT  /  THE CORRIDOR HOLDS ITS BREATH';accent='#dceaff';}
    else if(t>=9.45){shot='FINAL FRAME  /  FIGHT';accent='#ffffff';}
    ctx.globalAlpha=.88;ctx.textAlign='center';ctx.font='800 10px Consolas,monospace';ctx.fillStyle=accent;ctx.fillText(shot,W/2,84);
    ctx.restore();
  }
  function drawCaption(c){
    const t=c.t;ctx.save();
    ctx.fillStyle='rgba(2,4,10,.72)';ctx.fillRect(0,0,W,31);ctx.fillRect(0,H-32,W,32);
    ctx.fillStyle='#9eb4d7';ctx.font='800 9px Consolas,monospace';ctx.textAlign='left';ctx.fillText('JUJUTSU CHRONICLES  /  CHAPTER 3',25,20);
    ctx.textAlign='right';ctx.fillStyle='#6b819f';ctx.fillText(c.stage==='intro'?'CONTINUING FROM CHAPTER 2':(c.stage==='domainIntro'?'DOMAIN COLLISION':(c.stage==='ending'?'FINAL EXCHANGE':(c.stage==='defeat'?'DEFEAT':'AWAKENING'))),W-25,20);
    ctx.globalAlpha=.68;ctx.fillStyle='#000';ctx.fillRect(0,31,W,1);ctx.globalAlpha=1;
    if(c.caption){
      const cue=c.caption,bw=Math.min(830,W-100),bx=(W-bw)/2,by=H-127,bh=76;
      ctx.fillStyle='rgba(3,6,13,.92)';ctx.fillRect(bx,by,bw,bh);ctx.strokeStyle=cue.color||'#9fe9ff';ctx.lineWidth=2;ctx.strokeRect(bx,by,bw,bh);
      ctx.textAlign='left';ctx.font='900 12px "Segoe UI",sans-serif';ctx.fillStyle=cue.color||'#9fe9ff';ctx.fillText(cue.speaker,bx+18,by+23);
      ctx.font='700 18px "Segoe UI",sans-serif';ctx.fillStyle='#f4f7ff';ctx.fillText(cue.text,bx+18,by+51,bw-36);
    }
    if(c.stage==='intro'){
      ctx.textAlign='center';ctx.font='900 11px Consolas,monospace';ctx.fillStyle='rgba(222,238,255,.68)';ctx.fillText('THE INEVITABLE INTERVENTION',W/2,63);
    }else if(c.stage==='domainIntro'){
      ctx.textAlign='center';ctx.font='900 11px Consolas,monospace';ctx.fillStyle='#e3f6ff';ctx.fillText('UNLIMITED VOID  ×  MALEVOLENT SHRINE',W/2,61);
    }
    ctx.restore();
  }
  function drawEndingCinematicFX(c){
    const t=c.t||0,g=c.gojo,s=c.sukuna;if(!g||!s)return;
    const screenX=x=>W/2+(x-cam.x)*cam.zoom,screenY=y=>H/2+(y-cam.y)*cam.zoom;
    const gx=screenX(g.x),sx=screenX(s.x),gy=screenY(GROUND-105),sy=screenY(GROUND-112),mx=(gx+sx)*.5,my=(gy+sy)*.5;
    ctx.save();ctx.fillStyle='rgba(1,3,9,.10)';ctx.fillRect(0,0,W,H);
    const vg=ctx.createRadialGradient(W*.5,H*.46,Math.min(W,H)*.22,W*.5,H*.46,Math.max(W,H)*.78);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.42)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    ctx.save();ctx.globalCompositeOperation='lighter';const pressure=clamp01((t-1.2)/3.2);
    for(let i=0;i<3;i++){
      ctx.globalAlpha=(.12-i*.025)+pressure*.035;ctx.lineWidth=1.25-i*.2;ctx.strokeStyle=i%2?'#8cddff':'#d9f6ff';
      ctx.beginPath();ctx.ellipse(gx,gy,28*cam.zoom+i*24*cam.zoom+Math.sin(t*3+i)*3,48*cam.zoom+i*22*cam.zoom,Math.sin(t*1.4)*.025,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle=i%2?'#ff96a5':'#ff4059';ctx.beginPath();ctx.ellipse(sx,sy,30*cam.zoom+i*24*cam.zoom+Math.sin(t*3.4+i)*4,49*cam.zoom+i*23*cam.zoom,-Math.sin(t*1.2)*.03,0,Math.PI*2);ctx.stroke();
    }
    if(t>=4.8&&t<8.1){const q=clamp01((t-4.8)/3.3);for(let i=0;i<5;i++){
      const phase=(t*1.65+i*.23)%1,x1=sx-8*cam.zoom,y1=sy-58*cam.zoom+i*17*cam.zoom,x2=gx+8*cam.zoom,y2=gy-44*cam.zoom+i*18*cam.zoom;
      ctx.globalAlpha=(1-phase)*(.42+q*.22);ctx.strokeStyle=i%2?'#ffb6c0':'#ff405a';ctx.lineWidth=(i===2?2.6:1.1)*cam.zoom;
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.bezierCurveTo(mix(x1,x2,.25),y1-20*cam.zoom+Math.sin(t*10+i)*9,mix(x1,x2,.72),y2+22*cam.zoom+Math.cos(t*9+i)*8,x2,y2);ctx.stroke();
    }}
    if(t>=8&&t<11.15){
      const ox=screenX(g.x+42),oy=screenY(GROUND-120),r=(17+Math.sin(t*8)*2.2)*cam.zoom;
      const orb=ctx.createRadialGradient(ox,oy,1,ox,oy,r*2.7);
      orb.addColorStop(0,'rgba(245,253,255,.95)');orb.addColorStop(.2,'rgba(134,226,255,.88)');orb.addColorStop(.58,'rgba(46,143,255,.38)');orb.addColorStop(1,'rgba(35,99,255,0)');
      ctx.fillStyle=orb;ctx.globalAlpha=.95;ctx.beginPath();ctx.arc(ox,oy,r*2.7,0,Math.PI*2);ctx.fill();
      for(let i=0;i<4;i++){ctx.globalAlpha=.42-i*.07;ctx.strokeStyle=i%2?'#e6fbff':'#65cfff';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(ox,oy,r*(1.2+i*.32),r*(.72+i*.22),t*1.2+i*.65,0,Math.PI*2);ctx.stroke();}
      for(let i=0;i<8;i++){const a=t*3+i*Math.PI/4,rr=(34+(i%3)*8)*cam.zoom;ctx.globalAlpha=.6;ctx.fillStyle='#8ce6ff';ctx.beginPath();ctx.arc(ox+Math.cos(a)*rr,oy+Math.sin(a)*rr*.72,1.2*cam.zoom,0,Math.PI*2);ctx.fill();}
    }
    if(t>=14&&t<17.55){
      const charge=clamp01((t-14)/2.8),ox=screenX(g.x+45),oy=screenY(GROUND-125),r1=(13+charge*10)*cam.zoom,r2=(11+charge*9)*cam.zoom;
      ctx.globalAlpha=.78;ctx.strokeStyle='#8ce5ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ox-13*cam.zoom,oy,r1,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.82;ctx.strokeStyle='#ff576c';ctx.beginPath();ctx.arc(ox+17*cam.zoom,oy-5*cam.zoom,r2,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.28+charge*.18;ctx.strokeStyle='#e7faff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ox-8*cam.zoom,oy);ctx.lineTo(ox+12*cam.zoom,oy-3*cam.zoom);ctx.stroke();
    }
    if(t>=17&&t<19.35){
      const q=clamp01((t-17.12)/1.75),r=(20+q*250)*cam.zoom;
      ctx.globalAlpha=(1-q)*.8;ctx.strokeStyle='#f0fbff';ctx.lineWidth=2+q;ctx.beginPath();ctx.ellipse(mx,my,r,r*.56,0,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<14;i++){const a=Math.PI*2*i/14+t*.3,inner=36*cam.zoom,outer=(140+Math.sin(t*5+i)*18)*cam.zoom;ctx.globalAlpha=(1-q)*(.17+(i%3)*.04);ctx.strokeStyle=i%2?'#ff6b7d':'#a9e8ff';ctx.lineWidth=i%4===0?2:1;ctx.beginPath();ctx.moveTo(mx+Math.cos(a)*inner,my+Math.sin(a)*inner*.65);ctx.lineTo(mx+Math.cos(a)*outer,my+Math.sin(a)*outer*.65);ctx.stroke();}
      if(t>17.13&&t<17.43){ctx.globalAlpha=.16*(1-(t-17.13)/.30);ctx.fillStyle='#effaff';ctx.fillRect(0,0,W,H);}
    }
    for(let i=0;i<14;i++){const px=((i*97+t*(17+i%4*5))%W),py=90+((i*67+t*(8+i%3*3))%(H-175));ctx.globalAlpha=.08+(i%3)*.035;ctx.fillStyle=i%4===0?'#ff9daa':'#d9f3ff';ctx.beginPath();ctx.arc(px,py,1+(i%2)*.5,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    let shot='00:00  /  THE STARE',accent='#dbe8fa';
    if(t>=2&&t<5){shot='00:02  /  CLOSE-QUARTERS COMBAT';accent='#d9f5ff';}
    else if(t>=5&&t<8){shot='00:05  /  SUKUNA REVERSES THE MOMENTUM';accent='#ff8998';}
    else if(t>=8&&t<11){shot='00:08  /  BLUE CHANGES THE FIELD';accent='#93e5ff';}
    else if(t>=11&&t<14){shot='00:11  /  COUNTERATTACK';accent='#dceaff';}
    else if(t>=14&&t<17){shot='00:14  /  FINAL SETUP';accent='#ffb0ba';}
    else if(t>=17&&t<19.2){shot='00:17  /  FINAL COLLISION';accent='#ffffff';}
    else if(t>=19.2){shot='00:19  /  AFTERMATH';accent='#a8e5ff';}
    ctx.globalAlpha=.9;ctx.textAlign='center';ctx.font='800 10px Consolas,monospace';ctx.fillStyle=accent;ctx.fillText(shot,W/2,58);
    ctx.textAlign='left';ctx.globalAlpha=.72;ctx.fillStyle='#b9c9df';ctx.font='800 9px Consolas,monospace';ctx.fillText('FINAL EXCHANGE  /  20 SEC',24,H-46);ctx.restore();
  }
  function drawEndCard(c,failed){
    ctx.save();ctx.fillStyle='rgba(2,3,8,.91)';ctx.fillRect(0,0,W,H);
    if(!failed){
      const grad=ctx.createLinearGradient(W*.2,0,W*.8,0);grad.addColorStop(0,'#8fe8ff');grad.addColorStop(.5,'#f4f7ff');grad.addColorStop(1,'#ff8190');
      ctx.textAlign='center';ctx.font='900 38px Impact,"Segoe UI",sans-serif';ctx.fillStyle='rgba(255,61,91,.32)';ctx.fillText('CHAPTER 3 COMPLETE',W/2-2,H*.46+2);ctx.fillStyle=grad;ctx.fillText('CHAPTER 3 COMPLETE',W/2,H*.46);
      ctx.font='800 14px "Segoe UI",sans-serif';ctx.fillStyle='#d7e6ff';ctx.fillText('AWAKENING  /  CLASH OF THE STRONGEST',W/2,H*.54);
      ctx.fillStyle='#6e819d';ctx.font='800 10px Consolas,monospace';ctx.fillText('ENTER / SPACE  ·  STORY ARCHIVE',W/2,H*.83);
    }else{
      ctx.textAlign='center';ctx.font='900 38px Impact,"Segoe UI",sans-serif';ctx.fillStyle='#ff8190';ctx.fillText('CHAPTER 3 FAILED',W/2,H*.46);
      ctx.font='800 14px "Segoe UI",sans-serif';ctx.fillStyle='#a6b4cb';ctx.fillText('RETRY THE DOMAIN CLASH',W/2,H*.54);
      ctx.fillStyle='#6e819d';ctx.font='800 10px Consolas,monospace';ctx.fillText('R  ·  RETRY     ENTER / ESC  ·  STORY ARCHIVE',W/2,H*.83);
    }
    ctx.restore();
  }

  if(typeof basePose==='function')window.computePose=function(f){
    const P=basePose.apply(this,arguments),c=chapter3();
    if(!c||!f||!(c.stage==='intro'||c.stage==='domainIntro'||c.stage==='ending'))return P;
    if(c.stage==='intro'){
      const t=c.t||0,breath=Math.sin(t*3.7)*.65;
      if(f===c.gojo){
        P.hipY=-56+breath*.18;P.shY=-95+breath*.25;P.headY=-112+breath*.22;
        P.lean=-3+Math.sin(t*2.1)*.8;P.legF=[73,10];P.legB=[105,-9];
        // No overhead arms: compact chest-level guard, with a short reassuring gesture to Yuta.
        P.armF=[55,-95];P.armB=[125,-160];
        if(t>=1.55&&t<3.15){
          const q=ease((t-1.55)/1.6);P.lean=-2-q;
          P.armF=[mix(55,42,q),mix(-95,-62,q)];P.armB=[mix(125,120,q),mix(-160,-150,q)];
        }else if(t>=3.15&&t<4.85){
          P.lean=-3+Math.sin(t*2)*.6;P.armF=[57,-92];P.armB=[123,-154];
        }else if(t>=4.85&&t<6.55){
          const q=ease((t-4.85)/1.7);P.lean=-4+q*2.5;
          P.armF=[mix(57,43,q),mix(-92,-54,q)];P.armB=[mix(123,115,q),mix(-154,-132,q)];
          P.legF=[73+Math.sin(t*7)*4,10];P.legB=[105-Math.sin(t*7)*4,-9];
        }else if(t>=6.55){
          P.lean=-1+Math.sin(t*2.6)*.5;P.armF=[57,-92];P.armB=[123,-154];
          P.legF=[78,8];P.legB=[99,-8];
        }
      }else if(f===c.sukuna){
        const rise=ease(clamp01((t-3.15)/1.7));
        if(t<3.15){
          // Chapter 2 continuity: Sukuna is still down, bracing against the floor.
          P.hipY=-35+breath*.15;P.shY=-57;P.headY=-71;P.lean=19+Math.sin(t*2.4)*.8;
          P.armF=[25,40];P.armB=[155,-70];P.legF=[35,18];P.legB=[145,-18];
        }else{
          // A controlled rise into a low, predatory stance. Arms never point vertically overhead.
          P.hipY=mix(-35,-57,rise);P.shY=mix(-57,-95,rise);P.headY=mix(-71,-112,rise);
          P.lean=mix(19,4,rise)+Math.sin(t*2.5)*.5;
          P.armF=[mix(25,65,rise),mix(40,-96,rise)];
          P.armB=[mix(155,120,rise),mix(-70,-75,rise)];
          P.legF=[mix(35,82,rise),mix(18,5,rise)];P.legB=[mix(145,104,rise),mix(-18,-10,rise)];
        }
        if(t>=6.55){
          const menace=Math.sin(t*4.7)*1.4;P.lean=4+menace*.35;
          P.armF=[62+menace,-45];P.armB=[116-menace,-58];P.legF=[80,7];P.legB=[104,-9];
        }
      }else if(f===c.yuta){
        // New Chapter 3-only collapse pose: recoil, hit the floor, then remain visibly down.
        // This replaces the old upright support/retreat pose from earlier chapters.
        const fall=ease(clamp01((t-.28)/.86));
        P.hipY=mix(-55,-15,fall)+Math.sin(t*3.1)*.22;
        P.shY=mix(-94,-27,fall)+Math.sin(t*2.4)*.18;
        P.headY=mix(-111,-32,fall)+Math.sin(t*2.1)*.2;
        P.lean=mix(-5,54,fall)+Math.sin(t*2.8)*.35;
        P.armF=[mix(82,92,fall),mix(12,78,fall)];
        P.armB=[mix(119,142,fall),mix(-54,-36,fall)];
        P.legF=[mix(87,22,fall),mix(4,48,fall)];
        P.legB=[mix(95,137,fall),mix(-7,-42,fall)];
        if(t>=1.22){
          // Settled on his side, one arm braced on the floor, with subtle breathing only.
          P.hipY=-15+Math.sin(t*3.1)*.22;P.shY=-27+Math.sin(t*2.4)*.18;P.headY=-32+Math.sin(t*2.1)*.2;
          P.lean=54+Math.sin(t*2.8)*.35;
          P.armF=[92,78];P.armB=[142,-36];P.legF=[22,48];P.legB=[137,-42];
        }
      }
    }else if(c.stage==='domainIntro'){
      const t=c.t||0;
      if(f===c.gojo){
        P.hipY=-57+Math.sin(t*3)*.35;P.shY=-96;P.headY=-113+Math.sin(t*2)*.25;P.lean=-2.5;
        P.legF=[80,8];P.legB=[96,-8];
        if(t<5.15){
          // Gojo's hands meet at the upper chest: elbows bent, not both arms pointing skyward.
          P.armF=[38,148];P.armB=[132,-162];
        }else{
          const q=ease((t-5.15)/1.0);
          P.armF=[mix(38,74,q),mix(148,26,q)];P.armB=[mix(132,110,q),mix(-162,18,q)];
        }
      }else if(f===c.sukuna){
        P.hipY=-58;P.shY=-97;P.headY=-114;P.lean=4+Math.sin(t*2.6)*.4;
        P.legF=[82,3];P.legB=[105,-11];
        if(t<2.45){
          // Menacing idle while Gojo opens Unlimited Void.
          P.armF=[72,36];P.armB=[115,14];
        }else if(t<5.15){
          // Sukuna's Enmaten seal is held in front of the torso as Malevolent Shrine forms.
          // Values account for the extra arm articulation used by the Heian renderer.
          P.armF=[4,213];P.armB=[180,-213];
        }else{
          const q=ease((t-5.15)/.95);
          P.armF=[mix(4,72,q),mix(213,36,q)];P.armB=[mix(180,115,q),mix(-213,14,q)];
        }
      }
    }else if(c.stage==='ending'&&f===c.gojo){P.hipY=-57;P.shY=-96;P.headY=-113;P.lean=2;P.armF=[64,28];P.armB=[112,18];P.legF=[88,7];P.legB=[95,-7];}
    return P;
  };
  if(typeof baseDrawUI==='function')window.drawUI=function(){
    const c=chapter3();if(c&&(c.stage==='intro'||c.stage==='domainIntro'||c.stage==='ending'||c.stage==='defeat'||c.stage==='complete'||c.stage==='failedCard'))return;
    return baseDrawUI.apply(this,arguments);
  };
  if(typeof baseRender==='function')window.render=function(){
    baseRender.apply(this,arguments);
    const c=chapter3();if(!c||G.mode!=='story')return;
    if(c.stage==='intro'||c.stage==='domainIntro'||c.stage==='ending'||c.stage==='defeat'){
      if(c.stage==='intro')drawOpeningFilmFX(c);
      if(c.stage==='ending')drawEndingCinematicFX(c);
      drawCaption(c);
      if(c.stage==='intro'&&c.t<.18){ctx.save();ctx.fillStyle='rgba(0,0,0,'+(.4*(1-c.t/.18))+')';ctx.fillRect(0,0,W,H);ctx.restore();}
      if(c.stage==='domainIntro'&&c.t>3.85&&c.t<5.2){ctx.save();ctx.globalAlpha=.08+Math.sin(c.t*24)*.04;ctx.fillStyle=(Math.floor(c.t*20)%2)?'#83dcff':'#ff5167';ctx.fillRect(0,0,W,H);ctx.restore();}
      if(c.stage==='defeat')drawEndCard(c,true);
    }else if(c.stage==='complete')drawEndCard(c,false);
    else if(c.stage==='failedCard')drawEndCard(c,true);
    if(c.domainsActive&&c.stage==='combat')drawDomainClashFX(c);
  };
  if(typeof baseTriggerClash==='function')window.triggerClash=function(a,b){
    const c=chapter3();
    if(c&&G.mode==='story'&&c.stage==='combat'&&a&&b&&[a.id,b.id].includes('gojo')&&[a.id,b.id].includes('sukuna')){
      a.state='IDLE';b.state='IDLE';a.stateFrame=0;b.stateFrame=0;a.hitstun=0;b.hitstun=0;a.move=null;b.move=null;a.moveKey=null;b.moveKey=null;a.vx=0;b.vx=0;
      G.clash=null;G.domain=null;beginDomainSequence(c,'simultaneous-ult');return;
    }
    return baseTriggerClash.apply(this,arguments);
  };
  if(typeof baseActivateDomain==='function')window.activateDomain=function(f){
    const c=chapter3();
    if(c&&G.mode==='story'&&c.stage==='combat'&&c.domainsActive&&f&&f.move&&f.move.domain){
      f.state='ATTACK';f.moveFrame=f.move.startup||f.moveFrame;f.domainCharge=1;f.storyDomainPulse=24;
      try{SFX.domain();}catch(e){}
      try{burst(f.x,f.y-85,18,f.id==='sukuna'?'#ff5265':'#8fe8ff',4,9,22,0);ring(f.x,f.y-80,f.id==='sukuna'?'#ff5265':'#8fe8ff',100,28);}catch(e){}
      return;
    }
    return baseActivateDomain.apply(this,arguments);
  };
  if(typeof baseTriggerChapter1==='function')window.triggerChapter1Event=function(){if(chapter3())return;return baseTriggerChapter1.apply(this,arguments);};
  if(typeof baseChapter1Clash==='function')window.handleChapter1ClashResolution=function(){if(chapter3())return;return baseChapter1Clash.apply(this,arguments);};
  window.showResult=function(){
    const c=chapter3();
    if(c&&G.mode==='story'){if(c.stage==='combat'){const won=!!(c.gojo&&c.gojo.hp>0&&c.sukuna&&c.sukuna.hp<=0);startEnding(c,won);}return;}
    if(typeof baseResult==='function')return baseResult.apply(this,arguments);
  };
  window.step=function(){
    const c=chapter3();
    if(c&&G.mode==='story'){
      if(c.stage==='intro'||c.stage==='domainIntro'||c.stage==='ending'||c.stage==='defeat'){baseStep.apply(this,arguments);tick();return;}
      if(c.stage==='complete'||c.stage==='failedCard')return;
      if(c.stage==='combat'){tick();return;}
    }
    return baseStep.apply(this,arguments);
  };
  MenuKey=function(code){
    const c=chapter3();
    if(c&&G.mode==='story'){
      if(c.stage==='complete'){
        if(code==='KeyR'){restartChapter3();return;}
        if(code==='Enter'||code==='Space'||code==='Escape'){leaveChapter3();return;}
        return;
      }
      if(c.stage==='failedCard'){
        if(code==='KeyR'){restartChapter3();return;}
        if(code==='Enter'||code==='Space'||code==='Escape'){leaveChapter3();return;}
        return;
      }
      if(c.stage==='intro'||c.stage==='domainIntro'||c.stage==='ending'||c.stage==='defeat')return;
    }
    return baseMenuKey.apply(this,arguments);
  };
  console.info('[JFF Chapter 3] Mobile Domain Clash + reworked Shrine renderer loaded.');
})();