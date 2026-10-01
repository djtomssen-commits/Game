(()=>{
'use strict';
if(window.__V7119_CHARACTER_NAV_CONSOLIDATION__)return;
window.__V7119_CHARACTER_NAV_CONSOLIDATION__=true;
const EVENT='growlegends:navigation-open-v7119';
const base=window.v032Go||((typeof v032Go==='function')?v032Go:null);
if(typeof base==='function'&&!base.__v7119PostNavigation){
  const wrapped=function(id){
    const target=String(id||'');
    const out=base.apply(this,arguments);
    const fire=()=>{
      const t=performance.now?.()||Date.now();
      try{window.dispatchEvent(new CustomEvent(EVENT,{detail:{id:target}}))}catch(e){console.warn('[V7.119] navigation refresh dispatch',e)}
      if(target==='character'){
        const ms=Math.round((performance.now?.()||Date.now())-t);
        try{window.__GL_RUNTIME_WATCHDOG__?.report?.('character_postnav_profile','info',{listenersMs:ms},{screen:'character',incidentKey:'v7119-v7207'})}catch(_){}
      }
    };
    /* Character has many historical presentation listeners. Dispatch them only
       after two paints so the destination becomes interactive first. Other
       routes keep the established single-frame dispatch. */
    if(target==='character')requestAnimationFrame(()=>requestAnimationFrame(fire));
    else requestAnimationFrame(fire);
    return out;
  };
  wrapped.__v7119PostNavigation=true;
  wrapped.__v7119Base=base;
  window.v032Go=wrapped;
  try{v032Go=wrapped}catch(_){ }
}
window.__GROW_LEGENDS_RELEASE__='V7.119';
window.__V7119_CLEANUP__=Object.freeze({
  phase:4,
  oldNavigationWrappersRetired:12,
  sharedPostNavigationOwner:true,
  characterRefreshesShareOneAnimationFrame:true,
  gameplayRulesChanged:false,
  serverAuthorityChanged:false
});
window.v7119CleanupDiagnostics=()=>({
  release:window.__GROW_LEGENDS_RELEASE__||'',
  version:window.GROW_LEGENDS_VERSION?.short||'',
  sharedOwner:!!window.v032Go?.__v7119PostNavigation,
  event:EVENT,
  retired:12
});
})();
