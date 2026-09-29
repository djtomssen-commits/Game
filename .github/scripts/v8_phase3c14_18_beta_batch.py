from pathlib import Path
import hashlib,re,json

stable_path=Path('index.html')
beta_path=Path('beta.html')
screen_old=Path('js/features/guild/beta/v8008-c9-guildboss-screen-owner.js')
pre_old=Path('js/features/guild/beta/v8008-c8-guildboss-pre-replay-visual-owner.js')
post_old=Path('js/features/guild/beta/v8008-c8-guildboss-post-replay-arena-owner.js')
replay_old=Path('js/features/guild/beta/v8008-c13-guildboss-replay-owner.js')
signup_old=Path('js/features/guild/v7307-guildboss-signup-owner.js')

stable=stable_path.read_text(encoding='utf-8')
beta=beta_path.read_text(encoding='utf-8')
stable_sha=hashlib.sha256(stable.encode()).hexdigest()
beta_before_sha=hashlib.sha256(beta.encode()).hexdigest()

for p in (screen_old,pre_old,post_old,replay_old,signup_old):
    if not p.exists():
        raise RuntimeError(f'missing {p}')

screen=screen_old.read_text(encoding='utf-8').rstrip()
pre=pre_old.read_text(encoding='utf-8').strip()
post=post_old.read_text(encoding='utf-8').strip()
replay=replay_old.read_text(encoding='utf-8').rstrip()
signup=signup_old.read_text(encoding='utf-8').strip()

# C14/C15: one screen/visual owner. Pre/post blocks remain deferred and execute
# at their exact historical script positions.
screen_out=Path('js/features/guild/beta/v8008-c18-guildboss-screen-visual-owner.js')
screen_out.write_text(screen+f"""

/* V8.008-C18 — deferred visual installers; execution positions stay unchanged. */
window.v8008C18InstallPreVisual=function(){{
  if(window.__V8008_C18_PRE_VISUAL__)return;
  window.__V8008_C18_PRE_VISUAL__=true;
{pre}
}};
window.v8008C18InstallPostArena=function(){{
  if(window.__V8008_C18_POST_ARENA__)return;
  window.__V8008_C18_POST_ARENA__=true;
{post}
}};
""",encoding='utf-8')

# C16: keep the final replay owner, but absorb the late V7.307 signup owner as
# a deferred installer invoked at the original V7.307 marker.
replay_out=Path('js/features/guild/beta/v8008-c18-guildboss-replay-owner.js')
replay_out.write_text(replay+f"""

/* V8.008-C18 — deferred authoritative signup owner. */
window.v8008C18InstallSignup=function(){{
  if(window.__V8008_C18_SIGNUP_INSTALLER__)return;
  window.__V8008_C18_SIGNUP_INSTALLER__=true;
{signup}
}};
""",encoding='utf-8')

def replace_src(html,sid,old_src,new_src):
    if f'id="{sid}"' not in html and f"id='{sid}'" not in html:
        raise RuntimeError(f'{sid}: marker missing')
    n=html.count(old_src)
    if n!=1:
        raise RuntimeError(f'{sid}: expected old source once, got {n}')
    return html.replace(old_src,new_src,1)

def replace_tag_with_call(html,sid,old_src,call):
    pats=[
      re.compile(rf'<script[^>]*id="{re.escape(sid)}"[^>]*></script\s*>',re.I),
      re.compile(rf"<script[^>]*id='{re.escape(sid)}'[^>]*></script\s*>",re.I)
    ]
    matches=[]
    for pat in pats:
        matches+=list(pat.finditer(html))
    if len(matches)!=1:
        raise RuntimeError(f'{sid}: expected one script tag, got {len(matches)}')
    m=matches[0];tag=m.group(0)
    if old_src not in tag:
        raise RuntimeError(f'{sid}: expected src missing')
    newtag=f'<script id="{sid}">{call}</script>'
    return html[:m.start()]+newtag+html[m.end():]

