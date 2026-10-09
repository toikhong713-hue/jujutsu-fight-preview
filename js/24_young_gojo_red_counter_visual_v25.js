'use strict';
(() => {
  if(window.JFF_V25_RED_VISUAL)return;
  function ws(wx,wy){return {x:W/2+G.shakeX+(wx-cam.x)*cam.zoom,y:H/2+G.shakeY+(wy-cam.y)*cam.zoom};}
  function drawGlowOrbLocal(cx,cy,r,inner,outer,a){
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    g.addColorStop(0,inner);g.addColorStop(.42,inner);g.addColorStop(1,outer);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawPressureLocal(cx,cy,r,col,ang,a){
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=2.2;
    for(let i=0;i<5;i++){const q=1-i*.14;ctx.beginPath();ctx.ellipse(cx,cy,r*q,r*.36*q,ang+i*.08,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }
  function yg20RedCore(cx,cy,r,a){drawGlowOrbLocal(cx,cy,r,'rgba(255,242,246,.98)','rgba(255,52,88,.08)',a);}
  function yg20RedPressure(cx,cy,r,ang,a){drawPressureLocal(cx,cy,r,'#ff6684',ang,a);}
  function yg20BackflipBurst(f){
    for(let i=0;i<12;i++){const p=pget(),a=Math.random()*Math.PI*2;p.active=true;p.x=f.x;p.y=f.y-76;p.vx=Math.cos(a)*rnd(2,5);p.vy=Math.sin(a)*rnd(2,5);p.maxLife=p.life=rnd(12,24);p.size=rnd(2,5);p.color=i%2?'#ff5c7a':'#e7fbff';p.grav=0;p.shape='streak';p.rot=a;p.vr=0;p.add=true;}
  }
  window.yg20RedCore=yg20RedCore;window.yg20RedPressure=yg20RedPressure;window.yg20BackflipBurst=yg20BackflipBurst;
  function updateProjectile(){
    const p=G.youngRedCounterProjectile;if(!p)return;
    p.t++;p.x+=p.vx;p.y+=p.vy;p.vx*=0.995;p.vy*=0.995;p.life--;p.trailAge++;
    if(p.t%2===0){
      const q=pget();q.active=true;q.x=p.x-rnd(-p.vx*0.35,p.vx*0.35);q.y=p.y-rnd(-p.vy*0.35,p.vy*0.35);
      q.vx=-p.vx*.08;q.vy=-p.vy*.08;q.maxLife=q.life=rnd(8,16);q.size=rnd(1.5,4);q.color=Math.random()<.5?'#ff5575':'#fff1f4';q.grav=0;q.shape='streak';q.rot=Math.atan2(p.vy,p.vx);q.vr=0;q.add=true;
    }
    if(!p.hitDone&&p.target&&p.target.hp>0){
      const hurt=getHurtbox(p.target),hb={x:p.x-18,y:p.y-18,w:36,h:36};
      if(aabb(hb,hurt)){
        resolveHit(p.owner,p.target,{damage:22,hitstun:38,blockstun:20,kbx:15,kby:-8,hitstop:15,armorBreak:true,kind:'young_red_counter',type:'projectile',meter:15},p.x,p.y);
        p.hitDone=true;p.life=8;yg20RedCore(p.x,p.y,36,1);yg20RedPressure(p.x,p.y,116,1);flash(.22,'#ffe4ea');shake(15);camPunch(.21);SFX.red();
        if(p.target.hp>0){p.target.state='HITSTUN';p.target.stateFrame=0;}
      }
    }
    if(p.life<=0||p.x<WALL-100||p.x>ARENA_W+100)G.youngRedCounterProjectile=null;
  }
  function drawProjectile(){
    const p=G.youngRedCounterProjectile;if(!p)return;
    const q=ws(p.x,p.y);drawGlowOrbLocal(q.x,q.y,24,'rgba(255,242,246,.98)','rgba(255,52,88,.08)',.98);drawPressureLocal(q.x,q.y,82,'#ff6684',G.frame*.07,.72);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.65;ctx.strokeStyle='#ff8da2';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q.x-p.vx*.22,q.y-p.vy*.22);ctx.lineTo(q.x+p.vx*.16,q.y+p.vy*.16);ctx.stroke();ctx.restore();
  }
  const oldDraw=window.drawFighter;
  if(typeof oldDraw==='function')window.drawFighter=function(f){
    if(f&&f.id==='young_gojo'&&f.youngRedCounterHidden)return;
    if(f&&f.id==='young_gojo'&&f.youngRedCounterInverted){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(Number.isFinite(f.youngRedCounterAngle)?f.youngRedCounterAngle:Math.PI);ctx.translate(-f.x,-f.y);oldDraw(f);ctx.restore();return;}
    oldDraw(f);
  };
  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){oldRender();if(G.mode!=='menu')drawProjectile();};
  const oldStep=window.step;
  if(typeof oldStep==='function')window.step=function(){updateProjectile();oldStep();};
  window.JFF_V25_RED_VISUAL=true;
})();