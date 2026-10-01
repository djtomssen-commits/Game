from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "v4115-item-art",
 "function refresh()",
 "v4115QaWrapped",
 "[80,300,900,2200,5200,12500]",
 "v4111ComicItemArtUri",
 "v466ItemArtUri"
]
out={"build":"V8.009-V4115-OWNER-AUDIT","hits":{}}
for n in needles:
    arr=[]; start=0
    while True:
        i=src.find(n,start)
        if i<0: break
        arr.append({"index":i,"context":src[max(0,i-1800):i+3200]})
        start=i+1
    out["hits"][n]=arr[:50]
Path("V8009_V4115_OWNER_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("wrote v4115 owner audit")
