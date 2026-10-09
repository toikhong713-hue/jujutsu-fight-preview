'use strict';
/* JFF V31: tolerant platform landing/top-out + restore Young Gojo Maximum Output Blue.
   Character appearance and other move concepts remain unchanged. */

/* ------------------------------------------------------------------
   A. Surface top-out stabilization
   - Give the fighter a safe inset when topping out onto a roof/branch.
   - Consume held Up briefly so the normal jump handler does not immediately
     bounce the fighter back into the same tree/building edge.
   - Make platform support/landing tolerant to small pixel offsets.
   ------------------------------------------------------------------ */
const JFF_V31_BASE_UPDATE = updateFighter;
const JFF_V31_BASE_SUPPORT = tojiSupportAt;
const JFF_V31_BASE_PHYSICS = physics;

tojiSupportAt = function(x, y) {
  if (Math.abs(y - GROUND) <= 8) return true;
  for (const p of (TOJI_MAP_PLATFORMS || [])) {
    if (x >= p.x - 12 && x <= p.x + p.w + 12 && Math.abs(y - p.y) <= 18) return true;
  }
  return JFF_V31_BASE_SUPPORT(x, y);
};

physics = function(f) {
  const prevX = f.x, prevY = f.y, prevVy = f.vy;
  JFF_V31_BASE_PHYSICS(f);
  // Catch a downward landing if the fighter misses a narrow branch/roof by a few pixels.
  if (prevVy >= 0 && f.y >= prevY) {
    for (const p of (TOJI_MAP_PLATFORMS || [])) {
      const horizontallyNear = f.x >= p.x - 12 && f.x <= p.x + p.w + 12;
      const crossedTop = prevY <= p.y + 2 && f.y >= p.y;
      if (p.y < GROUND && horizontallyNear && crossedTop) {
        f.x = clamp(f.x, p.x - 5, p.x + p.w + 5);
        f.y = p.y; f.vy = 0; f.onGround = true; f.jumps = 2;
        if (f.state === 'FALL' || f.state === 'JUMP') { f.state = f.move ? 'ATTACK' : 'IDLE'; f.stateFrame = 0; }
        break;
      }
    }
  }
};

updateFighter = function(f, inp) {
  const wasWallRunning = !!(f && f.jffWallRunActiveV30);
  const climbedSurface = wasWallRunning ? f.jffWallRunSurfaceV30 : null;
  let safeInput = inp;
  if (f && f.jffTopOutSuppressUpV31 > 0) {
    safeInput = Object.assign({}, inp, { up: 0 });
    f.jffTopOutSuppressUpV31--;
  }
  JFF_V31_BASE_UPDATE(f, safeInput);

  // V30 top-out has just placed the fighter on a real platform. Move to a safe inset
  // instead of leaving the sprite perched on the very edge of the branch/roof.
  if (f && wasWallRunning && climbedSurface && !f.jffWallRunActiveV30 &&
      f.onGround && f.y < GROUND - 4 && climbedSurface.basePlatform && !f.move) {
    const p = climbedSurface.basePlatform;
    const inset = Math.min(36, p.w * 0.28);
    f.x = climbedSurface.side < 0 ? p.x + inset : p.x + p.w - inset;
    f.y = p.y; f.vy = 0; f.onGround = true; f.jumps = 2;
    if (f.state === 'JUMP' || f.state === 'FALL' || f.state === 'IDLE') f.state = 'IDLE';
    f.stateFrame = 0;
    f.jffTopOutSuppressUpV31 = 10;
  }
};

/* ------------------------------------------------------------------
   B. Maximum Output: Blue
   Stationary, water-like orb controlled by Young Gojo. The orb never travels;
   its attraction field pulls the opponent, then one local collapse hit resolves.
   This handler is deliberately separate from Red Counter and other skills.
   ------------------------------------------------------------------ */
const JFF_V31_BLUE_STATE = new WeakMap();
const JFF_V31_BLUE_PALETTE = {
  core: 'rgba(240,253,255,.98)',
  inner: 'rgba(102,220,255,.94)',
  outer: 'rgba(22,145,255,.66)',
  edge: 'rgba(177,244,255,.85)',
  dark: 'rgba(8,92,205,.22)'
};

