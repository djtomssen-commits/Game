from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "[0,120,700].forEach(ms=>setTimeout(refresh,ms))",
 "[0,120,700].forEach(ms=>setTimeout(decorate,ms))",
 "[0,120,650].forEach(ms=>setTimeout(refresh,ms))",
 "[0,250,900].forEach(ms=>setTimeout(fix,ms))",
 "[0,250,900].forEach(ms=>setTimeout(repair,ms))",
 "[0,180,700].forEach(ms=>setTimeout(()=>syncCharacterAvatar('startup'),ms))",
 "[0,250,800].forEach(ms=>setTimeout(rerender,ms))",
 "[120,500,1400].forEach(ms=>setTimeout(()=>{paintEntry()},ms))"
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
Path("V8009_FINAL_BIG_BATCH9_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})