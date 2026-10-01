from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "[100,350,900,1800,4200,8200,12500]",
 "[150,500,1200].forEach(ms=>setTimeout(reorder,ms))",
 "[0,120,450,1000,1800].forEach(ms=>setTimeout(()=>{observe();enhance()},ms))",
 "[0,100,350,1000,2500].forEach(ms=>setTimeout(ensureButtons,ms))",
 "function settle()",
 "function reorder()",
 "function ensureButtons()"
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
Path("V8009_FINAL_UI_LAYOUT_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})