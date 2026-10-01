from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
srcs=[s for s in srcs if "/shop/" in s or "shop" in s.lower()]
patterns={
 "render_override":re.compile(r'(?<![\w$.])render\s*=\s*(?:async\s*)?function\b'),
 "renderShop_override":re.compile(r'(?<![\w$.])renderShop\s*=\s*(?:async\s*)?function\b'),
 "window_renderShop_assign":re.compile(r'window\.renderShop\s*='),
 "raf":re.compile(r'requestAnimationFrame\s*\('),
 "timeout":re.compile(r'setTimeout\s*\('),
 "observer":re.compile(r'MutationObserver')
}
rows=[]
for order,src in enumerate(srcs):
 p=ROOT/src
 if not p.exists() or p.suffix.lower()!=".js": continue
 txt=p.read_text(encoding="utf-8",errors="ignore")
 hits={}
 for name,pat in patterns.items():
  found=[]
  for m in pat.finditer(txt):
   line=txt.count("\n",0,m.start())+1
   lo=max(0,m.start()-220);hi=min(len(txt),m.start()+500)
   found.append({"line":line,"snippet":txt[lo:hi]})
  if found:hits[name]=found
 if hits: rows.append({"order":order,"src":src,"hits":hits})
payload={"build":"V8.009-SHOP-REPAINT-AUDIT","shop_script_count":len(srcs),"rows":rows}
(ROOT/"V8009_SHOP_REPAINT_AUDIT.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"shop_script_count":len(srcs),"rows":[{"order":r["order"],"src":r["src"],"kinds":{k:len(v) for k,v in r["hits"].items()}} for r in rows]},ensure_ascii=False))
