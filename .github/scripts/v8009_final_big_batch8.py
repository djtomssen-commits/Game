from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

old="[0,80,300,900,1800].forEach(ms=>setTimeout(boot,ms));"
if old not in c: raise SystemExit("profile/viewport boot train missing")
c=c.replace(old,"window.addEventListener('growlegends:account-ready',boot,{passive:true});",1);changed["profileViewport"]=1

old="[0,80,300,900,1800].forEach(ms=>setTimeout(()=>{apply();measureHud()},ms));"
if old not in c: raise SystemExit("native fullscreen train missing")
c=c.replace(old,"window.addEventListener('growlegends:account-ready',()=>{apply();measureHud()},{passive:true});",1);changed["nativeFullscreen"]=1

p.write_text(c,encoding="utf-8")
checks={
 "profile_train_removed":"[0,80,300,900,1800].forEach(ms=>setTimeout(boot,ms))" not in c,
 "profile_resize_kept":"window.addEventListener('resize',queue" in c,
 "profile_orientation_kept":"orientationchange',()=>setTimeout(queue,80)" in c,
 "native_train_removed":"[0,80,300,900,1800].forEach(ms=>setTimeout(()=>{apply();measureHud()},ms))" not in c,
 "native_resize_kept":"window.addEventListener('resize',measureHud" in c,
 "native_pageshow_kept":"window.addEventListener('pageshow',apply" in c,
 "account_ready_added":"growlegends:account-ready" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH8_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH8-QA",
 "changed":changed,
 "checks":checks,
 "scope":"passive viewport/fullscreen startup retries only; resize/orientation/native behavior preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))