/* ITACHI RIG CINEMATICS V2
   Tsukuyomi uses the live fighter renderer on Canvas 2D.
   Katon has eight pose keyframes. Normal gameplay rendering remains untouched.
*/
(function(){
'use strict';
if(window.__JFF_ITACHI_RIG_CINEMATICS_V2__)return;
const Q=window.JFF_ITACHI_REBOOT;
if(!Q){console.warn('[Itachi Rig] Missing reboot controller');return;}
window.__JFF_ITACHI_RIG_CINEMATICS_V2__=true;
const previousRender=window.render;
const previousPose=window.applyCharacterIdentityPose;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const savedDisplay=new Map();
const stages=['jffOutsiderStage','jffItachiRebootStage','jffItachiCinematicStage'];
function hideEffectLayers(hide){
 for(const id of stages){
  const el=document.getElementById(id);if(!el)continue;
  if(!savedDisplay.has(id))savedDisplay.set(id,el.style.display||'');
  el.style.display=hide?'none':savedDisplay.get(id);
 }
 const cv=document.getElementById('cv');if(cv)cv.style.filter='';
}
const fireballSealKeys=[
 [-6,36,-23,142,-30,-58,-112,-96],  // Horse
 [1,18,-52,155,-42,-57,-112,-96],   // Monkey
 [-4,49,-49,130,-39,-57,-113,-96],  // Bird
 [-10,22,-35,151,-25,-59,-115,-96], // Dog
 [3,44,-58,128,-22,-56,-111,-96],   // Boar
 [-6,31,-45,146,-52,-57,-113,-96],  // Goat
 [-13,39,-37,137,-34,-57,-117,-99]  // Tiger
];
const breathSealKeys=[
 [-3,51,-40,127,-41,-58,-114,-96],  // Tiger
 [-9,16,-60,162,-22,-57,-114,-96],  // Serpent
 [2,37,-27,143,-45,-57,-112,-96],    // Ram
 [-1,24,-51,155,-16,-56,-110,-95],   // Rat
 [4,43,-19,125,-54,-56,-113,-96],    // Dog
 [-13,37,-33,137,-30,-57,-117,-99]  // Tiger
];
const sealKeys=fireballSealKeys.concat(breathSealKeys);
function applyPose(P,f){
 if(!P||!f)return;
 const n=f.moveFrame||0,key=f.itachiCinemaPose;
 if(f.id==='itachi'&&f.moveKey==='s1'&&!Q.cinema){
  const mode=f.itachiFireMode||'charge',sealStart=f.itachiSealStart||n;
  P.hipY=-57;P.shY=-96;P.headY=-114;
  if(mode==='breath'||f.itachiPoseKey==='s1fire'){
   const pulse=Math.sin(n*.24);
   P.lean=19+pulse*1.6;P.armF=[17,-51+pulse*2];P.armB=[151,-45+pulse*2];
   P.legF=[76,17];P.legB=[108,-12];P.hipY=-51;P.headY=-119;P.shY=-91;
   return;
  }
  if(mode==='fireball'||f.itachiPoseKey==='s1release'){
   const recovery=clamp((n-(f.itachiFireFrame||n))/18,0,1);
   P.lean=lerp(23,2,smooth(recovery));P.armF=[14,-61+recovery*18];P.armB=[153,-49+recovery*23];
   P.legF=[69,22];P.legB=[113,-16];P.hipY=-50;P.headY=-119;P.shY=-91;
   return;
  }
  if(mode==='fireball-seals'||f.itachiPoseKey==='s1fireball-seals'){
   const elapsed=clamp(n-sealStart,0,41),step=6,idx=Math.min(fireballSealKeys.length-1,Math.floor(elapsed/step));
   const a=fireballSealKeys[idx],b=fireballSealKeys[Math.min(idx+1,fireballSealKeys.length-1)],t=idx===fireballSealKeys.length-1?0:smooth((elapsed%step)/step);
   P.lean=lerp(a[0],b[0],t);P.armF=[lerp(a[1],b[1],t),lerp(a[2],b[2],t)];P.armB=[lerp(a[3],b[3],t),lerp(a[4],b[4],t)];
   P.hipY=lerp(a[5],b[5],t);P.headY=lerp(a[6],b[6],t);P.shY=lerp(a[7],b[7],t);
   P.legF=[83+Math.sin(elapsed*.24)*3,9];P.legB=[104-Math.sin(elapsed*.24)*2,-9];
   return;
  }
  if(mode==='breath-seals'||f.itachiPoseKey==='s1breath-seals'){
   const elapsed=clamp(n-sealStart,0,23),step=4,idx=Math.min(breathSealKeys.length-1,Math.floor(elapsed/step));
   const a=breathSealKeys[idx],b=breathSealKeys[Math.min(idx+1,breathSealKeys.length-1)],t=idx===breathSealKeys.length-1?0:smooth((elapsed%step)/step);
   P.lean=lerp(a[0],b[0],t);P.armF=[lerp(a[1],b[1],t),lerp(a[2],b[2],t)];P.armB=[lerp(a[3],b[3],t),lerp(a[4],b[4],t)];
   P.hipY=lerp(a[5],b[5],t);P.headY=lerp(a[6],b[6],t);P.shY=lerp(a[7],b[7],t);
   P.lean+=Math.sin(elapsed*.45)*1.8;P.legF=[78+Math.sin(elapsed*.47)*6,15];P.legB=[110-Math.sin(elapsed*.47)*4,-13];
   return;
  }
  P.lean=-7;P.armF=[31,-38];P.armB=[133,-35];P.legF=[82,7];P.legB=[101,-8];P.hipY=-56;P.headY=-116;P.shY=-95;
  return;
 }
 if(key==='bound'){
  P.lean=0;P.hipY=-50;P.shY=-96;P.headY=-113;P.headX=0;
  P.armF=[0,0];P.armB=[180,0];P.legF=[72,25];P.legB=[108,-17];
 }else if(key==='tsukuyomi-owner'){
  const frame=Number.isFinite(f.itachiTsukuyomiPoseFrame)?f.itachiTsukuyomiPoseFrame:(Q.cinema?Q.cinema.frame:0);
  const beat=frame>=144?(frame-144)%72:-1,mode=f.itachiTsukuyomiPoseMode||'active';
  P.hipY=-57;P.shY=-96;P.headY=-114;
  if(mode==='ready'){
   P.lean=0;P.armF=[34,-26];P.armB=[132,18];P.legF=[88,5];P.legB=[94,-5];
  }else if(frame<36){
   P.lean=-6;P.armF=[35,-36];P.armB=[140,-36];P.legF=[82,8];P.legB=[100,-8];
  }else if(frame<144){
   const q=smooth((frame-36)/108);P.lean=lerp(-6,12,q);P.armF=[lerp(35,34,q),lerp(-36,-26,q)];P.armB=[132,18];P.legF=[lerp(82,78,q),lerp(8,14,q)];P.legB=[lerp(100,108,q),lerp(-8,-12,q)];
  }else if(beat<12){
   P.lean=-4;P.armF=[34,-26];P.armB=[132,18];P.legF=[84,6];P.legB=[98,-6];
  }else if(beat<30){
   const q=smooth((beat-12)/18);P.lean=lerp(-4,23,q);P.armF=[lerp(34,8,q),lerp(-26,0,q)];P.armB=[lerp(132,118,q),lerp(18,24,q)];P.legF=[lerp(84,57,q),lerp(6,21,q)];P.legB=[lerp(98,127,q),lerp(-6,-19,q)];
  }else if(beat<42){
   P.lean=23;P.armF=[8,0];P.armB=[118,24];P.legF=[57,21];P.legB=[127,-19];
  }else if(beat<55){
   const q=smooth((beat-42)/13);P.lean=lerp(23,0,q);P.armF=[lerp(8,34,q),lerp(0,-26,q)];P.armB=[lerp(118,132,q),lerp(24,18,q)];P.legF=[lerp(57,88,q),lerp(21,5,q)];P.legB=[lerp(127,94,q),lerp(-19,-5,q)];
  }else{
   P.lean=0;P.armF=[34,-26];P.armB=[132,18];P.legF=[88,5];P.legB=[94,-5];
  }
 }
}
if(typeof previousPose==='function')window.applyCharacterIdentityPose=function(P,f){
 previousPose.apply(this,arguments);applyPose(P,f);
};

function drawMoon(n){
 const g=ctx.createRadialGradient(1008,137,8,1008,137,143);
 g.addColorStop(0,'#ffccd3');g.addColorStop(.28,'#e43d5b');g.addColorStop(.68,'#8c102d');g.addColorStop(1,'rgba(32,2,11,0)');
 ctx.save();ctx.globalCompositeOperation='screen';ctx.fillStyle=g;ctx.beginPath();ctx.arc(1008,137,145,0,Math.PI*2);ctx.fill();ctx.restore();
 ctx.save();ctx.fillStyle='#b7193d';ctx.beginPath();ctx.arc(1008,137,107,0,Math.PI*2);ctx.fill();
 for(let i=0;i<13;i++){const x=1008+Math.sin(i*5.1)*73,y=137+Math.cos(i*3.4)*72;ctx.fillStyle=i%2?'rgba(28,3,12,.2)':'rgba(255,145,165,.12)';ctx.beginPath();ctx.ellipse(x,y,8+i%5,4+i%7,i*.4,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle='rgba(246,69,103,.55)';ctx.lineWidth=2;ctx.setLineDash([4,12]);ctx.beginPath();ctx.arc(1008,137,126+n%8,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
}
function drawBackground(n){
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
 const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#020207');bg.addColorStop(.54,'#10030c');bg.addColorStop(1,'#020208');
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 ctx.save();ctx.globalAlpha=.13;ctx.fillStyle='#7d0929';ctx.fillRect(0,0,W,H);ctx.restore();
 drawMoon(n);
 const mist=ctx.createLinearGradient(0,390,0,H);mist.addColorStop(0,'rgba(69,5,28,0)');mist.addColorStop(.6,'rgba(58,4,22,.18)');mist.addColorStop(1,'rgba(0,0,0,.82)');
 ctx.fillStyle=mist;ctx.fillRect(0,370,W,350);
 ctx.fillStyle='#050309';ctx.beginPath();ctx.moveTo(0,560);ctx.bezierCurveTo(175,515,280,565,426,548);ctx.bezierCurveTo(640,519,827,575,1005,546);ctx.quadraticCurveTo(1140,530,1280,514);ctx.lineTo(1280,720);ctx.lineTo(0,720);ctx.closePath();ctx.fill();
 ctx.strokeStyle='rgba(177,24,61,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,560);ctx.bezierCurveTo(175,515,280,565,426,548);ctx.bezierCurveTo(640,519,827,575,1005,546);ctx.quadraticCurveTo(1140,530,1280,514);ctx.stroke();
 for(let i=0;i<22;i++){
  const x=(i*173+n*.8)%1280,y=(i*97+n*.31)%590,r=1+(i%3)*.55;
  ctx.fillStyle=i%2?'rgba(255,55,91,.62)':'rgba(166,24,72,.78)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 }
 // Stronger vignette and restrained cinematic bars.
 const vg=ctx.createRadialGradient(640,360,180,640,360,780);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.78)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#010104';ctx.fillRect(0,0,W,32);ctx.fillRect(0,H-32,W,32);
 ctx.fillStyle='#ff8ea8';ctx.font='bold 15px Consolas,monospace';ctx.textAlign='left';ctx.fillText('MANGEKYO // TSUKUYOMI',28,22);
 ctx.fillStyle='#b84968';ctx.textAlign='center';ctx.font='12px Consolas,monospace';ctx.fillText('A MOMENT OUTSIDE REAL TIME',W/2,H-12);
}
function drawCross(x,y,n){
 ctx.save();ctx.translate(x,y);
 ctx.shadowColor='#b51f47';ctx.shadowBlur=12;
 const wood=ctx.createLinearGradient(-20,0,20,0);wood.addColorStop(0,'#13070f');wood.addColorStop(.45,'#512036');wood.addColorStop(1,'#10060d');
 ctx.fillStyle=wood;ctx.strokeStyle='#a93b5a';ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(-16,-221);ctx.lineTo(0,-242);ctx.lineTo(16,-221);ctx.lineTo(13,55);ctx.lineTo(-13,55);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(-105,-107);ctx.lineTo(-91,-128);ctx.lineTo(91,-128);ctx.lineTo(105,-107);ctx.lineTo(91,-87);ctx.lineTo(-91,-87);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,64,103,.55)';ctx.lineWidth=1.5;ctx.setLineDash([5,8]);ctx.beginPath();ctx.moveTo(0,-230);ctx.lineTo(0,45);ctx.moveTo(-96,-107);ctx.lineTo(96,-107);ctx.stroke();ctx.setLineDash([]);
 for(let i=0;i<9;i++){const yy=-200+i*27;ctx.fillStyle='rgba(198,32,65,'+(.12+((i+n%4)%4)*.04)+')';ctx.fillRect(-9,yy,18,4);}
 ctx.restore();
}
function drawRestraints(x,y,n){
 ctx.save();ctx.lineCap='round';ctx.shadowColor='#b0173d';ctx.shadowBlur=5;
 for(const side of [-1,1]){
  const sx=x+side*79,sy=y-100;
  ctx.strokeStyle='#130912';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(x+side*50,y-80,x+side*36,y-55);ctx.stroke();
  ctx.strokeStyle='#a72c4a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(x+side*50,y-80,x+side*36,y-55);ctx.stroke();
  ctx.fillStyle='#160812';ctx.strokeStyle='#c13c5a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sx,sy,12,8,side*.16,0,Math.PI*2);ctx.fill();ctx.stroke();
 }
 // A separate waist restraint grounds the pose to the cross.
 ctx.strokeStyle='#100810';ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(x-36,y-68);ctx.lineTo(x+36,y-68);ctx.stroke();
 ctx.strokeStyle='#ad2849';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x-36,y-68);ctx.lineTo(x+36,y-68);ctx.stroke();
 ctx.restore();
}
function drawHeldKatana(f,targetX,active,beat,cloneAlpha,copyIndex){
 const P=computePose(f),fd=f.facing||1;
 const shoulder={x:f.x+P.lean*.28*fd,y:f.y+P.shY};
 const elbow=joint(shoulder,P.armF[0],20);
 const hand=joint(elbow,P.armF[0]+P.armF[1],20);
 // The blade is attached to the actual rig's hand, and all copies point toward the enemy.
 // Its fixed shallow downward angle targets the middle of the torso; there are no slash arcs.
 const angle=.20,ux=Math.cos(angle),uy=Math.sin(angle),perpX=-uy,perpY=ux;
 let length=active?64:68;
 if(active&&beat>=16&&beat<=35)length=lerp(62,68,smooth((beat-16)/19));
 const pommel={x:hand.x-ux*12,y:hand.y-uy*12};
 const guard={x:hand.x+ux*10,y:hand.y+uy*10};
 const base={x:guard.x+ux*6,y:guard.y+uy*6};
 const tip={x:base.x+ux*length,y:base.y+uy*length};
 const shoulderBlade={x:tip.x-ux*8,y:tip.y-uy*8};
 ctx.save();ctx.globalAlpha=cloneAlpha;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.strokeStyle='#08070d';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(pommel.x,pommel.y);ctx.lineTo(guard.x,guard.y);ctx.stroke();
 ctx.strokeStyle='#85233e';ctx.lineWidth=2;
 for(let j=1;j<=4;j++){const q=j/5,xx=pommel.x+(guard.x-pommel.x)*q,yy=pommel.y+(guard.y-pommel.y)*q;ctx.beginPath();ctx.moveTo(xx-perpX*3,yy-perpY*3);ctx.lineTo(xx+perpX*3,yy+perpY*3);ctx.stroke();}
 ctx.fillStyle='#0d0a13';ctx.strokeStyle='#b84968';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(pommel.x,pommel.y,4,3,angle,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.strokeStyle='#120d17';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(guard.x-perpX*9,guard.y-perpY*9);ctx.lineTo(guard.x+perpX*9,guard.y+perpY*9);ctx.stroke();
 ctx.strokeStyle='#d8a4b6';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(guard.x-perpX*8,guard.y-perpY*8);ctx.lineTo(guard.x+perpX*8,guard.y+perpY*8);ctx.stroke();
 ctx.beginPath();ctx.moveTo(base.x+perpX*3.8,base.y+perpY*3.8);ctx.lineTo(shoulderBlade.x+perpX*2.45,shoulderBlade.y+perpY*2.45);ctx.lineTo(tip.x,tip.y);ctx.lineTo(shoulderBlade.x-perpX*1.4,shoulderBlade.y-perpY*1.4);ctx.lineTo(base.x-perpX*3.8,base.y-perpY*3.8);ctx.closePath();
 ctx.fillStyle='#aeb9c9';ctx.fill();ctx.strokeStyle='#141522';ctx.lineWidth=1.7;ctx.stroke();
 ctx.strokeStyle='#fff7ed';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(base.x+perpX*1.4,base.y+perpY*1.4);ctx.lineTo(tip.x-ux*9+perpX*.5,tip.y-uy*9+perpY*.5);ctx.stroke();
 if(active&&beat>=31&&beat<=38){
  const k=1-Math.abs(34.5-beat)/4.5,impact={x:targetX+3,y:f.y-73};
  ctx.globalCompositeOperation='screen';ctx.globalAlpha=cloneAlpha*.7*k;ctx.strokeStyle='#fff0f4';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(impact.x,impact.y,5+copyIndex%3*2,0,Math.PI*2);ctx.stroke();
  for(let j=0;j<4;j++){const a=j*Math.PI/2;ctx.beginPath();ctx.moveTo(impact.x+Math.cos(a)*4,impact.y+Math.sin(a)*4);ctx.lineTo(impact.x+Math.cos(a)*12,impact.y+Math.sin(a)*12);ctx.stroke();}
 }
 ctx.restore();
}

function drawClockTitle(n){
 if(n>=372&&n<432){
  const a=smooth((n-372)/14)*(1-smooth((n-420)/12));
  ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.shadowColor='#ea315a';ctx.shadowBlur=24;
  ctx.font='900 72px Consolas,monospace';ctx.fillStyle='#fff0f4';ctx.fillText('72 HOURS',W/2,342);
  ctx.shadowBlur=8;ctx.font='bold 20px Consolas,monospace';ctx.fillStyle='#ff7895';ctx.fillText('INSIDE THE GENJUTSU',W/2,385);
  ctx.restore();
 }
 if(n>=432){
  const a=1-smooth((n-466)/14);
  ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='bold 27px Consolas,monospace';ctx.fillStyle='#fff1f5';ctx.shadowColor='#e52b58';ctx.shadowBlur=20;ctx.fillText('GENJUTSU RELEASE',W/2,350);ctx.restore();
 }
}
function drawTsukuyomi(){
 const c=Q.cinema;if(!c||c.kind!=='tsukuyomi'||!c.owner||!c.target)return false;
 const n=c.frame||0,owner=c.owner,target=c.target;
 hideEffectLayers(true);drawBackground(n);
 const tx=835,ty=558,cycleStart=144,cycleLength=72,totalAttacks=8;
 const attackActive=n>=cycleStart&&n<cycleStart+cycleLength*totalAttacks;
 const attackIndex=attackActive?Math.min(totalAttacks-1,Math.floor((n-cycleStart)/cycleLength)):-1;
 const beat=attackActive?(n-cycleStart)%cycleLength:-1;
 let leadDistance;
 if(n<36)leadDistance=lerp(450,365,smooth(n/36));
 else if(n<80)leadDistance=lerp(365,285,smooth((n-36)/44));
 else if(n<cycleStart)leadDistance=255;
 else if(attackActive&&beat<12)leadDistance=255;
 else if(attackActive&&beat<30)leadDistance=lerp(255,74,smooth((beat-12)/18));
 else if(attackActive&&beat<42)leadDistance=74;
 else if(attackActive&&beat<55)leadDistance=lerp(74,220,smooth((beat-42)/13));
 else if(attackActive)leadDistance=235;
 else leadDistance=lerp(170,310,smooth((n-(cycleStart+cycleLength*totalAttacks))/105));
 const cloneCount=n<56?1:(n<78?2:(n<100?3:(n<120?4:5)));
 const activeSlot=attackIndex>=0?attackIndex%cloneCount:0;
 const copies=[];
 for(let slot=0;slot<cloneCount;slot++){
  let distance,rank=0;
  if(slot===activeSlot)distance=leadDistance;
  else{rank=slot<activeSlot?slot:slot-1;distance=leadDistance+82*(rank+1);}
  const alpha=slot===activeSlot?1:Math.max(.30,.62-rank*.075);
  copies.push({slot,x:tx-distance,distance,alpha,active:slot===activeSlot,rank});
 }
 copies.sort((a,b)=>b.distance-a.distance);
 const transition=smooth((n-108)/36),zoom=n<36?1.24:(n<108?1.05:(1.05-.05*transition));
 const focusX=n<36?tx-leadDistance:(n<108?530:640);
 const focusY=n<108?407:(405+(360-405)*transition);
 ctx.save();ctx.translate(W/2,H/2);ctx.scale(zoom,zoom);ctx.translate(-focusX,-focusY);
 drawCross(tx,ty,n);
 const ownerSave={x:owner.x,y:owner.y,facing:owner.facing,pose:owner.itachiCinemaPose,poseKey:owner.itachiPoseKey,animT:owner.animT,poseFrame:owner.itachiTsukuyomiPoseFrame,poseMode:owner.itachiTsukuyomiPoseMode};
 const targetSave={x:target.x,y:target.y,facing:target.facing,pose:target.itachiCinemaPose,poseKey:target.itachiPoseKey,animT:target.animT};
 try{
  target.x=tx;target.y=ty;target.facing=-1;target.itachiCinemaPose='bound';target.itachiPoseKey='s2';target.animT=(targetSave.animT||0)+n*.08;
  for(const copy of copies){
   if(copy.active)continue;
   owner.x=copy.x;owner.y=ty;owner.facing=1;owner.itachiCinemaPose='tsukuyomi-owner';owner.itachiPoseKey='s2';owner.itachiTsukuyomiPoseFrame=n;owner.itachiTsukuyomiPoseMode='ready';owner.animT=(ownerSave.animT||0)+n*.14+copy.slot*4;
   ctx.save();ctx.globalAlpha=copy.alpha;
   window.drawFighter(owner);drawHeldKatana(owner,tx,false,beat,copy.alpha,copy.slot);
   ctx.restore();
  }
  window.drawFighter(target);
  drawRestraints(tx,ty,n);
  owner.x=tx-leadDistance;owner.y=ty;owner.facing=1;owner.itachiCinemaPose='tsukuyomi-owner';owner.itachiPoseKey='s2';owner.itachiTsukuyomiPoseFrame=n;owner.itachiTsukuyomiPoseMode='active';owner.animT=(ownerSave.animT||0)+n*.14+activeSlot*4;
  window.drawFighter(owner);drawHeldKatana(owner,tx,true,beat,1,activeSlot);
 }finally{
  owner.x=ownerSave.x;owner.y=ownerSave.y;owner.facing=ownerSave.facing;owner.itachiCinemaPose=ownerSave.pose;owner.itachiPoseKey=ownerSave.poseKey;owner.animT=ownerSave.animT;owner.itachiTsukuyomiPoseFrame=ownerSave.poseFrame;owner.itachiTsukuyomiPoseMode=ownerSave.poseMode;
  target.x=targetSave.x;target.y=targetSave.y;target.facing=targetSave.facing;target.itachiCinemaPose=targetSave.pose;target.itachiPoseKey=targetSave.poseKey;target.animT=targetSave.animT;
  ctx.restore();
 }
 if(n<36){
  const a=.16+Math.sin(n*.25)*.08;ctx.fillStyle='rgba(235,24,67,'+a+')';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,92,124,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(410,334,106+n*.45,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#ff9db2';ctx.font='bold 18px Consolas,monospace';ctx.textAlign='center';ctx.fillText('EYE CONTACT',W/2,595);
 }else if(n>=36&&n<cycleStart){
  ctx.fillStyle='rgba(90,2,24,.10)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ff8da7';ctx.font='bold 17px Consolas,monospace';ctx.textAlign='center';ctx.fillText('THE CLONES CLOSE IN',W/2,628);
 }else if(attackActive){
  if(beat>=31&&beat<=38){ctx.fillStyle='rgba(255,222,232,.12)';ctx.fillRect(0,0,W,H);}
  ctx.fillStyle='#ff9fb3';ctx.font='bold 16px Consolas,monospace';ctx.textAlign='center';ctx.fillText('TSUKUYOMI // THRUST '+(attackIndex+1)+' / '+totalAttacks,W/2,628);
 }else{
  ctx.fillStyle='rgba(8,1,9,'+smooth((n-720)/60)*.40+')';ctx.fillRect(0,32,W,H-64);
 }
 drawClockTitle(n);
 if(n>760){ctx.save();ctx.globalAlpha=smooth((n-760)/40)*.45;ctx.strokeStyle='#f32e5b';ctx.lineWidth=3;for(let i=0;i<6;i++){const x=(i*227+n*1.7)%W;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-70,Math.min(H,240+i*57));ctx.lineTo(x-20,Math.min(H,360+i*49));ctx.stroke();}ctx.restore();}
 if(typeof window.JFF_FIGHTING_HUD!=='undefined'&&window.JFF_FIGHTING_HUD.update)window.JFF_FIGHTING_HUD.update();
 return true;
}
if(typeof previousRender==='function')window.render=function(){
 if(Q.cinema&&Q.cinema.kind==='tsukuyomi'){drawTsukuyomi();return;}
 hideEffectLayers(false);
 return previousRender.apply(this,arguments);
};
window.JFF_ITACHI_RIG_CINEMATICS={ready:true,renderer:'live Canvas 2D fighter rig',tsukuyomi:'live fighters',handSealKeyframes:{fireball:fireballSealKeys.length,breath:breathSealKeys.length}};
console.info('[Itachi Rig] Live-fighter Tsukuyomi and eight Katon hand-seal poses ready.');
})();