from pathlib import Path
import re,json,collections
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)

static_ids=re.findall(r'\bid=["\']([^"\']+)["\']',beta,re.I)
static_dups={k:v for k,v in collections.Counter(static_ids).items() if v>1}

def ids_from_js(txt):
    out=[]
    # Literal id="..." inside querySelector/querySelectorAll/closest/matches is
    # a read-only selector, not a DOM producer.
    for m in re.finditer(r'\\bid=["\\']([A-Za-z0-9_:\\-.]+)["\\']',txt):
        pre=txt[max(0,m.start()-140):m.start()]
        if re.search(r'(?:querySelector(?:All)?|closest|matches)\\s*\\([^)]*$',pre,re.I):
            continue
        out.append(m.group(1))
    out+=re.findall(r'\\.id\\s*=\\s*["\\']([A-Za-z0-9_:\\-.]+)["\\']',txt)
    out+=re.findall(r'setAttribute\\(\\s*["\\']id["\\']\\s*,\\s*["\\']([A-Za-z0-9_:\\-.]+)["\\']',txt)
    return out


producers=collections.defaultdict(list)
legacy_hits=[]
legacy_terms=[
 "legacy","obsolete","retired","fallback","compat",
 "händlergasse","haendlergasse","werte steigen jetzt klar mit",
 "alte ","old ","v4.02","v4.44","v4.59","v4.60","v4.61"
]
for order,src in enumerate(srcs):
    p=ROOT/src
    if not p.exists() or p.suffix.lower()!=".js": continue
    txt=p.read_text(encoding="utf-8",errors="ignore")
    for i in sorted(set(ids_from_js(txt))):
        producers[i].append({"order":order,"src":src})
    low=txt.lower()
    found=[t for t in legacy_terms if t in low]
    if found:
        legacy_hits.append({"order":order,"src":src,"terms":found})

collisions={}
for idv,rows in producers.items():
    static=idv in static_ids
    if len(rows)+(1 if static else 0)>1:
        collisions[idv]={"static":static,"producers":rows}

# screen/root contracts from current beta; only presence/order checks, not mutation
screens=[]
for m in re.finditer(r'<section\s+id=["\']([^"\']+)["\'][^>]*class=["\'][^"\']*\bscreen\b[^"\']*["\'][^>]*>',beta,re.I):
    sid=m.group(1)
    start=m.start()
    nxt=re.search(r'<section\s+id=["\'][^"\']+["\'][^>]*class=["\'][^"\']*\bscreen\b',beta[m.end():],re.I)
    end=(m.end()+nxt.start()) if nxt else len(beta)
    frag=beta[start:end]
    child_ids=re.findall(r'\bid=["\']([^"\']+)["\']',frag,re.I)
    screens.append({"screen":sid,"static_child_ids":child_ids[:120],"count":len(child_ids)})

payload={
 "build":"V8.009-LEGACY-DOM-CONTRACT-AUDIT",
 "external_script_count":len(srcs),
 "static_duplicate_ids":static_dups,
 "producer_collision_count":len(collisions),
 "producer_collisions":collisions,
 "legacy_marker_files":legacy_hits,
 "screens":screens
}
(ROOT/"V8009_LEGACY_DOM_CONTRACT_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
top=sorted(collisions.items(), key=lambda kv:-(len(kv[1]["producers"])+(1 if kv[1]["static"] else 0)))[:120]
print(json.dumps({
 "external_script_count":len(srcs),
 "static_duplicate_ids":static_dups,
 "producer_collision_count":len(collisions),
 "top_collisions":[{"id":k,"static":v["static"],"producers":v["producers"]} for k,v in top],
 "legacy_marker_file_count":len(legacy_hits),
 "legacy_marker_files":legacy_hits[:120],
 "screens":[{"screen":x["screen"],"count":x["count"],"static_child_ids":x["static_child_ids"][:30]} for x in screens]
},ensure_ascii=False))
