from pathlib import Path
import re,json
roots=[Path('js/features/character'),Path('js/features/profile'),Path('js/features/avatar')]
rows=[]
for root in roots:
 if not root.exists(): continue
 for p in sorted(root.rglob('*.js')):
  s=p.read_text(encoding='utf-8',errors='ignore')
  counts={
   'setInterval':len(re.findall(r'\bsetInterval\s*\(',s)),
   'setTimeout':len(re.findall(r'\bsetTimeout\s*\(',s)),
   'raf':len(re.findall(r'\brequestAnimationFrame\s*\(',s)),
   'render_assign':len(re.findall(r'(?<![\w.])render\s*=\s*function',s)),
   'v032Go_assign':len(re.findall(r'\bv032Go\s*=\s*',s)),
   'listeners':len(re.findall(r'addEventListener\s*\(',s)),
  }
  if any(counts.values()) or 'character' in p.name.lower() or 'avatar' in p.name.lower():
   rows.append({'path':str(p),**counts})
# also find beta.html inline character owners
beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
hits=[]
for i,line in enumerate(beta.splitlines(),1):
 if re.search(r'character|avatar|attribute|attribut|v032Go',line,re.I):
  if any(k in line for k in ['setTimeout','setInterval','requestAnimationFrame','v032Go=','id="v','character']):
   hits.append({'line':i,'text':line.strip()[:700]})
out={'build':'V8.009-CHARACTER-RUNTIME-AUDIT','rows':rows,'inline_hits':hits[:500]}
Path('V8009_CHARACTER_RUNTIME_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
