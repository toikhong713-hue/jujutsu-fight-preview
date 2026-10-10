'use strict';
/* JFF v39 hybrid renderer gate.
   Canvas2D remains the authoritative gameplay renderer. PixiJS is downloaded only
   when the device is not classified as low-end and an accelerated WebGL context is
   available. The VFX overlay runs at a capped cadence on Canvas2D fallback. */
(function(){
  if (window.JFF_V37_PIXI_VFX) return;
  const JFF_V37_LOW_END = ((navigator.hardwareConcurrency || 0) > 0 && navigator.hardwareConcurrency <= 2) || ((navigator.deviceMemory || 0) > 0 && navigator.deviceMemory <= 4);
  window.JFF_V37_PIXI_VFX = { ready:false, renderer:'booting', quality:JFF_V37_LOW_END?'low':'high', avgCost:0, lowEndProfile:JFF_V37_LOW_END };

  const W0 = 1280, H0 = 720;
  const wrap = document.getElementById('wrap');
  if (!wrap) return;
  const clampN = (v,a,b) => Math.max(a,Math.min(b,v));
  const hexN = c => (parseInt(String(c||'#ffffff').replace('#',''),16) || 0xffffff);
  const PALETTE = {
    gojo:{a:'#8deaff',b:'#f8ffff',c:'#4a8dff'}, young_gojo:{a:'#b5f1ff',b:'#ffffff',c:'#66baff'},
    sukuna:{a:'#ff4e68',b:'#fff0f2',c:'#aa1739'}, yuji:{a:'#ff8b60',b:'#fff2e6',c:'#ea3e57'},
    yuta:{a:'#d4b7ff',b:'#fffaff',c:'#9076ee'}, hakari:{a:'#ffd166',b:'#fff7d9',c:'#ff61bd'},
    toji:{a:'#d2e3ea',b:'#ffffff',c:'#6f9bac'}, heian_sukuna:{a:'#ff3458',b:'#fff0f2',c:'#85182f'},
    the_strongest_today:{a:'#00e5ff',b:'#ffffff',c:'#ffd166'}
  };
  const activeFx = [];
  const lastHp = new WeakMap();
  let app = null, stage = null, pixiG = null, fighterLayers = [], projectileG = null, impactG = null;
  let shaderAvailable = false, shaderFilters = [], fallbackCanvas = null, fallbackCtx = null;
  let lastMeasure = 0, costSum = 0, costCount = 0, slowFrames = 0, severeCostChecks = 0;
  let baseRender = window.render;
  let frameNumber = 0, lastFallbackFrame = 0;

  const fallbackStyle = 'position:absolute;left:0;top:0;width:1280px;height:720px;z-index:1;pointer-events:none;display:block;';
  fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.id = 'jffVfxFallbackCanvas'; fallbackCanvas.width = W0; fallbackCanvas.height = H0;
  fallbackCanvas.style.cssText = fallbackStyle;
  wrap.appendChild(fallbackCanvas);
  fallbackCtx = fallbackCanvas.getContext('2d', {alpha:true, desynchronized:true});

  const badge = document.createElement('div');
  badge.id = 'jffVfxEngineBadge';
  badge.style.cssText = 'display:none;position:absolute;right:14px;top:92px;z-index:9;padding:6px 9px;border:1px solid rgba(130,210,255,.28);background:rgba(3,9,18,.84);color:#b9ddf6;font:700 9px/1.4 Consolas,monospace;letter-spacing:1px;pointer-events:none;white-space:nowrap;';
  badge.textContent = 'VFX ENGINE // BOOTING';
  wrap.appendChild(badge);

  function point(wx,wy){
    const zoom = (typeof cam!=='undefined' && Number.isFinite(cam.zoom) && cam.zoom>0) ? cam.zoom : 1;
    const cx = typeof cam!=='undefined' && Number.isFinite(cam.x) ? cam.x : W0/2;
    const cy = typeof cam!=='undefined' && Number.isFinite(cam.y) ? cam.y : H0/2;
    const sx = typeof G!=='undefined' ? (G.shakeX||0) : 0;
    const sy = typeof G!=='undefined' ? (G.shakeY||0) : 0;
    return {x:W0/2+sx+(wx-cx)*zoom,y:H0/2+sy+(wy-cy)*zoom,scale:zoom};
  }
  function catOf(f){
    const m=f&&f.move; if(!m)return '';
    const raw=((m.name||'')+' '+(m.kind||'')+' '+(f.moveKey||'')).toLowerCase();
    if(/purple|hollow/.test(raw))return 'purple';
    if(/maxblue|young_maxblue|\bblue\b|infinity|limitless|spatial shift/.test(raw))return 'blue';
    if(/\bred\b|repulsion|counterforce/.test(raw))return 'red';
    if(/black.?flash|blackflash/.test(raw)||f.blackFlash)return 'blackflash';
    if(/fuga|flame|fire|kamutoke|lightning/.test(raw))return 'fuga';
    if(/dismantle|cleave|slash|hiten|wcs|world.cut|katana|spear|chain|cloud/.test(raw))return 'slash';
    if(/jackpot|gamble|roulette|restless/.test(raw))return 'jackpot';
    if(/domain|void|shrine|overdrive|transform/.test(raw))return 'domain';
    return '';
  }
  function colorFor(f){ return PALETTE[(f&&f.id)] || {a:'#a9e5ff',b:'#ffffff',c:'#7895bb'}; }
  function startHitEvent(f, amount){
    const opp=f&&f.opp; const c=colorFor(opp||f).a;
    activeFx.push({kind:amount>=24?'heavyHit':'hit',x:f.x,y:f.y-76,color:c,life:amount>=24?18:12,max:amount>=24?18:12,seed:Math.random()*6.28});
    if(activeFx.length>18)activeFx.splice(0,activeFx.length-18);
  }
  function watchHitEvents(){
    if(typeof G==='undefined'||!Array.isArray(G.fighters))return;
    for(const f of G.fighters){
      if(!f)continue;
      const prev=lastHp.get(f);
      if(Number.isFinite(prev)&&Number.isFinite(f.hp)&&f.hp<prev-0.01){startHitEvent(f,prev-f.hp);}
      lastHp.set(f,Number.isFinite(f.hp)?f.hp:prev);
    }
  }

  function drawArc(g,x,y,r,a0,a1,color,width,alpha){
    g.arc(x,y,Math.max(0.1,r),a0,a1).stroke({color:hexN(color),width:Math.max(.6,width),alpha:clampN(alpha,0,1),cap:'round'});
  }
  function line(g,x1,y1,x2,y2,color,width,alpha){
    g.moveTo(x1,y1).lineTo(x2,y2).stroke({color:hexN(color),width:Math.max(.5,width),alpha:clampN(alpha,0,1),cap:'round'});
  }
  function diamond(g,x,y,r,color,alpha,rotation){
    const a=rotation||0, pts=[];
    for(let i=0;i<4;i++){const q=a+i*Math.PI/2;pts.push(x+Math.cos(q)*r,y+Math.sin(q)*r*1.35);}
    g.poly(pts).closePath().stroke({color:hexN(color),width:1.15,alpha:clampN(alpha,0,1)});
  }
  function renderSignature(g,core,f,now,quality){
    g.clear(); if(core)core.clear();
    if(typeof G==='undefined'||G.mode==='menu'||G.paused||!f||!f.move||f.state!=='ATTACK')return;
    const cat=catOf(f); if(!cat)return;
    const m=f.move, mf=Math.max(0,f.moveFrame||0), start=Math.max(1,m.startup||8), act=Math.max(1,m.active||8);
    const charge=clampN(mf/start,0,1), actT=clampN((mf-start)/act,0,1), moving=mf>=start;
    const c=colorFor(f), dir=f.facing||1, z=point(f.x,f.y-82), scale=z.scale;
    const x=z.x+dir*34*scale, y=z.y, t=now*.0018+mf*.075;
    const s=quality==='low'?.68:1;
    const rings=quality==='low'?3:5;
    if(cat==='blue'){
      const r=(13+charge*21)*scale;
      for(let i=0;i<rings;i++)drawArc(g,x,y,r+i*5*scale,t+i*1.7,t+i*1.7+Math.PI*(1.1+i%2*.32),i%2?c.a:c.c,1.1*scale,.55-i*.055);
      for(let i=0;i<(quality==='low'?2:4);i++){
        const a=t*1.15+i*Math.PI/2.0, rr=(r+11*scale)*(1+.06*Math.sin(t+i));
        diamond(g,x+Math.cos(a)*rr,y+Math.sin(a)*rr*.62,3.2*scale,i%2?c.b:c.a,.85,t+i);
      }
      if(core){core.circle(x,y,Math.max(2.5,r*.45)).fill({color:hexN(c.b),alpha:.45});core.circle(x,y,Math.max(1.5,r*.26)).fill({color:hexN(c.a),alpha:.85});}
      for(let i=0;i<2;i++){
        const a0=t*(i?-.8:1)+i*Math.PI;
        let px=x+Math.cos(a0)*r*1.5,py=y+Math.sin(a0)*r*.7;
        for(let j=1;j<=8;j++){const q=j/8, aa=a0+q*1.25, rr=r*(1.5-q*.9);const nx=x+Math.cos(aa)*rr,ny=y+Math.sin(aa)*rr*.72;line(g,px,py,nx,ny,c.a,1.3*scale,.54*(1-q));px=nx;py=ny;}
      }
    }else if(cat==='purple'){
      const r=(22+charge*13)*scale;
      for(let i=0;i<rings;i++)drawArc(g,x-dir*5*scale,y,r+i*4.5*scale,-t*(i%2?1:-1)+i,-t*(i%2?1:-1)+i+Math.PI*(.64+i%3*.12),i%2?c.c:c.a,(1.1+i*.12)*scale,.7-i*.09);
      for(let i=0;i<4;i++){const a=t*.7+i*Math.PI/2;line(g,x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8,x+Math.cos(a)*(r+21*scale),y+Math.sin(a)*(r+21*scale),i%2?c.b:c.a,1*scale,.62);}
      if(core){core.circle(x,y,r*.40).fill({color:0x9b63ff,alpha:.48});core.circle(x,y,r*.24).fill({color:0xffffff,alpha:.85});core.circle(x,y,r*.11).fill({color:0xf7f3ff,alpha:1});}
      if(moving && actT>.12){line(g,x-dir*65*scale,y+20*scale,x+dir*(125+actT*80)*scale,y-24*scale,c.c,7*scale,.18);line(g,x-dir*55*scale,y+15*scale,x+dir*(122+actT*80)*scale,y-20*scale,c.b,1.6*scale,.85);}
    }else if(cat==='red'){
      const r=(18+charge*13)*scale;
      for(let i=0;i<3;i++)drawArc(g,x,y,r+i*7*scale,t*(i%2?-.8:1)+i,t*(i%2?-.8:1)+i+Math.PI*(.75+i*.12),i===1?c.b:c.a,1.6*scale,.68-i*.14);
      for(let i=0;i<(quality==='low'?6:10);i++){const a=t*.3+i*Math.PI*2/(quality==='low'?6:10),ri=r+6*scale,ro=r+(moving?29:15)*scale;line(g,x+Math.cos(a)*ri,y+Math.sin(a)*ri,x+Math.cos(a)*ro,y+Math.sin(a)*ro,i%3===0?c.b:c.a,(i%3===0?1.9:1.1)*scale,.7);}
      if(core){core.circle(x,y,r*.43).fill({color:hexN(c.a),alpha:.55});core.circle(x,y,r*.22).fill({color:hexN(c.b),alpha:.78});}
    }else if(cat==='blackflash'){
      const tx=f.opp?point(f.opp.x,f.opp.y-75):{x:x+dir*70*scale,y};
      const ix=moving?lerpN(x,tx.x,.48):x+dir*30*scale, iy=moving?lerpN(y,tx.y,.48):y;
      drawArc(g,ix,iy,(17+Math.sin(t)*4)*scale,-t,t+Math.PI*1.6,c.b,1.5*scale,.86);
      line(g,ix-22*scale,iy-20*scale,ix+20*scale,iy+17*scale,c.c,3.8*scale,.8);
      line(g,ix-18*scale,iy+22*scale,ix+24*scale,iy-20*scale,c.b,2.2*scale,.95);
      line(g,ix-dir*48*scale,iy+26*scale,ix+dir*54*scale,iy-26*scale,c.a,1.3*scale,.75);
      if(core){core.circle(ix,iy,7*scale).fill({color:0xffffff,alpha:.8});}
    }else if(cat==='fuga'){
      const r=(16+charge*12)*scale;
      for(let i=0;i<4;i++){const a=t*.55+i*Math.PI/2;drawArc(g,x,y,r+i*4*scale,a,a+Math.PI*.52,i%2?c.a:c.b,1.35*scale,.65-i*.08);}
      for(let i=0;i<(quality==='low'?4:7);i++){const a=t*.35+i*2*Math.PI/(quality==='low'?4:7),rr=r+10*scale;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.7;line(g,px,py,px+Math.cos(a)*13*scale,py+Math.sin(a)*20*scale,c.a,2*scale,.62);diamond(g,px,py,2.4*scale,c.b,.7,a);}
      if(core){core.circle(x,y,r*.48).fill({color:0xff7028,alpha:.4});core.circle(x,y,r*.24).fill({color:0xffdf8a,alpha:.8});}
    }else if(cat==='slash'){
      const len=(moving?100+actT*70:34+charge*40)*scale*dir;
      const sway=Math.sin(t*1.2)*9*scale;
      line(g,x-dir*22*scale,y+24*scale,x+len,y-20*scale+sway,c.c,7*scale,.17);
      line(g,x-dir*16*scale,y+20*scale,x+len*.94,y-16*scale+sway,c.a,2.2*scale,.8);
      line(g,x-dir*6*scale,y+14*scale,x+len*.88,y-12*scale+sway,c.b,1*scale,.88);
      if(f.id==='heian_sukuna')line(g,x-dir*12*scale,y-15*scale,x+len*.8,y+20*scale,c.a,1.15*scale,.5);
    }else if(cat==='jackpot'){
      for(let i=0;i<rings;i++){const rr=(19+i*5)*scale;drawArc(g,x,y,rr,t*(i%2?-.45:.5)+i,t*(i%2?-.45:.5)+i+Math.PI*1.25,i%2?c.a:c.c,1.2*scale,.58-i*.06);}
      for(let i=0;i<3;i++)diamond(g,x+Math.cos(t+i*2.094)*34*scale,y+Math.sin(t+i*2.094)*21*scale,3.2*scale,c.b,.8,t+i);
    }else if(cat==='domain'){
      for(let i=0;i<3;i++)drawArc(g,z.x,z.y,(35+i*10)*scale,t*(i%2?-.3:.25)+i,t*(i%2?-.3:.25)+i+Math.PI*1.5,i%2?c.b:c.a,1.1*scale,.48-i*.08);
      diamond(g,z.x,z.y-1*scale,14*scale,c.c,.52,t*.2);
    }
  }
  function lerpN(a,b,t){return a+(b-a)*t;}

  function projStyle(type){
    const t=String(type||'').toLowerCase();
    if(t.includes('purple'))return {a:'#c58bff',b:'#ffffff',c:'#7644ff',cat:'purple'};
    if(t.includes('fuga')||t.includes('fire'))return {a:'#ff772c',b:'#ffe18a',c:'#d72e1c',cat:'fuga'};
    if(t.includes('dismantle')||t.includes('cleave')||t.includes('wcs')||t.includes('slash'))return {a:'#ff556e',b:'#fff7f8',c:'#9f1737',cat:'slash'};
    if(t.includes('rika')||t.includes('copy'))return {a:'#d7b8ff',b:'#ffffff',c:'#9070ee',cat:'blue'};
    if(t.includes('red'))return {a:'#ff556e',b:'#ffffff',c:'#ee263b',cat:'red'};
    if(t.includes('blue'))return {a:'#7beaff',b:'#ffffff',c:'#488eff',cat:'blue'};
    if(t.includes('kamutoke')||t.includes('lightning'))return {a:'#b9f4ff',b:'#ffffff',c:'#72b8ff',cat:'blue'};
    if(t.includes('toji'))return {a:'#c7d9df',b:'#ffffff',c:'#6b9aab',cat:'slash'};
    return {a:'#b9e8ff',b:'#ffffff',c:'#7798cc',cat:'blue'};
  }
  function renderProjectileLayer(g,now,quality){
    g.clear();if(typeof G==='undefined'||G.mode==='menu'||!Array.isArray(G.projectiles))return;
    const zoom=(typeof cam!=='undefined'&&cam.zoom)||1;let drawn=0;const max=quality==='low'?6:12;
    for(let i=G.projectiles.length-1;i>=0&&drawn<max;i--){
      const p=G.projectiles[i];if(!p||p.hit)continue;
      const q=point(p.x,p.y);if(q.x<-100||q.x>1380||q.y<-100||q.y>820)continue;
      const c=projStyle(p.type),r=clampN(Math.max(p.w||0,p.h||0)*.32*zoom,5,24),ang=Math.atan2(p.vy||0,p.vx||1),t=now*.001+(p.t||0)*.1;
      const tail=clampN(Math.abs(p.vx||0)*5*zoom,20,125);
      line(g,q.x-Math.cos(ang)*tail,q.y-Math.sin(ang)*tail,q.x,q.y,c.c,r*.75,.13);
      line(g,q.x-Math.cos(ang)*tail*.8,q.y-Math.sin(ang)*tail*.8,q.x,q.y,c.a,Math.max(1.2,r*.14),.68);
      if(c.cat==='purple'){
        drawArc(g,q.x,q.y,r*1.42,t,t+Math.PI*1.45,c.a,1.5,.72);drawArc(g,q.x,q.y,r*1.05,-t*1.4,-t*1.4+Math.PI*1.2,c.b,1.15,.9);
        diamond(g,q.x,q.y,r*.68,c.b,.95,t*.7);
      }else if(c.cat==='fuga'){
        for(let k=0;k<3;k++){const yy=(k-1)*r*.8;line(g,q.x-Math.cos(ang)*tail*.42,q.y-Math.sin(ang)*tail*.42+yy,q.x,q.y,c.a,Math.max(1,r*.16),.42-k*.06);}
        drawArc(g,q.x,q.y,r*1.1,t,t+Math.PI*1.15,c.b,1,.65);
      }else if(c.cat==='slash'){
        line(g,q.x-r*.9,q.y+r*.75,q.x+r*1.2,q.y-r*.65,c.b,1.8,.95);
        line(g,q.x-r*.7,q.y-r*.8,q.x+r*.8,q.y+r*.55,c.a,1,.65);
      }else{
        drawArc(g,q.x,q.y,r*1.25,t,t+Math.PI*1.45,c.a,1.1,.62);
        drawArc(g,q.x,q.y,r*.72,-t,-t+Math.PI,c.b,1,.76);
        diamond(g,q.x,q.y,r*.48,c.b,.82,t);
      }
      drawn++;
    }
  }
  function renderImpactLayer(g,now,quality){
    g.clear();
    for(let i=activeFx.length-1;i>=0;i--){
      const e=activeFx[i];e.life--;if(e.life<=0){activeFx.splice(i,1);continue;}
      const p=point(e.x,e.y),q=1-e.life/e.max,r=(e.kind==='heavyHit'?14:9)+q*(e.kind==='heavyHit'?65:36),alpha=(1-q)*.85;
      drawArc(g,p.x,p.y,r,0.2+q,Math.PI*1.86+q,e.color,2.1,alpha);
      drawArc(g,p.x,p.y,r*.62,-q,Math.PI*1.15-q,'#ffffff',1.15,alpha*.9);
      if(e.kind==='heavyHit'){
        for(let k=0;k<(quality==='low'?4:7);k++){
          const a=e.seed+k*Math.PI*2/(quality==='low'?4:7)+q*.25;
          line(g,p.x+Math.cos(a)*r*.24,p.y+Math.sin(a)*r*.24,p.x+Math.cos(a)*r*(.75+q*.4),p.y+Math.sin(a)*r*(.75+q*.4),k%2?e.color:'#ffffff',k%2?1.7:1,.72*alpha);
        }
      }
    }
  }

  function drawFallback(){
    if(!fallbackCtx)return;
    const c=fallbackCtx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W0,H0);
    if(typeof G==='undefined'||G.mode==='menu')return;
    const quality=window.JFF_V37_PIXI_VFX.quality,now=performance.now();
    const fighters=Array.isArray(G.fighters)?G.fighters:[];
    c.save();c.globalCompositeOperation='lighter';
    for(const f of fighters){
      if(!f||!f.move||f.state!=='ATTACK')continue;
      const cat=catOf(f);if(!cat)continue;
      const col=colorFor(f),p=point(f.x+(f.facing||1)*34,f.y-82),mf=Math.max(0,f.moveFrame||0),t=now*.0015+mf*.07;
      const r=18+Math.min(1,mf/Math.max(1,f.move.startup||8))*18;
      c.globalAlpha=.72;c.strokeStyle=col.a;c.lineWidth=1.5;c.beginPath();c.ellipse(p.x,p.y,r,r*.68,t*.3,t*.3+Math.PI*1.45);c.stroke();
      c.globalAlpha=.5;c.strokeStyle=col.b;c.beginPath();c.arc(p.x,p.y,r*.55,-t,t+Math.PI*1.35);c.stroke();
      if(cat==='purple'||cat==='blue'||cat==='fuga'||cat==='red'){
        c.globalAlpha=.35;c.fillStyle=cat==='purple'?'#9e5cff':cat==='fuga'?'#ff772c':cat==='red'?'#ff5568':'#77eaff';c.beginPath();c.arc(p.x,p.y,r*.38,0,Math.PI*2);c.fill();
      }
      if(cat==='slash'||cat==='blackflash'){c.globalAlpha=.8;c.strokeStyle=col.b;c.lineWidth=2;c.beginPath();c.moveTo(p.x-20,p.y+17);c.lineTo(p.x+(f.facing||1)*100,p.y-23);c.stroke();}
    }
    if(Array.isArray(G.projectiles)){
      let count=0;for(let i=G.projectiles.length-1;i>=0&&count<(quality==='low'?5:8);i--){const p=G.projectiles[i];if(!p||p.hit)continue;const z=point(p.x,p.y);if(z.x<-80||z.x>1360)continue;const cc=projStyle(p.type);c.globalAlpha=.26;c.strokeStyle=cc.a;c.lineWidth=7;c.beginPath();c.moveTo(z.x-(p.vx||0)*5,z.y);c.lineTo(z.x,z.y);c.stroke();c.globalAlpha=.9;c.strokeStyle=cc.b;c.lineWidth=1.5;c.beginPath();c.arc(z.x,z.y,Math.max(5,Math.min(20,(p.w||18)*.3)),0,Math.PI*2);c.stroke();count++;}
    }
    c.restore();
  }
  function updateBadge(){
    if(typeof G==='undefined')return;
    const training=G.mode==='training';badge.style.display=training?'block':'none';
    const status=window.JFF_V37_PIXI_VFX;
    badge.style.borderColor=status.renderer==='PIXI WEBGL'?'rgba(96,220,255,.42)':'rgba(255,193,90,.38)';
    badge.style.color=status.renderer==='PIXI WEBGL'?'#b8f3ff':'#ffdc9a';
    badge.textContent='VFX // '+status.renderer+' · '+(status.quality==='low'?'ADAPTIVE LOW':'ADAPTIVE HIGH')+' · CPU '+(status.avgCost||0).toFixed(1)+'ms';
  }
  function maybeLowerQuality(cost){
    costSum+=cost;costCount++;
    if(costCount>=30){const avg=costSum/costCount;window.JFF_V37_PIXI_VFX.avgCost=avg;costSum=0;costCount=0;
      if(avg>5.0){slowFrames++;}else slowFrames=Math.max(0,slowFrames-2);
      if(avg>10.0){severeCostChecks++;}else severeCostChecks=0;
      if(severeCostChecks>=2){switchToFallback('AUTO FALLBACK: RENDER COST');return;}
      if(slowFrames>=2){window.JFF_V37_PIXI_VFX.quality='low';shaderFilters.forEach(f=>{try{f.enabled=false;}catch(_){}});}
      else if(avg<2.6&&slowFrames===0){window.JFF_V37_PIXI_VFX.quality='high';shaderFilters.forEach(f=>{try{f.enabled=true;}catch(_){}});}
    }
  }
  function pixiRender(){
    if(!app||!stage)return false;
    const now=performance.now(),quality=window.JFF_V37_PIXI_VFX.quality;
    if(typeof G!=='undefined'&&G.mode==='menu'){
      fighterLayers.forEach(l=>{l.g.clear();if(l.core)l.core.clear();});projectileG.clear();impactG.clear();
      try{app.renderer.render({container:stage});}catch(e){return false;}
      return true;
    }
    const fighters=typeof G!=='undefined'&&Array.isArray(G.fighters)?G.fighters:[];
    for(let i=0;i<fighterLayers.length;i++){
      const l=fighterLayers[i],f=fighters[i];
      renderSignature(l.g,l.core,f,now,quality);
      if(l.filter&&l.filter.resources&&l.filter.resources.jffVfxUniforms){
        try{const u=l.filter.resources.jffVfxUniforms.uniforms;u.uTime=now*.003;u.uIntensity=quality==='low'?.22:.48;}catch(_){}
      }
    }
    renderProjectileLayer(projectileG,now,quality);
    renderImpactLayer(impactG,now,quality);
    try{const t0=performance.now();app.renderer.render({container:stage});maybeLowerQuality(performance.now()-t0);}
    catch(e){switchToFallback('WEBGL LOST');return false;}
    return true;
  }
  function switchToFallback(reason){
    try{if(app&&app.canvas&&app.canvas.parentNode)app.canvas.parentNode.removeChild(app.canvas);}catch(_){}
    try{if(app&&app.destroy)app.destroy(true,{children:true,texture:true,textureSource:true});}catch(_){}
    app=null;stage=null;pixiG=null;fighterLayers=[];projectileG=null;impactG=null;shaderFilters=[];
    window.JFF_V37_PIXI_VFX.renderer='CANVAS 2D FALLBACK';window.JFF_V37_PIXI_VFX.ready=true;
    window.JFF_V37_PIXI_VFX.reason=String(reason||'WebGL unavailable').slice(0,80);
    window.JFF_V37_PIXI_VFX.forceFallback=(why)=>switchToFallback(why||'FRAME RATE GUARD');
    window.JFF_V37_PIXI_VFX.setQuality=(q)=>{window.JFF_V37_PIXI_VFX.quality=q==='low'?'low':'high';shaderFilters.forEach(f=>{try{f.enabled=window.JFF_V37_PIXI_VFX.quality==='high';}catch(_){}});};
    if(fallbackCanvas)fallbackCanvas.style.display='block';
  }
  function makeShader(){
    if(!window.PIXI||!PIXI.Filter||!PIXI.GlProgram)return null;
    const vertex=`
      in vec2 aPosition;
      out vec2 vTextureCoord;
      uniform vec4 uInputSize;
      uniform vec4 uOutputFrame;
      uniform vec4 uOutputTexture;
      vec4 filterVertexPosition(){
        vec2 position=aPosition*uOutputFrame.zw+uOutputFrame.xy;
        position.x=position.x*(2.0/uOutputTexture.x)-1.0;
        position.y=position.y*(2.0*uOutputTexture.z/uOutputTexture.y)-uOutputTexture.z;
        return vec4(position,0.0,1.0);
      }
      vec2 filterTextureCoord(){return aPosition*(uOutputFrame.zw*uInputSize.zw);}
      void main(){gl_Position=filterVertexPosition();vTextureCoord=filterTextureCoord();}
    `;
    const fragment=`
      in vec2 vTextureCoord;
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uIntensity;
      out vec4 finalColor;
      void main(){
        vec2 uv=vTextureCoord;
        vec4 base=texture(uTexture,uv);
        float n=sin((uv.x*83.0+uv.y*61.0)+uTime*4.0);
        float edge=clamp(max(base.r,max(base.g,base.b)),0.0,1.0);
        vec2 offset=vec2(n,-n)*0.0017*uIntensity*edge;
        vec4 shifted=texture(uTexture,clamp(uv+offset,vec2(0.001),vec2(0.999)));
        shifted.rgb+=vec3(0.12,0.16,0.26)*edge*uIntensity*(0.35+0.65*sin(uTime+uv.y*30.0));
        finalColor=vec4(shifted.rgb,shifted.a);
      }
    `;
    try{
      const filter=new PIXI.Filter({
        glProgram:PIXI.GlProgram.from({vertex,fragment}),
        resources:{jffVfxUniforms:{uTime:{value:0,type:'f32'},uIntensity:{value:.4,type:'f32'}}}
      });
      shaderAvailable=true;return filter;
    }catch(e){console.warn('[JFF V37] custom shader disabled; using Pixi vector renderer.',e);shaderAvailable=false;return null;}
  }
  function detectAcceleratedWebGL(){
    let probe=null,gl=null;
    try{
      probe=document.createElement('canvas');
      gl=probe.getContext('webgl2',{failIfMajorPerformanceCaveat:true})||
         probe.getContext('webgl',{failIfMajorPerformanceCaveat:true});
      if(!gl)return {ok:false,reason:'ACCELERATED WEBGL UNAVAILABLE'};
      let vendor='',renderer='';
      const ext=gl.getExtension('WEBGL_debug_renderer_info');
      if(ext){
        vendor=String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)||'');
        renderer=String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)||'');
      }else{
        vendor=String(gl.getParameter(gl.VENDOR)||'');
        renderer=String(gl.getParameter(gl.RENDERER)||'');
      }
      const details=(vendor+' '+renderer).toLowerCase();
      const software=/swiftshader|llvmpipe|lavapipe|softpipe|basic render driver|software rasterizer|microsoft basic|warp renderer/.test(details);
      try{const lose=gl.getExtension('WEBGL_lose_context');if(lose)lose.loseContext();}catch(_){}
      return {ok:!software,reason:software?'SOFTWARE WEBGL DETECTED':'ACCELERATED WEBGL AVAILABLE',vendor,renderer};
    }catch(_){
      return {ok:false,reason:'WEBGL PROBE FAILED'};
    }finally{
      probe=null;gl=null;
    }
  }
  function loadPixiScript(){
    return new Promise((resolve,reject)=>{
      if(window.PIXI&&PIXI.Application&&PIXI.Graphics){resolve();return;}
      const script=document.createElement('script');
      let settled=false;
      const timeout=setTimeout(()=>{
        if(settled)return;
        settled=true;script.remove();reject(new Error('PixiJS CDN timeout'));
      },8000);
      script.src='https://cdn.jsdelivr.net/npm/pixi.js@8.22.0/dist/pixi.min.js';
      script.async=true;
      script.onload=()=>{
        if(settled)return;
        settled=true;clearTimeout(timeout);
        if(window.PIXI&&PIXI.Application&&PIXI.Graphics)resolve();
        else reject(new Error('PixiJS loaded without required renderer APIs'));
      };
      script.onerror=()=>{
        if(settled)return;
        settled=true;clearTimeout(timeout);reject(new Error('PixiJS CDN unavailable'));
      };
      document.head.appendChild(script);
    });
  }
  async function bootPixi(){
    try{
      if(!window.PIXI||!PIXI.Application||!PIXI.Graphics)await loadPixiScript();
      if(!window.PIXI||!PIXI.Application||!PIXI.Graphics)throw new Error('PixiJS APIs unavailable');
      const candidate=new PIXI.Application();
      await candidate.init({
        width:W0,height:H0,backgroundAlpha:0,clearBeforeRender:true,
        antialias:false,autoDensity:false,resolution:1,autoStart:false,
        preference:'webgl',powerPreference:'low-power',
        webgl:{antialias:false,powerPreference:'low-power',failIfMajorPerformanceCaveat:false}
      });
      if(!candidate.renderer||!candidate.renderer.gl)throw new Error('WebGL renderer unavailable');
      app=candidate;app.ticker.stop();if(app.stop)app.stop();
      stage=new PIXI.Container();
      app.canvas.id='jffPixiVfxCanvas';app.canvas.style.cssText='position:absolute;left:0;top:0;width:1280px;height:720px;z-index:1;pointer-events:none;display:block;';
      app.canvas.setAttribute('aria-hidden','true');wrap.appendChild(app.canvas);
      for(let i=0;i<2;i++){
        const container=new PIXI.Container(),g=new PIXI.Graphics(),core=new PIXI.Graphics();
        const filter=makeShader();
        if(filter){core.filters=[filter];shaderFilters.push(filter);}
        container.addChild(g);container.addChild(core);stage.addChild(container);fighterLayers.push({container,g,core,filter});
      }
      projectileG=new PIXI.Graphics();impactG=new PIXI.Graphics();stage.addChild(projectileG);stage.addChild(impactG);
      fallbackCanvas.style.display='none';
      app.canvas.addEventListener('webglcontextlost',e=>{try{e.preventDefault();}catch(_){}switchToFallback('WEBGL CONTEXT LOST');});
      window.JFF_V37_PIXI_VFX.renderer='PIXI WEBGL';window.JFF_V37_PIXI_VFX.ready=true;window.JFF_V37_PIXI_VFX.shader=shaderAvailable?'CUSTOM GLSL':'VECTOR ONLY';
      window.JFF_V37_PIXI_VFX.forceFallback=(why)=>switchToFallback(why||'FRAME RATE GUARD');
      window.JFF_V37_PIXI_VFX.setQuality=(q)=>{window.JFF_V37_PIXI_VFX.quality=q==='low'?'low':'high';shaderFilters.forEach(f=>{try{f.enabled=window.JFF_V37_PIXI_VFX.quality==='high';}catch(_){}});};
      console.info('[JFF V37] Pixi VFX online. Shader:',window.JFF_V37_PIXI_VFX.shader);
    }catch(e){console.warn('[JFF V37] Pixi/WebGL unavailable; using Canvas2D fallback.',e);switchToFallback(e&&e.message||'init failed');}
  }

  if(typeof baseRender==='function'){
    window.render=function(){
      const t0=performance.now();
      baseRender.apply(this,arguments);
      if(typeof G!=='undefined'){
        watchHitEvents();
        if(G.mode==='menu')activeFx.length=0;
      }
      if(window.JFF_V37_PIXI_VFX.renderer==='PIXI WEBGL')pixiRender();
      else {
        const now=performance.now();
        const isMenu=typeof G==='undefined'||G.mode==='menu';
        if(isMenu||now-lastFallbackFrame>=33){drawFallback();lastFallbackFrame=now;}
      }
      updateBadge();
      frameNumber++;
      lastMeasure=performance.now()-t0;
      if(frameNumber%180===0&&Number.isFinite(lastMeasure)&&lastMeasure>8){window.JFF_V37_PIXI_VFX.quality='low';shaderFilters.forEach(f=>{try{f.enabled=false;}catch(_){}});}
    };
  }

  /* Low-end/software-rendered machines skip the PixiJS download entirely. */
  const gpuProbe=JFF_V37_LOW_END
    ? {ok:false,reason:'LOW-END PERFORMANCE PROFILE'}
    : detectAcceleratedWebGL();
  window.JFF_V37_PIXI_VFX.acceleratedWebGL=!!gpuProbe.ok;
  window.JFF_V37_PIXI_VFX.gpuProbeReason=gpuProbe.reason;
  window.JFF_V37_PIXI_VFX.gpuVendor=gpuProbe.vendor||'';
  window.JFF_V37_PIXI_VFX.gpuRenderer=gpuProbe.renderer||'';
  if(!gpuProbe.ok){
    switchToFallback(gpuProbe.reason);
  }else{
    bootPixi();
  }
})();