from pathlib import Path
import re,json,hashlib

beta_path=Path('beta.html')
beta=beta_path.read_text(encoding='utf-8')
outdir=Path('js/features/quest/beta')
outdir.mkdir(parents=True,exist_ok=True)

ids=[
 'v7045-atomic-quest-receipt-client',
 'v7110-quest-authority-sync',
 'gl-quest-ready-push-v1',
 'v4127-quest-skip-stable',
 'v443-quest-dampf-live-fix',
 'v4222-separate-elite-quest-script',
 'v231-notify-inventory-quest-script',
 'v392-single-active-quest-script',
 'v4178-quest-live-hard-fix',
 'v386-quest-redesign-script',
 'v229-live-ui-sync',
 'v6344-quest-variety-js',
 'v4121-quest-reward-current-item',
 'v637-quest-exact-dungeon-core',
 'v636-quest-dungeon-authority-core',
 'v235-quest-reward-stability',
 'v321-elite-hard-guarantee-dampf-scale',
 'v240-rarity-quest-loot-core',
 'v310-elite-quests',
 'v233-quest-reward-final-click',
 'v309-distinct-quest-offers',
 'v496-quest-claim-single-payout',
 'v316-quest-balance-skip',
 'v099-real-quest-xp-fix',
 'v4172-quest-rpg-script',
 'v626-quest-enemy-art-fix-core',
 'v627-quest-crisp-art-core',
 'v7046-quest-event-duplicate-reward-guard',
]

records=[]
for sid in ids:
    pat=re.compile(r'<script(?P<attrs>[^>]*\bid=["\']'+re.escape(sid)+r'["\'][^>]*)>(?P<body>[\s\S]*?)</script\s*>',re.I)
    m=pat.search(beta)
    if not m:
        raise SystemExit(f'missing inline script: {sid}')
    attrs=m.group('attrs')
    if re.search(r'\bsrc\s*=',attrs,re.I):
        raise SystemExit(f'already external: {sid}')
    body=m.group('body')
    safe=re.sub(r'[^a-zA-Z0-9._-]+','-',sid).strip('-')
    path=outdir/f'{safe}.js'
    if path.exists():
        raise SystemExit(f'target exists: {path}')
    path.write_text(body,encoding='utf-8')
    rel=path.as_posix()
    replacement=f'<script src="{rel}"></script>'
    beta=beta[:m.start()]+replacement+beta[m.end():]
    records.append({
      'id':sid,
      'path':rel,
      'bytes':len(body.encode()),
      'sha256':hashlib.sha256(body.encode()).hexdigest(),
      'position':m.start(),
    })

beta_path.write_text(beta,encoding='utf-8')

# QA: every selected id is gone as an inline id and each src is loaded exactly once.
for r in records:
    if re.search(r'<script[^>]*\bid=["\']'+re.escape(r['id'])+r'["\']',beta,re.I):
        raise SystemExit(f'inline id remains: {r["id"]}')
    if beta.count(f'src="{r["path"]}"') != 1:
        raise SystemExit(f'bad include count: {r["path"]}')

report={
 'build':'V8.009-QUEST-SPRINT-1-EXTRACT',
 'scope':'beta only',
 'count':len(records),
 'total_bytes':sum(r['bytes'] for r in records),
 'files':records,
 'stable_untouched':True,
 'behavior_change':False,
 'notes':'Quest-owned inline JS extracted 1:1 at the original source positions; no owner retirement or logic consolidation in this step.'
}
Path('V8009_QUEST_SPRINT1_EXTRACT.json').write_text(
 json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'count':report['count'],'total_bytes':report['total_bytes']},indent=2))
