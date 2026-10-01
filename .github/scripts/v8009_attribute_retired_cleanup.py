from pathlib import Path
import re,json
ROOT=Path(".")
BETA=ROOT/"beta.html"
QA=ROOT/"V8009_ATTRIBUTE_RETIRED_CLEANUP_QA.json"
files=[
"js/features/legacy-extracted/beta/v419-attribute-points-display.js",
"js/features/legacy-extracted/beta/v426-attribute-points-live-update.js",
"js/features/legacy-extracted/beta/v671-attribute-points-duplicate-remove-js.js",
]
s=BETA.read_text(encoding="utf-8")
removed=[]
for path in files:
    pat=re.compile(r'<script\b[^>]*\bsrc=["\']'+re.escape(path)+r'["\'][^>]*>\s*</script>\s*',re.I)
    s,n=pat.subn('',s)
    p=ROOT/path
    existed=p.exists()
    if existed:p.unlink()
    removed.append({"path":path,"links_removed":n,"file_removed":existed})
BETA.write_text(s,encoding="utf-8")
dangling=[x["path"] for x in removed if x["path"] in s or (ROOT/x["path"]).exists()]
payload={"build":"V8.009-ATTRIBUTE-RETIRED-CLEANUP-QA","removed":removed,"dangling":dangling}
QA.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if dangling or any(x["links_removed"]<1 for x in removed):
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
