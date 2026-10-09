'use strict';
/* JFF V33: Gojo Satoru awakening + Hollow Purple polish.
   Lightweight Canvas 2D only. Adds a short awakening presentation, stronger
   awakened Limitless skills, a Blue/Red convergence charge for Purple, and a
   clearer projectile/impact. Keeps the normal Gojo and Young Gojo systems separate. */
(() => {
  const JFF_V33_BASE_UPDATE_FIGHTER = updateFighter;
  const JFF_V33_BASE_RESET_FIGHTER = resetFighter;
  const JFF_V33_BASE_START_MOVE = startMove;
  const JFF_V33_BASE_SPAWN_PROJECTILE = spawnProjectile;
  const JFF_V33_BASE_UPDATE_PROJECTILES = updateProjectiles;
  const JFF_V33_BASE_DRAW_FIGHTER = drawFighter;
  const JFF_V33_BASE_DRAW_PROJECTILES = drawProjectiles;
  const JFF_V33_BASE_RENDER = window.render;

  const jffV33Clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const jffV33Ease = (v) => { v = jffV33Clamp(v, 0, 1); return v * v * (3 - 2 * v); };

  /* Awakening: a distinct brief presentation on top of the original meter/low-HP rules. */
  updateFighter = function(f, inp) {
    const wasAwakened = !!(f && f.awakened);
    JFF_V33_BASE_UPDATE_FIGHTER(f, inp);
    if (!f || f.id !== 'gojo') return;
    if (!f.awakened) {
      delete f.gojoAwakeningPresentationV33;
      return;
    }
    if (!wasAwakened && f.awakened) {
      f.gojoAwakeningPresentationV33 = 0;
      floatText(f.x, f.y - 218, 'LIMITLESS // AWAKENED', '#c9f4ff', 23, 72);
      ring(f.x, f.y - 64, '#7fd8ff', 104, 38);
      vfxShockwave(f.x, f.y - 70, '#b8f2ff', 96, 28);
      burst(f.x, f.y - 70, 30, '#8be5ff', 6, 12, 30);
      burst(f.x, f.y - 70, 12, '#ffffff', 4, 8, 22);
      camPunch(0.15);
    } else if (Number.isFinite(f.gojoAwakeningPresentationV33)) {
      f.gojoAwakeningPresentationV33++;
      if (f.gojoAwakeningPresentationV33 > 78) delete f.gojoAwakeningPresentationV33;
    }
  };

  resetFighter = function(f, x, facing) {
    JFF_V33_BASE_RESET_FIGHTER(f, x, facing);
    if (f) delete f.gojoAwakeningPresentationV33;
  };

  /* A real, readable power bump while awakened. Costs and cooldowns stay unchanged. */
  startMove = function(f, key, isBF) {
    const ok = JFF_V33_BASE_START_MOVE(f, key, isBF);
    if (!ok || !f || f.id !== 'gojo' || !f.awakened || !f.move) return ok;
    const m = f.move;
    if (key === 's1') {
      f.move = Object.assign({}, m, {
        name: 'Blue: Limitless Collapse', damage: 5, hitstun: 11,
        field: Object.assign({}, m.field || {}, { pull: 1.32, radius: 154 }),
        gojoAwakenedV33: true
      });
    } else if (key === 's2') {
      f.move = Object.assign({}, m, {
        name: 'Red: Reversal Burst', damage: 30, hitstun: 35, kbx: 17, hitstop: 14,
        gojoAwakenedV33: true
      });
    } else if (key === 's3') {
      f.move = Object.assign({}, m, {
        name: 'Hollow Purple: Limitless Collapse',
        projectile: Object.assign({}, m.projectile || {}, {
          damage: 56, hitstun: 49, kbx: 20, kby: -10,
          speed: 16.5, w: 118, h: 90, life: 150, hitstop: 19,
          armorBreak: true
        }),
        gojoAwakenedV33: true
      });
    }
    return ok;
  };

  /* Tag Gojo's Purple projectile so its visual/impact pass stays character-specific. */
  spawnProjectile = function(f, pd, offX, offY) {
    const p = JFF_V33_BASE_SPAWN_PROJECTILE(f, pd, offX, offY);
    if (p && f && f.id === 'gojo' && f.moveKey === 's3' && pd && pd.type === 'purple') {
      p.gojoPurpleV33 = true;
      p.gojoPurpleAwakenedV33 = !!(f.awakened && f.move && f.move.gojoAwakenedV33);
    }
    return p;
  };

  function jffV33Orb(x, y, r, inner, mid, outer) {
    const g = ctx.createRadialGradient(x - r * 0.28, y - r * 0.30, Math.max(1, r * 0.04), x, y, r * 1.18);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.22, inner);
    g.addColorStop(0.62, mid);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.12, r * 0.92, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = inner; ctx.globalAlpha *= 0.75; ctx.lineWidth = Math.max(1, r * 0.07);
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.78, r * 0.54, 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha /= 0.75;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.ellipse(x - r * 0.18, y - r * 0.24, Math.max(1.5, r * 0.20), Math.max(1, r * 0.10), -0.45, 0, Math.PI * 2); ctx.fill();
  }

  function jffV33DrawAwakeningAura(f) {
    const raw = f.gojoAwakeningPresentationV33;
    if (f.id !== 'gojo' || !Number.isFinite(raw) || raw > 78) return;
    const t = raw, q = jffV33Ease(Math.min(1, t / 22));
    const x = f.x, y = f.y - 72;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (1 - t / 86) * 0.66;
    ctx.strokeStyle = '#9aeaff'; ctx.lineWidth = 2.2;
    for (let i = 0; i < 3; i++) {
      const phase = t * (0.055 + i * 0.012) + i * 1.6;
      ctx.beginPath();
      ctx.ellipse(x, y, 36 + q * 40 + i * 13, 62 + q * 28 + i * 8, phase, phase, phase + Math.PI * 1.48);
      ctx.stroke();
    }
    ctx.globalAlpha = (1 - t / 82) * 0.22;
    const halo = ctx.createRadialGradient(x, y, 12, x, y, 138);
    halo.addColorStop(0, 'rgba(190,245,255,0.75)');
    halo.addColorStop(0.45, 'rgba(80,190,255,0.25)');
    halo.addColorStop(1, 'rgba(80,190,255,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.ellipse(x, y, 96, 125, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function jffV33DrawPurpleCharge(f) {
    if (!f || f.id !== 'gojo' || f.state !== 'ATTACK' || f.moveKey !== 's3' || !f.move) return;
    const startup = Math.max(1, f.move.startup || 60);
    const t = jffV33Clamp(f.moveFrame / startup, 0, 1);
    if (t >= 1) return;
    const fd = f.facing || 1;
    const cx = f.x + fd * 61, cy = f.y - 116;
    const converge = jffV33Ease((t - 0.52) / 0.42);
    const spread = 34 * (1 - converge) + 3;
    const pulse = 0.9 + Math.sin((f.animT || 0) * 0.25) * 0.10;
    const rb = 9 + 10 * t, rr = 9 + 10 * t;
    const bx = cx - fd * spread, rx = cx + fd * spread;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.94;
    // Converging filaments give the charge a readable direction without expensive particles.
    if (t > 0.28) {
      ctx.globalAlpha = 0.18 + t * 0.28;
      ctx.lineWidth = 1.2 + t * 1.5;
      for (let i = 0; i < 5; i++) {
        const dy = (i - 2) * (8 + (1 - converge) * 8);
        ctx.strokeStyle = i % 2 ? '#96eaff' : '#ffc0dc';
        ctx.beginPath(); ctx.moveTo(bx - fd * 16, cy + dy); ctx.quadraticCurveTo(cx, cy + dy * 0.25, rx + fd * 10, cy - dy * 0.5); ctx.stroke();
      }
    }
    ctx.globalAlpha = 0.88;
    jffV33Orb(bx, cy + Math.sin(f.animT * 0.17) * 3, rb * pulse, '#8de6ff', '#257ee9', 'rgba(20,70,190,0)');
    jffV33Orb(rx, cy + Math.cos(f.animT * 0.15) * 3, rr * pulse, '#ffb6d0', '#ff3e74', 'rgba(150,0,55,0)');
    if (t > 0.7) {
      const q = jffV33Ease((t - 0.7) / 0.3), pr = 5 + q * 18;
      ctx.globalAlpha = 0.42 + q * 0.45;
      const pg = ctx.createRadialGradient(cx, cy, 1, cx, cy, pr * 2.8);
      pg.addColorStop(0, '#ffffff'); pg.addColorStop(0.27, '#f8eaff'); pg.addColorStop(0.58, '#ae73ff'); pg.addColorStop(1, 'rgba(130,50,255,0)');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(cx, cy, pr * 1.6, pr * 1.15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.5 + q * 0.3; ctx.strokeStyle = '#f0e2ff'; ctx.lineWidth = 1.4;
      for (let i = 0; i < 7; i++) {
        const a = f.animT * 0.16 + i * Math.PI * 2 / 7;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (pr + 18), cy + Math.sin(a) * (pr + 7));
        ctx.lineTo(cx + Math.cos(a) * (pr * 0.35), cy + Math.sin(a) * pr * 0.32); ctx.stroke();
      }
    }
    // Keep a narrow spatial lens around the hand; avoids the old flat-circle look.
    ctx.globalAlpha = 0.22 + t * 0.32; ctx.strokeStyle = '#e7d4ff'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, cy, 52 + 13 * t, 20 + 7 * t, Math.sin(f.animT * 0.08) * 0.12, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  drawFighter = function(f) {
    jffV33DrawAwakeningAura(f);
    JFF_V33_BASE_DRAW_FIGHTER(f);
    jffV33DrawPurpleCharge(f);
  };

  /* Add a moving spatial wake behind the projectile while remaining Canvas-2D/lightweight. */
  drawProjectiles = function() {
    JFF_V33_BASE_DRAW_PROJECTILES();
    if (!G || !G.projectiles) return;
    for (const p of G.projectiles) {
      if (!p.gojoPurpleV33 || p.life <= 0) continue;
      const dir = Math.sign(p.vx) || 1;
      const scale = p.gojoPurpleAwakenedV33 ? 1.18 : 1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = p.gojoPurpleAwakenedV33 ? 0.58 : 0.42;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#9f68ff'; ctx.lineWidth = 12 * scale;
      ctx.beginPath(); ctx.moveTo(-dir * 142 * scale, 0); ctx.quadraticCurveTo(-dir * 76 * scale, -12, dir * 18 * scale, 0); ctx.stroke();
      ctx.strokeStyle = '#e5d2ff'; ctx.lineWidth = 4 * scale;
      ctx.beginPath(); ctx.moveTo(-dir * 124 * scale, 0); ctx.quadraticCurveTo(-dir * 62 * scale, 4, dir * 30 * scale, 0); ctx.stroke();
      ctx.globalAlpha = 0.52; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        const a = p.t * 0.11 + i * Math.PI * 2 / 7;
        ctx.beginPath(); ctx.moveTo(-dir * (30 + i * 10) * scale, Math.sin(a) * 18 * scale); ctx.lineTo(dir * 18 * scale, 0); ctx.stroke();
      }
      const r = (p.gojoPurpleAwakenedV33 ? 74 : 62) + Math.sin(p.t * 0.25) * 4;
      ctx.globalAlpha = 0.26; ctx.strokeStyle = '#c89cff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, r * 1.42, r * 0.76, p.t * 0.025, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  };

  updateProjectiles = function() {
    const watched = G && G.projectiles ? G.projectiles.filter(p => p.gojoPurpleV33 && !p.hit) : [];
    JFF_V33_BASE_UPDATE_PROJECTILES();
    for (const p of watched) {
      if (!p.hit || p.gojoPurpleImpactV33) continue;
      p.gojoPurpleImpactV33 = true;
      const power = p.gojoPurpleAwakenedV33;
      vfxShockwave(p.x, p.y, '#bd8cff', power ? 184 : 148, 34);
      vfxShockwave(p.x, p.y, '#f6edff', power ? 126 : 96, 27);
      ring(p.x, p.y, '#ffffff', power ? 104 : 82, 24);
      burst(p.x, p.y, power ? 28 : 22, '#c07bff', 8, 13, 30);
      burst(p.x, p.y, 12, '#ffffff', 5, 9, 22);
      flash(power ? 0.42 : 0.27, '#d9bdff');
      shake(power ? 16 : 12); camPunch(power ? 0.24 : 0.17);
      G.slowmoTarget = Math.max(G.slowmoTarget || 0, power ? 12 : 7);
    }
  };

  /* Tiny screen-space accent during awakening, layered after the existing V31 render wrapper. */
  window.render = function() {
    JFF_V33_BASE_RENDER();
    if (!G || G.mode === 'menu') return;
    const f = (G.fighters || []).find(q => q && q.id === 'gojo' && Number.isFinite(q.gojoAwakeningPresentationV33) && q.gojoAwakeningPresentationV33 <= 78);
    if (!f) return;
    const t = f.gojoAwakeningPresentationV33;
    const fade = Math.min(1, t / 8, (78 - t) / 18);
    if (fade <= 0) return;
    ctx.save(); ctx.globalAlpha = Math.max(0, fade) * 0.48; ctx.fillStyle = '#030915';
    ctx.fillRect(0, 0, W, 23); ctx.fillRect(0, H - 28, W, 28);
    ctx.globalAlpha = Math.max(0, fade) * 0.92; ctx.textAlign = 'center';
    ctx.font = '800 11px Consolas, monospace'; ctx.fillStyle = '#a9efff';
    ctx.fillText('LIMITLESS // AWAKENED', W / 2, H - 10);
    ctx.restore();
  };

  console.log('[JFF V33] Gojo awakening + Hollow Purple polish loaded');
})();