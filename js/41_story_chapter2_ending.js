'use strict';
/* Chapter 2 cliffhanger: The Inevitable Intervention. */
(function(){
 if(window.__JFF_CH2_ENDING_V1__)return;
 window.__JFF_CH2_ENDING_V1__=true;
 const oldStep=window.step,oldRender=window.render,oldKey=MenuKey,oldResult=showResult;
 const clamp01=v=>Math.max(0,Math.min(1,v)),mix=(a,b,t)=>a+(b-a)*t;
 const ease=v=>{v=clamp01(v);return v*v*(3-2*v);};
 const beats=[
  {a:0,b:2.5,n:'POV_YUTA',label:'SUKUNA HP : CRITICAL'},
  {a:2.5,b:4,n:'SUKUNA_CLOSE',label:'THE KING OF CURSES SMILES'},
  {a:4,b:8,n:'RCT',label:'REVERSE CURSED TECHNIQUE'},
  {a:8,b:10.3,n:'YUTA_REACT',label:'YUTA REALIZES TOO LATE'},
  {a:10.3,b:14.8,n:'WORLD_SLASH',label:'WORLD-CUTTING SLASH'},
  {a:14.8,b:17.3,n:'GOJO_ARRIVES',label:'LIMITLESS'},
  {a:17.3,b:20.4,n:'INFINITY',label:'INFINITY  /  SPACE IS DENIED'},
  {a:20.4,b:22.3,n:'GOJO_LINE',label:'SATORU GOJO'},
  {a:22.3,b:25,n:'END_CARD',label:'TO BE CONTINUED'}
 ];
 const film=()=>G.ch2EndingCine&&G.ch2EndingCine.active?G.ch2EndingCine:null;
 const isCh2=()=>G.mode==='story'&&G.story&&G.story.chapter===2;
 const phaseAt=t=>{for(let i=beats.length-1;i>=0;i--)if(t>=beats[i].a)return i;return 0;};
 const qAt=(t,i)=>clamp01((t-beats[i].a)/(beats[i].b-beats[i].a));
 const play=n=>{try{if(SFX&&typeof SFX[n]==='function')SFX[n]();}catch(e){}};
 const camera=(x,y,z)=>{cam.x=cam.tx=x;cam.y=cam.ty=y;cam.zoom=cam.tzoom=z;cam.cine=0;};
 function dismissDialog(){const d=document.getElementById('dialogue');if(d)d.classList.remove('on');}
 function unlock3(){try{localStorage.setItem('jff_story_ch2_complete','1');localStorage.setItem('jff_story_unlocked_ch3','1');localStorage.setItem('jff_story_ch2_ending','inevitable_intervention');}catch(e){}try{if(typeof syncStoryArchive==='function')syncStoryArchive();}catch(e){}if(G.story){G.story.ending='cliffhanger';G.story.phase=5;G.story.act=4;G.story.flags=G.story.flags||{};G.story.flags.cliffhanger=true;}}
 function shouldStart(){const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];return !!(isCh2()&&!film()&&!G.ch2StoryboardV4&&!G.ch2CinematicV3&&!G.ch2Cine&&!G.storyCutscene&&!G.story.cutscene&&y&&s&&s.id==='sukuna'&&s.hp<=0&&y.hp>0);}
 function startEnding(){
  if(film()||!isCh2())return false;const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];if(!y||!s)return false;
  dismissDialog();G.ch2StoryboardV4=null;G.ch2CinematicV3=null;G.ch2Cine=null;
  const low=Math.max(1,Math.round(s.maxHp*.025));
  G.ch2EndingCine={active:true,finished:false,t:0,duration:25,beat:-1,sukunaLow:low,sukunaMax:s.maxHp,registered:false,said:false};
  G.matchOver=false;G.matchOverScreen=false;G.winner=null;G.paused=false;G.storyCutscene=true;G.story.cutscene=true;G.roundState='intro';G.roundTimer=999999;
  y.x=950;y.y=GROUND;y.vx=0;y.vy=0;y.facing=1;y.state='BLOCK';y.stateFrame=0;y.storyCinePose='guard';y.storyCineRika=null;y.rikaTimer=0;
  s.x=1320;s.y=GROUND;s.vx=0;s.vy=0;s.facing=-1;s.state='KNOCKDOWN';s.stateFrame=0;s.storyCinePose=null;s.maxHp=G.ch2EndingCine.sukunaMax;s.hp=low;
  camera(1110,440,.91);G.flash=.48;G.flashColor='#eef7ff';G.shake=5;return true;
 }
 function enterBeat(c,i){
  c.beat=i;const y=G.fighters[0],s=G.fighters[1];
  if(i===0){y.state='BLOCK';y.storyCinePose='guard';s.state='KNOCKDOWN';camera(1110,440,.91);}
  else if(i===1){s.state='KNOCKDOWN';camera(s.x,GROUND-105,1.22);}
  else if(i===2){s.state='IDLE';camera(s.x,GROUND-94,1.02);play('awaken');play('heal');}
  else if(i===3){y.state='HITSTUN';y.storyCinePose='hurt';s.state='IDLE';camera(y.x,GROUND-100,1.1);}
  else if(i===4){y.state='BLOCK';y.storyCinePose='guard';s.state='ATTACK';camera(1135,435,.88);play('throwTech');}
  else if(i===5){y.state='BLOCK';s.state='ATTACK';camera(1120,435,.97);play('dash');G.flash=.38;G.flashColor='#dffbff';}
  else if(i===6){camera(1100,435,1.02);play('block');play('clash');G.flash=.65;G.flashColor='#fff';G.shake=14;}
  else if(i===7){camera(1120,435,1);if(!c.said){c.said=true;play('speech');speakLine();}}
  else if(i===8){camera(1100,435,.92);unlock3();c.registered=true;}
 }
 function speakLine(){try{if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance("You're my enemy.");u.lang='en-US';u.rate=.78;u.pitch=.48;u.volume=.86;const vs=window.speechSynthesis.getVoices();const v=vs.find(v=>/^en(-|_)?US/i.test(v.lang)&&/male|david|mark|alex|daniel/i.test(v.name));if(v)u.voice=v;u.onend=()=>{try{if(!film()||G.ch2EndingCine.beat!==7)return;const echo=new SpeechSynthesisUtterance("You're my enemy.");echo.lang='en-US';echo.rate=.92;echo.pitch=.43;echo.volume=.22;if(v)echo.voice=v;window.speechSynthesis.speak(echo);}catch(e){}};window.speechSynthesis.speak(u);}catch(e){}}
 function finishCard(){const c=G.ch2EndingCine;if(!c)return;c.t=25;c.beat=8;c.finished=true;G.matchOver=true;G.matchOverScreen=true;G.roundState='over';G.storyCutscene=true;G.story.cutscene=true;if(!c.registered){unlock3();c.registered=true;}}
 function tick(){
  const c=film();if(!c||c.finished)return;c.t=Math.min(25,c.t+1/60);const i=phaseAt(c.t),q=qAt(c.t,i);if(i!==c.beat)enterBeat(c,i);
  const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];
  if(y&&s){
   y.animT=(y.animT||0)+.7;s.animT=(s.animT||0)+.54;y.stateFrame++;s.stateFrame++;
   if(i===0){camera(1110+Math.sin(c.t*27)*2.3,440+Math.sin(c.t*17)*2,.91+Math.sin(c.t*2)*.012);s.x=1320;s.y=GROUND;s.state='KNOCKDOWN';}
   else if(i===1){camera(1320+Math.sin(c.t*4)*2,GROUND-105,1.22+Math.sin(q*Math.PI)*.03);s.state='KNOCKDOWN';}
   else if(i===2){s.hp=Math.max(1,Math.round(mix(c.sukunaLow,c.sukunaMax*.42,ease(q))));s.state=q>.55?'IDLE':'KNOCKDOWN';camera(1290+Math.sin(c.t*4)*3,GROUND-92,1.02+Math.sin(q*Math.PI)*.035);if(Math.floor(c.t*60)%6===0)try{spark(s.x+rnd(-38,38),GROUND-rnd(75,155),2,'#181c2b',1.5,5,14,0);spark(s.x+rnd(-27,27),GROUND-rnd(75,150),1,'#a8ced7',1,3,12,0);}catch(e){}}
   else if(i===3){y.x=950;y.y=GROUND;y.state='HITSTUN';y.storyCinePose='hurt';s.x=1320;s.state='IDLE';camera(965+Math.sin(c.t*20)*2,GROUND-100,1.1+Math.sin(q*Math.PI)*.03);}
   else if(i===4){y.x=950;y.state='BLOCK';y.storyCinePose='guard';s.x=1320;s.state='ATTACK';camera(1135,435,.88+Math.sin(q*Math.PI)*.025);}
   else if(i===5){y.x=950;s.x=1320;y.state='BLOCK';s.state='ATTACK';camera(1120+Math.sin(q*Math.PI)*4,435,.97+Math.sin(q*Math.PI)*.05);}
   else if(i===6){y.x=950;s.x=1320;y.state='BLOCK';s.state='ATTACK';camera(1100,435,1.02+Math.sin(q*Math.PI)*.025);}
   else if(i===7){camera(1120,435,1+Math.sin(q*Math.PI)*.015);}
   else camera(1100,435,.92);
  }
  if(c.t>=25)finishCard();
 }
 function px(wx){return W/2+(wx-cam.x)*cam.zoom;}
 function py(wy){return H/2+(wy-cam.y)*cam.zoom;}
 function caption(label,color){ctx.save();ctx.globalAlpha=.95;ctx.textAlign='left';ctx.font='800 11px "Segoe UI",sans-serif';ctx.fillStyle=color||'#c9a6ff';ctx.fillText('CHAPTER 2  /  THE INEVITABLE INTERVENTION',27,H-66);ctx.font='900 17px "Segoe UI",sans-serif';ctx.fillStyle='#f5f4fa';ctx.fillText(label,27,H-43);ctx.textAlign='right';ctx.font='600 10px "Segoe UI",sans-serif';ctx.fillStyle='rgba(242,243,252,.72)';ctx.fillText('ENTER / SPACE  ·  SKIP',W-27,H-43);ctx.restore();}
 function drawBars(c,t){
  const pct=clamp01((c.sukunaLow+(c.sukunaMax*.42-c.sukunaLow)*ease(clamp01((t-4)/4)))/c.sukunaMax),blink=.68+Math.sin(t*19)*.32;
  ctx.save();ctx.fillStyle='rgba(3,5,9,.86)';ctx.fillRect(W-330,48,300,45);ctx.strokeStyle='rgba(235,231,244,.35)';ctx.strokeRect(W-330,48,300,45);ctx.textAlign='left';ctx.font='900 11px "Segoe UI",sans-serif';ctx.fillStyle='#f4edf2';ctx.fillText('SUKUNA  /  RCT',W-318,65);ctx.fillStyle='#291119';ctx.fillRect(W-318,73,276,11);ctx.fillStyle='#ff263f';ctx.globalAlpha=blink;ctx.fillRect(W-318,73,276*pct,11);ctx.globalAlpha=1;if(t<4.2){ctx.globalAlpha=blink;ctx.textAlign='right';ctx.fillStyle='#ff3c50';ctx.font='900 12px "Segoe UI",sans-serif';ctx.fillText('CRITICAL',W-37,65);}ctx.restore();
 }
 function drawSukunaClose(t){
  ctx.save();ctx.fillStyle='#07090e';ctx.fillRect(0,0,W,H);const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#27232a');bg.addColorStop(.5,'#171720');bg.addColorStop(1,'#06080d');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#c5a39a';ctx.beginPath();ctx.moveTo(W*.25,H*.13);ctx.lineTo(W*.72,H*.12);ctx.lineTo(W*.79,H*.42);ctx.lineTo(W*.63,H*.73);ctx.lineTo(W*.39,H*.76);ctx.lineTo(W*.22,H*.48);ctx.closePath();ctx.fill();
  ctx.fillStyle='#20151b';ctx.beginPath();ctx.moveTo(W*.21,H*.22);ctx.lineTo(W*.32,H*.12);ctx.lineTo(W*.45,H*.18);ctx.lineTo(W*.60,H*.11);ctx.lineTo(W*.77,H*.22);ctx.lineTo(W*.72,H*.33);ctx.lineTo(W*.55,H*.29);ctx.lineTo(W*.38,H*.32);ctx.lineTo(W*.26,H*.35);ctx.closePath();ctx.fill();
  ctx.fillStyle='#2a1219';ctx.beginPath();ctx.moveTo(W*.29,H*.36);ctx.lineTo(W*.46,H*.32);ctx.lineTo(W*.49,H*.35);ctx.lineTo(W*.31,H*.4);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(W*.54,H*.34);ctx.lineTo(W*.70,H*.32);ctx.lineTo(W*.68,H*.39);ctx.lineTo(W*.55,H*.38);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f0e0d7';ctx.beginPath();ctx.ellipse(W*.38,H*.38,W*.06,H*.028,-.06,0,Math.PI*2);ctx.ellipse(W*.62,H*.38,W*.055,H*.026,.04,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d8e8ec';ctx.beginPath();ctx.arc(W*.39,H*.382,9,0,Math.PI*2);ctx.arc(W*.61,H*.382,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#100b11';ctx.beginPath();ctx.arc(W*.395,H*.382,4,0,Math.PI*2);ctx.arc(W*.615,H*.382,4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#6b2533';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(W*.31,H*.29);ctx.lineTo(W*.35,H*.49);ctx.moveTo(W*.69,H*.27);ctx.lineTo(W*.66,H*.49);ctx.moveTo(W*.43,H*.47);ctx.lineTo(W*.46,H*.54);ctx.moveTo(W*.55,H*.47);ctx.lineTo(W*.52,H*.54);ctx.stroke();
  ctx.fillStyle='#170b11';ctx.beginPath();ctx.moveTo(W*.37,H*.57);ctx.quadraticCurveTo(W*.52,H*.62,W*.66,H*.56);ctx.lineTo(W*.61,H*.63);ctx.quadraticCurveTo(W*.51,H*.66,W*.42,H*.63);ctx.closePath();ctx.fill();ctx.strokeStyle='#eee4df';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*.41,H*.60);ctx.lineTo(W*.61,H*.59);ctx.stroke();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.22+Math.sin(t*16)*.08;ctx.strokeStyle='#bd1d32';ctx.lineWidth=3;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(W*(.16+k*.16),H*.18);ctx.lineTo(W*(.23+k*.15),H*.77);ctx.stroke();}ctx.restore();ctx.textAlign='left';ctx.font='900 11px "Segoe UI",sans-serif';ctx.fillStyle='#ff6274';ctx.fillText('POV 2  /  SUKUNA',36,H-52);ctx.restore();
 }
 function drawYutaClose(t){
  ctx.save();ctx.fillStyle='#070a10';ctx.fillRect(0,0,W,H);const g=ctx.createRadialGradient(W*.35,H*.45,5,W*.35,H*.45,500);g.addColorStop(0,'#33333e');g.addColorStop(1,'#080a10');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#e1d0c9';ctx.beginPath();ctx.moveTo(W*.11,H*.20);ctx.lineTo(W*.48,H*.18);ctx.lineTo(W*.58,H*.51);ctx.lineTo(W*.45,H*.75);ctx.lineTo(W*.17,H*.68);ctx.closePath();ctx.fill();ctx.fillStyle='#111722';ctx.beginPath();ctx.moveTo(W*.08,H*.16);ctx.lineTo(W*.21,H*.06);ctx.lineTo(W*.28,H*.16);ctx.lineTo(W*.36,H*.05);ctx.lineTo(W*.43,H*.15);ctx.lineTo(W*.54,H*.12);ctx.lineTo(W*.49,H*.27);ctx.lineTo(W*.26,H*.25);ctx.lineTo(W*.18,H*.32);ctx.closePath();ctx.fill();
  ctx.fillStyle='#141018';ctx.beginPath();ctx.moveTo(W*.17,H*.37);ctx.quadraticCurveTo(W*.30,H*.27,W*.47,H*.37);ctx.quadraticCurveTo(W*.32,H*.44,W*.17,H*.37);ctx.fill();ctx.fillStyle='#f4f2f1';ctx.beginPath();ctx.ellipse(W*.32,H*.37,W*.12,H*.045,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a9e4eb';ctx.beginPath();ctx.arc(W*.33,H*.37,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#080d15';ctx.beginPath();ctx.arc(W*.34,H*.37,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#13131c';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(W*.14,H*.34);ctx.quadraticCurveTo(W*.31,H*.28,W*.48,H*.34);ctx.stroke();
  ctx.save();ctx.globalAlpha=.35+Math.sin(t*22)*.12;ctx.strokeStyle='#a8bbc5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*.59,H*.2);ctx.lineTo(W*.72,H*.68);ctx.moveTo(W*.68,H*.2);ctx.lineTo(W*.80,H*.65);ctx.stroke();ctx.restore();ctx.textAlign='left';ctx.font='900 11px "Segoe UI",sans-serif';ctx.fillStyle='#c9a6ff';ctx.fillText('POV 1  /  YUTA',36,H-52);ctx.restore();
 }
 function drawGojo(x,y,sc,raised,glow){
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);
  ctx.globalAlpha=.35;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(0,0,55,10,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle='#10131a';ctx.beginPath();ctx.moveTo(-25,-156);ctx.lineTo(26,-156);ctx.lineTo(44,-85);ctx.lineTo(36,-26);ctx.lineTo(28,-7);ctx.lineTo(5,-7);ctx.lineTo(1,-70);ctx.lineTo(-5,-7);ctx.lineTo(-29,-7);ctx.lineTo(-40,-77);ctx.closePath();ctx.fill();
  ctx.fillStyle='#232a36';ctx.beginPath();ctx.moveTo(-28,-154);ctx.lineTo(-8,-139);ctx.lineTo(-2,-93);ctx.lineTo(-18,-62);ctx.lineTo(-35,-83);ctx.closePath();ctx.fill();
  ctx.fillStyle='#090c12';ctx.beginPath();ctx.moveTo(-29,-162);ctx.lineTo(-42,-124);ctx.lineTo(-34,-93);ctx.lineTo(-15,-129);ctx.lineTo(5,-105);ctx.lineTo(30,-133);ctx.lineTo(41,-103);ctx.lineTo(42,-143);ctx.lineTo(25,-164);ctx.closePath();ctx.fill();
  ctx.fillStyle='#e2d4d1';ctx.fillRect(-12,-185,24,29);ctx.fillStyle='#e9dcd8';ctx.beginPath();ctx.moveTo(-24,-221);ctx.lineTo(-18,-245);ctx.lineTo(0,-253);ctx.lineTo(20,-244);ctx.lineTo(26,-218);ctx.lineTo(20,-189);ctx.lineTo(4,-177);ctx.lineTo(-17,-189);ctx.closePath();ctx.fill();
  ctx.fillStyle='#06080d';ctx.beginPath();ctx.moveTo(-27,-222);ctx.lineTo(28,-221);ctx.lineTo(25,-203);ctx.lineTo(-26,-204);ctx.closePath();ctx.fill();ctx.strokeStyle=glow?'#8ae9ff':'rgba(118,210,240,.35)';ctx.lineWidth=glow?2.8:1.2;ctx.beginPath();ctx.moveTo(-20,-202);ctx.lineTo(20,-202);ctx.stroke();
  ctx.fillStyle='#e7edf1';ctx.beginPath();ctx.moveTo(-26,-225);ctx.lineTo(-48,-254);ctx.lineTo(-22,-244);ctx.lineTo(-25,-280);ctx.lineTo(-4,-252);ctx.lineTo(8,-287);ctx.lineTo(16,-252);ctx.lineTo(43,-273);ctx.lineTo(32,-242);ctx.lineTo(47,-229);ctx.lineTo(21,-232);ctx.lineTo(0,-241);ctx.lineTo(-17,-232);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-22,-238);ctx.lineTo(-25,-268);ctx.moveTo(8,-245);ctx.lineTo(9,-272);ctx.moveTo(28,-239);ctx.lineTo(38,-260);ctx.stroke();
  ctx.fillStyle='#080b11';ctx.beginPath();ctx.moveTo(-25,-161);ctx.lineTo(-17,-185);ctx.lineTo(-1,-169);ctx.lineTo(17,-186);ctx.lineTo(27,-159);ctx.lineTo(17,-134);ctx.lineTo(-17,-134);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#141821';ctx.lineWidth=15;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(28,-148);ctx.quadraticCurveTo(49,-169,53,-199);ctx.stroke();ctx.strokeStyle='#dfcfcc';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(53,-199);ctx.lineTo(52,-219);ctx.stroke();
  ctx.fillStyle='#e7d8d4';if(raised){ctx.beginPath();ctx.moveTo(38,-220);ctx.lineTo(36,-247);ctx.quadraticCurveTo(38,-254,44,-250);ctx.lineTo(49,-230);ctx.lineTo(51,-263);ctx.quadraticCurveTo(55,-270,60,-261);ctx.lineTo(60,-231);ctx.lineTo(65,-256);ctx.quadraticCurveTo(70,-262,73,-252);ctx.lineTo(71,-227);ctx.lineTo(79,-242);ctx.quadraticCurveTo(85,-244,84,-233);ctx.lineTo(74,-207);ctx.quadraticCurveTo(59,-194,44,-207);ctx.closePath();ctx.fill();}else{ctx.beginPath();ctx.ellipse(53,-222,10,15,0,0,Math.PI*2);ctx.fill();}
  if(glow){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.8;ctx.strokeStyle='#8cefff';ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(59,-224,35+Math.sin(G.ch2EndingCine.t*19)*3,41,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  ctx.restore();
 }
 function drawSlash(t,q){
  const xx=mix(W*1.05,W*.44,ease(q));ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='square';
  ctx.globalAlpha=.86;ctx.strokeStyle='#101a24';ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(xx+80,H*.25);ctx.lineTo(xx-80,H*.72);ctx.stroke();ctx.strokeStyle='#0a121b';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(xx+90,H*.22);ctx.lineTo(xx-91,H*.73);ctx.stroke();ctx.strokeStyle='#8cbec8';ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(xx+84,H*.24);ctx.lineTo(xx-84,H*.71);ctx.stroke();ctx.strokeStyle='rgba(202,246,255,.92)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(xx+77,H*.24);ctx.lineTo(xx-77,H*.70);ctx.stroke();
  for(let k=0;k<9;k++){const yy=H*(.22+k*.064),shift=Math.sin(t*48+k*1.8)*22;ctx.globalAlpha=.2+(k%3)*.08;ctx.strokeStyle=k%2?'#76b7c9':'#e5faff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(xx-120+shift,yy);ctx.lineTo(xx+104+shift,yy-3);ctx.stroke();}ctx.restore();
  if(q>.14&&q<.94){const y=G.fighters&&G.fighters[0],hx=y?px(y.x):W*.35,hy=y?py(GROUND-85):H*.55;ctx.save();ctx.globalAlpha=.78;ctx.strokeStyle='#9edce9';ctx.lineWidth=1.4;const r=48+Math.sin(t*18)*3;ctx.beginPath();ctx.arc(hx,hy,r,0,Math.PI*2);ctx.moveTo(hx-r-13,hy);ctx.lineTo(hx-r+5,hy);ctx.moveTo(hx+r-5,hy);ctx.lineTo(hx+r+13,hy);ctx.moveTo(hx,hy-r-13);ctx.lineTo(hx,hy-r+5);ctx.moveTo(hx,hy+r-5);ctx.lineTo(hx,hy+r+13);ctx.stroke();ctx.font='800 10px "Segoe UI",sans-serif';ctx.fillStyle='#bceaf2';ctx.textAlign='center';ctx.fillText('TARGET LOCK',hx,hy-r-11);ctx.restore();}
 }
 function drawInfinity(t,q){
  const gx=W*.52,gy=H*.51;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(10,16,25,.96)';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(W*.86,H*.23);ctx.lineTo(W*.58,H*.65);ctx.stroke();ctx.strokeStyle='rgba(144,221,238,.85)';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(W*.86,H*.23);ctx.lineTo(W*.58,H*.65);ctx.stroke();
  for(let k=0;k<5;k++){const r=33+k*18+Math.sin(t*14+k)*3;ctx.globalAlpha=.66-k*.09;ctx.strokeStyle=k%2?'#91deec':'#e9fdff';ctx.lineWidth=k===0?3:1.5;ctx.beginPath();ctx.ellipse(gx,gy,r*1.2,r,t*.08+k*.23,0,Math.PI*2);ctx.stroke();}
  ctx.globalAlpha=.60+Math.sin(t*26)*.25;ctx.fillStyle='#d7fbff';ctx.beginPath();ctx.arc(gx,gy,5+Math.sin(t*23)*2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.45;ctx.strokeStyle='#a7e5ef';ctx.lineWidth=1;
  for(let k=0;k<8;k++){const yy=H*(.27+k*.066);ctx.beginPath();ctx.moveTo(W*.84,yy);ctx.quadraticCurveTo(W*.70,yy+20,gx+40,gy+(k-3.5)*12);ctx.stroke();}ctx.restore();
 }
 function drawFinalCard(t){
  ctx.fillStyle='#020307';ctx.fillRect(0,0,W,H);const flicker=.78+Math.sin(t*53)*.08;ctx.save();ctx.globalAlpha=.38*flicker;ctx.fillStyle='#ff2446';ctx.fillRect(0,H*.47,W,2);ctx.fillStyle='#3de6f5';ctx.fillRect(0,H*.55,W,1);ctx.restore();
  ctx.save();ctx.textAlign='center';ctx.font='900 36px Impact,"Segoe UI",sans-serif';ctx.globalAlpha=.35;ctx.fillStyle='#ff3557';ctx.fillText('TO BE CONTINUED',W/2-3,H*.48);ctx.fillStyle='#42e7f4';ctx.fillText('TO BE CONTINUED',W/2+3,H*.48);ctx.globalAlpha=1;ctx.fillStyle='#f6f5f9';ctx.fillText('TO BE CONTINUED.',W/2,H*.48+2);ctx.font='800 14px "Segoe UI",sans-serif';ctx.fillStyle='rgba(238,239,245,.78)';ctx.fillText('WAIT FOR CHAPTER 3.',W/2,H*.57);ctx.globalAlpha=.62;ctx.font='600 10px "Segoe UI",sans-serif';ctx.fillText('CHAPTER 2 COMPLETE  ·  CHAPTER 3 UNLOCKED',W/2,H*.66);ctx.globalAlpha=.5;ctx.fillText('ENTER / SPACE  ·  STORY ARCHIVE',W/2,H*.86);ctx.restore();
 }
 function overlay(){
  const c=film();if(!c||G.mode!=='story')return;const t=c.t,i=c.beat>=0?c.beat:phaseAt(t),q=qAt(t,i),n=beats[i].n;
  ctx.save();ctx.fillStyle='rgba(1,3,8,.96)';ctx.fillRect(0,0,W,38);ctx.fillRect(0,H-38,W,38);
  const vg=ctx.createRadialGradient(W/2,H/2,140,W/2,H/2,780);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.47)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  if(n==='POV_YUTA'){
   ctx.save();ctx.globalAlpha=.14+Math.sin(t*17)*.05;ctx.strokeStyle='#d9e3eb';ctx.lineWidth=1;for(let k=0;k<9;k++){ctx.beginPath();ctx.moveTo(W*.47,H*.38);ctx.lineTo(k*165,H*.88);ctx.stroke();}ctx.restore();drawBars(c,t);ctx.save();ctx.textAlign='left';ctx.font='800 11px "Segoe UI",sans-serif';ctx.fillStyle='#d8dbe7';ctx.fillText('POV 1  /  YUTA · EXHAUSTED',28,H-55);ctx.restore();
  }else if(n==='SUKUNA_CLOSE'){ctx.restore();drawSukunaClose(t);drawBars(c,t);return;}
  else if(n==='RCT'){drawBars(c,t);const s=G.fighters&&G.fighters[1],sx=s?px(s.x):W*.6,sy=s?py(GROUND-95):H*.52;ctx.save();ctx.globalCompositeOperation='lighter';const aura=ctx.createRadialGradient(sx,sy,5,sx,sy,180);aura.addColorStop(0,'rgba(15,20,32,.96)');aura.addColorStop(.33,'rgba(36,22,43,.62)');aura.addColorStop(.62,'rgba(117,14,33,.28)');aura.addColorStop(1,'rgba(130,0,20,0)');ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(sx,sy,80+q*24,120+q*20,0,0,Math.PI*2);ctx.fill();for(let k=0;k<5;k++){const r=42+k*20+Math.sin(t*9+k)*5;ctx.globalAlpha=.26;ctx.strokeStyle=k%2?'#b81e37':'#a8a8b8';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sx,sy,r,r*1.25,t*.12+k,0,Math.PI*2);ctx.stroke();}ctx.restore();ctx.save();ctx.textAlign='left';ctx.font='900 11px "Segoe UI",sans-serif';ctx.fillStyle='#e5dce5';ctx.fillText('REVERSE CURSED TECHNIQUE',28,H-55);ctx.restore();}
  else if(n==='YUTA_REACT'){ctx.restore();drawYutaClose(t);return;}
  else if(n==='WORLD_SLASH'){drawSlash(t,q);drawBars(c,t);ctx.save();ctx.textAlign='left';ctx.font='900 12px "Segoe UI",sans-serif';ctx.fillStyle='#b9edf5';ctx.fillText('POV 2  /  SUKUNA · TARGET LOCK',28,H-55);ctx.restore();if(q>.48&&q<.72){ctx.save();ctx.globalAlpha=.25;ctx.fillStyle='#d8f9ff';ctx.fillRect(0,0,W,H);ctx.restore();}}
  else if(n==='GOJO_ARRIVES'){drawSlash(t,1);const a=ease(q),gx=mix(W*1.17,W*.51,a);ctx.save();ctx.globalAlpha=a;ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(151,239,255,.8)';ctx.lineWidth=2;for(let k=0;k<7;k++){ctx.beginPath();ctx.moveTo(gx-140-k*14,H*(.25+k*.055));ctx.lineTo(gx+36,H*.53+k*7);ctx.stroke();}ctx.restore();drawGojo(gx,H*.91,1.02,true,true);if(q>.42){ctx.save();ctx.globalAlpha=.5;ctx.fillStyle='#c7f7ff';ctx.fillRect(0,0,W,H);ctx.restore();}}
  else if(n==='INFINITY'){drawGojo(W*.51,H*.91,1.02,true,true);drawInfinity(t,q);ctx.save();ctx.globalAlpha=.82;ctx.fillStyle='#d9fbff';ctx.font='900 12px "Segoe UI",sans-serif';ctx.textAlign='left';ctx.fillText('LIMITLESS  /  INFINITY SHIELD',28,H-55);ctx.restore();}
  else if(n==='GOJO_LINE'){
   drawGojo(W*.44,H*.91,1.05,true,true);ctx.save();ctx.fillStyle='rgba(3,6,12,.93)';ctx.fillRect(W*.62,H*.13,W*.32,H*.23);ctx.strokeStyle='rgba(181,239,255,.7)';ctx.lineWidth=1.4;ctx.strokeRect(W*.62,H*.13,W*.32,H*.23);ctx.fillStyle='#e8deda';ctx.beginPath();ctx.moveTo(W*.65,H*.19);ctx.lineTo(W*.88,H*.18);ctx.lineTo(W*.91,H*.30);ctx.lineTo(W*.67,H*.32);ctx.closePath();ctx.fill();ctx.fillStyle='#050911';ctx.fillRect(W*.65,H*.23,W*.25,H*.045);ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#8be8ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(W*.69,H*.255);ctx.lineTo(W*.86,H*.255);ctx.stroke();ctx.restore();ctx.fillStyle='#e9faff';ctx.font='900 11px "Segoe UI",sans-serif';ctx.textAlign='left';ctx.fillText('POV 2  /  GOJO SATORU',W*.64,H*.39);ctx.restore();
   ctx.save();ctx.fillStyle='#f7f7fa';ctx.strokeStyle='#0a0c12';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(W*.56,H*.23);ctx.quadraticCurveTo(W*.55,H*.18,W*.61,H*.18);ctx.lineTo(W*.92,H*.18);ctx.quadraticCurveTo(W*.95,H*.18,W*.95,H*.23);ctx.lineTo(W*.95,H*.37);ctx.quadraticCurveTo(W*.95,H*.41,W*.91,H*.41);ctx.lineTo(W*.69,H*.41);ctx.lineTo(W*.64,H*.46);ctx.lineTo(W*.65,H*.41);ctx.lineTo(W*.59,H*.41);ctx.quadraticCurveTo(W*.56,H*.41,W*.56,H*.37);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#10131a';ctx.textAlign='center';ctx.font='900 20px Impact,"Segoe UI",sans-serif';ctx.fillText("You're my enemy.",W*.75,H*.31);ctx.restore();}
  else if(n==='END_CARD'){ctx.restore();drawFinalCard(t);return;}
  caption(beats[i].label,n==='RCT'?'#ad263b':(n==='GOJO_LINE'?'#94e9ff':'#c9a6ff'));
  if(n==='GOJO_ARRIVES'&&q>.66){ctx.save();ctx.globalAlpha=clamp01((q-.66)*3);ctx.fillStyle='#ecfbff';ctx.fillRect(0,0,W,H);ctx.restore();}
  ctx.restore();
 }
 function leave(){
  try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(e){}
  G.ch2EndingCine=null;G.ch2StoryboardV4=null;G.ch2CinematicV3=null;G.storyCutscene=false;G.story=null;G.fighters=[];G.mode='menu';G.matchOver=false;G.matchOverScreen=false;G.winner=null;G.paused=false;G.roundState='intro';dismissDialog();showScreen('storySelect');
 }
 if(typeof oldResult==='function')showResult=function(){
  if(film())return;
  const y=G.fighters&&G.fighters[0],s=G.fighters&&G.fighters[1];
  if(isCh2()&&!G.storyCutscene&&!G.story.cutscene&&s&&s.hp<=0&&y&&y.hp>0){startEnding();return;}
  oldResult.apply(this,arguments);
 };
 if(typeof oldStep==='function')window.step=function(){
  if(film()){tick();return;}
  oldStep.apply(this,arguments);if(shouldStart())startEnding();
 };
 if(typeof oldRender==='function')window.render=function(){oldRender.apply(this,arguments);if(film())overlay();};
 MenuKey=function(code){
  const c=G.ch2EndingCine;
  if(c&&c.active){
   if(c.finished&&(code==='Enter'||code==='Space'||code==='Escape')){leave();return;}
   if(c.finished&&code==='KeyR'){G.ch2EndingCine=null;startStoryChapter2();return;}
   if(!c.finished&&(code==='Enter'||code==='Space'||code==='Escape')){finishCard();return;}
   return;
  }
  oldKey.apply(this,arguments);
 };
 window.JFF_CH2_ENDING={version:1,get active(){return !!film();},get elapsed(){return film()?film().t:0;},start:startEnding};
 console.info('[JFF Story Chapter 2] Inevitable Intervention ending ready.');
})();