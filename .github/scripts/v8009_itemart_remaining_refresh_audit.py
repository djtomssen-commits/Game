from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "v4117-boots-art-fix",
 "[80,300,1200,3200]",
 "DOMContentLoaded',()=>setTimeout(()=>{refresh();stamp();},60",
 "v6106-real-item-art",
 "v6106RefreshItemArt",
 "growlegends:first-playable",
 "setTimeout(()=>{if(!window.v7206StartupBusy?.())refresh()},220)"
]
out={"build":"V8.009-ITEMART-REMAINING-REFRESH-AUDIT","hits":{}}
for n in needles:
    arr=[]; start=0
    while True:
        i=src.find(n,start)
        if i<0: break
        arr.append({"index":i,"context":src[max(0,i-1700):i+3300]})
        start=i+1
    out["hits"][n]=arr[:50]
Path("V8009_ITEMART_REMAINING_REFRESH_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("wrote itemart remaining audit")
