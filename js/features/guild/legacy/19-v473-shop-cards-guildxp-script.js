/* === v473-shop-cards-guildxp-script === */
(function(){
  const VERSION='V4.73',SHORT='V4.73';
  const awardedTokens=new Set();

  function stamp(){}

  function decorateShop(){
    const shop=document.querySelector('#shop');
    if(!shop)return;
    shop.classList.add('v473-premium-cards');
  }

  function addGuildRewardLine(awarded,dailyTotal){
    try{
      const extra=document.querySelector('#v247DungeonRewardExtra');
      if(!extra)return;
      extra.querySelectorAll('.v473-guild-xp-line').forEach(x=>x.remove());
      const line=document.createElement('div');
      line.className='v247-dungeon-line v473-guild-xp-line'+(awarded>0?'':' zero');
      line.textContent=awarded>0
        ?`🏰 +${awarded} Gilden-EP${Number.isFinite(dailyTotal)?` · heute ${dailyTotal}`:''}`
        :'🏰 0 Gilden-EP · Tageslimit 625 erreicht oder keine aktive Gilde';
      extra.appendChild(line);
    }catch(e){}
  }

  async function currentUser(){
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

  async function awardDungeonGuildXp(data){
    const di=Number(data?.dungeonIndex),ri=Number(data?.roomIndex);
    if(!Number.isInteger(di)||!Number.isInteger(ri))return;
    const token=`${di}:${ri}`;
    if(awardedTokens.has(token))return;
    awardedTokens.add(token);

    try{
      if(typeof v073Db==='undefined'||!v073Db||typeof v073Db.rpc!=='function'){
        awardedTokens.delete(token);
        return;
      }
      const user=await currentUser();
      if(!user){awardedTokens.delete(token);return;}

      /* Server is the authority for guild membership and daily limits. Do not
         depend on a locally loaded v254Membership object. */
      const bridgeActive=!!v073Db.__v439GuildXpBridge;
      const {data:rpcData,error}=await v073Db.rpc('v411_add_guild_activity',{p_kind:'dungeon'});
      if(error){
        awardedTokens.delete(token);
        if(!bridgeActive&&typeof v063Toast==='function'){
          v063Toast('Gilden-EP Serverfehler','warn',String(error.message||'Dungeon-Gilden-EP konnten nicht gebucht werden.'));
        }
        return;
      }

      const row=Array.isArray(rpcData)?rpcData[0]:rpcData;
      if(!row)return;
      const awarded=Math.max(0,Math.floor(Number(row.awarded)||0));
      const guildXp=Math.max(0,Math.floor(Number(row.guild_xp)||0));
      const dailyTotal=Number(row.daily_total);

      try{
        if(typeof v254Guild!=='undefined'&&v254Guild&&Number.isFinite(guildXp)){
          v254Guild.guild_xp=guildXp;
          if(document.querySelector('#guild')?.classList.contains('active')&&typeof v254RenderGuild==='function')v254RenderGuild();
        }
      }catch(e){}

      addGuildRewardLine(awarded,Number.isFinite(dailyTotal)?dailyTotal:NaN);
      if(awarded>0&&!bridgeActive&&typeof v063Toast==='function'){
        v063Toast('🏰 Gilden-EP','success',`Dungeon: +${awarded} Gilden-EP`);
      }
    }catch(e){
      awardedTokens.delete(token);
      console.warn('V4.73 Dungeon -> Gilden-EP',e);
    }
  }
  window.v473AwardDungeonGuildXp=awardDungeonGuildXp;

  if(typeof v247ShowDungeonReward==='function'&&!window.__v473DungeonGuildXpWrapped){
    const base=v247ShowDungeonReward;
    v247ShowDungeonReward=function(data){
      const r=base.apply(this,arguments);
      try{setTimeout(()=>{void awardDungeonGuildXp(data)},0)}catch(e){}
      return r;
    };
    try{window.v247ShowDungeonReward=v247ShowDungeonReward}catch(e){}
    window.__v473DungeonGuildXpWrapped=true;
  }

  /* Shop cleanup Phase 1: retire V4.73 presentation hooks only.
     decorateShop() only added the unused v473-premium-cards marker and stamp() wrote an
     obsolete version. Dungeon -> guild XP authority above stays untouched. */
})();

