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
      c.finalKeyIndex=-1;c.finalSeenKey=-1;c.finalFxEvent='';c.finalFxAt=-100;
      addYutaProp(c);
      if(c.yuta){c.yuta.x=center-390;c.yuta.y=GROUND;c.yuta.facing=1;c.yuta.state='KNOCKDOWN';c.yuta.vx=0;c.yuta.vy=0;c.yuta.walk=0;c.yuta.storyCinePose='ch3-yuta-fallen';}
      camera(center,GROUND-140,.88);G.flash=.22;G.flashColor='#eefaff';G.shake=3;
    }else{c.gojo.state='DEFEAT';camera((c.gojo.x+c.sukuna.x)/2,GROUND-120,.9);}
    stopVoice();
  }
  function markComplete(c){
    if(c.completed)return;
    removeYutaProp(c);
    c.completed=true;c.stage='complete';c.t=62;G.storyCutscene=true;G.story.cutscene=true;
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
function drawChapter4ContinuationFX(c,t){
    const time=clamp01(t/25)*25;
    const w=W,h=H;
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    const bg=ctx.createLinearGradient(0,0,w,h);
    if(time<5){
      bg.addColorStop(0,'#09040d');bg.addColorStop(.48,'#270818');bg.addColorStop(1,'#05060d');
    }else if(time<15){
      bg.addColorStop(0,'#050a16');bg.addColorStop(.55,'#10152b');bg.addColorStop(1,'#200c1a');
    }else{
      bg.addColorStop(0,'#07111f');bg.addColorStop(.55,'#171027');bg.addColorStop(1,'#090913');
    }
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);

    function figureGojo(x,y,sc,ghost){
      ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.globalAlpha*=ghost||1;
      ctx.strokeStyle='#111621';ctx.lineWidth=10;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(-8,-50);ctx.lineTo(-16,-25);ctx.lineTo(-19,0);ctx.moveTo(8,-50);ctx.lineTo(15,-25);ctx.lineTo(18,0);ctx.stroke();
      ctx.fillStyle='#101522';ctx.beginPath();ctx.moveTo(-17,-76);ctx.lineTo(16,-76);ctx.lineTo(24,-45);ctx.lineTo(17,-37);ctx.lineTo(-18,-37);ctx.lineTo(-24,-47);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#dceeff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-14,-68);ctx.lineTo(-34,-54);ctx.moveTo(13,-68);ctx.lineTo(31,-58);ctx.stroke();
      ctx.fillStyle='#d6e7fa';ctx.beginPath();ctx.ellipse(0,-91,15,19,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f2f6ff';ctx.beginPath();ctx.moveTo(-17,-93);ctx.lineTo(-23,-112);ctx.lineTo(-10,-105);ctx.lineTo(-5,-121);ctx.lineTo(2,-107);ctx.lineTo(12,-118);ctx.lineTo(13,-104);ctx.lineTo(24,-109);ctx.lineTo(15,-88);ctx.lineTo(8,-98);ctx.lineTo(1,-91);ctx.lineTo(-7,-100);ctx.lineTo(-12,-90);ctx.closePath();ctx.fill();
      ctx.fillStyle='#0a101c';ctx.fillRect(-13,-93,26,5);
      ctx.restore();
    }
    function figureItachi(x,y,sc,eyes){
      ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
      ctx.fillStyle='#0a0a12';ctx.strokeStyle='#3a2336';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-15,-96);ctx.lineTo(-28,-70);ctx.lineTo(-34,-6);ctx.lineTo(-21,0);ctx.lineTo(24,0);ctx.lineTo(33,-7);ctx.lineTo(24,-75);ctx.lineTo(13,-97);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#1d1722';ctx.beginPath();ctx.moveTo(-15,-94);ctx.lineTo(-25,-108);ctx.lineTo(-9,-115);ctx.lineTo(9,-114);ctx.lineTo(24,-105);ctx.lineTo(13,-94);ctx.closePath();ctx.fill();
      ctx.fillStyle='#c4a7a4';ctx.beginPath();ctx.ellipse(0,-109,12,17,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#090911';ctx.beginPath();ctx.moveTo(-16,-115);ctx.lineTo(-23,-135);ctx.lineTo(-10,-127);ctx.lineTo(-7,-143);ctx.lineTo(1,-128);ctx.lineTo(10,-140);ctx.lineTo(13,-126);ctx.lineTo(23,-132);ctx.lineTo(16,-112);ctx.lineTo(8,-105);ctx.lineTo(3,-119);ctx.lineTo(-5,-112);ctx.lineTo(-10,-124);ctx.lineTo(-14,-108);ctx.closePath();ctx.fill();
      ctx.fillStyle=eyes?'#ff1d4b':'#761832';ctx.beginPath();ctx.ellipse(-4,-109,3.4,1.6,0,0,Math.PI*2);ctx.ellipse(4,-109,3.4,1.6,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#14131c';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-13,-72);ctx.lineTo(-31,-55);ctx.lineTo(-40,-41);ctx.stroke();
      ctx.fillStyle='#d1b1ad';ctx.beginPath();ctx.ellipse(-40,-41,4,6,-.2,0,Math.PI*2);ctx.fill();
      if(eyes){ctx.globalAlpha=.4+.3*Math.sin(time*13);ctx.strokeStyle='#ff304f';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(-4,-109,7,0,Math.PI*2);ctx.arc(4,-109,7,0,Math.PI*2);ctx.stroke();}
      ctx.restore();
    }
    function figureSukuna(x,y,sc){
      ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.rotate(-.12);
      ctx.strokeStyle='#161018';ctx.lineWidth=10;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(-5,-44);ctx.lineTo(-17,-20);ctx.lineTo(-22,0);ctx.moveTo(7,-43);ctx.lineTo(20,-20);ctx.lineTo(22,0);ctx.stroke();
      ctx.fillStyle='#21121c';ctx.beginPath();ctx.moveTo(-18,-72);ctx.lineTo(18,-72);ctx.lineTo(22,-40);ctx.lineTo(-20,-38);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#21121c';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-13,-64);ctx.lineTo(-32,-48);ctx.lineTo(-36,-29);ctx.stroke();
      ctx.beginPath();ctx.moveTo(13,-64);ctx.lineTo(27,-52);ctx.lineTo(31,-39);ctx.stroke();
      // The injured side ends in a torn sleeve, with no graphic detail.
      ctx.fillStyle='#32101e';ctx.beginPath();ctx.moveTo(-15,-65);ctx.lineTo(-6,-62);ctx.lineTo(-10,-50);ctx.lineTo(-22,-53);ctx.closePath();ctx.fill();
      ctx.fillStyle='#c5a29b';ctx.beginPath();ctx.ellipse(0,-87,14,16,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#140c16';ctx.beginPath();ctx.moveTo(-16,-91);ctx.lineTo(-12,-106);ctx.lineTo(-2,-100);ctx.lineTo(10,-105);ctx.lineTo(16,-91);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#a82b4b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-9,-92);ctx.lineTo(-3,-85);ctx.moveTo(4,-90);ctx.lineTo(10,-85);ctx.stroke();
      ctx.restore();
    }
    function crow(x,y,phase,sc,color){
      ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle=color||'#05060b';
      const wing=Math.sin(phase)*7;
      ctx.beginPath();ctx.moveTo(-13,1);ctx.quadraticCurveTo(-6,-7-wing,-1,0);ctx.quadraticCurveTo(7,-8+wing,15,1);ctx.quadraticCurveTo(6,-1,1,5);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(16,-2);ctx.lineTo(10,3);ctx.closePath();ctx.fill();ctx.restore();
    }
    function brokenGround(y){
      ctx.fillStyle='rgba(3,4,9,.9)';ctx.beginPath();ctx.moveTo(0,y+12);ctx.lineTo(w*.12,y+4);ctx.lineTo(w*.25,y+13);ctx.lineTo(w*.39,y+2);ctx.lineTo(w*.52,y+11);ctx.lineTo(w*.69,y+1);ctx.lineTo(w*.82,y+9);ctx.lineTo(w,y+3);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(97,102,131,.36)';ctx.lineWidth=2;for(let i=0;i<8;i++){const x=i*w/8;ctx.beginPath();ctx.moveTo(x,y+10);ctx.lineTo(x+18,y+33);ctx.lineTo(x+7,y+49);ctx.stroke();}
    }

    if(time<5){
      // Gojo is trapped in the last residual layer of the Mangekyo illusion.
      const p=clamp01(time/5),cx=w*(.51+.035*Math.sin(time*2.8)),cy=h*.48;
      ctx.globalAlpha=.08+.12*(.5+.5*Math.sin(time*11));ctx.fillStyle='#ff123e';ctx.fillRect(0,0,w,h);
      figureGojo(w*.5-20, h*.8, 1.12, .28);
      figureGojo(w*.5+26+Math.sin(time*8)*9,h*.8,1.12,.25);
      ctx.globalAlpha=.55+.25*Math.sin(time*8);ctx.strokeStyle='#ff204b';ctx.lineWidth=2;
      for(let i=0;i<7;i++){const r=38+i*53+Math.sin(time*4+i)*6;ctx.beginPath();ctx.ellipse(cx,cy,r,r*.48,time*.12+i*.15,0,Math.PI*2);ctx.stroke();}
      // Three rotating tomoe-like marks, drawn as an original symbol.
      ctx.globalAlpha=.8;ctx.strokeStyle='#ff4e68';ctx.lineWidth=3;ctx.beginPath();ctx.arc(w*.72,h*.36,50+8*Math.sin(time*9),0,Math.PI*2);ctx.stroke();
      for(let i=0;i<3;i++){const a=time*1.7+i*Math.PI*2/3;ctx.fillStyle='#ff3557';ctx.beginPath();ctx.ellipse(w*.72+Math.cos(a)*23,h*.36+Math.sin(a)*23,7,14,a,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=clamp01((time-2.3)/1.9);ctx.strokeStyle='#f7eaff';ctx.lineWidth=3;
      const cracks=[[.12,.10,.38,.44],[.82,.12,.63,.37],[.2,.9,.42,.56],[.9,.92,.63,.59],[.45,.04,.5,.29],[.03,.54,.33,.49]];
      for(const a of cracks){ctx.beginPath();ctx.moveTo(a[0]*w,a[1]*h);ctx.lineTo(a[2]*w,a[3]*h);ctx.lineTo((a[2]+.035)*w,(a[3]+.07)*h);ctx.lineTo((a[2]-.015)*w,(a[3]+.11)*h);ctx.stroke();}
      ctx.globalAlpha=clamp01((time-3.4)/1.1);ctx.fillStyle='#f5e9ff';ctx.fillRect(0,0,w,h);
      ctx.globalAlpha=1-clamp01((time-4.1)/.9);ctx.fillStyle='#190714';ctx.fillRect(0,0,w,h);
      ctx.restore();return;
    }

    if(time<15){
      // Cutaway: Itachi and Sukuna have reached a ruined shrine, well away from Gojo.
      const moon=ctx.createRadialGradient(w*.78,h*.2,8,w*.78,h*.2,130);
      moon.addColorStop(0,'rgba(255,225,237,.95)');moon.addColorStop(.35,'rgba(178,102,139,.38)');moon.addColorStop(1,'rgba(88,24,58,0)');
      ctx.fillStyle=moon;ctx.fillRect(0,0,w,h);
      ctx.fillStyle='#d8cbd8';ctx.beginPath();ctx.arc(w*.78,h*.2,37,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(22,13,28,.6)';for(let i=0;i<9;i++){const x=i*w/8;ctx.beginPath();ctx.moveTo(x,h*.69);ctx.lineTo(x+35,h*(.57+(i%3)*.025));ctx.lineTo(x+62,h*.72);ctx.closePath();ctx.fill();}
      ctx.fillStyle='#0b0b15';ctx.beginPath();ctx.moveTo(w*.13,h*.72);ctx.lineTo(w*.26,h*.61);ctx.lineTo(w*.35,h*.70);ctx.lineTo(w*.35,h*.87);ctx.lineTo(w*.13,h*.87);ctx.closePath();ctx.fill();
      // A distant shrine gate and a broken roof establish a different location.
      ctx.strokeStyle='#43202f';ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(w*.43,h*.48);ctx.lineTo(w*.43,h*.83);ctx.moveTo(w*.59,h*.48);ctx.lineTo(w*.59,h*.83);ctx.moveTo(w*.39,h*.47);ctx.lineTo(w*.63,h*.47);ctx.moveTo(w*.42,h*.43);ctx.lineTo(w*.61,h*.43);ctx.stroke();
      brokenGround(h*.84);
      figureItachi(w*.54,h*.84,1.04,true);
      figureSukuna(w*.75,h*.84,1.02);
      ctx.globalAlpha=.2+.13*Math.sin(time*4);ctx.strokeStyle='#f42d55';ctx.lineWidth=2;ctx.beginPath();ctx.arc(w*.54,h*.36,80+10*Math.sin(time*5),0,Math.PI*2);ctx.stroke();
      for(let i=0;i<7;i++)crow(w*(.16+i*.13)+Math.sin(time+i)*9,h*(.28+(i%3)*.08)+Math.cos(time*1.4+i)*6,time*5+i,.45+i%2*.17,'#07070c');
      ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,.34)';ctx.fillRect(0,h*.87,w,h*.13);
      ctx.textAlign='left';ctx.font='800 10px Consolas,monospace';ctx.fillStyle='#dd9cb1';ctx.fillText('UNKNOWN SHRINE  /  AFTER THE GENJUTSU',32,h-35);
      ctx.restore();return;
    }

    // Chapter 4 title beat. Gojo regains focus while the crows mark the escape route.
    const arrival=time-15;
    ctx.fillStyle='rgba(4,7,17,.42)';ctx.fillRect(0,0,w,h);
    const haze=ctx.createRadialGradient(w*.45,h*.55,18,w*.45,h*.55,w*.7);
    haze.addColorStop(0,'rgba(70,91,150,.16)');haze.addColorStop(1,'rgba(5,8,18,0)');
    ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
    brokenGround(h*.83);
    figureGojo(w*.27,h*.83,1.2,1);
    for(let i=0;i<18;i++){
      const p=(arrival*.11+i*.09)%1;
      const x=w*(.48+p*.68);
      const y=h*(.22+((i*37)%61)/100)+Math.sin(time*4+i)*9;
      crow(x,y,time*8+i,.45+(i%3)*.14,i%4===0?'#ff365b':'#03050a');
    }
    ctx.globalAlpha=.45;ctx.strokeStyle='#ff3456';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(w*.40,h*.67);ctx.bezierCurveTo(w*.55,h*.52,w*.64,h*.77,w*.86,h*.42);ctx.stroke();
    ctx.globalAlpha=clamp01((arrival-4.1)/1.2);
    ctx.textAlign='center';ctx.font='900 14px Consolas,monospace';ctx.fillStyle='#ff6b83';
    ctx.fillText('CHAPTER 4',w*.5,h*.29);
    ctx.font='900 29px Impact, "Segoe UI", sans-serif';ctx.fillStyle='#f1ecff';
    ctx.fillText('THE EYES BEYOND INFINITY',w*.5,h*.36);
    ctx.globalAlpha=clamp01((arrival-6.1)/.8);ctx.font='800 10px Consolas,monospace';ctx.fillStyle='#c0c9e0';
    ctx.fillText('FOLLOW THE CROWS',w*.5,h*.42);
    ctx.restore();
  }

  function beginChapter4Pursuit(c){
    if(!c||c.stage==='ch4Pursuit')return;
    const g=c.gojo,s=c.sukuna,center=c.openingCenter||ARENA_W/2;
    removeYutaProp(c);
    c.stage='ch4Pursuit';c.t=0;c.ch4Clock=0;c.caption=null;c.lastLine='';
    c.ch4StartX=center-85;c.ch4GoalX=ARENA_W-WALL-120;c.ch4Arrived=false;c.ch4Inspected=false;c.ch4UpLast=false;c.ch4JumpT=null;
    resetActor(g,c.ch4StartX,1);g.ai=null;g.storyCinePose=null;
    resetActor(s,ARENA_W+1400,-1);s.ai=null;s.hp=Math.max(1,s.maxHp||100);s.storyCinePose=null;
    if(g){g.opp=s;g.state='IDLE';}if(s)s.opp=g;
    if(G.fighters)G.fighters=G.fighters.filter(f=>f===g||f===s);
    G.mode='story';G.story.chapter=4;G.story.act=1;G.story.phase=5;G.story.cutscene=false;
    G.storyCutscene=false;G.matchOver=false;G.matchOverScreen=false;G.roundState='fight';G.roundTimer=0;G.paused=false;
    G.domain=null;G.clash=null;G.winner=null;G.flash=0;G.shake=0;G.shakeX=0;G.shakeY=0;
    G.projectiles=[];G.hitEffects=[];G.hits=[];
    camera(g.x+180,GROUND-145,.9);
    safeStore('jff_story_ch3_complete','1');safeStore('jff_story_unlocked_ch3','1');safeStore('jff_story_ch4_started','1');
    try{if(typeof syncStoryArchive==='function')syncStoryArchive();}catch(e){}
    line(c,'ch4-pursuit-ready','GOJO','Bám theo đàn quạ. Chúng sẽ dẫn ta đến chỗ hắn.','#9fe9ff');
  }

  function tickChapter4Pursuit(c){
    if(!c||G.paused||!c.gojo)return;
    const g=c.gojo;const inp=readInput(KEYMAP.p1);
    c.ch4Clock=(c.ch4Clock||0)+STEP;
    const axis=(inp.right||0)-(inp.left||0);
    const speed=inp.soru?8.1:4.35;
    if(axis!==0){
      g.x=clamp(g.x+axis*speed,WALL+90,c.ch4GoalX);
      g.facing=axis>0?1:-1;g.state='WALK';g.walk=(g.walk||0)+.28;g.stateFrame=(g.stateFrame||0)+1;
    }else if(inp.down){g.state='CROUCH';g.walk=0;g.stateFrame=(g.stateFrame||0)+1;}
    else{g.state='IDLE';g.walk=(g.walk||0)*.72;g.stateFrame=(g.stateFrame||0)+1;}
    const jumpPressed=!!inp.up&&!c.ch4UpLast;c.ch4UpLast=!!inp.up;
    if(jumpPressed&&c.ch4JumpT==null)c.ch4JumpT=0;
    if(c.ch4JumpT!=null){
      c.ch4JumpT+=STEP*2.25;const p=clamp01(c.ch4JumpT);
      g.y=GROUND-Math.sin(p*Math.PI)*92;
      if(p>=1){g.y=GROUND;c.ch4JumpT=null;}
    }else g.y=GROUND;
    g.vx=0;g.vy=0;g.move=null;g.hitstun=0;g.animT=(g.animT||0)+(axis? .22: .055);
    g.storyCinePose=null;
    if(g.x>=c.ch4GoalX-1&&!c.ch4Arrived){
      c.ch4Arrived=true;
      line(c,'ch4-arrival','GOJO','Dấu vết này... dẫn vào một ngôi đền?','#9fe9ff');
    }
    camera(g.x+180,GROUND-145,.9);
    if(c.ch4Arrived&&c.ch4Inspected){
      // Keep the trail exploration playable after the discovery prompt is acknowledged.
      g.state='IDLE';g.walk=0;
    }
  }

  function drawChapter4PursuitFX(c){
    if(!c||!c.gojo)return;
    const g=c.gojo,goal=c.ch4GoalX,sc=cam.zoom;
    const sx=x=>W/2+(x-cam.x)*sc,sy=y=>H/2+(y-cam.y)*sc;
    ctx.save();
    // Minimal cinematic HUD instead of combat meters during the pursuit.
    ctx.fillStyle='rgba(3,6,15,.78)';ctx.fillRect(0,0,W,48);
    ctx.textAlign='left';ctx.font='800 10px Consolas,monospace';ctx.fillStyle='#b3c5e5';
    ctx.fillText('CHAPTER 4  /  THE EYES BEYOND INFINITY',24,19);
    ctx.font='900 12px Consolas,monospace';ctx.fillStyle=c.ch4Arrived?'#ff8ca0':'#e4eaff';
    ctx.fillText(c.ch4Arrived?'TRAIL ENDS HERE':'OBJECTIVE  /  FOLLOW THE CROWS',24,36);
    const prog=clamp01((g.x-c.ch4StartX)/(goal-c.ch4StartX));
    ctx.fillStyle='rgba(160,179,213,.18)';ctx.fillRect(W-314,19,270,7);
    const bar=ctx.createLinearGradient(W-314,0,W-44,0);bar.addColorStop(0,'#8fdfff');bar.addColorStop(1,'#ff536d');
    ctx.fillStyle=bar;ctx.fillRect(W-314,19,270*prog,7);
    ctx.textAlign='right';ctx.font='800 9px Consolas,monospace';ctx.fillStyle='#9baac5';ctx.fillText(Math.round(prog*100)+'%',W-44,38);

    // Flock guides the eye toward the goal, with subtle wing motion and a cursed-energy ribbon.
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.18;
    ctx.strokeStyle='#a78bfa';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(sx(g.x+55),sy(GROUND-105));
    ctx.bezierCurveTo(sx(g.x+210),sy(GROUND-205),sx(goal-260),sy(GROUND-35),sx(goal),sy(GROUND-140));ctx.stroke();
    ctx.restore();
    for(let i=0;i<11;i++){
      const wx=Math.min(goal-36,g.x+170+i*76);
      const phase=(c.ch4Clock||0)*9+i*1.7;
      const wy=GROUND-115-Math.sin(phase*.55)*21-(i%3)*22;
      const x=sx(wx),y=sy(wy);
      if(x<-30||x>W+30)continue;
      ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.fillStyle=i%4===0?'#ff526f':'#090b13';
      const wing=Math.sin(phase)*7;
      ctx.beginPath();ctx.moveTo(-13,1);ctx.quadraticCurveTo(-7,-8-wing,-1,0);ctx.quadraticCurveTo(6,-9+wing,14,1);ctx.quadraticCurveTo(6,-1,1,4);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(16,-2);ctx.lineTo(10,3);ctx.closePath();ctx.fill();ctx.restore();
    }
    const gx=sx(goal+34),gy=sy(GROUND);
    if(gx>-120&&gx<W+120){
      ctx.save();ctx.translate(gx,gy);ctx.scale(sc,sc);
      ctx.strokeStyle='#221c2c';ctx.lineWidth=13;ctx.beginPath();
      ctx.moveTo(-47,-5);ctx.lineTo(-47,-210);ctx.moveTo(47,-5);ctx.lineTo(47,-210);
      ctx.moveTo(-82,-210);ctx.lineTo(82,-210);ctx.moveTo(-58,-232);ctx.lineTo(58,-232);ctx.stroke();
      ctx.strokeStyle='#a12b49';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-41,-202);ctx.lineTo(39,-202);ctx.moveTo(0,-194);ctx.lineTo(0,-148);ctx.stroke();
      ctx.restore();
    }
    if(c.caption){
      const cue=c.caption,bw=Math.min(830,W-100),bx=(W-bw)/2,by=H-108,bh=67;
      ctx.fillStyle='rgba(3,6,13,.92)';ctx.fillRect(bx,by,bw,bh);
      ctx.strokeStyle=cue.color||'#9fe9ff';ctx.lineWidth=2;ctx.strokeRect(bx,by,bw,bh);
      ctx.textAlign='left';ctx.font='900 11px "Segoe UI",sans-serif';ctx.fillStyle=cue.color||'#9fe9ff';ctx.fillText(cue.speaker,bx+18,by+21);
      ctx.font='700 16px "Segoe UI",sans-serif';ctx.fillStyle='#f4f7ff';ctx.fillText(cue.text,bx+18,by+47,bw-36);
    }else if(c.ch4Arrived){
      ctx.fillStyle='rgba(3,6,13,.84)';ctx.fillRect(W*.22,H-100,W*.56,54);
      ctx.textAlign='center';ctx.font='900 11px Consolas,monospace';ctx.fillStyle='#ff9bab';ctx.fillText('SEALED SHRINE AHEAD  /  PRESS ENTER TO INSPECT',W*.5,H-68);
    }else{
      ctx.fillStyle='rgba(3,6,13,.72)';ctx.fillRect(24,H-48,540,24);
      ctx.textAlign='left';ctx.font='800 10px Consolas,monospace';ctx.fillStyle='#c6d3e8';
      ctx.fillText('A / D  MOVE     W  VAULT     SHIFT  SORU DASH',36,H-32);
    }
    ctx.restore();
  }

  function tickEnding(c){
    const center=c.openingCenter||ARENA_W/2,g=c.gojo,s=c.sukuna;
    if(c.stage==='defeat'){
      c.t+=STEP;camera((g.x+s.x)/2,GROUND-125,.9);
      if(c.t>2.6){c.stage='failedCard';c.t=2.6;G.matchOverScreen=true;G.roundState='over';}
      return;
    }
    c.t=Math.min(87,c.t+STEP);const t=c.t,phaseT=t<20?t:t-20;
    G.flash=Math.max(0,(G.flash||0)-.035);G.shake=Math.max(0,(G.shake||0)-.45);
    if(!g||!s)return;
    const i=fightKeyIndex(t),a=finalFightKeys[i],b=finalFightKeys[Math.min(i+1,finalFightKeys.length-1)];
    const raw=clamp01((t-a[0])/Math.max(.001,b[0]-a[0])),q=ease(raw);c.finalKeyIndex=i;
    if(c.finalSeenKey!==i){c.finalSeenKey=i;if(a[9])triggerFinalFightEvent(c,a[9],t);}
    g.x=center+mix(a[1],b[1],raw);s.x=center+mix(a[2],b[2],raw);
    g.y=GROUND-mix(a[3],b[3],q);s.y=GROUND-mix(a[4],b[4],q);
    g.facing=1;s.facing=-1;g.vx=0;s.vx=0;g.vy=0;s.vy=0;g.walk=0;s.walk=0;
    g.state='IDLE';s.state='IDLE';g.move=null;s.move=null;g.hitstun=0;s.hitstun=0;
    g.storyCinePose='ch3-final-'+a[5];s.storyCinePose='ch3-final-'+a[6];
    g.animT+=.72+Math.sin(phaseT*7.1)*.04;s.animT+=.68+Math.sin(phaseT*6.7)*.04;
    if(c.yuta){c.yuta.x=center-390;c.yuta.y=GROUND;c.yuta.vx=0;c.yuta.vy=0;c.yuta.walk=0;c.yuta.state='KNOCKDOWN';c.yuta.storyCinePose='ch3-yuta-fallen';c.yuta.animT+=.16;}
    let camY=GROUND-137;
    if(t>=20){
      camY=GROUND-140;
      if(phaseT>=6.7&&phaseT<15)camY=GROUND-205;
      else if(phaseT>=15&&phaseT<17.2)camY=GROUND-mix(205,142,ease(clamp01((phaseT-15)/2.2)));
    }
    camera(center+mix(a[7],b[7],q),camY,mix(a[8],b[8],q));
    if(t>=20&&phaseT>=35.2){
      const escape=ease(clamp01((phaseT-35.2)/1.8));
      s.x=center+mix(250,980,escape);s.y=GROUND;s.storyCinePose='ch3-final-wallLean';
    }
    if(t<20){
      if(t>.62&&t<.88)line(c,'ending-sukuna','SUKUNA','Too slow.','#ff8190');
      if(t>7.02&&t<7.28)line(c,'ending-blue-old','GOJO','Blue.','#9fe9ff');
      if(t>8.64&&t<8.88)line(c,'ending-red-old','GOJO','Red.','#a9e9ff');
      if(t>13&&t<13.3)line(c,'ending-purple-old','GOJO','Hollow Purple.','#a9e9ff');
    }else if(t<62){
      if(phaseT>.38&&phaseT<.9)line(c,'ending-blue','GOJO','Blue.','#9fe9ff');
      if(phaseT>2.04&&phaseT<2.48)line(c,'ending-red','GOJO','Red.','#ff9ba8');
      if(phaseT>9.72&&phaseT<10.2)line(c,'ending-purple','GOJO','MURASAKI!','#e7c8ff');
      if(phaseT>21.12&&phaseT<21.7)line(c,'ending-aftermath-gojo','GOJO','Phù... đúng là tốn sức thật.','#9fe9ff');
      if(phaseT>22.15&&phaseT<22.7)line(c,'ending-aftermath-sukuna','SUKUNA','Đừng vội ăn mừng, Gojo Satoru.','#ff8190');
      if(phaseT>23.22&&phaseT<23.8)line(c,'ending-aftermath-gojo2','GOJO','Vậy thì đứng dậy đi.','#9fe9ff');
      if(phaseT>25.35&&phaseT<25.9)line(c,'ending-final-warning','GOJO','Kết thúc rồi, Sukuna.','#9fe9ff');
      if(phaseT>27.18&&phaseT<27.65)line(c,'itachi-reveal-line','ITACHI','Sharingan.','#ff5268');
      if(phaseT>28.05&&phaseT<28.55)line(c,'gojo-notices-itachi','GOJO','Cái... gì?','#9fe9ff');
      if(phaseT>30.22&&phaseT<30.75)line(c,'gojo-genjutsu-line','GOJO','Không gian này... đang bóp méo?','#9fe9ff');
      if(phaseT>33.2&&phaseT<33.75)line(c,'itachi-escape-line','ITACHI','Chúng ta rời đi, Sukuna.','#ff5268');
      if(phaseT>35.85&&phaseT<36.4)line(c,'sukuna-retreat-line','SUKUNA','Tch... món nợ này chưa xong đâu, Gojo.','#ff8190');
      if(phaseT>38.05&&phaseT<38.7)line(c,'gojo-recovered-line','GOJO','Ảo giác...? Ai vừa cứu hắn?','#9fe9ff');
    }else{
      const post=t-62;
      if(post>.36&&post<.95)line(c,'ch4-afterimage','GOJO','Không gian... vừa bị viết lại?','#9fe9ff');
      if(post>5.7&&post<6.25)line(c,'ch4-itachi-purpose','ITACHI','Ta không cứu ngươi. Ta cần ngươi còn sống.','#ff5268');
      if(post>8.1&&post<8.65)line(c,'ch4-sukuna-pride','SUKUNA','Đừng nhầm ta với thuộc hạ của ngươi.','#ff8190');
      if(post>10.75&&post<11.35)line(c,'ch4-itachi-reply','ITACHI','Ta chưa bao giờ mắc sai lầm đó.','#ff5268');
      if(post>16.1&&post<16.75)line(c,'ch4-gojo-pursuit','GOJO','Chạy đi. Ta sẽ tìm ra các ngươi.','#9fe9ff');
    }
    if(t>=87){beginChapter4Pursuit(c);return;}
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
    ctx.fillStyle='#9eb4d7';ctx.font='800 9px Consolas,monospace';ctx.textAlign='left';ctx.fillText(c.stage==='ending'&&c.t>=62?'JUJUTSU CHRONICLES  /  CHAPTER 4':'JUJUTSU CHRONICLES  /  CHAPTER 3',25,20);
    ctx.textAlign='right';ctx.fillStyle='#6b819f';ctx.fillText(c.stage==='intro'?'CONTINUING FROM CHAPTER 2':(c.stage==='domainIntro'?'DOMAIN COLLISION':(c.stage==='ending'?(c.t<20?'FINAL EXCHANGE':(c.t<62?'HOLLOW PURPLE / EYES IN THE DARK':'THE EYES BEYOND INFINITY')):(c.stage==='defeat'?'DEFEAT':'AWAKENING'))),W-25,20);
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
  function drawCombatChoreographyFX(c) {
    const t = c.t || 0;
    const g = c.gojo, enemy = c.sukuna;
    if (!g || !enemy) return;
    const center = c.openingCenter || ARENA_W / 2;
    const screenX = function(x) { return W / 2 + (x - cam.x) * cam.zoom; };
    const screenY = function(y) { return H / 2 + (y - cam.y) * cam.zoom; };
    const gx = screenX(g.x), sx = screenX(enemy.x);
    const gy = screenY(GROUND - 108), sy = screenY(GROUND - 108);
    ctx.save();
    const vignette = ctx.createRadialGradient(W*.5,H*.46,Math.min(W,H)*.24,W*.5,H*.46,Math.max(W,H)*.78);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0,0,W,H);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const slashTimes = [[1.3,1.7],[4.06,4.43],[4.56,4.91],[5.48,5.86],[6.58,6.94],[8.04,8.36],[10,10.34],[11.08,11.42],[11.92,12.25],[14.1,14.58],[15.3,15.78]];
    for (let i = 0; i < slashTimes.length; i++) {
      const start = slashTimes[i][0], end = slashTimes[i][1];
      if (t < start || t > end) continue;
      const p = (t - start) / (end - start);
      const alpha = Math.sin(p * Math.PI);
      for (let k = 0; k < 3; k++) {
        ctx.globalAlpha = alpha * (k === 0 ? .85 : .3);
        ctx.strokeStyle = k === 1 ? '#ffb6c0' : '#ff445b';
        ctx.lineWidth = (k === 0 ? 2.4 : 1) * cam.zoom;
        ctx.beginPath();
        ctx.moveTo(sx - 8 * cam.zoom, sy - (62 - k*12) * cam.zoom);
        ctx.quadraticCurveTo((sx+gx)*.5, sy - 8 * cam.zoom, gx + 8 * cam.zoom, gy + (5+k*12)*cam.zoom);
        ctx.stroke();
      }
    }
    if (t >= 7.12 && t <= 8.92) {
      const ox = screenX(g.x+42), oy = screenY(GROUND-124);
      const radius = (17 + Math.sin(t*8)*1.5) * cam.zoom;
      const orb = ctx.createRadialGradient(ox,oy,1,ox,oy,radius*2.4);
      orb.addColorStop(0,'rgba(250,254,255,.98)');
      orb.addColorStop(.24,'rgba(128,225,255,.88)');
      orb.addColorStop(.62,'rgba(43,135,255,.34)');
      orb.addColorStop(1,'rgba(35,99,255,0)');
      ctx.fillStyle = orb;
      ctx.globalAlpha = .97;
      ctx.beginPath(); ctx.arc(ox,oy,radius*2.4,0,Math.PI*2); ctx.fill();
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = .4 - i*.06;
        ctx.strokeStyle = i%2 ? '#e6fbff' : '#65cfff';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(ox,oy,radius*(1.15+i*.32),radius*(.72+i*.22),t*1.3+i*.65,0,Math.PI*2);
        ctx.stroke();
      }
    }
    if (t >= 8.63 && t < 9.32) {
      const p = clamp01((t-8.78)/.45);
      const ox = screenX(g.x+42), oy = screenY(GROUND-118);
      const radius = (12+p*32)*cam.zoom;
      ctx.globalAlpha = 1-p*.55;
      ctx.strokeStyle = '#ff415b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ox,oy,radius,0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha = (1-p)*.65;
      ctx.beginPath(); ctx.arc(ox,oy,radius*1.5,0,Math.PI*2); ctx.stroke();
    }
    if (t >= 12.82 && t < 14.95) {
      const p = clamp01((t-12.82)/1.95);
      const ox = screenX(g.x+44), oy = screenY(GROUND-127);
      const radius = (10+p*10)*cam.zoom;
      ctx.globalAlpha = .88;
      ctx.strokeStyle = '#7fddff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ox-15*cam.zoom,oy,radius,0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha = .9;
      ctx.strokeStyle = '#ff5268';
      ctx.beginPath(); ctx.arc(ox+17*cam.zoom,oy-5*cam.zoom,radius*.86,0,Math.PI*2); ctx.stroke();
    }
    if (t >= 14.92 && t < 16.55) {
      const progress = clamp01((t-14.92)/1.12);
      const x1 = screenX(g.x+45), y1 = screenY(GROUND-125);
      const x2 = screenX(mix(g.x+80,center+42,progress)), y2 = screenY(GROUND-120);
      let fade = 1;
      if (t > 16.02) fade = clamp01((16.55-t)/.53);
      ctx.globalAlpha = .19*fade; ctx.strokeStyle = '#8ce4ff'; ctx.lineWidth = 34*cam.zoom; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.globalAlpha = .8*fade; ctx.strokeStyle = '#bd83ff'; ctx.lineWidth = 16*cam.zoom;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.globalAlpha = .98*fade; ctx.strokeStyle = '#f4faff'; ctx.lineWidth = 4*cam.zoom;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.lineCap = 'butt';
    }
    if (t >= 16 && t < 17.65) {
      const p = clamp01((t-16)/1.55);
      const cx = screenX(center+42), cy = screenY(GROUND-120);
      const radius = (18+p*250)*cam.zoom;
      ctx.globalAlpha = (1-p)*.78; ctx.strokeStyle = '#f4fbff'; ctx.lineWidth = 2.2+p;
      ctx.beginPath(); ctx.ellipse(cx,cy,radius,radius*.55,0,0,Math.PI*2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const angle = Math.PI*2*i/12 + t*.25;
        const inner = 34*cam.zoom, outer = (90+p*175)*cam.zoom;
        ctx.globalAlpha = (1-p)*.24;
        ctx.strokeStyle = i%2 ? '#ff647b' : '#99e2ff';
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(angle)*inner,cy+Math.sin(angle)*inner*.65);
        ctx.lineTo(cx+Math.cos(angle)*outer,cy+Math.sin(angle)*outer*.65);
        ctx.stroke();
      }
    }
    const age = t - (c.finalFxAt === undefined ? -100 : c.finalFxAt);
    if (age >= 0 && age < .27) {
      const cx = screenX((g.x+enemy.x)*.5), cy = screenY(GROUND-105);
      const p = age/.27;
      ctx.globalAlpha = (1-p)*.72;
      ctx.strokeStyle = c.finalFxEvent === 'red_burst' ? '#ff5268' : '#f4fbff';
      ctx.beginPath();
      ctx.ellipse(cx,cy,(18+p*58)*cam.zoom,(10+p*40)*cam.zoom,0,0,Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();
    let shot = '01 / READ THE OPPONENT';
    if (t >= 2 && t < 4.05) shot = '02 / INFINITY COUNTER';
    else if (t >= 4.05 && t < 6) shot = '03 / CLOSE-QUARTERS EXCHANGE';
    else if (t >= 6 && t < 7.1) shot = '04 / PARRY AND BODY SHOTS';
    else if (t >= 7.1 && t < 8.63) shot = '05 / BLUE PULL';
    else if (t >= 8.63 && t < 9.4) shot = '06 / RED REPULSION';
    else if (t >= 9.4 && t < 12.6) shot = '07 / COMBO COUNTERS';
    else if (t >= 12.6 && t < 14.92) shot = '08 / CONVERGENCE';
    else if (t >= 14.92 && t < 16) shot = '09 / HOLLOW PURPLE';
    else if (t >= 16 && t < 18.65) shot = '10 / IMPACT AND FALL';
    else if (t >= 18.65) shot = '11 / AFTERMATH';
    ctx.globalAlpha = .88; ctx.textAlign = 'center'; ctx.font = '800 10px Consolas,monospace';
    ctx.fillStyle = (t >= 14.92 && t < 18) ? '#efe0ff' : '#dce8fa';
    ctx.fillText(shot,W/2,58);
    ctx.textAlign = 'left'; ctx.globalAlpha = .7; ctx.fillStyle = '#b9c9df';
    ctx.font = '800 9px Consolas,monospace'; ctx.fillText('FINAL EXCHANGE / 20 SEC',24,H-46);
    ctx.restore();
  }

  function drawEndingCinematicFX(c) {
    const absoluteTime=c.t||0;
    if(absoluteTime>=62){drawChapter4ContinuationFX(c,absoluteTime-62);return;}
    const timelineT=c.t||0;
    if(timelineT<20){drawCombatChoreographyFX(c);return;}
    const t=timelineT-20,g=c.gojo,enemy=c.sukuna;
    if(!g||!enemy)return;
    const center=c.openingCenter||ARENA_W/2;
    const sx=x=>W/2+(x-cam.x)*cam.zoom;
    const sy=y=>H/2+(y-cam.y)*cam.zoom;
    const gx=sx(g.x),ex=sx(enemy.x),ground=sy(GROUND);
    const scale=cam.zoom;
    ctx.save();
    const vignette=ctx.createRadialGradient(W*.5,H*.44,Math.min(W,H)*.18,W*.5,H*.44,Math.max(W,H)*.82);
    vignette.addColorStop(0,'rgba(0,0,0,0)');
    vignette.addColorStop(1,'rgba(0,0,0,.34)');
    ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);

    if(t<15.15){
      const p=clamp01(t/2),drift=ease(clamp01((t-5.6)/2)),orbX=t>5.6?mix(center-35,center+7,drift):center-35;
      const launchY=mix(GROUND-128,GROUND-330,ease(p));
      const bx=sx(orbX),by=sy(launchY);
      const radius=(t<2?13+6*clamp01(t/1.5):19)*scale;
      ctx.save();ctx.globalCompositeOperation='lighter';
      const glow=ctx.createRadialGradient(bx,by,1,bx,by,radius*3.5);
      glow.addColorStop(0,'rgba(255,255,255,.98)');glow.addColorStop(.18,'rgba(194,245,255,.96)');
      glow.addColorStop(.52,'rgba(41,155,255,.65)');glow.addColorStop(1,'rgba(41,130,255,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(bx,by,radius*3.5,0,Math.PI*2);ctx.fill();
      for(let j=0;j<3;j++){
        ctx.globalAlpha=.65-j*.13;ctx.strokeStyle=j===0?'#f4ffff':'#75d8ff';ctx.lineWidth=(1.2+j*.45)*scale;
        ctx.beginPath();ctx.ellipse(bx,by,radius*(1.2+j*.42),radius*(.8+j*.3),t*.8+j*.75,0,Math.PI*2);ctx.stroke();
      }
      if(t<2){ctx.globalAlpha=.5*(1-p);ctx.strokeStyle='#7fe4ff';ctx.lineWidth=2*scale;ctx.beginPath();ctx.moveTo(sx(center-47),sy(GROUND-132));ctx.lineTo(bx,by+radius*2);ctx.stroke();}
      ctx.restore();
    }
    if(t>=2&&t<15.15){
      const p=clamp01((t-2)/2),drift=ease(clamp01((t-5.6)/2)),orbX=t>5.6?mix(center+57,center+7,drift):center+57;
      const riseY=mix(GROUND-135,GROUND-330,ease(p));
      const rx=sx(orbX),ry=sy(riseY),radius=(t<4?12+7*clamp01((t-2)/1.6):19)*scale;
      ctx.save();ctx.globalCompositeOperation='lighter';
      const glow=ctx.createRadialGradient(rx,ry,1,rx,ry,radius*3.5);
      glow.addColorStop(0,'rgba(255,255,255,.96)');glow.addColorStop(.18,'rgba(255,215,225,.94)');
      glow.addColorStop(.52,'rgba(255,53,91,.66)');glow.addColorStop(1,'rgba(255,35,79,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(rx,ry,radius*3.5,0,Math.PI*2);ctx.fill();
      for(let j=0;j<3;j++){
        ctx.globalAlpha=.6-j*.12;ctx.strokeStyle=j===0?'#fff3f5':'#ff657b';ctx.lineWidth=(1.2+j*.45)*scale;
        ctx.beginPath();ctx.ellipse(rx,ry,radius*(1.2+j*.42),radius*(.8+j*.3),-t*.7-j*.6,0,Math.PI*2);ctx.stroke();
      }
      if(t<4){ctx.globalAlpha=.48*(1-p);ctx.strokeStyle='#ff788b';ctx.lineWidth=2*scale;ctx.beginPath();ctx.moveTo(sx(g.x+32),sy(GROUND-125));ctx.lineTo(rx,ry+radius*2);ctx.stroke();}
      ctx.restore();
    }
    if(t>=5.6&&t<10.1){
      const p=clamp01((t-5.6)/2.0),bx=sx(mix(center-35,center+7,ease(p))),rx=sx(mix(center+57,center+7,ease(p)));
      const by=sy(GROUND-330),ry=sy(GROUND-330),rad=(17+10*Math.sin(Math.min(1,p)*Math.PI))*scale;
      ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.72;ctx.strokeStyle='#c8f7ff';ctx.lineWidth=2*scale;ctx.beginPath();ctx.ellipse((bx+rx)/2,by,Math.abs(rx-bx)/2+rad,rad*1.25,t*1.5,0,Math.PI*2);ctx.stroke();
      if(t<8){
        for(const orb of [{x:bx,y:by,c:'#7bdfff'},{x:rx,y:ry,c:'#ff657b'}]){
          ctx.globalAlpha=.62;ctx.strokeStyle=orb.c;ctx.lineWidth=1.5*scale;ctx.beginPath();ctx.arc(orb.x,orb.y,rad*(1.6+p),0,Math.PI*2);ctx.stroke();
        }
      }else{
        const core=ctx.createRadialGradient(sx(center+7),by,1,sx(center+7),by,rad*4.3);
        core.addColorStop(0,'rgba(255,255,255,1)');core.addColorStop(.2,'rgba(255,221,255,.98)');
        core.addColorStop(.48,'rgba(175,93,255,.8)');core.addColorStop(1,'rgba(123,44,255,0)');
        ctx.fillStyle=core;ctx.beginPath();ctx.arc(sx(center+7),by,rad*4.3,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }

    if(t>=15&&t<26.6){
      const wallX=ex+19*scale,wallTop=sy(GROUND-258);
      ctx.save();ctx.globalAlpha=clamp01((t-15)/.6)*.88;
      const wall=ctx.createLinearGradient(wallX,0,wallX+105*scale,0);
      wall.addColorStop(0,'rgba(43,45,56,.92)');wall.addColorStop(.5,'rgba(78,76,88,.82)');wall.addColorStop(1,'rgba(18,21,30,.45)');
      ctx.fillStyle=wall;ctx.beginPath();ctx.moveTo(wallX,wallTop+13*scale);ctx.lineTo(wallX+70*scale,wallTop);ctx.lineTo(wallX+95*scale,ground);ctx.lineTo(wallX,ground);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(9,12,20,.86)';ctx.lineWidth=2*scale;
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(wallX+(10+i*15)*scale,wallTop+(16+i*7)*scale);ctx.lineTo(wallX+(i%2?38:24)*scale,wallTop+(62+i*19)*scale);ctx.lineTo(wallX+(i%2?29:55)*scale,wallTop+(85+i*22)*scale);ctx.stroke();}
      ctx.globalAlpha=.94;ctx.fillStyle='#191923';
      ctx.beginPath();ctx.moveTo(ex-19*scale,sy(GROUND-164));ctx.lineTo(ex-5*scale,sy(GROUND-155));ctx.lineTo(ex+1*scale,sy(GROUND-143));ctx.lineTo(ex-11*scale,sy(GROUND-137));ctx.lineTo(ex-21*scale,sy(GROUND-145));ctx.closePath();ctx.fill();
      ctx.strokeStyle='#7e243c';ctx.lineWidth=2*scale;ctx.beginPath();ctx.moveTo(ex-20*scale,sy(GROUND-145));ctx.lineTo(ex-12*scale,sy(GROUND-139));ctx.lineTo(ex-4*scale,sy(GROUND-145));ctx.stroke();
      ctx.restore();
    }
    if(t>=20.8&&t<22.4){
      const p=clamp01((t-20.8)/1.6),r=(10+p*105)*scale;
      ctx.save();ctx.globalAlpha=(1-p)*.68;ctx.strokeStyle='#c8cbd6';ctx.lineWidth=1.5*scale;
      ctx.beginPath();ctx.ellipse(gx,ground-3*scale,r,r*.25,0,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<9;i++){
        const a=i*Math.PI*2/9+.22,pow=15+p*44;
        ctx.globalAlpha=(1-p)*.42;ctx.fillStyle=i%2?'#aaaeba':'#e1e5ef';
        ctx.beginPath();ctx.arc(gx+Math.cos(a)*pow*scale,ground-4*scale-Math.sin(a)*pow*.42*scale,1.2+(i%3)*.4,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }

    const itachiFade=clamp01((t-26.1)/.45)*(1-clamp01((t-36.5)/.8));
    if(itachiFade>.01){
      const ix=sx(center+278+Math.max(0,t-34.4)*32),iy=ground,sc=scale;
      ctx.save();ctx.globalAlpha=itachiFade;ctx.translate(ix,iy);ctx.scale(sc,sc);
      const aura=ctx.createRadialGradient(0,-82,4,0,-82,82);
      aura.addColorStop(0,'rgba(150,15,43,.3)');aura.addColorStop(1,'rgba(24,0,10,0)');
      ctx.fillStyle=aura;ctx.beginPath();ctx.arc(0,-82,82,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#101018';ctx.strokeStyle='#34313e';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-14,-103);ctx.lineTo(-26,-83);ctx.lineTo(-35,-8);ctx.lineTo(-21,0);ctx.lineTo(25,0);ctx.lineTo(35,-8);ctx.lineTo(25,-78);ctx.lineTo(13,-103);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#171720';ctx.beginPath();ctx.moveTo(-15,-101);ctx.lineTo(-25,-112);ctx.lineTo(-8,-119);ctx.lineTo(7,-118);ctx.lineTo(23,-109);ctx.lineTo(14,-100);ctx.closePath();ctx.fill();
      ctx.fillStyle='#c5a9a5';ctx.beginPath();ctx.ellipse(0,-113,13,18,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#0b0b12';ctx.beginPath();ctx.moveTo(-17,-121);ctx.lineTo(-24,-139);ctx.lineTo(-11,-130);ctx.lineTo(-7,-148);ctx.lineTo(1,-132);ctx.lineTo(10,-145);ctx.lineTo(12,-130);ctx.lineTo(24,-137);ctx.lineTo(16,-119);ctx.lineTo(10,-109);ctx.lineTo(8,-125);ctx.lineTo(-1,-116);ctx.lineTo(-8,-128);ctx.lineTo(-13,-112);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#241018';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-9,-107);ctx.lineTo(-7,-97);ctx.moveTo(9,-107);ctx.lineTo(7,-97);ctx.stroke();
      ctx.fillStyle='#f0445f';ctx.beginPath();ctx.ellipse(-5,-113,3.4,1.5,0,0,Math.PI*2);ctx.ellipse(5,-113,3.4,1.5,0,0,Math.PI*2);ctx.fill();
      if(t>=27.3&&t<36.5){
        ctx.globalAlpha=itachiFade*(.55+.3*Math.sin(t*13));ctx.strokeStyle='#ff405b';ctx.lineWidth=1.6;
        for(const exi of [-5,5]){
          ctx.beginPath();ctx.arc(exi,-113,4.6,0,Math.PI*2);ctx.stroke();
          ctx.beginPath();ctx.moveTo(exi,-117);ctx.lineTo(exi+1.4,-110);ctx.lineTo(exi-1.3,-112);ctx.closePath();ctx.fillStyle='#ff5369';ctx.fill();
        }
      }
      ctx.strokeStyle='#12121c';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-13,-81);ctx.lineTo(-35,-62);ctx.lineTo(-41,-48);ctx.stroke();
      ctx.fillStyle='#d7b8b4';ctx.beginPath();ctx.ellipse(-42,-47,4,7,-.3,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    if(t>=27.25&&t<35.8){
      const p=clamp01((t-27.25)/1.4),wave=.5+.5*Math.sin(t*8.8);
      ctx.save();ctx.globalAlpha=.08+.14*wave;ctx.fillStyle='#9e001e';ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=.12+.12*wave;ctx.strokeStyle='#ff334f';ctx.lineWidth=1.5;
      for(let i=0;i<8;i++){
        const r=(Math.min(W,H)*(.12+i*.085)+Math.sin(t*4+i)*8)*(1+p*.35);
        ctx.beginPath();ctx.ellipse(W*.5,H*.43,r,r*.48,t*.13+i*.12,0,Math.PI*2);ctx.stroke();
      }
      const exi=W*.5+(gx-W*.5)*.28,eyi=H*.43+(sy(GROUND-160)-H*.43)*.2,er=(34+9*wave)*scale;
      ctx.globalAlpha=.16+.16*wave;ctx.fillStyle='#31020b';ctx.beginPath();ctx.arc(exi,eyi,er*1.55,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#ff304f';ctx.lineWidth=2*scale;ctx.beginPath();ctx.arc(exi,eyi,er,0,Math.PI*2);ctx.stroke();
      for(let j=0;j<3;j++){
        const a=t*1.5+j*Math.PI*2/3;
        ctx.save();ctx.translate(exi+Math.cos(a)*er*.48,eyi+Math.sin(a)*er*.48);ctx.rotate(a);
        ctx.fillStyle='#ff405b';ctx.beginPath();ctx.ellipse(0,0,er*.15,er*.34,.35,0,Math.PI*2);ctx.fill();ctx.restore();
      }
      if(t>=29.3&&t<33.1){
        ctx.globalAlpha=.1+.08*Math.sin(t*11);ctx.fillStyle='#eae7ff';ctx.fillRect(0,0,W,H);
        ctx.globalAlpha=.17;ctx.strokeStyle='#ff244c';ctx.lineWidth=3;ctx.strokeRect(11*scale,44*scale,W-22*scale,H-88*scale);
      }
      ctx.restore();
    }
    if(t>=33&&t<37.4){
      const p=clamp01((t-33)/4.4);
      ctx.save();ctx.globalCompositeOperation='lighter';
      for(let i=0;i<18;i++){
        const seed=i*2.399,flight=(t-33)*(38+i%4*9);
        const x=ex+Math.sin(seed+flight*.025)*((18+p*160)*scale)+(i-9)*4*scale;
        const y=ground-(40+(i*17%95))*scale-Math.cos(seed+flight*.03)*18*scale;
        ctx.globalAlpha=(1-p*.55)*(.28+(i%3)*.12);ctx.fillStyle=i%4===0?'#ff435e':'#15131e';
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+8*scale,y-4*scale);ctx.lineTo(x+15*scale,y+2*scale);ctx.lineTo(x+4*scale,y+1*scale);ctx.closePath();ctx.fill();
      }
      ctx.restore();
    }
    if(t>=10&&t<15){
      const p=(t-10)/5,pulse=.5+.5*Math.sin(t*9.2);
      const alpha=.42+.32*pulse+.13*Math.sin(p*Math.PI*3);
      const flash=ctx.createRadialGradient(W*.5,H*.45,Math.min(W,H)*.04,W*.5,H*.45,Math.max(W,H)*.82);
      flash.addColorStop(0,'rgba(248,238,255,'+Math.min(.98,alpha+.18)+')');
      flash.addColorStop(.34,'rgba(153,73,255,'+Math.min(.9,alpha)+')');
      flash.addColorStop(1,'rgba(35,4,90,'+Math.min(.8,alpha*.82)+')');
      ctx.fillStyle=flash;ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=.22+.2*pulse;ctx.strokeStyle='#ffffff';ctx.lineWidth=2+2*pulse;
      for(let i=0;i<4;i++){
        const r=(p*260+i*45)*scale;ctx.beginPath();ctx.ellipse(W*.5,H*.52,r,r*.43,t*.12+i*.4,0,Math.PI*2);ctx.stroke();
      }
      if(t>14.72){ctx.globalAlpha=clamp01((15-t)/.28);ctx.fillStyle='#fffaff';ctx.fillRect(0,0,W,H);}
    }
    let shot='01 / BLUE ASCENDS';
    if(t>=2&&t<5.6)shot='02 / RED ASCENDS';
    else if(t>=5.6&&t<7.2)shot='03 / TWO ORBS CONVERGE';
    else if(t>=7.2&&t<10)shot='04 / MURASAKI';
    else if(t>=10&&t<15)shot='05 / HOLLOW PURPLE : 5 SECOND FLASH';
    else if(t>=15&&t<21)shot='06 / AFTERMATH : THE FALLEN KING';
    else if(t>=21&&t<26.1)shot='07 / SILENCE AFTER THE BLAST';
    else if(t>=26.1&&t<27.25)shot='08 / A THIRD PRESENCE';
    else if(t>=27.25&&t<33)shot='09 / MANGEKYO SHARINGAN';
    else if(t>=33&&t<37.4)shot='10 / GENJUTSU EXTRACTION';
    else if(t>=37.4)shot='11 / THE EYES IN THE DARK';
    ctx.save();ctx.globalAlpha=.9;ctx.textAlign='center';ctx.font='800 10px Consolas,monospace';
    ctx.fillStyle=(t>=10&&t<15)?'#f0d7ff':(t>=27.25&&t<37.4?'#ff8798':'#dce8fa');
    ctx.fillText(shot,W/2,58);
    ctx.textAlign='left';ctx.globalAlpha=.74;ctx.fillStyle='#c3cde0';ctx.font='800 9px Consolas,monospace';
    ctx.fillText('CHAPTER 3 / HOLLOW PURPLE → MANGEKYO GENJUTSU',24,H-46);
    ctx.restore();
  }
  function drawEndCard(c,failed){
    ctx.save();ctx.fillStyle='rgba(2,3,8,.91)';ctx.fillRect(0,0,W,H);
    if(!failed){
      const grad=ctx.createLinearGradient(W*.2,0,W*.8,0);grad.addColorStop(0,'#8fe8ff');grad.addColorStop(.5,'#f4f7ff');grad.addColorStop(1,'#ff8190');
      ctx.textAlign='center';ctx.font='900 38px Impact,"Segoe UI",sans-serif';ctx.fillStyle='rgba(255,61,91,.32)';ctx.fillText('CHAPTER 3 COMPLETE',W/2-2,H*.46+2);ctx.fillStyle=grad;ctx.fillText('CHAPTER 3 COMPLETE',W/2,H*.46);
      ctx.font='800 14px "Segoe UI",sans-serif';ctx.fillStyle='#d7e6ff';ctx.fillText('AWAKENING  /  THE EYES IN THE DARK',W/2,H*.54);
      ctx.fillStyle='#6e819d';ctx.font='800 10px Consolas,monospace';ctx.fillText('ENTER / SPACE  ·  STORY ARCHIVE',W/2,H*.83);
    }else{
      ctx.textAlign='center';ctx.font='900 38px Impact,"Segoe UI",sans-serif';ctx.fillStyle='#ff8190';ctx.fillText('CHAPTER 3 FAILED',W/2,H*.46);
      ctx.font='800 14px "Segoe UI",sans-serif';ctx.fillStyle='#a6b4cb';ctx.fillText('RETRY THE DOMAIN CLASH',W/2,H*.54);
      ctx.fillStyle='#6e819d';ctx.font='800 10px Consolas,monospace';ctx.fillText('R  ·  RETRY     ENTER / ESC  ·  STORY ARCHIVE',W/2,H*.83);
    }
    ctx.restore();
  }

  const finalFightKeys=[
    [0,-190,190,0,0,"guard","guard",0,0.82,""],
    [0.62,-188,187,0,0,"guard","guard",0,0.82,""],
    [0.88,-185,172,0,0,"guard","crouch",0,0.84,""],
    [1.08,-138,100,0,4,"brace","lunge",-12,0.91,""],
    [1.3,-92,46,0,0,"infinity","slashWind",-8,1,""],
    [1.48,-64,35,0,0,"infinity","slash",-5,1.04,"slash_block"],
    [1.68,-65,38,0,0,"brace","recover",-5,1.01,""],
    [1.85,-56,38,0,0,"punchWind","guard",0,1.02,""],
    [2.08,-18,30,0,0,"punch","hitBack",0,1.05,"gojo_punch"],
    [2.24,-23,27,0,0,"recover","block",0,1.02,""],
    [2.4,-38,12,0,0,"brace","elbowWind",-5,1.02,""],
    [2.55,-58,12,0,0,"hitBack","elbow",-8,1.08,"sukuna_elbow"],
    [2.77,-66,18,0,0,"recoil","recover",-8,1.04,""],
    [2.9,-52,20,0,0,"kickWind","guard",-8,1.06,""],
    [3.1,-22,45,0,12,"kick","hitBack",-2,1.08,"gojo_kick"],
    [3.32,-30,62,0,8,"recover","stagger",0,1.01,""],
    [3.6,-56,100,0,0,"guard","guard",0,0.88,""],
    [4.05,-60,72,0,0,"lowDodge","slashWind",0,0.96,""],
    [4.2,-68,30,0,0,"lowDodge","slash",-5,1.04,"slash_one"],
    [4.4,-82,24,0,0,"highDodge","recover",-8,1.06,""],
    [4.56,-93,12,22,0,"highDodge","slashWind",-12,1.08,""],
    [4.72,-101,5,28,0,"highDodge","slash",-12,1.09,"slash_two"],
    [4.92,-88,12,4,0,"landing","recover",-8,1.04,""],
    [5.08,-55,24,0,0,"punch","hitBack",0,1.07,"gojo_counter"],
    [5.28,-46,36,0,0,"recover","stagger",0,1.01,""],
    [5.46,-45,30,0,0,"brace","slashWind",0,1,""],
    [5.62,-74,5,12,0,"lowDodge","slash",-8,1.08,"slash_three"],
    [5.82,-84,2,0,0,"landing","recover",-8,1.04,""],
    [6,-40,31,0,0,"dash","brace",-6,1.02,""],
    [6.2,-8,40,0,0,"bodyStrike","hitBack",0,1.08,"gojo_body"],
    [6.42,-3,48,0,0,"bodyStrike","stagger",0,1.08,""],
    [6.58,-11,54,0,0,"brace","slashWind",0,1.02,""],
    [6.78,-21,34,0,0,"parry","slash",-4,1.09,"parry_slash"],
    [6.98,-22,37,0,0,"recover","stagger",-4,1.03,""],
    [7.2,-23,39,0,0,"blueCharge","brace",0,0.99,""],
    [7.52,-24,13,0,0,"blueRelease","pulled",0,1.02,"blue_pull"],
    [7.8,-25,5,0,0,"blueRelease","pulled",2,1.06,""],
    [8.04,-37,8,0,0,"lowDodge","slashWind",-4,1.08,""],
    [8.2,-46,15,0,0,"lowDodge","slash",-8,1.09,"blue_cut"],
    [8.42,-57,29,0,0,"landing","recover",-8,1.04,""],
    [8.63,-62,39,0,0,"redCharge","brace",-4,1.02,""],
    [8.88,-53,103,0,14,"redRelease","hitBack",0,1,"red_burst"],
    [9.14,-49,129,0,6,"recover","stagger",0,0.91,""],
    [9.4,-20,110,0,0,"dash","brace",0,0.91,""],
    [9.62,0,50,0,0,"punch","hitBack",5,1,"gojo_rush_punch"],
    [9.82,-4,54,0,0,"recover","stagger",5,1,""],
    [10.02,-14,29,0,0,"infinity","slashWind",0,1.02,""],
    [10.2,-10,18,0,0,"parry","slash",-4,1.08,"close_slash"],
    [10.42,-8,32,0,0,"elbow","hitBack",0,1.08,"gojo_counter_two"],
    [10.64,-12,43,0,0,"recover","stagger",0,1.02,""],
    [10.9,-12,55,0,0,"guard","recover",0,0.98,""],
    [11.12,-12,24,0,0,"block","slashWind",0,1.03,""],
    [11.32,-20,13,0,0,"parry","slash",-5,1.08,"slash_counter"],
    [11.5,-8,25,0,0,"punch","hitBack",0,1.08,"gojo_counter_three"],
    [11.72,-11,43,0,0,"recover","stagger",0,1.03,""],
    [11.94,-30,23,0,0,"lowDodge","slashWind",-4,1.03,""],
    [12.12,-28,18,0,0,"lowDodge","slash",-5,1.06,"last_slash"],
    [12.32,-11,30,0,0,"counterPunch","hitBack",0,1.06,"gojo_counter_four"],
    [12.52,-36,70,0,0,"guard","recoil",0,0.92,""],
    [12.82,-40,65,0,0,"purpleCharge","crouch",0,0.9,""],
    [13.1,-43,55,0,0,"purpleCharge","lunge",0,0.92,""],
    [13.4,-55,30,0,0,"purpleCharge","dash",0,0.95,""],
    [13.65,-65,5,0,0,"purpleCharge","slashWind",0,0.98,""],
    [13.9,-70,2,0,0,"redBlue","slashWind",0,1,""],
    [14.16,-74,12,0,0,"purpleCharge","slash",0,1,""],
    [14.42,-76,35,0,0,"purpleCharge","recover",0,0.96,"purple_converge"],
    [14.68,-78,46,0,0,"purpleCharge","brace",0,0.92,""],
    [14.92,-81,61,0,0,"purpleFire","dash",0,0.88,"purple_launch"],
    [15.16,-84,85,0,0,"purpleFire","slash",0,0.84,""],
    [15.42,-87,108,0,0,"purpleFire","slash",0,0.82,"slash_vs_purple"],
    [15.72,-90,120,0,0,"purpleFire","recoil",0,0.8,""],
    [16,-94,135,0,0,"purpleRecoil","hitBack",0,0.78,"purple_collision"],
    [16.22,-97,145,0,22,"recoil","fly",0,0.79,""],
    [16.48,-100,158,0,34,"recoil","fly",0,0.8,""],
    [16.74,-99,170,0,32,"guard","fly",0,0.81,""],
    [17,-96,180,0,22,"guard","fall",0,0.82,""],
    [17.24,-92,187,0,12,"guard","fall",0,0.83,"sukuna_fall"],
    [17.48,-90,185,0,3,"guard","fall",0,0.84,""],
    [17.7,-88,182,0,0,"guard","fall",0,0.84,""],
    [18,-88,178,0,0,"guard","fallen",0,0.85,"ground_slam"],
    [18.28,-86,178,0,0,"recover","fallen",0,0.86,""],
    [18.65,-84,178,0,0,"guard","fallen",0,0.86,""],
    [19,-84,178,0,0,"finalPose","fallen",0,0.86,""],
    [19.5,-84,178,0,0,"finalPose","fallen",0,0.86,""],
    [20,-84,178,0,0,"finalPose","fallen",0,0.86,""],
    [20,-82,190,0,0,"blueCharge","guard",0,0.86,"blue_launch"],
    [21,-82,190,0,0,"blueRelease","guard",0,0.89,""],
    [22,-82,190,0,0,"blueRelease","guard",0,0.92,""],
    [22.08,-82,190,0,0,"redCharge","brace",0,0.92,"red_launch"],
    [23,-82,190,0,0,"redCharge","brace",0,0.94,""],
    [24,-82,190,0,0,"redRelease","brace",0,0.96,""],
    [25.2,-82,190,0,0,"redRelease","brace",0,0.97,""],
    [26.2,-76,188,12,0,"redBlue","brace",0,0.98,"orb_converge"],
    [27,-70,188,42,0,"armsWide","brace",0,1,""],
    [28.4,-58,188,122,0,"armsWide","brace",0,1.03,""],
    [30,-48,188,204,0,"armsWide","hitBack",0,1.06,"purple_flash"],
    [32.5,-48,188,204,0,"armsWide","hitBack",0,1.08,""],
    [35,-48,212,168,0,"fall","wallLean",0,1,"aftermath_reveal"],
    [37,-48,212,145,0,"fall","wallLean",0,0.98,""],
    [39,-48,212,86,0,"fall","wallLean",0,0.96,""],
    [41,-48,212,0,0,"landing","wallLean",0,0.95,"soft_landing"],
    [42.2,-48,212,0,0,"finalPose","wallLean",0,0.95,""],
    [44.9,-35,204,0,0,"finalPose","wallLean",0,0.96,""],
    [45.5,-18,202,0,0,"guard","wallLean",0,0.99,""],
    [46.6,-18,202,0,0,"guard","wallLean",0,1.02,"itachi_reveal"],
    [47.4,-18,202,0,0,"guard","wallLean",0,1.04,"mangekyo"],
    [49.3,-18,202,0,0,"stagger","wallLean",0,1.08,"genjutsu_wave"],
    [51.5,-18,202,0,0,"hitBack","wallLean",0,1.12,""],
    [53.1,-18,202,0,0,"stagger","wallLean",0,1.08,"escape_start"],
    [55.2,-14,250,0,0,"stagger","wallLean",25,1.02,"crow_escape"],
    [57,-8,980,0,0,"recover","wallLean",60,0.96,""],
    [59,8,980,0,0,"guard","wallLean",22,0.93,"gojo_recovers"],
    [62,8,980,0,0,"finalPose","wallLean",0,0.9,""],
    [64,8,980,0,0,"stagger","wallLean",0,0.9,""],
    [66,8,980,0,0,"recover","wallLean",0,0.9,""],
    [69,8,980,0,0,"guard","wallLean",0,0.9,""],
    [72,8,980,0,0,"guard","wallLean",0,0.9,""],
    [75,8,980,0,0,"guard","wallLean",0,0.9,""],
    [77,8,980,0,0,"recover","wallLean",0,0.91,""],
    [79,8,980,0,0,"guard","wallLean",0,0.92,""],
    [82,8,980,0,0,"guard","wallLean",0,0.92,""],
    [85,8,980,0,0,"finalPose","wallLean",0,0.92,""],
    [87,8,980,0,0,"finalPose","wallLean",0,0.92,""]
  ];
  const mkFinalPose=(hipY,shY,headY,lean,afx,afy,abx,aby,lfx,lfy,lbx,lby,headX=0)=>({hipY,shY,headY,headX,lean,armF:[afx,afy],armB:[abx,aby],legF:[lfx,lfy],legB:[lbx,lby]});
  const FINAL_FIGHT_POSES={
    guard:mkFinalPose(-58,-96,-112,-3,76,24,106,22,84,8,96,-7),
    brace:mkFinalPose(-58,-96,-112,-8,42,-42,132,8,78,14,100,-8),
    crouch:mkFinalPose(-47,-81,-103,-23,34,34,146,16,65,27,125,-8),
    lunge:mkFinalPose(-62,-100,-120,28,14,-42,150,-18,58,-28,126,-12,2),
    slashWind:mkFinalPose(-58,-96,-114,-13,60,-40,145,-22,86,9,94,-8),
    slash:mkFinalPose(-62,-100,-120,18,10,-60,100,25,94,4,86,-8,2),
    infinity:mkFinalPose(-58,-96,-113,-4,-60,-30,90,20,88,6,94,-6),
    punchWind:mkFinalPose(-54,-94,-108,-18,125,58,90,25,92,10,90,-8),
    punch:mkFinalPose(-64,-102,-120,22,-8,-8,100,30,96,2,84,-10,2),
    counterPunch:mkFinalPose(-63,-100,-119,17,-4,-12,116,21,92,4,86,-8,2),
    recover:mkFinalPose(-58,-96,-112,3,74,20,104,22,88,6,94,-6),
    elbowWind:mkFinalPose(-55,-92,-108,-15,135,28,92,22,94,9,88,-8),
    elbow:mkFinalPose(-62,-100,-119,23,8,-30,110,30,94,4,86,-9,2),
    hitBack:mkFinalPose(-55,-88,-105,-25,145,22,26,-62,112,22,76,-17,-3),
    recoil:mkFinalPose(-56,-90,-107,-30,140,30,150,-36,118,26,72,-18,-4),
    kickWind:mkFinalPose(-55,-92,-109,-22,20,-72,118,8,76,18,108,-18),
    kick:mkFinalPose(-61,-100,-118,23,12,-18,126,24,132,-2,78,-10,1),
    stagger:mkFinalPose(-54,-87,-104,-19,145,26,24,-66,114,20,76,-15,-3),
    lowDodge:mkFinalPose(-46,-80,-102,-27,98,42,134,-8,65,17,119,-11,-2),
    highDodge:mkFinalPose(-68,-103,-120,-8,22,-70,144,-18,66,-35,120,-20,-3),
    landing:mkFinalPose(-48,-82,-103,-17,100,33,138,-4,68,21,118,-9),
    block:mkFinalPose(-58,-96,-113,-5,-55,-28,104,23,84,8,96,-7),
    parry:mkFinalPose(-60,-99,-116,8,2,-52,145,-35,92,5,87,-8,2),
    blueCharge:mkFinalPose(-58,-97,-116,-9,50,-50,55,-45,86,6,94,-6,2),
    blueRelease:mkFinalPose(-61,-100,-119,15,8,-12,45,15,92,4,88,-7,2),
    pulled:mkFinalPose(-57,-91,-108,28,-3,-50,146,-12,58,18,120,-12,2),
    redCharge:mkFinalPose(-58,-97,-116,-10,50,-50,126,8,88,6,94,-6,2),
    redRelease:mkFinalPose(-62,-100,-119,19,2,-8,110,24,92,4,86,-8,2),
    dash:mkFinalPose(-55,-101,-119,28,14,-42,154,-14,58,-34,128,-18,2),
    bodyStrike:mkFinalPose(-62,-100,-118,20,-8,-8,100,30,96,2,84,-10,2),
    redBlue:mkFinalPose(-59,-97,-116,3,25,-56,146,-34,88,6,94,-6,2),
    purpleCharge:mkFinalPose(-60,-99,-120,-5,-30,-80,-30,-80,88,6,94,-6,2),
    purpleFire:mkFinalPose(-62,-100,-120,17,10,-60,10,-60,94,4,86,-8,2),
    purpleRecoil:mkFinalPose(-56,-91,-108,-18,140,30,150,-32,110,22,76,-16,-4),
    fly:mkFinalPose(-49,-82,-100,-12,136,24,24,-65,68,-25,126,-20,-3),
    fall:mkFinalPose(-31,-54,-69,24,28,35,140,-38,44,32,132,-33,-5),
    fallen:mkFinalPose(-16,-28,-35,62,94,78,142,-36,20,46,137,-42,-5),
    finalPose:mkFinalPose(-58,-96,-113,-2,58,-70,118,-105,82,8,101,-8),
    armsWide:mkFinalPose(-58,-96,-112,0,58,-35,122,-35,82,5,101,-8),
    wallLean:mkFinalPose(-49,-79,-94,19,151,16,108,-42,67,16,127,-19,3),
    genjutsu:mkFinalPose(-59,-97,-115,-10,35,-12,145,-18,80,4,103,-7,2)
  };
  function fightKeyIndex(t){let i=0;while(i<finalFightKeys.length-2&&t>finalFightKeys[i+1][0])i++;return i;}
  function blendFightPose(P,aName,bName,q,t){
    const a=FINAL_FIGHT_POSES[aName]||FINAL_FIGHT_POSES.guard,b=FINAL_FIGHT_POSES[bName]||a;
    for(const k of ['hipY','shY','headY','headX','lean'])P[k]=mix(a[k],b[k],q);
    for(const k of ['armF','armB','legF','legB'])P[k]=[mix(a[k][0],b[k][0],q),mix(a[k][1],b[k][1],q)];
    P.hipY+=Math.sin(t*4.2)*.07;P.shY+=Math.sin(t*4.2)*.05;P.headY+=Math.sin(t*2.6)*.18;
  }
  function triggerFinalFightEvent(c,event,t){
    c.finalFxEvent=event;c.finalFxAt=t;
    const g=c.gojo,s=c.sukuna,cx=(g.x+s.x)*.5,cy=GROUND-95;
    if(event==='blue_launch'||event==='red_launch'){
      G.flash=.13;G.flashColor=event==='blue_launch'?'#dff9ff':'#ffdfe5';G.shake=Math.max(G.shake,2.8);
      try{ring(g.x+20,GROUND-128,event==='blue_launch'?'#78dcff':'#ff526f',55,16);burst(g.x+20,GROUND-128,10,event==='blue_launch'?'#9feaff':'#ff8a9d',1.1,3.2,18,0);}catch(e){}
      return;
    }else if(event==='orb_converge'){
      G.flash=.18;G.flashColor='#f2dcff';G.shake=Math.max(G.shake,4.6);
      try{ring((g.x+s.x)*.5,GROUND-325,'#cfa1ff',95,21);burst((g.x+s.x)*.5,GROUND-325,16,'#e8d6ff',1.8,5,24,0);}catch(e){}
      return;
    }else if(event==='purple_flash'){
      G.flash=.48;G.flashColor='#e3b9ff';G.shake=Math.max(G.shake,9);
      try{ring((g.x+s.x)*.5,GROUND-325,'#f6e8ff',160,29);burst((g.x+s.x)*.5,GROUND-325,28,'#ddaaff',2.5,8,29,0);}catch(e){}
      play('clash');return;
    }else if(event==='soft_landing'){
      G.flash=.055;G.flashColor='#e9edf5';G.shake=Math.max(G.shake,1.6);
      try{ring(g.x,GROUND-5,'#c6cbd6',52,18);burst(g.x,GROUND-6,8,'#bcc3d0',.7,2.2,17,0);}catch(e){}
      return;
    }else if(event==='mangekyo'||event==='genjutsu_wave'){
      G.flash=.13;G.flashColor='#ff264f';G.shake=Math.max(G.shake,event==='mangekyo'?4.5:2.5);
      try{ring(g.x,GROUND-130,'#ff405b',event==='mangekyo'?76:46,18);}catch(e){}
      return;
    }else if(event==='crow_escape'){
      G.flash=.12;G.flashColor='#24101f';G.shake=Math.max(G.shake,3.2);
      try{burst(s.x,GROUND-95,18,'#191721',1.6,4.8,23,0);ring(s.x,GROUND-95,'#8d1c39',80,21);}catch(e){}
      return;
    }
    if(['slash_block','parry_slash','close_slash','slash_counter','last_slash','blue_cut','slash_vs_purple'].includes(event)){
      G.flash=.105;G.flashColor=event==='slash_vs_purple'?'#e4faff':'#ff8190';G.shake=Math.max(G.shake,3.8);
      try{ring(cx,cy,'#ff6578',44,15);burst(cx,cy,7,'#ffd3d8',1.3,3.2,11,0);}catch(e){}play('block');
    }else if(event==='purple_collision'||event==='purple_launch'){
      G.flash=event==='purple_collision' ? .5 : .16;G.flashColor='#eafaff';G.shake=Math.max(G.shake,event==='purple_collision'?14:5);
      try{ring(cx,GROUND-115,'#f7fdff',event==='purple_collision'?142:55,event==='purple_collision'?30:17);burst(cx,GROUND-115,event==='purple_collision'?30:13,'#b8f0ff',3,10,23,0);}catch(e){}
      if(event==='purple_collision')play('clash');
    }else if(event==='red_burst'){
      G.flash=.2;G.flashColor='#ff6379';G.shake=Math.max(G.shake,7);
      try{ring(g.x+42,GROUND-112,'#ff596f',98,23);burst(g.x+42,GROUND-112,18,'#ff7e90',2,6,20,0);}catch(e){}play('clash');
    }else if(event==='ground_slam'||event==='sukuna_fall'){
      G.flash=.12;G.flashColor='#eaf4ff';G.shake=Math.max(G.shake,5);
      try{ring(s.x,GROUND-5,'#b8c6d7',75,19);burst(s.x,GROUND-6,16,'#b4c0d0',1.2,4,22,0);}catch(e){}
    }else{
      G.flash=.1;G.flashColor=(event.includes('counter')||event.includes('punch')||event==='gojo_kick')?'#dff7ff':'#eff7ff';
      G.shake=Math.max(G.shake,event==='gojo_kick'||event==='gojo_body'?5:3);
      try{ring(cx,cy,event==='gojo_kick'?'#b9eaff':'#f1f8ff',39,14);burst(cx,cy,9,event==='gojo_kick'?'#b9eaff':'#f1f8ff',1.5,4,14,0);}catch(e){}
    }
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
    }else if(c.stage==='ending'){
      const t=c.t||0,i=fightKeyIndex(t),a=finalFightKeys[i],b=finalFightKeys[Math.min(i+1,finalFightKeys.length-1)];
      const q=ease(clamp01((t-a[0])/Math.max(.001,b[0]-a[0])));
      if(f===c.gojo)blendFightPose(P,a[5],b[5],q,t);
      else if(f===c.sukuna)blendFightPose(P,a[6],b[6],q,t);
      else if(f===c.yuta){
        const fallen=FINAL_FIGHT_POSES.fallen;
        for(const k of ['hipY','shY','headY','headX','lean'])P[k]=fallen[k];
        for(const k of ['armF','armB','legF','legB'])P[k]=fallen[k].slice();
        P.hipY+=Math.sin(t*2.4)*.18;P.shY+=Math.sin(t*2)*.14;
      }
    }
    return P;
  };
  if(typeof baseDrawUI==='function')window.drawUI=function(){
    const c=chapter3();if(c&&(c.stage==='intro'||c.stage==='domainIntro'||c.stage==='ending'||c.stage==='defeat'||c.stage==='complete'||c.stage==='failedCard'||c.stage==='ch4Pursuit'))return;
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
    }else if(c.stage==='ch4Pursuit')drawChapter4PursuitFX(c);
    else if(c.stage==='complete')drawEndCard(c,false);
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
      if(c.stage==='ch4Pursuit'){tickChapter4Pursuit(c);return;}
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
      if(c.stage==='ch4Pursuit'){
        if(c.ch4Arrived&&(code==='Enter'||code==='Space')){
          if(!c.ch4Inspected){c.ch4Inspected=true;line(c,'ch4-shrine-inspected','GOJO','Một kết giới che giấu thứ gì đó bên trong...','#9fe9ff');}
          return;
        }
        return baseMenuKey.apply(this,arguments);
      }
      if(c.stage==='intro'||c.stage==='domainIntro'||c.stage==='ending'||c.stage==='defeat')return;
    }
    return baseMenuKey.apply(this,arguments);
  };
  console.info('[JFF Chapter 3] Mobile Domain Clash + reworked Shrine renderer loaded.');
})();