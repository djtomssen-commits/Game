from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
targets=["v371-true-fullwidth-topbar","v372-authoritative-header","v382-social-mail-buttons","v333-friends-online-status","v383-friend-mail-name-fix"]
out={}
for sid in targets:
 m=re.search(r'<script[^>]*id="'+re.escape(sid)+r'"[^>]*>([\s\S]*?)</script>',src,re.I)
 out[sid]=m.group(1) if m else ""
 print("###",sid)
 if m:
  for i,line in enumerate(m.group(1).splitlines(),1):
   if re.search(r'friends|mail|v032Go|navigation-open-v7119|setTimeout|requestAnimationFrame|pageshow|account-ready|render=function|loadFriends|LoadFriends',line,re.I):
    print(f"{i}: {line[:1000]}")
 print("---")
Path("V8009_SOCIAL_SMALL_SCREEN_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
