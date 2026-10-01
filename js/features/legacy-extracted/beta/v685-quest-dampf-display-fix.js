
(function(){
'use strict';
if(window.__V685_QUEST_DAMPF_FIX__)return;
window.__V685_QUEST_DAMPF_FIX__=true;
/* V6.97: actual quest renderer already uses v271DampfCap().
   The old observer wrote innerHTML into the subtree it was observing and
   could continuously retrigger itself. */
})();
