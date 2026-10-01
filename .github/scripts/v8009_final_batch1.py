from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")

old_shop="""  [160,550,1300,3200,6500,10500,15000,19000].forEach(ms=>setTimeout(()=>{try{arrange();stamp()}catch(e){}},ms));"""
new_shop="""  /* V8.009: startup arrange fan-out retired; shop navigation/render owns layout. */"""
if old_shop not in c: raise SystemExit("shop startup fanout missing")
c=c.replace(old_shop,new_shop,1)

old_char=""" document.addEventListener('click',e=>{if(e.target?.closest?.('#v459CharacterTabs [data-tab="attributes"]'))requestAnimationFrame(paint)},true);
 document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(paint),{once:true});
 window.addEventListener('pageshow',()=>requestAnimationFrame(paint),{passive:true});"""
new_char=""" document.addEventListener('click',e=>{if(e.target?.closest?.('#v459CharacterTabs [data-tab="attributes"]'))paint()},true);
 document.addEventListener('DOMContentLoaded',paint,{once:true});
 window.addEventListener('pageshow',paint,{passive:true});"""
if old_char not in c: raise SystemExit("v4140 lifecycle RAF block missing")
c=c.replace(old_char,new_char,1)

p.write_text(c,encoding="utf-8")
checks={
 "shop_retry_train_removed":"[160,550,1300,3200,6500,10500,15000,19000]" not in c,
 "shop_nav_owner_kept":"V7.120 shop navigation refresh" in c,
 "character_lifecycle_rafs_removed":"DOMContentLoaded',()=>requestAnimationFrame(paint)" not in c and "pageshow',()=>requestAnimationFrame(paint)" not in c,
 "character_direct_nav_kept":"id||'')==='character')paint()" in c,
 "attribute_spend_raf_kept":"incAttr(k)" in c and "requestAnimationFrame(paint)" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps(checks))
Path("V8009_FINAL_BATCH1_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BATCH1-QA",
 "checks":checks,
 "scope":"shop startup layout + character attribute lifecycle only; purchases/attribute spending unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("final batch1 applied")
