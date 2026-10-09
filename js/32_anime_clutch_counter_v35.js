'use strict';
/* JFF v35: precision guard -> anime comeback counter. Small, event-driven Canvas 2D effects only. */
(function(){
  if (window.JFF_V35_CLUTCH_COUNTER) return;

  const baseResolveHit = window.resolveHit;
  const baseStartMove = window.startMove;
  const baseUpdateFighter = window.updateFighter;
  const baseRender = window.render;
  if (typeof baseResolveHit !== 'function' || typeof baseStartMove !== 'function' ||
      typeof baseUpdateFighter !== 'function' || typeof baseRender !== 'function') {
    console.warn('[JFF V35] Clutch Counter not installed: a base function was not found.');
    return;
  }

  const JFF_V35_COLORS = {
    gojo: '#8fe8ff', young_gojo: '#bdefff', sukuna: '#ff5368', yuji: '#ff7c55',
    yuta: '#d0b2ff', hakari: '#ffd166', toji: '#e8edf2', heian_sukuna: '#ff334f',
    the_strongest_today: '#00e5ff'
  };
  const jffV35Color = f => JFF_V35_COLORS[f && f.id] || '#f1f5ff';
  const jffV35Ready = f => !!(f && f.jffClutchUntil && window.G && G.frame <= f.jffClutchUntil);

  function jffV35ClearCounter(f) {
    if (!f) return;
    f.jffClutchUntil = 0;
    f.jffClutchPower = 1;
    f.jffClutchComeback = false;
  }

  function jffV35PerfectGuardFX(f, comeback) {
    const x=f.x, y=f.y-72, color=jffV35Color(f), dir=f.facing||1;
    /* High contrast, few particles: one signature ring, one inner ring and a compact spark fan. */
    ring(x,y,color,comeback?68:48,comeback?34:26);
    ring(x,y,'#ffffff',comeback?34:24,comeback?24:18);
    spark(x+dir*8,y,comeback?12:8,'#ffffff',comeback?7.0:5.2,comeback?4.5:3.5,comeback?22:16,0,'bolt');
    if (f.id==='gojo' || f.id==='young_gojo' || f.id==='the_strongest_today') {
      vfxSlashTrail(x-dir*48,y+18,x+dir*64,y-14,color,comeback?5.5:3.5,comeback?20:14);
      vfxSlashTrail(x-dir*38,y-19,x+dir*52,y+9,'#ffffff',1.8,12);
    } else if (f.id==='toji' || f.id==='sukuna' || f.id==='yuji' || f.id==='heian_sukuna') {
      vfxSlashTrail(x-dir*24,y-27,x+dir*76,y+18,color,comeback?6.5:4.0,comeback?22:15);
      if(comeback) vfxSlashTrail(x-dir*12,y+22,x+dir*66,y-31,'#ffffff',2.0,16);
    } else {
      ring(x+dir*15,y,color,comeback?27:18,18);
    }
    if (comeback) {
      flash(0.22,color);
      shake(12); camPunch(0.17);
      G.hitstop=Math.max(G.hitstop,16);
      G.slowmoTarget=Math.max(G.slowmoTarget||0,10);
      floatText(x,y-95,'TURN THE TIDE!',color,22,58);
    } else {
      camPunch(0.09);
      floatText(x,y-82,'PERFECT GUARD',color,16,42);
    }
  }

  function jffV35CounterHitFX(attacker, defender, hx, hy, comeback) {
    const color=jffV35Color(attacker);
    const x=Number.isFinite(hx)?hx:(defender.x+attacker.x)*0.5;
    const y=Number.isFinite(hy)?hy:defender.y-70;
    ring(x,y,color,comeback?64:42,comeback?27:19);
    spark(x,y,comeback?11:7,'#ffffff',comeback?7.4:5.6,comeback?4.8:3.5,comeback?22:16,0,'bolt');
    const dir=attacker.facing||1;
    vfxSlashTrail(x-dir*58,y+25,x+dir*68,y-30,color,comeback?8:5.2,comeback?24:17);
    vfxSlashTrail(x-dir*36,y+30,x+dir*48,y-21,'#ffffff',2.0,14);
    G.hitstop=Math.max(G.hitstop,comeback?13:10);
    camPunch(comeback?0.18:0.11);
    shake(comeback?10:5);
    if(comeback) flash(0.15,color);
    floatText(x,y-56,comeback?'CLUTCH COUNTER!':'COUNTER HIT',color,comeback?20:15,comeback?50:36);
  }

  /* Existing parry input is the timing test. A successful parry opens a short follow-up window. */
  window.resolveHit = function(attacker, defender, mv, hx, hy) {
    if (!attacker || !defender || typeof baseResolveHit !== 'function') {
      return baseResolveHit.apply(this, arguments);
    }
    const clutch = attacker.jffClutchMoveActive || null;
    let resolvedMove = mv;
    if (clutch) {
      resolvedMove = Object.assign({}, mv, {
        damage: Math.max(1, Math.round((mv.damage || 1) * clutch.multiplier)),
        hitstop: Math.max(mv.hitstop || 0, clutch.comeback ? 13 : 10)
      });
    }
    const result = baseResolveHit.call(this, attacker, defender, resolvedMove, hx, hy);

    if (result === 'parry') {
      const hpRatio = defender.maxHp > 0 ? defender.hp / defender.maxHp : 1;
      const comeback = hpRatio <= 0.25 && G.frame >= (defender.jffClutchCooldownUntil || 0);
      defender.jffClutchUntil = G.frame + (comeback ? 60 : 42);
      defender.jffClutchPower = comeback ? 1.24 : 1.16;
      defender.jffClutchComeback = comeback;
      if (comeback) defender.jffClutchCooldownUntil = G.frame + 300;
      jffV35PerfectGuardFX(defender, comeback);
    }

    if (clutch && ['hit','block','armor','infinity','parry','red_counter'].includes(result)) {
      attacker.jffClutchMoveActive = null;
      attacker.jffClutchMoveRef = null;
      if (result === 'hit') jffV35CounterHitFX(attacker, defender, hx, hy, !!clutch.comeback);
      else if (result === 'block') {
        const c=jffV35Color(attacker);
        ring(hx,hy,c,25,13);
        floatText(hx,hy-24,'COUNTER BLOCKED','#d9e5f5',12,28);
      }
    }

    if (result === 'hit' || result === 'red_counter') {
      /* If you get caught before spending the window, you lose the stored counter opportunity. */
      jffV35ClearCounter(defender);
    }
    return result;
  };

  /* The next valid attack spends the window. Buff is modest normally and stronger only at low HP. */
  window.startMove = function(f, key, isBF) {
    const wasReady = jffV35Ready(f);
    const power = wasReady ? (f.jffClutchPower || 1.16) : 1;
    const comeback = wasReady && !!f.jffClutchComeback;
    const ok = baseStartMove.call(this, f, key, isBF);
    if (ok && wasReady) {
      f.jffClutchMoveActive = {multiplier:power, comeback};
      f.jffClutchMoveRef = f.move || null;
      jffV35ClearCounter(f);
      const c=jffV35Color(f);
      ring(f.x+f.facing*24,f.y-74,c,26,16);
      spark(f.x+f.facing*25,f.y-74,4,'#ffffff',3.8,3,12,0,'bolt');
      floatText(f.x,f.y-166,comeback?'COMEBACK CHARGED':'COUNTER READY',c,13,32);
    }
    return ok;
  };

  /* Clear stale buffs if the player is interrupted or their chosen move finishes without a hit. */
  window.updateFighter = function(f, inp) {
    const oldState=f&&f.state;
    const oldMove=f&&f.move;
    const result=baseUpdateFighter.call(this,f,inp);
    if (f) {
      if (f.hp<=0 || f.state==='DEFEAT') {
        jffV35ClearCounter(f); f.jffClutchMoveActive=null; f.jffClutchMoveRef=null;
      } else if (f.jffClutchMoveActive) {
        const ref=f.jffClutchMoveRef;
        if ((ref && oldMove===ref && f.move!==ref) || (oldState==='ATTACK' && f.state!=='ATTACK' && f.move===null)) {
          f.jffClutchMoveActive=null; f.jffClutchMoveRef=null;
        }
      }
      if (f.jffClutchUntil && G.frame > f.jffClutchUntil) jffV35ClearCounter(f);
    }
    return result;
  };

  function jffV35DrawHud() {
    if (!window.G || G.mode==='menu' || !Array.isArray(G.fighters)) return;
    const active=G.fighters.filter(f=>jffV35Ready(f));
    if (!active.length) return;
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.textAlign='center';
    active.slice(0,2).forEach(f=>{
      const p1=G.fighters[0]===f;
      const x=p1?310:970, y=116;
      const color=jffV35Color(f);
      const comeback=!!f.jffClutchComeback;
      const remain=Math.max(0,f.jffClutchUntil-G.frame);
      const total=comeback?60:42;
      const progress=clamp(remain/total,0,1);
      ctx.globalAlpha=0.92;
      ctx.fillStyle='rgba(5,10,22,0.80)';ctx.fillRect(x-116,y-26,232,52);
      ctx.strokeStyle=color;ctx.lineWidth=1.4;ctx.strokeRect(x-116,y-26,232,52);
      ctx.fillStyle=color;ctx.font='800 12px Segoe UI,system-ui,sans-serif';
      ctx.fillText(comeback?'CLUTCH COUNTER READY':'PERFECT GUARD // COUNTER',x,y-9);
      ctx.globalAlpha=0.72;ctx.fillStyle='#eef4ff';ctx.font='10px Segoe UI,system-ui,sans-serif';
      ctx.fillText('PRESS ANY ATTACK',x,y+7);
      ctx.globalAlpha=0.88;ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(x-104,y+17,208,3);
      ctx.fillStyle=color;ctx.fillRect(x-104,y+17,208*progress,3);
    });
    ctx.restore();
  }

  window.render = function() {
    baseRender.apply(this, arguments);
    jffV35DrawHud();
  };

  window.JFF_V35_CLUTCH_COUNTER = true;
  console.log('[JFF V35] Perfect Guard -> Clutch Counter loaded (low-cost event-driven VFX)');
})();