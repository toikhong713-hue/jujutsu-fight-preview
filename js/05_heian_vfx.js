'use strict';
/* ====== HEIAN SUKUNA VFX ====== */
function vfxHeianWCSCharge(cx,cy,tt){
  if(tt < 0.30){
    if(G.frame % 5 === 0){
      const a = Math.random()*6.28;
      const r = rnd(60,110);
      const p = pget();
      p.active=true;
      p.x = cx + Math.cos(a)*r;
      p.y = cy + Math.sin(a)*r*0.7;
      p.vx = -Math.cos(a)*rnd(1.2,2.4);
      p.vy = -Math.sin(a)*rnd(1.2,2.4);
      p.maxLife = p.life = rnd(20,34);
      p.size = rnd(1.5,3);
      p.color = Math.random()<0.5?'#ff5566':'#ff3344';
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
    if(G.frame % 8 === 0){
      const p = pget();
      p.active=true;
      p.x = cx + rnd(-8,8);
      p.y = cy + rnd(-8,8);
      p.vx = 0; p.vy = 0;
      p.maxLife = p.life = rnd(10,18);
      p.size = 4;
      p.color = 'rgba(255,60,90,0.55)';
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
  } else if(tt < 0.60){
    const t = (tt-0.30)/0.30;
    if(G.frame % 2 === 0){
      for(let i=0;i<2;i++){
        const a = Math.random()*6.28;
        const r = rnd(20,55)*(1-t*0.4);
        const p = pget();
        p.active=true;
        p.x = cx + Math.cos(a)*r;
        p.y = cy + Math.sin(a)*r*0.75;
        p.vx = -Math.cos(a)*rnd(3,5.5);
        p.vy = -Math.sin(a)*rnd(3,5.5);
        p.maxLife = p.life = rnd(10,20);
        p.size = rnd(2,4);
        p.color = Math.random()<0.5?'#ffffff':'#ff5566';
        p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
      }
    }
    if(G.frame % 4 === 0){
      const p = pget();
      p.active=true;
      p.x = cx + rnd(-6,6);
      p.y = cy + rnd(-6,6);
      p.vx = 0; p.vy = 0;
      p.maxLife = p.life = rnd(6,12);
      p.size = 6 + t*10;
      p.color = 'rgba(255,70,100,0.75)';
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
  } else {
    const t = (tt-0.60)/0.40;
    if(G.frame % 3 === 0){
      const n = 5;
      for(let k=0;k<n;k++){
        const ang = (k/n)*Math.PI*2 + G.frame*0.025;
        const r0 = rnd(25,55)*(0.6+t*0.6);
        const r1 = r0 + rnd(50,110)*(0.4+t*0.9);
        const px0 = cx + Math.cos(ang)*r0;
        const py0 = cy + Math.sin(ang)*r0*0.75;
        const px1 = cx + Math.cos(ang)*r1;
        const py1 = cy + Math.sin(ang)*r1*0.75;
        const p = pget();
        p.active=true;
        p.x = px1; p.y = py1;
        p.vx = (px1-px0)*0.10;
        p.vy = (py1-py0)*0.10;
        p.maxLife = p.life = rnd(10,18);
        p.size = rnd(3,6);
        p.color = Math.random()<0.4?'#ffffff':(Math.random()<0.75?'#ff5566':'#aa1524');
        p.grav=0;
        p.shape='bolt';
        p.rot = ang;
        p.vr=0; p.add=true;
      }
    }
    if(G.frame % 3 === 0){
      const p = pget();
      p.active=true;
      p.x = cx + rnd(-4,4);
      p.y = cy + rnd(-4,4);
      p.vx = 0; p.vy = 0;
      p.maxLife = p.life = rnd(6,12);
      p.size = 8 + t*14;
      p.color = 'rgba(255,220,240,0.85)';
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
  }
  if(G.frame % 6 === 0){
    const p = pget();
    p.active=true;
    const a = Math.random()*6.28;
    const r = rnd(80,140);
    p.x = cx + Math.cos(a)*r;
    p.y = cy + Math.sin(a)*r*0.7;
    p.vx = -Math.cos(a)*rnd(1.4,2.4);
    p.vy = -Math.sin(a)*rnd(1.4,2.4);
    p.maxLife = p.life = rnd(16,28);
    p.size = rnd(1.5,3.5);
    p.color = Math.random()<0.5?'#ff4455':'#ff8899';
    p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
  }
}
function vfxHeianWCSRelease(cx,cy,facing){
  flash(0.55,'#ff4455');
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  ctx.lineCap='round';
  const H = 200;
  ctx.strokeStyle='rgba(255,60,90,0.85)';
  ctx.lineWidth=6;
  ctx.beginPath();ctx.moveTo(cx-H,cy);ctx.lineTo(cx+H,cy);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.95)';
  ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx-H,cy);ctx.lineTo(cx+H,cy);ctx.stroke();
  const V = 120;
  ctx.strokeStyle='rgba(255,80,110,0.65)';
  ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(cx,cy-V);ctx.lineTo(cx,cy+V);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.8)';
  ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(cx,cy-V);ctx.lineTo(cx,cy+V);ctx.stroke();
  ctx.restore();
  const n=6;
  for(let k=0;k<n;k++){
    const ang=(k/n)*Math.PI*2 + 0.15;
    const len=rnd(90,160);
    const ex=cx+Math.cos(ang)*len;
    const ey=cy+Math.sin(ang)*len*0.85;
    vfxSlashTrail(cx,cy,ex,ey,'#ff5566',5,22);
    vfxSlashTrail(cx,cy,ex,ey,'#ffffff',2,16);
  }
  vfxShockwave(cx,cy,'#ff3344',120,30);
  vfxShockwave(cx,cy,'#ffffff',80,24);
}
function spawnWCSScar(x,y,facing){
  G.wcsScars.push({x, y, facing, t: 0, maxT: 44});
}
function updateWCSScars(){
  for(let i=G.wcsScars.length-1;i>=0;i--){
    const s=G.wcsScars[i];
    s.t++;
    if(s.t>=s.maxT)G.wcsScars.splice(i,1);
  }
}
function drawWCSScars(){
  for(const s of G.wcsScars){
    const prog=s.t/s.maxT;
    const alpha=Math.max(0,1-prog*1.1);
    if(alpha<=0.01) continue;
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=alpha;
    const len=260;
    ctx.lineCap='round';
    const outer=1-prog*1.4;
    if(outer>0){
      ctx.strokeStyle='rgba(255,50,80,'+(alpha*0.55*outer)+')';
      ctx.lineWidth=8;
      ctx.beginPath();
      ctx.moveTo(s.x-len,s.y);
      ctx.lineTo(s.x+len,s.y);
      ctx.stroke();
    }
    ctx.strokeStyle='rgba(255,90,120,'+(alpha*0.7)+')';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(s.x-len,s.y);
    ctx.lineTo(s.x+len,s.y);
    ctx.stroke();
    const core=prog<0.25?1:(1-(prog-0.25)/0.75);
    ctx.strokeStyle='rgba(255,255,255,'+(alpha*core)+')';
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(s.x-len,s.y);
    ctx.lineTo(s.x+len,s.y);
    ctx.stroke();
    ctx.restore();
    if(s.t<22 && s.t%3===0){
      const a=Math.random()*6.28;
      const r=rnd(20,80);
      const p=pget();
      p.active=true;
      p.x=s.x+Math.cos(a)*r;
      p.y=s.y+Math.sin(a)*r*0.5;
      p.vx=Math.cos(a)*rnd(0.4,1.4);
      p.vy=Math.sin(a)*rnd(0.4,1.4)-0.5;
      p.maxLife=p.life=rnd(14,26);
      p.size=rnd(1.5,3);
      p.color=Math.random()<0.5?'#ffffff':'#ff5566';
      p.grav=0;p.shape='bolt';p.rot=a;p.vr=0;p.add=true;
    }
  }
}
function vfxHeianFourArmPunch(f,facing){
  const bx=f.x,by=f.y;
  const pts=[
    {ox:60,oy:-118},{ox:60,oy:-102},{ox:60,oy:-84},{ox:60,oy:-68}
  ];
  for(let i=0;i<pts.length;i++){
    const px=bx+facing*pts[i].ox, py=by+pts[i].oy;
    spark(px,py,4,'#ff4455',4,5,12,0.1);
    ring(px,py,'#ff5566',18,10);
    vfxSlashTrail(bx+facing*20,by+pts[i].oy,px,py,'#ff3344',4,10);
  }
}
function vfxHeianHeavySmash(f,facing){
  const bx=f.x+facing*70, by=f.y-92;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  const sg=ctx.createRadialGradient(bx,by,10,bx,by,150);
  sg.addColorStop(0,'rgba(255,255,255,0.95)');
  sg.addColorStop(0.3,'rgba(255,90,110,0.85)');
  sg.addColorStop(0.7,'rgba(255,20,60,0.45)');
  sg.addColorStop(1,'rgba(120,0,20,0)');
  ctx.fillStyle=sg;
  ctx.beginPath();ctx.arc(bx,by,150,0,6.29);ctx.fill();
  ctx.strokeStyle='rgba(255,60,90,0.85)';ctx.lineWidth=6;
  ctx.beginPath();ctx.arc(bx,by,132,0,6.29);ctx.stroke();
  ctx.strokeStyle='rgba(255,180,200,0.55)';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(bx,by,150,0,6.29);ctx.stroke();
  ctx.restore();
  for(let i=0;i<26;i++){
    const a=Math.random()*6.28;
    const sp=rnd(6,14);
    const p=pget();
    p.active=true;p.x=bx;p.y=by;
    p.vx=Math.cos(a)*sp;
    p.vy=Math.sin(a)*sp;
    p.maxLife=p.life=rnd(16,30);p.size=rnd(3,7);
    p.color=Math.random()<0.5?'#ff4455':'#ffffff';
    p.grav=0.05;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
  }
  vfxShockwave(bx,by,'#ff3344',170,40);
  vfxShockwave(bx,by,'#ffffff',110,32);
}
function vfxHeianDismantle(x,y,facing){
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  const size=90;
  const dir=facing;
  ctx.fillStyle='rgba(255,40,70,0.55)';
  ctx.beginPath();
  ctx.moveTo(x+dir*size,y);
  ctx.lineTo(x-dir*size*0.2,y-size*0.5);
  ctx.lineTo(x-dir*size*0.6,y-size*0.15);
  ctx.lineTo(x-dir*size*0.9,y-size*0.4);
  ctx.lineTo(x-dir*size*0.3,y+size*0.15);
  ctx.lineTo(x-dir*size*0.7,y+size*0.4);
  ctx.lineTo(x-dir*size*0.1,y+size*0.25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.9)';ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(x+dir*size*0.9,y);
  ctx.lineTo(x-dir*size*0.6,y+size*0.05);
  ctx.stroke();
  ctx.strokeStyle='rgba(255,80,110,0.85)';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(x+dir*size*0.9,y);
  ctx.lineTo(x-dir*size*0.2,y-size*0.5);
  ctx.moveTo(x+dir*size*0.9,y);
  ctx.lineTo(x-dir*size*0.2,y+size*0.5);
  ctx.stroke();
  ctx.restore();
  for(let i=0;i<12;i++){
    const p=pget();
    const a=Math.random()*6.28;
    p.active=true;p.x=x;p.y=y;
    p.vx=Math.cos(a)*rnd(3,7);p.vy=Math.sin(a)*rnd(3,7);
    p.maxLife=p.life=rnd(12,22);p.size=rnd(2,5);
    p.color=Math.random()<0.5?'#ff4455':'#ffffff';
    p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
  }
}
function vfxHeianCleave(f,facing){
  const bx=f.x+facing*80, by=f.y-92;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  const arcs=4;
  for(let k=0;k<arcs;k++){
    const arcR=90+k*45;
    const baseAng=-0.6+facing*0.2;
    ctx.strokeStyle=k===arcs-1?'rgba(255,60,90,0.95)':'rgba(255,100,130,0.7)';
    ctx.lineWidth=k===arcs-1?6:3.5;
    ctx.beginPath();
    ctx.arc(bx,by,arcR,baseAng,baseAng+facing*1.8,false);
    ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.75)';
    ctx.lineWidth=1.6;
    ctx.beginPath();
    ctx.arc(bx,by,arcR,baseAng,baseAng+facing*1.8,false);
    ctx.stroke();
  }
  const ix=bx+facing*40,iy=by;
  const ig=ctx.createRadialGradient(ix,iy,4,ix,iy,60);
  ig.addColorStop(0,'rgba(255,255,255,0.95)');
  ig.addColorStop(0.4,'rgba(255,90,120,0.8)');
  ig.addColorStop(1,'rgba(255,20,50,0)');
  ctx.fillStyle=ig;
  ctx.beginPath();ctx.arc(ix,iy,60,0,6.29);ctx.fill();
  ctx.restore();
  for(let i=0;i<16;i++){
    const a=Math.random()*6.28;
    const p=pget();
    p.active=true;p.x=ix;p.y=iy;
    p.vx=Math.cos(a)*rnd(4,10);p.vy=Math.sin(a)*rnd(4,10);
    p.maxLife=p.life=rnd(14,26);p.size=rnd(3,6);
    p.color=Math.random()<0.5?'#ff4455':'#ffffff';
    p.grav=0.05;p.shape='bolt';p.rot=a;p.vr=0;p.add=true;
  }
  vfxShockwave(ix,iy,'#ff3344',140,32);
}
/* =====================================================================
   THE STRONGEST OF TODAY — Character-specific VFX
   All colors use the character's cyan palette.
   ===================================================================== */
