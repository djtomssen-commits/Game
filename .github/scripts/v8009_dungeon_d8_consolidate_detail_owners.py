from pathlib import Path
import re, json, hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_bytes=len(beta.encode())
before_sha=hashlib.sha256(beta.encode()).hexdigest()

ids=[
  'v426-reference-owner',
  'v427-d6-clean-script',
  'v428-d6-final-owner',
  'v429-d6-scenic-owner',
  'v430-d6-10er-final-script',
  'v432-d7-final-script',
]
archive_parts=[]
first_replacement='<script id="v8009-dungeon-d8-detail-decorator" src="js/features/dungeon/beta/v8009-d8-detail-decorator.js"></script>'

for idx,sid in enumerate(ids):
    pat=re.compile(
      r'<script(?P<attrs>[^>]*)\bid=["\']'+re.escape(sid)+r'["\'](?P<attrs2>[^>]*)>'
      r'(?P<body>[\s\S]*?)</script\s*>',
      re.I
    )
    matches=list(pat.finditer(beta))
    if len(matches)!=1:
        raise RuntimeError(f'expected exactly one active block {sid}, got {len(matches)}')
    m=matches[0]
    body=m.group('body').strip()+'\n'
    archive_parts.append(f'/* ===== RETIRED {sid} ===== */\n'+body)
    replacement=first_replacement if idx==0 else f'<!-- {sid} retired in V8.009-DUNGEON-D8 -->'
    beta=beta[:m.start()]+replacement+beta[m.end():]

archive=Path('js/features/dungeon/legacy/v8009-d8-retired-detail-owner-chain.js')
archive.parent.mkdir(parents=True,exist_ok=True)
archive.write_text(
  '/* RETIRED FROM ACTIVE BETA IN V8.009-DUNGEON-D8. DO NOT LOAD.\n'
  '   Original D1/D6/D7 detail-owner chain retained for rollback/reference. */\n\n'
  +'\n'.join(archive_parts),
  encoding='utf-8'
)

for sid in ids:
    if re.search(r'<script[^>]*\bid=["\']'+re.escape(sid)+r'["\']',beta,re.I):
        raise RuntimeError(f'legacy owner remains active: {sid}')

src='js/features/dungeon/beta/v8009-d8-detail-decorator.js'
if beta.count(src)!=1:
    raise RuntimeError(f'D8 decorator include count != 1: {beta.count(src)}')

owner='js/features/dungeon/beta/v8009-d2-visual-owner.js'
if beta.count(owner)!=1:
    raise RuntimeError('D2 visual owner include count changed')
if beta.index(src)>beta.index(owner):
    raise RuntimeError('D8 decorator must load before D2 visual owner')

seal='js/features/dungeon/beta/v8009-d5-final-detail-seal.js'
if beta.count(seal)!=1:
    raise RuntimeError('D5 final seal include count changed')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
  'build':'V8.009-DUNGEON-D8-BETA',
  'phase':'Consolidate D1/D6/D7 detail decoration into one canonical post-render decorator',
  'scope':'beta only',
  'stable_unchanged':True,
  'beta_before_bytes':before_bytes,
  'beta_after_bytes':len(beta.encode()),
  'beta_before_sha256':before_sha,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'canonical_decorator':src,
  'canonical_visual_owner':owner,
  'retired_owner_scripts':ids,
  'legacy_owner_scripts_active':False,
  'legacy_archive':archive.as_posix(),
  'compatibility_aliases_retained':['v426RenderDetail','v427RenderDetail'],
  'migrated_behavior':[
    'D1 reference class/title/fallback background',
    'D6 title/name cleanup/sign/node positions',
    'D7 title/name cleanup/sign/node positions'
  ],
  'renderDungeon_monkey_patches_removed':True,
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D8_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
