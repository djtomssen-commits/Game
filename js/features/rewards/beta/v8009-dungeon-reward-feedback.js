(()=>{'use strict';
if(window.__V8009_DUNGEON_REWARD_FEEDBACK__)return;
window.__V8009_DUNGEON_REWARD_FEEDBACK__=true;

const n=v=>Math.max(0,Math.floor(Number(v)||0));
const cache=new Map();

function host(){
  return document.querySelector('#v247DungeonRewardExtra .v7136-reward-list')
    ||document.querySelector('#v247DungeonRewardExtra');
}
function ensureLines(){
  const h=host();if(!h)return {};
  let weekly=h.querySelector('.v7308-weekly-line');
  if(!weekly){
    weekly=document.createElement('div');
    weekly.className='v7308-weekly-line pending';
    h.appendChild(weekly);
  }
  let guild=h.querySelector('.v7165-guild-reward-line')||h.querySelector('.v7308-guild-line');
  if(!guild){
    guild=document.createElement('div');
    guild.className='v7165-guild-reward-line pending';
    h.appendChild(guild);
  }
  return {weekly,guild};
}
function paint(r){
  if(!r?.ok)return false;
  const {weekly,guild}=ensureLines();
  if(weekly){
    const gain=n(r.weekly_awarded),total=n(r.weekly_xp),max=n(r.weekly_max)||1700;
    weekly.className='v7308-weekly-line'+(gain>0?'':' zero');
    weekly.textContent=gain>0
      ?`⭐ +${gain} Wochen-Truhen-EP · Stand ${total.toLocaleString('de-DE')}/${max.toLocaleString('de-DE')}`
      :`⭐ 0 Wochen-Truhen-EP · Stand ${total.toLocaleString('de-DE')}/${max.toLocaleString('de-DE')}`;
  }
  if(guild){
    const gain=n(r.guild_awarded),daily=n(r.guild_daily);
    guild.className='v7165-guild-reward-line'+(gain>0?'':' zero');
    if(gain>0){
      guild.textContent=`🏰 +${gain} Gilden-EP · heute ${daily}/625`;
    }else if(r.guild_reason==='no_guild'){
      guild.textContent='🏰 0 Gilden-EP · keine aktive Gilde';
    }else if(r.guild_reason==='capped'){
      guild.textContent=`🏰 0 Gilden-EP · Aktivitäts-/Tageslimit erreicht · heute ${daily}/625`;
    }else{
      guild.className='v7165-guild-reward-line pending';
      guild.textContent='🏰 Gilden-EP werden geprüft …';
    }
  }
  return true;
}
function repaintCached(runId){
  const r=cache.get(Number(runId));
  if(!r)return;
  [0,260,900,2200].forEach(ms=>setTimeout(()=>paint(r),ms));
}
async function resolve(runId,attempt=0){
  runId=Number(runId)||0;
  if(!runId||typeof v073Db==='undefined'||!v073Db||typeof v073Db.rpc!=='function')return false;
  try{
    const {data,error}=await v073Db.rpc('v8009_dungeon_reward_feedback',{p_run_id:runId});
    if(error)throw error;
    const r=Array.isArray(data)?data[0]:data;
    if(!r?.ok)return false;
    if((!r.weekly_ready||!r.guild_ready)&&attempt<5){
      setTimeout(()=>void resolve(runId,attempt+1),220+(attempt*260));
      return false;
    }
    cache.set(runId,r);
    repaintCached(runId);
    return true;
  }catch(e){
    if(attempt<3)setTimeout(()=>void resolve(runId,attempt+1),450+(attempt*450));
    else console.warn('[V8.009] dungeon reward feedback',e);
    return false;
  }
}
function pickRun(x){return Number(x?.run_id??x?.runId??x?.id)||0}

try{
  const base=window.v7136ShowServerReward;
  if(typeof base==='function'&&!base.__v8009DungeonFeedback){
    const wrapped=function(kind,bundle,ctx={}){
      const out=base.apply(this,arguments);
      if(String(kind||'').toLowerCase()==='dungeon'){
        const id=pickRun(bundle);
        if(id)setTimeout(()=>void resolve(id),25);
      }
      return out;
    };
    wrapped.__v8009DungeonFeedback=true;wrapped.__base=base;
    window.v7136ShowServerReward=wrapped;
  }
}catch(e){console.warn('[V8.009] reward bundle hook',e)}

try{
  const base=window.v247ShowDungeonReward||((typeof v247ShowDungeonReward==='function')?v247ShowDungeonReward:null);
  if(typeof base==='function'&&!base.__v8009DungeonFeedback){
    const wrapped=function(data){
      const out=base.apply(this,arguments);
      const id=pickRun(data);
      if(id)setTimeout(()=>void resolve(id),35);
      return out;
    };
    wrapped.__v8009DungeonFeedback=true;wrapped.__base=base;
    window.v247ShowDungeonReward=wrapped;
    try{v247ShowDungeonReward=wrapped}catch(_){}
  }
}catch(e){console.warn('[V8.009] dungeon modal hook',e)}

window.v8009DungeonRewardFeedbackDiagnostics=()=>({
  version:'V8.009-BETA',
  cachedRuns:[...cache.keys()],
  exactServerFeedback:true
});
})();