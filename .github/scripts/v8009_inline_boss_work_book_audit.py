from pathlib import Path
import re,json
s=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
lines=s.splitlines()
groups={
 'boss':['worldboss','weltboss','guildboss','gildenboss','smaragd','v110','v260'],
 'work':['shift','schicht','arbeiten','chillen','work','v3'],
 'book_album':['illegales buch','album','pet','sammelalbum','v106','v4']
}
out={'build':'V8.009-INLINE-BOSS-WORK-BOOK-AUDIT','groups':{}}
for key,terms in groups.items():
 hits=[]
 for i,line in enumerate(lines,1):
  lo=line.lower()
  if any(t.lower() in lo for t in terms):
   if any(tok in line for tok in ['setTimeout','setInterval','requestAnimationFrame','MutationObserver','v032Go=','addEventListener','render=function','render = function','function render']):
    hits.append({'line':i,'text':line.strip()[:1200]})
 out['groups'][key]=hits[:800]
Path('V8009_INLINE_BOSS_WORK_BOOK_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))

# trigger: boss-work-book
