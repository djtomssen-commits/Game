from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
rows=[]; ext=[]
for m in re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',src,re.I):
    attrs,body=m.group(1),m.group(2)
    if 'src=' in attrs.lower():
        sm=re.search(r'src=["\']([^"\']+)["\']',attrs,re.I)
        ext.append(sm.group(1) if sm else '')
        continue
    if 'application/x-grow-legends-retired' in attrs.lower(): continue
    mid=re.search(r'id=["\']([^"\']+)["\']',attrs,re.I)
    rows.append({"id":mid.group(1) if mid else "(no-id)","bytes":len(body)})
rows.sort(key=lambda x:x["bytes"],reverse=True)
out={
 "beta_bytes":len(src.encode("utf-8")),
 "active_inline_script_count":len(rows),
 "active_inline_script_bytes":sum(x["bytes"] for x in rows),
 "external_script_count":len(ext),
 "external_beta_feature_includes":sum(1 for x in ext if "/beta/" in x or "v8009" in x),
 "largest_inline":rows[:140]
}
Path("V8009_POST_EXTRACTION_COVERAGE_V10.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(out,indent=2,ensure_ascii=False))
