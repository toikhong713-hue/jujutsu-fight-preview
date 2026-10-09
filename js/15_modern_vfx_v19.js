'use strict';
/* ===== MODERN VFX PASS ===== */
(function(){
  if(window.JFF_MODERN_VFX_V19)return;
  G.modernFx=G.modernFx||{quality:1,motion:[],impacts:[],lights:[],screenFlash:0,screenFlashColor:'#fff'};
  const legacyCombatImpact=window.combatFeelImpact;
  const legacyUpdateVFX=window.updateVFX;
  const legacyRender=window.render;

  function quality(){return G.modernFx.quality||1;}
  function pushImpact(x,y,mv,bf){
    if(!Number.isFinite(x)||!Number.isFinite(y))return;
    const heavy=bf||(mv&&(mv.damage||0)>=16)||mv?.kind==='heavy'||mv?.kind==='ult';
    G.modernFx.impacts.push({x,y,life:heavy?10:7,maxLife:heavy?10:7,heavy:!!heavy,dir:(mv?.facing)||1});
    if(G.modernFx.impacts.length>18)G.modernFx.impacts.shift();
  }
  window.combatFeelImpact=function(x,y,mv,bf){
    legacyCombatImpact(x,y,mv,bf);pushImpact(x,y,mv,bf);
  };
  function updateModernVFX(){
    for(let i=G.modernFx.impacts.length-1;i>=0;i--){const b=G.modernFx.impacts[i];b.life--;if(b.life<=0)G.modernFx.impacts.splice(i,1);}
    G.modernFx.screenFlash*=.86;
  }
  window.updateVFX=function(){legacyUpdateVFX();updateModernVFX();};

  function drawImpactMarks(){
    const q=quality();
    for(const b of G.modernFx.impacts){
      const t=1-b.life/b.maxLife,a=Math.max(0,1-t)*.38*q,rad=(b.heavy?24:15)+(b.heavy?56:36)*t;
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;
      ctx.strokeStyle=b.heavy?'#f4f6f8':'#d9e4ee';ctx.lineWidth=b.heavy?3:2;ctx.beginPath();ctx.arc(b.x,b.y,rad,0,Math.PI*2);ctx.stroke();
      ctx.lineWidth=b.heavy?1.8:1.2;
      for(let k=0;k<4;k++){
        const ang=k*Math.PI/2+t*.4,len=(b.heavy?54:34)*(1-t*.55);
        ctx.beginPath();ctx.moveTo(b.x+Math.cos(ang)*10,b.y+Math.sin(ang)*10);ctx.lineTo(b.x+Math.cos(ang)*len,b.y+Math.sin(ang)*len);ctx.stroke();
      }
      ctx.restore();
    }
  }
  function drawScreenGrade(){
    if(G.mode==='menu')return;
    const q=quality();
    ctx.save();
    const vignette=ctx.createRadialGradient(W*.5,H*.48,180,W*.5,H*.48,720);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,'+(0.22*q)+')');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=.035*q;ctx.fillStyle='#fff';
    for(let y=0;y<H;y+=4)ctx.fillRect(0,y,W,1);
    ctx.restore();
  }
  window.render=function(){
    legacyRender();
    if(G.mode!=='menu'){drawImpactMarks();drawScreenGrade();}
  };
  window.JFF_MODERN_VFX_V19=true;
})();