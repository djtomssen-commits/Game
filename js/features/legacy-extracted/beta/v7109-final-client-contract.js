
(()=>{
'use strict';
window.__V7109_CLIENT_CONTRACT__=Object.freeze({
  release:'V7.109',
  goldenMaster:'V6.349',
  bloomBuffPreview:true,
  weatherSyncedCare:true,
  authoritativeAutoEquip:true,
  staleAdminSaveHydration:false,
  serverEventInstances:true,
  serverWednesdayRewardPayload:true
});
window.v7107ClientDiagnostics=()=>({
  ...window.__V7109_CLIENT_CONTRACT__,
  actual:window.GROW_LEGENDS_VERSION?.short||'',
  release:window.__GROW_LEGENDS_RELEASE__||'',
  itemAuthority:String(window.v7040AuthorityDiagnostics?.()?.domains?.items||''),
  growAuthority:String(window.v7040AuthorityDiagnostics?.()?.domains?.grow||''),
  qaFailed:Number(window.__V7098_SERVER_QA__?.failed_checks)||0
});
})();
