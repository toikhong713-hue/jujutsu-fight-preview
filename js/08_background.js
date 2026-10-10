'use strict';
/* ===== BACKGROUND ===== */
function buildBackground(){
  const far=document.createElement('canvas');far.width=3600;far.height=720;
  const fc=far.getContext('2d');
  const g=fc.createLinearGradient(0,0,0,720);
  g.addColorStop(0,'#0a1024');g.addColorStop(0.5,'#141a36');g.addColorStop(1,'#20182c');
  fc.fillStyle=g;fc.fillRect(0,0,3600,720);
  const mg=fc.createRadialGradient(1180,140,10,1180,140,180);
  mg.addColorStop(0,'rgba(200,220,255,0.9)');mg.addColorStop(0.25,'rgba(140,170,255,0.35)');mg.addColorStop(1,'rgba(120,150,255,0)');
  fc.fillStyle=mg;fc.beginPath();fc.arc(1180,140,180,0,6.29);fc.fill();
  fc.fillStyle='#dfe8ff';fc.beginPath();fc.arc(1180,140,46,0,6.29);fc.fill();
  for(let i=0;i<48;i++){const w=rnd(50,130),h=rnd(90,300),x=rnd(-40,3640);fc.fillStyle='rgba(22,28,54,'+rnd(0.6,0.95)+')';fc.fillRect(x,560-h,w,h);for(let wy=560-h+14;wy<548;wy+=18){for(let wx=x+8;wx<x+w-8;wx+=16){if(Math.random()<0.16){fc.fillStyle='rgba(120,170,255,'+rnd(0.15,0.5)+')';fc.fillRect(wx,wy,4,6);}}}}
  G.bgFar=far;
  const mid=document.createElement('canvas');mid.width=3600;mid.height=720;
  const mc=mid.getContext('2d');
  for(let i=0;i<22;i++){const w=rnd(110,230),h=rnd(160,380),x=rnd(-60,3600);const shade=rnd(14,26)|0;
    mc.fillStyle='rgb('+shade+','+(shade+6)+','+(shade+18)+')';mc.fillRect(x,560-h,w,h);
    mc.fillStyle='rgb('+(shade+6)+','+(shade+12)+','+(shade+26)+')';
    mc.beginPath();mc.moveTo(x,560-h);for(let k=0;k<=6;k++)mc.lineTo(x+(w/6)*k,560-h-rnd(0,26));mc.lineTo(x+w,560-h+10);mc.lineTo(x,560-h+10);mc.closePath();mc.fill();
    for(let wy=560-h+34;wy<540;wy+=34){for(let wx=x+14;wx<x+w-20;wx+=30){if(Math.random()<0.22){mc.fillStyle='rgba(120,180,255,'+rnd(0.08,0.28)+')';mc.fillRect(wx,wy,12,16);}}}
    mc.strokeStyle='rgba(0,0,0,0.5)';mc.lineWidth=2;mc.beginPath();let cx=x+w*0.4,cy=560-h*0.6;mc.moveTo(cx,cy);for(let k=0;k<5;k++){cx+=rnd(-16,16);cy+=rnd(10,30);mc.lineTo(cx,cy);}mc.stroke();
  }
  G.bgMid=mid;
}
function drawTojiCineBattlefield(){
  const par=(cam.x-ARENA_W/2);
  const top=0,bottom=GROUND+260;
  ctx.save();
  const g=ctx.createLinearGradient(0,top,0,bottom);g.addColorStop(0,'#05080b');g.addColorStop(.48,'#0d1115');g.addColorStop(1,'#111417');ctx.fillStyle=g;ctx.fillRect(-500,-160,ARENA_W+1000,bottom+200);
  // Far industrial silhouettes
  ctx.globalAlpha=.34;ctx.fillStyle='#171d21';
  for(let i=0;i<16;i++){const x=i*175-320-par*.10,h=130+(i%5)*45;ctx.fillRect(x,GROUND-h,92,h);ctx.fillRect(x+18,GROUND-h-36,54,36);}
  // Cold overhead lights
  ctx.globalAlpha=.50;ctx.strokeStyle='#8e979c';ctx.lineWidth=1;
  for(let i=0;i<9;i++){const x=i*270-200-par*.2;ctx.beginPath();ctx.moveTo(x,-40);ctx.lineTo(x+35,GROUND-70);ctx.stroke();ctx.fillStyle='rgba(220,230,235,.08)';ctx.fillRect(x-12,GROUND-78,95,2);}
  // Broken pillars / foreground frames
  ctx.globalAlpha=.72;ctx.fillStyle='#0b0e11';
  for(let i=0;i<7;i++){const x=i*360-240-par*.34;const h=250+(i%3)*80;ctx.save();ctx.translate(x,GROUND-h);ctx.rotate(((i%2?1:-1)*.018));ctx.fillRect(0,0,28,h);ctx.fillRect(-8,0,44,15);ctx.restore();}
  // Moon/floodlight through haze
  ctx.globalAlpha=.16;ctx.fillStyle='#dce6e9';ctx.beginPath();ctx.arc(ARENA_W/2-par*.05,140,84,0,6.283);ctx.fill();
  // Ground
  ctx.globalAlpha=1;const floor=ctx.createLinearGradient(0,GROUND,0,GROUND+220);floor.addColorStop(0,'#252a2d');floor.addColorStop(1,'#090b0d');ctx.fillStyle=floor;ctx.fillRect(-500,GROUND,ARENA_W+1000,300);
  ctx.strokeStyle='rgba(213,220,223,.22)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-500,GROUND);ctx.lineTo(ARENA_W+500,GROUND);ctx.stroke();
  // Cracked lanes and scattered concrete chunks
  for(let i=0;i<22;i++){const x=((i*271)%ARENA_W)-par*.02;const y=GROUND+4+(i%5)*12;ctx.strokeStyle='rgba(92,99,104,.34)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+22+(i%4)*9,y+6);ctx.lineTo(x+28+(i%3)*12,y+18);ctx.stroke();}
  ctx.fillStyle='#60686d';ctx.globalAlpha=.45;for(let i=0;i<25;i++){const x=(i*149)%ARENA_W-par*.08,y=GROUND+5+(i%7)*5,w=8+(i%5)*4;ctx.save();ctx.translate(x,y);ctx.rotate((i%9-4)*.12);ctx.fillRect(-w/2,-2,w,4+(i%3));ctx.restore();}
  // Fog bands
  for(let i=0;i<4;i++){ctx.globalAlpha=.035;ctx.fillStyle='#e5ebed';ctx.fillRect(-500,GROUND-65+i*25,ARENA_W+1000,18);}
  ctx.restore();
}
function drawTojiTraversalMap(targetCtx){
  const c=targetCtx||ctx;
  c.save();c.lineCap='round';c.lineJoin='round';
  const buildings=[
    {x:430,w:430,h:142,roof:418,label:'A'},
    {x:1020,w:500,h:228,roof:332,label:'B'},
    {x:1810,w:430,h:156,roof:404,label:'C'},
    {x:2430,w:490,h:258,roof:302,label:'D'}
  ];
  for(const b of buildings){
    const y=GROUND-b.h;c.fillStyle='#11161a';c.fillRect(b.x,y,b.w,b.h);
    c.fillStyle='#171d21';c.fillRect(b.x-8,y-9,b.w+16,10);
    c.fillStyle='rgba(5,7,9,.7)';c.fillRect(b.x+18,y+18,b.w-36,20);
    for(let row=0;row<Math.max(2,Math.floor(b.h/58));row++){
      for(let col=0;col<Math.floor((b.w-40)/46);col++){
        const wx=b.x+22+col*46,wy=y+54+row*48;
        c.fillStyle=(row+col)%3===0?'rgba(154,177,186,.25)':'rgba(78,96,103,.18)';c.fillRect(wx,wy,17,27);
        c.strokeStyle='rgba(200,214,220,.08)';c.lineWidth=1;c.strokeRect(wx,wy,17,27);
      }
    }
    c.fillStyle='#090c0f';c.fillRect(b.x+b.w*.46,y-46,56,37);
    c.strokeStyle='rgba(225,231,234,.18)';c.lineWidth=2;c.strokeRect(b.x+b.w*.46,y-46,56,37);
    c.fillStyle='rgba(216,226,230,.15)';c.fillRect(b.x+b.w*.46+7,y-38,42,4);
    // Roof access hatch.
    c.fillStyle='#0a0d10';c.fillRect(b.x+b.w*.16,b.roof-22,72,22);c.strokeStyle='#566067';c.lineWidth=1.5;c.strokeRect(b.x+b.w*.16,b.roof-22,72,22);
  }
  // Stairs as physical-looking step blocks.
  const steps=[
    [350,522,90,38],[405,484,90,38],[460,446,90,38],[515,418,90,38],
    [890,500,80,40],[935,460,80,40],[980,420,80,40]
  ];
  for(const [x,y,w,h] of steps){c.fillStyle='#252c31';c.fillRect(x,y,w,h);c.strokeStyle='rgba(219,226,230,.20)';c.lineWidth=1.5;c.strokeRect(x,y,w,h);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x,y+5,w,3);}
  // Railings.
  c.strokeStyle='rgba(150,161,166,.35)';c.lineWidth=3;c.beginPath();c.moveTo(370,522);c.lineTo(535,418);c.moveTo(900,500);c.lineTo(1015,420);c.stroke();
  for(const x of [400,445,490,935,975]){const y=x<600?492-(x-400)*.45:472-(x-935)*.45;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+30);c.stroke();}
  // Trees with climbable branches.
  const trees=[{x:800,y:560,h:210,lean:-14},{x:1600,y:560,h:185,lean:10},{x:2940,y:560,h:230,lean:-8}];
  for(const tr of trees){
    c.save();c.translate(tr.x,GROUND);c.rotate(tr.lean*Math.PI/180);
    c.strokeStyle='#1c1510';c.lineWidth=30;c.beginPath();c.moveTo(0,0);c.lineTo(8,-tr.h);c.stroke();
    c.strokeStyle='#473229';c.lineWidth=16;c.beginPath();c.moveTo(0,0);c.lineTo(8,-tr.h);c.stroke();
    c.strokeStyle='#5a4032';c.lineWidth=6;c.beginPath();c.moveTo(-6,-20);c.lineTo(4,-tr.h+10);c.stroke();
    for(const [bx,by,len] of [[-34,-118,118],[34,-164,110],[-24,-202,92],[18,-72,92]]){c.strokeStyle='#443128';c.lineWidth=10;c.beginPath();c.moveTo(bx,by);c.lineTo(bx+Math.sign(bx||1)*len,by-18);c.stroke();}
    c.fillStyle='rgba(28,47,34,.92)';
    for(let i=0;i<10;i++){const a=(i/10)*6.283,r=52+(i%3)*14,cx=Math.cos(a)*r*0.7,cy=-tr.h+Math.sin(a)*r*0.34;c.beginPath();c.ellipse(cx,cy,52+(i%2)*12,34+(i%3)*7,a,0,6.283);c.fill();}
    c.fillStyle='rgba(74,104,67,.26)';c.beginPath();c.ellipse(0,-tr.h,110,54,0,0,6.283);c.fill();
    c.restore();
  }
  // Small props that can be used as visual cover / route landmarks.
  for(const [x,y] of [[230,520],[920,530],[1720,520],[2320,510],[3080,530]]){
    c.fillStyle='#1a2024';c.fillRect(x,y,36,30);c.strokeStyle='#616b70';c.lineWidth=1.5;c.strokeRect(x,y,36,30);
    c.fillStyle='#2b3338';c.fillRect(x+5,y-7,26,7);
  }
  // Rooftop target glints, deliberately subtle.
  for(const p of TOJI_SORU_ANCHORS){if(p.type==='air')continue;c.globalAlpha=.08;c.fillStyle='#f0f3f4';c.fillRect(p.x-8,p.y+2,16,2);}
  c.restore();
}

function drawArenaWorld(){
  if(G.tojiCineX){drawTojiCineBattlefield();return;}
  const off1=(cam.x-ARENA_W/2)*0.12;const off2=(cam.x-ARENA_W/2)*0.34;
  ctx.save();ctx.drawImage(G.bgFar,-260-off1,-40);ctx.drawImage(G.bgMid,-300-off2,-40);ctx.restore();
  const gg=ctx.createLinearGradient(0,GROUND-10,0,GROUND+180);
  gg.addColorStop(0,'#2a2233');gg.addColorStop(0.35,'#1a1420');gg.addColorStop(1,'#0a0810');
  ctx.fillStyle=gg;ctx.fillRect(-400,GROUND,ARENA_W+800,300);
  ctx.strokeStyle='rgba(140,120,180,0.35)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-400,GROUND);ctx.lineTo(ARENA_W+400,GROUND);ctx.stroke();
  ctx.strokeStyle='rgba(90,140,220,0.18)';ctx.lineWidth=2;
  for(let i=0;i<26;i++){const sx=((i*137)%ARENA_W);ctx.beginPath();let x=sx,y=GROUND+6;ctx.moveTo(x,y);for(let k=0;k<4;k++){x+=((i*37)%2?1:-1)*rnd(12,34);y+=rnd(3,12);ctx.lineTo(x,y);}ctx.stroke();}
  ctx.fillStyle='rgba(40,34,52,0.9)';
  for(let i=0;i<40;i++){const x=((i*241)%ARENA_W);const w=rnd(10,34),h=rnd(4,12);ctx.save();ctx.translate(x,GROUND+rnd(4,40));ctx.rotate(((i*17)%10-5)*0.1);ctx.fillRect(-w/2,-h/2,w,h);ctx.restore();}
  drawTojiTraversalMap();
  ctx.save();
  const bg=ctx.createLinearGradient(WALL-40,0,WALL+40,0);bg.addColorStop(0,'rgba(120,180,255,0)');bg.addColorStop(1,'rgba(120,180,255,0.22)');ctx.fillStyle=bg;ctx.fillRect(WALL-40,0,80,GROUND);
  const bg2=ctx.createLinearGradient(ARENA_W-WALL-40,0,ARENA_W-WALL+40,0);bg2.addColorStop(0,'rgba(120,180,255,0.22)');bg2.addColorStop(1,'rgba(120,180,255,0)');ctx.fillStyle=bg2;ctx.fillRect(ARENA_W-WALL-40,0,80,GROUND);
  ctx.restore();
}
/* ===== RENDER FIGHTER ===== */
function capsule(x1,y1,x2,y2,r,fill){const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.arc(x1,y1,r,a+Math.PI/2,a-Math.PI/2);ctx.arc(x2,y2,r,a-Math.PI/2,a+Math.PI/2);ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function darken(hex,amt){let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.round(r*amt);g=Math.round(g*amt);b=Math.round(b*amt);return 'rgb('+r+','+g+','+b+')';}
function drawAfterimages(){
  for(const a of G.afterimages){
    const alpha=(a.life/a.maxLife)*0.28;
    const C=(a.id==='sukuna'&&a.form===1)?YUJI_COLORS:CHARS[a.id].colors;
    ctx.save();ctx.globalAlpha=alpha;ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=C.aura;ctx.beginPath();ctx.ellipse(a.x,a.y-58,20,52,0,0,6.29);ctx.fill();
    if(a.id==='heian_sukuna'){
      ctx.fillStyle='rgba(255,60,80,0.3)';
      ctx.beginPath();ctx.ellipse(a.x-14,a.y-56,8,26,0,0,6.29);ctx.fill();
      ctx.beginPath();ctx.ellipse(a.x+14,a.y-56,8,26,0,0,6.29);ctx.fill();
    }
    ctx.restore();
  }
}
function drawTojiInventoryCurse(f,P,fd){
  if(f.id!=='toji')return;
  const bx=f.x,by=f.y,open=(f.state==='ATTACK'&&f.moveKey&&['light','heavy'].includes(f.moveKey)&&f.tojiInventoryOpen>0);
  ctx.save();ctx.translate(bx,by);ctx.scale(fd,1);ctx.globalCompositeOperation='source-over';
  // Coiled body behind the shoulder / back.
  ctx.strokeStyle='#07090a';ctx.lineWidth=18;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
  ctx.moveTo(-18,-32);ctx.bezierCurveTo(-74,-12,-82,-60,-44,-78);ctx.bezierCurveTo(-8,-96,4,-72,-18,-46);
  ctx.stroke();ctx.strokeStyle='#242a2e';ctx.lineWidth=11;ctx.stroke();
  ctx.strokeStyle='#4a5258';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-18,-32);ctx.bezierCurveTo(-70,-14,-76,-57,-42,-72);ctx.bezierCurveTo(-10,-87,-2,-70,-20,-48);ctx.stroke();
  // Head / mouth at the upper back, visible enough to read as a real creature.
  const hx=-44,hy=-91;ctx.fillStyle='#101417';ctx.beginPath();ctx.ellipse(hx,hy,25,17,-0.22,0,6.283);ctx.fill();
  ctx.strokeStyle='#6b7479';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#020304';ctx.beginPath();ctx.ellipse(hx+fd*1,hy+2,18,8,-0.10,0,6.283);ctx.fill();
  ctx.fillStyle='#d7dde0';
  for(let i=-2;i<=2;i++){const tx=hx+4+i*6,ty=hy+1+(Math.abs(i)%2)*2;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(tx+3,ty-6);ctx.lineTo(tx+6,ty);ctx.closePath();ctx.fill();}
  ctx.fillStyle='#6b252e';ctx.beginPath();ctx.ellipse(hx-fd*2,hy+3,10,4,0.05,0,6.283);ctx.fill();
  if(open){
    ctx.globalAlpha=.92;ctx.strokeStyle='#e8edef';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hx+fd*8,hy);ctx.lineTo(hx+fd*38,hy+2);ctx.stroke();
    ctx.globalAlpha=.45;ctx.strokeStyle='#f2f4f5';ctx.lineWidth=3;ctx.beginPath();ctx.arc(hx+fd*8,hy,20,-0.28,0.28);ctx.stroke();
    for(let i=0;i<5;i++){const p=pget();p.active=true;p.x=hx+fd*rnd(12,24);p.y=hy+rnd(-4,4);p.vx=fd*rnd(1.2,3.0);p.vy=rnd(-1.1,1.1);p.maxLife=p.life=rnd(7,13);p.size=rnd(1.5,3.0);p.color=i%2?'#cfd6da':'#ffffff';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}
  }
  ctx.restore();
}

