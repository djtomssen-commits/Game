
(()=>{
 'use strict';
 /* V7.151 PHASE 2: RETIRED.
    V4.99 stored a second owner-scoped Grow snapshot in localStorage and restored
    it around persist(), cloud apply/write and navigation. Server-authoritative
    V7065 is now the sole canonical Grow state owner. Keeping V4.99 active could
    resurrect stale plants after a server refresh. Compatibility entry points
    remain as no-ops for old callers. */
 window.__V499_RETIRED_V7150__=true;
 window.v499ActivateForAccount=()=>false;
 window.v499RepairGrowroom=()=>false;
})();
