from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="""const v093BaseRender=render;
render=function(){
  v093BaseRender();
  
  v093BuildMenu();
};"""
new="""/* Admin menu ownership is driven by v093CheckAdmin / account lifecycle. */"""
if old not in c: raise SystemExit("v093 render wrapper missing")
c=c.replace(old,new,1);changed["v093"]=1

old="""const v103BaseRender=render;
render=function(){
  v103BaseRender();
  
  if(v093IsAdmin)v103InstallPlayerAdmin();
};"""
new="""/* v093AdminLoadLists is the direct owner for installing the player editor. */"""
if old not in c: raise SystemExit("v103 render wrapper missing")
c=c.replace(old,new,1);changed["v103"]=1

old="""const v274BaseRender=render;
render=function(){
  const r=v274BaseRender();
  if(v093IsAdmin)v274InstallEventPresets();
  
  const line=document.querySelector('#v141VersionLine');
  return r;
};

setTimeout(()=>{
  try{
    if(v093IsAdmin)v274InstallEventPresets();
    renderQuests();
  }catch(e){}
  
  const line=document.querySelector('#v141VersionLine');
},2100);"""
new="""/* v093CheckAdmin / v093AdminLoadLists directly own preset installation. */
window.addEventListener('growlegends:account-ready',()=>{if(v093IsAdmin)v274InstallEventPresets()},{passive:true});
window.addEventListener('pageshow',()=>{if(v093IsAdmin&&document.getElementById('admin')?.classList.contains('active'))v274InstallEventPresets()},{passive:true});"""
if old not in c: raise SystemExit("v274 render/startup block missing")
c=c.replace(old,new,1);changed["v274"]=1

old="""const v115BaseRender=render;
render=function(){
  const result=v115BaseRender();
  
  return result;
};

setTimeout(v115EnsureUi,150);"""
new="""document.addEventListener('DOMContentLoaded',v115EnsureUi,{once:true});
window.addEventListener('growlegends:account-ready',v115EnsureUi,{passive:true});"""
if old not in c: raise SystemExit("v115 noop render block missing")
c=c.replace(old,new,1);changed["v115"]=1

p.write_text(c,encoding="utf-8")
checks={
 "v093_render_removed":"const v093BaseRender=render" not in c,
 "v093_check_admin_kept":"async function v093CheckAdmin()" in c and "v093BuildMenu();" in c,
 "v103_render_removed":"const v103BaseRender=render" not in c,
 "v103_admin_load_owner_kept":"const v103OldAdminLoad=v093AdminLoadLists" in c,
 "v274_render_removed":"const v274BaseRender=render" not in c,
 "v274_2100_removed":"},2100);" not in c[c.find("v274-events-gold-mystic-presets"):c.find("v275") if c.find("v275")>0 else len(c)],
 "v274_admin_wrappers_kept":"const v274BaseAdminCheck=v093CheckAdmin" in c and "const v274BaseAdminLists=v093AdminLoadLists" in c,
 "v115_noop_removed":"const v115BaseRender=render" not in c,
 "v115_dialog_kept":"window.GL_UI=" in c and "function v115EnsureUi()" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_ADMIN_SMALL_SCREEN_QA.json").write_text(json.dumps({
 "build":"V8.009-ADMIN-SMALL-SCREEN-QA",
 "changed":changed,
 "checks":checks,
 "scope":"admin UI render lifecycle only; admin RPCs, moderation, event logic and dialog behavior preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))