
/* ===== V4.02 PvP finish flow =====
   Result/loot must never wait for cloud/profile/cooldown requests.
*/

let v216PvpFinishBusy=false;

async function v216BackgroundPvpSave(){
  try{await v075WriteCloudSave(true)}catch(e){console.warn('V4.02 PvP cloud save',e)}
  try{await v073SyncProfile(true)}catch(e){console.warn('V4.02 PvP profile sync',e)}
  try{v204CooldownLeft=await v204LoadCooldown()}catch(e){console.warn('V4.02 PvP cooldown refresh',e)}
}

v209FinishBattle=async function(win,enemy,gold,xp){
  if(v216PvpFinishBusy)return;
  v216PvpFinishBusy=true;

  v207EnsurePvpState();

  let buds=0;
  let rewardGold=Number(gold)||0;
  let rewardXp=Number(xp)||0;

  try{
    /* Only PvP-stat commit is awaited before showing the reward. */
    try{
      const {data,error}=await v073Db.rpc(
        'v205_finish_pvp',
        {p_target_user:enemy.id,p_won:!!win}
      );

      if(error)throw error;

      const row=Array.isArray(data)?data[0]:data;
      if(row){
        v204SyncLocalStatsFromProfile(row);
        buds=Number(row.buds_awarded)||0;
        s.v204Pvp.lastBudReward=buds;
      }
    }catch(e){
      console.error('V4.02 finish PvP RPC',e);
      buds=0;
      v063Toast(
        'PvP-Statistik konnte nicht vollständig gespeichert werden',
        'error',
        e?.message||''
      );
    }

    if(win){
      s.gold=(Number(s.gold)||0)+rewardGold;
      try{addXp(rewardXp)}
      catch(e){s.xp=(Number(s.xp)||0)+rewardXp}
    }else{
      rewardGold=Math.round(rewardGold*.35);
      rewardXp=Math.round(rewardXp*.45);
      s.gold=(Number(s.gold)||0)+rewardGold;
      try{addXp(rewardXp)}
      catch(e){s.xp=(Number(s.xp)||0)+rewardXp}
      buds=0;
    }

    s.v106Achievements??={done:{},stats:{}};
    s.v106Achievements.stats??={};
    s.v106Achievements.stats.pvpFights=
      (Number(s.v106Achievements.stats.pvpFights)||0)+1;

    if(win){
      s.v106Achievements.stats.pvpWins=
        (Number(s.v106Achievements.stats.pvpWins)||0)+1;
    }

    try{v106CheckAchievements(false)}catch(e){}

    /* Account-scoped local checkpoint immediately. */
    try{persist(false)}catch(e){}

    /*
      CRITICAL:
      Show the green/red result and loot immediately.
      Nothing after this point may block the popup.
    */
    v204BattleBusy=false;

    v211ShowResult(
      !!win,
      enemy,
      rewardGold,
      rewardXp,
      buds
    );

    /* Cloud/profile/cooldown update asynchronously after popup is visible. */
    void v216BackgroundPvpSave();

  }catch(e){
    console.error('V4.02 PvP finish flow',e);
    v204BattleBusy=false;

    try{
      v211ShowResult(
        !!win,
        enemy||{character_name:'Gegner'},
        rewardGold,
        rewardXp,
        buds
      );
    }catch(uiError){
      console.error('V4.02 result fallback UI',uiError);

      document.querySelector('#v209PvpBattleOverlay')?.classList.remove('show');

      v063Toast(
        win?'🏆 PvP-Sieg':'💀 PvP-Niederlage',
        win?'success':'error',
        `+${rewardGold} Gold · +${rewardXp} EXP · ${win?`+${buds} PvP-Buds`:'0 PvP-Buds verloren'}`
      );

      setTimeout(()=>{
        v216PvpFinishBusy=false;
        try{v032Go('pvp')}catch(e){}
      },900);
    }
  }
};

function v216BindResultConfirm(){
  /*
    IMPORTANT:
    Do NOT call v211EnsureResultUi() from here.
    V4.02 previously created an endless microtask loop:
    bind -> ensure -> microtask bind -> ensure -> ...
  */

  const btn=document.querySelector('#v211PvpResultConfirm');
  if(!btn || btn.dataset.v216Bound==='1')return;

  btn.dataset.v216Bound='1';

  btn.onclick=()=>{
    if(!v211ResultOpen)return;

    v211ResultOpen=false;
    v216PvpFinishBusy=false;

    document.querySelector('#v211PvpResultOverlay')?.classList.remove('show');
    document.querySelector('#v209PvpBattleOverlay')?.classList.remove('show');

    v204Opponent=null;
    v204BattleBusy=false;

    try{v032Go('pvp')}catch(e){}
    window.scrollTo({top:0,behavior:'auto'});

    void (async()=>{
      try{
        v204CooldownLeft=await v204LoadCooldown();
        v204RenderPage();
      }catch(e){
        console.warn('V4.02 PvP return cooldown',e);
      }

      try{
        await v204RefreshStats();
      }catch(e){
        console.warn('V4.02 PvP return stats',e);
      }
    })();
  };
}

/*
  Keep original V4.02 UI creator untouched.
  Bind only after the result UI already exists.
*/
const v218BaseShowResult=v211ShowResult;
v211ShowResult=function(win,enemy,gold,xp,buds){
  const r=v218BaseShowResult(win,enemy,gold,xp,buds);
  v216BindResultConfirm();
  return r;
};

setTimeout(()=>{
  try{
    v211EnsureResultUi();
    v216BindResultConfirm();
  }catch(e){
    console.warn('V4.02 result init',e);
  }
},180);
