from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
targets=["bagDealer","harzDealer","admin","friends","mail","attributes","talents","shop","character"]
out={}
for target in targets:
  rows=[]
  for m in re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',src,re.I):
    attrs,body=m.group(1),m.group(2)
    if 'src=' in attrs.lower(): continue
    if target.lower() not in body.lower() and ('#'+target.lower()) not in body.lower():
      continue
    mid=re.search(r'id=["\']([^"\']+)["\']',attrs,re.I)
    sid=mid.group(1) if mid else "(no-id)"
    if 'application/x-grow-legends-retired' in attrs.lower(): state="retired"
    else: state="active"
    interesting=[]
    for line in body.splitlines():
      if re.search(r'render|v032Go|navigation-open-v7119|requestAnimationFrame|setTimeout|MutationObserver|addEventListener|innerHTML|replaceChildren|appendChild|fetch|supabase|click',line,re.I):
        interesting.append(line.strip()[:900])
    rows.append({"id":sid,"state":state,"bytes":len(body),"interesting":interesting[:35]})
  out[target]=sorted(rows,key=lambda x:x["bytes"],reverse=True)
Path("V8009_SCREEN_TAB_REST_OWNER_AUDIT.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
for k,v in out.items():
  active=[x for x in v if x["state"]=="active"]
  print(k,"active",len(active),"top",[x["id"] for x in active[:12]])
