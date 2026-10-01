from pathlib import Path
import re,json
s=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
lines=s.splitlines()
terms={
 'grow':['growroom','plantCard','v4114','v7064','harvest','pflege','plant'],
 'forge':['schmiede','forge','smith','craft','set-up','set upgrade','v4'],
 'shop':['shop','händler','haendler','dealer','merchant','v441','v069SyncCurrencies']
}
out={'build':'V8.009-INLINE-GROW-FORGE-SHOP-AUDIT','sections':{}}
for key,words in terms.items():
 hits=[]
 for i,line in enumerate(lines,1):
  lo=line.lower()
  if any(w.lower() in lo for w in words):
   if any(tok in line for tok in ['setTimeout','setInterval','requestAnimationFrame','MutationObserver','v032Go=','addEventListener','render=function','render = function','function render','function v']):
    hits.append({'line':i,'text':line.strip()[:1000]})
 out['sections'][key]=hits[:700]
Path('V8009_INLINE_GROW_FORGE_SHOP_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
