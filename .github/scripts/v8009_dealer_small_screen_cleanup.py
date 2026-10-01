from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""['growlegends:account-ready','growlegends:extras-ready','growlegends:foreground-ready'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sync,0)));
window.addEventListener('pageshow',()=>setTimeout(sync,0),{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(sync,0)},{passive:true});
setTimeout(sync,0);setTimeout(sync,650);setTimeout(sync,1800);"""
new="""['growlegends:account-ready','growlegends:extras-ready','growlegends:foreground-ready'].forEach(ev=>window.addEventListener(ev,sync,{passive:true}));
window.addEventListener('pageshow',sync,{passive:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()},{passive:true});
sync();"""
if old not in c: raise SystemExit("v7260 lifecycle block missing")
c=c.replace(old,new,1);changed["v7260"]=1

old="""  const v338BaseRender=render;
  render=function(){
    const r=v338BaseRender.apply(this,arguments);
    if(document.querySelector('#harzDealer')?.classList.contains('active')){
      requestAnimationFrame(v338ModernizeDealer);
    }
    return r;
  };

  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')==='harzDealer')v338ModernizeDealer();
  });

  function v338ApplyVersion(){
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{
      if(el)el.textContent=V338_VERSION;
    });
  }

  setTimeout(()=>{v338ModernizeDealer();v338ApplyVersion()},300);
  setTimeout(()=>{v338ModernizeDealer();v338ApplyVersion()},1500);"""
new="""  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')==='harzDealer')v338ModernizeDealer();
  },{passive:true});

  function v338ApplyVersion(){
    document.querySelectorAll('.version,[data-version],#version,#gameVersion,#v141VersionLine,#topVersion,[data-top-version]').forEach(el=>{
      if(el)el.textContent=V338_VERSION;
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{v338ModernizeDealer();v338ApplyVersion()},{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('harzDealer')?.classList.contains('active'))v338ModernizeDealer();v338ApplyVersion()},{passive:true});
  window.addEventListener('growlegends:account-ready',()=>{v338ModernizeDealer();v338ApplyVersion()},{passive:true});"""
if old not in c: raise SystemExit("v338 global render/startup block missing")
c=c.replace(old,new,1);changed["v338"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v7260_delays_removed":"setTimeout(sync,650)" not in c and "setTimeout(sync,1800)" not in c,
 "v7260_direct_lifecycle":"window.addEventListener('pageshow',sync" in c,
 "v7260_admin_redirect_kept":"window.v032Go?.('world')" in c,
 "v338_global_render_removed":"const v338BaseRender=render" not in c,
 "v338_startup_delays_removed":"setTimeout(()=>{v338ModernizeDealer();v338ApplyVersion()},1500)" not in c,
 "v338_dealer_wrapper_kept":"const v338BaseDealerRender=window.v322RenderDealer" in c,
 "v338_nav_kept":"growlegends:navigation-open-v7119" in c,
 "v567_final_owner_kept":"v567-harz-dealer-final" in c and "window.v322RenderDealer=wrapped" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_DEALER_SMALL_SCREEN_QA.json").write_text(json.dumps({
 "build":"V8.009-DEALER-SMALL-SCREEN-QA",
 "changed":changed,
 "checks":checks,
 "scope":"bagDealer admin visibility + harzDealer legacy repaint lifecycle only; billing/admin/access logic preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))