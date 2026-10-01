from pathlib import Path
import re
src=Path("beta.html").read_text(encoding="utf-8")
targets=["v314-talent-tree","v327-worldboss-confirm-attributes","v4140-attribute-display-owner","v543-talents-mobile-tree-js","v444-character-inventory-order-fix","v514-heldenquartier-reference-js"]
for sid in targets:
 print("###",sid)
 m=re.search(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*>([\s\S]*?)</script>',src,re.I)
 if not m:
  print("missing");continue
 body=m.group(1)
 for i,line in enumerate(body.splitlines(),1):
  if re.search(r'render=function|renderSkillTree|v125RenderAttrs|v459|requestAnimationFrame|setTimeout|DOMContentLoaded|pageshow|navigation-open-v7119|data-tab="(?:attributes|talents)"|arrangeCharacter|paint\(',line,re.I):
   print(f"{i}: {line[:1000]}")
 print("---")
