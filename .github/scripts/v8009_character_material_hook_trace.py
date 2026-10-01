from pathlib import Path
import re
src=Path("beta.html").read_text(encoding="utf-8")
for needle in ["v546RenderMaterials","v681EnhanceMaterials","v683MaterialMultiSell"]:
 print("###",needle)
 start=0
 while True:
  i=src.find(needle,start)
  if i<0:break
  pre=src[max(0,i-2500):i]
  ids=re.findall(r'<script[^>]*id="([^"]+)"',pre,re.I)
  sid=ids[-1] if ids else "unknown"
  ctx=src[max(0,i-420):i+700].replace("\n"," ")
  print("SCRIPT",sid,"INDEX",i)
  print(ctx)
  print("---")
  start=i+1
