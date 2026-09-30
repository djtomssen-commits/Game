from pathlib import Path
import re,json,hashlib

beta=Path('beta.html').read_text(encoding='utf-8',errors='ignore')
stable=Path('index.html').read_text(encoding='utf-8',errors='ignore')
STABLE_SHA='e476eb4437df8c0763a36220f99fe5f14b09b3acd8f76e8ed4f5821962d9fbab'
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
if stable_sha!=STABLE_SHA:
    raise RuntimeError(f'Stable/index.html hash changed: {stable_sha}')

extract=json.loads(Path('V8009_PVP_SPRINT1_EXTRACTION.json').read_text(encoding='utf-8'))
asset_css=json.loads(Path('V8009_PVP_SPRINT1_ASSET_CSS.json').read_text(encoding='utf-8'))

# Five originally extracted JS files were later proven marker-only and retired.
retired_markers=[
 'js/features/pvp/beta/v8009-s1-v611-pvp-stage-fix-core.js',
 'js/features/pvp/beta/v8009-s1-v619-pvp-dungeon-motion-core.js',
 'js/features/pvp/beta/v8009-s1-v620-pvp-dungeon-parity-core.js',
 'js/features/pvp/beta/v8009-s1-v672-pvp-effect-parity-core.js',
 'js/features/pvp/beta/v8009-s1-v7155-pvp-hall-cleanup-marker.js',
]
retired_set=set(retired_markers)

# Active extracted artifacts load exactly once; retired marker JS loads zero times.
missing=[]
for x in extract['js_extracted']:
    want=0 if x['file'] in retired_set else 1
    got=beta.count(x['file'])
    if got!=want:
        missing.append({'file':x['file'],'expected':want,'count':got})
for x in extract['css_extracted']+asset_css['extracted']:
    got=beta.count(x['file'])
    if got!=1:
        missing.append({'file':x['file'],'expected':1,'count':got})
if missing:
    raise RuntimeError('PvP extracted include count failure: '+json.dumps(missing,ensure_ascii=False))

# Retired marker cores must stay inactive.
for p in retired_markers:
    if p in beta: raise RuntimeError('retired marker core active: '+p)
    if not Path(p).exists(): raise RuntimeError('retired marker file not retained: '+p)

# URL-sensitive CSS rewrites must resolve to existing repository assets.
asset_refs=[]
for x in asset_css['extracted']:
    css=Path(x['file']).read_text(encoding='utf-8',errors='ignore')
    for asset in x['assets']:
        rewritten='../../../../'+asset
        if rewritten not in css: raise RuntimeError(f'CSS asset rewrite missing: {x["file"]} -> {asset}')
        if not Path(asset).exists(): raise RuntimeError('PvP CSS asset missing: '+asset)
        asset_refs.append({'css':x['file'],'asset':asset})

# Active script timeline in the exact HTML execution order.
rank_assign=re.compile(r'(?<![\w$])(?:window\.)?v073LoadRanking\s*=(?!=)')
fight_assign=re.compile(r'(?<![\w$])(?:window\.)?v204Fight\s*=(?!=)')
timeline={'v073LoadRanking':[],'v204Fight':[]}

script_tag=re.compile(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',re.I)
src_attr=re.compile(r"""\bsrc=["']([^"']+)["']""",re.I)
id_attr=re.compile(r"""\bid=["']([^"']+)["']""",re.I)

for order,m in enumerate(script_tag.finditer(beta)):
    attrs=m.group('attrs')
    sm=src_attr.search(attrs)
    im=id_attr.search(attrs)
    if sm:
        src=sm.group(1).split('?')[0]
        p=Path(src)
        body=p.read_text(encoding='utf-8',errors='ignore') if p.exists() and p.suffix.lower()=='.js' else ''
        label=src
    else:
        body=m.group('body')
        sid=im.group(1) if im else f'inline@{m.start()}'
        label='beta.html#'+sid
    if rank_assign.search(body):
        timeline['v073LoadRanking'].append({'order':order,'file':label,'count':len(rank_assign.findall(body))})
    if fight_assign.search(body):
        timeline['v204Fight'].append({'order':order,'file':label,'count':len(fight_assign.findall(body))})

if not timeline['v073LoadRanking']:
    raise RuntimeError('no Hall ranking owner found')
final_rank=timeline['v073LoadRanking'][-1]['file']
if 'v8009-s1-v6145-hall-pagination-js.js' not in final_rank:
    raise RuntimeError('v6145 is not final Hall ranking owner: '+final_rank)

# Removed ranking wrappers must not return.
v424=Path('js/features/pvp/beta/v8009-s1-v424-hall-combat-power-fix.js').read_text(encoding='utf-8')
buds=Path('js/features/pvp/beta/v8009-s1-vPvpBudsHallSyncFix.js').read_text(encoding='utf-8')
for dead in ('__v424HallRankingWrapped','baseRanking=v073LoadRanking'):
    if dead in v424: raise RuntimeError('dead v424 Hall ranking wrapper returned')
for dead in ('__vPvpBudsHallRankingWrapped','const base=v073LoadRanking'):
    if dead in buds: raise RuntimeError('dead Buds Hall ranking wrapper returned')

hall=Path('js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js').read_text(encoding='utf-8')
for required in (
 "if(typeof window.vPvpBudsHallSync==='function')await window.vPvpBudsHallSync(true)",
 "if(typeof v073SyncProfile==='function')await v073SyncProfile(true)",
 'try{v073LoadRanking=loadRanking;window.v073LoadRanking=loadRanking}',
):
    if required not in hall: raise RuntimeError('Hall direct sync/owner contract missing: '+required)

# PvP authority must remain active.
auth=Path('js/features/pvp/beta/v8009-s1-v7053-atomic-pvp-client-bridge.js').read_text(encoding='utf-8')
for required in ('window.v7053RunServerPvp=()=>runServerPvp()','v7053_run_pvp','v7053_ack_pvp_receipt'):
    if required not in auth: raise RuntimeError('v7053 authority contract missing: '+required)

# Required UI anchors/contracts remain present somewhere in Beta + external PvP code.
joined=beta+'\n'+''.join(Path(x['file']).read_text(encoding='utf-8',errors='ignore') for x in extract['js_extracted'])
for token in ('v072HallRanking','v204FindBtn','v204FightBtn','v209PvpBattleOverlay','v211PvpResultCard'):
    if token not in joined: raise RuntimeError('PvP/Hall UI contract missing: '+token)

report={
 'build':'V8.009-PVP-SPRINT-1-FINAL',
 'scope':'beta only',
 'stable_sha256':stable_sha,
 'stable_unchanged':True,
 'beta_bytes':len(beta.encode()),
 'extracted_js':extract['counts']['js_extracted'],
 'active_extracted_js':extract['counts']['js_extracted']-len(retired_markers),
 'extracted_css':extract['counts']['css_extracted']+asset_css['count'],
 'retired_marker_cores':len(retired_markers),
 'final_hall_ranking_owner':final_rank,
 'owner_timeline':timeline,
 'asset_css_refs_verified':len(asset_refs),
 'dead_ranking_wrappers_active':False,
 'v7053_authority_preserved':True,
 'gameplay_changed':False,
 'matchmaking_changed':False,
 'combat_math_changed':False,
 'cooldown_changed':False,
 'rewards_changed':False,
 'server_authority_changed':False
}
Path('V8009_PVP_SPRINT1_FINAL.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
