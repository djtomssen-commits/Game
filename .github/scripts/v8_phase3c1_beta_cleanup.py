from pathlib import Path
import hashlib,re,json

beta_path=Path('beta.html')
stable_path=Path('index.html')
beta=beta_path.read_text(encoding='utf-8')
stable=stable_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()

targets={
 'v436-guild-xp-reliability':'js/features/guild/legacy/16-v436-guild-xp-reliability.js',
 'v479-guildxp-limit-ui-script':'js/features/guild/legacy/21-v479-guildxp-limit-ui-script.js',
 'v555-guild-compact-final-js':'js/features/guild/legacy/29-v555-guild-compact-final-js.js',
}

changed=[]
for sid,src in targets.items():
    pat=re.compile(rf'<script(?P<attrs>[^>]*)\bid=["\']{re.escape(sid)}["\'](?P<rest>[^>]*)></script\s*>',re.I)
    matches=list(pat.finditer(beta))
    if len(matches)!=1:
        raise RuntimeError(f'{sid}: expected exactly one beta script tag, got {len(matches)}')
    tag=matches[0].group(0)
    if src not in tag:
        raise RuntimeError(f'{sid}: expected src {src} not found in tag: {tag[:300]}')
    newtag=re.sub(r'\s+src=["\']'+re.escape(src)+r'["\']','',tag,count=1,flags=re.I)
    beta=beta[:matches[0].start()]+newtag+beta[matches[0].end():]
    changed.append({'id':sid,'retired_src':src})

# beta-only diagnostic marker; stable/index remains byte-identical.
marker="<script id=\"v8008-beta-phase3c1-marker\">window.GROW_BETA_TECH_BUILD='V8.008-C1';</script>"
if 'v8008-beta-phase3c1-marker' not in beta:
    needle="<script>window.GROW_RELEASE_CHANNEL='beta';</script>"
    if needle not in beta:
        raise RuntimeError('beta release-channel marker not found')
    beta=beta.replace(needle,needle+"\n"+marker,1)

beta_path.write_text(beta,encoding='utf-8')

# Guard: stable must remain untouched.
stable_after=stable_path.read_text(encoding='utf-8')
stable_after_sha=hashlib.sha256(stable_after.encode('utf-8')).hexdigest()
if stable_after_sha!=stable_sha:
    raise RuntimeError('index.html changed during beta-only cleanup')

report={
 'build':'V8.008-C1-BETA',
 'phase':'3C1',
 'scope':'beta.html only',
 'removed_retired_network_loads':changed,
 'stable_unchanged':True,
 'V8_PHASE3C1_STABLE_SHA256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False,
}
Path('V8_PHASE3C1_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
