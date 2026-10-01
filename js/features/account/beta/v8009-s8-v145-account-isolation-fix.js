/* ===== V4.02 Account isolation =====
   Rule:
   - Existing account with cloud save -> cloud save wins.
   - New durable account without cloud save -> NEW/FRESH character.
   - Never copy the currently loaded character from a different account.
*/
const V145_ACCOUNT_SAVE_PREFIX='growLegendsAccountSave:';

function v145ScopedKey(uid){
  return V145_ACCOUNT_SAVE_PREFIX+String(uid||'');
}

function v145FreshState(){
  const fresh=structuredClone(defaultState);

  /* Re-apply only safe defaults that later versions expect.
     Do NOT copy character progression from the current s object. */
  fresh.skillPoints??=0;
  fresh.classSkills??={};
  fresh.playerClass??=null;
  fresh.classLocked=false;
  fresh.harzTaler??=6;
  fresh.shopRefreshes??=0;
  fresh.lastShopSeed??=0;
  fresh.dungeonPass??={lastFree:0};
  fresh.story??={chapter:1,bossesDefeated:0};
  fresh.energy=100;
  fresh.lastEnergy=Date.now();
  fresh.quests??={offers:[],active:null};
  fresh.social??={};

  return fresh;
}

function v145ReplaceState(next){
  if(!next || typeof next!=='object')return false;

  Object.keys(s).forEach(k=>delete s[k]);
  Object.assign(s,JSON.parse(JSON.stringify(next)));

  try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
  return true;
}

function v145SaveScopedLocal(){
  if(!v073User || v073User.is_anonymous)return;
  try{
    const copy=JSON.parse(JSON.stringify(s));
    copy.__accountOwnerId=v073User.id;
    localStorage.setItem(v145ScopedKey(v073User.id),JSON.stringify(copy));
  }catch(e){
    console.warn('V4.02 scoped local save',e);
  }
}

function v145LoadScopedLocal(uid){
  try{
    const raw=localStorage.getItem(v145ScopedKey(uid));
    if(!raw)return null;
    const obj=JSON.parse(raw);
    if(obj?.__accountOwnerId && obj.__accountOwnerId!==uid)return null;
    delete obj.__accountOwnerId;
    return obj;
  }catch(e){
    return null;
  }
}

/* Override cloud writer so every cloud save is stamped with its true owner. */
const v145OldWriteCloudSave=v075WriteCloudSave;
v075WriteCloudSave=async function(force=false){
  if(v073User && !v073User.is_anonymous){
    s.__accountOwnerId=v073User.id;
  }

  const ok=await v145OldWriteCloudSave(force);

  if(ok){
    v145SaveScopedLocal();
  }

  return ok;
};

/* Override cloud application and reject a save that explicitly belongs to another user. */
const v145OldApplyCloudSave=v075ApplyCloudSave;
v075ApplyCloudSave=async function(data){
  if(!data || typeof data!=='object')return false;

  if(
    data.__accountOwnerId &&
    v073User &&
    !v073User.is_anonymous &&
    data.__accountOwnerId!==v073User.id
  ){
    console.error('V4.02 blocked foreign cloud save',data.__accountOwnerId,v073User.id);
    if(typeof v063Toast==='function'){
      v063Toast(
        'Fremder Spielstand blockiert',
        'error',
        'Dieser Cloud-Spielstand gehört zu einem anderen Account.'
      );
    }
    return false;
  }

  const ok=await v145OldApplyCloudSave(data);

  if(ok && v073User && !v073User.is_anonymous){
    s.__accountOwnerId=v073User.id;
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    v145SaveScopedLocal();
  }

  return ok;
};

/* This is the important fix: no cloud save means fresh character, not current browser character. */
v075ResolveCloudAfterLogin=async function(){
  if(!v073Ready||!v073User||v073User.is_anonymous)return false;

  const uid=v073User.id;
  const cloud=await v075GetCloudSave();

  if(cloud?.save_data && Object.keys(cloud.save_data).length){
    const data=cloud.save_data;

    /*
      Old saves (before V4.02) have no owner stamp.
      They are accepted for their current account and stamped on next save.
    */
    if(data.__accountOwnerId && data.__accountOwnerId!==uid){
      throw new Error('Cloud-Spielstand gehört zu einem anderen Benutzer.');
    }

    await v075ApplyCloudSave(data);
    s.__accountOwnerId=uid;
    v075CloudLoadedFor=uid;
    await v075WriteCloudSave(true);
    try{await v073SyncProfile(true)}catch(e){}
    v145SaveScopedLocal();
    return true;
  }

  /*
    NO CLOUD SAVE:
    first try this exact account's own scoped local save.
    Never touch the generic KEY save from another account.
  */
  const ownLocal=v145LoadScopedLocal(uid);

  if(ownLocal){
    v145ReplaceState(ownLocal);
  }else{
    const fresh=v145FreshState();
    fresh.__accountOwnerId=uid;
    fresh.social??={};
    fresh.social.playerId=uid;
    v145ReplaceState(fresh);
  }

  s.__accountOwnerId=uid;
  s.social??={};
  s.social.playerId=uid;

  v075CloudLoadedFor=uid;

  /* Create the initial cloud save for this account only. */
  await v075WriteCloudSave(true);
  try{await v073SyncProfile(true)}catch(e){}

  if(typeof v063Toast==='function'){
    v063Toast(
      'Neuer Account',
      'success',
      'Für diesen Account wurde ein eigener neuer Spielstand erstellt.'
    );
  }

  try{render()}catch(e){}
  return true;
};

/* Before Google login, remember which durable account was active.
   After auth change the resolver will load ONLY the new account's save. */
let v145LastDurableUserId=null;

function v145WatchAccount(){
  if(v073User && !v073User.is_anonymous){
    if(v145LastDurableUserId && v145LastDurableUserId!==v073User.id){
      /* account switch: generic local state is not trusted */
      v075CloudLoadedFor=null;
    }
    v145LastDurableUserId=v073User.id;
  }
}

const v145BaseRender=render;
render=function(){
  v145WatchAccount();
  const r=v145BaseRender();

  if(v073User && !v073User.is_anonymous && v075CloudLoadedFor===v073User.id){
    v145SaveScopedLocal();
  }

  
  return r;
};

setTimeout(()=>{
  try{
    v145WatchAccount();
    if(v073User && !v073User.is_anonymous && v075CloudLoadedFor===v073User.id){
      v145SaveScopedLocal();
    }
  }catch(e){}
},500);
