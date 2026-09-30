from pathlib import Path
import re, json, hashlib

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
before_sha=hashlib.sha256(beta.encode()).hexdigest()

sid='v244-dungeon-detail-map-final'
script_re=re.compile(
    r'(<script[^>]*\bid=["\']'+re.escape(sid)+r'["\'][^>]*>)(?P<body>[\s\S]*?)(</script\s*>)',
    re.I
)
m=script_re.search(beta)
if not m:
    raise RuntimeError('v244 script block not found')
body=m.group('body')

pat=re.compile(
    r'/\*\s*Repaint the currently open detail map if necessary\.\s*\*/\s*'
    r'setTimeout\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?v244RenderSelectedDungeonMap\s*\(\s*\)\s*;?[\s\S]*?\}\s*,\s*520\s*\)\s*;?',
    re.I
)
hits=list(pat.finditer(body))
if len(hits)!=1:
    raise RuntimeError(f'expected one v244 delayed repaint, got {len(hits)}')

replacement='''/* V8.009 D5: delayed 520 ms detail repaint retired.\n   The canonical D2/v261 owner renders the active 10er map; a later v244\n   repaint can replace the correct background/enemy art with legacy DOM. */'''
new_body=body[:hits[0].start()]+replacement+body[hits[0].end():]
beta=beta[:m.start('body')]+new_body+beta[m.end('body'):]

if 'v244RenderSelectedDungeonMap();' not in body:
    raise RuntimeError('unexpected v244 body shape')
if pat.search(new_body):
    raise RuntimeError('v244 delayed repaint still present')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed')

report={
  'build':'V8.009-DUNGEON-D5-DELAYED-REPAINT-RETIRE',
  'scope':'beta only',
  'stable_unchanged':True,
  'beta_before_sha256':before_sha,
  'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
  'retired':[
    {'owner':'v251-modern-dungeon-maps-core','delay_ms':1350,'location':'external file','commit':'07c4e371444fba487da6300394533a26a3c090a8'},
    {'owner':'v244-dungeon-detail-map-final','delay_ms':520,'location':'beta.html'}
  ],
  'gameplay_changed':False,
  'combat_math_changed':False,
  'rewards_changed':False,
  'server_authority_changed':False
}
Path('V8009_DUNGEON_D5_DELAYED_REPAINT_RETIRE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
