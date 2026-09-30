from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
needles=[
 '.v6145-podium-avatar',
 '.v6145-podium-card',
 '.v7139-frame-art',
 '.v7137-frame-target',
 '.v646-row-avatar',
]
hits=[]

# Inline styles in exact HTML order.
for order,m in enumerate(re.finditer(r'<style(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</style\s*>',beta,re.I)):
    body=m.group('body')
    if not any(n in body for n in needles): continue
    idm=re.search(r'''\bid=["']([^"']+)["']''',m.group('attrs'),re.I)
    sid=idm.group(1) if idm else f'inline-style@{m.start()}'
    lines=body.splitlines()
    ctx=[]
    for i,line in enumerate(lines):
        if any(n in line for n in needles) or ('img' in line and 'hall' in line.lower()):
            ctx.append({'line':i+1,'text':line.strip()[:1600]})
    hits.append({'kind':'inline','order':m.start(),'id':sid,'contexts':ctx[:300]})

# External CSS in HTML load order.
for m in re.finditer(r'<link(?P<attrs>[^>]+)>',beta,re.I):
    attrs=m.group('attrs')
    hm=re.search(r'''\bhref=["']([^"']+\.css(?:\?[^"']*)?)["']''',attrs,re.I)
    if not hm: continue
    href=hm.group(1).split('?')[0]
    p=Path(href)
    if not p.exists(): continue
    body=p.read_text(encoding='utf-8',errors='ignore')
    if not any(n in body for n in needles): continue
    idm=re.search(r'''\bid=["']([^"']+)["']''',attrs,re.I)
    sid=idm.group(1) if idm else p.name
    lines=body.splitlines()
    ctx=[]
    for i,line in enumerate(lines):
        if any(n in line for n in needles):
            ctx.append({'line':i+1,'text':line.strip()[:1800]})
    hits.append({'kind':'external','order':m.start(),'id':sid,'href':href,'contexts':ctx[:300]})

hits.sort(key=lambda x:x['order'])
out={'build':'V8.009-HALL-CSS-OWNER-AUDIT','hits':hits}
Path('V8009_HALL_CSS_OWNER_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(hits,ensure_ascii=False,indent=2))
