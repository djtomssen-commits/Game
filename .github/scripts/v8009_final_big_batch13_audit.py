from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "[150,650,1600].forEach(ms=>setTimeout(updateBars,ms))",
 "function updateBars",
 "function flushPending",
 "[120,900,2600].forEach(ms=>setTimeout(()=>{stamp();installMenu()},ms))",
 "function installMenu",
 "[0,250,800].forEach(ms=>setTimeout(repairTower,ms))",
 "function repairTower",
 "[0,180,700].forEach(ms=>setTimeout(repair,ms))",
 "v080-class-avatar-img"
]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0:break
  arr.append({"index":i,"context":src[max(0,i-2400):i+5000]})
  start=i+1
 out[n]=arr[:20]
Path("V8009_FINAL_BIG_BATCH13_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})