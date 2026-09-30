from pathlib import Path
import re,json,hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8',errors='ignore')
stable=stable_path.read_text(encoding='utf-8',errors='ignore')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before=len(beta.encode())

targets=[
 ('v611','js/features/pvp/beta/v8009-s1-v611-pvp-stage-fix-core.js',['__V611_PVP_STAGE_FIX__','v611PvpVisualPreview']),
 ('v619','js/features/pvp/beta/v8009-s1-v619-pvp-dungeon-motion-core.js',['__V619_PVP_DUNGEON_MOTION__']),
 ('v620','js/features/pvp/beta/v8009-s1-v620-pvp-dungeon-parity-core.js',['__V620_PVP_DUNGEON_PARITY__','v620PvpVisualPreview']),
 ('v672','js/features/pvp/beta/v8009-s1-v672-pvp-effect-parity-core.js',['__V672_PVP_EFFECT_PARITY__']),
 ('v7155','js/features/pvp/beta/v8009-s1-v7155-pvp-hall-cleanup-marker.js',['__V7155_PVP_HALL_CLEANUP__']),
]

retired=[]
for key,path,symbols in targets:
    if not Path(path).exists(): raise RuntimeError(f'marker file missing: {path}')
    pat=re.compile(r'<script(?P<attrs>[^>]*)\bsrc=["\']'+re.escape(path)+r'["\'](?P<attrs2>[^>]*)>\s*</script\s*>',re.I)
    ms=list(pat.finditer(beta))
    if len(ms)!=1: raise RuntimeError(f'expected one active marker include {path}, got {len(ms)}')
    m=ms[0]
    beta=beta[:m.start()]+f'<!-- {key} marker core retired from active Beta in V8.009-PVP-SPRINT-1 -->'+beta[m.end():]
    retired.append({'key':key,'file':path,'symbols':symbols,'bytes':Path(path).stat().st_size})

# Ensure no active Beta external JS references the marker symbols after removal.
srcs=[x.split('?')[0] for x in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',beta,re.I)]
external_refs=[]
for src in srcs:
    p=Path(src)
    if not p.exists() or p.suffix.lower()!='.js': continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    for item in retired:
        for sym in item['symbols']:
            if sym in txt:
                external_refs.append({'symbol':sym,'path':src,'count':txt.count(sym)})
if external_refs:
    raise RuntimeError('marker symbols still referenced by active Beta JS: '+json.dumps(external_refs,ensure_ascii=False))

for item in retired:
    if item['file'] in beta: raise RuntimeError(f'marker include still active: {item["file"]}')

# Related CSS remains active; only inert marker JS is retired.
for css in (
 'css/features/pvp/beta/v8009-s1-v611-pvp-stage-fix-css.css',
 'css/features/pvp/beta/v8009-s1-v619-pvp-dungeon-motion-css.css',
 'css/features/pvp/beta/v8009-s1-v620-pvp-dungeon-parity-css.css',
 'css/features/pvp/beta/v8009-s1-v672-pvp-effect-parity-css.css',
):
    if beta.count(css)!=1: raise RuntimeError(f'related PvP CSS include changed: {css}')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8',errors='ignore').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
 'build':'V8.009-PVP-SPRINT-1-MARKER-RETIREMENT',
 'scope':'beta only',
 'stable_unchanged':True,
 'retired':retired,
 'files_retained':True,
 'active_beta_external_symbol_refs':external_refs,
 'beta_before_bytes':before,
 'beta_after_bytes':len(beta.encode()),
 'gameplay_changed':False,
 'matchmaking_changed':False,
 'combat_changed':False,
 'cooldown_changed':False,
 'rewards_changed':False,
 'server_authority_changed':False
}
Path('V8009_PVP_SPRINT1_MARKER_RETIREMENT.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
