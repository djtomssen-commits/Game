from pathlib import Path
import re, json

targets=('gl-dungeon-map-bg-img','gl-dungeon-node-art','gl-dungeon-current-thumb-img')
patterns=('remove()','removeChild','replaceChildren','innerHTML','textContent','display','visibility','opacity','src','querySelectorAll','querySelector')

def scan(name,body,origin):
    hits=[]
    lines=body.splitlines()
    for i,line in enumerate(lines):
        if any(t in line for t in targets):
            s=max(0,i-3); e=min(len(lines),i+5)
            chunk='\n'.join(lines[s:e])
            hits.append({'line':i+1,'chunk':chunk})
    # also catch generic IMG cleanup inside dungeon contexts
    for i,line in enumerate(lines):
        low=line.lower()
        if ('dungeon' in body.lower() or 'v261' in body) and ('queryselectorall' in low and ('img' in low or 'picture' in low)) and ('remove' in body[max(0,body.find(line)-500):body.find(line)+1200].lower()):
            s=max(0,i-3); e=min(len(lines),i+5)
            chunk='\n'.join(lines[s:e])
            if not any(x['chunk']==chunk for x in hits):
                hits.append({'line':i+1,'chunk':chunk})
    return {'name':name,'origin':origin,'hits':hits} if hits else None

out=[]
for p in sorted(Path('js').rglob('*.js')):
    txt=p.read_text(encoding='utf-8',errors='ignore')
    r=scan(p.as_posix(),txt,'external')
    if r: out.append(r)

html=Path('beta.html').read_text(encoding='utf-8')
for m in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',html,re.I):
    if 'src=' in m.group('attrs').lower(): continue
    body=m.group('body')
    if not any(t in body for t in targets) and 'v261' not in body and 'dungeonMapCard' not in body: continue
    im=re.search(r'\bid=["\']([^"\']+)["\']',m.group('attrs'),re.I)
    name=im.group(1) if im else f'inline@{m.start()}'
    r=scan(name,body,'inline')
    if r: out.append(r)

Path('V8009_DUNGEON_D5_ASSET_REMOVER_AUDIT.json').write_text(json.dumps({'build':'V8.009-DUNGEON-D5-ASSET-REMOVER-AUDIT','results':out},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'count':len(out),'results':out},ensure_ascii=False,indent=2))
