from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
counts={}

pairs=[
("window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')requestAnimationFrame(apply)});",
 "window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')apply()});",
 "char_apply_nav"),
("document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(apply),{once:true});",
 "document.addEventListener('DOMContentLoaded',apply,{once:true});",
 "char_apply_dom"),
("window.addEventListener('pageshow',()=>requestAnimationFrame(apply),{passive:true});",
 "window.addEventListener('pageshow',apply,{passive:true});",
 "char_apply_pageshow"),
("document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(paintSlots),{once:true});",
 "document.addEventListener('DOMContentLoaded',paintSlots,{once:true});",
 "equipment_dom"),
("window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))requestAnimationFrame(paintSlots)},{passive:true});",
 "window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))paintSlots()},{passive:true});",
 "equipment_pageshow"),
]
for old,new,key in pairs:
    n=c.count(old);counts[key]=n
    if n<1: raise SystemExit(f"{key} anchor missing")
    c=c.replace(old,new)

p.write_text(c,encoding="utf-8")
checks={
 "apply_nav_converted":counts["char_apply_nav"]>=2,
 "apply_dom_converted":counts["char_apply_dom"]>=2,
 "apply_pageshow_converted":counts["char_apply_pageshow"]>=2,
 "equipment_dom_converted":counts["equipment_dom"]>=1,
 "equipment_pageshow_converted":counts["equipment_pageshow"]>=1,
 "tab_action_rafs_kept":"[data-tab=\"talents\"]'))requestAnimationFrame(apply)" in c or "requestAnimationFrame(apply)" in c,
 "equipment_action_rafs_kept":"requestAnimationFrame(paintSlots)" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"counts":counts,"checks":checks}))
Path("V8009_FINAL_CHARACTER_LIFECYCLE_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-CHARACTER-LIFECYCLE-QA",
 "counts":counts,
 "checks":checks,
 "scope":"passive character open/resume paints only; action-followup paints unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(counts))