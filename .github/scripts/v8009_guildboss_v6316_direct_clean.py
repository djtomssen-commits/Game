from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
old="""  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
  setTimeout(clean,250);setTimeout(clean,1200);"""
new="""  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
  document.addEventListener('click',e=>{if(e.target?.closest?.('[data-v254-tab="boss"]'))clean()},true);"""
if old not in c:
    raise SystemExit("v6316 startup retry block missing")
c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")
checks={
 "startup_retries_removed":"setTimeout(clean,250);setTimeout(clean,1200)" not in c,
 "initial_clean_kept":"addEventListener('DOMContentLoaded',clean" in c,
 "boss_tab_hook_present":"[data-v254-tab=\"boss\"]" in c and "clean()" in c,
 "test_mode_logic_kept":"v6204-test-mode" in c,
}
if not all(checks.values()):
    raise SystemExit("v6316 QA failed: "+json.dumps(checks))
Path("V8009_GUILDBOSS_V6316_DIRECT_CLEAN_QA.json").write_text(json.dumps({
 "build":"V8.009-GUILDBOSS-V6316-DIRECT-CLEAN-QA",
 "checks":checks,
 "scope":"legacy test-badge cleanup only; boss logic unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("retired v6316 startup retries")
