from pathlib import Path
import re,json
root=Path(".")
beta=(root/"beta.html").read_text(encoding="utf-8")
files=[
"v8009-extracted-v6316-version-authority-css.css",
"v8009-extracted-v7092-version-owner-css.css",
"v8009-extracted-v7109-final-version-css.css",
"v8009-extracted-v7164-combat-animation-complete-css.css",
]
removed_links=[]
for name in files:
    pat=re.compile(r'<link\b[^>]*href=["\']'+re.escape(name)+r'["\'][^>]*>\s*',re.I)
    beta,n=pat.subn('',beta)
    removed_links.append({"path":name,"links_removed":n})
    p=root/name
    if p.exists(): p.unlink()
(root/"beta.html").write_text(beta,encoding="utf-8")
dangling=[x["path"] for x in removed_links if x["path"] in beta]
payload={
 "build":"V8.009-MINI-CSS-MARKER-CLEANUP-QA",
 "removed":removed_links,
 "dangling":dangling,
 "files_still_exist":[n for n in files if (root/n).exists()]
}
(root/"V8009_MINI_CSS_MARKER_CLEANUP_QA.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if dangling or payload["files_still_exist"] or any(x["links_removed"]<1 for x in removed_links):
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
