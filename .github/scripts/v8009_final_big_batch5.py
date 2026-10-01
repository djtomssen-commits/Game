from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="  [100,350,900,1800,4200,8200,12500].forEach(ms=>setTimeout(settle,ms)); /* V4.123: removed useless late clear of already-fired one-shot timeout. */"
if old not in c: raise SystemExit("v470 settle train missing")
c=c.replace(old,"  window.addEventListener('growlegends:account-ready',settle,{passive:true});",1);changed["v470"]=1

old="""  reorder();
  requestAnimationFrame(reorder);
  [150,500,1200].forEach(ms=>setTimeout(reorder,ms));"""
new="""  reorder();
  document.addEventListener('DOMContentLoaded',reorder,{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))reorder()},{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')reorder()},{passive:true});"""
if old not in c: raise SystemExit("v511 reorder train missing")
c=c.replace(old,new,1);changed["v511"]=1

old="[0,120,450,1000,1800].forEach(ms=>setTimeout(()=>{observe();enhance()},ms));"
if old not in c: raise SystemExit("materials enhance train missing")
c=c.replace(old,"window.addEventListener('growlegends:account-ready',()=>{observe();enhance()},{passive:true});",1);changed["materials"]=1

old="[0,100,350,1000,2500].forEach(ms=>setTimeout(ensureButtons,ms));"
new="""ensureButtons();
document.addEventListener('DOMContentLoaded',ensureButtons,{once:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='grow')ensureButtons()},{passive:true});"""
if old not in c: raise SystemExit("grow guide startup train missing")
c=c.replace(old,new,1);changed["growGuide"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v470_train_removed":"[100,350,900,1800,4200,8200,12500]" not in c,
 "v470_observers_kept":"V470_SLOT_OBSERVER" in c and "V470_COMPARE_OBSERVER" in c,
 "v511_train_removed":"[150,500,1200].forEach(ms=>setTimeout(reorder,ms))" not in c,
 "v511_nav_direct":"id||'')==='character')reorder()" in c,
 "materials_train_removed":"[0,120,450,1000,1800].forEach(ms=>setTimeout(()=>{observe();enhance()},ms))" not in c,
 "materials_click_followup_kept":"setTimeout(()=>{observe();enhance()},40)" in c,
 "grow_guide_train_removed":"[0,100,350,1000,2500].forEach(ms=>setTimeout(ensureButtons,ms))" not in c,
 "grow_guide_observer_kept":"new MutationObserver(()=>requestAnimationFrame(ensureButtons))" in c,
 "grow_guide_nav_direct":"id||'')==='grow')ensureButtons()" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH5_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH5-QA",
 "changed":changed,
 "checks":checks,
 "scope":"passive UI startup layout only; action followups and meaningful DOM observers preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))