const STRONGEST_CYAN='#00e5ff';
const STRONGEST_CYAN_LT='#80f0ff';
const STRONGEST_WHITE='#ffffff';
function vfxStrongestSpatialRing(cx,cy,radius,life){
  ring(cx,cy,STRONGEST_CYAN,radius,life);
  ring(cx,cy,STRONGEST_CYAN_LT,radius*0.7,life);
}
function vfxStrongestPalmImpact(f){
  const cx=f.x+f.facing*70,cy=f.y-90;
  vfxShockwave(cx,cy,STRONGEST_CYAN,60,22);
  burst(cx,cy,18,STRONGEST_CYAN,8,10,26);
  burst(cx,cy,10,STRONGEST_WHITE,6,8,20);
  for(let i=0;i<10;i++){
    const a=Math.random()*6.28;
    const p=pget();
    p.active=true;p.x=cx;p.y=cy;
    p.vx=Math.cos(a)*rnd(3,8);p.vy=Math.sin(a)*rnd(3,8);
    p.maxLife=p.life=rnd(12,22);p.size=rnd(2,4);
    p.color=Math.random()<0.5?STRONGEST_CYAN:STRONGEST_WHITE;
    p.grav=0;p.shape='bolt';p.rot=a;p.vr=0;p.add=true;
  }
}
function vfxStrongestSpatialCharge(f,radius){
  const cx=f.x+f.facing*50,cy=f.y-90;
  for(let i=0;i<3;i++){
    const a=Math.random()*6.28;
    const r=radius*rnd(0.5,1.0);
    const p=pget();
    p.active=true;
    p.x=cx+Math.cos(a)*r;
    p.y=cy+Math.sin(a)*r*0.7;
    p.vx=-Math.cos(a)*rnd(2.2,4);
    p.vy=-Math.sin(a)*rnd(2.2,4);
    p.maxLife=p.life=rnd(14,24);
    p.size=rnd(2,4);
    p.color=Math.random()<0.5?STRONGEST_CYAN:STRONGEST_CYAN_LT;
    p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
  }
}
function drawStrongestPurpleProjectile(p,chant){
  const dir=Math.sign(p.vx)||1;
  const L=chant?58:44;
  const Wd=chant?30:22;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  const gOuter=ctx.createRadialGradient(0,0,6,0,0,Wd*2.8);
  gOuter.addColorStop(0,'rgba(160,80,255,0.85)');
  gOuter.addColorStop(0.4,'rgba(100,30,180,0.5)');
  gOuter.addColorStop(1,'rgba(40,0,80,0)');
  ctx.fillStyle=gOuter;
  ctx.beginPath();ctx.ellipse(-dir*4,0,L*1.3,Wd*2.2,0,0,6.29);ctx.fill();
  const gBody=ctx.createRadialGradient(dir*L*0.3,0,4,dir*L*0.2,0,L*0.9);
  gBody.addColorStop(0,'rgba(255,255,255,1)');
  gBody.addColorStop(0.25,'rgba(240,220,255,0.95)');
  gBody.addColorStop(0.6,'rgba(200,120,255,0.85)');
  gBody.addColorStop(1,'rgba(90,20,180,0)');
  ctx.fillStyle=gBody;
  ctx.beginPath();ctx.ellipse(dir*L*0.15,0,L*0.85,Wd*0.85,0,0,6.29);ctx.fill();
  const gCore=ctx.createRadialGradient(dir*L*0.25,0,1,dir*L*0.25,0,L*0.4);
  gCore.addColorStop(0,'#ffffff');
  gCore.addColorStop(0.6,'rgba(255,220,255,0.9)');
  gCore.addColorStop(1,'rgba(200,120,255,0)');
  ctx.fillStyle=gCore;
  ctx.beginPath();ctx.arc(dir*L*0.25,0,L*0.4,0,6.29);ctx.fill();
  ctx.restore();
}
/* =====================================================================
   KAMUTOKE / HITEN / FUGA — unchanged
   ===================================================================== */
