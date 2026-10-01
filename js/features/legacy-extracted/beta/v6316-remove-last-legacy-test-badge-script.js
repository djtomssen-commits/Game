
(()=>{
  'use strict';
  if(window.__V6316_LAST_LEGACY_BADGE__)return;
  window.__V6316_LAST_LEGACY_BADGE__=true;
  function clean(){
    const arena=document.getElementById('v260DailyBossArena');
    if(!arena)return;
    /* Keep test mode for logic, but remove any old injected visual badge nodes. */
    arena.querySelectorAll('[data-v6204-test-badge],.v6204-test-badge,.v6204-test-label').forEach(n=>n.remove());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-v254-tab="boss"]'))clean()},true);
})();
