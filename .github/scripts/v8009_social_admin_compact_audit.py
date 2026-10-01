from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
targets=["friends","mail","admin"]
out={}
for target in targets:
 rows=[]
 for m in re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',src,re.I):
  attrs,body=m.group(1),m.group(2)
  if 'src=' in attrs.lower() or 'application/x-grow-legends-retired' in attrs.lower(): continue
  low=body.lower()
  if target not in low and ('#'+target) not in low: continue
  sid=(re.search(r'id=["\']([^"\']+)["\']',attrs,re.I) or [None,"(no-id)"])[1]
  wrappers=[line.strip() for line in body.splitlines() if re.search(r'(const .*base.*=render|render=function|v032Go|requestAnimationFrame|setTimeout\(|MutationObserver|pageshow|account-ready|navigation-open-v7119)',line,re.I)]
  rows.append({"id":sid,"bytes":len(body),"wrappers":wrappers[:40]})
 out[target]=sorted(rows,key=lambda x:x["bytes"],reverse=True)
Path("V8009_SOCIAL_ADMIN_COMPACT_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
for k,v in out.items():
 print("###",k)
 for x in v[:20]:
  print(x["id"],x["bytes"])
  for l in x["wrappers"][:12]: print(" ",l)
