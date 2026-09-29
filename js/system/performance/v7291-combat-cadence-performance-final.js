(()=>{'use strict';
 if(window.__V7291_COMBAT_CADENCE__)return;window.__V7291_COMBAT_CADENCE__=true;
 /* Quest combat uses ~430 ms per replay event (215 ms attack + 215 ms settle).
    Dungeon, PvP and Tower now use exactly that presentation tempo. Rules and rewards stay server-owned. */
 const questCadence=()=>({frameDelay:430,attackDelay:215,settleDelay:215,visualAttackMs:400,visualHitMs:400,visualPopMs:650,startDelayMs:120});
 window.v7269DungeonCadence=questCadence;
 try{v7269DungeonCadence=questCadence}catch(_){}
 window.v7291PerformanceDiagnostics=()=>({
   version:'V7.308',
   combatCadence:questCadence(),
   runtime:window.__V477_RUNTIME_DIAGNOSTICS__?.()||null,
   accountQueue:window.v7214AccountReadyQueueDiagnostics?.()||null,
   questWarmCache:typeof v7291QuestAssetCache!=='undefined'?v7291QuestAssetCache.size:null
 });
})();
