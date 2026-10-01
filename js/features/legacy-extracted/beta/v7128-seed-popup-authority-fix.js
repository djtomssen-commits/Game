
(()=>{
'use strict';
window.__GROW_LEGENDS_RELEASE__='V7.128';
window.__V7128_SEED_POPUP_AUTHORITY_FIX__=Object.freeze({
  popupSeedPurchaseServerCaptured:true,
  legacyLocalSeedPurchaseFailClosed:true,
  buyRpc:'v6358_buy_seed',
  plantRpc:'v6358_plant_seed'
});
window.v7128SeedAuthorityDiagnostics=()=>({
  release:window.__GROW_LEGENDS_RELEASE__||'',
  version:window.GROW_LEGENDS_VERSION?.short||'',
  growAuthority:!!window.v7081UseAuthority?.('grow'),
  serverMode:!!window.__V7065_GROW_SERVER_MODE__,
  popupMountedOutsideGrow:!!document.querySelector('#v495SeedInventory')&&!document.querySelector('#grow #v495SeedInventory')
});
})();
