/* ===== V4.02 Gold event payout guard =====
   Verify the REAL gold balance delta after the complete historical quest
   payout chain. During an active Gold event a completed quest must grant
   exactly 2x its base Gold, regardless of which old claim layer paid first.
*/

const v285BaseClaimQuest=claimQuest;
claimQuest=function(...args){
  const q=s.quests?.active;
  const ready=!!q && Date.now()>=Number(q.ends||0);

  if(!ready){
    return v285BaseClaimQuest.apply(this,args);
  }

  const goldEvent=typeof v274GoldEventActive==='function' && v274GoldEventActive();
  const baseGold=Math.max(0,Number(q.v274BaseGold ?? q.gold)||0);
  const beforeGold=Math.max(0,Number(s.gold)||0);

  q.v274BaseGold=baseGold;

  const result=v285BaseClaimQuest.apply(this,args);

  if(!s.quests?.active && goldEvent){
    const afterGold=Math.max(0,Number(s.gold)||0);
    const actualGain=Math.max(0,afterGold-beforeGold);
    const wantedGain=baseGold*2;
    const missing=Math.max(0,wantedGain-actualGain);

    if(missing>0){
      s.gold=afterGold+missing;
      try{persist(false)}catch(e){
        try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
      }
    }

    try{
      v063Toast?.(
        '💰 2× Gold Event',
        'success',
        `${baseGold} Gold ×2 = ${wantedGain} Gold erhalten`
      );
    }catch(e){}
  }

  return result;
};

/* V4.02 snapshots the quest before claimQuest runs, so its popup still holds
   the base reward. Correct the displayed reward to the verified 2x value. */
if(typeof v235ShowQuestReward==='function'){
  const v285BaseShowQuestReward=v235ShowQuestReward;
  v235ShowQuestReward=function(before){
    const r=v285BaseShowQuestReward(before);

    try{
      if(v274GoldEventActive()){
        const q=before?.q||{};
        const baseGold=Math.max(0,Number(q.v274BaseGold ?? q.gold)||0);
        const gold=document.querySelector('#v231QuestRewardGold');
        if(gold)gold.textContent=`+${baseGold*2}`;
      }
    }catch(e){}

    return r;
  };
}

/* V8.009: no-op global render wrapper retired. */;


const v285Line=document.querySelector('#v141VersionLine');
