from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=["v260FighterName","v260FighterMeta","v6317","function v260","v260Render","v260Fight"]
out={"build":"V8.009-V6317-FIGHTER-OWNER-AUDIT","hits":{}}
for n in needles:
    arr=[]; start=0
    while True:
        i=src.find(n,start)
        if i<0: break
        arr.append({"index":i,"context":src[max(0,i-1600):i+2800]})
        start=i+1
    out["hits"][n]=arr[:60]
Path("V8009_V6317_FIGHTER_OWNER_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("wrote fighter owner audit")
