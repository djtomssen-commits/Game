from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

repls=[
("  setTimeout(()=>{bindShop();settle();stamp()},1000);\n  setTimeout(()=>{bindShop();settle();stamp()},5000);\n  setTimeout(()=>{bindShop();settle();stamp()},11000);",
 "  window.addEventListener('growlegends:account-ready',()=>{bindShop();settle();stamp()},{passive:true});","v441"),
("  [250,900,2200,5200].forEach(ms=>setTimeout(()=>{normalize();stamp()},ms)); /* V4.123: removed useless late clear of already-fired one-shot timeout. */",
 "  window.addEventListener('growlegends:account-ready',()=>{normalize();stamp()},{passive:true});","v455"),
("  [250,900,2200,5200].forEach(ms=>setTimeout(()=>{maxLevelUi();stamp()},ms)); /* V4.123: removed useless late clear of already-fired one-shot timeout. */",
 "  window.addEventListener('growlegends:account-ready',()=>{maxLevelUi();stamp()},{passive:true});","v456"),
("  [250,700,1400,3000,6200,10500,13500].forEach(ms=>setTimeout(()=>{layout();compactInventory();stamp()},ms));",
 "  window.addEventListener('growlegends:account-ready',()=>{layout();compactInventory();updateHero();stamp()},{passive:true});","v459"),
("  [250,1200,2600].forEach(ms=>setTimeout(bootDecorate,ms));",
 "  window.addEventListener('growlegends:account-ready',bootDecorate,{passive:true});","v466"),
("  [80,500,1400].forEach(ms=>setTimeout(()=>{stamp();queue()},ms));",
 "  window.addEventListener('growlegends:account-ready',()=>{stamp();queue()},{passive:true});","v475"),
]
for old,new,key in repls:
    n=c.count(old);changed[key]=n
    if n<1: raise SystemExit(f"{key} anchor missing")
    c=c.replace(old,new,1)

p.write_text(c,encoding="utf-8")
checks={
 "v441_delays_removed":"bindShop();settle();stamp()},11000" not in c,
 "v455_train_removed":"[250,900,2200,5200].forEach(ms=>setTimeout(()=>{normalize();stamp()},ms))" not in c,
 "v456_train_removed":"[250,900,2200,5200].forEach(ms=>setTimeout(()=>{maxLevelUi();stamp()},ms))" not in c,
 "v459_train_removed":"[250,700,1400,3000,6200,10500,13500]" not in c,
 "v459_render_hooks_kept":"__v459InventoryWrapped" in c and "__v459TalentWrapped" in c and "__v459RenderWrapped" in c,
 "v466_train_removed":"[250,1200,2600].forEach(ms=>setTimeout(bootDecorate,ms))" not in c,
 "v466_render_hooks_kept":"__v466RenderWrapped" in c and "__v466ShopWrapped" in c,
 "v475_train_removed":"[80,500,1400].forEach(ms=>setTimeout(()=>{stamp();queue()},ms))" not in c,
 "v475_nav_hook_kept":"__v475GoWrapped='v7120-event'" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH6_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH6-QA",
 "changed":changed,
 "checks":checks,
 "scope":"legacy passive UI startup retries only; canonical render/navigation/state hooks preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))