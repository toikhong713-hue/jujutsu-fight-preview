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
    if(!c.yuta&&typeof createFighter==='function')c.yuta=createFighter('yuta',ARENA_W/2-270,1,true);
    const y=c.yuta;if(!y)return;
    y.ai=null;y.opp=c.gojo;y.x=ARENA_W/2-270;y.y=GROUND;y.vx=0;y.vy=0;y.facing=1;
    y.state='IDLE';y.stateFrame=0;y.animT=0;y.walk=0;y.storyCinePose='support';y.rikaTimer=0;y.move=null;y.hitstun=0;
    if(G.fighters.indexOf(y)<0)G.fighters.push(y);
  }
  function clearTransient(){
    G.storyCutscene=false;G.clash=null;G.domain=null;G.hakariCin=null;
    G.flash=0;G.shake=0;G.shakeX=0;G.shakeY=0;G.zoomPunch=0;G.camPunch=0;cam.cine=0;stopVoice();
  }
  function setupOpening(c){
    c.stage='intro';c.t=0;c.phase='phase1';c.domainsActive=false;c.shrineVisible=false;
    G.storyCutscene=true;G.story.cutscene=true;G.roundState='intro';G.roundTimer=999999;
    G.matchOver=false;G.matchOverScreen=false;G.paused=false;G.winner=null;
    const center=ARENA_W/2;
    resetActor(c.gojo,center-85,1);resetActor(c.sukuna,center+180,-1);
    c.gojo.ai=null;c.gojo.state='BLOCK';c.gojo.storyCinePose='guard';
    c.sukuna.state='ATTACK';c.sukuna.storyCinePose='wcs-aim';c.sukuna.awakenGlow=.65;
    addYutaProp(c);
    camera(center,GROUND-120,.91);G.flash=.22;G.flashColor='#e4faff';G.shake=3;
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
      openingCenter:ARENA_W/2,fromClash:false};
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
    const center=ARENA_W/2;
    resetActor(c.gojo,center-170,1);resetActor(c.sukuna,center+170,-1);
    c.gojo.storyCinePose='guard';c.sukuna.storyCinePose='wcs-aim';c.sukuna.awakenGlow=.6;
    camera(center,GROUND-155,.92);G.flash=.72;G.flashColor='#eafaff';G.shake=11;play('domain');
    return true;
  }
  function releaseDomainControl(c){
    const center=ARENA_W/2;
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
    floatText(ARENA_W/2,GROUND-300,'THE STRONGEST AWAKENS','#dff8ff',28,100);
  }
  function startEnding(c,won){
    if(!c||c.endingStarted)return;
    c.endingStarted=true;c.stage=won?'ending':'defeat';c.phase=won?'finale':'failed';c.t=0;c.caption=null;c.lastLine='';
    c.domainsActive=false;c.shrineFade=0;c.shrineVisible=false;G.domain=null;G.clash=null;
    G.storyCutscene=true;G.story.cutscene=true;G.story.ending=won?'victory':'defeat';
    G.matchOver=true;G.matchOverScreen=false;G.roundState='over';G.paused=false;removeYutaProp(c);
    if(won){
      const center=ARENA_W/2;resetActor(c.gojo,center-110,1);resetActor(c.sukuna,center+140,-1);
      c.gojo.ai=null;c.sukuna.hp=0;c.sukuna.state='KNOCKDOWN';c.gojo.awakenGlow=75;
      camera(center,GROUND-130,.86);G.flash=.5;G.flashColor='#ffffff';
    }else{c.gojo.state='DEFEAT';camera((c.gojo.x+c.sukuna.x)/2,GROUND-120,.9);}
    stopVoice();
  }
  function markComplete(c){
    if(c.completed)return;
    c.completed=true;c.stage='complete';c.t=8.5;G.storyCutscene=true;G.story.cutscene=true;
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
    c.t+=STEP;const t=c.t,center=ARENA_W/2;
    G.frame++;G.flash=Math.max(0,(G.flash||0)-.035);G.shake=Math.max(0,(G.shake||0)-.45);
    c.gojo.animT+=.8;c.sukuna.animT+=.62;if(c.yuta)c.yuta.animT+=.7;
    if(t<.72){
      camera(center,GROUND-120,.91);
      c.gojo.x=center-85;c.gojo.y=GROUND;c.gojo.state='BLOCK';c.gojo.storyCinePose='guard';
      c.sukuna.x=center+180;c.sukuna.y=GROUND;c.sukuna.state='ATTACK';c.sukuna.storyCinePose='wcs-aim';
      if(c.yuta){c.yuta.x=center-175;c.yuta.state='IDLE';c.yuta.storyCinePose='support';}
      if(t>.2)line(c,'yuta-opening','YUTA','Gojo-sensei...','#d8c5ff');
    }else if(t<1.65){
      camera(center-25,GROUND-123,.98);
      c.gojo.x=mix(center-85,center-35,ease((t-.72)/.93));c.gojo.y=GROUND;c.gojo.state='IDLE';c.gojo.storyCinePose='guard';
      c.sukuna.x=center+180;c.sukuna.y=GROUND;c.sukuna.state='IDLE';c.sukuna.storyCinePose='wcs-aim';
      if(c.yuta){c.yuta.x=mix(center-175,center-285,ease((t-.72)/.93));c.yuta.state='WALK';c.yuta.storyCinePose='support';}
      if(t>.84)line(c,'gojo-opening','GOJO','Stay behind me, Yuta.','#a9e9ff');
    }else if(t<2.35){
      camera(center,GROUND-135,.9);
      c.gojo.x=center-220;c.gojo.y=GROUND;c.gojo.state='IDLE';c.gojo.storyCinePose=null;
      c.sukuna.x=center+220;c.sukuna.y=GROUND;c.sukuna.state='IDLE';c.sukuna.storyCinePose=null;
      if(c.yuta){c.yuta.x=center-330;c.yuta.state='IDLE';}
      if(t>1.8)line(c,'sukuna-opening','SUKUNA','Show me, Satoru Gojo.','#ff8b98');
    }else{
      stopVoice();removeYutaProp(c);resetActor(c.gojo,center-220,1);resetActor(c.sukuna,center+220,-1);c.gojo.ai=null;
      c.stage='combat';c.phase='phase1';c.t=0;c.lastLine='';c.caption=null;
      G.storyCutscene=false;G.story.cutscene=false;G.roundState='fight';G.roundTimer=0;G.matchOver=false;G.matchOverScreen=false;
      camera(center,GROUND-135,.9);
    }
  }
  function tickDomainIntro(c){
    c.t+=STEP;const t=c.t,center=ARENA_W/2;
    G.frame++;G.flash=Math.max(0,(G.flash||0)-.028);G.shake=Math.max(0,(G.shake||0)-.52);
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
      c.sukuna.x=center+175;c.sukuna.y=GROUND-440*q;c.sukuna.state='IDLE';c.sukuna.storyCinePose='shrine-king';
      if(t>2.65)line(c,'shrine-king','SUKUNA','A domain without a shell. Now look closely.','#ff8190');
      if(Math.floor(t*60)%8===0){try{ring(center,GROUND-250,'#ff334f',130+Math.random()*25,22);}catch(e){}}
    }else if(t<5.15){
      c.shrineVisible=true;camera(center,GROUND-300,.82);c.gojo.x=center-185;c.gojo.y=GROUND;c.gojo.storyCinePose='domain-complete';c.gojo.state='IDLE';
      c.sukuna.x=center+175;c.sukuna.y=GROUND-440;c.sukuna.storyCinePose='shrine-king';c.sukuna.state='IDLE';c.domainsActive=true;
      if(t>4.02)line(c,'domains-collide','NARRATOR','UNLIMITED VOID  ×  MALEVOLENT SHRINE','#f4f7ff');
      if(t>4&&Math.floor(t*60)%4===0){G.flash=.15;G.flashColor=(Math.floor(t*22)%2)?'#7fd8ff':'#ff334f';G.shake=Math.max(G.shake,4);}
    }else if(t<6.15){
      c.shrineVisible=true;c.domainsActive=true;const q=ease((t-5.15)/1);camera(center,GROUND-140,.9);
      c.gojo.x=center-220;c.gojo.y=GROUND;c.gojo.storyCinePose='guard';c.gojo.state='IDLE';
      c.sukuna.x=center+220;c.sukuna.y=mix(GROUND-440,GROUND,q);c.sukuna.state='IDLE';c.sukuna.storyCinePose='shrine-king';
    }else{stopVoice();releaseDomainControl(c);}
  }
  function tickEnding(c){
    c.t+=STEP;const t=c.t,center=ARENA_W/2;
    G.frame++;G.flash=Math.max(0,(G.flash||0)-.035);G.shake=Math.max(0,(G.shake||0)-.45);
    if(c.stage==='defeat'){
      camera((c.gojo.x+c.sukuna.x)/2,GROUND-125,.9);
      if(t>2.6){c.stage='failedCard';c.t=2.6;G.matchOverScreen=true;G.roundState='over';}
      return;
    }
    if(t<1.8){
      camera(center,GROUND-155,.86);c.gojo.x=center-110;c.gojo.y=GROUND;c.gojo.state='IDLE';c.gojo.storyCinePose='arrival';c.gojo.animT+=.6;
      c.sukuna.x=center+140;c.sukuna.y=GROUND;c.sukuna.state='KNOCKDOWN';c.sukuna.animT+=.45;
      if(t>.4)line(c,'ending-sukuna','SUKUNA','So this is the strength of the strongest...','#ff8190');
    }else if(t<4.3){
      camera(center-55,GROUND-120,1.16);c.gojo.x=center-92;c.gojo.state='IDLE';c.gojo.storyCinePose='domain-complete';
      c.sukuna.x=center+140;c.sukuna.state='KNOCKDOWN';
      if(t>2.1)line(c,'ending-gojo','GOJO','This battle ends here.','#a9e9ff');
    }else if(t<6.5){
      addYutaProp(c);c.yuta.x=center-270;c.yuta.y=GROUND;c.yuta.state='IDLE';c.yuta.storyCinePose='support';
      camera(center,GROUND-145,.88);c.gojo.x=center-95;c.gojo.storyCinePose='arrival';c.sukuna.x=center+140;c.sukuna.state='KNOCKDOWN';
      if(t>4.45)line(c,'ending-yuta','YUTA','Gojo-sensei...','#d8c5ff');
    }else{c.t=8.5;markComplete(c);}
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
    const center=ARENA_W/2,baseY=GROUND-10;let alpha=.9;
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
  function drawCaption(c){
    const t=c.t;ctx.save();
    ctx.fillStyle='rgba(2,4,10,.72)';ctx.fillRect(0,0,W,31);ctx.fillRect(0,H-32,W,32);
    ctx.fillStyle='#9eb4d7';ctx.font='800 9px Consolas,monospace';ctx.textAlign='left';ctx.fillText('JUJUTSU CHRONICLES  /  CHAPTER 3',25,20);
    ctx.textAlign='right';ctx.fillStyle='#6b819f';ctx.fillText(c.stage==='intro'?'CONTINUING FROM CHAPTER 2':(c.stage==='domainIntro'?'DOMAIN COLLISION':'AWAKENING'),W-25,20);
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
      if(f===c.gojo){P.hipY=-56;P.shY=-95;P.headY=-112;P.lean=-8;P.armF=[-55,-18];P.armB=[-50,4];P.legF=[58,47];P.legB=[128,-18];if(c.t>.85&&c.t<2.3){P.lean=-2;P.armF=[-42,11];P.armB=[-70,6];}}
      else if(f===c.sukuna){P.hipY=-57;P.shY=-95;P.headY=-112;P.lean=8;P.armF=[-15,-20];P.armB=[-30,15];P.legF=[86,6];P.legB=[96,-8];}
      else if(f===c.yuta){P.hipY=-56;P.shY=-94;P.headY=-111;P.lean=-4;P.armF=[-45,20];P.armB=[-24,-15];P.legF=[87,4];P.legB=[95,-7];}
    }else if(c.stage==='domainIntro'){
      if(f===c.gojo){P.hipY=-57;P.shY=-96;P.headY=-113;P.lean=-3;P.legF=[80,8];P.legB=[96,-8];P.armF=c.t<1.35?[-95,18]:[-72,20];P.armB=c.t<1.35?[-108,-12]:[-88,-5];}
      else if(f===c.sukuna){P.hipY=-58;P.shY=-97;P.headY=-114;P.lean=4;P.legF=[82,3];P.legB=[105,-11];P.armF=c.t<3.95?[-12,-35]:[-38,18];P.armB=c.t<3.95?[-28,18]:[-58,-8];}
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
      drawCaption(c);
      if(c.stage==='intro'&&c.t<.18){ctx.save();ctx.fillStyle='rgba(0,0,0,'+(.4*(1-c.t/.18))+')';ctx.fillRect(0,0,W,H);ctx.restore();}
      if(c.stage==='domainIntro'&&c.t>3.85&&c.t<5.2){ctx.save();ctx.globalAlpha=.08+Math.sin(c.t*24)*.04;ctx.fillStyle=(Math.floor(c.t*20)%2)?'#83dcff':'#ff5167';ctx.fillRect(0,0,W,H);ctx.restore();}
      if(c.stage==='ending'&&c.t>6.5)drawEndCard(c,false);
      if(c.stage==='defeat')drawEndCard(c,true);
    }else if(c.stage==='complete')drawEndCard(c,false);
    else if(c.stage==='failedCard')drawEndCard(c,true);
    if(c.domainsActive)drawDomainClashFX(c);
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
      if(c.stage==='intro'||c.stage==='domainIntro'||c.stage==='ending'||c.stage==='defeat'){tick();return;}
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