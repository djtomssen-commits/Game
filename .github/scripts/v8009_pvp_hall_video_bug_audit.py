from pathlib import Path
import re,json

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')

names=[
 'v072RenderOwnProfile','v074OpenProfile','v073PlayerRow','v073LoadRanking',
 'v073ProfilePayload','v073SyncProfile','combatPower','v4125StableCombatPower',
]
assign_rx={n:re.compile(r'(?<![\w$])(?:window\.)?'+re.escape(n)+r'\s*=(?!=)') for n in names}
call_rx={n:re.compile(r'\b'+re.escape(n)+r'\s*\(') for n in names}

script_tag=re.compile(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',re.I)
src_attr=re.compile(r'''\bsrc=["']([^"']+)["']''',re.I)
id_attr=re.compile(r'''\bid=["']([^"']+)["']''',re.I)

timeline={n:[] for n in names}
scripts=[]
for order,m in enumerate(script_tag.finditer(beta)):
    attrs=m.group('attrs')
    sm=src_attr.search(attrs); im=id_attr.search(attrs)
    if sm:
        src=sm.group(1).split('?')[0]
        p=Path(src)
        body=p.read_text(encoding='utf-8',errors='ignore') if p.exists() and p.suffix.lower()=='.js' else ''
        label=src
    else:
        body=m.group('body')
        sid=im.group(1) if im else f'inline@{m.start()}'
        label='beta.html#'+sid

    refs=[]
    for n in names:
        for i,line in enumerate(body.splitlines()):
            if n not in line: continue
            kind='assignment' if assign_rx[n].search(line) else ('call' if call_rx[n].search(line) else 'reference')
            refs.append({'name':n,'line':i+1,'kind':kind,'text':line.strip()[:1400]})
            timeline[n].append({'order':order,'file':label,'line':i+1,'kind':kind,'text':line.strip()[:1400]})
    if refs:
        scripts.append({
          'order':order,'file':label,'bytes':len(body.encode()),'refs':refs,
          'setTimeout':body.count('setTimeout'),'requestAnimationFrame':body.count('requestAnimationFrame'),
          'listeners':body.count('addEventListener'),'observer':body.count('MutationObserver')
        })

# Find suspicious local-power injection into foreign/profile rendering.
power_hits=[]
patterns=[
 'combat_power','Kampfkraft','v424CurrentPower','v326CurrentPower','livePower',
 'v4125StableCombatPower','v073User','ownId','is_anonymous'
]
for s in scripts:
    pth=s['file']
    if pth.startswith('beta.html#'):
        continue
    p=Path(pth)
    if not p.exists(): continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    if not any(x in txt for x in patterns): continue
    hits=[]
    for i,line in enumerate(txt.splitlines()):
        if any(x in line for x in patterns):
            hits.append({'line':i+1,'text':line.strip()[:1600]})
    if hits:
        power_hits.append({'file':pth,'order':s['order'],'hits':hits[:120]})

# Include bodies of likely late Hall owners for direct review.
interesting=[]
for s in scripts:
    f=s['file']
    if any(k in f for k in ('v326','v424','v438','v4130','v649','v6145','v646','v299','v084','v248')):
        if f.startswith('beta.html#'):
            # extract inline block by order again
            pass
        interesting.append(s)

out={
 'build':'V8.009-PVP-HALL-VIDEO-BUG-AUDIT',
 'timeline':timeline,
 'scripts':scripts,
 'power_hits':power_hits,
 'interesting':interesting,
}
Path('V8009_PVP_HALL_VIDEO_BUG_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\\n',encoding='utf-8')

summary={}
for n,ev in timeline.items():
    assigns=[x for x in ev if x['kind']=='assignment']
    summary[n]=assigns
print(json.dumps({'assignments':summary,'interesting':interesting},ensure_ascii=False,indent=2))
