
(function(){
  const VERSION='V4.37 Stable', SHORT='V4.37';
  let refreshing=false;

  function livePower(){
    try{return Math.max(1,Math.round(Number(combatPower())||1))}catch(e){return 1}
  }

  async function freshOpponentProfile(id){
    if(!id || typeof v073Db==='undefined' || !v073Db)return null;
    try{
      const {data,error}=await v073Db
        .from('profiles')
        .select('id,character_name,class_id,class_name,level,combat_power,pvp_buds,equipment,updated_at')
        .eq('id',id)
        .maybeSingle();
      if(error)throw error;
      return data||null;
    }catch(e){
      console.warn('V4.37 PvP opponent profile refresh',e);
      return null;
    }
  }

  function mergeOpponent(profile){
    if(!profile || !v204Opponent)return false;
    if(String(profile.id||'')!==String(v204Opponent.id||''))return false;
    const before=Number(v204Opponent.combat_power)||1;
    v204Opponent={
      ...v204Opponent,
      character_name:profile.character_name||v204Opponent.character_name,
      class_id:profile.class_id||v204Opponent.class_id,
      class_name:profile.class_name||v204Opponent.class_name,
      level:Math.max(1,Number(profile.level)||Number(v204Opponent.level)||1),
      combat_power:Math.max(1,Math.round(Number(profile.combat_power)||before)),
      pvp_buds:Math.max(0,Number(profile.pvp_buds)||0),
      equipment:(profile.equipment&&typeof profile.equipment==='object')?profile.equipment:v204Opponent.equipment
    };
    return Number(v204Opponent.combat_power)!==before;
  }

  async function refreshCurrentOpponent(repaint=true){
    if(refreshing || !v204Opponent?.id)return v204Opponent;
    refreshing=true;
    try{
      const p=await freshOpponentProfile(v204Opponent.id);
      if(p)mergeOpponent(p);
      if(repaint && typeof v204RenderOpponent==='function')v204RenderOpponent();
      return v204Opponent;
    }finally{refreshing=false}
  }

  /* Canonical search owner. The original click listener was bound to the old
     v204_find_pvp_match function before the later V206 replacement existed.
     This final owner uses the corrected V206 RPC and refreshes the opponent
     directly from profiles before anything is displayed. */
  async function findOpponentCanonical(){
    if(v204BattleBusy || v204CooldownLeft>0)return;
    if(typeof v200DurableUser==='function' && !v200DurableUser()){
      if(typeof v063Toast==='function')v063Toast('PvP benötigt einen Account','warn');
      return;
    }

    const btn=document.querySelector('#v204FindBtn');
    if(btn){btn.disabled=true;btn.textContent='🔎 Passenden Gegner suchen…';}

    try{
      /* Own matchmaking power must be the same live value as Character/Hall. */
      try{if(typeof v073SyncProfile==='function')await v073SyncProfile(true)}catch(e){console.warn('V4.37 own PvP sync',e)}

      const {data,error}=await v073Db.rpc('v206_find_pvp_match');
      if(error)throw error;
      const row=Array.isArray(data)?data[0]:data;

      if(!row?.allowed){
        if(row?.remaining_seconds){
          v204CooldownLeft=Number(row.remaining_seconds)*1000;
          if(typeof v204RenderPage==='function')v204RenderPage();
          return;
        }
        if(typeof v063Toast==='function')v063Toast('Kein passender Gegner gefunden','warn','Momentan ist kein Spieler in deinem Level-/Kampfkraftbereich verfügbar.');
        return;
      }

      v204Opponent={
        id:row.target_id,
        character_name:row.character_name,
        class_id:row.class_id,
        class_name:row.class_name,
        level:Math.max(1,Number(row.level)||1),
        combat_power:Math.max(1,Math.round(Number(row.combat_power)||1)),
        pvp_buds:Math.max(0,Number(row.pvp_buds)||0)
      };

      /* RPC result can be an older matchmaking snapshot. The profile row is the
         canonical online value written by the Hall/profile synchronization. */
      const fresh=await freshOpponentProfile(v204Opponent.id);
      if(fresh)mergeOpponent(fresh);

      s.v204Pvp??={buds:0,wins:0,losses:0,fights:0,lastOpponent:null};
      s.v204Pvp.lastOpponent=v204Opponent.id;
      v204CooldownLeft=0;

      if(typeof v204RenderOpponent==='function')v204RenderOpponent();
      const log=document.querySelector('#v204BattleLog');
      if(log)log.textContent='Gegner gefunden. Kampfkraft wurde mit dem aktuellen Profil abgeglichen. Der Cooldown startet erst beim Kampf.';
      if(typeof v204RenderPage==='function')v204RenderPage();
    }catch(e){
      console.error('V4.37 PvP matchmaking',e);
      const raw=String(e?.message||'Matchmaking fehlgeschlagen.');
      const msg=/v206_find_pvp_match|function.*does not exist/i.test(raw)
        ?'Bitte V206_PVP_START_SQL.sql in Supabase ausführen.'
        :raw;
      if(typeof v063Toast==='function')v063Toast('PvP nicht bereit','error',msg);
    }finally{
      if(btn && !v204Opponent && typeof v204RenderPage==='function')v204RenderPage();
    }
  }

  v204FindOpponent=findOpponentCanonical;
  try{window.v204FindOpponent=findOpponentCanonical}catch(e){}

  /* Refresh both sides immediately before the server starts the fight. The final
     V209 combat owner then copies this refreshed opponent and uses the same number
     for display, HP and damage. */
  if(typeof v204Fight==='function'&&!window.__v437PvpFightWrapped){
    const baseFight=v204Fight;
    v204Fight=async function(){
      try{
        if(typeof v073SyncProfile==='function')await v073SyncProfile(true);
        await refreshCurrentOpponent(true);
      }catch(e){console.warn('V4.37 pre-fight power refresh',e)}
      return baseFight.apply(this,arguments);
    };
    try{window.v204Fight=v204Fight}catch(e){}
    window.__v437PvpFightWrapped=true;
  }

  /* Also force the battle overlay labels to the canonical numbers in case an
     older renderer painted a stale snapshot before the animation starts. */
  if(typeof v209OpenBattle==='function'&&!window.__v437PvpBattlePaintWrapped){
    const baseOpen=v209OpenBattle;
    v209OpenBattle=function(enemy){
      const r=baseOpen.apply(this,arguments);
      const my=document.querySelector('#v209PlayerSub');
      const en=document.querySelector('#v209EnemySub');
      const myClass=s.playerClass||'grower';
      const enemyClass=typeof v204ClassIdFromProfile==='function'?v204ClassIdFromProfile(enemy):(enemy?.class_id||'grower');
      if(my)my.textContent=`${classes[myClass]?.name||''} · Lv. ${Math.max(1,Number(s.level)||1)} · Kampfkraft ${livePower()}`;
      if(en)en.textContent=`${enemy?.class_name||classes[enemyClass]?.name||''} · Lv. ${Math.max(1,Number(enemy?.level)||1)} · Kampfkraft ${Math.max(1,Math.round(Number(enemy?.combat_power)||1))}`;
      return r;
    };
    try{window.v209OpenBattle=v209OpenBattle}catch(e){}
    window.__v437PvpBattlePaintWrapped=true;
  }

  function bindFindButton(){
    const old=document.querySelector('#v204FindBtn');
    if(!old || old.dataset.v437Bound==='1')return;
    /* cloneNode removes the historical addEventListener(v204FindOpponent) that
       captured the obsolete V204 function object. */
    const btn=old.cloneNode(true);
    btn.dataset.v437Bound='1';
    old.replaceWith(btn);
    btn.addEventListener('click',findOpponentCanonical);
    try{if(typeof v204RenderPage==='function')v204RenderPage()}catch(e){}
  }

  function stamp(){}

  /* Navigation may recreate/retouch PvP controls through old render chains. */
  if(typeof v032Go==='function'&&!window.__v437PvpGoWrapped){
    const baseGo=v032Go;
    v032Go=function(id){
      const r=baseGo.apply(this,arguments);
      if(id==='pvp')setTimeout(()=>{bindFindButton();stamp()},0);
      return r;
    };
    try{window.v032Go=v032Go}catch(e){}
    window.__v437PvpGoWrapped=true;
  }

  bindFindButton();
  stamp();
  document.addEventListener('DOMContentLoaded',()=>{bindFindButton();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{bindFindButton();stamp()},{passive:true});
  /* V8.009 PvP Sprint 1: navigation/pageshow hooks own PvP binding.
     Keep one finite startup retry per checkpoint; duplicate 2000/5000 ms retries retired. */
  [500,2000,5000].forEach(ms=>setTimeout(()=>{bindFindButton();stamp()},ms));
})();
