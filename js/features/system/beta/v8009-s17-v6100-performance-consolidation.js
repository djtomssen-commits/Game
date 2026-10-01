(function(){
'use strict';
if(window.__V6100_PERFORMANCE_CONSOLIDATION__)return;
window.__V6100_PERFORMANCE_CONSOLIDATION__=true;

function normalizeDockLight(){
  const dock=document.querySelector('#world .v366-world .v366-dock');
  if(!dock)return;
  let buttons=[...dock.querySelectorAll(':scope > button')];
  if(buttons.length<=8)return;

  const preferred=buttons.find(b=>b.dataset.go==='harzDealer');
  buttons.forEach(b=>{
    if(buttons.length<=8)return;
    const txt=(b.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    const legacy=b.matches('[data-v341-harz-menu],[data-v337-harz-dealer],[data-v353-harz-dealer]');
    const duplicate=b!==preferred && txt.includes('harz') && txt.includes('dealer');
    if(legacy||duplicate){
      b.remove();
      buttons=[...dock.querySelectorAll(':scope > button')];
    }
  });

  while(buttons.length>8){
    buttons.at(-1)?.remove();
    buttons=[...dock.querySelectorAll(':scope > button')];
  }
}

/* V6.319: one-shot dock normalization only. v366 emits the canonical dock and
   V6.92 already blocks legacy dealer cells, so observing every child mutation is
   unnecessary and can feed back into world paints. */
function bindDock(){ normalizeDockLight(); }

document.addEventListener('DOMContentLoaded',bindDock,{once:true});
window.addEventListener('pageshow',bindDock,{passive:true});
window.addEventListener('growlegends:account-ready',bindDock,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world')bindDock()},{passive:true});
window.__v6100Go='v7119-event';

window.v6100PerformanceInfo=()=>({
  optimizedPets:!!window.__V699_PET_PERFORMANCE_REBUILD__,
  productionProfilerDisabled:window.__V4106_TECH__?.productionLite===true,
  worldRepairObserversRetired:true,
  forcedWorldRebuildsRetired:true,
  globalBodyObserversRetired:true
});
})();
