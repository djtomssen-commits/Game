from pathlib import Path
import re, json, hashlib

ROOT=Path(".")
BETA=ROOT/"beta.html"
STABLE=ROOT/"index.html"
OUTDIR=ROOT/"js/features/anonymous-extracted/beta"
QA=ROOT/"V8009_FEATURE_EXTRACTION_MEGA30_QA.json"

src=BETA.read_text(encoding="utf-8")
stable_before=hashlib.sha256(STABLE.read_bytes()).hexdigest()
pat=re.compile(r'(<script\b[^>]*>)([\s\S]*?)(</script>)',re.I)

eligible=[]
for m in pat.finditer(src):
    open_tag,body=m.group(1),m.group(2)
    if re.search(r'\bsrc\s*=',open_tag,re.I): continue
    if re.search(r'\bid\s*=',open_tag,re.I): continue
    tm=re.search(r'\btype\s*=\s*["\']([^"\']+)["\']',open_tag,re.I)
    typ=(tm.group(1).strip().lower() if tm else "")
    if typ and typ not in ("text/javascript","application/javascript"): continue
    if not body.strip(): continue
    eligible.append((m.start(),m.end(),open_tag,body))

OUTDIR.mkdir(parents=True,exist_ok=True)
# use stable numbering based on document order
numbered=[]
for idx,item in enumerate(eligible,1):
    start,end,open_tag,body=item
    numbered.append((idx,start,end,open_tag,body))

result=[]
for idx,start,end,open_tag,body in sorted(numbered,key=lambda x:x[1],reverse=True):
    name=f"anon-{idx:04d}.js"
    out=OUTDIR/name
    out.write_text(body,encoding="utf-8")
    rel=out.as_posix()
    new_open=open_tag[:-1]+f' src="{rel}">'
    src=src[:start]+new_open+"</script>"+src[end:]
    result.append({"index":idx,"path":rel,"bytes":len(body.encode("utf-8"))})

result.sort(key=lambda x:x["index"])
BETA.write_text(src,encoding="utf-8")

remaining=[]
for m in pat.finditer(src):
    open_tag,body=m.group(1),m.group(2)
    if re.search(r'\bsrc\s*=',open_tag,re.I): continue
    if re.search(r'\bid\s*=',open_tag,re.I): continue
    tm=re.search(r'\btype\s*=\s*["\']([^"\']+)["\']',open_tag,re.I)
    typ=(tm.group(1).strip().lower() if tm else "")
    if typ and typ not in ("text/javascript","application/javascript"): continue
    if body.strip(): remaining.append(len(body.encode("utf-8")))

checks={
 "selected_count":len(result),
 "remaining_anonymous_classic_inline_count":len(remaining),
 "stable_hash_unchanged":hashlib.sha256(STABLE.read_bytes()).hexdigest()==stable_before,
 "all_files_present":all((ROOT/r["path"]).exists() for r in result),
 "all_includes_present":all(r["path"] in src for r in result)
}
payload={
 "build":"V8.009-FEATURE-EXTRACTION-MEGA30-QA",
 "scope":"move-only extraction of every remaining anonymous classic inline JS block from beta.html",
 "result":result,
 "total_bytes_extracted":sum(r["bytes"] for r in result),
 "remaining_anonymous_classic_inline_sizes":remaining,
 "checks":checks
}
QA.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if remaining or not checks["stable_hash_unchanged"] or not checks["all_files_present"] or not checks["all_includes_present"]:
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
