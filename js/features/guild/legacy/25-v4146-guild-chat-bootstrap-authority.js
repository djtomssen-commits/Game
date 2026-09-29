/* === v4146-guild-chat-bootstrap-authority === */
(()=>{
 'use strict';
 const V=window.GROW_LEGENDS_VERSION||{short:'V4.159',label:'V4.159 Stable'};
 let pending=null,pendingUid='';
 function uid(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return''}}
 function ready(){try{return !!uid()&&!!v073Db&&window.__V200_AUTH_READY__===true}catch(e){return false}}
 function sync(){try{return window.v4144SyncGuildChat?.()}catch(e){return false}}
 function sameLoaded(){try{return !!v254Membership?.guild_id&&String(v254Guild?.id||'')===String(v254Membership.guild_id||'')}catch(e){return false}}
 async function ensure(reason='bootstrap'){
  const id=uid();
  if(!id||!ready()){sync();return false}
  if(sameLoaded()){sync();return true}
  if(pending&&pendingUid===id)return pending;
  pendingUid=id;
  pending=(async()=>{
   try{
    const db=v073Db;
    const {data:memberRows,error:memberError}=await db.from('guild_members')
      .select('guild_id,role,attack_signed,defense_signed,boss_signed,joined_at')
      .eq('user_id',id).limit(1);
    if(memberError)throw memberError;
    if(uid()!==id||!ready())return false;
    const mem=Array.isArray(memberRows)?(memberRows[0]||null):null;
    if(!mem?.guild_id){
      try{v254Membership=null;v254Guild=null}catch(e){}
      sync();return false;
    }
    try{v254Membership=mem}catch(e){}
    const {data:guildRows,error:guildError}=await db.from('guilds')
      .select('id,name,tag,leader_id,guild_buds,xp_level,gold_level,guild_xp,created_at')
      .eq('id',mem.guild_id).limit(1);
    if(guildError)throw guildError;
    if(uid()!==id||!ready())return false;
    const guild=Array.isArray(guildRows)?(guildRows[0]||null):null;
    if(!guild){sync();return false}
    try{v254Guild=guild}catch(e){}
    sync();
    return true;
   }catch(e){
    console.warn('V4.159 guild chat identity bootstrap',reason,e);
    sync();return false;
   }finally{
    if(pendingUid===id){pending=null;pendingUid=''}
   }
  })();
  return pending;
 }
 window.v4146EnsureGuildChatIdentity=ensure;
 /* V4.159: central boot controller calls guild identity ensure exactly once per account-ready transition. */
 try{
  if(typeof v136Logout==='function'&&!window.__v4146GuildChatLogoutWrap){
   const base=v136Logout;
   v136Logout=async function(){const r=await base.apply(this,arguments);pending=null;pendingUid='';sync();return r};
   try{window.v136Logout=v136Logout}catch(e){}
   window.__v4146GuildChatLogoutWrap=true;
  }
 }catch(e){}
 /* V4.159: pageshow/visibility/settle retries retired; coordinator owns foreground refresh. */
 function stamp(){}
 stamp();
})();

