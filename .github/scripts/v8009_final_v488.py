from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
old="""  try{
    if(typeof v032Go==='function'&&!window.__v488Go){const base=v032Go;v032Go=function(id){ensureScreen();const r=base.apply(this,arguments);ensureMenu();if(id==='forge')renderForge();if(id==='world'){setTimeout(ensureHomeLink,20);setTimeout(ensureHomeLink,140)}stamp();return r};try{window.v032Go=v032Go}catch(e){}window.__v488Go=true}
  }catch(e){}"""
new="""  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    ensureScreen();ensureMenu();
    if(id==='forge')renderForge();
    if(id==='world')ensureHomeLink();
    paintPrismaticInventory();stamp();
  },{passive:true});
  window.__v488Go='v7119-event';"""
if old not in c: raise SystemExit("v488 go wrapper missing")
c=c.replace(old,new,1)
old2="""  [250,900,2200,5200,10200,16200].forEach(ms=>setTimeout(()=>{ensureMenu();ensureHomeLink();paintPrismaticInventory();stamp()},ms));"""
if old2 not in c: raise SystemExit("v488 retry train missing")
c=c.replace(old2,"  /* V8.009: delayed startup repair train retired; direct lifecycle owns UI. */",1)
p.write_text(c,encoding="utf-8")
checks={
 "go_wrapper_removed":"if(typeof v032Go==='function'&&!window.__v488Go)" not in c,
 "shared_nav_hook_present":"window.__v488Go='v7119-event'" in c,
 "startup_train_removed":"[250,900,2200,5200,10200,16200]" not in c,
 "forge_render_kept":"window.v488ForgeRender=renderForge" in c,
 "prismatic_inventory_kept":"paintPrismaticInventory" in c,
 "combat_bonus_kept":"v488TotalAttr" in c,
 "sell_rules_kept":"v488SellValue" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps(checks))
Path("V8009_FINAL_V488_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-V488-QA",
 "checks":checks,
 "scope":"forge navigation/startup lifecycle only; crafting, prism stats, costs and sell rules unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("v488 lifecycle consolidated")