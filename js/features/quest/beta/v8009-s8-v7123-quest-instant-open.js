(()=>{
'use strict';
if(window.__V7123_QUEST_INSTANT_OPEN__)return;
window.__V7123_QUEST_INSTANT_OPEN__=true;
const EVENT='growlegends:navigation-open-v7119';
const S=window.__V7123_QUEST_STATE__||(window.__V7123_QUEST_STATE__={opens:0,lastSyncMs:0,lastError:''});
window.addEventListener(EVENT,e=>{
  if(String(e?.detail?.id||'')!=='quests')return;
  S.opens++;
  /* V7.123: never hide or delay the quest page. The canonical renderer paints
     immediately. Authority reconciliation is non-blocking and already repaints
     only when the server state actually differs from the local snapshot. */
  if(window.v7110QuestAuthorityEnforced?.()&&typeof window.v7110SyncQuestAuthority==='function'){
    const started=performance.now();
    Promise.resolve(window.v7110SyncQuestAuthority(false)).then(()=>{
      S.lastSyncMs=Math.round(performance.now()-started);S.lastError='';
    }).catch(err=>{S.lastError=String(err?.message||err)});
  }
},{passive:true});
window.__GROW_LEGENDS_RELEASE__='V7.123';
window.__V7123_CLEANUP__=Object.freeze({
  phase:8,
  questWaitingRoomRemoved:true,
  questArtificialDelayRemoved:true,
  duplicateQuestNavigationPaintersRemainRetired:true,
  authoritySyncNonBlocking:true,
  gameplayRulesChanged:false,
  rewardsChanged:false,
  serverAuthorityChanged:false
});
window.v7123QuestDiagnostics=()=>({
  release:window.__GROW_LEGENDS_RELEASE__||'',
  version:window.GROW_LEGENDS_VERSION?.short||'',
  opens:S.opens,lastSyncMs:S.lastSyncMs,lastError:S.lastError,
  waitingRoom:false,
  routeWrapRetired:window.__V7110_QUEST_ROUTE_WRAP_RETIRED__||''
});
})();
