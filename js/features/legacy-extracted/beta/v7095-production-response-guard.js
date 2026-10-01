
(()=>{
'use strict';
if(window.__V7095_RESPONSE_GUARD__)return;window.__V7095_RESPONSE_GUARD__=true;
const VERSION='V7.095';
const S={nav:0,lastNavAt:0,lastScreen:''};
document.addEventListener('click',e=>{
 try{
  const n=e.target?.closest?.('[data-screen],[data-go],[data-v085-go]');if(!n)return;
  const target=String(n.dataset.screen||n.dataset.go||n.dataset.v085Go||'');
  const t=performance.now();S.nav++;S.lastNavAt=Date.now();S.lastScreen=target;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const ms=Math.round(performance.now()-t);
   if(ms>450)window.__GL_RUNTIME_WATCHDOG__?.report?.('slow_navigation','warn',{target,ms},{screen:target||'system',incidentKey:target||'nav'});
  }));
 }catch(_){}
},{capture:true,passive:true});
window.v7095ResponseDiagnostics=()=>({version:VERSION,...S});
})();
