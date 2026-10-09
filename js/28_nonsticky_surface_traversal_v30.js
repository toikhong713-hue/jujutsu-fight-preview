'use strict';
/* JFF V30 NON-STICKY SURFACE / WALL-RUN SYSTEM
   No CLIMB state, no pinned coordinates, no zero-velocity surface lock.
   Horizontal authored platforms use the game's normal physics.
   Holding UP beside an authored vertical edge creates a wall-run using normal
   airborne physics; releasing UP or entering combat immediately returns control.
   Toji alone keeps direct Soru-to-platform targeting.
*/

const JFF_BASE_UPDATE_V30 = updateFighter;
const JFF_BASE_RESET_V30 = resetFighter;
const JFF_BASE_SORU_V30 = doTojiSoru;
const JFF_WALL_RUN_SURFACES_V30 = [];
const JFF_HORIZONTAL_SURFACES_V30 = (TOJI_MAP_PLATFORMS || []).map(p => ({
  id:p.id, type:p.type || 'surface', x:p.x, y:p.y, w:p.w, base:p
}));

function jffAddWallRunSurfaceV30(id, type, xAt, top, bottom, side, basePlatform=null) {
  JFF_WALL_RUN_SURFACES_V30.push({
    id, type, xAt, top, bottom, side, basePlatform
  });
}

/* Real building facades. Each facade climbs onto its associated roof. */
const JFF_BUILDING_WALLS_V30 = [
  {id:'buildingA_left',x:430,top:418,side:-1,roof:'b1roof'},
  {id:'buildingA_right',x:860,top:418,side:1,roof:'b1roof'},
  {id:'buildingB_left',x:1020,top:332,side:-1,roof:'b2roof'},
  {id:'buildingB_right',x:1520,top:332,side:1,roof:'b2roof'},
  {id:'buildingC_left',x:1810,top:404,side:-1,roof:'b3roof'},
  {id:'buildingC_right',x:2240,top:404,side:1,roof:'b3roof'},
  {id:'buildingD_left',x:2430,top:302,side:-1,roof:'b4roof'},
  {id:'buildingD_right',x:2920,top:302,side:1,roof:'b4roof'}
];
for (const w of JFF_BUILDING_WALLS_V30) {
  const p = TOJI_MAP_PLATFORMS.find(q => q.id === w.roof) || null;
  jffAddWallRunSurfaceV30(w.id,'building',()=>w.x,w.top,GROUND,w.side,p);
}

/* Tree trunks lead to the nearest authored upper branch. */
const JFF_TREE_WALLS_V30 = [
  {id:'tree1_trunk_L',xAt:y=>800-52*((GROUND-y)/(GROUND-350)),top:350,side:-1,branch:'tree1high'},
  {id:'tree1_trunk_R',xAt:y=>800-52*((GROUND-y)/(GROUND-350)),top:350,side:1,branch:'tree1high'},
  {id:'tree2_trunk_L',xAt:y=>1600+33*((GROUND-y)/(GROUND-375)),top:375,side:-1,branch:'tree2high'},
  {id:'tree2_trunk_R',xAt:y=>1600+33*((GROUND-y)/(GROUND-375)),top:375,side:1,branch:'tree2high'},
  {id:'tree3_trunk_L',xAt:y=>2940-32*((GROUND-y)/(GROUND-330)),top:330,side:-1,branch:'tree3high'},
  {id:'tree3_trunk_R',xAt:y=>2940-32*((GROUND-y)/(GROUND-330)),top:330,side:1,branch:'tree3high'}
];
for (const w of JFF_TREE_WALLS_V30) {
  const p = TOJI_MAP_PLATFORMS.find(q => q.id === w.branch) || null;
  jffAddWallRunSurfaceV30(w.id,'tree',w.xAt,w.top,GROUND,w.side,p);
}

