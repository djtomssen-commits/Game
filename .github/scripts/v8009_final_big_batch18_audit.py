from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
targets=["__v467DungeonGoWrapped","v201BaseGo","v087FixMainAttributeBadge","v6101RenderOpenedScreen"]
out={}
for n in targets:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0:break
  arr.append({"index":i,"context":src[max(0,i-2800):i+5600]})
  start=i+1
 out[n]=arr[:20]
Path("V8009_FINAL_BIG_BATCH18_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})