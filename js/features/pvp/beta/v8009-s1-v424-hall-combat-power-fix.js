
(function(){
  const VERSION='V4.29 Stable';

  function v424CurrentPower(){
    try{return Math.max(0,Math.round(Number(combatPower())||0))}catch(e){return 0}
  }
  function v424OwnId(p){
    return !!(p && v073User?.id && String(p.id||'')===String(v073User.id));
  }

  /* Hall rows come from the public profiles table. Keep the logged-in player's
     row authoritative to the same live combatPower() used on the character page,
     even if an older DB value was fetched a moment earlier. */
  if(typeof v073PlayerRow==='function'&&!window.__v424HallRowWrapped){
    const baseRow=v073PlayerRow;
    v073PlayerRow=function(p,i,actions){
      if(v424OwnId(p))p={...p,combat_power:v424CurrentPower()};
      return baseRow.call(this,p,i,actions);
    };
    try{v084PlayerRow=v073PlayerRow}catch(e){}
    window.__v424HallRowWrapped=true;
  }

  /* Force a fresh profile write BEFORE every Hall ranking fetch. V4.23 can
     recalculate item stats during load/equip; a non-forced profile sync could
     otherwise leave Hall of Haze showing the previous cached combat_power. */
  if(typeof v073LoadRanking==='function'&&!window.__v424HallRankingWrapped){
    const baseRanking=v073LoadRanking;
    v073LoadRanking=async function(){
      try{
        if(typeof v073Init==='function')await v073Init();
        if(typeof v073SyncProfile==='function')await v073SyncProfile(true);
      }catch(e){console.warn('V4.24 Hall combat power sync',e)}
      return baseRanking.apply(this,arguments);
    };
    window.__v424HallRankingWrapped=true;
  }

  /* Final payload owner: the DB receives exactly the same combat power shown on
     the character page, not the legacy Hall-only v074CombatPower formula. */
  if(typeof v073ProfilePayload==='function'&&!window.__v424ProfilePayloadWrapped){
    const basePayload=v073ProfilePayload;
    v073ProfilePayload=function(){
      const p=basePayload.apply(this,arguments)||{};
      p.combat_power=v424CurrentPower();
      return p;
    };
    window.__v424ProfilePayloadWrapped=true;
  }

  function stamp(){}
  stamp();
})();
