from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "[0,80,300,900,1800].forEach(ms=>setTimeout(boot,ms))",
 "[0,80,300,900,1800].forEach(ms=>setTimeout(()=>{apply();measureHud()},ms))",
 "[0,120,400,900,1800].forEach(ms=>setTimeout(()=>{observe();enhance()},ms))",
 "function boot()",
 "function apply(){",
 "v681EnhanceMaterials"
]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0:break
  arr.append({"index":i,"context":src[max(0,i-1700):i+3400]})
  start=i+1
 out[n]=arr[:20]
Path("V8009_FINAL_BIG_BATCH8_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})