from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="[150,650,1600].forEach(ms=>setTimeout(updateBars,ms));[1000,3000,7000].forEach(ms=>setTimeout(flushPending,ms));"
new="window.addEventListener('growlegends:account-ready',updateBars,{passive:true});[1000,3000,7000].forEach(ms=>setTimeout(flushPending,ms));"
if old not in c: raise SystemExit("v480 updateBars/flushPending line missing")
c=c.replace(old,new,1);changed["autoBars"]=1

old="[120,900,2600].forEach(ms=>setTimeout(()=>{stamp();installMenu()},ms)); /* V4.123: long obsolete version/menu fan-out retired. */"
if old not in c: raise SystemExit("v4107 installMenu retry line missing")
c=c.replace(old,"window.addEventListener('growlegends:account-ready',()=>{stamp();installMenu()},{passive:true});",1);changed["systemMenu"]=1

old="window.addEventListener('growlegends:account-ready',()=>setTimeout(repairTower,100));\n[0,250,800].forEach(ms=>setTimeout(repairTower,ms));"
new="window.addEventListener('growlegends:account-ready',repairTower,{passive:true});\nwindow.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='tower')repairTower()},{passive:true});"
if old not in c: raise SystemExit("tower repair startup block missing")
c=c.replace(old,new,1);changed["towerSummoner"]=1

old="[0,180,700].forEach(ms=>setTimeout(repair,ms));"
if old not in c: raise SystemExit("companion position startup train missing")
c=c.replace(old,"window.addEventListener('growlegends:account-ready',repair,{passive:true});",1);changed["companionPosition"]=1

p.write_text(c,encoding="utf-8")
checks={
 "updateBars_train_removed":"[150,650,1600].forEach(ms=>setTimeout(updateBars,ms))" not in c,
 "flushPending_train_kept":"[1000,3000,7000].forEach(ms=>setTimeout(flushPending,ms))" in c,
 "system_menu_train_removed":"[120,900,2600].forEach(ms=>setTimeout(()=>{stamp();installMenu()},ms))" not in c,
 "power_drift_guard_kept":"POWER_NAVIGATION_DRIFT" in c,
 "tower_train_removed":"[0,250,800].forEach(ms=>setTimeout(repairTower,ms))" not in c,
 "tower_click_followup_kept":"setTimeout(repairTower,40)" in c,
 "companion_train_removed":"[0,180,700].forEach(ms=>setTimeout(repair,ms))" not in c,
 "companion_click_followup_kept":"if(hit)setTimeout(repair,40)" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH13_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH13-QA",
 "changed":changed,
 "checks":checks,
 "scope":"passive auto-bar/system-menu/summoner visual startup retries only; recovery/diagnostic/action followups preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))