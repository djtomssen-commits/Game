from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""  document.addEventListener('DOMContentLoaded',()=>{if(!window.v7206StartupBusy?.())setTimeout(refreshArt,80)},{once:true});
  window.addEventListener('growlegends:first-playable',()=>setTimeout(refreshArt,500),{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character')requestAnimationFrame(refreshArt);if(id==='shop')requestAnimationFrame(()=>{refreshMerchantPools(false);refreshArt()})},{passive:true});
  window.addEventListener('pageshow',()=>setTimeout(refreshArt,80),{passive:true});"""
new="""  document.addEventListener('DOMContentLoaded',()=>{if(!window.v7206StartupBusy?.())refreshArt()},{once:true});
  window.addEventListener('growlegends:first-playable',refreshArt,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='character')refreshArt();if(id==='shop'){refreshMerchantPools(false);refreshArt()}},{passive:true});
  window.addEventListener('pageshow',refreshArt,{passive:true});"""
if old not in c: raise SystemExit("v7198 passive lifecycle block missing")
c=c.replace(old,new,1);changed["v7198"]=1

old=""" window.addEventListener('pageshow',()=>setTimeout(()=>{syncTimer();paintAll()},100),{passive:true});
 window.addEventListener('growlegends:account-ready',()=>setTimeout(()=>{syncTimer();paintAll()},220),{passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',()=>setTimeout(syncTimer,0),{passive:true});"""
new=""" window.addEventListener('pageshow',()=>{syncTimer();paintAll()},{passive:true});
 window.addEventListener('growlegends:account-ready',()=>{syncTimer();paintAll()},{passive:true});
 window.addEventListener('growlegends:navigation-open-v7119',()=>{syncTimer();paintAll()},{passive:true});"""
if old not in c: raise SystemExit("v6346 passive lifecycle block missing")
c=c.replace(old,new,1);changed["v6346"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v7198_dom_delay_removed":"setTimeout(refreshArt,80)" not in c[c.find("refreshArt"):c.find("v6117ClassPassiveQA")],
 "v7198_first_playable_direct":"growlegends:first-playable',refreshArt" in c,
 "v7198_nav_raf_removed":"requestAnimationFrame(refreshArt)" not in c[c.find("refreshArt"):c.find("v6117ClassPassiveQA")],
 "v6346_pageshow_direct":"pageshow',()=>{syncTimer();paintAll()}" in c,
 "v6346_account_direct":"growlegends:account-ready',()=>{syncTimer();paintAll()}" in c,
 "v6346_nav_direct":"growlegends:navigation-open-v7119',()=>{syncTimer();paintAll()}" in c,
 "v6346_click_delay_kept":"setTimeout(()=>{syncTimer();paintAll()},60)" in c,
 "v6346_live_interval_kept":"window.setInterval(()=>{if(!towerActive()){stop();return}paintAll()},1000)" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH3_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH3-QA",
 "changed":changed,
 "checks":checks,
 "scope":"passive item-art/tower lifecycle only; action-order delay and live tower timer preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))