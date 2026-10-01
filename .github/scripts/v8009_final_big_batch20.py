from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    if(id==='world')requestAnimationFrame(()=>requestAnimationFrame(v351Install));
    return r;
  };

  function version(){
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{
      if(el)el.textContent=V351_VERSION;
    });
  }

  v351Install();version();
  setTimeout(()=>{v351Install();version()},300);
  setTimeout(()=>{v351Install();version()},1100);"""
new="""  function version(){
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{
      if(el)el.textContent=V351_VERSION;
    });
  }

  v351Install();version();
  document.addEventListener('DOMContentLoaded',()=>{v351Install();version()},{once:true});
  window.addEventListener('pageshow',()=>{v351Install();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{v351Install();version()},{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world')v351Install()},{passive:true});"""
if old not in c: raise SystemExit("v351 legacy nav/startup block missing")
c=c.replace(old,new,1);changed["v351"]=1

old="""  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    if(id==='world'){
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        v352CleanWorld();
        v352Version();
      }));
    }
    return r;
  };

  v352CleanWorld();
  v352Version();
  document.addEventListener('DOMContentLoaded',()=>{v352CleanWorld();v352Version()},{once:true});
  setTimeout(()=>{v352CleanWorld();v352Version()},300);
  setTimeout(()=>{v352CleanWorld();v352Version()},1200);"""
new="""  v352CleanWorld();
  v352Version();
  document.addEventListener('DOMContentLoaded',()=>{v352CleanWorld();v352Version()},{once:true});
  window.addEventListener('pageshow',()=>{v352CleanWorld();v352Version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{v352CleanWorld();v352Version()},{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world'){v352CleanWorld();v352Version()}},{passive:true});"""
if old not in c: raise SystemExit("v352 legacy nav/startup block missing")
c=c.replace(old,new,1);changed["v352"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v351_go_wrapper_removed":"const baseGo=v032Go;\n  v032Go=function(id)" not in c[c.find("v351-world-mobile-header-cleanup"):c.find("v352-world-header-ghost-cleanup")],
 "v351_delays_removed":"setTimeout(()=>{v351Install();version()},1100)" not in c,
 "v351_install_wrapper_kept":"v085InstallWorld=function(force)" in c,
 "v352_go_wrapper_removed":"const baseGo=v032Go;\n  v032Go=function(id)" not in c[c.find("v352-world-header-ghost-cleanup"):c.find("v353-world-mobile-polish")],
 "v352_delays_removed":"setTimeout(()=>{v352CleanWorld();v352Version()},1200)" not in c,
 "v352_install_wrapper_kept":"v352CleanWorld();" in c and "v085InstallWorld=function(force)" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH20_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH20-QA",
 "changed":changed,
 "checks":checks,
 "scope":"legacy world UI navigation/startup lifecycle only; world installer remains canonical owner"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))