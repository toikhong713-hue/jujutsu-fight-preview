/* ===== CHARACTER IDENTITY OVERHAUL V19 =====
   Pre-Modern visual cleanup. Keeps the legacy renderer and proportions.
   No Megumi added here. This layer improves silhouettes, idle language,
   costume readability and character-specific facial/weapon cues only.
*/
function applyCharacterIdentityPose(P,f){
  if(!f || !P) return false;
  const t=f.animT||0, s=Math.sin(t*0.045), s2=Math.sin(t*0.095);
  const cineGait=f.storyCineGait, cinePhase=f.storyCineGaitPhase||0;
  if(cineGait){
    const w=Math.sin(cinePhase);
    if(cineGait==='yuta-walk'){
      P.hipY=-58-Math.abs(w)*3.2;P.shY=-97+Math.sin(cinePhase*2)*0.7;
      P.headY=-113+Math.sin(cinePhase*2)*0.8;P.lean=3+w*3.8;
      P.armF=[65-w*7,22+w*3];P.armB=[113+w*11,21-w*3];
      P.legF=[88+w*29,4+Math.max(0,-w)*25];
      P.legB=[94-w*27,-6+Math.max(0,w)*21];
      return true;
    }
    if(cineGait==='sukuna-walk'){
      P.hipY=-55-Math.abs(w)*2.4;P.shY=-94+Math.sin(cinePhase*2)*0.45;
      P.headY=-110+Math.sin(cinePhase*2)*0.55;P.lean=9+w*2.1;
      P.armF=[72-w*6,36+w*2];P.armB=[115+w*6,14-w*2];
      P.legF=[84+w*25,9+Math.max(0,-w)*19];
      P.legB=[98-w*24,-9+Math.max(0,w)*15];
      return true;
    }
    if(cineGait==='yuta-ready'){
      P.hipY=-58+Math.sin(cinePhase*0.7)*1.2;P.shY=-97;P.headY=-114+Math.sin(cinePhase*0.5)*0.9;
      P.lean=-1+Math.sin(cinePhase*0.7)*0.7;
      P.armF=[55,-73+Math.sin(cinePhase)*2.2];P.armB=[126,-42];
      P.legF=[88,7];P.legB=[96,-7];
      return true;
    }
    if(cineGait==='sukuna-calm'){
      P.hipY=-56+Math.sin(cinePhase*0.65)*1.4;P.shY=-94;P.headY=-110+Math.sin(cinePhase*0.45)*0.8;
      P.lean=9+Math.sin(cinePhase*0.6)*1.2;
      P.armF=[72+Math.sin(cinePhase*0.6)*2,36];P.armB=[115-Math.sin(cinePhase*0.6)*2,14];
      P.legF=[84,10];P.legB=[98,-9];
      return true;
    }
    if(cineGait==='yuta-brace'){
      P.hipY=-57+Math.sin(cinePhase*0.9)*1.3;P.shY=-96;P.headY=-113+Math.sin(cinePhase*0.7)*0.7;P.lean=2;
      P.armF=[42,-54+Math.sin(cinePhase*0.8)*2];P.armB=[118,-32];
      P.legF=[78,18];P.legB=[107,-12];
      return true;
    }
    if(cineGait==='sukuna-brace'){
      P.hipY=-55+Math.sin(cinePhase*0.75)*0.9;P.shY=-93;P.headY=-110;P.lean=12+Math.sin(cinePhase*0.6)*1.2;
      P.armF=[48,-4];P.armB=[112,18];
      P.legF=[78,18];P.legB=[105,-12];
      return true;
    }
    if(cineGait==='yuta-strike'){
      const hit=Math.max(0,Math.sin(cinePhase));
      P.hipY=-55-hit*3;P.shY=-94;P.headY=-112;P.lean=15+hit*9;
      P.armF=[35,-88+hit*7];P.armB=[146,-48];
      P.legF=[70,18];P.legB=[119,-13];
      return true;
    }
    if(cineGait==='sukuna-counter'){
      const hit=Math.max(0,Math.sin(cinePhase*Math.PI));
      P.hipY=-55-hit*2;P.shY=-93;P.headY=-110;P.lean=12+hit*5;
      P.armF=[52,-52];P.armB=[131,-42];
      P.legF=[75,18];P.legB=[109,-11];
      return true;
    }
  }
  if(f.state==='IDLE' || f.state==='WALK'){
    if(f.id==='gojo'){
      // Relaxed, upright, slightly off-center stance instead of mannequin idle.
      P.hipY=-58+s*1.2; P.shY=-96; P.headY=-112+s2*0.8; P.lean=2+s*1.8;
      P.armF=[64+s2*3,34+s*2]; P.armB=[112-s*3,18-s2*2];
      P.legF=[88+s*2,7]; P.legB=[95-s*2,-7];
      return true;
    }
    if(f.id==='young_gojo'){
      // Young Gojo: relaxed high guard, a little spring in the knees.
      P.hipY=-59+s*1.0; P.shY=-99; P.headY=-116+s2*0.8; P.lean=1+s*1.5;
      P.armF=[62+s2*3,24+s*2]; P.armB=[108-s*2,19-s2*2];
      P.legF=[88+s*2,7]; P.legB=[96-s*2,-7];
      return true;
    }
    if(f.id==='toji'){
      // Toji: low, forward-loaded predator stance, ready to draw a weapon.
      P.hipY=-55+s*0.9; P.shY=-93; P.headY=-109+s2*0.7; P.lean=8+s*2.2;
      P.armF=[70+s2*3,39+s*2]; P.armB=[118-s2*2,16-s*2];
      P.legF=[84+s*2,10]; P.legB=[99-s*2,-9];
      return true;
    }
    if(f.id==='sukuna'&&f.form!==1){
      // Low predator stance, shoulders slightly forward.
      P.hipY=-55+s*1.0; P.shY=-94; P.headY=-110+s2*0.8; P.lean=7+s*2.2;
      P.armF=[70+s2*4,38+s*2]; P.armB=[116-s2*3,12-s*2];
      P.legF=[84+s*3,10]; P.legB=[98-s*3,-9];
      return true;
    }
    if(f.id==='yuta'){
      // Guarded swordsman stance, front hand closer to the katana.
      P.hipY=-58+s*1.2; P.shY=-97; P.headY=-113+s2*0.7; P.lean=-2+s*1.4;
      P.armF=[57+s2*2,31+s*2]; P.armB=[111-s2*2,20];
      P.legF=[87+s*2,6]; P.legB=[96-s*2,-7];
      return true;
    }
    if(f.id==='hakari'){
      // Loose street-fighter stance, chest slightly forward.
      const j=(f.jackpot>0)?1.35:1;
      P.hipY=-57+s*1.3; P.shY=-96; P.headY=-112+s2*1.1; P.lean=5+s*2.8;
      P.armF=[68+s2*5*j,34+s*3]; P.armB=[118-s2*4*j,16-s*2];
      P.legF=[85+s*3,8]; P.legB=[97-s*3,-9];
      return true;
    }
    if(f.id==='yuji'||(f.id==='sukuna'&&f.form===1)){
      // Athletic, centered stance with a little forward readiness.
      P.hipY=-58+s*1.1; P.shY=-97; P.headY=-113+s2*0.8; P.lean=4+s*2.2;
      P.armF=[62+s2*5,31+s*2]; P.armB=[114-s2*3,19-s*2];
      P.legF=[86+s*3,8]; P.legB=[97-s*3,-8];
      return true;
    }
    if(f.id==='heian_sukuna'){
      // Four-arm silhouette reads wider and more authoritative while preserving the old renderer.
      P.hipY=-57+s*1.0; P.shY=-95; P.headY=-111+s2*.7; P.lean=6+s*1.8;
      P.armF=[68+s2*4,34+s*2]; P.armB=[115-s2*3,14-s*2];
      P.legF=[87+s*2,8]; P.legB=[95-s*2,-9];
      return true;
    }
  }
  if(f.state==='BLOCK' || f.state==='PARRY'){
    if(f.id==='gojo'){P.lean=-4;P.armF=[10,-66];P.armB=[28,-60];return true;}
    if(f.id==='sukuna'&&f.form!==1){P.lean=-1;P.armF=[18,-58];P.armB=[38,-48];return true;}
    if(f.id==='sukuna'&&f.form===1){P.lean=-6;P.armF=[8,-62];P.armB=[30,-52];P.legF=[84,11];return true;}
    if(f.id==='yuta'){P.lean=-7;P.armF=[8,-62];P.armB=[30,-52];return true;}
    if(f.id==='hakari'){P.lean=-5;P.armF=[12,-58];P.armB=[34,-48];return true;}
    if(f.id==='yuji'){P.lean=-6;P.armF=[8,-62];P.armB=[30,-52];return true;}
    if(f.id==='young_gojo'){P.lean=-4;P.armF=[16,-69];P.armB=[34,-61];return true;}
    if(f.id==='toji'){P.lean=-10;P.armF=[3,-56];P.armB=[27,-45];P.legF=[82,12];return true;}
    if(f.id==='heian_sukuna'){P.lean=-2;P.armF=[15,-62];P.armB=[40,-50];return true;}
    if(f.id==='the_strongest_today'){P.lean=-5;P.armF=[9,-66];P.armB=[30,-57];return true;}
  }
  return false;
}

