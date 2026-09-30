from pathlib import Path
import json
lines=Path('beta.html').read_text(encoding='utf-8',errors='ignore').splitlines()
ranges=[(38869,38925),(92620,92735),(92735,92810)]
out=[]
for a,b in ranges:
 out.append({'start':a,'end':b,'lines':[{'line':i,'text':lines[i-1]} for i in range(a,min(b,len(lines))+1)]})
Path('V8009_LEVELUP_BLOCKS.json').write_text(json.dumps({'build':'V8.009-LEVELUP-BLOCKS','ranges':out},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
