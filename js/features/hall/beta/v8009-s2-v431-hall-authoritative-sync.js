(function(){
  const VERSION='V4.32 Stable', SHORT='V4.32';
  let lastHallJson='';
  let syncTimer=0;
  let syncBusy=false;

  function livePower(){
    try{return Math.max(0,Math.round(Number(combatPower())||0))}catch(e){return 0}
  }
  function worldBoss(){
    try{if(typeof v112EnsureWorldBossState==='function')return v112EnsureWorldBossState()}catch(e){}
    s.v110WorldBoss??={day:'',freeUsed:false,wins:0,attempts:0};
    return s.v110WorldBoss;
  }
  function hallFields(){
    const wb=worldBoss();
    return {
      combat_power:livePower(),
      worldboss_attempts:Math.max(0,Number(wb.attempts)||0),
      worldboss_wins:Math.max(0,Number(wb.wins)||0),
      updated_at:new Date().toISOString()
    };
  }
  function comparable(x){const c={...x};delete c.updated_at;return JSON.stringify(c)}

  /* Root cause: the existing-account UPDATE path did not write combat_power or
     worldboss_attempts/worldboss_wins although the Hall later reads these columns. */
  async function writeHallFields(force=false){
    if(syncBusy)return true;
    if(!v073Ready||!v073User||v073User.is_anonymous||!v073Db)return false;
    if(!s.characterNameSet || (typeof v071NameValid==='function'&&!v071NameValid(s.characterName)))return false;
    const fields=hallFields(),json=comparable(fields);
    if(!force && json===lastHallJson)return true;
    syncBusy=true;
    try{
      const {error}=await window.v7101ProfileUpdate(fields).eq('id',v073User.id);
      if(error)throw error;
      lastHallJson=json;
      return true;
    }catch(e){
      console.error('V4.31 Hall sync',e);
      return false;
    }finally{syncBusy=false}
  }

  /* Keep all existing login/name/cloud safeguards. After their normal sync,
     write the three Hall values that the legacy UPDATE omitted. */
  if(typeof v073SyncProfile==='function'){
    const baseSync=v073SyncProfile;
    v073SyncProfile=async function(force=false){
  if(window.__V200_AUTH_READY__!==true)return false;
      const ok=await baseSync.apply(this,arguments);
      if(ok)await writeHallFields(!!force);
      return ok;
    };
  }

  /* New profiles also start with the exact same live values. */
  if(typeof v073ProfilePayload==='function'){
    const basePayload=v073ProfilePayload;
    v073ProfilePayload=function(){
      const p=basePayload.apply(this,arguments)||{};
      return {...p,...hallFields(),id:v073User?.id||p.id};
    };
  }

  async function syncHall(force=false){
    try{
      if(typeof v073Init==='function')await v073Init();
      if(typeof v073SyncProfile==='function')return await v073SyncProfile(!!force);
    }catch(e){console.warn('V4.31 Hall sync request',e)}
    return false;
  }
  function scheduleHallSync(force=false){
    clearTimeout(syncTimer);
    syncTimer=setTimeout(()=>syncHall(force),700);
  }

  /* Combat power can change through attributes, talents, level-ups and equipment;
     worldboss totals change at fight end. All those paths persist the save. */
  if(typeof persist==='function'){
    const basePersist=persist;
    persist=function(){
      const r=basePersist.apply(this,arguments);
      scheduleHallSync(false);
      return r;
    };
  }

  /* Own summary is painted from live state immediately, even during DB round-trip. */
  if(typeof v072RenderOwnProfile==='function'){
    const baseOwn=v072RenderOwnProfile;
    v072RenderOwnProfile=function(){
      const r=baseOwn.apply(this,arguments);
      const root=document.querySelector('#v072OwnProfile');
      if(root){
        const cp=[...root.querySelectorAll('.v072-profile-stat')].find(x=>/Kampfkraft/i.test(x.textContent||''));
        if(cp){const b=cp.querySelector('b');if(b)b.textContent=String(livePower())}
        const wb=worldBoss(),line=root.querySelector('.v116-wb-inline');
        if(line)line.textContent=`🔷 Mystisch: ${Math.max(0,Number(wb.attempts)||0)} Versuche · ${Math.max(0,Number(wb.wins)||0)} Siege`;
      }
      return r;
    };
  }

  function stamp(){}

  /* Repair the currently logged-in stale profile on boot. Existing Hall ranking
     already performs a forced profile sync before it fetches the player list. */
  setTimeout(()=>syncHall(true),1500);
  setTimeout(()=>syncHall(true),4300);
  stamp();
})();
