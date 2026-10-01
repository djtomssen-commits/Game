from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=["__v4107Go","POWER_NAVIGATION_DRIFT","growlegends:navigation-open-v7119","function openPage","function runAndRender"]
out={"build":"V8.009-SYSTEMTECH-NAV-AUDIT","hits":{}}
for n in needles:
    arr=[]
    start=0
    while True:
        i=src.find(n,start)
        if i<0: break
        arr.append({"index":i,"context":src[max(0,i-1800):i+3200]})
        start=i+1
    out["hits"][n]=arr
Path("V8009_SYSTEMTECH_NAV_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("wrote systemtech nav audit")
