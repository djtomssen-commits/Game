from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""const v314BaseRender=render;
render=function(){
 const r=v314BaseRender();
 try{renderSkillTree()}catch(e){console.error('V4.02 talent render',e)}
 
 const line=document.querySelector('#v141VersionLine');
 return r;
};"""
new="""/* v543 owns the live talent tree. No global render wrapper here. */"""
if old not in c: raise SystemExit("v314 render wrapper missing")
c=c.replace(old,new,1);changed["v314"]=1

old="""  /* Outermost render owner: historical V4.42 still moves inventory before attrs
     inside its own wrapper. Reassert the requested order after that chain returns. */
  if(typeof render==='function'&&!window.__v444RenderWrapped){
    const baseRender=render;
    render=function(){const r=baseRender.apply(this,arguments);if(document.getElementById('character')?.classList.contains('active'))requestAnimationFrame(arrangeCharacter);return r;};
    try{window.render=render}catch(e){}
    window.__v444RenderWrapped=true;
  }

  /* V6.101: old 12-second character observer/poller retired. */
  arrangeCharacter();stamp();
  document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(arrangeCharacter),{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))requestAnimationFrame(arrangeCharacter)},{passive:true});"""
new="""  /* Character navigation/layout owns ordering; no global render wrapper. */
  window.__v444RenderWrapped='retired';
  arrangeCharacter();stamp();
  document.addEventListener('DOMContentLoaded',arrangeCharacter,{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))arrangeCharacter()},{passive:true});
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')arrangeCharacter()},{passive:true});"""
if old not in c: raise SystemExit("v444 render wrapper block missing")
c=c.replace(old,new,1);changed["v444"]=1

old="""  try{
    if(typeof render==='function'&&!window.__v514RenderWrapped){
      const base=render;
      render=function(){
        const r=base.apply(this,arguments);
        if(document.getElementById('character')?.classList.contains('active'))apply();
        return r;
      };
      try{window.render=render}catch(e){}
      window.__v514RenderWrapped=true;
    }
  }catch(e){}
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')apply()});
  window.__v514GoWrapped='v7119-event';

  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});"""
new="""  window.__v514RenderWrapped='retired';
  window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')apply()});
  window.__v514GoWrapped='v7119-event';

  apply();
  document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))apply()},{passive:true});"""
if old not in c: raise SystemExit("v514 render wrapper block missing")
c=c.replace(old,new,1);changed["v514"]=1

old="""  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#v459CharacterTabs [data-tab="talents"],#v514HeroTabs [data-tab="talents"]'))requestAnimationFrame(apply);
  },true);"""
new="""  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#v459CharacterTabs [data-tab="talents"],#v514HeroTabs [data-tab="talents"]'))apply();
  },true);"""
if old not in c: raise SystemExit("v543 tab RAF missing")
c=c.replace(old,new,1);changed["v543"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v314_global_render_removed":"const v314BaseRender=render" not in c,
 "v543_owner_kept":"window.v543RenderTalentTree=renderTree" in c and "window.renderSkillTree=renderTree" in c,
 "v444_global_render_removed":"if(typeof render==='function'&&!window.__v444RenderWrapped)" not in c,
 "v444_nav_owner":"__v444RenderWrapped='retired'" in c and "arrangeCharacter()" in c,
 "v514_global_render_removed":"if(typeof render==='function'&&!window.__v514RenderWrapped)" not in c,
 "v514_nav_owner":"__v514RenderWrapped='retired'" in c and "__v514GoWrapped='v7119-event'" in c,
 "v543_tab_raf_removed":"[data-tab=\"talents\"]'))requestAnimationFrame(apply)" not in c,
 "v4140_attribute_owner_kept":"v4140-attribute-display-owner" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_CHARACTER_ATTR_TALENT_QA.json").write_text(json.dumps({
 "build":"V8.009-CHARACTER-ATTR-TALENT-QA",
 "changed":changed,
 "checks":checks,
 "scope":"character attribute/talent render lifecycle only; talent upgrades, attribute spend and tab state preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))