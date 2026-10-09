
(()=>{
'use strict';
/* V8.348: keep the explicit full-repair API, but do not rebuild already
   completed hero/summary/XP placement in the shared CHARACTER nav event. */
let navTime={at:0,cpuMs:0,skippedDuplicateHero:false};
function settle(fromCharacterNavigation=false){
 const c=document.getElementById('character');
 const beta=String(window.GROW_RELEASE_CHANNEL||'').toLowerCase()==='beta';
 const started=beta&&fromCharacterNavigation?(performance.now?.()||Date.now()):0;
 const heroReady=!!document.querySelector('#character #v510HeroRoot .v510-layout');
 const skip=beta&&fromCharacterNavigation&&heroReady&&
   window.__v510GoWrapped==='v7119-event'&&
   window.__v514GoWrapped==='v7119-event'&&
   window.__V7124_CHARACTER_SUMMARY_OWNER__===true;
 if(c){
  c.classList.add('v514-reference-hero');
  if(!skip){
   try{window.v510BuildCharacter?.()}catch(_){}
   try{window.v514ApplyHeroReference?.()}catch(_){}
   try{window.v7124PaintCharacterSummary?.()}catch(_){}
   try{window.v7124HardenCharacterAvatar?.()}catch(_){}
  }
 }
 try{window.v7137ApplyOwnFrames?.()}catch(_){}
 if(beta&&fromCharacterNavigation)
   navTime={at:Date.now(),cpuMs:Math.round((performance.now?.()||Date.now())-started),skippedDuplicateHero:skip};
 return !!c;
}
window.v7154CharacterSettle=settle;
window.v7154CharacterNavDiagnostics=()=>({...navTime});
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character'||id==='world')settle(id==='character')},{passive:true});
window.addEventListener('growlegends:account-ready',()=>requestAnimationFrame(settle),{passive:true});
requestAnimationFrame(settle);
window.__V7154_CHARACTER_CLEANUP__=Object.freeze({singleTurnEquipmentSettle:true,legacyHeroTimersRetired:true,legacyHeroObserversRetired:true,avatarFrameIdempotent:true,frameObserverSelfTriggerFixed:true,gameplayRulesChanged:false});
})();
