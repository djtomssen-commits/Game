
(()=>{
  'use strict';
  if(window.__VPVP_BUDS_HALL_SYNC_FIX__)return;
  window.__VPVP_BUDS_HALL_SYNC_FIX__=true;

  let writeBusy=false;
  let writeTimer=0;
  let lastJson='';

  function n(v){return Math.max(0,Math.floor(Number(v)||0))}
  function stats(){
    const p=(typeof s!=='undefined'&&s?.v204Pvp&&typeof s.v204Pvp==='object')?s.v204Pvp:{};
    return {
      pvp_buds:n(p.buds),
      pvp_wins:n(p.wins),
      pvp_losses:n(p.losses),
      pvp_fights:n(p.fights)
    };
  }
  function ownId(){
    try{return (!v073User?.is_anonymous&&v073User?.id)?String(v073User.id):''}catch(e){return''}
  }
  async function writeNow(force=false){
    const id=ownId();
    if(!id||writeBusy)return false;
    try{
      if(typeof v073Init==='function')await v073Init();
      if(typeof v073Db==='undefined'||!v073Db)return false;
      const f=stats();
      const json=JSON.stringify(f);
      if(!force&&json===lastJson)return true;
      writeBusy=true;
      const {error}=await window.v7101ProfileUpdate({...f,updated_at:new Date().toISOString()}).eq('id',id);
      if(error)throw error;
      lastJson=json;
      return true;
    }catch(e){
      console.warn('PvP Buds Hall mirror sync',e);
      return false;
    }finally{writeBusy=false}
  }
  function schedule(force=false){
    clearTimeout(writeTimer);
    writeTimer=setTimeout(()=>void writeNow(force),force?0:180);
  }

  /* A public profile response may be slightly older than the just-confirmed PvP RPC.
     PvP totals are cumulative, so never allow a stale row to decrease them locally. */
  try{
    if(typeof v204SyncLocalStatsFromProfile==='function'){
      v204SyncLocalStatsFromProfile=function(row){
        if(!row)return;
        s.v204Pvp??={buds:0,wins:0,losses:0,fights:0,lastOpponent:null};
        s.v204Pvp.buds=Math.max(n(s.v204Pvp.buds),n(row.pvp_buds));
        s.v204Pvp.wins=Math.max(n(s.v204Pvp.wins),n(row.pvp_wins));
        s.v204Pvp.losses=Math.max(n(s.v204Pvp.losses),n(row.pvp_losses));
        s.v204Pvp.fights=Math.max(n(s.v204Pvp.fights),n(row.pvp_fights),n(s.v204Pvp.wins)+n(s.v204Pvp.losses));
        schedule(true);
      };
      try{window.v204SyncLocalStatsFromProfile=v204SyncLocalStatsFromProfile}catch(e){}
    }
  }catch(e){console.warn('PvP monotonic stats install',e)}

  /* Keep every normal public-profile payload aligned with the authoritative local PvP state. */
  try{
    if(typeof v073ProfilePayload==='function'&&!window.__vPvpBudsPayloadWrapped){
      const base=v073ProfilePayload;
      v073ProfilePayload=function(){
        const p=base.apply(this,arguments)||{};
        Object.assign(p,stats());
        return p;
      };
      try{window.v073ProfilePayload=v073ProfilePayload}catch(e){}
      window.__vPvpBudsPayloadWrapped=true;
    }
  }catch(e){console.warn('PvP payload mirror install',e)}

  /* Even when an older profile-sync guard skips the general mirror, PvP totals are safe
     to update independently because only the authenticated user's own row is touched. */
  try{
    if(typeof v073SyncProfile==='function'&&!window.__vPvpBudsProfileSyncWrapped){
      const base=v073SyncProfile;
      v073SyncProfile=async function(force=false){
        let ok=false;
        try{ok=!!(await base.apply(this,arguments))}catch(e){console.warn('PvP base profile sync',e)}
        const pvpOk=await writeNow(!!force);
        return ok||pvpOk;
      };
      try{window.v073SyncProfile=v073SyncProfile}catch(e){}
      window.__vPvpBudsProfileSyncWrapped=true;
    }
  }catch(e){console.warn('PvP profile sync wrapper install',e)}

  /* Before Hall data is fetched, flush the viewing player's own PvP mirror. Other rows
     come directly from their server profile and are therefore the latest committed values. */
  try{
    if(typeof v073LoadRanking==='function'&&!window.__vPvpBudsHallRankingWrapped){
      const base=v073LoadRanking;
      v073LoadRanking=async function(){
        await writeNow(true);
        return base.apply(this,arguments);
      };
      try{window.v073LoadRanking=v073LoadRanking}catch(e){}
      window.__vPvpBudsHallRankingWrapped=true;
    }
  }catch(e){console.warn('PvP Hall ranking wrapper install',e)}

  window.vPvpBudsHallSync=writeNow;
  window.vPvpBudsHallDiagnostics=()=>({local:stats(),lastMirrored:lastJson,ownId:ownId(),busy:writeBusy});
  window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>schedule(true),250));
})();