function drawKamutokeWeapon(cx, cy, angleRad, facing, glow, opacity){
  if(opacity <= 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);
  if(facing < 0) ctx.scale(-1, 1);
  ctx.globalAlpha = opacity;
  const bodyLen = 30;
  const bodyW = 7;
  ctx.fillStyle = '#1a1418';
  ctx.fillRect(-bodyLen*0.5, -bodyW*0.5, bodyLen, bodyW);
  ctx.fillStyle = '#b08848';
  ctx.fillRect(-bodyLen*0.58, -bodyW*0.7, bodyLen*0.16, bodyW*1.4);
  ctx.fillRect(-bodyLen*0.12, -bodyW*0.75, bodyLen*0.24, bodyW*1.5);
  ctx.fillRect(bodyLen*0.42, -bodyW*0.7, bodyLen*0.16, bodyW*1.4);
  ctx.strokeStyle = '#c9a050';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, 0.55, 0, 6.29); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, -0.55, 0, 6.29); ctx.stroke();
  ctx.strokeStyle = 'rgba(240,200,120,0.6)';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, 0.55, 0, 6.29); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 11, 5, -0.55, 0, 6.29); ctx.stroke();
  ctx.fillStyle = '#2a2028';
  ctx.beginPath();
  ctx.moveTo(bodyLen*0.55, -2.2);
  ctx.lineTo(bodyLen*0.90, 0);
  ctx.lineTo(bodyLen*0.55, 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d8c088';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(bodyLen*0.55, 0);
  ctx.lineTo(bodyLen*0.90, 0);
  ctx.stroke();
  ctx.fillStyle = '#2a2028';
  ctx.beginPath();
  ctx.moveTo(-bodyLen*0.55, -2.2);
  ctx.lineTo(-bodyLen*0.90, 0);
  ctx.lineTo(-bodyLen*0.55, 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d8c088';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-bodyLen*0.55, 0);
  ctx.lineTo(-bodyLen*0.90, 0);
  ctx.stroke();
  if(glow > 0){
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 48);
    const a = Math.min(1, glow);
    g.addColorStop(0, 'rgba(255,255,220,'+(a*0.9)+')');
    g.addColorStop(0.35, 'rgba(255,220,80,'+(a*0.6)+')');
    g.addColorStop(1, 'rgba(255,160,20,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, 48, 0, 6.29); ctx.fill();
    if(glow > 0.3){
      ctx.strokeStyle = 'rgba(255,220,120,'+(a*0.85)+')';
      ctx.lineWidth = 1.4;
      for(let k=0; k<3; k++){
        ctx.beginPath();
        let x = -bodyLen*0.5, y = 0;
        ctx.moveTo(x, y);
        for(let s=0; s<4; s++){
          x += 8;
          y = Math.sin((G.frame*0.3) + s*1.7 + k)*8 + (Math.random()-0.5)*6;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}
function drawKamutokeInHand(f, P, fd){
  const mf = f.moveFrame;
  const bx = f.x, by = f.y;
  const wx = lx => bx + lx*fd;
  const wy = ly => by + ly;
  const shPt = {x: wx(P.lean*0.28), y: wy(P.shY)};
  const ef = joint(shPt, P.armF[0], 20);
  const hf = joint(ef, P.armF[0]+P.armF[1], 20);
  let glow = 0;
  if(mf >= 10 && mf <= 24) glow = ((mf-9)/15) * 0.35;
  else if(mf >= 25 && mf <= 48) glow = 0.35 + ((mf-24)/24) * 0.65;
  else if(mf >= 49 && mf <= 64) glow = 1.0;
  else if(mf >= 65 && mf <= 79) glow = 1.0 - ((mf-64)/15) * 0.55;
  else if(mf >= 80 && mf <= 109) glow = 0.45 - ((mf-79)/30) * 0.45;
  let op = 1;
  if(mf < 10) op = 0;
  else if(mf <= 24) op = (mf - 9) / 15;
  else if(mf >= 110 && mf <= 121) op = 1 - ((mf - 109) / 12);
  else if(mf > 121) op = 0;
  const handAng = (P.armF[0] + P.armF[1]) * D2R;
  const wcx = hf.x + Math.cos(handAng) * 6;
  const wcy = hf.y + Math.sin(handAng) * 6;
  drawKamutokeWeapon(wcx, wcy, handAng, fd, glow, op);
}
function updateKamutokePeriods(f){
  const mf = f.moveFrame;
  const dir = f.facing;
  const oppX = f.opp ? f.opp.x : f.x + dir*180;
  if(mf >= 1 && mf <= 9){
    if(mf === 1){
      for(let i=0;i<3;i++){
        const p = pget();
        const a = Math.random()*6.28;
        p.active = true;
        p.x = f.x + dir*30 + Math.cos(a)*10;
        p.y = f.y - 90 + Math.sin(a)*10;
        p.vx = Math.cos(a)*1.2; p.vy = Math.sin(a)*1.2 - 1;
        p.maxLife = p.life = rnd(14,22);
        p.size = rnd(1.5,3);
        p.color = i%2 ? '#ffe066' : '#ffffff';
        p.grav = 0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
      }
    }
    if(mf % 3 === 0){
      const p = pget();
      p.active = true;
      p.x = f.x + dir*24; p.y = f.y - 92;
      p.vx = dir*rnd(0.4,1.2); p.vy = rnd(-1.2,0.4);
      p.maxLife = p.life = rnd(10,18);
      p.size = rnd(1.5,2.6);
      p.color = Math.random()<0.5?'#ffd166':'#fff2a8';
      p.grav = 0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
  }
  else if(mf >= 10 && mf <= 24){
    if(mf === 10){ SFX.heiankamutokesummon(); flash(0.18,'#ffe066'); }
    if(mf % 2 === 0){
      const p = pget();
      const ang = Math.random()*6.28;
      const r = rnd(40,80);
      p.active = true;
      p.x = f.x + dir*40 + Math.cos(ang)*r;
      p.y = f.y - 90 + Math.sin(ang)*r;
      p.vx = -Math.cos(ang)*2.2;
      p.vy = -Math.sin(ang)*2.2;
      p.maxLife = p.life = rnd(14,24);
      p.size = rnd(2,3.6);
      p.color = Math.random()<0.5?'#ffe066':'#fff6c2';
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
    if(mf % 4 === 0){
      const ax = f.x + dir*40;
      const ay = f.y - 90;
      for(let i=0;i<3;i++){
        const p = pget();
        const a = Math.random()*6.28;
        p.active = true;
        p.x = ax + Math.cos(a)*10;
        p.y = ay + Math.sin(a)*10;
        p.vx = Math.cos(a)*rnd(2,4);
        p.vy = Math.sin(a)*rnd(2,4);
        p.maxLife = p.life = rnd(8,16);
        p.size = rnd(2,4);
        p.color = '#fff2a8';
        p.grav=0; p.shape='bolt'; p.rot=a; p.vr=0; p.add=true;
      }
    }
  }
  else if(mf >= 25 && mf <= 48){
    if(mf === 25) SFX.heiankamutokecharge();
    const t = (mf - 25) / 23;
    const sparkCount = 1 + Math.floor(t*3);
    for(let i=0;i<sparkCount;i++){
      const p = pget();
      const a = Math.random()*6.28;
      const r = rnd(30,60);
      p.active = true;
      p.x = f.x + dir*40 + Math.cos(a)*r;
      p.y = f.y - 90 + Math.sin(a)*r*0.75;
      p.vx = -Math.cos(a)*rnd(2,4);
      p.vy = -Math.sin(a)*rnd(2,4) - rnd(0.5,1.5);
      p.maxLife = p.life = rnd(12,22);
      p.size = rnd(2,4);
      p.color = Math.random()<0.4?'#ffffff':(Math.random()<0.6?'#ffe066':'#fff2a8');
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
    const arcChance = 3 - Math.floor(t*2);
    if(mf % arcChance === 0){
      const ax = f.x + dir*40;
      const ay = f.y - 90;
      for(let i=0;i<2;i++){
        const p = pget();
        const a = Math.random()*6.28;
        const len = rnd(20,50) * (0.5 + t);
        p.active = true;
        p.x = ax + Math.cos(a)*len*0.5;
        p.y = ay + Math.sin(a)*len*0.5;
        p.vx = Math.cos(a)*rnd(3,6);
        p.vy = Math.sin(a)*rnd(3,6);
        p.maxLife = p.life = rnd(8,16);
        p.size = rnd(3,5);
        p.color = Math.random()<0.4?'#ffffff':'#ffe066';
        p.grav=0; p.shape='bolt'; p.rot=a; p.vr=0; p.add=true;
      }
    }
    if(mf === 48){
      flash(0.28,'#ffe066');
      vfxShockwave(f.x + dir*40, f.y - 90, '#ffe066', 60, 18);
    }
  }
  else if(mf >= 49 && mf <= 57){
    if(mf === 49){
      ring(oppX, f.opp ? f.opp.y - 170 : f.y - 170, '#ffe066', 20, 22);
    }
    if(mf % 2 === 0){
      const p = pget();
      p.active = true;
      p.x = oppX + rnd(-20,20);
      p.y = (f.opp?f.opp.y:f.y) - 150 + rnd(-10,10);
      p.vx = rnd(-1,1); p.vy = rnd(0.5,1.8);
      p.maxLife = p.life = rnd(10,20);
      p.size = rnd(2,3.5);
      p.color = '#ffe066';
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
  }
  else if(mf >= 58 && mf <= 64){
    if(mf === 58){
      SFX.heiankamutokestrike();
      flash(0.9,'#ffffff');
      shake(22); camPunch(0.32);
      G.hitstop = Math.max(G.hitstop, 6);
    }
    const sx = oppX;
    const sy = (f.opp?f.opp.y:f.y);
    const boltTop = sy - 520;
    const boltBottom = sy;
    const fade = 1 - (mf-58)/7;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,255,255,'+fade+')';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    let px = sx, py = boltTop;
    ctx.moveTo(px, py);
    const segments = 7;
    for(let s=1; s<=segments; s++){
      const t = s/segments;
      const jitter = (1 - t) * 40;
      px = sx + (Math.random()-0.5)*jitter;
      py = boltTop + (boltBottom - boltTop)*t;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,220,80,'+(fade*0.8)+')';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.moveTo(sx, boltTop);
    for(let s=1; s<=segments; s++){
      const t = s/segments;
      const jitter = (1 - t) * 50;
      px = sx + (Math.random()-0.5)*jitter;
      py = boltTop + (boltBottom - boltTop)*t;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,240,180,'+(fade*0.8)+')';
    ctx.lineWidth = 3;
    for(let b=0; b<5; b++){
      ctx.beginPath();
      let bx2 = sx, by2 = boltTop + (b/5)*(boltBottom - boltTop);
      ctx.moveTo(bx2, by2);
      for(let s=0; s<3; s++){
        bx2 += rnd(-30,30);
        by2 += rnd(20,60);
        ctx.lineTo(bx2, by2);
      }
      ctx.stroke();
    }
    ctx.restore();
    for(let i=0;i<6;i++){
      const p = pget();
      const a = Math.random()*6.28;
      p.active = true;
      p.x = sx + rnd(-30,30);
      p.y = sy - rnd(0,200);
      p.vx = Math.cos(a)*rnd(3,7);
      p.vy = Math.sin(a)*rnd(3,7);
      p.maxLife = p.life = rnd(10,22);
      p.size = rnd(3,6);
      p.color = Math.random()<0.5?'#ffffff':'#ffe066';
      p.grav=0.2; p.shape='bolt'; p.rot=a; p.vr=0; p.add=true;
    }
    if(mf === 58 || mf === 59){
      ring(sx, GROUND, '#ffe066', 60, 24);
      for(let i=0;i<8;i++){
        const p = pget();
        const a = Math.random()*6.28;
        p.active = true;
        p.x = sx; p.y = GROUND;
        p.vx = Math.cos(a)*rnd(4,8);
        p.vy = -Math.abs(Math.sin(a))*rnd(3,6);
        p.maxLife = p.life = rnd(14,26);
        p.size = rnd(2,4.5);
        p.color = '#ffe066';
        p.grav=0.35; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
      }
    }
  }
  else if(mf >= 65 && mf <= 79){
    if(mf === 65){
      SFX.heiankamutokeimpact();
      flash(0.4,'#ffe066');
      shake(16); camPunch(0.22);
    }
    const sx = oppX;
    const sy = (f.opp?f.opp.y:f.y);
    if(mf % 2 === 0){
      for(let i=0;i<3;i++){
        const p = pget();
        const a = Math.random()*6.28;
        p.active = true;
        p.x = sx + rnd(-20,20);
        p.y = sy - rnd(20,80);
        p.vx = Math.cos(a)*rnd(2,6);
        p.vy = Math.sin(a)*rnd(2,6) - 1;
        p.maxLife = p.life = rnd(12,24);
        p.size = rnd(2,5);
        p.color = Math.random()<0.5?'#ffffff':'#ffe066';
        p.grav=0.15; p.shape='bolt'; p.rot=a; p.vr=rnd(-0.1,0.1); p.add=true;
      }
    }
  }
  else if(mf >= 80 && mf <= 109){
    const t = (mf-80)/29;
    if(mf % 4 === 0 && Math.random() < (1-t)){
      const p = pget();
      const sx = oppX;
      const sy = (f.opp?f.opp.y:f.y);
      p.active = true;
      p.x = sx + rnd(-30,30);
      p.y = sy - rnd(0,100);
      p.vx = rnd(-1,1); p.vy = -rnd(0.5,2);
      p.maxLife = p.life = rnd(14,26);
      p.size = rnd(1.8,3.2);
      p.color = Math.random()<0.5?'#ffe066':'#fff2a8';
      p.grav=0.05; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
  }
  else if(mf >= 110 && mf <= 121){
    if(mf % 5 === 0){
      const p = pget();
      p.active = true;
      p.x = f.x + dir*40 + rnd(-20,20);
      p.y = f.y - 90 + rnd(-20,20);
      p.vx = rnd(-0.8,0.8); p.vy = -rnd(0.3,1.2);
      p.maxLife = p.life = rnd(10,20);
      p.size = rnd(1.4,2.4);
      p.color = '#ffe066';
      p.grav=0.05; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
  }
}
function drawKamutokeLightning(f){
  if(!f||f.id!=='heian_sukuna'||f.moveKey!=='def'||f.state!=='ATTACK')return;
  const t=f.moveFrame||0;
  if(t<58||t>64||!f.opp)return;
  const target=f.opp;
  const sx=target.x, sy=target.y-2;
  const top=sy-470, bottom=sy-10;
  const fade=clamp(1-(t-58)/8,0,1);
  const seed=t*0.37;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
  const drawBolt=(width,color,alpha,phase)=>{
    ctx.strokeStyle=color;ctx.globalAlpha=alpha*fade;ctx.lineWidth=width;
    ctx.beginPath();ctx.moveTo(sx+Math.sin(seed+phase)*5,top);
    const count=10;
    for(let i=1;i<=count;i++){
      const q=i/count;
      const jitter=(1-q)*(25+8*Math.sin(seed*1.7+phase+i*1.8));
      const x=sx+Math.sin(seed+phase+i*2.15)*jitter;
      const y=top+(bottom-top)*q;
      ctx.lineTo(x,y);
    }
    ctx.stroke();
  };
  drawBolt(24,'#ffca38',0.20,0.1);
  drawBolt(10,'#ffe66a',0.70,1.2);
  drawBolt(3,'#ffffff',0.98,2.4);
  // Short branches keep the strike readable without flooding the screen with particles.
  for(let b=0;b<3;b++){
    const by=top+(bottom-top)*(0.32+b*0.2);
    const bx=sx+Math.sin(seed+b*2.1)*18;
    ctx.strokeStyle='#fff2a6';ctx.globalAlpha=0.78*fade;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+(b%2?1:-1)*(18+b*5),by+16+b*4);ctx.lineTo(bx+(b%2?1:-1)*(30+b*7),by+28+b*4);ctx.stroke();
  }
  ctx.restore();
}

function drawHitenWeapon(cx, cy, angleRad, facing, glow, clothPhase, opacity){
  if(opacity <= 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);
  if(facing < 0) ctx.scale(-1, 1);
  ctx.globalAlpha = opacity;
  const shaftLen = 240;
  const shaftW = 4.5;
  ctx.fillStyle = '#1a1208';
  ctx.fillRect(-shaftLen*0.15, -shaftW*0.5, shaftLen, shaftW);
  ctx.strokeStyle = 'rgba(70,50,25,0.7)';
  ctx.lineWidth = 0.8;
  for(let i=0; i<shaftLen; i+=18){
    ctx.beginPath();
    ctx.moveTo(-shaftLen*0.15 + i, -shaftW*0.5);
    ctx.lineTo(-shaftLen*0.15 + i + 3, shaftW*0.5);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(-shaftLen*0.1, -shaftW*0.65, 26, shaftW*1.3);
  ctx.strokeStyle = 'rgba(20,10,5,0.9)';
  ctx.lineWidth = 0.8;
  for(let i=0; i<26; i+=5){
    ctx.beginPath();
    ctx.moveTo(-shaftLen*0.1 + i, -shaftW*0.65);
    ctx.lineTo(-shaftLen*0.1 + i + 2, shaftW*0.65);
    ctx.stroke();
  }
  const headX = shaftLen - shaftLen*0.15;
  ctx.fillStyle = '#a88040';
  ctx.fillRect(headX - 22, -shaftW*0.85, 14, shaftW*1.7);
  ctx.fillRect(headX - 6, -shaftW*1.05, 8, shaftW*2.1);
  ctx.fillStyle = '#c8c8d0';
  ctx.beginPath();
  ctx.moveTo(headX - 2, -2.6);
  ctx.lineTo(headX + 46, 0);
  ctx.lineTo(headX - 2, 2.6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(headX - 2, 0);
  ctx.lineTo(headX + 46, 0);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(40,20,20,0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(headX - 2, -2.6);
  ctx.lineTo(headX - 2, 2.6);
  ctx.stroke();
  ctx.strokeStyle = '#b8b8c4';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(headX + 6, -2);
  ctx.quadraticCurveTo(headX + 26, -20, headX + 40, -26);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + 6, 2);
  ctx.quadraticCurveTo(headX + 26, 20, headX + 40, 26);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(headX + 6, -2);
  ctx.quadraticCurveTo(headX + 26, -20, headX + 40, -26);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + 6, 2);
  ctx.quadraticCurveTo(headX + 26, 20, headX + 40, 26);
  ctx.stroke();
  ctx.fillStyle = '#a88040';
  ctx.fillRect(headX - 2, -4.5, 4, 9);
  const cs = Math.sin(clothPhase) * 5;
  ctx.strokeStyle = '#e8e0d0';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(headX - 14, 3);
  ctx.quadraticCurveTo(headX - 20, 10 + cs, headX - 26, 18 + cs*1.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX - 14, -3);
  ctx.quadraticCurveTo(headX - 22, -8 - cs*0.6, headX - 30, -14 - cs);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(220,205,180,0.85)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(headX - 14, 2);
  ctx.quadraticCurveTo(headX - 18, 14 + cs*1.2, headX - 20, 24 + cs*1.6);
  ctx.stroke();
  if(glow > 0){
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(headX + 14, 0, 2, headX + 14, 0, 70);
    const a = Math.min(1, glow);
    g.addColorStop(0, 'rgba(255,120,140,'+(a*0.8)+')');
    g.addColorStop(0.4, 'rgba(180,20,50,'+(a*0.5)+')');
    g.addColorStop(1, 'rgba(80,0,20,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(headX + 14, 0, 70, 0, 6.29); ctx.fill();
    ctx.strokeStyle = 'rgba(255,60,90,'+(a*0.7)+')';
    ctx.lineWidth = 1.4;
    for(let k=0; k<3; k++){
      const phase = G.frame*0.15 + k*2.1;
      ctx.beginPath();
      ctx.moveTo(headX + 10, 0);
      ctx.quadraticCurveTo(
        headX + 20, Math.sin(phase)*10,
        headX + 32, Math.sin(phase+1)*14
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}
function getHitenSwingAngleDeg(mf){
  if(mf <= 8) return 50;
  if(mf <= 20){const t = (mf-8)/12;return 50 + 10 * Math.sin(t * Math.PI);}
  if(mf <= 36){const t = (mf-20)/16;const eased = t * t;return 55 - eased * 205;}
  if(mf <= 44){const t = (mf-36)/8;const eased = Math.pow(t, 0.55);return -150 + eased * 220;}
  if(mf <= 52){const t = (mf-44)/8;return 70 + 70 * Math.sin(t * Math.PI * 0.5);}
  if(mf <= 63){const t = (mf-52)/11;return 140 + 6 * Math.sin(t * Math.PI);}
  const t = Math.min(1, (mf-63)/18);
  return 145 - 95 * Math.sin(t * Math.PI * 0.5);
}
function drawHitenInHand(f, P, fd){
  const mf = f.moveFrame;
  const bx = f.x, by = f.y;
  const wx = lx => bx + lx*fd;
  const wy = ly => by + ly;
  const shPt = {x: wx(P.lean*0.28), y: wy(P.shY)};
  const ef = joint(shPt, P.armF[0], 20);
  const hf = joint(ef, P.armF[0]+P.armF[1], 20);
  let glow = 0;
  if(mf >= 9 && mf <= 20) glow = 0.15;
  else if(mf >= 21 && mf <= 36) glow = 0.15 + ((mf-20)/16) * 0.75;
  else if(mf >= 37 && mf <= 52) glow = 1.0;
  else if(mf >= 53 && mf <= 63) glow = 1.0 - ((mf-52)/11) * 0.7;
  else if(mf >= 64 && mf <= 81) glow = 0.3 - ((mf-63)/18) * 0.3;
  else glow = 0;
  let op = 1;
  if(mf < 4) op = 0;
  else if(mf <= 8) op = (mf-3) / 5;
  else if(mf >= 76 && mf <= 81) op = 1 - ((mf-75) / 6);
  else if(mf > 81) op = 0;
  const swingDeg = getHitenSwingAngleDeg(mf);
  const handAng = swingDeg * D2R;
  const wcx = hf.x + Math.cos(handAng) * 6;
  const wcy = hf.y + Math.sin(handAng) * 6;
  drawHitenWeapon(wcx, wcy, handAng, fd, glow, f.animT*0.08, op);
}
function updateHitenPeriods(f){
  const mf = f.moveFrame;
  const dir = f.facing;
  if(mf >= 1 && mf <= 8){
    if(mf === 1){
      for(let i=0;i<3;i++){
        const p = pget();
        const a = Math.random()*6.28;
        p.active = true;
        p.x = f.x + Math.cos(a)*25;
        p.y = f.y - 80 + Math.sin(a)*20;
        p.vx = Math.cos(a)*rnd(0.4,1.0);
        p.vy = -rnd(0.4,1.4);
        p.maxLife = p.life = rnd(16,28);
        p.size = rnd(1.8,3.2);
        p.color = Math.random()<0.6?'#4a0a1a':'#8a1024';
        p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
      }
    }
  }
  else if(mf >= 9 && mf <= 20){
    if(mf === 9){ SFX.heianhitencharge(); }
    if(mf % 3 === 0){
      const p = pget();
      p.active = true;
      p.x = f.x + rnd(-20,20);
      p.y = f.y - 80 + rnd(-20,20);
      p.vx = rnd(-0.5,0.5);
      p.vy = -rnd(0.5,1.5);
      p.maxLife = p.life = rnd(14,26);
      p.size = rnd(1.6,2.8);
      p.color = '#6a0a1a';
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
  }
  else if(mf >= 21 && mf <= 36){
    if(mf === 21){ SFX.heianhitencharge(); }
    const t = (mf-21)/15;
    const handX = f.x + dir*30;
    const handY = f.y - 90;
    for(let i=0;i<3;i++){
      const a = Math.random()*6.28;
      const r = rnd(35,70) * (1 - t*0.5);
      const p = pget();
      p.active = true;
      p.x = handX + Math.cos(a)*r;
      p.y = handY + Math.sin(a)*r;
      p.vx = -Math.cos(a)*rnd(2,3.5);
      p.vy = -Math.sin(a)*rnd(2,3.5);
      p.maxLife = p.life = rnd(12,22);
      p.size = rnd(2,3.6);
      p.color = Math.random()<0.5?'#ff2040':'#8a1024';
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
    if(mf % 4 === 0){
      const p = pget();
      p.active = true;
      p.x = handX + rnd(-10,10); p.y = handY + rnd(-10,10);      p.vx = 0; p.vy = 0;
      p.maxLife = p.life = rnd(8,14);
      p.size = 5 + t*10;
      p.color = 'rgba(180,20,50,0.5)';
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
  }
  else if(mf >= 37 && mf <= 44){
    if(mf === 37){
      SFX.heianhitenrelease();
      shake(12); camPunch(0.20);
      G.hitstop = Math.max(G.hitstop, 4);
    }
    const t = (mf - 37) / 7;
    const angleRad = (-150 + 220 * Math.pow(t, 0.55)) * D2R;
    const handX = f.x + dir*20;
    const handY = f.y - 100;
    const tipR = 140;
    const tipX = handX + Math.cos(angleRad) * tipR * dir;
    const tipY = handY + Math.sin(angleRad) * tipR;
    for(let i=0;i<4;i++){
      const p = pget();
      p.active = true;
      p.x = tipX + rnd(-12,12);
      p.y = tipY + rnd(-12,12);
      p.vx = dir*rnd(1.5,4) + rnd(-1,1);
      p.vy = rnd(-2,2);
      p.maxLife = p.life = rnd(10,20);
      p.size = rnd(2,4);
      p.color = Math.random()<0.35?'#ffffff':(Math.random()<0.7?'#ff2040':'#8a1024');
      p.grav = 0;
      p.shape = 'bolt';
      p.rot = angleRad;
      p.vr = 0;
      p.add = true;
    }
  }
  else if(mf >= 45 && mf <= 52){
    const t = (mf - 45) / 7;
    const angleRad = (70 + 70 * Math.sin(t * Math.PI * 0.5)) * D2R;
    const handX = f.x + dir*20;
    const handY = f.y - 100;
    const tipR = 140;
    const tipX = handX + Math.cos(angleRad) * tipR * dir;
    const tipY = handY + Math.sin(angleRad) * tipR;
    for(let i=0;i<3;i++){
      const p = pget();
      p.active = true;
      p.x = tipX + rnd(-14,14);
      p.y = tipY + rnd(-14,14);
      p.vx = dir*rnd(1,3) + rnd(-1,1);
      p.vy = rnd(-1,2);
      p.maxLife = p.life = rnd(12,22);
      p.size = rnd(2,4);
      p.color = Math.random()<0.4?'#ffffff':(Math.random()<0.75?'#ff2040':'#8a1024');
      p.grav = 0;
      p.shape = 'bolt';
      p.rot = angleRad;
      p.vr = 0;
      p.add = true;
    }
  }
  else if(mf >= 53 && mf <= 63){
    if(mf === 53){
      SFX.heianhitenimpact();
      flash(0.4,'#ff2030');
      shake(16); camPunch(0.22);
      const hx = f.x + dir*110;
      const hy = f.y - 90;
      vfxShockwave(hx, hy, '#ff3344', 70, 22);
      vfxShockwave(hx, hy, '#ffffff', 40, 16);
      for(let i=0;i<14;i++){
        const a = Math.random()*6.28;
        const p = pget();
        p.active = true;
        p.x = hx; p.y = hy;
        p.vx = Math.cos(a)*rnd(4,9);
        p.vy = Math.sin(a)*rnd(4,9);
        p.maxLife = p.life = rnd(12,26);
        p.size = rnd(2,5);
        p.color = Math.random()<0.5?'#ff3355':'#ffffff';
        p.grav = 0.15;
        p.shape = 'bolt';
        p.rot = a;
        p.vr = 0;
        p.add = true;
      }
    }
  }
  else if(mf >= 64 && mf <= 81){
    if(mf % 6 === 0){
      const p = pget();
      p.active = true;
      p.x = f.x + rnd(-30,30);
      p.y = f.y - 90 + rnd(-20,20);
      p.vx = rnd(-0.5,0.5);
      p.vy = -rnd(0.3,1.2);
      p.maxLife = p.life = rnd(12,22);
      p.size = rnd(1.4,2.4);
      p.color = '#6a0a1a';
      p.grav=0; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
    }
  }
}
function drawHeianFugaProjectile(p){
  const dir=Math.sign(p.vx)||1;
  const L=70;
  const Wd=22;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  const gOuter=ctx.createRadialGradient(0,0,6,0,0,Wd*2.4);
  gOuter.addColorStop(0,'rgba(255,80,20,0.65)');
  gOuter.addColorStop(0.35,'rgba(180,20,10,0.42)');
  gOuter.addColorStop(1,'rgba(60,0,0,0)');
  ctx.fillStyle=gOuter;
  ctx.beginPath();ctx.ellipse(-dir*6,0,L*1.35,Wd*2.1,0,0,6.29);ctx.fill();
  const tailLen=110+Math.sin(p.t*0.5)*14;
  const gTail=ctx.createLinearGradient(-dir*L*0.7,0,-dir*(L*0.7+tailLen),0);
  gTail.addColorStop(0,'rgba(255,120,30,0.9)');
  gTail.addColorStop(0.4,'rgba(200,40,10,0.55)');
  gTail.addColorStop(1,'rgba(90,0,0,0)');
  ctx.fillStyle=gTail;
  ctx.beginPath();
  ctx.moveTo(-dir*L*0.7,-Wd*0.55);
  ctx.quadraticCurveTo(-dir*(L*0.7+tailLen*0.55),-Wd*0.85,-dir*(L*0.7+tailLen),0);
  ctx.quadraticCurveTo(-dir*(L*0.7+tailLen*0.55),Wd*0.85,-dir*L*0.7,Wd*0.55);
  ctx.closePath();ctx.fill();
  const gBody=ctx.createLinearGradient(dir*L,0,-dir*L*0.6,0);
  gBody.addColorStop(0,'rgba(255,140,40,0.95)');
  gBody.addColorStop(0.55,'rgba(255,80,20,0.95)');
  gBody.addColorStop(1,'rgba(170,20,10,0.9)');
  ctx.fillStyle=gBody;
  ctx.beginPath();
  ctx.moveTo(dir*L,0);
  ctx.quadraticCurveTo(dir*L*0.5,-Wd*0.75,0,-Wd*0.7);
  ctx.quadraticCurveTo(-dir*L*0.55,-Wd*0.55,-dir*L*0.7,-Wd*0.2);
  ctx.lineTo(-dir*L*0.7,Wd*0.2);
  ctx.quadraticCurveTo(-dir*L*0.55,Wd*0.55,0,Wd*0.7);
  ctx.quadraticCurveTo(dir*L*0.5,Wd*0.75,dir*L,0);
  ctx.closePath();ctx.fill();
  const gInner=ctx.createLinearGradient(dir*L*0.8,0,-dir*L*0.4,0);
  gInner.addColorStop(0,'rgba(255,230,110,0.98)');
  gInner.addColorStop(0.5,'rgba(255,200,60,0.95)');
  gInner.addColorStop(1,'rgba(255,140,30,0.85)');
  ctx.fillStyle=gInner;
  ctx.beginPath();
  ctx.moveTo(dir*L*0.85,0);
  ctx.quadraticCurveTo(dir*L*0.3,-Wd*0.45,0,-Wd*0.42);
  ctx.lineTo(-dir*L*0.35,-Wd*0.18);
  ctx.lineTo(-dir*L*0.35,Wd*0.18);
  ctx.lineTo(0,Wd*0.42);
  ctx.quadraticCurveTo(dir*L*0.3,Wd*0.45,dir*L*0.85,0);
  ctx.closePath();ctx.fill();
  const gCore=ctx.createRadialGradient(dir*L*0.25,0,2,dir*L*0.2,0,L*0.65);
  gCore.addColorStop(0,'rgba(255,255,255,1)');
  gCore.addColorStop(0.28,'rgba(255,255,230,0.98)');
  gCore.addColorStop(0.6,'rgba(255,220,120,0.75)');
  gCore.addColorStop(1,'rgba(255,150,30,0)');
  ctx.fillStyle=gCore;
  ctx.beginPath();ctx.ellipse(dir*L*0.22,0,L*0.62,Wd*0.5,0,0,6.29);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.98)';
  ctx.beginPath();
  ctx.moveTo(dir*(L+8),0);
  ctx.lineTo(dir*L*0.65,-5);
  ctx.lineTo(dir*L*0.65,5);
  ctx.closePath();ctx.fill();
  for(let k=0;k<6;k++){
    const phase=p.t*0.35+k*1.3;
    const tPos=(k/5-0.5)*L*1.6;
    const off=Math.sin(phase)*10;
    const size=6+Math.sin(phase*1.4)*3.5;
    const col=(k%3===0)?'#ffaa33':((k%3===1)?'#ff5522':'#aa1408');
    ctx.fillStyle=col;
    ctx.globalAlpha=0.55;
    ctx.beginPath();
    ctx.ellipse(tPos,off,size,size*1.5,0,0,6.29);
    ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.restore();
}
function vfxHeianFugaRelease(cx,cy,facing){
  flash(0.85,'#ffffff');
  vfxShockwave(cx,cy,'#ff5522',120,26);
  vfxShockwave(cx,cy,'#ffdd66',90,22);
  vfxShockwave(cx,cy,'#ffffff',60,18);
  burst(cx,cy,40,'#ff6633',13,15,34);
  burst(cx,cy,22,'#ffdd66',9,11,28);
  for(let i=0;i<22;i++){
    const a=facing>0?rnd(-0.7,0.7):(Math.PI+rnd(-0.7,0.7));
    const p=pget();
    p.active=true;p.x=cx;p.y=cy;
    p.vx=Math.cos(a)*rnd(8,18);p.vy=Math.sin(a)*rnd(8,18);
    p.maxLife=p.life=rnd(14,28);p.size=rnd(3,8);
    p.color=Math.random()<0.4?'#ffdd66':(Math.random()<0.7?'#ff5522':'#ffffff');
    p.grav=0.05;p.shape='bolt';p.rot=a;p.vr=0;p.add=true;
  }
}
function vfxHeianFugaImpact(x,y){
  vfxShockwave(x,y,'#ffffff',170,26);
  vfxShockwave(x,y,'#ffdd66',160,26);
  vfxShockwave(x,y,'#ff8833',200,32);
  G.heianFugaImpacts.push({
    x, y,
    t: 0,
    maxT: 110,
    seedA: Math.random()*100,
    seedB: Math.random()*100,
    seedC: Math.random()*100,
    targetH: 460,
    targetW: 130,
    smokeSeeds: Array.from({length:10},(_,i)=>({
      offX: (Math.random()-0.5)*1.5,
      delay: i*3 + Math.random()*10,
      rise: 0.9 + Math.random()*1.3,
      size: 55 + Math.random()*70,
      life: 70 + Math.random()*40,
      wob: Math.random()*6.28,
      wobV: 0.02 + Math.random()*0.03,
      dark: Math.random()<0.5
    }))
  });
  for(let i=0;i<26;i++){
    const a = rnd(-Math.PI*0.85,-Math.PI*0.15);
    const p = pget();
    p.active=true; p.x=x+rnd(-30,30); p.y=GROUND-rnd(0,25);
    p.vx=Math.cos(a)*rnd(4,14); p.vy=Math.sin(a)*rnd(4,14)-2;
    p.maxLife=p.life=rnd(20,44); p.size=rnd(2,6);
    p.color=Math.random()<0.4?'#ffffff':(Math.random()<0.7?'#ffdd66':'#ff8833');
    p.grav=0.20; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
  }
  for(let i=0;i<16;i++){
    const a = rnd(-Math.PI*0.9,-Math.PI*0.1);
    const p = pget();
    p.active=true; p.x=x+rnd(-40,40); p.y=GROUND-rnd(0,50);
    p.vx=Math.cos(a)*rnd(1,5); p.vy=Math.sin(a)*rnd(2,8)-1;
    p.maxLife=p.life=rnd(40,80); p.size=rnd(3,8);
    p.color=Math.random()<0.5?'rgba(35,22,15,0.7)':'rgba(60,35,22,0.65)';
    p.grav=-0.02; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
  }
  for(let i=0;i<16;i++){
    const dir = Math.random()<0.5?-1:1;
    const p = pget();
    p.active=true; p.x=x+dir*rnd(20,60); p.y=GROUND;
    p.vx=dir*rnd(4,10); p.vy=-rnd(0.5,3);
    p.maxLife=p.life=rnd(24,46); p.size=rnd(4,10);
    p.color='rgba(90,60,35,0.55)';
    p.grav=0.08; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
  }
}
function updateHeianFugaImpacts(){
  for(let i=G.heianFugaImpacts.length-1;i>=0;i--){
    const im=G.heianFugaImpacts[i];
    im.t++;
    const t=im.t;
    if(t<85){
      const inten = t<15 ? (t/15) : (1-(t-15)/70);
      const n = Math.floor(inten*5);
      for(let k=0;k<n;k++){
        const p=pget();
        p.active=true;
        p.x = im.x + rnd(-70,70);
        p.y = GROUND - rnd(0, im.targetH*0.9);
        p.vx = rnd(-1.5,1.5);
        p.vy = -rnd(3,9);
        p.maxLife=p.life=rnd(20,50);
        p.size = rnd(2,5);
        p.color = Math.random()<0.35?'#ffdd66':(Math.random()<0.7?'#ff8833':(Math.random()<0.9?'#ff3322':'#3a2015'));
        p.grav=-0.04; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
      }
    }
    if(t>10 && t<75 && Math.random()<0.22){
      const side = Math.random()<0.5?-1:1;
      const bx = im.x + side*rnd(30,80);
      const by = GROUND - rnd(10,60);
      const count = rint(3,6);
      for(let k=0;k<count;k++){
        const p=pget();
        p.active=true;
        p.x = bx; p.y = by;
        p.vx = rnd(-2,2) + side*rnd(1,4);
        p.vy = -rnd(5,12);
        p.maxLife=p.life=rnd(14,30);
        p.size = rnd(3,7);
        p.color = Math.random()<0.4?'#ff8833':(Math.random()<0.75?'#ff3322':'#8a1408');
        p.grav=0.06; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
      }
    }
    if(t<30 && t%3===0){
      for(let k=0;k<2;k++){
        const dir = Math.random()<0.5?-1:1;
        const p=pget();
        p.active=true;
        p.x = im.x + dir*rnd(30,90);
        p.y = GROUND - rnd(0,12);
        p.vx = dir*rnd(3,9);
        p.vy = -rnd(0.4,2.2);
        p.maxLife=p.life=rnd(24,50);
        p.size = rnd(5,12);
        p.color = Math.random()<0.5?'rgba(80,50,30,0.5)':'rgba(45,28,18,0.65)';
        p.grav=0.06; p.shape='circle'; p.rot=0; p.vr=0; p.add=true;
      }
    }
    if(t>=im.maxT) G.heianFugaImpacts.splice(i,1);
  }
}
function drawHeianFugaImpacts(){
  for(const im of G.heianFugaImpacts){
    const t=im.t, maxT=im.maxT, prog=t/maxT;
    let expand = 1;
    if(t<16) expand = easeOut(t/16);
    else if(prog>0.65) expand = 1-(prog-0.65)/0.35;
    expand = Math.max(0, expand);
    let alpha = 1;
    if(prog>0.55) alpha = 1-(prog-0.55)/0.45;
    alpha = Math.max(0, alpha);
    const cx = im.x;
    const baseY = GROUND;
    const H = im.targetH * expand;
    const W = im.targetW * expand;
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha = alpha;
    {
      const br = 150*expand;
      const bg = ctx.createRadialGradient(cx, baseY, 4, cx, baseY, br);
      bg.addColorStop(0,'rgba(255,255,240,0.98)');
      bg.addColorStop(0.22,'rgba(255,235,150,0.85)');
      bg.addColorStop(0.5,'rgba(255,150,50,0.55)');
      bg.addColorStop(1,'rgba(120,20,0,0)');
      ctx.fillStyle=bg;
      ctx.beginPath();
      ctx.ellipse(cx, baseY, br, br*0.36, 0, 0, 6.29);
      ctx.fill();
    }
    drawFugaColumn(cx, baseY, H*0.88, W*1.30, im.seedA+1, t, alpha*0.55, '#2a0202', '#4a0808', 'rgba(60,0,0,0)');
    drawFugaColumn(cx, baseY, H*0.94, W*1.10, im.seedB+2, t, alpha*0.75, '#7a1008', '#b81a05', 'rgba(80,0,0,0)');
    drawFugaColumn(cx, baseY, H*1.00, W*0.88, im.seedC+3, t, alpha*0.90, '#e83a08', '#ff6600', 'rgba(180,40,0,0)');
    drawFugaColumn(cx, baseY, H*1.02, W*0.62, im.seedA+4, t, alpha*0.95, '#ffaa22', '#ffd044', 'rgba(255,150,0,0)');
    drawFugaColumn(cx, baseY, H*1.05, W*0.36, im.seedB+5, t, alpha, '#ffeaa0', '#ffffff', 'rgba(255,220,120,0)');
    ctx.globalCompositeOperation='source-over';
    for(const s of im.smokeSeeds){
      const st = t - s.delay;
      if(st<=0) continue;
      const age = st/s.life;
      if(age>=1) continue;
      const sAlpha = (1-age) * 0.7 * alpha;
      const sSize = s.size * (0.6 + age*1.6);
      const rise = st * s.rise * 2.4;
      const wob = Math.sin(t*s.wobV + s.wob) * 18 * (0.3 + age);
      const sX = cx + s.offX*70 + wob;
      const sY = baseY - 90 - rise - age*sSize*0.6;
      const g = ctx.createRadialGradient(sX, sY, 2, sX, sY, sSize);
      if(s.dark){
        g.addColorStop(0,   `rgba(25,15,10,${sAlpha})`);
        g.addColorStop(0.5, `rgba(15,10,8,${sAlpha*0.6})`);
      } else {
        g.addColorStop(0,   `rgba(55,30,20,${sAlpha*0.85})`);
        g.addColorStop(0.5, `rgba(35,20,14,${sAlpha*0.5})`);
      }
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.arc(sX, sY, sSize, 0, 6.29);
      ctx.fill();
    }
    ctx.restore();
  }
}
function drawFugaColumn(cx,baseY,H,W,seed,t,alpha,c1,c2,c3){
  if(H<4 || W<2 || alpha<=0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const grad = ctx.createLinearGradient(cx, baseY, cx, baseY - H);
  grad.addColorStop(0,    c1);
  grad.addColorStop(0.30, c2);
  grad.addColorStop(0.72, c2);
  grad.addColorStop(1,    c3);
  ctx.fillStyle = grad;
  const steps = 14;
  ctx.beginPath();
  for(let i=0;i<=steps;i++){
    const p = i/steps;
    const y = baseY - H*p;
    const widthFactor = Math.pow(1-p, 0.85);
    const wob = 1 + (Math.sin(seed + i*0.8 + t*0.06)*0.35
                   + Math.sin(seed*1.7 + i*0.4 + t*0.11)*0.22);
    const x = cx - W*widthFactor*wob;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  for(let i=steps;i>=0;i--){
    const p = i/steps;
    const y = baseY - H*p;
    const widthFactor = Math.pow(1-p, 0.85);
    const wob = 1 + (Math.sin(seed + 40 + i*0.75 + t*0.055)*0.35
                   + Math.sin(seed*1.6 + i*0.42 + t*0.10)*0.22);
    const x = cx + W*widthFactor*wob;
    ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function updateHeianFugaPeriods(f){
  const mf=f.moveFrame;
  const dir=f.facing;
  const handX=f.x+dir*32;
  const handY=f.y-96;
  if(mf>=1&&mf<=11){
    if(mf%3===0){
      const a=Math.random()*6.28;
      const r=rnd(20,42);
      const p=pget();
      p.active=true;
      p.x=handX+Math.cos(a)*r;
      p.y=handY+Math.sin(a)*r*0.7;
      p.vx=rnd(-0.5,0.5);p.vy=-rnd(0.5,1.2);
      p.maxLife=p.life=rnd(16,28);p.size=rnd(1.5,2.8);
      p.color=Math.random()<0.5?'#ff4422':'#ff2211';
      p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
    }
  }
  else if(mf>=12&&mf<=26){
    if(mf===12){SFX.heianfugaIgnite();flash(0.22,'#ff5522');}
    const t=(mf-12)/14;
    const rBase=8+t*20;
    if(mf%2===0){
      const a=Math.random()*6.28;
      const r=rBase*rnd(0.7,1.2);
      const p=pget();
      p.active=true;
      p.x=handX+Math.cos(a)*r;
      p.y=handY+Math.sin(a)*r*0.75;
      p.vx=rnd(-1,1);p.vy=-rnd(1,2.5);
      p.maxLife=p.life=rnd(16,30);p.size=rnd(2,4.5);
      const palette=['#ff2211','#ff4422','#ff6633','#ffaa33'];
      p.color=palette[Math.floor(t*4)%4];
      p.grav=-0.02;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
    }
    if(mf%3===0){
      const p=pget();
      p.active=true;p.x=handX;p.y=handY;
      p.vx=rnd(-1.2,1.2);p.vy=-rnd(0.5,1.8);
      p.maxLife=p.life=rnd(14,22);p.size=rnd(3,6);
      p.color='#ff8833';
      p.grav=-0.03;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
    }
  }
  else if(mf>=27&&mf<=50){
    if(mf===27){SFX.heianfugaCharge();}
    const t=(mf-27)/23;
    for(let i=0;i<3;i++){
      const a=Math.random()*6.28;
      const r=rnd(70,140)*(1-t*0.65);
      const p=pget();
      p.active=true;
      p.x=handX+Math.cos(a)*r;
      p.y=handY+Math.sin(a)*r*0.75;
      const spd=3.5+t*4.5;
      p.vx=-Math.cos(a)*spd;
      p.vy=-Math.sin(a)*spd*0.75;
      p.maxLife=p.life=rnd(14,26);p.size=rnd(2,4.5);
      p.color=Math.random()<0.3?'#ffdd66':(Math.random()<0.6?'#ff8833':'#ff3322');
      p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
    }
    if(mf%3===0){
      const p=pget();
      p.active=true;
      p.x=handX+rnd(-4,4);
      p.y=handY+rnd(-4,4);
      p.vx=rnd(-0.5,0.5);p.vy=rnd(-0.5,0.5);
      p.maxLife=p.life=rnd(6,14);p.size=rnd(3,6);
      p.color=Math.random()<0.5?'#ffffff':'#ffdd66';
      p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
    }
    if(mf===34||mf===44){
      vfxShockwave(handX,handY,'#ff4422',40+t*40,18);
    }
  }
  else if(mf>=51&&mf<=63){
    if(mf===51){SFX.heianfugaTension();flash(0.3,'#ffdd66');}
    if(mf%2===0){
      const p=pget();
      p.active=true;
      p.x=handX+rnd(-6,6);
      p.y=handY+rnd(-6,6);
      p.vx=rnd(-0.8,0.8);p.vy=rnd(-0.8,0.8);
      p.maxLife=p.life=rnd(8,16);p.size=rnd(3,7);
      p.color=Math.random()<0.5?'#ffffff':'#ffdd66';
      p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
    }
    if(mf%3===0){
      const a=Math.random()*6.28;
      const r=rnd(45,90);
      const p=pget();
      p.active=true;
      p.x=handX+Math.cos(a)*r;
      p.y=handY+Math.sin(a)*r*0.8;
      p.vx=-Math.cos(a)*6.5;
      p.vy=-Math.sin(a)*6.5*0.8;
      p.maxLife=p.life=rnd(10,18);p.size=rnd(2,4);
      p.color='#ffdd66';
      p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
    }
    if(mf===63){vfxShockwave(handX,handY,'#ffffff',90,22);}
  }
  else if(mf>64){
    if(mf%8===0){
      const p=pget();
      p.active=true;
      p.x=f.x+dir*rnd(-20,20);
      p.y=f.y-rnd(60,120);
      p.vx=rnd(-0.6,0.6);p.vy=-rnd(0.3,1.2);
      p.maxLife=p.life=rnd(14,26);p.size=rnd(1.5,2.8);
      p.color=Math.random()<0.5?'#ff6633':'#ff3322';
      p.grav=0.03;p.shape='circle';p.rot=0;p.vr=0;p.add=true;
    }
  }
}
function pushAfterimage(f,pose){
  if(f.afterTimer>0)return;
  f.afterTimer=2;
  G.afterimages.push({x:f.x,y:f.y,facing:f.facing,pose:pose,id:f.id,form:f.form||0,life:10,maxLife:10});
  if(G.afterimages.length>MAX_AFTERIMAGES)G.afterimages.shift();
}