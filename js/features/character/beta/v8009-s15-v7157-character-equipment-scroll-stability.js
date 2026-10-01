(()=>{
 'use strict';
 if(window.__V7157_CHARACTER_SCROLL_STABILITY__)return;
 window.__V7157_CHARACTER_SCROLL_STABILITY__=true;
 const slots=['head','weapon','weapon2','ring','body','boots','amulet'];
 function stable(){
   const page=document.getElementById('character');
   const root=document.getElementById('v510HeroRoot');
   if(!page||!root)return false;
   /* Re-parent only on actual lifecycle/navigation changes, never from scroll. */
   try{window.v510BuildCharacter?.()}catch(_){}
   try{window.v6102PaintEquipmentSlots?.()}catch(_){}
   try{window.v514ApplyHeroReference?.()}catch(_){}
   return true;
 }
 window.v7157CharacterStableSettle=stable;
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
   if(String(e?.detail?.id||'')==='character')stable();
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
