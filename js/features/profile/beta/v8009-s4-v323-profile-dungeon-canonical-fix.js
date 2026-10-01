(function(){
  function v323CanonicalDungeonPosition(dp, legacyDungeons=0){
    dp=(dp && typeof dp==='object')?dp:{};

    const completedRaw=Array.isArray(dp.completed)?dp.completed:[];
    const completed=new Set(
      completedRaw
        .map(Number)
        .filter(n=>Number.isInteger(n) && n>=0 && n<20)
    );

    /* Dungeon progression is sequential: the player's real current dungeon is
       the first dungeon in the chain that has not been completed yet.
       `selected` is only a UI selection and must not decide the public profile. */
    let dungeonIndex=0;
    while(dungeonIndex<20 && completed.has(dungeonIndex))dungeonIndex++;

    if(dungeonIndex>=20){
      return {
        dungeonIndex:19,
        dungeonNumber:20,
        enemyNumber:10,
        completed:true
      };
    }

    const rawRoom=dp.progress?.[dungeonIndex];
    const room=Math.max(0,Math.min(9,Number(rawRoom)||0));

    return {
      dungeonIndex,
      dungeonNumber:dungeonIndex+1,
      enemyNumber:room+1,
      completed:false
    };
  }

  /* Replace the old profile helper. V4.02 and all later callers resolve this
     function dynamically, so profile popup / Hall progress use one source. */
  window.v081DungeonPosition=v323CanonicalDungeonPosition;
  try{v081DungeonPosition=v323CanonicalDungeonPosition}catch(e){}

  /* Publish the canonical position as profile metadata without changing which
     dungeon the player currently has open in the local UI. */
  if(typeof v073ProfilePayload==='function'){
    const v323BaseProfilePayload=v073ProfilePayload;
    v073ProfilePayload=function(){
      const payload=v323BaseProfilePayload.apply(this,arguments)||{};
      const localDp={
        completed:Array.isArray(s.dungeon?.completed)?[...s.dungeon.completed]:[],
        progress:{...(s.dungeon?.progress||{})}
      };
      const pos=v323CanonicalDungeonPosition(localDp,localDp.completed.length);
      payload.dungeon_progress={
        ...localDp,
        selected:pos.dungeonIndex,
        room:Math.max(0,pos.enemyNumber-1)
      };
      payload.dungeons=localDp.completed.length;
      return payload;
    };
  }

  /* Refresh the signed-in player's public profile once after boot so existing
     stale `selected` values in Supabase are corrected as well. */
  setTimeout(async()=>{
    try{
      if(typeof v073SyncProfile==='function' && typeof v073Ready!=='undefined' && v073Ready){
        await v073SyncProfile(true);
      }
    }catch(e){
      console.error('V4.02 canonical dungeon profile sync',e);
    }
  },1600);

  
  const line=document.querySelector('#v141VersionLine');
})();
