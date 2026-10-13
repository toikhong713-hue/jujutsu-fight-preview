/* JFF Fighting HUD v1: independent DOM overlay for health, energy, meter and skill cooldowns. */
(function(){
'use strict';
if(window.__JFF_FIGHTING_HUD_V1__)return;
const wrap=document.getElementById('wrap');if(!wrap)return;
window.__JFF_FIGHTING_HUD_V1__=true;
const css=`
#jffFightingHud{position:absolute;inset:0;z-index:7;pointer-events:none;display:none;color:#eaf3ff;font-family:"Segoe UI",system-ui,sans-serif;font-variant-numeric:tabular-nums}
#jffFightingHud.is-active{display:block}#jffFightingHud *{box-sizing:border-box}
#jffFightingHud .hud-panel{position:absolute;overflow:hidden;background:linear-gradient(118deg,rgba(5,9,17,.99),rgba(12,18,31,.98));border:1px solid rgba(164,192,224,.24);box-shadow:0 8px 24px rgba(0,0,0,.26),inset 0 1px rgba(255,255,255,.035)}
#jffFightingHud .hud-panel:before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--hud-accent),rgba(255,255,255,.08))}
#jffFightingHud .hud-top{top:14px;width:500px;min-height:138px;padding:10px 13px 11px;border-radius:9px 3px 9px 3px}
#jffFightingHud .hud-top.p1{left:18px;--hud-accent:#72d9ff}#jffFightingHud .hud-top.p2{right:18px;--hud-accent:#ff667d}
#jffFightingHud .hud-ident{display:flex;align-items:center;gap:9px;min-height:28px}
#jffFightingHud .hud-seal{width:29px;height:29px;flex:0 0 29px;display:grid;place-items:center;border:1px solid var(--hud-accent);color:var(--hud-accent);background:rgba(255,255,255,.025);font:900 10px/1 Consolas,monospace;clip-path:polygon(0 0,78% 0,100% 23%,100% 100%,22% 100%,0 77%)}
#jffFightingHud .hud-name-wrap{min-width:0;flex:1}
#jffFightingHud .hud-kicker{font:800 7px/1.2 Consolas,monospace;letter-spacing:2px;color:#7388a8;text-transform:uppercase}
#jffFightingHud .hud-name{font:900 16px/1.15 "Segoe UI",system-ui,sans-serif;letter-spacing:1.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#jffFightingHud .hud-state{padding:4px 6px;border:1px solid rgba(160,180,208,.18);color:#9aaecb;background:rgba(255,255,255,.025);font:800 7px/1 Consolas,monospace;letter-spacing:1px;white-space:nowrap}
#jffFightingHud .hud-vital-meta{display:flex;justify-content:space-between;align-items:center;margin-top:8px;color:#7387a5;font:800 8px/1 Consolas,monospace;letter-spacing:1.7px}
#jffFightingHud .hud-vital-meta strong{font:900 10px/1 Consolas,monospace;letter-spacing:.4px;color:#e7efff}
#jffFightingHud .hud-track{position:relative;overflow:hidden;background:rgba(0,0,0,.72);border:1px solid rgba(160,184,212,.13);isolation:isolate}
#jffFightingHud .hud-health{height:12px;margin-top:5px;clip-path:polygon(0 0,100% 0,99.2% 100%,0 100%)}
#jffFightingHud .hud-fill{position:absolute;inset:0 auto 0 0;width:100%;transition:width .08s linear;background:linear-gradient(90deg,var(--hud-accent-dark),var(--hud-accent));box-shadow:0 0 13px var(--hud-accent)}
#jffFightingHud .hud-health .hud-fill:after{content:"";position:absolute;right:0;top:0;bottom:0;width:2px;background:#fff;opacity:.8}
#jffFightingHud .hud-mini-stats{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-top:8px}
#jffFightingHud .hud-mini-label{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;color:#7489a8;font:800 7px/1 Consolas,monospace;letter-spacing:1.25px}
#jffFightingHud .hud-mini-label b{font:900 8px/1 Consolas,monospace;letter-spacing:.3px;color:#cedaef}
#jffFightingHud .hud-mini-track{height:5px}
#jffFightingHud .hud-energy .hud-fill{background:linear-gradient(90deg,#2a6999,#8beaff);box-shadow:0 0 10px rgba(99,214,255,.35)}
#jffFightingHud .hud-meter .hud-fill{background:linear-gradient(90deg,#8c6b2c,#ffe49a);box-shadow:0 0 10px rgba(255,211,111,.28)}
#jffFightingHud .hud-top.p2 .hud-fill{left:auto;right:0}
#jffFightingHud .hud-top.p2 .hud-vital-meta{flex-direction:row-reverse}
#jffFightingHud .hud-top.p2 .hud-mini-label{flex-direction:row-reverse}
#jffFightingHud .hud-top.p2 .hud-ident{flex-direction:row-reverse;text-align:right}
#jffFightingHud .hud-top.p2 .hud-ident .hud-name-wrap{direction:rtl}
#jffFightingHud .hud-top.p2:before{background:linear-gradient(270deg,var(--hud-accent),rgba(255,255,255,.08))}
#jffFightingHud .hud-center{position:absolute;left:50%;top:14px;transform:translateX(-50%);width:204px;height:72px;text-align:center;padding:8px 12px;background:linear-gradient(180deg,rgba(6,10,19,.99),rgba(11,16,28,.98));border:1px solid rgba(159,187,222,.23);clip-path:polygon(8% 0,92% 0,100% 20%,100% 80%,92% 100%,8% 100%,0 80%,0 20%)}
#jffFightingHud .hud-round-kicker{font:800 7px/1 Consolas,monospace;color:#7890b2;letter-spacing:2.5px}
#jffFightingHud .hud-round{margin-top:3px;font:900 20px/.98 "Segoe UI",system-ui,sans-serif;letter-spacing:3px;color:#f0f5ff;text-shadow:0 0 16px rgba(151,197,255,.2)}
#jffFightingHud .hud-score{margin-top:5px;display:flex;justify-content:center;gap:22px;font:900 8px/1 Consolas,monospace;letter-spacing:1px}
#jffFightingHud .hud-score .s1{color:#82dcff}#jffFightingHud .hud-score .s2{color:#ff8191}
#jffFightingHud .hud-mode{position:absolute;left:50%;top:92px;transform:translateX(-50%);padding:4px 7px;color:#8295af;background:rgba(3,6,12,.96);border:1px solid rgba(123,152,190,.2);font:800 7px/1 Consolas,monospace;letter-spacing:1.5px;white-space:nowrap}
#jffFightingHud .hud-deck{bottom:13px;width:420px;padding:9px 9px 8px;border-radius:3px 8px 3px 8px;--hud-accent:#72d9ff}
#jffFightingHud .hud-deck.p1{left:18px}#jffFightingHud .hud-deck.p2{right:18px;--hud-accent:#ff667d}
#jffFightingHud .hud-deck-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;padding:0 1px}
#jffFightingHud .hud-deck-title{font:900 8px/1 Consolas,monospace;letter-spacing:2px;color:#b6c7df}
#jffFightingHud .hud-deck-sub{font:800 7px/1 Consolas,monospace;letter-spacing:1px;color:#617591}
#jffFightingHud .hud-skills{display:flex;gap:4px;align-items:stretch}
#jffFightingHud .hud-skill{position:relative;flex:1;min-width:0;height:57px;overflow:hidden;border:1px solid rgba(126,153,188,.24);background:linear-gradient(145deg,rgba(25,35,53,.98),rgba(7,11,20,.99));display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:5px 1px 5px;isolation:isolate}
#jffFightingHud .hud-skill:before{content:"";position:absolute;inset:0 0 auto;height:2px;background:var(--hud-accent);opacity:.42}
#jffFightingHud .hud-skill.ready{border-color:rgba(152,198,232,.48);background:linear-gradient(145deg,rgba(26,48,70,.98),rgba(8,14,25,.99))}
#jffFightingHud .hud-skill.ready:before{opacity:1}
#jffFightingHud .hud-skill.low{filter:saturate(.55);opacity:.68}
#jffFightingHud .hud-slot-key{position:absolute;top:4px;left:4px;color:#9daec6;font:900 8px/1 Consolas,monospace}
#jffFightingHud .hud-slot-glyph{position:absolute;top:12px;left:0;right:0;text-align:center;color:var(--hud-accent);font:700 19px/1.1 "Segoe UI Symbol","Segoe UI",sans-serif;text-shadow:0 0 12px rgba(100,170,230,.16)}
#jffFightingHud .hud-slot-name{position:relative;z-index:1;max-width:100%;color:#b9cbe4;font:900 7px/1 Consolas,monospace;letter-spacing:.1px;white-space:nowrap;overflow:hidden;text-overflow:clip}
#jffFightingHud .hud-slot-state{position:absolute;z-index:3;inset:0;display:none;align-items:center;justify-content:center;padding-top:6px;color:#fff;font:900 10px/1 Consolas,monospace;text-shadow:0 1px 6px #000;background:rgba(3,6,12,.82)}
#jffFightingHud .hud-skill.cooling .hud-slot-state,#jffFightingHud .hud-skill.low .hud-slot-state{display:flex}
#jffFightingHud .hud-skill.cooling .hud-slot-state{color:#d8e3f5}
#jffFightingHud .hud-skill.ultimate{border-color:rgba(255,220,136,.4)}
#jffFightingHud .hud-skill.ultimate .hud-slot-glyph{color:#ffe49a}
#jffFightingHud .hud-skill.ultimate.ready{border-color:#ffe49a;box-shadow:inset 0 0 13px rgba(255,211,111,.12)}
#jffFightingHud .hud-deck.p2 .hud-deck-head{flex-direction:row-reverse}
#jffFightingHud .hud-deck.p2 .hud-skills{flex-direction:row-reverse}
#jffFightingHud .hud-deck.p2 .hud-slot-key{left:auto;right:4px}
#jffFightingHud .hud-footer{display:flex;justify-content:space-between;margin-top:5px;color:#536986;font:800 6px/1 Consolas,monospace;letter-spacing:.8px}
#jffFightingHud .hud-footer b{color:#8ca6c7;font-weight:900}
#jffFightingHud .hud-deck.p2 .hud-footer{flex-direction:row-reverse}
#trainingPanel.on{top:158px}
@media (prefers-reduced-motion:reduce){#jffFightingHud .hud-fill{transition:none}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
const root=document.createElement('div');root.id='jffFightingHud';root.setAttribute('aria-hidden','true');
root.innerHTML=`
<section class="hud-panel hud-top p1" data-player="0">
 <div class="hud-ident"><div class="hud-seal">P1</div><div class="hud-name-wrap"><div class="hud-kicker">PLAYER ONE / COMBAT PROFILE</div><div class="hud-name" data-name>GOJO SATORU</div></div><div class="hud-state" data-state>READY</div></div>
 <div class="hud-vital-meta"><span>VITALITY</span><strong data-hp>200 / 200</strong></div><div class="hud-track hud-health"><i class="hud-fill" data-hp-fill></i></div>
 <div class="hud-mini-stats"><div class="hud-stat"><div class="hud-mini-label"><span data-energy-label>ENERGY</span><b data-energy-value>100%</b></div><div class="hud-track hud-mini-track hud-energy"><i class="hud-fill" data-energy-fill></i></div></div><div class="hud-stat"><div class="hud-mini-label"><span>ULTIMATE</span><b data-meter-value>0%</b></div><div class="hud-track hud-mini-track hud-meter"><i class="hud-fill" data-meter-fill></i></div></div></div>
</section>
<section class="hud-panel hud-top p2" data-player="1">
 <div class="hud-ident"><div class="hud-seal">P2</div><div class="hud-name-wrap"><div class="hud-kicker">PLAYER TWO / COMBAT PROFILE</div><div class="hud-name" data-name>RYOMEN SUKUNA</div></div><div class="hud-state" data-state>READY</div></div>
 <div class="hud-vital-meta"><span>VITALITY</span><strong data-hp>200 / 200</strong></div><div class="hud-track hud-health"><i class="hud-fill" data-hp-fill></i></div>
 <div class="hud-mini-stats"><div class="hud-stat"><div class="hud-mini-label"><span data-energy-label>ENERGY</span><b data-energy-value>100%</b></div><div class="hud-track hud-mini-track hud-energy"><i class="hud-fill" data-energy-fill></i></div></div><div class="hud-stat"><div class="hud-mini-label"><span>ULTIMATE</span><b data-meter-value>0%</b></div><div class="hud-track hud-mini-track hud-meter"><i class="hud-fill" data-meter-fill></i></div></div></div>
</section>
<div class="hud-center"><div class="hud-round-kicker">JFF // COMBAT SYSTEM</div><div class="hud-round" data-round>ROUND 01</div><div class="hud-score"><span class="s1" data-wins1>P1 ● ○</span><span class="s2" data-wins2>P2 ● ○</span></div></div>
<div class="hud-mode" data-mode>LOCAL DUEL</div>
<section class="hud-panel hud-deck p1" data-deck="0"><div class="hud-deck-head"><span class="hud-deck-title">TECHNIQUE DECK</span><span class="hud-deck-sub">PLAYER 01</span></div><div class="hud-skills" data-skills></div><div class="hud-footer"><span>FOCUS <b data-deck-energy>100%</b></span><span>GUARD <b>F</b> / BURST <b>HOLD</b></span></div></section>
<section class="hud-panel hud-deck p2" data-deck="1"><div class="hud-deck-head"><span class="hud-deck-title">TECHNIQUE DECK</span><span class="hud-deck-sub">PLAYER 02</span></div><div class="hud-skills" data-skills></div><div class="hud-footer"><span>FOCUS <b data-deck-energy>100%</b></span><span>GUARD <b>NUM ENTER</b></span></div></section>
`;
wrap.appendChild(root);
const panelRefs=[0,1].map(i=>{
 const panel=root.querySelector('.hud-top[data-player="'+i+'"]'),deck=root.querySelector('.hud-deck[data-deck="'+i+'"]'),slots={};
 const keys=['s1','s2','s3','s4','s5','def','extra','ult'],glyphs={s1:'◉',s2:'◇',s3:'✦',s4:'羽',s5:'✹',def:'◈',extra:'↗',ult:'極'};
 keys.forEach(k=>{const card=document.createElement('div');card.className='hud-skill';card.dataset.key=k;card.innerHTML='<span class="hud-slot-key"></span><span class="hud-slot-glyph">'+glyphs[k]+'</span><span class="hud-slot-name"></span><span class="hud-slot-state"></span>';deck.querySelector('[data-skills]').appendChild(card);slots[k]=card;});
 return {panel,deck,slots,lastChar:'',signature:''};
});
const labels={
 itachi:{s1:'FIRE',s2:'TSUK',s3:'YASA',s4:'CROW',s5:'AMA',def:'YATA',wcs:'WCS',x:'ARSNL',z:'ZERO',ult:'SUSANO'},
 gojo:{s1:'BLUE',s2:'RED',s3:'PURP',def:'INF',ult:'VOID'},
 young_gojo:{s1:'BLUE',s2:'RED',s3:'READ',s4:'LOCK',s5:'MAX B',def:'INF',z:'RED Z',x:'AWAKE',ult:'VOID'},
 sukuna:{s1:'DISM',s2:'CLEV',s3:'FUGA',def:'GUARD',ult:'SHRINE'},
 yuji:{s1:'DISM',s2:'STRK',s3:'BFLASH',s4:'DIVER',def:'GUARD',ult:'BARRAGE'},
 yuta:{s1:'STRK',s2:'RIKA',s3:'COPY',s4:'SKY',s5:'RCT',def:'RIKA G',ult:'BEAM'},
 hakari:{s1:'DRS',s2:'RGE',s3:'DMN',s4:'ROLL',s5:'RSL',def:'GUARD',ult:'JACKPT'},
 toji:{s1:'ISOH',s2:'SPEAR',s3:'CHAIN',s4:'CLOUD',s5:'ZERO',def:'GUARD',x:'ARSNL',z:'STEP',ult:'EXEC'},
 heian_sukuna:{s1:'DISM',s2:'CLEV',s3:'FUGA',s4:'KMT',s5:'HITEN',def:'KAMU',wcs:'WCS',ult:'SHRINE'},
 the_strongest_today:{s1:'RCT',s2:'SLASH',s3:'BF',s4:'PURP',s5:'VOID',def:'OVER',wcs:'WCS',ult:'OVER'}
};
const keyLabels=[{s1:'3',s2:'4',s3:'5',s4:'6',s5:'7',def:'R',wcs:'0',x:'X',z:'Z',ult:'9'},
{s1:'N3',s2:'N4',s3:'N5',s4:'N6',s5:'N9',def:'N8',wcs:'N/',x:'N/',z:'N-',ult:'N7'}];
const modeLabels={versus:'LOCAL DUEL',cpu:'CPU BATTLE',training:'TRAINING LAB',story:'STORY MODE',survival:'SURVIVAL RUN',timeattack:'TIME ATTACK'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pct=(v,m)=>m>0?clamp((Number(v)||0)/m,0,1):0;
function colorsFor(f,i){
 let c=(f&&f.def&&f.def.colors)||{};try{if(typeof getColors==='function')c=getColors(f)||c}catch(e){}
 const accent=c.accent||(i===0?'#72d9ff':'#ff667d');let dark=i===0?'#195577':'#681d30';
 if(/^#[0-9a-f]{6}$/i.test(accent)){const n=parseInt(accent.slice(1),16),v=[(n>>16)&255,(n>>8)&255,n&255].map(x=>(x*.32|0).toString(16).padStart(2,'0'));dark='#'+v.join('')}
 return {accent,dark};
}
function stateFor(f){
 if(!f)return 'NO SIGNAL';if(f.state==='DEFEAT')return 'KNOCKED OUT';if(f.overdriveActive)return 'OVERDRIVE';
 if(f.id==='itachi'&&(f.itachiAwake||0)>0)return 'MANGEKYO ACTIVE';if(f.jackpot>0)return 'JACKPOT ACTIVE';if(f.awakened)return 'AWAKENED';
 if(f.state==='ATTACK')return 'TECHNIQUE ACTIVE';if(f.state==='BLOCKSTUN')return 'GUARD HIT';return 'COMBAT READY';
}
function extraKey(f){if(f.moves&&f.moves.wcs)return 'wcs';if(f.moves&&f.moves.x)return 'x';if(f.moves&&f.moves.z)return 'z';return ''}
function shortLabel(f,k,m){
 let dict=labels[f.id]||{};if(f.id==='sukuna'&&f.form===1)dict=labels.yuji||dict;
 if(dict[k])return dict[k];
 const name=(m&&m.name)||k.toUpperCase();
 return name.replace(/^(domain expansion:|maximum |reverse cursed technique:|fire style:|mangekyo sharingan:|susanoo:)/i,'').trim().split(/[\s/:—-]+/).filter(Boolean).slice(0,2).map(x=>x.slice(0,4).toUpperCase()).join(' ').slice(0,9);
}
function moveFor(f,k){const actual=k==='extra'?extraKey(f):k;return actual&&f.moves&&f.moves[actual]?actual:''}
function buildSlots(ref,f,i){
 for(const slot of Object.keys(ref.slots)){
  const card=ref.slots[slot],key=moveFor(f,slot);
  if(!key){card.style.display='none';continue}
  card.style.display='flex';const m=f.moves[key];
  card.querySelector('.hud-slot-key').textContent=keyLabels[i][key]||key.toUpperCase();
  card.querySelector('.hud-slot-name').textContent=shortLabel(f,key,m);
  card.title=(m.name||key.toUpperCase())+' · '+(keyLabels[i][key]||key.toUpperCase());
  card.classList.toggle('ultimate',key==='ult');card.classList.toggle('extra',slot==='extra');
 }
 ref.lastChar=f.id;
}
function updateSide(ref,f,i){
 if(!f){ref.panel.style.display='none';ref.deck.style.display='none';return}
 ref.panel.style.display='block';ref.deck.style.display='block';
 const c=colorsFor(f,i);[ref.panel,ref.deck].forEach(n=>{n.style.setProperty('--hud-accent',c.accent);n.style.setProperty('--hud-accent-dark',c.dark)});
 let name=f.name||f.id;try{if(typeof getDisplayName==='function')name=getDisplayName(f)}catch(e){}
 const ne=ref.panel.querySelector('[data-name]');if(ne.textContent!==name)ne.textContent=name;
 ref.panel.querySelector('[data-state]').textContent=stateFor(f);
 const hp=pct(f.hp,f.maxHp),energy=pct(f.energy,f.maxEnergy),meter=pct(f.meter,f.maxMeter||100);
 ref.panel.querySelector('[data-hp]').textContent=Math.max(0,Math.ceil(f.hp||0))+' / '+Math.max(1,Math.ceil(f.maxHp||1));
 ref.panel.querySelector('[data-hp-fill]').style.width=(hp*100)+'%';ref.panel.querySelector('[data-energy-fill]').style.width=(energy*100)+'%';ref.panel.querySelector('[data-meter-fill]').style.width=(meter*100)+'%';
 ref.panel.querySelector('[data-energy-value]').textContent=Math.round(energy*100)+'%';ref.panel.querySelector('[data-meter-value]').textContent=meter>=1?'READY':Math.round(meter*100)+'%';
 ref.panel.querySelector('[data-energy-label]').textContent=f.id==='itachi'?'CHAKRA':(f.id==='hakari'?'LUCK / ENERGY':'ENERGY');
 ref.deck.querySelector('[data-deck-energy]').textContent=Math.round(energy*100)+'%';
 const sig=Object.keys(f.moves||{}).map(k=>k+':'+(f.moves[k]&&f.moves[k].name||'')).join('|');
 if(ref.lastChar!==f.id||ref.signature!==sig){buildSlots(ref,f,i);ref.signature=sig}
 for(const slot of Object.keys(ref.slots)){
  const card=ref.slots[slot];if(card.style.display==='none')continue;
  const key=moveFor(f,slot),m=key&&(f.moves||{})[key];if(!m)continue;
  const cd=Math.max(0,Number((f.cd||{})[key])||0),canAfford=(Number(f.energy)||0)>=(Number(m.cost)||0),ultReady=key==='ult'&&meter>=1;
  const ready=key==='ult'?ultReady:(cd<=0&&canAfford);
  card.classList.toggle('ready',ready);card.classList.toggle('cooling',cd>0);card.classList.toggle('low',key==='ult'?!ultReady:(cd<=0&&!canAfford));
  const state=card.querySelector('.hud-slot-state');
  if(cd>0)state.textContent=(cd/60).toFixed(cd<60?1:0)+'s';else if(key==='ult'&&!ultReady)state.textContent=Math.round(meter*100)+'%';else if(!canAfford&&key!=='ult')state.textContent='LOW';else state.textContent=ready?'READY':'';
 }
 ref.deck.querySelector('.hud-deck-sub').textContent=i===0?'PLAYER 01':'PLAYER 02';
}
function updateHud(){
 if(typeof G==='undefined'||G.mode==='menu'||!Array.isArray(G.fighters)||G.fighters.length<2){root.classList.remove('is-active');return}
 root.classList.add('is-active');updateSide(panelRefs[0],G.fighters[0],0);updateSide(panelRefs[1],G.fighters[1],1);
 root.querySelector('[data-round]').textContent='ROUND '+String(G.round||1).padStart(2,'0');
 const w1=Math.min(2,G.fighters[0].wins||0),w2=Math.min(2,G.fighters[1].wins||0);
 root.querySelector('[data-wins1]').textContent='P1  '+('● '.repeat(w1)+'○ '.repeat(2-w1)).trim();
 root.querySelector('[data-wins2]').textContent='P2  '+('● '.repeat(w2)+'○ '.repeat(2-w2)).trim();
 root.querySelector('[data-mode]').textContent=modeLabels[G.mode]||String(G.mode||'COMBAT').toUpperCase();
}
const previousRender=window.render;
if(typeof previousRender==='function')window.render=function(){const value=previousRender.apply(this,arguments);updateHud();return value};
else console.warn('[JFF HUD] render hook missing; DOM HUD is installed but cannot refresh until render is available.');
window.JFF_FIGHTING_HUD={ready:true,version:1,update:updateHud,root:root};
console.info('[JFF HUD] New health, energy, ultimate and skill HUD loaded.');
})();