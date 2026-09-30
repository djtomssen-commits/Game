from pathlib import Path
import json,re
beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
needles=['v6239WeeklyChestActivity','v7135_activity_feedback','v7165_guild_activity_result','v7051DungeonSideEffectsSeen','v473AwardDungeonGuildXp','growlegends:guild-xp-feedback']
rows=[]
for n in needles:
  start=0
  hits=[]
  while True:
    i=beta.find(n,start)
    if i<0: break
    lo=max(0,i-1800);hi=min(len(beta),i+3200)
    snippet=re.sub(r'\s+',' ',beta[lo:hi]).strip()
    hits.append({'offset':i,'snippet':snippet})
    start=i+len(n)
    if len(hits)>=12: break
  rows.append({'needle':n,'hits':hits})
Path('V8009_DUNGEON_ACTIVITY_AUDIT.json').write_text(json.dumps({'build':'V8.009-DUNGEON-ACTIVITY-AUDIT','rows':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({r['needle']:len(r['hits']) for r in rows},indent=2))
