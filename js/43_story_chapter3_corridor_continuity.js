'use strict';
/* ===== CHAPTER 3 CORRIDOR CONTINUITY =====
   Reuses Chapter 2's actual corridor composition during every Chapter 3 stage.
   The scene's vanishing point and damage marks persist into the domain fight.
*/
(function(){
  if(window.__JFF_CH3_CORRIDOR_CONTINUITY_V1__)return;
  window.__JFF_CH3_CORRIDOR_CONTINUITY_V1__=true;
  const previousArena=window.drawArenaWorld;
  function drawChapter3Corridor(){
    ctx.save();
    const bg=ctx.createLinearGradient(0,-80,0,GROUND+250);
    bg.addColorStop(0,'#080b12');bg.addColorStop(.52,'#171b24');bg.addColorStop(1,'#080a10');
    ctx.fillStyle=bg;ctx.fillRect(-500,-100,ARENA_W+1000,GROUND+430);
    ctx.fillStyle='#10141c';ctx.beginPath();
    ctx.moveTo(-500,-100);ctx.lineTo(570,120);ctx.lineTo(1870,120);ctx.lineTo(ARENA_W+600,-100);ctx.closePath();ctx.fill();
    const left=ctx.createLinearGradient(250,0,1140,0);
    left.addColorStop(0,'#242a34');left.addColorStop(.54,'#3a4048');left.addColorStop(1,'#202630');
    ctx.fillStyle=left;ctx.beginPath();ctx.moveTo(160,GROUND+15);ctx.lineTo(610,GROUND+15);ctx.lineTo(1120,126);ctx.lineTo(560,126);ctx.closePath();ctx.fill();
    const right=ctx.createLinearGradient(1280,0,2260,0);
    right.addColorStop(0,'#262c36');right.addColorStop(.56,'#353b45');right.addColorStop(1,'#181d26');
    ctx.fillStyle=right;ctx.beginPath();ctx.moveTo(1870,GROUND+15);ctx.lineTo(2300,GROUND+15);ctx.lineTo(1900,126);ctx.lineTo(1280,126);ctx.closePath();ctx.fill();
    const floor=ctx.createLinearGradient(0,130,0,GROUND+300);
    floor.addColorStop(0,'#262b35');floor.addColorStop(.45,'#161b24');floor.addColorStop(1,'#080b11');
    ctx.fillStyle=floor;ctx.beginPath();ctx.moveTo(1120,126);ctx.lineTo(1280,126);ctx.lineTo(2300,GROUND+350);ctx.lineTo(160,GROUND+350);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(174,187,207,.18)';ctx.lineWidth=2;
    for(let k=0;k<10;k++){
      const v=k/10;ctx.beginPath();ctx.moveTo(1200,130);
      ctx.lineTo(-380+v*350,GROUND+270);ctx.moveTo(1200,130);ctx.lineTo(1660+v*370,GROUND+270);ctx.stroke();
    }
    for(let k=0;k<9;k++){
      const yy=150+k*k*4.3;ctx.beginPath();ctx.moveTo(580-(yy-130)*1.6,yy);ctx.lineTo(1880+(yy-130)*1.6,yy);ctx.stroke();
    }
    ctx.strokeStyle='rgba(180,191,207,.34)';ctx.lineWidth=3;
    for(let k=0;k<4;k++){
      const d=640+k*118,top=175+k*15,ww=68-k*7,hh=225-k*17;
      ctx.fillStyle='rgba(5,8,14,.42)';ctx.fillRect(d,top,ww,hh);ctx.strokeRect(d,top,ww,hh);
      ctx.beginPath();ctx.moveTo(d+ww*.5,top);ctx.lineTo(d+ww*.5,top+hh);ctx.stroke();
    }
    for(let k=0;k<4;k++){
      const d=1630+k*128,top=175+k*14,ww=64-k*6,hh=224-k*17;
      ctx.fillStyle='rgba(5,8,14,.42)';ctx.fillRect(d,top,ww,hh);ctx.strokeRect(d,top,ww,hh);
    }
    ctx.fillStyle='rgba(220,234,250,.30)';
    for(let k=0;k<5;k++){
      const xx=1040+k*74;ctx.fillRect(xx,118,30,4);
      ctx.fillStyle='rgba(220,234,250,.10)';ctx.beginPath();ctx.ellipse(xx+15,126,34,9,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(220,234,250,.30)';
    }
    ctx.fillStyle='#303640';ctx.strokeStyle='rgba(195,205,222,.48)';ctx.lineWidth=3;
    ctx.fillRect(584,118,78,GROUND-118);ctx.strokeRect(584,118,78,GROUND-118);
    ctx.strokeStyle='rgba(12,15,22,.75)';ctx.lineWidth=2;
    for(let k=0;k<5;k++){const yy=190+k*58;ctx.beginPath();ctx.moveTo(590,yy);ctx.lineTo(655,yy-11);ctx.stroke();}
    /* Persistent damage from Sukuna's World-Cutting Slash in Chapter 2. */
    ctx.save();ctx.globalAlpha=.9;ctx.strokeStyle='rgba(7,9,14,.97)';ctx.lineWidth=3;ctx.beginPath();
    ctx.moveTo(645,GROUND-125);ctx.lineTo(616,GROUND-149);ctx.lineTo(599,GROUND-142);ctx.lineTo(589,GROUND-172);
    ctx.moveTo(645,GROUND-125);ctx.lineTo(668,GROUND-151);ctx.lineTo(655,GROUND-173);ctx.lineTo(680,GROUND-189);
    ctx.moveTo(645,GROUND-125);ctx.lineTo(634,GROUND-100);ctx.lineTo(613,GROUND-88);
    ctx.moveTo(645,GROUND-125);ctx.lineTo(670,GROUND-105);ctx.lineTo(680,GROUND-78);ctx.stroke();ctx.restore();
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.24;ctx.strokeStyle='#ff3048';ctx.lineWidth=3;
    for(let k=0;k<4;k++){const xx=790+k*195;ctx.beginPath();ctx.moveTo(xx,GROUND-10);ctx.lineTo(xx+70,GROUND-28);ctx.lineTo(xx+138,GROUND-25);ctx.stroke();}
    ctx.restore();
    /* Rubble stays deterministic and cheap for the older PCs this game targets. */
    ctx.fillStyle='rgba(7,9,14,.72)';
    for(let k=0;k<22;k++){
      const x=360+k*89,y=GROUND+5+(k%4)*7,w=12+(k%4)*5,h=4+(k%3)*3;
      ctx.save();ctx.translate(x,y);ctx.rotate((k%2?1:-1)*.12);ctx.fillRect(-w/2,-h/2,w,h);ctx.restore();
    }
    ctx.restore();
  }
  window.drawArenaWorld=function(){
    if(G.mode==='story'&&G.story&&G.story.chapter===3&&G.story3&&G.story3.active){
      drawChapter3Corridor();return;
    }
    if(typeof previousArena==='function')return previousArena.apply(this,arguments);
  };
  console.info('[JFF Chapter 3] Shared Chapter 2 corridor loaded.');
})();