from pathlib import Path
import json,re
s=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
needles=[
 'v6140-central-game-event-bridge',
 'v7045-atomic-quest-receipt-client.js',
 'v7046-quest-event-duplicate-reward-guard.js',
 'growlegends:account-ready'
]
out={'build':'V8.009-QUEST-V7046-ORDER-AUDIT','positions':{},'snippets':{}}
for n in needles:
 i=s.find(n)
 out['positions'][n]=i
 out['snippets'][n]=s[max(0,i-500):i+1200] if i>=0 else ''
Path('V8009_QUEST_V7046_ORDER_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(out,ensure_ascii=False,indent=2))
