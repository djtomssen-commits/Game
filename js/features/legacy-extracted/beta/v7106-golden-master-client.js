
(()=>{
'use strict';
window.__V7106_GOLDEN_MASTER_CLIENT__=true;
window.v7106GoldenMasterDiagnostics=()=>({
  release:window.__GROW_LEGENDS_RELEASE__||'',
  baseline:window.__V6349_GOLDEN_MASTER__?.baseline||'',
  contracts:Object.keys(window.__V6349_GOLDEN_MASTER__||{}),
  growAuthority:String(window.v7040AuthorityDiagnostics?.()?.domains?.grow||''),
  petAuthority:String(window.v7040AuthorityDiagnostics?.()?.domains?.pets||''),
  shopAuthority:String(window.v7040AuthorityDiagnostics?.()?.domains?.shop||'')
});
})();
