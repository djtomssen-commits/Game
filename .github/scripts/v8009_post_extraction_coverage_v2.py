from pathlib import Path
import re,json
src=Path("beta.html").read_text(encoding="utf-8")
scripts=list(re.finditer(r'<script([^>]*)>([\s\S]*?)</script>',src,re.I))
inline=[];external=[]
for m in scripts:
 attrs,body=m.group(1),m.group(2)
 if 'src=' in attrs.lower():
  sm=re.search(r'src=["\']([^"\']+)["\']',attrs,re.I);external.append(sm.group(1) if sm else '')
 elif 'application/x-grow-legends-retired' not in attrs.lower():
  mid=re.search(r'id=["\']([^"\']+)["\']',attrs,re.I)
  inline.append({"id":mid.group(1) if mid else "(no-id)","bytes":len(body)})
out={
 "beta_bytes":len(src.encode("utf-8")),
 "active_inline_script_count":len(inline),
 "active_inline_script_bytes":sum(x["bytes"] for x in inline),
 "external_script_count":len(external),
 "external_beta_feature_includes":sum(1 for x in external if "/beta/" in x or "v8009" in x),
 "largest_inline":sorted(inline,key=lambda x:x["bytes"],reverse=True)[:40]
}
Path("V8009_POST_EXTRACTION_COVERAGE_V2.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(out,indent=2,ensure_ascii=False))