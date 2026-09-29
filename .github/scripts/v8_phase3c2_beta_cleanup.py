from pathlib import Path
import hashlib,re,json

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()

candidates=[
 {
  'id':'v6119-guild-online-marker',
  'src':'js/features/guild/legacy/35-v6119-guild-online-marker--v6120-guild-performance-sort-marker.js',
  'globals':['__V6119_GUILD_ONLINE_MOBILE_FIX__','__V6120_GUILD_PERFORMANCE_SORT__'],
 },
 {
  'id':'v6207-guild-scroll-safe-js',
  'src':'js/features/guild/legacy/45-v6207-guild-scroll-safe-js.js',
  'globals':['__V6207_GUILD_SCROLL_SAFE_FIX__'],
 },
]

# Prove marker globals are not consumed anywhere else in runtime code.
text_ext={'.html','.js','.mjs','.cjs','.css'}
root=Path('.')
refs={}
for cand in candidates:
    for glob in cand['globals']:
        hits=[]
        for p in root.rglob('*'):
            if not p.is_file() or p.suffix.lower() not in text_ext:
                continue
            rel=p.as_posix()
            if rel==cand['src'] or rel.startswith('.github/'):
                continue
            try:
                s=p.read_text(encoding='utf-8',errors='ignore')
            except Exception:
                continue
            if glob in s:
                hits.append(rel)
        refs[glob]=sorted(set(hits))
        if hits:
            raise RuntimeError(f'{glob} is still referenced outside its marker bundle: {hits[:10]}')

removed=[]
for cand in candidates:
    sid,src=cand['id'],cand['src']
    pat=re.compile(rf'<script(?P<attrs>[^>]*)\bid=["\']{re.escape(sid)}["\'](?P<rest>[^>]*)></script\s*>',re.I)
    ms=list(pat.finditer(beta))
    if len(ms)!=1:
        raise RuntimeError(f'{sid}: expected one beta script tag, got {len(ms)}')
    tag=ms[0].group(0)
    if src not in tag:
        raise RuntimeError(f'{sid}: expected source {src} not present')
    newtag=re.sub(r'\s+src=["\']'+re.escape(src)+r'["\']','',tag,count=1,flags=re.I)
    beta=beta[:ms[0].start()]+newtag+beta[ms[0].end():]
    removed.append({'id':sid,'retired_src':src,'unused_globals':cand['globals']})

# Advance beta-only technical marker.
beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C1'","window.GROW_BETA_TECH_BUILD='V8.008-C2'",1)
if "V8.008-C2" not in beta:
    raise RuntimeError('beta technical marker not found/updated')

beta_path.write_text(beta,encoding='utf-8')

stable_after=stable_path.read_text(encoding='utf-8')
stable_after_sha=hashlib.sha256(stable_after.encode('utf-8')).hexdigest()
if stable_after_sha!=stable_sha:
    raise RuntimeError('index.html changed during beta-only cleanup')

report={
 'build':'V8.008-C2-BETA',
 'phase':'3C2',
 'scope':'beta.html only',
 'removed_dead_marker_loads':removed,
 'reference_proof':refs,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False,
}
Path('V8_PHASE3C2_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
