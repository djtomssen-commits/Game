
(()=>{'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.164',label:'V4.164 Stable',number:'4.164'};
 function stamp(){}
 function retireLegacyOgDom(){try{document.querySelector('#v077SeedPanel')?.remove();document.querySelectorAll('.v077-fx,.v077-badge,.v495-og-wrap').forEach(x=>x.remove())}catch(_){}}
 stamp();retireLegacyOgDom();
 document.addEventListener('DOMContentLoaded',()=>{stamp();retireLegacyOgDom()},{once:true});
 window.addEventListener('pageshow',()=>{stamp();retireLegacyOgDom()},{passive:true});
 window.addEventListener('growlegends:account-ready',()=>{stamp();retireLegacyOgDom()});
 window.__V6164_STABILITY__={version:V.label,retiredOgIntervals:true,directGrowTabs:true,classSetCraftLock:true,rewardHistory:true};
})();
