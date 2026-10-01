
(()=>{
  'use strict';
  const V=Object.freeze({short:'V7.161',label:'V7.161 Stable',number:'7.161'});
  window.GROW_LEGENDS_VERSION=V;
  window.__GROW_LEGENDS_RELEASE__=V.short;
  window.__GL_CURRENT_BUILD__=V.short;
  const sel='.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version,.v366-ver,.v371-logo em,.v372-logo em';
  const paint=()=>{try{document.querySelectorAll(sel).forEach(el=>{if(!el||el.tagName==='STYLE')return;el.textContent=el.matches('.version,#v141VersionLine,[data-version],#version,#gameVersion,#topVersion,[data-top-version],.v358-version')?V.short:V.short})}catch(_){}};
  paint();
  document.addEventListener('DOMContentLoaded',paint,{once:true});
  window.addEventListener('pageshow',paint,{passive:true});
  window.addEventListener('growlegends:account-ready',paint,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',paint,{passive:true});
})();