beta=replace_src(beta,'v414-guild-boss-longterm',screen_old.as_posix(),screen_out.as_posix())
beta=replace_tag_with_call(beta,'v6203-guild-boss-live-polish-script',pre_old.as_posix(),'window.v8008C18InstallPreVisual?.();')
beta=replace_tag_with_call(beta,'v6309-guildboss-final-arena-script',post_old.as_posix(),'window.v8008C18InstallPostArena?.();')
beta=replace_src(beta,'v6307-guildboss-multiexchange-script',replay_old.as_posix(),replay_out.as_posix())
beta=replace_tag_with_call(beta,'v7307-guildboss-signup-owner',signup_old.as_posix(),'window.v8008C18InstallSignup?.();')

# C17: remove dead empty compatibility script tags after proving no runtime file
# references their DOM ids. These have no src/body on beta after earlier phases.
dead_ids=[
 'v6305-guildboss-layout-script',
 'v6315-guildboss-legacy-cleanup-script',
 'v6319-guildboss-smooth-owner-script',
 'v6321-guildboss-combat-animation-script',
 'v6208-guild-boss-mobile-performance-js',
 'v6209-guildboss-replay-performance-script',
 'v6310-guildboss-test-removal-guard'
]
removed=[]
runtime_ext={'.js','.mjs','.cjs','.html'}
for sid in dead_ids:
    refs=[]
    for p in Path('.').rglob('*'):
        if not p.is_file() or p.suffix.lower() not in runtime_ext:
            continue
        rel=p.as_posix()
        if rel=='beta.html' or rel.startswith('.github/'):
            continue
        try:s=p.read_text(encoding='utf-8',errors='ignore')
        except Exception:continue
        if sid in s:
            refs.append(rel)
    if refs:
        raise RuntimeError(f'{sid}: referenced outside beta HTML: {refs[:20]}')
    pats=[
      re.compile(rf'<script[^>]*id="{re.escape(sid)}"[^>]*>\s*</script\s*>\s*',re.I),
      re.compile(rf"<script[^>]*id='{re.escape(sid)}'[^>]*>\s*</script\s*>\s*",re.I)
    ]
    found=[]
    for pat in pats: found+=list(pat.finditer(beta))
    if len(found)!=1:
        raise RuntimeError(f'{sid}: expected one empty beta marker, got {len(found)}')
    m=found[0]
    beta=beta[:m.start()]+beta[m.end():]
    removed.append(sid)

# C18: advance one beta technical marker for the whole batch.
beta=beta.replace("window.GROW_BETA_TECH_BUILD='V8.008-C13'","window.GROW_BETA_TECH_BUILD='V8.008-C18'",1)
if "V8.008-C18" not in beta:
    raise RuntimeError('beta C18 marker not installed')

beta_path.write_text(beta,encoding='utf-8')
if hashlib.sha256(stable_path.read_text(encoding='utf-8').encode()).hexdigest()!=stable_sha:
    raise RuntimeError('index.html changed during beta-only C14-18 batch')

report={
 'build':'V8.008-C18-BETA',
 'phase':'3C14-18 batch',
 'scope':'beta only',
 'screen_visual_owner':screen_out.as_posix(),
 'replay_signup_owner':replay_out.as_posix(),
 'merged_external_loads':[
   pre_old.as_posix(),post_old.as_posix(),signup_old.as_posix()
 ],
 'late_execution_preserved':{
   'pre_visual':'v6203 original marker',
   'post_arena':'v6309 original marker',
   'signup':'v7307 original marker'
 },
 'removed_empty_markers':removed,
 'stable_unchanged':True,
 'stable_sha256':stable_sha,
 'beta_before_sha256':beta_before_sha,
 'beta_after_sha256':hashlib.sha256(beta.encode()).hexdigest(),
 'server_authority_changed':False,
 'gameplay_changed':False
}
Path('V8_PHASE3C14_18_BETA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
