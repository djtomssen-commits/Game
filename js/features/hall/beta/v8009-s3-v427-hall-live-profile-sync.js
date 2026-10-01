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

  /* V8.009: worldboss/equip/unequip sync wrappers retired.
     v438 persists live Hall fields and v7101 is the final public-profile writer. */

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

  /* V8.009: historical Hall ranking sync wrapper retired; v6145 owns ranking. */


  /* V8.009: delayed boot sync retired; canonical account/profile owners handle this. */

  function stamp(){}
  stamp();
})();
