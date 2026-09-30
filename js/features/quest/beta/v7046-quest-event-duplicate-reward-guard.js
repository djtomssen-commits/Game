
(()=>{
'use strict';
if(window.__V7046_QUEST_EVENT_GUARD__)return;
window.__V7046_QUEST_EVENT_GUARD__=true;

function markAtomicQuestOwners(){
  for(const name of ['claimQuest','v233ClaimQuest']){
    const fn=window[name];
    if(typeof fn==='function' && fn.__v7045Atomic){
      /*
        V4.161 periodically re-wraps Quest claim functions unless this marker is present.
        On server-authoritative Quest, that legacy wrapper would emit questCompleted again
        and old reward listeners could roll fragments / Grow seeds / pets a second time.
        Mark the V7.045 atomic owner as the event source so V4.161 leaves it untouched.
        V7.045 itself handles only the non-reward side effects that must remain.
      */
      fn.__v6140EventSource=true;
      fn.__v6140SourceName=name;
      fn.__v7046ServerQuestOwner=true;
    }
  }
}
markAtomicQuestOwners();

/* Run before V4.161's delayed account-ready reinstall (120 ms). */
window.addEventListener('growlegends:account-ready',()=>markAtomicQuestOwners(),{passive:true});
document.addEventListener('DOMContentLoaded',()=>markAtomicQuestOwners(),{once:true});
window.addEventListener('pageshow',()=>markAtomicQuestOwners(),{passive:true});

/* Defensive re-marking during startup only; no permanent interval. */
[50,180,500,1400,3200].forEach(ms=>setTimeout(markAtomicQuestOwners,ms));

window.v7046QuestEventGuardDiagnostics=()=>({
  version:'V7.046',
  claimQuest:{
    atomic:!!window.claimQuest?.__v7045Atomic,
    centralEventOwner:!!window.claimQuest?.__v6140EventSource,
    guarded:!!window.claimQuest?.__v7046ServerQuestOwner
  },
  v233ClaimQuest:{
    atomic:!!window.v233ClaimQuest?.__v7045Atomic,
    centralEventOwner:!!window.v233ClaimQuest?.__v6140EventSource,
    guarded:!!window.v233ClaimQuest?.__v7046ServerQuestOwner
  }
});
})();
