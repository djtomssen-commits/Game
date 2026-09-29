(()=>{
 'use strict';
 if(window.__V7096_TOWER_DIRECT_PREEMPT__)return;
 window.__V7096_TOWER_DIRECT_PREEMPT__=true;
 window.addEventListener('click',e=>{
  try{
   const t=e.target instanceof Element?e.target:null;
   const b=t?.closest?.('#tower [data-vt-route]');
   if(!b)return;
   if(!(window.v7081UseAuthority?.('tower')))return;
   e.preventDefault();
   e.stopPropagation();
   e.stopImmediatePropagation();
   const idx=String(b.dataset.vtRoute||'0');
   const run=()=>{
    const fn=window.__V7096_TOWER_DIRECT_ROUTE__;
    if(typeof fn==='function')return void fn(idx);
    setTimeout(()=>{try{window.__V7096_TOWER_DIRECT_ROUTE__?.(idx)}catch(_){}},0);
   };
   run();
  }catch(err){console.warn('[V7.096] tower direct preempt',err)}
 },true);
})();