/* Ledges, stairs and branches can be climbed at either edge, but never latch the fighter. */
for (const p of TOJI_MAP_PLATFORMS || []) {
  if (p.type === 'roof') continue; // handled by the main building facade
  const top=p.y, base=p;
  jffAddWallRunSurfaceV30(`${p.id}_left_edge`,p.type,()=>p.x,top,GROUND,-1,base);
  jffAddWallRunSurfaceV30(`${p.id}_right_edge`,p.type,()=>p.x+p.w,top,GROUND,1,base);
}

function jffHasCombatInputV30(inp) {
  return !!(inp.light||inp.heavy||inp.s1||inp.s2||inp.s3||inp.s4||inp.s5||
    inp.def||inp.block||inp.blockPress||inp.guardCancel||inp.ult||inp.copy||
    inp.form||inp.awaken||inp.wcs||inp.special1||inp.special2);
}
function jffStateCanWallRunV30(f) {
  return f.hp>0 && !f.move && ![
    'ATTACK','HITSTUN','KNOCKDOWN','WAKEUP','DEFEAT','IMMOBILIZED',
    'CLASH','TRAPPED','GRABBED','GRAB','CINE_REACT','YOUNG_RED_COUNTER'
  ].includes(f.state);
}
function jffWallDistanceV30(f,s) {
  const y=clamp(f.y,s.top,s.bottom);
  return Math.abs(f.x-(s.xAt(y)+s.side*12));
}
function jffFindWallRunSurfaceV30(f,radius=34) {
  let best=null,bestD=Infinity;
  for (const s of JFF_WALL_RUN_SURFACES_V30) {
    /* Don't cling to the same level: UP from a roof/branch remains an ordinary jump. */
    if (s.top >= f.y-8 || f.y < s.top-20 || f.y > s.bottom+8) continue;
    const d=jffWallDistanceV30(f,s);
    if (d<=radius && d<bestD) {best=s;bestD=d;}
  }
  return best;
}
function jffTopOutV30(f,s) {
  const p=s && s.basePlatform;
  if (!p) return false;
  const entryX=s.side<0 ? p.x+Math.min(12,p.w*.25) : p.x+p.w-Math.min(12,p.w*.25);
  f.x=clamp(entryX,WALL,ARENA_W-WALL);
  f.y=p.y;
  f.vx=0; f.vy=0; f.onGround=true; f.jumps=2;
  f.state='IDLE'; f.stateFrame=0;
  f.jffWallRunActiveV30=false; f.jffWallRunSurfaceV30=null;
  ring(f.x,f.y,'#dbe8ff',20,10);
  spark(f.x,f.y-8,4,'#eff7ff',2.7,3.8,10,0.02);
  return true;
}
function jffClearStaleSurfaceFlagsV30(f) {
  /* Compatibility cleanup for old builds, without retaining their climbing lock. */
  if (f.surfaceType==='vertical_surface' || f.surfaceType==='vertical' || f.state==='CLIMB') {
    f.surfaceType=null; f.traversalSurface=null; f.traversalSurfaceData=null; f.traversalSide=0;
    if (f.hp>0 && !f.move) {
      if (f.onGround && f.y<GROUND-4 && !tojiSupportAt(f.x,f.y)) f.onGround=false;
      if (!f.onGround) f.state='FALL'; else f.state='IDLE';
      f.stateFrame=0;
    }
    f.vx = Number.isFinite(f.vx) ? f.vx : 0;
    f.vy = Number.isFinite(f.vy) ? f.vy : 0;
  }
}

