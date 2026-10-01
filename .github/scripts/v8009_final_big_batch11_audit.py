from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "[200,800,2200,5000].forEach(ms=>setTimeout(()=>{stamp();paint()},ms))",
 "[250,1000,3000].forEach(ms=>setTimeout(paint,ms))",
 "setTimeout(sync,0);setTimeout(sync,250);setTimeout(sync,1200);",
 "function paint(){try{window.v441PaintResources",
 "projectedDays",
 "v4160-systemtechnik-settings-remove"
]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0: break
  arr.append({"index":i,"context":src[max(0,i-1600):i+3200]})
  start=i+1
 out[n]=arr[:20]
Path("V8009_FINAL_BIG_BATCH11_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})