(()=>{
 'use strict';
 if(window.__V7156_COMBAT_HOME_OWNER__)return;window.__V7156_COMBAT_HOME_OWNER__=true;
 const active=id=>!!document.getElementById(id)?.classList.contains('active');
 let homeRaf=0;
 function settleHome(){
   homeRaf=0;
   if(!active('world'))return false;
   try{window.v085InstallWorld?.(false)}catch(_){}
   if(window.__V7137_FRAME_STATE__){try{window.v7137ApplyOwnFrames?.()}catch(_){}}
   document.body?.classList.remove('v7129-referral-frame');
   return true;
 }
 function queueHome(){if(homeRaf)return;homeRaf=requestAnimationFrame(settleHome)}
 window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world')queueHome()},{passive:true});
 window.addEventListener('growlegends:account-ready',queueHome,{passive:true});
 /* One boot settle only; no delayed repaint chain, no MutationObserver, no interval. */
 queueHome();
 window.v7156HomeDiagnostics=()=>({active:active('world'),canonicalWorld:!!document.querySelector('#world > .v366-world.v690-world'),framePending:document.documentElement.classList.contains('v7154-frame-pending'),legacyRepairRetired:!!window.__V367_HOME_REPAIR_RETIRED_V7156__,legacyLuckRefreshRetired:!!window.__V375_HOME_REFRESH_RETIRED_V7156__});
 window.v7156CombatDiagnostics=()=>window.v7141CombatArenaDiagnostics?.()||{};
})();
