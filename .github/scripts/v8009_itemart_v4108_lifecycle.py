from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")

old=""" /* V6.97: body-wide placement observer retired. */
 [0,80,250,700,1600,3500,8000,15000,30000].forEach(ms=>setTimeout(decorateAll,ms));
 /* V6.97: permanent full-item scan retired. */
 window.addEventListener('pageshow',decorateAll,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)decorateAll()},{passive:true});
 decorateAll();"""

new=""" /* V8.009: startup fan-out retired. v4115 + canonical screen renders own refresh timing. */
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||'');
  if(id==='character'||id==='shop'||id==='forge'||id==='harzForge'||id==='v488Forge')decorateAll();
 },{passive:true});
 window.addEventListener('pageshow',decorateAll,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)decorateAll()},{passive:true});
 decorateAll();"""

if old not in c:
    raise SystemExit("v4108 startup fanout block missing")

c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")

checks={
 "startup_fanout_removed":"[0,80,250,700,1600,3500,8000,15000,30000]" not in c,
 "shared_nav_hook_present":"id==='character'||id==='shop'||id==='forge'" in c,
 "pageshow_kept":"window.addEventListener('pageshow',decorateAll" in c,
 "visibility_kept":"visibilitychange" in c and "decorateAll()" in c,
 "initial_decorate_kept":"decorateAll();\n})();" in c,
}
if not all(checks.values()):
    raise SystemExit("v4108 QA failed: "+json.dumps(checks))

Path("V8009_ITEMART_V4108_LIFECYCLE_QA.json").write_text(json.dumps({
 "build":"V8.009-ITEMART-V4108-LIFECYCLE-QA",
 "checks":checks,
 "scope":"item placement refresh lifecycle only; item art/resolver/gameplay unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("retired v4108 startup fanout")
