from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "v420-levelup-notification-fix",
 "v350BaseGo",
 "v363-header-alignment-polish",
 "const baseGo=v032Go;",
 "v376-quest-destination-dedupe",
 "bindGear();version()"
]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0: break
  arr.append({"index":i,"context":src[max(0,i-2200):i+4600]})
  start=i+1
 out[n]=arr[:25]
Path("V8009_FINAL_BIG_BATCH16_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})