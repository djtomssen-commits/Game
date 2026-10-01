
(()=>{
 'use strict';
 /* V7.151 PHASE 2: RETIRED.
    This was a second v7064_grow_state reconciliation lane created only to
    counteract old local recovery. V4.99/V4.120 are now retired, so the second
    server read/render lane is no longer needed. */
 if(window.__V7075_GROW_RECOVERY_NEUTRALIZER__)return;
 window.__V7075_GROW_RECOVERY_NEUTRALIZER__=true;
 window.__V7075_RETIRED_V7150__=true;
 window.v7075GrowRecoveryDiagnostics=()=>({version:'V7.151',retired:true,running:false,last:0,lastUid:'',lastPlants:''});
})();
