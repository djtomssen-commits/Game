from pathlib import Path
import re,json,hashlib

ROOT=Path(".")
BETA=ROOT/"beta.html"
STABLE=ROOT/"index.html"
QA=ROOT/"V8009_MEGA32_ROOT_CSS_QA.json"

src=BETA.read_text(encoding="utf-8")
stable_before=hashlib.sha256(STABLE.read_bytes()).hexdigest()

# Search executable/readable project text for actual DOM references to style IDs.
corpus_parts=[]
for p in ROOT.rglob("*"):
    if not p.is_file() or p==BETA: continue
    if p.suffix.lower() not in {".js",".mjs",".html"}: continue
    try: corpus_parts.append(p.read_text(encoding="utf-8",errors="ignore"))
    except: pass
corpus="\n".join(corpus_parts)

def dom_ref(sid):
    esc=re.escape(sid)
    patterns=[
      rf'getElementById\s*\(\s*["\']{esc}["\']',
      rf'querySelector(?:All)?\s*\(\s*["\'][^"\']*#{esc}(?:[^A-Za-z0-9_-]|["\'])',
      rf'closest\s*\(\s*["\'][^"\']*#{esc}(?:[^A-Za-z0-9_-]|["\'])',
      rf'matches\s*\(\s*["\'][^"\']*#{esc}(?:[^A-Za-z0-9_-]|["\'])',
      rf'["\']#{esc}["\']',
    ]
    return any(re.search(p,corpus,re.I) for p in patterns)

style_pat=re.compile(r'(<style\b([^>]*)>)([\s\S]*?)(</style>)',re.I)
cands=[]
skipped_ref=[]
skipped_attrs=[]
for idx,m in enumerate(style_pat.finditer(src),1):
    attrs,body=m.group(2),m.group(3)
    idm=re.search(r'\bid=["\']([^"\']+)["\']',attrs,re.I)
    sid=idm.group(1) if idm else None

    # Only attrs that transfer cleanly from style to link: id, media, title, type.
    remainder=re.sub(r'\s*(id|media|title|type)\s*=\s*["\'][^"\']*["\']','',attrs,flags=re.I).strip()
    if remainder:
        skipped_attrs.append({"index":idx,"id":sid,"attrs":attrs.strip()})
        continue
    if sid and dom_ref(sid):
        skipped_ref.append({"index":idx,"id":sid})
        continue
    if not body.strip():
        continue
    cands.append((m.start(),m.end(),attrs,sid,body,idx))

result=[]
used=set()
for start,end,attrs,sid,body,idx in sorted(cands,key=lambda x:x[0],reverse=True):
    base=(re.sub(r'[^A-Za-z0-9._-]+','-',sid).strip('-').lower() if sid else f"v8009-inline-style-{idx:04d}")
    name=f"v8009-extracted-{base}.css"
    n=2
    while name in used or (ROOT/name).exists():
        name=f"v8009-extracted-{base}-{n}.css"; n+=1
    used.add(name)
    out=ROOT/name
    out.write_text(body,encoding="utf-8")

    attrs_out=[]
    if sid: attrs_out.append(f'id="{sid}"')
    mm=re.search(r'\bmedia=["\']([^"\']+)["\']',attrs,re.I)
    if mm: attrs_out.append(f'media="{mm.group(1)}"')
    tm=re.search(r'\btitle=["\']([^"\']+)["\']',attrs,re.I)
    if tm: attrs_out.append(f'title="{tm.group(1)}"')
    attr_text=(" "+" ".join(attrs_out)) if attrs_out else ""
    repl=f'<link rel="stylesheet"{attr_text} href="{name}">'
    src=src[:start]+repl+src[end:]
    result.append({"id":sid,"path":name,"bytes":len(body.encode("utf-8")),"had_url":bool(re.search(r'url\s*\(',body,re.I))})

result.reverse()
BETA.write_text(src,encoding="utf-8")

remaining_styles=len(list(style_pat.finditer(src)))
checks={
 "selected_count":len(result),
 "remaining_inline_style_blocks":remaining_styles,
 "stable_hash_unchanged":hashlib.sha256(STABLE.read_bytes()).hexdigest()==stable_before,
 "all_files_present":all((ROOT/r["path"]).exists() for r in result),
 "all_links_present":all(r["path"] in src for r in result),
 "asset_url_styles_extracted":sum(1 for r in result if r["had_url"]),
}
payload={
 "build":"V8.009-MEGA32-ROOT-CSS-QA",
 "scope":"extract all inline style blocks with transferable attrs and no actual DOM id reference; CSS files live at repo root so relative asset URLs keep document-root semantics",
 "result":result,
 "total_css_bytes_extracted":sum(r["bytes"] for r in result),
 "skipped_dom_referenced":skipped_ref,
 "skipped_nontransferable_attrs":skipped_attrs,
 "checks":checks
}
QA.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if not checks["stable_hash_unchanged"] or not checks["all_files_present"] or not checks["all_links_present"]:
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
