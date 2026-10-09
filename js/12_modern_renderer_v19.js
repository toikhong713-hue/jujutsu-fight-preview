'use strict';
/* ===== JFF MODERN ERA v19: PRESENTATION RENDERER =====
   Character silhouettes remain 100% legacy. Modernization happens around them:
   lighting, motion language, trails, impact readability, depth and camera-ready FX.
*/
(function(){
  if(window.JFF_MODERN_RENDERER_V19) return;
  const legacyDrawFighter=window.drawFighter;
  window.JFF_MODERN={enabled:true,quality:'auto',version:'v19',legacyCharacterShape:true};
  G.modernFx=G.modernFx||{quality:1,motion:[],impacts:[],lights:[],screenFlash:0,screenFlashColor:'#fff'};

  function palette(f){
    const C=getColors(f||G.fighters?.[0]);
    return {accent:C?.accent||'#b9c7d5',aura:C?.aura||'#9aa7b5',energy:C?.energy||'#dbe4ef'};
  }
  function drawGroundLight(f,p){
    if(!f||G.mode==='menu')return;
    const q=G.modernFx.quality||1;
    const active=(f.state==='DASH'||f.state==='ATTACK'||f.state==='JUMP'||f.state==='ROLL'||f.state==='BURST'||f.tojiMotion==='dash'||f.youngMotion==='dash'||f.youngMotion==='blink');
    const pal=palette(f),pulse=0.55+Math.sin((f.animT||0)*0.12)*0.15;
    ctx.save();ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=(active?0.12:0.045)*q*pulse;
    const g=ctx.createRadialGradient(f.x,GROUND+1,2,f.x,GROUND+1,active?76:48);
    g.addColorStop(0,pal.aura);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;
    ctx.beginPath();ctx.ellipse(f.x,GROUND+1,active?70:44,active?10:7,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  function drawMotionShell(f){
    const q=G.modernFx.quality||1;
    const fast=f.state==='DASH'||f.state==='ROLL'||f.state==='BURST'||f.tojiMotion==='dash'||f.youngMotion==='dash'||f.youngMotion==='blink';
    if(!fast)return;
    const pal=palette(f),speed=Math.min(16,Math.abs(f.vx||0));
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.10*q+speed*.008*q;ctx.lineCap='round';
    ctx.strokeStyle=pal.accent;ctx.lineWidth=2.2;
    const span=32+speed*3;
    for(let i=0;i<3;i++){
      const yy=f.y-48-i*11;
      ctx.beginPath();ctx.moveTo(f.x-(f.facing||1)*(span+18+i*9),yy);ctx.lineTo(f.x-(f.facing||1)*12,yy+i*1.5);ctx.stroke();
    }
    ctx.restore();
  }
  function drawStateLight(f){
    const pal=palette(f),q=G.modernFx.quality||1;
    let strength=0;
    if(f.awakened)strength=.12;
    if(f.ultCharging)strength=Math.max(strength,.16);
    if(f.domainCharge>0)strength=Math.max(strength,.11);
    if(f.jackpot>0)strength=Math.max(strength,.10);
    if(f.tojiHunt>0)strength=Math.max(strength,.14);
    if(f.infinity>0)strength=Math.max(strength,.12);
    if(!strength)return;
    const p=.7+Math.sin((f.animT||0)*.09)*.18;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=strength*q*p;
    const g=ctx.createRadialGradient(f.x,f.y-76,8,f.x,f.y-76,105);
    g.addColorStop(0,pal.aura);g.addColorStop(.35,pal.accent+'66');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;
    ctx.beginPath();ctx.ellipse(f.x,f.y-72,82,112,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  window.drawFighter=function(f){
    if(f){drawGroundLight(f);drawStateLight(f);drawMotionShell(f);}
    /* The body, face, clothing and original pose renderer are intentionally untouched. */
    legacyDrawFighter(f);
  };

  window.JFF_MODERN_RENDERER_V19=true;
})();