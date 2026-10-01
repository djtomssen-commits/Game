from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""  repaintHall();
  scheduleSync(true);
  document.addEventListener('DOMContentLoaded',()=>{repaintHall();scheduleSync(true);stamp()},{once:true});
  window.addEventListener('pageshow',()=>{repaintHall();scheduleSync(true);stamp()},{passive:true});
  [500,1800,5200].forEach(ms=>setTimeout(()=>{repaintHall();stamp()},ms));
  setTimeout(()=>{repaintHall();scheduleSync(true);stamp()},1800);
  setTimeout(()=>{repaintHall();scheduleSync(true);stamp()},5200);"""
new="""  repaintHall();
  scheduleSync(true);
  document.addEventListener('DOMContentLoaded',()=>{repaintHall();scheduleSync(true);stamp()},{once:true});
  window.addEventListener('pageshow',()=>{repaintHall();scheduleSync(true);stamp()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{repaintHall();scheduleSync(true);stamp()},{passive:true});"""
if old not in c: raise SystemExit("v438 startup repaint block missing")
c=c.replace(old,new,1);changed["v438"]=1

old="""  paintLocalPower();stamp();scheduleSync(true);
  document.addEventListener('DOMContentLoaded',()=>{paintLocalPower();stamp();scheduleSync(true)},{once:true});
  window.addEventListener('pageshow',()=>{paintLocalPower();stamp();scheduleSync(true)},{passive:true});
  document.addEventListener('click',()=>{requestAnimationFrame(paintLocalPower);setTimeout(paintLocalPower,60)},true);
  setTimeout(()=>{paintLocalPower();stamp();scheduleSync(true)},600);
  setTimeout(()=>{paintLocalPower();stamp()},1800);
  setTimeout(()=>{paintLocalPower();stamp();scheduleSync(true)},5200);"""
new="""  paintLocalPower();stamp();scheduleSync(true);
  document.addEventListener('DOMContentLoaded',()=>{paintLocalPower();stamp();scheduleSync(true)},{once:true});
  window.addEventListener('pageshow',()=>{paintLocalPower();stamp();scheduleSync(true)},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{paintLocalPower();stamp();scheduleSync(true)},{passive:true});
  document.addEventListener('click',()=>{requestAnimationFrame(paintLocalPower);setTimeout(paintLocalPower,60)},true);"""
if old not in c: raise SystemExit("v446 startup repaint block missing")
c=c.replace(old,new,1);changed["v446"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v438_startup_train_removed":"[500,1800,5200].forEach(ms=>setTimeout(()=>{repaintHall();stamp()},ms))" not in c,
 "v438_schedule_debounce_kept":"syncTimer=setTimeout(async()=>{" in c,
 "v438_account_ready_added":"growlegends:account-ready',()=>{repaintHall();scheduleSync(true);stamp()}" in c,
 "v446_startup_delays_removed":"setTimeout(()=>{paintLocalPower();stamp();scheduleSync(true)},5200)" not in c,
 "v446_click_followup_kept":"requestAnimationFrame(paintLocalPower);setTimeout(paintLocalPower,60)" in c,
 "v446_schedule_debounce_kept":"function scheduleSync(force=false)" in c,
 "v446_account_ready_added":"growlegends:account-ready',()=>{paintLocalPower();stamp();scheduleSync(true)}" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_HALL_POWER_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-HALL-POWER-QA",
 "changed":changed,
 "checks":checks,
 "scope":"startup repaint lifecycle only; Hall/profile server sync debounces and click followups preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))