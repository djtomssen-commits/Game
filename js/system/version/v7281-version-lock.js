(()=>{'use strict';
 const ch=String(window.GROW_RELEASE_CHANNEL||'stable');
 const V=Object.freeze({short:'V7.308',label:ch==='beta'?'V7.308 Beta':'V7.308 Server 1',number:'7.305'});
 window.GROW_LEGENDS_VERSION=V;window.__GROW_LEGENDS_RELEASE__=V.short;window.__GL_CURRENT_BUILD__=V.short;
 const apply=()=>{try{document.querySelectorAll('.v366-ver,.v371-logo em,.v372-logo em,[data-top-version],#topVersion').forEach(el=>{el.textContent=V.short})}catch(_){}};
 apply();addEventListener('pageshow',apply,{passive:true});addEventListener('growlegends:account-ready',apply,{passive:true});
 /* V7.308 STARTFIX: retired document-wide version MutationObserver; it could self-trigger and starve DOMContentLoaded after later patches were appended. */
})();
