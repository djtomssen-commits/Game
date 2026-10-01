from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
lines=src.splitlines()
stats={
 "setTimeout":src.count("setTimeout("),
 "setInterval":src.count("setInterval("),
 "requestAnimationFrame":src.count("requestAnimationFrame("),
 "MutationObserver":src.count("new MutationObserver("),
 "v032Go_wrappers":len(re.findall(r"v032Go\s*=\s*function",src)),
}
long=[]
for i,line in enumerate(lines):
    compact=line.replace(" ","")
    if "setTimeout" in line and (("].forEach" in compact and compact.startswith("[")) or any(x in line for x in ["5000","7000","8000","9000","10000","12000","15000","16000","17000","18000","19000","22000","30000","40000","60000"])):
        ctx="\n".join(lines[max(0,i-10):min(len(lines),i+18)])
        tags=re.findall(r"v\d{3,4}[A-Za-z0-9_-]*",ctx)
        long.append({"line":i+1,"tag":tags[-1] if tags else "","text":line.strip(),"context":ctx})
Path("V8009_FINAL_POST_SWEEP_INVENTORY.json").write_text(json.dumps({"stats":stats,"long_count":len(long),"long":long},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(stats,"long",len(long))
