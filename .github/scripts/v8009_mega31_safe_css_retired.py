from pathlib import Path
import re,json,hashlib

ROOT=Path(".")
BETA=ROOT/"beta.html"
STABLE=ROOT/"index.html"
CSSDIR=ROOT/"css/features/extracted-safe/beta"
RETIRED=ROOT/"js/features/legacy/retired-inline"
QA=ROOT/"V8009_MEGA31_SAFE_CSS_AND_RETIRED_QA.json"

src=BETA.read_text(encoding="utf-8")
stable_before=hashlib.sha256(STABLE.read_bytes()).hexdigest()

# Build searchable corpus excluding beta inline style bodies themselves.
corpus_parts=[]
for p in ROOT.rglob("*"):
    if not p.is_file(): continue
    if p==BETA: continue
    if p.suffix.lower() not in {".js",".html",".mjs",".json"}: continue
    try: corpus_parts.append(p.read_text(encoding="utf-8",errors="ignore"))
    except: pass
corpus="\n".join(corpus_parts)

# 1) Retire custom non-executable inline script blocks.
retired_pat=re.compile(r'(<script\b[^>]*\btype=["\']application/x-grow-legends-retired["\'][^>]*>)([\s\S]*?)(</script>)',re.I)
retired=[]
matches=list(retired_pat.finditer(src))
RETIRED.mkdir(parents=True,exist_ok=True)
for m in reversed(matches):
    open_tag,body=m.group(1),m.group(2)
    idm=re.search(r'\bid=["\']([^"\']+)["\']',open_tag,re.I)
    sid=idm.group(1) if idm else f"retired-{len(retired)+1}"
    safe=re.sub(r'[^A-Za-z0-9._-]+','-',sid).strip('-').lower()+".retired.js"
    out=RETIRED/safe
    out.write_text(body,encoding="utf-8")
    # Keep a tiny inert marker only.
    marker=f'<!-- retired script archived: {out.as_posix()} -->'
    src=src[:m.start()]+marker+src[m.end():]
    retired.append({"id":sid,"path":out.as_posix(),"bytes":len(body.encode("utf-8"))})
retired.reverse()

# 2) Safe CSS extraction candidates: no url(), no @import, and id unreferenced outside beta.
style_pat=re.compile(r'(<style\b([^>]*)>)([\s\S]*?)(</style>)',re.I)
cands=[]
for m in style_pat.finditer(src):
    attrs,body=m.group(2),m.group(3)
    if re.search(r'url\s*\(',body,re.I) or re.search(r'@import\b',body,re.I):
        continue
    idm=re.search(r'\bid=["\']([^"\']+)["\']',attrs,re.I)
    sid=idm.group(1) if idm else None
    if sid and re.search(re.escape(sid),corpus,re.I):
        continue
    # preserve only plain style tags; skip nonce/media/title/data attrs beyond id/type.
    attrs_clean=re.sub(r'\s*(id|type)\s*=\s*["\'][^"\']*["\']','',attrs,flags=re.I).strip()
    if attrs_clean:
        continue
    if len(body.encode("utf-8"))<200:
        continue
    cands.append((m.start(),m.end(),attrs,sid,body))

CSSDIR.mkdir(parents=True,exist_ok=True)
used={p.name for p in CSSDIR.glob("*.css")}
css_result=[]
for idx,(start,end,attrs,sid,body) in enumerate(sorted(cands,key=lambda x:x[0],reverse=True),1):
    base=(re.sub(r'[^A-Za-z0-9._-]+','-',sid).strip('-').lower() if sid else f"anon-style-{len(cands)-idx+1:04d}")
    name=base+".css"; n=2
    while name in used:
        name=f"{base}-{n}.css"; n+=1
    used.add(name)
    out=CSSDIR/name
    out.write_text(body,encoding="utf-8")
    rel=out.as_posix()
    idattr=f' id="{sid}"' if sid else ""
    repl=f'<link rel="stylesheet"{idattr} href="{rel}">'
    src=src[:start]+repl+src[end:]
    css_result.append({"id":sid,"path":rel,"bytes":len(body.encode("utf-8"))})
css_result.reverse()

BETA.write_text(src,encoding="utf-8")

checks={
 "retired_script_count":len(retired),
 "retired_inline_remaining":len(retired_pat.findall(src)),
 "safe_css_extracted_count":len(css_result),
 "stable_hash_unchanged":hashlib.sha256(STABLE.read_bytes()).hexdigest()==stable_before,
 "all_css_present":all((ROOT/r["path"]).exists() for r in css_result),
 "all_retired_archives_present":all((ROOT/r["path"]).exists() for r in retired),
 "all_css_links_present":all(r["path"] in src for r in css_result)
}
payload={
 "build":"V8.009-MEGA31-SAFE-CSS-AND-RETIRED-QA",
 "retired_scripts":retired,
 "retired_bytes":sum(r["bytes"] for r in retired),
 "safe_css_extracted":css_result,
 "safe_css_bytes":sum(r["bytes"] for r in css_result),
 "checks":checks
}
QA.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if checks["retired_inline_remaining"]!=0 or not all(checks[k] for k in ["stable_hash_unchanged","all_css_present","all_retired_archives_present","all_css_links_present"]):
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
