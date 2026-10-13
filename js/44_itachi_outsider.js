/* ===== ITACHI UCHIHA / OUTSIDER TRAINING CHARACTER v1 =====
   A native game fighter: shared movement, hitboxes, damage, projectiles and AI.
   Training-only and kept outside the Jujutsu roster.
*/
(function(){
  'use strict';
  if(window.__JFF_ITACHI_OUTSIDER_V1__) return;
  window.__JFF_ITACHI_OUTSIDER_V1__=true;

  const ITACHI_MOVES={
    light:{name:'Crow Talon // Three-Beat Kunai',kind:'light',startup:5,active:5,recovery:9,damage:7,hitstun:16,blockstun:9,kbx:2.6,kby:0,hitbox:{x:24,y:-96,w:72,h:42},advance:1.7,hitstop:5,meter:4,cancels:{light:1,heavy:1,skill:1,dash:1},cancelFrom:6,cancelTo:20},
    heavy:{name:'Uchiha Punishment // Kunai Cross',kind:'heavy',startup:12,active:6,recovery:19,damage:19,hitstun:26,blockstun:15,kbx:9,kby:-6,hitbox:{x:27,y:-102,w:92,h:56},advance:3.1,hitstop:10,meter:9,cancels:{skill:1,dash:1,ult:1},cancelFrom:15,cancelTo:35},
    air:{name:'Crow Dive',kind:'air',startup:6,active:6,recovery:12,damage:10,hitstun:18,blockstun:10,kbx:4.5,kby:1.5,hitbox:{x:18,y:-70,w:78,h:54},advance:1.5,hitstop:6,meter:5,cancels:{dash:1},cancelFrom:7,cancelTo:22},
    s1:{name:'Sharingan // Tsukuyomi',kind:'skill1',startup:20,active:1,recovery:24,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,immobilize:{duration:108},cost:24,cd:520,meter:10,aura:'itachiGenjutsu'},
    s2:{name:'Fire Style // Phoenix Flower',kind:'skill2',startup:22,active:1,recovery:22,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,projectile:{type:'fuga',damage:22,hitstun:25,blockstun:15,kbx:8,kby:-4,speed:15,w:58,h:48,life:96,hitstop:8},cost:20,cd:300,meter:8,aura:'flame'},
    s3:{name:'Mangekyo // Amaterasu',kind:'skill3',startup:29,active:1,recovery:28,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,projectile:{type:'itachi_amaterasu',damage:31,hitstun:31,blockstun:20,kbx:11,kby:-7,speed:12,w:66,h:58,life:112,hitstop:12,armorBreak:true},cost:32,cd:560,meter:12,aura:'itachiAmaterasu'},
    s4:{name:'Crow Clone // Substitution Strike',kind:'skill4',startup:12,active:12,recovery:22,damage:8,hitstun:17,blockstun:10,kbx:5,kby:-3,hitbox:{x:24,y:-116,w:150,h:88},advance:5.3,hitstop:6,multiHit:true,hitInterval:6,cost:22,cd:390,meter:10,aura:'itachiCrows'},
    s5:{name:'Shuriken Shadow Volley',kind:'skill5',startup:18,active:1,recovery:24,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,projectile:{type:'itachi_shuriken',damage:25,hitstun:28,blockstun:15,kbx:9,kby:-5,speed:19,w:52,h:52,life:98,hitstop:10},cost:25,cd:420,meter:10,aura:'itachiCrows'},
    def:{name:'Sharingan Guard',kind:'def',startup:4,active:44,recovery:14,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:18,cd:440,meter:0,aura:'itachiGuard'},
    ult:{name:'Mangekyo Genjutsu // Tsukuyomi: 72 Hours',kind:'ult',startup:54,active:1,recovery:42,damage:0,hitstun:0,blockstun:0,kbx:0,kby:0,hitbox:null,cost:0,cd:0,meter:0,ultType:'itachi',invuln:52,aura:'itachiGenjutsu'}
  };

  CHARS.itachi={
    name:'ITACHI UCHIHA',short:'ITACHI',moves:ITACHI_MOVES,
    colors:{skin:'#e4c5b8',skin2:'#b99188',hair:'#17141c',hair2:'#08080e',top:'#101018',top2:'#25151d',bottom:'#080910',accent:'#e3324c',aura:'#e3324c',energy:'#a5122d',rim:'#ff9baa'},
    hp:200,walk:3.65,jump:-14.5,weight:0.98,awakening:'sharingan',trainingOnly:true,outsider:true
  };

  /* Give the shared rig Itachi's reserved stance without replacing the fighter rig. */
  const baseIdentityPose=window.applyCharacterIdentityPose;
  if(typeof baseIdentityPose==='function'){
    window.applyCharacterIdentityPose=function(P,f){
      if(f&&f.id==='itachi'&&(f.state==='IDLE'||f.state==='WALK')){
        const t=f.animT||0,s=Math.sin(t*.045),s2=Math.sin(t*.095);
        if(f.state==='WALK'){
          P.hipY=-57-Math.abs(s)*2.2;P.shY=-95+Math.sin(t*.07)*.5;P.headY=-113+Math.sin(t*.08)*.5;
          P.lean=5+s*2.4;P.armF=[62+s2*2,20+s*2];P.armB=[118-s2*2,12-s*2];
          P.legF=[86+s*25,7+Math.max(0,-s)*18];P.legB=[97-s*23,-7+Math.max(0,s)*16];
        }else{
          P.hipY=-57+s*0.7;P.shY=-95;P.headY=-114+s2*.5;P.lean=2+s*1.1;
          P.armF=[66+s2*1.5,19+s*1.4];P.armB=[113-s*1.5,14-s2*1.2];
          P.legF=[88+s*1.1,5];P.legB=[96-s*1.1,-6];
        }
        return true;
      }
      return baseIdentityPose.apply(this,arguments);
    };
  }

  function drawAkatsukiCloud(cx,cy,scale){
    ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);
    ctx.beginPath();ctx.moveTo(-10,1);
    ctx.bezierCurveTo(-17,-1,-17,-10,-10,-12);
    ctx.bezierCurveTo(-7,-20,2,-18,3,-12);
    ctx.bezierCurveTo(12,-17,18,-8,12,-3);
    ctx.bezierCurveTo(17,4,8,10,1,6);
    ctx.bezierCurveTo(-4,11,-14,8,-10,1);ctx.closePath();
    ctx.fillStyle='#c92b42';ctx.strokeStyle='rgba(235,220,220,.88)';ctx.lineWidth=1.7;ctx.fill();ctx.stroke();
    ctx.restore();
  }
  function drawItachiIdentity(f,P,fd,bx,by,shPt,hipPt,headPt,hf,ef){
    if(!f||f.id!=='itachi')return;
    const t=f.animT||0, sway=Math.sin(t*.11)*1.8;
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';

    /* Long black side locks and rear hair: overlaid on the existing animated head. */
    ctx.strokeStyle='#08080e';ctx.lineWidth=5.2;
    ctx.beginPath();
    ctx.moveTo(headPt.x-fd*10,headPt.y-5);
    ctx.quadraticCurveTo(headPt.x-fd*17,headPt.y+11,headPt.x-fd*16+sway,shPt.y+18);
    ctx.lineTo(headPt.x-fd*10+sway,hipPt.y+7);
    ctx.moveTo(headPt.x+fd*9,headPt.y-4);
    ctx.quadraticCurveTo(headPt.x+fd*17,headPt.y+12,headPt.x+fd*15-sway,shPt.y+17);
    ctx.lineTo(headPt.x+fd*10-sway,hipPt.y+2);ctx.stroke();

    /* Slashed Konoha forehead protector. */
    ctx.fillStyle='#262630';ctx.strokeStyle='#777783';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(headPt.x-fd*11,headPt.y-7);ctx.quadraticCurveTo(headPt.x,headPt.y-11,headPt.x+fd*11,headPt.y-6);
    ctx.lineTo(headPt.x+fd*10,headPt.y+1);ctx.quadraticCurveTo(headPt.x,headPt.y-2,headPt.x-fd*10,headPt.y+2);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#c5c3cc';ctx.lineWidth=1.5;ctx.beginPath();
    ctx.moveTo(headPt.x-fd*3,headPt.y-9);ctx.lineTo(headPt.x+fd*4,headPt.y+1);
    ctx.moveTo(headPt.x-fd*4,headPt.y+1);ctx.lineTo(headPt.x+fd*3,headPt.y-8);ctx.stroke();

    /* Mangekyo-red eyes; glow only during a technique or awakening. */
    const eyeHot=!!(f.awakened||f.moveKey==='s1'||f.moveKey==='ult');
    ctx.fillStyle=eyeHot?'#ff2748':'#9d263b';
    ctx.beginPath();ctx.ellipse(headPt.x-fd*4.7,headPt.y+3,3.1,1.35,0,0,Math.PI*2);ctx.ellipse(headPt.x+fd*4.7,headPt.y+3,3.1,1.35,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#10090e';ctx.beginPath();ctx.arc(headPt.x-fd*4.7,headPt.y+3,1.05,0,Math.PI*2);ctx.arc(headPt.x+fd*4.7,headPt.y+3,1.05,0,Math.PI*2);ctx.fill();
    if(eyeHot){
      ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.4+.2*Math.sin(t*.34);ctx.strokeStyle='#ff2047';ctx.lineWidth=1.2;
      ctx.beginPath();ctx.ellipse(headPt.x-fd*4.7,headPt.y+3,5.2,3.6,0,0,Math.PI*2);ctx.ellipse(headPt.x+fd*4.7,headPt.y+3,5.2,3.6,0,0,Math.PI*2);ctx.stroke();
    }

    /* High collar, red piping and small Akatsuki cloud insignia. */
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#09090f';ctx.beginPath();ctx.moveTo(shPt.x-fd*10,shPt.y+3);ctx.lineTo(shPt.x+fd*1,shPt.y+1);ctx.lineTo(shPt.x+fd*7,shPt.y+15);ctx.lineTo(shPt.x+fd*1,shPt.y+22);ctx.lineTo(shPt.x-fd*7,shPt.y+14);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(155,26,48,.95)';ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(shPt.x-fd*8,shPt.y+12);ctx.lineTo(hipPt.x-fd*6,hipPt.y+13);
    ctx.moveTo(shPt.x+fd*7,shPt.y+12);ctx.lineTo(hipPt.x+fd*7,hipPt.y+12);ctx.stroke();
    drawAkatsukiCloud((shPt.x+hipPt.x)*.5+fd*2,(shPt.y+hipPt.y)*.5+7,.72);
    drawAkatsukiCloud(shPt.x-fd*12,shPt.y+26,.48);

    /* Short kunai in the hand during strikes, aligned to the animated wrist. */
    if(f.state==='ATTACK'&&f.move&&(f.moveKey==='light'||f.moveKey==='heavy'||f.moveKey==='air')){
      const ang=((P.armF[0]+P.armF[1])*Math.PI/180),dir=fd;
      ctx.save();ctx.translate(hf.x,hf.y);ctx.rotate(ang);
      ctx.strokeStyle='#a8aab5';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(dir*22,0);ctx.stroke();
      ctx.fillStyle='#d6d8df';ctx.beginPath();ctx.moveTo(dir*21,-3.5);ctx.lineTo(dir*33,0);ctx.lineTo(dir*21,3.5);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#4e343d';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(dir*5,-4);ctx.lineTo(dir*5,4);ctx.stroke();ctx.restore();
    }
    ctx.restore();
  }

  const baseIdentityDetails=window.drawCharacterIdentityDetails;
  if(typeof baseIdentityDetails==='function'){
    window.drawCharacterIdentityDetails=function(f,P,fd,bx,by,shPt,hipPt,headPt,hf,ef){
      baseIdentityDetails.apply(this,arguments);
      drawItachiIdentity(f,P,fd,bx,by,shPt,hipPt,headPt,hf,ef);
    };
  }

  /* The projectile uses the engine's normal collision/lifetime path. Only its art is custom. */
  const baseDrawProjectiles=window.drawProjectiles;
  if(typeof baseDrawProjectiles==='function'){
    window.drawProjectiles=function(){
      baseDrawProjectiles.apply(this,arguments);
      if(!G.projectiles)return;
      for(const p of G.projectiles){
        if(!p.owner||p.owner.id!=='itachi'||(p.type!=='itachi_amaterasu'&&p.type!=='itachi_shuriken'))continue;
        const t=p.t||0,dir=Math.sign(p.vx)||1;
        ctx.save();ctx.translate(p.x,p.y);ctx.globalCompositeOperation='lighter';
        if(p.type==='itachi_amaterasu'){
          const pulse=1+Math.sin(t*.42)*.10;
          const halo=ctx.createRadialGradient(0,0,2,0,0,48*pulse);
          halo.addColorStop(0,'rgba(255,45,68,.92)');halo.addColorStop(.3,'rgba(90,0,18,.86)');halo.addColorStop(.72,'rgba(8,5,12,.72)');halo.addColorStop(1,'rgba(30,0,8,0)');
          ctx.fillStyle=halo;ctx.beginPath();ctx.ellipse(0,0,45*pulse,34*pulse,0,0,Math.PI*2);ctx.fill();
          ctx.globalCompositeOperation='source-over';ctx.fillStyle='#09070d';
          for(let i=0;i<5;i++){
            const x=-dir*(8+i*7),y=Math.sin(t*.35+i*1.9)*8;
            ctx.beginPath();ctx.moveTo(x-8,y+14);ctx.quadraticCurveTo(x-14,y-3,x-5,y-13-Math.sin(t*.3+i)*4);ctx.quadraticCurveTo(x+1,y-4,x+3,y+9);ctx.closePath();ctx.fill();
          }
          ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,43,68,.9)';ctx.lineWidth=2;
          ctx.beginPath();ctx.moveTo(-dir*72,-8);ctx.quadraticCurveTo(-dir*38,Math.sin(t*.2)*8,-dir*8,0);ctx.stroke();
        }else{
          ctx.rotate(t*.32);
          for(let k=0;k<4;k++){ctx.rotate(Math.PI/2);ctx.fillStyle='#c4c8d2';ctx.strokeStyle='#34313c';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(5,-4);ctx.lineTo(0,0);ctx.lineTo(-5,-4);ctx.closePath();ctx.fill();ctx.stroke();}
          ctx.fillStyle='#17131d';ctx.beginPath();ctx.arc(0,0,4.5,0,Math.PI*2);ctx.fill();
          ctx.strokeStyle='rgba(245,245,255,.8)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.stroke();
        }
        ctx.restore();
      }
    };
  }

  /* Keep the ultimate inside updateMove's ordinary timing and recovery path. */
  const baseStartMove=window.startMove;
  if(typeof baseStartMove==='function'){
    window.startMove=function(f,key,isBF){
      const ok=baseStartMove.apply(this,arguments);
      if(ok&&f&&f.id==='itachi'){if(key==='ult')f.itachiUltSerial=(f.itachiUltSerial||0)+1;if(key==='s1')f.itachiGenjutsuSerial=(f.itachiGenjutsuSerial||0)+1;if(key==='ult')f.invuln=Math.max(f.invuln||0,52);}
      return ok;
    };
  }
  const baseUpdateMove=window.updateMove;
  if(typeof baseUpdateMove==='function'){
    window.updateMove=function(f){
      if(!f||f.id!=='itachi')return baseUpdateMove.apply(this,arguments);
      const move=f.move,key=f.moveKey;
      const result=baseUpdateMove.apply(this,arguments);
      if(!move)return result;
      const frame=(f.move===move)?f.moveFrame:-1;
      if(key==='s1'&&frame===move.startup&&f.itachiGenjutsuEffectSerial!==f.itachiGenjutsuSerial){
        f.itachiGenjutsuEffectSerial=f.itachiGenjutsuSerial||1;flash(.38,'#d7193f');shake(7);camPunch(.12);
        ring(f.x+f.facing*42,f.y-94,'#ff294c',72,30);ring(f.x+f.facing*42,f.y-94,'#f4dbe4',42,24);
        floatText(f.opp?f.opp.x:f.x,f.y-178,'TSUKUYOMI','#ff526d',18,52);
      }
      if(key==='s4'&&frame===move.startup){
        SFX.dash();flash(.22,'#e32949');shake(7);
        for(let i=0;i<4;i++)pushAfterimage(f,computePose(f));
        burst(f.x-f.facing*18,f.y-78,12,'#17131e',3,8,22);
        burst(f.x-f.facing*18,f.y-78,7,'#c62542',3,7,18);
      }
      if(key==='ult'&&frame===move.startup&&f.itachiUltImpactSerial!==f.itachiUltSerial){
        f.itachiUltImpactSerial=f.itachiUltSerial||1;
        const o=f.opp,cx=o?o.x:f.x+f.facing*180,cy=o?o.y-72:f.y-72;
        flash(.72,'#a90b2c');shake(22);camPunch(.30);G.slowmoTarget=Math.max(G.slowmoTarget||0,20);
        SFX.domain();ring(cx,cy,'#ff2448',150,42);ring(cx,cy,'#f4e7ed',88,36);
        burst(cx,cy,36,'#e21c42',8,13,34);burst(cx,cy,18,'#fff1f4',5,9,24);
        floatText(cx,cy-102,'MANGEKYO // TSUKUYOMI','#ff526d',21,76);
        if(o&&o.state!=='DEFEAT'&&o.state!=='VICTORY'&&o.state!=='TRAPPED'&&!(o.state==='ATTACK'&&o.move&&o.move.kind==='ult')){
          resolveHit(f,o,{damage:56,hitstun:58,blockstun:26,kbx:14,kby:-10,hitstop:20,armorBreak:true,kind:'ult',type:'special',meter:0},cx,cy);
          o.immobilize=Math.max(o.immobilize||0,44);
        }
      }
      return result;
    };
  }

  console.info('[JFF Outsider] Itachi Uchiha registered as a Training-only Outsider.');
})();