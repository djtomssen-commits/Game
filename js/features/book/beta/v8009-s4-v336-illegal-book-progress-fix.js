(function(){
  const V336_VERSION='V4.29 Stable';

  function v336Ach(){
    s.v106Achievements??={done:{},stats:{}};
    s.v106Achievements.done??={};
    s.v106Achievements.stats??={};
    s.v106Achievements.stats.questsDone=Math.max(0,Number(s.v106Achievements.stats.questsDone)||0);
    s.v106Achievements.stats.dungeonWins=Math.max(0,Number(s.v106Achievements.stats.dungeonWins)||0);
    return s.v106Achievements;
  }

  /* Canonical dungeon enemies defeated can be reconstructed from real dungeon
     progression. A completed dungeon equals 10 defeated enemies; otherwise
     progress[n] equals the number of defeated rooms (0..9). */
  function v336CanonicalDungeonWins(){
    let total=0;
    const completed=new Set((s.dungeon?.completed||[]).map(Number));
    const progress=s.dungeon?.progress||{};
    const dungeonCount=Array.isArray(dungeons)?dungeons.length:20;

    for(let i=0;i<dungeonCount;i++){
      if(completed.has(i)){
        total+=10;
      }else{
        total+=Math.max(0,Math.min(9,Number(progress[i])||0));
      }
    }
    return total;
  }

  function v336RepairDungeonWins(){
    const a=v336Ach();
    const canonical=v336CanonicalDungeonWins();
    /* Never decrease an already legitimately higher lifetime counter. */
    if(canonical>a.stats.dungeonWins){
      a.stats.dungeonWins=canonical;
      return true;
    }
    return false;
  }

  /* The old V4.02 quest wrapper was later bypassed by newer claim handlers.
     Wrap the FINAL V4.02/V4.02 payout owner. Count only when the exact active
     quest actually disappears after a successful claim. */
  if(typeof v233ClaimQuest==='function'){
    const v336Base233ClaimQuest=v233ClaimQuest;
    v233ClaimQuest=async function(){
      const before=s.quests?.active;
      if(!before || Date.now()<Number(before.ends||0)){
        return v336Base233ClaimQuest.apply(this,arguments);
      }

      const token=String(
        before.v336ProgressToken ||
        before.id ||
        `${before.name||'quest'}|${before.ends||0}|${before.energy||0}|${before.xp||0}|${before.gold||0}`
      );

      s.v336QuestProgressSeen??={};
      if(!before.v336ProgressToken)before.v336ProgressToken=token;

      const result=await v336Base233ClaimQuest.apply(this,arguments);

      /* Successful payout removes/replaces the active quest. */
      if(s.quests?.active!==before && !s.v336QuestProgressSeen[token]){
        s.v336QuestProgressSeen[token]=Date.now();
        const a=v336Ach();
        a.stats.questsDone=(Number(a.stats.questsDone)||0)+1;
        try{v106CheckAchievements(true)}catch(e){}
        try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
        try{v075ScheduleSave()}catch(e){}
      }
      return result;
    };
  }

  /* Dungeon progress is repaired from the actual dungeon state on every
     persistence/render cycle, so all current/future fight handlers are covered. */
  const v336BasePersist=persist;
  persist=function(){
    try{
      if(v336RepairDungeonWins()){
        try{v106CheckAchievements(true)}catch(e){}
      }
    }catch(e){console.warn('V4.02 dungeon achievement repair',e)}
    return v336BasePersist.apply(this,arguments);
  };

  const v336BaseRender=render;
  render=function(){
    try{v336RepairDungeonWins()}catch(e){}
    const r=v336BaseRender.apply(this,arguments);
    try{v106CheckAchievements(true)}catch(e){}
    return r;
  };

  /* Immediate migration/repair for existing dungeon progress. */
  try{
    const changed=v336RepairDungeonWins();
    if(changed){
      localStorage.setItem(KEY,JSON.stringify(s));
      try{v075ScheduleSave()}catch(e){}
    }
    v106CheckAchievements(false);
  }catch(e){console.warn('V4.02 initial achievement repair',e)}

  function v336ApplyVersion(){
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{
      if(el)el.textContent=V336_VERSION;
    });
  }
  v336ApplyVersion();
  setTimeout(v336ApplyVersion,600);
  setTimeout(v336ApplyVersion,2000);
})();
