from pathlib import Path
import re,json,hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_bytes=len(beta.encode())
before_sha=hashlib.sha256(beta.encode()).hexdigest()

sid='v426-pos-fix'
pat=re.compile(
 r'<script(?P<attrs>[^>]*)\bid=["\']'+re.escape(sid)+r'["\'](?P<attrs2>[^>]*)>'
 r'(?P<body>[\s\S]*?)</script\s*>',re.I
)
ms=list(pat.finditer(beta))
if len(ms)!=1:
    raise RuntimeError(f'expected one active {sid}, got {len(ms)}')
m=ms[0]
old_body=m.group('body').strip()+'\n'
archive=Path('js/features/dungeon/legacy/v8009-sprint2-retired-v426-pos-fix.js')
archive.parent.mkdir(parents=True,exist_ok=True)
archive.write_text('/* RETIRED FROM ACTIVE BETA IN V8.009-DUNGEON-SPRINT-2. DO NOT LOAD. */\n'+old_body,encoding='utf-8')
beta=beta[:m.start()]+'<!-- v426-pos-fix retired in V8.009-DUNGEON-SPRINT-2: geometry migrated to D8 decorator -->'+beta[m.end():]

if re.search(r'<script[^>]*\bid=["\']v426-pos-fix["\']',beta,re.I):
    raise RuntimeError('v426-pos-fix still active')

# D8 must contain the exact former v426 geometry.
deco=Path('js/features/dungeon/beta/v8009-d8-detail-decorator.js').read_text(encoding='utf-8')
expected="const DEFAULT_POS=[[11,18],[35,20],[60,25],[84,31],[11,46],[31,58],[51,68],[70,59],[86,47],[82,78]];"
if expected not in deco or 'applyPositions(card,DEFAULT_POS);' not in deco:
    raise RuntimeError('v426 geometry not migrated exactly to D8 decorator')

# Ordered ownership audit. Only actual single '=' assignments count; comparisons do not.
assign_render=re.compile(r'(?<![\w$])(?:window\.)?renderDungeon\s*=(?!=)')
assign_v261=re.compile(r'(?<![\w$])(?:window\.)?v261RenderDetail\s*=(?!=)')
src_re=re.compile(r'\bsrc=["\']([^"\']+)["\']',re.I)
id_re=re.compile(r'\bid=["\']([^"\']+)["\']',re.I)

tags=[]
for tm in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script\s*>',beta,re.I):
    attrs=tm.group('attrs')
    sm=src_re.search(attrs)
    im=id_re.search(attrs)
    id_=im.group(1) if im else f'inline@{tm.start()}'
    src=sm.group(1).split('?')[0] if sm else ''
    if src:
        p=Path(src)
        body=p.read_text(encoding='utf-8',errors='ignore') if p.exists() else ''
    else:
        body=tm.group('body')
    tags.append({
      'order':len(tags),'id':id_,'src':src,
      'render_assignments':len(assign_render.findall(body)),
      'v261_assignments':len(assign_v261.findall(body)),
    })

canonical_src='js/features/dungeon/beta/v8009-d2-visual-owner.js'
canonical=[x for x in tags if x['src']==canonical_src]
if len(canonical)!=1:
    raise RuntimeError(f'canonical owner include count != 1: {len(canonical)}')
canonical_order=canonical[0]['order']

late_render=[x for x in tags if x['order']>canonical_order and x['render_assignments']]
late_v261=[x for x in tags if x['order']>canonical_order and x['v261_assignments']]
if late_render:
    raise RuntimeError('late renderDungeon owners remain: '+json.dumps(late_render,ensure_ascii=False))
if late_v261:
    raise RuntimeError('late v261 owners remain: '+json.dumps(late_v261,ensure_ascii=False))

# Direct-hook contract after wrapper retirement.
owner=Path(canonical_src).read_text(encoding='utf-8')
lock=Path('js/features/dungeon/beta/v8009-d2-detail-render-lock.js').read_text(encoding='utf-8')
for needle in (
  "window.v7166DungeonDetailRepair?.('canonical-map')",
  'window.v4165StampDetail?.()',
  "window.v4165SyncBattleGate?.('canonical-render')",
  'window.v494DungeonProductionSync?.()',
  'window.v585SyncDungeonBattle?.()',
  'window.v7051ClaimButtonSync?.()',
):
    if needle not in owner:
        raise RuntimeError(f'canonical direct hook missing: {needle}')

for forbidden in (
  'names.forEach(name=>',
  'window.renderDungeon=wrapped',
  '__v7166Base',
):
    if forbidden in lock:
        raise RuntimeError(f'v7166 wrapper residue remains: {forbidden}')
if 'wrapperMode:false' not in lock:
    raise RuntimeError('v7166 QA not in direct-hook mode')

# Critical active systems must remain in Beta.
for critical in (
  'v246-dungeon-final-fight-reward-fix',
  'v4165-dungeon-key-live-battle-index-fix',
  'v446-dungeon-runtime-root-fix',
  'v458-key-live-unlock',
  'v467-hard-live-dungeon-key-authority',
  'v482-dungeon-paid-timer-owner',
  'v494-production-dungeon-fix-script',
  'v585-dungeon-safe-owner-core',
  'v7051-atomic-dungeon-receipt-client',
):
    if not re.search(r'<script[^>]*\bid=["\']'+re.escape(critical)+r'["\']',beta,re.I):
        raise RuntimeError(f'critical Dungeon system missing: {critical}')

# All known obsolete owner IDs must be inactive.
for retired in (
  'v4225-final-10er-owner',
  'v447-d9-preview-button-restore',
  'v426-pos-fix',
):
    if re.search(r'<script[^>]*\bid=["\']'+re.escape(retired)+r'["\']',beta,re.I):
        raise RuntimeError(f'retired owner active: {retired}')

# D5 seal stays last script.
body_end=beta.lower().rfind('</body>')
if beta.rfind('<script',0,body_end)!=beta.rfind('<script id="v8009-dungeon-d5-final-detail-seal"',0,body_end):
    raise RuntimeError('D5 final seal no longer last script')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
 'build':'V8.009-DUNGEON-SPRINT-2-FINAL',
 'scope':'beta only',
 'stable_unchanged':True,
 'retired_final_wrapper':'v426-pos-fix',
 'geometry_migrated_to':'js/features/dungeon/beta/v8009-d8-detail-decorator.js',
 'canonical_render_owner':canonical_src,
 'canonical_owner_order':canonical_order,
 'late_renderDungeon_assigners':late_render,
 'late_v261_assigners':late_v261,
 'v7166_wrapper_mode':False,
 'direct_hooks':[
   'v7166DungeonDetailRepair','v4165StampDetail','v4165SyncBattleGate',
   'v494DungeonProductionSync','v585SyncDungeonBattle','v7051ClaimButtonSync'
 ],
 'critical_systems_preserved':True,
 'beta_before_bytes':before_bytes,
 'beta_after_bytes':len(beta.encode()),
 'beta_before_sha256':before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
 'gameplay_changed':False,
 'combat_math_changed':False,
 'rewards_changed':False,
 'server_authority_changed':False
}
Path('V8009_DUNGEON_SPRINT2_FINAL.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
