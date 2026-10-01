from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
lines=src.splitlines()
hits=[]
for i,line in enumerate(lines):
    compact=line.replace(" ","")
    if "setTimeout" not in line: 
        continue
    if ("].forEach" in compact and compact.startswith("[")) or any(x in line for x in ["5000","7000","8000","9000","10000","12000","15000","17000","18000","22000","30000","40000","60000"]):
        ctx="\n".join(lines[max(0,i-12):min(len(lines),i+20)])
        tags=re.findall(r"v\d{3,4}[A-Za-z0-9_-]*",ctx)
        hits.append({"line":i+1,"tag":tags[-1] if tags else "","text":line.strip(),"context":ctx})
Path("V8009_FINAL_POST_BATCH11_RETRY_AUDIT.json").write_text(json.dumps({"count":len(hits),"hits":hits},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("remaining long/retry candidates",len(hits))
