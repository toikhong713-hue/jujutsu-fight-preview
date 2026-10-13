/* ===== ITACHI UCHIHA / OUTSIDER TRAINING CHARACTER v1 =====
   A native game fighter: shared movement, hitboxes, damage, projectiles and AI.
   Training-only and kept outside the Jujutsu roster.
*/
(function(){
  'use strict';
  if(window.__JFF_ITACHI_OUTSIDER_V1__) return;
  window.__JFF_ITACHI_OUTSIDER_V1__=true;

  const ITACHI_MOVES={
    light:{name:'Crow Flicker Dance',kind:'light',startup:8,active:82,recovery:0,damage:8,hitstun:16,blockstun:10,kbx:4,kby:-1,hitbox:{x:20,y:-95,w:96,h:60},hitstop:5,meter:5},
    heavy:{name:'Susanoo Rib-Cage Smash',kind:'heavy',startup:15,active:50,recovery:0,damage:28,hitstun:42,blockstun:28,kbx:12,kby:-8,hitbox:{x:10,y:-120,w:220,h:140},armorBreak:true,hitstop:13,meter:10},
    air:{name:'Crow Dive',kind:'air',startup:6,active:12,recovery:10,damage:13,hitstun:22,blockstun:12,kbx:7,kby:-4,hitbox:{x:18,y:-80,w:96,h:60},hitstop:7,meter:6},
    s1:{name:'Katon: Gōkakyū no Jutsu',kind:'skill1',startup:25,active:45,recovery:25,damage:0,hitbox:null,cost:18,cd:300,meter:8,aura:'itachiFireball'},
    s2:{name:'Mangekyō: Tsukuyomi Counter',kind:'skill2',startup:20,active:1,recovery:22,damage:24,hitbox:null,cost:30,cd:540,meter:12,aura:'itachiTsukuyomi'},
    s3:{name:'Susanoo: Yasaka Magatama',kind:'skill3',startup:40,active:20,recovery:30,damage:0,hitbox:null,cost:30,cd:420,meter:12,aura:'itachiMagatama'},
    s4:{name:'Bunshin Daibakuha',kind:'skill4',startup:20,active:20,recovery:10,damage:0,hitbox:null,cost:26,cd:460,meter:10,aura:'itachiClone'},
    s5:{name:'Amaterasu: Black Flame',kind:'skill5',startup:26,active:34,recovery:0,damage:0,hitbox:null,cost:36,cd:600,meter:12,aura:'itachiAmaterasu'},
    def:{name:'Yata Mirror',kind:'def',startup:4,active:44,recovery:12,damage:0,hitbox:null,cost:18,cd:420,meter:0,aura:'itachiYata'},
    ult:{name:'Complete Susanoo: Totsuka Sealing Finale',kind:'ult',startup:45,active:195,recovery:0,damage:0,hitbox:null,cost:0,cd:0,meter:0,invuln:242,aura:'itachiUltimate'}
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
      if(f&&f.id==='itachi'&&f.move&&f.state==='ATTACK'){
        // Re-pose the existing Itachi rig per move; keep the original character model intact.
        const n=f.moveFrame||0,k=f.moveKey||'',pulse=Math.sin(n*.72),wide=Math.sin(n*.38);
        P.hipY=-57;P.shY=-95;P.headY=-114;P.lean=2;P.armF=[66,18];P.armB=[112,14];P.legF=[88,5];P.legB=[96,-6];
        if(k==='light'){
          if(n<10){P.lean=9+pulse*2;P.armF=[42,-26+pulse*5];P.armB=[128,26];P.legF=[80,13];}
          else if(n<20){P.lean=12;P.armF=[34,4];P.armB=[135,30];P.legB=[108,-13];}
          else if(n<35){P.lean=-13;P.hipY=-61;P.armF=[18,-36];P.armB=[146,38];P.legF=[52,-28];P.legB=[120,18];}
          else if(n<49){P.lean=-7;P.armF=[38,-31];P.armB=[130,35];P.legF=[77,16];}
          else{P.lean=15;P.hipY=-60;P.armF=[22,-5];P.armB=[145,35];P.legF=[72,15];P.legB=[111,-10];}
        }else if(k==='heavy'){
          if(n<15){P.lean=-7;P.armF=[48,-28];P.armB=[125,-27];P.headY=-111;}
          else if(n<27){P.lean=19;P.hipY=-52;P.armF=[25,48];P.armB=[150,48];P.legF=[80,16];P.legB=[108,-12];}
          else{P.lean=1;P.armF=[58,28];P.armB=[119,22];}
        }else if(k==='s1'){
          if(n<8){P.lean=-6;P.armF=[40,-12];P.armB=[132,-8];}
          else{P.lean=12;P.armF=[26,-20];P.armB=[143,-18];}
        }else if(k==='s2'){P.lean=-2+wide;P.armF=[47,-15];P.armB=[121,12];P.headY=-116;}
        else if(k==='s3'){P.lean=-9;P.armF=[34,-26+pulse*4];P.armB=[142,-20];}
        else if(k==='s4'){P.lean=-12;P.hipY=-63;P.armF=[40,-25];P.armB=[137,31];P.legF=[64,-13];}
        else if(k==='s5'){P.lean=-11;P.armF=[46,-25];P.armB=[123,8];P.headY=-116;}
        else if(k==='ult'){P.lean=n<36?-5:9;P.armF=[28,-35];P.armB=[144,-24];P.legF=[81,12];}
        return true;
      }
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

  /* Legacy Itachi projectile art is disabled. Outsider attacks are rendered by js/45 and collide in js/46. */

  /* Combat/startMove/updateMove hooks are owned only by js/49_itachi_moveset_reboot.js. */

  console.info('[JFF Outsider] Itachi Uchiha registered as a Training-only Outsider.');
})();