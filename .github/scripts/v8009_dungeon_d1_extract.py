from pathlib import Path
import re, hashlib, json

BUILD='V8.009-DUNGEON-D1-BETA'
JS_PATH='js/features/dungeon/beta/v8009-d1-combat-renderer.js'
CSS_PATH='css/features/dungeon/beta/v8009-d1-combat-renderer.css'

stable_path=Path('index.html')
beta_path=Path('beta.html')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode()).hexdigest()
beta_before_bytes=len(beta.encode())

script_pat=re.compile(r'<script(?P<attrs>[^>]*\bid=["\']v7175-combat-renderer-core["\'][^>]*)>(?P<body>[\s\S]*?)</script\s*>',re.I)
style_pat=re.compile(r'<style(?P<attrs>[^>]*\bid=["\']v7175-combat-renderer-css["\'][^>]*)>(?P<body>[\s\S]*?)</style\s*>',re.I)

sm=script_pat.search(beta)
cm=style_pat.search(beta)
if not sm: raise RuntimeError('inline v7175 combat renderer core not found')
if not cm: raise RuntimeError('inline v7175 combat renderer CSS not found')
if 'src=' in sm.group('attrs').lower(): raise RuntimeError('v7175 combat JS already external')
if len(sm.group('body').encode()) < 40000: raise RuntimeError('unexpectedly small v7175 combat JS')
if len(cm.group('body').encode()) < 40000: raise RuntimeError('unexpectedly small v7175 combat CSS')
if re.search(r'url\s*\(',cm.group('body'),re.I): raise RuntimeError('CSS has url(); rewrite asset paths before extraction')
if '__V7175_COMBAT_RENDERER__' not in sm.group('body'): raise RuntimeError('combat owner sentinel missing')
if '.v7158-combat-stage' not in cm.group('body'): raise RuntimeError('combat CSS contract missing')

js_body=sm.group('body').strip()+'\n'
css_body=cm.group('body').strip()+'\n'

jp=Path(JS_PATH); jp.parent.mkdir(parents=True,exist_ok=True); jp.write_text(js_body,encoding='utf-8')
cp=Path(CSS_PATH); cp.parent.mkdir(parents=True,exist_ok=True); cp.write_text(css_body,encoding='utf-8')

beta=beta[:sm.start()] + f'<script id="v7175-combat-renderer-core" src="{JS_PATH}"></script>' + beta[sm.end():]
cm2=style_pat.search(beta)
if not cm2: raise RuntimeError('v7175 CSS block disappeared before replacement')
beta=beta[:cm2.start()] + f'<link id="v7175-combat-renderer-css" rel="stylesheet" href="{CSS_PATH}">' + beta[cm2.end():]

if beta.count(JS_PATH)!=1: raise RuntimeError('external combat JS not loaded exactly once')
if beta.count(CSS_PATH)!=1: raise RuntimeError('external combat CSS not loaded exactly once')
if '<script id="v7175-combat-renderer-core">' in beta: raise RuntimeError('inline combat JS still present')
if '<style id="v7175-combat-renderer-css">' in beta: raise RuntimeError('inline combat CSS still present')

css_pos=beta.index('id="v7175-combat-renderer-css"')
script_pos=beta.index('id="v7175-combat-renderer-core"')
if not (beta.index('id="v7137-final-version-css"') < css_pos < beta.index('id="v7154-character-frame-stability-css"')):
    raise RuntimeError('combat CSS source order changed')
if not (beta.index('id="v7137-shift-frame-client"') < script_pos < beta.index('id="v7154-character-frame-stability"')):
    raise RuntimeError('combat JS source order changed')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed')

report={
  'build':BUILD,
  'phase':'Canonical 2D combat renderer extraction',
  'scope':'beta only',
  'stable_unchanged':True,
  'stable_sha256':stable_sha,
  'beta_before_sha256':beta_before_sha,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'beta_before_bytes':beta_before_bytes,
  'beta_after_bytes':len(beta.encode()),
  'extracted':[
    {'legacy_id':'v7175-combat-renderer-core','file':JS_PATH,'bytes':len(js_body.encode()),'sha256':hashlib.sha256(js_body.encode()).hexdigest()},
    {'legacy_id':'v7175-combat-renderer-css','file':CSS_PATH,'bytes':len(css_body.encode()),'sha256':hashlib.sha256(css_body.encode()).hexdigest()}
  ],
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D1_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
