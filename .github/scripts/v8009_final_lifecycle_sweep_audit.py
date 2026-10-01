from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
patterns={
 "timeouts":r"setTimeout\s*\(",
 "intervals":r"setInterval\s*\(",
 "rafs":r"requestAnimationFrame\s*\(",
 "observers":r"new\s+MutationObserver\s*\(",
 "go_wrappers":r"v032Go\s*=\s*function|const\s+\w+\s*=\s*v032Go",
}
out={"build":"V8.009-FINAL-LIFECYCLE-SWEEP-AUDIT","counts":{},"hits":{}}
for name,pat in patterns.items():
    arr=[]
    for m in re.finditer(pat,src):
        i=m.start()
        arr.append({"index":i,"context":src[max(0,i-900):i+1800]})
    out["counts"][name]=len(arr)
    out["hits"][name]=arr
Path("V8009_FINAL_LIFECYCLE_SWEEP_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(out["counts"],indent=2))
