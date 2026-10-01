from pathlib import Path
import re
src=Path("beta.html").read_text(encoding="utf-8")
for sid in ["v546-materials-grow-legends-js","v681-material-sell-core","v683-material-multisell-core"]:
 m=re.search(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*>([\s\S]*?)</script>',src,re.I)
 print("###",sid)
 if not m: print("missing"); continue
 lines=m.group(1).splitlines()
 if sid.startswith("v546"):
  for a,b in [(95,160)]:
   for i in range(a-1,min(b,len(lines))): print(f"{i+1}: {lines[i]}")
 else:
  for a,b in [(140,175)] if sid.startswith("v681") else [(115,135)]:
   for i in range(a-1,min(b,len(lines))): print(f"{i+1}: {lines[i]}")
