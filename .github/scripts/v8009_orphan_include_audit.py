from pathlib import Path
import json,re
ROOT=Path(".")
text_files=[]
for p in ROOT.rglob("*"):
    if not p.is_file(): continue
    if p.suffix.lower() not in {".html",".js",".mjs",".css"}: continue
    try:text_files.append((p,p.read_text(encoding="utf-8",errors="ignore")))
    except:pass

candidates=[]
candidates.extend(sorted(ROOT.glob("v8009-extracted-*.css")))
candidates.extend(sorted(ROOT.glob("v8009-mini-bundle-*.css")))
for base in [ROOT/"js/features/legacy-extracted/beta",ROOT/"js/features/anonymous-extracted/beta"]:
    if base.exists(): candidates.extend(sorted(base.glob("*.js")))

orphans=[]
refs={}
for p in candidates:
    name=p.as_posix()
    hits=[]
    for q,txt in text_files:
        if q==p: continue
        if name in txt or p.name in txt:
            hits.append(q.as_posix())
    refs[name]=hits
    if not hits:
        orphans.append({"path":name,"bytes":p.stat().st_size,"kind":p.suffix.lower()})

payload={
 "build":"V8.009-ORPHAN-INCLUDE-AUDIT",
 "candidate_count":len(candidates),
 "candidate_bytes":sum(p.stat().st_size for p in candidates),
 "orphan_count":len(orphans),
 "orphan_bytes":sum(x["bytes"] for x in orphans),
 "orphans":orphans,
}
(ROOT/"V8009_ORPHAN_INCLUDE_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps(payload,ensure_ascii=False))
