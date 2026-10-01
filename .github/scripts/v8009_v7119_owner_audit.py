from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=["navigation-open-v7119","v7119","const base=v032Go","v032Go=function"]
out={"build":"V8.009-V7119-OWNER-AUDIT","hits":{}}
for n in needles:
    arr=[]
    start=0
    while True:
        i=src.find(n,start)
        if i<0: break
        arr.append({"index":i,"context":src[max(0,i-2200):i+4200]})
        start=i+1
    out["hits"][n]=arr[:40]
Path("V8009_V7119_OWNER_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("wrote v7119 owner audit")
