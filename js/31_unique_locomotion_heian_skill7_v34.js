/* ===== JFF V34: CHARACTER-SPECIFIC IDLE/RUN + HEIAN SKILL 7 =====
   Lightweight pose-only polish. Keeps existing combat data and Canvas 2D renderer.
*/
(function () {
  if (typeof computePose !== 'function' || typeof updateMove !== 'function') return;

  const JFF_V34_BASE_COMPUTE_POSE = computePose;
  const JFF_V34_BASE_UPDATE_MOVE = updateMove;
  const jffV34Clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const jffV34Lerp = (a, b, t) => a + (b - a) * t;
  const jffV34Ease = t => { t = jffV34Clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const jffV34Pair = (v, f) => f.facing < 0 ? [180 - v[0], -v[1]] : v;

  function jffV34SetPose(P, f, d) {
    P.hipY = d.hipY;
    P.shY = d.shY;
    P.headY = d.headY;
    P.headX = d.headX || 0;
    P.lean = d.lean;
    P.armF = jffV34Pair(d.armF, f);
    P.armB = jffV34Pair(d.armB, f);
    P.legF = jffV34Pair(d.legF, f);
    P.legB = jffV34Pair(d.legB, f);
  }

  function jffV34LocomotionPose(P, f) {
    const t = f.animT || 0;
    const idle = f.state === 'IDLE';
    const walkPhase = (f.walk || 0) * 1.6;
    const isYujiForm = f.id === 'sukuna' && f.form === 1;
    const id = isYujiForm ? 'yuji' : f.id;
    const breath = Math.sin(t * 0.055);
    const sway = Math.sin(t * 0.075 + 0.4);
    let d;

    if (idle) {
      switch (id) {
        case 'gojo': {
          const s = Math.sin(t * 0.045), q = Math.sin(t * 0.11);
          d = { hipY:-58+s*1.0, shY:-96, headY:-112+q*0.8, headX:q*0.5,
            lean:-1+s*1.2, armF:[60+q*2,35+s*1.2], armB:[123-s*2,14-q*1.4],
            legF:[88+s*1.2,6], legB:[96-s*1.3,-6] };
          if (f.awakened) { d.armF=[48+q*3,17+s*2]; d.armB=[137-s*3,-6-q*2]; }
          break;
        }
        case 'young_gojo': {
          const s=Math.sin(t*0.07), q=Math.sin(t*0.15);
          d={hipY:-59+Math.sin(t*0.10)*1.4,shY:-100,headY:-117+q*.7,headX:1+q*.5,
            lean:2+s*1.4,armF:[53+q*3,20+s*2],armB:[128-q*4,12-s*1.5],
            legF:[87+s*1.5,7],legB:[97-s*1.4,-6]};
          break;
        }
        case 'sukuna': {
          if (isYujiForm) break;
          const s=Math.sin(t*.06), q=Math.sin(t*.13);
          d={hipY:-55+Math.sin(t*.075)*1.1,shY:-94,headY:-110+q*.75,headX:1,
            lean:10+s*1.8,armF:[66+q*3,37+s*2],armB:[122-q*3,10-s*1.5],
            legF:[84+s*1.8,10],legB:[99-s*1.8,-9]};
          break;
        }
        case 'yuji': {
          const s=Math.sin(t*.08), q=Math.sin(t*.17);
          d={hipY:-57+Math.sin(t*.11)*1.2,shY:-97,headY:-113+q*.8,headX:1,
            lean:5+s*1.5,armF:[43+q*2,7+s*1.4],armB:[133-q*3,20-s*1.5],
            legF:[86+s*1.5,9],legB:[98-s*1.5,-8]};
          break;
        }
        case 'yuta': {
          const s=Math.sin(t*.05), q=Math.sin(t*.105);
          d={hipY:-58+Math.sin(t*.065)*.9,shY:-97,headY:-113+q*.65,headX:-.5,
            lean:-3+s*.8,armF:[47+q*1.2,27+s*.8],armB:[119-s*2,17],
            legF:[87+s,6],legB:[97-s,-6]};
          break;
        }
        case 'hakari': {
          const s=Math.sin(t*.075), q=Math.sin(t*.17), jackpot=f.jackpot>0?1.35:1;
          d={hipY:-57+Math.sin(t*.13)*1.9,shY:-96,headY:-112+q*1.2,headX:q*.5,
            lean:7+s*2.3,armF:[67+q*5*jackpot,37+s*2],armB:[116-q*4*jackpot,13-s*2],
            legF:[85+s*2,9],legB:[98-s*2,-8]};
          break;
        }
        case 'toji': {
          const s=Math.sin(t*.055), q=Math.sin(t*.12), hunt=f.tojiHunt>0?1:0;
          d={hipY:-54+Math.sin(t*.08)*.9,shY:-93,headY:-109+q*.6,headX:1,
            lean:16+s*1.2+hunt*3,armF:[55+q*2,38+s*1.6],armB:[132-q*2,7-s*1.4],
            legF:[82+s*1.4,11],legB:[101-s*1.2,-10]};
          break;
        }
        case 'heian_sukuna': {
          const s=Math.sin(t*.045), q=Math.sin(t*.12);
          d={hipY:-56+Math.sin(t*.065)*1.2,shY:-95,headY:-112+q*.8,headX:1.5,
            lean:7+s*1.1,armF:[61+q*2.5,34+s*1.7],armB:[123-q*2.5,9-s*1.2],
            legF:[86+s*1.4,8],legB:[97-s*1.4,-8]};
          break;
        }
        case 'the_strongest_today': {
          const s=Math.sin(t*.035), q=Math.sin(t*.09), od=!!f.overdriveActive;
          d={hipY:-59+Math.sin(t*.05)*.65,shY:-97,headY:-114+q*.55,headX:1,
            lean:od?0:1+s*.6,armF:[od?43:70+q,od?-18:22+s],armB:[od?137:115-q,od?-16:14],
            legF:[88+s*.5,5],legB:[96-s*.5,-5]};
          break;
        }
      }
      if (!d) d={hipY:-58+breath,shY:-96,headY:-112+sway,lean:0,armF:[70,28],armB:[112,18],legF:[88,6],legB:[96,-6]};
      jffV34SetPose(P, f, d);
      return;
    }

    /* Each fighter has its own gait: speed, stride, knee lift, shoulder rhythm,
       and guard position differ. The same animation phase is not reused across the roster. */
    const specs = {
      gojo:               {freq:1.52,stride:15,lift:13,arm:5,lean:0,hip:1.0,front:60,frontBend:31,back:121,backBend:14,shY:-96,headY:-112},
      young_gojo:         {freq:1.82,stride:27,lift:24,arm:17,lean:8,hip:3.2,front:51,frontBend:17,back:129,backBend:11,shY:-99,headY:-116},
      sukuna:             {freq:1.66,stride:24,lift:19,arm:15,lean:18,hip:2.0,front:65,frontBend:34,back:124,backBend:10,shY:-94,headY:-110},
      yuji:               {freq:1.92,stride:29,lift:25,arm:19,lean:9,hip:3.0,front:43,frontBend:8,back:132,backBend:20,shY:-97,headY:-113},
      yuta:               {freq:1.48,stride:18,lift:13,arm:7,lean:2,hip:1.4,front:47,frontBend:25,back:120,backBend:16,shY:-97,headY:-113},
      hakari:             {freq:1.58,stride:24,lift:20,arm:17,lean:12,hip:3.2,front:66,frontBend:35,back:115,backBend:13,shY:-96,headY:-112},
      toji:               {freq:2.00,stride:32,lift:27,arm:22,lean:24,hip:1.1,front:48,frontBend:25,back:141,backBend:5,shY:-93,headY:-109},
      heian_sukuna:       {freq:1.64,stride:24,lift:20,arm:16,lean:16,hip:1.9,front:59,frontBend:33,back:127,backBend:9,shY:-95,headY:-112},
      the_strongest_today:{freq:1.40,stride:13,lift:10,arm:4,lean:1,hip:.7,front:69,frontBend:20,back:116,backBend:14,shY:-97,headY:-114}
    };
    const q=specs[id]||specs.gojo;
    const ph=walkPhase*q.freq, s=Math.sin(ph), c=Math.cos(ph);
    const liftF=Math.max(0,-s)*q.lift, liftB=Math.max(0,s)*q.lift;
    const torsoPitch=q.lean + c*(id==='toji'?2.2:(id==='heian_sukuna'?1.6:1.1));
    const armSwing=q.arm*s;
    d={
      hipY:-58-q.hip*Math.abs(s)+Math.sin(ph*2)*.65,
      shY:q.shY+(id==='toji'?-1:0),headY:q.headY+Math.sin(ph*2)*.8,headX:c*(id==='toji'?2:0.8),
      lean:torsoPitch,
      armF:[q.front-armSwing, q.frontBend+Math.max(0,s)*2.5],
      armB:[q.back+armSwing*.78, q.backBend-Math.max(0,-s)*2],
      legF:[88+s*q.stride,6+liftF],
      legB:[96-s*q.stride*.86,-6+liftB*.82]
    };
    if(id==='gojo'&&f.awakened){d.armF=[46-armSwing*.45,14];d.armB=[137+armSwing*.35,-7];d.lean+=1;}
    if(id==='young_gojo'){d.headY-=Math.max(0,-s)*1.3;d.lean+=Math.max(0,s)*2;}
    if(id==='sukuna'&&!isYujiForm){d.armF[1]+=Math.max(0,s)*5;d.lean+=2;}
    if(id==='yuji'){d.armF[1]+=Math.max(0,-s)*5;d.armB[1]+=Math.max(0,s)*3;}
    if(id==='hakari'&&f.jackpot>0){d.armF[0]-=4;d.lean+=2;}
    if(id==='toji'){d.armF[0]-=2;d.armB[0]+=2;d.headY-=Math.max(0,s)*1.1;}
    if(id==='heian_sukuna'){d.armB[0]+=Math.sin(ph+1)*2;d.lean+=Math.max(0,s)*2;}
    if(id==='the_strongest_today'&&f.overdriveActive){d.armF=[42-armSwing*.3,-18];d.armB=[137+armSwing*.25,-15];}
    jffV34SetPose(P, f, d);
  }

  function jffV34HeianHitenPose(P, f) {
    const mf=f.moveFrame||0;
    const pulse=Math.sin(mf*.24), rc=Math.max(1,(f.move&&f.move.recovery)||29);
    let lean=-4, armF=[62,18], armB=[126,12], hip=-57, sh=-95, head=-112, legF=[88,7], legB=[97,-8];
    if(mf<9){
      const q=jffV34Ease(mf/8);
      lean=jffV34Lerp(-2,-10,q);hip=-57-2*q;sh=-95-2*q;head=-112-2*q;
      armF=[jffV34Lerp(62,48,q),jffV34Lerp(18,4,q)];
      armB=[jffV34Lerp(126,142,q),jffV34Lerp(12,-12,q)];
      legF=[jffV34Lerp(88,76,q),jffV34Lerp(7,18,q)];legB=[jffV34Lerp(97,108,q),-8];
    } else if(mf<21){
      const q=jffV34Ease((mf-9)/12);lean=jffV34Lerp(-10,-18,q);hip=-55-2*q;sh=-97;head=-115;
      armF=[jffV34Lerp(48,25,q),jffV34Lerp(4,-30,q)];
      armB=[jffV34Lerp(142,151,q),jffV34Lerp(-12,-29,q)];
      legF=[jffV34Lerp(76,66,q),jffV34Lerp(18,24,q)];legB=[jffV34Lerp(108,120,q),-9];
    } else if(mf<36){
      const q=jffV34Ease((mf-21)/15);lean=jffV34Lerp(-18,-24,q);hip=-57;sh=-100;head=-118;
      // The weapon is chambered beside the shoulder, not raised straight up for a ground slam.
      armF=[jffV34Lerp(25,8,q),jffV34Lerp(-30,-62,q)];
      armB=[jffV34Lerp(151,145,q),jffV34Lerp(-29,-38,q)];
      legF=[jffV34Lerp(66,58,q),jffV34Lerp(24,28,q)];legB=[jffV34Lerp(120,130,q),-10];
    } else if(mf<=44){
      const q=jffV34Ease((mf-36)/8);lean=jffV34Lerp(-24,20,q);hip=-58-3*Math.sin(q*Math.PI);sh=-100+3*q;head=-118+3*q;
      // First diagonal cross-cut across the opponent's body.
      armF=[jffV34Lerp(8,68,q),jffV34Lerp(-62,14,q)];
      armB=[jffV34Lerp(145,116,q),jffV34Lerp(-38,25,q)];
      legF=[jffV34Lerp(58,112,q),jffV34Lerp(28,10,q)];legB=[jffV34Lerp(130,78,q),-10];
    } else if(mf<=52){
      const q=jffV34Ease((mf-44)/8);lean=jffV34Lerp(20,30,q);hip=-55;sh=-96;head=-114;
      // Reverse sweep and torso rotation create a two-stage weapon combo.
      armF=[jffV34Lerp(68,142,q),jffV34Lerp(14,-56,q)];
      armB=[jffV34Lerp(116,32,q),jffV34Lerp(25,-10,q)];
      legF=[jffV34Lerp(112,125,q),jffV34Lerp(10,5,q)];legB=[jffV34Lerp(78,65,q),-6];
    } else if(mf<=63){
      const q=jffV34Ease((mf-52)/11);lean=jffV34Lerp(30,8,q);hip=-55+2*q;sh=-96;head=-114;
      armF=[jffV34Lerp(142,105,q),jffV34Lerp(-56,28,q)];armB=[jffV34Lerp(32,126,q),jffV34Lerp(-10,12,q)];
      legF=[jffV34Lerp(125,92,q),jffV34Lerp(5,8,q)];legB=[jffV34Lerp(65,98,q),-8];
    } else {
      const q=jffV34Ease((mf-63)/rc);lean=jffV34Lerp(8,4,q)+pulse*.8;hip=-56+q;sh=-96;head=-113;
      armF=[jffV34Lerp(105,65,q),jffV34Lerp(28,31,q)];armB=[jffV34Lerp(126,119,q),jffV34Lerp(12,13,q)];
      legF=[jffV34Lerp(92,87,q),8];legB=[jffV34Lerp(98,97,q),-8];
    }
    P.hipY=hip;P.shY=sh;P.headY=head;P.headX=2+pulse*.6;P.lean=lean;
    P.armF=jffV34Pair(armF,f);P.armB=jffV34Pair(armB,f);P.legF=jffV34Pair(legF,f);P.legB=jffV34Pair(legB,f);
  }

  function jffV34HeianWcsPose(P, f) {
    const mf=f.moveFrame||0, sp=Math.max(1,(f.move&&f.move.startup)||38), total=sp+Math.max(1,(f.move&&f.move.active)||8)+Math.max(1,(f.move&&f.move.recovery)||40);
    const u=mf/sp, pulse=Math.sin(mf*.22);
    let lean=-5, armF=[70,18], armB=[120,14], hip=-57, sh=-95, head=-113, legF=[88,7], legB=[97,-8];
    if(mf<9){
      const q=jffV34Ease(mf/8);lean=jffV34Lerp(-4,-12,q);hip=-57-2*q;sh=-96;head=-115;
      armF=[jffV34Lerp(70,45,q),jffV34Lerp(18,-32,q)];armB=[jffV34Lerp(120,145,q),jffV34Lerp(14,-20,q)];
    } else if(mf<22){
      const q=jffV34Ease((mf-9)/13);lean=jffV34Lerp(-12,-18,q);hip=-59;sh=-99;head=-118;
      // Four arms converge at the chest to establish the spatial target.
      armF=[jffV34Lerp(45,30,q),jffV34Lerp(-32,-58,q)];armB=[jffV34Lerp(145,132,q),jffV34Lerp(-20,-42,q)];
      legF=[80,18];legB=[108,-10];
    } else if(mf<31){
      const q=jffV34Ease((mf-22)/9);lean=jffV34Lerp(-18,4,q);hip=-58;sh=-98;head=-117;
      // Arms open out to frame a horizontal cut instead of swinging down at the floor.
      armF=[jffV34Lerp(30,8,q),jffV34Lerp(-58,-8,q)];armB=[jffV34Lerp(132,155,q),jffV34Lerp(-42,-10,q)];
      legF=[jffV34Lerp(80,68,q),jffV34Lerp(18,24,q)];legB=[jffV34Lerp(108,120,q),-10];
    } else if(mf<sp){
      const q=jffV34Ease((mf-31)/(sp-31));lean=jffV34Lerp(4,17,q);hip=-58;sh=-98;head=-116;
      armF=[jffV34Lerp(8,4,q),jffV34Lerp(-8,12,q)];armB=[jffV34Lerp(155,140,q),jffV34Lerp(-10,22,q)];
      legF=[jffV34Lerp(68,105,q),jffV34Lerp(24,8,q)];legB=[jffV34Lerp(120,82,q),-8];
    } else if(mf<=sp+8){
      const q=jffV34Ease((mf-sp)/8);lean=jffV34Lerp(17,7,q);hip=-57;sh=-97;head=-115;
      armF=[jffV34Lerp(4,60,q),jffV34Lerp(12,26,q)];armB=[jffV34Lerp(140,119,q),jffV34Lerp(22,12,q)];
      legF=[jffV34Lerp(105,90,q),8];legB=[jffV34Lerp(82,97,q),-8];
    } else {
      const q=jffV34Ease((mf-(sp+8))/Math.max(1,total-(sp+8)));lean=jffV34Lerp(7,4,q)+pulse*.6;hip=-57;sh=-95;head=-113;
      armF=[jffV34Lerp(60,66,q),jffV34Lerp(26,32,q)];armB=[jffV34Lerp(119,122,q),jffV34Lerp(12,10,q)];
      legF=[90,8];legB=[97,-8];
    }
    P.hipY=hip;P.shY=sh;P.headY=head;P.headX=1.5+pulse*.5;P.lean=lean;
    P.armF=jffV34Pair(armF,f);P.armB=jffV34Pair(armB,f);P.legF=jffV34Pair(legF,f);P.legB=jffV34Pair(legB,f);
  }

  computePose = function (f) {
    const P = JFF_V34_BASE_COMPUTE_POSE(f);
    if (!f || !P) return P;
    if (G && G.tojiCineX && (f === G.tojiCineX.owner || f === G.tojiCineX.target)) return P;
    if ((f.state === 'IDLE' || f.state === 'WALK') && f.onGround !== false) {
      jffV34LocomotionPose(P, f);
    } else if (f.id === 'heian_sukuna' && f.state === 'ATTACK' && f.move) {
      if (f.moveKey === 's5' || f.move.kind === 'skill5') jffV34HeianHitenPose(P, f);
      else if (f.moveKey === 'wcs' || f.move.kind === 'wcs') jffV34HeianWcsPose(P, f);
    }
    return P;
  };

  /* Extra two-part Hiten sweeps, timed to the existing move's active window.
     This is only presentation: hit frames, damage and cooldown remain unchanged. */
  updateMove = function (f) {
    const isHiten = !!(f && f.id === 'heian_sukuna' && f.state === 'ATTACK' && f.moveKey === 's5');
    JFF_V34_BASE_UPDATE_MOVE(f);
    if (!isHiten || !f || !f.move || f.moveKey !== 's5') return;
    const mf = f.moveFrame, dir = f.facing || 1, x = f.x, y = f.y;
    if (mf === 36) {
      vfxSlashTrail(x-dir*24, y-142, x+dir*154, y-54, '#ff3b55', 10, 25);
      vfxSlashTrail(x-dir*6, y-125, x+dir*136, y-62, '#ffd0d6', 3.2, 19);
      vfxShockwave(x+dir*70,y-94,'#ff334d',74,20);
      camPunch(0.12);
    } else if (mf === 44) {
      vfxSlashTrail(x-dir*20, y-56, x+dir*160, y-144, '#ff243e', 9, 23);
      vfxSlashTrail(x-dir*10, y-65, x+dir*145, y-136, '#fff0f2', 2.8, 18);
      burst(x+dir*82,y-97,12,'#ff5065',5,9,20);
      camPunch(0.10);
    } else if (mf === 52) {
      vfxSlashTrail(x-dir*18, y-102, x+dir*182, y-84, '#ff5368', 11, 24);
      vfxShockwave(x+dir*96,y-91,'#ff334d',105,26);
      flash(0.16,'#ff667a');shake(8);camPunch(0.13);
    }
  };

  window.JFF_V34_UNIQUE_LOCOMOTION_AND_HEIAN_SKILL7 = true;
  console.log('[JFF V34] Unique character idle/run poses and Heian skill 7 animation loaded');
})();