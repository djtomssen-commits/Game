
(()=>{
'use strict';
window.__V7127_QUEST_SERVER_OFFER_OWNER__=Object.freeze({
  localVarietyMigrationBlockedOnAuthority:true,
  localEliteSplitBlockedOnAuthority:true,
  localRepairOfferGenerationBlockedOnAuthority:true,
  staleTapReconcilesBeforeStart:true,
  gameplayBalanceChanged:false,
  serverAuthorityChanged:false
});
window.v7127QuestOfferDiagnostics=()=>({
  release:window.__GROW_LEGENDS_RELEASE__||'',
  enforced:!!window.v7110QuestAuthorityEnforced?.(),
  energy:Number(s?.energy)||0,
  offers:(s?.quests?.offers||[]).map(q=>({id:String(q?.id||''),energy:Number(q?.energy)||0,server:!!q?.v7043ServerOffer})),
  elite:s?.quests?.eliteOffer?{id:String(s.quests.eliteOffer.id||''),energy:Number(s.quests.eliteOffer.energy)||0}:null
});
})();
