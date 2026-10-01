from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
targets=["v7260-bag-dealer-admin-only-script","v338-harz-dealer-modern","v567-harz-dealer-final"]
out={}
for sid in targets:
 m=re.search(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*>([\s\S]*?)</script>',src,re.I)
 out[sid]=m.group(1) if m else ""
Path("V8009_DEALER_SMALL_SCREEN_PATCH_CONTEXT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
for k,v in out.items():
 print("###",k)
 for i,line in enumerate(v.splitlines(),1):
  if re.search(r'render=function|v322RenderDealer|setTimeout\(|pageshow|account-ready|foreground-ready|visibilitychange|navigation-open-v7119|sync\(|ensure\(',line,re.I):
   print(f"{i}: {line[:1000]}")
 print("---")
