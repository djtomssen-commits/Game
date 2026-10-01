from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
removed={}

for old,key in [
 ("  [500,1800,5200].forEach(ms=>setTimeout(()=>{repaintHall();stamp()},ms));\n","v438_train"),
 ("  setTimeout(()=>{repaintHall();scheduleSync(true);stamp()},1800);\n","v438_sync_1800"),
 ("  setTimeout(()=>{repaintHall();scheduleSync(true);stamp()},5200);\n","v438_sync_5200"),
 ("  setTimeout(()=>{paintLocalPower();stamp();scheduleSync(true)},600);\n","v446_600"),
 ("  setTimeout(()=>{paintLocalPower();stamp()},1800);\n","v446_1800"),
 ("  setTimeout(()=>{paintLocalPower();stamp();scheduleSync(true)},5200);\n","v446_5200"),
]:
    n=c.count(old);removed[key]=n
    if n<1: raise SystemExit(f"{key} line missing")
    c=c.replace(old,"",1)

anchor438="  window.addEventListener('pageshow',()=>{repaintHall();scheduleSync(true);stamp()},{passive:true});"
add438=anchor438+"\n  window.addEventListener('growlegends:account-ready',()=>{repaintHall();scheduleSync(true);stamp()},{passive:true});"
if anchor438 not in c: raise SystemExit("v438 pageshow anchor missing")
if "growlegends:account-ready',()=>{repaintHall();scheduleSync(true);stamp()}" not in c:
    c=c.replace(anchor438,add438,1)

anchor446="  window.addEventListener('pageshow',()=>{paintLocalPower();stamp();scheduleSync(true)},{passive:true});"
add446=anchor446+"\n  window.addEventListener('growlegends:account-ready',()=>{paintLocalPower();stamp();scheduleSync(true)},{passive:true});"
if anchor446 not in c: raise SystemExit("v446 pageshow anchor missing")
if "growlegends:account-ready',()=>{paintLocalPower();stamp();scheduleSync(true)}" not in c:
    c=c.replace(anchor446,add446,1)

p.write_text(c,encoding="utf-8")
checks={
 "v438_train_removed":"[500,1800,5200].forEach(ms=>setTimeout(()=>{repaintHall();stamp()},ms))" not in c,
 "v438_schedule_debounce_kept":"syncTimer=setTimeout(async()=>{" in c,
 "v438_account_ready_added":"growlegends:account-ready',()=>{repaintHall();scheduleSync(true);stamp()}" in c,
 "v446_startup_delays_removed":"setTimeout(()=>{paintLocalPower();stamp();scheduleSync(true)},5200)" not in c,
 "v446_click_followup_kept":"requestAnimationFrame(paintLocalPower);setTimeout(paintLocalPower,60)" in c,
 "v446_schedule_debounce_kept":"function scheduleSync(force=false)" in c,
 "v446_account_ready_added":"growlegends:account-ready',()=>{paintLocalPower();stamp();scheduleSync(true)}" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"removed":removed,"checks":checks}))
Path("V8009_FINAL_HALL_POWER_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-HALL-POWER-QA",
 "removed":removed,
 "checks":checks,
 "scope":"startup repaint lifecycle only; Hall/profile server sync debounces and click followups preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"removed":removed,"checks":checks}))
