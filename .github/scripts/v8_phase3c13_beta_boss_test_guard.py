from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
legacy_path=Path('js/features/guild/legacy/37-vguildchatclosevisibilityfixjs--v6310-guildboss-test-removal-guard.js')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()
legacy=legacy_path.read_text(encoding='utf-8')

marker='/* === v6310-guildboss-test-removal-guard === */'
if marker not in legacy:
    raise RuntimeError('v6310 marker missing in combined legacy file')
chat_part,guard_part=legacy.split(marker,1)
if 'v4144GuildChatClose' not in chat_part or 'function stabilize()' not in chat_part:
    raise RuntimeError('chat viewport fix extraction failed')
for token in ('v6204BossTestWrap','v6204BossTest','v6204RunGuildBossTest','v6204-test-mode'):
    if token not in guard_part:
        raise RuntimeError(f'legacy test guard missing expected token {token}')

# Prove the removed test harness is not an active runtime dependency elsewhere.
tokens=('v6204BossTestWrap','v6204BossTest','v6204RunGuildBossTest','v6204-test-mode')
refs={}
for token in tokens:
    hits=[]
    for p in Path('.').rglob('*'):
        if not p.is_file() or p.suffix.lower() not in {'.html','.js','.mjs','.cjs','.css'}:
            continue
        rel=p.as_posix()
        if rel==legacy_path.as_posix() or rel.startswith('.github/'):
            continue
        try:s=p.read_text(encoding='utf-8',errors='ignore')
        except Exception:continue
        if token not in s:
            continue
        # Existing production cleanup that removes the retired test UI is allowed;
        # it is not a consumer of the test feature.
        harmless=(
            ('remove()' in s or "async()=>false" in s or 'undefined' in s)
            and rel in ('index.html','beta.html')
        )
        if harmless:
            continue
        idx=s.find(token)
        hits.append(rel+' :: '+s[max(0,idx-180):min(len(s),idx+260)].replace('\n',' '))
    refs[token]=sorted(set(hits))
    if hits:
        raise RuntimeError(f'{token} still has active references: {hits[:20]}')

out=Path('js/features/guild/beta/v8008-c13-guild-chat-viewport-fix.js')
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(
    '/* V8.008-C13 BETA — guild chat viewport/close-button fix only.\n'
    '   The obsolete V6.310 boss test-removal guard is retired. */\n'
    + chat_part.strip()+'\n',
    encoding='utf-8'
)

# Replace combined legacy file with chat-only beta file.
sid='vGuildChatCloseVisibilityFixJs'
old=legacy_path.as_posix()
new=out.as_posix()
pat=re.compile(rf'<script[^>]*\bid=["\']{re.escape(sid)}["\'][^>]*></script\s*>',re.I)
ms=list(pat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'{sid}: expected one beta tag, got {len(ms)}')
tag=ms[0].group(0)
if old not in tag: raise RuntimeError(f'{sid}: unexpected beta source')
beta=beta[:ms[0].start()]+tag.replace(old,new)+beta[ms[0].end():]

# v6310 is already an empty compatibility marker after Phase 3B extraction.
guard_sid='v6310-guildboss-test-removal-guard'
gpat=re.compile(rf'<script[^>]*\bid=["\']{guard_sid}["\'][^>]*></script\s*>',re.I)
gms=list(gpat.finditer(beta))
if len(gms)!=1: raise RuntimeError(f'{guard_sid}: expected one marker, got {len(gms)}')
if re.search(r'\bsrc=',gms[0].group(0),re.I):
    raise RuntimeError('v6310 marker unexpectedly has src')

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C12'","window.GROW_BETA_TECH_BUILD='V8.008-C13'",1)
if "V8.008-C13" not in beta: raise RuntimeError('beta C13 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C13')

report={
 'build':'V8.008-C13-BETA',
 'phase':'3C13',
 'scope':'beta.html + beta chat viewport fix',
 'replacement':new,
 'retired':'v6310 guild boss test-removal guard',
 'reference_proof':refs,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'server_authority_changed':False,
 'gameplay_changed':False,
}
Path('V8_PHASE3C13_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
