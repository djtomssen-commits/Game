from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
rows=[]
for idx,m in enumerate(re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',src,re.I),1):
    attrs,body=m.group(1),m.group(2)
    if 'src=' in attrs.lower() or 'application/x-grow-legends-retired' in attrs.lower(): continue
    if re.search(r'id=["\']',attrs,re.I): continue
    if len(body)<3000: continue
    first=[x.strip() for x in body.splitlines() if x.strip()][:18]
    funcs=re.findall(r'(?:function\s+([A-Za-z0-9_$]+)|window\.([A-Za-z0-9_$]+)\s*=|const\s+([A-Za-z0-9_$]+)\s*=\s*\()',body)
    names=[]
    for tup in funcs[:30]:
        for v in tup:
            if v and v not in names:names.append(v)
    refs=[]
    for key in ["character","shop","quest","dungeon","grow","guild","worldboss","hall","mail","friends","admin","tower","settings","login","item","material"]:
        if key in body.lower(): refs.append(key)
    rows.append({"ordinal":idx,"bytes":len(body),"first_lines":first,"names":names[:20],"refs":refs})
rows=sorted(rows,key=lambda x:x["bytes"],reverse=True)
Path("V8009_ANONYMOUS_INLINE_AUDIT.json").write_text(json.dumps(rows[:40],indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(rows[:25],indent=2,ensure_ascii=False))
