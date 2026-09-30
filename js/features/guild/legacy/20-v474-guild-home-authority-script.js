/* === v474-guild-home-authority-script === */
(function(){
  const VERSION='V4.74',SHORT='V4.74';
  const IS_BETA=String(window.GROW_RELEASE_CHANNEL||'stable')==='beta';
  const questAwards=new Set();
  const pvpAwards=new Set();
  let headerObserver=null;

  function stamp(){}

  function markModernHomeReady(force=false){
    /* V8.009 HOME-9: beta has a canonical V366 Startseite owner. The old
       V4.74 guild bridge must no longer hide/show #world children or restyle
       the modern home during startup/navigation. Stable keeps legacy behavior. */
    if(IS_BETA)return false;
    try{
      const world=document.querySelector('#world');
      if(!world)return false;
      if(!world.classList.contains('active')&&!force)return false;

      let modern=world.querySelector(':scope > .v366-world')||world.querySelector('.v366-world');
      if(!modern)return false;
      if(modern.parentElement!==world)world.insertBefore(modern,world.firstChild);

      [...world.children].forEach(el=>{if(el!==modern)el.style.setProperty('display','none','important')});
      modern.style.setProperty('display','grid','important');
      modern.style.setProperty('visibility','visible','important');
      modern.style.setProperty('opacity','1','important');
      world.classList.add('v474-home-ready');
      return true;
    }catch(e){return false}
  }

  function installGuildRpcGuard(){
    try{
      if(typeof v073Db==='undefined'||!v073Db||typeof v073Db.rpc!=='function')return false;
      if(v073Db.__v474GuildRpcGuard)return true;

      const raw=v073Db.rpc.bind(v073Db);
      try{Object.defineProperty(v073Db,'__v474GuildRawRpc',{value:raw,configurable:true})}
      catch(e){v073Db.__v474GuildRawRpc=raw}

      v073Db.rpc=function(fn,args,opts){
        const kind=String(args?.p_kind||'');
        if(
          String(fn)==='v411_add_guild_activity' &&
          (kind==='quest'||kind==='pvp_win')
        ){
          return Promise.resolve({data:null,error:null,status:200});
        }
        return raw(fn,args,opts);
      };
      try{Object.defineProperty(v073Db,'__v474GuildRpcGuard',{value:true,configurable:true})}
      catch(e){v073Db.__v474GuildRpcGuard=true}
      return true;
    }catch(e){
      console.warn('V4.74 guild RPC guard',e);
      return false;
    }
  }

  async function currentUser(){
    try{if(typeof v073Init==='function')await v073Init()}catch(e){}
    installGuildRpcGuard();
    try{
      if(typeof v073User!=='undefined'&&v073User?.id&&!v073User.is_anonymous)return v073User;
    }catch(e){}
    try{
      if(typeof v073Db!=='undefined'&&v073Db?.auth?.getUser){
        const r=await v073Db.auth.getUser();
        const u=r?.data?.user||null;
        if(u?.id&&!u.is_anonymous)return u;
      }
    }catch(e){}
    return null;
  }

  function paintGuildActivity(kind,awarded,dailyTotal){
    try{
      const label=kind==='quest'?'Quest':'PvP-Sieg';
      if(awarded>0){
        if(typeof v063Toast==='function'){
          const extra=Number.isFinite(dailyTotal)?` · heute ${dailyTotal}`:'';
          v063Toast('🏰 Gilden-EP','success',`${label}: +${awarded} Gilden-EP${extra}`);
        }
      }else if(typeof v063Toast==='function'){
        v063Toast('🏰 Gilden-EP','info',`${label}: 0 Gilden-EP · Tageslimit 625 erreicht oder keine aktive Gildenmitgliedschaft.`);
      }
    }catch(e){}
  }

  async function awardGuildActivity(kind,token){
    const bucket=kind==='quest'?questAwards:pvpAwards;
    if(token&&bucket.has(token))return null;
    if(token)bucket.add(token);

    try{
      const user=await currentUser();
      if(!user){if(token)bucket.delete(token);return null}
      if(typeof v073Db==='undefined'||!v073Db){if(token)bucket.delete(token);return null}
      installGuildRpcGuard();

      const rpc=typeof v073Db.__v474GuildRawRpc==='function'
        ?v073Db.__v474GuildRawRpc
        :v073Db.rpc.bind(v073Db);
      const bridgeActive=!!v073Db.__v439GuildXpBridge;
      const {data,error}=await rpc('v411_add_guild_activity',{p_kind:kind});
      if(error){
        if(token)bucket.delete(token);
        if(!bridgeActive&&typeof v063Toast==='function'){
          v063Toast('Gilden-EP Serverfehler','warn',String(error.message||'Gilden-EP konnten nicht gebucht werden.'));
        }
        return null;
      }
      const row=Array.isArray(data)?data[0]:data;
      if(!row)return null;
      const awarded=Math.max(0,Math.floor(Number(row.awarded)||0));
      const gx=Math.max(0,Math.floor(Number(row.guild_xp)||0));
      const dailyTotal=Number(row.daily_total);

      try{
        if(typeof v254Guild!=='undefined'&&v254Guild&&Number.isFinite(gx)){
          v254Guild.guild_xp=gx;
          if(document.querySelector('#guild')?.classList.contains('active')&&typeof v254RenderGuild==='function')v254RenderGuild();
        }
      }catch(e){}

      window.__V474_LAST_GUILD_AWARD__={kind,awarded,guild_xp:gx,daily_total:Number.isFinite(dailyTotal)?dailyTotal:null,at:Date.now()};
      if(!bridgeActive)paintGuildActivity(kind,awarded,Number.isFinite(dailyTotal)?dailyTotal:NaN);
      return row;
    }catch(e){
      if(token)bucket.delete(token);
      console.warn('V4.74 '+kind+' -> Gilden-EP',e);
      return null;
    }
  }
  window.v474AwardGuildActivity=awardGuildActivity;

  function questToken(q){
    return 'quest:'+String(q?.id??q?.name??'unknown')+':'+String(Number(q?.ends)||0);
  }
  function queueQuestAward(q){
    if(!q)return;
    const token=questToken(q);
    if(questAwards.has(token))return;
    void awardGuildActivity('quest',token);
  }

  function wrapQuestOwner(name){
    try{
      const fn=(name==='v233ClaimQuest'&&typeof v233ClaimQuest==='function')?v233ClaimQuest:
               (name==='claimQuest'&&typeof claimQuest==='function')?claimQuest:null;
      if(typeof fn!=='function'||fn.__v474QuestGuildOwner)return;
      const wrapped=function(){
        installGuildRpcGuard();
        const q=s.quests?.active;
        const ready=!!q&&Date.now()>=Number(q.ends||0);
        let result;
        const after=value=>{
          if(ready&&q&&(!s.quests?.active||s.quests.active!==q))queueQuestAward(q);
          return value;
        };
        try{result=fn.apply(this,arguments)}catch(err){after();throw err}
        if(result&&typeof result.then==='function')return result.then(after,err=>{after();throw err});
        return after(result);
      };
      wrapped.__v474QuestGuildOwner=true;
      if(name==='v233ClaimQuest'){v233ClaimQuest=wrapped;try{window.v233ClaimQuest=wrapped}catch(e){}}
      else{claimQuest=wrapped;try{window.claimQuest=wrapped}catch(e){}}
    }catch(e){console.warn('V4.74 quest wrap',name,e)}
  }
  if(!window.__V6140_EVENT_BUS__){
  wrapQuestOwner('claimQuest');
  wrapQuestOwner('v233ClaimQuest');

  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('#claimQuest');
    if(!btn)return;
    const q=s.quests?.active;
    if(!q||Date.now()<Number(q.ends||0))return;
    setTimeout(()=>{
      if(!s.quests?.active||s.quests.active!==q)queueQuestAward(q);
    },80);
  },true);

  try{
    if(typeof v209FinishBattle==='function'&&!window.__v474PvpGuildWrapped){
      const base=v209FinishBattle;
      v209FinishBattle=function(win,enemy){
        installGuildRpcGuard();
        const beforeWins=Math.max(0,Number(s.v204Pvp?.wins)||0);
        const beforeFights=Math.max(0,Number(s.v204Pvp?.fights)||0);
        let result;
        const after=value=>{
          const afterWins=Math.max(0,Number(s.v204Pvp?.wins)||0);
          const afterFights=Math.max(0,Number(s.v204Pvp?.fights)||0);
          const confirmed=!!win&&(afterWins>beforeWins||(afterFights>beforeFights&&afterWins>=beforeWins));
          if(confirmed){
            const token='pvp:'+String(afterWins)+':'+String(enemy?.id||'enemy');
            if(!pvpAwards.has(token))void awardGuildActivity('pvp_win',token);
          }
          return value;
        };
        try{result=base.apply(this,arguments)}catch(err){throw err}
        if(result&&typeof result.then==='function')return result.then(after);
        return after(result);
      };
      try{window.v209FinishBattle=v209FinishBattle}catch(e){}
      window.__v474PvpGuildWrapped=true;
    }
  }catch(e){console.warn('V4.74 PvP guild wrap',e)}
  }

  try{
    if(typeof v073Init==='function'&&!window.__v474InitGuildGuardWrapped){
      const baseInit=v073Init;
      v073Init=async function(){
        const r=await baseInit.apply(this,arguments);
        installGuildRpcGuard();
        return r;
      };
      try{window.v073Init=v073Init}catch(e){}
      window.__v474InitGuildGuardWrapped=true;
    }
  }catch(e){}

  if(!IS_BETA&&typeof v032Go==='function'&&!window.__v474HomeGoWrapped){
    const baseGo=v032Go;
    v032Go=function(id){
      const r=baseGo.apply(this,arguments);
      requestAnimationFrame(()=>{
        if(id==='world')markModernHomeReady(true);
        stamp();
      });
      return r;
    };
    try{window.v032Go=v032Go}catch(e){}
    window.__v474HomeGoWrapped=true;
  }

  /* V4.76: visible version is CSS-owned. Do not fight historical writers
     with a MutationObserver on the whole header. */
  /* V4.77: no header MutationObserver; visible version is CSS-owned. */


  installGuildRpcGuard();
  if(!IS_BETA)markModernHomeReady(true);
  stamp();
  document.addEventListener('DOMContentLoaded',()=>{installGuildRpcGuard();if(!IS_BETA)markModernHomeReady(true);stamp()},{once:true});
  window.addEventListener('pageshow',()=>{installGuildRpcGuard();if(!IS_BETA)markModernHomeReady(true);stamp()},{passive:true});
  [180,900,2200].forEach(ms=>setTimeout(()=>{installGuildRpcGuard();if(!IS_BETA)markModernHomeReady();stamp()},ms));
  if(IS_BETA)window.__V8009_HOME9_V474_HOME_RETIRED__=true;
})();

