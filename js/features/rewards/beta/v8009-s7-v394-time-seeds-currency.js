(function(){
  const VERSION='V4.29 Stable';
  let skipBusy=false;
  let rewardBusy=false;

  function ensureTimeSeeds(){
    s.timeSeeds=Math.max(0,Math.floor(Number(s.timeSeeds)||0));
    return s.timeSeeds;
  }

  function saveQuiet(){
    try{persist(false)}catch(e){
      try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
    }
  }

  /*
    50% independent drop chance on every successfully completed quest.
    This wraps the final canonical V4.02 reward path, so normal completion,
    timer completion and a Zeit-Samen skip all use exactly the same roll.
  */
  const baseClaim=v233ClaimQuest;
  v233ClaimQuest=async function(){
    if(rewardBusy)return;
    const q=s.quests?.active;
    if(!q)return baseClaim.apply(this,arguments);

    const qid=String(q.id??q.ends??Date.now());
    rewardBusy=true;
    try{
      const result=baseClaim.apply(this,arguments);
      if(result && typeof result.then==='function')await result;

      /* Only roll after the quest was really consumed by the canonical reward path. */
      if(!s.quests?.active){
        const won=Math.random()<0.50;
        if(won){
          ensureTimeSeeds();
          s.timeSeeds+=1;
          saveQuiet();
          if(typeof v063Toast==='function'){
            v063Toast('🌱 Zeit-Samen gefunden!','success',`+1 Zeit-Samen · Bestand: ${s.timeSeeds}`);
          }
        }
        window.__V394_LAST_QUEST_SEED_ROLL__={qid,won};
      }
      return result;
    }finally{
      rewardBusy=false;
    }
  };
  window.v233ClaimQuest=v233ClaimQuest;

  /*
    Replace only the skip payment layer:
    - no Harz-Taler check
    - no Harz-Taler deduction
    - exactly 1 Zeit-Samen per skipped running quest
    - same V4.02 fight/reward path afterwards
  */
  window.v316SkipActiveQuest=async function(){
    if(skipBusy)return;
    const q=s.quests?.active;
    if(!q)return;

    if(Date.now()>=Number(q.ends||0)){
      return v233ClaimQuest();
    }

    ensureTimeSeeds();
    if(s.timeSeeds<1){
      return v115Alert(
        'Du brauchst 1 Zeit-Samen, um die Questzeit zu überspringen.',
        'Keine Zeit-Samen',
        'warn'
      );
    }

    const left=Math.max(1,Math.ceil((Number(q.ends||0)-Date.now())/1000));
    const ok=await v115Confirm(
      `Die restlichen ${left} Sekunden für 1 Zeit-Samen überspringen?\n\nAktueller Bestand: ${s.timeSeeds}`,
      {
        title:'🌱 Questzeit überspringen',
        type:'confirm',
        okText:'1 Zeit-Samen verwenden'
      }
    );
    if(!ok)return;

    const live=s.quests?.active;
    if(!live || String(live.id)!==String(q.id))return;
    if(Date.now()>=Number(live.ends||0))return v233ClaimQuest();

    ensureTimeSeeds();
    if(s.timeSeeds<1){
      return v115Alert('Du hast keinen Zeit-Samen mehr.','Keine Zeit-Samen','warn');
    }

    skipBusy=true;
    try{
      s.timeSeeds-=1;
      live.ends=Date.now()-1;
      live.v394SkippedWithTimeSeed=true;
      saveQuiet();
      try{renderQuests()}catch(e){}
      return await v233ClaimQuest();
    }finally{
      skipBusy=false;
    }
  };

  /* V8.009: skip UI painting retired here.
     v4127 owns the only .v394-skip-row/.v393-skip render lifecycle. */

  ensureTimeSeeds();
  saveQuiet();

})();
