'use strict';
/* v23: final repair layer. R remains the defense key in combat; training reset-pos moves to P. */
(() => {
  const baseMenuKey = window.MenuKey;
  if(typeof baseMenuKey==='function' && !window.JFF_V23_MENU_PATCH){
    window.JFF_V23_MENU_PATCH=true;
    window.MenuKey=function(code){
      if(G.mode==='training'){
        if(code==='KeyR')return; // let combat input read R as the defense move
        if(code==='KeyP'){
          if(G.fighters?.length>=2){
            resetFighter(G.fighters[0],ARENA_W/2-190,1);
            resetFighter(G.fighters[1],ARENA_W/2+190,-1);
          }
          return;
        }
      }
      return baseMenuKey(code);
    };
  }
})();