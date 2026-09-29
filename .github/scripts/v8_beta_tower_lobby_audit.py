from pathlib import Path
import re,json

s=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
m=re.search(r'<script[^>]*id=["\\\']vTower-system["\\\'][^>]*>([\\s\\S]*?)</script\\s*>',s,re.I)
if not m:
    raise SystemExit('vTower-system missing')
body=m.group(1)

names=[]
for fm in re.finditer(r'\\b(?:async\\s+)?function\\s+([A-Za-z0-9_$]+)\\s*\\(',body):
    name=fm.group(1)
    if re.search(r'(lobby|start|head|home|route|render|recovery|tab|run|rank)',name,re.I):
        names.append({'name':name,'offset':fm.start()})

def extract(name):
    mm=re.search(r'\\b(?:async\\s+)?function\\s+'+re.escape(name)+r'\\s*\\([^)]*\\)\\s*\\{',body)
    if not mm:
        return None
    i=mm.start()
    j=mm.end()
    depth=1
    quote=None
    esc=False
    k=j
    template=chr(96)
    while k<len(body) and depth:
        ch=body[k]
        if quote is not None:
            if esc:
                esc=False
            elif ch=='\\\\':
                esc=True
            elif ch==quote:
                quote=None
        else:
            if ch in ("'",'"',template):
                quote=ch
            elif ch=='{':
                depth+=1
            elif ch=='}':
                depth-=1
        k+=1
    return body[i:k]

wanted=['lobbyView','startView','routeView','v6259Head','v6259RunLine','render','ensure','loadRanking','vTowerRender']
extracts={}
for name in wanted:
    x=extract(name)
    if x:
        extracts[name]=x

tokens=['v6259-lobby-card','data-vt-start','v6345-lobby-hp-live','vTStart','towerTab','vT-tabs','vT-run']
snips={}
for t in tokens:
    i=body.find(t)
    if i>=0:
        snips[t]=body[max(0,i-1800):min(len(body),i+4000)]

Path('V8_BETA_TOWER_LOBBY_AUDIT.json').write_text(
    json.dumps({'functions':names,'extracts':extracts,'snippets':snips},ensure_ascii=False,indent=2),
    encoding='utf-8'
)
print(json.dumps({'functions':names,'extracts':extracts,'snippets':snips},ensure_ascii=False,indent=2))
