from pathlib import Path
import re, json, hashlib

ROOT=Path(".")
BETA=ROOT/"beta.html"
STABLE=ROOT/"index.html"
OUTDIR=ROOT/"js/features/legacy-extracted/beta"
QA=ROOT/"V8009_FEATURE_EXTRACTION_MEGA29_QA.json"

src=BETA.read_text(encoding="utf-8")
stable_before=hashlib.sha256(STABLE.read_bytes()).hexdigest()
pat=re.compile(r'(<script\b[^>]*\bid="([^"]+)"[^>]*>)([\s\S]*?)(</script>)',re.I)

eligible=[]
for m in pat.finditer(src):
    open_tag,sid,body=m.group(1),m.group(2),m.group(3)
    if re.search(r'\bsrc\s*=',open_tag,re.I): continue
    tm=re.search(r'\btype\s*=\s*["\']([^"\']+)["\']',open_tag,re.I)
    typ=(tm.group(1).strip().lower() if tm else "")
    if typ and typ not in ("text/javascript","application/javascript"): continue
    eligible.append((m.start(),m.end(),open_tag,sid,body))

OUTDIR.mkdir(parents=True,exist_ok=True)
used={p.name for p in OUTDIR.glob("*.js")}
result=[]

def safe_name(s):
    x=re.sub(r'[^A-Za-z0-9._-]+','-',s).strip('-').lower()
    return x or "script"

for start,end,open_tag,sid,body in sorted(eligible,key=lambda x:x[0],reverse=True):
    base=safe_name(sid); name=base+".js"; n=2
    while name in used:
        name=f"{base}-{n}.js"; n+=1
    used.add(name)
    out=OUTDIR/name
    out.write_text(body,encoding="utf-8")
    rel=out.as_posix()
    new_open=open_tag[:-1]+f' src="{rel}">'
    src=src[:start]+new_open+"</script>"+src[end:]
    result.append({"id":sid,"path":rel,"bytes":len(body.encode("utf-8"))})

BETA.write_text(src,encoding="utf-8")
result.reverse()

remaining=[]
for m in pat.finditer(src):
    open_tag,sid,body=m.group(1),m.group(2),m.group(3)
    if re.search(r'\bsrc\s*=',open_tag,re.I): continue
    tm=re.search(r'\btype\s*=\s*["\']([^"\']+)["\']',open_tag,re.I)
    typ=(tm.group(1).strip().lower() if tm else "")
    if typ and typ not in ("text/javascript","application/javascript"): continue
    remaining.append(sid)

checks={
  "selected_count":len(result),
  "remaining_named_classic_inline_count":len(remaining),
  "stable_hash_unchanged":hashlib.sha256(STABLE.read_bytes()).hexdigest()==stable_before,
  "all_files_present":all((ROOT/r["path"]).exists() for r in result),
  "all_includes_present":all(r["path"] in src for r in result),
}
payload={
 "build":"V8.009-FEATURE-EXTRACTION-MEGA29-QA",
 "scope":"move-only extraction of every remaining named classic inline JS block from beta.html",
 "result":result,
 "total_bytes_extracted":sum(r["bytes"] for r in result),
 "remaining_named_classic_inline":remaining,
 "checks":checks
}
QA.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if len(remaining)!=0 or not checks["stable_hash_unchanged"] or not checks["all_files_present"] or not checks["all_includes_present"]:
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
