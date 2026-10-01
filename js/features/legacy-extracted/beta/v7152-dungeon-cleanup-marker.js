
(()=>{
 'use strict';
 window.__V7152_DUNGEON_CLEANUP__=true;
 window.v7152DungeonCleanupDiagnostics=()=>({
  version:'V7.156',
  canonicalOwner:!!window.renderDungeon?.__glCanonicalDungeonOwner||!!window.renderDungeon?.__v7145Gate,
  legacyFx604Retired:!!window.v604DungeonFxDiagnostics?.().retired,
  legacyFx6221Retired:!!window.v6221DungeonFxDiagnostics?.().retired,
  enemyGlobalObserverRetired:!!window.v6324DungeonEnemyPoseDiagnostics?.().observerRetired,
  mapBackgrounds:document.querySelectorAll('#dungeonMapCard .gl-dungeon-map-bg-img').length,
  oldMapLayers:document.querySelectorAll('#dungeonMapCard .v261-stage > .v261-bg,#dungeonMapCard .v261-stage > .v261-fx').length
 });
})();