function jffV31BlueState(f) {
  let s = JFF_V31_BLUE_STATE.get(f);
  if (!s) { s = { frame: 0, orb: null, hitDone: false }; JFF_V31_BLUE_STATE.set(f, s); }
  return s;
}
function jffV31BlueParticle(x, y, vx, vy, color, size, life, shape='streak', rot=0) {
  const p = pget();
  p.active = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy;
  p.maxLife = p.life = life; p.size = size; p.color = color; p.grav = 0;
  p.shape = shape; p.rot = rot; p.vr = 0; p.add = true;
}
function jffV31BlueStream(cx, cy, count, radius=76) {
  if (G.frame % 2) return;
  for (let i=0; i<count; i++) {
    const a = Math.random() * Math.PI * 2, r = radius * (0.65 + Math.random()*.55);
    const x = cx + Math.cos(a)*r, y = cy + Math.sin(a)*r*.56;
    jffV31BlueParticle(x, y, -Math.cos(a)*rnd(1.2,3.5), -Math.sin(a)*rnd(.8,2.4),
      Math.random()<.24 ? '#f5ffff' : '#72ddff', rnd(1.5,3.8), rnd(12,23), 'streak', a);
  }
}
function jffV31BlueDistortion(cx, cy, r, alphaV) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = alphaV;
  ctx.strokeStyle = '#83e5ff'; ctx.lineWidth = 1.3;
  for (let i=0;i<7;i++) {
    const a = G.frame*.025 + i*.77;
    ctx.beginPath(); ctx.ellipse(cx,cy,r*(.62+i*.055),r*(.16+i*.014),a,.15,1.55); ctx.stroke();
  }
  ctx.restore();
}
function jffV31UpdateMaximumBlue(f, m, t, target, face) {
  const s = jffV31BlueState(f); s.frame = t;
  if (t === 1 || !s.orb) {
    const trg = target(); if (trg) face(trg);
    s.hitDone = false;
    s.orb = { x: f.x + f.facing*116, y: f.y-94, r: 7, locked: false };
    f.vx = 0; f.youngMoveTween = null;
    SFX.blue(); floatText(f.x, f.y-194, 'MAXIMUM OUTPUT: BLUE', '#bff8ff', 18, 48);
    youngGojoSetMotion(f, 'focus', 12);
    ring(s.orb.x,s.orb.y,'#66dcff',24,17);
    flash(.07,'#d9f7ff');
  }
  const b = s.orb;
  if (!b) return;
  // Keep Gojo grounded and stationary; only the orb and the force field animate.
  f.vx = 0; f.youngMoveTween = null;
  if (t < 34) {
    const q = Math.max(0,Math.min(1,t/34)); b.r = 7 + (31-7)*(1-Math.pow(1-q,3));
    if (t%3===0) jffV31BlueStream(b.x,b.y,4,44);
  } else if (t < 66) {
    const q = Math.max(0,Math.min(1,(t-34)/32)); b.r = 31 + 17*(q*q*(3-2*q));
    youngGojoSetMotion(f,'infinity',5);
    if (t%2===0) jffV31BlueStream(b.x,b.y,7,64);
  } else {
    b.locked = true; b.r = 48 + Math.sin(t*.085)*1.8;
    if (t===68) { SFX.blue(); flash(.08,'#d9f7ff'); }
    const trg = target();
    if (trg && trg.hp>0 && t>=72 && t<151) {
      // Pull toward the fixed orb with acceleration and damping, not a teleport/snap.
      const dx = b.x - trg.x;
      const pull = Math.max(-2.15,Math.min(2.15,dx*.024));
      trg.vx = Math.max(-8.4,Math.min(8.4,(trg.vx||0)+pull));
      if (Math.abs(dx)>70) trg.vx *= .985;
      if (t%6===0) jffV31BlueStream(b.x,b.y,7,86);
      if (t%9===0) jffV31BlueDistortion(b.x,b.y,38,.20);
    }
    if (t===150 && !s.hitDone) {
      const trgNow = target();
      if (trgNow && trgNow.hp>0) {
        const dx=trgNow.x-b.x, dy=(trgNow.y-68)-b.y;
        // The concentrated field damages once when the opponent has been drawn into range.
        if (Math.hypot(dx,dy) <= 205) {
          resolveHit(f,trgNow,{
            damage:Math.max(24,m.damage||0),hitstun:38,blockstun:20,kbx:16,kby:-9,
            hitstop:15,armorBreak:true,kind:'skill5',meter:16
          },b.x,b.y);
        } else {
          // Strong final attraction gives the stationary core a clear payoff at the edge of range.
          trgNow.vx = Math.max(-10,Math.min(10,(trgNow.vx||0)+Math.sign(dx)*-5));
          trgNow.vy = Math.min(trgNow.vy||0,-3.5);
          resolveHit(f,trgNow,{
            damage:Math.max(18,m.damage||0),hitstun:32,blockstun:18,kbx:13,kby:-8,
            hitstop:12,armorBreak:true,kind:'skill5',meter:12
          },b.x,b.y);
        }
        s.hitDone = true;
      }
      jffV31BlueDistortion(b.x,b.y,114,.72);
      jffV31BlueStream(b.x,b.y,28,120);
      ring(b.x,b.y,'#c8f7ff',116,28); shake(13); camPunch(.18); flash(.16,'#e5faff'); SFX.blue();
    }
  }
  if (t >= 174) {
    JFF_V31_BLUE_STATE.delete(f);
    f.youngMoveTween=null;f.youngMotion='idle';f.youngMotionFrame=0;f.youngMotionTimer=0;
    endMove(f);
  }
}
window.youngGojoMaxBlueV20 = jffV31UpdateMaximumBlue;

