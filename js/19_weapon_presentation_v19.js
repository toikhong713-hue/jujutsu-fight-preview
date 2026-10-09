'use strict';
/* ===== MODERN WEAPON PRESENTATION =====
   Uses the existing weapon drawings. Adds restrained edge-light, motion and grip readability.
*/
(function(){
  if(window.JFF_WEAPON_PRESENTATION_V19)return;
  function drawTojiWeaponLight(f){
    if(!f||f.id!=='toji'||f.state!=='ATTACK'||!f.moveKey)return;
    const fast=(f.moveKey==='light'||f.moveKey==='heavy'||['s1','s2','s3','s4','s5','z','x','ult'].includes(f.moveKey));
    if(!fast)return;
    const p=getModernAnimProfile?getModernAnimProfile(f):{phase:.5};
    const fd=f.facing||1,sp=clamp(Math.abs(f.vx||0)/10,0,1),phase=p.phase||0;
    const x=f.x+fd*(36+Math.sin(phase*Math.PI)*72),y=f.y-78-phase*8;
    let col='#dce2e6';
    if(f.moveKey==='s1')col='#eef4f7';
    if(f.moveKey==='s2')col='#f4f5f5';
    if(f.moveKey==='s3')col='#aab8c2';
    if(f.moveKey==='s4')col='#dfe4e8';
    if(f.moveKey==='s5'||f.moveKey==='z')col='#9aa3aa';
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.12+sp*.08;ctx.lineCap='round';
    ctx.strokeStyle=col;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x-fd*52,y+10);ctx.lineTo(x+fd*42,y-12);ctx.stroke();
    ctx.globalAlpha=.22;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x-fd*40,y+4);ctx.lineTo(x+fd*28,y-10);ctx.stroke();
    ctx.restore();
  }
  function drawAllWeaponPresentation(){
    if(G.mode==='menu')return;
    for(const f of (G.fighters||[]))drawTojiWeaponLight(f);
  }
  const oldRender=window.render;
  window.render=function(){oldRender();drawAllWeaponPresentation();};
  window.JFF_WEAPON_PRESENTATION_V19=true;
})();