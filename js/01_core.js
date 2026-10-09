'use strict';
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const rint=(a,b)=>Math.floor(rnd(a,b+1));
const sign=v=>v<0?-1:(v>0?1:0);
const aabb=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const D2R=Math.PI/180;
function joint(p,ang,len){const a=ang*D2R;return{x:p.x+Math.cos(a)*len,y:p.y+Math.sin(a)*len};}
/* ===== AUDIO ===== */
const SFX={
  ctx:null,master:null,on:true,
  init(){if(this.ctx)return;try{const AC=window.AudioContext||window.webkitAudioContext;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=0.4;this.master.connect(this.ctx.destination);}catch(e){this.on=false;}},
  tone(f,dur,type,vol,slideTo){if(!this.on||!this.ctx)return;const t=this.ctx.currentTime;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slideTo)o.frequency.exponentialRampToValueAtTime(Math.max(18,slideTo),t+dur);g.gain.setValueAtTime(vol||0.07,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+0.02);},
  noise(dur,vol,freq,q){if(!this.on||!this.ctx)return;const t=this.ctx.currentTime;const len=Math.max(1,Math.floor(this.ctx.sampleRate*dur));const buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const src=this.ctx.createBufferSource();src.buffer=buf;const f=this.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=freq||900;f.Q.value=q||1;const g=this.ctx.createGain();g.gain.value=vol||0.1;src.connect(f);f.connect(g);g.connect(this.master);src.start(t);},
  light(){this.tone(540,0.05,'square',0.045,320);this.noise(0.05,0.05,1800);},
  heavy(){this.tone(160,0.12,'sawtooth',0.07,60);this.noise(0.11,0.11,700);},
  hit(p){this.noise(0.09,0.10+p*0.12,500+p*900);this.tone(90+p*60,0.08,'square',0.06,40);},
  block(){this.noise(0.06,0.08,2600,3);this.tone(880,0.05,'square',0.03,600);},
  grab(){this.tone(190,0.12,'square',0.08,70);this.noise(0.10,0.08,700,2.5);},
  throwTech(){this.tone(900,0.12,'triangle',0.09,1700);this.noise(0.10,0.08,3200,3);},
  burst(){this.tone(70,0.28,'sawtooth',0.13,420);this.noise(0.24,0.13,1300,1.5);this.tone(920,0.18,'square',0.08,420);},
  guardCancel(){this.tone(420,0.15,'square',0.09,1100);this.noise(0.12,0.08,2400,3);},
  roll(){this.noise(0.12,0.05,1800,2);this.tone(260,0.16,'triangle',0.06,520);},
  parry(){this.tone(1500,0.10,'triangle',0.09,2400);this.noise(0.07,0.06,4000,4);},
  skill(){this.tone(300,0.22,'sawtooth',0.07,900);},
  blue(){this.tone(180,0.5,'sine',0.07,420);this.noise(0.4,0.05,300);},
  red(){this.tone(90,0.5,'sawtooth',0.1,700);this.noise(0.35,0.12,600);},
  purple(){this.tone(70,1.0,'sawtooth',0.12,1200);this.noise(0.9,0.14,420);},
  domain(){this.tone(55,1.6,'sine',0.13,180);this.tone(220,1.6,'triangle',0.06,660);},
  clash(){this.tone(45,2.0,'sawtooth',0.14,90);this.tone(320,1.8,'triangle',0.08,1400);this.noise(1.4,0.14,900,1.2);},
  blackflash(){this.tone(1200,0.14,'square',0.1,120);this.noise(0.2,0.2,300);},
  ko(){this.tone(140,0.7,'sawtooth',0.12,50);},
  ui(){this.tone(760,0.05,'square',0.04);},
  dash(){this.noise(0.10,0.06,1400,2);},
  speech(){this.tone(280,0.32,'triangle',0.09,180);this.tone(560,0.28,'sine',0.05,320);this.noise(0.22,0.06,1800,3);},
  rika(){this.tone(120,0.6,'sawtooth',0.10,320);this.tone(420,0.5,'triangle',0.07,180);this.noise(0.5,0.09,700);},
  copy(){this.tone(820,0.4,'sine',0.07,1400);this.noise(0.35,0.06,2400,3);},
  sky(){this.tone(180,0.5,'sine',0.08,680);this.noise(0.42,0.07,500);},
  heal(){this.tone(660,0.5,'sine',0.09,990);this.tone(440,0.55,'triangle',0.05,880);},
  awaken(){this.tone(90,1.2,'sawtooth',0.12,180);this.tone(400,1.1,'triangle',0.07,900);this.noise(0.9,0.10,600);},
  transform(){this.tone(220,0.6,'sawtooth',0.10,80);this.tone(880,0.5,'triangle',0.06,220);this.noise(0.5,0.10,800);},
  fugaRelease(){this.tone(120,0.6,'sawtooth',0.13,60);this.noise(0.5,0.13,500);},
  fugaPillar(){this.tone(55,1.4,'sawtooth',0.14,40);this.tone(180,1.2,'triangle',0.09,90);this.noise(1.1,0.13,350,1.2);},
  beamCharge(){this.tone(180,0.7,'sine',0.10,700);this.tone(400,0.65,'triangle',0.05,1200);this.noise(0.5,0.08,900,1.5);},
  beamFire(){this.tone(90,0.8,'sawtooth',0.14,900);this.noise(0.7,0.14,700,1.2);this.tone(1400,0.3,'triangle',0.08,2200);},
  hakaridoor(){this.tone(140,0.15,'square',0.10,60);this.noise(0.16,0.12,700,1.4);this.tone(880,0.10,'triangle',0.05,320);},
  hakarirough(){this.tone(70,0.30,'sawtooth',0.13,30);this.noise(0.28,0.16,450,1.1);this.tone(220,0.22,'square',0.06,110);},
  hakaridomain(){this.tone(60,1.5,'sine',0.12,180);this.tone(320,1.3,'triangle',0.07,900);this.tone(660,1.2,'sine',0.05,1320);this.noise(1.2,0.10,1400,1.5);},
  hakarijackpotroll(){this.tone(1200,0.06,'square',0.05,1500);this.tone(1500,0.06,'square',0.045,1800);this.noise(0.10,0.06,2400,2);},
  hakarijackpotsuccess(){this.tone(660,0.20,'triangle',0.11,990);setTimeout(()=>this.tone(990,0.22,'triangle',0.11,1320),120);setTimeout(()=>this.tone(1320,0.30,'sine',0.13,1980),240);this.noise(0.5,0.10,3200,2.5);},
  hakarijackpotfail(){this.tone(320,0.30,'sawtooth',0.08,140);this.noise(0.35,0.08,600,1.2);},
  hakarioverdrive(){this.tone(80,0.9,'sawtooth',0.14,220);this.tone(440,0.8,'triangle',0.09,1320);this.noise(0.8,0.14,800,1.2);this.tone(1760,0.6,'sine',0.07,2640);},
  hakarirestless(){this.tone(240,0.4,'sine',0.08,660);this.tone(480,0.5,'triangle',0.05,900);this.noise(0.4,0.07,700);},
  reelspin(){this.tone(1100,0.03,'square',0.03,1400);this.noise(0.04,0.03,2200,2);},
  reelstop(){this.tone(1600,0.10,'square',0.06,900);this.noise(0.08,0.08,1500,2);},
  jackpotdrop(){this.tone(880,0.05,'sine',0.03,440);},
  heiankamutokesummon(){this.tone(2200,0.12,'triangle',0.06,1600);this.noise(0.15,0.06,3400,3);this.tone(3200,0.10,'sine',0.04,2400);},
  heiankamutokecharge(){this.tone(1400,0.35,'sawtooth',0.05,2800);this.noise(0.28,0.06,4000,2.5);this.tone(2600,0.28,'sine',0.04,3600);},
  heiankamutokestrike(){this.tone(3200,0.08,'square',0.13,900);this.tone(1600,0.20,'sawtooth',0.11,300);this.noise(0.30,0.16,5000,4);this.tone(60,0.40,'sawtooth',0.08,30);},
  heiankamutokeimpact(){this.tone(2800,0.10,'square',0.11,600);this.tone(400,0.25,'sawtooth',0.10,80);this.noise(0.35,0.16,1200,1.2);this.tone(55,0.50,'sine',0.10,26);},
  heianhitencharge(){this.tone(220,0.40,'sawtooth',0.09,120);this.noise(0.35,0.08,600,1.5);this.tone(440,0.30,'triangle',0.05,180);},
  heianhitenrelease(){this.tone(380,0.10,'sawtooth',0.12,1400);this.noise(0.15,0.13,1800,1.8);this.tone(180,0.22,'triangle',0.08,60);},
  heianhitenimpact(){this.tone(600,0.14,'sawtooth',0.12,120);this.noise(0.25,0.14,1000,1.2);this.tone(150,0.35,'sine',0.08,50);},
  heiandomain(){this.tone(45,1.8,'sine',0.14,120);this.tone(180,1.4,'triangle',0.08,600);this.noise(1.3,0.12,600,1.2);},
  heianfugaIgnite(){this.tone(80,0.6,'sawtooth',0.09,120);this.noise(0.4,0.07,400,1.2);this.tone(220,0.5,'triangle',0.05,180);},
  heianfugaCharge(){this.tone(60,1.2,'sawtooth',0.10,180);this.noise(0.9,0.09,500,1.4);this.tone(180,1.0,'triangle',0.06,440);},
  heianfugaTension(){this.tone(140,0.5,'sine',0.10,280);this.tone(880,0.4,'triangle',0.05,1600);this.noise(0.35,0.06,900,1.5);},
  heianfugarelease(){this.tone(90,0.8,'sawtooth',0.14,1400);this.noise(0.7,0.15,700,1.3);this.tone(1600,0.35,'triangle',0.09,2800);},
  heianfugaImpact(){this.tone(45,1.6,'sawtooth',0.15,50);this.tone(180,1.2,'triangle',0.10,90);this.noise(1.1,0.15,600,1.1);this.tone(2200,0.4,'square',0.08,600);},
  heianwcs(){this.tone(1800,0.08,'square',0.08,400);this.tone(3400,0.10,'triangle',0.06,900);this.noise(0.25,0.10,4200,3);},
  heianwcsprep(){this.tone(140,0.5,'sine',0.06,280);this.tone(880,0.35,'triangle',0.04,1600);this.noise(0.4,0.05,800,1.5);},
  cleaveGrab(){this.tone(180,0.20,'sawtooth',0.10,60);this.noise(0.20,0.10,900,1.5);},
  cleaveSlash(){this.tone(1400,0.06,'square',0.08,300);this.noise(0.10,0.09,3000,3);this.tone(600,0.08,'sawtooth',0.06,180);},
  cleaveThrow(){this.tone(120,0.4,'sawtooth',0.12,50);this.noise(0.35,0.12,800,1.2);this.tone(320,0.30,'triangle',0.06,140);}
};
/* ===== CONSTANTS ===== */
const cv=document.getElementById('cv');const ctx=cv.getContext('2d');
const W=1280,H=720,GROUND=560,ARENA_W=3200,WALL=130,GRAV=0.86,STEP_MS=1000/60;
const MAX_PARTICLES=560,MAX_AFTERIMAGES=12,ULT_HOLD_THRESHOLD=28;
/* ===== INPUT ===== */
const KEY={},KP={};
const KEYMAP={
  p1:{left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS',light:'Digit1',heavy:'Digit2',s1:'Digit3',s2:'Digit4',s3:'Digit5',s4:'Digit6',s5:'Digit7',block:'KeyF',guardCancel:'KeyS',ult:'Digit9',def:'KeyR',wcs:'Digit0',awaken:'KeyG',form:'KeyH',copy:'KeyQ',special1:'KeyZ',special2:'KeyX',soru:'ShiftLeft'},
  p2:{left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',light:'Numpad1',heavy:'Numpad2',s1:'Numpad3',s2:'Numpad4',s3:'Numpad5',s4:'Numpad6',s5:'Numpad9',block:'Numpad8',guardCancel:'ArrowDown',ult:'Numpad7',def:'NumpadMultiply',wcs:'NumpadDivide',awaken:'Numpad0',form:'NumpadAdd',copy:'NumpadDecimal',special1:'NumpadSubtract',special2:'NumpadEnter',soru:'NumpadAdd'}
};
addEventListener('keydown',e=>{
  if(!KEY[e.code])KP[e.code]=true;KEY[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Numpad0','Numpad1','Numpad2','Numpad3','Numpad4','Numpad5','Numpad6','Numpad7','Numpad8','Numpad9','NumpadAdd','NumpadDecimal','NumpadDivide','NumpadMultiply'].includes(e.code))e.preventDefault();
  SFX.init();MenuKey(e.code);
});
addEventListener('keyup',e=>{KEY[e.code]=false;});
addEventListener('blur',()=>{for(const k in KEY)KEY[k]=false;});
function emptyInput(){return {left:0,right:0,up:0,down:0,light:0,heavy:0,s1:0,s2:0,s3:0,s4:0,s5:0,block:0,blockPress:0,guardCancel:0,ult:0,ultHeld:0,def:0,wcs:0,awaken:0,form:0,copy:0,special1:0,special2:0,soru:0};}
function readInput(map){
  const soruCode=map.soru;
  return {left:KEY[map.left]?1:0,right:KEY[map.right]?1:0,up:KEY[map.up]?1:0,down:KEY[map.down]?1:0,light:KP[map.light]?1:0,heavy:KP[map.heavy]?1:0,s1:KP[map.s1]?1:0,s2:KP[map.s2]?1:0,s3:KP[map.s3]?1:0,s4:KP[map.s4]?1:0,s5:KP[map.s5]?1:0,block:KEY[map.block]?1:0,blockPress:KP[map.block]?1:0,guardCancel:KP[map.guardCancel]?1:0,ult:KP[map.ult]?1:0,ultHeld:KEY[map.ult]?1:0,def:KP[map.def]?1:0,wcs:KP[map.wcs]?1:0,awaken:KP[map.awaken]?1:0,form:KP[map.form]?1:0,copy:KP[map.copy]?1:0,special1:KP[map.special1]?1:0,special2:KP[map.special2]?1:0,soru:(KEY[soruCode]||KEY['ShiftRight'])?1:0};
}