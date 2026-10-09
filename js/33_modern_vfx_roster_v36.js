'use strict';
/* JFF v36: roster-wide modern VFX language.
   Canvas 2D only. Event-driven sparks plus a small amount of vector geometry while a move is active.
   Design goals: strong silhouette, distinct character signature, readable hit timing, minimal overdraw. */
(function(){
  if (window.JFF_V36_MODERN_VFX) return;

  const baseStartMove = window.startMove;
  const baseResolveHit = window.resolveHit;
  const baseDrawFighter = window.drawFighter;
  const baseUpdateFighter = window.updateFighter;
  const baseDrawProjectiles = window.drawProjectiles;
  if (![baseStartMove, baseResolveHit, baseDrawFighter, baseUpdateFighter, baseDrawProjectiles].every(fn => typeof fn === 'function')) {
    console.warn('[JFF V36] Modern VFX not installed: a base function was not found.');
    return;
  }

  const STYLES = {
    gojo: {a:'#83e7ff', b:'#f4fdff', c:'#438aff', mode:'limitless'},
    young_gojo: {a:'#a9edff', b:'#ffffff', c:'#4eafff', mode:'crystal'},
    sukuna: {a:'#ff4c68', b:'#ffe4e7', c:'#941a36', mode:'slash'},
    yuji: {a:'#ff8d5e', b:'#fff0dc', c:'#ed4059', mode:'impact'},
    yuta: {a:'#cdb7ff', b:'#fffaff', c:'#8c70e8', mode:'crescent'},
    hakari: {a:'#ffd166', b:'#fff7d6', c:'#ff55b7', mode:'jackpot'},
    toji: {a:'#b8d4df', b:'#f7ffff', c:'#6b98aa', mode:'steel'},
    heian_sukuna: {a:'#ff3d59', b:'#ffe6e8', c:'#8e1731', mode:'fourfold'},
    the_strongest_today: {a:'#00e5ff', b:'#ffffff', c:'#ffd166', mode:'overdrive'}
  };
  const LOW_COST = { maxEventSparks: 8, allowSoftGradients: true };
  let v36EventCount = 0;

  function styleFor(f){
    if (f && f.id === 'sukuna' && f.form !== 0) return {a:'#ff9066',b:'#fff0df',c:'#e34657',mode:'impact'};
    return STYLES[(f && f.id)] || {a:'#a9e5ff',b:'#ffffff',c:'#7895bb',mode:'clean'};
  }
  function skillLabel(f){
    const m = f && f.move;
    const raw = ((m && (m.name || m.kind)) || f?.moveKey || '').toLowerCase();
    if (/purple/.test(raw)) return 'purple';
    if (/blue|infinity|limitless|spatial|six eyes/.test(raw)) return 'blue';
    if (/red counter|\bred\b|repulsion/.test(raw)) return 'red';
    if (/fuga|flame|fire|kamutoke|lightning/.test(raw)) return 'flame';
    if (/black flash|\bbf\b/.test(raw)) return 'blackflash';
    if (/reverse cursed|\brct\b|heal|healing/.test(raw)) return 'heal';
    if (/rika|summon|copy|speech/.test(raw)) return 'summon';
    if (/jackpot|gamble|pure love|door|roulette|restless/.test(raw)) return 'jackpot';
    if (/domain|void|shrine|transform|overdrive/.test(raw)) return 'domain';
    if (/dismantle|cleave|hiten|slash|katana|spear|cloud|chain|cut|wcs/.test(raw)) return 'slash';
    if (f && f.moveKey === 'def') return 'guard';
    if (f && f.moveKey === 'ult') return 'domain';
    return 'energy';
  }
  function clampN(v,a,b){return Math.max(a,Math.min(b,v));}
  function frame(){return typeof G!=='undefined' && Number.isFinite(G.frame)?G.frame:0;}
  function canDraw(){return typeof ctx!=='undefined' && typeof G!=='undefined' && G.mode!=='menu';}

  function drawSegmentedRing(x,y,rx,ry,color,alpha,width,rotation,segments,phase){
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';
    for(let i=0;i<segments;i++){
      const start=rotation+(i/segments)*Math.PI*2+phase;
      const end=start+(Math.PI*2/segments)*0.52;
      ctx.beginPath();ctx.ellipse(x,y,rx,ry,Math.sin(phase+i)*0.04,start,end);ctx.stroke();
    }
    ctx.restore();
  }
  function drawDiamond(x,y,size,color,alpha,rotation){
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation||0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=1.3;
    ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*0.68,0);ctx.lineTo(0,size);ctx.lineTo(-size*0.68,0);ctx.closePath();ctx.stroke();ctx.restore();
  }
  function drawSpike(x,y,dir,length,color,alpha,tilt){
    ctx.save();ctx.translate(x,y);ctx.scale(dir||1,1);ctx.rotate(tilt||0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha;ctx.fillStyle=color;
    ctx.beginPath();ctx.moveTo(length,0);ctx.lineTo(-length*0.25,-length*0.18);ctx.lineTo(-length*0.65,0);ctx.lineTo(-length*0.18,length*0.11);ctx.closePath();ctx.fill();ctx.restore();
  }
  function drawSlashRibbon(x,y,dir,scale,color,accent,phase){
    ctx.save();ctx.translate(x,y);ctx.scale(dir||1,1);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    const p=Math.sin(phase||0)*4;
    ctx.globalAlpha=0.20;ctx.strokeStyle=color;ctx.lineWidth=11*scale;
    ctx.beginPath();ctx.moveTo(-30*scale,23*scale+p);ctx.quadraticCurveTo(10*scale,-36*scale,76*scale,-23*scale+p);ctx.stroke();
    ctx.globalAlpha=0.90;ctx.strokeStyle=color;ctx.lineWidth=3.2*scale;
    ctx.beginPath();ctx.moveTo(-30*scale,23*scale+p);ctx.quadraticCurveTo(10*scale,-36*scale,76*scale,-23*scale+p);ctx.stroke();
    ctx.globalAlpha=0.86;ctx.strokeStyle=accent;ctx.lineWidth=1.3*scale;
    ctx.beginPath();ctx.moveTo(-21*scale,19*scale+p);ctx.quadraticCurveTo(14*scale,-28*scale,68*scale,-21*scale+p);ctx.stroke();
    ctx.restore();
  }
  function drawCrossFocus(x,y,r,color,accent,alpha,phase){
    ctx.save();ctx.translate(x,y);ctx.rotate(phase);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-r,-r*0.22);ctx.lineTo(r,r*0.22);ctx.moveTo(-r*0.7,r*0.72);ctx.lineTo(r*0.72,-r*0.7);ctx.stroke();
    ctx.strokeStyle=accent;ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(-r*1.22,0);ctx.lineTo(-r*0.82,0);ctx.moveTo(r*0.82,0);ctx.lineTo(r*1.22,0);ctx.moveTo(0,-r*1.15);ctx.lineTo(0,-r*0.78);ctx.moveTo(0,r*0.78);ctx.lineTo(0,r*1.15);ctx.stroke();ctx.restore();
  }
  function drawOrbitNodes(x,y,r,color,accent,phase,count){
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.86;ctx.strokeStyle=color;ctx.lineWidth=1.15;ctx.beginPath();ctx.ellipse(x,y,r,r*0.54,phase*0.25,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<count;i++){
      const a=phase+(i/ count)*Math.PI*2;const px=x+Math.cos(a)*r;const py=y+Math.sin(a)*r*0.54;
      ctx.fillStyle=i%2?accent:color;ctx.beginPath();ctx.arc(px,py,i%2?2.2:1.55,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function drawHex(x,y,r,color,alpha,phase){
    ctx.save();ctx.translate(x,y);ctx.rotate(phase);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=1.1;ctx.beginPath();
    for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/6;const px=Math.cos(a)*r,py=Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.stroke();ctx.restore();
  }
  function drawAura(f,s){
    if(!canDraw()||!f||f.state==='DEFEAT')return;
    const attacking=f.state==='ATTACK'&&f.move;
    const activeAura=!!(f.awakened||f.infinity>0||f.youngInfinity>0||f.domainCharge>0||f.awakenGlow>0||f.ultCharging||f.jackpot>0||f.overdriveActive||f.jffClutchUntil>frame()||attacking);
    if(!activeAura)return;
    const x=f.x,y=f.y-59,t=(f.animT||0)*0.045+(frame()%120)*0.012;
    const power=(f.overdriveActive||f.awakened||f.jackpot>0)?1:0.68;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(0.10+Math.sin(t*1.7)*0.025)*power;ctx.fillStyle=s.a;
    ctx.beginPath();ctx.ellipse(x,y,25+Math.sin(t)*2,48+Math.cos(t*.7)*3,0,0,Math.PI*2);ctx.fill();ctx.restore();
    if(s.mode==='limitless'||s.mode==='overdrive'){
      drawSegmentedRing(x,y,38,19,s.a,0.38*power,1.15,t*0.3,5,t*0.2);
      drawSegmentedRing(x,y,25,12,s.b,0.30*power,0.9,-t*0.4,7,-t*0.3);
      if(f.infinity>0||f.overdriveActive||f.awakened)drawOrbitNodes(x,y-8,35,s.c,s.b,t*1.2,3);
    }else if(s.mode==='crystal'){
      drawHex(x+Math.sin(t)*5,y-14,29,s.a,0.40*power,t*0.3);
      drawDiamond(x-27,y-35,4.5,s.b,0.54*power,t);drawDiamond(x+28,y-15,3.6,s.c,0.58*power,-t);
    }else if(s.mode==='slash'||s.mode==='fourfold'){
      drawSegmentedRing(x,y,34,17,s.c,0.26*power,1.2,t*.4,4,t*.35);
      if(s.mode==='fourfold'){drawSpike(x-31,y-21,-1,17,s.a,0.55*power,-0.22);drawSpike(x+30,y-33,1,19,s.b,0.52*power,0.25);}
    }else if(s.mode==='impact'){
      drawCrossFocus(x+f.facing*12,y-4,17,s.c,s.b,0.28*power,t*0.2);
      if(f.blackFlash||f.move?.kind==='skill3')drawSegmentedRing(x,y,34,15,s.a,0.27*power,1.1,t,4,t*.2);
    }else if(s.mode==='crescent'){
      drawSegmentedRing(x,y,34,18,s.a,0.38*power,1.4,t*.65,3,t*.4);
      drawDiamond(x-27,y-22,4,s.b,0.44*power,t);drawDiamond(x+22,y-42,3.5,s.c,0.40*power,-t);
    }else if(s.mode==='jackpot'){
      drawSegmentedRing(x,y,37,19,s.c,0.32*power,1.15,-t*.5,8,t*.35);
      drawSegmentedRing(x,y,26,13,s.a,0.30*power,1.4,t*.35,4,-t*.25);
    }else if(s.mode==='steel'){
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.4*power;ctx.strokeStyle=s.b;ctx.lineWidth=1.25;
      for(let i=0;i<3;i++){const yy=y-24+i*20;ctx.beginPath();ctx.moveTo(x-44+i*3,yy+Math.sin(t+i)*2);ctx.lineTo(x-17,yy-5);ctx.stroke();ctx.beginPath();ctx.moveTo(x+26,yy-5);ctx.lineTo(x+47-i*3,yy+Math.cos(t+i)*2);ctx.stroke();}ctx.restore();
    }
  }

  function drawStartupSignature(f,s,cat,t,p){
    const x=f.x+(f.facing||1)*30,y=f.y-86,dir=f.facing||1;
    const charge=clampN(t/Math.max(8,(f.move&&f.move.startup)||12),0,1);
    const pulse=0.65+Math.sin((frame()+t)*0.15)*0.16;
    if(cat==='blue'){
      drawSegmentedRing(x,y,17+charge*18,12+charge*11,s.a,0.55,1.35,(frame()+t)*0.025,6,-(frame()+t)*0.05);
      drawOrbitNodes(x,y,22+charge*17,s.c,s.b,(frame()+t)*0.10,3);
      for(let i=0;i<3;i++)drawDiamond(x-dir*(22+i*7),y+(i-1)*10,2.6,s.b,0.55,(frame()+t)*0.09+i);
    }else if(cat==='red'){
      drawSegmentedRing(x,y,12+charge*31,9+charge*22,s.a,0.55,1.5,(frame()+t)*0.025,4,(frame()+t)*0.07);
      drawCrossFocus(x,y,11+charge*8,s.b,s.a,0.58,(frame()+t)*0.03);
    }else if(cat==='purple'){
      drawSegmentedRing(x,y,20+charge*24,15+charge*15,s.c,0.55,2.0,-(frame()+t)*0.04,5,(frame()+t)*0.05);
      drawOrbitNodes(x-dir*11,y,30+charge*13,s.a,s.b,-(frame()+t)*0.12,4);
      drawDiamond(x-dir*17,y-10,5,s.b,0.8,(frame()+t)*0.08);
    }else if(cat==='flame'){
      drawCrossFocus(x,y,13+charge*12,s.a,s.b,0.50,(frame()+t)*0.06);
      for(let i=0;i<3;i++)drawSpike(x+dir*(8+i*8),y+8-i*7,dir,10+charge*6,i%2?s.a:s.c,0.48,(frame()+t)*0.015+i*0.6);
    }else if(cat==='blackflash'){
      drawCrossFocus(x,y,16+charge*10,s.b,s.a,0.72,(frame()+t)*0.045);
      drawSegmentedRing(x,y,20+charge*14,14+charge*8,s.a,0.42,1.5,(frame()+t)*0.03,4,0.3);
    }else if(cat==='heal'){
      drawSegmentedRing(x,y,18+charge*17,25+charge*13,s.b,0.44,1.1,-(frame()+t)*0.03,5,0.35);
      drawDiamond(x,y-18,4+charge*2,s.a,0.75,(frame()+t)*0.03);
      drawDiamond(x-dir*16,y+4,3,s.c,0.5,-(frame()+t)*0.05);
    }else if(cat==='summon'){
      drawSegmentedRing(x,y,20+charge*24,26+charge*16,s.a,0.48,1.5,(frame()+t)*0.02,4,(frame()+t)*0.05);
      drawHex(x,y,11+charge*11,s.b,0.68,(frame()+t)*0.03);
    }else if(cat==='jackpot'){
      drawSegmentedRing(x,y,23+charge*20,19+charge*13,s.c,0.60,1.5,(frame()+t)*0.05,8,-(frame()+t)*0.04);
      for(let i=0;i<3;i++)drawDiamond(x+Math.cos((frame()+t)*.08+i*2.1)*26,y+Math.sin((frame()+t)*.08+i*2.1)*17,3,s.a,0.7,i);
    }else if(cat==='domain'){
      drawSegmentedRing(x,y,22+charge*27,15+charge*23,s.a,0.45,1.25,(frame()+t)*0.012,8,0.15);
      drawSegmentedRing(x,y,15+charge*17,24+charge*22,s.b,0.25,1.1,-(frame()+t)*0.01,4,0.5);
    }else if(cat==='slash'){
      drawSegmentedRing(x,y,15+charge*16,12+charge*11,s.c,0.32,1.1,(frame()+t)*0.03,3,0.4);
      drawSpike(x-dir*9,y,dir,24+charge*17,s.a,0.72,-0.22);
      drawSpike(x-dir*3,y+11,dir,17+charge*12,s.b,0.7,0.18);
    }else if(cat==='guard'){
      drawSegmentedRing(f.x,f.y-64,37,21,s.a,0.5,1.65,(frame()+t)*0.01,6,0.2);
      drawSegmentedRing(f.x,f.y-64,27,14,s.b,0.28,0.9,-(frame()+t)*0.015,5,0.1);
    }else{
      drawSegmentedRing(x,y,16+charge*14,11+charge*9,s.a,0.36,1.15,(frame()+t)*0.02,4,0.2);
      drawDiamond(x-dir*12,y,3.4,s.b,0.55,(frame()+t)*0.08);
    }
    if(charge>0.78 && (frame()+t)%4===0 && LOW_COST.maxEventSparks>0 && typeof spark==='function'){
      spark(x,y,2,s.b,2.8,2.1,10,0,'diamond');v36EventCount++;
    }
  }

  function drawSkillActive(f,s,cat,phase){
    const dir=f.facing||1,x=f.x+dir*48,y=f.y-83,t=(frame()+f.moveFrame)*0.055;
    const heavy=(f.moveKey==='heavy'||f.moveKey==='ult'||(f.move&&((f.move.damage||0)>=24)));
    const size=heavy?1.16:0.88;
    if(cat==='blue'){
      drawOrbitNodes(x+dir*12,y,30+Math.sin(t)*3,s.a,s.b,-t*1.7,4);
      drawSegmentedRing(x,y,42,24,s.c,0.46,1.4,-t,5,t*.65);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.72;ctx.strokeStyle=s.a;ctx.lineWidth=1.5;
      for(let i=0;i<3;i++){const yy=y-16+i*14;ctx.beginPath();ctx.moveTo(x+dir*52,yy);ctx.quadraticCurveTo(x+dir*25,yy-12,x-dir*(5+i*6),y+(i-1)*4);ctx.stroke();}ctx.restore();
    }else if(cat==='red'){
      drawSegmentedRing(x,y,34+Math.sin(t)*5,23+Math.cos(t)*3,s.a,0.70,2.1,t*.75,5,-t*.2);
      drawCrossFocus(x,y,19,s.b,s.a,0.62,t*.6);
      if(phase==='active'){drawSpike(x+dir*18,y-4,dir,36,s.a,0.85,-.12);drawSpike(x+dir*27,y+6,dir,22,s.b,0.95,.12);}
    }else if(cat==='purple'){
      drawSegmentedRing(x,y,48,30,s.c,0.64,2.2,-t*.6,6,t*.4);
      drawOrbitNodes(x,y,36,s.a,s.b,t*1.5,4);
      drawCrossFocus(x,y,25,s.b,s.a,0.76,-t*.3);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.52;ctx.strokeStyle=s.c;ctx.lineWidth=1.1;
      for(let i=0;i<6;i++){const a=t+i*Math.PI/3;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*24,y+Math.sin(a)*17);ctx.lineTo(x+Math.cos(a)*58,y+Math.sin(a)*34);ctx.stroke();}ctx.restore();
    }else if(cat==='flame'){
      drawSegmentedRing(x,y,29+Math.sin(t)*4,23+Math.cos(t*1.2)*4,s.c,0.48,1.7,t*.45,4,t*.4);
      for(let i=0;i<4;i++){const ox=x+dir*(10+i*9);drawSpike(ox,y-12+Math.sin(t+i)*7,dir,19+(i%2)*7,i%2?s.a:s.b,0.72,t*.4+i*.6);}
      drawCrossFocus(x,y,16,s.b,s.a,0.44,t*.55);
    }else if(cat==='blackflash'){
      drawCrossFocus(x+dir*5,y,33,s.b,s.a,0.95,t*.45);
      drawSegmentedRing(x,y,42,26,s.c,0.52,2.0,t*.8,4,t*.65);
      drawSlashRibbon(x-dir*6,y,dir,0.85,s.a,s.b,t);
    }else if(cat==='heal'){
      drawSegmentedRing(f.x,f.y-63,34,48,s.a,0.42,1.25,-t*.2,5,t*.4);
      drawSegmentedRing(f.x,f.y-63,25,35,s.b,0.28,0.9,t*.3,4,t*.3);
      drawDiamond(f.x,f.y-85,5,s.b,0.7,t);
    }else if(cat==='summon'){
      drawSegmentedRing(x,y,45,33,s.c,0.55,1.6,t*.25,4,t*.5);
      drawHex(x,y,22,s.b,0.7,t*.18);
      drawOrbitNodes(x,y,33,s.a,s.b,-t,3);
    }else if(cat==='jackpot'){
      drawSegmentedRing(x,y,50,28,s.c,0.68,2.0,t*.65,10,-t*.3);
      drawSegmentedRing(x,y,35,20,s.a,0.56,1.3,-t,6,t*.4);
      for(let i=0;i<3;i++)drawDiamond(x+Math.cos(t+i*2.1)*41,y+Math.sin(t+i*2.1)*23,4,s.b,0.88,t+i);
    }else if(cat==='domain'){
      drawSegmentedRing(f.x,f.y-66,66,37,s.a,0.55,1.7,t*.12,8,t*.2);
      drawSegmentedRing(f.x,f.y-66,47,26,s.b,0.28,1.1,-t*.16,6,t*.3);
      drawHex(f.x,f.y-66,19,s.c,0.52,t*.1);
    }else if(cat==='guard'){
      drawSegmentedRing(f.x,f.y-64,43,25,s.a,0.60,1.8,t*.2,6,t*.3);
      drawSegmentedRing(f.x,f.y-64,30,18,s.b,0.34,1.0,-t*.25,5,t*.2);
      drawCrossFocus(f.x,f.y-64,14,s.b,s.c,0.36,t*.2);
    }else if(cat==='slash'){
      drawSlashRibbon(x,y,dir,heavy?1.12:0.78,s.a,s.b,t);
      if(s.mode==='fourfold'){
        drawSlashRibbon(x-dir*12,y-12,-dir,0.66,s.c,s.b,-t*.8);
        drawSlashRibbon(x+dir*8,y+14,dir,0.52,s.b,s.a,t*1.4);
        drawSegmentedRing(x,y,35,22,s.c,0.42,1.2,t*.7,4,t*.4);
      }else if(s.mode==='steel'){
        drawSpike(x+dir*31,y-4,dir,50,s.a,0.8,-0.12);
        drawSpike(x+dir*22,y+8,dir,34,s.b,0.85,0.16);
      }else if(s.mode==='crescent'){
        drawSegmentedRing(x,y,38,19,s.c,0.58,2.0,t*.7,3,t*.5);
        drawDiamond(x+dir*43,y-18,5,s.b,0.8,t);
      }
    }else{
      drawSlashRibbon(x,y,dir,size*0.72,s.a,s.b,t);
      drawSegmentedRing(x,y,26,15,s.c,0.3,1.0,t,3,0.2);
    }
  }

  function drawBasicMoveFX(f,s){
    if(!f.move || f.state!=='ATTACK')return;
    const key=f.moveKey;
    if(!['light','heavy','air'].includes(key))return;
    const m=f.move, t=f.moveFrame||0;
    if(t <= (m.startup||0) || t > (m.startup||0)+(m.active||1))return;
    const dir=f.facing||1;const x=f.x+dir*45,y=f.y-(key==='air'?66:85);
    const strength=key==='heavy'?1.05:(key==='air'?.85:.68);
    const angle=(s.mode==='steel'||s.mode==='crescent')?0.18:-0.16;
    drawSlashRibbon(x,y,dir,strength,s.a,s.b,(frame()+t)*0.07+angle);
    if(s.mode==='impact'||s.mode==='fourfold'||s.mode==='slash')drawSpike(x+dir*16,y,dir,key==='heavy'?30:18,s.c,0.76,angle);
  }

  function moveOpenFX(f,key,m){
    if(!f||!m||['light','heavy','air'].includes(key))return;
    const s=styleFor(f),cat=skillLabel(f);const x=f.x+(f.facing||1)*25,y=f.y-73;
    f.jffV36MoveFx={move:m,key,startFrame:frame(),cat};
    if(typeof ring==='function')ring(x,y,s.a,(key==='ult'||cat==='purple'||cat==='domain')?38:23,(key==='ult'||cat==='purple'||cat==='domain')?22:14);
    if(typeof spark==='function'){
      const n=(cat==='purple'||cat==='domain'||key==='ult')?7:4;
      spark(x,y,n,s.b,3.8,2.7,14,0,'diamond');
    }
    if(cat==='blue'&&typeof vfxSpiralIn==='function')vfxSpiralIn(x,y,s.a,5,32,18);
    else if(cat==='flame'&&typeof vfxFlameCone==='function')vfxFlameCone(x,y,f.facing||1,18);
    else if(cat==='summon'&&typeof vfxCopySwirl==='function'&&(f.id==='yuta'||/copy/.test((m.name||'').toLowerCase())))vfxCopySwirl(x,y,6);
  }

  function resolveHitFX(attacker,defender,mv,hx,hy,result){
    if(!attacker||!defender||!['hit','block','armor','parry','infinity','red_counter'].includes(result))return;
    const s=styleFor(attacker);const x=Number.isFinite(hx)?hx:(attacker.x+defender.x)*0.5;const y=Number.isFinite(hy)?hy:defender.y-70;
    const heavy=(mv&&(mv.kind==='heavy'||mv.kind==='ult'||(mv.damage||0)>=22))||result==='red_counter';
    if(result==='block'){
      if(typeof ring==='function')ring(x,y,s.a,heavy?29:18,heavy?15:11);
      if(typeof spark==='function')spark(x,y,3,s.b,3.1,2.3,10,0,'diamond');
      return;
    }
    if(result==='parry'||result==='infinity'||result==='armor'){
      if(typeof ring==='function'){ring(x,y,s.a,result==='parry'?44:31,result==='parry'?22:16);ring(x,y,s.b,result==='parry'?24:18,14);}
      if(typeof spark==='function')spark(x,y,result==='parry'?6:4,s.b,4.2,3.0,14,0,'diamond');
      if(result==='parry'&&typeof vfxShockwave==='function')vfxShockwave(x,y,s.c,39,16);
      return;
    }
    if(typeof ring==='function')ring(x,y,s.a,heavy?40:25,heavy?21:15);
    if(typeof spark==='function')spark(x,y,Math.min(LOW_COST.maxEventSparks,heavy?8:5),s.b,heavy?6:4,heavy?4.2:3.0,heavy?20:14,0, s.mode==='jackpot'?'diamond':'bolt');
    if(s.mode==='slash'||s.mode==='steel'||s.mode==='fourfold'||s.mode==='crescent'){
      if(typeof vfxSlashTrail==='function'){
        const d=attacker.facing||1;vfxSlashTrail(x-d*30,y+14,x+d*40,y-19,s.a,heavy?4.2:2.7,heavy?18:12);
        if(s.mode==='fourfold')vfxSlashTrail(x-d*22,y-18,x+d*32,y+11,s.b,2.0,12);
      }
    }
    if(heavy&&typeof vfxShockwave==='function')vfxShockwave(x,y,s.c,heavy?44:27,heavy?18:12);
    if(result==='red_counter'){
      if(typeof flash==='function')flash(0.16,s.a);
      if(typeof G!=='undefined')G.hitstop=Math.max(G.hitstop||0,8);
    }
  }
  function drawEventPulse(f,x,y,s,mult){
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=0.8;
    drawSegmentedRing(x,y,28*mult,17*mult,s.a,0.78,2.0,frame()*0.03,6,0.4);
    drawCrossFocus(x,y,17*mult,s.b,s.c,0.72,frame()*0.02);
    ctx.restore();
  }

  window.startMove=function(f,key,isBF){
    const ok=baseStartMove.call(this,f,key,isBF);
    if(ok&&f&&f.move)moveOpenFX(f,key,f.move);
    return ok;
  };

  window.resolveHit=function(attacker,defender,mv,hx,hy){
    const result=baseResolveHit.call(this,attacker,defender,mv,hx,hy);
    resolveHitFX(attacker,defender,mv,hx,hy,result);
    return result;
  };

  window.updateFighter=function(f,inp){
    const oldMove=f&&f.move;
    const result=baseUpdateFighter.call(this,f,inp);
    if(f&&f.jffV36MoveFx&&f.move!==f.jffV36MoveFx.move){f.jffV36MoveFx=null;}
    if(f&&f.jffV36MoveFx&&f.state==='DEFEAT')f.jffV36MoveFx=null;
    return result;
  };

  window.drawFighter=function(f){
    if(!canDraw()||!f){baseDrawFighter.apply(this,arguments);return;}
    const s=styleFor(f);
    drawAura(f,s);
    baseDrawFighter.apply(this,arguments);
    if(f.state==='DEFEAT')return;
    if(f.state==='ATTACK'&&f.move){
      const m=f.move,key=f.moveKey,t=f.moveFrame||0,start=Math.max(1,m.startup||1),activeEnd=start+Math.max(1,m.active||1);
      const cat=skillLabel(f);
      if(['light','heavy','air'].includes(key))drawBasicMoveFX(f,s);
      else {
        if(t<start)drawStartupSignature(f,s,cat,t,'startup');
        else if(t<=activeEnd)drawSkillActive(f,s,cat,'active');
        else if(t<=activeEnd+Math.min(18,m.recovery||10) && (key==='ult'||cat==='purple'||cat==='domain'))drawSegmentedRing(f.x,f.y-68,30,18,s.a,0.20,0.9,frame()*0.01,5,0.3);
      }
    }
    if(f.jffClutchUntil>frame()){
      const life=(f.jffClutchUntil-frame());
      if(life>0){drawSegmentedRing(f.x,f.y-70,29,17,s.b,0.35,1.0,frame()*0.035,4,0.2);}
    }
  };

  function drawProjectileAccent(p){
    if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
    const type=String(p.type||'');
    let s=STYLES[p.owner&&p.owner.id]||STYLES.gojo;
    if(p.owner&&p.owner.id==='sukuna'&&p.owner.form!==0)s=STYLES.yuji;
    const x=p.x,y=p.y,dir=Math.sign(p.vx)||1,t=(p.t||0)*0.075;
    ctx.save();ctx.translate(x,y);ctx.scale(dir,1);ctx.globalCompositeOperation='lighter';
    if(type==='purple'||type==='young_purple'||type==='strongest_purple'){
      drawSegmentedRing(0,0,Math.max(22,(p.w||64)*0.34),Math.max(15,(p.h||48)*0.34),'#e8d1ff',0.58,1.35,t,5,t*.6);
      drawSegmentedRing(-10,0,Math.max(17,(p.w||64)*0.25),Math.max(10,(p.h||48)*0.24),s.b,0.40,0.9,-t,4,t*.4);
      drawCrossFocus(0,0,10,s.c,s.b,0.5,t*.4);
    }else if(type==='dismantle'||type==='dismantle_heian'||type==='wcs'){
      const w=type==='wcs'?Math.max(70,(p.w||120)*0.7):Math.max(30,(p.w||70)*0.6);
      ctx.globalAlpha=type==='wcs'?0.72:0.50;ctx.strokeStyle=s.a;ctx.lineWidth=type==='wcs'?3:1.5;ctx.beginPath();ctx.moveTo(-w,-3);ctx.lineTo(w*0.6,0);ctx.stroke();
      ctx.globalAlpha=0.72;ctx.strokeStyle=s.b;ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(-w*0.85,5);ctx.lineTo(w*0.4,0);ctx.moveTo(-w*0.72,-6);ctx.lineTo(w*0.48,0);ctx.stroke();
      if(type==='wcs')drawSegmentedRing(0,0,68,21,s.c,0.42,1.2,t,4,t*.6);
    }else if(type==='fuga'||type==='heianfuga'){
      drawSegmentedRing(0,0,Math.max(30,(p.w||64)*0.46),Math.max(20,(p.h||52)*0.42),s.c,0.38,1.1,t*.75,4,t*.35);
      for(let i=0;i<3;i++)drawSpike(-14-i*9,(i-1)*6,-1,18+(i%2)*7,i===1?'#fff1bd':s.a,0.64,t*.2+i*.6);
    }else if(type==='rika'){
      drawSegmentedRing(0,0,36,50,s.a,0.38,1.15,t*.6,4,t*.4);drawDiamond(0,-18,5,s.b,0.48,t);
    }else if(type==='beam'||type==='copied'){
      const len=Math.max(36,(p.w||64)*0.7);
      ctx.globalAlpha=0.62;ctx.strokeStyle=s.a;ctx.lineWidth=type==='beam'?3.2:2.0;ctx.beginPath();ctx.moveTo(-len,0);ctx.lineTo(len*.45,0);ctx.stroke();
      ctx.globalAlpha=0.75;ctx.strokeStyle=s.b;ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(-len*.8,-5);ctx.lineTo(len*.35,0);ctx.moveTo(-len*.8,5);ctx.lineTo(len*.35,0);ctx.stroke();
    }else if(type==='strongest_maxred'){
      drawSegmentedRing(0,0,36,23,s.a,0.46,1.5,t*.8,4,t*.4);drawCrossFocus(0,0,13,s.b,s.c,0.5,t);
    }else if(type==='toji_chain'){
      drawSegmentedRing(0,0,24,13,s.a,0.48,1.2,t*1.4,5,t*.5);drawDiamond(19,0,3.2,s.b,0.55,t);
    }
    ctx.restore();
  }

  window.drawProjectiles=function(){
    baseDrawProjectiles.apply(this,arguments);
    if(!canDraw()||!Array.isArray(G.projectiles))return;
    for(const p of G.projectiles)drawProjectileAccent(p);
  };

  window.JFF_VFX_CONFIG = Object.freeze({version:36,style:'modern-vector-signatures',rendering:'Canvas 2D',softFullscreenEffects:false,maxEventSparks:LOW_COST.maxEventSparks});
  window.JFF_V36_MODERN_VFX=true;
  console.log('[JFF V36] Modern roster-wide VFX signatures loaded (Canvas 2D / low-overdraw mode).');
})();