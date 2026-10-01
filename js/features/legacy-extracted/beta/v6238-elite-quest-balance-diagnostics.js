
(()=>{
 'use strict';
 window.v6238EliteQuestDiagnostics=(level=Number(s?.level)||1)=>{
  level=Math.max(1,Math.floor(Number(level)||1));
  const heavy=Math.max(90,level*6);
  const normal=Math.round(heavy/1.55);
  const quick=Math.round(normal*.62);
  const elite=typeof v6238EliteCurve==='function'?v6238EliteCurve(level):{duration:Math.round(heavy*1.5),xp:0,gold:0};
  return{
   level,
   seconds:{quick,normal,heavy,elite:elite.duration},
   minutes:{quick:+(quick/60).toFixed(2),normal:+(normal/60).toFixed(2),heavy:+(heavy/60).toFixed(2),elite:+(elite.duration/60).toFixed(2)},
   eliteVsHeavy:+(elite.duration/heavy).toFixed(2),
   activeQuestUntouched:true
  };
 };
})();
