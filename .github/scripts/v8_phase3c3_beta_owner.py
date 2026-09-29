from pathlib import Path
import hashlib,re,json

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()

retire=[
 ('v552-guild-grow-legends-js','js/features/guild/legacy/26-v552-guild-grow-legends-js.js'),
 ('v553-guild-strong-layout-js','js/features/guild/legacy/27-v553-guild-strong-layout-js.js'),
]
owner=('v554-guild-reference-owner-js','js/features/guild/legacy/28-v554-guild-reference-owner-js.js')

# Safety proof from source comments: both predecessors explicitly declare
# V5.54 as the final visual owner / themselves as compatibility-only.
proof={}
for sid,src in retire:
    s=Path(src).read_text(encoding='utf-8')
    proof[sid]={
      'mentions_final_owner_v554': bool(re.search(r'V5\.54.*final visual owner|final visual owner.*V5\.54',s,re.I)),
      'mentions_compatibility_only': bool(re.search(r'compatibility only|compatibility pass',s,re.I)),
    }
    if not any(proof[sid].values()):
        raise RuntimeError(f'{sid}: source does not identify itself as compatibility-only/final-owner predecessor')

owner_src=Path(owner[1]).read_text(encoding='utf-8')
required_owner_capabilities=[
 'installMemberRenderer','renderTop','pairAdmin','installManagementPicker','cleanLegacy'
]
missing=[x for x in required_owner_capabilities if x not in owner_src]
if missing:
    raise RuntimeError(f'v554 owner missing expected capabilities: {missing}')

removed=[]
for sid,src in retire:
    pat=re.compile(rf'<script(?P<attrs>[^>]*)\bid=["\']{re.escape(sid)}["\'](?P<rest>[^>]*)></script\s*>',re.I)
    ms=list(pat.finditer(beta))
    if len(ms)!=1:
        raise RuntimeError(f'{sid}: expected one beta tag, got {len(ms)}')
    tag=ms[0].group(0)
    if src not in tag:
        # idempotence: already retired is acceptable
        if not re.search(r'\bsrc=',tag,re.I):
            continue
        raise RuntimeError(f'{sid}: unexpected source tag: {tag[:250]}')
    newtag=re.sub(r'\s+src=["\']'+re.escape(src)+r'["\']','',tag,count=1,flags=re.I)
    beta=beta[:ms[0].start()]+newtag+beta[ms[0].end():]
    removed.append({'id':sid,'retired_src':src})

# Verify owner remains loaded.
opat=re.compile(rf'<script[^>]*\bid=["\']{re.escape(owner[0])}["\'][^>]*>',re.I)
om=opat.search(beta)
if not om or owner[1] not in om.group(0):
    raise RuntimeError('v554 final owner is not loaded')

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C2'","window.GROW_BETA_TECH_BUILD='V8.008-C3'",1)
if "V8.008-C3" not in beta:
    raise RuntimeError('beta C3 marker not installed')

beta_path.write_text(beta,encoding='utf-8')

stable_after=stable_path.read_text(encoding='utf-8')
stable_after_sha=hashlib.sha256(stable_after.encode('utf-8')).hexdigest()
if stable_after_sha!=stable_sha:
    raise RuntimeError('index.html changed during beta-only owner consolidation')

report={
 'build':'V8.008-C3-BETA',
 'phase':'3C3',
 'scope':'beta.html only',
 'owner':'v554-guild-reference-owner-js',
 'retired_predecessors':removed,
 'source_proof':proof,
 'owner_capabilities_verified':required_owner_capabilities,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False,
}
Path('V8_PHASE3C3_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
