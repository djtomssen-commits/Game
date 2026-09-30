from pathlib import Path
import re,json
hits=[]
for p in [Path('beta.html'), *Path('js').rglob('*.js')]:
 try:s=p.read_text(encoding='utf-8',errors='ignore')
 except:continue
 if 'v032Go' not in s and 'v4127EnsureQuestSkip' not in s and 'v4127ScheduleQuestSkip' not in s: continue
 for i,line in enumerate(s.splitlines(),1):
  if 'v032Go' in line or 'v4127EnsureQuestSkip' in line or 'v4127ScheduleQuestSkip' in line:
   hits.append({'path':str(p),'line':i,'text':line.strip()[:700]})
Path('V8009_QUEST_NAV_SKIP_AUDIT.json').write_text(json.dumps({'build':'V8.009-QUEST-NAV-SKIP-AUDIT','hits':hits},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'count':len(hits),'hits':hits[:250]},ensure_ascii=False,indent=2))
