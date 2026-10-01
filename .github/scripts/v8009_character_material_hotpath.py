from pathlib import Path
import re
src=Path("beta.html").read_text(encoding="utf-8")
blocks=[]
for m in re.finditer(r'<script[^>]*id="([^"]+)"[^>]*>([\s\S]*?)</script>',src,re.I):
    sid,body=m.group(1),m.group(2)
    low=(sid+" "+body).lower()
    if any(k in low for k in ["v546","v681","materialien","rendermaterial","material-tab","materials-tab"]):
        if any(k in low for k in ["character","material"]):
            blocks.append((sid,body))
print("BLOCKS",len(blocks))
for sid,body in blocks:
    print("###",sid)
    for line in body.splitlines():
        if re.search(r'material|render|requestAnimationFrame|setTimeout|MutationObserver|addEventListener|onclick|tab|inventory|enhance|observe',line,re.I):
            print(line[:700])
    print("---")
