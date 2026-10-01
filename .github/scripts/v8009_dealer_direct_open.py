from pathlib import Path
import json

p=Path("beta.html")
c=p.read_text(encoding="utf-8")

old="function v322OpenDealer(){try{v032Go('harzDealer')}catch(e){}requestAnimationFrame(v322RenderDealer)}"
new="function v322OpenDealer(){try{return v032Go('harzDealer')}catch(e){try{v322RenderDealer()}catch(_){}}}"

if old not in c:
    raise SystemExit("v322 open dealer RAF block missing")

c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")

checks={
 "open_raf_removed":old not in c,
 "open_uses_navigation":new in c,
 "shared_nav_render_kept":"if(String(e?.detail?.id||'')==='harzDealer')v322RenderDealer()" in c,
 "buy_handler_kept":"data-v322-buy" in c and "glPlayBuy" in c,
 "menu_entry_kept":"data-screen=\"harzDealer\"" in c,
}
if not all(checks.values()):
    raise SystemExit("dealer direct-open QA failed: "+json.dumps(checks))

Path("V8009_DEALER_DIRECT_OPEN_QA.json").write_text(
 json.dumps({
   "build":"V8.009-DEALER-DIRECT-OPEN-QA",
   "checks":checks,
   "scope":"dealer open/render lifecycle only; billing and package data unchanged"
 },indent=2,ensure_ascii=False)+"\n",
 encoding="utf-8"
)
print("retired v322 open RAF")
