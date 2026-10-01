from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
# targeted visual cleanup candidate + remaining nav wrappers
hits=[]
for m in re.finditer(r"(?:v032Go\s*=\s*function|const\s+\w+\s*=\s*v032Go\s*;|const\s+\w+\s*=\s*window\.v032Go)",src):
    i=m.start()
    ctx=src[max(0,i-2200):i+5200]
    tags=re.findall(r"v\d{3,4}[A-Za-z0-9_-]*",ctx)
    hits.append({"index":i,"tag":tags[-1] if tags else "","match":m.group(0),"context":ctx})
Path("V8009_FINAL_NAV_WRAPPER_AUDIT.json").write_text(json.dumps({"count":len(hits),"hits":hits},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("nav wrappers",len(hits))
