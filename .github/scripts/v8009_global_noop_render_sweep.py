from pathlib import Path
import re,json
ROOT=Path(".")
beta=(ROOT/"beta.html").read_text(encoding="utf-8")
srcs=re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']',beta,re.I)
rows=[]
for src in srcs:
 p=ROOT/src
 if not p.exists() or p.suffix.lower()!=".js": continue
 txt=p.read_text(encoding="utf-8",errors="ignore")
 for m in re.finditer(r'const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*render\s*;\s*render\s*=\s*function\s*\([^)]*\)\s*\{',txt):
  base=m.group(1); brace=txt.find("{",m.end()-1)
  depth=0; end=None
  for i in range(brace,len(txt)):
   if txt[i]=="{": depth+=1
   elif txt[i]=="}":
    depth-=1
    if depth==0: end=i+1; break
  if not end: continue
  block=txt[m.start():end]
  body=txt[brace+1:end-1]
  # normalize benign pass-through/version-only statements
  b=re.sub(r'/\*[\s\S]*?\*/','',body)
  b=re.sub(r'//[^\n]*','',b)
  b=re.sub(r'const\s+\w+\s*=\s*document\.querySelector\([^;]+;?','',b)
  b=re.sub(r'(?:const\s+)?\w+\s*=\s*'+re.escape(base)+r'\.apply\(this,arguments\)\s*;?','',b)
  b=re.sub(r'(?:const\s+)?\w+\s*=\s*'+re.escape(base)+r'\(\)\s*;?','',b)
  b=re.sub(r'return\s+\w+\s*;?','',b)
  b=re.sub(r'return\s+'+re.escape(base)+r'\.apply\(this,arguments\)\s*;?','',b)
  b=re.sub(r'return\s+'+re.escape(base)+r'\(\)\s*;?','',b)
  b=re.sub(r'\s+','',b)
  if b=="":
   rows.append({"src":src,"base":base,"start":m.start(),"end":end,"block":block})
payload={"build":"V8.009-GLOBAL-NOOP-RENDER-SWEEP","count":len(rows),"rows":rows}
(ROOT/"V8009_GLOBAL_NOOP_RENDER_SWEEP.json").write_text(json.dumps(payload,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({"count":len(rows),"files":[x["src"] for x in rows]},ensure_ascii=False))
