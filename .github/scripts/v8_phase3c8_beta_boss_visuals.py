from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode('utf-8')).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode('utf-8')).hexdigest()

pre=[
 ('v6203-guild-boss-live-polish-script','js/features/guild/legacy/38-v6203-guild-boss-live-polish-script.js'),
 ('v6305-guildboss-layout-script','js/features/guild/legacy/39-v6305-guildboss-layout-script.js'),
]
post=[
 ('v6309-guildboss-final-arena-script','js/features/guild/legacy/41-v6309-guildboss-final-arena-script.js'),
 ('v6315-guildboss-legacy-cleanup-script','js/features/guild/legacy/42-v6315-guildboss-legacy-cleanup-script.js'),
]

def write_bundle(path, label, items):
    chunks=[f"/* {label} */\n"]
    for sid,src in items:
        p=Path(src)
        if not p.exists(): raise RuntimeError(f'missing {src}')
        s=p.read_text(encoding='utf-8')
        if not s.strip(): raise RuntimeError(f'empty {src}')
        chunks.append(f"/* === V8.008-C8 merged source: {sid} === */\n{s.strip()}\n")
    Path(path).parent.mkdir(parents=True,exist_ok=True)
    Path(path).write_text("\n".join(chunks),encoding='utf-8')

pre_out='js/features/guild/beta/v8008-c8-guildboss-pre-replay-visual-owner.js'
post_out='js/features/guild/beta/v8008-c8-guildboss-post-replay-arena-owner.js'
write_bundle(pre_out,'V8.008-C8 BETA — boss visual owner before replay owner.',pre)
write_bundle(post_out,'V8.008-C8 BETA — boss final arena/cleanup owner after replay owner.',post)

def swap_owner(html, sid, old_src, new_src):
    pat=re.compile(rf'<script[^>]*\bid=["\']{re.escape(sid)}["\'][^>]*></script\s*>',re.I)
    ms=list(pat.finditer(html))
    if len(ms)!=1: raise RuntimeError(f'{sid}: expected one tag, got {len(ms)}')
    tag=ms[0].group(0)
    if old_src not in tag: raise RuntimeError(f'{sid}: unexpected src')
    return html[:ms[0].start()]+tag.replace(old_src,new_src)+html[ms[0].end():]

def retire(html, sid, src):
    pat=re.compile(rf'<script[^>]*\bid=["\']{re.escape(sid)}["\'][^>]*></script\s*>',re.I)
    ms=list(pat.finditer(html))
    if len(ms)!=1: raise RuntimeError(f'{sid}: expected one tag, got {len(ms)}')
    tag=ms[0].group(0)
    if src not in tag: raise RuntimeError(f'{sid}: unexpected src')
    newtag=re.sub(r'\s+src=["\']'+re.escape(src)+r'["\']','',tag,count=1,flags=re.I)
    return html[:ms[0].start()]+newtag+html[ms[0].end():]

beta=swap_owner(beta,pre[0][0],pre[0][1],pre_out)
beta=retire(beta,pre[1][0],pre[1][1])
beta=swap_owner(beta,post[0][0],post[0][1],post_out)
beta=retire(beta,post[1][0],post[1][1])

beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C7'","window.GROW_BETA_TECH_BUILD='V8.008-C8'",1)
if "V8.008-C8" not in beta: raise RuntimeError('beta C8 marker not installed')
beta_path.write_text(beta,encoding='utf-8')

if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode('utf-8')).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C8')

report={
 'build':'V8.008-C8-BETA',
 'phase':'3C8',
 'scope':'beta.html + two beta-only visual owner bundles',
 'pre_replay_owner':pre_out,
 'pre_replay_merged':[x[0] for x in pre],
 'post_replay_owner':post_out,
 'post_replay_merged':[x[0] for x in post],
 'execution_order_preserved':'pre visual owner -> C7 replay owner -> post arena owner',
 'retired_separate_loads':[pre[1][1],post[1][1]],
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode('utf-8')).hexdigest(),
 'gameplay_changed':False,
 'server_authority_changed':False,
}
Path('V8_PHASE3C8_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
