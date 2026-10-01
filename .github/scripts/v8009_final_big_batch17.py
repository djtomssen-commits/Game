from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""  if(typeof v032Go==='function'&&!window.__v438HallGoWrapped){
    const base=v032Go;
    v032Go=function(id){
      const r=base.apply(this,arguments);
      if(id==='hall')setTimeout(async()=>{await writeLiveHall(true);repaintHall()},0);
      return r;
    };
    try{window.v032Go=v032Go}catch(e){}
    window.__v438HallGoWrapped=true;
  }"""
new="""  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')==='hall')void (async()=>{await writeLiveHall(true);repaintHall()})();
  },{passive:true});
  window.__v438HallGoWrapped='v7119-event';"""
if old not in c: raise SystemExit("v438 go wrapper missing")
c=c.replace(old,new,1);changed["v438"]=1

old="""  if(typeof v032Go==='function'&&!window.__v446GoWrapped){
    const baseGo=v032Go;
    v032Go=function(id){
      const r=baseGo.apply(this,arguments);
      requestAnimationFrame(paintLocalPower);
      setTimeout(paintLocalPower,80);
      if(['hall','pvp','guild','friends','character','world'].includes(String(id||'')))scheduleSync(false);
      return r;
    };
    try{window.v032Go=v032Go}catch(e){}
    window.__v446GoWrapped=true;
  }"""
new="""  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    paintLocalPower();
    if(['hall','pvp','guild','friends','character','world'].includes(id))scheduleSync(false);
  },{passive:true});
  window.__v446GoWrapped='v7119-event';"""
if old not in c: raise SystemExit("v446 go wrapper missing")
c=c.replace(old,new,1);changed["v446"]=1

old="""  try{if(typeof v032Go==='function'&&!window.__v457GoWrapped){const base=v032Go;v032Go=function(id){const r=base.apply(this,arguments);if(id==='endgame')renderEndgame();else if(id==='world')ensureWorldLink();ensureMenu();stamp();return r};window.v032Go=v032Go;window.__v457GoWrapped=true}}catch(e){}
  install();document.addEventListener('DOMContentLoaded',install,{once:true});window.addEventListener('pageshow',install,{passive:true});[250,900,2200,5200].forEach(ms=>setTimeout(install,ms));setTimeout(stamp,350); /* V4.123: removed useless late clear of already-fired one-shot timeout. */"""
new="""  window.addEventListener('growlegends:navigation-open-v7119',e=>{const id=String(e?.detail?.id||'');if(id==='endgame')renderEndgame();else if(id==='world')ensureWorldLink();ensureMenu();stamp()},{passive:true});window.__v457GoWrapped='v7119-event';
  install();document.addEventListener('DOMContentLoaded',install,{once:true});window.addEventListener('pageshow',install,{passive:true});window.addEventListener('growlegends:account-ready',install,{passive:true});"""
if old not in c: raise SystemExit("v457 wrapper/startup block missing")
c=c.replace(old,new,1);changed["v457"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v438_wrapper_removed":"const base=v032Go;\n    v032Go=function(id)" not in c[c.find("__v438HallGoWrapped")-800:c.find("__v438HallGoWrapped")+1200],
 "v438_shared_nav":"__v438HallGoWrapped='v7119-event'" in c,
 "v438_server_sync_kept":"await writeLiveHall(true);repaintHall()" in c,
 "v446_wrapper_removed":"const baseGo=v032Go;\n    v032Go=function(id)" not in c[c.find("__v446GoWrapped")-700:c.find("__v446GoWrapped")+1000],
 "v446_shared_nav":"__v446GoWrapped='v7119-event'" in c,
 "v446_click_followup_kept":"requestAnimationFrame(paintLocalPower);setTimeout(paintLocalPower,60)" in c,
 "v457_wrapper_removed":"if(typeof v032Go==='function'&&!window.__v457GoWrapped)" not in c,
 "v457_shared_nav":"__v457GoWrapped='v7119-event'" in c,
 "v457_startup_train_removed":"[250,900,2200,5200].forEach(ms=>setTimeout(install,ms))" not in c,
 "v457_combat_step_kept":"setTimeout(step,260)" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH17_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH17-QA",
 "changed":changed,
 "checks":checks,
 "scope":"Hall/local-power/endgame navigation lifecycle only; combat and server sync behavior preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))