(function(){
  /* Preserve the free-fight timestamp across a paid Harz-Taler dungeon fight.
     The existing fight code may write dungeonPass.lastFree; after a paid fight
     we restore the exact timestamp that was running before the fight. */
  let v332PaidFight=false;
  let v332SavedLastFree=0;

  const v332BaseDungeonFight = typeof fightDungeon==='function'?fightDungeon:null;
  if(v332BaseDungeonFight)fightDungeon = async function(){
    const before=Number(s.dungeonPass?.lastFree)||0;
    const left=Math.max(0,3600000-(Date.now()-before));
    const isPaid=left>0;

    if(isPaid){
      v332PaidFight=true;
      v332SavedLastFree=before;
    }

    try{
      const result=await v332BaseDungeonFight.apply(this,arguments);
      return result;
    }finally{
      if(isPaid){
        s.dungeonPass??={};
        s.dungeonPass.lastFree=v332SavedLastFree;
        v332PaidFight=false;
        try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
        try{if(typeof v324Paint==='function')v324Paint()}catch(e){}
        try{renderDungeon()}catch(e){}
      }
    }
  };

  /* Safety net: if any nested legacy handler tries to reset the timestamp
     during the paid fight, persist() cannot make that reset permanent. */
  const v332BasePersist=persist;
  persist=function(){
    if(v332PaidFight){
      s.dungeonPass??={};
      s.dungeonPass.lastFree=v332SavedLastFree;
    }
    return v332BasePersist.apply(this,arguments);
  };

  
  const line=document.querySelector('#v141VersionLine');
})();
