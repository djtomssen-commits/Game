(function(){
  const VERSION='V4.67 Stable', SHORT='V4.67';
  const ACCOUNT_PREFIX='growLegendsAccountSave:';
  const BEST_PREFIX='growLegendsBestSave:';
  const FLOOR_PREFIX='growLegendsProgressFloor:';
  let expectedProfile=null;
  let resolving=false;
  let holdReason='';
  let holdShown='';
  let restoreBusy=false;

  function uidNow(){try{return v073User && !v073User.is_anonymous && v073User.id?String(v073User.id):''}catch(e){return ''}}
  function levelOf(x){const n=Number(x?.level)||1;return Math.max(1,Math.floor(n))}
  function savedAt(x){return Math.max(0,Number(x?.__savedAt)||0)}
  function revisionOf(x){return Math.max(0,Number(x?.__saveRevision)||0)}
  function nameOf(x){return String(x?.characterName||x?.playerName||x?.name||'').trim()}
  function serverId(){try{return String(window.v343CurrentServer||s?.__serverId||'beta')}catch(e){return 'beta'}}
  function floorKey(uid){return FLOOR_PREFIX+uid+':server:'+serverId()}
  function bestKey(uid){return BEST_PREFIX+uid+':server:'+serverId()}
  function explicitOwnerOk(x,uid,allowMissing=false){
    if(!x||typeof x!=='object')return false;
    const owner=String(x.__accountOwnerId||'');
    const social=String(x.social?.playerId||'');
    if(owner && owner!==uid)return false;
    if(social && social!==uid)return false;
    if(!allowMissing && !owner && !social)return false;
    return true;
  }
  function stateReady(uid=uidNow()){
    if(!uid)return false;
    try{
      return String(v075CloudLoadedFor||'')===uid &&
             String(s?.__accountOwnerId||'')===uid &&
             (!s?.social?.playerId || String(s.social.playerId)===uid);
    }catch(e){return false}
  }
  function clone(x){try{return JSON.parse(JSON.stringify(x))}catch(e){return null}}
  function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
  function readFloor(uid){
    const x=readJson(floorKey(uid));
    return x&&String(x.userId||'')===uid?Math.max(1,Number(x.level)||1):1;
  }
  function writeFloor(uid,lvl,name){
    /* V4.159: historical level-floor recovery retired. Account saves are selected
       by account container + identity + revision/time, never by highest level. */
    return Math.max(1,Number(lvl)||1);
  }
  function storeBest(uid,data){
    /* V4.159: no more best/highest-level shadow saves. */
    return false;
  }
  function storageCandidates(uid){
    const out=[];
    const seen=new Set();
    function add(source,data,allowMissing=false){
      if(!data||typeof data!=='object'||!explicitOwnerOk(data,uid,allowMissing))return;
      let sig='';try{sig=[levelOf(data),nameOf(data),savedAt(data),revisionOf(data),JSON.stringify(data.equipment||{})].join('|')}catch(e){sig=source+'|'+Math.random()}
      if(seen.has(sig))return;seen.add(sig);out.push({source,data});
    }
    try{
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i)||'';
        if(k===bestKey(uid))add('best-local',readJson(k),true);
        else if(k===ACCOUNT_PREFIX+uid || k.startsWith(ACCOUNT_PREFIX+uid+':server:'))add('account-local',readJson(k),true);
      }
    }catch(e){}
    try{if(s&&String(s.__accountOwnerId||'')===uid)add('current',clone(s),false)}catch(e){}
    return out;
  }
  function better(a,b){
    if(!a)return b;if(!b)return a;
    const al=levelOf(a.data),bl=levelOf(b.data);
    if(bl!==al)return bl>al?b:a;
    const at=savedAt(a.data),bt=savedAt(b.data);if(bt!==at)return bt>at?b:a;
    return revisionOf(b.data)>revisionOf(a.data)?b:a;
  }
  function highestLocal(uid){return storageCandidates(uid).reduce((best,x)=>better(best,x),null)}

  async function loadExpected(uid){
    /* V4.159: public profile rows are never a progression floor. */
    expectedProfile=null;
    return null;
  }


  function showHold(reason,uid=uidNow()){
    holdReason=String(reason||'Sicherheitsstopp');
    if(!uid||holdShown===holdReason)return;
    holdShown=holdReason;
    let box=document.querySelector('#v450RecoveryWarning');
    if(!box){box=document.createElement('div');box.id='v450RecoveryWarning';document.body?.appendChild(box)}
    if(!box)return;
    const cur=levelOf(s), floor=readFloor(uid);
    box.innerHTML=`<b>⚠️ Spielstand-Schutz aktiv</b><div style="margin-top:5px">${holdReason}</div><div style="margin-top:4px">Geladen: Level ${cur} · serverseitig/ lokal bekannte Mindeststufe: Level ${floor}</div><div class="v450-actions"><button class="btn secondary" id="v450DismissBtn">Hinweis schließen</button></div>`;
    box.querySelector('#v450DismissBtn')?.addEventListener('click',()=>box.remove());
    try{if(typeof v063Toast==='function')v063Toast('⚠️ Spielstand-Schutz','error',holdReason)}catch(e){}
  }
  function clearHold(){holdReason='';holdShown='';document.querySelector('#v450RecoveryWarning')?.remove()}

  async function restoreHighestLocal(uid=uidNow()){
    if(restoreBusy||!uid)return false;restoreBusy=true;
    try{
      const hi=highestLocal(uid);if(!hi||levelOf(hi.data)<=levelOf(s))return false;
      if(typeof v075ApplyCloudSave!=='function')return false;
      const ok=await v075ApplyCloudSave(clone(hi.data));
      if(!ok)return false;
      clearHold();storeBest(uid,s);writeFloor(uid,levelOf(s),nameOf(s));
      try{if(typeof render==='function')render()}catch(e){}
      try{if(typeof v073SyncProfile==='function')await v073SyncProfile(true)}catch(e){}
      try{if(typeof v075WriteCloudSave==='function')await v075WriteCloudSave(true)}catch(e){}
      try{if(typeof v063Toast==='function')v063Toast('✅ Spielstand wiederhergestellt','success',`Level ${levelOf(s)} wurde geladen.`)}catch(e){}
      return true;
    }finally{restoreBusy=false}
  }
  /* V4.54: no public/manual recovery controls. Internal high-water protection remains. */

  /* Level is monotonic. A newer timestamp must NEVER replace a higher-level save
     of the same account. This is the core recovery rule for the Lv50 -> Lv15 incident. */
  if(typeof v213PickNewestSave==='function'&&!window.__v450PickerWrapped){
    const base=v213PickNewestSave;
    v213PickNewestSave=function(uid,cloudData,scoped,current){
      let chosen=base.apply(this,arguments);
      const rows=[];
      function add(source,data,allowMissing=false){if(data&&explicitOwnerOk(data,String(uid),allowMissing))rows.push({source,data})}
      add('cloud',cloudData,true);add('local',scoped,true);add('current',current,false);
      storageCandidates(String(uid)).forEach(x=>rows.push(x));
      let high=null;rows.forEach(x=>{high=better(high,x)});
      if(high && (!chosen || levelOf(high.data)>levelOf(chosen.data)))chosen=high;
      if(chosen)writeFloor(String(uid),levelOf(chosen.data),nameOf(chosen.data));
      return chosen;
    };
    window.__v450PickerWrapped=true;
  }

  /* Query the account's public profile BEFORE the cloud resolver. Its level is only
     used as a safety floor; it never reconstructs or invents missing save contents. */
  if(typeof v075ResolveCloudAfterLogin==='function'&&!window.__v450ResolverWrapped){
    const base=v075ResolveCloudAfterLogin;
    v075ResolveCloudAfterLogin=async function(){
      const uid=uidNow();if(uid)await loadExpected(uid);
      resolving=true;
      try{
        const r=await base.apply(this,arguments);
        if(r&&uid){
          const hi=highestLocal(uid);
          /* V4.52: no automatic recovery. Rescue is manual only. */
          const floor=readFloor(uid);
          clearHold();storeBest(uid,s);writeFloor(uid,levelOf(s),nameOf(s));
        }
        return r;
      }finally{resolving=false}
    };
    try{window.v075ResolveCloudAfterLogin=v075ResolveCloudAfterLogin}catch(e){}
    window.__v450ResolverWrapped=true;
  }

  function unsafeReason(uid){
    if(!uid)return '';
    if(!stateReady(uid))return 'Der aktuelle Browser-Spielstand ist noch nicht eindeutig dem angemeldeten Account zugeordnet.';
    return '';
  }

  /* HARD WRITE BARRIER. Unlike V4.48 this returns BEFORE any older wrapper can stamp
     a foreign in-memory state with the newly authenticated user id. */
  if(typeof v075WriteCloudSave==='function'&&!window.__v450CloudWriteGuard){
    const base=v075WriteCloudSave;
    v075WriteCloudSave=async function(force=false){
      const uid=uidNow();
      if(uid){
        const why=unsafeReason(uid);
        if(why){showHold(why,uid);return false}
        storeBest(uid,s);
      }
      return base.apply(this,arguments);
    };
    try{window.v075WriteCloudSave=v075WriteCloudSave}catch(e){}
    window.__v450CloudWriteGuard=true;
  }

  if(typeof v073SyncProfile==='function'&&!window.__v450ProfileWriteGuard){
    const base=v073SyncProfile;
    v073SyncProfile=async function(force=false){
  if(window.__V200_AUTH_READY__!==true)return false;
      const uid=uidNow();
      if(uid){const why=unsafeReason(uid);if(why){showHold(why,uid);return false}}
      return base.apply(this,arguments);
    };
    try{window.v073SyncProfile=v073SyncProfile}catch(e){}
    window.__v450ProfileWriteGuard=true;
  }

  /* Local account checkpoints are protected by the same ownership rule. Generic KEY
     may change during login, but it can no longer overwrite account-scoped recovery. */
  if(typeof v200SaveScopedLocal==='function'&&!window.__v450ScopedSaveGuard){
    const base=v200SaveScopedLocal;
    v200SaveScopedLocal=function(){const uid=uidNow();if(uid&&!stateReady(uid))return false;if(uid)storeBest(uid,s);return base.apply(this,arguments)};
    window.__v450ScopedSaveGuard=true;
  }
  if(typeof v145SaveScopedLocal==='function'&&!window.__v450LegacyScopedSaveGuard){
    const base=v145SaveScopedLocal;
    v145SaveScopedLocal=function(){const uid=uidNow();if(uid&&!stateReady(uid))return false;if(uid)storeBest(uid,s);return base.apply(this,arguments)};
    window.__v450LegacyScopedSaveGuard=true;
  }
  if(typeof v213LocalCheckpoint==='function'&&!window.__v450CheckpointGuard){
    const base=v213LocalCheckpoint;
    v213LocalCheckpoint=function(){const uid=uidNow();if(uid&&!stateReady(uid))return false;if(uid)storeBest(uid,s);return base.apply(this,arguments)};
    window.__v450CheckpointGuard=true;
  }

  /* Once a healthy resolved account is active, remember its highest safe snapshot. */
  /* V7.113: retired V450 capture/version hooks were already no-ops; account-isolation logic remains active. */
})();
