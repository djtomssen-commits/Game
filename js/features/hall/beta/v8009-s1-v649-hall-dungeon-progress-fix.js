(()=>{
  'use strict';
  if(window.__V649_HALL_DUNGEON_PROGRESS_FIX__) return;
  window.__V649_HALL_DUNGEON_PROGRESS_FIX__=true;

  let busy=false, timer=0, lastJson='';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ints=a=>[...new Set((Array.isArray(a)?a:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<20))].sort((a,b)=>a-b);
  const clampD=v=>Math.max(0,Math.min(19,Math.floor(Number(v)||0)));
  const clampR=v=>Math.max(0,Math.min(9,Math.floor(Number(v)||0)));

  function uid(){
    try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return ''}
  }
  function accountReady(id=uid()){
    if(!id || window.__V200_AUTH_READY__!==true) return false;
    try{if(typeof window.v452AccountVerified==='function' && !window.v452AccountVerified(id)) return false}catch(e){return false}
    try{if(String(s?.__accountOwnerId||'') && String(s.__accountOwnerId)!==id) return false}catch(e){}
    return true;
  }
  function fallbackDp(){
    const d=(s?.dungeon&&typeof s.dungeon==='object')?s.dungeon:{};
    const completed=ints(d.completed), progress={...(d.progress||{})};
    const selected=clampD(d.selected||0);
    const unlocked=ints(d.unlocked);
    if(!unlocked.includes(0))unlocked.unshift(0);
    completed.forEach(i=>{if(!unlocked.includes(i))unlocked.push(i)});
    unlocked.sort((a,b)=>a-b);
    const room=clampR(progress[selected]??d.room);
    let last=Number(d.lastActive);
    if(!Number.isInteger(last)||last<0||last>=20){
      const started=Object.entries(progress).map(([k,v])=>[Number(k),clampR(v)])
        .filter(([i,r])=>Number.isInteger(i)&&i>=0&&i<20&&!completed.includes(i)&&r>0)
        .sort((a,b)=>b[0]-a[0]||b[1]-a[1]);
      last=started.length?started[0][0]:(completed.length?Math.max(...completed):selected);
    }
    return {completed,progress,selected,room,lastActive:clampD(last),unlocked};
  }
  function liveDp(){
    try{
      const fn=window.v4130LiveDungeonProgress||window.v4124LiveDungeonProgress;
      const x=typeof fn==='function'?fn():fallbackDp();
      if(!x||typeof x!=='object')return fallbackDp();
      return {
        completed:ints(x.completed),
        progress:{...(x.progress||{})},
        selected:clampD(x.selected||0),
        room:clampR(x.room),
        lastActive:clampD(x.lastActive),
        unlocked:ints(x.unlocked)
      };
    }catch(e){return fallbackDp()}
  }
  function petStats(){
    /* V6.201: dungeon_progress is a shared public-profile JSON column. The old
       dungeon mirror rebuilt that object from dungeon-only fields and therefore
       erased pet_stats written by the Pet album profile payload immediately
       afterwards. Derive the compact public Pet counters directly from the
       authoritative local collection so every dungeon mirror write preserves them. */
    const found=(s?.v686PetAlbum?.found&&typeof s.v686PetAlbum.found==='object')?s.v686PetAlbum.found:{};
    const qualities=['normal','green','blue','purple','orange','cyan'];
    const legendary=['normal','green','blue','purple','orange'];
    let rows=0,foundCount=0,unique=0,mythic=0;
    for(const row of Object.values(found)){
      if(!row||typeof row!=='object')continue;
      let any=false;
      for(const q of qualities){if(row[q]){foundCount++;any=true}}
      if(any)unique++;
      if(legendary.every(q=>!!row[q]))rows++;
      if(qualities.every(q=>!!row[q]))mythic++;
    }
    return {
      rows:Math.max(0,Math.min(20,rows)),
      found:Math.max(0,Math.min(120,foundCount)),
      unique:Math.max(0,Math.min(20,unique)),
      mythic:Math.max(0,Math.min(20,mythic)),
      total_rows:20,
      total_slots:120
    };
  }
  function fields(){
    const dp=liveDp();
    return {
      dungeons:dp.completed.length,
      dungeon_progress:{
        completed:dp.completed,
        progress:dp.progress,
        selected:dp.selected,
        room:dp.room,
        lastActive:dp.lastActive,
        unlocked:dp.unlocked,
        pet_stats:petStats(),
        public_title:(()=>{const t=s?.v6338Titles||{};return{id:String(t.activeId||''),label:String(t.activeLabel||''),source:String(t.activeSource||'')}})(),
        tower:(()=>{const t=s?.tower,z=t?.season,r=t?.run;if(!z)return null;return{season:String(z.id||''),best_floor:Math.max(0,Number(z.bestFloor)||0),best_score:Math.max(0,Number(z.bestScore)||0),active_floor:r?.active?Math.max(1,Number(r.floor)||1):0,active_score:r?.active?Math.max(0,Number(r.score)||0):0,boss_kills:Math.max(0,Number(z.bossKills)||0),elite_kills:Math.max(0,Number(z.eliteKills)||0)}})()
      },
      updated_at:new Date().toISOString()
    };
  }
  function position(dp){
    try{
      const fn=window.v4130CanonicalDungeonPosition||window.v4124CanonicalDungeonPosition;
      if(typeof fn==='function')return fn(dp,dp.completed.length);
    }catch(e){}
    const i=clampD(dp.lastActive??dp.selected), r=clampR(dp.progress?.[i]??(dp.selected===i?dp.room:0));
    return {dungeonIndex:i,dungeonNumber:i+1,enemyNumber:r+1,completed:dp.completed.includes(i)};
  }
  function paintOwnRow(){
    const id=uid(); if(!id)return;
    const row=[...document.querySelectorAll('#v072HallRanking .v072-player-row[data-profile-id]')]
      .find(x=>String(x.getAttribute('data-profile-id')||'')===id);
    if(!row)return;
    const dp=liveDp(), pos=position(dp);
    const lines=row.querySelectorAll('.v4124-social-line');
    if(lines.length<2)return;
    let name=`Dungeon ${pos.dungeonNumber}`;
    try{name=dungeons?.[pos.dungeonIndex]?.name||name}catch(e){}
    const boss=pos.enemyNumber>=10;
    lines[1].innerHTML=`🗺️ Dungeon <strong>${pos.dungeonNumber}</strong> · ${esc(name)} · ${boss?'👑 Boss':'👹 Gegner'} <strong>${pos.enemyNumber}/10</strong>${pos.completed?' · <span class="good">abgeschlossen</span>':''} · 🏁 Gesamt <strong>${dp.completed.length}</strong>`;
  }

  async function write(force=false){
    const id=uid();
    if(!accountReady(id))return false;
    if(busy)return true;
    try{
      if(typeof v073Init==='function')await v073Init();
      if(typeof v073Db==='undefined'||!v073Db||typeof v073User==='undefined'||!v073User||v073User.is_anonymous)return false;
      const f=fields();
      const json=JSON.stringify({dungeons:f.dungeons,dungeon_progress:f.dungeon_progress});
      if(!force && json===lastJson){paintOwnRow();return true}
      busy=true;
      const {error}=await window.v7101ProfileUpdate(f).eq('id',id);
      if(error)throw error;
      lastJson=json;
      paintOwnRow();
      return true;
    }catch(e){
      console.warn('V6.49 dungeon progress mirror',e);
      return false;
    }finally{busy=false}
  }
  function schedule(force=false){
    clearTimeout(timer);
    timer=setTimeout(()=>{void write(force)},force?0:450);
  }
  window.v649SyncDungeonProgress=write;

  /* Existing-profile profile sync historically omitted dungeon_progress from its UPDATE.
     Keep the public profile mirror in step with the authoritative account save. */
  try{
    if(typeof v073SyncProfile==='function'&&!window.__v649ProfileSyncWrapped){
      const base=v073SyncProfile;
      v073SyncProfile=async function(force=false){
        let ok=false;
        try{ok=!!(await base.apply(this,arguments))}catch(e){console.warn('V6.49 base profile sync',e)}
        const dpOk=await write(!!force);
        return ok||dpOk;
      };
      try{window.v073SyncProfile=v073SyncProfile}catch(e){}
      window.__v649ProfileSyncWrapped=true;
    }
  }catch(e){}

  try{
    if(typeof v073LoadRanking==='function'&&!window.__v649RankingWrapped){
      const base=v073LoadRanking;
      v073LoadRanking=async function(){
        await write(true);
        const r=await base.apply(this,arguments);
        paintOwnRow();
        requestAnimationFrame(paintOwnRow);
        setTimeout(paintOwnRow,80);
        return r;
      };
      try{window.v073LoadRanking=v073LoadRanking}catch(e){}
      window.__v649RankingWrapped=true;
    }
  }catch(e){}

  try{
    if(typeof persist==='function'&&!window.__v649PersistWrapped){
      const base=persist;
      persist=function(){const r=base.apply(this,arguments);schedule(false);return r};
      try{window.persist=persist}catch(e){}
      window.__v649PersistWrapped=true;
    }
  }catch(e){}

  document.addEventListener('click',e=>{
    if(e.target.closest?.('[data-screen="hall"],[data-go="hall"]'))setTimeout(()=>{schedule(true);paintOwnRow()},0);
  },true);
  window.addEventListener('growlegends:first-playable',()=>setTimeout(()=>schedule(true),1600),{passive:true});
  setTimeout(()=>{if(!window.v7206StartupBusy?.())schedule(false)},3200);
  setTimeout(()=>{paintOwnRow();if(!window.v7206StartupBusy?.())schedule(false)},5200);
})();
