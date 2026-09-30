from pathlib import Path
import re, json

html = Path('beta.html').read_text(encoding='utf-8')
script_re = re.compile(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>', re.I)
id_re = re.compile(r'\bid=["\']([^"\']+)["\']', re.I)

needles = (
    'renderDungeon',
    'v251RenderDetail',
    'v260RenderDetail',
    'v261RenderDetail',
    'v244RenderSelectedDungeonMap',
    'v064RenderMap',
    'dungeonMapCard',
    'v261-stage',
    'v261-bg',
    'gl-dungeon-map-bg-img',
    'glDungeonVisualRefresh',
)

def timer_delays(body):
    out=[]
    for m in re.finditer(r'setTimeout\s*\([\s\S]{0,500}?,\s*(\d{2,5})\s*\)', body):
        out.append(int(m.group(1)))
    return sorted(set(out))

def snippets(body):
    lines=body.splitlines()
    hits=[]
    for i,line in enumerate(lines):
        if (
            'setTimeout' in line or 'setInterval' in line or 'MutationObserver' in line
            or 'renderDungeon' in line
            or 'v251RenderDetail' in line or 'v260RenderDetail' in line or 'v261RenderDetail' in line
            or 'v244RenderSelectedDungeonMap' in line or 'v064RenderMap' in line
            or 'v261-bg' in line or 'gl-dungeon-map-bg-img' in line
            or 'backgroundImage' in line or 'background-image' in line
        ):
            start=max(0,i-1); end=min(len(lines),i+2)
            s='\n'.join(lines[start:end]).strip()
            if s and s not in hits:
                hits.append(s[:1000])
        if len(hits)>=20:
            break
    return hits

candidates=[]
for idx,m in enumerate(script_re.finditer(html)):
    attrs=m.group('attrs')
    if 'src=' in attrs.lower():
        continue
    body=m.group('body')
    score=sum(body.count(n) for n in needles)
    delayed=('setTimeout' in body or 'setInterval' in body or 'MutationObserver' in body)
    if score==0 or not delayed:
        continue
    im=id_re.search(attrs)
    candidates.append({
        'index':idx,
        'id':im.group(1) if im else '',
        'bytes':len(body.encode()),
        'score':score,
        'setTimeout_count':body.count('setTimeout'),
        'setInterval_count':body.count('setInterval'),
        'MutationObserver_count':body.count('MutationObserver'),
        'timer_delays':timer_delays(body),
        'mentions':{n:body.count(n) for n in needles if body.count(n)},
        'snippets':snippets(body),
    })

# Scan external dungeon JS as well.
external=[]
for p in sorted(Path('js').rglob('*.js')):
    try:
        body=p.read_text(encoding='utf-8')
    except Exception:
        continue
    score=sum(body.count(n) for n in needles)
    delayed=('setTimeout' in body or 'setInterval' in body or 'MutationObserver' in body)
    if score==0 or not delayed:
        continue
    external.append({
        'file':p.as_posix(),
        'bytes':len(body.encode()),
        'score':score,
        'setTimeout_count':body.count('setTimeout'),
        'setInterval_count':body.count('setInterval'),
        'MutationObserver_count':body.count('MutationObserver'),
        'timer_delays':timer_delays(body),
        'mentions':{n:body.count(n) for n in needles if body.count(n)},
        'snippets':snippets(body),
    })

report={
    'build':'V8.009-DUNGEON-D5-RENDER-RACE-AUDIT',
    'symptom':'10er map briefly shows canonical background/enemy art, then a delayed pass replaces it with simplified/black rendering',
    'video_observation':'second reproduced transition occurs roughly one second after correct map appears',
    'inline_candidates':sorted(candidates,key=lambda x:(-x['score'],-x['setTimeout_count'],-x['MutationObserver_count'])),
    'external_candidates':sorted(external,key=lambda x:(-x['score'],-x['setTimeout_count'],-x['MutationObserver_count'])),
}
Path('V8009_DUNGEON_D5_RENDER_RACE_AUDIT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
