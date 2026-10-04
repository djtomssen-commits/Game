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
  /* Zeit-Samen rewards are contained in the canonical server Quest receipt.
     The historical local 50% post-claim roll is retired. */
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
      if(typeof v073Db!=='undefined'&&v073Db){
        if(typeof v073Db==='undefined'||!v073Db)throw new Error('SERVER_NOT_READY');
        const {data,error}=await v073Db.rpc('v7044_skip_quest');
        if(error)throw error;
        const r=Array.isArray(data)?(data[0]||null):data;
        if(!r?.ok){
          const reason=String(r?.reason||'QUEST_SKIP_REJECTED');
          if(reason==='NO_TIME_SEED'){
            if(Number.isFinite(Number(r.time_seeds)))s.timeSeeds=Math.max(0,Number(r.time_seeds));
            return v115Alert('Du hast keinen Zeit-Samen mehr.','Keine Zeit-Samen','warn');
          }
          if(reason==='QUEST_RECEIPT_PENDING')return v115Alert('Bitte zuerst die offene Quest-Belohnung abholen.','Belohnung offen','warn');
          throw new Error(reason);
        }
        if(Number.isFinite(Number(r.time_seeds)))s.timeSeeds=Math.max(0,Number(r.time_seeds));
        if(r.active&&typeof r.active==='object'){
          s.quests=(s.quests&&typeof s.quests==='object')?s.quests:{};
          s.quests.active=JSON.parse(JSON.stringify(r.active));
        }
        try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}
        try{renderQuests()}catch(_){}
        try{window.v441PaintResources?.()}catch(_){}
        return await v233ClaimQuest();
      }

      /* No local burn fallback. Quest skip is server-owned. */
      try{window.v063Toast?.('Quest-Skip noch nicht bereit','warn','Server-Verbindung wird noch aufgebaut.')}catch(_){}
      return false;
    }catch(err){
      try{v063Toast?.('Quest-Skip fehlgeschlagen','error',String(err?.message||err))}catch(_){}
      return false;
    }finally{
      skipBusy=false;
    }
  };

  /* V8.009: skip UI painting retired here.
     v4127 owns the only .v394-skip-row/.v393-skip render lifecycle. */

  ensureTimeSeeds();
  saveQuiet();

})();
