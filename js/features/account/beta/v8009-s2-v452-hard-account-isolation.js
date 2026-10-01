(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  const EMERGENCY_PREFIX='growLegendsAccountTransitionBackup:';
  const gate={phase:'idle',resolvedUid:'',transitionUid:'',seq:0,lastReason:'',finalizeUid:'',finalizePromise:null};
  window.__V452_ACCOUNT_GATE__=gate;

  function uidNow(){try{return v073User&&!v073User.is_anonymous&&v073User.id?String(v073User.id):''}catch(e){return ''}}
  function ownerOf(x){return String(x?.__accountOwnerId||'')}
  function socialOwnerOf(x){return String(x?.social?.playerId||'')}
  function clone(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return null}}
  function stateOwnedBy(uid,obj=s){
    if(!uid||!obj||typeof obj!=='object')return false;
    return ownerOf(obj)===uid && socialOwnerOf(obj)===uid;
  }
  function cloudResolvedFor(uid){try{return String(v075CloudLoadedFor||'')===uid}catch(e){return false}}
  function verified(uid=uidNow()){
    if(!uid)return false;
    return gate.phase==='ready' && gate.resolvedUid===uid && stateOwnedBy(uid) && cloudResolvedFor(uid);
  }
  window.v452AccountVerified=verified;

  function emergencyBackupCurrent(nextUid){
    try{
      const oldOwner=ownerOf(s);
      if(!oldOwner||oldOwner===String(nextUid||''))return;
      const snap=clone(s);if(!snap)return;
      localStorage.setItem(EMERGENCY_PREFIX+oldOwner+':'+Date.now(),JSON.stringify(snap));
    }catch(e){console.warn('V4.52 transition backup',e)}
  }

  function beginTransition(uid,reason='login'){
    uid=String(uid||'');
    if(!uid)return ++gate.seq;
    emergencyBackupCurrent(uid);
    gate.seq++;
    gate.phase='resolving';
    gate.transitionUid=uid;
    gate.resolvedUid='';
    gate.lastReason=reason;
    try{v075CloudLoadedFor=null}catch(e){}
    try{window.__V200_AUTH_READY__=false}catch(e){}
    return gate.seq;
  }
  function invalidate(reason='auth-change'){
    gate.seq++;
    gate.phase='blocked';
    gate.transitionUid='';
    gate.resolvedUid='';
    gate.lastReason=reason;
    gate.finalizeUid='';
    gate.finalizePromise=null;
    try{v075CloudLoadedFor=null}catch(e){}
    try{window.__V200_AUTH_READY__=false}catch(e){}
  }
  function markReady(uid,token){
    uid=String(uid||'');
    if(!uid||token!==gate.seq||uidNow()!==uid)return false;
    if(!stateOwnedBy(uid)||!cloudResolvedFor(uid))return false;
    gate.phase='ready';gate.resolvedUid=uid;gate.transitionUid='';gate.lastReason='';
    return true;
  }

  function blocked(kind){
    const uid=uidNow();
    if(!uid)return true;
    if(verified(uid))return false;
    console.warn(`V4.52 blocked ${kind}: account state is not verified`,{uid,phase:gate.phase,owner:ownerOf(s),social:socialOwnerOf(s),cloud:String(typeof v075CloudLoadedFor==='undefined'?'':v075CloudLoadedFor||'')});
    return true;
  }

  /* Strict resolver selection. Never choose a save only because it has the highest
     level. Cloud/scoped candidates are trusted by their account container; the
     generic current state is accepted only with an explicit matching owner. */
  if(typeof v213PickNewestSave==='function'){
    v213PickNewestSave=function(uid,cloudData,scoped,current){
      uid=String(uid||'');
      const rows=[];
      const time=x=>Math.max(0,Number(x?.__savedAt)||0);
      const rev=x=>Math.max(0,Number(x?.__saveRevision)||0);
      const allowed=(x,containerTrusted)=>{
        if(!x||typeof x!=='object')return false;
        const o=ownerOf(x),so=socialOwnerOf(x);
        if(o&&o!==uid)return false;
        if(so&&so!==uid)return false;
        if(!containerTrusted && (!o||!so))return false;
        return true;
      };
      if(allowed(cloudData,true))rows.push({source:'cloud',data:cloudData});
      if(allowed(scoped,true))rows.push({source:'local',data:scoped});
      if(allowed(current,false))rows.push({source:'current',data:current});
      if(!rows.length)return null;
      const hasMeta=rows.some(x=>time(x.data)>0||rev(x.data)>0);
      if(!hasMeta)return rows.find(x=>x.source==='cloud')||rows[0];
      rows.sort((a,b)=>time(b.data)-time(a.data)||rev(b.data)-rev(a.data)||(a.source==='cloud'?-1:b.source==='cloud'?1:0));
      return rows[0];
    };
    try{window.v213PickNewestSave=v213PickNewestSave}catch(e){}
  }

  /* This is the central gate. It starts BEFORE any old finalizer can stamp the
     still-loaded previous character with the newly authenticated user id. */
  if(typeof v200FinalizeUser==='function'&&!window.__v452FinalizeGuard){
    const base=v200FinalizeUser;
    v200FinalizeUser=async function(user){
      if(!user||user.is_anonymous)return base.apply(this,arguments);
      const uid=String(user.id||'');
      if(!uid)return false;
      if(gate.finalizePromise&&gate.finalizeUid===uid)return gate.finalizePromise;
      const token=beginTransition(uid,'finalize-user');
      const ctx=this,args=arguments;
      gate.finalizeUid=uid;
      gate.finalizePromise=(async()=>{
        let result=false;
        try{
          result=await base.apply(ctx,args);
          if(token!==gate.seq||uidNow()!==uid)return result;
          if(!result||!stateOwnedBy(uid)||!cloudResolvedFor(uid)){
            gate.phase='blocked';
            gate.lastReason='Resolver returned without a verified account-owned state';
            try{window.__V200_AUTH_READY__=false}catch(e){}
            console.error('V4.52 account resolver verification failed',{uid,result,owner:ownerOf(s),social:socialOwnerOf(s),cloud:String(typeof v075CloudLoadedFor==='undefined'?'':v075CloudLoadedFor||'')});
            return false;
          }
          if(!markReady(uid,token))return false;

          /* Resolver-time account writes were deliberately blocked. Once ownership is
             verified, create the first account-scoped checkpoint and cloud sync. */
          try{if(typeof v200SaveScopedLocal==='function')v200SaveScopedLocal()}catch(e){}
          try{if(typeof v145SaveScopedLocal==='function')v145SaveScopedLocal()}catch(e){}
          setTimeout(async()=>{
            if(!verified(uid))return;
            try{if(typeof v075WriteCloudSave==='function')await v075WriteCloudSave(true)}catch(e){console.warn('V4.52 post-login cloud sync',e)}
          },0);
          return result;
        }catch(e){
          if(token===gate.seq){gate.phase='blocked';gate.lastReason=String(e?.message||e||'Finalize failed')}
          throw e;
        }finally{
          if(gate.finalizeUid===uid){gate.finalizeUid='';gate.finalizePromise=null}
        }
      })();
      return gate.finalizePromise;
    };
    try{window.v200FinalizeUser=v200FinalizeUser}catch(e){}
    window.__v452FinalizeGuard=true;
  }

  /* HARD CLOUD/PROFILE WRITE BARRIERS. These are intentionally the last wrappers,
     so no older layer gets a chance to stamp a foreign in-memory state first. */
  if(typeof v075WriteCloudSave==='function'&&!window.__v452CloudGuard){
    const base=v075WriteCloudSave;
    v075WriteCloudSave=async function(){if(blocked('cloud write'))return false;return base.apply(this,arguments)};
    try{window.v075WriteCloudSave=v075WriteCloudSave}catch(e){}
    window.__v452CloudGuard=true;
  }
  if(typeof v073SyncProfile==='function'&&!window.__v452ProfileGuard){
    const base=v073SyncProfile;
    v073SyncProfile=async function(){if(blocked('profile write'))return false;return base.apply(this,arguments)};
    try{window.v073SyncProfile=v073SyncProfile}catch(e){}
    window.__v452ProfileGuard=true;
  }
  if(typeof v075ScheduleSave==='function'&&!window.__v452ScheduleGuard){
    const base=v075ScheduleSave;
    v075ScheduleSave=function(){if(blocked('save schedule'))return;return base.apply(this,arguments)};
    try{window.v075ScheduleSave=v075ScheduleSave}catch(e){}
    window.__v452ScheduleGuard=true;
  }

  /* Account-scoped local saves are just as important as the cloud row. They may not
     be rewritten during a login transition either. */
  if(typeof v200SaveScopedLocal==='function'&&!window.__v452ScopedGuard){
    const base=v200SaveScopedLocal;
    v200SaveScopedLocal=function(){if(blocked('account local save'))return false;return base.apply(this,arguments)};
    try{window.v200SaveScopedLocal=v200SaveScopedLocal}catch(e){}
    window.__v452ScopedGuard=true;
  }
  if(typeof v145SaveScopedLocal==='function'&&!window.__v452LegacyScopedGuard){
    const base=v145SaveScopedLocal;
    v145SaveScopedLocal=function(){if(blocked('legacy account local save'))return false;return base.apply(this,arguments)};
    try{window.v145SaveScopedLocal=v145SaveScopedLocal}catch(e){}
    window.__v452LegacyScopedGuard=true;
  }
  if(typeof v213LocalCheckpoint==='function'&&!window.__v452CheckpointGuard){
    const base=v213LocalCheckpoint;
    v213LocalCheckpoint=function(){if(blocked('local checkpoint'))return false;return base.apply(this,arguments)};
    try{window.v213LocalCheckpoint=v213LocalCheckpoint}catch(e){}
    window.__v452CheckpointGuard=true;
  }

  /* Never let a generic checkpoint function CREATE ownership. It may advance
     revision/time only after the state already explicitly belongs to this user. */
  if(typeof v213StampState==='function'&&!window.__v452StampGuard){
    const base=v213StampState;
    v213StampState=function(){const uid=uidNow();if(!uid||!stateOwnedBy(uid))return false;return base.apply(this,arguments)};
    try{window.v213StampState=v213StampState}catch(e){}
    window.__v452StampGuard=true;
  }

  if(typeof v200AdminPoll==='function'&&!window.__v452AdminPollGuard){
    const base=v200AdminPoll;
    v200AdminPoll=async function(){if(!verified(uidNow()))return;return base.apply(this,arguments)};
    try{window.v200AdminPoll=v200AdminPoll}catch(e){}
    window.__v452AdminPollGuard=true;
  }

  /* Explicit foreign saves are rejected before reaching any historical apply wrapper. */
  if(typeof v075ApplyCloudSave==='function'&&!window.__v452ApplyGuard){
    const base=v075ApplyCloudSave;
    v075ApplyCloudSave=async function(data){
      const uid=uidNow();
      if(!uid||!data||typeof data!=='object')return false;
      const o=ownerOf(data),so=socialOwnerOf(data);
      if((o&&o!==uid)||(so&&so!==uid)){
        console.error('V4.52 rejected foreign save application',{uid,owner:o,social:so});
        return false;
      }
      return base.apply(this,arguments);
    };
    try{window.v075ApplyCloudSave=v075ApplyCloudSave}catch(e){}
    window.__v452ApplyGuard=true;
  }

  /* Logout may save the old verified account first. Invalidate only after that
     logout flow completes. */
  if(typeof v136Logout==='function'&&!window.__v452LogoutGuard){
    const base=v136Logout;
    v136Logout=async function(){try{return await base.apply(this,arguments)}finally{invalidate('logout')}};
    try{window.v136Logout=v136Logout}catch(e){}
    window.__v452LogoutGuard=true;
  }

  /* Independent auth observer: if Supabase changes to a different user, writes are
     frozen immediately even before the normal finalizer runs. */
  async function installAuthObserver(){
    try{
      if(typeof v073Init==='function')await v073Init();
      if(typeof v073Db==='undefined'||!v073Db||window.__v452AuthObserver)return;
      window.__v452AuthObserver=true;
      v073Db.auth.onAuthStateChange((event,session)=>{
        const uid=String(session?.user?.id||'');
        if(event==='SIGNED_OUT'){invalidate('signed-out');return}
        if(uid&&gate.resolvedUid&&gate.resolvedUid!==uid)beginTransition(uid,'auth-user-changed');
      });
    }catch(e){console.warn('V4.52 auth observer',e)}
  }
  void installAuthObserver();

  function installStatus(){
    try{
      const menu=document.querySelector('#v141SettingsMenu');if(!menu)return;
      let row=document.querySelector('#v452SecurityRow');
      if(!row){row=document.createElement('div');row.id='v452SecurityRow';row.className='v141-setting-row';row.innerHTML='<span class="v141-setting-icon">🛡️</span><span class="v141-setting-copy"><b>Account-Schutz</b><span id="v452SecurityText">Aktiv</span></span><button class="btn secondary" disabled style="max-width:105px">V4.52</button>';menu.prepend(row)}
      const t=row.querySelector('#v452SecurityText');if(t)t.textContent=uidNow()?(verified(uidNow())?'Aktiv · Spielstand eindeutig diesem Account zugeordnet':'Aktiv · Schreiben bis zur Account-Prüfung gesperrt'):'Aktiv · kein Account angemeldet';
    }catch(e){}
  }
  function stamp(){installStatus();}
  if(typeof v141BuildSettings==='function'&&!window.__v452SettingsWrapped){const base=v141BuildSettings;v141BuildSettings=function(){const r=base.apply(this,arguments);installStatus();return r};try{window.v141BuildSettings=v141BuildSettings}catch(e){}window.__v452SettingsWrapped=true}
  stamp();
  document.addEventListener('DOMContentLoaded',stamp,{once:true});
  window.addEventListener('pageshow',stamp,{passive:true});
  window.addEventListener('growlegends:account-ready',stamp,{passive:true});
})();
