(()=>{
 'use strict';
 if(window.__V7096_TOWER_DIRECT_PREEMPT__)return;
 window.__V7096_TOWER_DIRECT_PREEMPT__=true;

 /* V8.009-T10: one authoritative door request per tap/transition.
    The old listener could queue a second choose while the first RPC was still
    completing; the second request then reached a non-route state (NOT_ROUTE). */
 let routeBusy=false;
 function setRouteBusy(on){
  routeBusy=!!on;
  try{
   document.querySelectorAll('#tower [data-vt-route]').forEach(b=>{
    b.disabled=routeBusy;
    if(routeBusy)b.setAttribute('aria-busy','true');
    else b.removeAttribute('aria-busy');
   });
  }catch(_){}
 }

 window.addEventListener('click',e=>{
  try{
   const t=e.target instanceof Element?e.target:null;
   const b=t?.closest?.('#tower [data-vt-route]');
   if(!b)return;
   if(!(window.v7081UseAuthority?.('tower')))return;
   e.preventDefault();
   e.stopPropagation();
   e.stopImmediatePropagation();
   if(routeBusy||b.disabled)return;

   const idx=String(b.dataset.vtRoute||'0');
   const run=()=>{
    const fn=window.__V7096_TOWER_DIRECT_ROUTE__;
    if(typeof fn!=='function'){
      setTimeout(()=>{try{
        const late=window.__V7096_TOWER_DIRECT_ROUTE__;
        if(typeof late==='function'){
          setRouteBusy(true);
          Promise.resolve(late(idx)).finally(()=>setRouteBusy(false));
        }
      }catch(_){setRouteBusy(false)}},0);
      return;
    }
    setRouteBusy(true);
    Promise.resolve(fn(idx)).finally(()=>setRouteBusy(false));
   };
   run();
  }catch(err){
   routeBusy=false;
   console.warn('[V8.009-T10] tower direct preempt',err);
  }
 },true);

 window.v8009TowerRouteGuardDiagnostics=()=>({version:'V8.009-T10',routeBusy});
})();
