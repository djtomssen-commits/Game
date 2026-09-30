from pathlib import Path
import hashlib,json,re

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_bytes=len(beta.encode())
before_sha=hashlib.sha256(beta.encode()).hexdigest()

sid='v461-d1-node9-collision-fix'
href='css/features/dungeon/beta/v8009-d11-v461-d1-node9-collision-fix.css'
pat=re.compile(r'<link[^>]*\bid=["\']'+re.escape(sid)+r'["\'][^>]*\bhref=["\']'+re.escape(href)+r'["\'][^>]*>',re.I)
matches=list(pat.finditer(beta))
if len(matches)!=1:
    raise RuntimeError(f'expected one active v461 D1 CSS link, got {len(matches)}')
m=matches[0]
beta=beta[:m.start()]+'<!-- v461-d1-node9-collision-fix retired in V8.009-DUNGEON-D12: 100% cascade-redundant -->'+beta[m.end():]

if href in beta:
    raise RuntimeError('v461 D1 CSS still loaded')
if not Path(href).exists():
    raise RuntimeError('v461 D1 CSS reference file missing')

# Neighboring later layers that supersede v461 must remain active.
for required in (
  'css/features/dungeon/beta/v8009-d11-v463-d1-screenshot-polish.css',
  'css/features/dungeon/beta/v8009-d11-v464-d1-boss-micro-position.css',
  'js/features/dungeon/beta/v8009-d8-detail-decorator.js',
  'js/features/dungeon/beta/v8009-d2-visual-owner.js',
  'js/features/dungeon/beta/v8009-d5-final-detail-seal.js',
):
    if beta.count(required)!=1:
        raise RuntimeError(f'canonical/later include count changed: {required}')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
  'build':'V8.009-DUNGEON-D12-BETA',
  'phase':'Retire first proven-redundant D1 CSS layer',
  'scope':'beta only',
  'stable_unchanged':True,
  'audit':'V8009_DUNGEON_D12_CSS_CASCADE_AUDIT.json',
  'retired_css':href,
  'retired_css_file_kept':True,
  'proof':{
    'declarations':11,
    'proven_redundant_declarations':11,
    'fully_redundant':True
  },
  'other_d1_css_removed':False,
  'beta_before_bytes':before_bytes,
  'beta_after_bytes':len(beta.encode()),
  'beta_before_sha256':before_sha,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D12_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
