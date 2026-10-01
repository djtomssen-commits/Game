from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

# updateValues/version block
for old in [
 "  setTimeout(()=>{updateValues();version()},350);\n",
 "  setTimeout(()=>{updateValues();version()},1500);\n",
 "  setTimeout(()=>{updateValues();version()},3000);\n",
]:
    if old not in c: raise SystemExit("updateValues retry missing")
    c=c.replace(old,"",1)
anchor="  document.addEventListener('DOMContentLoaded',()=>{updateValues();version()},{once:true});"
if anchor not in c: raise SystemExit("updateValues DOM anchor missing")
c=c.replace(anchor,anchor+"\n  window.addEventListener('pageshow',()=>{updateValues();version()},{passive:true});\n  window.addEventListener('growlegends:account-ready',()=>{updateValues();version()},{passive:true});",1)
changed["updateValues"]=1

# two generic update/version blocks
seq="""  document.addEventListener('DOMContentLoaded',update,{once:true});
  setTimeout(update,350);
  setTimeout(update,1400);
  setTimeout(update,3000);"""
rep="""  document.addEventListener('DOMContentLoaded',update,{once:true});
  window.addEventListener('pageshow',update,{passive:true});
  window.addEventListener('growlegends:account-ready',update,{passive:true});"""
n=c.count(seq)
if n!=2: raise SystemExit(f"generic update blocks expected 2 got {n}")
c=c.replace(seq,rep)
changed["generic_update"]=n

old="  [250,1000].forEach(ms=>setTimeout(()=>{try{syncVersion()}catch(e){}},ms));"
if old not in c: raise SystemExit("syncVersion retry line missing")
c=c.replace(old,"  try{syncVersion()}catch(e){}\n  window.addEventListener('growlegends:account-ready',()=>{try{syncVersion()}catch(e){}},{passive:true});",1)
changed["syncVersion"]=1

old=" [0,500,2500,7000,17000].forEach(ms=>setTimeout(keepVersion,ms));"
if old not in c: raise SystemExit("keepVersion retry train missing")
c=c.replace(old," keepVersion();\n document.addEventListener('DOMContentLoaded',keepVersion,{once:true});\n window.addEventListener('pageshow',keepVersion,{passive:true});\n window.addEventListener('growlegends:account-ready',keepVersion,{passive:true});",1)
changed["keepVersion"]=1

old=" [50,250,700,1600,3500,8000,15000,30000,60000].forEach(ms=>setTimeout(()=>{stamp();paintStatus()},ms));"
if old not in c: raise SystemExit("paintStatus retry train missing")
c=c.replace(old," window.addEventListener('growlegends:account-ready',()=>{stamp();paintStatus()},{passive:true});",1)
changed["paintStatus"]=1

p.write_text(c,encoding="utf-8")
checks={
 "updateValues_delays_removed":"setTimeout(()=>{updateValues();version()},3000)" not in c,
 "generic_update_delays_removed":"setTimeout(update,3000)" not in c,
 "syncVersion_train_removed":"[250,1000].forEach(ms=>setTimeout(()=>{try{syncVersion()}catch(e){}},ms))" not in c,
 "keepVersion_train_removed":"[0,500,2500,7000,17000]" not in c,
 "paintStatus_train_removed":"[50,250,700,1600,3500,8000,15000,30000,60000]" not in c,
 "status_click_followup_kept":"setTimeout(()=>{install();paintStatus()},80)" in c,
 "account_hooks_added":c.count("growlegends:account-ready")>0,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_VERSION_STATUS_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-VERSION-STATUS-QA",
 "changed":changed,
 "checks":checks,
 "scope":"version/status repaint lifecycle only; gameplay/state/server authority unchanged"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))