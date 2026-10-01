from pathlib import Path
import json
beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
files=[
'js/features/tower/beta/v8009-t1-tower-entry.js',
'js/features/tower/beta/v8009-t1-tower-direct-preempt.js',
'js/features/tower/beta/v8009-t1-tower-system.js',
'js/features/tower/beta/v8009-t2-tower-lobby.js'
]
items=[{'file':f,'loaded':(p:=beta.find(f))>=0,'pos':p} for f in files]
items.sort(key=lambda x:(x['pos']<0,x['pos']))
Path('V8009_TOWER_LOAD_ORDER_AUDIT.json').write_text(json.dumps({'build':'V8.009-TOWER-LOAD-ORDER-AUDIT','items':items},indent=2)+'\n',encoding='utf-8')
print(json.dumps({'items':items},indent=2))
