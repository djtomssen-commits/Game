/* === v440-quest-guild-xp-final-owner === */
(function(){
  const VERSION='V4.40 Stable', SHORT='V4.40';
  const IS_BETA=String(window.GROW_RELEASE_CHANNEL||'stable')==='beta';
  let suppressLegacyQuestRpc=false;

  function toast(title,type,detail){
    try{if(typeof v063Toast==='function')v063Toast(title,type,detail)}catch(e){}
  }
  function stamp(){}

  /* The historical claimQuest guild hook may fire inside v233ClaimQuest. Suppress only
     that legacy quest RPC while the canonical click owner is running, then issue exactly
     one server award after the quest has demonstrably disappeared from s.quests.active. */
  function installQuestRpcGuard(){
    try{
      if(typeof v073Db==='undefined'||!v073Db||typeof v073Db.rpc!=='function')return false;
      if(v073Db.__v440QuestGuildXpGuard)return true;
      const baseRpc=v073Db.rpc.bind(v073Db);
      v073Db.rpc=function(fn,args,opts){
        if(
          suppressLegacyQuestRpc &&
          String(fn)==='v411_add_guild_activity' &&
          String(args?.p_kind||'')==='quest'
        ){
          const gx=(typeof v254Guild!=='undefined'&&v254Guild)?Math.max(0,Number(v254Guild.guild_xp)||0):0;
          return Promise.resolve({data:[{awarded:0,guild_xp:gx,daily_total:0}],error:null,status:200});
        }
        return baseRpc(fn,args,opts);
      };
      try{Object.defineProperty(v073Db,'__v440QuestGuildXpGuard',{value:true,configurable:true})}
      catch(e){v073Db.__v440QuestGuildXpGuard=true}
      return true;
    }catch(e){console.warn('V4.40 quest guild XP guard',e);return false}
  }

  async function awardQuestGuildXp(){
    try{
      /* Questing can happen before any online/guild screen has initialized Supabase. */
      if(typeof v073Init==='function')await v073Init();
      installQuestRpcGuard();

      if(typeof v073Db==='undefined'||!v073Db||typeof v073User==='undefined'||!v073User||v073User.is_anonymous){
        toast('Gilden-EP nicht vergeben','warn','Für Gilden-EP muss dein Spieler-Account verbunden sein.');
        return;
      }

      const {data:mem,error:memError}=await v073Db
        .from('guild_members')
        .select('guild_id,role,attack_signed,defense_signed,boss_signed,joined_at')
        .eq('user_id',v073User.id)
        .maybeSingle();
      if(memError)throw memError;
      if(!mem)return; // Player is simply not in a guild.
      try{v254Membership=mem}catch(e){}

      const bridgeActive=!!v073Db.__v439GuildXpBridge;
      const {data,error}=await v073Db.rpc('v411_add_guild_activity',{p_kind:'quest'});
      if(error)throw error;
      const row=Array.isArray(data)?data[0]:data;
      if(!row)return;

      const awarded=Math.max(0,Math.floor(Number(row.awarded)||0));
      const gx=Math.max(0,Math.floor(Number(row.guild_xp)||0));
      if(typeof v254Guild!=='undefined'&&v254Guild){
        v254Guild.guild_xp=gx;
      }

      if(awarded>0){
        /* V4.39 bridge already paints/toasts when present. Keep a fallback for fresh DB objects. */
        if(!bridgeActive)toast('🏰 Gilden-EP','success',`Quest: +${awarded} Gilden-EP`);
        try{
          if(document.querySelector('#guild')?.classList.contains('active')&&typeof v254LoadGuild==='function'){
            await v254LoadGuild();
          }
        }catch(e){}
      }else{
        toast('Gilden-EP','info','Für diese Quest wurden 0 Gilden-EP vergeben. Das gemeinsame Tageslimit von 625 Gilden-EP kann erreicht sein oder es besteht keine aktive Gildenmitgliedschaft.');
      }
    }catch(e){
      const raw=String(e?.message||e?.details||e?.hint||e||'Unbekannter Fehler');
      console.error('V4.40 Quest -> Gilden-EP',e);
      toast(
        'Gilden-EP Serverfehler',
        'warn',
        /v411_add_guild_activity|does not exist|schema cache|function/i.test(raw)
          ?'Die Gilden-EP-SQL aus V4.39 ist in Supabase noch nicht aktiv.'
          :raw
      );
    }
  }
  window.v440AwardQuestGuildXp=awardQuestGuildXp;

  /* V8.009 Quest consolidation:
     Beta uses v6140 as the single Quest completion event source and v474/v7045
     for Guild-XP/server side effects. Keep the historical V4.40 owner only for
     Stable/legacy builds so Beta does not add another claim wrapper/RPC guard. */
  if(IS_BETA){
    window.__V8009_QUEST_V440_RETIRED__=true;
    return;
  }

  /* This is the actual final reward-button owner in the current quest system. */
  if(typeof v233ClaimQuest==='function'&&!window.__v440QuestClaimWrapped){
    const baseClaim=v233ClaimQuest;
    v233ClaimQuest=function(){
      const q=s.quests?.active;
      const ready=!!q&&Date.now()>=Number(q.ends||0);
      let result,thrown=null;
      if(ready)suppressLegacyQuestRpc=true;
      try{result=baseClaim.apply(this,arguments)}catch(e){thrown=e}
      finally{suppressLegacyQuestRpc=false}

      /* Reward success is authoritative only when the exact active quest is gone. */
      const paid=ready&&!!q&&(!s.quests?.active||s.quests.active!==q);
      if(paid)setTimeout(()=>{void awardQuestGuildXp()},0);
      if(thrown)throw thrown;
      return result;
    };
    try{window.v233ClaimQuest=v233ClaimQuest}catch(e){}
    window.__v440QuestClaimWrapped=true;
  }

  /* Fallback only for builds without the v233 click owner. */
  else if(typeof claimQuest==='function'&&!window.__v440QuestFallbackWrapped){
    const baseClaim=claimQuest;
    claimQuest=function(){
      const q=s.quests?.active,ready=!!q&&Date.now()>=Number(q.ends||0);
      suppressLegacyQuestRpc=ready;
      let result,thrown=null;
      try{result=baseClaim.apply(this,arguments)}catch(e){thrown=e}
      finally{suppressLegacyQuestRpc=false}
      if(ready&&q&&(!s.quests?.active||s.quests.active!==q))setTimeout(()=>{void awardQuestGuildXp()},0);
      if(thrown)throw thrown;
      return result;
    };
    try{window.claimQuest=claimQuest}catch(e){}
    window.__v440QuestFallbackWrapped=true;
  }

  installQuestRpcGuard();
  if(typeof v073Init==='function'&&!window.__v440InitWrapped){
    const baseInit=v073Init;
    v073Init=async function(){
      const r=await baseInit.apply(this,arguments);
      installQuestRpcGuard();
      return r;
    };
    try{window.v073Init=v073Init}catch(e){}
    window.__v440InitWrapped=true;
  }

  stamp();
  document.addEventListener('DOMContentLoaded',()=>{installQuestRpcGuard();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{installQuestRpcGuard();stamp()},{passive:true});
  setTimeout(()=>{installQuestRpcGuard();stamp()},1000);
})();

