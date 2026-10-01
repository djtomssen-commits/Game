from pathlib import Path
import json,re

ROOT=Path(".")
AUD=ROOT/"V8009_RUNTIME_NOOP_DELEGATE_SWEEP.json"
BETA=ROOT/"beta.html"
QA=ROOT/"V8009_RUNTIME_NOOP_DELEGATE_CLEANUP_QA.json"
a=json.loads(AUD.read_text(encoding="utf-8"))
beta=BETA.read_text(encoding="utf-8")

targets=set(x["src"] for x in a.get("comment_only",[]))

# Additional conservative mini cleanup:
# only explicit retired stubs or pure marker files with no external references.
for x in a.get("tiny_unreferenced_delegates",[]):
    src=x["src"]; txt=x.get("content","")
    low=(src+"\n"+txt).lower()
    markerish=(
      "retired" in low or
      ("marker" in src.lower() and "diagnostic" not in src.lower()) or
      re.fullmatch(r"\s*(?:\(\(\)=>\{)?\s*window\.__[A-Za-z0-9_$]+__\s*=\s*(?:true|['\"][^'\"]+['\"]);?\s*(?:\}\)\(\);?)?\s*",txt,re.S) is not None
    )
    protected=any(k in src.lower() for k in [
      "phase1-bootstrap","phase2-bootstrap","quality-order","play-referral",
      "golden-master","diagnostic","integrity-audit","isolation-audit"
    ])
    if markerish and not protected:
        targets.add(src)

removed=[]
for src in sorted(targets):
    pat=re.compile(r'<script\b[^>]*\bsrc=["\']'+re.escape(src)+r'["\'][^>]*>\s*</script>\s*',re.I)
    beta,n=pat.subn('',beta)
    p=ROOT/src
    existed=p.exists()
    if existed:p.unlink()
    removed.append({"src":src,"links_removed":n,"file_removed":existed})

BETA.write_text(beta,encoding="utf-8")
dangling=[x["src"] for x in removed if x["src"] in beta or (ROOT/x["src"]).exists()]
payload={
 "build":"V8.009-RUNTIME-NOOP-DELEGATE-CLEANUP-QA",
 "removed_count":len(removed),
 "removed":removed,
 "dangling":dangling
}
QA.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if dangling or any(x["links_removed"]<1 for x in removed):
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps({"removed_count":len(removed),"removed":[x["src"] for x in removed],"dangling":dangling},ensure_ascii=False))
