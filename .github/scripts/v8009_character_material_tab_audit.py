from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
needles=[
 "material",
 "v546",
 "v681",
 "renderMaterials",
 "materials",
 "data-tab=\"materials\"",
 "materialien",
 "v6102PaintEquipmentSlots"
]
hits=[]
for n in needles:
 start=0
 while True:
  i=src.lower().find(n.lower(),start)
  if i<0: break
  ctx=src[max(0,i-1800):i+3600]
  if any(x in ctx for x in ["character","renderMaterials","Material","material"]):
   ids=re.findall(r'<script[^>]*id="([^"]+)"',src[max(0,i-5000):i],re.I)
   hits.append({"needle":n,"index":i,"script":ids[-1] if ids else "","context":ctx})
  start=i+1
# dedupe nearby
out=[];seen=set()
for h in hits:
 k=(h["script"],h["index"]//500)
 if k in seen: continue
 seen.add(k);out.append(h)
Path("V8009_CHARACTER_MATERIAL_TAB_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("hits",len(out))
