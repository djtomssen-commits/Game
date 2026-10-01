from pathlib import Path
import hashlib,json,re
files=sorted(Path(".").glob("v8009-extracted-*.css"))
items=[]
byhash={}
for p in files:
    b=p.read_bytes()
    h=hashlib.sha256(b).hexdigest()
    txt=b.decode("utf-8",errors="ignore")
    selectors=len(re.findall(r'(?<!@)[^{]+\{',txt))
    item={"path":p.as_posix(),"bytes":len(b),"sha256":h,"selector_blocks":selectors}
    items.append(item);byhash.setdefault(h,[]).append(p.as_posix())
dups=[v for v in byhash.values() if len(v)>1]
tiny=[x for x in items if x["bytes"]<=300]
payload={
 "build":"V8.009-CSS-CONSOLIDATION-AUDIT",
 "root_extracted_css_count":len(items),
 "root_extracted_css_bytes":sum(x["bytes"] for x in items),
 "exact_duplicate_groups":dups,
 "exact_duplicate_file_count":sum(len(g) for g in dups),
 "tiny_files_le_300_bytes":tiny,
 "tiny_count":len(tiny)
}
Path("V8009_CSS_CONSOLIDATION_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
