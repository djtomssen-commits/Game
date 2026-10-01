from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""    try{window.v480UpdateAutoBars?.()}catch(e){}
    arrange();
    return p;"""
new="""    try{window.v480UpdateAutoBars?.()}catch(e){}
    arrange();
    try{window.v681EnhanceMaterials?.()}catch(e){}
    try{window.v683MaterialMultiSell?.enhance?.()}catch(e){}
    return p;"""
if old not in c: raise SystemExit("v546 render tail missing")
c=c.replace(old,new,1);changed["v546PostRender"]=1

old="""      window.v459ArrangeCharacter=function(){const r=base.apply(this,arguments);renderMaterials();arrange();return r};"""
new="""      window.v459ArrangeCharacter=function(){const r=base.apply(this,arguments);arrange();return r};"""
if old not in c: raise SystemExit("v546 arrange wrapper missing")
c=c.replace(old,new,1);changed["v546Arrange"]=1

old="""  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#v459CharacterTabs [data-tab="materials"],#v514HeroTabs [data-tab="materials"]'))requestAnimationFrame(apply);
  },true);
  /* V8.009: bounded startup retry train retired. */"""
new="""  /* Material tab switching only changes visibility. The material DOM is already
     rendered on character open; do not rebuild the full grid on every tab tap. */
  /* V8.009: bounded startup retry train retired. */"""
if old not in c: raise SystemExit("v546 material tab RAF missing")
c=c.replace(old,new,1);changed["v546TabRepaint"]=1

old="""document.addEventListener('click',e=>{
  if(e.target?.closest?.('#v459CharacterTabs [data-tab="materials"],#v514HeroTabs [data-tab="materials"],#v546MaterialsHeader')){
    setTimeout(()=>{observe();enhance()},30);
  }
},true);

document.addEventListener('DOMContentLoaded',()=>{observe();enhance()},{once:true});
window.addEventListener('pageshow',()=>{observe();enhance()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{observe();enhance()},{passive:true});"""
new="""/* v546RenderMaterials is the single post-render owner for sell controls.
   Keep one initial attach for already-present DOM only. */
document.addEventListener('DOMContentLoaded',observe,{once:true});"""
if old not in c: raise SystemExit("v681 duplicate lifecycle block missing")
c=c.replace(old,new,1);changed["v681Lifecycle"]=1

old="""document.addEventListener('click',e=>{if(e.target?.closest?.('#v459CharacterTabs [data-tab="materials"],#v514HeroTabs [data-tab="materials"],#v546MaterialsHeader'))setTimeout(()=>{observe();enhance()},40)},true);
document.addEventListener('DOMContentLoaded',()=>{observe();enhance()},{once:true});
window.addEventListener('pageshow',()=>{observe();enhance()},{passive:true});
window.addEventListener('growlegends:account-ready',()=>{observe();enhance()},{passive:true});
window.v683MaterialMultiSell={enhance,selected,stats:selectionStats};"""
new="""/* v546RenderMaterials is the single post-render owner for multisell controls. */
document.addEventListener('DOMContentLoaded',observe,{once:true});
window.v683MaterialMultiSell={enhance,selected,stats:selectionStats};"""
if old not in c: raise SystemExit("v683 duplicate lifecycle block missing")
c=c.replace(old,new,1);changed["v683Lifecycle"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v546_direct_v681":"window.v681EnhanceMaterials?.()" in c,
 "v546_direct_v683":"window.v683MaterialMultiSell?.enhance?.()" in c,
 "v546_tab_raf_removed":"[data-tab=\"materials\"]'))requestAnimationFrame(apply)" not in c,
 "v546_arrange_no_rerender":"window.v459ArrangeCharacter=function(){const r=base.apply(this,arguments);arrange();return r}" in c,
 "v681_click_delay_removed":"setTimeout(()=>{observe();enhance()},30)" not in c,
 "v683_click_delay_removed":"setTimeout(()=>{observe();enhance()},40)" not in c,
 "v681_pageshow_removed":"window.addEventListener('pageshow',()=>{observe();enhance()}" not in c,
 "v683_account_ready_removed":"window.addEventListener('growlegends:account-ready',()=>{observe();enhance()}" not in c,
 "v681_sell_action_kept":"window.v681SellMaterial(btn.dataset.index)" in c,
 "v683_sell_render_kept":"window.v546RenderMaterials?.()" in c and "setTimeout(enhance,0)" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_CHARACTER_MATERIAL_PERF_QA.json").write_text(json.dumps({
 "build":"V8.009-CHARACTER-MATERIAL-PERF-QA",
 "changed":changed,
 "checks":checks,
 "scope":"character material tab render lifecycle only; sell/multisell/material-use/server-authority behavior preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))