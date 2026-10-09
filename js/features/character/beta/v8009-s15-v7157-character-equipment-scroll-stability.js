(()=>{
 'use strict';
 if(window.__V7157_CHARACTER_SCROLL_STABILITY__)return;
 window.__V7157_CHARACTER_SCROLL_STABILITY__=true;
 const slots=['head','weapon','weapon2','ring','body','boots','amulet'];
 /* V8.344 Beta: v510 and v514 register their own navigation listeners
    before this owner. In the same character event, do not rebuild the
    same hero/layout twice. Equipment/scroll stabilization still runs.
    Explicit stable() calls and account-ready continue to do full work. */
 let lastNav={at:0,totalMs:0,equipmentMs:0,skipped510:false,skipped514:false};
 window.v7157CharacterNavDiagnostics=()=>({...lastNav});
 function stable(fromCharacterNavigation=false){
   const page=document.getElementById('character');
   const root=document.getElementById('v510HeroRoot');
   if(!page||!root){
     /* V8.347 diagnostic: distinguish an absent hero root from an
        uninstalled owner when the opt-in character profiler is running. */
     if(fromCharacterNavigation&&String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta')
       lastNav={at:Date.now(),totalMs:0,equipmentMs:0,skipped510:false,skipped514:false,
         missingRoot:!root,missingPage:!page};
     return false;
   }
   const began=performance.now?.()||Date.now();
   const skipped510=fromCharacterNavigation&&window.__v510GoWrapped==='v7119-event';
   const skipped514=fromCharacterNavigation&&window.__v514GoWrapped==='v7119-event';
   /* Retain fallback for any missing canonical navigation owner. */
   if(!skipped510)try{window.v510BuildCharacter?.()}catch(_){}
   const equipmentStart=performance.now?.()||Date.now();
   try{window.v6102PaintEquipmentSlots?.()}catch(_){}
   const equipmentMs=Math.round((performance.now?.()||Date.now())-equipmentStart);
   if(!skipped514)try{window.v514ApplyHeroReference?.()}catch(_){}
   if(fromCharacterNavigation){
     lastNav={at:Date.now(),totalMs:Math.round((performance.now?.()||Date.now())-began),
       equipmentMs,skipped510,skipped514};
   }
   return true;
 }
 window.v7157CharacterStableSettle=stable;
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
   if(String(e?.detail?.id||'')==='character')stable(true);
 },{passive:true});
 window.addEventListener('growlegends:account-ready',()=>requestAnimationFrame(stable),{passive:true});
 /* Deliberately NO scroll/touchmove listener, NO MutationObserver, NO interval. */
 window.v7157CharacterScrollDiagnostics=()=>({
   version:'V7.160',
   active:!!document.getElementById('character')?.classList.contains('active'),
   resourceScrollRepaintRetired:!!window.__V7157_RESOURCE_SCROLL_REPAINT_RETIRED__,
   layout:!!document.querySelector('#character #v510HeroRoot .v510-layout'),
   slots:slots.map(k=>{const el=document.getElementById('slot-'+k);return {slot:k,exists:!!el,parent:el?.parentElement?.className||'',display:el?getComputedStyle(el).display:''}}),
   noScrollRepair:true,
   noObserver:true
 });
 window.__V7157_CHARACTER_FIX__=Object.freeze({
   wholeEquipmentGridPaintHardened:true,
   slotOverflowLayerRetired:true,
   decorativeStageFilterRetired:true,
   globalResourceScrollDomWriterRetired:true,
   scrollRepairLoopAdded:false,
   mutationObserverAdded:false,
   legacyResizeDomWritersRetired:true,gameplayRulesChanged:false
 });
})();
