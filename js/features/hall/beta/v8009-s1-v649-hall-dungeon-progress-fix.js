(()=>{
  'use strict';
  if(window.__V649_HALL_DUNGEON_PROGRESS_FIX__) return;
  window.__V649_HALL_DUNGEON_PROGRESS_FIX__=true;

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
  /* V8.009: old standalone public-profile field builder retired.
     Canonical v073ProfilePayload wrappers + v7101 own the server mirror. */
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
    if(!accountReady())return false;
    try{window.v7101SchedulePublicProfileSync?.(!!force)}catch(_){}
    paintOwnRow();
    return true;
  }
  function schedule(force=false){queueMicrotask(()=>void write(force))}
  window.v649SyncDungeonProgress=write;

  /* V8.009: dedicated v073SyncProfile wrapper retired; v7101-final owns syncing. */

  /* V8.009: ranking wrapper retired.
     v6145 syncOwn() calls v649SyncDungeonProgress(true) before Hall ranking loads. */


  try{
    if(typeof persist==='function'&&!window.__v649PersistWrapped){
      const base=persist;
      persist=function(){const r=base.apply(this,arguments);schedule(false);return r};
      try{window.persist=persist}catch(e){}
      window.__v649PersistWrapped=true;
    }
  }catch(e){}

  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')==='hall')queueMicrotask(()=>{void write(true);paintOwnRow()});
  },{passive:true});
  window.addEventListener('growlegends:account-ready',()=>queueMicrotask(()=>schedule(true)),{passive:true});
})();
