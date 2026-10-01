
(()=>{
 'use strict';
 window.__V7163_CHARACTER_FRAME_COMPOSITOR_FIX__=Object.freeze({
   characterFrameStatic:true,
   frameAnimationsElsewherePreserved:true,
   inventoryGpuLayersRetired:true,
   gameplayRulesChanged:false,
   serverAuthorityChanged:false
 });
 const V=Object.freeze({short:'V7.165',label:'V7.165 Stable',number:'7.165'});
 window.GROW_LEGENDS_VERSION=V;window.__GROW_LEGENDS_RELEASE__=V.short;
 const paint=()=>{
   try{document.querySelectorAll('.version').forEach(el=>el.textContent=V.short)}catch(_){}
   try{document.querySelectorAll('.v372-logo em,.v371-logo em,.v366-ver').forEach(el=>{if(el.tagName!=='STYLE')el.textContent=V.short})}catch(_){}
 };
 paint();
 window.addEventListener('growlegends:account-ready',paint,{passive:true});
 window.addEventListener('pageshow',paint,{passive:true});
})();
