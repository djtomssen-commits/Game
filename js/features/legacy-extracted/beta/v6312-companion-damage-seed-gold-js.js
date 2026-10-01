
(()=>{
'use strict';
if(window.__V6312_COMPANION_DAMAGE_SEED_GOLD__)return;
window.__V6312_COMPANION_DAMAGE_SEED_GOLD__=true;
function syncSeedGold(){
 try{
  const el=document.getElementById('v6312SeedGold');
  if(el)el.textContent=(typeof fmt==='function'?fmt(Math.max(0,Number(s?.gold)||0)):String(Math.max(0,Number(s?.gold)||0)));
 }catch(_){ }
}
document.addEventListener('click',e=>{
 const t=e.target instanceof Element?e.target:null;
 if(t?.closest('[data-v493-seeds],[data-v492-buy]'))setTimeout(syncSeedGold,100);
},true);
window.addEventListener('growlegends:account-ready',()=>setTimeout(syncSeedGold,120));
window.v6312SyncSeedGold=syncSeedGold;
window.v6312Diagnostics=()=>({
 version:'V6.312',
 seedGold:document.getElementById('v6312SeedGold')?.textContent||'',
 companionImpactFont:document.querySelector('.v6303-companion-impact>b')?getComputedStyle(document.querySelector('.v6303-companion-impact>b')).fontSize:''
});
})();
