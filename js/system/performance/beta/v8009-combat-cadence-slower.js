(()=>{'use strict';
if(window.__V8009_SLOWER_COMBAT_CADENCE__)return;
window.__V8009_SLOWER_COMBAT_CADENCE__=true;

/* V8.009 T10 · calmer combat presentation.
   Timing only; damage, rewards and server state remain authoritative. */
const slowerCadence=()=>({
  frameDelay:900,
  attackDelay:440,
  settleDelay:460,
  visualAttackMs:700,
  visualHitMs:700,
  visualPopMs:1000,
  startDelayMs:250
});
window.v7269DungeonCadence=slowerCadence;
try{v7269DungeonCadence=slowerCadence}catch(_){}

/* The V7175 replay owner already renders Tower talent/status effects.
   The old v6225 bridge would render the same Tower proc a second time. */
function installTowerVisualDedup(){
  const extra=window.v6225ExtraHitVisual;
  if(typeof extra==='function'&&!extra.__v8009TowerDedup){
    const wrapped=function(mode){
      if(String(mode||'')==='tower')return false;
      return extra.apply(this,arguments);
    };
    wrapped.__v8009TowerDedup=true;
    wrapped.__v8009Base=extra;
    window.v6225ExtraHitVisual=wrapped;
  }
}
installTowerVisualDedup();
setTimeout(installTowerVisualDedup,0);
setTimeout(installTowerVisualDedup,750);
window.addEventListener('growlegends:account-ready',()=>setTimeout(installTowerVisualDedup,80),{passive:true});

window.v8009CombatCadenceDiagnostics=()=>({
  version:'V8.009-T10',
  dungeonPvpTower:slowerCadence(),
  towerExtraFxDedup:!!window.v6225ExtraHitVisual?.__v8009TowerDedup,
  routeRenderFlowGuardRetired:true,
  guildBossWarMultiplier:1.25
});
})();