function drawCharacterIdentityDetails(f,P,fd,bx,by,shPt,hipPt,headPt,hf,ef){
  if(!f)return;
  ctx.save();
  ctx.lineCap='round';
  // Costume language. All additions are low-cost vector strokes on the legacy silhouette.
  if(f.id==='gojo'){
    // Blindfold band + small ear/strap cue.
    ctx.fillStyle='#101725';
    ctx.beginPath();
    ctx.moveTo(headPt.x-fd*11,headPt.y-4);
    ctx.quadraticCurveTo(headPt.x,headPt.y-8,headPt.x+fd*11,headPt.y-4);
    ctx.lineTo(headPt.x+fd*10,headPt.y+4);
    ctx.quadraticCurveTo(headPt.x,headPt.y+7,headPt.x-fd*10,headPt.y+4);
    ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(120,150,195,.55)';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(headPt.x-fd*10,headPt.y-1);ctx.lineTo(headPt.x-fd*14,headPt.y+2);ctx.stroke();
    // High collar / front seam.
    ctx.strokeStyle='rgba(120,165,215,.38)';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(shPt.x-fd*8,shPt.y+5);ctx.lineTo(hipPt.x-fd*5,hipPt.y+12);ctx.stroke();
  }
  if(f.id==='sukuna'&&f.form!==1){
    // Facial markings, intentionally clean rather than noisy.
    ctx.strokeStyle='rgba(40,8,16,.92)';ctx.lineWidth=1.55;
    const x=headPt.x+fd*2,y=headPt.y+1;
    ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x+fd*5,y-3);ctx.moveTo(x+fd*1,y+6);ctx.lineTo(x+fd*7,y+2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-fd*5,y-6);ctx.lineTo(x-fd*8,y-1);ctx.stroke();
    // Open neckline cue.
    ctx.strokeStyle='rgba(255,110,125,.22)';ctx.lineWidth=1.3;
    ctx.beginPath();ctx.moveTo(shPt.x-fd*7,shPt.y+7);ctx.lineTo(hipPt.x,hipPt.y+9);ctx.lineTo(shPt.x+fd*7,shPt.y+7);ctx.stroke();
  }
  if(f.id==='yuta'){
    // Long coat lapels and katana wrap.
    ctx.strokeStyle='rgba(225,230,255,.52)';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(shPt.x-fd*6,shPt.y+8);ctx.lineTo(hipPt.x-fd*10,hipPt.y+20);ctx.moveTo(shPt.x+fd*6,shPt.y+8);ctx.lineTo(hipPt.x+fd*9,hipPt.y+19);ctx.stroke();
    ctx.strokeStyle='rgba(100,88,140,.75)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(hf.x-fd*3,hf.y);ctx.lineTo(hf.x+fd*4,hf.y);ctx.stroke();
  }
  if(f.id==='hakari'){
    // Jacket lapels and chest opening.
    ctx.strokeStyle='rgba(255,225,150,.42)';ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(shPt.x-fd*9,shPt.y+5);ctx.lineTo(hipPt.x-fd*5,hipPt.y+18);ctx.moveTo(shPt.x+fd*9,shPt.y+5);ctx.lineTo(hipPt.x+fd*5,hipPt.y+18);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(hipPt.x,hipPt.y-3);ctx.lineTo(hipPt.x+fd*1,hipPt.y+18);ctx.stroke();
  }
  if(f.id==='yuji'||(f.id==='sukuna'&&f.form===1)){
    // Uniform collar and sleeve cuffs.
    ctx.strokeStyle='rgba(235,205,205,.28)';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(shPt.x-fd*7,shPt.y+5);ctx.lineTo(hipPt.x,hipPt.y+14);ctx.lineTo(shPt.x+fd*7,shPt.y+5);ctx.stroke();
    const frontElbow={x:lerp(shPt.x,ef.x,.72),y:lerp(shPt.y,ef.y,.72)};
    ctx.strokeStyle='rgba(190,135,145,.42)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(frontElbow.x-fd*5,frontElbow.y-fd*0.2);ctx.lineTo(frontElbow.x+fd*5,frontElbow.y+fd*0.2);ctx.stroke();
  }
  if(f.id==='young_gojo'){
    // High collar seams and crisp Six Eyes glint, kept subtle at the game's scale.
    ctx.strokeStyle='rgba(165,231,255,.42)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(shPt.x-fd*8,shPt.y+4);ctx.lineTo(shPt.x-fd*3,shPt.y+15);ctx.lineTo(hipPt.x,hipPt.y+10);ctx.stroke();
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(220,250,255,.8)';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(headPt.x+fd*1,headPt.y+1);ctx.lineTo(headPt.x+fd*8,headPt.y+1);ctx.stroke();ctx.restore();
  }
  if(f.id==='toji'){
    // Thin lip scar and dark diagonal shirt seam help identify Toji without adding heavy geometry.
    ctx.strokeStyle='rgba(76,42,39,.75)';ctx.lineWidth=1.25;
    ctx.beginPath();ctx.moveTo(headPt.x+fd*1,headPt.y+5);ctx.lineTo(headPt.x+fd*7,headPt.y+3.6);ctx.stroke();
    ctx.strokeStyle='rgba(150,158,163,.27)';ctx.lineWidth=1.3;
    ctx.beginPath();ctx.moveTo(shPt.x-fd*5,shPt.y+4);ctx.lineTo(hipPt.x+fd*9,hipPt.y+18);ctx.stroke();
  }
  if(f.id==='the_strongest_today'){
    ctx.strokeStyle=f.overdriveActive?'rgba(0,229,255,.68)':'rgba(130,180,220,.32)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(shPt.x-fd*7,shPt.y+5);ctx.lineTo(hipPt.x-fd*3,hipPt.y+16);ctx.moveTo(shPt.x+fd*7,shPt.y+5);ctx.lineTo(hipPt.x+fd*3,hipPt.y+16);ctx.stroke();
  }
  if(f.id==='heian_sukuna'){
    // Chest marks and sash emphasis behind the already-rendered four-arm silhouette.
    ctx.strokeStyle='rgba(255,95,110,.52)';ctx.lineWidth=1.4;
    const cx=hipPt.x, cy=hipPt.y+2;
    ctx.beginPath();ctx.moveTo(cx-fd*9,cy);ctx.lineTo(cx-fd*2,cy+7);ctx.moveTo(cx+fd*9,cy);ctx.lineTo(cx+fd*2,cy+7);ctx.stroke();
    ctx.strokeStyle='rgba(255,210,215,.18)';ctx.lineWidth=1.3;
    ctx.beginPath();ctx.moveTo(cx-fd*12,cy+15);ctx.lineTo(cx+fd*12,cy+15);ctx.stroke();
  }
  // Shared shoe sole cue makes foot silhouettes cleaner at low resolution.
  ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(hf.x-fd*7,hf.y+5);ctx.lineTo(hf.x+fd*6,hf.y+5);ctx.stroke();
  ctx.restore();
}