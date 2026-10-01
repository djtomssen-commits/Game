from pathlib import Path
import json
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "v4158",
 "v7198",
 "v6213",
 "v6239",
 "v6339",
 "v435BookRefreshTimer",
 "v545",
 "v546MaterialsHeader",
 "v6102EquipmentDiagnostics"
]
out={}
for n in needles:
 arr=[];start=0
 while True:
  i=src.find(n,start)
  if i<0:break
  arr.append({"index":i,"context":src[max(0,i-1800):i+3600]})
  start=i+1
 out[n]=arr[:30]
Path("V8009_FINAL_BIG_BATCH_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("wrote big batch audit")
