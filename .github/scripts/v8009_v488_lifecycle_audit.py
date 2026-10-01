from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=["__v488Go","[250,900,2200,5200,10200,16200]","ensureMenu","ensureHomeLink","paintPrismaticInventory","renderForge"]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0:break
  arr.append({"index":i,"context":src[max(0,i-2200):i+4200]})
  start=i+1
 out[n]=arr[:40]
Path("V8009_V488_LIFECYCLE_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("v488 audit")