from pathlib import Path

p=Path("beta.html")
s=p.read_text(encoding="utf-8")
original=s

old_finalize="""async function v200FinalizeUser(user){
  if(!user || user.is_anonymous || v200Deleting || window.__V301_LOGOUT_IN_PROGRESS__ || window.__V4136_LOGOUT_PREPARING__)return false;

  v073User=user;
  v073Ready=true;
  s.social??={};
  s.social.playerId=user.id;
  localStorage.setItem('growLegendsPlayerId',user.id);

  const ok=await v075ResolveCloudAfterLogin();
  if(!ok)return false;

  window.__V200_AUTH_READY__=true;
  /* V7.207: keep the loading artwork above the app until the deterministic
     boot owner confirms the first playable frame. Without the final owner
     (legacy/standalone fallback), retain the historical immediate release. */
  if(!window.__V7205_SPLASH_GATE__)v075Overlay(false);

  if(v200CharacterComplete()){
    s.characterNameSet=true;
    v200ClearCharacterModals();
    localStorage.setItem(KEY,JSON.stringify(s));
    v200OpenHome();
  }else{
    v200ClearCharacterModals();
    setTimeout(()=>v029ShowClassChoice(),80);
  }

  try{v141BuildSettings()}catch(e){}
  return true;
}
"""

new_finalize=old_finalize+"""
function v200LoginReadyFor(user){
  const id=String(user?.id||'');
  if(!id)return false;
  try{
    if(String(v073User?.id||'')!==id)return false;
    if(window.__V200_AUTH_READY__!==true)return false;
    if(String(typeof v075CloudLoadedFor==='undefined'?'':v075CloudLoadedFor||'')!==id)return false;
    if(typeof window.v452AccountVerified==='function'&&!window.v452AccountVerified(id))return false;
    return true;
  }catch(e){return false}
}

async function v200FinalizeAuthenticatedLogin(user){
  const id=String(user?.id||'');
  if(!id)return false;
  let firstError=null;

  try{
    const first=await v200FinalizeUser(user);
    if(first||v200LoginReadyFor(user))return true;
  }catch(e){
    firstError=e;
    console.warn('V4.02 first login finalize failed; waiting for active auth transition',e);
  }

  /* A prior INITIAL_SESSION / token-refresh transition for the same account may still
     be finishing. Do not turn a successful password login into a false auth failure. */
  for(let i=0;i<20;i++){
    if(v200LoginReadyFor(user))return true;
    await new Promise(resolve=>setTimeout(resolve,75));
  }

  /* Confirm the Supabase session is still valid, then retry the SAME canonical
     finalizer once. This replaces the former manual logout + second login workaround. */
  let sessionUser=user;
  try{
    const {data,error}=await v073Db.auth.getSession();
    if(error)throw error;
    const current=data?.session?.user||null;
    if(!current||String(current.id||'')!==id)throw new Error('Anmeldesitzung ist nicht mehr aktiv.');
    sessionUser=current;
  }catch(e){
    if(firstError)throw firstError;
    throw e;
  }

  try{
    const second=await v200FinalizeUser(sessionUser);
    if(second||v200LoginReadyFor(sessionUser))return true;
  }catch(e){
    console.error('V4.02 login finalize retry',e);
    if(firstError)throw firstError;
    throw e;
  }

  if(firstError)throw firstError;
  return false;
}
"""

old_login="""      v200AuthStatus('Anmeldung erfolgreich. Spielstand wird geladen …','success');
      const finalized=await v200FinalizeUser(data.user);
      if(finalized===false)throw new Error('Spielstand konnte nach der Anmeldung nicht geladen werden.');"""

new_login="""      v200AuthStatus('Anmeldung erfolgreich. Spielstand wird geladen …','success');
      const finalized=await v200FinalizeAuthenticatedLogin(data.user);
      if(finalized===false)throw new Error('Spielstand konnte nach der Anmeldung nicht geladen werden.');"""

if s.count(old_finalize)!=1:
    raise SystemExit(f"finalize block matches: {s.count(old_finalize)}")
if s.count(old_login)!=1:
    raise SystemExit(f"email login block matches: {s.count(old_login)}")

s=s.replace(old_finalize,new_finalize,1)
s=s.replace(old_login,new_login,1)

if s==original:
    raise SystemExit("no changes")

p.write_text(s,encoding="utf-8")
print("login bootstrap recovery applied")
