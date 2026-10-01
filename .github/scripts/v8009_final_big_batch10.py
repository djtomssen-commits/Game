from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="[250,1200,5000,15000].forEach(ms=>setTimeout(()=>{retireLegacyOg(true);stamp()},ms));"
if old not in c: raise SystemExit("grow legacy cleanup train missing")
c=c.replace(old,"window.addEventListener('growlegends:account-ready',()=>{retireLegacyOg(true);stamp()},{passive:true});",1);changed["growLegacy"]=1

old="[0,80,300,900].forEach(ms=>setTimeout(()=>{bind();queueReset()},ms));"
if old not in c: raise SystemExit("tower focus startup train missing")
c=c.replace(old,"window.addEventListener('pageshow',()=>{bind();queueReset()},{passive:true});\n  window.addEventListener('growlegends:account-ready',()=>{bind();queueReset()},{passive:true});",1);changed["towerFocus"]=1

old="""window.addEventListener('growlegends:account-ready',()=>setTimeout(v6340SyncCharacterTitle,240));
window.addEventListener('pageshow',()=>setTimeout(v6340SyncCharacterTitle,220),{passive:true});
window.addEventListener('growlegends:navigation-ready',()=>setTimeout(v6340SyncCharacterTitle,160),{passive:true});"""
new="""window.addEventListener('growlegends:account-ready',v6340SyncCharacterTitle,{passive:true});
window.addEventListener('pageshow',v6340SyncCharacterTitle,{passive:true});
window.addEventListener('growlegends:navigation-ready',v6340SyncCharacterTitle,{passive:true});"""
if old not in c: raise SystemExit("character title passive delays missing")
c=c.replace(old,new,1)
old2="[0,220,1100,2400].forEach(ms=>setTimeout(v6340SyncCharacterTitle,ms));"
if old2 not in c: raise SystemExit("character title startup train missing")
c=c.replace(old2,"",1);changed["characterTitle"]=1

p.write_text(c,encoding="utf-8")
checks={
 "grow_legacy_train_removed":"[250,1200,5000,15000]" not in c,
 "grow_visibility_kept":"visibilitychange',()=>{if(!document.hidden){retireLegacyOg(true);stamp()}" in c,
 "tower_focus_train_removed":"[0,80,300,900].forEach(ms=>setTimeout(()=>{bind();queueReset()},ms))" not in c,
 "tower_observer_kept":"menuObserver=new MutationObserver(queueReset)" in c,
 "tower_resize_kept":"window.addEventListener('resize',()=>setTimeout(measureHud,0)" in c,
 "title_train_removed":"[0,220,1100,2400].forEach(ms=>setTimeout(v6340SyncCharacterTitle,ms))" not in c,
 "title_passive_delays_removed":"account-ready',()=>setTimeout(v6340SyncCharacterTitle" not in c,
 "title_select_followup_kept":"setTimeout(v6340SyncCharacterTitle,20)" in c,
 "title_render_followup_kept":"requestAnimationFrame(()=>requestAnimationFrame(v6340SyncCharacterTitle))" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH10_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH10-QA",
 "changed":changed,
 "checks":checks,
 "scope":"passive grow/tower/title startup lifecycle only; selection/render DOM-order followups preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))