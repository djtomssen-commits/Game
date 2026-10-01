from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="[150,800,1800].forEach(ms=>setTimeout(()=>{stamp();exposeModernHome()},ms));"
if old not in c: raise SystemExit("v477 home retry train missing")
c=c.replace(old,"window.addEventListener('growlegends:account-ready',()=>{stamp();exposeModernHome()},{passive:true});\n  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world'){stamp();exposeModernHome()}},{passive:true});",1);changed["v477Home"]=1

old="function openHarz(){try{v032Go('harzDealer')}catch(_){}requestAnimationFrame(sync);return true}"
new="function openHarz(){try{return v032Go('harzDealer')}catch(_){sync();return true}}"
if old not in c: raise SystemExit("v7117 openHarz RAF missing")
c=c.replace(old,new,1)

old=""" try{v032Go('goldShop')}catch(_){}requestAnimationFrame(sync);return true;"""
new=""" try{return v032Go('goldShop')}catch(_){sync();return true}"""
if old not in c: raise SystemExit("v7117 openGold RAF missing")
c=c.replace(old,new,1)

old="""window.addEventListener('growlegends:navigation-ready',sync,{passive:true});
window.addEventListener('pageshow',sync,{passive:true});
document.addEventListener('DOMContentLoaded',sync,{once:true});
[50,300,900].forEach(ms=>setTimeout(sync,ms));"""
new="""window.addEventListener('growlegends:navigation-ready',sync,{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='harzDealer'||id==='goldShop')sync()},{passive:true});
window.addEventListener('pageshow',sync,{passive:true});
document.addEventListener('DOMContentLoaded',sync,{once:true});"""
if old not in c: raise SystemExit("v7117 lifecycle block missing")
c=c.replace(old,new,1);changed["v7117Dealer"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v477_train_removed":"[150,800,1800].forEach(ms=>setTimeout(()=>{stamp();exposeModernHome()},ms))" not in c,
 "v477_shared_nav_present":"id||'')==='world'){stamp();exposeModernHome()}" in c,
 "v7117_startup_train_removed":"[50,300,900].forEach(ms=>setTimeout(sync,ms))" not in c,
 "v7117_open_rafs_removed":"requestAnimationFrame(sync);return true" not in c,
 "v7117_shared_nav_present":"if(id==='harzDealer'||id==='goldShop')sync()" in c,
 "v7117_menu_owner_kept":"__V7117_MENU_WRAP__" in c,
 "v7119_owner_kept":"__V7119_CHARACTER_NAV_CONSOLIDATION__" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH12_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH12-QA",
 "changed":changed,
 "checks":checks,
 "scope":"home/dealer passive navigation repaint lifecycle only; commerce/gameplay unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))