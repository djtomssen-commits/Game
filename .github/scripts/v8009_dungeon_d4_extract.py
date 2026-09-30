from pathlib import Path
import re, hashlib, json

BUILD = 'V8.009-DUNGEON-D4-BETA'
BETA = Path('beta.html')
STABLE = Path('index.html')

TARGETS = [
    {
        'id': 'v251-modern-dungeon-maps-style',
        'tag': 'style',
        'file': 'css/features/dungeon/beta/v8009-d4-v251-modern-maps.css',
    },
    {
        'id': 'v251-modern-dungeon-maps-core',
        'tag': 'script',
        'file': 'js/features/dungeon/beta/v8009-d4-v251-modern-maps.js',
    },
    {
        'id': 'v260-dungeon-detail-style',
        'tag': 'style',
        'file': 'css/features/dungeon/beta/v8009-d4-v260-detail.css',
    },
    {
        'id': 'v260-dungeon-detail-script',
        'tag': 'script',
        'file': 'js/features/dungeon/beta/v8009-d4-v260-detail.js',
    },
    {
        'id': 'v261-dungeon-detail-style',
        'tag': 'style',
        'file': 'css/features/dungeon/beta/v8009-d4-v261-detail.css',
    },
    {
        'id': 'v261-dungeon-detail-script',
        'tag': 'script',
        'file': 'js/features/dungeon/beta/v8009-d4-v261-detail.js',
    },
]

beta = BETA.read_text(encoding='utf-8')
stable = STABLE.read_text(encoding='utf-8')
stable_sha = hashlib.sha256(stable.encode()).hexdigest()
beta_before_sha = hashlib.sha256(beta.encode()).hexdigest()
beta_before_bytes = len(beta.encode())

def find_tag(text, target):
    tag = target['tag']
    pat = re.compile(
        r'<' + tag + r'(?P<attrs>[^>]*\bid=["\']' + re.escape(target['id']) + r'["\'][^>]*)>'
        r'(?P<body>[\s\S]*?)</' + tag + r'\s*>',
        re.I,
    )
    matches = list(pat.finditer(text))
    if len(matches) != 1:
        raise RuntimeError(f"expected exactly one inline {target['id']}, got {len(matches)}")
    return matches[0]

original_positions = []
relationship_audit = []
for target in TARGETS:
    m = find_tag(beta, target)
    body = m.group('body')
    if 'src=' in m.group('attrs').lower():
        raise RuntimeError(f"{target['id']} already external")
    original_positions.append((target['id'], m.start()))
    relationship_audit.append({
        'id': target['id'],
        'tag': target['tag'],
        'bytes': len(body.encode()),
        'renderDungeon_refs': body.count('renderDungeon'),
        'glDungeonVisualRefresh_refs': body.count('glDungeonVisualRefresh'),
        'v7166_refs': body.count('v7166'),
        'MutationObserver_refs': body.count('MutationObserver'),
        'setInterval_refs': body.count('setInterval'),
        'setTimeout_refs': body.count('setTimeout'),
        'addEventListener_refs': body.count('addEventListener'),
        'innerHTML_refs': body.count('innerHTML'),
        'querySelector_refs': body.count('querySelector'),
    })

if [x[0] for x in sorted(original_positions, key=lambda x: x[1])] != [t['id'] for t in TARGETS]:
    raise RuntimeError('unexpected relative source order for v251/v260/v261 core layers')

extracted = []
for target in TARGETS:
    m = find_tag(beta, target)
    body = m.group('body').strip() + '\n'
    if len(body.encode()) < 100:
        raise RuntimeError(f"unexpectedly small block {target['id']}")
    out = Path(target['file'])
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(body, encoding='utf-8')

    if target['tag'] == 'style':
        replacement = f'<link id="{target["id"]}" rel="stylesheet" href="{target["file"]}">'
    else:
        replacement = f'<script id="{target["id"]}" src="{target["file"]}"></script>'

    beta = beta[:m.start()] + replacement + beta[m.end():]
    extracted.append({
        'legacy_id': target['id'],
        'tag': target['tag'],
        'file': target['file'],
        'bytes': len(body.encode()),
        'sha256': hashlib.sha256(body.encode()).hexdigest(),
    })

for target in TARGETS:
    if beta.count(target['file']) != 1:
        raise RuntimeError(f"external include count != 1: {target['file']}")
    if re.search(
        r'<(?:script|style)[^>]*\bid=["\']' + re.escape(target['id']) + r'["\'][^>]*>[\s\S]*?</(?:script|style)>',
        beta,
        re.I,
    ):
        raise RuntimeError(f"inline body remains: {target['id']}")

for required in (
    'js/features/dungeon/beta/v8009-d2-visual-owner.js',
    'js/features/dungeon/beta/v8009-d2-map-finalizer.js',
    'js/features/dungeon/beta/v8009-d2-detail-render-lock.js',
    'css/features/dungeon/beta/v8009-d3-detail-render-lock.css',
):
    if beta.count(required) != 1:
        raise RuntimeError(f"owner include count changed: {required}")

BETA.write_text(beta, encoding='utf-8')
if hashlib.sha256(STABLE.read_text(encoding='utf-8').encode()).hexdigest() != stable_sha:
    raise RuntimeError('index.html changed')

report = {
    'build': BUILD,
    'phase': 'Externalize dedicated v251/v260/v261 Dungeon map/detail core layers without behavior changes',
    'scope': 'beta only',
    'stable_unchanged': True,
    'stable_sha256': stable_sha,
    'beta_before_sha256': beta_before_sha,
    'beta_after_sha256': hashlib.sha256(beta.encode()).hexdigest(),
    'beta_before_bytes': beta_before_bytes,
    'beta_after_bytes': len(beta.encode()),
    'source_order_preserved': True,
    'relationship_audit': relationship_audit,
    'extracted': extracted,
    'd2_d3_owner_chain_preserved': True,
    'legacy_logic_removed': False,
    'legacy_logic_consolidated': False,
    'gameplay_changed': False,
    'combat_math_changed': False,
    'rewards_changed': False,
    'server_authority_changed': False,
}
Path('V8009_DUNGEON_D4_BETA.json').write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + '\n',
    encoding='utf-8',
)
print(json.dumps(report, ensure_ascii=False, indent=2))
