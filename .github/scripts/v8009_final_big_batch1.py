from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

pairs=[
(" stamp();requestAnimationFrame(paintPassive);\n window.addEventListener('growlegends:account-ready',()=>requestAnimationFrame(paintPassive));\n window.addEventListener('pageshow',()=>{stamp();requestAnimationFrame(paintPassive)},{passive:true});",
 " stamp();paintPassive();\n window.addEventListener('growlegends:account-ready',paintPassive,{passive:true});\n window.addEventListener('pageshow',()=>{stamp();paintPassive()},{passive:true});",
 "v4158_direct"),
("[0,80,250,700,1600,3500,8000,15000].forEach(ms=>setTimeout(redecorate,ms));",
 "document.addEventListener('DOMContentLoaded',redecorate,{once:true});\n window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character'||id==='shop')redecorate()},{passive:true});",
 "v4106_direct"),
(" window.addEventListener('growlegends:account-ready',()=>setTimeout(settle,80));\n window.addEventListener('pageshow',()=>setTimeout(settle,0),{passive:true});\n setTimeout(settle,0);setTimeout(settle,600);",
 " window.addEventListener('growlegends:account-ready',settle,{passive:true});\n window.addEventListener('pageshow',settle,{passive:true});\n settle();",
 "v6213_direct"),
("window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{if(document.getElementById('character')?.classList.contains('active'))paintSlots()},100));",
 "window.addEventListener('growlegends:account-ready',()=>{if(document.getElementById('character')?.classList.contains('active'))paintSlots()},{passive:true});",
 "v6102_direct"),
("  if(el.closest('[data-screen=\"character\"],[data-go=\"character\"],#character'))setTimeout(syncAvatarTitle,80);",
 "  /* Character navigation is owned by growlegends:navigation-open-v7119 below. */",
 "v6339_nav_delay_removed"),
]
for old,new,key in pairs:
    n=c.count(old);changed[key]=n
    if n<1: raise SystemExit(f"{key} anchor missing")
    c=c.replace(old,new,1)

p.write_text(c,encoding="utf-8")
checks={
 "v4158_passive_direct":changed["v4158_direct"]==1,
 "v4106_startup_train_removed":"[0,80,250,700,1600,3500,8000,15000]" not in c,
 "v4106_nav_direct":"if(id==='character'||id==='shop')redecorate()" in c,
 "v6213_settle_delays_removed":"setTimeout(settle,600)" not in c and "setTimeout(settle,80)" not in c,
 "v6102_account_delay_removed":"paintSlots()},100)" not in c,
 "v6339_char_delay_removed":"setTimeout(syncAvatarTitle,80)" not in c,
 "v6339_select_defer_kept":"setTimeout(syncAvatarTitle,0)" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH1_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH1-QA",
 "changed":changed,
 "checks":checks,
 "scope":"passive UI lifecycle cleanup only; action-order defers and gameplay remain unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))