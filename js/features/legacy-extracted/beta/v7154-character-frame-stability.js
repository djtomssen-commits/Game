
(()=>{
'use strict';
function settle(){
 const c=document.getElementById('character');
 if(c){
  c.classList.add('v514-reference-hero');
  try{window.v510BuildCharacter?.()}catch(_){}
  try{window.v514ApplyHeroReference?.()}catch(_){}
  try{window.v7124PaintCharacterSummary?.()}catch(_){}
  try{window.v7124HardenCharacterAvatar?.()}catch(_){}
 }
 try{window.v7137ApplyOwnFrames?.()}catch(_){}
 return !!c;
}
window.v7154CharacterSettle=settle;
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character'||id==='world')settle()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>requestAnimationFrame(settle),{passive:true});
requestAnimationFrame(settle);
window.__V7154_CHARACTER_CLEANUP__=Object.freeze({singleTurnEquipmentSettle:true,legacyHeroTimersRetired:true,legacyHeroObserversRetired:true,avatarFrameIdempotent:true,frameObserverSelfTriggerFixed:true,gameplayRulesChanged:false});
})();
