from pathlib import Path
import re,json
beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
root=Path('js/features/dungeon/beta')
items=[]
for p in sorted(root.glob('*.js')):
    s=p.read_text(encoding='utf-8',errors='ignore')
    rel=str(p);pos=beta.find(rel)
    items.append({
      'file':rel,'loaded':pos>=0,'pos':pos,'size':len(s),
      'setInterval':len(re.findall(r'\bsetInterval\s*\(',s)),
      'setTimeout':len(re.findall(r'\bsetTimeout\s*\(',s)),
      'raf':len(re.findall(r'\brequestAnimationFrame\s*\(',s)),
      'v032Go_assign':len(re.findall(r'\bv032Go\s*=\s*',s)),
      'listeners':len(re.findall(r'addEventListener\s*\(',s)),
      'renderDungeon_assign':len(re.findall(r'\brenderDungeon\s*=\s*',s)),
      'detail_mentions':len(re.findall(r'detail|decorat|seal|visual',s,re.I))
    })
items.sort(key=lambda x:(not x['loaded'],x['pos'] if x['loaded'] else 10**12,x['file']))
Path('V8009_DUNGEON_RUNTIME_AUDIT.json').write_text(json.dumps({'build':'V8.009-DUNGEON-RUNTIME-AUDIT','items':items},indent=2)+'\n',encoding='utf-8')
print(json.dumps({'items':items},indent=2))
