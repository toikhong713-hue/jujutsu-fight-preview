/* JFF Outsider Render Pipeline v1.0
   Dedicated vector/SVG renderer for Itachi. No Canvas2D drawing or shared Jujutsu VFX.
   Keeps the native fighter entity for collision, AI, movement and match rules. */
(function(){
  'use strict';
  if(window.__JFF_OUTSIDER_RENDER_V1__) return;
  window.__JFF_OUTSIDER_RENDER_V1__=true;
  const wrap=document.getElementById('wrap');
  if(!wrap)return;
  const NS='http://www.w3.org/2000/svg';
  const sys=window.JFF_OUTSIDER={tick:0,fx:[],shots:[],clone:null,burn:null,sealing:null,moon:null,reflectUntil:0,renderer:'SVG VECTOR',quality:'low',counterSerial:0};
  const root=document.createElementNS(NS,'svg');
  root.setAttribute('id','jffOutsiderStage');
  root.setAttribute('viewBox','0 0 1280 720');
  root.setAttribute('preserveAspectRatio','none');
  root.setAttribute('aria-hidden','true');
  root.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none;overflow:hidden;display:block';
  wrap.appendChild(root);
  const defs=[
    '<defs>',
    '<linearGradient id="itCloak" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#20202a"/><stop offset=".26" stop-color="#090910"/><stop offset=".62" stop-color="#15131c"/><stop offset="1" stop-color="#030307"/></linearGradient>',
    '<linearGradient id="itCloakInner" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#3b1020"/><stop offset=".5" stop-color="#09070d"/><stop offset="1" stop-color="#5b1528"/></linearGradient>',
    '<linearGradient id="itSkin" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#ffe2d8"/><stop offset=".48" stop-color="#cda69d"/><stop offset="1" stop-color="#76545c"/></linearGradient>',
    '<linearGradient id="itHair" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#27242e"/><stop offset=".42" stop-color="#0b0a11"/><stop offset="1" stop-color="#020205"/></linearGradient>',
    '<linearGradient id="itSteel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff4ef"/><stop offset=".22" stop-color="#8d8e9d"/><stop offset=".48" stop-color="#25212b"/><stop offset=".7" stop-color="#d8d6df"/><stop offset="1" stop-color="#55515f"/></linearGradient>',
    '<radialGradient id="itFire"><stop stop-color="#fff7d8"/><stop offset=".24" stop-color="#ffc36f"/><stop offset=".53" stop-color="#e7472e"/><stop offset=".81" stop-color="#641322"/><stop offset="1" stop-color="#16070d" stop-opacity="0"/></radialGradient>',
    '<radialGradient id="itBlackFlame"><stop stop-color="#050408"/><stop offset=".46" stop-color="#08080d"/><stop offset=".72" stop-color="#220715"/><stop offset=".86" stop-color="#f02a4d"/><stop offset="1" stop-color="#ff4e71" stop-opacity="0"/></radialGradient>',
    '<radialGradient id="itMoon"><stop stop-color="#ffadb9"/><stop offset=".43" stop-color="#b51636"/><stop offset=".76" stop-color="#4d0719"/><stop offset="1" stop-color="#16030b"/></radialGradient>',
    '<linearGradient id="itSusanoo"><stop stop-color="#ffb37d" stop-opacity=".24"/><stop offset=".5" stop-color="#e95a4c" stop-opacity=".48"/><stop offset="1" stop-color="#641529" stop-opacity=".22"/></linearGradient>',
    '<filter id="itGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
    '<filter id="itSoftGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.8"/></filter>',
    '</defs>'
  ].join('');
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function point(x,y){
    const z=(typeof cam!=='undefined'&&Number.isFinite(cam.zoom))?cam.zoom:1;
    const cx=(typeof cam!=='undefined'&&Number.isFinite(cam.x))?cam.x:640;
    const cy=(typeof cam!=='undefined'&&Number.isFinite(cam.y))?cam.y:360;
    return {x:640+((typeof G!=='undefined'?G.shakeX:0)||0)+(x-cx)*z,
      y:360+((typeof G!=='undefined'?G.shakeY:0)||0)+(y-cy)*z,s:z};
  }
  function fx(type,x,y,duration,data){
    const f={type:type,x:x,y:y,t:0,d:duration||30,data:data||{}};
    sys.fx.push(f);if(sys.fx.length>90)sys.fx.splice(0,sys.fx.length-90);return f;
  }
  window.JFF_OUTSIDER_FX=fx;
  function pathCrows(x,y,t,sc){
    let s='';
    for(let i=0;i<7;i++){
      const a=t*.085+i*2.399, r=(12+(i%3)*9)*(1-t/60);
      const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.65;
      const flap=Math.sin(t*.5+i)*7;
      s+='<g transform="translate('+px.toFixed(1)+' '+py.toFixed(1)+') rotate('+(a*57.2958).toFixed(1)+') scale('+(sc||1)+')"><path d="M -15 0 Q -9 -9 -2 -4 L 4 -10 L 6 -2 Q 13 -8 17 -2 L 9 2 L 14 8 L 2 5 L -5 11 L -5 4 Z" fill="#06050b" stroke="#3a2938" stroke-width=".65"/><path d="M -7 0 Q '+(-2+flap*.12)+' '+(-5-flap*.18)+' 4 -1" fill="none" stroke="#6a1d31" stroke-width=".7" opacity=".8"/></g>';
    }return s;
  }
  function drawFx(f){
    const p=point(f.x,f.y),t=f.t,d=f.d,u=clamp(t/d,0,1),fade=1-u,x=p.x,y=p.y,s=p.s;
    if(f.type==='slash'){
      return '<g opacity="'+fade+'" transform="translate('+x+' '+y+') scale('+s+')"><path d="M '+(-95+u*25)+' '+(42-u*6)+' Q -12 -88 '+(100-u*28)+' -55" fill="none" stroke="#f2e6e8" stroke-width="'+(6*(1-u)+1)+'" stroke-linecap="round" filter="url(#itGlow)"/><path d="M -90 35 Q 2 -65 95 -50" fill="none" stroke="#d7284b" stroke-width="3" stroke-linecap="round"/></g>';
    }
    if(f.type==='shock'){
      return '<g opacity="'+fade+'" transform="translate('+x+' '+y+') scale('+s+')"><ellipse rx="'+(10+t*4.3)+'" ry="'+(3+t*1.2)+'" fill="none" stroke="#f7d9df" stroke-width="2.5"/><ellipse rx="'+(6+t*3.1)+'" ry="'+(2+t*.92)+'" fill="none" stroke="#e02b4d" stroke-width="3"/><path d="M -100 0 L -45 -6 L -20 2 M 100 0 L 45 6 L 18 -2" stroke="#ff9aa9" stroke-width="2" fill="none"/></g>';
    }
    if(f.type==='crows'){
      return '<g opacity="'+fade+'">'+pathCrows(x,y,t,s)+'</g>';
    }
    if(f.type==='fire'){
      const r=(18+Math.min(1,t/18)*36)*s,charge=f.data.charge||0;
      return '<g opacity="'+fade+'" transform="translate('+x+' '+y+') scale('+s+')"><ellipse rx="'+(r*1.35)+'" ry="'+(r*.92)+'" fill="url(#itFire)" filter="url(#itGlow)"/><ellipse rx="'+(r*.72)+'" ry="'+(r*.58)+'" fill="#ff974e" opacity=".8"/><ellipse rx="'+(r*.32)+'" ry="'+(r*.26)+'" fill="#fff6d1"/>'+Array.from({length:6},(_,i)=>'<path d="M '+Math.cos(i)*r*.35+' '+Math.sin(i)*r*.2+' Q '+(Math.cos(i)*r*.8)+' '+(-r*1.25)+' '+(Math.cos(i)*r*1.08)+' '+(-r*.5)+'" stroke="#f75c37" stroke-width="3" fill="none" opacity=".8"/>').join('')+'<circle r="'+(r+charge*14)+'" fill="none" stroke="#ffd7a2" stroke-width="1" stroke-dasharray="3 8" opacity=".75"/></g>';
    }
    if(f.type==='magatama'){
      return '<g opacity="'+fade+'" transform="translate('+x+' '+y+') scale('+s+')"><ellipse rx="'+(9+t*.3)+'" ry="'+(18+t*.12)+'" fill="none" stroke="#c84860" stroke-width="2"/><path d="M 0 -19 C 23 -13 17 16 0 19 C -8 11 -7 5 1 1 C 8 -3 7 -12 0 -19 Z" fill="#f8c17e" stroke="#ffddae" stroke-width="1.5"/><circle cy="-3" r="3.2" fill="#6d1430"/><path d="M -25 0 Q 0 -10 26 0" fill="none" stroke="#ee5966" stroke-width="1.7"/></g>';
    }
    if(f.type==='amaterasu'){
      const pulse=0.7+Math.sin(t*.58)*.18, r=(20+Math.sin(t*.42)*4)*s;
      const tongues=Array.from({length:9},(_,i)=>{
        const a=(i/9)*Math.PI*2+t*.035, rx=Math.cos(a), ry=Math.sin(a);
        const x1=rx*r*.34, y1=ry*r*.34, x2=rx*r*(1.05+(i%3)*.11), y2=ry*r*(1.05+(i%3)*.11);
        const cx=rx*r*.75+Math.sin(t*.31+i)*5, cy=ry*r*.78-Math.cos(t*.27+i)*7;
        return '<path d="M '+x1+' '+y1+' Q '+cx+' '+cy+' '+x2+' '+y2+'" fill="none" stroke="'+(i%3===0?'#ff6380':'#100912')+'" stroke-width="'+(i%3===0?4.2:6.2)+'" stroke-linecap="round"/>';
      }).join('');
      return '<g opacity="'+(fade*pulse)+'" transform="translate('+x+' '+y+') scale('+s+')"><circle r="'+(r*1.35)+'" fill="url(#itBlackFlame)" opacity=".82"/><circle r="'+(r*.47)+'" fill="#050408" stroke="#2b0a1b" stroke-width="2"/>'+tongues+'<circle r="'+(r*.72)+'" fill="none" stroke="#fa315c" stroke-width="1.5" stroke-dasharray="2 7" opacity=".72"/></g>';
    }
    if(f.type==='explosion'){
      const r=16+t*5;
      return '<g opacity="'+fade+'" transform="translate('+x+' '+y+') scale('+s+')"><circle r="'+r+'" fill="url(#itFire)" filter="url(#itGlow)"/><path d="M 0 -'+r+' L 7 -12 L 26 -'+(r*.68)+' L 17 -3 L '+r+' 0 L 14 7 L '+(r*.65)+' 24 L 2 15 L -4 '+r+' L -11 14 L -'+r+' 10 L -17 0 L -'+(r*.72)+' -8 L -7 -15 Z" fill="#ef4b42" opacity=".84"/><circle r="'+(r*.38)+'" fill="#fff0c9"/></g>';
    }
    if(f.type==='moon'){
      return '<g opacity="'+(0.88*fade)+'"><rect width="1280" height="720" fill="#780b26" opacity=".38"/><rect width="1280" height="720" fill="#141019" opacity=".28"/><circle cx="'+(x||960)+'" cy="'+(y||150)+'" r="'+(90+Math.sin(t*.08)*5)+'" fill="url(#itMoon)" stroke="#ff617b" stroke-width="3" filter="url(#itGlow)"/><path d="M '+(x-52)+' '+(y-16)+' l 34 -8 18 16 30 -9 M '+(x-36)+' '+(y+33)+' l 25 -12 31 9" stroke="#4e061a" stroke-width="8" fill="none" opacity=".7"/><path d="M 0 500 Q 210 440 400 520 T 820 500 T 1280 488 L 1280 720 L 0 720 Z" fill="#07080e" opacity=".72"/></g>';
    }
    if(f.type==='seal'){
      return '<g opacity="'+fade+'" transform="translate('+x+' '+y+') scale('+s+')"><ellipse rx="'+(28+t*1.2)+'" ry="'+(65+t*.45)+'" fill="#1a0610" stroke="#f4b2ba" stroke-width="2"/><ellipse rx="'+(18+t*.8)+'" ry="'+(51+t*.32)+'" fill="none" stroke="#d12649" stroke-width="3" stroke-dasharray="5 8"/><path d="M -18 -58 L 0 -84 L 18 -58 L 0 -35 Z M -20 52 L 0 76 L 20 52" fill="#edb2bd" opacity=".8"/><text x="0" y="5" fill="#fff0ef" font-family="serif" font-size="13" text-anchor="middle" letter-spacing="3">封</text></g>';
    }
    if(f.type==='reflect'){
      return '<g opacity="'+fade+'" transform="translate('+x+' '+y+') scale('+s+')"><path d="M 0 -58 Q 45 -35 38 8 Q 26 45 0 59 Q -25 41 -37 6 Q -45 -32 0 -58 Z" fill="url(#itSusanoo)" stroke="#ffd9b0" stroke-width="3" filter="url(#itGlow)"/><path d="M -20 -28 L 18 30 M 22 -24 L -14 25" stroke="#fff0db" stroke-width="2"/><ellipse rx="20" ry="35" fill="none" stroke="#ed745c" stroke-width="2"/></g>';
    }
    if(f.type==='emote'){
      return '<g opacity="'+fade+'" transform="translate('+x+' '+y+') scale('+s+')"><circle r="'+(30+t*.4)+'" fill="none" stroke="#b92947" stroke-width="1.5" stroke-dasharray="4 7"/><circle r="'+(20+t*.22)+'" fill="none" stroke="#edb0bb" stroke-width="1"/><path d="M -7 -28 L 0 -40 L 7 -28 M -7 28 L 0 40 L 7 28" fill="none" stroke="#d64260" stroke-width="2"/></g>';
    }
    return '';
  }
  function character(f){
    const p=point(f.x,f.y),s=p.s,dir=f.facing||1;
    const t=f.animT||sys.tick, frame=f.moveFrame||0, k=f.moveKey||'', active=f.state==='ATTACK';
    let lean=active?Math.sin(frame*.22)*5:Math.sin(t*.035)*1.7;
    let armA=active?-54:7,armB=active?38:-6,legA=0,legB=0,cloak=0;
    if(f.state==='WALK'||f.state==='RUN'){legA=Math.sin(t*.18)*18;legB=-legA;cloak=Math.sin(t*.15)*2.5;}
    if(k==='light'){armA=-70+Math.sin(frame*.65)*30;armB=23;legA=frame>18?22:-8;legB=-legA*.5;}
    if(k==='heavy'){armA=-105+Math.min(1,frame/16)*32;armB=-86;cloak=Math.sin(frame*.4)*8;}
    if(k==='s1'){armA=-88;armB=-24;lean=-4;}
    if(k==='s2'){armA=-28;armB=-20;lean=-7;}
    if(k==='s3'){armA=-62;armB=30;}
    if(k==='s4'){armA=65;armB=-75;lean=8;}
    if(k==='s5'){armA=-18;armB=-5;}
    if(k==='ult'){armA=-85;armB=75;lean=-2;}
    if(f.itachiEmote>0){armA=-45;armB=-20;lean=-3;}
    const x=p.x,y=p.y;
    let under='';
    if(k==='heavy'&&active&&frame>5&&frame<34){
      under+='<g transform="translate('+x+' '+(y-80*s)+') scale('+(s*1.1)+')"><path d="M -45 20 Q -65 -18 -27 -53 L -9 -31 L 0 -49 L 15 -31 L 34 -51 Q 65 -10 42 22" fill="url(#itSusanoo)" stroke="#f17a6e" stroke-width="7" stroke-linecap="round"/><path d="M -25 -27 Q 0 0 25 -27 M -32 -7 Q 0 21 32 -7" fill="none" stroke="#ffb3a0" stroke-width="4"/></g>';
    }
    if(k==='s3'&&active||k==='ult'&&active||f.itachiAwake>0){
      under+='<g transform="translate('+x+' '+(y-80*s)+') scale('+(s*1.1)+')"><path d="M -51 53 Q -75 1 -52 -45 L -29 -29 L -14 -61 L 0 -41 L 18 -62 L 31 -28 L 52 -48 Q 75 4 51 53 L 25 31 L 0 59 L -26 32 Z" fill="url(#itSusanoo)" stroke="#eb826d" stroke-width="5"/><path d="M -35 -17 L -20 16 L 0 36 L 20 16 L 35 -17 M -25 -7 L -7 1 L 0 20 L 7 1 L 25 -7" stroke="#ffd1a4" fill="none" stroke-width="3"/><path d="M -13 -8 L -4 -2 M 13 -8 L 4 -2" stroke="#ffedc9" stroke-width="5"/></g>';
    }
    let sword='';
    if(k==='ult'&&active&&frame>14){
      sword='<g transform="translate(42 -82) rotate(-18)"><path d="M 0 25 L 2 -82 L 11 -112 L 17 -80 L 13 25 Z" fill="url(#itSteel)" stroke="#ffcf9d" stroke-width="1.5"/><path d="M -4 22 L 18 22 L 17 28 L -4 28 Z" fill="#591425" stroke="#f4b2a0" stroke-width="1.2"/><path d="M 7 28 L 7 48 M 1 30 L 13 42 M 13 30 L 1 42" stroke="#dfb184" stroke-width="3"/></g>';
    }
    const cloud='<path d="M -6 0 C -15 -4 -12 -15 -4 -14 C -1 -24 11 -18 10 -12 C 21 -13 23 -2 15 2 C 16 12 4 14 -1 8 C -9 12 -17 6 -6 0 Z" fill="#b92843" stroke="#ded5d9" stroke-width="1.3"/><path d="M -10 -3 Q 0 5 12 -6" fill="none" stroke="#eadfe2" stroke-width="1.4"/>';
    const hair='<path d="M -28 -139 L -29 -160 L -17 -151 L -13 -171 L -2 -155 L 7 -168 L 14 -151 L 28 -159 L 24 -137 Q 34 -126 27 -109 L 17 -116 L 14 -91 L 5 -113 L -3 -87 L -9 -113 L -20 -97 L -20 -124 L -31 -119 Z" fill="url(#itHair)" stroke="#302631" stroke-width="1.2"/>';
    let faceEyes='<path d="M -14 -126 L -5 -123 L -12 -119 M 7 -123 L 16 -126 L 13 -119" stroke="#29202a" stroke-width="2" fill="none"/><path d="M -14 -120 L -5 -119 M 6 -119 L 15 -120" stroke="#e92d51" stroke-width="2.4"/><circle cx="-9" cy="-120" r="1.4" fill="#ffbbc5"/><circle cx="10" cy="-120" r="1.4" fill="#ffbbc5"/>';
    const cloakPath='M -22 -104 Q -39 -101 -40 -75 L -52 -13 Q -31 0 -8 -5 L 4 -12 L 26 -5 Q 42 -13 50 -20 L 34 -82 Q 31 -102 18 -105 L 13 -86 L -13 -86 Z';
    let body='<g transform="translate('+x.toFixed(2)+' '+y.toFixed(2)+') scale('+(dir*s).toFixed(4)+' '+s.toFixed(4)+')">'+
      '<ellipse cx="0" cy="3" rx="32" ry="7" fill="#000" opacity=".38"/>'+
      '<g transform="translate(0 0)">'+
      '<path d="M -17 -47 L -24 -8 L -15 -4 L -5 -39 M 12 -44 L 23 -9 L 14 -5 L 3 -37" fill="#09080f" stroke="#3a2934" stroke-width="2"/>'+
      '<path d="M -20 -47 L -26 -8 L -17 -4 L -8 -39 M 12 -44 L 23 -9 L 14 -5 L 3 -37" fill="none" stroke="#7f293e" stroke-width="1.2"/>'+
      '<path d="'+cloakPath+'" fill="url(#itCloak)" stroke="#38303b" stroke-width="1.5"/>'+
      '<path d="M -33 -72 Q -31 -92 -15 -99 L -6 -79 L -1 -8 L -18 -8 Z" fill="url(#itCloakInner)" stroke="#8e1d38" stroke-width="1.3"/>'+
      '<path d="M 19 -98 Q 35 -84 34 -71 L 45 -22 Q 29 -12 18 -12 L 8 -79 Z" fill="#08070c" stroke="#7e1b34" stroke-width="1.5"/>'+
      '<path d="M -30 -68 Q 0 -58 31 -69" stroke="#8e1c37" stroke-width="2" fill="none"/>'+
      '<path d="M -26 -34 L -15 -31 M 17 -31 L 29 -34" stroke="#c12d4b" stroke-width="1.5"/>'+
      '<g transform="translate(18 -45) scale(.56)">'+cloud+'</g>'+
      '<path d="M -20 -88 Q -1 -80 19 -88 L 13 -72 Q 2 -62 -11 -72 Z" fill="#050509" stroke="#9a1d39" stroke-width="1.5"/>'+
      '<path d="M -14 -84 L 1 -72 L 10 -84" fill="none" stroke="#be314a" stroke-width="1.5"/>'+
      '<g transform="translate(0 -98) rotate('+lean.toFixed(1)+')">'+
      '<path d="M -20 -7 Q -23 5 -20 13 L -13 18 L -7 1 L 0 -4 L 7 1 L 13 18 L 21 12 L 19 -8 Z" fill="url(#itSkin)" stroke="#8e6267" stroke-width="1.2"/>'+
      '<ellipse cx="0" cy="-26" rx="23" ry="28" fill="url(#itSkin)" stroke="#49303b" stroke-width="1.6"/>'+
      '<path d="M -23 -27 Q -18 -49 -1 -49 Q 19 -49 24 -27 L 18 -13 L 8 -20 L 0 -12 L -8 -21 L -17 -13 Z" fill="url(#itHair)"/>'+
      '<path d="M -25 -28 Q -31 -4 -20 10 L -17 -17 L -9 -31 L -12 -7 L -2 -28 L 2 -13 L 11 -30 L 17 -13 L 23 -24 L 21 -42 L 8 -50 L -11 -48 Z" fill="url(#itHair)" stroke="#2a2530" stroke-width="1"/>'+
      '<path d="M -21 -31 Q 0 -39 21 -31 L 20 -22 Q 0 -28 -20 -21 Z" fill="#1b1b25" stroke="#8c8b9b" stroke-width="1.2"/>'+
      '<path d="M -6 -29 L 5 -21 L -5 -21 Z" fill="#09090f"/>'+
      faceEyes+
      '<path d="M -4 -7 L 1 -5 L 5 -7" fill="none" stroke="#875b67" stroke-width="1.3"/>'+
      '<path d="M -14 -3 Q 0 3 13 -3" fill="none" stroke="#8f394f" stroke-width="1"/>'+
      '<path d="M -24 -21 Q -31 1 -20 14 L -16 -8 L -9 -18 M 20 -22 Q 30 1 17 12 L 14 -8 L 7 -17" fill="url(#itHair)" stroke="#29212b" stroke-width="1.2"/>'+
      '</g>'+
      '<g transform="translate(0 -85)">'+
      '<g transform="rotate('+armA.toFixed(1)+' -25 -78)"><path d="M -26 -79 Q -42 -72 -43 -52 L -38 -38 L -26 -43 L -25 -61 Z" fill="#090910" stroke="#4e2735" stroke-width="2"/><path d="M -38 -43 L -36 -24 L -30 -20 L -25 -31 L -27 -44" fill="url(#itSkin)" stroke="#8a606a" stroke-width="1.2"/><path d="M -33 -25 L -39 -16 L -34 -10 L -26 -19" fill="url(#itSkin)" stroke="#8a606a" stroke-width="1.2"/></g>'+
      '<g transform="rotate('+armB.toFixed(1)+' 25 -77)"><path d="M 25 -80 Q 41 -72 41 -55 L 35 -38 L 25 -42 L 26 -60 Z" fill="#0b0a12" stroke="#4e2735" stroke-width="2"/><path d="M 35 -43 L 40 -25 L 34 -19 L 26 -31 L 27 -44" fill="url(#itSkin)" stroke="#8a606a" stroke-width="1.2"/><path d="M 35 -25 L 44 -17 L 40 -10 L 31 -19" fill="url(#itSkin)" stroke="#8a606a" stroke-width="1.2"/></g>'+
      '<path d="M -39 -56 Q -21 -64 -7 -57 L -9 -49 Q -22 -43 -34 -48 Z M 8 -57 Q 24 -65 40 -56 L 35 -48 Q 21 -42 10 -49 Z" fill="#111018" stroke="#8f203a" stroke-width="1.1"/>'+
      '</g>'+sword+
      '<path d="M -35 -74 L -26 -69 M 28 -70 L 35 -65" stroke="#e8b5bd" stroke-width="1" opacity=".45"/>'+
      '</g>';
    let extras='';
    if(f.itachiCharge>0){
      extras+='<g transform="translate('+x+' '+(y-105*s)+') scale('+s+')"><circle r="'+(22+f.itachiCharge*.5)+'" fill="url(#itFire)" opacity=".9"/><circle r="'+(30+f.itachiCharge*.55)+'" fill="none" stroke="#ffd4a0" stroke-width="2" stroke-dasharray="4 7"/><path d="M -42 0 Q -14 -25 0 -18 Q 16 -12 42 0" fill="none" stroke="#e94430" stroke-width="3"/></g>';
    }
    if(f.itachiEmote>0){
      extras+='<g transform="translate('+x+' '+(y-118*s)+') scale('+s+')"><circle r="12" fill="#240714" stroke="#d6294d" stroke-width="2"/><path d="M 0 -10 L 4 -3 L 10 0 L 4 3 L 0 10 L -4 3 L -10 0 L -4 -3 Z" fill="#fa4262"/><circle r="3" fill="#ffe7eb"/><text x="24" y="-14" fill="#f5bcc7" font-size="9" font-family="monospace">+5% CHAKRA</text></g>';
    }
    if(f.itachiAwake>0){
      extras+='<g transform="translate('+x+' '+(y-82*s)+') scale('+s+')"><ellipse rx="72" ry="100" fill="none" stroke="#ef765e" stroke-width="2" opacity=".5" stroke-dasharray="8 12"/><path d="M -60 -20 L -78 -40 M 58 4 L 77 28 M -38 60 L -58 80" stroke="#ffa27d" stroke-width="3" fill="none"/></g>';
    }
    return under+extras+body;
  }
  function render(){
    if(typeof G==='undefined'||G.mode==='menu'){
      root.innerHTML=defs;sys.fx.length=0;sys.shots.length=0;sys.clone=null;sys.burn=null;sys.burns=[];sys.moon=null;sys.genjutsu=null;sys.sealing=null;
      const canvas=document.getElementById('cv');if(canvas)canvas.style.filter='';return;
    }
    const canvas=document.getElementById('cv');if(canvas)canvas.style.filter=sys.moon?'grayscale(1) contrast(1.35) saturate(.45)':'';
    const active=G.fighters||[];
    const outsider=active.filter(f=>f&&f.id==='itachi');
    // Effects tick in a dedicated SVG pass, not through the game's canvas VFX pools.
    let back='';
    for(const f of sys.fx)back+=drawFx(f);
    for(const q of sys.shots){
      const p=point(q.x,q.y),z=p.s;
      if(q.kind==='fireball'){
        back+='<g transform="translate('+p.x+' '+p.y+') scale('+z+')"><ellipse rx="'+q.r+'" ry="'+(q.r*.79)+'" fill="url(#itFire)" filter="url(#itGlow)"/><ellipse rx="'+(q.r*.42)+'" ry="'+(q.r*.36)+'" fill="#fff0c8"/><path d="M '+(-q.r*1.5)+' 0 Q '+(-q.r*.5)+' -15 '+(-q.r*.9)+' -'+(q.r*.7)+' M '+(-q.r*1.25)+' 8 Q '+(-q.r*.2)+' 22 '+(-q.r*.8)+' '+(q.r*.6)+'" stroke="#ef5437" stroke-width="4" fill="none"/></g>';
      }else if(q.kind==='magatama'){
        back+='<g transform="translate('+p.x+' '+p.y+') rotate('+(q.rot||0)+') scale('+z+')"><path d="M 0 -19 C 24 -14 19 16 0 20 C -9 11 -7 4 1 0 C 8 -4 7 -12 0 -19 Z" fill="#ffbd88" stroke="#fff0ce" stroke-width="1.6"/><circle cy="-4" r="3.5" fill="#78162f"/><ellipse rx="16" ry="25" fill="none" stroke="#e84761" stroke-width="1.7"/><path d="M -26 0 Q 0 -12 28 0" stroke="#ff8a78" stroke-width="2" fill="none"/></g>';
      }else if(q.kind==='shuriken'){
        back+='<g transform="translate('+p.x+' '+p.y+') rotate('+(q.rot*90||0)+') scale('+z+')"><path d="M 0 -23 L 5 -6 L 22 0 L 5 5 L 0 23 L -5 5 L -22 0 L -5 -6 Z" fill="url(#itSteel)" stroke="#fff0d5" stroke-width="1.5"/><circle r="4" fill="#561527" stroke="#e9b3a5" stroke-width="1.2"/><path d="M 8 -4 L 21 -9 L 25 -3 L 11 1 Z" fill="#6b1026" stroke="#ff9b7b" stroke-width="1.2"/><path d="M 15 -8 L 21 -7 L 22 -3 L 16 -4 Z" fill="#ffd59b"/><path d="M -28 0 L -42 -7 M -28 0 L -42 7" stroke="#a81d3d" stroke-width="2"/></g>';
      }
    }
    if(sys.clone){
      const c=sys.clone,p=point(c.x,c.y),alpha=clamp(1-c.t/c.d,0,1);
      back+='<g opacity="'+(.8*alpha)+'" transform="translate('+p.x+' '+p.y+') scale('+(p.s*(c.face||1))+' '+p.s+')"><path d="M -22 -106 Q -38 -101 -43 -65 L -55 -8 L -21 -3 L 0 -18 L 24 -3 L 53 -12 L 35 -75 Q 30 -104 14 -107 Z" fill="#101019" stroke="#a51b39" stroke-width="2" stroke-dasharray="5 4"/><ellipse cy="-126" rx="23" ry="27" fill="#101018" stroke="#d52d4d" stroke-width="2"/><path d="M -24 -130 L -27 -157 L -14 -147 L -5 -165 L 7 -147 L 21 -158 L 22 -129 Z" fill="#05050a"/><path d="M -15 -126 L -5 -122 M 6 -122 L 16 -126" stroke="#ff4d68" stroke-width="2.5"/><path d="M -25 -91 L 25 -35 M 25 -92 L -25 -35" stroke="#84223b" stroke-width="2" opacity=".8"/><g transform="translate(15 -49) scale(.5)"><path d="M -6 0 C -14 -6 -10 -15 -3 -14 C 0 -22 10 -18 9 -11 C 18 -12 20 -2 13 2 C 13 10 3 12 -1 7 C -8 10 -15 4 -6 0 Z" fill="#b92843" stroke="#d9c8ce"/></g></g>';
    }
    if(sys.moon&&sys.moon.t<sys.moon.d){
      const o=sys.moon.target||outsider[0];
      const p=o?point(o.x,o.y):{x:970,y:155,s:1};
      back+='<g opacity="'+clamp(1-sys.moon.t/sys.moon.d,0,1)+'"><rect width="1280" height="720" fill="#280716" opacity=".15"/><circle cx="'+(p.x+180*p.s)+'" cy="145" r="70" fill="url(#itMoon)" stroke="#ff456a" stroke-width="2.5"/><path d="M 0 0 L 1280 0 L 1280 720 L 0 720 Z" fill="#920e2b" opacity=".10"/><path d="M '+(p.x-70)+' 390 L '+(p.x+70)+' 390 L '+(p.x+35)+' 520 L '+(p.x-40)+' 520 Z" fill="#10060c" opacity=".36"/><g transform="translate('+p.x+' '+(p.y-105)+')" opacity=".58"><path d="M -7 -86 L 7 -86 L 7 62 L -7 62 Z M -48 -30 L 48 -30 L 48 -16 L -48 -16 Z" fill="#12080d" stroke="#6b1428" stroke-width="2"/><path d="M -38 -70 L -15 -60 M 12 -50 L 35 -39 M -38 15 L -15 26 M 12 37 L 34 48" stroke="#a42c43" stroke-width="2"/></g></g>';
    }
    for(const b of (sys.burns||[])){
      if(b&&b.kind==='amaterasu'&&b.target&&b.target.hp>0){
        back+=drawFx({type:'amaterasu',x:b.target.x,y:b.target.y-72,t:(sys.tick%24),d:30,data:{}});
      }
    }
    if(sys.sealing&&sys.sealing.target&&sys.sealing.t<sys.sealing.d){
      const o=sys.sealing.target,p=point(o.x,o.y);
      back+='<g opacity="'+clamp(1-sys.sealing.t/sys.sealing.d,0,1)+'">'+drawFx({type:'seal',x:o.x,y:o.y-75,t:sys.sealing.t,d:sys.sealing.d,data:{}}).replace(/<g opacity="[^"]*">/,'<g opacity=".95">')+'</g>';
    }
    let people='';
    for(const f of active){
      if(!f||f.id!=='itachi')continue;
      // Appearance stays on the original game fighter rig and the existing Itachi identity details.
      // SVG draws only Outsider-authored effects around the unchanged character.
      const cp=point(f.x,f.y), cz=cp.s, activeMove=f.moveKey||'', frame=f.moveFrame||0, attacking=f.state==='ATTACK';
      if(f.itachiCounterUntil>sys.tick){
        const p=point(f.x,f.y-82);
        people+='<g transform="translate('+p.x+' '+p.y+') scale('+p.s+')"><ellipse rx="57" ry="92" fill="none" stroke="#d32b4f" stroke-width="2" stroke-dasharray="7 9"/><path d="M -40 -70 L -20 -80 M 38 -50 L 55 -35" stroke="#ff8da2" stroke-width="3"/></g>';
      }
      if(f.itachiMirrorUntil>sys.tick){
        const p=point(f.x+f.facing*45,f.y-88);
        people+=drawFx({type:'reflect',x:f.x+f.facing*45,y:f.y-88,t:sys.tick%28,d:28,data:{}});
      }
    }
    root.innerHTML=defs+back+people;
  }
  const baseRender=window.render;
  if(typeof baseRender==='function'){
    window.render=function(){baseRender.apply(this,arguments);render();};
  }
  window.JFF_OUTSIDER_RENDER={ready:true,renderer:'SVG EFFECT OVERLAY + ORIGINAL CHARACTER APPEARANCE',usesCanvas2DForCharacter:true,usesCanvas2DForEffects:false,quality:'low',setQuality:q=>{sys.quality=q==='high'?'high':'low';}};
  console.info('[JFF Outsider] SVG effect overlay ready; original Itachi appearance preserved.');
})();