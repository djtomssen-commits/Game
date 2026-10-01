from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")

old=""" refresh();addQa();stamp();
 /* Existing observers and render hooks do the ongoing work now that their resolver aliases agree. */
 [80,300,900,2200,5200,12500].forEach(ms=>setTimeout(()=>{refresh();addQa();stamp()},ms));
 window.addEventListener('pageshow',()=>{refresh();addQa();stamp()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){refresh();stamp()}},{passive:true});"""

new=""" refresh();addQa();stamp();
 /* Existing render owners do the ongoing work. Refresh only on relevant screen opens/resume. */
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||'');
  if(id==='character'||id==='shop'||id==='forge'||id==='harzForge'||id==='v488Forge'){refresh();addQa();stamp()}
 },{passive:true});
 window.addEventListener('pageshow',()=>{refresh();addQa();stamp()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){refresh();stamp()}},{passive:true});"""

if old not in c:
    raise SystemExit("v4115 startup fanout block missing")

c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")

checks={
 "startup_fanout_removed":"[80,300,900,2200,5200,12500]" not in c,
 "initial_refresh_kept":"refresh();addQa();stamp();" in c,
 "shared_nav_hook_present":"growlegends:navigation-open-v7119" in c and "id==='character'||id==='shop'||id==='forge'" in c,
 "pageshow_kept":"window.addEventListener('pageshow',()=>{refresh();addQa();stamp()}" in c,
 "visibility_refresh_kept":"visibilitychange" in c and "refresh();stamp()" in c,
}
if not all(checks.values()):
    raise SystemExit("v4115 QA failed: "+json.dumps(checks))

Path("V8009_ITEMART_V4115_LIFECYCLE_QA.json").write_text(json.dumps({
 "build":"V8.009-ITEMART-V4115-LIFECYCLE-QA",
 "checks":checks,
 "scope":"item-art refresh lifecycle only; resolver/art mapping unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("retired v4115 startup fanout")
