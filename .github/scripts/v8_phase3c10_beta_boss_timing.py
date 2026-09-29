from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
legacy=Path('js/features/guild/legacy/03-v259-guild-boss-animation-core.js')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()

source=legacy.read_text(encoding='utf-8')
for token in ('const v259Sleep','function v259SetBossHp','function v259AnimateBossResult'):
    if token not in source:
        raise RuntimeError(f'legacy v259 source missing {token}')

# Prove the two retired test-animation APIs are not consumed by runtime code
# anywhere else. v259Sleep remains because current boss + war replay use it.
retired=['v259SetBossHp','v259AnimateBossResult']
refs={}
for token in retired:
    hits=[]
    for p in Path('.').rglob('*'):
        if not p.is_file() or p.suffix.lower() not in {'.html','.js','.mjs','.cjs'}:
            continue
        rel=p.as_posix()
        if rel==legacy.as_posix() or rel.startswith('.github/'):
            continue
        try:s=p.read_text(encoding='utf-8',errors='ignore')
        except Exception:continue
        if token in s:hits.append(rel)
    refs[token]=sorted(set(hits))
    if hits:
        raise RuntimeError(f'{token} still referenced outside legacy owner: {hits[:20]}')

out=Path('js/features/guild/beta/v8008-c10-guildboss-timing.js')
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text("""/* V8.008-C10 BETA — shared guild combat timing utility.
   The old V2.59 test-boss renderer is retired. Current Gildenboss and
   Gildenkrieg replay owners only require v259Sleep. */
const v259Sleep=ms=>new Promise(r=>setTimeout(r,ms));
""",encoding='utf-8')

sid='v259-guild-boss-animation-core'
old=legacy.as_posix()
new=out.as_posix()
pat=re.compile(rf'<script[^>]*\bid=["\']{re.escape(sid)}["\'][^>]*></script\s*>',re.I)
ms=list(pat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'{sid}: expected one beta tag, got {len(ms)}')
tag=ms[0].group(0)
if old not in tag: raise RuntimeError(f'{sid}: unexpected beta source')
beta=beta[:ms[0].start()]+tag.replace(old,new)+beta[ms[0].end():]

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C9'","window.GROW_BETA_TECH_BUILD='V8.008-C10'",1)
if "V8.008-C10" not in beta: raise RuntimeError('beta C10 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C10')

report={
 'build':'V8.008-C10-BETA',
 'phase':'3C10',
 'scope':'beta.html + beta timing utility',
 'replacement':new,
 'retired_code':['v259SetBossHp','v259AnimateBossResult'],
 'kept_api':['v259Sleep'],
 'reference_proof':refs,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False,
}
Path('V8_PHASE3C10_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
