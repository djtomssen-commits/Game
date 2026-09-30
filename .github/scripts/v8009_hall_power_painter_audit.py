from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
script_tag=re.compile(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',re.I)
src_attr=re.compile(r'''\bsrc=["']([^"']+)["']''',re.I)
id_attr=re.compile(r'''\bid=["']([^"']+)["']''',re.I)

signals=('v074ProfileContent','combatPower(','v4125StableCombatPower','v446CombatPower','paintProfileStat','Kampfkraft')
hits=[]
for order,m in enumerate(script_tag.finditer(beta)):
    attrs=m.group('attrs'); sm=src_attr.search(attrs); im=id_attr.search(attrs)
    if sm:
        src=sm.group(1).split('?')[0]
        p=Path(src)
        body=p.read_text(encoding='utf-8',errors='ignore') if p.exists() and p.suffix.lower()=='.js' else ''
        label=src
    else:
        body=m.group('body')
        label='beta.html#'+(im.group(1) if im else f'inline@{m.start()}')
    if 'v074ProfileContent' not in body:
        continue
    local=[s for s in signals if s in body]
    lines=body.splitlines()
    contexts=[]
    for i,line in enumerate(lines):
        if any(s in line for s in signals):
            contexts.append({'line':i+1,'text':line.strip()[:1800]})
    hits.append({'order':order,'file':label,'bytes':len(body.encode()),'signals':local,'contexts':contexts[:200]})

Path('V8009_HALL_POWER_PAINTER_AUDIT.json').write_text(json.dumps({'hits':hits},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(hits,ensure_ascii=False,indent=2))
