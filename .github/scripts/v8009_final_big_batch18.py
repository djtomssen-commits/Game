from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""/* Auch direkte Menü-Navigation auf Startseite absichern. */
const v201BaseGo=v032Go;
v032Go=function(id){
  const result=v201BaseGo(id);

  if(id==='world'){
    requestAnimationFrame(()=>{
      try{
        const world=document.querySelector('#world');
        if(
          world &&
          typeof v085InstallWorld==='function' &&
          !world.querySelector('.v085-dashboard')
        ){
          v085InstallWorld();
        }

        try{
          if(typeof v111InstallWorldBossCard==='function'){
            v111InstallWorldBossCard();
          }
        }catch(e){}
      }catch(e){
        console.error('V4.02 world navigation',e);
      }
    });
  }

  return result;
};

const v201BaseRender=render;
render=function(){
  const result=v201BaseRender();

  const world=document.querySelector('#world');
  if(world?.classList.contains('active')){
    requestAnimationFrame(()=>{
      try{
        if(
          typeof v085InstallWorld==='function' &&
          !world.querySelector('.v085-dashboard')
        ){
          v085InstallWorld();
        }

        try{
          if(typeof v111InstallWorldBossCard==='function'){
            v111InstallWorldBossCard();
          }
        }catch(e){}
      }catch(e){}
    });
  }

  return result;
};"""
new="""function v201EnsureHome(){
  try{
    const world=document.querySelector('#world');
    if(!world)return false;
    if(typeof v085InstallWorld==='function'&&!world.querySelector('.v085-dashboard'))v085InstallWorld();
    try{if(typeof v111InstallWorldBossCard==='function')v111InstallWorldBossCard()}catch(e){}
    return true;
  }catch(e){console.error('V4.02 world ensure',e);return false}
}
window.v201EnsureHome=v201EnsureHome;
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='world')v201EnsureHome()},{passive:true});
window.addEventListener('pageshow',()=>{if(document.querySelector('#world')?.classList.contains('active'))v201EnsureHome()},{passive:true});"""
if old not in c: raise SystemExit("v201 wrapper block missing")
c=c.replace(old,new,1);changed["v201"]=1

old="""const v087BaseRender=render;
render=function(){
  v087BaseRender();
  
  requestAnimationFrame(v087FixMainAttributeBadge);
};

try{
  v087FixMainAttributeBadge();
  render();
}catch(e){console.error('V4.02 main attribute fix',e);}"""
new="""document.addEventListener('DOMContentLoaded',v087FixMainAttributeBadge,{once:true});
window.addEventListener('pageshow',()=>{if(document.getElementById('character')?.classList.contains('active'))v087FixMainAttributeBadge()},{passive:true});
window.addEventListener('growlegends:navigation-open-v7119',e=>{if(String(e?.detail?.id||'')==='character')v087FixMainAttributeBadge()},{passive:true});
try{v087FixMainAttributeBadge()}catch(e){console.error('V4.02 main attribute fix',e);}"""
if old not in c: raise SystemExit("v087 render wrapper block missing")
c=c.replace(old,new,1);changed["v087"]=1

old="""  /* Final navigation authority. Opening Dungeons always means a fresh world map. */
  try{
    if(typeof v032Go==='function'&&!window.__v467DungeonGoWrapped){
      const base=v032Go;
      v032Go=function(id){
        if(id==='dungeon'){
          ensure();
          s.dungeon.layer='world';
          s.dungeon.view='map';
        }
        const r=base.apply(this,arguments);
        if(id==='dungeon'){
          rebuildWorld('v032Go');
          try{requestAnimationFrame(()=>rebuildWorld('v032Go-raf'))}catch(e){}
          setTimeout(()=>rebuildWorld('v032Go-100'),100);
        }
        return r;
      };
      window.v032Go=v032Go;window.__v467DungeonGoWrapped=true;
    }
  }catch(e){console.warn('V4.68 dungeon nav wrap',e)}"""
new="""  /* Final navigation authority through the shared navigation event. */
  window.addEventListener('growlegends:navigation-open-v7119',e=>{
    if(String(e?.detail?.id||'')!=='dungeon')return;
    ensure();
    s.dungeon.layer='world';
    s.dungeon.view='map';
    rebuildWorld('v7119');
    try{requestAnimationFrame(()=>rebuildWorld('v7119-raf'))}catch(_){}
    setTimeout(()=>rebuildWorld('v7119-100'),100);
  },{passive:true});
  window.__v467DungeonGoWrapped='v7119-event';"""
if old not in c: raise SystemExit("v467 go wrapper block missing")
c=c.replace(old,new,1);changed["v467"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v201_go_wrapper_removed":"const v201BaseGo=v032Go" not in c,
 "v201_render_wrapper_removed":"const v201BaseRender=render" not in c,
 "v201_shared_nav":"window.v201EnsureHome=v201EnsureHome" in c,
 "v087_render_wrapper_removed":"const v087BaseRender=render" not in c,
 "v088_css_kept":"v088-primary-label-center-fix" in c,
 "v467_go_wrapper_removed":"if(typeof v032Go==='function'&&!window.__v467DungeonGoWrapped)" not in c,
 "v467_shared_nav":"__v467DungeonGoWrapped='v7119-event'" in c,
 "v467_click_capture_kept":"captured-dungeon-nav-120" in c
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH18_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH18-QA",
 "changed":changed,
 "checks":checks,
 "scope":"legacy Home/attribute/Dungeon navigation wrappers only; canonical screen renderer and Dungeon recovery preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))
