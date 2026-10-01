from pathlib import Path
import json,re
src=Path("beta.html").read_text(encoding="utf-8")
hits=[]
for m in re.finditer(r"\[(?:\s*\d+\s*,?){2,}\]\s*\.forEach\s*\([^\n]{0,220}setTimeout|setTimeout\([^\n]{0,220}(?:3000|4000|4200|5000|5200|7000|8000|9000|10000|12000|15000|16000|18000|19000|30000|60000)",src):
 i=m.start()
 ctx=src[max(0,i-1600):i+3200]
 tag=(re.findall(r"v\d{3,4}[A-Za-z0-9_-]*",ctx) or [""])[-1]
 hits.append({"index":i,"tag":tag,"match":m.group(0),"context":ctx})
Path("V8009_FINAL_LONG_RETRY_AUDIT.json").write_text(json.dumps({"count":len(hits),"hits":hits},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("long retry candidates",len(hits))
