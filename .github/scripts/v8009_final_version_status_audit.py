from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "setTimeout(()=>{updateValues();version()},3000)",
 "setTimeout(update,3000)",
 "[250,1000].forEach(ms=>setTimeout(()=>{try{syncVersion()}catch(e){}},ms))",
 "[0,500,2500,7000,17000].forEach(ms=>setTimeout(keepVersion,ms))",
 "[50,250,700,1600,3500,8000,15000,30000,60000].forEach(ms=>setTimeout(()=>{stamp();paintStatus()},ms))"
]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0:break
  arr.append({"index":i,"context":src[max(0,i-1400):i+2400]})
  start=i+1
 out[n]=arr
Path("V8009_FINAL_VERSION_STATUS_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})