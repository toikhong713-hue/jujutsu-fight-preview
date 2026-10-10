/* JFF CHARACTER PRESENCE + CINEMATIC V2
   Character-specific entrance movement, poses, atmosphere and a heavier face-off.
   Canvas 2D only; no external dependencies. The legacy combat renderer remains in control.
*/
(function(){
  'use strict';
  if(window.JFF_CHARACTER_PRESENCE_V2) return;
  if(typeof G==='undefined'||typeof cam==='undefined') return;

  const DURATION=6.25, TAIL_FRAMES=132;
  const baseResetRound=window.resetRound, baseStep=window.step;
  const baseRender=window.render, baseDrawFighter=window.drawFighter;
  const baseMenuKey=window.MenuKey;
  if(![baseResetRound,baseStep,baseRender,baseDrawFighter].every(fn=>typeof fn==='function')){
    console.warn('[JFF Presence V2] Required hooks missing; module disabled.'); return;
  }

  const PROFILE={
    gojo:{color:'#83e7ff',hot:'#edfaff',kind:'limitless',title:'THE HONORED ONE',mood:'SPACE BENDS TO HIS WILL'},
    young_gojo:{color:'#9eeaff',hot:'#f4fdff',kind:'sixeyes',title:'SIX EYES AWAKEN',mood:'EVERY MOVEMENT IS READ'},
    sukuna:{color:'#ff465c',hot:'#ffb1a6',kind:'slaughter',title:'KING OF CURSES',mood:'THE AIR ITSELF FEARS HIM'},
    yuji:{color:'#ff7668',hot:'#ffe0ce',kind:'impact',title:'VESSEL OF POWER',mood:'STRENGTH HELD IN CHECK'},
    yuta:{color:'#c7a5ff',hot:'#f3eaff',kind:'rika',title:'CURSED BOND',mood:'A SECOND PRESENCE STIRS'},
    hakari:{color:'#ffd166',hot:'#fff1b8',kind:'jackpot',title:'FEVER OF THE JACKPOT',mood:'THE ODDS ARE ABOUT TO BREAK'},
    toji:{color:'#b5c4ce',hot:'#f6fbff',kind:'assassin',title:'SORCERER KILLER',mood:'NO CURSED ENERGY. NO WARNING.'},
    heian_sukuna:{color:'#ff344f',hot:'#ffc0ae',kind:'calamity',title:'ANCIENT CALAMITY',mood:'FOUR ARMS. TOTAL DOMINANCE'},
    the_strongest_today:{color:'#00e5ff',hot:'#b9fbff',kind:'spatial',title:'SPATIAL DOMINION',mood:'DISTANCE LOSES ITS MEANING'}
  };
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*clamp(t,0,1);
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const out=t=>1-Math.pow(1-clamp(t,0,1),3);
  const profile=f=>{
    if(!f)return PROFILE.gojo;
    if(f.id==='sukuna'&&f.form===1)return PROFILE.yuji;
    return PROFILE[f.id]||{color:'#b7d5e8',hot:'#f5fbff',kind:'generic',title:f.short||'SORCERER',mood:'CURSED ENERGY RISES'};
  };
  const storyIntro=()=>G.mode==='story'&&(
    !!G.storyCutscene||!!(G.story&&G.story.cutscene)||!!(G.ch1Cine&&G.ch1Cine.active)
  );
  const active=()=>!!(G.presenceCine&&G.presenceCine.active);
  function camera(x,zoom,y){
    cam.x=cam.tx=x;cam.y=cam.ty=y===undefined?430:y;cam.zoom=cam.tzoom=zoom;
  }
  function resetInput(){
    try{
      if(typeof KP_RESET==='function') KP_RESET();
      else if(typeof KP!=='undefined')for(const k in KP)KP[k]=false;
    }catch(_){}
  }
  function setPose(f,name,weight){
    f.presencePose=name;f.presencePoseWeight=weight===undefined?1:weight;
  }
  function begin(){
    if(!G.fighters||G.fighters.length<2||G.mode==='menu'||storyIntro())return;
    const a=G.fighters[0],b=G.fighters[1];
    if(!a||!b)return;
    G.startupCine=null; // supersede v1's generic READY/entrance sequence cleanly
    const center=ARENA_W/2, targetA=center-190,targetB=center+190;
    G.presenceCine={
      active:true,t:0,phase:0,center,targetA,targetB,
      startA:Math.max(150,center-570),startB:Math.min(ARENA_W-150,center+570),
      roundState:G.roundState,
      seed:((G.frame||0)%997)/997*Math.PI*2
    };
    for(const f of [a,b]){
      f.vx=0;f.vy=0;f.walk=0;f.state='IDLE';f.stateFrame=0;
      f.move=null;f.moveKey=null;f.moveFrame=0;f.blocking=false;
      f.presenceAuraFrames=0;f.presencePoseWeight=0;
      f.animT=(f.animT||0)*.25;
    }
    a.x=G.presenceCine.startA;b.x=G.presenceCine.startB;
    a.y=GROUND;b.y=GROUND;a.facing=1;b.facing=-1;
    setPose(a,'intro',1);setPose(b,'intro',1);
    G.roundState='intro';G.roundTimer=0;G.matchOver=false;G.winner=null;
    camera(center,.78,430);
  }
  function finish(){
    const c=G.presenceCine;
    if(!c||!G.fighters||G.fighters.length<2){G.presenceCine=null;return;}
    const a=G.fighters[0],b=G.fighters[1];
    a.x=c.targetA;b.x=c.targetB;
    for(const f of [a,b]){
      f.x=Math.round(f.x);f.y=GROUND;f.vx=0;f.vy=0;f.walk=0;
      f.state='IDLE';f.stateFrame=0;f.move=null;f.moveKey=null;f.moveFrame=0;
      f.presencePose='idle';f.presencePoseWeight=0;f.presenceAuraFrames=TAIL_FRAMES;
    }
    a.facing=1;b.facing=-1;
    G.roundState='fight';G.roundTimer=0;G.presenceCine=null;
    camera(c.center,.88,430);resetInput();
  }
  function applyCharacterMotion(f,t,phase,side,c){
    const p=profile(f),local=side===0;
    f.animT=(f.animT||0)+1.12+(p.kind==='jackpot' ? 0.24 : 0);
    f.stateFrame=(f.stateFrame||0)+1;f.vx=0;f.vy=0;
    if(phase===0){setPose(f,'intro',1);return;}
    if(phase===1&&local){
      setPose(f,t<1.42?'entrance':'reveal',1);
      const q=out((t-.42)/1.22);
      f.x=mix(c.startA,c.targetA,q);f.y=GROUND;
      f.state=t<1.62?'WALK':'IDLE';f.walk=t<1.62?Math.sin(t*12)*1.5:0;
    }else if(phase===2&&local){
      setPose(f,'reveal',1);f.x=c.targetA;f.state='IDLE';f.walk=0;
      const k=t-1.92;
      if(p.kind==='limitless'||p.kind==='spatial')f.y=GROUND-Math.sin(k*3.0)*4;
      else if(p.kind==='jackpot')f.y=GROUND-Math.abs(Math.sin(k*5))*2.5;
      else if(p.kind==='assassin')f.y=GROUND+Math.sin(k*4)*.7;
      else f.y=GROUND;
    }else if(phase===3&&!local){
      setPose(f,t<3.68?'entrance':'reveal',1);
      const q=out((t-2.48)/1.20);
      f.x=mix(c.startB,c.targetB,q);f.y=GROUND;
      f.state=t<3.72?'WALK':'IDLE';f.walk=t<3.72?Math.sin(t*12.7)*1.4:0;
    }else if(phase===4){
      setPose(f,'faceoff',1);f.x=local?c.targetA:c.targetB;f.y=GROUND;f.state='IDLE';f.walk=0;
    }else if(phase>=5){
      setPose(f,'power',1);f.x=local?c.targetA:c.targetB;f.y=GROUND;f.state='IDLE';f.walk=0;
    }
    if(p.kind==='assassin'&&phase===2&&local){
      // Toji barely moves; a quick weight shift is more menacing than a magical aura.
      f.x=c.targetA+Math.sin((t-1.92)*5)*1.8;
    }
    if(p.kind==='slaughter'&&phase===2&&local)f.x=c.targetA+Math.sin((t-1.92)*2.4)*1.1;
    if(p.kind==='calamity'&&phase===2&&local)f.y=GROUND-Math.abs(Math.sin((t-1.92)*3.1))*1.2;
    if(p.kind==='jackpot'&&phase>=4)f.y=GROUND-Math.abs(Math.sin(t*8))*(phase===5?2.3:0.8);
  }
  function tick(){
    const c=G.presenceCine;if(!c||!c.active||G.paused)return;
    c.t+=1/60;const t=c.t;
    const a=G.fighters&&G.fighters[0],b=G.fighters&&G.fighters[1];
    if(!a||!b){G.presenceCine=null;return;}
    let phase=0;
    if(t>=.42&&t<2.48)phase=t<1.92?1:2;
    else if(t>=2.48&&t<4.02)phase=3;
    else if(t>=4.02&&t<4.86)phase=4;
    else if(t>=4.86&&t<5.55)phase=5;
    else if(t>=5.55)phase=6;
    c.phase=phase;G.frame=(G.frame||0)+1;
    applyCharacterMotion(a,t,phase,0,c);applyCharacterMotion(b,t,phase,1,c);
    if(t<.42)camera(c.center,.76,430);
    else if(t<1.92)camera(a.x+42,mix(1.02,1.23,smooth((t-.42)/1.5)),422);
    else if(t<2.48)camera(a.x+12,1.34,420);
    else if(t<4.02)camera(b.x-42,mix(1.04,1.30,smooth((t-2.48)/1.54)),422);
    else if(t<4.86)camera(c.center,.86,430);
    else if(t<5.55)camera(c.center,.91+Math.sin(t*25)*.008,430);
    else camera(c.center,.88,430);
    if(t>=DURATION)finish();
  }

  function weightedPose(P,base,cin,weight){
    if(!base||!cin)return;
    const w=clamp(weight,0,1);
    for(const key of ['hipY','shY','headY','lean']){
      if(Number.isFinite(P[key])&&Number.isFinite(cin[key]))P[key]=mix(P[key],cin[key],w);
    }
    for(const key of ['armF','armB','legF','legB']){
      if(Array.isArray(P[key])&&Array.isArray(cin[key]))P[key]=[
        mix(P[key][0],cin[key][0],w),mix(P[key][1],cin[key][1],w)
      ];
    }
  }
  const IDLE_POSES={
    gojo:{hipY:-58,shY:-97,headY:-114,lean:-2,armF:[49,23],armB:[108,6]},
    young_gojo:{hipY:-60,shY:-100,headY:-117,lean:2,armF:[63,18],armB:[109,10]},
    sukuna:{hipY:-56,shY:-94,headY:-110,lean:12,armF:[75,35],armB:[118,13]},
    yuji:{hipY:-58,shY:-97,headY:-113,lean:7,armF:[65,27],armB:[112,15]},
    yuta:{hipY:-59,shY:-97,headY:-113,lean:-5,armF:[52,22],armB:[108,14]},
    hakari:{hipY:-57,shY:-96,headY:-112,lean:7,armF:[72,33],armB:[119,12]},
    toji:{hipY:-54,shY:-93,headY:-109,lean:14,armF:[75,36],armB:[119,11]},
    heian_sukuna:{hipY:-56,shY:-95,headY:-111,lean:10,armF:[73,30],armB:[120,9]},
    the_strongest_today:{hipY:-59,shY:-101,headY:-117,lean:-1,armF:[48,21],armB:[105,4]}
  };
  const POSE_OVERRIDES={
    gojo:{reveal:{lean:-4,armF:[50,13],armB:[100,0]},power:{lean:-5,armF:[40,3],armB:[106,-4]}},
    young_gojo:{reveal:{lean:1,armF:[58,8],armB:[103,1]},power:{lean:4,armF:[65,1],armB:[112,-4]}},
    sukuna:{reveal:{lean:15,armF:[70,25],armB:[119,6]},power:{lean:18,armF:[76,16],armB:[122,0]}},
    yuji:{reveal:{lean:8,armF:[62,23],armB:[109,10]},power:{lean:11,armF:[70,15],armB:[114,8]}},
    yuta:{reveal:{lean:-7,armF:[43,18],armB:[98,5]},power:{lean:-4,armF:[42,10],armB:[103,0]}},
    hakari:{reveal:{lean:8,armF:[73,29],armB:[119,9]},power:{lean:11,armF:[67,18],armB:[117,5]}},
    toji:{reveal:{hipY:-53,lean:17,armF:[78,30],armB:[121,7]},power:{hipY:-51,lean:20,armF:[82,24],armB:[124,2]}},
    heian_sukuna:{reveal:{lean:12,armF:[76,25],armB:[124,4]},power:{lean:16,armF:[82,14],armB:[128,-5]}},
    the_strongest_today:{reveal:{lean:-2,armF:[45,10],armB:[100,-3]},power:{lean:-4,armF:[38,0],armB:[104,-9]}}
  };
  function installPoseLayer(){
    const base=window.applyCharacterIdentityPose;
    if(typeof base!=='function')return;
    window.applyCharacterIdentityPose=function(P,f){
      const result=base(P,f);
      if(!f||!P||!active()||!f.presencePose)return result;
      const id=(f.id==='sukuna'&&f.form===1)?'yuji':f.id;
      const idle=IDLE_POSES[id],spec=POSE_OVERRIDES[id];
      if(!idle||!spec)return result;
      if(f.presencePose==='intro'||f.presencePose==='entrance'){
        const low=id==='toji'||id==='sukuna'||id==='heian_sukuna';
        const entry=Object.assign({},idle,{lean:idle.lean+(low?4:0),hipY:idle.hipY+(low?-2:0)});
        weightedPose(P,idle,entry,f.presencePoseWeight||0);
      }else{
        const pose=spec[f.presencePose];
        if(pose){const target=Object.assign({},idle,pose);weightedPose(P,idle,target,f.presencePoseWeight||0);}
        else if(f.presencePose==='faceoff')weightedPose(P,idle,Object.assign({},idle,{lean:idle.lean+(id==='toji'?3:0)}),.7);
      }
      return result;
    };
  }

  function drawArc(x,y,rx,ry,rot,a0,a1,color,width,alpha){
    ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
    ctx.ellipse(x,y,rx,ry,rot,a0,a1);ctx.stroke();ctx.restore();
  }
  function drawPresence(f,alpha,now){
    if(!f||typeof ctx==='undefined')return;
    const p=profile(f),id=(f.id==='sukuna'&&f.form===1)?'yuji':f.id;
    const t=now+(f.presenceSeed||0),x=f.x,y=f.y-77,dir=f.facing||1;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
    if(p.kind==='limitless'||p.kind==='spatial'){
      const r=26+Math.sin(t*2.1)*3;
      drawArc(x,y,r*1.12,r*1.55,-.12,0,Math.PI*1.7,p.color,1.7,alpha*.9);
      drawArc(x,y,r*.82,r*1.2,.18,.65,5.4,p.hot,1,alpha*.7);
      for(let i=0;i<3;i++){
        const ang=t*(.42+i*.09)+i*2.094,rr=33+i*5;
        const ox=x+Math.cos(ang)*rr,oy=y+Math.sin(ang)*rr*.65;
        ctx.globalAlpha=alpha*.9;ctx.fillStyle=i===1?p.hot:p.color;
        ctx.beginPath();ctx.arc(ox,oy,1.7+(i%2),0,Math.PI*2);ctx.fill();
      }
      if(p.kind==='spatial'){
        ctx.globalAlpha=alpha*.65;ctx.strokeStyle=p.hot;ctx.lineWidth=1;
        for(let i=0;i<3;i++){const dx=(i-1)*20;ctx.beginPath();ctx.moveTo(x+dx-5,y-53);ctx.lineTo(x+dx+5,y+16);ctx.stroke();}
      }
    }else if(p.kind==='sixeyes'){
      drawArc(x,y,28+Math.sin(t*3)*2,47,.05,3.5,6.0,p.color,1.4,alpha*.7);
      ctx.globalAlpha=alpha*.85;ctx.strokeStyle=p.hot;ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(x-22,y-6);ctx.lineTo(x-9,y-6);ctx.moveTo(x+9,y-6);ctx.lineTo(x+22,y-6);ctx.stroke();
      for(let i=0;i<4;i++){const ox=x-28+i*18,oy=y+Math.sin(t*2+i)*20;ctx.globalAlpha=alpha*.5;ctx.fillStyle=p.color;ctx.fillRect(ox,oy,2,2);}
    }else if(p.kind==='slaughter'||p.kind==='calamity'){
      const n=p.kind==='calamity'?5:3;
      for(let i=0;i<n;i++){
        const q=(t*.62+i*.217)%1,yy=y-37+i*18+Math.sin(t*1.6+i)*2;
        const xx=x-dir*(23+q*8);
        ctx.globalAlpha=alpha*(.38+.35*Math.sin(Math.PI*q));
        ctx.strokeStyle=i%2?p.hot:p.color;ctx.lineWidth=i===0?2.3:1.2;
        ctx.beginPath();ctx.moveTo(xx-dir*19,yy-11);ctx.lineTo(xx+dir*29,yy+5);ctx.stroke();
        ctx.beginPath();ctx.moveTo(xx+dir*8,yy-15);ctx.lineTo(xx-dir*2,yy-3);ctx.stroke();
      }
      drawArc(x,y,37,47,.05,t*.15,Math.PI*1.72+t*.15,p.color,1.1,alpha*.34);
      if(p.kind==='calamity'){
        // Four short, separated traces hint at four-arm motion without replacing the body rig.
        for(let i=0;i<4;i++){const side=i%2?1:-1,yy=y-19+Math.floor(i/2)*22;ctx.globalAlpha=alpha*.75;ctx.strokeStyle=p.hot;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+side*7,yy);ctx.lineTo(x+side*(24+Math.sin(t*4+i)*3),yy-7);ctx.stroke();}
      }
    }else if(p.kind==='assassin'){
      // Metallic cues, not a supernatural aura: quick steel glints and compressed air.
      for(let i=0;i<2;i++){
        const q=(t*1.3+i*.5)%1;
        ctx.globalAlpha=alpha*(1-q)*.9;ctx.strokeStyle=i?p.hot:p.color;ctx.lineWidth=i?1.5:2.5;
        ctx.beginPath();ctx.moveTo(x-dir*(19+q*12),y+14+i*8);ctx.lineTo(x+dir*(16+q*16),y-8-i*7);ctx.stroke();
      }
      ctx.globalAlpha=alpha*.5;ctx.strokeStyle=p.hot;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x-dir*26,y-8);ctx.lineTo(x-dir*7,y-8);ctx.stroke();
    }else if(p.kind==='rika'){
      drawArc(x-27,y+2,15,34,-.28,.25,5.6,p.color,1.8,alpha*.65);
      drawArc(x-29,y+2,23,41,.12,1.2,4.5,p.hot,1,alpha*.42);
      ctx.globalAlpha=alpha*.7;ctx.strokeStyle=p.color;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(x+dir*8,y+8);ctx.lineTo(x+dir*23,y-9);ctx.lineTo(x+dir*35,y-17);ctx.stroke();
      ctx.globalAlpha=alpha*.5;ctx.fillStyle=p.hot;ctx.beginPath();ctx.arc(x-30,y-30,2.2,0,Math.PI*2);ctx.fill();
    }else if(p.kind==='jackpot'){
      ctx.save();ctx.translate(x,y);ctx.rotate(t*.42);ctx.globalAlpha=alpha*.8;ctx.strokeStyle=p.color;ctx.lineWidth=1.8;
      const r=31+Math.sin(t*3)*3;ctx.strokeRect(-r*.58,-r*.58,r*1.16,r*1.16);
      ctx.rotate(-t*.84);ctx.strokeRect(-r*.37,-r*.37,r*.74,r*.74);ctx.restore();
      drawArc(x,y,45,15,t*.05,t*.9,t*.9+2.3,p.hot,1.6,alpha*.65);
      for(let i=0;i<3;i++){const xx=x-27+i*27,yy=y-34-Math.abs(Math.sin(t*3+i))*10;ctx.globalAlpha=alpha*.75;ctx.fillStyle=p.hot;ctx.fillRect(xx,yy,3,3);}
    }else if(p.kind==='impact'){
      for(let i=0;i<3;i++){const yy=y+22+i*4;ctx.globalAlpha=alpha*.7;ctx.strokeStyle=i===1?p.hot:p.color;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+dir*14,yy);ctx.lineTo(x+dir*(28+Math.sin(t*5+i)*4),yy-12);ctx.stroke();}
    }else{
      drawArc(x,y,28,42,0,.4+t*.1,4.8+t*.1,p.color,1.2,alpha*.55);
    }
    ctx.restore();
  }
  function drawTension(c){
    if(!c||c.phase<5||typeof ctx==='undefined')return;
    const k=clamp((c.t-4.86)/.69,0,1),x=c.center,y=GROUND-83;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.15+.45*Math.sin(k*Math.PI);
    const a=G.fighters[0],b=G.fighters[1],pa=profile(a),pb=profile(b);
    ctx.strokeStyle=pa.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x+52,y+Math.sin(c.t*22)*4);ctx.lineTo(x-7,y-9);ctx.stroke();
    ctx.strokeStyle=pb.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x-52,y-Math.sin(c.t*22)*4);ctx.lineTo(x+7,y+9);ctx.stroke();
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-8,y-15);ctx.lineTo(x+8,y+15);ctx.moveTo(x+8,y-15);ctx.lineTo(x-8,y+15);ctx.stroke();
    ctx.restore();
  }
  function drawOverlay(){
    const c=G.presenceCine;if(!c||!c.active||typeof ctx==='undefined')return;
    const t=c.t,phase=c.phase,a=G.fighters[0],b=G.fighters[1],pa=profile(a),pb=profile(b);
    ctx.save();
    const bar=46+Math.min(18,Math.max(0,(t-4.8)*26));
    ctx.fillStyle='#03050a';ctx.fillRect(0,0,W,bar);ctx.fillRect(0,H-bar,W,bar);
    if(t<.42){
      ctx.globalAlpha=.34*(1-t/.42);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=.8;ctx.textAlign='center';ctx.fillStyle='#d5e1f1';ctx.font='800 11px system-ui';ctx.fillText('CURSED ENERGY DETECTED',W/2,H-72);
    }else if(phase===1||phase===2){
      ctx.textAlign='center';ctx.globalAlpha=.95;ctx.fillStyle=pa.hot;ctx.font='900 20px system-ui';ctx.fillText(pa.title,W/2,bar+31);
      ctx.globalAlpha=.72;ctx.fillStyle='#e9f1fb';ctx.font='700 10px system-ui';ctx.fillText(pa.mood,W/2,H-bar-22);
      if(phase===2){ctx.globalAlpha=.20;ctx.fillStyle=pa.color;ctx.fillRect(0,0,W,H);}
    }else if(phase===3){
      ctx.textAlign='center';ctx.globalAlpha=.95;ctx.fillStyle=pb.hot;ctx.font='900 20px system-ui';ctx.fillText(pb.title,W/2,bar+31);
      ctx.globalAlpha=.72;ctx.fillStyle='#e9f1fb';ctx.font='700 10px system-ui';ctx.fillText(pb.mood,W/2,H-bar-22);
      ctx.globalAlpha=.16;ctx.fillStyle=pb.color;ctx.fillRect(0,0,W,H);
    }else if(phase===4||phase===5){
      ctx.textAlign='center';ctx.globalAlpha=.94;ctx.fillStyle='#f5f7ff';ctx.font='900 14px system-ui';ctx.fillText(pa.title+'  VS  '+pb.title,W/2,bar+27);
      ctx.globalAlpha=.78;ctx.fillStyle='#d4dfec';ctx.font='700 10px system-ui';ctx.fillText('THE AIR TURNS HEAVY',W/2,H-bar-20);
      if(phase===5){
        const flash=.13+.13*Math.sin((t-4.86)*35);
        ctx.globalAlpha=flash;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
      }
    }else{
      const pulse=.9+.1*Math.sin(t*28);
      ctx.textAlign='center';ctx.globalAlpha=pulse;ctx.fillStyle='#fff';ctx.strokeStyle='#111722';ctx.lineWidth=5;
      ctx.font='900 61px Impact, system-ui, sans-serif';ctx.strokeText('FIGHT!',W/2,H/2+20);ctx.fillText('FIGHT!',W/2,H/2+20);
      ctx.globalAlpha=.78;ctx.fillStyle='#c9d6e8';ctx.font='800 10px system-ui';ctx.fillText('CURSED CLASH // BEGIN',W/2,H/2+49);
      ctx.globalAlpha=.17;ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
    }
    ctx.restore();
  }

  window.resetRound=function(){
    baseResetRound.apply(this,arguments);
    G.presenceCine=null;
    if(storyIntro())return;
    begin();
  };
  window.step=function(){
    if(active()){tick();return;}
    baseStep.apply(this,arguments);
    if(G.fighters)for(const f of G.fighters){
      if(f.presenceAuraFrames>0)f.presenceAuraFrames--;
    }
  };
  window.drawFighter=function(f){
    const c=G.presenceCine;
    if(f){
      const inCine=!!(c&&c.active);
      const awakened=!!(f.awakened||f.ultCharging||f.domainCharge>0||f.jackpot>0||f.tojiHunt>0||f.infinity>0);
      let alpha=inCine ? 0.76 : (f.presenceAuraFrames>0 ? (0.34*f.presenceAuraFrames/TAIL_FRAMES) : (awakened ? 0.20 : 0));
      if(alpha>0)drawPresence(f,alpha,(G.frame||0)*.055+(c?c.seed:0));
      if(inCine&&G.fighters[0]===f)drawTension(c);
    }
    baseDrawFighter.apply(this,arguments);
  };
  window.render=function(){
    baseRender.apply(this,arguments);
    drawOverlay();
  };
  if(typeof baseMenuKey==='function'){
    window.MenuKey=function(code){
      if(active())return;
      baseMenuKey.apply(this,arguments);
    };
  }
  installPoseLayer();

  window.JFF_CHARACTER_PRESENCE_V2={
    version:'2.0',
    profiles:Object.keys(PROFILE),
    get active(){return active();},
    get time(){return G.presenceCine?G.presenceCine.t:0;},
    duration:DURATION,
    tailFrames:TAIL_FRAMES
  };
  console.info('[JFF Presence V2] Character-specific cinematic and atmosphere ready.');
})();