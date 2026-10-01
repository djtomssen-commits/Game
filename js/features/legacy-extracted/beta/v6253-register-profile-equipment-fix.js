
(()=>{
 'use strict';
 window.__V6253_REGISTER_POPUP_Z_FIX__=true;
 window.__V6253_PUBLIC_EQUIPMENT_SYNC_FIX__=true;
 window.v6253Diagnostics=()=>({
   registerPopup:{
     present:!!document.getElementById('v6252RegisterOverlay'),
     open:!!document.getElementById('v6252RegisterOverlay')?.classList.contains('show'),
     popupZ:getComputedStyle(document.getElementById('v6252RegisterOverlay')||document.body).zIndex,
     loginZ:getComputedStyle(document.getElementById('v075AuthOverlay')||document.body).zIndex
   },
   profileEquipment:{
     safeEquipment:typeof v074SafeEquipment==='function',
     payloadHasEquipment:(()=>{try{return !!v073ProfilePayload?.().equipment}catch(_){return false}})(),
     syncFix:true
   }
 });
})();
