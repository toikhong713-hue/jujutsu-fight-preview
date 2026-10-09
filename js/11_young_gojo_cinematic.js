'use strict';
/* ===== YOUNG GOJO CINEMATIC OVERHAUL =====
   Lightweight Canvas 2D cinematic layer for low-end PCs.
   Includes:
   - Young Gojo awakening cutscene
   - Hollow Purple incomplete cinematic
   - Toji-specific memory branch
   - No heavy shader / WebGL dependency
*/
(() => {
  const BASE_UPDATE_FIGHTER = updateFighter;
  const BASE_STEP = step;
  const BASE_RENDER = render;

  function clamp01(v){ return Math.max(0,Math.min(1,v)); }
  function easeInOut(t){ t=clamp01(t); return t*t*(3-2*t); }
  function easeOut(t){ t=clamp01(t); return 1-Math.pow(1-t,3); }
  function easeIn(t){ t=clamp01(t); return t*t*t; }
  function ptL(a,b,t){ return {x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t)}; }

  function youngCineResetPose(f){
    if(!f)return;
    f.vx=0;f.vy=0;f.onGround=true;f.state='IDLE';f.stateFrame=0;f.move=null;f.moveKey=null;
    f.youngMotion='idle';f.youngMotionFrame=0;f.youngMoveTween=null;
  }

  function beginYoungAwakening(f){
    if(!f||f.id!=='young_gojo'||f.awakened||G.youngGojoCine)return false;
    if(f.meter<50||f.awakenCd>0)return false;
    f.meter=Math.max(0,f.meter-50);
    f.awakenCd=600;
    f.youngGojoCine={
      type:'awakening',t:0,duration:410,
      phase:0,originX:f.x,originY:GROUND,
      startZoom:1.0,
      completed:false
    };
    G.youngGojoCine=f.youngGojoCine;
    G.roundState='intro';G.roundTimer=999999;
    G.matchOver=false;
    f.awakened=true;
    f.awakenedThisCine=true;
    f.awakenGlow=90;
    f.youngAwakened=true;
    f.youngAwakenBuffTimer=900;
    youngCineResetPose(f);
    f.y=GROUND;
    f.facing=f.opp&&f.opp.x>=f.x?1:-1;
    G.flash=0.5;G.flashColor='#ffd38b';
    SFX.awaken();
    return true;
  }

  function beginYoungPurple(f,isUlt){
    if(!f||f.id!=='young_gojo'||!f.awakened||G.youngGojoCine)return false;
    const o=f.opp;if(!o||o.state==='DEFEAT')return false;
    if(isUlt&&f.meter<100)return false;
    if(!isUlt&&f.energy<40)return false;
    if(isUlt)f.meter=0;else f.energy=Math.max(0,f.energy-40);
    f.youngGojoCine={
      type:'purple',t:0,duration:1000,
      phase:0,originX:f.x,originY:f.y,
      targetId:o.id,isUlt:!!isUlt,
      hitApplied:false,result:null,
      savedTarget:{x:o.x,y:o.y,facing:o.facing},
      savedGojo:{x:f.x,y:f.y,facing:f.facing}
    };
    G.youngGojoCine=f.youngGojoCine;
    G.roundState='intro';G.roundTimer=999999;
    youngCineResetPose(f);youngCineResetPose(o);
    f.facing=o.x>=f.x?1:-1;
    G.flash=0.18;G.flashColor='#d8a9ff';
    SFX.purple();
    return true;
  }

  function updateYoungAwakening(f,c){
    const t=c.t;
    const g=f;
    g.animT+=1.2;g.state='IDLE';g.vx=0;g.vy=0;g.onGround=true;
    // 0.0–1.9s: lift off
    if(t<112){
      const q=easeOut(t/112);
      g.y=GROUND-lerp(0,160,q);
      c.phase=1;
      c.camera={x:g.x+20,y:410-lerp(0,40,q),zoom:1.05+q*0.28};
      g.facing=1;
    // 1.9–4.1s: floating declaration
    }else if(t<248){
      const q=clamp01((t-112)/136);
      g.y=GROUND-160;
      c.phase=2;
      c.camera={x:g.x+10,y:365,zoom:1.38+Math.sin(q*Math.PI)*0.05};
    // 4.1–6.2s: gentle descent
    }else if(t<372){
      const q=easeInOut((t-248)/124);
      g.y=GROUND-160+160*q;
      c.phase=3;
      c.camera={x:g.x+10,y:405,zoom:1.30-q*0.20};
    }else{
      g.y=GROUND;c.phase=4;
      c.camera={x:g.x,y:430,zoom:1.08};
      if(!c.completed){
        c.completed=true;
        g.awakened=true;g.youngAwakened=true;g.youngAwakenBuffTimer=900;
        g.energy=Math.min(g.maxEnergy,g.energy+35);
        g.walk=g.def.walk*1.06;
        flash(.55,'#fff0bd');ring(g.x,GROUND,'#ffd98a',44,26);burst(g.x,GROUND-12,20,'#ffe7a6',5,9,22);
      }
    }
    c.t++;
    if(c.t>=c.duration){finishYoungCine(g,false);return;}
  }

  function updatePurple(f,c){
    const o=f.opp; if(!o)return;
    gCineTargetFreeze(o);
    f.animT+=1.2;o.animT+=1.0;
    f.state='IDLE';o.state=o.state==='DEFEAT'?'DEFEAT':'IDLE';
    f.vx=0;f.vy=0;o.vx=0;o.vy=0;f.onGround=true;o.onGround=true;
    const t=c.t;
    // Phase A: macro water table, Gojo hidden
    if(t<145){
      c.phase=1;
      f.x=-1200;
      o.x=c.originX+420;
      c.camera={x:o.x,y:390,zoom:1.55};
    // Phase B: Gojo appears, Blue/Red merge
    }else if(t<320){
      c.phase=2;
      f.x=c.savedGojo.x;f.y=GROUND;
      const desiredX=o.x-250;
      f.x=clamp(lerp(c.savedGojo.x,desiredX,easeOut((t-145)/175)),WALL,ARENA_W-WALL);
      f.facing=o.x>=f.x?1:-1;
      c.camera={x:(f.x+o.x)/2,y:405,zoom:1.28};
    // Phase C: chant + release
    }else if(t<430){
      c.phase=3;f.x=c.savedGojo.x;f.y=GROUND;
      f.facing=o.x>=f.x?1:-1;
      c.camera={x:(f.x+o.x)/2,y:400,zoom:1.36};
    // Phase D: projectile flight
    }else if(t<535){
      c.phase=4;f.x=c.savedGojo.x;f.y=GROUND;
      f.facing=o.x>=f.x?1:-1;
      c.camera={x:(f.x+o.x)/2,y:405,zoom:1.16};
    // Phase E: impact and branch
    }else{
      if(!c.hitApplied){
        c.hitApplied=true;
        applyYoungPurpleHit(f,o,c);
      }
      if(t<595){
        c.phase=5;
        c.camera={x:o.x,y:420,zoom:c.result==='toji'?1.24:1.16};
        if(t>560 && c.result!=='toji' && !c.completed){o.state='CINE_REACT';o.hp=Math.max(1,o.hp);}
      }else if(t<1195){
        c.phase=6;
        const local=t-595;
        c.camera={x:o.x+(c.result==='toji'?8:18),y:418,zoom:c.result==='toji'?1.18:1.12};
        // Hold the defeated target in the cinematic so the dialogue scene owns the frame.
        o.state='CINE_REACT';o.vx=0;o.vy=0;o.onGround=true;o.x=c.savedTarget.x+f.facing*26;o.y=GROUND;
        if(c.result==='toji'&&t>=755){c.phase=7;c.camera={x:o.x,y:420,zoom:1.15};}
        // Give the normal opponent a small breathing reaction until the final line.
        if(c.result!=='toji'&&local>410&&local<545)o.animT+=0.35;
      }else{
        c.phase=8;
        c.camera={x:o.x,y:420,zoom:c.result==='toji'?1.10:1.08};
      }
    }
    c.t++;
    const endAt = 1195; // 10.0s aftermath/conversation window after the 535f impact sequence
    if(c.t>=endAt){finishYoungCine(f,true);return;}
  }

  function gCineTargetFreeze(o){
    if(!o)return;
    const c=G.youngGojoCine;
    if(c&&c.type==='purple'&&c.t<535){
      o.x=c.savedTarget.x;o.y=c.savedTarget.y;o.facing=c.savedTarget.facing;o.onGround=true;o.vx=0;o.vy=0;
    }
  }

  function applyYoungPurpleHit(f,o,c){
    const isToji=o.id==='toji';
    c.result=isToji?'toji':'normal';
    const cx=o.x,cy=o.y-90;
    flash(.85,'#f2d9ff');shake(20);camPunch(.28);G.hitstop=Math.max(G.hitstop,14);
    vfxShockwave(cx,cy,'#c77bff',180,28);
    burst(cx,cy,26,'#d8b8ff',10,13,34);
    ygShards(cx,cy,f.facing,'#ffffff','#d8c4ff',36,10);
    floatText(cx,cy-90,'HOLLOW PURPLE','#e7d2ff',25,84);
    // Non-graphic impact: silhouette stun / cloak damage impression.
    o.hp=Math.max(1,Math.floor(o.maxHp*0.10));
    o.state='HITSTUN';o.stateFrame=0;o.hitstun=55;o.hitFlash=14;o.invuln=6;
    o.vx=f.facing*6;o.vy=-3;o.onGround=false;
    if(isToji){
      c.tojiMemoryStart=575;
      o.x=c.savedTarget.x+f.facing*26;
      o.y=GROUND;
      o.state='CINE_REACT';
    }else{
      o.x=clamp(o.x+f.facing*26,WALL,ARENA_W-WALL);o.y=GROUND;o.state='CINE_REACT';
    }
    SFX.purple();
  }

  function drawSunsetHall(cx,cy,scale,alpha){
    ctx.save();ctx.globalAlpha=alpha;ctx.globalCompositeOperation='lighter';
    const grd=ctx.createRadialGradient(cx,cy,8,cx,cy,220);
    grd.addColorStop(0,'rgba(255,230,166,.95)');
    grd.addColorStop(.24,'rgba(255,190,105,.45)');
    grd.addColorStop(1,'rgba(255,145,70,0)');
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(cx,cy,220*scale,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,218,155,.20)';ctx.lineWidth=10;
    for(let i=-5;i<=5;i++){
      ctx.beginPath();ctx.moveTo(cx,cy+12);ctx.lineTo(cx+i*190,cy+440);ctx.stroke();
    }
    ctx.restore();
  }

  function drawAwakeningOverlay(f,c){
    const t=c.t;
    const q=clamp01(t/410);
    ctx.save();
    ctx.fillStyle='rgba(20,9,4,.22)';ctx.fillRect(0,0,W,H);
    const sunX=W*0.76,sunY=150;
    drawSunsetHall(sunX,sunY,1.0,0.95);
    // floating dust / heat shimmer
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<16;i++){
      const px=(i*91+(G.frame*0.35))%W, py=120+((i*67+G.frame*0.8)%430);
      ctx.globalAlpha=.08+.05*Math.sin(i+G.frame*.03);
      ctx.fillStyle=i%2?'#fff0cb':'#ffd795';ctx.fillRect(px,py,2,2);
    }
    // rising aura column
    const glow=Math.max(.12,1-Math.abs(f.y-(GROUND-160))/220);
    ctx.globalAlpha=.10+glow*.10;ctx.fillStyle='#fff0bb';ctx.fillRect(f.x-75,f.y-180,150,180);
    // custom arm indication for divine pose
    if(c.phase===2){
      const fd=f.facing||1,bx=f.x,by=f.y;
      const head={x:bx+fd*2,y:by-122};
      const handTop={x:bx+fd*25,y:by-150};
      const handDown={x:bx+fd*54,y:by-40};
      ctx.globalAlpha=.84;ctx.strokeStyle='#d9eefb';ctx.lineWidth=9;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(bx+fd*10,by-88);ctx.lineTo(handTop.x,handTop.y);ctx.stroke();
      ctx.strokeStyle='#b9cad6';ctx.lineWidth=7;
      ctx.beginPath();ctx.moveTo(bx-fd*8,by-86);ctx.lineTo(handDown.x,handDown.y);ctx.stroke();
      ctx.fillStyle='#f0d9c8';ctx.beginPath();ctx.arc(handTop.x,handTop.y,7,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f0d9c8';ctx.beginPath();ctx.arc(handDown.x,handDown.y,6,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.75;ctx.font='900 14px Segoe UI';ctx.fillStyle='#fff1cb';ctx.textAlign='center';
      ctx.fillText('TENJO TENGE • YUIGA DOKUSON',W/2,82);
    }
    if(c.phase===1){
      const ringY=f.y+8;for(let i=0;i<3;i++){ctx.globalAlpha=.12-i*.025;ctx.strokeStyle='#fff1cb';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,ringY,44+i*26,10+i*6,0,0,Math.PI*2);ctx.stroke();}
    }
    if(c.phase===3){
      ctx.globalAlpha=.24;ctx.strokeStyle='#fff0c0';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,GROUND,50,12,0,0,Math.PI*2);ctx.stroke();
      if(t%5===0)spark(f.x+rnd(-28,28),GROUND-rnd(0,6),2,'#ffe0a8',2.5,4,15,.06);
    }
    // subtitles
    ctx.globalAlpha=.96;ctx.textAlign='center';ctx.font='800 11px Segoe UI';ctx.fillStyle='#d6c9b5';
    ctx.fillText(c.phase<4?'SIX EYES // AWAKENING':'AWAKENING COMPLETE',W/2,H-74);
    ctx.restore();
  }

  function drawWaterDrop(x,y,r,alpha,color){
    ctx.save();ctx.globalAlpha=alpha;ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(x-r*.25,y-r*.35,1,x,y,r);
    g.addColorStop(0,'rgba(255,255,255,.95)');
    g.addColorStop(.35,color);
    g.addColorStop(1,'rgba(20,30,70,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r*.8,.2,5.7);ctx.stroke();
    ctx.restore();
  }

  function drawPurpleOverlay(f,c){
    const o=f.opp,t=c.t;
    ctx.save();
    if(c.phase===1){
      ctx.fillStyle='rgba(4,7,15,.62)';ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=.28;ctx.fillStyle='#1b2748';ctx.fillRect(0,H*.67,W,H*.33);
      // macro droplets falling toward a dark water plane
      for(let i=0;i<8;i++){
        const tt=((G.frame+i*17)%75)/75;
        const x=170+i*138+(i%2)*30;
        const y=90+tt*430;
        drawWaterDrop(x,y,4+((i+G.frame)%3),.55,i%2?'rgba(116,194,255,.8)':'rgba(255,102,126,.8)');
        ctx.globalAlpha=.22;ctx.strokeStyle=i%2?'#6ad5ff':'#ff829d';ctx.lineWidth=1;
        ctx.beginPath();ctx.ellipse(x,H*.72,35+tt*18,6+tt*3,0,0,Math.PI*2);ctx.stroke();
      }
      // Blue + Red special drops and purple pool
      const mixX=W*.5,mixY=H*.68,phase=clamp01((t-55)/90);
      drawWaterDrop(mixX-70*(1-phase),mixY-55*(1-phase),16,.76,'rgba(70,180,255,.95)');
      drawWaterDrop(mixX+70*(1-phase),mixY+30*(1-phase),16,.76,'rgba(255,70,105,.95)');
      ctx.globalCompositeOperation='lighter';
      const pg=ctx.createRadialGradient(mixX,mixY,4,mixX,mixY,170);
      pg.addColorStop(0,'rgba(255,255,255,.76)');pg.addColorStop(.12,'rgba(199,132,255,.84)');pg.addColorStop(1,'rgba(70,20,120,0)');
      ctx.fillStyle=pg;ctx.beginPath();ctx.ellipse(mixX,mixY,180,58,0,0,Math.PI*2);ctx.fill();
      for(let i=0;i<14;i++){
        const a=i/14*Math.PI*2+G.frame*.02;const rr=70+Math.sin(G.frame*.06+i)*12;
        ctx.strokeStyle=i%2?'rgba(175,111,255,.55)':'rgba(255,255,255,.35)';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(mixX,mixY,rr,a,a+.65);ctx.stroke();
      }
      ctx.globalAlpha=.95;ctx.textAlign='center';ctx.font='900 12px Segoe UI';ctx.fillStyle='#e7d4ff';ctx.fillText('BLUE + RED // CONVERGENCE',W/2,88);
    }else if(c.phase===2||c.phase===3){
      ctx.fillStyle='rgba(5,6,12,.22)';ctx.fillRect(0,0,W,H);
      const cx=f.x+f.facing*82,cy=f.y-92;
      // Left arm resting on right bicep + right palm extended
      ctx.globalAlpha=.86;ctx.lineCap='round';ctx.strokeStyle='#d4e5ef';ctx.lineWidth=8;
      ctx.beginPath();ctx.moveTo(f.x-f.facing*10,f.y-86);ctx.lineTo(f.x+f.facing*16,f.y-58);ctx.lineTo(f.x+f.facing*36,f.y-76);ctx.stroke();
      ctx.strokeStyle='#f4d8cf';ctx.lineWidth=6;
      ctx.beginPath();ctx.moveTo(f.x+f.facing*12,f.y-86);ctx.lineTo(f.x+f.facing*60,f.y-88);ctx.lineTo(f.x+f.facing*84,f.y-90);ctx.stroke();
      ctx.globalCompositeOperation='lighter';
      const pr=16+Math.sin(G.frame*.2)*2+(c.phase===3?18:0);
      const gg=ctx.createRadialGradient(cx,cy,1,cx,cy,pr*4);
      gg.addColorStop(0,'rgba(255,255,255,1)');gg.addColorStop(.16,'rgba(220,178,255,.98)');gg.addColorStop(.52,'rgba(157,85,245,.6)');gg.addColorStop(1,'rgba(70,20,120,0)');
      ctx.fillStyle=gg;ctx.beginPath();ctx.arc(cx,cy,pr*4,0,Math.PI*2);ctx.fill();
      for(let i=0;i<7;i++){
        const a=i*Math.PI/3.5+G.frame*.08;const ex=cx+Math.cos(a)*38,ey=cy+Math.sin(a)*24;
        ctx.strokeStyle=i%2?'rgba(255,255,255,.75)':'rgba(196,133,255,.8)';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.stroke();
      }
      if(c.phase===3){
        ctx.globalAlpha=.98;ctx.textAlign='center';ctx.font='900 18px Segoe UI';ctx.fillStyle='#f0e4ff';ctx.fillText('KYOSHIKI: MURASAKI',W/2,88);
        ctx.globalAlpha=.54;ctx.font='700 11px Segoe UI';ctx.fillStyle='#d9c7ef';ctx.fillText('IMAGINARY TECHNIQUE // PURPLE',W/2,108);
      }
    }else if(c.phase===4){
      // Large incomplete Purple traveling horizontally.
      const q=clamp01((t-430)/105);
      const sx=f.x+f.facing*98,sy=f.y-92,tx=o.x,ty=o.y-92;
      const cx=lerp(sx,tx,easeInOut(q)),cy=lerp(sy,ty,easeInOut(q));
      ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle='rgba(189,128,255,.30)';ctx.lineWidth=42;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(cx,cy);ctx.stroke();
      const pg=ctx.createRadialGradient(cx,cy,4,cx,cy,76);
      pg.addColorStop(0,'rgba(255,255,255,1)');pg.addColorStop(.18,'rgba(226,186,255,.98)');pg.addColorStop(.55,'rgba(144,68,230,.72)');pg.addColorStop(1,'rgba(70,20,130,0)');
      ctx.fillStyle=pg;ctx.beginPath();ctx.arc(cx,cy,76,0,Math.PI*2);ctx.fill();
      if(G.frame%3===0){
        for(let i=0;i<4;i++){
          const a=Math.random()*6.28;const rr=rnd(28,70);
          spark(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,1,'#eadcff',2.2,4,12,0);
        }
      }
    }else if(c.phase===5||c.phase===6||c.phase===7||c.phase===8){
      const isToji=c.result==='toji';
      const impactAge=Math.max(0,t-535);
      ctx.fillStyle='rgba(48,24,70,.18)';ctx.fillRect(0,0,W,H);
      const cx=o.x,cy=o.y-92;
      // Residual Purple haze: brighter near impact, then settling into a quiet violet atmosphere.
      ctx.globalCompositeOperation='lighter';
      const haze=impactAge<70?0.58:Math.max(0.16,0.58-(impactAge-70)/520);
      const gg=ctx.createRadialGradient(cx,cy,8,cx,cy,235);
      gg.addColorStop(0,'rgba(255,255,255,'+(0.60*haze)+')');
      gg.addColorStop(.20,'rgba(218,181,255,'+(0.48*haze)+')');
      gg.addColorStop(.55,'rgba(148,72,232,'+(0.24*haze)+')');
      gg.addColorStop(1,'rgba(52,10,90,0)');
      ctx.fillStyle=gg;ctx.beginPath();ctx.arc(cx,cy,235,0,Math.PI*2);ctx.fill();
      ctx.globalCompositeOperation='source-over';
      ctx.globalAlpha=.85;ctx.textAlign='center';ctx.font='900 24px Segoe UI';ctx.fillStyle='#f1ddff';ctx.fillText(impactAge<60?'PURPLE IMPACT':'',W/2,78);

      const local=t-595;
      function dialogueBox(speaker,line,accent,progress){
        const x=96,y=510,w=W-192,h=132;
        ctx.save();
        ctx.fillStyle='rgba(5,7,14,.91)';ctx.fillRect(x,y,w,h);
        ctx.strokeStyle='rgba(215,205,235,.30)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);
        ctx.fillStyle=accent;ctx.fillRect(x,y,4,h);
        ctx.font='900 12px Segoe UI';ctx.textAlign='left';ctx.fillStyle=accent;ctx.fillText(speaker.toUpperCase(),x+22,y+25);
        const shown=Math.max(1,Math.floor(line.length*clamp01(progress)));
        const txt=line.slice(0,shown);
        ctx.font='700 19px Segoe UI';ctx.fillStyle='#edf0f7';ctx.fillText(txt,x+22,y+63);
        ctx.font='600 9px Consolas';ctx.fillStyle='#75809a';ctx.fillText('CINEMATIC DIALOGUE',x+22,y+108);
        ctx.restore();
      }

      if(!isToji){
        if(local<135)dialogueBox('GOJO SATORU','So this is what the world looks like now.','#9feaff',local/70);
        else if(local<270)dialogueBox(o?.short||'OPPONENT','What... was that?','#d4c6dd',(local-135)/65);
        else if(local<430)dialogueBox('GOJO SATORU','A technique I could barely touch before. Now I can finally control it.','#bfc8ff',(local-270)/90);
        else if(local<560)dialogueBox(o?.short||'OPPONENT','You are not the same anymore.','#d4c6dd',(local-430)/65);
        else if(local<600)dialogueBox('GOJO SATORU','No. I’m not.','#f1ddff',(local-560)/25);
      }else if(t<755){
        if(local<80)dialogueBox('GOJO SATORU','Any last words?','#9feaff',local/45);
        else dialogueBox('TOJI FUSHIGURO','Nah...','#d8d0d9',(local-80)/45);
      }
      if(isToji&&t>=755){
        ctx.globalAlpha=.30;ctx.fillStyle='#c9b38e';ctx.fillRect(0,0,W,H);
      }
      if(t>=1115){
        const endQ=clamp01((t-1115)/80);
        ctx.save();ctx.globalAlpha=endQ*.92;ctx.fillStyle='rgba(4,4,8,.70)';ctx.fillRect(0,0,W,H);
        ctx.textAlign='center';ctx.font='900 27px Segoe UI';ctx.fillStyle='#f0e1ff';ctx.fillText('GOJO SATORU • VICTORY',W/2,96);
        ctx.font='700 11px Consolas';ctx.fillStyle='#a99db1';ctx.fillText('THE AFTERMATH LINGERS',W/2,120);
        ctx.restore();
      }
      }
    ctx.restore();
    if(c.result==='toji'&&t>=755)drawTojiMemoryOverlay(f,c);
  }

  function drawTojiMemoryOverlay(f,c){
    const t=c.t;
    ctx.save();
    const local=t-755;
    if(local<45){
      ctx.fillStyle='rgba(0,0,0,.82)';ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=.7;ctx.textAlign='center';ctx.font='700 12px Georgia';ctx.fillStyle='#d4c1a2';ctx.fillText('A MEMORY',W/2,H-92);
    }else if(local<250){
      // Warm sepia engawa scene with a small child silhouette.
      ctx.fillStyle='#9b805d';ctx.fillRect(0,0,W,H);
      const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#d7c29a');sky.addColorStop(1,'#7d6144');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(244,222,166,.55)';ctx.beginPath();ctx.arc(W*.74,150,90,0,Math.PI*2);ctx.fill();
      // house
      ctx.fillStyle='#594837';ctx.beginPath();ctx.moveTo(110,420);ctx.lineTo(340,250);ctx.lineTo(570,420);ctx.closePath();ctx.fill();
      ctx.fillStyle='#72583e';ctx.fillRect(150,380,380,140);
      for(let x=170;x<530;x+=52){ctx.fillStyle='#c7ab7d';ctx.fillRect(x,395,5,105);}
      ctx.fillStyle='#b39569';ctx.fillRect(120,520,470,22);
      // child Megumi silhouette
      const mx=430,my=505;ctx.fillStyle='#2c261f';ctx.beginPath();ctx.arc(mx,my-42,19,0,Math.PI*2);ctx.fill();
      capsule(mx,my-24,mx,my+30,12,'#2f2a25');capsule(mx,my-15,mx-32,my+12,6,'#2f2a25');capsule(mx,my-15,mx+32,my+12,6,'#2f2a25');
      ctx.textAlign='center';ctx.font='700 15px Georgia';ctx.fillStyle='#efe1c8';ctx.fillText('MEGUMI',mx,my+58);
      ctx.globalAlpha=.72;ctx.font='italic 14px Georgia';ctx.fillStyle='#f0dcc0';ctx.fillText('“Take care of him.”',W/2,H-86);
    }else if(local<360){
      ctx.fillStyle='#080709';ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=.85;ctx.textAlign='center';ctx.font='700 15px Georgia';ctx.fillStyle='#d6c5af';ctx.fillText('The memory fades.',W/2,H/2);
    }else{
      const a=clamp01((local-360)/40);
      ctx.fillStyle='rgba(8,7,11,.80)';ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=a*.95;ctx.textAlign='center';ctx.font='900 20px Segoe UI';ctx.fillStyle='#f0e2ff';ctx.fillText('GOJO SATORU • VICTORY',W/2,100);
      ctx.font='700 13px Segoe UI';ctx.fillStyle='#cfc2d7';ctx.fillText('Toji’s final memory remains on screen.',W/2,128);
      ctx.globalAlpha=a*.55;ctx.font='700 11px Segoe UI';ctx.fillStyle='#a99eab';ctx.fillText('PRESS ENTER TO RETURN',W/2,H-64);
    }
    ctx.restore();
  }

  function finishYoungCine(f,isPurple){
    const c=G.youngGojoCine;if(!c)return;
    if(isPurple){
      const o=f.opp;
      if(o){
        o.hp=0;o.state='DEFEAT';o.stateFrame=0;o.hitstun=0;o.blockstun=0;o.vx=0;o.vy=0;o.onGround=true;o.x=c.savedTarget.x;o.y=GROUND;
      }
      f.x=c.savedGojo.x;f.y=GROUND;f.state='VICTORY';f.stateFrame=0;f.facing=o?(o.x>=f.x?1:-1):f.facing;
      G.matchOver=true;G.roundState='ko';G.roundTimer=999999;
      G.youngGojoCinePersist=true;G.youngGojoCineResult=c.result||'normal';
    }else{
      f.x=c.originX;f.y=GROUND;f.state='IDLE';f.stateFrame=0;f.onGround=true;
      G.roundState='fight';G.roundTimer=0;G.youngGojoCinePersist=false;G.youngGojoCineResult=null;
    }
    f.awakened=true;f.youngAwakened=true;
    G.youngGojoCine=null;
  }

  function updateYoungCineFrame(){
    const c=G.youngGojoCine;if(!c)return false;
    const f=G.fighters.find(x=>x.id==='young_gojo');if(!f){G.youngGojoCine=null;return false;}
    if(c.type==='awakening')updateYoungAwakening(f,c);else updatePurple(f,c);
    updateVFX();updateCamera();
    return true;
  }

  function drawYoungCineOverlay(){
    const c=G.youngGojoCine;
    if(!c){
      if(G.youngGojoCinePersist){
        const f=G.fighters.find(x=>x.id==='young_gojo');
        const isToji=G.youngGojoCineResult==='toji';
        if(f){
          ctx.save();
          ctx.fillStyle='rgba(4,4,7,.72)';ctx.fillRect(0,0,W,H);
          if(isToji){
            drawTojiMemoryOverlay(f,{t:970,result:'toji'});
          }else{
            ctx.textAlign='center';ctx.font='900 30px Segoe UI';ctx.fillStyle='#f1ddff';ctx.fillText('GOJO SATORU • VICTORY',W/2,98);
          }
          ctx.font='700 12px Segoe UI';ctx.fillStyle='#d3cad9';ctx.fillText('PRESS ENTER TO RETURN',W/2,H-58);
          ctx.restore();
        }
      }
      return;
    }
    const f=G.fighters.find(x=>x.id==='young_gojo');if(!f)return;
    if(c.camera){cam.x=c.camera.x;cam.y=c.camera.y;cam.zoom=c.camera.zoom;cam.tx=cam.x;cam.ty=cam.y;cam.tzoom=cam.zoom;}
    if(c.type==='awakening')drawAwakeningOverlay(f,c);else drawPurpleOverlay(f,c);
  }

  function cineMenuKey(code){
    if(code!=='Enter'&&code!=='Space')return false;
    if(!G.youngGojoCinePersist)return false;
    G.youngGojoCinePersist=false;G.youngGojoCineResult=null;G.matchOver=false;G.roundState='ko';G.roundTimer=1;
    showScreen(null);
    return true;
  }

  updateFighter=function(f,inp){
    if(f.id==='young_gojo'&&!G.youngGojoCine){
      // Explicit awakening button.
      if(inp.awaken&&f.meter>=50&&!f.awakened&&!f.awakenCd){
        beginYoungAwakening(f);return;
      }
      // Low-health awakening keeps the cinematic too.
      if(!f.awakened&&f.hp>0&&f.hp<=f.maxHp*.25){
        if(beginYoungAwakening(f))return;
      }
      // X is a post-awakening cinematic.
      if(inp.special2){
        if(f.awakened&&beginYoungPurple(f,false))return;
        const clean={...inp,special2:0};return BASE_UPDATE_FIGHTER(f,clean);
      }
      // Ultimate becomes the same Purple cinematic, but requires full meter.
      if(inp.ult){
        if(f.awakened&&f.meter>=100){beginYoungPurple(f,true);return;}
        const clean={...inp,ult:0};return BASE_UPDATE_FIGHTER(f,clean);
      }
    }
    if(G.youngGojoCine&&f!==G.fighters.find(x=>x.id==='young_gojo'))return;
    BASE_UPDATE_FIGHTER(f,inp);
  };

  step=function(){
    if(G.youngGojoCine){
      if(G.paused){KP_RESET();return;}
      G.frame++;
      updateYoungCineFrame();
      KP_RESET();
      return;
    }
    if(G.youngGojoCinePersist){
      G.frame++;updateVFX();updateCamera();KP_RESET();return;
    }
    BASE_STEP();
  };

  render=function(){
    BASE_RENDER();
    drawYoungCineOverlay();
  };

  const BASE_MENU_KEY=MenuKey;
  MenuKey=function(code){
    if(cineMenuKey(code))return;
    BASE_MENU_KEY(code);
  };

  // Prevent the generic awakening overlay from claiming Young Gojo's title during the cine.
  const oldDrawUI=drawUI;
  drawUI=function(){ if(G.youngGojoCine||G.youngGojoCinePersist)return; oldDrawUI(); };
})();