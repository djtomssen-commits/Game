
(function(){
  const STORE='growlegends_quest_claim_locks_v496';
  const inflight=new Set();

  function accountId(){
    try{
      if(typeof v073User!=='undefined'&&v073User?.id&&!v073User.is_anonymous)return String(v073User.id);
    }catch(e){}
    try{
      const id=String(s?.social?.playerId||localStorage.getItem('growLegendsPlayerId')||'').trim();
      if(id)return id;
    }catch(e){}
    return 'local';
  }

  function questToken(q){
    if(!q)return '';
    const id=String(q.id??'').trim();
    if(id)return id;
    return [q.ends,q.name,q.xp,q.gold,q.energy].map(x=>String(x??'')).join('|');
  }

  function lockKey(q){
    const token=questToken(q);
    return token?`${accountId()}|${token}`:'';
  }

  function readLocks(){
    try{
      const x=JSON.parse(localStorage.getItem(STORE)||'{}');
      return x&&typeof x==='object'&&!Array.isArray(x)?x:{};
    }catch(e){return {}}
  }

  function alreadyPaid(q){
    const k=lockKey(q);if(!k)return false;
    return !!readLocks()[k];
  }

  function markPaid(q){
    const k=lockKey(q);if(!k)return;
    try{
      const x=readLocks();
      x[k]=Date.now();
      const entries=Object.entries(x).sort((a,b)=>(Number(b[1])||0)-(Number(a[1])||0)).slice(0,80);
      localStorage.setItem(STORE,JSON.stringify(Object.fromEntries(entries)));
    }catch(e){}
  }

  function setClaimUiBusy(busy,text){
    try{
      document.querySelectorAll('#claimQuest,#v392ClaimQuest').forEach(btn=>{
        btn.disabled=!!busy;
        if(busy){
          if(!btn.dataset.v496OldText)btn.dataset.v496OldText=btn.textContent||'';
          btn.textContent=text||'Belohnung wird abgeholt …';
          btn.style.pointerEvents='none';
        }else{
          btn.style.pointerEvents='';
          if(btn.dataset.v496OldText){btn.textContent=btn.dataset.v496OldText;delete btn.dataset.v496OldText;}
        }
      });
    }catch(e){}
  }

  function ensureOffers(){
    try{
      s.quests??={};
      /* V7.127: never synthesize replacement offers locally once the quest
         domain is enforced. A missing batch is reconciled from the server. */
      if(window.v7110QuestAuthorityEnforced?.()){
        if(!Array.isArray(s.quests.offers))s.quests.offers=[];
        try{void window.v7110SyncQuestAuthority?.(true)}catch(_){}
        return;
      }
      if(!Array.isArray(s.quests.offers)||!s.quests.offers.length){
        if(typeof makeQuest==='function')s.quests.offers=[makeQuest(),makeQuest(),makeQuest()];
        else s.quests.offers=[];
      }
    }catch(e){}
  }

  function repairStalePaidQuest(){
    try{
      const q=s?.quests?.active;
      if(!q||!alreadyPaid(q))return false;
      s.quests.active=null;
      ensureOffers();
      try{persist(false)}catch(e){
        try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
      }
      return true;
    }catch(e){return false}
  }

  /* V8.009 Quest consolidation:
     v235 is the Local/Mirror transaction owner. Export direct single-payout
     lifecycle hooks instead of wrapping claimQuest. */
  function beginClaim(q){
    const ready=!!q&&Date.now()>=Number(q.ends||0);
    if(!ready)return {ok:false,reason:'NOT_READY'};

    const k=lockKey(q);
    if((k&&inflight.has(k))||alreadyPaid(q)){
      repairStalePaidQuest();
      setClaimUiBusy(true,'Bereits abgeholt');
      try{if(typeof renderQuests==='function')renderQuests()}catch(e){}
      return {ok:false,reason:'ALREADY_PAID',key:k||''};
    }

    if(k)inflight.add(k);
    setClaimUiBusy(true,'Belohnung wird abgeholt …');
    return {ok:true,key:k||'',quest:q};
  }

  function finishClaim(txn,paid){
    if(!txn?.ok)return;
    const q=txn.quest,k=txn.key;
    if(paid&&q){
      markPaid(q);
      setClaimUiBusy(true,'Abgeholt');
    }else{
      setClaimUiBusy(false);
    }
    if(k)inflight.delete(k);
  }

  window.v496BeginQuestClaim=beginClaim;
  window.v496FinishQuestClaim=finishClaim;

  /* Direct pre-render guard used by the canonical Quest renderer. */
  window.v496RepairStalePaidQuest=repairStalePaidQuest;

  try{repairStalePaidQuest()}catch(e){}
})();