function drawRikaBehind(f){
  if(f.rikaTimer<=0||f.id!=='yuta')return;
  const dir=f.facing;const bx=f.x-dir*30,by=f.y;const alpha=Math.min(0.85,f.rikaTimer/40);
  ctx.save();ctx.globalAlpha=alpha;
  ctx.fillStyle='rgba(180,150,220,0.30)';ctx.beginPath();ctx.ellipse(bx,by-70,42,80,0,0,6.29);ctx.fill();
  ctx.fillStyle='rgba(200,170,240,0.22)';ctx.beginPath();ctx.ellipse(bx,by-140,26,32,0,0,6.29);ctx.fill();
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(bx-dir*8,by-145,2.4,0,6.29);ctx.fill();ctx.beginPath();ctx.arc(bx+dir*4,by-145,2.4,0,6.29);ctx.fill();
  ctx.restore();
}
function drawHakariJackpotAura(f){
  if(f.jackpot<=0&&!(f.id==='hakari'&&f.rollTimer>0))return;
  const bx=f.x,by=f.y;const isJackpot=f.jackpot>0;
  ctx.save();ctx.globalCompositeOperation='lighter';
  const pulse=0.55+Math.sin(f.animT*0.25)*0.2;
  if(isJackpot){
    const g=ctx.createRadialGradient(bx,by-58,4,bx,by-58,100);
    g.addColorStop(0,'rgba(255,225,140,'+(pulse*0.65)+')');g.addColorStop(0.5,'rgba(255,200,80,0.25)');g.addColorStop(1,'rgba(255,160,40,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(bx,by-58,78,105,0,0,6.29);ctx.fill();
    const r1=62+Math.sin(f.animT*0.2)*4;
    ctx.strokeStyle='rgba(255,225,140,0.75)';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(bx,by-58,r1,0,6.29);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(bx,by-58,r1+10+Math.cos(f.animT*0.15)*4,0,6.29);ctx.stroke();
    for(let i=0;i<6;i++){const a=f.animT*0.05+i*(Math.PI*2/6);const rr=r1+18;const px=bx+Math.cos(a)*rr,py=by-58+Math.sin(a)*rr*0.82;ctx.fillStyle='rgba(255,225,140,0.85)';ctx.beginPath();ctx.arc(px,py,2.4,0,6.29);ctx.fill();}
  }else if(f.rollTimer>0){
    const r1=42+Math.sin(f.animT*0.4)*3;ctx.strokeStyle='rgba(255,225,140,0.55)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by-58,r1,0,6.29);ctx.stroke();
  }
  ctx.restore();
}
function drawHeianArms(f,shPt,hipPt,P,fd,C,t){
  const lfA1=P.armF[0]-28;
  const lfA2=P.armF[1]*0.75;
  const lf_sh={x:shPt.x+fd*4,y:shPt.y+10};
  const lf_e=joint(lf_sh,lfA1,17);
  const lf_h=joint(lf_e,lfA1+lfA2,17);
  const lbA1=P.armB[0]+24;
  const lbA2=P.armB[1]*0.75;
  const lb_sh={x:shPt.x-fd*4,y:shPt.y+10};
  const lb_e=joint(lb_sh,lbA1,17);
  const lb_h=joint(lb_e,lbA1+lbA2,17);
  capsule(lb_sh.x,lb_sh.y,lb_e.x,lb_e.y,6.8,darken(C.top,0.55));
  capsule(lb_e.x,lb_e.y,lb_h.x,lb_h.y,5.6,darken(C.skin,0.7));
  ctx.fillStyle=darken(C.skin,0.7);
  ctx.beginPath();ctx.arc(lb_h.x,lb_h.y,5.4,0,6.29);ctx.fill();
  ctx.strokeStyle='rgba(30,8,10,0.7)';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(lb_h.x-3,lb_h.y);ctx.lineTo(lb_h.x+3,lb_h.y);ctx.stroke();
  capsule(lf_sh.x,lf_sh.y,lf_e.x,lf_e.y,7.2,C.top);
  capsule(lf_e.x,lf_e.y,lf_h.x,lf_h.y,6,C.skin);
  ctx.fillStyle=C.skin;
  ctx.beginPath();ctx.arc(lf_h.x,lf_h.y,5.8,0,6.29);ctx.fill();
  ctx.strokeStyle='rgba(30,8,10,0.85)';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(lf_h.x-4,lf_h.y);ctx.lineTo(lf_h.x+4,lf_h.y);ctx.stroke();
}
function drawStrongestSkillVisuals(f){
  if(f.id!=='the_strongest_today'||f.state!=='ATTACK'||!f.move)return;
  const k=f.move.kind,mf=f.moveFrame,sp=Math.max(1,f.move.startup),u=clamp(mf/sp,0,1),fd=f.facing;
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(k==='strongest_maxblue'){
    const st=f.maxBlueState;if(!st){ctx.restore();return;}
    const c=st.target;const pulse=0.72+Math.sin(f.animT*0.26)*0.18;
    const q=u<0.16?u/0.16:(u<0.91?1:Math.max(0,1-(u-0.91)/0.09));
    const r=8+q*28;
    const g=ctx.createRadialGradient(c.x,c.y,1,c.x,c.y,r*2.8);
    g.addColorStop(0,'rgba(255,255,255,'+(0.95*pulse)+')');g.addColorStop(0.22,'rgba(126,220,255,'+(0.9*pulse)+')');g.addColorStop(0.68,'rgba(35,130,255,0.42)');g.addColorStop(1,'rgba(0,40,140,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,r*2.2,0,6.29);ctx.fill();
    ctx.strokeStyle='rgba(150,235,255,'+(0.8*q)+')';ctx.lineWidth=2.3;ctx.beginPath();ctx.arc(c.x,c.y,r+Math.sin(f.animT*0.18)*3,0,6.29);ctx.stroke();
    if(u>0.24&&u<0.91){
      for(let i=0;i<4;i++){
        const a=f.animT*0.025+i*Math.PI/2;const rr=r*2.8+i*12;
        ctx.strokeStyle='rgba(100,200,255,'+(0.22+q*0.24)+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(c.x,c.y,rr,a,a+0.8);ctx.stroke();
      }
    }
  }else if(k==='strongest_purplechant'){
    const st=f.purpleChantState;if(!st){ctx.restore();return;}
    const c=st.center,b=st.blue,r=st.red;
    function orb(x,y,col,scale){
      const rad=(10+Math.sin(f.animT*0.2)*2)*scale;
      const g=ctx.createRadialGradient(x,y,1,x,y,rad*3.4);
      if(col==='blue'){g.addColorStop(0,'rgba(255,255,255,0.98)');g.addColorStop(0.22,'rgba(90,190,255,0.95)');g.addColorStop(0.64,'rgba(30,105,255,0.42)');g.addColorStop(1,'rgba(0,40,150,0)');}
      else {g.addColorStop(0,'rgba(255,255,255,0.98)');g.addColorStop(0.2,'rgba(255,100,120,0.92)');g.addColorStop(0.64,'rgba(255,35,75,0.44)');g.addColorStop(1,'rgba(110,0,20,0)');}
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rad*2.4,0,6.29);ctx.fill();
    }
    if(u<0.57){orb(b.x,b.y,'blue',0.9);orb(r.x,r.y,'red',0.95);}
    else if(u<0.68){orb(lerp(b.x,c.x-fd*10,(u-0.57)/0.11),lerp(b.y,c.y,(u-0.57)/0.11),'blue',1);orb(lerp(r.x,c.x+fd*10,(u-0.57)/0.11),lerp(r.y,c.y,(u-0.57)/0.11),'red',1);}
    else if(u<0.966){
      const rad=u>0.925?42+((u-0.925)/0.041)*28:22+(u-0.68)*80;
      const g=ctx.createRadialGradient(c.x,c.y,2,c.x,c.y,rad*2.8);g.addColorStop(0,'rgba(255,255,255,0.98)');g.addColorStop(0.24,'rgba(225,205,255,0.96)');g.addColorStop(0.58,'rgba(188,105,255,0.72)');g.addColorStop(1,'rgba(110,30,180,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,rad*2.1,0,6.29);ctx.fill();
      ctx.strokeStyle='rgba(232,214,255,0.88)';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(c.x,c.y,rad*(1.1+Math.sin(f.animT*0.17)*0.08),0,6.29);ctx.stroke();
    }else{
      const bt=clamp((u-0.966)/0.034,0,1),rad=60+bt*430;
      const g=ctx.createRadialGradient(c.x,c.y,2,c.x,c.y,rad);g.addColorStop(0,'rgba(255,255,255,0.5)');g.addColorStop(0.2,'rgba(220,190,255,0.35)');g.addColorStop(0.58,'rgba(170,80,255,0.13)');g.addColorStop(1,'rgba(110,30,180,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.x,c.y,rad,0,6.29);ctx.fill();
      ctx.strokeStyle='rgba(220,190,255,0.75)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(c.x,c.y,rad,0,6.29);ctx.stroke();
      for(let i=0;i<8;i++){const a=f.animT*0.015+i*Math.PI/4;const x2=c.x+Math.cos(a)*rad,y2=c.y+Math.sin(a)*rad;ctx.strokeStyle='rgba(250,240,255,0.34)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(x2,y2);ctx.stroke();}
    }
  }
  ctx.restore();
}
const TOJI_PROP_FRAMES=24;
/*
 * Toji weapon renderer v2
 * Based on the supplied 800x450 showcase, but filtered into one clean primary
 * weapon state per frame. No full-weapon redraw is allowed on impact frames, so
 * slash/thrust motion can sit behind the weapon without visually burying it.
 */
const TOJI_PROP_PALETTE={
  ink:'#090b0d', charcoal:'#15181b', graphite:'#2a2f33', steel:'#777f84',
  bright:'#cfd4d7', edge:'#eef1f2', leather:'#1a1c1f', deep:'#050607', dust:'#5c6368'
};
const TOJI_WEAPON_FRAMESETS={
  s1:[
    'sheathed','sheathed','drawA','drawB','drawC','drawD','readyA','readyB',
    'windupA','windupB','slashA','slashB','slashC','slashD','slashE','slashF',
    'followA','followB','followC','recoverA','recoverB','recoverC','resheathA','resheathB'
  ],
  s2:[
    'lowReady','lowReady','raiseA','raiseB','raiseC','aimA','aimB','thrustA',
    'thrustB','thrustC','thrustD','impactA','impactB','impactC','recoilA','recoilB',
    'recoilC','recoilD','lowerA','lowerB','lowerC','resetA','resetB','resetC'
  ],
  s3:[
    'coilA','coilB','coilC','unrollA','unrollB','unrollC','swingA','swingB',
    'swingC','swingD','swingE','swingF','wideA','wideB','wideC','wideD',
    'lassoA','lassoB','lassoC','retractA','retractB','retractC','coilD','coilE'
  ],
  s4:[
    'carryA','carryB','liftA','liftB','liftC','spinA','spinB','spinC',
    'spinD','spinE','spinF','crossA','crossB','crossC','crossD','crossE',
    'impactA','impactB','impactC','followA','followB','followC','resetA','resetB'
  ]
};
function tojiPropFrame(mf,total){
  const q=clamp((mf+0.5)/Math.max(1,total),0,0.999999);
  return Math.min(TOJI_PROP_FRAMES-1,Math.floor(q*TOJI_PROP_FRAMES));
}
function tojiPropT(mf,total){ return tojiPropFrame(mf,total)/(TOJI_PROP_FRAMES-1); }
function tojiWeaponState(key,frame){
  const a=TOJI_WEAPON_FRAMESETS[key]||TOJI_WEAPON_FRAMESETS.s1;
  return a[Math.max(0,Math.min(a.length-1,frame))];
}
function drawTojiSlashArc(ctx,x,y,ang,len,width,alpha=0.55){
  const C=TOJI_PROP_PALETTE;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.globalAlpha=alpha;
  ctx.strokeStyle='rgba(224,229,231,0.22)';ctx.lineWidth=width+7;ctx.beginPath();
  ctx.arc(0,0,len,-0.9,0.75);ctx.stroke();
  ctx.strokeStyle=C.edge;ctx.lineWidth=width;ctx.beginPath();
  ctx.arc(0,0,len,-0.82,0.55);ctx.stroke();
  ctx.restore();
}
function drawBladeProp(ctx,x,y,ang,scale,drawPhase,impact,state='drawD'){
  const C=TOJI_PROP_PALETTE;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';
  const hidden=state==='sheathed'||state==='resheathA'||state==='resheathB';
  const partial=state==='drawA'||state==='drawB'||state==='drawC';
  const len=partial?lerp(22,78,clamp(drawPhase*1.35,0,1)):82;
  // sheath
  ctx.strokeStyle=C.deep;ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-50,2);ctx.lineTo(-5,2);ctx.stroke();
  ctx.strokeStyle=C.graphite;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-48,2);ctx.lineTo(-6,2);ctx.stroke();
  // grip and guard
  ctx.strokeStyle=C.ink;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(19,0);ctx.stroke();
  for(let i=0;i<5;i++){ctx.strokeStyle=i%2?C.graphite:C.steel;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-7+i*5.5,-4);ctx.lineTo(-3+i*5.5,4);ctx.stroke();}
  ctx.strokeStyle=C.steel;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(19,-9);ctx.lineTo(19,9);ctx.stroke();
  if(!hidden){
    ctx.strokeStyle=C.charcoal;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(20,0);ctx.quadraticCurveTo(len*.55,-8,len,0);ctx.stroke();
    ctx.strokeStyle=C.steel;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(20,-1);ctx.quadraticCurveTo(len*.55,-9,len,0);ctx.stroke();
    ctx.strokeStyle=C.edge;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(22,-3);ctx.quadraticCurveTo(len*.55,-10,len-1,-2);ctx.stroke();
  }
  if(/^slash/.test(state)||/^follow/.test(state)){
    const sweep=state==='slashA'?0.15:state==='slashB'?0.32:state==='slashC'?0.48:state==='slashD'?0.66:state==='slashE'?0.82:0.95;
    drawTojiSlashArc(ctx,16,0,(-0.9+sweep)*0.95,48+sweep*16,4.5,0.48);
  }
  if(impact>0&&!hidden){
    ctx.globalAlpha=impact;ctx.strokeStyle=C.bright;ctx.lineWidth=5.5;ctx.beginPath();ctx.moveTo(23,-1);ctx.quadraticCurveTo(len*.56,-10,len+8,0);ctx.stroke();
  }
  ctx.restore();
}
function drawSpearProp(ctx,x,y,ang,scale,thrust,impact,state='lowReady'){
  const C=TOJI_PROP_PALETTE;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';
  const len=96;
  ctx.strokeStyle=C.deep;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(len,0);ctx.stroke();
  ctx.strokeStyle=C.graphite;ctx.lineWidth=5.5;ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(len-12,0);ctx.stroke();
  for(let i=0;i<7;i++){ctx.strokeStyle=i%2?C.steel:C.charcoal;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(-8+i*7,-4);ctx.lineTo(-3+i*7,4);ctx.stroke();}
  // Distinctive spear head, always kept visible.
  ctx.fillStyle=C.edge;ctx.beginPath();ctx.moveTo(len+12,0);ctx.lineTo(len-7,-10);ctx.lineTo(len-1,-3);ctx.lineTo(len-1,3);ctx.lineTo(len-7,10);ctx.closePath();ctx.fill();
  ctx.strokeStyle=C.steel;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(len-4,-7);ctx.lineTo(len+9,0);ctx.lineTo(len-4,7);ctx.stroke();
  if(state==='thrustA'||state==='thrustB'||state==='thrustC'||state==='thrustD'||state==='impactA'||state==='impactB'||state==='impactC'){
    const reach=84+Math.max(0,thrust)*78;
    ctx.globalAlpha=0.32;ctx.strokeStyle=C.bright;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(reach,0);ctx.stroke();
  }
  if(impact>0){ctx.globalAlpha=impact;ctx.strokeStyle=C.edge;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(len+22,0);ctx.stroke();}
  ctx.restore();
}
function drawChainProp(ctx,x,y,ang,scale,phase,impact,state='coilA'){
  const C=TOJI_PROP_PALETTE;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';
  const reach=state.startsWith('coil')?62:(state.startsWith('unroll')?96:(state.startsWith('swing')?122:(state.startsWith('wide')?142:(state.startsWith('lasso')?104:82))));
  const waveAmp=state.startsWith('swing')||state.startsWith('wide')?26:14;
  let px=0,py=0;
  for(let i=1;i<=10;i++){
    const q=i/10, wobble=Math.sin(phase*10+q*8.4)*waveAmp*(0.25+q*0.75);
    const nx=q*reach,ny=wobble+(state.startsWith('coil')?Math.sin(q*Math.PI)*18:0);
    ctx.strokeStyle=C.deep;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx,ny);ctx.stroke();
    ctx.strokeStyle=C.steel;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(nx,ny);ctx.stroke();
    if(i<10){ctx.save();ctx.translate(nx,ny);ctx.rotate((i%2?1:-1)*0.55+phase*1.1);ctx.strokeStyle=C.graphite;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,5,8,0,0,6.283);ctx.stroke();ctx.restore();}
    px=nx;py=ny;
  }
  ctx.fillStyle=C.charcoal;ctx.beginPath();ctx.arc(px,py,10,0,6.283);ctx.fill();ctx.strokeStyle=C.edge;ctx.lineWidth=2;ctx.stroke();
  if(state.startsWith('swing')||state.startsWith('wide'))drawTojiSlashArc(ctx,reach*.56,0,-0.35,54,3.2,0.28);
  if(impact>0){ctx.globalAlpha=impact;ctx.strokeStyle=C.bright;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(px,py);ctx.stroke();}
  ctx.restore();
}
function drawCloudProp(ctx,x,y,scale,spin,impact,state='carryA'){
  const C=TOJI_PROP_PALETTE;
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';
  const spinFrames={carryA:0.10,carryB:0.28,liftA:0.48,liftB:0.72,liftC:0.95,spinA:1.25,spinB:1.65,spinC:2.05,spinD:2.45,spinE:2.85,spinF:3.25,crossA:3.7,crossB:4.05,crossC:4.4,crossD:4.75,crossE:5.1,impactA:5.48,impactB:5.85,impactC:6.2,followA:0.5,followB:1.2,followC:1.85,resetA:2.6,resetB:3.2};
  const base=spinFrames[state]??spin;
  for(let i=0;i<3;i++){
    const a=base+i*Math.PI*2/3,dist=54;
    const ex=Math.cos(a)*dist,ey=Math.sin(a)*dist*0.58;
    ctx.strokeStyle=C.deep;ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.strokeStyle=C.steel;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.fillStyle=C.charcoal;ctx.beginPath();ctx.arc(ex,ey,12,0,6.283);ctx.fill();
    ctx.strokeStyle=C.edge;ctx.lineWidth=2;ctx.beginPath();ctx.arc(ex,ey,9.5,0,6.283);ctx.stroke();
  }
  ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(0,0,10,0,6.283);ctx.fill();
  if(/^spin/.test(state)||/^cross/.test(state)||/^impact/.test(state)){
    ctx.globalAlpha=0.28;ctx.strokeStyle=C.bright;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,70,base-0.9,base+0.9);ctx.stroke();
  }
  if(impact>0){ctx.globalAlpha=impact;ctx.strokeStyle=C.edge;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,62,base-0.75,base+0.75);ctx.stroke();}
  ctx.restore();
}
function drawTojiWeapon(f,P,fd){
  if(f.id!=='toji'||f.state!=='ATTACK'||!f.move)return;
  const k=f.moveKey,mf=f.moveFrame,m=f.move;
  const total=Math.max(1,m.startup+m.active+m.recovery),frame=tojiPropFrame(mf,total),phase=frame/(TOJI_PROP_FRAMES-1),state=tojiWeaponState(k,frame);
  const active=mf>=m.startup&&mf<=m.startup+m.active;
  const bx=f.x,by=f.y,b=fd,sh={x:bx+P.lean*0.28*b,y:by+P.shY},ef=joint(sh,P.armF[0],20),hf=joint(ef,P.armF[0]+P.armF[1],20);
  const handAng=(P.armF[0]+P.armF[1])*D2R,hx=hf.x+Math.cos(handAng)*7,hy=hf.y+Math.sin(handAng)*7,dir=fd;
  ctx.save();ctx.globalAlpha=0.98;
  const impact=active?0.20:0;
  if(k==='light'){
    const step=Math.max(0,Math.min(4,f.tojiM1Step||0));
    if(step===0){
      const mouth={x:bx-dir*43,y:by-91};
      const q=clamp((mf-58)/72,0,1);
      const handCatch={x:hx,y:hy};
      const px=lerp(mouth.x,handCatch.x,q),py=lerp(mouth.y,handCatch.y,q);
      /* Same ISOH model as Toji X cinematic. The Chain of a Thousand Miles is
         visibly attached during the double spin, then releases into the hand. */
      const spin=clamp((mf-58)/70,0,1)*Math.PI*4;
      /* Once ISOH reaches Toji's hand, stop spinning and immediately present it
         forward in a controlled ready pose. The slight counter-rotation is Toji's
         LEFT from his own viewpoint, not a flat screen-space tilt. */
      const drawA=-0.25+spin;
      const holdA=handAng-(dir*0.28);
      const weaponA=mf>=128?holdA:drawA;
      const weaponX=mf>=128?handCatch.x:px, weaponY=mf>=128?handCatch.y:py;
      drawTojiCineInvertedSpear(ctx,{x:weaponX,y:weaponY},weaponA,dir,mf);
      ctx.save();ctx.globalAlpha=.95;ctx.strokeStyle='#20262a';ctx.lineWidth=4;ctx.lineCap='round';
      const anchor={x:mouth.x,y:mouth.y};
      const tip={x:px-dir*27,y:py};
      ctx.beginPath();ctx.moveTo(anchor.x,anchor.y);for(let i=1;i<=14;i++){const z=i/14;ctx.lineTo(lerp(anchor.x,tip.x,z),lerp(anchor.y,tip.y,z)+Math.sin(z*Math.PI*7+spin)*10*z);}ctx.stroke();
      ctx.strokeStyle='#8b9499';ctx.lineWidth=1.6;ctx.stroke();ctx.restore();
      if(mf>=112){
        /* 1-second violent black aura after the catch. It stays behind the body
           and weapon, pulsing instead of becoming a heavy particle load. */
        const aq=clamp((mf-128)/60,0,1), pulse=.72+.28*Math.sin((mf-128)*.34), fade=mf<188?1:clamp((200-mf)/12,0,1);
        ctx.save();ctx.globalCompositeOperation='source-over';ctx.translate(bx,by-96);
        ctx.globalAlpha=.82*pulse*fade;ctx.strokeStyle='#020304';ctx.lineWidth=15;
        ctx.beginPath();ctx.arc(0,0,54+10*Math.sin((mf-128)*.22),0,6.283);ctx.stroke();
        ctx.globalAlpha=.42*pulse*fade;ctx.lineWidth=7;
        for(let j=0;j<7;j++){
          const aa=j*Math.PI*2/7+(mf-128)*.045, rr=46+10*Math.sin((mf-128)*.19+j);
          ctx.beginPath();ctx.moveTo(Math.cos(aa)*18,Math.sin(aa)*18);ctx.lineTo(Math.cos(aa)*rr,Math.sin(aa)*rr);ctx.stroke();
        }
        ctx.fillStyle='#000';ctx.globalAlpha=.20*pulse*fade;
        for(let j=0;j<9;j++){const aa=j*2.4+mf*.09,rr=26+(j*13+mf*.7)%58;ctx.beginPath();ctx.arc(Math.cos(aa)*rr,Math.sin(aa)*rr,2.5+(j%3),0,6.283);ctx.fill();}
        ctx.restore();
        ctx.save();ctx.globalAlpha=.7;ctx.fillStyle='#eef1f2';ctx.beginPath();ctx.arc(hx,hy,8+Math.sin(mf*.4)*2,0,6.283);ctx.fill();ctx.restore();
      }
    }else{
      const angles=[0,-0.92,0.04,0.58,0.74];
      const a=handAng+angles[step];
      const sc=.5;
      drawTojiCineInvertedSpear(ctx,{x:hx,y:hy},a,dir,mf);
      if(step===1&&mf>=10)drawTojiSlashArc(ctx,hx,hy,a,58,5,.32);
      if(step===2&&mf>=9)drawTojiSlashArc(ctx,hx,hy,a,62,5,.30);
      if(step===4&&mf>=10){ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle='#ffffff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(hx-dir*8,hy);ctx.lineTo(hx+dir*74,hy+48);ctx.stroke();ctx.restore();}
    }
  }else if(k==='heavy'){
    const a=handAng-0.02;
    drawTojiCineInvertedSpear(ctx,{x:hx,y:hy},a,dir,mf);
    if(mf>=18&&mf<34)drawTojiSlashArc(ctx,hx,hy,a,96,6,.34);
    }else if(k==='s1'){
    const drawPhase=clamp((frame-1)/7,0,1),a=handAng-0.9+(phase*1.75);
    drawBladeProp(ctx,hx,hy,a,0.94,drawPhase,impact,state);
  }else if(k==='s2'){
    const thrust=clamp((frame-6)/7,0,1),a=handAng-0.12+Math.sin(frame*0.35)*0.018;
    drawSpearProp(ctx,hx+dir*(thrust*12),hy,a,0.98,thrust,active?0.24:0.08,state);
  }else if(k==='s3'){
    const chainPhase=clamp((frame-2)/18,0,1),a=handAng-0.5+Math.sin(chainPhase*Math.PI*2)*0.34;
    drawChainProp(ctx,hx,hy,a,0.92,chainPhase,active?0.18:0.06,state);
  }else if(k==='s4'){
    drawCloudProp(ctx,hx,hy,1.0,phase*Math.PI*2.6+f.animT*0.006,active?0.22:0.08,state);
  }else if(k==='ult'){
    const seg=Math.floor(frame/6),local=(frame%6)/5;
    if(seg===0)drawBladeProp(ctx,hx,hy,handAng-0.8+local*1.4,0.95,0.82,0.18,TOJI_WEAPON_FRAMESETS.s1[Math.min(23,8+frame%6)]);
    else if(seg===1)drawSpearProp(ctx,hx+dir*local*12,hy,handAng-0.12,0.98,local,0.20,TOJI_WEAPON_FRAMESETS.s2[Math.min(23,7+frame%6)]);
    else if(seg===2)drawChainProp(ctx,hx,hy,handAng-0.35+local*0.65,0.92,local,0.18,TOJI_WEAPON_FRAMESETS.s3[Math.min(23,6+frame%6)]);
    else drawCloudProp(ctx,hx,hy,1.0,local*Math.PI*2,0.20,TOJI_WEAPON_FRAMESETS.s4[Math.min(23,5+frame%6)]);
  }
  ctx.restore();
}
function drawTojiMenace(f,P,fd){
  if(f.id!=='toji'||f.state!=='ATTACK'||!f.move||f.moveKey==='x')return;
  const k=f.moveKey,mf=f.moveFrame,sp=Math.max(1,f.move.startup),u=clamp(mf/sp,0,1);
  const cx=f.x+fd*6,cy=f.y-74;
  ctx.save();ctx.globalCompositeOperation='lighter';
  // Charcoal pressure, not cursed-energy neon.
  if(k==='s5'){
    ctx.globalAlpha=0.22*(1-u);ctx.fillStyle='#070809';ctx.beginPath();ctx.ellipse(cx,cy,72,88,0,0,6.29);ctx.fill();
    for(let i=0;i<4;i++){
      const a=(f.animT*0.012)+i*Math.PI/2,r=34+i*12;
      ctx.globalAlpha=0.11;ctx.strokeStyle='#747a7e';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.7);ctx.stroke();
    }
    return ctx.restore();
  }
  if(k==='ult'||k==='s1'||k==='s2'||k==='s4'){
    const pressure=(k==='ult'?0.32:0.18)*(0.65+0.35*u);
    ctx.globalAlpha=pressure;ctx.strokeStyle='#8b9195';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(cx,cy,36+u*28,-2.7,0.4);ctx.stroke();
    ctx.globalAlpha=pressure*0.6;ctx.strokeStyle='#1a1d20';ctx.lineWidth=7;ctx.beginPath();ctx.arc(cx,cy,48+u*18,0.5,2.8);ctx.stroke();
  }
  ctx.restore();
}
function drawYoungGojoSkillFX(f,P,fd){
  if(f.id!=='young_gojo'||!f.move)return;
  const k=f.move.kind,mf=f.moveFrame,cx=f.x+fd*44,cy=f.y-86;
  const pulse=0.5+Math.sin(f.animT*0.25)*0.5;
  const lerp=(a,b,t)=>a+(b-a)*t;
  const clamp01=v=>clamp(v,0,1);
  const shard=(x,y,s,col,rot=0,a=0.8)=>{
    ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=col;
    const w=s*0.32,h=s*1.8;ctx.beginPath();ctx.moveTo(h,0);ctx.lineTo(0,w);ctx.lineTo(-h*0.72,0);ctx.lineTo(0,-w*0.75);ctx.closePath();ctx.fill();ctx.restore();
  };
  const slash=(x1,y1,x2,y2,col,w=2,a=0.6)=>{
    ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+rnd(-10,10),x2,y2);ctx.stroke();ctx.restore();
  };
  const zig=(x,y,len,col,a=0.65,ang=0)=>{
    ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=col;ctx.lineWidth=1.4;ctx.lineJoin='round';ctx.beginPath();
    ctx.moveTo(x,y);for(let i=1;i<7;i++){const t=i/6;const xx=x+Math.cos(ang)*len*t,yy=y+Math.sin(ang)*len*t + Math.sin(i*2.2+mf*0.2)*4;ctx.lineTo(xx,yy);}ctx.stroke();ctx.restore();
  };
  ctx.save();ctx.globalCompositeOperation='lighter';
  if(k==='young_blue'){
    const q=clamp01(mf/96),bx=cx+fd*(30+Math.sin(mf*0.13)*12),by=cy-6;
    // Blue = compressed vector flow: bright core, long ribbons, shards, micro sparks.
    for(let i=0;i<4;i++){
      const off=i*6+Math.sin(mf*0.18+i)*5;
      slash(bx-fd*(38+i*4),by+off,bx+fd*(58+i*13),by-off-8,'#c8f6ff',1.2+i*0.3,0.28);
    }
    for(let i=0;i<10;i++){
      const a=mf*0.11+i*0.63,rad=10+((i*7)%18);const x=bx+Math.cos(a)*rad,y=by+Math.sin(a)*rad*0.72;
      shard(x,y,2.4+(i%3)*0.8,i%3?'#72ddff':'#efffff',a+1.57,0.38+q*0.32);
    }
    if(mf%3===0){
      const p=ygP(bx-fd*rnd(0,24),by+rnd(-18,18),fd*rnd(2.5,5.8),rnd(-1.2,1.2),rnd(2.2,4.8),Math.random()<0.5?'#dffaff':'#5fd7ff',rnd(8,16),'streak',fd>0?0:Math.PI);p.w=rnd(-4,4);
    }
    if(mf===30||mf===54||mf===78){
      for(let i=0;i<7;i++)shard(bx+fd*rnd(-12,36),by+rnd(-34,34),rnd(2,4),'#dffbff',rnd(-1,1),0.7);
    }
  }
  else if(k==='young_red'){
    const q=clamp01(mf/94),rx=cx+fd*(28+q*34),ry=cy-3;
    // Red = pressure and recoil: angular fragments, compression streaks, shock ribbons.
    for(let i=0;i<5;i++){
      const spread=(i-2)*0.12;
      slash(rx-fd*(14+i*4),ry+spread*50,rx+fd*(54+i*15),ry-spread*70,'#ff6f8b',2.2,0.18+0.06*i);
    }
    for(let i=0;i<14;i++){
      const a=rnd(-0.95,0.95),s=rnd(3,8);const p=ygP(rx+fd*rnd(-14,22),ry+rnd(-30,30),fd*Math.cos(a)*s,Math.sin(a)*s,rnd(2,4.8),Math.random()<0.5?'#ffd8df':'#ff5678',rnd(9,20),'diamond',a);p.h=rnd(6,14);p.w=rnd(2,5);
    }
    if(mf===24||mf===82){
      for(let i=0;i<6;i++)zig(rx+fd*rnd(-4,12),ry+rnd(-26,26),rnd(28,62),i%2?'#ffb0bd':'#fff1f4',0.32,fd>0?0:Math.PI);
      flash(0.08,'#ffe9ee');
    }
  }
  else if(k==='young_sixeyes'){
    // Six Eyes = predictive geometry: thin vectors, target brackets, scanning fragments.
    const trg=f.opp&&f.opp.state!=='DEFEAT'?f.opp:null;
    if(trg){
      const tx=trg.x,ty=trg.y-74;
      slash(cx,cy,lerp(cx,tx,0.92),lerp(cy,ty,0.92),'#e9feff',1.0,0.24);
      const dx=tx-cx,dy=ty-cy,ang=Math.atan2(dy,dx),r=18+Math.sin(f.animT*0.17)*3;
      for(let i=0;i<4;i++){
        const a=ang+(i-1.5)*0.28;const sx=tx+Math.cos(a)*r,sy=ty+Math.sin(a)*r;
        slash(sx-Math.cos(a)*9,sy-Math.sin(a)*9,sx+Math.cos(a)*11,sy+Math.sin(a)*11,'#bdf4ff',1.1,0.34);
      }
    }
    for(let i=0;i<12;i++){
      const a=i*0.71+f.animT*0.045,r=24+(i%4)*11,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*0.62;
      shard(x,y,1.9+(i%2),i%3?'#9ce8ff':'#f4ffff',a,0.32);
    }
    if(mf%16===0)for(let i=0;i<4;i++)zig(cx+fd*rnd(8,48),cy+rnd(-26,20),rnd(18,34),'#d9fbff',0.24,fd>0?0:Math.PI);
  }
  else if(k==='young_limitless'){
    // Infinity = the space between objects. No visible circular wall, only layered refraction slices.
    const drift=Math.sin(f.animT*0.11);
    for(let i=0;i<7;i++){
      const x=cx+fd*(12+i*12),y=cy-42+drift*8+i*4;
      slash(x-fd*18,y+18,x+fd*(26+i*5),y-12,'#dcfbff',1.0+(i%2)*0.4,0.15);
      if(i%2===0)shard(x+fd*20,y-6,2.2,'#ffffff',0.3+i*0.2,0.3);
    }
    for(let i=0;i<5;i++){
      const gap=36+i*10;
      slash(cx-fd*gap,cy-60+i*12,cx+fd*gap*0.6,cy-70+i*8,i%2?'#8fe6ff':'#f3ffff',1.0,0.12);
    }
    if(mf>104&&mf<136)for(let i=0;i<8;i++)shard(cx+fd*rnd(36,108),cy+rnd(-68,24),rnd(2,4),'#bdefff',rnd(-1,1),0.4);
  }
  else if(k==='young_maxblue'){
    // Orbital Collapse = three flowing vectors, not three spheres.
    for(let lane=0;lane<3;lane++){
      const phase=f.animT*0.12+lane*2.1;
      const ox=cx+Math.cos(phase)*78,oy=cy+Math.sin(phase)*28;
      for(let j=0;j<4;j++){
        const tail=18+j*11;
        slash(ox-fd*tail,oy+j*3,ox+fd*(18+j*8),oy-j*2,lane===1?'#e9ffff':'#70d8ff',1.2+(j*0.18),0.18);
      }
      for(let j=0;j<3;j++)shard(ox+rnd(-10,10),oy+rnd(-10,10),2.5+j*0.4,j===1?'#ffffff':'#7ddfff',phase+j*0.6,0.45);
    }
    if(mf>=148){
      for(let i=0;i<18;i++){
        const a=Math.random()*6.283,r=rnd(25,120);const p=ygP(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.65,-Math.cos(a)*rnd(2,5),-Math.sin(a)*rnd(1.2,3),rnd(2,4.6),Math.random()<0.55?'#efffff':'#75ddff',rnd(8,18),'streak',a+Math.PI);p.w=rnd(-5,5);
      }
      for(let i=0;i<8;i++)zig(cx+rnd(-35,35),cy+rnd(-44,36),rnd(34,74),i%2?'#b8efff':'#ffffff',0.23,rnd(-0.8,0.8));
    }
  }
  else if(k==='young_z'){
    // Limitless Step = clean spatial tears + directional streaks.
    const phases=[8,28,50];
    phases.forEach((mark,i)=>{
      if(mf>=mark-3&&mf<=mark+7){
        const q=1-Math.abs(mf-mark)/10;
        for(let j=0;j<7;j++){
          const p=ygP(cx+fd*rnd(-12,24),cy+rnd(-52,36),fd*rnd(2,5),rnd(-1.4,1.4),rnd(2,4.4),j%2?'#dffaff':'#9ae8ff',rnd(7,14),'streak',fd>0?0:Math.PI);p.w=rnd(-6,6);p.size*=0.7+q*0.6;
        }
        for(let j=0;j<4;j++)shard(cx+fd*rnd(-10,24),cy+rnd(-44,28),2.2+j*0.4,'#f1ffff',rnd(-1,1),0.45*q);
      }
    });
  }
  else if(k==='young_x'){
    // Limitless Awakening = dual-polarity particle composition, then a clean purple core release.
    const q=clamp01(mf/278),originX=cx+fd*68,originY=cy-8;
    const phase=f.animT*0.1;
    for(let i=0;i<7;i++){
      const a=phase+i*0.9,r=24+((i*9)%30),bx=originX+Math.cos(a)*r,by=originY+Math.sin(a)*r*0.52;
      slash(bx-fd*22,by+5,bx+fd*30,by-7,'#7ce0ff',1.2,0.16+q*0.12);
      shard(bx,by,2.4,i%2?'#d9faff':'#7bdfff',a,0.28);
    }
    for(let i=0;i<7;i++){
      const a=-phase+i*0.92+Math.PI/7,r=24+((i*11)%34),rx=originX+Math.cos(a)*r,ry=originY+Math.sin(a)*r*0.52;
      slash(rx-fd*26,ry-4,rx+fd*22,ry+8,'#ff7f9a',1.2,0.16+q*0.12);
      shard(rx,ry,2.4,i%2?'#ffe7ec':'#ff7896',a,0.28);
    }
    if(mf>=120&&mf<196){
      for(let i=0;i<5;i++){
        const ang=i*1.15+phase;slash(originX+Math.cos(ang)*18,originY+Math.sin(ang)*10,originX+Math.cos(ang)*88,originY+Math.sin(ang)*34,'#e9dcff',1.3,0.16);
      }
      if(mf%4===0)for(let i=0;i<4;i++)shard(originX+rnd(-12,12),originY+rnd(-18,18),rnd(2,4),i%2?'#c7efff':'#ffc1cf',rnd(-1,1),0.42);
    }
    if(mf>=196){
      const purp=clamp01((mf-196)/22);
      // Purple release uses sharp converging streaks instead of stacked circles.
      for(let i=0;i<14;i++){
        const a=Math.random()*6.283,r=rnd(12,78+purp*55);
        const p=ygP(originX+Math.cos(a)*r,originY+Math.sin(a)*r*0.55,-Math.cos(a)*rnd(3,7),-Math.sin(a)*rnd(1.8,4.6),rnd(2.2,5),Math.random()<0.5?'#ffffff':'#c8a6ff',rnd(7,17),'streak',a+Math.PI);p.w=rnd(-5,5);
      }
      for(let i=0;i<9;i++){
        const a=i*0.7+phase,edge=42+i*8;slash(originX-fd*edge,originY+Math.sin(a)*edge*0.35,originX+fd*edge*0.6,originY-Math.sin(a)*edge*0.22,'#e8ddff',1.2,0.12+purp*0.12);
      }
    }
  }
  ctx.restore();
}
function drawTojiSkillFX(f,P,fd){
  if(f.id!=='toji'||f.state!=='ATTACK'||!f.move||f.moveKey==='x')return;
  const k=f.moveKey,mf=f.moveFrame,sp=Math.max(1,f.move.startup),ac=Math.max(1,f.move.active);
  const hit=mf>=sp&&mf<=sp+ac;
  const steel='#c2c7ca',dark='#454b50',white='#edf0f1',soft='#7b8388';
  const cx=f.x+fd*8,cy=f.y-82;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
  if(k==='light'){
    const q=clamp((mf-sp)/Math.max(1,ac),0,1);
    if(mf<=8){vfxSlashTrail(f.x-fd*18,f.y-78,f.x+fd*26,f.y-112,'#e9edef',3.5,9);}
    if(hit&&mf>=9&&mf<=13)vfxSlashTrail(cx-fd*58,cy+34,cx+fd*112,cy-78,'#f3f5f6',7,10);
    if(hit&&mf>=17&&mf<=21)vfxSlashTrail(cx-fd*92,cy-60,cx+fd*132,cy-60,'#cbd1d4',6,10);
    if(hit&&mf>=24&&mf<=28){vfxSlashTrail(cx+fd*30,cy+40,cx+fd*122,cy+16,'#eef1f2',5,10);spark(cx+fd*110,cy+20,5,'#ffffff',4,4,10,0);}
    if(hit&&mf>=32&&mf<=35){vfxSlashTrail(cx-fd*8,cy-96,cx+fd*170,cy-96,'#ffffff',6,12);vfxShockwave(cx+fd*128,cy-96,'#e9edef',32,11);}
  }else if(k==='heavy'){
    if(mf>=sp&&mf<=28){vfxSlashTrail(cx-fd*120,cy-126,cx+fd*170,cy-28,'#eef2f3',10,13);ctx.globalAlpha=.28;ctx.strokeStyle='#ffffff';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(cx-fd*128,cy-132);ctx.lineTo(cx+fd*178,cy-28);ctx.stroke();}
    if(mf===22||mf===23){vfxShockwave(cx+fd*104,cy-78,'#e9edef',62,13);flash(.16,'#ffffff');}
    if(mf>=30&&mf<=52){const q=(mf-30)/22;ctx.globalAlpha=.22;ctx.strokeStyle='#bfc6ca';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx-fd*8,cy-58,56+q*24,Math.PI*1.15,Math.PI*1.9);ctx.stroke();}
    if(mf===42)tojiSeqFX(f,'BACKFLIP','#d5dadd',.18);
  }else if(k==='s1'){
    /* Katana: diagonal rise, then a separate low reverse cut. */
    const q=clamp((mf-sp)/Math.max(1,ac),0,1);
    if(mf<sp){
      ctx.globalAlpha=.28;ctx.strokeStyle=soft;ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(cx-fd*54,cy+34);ctx.lineTo(cx+fd*16,cy-26);ctx.stroke();
    }
    if(hit){
      const rise=phase01(mf,sp,sp+18);
      vfxSlashTrail(cx-fd*56,cy+36,cx+fd*96,cy-86,'#e7ecee',7,12);
      if(mf>sp+28)vfxSlashTrail(cx+fd*74,cy-76,cx-fd*34,cy+28,'#9fa7ac',5,10);
      ctx.globalAlpha=.2+.18*q;ctx.strokeStyle=white;ctx.lineWidth=2.2;
      ctx.beginPath();ctx.moveTo(cx-fd*60,cy+42);ctx.lineTo(cx+fd*(108-24*rise),cy-86+54*q);ctx.stroke();
      if(mf===sp+18||mf===sp+46)pushAfterimage(f,computePose(f));
    }
  }else if(k==='s2'){
    /* ISOH: three clearly different thrust heights, including a downward diagonal. */
    const p=clamp((mf-sp)/Math.max(1,ac),0,1);
    if(mf<sp){
      ctx.globalAlpha=.18;ctx.strokeStyle=steel;ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(cx-fd*10,cy+30);ctx.lineTo(cx+fd*54,cy+16);ctx.stroke();
    }
    if(hit){
      const n=Math.floor((mf-sp)/16);
      const phaseY=n===0?cy-10:(n===1?cy+8:cy+34);
      const startX=n===2?cx+fd*54:cx+fd*8;
      const startY=n===2?cy-50:phaseY;
      const endX=cx+fd*(n===0?176:(n===1?216:150));
      const endY=n===2?cy+58:phaseY;
      vfxSlashTrail(startX,startY,endX,endY,'#eef2f3',5+(n===1?2:0),10);
      ctx.globalAlpha=.55;ctx.strokeStyle=white;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(startX,startY);ctx.lineTo(endX,endY);ctx.stroke();
      if(mf%16===sp%16){spark(endX,endY,4,white,4,4,10,0.02);}
    }
    if(mf===sp+40||mf===sp+66)pushAfterimage(f,computePose(f));
  }else if(k==='s3'){
    /* Chain: low sweep ellipse, side pull, then overhead lash. */
    const p=clamp((mf-sp)/Math.max(1,ac),0,1);
    if(mf<sp+22){
      ctx.globalAlpha=.28;ctx.strokeStyle=steel;ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(cx+fd*30,cy+38,78,24,-0.25,0.15,2.55);ctx.stroke();
    }else if(mf<sp+54){
      ctx.globalAlpha=.22+.14*p;ctx.strokeStyle=white;ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(cx-fd*10,cy+34);ctx.quadraticCurveTo(cx+fd*62,cy-20,cx+fd*148,cy+8);ctx.stroke();
      vfxSlashTrail(cx-fd*30,cy+24,cx+fd*148,cy+4,white,3.5,11);
    }else if(hit){
      const q=phase01(mf,sp+54,sp+92);
      vfxSlashTrail(cx+fd*42,cy+30,cx-fd*22,cy-74,'#cfd5d9',5,11);
      vfxSlashTrail(cx-fd*10,cy-70,cx+fd*112,cy-112+q*70,'#e9edef',4,10);
    }
    if(mf===sp+22||mf===sp+54||mf===sp+92)pushAfterimage(f,computePose(f));
  }else if(k==='s4'){
    /* Playful Cloud: overhead smash, horizontal spin and a floor-level sweep. */
    const p=Math.max(0,mf-sp);
    if(mf<sp){
      ctx.globalAlpha=.2;ctx.strokeStyle=soft;ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,62,-2.6,-.65);ctx.stroke();
    }else if(p<42){
      const q=phase01(p,0,42);vfxSlashTrail(cx-fd*12,cy+10,cx+fd*86,cy-90-q*10,'#dfe4e7',7,11);
      ctx.globalAlpha=.34;ctx.strokeStyle=white;ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx+fd*38,cy-30,72,-1.9+q*1.1,0.25+q*1.1);ctx.stroke();
    }else if(p<86){
      const q=phase01(p,42,86);vfxSlashTrail(cx+fd*110,cy-42,cx-fd*100,cy+24,'#c3c9cd',8,12);ctx.globalAlpha=.36;ctx.strokeStyle=white;ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,82,q*Math.PI-0.8,q*Math.PI+1.0);ctx.stroke();
    }else if(hit){
      vfxSlashTrail(cx-fd*72,cy+42,cx+fd*150,cy+12,'#e4e8ea',8,12);
      ctx.globalAlpha=.38;ctx.strokeStyle=white;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-fd*88,cy+36);ctx.lineTo(cx+fd*160,cy+10);ctx.stroke();
    }
    if(p===42||p===86||mf===sp+ac)pushAfterimage(f,computePose(f));
  }else if(k==='s5'){
    /* Predator: nearly horizontal vanish lines, then a rear-level strike. */
    const q=clamp(mf/Math.max(1,sp),0,1);
    ctx.globalAlpha=.18*(1-q);ctx.strokeStyle='#1a1d20';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(cx-fd*26,cy+24);ctx.lineTo(cx+fd*96,cy+6);ctx.stroke();
    if(mf<sp){
      for(let i=0;i<4;i++){ctx.globalAlpha=.14;ctx.strokeStyle=steel;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(cx-fd*(20+i*18),cy+30-i*6);ctx.lineTo(cx+fd*(56+i*22),cy+14-i*2);ctx.stroke();}
    }
    if(mf===sp){flash(.13,'#e7ebed');shake(8);camPunch(.10);}
    if(hit){vfxSlashTrail(cx-fd*90,cy+8,cx+fd*92,cy-6,'#dfe4e7',6,10);if(mf===sp+1||mf===sp+2)pushAfterimage(f,computePose(f));}
  }else if(k==='z'){
    /* Z: spatial blink marker, vertical tear, then diagonal descent. */
    if(mf<30){
      ctx.globalAlpha=.24;ctx.strokeStyle=soft;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-fd*42,cy+24);ctx.lineTo(cx+fd*58,cy+24);ctx.stroke();
    }else if(mf<76){
      ctx.globalAlpha=.30;ctx.strokeStyle=white;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx+fd*4,cy+42);ctx.lineTo(cx+fd*4,cy-96);ctx.stroke();
      ctx.globalAlpha=.18;ctx.strokeStyle=steel;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(cx-fd*10,cy+30);ctx.lineTo(cx+fd*10,cy-88);ctx.stroke();
    }else if(hit){
      vfxSlashTrail(cx+fd*64,cy-98,cx-fd*46,cy+68,'#eef1f2',7,11);
      vfxSlashTrail(cx+fd*34,cy-72,cx-fd*70,cy+48,'#9da5aa',3,9);
      if(mf===100||mf===118)pushAfterimage(f,computePose(f));
    }
  }else if(k==='def'){
    ctx.globalAlpha=.28;ctx.strokeStyle=steel;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(cx-fd*8,cy-56);ctx.lineTo(cx+fd*42,cy+28);ctx.stroke();
    ctx.globalAlpha=.18;ctx.strokeStyle=white;ctx.lineWidth=7;ctx.beginPath();ctx.arc(cx+fd*20,cy-32,38,-2.2,.35);ctx.stroke();
  }else if(k==='ult'){
    /* Cursed Arsenal: weapon-phase visuals change by section. */
    const p=mf;
    if(p<50){vfxSlashTrail(cx-fd*54,cy+34,cx+fd*100,cy-72,'#e8ecee',7,11);}
    else if(p<105){vfxSlashTrail(cx+fd*18,cy-8,cx+fd*180,cy-4,'#f0f2f3',6,10);}
    else if(p<165){vfxSlashTrail(cx-fd*20,cy+40,cx+fd*130,cy-28,'#c7cdd1',6,10);}
    else if(p<225){vfxSlashTrail(cx-fd*110,cy+8,cx+fd*150,cy+34,'#e2e6e8',8,11);}
    else if(hit){vfxSlashTrail(cx-fd*74,cy-86,cx+fd*186,cy+20,'#f3f5f6',10,14);}
    if([50,105,165,225].includes(mf))pushAfterimage(f,computePose(f));
  }
  ctx.restore();
}

