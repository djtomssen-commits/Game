from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
rows=[]
for m in re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',src,re.I):
    attrs,body=m.group(1),m.group(2)
    if 'src=' in attrs.lower() or 'application/x-grow-legends-retired' in attrs.lower(): continue
    mid=re.search(r'id=["\']([^"\']+)["\']',attrs,re.I)
    sid=mid.group(1) if mid else "(no-id)"
    rows.append({"id":sid,"bytes":len(body)})
rows=sorted(rows,key=lambda x:x["bytes"],reverse=True)
Path("V8009_INLINE_LARGEST_REMAINING.json").write_text(json.dumps(rows[:80],indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(rows[:40],indent=2,ensure_ascii=False))
