/* === v4105-guild-grow-qa-fix === */
(()=>{
 'use strict';
 const VERSION='V4.105 Stable',SHORT='V4.105';
 let loading=null,lastGoodAt=0;
 function stamp(){}
 async function ensureGuildState(force=false){
  try{
   if(!force && typeof v254Membership!=='undefined' && v254Membership){lastGoodAt=Date.now();return true}
   if(loading)return loading;
   loading=(async()=>{
    try{
     if(typeof v254EnsureOnline!=='function'||!(await v254EnsureOnline()))return false;
     if(typeof v254LoadGuild==='function'){
      try{await v254LoadGuild()}catch(e){console.warn('V4.105 guild lazy load',e)}
     }
     if(typeof v254Membership!=='undefined'&&v254Membership){lastGoodAt=Date.now();return true}
     /* Fallback: membership may be needed from Growroom before the Guild screen ever rendered. */
     if(typeof v073Db==='undefined'||!v073Db||typeof v073User==='undefined'||!v073User?.id)return false;
     const {data,error}=await v073Db.from('guild_members')
       .select('guild_id,role,attack_signed,defense_signed,boss_signed,joined_at')
       .eq('user_id',v073User.id).limit(1);
     if(error)throw error;
     const row=Array.isArray(data)?data[0]:null;
     if(!row)return false;
     try{v254Membership=row}catch(e){}
     if(typeof v254Guild==='undefined'||!v254Guild){
      try{if(typeof v254LoadGuild==='function')await v254LoadGuild()}catch(e){}
     }
     lastGoodAt=Date.now();
     return typeof v254Membership!=='undefined'&&!!v254Membership;
    }finally{loading=null}
   })();
   return await loading;
  }catch(e){loading=null;console.warn('V4.105 ensure guild state',e);return false}
 }
 window.v4105EnsureGuildState=ensureGuildState;
 window.v4105GuildStateStatus=()=>({loaded:typeof v254Membership!=='undefined'&&!!v254Membership,lastGoodAt});

 /* Warm the membership cache in the background. Donation still has its own on-demand await,
    so this is only a latency improvement and never required for correctness. */
 function warm(){
  try{
   if(typeof v073User!=='undefined'&&v073User?.id&&!v073User?.is_anonymous&&
      (typeof v254Membership==='undefined'||!v254Membership))ensureGuildState(false);
  }catch(e){}
 }
  /* V4.159: startup guild warm retries retired. Central boot primes guild/chat once; donation resolves on demand. */

 /* Remove the obsolete red result cached by V4.103 so Settings status is based on the
    corrected V4.105 run rather than yesterday's test contract. */
 try{
  const uid=String((typeof v073User!=='undefined'&&v073User?.id)||s?.__accountOwnerId||s?.social?.playerId||'local');
  ['growLegendsQA:v4103:','growLegendsQA:v4102:'].forEach(p=>{
   const k=p+uid,raw=localStorage.getItem(k);if(!raw)return;
   const r=JSON.parse(raw);if(Array.isArray(r?.results)&&r.results.some(x=>x?.name==='Mystisch bleibt Event-Quelle'))localStorage.removeItem(k);
  });
 }catch(e){}

 /* Existing QA runner owns the panel. Run it once more after V4.105 has installed so
    the corrected test contract and guild lazy-load test are immediately visible. */
 /* V4.159: retired automatic full QA on every page load. Systemtechnik now runs only when opened or explicitly restarted. */
 stamp();
})();

