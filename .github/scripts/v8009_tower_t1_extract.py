from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_sha=hashlib.sha256(beta.encode()).hexdigest()

js_dir=Path('js/features/tower/beta')
css_dir=Path('css/features/tower/beta')
js_dir.mkdir(parents=True,exist_ok=True)
css_dir.mkdir(parents=True,exist_ok=True)

def extract_script(html,sid,out_path):
    pats=[
      re.compile(rf'<script(?P<attrs>[^>]*)id="{re.escape(sid)}"(?P<attrs2>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',re.I),
      re.compile(rf"<script(?P<attrs>[^>]*)id='{re.escape(sid)}'(?P<attrs2>[^>]*)>(?P<body>[\s\S]*?)</script\s*>",re.I),
    ]
    hits=[]
    for p in pats:hits.extend(list(p.finditer(html)))
    if len(hits)!=1: raise RuntimeError(f'{sid}: expected one inline script, got {len(hits)}')
    m=hits[0]
    body=m.group('body')
    if not body.strip(): raise RuntimeError(f'{sid}: empty script')
    Path(out_path).write_text(body.strip()+'\n',encoding='utf-8')
    tag=f'<script id="{sid}" src="{out_path}"></script>'
    return html[:m.start()]+tag+html[m.end():]

def extract_style(html,sid,out_path):
    pats=[
      re.compile(rf'<style(?P<attrs>[^>]*)id="{re.escape(sid)}"(?P<attrs2>[^>]*)>(?P<body>[\s\S]*?)</style\s*>',re.I),
      re.compile(rf"<style(?P<attrs>[^>]*)id='{re.escape(sid)}'(?P<attrs2>[^>]*)>(?P<body>[\s\S]*?)</style\s*>",re.I),
    ]
    hits=[]
    for p in pats:hits.extend(list(p.finditer(html)))
    if len(hits)!=1: raise RuntimeError(f'{sid}: expected one inline style, got {len(hits)}')
    m=hits[0]
    body=m.group('body')
    if not body.strip(): raise RuntimeError(f'{sid}: empty style')
    Path(out_path).write_text(body.strip()+'\n',encoding='utf-8')
    tag=f'<link id="{sid}" rel="stylesheet" href="{out_path}">'
    return html[:m.start()]+tag+html[m.end():]

js_map=[
 ('v7096-tower-direct-preempt','js/features/tower/beta/v8009-t1-tower-direct-preempt.js'),
 ('vTower-system','js/features/tower/beta/v8009-t1-tower-system.js'),
 ('v4166-tower-entry-authority-js','js/features/tower/beta/v8009-t1-tower-entry.js'),
]
for sid,out in js_map:
    beta=extract_script(beta,sid,out)

style_ids=[
 'v6259-tower-exact-css',
 'v6260-tower-video-match-css',
 'v6264-tower-lobby-css',
 'v6265-tower-startfloor-css',
 'v6269-tower-complete-rework-css',
 'v6270-tower-lobby-fixes-css',
 'v6271-tower-topbar-lobby-css',
 'v6277-tower-wednesday-live-css',
 'v6297-class-display-parity-css',
 'v6345-tower-lobby-hp-timer-css',
]
css_files=[]
for sid in style_ids:
    out=f'css/features/tower/beta/{sid}.css'
    beta=extract_style(beta,sid,out)
    css_files.append(out)

if "window.GROW_BETA_TECH_BUILD='V8.009-B1'" in beta:
    beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.009-B1'","window.GROW_BETA_TECH_BUILD='V8.009-T1'",1)
elif "window.GROW_BETA_TECH_BUILD='V8.009-T1'" not in beta:
    raise RuntimeError('expected beta build marker missing')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only tower extraction')

report={
 'build':'V8.009-T1-BETA',
 'phase':'Tower T1 startpage extraction',
 'scope':'beta only',
 'js_files':[x[1] for x in js_map],
 'css_files':css_files,
 'tower_system_bytes':Path('js/features/tower/beta/v8009-t1-tower-system.js').stat().st_size,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False
}
Path('V8009_TOWER_T1_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
