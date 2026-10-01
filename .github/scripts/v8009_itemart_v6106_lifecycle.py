from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
old=""" document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,100),{once:true});
 window.addEventListener('pageshow',()=>setTimeout(refresh,100),{passive:true});
 window.addEventListener('growlegends:first-playable',()=>setTimeout(refresh,650),{passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character'||id==='shop')requestAnimationFrame(refresh)},{passive:true});
 setTimeout(()=>{if(!window.v7206StartupBusy?.())refresh()},220);"""
new=""" document.addEventListener('DOMContentLoaded',refresh,{once:true});
 window.addEventListener('pageshow',refresh,{passive:true});
 window.addEventListener('growlegends:first-playable',refresh,{passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character'||id==='shop')refresh()},{passive:true});"""
if old not in c: raise SystemExit("v6106 lifecycle block missing")
c=c.replace(old,new,1)
p.write_text(c,encoding="utf-8")
checks={
 "dom_timeout_removed":"DOMContentLoaded',()=>setTimeout(refresh,100)" not in c,
 "pageshow_timeout_removed":"pageshow',()=>setTimeout(refresh,100)" not in c,
 "first_playable_timeout_removed":"first-playable',()=>setTimeout(refresh,650)" not in c,
 "nav_raf_removed":"if(id==='character'||id==='shop')requestAnimationFrame(refresh)" not in c,
 "startup_timeout_removed":"setTimeout(()=>{if(!window.v7206StartupBusy?.())refresh()},220)" not in c,
 "direct_nav_refresh_present":"if(id==='character'||id==='shop')refresh()" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps(checks))
Path("V8009_ITEMART_V6106_LIFECYCLE_QA.json").write_text(json.dumps({
 "build":"V8.009-ITEMART-V6106-LIFECYCLE-QA",
 "checks":checks,
 "scope":"real item-art refresh lifecycle only; item resolver/art maps unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("v6106 lifecycle consolidated")
