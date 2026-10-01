from pathlib import Path
import re,json
rows=[]
for p in sorted(Path('js/features/quest/beta').rglob('*.js')):
    s=p.read_text(encoding='utf-8',errors='ignore')
    counts={
      'setInterval':len(re.findall(r'\bsetInterval\s*\(',s)),
      'setTimeout':len(re.findall(r'\bsetTimeout\s*\(',s)),
      'raf':len(re.findall(r'\brequestAnimationFrame\s*\(',s)),
      'render_assign':len(re.findall(r'(?<![\w.])render\s*=\s*function',s)),
      'renderQuests_assign':len(re.findall(r'\brenderQuests\s*=\s*function',s)),
      'startQuest_assign':len(re.findall(r'\bstartQuest\s*=\s*(?:function|wrapped|wrap|w\b)',s)),
      'claimQuest_assign':len(re.findall(r'\bclaimQuest\s*=\s*(?:function|wrapped|wrap|w\b)',s)),
      'v032Go_assign':len(re.findall(r'\bv032Go\s*=\s*(?:function|wrapped|wrap|w\b)',s)),
      'event_listeners':len(re.findall(r'addEventListener\s*\(',s)),
    }
    if any(counts.values()): rows.append({'path':str(p),**counts})
Path('V8009_QUEST_RUNTIME_LAYER_AUDIT_CURRENT.json').write_text(json.dumps({'build':'V8.009-QUEST-RUNTIME-LAYER-AUDIT-CURRENT','rows':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'rows':rows},ensure_ascii=False,indent=2))
