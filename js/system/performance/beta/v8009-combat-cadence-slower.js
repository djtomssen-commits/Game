(()=>{'use strict';
if(window.__V8009_SLOWER_COMBAT_CADENCE__)return;
window.__V8009_SLOWER_COMBAT_CADENCE__=true;

/* Beta V8.009: make combat turns readable instead of firing several motions
   almost at once. Dungeon, PvP and Tower consume this shared cadence. */
const slowerCadence=()=>({
  frameDelay:600,
  attackDelay:300,
  settleDelay:300,
  visualAttackMs:520,
  visualHitMs:520,
  visualPopMs:800,
  startDelayMs:160
});
window.v7269DungeonCadence=slowerCadence;
try{v7269DungeonCadence=slowerCadence}catch(_){}
window.v8009CombatCadenceDiagnostics=()=>({
  version:'V8.009-BETA',
  dungeonPvpTower:slowerCadence(),
  guildBossWarMultiplier:1.25
});
})();