from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
targets=["bagDealer","harzDealer","friends","mail","admin"]
out={}
for target in targets:
  rows=[]
  for m in re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',src,re.I):
    attrs,body=m.group(1),m.group(2)
    if 'src=' in attrs.lower(): continue
    low=body.lower()
    if target.lower() not in low and ('#'+target.lower()) not in low:
      continue
    mid=re.search(r'id=["\']([^"\']+)["\']',attrs,re.I)
    sid=mid.group(1) if mid else "(no-id)"
    state="retired" if 'application/x-grow-legends-retired' in attrs.lower() else "active"
    lines=[]
    for line in body.splitlines():
      if re.search(r'render|v032Go|navigation-open-v7119|requestAnimationFrame|setTimeout|MutationObserver|addEventListener|innerHTML|replaceChildren|fetch|rpc|supabase|click|pageshow|account-ready|foreground-ready|first-playable',line,re.I):
        lines.append(line.strip()[:900])
    rows.append({"id":sid,"state":state,"bytes":len(body),"lines":lines[:45]})
  out[target]=sorted(rows,key=lambda x:x["bytes"],reverse=True)
Path("V8009_SMALL_SCREENS_COVERAGE_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
for k,v in out.items():
  active=[x for x in v if x["state"]=="active"]
  print(k,"active",len(active),"top",[(x["id"],x["bytes"]) for x in active[:15]])
