from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
targets=["v093-admin-script","v103-admin-player-editor-script","v274-events-gold-mystic-presets","v115-global-ui-dialogs-script","v382-social-mail-buttons","v333-friends-online-status"]
out={}
for sid in targets:
 m=re.search(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*>([\s\S]*?)</script>',src,re.I)
 if not m: out[sid]=""; continue
 body=m.group(1)
 out[sid]=body
 print("###",sid)
 for i,line in enumerate(body.splitlines(),1):
  if re.search(r'const .*BaseRender=render|render=function|setTimeout\(|requestAnimationFrame|pageshow|account-ready|navigation-open-v7119|DOMContentLoaded|v032Go|Load|Ensure|install|renderAdmin|admin',line,re.I):
   print(f"{i}: {line[:1000]}")
 print("---")
Path("V8009_SOCIAL_ADMIN_PATCH_CONTEXT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
