(function(){
  const VERSION='V4.29 Stable';
  function livePower(){
    try{
      const fn=window.v4125StableCombatPower;
      return Math.max(0,Math.round(Number(typeof fn==='function'?fn():combatPower())||0))
    }catch(e){return 0}
  }
  function wbState(){
    try{
      if(typeof v112EnsureWorldBossState==='function')return v112EnsureWorldBossState();
      return s.v110WorldBoss||{};
    }catch(e){return {}}
  }
  async function syncHall(force=true){
    try{
      if(typeof v073Init==='function')await v073Init();
      if(typeof v073SyncProfile==='function')await v073SyncProfile(force);
    }catch(e){console.warn('V4.27 Hall profile sync',e)}
  }

  /* Final public payload owner: Hall/DB gets exactly the live combat power shown
     by the character UI and the persistent mystic-worldboss totals. */
  if(typeof v073ProfilePayload==='function'&&!window.__v427ProfilePayloadWrapped){
    const base=v073ProfilePayload;
    v073ProfilePayload=function(){
      const p=base.apply(this,arguments)||{};
      const wb=wbState();
      p.combat_power=livePower();
      p.worldboss_attempts=Math.max(0,Number(wb.attempts)||0);
      p.worldboss_wins=Math.max(0,Number(wb.wins)||0);
      return p;
    };
    window.__v427ProfilePayloadWrapped=true;
  }

  /* The worldboss increments attempts/wins locally at fight end. Its old path
     only persisted the save, so other players could keep seeing stale Hall totals.
     v110Refresh is called after the fight transaction; sync exactly when totals changed. */
  if(typeof v110Refresh==='function'&&!window.__v427WorldbossRefreshWrapped){
    const baseRefresh=v110Refresh;
    let last='';
    v110Refresh=function(){
      const r=baseRefresh.apply(this,arguments);
      const wb=wbState();
      const sig=`${Math.max(0,Number(wb.attempts)||0)}:${Math.max(0,Number(wb.wins)||0)}`;
      if(last && sig!==last)syncHall(true);
      last=sig;
      return r;
    };
    window.__v427WorldbossRefreshWrapped=true;
  }

  /* Item/equipment changes alter combat power. Sync after the canonical equip paths
     so Hall never keeps the previous value until a later page reload. */
  if(typeof window.equip==='function'&&!window.__v427EquipWrapped){
    const baseEquip=window.equip;
    window.equip=function(){
      const r=baseEquip.apply(this,arguments);
      Promise.resolve(r).finally(()=>setTimeout(()=>syncHall(true),0));
      return r;
    };
    window.__v427EquipWrapped=true;
  }
  if(typeof window.unequip==='function'&&!window.__v427UnequipWrapped){
    const baseUnequip=window.unequip;
    window.unequip=function(){
      const r=baseUnequip.apply(this,arguments);
      Promise.resolve(r).finally(()=>setTimeout(()=>syncHall(true),0));
      return r;
    };
    window.__v427UnequipWrapped=true;
  }

  /* Own Hall row/profile is always painted from live power, not a just-fetched stale DB value. */
  if(typeof v073PlayerRow==='function'&&!window.__v427HallRowWrapped){
    const baseRow=v073PlayerRow;
    v073PlayerRow=function(p,i,actions){
      if(p&&v073User?.id&&String(p.id||'')===String(v073User.id))p={...p,combat_power:livePower()};
      return baseRow.call(this,p,i,actions);
    };
    try{v084PlayerRow=v073PlayerRow}catch(e){}
    window.__v427HallRowWrapped=true;
  }

  if(typeof v073LoadRanking==='function'&&!window.__v427RankingWrapped){
    const baseRanking=v073LoadRanking;
    v073LoadRanking=async function(){
      await syncHall(true);
      return baseRanking.apply(this,arguments);
    };
    window.__v427RankingWrapped=true;
  }

  /* One boot sync repairs stale public data from older versions once the account is ready. */
  setTimeout(()=>syncHall(true),1800);

  function stamp(){}
  stamp();
})();
