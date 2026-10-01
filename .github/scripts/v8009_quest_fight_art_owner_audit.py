from pathlib import Path
import json,re
needles=['v311PlayFight','v311BossAvatar','v626ApplyQuestEnemyArt','v627ApplyQuestEnemyArt']
hits=[]
for p in [Path('beta.html'), *Path('js').rglob('*.js')]:
  try:s=p.read_text(encoding='utf-8',errors='ignore')
  except:continue
  if not any(n in s for n in needles): continue
  for i,line in enumerate(s.splitlines(),1):
    if any(n in line for n in needles):
      hits.append({'path':str(p),'line':i,'text':line.strip()[:800]})
Path('V8009_QUEST_FIGHT_ART_OWNER_AUDIT.json').write_text(json.dumps({'build':'V8.009-QUEST-FIGHT-ART-OWNER-AUDIT','hits':hits},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'count':len(hits),'hits':hits[:400]},ensure_ascii=False,indent=2))
