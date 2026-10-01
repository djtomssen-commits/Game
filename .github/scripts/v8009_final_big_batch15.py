from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    requestAnimationFrame(fix);
    return r;
  };"""
new="""  window.addEventListener('growlegends:navigation-open-v7119',fix,{passive:true});"""
# target the later active header wrapper
anchor=c.find("setTimeout(()=>{fix();version()},300)")
idx=c.rfind(old,0,anchor+1)
if idx<0: raise SystemExit("later header fix wrapper missing")
c=c[:idx]+c[idx:].replace(old,new,1)
changed["headerFix"]=1

old="""  fix();version();
  document.addEventListener('DOMContentLoaded',()=>{fix();version()},{once:true});
  setTimeout(()=>{fix();version()},300);
  setTimeout(()=>{fix();version()},1200);"""
new="""  fix();version();
  document.addEventListener('DOMContentLoaded',()=>{fix();version()},{once:true});
  window.addEventListener('pageshow',()=>{fix();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{fix();version()},{passive:true});"""
if old not in c: raise SystemExit("later header fix startup missing")
c=c.replace(old,new,1)
changed["headerFixStartup"]=1

old="""  const baseGo=v032Go;
  v032Go=function(id){
    const r=baseGo.apply(this,arguments);
    requestAnimationFrame(()=>{align();version()});
    return r;
  };"""
new="""  window.addEventListener('growlegends:navigation-open-v7119',()=>{align();version()},{passive:true});"""
if old not in c: raise SystemExit("header align wrapper missing")
c=c.replace(old,new,1)
changed["headerAlign"]=1

old="""  align();version();
  document.addEventListener('DOMContentLoaded',()=>{align();version()},{once:true});
  setTimeout(()=>{align();version()},300);
  setTimeout(()=>{align();version()},1200);"""
new="""  align();version();
  document.addEventListener('DOMContentLoaded',()=>{align();version()},{once:true});
  window.addEventListener('pageshow',()=>{align();version()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{align();version()},{passive:true});"""
if old not in c: raise SystemExit("header align startup missing")
c=c.replace(old,new,1)
changed["headerAlignStartup"]=1

old="""window.addEventListener('growlegends:account-ready',()=>setTimeout(repairCurrentEnemy,120));
[0,250,900].forEach(ms=>setTimeout(repairCurrentEnemy,ms));"""
new="""window.addEventListener('growlegends:account-ready',repairCurrentEnemy,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='tower')repairCurrentEnemy()},{passive:true});"""
if old not in c: raise SystemExit("harzruferin enemy startup block missing")
c=c.replace(old,new,1)
changed["harzEnemy"]=1

p.write_text(c,encoding="utf-8")
checks={
 "header_fix_wrapper_removed":"requestAnimationFrame(fix);\n    return r;" not in c[c.find("setTimeout(()=>{fix();version()},300)")-3000:] if "setTimeout(()=>{fix();version()},300)" in c else True,
 "header_fix_startup_removed":"setTimeout(()=>{fix();version()},300)" not in c,
 "header_align_wrapper_removed":"requestAnimationFrame(()=>{align();version()})" not in c,
 "header_align_startup_removed":"setTimeout(()=>{align();version()},300)" not in c,
 "harz_enemy_train_removed":"[0,250,900].forEach(ms=>setTimeout(repairCurrentEnemy,ms))" not in c,
 "harz_enemy_click_followup_kept":"setTimeout(repairCurrentEnemy,60)" in c,
 "shared_nav_hooks_present":c.count("growlegends:navigation-open-v7119")>=3,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH15_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH15-QA",
 "changed":changed,
 "checks":checks,
 "scope":"active header/alignment and Harzruferin enemy presentation lifecycle only; action/render behavior preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))