function jffV31DrawMaximumBlue(f) {
  if (!f || f.id!=='young_gojo' || !f.move || f.move.kind!=='young_maxblue') return;
  const s=JFF_V31_BLUE_STATE.get(f),b=s&&s.orb;if(!b)return;
  const sx=W/2+(b.x-cam.x)*cam.zoom, sy=H/2+(b.y-cam.y)*cam.zoom, z=cam.zoom, r=b.r*z;
  ctx.save(); ctx.globalCompositeOperation='lighter';
  // layered liquid glass core with thin surface-tension shells
  const grad=ctx.createRadialGradient(sx-r*.22,sy-r*.25,r*.03,sx,sy,r*1.34);
  grad.addColorStop(0,JFF_V31_BLUE_PALETTE.core);grad.addColorStop(.18,JFF_V31_BLUE_PALETTE.inner);
  grad.addColorStop(.48,JFF_V31_BLUE_PALETTE.outer);grad.addColorStop(.76,JFF_V31_BLUE_PALETTE.dark);grad.addColorStop(1,'rgba(0,80,210,0)');
  ctx.globalAlpha=.98;ctx.fillStyle=grad;ctx.beginPath();ctx.arc(sx,sy,r*1.2,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=JFF_V31_BLUE_PALETTE.edge;ctx.lineWidth=Math.max(1,1.3*z);
  for(let i=0;i<5;i++){
    const rr=r*(.36+i*.13),wave=Math.sin(G.frame*.105+i*1.35)*r*.055;
    ctx.globalAlpha=.46-i*.045;ctx.beginPath();ctx.ellipse(sx+wave,sy,r*.76,rr,.22+i*.48,0,Math.PI*2);ctx.stroke();
  }
  // A curved bright specular stroke keeps it liquid-like, not a flat blue circle.
  ctx.globalAlpha=.85;ctx.strokeStyle='#f3ffff';ctx.lineWidth=Math.max(1,1.5*z);ctx.beginPath();
  ctx.moveTo(sx-r*.52,sy-r*.18);ctx.quadraticCurveTo(sx-r*.12,sy-r*.72,sx+r*.36,sy-r*.26);ctx.stroke();
  ctx.globalAlpha=.25;ctx.strokeStyle='#67dcff';ctx.lineWidth=Math.max(1,2*z);ctx.beginPath();
  ctx.ellipse(sx,sy,r*1.62,r*.62,G.frame*.008,0,Math.PI*2);ctx.stroke();
  // Attraction filaments visibly converge on the stationary orb.
  ctx.globalAlpha=.50;ctx.strokeStyle='#8beaff';ctx.lineWidth=Math.max(1,1.2*z);
  for(let i=0;i<7;i++){
    const a=G.frame*.018+i*Math.PI*2/7,rr=r*(1.65+(i%3)*.22);
    ctx.beginPath();ctx.moveTo(sx+Math.cos(a)*rr*1.7,sy+Math.sin(a)*rr*.72);
    ctx.quadraticCurveTo(sx+Math.cos(a+.45)*rr*.55,sy+Math.sin(a+.45)*rr*.22,sx+Math.cos(a+.18)*r*.58,sy+Math.sin(a+.18)*r*.35);ctx.stroke();
  }
  if (b.locked) {
    ctx.globalAlpha=.28;ctx.strokeStyle='#d9fbff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(sx,sy,r*1.95,G.frame*.025,G.frame*.025+Math.PI*1.45);ctx.stroke();
  }
  ctx.restore();
}
const JFF_V31_BASE_RENDER = window.render;
window.render = function() {
  JFF_V31_BASE_RENDER();
  if (!G || G.mode==='menu') return;
  for (const f of (G.fighters||[])) jffV31DrawMaximumBlue(f);
};

console.log('[JFF V31] Top-out support + Young Gojo Maximum Output Blue restored');