from pathlib import Path
import hashlib, json, re

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_bytes=len(beta.encode())
before_sha=hashlib.sha256(beta.encode()).hexdigest()

css='<link id="v260-dungeon-detail-style" rel="stylesheet" href="css/features/dungeon/beta/v8009-d4-v260-detail.css">'
js='<script id="v260-dungeon-detail-script" src="js/features/dungeon/beta/v8009-d4-v260-detail.js"></script>'

if beta.count(css)!=1:
    raise RuntimeError(f'expected one v260 CSS include, got {beta.count(css)}')
if beta.count(js)!=1:
    raise RuntimeError(f'expected one v260 JS include, got {beta.count(js)}')

beta=beta.replace(css,'<!-- v260-dungeon-detail-style retired from active Beta in V8.009-DUNGEON-D6 -->',1)
beta=beta.replace(js,'<!-- v260-dungeon-detail-script retired from active Beta in V8.009-DUNGEON-D6 -->',1)

for ref in ('v8009-d4-v260-detail.css','v8009-d4-v260-detail.js'):
    if ref in beta:
        raise RuntimeError(f'v260 active file reference remains: {ref}')

# Canonical D2/D4/D5 owners must remain exactly once.
required=[
  'js/features/dungeon/beta/v8009-d4-v251-modern-maps.js',
  'js/features/dungeon/beta/v8009-d4-v261-detail.js',
  'js/features/dungeon/beta/v8009-d2-visual-owner.js',
  'js/features/dungeon/beta/v8009-d2-detail-render-lock.js',
  'js/features/dungeon/beta/v8009-d5-final-detail-seal.js',
]
for ref in required:
    if beta.count(ref)!=1:
        raise RuntimeError(f'canonical include count changed for {ref}: {beta.count(ref)}')

beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

# Files are intentionally retained for rollback/reference.
for p in (
  Path('css/features/dungeon/beta/v8009-d4-v260-detail.css'),
  Path('js/features/dungeon/beta/v8009-d4-v260-detail.js'),
):
    if not p.exists():
        raise RuntimeError(f'retained v260 file missing: {p}')

report={
  'build':'V8.009-DUNGEON-D6-BETA',
  'phase':'Unload superseded v260 detail renderer/style from Beta load chain',
  'scope':'beta only',
  'stable_unchanged':True,
  'beta_before_bytes':before_bytes,
  'beta_after_bytes':len(beta.encode()),
  'beta_before_sha256':before_sha,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'v260_css_loaded':False,
  'v260_js_loaded':False,
  'v260_files_retained':True,
  'canonical_detail_owner':'v261RenderDetail',
  'world_owner':'v251RenderWorld',
  'compatibility_alias_v260_to_v261_retained':True,
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D6_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
