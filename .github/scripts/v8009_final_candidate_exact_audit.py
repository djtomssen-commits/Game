from pathlib import Path
import re
src=Path("beta.html").read_text(encoding="utf-8")
for sid in ["v351-world-mobile-header-cleanup","v352-world-header-ghost-cleanup","v4126-power-rpc-diagnostics","v4150-dungeon-key-final"]:
 m=re.search(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*>([\s\S]*?)</script>',src,re.I)
 print("###",sid)
 if not m:
  # fallback by marker occurrence
  i=src.find(sid.replace("-final",""))
  print(src[max(0,i-1800):i+5000] if i>=0 else "missing")
  continue
 body=m.group(1)
 for i,line in enumerate(body.splitlines(),1):
  if re.search(r'v032Go|render=function|requestAnimationFrame|setTimeout|DOMContentLoaded|pageshow|navigation-open-v7119|account-ready|install|repaint|ensure|rebuild|paint|version',line,re.I):
   print(f"{i}: {line[:1000]}")
 print("---")
