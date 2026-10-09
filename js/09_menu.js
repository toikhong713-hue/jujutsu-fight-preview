'use strict';
/* ===== MENU ===== */
const screens={menu:document.getElementById('menu'),charSelect:document.getElementById('charSelect'),storySelect:document.getElementById('storySelect'),controls:document.getElementById('controlsScreen'),pause:document.getElementById('pauseMenu')};
function showScreen(name){for(const k in screens)screens[k].classList.remove('on');if(name&&screens[name])screens[name].classList.add('on');}
let pendingMode=null;
const menuItems=[...document.querySelectorAll('#mainMenuNav .menuItem')];
let menuCursor=0;
function setMenuCursor(i,focus=false){
  if(!menuItems.length)return;
  menuCursor=(i+menuItems.length)%menuItems.length;
  menuItems.forEach((el,n)=>el.classList.toggle('active',n===menuCursor));
  const el=menuItems[menuCursor];
  document.getElementById('menuModeTitle').textContent=el.dataset.title||'';
  document.getElementById('menuModeIndex').textContent=el.dataset.index||String(menuCursor+1).padStart(2,'0');
  document.getElementById('menuModeCopy').textContent=el.dataset.copy||'';
  document.getElementById('menuModeTag').textContent=el.dataset.tag||'';
  if(focus)el.scrollIntoView({block:'nearest'});
}
function activateMenuItem(el){
  SFX.init();SFX.ui();
  const m=el.dataset.mode;
  if(m==='controls'){showScreen('controls');return;}
  if(m==='versus'){pendingMode='versus';showScreen('charSelect');toggleTrainingCards(false);return;}
  if(m==='cpu'){pendingMode='cpu';showScreen('charSelect');toggleTrainingCards(false);return;}
  if(m==='training'){pendingMode='training';showScreen('charSelect');toggleTrainingCards(true);return;}
  if(m==='survival'){pendingMode='survival';showScreen('charSelect');toggleTrainingCards(false);return;}
  if(m==='timeattack'){pendingMode='timeattack';showScreen('charSelect');toggleTrainingCards(false);return;}
  if(m==='story'){pendingMode='story';showScreen('storySelect');return;}
}
menuItems.forEach((b,n)=>b.addEventListener('click',()=>{setMenuCursor(n);activateMenuItem(b);}));
setMenuCursor(0);
document.addEventListener('keydown',(e)=>{
  if(G.mode!=='menu'||!screens.menu.classList.contains('on'))return;
  if(screens.storySelect.classList.contains('on')||screens.charSelect.classList.contains('on')||screens.controls.classList.contains('on'))return;
  if(e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();e.stopPropagation();setMenuCursor(menuCursor+1,true);return;}
  if(e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();e.stopPropagation();setMenuCursor(menuCursor-1,true);return;}
  if(e.code==='Enter'||e.code==='Space'){
    e.preventDefault();e.stopPropagation();activateMenuItem(menuItems[menuCursor]);
  }
},true);
function toggleTrainingCards(show){
  const heianCard=document.querySelector('.card.heian');
  const strongCard=document.querySelector('.card.strongest');
  if(heianCard){if(show)heianCard.classList.remove('hidden');else heianCard.classList.add('hidden');}
  if(strongCard){if(show)strongCard.classList.remove('hidden');else strongCard.classList.add('hidden');}
}
const tojiMovesetOverlay=document.getElementById('tojiMovesetOverlay');
let tojiWeaponRow=0,tojiFrame=0;
function closeTojiMoveset(){if(!tojiMovesetOverlay)return;tojiMovesetOverlay.classList.remove('on');tojiMovesetOverlay.setAttribute('aria-hidden','true');}
document.querySelector('[data-open-toji-moveset]')?.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();openTojiMoveset();});
document.querySelector('[data-close-toji-moveset]')?.addEventListener('click',closeTojiMoveset);
tojiMovesetOverlay?.addEventListener('click',(e)=>{if(e.target===tojiMovesetOverlay)closeTojiMoveset();});
document.addEventListener('keydown',(e)=>{
  if(e.code==='Escape'&&tojiMovesetOverlay?.classList.contains('on')){e.preventDefault();e.stopPropagation();closeTojiMoveset();return;}
  if(!tojiMovesetOverlay?.classList.contains('on'))return;
  if(/^Digit[1-6]$/.test(e.code)){e.preventDefault();setTojiFrame(tojiWeaponRow*6+Number(e.code.slice(-1))-1);}
},true);
document.getElementById('btnCtrlBack').addEventListener('click',()=>{showScreen('menu');});
document.getElementById('storyChapter1').addEventListener('click',()=>{SFX.ui();launch('story','gojo','sukuna');});
document.querySelectorAll('#charSelect .card').forEach(c=>{
  c.addEventListener('click',()=>{
    SFX.ui();
    const ch=c.dataset.char;
    if((ch==='heian_sukuna'||ch==='the_strongest_today')&&pendingMode!=='training')return;
    const p2=(ch==='gojo'||ch==='young_gojo')?'sukuna':(ch==='sukuna'?'yuta':(ch==='yuta'?'hakari':(ch==='hakari'?'toji':(ch==='toji'?'young_gojo':'sukuna'))));
    launch(pendingMode,ch,p2);
  });
});
document.getElementById('btnResume').addEventListener('click',()=>togglePause(false));
document.getElementById('btnRestart').addEventListener('click',()=>{togglePause(false);startMatch(G.mode,G.fighters[0].id,G.fighters[1].id,G.difficulty);});
document.getElementById('btnQuit').addEventListener('click',()=>{togglePause(false);G.mode='menu';showScreen('menu');});
function launch(mode,p1,p2){
  showScreen(null);
  if(mode==='story'){startChapter1();return;}
  if(mode==='survival'){G.survivalRound=1;}
  startMatch(mode,p1,p2,G.difficulty);
}
/* ===== STORY CONTROLLER ===== */
const STORY_CHAPTERS={
  1:{title:'ENCOUNTER',subtitle:'THE STRONGEST MEETS THE KING OF CURSES',
     p1:'gojo',p2:'sukuna',diff:'hard',
     acts:[
       {name:'PROLOGUE',speaker:'GOJO SATORU',text:'So this is the one everyone has been talking about.',tone:'#7fd8ff'},
       {name:'RISING CONFLICT',speaker:'SUKUNA',text:'You came here to test a legend. Do not blink.',tone:'#ff7a7a'},
       {name:'DOMAIN CLASH',speaker:'BOTH',text:'Then let us settle this with our domains.',tone:'#ffd166'},
       {name:'FINAL EXCHANGE',speaker:'GOJO SATORU',text:'No more testing. I am ending this.',tone:'#7fd8ff'},
       {name:'EPILOGUE',speaker:'NARRATOR',text:'The first collision has only opened the door.',tone:'#c9d7ff'}
     ]}
};
function startChapter1(){
  G.story={chapter:1,act:0,phase:0,cutscene:true,clashStarted:false,clashResolved:false,ending:null,checkpoint:0,flags:{clean:false,clashWinner:null}};
  localStorage.setItem('jff_story_ch1_started','1');
  storyScene('PROLOGUE',p1Char==='young_gojo'?'YOUNG GOJO':'GOJO SATORU',p1Char==='young_gojo'?'So this is the curse everyone keeps talking about.':'So this is the one everyone has been talking about.',1200,()=>{
    storyScene('PROLOGUE','SUKUNA','And you came all this way to see whether the stories were true.',1200,()=>{
      storyScene('CHAPTER 1 · ENCOUNTER','NARRATOR','Two monsters. One battlefield. No room left for doubt.',1300,()=>{
        G.story.cutscene=false;G.story.act=1;G.story.phase=1;G.story.checkpoint=1;
        startMatch('story','gojo','sukuna','hard');
      });
    });
  });
}
function storyScene(label,who,text,dur,cb){
  G.story.cutscene=true;
  const dlg=document.getElementById('dialogue');
  dlg.querySelector('.who').textContent=who;
  dlg.querySelector('.say').textContent=label+'\n\n'+text;
  dlg.classList.add('on');
  setTimeout(()=>{dlg.classList.remove('on');if(cb)cb();},dur);
}
function storyBattlePause(label,who,text,dur,next){
  G.story.cutscene=true;G.roundState='intro';G.roundTimer=dur/16;
  storyScene(label,who,text,dur,()=>{
    if(G.matchOver)return;
    G.roundState='fight';G.story.cutscene=false;if(next)next();
  });
}
function storyCheckpoint(name){
  if(!G.story)return;
  G.story.checkpoint=G.story.phase;
  localStorage.setItem('jff_story_ch1_checkpoint',String(G.story.checkpoint));
  localStorage.setItem('jff_story_ch1_checkpoint_name',name);
}
function triggerChapter1Event(){
  if(G.mode!=='story'||!G.story||G.story.cutscene||G.matchOver||G.clash)return;
  const f1=G.fighters[0],f2=G.fighters[1];
  if(!f1||!f2)return;
  const p2hp=f2.hp/f2.maxHp;
  const p1hp=f1.hp/f1.maxHp;
  if(G.story.phase===1&&p2hp<=0.72){
    G.story.phase=2;G.story.act=1;storyCheckpoint('RISING_CONFLICT');
    f2.awakened=true;f2.awakenGlow=50;f2.meter=Math.min(100,f2.meter+40);
    flash(0.75,'#ff3344');shake(18);camPunch(0.22);
    storyBattlePause('RISING CONFLICT','SUKUNA','Now you have my attention.',1300);
    return;
  }
  if(G.story.phase===2&&p2hp<=0.45){
    G.story.phase=3;G.story.act=2;storyCheckpoint('DOMAIN CLASH');
    f1.meter=100;f2.meter=100;
    flash(1,'#ffffff');shake(24);camPunch(0.28);
    storyBattlePause('DOMAIN CLASH','BOTH','DOMAIN EXPANSION.',900,()=>{
      if(!G.clash&&!G.matchOver){
        G.story.clashStarted=true;
        triggerClash(f1,f2);
      }
    });
    return;
  }
  if(G.story.phase===4&&p2hp<=0.18){
    G.story.phase=5;G.story.act=3;storyCheckpoint('FINAL EXCHANGE');
    f1.meter=Math.max(f1.meter,100);f1.energy=Math.max(f1.energy,75);
    f2.meter=Math.max(f2.meter,80);
    flash(0.9,'#ffffff');shake(20);camPunch(0.25);
    storyBattlePause('FINAL EXCHANGE','GOJO SATORU','No more testing.',900);
    return;
  }
  if(G.story.phase===5&&p1hp>0&&p1hp<=0.25&&f2.hp>0){
    G.story.flags.clean=false;
  }
}
function handleChapter1ClashResolution(){
  if(!G.story||!G.story.clashStarted||G.story.clashResolved||G.clash)return;
  if(G.story.phase===3){
    G.story.clashResolved=true;G.story.phase=4;G.story.act=3;
    storyCheckpoint('POST_DOMAIN');
    const w=G.clash&&G.clash.winner;
    G.story.flags.clashWinner=w?w.id:'collapse';
  }
}
function showStoryEnding(success){
  const dlg=document.getElementById('dialogue');
  const clean=!!(G.story&&G.story.flags&&G.story.flags.clean);
  let headline='CHAPTER 1 COMPLETE';
  let body='ENCOUNTER CLEARED. The next chapter awaits.';
  if(!success){headline='CHAPTER 1 FAILED';body='The encounter is unfinished. Restart Chapter 1 and try again.';}
  else if(clean){headline='CHAPTER 1 COMPLETE · CLEAN';body='You reached the final exchange without falling below 25% HP.\n\nA special ending flag has been recorded.';}
  else if(G.story&&G.story.flags&&G.story.flags.clashWinner==='gojo'){body='Unlimited Void wins the first great collision.\n\nA hidden route flag has been recorded.';}
  else if(G.story&&G.story.flags&&G.story.flags.clashWinner==='sukuna'){body='Malevolent Shrine survives the clash.\n\nA hidden route flag has been recorded.';}
  dlg.querySelector('.who').textContent=headline;
  dlg.querySelector('.say').textContent=body+'\n\nPress ENTER / SPACE / ESC to return to the menu.';
  dlg.classList.add('on');G.matchOverScreen=true;
  if(success){localStorage.setItem('jff_story_ch1_complete','1');localStorage.setItem('jff_story_unlocked_ch2','1');}
}
function showResult(){
  const w=G.winner;const dlg=document.getElementById('dialogue');
  let who='DRAW',say='';
  if(G.mode==='survival'){const cleared=Math.max(0,G.survivalRound-1);who='SURVIVAL ENDED';say='SURVIVED '+cleared+' BATTLE'+(cleared===1?'':'S')+'   —   Press ENTER / SPACE / ESC to return to menu.';}
  else if(G.mode==='timeattack'){who=w?w.name:'DRAW';say=(w?w.short+' WINS!':'NO CONTEST')+'   TIME: '+G.timeAttackResult.toFixed(2)+'s   —   Press ENTER to return to menu.';}
  else{who=w?w.name:'DRAW';say=(w?w.short+' WINS THE MATCH!':'NO CONTEST')+'   —   Press ENTER to return to menu.';}
  dlg.querySelector('.who').textContent=who;dlg.querySelector('.say').textContent=say;
  dlg.classList.add('on');G.matchOverScreen=true;
}
function hideResult(){
  document.getElementById('dialogue').classList.remove('on');
  G.matchOverScreen=false;G.mode='menu';showScreen('menu');G.fighters=[];
}
function MenuKey(code){
  if(G.mode==='menu'){
    if(screens.storySelect.classList.contains('on')){
      if(code==='Digit1'||code==='Numpad1')launch('story','gojo','sukuna');
      if(code==='Digit2'||code==='Numpad2')launch('story','young_gojo','sukuna');
      if(code==='Escape')showScreen('menu');
      return;
    }
    if(screens.charSelect.classList.contains('on')){
      const heianVisible=!document.querySelector('.card.heian').classList.contains('hidden');
      const strongVisible=!document.querySelector('.card.strongest').classList.contains('hidden');
      if(code==='Digit1'||code==='Numpad1')launch(pendingMode,'gojo','sukuna');
      if(code==='Digit2'||code==='Numpad2')launch(pendingMode,'young_gojo','sukuna');
      if(code==='Digit3'||code==='Numpad3')launch(pendingMode,'sukuna','yuta');
      if(code==='Digit4'||code==='Numpad4')launch(pendingMode,'yuta','hakari');
      if(code==='Digit5'||code==='Numpad5')launch(pendingMode,'hakari','toji');
      if(code==='Digit6'||code==='Numpad6')launch(pendingMode,'toji','sukuna');
      if(heianVisible&&(code==='Digit7'||code==='Numpad7'))launch(pendingMode,'heian_sukuna','sukuna');
      if(strongVisible&&(code==='Digit8'||code==='Numpad8'))launch(pendingMode,'the_strongest_today','sukuna');
      if(code==='Escape')showScreen('menu');
      return;
    }
    if(screens.controls.classList.contains('on')){if(code==='Escape')showScreen('menu');return;}
    return;
  }
  if(G.matchOverScreen){if(code==='Enter'||code==='Space'||code==='Escape')hideResult();return;}
  if(G.mode!=='menu'){
    if(code==='Escape')togglePause();
    if(code==='KeyQ'&&G.paused){togglePause(false);G.mode='menu';showScreen('menu');}
    if(G.mode==='training'){
      if(code==='KeyT')G.training.boxes=!G.training.boxes;
      if(code==='KeyY')G.training.frames=!G.training.frames;
      if(code==='KeyR'){resetFighter(G.fighters[0],ARENA_W/2-190,1);resetFighter(G.fighters[1],ARENA_W/2+190,-1);}
      // Training-only shortcuts use B/N/M so Toji and Young Gojo can keep G/Z/X for gameplay.
      if(code==='KeyB'){startMatch('training',G.fighters[0].id,G.fighters[1].id);}
      if(code==='KeyN')G.training.infHP=!G.training.infHP;
      if(code==='KeyM')G.training.infEnergy=!G.training.infEnergy;
      if(code==='KeyC')G.training.infUlt=!G.training.infUlt;
      if(code==='KeyV')G.training.noCd=!G.training.noCd;
    }
  }
}
function togglePause(v){G.paused=(v===undefined)?!G.paused:v;showScreen(G.paused?'pause':null);}
/* ===== BOOT ===== */
function KP_RESET(){for(const k in KP)KP[k]=false;}
function resize(){const s=Math.min(window.innerWidth/W,window.innerHeight/H);document.getElementById('wrap').style.transform='translate(-50%,-50%) scale('+s+')';}
addEventListener('resize',resize);
resize();
buildBackground();
let last=performance.now(),acc=0;
function loop(now){
  requestAnimationFrame(loop);
  let dt=now-last;last=now;if(dt>120)dt=120;acc+=dt;
  let guard=0;
  while(acc>=STEP_MS&&guard<6){step();acc-=STEP_MS;guard++;}
  if(acc>STEP_MS*6)acc=0;
  render();
}
showScreen('menu');
requestAnimationFrame(loop);
['click','keydown','touchstart'].forEach(ev=>{addEventListener(ev,()=>SFX.init(),{once:true});});