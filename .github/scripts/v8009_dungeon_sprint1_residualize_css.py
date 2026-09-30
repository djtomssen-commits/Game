from pathlib import Path
import hashlib,json

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_bytes=len(beta.encode())
before_sha=hashlib.sha256(beta.encode()).hexdigest()

items=[
 {
  'id':'v455-d1-feinschliff-2',
  'old':'css/features/dungeon/beta/v8009-d11-v455-d1-feinschliff-2.css',
  'new':'css/features/dungeon/beta/v8009-sprint1-v455-residual.css',
  'source_declarations':35,'redundant':34,'residual':1,
  'css':'#dungeonMapCard.v426-ref-d1 .v261-title{word-break:normal!important}\n',
 },
 {
  'id':'v456-d1-reference-alignment-final',
  'old':'css/features/dungeon/beta/v8009-d11-v456-d1-reference-alignment-final.css',
  'new':'css/features/dungeon/beta/v8009-sprint1-v456-residual.css',
  'source_declarations':50,'redundant':44,'residual':6,
  'css':'''#dungeonMapCard.v426-ref-d1 .v261-title{
  line-height:1!important;
  white-space:normal!important;
  overflow:visible!important;
}
#dungeonMapCard.v426-ref-d1 .v261-title::after{
  font-weight:1000;
  letter-spacing:0;
  text-shadow:0 2px 0 #43250d,0 0 10px rgba(0,0,0,.42);
}
''',
 },
 {
  'id':'v459-d1-right-side-thumb-final',
  'old':'css/features/dungeon/beta/v8009-d11-v459-d1-right-side-thumb-final.css',
  'new':'css/features/dungeon/beta/v8009-sprint1-v459-residual.css',
  'source_declarations':24,'redundant':22,'residual':2,
  'css':'''#dungeonMapCard.v426-ref-d1 .v261-thumb{
  background:linear-gradient(180deg,#111711,#050805)!important;
  border-color:#4d6b43!important;
}
''',
 },
]

manifest=[]
last=-1
for item in items:
    old=item['old']; new=item['new']
    if beta.count(old)!=1:
        raise RuntimeError(f'expected one active source link {old}, got {beta.count(old)}')
    pos=beta.index(old)
    if pos<=last:
        raise RuntimeError('source order unexpected')
    last=pos
    out=Path(new);out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(item['css'],encoding='utf-8')
    beta=beta.replace(old,new,1)
    manifest.append({
      'id':item['id'],'old':old,'new':new,
      'source_declarations':item['source_declarations'],
      'proven_redundant_removed':item['redundant'],
      'residual_declarations':item['residual'],
      'residual_bytes':len(item['css'].encode()),
      'residual_sha256':hashlib.sha256(item['css'].encode()).hexdigest()
    })

# v461 must remain retired from D12.
if 'css/features/dungeon/beta/v8009-d11-v461-d1-node9-collision-fix.css' in beta:
    raise RuntimeError('D12 retired v461 CSS became active again')

# Ensure critical later layers and owners remain.
for ref in (
 'css/features/dungeon/beta/v8009-d11-v463-d1-screenshot-polish.css',
 'css/features/dungeon/beta/v8009-d11-v464-d1-boss-micro-position.css',
 'js/features/dungeon/beta/v8009-d8-detail-decorator.js',
 'js/features/dungeon/beta/v8009-d2-visual-owner.js',
 'js/features/dungeon/beta/v8009-d5-final-detail-seal.js',
):
    if beta.count(ref)!=1:
        raise RuntimeError(f'critical include count changed: {ref}')

# Relative order of the three replacement positions remains the same.
positions=[beta.index(x['new']) for x in manifest]
if positions!=sorted(positions):
    raise RuntimeError('residual CSS order changed')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
 'build':'V8.009-DUNGEON-SPRINT-1-BETA',
 'phase':'Batch residualization of proven-overridden D1 CSS layers',
 'scope':'beta only',
 'stable_unchanged':True,
 'audit_source':'V8009_DUNGEON_D12_CSS_CASCADE_AUDIT.json',
 'items':manifest,
 'total_source_declarations':sum(x['source_declarations'] for x in items),
 'total_proven_redundant_removed':sum(x['redundant'] for x in items),
 'total_residual_declarations':sum(x['residual'] for x in items),
 'source_order_preserved':True,
 'original_files_retained':True,
 'beta_before_bytes':before_bytes,
 'beta_after_bytes':len(beta.encode()),
 'beta_before_sha256':before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
 'gameplay_changed':False,
 'combat_math_changed':False,
 'rewards_changed':False,
 'server_authority_changed':False
}
Path('V8009_DUNGEON_SPRINT1_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
