'use strict';
/* ===== PERFORMANCE / QUALITY CONTROLLER ===== */
(function(){
  if(window.JFF_PERFORMANCE_V19)return;
  const mem=navigator.deviceMemory||4,cores=navigator.hardwareConcurrency||2;
  let q=mem<=4||cores<=2?.72:(mem<=8||cores<=4?.86:1);
  q=clamp(q,.65,1);
  G.modernFx=G.modernFx||{};G.modernFx.quality=q;
  window.JFFPerformance={
    quality:q,
    profile:q<.8?'LOW':q<.93?'MEDIUM':'HIGH',
    setQuality(v){const n=clamp(Number(v)||1,.65,1);G.modernFx.quality=n;this.quality=n;this.profile=n<.8?'LOW':n<.93?'MEDIUM':'HIGH';}
  };
  window.JFF_PERFORMANCE_V19=true;
})();