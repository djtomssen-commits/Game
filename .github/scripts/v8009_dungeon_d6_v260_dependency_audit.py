from pathlib import Path
import json, re

TARGET_JS='js/features/dungeon/beta/v8009-d4-v260-detail.js'
TARGET_CSS='css/features/dungeon/beta/v8009-d4-v260-detail.css'
needles=('v260RenderDetail','v260d-','v8009-d4-v260-detail.js','v8009-d4-v260-detail.css')

scan_paths=[Path('beta.html'),Path('index.html')]
scan_paths += sorted(Path('js').rglob('*.js'))
scan_paths += sorted(Path('css').rglob('*.css'))

results=[]
for p in scan_paths:
    if not p.exists(): continue
    txt=p.read_text(encoding='utf-8',errors='ignore')
    hits={}
    for n in needles:
        cnt=txt.count(n)
        if cnt: hits[n]=cnt
    if hits:
        lines=txt.splitlines()
        snippets=[]
        for i,line in enumerate(lines):
            if any(n in line for n in needles):
                snippets.append({'line':i+1,'text':line[:1000]})
        results.append({'path':p.as_posix(),'hits':hits,'snippets':snippets[:80]})

allowed_self={TARGET_JS,TARGET_CSS}
external_runtime=[]
for r in results:
    p=r['path']
    if p in allowed_self: continue
    if p=='beta.html':
        # Expected active include references are reported separately.
        continue
    # index.html counts as external/stable dependency; any v260 runtime/class hit matters.
    if 'v260RenderDetail' in r['hits'] or 'v260d-' in r['hits']:
        external_runtime.append(r)

beta=Path('beta.html').read_text(encoding='utf-8')
stable=Path('index.html').read_text(encoding='utf-8')
report={
  'build':'V8.009-DUNGEON-D6-V260-DEPENDENCY-AUDIT',
  'beta_js_include_count':beta.count(TARGET_JS),
  'beta_css_include_count':beta.count(TARGET_CSS),
  'stable_js_include_count':stable.count(TARGET_JS),
  'stable_css_include_count':stable.count(TARGET_CSS),
  'external_runtime_dependencies':external_runtime,
  'all_hits':results,
  'safe_to_unload_beta':(
      beta.count(TARGET_JS)==1 and
      beta.count(TARGET_CSS)==1 and
      stable.count(TARGET_JS)==0 and
      stable.count(TARGET_CSS)==0 and
      len(external_runtime)==0
  )
}
Path('V8009_DUNGEON_D6_V260_DEPENDENCY_AUDIT.json').write_text(
    json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'
)
print(json.dumps(report,ensure_ascii=False,indent=2))
