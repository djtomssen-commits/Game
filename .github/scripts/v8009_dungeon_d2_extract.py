from pathlib import Path
import re, hashlib, json

BUILD='V8.009-DUNGEON-D2-BETA'
TARGETS=[
  {
    'id':'gl-dungeon-visual-owner-script',
    'path':'js/features/dungeon/beta/v8009-d2-visual-owner.js',
    'sentinel':'__GL_DUNGEON_VISUAL_OWNER_PHASE2F__',
    'before':'id="gl-dungeon-visual-owner-css"',
    'after':'id="v4166-tower-entry-authority-css"'
  },
  {
    'id':'v7162-dungeon-map-final-owner-script',
    'path':'js/features/dungeon/beta/v8009-d2-map-finalizer.js',
    'sentinel':'__V7162_DUNGEON_MAP_FINAL__',
    'before':'id="v7162-dungeon-map-final-owner"',
    'after':'id="v7163-character-frame-compositor-fix"'
  },
  {
    'id':'v7166-dungeon-detail-render-lock',
    'path':'js/features/dungeon/beta/v8009-d2-detail-render-lock.js',
    'sentinel':'__V7166_DUNGEON_DETAIL_RENDER_LOCK__',
    'before':'id="v7166-dungeon-detail-render-lock-css"',
    'after':'id="v7166-final-version-css"'
  }
]

stable_path=Path('index.html')
beta_path=Path('beta.html')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode()).hexdigest()
beta_before_bytes=len(beta.encode())

extracted=[]
for t in TARGETS:
    pat=re.compile(r'<script(?P<attrs>[^>]*\\bid=["\']'+re.escape(t['id'])+r'["\'][^>]*)>(?P<body>[\\s\\S]*?)</script\\s*>',re.I)
    m=pat.search(beta)
    if not m:
        raise RuntimeError(f"inline {t['id']} not found")
    if 'src=' in m.group('attrs').lower():
        raise RuntimeError(f"{t['id']} already external")
    body=m.group('body').strip()+'\\n'
    if t['sentinel'] not in body:
        raise RuntimeError(f"sentinel missing for {t['id']}")
    if len(body.encode())<700:
        raise RuntimeError(f"unexpectedly small block {t['id']}")
    p=Path(t['path']); p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(body,encoding='utf-8')
    replacement=f'<script id="{t["id"]}" src="{t["path"]}"></script>'
    beta=beta[:m.start()]+replacement+beta[m.end():]
    extracted.append({
      'legacy_id':t['id'],
      'file':t['path'],
      'bytes':len(body.encode()),
      'sha256':hashlib.sha256(body.encode()).hexdigest()
    })

for t in TARGETS:
    if beta.count(t['path'])!=1:
        raise RuntimeError(f"external include count != 1 for {t['path']}")
    if re.search(r'<script[^>]*\\bid=["\']'+re.escape(t['id'])+r'["\'][^>]*>(?!\\s*</script>)',beta,re.I):
        # External tags have no inline body; exact inline presence is checked below.
        pass
    marker=f'id="{t["id"]}"'
    pos=beta.index(marker)
    if not (beta.index(t['before']) < pos < beta.index(t['after'])):
        raise RuntimeError(f"source order changed for {t['id']}")

# Ensure the old inline bodies/sentinels are no longer embedded in beta HTML.
for t in TARGETS:
    tag_re=re.compile(r'<script[^>]*\\bid=["\']'+re.escape(t['id'])+r'["\'][^>]*>(?P<body>[\\s\\S]*?)</script\\s*>',re.I)
    mm=tag_re.search(beta)
    if not mm:
        raise RuntimeError(f"replacement tag missing for {t['id']}")
    if mm.group('body').strip():
        raise RuntimeError(f"inline body remains for {t['id']}")

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed')

report={
  'build':BUILD,
  'phase':'Dungeon map/detail visual owner chain extraction',
  'scope':'beta only',
  'stable_unchanged':True,
  'stable_sha256':stable_sha,
  'beta_before_sha256':beta_before_sha,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'beta_before_bytes':beta_before_bytes,
  'beta_after_bytes':len(beta.encode()),
  'extracted':extracted,
  'owner_chain':[
    'gl-dungeon-visual-owner-script: canonical map/battle visual owner; exports glDungeonVisualRefresh and wraps renderDungeon',
    'v7162-dungeon-map-final-owner-script: lifecycle-only finalizer; calls glDungeonVisualRefresh; no observer/interval',
    'v7166-dungeon-detail-render-lock: guards historical direct detail renderers and repairs canonical detail after legacy calls'
  ],
  'left_inline_for_later_audit':[
    'v7166-dungeon-detail-render-lock-css',
    'v251/v260/v261 historical map/detail renderers and styles'
  ],
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D2_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
