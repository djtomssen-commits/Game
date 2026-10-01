from pathlib import Path
import re,json
s=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
lines=s.splitlines()
hits=[]
for i,line in enumerate(lines,1):
    if not any(k in line for k in ['setTimeout','requestAnimationFrame','setInterval','MutationObserver','addEventListener']):
        continue
    lo=line.lower()
    # Keep only character-area owners / ids and nearby explicit character lifecycle references
    if any(k in lo for k in ['character','v4153','v4156','v459','v510','v514','v525','v526','v533','v546','v547','v087','v125','v126']):
        hits.append({'line':i,'text':line.strip()[:1200]})
Path('V8009_CHARACTER_REPAINT_AUDIT_B.json').write_text(json.dumps({'build':'V8.009-CHARACTER-REPAINT-AUDIT-B','hits':hits},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'count':len(hits),'hits':hits},ensure_ascii=False,indent=2))
