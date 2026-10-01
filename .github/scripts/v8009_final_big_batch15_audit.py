from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "setTimeout(()=>{fix();version()},300)",
 "requestAnimationFrame(()=>{align();version()})",
 "setTimeout(()=>{align();version()},300)",
 "function align()",
 "function fix()",
 "[0,250,900].forEach(ms=>setTimeout(repairCurrentEnemy,ms))"
]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0: break
  arr.append({"index":i,"context":src[max(0,i-2200):i+4800]})
  start=i+1
 out[n]=arr[:30]
Path("V8009_FINAL_BIG_BATCH15_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})