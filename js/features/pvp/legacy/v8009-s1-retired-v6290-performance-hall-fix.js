/* RETIRED FROM ACTIVE BETA IN V8.009-PVP-SPRINT-1. DO NOT LOAD.
   Ranking/own-profile post-render decoration moved directly into v6145/v326. */

(()=>{
 'use strict';
 if(window.__V6290_PERF_HALL_FIX__)return;
 window.__V6290_PERF_HALL_FIX__=true;

 function repairHall(){
   try{
     if(typeof window.v646DecorateHall==='function')window.v646DecorateHall();
   }catch(_){}
 }

 /* Hall ranking and own profile are async; repaint exactly once after they finish. */
 try{
   if(typeof v073LoadRanking==='function'&&!window.__v6290HallRankingWrapped){
     const base=v073LoadRanking;
     const wrapped=async function(){
       const r=await base.apply(this,arguments);
       requestAnimationFrame(repairHall);
       return r;
     };
     try{v073LoadRanking=wrapped}catch(_){}
     window.v073LoadRanking=wrapped;
     window.__v6290HallRankingWrapped=true;
   }
 }catch(_){}

 try{
   if(typeof v072RenderOwnProfile==='function'&&!window.__v6290OwnProfileWrapped){
     const base=v072RenderOwnProfile;
     const wrapped=function(){
       const r=base.apply(this,arguments);
       requestAnimationFrame(repairHall);
       return r;
     };
     try{v072RenderOwnProfile=wrapped}catch(_){}
     window.v072RenderOwnProfile=wrapped;
     window.__v6290OwnProfileWrapped=true;
   }
 }catch(_){}

 document.addEventListener('click',e=>{
   const hit=e.target instanceof Element
     ? e.target.closest('[data-screen="hall"],[data-go="hall"],[data-v085-go="hall"]')
     : null;
   if(hit)setTimeout(repairHall,0);
 },true);

 window.addEventListener('growlegends:account-ready',()=>setTimeout(repairHall,90));

 window.v6290Diagnostics=()=>({
   version:'V6.290',
   class:String(window.s?.playerClass||''),
   hallOwnAvatar:document.querySelector('#v072OwnProfile .v646-own-avatar img')?.getAttribute('src')?.slice(0,28)||'',
   hallSummonerRows:[...document.querySelectorAll('#v072HallRanking .v072-player-row')]
     .filter(r=>(r.textContent||'').toLowerCase().includes('harzruferin')).length,
   globalV6287ObserverRemoved:true,
   globalV6289ObserverRemoved:true
 });
})();
