from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""  const oldGo=v032Go;
  v032Go=function(id){const r=oldGo.apply(this,arguments);requestAnimationFrame(paint);return r};

  paint();
  document.addEventListener('DOMContentLoaded',paint,{once:true});
  setTimeout(paint,250);
  setTimeout(paint,1200);
  setTimeout(paint,3200);"""
new="""  paint();
  document.addEventListener('DOMContentLoaded',paint,{once:true});
  window.addEventListener('pageshow',paint,{passive:true});
  window.addEventListener('growlegends:account-ready',paint,{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',paint,{passive:true});"""
if old not in c: raise SystemExit("legacy header paint nav block missing")
c=c.replace(old,new,1);changed["headerPaint"]=1

old="""  /* Main navigation owner: every successful page change closes the menu. */
  const baseGo=v032Go;
  v032Go=function(id){
    closeMainMenu();
    return baseGo.apply(this,arguments);
  };"""
new="""  /* Shared navigation owner: every successful page change closes the menu. */
  window.addEventListener('growlegends:navigation-open-v7119',closeMainMenu,{passive:true});"""
if old not in c: raise SystemExit("v373 go wrapper missing")
c=c.replace(old,new,1);changed["v373"]=1

old="""  try{
    const go=window.v032Go;
    if(typeof go==='function'&&!window.__v4112ScopedGo){
      window.v032Go=function(id){
        const r=go.apply(this,arguments);
        if(['character','shop','dungeon','hall','endgame'].includes(String(id||''))){
          queue(document.getElementById(id));
        }
        return r;
      };
      try{v032Go=window.v032Go}catch(e){}
      window.__v4112ScopedGo=true;
    }
  }catch(e){}

  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>queue(document.querySelector('.screen.active')||document),80),{once:true});
  window.addEventListener('pageshow',()=>queue(document.querySelector('.screen.active')||document),{passive:true});"""
new="""  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    const id=String(e?.detail?.id||'');
    if(['character','shop','dungeon','hall','endgame'].includes(id))queue(document.getElementById(id));
  },{passive:true});
  window.__v4112ScopedGo='v7119-event';

  document.addEventListener('DOMContentLoaded',()=>queue(document.querySelector('.screen.active')||document),{once:true});
  window.addEventListener('pageshow',()=>queue(document.querySelector('.screen.active')||document),{passive:true});"""
if old not in c: raise SystemExit("v4112 go wrapper missing")
c=c.replace(old,new,1);changed["v4112"]=1

old="""/* Final navigation authority: choosing another page closes the Pet album
   automatically. No need to tap X first. */
try{
  if(typeof v032Go==='function'&&!window.__v6114GoWrapped){
    const base=v032Go;
    const wrapped=function(id){
      closePetForNavigation();
      return base.apply(this,arguments);
    };
    try{v032Go=wrapped}catch(e){}
    window.v032Go=wrapped;
    window.__v6114GoWrapped=true;
  }
}catch(e){}"""
new="""/* Shared navigation authority: choosing another page closes the Pet album. */
window.addEventListener('growlegends:navigation-open-v7119',closePetForNavigation,{passive:true});
window.__v6114GoWrapped='v7119-event';"""
if old not in c: raise SystemExit("v6114 go wrapper missing")
c=c.replace(old,new,1);changed["v6114"]=1

old=""" // Final navigation owner: show the first-visit guide after the destination page rendered.
 if(typeof v032Go==='function'){
  const baseGo=v032Go;
  v032Go=function(id){
   const r=baseGo.apply(this,arguments);
   updateHelp();
   if(GUIDES[id])maybeAuto(id,300);
   return r;
  };
  try{window.v032Go=v032Go}catch(_){}
 }"""
new=""" // Shared navigation owner: update help and schedule a guide after the destination page rendered.
 window.addEventListener('growlegends:navigation-open-v7119',e=>{
  const id=String(e?.detail?.id||'');
  updateHelp();
  if(GUIDES[id])maybeAuto(id,300);
 },{passive:true});"""
if old not in c: raise SystemExit("v6254 go wrapper missing")
c=c.replace(old,new,1);changed["v6254"]=1

p.write_text(c,encoding="utf-8")
checks={
 "header_wrapper_removed":"const oldGo=v032Go;\n  v032Go=function(id){const r=oldGo.apply(this,arguments);requestAnimationFrame(paint);return r};" not in c,
 "header_startup_delays_removed":"setTimeout(paint,3200);" not in c,
 "v373_wrapper_removed":"const baseGo=v032Go;\n  v032Go=function(id){\n    closeMainMenu();" not in c,
 "v373_shared_nav":"growlegends:navigation-open-v7119',closeMainMenu" in c,
 "v4112_wrapper_removed":"const go=window.v032Go;" not in c[c.find("__v4112ScopedGo")-900:c.find("__v4112ScopedGo")+1200],
 "v4112_shared_nav":"__v4112ScopedGo='v7119-event'" in c,
 "v4112_queue_kept":"raf=requestAnimationFrame(()=>{" in c,
 "v6114_wrapper_removed":"if(typeof v032Go==='function'&&!window.__v6114GoWrapped)" not in c,
 "v6114_shared_nav":"__v6114GoWrapped='v7119-event'" in c,
 "v6254_wrapper_removed":"// Final navigation owner: show the first-visit guide" not in c,
 "v6254_guide_delay_kept":"if(GUIDES[id])maybeAuto(id,300)" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH19_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH19-QA",
 "changed":changed,
 "checks":checks,
 "scope":"pure UI navigation wrappers only; item-art queue, menu safety and tutorial scheduling preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))