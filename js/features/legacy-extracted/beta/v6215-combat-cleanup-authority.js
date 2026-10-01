
(()=>{
 'use strict';
 if(window.__V6215_COMBAT_CLEANUP__)return;
 window.__V6215_COMBAT_CLEANUP__=true;
 /* V7.156: old global pageshow/visibility combat cleanup lane retired. Current
    owners refresh themselves when their page/fight is actually opened. */
 window.__V6215_QA__=()=>({
   pvpServerOwner:window.__V7053_ATOMIC_PVP_CLIENT__===true,
   oldPvpObserverOwnersRetired:true,
   lifecycleHooksRetired:true
 });
})();
