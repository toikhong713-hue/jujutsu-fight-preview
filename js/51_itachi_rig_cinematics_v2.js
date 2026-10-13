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
const sealKeys=[
 [-5,43,-37,134,-104,-58,-112,-96],
 [-9,27,-53,153,-128,-56,-110,-94],
 [-1,59,-78,123,-84,-58,-114,-98],
 [4,37,17,145,-88,-57,-112,-95],
 [-8,21,-34,161,-140,-56,-110,-97],
 [2,64,-105,115,-65,-58,-115,-99],
 [-5,34,-15,148,-112,-57,-111,-95],
 [-10,24,-72,155,-82,-55,-109,-94]
];
function applyPose(P,f){
 if(!P||!f)return;
 const n=f.moveFrame||0,key=f.itachiCinemaPose;
 if(f.id==='itachi'&&(f.moveKey==='s1'||f.itachiPoseKey==='s1')&&n<180&&!Q.cinema){
  const u=clamp(n/180*sealKeys.length,0,sealKeys.length-.0001),i=Math.floor(u),t=smooth(u-i),a=sealKeys[i],b=sealKeys[Math.min(i+1,sealKeys.length-1)];
  P.lean=lerp(a[0],b[0],t);P.armF=[lerp(a[1],b[1],t),lerp(a[2],b[2],t)];P.armB=[lerp(a[3],b[3],t),lerp(a[4],b[4],t)];
  P.hipY=lerp(a[5],b[5],t);P.headY=lerp(a[6],b[6],t);P.shY=lerp(a[7],b[7],t);
  const sway=Math.sin(n*.13)*.8;P.legF=[88+sway,5];P.legB=[94-sway,-5];
  return;
 }
 if(key==='bound'){
  P.lean=0;P.hipY=-50;P.shY=-96;P.headY=-113;P.headX=0;
  P.armF=[0,0];P.armB=[180,0];P.legF=[72,25];P.legB=[108,-17];
 }else if(key==='tsukuyomi-owner'){
  const frame=Q.cinema?Q.cinema.frame:0,phase=Math.floor(Math.max(0,frame-96)/42)%3;
  P.hipY=-57;P.shY=-96;P.headY=-114;
  if(frame<36){P.lean=-6;P.armF=[35,-36];P.armB=[140,-36];}
  else if(phase===0){P.lean=-10;P.armF=[32,-72];P.armB=[140,-26];}
  else if(phase===1){P.lean=12;P.armF=[20,50];P.armB=[150,28];}
  else{P.lean=-4;P.armF=[12,-56];P.armB=[160,-36];}
  P.legF=[82,8];P.legB=[100,-8];
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
function drawSwordFlashes(x,y,n){
 if(n<100||n>=378)return;
 const q=(n-100)%42,amount=q<7?(1-q/7):0;
 ctx.save();ctx.globalCompositeOperation='screen';ctx.lineCap='round';
 if(amount>0){
  const cx=x-25,cy=y-112;
  for(let i=0;i<3;i++){
   ctx.globalAlpha=amount*(i===0?.88:.28);ctx.strokeStyle=i===0?'#fff0f2':'#f02f5b';ctx.lineWidth=i===0?2.4:7-i*2;
   ctx.beginPath();ctx.moveTo(cx-92+i*12,cy-62+i*8);ctx.lineTo(cx+90-i*8,cy+50-i*6);ctx.stroke();
  }
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
 const ox=n<106?lerp(385,520,smooth(n/106)):(n<372?548+Math.sin(n*.11)*5:430);
 const oy=510,tx=835,ty=510;
 // Actor and prop layers use the same temporary camera transform, while the arena remains fixed.
 const zoom=n<36?1.24:(n<106?1.05:1);
 const focusX=n<36?ox:(n<106?530:640),focusY=n<36?407:405;
 ctx.save();ctx.translate(W/2,H/2);ctx.scale(zoom,zoom);ctx.translate(-focusX,-focusY);
 drawCross(tx,ty,n);
 const ownerSave={x:owner.x,y:owner.y,facing:owner.facing,pose:owner.itachiCinemaPose,poseKey:owner.itachiPoseKey,animT:owner.animT};
 const targetSave={x:target.x,y:target.y,facing:target.facing,pose:target.itachiCinemaPose,animT:target.animT};
 owner.x=ox;owner.y=oy;owner.facing=1;owner.itachiCinemaPose='tsukuyomi-owner';owner.itachiPoseKey='s2';owner.animT=(owner.animT||0)+.4;
 target.x=tx;target.y=ty;target.facing=-1;target.itachiCinemaPose='bound';target.animT=(target.animT||0)+.08;
 // Live fighters are drawn from the game's native character rig, not a replacement silhouette.
 if(typeof window.drawFighter==='function'){window.drawFighter(owner);window.drawFighter(target);}
 drawRestraints(tx,ty,n);
 drawSwordFlashes(ox,oy,n);
 // Restore simulation coordinates immediately after rendering the shot.
 owner.x=ownerSave.x;owner.y=ownerSave.y;owner.facing=ownerSave.facing;owner.itachiCinemaPose=ownerSave.pose;owner.itachiPoseKey=ownerSave.poseKey;owner.animT=ownerSave.animT;
 target.x=targetSave.x;target.y=targetSave.y;target.facing=targetSave.facing;target.itachiCinemaPose=targetSave.pose;target.animT=targetSave.animT;
 ctx.restore();
 // POV framing and low-cost image distortion give the illusion of editing without replacing either fighter.
 if(n<36){
  const a=.16+Math.sin(n*.25)*.08;ctx.fillStyle='rgba(235,24,67,'+a+')';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,92,124,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(410,334,106+n*.45,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#ff9db2';ctx.font='bold 18px Consolas,monospace';ctx.textAlign='center';ctx.fillText('EYE CONTACT',W/2,595);
 }else if(n>=36&&n<106){
  ctx.fillStyle='rgba(90,2,24,.10)';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ff8da7';ctx.font='bold 17px Consolas,monospace';ctx.textAlign='center';ctx.fillText('THE WORLD IS MINE',W/2,610);
 }else if(n>=106&&n<372){
  if(n%42<7){ctx.fillStyle='rgba(255,222,232,'+(0.10+(n%42)*.035)+')';ctx.fillRect(0,0,W,H);}
  ctx.fillStyle='#ff9fb3';ctx.font='bold 16px Consolas,monospace';ctx.textAlign='center';ctx.fillText('POV '+(Math.floor((n-106)/42)%3+1)+' // TSUKUYOMI',W/2,610);
 }
 drawClockTitle(n);
 // Edge tears become more visible near the end of the illusion.
 if(n>420){ctx.save();ctx.globalAlpha=smooth((n-420)/40)*.45;ctx.strokeStyle='#f32e5b';ctx.lineWidth=3;for(let i=0;i<6;i++){const x=(i*227+n*1.7)%W;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-70,Math.min(H,240+i*57));ctx.lineTo(x-20,Math.min(H,360+i*49));ctx.stroke();}ctx.restore();}
 if(typeof window.JFF_FIGHTING_HUD!=='undefined'&&window.JFF_FIGHTING_HUD.update)window.JFF_FIGHTING_HUD.update();
 return true;
}
if(typeof previousRender==='function')window.render=function(){
 if(Q.cinema&&Q.cinema.kind==='tsukuyomi'){drawTsukuyomi();return;}
 hideEffectLayers(false);
 return previousRender.apply(this,arguments);
};
window.JFF_ITACHI_RIG_CINEMATICS={ready:true,renderer:'live Canvas 2D fighter rig',tsukuyomi:'live fighters',handSealKeyframes:sealKeys.length};
console.info('[Itachi Rig] Live-fighter Tsukuyomi and eight Katon hand-seal poses ready.');
})();