/* === v439-guild-xp-server-bridge === */
(function(){
  const VERSION='V4.40 Stable', SHORT='V4.40';
  let warned=false, installed=false;

  function stamp(){}

  function toast(title,type,detail){
    try{if(typeof v063Toast==='function')v063Toast(title,type,detail)}catch(e){}
  }

  function applyAwardResult(res,args){
    const row=Array.isArray(res?.data)?res.data[0]:res?.data;
    const error=res?.error;
    if(error){
      const raw=String(error.message||error.details||error.hint||'Unbekannter Supabase-Fehler');
      console.error('V4.39 Gilden-EP RPC',error);
      if(!warned){
        warned=true;
        const missing=/v411_add_guild_activity|does not exist|schema cache|function/i.test(raw);
        toast(
          'Gilden-EP Serverfehler',
          'warn',
          missing
            ? 'Die Supabase-Funktion für Gilden-EP fehlt/ist veraltet. V439_GUILD_XP_SQL.sql einmal im Supabase SQL Editor ausführen.'
            : raw
        );
      }
      return;
    }
    if(!row)return;
    const awarded=Math.max(0,Math.floor(Number(row.awarded)||0));
    const gx=Math.max(0,Math.floor(Number(row.guild_xp)||0));
    if(typeof v254Guild!=='undefined'&&v254Guild&&Number.isFinite(gx)){
      v254Guild.guild_xp=gx;
      try{if(document.querySelector('#guild')?.classList.contains('active')&&typeof v254RenderGuild==='function')v254RenderGuild()}catch(e){}
    }
    if(awarded>0){
      const kind=String(args?.p_kind||'');
      const label={quest:'Quest',dungeon:'Dungeon',pvp_win:'PvP-Sieg',guild_boss:'Gildenboss'}[kind]||'Aktivität';
      toast('🏰 Gilden-EP','success',`${label}: +${awarded} Gilden-EP`);
    }
  }

  function installRpcBridge(){
    try{
      if(installed)return true;
      if(typeof v073Db==='undefined'||!v073Db||typeof v073Db.rpc!=='function')return false;
      if(v073Db.__v439GuildXpBridge){installed=true;return true}
      const baseRpc=v073Db.rpc.bind(v073Db);
      v073Db.rpc=function(fn,args,opts){
        const out=baseRpc(fn,args,opts);
        if(String(fn)!=='v411_add_guild_activity')return out;
        return Promise.resolve(out).then(res=>{applyAwardResult(res,args);return res;});
      };
      try{Object.defineProperty(v073Db,'__v439GuildXpBridge',{value:true,configurable:true})}catch(e){v073Db.__v439GuildXpBridge=true}
      installed=true;
      return true;
    }catch(e){console.warn('V4.39 install guild XP bridge',e);return false}
  }

  /* Install immediately when possible and again after auth/Supabase init. */
  installRpcBridge();
  if(typeof v073Init==='function'&&!window.__v439InitWrapped){
    const base=v073Init;
    v073Init=async function(){
      const r=await base.apply(this,arguments);
      installRpcBridge();
      return r;
    };
    try{window.v073Init=v073Init}catch(e){}
    window.__v439InitWrapped=true;
  }

  /* The existing V4.36/V4.15 owners remain authoritative for WHEN XP is earned.
     This bridge owns only server feedback + live guild_xp repaint. */
  /* V6.217: v073Init + lifecycle hooks own bridge installation.
     Historical 250ms polling and the version-only MutationObserver are retired. */
  [300,1800,5200,9000].forEach(ms=>setTimeout(()=>{installRpcBridge();stamp()},ms));
  stamp();
  document.addEventListener('DOMContentLoaded',()=>{installRpcBridge();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{installRpcBridge();stamp()},{passive:true});
})();

