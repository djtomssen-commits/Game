from pathlib import Path
import re,json,collections
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
screens=re.findall(r'<section\s+id=["\']([^"\']+)["\'][^>]*class=["\'][^"\']*\bscreen\b[^"\']*["\']',beta,re.I)

patterns=[
 re.compile(r'data-([A-Za-z0-9_-]*tab[A-Za-z0-9_-]*)=["\']([^"\']+)["\']',re.I),
 re.compile(r'dataset\.([A-Za-z0-9_]*Tab[A-Za-z0-9_]*)\s*=\s*["\']([^"\']+)["\']'),
]
rows=[]
def scan(path,text,order):
  seen=set()
  for pat in patterns:
    for m in pat.finditer(text):
      key=(m.group(1),m.group(2))
      if key in seen: continue
      seen.add(key)
      lo=max(0,m.start()-220); hi=min(len(text),m.end()+420)
      rows.append({"order":order,"path":path,"attr":m.group(1),"value":m.group(2),"snippet":text[lo:hi]})

scan("beta.html",beta,-1)
for order,src in enumerate(srcs):
 p=ROOT/src
 if not p.exists() or p.suffix.lower()!=".js": continue
 txt=p.read_text(encoding="utf-8",errors="ignore")
 scan(src,txt,order)

groups=collections.defaultdict(list)
for r in rows:
 groups[r["attr"]].append({"value":r["value"],"path":r["path"],"order":r["order"],"snippet":r["snippet"]})

payload={
 "build":"V8.009-PAGE-TAB-DISCOVERY",
 "external_script_count":len(srcs),
 "screens":screens,
 "tab_groups":dict(groups),
 "tab_occurrence_count":len(rows)
}
(ROOT/"V8009_PAGE_TAB_DISCOVERY.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"screens":screens,"groups":{k:sorted(set(x["value"] for x in v)) for k,v in groups.items()},"occurrences":len(rows)},ensure_ascii=False))
