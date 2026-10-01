from pathlib import Path
import json,re
ROOT=Path(".")
AUD=ROOT/"V8009_RELEASE_MARKER_RUNTIME_REFERENCE_AUDIT.json"
BETA=ROOT/"beta.html"
QA=ROOT/"V8009_RELEASE_MARKER_RUNTIME_CLEANUP_QA.json"
if not AUD.exists():
    raise SystemExit("runtime audit missing")
a=json.loads(AUD.read_text(encoding="utf-8"))
removable=a.get("removable",[])
s=BETA.read_text(encoding="utf-8")
removed=[]
for path in removable:
    # remove exact script include from beta
    pat=re.compile(r'<script\b[^>]*\bsrc=["\']'+re.escape(path)+r'["\'][^>]*>\s*</script>\s*',re.I)
    s,n=pat.subn('',s)
    p=ROOT/path
    existed=p.exists()
    if existed:p.unlink()
    removed.append({"path":path,"links_removed":n,"file_removed":existed})
BETA.write_text(s,encoding="utf-8")
dangling=[x["path"] for x in removed if x["path"] in s or (ROOT/x["path"]).exists()]
payload={"build":"V8.009-RELEASE-MARKER-RUNTIME-CLEANUP-QA","removed":removed,"dangling":dangling,"removed_count":len(removed)}
QA.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if dangling or any(x["links_removed"]<1 for x in removed):
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
