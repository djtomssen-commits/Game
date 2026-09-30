from pathlib import Path
import re,json,hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8',errors='ignore')
stable=stable_path.read_text(encoding='utf-8',errors='ignore')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before=len(beta.encode())

sid='v6290-performance-hall-fix-js'
pat=re.compile(
  r'<script(?P<attrs>[^>]*)\bid=["\']'+re.escape(sid)+r'["\'](?P<attrs2>[^>]*)>'
  r'(?P<body>[\s\S]*?)</script\s*>',re.I
)
ms=list(pat.finditer(beta))
if len(ms)!=1:
    raise RuntimeError(f'expected one active {sid}, got {len(ms)}')
m=ms[0]
body=m.group('body').strip()+'\n'

archive=Path('js/features/pvp/legacy/v8009-s1-retired-v6290-performance-hall-fix.js')
archive.parent.mkdir(parents=True,exist_ok=True)
archive.write_text(
  '/* RETIRED FROM ACTIVE BETA IN V8.009-PVP-SPRINT-1. DO NOT LOAD.\n'
  '   Ranking/own-profile post-render decoration moved directly into v6145/v326. */\n\n'
  +body,
  encoding='utf-8'
)

beta=beta[:m.start()]+'<!-- v6290-performance-hall-fix-js retired in V8.009-PVP-SPRINT-1 -->'+beta[m.end():]

if re.search(r'<script[^>]*\bid=["\']'+re.escape(sid)+r'["\']',beta,re.I):
    raise RuntimeError('v6290 still active')

for ref in (
  'js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js',
  'js/features/pvp/beta/v8009-s1-v326-hall-profile-canonical.js',
  'js/features/pvp/beta/v8009-s1-v646-hall-template-js.js',
):
    if beta.count(ref)!=1:
        raise RuntimeError(f'critical Hall include count changed: {ref}')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8',errors='ignore').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
  'build':'V8.009-PVP-SPRINT-1-V6290-RETIREMENT',
  'scope':'beta only',
  'stable_unchanged':True,
  'retired_script':sid,
  'legacy_archive':archive.as_posix(),
  'direct_owner_rank':'v6145-hall-pagination-js',
  'direct_owner_own_profile':'v326-hall-profile-canonical',
  'decorator':'v646DecorateHall',
  'beta_before_bytes':before,
  'beta_after_bytes':len(beta.encode()),
  'gameplay_changed':False,
  'matchmaking_changed':False,
  'combat_changed':False,
  'cooldown_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_PVP_SPRINT1_V6290_RETIREMENT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
