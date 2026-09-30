from pathlib import Path
import json

beta_path = Path("beta.html")
beta = beta_path.read_text(encoding="utf-8")
original = beta

def replace_once(old, new, label):
    global beta
    count = beta.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, got {count}")
    beta = beta.replace(old, new, 1)

replace_once(
"""async function v200FinalizeUser(user){
  if(!user || user.is_anonymous || v200Deleting || window.__V301_LOGOUT_IN_PROGRESS__)return false;""",
"""async function v200FinalizeUser(user){
  if(!user || user.is_anonymous || v200Deleting || window.__V301_LOGOUT_IN_PROGRESS__ || window.__V4136_LOGOUT_PREPARING__)return false;""",
"finalize guard",
)

replace_once(
"""async function v200EmailAuth(){
  if(v200AuthBusy)return;""",
"""async function v200EmailAuth(){
  if(v200AuthBusy)return;
  if(window.__V301_LOGOUT_IN_PROGRESS__ || window.__V4136_LOGOUT_PREPARING__){
    v200AuthStatus('Abmeldung wird abgeschlossen …');
    return;
  }""",
"email auth guard",
)

replace_once(
"""async function v200GoogleAuth(){
  if(v200AuthBusy)return;""",
"""async function v200GoogleAuth(){
  if(v200AuthBusy)return;
  if(window.__V301_LOGOUT_IN_PROGRESS__ || window.__V4136_LOGOUT_PREPARING__){
    v200AuthStatus('Abmeldung wird abgeschlossen …');
    return;
  }""",
"google auth guard",
)

replace_once(
"""    if(window.__V301_LOGOUT_IN_PROGRESS__ && event!=='SIGNED_OUT')return;""",
"""    if((window.__V301_LOGOUT_IN_PROGRESS__ || window.__V4136_LOGOUT_PREPARING__) && event!=='SIGNED_OUT')return;""",
"auth listener transition guard",
)

replace_once(
"""      v200AuthStatus('Anmeldung erfolgreich. Spielstand wird geladen …','success');
      await v200FinalizeUser(data.user);""",
"""      v200AuthStatus('Anmeldung erfolgreich. Spielstand wird geladen …','success');
      const finalized=await v200FinalizeUser(data.user);
      if(finalized===false)throw new Error('Spielstand konnte nach der Anmeldung nicht geladen werden.');""",
"email finalize result",
)

replace_once(
"""  if(typeof v136Logout==='function'){
   const baseLogout=v136Logout;
   v136Logout=async function(reason='manual'){
    const id=uid();if(id&&complete(s)&&owned(s,id,false)&&window.__V200_AUTH_READY__===true){
     const ok=await directCloudWrite(id);if(!ok){try{v063Toast('Abmelden gestoppt','error','Der Account-Spielstand konnte noch nicht bestätigt gespeichert werden.')}catch(e){};return false}
     window.__V4136_NEW_CHARACTER_PENDING__=null;
    }
    return await baseLogout.apply(this,arguments);
   };
   try{window.v136Logout=v136Logout}catch(e){}
  }""",
"""  if(typeof v136Logout==='function'){
   const baseLogout=v136Logout;
   let logoutPromise=null;
   v136Logout=function(reason='manual'){
    if(logoutPromise)return logoutPromise;
    const self=this,args=arguments;
    window.__V4136_LOGOUT_PREPARING__=true;
    try{v200AuthBusy=true}catch(_){}
    logoutPromise=(async()=>{
     try{
      const id=uid();if(id&&complete(s)&&owned(s,id,false)&&window.__V200_AUTH_READY__===true){
       const ok=await directCloudWrite(id);if(!ok){try{v063Toast('Abmelden gestoppt','error','Der Account-Spielstand konnte noch nicht bestätigt gespeichert werden.')}catch(e){};return false}
       window.__V4136_NEW_CHARACTER_PENDING__=null;
      }
      return await baseLogout.apply(self,args);
     }finally{
      window.__V4136_LOGOUT_PREPARING__=false;
      try{if(!window.__V301_LOGOUT_IN_PROGRESS__)v200AuthBusy=false}catch(_){}
     }
    })().finally(()=>{logoutPromise=null});
    return logoutPromise;
   };
   try{window.v136Logout=v136Logout}catch(e){}
  }""",
"canonical logout serialization",
)

if beta == original:
    raise SystemExit("No changes made")

beta_path.write_text(beta, encoding="utf-8")

report = {
    "phase": "V8.009-AUTH-IDLE-LOGIN-RACE-FIX",
    "scope": "beta-only",
    "cause": "10-minute idle logout could still be saving/signing out while a new login began",
    "changes": [
        "serialize the existing v4136 canonical logout owner with one in-flight promise",
        "mark logout preparation before directCloudWrite begins",
        "block email/google/finalize/auth-listener login paths during logout preparation",
        "treat finalize=false after email sign-in as a failed login instead of silent success",
    ],
    "new_renderers": 0,
    "new_render_wrappers": 0,
    "new_timers": 0,
    "new_mutation_observers": 0,
    "stable_changed": False,
}
Path("V8009_AUTH_IDLE_LOGIN_RACE_FIX.json").write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
