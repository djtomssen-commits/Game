from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
old=""" function stamp(){}
 [80,300,1200,3200].forEach(ms=>setTimeout(()=>{refresh();stamp();},ms));
 document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{refresh();stamp();},60),{once:true});
 window.addEventListener('pageshow',()=>setTimeout(()=>{refresh();stamp();},60),{passive:true});"""
new=""" function stamp(){}
 refresh();stamp();
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
   const id=String(e?.detail?.id||'');
   if(id==='character'||id==='shop'||id==='forge'||id==='harzForge'||id==='v488Forge'){refresh();stamp()}
 },{passive:true});
 document.addEventListener('DOMContentLoaded',()=>{refresh();stamp()},{once:true});
 window.addEventListener('pageshow',()=>{refresh();stamp()},{passive:true});"""
if old not in c: raise SystemExit("v4117 lifecycle block missing")
c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")
checks={
 "startup_fanout_removed":"[80,300,1200,3200]" not in c,
 "dom_delay_removed":"DOMContentLoaded',()=>setTimeout(()=>{refresh();stamp();},60" not in c,
 "pageshow_delay_removed":"pageshow',()=>setTimeout(()=>{refresh();stamp();},60" not in c,
 "nav_hook_present":"id==='character'||id==='shop'||id==='forge'" in c,
 "initial_refresh_present":"refresh();stamp();" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps(checks))
Path("V8009_ITEMART_V4117_LIFECYCLE_QA.json").write_text(json.dumps({
 "build":"V8.009-ITEMART-V4117-LIFECYCLE-QA",
 "checks":checks,
 "scope":"boots-art refresh lifecycle only; artwork/resolver output unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("v4117 lifecycle consolidated")
