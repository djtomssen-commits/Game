from pathlib import Path
import json

p=Path("beta.html")
c=p.read_text(encoding="utf-8")

old="""  function observeClass(){
    ensure();sync();
    ['v260FighterName','v260FighterMeta'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.dataset.v6317Observed){el.dataset.v6317Observed='1';new MutationObserver(()=>requestAnimationFrame(sync)).observe(el,{subtree:true,childList:true,characterData:true})}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeClass,{once:true});else observeClass();
  setTimeout(observeClass,700);"""

new="""  window.v6317SyncGuildBossArt=sync;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();"""

if old not in c:
    raise SystemExit("v6317 observer block missing")
c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")

checks={
 "sync_export_present":"window.v6317SyncGuildBossArt=sync;" in c,
 "observer_removed":"new MutationObserver(()=>requestAnimationFrame(sync))" not in c,
 "observer_marker_removed":"v6317Observed" not in c,
 "startup_retry_removed":"setTimeout(observeClass,700)" not in c,
 "initial_sync_kept":"addEventListener('DOMContentLoaded',sync" in c or "else sync()" in c,
}
if not all(checks.values()):
    raise SystemExit("v6317 direct owner QA failed: "+json.dumps(checks))

Path("V8009_GUILDBOSS_V6317_DIRECT_OWNER_QA.json").write_text(
 json.dumps({
  "build":"V8.009-GUILDBOSS-V6317-DIRECT-OWNER-QA",
  "checks":checks,
  "scope":"visual cutout synchronization only; guild boss combat/rewards unchanged"
 },indent=2,ensure_ascii=False)+"\n",
 encoding="utf-8"
)
print("retired v6317 mutation observer")
