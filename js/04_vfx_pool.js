'use strict';
/* ===== VFX POOL ===== */
function pget(){
  if(G.particles.length<MAX_PARTICLES){
    const p={active:true,x:0,y:0,vx:0,vy:0,life:0,maxLife:1,size:4,color:'#fff',grav:0,shape:'circle',rot:0,vr:0,add:true};
    G.particles.push(p);return p;
  }
  let old=G.particles[0];
  for(let i=1;i<G.particles.length;i++)if(G.particles[i].life<old.life)old=G.particles[i];
  return old;
}
function spark(x,y,n,color,spd,size,life,grav,shape){
  for(let i=0;i<n;i++){
    const p=pget();const a=Math.random()*Math.PI*2;const s=rnd(spd*0.35,spd);
    p.active=true;p.x=x;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s;
    p.maxLife=p.life=rnd(life*0.6,life);p.size=rnd(size*0.6,size);
    p.color=color;p.grav=grav||0;p.shape=shape||'circle';p.rot=Math.random()*6.28;p.vr=rnd(-0.3,0.3);p.add=true;
  }
}
function burst(x,y,n,color,spd,size,life){
  for(let i=0;i<n;i++){
    const p=pget();const a=Math.random()*Math.PI*2;
    p.active=true;p.x=x;p.y=y;p.vx=Math.cos(a)*spd*rnd(0.2,1);p.vy=Math.sin(a)*spd*rnd(0.2,1);
    p.maxLife=p.life=life;p.size=size;p.color=color;p.grav=0;p.shape='ring';p.rot=0;p.vr=0;p.add=true;
  }
}
function ring(x,y,color,size,life){
  const p=pget();p.active=true;p.x=x;p.y=y;p.vx=0;p.vy=0;
  p.maxLife=p.life=life;p.size=size;p.color=color;p.grav=0;p.shape='shock';p.rot=0;p.vr=0;p.add=true;
}
function floatText(x,y,txt,color,size,life){G.texts.push({x,y,txt,color,size:size||20,life:life||50,maxLife:life||50,vy:-1.1});}
function updateVFX(){
  updateHeianFugaImpacts();
  updateWCSScars();
  for(let i=G.particles.length-1;i>=0;i--){
    const p=G.particles[i];if(!p.active){G.particles.splice(i,1);continue;}
    p.x+=p.vx;p.y+=p.vy;p.vy+=p.grav;p.vx*=0.965;p.vy*=0.965;p.rot+=p.vr;p.life--;
    if(p.life<=0)p.active=false;
  }
  for(let i=G.texts.length-1;i>=0;i--){const t=G.texts[i];t.y+=t.vy;t.vy*=0.94;t.life--;if(t.life<=0)G.texts.splice(i,1);}
  for(let i=G.afterimages.length-1;i>=0;i--){G.afterimages[i].life--;if(G.afterimages[i].life<=0)G.afterimages.splice(i,1);}
  for(let i=G.firePillars.length-1;i>=0;i--){
    const fp=G.firePillars[i];fp.timer--;fp.t++;
    if(G.frame%2===0&&fp.timer>4){const p=pget();p.active=true;p.x=fp.x+rnd(-fp.w*0.35,fp.w*0.35);p.y=GROUND-rnd(0,180);p.vx=rnd(-0.6,0.6);p.vy=-rnd(2.5,6);p.maxLife=p.life=rnd(20,42);p.size=rnd(3,9);const cols=['#ff8822','#ffaa33','#ff5511','#ffdd66','#ff7722'];p.color=cols[(Math.random()*cols.length)|0];p.grav=-0.06;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}
    if(G.frame%3===0&&fp.timer>8){const p=pget();p.active=true;p.x=fp.x+rnd(-20,20);p.y=GROUND-20;p.vx=rnd(-0.4,0.4);p.vy=-rnd(3,7);p.maxLife=p.life=rnd(40,70);p.size=rnd(1.5,3.5);p.color=Math.random()<0.5?'#ff8833':'#ffcc66';p.grav=-0.03;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}
    if(fp.timer<=0)G.firePillars.splice(i,1);
  }
  if(G.hakariDomainT>0)G.hakariDomainT--;
  for(let i=G.speedLines.length-1;i>=0;i--){
    const l=G.speedLines[i];l.life--;l.len+=l.speed;
    if(l.life<=0)G.speedLines.splice(i,1);
  }
  for(let i=G.impactBursts.length-1;i>=0;i--){
    const b=G.impactBursts[i];b.life--;b.size*=1.105;
    if(b.life<=0)G.impactBursts.splice(i,1);
  }
  if(G.shake>0){G.shake*=0.86;if(G.shake<0.4)G.shake=0;}
  G.shakeX=rnd(-1,1)*G.shake;G.shakeY=rnd(-1,1)*G.shake;
  if(G.flash>0)G.flash*=0.86;
  if(G.zoomPunch>0)G.zoomPunch*=0.88;
  if(G.camPunch>0)G.camPunch*=0.82;
  if(G.mode!=='menu'&&G.frame%4===0&&G.ambient.length<60){
    const camL=cam.x-W/2/cam.zoom,camR=cam.x+W/2/cam.zoom;
    G.ambient.push({x:rnd(camL,camR),y:rnd(200,GROUND),vx:rnd(-0.25,0.25),vy:rnd(-0.35,-0.05),life:rnd(120,260),maxLife:260,size:rnd(0.8,2.2),alpha:rnd(0.15,0.4)});
  }
  for(let i=G.ambient.length-1;i>=0;i--){const a=G.ambient[i];a.x+=a.vx;a.y+=a.vy;a.life--;if(a.life<=0)G.ambient.splice(i,1);}
}
function shake(v){G.shake=Math.min(34,G.shake+v);}
function flash(v,c){G.flash=Math.max(G.flash,v);G.flashColor=c||'#ffffff';}
function camPunch(v){G.camPunch=Math.min(0.35,G.camPunch+v);}
function combatFeelImpact(x,y,mv,bf=false){
  const heavy=(mv.damage||0)>=16 || mv.kind==='heavy' || mv.kind==='ult';
  const power=bf?1.55:(heavy?1.15:0.72);
  const col=bf?'#ff2a4d':(heavy?'#ffd166':'#ffffff');
  G.impactBursts.push({x,y,life:bf?18:12,maxLife:bf?18:12,size:(bf?46:(heavy?30:20))*power,color:col});
  const count=bf?16:(heavy?9:5);
  for(let i=0;i<count;i++){
    const a=Math.random()*6.283185307;
    G.speedLines.push({x,y,angle:a,len:rnd(bf?70:34,bf?150:82),speed:rnd(bf?3.4:2.2,bf?7.2:4.8),life:bf?14:9,maxLife:bf?14:9,color:bf?(i%2?'#ff2a4d':'#ffffff'):(heavy?'#ffd166':'#dbe9ff')});
  }
  ring(x,y,col,bf?52:(heavy?32:22),bf?20:14);
  if(heavy||bf)vfxShockwave(x,y,bf?'#ff2a4d':(heavy?'#ffd166':'#ffffff'),bf?58:34,bf?18:12);
}
/* ===== FIRE PILLAR ===== */
function spawnFirePillar(x,owner){
  G.firePillars.push({x,owner,w:150,h:280,timer:70,maxTimer:70,t:0});
  ring(x,GROUND,'#ff8833',90,30);ring(x,GROUND-40,'#ffcc66',70,26);burst(x,GROUND,26,'#ff8822',9,14,26);
  shake(20);camPunch(0.24);flash(0.55,'#ff7722');SFX.fugaPillar();
  floatText(x,GROUND-230,'DIVINE FLAME','#ff8833',26,60);
}
/* ===== VFX HELPERS ===== */
function vfxSpiralIn(cx,cy,color,count,radius,life){for(let i=0;i<count;i++){const p=pget();const a=Math.random()*6.28;const r=radius*rnd(0.55,1.15);const s=rnd(1.6,3.4);p.active=true;p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r*0.72;p.vx=-Math.cos(a)*s-Math.sin(a)*s*0.55;p.vy=-Math.sin(a)*s*0.72+Math.cos(a)*s*0.45;p.maxLife=p.life=rnd(life*0.55,life);p.size=rnd(2,4.5);p.color=color;p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxShockwave(cx,cy,color,radius,life){const p=pget();p.active=true;p.x=cx;p.y=cy;p.vx=0;p.vy=0;p.maxLife=p.life=life;p.size=radius;p.color=color;p.grav=0;p.shape='shock';p.rot=0;p.vr=0;p.add=true;const q=pget();q.active=true;q.x=cx;q.y=cy;q.vx=0;q.vy=0;q.maxLife=q.life=Math.round(life*0.7);q.size=radius*0.55;q.color=color;q.grav=0;q.shape='ring';q.rot=0;q.vr=0;q.add=true;}
function vfxSlashTrail(x1,y1,x2,y2,color,thick,life){const steps=Math.max(3,Math.floor(Math.hypot(x2-x1,y2-y1)/14));const ang=Math.atan2(y2-y1,x2-x1);for(let i=0;i<steps;i++){const t=i/steps;const px=lerp(x1,x2,t);const py=lerp(y1,y2,t);const p=pget();const a=Math.random()*6.28;p.active=true;p.x=px;p.y=py;p.vx=Math.cos(a)*rnd(0.3,1.4);p.vy=Math.sin(a)*rnd(0.3,1.4);p.maxLife=p.life=rnd(life*0.5,life);p.size=rnd(2,thick);p.color=color;p.grav=0;p.shape='bolt';p.rot=ang;p.vr=rnd(-0.1,0.1);p.add=true;}}
function vfxFlameCone(cx,cy,facing,life){for(let i=0;i<8;i++){const p=pget();const a=rnd(-0.55,0.55);const sp=rnd(3,7);p.active=true;p.x=cx;p.y=cy;p.vx=Math.cos(a)*sp*facing;p.vy=Math.sin(a)*sp+rnd(-1,0.5);p.maxLife=p.life=rnd(life*0.6,life);p.size=rnd(3,8);const c=['#ff8822','#ffaa33','#ff5511','#ffdd66'];p.color=c[(Math.random()*4)|0];p.grav=-0.05;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxDeflectSparks(cx,cy,facing,count){for(let i=0;i<count;i++){const p=pget();const a=rnd(-1.2,1.2);const sp=rnd(3,8);p.active=true;p.x=cx;p.y=cy;p.vx=Math.cos(a)*sp*facing;p.vy=Math.sin(a)*sp-rnd(1,3);p.maxLife=p.life=rnd(10,20);p.size=rnd(2,5);p.color=Math.random()<0.5?'#7fd8ff':'#ffffff';p.grav=0.15;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxEmber(cx,cy,count){for(let i=0;i<count;i++){const p=pget();const a=rnd(-0.5,0.5);p.active=true;p.x=cx+rnd(-40,40);p.y=cy;p.vx=Math.cos(a)*rnd(0.5,2);p.vy=-rnd(1.5,4);p.maxLife=p.life=rnd(30,60);p.size=rnd(1.5,3.5);p.color=Math.random()<0.5?'#ff8833':'#ffcc66';p.grav=-0.02;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxSpeechWaves(cx,cy,facing,color){for(let k=0;k<3;k++){const p=pget();p.active=true;p.x=cx+facing*(k*22);p.y=cy;p.vx=facing*1.5;p.vy=0;p.maxLife=p.life=22+k*4;p.size=18+k*8;p.color=color;p.grav=0;p.shape='ring';p.rot=0;p.vr=0;p.add=true;}}
function vfxCopySwirl(cx,cy,count){for(let i=0;i<count;i++){const p=pget();const a=Math.random()*6.28;const r=rnd(28,70);p.active=true;p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r*0.7;p.vx=-Math.cos(a)*rnd(1,2.2);p.vy=-Math.sin(a)*rnd(1,2.2);p.maxLife=p.life=rnd(20,40);p.size=rnd(2,5);p.color=Math.random()<0.5?'#e0d0ff':'#c9a6ff';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxDistortion(cx,cy,facing,w,h){for(let i=0;i<20;i++){const p=pget();p.active=true;p.x=cx+rnd(-w*0.4,w*0.4);p.y=cy+rnd(-h*0.4,h*0.4);p.vx=facing*rnd(0.3,1.4);p.vy=rnd(-0.5,0.5);p.maxLife=p.life=rnd(14,28);p.size=rnd(3,8);p.color=Math.random()<0.5?'#e0d0ff':'#ffffff';p.grav=0;p.shape='bolt';p.rot=rnd(-0.4,0.4);p.vr=0;p.add=true;}}
function vfxHealParticles(cx,cy,count){for(let i=0;i<count;i++){const p=pget();const a=Math.random()*6.28;const r=rnd(20,50);p.active=true;p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r*1.4;p.vx=-Math.cos(a)*0.6;p.vy=-Math.abs(Math.sin(a))*1.6-0.6;p.maxLife=p.life=rnd(28,52);p.size=rnd(1.6,3.6);p.color=Math.random()<0.5?'#c9ffe0':'#a6f0d0';p.grav=-0.02;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxBeamChargeConverge(cx,cy,tt){for(let i=0;i<2;i++){const p=pget();const a=Math.random()*6.28;const r=rnd(70,150)*(1-tt*0.55);p.active=true;p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r*0.7;p.vx=-Math.cos(a)*rnd(3,6.5);p.vy=-Math.sin(a)*rnd(3,6.5);p.maxLife=p.life=rnd(12,22);p.size=rnd(2,4.5);p.color=Math.random()<0.5?'#e0d0ff':'#ffffff';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxBeamImpact(x,y){vfxShockwave(x,y,'#c9a6ff',150,34);vfxShockwave(x,y,'#ffffff',100,28);burst(x,y,32,'#e0d0ff',12,15,36);burst(x,y,18,'#ffffff',9,11,28);for(let i=0;i<12;i++){const p=pget();const a=Math.random()*6.28;p.active=true;p.x=x;p.y=y;p.vx=Math.cos(a)*rnd(3,9);p.vy=Math.sin(a)*rnd(3,9)-2;p.maxLife=p.life=rnd(18,34);p.size=rnd(2,5);p.color=Math.random()<0.5?'#e0d0ff':'#ffffff';p.grav=0.05;p.shape='bolt';p.rot=a;p.vr=rnd(-0.15,0.15);p.add=true;}}
function vfxHakariDoor(cx,cy,facing){vfxShockwave(cx,cy,'#ffd166',90,26);vfxShockwave(cx,cy,'#ffffff',60,22);for(let i=0;i<20;i++){const p=pget();const a=rnd(-0.7,0.7);p.active=true;p.x=cx;p.y=cy+rnd(-40,40);p.vx=facing*Math.cos(a)*rnd(3,8);p.vy=Math.sin(a)*rnd(3,8);p.maxLife=p.life=rnd(12,22);p.size=rnd(2,5);p.color=Math.random()<0.5?'#ffd166':'#ffffff';p.grav=0.1;p.shape='bolt';p.rot=a;p.vr=rnd(-0.2,0.2);p.add=true;}for(let d=-1;d<=1;d+=2){for(let i=0;i<12;i++){const p=pget();p.active=true;p.x=cx+d*(20+i*5);p.y=cy;p.vx=0;p.vy=rnd(-2,2);p.maxLife=p.life=rnd(14,24);p.size=rnd(3,7);p.color='#ffe9a8';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}}
function vfxHakariRough(cx,cy,facing){vfxShockwave(cx,cy,'#ffb060',120,32);vfxShockwave(cx,cy,'#ffffff',80,28);burst(cx,cy,30,'#ffd166',13,15,34);burst(cx,cy,20,'#ffaa44',9,12,28);for(let i=0;i<18;i++){const p=pget();const a=rnd(-1.0,1.0);p.active=true;p.x=cx;p.y=cy;p.vx=Math.cos(a)*rnd(4,10)*facing;p.vy=Math.sin(a)*rnd(4,10);p.maxLife=p.life=rnd(14,26);p.size=rnd(3,7);p.color=Math.random()<0.5?'#ffd166':'#ffcc44';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxHakariJackpotRoll(cx,cy){for(let i=0;i<3;i++){const p=pget();const a=Math.random()*6.28;const r=rnd(30,90);p.active=true;p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r*0.7;p.vx=-Math.cos(a)*1.8;p.vy=-Math.sin(a)*1.8;p.maxLife=p.life=rnd(12,24);p.size=rnd(2,4);p.color=Math.random()<0.5?'#ffd166':'#ffffff';p.grav=0;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxHakariJackpotBurst(cx,cy){vfxShockwave(cx,cy,'#ffd166',180,40);vfxShockwave(cx,cy,'#ffffff',130,34);burst(cx,cy,50,'#ffd166',16,18,46);burst(cx,cy,30,'#ffffff',12,14,36);for(let i=0;i<28;i++){const p=pget();const a=Math.random()*6.28;p.active=true;p.x=cx;p.y=cy;p.vx=Math.cos(a)*rnd(4,12);p.vy=Math.sin(a)*rnd(4,12)-4;p.maxLife=p.life=rnd(28,52);p.size=rnd(3,6);p.color=Math.random()<0.5?'#ffd166':'#ffaa33';p.grav=0.18;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxHakariHeal(cx,cy){for(let i=0;i<3;i++){const p=pget();const a=Math.random()*6.28;const r=rnd(18,44);p.active=true;p.x=cx+Math.cos(a)*r;p.y=cy+Math.sin(a)*r*1.2;p.vx=-Math.cos(a)*0.7;p.vy=-Math.abs(Math.sin(a))*1.5-0.5;p.maxLife=p.life=rnd(20,36);p.size=rnd(1.8,3.4);p.color=Math.random()<0.5?'#ffd166':'#ffffff';p.grav=-0.03;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}
function vfxHakariOverdrivePunch(cx,cy){vfxShockwave(cx,cy,'#ffd166',70,20);burst(cx,cy,10,'#ffd166',8,9,20);}
function vfxHakariOverdriveBarrage(cx,cy){for(let i=0;i<6;i++){const p=pget();const a=Math.random()*6.28;p.active=true;p.x=cx+rnd(-30,30);p.y=cy+rnd(-40,40);p.vx=Math.cos(a)*rnd(3,7);p.vy=Math.sin(a)*rnd(3,7);p.maxLife=p.life=rnd(10,20);p.size=rnd(2,5);p.color=Math.random()<0.5?'#ffd166':'#ffffff';p.grav=0;p.shape='bolt';p.rot=a;p.vr=0;p.add=true;}}
function vfxHakariOverdriveSlam(cx,cy){vfxShockwave(cx,cy,'#ffd166',160,38);vfxShockwave(cx,cy,'#ffffff',100,32);burst(cx,cy,36,'#ffd166',14,16,38);for(let i=0;i<16;i++){const p=pget();const a=Math.PI+rnd(-0.6,0.6);p.active=true;p.x=cx;p.y=cy;p.vx=Math.cos(a)*rnd(4,10);p.vy=Math.sin(a)*rnd(4,10)-2;p.maxLife=p.life=rnd(16,28);p.size=rnd(3,7);p.color=Math.random()<0.5?'#ffd166':'#ffcc66';p.grav=0.15;p.shape='circle';p.rot=0;p.vr=0;p.add=true;}}