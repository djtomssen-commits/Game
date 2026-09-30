from pathlib import Path
import json
beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
needle='.v6145-podium-avatar'
pos=beta.find(needle)
out={'found':pos>=0,'pos':pos}
if pos>=0:
    start=beta.rfind('<style',0,pos)
    end=beta.find('</style',pos)
    close=beta.find('>',end) if end>=0 else -1
    if start>=0 and close>=0:
        block=beta[start:close+1]
        out['block']=block
        out['bytes']=len(block.encode())
Path('V8009_HALL_PODIUM_CSS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'found':out['found'],'pos':pos,'bytes':out.get('bytes')},ensure_ascii=False,indent=2))
