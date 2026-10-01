from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")

old432="""  document.addEventListener('DOMContentLoaded',()=>{repaint();stamp()},{once:true});
  document.addEventListener('click',()=>setTimeout(()=>{repaint();stamp()},0),true);
  setTimeout(()=>{repaint();stamp()},1000);
  setTimeout(()=>{repaint();stamp()},4000);
  setTimeout(()=>{repaint();stamp()},7800);"""
new432="""  document.addEventListener('DOMContentLoaded',()=>{repaint();stamp()},{once:true});
  document.addEventListener('click',()=>setTimeout(()=>{repaint();stamp()},0),true);
  window.addEventListener('growlegends:account-ready',()=>{repaint();stamp()},{passive:true});"""
if old432 not in c: raise SystemExit("v432 repaint tail missing")
c=c.replace(old432,new432,1)

old434="""  /* V6.217: no continuous startup polling; direct click/render hooks remain authoritative. */
  [250,1200,3500].forEach(ms=>setTimeout(()=>{paint();stamp()},ms));"""
new434="""  /* V8.009: delayed startup paints retired; direct spend/persist/lifecycle hooks own updates. */"""
if old434 not in c: raise SystemExit("v434 startup repaint train missing")
c=c.replace(old434,new434,1)

p.write_text(c,encoding="utf-8")
checks={
 "v432_late_repaints_removed":"setTimeout(()=>{repaint();stamp()},1000)" not in c and "setTimeout(()=>{repaint();stamp()},7800)" not in c,
 "v432_account_ready_present":"growlegends:account-ready',()=>{repaint();stamp()}" in c,
 "v434_startup_train_removed":"[250,1200,3500].forEach(ms=>setTimeout(()=>{paint();stamp()},ms))" not in c,
 "v434_spend_owner_kept":"__v434IncAttrWrapped" in c,
 "v434_persist_owner_kept":"__v434PersistWrapped" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps(checks))
Path("V8009_FINAL_BATCH2_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BATCH2-QA",
 "checks":checks,
 "scope":"comparison/attribute startup repaint cleanup only; item stats and attribute spending unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("final batch2 applied")