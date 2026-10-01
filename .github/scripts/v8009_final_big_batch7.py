from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="[0,120,400,900,1800].forEach(ms=>setTimeout(()=>{observe();enhance()},ms));"
if old not in c: raise SystemExit("materials legacy train missing")
c=c.replace(old,"window.addEventListener('growlegends:account-ready',()=>{observe();enhance()},{passive:true});",1);changed["materialsLegacy"]=1

old="[0,80,220,600,1400].forEach(ms=>setTimeout(schedule,ms));"
if old not in c: raise SystemExit("frost weapon startup train missing")
c=c.replace(old,"window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')schedule()},{passive:true});",1);changed["frostWeapon"]=1

old="[0,250,900,2200,5000].forEach(ms=>setTimeout(()=>{attach();queueMount();stamp()},ms));"
if old not in c: raise SystemExit("grow tabs startup train missing")
c=c.replace(old,"window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='grow'){attach();queueMount();stamp()}},{passive:true});",1);changed["growTabs"]=1

old="[0,250,1000,3000].forEach(ms=>setTimeout(prepareCard,ms));"
if old not in c: raise SystemExit("worldboss card startup train missing")
c=c.replace(old,"window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world')prepareCard()},{passive:true});",1);changed["worldBossCard"]=1

p.write_text(c,encoding="utf-8")
checks={
 "materials_train_removed":"[0,120,400,900,1800].forEach(ms=>setTimeout(()=>{observe();enhance()},ms))" not in c,
 "materials_click_followup_kept":"setTimeout(()=>{observe();enhance()},30)" in c,
 "frost_train_removed":"[0,80,220,600,1400].forEach(ms=>setTimeout(schedule,ms))" not in c,
 "frost_account_hook_kept":"growlegends:account-ready',()=>{schedule();setTimeout(schedule,120);setTimeout(schedule,500)}" in c,
 "grow_tabs_train_removed":"[0,250,900,2200,5000].forEach(ms=>setTimeout(()=>{attach();queueMount();stamp()},ms))" not in c,
 "grow_tabs_observer_kept":"new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;queueMount()})})" in c,
 "grow_action_retries_kept":"[40,180,600,1600,4200].forEach(ms=>setTimeout(refreshActive,ms))" in c,
 "worldboss_train_removed":"[0,250,1000,3000].forEach(ms=>setTimeout(prepareCard,ms))" not in c,
 "worldboss_observer_kept":"new MutationObserver(refresh).observe(document.getElementById('world')" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH7_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH7-QA",
 "changed":changed,
 "checks":checks,
 "scope":"passive startup retries only; dynamic DOM/action observers and gameplay behavior preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))