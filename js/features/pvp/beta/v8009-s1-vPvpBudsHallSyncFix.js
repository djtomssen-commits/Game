
(()=>{
  'use strict';
  if(window.__VPVP_BUDS_HALL_SYNC_FIX__)return;
  window.__VPVP_BUDS_HALL_SYNC_FIX__=true;

  function n(v){return Math.max(0,Math.floor(Number(v)||0))}
  function stats(){
    const p=(typeof s!=='undefined'&&s?.v204Pvp&&typeof s.v204Pvp==='object')?s.v204Pvp:{};
    return {pvp_buds:n(p.buds),pvp_wins:n(p.wins),pvp_losses:n(p.losses),pvp_fights:n(p.fights)};
  }
  function schedule(force=false){
    try{window.v7101SchedulePublicProfileSync?.(!!force);return true}catch(_){return false}
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

  /* V8.009: dedicated v073SyncProfile wrapper retired.
     v7101-final is the sole public-profile writer. */

  /* V8.009 PvP Sprint 1: ranking wrapper retired.
     v6145 calls vPvpBudsHallSync(true) directly inside syncOwn() before/while
     Hall data refreshes. Payload + profile-sync ownership remains unchanged. */

  window.vPvpBudsHallSync=(force=false)=>{schedule(force);return Promise.resolve(true)};
  window.vPvpBudsHallDiagnostics=()=>({local:stats(),canonicalWriter:'v7101'});
  window.addEventListener('growlegends:account-ready',()=>queueMicrotask(()=>schedule(true)),{passive:true});
})();
