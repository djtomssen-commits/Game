from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
lines=src.splitlines()
wr=[]
for m in re.finditer(r"v032Go\s*=\s*function|const\s+\w+\s*=\s*v032Go",src):
 i=m.start();ctx=src[max(0,i-1400):i+2800]
 if "application/x-grow-legends-retired" in ctx: continue
 tags=re.findall(r"v\d{3,4}[A-Za-z0-9_-]*",ctx)
 wr.append({"index":i,"tag":tags[-1] if tags else "","context":ctx})
rt=[]
for i,line in enumerate(lines):
 compact=line.replace(" ","")
 if "setTimeout" not in line: continue
 if ("].forEach" in compact and compact.startswith("[")) or any(x in line for x in ["5000","7000","8000","9000","10000","12000","15000","17000","18000","20000","22000","30000","40000","60000"]):
  ctx="\n".join(lines[max(0,i-10):min(len(lines),i+18)])
  tags=re.findall(r"v\d{3,4}[A-Za-z0-9_-]*",ctx)
  rt.append({"line":i+1,"tag":tags[-1] if tags else "","text":line.strip(),"context":ctx})
out={"wrappers":wr,"retry_hits":rt}
Path("V8009_FINAL_POST15_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("wrappers",len(wr),"retry_hits",len(rt))
