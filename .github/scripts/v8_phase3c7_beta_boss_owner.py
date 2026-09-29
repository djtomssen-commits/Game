from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()

parts=[
 ('v6307-guildboss-multiexchange-script','js/features/guild/legacy/40-v6307-guildboss-multiexchange-script.js'),
 ('v6319-guildboss-smooth-owner-script','js/features/guild/legacy/43-v6319-guildboss-smooth-owner-script.js'),
 ('v6321-guildboss-combat-animation-script','js/features/guild/legacy/44-v6321-guildboss-combat-animation-script.js'),
 ('v6208-guild-boss-mobile-performance-js','js/features/guild/legacy/46-v6208-guild-boss-mobile-performance-js.js'),
 ('v6209-guildboss-replay-performance-script','js/features/guild/legacy/47-v6209-guildboss-replay-performance-script.js'),
]

contents=[]
for sid,src in parts:
    p=Path(src)
    if not p.exists(): raise RuntimeError(f'missing source {src}')
    s=p.read_text(encoding='utf-8')
    if not s.strip(): raise RuntimeError(f'empty source {src}')
    contents.append(f"/* === V8.008-C7 merged source: {sid} === */\n{s.strip()}\n")

out=Path('js/features/guild/beta/v8008-c7-guildboss-replay-owner.js')
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(
  "/* V8.008-C7 BETA — single replay owner bundle.\n"
  "   Exact proven replay/performance blocks, preserved in dependency order. */\n"
  + "\n".join(contents),
  encoding='utf-8'
)

owner_sid,owner_old=parts[0]
owner_new=out.as_posix()
pat=re.compile(rf'<script[^>]*\bid=["\']{re.escape(owner_sid)}["\'][^>]*></script\s*>',re.I)
ms=list(pat.finditer(beta))
if len(ms)!=1: raise RuntimeError(f'expected one {owner_sid} tag, got {len(ms)}')
tag=ms[0].group(0)
if owner_old not in tag: raise RuntimeError(f'{owner_sid} source unexpected: {tag[:300]}')
beta=beta[:ms[0].start()]+tag.replace(owner_old,owner_new)+beta[ms[0].end():]

retired=[]
for sid,src in parts[1:]:
    pat=re.compile(rf'<script[^>]*\bid=["\']{re.escape(sid)}["\'][^>]*></script\s*>',re.I)
    ms=list(pat.finditer(beta))
    if len(ms)!=1: raise RuntimeError(f'expected one {sid} tag, got {len(ms)}')
    tag=ms[0].group(0)
    if src not in tag: raise RuntimeError(f'{sid} source unexpected: {tag[:300]}')
    newtag=re.sub(r'\s+src=["\']'+re.escape(src)+r'["\']','',tag,count=1,flags=re.I)
    beta=beta[:ms[0].start()]+newtag+beta[ms[0].end():]
    retired.append(src)

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C6'","window.GROW_BETA_TECH_BUILD='V8.008-C7'",1)
if "V8.008-C7" not in beta:
    raise RuntimeError('beta C7 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

stable_after=stable_path.read_text(encoding='utf-8')
if hashlib.sha256(stable_after.encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C7')

report={
 'build':'V8.008-C7-BETA',
 'phase':'3C7',
 'scope':'beta.html + beta-only guild boss replay owner',
 'owner':owner_new,
 'merged_blocks':[sid for sid,_ in parts],
 'retired_separate_loads':retired,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False,
}
Path('V8_PHASE3C7_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
