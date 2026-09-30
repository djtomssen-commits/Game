from pathlib import Path
import re, hashlib, json

BUILD = 'V8.009-DUNGEON-D3-BETA'\n# Workflow trigger after workflow installation.
BETA = Path('beta.html')
STABLE = Path('index.html')
CSS_ID = 'v7166-dungeon-detail-render-lock-css'
CSS_OUT = Path('css/features/dungeon/beta/v8009-d3-detail-render-lock.css')
TARGET_TOKENS = ('v251', 'v260', 'v261', 'v7166-dungeon-detail-render-lock-css')

beta = BETA.read_text(encoding='utf-8')
stable = STABLE.read_text(encoding='utf-8')
stable_sha = hashlib.sha256(stable.encode()).hexdigest()
beta_before_sha = hashlib.sha256(beta.encode()).hexdigest()
beta_before_bytes = len(beta.encode())

tag_re = re.compile(
    r'<(?P<tag>script|style)\b(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</(?P=tag)\s*>',
    re.I,
)
id_re = re.compile(r'\bid=["\']([^"\']+)["\']', re.I)

inventory = []
for m in tag_re.finditer(beta):
    attrs = m.group('attrs')
    body = m.group('body')
    im = id_re.search(attrs)
    tag_id = im.group(1) if im else ''
    hay = (tag_id + '\n' + attrs + '\n' + body[:4000]).lower()
    matched = [t for t in TARGET_TOKENS if t in hay]
    if not matched:
        continue
    signals = {
        'renderDungeon': body.count('renderDungeon'),
        'renderDungeonMap': body.count('renderDungeonMap'),
        'glDungeonVisualRefresh': body.count('glDungeonVisualRefresh'),
        'MutationObserver': body.count('MutationObserver'),
        'setInterval': body.count('setInterval'),
        'setTimeout': body.count('setTimeout'),
        'addEventListener': body.count('addEventListener'),
        'innerHTML': body.count('innerHTML'),
        'querySelector': body.count('querySelector'),
    }
    inventory.append({
        'tag': m.group('tag').lower(),
        'id': tag_id,
        'matched_tokens': matched,
        'bytes': len(body.encode()),
        'has_src': 'src=' in attrs.lower(),
        'signals': signals,
        'classification': (
            'style_only' if m.group('tag').lower() == 'style'
            else 'runtime_js_candidate' if any(signals.values())
            else 'js_guard_or_patch_candidate'
        ),
    })

occurrences = {t: beta.lower().count(t) for t in TARGET_TOKENS}
if not occurrences['v251'] or not occurrences['v260'] or not occurrences['v261']:
    raise RuntimeError(f'historical Dungeon tokens missing: {occurrences}')

style_pat = re.compile(
    r'<style(?P<attrs>[^>]*\bid=["\']' + re.escape(CSS_ID) + r'["\'][^>]*)>'
    r'(?P<body>[\s\S]*?)</style\s*>',
    re.I,
)
matches = list(style_pat.finditer(beta))
if len(matches) != 1:
    raise RuntimeError(f'expected exactly one inline {CSS_ID}, got {len(matches)}')

sm = matches[0]
css_body = sm.group('body').strip() + '\n'
if len(css_body.encode()) < 100:
    raise RuntimeError(f'{CSS_ID} unexpectedly small')

CSS_OUT.parent.mkdir(parents=True, exist_ok=True)
CSS_OUT.write_text(css_body, encoding='utf-8')
replacement = f'<link id="{CSS_ID}" rel="stylesheet" href="{CSS_OUT.as_posix()}">'
beta = beta[:sm.start()] + replacement + beta[sm.end():]

if beta.count(CSS_OUT.as_posix()) != 1:
    raise RuntimeError('D3 CSS include count != 1')
if re.search(r'<style[^>]*\bid=["\']' + re.escape(CSS_ID) + r'["\']', beta, re.I):
    raise RuntimeError('old inline D3 CSS owner remains')
if CSS_OUT.as_posix() in stable:
    raise RuntimeError('stable unexpectedly references D3 CSS')

for required in (
    'js/features/dungeon/beta/v8009-d2-visual-owner.js',
    'js/features/dungeon/beta/v8009-d2-map-finalizer.js',
    'js/features/dungeon/beta/v8009-d2-detail-render-lock.js',
):
    if beta.count(required) != 1:
        raise RuntimeError(f'D2 owner include count changed: {required}')

BETA.write_text(beta, encoding='utf-8')
if hashlib.sha256(STABLE.read_text(encoding='utf-8').encode()).hexdigest() != stable_sha:
    raise RuntimeError('index.html changed')

report = {
    'build': BUILD,
    'phase': 'Dungeon historical map/detail audit + isolated detail-lock CSS extraction',
    'scope': 'beta only',
    'stable_unchanged': True,
    'stable_sha256': stable_sha,
    'beta_before_sha256': beta_before_sha,
    'beta_after_sha256': hashlib.sha256(beta.encode()).hexdigest(),
    'beta_before_bytes': beta_before_bytes,
    'beta_after_bytes': len(beta.encode()),
    'token_occurrences_before_extraction': occurrences,
    'inventory': inventory,
    'extracted': {
        'legacy_id': CSS_ID,
        'file': CSS_OUT.as_posix(),
        'bytes': len(css_body.encode()),
        'sha256': hashlib.sha256(css_body.encode()).hexdigest(),
        'classification': 'style_only',
    },
    'd2_owner_chain_preserved': True,
    'historical_js_removed': False,
    'historical_js_policy': 'v251/v260/v261 remain in place until their runtime/guard roles are proven replaceable',
    'gameplay_changed': False,
    'combat_math_changed': False,
    'rewards_changed': False,
    'server_authority_changed': False,
}
Path('V8009_DUNGEON_D3_BETA.json').write_text(
    json.dumps(report, ensure_ascii=False, indent=2) + '\n',
    encoding='utf-8',
)
print(json.dumps(report, ensure_ascii=False, indent=2))
