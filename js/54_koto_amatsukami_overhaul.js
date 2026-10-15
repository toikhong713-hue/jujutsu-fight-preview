/* KOTOAMATSUKAMI OVERHAUL v1
   Edo Itachi's S2 becomes a full genjutsu cast: brief startup, time-freeze, control inversion,
   forced whiff, long action lock, restrained screen distortion and a local HUD blackout.
   SVG-only effects are intentionally capped for low-end hardware. */
(function(){
  'use strict';
  if(window.__JFF_KOTO_BRAINWASH_V1__)return;
  if(typeof CHARS==='undefined'||!CHARS.edo_itachi||!window.JFF_EDO_ITACHI)return;
  window.__JFF_KOTO_BRAINWASH_V1__=true;
  const EDO=CHARS.edo_itachi, MOVE=EDO.moves.s2;
  Object.assign(MOVE,{name:'Kotoamatsukami: Absolute Brainwash',startup:18,active:132,recovery:18,damage:0,cost:40,cd:2700,meter:0,aura:'itachiKotoamatsukami'});
  if(typeof G!=='undefined'&&Array.isArray(G.fighters))for(const f of G.fighters)if(f&&f.itachiEdo)f.moves=EDO.moves;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const fx=(type,x,y,d,data)=>{if(typeof window.JFF_OUTSIDER_FX==='function')window.JFF_OUTSIDER_FX(type,x,y,d||24,data||{});};
  const wrap=document.getElementById('wrap');
  let layer=null;
  if(wrap){
    layer=document.createElementNS('http://www.w3.org/2000/svg','svg');
    layer.setAttribute('id','jffKotoMindLayer');layer.setAttribute('viewBox','0 0 1280 720');
    layer.setAttribute('preserveAspectRatio','none');
    layer.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:8;pointer-events:none;overflow:hidden;display:none';
    wrap.appendChild(layer);
  }
  function screenPoint(x,y){
    const z=(typeof cam!=='undefined'&&Number.isFinite(cam.zoom))?cam.zoom:1;
    const cx=(typeof cam!=='undefined'&&Number.isFinite(cam.x))?cam.x:640;
    const cy=(typeof cam!=='undefined'&&Number.isFinite(cam.y))?cam.y:360;
    return {x:640+(((G&&G.shakeX)||0))+((x-cx)*z),y:360+(((G&&G.shakeY)||0))+((y-cy)*z),s:z};
  }
  function eyeGlyph(cx,cy,r,rot,opacity){
    const blades=Array.from({length:4},(_,i)=>'<path transform="rotate('+(i*90+rot)+')" d="M 0 -'+(r*.97)+' C '+(r*.7)+' -'+(r*.82)+' '+(r*.76)+' -'+(r*.18)+' 0 '+(r*.28)+' C -'+(r*.76)+' -'+(r*.18)+' -'+(r*.7)+' -'+(r*.82)+' 0 -'+(r*.97)+' Z" fill="#b9104c" stroke="#ffe3f2" stroke-width="'+Math.max(.7,r*.055)+'"/>').join('');
    return '<g transform="translate('+cx+' '+cy+')" opacity="'+opacity+'"><circle r="'+(r*1.55)+'" fill="#16020f" fill-opacity=".78" stroke="#ffeafa" stroke-width="'+Math.max(1,r*.06)+'"/><circle r="'+(r*1.23)+'" fill="#650526" stroke="#ec2d70" stroke-width="'+Math.max(1,r*.06)+'"/>'+blades+'<circle r="'+(r*.2)+'" fill="#fff3fb"/><circle r="'+(r*.08)+'" fill="#07030b"/></g>';
  }
  function echoGlyph(p,face,opacity,shift){
    return '<g transform="translate('+(p.x+(shift||0))+' '+p.y+') scale('+(p.s*(face||1))+' '+p.s+') " opacity="'+opacity+'"><path d="M -23 -105 Q -37 -98 -40 -65 L -51 -12 L -26 -4 L 0 -15 L 25 -4 L 47 -13 L 33 -73 Q 30 -103 13 -106 Z" fill="#13040d" stroke="#f3297a" stroke-width="2.2" stroke-dasharray="4 5"/><ellipse cy="-126" rx="22" ry="26" fill="#10030c" stroke="#f5e6ff" stroke-width="1.5"/><path d="M -23 -130 L -25 -153 L -13 -146 L -4 -163 L 7 -146 L 21 -157 L 22 -129 Z" fill="#05040a" stroke="#7d1546" stroke-width="1"/><path d="M -14 -123 L -4 -120 M 5 -120 L 15 -123" stroke="#ff4d8f" stroke-width="2"/></g>';
  }
  function overlay(){
    if(!layer||typeof G==='undefined'||G.mode==='menu'||!Array.isArray(G.fighters)){if(layer){layer.innerHTML='';layer.style.display='none';}return;}
    const now=Number(G.frame)||0,fighters=G.fighters;
    const victim=fighters.find(f=>f&&f.itachiKotoUntil>now);
    const caster=fighters.find(f=>f&&f.itachiKotoCastUntil>now);
    const active=!!(victim||caster);layer.style.display=active?'block':'none';
    if(!active){layer.innerHTML='';setHudObscured(null);return;}
    let svg='';
    if(victim){
      const p=screenPoint(victim.x,victim.y-108),age=Math.max(0,now-(victim.itachiKotoStart||now));
      const pulse=.12+Math.sin(now*.2)*.025;
      svg+='<g><rect width="1280" height="720" fill="#260418" opacity=".075"/><path d="M 0 0 L 1280 0 L 1280 100 Q 960 154 640 92 T 0 110 Z" fill="#c31464" opacity=".065"/><path d="M 0 620 Q 300 555 640 632 T 1280 605 L 1280 720 L 0 720 Z" fill="#a61158" opacity=".075"/>';
      svg+=eyeGlyph(640,360,118,now*1.25,.12);
      svg+='<g transform="translate('+p.x+' '+p.y+')"><ellipse rx="'+(73+Math.sin(now*.18)*6)+'" ry="96" fill="none" stroke="#ff4f9e" stroke-width="2.4" stroke-dasharray="7 11" opacity=".8"/><ellipse rx="53" ry="70" fill="none" stroke="#d29cff" stroke-width="1.7" opacity=".7"/>'+eyeGlyph(0,0,56,now*2.3,.78)+'<path d="M -92 -35 L -63 -43 L -79 -18 M 93 32 L 65 26 L 82 10 M -42 90 L -25 70 M 32 -90 L 18 -70" stroke="#fff0fb" stroke-width="2" fill="none" opacity=".75"/></g>';
      // Lightweight crow silhouettes, not hundreds of DOM particles.
      for(let i=0;i<8;i++){
        const a=now*.09+i*2.399,rr=28+(i%3)*16,px=p.x+Math.cos(a)*rr,py=p.y-5+Math.sin(a)*rr*.64;
        svg+='<path transform="translate('+px+' '+py+') rotate('+(a*57.3)+')" d="M -8 0 Q -3 -6 1 -2 L 5 -8 L 7 -1 L 13 -3 L 7 3 L 10 7 L 1 4 L -4 8 L -4 3 Z" fill="#08040e" stroke="#a51a5c" stroke-width=".8" opacity=".8"/>';
      }
      const remain=Math.max(0,victim.itachiKotoUntil-now);
      svg+='<text x="640" y="82" text-anchor="middle" fill="#ffe9f7" font-family="monospace" font-size="14" letter-spacing="5" opacity="'+(.45+Math.sin(now*.35)*.12)+'">KOTOAMATSUKAMI · ABSOLUTE BRAINWASH</text>';
      svg+='<text x="640" y="103" text-anchor="middle" fill="#f7cce8" font-family="monospace" font-size="10" letter-spacing="3" opacity=".65">'+(victim.itachiKotoForcedMove&&!victim.itachiKotoLockApplied?'ACTION OVERRIDE':'CONTROL SEALED')+' · '+(remain/60).toFixed(1)+'s</text></g>';
    }
    if(caster){
      const p=screenPoint(caster.x+(caster.facing||1)*32,caster.y-132);
      svg+='<g>'+eyeGlyph(p.x,p.y,22,now*6,.92)+'<ellipse cx="'+p.x+'" cy="'+p.y+'" rx="41" ry="41" fill="none" stroke="#ef3d91" stroke-width="1.5" stroke-dasharray="4 7" opacity=".65"/></g>';
    }
    layer.innerHTML=svg;setHudObscured(victim);
  }
  function setHudObscured(victim){
    const hud=document.getElementById('jffFightingHud');if(!hud)return;
    for(let i=0;i<2;i++){
      const f=G&&G.fighters&&G.fighters[i],hide=!!(victim&&f===victim);
      const elements=[hud.querySelector('.hud-top[data-player="'+i+'"]'),hud.querySelector('.hud-deck[data-deck="'+i+'"]')];
      for(const el of elements)if(el){el.style.opacity=hide?'.035':'';el.style.filter=hide?'blur(3px) grayscale(1)':'';}
    }
  }
  const previousUpdateMove=window.updateMove;
  if(typeof previousUpdateMove==='function')window.updateMove=function(f){
    if(f&&f.itachiEdo&&f.moveKey==='s2'&&f.move&&!(window.JFF_ITACHI_REBOOT&&window.JFF_ITACHI_REBOOT.cinema)){
      const n=(f.moveFrame||0)+1;f.moveFrame=n;f.itachiPoseKey='s2';const d=f.facing||1;
      if(n===1){f.itachiKotoTarget=null;f.itachiKotoCastSuccess=false;f.itachiKotoCastStart=0;f.itachiKotoCastUntil=0;f.vx=0;fx('crows',f.x-d*14,f.y-90,24);fx('kotoWave',f.x,f.y-116,42,{phase:'startup'});}
      if(n===6||n===12){fx('kotoEye',f.x+d*20,f.y-126,26,{spin:n*19,scale:n===12?1.3:1});fx('crows',f.x-d*18,f.y-86,18);}
      if(n===18){f.itachiKotoCastSuccess=launchKoto(f);f.itachiKotoCastStart=G.frame||0;}
      if([24,32,40,48,58].includes(n)&&f.itachiKotoTarget){
        const t=f.itachiKotoTarget;
        fx('crows',t.x+((n%16)?-22:22),t.y-54,22);
      }
      if(n===72||n===88)fx('kotoWave',f.x+d*72,f.y-118,32,{phase:'recovery'});
      if(n>=88){f.itachiEdoCounterUntil=0;f.itachiKotoTarget=null;if(typeof window.endMove==='function')window.endMove(f);else{f.move=null;f.moveKey=null;f.moveFrame=0;f.state=f.onGround?'IDLE':'FALL';f.stateFrame=0;}}
      return;
    }
    return previousUpdateMove.apply(this,arguments);
  };
  function blankInput(inp){
    const o=Object.assign({left:0,right:0,up:0,down:0,light:0,heavy:0,s1:0,s2:0,s3:0,s4:0,s5:0,block:0,blockPress:0,guardCancel:0,ult:0,ultHeld:0,def:0,wcs:0,awaken:0,form:0,copy:0,special1:0,special2:0,soru:0},inp||{});
    for(const k of Object.keys(o))o[k]=0;return o;
  }
  function reverseInput(inp){
    const i=Object.assign({left:0,right:0,up:0,down:0,light:0,heavy:0,s1:0,s2:0,s3:0,s4:0,s5:0,special1:0,special2:0},inp||{}),o=blankInput(i);
    o.left=i.right;o.right=i.left;o.up=i.down;o.down=i.up;
    o.light=i.heavy;o.heavy=i.s1;o.s1=i.s2;o.s2=i.s3;o.s3=i.s4;o.s4=i.s5;o.s5=i.light;
    o.special1=i.special2;o.special2=i.special1;return o;
  }
  function clearVictim(f){
    if(!f)return;const was=!!f.itachiKotoUntil;
    f.itachiKotoUntil=0;f.itachiKotoStart=0;f.itachiKotoOwner=null;f.itachiKotoForcedMove=false;f.itachiKotoForcedKey='';f.itachiKotoLockApplied=false;
    if(was&&f.state==='IMMOBILIZED'){f.immobilize=0;f.hitstun=0;f.blockstun=0;f.state=f.onGround?'IDLE':'FALL';f.stateFrame=0;f.vx=0;}
  }
  function launchKoto(f){
    const target=f.opp,now=G.frame||0;
    f.itachiKotoCastUntil=now+120;f.itachiKotoTarget=null;f.itachiKotoCastSuccess=false;
    // 1.5 seconds of post-cast phasing. Invulnerability counts combat frames, not cinematic freeze frames.
    f.invuln=Math.max(f.invuln||0,90);f.itachiKotoGhostUntil=now+120;
    fx('kotoEye',f.x+(f.facing||1)*24,f.y-129,48,{spin:0,scale:1.45});fx('kotoWave',f.x,f.y-112,60,{phase:'release'});
    if(typeof SFX!=='undefined'&&SFX.copy)SFX.copy();
    if(typeof cam!=='undefined'){cam.cine=Math.max(cam.cine||0,.78);cam.cineX=f.x;cam.cineY=f.y-105;cam.cineZoom=1.42;}
    G.hitstop=Math.max(G.hitstop||0,30);G.flash=Math.max(G.flash||0,.62);G.flashColor='#f6eaff';G.camPunch=Math.max(G.camPunch||0,.23);G.zoomPunch=Math.max(G.zoomPunch||0,.06);
    if(typeof window.shake==='function')window.shake(12);
    const inRange=target&&Math.abs(target.x-f.x)<=1450&&Math.abs(target.y-f.y)<=280;
    if(!inRange||target.hp<=0){if(typeof window.floatText==='function')window.floatText(f.x,f.y-200,'KOTOAMATSUKAMI · NO TARGET','#b9c7ef',17,48);return false;}
    const duration=G.mode==='versus'?180:300;
    target.itachiKotoStart=now+30;target.itachiKotoUntil=now+duration+30;target.itachiKotoOwner=f;
    target.itachiKotoForcedMove=false;target.itachiKotoForcedKey='';target.itachiKotoLockApplied=false;
    target.move=null;target.moveKey=null;target.moveFrame=0;target.hasHit=false;target.hitstun=0;target.blockstun=0;target.immobilize=0;target.blocking=false;
    target.grabTarget=null;target.grabber=null;target.vx=0;target.vy=0;target.state='IDLE';target.stateFrame=0;
    target.facing=Math.sign(target.x-f.x)||(f.facing?-f.facing:1);f.itachiKotoTarget=target;f.itachiKotoCastSuccess=true;
    fx('kotoWave',target.x,target.y-106,80,{phase:'brainwash'});fx('kotoEye',target.x,target.y-125,60,{spin:14,scale:1.85});
    fx('crows',target.x,target.y-83,36);fx('crows',target.x+34,target.y-113,30);
    if(typeof window.floatText==='function')window.floatText(target.x,target.y-205,'KOTOAMATSUKAMI','#e4e9ff',23,72);
    return true;
  }
  function forceWhiff(victim){
    const owner=victim.itachiKotoOwner;
    victim.move=null;victim.moveKey=null;victim.moveFrame=0;victim.hasHit=false;victim.hitstun=0;victim.blockstun=0;victim.immobilize=0;victim.blocking=false;
    victim.state='IDLE';victim.stateFrame=0;victim.vx=0;victim.vy=0;
    if(owner)victim.facing=Math.sign(victim.x-owner.x)||(owner.facing?-owner.facing:1);
    // Only directional melee attacks are safe to force-whiff. Target-seeking
    // techniques such as Amaterasu can automatically seek victim.opp (the Koto caster).
    const candidates=['heavy','light'];
    let picked='';
    for(const key of candidates){
      const m=victim.moves&&victim.moves[key];
      if(!m||(victim.cd&&victim.cd[key]>0)||(victim.energy||0)<(m.cost||0)||m.domain)continue;
      picked=key;break;
    }
    const ok=!!(picked&&typeof window.startMove==='function'&&window.startMove(victim,picked,false));
    victim.itachiKotoForcedMove=true;victim.itachiKotoForcedKey=ok?picked:'';victim.itachiKotoLockApplied=false;victim.hasHit=false;
    if(!ok){victim.move=null;victim.moveKey=null;victim.state='IDLE';}
    fx('kotoWave',victim.x,victim.y-106,32,{phase:'override'});fx('crows',victim.x+(victim.facing||1)*22,victim.y-48,26);
    if(typeof window.floatText==='function')window.floatText(victim.x,victim.y-170,ok?'BRAINWASH · ACTION OVERRIDE':'BRAINWASH · LOCKED','#dfe6ff',14,48);
  }
  const previousUpdateFighter=window.updateFighter;
  if(typeof previousUpdateFighter==='function')window.updateFighter=function(f,inp){
    if(f&&f.itachiKotoUntil>0){
      const now=G.frame||0;
      if(now>=f.itachiKotoUntil)clearVictim(f);
      else{
        const age=now-(f.itachiKotoStart||now);
        if(age<18)inp=reverseInput(inp);
        else{
          if(!f.itachiKotoForcedMove)forceWhiff(f);
          if(f.itachiKotoForcedMove&&f.move){f.hasHit=false;inp=blankInput(inp);}
          else if(f.itachiKotoForcedMove&&!f.itachiKotoLockApplied){
            f.itachiKotoLockApplied=true;f.immobilize=Math.max(1,f.itachiKotoUntil-now);f.state='IMMOBILIZED';f.stateFrame=0;f.vx=0;f.vy=0;f.blocking=false;inp=blankInput(inp);
          }else inp=blankInput(inp);
        }
      }
    }
    const beforeX=f&&Number.isFinite(f.x)?f.x:0,r=previousUpdateFighter.apply(this,[f,inp]);
    if(f&&f.itachiKotoGhostUntil>(G.frame||0)&&f.itachiEdo&&f.state==='WALK'){
      const delta=f.x-beforeX;if(Math.abs(delta)>.01)f.x=clamp(f.x+delta*.7,typeof WALL!=='undefined'?WALL:130,typeof ARENA_W!=='undefined'?ARENA_W-(typeof WALL!=='undefined'?WALL:130):3070);
    }
    return r;
  };
  const previousReset=window.resetFighter;
  if(typeof previousReset==='function')window.resetFighter=function(f){const result=previousReset.apply(this,arguments);clearVictim(f);if(f&&f.itachiEdo){f.itachiKotoCastUntil=0;f.itachiKotoGhostUntil=0;f.itachiKotoTarget=null;}return result;};
  const previousPose=window.applyCharacterIdentityPose;
  if(typeof previousPose==='function')window.applyCharacterIdentityPose=function(P,f){
    previousPose.apply(this,arguments);if(!P||!f)return;
    if(f.itachiEdo&&f.moveKey==='s2'){
      const n=f.moveFrame||0;
      if(n<6){P.lean=-2;P.armF=[-48,-20];P.armB=[-22,-15];P.headY=-114;}
      else if(n<18){P.lean=-7;P.armF=[-64,-38];P.armB=[18,-35];P.headY=-118;}
      else if(n<56){P.lean=-9;P.armF=[-72,-44];P.armB=[-36,-30];P.headY=-120;}
      else if(n<88){P.lean=5;P.armF=[-28,-65];P.armB=[36,-28];P.headY=-115;}
      else{P.lean=0;P.armF=[-15,-28];P.armB=[24,-12];P.headY=-114;}
    }else if(f.itachiKotoUntil>(Number(G.frame)||0)){
      P.lean=-12;P.headY=-120;P.armF=[12,30];P.armB=[-12,26];P.legF=[90,8];P.legB=[95,-5];
    }
  };
  const drawFighterBase=window.drawFighter;
  let drawingKotoClones=false;
  function drawGroundKotoClones(target){
    if(!drawFighterBase||!target||!target.itachiKotoOwner||target.hp<=0)return;
    const owner=target.itachiKotoOwner,now=Number(G.frame)||0;
    if(owner.hp<=0||owner.state==='DEFEAT')return;
    const floor=typeof GROUND!=='undefined'?GROUND:target.y;
    const left=typeof WALL!=='undefined'?WALL:130;
    const right=typeof ARENA_W!=='undefined'?ARENA_W-left:3070;
    // Three full character actors drawn with the game's live Canvas fighter renderer.
    // Render-only decoys: no third-player state, collisions or input ownership.
    const cloneX=(i,t)=>{
      const phase=t*.105+i*(Math.PI*2/3),wave=Math.sin(phase);
      if(i===0)return target.x-(58+Math.abs(wave)*58);
      if(i===1)return target.x+(58+Math.abs(wave)*58);
      return target.x+(wave>=0?1:-1)*(44+Math.abs(Math.cos(phase))*28);
    };
    for(let i=0;i<3;i++){
      const x=clamp(cloneX(i,now),left,right),prevX=clamp(cloneX(i,now-1),left,right);
      const clone=Object.assign({},owner,{
        x:x,y:floor,facing:x>=prevX?1:-1,
        state:'WALK',stateFrame:(now+i*7)%24,animT:now+i*13,walk:now*.22+i*2.4,
        move:null,moveKey:null,moveFrame:0,hasHit:false,hitstun:0,blockstun:0,immobilize:0,
        vx:0,vy:0,onGround:true,invuln:0,invulnDash:0,hitFlash:0,hitstop:0,blocking:false,
        grabTarget:null,grabber:null,opp:null,isP2:false,
        hp:1,maxHp:1,energy:0,meter:0,cd:{},
        awakened:false,awakenGlow:0,infinity:0,youngInfinity:0,jackpot:0,overdriveActive:false,
        itachiEdo:false,itachiSusanooActive:false,itachiSusanooPending:false,itachiSusanooAction:'',
        itachiKotoUntil:0,itachiKotoStart:0,itachiKotoOwner:null,itachiKotoTarget:null,itachiKotoCastUntil:0,
        itachiPoseKey:'',itachiCinemaPose:'',itachiCinemaKind:'',itachiTsukuyomiPoseFrame:0,
        tojiHunt:0,tojiSeqHits:null,tojiWeaponPhase:null,tojiMotion:'idle',youngSixEyes:0,youngInfinity:0,
        itachiKotoClone:true
      });
      drawFighterBase.call(this,clone);
    }
  }
  if(typeof drawFighterBase==='function')window.drawFighter=function(f){
    if(!drawingKotoClones&&f&&typeof G!=='undefined'){
      const activeVictim=(G.fighters||[]).find(x=>x&&x.itachiKotoUntil>(Number(G.frame)||0)&&x.itachiKotoOwner);
      if(activeVictim===f){
        drawingKotoClones=true;
        try{drawGroundKotoClones(activeVictim);}finally{drawingKotoClones=false;}
      }
    }
    return drawFighterBase.apply(this,arguments);
  };
  const previousRender=window.render;
  if(typeof previousRender==='function')window.render=function(){const r=previousRender.apply(this,arguments);overlay();return r;};
  const previousStep=window.step;
  if(typeof previousStep==='function')window.step=function(){const r=previousStep.apply(this,arguments);if(typeof G!=='undefined'&&G.mode!=='menu'&&!G.paused){for(const f of (G.fighters||[])){if(!f)continue;if(f.itachiKotoUntil&&G.frame>=f.itachiKotoUntil)clearVictim(f);}}return r;};
  window.JFF_KOTOAMATSUKAMI={ready:true,startup:18,freeze:30,durationVersus:180,durationTraining:300,cooldown:2700,mechanic:'invert controls → forced whiff → action lock'};
  if(window.JFF_EDO_ITACHI)window.JFF_EDO_ITACHI.koto=window.JFF_KOTOAMATSUKAMI;
  console.info('[Koto] Absolute Brainwash loaded: cast, forced whiff, temporary lock, Mangekyo distortion.');
})();