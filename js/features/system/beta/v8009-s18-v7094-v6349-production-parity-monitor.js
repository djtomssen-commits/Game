(()=>{
'use strict';
if(window.__V7094_PARITY_MONITOR__)return;window.__V7094_PARITY_MONITOR__=true;
const VERSION='V7.095';
const screens=['world','character','inventory','shop','grow','quests','dungeon','tower','endgame','pvp','guild','hall','friends','mail'];
const funcs=['render','renderInventory','renderShop','renderGrow','renderQuests','renderDungeon','vTowerRender','v204Fight','v106OpenBook'];
let last=null;
function snapshot(){
 const missingScreens=screens.filter(id=>!document.getElementById(id));
 const missingFunctions=funcs.filter(n=>typeof window[n]!=='function'&&typeof globalThis[n]!=='function');
 const duplicateIds=(()=>{const m=new Map();document.querySelectorAll('[id]').forEach(e=>m.set(e.id,(m.get(e.id)||0)+1));return [...m].filter(([,n])=>n>1).map(([id,n])=>({id,n})).slice(0,20)})();
 const authority={
  caps:window.v7081CapabilitiesDiagnostics?.()||null,
  build:window.v7033BuildAuthorityDiagnostics?.()||null,
  dungeon:window.v7051DungeonAuthorityDiagnostics?.()||null,
  pvp:window.v7053PvpAuthorityDiagnostics?.()||null,
  grow:window.v7065GrowAuthorityDiagnostics?.()||null,
  tower:window.v7072AuthorityDiagnostics?.()||null
 };
 last={version:VERSION,baseline:'V6.349',at:Date.now(),missingScreens,missingFunctions,duplicateIds,authority};
 if(missingScreens.length||missingFunctions.length||duplicateIds.length){
  window.__GL_RUNTIME_WATCHDOG__?.report?.('v6349_parity_surface_missing','error',{missingScreens,missingFunctions,duplicateIds},{screen:'system',incidentKey:'surface'});
 }
 return last;
}
window.v7094ParityDiagnostics=()=>snapshot();
window.addEventListener('growlegends:account-ready',()=>setTimeout(snapshot,5000),{passive:true});
setTimeout(snapshot,12000);
})();
