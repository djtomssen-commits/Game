from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
lines=src.splitlines()
hits=[]
for i,line in enumerate(lines):
    compact=line.replace(" ","")
    if "setTimeout" in line and "].forEach" in compact and compact.startswith("["):
        ctx="\n".join(lines[max(0,i-14):min(len(lines),i+24)])
        tags=re.findall(r"v\d{3,4}[A-Za-z0-9_-]*",ctx)
        hits.append({"line":i+1,"tag":tags[-1] if tags else "","text":line.strip(),"context":ctx})
Path("V8009_FINAL_REMAINING_TIMEOUT_ARRAYS.json").write_text(json.dumps({"count":len(hits),"hits":hits},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("remaining timeout arrays",len(hits))
