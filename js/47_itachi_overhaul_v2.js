/* Itachi Uchiha v2: pose choreography + full-scale Susanoo under-layer.
   Loaded after the original Outsider modules so it can correct the old skill/pose mapping
   without disturbing shared character rendering or the dedicated combat collision path. */
(function(){
  'use strict';
  if(window.__JFF_ITACHI_OVERHAUL_V2__)return;
  window.__JFF_ITACHI_OVERHAUL_V2__=true;
  const wrap=document.getElementById('wrap');
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const basePose=window.applyCharacterIdentityPose;
  if(typeof basePose==='function'){
    window.applyCharacterIdentityPose=function(P,f){
      const result=basePose.apply(this,arguments);
      if(!P||!f||f.id!=='itachi'||f.state!=='ATTACK'||!f.move)return result;
      const n=f.moveFrame||0,k=f.moveKey||'',charge=clamp(Number(f.itachiCharge)||0,0,1);
      const put=(lean,front,back,legs,hip,head,shoulder)=>{
        P.lean=lean;P.armF=front.slice();P.armB=back.slice();
        if(legs){P.legF=legs[0].slice();P.legB=legs[1].slice();}
        if(hip!==undefined)P.hipY=hip;
        if(head!==undefined)P.headY=head;
        if(shoulder!==undefined)P.shY=shoulder;
      };
      if(k==='light'){
        if(n<6)put(-7,[58,-22],[128,22],[[82,4],[101,-4]],-59,-114);
        else if(n<13)put(16,[25,38],[142,-22],[[72,12],[112,-14]],-54,-111);
        else if(n<21)put(-12,[42,-30],[130,30],[[60,-18],[119,12]],-61,-116);
        else if(n<29)put(22,[19,48],[150,44],[[67,17],[113,-16]],-53,-110);
        else put(4,[61,14],[119,20],[[86,3],[96,-4]],-57,-114);
      }else if(k==='heavy'){
        if(n<15)put(-15,[78,-48],[121,-55],[[75,12],[112,-8]],-52,-111);
        else if(n<22)put(23,[18,48],[153,50],[[69,18],[118,-18]],-51,-109);
        else if(n<31)put(9,[35,22],[139,30],[[77,4],[109,-7]],-56,-113);
        else put(-3,[61,18],[123,18],[[86,0],[98,0]],-57,-114);
      }else if(k==='s1'){
        if(f.itachiChargeFired||n>=92){
          put(20,[28,28],[151,-26],[[72,19],[112,-9]],-53,-119,-91);
        }else{
          const seals=[
            {lean:-3,a:[54,24],b:[121,20],h:-57,head:-114},
            {lean:-8,a:[35,-23],b:[145,24],h:-56,head:-116},
            {lean:0,a:[47,-35],b:[132,-28],h:-58,head:-114},
            {lean:5,a:[24,9],b:[154,-8],h:-55,head:-113},
            {lean:-6,a:[32,-14],b:[146,14],h:-57,head:-116},
            {lean:-12,a:[20,-24],b:[154,26],h:-54,head:-117}
          ];
          const q=charge*(seals.length-1),i=Math.min(seals.length-2,Math.floor(q)),t=q-i,a=seals[i],b=seals[i+1];
          put(lerp(a.lean,b.lean,t),[lerp(a.a[0],b.a[0],t),lerp(a.a[1],b.a[1],t)],[lerp(a.b[0],b.b[0],t),lerp(a.b[1],b.b[1],t)],[[84,3],[100,-3]],lerp(a.h,b.h,t),lerp(a.head,b.head,t));
        }
      }else if(k==='s2'){
        const pulse=Math.sin(n*.24)*2.2;
        put(-11+pulse,[29,-33],[145,-25],[[69,13],[117,-8]],-55,-118);
      }else if(k==='s3'){
        if(n<10)put(-9,[51,-31],[127,8],[[74,9],[108,-9]],-57,-115);
        else if(n<(f.move.startup||17)+2)put(-14,[14,-48],[151,7],[[66,13],[121,-11]],-54,-118);
        else put(8,[14,-31],[160,-18],[[81,8],[104,-5]],-56,-114);
      }else if(k==='s4'){
        if(n<10)put(-13,[37,-27],[138,25],[[66,-11],[118,8]],-61,-115);
        else if(n<20)put(13,[20,31],[147,-40],[[63,14],[126,-17]],-54,-111);
        else put(-4,[58,12],[120,15],[[87,1],[98,-1]],-57,-114);
      }else if(k==='s5'){
        if(n<10)put(-7,[53,-22],[126,12],[[79,4],[104,-3]],-57,-116);
        else if(n<(f.move.startup||19)+2)put(-12,[19,-29],[143,-3],[[68,13],[118,-11]],-55,-119);
        else put(4,[36,-12],[138,9],[[85,0],[97,-1]],-57,-114);
      }else if(k==='def'){
        if(n<(f.move.startup||5))put(-4,[34,-32],[145,33],[[82,2],[101,-2]],-57,-114);
        else put(-9,[20,-44],[155,43],[[74,8],[110,-9]],-56,-116);
      }else if(k==='ult'){
        if(n<8)put(-14,[28,-42],[150,40],[[75,11],[111,-10]],-54,-118);
        else if(n<22)put(-7,[8,-58],[170,-42],[[64,16],[122,-16]],-50,-115);
        else if(n<38)put(18,[18,45],[152,33],[[65,17],[118,-14]],-52,-111);
        else if(n<60)put(12,[28,30],[147,8],[[76,9],[111,-8]],-54,-113);
        else put(-4,[59,12],[119,13],[[87,0],[97,0]],-57,-114);
      }
      return result;
    };
  }
  const baseDetails=window.drawCharacterIdentityDetails;
  if(typeof baseDetails==='function'){
    window.drawCharacterIdentityDetails=function(f,P,fd,bx,by,shPt,hipPt,headPt,hf,ef){
      baseDetails.apply(this,arguments);
      if(!f||f.id!=='itachi'||!f.move||f.state!=='ATTACK')return;
      const k=f.moveKey,n=f.moveFrame||0;
      if(k==='s1'&&!f.itachiChargeFired&&n<92&&hf&&ef){
        const c=clamp(Number(f.itachiCharge)||0,0,1),mx=(hf.x+ef.x)*.5,my=(hf.y+ef.y)*.5;
        ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
        // Small, readable finger silhouettes make the hand-seal sequence legible on the low-res rig.
        ctx.strokeStyle='#e0b5a8';ctx.lineWidth=3.0;ctx.beginPath();
        ctx.moveTo(hf.x,hf.y);ctx.quadraticCurveTo(lerp(hf.x,mx,.62),lerp(hf.y,my,.62)-5,hf.x+(mx-hf.x)*.72,hf.y+(my-hf.y)*.72-5);
        ctx.moveTo(ef.x,ef.y);ctx.quadraticCurveTo(lerp(ef.x,mx,.62),lerp(ef.y,my,.62)+5,ef.x+(mx-ef.x)*.72,ef.y+(my-ef.y)*.72+5);
        ctx.stroke();
        ctx.strokeStyle='#f4d0c3';ctx.lineWidth=1.45;
        for(let i=0;i<3;i++){
          const off=(i-1)*3.3,spread=8+(1-c)*3;
          ctx.beginPath();ctx.moveTo(mx+off,my+off*.5);ctx.lineTo(mx+off+spread,my-6+off*.7);ctx.lineTo(mx+off+spread*1.2,my+2+off*.7);ctx.stroke();
        }
        ctx.restore();
      }
      if(k==='s1'&&f.itachiChargeFired&&n>=92&&headPt){
        ctx.save();ctx.fillStyle='#13070b';ctx.strokeStyle='#f4b3b9';ctx.lineWidth=1.0;
        ctx.beginPath();ctx.ellipse(headPt.x+fd*2.5,headPt.y+13,4.2,2.8,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
      }
      if((k==='s2'&&(f.itachiCounterUntil||0)>0)&&headPt){
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ff244a';ctx.globalAlpha=.72;ctx.lineWidth=1.4;
        ctx.beginPath();ctx.ellipse(headPt.x-fd*4.7,headPt.y+3,5.8,4.1,0,0,Math.PI*2);ctx.ellipse(headPt.x+fd*4.7,headPt.y+3,5.8,4.1,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
    };
  }
  if(!wrap)return;
  const NS='http://www.w3.org/2000/svg';
  const under=document.createElementNS(NS,'svg');
  under.setAttribute('id','jffItachiSusanooUnderlay');
  under.setAttribute('viewBox','0 0 1280 720');
  under.setAttribute('preserveAspectRatio','none');
  under.setAttribute('aria-hidden','true');
  under.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;overflow:hidden';
  under.innerHTML='<defs><linearGradient id="itV2Armor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffd7a4" stop-opacity=".62"/><stop offset=".28" stop-color="#b94e49" stop-opacity=".78"/><stop offset=".68" stop-color="#541729" stop-opacity=".76"/><stop offset="1" stop-color="#190814" stop-opacity=".82"/></linearGradient><linearGradient id="itV2Edge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0c8"/><stop offset=".45" stop-color="#ff9d83"/><stop offset="1" stop-color="#a51b39"/></linearGradient><radialGradient id="itV2Core"><stop stop-color="#fff0c6"/><stop offset=".3" stop-color="#ff8d79"/><stop offset="1" stop-color="#c62a4d" stop-opacity="0"/></radialGradient><filter id="itV2Glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.1"/></filter></defs>';
  const underDefs=under.innerHTML;
  wrap.appendChild(under);
  function project(x,y){
    const z=(typeof cam!=='undefined'&&Number.isFinite(cam.zoom))?cam.zoom:1;
    const cx=(typeof cam!=='undefined'&&Number.isFinite(cam.x))?cam.x:640;
    const cy=(typeof cam!=='undefined'&&Number.isFinite(cam.y))?cam.y:360;
    return {x:640+((typeof G!=='undefined'?G.shakeX:0)||0)+(x-cx)*z,y:360+((typeof G!=='undefined'?G.shakeY:0)||0)+(y-cy)*z,s:z};
  }
  function renderSusanoo(){
    if(typeof G==='undefined'||G.mode==='menu'||!Array.isArray(G.fighters)){under.innerHTML=underDefs;return;}
    const f=G.fighters.find(q=>q&&q.id==='itachi');
    if(!f||f.state==='DEFEAT'){under.innerHTML=underDefs;return;}
    const k=f.moveKey||'',n=f.moveFrame||0,attack=f.state==='ATTACK'&&!!f.move;
    const heavy=attack&&k==='heavy'&&n>=5&&n<=36;
    const mag=attack&&k==='s3'&&n>=8&&n<=((f.move.startup||17)+(f.move.active||4)+10);
    const ult=attack&&k==='ult';
    const awake=(f.itachiAwake||0)>0;
    if(!heavy&&!mag&&!ult&&!awake){under.innerHTML=underDefs;return;}
    const p=project(f.x,f.y),full=mag||ult||awake;
    const pulse=.82+Math.sin((f.animT||0)*.16)*.05;
    const sc=p.s*(full?1.02:.88),forward=heavy?clamp((n-10)/12,0,1):0;
    const dir=f.facing||1;
    const chest=full
      ? '<path d="M -57 -99 Q -38 -120 -19 -103 L 0 -113 L 19 -103 Q 43 -120 57 -99 L 49 -42 L 33 11 L 0 25 L -33 11 L -49 -42 Z" fill="url(#itV2Armor)" stroke="url(#itV2Edge)" stroke-width="4"/><path d="M -36 -88 Q 0 -67 36 -88 M -40 -67 Q 0 -45 40 -67 M -35 -46 Q 0 -24 35 -46 M -26 -25 Q 0 -4 26 -25 M -18 -5 Q 0 14 18 -5" fill="none" stroke="#ffd8bd" stroke-width="3.1" opacity=".88"/><path d="M -26 -94 L -10 -66 L 0 -82 L 10 -66 L 26 -94" fill="none" stroke="#fff0d3" stroke-width="2.4"/>'
      : '<path d="M -47 -83 Q -25 -101 0 -91 Q 25 -101 47 -83 L 36 -40 L 0 -23 L -36 -40 Z" fill="url(#itV2Armor)" stroke="url(#itV2Edge)" stroke-width="4"/><path d="M -29 -76 Q 0 -60 29 -76 M -27 -56 Q 0 -40 27 -56" fill="none" stroke="#ffd8bd" stroke-width="3"/>';
    const skull=full
      ? '<path d="M -29 -151 L -17 -177 L -5 -159 L 7 -179 L 18 -157 L 32 -166 L 34 -135 L 24 -115 L 0 -108 L -24 -115 L -35 -136 Z" fill="url(#itV2Armor)" stroke="url(#itV2Edge)" stroke-width="4"/><path d="M -25 -146 L -47 -171 L -27 -169 M 25 -146 L 48 -171 L 28 -168" stroke="#f6b99f" stroke-width="5" fill="none"/><path d="M -23 -136 L -5 -130 L -13 -119 M 23 -136 L 5 -130 L 13 -119" fill="none" stroke="#2a0615" stroke-width="5"/><path d="M -18 -121 L -10 -110 L 0 -120 L 10 -110 L 18 -121" fill="none" stroke="#ffdfbc" stroke-width="2.5"/>'
      : '<path d="M -25 -135 L -17 -159 L 0 -147 L 17 -159 L 26 -135 L 18 -113 L 0 -107 L -18 -113 Z" fill="url(#itV2Armor)" stroke="url(#itV2Edge)" stroke-width="3"/><path d="M -18 -133 L -5 -129 L -12 -120 M 18 -133 L 5 -129 L 12 -120" stroke="#230616" stroke-width="4" fill="none"/>';
    const shoulders='<path d="M -42 -96 Q -76 -129 -101 -102 L -112 -73 L -84 -52 L -50 -65 Z" fill="url(#itV2Armor)" stroke="url(#itV2Edge)" stroke-width="4"/><path d="M 42 -96 Q 76 -129 101 -102 L 112 -73 L 84 -52 L 50 -65 Z" fill="url(#itV2Armor)" stroke="url(#itV2Edge)" stroke-width="4"/><path d="M -95 -101 L -72 -95 L -91 -74 M 95 -101 L 72 -95 L 91 -74" fill="none" stroke="#ffe5c4" stroke-width="3"/>';
    const leftArm='<path d="M -56 -89 Q -82 -100 -91 -78 L -103 -40 L -86 -29 L -63 -59 L -35 -61 Z" fill="url(#itV2Armor)" stroke="url(#itV2Edge)" stroke-width="4"/><path d="M -101 -41 L -116 -15 L -105 -1 L -87 -20 L -86 -30 Z" fill="url(#itV2Armor)" stroke="#ffbca0" stroke-width="3"/><path d="M -112 -13 L -123 -8 L -118 2 L -104 -2" fill="url(#itV2Armor)" stroke="#ffbca0" stroke-width="2"/>';
    const rightArm=heavy
      ? '<path d="M 53 -89 Q 82 -111 98 -79 L '+(106+forward*45)+' '+(-56-forward*4)+' L '+(131+forward*48)+' '+(-31-forward*4)+' L '+(118+forward*42)+' '+(-8-forward*3)+' L '+(84+forward*24)+' '+(-35-forward*5)+' L 38 -57 Z" fill="url(#itV2Armor)" stroke="url(#itV2Edge)" stroke-width="5"/><path d="M '+(118+forward*42)+' '+(-16-forward*3)+' l 20 -7 l 11 13 l -11 15 l -20 -4 Z" fill="url(#itV2Armor)" stroke="#ffe1c0" stroke-width="4"/><path d="M '+(125+forward*42)+' '+(-14-forward*3)+' l 22 -1 M '+(125+forward*42)+' '+(-8-forward*3)+' l 19 4" stroke="#fff0d3" stroke-width="2.5"/>'
      : '<path d="M 56 -89 Q 82 -101 91 -78 L 102 -41 L 85 -29 L 63 -59 L 35 -61 Z" fill="url(#itV2Armor)" stroke="url(#itV2Edge)" stroke-width="4"/><path d="M 101 -42 L 116 -16 L 105 -2 L 87 -21 L 86 -31 Z" fill="url(#itV2Armor)" stroke="#ffbca0" stroke-width="3"/><path d="M 112 -14 L 123 -9 L 118 2 L 104 -3" fill="url(#itV2Armor)" stroke="#ffbca0" stroke-width="2"/>';
    const legs=full?'<path d="M -32 5 L -44 48 L -38 99 L -15 99 L -7 48 L 0 21 Z M 32 5 L 44 48 L 38 99 L 15 99 L 7 48 L 0 21 Z" fill="url(#itV2Armor)" stroke="url(#itV2Edge)" stroke-width="4"/><path d="M -43 49 L -10 59 M 43 49 L 10 59 M -39 82 L -16 83 M 39 82 L 16 83" stroke="#ffd8bd" stroke-width="3"/><path d="M -46 100 L -10 100 L -5 112 L -52 112 Z M 46 100 L 10 100 L 5 112 L 52 112 Z" fill="#4b1429" stroke="#ffb5a1" stroke-width="3"/>':'';
    const shield=(ult&&n>8)?'<g transform="translate(-100 -55) rotate(-13)"><path d="M 0 -53 Q 51 -30 42 8 Q 29 42 0 58 Q -30 39 -42 7 Q -49 -28 0 -53 Z" fill="url(#itV2Armor)" stroke="#ffe0b9" stroke-width="4"/><path d="M -23 -25 L 23 27 M 24 -24 L -23 27" stroke="#fff2d6" stroke-width="3"/><ellipse rx="22" ry="34" fill="none" stroke="#ffad8f" stroke-width="2.4"/></g>':'';
    const sword=(ult&&n>20)?'<g transform="translate(104 -80) rotate('+(-27+forward*10)+')"><path d="M -6 13 L -5 -82 L 0 -113 L 8 -82 L 7 13 Z" fill="#f2dfd1" stroke="#fff3d8" stroke-width="2.2"/><path d="M -15 12 L 16 12 L 15 20 L -14 20 Z" fill="#4a1226" stroke="#ffca9c" stroke-width="2.5"/><path d="M 0 20 L 0 42 M -8 23 L 8 37 M 8 23 L -8 37" stroke="#f4b68e" stroke-width="3"/></g>':'';
    const magatama=(mag&&n>(f.move.startup||17)-2)?Array.from({length:3},(_,i)=>{
      const a=(i-1)*.6+tFrame(f)*.025;
      const x=dir*(67+Math.cos(a)*14),y=-98+Math.sin(a)*25;
      return '<g transform="translate('+x+' '+y+') rotate('+(a*57.3)+')"><path d="M 0 -14 C 17 -9 14 11 0 15 C -7 7 -5 3 1 0 C 6 -3 5 -9 0 -14 Z" fill="#ffc58e" stroke="#fff0cf" stroke-width="2"/><circle cy="-3" r="2.5" fill="#55132a"/></g>';
    }).join(''):'';
    const shake=heavy?Math.sin(n*.8)*2:0;
    under.innerHTML=underDefs+
      '<g opacity="'+(pulse*(full ? .92 : .75))+'" transform="translate('+p.x+' '+(p.y-158*p.s)+' ) scale('+(sc*dir)+' '+sc+') translate(0 '+shake+')">'+
      '<ellipse cx="0" cy="122" rx="95" ry="14" fill="#d63851" opacity=".12"/>'+
      '<path d="M -28 -123 Q -47 -93 -40 -55 L -25 -22 L -31 13 L 31 13 L 25 -22 L 40 -55 Q 47 -93 28 -123 Z" fill="#130810" opacity=".72" stroke="#e56a65" stroke-width="2"/>'+
      (full?shoulders:'')+skull+shoulders+leftArm+rightArm+chest+legs+shield+sword+magatama+
      '<path d="M -24 -115 L -8 -100 L 0 -108 L 8 -100 L 24 -115" fill="none" stroke="#fff0d4" stroke-width="2.4" opacity=".8"/>'+
      '<circle cx="0" cy="-89" r="22" fill="url(#itV2Core)" opacity=".48"/>'+
      '</g>';
  }
  function tFrame(f){return f.moveFrame||0;}
  const baseRender=window.render;
  if(typeof baseRender==='function'){
    window.render=function(){const result=baseRender.apply(this,arguments);renderSusanoo();return result;};
  }
  window.JFF_ITACHI_OVERHAUL_V2_API={ready:true,posePatch:true,susanooUnderlay:true,renderer:'SVG'};
  console.info('[JFF Itachi v2] Skill-correct poses, hand-seal choreography, Yata guard and full-scale Susanoo loaded.');
})();
