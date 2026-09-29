/* === v559-guild-final-fixes-js === */
(function(){
  'use strict';
  function syncEmptyRequests(){
    const card=document.querySelector('#guild #v257RequestsCard');
    const list=document.querySelector('#guild #v257GuildRequests');
    const count=document.querySelector('#guild #v257RequestCount');
    if(!card||!list)return;

    const hasRequest=!!list.querySelector('.v257-request');
    const empty=list.querySelector('.v257-search-empty');
    const emptyText=String(empty?.textContent||'').trim().toLowerCase();
    const n=Number.parseInt(String(count?.textContent||'0').trim(),10)||0;
    const trulyEmpty=!hasRequest && n===0 && emptyText.includes('keine offenen beitrittsanfragen');
    card.classList.toggle('v559-no-requests',trulyEmpty);
  }

  function paint(){syncEmptyRequests()}
  paint();

  /* V6.120: no whole-guild observer. Update exactly when requests rerender. */
  if(typeof v257RenderRequests==='function'&&!window.__v6120RequestEmptyHook){
    const base=v257RenderRequests;
    const wrapped=function(){
      const r=base.apply(this,arguments);
      requestAnimationFrame(paint);
      return r;
    };
    try{v257RenderRequests=wrapped}catch(e){}
    window.v257RenderRequests=wrapped;
    window.__v6120RequestEmptyHook=true;
  }

  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(paint),{once:true});
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#v380RefreshGuildRequests'))requestAnimationFrame(paint);
  },true);
})();

