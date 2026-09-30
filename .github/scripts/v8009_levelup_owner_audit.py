from pathlib import Path
import re,json
hits=[]
patterns=[
 re.compile(r'level\s*up',re.I),
 re.compile(r'levelaufstieg',re.I),
 re.compile(r'level.{0,30}(popup|modal|overlay|toast)',re.I),
 re.compile(r'(popup|modal|overlay|toast).{0,30}level',re.I),
 re.compile(r'show.{0,30}level',re.I),
]
for p in [Path('beta.html'), *Path('js').rglob('*.js')]:
 try:s=p.read_text(encoding='utf-8',errors='ignore')
 except:continue
 lines=s.splitlines()
 for i,line in enumerate(lines,1):
  if any(rx.search(line) for rx in patterns):
   hits.append({'path':str(p),'line':i,'text':line.strip()[:500]})
Path('V8009_LEVELUP_OWNER_AUDIT.json').write_text(json.dumps({'build':'V8.009-LEVELUP-OWNER-AUDIT','hits':hits[:500]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'count':len(hits),'hits':hits[:120]},ensure_ascii=False,indent=2))
