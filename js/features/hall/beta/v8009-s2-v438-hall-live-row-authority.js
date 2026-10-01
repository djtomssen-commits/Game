(function(){
  const VERSION='V4.38 Stable', SHORT='V4.38';
  let syncBusy=false, syncTimer=0, lastJson='';

  function livePower(){
    try{return Math.max(0,Math.round(Number(combatPower())||0))}catch(e){return 0}
  }
  function liveWorldBoss(){
    try{
      if(typeof v112EnsureWorldBossState==='function')return v112EnsureWorldBossState()||{};
    }catch(e){}
    try{return s?.v110WorldBoss||{}}catch(e){return {}}
  }
  function liveFields(){
    const wb=liveWorldBoss();
    return {
      combat_power:livePower(),
      worldboss_attempts:Math.max(0,Math.floor(Number(wb.attempts)||0)),
      worldboss_wins:Math.max(0,Math.floor(Number(wb.wins)||0)),
      updated_at:new Date().toISOString()
    };
  }
  function comparable(fields){
    return JSON.stringify({
      combat_power:Number(fields.combat_power)||0,
      worldboss_attempts:Number(fields.worldboss_attempts)||0,
      worldboss_wins:Number(fields.worldboss_wins)||0
    });
  }

  async function writeLiveHall(force=false){
    if(syncBusy)return true;
    try{
      if(typeof v073Init==='function')await v073Init();
      if(typeof v073Db==='undefined'||!v073Db||typeof v073User==='undefined'||!v073User||v073User.is_anonymous)return false;
      if(!s?.characterNameSet)return false;
      if(typeof v071NameValid==='function'&&!v071NameValid(s.characterName))return false;

      const fields=liveFields(), json=comparable(fields);
      if(!force && json===lastJson)return true;
      syncBusy=true;
      const {error}=await window.v7101ProfileUpdate(fields).eq('id',v073User.id);
      if(error)throw error;
      lastJson=json;
      return true;
    }catch(e){
      console.warn('V4.38 Hall live sync',e);
      return false;
    }finally{syncBusy=false}
  }

  function ownRow(){
    try{
      if(typeof v073User==='undefined'||!v073User?.id)return null;
      const id=String(v073User.id);
      return [...document.querySelectorAll('#v072HallRanking .v072-player-row[data-profile-id]')]
        .find(row=>String(row.getAttribute('data-profile-id')||'')===id)||null;
    }catch(e){return null}
  }

  function paintOwnRankingRow(){
    const row=ownRow();
    if(!row)return false;
    const f=liveFields();

    const sub=row.querySelector('.v072-player-sub');
    if(sub){
      const html=sub.innerHTML;
      if(/Kampfkraft\s*[\d.]+/i.test(html)){
        sub.innerHTML=html.replace(/Kampfkraft\s*[\d.]+/i,`Kampfkraft ${f.combat_power}`);
      }else{
        const text=sub.textContent||'';
        if(/Kampfkraft\s*[\d.]+/i.test(text))sub.textContent=text.replace(/Kampfkraft\s*[\d.]+/i,`Kampfkraft ${f.combat_power}`);
      }
    }

    const mystic=row.querySelector('.v116-wb-inline');
    if(mystic)mystic.textContent=`🔷 Mystisch: ${f.worldboss_attempts} Versuche · ${f.worldboss_wins} Siege`;
    return true;
  }

  function paintOwnProfileCard(){
    try{
      const root=document.querySelector('#v072OwnProfile');
      if(!root)return;
      const f=liveFields();
      const stat=[...root.querySelectorAll('.v072-profile-stat')].find(x=>/Kampfkraft/i.test(x.textContent||''));
      if(stat){const b=stat.querySelector('b');if(b)b.textContent=String(f.combat_power)}
      const mystic=root.querySelector('.v116-wb-inline');
      if(mystic)mystic.textContent=`🔷 Mystisch: ${f.worldboss_attempts} Versuche · ${f.worldboss_wins} Siege`;
    }catch(e){}
  }

  function repaintHall(){
    paintOwnRankingRow();
    paintOwnProfileCard();
  }

  function scheduleSync(force=false){
    clearTimeout(syncTimer);
    syncTimer=setTimeout(async()=>{
      await writeLiveHall(force);
      repaintHall();
    },force?0:350);
  }

  /* V8.009: old v073SyncProfile/v073LoadRanking wrappers retired.
     v7101-final owns profile sync and v6145 owns Hall ranking. */

  /* Any local change that can alter power or worldboss totals immediately updates
     the visible own Hall row and schedules the server row update. */
  if(typeof persist==='function'&&!window.__v438PersistWrapped){
    const base=persist;
    persist=function(){
      const r=base.apply(this,arguments);
      repaintHall();
      scheduleSync(false);
      return r;
    };
    try{window.persist=persist}catch(e){}
    window.__v438PersistWrapped=true;
  }

  if(typeof v110Refresh==='function'&&!window.__v438WorldBossRefreshWrapped){
    const base=v110Refresh;
    v110Refresh=function(){
      const r=base.apply(this,arguments);
      repaintHall();
      scheduleSync(true);
      return r;
    };
    try{window.v110Refresh=v110Refresh}catch(e){}
    window.__v438WorldBossRefreshWrapped=true;
  }

  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')==='hall')void (async()=>{await writeLiveHall(true);repaintHall()})();
  },{passive:true});
  window.__v438HallGoWrapped='v7119-event';

  function stamp(){}

  repaintHall();
  stamp();
  window.addEventListener('growlegends:account-ready',()=>{repaintHall();scheduleSync(true);stamp()},{passive:true});
  /* V6.217: Hall render hooks own repainting; avoid 30 startup-wide full repaints. */
})();
