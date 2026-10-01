
(()=>{
 'use strict';
 const VERSION=window.GROW_LEGENDS_VERSION?.label||'V4.159 Stable',SHORT=window.GROW_LEGENDS_VERSION?.short||'V4.159';
 function stamp(){}
 function engineSelfCheck(){
  const issues=[];
  try{
   if(typeof window.v4107RunQA!=='function')issues.push('v4107RunQA fehlt');
   if(typeof window.v4107OpenSystemtechnik!=='function')issues.push('Systemtechnik-Öffner fehlt');
   const t=window.__V4106_TECH__;
   if(t&&!(t.listeners instanceof Map))issues.push('Listener-Registry ungültig');
  }catch(e){issues.push(e.message||String(e))}
  return issues;
 }
 window.v4116SystemtechnikSelfCheck=engineSelfCheck;
 stamp();
 /* V4.123: periodic version stamp retired. */
})();
