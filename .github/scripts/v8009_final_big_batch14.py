from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""  /* Do not wrap render(), persist(), or resource painters.
     Refresh only after normal navigation and a few one-shot boot passes. */
  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    requestAnimationFrame(()=>{build();update()});
    return r;
  };"""
new="""  /* V8.009: shared navigation owns header refresh; no v032Go wrapper. */
  window.addEventListener('growlegends:navigation-open-v7119',()=>{build();update()},{passive:true});"""
if old not in c: raise SystemExit("v358 nav wrapper block missing")
c=c.replace(old,new,1);changed["v358Nav"]=1

old="""  build();
  version();
  document.addEventListener('DOMContentLoaded',()=>{build();version()},{once:true});
  setTimeout(()=>{build();update();version()},300);
  setTimeout(()=>{build();update();version()},1200);
  setTimeout(()=>{build();update();version()},2500);"""
new="""  build();
  version();
  document.addEventListener('DOMContentLoaded',()=>{build();version()},{once:true});
  window.addEventListener('pageshow',()=>{build();update();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{build();update();version()},{passive:true});"""
if old not in c: raise SystemExit("v358 startup block missing")
c=c.replace(old,new,1);changed["v358Startup"]=1

old="""  /* Keep this isolated from render/persist. Run only after navigation/boot. */
  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    requestAnimationFrame(fix);
    return r;
  };"""
new="""  /* V8.009: shared navigation owns header fix; no v032Go wrapper. */
  window.addEventListener('growlegends:navigation-open-v7119',fix,{passive:true});"""
if old not in c: raise SystemExit("v359 nav wrapper block missing")
c=c.replace(old,new,1);changed["v359Nav"]=1

old="""  fix();version();
  document.addEventListener('DOMContentLoaded',()=>{fix();version()},{once:true});
  setTimeout(()=>{fix();version()},250);
  setTimeout(()=>{fix();version()},900);
  setTimeout(()=>{fix();version()},1800);"""
new="""  fix();version();
  document.addEventListener('DOMContentLoaded',()=>{fix();version()},{once:true});
  window.addEventListener('pageshow',()=>{fix();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{fix();version()},{passive:true});"""
if old not in c: raise SystemExit("v359 startup block missing")
c=c.replace(old,new,1);changed["v359Startup"]=1

old="""document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(bindDock),{once:true});
window.addEventListener('pageshow',()=>requestAnimationFrame(bindDock),{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(bindDock,100));

try{
  if(typeof v032Go==='function'&&!window.__v6100Go){
    const base=v032Go;
    v032Go=function(id){
      const r=base.apply(this,arguments);
      if(id==='world')requestAnimationFrame(bindDock);
      return r;
    };
    try{window.v032Go=v032Go}catch(_){}
    window.__v6100Go=true;
  }
}catch(_){}"""
new="""document.addEventListener('DOMContentLoaded',bindDock,{once:true});
window.addEventListener('pageshow',bindDock,{passive:true});
window.addEventListener('growlegends:account-ready',bindDock,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world')bindDock()},{passive:true});
window.__v6100Go='v7119-event';"""
if old not in c: raise SystemExit("v6100 dock lifecycle block missing")
c=c.replace(old,new,1);changed["v6100"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v358_go_wrapper_removed":"const baseGo=v032Go;\n  v032Go=function(id){\n    const r=baseGo.apply(this,arguments);\n    requestAnimationFrame(()=>{build();update()})" not in c,
 "v358_startup_delays_removed":"setTimeout(()=>{build();update();version()},2500)" not in c,
 "v358_shared_nav_present":"navigation-open-v7119',()=>{build();update()}" in c,
 "v359_go_wrapper_removed":"requestAnimationFrame(fix);\n    return r;" not in c[c.find("function fix()"):c.find("v361-header-mobile-fit")],
 "v359_startup_delays_removed":"setTimeout(()=>{fix();version()},1800)" not in c[c.find("function fix()"):c.find("v361-header-mobile-fit")],
 "v359_shared_nav_present":"navigation-open-v7119',fix" in c,
 "v6100_wrapper_removed":"if(typeof v032Go==='function'&&!window.__v6100Go)" not in c,
 "v6100_shared_nav_present":"window.__v6100Go='v7119-event'" in c,
 "v6100_direct_lifecycle":"DOMContentLoaded',bindDock" in c and "pageshow',bindDock" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH14_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH14-QA",
 "changed":changed,
 "checks":checks,
 "scope":"active header/dock presentation navigation lifecycle only; resource values/gameplay/navigation semantics unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))