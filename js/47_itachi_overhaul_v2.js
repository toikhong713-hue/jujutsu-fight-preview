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
        if((f.itachiFirePose||0)>0){
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
          const q=clamp((Number(f.itachiChargeFrames)||0)/18,0,1)*(seals.length-1),i=Math.min(seals.length-2,Math.floor(q)),t=q-i,a=seals[i],b=seals[i+1];
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
      if(k==='s1'&&(f.itachiFirePose||0)<=0&&!f.itachiChargeFired&&hf&&ef){
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
      if(k==='s1'&&(f.itachiFirePose||0)>0&&headPt){
        ctx.save();ctx.fillStyle='#13070b';ctx.strokeStyle='#f4b3b9';ctx.lineWidth=1.0;
        ctx.beginPath();ctx.ellipse(headPt.x+fd*2.5,headPt.y+13,4.2,2.8,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
      }
      if((k==='s2'&&(f.itachiCounterUntil||0)>0)&&headPt){
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ff244a';ctx.globalAlpha=.72;ctx.lineWidth=1.4;
        ctx.beginPath();ctx.ellipse(headPt.x-fd*4.7,headPt.y+3,5.8,4.1,0,0,Math.PI*2);ctx.ellipse(headPt.x+fd*4.7,headPt.y+3,5.8,4.1,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
    };
  }
  function drawSusanooBehindFighter(f){
    if(typeof ctx==='undefined'||typeof G==='undefined'||G.mode==='menu'||!f||f.id!=='itachi'||f.state==='DEFEAT')return;
    const k=f.moveKey||'',n=f.moveFrame||0,attack=f.state==='ATTACK'&&!!f.move;
    const heavy=attack&&k==='heavy'&&n>=5&&n<=36;
    const mag=attack&&k==='s3'&&n>=8&&n<=((f.move.startup||18)+(f.move.active||4)+10);
    const ult=attack&&k==='ult',awake=(f.itachiAwake||0)>0;
    if(!heavy&&!mag&&!ult&&!awake)return;
    const full=mag||ult||awake,dir=f.facing||1;
    const pulse=.86+Math.sin((f.animT||0)*.16)*.05;
    ctx.save();ctx.translate(f.x,f.y-158);ctx.scale(dir,1);
    // Game camera/world transforms are already active. Paint this before the original fighter body.
    ctx.globalAlpha=pulse*(full?.88:.68);ctx.globalCompositeOperation='source-over';
    const armor=ctx.createLinearGradient(-112,-174,116,116);
    armor.addColorStop(0,'#ffd5a0');armor.addColorStop(.25,'#c96555');armor.addColorStop(.58,'#7a2738');armor.addColorStop(1,'#2c0b1b');
    const edge=ctx.createLinearGradient(0,-178,0,105);
    edge.addColorStop(0,'#fff0cb');edge.addColorStop(.48,'#f08c7b');edge.addColorStop(1,'#8b1b36');
    ctx.save();ctx.globalAlpha*=.18;ctx.fillStyle='#ef3e5e';ctx.beginPath();ctx.ellipse(0,126,94,13,0,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.fillStyle='rgba(20,5,16,.78)';ctx.strokeStyle='#c95e61';ctx.lineWidth=2.2;
    ctx.beginPath();ctx.moveTo(-28,-127);ctx.quadraticCurveTo(-48,-96,-39,-55);ctx.lineTo(-25,-19);ctx.lineTo(-31,18);ctx.lineTo(31,18);ctx.lineTo(25,-19);ctx.lineTo(39,-55);ctx.quadraticCurveTo(48,-96,28,-127);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=armor;ctx.strokeStyle=edge;ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(-39,-104);ctx.quadraticCurveTo(-72,-133,-101,-106);ctx.lineTo(-116,-74);ctx.lineTo(-84,-50);ctx.lineTo(-49,-66);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(39,-104);ctx.quadraticCurveTo(72,-133,101,-106);ctx.lineTo(116,-74);ctx.lineTo(84,-50);ctx.lineTo(49,-66);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-96,-103);ctx.lineTo(-73,-96);ctx.lineTo(-89,-76);ctx.moveTo(96,-103);ctx.lineTo(73,-96);ctx.lineTo(89,-76);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-48,-91);ctx.quadraticCurveTo(-27,-111,0,-101);ctx.quadraticCurveTo(27,-111,48,-91);ctx.lineTo(41,-42);ctx.lineTo(28,9);ctx.lineTo(0,23);ctx.lineTo(-28,9);ctx.lineTo(-41,-42);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(255,220,191,.9)';ctx.lineWidth=2.5;
    for(let i=0;i<(full?5:3);i++){const y=-80+i*18;ctx.beginPath();ctx.moveTo(-36+i*2,y);ctx.quadraticCurveTo(0,y+20,36-i*2,y);ctx.stroke();}
    ctx.fillStyle=armor;ctx.strokeStyle=edge;ctx.lineWidth=3.2;
    ctx.beginPath();ctx.moveTo(-24,-143);ctx.lineTo(-18,-169);ctx.lineTo(-7,-154);ctx.lineTo(0,-179);ctx.lineTo(8,-154);ctx.lineTo(20,-167);ctx.lineTo(27,-141);ctx.lineTo(20,-117);ctx.lineTo(0,-106);ctx.lineTo(-20,-117);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#2a0617';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-18,-137);ctx.lineTo(-4,-132);ctx.lineTo(-11,-121);ctx.moveTo(18,-137);ctx.lineTo(4,-132);ctx.lineTo(11,-121);ctx.stroke();
    ctx.strokeStyle='#fff0ca';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-15,-116);ctx.lineTo(0,-124);ctx.lineTo(15,-116);ctx.stroke();
    ctx.fillStyle=armor;ctx.strokeStyle=edge;ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(-48,-84);ctx.quadraticCurveTo(-77,-102,-91,-74);ctx.lineTo(-106,-40);ctx.lineTo(-87,-27);ctx.lineTo(-62,-59);ctx.lineTo(-35,-57);ctx.closePath();ctx.fill();ctx.stroke();
    const reach=heavy?clamp((n-10)/12,0,1):0;
    ctx.beginPath();ctx.moveTo(48,-84);ctx.quadraticCurveTo(77,-104,91,-74);ctx.lineTo(105+reach*42,-48-reach*4);ctx.lineTo(130+reach*45,-26-reach*5);ctx.lineTo(116+reach*39,-4-reach*4);ctx.lineTo(82+reach*22,-33-reach*4);ctx.lineTo(35,-57);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#f5b18f';ctx.globalAlpha*=.8;ctx.beginPath();ctx.ellipse(0,-88,23,26,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha/=.8;
    if(full){
      ctx.fillStyle=armor;ctx.strokeStyle=edge;ctx.lineWidth=3.5;
      ctx.beginPath();ctx.moveTo(-28,10);ctx.lineTo(-43,48);ctx.lineTo(-37,99);ctx.lineTo(-14,99);ctx.lineTo(-7,49);ctx.lineTo(0,24);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(28,10);ctx.lineTo(43,48);ctx.lineTo(37,99);ctx.lineTo(14,99);ctx.lineTo(7,49);ctx.lineTo(0,24);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle='#ffd9b8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-41,52);ctx.lineTo(-11,60);ctx.moveTo(41,52);ctx.lineTo(11,60);ctx.stroke();
    }
    if(mag){
      for(let i=0;i<3;i++){
        const bx=dir*(78+i*12),by=-104+Math.sin(i*1.8+n*.18)*7;
        ctx.save();ctx.translate(dir*bx,by);ctx.rotate(n*.07+i*.6);
        ctx.fillStyle='#ffd0a0';ctx.strokeStyle='#fff0cf';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(0,-10);ctx.bezierCurveTo(13,-7,12,8,0,11);ctx.bezierCurveTo(-7,6,-5,2,1,0);ctx.bezierCurveTo(6,-3,5,-7,0,-10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
      }
    }
    ctx.restore();
  }
  const baseDrawFighter=window.drawFighter;
  if(typeof baseDrawFighter==='function'){
    window.drawFighter=function(f){
      if(f&&f.id==='itachi')drawSusanooBehindFighter(f);
      return baseDrawFighter.apply(this,arguments);
    };
  }
})();
