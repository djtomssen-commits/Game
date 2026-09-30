from pathlib import Path
import json,re

terms=('cloudflare','wrangler','workers.dev','gamenew','deploy','publish','beta.html')
hits=[]
skip={'.git','node_modules','dist','build'}
for p in Path('.').rglob('*'):
    if not p.is_file(): continue
    if any(part in skip for part in p.parts): continue
    if p.stat().st_size>2_000_000: continue
    if p.suffix.lower() not in ('.yml','.yaml','.json','.js','.ts','.mjs','.cjs','.py','.md','.txt','.toml','.ini','.sh','.html'):
        continue
    try: txt=p.read_text(encoding='utf-8',errors='ignore')
    except: continue
    low=txt.lower()
    if not any(t in low for t in terms): continue
    contexts=[]
    for i,line in enumerate(txt.splitlines()):
        ll=line.lower()
        if any(t in ll for t in terms):
            contexts.append({'line':i+1,'text':line.strip()[:1800]})
    if contexts:
        hits.append({'path':p.as_posix(),'contexts':contexts[:120]})

out={'build':'V8.009-DEPLOY-PATH-AUDIT','hits':hits}
Path('V8009_DEPLOY_PATH_AUDIT.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(hits,ensure_ascii=False,indent=2))