updateFighter = function(f,inp) {
  jffClearStaleSurfaceFlagsV30(f);
  const wasWallRunning=!!f.jffWallRunActiveV30;
  const priorWall=f.jffWallRunSurfaceV30;
  const combatInput=jffHasCombatInputV30(inp);

  /* Attacks/guard/ult always win. Treat the wall-run contact as an action origin
     for the current frame only; original physics resumes immediately afterward. */
  if (wasWallRunning && combatInput && jffStateCanWallRunV30(f)) {
    f.jffWallRunActiveV30=false; f.jffWallRunSurfaceV30=null;
    f.onGround=true; f.vy=0; f.state='IDLE'; f.stateFrame=0;
  }

  JFF_BASE_UPDATE_V30(f,inp);

  if (!jffStateCanWallRunV30(f) || combatInput || !inp.up) {
    f.jffWallRunActiveV30=false;
    f.jffWallRunSurfaceV30=null;
    return;
  }

  /* Top-out uses the last contacted edge, because a fast jump can cross above its
     detection band between frames. It only snaps onto a real authored platform. */
  if (wasWallRunning && priorWall && f.vy<0 && f.y<=priorWall.top+10 &&
      jffWallDistanceV30(f,priorWall)<=52 && jffTopOutV30(f,priorWall)) return;

  const wall=jffFindWallRunSurfaceV30(f,38);
  if (!wall) {
    f.jffWallRunActiveV30=false; f.jffWallRunSurfaceV30=null;
    return;
  }

  /* Momentum climb: never pin X/Y and never zero horizontal control. */
  f.jffWallRunActiveV30=true;
  f.jffWallRunSurfaceV30=wall;
  f.onGround=false;
  f.vy=Math.min(f.vy,-4.0);
  if (f.state!=='ATTACK') f.state='JUMP';
};

/* Soru is a Toji-only shortcut; other characters physically traverse surfaces. */
doTojiSoru = function(f,inp) {
  if (f.id!=='toji' || f.tojiSoruCd>0 || f.state==='ATTACK' || f.state==='DEFEAT') {
    return JFF_BASE_SORU_V30(f,inp);
  }
  let dir=0;
  if (inp.left) dir=-1;
  if (inp.right) dir=1;
  if (!inp.up && dir===0) return JFF_BASE_SORU_V30(f,inp);

  let best=null,bestScore=Infinity;
  for (const p of JFF_HORIZONTAL_SURFACES_V30) {
    if (inp.up && p.y>=f.y-12) continue;
    const x=clamp(f.x,p.x+Math.min(12,p.w*.25),p.x+p.w-Math.min(12,p.w*.25));
    if (dir!==0 && (x-f.x)*dir < 24) continue;
    const dx=Math.abs(x-f.x), dy=Math.abs(p.y-f.y);
    const score=dx+dy*(inp.up?0.42:0.28);
    if(score<bestScore){best={x,y:p.y,type:p.type,id:p.id};bestScore=score;}
  }
  if (best && bestScore<520) {
    const fromX=f.x,fromY=f.y;
    f.x=clamp(best.x,WALL,ARENA_W-WALL); f.y=best.y;
    f.vx=0; f.vy=0; f.onGround=true; f.jumps=2;
    f.state='IDLE'; f.stateFrame=0; f.move=null; f.moveKey=null;
    f.jffWallRunActiveV30=false; f.jffWallRunSurfaceV30=null;
    f.tojiSoruCd=42; f.tojiSoruAnchor=best; f.invuln=Math.max(f.invuln,10);
    for(let i=0;i<5;i++) pushAfterimage(f,computePose(f));
    ring(fromX,fromY-58,'#eef1f3',28,13); ring(f.x,f.y-40,'#ffffff',36,15);
    vfxSlashTrail(fromX,fromY-78,f.x,f.y-78,'#e7ebed',3.5,13);
    spark(f.x,f.y-54,8,'#dfe5e8',4.2,5,14,0);
    flash(.08,'#e9edf0'); SFX.dash();
    return true;
  }
  return JFF_BASE_SORU_V30(f,inp);
};

resetFighter = function(f,x,facing) {
  JFF_BASE_RESET_V30(f,x,facing);
  f.jffWallRunActiveV30=false; f.jffWallRunSurfaceV30=null;
  f.surfaceType=null; f.traversalSurface=null; f.traversalSurfaceData=null; f.traversalSide=0;
};

console.log('[JFF V30] Non-sticky traversal loaded:', JFF_HORIZONTAL_SURFACES_V30.length,
  'horizontal surfaces /', JFF_WALL_RUN_SURFACES_V30.length, 'momentum wall-run edges');