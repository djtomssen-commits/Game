from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
old="""document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(repair),{once:true});
window.addEventListener('pageshow',()=>{
  if(document.getElementById('character')?.classList.contains('active'))requestAnimationFrame(repair);
},{passive:true});
window.addEventListener('growlegends:account-ready',()=>setTimeout(repair,120));"""
new="""document.addEventListener('DOMContentLoaded',repair,{once:true});
window.addEventListener('pageshow',()=>{
  if(document.getElementById('character')?.classList.contains('active'))repair();
},{passive:true});
window.addEventListener('growlegends:account-ready',repair,{passive:true});"""
if old not in c: raise SystemExit("v6117 lifecycle delay block missing")
c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")
checks={
 "dom_raf_removed":"DOMContentLoaded',()=>requestAnimationFrame(repair)" not in c,
 "pageshow_raf_removed":"contains('active'))requestAnimationFrame(repair)" not in c,
 "account_delay_removed":"growlegends:account-ready',()=>setTimeout(repair,120)" not in c,
 "equip_hooks_kept":"['equip','unequip','sellEquipped'].forEach(wrap)" in c,
 "forge_hook_kept":"v488ForgeRender.__v6117Passive" in c,
 "nav_hook_kept":"__v6117Go='v7119-event'" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps(checks))
Path("V8009_FINAL_V6117_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-V6117-QA",
 "checks":checks,
 "scope":"class-passive lifecycle only; equip/unequip/forge behavior unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("v6117 lifecycle consolidated")