function drawTojiCineDownedFighter(f){
  const c=G.tojiCineX;if(!c||f!==c.target)return false;
  const q=phase01(f.cineKnockdown?725:0,725,790);
  const t=c.frame;
  let fall=clamp((t-725)/65,0,1);fall=tojiCineEase(fall);
  if(t<725)return false;
  const C=getColors(f),fd=f.facing||1,bx=f.x,by=GROUND;
  // Grounded shadow keeps the body visually pinned to the floor.
  ctx.save();ctx.globalAlpha=.26;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(bx+18,GROUND+3,62,10,0,0,6.283);ctx.fill();ctx.restore();
  const U={hip:{x:bx,y:by-58},sh:{x:bx,y:by-96},head:{x:bx,y:by-120},arm1a:{x:bx+12,y:by-70},arm1b:{x:bx+30,y:by-30},leg1a:{x:bx+8,y:by-32},leg1b:{x:bx+14,y:by-5}};
  const L={hip:{x:bx-10,y:by-30},sh:{x:bx+28,y:by-30},head:{x:bx+54,y:by-32},arm1a:{x:bx+2,y:by-28},arm1b:{x:bx-26,y:by-12},leg1a:{x:bx+8,y:by-30},leg1b:{x:bx+66,y:by-18}};
  const p=(a,b)=>({x:lerp(a.x,b.x,fall),y:lerp(a.y,b.y,fall)});
  const hip=p(U.hip,L.hip),sh=p(U.sh,L.sh),head=p(U.head,L.head),a1=p(U.arm1a,L.arm1a),a2=p(U.arm1b,L.arm1b),l1=p(U.leg1a,L.leg1a),l2=p(U.leg1b,L.leg1b);
  capsule(hip.x,hip.y,sh.x,sh.y,15,C.top);
  capsule(hip.x,hip.y,l1.x,l1.y,8,C.bottom);capsule(l1.x,l1.y,l2.x,l2.y,7,C.bottom);
  capsule(sh.x,sh.y,a1.x,a1.y,7,C.top);capsule(a1.x,a1.y,a2.x,a2.y,6,C.skin);
  capsule(sh.x,sh.y,sh.x-8,sh.y+18,7,C.skin);
  capsule(sh.x-8,sh.y+18,sh.x-26,sh.y+28,6,C.skin);
  ctx.fillStyle=C.hair2;ctx.beginPath();ctx.arc(head.x,head.y,14.5,0,6.283);ctx.fill();
  ctx.fillStyle=C.skin;ctx.beginPath();ctx.arc(head.x,head.y,11.5,0,6.283);ctx.fill();
  ctx.fillStyle=C.hair;ctx.beginPath();ctx.moveTo(head.x-12,head.y-2);for(let i=0;i<7;i++){const aa=Math.PI+(i/6)*Math.PI,rr=14+((i%2)?4:1.5);ctx.lineTo(head.x+Math.cos(aa)*rr,head.y+Math.sin(aa)*rr-3);}ctx.lineTo(head.x+13,head.y-2);ctx.closePath();ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=(f.id==='gojo'||f.id==='young_gojo')?'#8de3ff':'#e6e9eb';ctx.beginPath();ctx.ellipse(head.x+fd*4,head.y+1.5,2.4,1.5,0,0,6.283);ctx.fill();ctx.restore();
  if(fall>.45){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.12+.14*fall;ctx.strokeStyle='#cfd5d9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx-38,GROUND-7);ctx.lineTo(bx+84,GROUND-7);ctx.stroke();ctx.restore();}
  return true;
}
function drawFighter(f){
  if(G.tojiCineX && f===G.tojiCineX.target && f.cineKnockdown>0){ if(drawTojiCineDownedFighter(f)) return; }
  drawStrongestSkillVisuals(f);
  drawTojiInventoryCurse(f,null,f.facing);
  drawRikaBehind(f);
  drawHakariJackpotAura(f);
  const P=computePose(f);
  const C=getColors(f);
  const fd=f.facing;
  const bx=f.x,by=f.y;
  const wx=lx=>bx+lx*fd;const wy=ly=>by+ly;
  const hip={x:0,y:P.hipY};const sh={x:P.lean*0.28,y:P.shY};const head={x:P.lean*0.34+(P.headX||0),y:P.headY};
  ctx.save();ctx.globalAlpha=0.34*clamp(1-(GROUND-f.y)/260,0.15,1);ctx.fillStyle='#000';
  ctx.beginPath();ctx.ellipse(bx,GROUND+3,34*clamp(1-(GROUND-f.y)/500,0.5,1),10,0,0,6.29);ctx.fill();ctx.restore();
  const auraOn=f.awakened||f.infinity>0||(f.domainCharge>0&&f.state==='ATTACK')||f.awakenGlow>0||f.ultCharging||(f.jackpot>0)||(f.id==='heian_sukuna'&&G.domain&&G.domain.owner===f)||(f.id==='the_strongest_today'&&f.overdriveActive);
  if(auraOn){
    ctx.save();ctx.globalCompositeOperation='lighter';
    const pulse=0.55+Math.sin(f.animT*0.16)*0.2;
    const ac=(f.id==='gojo')?'#7fd8ff':(f.id==='yuta')?'#c9a6ff':(f.id==='hakari'?'#ffd166':(f.id==='heian_sukuna'?'#ff3344':(f.id==='the_strongest_today'?STRONGEST_CYAN:'#ff3344')));
    const g=ctx.createRadialGradient(bx,by-58,4,bx,by-58,80);
    g.addColorStop(0,ac+Math.floor(pulse*90).toString(16).padStart(2,'0'));
    g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;
    ctx.beginPath();ctx.ellipse(bx,by-58,62,86,0,0,6.29);ctx.fill();ctx.restore();
  }
  if(f.infinity>0){
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<3;i++){ctx.strokeStyle='rgba(127,216,255,'+(0.30-i*0.08)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx+fd*38,by-62,26+i*13+Math.sin(f.animT*0.2+i)*4,0,6.29);ctx.stroke();}
    ctx.restore();
  }
  if(f.guardArmor>0){
    ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.strokeStyle=(f.id==='yuta')?'rgba(201,166,255,0.55)':(f.id==='hakari'?'rgba(255,209,102,0.65)':(f.id==='the_strongest_today'?'rgba(0,229,255,0.75)':'rgba(255,85,102,0.55)'));
    ctx.lineWidth=3;ctx.beginPath();ctx.arc(bx,by-58,52,0,6.29);ctx.stroke();ctx.restore();
  }
  if(f.state==='IMMOBILIZED'){
    ctx.save();ctx.globalCompositeOperation='lighter';
    const a=0.35+Math.sin(f.animT*0.3)*0.15;
    ctx.strokeStyle='rgba(201,166,255,'+a+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(bx,by-60,58,0,6.29);ctx.stroke();
    ctx.fillStyle='rgba(224,208,255,'+a+')';ctx.font='700 16px "Segoe UI", system-ui, sans-serif';ctx.textAlign='center';
    const isCleaveGrab = f.opp && f.opp.id==='heian_sukuna' && f.opp.move && f.opp.move.kind==='cleave_seq';
    if(!isCleaveGrab) ctx.fillText('DON\u2019T MOVE',bx,by-160);
    ctx.restore();
  }
  const shPt={x:wx(sh.x),y:wy(sh.y)};const hipPt={x:wx(hip.x),y:wy(hip.y)};const headPt={x:wx(head.x),y:wy(head.y)};
  if(f.id==='heian_sukuna'){drawHeianArms(f,shPt,hipPt,P,fd,C,f.animT);}
  const bAng=P.legB[0];const kb=joint(hipPt,bAng,28);const fb=joint(kb,bAng+P.legB[1],30);
  const bA1=P.armB[0],bA2=P.armB[1];const eb=joint(shPt,bA1,20);const hb2=joint(eb,bA1+bA2,20);
  capsule(hipPt.x,hipPt.y,kb.x,kb.y,7.5,darken(C.bottom,0.72));
  capsule(kb.x,kb.y,fb.x,fb.y,6,darken(C.bottom,0.72));
  ctx.save();ctx.translate(fb.x,fb.y);ctx.fillStyle=darken(C.bottom,0.5);ctx.beginPath();ctx.ellipse(0,2,8,5,0,0,6.29);ctx.fill();ctx.restore();
  capsule(shPt.x,shPt.y,eb.x,eb.y,7,darken(C.top,0.75));
  capsule(eb.x,eb.y,hb2.x,hb2.y,6,darken(C.skin,0.78));
  ctx.fillStyle=darken(C.skin,0.78);ctx.beginPath();ctx.arc(hb2.x,hb2.y,5.6,0,6.29);ctx.fill();
  const torsoFill=ctx.createLinearGradient(hipPt.x-18,0,hipPt.x+18,0);
  torsoFill.addColorStop(0,darken(C.top,0.65));torsoFill.addColorStop(0.45,C.top);torsoFill.addColorStop(1,C.top2);
  ctx.fillStyle=torsoFill;ctx.beginPath();
  const sw=15,hw=11;const perp=Math.atan2(shPt.y-hipPt.y,shPt.x-hipPt.x)+Math.PI/2;const px=Math.cos(perp),py=Math.sin(perp);
  ctx.moveTo(shPt.x+px*sw,shPt.y+py*sw);ctx.lineTo(hipPt.x+px*hw,hipPt.y+py*hw);
  ctx.lineTo(hipPt.x-px*hw,hipPt.y-py*hw);ctx.lineTo(shPt.x-px*sw,shPt.y-py*sw);ctx.closePath();ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=C.accent+'88';ctx.lineWidth=1.6;
  ctx.beginPath();ctx.moveTo(shPt.x-px*4,shPt.y-py*4+6);ctx.lineTo(hipPt.x-px*4,hipPt.y-py*4);ctx.stroke();ctx.restore();
  const fAng=P.legF[0];const kf=joint(hipPt,fAng,28);const ff=joint(kf,fAng+P.legF[1],30);
  capsule(hipPt.x,hipPt.y,kf.x,kf.y,8.4,C.bottom);capsule(kf.x,kf.y,ff.x,ff.y,6.6,C.bottom);
  ctx.save();ctx.translate(ff.x,ff.y);ctx.fillStyle=darken(C.bottom,0.8);ctx.beginPath();ctx.ellipse(fd*2,2,9,5.4,0,0,6.29);ctx.fill();ctx.restore();
  const fA1=P.armF[0],fA2=P.armF[1];const ef=joint(shPt,fA1,20);const hf=joint(ef,fA1+fA2,20);
  capsule(shPt.x,shPt.y,ef.x,ef.y,7.8,C.top);capsule(ef.x,ef.y,hf.x,hf.y,6.4,C.skin);
  if(f.id==='heian_sukuna'&&f.state==='ATTACK'&&f.move){
    if(f.moveKey==='def')drawKamutokeInHand(f,P,fd);
    else if(f.moveKey==='s5')drawHitenInHand(f,P,fd);
  }
  if(f.id==='young_gojo'){drawYoungGojoSkillFX(f,P,fd);}
  if(f.id==='toji'){drawTojiSkillFX(f,P,fd);drawTojiWeapon(f,P,fd);drawTojiMenace(f,P,fd);if(f.moveKey==='x'&&G.tojiCineX)drawTojiCinematicXFX(f,P,fd);}
  if(f.id==='the_strongest_today'&&f.state==='ATTACK'&&f.move){
    const k=f.move.kind;
    if(k==='strongest_maxblue'||k==='strongest_maxred'||k==='strongest_purplechant'){
      ctx.save();ctx.globalCompositeOperation='lighter';
      const fingerColor=k==='strongest_maxblue'?'rgba(150,235,255,0.85)':(k==='strongest_maxred'?'rgba(255,140,160,0.85)':'rgba(230,215,255,0.8)');
      const aFront=(fA1+fA2)*D2R;const frontX=hf.x,frontY=hf.y;
      const spread=k==='strongest_purplechant'?0.34:0.28;
      ctx.strokeStyle=fingerColor;ctx.lineWidth=1.2;ctx.lineCap='round';
      for(let i=-1;i<=1;i++){
        ctx.beginPath();ctx.moveTo(frontX,frontY);ctx.lineTo(frontX+Math.cos(aFront+i*spread)*8,frontY+Math.sin(aFront+i*spread)*8);ctx.stroke();
      }
      if(k==='strongest_purplechant'){
        const aBack=(P.armB[0]+P.armB[1])*D2R;const bx2=hb2.x,by2=hb2.y;
        for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(bx2,by2);ctx.lineTo(bx2+Math.cos(aBack+i*0.30)*8,by2+Math.sin(aBack+i*0.30)*8);ctx.stroke();}
        const chantStart=Math.floor(f.move.startup*0.23),chantEnd=Math.floor(f.move.startup*0.925);
        if(f.moveFrame>=chantStart&&f.moveFrame<=chantEnd){
          const mouthOpen=2.4+Math.sin(f.animT*0.7)*1.2;
          const mx=headPt.x+fd*1,my=headPt.y+8;
          ctx.strokeStyle='rgba(30,10,30,0.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mx,my,mouthOpen,0.15*Math.PI,0.85*Math.PI);ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
  if(f.id==='yuta'){
    ctx.save();const ang=(fA1+fA2)*D2R;const bladeLen=54;
    const hx2=hf.x+Math.cos(ang)*8,hy2=hf.y+Math.sin(ang)*8;
    const ex=hx2+Math.cos(ang)*bladeLen,ey=hy2+Math.sin(ang)*bladeLen;
    ctx.strokeStyle='#e8e8f2';ctx.lineWidth=3.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hx2,hy2);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.strokeStyle='#3a3a55';ctx.lineWidth=4;const gpx=-Math.sin(ang)*6,gpy=Math.cos(ang)*6;
    ctx.beginPath();ctx.moveTo(hx2-gpx,hy2-gpy);ctx.lineTo(hx2+gpx,hy2+gpy);ctx.stroke();
    if(f.state==='ATTACK'&&f.move&&f.moveFrame>f.move.startup&&f.moveFrame<=f.move.startup+f.move.active){ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(201,166,255,0.85)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(hx2,hy2);ctx.lineTo(ex,ey);ctx.stroke();}
    ctx.restore();
  }
  const headR=12;
  ctx.save();ctx.strokeStyle=C.skin2;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(shPt.x,shPt.y);ctx.lineTo(headPt.x,headPt.y+8);ctx.stroke();ctx.restore();
  ctx.fillStyle=C.hair2;ctx.beginPath();ctx.arc(headPt.x-fd*2,headPt.y-1,headR+2.4,0,6.29);ctx.fill();
  const fg=ctx.createLinearGradient(headPt.x-headR,0,headPt.x+headR,0);
  fg.addColorStop(0,C.skin2);fg.addColorStop(0.5,C.skin);fg.addColorStop(1,C.skin);
  ctx.fillStyle=fg;ctx.beginPath();ctx.arc(headPt.x,headPt.y,headR,0,6.29);ctx.fill();
  ctx.fillStyle=C.hair;ctx.beginPath();
  ctx.moveTo(headPt.x-headR-1,headPt.y-2);
  for(let i=0;i<7;i++){const a=Math.PI+(i/6)*Math.PI;const rr=headR+3+((i%2)?4.5:1.5);ctx.lineTo(headPt.x+Math.cos(a)*rr,headPt.y+Math.sin(a)*rr-2);}
  ctx.lineTo(headPt.x+headR+1,headPt.y-2);ctx.closePath();ctx.fill();
  ctx.fillStyle=f.state==='DEFEAT'?'#553':({gojo:'#3fd0ff',young_gojo:'#a8eaff',yuta:'#c9a6ff',hakari:'#ffd166',heian_sukuna:'#ff8899',the_strongest_today:STRONGEST_CYAN}[f.id]||'#ff3344');
  ctx.save();ctx.shadowBlur=8;ctx.shadowColor=ctx.fillStyle;const eyeDir=fd;
  if(f.state!=='DEFEAT'){ctx.beginPath();ctx.ellipse(headPt.x+eyeDir*4,headPt.y+1.5,2.6,1.7,0,0,6.29);ctx.fill();}
  else{ctx.strokeStyle='#553';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(headPt.x+eyeDir*1,headPt.y);ctx.lineTo(headPt.x+eyeDir*7,headPt.y+3);ctx.moveTo(headPt.x+eyeDir*7,headPt.y);ctx.lineTo(headPt.x+eyeDir*1,headPt.y+3);ctx.stroke();}
  ctx.restore();
  if(f.id==='young_gojo'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(190,244,255,0.78)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(headPt.x+fd*1,headPt.y+1);ctx.lineTo(headPt.x+fd*8,headPt.y+1);ctx.stroke();if(f.youngSixEyes>0||f.move?.kind==='young_x'){ctx.globalAlpha=0.85;ctx.strokeStyle='#e9fdff';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(headPt.x+fd*2,headPt.y-2);ctx.lineTo(headPt.x+fd*9,headPt.y+4);ctx.moveTo(headPt.x+fd*2,headPt.y+5);ctx.lineTo(headPt.x+fd*9,headPt.y-2);ctx.stroke();const p=ygP(headPt.x+fd*10,headPt.y+1,fd*rnd(0.5,1.1),rnd(-0.2,0.2),rnd(1.2,2.2),'#ffffff',8,'cross',0.785);p.add=true;}ctx.restore();}
  if(f.id==='sukuna'&&f.form===0){ctx.strokeStyle='rgba(30,10,14,0.85)';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(headPt.x+fd*2,headPt.y-9);ctx.lineTo(headPt.x+fd*7,headPt.y-3);ctx.moveTo(headPt.x-fd*2,headPt.y-9);ctx.lineTo(headPt.x-fd*5,headPt.y-4);ctx.stroke();}
  if(f.id==='sukuna'&&f.form===1){ctx.strokeStyle='rgba(120,20,40,0.7)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(headPt.x-fd*4,headPt.y+3);ctx.lineTo(headPt.x+fd*5,headPt.y+3);ctx.stroke();}
  if(f.id==='heian_sukuna'){
    ctx.fillStyle='#ff4455';ctx.globalAlpha=0.75;
    ctx.beginPath();ctx.ellipse(headPt.x+fd*2,headPt.y-2,2,1.4,0,0,6.29);ctx.fill();
    ctx.beginPath();ctx.ellipse(headPt.x-fd*2,headPt.y+1,1.6,1.2,0,0,6.29);ctx.fill();
    ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(20,8,8,0.9)';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(headPt.x+fd*3,headPt.y-9);ctx.lineTo(headPt.x+fd*8,headPt.y-2);ctx.moveTo(headPt.x-fd*3,headPt.y-9);ctx.lineTo(headPt.x-fd*7,headPt.y-3);ctx.stroke();
  }
  if(f.id==='the_strongest_today'&&f.overdriveActive){
    ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=STRONGEST_CYAN;ctx.globalAlpha=0.75+Math.sin(f.animT*0.3)*0.2;
    ctx.beginPath();ctx.ellipse(headPt.x+fd*4,headPt.y+1.5,3.2,2.2,0,0,6.29);ctx.fill();
    ctx.globalAlpha=0.5;
    ctx.beginPath();ctx.arc(headPt.x+fd*4,headPt.y+1.5,6,0,6.29);ctx.fill();
    ctx.restore();
  }
  drawCharacterIdentityDetails(f,P,fd,bx,by,shPt,hipPt,headPt,hf,ef);
  if(f.id==='heian_sukuna')drawKamutokeLightning(f);
  if(f.id==='hakari'){ctx.strokeStyle='rgba(255,209,102,0.75)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(shPt.x-4,shPt.y+4);ctx.lineTo(shPt.x,shPt.y+12);ctx.lineTo(shPt.x+4,shPt.y+4);ctx.stroke();ctx.fillStyle='rgba(255,209,102,0.9)';ctx.beginPath();ctx.arc(shPt.x,shPt.y+13,1.8,0,6.29);ctx.fill();}
  ctx.fillStyle=C.skin;ctx.beginPath();ctx.arc(hf.x,hf.y,6.4,0,6.29);ctx.fill();
  if(f.state==='ATTACK'&&f.move&&f.move.hitbox&&f.moveFrame>f.move.startup&&f.moveFrame<=f.move.startup+f.move.active){
    ctx.save();ctx.globalCompositeOperation='lighter';
    const hb=f.move.hitbox;const hx=wx(hb.x+hb.w*0.5),hy=wy(hb.y+hb.h*0.5);
    const g=ctx.createRadialGradient(hx,hy,2,hx,hy,hb.w*0.62);
    const ac=f.blackFlash?'#ff2244':(f.jackpot>0?'#ffd166':(f.id==='heian_sukuna'?'#ff3344':(f.id==='the_strongest_today'?STRONGEST_CYAN:C.aura)));
    g.addColorStop(0,ac+'cc');g.addColorStop(0.5,ac+'44');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(hx,hy,hb.w*0.6,hb.h*0.55,0,0,6.29);ctx.fill();ctx.restore();
  }
  if(f.state==='ATTACK'&&f.move&&f.moveFrame>f.move.startup&&f.moveFrame<=f.move.startup+f.move.active){
    const kind=f.move.kind;
    if(kind==='light'||kind==='heavy'||kind==='air'||kind==='skill1'||kind==='skill2'||kind==='skill4'||kind==='skill5'||kind==='strongest_bf'||kind==='strongest_closecombat'){
      ctx.save();ctx.globalCompositeOperation='lighter';
      const a1=P.armF[0],a2=P.armF[0]+P.armF[1];
      const shP={x:wx(P.lean*0.28),y:wy(P.shY)};const e1=joint(shP,a1,20);const h1=joint(e1,a2,20);
      const col=f.blackFlash?'#ff2244':(f.jackpot>0?'#ffd166':(f.id==='heian_sukuna'?'#ff3344':(f.id==='the_strongest_today'?STRONGEST_CYAN:C.aura)));
      const grad=ctx.createLinearGradient(shP.x,shP.y,h1.x,h1.y);
      grad.addColorStop(0,'rgba(255,255,255,0)');grad.addColorStop(0.6,col+'99');grad.addColorStop(1,col+'ff');
      ctx.strokeStyle=grad;ctx.lineWidth=f.move.kind==='heavy'?7:4;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(shP.x,shP.y);ctx.quadraticCurveTo(e1.x,e1.y,h1.x,h1.y);ctx.stroke();
      ctx.restore();
    }
  }
  if(f.hitFlash>0){
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=f.hitFlash/8*0.55;
    ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(bx,by-58,30,62,0,0,6.29);ctx.fill();ctx.restore();
  }
}
/* ===== PROJECTILE RENDER ===== */
function drawProjectiles(){
  for(const p of G.projectiles){
    ctx.save();ctx.translate(p.x,p.y);
    if(p.type==='purple'){
      ctx.globalCompositeOperation='lighter';
      const g=ctx.createRadialGradient(0,0,4,0,0,62);g.addColorStop(0,'#ffffff');g.addColorStop(0.22,'#e0b0ff');g.addColorStop(0.55,'#8a2be2');g.addColorStop(1,'rgba(60,0,120,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,62,52,0,0,6.29);ctx.fill();
      ctx.strokeStyle='rgba(200,140,255,0.75)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,44+Math.sin(p.t*0.3)*5,36,0,0,6.29);ctx.stroke();
    }else if(p.type==='dismantle'){
      ctx.globalCompositeOperation='lighter';
      const g=ctx.createLinearGradient(-30,0,30,0);g.addColorStop(0,'rgba(255,60,80,0)');g.addColorStop(0.5,'rgba(255,120,140,0.95)');g.addColorStop(1,'rgba(255,220,220,1)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-30,-9);ctx.lineTo(30,0);ctx.lineTo(-30,9);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(255,200,200,0.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-34,-14);ctx.lineTo(26,-2);ctx.stroke();
    }else if(p.type==='dismantle_heian'){
      const dir=Math.sign(p.vx)||1;
      ctx.globalCompositeOperation='lighter';
      const size=80;
      ctx.fillStyle='rgba(255,40,70,0.5)';
      ctx.beginPath();
      ctx.moveTo(dir*size,0);
      ctx.lineTo(-dir*size*0.25,-size*0.55);
      ctx.lineTo(-dir*size*0.6,-size*0.15);
      ctx.lineTo(-dir*size*0.9,-size*0.42);
      ctx.lineTo(-dir*size*0.35,size*0.15);
      ctx.lineTo(-dir*size*0.7,size*0.4);
      ctx.lineTo(-dir*size*0.1,size*0.28);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.9)';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(dir*size*0.9,0);ctx.lineTo(-dir*size*0.5,size*0.06);ctx.stroke();
      ctx.strokeStyle='rgba(255,80,110,0.85)';ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(dir*size*0.9,0);ctx.lineTo(-dir*size*0.25,-size*0.55);
      ctx.moveTo(dir*size*0.9,0);ctx.lineTo(-dir*size*0.25,size*0.55);
      ctx.stroke();
    }else if(p.type==='toji_chain'){
      ctx.globalCompositeOperation='lighter';
      const dir=Math.sign(p.vx)||1, wobble=Math.sin(p.t*0.42)*7;
      ctx.lineCap='round';
      ctx.strokeStyle='rgba(24,70,54,0.9)';ctx.lineWidth=9;
      ctx.beginPath();ctx.moveTo(-p.vx*2.4,-wobble);ctx.quadraticCurveTo(-p.vx*1.0,wobble,dir*22,0);ctx.stroke();
      ctx.strokeStyle='rgba(200,255,235,0.92)';ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(-p.vx*2.35,-wobble);ctx.quadraticCurveTo(-p.vx*0.9,wobble*0.4,dir*24,0);ctx.stroke();
      ctx.strokeStyle='#66ffbe';ctx.lineWidth=1.8;
      ctx.beginPath();ctx.moveTo(-p.vx*2.1,-wobble-4);ctx.quadraticCurveTo(-p.vx*0.8,wobble*0.2,dir*24,0);ctx.stroke();
      for(let i=0;i<5;i++){
        const a=p.t*0.18+i*Math.PI*2/5, rr=10+i*2;
        ctx.globalAlpha=0.6-i*0.08;ctx.strokeStyle='#66ffbe';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(dir*22,0,rr,a,a+1.4);ctx.stroke();
      }
      ctx.globalAlpha=0.9;ctx.fillStyle='#eafff5';ctx.beginPath();ctx.arc(dir*22,0,8+Math.sin(p.t*.35)*2,0,6.29);ctx.fill();
      ctx.strokeStyle='#66ffbe';ctx.lineWidth=3;ctx.beginPath();ctx.arc(dir*22,0,15+Math.sin(p.t*.25)*2,0,6.29);ctx.stroke();
    }else if(p.type==='rika'){
      ctx.globalCompositeOperation='lighter';
      const g=ctx.createRadialGradient(0,0,10,0,0,90);g.addColorStop(0,'rgba(255,255,255,0.85)');g.addColorStop(0.35,'rgba(220,190,255,0.55)');g.addColorStop(1,'rgba(120,80,180,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,80,90,0,0,6.29);ctx.fill();
      ctx.fillStyle='rgba(230,210,255,0.85)';ctx.beginPath();ctx.ellipse(0,-10,26,60,0,0,6.29);ctx.fill();ctx.beginPath();ctx.arc(0,-80,20,0,6.29);ctx.fill();
      ctx.fillStyle='#1a0033';ctx.beginPath();ctx.arc(-6,-84,2,0,6.29);ctx.fill();ctx.beginPath();ctx.arc(6,-84,2,0,6.29);ctx.fill();
    }else if(p.type==='fuga'){
      ctx.globalCompositeOperation='lighter';
      const g1=ctx.createRadialGradient(0,0,6,0,0,48);
      g1.addColorStop(0,'rgba(255,230,150,0.95)');g1.addColorStop(0.35,'rgba(255,140,50,0.85)');g1.addColorStop(0.75,'rgba(255,60,20,0.5)');g1.addColorStop(1,'rgba(120,20,0,0)');
      ctx.fillStyle=g1;ctx.beginPath();ctx.ellipse(0,0,44+Math.sin(p.t*0.4)*4,40+Math.cos(p.t*0.3)*3,0,0,6.29);ctx.fill();
      const g2=ctx.createRadialGradient(0,0,2,0,0,22);g2.addColorStop(0,'#ffffff');g2.addColorStop(0.5,'#ffdd66');g2.addColorStop(1,'rgba(255,120,0,0)');
      ctx.fillStyle=g2;ctx.beginPath();ctx.arc(0,0,22,0,6.29);ctx.fill();
      ctx.strokeStyle='rgba(255,150,60,0.7)';ctx.lineWidth=3;
      for(let i=0;i<3;i++){const off=(i-1)*10;ctx.beginPath();ctx.moveTo(-p.vx*0.6,off);ctx.lineTo(-p.vx*2.6,off*1.4);ctx.stroke();}
    }else if(p.type==='heianfuga'){
      drawHeianFugaProjectile(p);
    }else if(p.type==='young_purple'){
      const dir=Math.sign(p.vx)||1;const rr=42+Math.sin(p.t*0.3)*5;ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,0,4,0,0,rr*2.8);g.addColorStop(0,'rgba(255,255,255,0.98)');g.addColorStop(0.3,'rgba(225,205,255,0.96)');g.addColorStop(0.65,'rgba(175,120,255,0.70)');g.addColorStop(1,'rgba(100,40,170,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,rr*1.7,rr,0,0,6.29);ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.85)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-dir*120,0);ctx.lineTo(dir*16,0);ctx.stroke();ctx.strokeStyle='rgba(200,160,255,0.75)';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-dir*100,0);ctx.lineTo(dir*20,0);ctx.stroke();
    }else if(p.type==='strongest_maxred'){
      const dir=Math.sign(p.vx)||1;const rr=30+Math.sin(p.t*0.28)*3;
      const g=ctx.createRadialGradient(0,0,2,0,0,rr*2.6);g.addColorStop(0,'rgba(255,255,255,0.96)');g.addColorStop(0.25,'rgba(255,120,140,0.96)');g.addColorStop(0.62,'rgba(255,35,70,0.68)');g.addColorStop(1,'rgba(120,0,20,0)');
      ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,rr*1.65,rr,0,0,6.29);ctx.fill();
      ctx.strokeStyle='rgba(255,120,140,0.72)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-dir*52,0);ctx.lineTo(dir*10,0);ctx.stroke();
      ctx.strokeStyle='rgba(255,240,245,0.9)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-dir*40,-6);ctx.lineTo(dir*12,0);ctx.moveTo(-dir*40,6);ctx.lineTo(dir*12,0);ctx.stroke();
    }else if(p.type==='strongest_purple'){
      drawStrongestPurpleProjectile(p,false);
    }else if(p.type==='beam'){
      ctx.globalCompositeOperation='lighter';
      const dir=Math.sign(p.vx)||1;const halfW=p.w*0.5,halfH=p.h*0.5;const t=p.t;
      const outer=ctx.createRadialGradient(0,0,4,0,0,halfH*1.05);outer.addColorStop(0,'rgba(224,208,255,0.55)');outer.addColorStop(0.45,'rgba(180,140,255,0.30)');outer.addColorStop(1,'rgba(120,80,200,0)');
      ctx.fillStyle=outer;ctx.beginPath();ctx.ellipse(-halfW*0.15,0,halfW*1.06,halfH*1.08,0,0,6.29);ctx.fill();
      const body=ctx.createLinearGradient(0,-halfH,0,halfH);body.addColorStop(0,'rgba(180,130,255,0)');body.addColorStop(0.28,'rgba(201,166,255,0.85)');body.addColorStop(0.5,'rgba(230,215,255,0.95)');body.addColorStop(0.72,'rgba(201,166,255,0.85)');body.addColorStop(1,'rgba(180,130,255,0)');
      ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,0,halfW,halfH*0.78,0,0,6.29);ctx.fill();
      ctx.save();ctx.beginPath();ctx.ellipse(0,0,halfW,halfH*0.72,0,0,6.29);ctx.clip();
      ctx.strokeStyle='rgba(255,255,255,0.7)';ctx.lineWidth=2;
      for(let i=0;i<7;i++){const y=-halfH*0.6+i*(halfH*1.2/6);const phase=((t*0.35+i*0.9)%2+2)%2;const rx=(phase-1)*halfW*0.9;ctx.beginPath();ctx.moveTo(-halfW,y);ctx.lineTo(rx,y);ctx.stroke();}
      const core=ctx.createLinearGradient(0,-halfH*0.42,0,halfH*0.42);core.addColorStop(0,'rgba(255,255,255,0)');core.addColorStop(0.5,'rgba(255,255,255,1)');core.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=core;ctx.beginPath();ctx.ellipse(0,0,halfW*0.98,halfH*0.34,0,0,6.29);ctx.fill();
      ctx.restore();
    }else if(p.type==='copied'){
      ctx.globalCompositeOperation='lighter';
      const g=ctx.createRadialGradient(0,0,4,0,0,42);g.addColorStop(0,'#ffffff');g.addColorStop(0.4,'#e0d0ff');g.addColorStop(0.8,'#c9a6ff');g.addColorStop(1,'rgba(120,80,180,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,42,36,0,0,6.29);ctx.fill();
    }else if(p.type==='wcs'){
      const alpha=Math.min(1,p.life/20);
      ctx.globalAlpha=alpha;
      ctx.globalCompositeOperation='source-over';
      const vg=ctx.createRadialGradient(0,0,2,0,0,72);
      vg.addColorStop(0,'rgba(20,0,10,0.65)');
      vg.addColorStop(0.55,'rgba(40,5,20,0.35)');
      vg.addColorStop(1,'rgba(20,0,10,0)');
      ctx.fillStyle=vg;
      ctx.beginPath();ctx.ellipse(0,0,74,74,0,0,6.29);ctx.fill();
      ctx.globalCompositeOperation='lighter';
      const slashLen = 220;
      ctx.lineCap='round';
      ctx.strokeStyle='rgba(255,40,70,'+(alpha*0.75)+')';
      ctx.lineWidth=9;
      ctx.beginPath();ctx.moveTo(-slashLen,0);ctx.lineTo(slashLen,0);ctx.stroke();
      ctx.strokeStyle='rgba(255,90,120,'+(alpha*0.9)+')';
      ctx.lineWidth=4.5;
      ctx.beginPath();ctx.moveTo(-slashLen,0);ctx.lineTo(slashLen,0);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,'+alpha+')';
      ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-slashLen,0);ctx.lineTo(slashLen,0);ctx.stroke();
      ctx.strokeStyle='rgba(255,80,110,'+(alpha*0.6)+')';
      ctx.lineWidth=2.4;
      ctx.beginPath();ctx.moveTo(0,-slashLen*0.55);ctx.lineTo(0,slashLen*0.55);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,'+(alpha*0.85)+')';
      ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(0,-slashLen*0.55);ctx.lineTo(0,slashLen*0.55);ctx.stroke();
      for(let s=0;s<2;s++){
        const sgn = s===0?1:-1;
        ctx.strokeStyle='rgba(255,60,90,'+(alpha*0.45)+')';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.moveTo(-slashLen*0.72, -sgn*slashLen*0.32);
        ctx.lineTo(slashLen*0.72, sgn*slashLen*0.32);
        ctx.stroke();
        ctx.strokeStyle='rgba(255,255,255,'+(alpha*0.65)+')';
        ctx.lineWidth=0.9;
        ctx.beginPath();
        ctx.moveTo(-slashLen*0.72, -sgn*slashLen*0.32);
        ctx.lineTo(slashLen*0.72, sgn*slashLen*0.32);
        ctx.stroke();
      }
      ctx.globalAlpha=1;
    }
    ctx.restore();
  }
}
function drawFirePillars(){
  for(const fp of G.firePillars){
    const lifeRatio=fp.timer/fp.maxTimer;const riseT=clamp(1-lifeRatio,0,1);
    const h=fp.h*Math.min(1,riseT*1.6);const width=fp.w*(1-lifeRatio*0.15);
    ctx.save();ctx.globalCompositeOperation='lighter';
    const g1=ctx.createLinearGradient(fp.x,GROUND,fp.x,GROUND-h);
    g1.addColorStop(0,'rgba(255,220,120,0.95)');g1.addColorStop(0.3,'rgba(255,140,40,0.85)');g1.addColorStop(0.7,'rgba(255,60,20,0.45)');g1.addColorStop(1,'rgba(120,20,0,0)');
    ctx.fillStyle=g1;ctx.beginPath();
    const steps=6;
    for(let i=0;i<=steps;i++){const t=i/steps;const y=GROUND-h*t;const w=width*(0.55+Math.sin(fp.t*0.15+i)*0.06)*(1-t*0.7);ctx.lineTo(fp.x+w,y);}
    for(let i=steps;i>=0;i--){const t=i/steps;const y=GROUND-h*t;const w=width*(0.55+Math.cos(fp.t*0.13+i)*0.06)*(1-t*0.7);ctx.lineTo(fp.x-w,y);}
    ctx.closePath();ctx.fill();
    const g2=ctx.createLinearGradient(fp.x,GROUND,fp.x,GROUND-h);
    g2.addColorStop(0,'rgba(255,255,255,1)');g2.addColorStop(0.4,'rgba(255,230,140,0.95)');g2.addColorStop(1,'rgba(255,140,20,0)');
    ctx.fillStyle=g2;ctx.beginPath();
    for(let i=0;i<=steps;i++){const t=i/steps;const y=GROUND-h*t;const w=width*0.28*(1-t*0.6);ctx.lineTo(fp.x+w,y);}
    for(let i=steps;i>=0;i--){const t=i/steps;const y=GROUND-h*t;const w=width*0.28*(1-t*0.6);ctx.lineTo(fp.x-w,y);}
    ctx.closePath();ctx.fill();
    if(fp.t<24){ctx.strokeStyle='rgba(255,180,60,'+(0.8*(1-fp.t/24))+')';ctx.lineWidth=5;ctx.beginPath();ctx.arc(fp.x,GROUND,60+fp.t*4,0,6.29);ctx.stroke();}
    ctx.restore();
  }
}
function drawCombatFeel(){
  if(G.speedLines.length){
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    for(const l of G.speedLines){
      const a=clamp(l.life/l.maxLife,0,1);
      const x2=l.x+Math.cos(l.angle)*l.len;
      const y2=l.y+Math.sin(l.angle)*l.len;
      ctx.globalAlpha=a*0.72;ctx.strokeStyle=l.color;ctx.lineWidth=1.2+a*2.6;
      ctx.beginPath();ctx.moveTo(l.x,l.y);ctx.lineTo(x2,y2);ctx.stroke();
    }
    ctx.restore();
  }
  if(G.impactBursts.length){
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1;
    for(const b of G.impactBursts){
      const a=clamp(b.life/b.maxLife,0,1);
      ctx.globalAlpha=a*0.20;
      const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.size);
      g.addColorStop(0,b.color+'aa');g.addColorStop(0.35,b.color+'33');g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.size,0,6.283);ctx.fill();
    }
    ctx.restore();
  }
}
function drawVFX(){
  ctx.save();
  for(const p of G.particles){
    if(!p.active)continue;
    const a=clamp(p.life/p.maxLife,0,1);
    if(p.add)ctx.globalCompositeOperation='lighter';else ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=a;ctx.fillStyle=p.color;
    if(p.shape==='circle'){ctx.beginPath();ctx.arc(p.x,p.y,p.size*(0.5+a*0.7),0,6.29);ctx.fill();}
    else if(p.shape==='ring'){ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(1.6-a),0,6.29);ctx.stroke();}
    else if(p.shape==='shock'){ctx.strokeStyle=p.color;ctx.lineWidth=3.2*a+1;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(1-a)*2.4+p.size*0.3,0,6.29);ctx.stroke();}
    else if(p.shape==='bolt'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillRect(-p.size*0.5,-1.6,p.size,3.2);ctx.restore();}
    else if(p.shape==='diamond'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);const w=p.w||p.size*0.38,h=p.h||p.size*1.8;ctx.beginPath();ctx.moveTo(h,0);ctx.lineTo(0,w);ctx.lineTo(-h,0);ctx.lineTo(0,-w);ctx.closePath();ctx.fill();ctx.restore();}
    else if(p.shape==='shard'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);const s=p.size;ctx.beginPath();ctx.moveTo(s*1.9,0);ctx.lineTo(-s*0.15,s*0.42);ctx.lineTo(-s*1.25,s*0.22);ctx.lineTo(-s*0.55,-s*0.4);ctx.closePath();ctx.fill();ctx.restore();}
    else if(p.shape==='streak'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.strokeStyle=p.color;ctx.lineWidth=Math.max(0.8,p.size*0.34);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-p.size*2.2,0);ctx.quadraticCurveTo(-p.size*0.6,p.w||0,p.size*1.25,0);ctx.stroke();ctx.restore();}
    else if(p.shape==='arc'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.strokeStyle=p.color;ctx.lineWidth=Math.max(1,p.size*0.22);ctx.lineCap='round';ctx.beginPath();ctx.arc(0,0,p.w||p.size*1.9,p.h||-0.7,p.h2||0.7);ctx.stroke();ctx.restore();}
    else if(p.shape==='cross'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.strokeStyle=p.color;ctx.lineWidth=Math.max(0.8,p.size*0.2);ctx.lineCap='round';const s=p.size;ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(s,0);ctx.moveTo(0,-s);ctx.lineTo(0,s);ctx.stroke();ctx.restore();}
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  for(const a of G.ambient){const alpha=(a.life/a.maxLife)*a.alpha;ctx.globalAlpha=alpha;ctx.fillStyle='#c8d8f0';ctx.beginPath();ctx.arc(a.x,a.y,a.size,0,6.29);ctx.fill();}
  ctx.globalAlpha=1;
  for(const t of G.texts){
    const a=clamp(t.life/t.maxLife,0,1);ctx.globalAlpha=a;
    ctx.font='900 '+t.size+'px "Segoe UI", system-ui, sans-serif';ctx.textAlign='center';
    ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,0.75)';ctx.strokeText(t.txt,t.x,t.y);
    ctx.fillStyle=t.color;ctx.fillText(t.txt,t.x,t.y);
  }
  ctx.globalAlpha=1;ctx.restore();
}
function drawHeianShrine(){
  if(!G.domain||G.domain.type!=='shrine_heian')return;
  const d=G.domain;
  const t=clamp((d.maxTimer-d.timer)/26,0,1);
  const fadeOut=clamp(d.timer/26,0,1);
  const alpha=Math.min(t,fadeOut)*0.92;
  const cx=ARENA_W/2;const baseY=GROUND-10;
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.fillStyle='rgba(50,5,18,0.9)';
  ctx.fillRect(cx-300,baseY-380,600,380);
  ctx.beginPath();
  ctx.moveTo(cx-380,baseY-380);ctx.lineTo(cx-180,baseY-470);ctx.lineTo(cx,baseY-500);ctx.lineTo(cx+180,baseY-470);ctx.lineTo(cx+380,baseY-380);ctx.closePath();ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx-440,baseY-350);ctx.lineTo(cx,baseY-440);ctx.lineTo(cx+440,baseY-350);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(80,12,26,0.92)';
  for(let i=-3;i<=3;i++){ctx.fillRect(cx+i*90-10,baseY-380,20,380);}
  ctx.fillStyle='rgba(15,2,6,0.96)';
  ctx.fillRect(cx-55,baseY-240,110,240);
  ctx.fillStyle='rgba(255,60,80,0.55)';
  ctx.beginPath();ctx.arc(cx-180,baseY-300,16,0,6.29);ctx.fill();
  ctx.beginPath();ctx.arc(cx+180,baseY-300,16,0,6.29);ctx.fill();
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=alpha*0.5;
  const g=ctx.createRadialGradient(cx,baseY-220,20,cx,baseY-220,600);
  g.addColorStop(0,'rgba(255,40,80,0.7)');
  g.addColorStop(1,'rgba(60,5,15,0)');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.arc(cx,baseY-220,600,0,6.29);ctx.fill();
  ctx.globalAlpha=alpha*0.75;
  ctx.strokeStyle='rgba(255,50,80,0.9)';
  ctx.lineWidth=3;
  for(let i=0;i<24;i++){
    const angle=(i*137.5)%360*D2R;
    const ox=cx+Math.cos(angle)*(200+((i*53)%260));
    const oy=baseY-160+Math.sin(angle)*((i*37)%220);
    const len=60+((i*29)%120);
    ctx.beginPath();
    ctx.moveTo(ox-Math.cos(angle)*len/2,oy-Math.sin(angle)*len/2);
    ctx.lineTo(ox+Math.cos(angle)*len/2,oy+Math.sin(angle)*len/2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=1;
}
function drawClashFeelOverlay(){
  if(!G.clash)return;
  const c=G.clash;
  ctx.save();
  const w=520,h=20,x=W/2-w/2,y=150;
  ctx.fillStyle='rgba(6,10,20,0.86)';ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='rgba(255,255,255,0.42)';ctx.strokeRect(x,y,w,h);
  const mid=x+w/2;const pull=c.tug*0.5;
  const leftW=w*(0.5+pull);
  ctx.fillStyle='#8fdfff';ctx.fillRect(x,y,leftW,h);
  ctx.fillStyle='#ff4d6d';ctx.fillRect(x+leftW,y,w-leftW,h);
  ctx.fillStyle='#fff';ctx.fillRect(mid-2,y-5,4,h+10);
  if(c.pulseA>0){ctx.fillStyle='rgba(143,223,255,'+c.pulseA*0.45+')';ctx.fillRect(x-8,y-6,6,h+12);}
  if(c.pulseB>0){ctx.fillStyle='rgba(255,77,109,'+c.pulseB*0.45+')';ctx.fillRect(x+w+2,y-6,6,h+12);}
  ctx.font='900 18px "Segoe UI",system-ui,sans-serif';ctx.textAlign='center';
  ctx.fillStyle='#fff';ctx.fillText('DOMAIN CLASH',W/2,y-16);
  ctx.font='800 12px "Consolas",monospace';ctx.fillStyle='#8fdfff';ctx.textAlign='left';ctx.fillText('P1  [ 1 ]  MASH: '+c.aPresses,x,y+h+24);
  ctx.fillStyle='#ff7a7a';ctx.textAlign='right';ctx.fillText('MASH [ NUM1 ]  P2: '+c.bPresses,x+w,y+h+24);
  ctx.font='700 11px "Consolas",monospace';ctx.textAlign='center';ctx.fillStyle='#cfe4ff';ctx.fillText((c.a.short||c.a.name)+'   VS   '+(c.b.short||c.b.name),W/2,y+h+42);
  ctx.restore();
}
function drawDomainOverlay(){
  if(!G.domain&&!G.clash)return;
  ctx.save();
  if(G.clash){
    const c=G.clash;const t=1-c.timer/200;
    ctx.globalAlpha=clamp(t*1.6,0,0.9);
    const g=ctx.createRadialGradient(W/2,H/2,40,W/2,H/2,700);
    const col=(Math.floor(G.frame/4)%2)?'#7fd8ff':'#ff5566';
    g.addColorStop(0,'rgba(255,255,255,0.9)');g.addColorStop(0.35,col+'66');g.addColorStop(1,'rgba(0,0,0,0.85)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=0.6;ctx.strokeStyle='#ffffff';ctx.lineWidth=4;
    for(let i=0;i<5;i++){const r=(G.frame*6+i*90)%520;ctx.globalAlpha=0.5*(1-r/520);ctx.beginPath();ctx.arc(W/2,H/2,r,0,6.29);ctx.stroke();}
    ctx.globalAlpha=0.5*Math.min(1,t*2);
    const bg=ctx.createLinearGradient(W/2-200,H/2,W/2+200,H/2);
    bg.addColorStop(0,'rgba(127,216,255,0)');bg.addColorStop(0.5,'rgba(255,255,255,0.7)');bg.addColorStop(1,'rgba(255,85,102,0)');
    ctx.fillStyle=bg;ctx.fillRect(W/2-200,H/2-60,400,120);ctx.restore();return;
  }
  const d=G.domain;const t=clamp((d.maxTimer-d.timer)/26,0,1);const fadeOut=clamp(d.timer/26,0,1);
  const alpha=Math.min(t,fadeOut)*0.82;
  ctx.globalAlpha=alpha;
  if(d.type==='void'){
    ctx.fillStyle='#05010f';ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    ctx.strokeStyle='rgba(160,120,255,0.20)';ctx.lineWidth=1.6;
    for(let i=0;i<26;i++){const a=(i/26)*6.28+Math.sin(G.frame*0.006+i)*0.3;const r0=80+((G.frame*0.9+i*47)%260);const r1=Math.min(720,r0+260);ctx.globalAlpha=alpha*(0.5+(1-(r0-80)/260)*0.5);ctx.beginPath();ctx.moveTo(W/2+Math.cos(a)*r0,H/2+Math.sin(a)*r0*0.62);ctx.lineTo(W/2+Math.cos(a)*r1,H/2+Math.sin(a)*r1*0.62);ctx.stroke();}
    ctx.globalAlpha=alpha*0.85;const vg=ctx.createRadialGradient(W/2,H/2,120,W/2,H/2,760);vg.addColorStop(0,'rgba(120,60,220,0)');vg.addColorStop(1,'rgba(30,0,70,0.92)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  }else if(d.type==='shrine'){
    ctx.fillStyle='rgba(20,2,6,0.9)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    for(let i=0;i<22;i++){const x=(i*83+G.frame*3)%W;const h=200+Math.sin(i*2.1+G.frame*0.03)*160;ctx.strokeStyle='rgba(255,70,90,'+(0.10+0.12*Math.abs(Math.sin(G.frame*0.05+i)))+')';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+rnd(-2,2),H-h);ctx.stroke();}
    ctx.globalAlpha=alpha*0.8;const vg=ctx.createRadialGradient(W/2,H/2,140,W/2,H/2,760);vg.addColorStop(0,'rgba(255,60,80,0)');vg.addColorStop(1,'rgba(70,0,10,0.92)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  }else if(d.type==='shrine_heian'){
    ctx.fillStyle='rgba(30,2,10,0.9)';ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<12;i++){const y=(i*60+G.frame*1.5)%H;ctx.strokeStyle='rgba(255,50,70,'+(0.06+Math.sin(G.frame*0.03+i)*0.04)+')';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    for(let i=0;i<30;i++){const x=(i*77+G.frame*3)%W;const h=140+Math.sin(i*1.9+G.frame*0.04)*90;ctx.strokeStyle='rgba(255,80,100,'+(0.10+0.10*Math.abs(Math.sin(G.frame*0.05+i)))+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+rnd(-4,4),H-h);ctx.stroke();}
    ctx.globalAlpha=alpha*0.85;const vg=ctx.createRadialGradient(W/2,H/2,140,W/2,H/2,760);vg.addColorStop(0,'rgba(180,30,50,0)');vg.addColorStop(1,'rgba(50,0,10,0.94)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  }else if(d.type==='strongest_void'){
    ctx.fillStyle='rgba(0,15,30,0.92)';ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    ctx.strokeStyle='rgba(0,229,255,0.22)';ctx.lineWidth=1.8;
    for(let i=0;i<32;i++){
      const a=(i/32)*6.28+Math.sin(G.frame*0.008+i)*0.3;
      const r0=90+((G.frame*1.1+i*51)%280);
      const r1=Math.min(760,r0+280);
      ctx.globalAlpha=alpha*(0.5+(1-(r0-90)/280)*0.5);
      ctx.beginPath();
      ctx.moveTo(W/2+Math.cos(a)*r0,H/2+Math.sin(a)*r0*0.6);
      ctx.lineTo(W/2+Math.cos(a)*r1,H/2+Math.sin(a)*r1*0.6);
      ctx.stroke();
    }
    ctx.globalAlpha=alpha*0.85;
    const vg=ctx.createRadialGradient(W/2,H/2,120,W/2,H/2,760);
    vg.addColorStop(0,'rgba(0,180,230,0)');
    vg.addColorStop(1,'rgba(0,30,60,0.94)');
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  }else if(d.type==='swords'){
    ctx.fillStyle='rgba(20,10,40,0.88)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    const vg=ctx.createRadialGradient(W/2,H/2,100,W/2,H/2,760);vg.addColorStop(0,'rgba(200,150,255,0.18)');vg.addColorStop(0.5,'rgba(120,80,180,0.06)');vg.addColorStop(1,'rgba(20,10,40,0.9)');
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    if(d.swords){ctx.globalAlpha=alpha*0.85;for(let i=0;i<d.swords.length;i++){const s=d.swords[i];const camX=cam.x-W/2/cam.zoom;const screenX=(s.x-camX)*cam.zoom;if(screenX<-100||screenX>W+100)continue;ctx.save();ctx.translate(screenX,s.y-40);ctx.rotate(s.tilt);const gg=ctx.createLinearGradient(0,-s.h,0,0);gg.addColorStop(0,'rgba(255,255,255,0.9)');gg.addColorStop(0.5,'rgba(224,208,255,0.7)');gg.addColorStop(1,'rgba(150,100,220,0.4)');ctx.fillStyle=gg;ctx.fillRect(-2,-s.h,4,s.h);ctx.fillStyle='rgba(200,180,255,0.9)';ctx.fillRect(-8,-4,16,4);ctx.fillStyle='rgba(80,60,120,0.9)';ctx.fillRect(-2,-4,4,20);ctx.globalAlpha=alpha*0.35;ctx.fillStyle='rgba(201,166,255,0.5)';ctx.fillRect(-6,-s.h,12,s.h);ctx.restore();}ctx.globalAlpha=alpha;}
  }
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawHakariCinematic(){
  const c=G.hakariCin;if(!c)return;const f=c.owner;if(!f)return;ctx.save();
  if(c.phase==='domain'||c.phase==='spinEnd'||c.phase==='hold'){
    const t=c.timer/Math.max(1,c.total);
    const darkAmt=Math.min(0.55,0.15+t*0.45);ctx.globalAlpha=darkAmt;ctx.fillStyle='#120818';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
    ctx.globalCompositeOperation='lighter';
    const off=(G.frame*2)%40;
    for(let i=0;i<26;i++){const x=(i*60+off)%(W+80)-40;ctx.strokeStyle='rgba(255,120,200,'+(0.10+Math.sin(G.frame*0.05+i)*0.06)+')';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    ctx.globalCompositeOperation='source-over';
    const vg=ctx.createRadialGradient(W/2,H/2,200,W/2,H/2,760);vg.addColorStop(0,'rgba(80,20,90,0)');vg.addColorStop(1,'rgba(20,4,30,0.85)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    const cx=W/2;const cy=170;const rw=440,rh=90;
    ctx.fillStyle='rgba(8,6,18,0.85)';ctx.fillRect(cx-rw/2,cy-rh/2,rw,rh);
    const pulse=0.55+Math.sin(G.frame*0.15)*0.15;
    ctx.strokeStyle='rgba(255,209,102,'+pulse+')';ctx.lineWidth=3;ctx.strokeRect(cx-rw/2,cy-rh/2,rw,rh);
    ctx.font='800 12px "Segoe UI", system-ui, sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffd166';ctx.fillText('IDLE DEATH GAMBLE',cx,cy-rh/2-10);
    const reelW=rw/4;
    for(let i=0;i<4;i++){
      const rx=cx-rw/2+reelW*(i+0.5);
      ctx.fillStyle='rgba(20,10,30,0.9)';ctx.fillRect(rx-reelW/2+4,cy-rh/2+6,reelW-8,rh-12);
      const sym=REEL_SYMBOLS[c.reel[i]];
      const isWin=(c.phase!=='domain')&&c.win&&i<3;
      ctx.font='900 54px "Segoe UI", system-ui, sans-serif';ctx.textAlign='center';
      if(isWin){ctx.fillStyle='#ffffff';ctx.shadowBlur=22;ctx.shadowColor='#ffd166';}
      else{ctx.fillStyle='#ffd166';ctx.shadowBlur=10;ctx.shadowColor='rgba(255,209,102,0.6)';}
      ctx.fillText(sym,rx,cy+18);ctx.shadowBlur=0;
    }
  }else if(c.phase==='result'){
    const isWin=!!c.win;const t=c.timer/Math.max(1,c.total);
    if(isWin){ctx.globalAlpha=Math.max(0,0.45*(1-t));ctx.fillStyle='#ffd166';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
      const scale=1+Math.min(0.5,t*1.4);const alpha=Math.min(1,1.6-t*1.2);
      ctx.save();ctx.globalAlpha=alpha;ctx.translate(W/2,H/2-40);ctx.scale(scale,scale);
      ctx.font='900 96px "Segoe UI", system-ui, sans-serif';ctx.textAlign='center';
      ctx.lineWidth=8;ctx.strokeStyle='rgba(0,0,0,0.75)';ctx.strokeText('JACKPOT',0,0);
      const g=ctx.createLinearGradient(-260,0,260,0);g.addColorStop(0,'#ffd166');g.addColorStop(0.5,'#ffffff');g.addColorStop(1,'#ffaa33');
      ctx.fillStyle=g;ctx.fillText('JACKPOT',0,0);
      ctx.font='900 48px "Segoe UI", system-ui, sans-serif';ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,0,0.75)';ctx.strokeText('7 7 7',0,66);ctx.fillStyle='#ffffff';ctx.fillText('7 7 7',0,66);
      ctx.restore();
    }else{ctx.globalAlpha=0.25;ctx.fillStyle='#1a1020';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
      ctx.save();ctx.globalAlpha=Math.max(0,1-t*1.4);ctx.font='900 76px "Segoe UI", system-ui, sans-serif';ctx.textAlign='center';
      ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,0,0.75)';ctx.strokeText('MISS',W/2,H/2-20);ctx.fillStyle='#888899';ctx.fillText('MISS',W/2,H/2-20);
      ctx.restore();}
  }
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
/* ===== UI ===== */
function drawBar(x,y,w,h,pct,fill1,fill2,bgCol,rightAlign){
  ctx.save();ctx.fillStyle=bgCol||'rgba(10,14,26,0.85)';ctx.fillRect(x,y,w,h);
  const fw=Math.max(0,w*pct);const g=ctx.createLinearGradient(x,y,x,y+h);
  g.addColorStop(0,fill1);g.addColorStop(1,fill2);ctx.fillStyle=g;
  if(rightAlign)ctx.fillRect(x+w-fw,y,fw,h);else ctx.fillRect(x,y,fw,h);
  ctx.strokeStyle='rgba(180,210,255,0.35)';ctx.lineWidth=1.5;ctx.strokeRect(x,y,w,h);
  ctx.fillStyle='rgba(255,255,255,0.12)';
  if(rightAlign)ctx.fillRect(x+w-fw,y,fw,h*0.34);else ctx.fillRect(x,y,fw,h*0.34);
  ctx.restore();
}
function drawHakariJackpotHUD(){
  for(let i=0;i<2;i++){
    const f=G.fighters[i];if(!f||f.id!=='hakari')continue;
    const isLeft=(i===0);
    if(f.jackpot>0){
      const bx=isLeft?38:W-38-220;const by=190;const bw=220,bh=46;
      ctx.save();ctx.fillStyle='rgba(15,8,25,0.85)';ctx.fillRect(bx,by,bw,bh);
      const pulse=0.7+Math.sin(G.frame*0.15)*0.25;ctx.strokeStyle='rgba(255,209,102,'+pulse+')';ctx.lineWidth=2.5;ctx.strokeRect(bx,by,bw,bh);
      ctx.font='800 11px "Segoe UI", system-ui, sans-serif';ctx.fillStyle='#ffd166';ctx.textAlign='left';
      ctx.fillText('\u2660 JACKPOT ACTIVE \u2660',bx+10,by+14);
      const pct=clamp(f.jackpot/720,0,1);ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(bx+10,by+22,bw-20,10);
      const grad=ctx.createLinearGradient(bx+10,0,bx+bw-10,0);grad.addColorStop(0,'#ffd166');grad.addColorStop(1,'#ffaa33');
      ctx.fillStyle=grad;ctx.fillRect(bx+10,by+22,(bw-20)*pct,10);
      ctx.strokeStyle='rgba(180,210,255,0.35)';ctx.lineWidth=1;ctx.strokeRect(bx+10,by+22,bw-20,10);
      const secs=(f.jackpot/60).toFixed(1);ctx.font='900 15px "Consolas", monospace';ctx.fillStyle='#ffffff';ctx.textAlign='right';ctx.fillText(secs+'s',bx+bw-10,by+14);
      ctx.restore();
    } else if(f.restless>0){
      const bx=isLeft?38:W-38-220;const by=190;const bw=220,bh=30;
      ctx.save();ctx.fillStyle='rgba(15,8,25,0.7)';ctx.fillRect(bx,by,bw,bh);
      ctx.strokeStyle='rgba(255,180,80,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(bx,by,bw,bh);
      ctx.font='800 11px "Segoe UI", system-ui, sans-serif';ctx.fillStyle='#ffb060';ctx.textAlign='left';
      ctx.fillText('RESTLESS GAMBLER',bx+10,by+19);
      ctx.textAlign='right';ctx.font='900 12px "Consolas", monospace';ctx.fillStyle='#ffffff';ctx.fillText((f.restless/60).toFixed(1)+'s',bx+bw-10,by+19);
      ctx.restore();
    }
  }
}
function drawUI(){
  const f1=G.fighters[0],f2=G.fighters[1];
  const BW=470,BH=26,BY=34;
  ctx.save();ctx.font='900 20px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign='left';ctx.fillStyle='#dbe9ff';ctx.fillText(getDisplayName(f1),38,BY-10);
  ctx.textAlign='right';ctx.fillText(getDisplayName(f2),W-38,BY-10);ctx.restore();
  const c1a=(f1.id==='gojo')?'#4fd1ff':(f1.id==='young_gojo')?'#9fe4ff':(f1.id==='yuta')?'#c9a6ff':(f1.id==='hakari')?'#ffd166':(f1.id==='heian_sukuna')?'#ff3344':(f1.id==='the_strongest_today')?STRONGEST_CYAN:'#ff6b7f';
  const c1b=(f1.id==='gojo')?'#1a7bd4':(f1.id==='young_gojo')?'#3a91c7':(f1.id==='yuta')?'#7a4fd4':(f1.id==='hakari')?'#d68a1a':(f1.id==='heian_sukuna')?'#880a15':(f1.id==='the_strongest_today')?'#007a99':'#b32036';
  const c2a=(f2.id==='gojo')?'#4fd1ff':(f2.id==='young_gojo')?'#9fe4ff':(f2.id==='yuta')?'#c9a6ff':(f2.id==='hakari')?'#ffd166':(f2.id==='heian_sukuna')?'#ff3344':(f2.id==='the_strongest_today')?STRONGEST_CYAN:'#ff6b7f';
  const c2b=(f2.id==='gojo')?'#1a7bd4':(f2.id==='young_gojo')?'#3a91c7':(f2.id==='yuta')?'#7a4fd4':(f2.id==='hakari')?'#d68a1a':(f2.id==='heian_sukuna')?'#880a15':(f2.id==='the_strongest_today')?'#007a99':'#b32036';
  drawBar(38,BY,BW,BH,clamp(f1.hp/f1.maxHp,0,1),f1.awakened?'#ffd166':c1a,f1.awakened?'#ff9f43':c1b,'rgba(8,12,24,0.85)',false);
  drawBar(W-38-BW,BY,BW,BH,clamp(f2.hp/f2.maxHp,0,1),f2.awakened?'#ffd166':c2a,f2.awakened?'#ff9f43':c2b,'rgba(8,12,24,0.85)',true);
  const EY=BY+BH+8,EH=8;
  drawBar(38,EY,BW,EH,clamp(f1.energy/f1.maxEnergy,0,1),'#a6e3ff','#3aa0ff','rgba(8,12,24,0.7)',false);
  drawBar(W-38-BW,EY,BW,EH,clamp(f2.energy/f2.maxEnergy,0,1),'#ffb6c0','#ff3355','rgba(8,12,24,0.7)',true);
  const UY=EY+EH+8,UH=14;
  const u1=clamp(f1.meter/100,0,1),u2=clamp(f2.meter/100,0,1);
  drawBar(38,UY,BW*0.72,UH,u1,'#ffe98a','#ff9f1a','rgba(8,12,24,0.8)',false);
  drawBar(W-38-BW*0.72,UY,BW*0.72,UH,u2,'#ffe98a','#ff9f1a','rgba(8,12,24,0.8)',true);
  ctx.save();ctx.font='700 11px "Segoe UI", system-ui, sans-serif';ctx.textAlign='left';
  if(f1.id==='hakari'&&f1.jackpot>0){ctx.fillStyle='#ffd166';ctx.fillText('JACKPOT '+Math.ceil(f1.jackpot/60)+'s',38,UY-3);}
  else if(f1.id==='hakari'&&f1.rollTimer>0){ctx.fillStyle='#ffb060';ctx.fillText('ROLLING...',38,UY-3);}
  else if(f1.id==='heian_sukuna'){ctx.fillStyle=u1>=1?'#ff5566':'#61759b';ctx.fillText(u1>=1?'DOMAIN READY — 9':'METER '+(u1*100|0)+'%',38,UY-3);}
  else if(f1.id==='the_strongest_today'){ctx.fillStyle=f1.overdriveActive?STRONGEST_CYAN:'#61759b';ctx.fillText(f1.overdriveActive?'SIX EYES OVERDRIVE ACTIVE':'BASE — 9 at FULL ULT',38,UY-3);}
  else{ctx.fillStyle=u1>=1?'#ffd166':'#61759b';ctx.fillText(u1>=1?'ULT READY — 9':'ULT '+(u1*100|0)+'%',38,UY-3);}
  ctx.textAlign='right';
  if(f2.id==='hakari'&&f2.jackpot>0){ctx.fillStyle='#ffd166';ctx.fillText('JACKPOT '+Math.ceil(f2.jackpot/60)+'s',W-38,UY-3);}
  else if(f2.id==='hakari'&&f2.rollTimer>0){ctx.fillStyle='#ffb060';ctx.fillText('ROLLING...',W-38,UY-3);}
  else if(f2.id==='heian_sukuna'){ctx.fillStyle=u2>=1?'#ff5566':'#61759b';ctx.fillText(u2>=1?'NUM9 — DOMAIN READY':'METER '+(u2*100|0)+'%',W-38,UY-3);}
  else if(f2.id==='the_strongest_today'){ctx.fillStyle=f2.overdriveActive?STRONGEST_CYAN:'#61759b';ctx.fillText(f2.overdriveActive?'SIX EYES OVERDRIVE ACTIVE':'BASE — NUM0 at FULL ULT',W-38,UY-3);}
  else{ctx.fillStyle=u2>=1?'#ffd166':'#61759b';ctx.fillText(u2>=1?'NUM7 — ULT READY':'ULT '+(u2*100|0)+'%',W-38,UY-3);}
  ctx.restore();
  drawCooldowns(f1,38,UY+UH+16,false);
  drawCooldowns(f2,W-38,UY+UH+16,true);
  if(f1.def.hasForms){ctx.save();ctx.font='700 11px "Segoe UI", system-ui, sans-serif';ctx.fillStyle='#ff9a9a';ctx.textAlign='left';ctx.fillText('FORM '+(f1.form+1)+' — '+(f1.form===0?'SUKUNA':'YUJI'),38,UY+UH+60);ctx.restore();}
  if(f2.def.hasForms){ctx.save();ctx.font='700 11px "Segoe UI", system-ui, sans-serif';ctx.fillStyle='#ff9a9a';ctx.textAlign='right';ctx.fillText('FORM '+(f2.form+1)+' — '+(f2.form===0?'SUKUNA':'YUJI'),W-38,UY+UH+60);ctx.restore();}
  ctx.save();ctx.textAlign='center';ctx.font='900 30px "Segoe UI", system-ui, sans-serif';ctx.fillStyle='#dbe9ff';ctx.fillText('ROUND '+G.round,W/2,58);
  ctx.font='700 13px "Segoe UI", system-ui, sans-serif';ctx.fillStyle='#7f93b8';
  const p1w=f1.wins||0,p2w=f2.wins||0;
  ctx.fillText('●'.repeat(p1w)+'○'.repeat(Math.max(0,2-p1w)),W/2-34,80);
  ctx.fillText('●'.repeat(p2w)+'○'.repeat(Math.max(0,2-p2w)),W/2+34,80);
  if(G.mode==='timeattack'&&G.timeAttackResult===0){const t=(performance.now()-G.timeAttackStart)/1000;ctx.font='900 18px "Segoe UI", system-ui, sans-serif';ctx.fillStyle='#ffd166';ctx.fillText(t.toFixed(2)+'s',W/2,104);}
  if(G.mode==='survival'){ctx.font='800 15px "Segoe UI", system-ui, sans-serif';ctx.fillStyle='#ffb060';ctx.fillText('SURVIVAL — BATTLE '+G.survivalRound,W/2,128);}
  if(G.mode==='story'&&G.story){ctx.font='800 15px "Segoe UI", system-ui, sans-serif';ctx.fillStyle='#9fd8ff';ctx.fillText('CHAPTER 1 · ENCOUNTER · ACT '+(G.story.act||0),W/2,128);}
  ctx.restore();
  if(G.comboDisplay){
    const cd=G.comboDisplay;const side=cd.owner===f1?'left':'right';const cx=side==='left'?300:W-300;
    ctx.save();ctx.textAlign='center';ctx.globalAlpha=clamp(cd.timer/6,0,1);
    const scale=1+Math.max(0,(cd.pulse||0))*0.10+Math.max(0,(10-cd.timer))*0.012;ctx.translate(cx,200);ctx.scale(scale,scale);
    ctx.font='900 46px "Segoe UI", system-ui, sans-serif';ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,0,0.7)';
    ctx.strokeText(cd.count+' HIT COMBO',0,0);
    const g=ctx.createLinearGradient(-140,0,140,0);g.addColorStop(0,'#7fd8ff');g.addColorStop(1,'#ffd166');ctx.fillStyle=g;
    ctx.fillText(cd.count+' HIT COMBO',0,0);
    ctx.font='700 20px "Segoe UI", system-ui, sans-serif';ctx.fillStyle='#dbe9ff';ctx.fillText('DAMAGE: '+cd.damage,0,28);ctx.restore();
  }
  if(G.mode==='training'){if(G.training.boxes)drawBoxes();if(G.training.frames)drawFrameData();}
  if(G.roundState==='intro'){ctx.save();ctx.textAlign='center';const t=G.roundTimer;let txt='',col='#dbe9ff',sz=64;
    if(t>70){txt='ROUND '+G.round;col='#dbe9ff';}else if(t>10){txt='FIGHT!';col='#ffd166';sz=86;}
    if(txt){const a=t>70?1:clamp((t-10)/20,0,1);ctx.globalAlpha=a;ctx.font='900 '+sz+'px "Segoe UI", system-ui, sans-serif';
      ctx.lineWidth=8;ctx.strokeStyle='rgba(0,0,0,0.65)';ctx.strokeText(txt,W/2,H/2);
      const g=ctx.createLinearGradient(W/2-200,0,W/2+200,0);g.addColorStop(0,'#7fd8ff');g.addColorStop(0.5,col);g.addColorStop(1,'#ff7a7a');ctx.fillStyle=g;ctx.fillText(txt,W/2,H/2);}
    ctx.restore();}
  if(G.roundState==='ko'){ctx.save();ctx.textAlign='center';ctx.font='900 84px "Segoe UI", system-ui, sans-serif';ctx.lineWidth=8;ctx.strokeStyle='rgba(0,0,0,0.7)';ctx.strokeText('K.O.',W/2,H/2);ctx.fillStyle='#ff4455';ctx.fillText('K.O.',W/2,H/2);ctx.restore();}
}
function drawCooldowns(f,x,y,right){
  const keys=['s1','s2','s3','s4','s5','def'];
  const size=28,gap=5;ctx.save();ctx.textAlign='center';let shown=0;
  for(let i=0;i<keys.length;i++){
    const k=keys[i];const m=f.moves[k];if(!m)continue;
    const px=right?x-(shown+1)*(size+gap)+gap:x+shown*(size+gap);
    const cd=f.cd[k]||0;const ready=cd<=0&&f.energy>=m.cost;
    ctx.fillStyle=ready?'rgba(40,70,130,0.85)':'rgba(14,18,32,0.85)';ctx.fillRect(px,y,size,size);
    ctx.strokeStyle=ready?'rgba(140,200,255,0.8)':'rgba(70,90,130,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(px,y,size,size);
    if(cd>0){const p=1-cd/m.cd;ctx.fillStyle='rgba(90,150,255,0.28)';ctx.fillRect(px,y+size*(1-p),size,size*p);}
    ctx.fillStyle=ready?'#dbe9ff':'#5c6d8c';ctx.font='800 10px "Segoe UI", system-ui, sans-serif';
    const labelMap={gojo:['BLU','RED','PUR','','','INF'],sukuna:['DSM','CLV','FUG','','','GRD'],yuta:['SPK','RIK','CPY','SKY','RCT','RGD'],hakari:['DRS','RGE','DMN','JPR','RSL','GRD'],heian_sukuna:['DSM','CLV','FUG','KMT','HTN','WCS'],the_strongest_today:(f.overdriveActive?['MBB','MRD','CHA','SPC','CLC','ADV']:['RCT','SDM','BFL','PUR','VOI','OVD'])};
    let label;
    if(f.id==='sukuna'&&f.form===1){label=['RSH','CES','BF','DIV','','GRD'][i]||'';}
    else{label=labelMap[f.id]?labelMap[f.id][i]:'';}
    ctx.fillText(label,px+size/2,y+size/2+4);shown++;
  }
  if(f.id==='heian_sukuna'){
    const k='wcs';const m=f.moves.wcs;
    const px=right?x-(shown+1)*(size+gap)+gap:x+shown*(size+gap);
    const cd=f.cd[k]||0;const ready=cd<=0&&f.energy>=m.cost;
    ctx.fillStyle=ready?'rgba(90,20,30,0.9)':'rgba(14,18,32,0.85)';ctx.fillRect(px,y,size,size);
    ctx.strokeStyle=ready?'rgba(255,80,100,0.9)':'rgba(90,40,60,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(px,y,size,size);
    if(cd>0){const p=1-cd/m.cd;ctx.fillStyle='rgba(255,80,100,0.30)';ctx.fillRect(px,y+size*(1-p),size,size*p);}
    ctx.fillStyle=ready?'#ffdde3':'#6d4048';ctx.font='800 10px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('WCS',px+size/2,y+size/2+4);
  }
  if(f.id==='the_strongest_today'){
    const k='wcs';const m=f.moves.wcs;
    const px=right?x-(shown+1)*(size+gap)+gap:x+shown*(size+gap);
    const cd=f.cd[k]||0;const ready=cd<=0&&f.energy>=m.cost;
    ctx.fillStyle=ready?'rgba(0,80,100,0.9)':'rgba(14,18,32,0.85)';ctx.fillRect(px,y,size,size);
    ctx.strokeStyle=ready?'rgba(0,229,255,0.9)':'rgba(40,80,100,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(px,y,size,size);
    if(cd>0){const p=1-cd/m.cd;ctx.fillStyle='rgba(0,229,255,0.30)';ctx.fillRect(px,y+size*(1-p),size,size*p);}
    ctx.fillStyle=ready?'#80f0ff':'#406a78';ctx.font='800 10px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(f.overdriveActive?'MBB':'SHF',px+size/2,y+size/2+4);
    /* ult slot — display as separate tile for the 7th skill */
    const k2='ult';const m2=f.moves.ult;
    const px2=right?px-(size+gap):px+(size+gap);
    const cd2=f.cd[k2]||0;const ready2=cd2<=0;
    ctx.fillStyle=ready2?'rgba(0,80,100,0.9)':'rgba(14,18,32,0.85)';ctx.fillRect(px2,y,size,size);
    ctx.strokeStyle=ready2?'rgba(0,229,255,0.9)':'rgba(40,80,100,0.5)';ctx.lineWidth=1.5;ctx.strokeRect(px2,y,size,size);
    if(cd2>0){const p=1-cd2/m2.cd;ctx.fillStyle='rgba(0,229,255,0.30)';ctx.fillRect(px2,y+size*(1-p),size,size*p);}
    ctx.fillStyle=ready2?'#80f0ff':'#406a78';ctx.font='800 10px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(f.overdriveActive?'OVD':'6EY',px2+size/2,y+size/2+4);
  }
  ctx.restore();
}
function drawBoxes(){
  for(const f of G.fighters){
    const hb=getHurtbox(f);ctx.save();ctx.strokeStyle='rgba(80,255,120,0.85)';ctx.lineWidth=1.5;ctx.strokeRect(hb.x,hb.y,hb.w,hb.h);
    ctx.fillStyle='rgba(80,255,120,0.10)';ctx.fillRect(hb.x,hb.y,hb.w,hb.h);
    if(f.state==='ATTACK'&&f.move&&f.move.hitbox&&f.moveFrame>f.move.startup&&f.moveFrame<=f.move.startup+f.move.active){
      const wb=getHitboxWorld(f,f.move.hitbox);ctx.strokeStyle='rgba(255,80,80,0.9)';ctx.strokeRect(wb.x,wb.y,wb.w,wb.h);ctx.fillStyle='rgba(255,80,80,0.16)';ctx.fillRect(wb.x,wb.y,wb.w,wb.h);
    }
    ctx.restore();
  }
  ctx.save();ctx.strokeStyle='rgba(255,180,60,0.9)';
  for(const p of G.projectiles)ctx.strokeRect(p.x-p.w/2,p.y-p.h/2,p.w,p.h);ctx.restore();
}
function drawFrameData(){
  ctx.save();ctx.font='700 12px "Consolas", monospace';ctx.textAlign='left';
  for(let i=0;i<2;i++){
    const f=G.fighters[i];const x=i===0?40:W-260;const y=240;
    ctx.fillStyle='rgba(6,10,22,0.85)';ctx.fillRect(x,y,220,120);
    ctx.strokeStyle='rgba(110,160,255,0.4)';ctx.strokeRect(x,y,220,120);
    ctx.fillStyle='#7fd8ff';ctx.fillText(getDisplayShort(f),x+10,y+18);
    ctx.fillStyle='#c8d8f0';ctx.fillText('STATE: '+f.state,x+10,y+36);
    if(f.move){const m=f.move;const ph=f.moveFrame<=m.startup?'STARTUP':(f.moveFrame<=m.startup+m.active?'ACTIVE':'RECOVERY');
      ctx.fillStyle='#ffd166';ctx.fillText(m.name.slice(0,26),x+10,y+72);
      ctx.fillStyle='#c8d8f0';ctx.fillText('SU:'+m.startup+' AC:'+m.active+' RC:'+m.recovery,x+10,y+90);
      ctx.fillStyle=ph==='ACTIVE'?'#ff6b6b':'#8ef0a0';ctx.fillText('['+ph+'] f='+f.moveFrame,x+10,y+108);
    }
  }
  ctx.restore();
}
/* ===== RENDER ===== */
function render(){
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#05060a';ctx.fillRect(0,0,W,H);
  if(G.mode==='menu')return;
  ctx.save();
  ctx.translate(W/2+G.shakeX,H/2+G.shakeY);ctx.scale(cam.zoom,cam.zoom);ctx.translate(-cam.x,-cam.y);
  drawArenaWorld();
  drawHeianShrine();
  drawAfterimages();
  const fs=G.fighters.slice();
  fs.sort((a,b)=>{const pa=(a.state==='ATTACK')?1:0;const pb=(b.state==='ATTACK')?1:0;if(pa!==pb)return pa-pb;return a.y-b.y;});
  for(const f of fs)drawFighter(f);
  drawProjectiles();
  drawFirePillars();
  drawWCSScars();
  drawHeianFugaImpacts();
  drawCombatFeel();
  drawVFX();
  ctx.restore();
  drawDomainOverlay();
  drawClashFeelOverlay();
  drawHakariCinematic();
  if(G.tojiCineX){
    const c=G.tojiCineX,q=tojiCineShot(c),tt=c.frame,fade=tt<24?clamp(tt/24,0,1):tt>860?clamp((900-tt)/40,0,1):1;
    ctx.save();
    ctx.fillStyle='rgba(3,5,7,'+(0.78*fade)+')';ctx.fillRect(0,0,W,38);ctx.fillRect(0,H-38,W,38);
    // Narrow cinematic bars, not a fullscreen overlay.
    ctx.fillStyle='#e6eaec';ctx.font='800 11px "Consolas",monospace';ctx.textAlign='left';ctx.fillText('TOJI // '+q.label,28,H-15);
    ctx.textAlign='right';ctx.fillStyle='#8c959a';ctx.fillText(String(Math.max(0,1020-tt)).padStart(4,'0')+'f',W-28,23);
    // Shot marker line.
    ctx.globalAlpha=.35;ctx.fillStyle='#cfd5d8';ctx.fillRect(28,31,W-56,1);ctx.fillStyle='#f0f2f3';ctx.fillRect(28,31,(W-56)*clamp(tt/900,0,1),1);
    // Cinematic vignette.
    const vg=ctx.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.20,W*.5,H*.5,Math.max(W,H)*.72);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.46)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    ctx.restore();
  }
  if(G.flash>0.01){ctx.save();ctx.globalAlpha=clamp(G.flash,0,1)*0.85;ctx.fillStyle=G.flashColor;ctx.fillRect(0,0,W,H);ctx.restore();}
  drawUI();
  drawHakariJackpotHUD();
}