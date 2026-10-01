from pathlib import Path
import re,json,hashlib

ROOT=Path(".")
BETA=ROOT/"beta.html"
STABLE=ROOT/"index.html"
QA=ROOT/"V8009_MINI_CSS_SAFE_BUNDLE_QA.json"
s=BETA.read_text(encoding="utf-8")
stable_before=hashlib.sha256(STABLE.read_bytes()).hexdigest()

# project JS/HTML corpus excluding beta for concrete ID references
parts=[]
for p in ROOT.rglob("*"):
    if not p.is_file() or p==BETA: continue
    if p.suffix.lower() not in {".js",".mjs",".html"}: continue
    try: parts.append(p.read_text(encoding="utf-8",errors="ignore"))
    except: pass
corpus="\n".join(parts)

def id_referenced(sid):
    e=re.escape(sid)
    pats=[
      rf'getElementById\s*\(\s*["\']{e}["\']',
      rf'querySelector(?:All)?\s*\(\s*["\'][^"\']*#{e}(?:[^A-Za-z0-9_-]|["\'])',
      rf'closest\s*\(\s*["\'][^"\']*#{e}(?:[^A-Za-z0-9_-]|["\'])',
      rf'matches\s*\(\s*["\'][^"\']*#{e}(?:[^A-Za-z0-9_-]|["\'])',
      rf'["\']#{e}["\']'
    ]
    return any(re.search(p,corpus,re.I) for p in pats)

# root mini css metadata
mini={}
for p in ROOT.glob("v8009-extracted-*.css"):
    b=p.read_bytes()
    if len(b)<=300:
        mini[p.name]={"bytes":len(b),"text":b.decode("utf-8",errors="ignore")}

# find link tags to root mini css
link_pat=re.compile(r'<link\b[^>]*rel=["\']stylesheet["\'][^>]*href=["\'](v8009-extracted-[^"\']+\.css)["\'][^>]*>',re.I)
links=[]
for m in link_pat.finditer(s):
    href=m.group(1)
    if href not in mini: continue
    tag=m.group(0)
    idm=re.search(r'\bid=["\']([^"\']+)["\']',tag,re.I)
    sid=idm.group(1) if idm else None
    links.append({"start":m.start(),"end":m.end(),"tag":tag,"href":href,"id":sid,"ref":bool(sid and id_referenced(sid))})

# contiguous runs: only whitespace/comments between mini links, and every id unreferenced
runs=[]
cur=[]
for item in links:
    if item["ref"]:
        if len(cur)>=3:runs.append(cur)
        cur=[];continue
    if not cur:
        cur=[item];continue
    between=s[cur[-1]["end"]:item["start"]]
    residue=re.sub(r'<!--[\s\S]*?-->','',between).strip()
    if residue=="":
        cur.append(item)
    else:
        if len(cur)>=3:runs.append(cur)
        cur=[item]
if len(cur)>=3:runs.append(cur)

# cap bundle size to avoid giant changes; take all qualifying runs
result=[]
for n,run in enumerate(reversed(runs),1):
    order_index=len(runs)-n+1
    bundle=f"v8009-mini-bundle-{order_index:03d}.css"
    content=[]
    for it in run:
        content.append(f"/* source: {it['href']} */\n"+mini[it["href"]]["text"].rstrip()+"\n")
    (ROOT/bundle).write_text("\n".join(content),encoding="utf-8")
    first=run[0]
    first_tag=re.sub(r'href=["\'][^"\']+["\']',f'href="{bundle}"',first["tag"],count=1,flags=re.I)
    replacement=first_tag
    s=s[:first["start"]]+replacement+s[run[-1]["end"]:]
    result.append({"bundle":bundle,"sources":[it["href"] for it in run],"ids":[it["id"] for it in run],"bytes":sum(mini[it["href"]]["bytes"] for it in run)})

result.reverse()
BETA.write_text(s,encoding="utf-8")

# delete source files only if no href remains
deleted=[]
for r in result:
    for src in r["sources"]:
        if src not in s:
            p=ROOT/src
            if p.exists():
                p.unlink();deleted.append(src)

checks={
 "bundle_count":len(result),
 "source_file_count":sum(len(r["sources"]) for r in result),
 "stable_hash_unchanged":hashlib.sha256(STABLE.read_bytes()).hexdigest()==stable_before,
 "all_bundles_present":all((ROOT/r["bundle"]).exists() for r in result),
 "no_deleted_href_remaining":all(x not in s for x in deleted),
 "all_bundle_hrefs_present":all(r["bundle"] in s for r in result),
}
payload={"build":"V8.009-MINI-CSS-SAFE-BUNDLE-QA","result":result,"deleted_sources":deleted,"checks":checks}
QA.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if not checks["stable_hash_unchanged"] or not checks["all_bundles_present"] or not checks["no_deleted_href_remaining"] or not checks["all_bundle_hrefs_present"]:
    raise SystemExit(json.dumps(payload,ensure_ascii=False))
print(json.dumps(payload,ensure_ascii=False))
