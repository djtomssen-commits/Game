from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "[250,1200,5000,15000].forEach(ms=>setTimeout(()=>{retireLegacyOg(true);stamp()},ms))",
 "[0,80,300,900,1800].forEach(ms=>setTimeout(boot,ms))",
 "[0,80,300,900].forEach(ms=>setTimeout(()=>{bind();queueReset()},ms))",
 "[0,220,1100,2400].forEach(ms=>setTimeout(v6340SyncCharacterTitle,ms))",
 "function retireLegacyOg",
 "function queueReset",
 "v6340SyncCharacterTitle"
]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0:break
  arr.append({"index":i,"context":src[max(0,i-1800):i+3600]})
  start=i+1
 out[n]=arr[:20]
Path("V8009_FINAL_BIG_BATCH10_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})