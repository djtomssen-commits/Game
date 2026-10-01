(()=>{
'use strict';
const V=Object.freeze({short:'V7.227',label:'V7.227 Stable',number:'7.227'});
window.GROW_LEGENDS_VERSION=V;
window.__GROW_LEGENDS_RELEASE__=V.short;
window.__GL_CURRENT_BUILD__=V.short;
const selectors='.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version],.v358-version,.v366-ver,.v371-logo em,.v372-logo em';
let painting=false;
function paint(){
 if(painting)return;painting=true;
 try{
  window.GROW_LEGENDS_VERSION=V;window.__GROW_LEGENDS_RELEASE__=V.short;window.__GL_CURRENT_BUILD__=V.short;
  document.querySelectorAll(selectors).forEach(el=>{
   if(!el||el.tagName==='STYLE')return;
   const wanted=(el.matches('.version,#v141VersionLine,[data-version],#version,#gameVersion,#topVersion,[data-top-version],.v358-version'))?V.short:V.short;
   if(el.textContent!==wanted)el.textContent=wanted;
   try{el.dataset.glBuild=V.short}catch(_){}
  });
 }catch(_){}finally{painting=false}
}
function installObserver(){
 try{
  const root=document.querySelector('.app > header')||document.querySelector('header');if(!root||root.__v7135VersionObserver)return;
  root.__v7135VersionObserver=true;
  const mo=new MutationObserver(ms=>{
   let relevant=false;
   for(const m of ms){
    const t=m.target?.nodeType===1?m.target:m.target?.parentElement;
    if(t?.closest?.('header')||[...m.addedNodes||[]].some(n=>n?.nodeType===1&&n.matches?.(selectors))){relevant=true;break}
   }
   if(relevant)queueMicrotask(paint);
  });
  mo.observe(root,{subtree:true,childList:true,characterData:true});
  window.__V7135_VERSION_OBSERVER__=mo;
 }catch(_){}
}
paint();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{paint();installObserver()},{once:true});else installObserver();
window.addEventListener('pageshow',paint,{passive:true});
window.addEventListener('growlegends:account-ready',paint,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',paint,{passive:true});
window.v7135VersionDiagnostics=()=>({
 expected:V.short,
 growVersion:window.GROW_LEGENDS_VERSION?.short||'',
 release:window.__GROW_LEGENDS_RELEASE__||'',
 runtime:window.__GL_RUNTIME_WATCHDOG__?.diagnostics?.()?.version||'',
 visible:[...document.querySelectorAll(selectors)].filter(x=>x.tagName!=='STYLE').map(x=>String(x.textContent||'').trim()).slice(0,20)
});
})();
