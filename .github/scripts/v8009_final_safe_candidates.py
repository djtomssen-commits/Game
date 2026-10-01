from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
cands=[]
for m in re.finditer(r"(setTimeout\s*\(|requestAnimationFrame\s*\(|new\s+MutationObserver\s*\(|v032Go\s*=\s*function|const\s+\w+\s*=\s*v032Go)",src):
    i=m.start()
    ctx=src[max(0,i-700):i+1300]
    low=ctx.lower()
    # exclude clearly functional/security/combat/server timers
    if any(x in low for x in [
        "idle","logout","combat","fight","bossattack","sleep=","server","receipt",
        "retry fetch","supabase","cooldown","countdown","quest ends","ends||",
        "setinterval(v301checkidle","v300reconcile","push","notification"
    ]):
        continue
    score=0
    for x in ["render","paint","decorate","refresh","sync","install","open","pageshow","domcontentloaded","navigation-open-v7119"]:
        if x in low: score+=1
    if "settimeout" in m.group(0).lower(): score+=1
    if "requestanimationframe" in m.group(0).lower(): score+=1
    if "mutationobserver" in m.group(0).lower(): score+=2
    if score<2: continue
    tag=""
    mm=re.findall(r"v\d{3,4}[A-Za-z0-9_]*",ctx)
    if mm: tag=mm[-1]
    cands.append({"index":i,"score":score,"tag":tag,"kind":m.group(0),"context":ctx})
# dedupe nearby
out=[]
last=-99999
for x in sorted(cands,key=lambda x:(-x["score"],x["index"])):
    if any(abs(x["index"]-y["index"])<350 for y in out): continue
    out.append(x)
out=out[:40]
Path("V8009_FINAL_SAFE_CANDIDATES.json").write_text(json.dumps({"count":len(out),"candidates":out},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("safe candidates",len(out))
