(()=>{
'use strict';
if(window.__V7113_SINGLE_VERSION_OWNER__)return;
window.__V7113_SINGLE_VERSION_OWNER__=true;
const V=Object.freeze({short:'V7.160',label:'V7.160 Stable',number:'7.160'});
window.__GROW_LEGENDS_RELEASE__=V.short;
try{window.GROW_LEGENDS_VERSION=V}catch(_){ }
function stamp(){
  try{document.title='Grow Legends '+V.short}catch(_){ }
  try{
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version,.v4107-version')
      .forEach(el=>{if(el&&el.textContent!==V.label)el.textContent=V.label});
    document.querySelectorAll('.v366-ver,.v371-logo em,.v372-logo em')
      .forEach(el=>{if(el&&el.textContent!==V.short)el.textContent=V.short});
  }catch(_){ }
}
window.v7113StampVersion=stamp;
window.v7112StampVersion=stamp;
function afterPaint(){try{queueMicrotask(stamp)}catch(_){setTimeout(stamp,0)}}
/* One final wrapper replaces multiple historical version-owner wrappers. */
try{
  if(typeof render==='function'&&!window.__V7113_RENDER_VERSION_WRAP__){
    const base=render;
    render=function(){const out=base.apply(this,arguments);afterPaint();return out};
    try{window.render=render}catch(_){ }
    window.__V7113_RENDER_VERSION_WRAP__=true;
  }
}catch(_){ }
/* V7.118 cleanup: navigation-only version wrapper retired.
   The single version owner still stamps on render, boot, pageshow, account-ready
   and navigation-ready; CSS owns the visible header version. */
window.__V7113_NAV_VERSION_WRAP__='retired-v7118';
stamp();
document.addEventListener('DOMContentLoaded',stamp,{once:true});
window.addEventListener('pageshow',stamp,{passive:true});
window.addEventListener('growlegends:account-ready',stamp,{passive:true});
window.addEventListener('growlegends:navigation-ready',stamp,{passive:true});
window.v7113VersionDiagnostics=()=>({
  expected:V.short,
  actual:window.GROW_LEGENDS_VERSION?.short||'',
  release:window.__GROW_LEGENDS_RELEASE__||'',
  title:document.title,
  legacyV6316Retired:!!window.__V6316_VERSION_AUTHORITY__,
  legacyV7092Retired:!!window.__V7092_VERSION_OWNER_RETIRED__
});
})();
