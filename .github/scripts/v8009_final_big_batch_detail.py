from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=["v4106Items","__v435BookRefreshTimer","[500,1800,4200,9000]","function reconcile","function scheduleBookRefresh"]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0:break
  arr.append({"index":i,"context":src[max(0,i-2600):i+5200]})
  start=i+1
 out[n]=arr[:20]
Path("V8009_FINAL_BIG_BATCH_DETAIL.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("detail audit")