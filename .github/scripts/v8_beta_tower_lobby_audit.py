from pathlib import Path
import re,json

s=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
mark='id="vTower-system"'
pos=s.find(mark)
if pos<0:
    mark="id='vTower-system'"
    pos=s.find(mark)
if pos<0:
    raise SystemExit('vTower-system marker missing')
tag_start=s.rfind('<script',0,pos)
body_start=s.find('>',pos)+1
body_end=s.find('</script',body_start)
if tag_start<0 or body_start<=0 or body_end<0:
    raise SystemExit('vTower-system bounds missing')
body=s[body_start:body_end]

names=[]
for fm in re.finditer(r'function\\s+([A-Za-z0-9_$]+)\\s*\\(',body):
    name=fm.group(1)
    if re.search(r'(lobby|start|head|home|route|render|recovery|tab|run|rank)',name,re.I):
        names.append({'name':name,'offset':fm.start()})

def extract(name):
    needles=['function '+name+'(','function '+name+' (','async function '+name+'(','async function '+name+' (']
    starts=[body.find(x) for x in needles]
    starts=[x for x in starts if x>=0]
    if not starts:
        return None
    i=min(starts)
    brace=body.find('{',i)
    if brace<0:
        return None
    depth=1
    quote=None
    esc=False
    k=brace+1
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
