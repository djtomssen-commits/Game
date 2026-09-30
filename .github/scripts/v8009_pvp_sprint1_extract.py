from pathlib import Path
import re,json,hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_bytes=len(beta.encode())
before_sha=hashlib.sha256(beta.encode()).hexdigest()

script_ids=[
 'v084-hall-dungeon-display-fix-script',
 'v204-pvp-system',
 'v205-pvp-bud-reward',
 'v206-pvp-start-fix',
 'v207-pvp-state-fix',
 'v209-pvp-dungeon-battle',
 'v211-pvp-result-modal',
 'v216-pvp-finish-flow-fix',
 'v248-dungeon-item-card-and-hall-fix',
 'v299-hall-mystic-profile-sync-fix',
 'v407-pvp-bud-leagues',
 'v646-hall-template-js',
 'v326-hall-profile-canonical',
 'v424-hall-combat-power-fix',
 'v437-pvp-combat-power-canonical',
 'v4130-hall-dungeon-authority',
 'v549-pvp-grow-legends-js',
 'v610-pvp-combat-visual-core',
 'v611-pvp-stage-fix-core',
 'v619-pvp-dungeon-motion-core',
 'v620-pvp-dungeon-parity-core',
 'v672-pvp-effect-parity-core',
 'v6200-pvp-battlelog-core',
 'vPvpBudsHallSyncFix',
 'v6145-hall-pagination-js',
 'v6232-pvp-worldboss-fx-parity-core',
 'v7052-pvp-shadow-parity',
 'v7053-atomic-pvp-client-bridge',
 'v7155-pvp-hall-cleanup-marker',
]

style_ids=[
 'v078-pvp',
 'v204-pvp-system-style',
 'v205-pvp-bud-reward-style',
 'v206-pvp-start-fix-style',
 'v209-pvp-dungeon-battle-style',
 'v211-pvp-result-modal-style',
 'v407-pvp-bud-league-style',
 'v326-hall-profile-css',
 'v549-pvp-grow-legends-css',
 'v550-pvp-hero-cleanup-css',
 'v551-pvp-header-final-css',
 'v610-pvp-combat-visual-css',
 'v611-pvp-stage-fix-css',
 'v617-pvp-action-css',
 'v618-pvp-action-final-css',
 'v619-pvp-dungeon-motion-css',
 'v620-pvp-dungeon-parity-css',
 'v672-pvp-effect-parity-css',
 'v6200-pvp-battlelog-css',
 'v6232-pvp-worldboss-fx-parity-css',
 'v7103-pvp-dungeon-parity-css',
]

def safe_name(s):
    return re.sub(r'[^A-Za-z0-9._-]+','-',s)

js_done=[];js_skipped=[]
for sid in script_ids:
    pat=re.compile(
      r'<script(?P<attrs>[^>]*)\bid=["\']'+re.escape(sid)+r'["\'](?P<attrs2>[^>]*)>'
      r'(?P<body>[\s\S]*?)</script\s*>',re.I
    )
    ms=list(pat.finditer(beta))
    if len(ms)!=1:
        js_skipped.append({'id':sid,'reason':f'match_count={len(ms)}'})
        continue
    m=ms[0]; body=m.group('body')
    risky=[x for x in ('document.currentScript','import.meta','document.write(') if x in body]
    if risky:
        js_skipped.append({'id':sid,'reason':'parser/source-sensitive','signals':risky})
        continue
    out=f'js/features/pvp/beta/v8009-s1-{safe_name(sid)}.js'
    p=Path(out);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(body,encoding='utf-8')
    attrs=(m.group('attrs')+m.group('attrs2'))
    if re.search(r'\bsrc\s*=',attrs,re.I): raise RuntimeError(f'unexpected src attr: {sid}')
    repl=f'<script{attrs} src="{out}"></script>'
    beta=beta[:m.start()]+repl+beta[m.end():]
    js_done.append({'id':sid,'file':out,'bytes':len(body.encode()),'sha256':hashlib.sha256(body.encode()).hexdigest()})

css_done=[];css_skipped=[]
for sid in style_ids:
    pat=re.compile(
      r'<style(?P<attrs>[^>]*)\bid=["\']'+re.escape(sid)+r'["\'](?P<attrs2>[^>]*)>'
      r'(?P<body>[\s\S]*?)</style\s*>',re.I
    )
    ms=list(pat.finditer(beta))
    if len(ms)!=1:
        css_skipped.append({'id':sid,'reason':f'match_count={len(ms)}'})
        continue
    m=ms[0]; body=m.group('body')
    # CSS relative URLs change base when externalized. Leave those inline for a later
    # path-aware pass rather than risking the Dungeon D1 boss regression again.
    urls=re.findall(r'url\s*\(([^)]*)\)',body,re.I)
    if urls:
        css_skipped.append({'id':sid,'reason':'contains_url','url_count':len(urls),'samples':urls[:8]})
        continue
    out=f'css/features/pvp/beta/v8009-s1-{safe_name(sid)}.css'
    p=Path(out);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(body,encoding='utf-8')
    repl=f'<link id="{sid}" rel="stylesheet" href="{out}">'
    beta=beta[:m.start()]+repl+beta[m.end():]
    css_done.append({'id':sid,'file':out,'bytes':len(body.encode()),'sha256':hashlib.sha256(body.encode()).hexdigest()})

# Verify exact include counts, order and source removal.
last=-1
for item in js_done:
    if beta.count(item['file'])!=1: raise RuntimeError(f'JS include count !=1: {item["file"]}')
    pos=beta.index(item['file'])
    if pos<=last: raise RuntimeError('JS extracted order changed')
    last=pos
    if re.search(r'<script[^>]*\bid=["\']'+re.escape(item['id'])+r'["\'][^>]*>(?P<body>[\s\S]+?)</script\s*>',beta,re.I):
        mm=re.search(r'<script[^>]*\bid=["\']'+re.escape(item['id'])+r'["\'][^>]*>(?P<body>[\s\S]*?)</script\s*>',beta,re.I)
        if mm and mm.group('body').strip(): raise RuntimeError(f'inline JS body remains: {item["id"]}')

last=-1
for item in css_done:
    if beta.count(item['file'])!=1: raise RuntimeError(f'CSS include count !=1: {item["file"]}')
    pos=beta.index(item['file'])
    if pos<=last: raise RuntimeError('CSS extracted order changed')
    last=pos
    if re.search(r'<style[^>]*\bid=["\']'+re.escape(item['id'])+r'["\']',beta,re.I):
        raise RuntimeError(f'inline CSS remains: {item["id"]}')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
 'build':'V8.009-PVP-SPRINT-1-EXTRACTION',
 'scope':'beta only',
 'stable_unchanged':True,
 'js_extracted':js_done,
 'js_skipped':js_skipped,
 'css_extracted':css_done,
 'css_skipped':css_skipped,
 'counts':{
   'js_extracted':len(js_done),'js_skipped':len(js_skipped),
   'css_extracted':len(css_done),'css_skipped':len(css_skipped),
 },
 'beta_before_bytes':before_bytes,
 'beta_after_bytes':len(beta.encode()),
 'beta_before_sha256':before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
 'logic_changed':False,
 'gameplay_changed':False,
 'matchmaking_changed':False,
 'cooldown_changed':False,
 'rewards_changed':False,
 'server_authority_changed':False
}
Path('V8009_PVP_SPRINT1_EXTRACTION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
