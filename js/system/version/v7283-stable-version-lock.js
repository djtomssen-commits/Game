(()=>{'use strict';
 const channel=String(window.GROW_RELEASE_CHANNEL||'stable');
 const V=Object.freeze({short:'V8.007',label:channel==='beta'?'V8.007 Beta':'V8.007 Server 1',number:'8.007'});
 window.GROW_LEGENDS_VERSION=V;
 window.__GROW_LEGENDS_RELEASE__=V.short;
 window.__GL_CURRENT_BUILD__=V.short;
 const apply=()=>{try{
   document.querySelectorAll('.v366-ver,.v371-logo em,.v372-logo em,[data-top-version],#topVersion')
     .forEach(el=>{el.textContent=V.short});
 }catch(_){}};
 apply();
 addEventListener('pageshow',apply,{passive:true});
 addEventListener('growlegends:account-ready',apply,{passive:true});
})();
