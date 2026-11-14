/* ===== GITHUB PAGES AUTO UPDATE MANAGER =====
   Detects a new main-branch commit, waits for Pages to publish that exact
   commit, then reloads only when the player is back at the main menu.
*/
(()=>{
  'use strict';
  const REPO='toikhong713-hue/jujutsu-fight-preview';
  const VERSION_URL='./version.json';
  const COMMIT_URL='https://api.github.com/repos/'+REPO+'/commits/main';
  const CHECK_LATEST_MS=60000;
  const CHECK_DEPLOY_MS=12000;
  let loadedSha='';
  let latestSha='';
  let deployedSha='';
  let phase='checking';
  let reloadTimer=0;
  let latestTimer=0;
  let deployTimer=0;
  let ui=null;

  function makeUI(){
    if(ui)return ui;
    const style=document.createElement('style');
    style.textContent=`
      #jffUpdateNotice{position:fixed;z-index:99999;top:14px;left:50%;transform:translateX(-50%);
        display:none;align-items:center;gap:12px;max-width:calc(100vw - 24px);padding:10px 14px;
        border:1px solid rgba(255,190,130,.42);border-radius:10px;background:rgba(13,15,22,.94);
        color:#ffe4cb;font:700 11px/1.35 system-ui,sans-serif;letter-spacing:1.5px;
        box-shadow:0 10px 34px rgba(0,0,0,.42);backdrop-filter:blur(12px)}
      #jffUpdateNotice[data-state="ready"]{border-color:rgba(130,220,255,.55);color:#c9f0ff}
      #jffUpdateNotice .jffUpdateDot{width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:#ff9a61;
        box-shadow:0 0 12px currentColor;animation:jffUpdatePulse 1s infinite alternate}
      #jffUpdateNotice[data-state="ready"] .jffUpdateDot{background:#75d9ff}
      #jffUpdateNotice button{border:1px solid currentColor;border-radius:6px;padding:6px 9px;background:transparent;
        color:inherit;font:inherit;letter-spacing:1px;cursor:pointer}
      #jffUpdateNotice button:hover{background:rgba(255,255,255,.1)}
      @keyframes jffUpdatePulse{to{opacity:.35;transform:scale(.75)}}
      @media(max-width:520px){#jffUpdateNotice{font-size:9px;letter-spacing:1px;gap:8px;padding:8px 10px}}
    `;
    document.head.appendChild(style);
    ui=document.createElement('div');
    ui.id='jffUpdateNotice';
    ui.setAttribute('role','status');
    ui.setAttribute('aria-live','polite');
    ui.innerHTML='<span class="jffUpdateDot"></span><span class="jffUpdateText">CHECKING FOR UPDATES</span><button type="button">RELOAD NOW</button>';
    ui.querySelector('button').addEventListener('click',()=>location.reload());
    document.body.appendChild(ui);
    return ui;
  }
  function show(message,state){
    const el=makeUI();
    el.dataset.state=state||'updating';
    el.querySelector('.jffUpdateText').textContent=message;
    el.style.display='flex';
  }
  function hide(){
    if(ui)ui.style.display='none';
  }
  async function fetchJson(url){
    const response=await fetch(url+(url.includes('?')?'&':'?')+'_='+Date.now(),{
      cache:'no-store',credentials:'omit',headers:{'Cache-Control':'no-cache'}
    });
    if(!response.ok)throw new Error('HTTP '+response.status);
    return response.json();
  }
  async function readDeployed(){
    const data=await fetchJson(VERSION_URL);
    return typeof data.sha==='string'?data.sha:'';
  }
  async function readLatest(){
    const data=await fetchJson(COMMIT_URL);
    return typeof data.sha==='string'?data.sha:'';
  }
  function atMainMenu(){
    const menu=document.getElementById('menu');
    return !!(menu&&menu.classList.contains('on'));
  }
  function queueReload(){
    if(reloadTimer||phase!=='ready'||!atMainMenu())return;
    show('UPDATE INSTALLED · RELOADING', 'ready');
    reloadTimer=setTimeout(()=>location.reload(),1800);
  }
  function updateState(){
    if(!loadedSha||!latestSha||latestSha===loadedSha){
      if(phase==='checking')hide();
      return;
    }
    if(deployedSha===latestSha){
      phase='ready';
      show('UPDATE READY · RELOAD AT MENU','ready');
      queueReload();
    }else{
      phase='deploying';
      show('UPDATING · WAITING FOR GITHUB PAGES','updating');
    }
  }
  async function checkDeployment(){
    if(phase==='ready')return;
    try{
      deployedSha=await readDeployed();
      updateState();
    }catch(_){
      // A missing marker usually means the first deploy has not finished yet.
      if(phase==='deploying')show('UPDATING · WAITING FOR GITHUB PAGES','updating');
    }
  }
  async function checkLatest(){
    try{
      latestSha=await readLatest();
      if(latestSha&&latestSha!==loadedSha){
        if(phase==='checking')phase='deploying';
        updateState();
        if(phase!=='ready'&&!deployTimer)deployTimer=setInterval(checkDeployment,CHECK_DEPLOY_MS);
        await checkDeployment();
      }else if(phase==='checking'){
        hide();
      }
    }catch(_){
      // Keep the game playable if GitHub's public API is temporarily unavailable.
    }
  }
  function onMenuChange(){
    if(phase==='ready'&&atMainMenu())queueReload();
  }
  function start(){
    makeUI();
    readDeployed().then(sha=>{
      loadedSha=sha;
      if(!loadedSha){hide();return;}
      phase='checking';
      checkLatest();
      latestTimer=setInterval(checkLatest,CHECK_LATEST_MS);
      const observer=new MutationObserver(onMenuChange);
      const menu=document.getElementById('menu');
      if(menu)observer.observe(menu,{attributes:true,attributeFilter:['class']});
      document.addEventListener('visibilitychange',()=>{
        if(!document.hidden){checkLatest();if(phase!=='ready')checkDeployment();}
      });
    }).catch(()=>hide());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
