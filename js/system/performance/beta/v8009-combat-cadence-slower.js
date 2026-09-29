(()=>{'use strict';
if(window.__V8009_SLOWER_COMBAT_CADENCE__)return;
window.__V8009_SLOWER_COMBAT_CADENCE__=true;

/* Beta V8.009 T9A: make combat turns more readable and reduce overlapping motion.
   Dungeon, PvP and Tower consume this shared presentation cadence. */
const slowerCadence=()=>({
  frameDelay:720,
  attackDelay:360,
  settleDelay:360,
  visualAttackMs:600,
  visualHitMs:600,
  visualPopMs:900,
  startDelayMs:190
});
window.v7269DungeonCadence=slowerCadence;
try{v7269DungeonCadence=slowerCadence}catch(_){}
window.v8009CombatCadenceDiagnostics=()=>({
  version:'V8.009-BETA',
  dungeonPvpTower:slowerCadence(),
  guildBossWarMultiplier:1.25
});
})();