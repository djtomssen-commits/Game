
/* ===== V4.02 PvP state hardening ===== */

function v207EnsurePvpState(){
  if(!s.v204Pvp || typeof s.v204Pvp!=='object'){
    s.v204Pvp={
      buds:0,
      wins:0,
      losses:0,
      fights:0,
      lastOpponent:null,
      lastBudReward:0
    };
  }

  if(!Number.isFinite(Number(s.v204Pvp.buds)))s.v204Pvp.buds=0;
  if(!Number.isFinite(Number(s.v204Pvp.wins)))s.v204Pvp.wins=0;
  if(!Number.isFinite(Number(s.v204Pvp.losses)))s.v204Pvp.losses=0;
  if(!Number.isFinite(Number(s.v204Pvp.fights)))s.v204Pvp.fights=0;
  if(!('lastOpponent' in s.v204Pvp))s.v204Pvp.lastOpponent=null;
  if(!Number.isFinite(Number(s.v204Pvp.lastBudReward)))s.v204Pvp.lastBudReward=0;

  return s.v204Pvp;
}

/* Stats sync must always recreate the local PvP state after cloud loads. */
const v207BaseSyncStats=v204SyncLocalStatsFromProfile;
v204SyncLocalStatsFromProfile=function(row){
  v207EnsurePvpState();
  return v207BaseSyncStats(row);
};

/* Final matchmaking wrapper: ensure state before and after RPC path. */
const v207BaseFindOpponent=v204FindOpponent;
v204FindOpponent=async function(){
  v207EnsurePvpState();

  try{
    return await v207BaseFindOpponent();
  }finally{
    v207EnsurePvpState();
  }
};

/*
  Patch the exact assignment failure path from V4.02.
  The base function may assign lastOpponent after receiving a match.
  A fresh/cloud-replaced state can make v204Pvp undefined between awaits,
  so we protect the property globally with an accessor.
*/
let v207PvpBacking=v207EnsurePvpState();

try{
  Object.defineProperty(s,'v204Pvp',{
    configurable:true,
    enumerable:true,
    get(){
      if(!v207PvpBacking || typeof v207PvpBacking!=='object'){
        v207PvpBacking={
          buds:0,wins:0,losses:0,fights:0,lastOpponent:null,lastBudReward:0
        };
      }
      return v207PvpBacking;
    },
    set(value){
      if(value && typeof value==='object'){
        v207PvpBacking=value;
      }else{
        v207PvpBacking={
          buds:0,wins:0,losses:0,fights:0,lastOpponent:null,lastBudReward:0
        };
      }
    }
  });
}catch(e){
  console.warn('V4.02 PvP accessor',e);
  v207EnsurePvpState();
}

/* Re-ensure after cloud state application. */
const v207BaseApplyCloud=v075ApplyCloudSave;
v075ApplyCloudSave=async function(data){
  const result=await v207BaseApplyCloud(data);
  v207EnsurePvpState();
  return result;
};

/* Re-ensure before local/cloud save. */
const v207BaseWriteCloud=v075WriteCloudSave;
v075WriteCloudSave=async function(force=false){
  v207EnsurePvpState();
  return await v207BaseWriteCloud(force);
};

/* Re-ensure before PvP page refresh/render/fight. */
const v207BaseRefreshStats=v204RefreshStats;
v204RefreshStats=async function(){
  v207EnsurePvpState();
  return await v207BaseRefreshStats();
};

const v207BaseRenderPage=v204RenderPage;
v204RenderPage=function(){
  v207EnsurePvpState();
  return v207BaseRenderPage();
};

const v207BaseFight=v204Fight;
v204Fight=async function(){
  v207EnsurePvpState();
  return await v207BaseFight();
};

/* Make sure dynamic buttons use the final wrapped functions. */
const v207BaseRenderOpponent=v204RenderOpponent;
v204RenderOpponent=function(){
  v207EnsurePvpState();
  const r=v207BaseRenderOpponent();

  const fight=document.querySelector('#v204FightBtn');
  if(fight)fight.onclick=v204Fight;

  const find=document.querySelector('#v204FindBtn');
  if(find)find.onclick=v204FindOpponent;

  return r;
};

/* On every game render, repair legacy/cloud states once. */
const v207BaseRender=render;
render=function(){
  return v207BaseRender();
};

v207EnsurePvpState();
