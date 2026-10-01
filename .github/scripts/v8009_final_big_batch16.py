from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""  /* No render/persist hooks, no observer, no interval.
     The header only receives a few one-shot refreshes plus navigation refresh. */
  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    requestAnimationFrame(update);
    return r;
  };

  update();
  document.addEventListener('DOMContentLoaded',update,{once:true});
  window.addEventListener('pageshow',update,{passive:true});
  window.addEventListener('growlegends:account-ready',update,{passive:true});"""
new="""  /* Shared navigation owns passive header refreshes. */
  update();
  document.addEventListener('DOMContentLoaded',update,{once:true});
  window.addEventListener('pageshow',update,{passive:true});
  window.addEventListener('growlegends:account-ready',update,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',update,{passive:true});"""
if old not in c: raise SystemExit("v362 navigation wrapper block missing")
c=c.replace(old,new,1);changed["v362"]=1

old="""  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    requestAnimationFrame(paint);
    return r;
  };

  paint();
  document.addEventListener('DOMContentLoaded',paint,{once:true});
  setTimeout(paint,300);
  setTimeout(paint,1400);"""
new="""  paint();
  document.addEventListener('DOMContentLoaded',paint,{once:true});
  window.addEventListener('pageshow',paint,{passive:true});
  window.addEventListener('growlegends:account-ready',paint,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',paint,{passive:true});"""
if old not in c: raise SystemExit("v372 navigation/startup block missing")
c=c.replace(old,new,1);changed["v372"]=1

old="""  /* Close settings when navigating or when clicking outside it/gear. */
  const baseGo=v032Go;
  v032Go=function(id){
    closeSettings();
    const r=baseGo.apply(this,arguments);
    requestAnimationFrame(bindGear);
    return r;
  };"""
new="""  /* Close settings on shared navigation; refresh the gear from the same lifecycle. */
  window.addEventListener('growlegends:navigation-open-v7119',()=>{closeSettings();bindGear()},{passive:true});"""
if old not in c: raise SystemExit("v377 navigation wrapper missing")
c=c.replace(old,new,1)

old="""  bindGear();version();
  document.addEventListener('DOMContentLoaded',()=>{bindGear();version()},{once:true});
  setTimeout(()=>{bindGear();version()},300);
  setTimeout(()=>{bindGear();version()},1400);"""
new="""  bindGear();version();
  document.addEventListener('DOMContentLoaded',()=>{bindGear();version()},{once:true});
  window.addEventListener('pageshow',()=>{bindGear();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{bindGear();version()},{passive:true});"""
if old not in c: raise SystemExit("v377 startup retry block missing")
c=c.replace(old,new,1);changed["v377"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v362_go_wrapper_removed":"const baseGo=v032Go;\n  v032Go=function(id){\n    const r=baseGo.apply(this,arguments);\n    requestAnimationFrame(update);" not in c,
 "v362_shared_nav":"growlegends:navigation-open-v7119',update" in c,
 "v372_go_wrapper_removed":"requestAnimationFrame(paint);\n    return r;" not in c,
 "v372_startup_delays_removed":"setTimeout(paint,300);" not in c and "setTimeout(paint,1400);" not in c,
 "v372_shared_nav":"growlegends:navigation-open-v7119',paint" in c,
 "v377_go_wrapper_removed":"const baseGo=v032Go;\n  v032Go=function(id){\n    closeSettings();" not in c,
 "v377_shared_nav":"growlegends:navigation-open-v7119',()=>{closeSettings();bindGear()}" in c,
 "v377_startup_delays_removed":"setTimeout(()=>{bindGear();version()},300);" not in c and "setTimeout(()=>{bindGear();version()},1400);" not in c,
 "v377_click_outside_kept":"if(menu.contains(e.target)||gear?.contains(e.target))return;" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH16_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH16-QA",
 "changed":changed,
 "checks":checks,
 "scope":"legacy header/settings navigation repaint lifecycle only; settings close behavior and gameplay unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))