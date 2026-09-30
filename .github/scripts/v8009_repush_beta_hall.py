from pathlib import Path
import re,hashlib,json

beta_path=Path('beta.html')
hall_path=Path('js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js')
stable_path=Path('index.html')

beta=beta_path.read_text(encoding='utf-8',errors='ignore')
hall=hall_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8',errors='ignore')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()

# Re-push marker only: no behavior change.
marker='<!-- V8.009 BETA HALL REPUSH 2026-09-30 -->'
beta=re.sub(r'<!-- V8\.009 BETA HALL REPUSH[^>]*-->',marker,beta)
if marker not in beta:
    pos=beta.lower().find('</body>')
    beta=(beta[:pos]+marker+'\n'+beta[pos:]) if pos>=0 else beta+'\n'+marker+'\n'

# Same canonical file, fresh cache version.
beta=re.sub(
    r'js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js\.js(?:\?v=[^"\']+)?',
    'js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js?v=8009-top3-owner3',
    beta
)

# Touch canonical Hall owner without changing runtime behavior.
hall=re.sub(r'^/\* V8\.009 BETA HALL REPUSH[^\n]*\*/\n','',hall)
hall='/* V8.009 BETA HALL REPUSH 2026-09-30 — canonical owner unchanged */\n'+hall

for required in (
    'v6145-podium-portrait',
    'v8009-s1-v6145-hall-pagination-js.js?v=8009-top3-owner3',
):
    if required not in beta and required not in hall:
        raise RuntimeError('required current Hall fix missing: '+required)

if 'function podiumAvatar(p)' not in hall:
    raise RuntimeError('canonical Top3 owner missing from v6145')

beta_path.write_text(beta,encoding='utf-8')
hall_path.write_text(hall,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8',errors='ignore').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('Stable/index.html changed')

report={
  'build':'V8.009-BETA-HALL-REPUSH',
  'scope':'beta only',
  'stable_unchanged':True,
  'runtime_logic_changed':False,
  'cache_version':'8009-top3-owner3',
  'files':['beta.html','js/features/pvp/beta/v8009-s1-v6145-hall-pagination-js.js']
}
Path('V8009_BETA_HALL_REPUSH.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
