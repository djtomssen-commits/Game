from pathlib import Path
import re,json,hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_bytes=len(beta.encode())
before_sha=hashlib.sha256(beta.encode()).hexdigest()

ids=[
 'v454-d1-feinschliff-script',
 'v458-d1-road-and-sign-final',
 'v459-d1-right-side-thumb-final-script',
 'v460-d1-thumb-owner-fix-script',
 'v461-d1-node9-collision-fix-script',
 'v463-d1-screenshot-polish-script',
]

archive_parts=[]
stats={'setTimeout':0,'requestAnimationFrame':0,'addEventListener':0}
for sid in ids:
    pat=re.compile(
      r'<script(?P<attrs>[^>]*)\bid=["\']'+re.escape(sid)+r'["\'](?P<attrs2>[^>]*)>'
      r'(?P<body>[\s\S]*?)</script\s*>',
      re.I
    )
    matches=list(pat.finditer(beta))
    if len(matches)!=1:
        raise RuntimeError(f'expected one active D1 polish block {sid}, got {len(matches)}')
    m=matches[0]
    body=m.group('body').strip()+'\n'
    archive_parts.append(f'/* ===== RETIRED {sid} ===== */\n'+body)
    stats['setTimeout']+=body.count('setTimeout')
    stats['requestAnimationFrame']+=body.count('requestAnimationFrame')
    stats['addEventListener']+=body.count('addEventListener')
    beta=beta[:m.start()]+f'<!-- {sid} retired in V8.009-DUNGEON-D9 -->'+beta[m.end():]

archive=Path('js/features/dungeon/legacy/v8009-d9-retired-d1-polish-chain.js')
archive.parent.mkdir(parents=True,exist_ok=True)
archive.write_text(
  '/* RETIRED FROM ACTIVE BETA IN V8.009-DUNGEON-D9. DO NOT LOAD.\n'
  '   Final visible D1 behavior migrated into v8009-d8-detail-decorator.js;\n'
  '   canonical thumb ownership remains in v8009-d2-visual-owner.js. */\n\n'
  +'\n'.join(archive_parts),
  encoding='utf-8'
)

for sid in ids:
    if re.search(r'<script[^>]*\bid=["\']'+re.escape(sid)+r'["\']',beta,re.I):
        raise RuntimeError(f'D1 polish block still active: {sid}')

required=[
 'js/features/dungeon/beta/v8009-d8-detail-decorator.js',
 'js/features/dungeon/beta/v8009-d2-visual-owner.js',
 'js/features/dungeon/beta/v8009-d2-detail-render-lock.js',
 'js/features/dungeon/beta/v8009-d5-final-detail-seal.js',
]
for ref in required:
    if beta.count(ref)!=1:
        raise RuntimeError(f'canonical include count changed: {ref}')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
  'build':'V8.009-DUNGEON-D9-BETA',
  'phase':'Consolidate remaining D1 polish chain into canonical decorator/thumb owner',
  'scope':'beta only',
  'stable_unchanged':True,
  'beta_before_bytes':before_bytes,
  'beta_after_bytes':len(beta.encode()),
  'beta_before_sha256':before_sha,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'retired_d1_polish_scripts':ids,
  'retired_d1_polish_active':False,
  'legacy_archive':archive.as_posix(),
  'migrated_behavior':[
    'D1 final enemy names/icons',
    'D1 final title',
    'D1 final warning sign',
    'D1 final road polyline from v463',
    'D1 current enemy label'
  ],
  'thumb_behavior':'canonical D2 visual owner retained; historical D1 thumb repaint race removed',
  'retired_scheduling_counts':stats,
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D9_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
