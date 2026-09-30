from pathlib import Path
import re, json, hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_sha=hashlib.sha256(beta.encode()).hexdigest()

targets=[
  {
    'id':'v467-d2-direct-style',
    'tag':'style',
    'archive':'css/features/dungeon/legacy/v467-d2-direct-style.retired.css'
  },
  {
    'id':'v467-d2-direct-script',
    'tag':'script',
    'archive':'js/features/dungeon/legacy/v467-d2-direct-script.retired.js'
  }
]

retired=[]
for t in targets:
    pat=re.compile(
      r'<'+t['tag']+r'(?P<attrs>[^>]*\bid=["\']'+re.escape(t['id'])+r'["\'][^>]*)>'
      r'(?P<body>[\s\S]*?)</'+t['tag']+r'\s*>',
      re.I
    )
    matches=list(pat.finditer(beta))
    if len(matches)!=1:
        raise RuntimeError(f"expected one active block {t['id']}, got {len(matches)}")
    m=matches[0]
    body=m.group('body').strip()+'\n'
    out=Path(t['archive'])
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(
      '/* RETIRED FROM ACTIVE BETA IN V8.009-DUNGEON-D5. DO NOT LOAD. */\n'+body,
      encoding='utf-8'
    )
    marker=f'<!-- {t["id"]} retired in V8.009-DUNGEON-D5: canonical D2/v261 owner only -->'
    beta=beta[:m.start()]+marker+beta[m.end():]
    retired.append({
      'id':t['id'],
      'archive':t['archive'],
      'bytes':len(body.encode()),
      'sha256':hashlib.sha256(body.encode()).hexdigest()
    })

for t in targets:
    if re.search(r'<(?:script|style)[^>]*\bid=["\']'+re.escape(t['id'])+r'["\']',beta,re.I):
        raise RuntimeError(f"active v467 block remains: {t['id']}")

for required in (
  'js/features/dungeon/beta/v8009-d2-visual-owner.js',
  'js/features/dungeon/beta/v8009-d2-detail-render-lock.js',
  'js/features/dungeon/beta/v8009-d4-v261-detail.js'
):
    if beta.count(required)!=1:
        raise RuntimeError(f"canonical include count changed: {required}")

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed')

report={
  'build':'V8.009-DUNGEON-D5-RETIRE-V467-D2',
  'reason':'Dungeon 2 video reproduces late swap from canonical v474 assets to v467 legacy v7195 SVG assets',
  'scope':'beta only',
  'stable_unchanged':True,
  'beta_before_sha256':before_sha,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'retired':retired,
  'canonical_d2_contract':{
    'background':'v474_dungeon_assets/d2_bg.jpg',
    'enemy_pattern':'v474_dungeon_assets/d2_1.png ... d2_9.png',
    'boss':'v474_dungeon_assets/d2_boss.png'
  },
  'legacy_d2_active':False,
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D5_RETIRE_V467_D2.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
