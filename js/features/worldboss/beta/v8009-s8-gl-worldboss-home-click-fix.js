(()=>{'use strict';
 if(window.__GL_WORLDBOSS_HOME_CLICK_FIX__)return;
 window.__GL_WORLDBOSS_HOME_CLICK_FIX__=true;

 function activeCard(){
   return document.querySelector('#world.active .v366-feature.boss.v6115-boss-open');
 }
 function prepareCard(){
   const card=activeCard();
   if(!card)return;
   card.setAttribute('role','button');
   card.setAttribute('tabindex','0');
   card.setAttribute('aria-label','Mystischen Weltboss Smaragd-Koloss öffnen');
 }
 function openBoss(){
   try{
     /* Use the final hardened opener first. It includes the later
        worldboss state/fight-button fixes which v110Open bypasses. */
     if(typeof window.v111OpenWorldBoss==='function'){
       window.v111OpenWorldBoss();
       return true;
     }
     if(typeof window.v110Open==='function'){
       window.v110Open();
       return true;
     }
   }catch(err){
     console.error('Startseite Weltboss öffnen fehlgeschlagen',err);
     try{window.v063Toast?.('Weltboss-Fehler','error','Der Weltboss konnte nicht geöffnet werden.')}catch(_){}
   }
   return false;
 }

 /* Capture phase deliberately owns the complete active boss slot, including
    the old button, so the stale v110Open onclick from the home renderer can
    never win the race. */
 document.addEventListener('click',e=>{
   const t=e.target instanceof Element?e.target:null;
   const card=t?.closest?.('#world.active .v366-feature.boss.v6115-boss-open');
   if(!card)return;
   e.preventDefault();
   e.stopImmediatePropagation();
   e.stopPropagation();
   openBoss();
 },true);

 document.addEventListener('keydown',e=>{
   if(e.key!=='Enter'&&e.key!==' ')return;
   const t=e.target instanceof Element?e.target:null;
   const card=t?.closest?.('#world.active .v366-feature.boss.v6115-boss-open');
   if(!card)return;
   e.preventDefault();
   openBoss();
 },true);

 const refresh=()=>requestAnimationFrame(prepareCard);
 document.addEventListener('DOMContentLoaded',refresh,{once:true});
 window.addEventListener('pageshow',refresh,{passive:true});
 window.addEventListener('growlegends:account-ready',refresh);
 try{new MutationObserver(refresh).observe(document.getElementById('world')||document.documentElement,{childList:true,subtree:true})}catch(_){}
 window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world')prepareCard()},{passive:true});
 prepareCard();

 window.__GL_WORLDBOSS_HOME_CLICK_QA__=()=>({
   active:!!activeCard(),
   hardenedOpener:typeof window.v111OpenWorldBoss==='function',
   legacyFallback:typeof window.v110Open==='function',
   fullCardClickable:!!activeCard()?.getAttribute('tabindex')
 });
})();
