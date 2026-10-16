/* EDO ITACHI · SUSANOO ULTIMATE REBUILD V1
   Fresh live-combat implementation: ember-red guardian, octagonal Yata Mirror, crimson Totsuka.
   No global simulation pause, camera override, HUD hiding, or legacy purple cinematic rig. */
(function(){
'use strict';
if(window.__JFF_EDO_SUSANOO_ULTIMATE_V1__)return;
const Q=window.JFF_ITACHI_REBOOT;
if(!Q||typeof window.updateMove!=='function')return;
window.__JFF_EDO_SUSANOO_ULTIMATE_V1__=true;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const alive=f=>!!(f&&f.hp>0&&f.state!=='DEFEAT'&&f.state!=='VICTORY');
const DURATION=218;
const EVENTS=[
 {frame:51,damage:10,reach:610,hitstun:20,kbx:7,kby:-2,kind:'sweep'},
 {frame:76,damage:11,reach:650,hitstun:22,kbx:8,kby:-2,kind:'cross'},
 {frame:106,damage:13,reach:680,hitstun:24,kbx:9,kby:-3,kind:'yata'},
 {frame:139,damage:17,reach:760,hitstun:28,kbx:10,kby:-4,kind:'thrust',armorBreak:true},
 {frame:171,damage:21,reach:850,hitstun:34,kbx:13,kby:-6,kind:'final',armorBreak:true,final:true}
];
const oldUpdate=window.updateMove,oldStep=window.step,oldRender=window.render,oldReset=window.resetFighter,oldPose=window.applyCharacterIdentityPose;
function endMove(f){
 if(!f)return;
 if(typeof window.endMove==='function')window.endMove(f);
 else{f.move=null;f.moveKey=null;f.moveFrame=0;f.state=f.onGround?'IDLE':'FALL';f.stateFrame=0;}
 f.itachiPoseKey='';f.vx*=.22;
}
function createUltimate(f){
 if(Q.cinema)return null;
 const target=alive(f.opp)?f.opp:null,d=target?(target.x>=f.x?1:-1):(f.facing||1);
 const u={owner:f,target,frame:1,duration:DURATION,face:d,hitEvents:[],hitFrames:Object.create(null),finished:false,fadeTick:0,startX:f.x,startY:f.y,startedAt:Q.tick||0};
 Q.edoSusanooUltimate=u;f.facing=d;f.vx=0;f.vy=0;f.itachiPoseKey='edo-susanoo-ult';f.itachiEdoUltimateActive=true;
 f.invuln=Math.max(f.invuln||0,9);return u;
}
function inRange(f,o,e,d){
 if(!alive(o))return false;
 const forward=(o.x-f.x)*d;
 return forward>-100&&forward<=e.reach&&Math.abs(o.y-f.y)<=285;
}
function strike(f,u,e,n){
 const o=u.target,x=o&&Number.isFinite(o.x)?o.x:f.x+u.face*e.reach*.68,y=o&&Number.isFinite(o.y)?o.y-88:f.y-88;
 const mark={frame:n,x,y,kind:e.kind,final:!!e.final,hit:false};
 u.hitEvents.push(mark);if(u.hitEvents.length>8)u.hitEvents.shift();
 if(!inRange(f,o,e,u.face)||typeof window.resolveHit!=='function')return;
 const result=window.resolveHit(f,o,{damage:e.damage,hitstun:e.hitstun,blockstun:e.final?15:11,kbx:u.face*e.kbx,kby:e.kby,hitstop:e.final?10:6,meter:e.final?9:5,armorBreak:!!e.armorBreak,kind:'special',type:'special',edoSusanooUltimate:true},x,y);
 if(result&&result!=='whiff'){
  mark.hit=true;
  if(typeof window.shake==='function')window.shake(e.final?10:(e.armorBreak?6:3));
  if(typeof window.camPunch==='function')window.camPunch(e.final?0.17:0.07);
  if(typeof window.flash==='function'&&(e.final||e.armorBreak))window.flash(e.final?0.18:0.07,e.final?'#ff9c64':'#d85e43');
  if(typeof SFX!=='undefined'){if(e.final&&SFX.blackflash)SFX.blackflash();else if(SFX.heavy)SFX.heavy();}
 }
}
function tickUltimate(f,n){
 let u=Q.edoSusanooUltimate;
 if(n===1||!u||u.owner!==f){u=createUltimate(f);if(!u){endMove(f);return;}}
 u.frame=n;f.facing=u.face;f.itachiPoseKey='edo-susanoo-ult';f.itachiEdoUltimateActive=true;
 if(n<46)f.vx*=0.3;
 if(n===43&&alive(u.target)){
  const dx=(u.target.x-f.x)*u.face;
  if(dx>175&&dx<440)f.vx=u.face*Math.min(7,dx*0.045);
 }
 for(const e of EVENTS)if(n===e.frame&&!u.hitFrames[e.frame]){u.hitFrames[e.frame]=true;strike(f,u,e,n);}
 if(n===18&&typeof SFX!=='undefined'&&SFX.awaken)SFX.awaken();
 if(n>=DURATION){u.finished=true;u.fadeTick=0;f.itachiEdoUltimateActive=false;endMove(f);}
}
window.updateMove=function(f){
 if(f&&f.itachiEdo&&f.move&&f.moveKey==='ult'){f.moveFrame=(f.moveFrame||0)+1;tickUltimate(f,f.moveFrame);return;}
 return oldUpdate.apply(this,arguments);
};
if(typeof oldPose==='function')window.applyCharacterIdentityPose=function(P,f){
 oldPose.apply(this,arguments);
 if(!P||!f||!f.itachiEdo||f.moveKey!=='ult')return;
 const n=f.moveFrame||0;P.headY=-116;
 if(n<20){P.lean=-5;P.armF=[24,-57];P.armB=[-24,-57];P.legF=[79,8];P.legB=[104,-8];}
 else if(n<43){P.lean=-11;P.armF=[-40,-52];P.armB=[45,-50];P.legF=[70,12];P.legB=[114,-16];}
 else if(n<70){P.lean=18;P.armF=[58,29];P.armB=[-38,-24];P.legF=[62,21];P.legB=[120,-17];}
 else if(n<101){P.lean=-16;P.armF=[-42,-34];P.armB=[62,31];P.legF=[68,14];P.legB=[113,-15];}
 else if(n<130){P.lean=-8;P.armF=[28,-66];P.armB=[145,-44];P.legF=[81,9];P.legB=[104,-8];}
 else if(n<164){P.lean=24;P.armF=[66,28];P.armB=[-20,-68];P.legF=[56,22];P.legB=[125,-18];}
 else{P.lean=-18;P.armF=[-55,-72];P.armB=[-42,-58];P.legF=[76,9];P.legB=[110,-11];}
};
if(typeof oldReset==='function')window.resetFighter=function(f){
 if(Q.edoSusanooUltimate&&Q.edoSusanooUltimate.owner===f)Q.edoSusanooUltimate=null;
 if(f&&f.itachiEdo){f.itachiEdoUltimateActive=false;if(f.moveKey==='ult')f.itachiPoseKey='';}
 return oldReset.apply(this,arguments);
};
if(typeof oldStep==='function')window.step=function(){
 const result=oldStep.apply(this,arguments),u=Q.edoSusanooUltimate;
 if(!u)return result;
 if(typeof G!=='undefined'&&(G.mode==='menu'||G.matchOver||G.roundState==='ko')){Q.edoSusanooUltimate=null;return result;}
 if(typeof G!=='undefined'&&G.paused)return result;
 if(!u.finished&&(!u.owner||!alive(u.owner)||u.owner.moveKey!=='ult')){u.finished=true;u.fadeTick=0;if(u.owner)u.owner.itachiEdoUltimateActive=false;}
 if(u.finished){u.fadeTick=(u.fadeTick||0)+1;if(u.fadeTick>=15)Q.edoSusanooUltimate=null;}
 return result;
};
const wrap=document.getElementById('wrap');
let stage=document.getElementById('jffEdoSusanooUltimateStage');
if(!stage&&wrap){
 stage=document.createElementNS('http://www.w3.org/2000/svg','svg');stage.setAttribute('id','jffEdoSusanooUltimateStage');
 stage.setAttribute('viewBox','0 0 1280 720');stage.setAttribute('preserveAspectRatio','none');stage.setAttribute('aria-hidden','true');
 stage.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:11;pointer-events:none;overflow:hidden;display:block';wrap.appendChild(stage);
}
function point(x,y){
 const z=typeof cam!=='undefined'&&Number.isFinite(cam.zoom)?cam.zoom:1,cx=typeof cam!=='undefined'&&Number.isFinite(cam.x)?cam.x:640,cy=typeof cam!=='undefined'&&Number.isFinite(cam.y)?cam.y:360;
 return{x:640+((G&&G.shakeX)||0)+(x-cx)*z,y:360+((G&&G.shakeY)||0)+(y-cy)*z,s:z};
}
function renderUltimate(){
 if(!stage)return;
 const u=Q.edoSusanooUltimate;
 if(!u||!u.owner||typeof G==='undefined'||G.mode==='menu'||(Q.cinema&&Q.cinema.kind==='tsukuyomi')){stage.innerHTML='';return;}
 const n=u.frame||1,dir=u.face||1,fade=u.finished?Math.max(0,1-(u.fadeTick||0)/15):1,p=point(u.owner.x,u.owner.y);
 const rise=smooth(n/34),z=p.s*(.91+.075*Math.sin(n*.055)+.08*rise),base=Math.max(390,Math.min(700,p.y+3*p.s));
 const aL=n<45?-38:(n<78?18:(n<108?-24:(n<140?25:-52))),aR=n<45?34:(n<78?-58:(n<108?12:(n<140?-68:42)));
 const sw=n<45?-32:(n<78?55:(n<106?-35:(n<140?-64:(n<171?18:-78))));
 const sh=n<100?-12+Math.sin(n*.11)*5:(n<130?-42:(n<164?8:-25));
 let s='<defs><linearGradient id="edoArmorFire" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0c4"/><stop offset=".16" stop-color="#ffbe72"/><stop offset=".38" stop-color="#e65b32"/><stop offset=".72" stop-color="#741c26"/><stop offset="1" stop-color="#260c20"/></linearGradient><linearGradient id="edoTotsukaFire" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff8de"/><stop offset=".18" stop-color="#ffd0a1"/><stop offset=".42" stop-color="#ff6847"/><stop offset=".66" stop-color="#be252c"/><stop offset="1" stop-color="#4d1424"/></linearGradient><radialGradient id="edoHeatBloom"><stop stop-color="#ffb36c" stop-opacity=".34"/><stop offset=".55" stop-color="#ef442f" stop-opacity=".16"/><stop offset="1" stop-color="#4f101e" stop-opacity="0"/></radialGradient></defs>';
 s+='<g opacity="'+fade*(.2+.57*rise)+'"><ellipse cx="'+p.x+'" cy="'+(base-245*z)+'" rx="'+(190*z)+'" ry="'+(246*z)+'" fill="url(#edoHeatBloom)"/><ellipse cx="'+p.x+'" cy="'+(base-12*z)+'" rx="'+(168*z)+'" ry="'+(17*z)+'" fill="none" stroke="#ff7447" stroke-width="'+(3*z)+'" stroke-dasharray="13 12" transform="rotate('+(-n*.55)+' '+p.x+' '+(base-12*z)+')"/></g>';
 for(let i=0;i<6;i++){const x=p.x+(i-2.5)*51*z,y=base-(18+i%3*9)*z,dx=Math.sin(n*.04+i*1.8)*22*z;s+='<path d="M '+x+' '+y+' l '+dx+' -'+(17+i%3*7)*z+' l '+(dx*.55)+' -'+(14+i%2*8)*z+'" fill="none" stroke="'+(i%2?'#ff784d':'#ffe0ae')+'" stroke-width="'+(1.3*z)+'" opacity="'+(fade*.48)+'"/>';}
 // Oversized ember-red Susanoo: horn crest, lamellar body, articulated arms, Yata octagon and Totsuka.
 s+='<g transform="translate('+p.x+' '+base+') scale('+(dir*z)+' '+z+')" opacity="'+fade*(.18+.68*rise)+'">';
 s+='<path d="M -65 -152 L -91 -84 L -71 -19 L -22 -22 L -17 -92 L -18 -151 Z M 18 -151 L 18 -92 L 22 -22 L 71 -19 L 91 -84 L 65 -152 Z" fill="url(#edoArmorFire)" stroke="#ffca91" stroke-width="4"/><path d="M -66 -87 L -39 -76 L -43 -30 L -70 -30 Z M 39 -76 L 66 -87 L 70 -30 L 43 -30 Z" fill="#3b1324" stroke="#e85a3c" stroke-width="3"/>';
 s+='<path d="M -91 -192 L -133 -224 L -162 -195 L -150 -143 L -108 -116 L -62 -141 Z M 91 -192 L 133 -224 L 162 -195 L 150 -143 L 108 -116 L 62 -141 Z" fill="url(#edoArmorFire)" stroke="#ffd39f" stroke-width="5"/><path d="M -145 -191 L -112 -168 L -91 -133 M 145 -191 L 112 -168 L 91 -133" fill="none" stroke="#81202b" stroke-width="7"/>';
 s+='<path d="M -72 -198 L -104 -167 L -74 -101 L -25 -92 L 0 -125 L 25 -92 L 74 -101 L 104 -167 L 72 -198 L 37 -177 L 0 -184 L -37 -177 Z" fill="url(#edoArmorFire)" stroke="#ffdaa9" stroke-width="4"/><path d="M -58 -162 L -28 -144 L 0 -158 L 28 -144 L 58 -162 M -48 -133 L -12 -120 L 12 -120 L 48 -133" fill="none" stroke="#751b28" stroke-width="5"/>';
 s+='<path d="M -43 -278 L -70 -249 L -55 -200 L -32 -174 L 32 -174 L 55 -200 L 70 -249 L 43 -278 L 19 -262 L 0 -272 L -19 -262 Z" fill="url(#edoArmorFire)" stroke="#ffd9a5" stroke-width="4"/><path d="M -38 -246 L -17 -229 L 0 -236 L 17 -229 L 38 -246 L 29 -211 L 0 -194 L -29 -211 Z" fill="#3b1223" stroke="#ff9e65" stroke-width="3"/><path d="M -24 -229 L -7 -223 L -18 -215 Z M 24 -229 L 7 -223 L 18 -215 Z" fill="#fff0c8"/><path d="M -5 -205 L 0 -198 L 5 -205" fill="none" stroke="#ffdba5" stroke-width="2.5"/><path d="M -48 -275 L -69 -304 L -40 -293 L -29 -338 L -8 -311 L 0 -357 L 11 -311 L 33 -338 L 42 -294 L 68 -304 L 47 -274 L 30 -258 L -30 -258 Z" fill="#4f1227" stroke="#ffb86f" stroke-width="4"/>';
 s+='<g transform="rotate('+aL+' -71 -195)"><path d="M -60 -220 Q -106 -242 -132 -209 L -158 -164 L -124 -129 L -84 -160 Z" fill="url(#edoArmorFire)" stroke="#ffd09b" stroke-width="4"/><path d="M -145 -173 L -167 -130 L -139 -96 L -105 -123 L -120 -157 Z" fill="#61182a" stroke="#f27a4d" stroke-width="3"/><path d="M -153 -135 L -173 -116 L -140 -91 L -121 -112 Z" fill="#ffd2a0" stroke="#9e2830" stroke-width="3"/></g>';
 s+='<g transform="rotate('+aR+' 71 -195)"><path d="M 60 -220 Q 106 -242 132 -209 L 158 -164 L 124 -129 L 84 -160 Z" fill="url(#edoArmorFire)" stroke="#ffd09b" stroke-width="4"/><path d="M 145 -173 L 167 -130 L 139 -96 L 105 -123 L 120 -157 Z" fill="#61182a" stroke="#f27a4d" stroke-width="3"/><path d="M 153 -135 L 173 -116 L 140 -91 L 121 -112 Z" fill="#ffd2a0" stroke="#9e2830" stroke-width="3"/></g>';
 s+='<g transform="translate(-151 -209) rotate('+sh+')"><path d="M 0 -83 L 58 -58 L 83 0 L 58 58 L 0 83 L -58 58 L -83 0 L -58 -58 Z" fill="#4d1722" stroke="#ffd79f" stroke-width="5"/><path d="M 0 -66 L 46 -46 L 66 0 L 46 46 L 0 66 L -46 46 L -66 0 L -46 -46 Z" fill="url(#edoArmorFire)" stroke="#ff7d4a" stroke-width="3"/><circle r="37" fill="#411323" stroke="#fff0c4" stroke-width="2.5"/><circle r="27" fill="none" stroke="#ffbe77" stroke-width="3" stroke-dasharray="5 5"/><path d="M 0 -33 L 9 -10 L 33 0 L 9 10 L 0 33 L -9 10 L -33 0 L -9 -10 Z" fill="#fff0c7" stroke="#db5839" stroke-width="2.5"/><path d="M 0 -61 V -39 M 61 0 H 39 M 0 61 V 39 M -61 0 H -39" stroke="#fff0ce" stroke-width="3"/></g>';
 s+='<g transform="translate(137 -229) rotate('+sw+')"><path d="M -9 12 L 9 12 L 7 -34 L -7 -34 Z" fill="#361323" stroke="#ffbf89" stroke-width="2.5"/><path d="M -29 -27 Q -3 -17 28 -27 L 25 -13 Q 0 -5 -25 -13 Z" fill="#ffd59b" stroke="#a82a31" stroke-width="3"/><path d="M -5 -26 Q -15 -103 -8 -184 L 0 -356 L 10 -184 Q 16 -103 5 -26 Z" fill="url(#edoTotsukaFire)" stroke="#fff0c8" stroke-width="3.5"/><path d="M 0 -350 L 10 -185 L 1 -202 Z" fill="#fff6d8" opacity=".88"/><path d="M 1 -42 L 4 -308" stroke="#fff4d0" stroke-width="2.2"/></g></g>';
 for(const h of u.hitEvents||[]){
  const age=n-h.frame,max=h.final?23:15;if(age<0||age>max)continue;
  const q=point(h.x,h.y),alpha=(1-age/(max+1))*fade,w=(h.final?50:(h.kind==='thrust'?31:24))*q.s;
  const x1=q.x-dir*(h.final?290:225)*q.s,y1=q.y+(h.final?140:100)*q.s,x2=q.x+dir*(h.final?110:55)*q.s,y2=q.y-(h.final?210:125)*q.s;
  s+='<g opacity="'+alpha+'"><path d="M '+x1+' '+y1+' Q '+(q.x-dir*55*q.s)+' '+(q.y-100*q.s)+' '+x2+' '+y2+'" fill="none" stroke="'+(h.final?'#ff8c5a':'#e4473a')+'" stroke-width="'+w+'" stroke-linecap="round"/><path d="M '+x1+' '+y1+' Q '+(q.x-dir*55*q.s)+' '+(q.y-100*q.s)+' '+x2+' '+y2+'" fill="none" stroke="#fff0c6" stroke-width="'+(h.final?10:5)*q.s+'" stroke-linecap="round"/>';
  if(h.final){const r=(30+age*6)*q.s;s+='<circle cx="'+q.x+'" cy="'+(q.y-45*q.s)+'" r="'+r+'" fill="none" stroke="#ffc27e" stroke-width="'+(3*q.s)+'" stroke-dasharray="7 11" transform="rotate('+(n*2)+' '+q.x+' '+(q.y-45*q.s)+')"/><path d="M '+q.x+' '+(q.y-200*q.s)+' L '+(q.x+dir*90*q.s)+' '+(q.y+65*q.s)+' L '+(q.x-dir*90*q.s)+' '+(q.y+65*q.s)+' Z" fill="none" stroke="#fff0c8" stroke-width="'+(2*q.s)+'"/></g>';}
  else s+='</g>';
 }
 for(let i=0;i<8;i++){const x=p.x+Math.sin(n*.09+i*2.7)*(65+i%4*26)*z,y=base-(90+(i*43+n*(.9+i%3*.2))%340)*z;s+='<circle cx="'+x+'" cy="'+y+'" r="'+((1.3+i%3*.45)*z)+'" fill="'+(i%2?'#ff8b59':'#fff0c5')+'" opacity="'+(fade*(.28+.6*Math.abs(Math.sin(n*.08+i)))+'"/>');}
 if(n>=164&&n<=196){
  const q=smooth((n-164)/24),r=(32+q*140)*z,t=u.target&&alive(u.target)?point(u.target.x,u.target.y-65):point(u.startX+dir*430,u.startY-65);
  s+='<g opacity="'+(fade*(1-q*.2))+'"><circle cx="'+t.x+'" cy="'+t.y+'" r="'+r+'" fill="none" stroke="#ffb26f" stroke-width="'+(3*z)+'" stroke-dasharray="10 10" transform="rotate('+(-n*1.5)+' '+t.x+' '+t.y+')"/><circle cx="'+t.x+'" cy="'+t.y+'" r="'+(r*.68)+'" fill="none" stroke="#fff0c8" stroke-width="'+(1.8*z)+'" stroke-dasharray="3 8"/><path d="M '+t.x+' '+(t.y-r)+' L '+(t.x+r*.23)+' '+(t.y-r*.2)+' L '+(t.x+r)+' '+t.y+' L '+(t.x+r*.23)+' '+(t.y+r*.2)+' L '+t.x+' '+(t.y+r)+' L '+(t.x-r*.23)+' '+(t.y+r*.2)+' L '+(t.x-r)+' '+t.y+' L '+(t.x-r*.23)+' '+(t.y-r*.2)+' Z" fill="#e95137" fill-opacity=".1" stroke="#ffd8a2" stroke-width="'+(2*z)+'"/></g>';
 }
 s+='<g font-family="monospace" opacity="'+(fade*.82)+'"><text x="30" y="29" fill="#ffc18a" font-size="11" letter-spacing="3">EDO TENSEI // SUSANOO: SCARLET VERDICT</text><text x="1250" y="29" text-anchor="end" fill="#fff0c8" font-size="10" letter-spacing="2">'+Math.min(EVENTS.length,u.hitEvents.length)+' / '+EVENTS.length+' STRIKES</text></g>';
 stage.innerHTML=s;
}
if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);renderUltimate();return r;};
window.JFF_EDO_SUSANOO_ULTIMATE={ready:true,version:1,durationFrames:DURATION,events:EVENTS.map(e=>({frame:e.frame,kind:e.kind,damage:e.damage})),design:'ember-red articulated Susanoo, octagonal Yata Mirror, crimson Totsuka, live combat without match pause'};
console.info('[Edo Itachi] Fresh live Susanoo ultimate loaded; legacy cinematic pause and purple rig removed.');
})();