from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="[200,800,2200,5000].forEach(ms=>setTimeout(()=>{stamp();paint()},ms));"
if old not in c: raise SystemExit("resource paint train missing")
c=c.replace(old,"window.addEventListener('growlegends:account-ready',()=>{stamp();paint()},{passive:true});",1);changed["resourcePaint"]=1

old="window.addEventListener('growlegends:account-ready',()=>setTimeout(paint,100));\n[250,1000,3000].forEach(ms=>setTimeout(paint,ms));"
new="window.addEventListener('growlegends:account-ready',paint,{passive:true});"
if old not in c: raise SystemExit("progression paint train missing")
c=c.replace(old,new,1);changed["progressionPaint"]=1

old=" setTimeout(sync,0);setTimeout(sync,250);setTimeout(sync,1200);"
if old not in c: raise SystemExit("settings sync startup train missing")
c=c.replace(old," window.addEventListener('growlegends:account-ready',sync,{passive:true});",1);changed["settingsSync"]=1

p.write_text(c,encoding="utf-8")
checks={
 "resource_train_removed":"[200,800,2200,5000].forEach(ms=>setTimeout(()=>{stamp();paint()},ms))" not in c,
 "resource_pageshow_kept":"window.addEventListener('pageshow',()=>{stamp();paint()}" in c,
 "progression_train_removed":"[250,1000,3000].forEach(ms=>setTimeout(paint,ms))" not in c,
 "progression_account_delay_removed":"account-ready',()=>setTimeout(paint,100)" not in c,
 "projection_math_kept":"targetDays:{casual:projectedDays(250),normal:projectedDays(330),veryActive:projectedDays(500)}" in c,
 "settings_train_removed":"setTimeout(sync,0);setTimeout(sync,250);setTimeout(sync,1200)" not in c,
 "settings_admin_hook_kept":"v093CheckAdmin=async function(){const r=await base.apply(this,arguments);sync();return r}" in c,
 "settings_build_hook_kept":"v141BuildSettings=function(){const r=base.apply(this,arguments);requestAnimationFrame(sync);return r}" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH11_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH11-QA",
 "changed":changed,
 "checks":checks,
 "scope":"passive resource/progression/settings startup repaint lifecycle only; progression math/admin hooks preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))