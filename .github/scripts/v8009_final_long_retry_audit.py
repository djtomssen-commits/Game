from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
lines=src.splitlines()
hits=[]
long_nums=("3000","4000","4200","5000","5200","7000","8000","9000","10000","12000","15000","16000","18000","19000","30000","60000")
for idx,line in enumerate(lines):
    compact=line.replace(" ","")
    is_array=("].forEach" in compact and "setTimeout" in compact and compact.startswith("["))
    is_long=("setTimeout" in line and any(n in line for n in long_nums))
    if not (is_array or is_long):
        continue
    lo=max(0,idx-18);hi=min(len(lines),idx+32)
    ctx="\n".join(lines[lo:hi])
    tags=re.findall(r"v\d{3,4}[A-Za-z0-9_-]*",ctx)
    hits.append({"line":idx+1,"tag":tags[-1] if tags else "","text":line.strip(),"context":ctx})
Path("V8009_FINAL_LONG_RETRY_AUDIT.json").write_text(json.dumps({"count":len(hits),"hits":hits},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("long retry candidates",len(hits))
