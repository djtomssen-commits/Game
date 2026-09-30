from pathlib import Path
import re,json
s=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
needles=['v392-active-mode','v392-active-view','v386-shell','v386-card','v4172-resource','#quests']
rows=[]
for n in needles:
  hits=[]
  for m in re.finditer(re.escape(n),s,re.I):
    lo=max(0,m.start()-1200); hi=min(len(s),m.start()+2600)
    chunk=s[lo:hi]
    hits.append({'offset':m.start(),'snippet':re.sub(r'\s+',' ',chunk).strip()})
    if len(hits)>=20: break
  rows.append({'needle':n,'hits':hits})
Path('V8009_QUEST_LAYOUT_CSS_AUDIT.json').write_text(json.dumps({'rows':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({r['needle']:len(r['hits']) for r in rows},indent=2))
