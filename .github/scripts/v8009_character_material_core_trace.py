from pathlib import Path
import re
src=Path("beta.html").read_text(encoding="utf-8")
for sid in ["v546","v681","v683"]:
 print("### TARGET",sid)
 for m in re.finditer(r'<script[^>]*id="([^"]*'+sid+r'[^"]*)"[^>]*>([\s\S]*?)</script>',src,re.I):
  print("SCRIPT",m.group(1))
  body=m.group(2)
  for i,line in enumerate(body.splitlines(),1):
   if re.search(r'function |render|enhance|observe|schedule|requestAnimationFrame|setTimeout|addEventListener|onclick|data-tab|innerHTML|replaceChildren|appendChild',line,re.I):
    print(f"{i}: {line[:900]}")
  print("---")
