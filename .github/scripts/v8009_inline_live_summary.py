from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
rows=[]
for m in re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',src,re.I):
    attrs,body=m.group(1),m.group(2)
    if 'src=' in attrs.lower() or 'application/x-grow-legends-retired' in attrs.lower(): continue
    mid=re.search(r'id=["\']([^"\']+)["\']',attrs,re.I)
    rows.append({"id":mid.group(1) if mid else "(no-id)","bytes":len(body)})
rows.sort(key=lambda x:x["bytes"],reverse=True)
print(json.dumps({
 "beta_bytes":len(src.encode("utf-8")),
 "inline_count":len(rows),
 "inline_bytes":sum(x["bytes"] for x in rows),
 "largest":rows[:60]
},ensure_ascii=False,indent=2))