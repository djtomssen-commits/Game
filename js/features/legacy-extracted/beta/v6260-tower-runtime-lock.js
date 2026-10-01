
(()=>{
 'use strict';
 if(window.__V6260_TOWER_RUNTIME_LOCK__)return;
 window.__V6260_TOWER_RUNTIME_LOCK__=true;
 window.v6260TowerVisualDiagnostics=()=>({
   retiredRuntimePainter:true,
   owner:'vTower-system',
   towerActive:!!document.getElementById('tower')?.classList.contains('active')
 });
})();
