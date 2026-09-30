from pathlib import Path
import json,re

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
ids=[
 'v7140-avatar-frame-assets-css',
 'v7230-server-frame-isolation-css',
 'v7268-avatar-frame-layer-fix',
]
out={}
for sid in ids:
    pos=beta.find(sid)
    if pos<0:
        out[sid]={'found':False};continue
    start=beta.rfind('<style',0,pos)
    end=beta.find('</style',pos)
    close=beta.find('>',end) if end>=0 else -1
    block=beta[start:close+1] if start>=0 and close>=0 else ''
    out[sid]={'found':bool(block),'pos':pos,'block':block}

# All code that toggles/uses v7230 server-sync class.
needle='v7230-frame-server-sync'
uses=[]
for m in re.finditer(re.escape(needle),beta):
    a=max(0,beta.rfind('<script',0,m.start()))
    b=beta.find('</script',m.start())
    if a>=0 and b>=0:
        c=beta.find('>',b)
        uses.append(beta[a:c+1][:12000])
out['v7230_script_uses']=uses

Path('V8009_HALL_LATE_FRAME_CSS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:({'found':v.get('found'),'pos':v.get('pos'),'bytes':len(v.get('block','').encode())} if isinstance(v,dict) else len(v)) for k,v in out.items()},ensure_ascii=False,indent=2))
