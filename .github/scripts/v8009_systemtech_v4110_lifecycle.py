from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")

old=""" stamp();[0,120,600,1800,5000,12000,30000,60000].forEach(ms=>setTimeout(guard,ms));window.addEventListener('pageshow',guard,{passive:true});document.addEventListener('visibilitychange',()=>!document.hidden&&guard(),{passive:true});"""

new=""" stamp();guard();window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='systemtech')guard()},{passive:true});window.addEventListener('pageshow',guard,{passive:true});document.addEventListener('visibilitychange',()=>!document.hidden&&guard(),{passive:true});"""

if old not in c:
    raise SystemExit("v4110 startup guard fanout missing")

c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")

checks={
 "startup_fanout_removed":"[0,120,600,1800,5000,12000,30000,60000]" not in c,
 "initial_guard_kept":"stamp();guard();" in c,
 "systemtech_nav_hook_present":"id||'')==='systemtech')guard()" in c,
 "pageshow_kept":"window.addEventListener('pageshow',guard" in c,
 "visibility_kept":"visibilitychange" in c and "guard()" in c,
}
if not all(checks.values()):
    raise SystemExit("v4110 QA failed: "+json.dumps(checks))

Path("V8009_SYSTEMTECH_V4110_LIFECYCLE_QA.json").write_text(json.dumps({
 "build":"V8.009-SYSTEMTECH-V4110-LIFECYCLE-QA",
 "checks":checks,
 "scope":"visibility recovery lifecycle only; QA/admin logic unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("retired v4110 startup guard fanout")
