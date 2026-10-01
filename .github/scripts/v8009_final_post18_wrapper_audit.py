from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
patterns={
 "v032Go":r"v032Go\s*=\s*function|const\s+\w+\s*=\s*v032Go",
 "render":r"render\s*=\s*function|const\s+\w+\s*=\s*render;",
 "renderInventory":r"renderInventory\s*=\s*function|const\s+\w+\s*=\s*renderInventory;",
}
out={}
for name,pat in patterns.items():
 arr=[]
 for m in re.finditer(pat,src):
  i=m.start();ctx=src[max(0,i-1200):i+2500]
  if "application/x-grow-legends-retired" in ctx: continue
  tags=re.findall(r"v\d{3,4}[A-Za-z0-9_-]*",ctx)
  arr.append({"index":i,"tag":tags[-1] if tags else "","context":ctx})
 out[name]=arr
Path("V8009_FINAL_POST18_WRAPPER_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print({k:len(v) for k,v in out.items()})