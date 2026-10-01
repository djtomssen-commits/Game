from pathlib import Path
import json
p=Path("beta.html")
c=p.read_text(encoding="utf-8")
changed={}

patterns=[
("[0,120,700].forEach(ms=>setTimeout(refresh,ms));",
 "window.addEventListener('growlegends:foreground-ready',refresh,{passive:true});","refresh700"),
("[0,120,700].forEach(ms=>setTimeout(decorate,ms));",
 "window.addEventListener('growlegends:foreground-ready',decorate,{passive:true});","decorate700"),
("[0,120,650].forEach(ms=>setTimeout(refresh,ms));",
 "window.addEventListener('growlegends:foreground-ready',refresh,{passive:true});","refresh650"),
("[0,250,900].forEach(ms=>setTimeout(fix,ms));",
 "window.addEventListener('growlegends:foreground-ready',fix,{passive:true});","fix900"),
("[0,250,900].forEach(ms=>setTimeout(repair,ms));",
 "window.addEventListener('growlegends:foreground-ready',repair,{passive:true});","repair900"),
("[0,180,700].forEach(ms=>setTimeout(()=>syncCharacterAvatar('startup'),ms));",
 "window.addEventListener('growlegends:foreground-ready',()=>syncCharacterAvatar('foreground'),{passive:true});","avatar700"),
("[0,250,800].forEach(ms=>setTimeout(rerender,ms));",
 "window.addEventListener('growlegends:foreground-ready',rerender,{passive:true});","rerender800"),
("[120,500,1400].forEach(ms=>setTimeout(()=>{paintEntry()},ms));",
 "window.addEventListener('growlegends:account-ready',paintEntry,{passive:true});","register1400"),
]
for old,new,key in patterns:
    n=c.count(old);changed[key]=n
    if key=="refresh700":
        if n!=2: raise SystemExit(f"{key} expected 2 got {n}")
        c=c.replace(old,new,2)
    else:
        if n!=1: raise SystemExit(f"{key} expected 1 got {n}")
        c=c.replace(old,new,1)

p.write_text(c,encoding="utf-8")
checks={
 "refresh700_removed":"[0,120,700].forEach(ms=>setTimeout(refresh,ms))" not in c,
 "decorate700_removed":"[0,120,700].forEach(ms=>setTimeout(decorate,ms))" not in c,
 "refresh650_removed":"[0,120,650].forEach(ms=>setTimeout(refresh,ms))" not in c,
 "fix900_removed":"[0,250,900].forEach(ms=>setTimeout(fix,ms))" not in c,
 "repair900_removed":"[0,250,900].forEach(ms=>setTimeout(repair,ms))" not in c,
 "avatar700_removed":"[0,180,700].forEach(ms=>setTimeout(()=>syncCharacterAvatar('startup'),ms))" not in c,
 "rerender800_removed":"[0,250,800].forEach(ms=>setTimeout(rerender,ms))" not in c,
 "register1400_removed":"[120,500,1400].forEach(ms=>setTimeout(()=>{paintEntry()},ms))" not in c,
 "click_followups_kept":"setTimeout(()=>syncCharacterAvatar('open-character'),40)" in c and "setTimeout(rerender,0)" in c,
}
if not all(checks.values()): raise SystemExit(json.dumps({"changed":changed,"checks":checks}))
Path("V8009_FINAL_BIG_BATCH9_QA.json").write_text(json.dumps({
 "build":"V8.009-FINAL-BIG-BATCH9-QA",
 "changed":changed,
 "checks":checks,
 "scope":"legacy visual startup retries only; click/action followups preserved"
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"changed":changed,"checks":checks}))