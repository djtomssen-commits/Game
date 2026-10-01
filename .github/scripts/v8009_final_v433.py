from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
old="""  if(typeof v032Go==='function'&&!window.__v433GoWrapped){
    const baseGo=v032Go;
    v032Go=function(){
      const r=baseGo.apply(this,arguments);
      requestAnimationFrame(()=>{paintResources();stamp()});
      setTimeout(()=>{paintResources();stamp()},80);
      return r;
    };
    window.__v433GoWrapped=true;
  }

  function stamp(){}

  paintResources();stamp();
  /* V6.217: legacy 250ms startup poll retired; targeted retries are enough. */
  [250,1200,4200].forEach(ms=>setTimeout(()=>{paintResources();stamp()},ms));
  document.addEventListener('DOMContentLoaded',()=>{repairDungeonState(true);paintResources();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{repairDungeonState(true);paintResources();stamp()},{passive:true});
  setTimeout(()=>{repairDungeonState(true);paintResources();stamp()},1000);
  setTimeout(()=>{repairDungeonState(true);paintResources();stamp()},4200);"""
new="""  window.addEventListener('growlegends:navigation-open-v7119',()=>{paintResources();stamp()},{passive:true});
  window.__v433GoWrapped='v7119-event';

  function stamp(){}

  paintResources();stamp();
  document.addEventListener('DOMContentLoaded',()=>{repairDungeonState(true);paintResources();stamp()},{once:true});
  window.addEventListener('pageshow',()=>{repairDungeonState(true);paintResources();stamp()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{repairDungeonState(true);paintResources();stamp()},{passive:true});"""
if old not in c: raise SystemExit("v433 legacy navigation/startup block missing")
c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")
checks={
 "go_wrapper_removed":"const baseGo=v032Go" not in c[c.find("v433-dungeon-resource-consistency"):c.find("v434-attribute-points-final-live-sync")],
 "shared_nav_hook_present":"window.__v433GoWrapped='v7119-event'" in c,
 "startup_retry_train_removed":"[250,1200,4200].forEach(ms=>setTimeout(()=>{paintResources();stamp()},ms))" not in c,
 "dungeon_state_delayed_retries_removed":"setTimeout(()=>{repairDungeonState(true);paintResources();stamp()},1000)" not in c and "setTimeout(()=>{repairDungeonState(true);paintResources();stamp()},4200)" not in c,
 "persist_integrity_kept":"guardNewCompletion();" in c and "repairDungeonState(false);" in c,
 "attempt_owner_kept":"consumeDungeonAttempt=async function()" in c,
 "account_ready_direct_present":"growlegends:account-ready" in c and "repairDungeonState(true);paintResources();stamp()" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps(checks))
Path("V8009_FINAL_V433_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-V433-QA",
 "checks":checks,
 "scope":"navigation/startup lifecycle only; dungeon integrity, attempt spending and persistence guards unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("v433 lifecycle consolidated")