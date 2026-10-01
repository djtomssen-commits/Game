from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "[0,120,400,900,1800].forEach(ms=>setTimeout(()=>{observe();enhance()},ms))",
 "[0,80,220,600,1400].forEach(ms=>setTimeout(schedule,ms))",
 "[0,250,900,2200,5000].forEach(ms=>setTimeout(()=>{attach();queueMount();stamp()},ms))",
 "[0,250,1000,3000].forEach(ms=>setTimeout(prepareCard,ms))",
 "function observe(){",
 "function sync(){",
 "function attach(){",
 "function prepareCard(){"
]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0:break
  arr.append({"index":i,"context":src[max(0,i-1800):i+3800]})
  start=i+1
 out[n]=arr[:20]
Path("V8009_FINAL_BIG_BATCH7_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})