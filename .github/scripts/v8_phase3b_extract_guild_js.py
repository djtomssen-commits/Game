from pathlib import Path
import re, json, hashlib, subprocess

FILES=[Path("index.html"),Path("beta.html")]
OUT=Path("js/features/guild/legacy")
OUT.mkdir(parents=True,exist_ok=True)

script_re=re.compile(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',re.I)
id_re=re.compile(r'\bid=["\']([^"\']+)["\']',re.I)
src_re=re.compile(r'\bsrc=["\']([^"\']+)["\']',re.I)

def is_guild_id(s):
    return bool(re.search(r'(guild|gilde)',s or "",re.I))

def safe_attrs(attrs,sid):
    # Keep this migration conservative: only ordinary classic scripts are moved.
    rest=id_re.sub("",attrs,count=1)
    rest=re.sub(r'\btype=["\'](?:text/javascript|application/javascript)["\']',"",rest,flags=re.I)
    return not rest.strip()

def scan(text):
    out=[]
    for m in script_re.finditer(text):
        attrs=m.group("attrs")
        body=m.group("body")
        im=id_re.search(attrs)
        sid=im.group(1) if im else ""
        sm=src_re.search(attrs)
        out.append({
            "id":sid,
            "attrs":attrs,
            "body":body,
            "start":m.start(),
            "end":m.end(),
            "src":sm.group(1) if sm else None,
        })
    return out

texts={p.name:p.read_text(encoding="utf-8") for p in FILES}
scans={name:scan(text) for name,text in texts.items()}

# Eligible: named guild/gilde script, inline, nonempty, ordinary classic attributes.
eligible={}
for name,rows in scans.items():
    eligible[name]=[
        r for r in rows
        if is_guild_id(r["id"]) and r["src"] is None and r["body"].strip() and safe_attrs(r["attrs"],r["id"])
    ]

a=eligible["index.html"]
b=eligible["beta.html"]
if [x["id"] for x in a] != [x["id"] for x in b]:
    raise RuntimeError("index/beta eligible guild script order differs")
for x,y in zip(a,b):
    if x["body"].strip()!=y["body"].strip():
        raise RuntimeError(f"index/beta body differs for {x['id']}")
    if "currentScript" in x["body"]:
        raise RuntimeError(f"{x['id']} uses document.currentScript/currentScript; keep inline")

# Build literal-adjacency groups. Only whitespace/comments may appear between scripts.
base=texts["index.html"]
groups=[]
cur=[]
prev=None
gap_ok=re.compile(r'^(?:\s|<!--[\s\S]*?-->)*$')
for row in a:
    if prev is None:
        cur=[row]
    else:
        gap=base[prev["end"]:row["start"]]
        if gap_ok.fullmatch(gap):
            cur.append(row)
        else:
            groups.append(cur)
            cur=[row]
    prev=row
if cur:
    groups.append(cur)

# Stable bundle names using first/last original IDs.
def slug(s):
    return re.sub(r'[^A-Za-z0-9._-]+','-',s).strip('-').lower()

bundle_meta=[]
for gi,g in enumerate(groups):
    first=g[0]["id"]; last=g[-1]["id"]
    name=f"{gi:02d}-{slug(first)}"
    if len(g)>1:
        name+=f"--{slug(last)}"
    rel=OUT/f"{name}.js"
    parts=[]
    for row in g:
        parts.append(f"/* === {row['id']} === */\n")
        parts.append(row["body"].strip()+"\n\n")
    body="".join(parts)
    rel.write_text(body,encoding="utf-8")
    bundle_meta.append({
        "group":gi,
        "file":rel.as_posix(),
        "ids":[r["id"] for r in g],
        "bytes":len(body.encode("utf-8")),
        "sha256":hashlib.sha256(body.encode("utf-8")).hexdigest(),
    })

# Apply replacements independently to both HTML files.
# First script in a literal-adjacent group loads the bundle synchronously.
# Remaining original script tags stay as empty ID markers, preserving DOM ids/order.
for path in FILES:
    text=texts[path.name]
    rows_by_id={r["id"]:r for r in eligible[path.name]}
    replacements=[]
    for meta,g in zip(bundle_meta,groups):
        ids=meta["ids"]
        for pos,sid in enumerate(ids):
            row=rows_by_id[sid]
            if pos==0:
                repl=f'<script id="{sid}" src="{meta["file"]}"></script>'
            else:
                repl=f'<script id="{sid}"></script>'
            replacements.append((row["start"],row["end"],repl))
    for start,end,repl in sorted(replacements,reverse=True):
        text=text[:start]+repl+text[end:]
    path.write_text(text,encoding="utf-8")

# Bump canonical visible build marker.
version=Path("js/system/version/v7283-stable-version-lock.js")
if version.exists():
    s=version.read_text(encoding="utf-8")
    for old in ("V8.006","V8.005","V8.004","V8.003"):
        s=s.replace(old,"V8.007")
    for old in ("8.006","8.005","8.004","8.003"):
        s=s.replace(old,"8.007")
    version.write_text(s,encoding="utf-8")

report={
    "build":"V8.007",
    "phase":"3B",
    "eligible_scripts":len(a),
    "bundle_count":len(bundle_meta),
    "total_js_bytes":sum(x["bytes"] for x in bundle_meta),
    "groups":bundle_meta,
    "preserved_original_script_ids":True,
    "execution_model":"classic synchronous external scripts; literal-adjacent scripts bundled; original order preserved",
    "gameplay_changed":False,
    "server_authority_changed":False,
}
Path("V8_PHASE3B_EXTRACTION.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")

print(json.dumps({
    "eligible_scripts":len(a),
    "bundle_count":len(bundle_meta),
    "total_js_bytes":report["total_js_bytes"],
    "largest_bundles":sorted([(x["file"],x["bytes"],len(x["ids"])) for x in bundle_meta],key=lambda x:x[1],reverse=True)[:10]
},ensure_ascii=False,indent=2))
