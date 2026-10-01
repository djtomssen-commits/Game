(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  let reconcileBusy=false,reconciledUid='',lastIntegrityToast='',lastIntegrityAt=0;

  function uidNow(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return ''}}
  function clean(x){return String(x||'').trim()}
  function validName(x){try{return typeof v071NameValid==='function'?v071NameValid(x):clean(x).length>=2}catch(e){return clean(x).length>=2}}
  function gateReady(uid){
    try{
      if(typeof window.v452AccountVerified==='function')return !!window.v452AccountVerified(uid);
      return !!uid && String(s?.__accountOwnerId||'')===uid && String(s?.social?.playerId||'')===uid && String(v075CloudLoadedFor||'')===uid;
    }catch(e){return false}
  }
  function stamp(){}

  async function ownProfile(uid){
    try{
      if(typeof v073Init==='function')await v073Init();
      if(typeof v073Db==='undefined'||!v073Db)return null;
      const {data,error}=await v073Db.from('profiles')
        .select('id,character_name,class_id,class_name,level')
        .eq('id',uid).maybeSingle();
      if(error)throw error;
      return data||null;
    }catch(e){console.warn('V4.53 profile floor lookup',e);return null}
  }

  async function reconcile(reason='login'){
    const uid=uidNow();
    if(!uid||reconcileBusy||!gateReady(uid))return false;
    /* V4.159: profiles is a public/display mirror only. It may never mutate the
       authoritative character save (level, name or class). Earlier V4.53 logic could
       promote a fresh/other account from a stale profile row (e.g. 57 -> fresh char).
       Canonical recovery is handled only from player_saves/account-scoped snapshots. */
    reconciledUid=uid;
    return false;
  }
  window.v453ReconcileProfileFloor=reconcile;
  /* V4.159: V4.53 profile-floor hooks fully retired. profiles is display-only and not part of login/save ordering. */

  /* A server integrity rejection is important, but hundreds of identical red cards are
     not. Keep the first warning visible and suppress identical repeats for 12 seconds. */
  try{
    if(typeof v063Toast==='function'&&!window.__v453IntegrityToastDedupe){
      const base=v063Toast;
      v063Toast=function(title,type,detail){
        const all=[title,detail].map(x=>String(x||'')).join(' ');
        if(/ACCOUNT_INTEGRITY/i.test(all)){
          const now=Date.now(),key=all.replace(/\s+/g,' ').trim();
          if(key===lastIntegrityToast&&now-lastIntegrityAt<12000)return;
          lastIntegrityToast=key;lastIntegrityAt=now;
        }
        return base.apply(this,arguments);
      };
      try{window.v063Toast=v063Toast}catch(e){}
      window.__v453IntegrityToastDedupe=true;
    }
  }catch(e){}

  /* V7.113: retired V453 render wrapper; stamp() is intentionally empty. */

  stamp();
  document.addEventListener('DOMContentLoaded',()=>{stamp();const uid=uidNow();if(uid&&gateReady(uid))void reconcile('dom')},{once:true});
  window.addEventListener('pageshow',()=>{stamp();const uid=uidNow();if(uid&&gateReady(uid))void reconcile('pageshow')},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{stamp();const uid=uidNow();if(uid&&gateReady(uid))void reconcile('account-ready')},{passive:true});
})();
