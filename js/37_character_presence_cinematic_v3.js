/* JFF CHARACTER ACTIONS + ENVIRONMENTAL PRESENCE V3
   Distinct entrance actions + environmental reaction + short-form pressure impacts.
   Canvas 2D only. Low-end-aware post-processing. Never mutates ordinary attack frames.
*/
(function(){
  'use strict';
  if(window.JFF_CHARACTER_PRESENCE_V3)return;
  if(typeof G==='undefined'||typeof cam==='undefined'||typeof ctx==='undefined')return;

  const DURATION=7.05, TAIL_FRAMES=108, FEAR_FRAMES=20;
  const LOW_END=((navigator.hardwareConcurrency||0)>0&&navigator.hardwareConcurrency<=2)||
    ((navigator.deviceMemory||0)>0&&navigator.deviceMemory<=4);
  const baseResetRound=window.resetRound,baseStep=window.step;
  const baseRender=window.render,baseDrawFighter=window.drawFighter;
  const baseMenuKey=window.MenuKey,baseApplyPose=window.applyCharacterIdentityPose;
  const baseUpdateFighter=window.updateFighter;
  if(![baseResetRound,baseStep,baseRender,baseDrawFighter].every(fn=>typeof fn==='function')){
    console.warn('[JFF Presence V3] Required game hooks missing; module disabled.');return;
  }

  const PROFILE={
    gojo:{color:'#82e6ff',hot:'#f4fdff',kind:'limitless',title:'THE HONORED ONE',action:'INFINITY REVEALS ITSELF',mood:'THE WORLD BENDS AROUND HIM'},
    young_gojo:{color:'#a1edff',hot:'#ffffff',kind:'sixeyes',title:'SIX EYES AWAKEN',action:'THE BLINDFOLD LIFTS',mood:'EVERY DETAIL IS ALREADY KNOWN'},
    sukuna:{color:'#ff4059',hot:'#ffb3a8',kind:'slaughter',title:'KING OF CURSES',action:'THE AIR IS CUT APART',mood:'THE BATTLEFIELD BECOMES HIS DOMAIN'},
    yuji:{color:'#ff765e',hot:'#ffeadb',kind:'impact',title:'VESSEL OF POWER',action:'FISTS SETTLE THE ARGUMENT',mood:'RAW POWER, HELD JUST BENEATH THE SURFACE'},
    yuta:{color:'#c9a6ff',hot:'#f5efff',kind:'rika',title:'CURSED BOND',action:'KATANA DRAW: ONE CLEAN ARC',mood:'A SECOND PRESENCE STIRS BEHIND HIM'},
    hakari:{color:'#ffd166',hot:'#fff6c9',kind:'jackpot',title:'FEVER OF THE JACKPOT',action:'ONE COIN. ONE FLIP. ALL IN.',mood:'THE ODDS ARE ABOUT TO BREAK'},
    toji:{color:'#b6c6cf',hot:'#f8ffff',kind:'assassin',title:'SORCERER KILLER',action:'STEEL LEAVES THE SHEATH',mood:'NO CURSED ENERGY. NO WARNING.'},
    heian_sukuna:{color:'#ff334c',hot:'#ffd0c5',kind:'calamity',title:'ANCIENT CALAMITY',action:'FOUR ARMS, FOUR DIRECTIONS',mood:'A DISASTER GIVEN HUMAN FORM'},
    the_strongest_today:{color:'#00e4f5',hot:'#d4ffff',kind:'spatial',title:'SPATIAL DOMINION',action:'DISTANCE FOLDS INWARD',mood:'SPACE ITSELF STANDS ASIDE'}
  };
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*clamp(t,0,1);
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const out=t=>1-Math.pow(1-clamp(t,0,1),3);
  const profile=f=>{
    if(!f)return PROFILE.gojo;
    if(f.id==='sukuna'&&f.form===1)return PROFILE.yuji;
    return PROFILE[f.id]||{color:'#b7d5e8',hot:'#ffffff',kind:'generic',title:f.short||'SORCERER',action:'CURSED ENERGY RISES',mood:'A PRESENCE ENTERS THE FIELD'};
  };
  const keyId=f=>(f&&f.id==='sukuna'&&f.form===1)?'yuji':(f&&f.id)||'gojo';
  const active=()=>!!(G.presenceCine&&G.presenceCine.active);
  const storyActive=()=>G.mode==='story'&&!!(G.ch1Cine&&G.ch1Cine.active);
  const storyPhase=()=>storyActive()?G.ch1Cine.phase:-1;
  const storyT=()=>storyActive()?G.ch1Cine.t:0;
  function camera(x,zoom,y,shakeX,shakeY){
    cam.x=cam.tx=x+(shakeX||0);cam.y=cam.ty=(y===undefined?430:y)+(shakeY||0);
    cam.zoom=cam.tzoom=zoom;
  }
  function resetInput(){
    try{if(typeof KP_RESET==='function')KP_RESET();else if(typeof KP!=='undefined')for(const k in KP)KP[k]=false;}catch(_){}
  }
  function resetCustomState(){
    G.presenceCine=null;G.presenceFx=null;
    if(G.fighters)for(const f of G.fighters){
      f.presencePose='idle';f.presencePoseWeight=0;f.presenceAuraFrames=0;
      f.presenceFearFrames=0;f.presenceActionT=0;f.presenceAwakenThreatFired=false;
      f.presenceDomainToken=null;
    }
  }
  function setPose(f,name,q){
    f.presencePose=name;f.presencePoseWeight=1;f.presenceActionT=clamp(q||0,0,1);
  }
  function begin(){
    if(!G.fighters||G.fighters.length<2||G.mode==='menu'||storyActive()||
      (G.storyCutscene||!!(G.story&&G.story.cutscene)))return;
    const a=G.fighters[0],b=G.fighters[1];if(!a||!b)return;
    G.startupCine=null;
    const center=ARENA_W/2,targetA=center-190,targetB=center+190;
    G.presenceCine={
      active:true,t:0,phase:0,center,targetA,targetB,
      startA:Math.max(150,center-560),startB:Math.min(ARENA_W-150,center+560),
      freezeFrames:0,pressureTriggered:false,pressureAudioPlayed:false,
      seed:((G.frame||0)%997)/997*Math.PI*2
    };
    G.presenceFx=null;
    for(const f of [a,b]){
      f.vx=0;f.vy=0;f.walk=0;f.state='IDLE';f.stateFrame=0;
      f.move=null;f.moveKey=null;f.moveFrame=0;f.blocking=false;
      f.presenceAuraFrames=0;f.presenceFearFrames=0;f.presenceAwakenThreatFired=false;
      f.presenceDomainToken=null;f.animT=(f.animT||0)*.25;
    }
    a.x=G.presenceCine.startA;b.x=G.presenceCine.startB;
    a.y=GROUND;b.y=GROUND;a.facing=1;b.facing=-1;
    setPose(a,'intro',0);setPose(b,'intro',0);
    G.roundState='intro';G.roundTimer=0;G.matchOver=false;G.winner=null;
    camera(center,.79,430);
  }
  function finish(){
    const c=G.presenceCine;
    if(!c||!G.fighters||G.fighters.length<2){G.presenceCine=null;return;}
    const a=G.fighters[0],b=G.fighters[1];
    a.x=c.targetA;b.x=c.targetB;
    for(const f of [a,b]){
      f.x=Math.round(f.x);f.y=GROUND;f.vx=0;f.vy=0;f.walk=0;
      f.state='IDLE';f.stateFrame=0;f.move=null;f.moveKey=null;f.moveFrame=0;
      f.presencePose='idle';f.presencePoseWeight=0;f.presenceActionT=0;
      f.presenceAuraFrames=TAIL_FRAMES;
    }
    a.facing=1;b.facing=-1;
    G.roundState='fight';G.roundTimer=0;G.presenceCine=null;
    camera(c.center,.89,430);resetInput();
    restoreSfxGain();
  }
  function soundDucking(c){
    try{
      if(typeof SFX==='undefined')return;
      if(!SFX.ctx)SFX.init();
      if(!SFX.ctx||!SFX.master)return;
      const now=SFX.ctx.currentTime,param=SFX.master.gain;
      c.savedGain=param.value||0.4;
      param.cancelScheduledValues(now);
      param.setTargetAtTime(Math.max(.07,c.savedGain*.30),now,.018);
      param.setTargetAtTime(c.savedGain,now+.36,.11);
      SFX.tone(49,.42,'sine',.12,29);
      SFX.noise(.26,.035,115,.8);
    }catch(_){}
  }
  function restoreSfxGain(){
    try{
      if(typeof SFX==='undefined'||!SFX.ctx||!SFX.master)return;
      const now=SFX.ctx.currentTime;
      SFX.master.gain.cancelScheduledValues(now);
      SFX.master.gain.setTargetAtTime(.4,now,.08);
    }catch(_){}
  }
  function rumbleController(){
    try{
      if(!navigator.getGamepads)return;
      for(const pad of navigator.getGamepads()){
        if(!pad)continue;
        const actuator=pad.vibrationActuator;
        if(actuator&&typeof actuator.playEffect==='function'){
          actuator.playEffect('dual-rumble',{duration:180,strongMagnitude:.38,weakMagnitude:.22}).catch(()=>{});
          break;
        }
        const h=pad.hapticActuators&&pad.hapticActuators[0];
        if(h&&typeof h.pulse==='function'){h.pulse(.35,180);break;}
      }
    }catch(_){}
  }
  function pressureBurst(c){
    c.pressureTriggered=true;
    c.freezeFrames=3; // cinematic-only 3-frame hold, then a short camera recoil
    soundDucking(c);rumbleController();
  }
  function tick(){
    const c=G.presenceCine;if(!c||!c.active||G.paused)return;
    if(c.freezeFrames>0){c.freezeFrames--;return;}
    c.t+=1/60;
    const t=c.t,a=G.fighters&&G.fighters[0],b=G.fighters&&G.fighters[1];
    if(!a||!b){G.presenceCine=null;restoreSfxGain();return;}
    let phase=0;
    if(t>=.28&&t<1.42)phase=1;          // A entrance
    else if(t>=1.42&&t<2.34)phase=2;    // A signature action
    else if(t>=2.34&&t<3.48)phase=3;   // B entrance
    else if(t>=3.48&&t<4.40)phase=4;   // B signature action
    else if(t>=4.40&&t<5.18)phase=5;   // face-off
    else if(t>=5.18&&t<6.08)phase=6;   // pressure burst
    else if(t>=6.08)phase=7;           // FIGHT
    c.phase=phase;G.frame=(G.frame||0)+1;
    applyEntranceMotion(a,t,phase,0,c);
    applyEntranceMotion(b,t,phase,1,c);
    if(t<.28)camera(c.center,.78,430);
    else if(t<2.34){
      const q=clamp((t-.28)/2.06,0,1);
      camera(a.x+40,mix(1.02,1.27,smooth(q)),t>1.42?414:424);
    }else if(t<4.40){
      const q=clamp((t-2.34)/2.06,0,1);
      camera(b.x-38,mix(1.02,1.26,smooth(q)),t>3.48?414:424);
    }else if(t<5.18)camera(c.center,.88,426);
    else if(t<6.08){
      if(!c.pressureTriggered&&t>=5.23)pressureBurst(c);
      const pulse=Math.sin((t-5.18)*Math.PI*15);
      camera(c.center,.96+Math.max(0,pulse)*.07,410,Math.sin(t*79)*2.1,Math.cos(t*73)*1.1);
    }else camera(c.center,.91,426);
    if(t>=DURATION)finish();
  }
  function applyEntranceMotion(f,t,phase,side,c){
    const p=profile(f),local=side===0,dir=f.facing||1;
    f.animT=(f.animT||0)+1.12+(p.kind==='jackpot'?.25:0);
    f.stateFrame=(f.stateFrame||0)+1;f.vx=0;f.vy=0;
    if(phase===0){setPose(f,'intro',0);return;}
    if(phase===1&&local){
      const q=out((t-.28)/1.12);setPose(f,'entrance',q);
      f.x=mix(c.startA,c.targetA,q);f.y=GROUND;
      f.state=t<1.27?'WALK':'IDLE';f.walk=t<1.27?Math.sin(t*14)*1.6:0;
    }else if(phase===2&&local){
      const q=clamp((t-1.42)/.92,0,1);setPose(f,'signature',q);
      const move=p.kind==='assassin'?16:(p.kind==='impact'?12:(p.kind==='rika'?7:3));
      f.x=c.targetA+dir*Math.sin(q*Math.PI)*move;
      f.y=GROUND-(p.kind==='jackpot'?Math.sin(q*Math.PI)*5:0);
      f.state='IDLE';f.walk=0;
    }else if(phase===3&&!local){
      const q=out((t-2.34)/1.12);setPose(f,'entrance',q);
      f.x=mix(c.startB,c.targetB,q);f.y=GROUND;
      f.state=t<3.34?'WALK':'IDLE';f.walk=t<3.34?Math.sin(t*13.2)*1.5:0;
    }else if(phase===4&&!local){
      const q=clamp((t-3.48)/.92,0,1);setPose(f,'signature',q);
      const move=p.kind==='assassin'?16:(p.kind==='impact'?12:(p.kind==='rika'?7:3));
      f.x=c.targetB+dir*Math.sin(q*Math.PI)*move;
      f.y=GROUND-(p.kind==='jackpot'?Math.sin(q*Math.PI)*5:0);
      f.state='IDLE';f.walk=0;
    }else if(phase===5||phase===6){
      setPose(f,phase===5?'faceoff':'power',phase===5?0:clamp((t-5.18)/.9,0,1));
      f.x=local?c.targetA:c.targetB;f.y=GROUND;f.state='IDLE';f.walk=0;
    }else if(phase===7){
      setPose(f,'power',1);f.x=local?c.targetA:c.targetB;f.y=GROUND;f.state='IDLE';f.walk=0;
    }
    if(p.kind==='assassin'&&((phase===5)||(phase===6)))f.x+=(Math.sin(t*4.5)*.65);
    if(p.kind==='slaughter'&&(phase===5||phase===6))f.x+=Math.sin(t*2.5)*.5;
    if(p.kind==='calamity'&&phase>=5)f.y=GROUND-Math.abs(Math.sin(t*3.1))*1.3;
  }

  // Distinct pose keyframes are applied to the existing procedural skeleton.
  const pose=(lean,armF,armB,hipY=-58,headY=-112,shY=-96,legF=[88,6],legB=[94,-6])=>
    ({hipY,shY,headY,headX:0,lean,armF,armB,legF,legB});
  const POSE_KEYS={
    gojo:[
      {t:0,p:pose(-2,[64,34],[112,18])},
      {t:.24,p:pose(-5,[278,5],[112,12],-58,-114,-98)},
      {t:.55,p:pose(-4,[284,-9],[104,4],-61,-115,-98,[90,4],[94,-4])},
      {t:.76,p:pose(-8,[328,-34],[105,8],-59,-113,-98)},
      {t:1,p:pose(-2,[64,30],[112,18])}
    ],
    young_gojo:[
      {t:0,p:pose(1,[62,24],[108,19])},
      {t:.27,p:pose(-3,[236,-44],[112,15],-58,-117,-99)},
      {t:.55,p:pose(0,[270,-8],[114,9],-60,-118,-100)},
      {t:.74,p:pose(3,[72,7],[110,15],-59,-115,-99)},
      {t:1,p:pose(1,[62,24],[108,19])}
    ],
    sukuna:[
      {t:0,p:pose(10,[70,36],[116,12])},
      {t:.25,p:pose(15,[62,8],[145,-18],-56,-111,-94)},
      {t:.58,p:pose(17,[20,-12],[158,-26],-56,-112,-94,[83,12],[98,-9])},
      {t:.78,p:pose(12,[28,-18],[150,-20],-57,-110,-94)},
      {t:1,p:pose(10,[70,36],[116,12])}
    ],
    yuji:[
      {t:0,p:pose(5,[62,31],[111,15])},
      {t:.28,p:pose(12,[115,-75],[130,-30],-57,-112,-96,[84,8],[97,-8])},
      {t:.56,p:pose(20,[5,8],[142,-42],-54,-111,-98,[72,12],[114,-12])},
      {t:.76,p:pose(9,[10,12],[117,18],-56,-112,-96,[86,8],[96,-8])},
      {t:1,p:pose(5,[62,31],[111,15])}
    ],
    yuta:[
      {t:0,p:pose(-5,[75,35],[150,-75])},
      {t:.22,p:pose(-11,[135,-105],[165,-100],-57,-113,-97)},
      {t:.43,p:pose(-12,[42,-48],[152,-100],-56,-114,-99,[83,8],[97,-8])},
      {t:.63,p:pose(-15,[5,8],[130,-40],-54,-113,-98,[77,12],[108,-12])},
      {t:.80,p:pose(-3,[20,8],[110,20],-57,-112,-97)},
      {t:1,p:pose(-5,[75,35],[150,-75])}
    ],
    hakari:[
      {t:0,p:pose(5,[72,30],[118,12])},
      {t:.18,p:pose(7,[90,42],[140,-65],-57,-112,-96)},
      {t:.39,p:pose(3,[270,5],[133,-30],-59,-113,-97)},
      {t:.59,p:pose(1,[284,-12],[110,5],-59,-113,-97)},
      {t:.78,p:pose(8,[75,13],[118,12],-56,-112,-96)},
      {t:1,p:pose(5,[72,30],[118,12])}
    ],
    toji:[
      {t:0,p:pose(14,[150,-115],[118,14],-55,-109,-93,[84,10],[99,-9])},
      {t:.27,p:pose(18,[168,-145],[118,14],-54,-110,-93,[78,12],[104,-10])},
      {t:.48,p:pose(20,[40,-32],[145,-72],-53,-109,-95,[72,13],[111,-12])},
      {t:.67,p:pose(10,[4,18],[134,-26],-52,-109,-96,[74,13],[111,-11])},
      {t:.83,p:pose(16,[32,6],[120,8],-54,-109,-94)},
      {t:1,p:pose(14,[150,-115],[118,14],-55,-109,-93)}
    ],
    heian_sukuna:[
      {t:0,p:pose(9,[72,34],[115,14])},
      {t:.22,p:pose(13,[24,-12],[156,-24],-56,-111,-95)},
      {t:.50,p:pose(17,[14,-25],[168,-33],-55,-112,-96,[83,8],[99,-8])},
      {t:.78,p:pose(15,[28,-18],[150,-20],-56,-110,-95)},
      {t:1,p:pose(9,[72,34],[115,14])}
    ],
    the_strongest_today:[
      {t:0,p:pose(-1,[72,26],[102,22])},
      {t:.28,p:pose(-4,[273,0],[105,10],-59,-117,-101)},
      {t:.52,p:pose(-5,[282,-6],[105,-2],-61,-118,-102)},
      {t:.77,p:pose(-3,[315,-28],[103,2],-59,-117,-102)},
      {t:1,p:pose(-1,[72,26],[102,22])}
    ]
  };
  const POWER_POSES={
    gojo:pose(-8,[280,-10],[108,0],-60,-115,-99),
    young_gojo:pose(1,[267,-5],[108,8],-61,-117,-101),
    sukuna:pose(17,[18,-10],[157,-25],-56,-110,-95),
    yuji:pose(11,[12,12],[122,14],-56,-112,-96),
    yuta:pose(-12,[8,3],[132,-45],-56,-113,-99),
    hakari:pose(3,[278,0],[117,10],-58,-113,-97),
    toji:pose(19,[7,18],[145,-34],-52,-109,-94),
    heian_sukuna:pose(16,[15,-20],[166,-30],-55,-111,-96),
    the_strongest_today:pose(-5,[280,-5],[104,-3],-61,-118,-102)
  };
  function blendPose(P,target,weight){
    const w=clamp(weight,0,1);
    for(const k of ['hipY','shY','headY','headX','lean'])if(Number.isFinite(target[k]))P[k]=mix(P[k],target[k],w);
    for(const k of ['armF','armB','legF','legB'])if(Array.isArray(target[k])&&Array.isArray(P[k]))P[k]=[mix(P[k][0],target[k][0],w),mix(P[k][1],target[k][1],w)];
  }
  function sampleKeys(keys,q){
    if(!keys||!keys.length)return null;
    let a=keys[0],b=keys[keys.length-1];
    for(let i=0;i<keys.length-1;i++){if(q>=keys[i].t&&q<=keys[i+1].t){a=keys[i];b=keys[i+1];break;}}
    const n=clamp((q-a.t)/Math.max(.0001,b.t-a.t),0,1),e=smooth(n),outPose={};
    const keysToBlend=['hipY','shY','headY','headX','lean','armF','armB','legF','legB'];
    for(const k of keysToBlend){
      const av=a.p[k],bv=b.p[k];
      if(Array.isArray(av)&&Array.isArray(bv))outPose[k]=[mix(av[0],bv[0],e),mix(av[1],bv[1],e)];
      else if(Number.isFinite(av)&&Number.isFinite(bv))outPose[k]=mix(av,bv,e);
      else if(av!==undefined)outPose[k]=av;
      else if(bv!==undefined)outPose[k]=bv;
    }
    return outPose;
  }
  function cinematicInfo(f){
    const id=keyId(f),p=profile(f);
    if(active()){
      const c=G.presenceCine,side=G.fighters[0]===f?0:1,ph=c.phase;
      if(ph===1&&side===0)return {kind:'entrance',q:clamp((c.t-.28)/1.12,0,1),intensity:.45,profile:p,t:c.t};
      if(ph===2&&side===0)return {kind:'signature',q:clamp((c.t-1.42)/.92,0,1),intensity:.82,profile:p,t:c.t};
      if(ph===3&&side===1)return {kind:'entrance',q:clamp((c.t-2.34)/1.12,0,1),intensity:.45,profile:p,t:c.t};
      if(ph===4&&side===1)return {kind:'signature',q:clamp((c.t-3.48)/.92,0,1),intensity:.82,profile:p,t:c.t};
      if(ph===5)return {kind:'faceoff',q:0,intensity:.62,profile:p,t:c.t};
      if(ph===6)return {kind:'power',q:clamp((c.t-5.18)/.9,0,1),intensity:.96,profile:p,t:c.t};
      if(ph===7)return {kind:'fight',q:1,intensity:.50,profile:p,t:c.t};
      return {kind:'intro',q:0,intensity:.15,profile:p,t:c.t};
    }
    if(storyActive()){
      const c=G.ch1Cine,ph=c.phase,t=c.t;
      if(id==='gojo'){
        if(ph===1)return {kind:'entrance',q:clamp((t-.95)/3.1,0,1),intensity:.36,profile:PROFILE.gojo,t};
        if(ph===2)return {kind:'signature',q:clamp((t-4.05)/1.9,0,1),intensity:.82,profile:PROFILE.gojo,t};
        if(ph>=6)return {kind:'faceoff',q:0,intensity:.60,profile:PROFILE.gojo,t};
      }
      if(id==='sukuna'){
        if(ph===4)return {kind:'entrance',q:clamp((t-6.85)/3.1,0,1),intensity:.40,profile:PROFILE.sukuna,t};
        if(ph===5)return {kind:'signature',q:clamp((t-9.95)/1.9,0,1),intensity:.88,profile:PROFILE.sukuna,t};
        if(ph>=6)return {kind:'faceoff',q:0,intensity:.65,profile:PROFILE.sukuna,t};
      }
    }
    if(f.presenceAuraFrames>0)return {kind:'tail',q:1,intensity:.20*(f.presenceAuraFrames/TAIL_FRAMES),profile:p,t:(G.frame||0)/60};
    const charged=f.awakened||f.ultCharging||f.domainCharge>0||f.jackpot>0||f.tojiHunt>0||f.infinity>0||(G.domain&&G.domain.owner===f);
    if(charged)return {kind:'charged',q:1,intensity:.12,profile:p,t:(G.frame||0)/60};
    return null;
  }
  function installPoseLayer(){
    if(typeof baseApplyPose!=='function')return;
    window.applyCharacterIdentityPose=function(P,f){
      const result=baseApplyPose(P,f);
      if(!f||!P)return result;
      const info=cinematicInfo(f);
      if(!info){
        if(f.presenceFearFrames>0&&(f.state==='IDLE'||f.state==='WALK')){
          P.lean+=4+Math.sin((G.frame||0)*1.9)*1.6;
          P.armF=[mix(P.armF[0],24,.22),mix(P.armF[1],-54,.22)];
          P.armB=[mix(P.armB[0],42,.16),mix(P.armB[1],-38,.16)];
        }
        return result;
      }
      const id=keyId(f);
      if(info.kind==='signature'){
        const keys=POSE_KEYS[id];const target=sampleKeys(keys,info.q);
        if(target)blendPose(P,target,1);
      }else if(info.kind==='power'){
        blendPose(P,POWER_POSES[id]||POWER_POSES.gojo,.92);
      }else if(info.kind==='faceoff'){
        const poseTarget=POWER_POSES[id]||POWER_POSES.gojo;
        blendPose(P,poseTarget,.48);
      }else if(info.kind==='entrance'){
        const base={
          gojo:pose(-4,[58,27],[106,11]),young_gojo:pose(2,[62,20],[110,16]),
          sukuna:pose(13,[70,35],[117,13]),yuji:pose(7,[63,30],[112,17]),
          yuta:pose(-7,[58,25],[106,14]),hakari:pose(6,[72,29],[118,14]),
          toji:pose(17,[150,-105],[120,14],-54,-109,-93),
          heian_sukuna:pose(11,[73,32],[116,12]),the_strongest_today:pose(-2,[60,24],[106,10])
        }[id];
        if(base)blendPose(P,base,info.q);
      }
      return result;
    };
  }

  function drawPath(points,color,width,alpha){
    if(!points||points.length<2)return;
    ctx.save();ctx.globalAlpha=clamp(alpha,0,1);ctx.strokeStyle=color;ctx.lineWidth=width;
    ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
    ctx.stroke();ctx.restore();
  }
  function drawCracks(x,y,color,intensity,t){
    if(intensity<.2)return;
    ctx.save();ctx.globalAlpha=.36*intensity;ctx.strokeStyle=color;ctx.lineWidth=1.2+intensity;
    for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7+.17*Math.sin(t*4+i),len=18+intensity*32+(i%3)*9;
      const x1=x+Math.cos(a)*8,y1=y+Math.sin(a)*3;
      const x2=x+Math.cos(a+.12)*len*.62,y2=y+Math.sin(a+.12)*len*.48;
      const x3=x+Math.cos(a-.05)*len,y3=y+Math.sin(a-.05)*len*.60;
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.stroke();
    }
    ctx.restore();
  }
  function drawPebbles(x,y,color,intensity,t,mode){
    const count=LOW_END?4:7;
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<count;i++){
      const a=i*2.39996+t*(mode==='float'?.45:.85),r=21+(i%3)*13+intensity*13;
      const rise=mode==='float'?(14+Math.abs(Math.sin(t*1.8+i))*55):(7+Math.abs(Math.sin(t*3+i))*24*intensity);
      const px=x+Math.cos(a)*r,py=y-rise+Math.sin(a)*7;
      ctx.globalAlpha=(.20+.44*intensity)*(0.55+.45*Math.sin(t*2+i));
      ctx.fillStyle=i%3===0?'#d6e0e8':color;ctx.beginPath();
      ctx.moveTo(px-4,py+2);ctx.lineTo(px-1,py-5-(i%2)*2);ctx.lineTo(px+5,py-2);ctx.lineTo(px+2,py+4);ctx.closePath();ctx.fill();
    }
    ctx.restore();
  }
  function drawSpatialRefraction(f,intensity,t){
    if(intensity<.12)return;
    const x=f.x,y=f.y-75,p=profile(f);
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<5;i++){
      const yy=y-50+i*25,offset=Math.sin(t*4+i*1.3)*8*intensity;
      ctx.globalAlpha=.22*intensity;ctx.strokeStyle=i%2?p.hot:p.color;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x-78,yy);ctx.quadraticCurveTo(x+offset,yy-7*intensity,x+76,yy+offset);ctx.stroke();
    }
    for(let i=0;i<3;i++){
      const r=38+i*15+Math.sin(t*3+i)*4;
      ctx.globalAlpha=(.16-i*.035)*intensity;ctx.strokeStyle=p.hot;ctx.lineWidth=1.2;
      ctx.beginPath();ctx.ellipse(x,y,r,r*1.18,t*.08+i*.3,.25+t*.2,4.5+t*.12);ctx.stroke();
    }
    ctx.restore();
  }
  function drawAtmosphereBehind(f,info){
    if(!info||typeof ctx==='undefined')return;
    const p=info.profile,intensity=info.intensity,t=info.t||0,x=f.x,y=f.y,kind=p.kind;
    if(kind==='limitless'||kind==='spatial'){
      drawPebbles(x,GROUND-3,p.color,intensity,t,'float');
      drawSpatialRefraction(f,intensity,t);
      if(info.kind==='power'||info.kind==='signature')drawCracks(x,GROUND-2,p.color,intensity*.55,t);
    }else if(kind==='slaughter'||kind==='calamity'){
      drawCracks(x,GROUND-1,p.color,intensity,t);
      drawPebbles(x,GROUND-3,'#641021',intensity,t,'burst');
      ctx.save();ctx.globalCompositeOperation='lighter';
      const n=kind==='calamity'?5:3;
      for(let i=0;i<n;i++){
        const yy=y-28+i*17,shift=Math.sin(t*9+i)*7;
        ctx.globalAlpha=(.18+.30*Math.abs(Math.sin(t*2+i)))*intensity;
        ctx.strokeStyle=i%2?p.hot:p.color;ctx.lineWidth=i===0?2.4:1.2;
        drawPath([[x-46+shift,yy+12],[x+14-shift,yy-8],[x+40+shift,yy-19]],ctx.strokeStyle,ctx.lineWidth,ctx.globalAlpha);
      }
      ctx.restore();
    }else if(kind==='assassin'){
      if(info.kind==='signature'||info.kind==='power'||info.kind==='faceoff')drawCracks(x,GROUND-1,'#adbcc5',intensity*.35,t);
      drawPebbles(x,GROUND-2,'#a9b8c3',intensity*.35,t,'burst');
    }else if(kind==='rika'){
      drawPebbles(x,GROUND-2,p.color,intensity*.42,t,'float');
    }else if(kind==='jackpot'){
      drawPebbles(x,GROUND-2,p.color,intensity*.28,t,'float');
    }else if(kind==='impact'){
      if(info.kind==='signature'||info.kind==='power')drawCracks(x,GROUND-2,p.color,intensity*.5,t);
    }
  }
  function drawCoin(f,q,t){
    const dir=f.facing||1,flight=clamp((q-.16)/.62,0,1),visible=q>.10&&q<.91;
    if(!visible)return;
    const x=f.x+dir*(22+Math.sin(flight*Math.PI)*62),y=f.y-65-Math.sin(flight*Math.PI)*128;
    const rot=flight*Math.PI*16+t*2;
    ctx.save();ctx.translate(x,y);ctx.rotate(rot);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.85;
    ctx.fillStyle='#ffd166';ctx.strokeStyle='#fff3bf';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(0,0,2.6+Math.abs(Math.cos(rot))*6,7.5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    if(Math.abs(Math.cos(rot))>.42){ctx.globalAlpha=.9;ctx.fillStyle='#8d5b15';ctx.font='900 8px system-ui';ctx.textAlign='center';ctx.fillText('¥',0,3);}
    ctx.restore();
    if(q>.72&&q<.89){
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(q-.72)*3;
      ctx.strokeStyle='#fff2b6';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(f.x+dir*18,f.y-68,8+(q-.72)*75,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
  }
  function drawKatana(f,q,t,steel){
    if(q<.17)return;
    const dir=f.facing||1,draw=clamp((q-.17)/.38,0,1),slash=clamp((q-.52)/.28,0,1);
    const bx=f.x+dir*(8+draw*9),by=f.y-55-draw*17;
    const ex=bx+dir*(25+draw*48),ey=by-(draw*42+7);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    ctx.globalAlpha=.78;ctx.strokeStyle=steel;ctx.lineWidth=3.8;
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.globalAlpha=.95;ctx.strokeStyle='#f8ffff';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(bx+dir*2,by-1);ctx.lineTo(ex-dir*2,ey+1);ctx.stroke();
    ctx.globalAlpha=.85;ctx.strokeStyle=steel;ctx.lineWidth=4.5;
    ctx.beginPath();ctx.moveTo(bx-dir*7,by+5);ctx.lineTo(bx+dir*5,by-6);ctx.stroke();
    if(slash>0){
      const a0=dir>0?-.20:Math.PI-.20,a1=dir>0?1.25:Math.PI+1.25;
      ctx.globalAlpha=.15+.64*Math.sin(slash*Math.PI);
      ctx.strokeStyle='#f4f9ff';ctx.lineWidth=2.6+slash*1.8;
      ctx.beginPath();ctx.ellipse(f.x+dir*22,f.y-82,35+slash*84,24+slash*58,dir*.2,a0,a1);ctx.stroke();
      ctx.globalAlpha=.65*(1-slash*.4);ctx.strokeStyle=steel;ctx.lineWidth=2.2;
      ctx.beginPath();ctx.moveTo(f.x-dir*8,f.y-45);ctx.quadraticCurveTo(f.x+dir*52,f.y-108,f.x+dir*(105+slash*30),f.y-126+slash*24);ctx.stroke();
      if(slash>.42){
        for(let i=0;i<3;i++){const yy=f.y-104+i*12;drawPath([[f.x+dir*(12+i*7),yy+10],[f.x+dir*(42+i*8),yy-10]],'#fff',1.2,(1-slash*.4)*.75);}
      }
    }
    ctx.restore();
  }
  function drawSignatureForeground(f,info){
    if(!info||typeof ctx==='undefined')return;
    const id=keyId(f),p=profile(f),q=info.q||0,t=info.t||0,dir=f.facing||1;
    if(info.kind==='signature'&&p.kind==='jackpot')drawCoin(f,q,t);
    if(info.kind==='signature'&&p.kind==='rika')drawKatana(f,q,t,'#d8c6ff');
    if(info.kind==='signature'&&p.kind==='assassin')drawKatana(f,q,t,'#d4e0e5');
    if(p.kind==='limitless'&&(info.kind==='signature'||info.kind==='power')){
      const q2=info.kind==='signature'?q:info.q||0;
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35+.45*Math.sin(t*4)*.5;
      ctx.strokeStyle=p.hot;ctx.lineWidth=1.6;
      const hx=f.x+dir*22,hy=f.y-126;
      ctx.beginPath();ctx.arc(hx,hy,7+q2*17,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(hx-dir*4,hy);ctx.lineTo(hx+dir*4,hy);ctx.moveTo(hx,hy-6);ctx.lineTo(hx,hy+6);ctx.stroke();
      ctx.restore();
    }else if(p.kind==='sixeyes'&&(info.kind==='signature'||info.kind==='power')){
      const q2=info.q||0;ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.2+.65*Math.sin(Math.PI*q2);ctx.strokeStyle=p.hot;ctx.lineWidth=2;
      ctx.beginPath();ctx.ellipse(f.x+dir*2,f.y-111,16+q2*26,5+q2*5,0,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.9;ctx.fillStyle='#e8ffff';ctx.beginPath();ctx.arc(f.x+dir*6,f.y-111,2.2+q2*2,0,Math.PI*2);ctx.fill();ctx.restore();
    }else if((p.kind==='slaughter'||p.kind==='calamity')&&(info.kind==='signature'||info.kind==='power')){
      const n=p.kind==='calamity'?5:3;
      ctx.save();ctx.globalCompositeOperation='lighter';
      for(let i=0;i<n;i++){
        const progress=clamp((q-.30+i*.035)/.5,0,1),yy=f.y-45-i*17;
        ctx.globalAlpha=(.16+.5*Math.sin(progress*Math.PI))*info.intensity;
        ctx.strokeStyle=i%2?p.hot:p.color;ctx.lineWidth=1.8+(i===0?1:0);
        ctx.beginPath();ctx.moveTo(f.x-dir*(28+i*5),yy+13);ctx.lineTo(f.x+dir*(62+progress*34),yy-20);ctx.stroke();
      }
      ctx.restore();
    }else if(p.kind==='impact'&&(info.kind==='signature'||info.kind==='power')){
      const q2=info.q||0;ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.6*Math.sin(Math.PI*clamp((q2-.34)/.42,0,1));ctx.strokeStyle=p.hot;ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(f.x+dir*40,f.y-73,12+q2*50,-.8,1.2);ctx.stroke();
      ctx.restore();
    }else if(p.kind==='spatial'&&(info.kind==='signature'||info.kind==='power')){
      const q2=info.q||0;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55;
      ctx.strokeStyle=p.hot;ctx.lineWidth=1.5;ctx.beginPath();
      ctx.arc(f.x+dir*48,f.y-91,12+q2*56,.3+t*.1,4.8+t*.1);ctx.stroke();
      ctx.restore();
    }else if(p.kind==='calamity'&&info.kind==='signature'){
      // Extra slash traces imply multiple simultaneous arm lines without covering the character.
      ctx.save();ctx.globalCompositeOperation='lighter';
      for(let i=0;i<4;i++){ctx.globalAlpha=.25+.22*Math.sin(t*8+i);drawPath([[f.x-dir*16,f.y-55-i*10],[f.x+dir*(28+i*7),f.y-82+i*8]],p.hot,2,ctx.globalAlpha);}
      ctx.restore();
    }
  }
  function drawSignatureLabel(f,info){
    if(info.kind!=='signature'||info.q<.08||info.q>.92)return;
    const p=info.profile;
    ctx.save();ctx.globalAlpha=.72*(Math.sin(info.q*Math.PI)*.5+.5);
    ctx.font='800 9px Consolas,monospace';ctx.textAlign='center';ctx.fillStyle=p.hot;
    ctx.fillText(p.action,f.x,f.y-176);ctx.restore();
  }
  function drawStoryClash(){
    if(!storyActive()||G.ch1Cine.phase<6||!G.fighters||G.fighters.length<2)return;
    const s=G.ch1Cine,a=G.fighters[0],b=G.fighters[1],x=(a.x+b.x)/2,y=GROUND-92;
    const pulse=.22+.23*(.5+.5*Math.sin(s.t*29));
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=pulse;
    drawPath([[a.x+55,y+Math.sin(s.t*21)*5],[x-8,y-13]],PROFILE.gojo.color,2,.65);
    drawPath([[b.x-55,y-Math.sin(s.t*21)*5],[x+8,y+13]],PROFILE.sukuna.color,2,.65);
    ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-10,y-16);ctx.lineTo(x+10,y+16);ctx.moveTo(x+10,y-16);ctx.lineTo(x-10,y+16);ctx.stroke();ctx.restore();
  }
  function drawCineWorldInfo(f){
    const info=cinematicInfo(f);if(!info)return;
    const now=info.t||0;
    drawAtmosphereBehind(f,info);
    // The presence geometry sits behind the silhouette rather than tinting the whole screen.
    if(info.profile.kind==='limitless'||info.profile.kind==='spatial')drawSpatialRefraction(f,info.intensity*.78,now);
    if(info.kind==='signature'||info.kind==='power'||info.kind==='faceoff')drawGroundCracks(f.x,GROUND-2,info.profile.color,info.intensity,now);
    return info;
  }

  // Story Chapter 1 remains on its existing timeline; it receives the same actor FX, not a second intro.
  function getStoryPoseName(f){
    if(!storyActive())return null;
    const id=keyId(f),phase=storyPhase();
    if((id==='gojo'&&(phase===1||phase===2))||(id==='sukuna'&&(phase===4||phase===5)))return 'signature';
    if(phase>=6&&(id==='gojo'||id==='sukuna'))return 'faceoff';
    return null;
  }
  function getInfoForFighter(f){
    const info=cinematicInfo(f);if(info)return info;
    const name=getStoryPoseName(f);
    if(name){
      const p=profile(f),phase=storyPhase(),t=storyT();
      let q=0,intensity=.35;
      if(p.kind==='limitless'){q=phase===2?clamp((t-4.05)/1.9,0,1):clamp((t-.95)/3.1,0,1);intensity=phase===2?.82:.38;}
      if(p.kind==='slaughter'){q=phase===5?clamp((t-9.95)/1.9,0,1):clamp((t-6.85)/3.1,0,1);intensity=phase===5?.88:.42;}
      return {kind:name,q,intensity,profile:p,t};
    }
    return null;
  }
  function drawFearHud(){
    const fx=G.presenceFx;if(!fx)return;
    const q=clamp((fx.expiresAt-(G.frame||0))/FEAR_FRAMES,0,1);
    if(q<=0)return;
    ctx.save();ctx.globalAlpha=.5*q;ctx.strokeStyle=fx.profile.color;ctx.lineWidth=1.2;
    const y=34+Math.sin((G.frame||0)*2.4)*2;
    ctx.beginPath();ctx.moveTo(32,y);ctx.lineTo(498,y+1);ctx.moveTo(W-498,y-1);ctx.lineTo(W-32,y+2);ctx.stroke();
    ctx.globalAlpha=.22*q;ctx.fillStyle=fx.profile.color;ctx.fillRect(0,28,W,2);ctx.fillRect(0,70,W,1);ctx.restore();
  }
  function drawCineOverlay(){
    const c=G.presenceCine;if(!c||!c.active)return;
    const t=c.t,phase=c.phase,a=G.fighters[0],b=G.fighters[1],pa=profile(a),pb=profile(b);
    ctx.save();const bar=40+Math.min(17,Math.max(0,(t-4.8)*25));
    ctx.fillStyle='#03050a';ctx.fillRect(0,0,W,bar);ctx.fillRect(0,H-bar,W,bar);
    ctx.textAlign='center';
    if(phase===0){
      ctx.globalAlpha=.75;ctx.fillStyle='#c4d0e1';ctx.font='800 10px Consolas,monospace';ctx.fillText('CURSED ENERGY // FIELD RESPONSE',W/2,H-bar-20);
    }else if(phase===1||phase===2){
      ctx.globalAlpha=.96;ctx.fillStyle=pa.hot;ctx.font='900 18px system-ui';ctx.fillText(pa.title,W/2,bar+27);
      if(phase===2){ctx.globalAlpha=.78;ctx.fillStyle='#e6edf5';ctx.font='800 10px Consolas,monospace';ctx.fillText(pa.action,W/2,H-bar-19);}
    }else if(phase===3||phase===4){
      ctx.globalAlpha=.96;ctx.fillStyle=pb.hot;ctx.font='900 18px system-ui';ctx.fillText(pb.title,W/2,bar+27);
      if(phase===4){ctx.globalAlpha=.78;ctx.fillStyle='#e6edf5';ctx.font='800 10px Consolas,monospace';ctx.fillText(pb.action,W/2,H-bar-19);}
    }else if(phase===5||phase===6){
      ctx.globalAlpha=.92;ctx.fillStyle='#f5f7ff';ctx.font='900 13px system-ui';ctx.fillText(pa.title+'  VS  '+pb.title,W/2,bar+25);
      ctx.globalAlpha=.70;ctx.fillStyle='#d4dfec';ctx.font='800 9px Consolas,monospace';ctx.fillText(phase===6?'PRESSURE // CONTACT':'THE SPACE BETWEEN THEM CRACKS',W/2,H-bar-19);
    }else{
      const pulse=.86+.14*Math.sin(t*27);
      ctx.globalAlpha=pulse;ctx.fillStyle='#fff';ctx.strokeStyle='#101621';ctx.lineWidth=5;
      ctx.font='900 62px Impact,system-ui,sans-serif';ctx.strokeText('FIGHT!',W/2,H/2+20);ctx.fillText('FIGHT!',W/2,H/2+20);
      ctx.globalAlpha=.78;ctx.fillStyle='#d3dce9';ctx.font='800 10px Consolas,monospace';ctx.fillText('CURSED CLASH // BEGIN',W/2,H/2+49);
    }
    ctx.restore();
  }

  // High-impact grading only runs for a brief pressure spike. Low-end devices use a
  // half-resolution source to cap bandwidth; during normal play there is no frame copy.
  const post=document.createElement('canvas');
  post.width=LOW_END?640:W;post.height=LOW_END?360:H;
  const postCtx=post.getContext('2d',{alpha:false,desynchronized:true});
  function postFxStrength(){
    if(active()){
      const c=G.presenceCine;
      if(c.phase===6)return .72;
      if(c.phase===5)return .22;
      return 0;
    }
    if(storyActive()){
      const ph=storyPhase();
      if(ph===6)return .34;
      if(ph===7)return .58;
    }
    const fx=G.presenceFx;
    if(fx)return clamp((fx.expiresAt-(G.frame||0))/FEAR_FRAMES,0,1)*.58;
    return 0;
  }
  function drawPostFx(){
    if(G.mode==='menu'||typeof ctx==='undefined')return;
    const strength=postFxStrength();if(strength<=.025)return;
    const canvas=document.getElementById('cv');
    ctx.save();ctx.setTransform(1,0,0,1,0,0);
    if(postCtx&&canvas){
      try{
        postCtx.setTransform(1,0,0,1,0,0);postCtx.clearRect(0,0,post.width,post.height);
        postCtx.drawImage(canvas,0,0,post.width,post.height);
        ctx.globalAlpha=1;ctx.filter='saturate('+(1-strength*.84)+') contrast('+(1+strength*.18)+')';
        ctx.drawImage(post,0,0,W,H);ctx.filter='none';
        if(strength>.42){
          ctx.globalAlpha=.045*strength;ctx.filter='saturate(1.7) hue-rotate(170deg)';
          ctx.drawImage(post,2,0,W,H);ctx.filter='none';
          ctx.globalAlpha=.035*strength;ctx.filter='saturate(1.8) hue-rotate(310deg)';
          ctx.drawImage(post,-2,0,W,H);ctx.filter='none';
        }
      }catch(_){ctx.filter='none';}
    }
    // Vignette narrows perception. It does not recolor the whole screen.
    const fx=G.presenceFx;let focusX=W*.5,focusY=H*.46;
    if(active()&&G.presenceCine){const c=G.presenceCine,owner=c.phase===3||c.phase===4?G.fighters[1]:G.fighters[0];focusX=W*.5+((owner.x-cam.x)*cam.zoom);focusY=H*.5+((owner.y-cam.y)*cam.zoom);}
    else if(fx&&fx.source){focusX=W*.5+((fx.source.x-cam.x)*cam.zoom);focusY=H*.5+((fx.source.y-cam.y)*cam.zoom);}
    const vg=ctx.createRadialGradient(focusX,focusY,90,focusX,focusY,Math.max(W,H)*.76);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(.55,'rgba(0,0,0,'+(strength*.13)+')');vg.addColorStop(1,'rgba(0,0,0,'+(strength*.70)+')');
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    // Small horizontal refractive bands and a light UI jitter at the climax.
    ctx.globalAlpha=.08*strength;ctx.fillStyle='#d8f9ff';
    for(let i=0;i<4;i++){const y=((G.frame||0)*7+i*151)%H;ctx.fillRect(0,y,W,1.5);}
    if(strength>.45)drawFearHud();
    ctx.restore();
  }

  function triggerFear(source,target,domainToken){
    if(!source||!target||Math.abs(source.x-target.x)>330)return false;
    target.presenceFearFrames=Math.max(target.presenceFearFrames||0,FEAR_FRAMES);
    G.presenceFx={source,target,profile:profile(source),expiresAt:(G.frame||0)+FEAR_FRAMES};
    G.hitstop=Math.max(G.hitstop||0,3);
    try{if(typeof SFX!=='undefined'){SFX.tone(48,.28,'sine',.07,31);SFX.noise(.12,.018,130,.9);}}catch(_){}
    rumbleController();
    return true;
  }
  function installGameplayPressure(){
    if(typeof baseUpdateFighter!=='function')return;
    window.updateFighter=function(f,inp){
      if(f&&f.opp&&G.mode!=='menu'&&G.mode!=='training'&&G.roundState==='fight'){
        const enemy=f.opp,near=Math.abs(enemy.x-f.x)<=330;
        const dominant=['slaughter','calamity','limitless','spatial'].includes(profile(enemy).kind);
        if(near&&dominant&&enemy.awakenGlow>0&&!enemy.presenceAwakenThreatFired){
          if(triggerFear(enemy,f)){enemy.presenceAwakenThreatFired=true;}
        }
        const domain=G.domain&&G.domain.owner===enemy?G.domain:null;
        if(near&&dominant&&domain&&enemy.presenceDomainToken!==domain){
          if(triggerFear(enemy,f,domain))enemy.presenceDomainToken=domain;
        }
      }
      let useInput=inp;
      if(f&&f.presenceFearFrames>0){
        f.presenceFearFrames--;
        if(inp&&(f.state==='IDLE'||f.state==='WALK'||f.state==='CROUCH')){
          useInput=Object.assign({},inp,{left:(inp.left||0)*.64,right:(inp.right||0)*.64});
        }
      }
      return baseUpdateFighter.call(this,f,useInput);
    };
  }

  window.resetRound=function(){
    baseResetRound.apply(this,arguments);
    G.startupCine=null;G.presenceCine=null;G.presenceFx=null;
    if(G.fighters)for(const f of G.fighters){
      f.presenceAwakenThreatFired=false;f.presenceDomainToken=null;f.presenceFearFrames=0;
    }
    if(storyActive()||G.storyCutscene||(G.story&&G.story.cutscene))return;
    begin();
  };
  window.step=function(){
    if(active()){tick();return;}
    baseStep.apply(this,arguments);
    if(G.fighters)for(const f of G.fighters)if(f.presenceAuraFrames>0)f.presenceAuraFrames--;
    if(G.presenceFx&&(G.frame||0)>=G.presenceFx.expiresAt)G.presenceFx=null;
  };
  window.drawFighter=function(f){
    const info=f?getInfoForFighter(f):null;
    if(f&&info)drawAtmosphereBehind(f,info);
    baseDrawFighter.apply(this,arguments);
    if(f&&info){drawSignatureForeground(f,info);drawSignatureLabel(f,info);}
  };
  window.render=function(){
    baseRender.apply(this,arguments);
    if(active())drawCineOverlay();
    if(storyActive())drawStoryClash();
    drawPostFx();
  };
  if(typeof baseMenuKey==='function'){
    window.MenuKey=function(code){if(active())return;baseMenuKey.apply(this,arguments);};
  }
  installPoseLayer();installGameplayPressure();

  window.JFF_CHARACTER_PRESENCE_V3={
    version:'3.0',profiles:Object.keys(PROFILE),duration:DURATION,lowEnd:LOW_END,
    get active(){return active();},get time(){return G.presenceCine?G.presenceCine.t:0;}
  };
  console.info('[JFF Presence V3] Character actions, environmental reaction and pressure system ready.');
})();